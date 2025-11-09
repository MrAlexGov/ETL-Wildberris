from datetime import date, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.models import User, Product, Sale, Stock, AggregatedMetrics
from app.schemas import (
    ProfitabilityItem,
    ToRemoveItem,
    StockForecastItem,
    SlowMovingItem,
    ABCItem,
)

router = APIRouter()


async def get_current_user(authorization: str | None, db: AsyncSession) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing credentials")
    token = authorization.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user_id = int(payload["sub"])
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


@router.get("/profitability", response_model=List[ProfitabilityItem])
async def get_profitability(
    authorization: str | None = None,
    db: AsyncSession = Depends(get_db),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
):
    user = await get_current_user(authorization, db)
    if date_to is None:
        date_to = date.today()
    if date_from is None:
        date_from = date_to - timedelta(days=30)

    stmt = (
        select(
            Product.id,
            Product.supplier_article,
            Product.name,
            func.sum(Sale.revenue),
            func.sum(Sale.commission),
            func.sum(Sale.logistics_cost),
        )
        .join(Sale, Sale.product_id == Product.id)
        .where(
            Product.user_id == user.id,
            Sale.user_id == user.id,
            Sale.date >= date_from,
            Sale.date <= date_to,
        )
        .group_by(Product.id, Product.supplier_article, Product.name)
    )
    result = await db.execute(stmt)
    items: list[ProfitabilityItem] = []
    for pid, article, name, revenue, commission, logistics in result.all():
        # Для MVP считаем себестоимость 0 (поддержка загрузки — отдельный эндпоинт)
        cost = 0.0
        profit = (revenue or 0) - cost - (commission or 0) - (logistics or 0)
        margin = (profit / revenue * 100) if revenue else 0.0
        items.append(
            ProfitabilityItem(
                product_id=pid,
                supplier_article=article,
                name=name,
                revenue=float(revenue or 0),
                cost=float(cost),
                commission=float(commission or 0),
                logistics=float(logistics or 0),
                profit=float(profit),
                margin=float(margin),
            )
        )
    items.sort(key=lambda x: x.profit, reverse=True)
    return items


@router.get("/to-remove", response_model=List[ToRemoveItem])
async def get_to_remove(
    authorization: str | None = None,
    db: AsyncSession = Depends(get_db),
    days: int = Query(30, ge=7, le=120),
):
    user = await get_current_user(authorization, db)
    boundary = date.today() - timedelta(days=days)

    stmt = (
        select(
            Product.id,
            Product.supplier_article,
            Product.name,
            func.max(Sale.date),
            func.sum(Sale.revenue - Sale.commission - Sale.logistics_cost),
        )
        .join(Sale, Sale.product_id == Product.id, isouter=True)
        .where(Product.user_id == user.id)
        .group_by(Product.id, Product.supplier_article, Product.name)
    )

    result = await db.execute(stmt)
    items: list[ToRemoveItem] = []
    for pid, article, name, last_sale_date, profit in result.all():
        last_sale_date = last_sale_date
        profit = float(profit or 0.0)
        reason_parts = []
        if not last_sale_date or last_sale_date < boundary:
            reason_parts.append(f"нет продаж > {days} дней")
        if profit <= 0:
            reason_parts.append("отрицательная прибыль")
        if reason_parts:
            days_since = (date.today() - last_sale_date).days if last_sale_date else None
            items.append(
                ToRemoveItem(
                    product_id=pid,
                    supplier_article=article,
                    name=name,
                    reason=", ".join(reason_parts),
                    last_sale_date=last_sale_date,
                    profit=profit,
                    turnover_days=days_since,
                )
            )
    return items


@router.get("/stocks", response_model=List[StockForecastItem])
async def get_stocks_forecast(
    authorization: str | None = None,
    db: AsyncSession = Depends(get_db),
    horizon_days: int = Query(14, ge=3, le=60),
):
    user = await get_current_user(authorization, db)
    end_date = date.today()
    start_date = end_date - timedelta(days=30)

    sales_stmt = (
        select(
            Sale.product_id,
            func.sum(Sale.quantity).label("qty"),
        )
        .where(
            Sale.user_id == user.id,
            Sale.date >= start_date,
            Sale.date <= end_date,
        )
        .group_by(Sale.product_id)
    )
    sales_result = await db.execute(sales_stmt)
    avg_sales = {row.product_id: row.qty / 30.0 for row in sales_result}

    stock_stmt = (
        select(
            Product.id,
            Product.supplier_article,
            Product.name,
            func.sum(Stock.quantity),
        )
        .join(Stock, Stock.product_id == Product.id)
        .where(
            Product.user_id == user.id,
        )
        .group_by(Product.id, Product.supplier_article, Product.name)
    )
    stock_result = await db.execute(stock_stmt)

    items: list[StockForecastItem] = []
    for pid, article, name, qty in stock_result.all():
        qty = int(qty or 0)
        daily = float(avg_sales.get(pid, 0.0))
        days_left = (qty / daily) if daily > 0 else None
        if days_left is not None and days_left <= horizon_days:
            items.append(
                StockForecastItem(
                    product_id=pid,
                    supplier_article=article,
                    name=name,
                    stock_qty=qty,
                    avg_daily_sales=daily,
                    days_left=days_left,
                )
            )
    return items


@router.get("/slow-moving", response_model=List[SlowMovingItem])
async def get_slow_moving(
    authorization: str | None = None,
    db: AsyncSession = Depends(get_db),
    threshold_days: int = Query(60, ge=30, le=365),
):
    user = await get_current_user(authorization, db)
    boundary = date.today() - timedelta(days=threshold_days)

    stmt = (
        select(
            Product.id,
            Product.supplier_article,
            Product.name,
            func.max(Sale.date),
        )
        .join(Sale, Sale.product_id == Product.id, isouter=True)
        .where(Product.user_id == user.id)
        .group_by(Product.id, Product.supplier_article, Product.name)
    )
    result = await db.execute(stmt)

    items: list[SlowMovingItem] = []
    for pid, article, name, last_sale_date in result.all():
        if not last_sale_date or last_sale_date < boundary:
            days_since = (date.today() - last_sale_date).days if last_sale_date else None
            items.append(
                SlowMovingItem(
                    product_id=pid,
                    supplier_article=article,
                    name=name,
                    last_sale_date=last_sale_date,
                    days_since_last_sale=days_since,
                )
            )
    return items


@router.get("/abc", response_model=List[ABCItem])
async def get_abc(
    authorization: str | None = None,
    db: AsyncSession = Depends(get_db),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
):
    user = await get_current_user(authorization, db)
    if date_to is None:
        date_to = date.today()
    if date_from is None:
        date_from = date_to - timedelta(days=30)

    stmt = (
        select(
            Product.id,
            Product.supplier_article,
            Product.name,
            func.sum(Sale.revenue).label("revenue"),
        )
        .join(Sale, Sale.product_id == Product.id)
        .where(
            Product.user_id == user.id,
            Sale.user_id == user.id,
            Sale.date >= date_from,
            Sale.date <= date_to,
        )
        .group_by(Product.id, Product.supplier_article, Product.name)
        .order_by(func.sum(Sale.revenue).desc())
    )
    result = await db.execute(stmt)
    rows = result.all()
    total_revenue = sum(float(r.revenue or 0) for r in rows) or 1.0

    items: list[ABCItem] = []
    cumulative_share = 0.0
    for pid, article, name, revenue in rows:
        revenue = float(revenue or 0.0)
        share = revenue / total_revenue * 100
        cumulative_share += share
        if cumulative_share <= 80:
            group = "A"
        elif cumulative_share <= 95:
            group = "B"
        else:
            group = "C"
        items.append(
            ABCItem(
                product_id=pid,
                supplier_article=article,
                name=name,
                revenue=revenue,
                share=share,
                group=group,
            )
        )
    return items