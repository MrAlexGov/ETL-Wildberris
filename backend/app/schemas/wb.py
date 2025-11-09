from datetime import date
from typing import Optional

from pydantic import BaseModel


class WBApiKeyCreate(BaseModel):
    name: str = "default"
    token: str


class WBApiKeyRead(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class SkuCostUploadItem(BaseModel):
    supplier_article: str
    cost: float


class ProfitabilityItem(BaseModel):
    product_id: int
    supplier_article: str
    name: str
    revenue: float
    cost: float
    commission: float
    logistics: float
    profit: float
    margin: float


class ToRemoveItem(BaseModel):
    product_id: int
    supplier_article: str
    name: str
    reason: str
    last_sale_date: Optional[date]
    profit: float
    turnover_days: Optional[float]


class StockForecastItem(BaseModel):
    product_id: int
    supplier_article: str
    name: str
    stock_qty: int
    avg_daily_sales: float
    days_left: Optional[float]


class SlowMovingItem(BaseModel):
    product_id: int
    supplier_article: str
    name: str
    last_sale_date: Optional[date]
    days_since_last_sale: Optional[int]


class ABCItem(BaseModel):
    product_id: int
    supplier_article: str
    name: str
    revenue: float
    share: float
    group: str