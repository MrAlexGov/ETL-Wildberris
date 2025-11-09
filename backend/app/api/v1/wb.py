from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.models import WBApiKey, User
from app.schemas import WBApiKeyCreate, WBApiKeyRead


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


@router.get("/keys", response_model=List[WBApiKeyRead])
async def list_keys(
    authorization: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    user = await get_current_user(authorization, db)
    result = await db.execute(select(WBApiKey).where(WBApiKey.user_id == user.id))
    keys = result.scalars().all()
    return [WBApiKeyRead.model_validate(k) for k in keys]


@router.post("/keys", response_model=WBApiKeyRead, status_code=status.HTTP_201_CREATED)
async def create_key(
    body: WBApiKeyCreate,
    authorization: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    user = await get_current_user(authorization, db)

    # Здесь предполагается шифрование токена. Для простоты: пока сохраняем как есть.
    existing = await db.execute(
        select(WBApiKey).where(WBApiKey.user_id == user.id, WBApiKey.name == body.name)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Key with this name already exists")

    key = WBApiKey(
        user_id=user.id,
        name=body.name,
        encrypted_token=body.token,  # TODO: заменить на реальное шифрование
    )
    db.add(key)
    await db.commit()
    await db.refresh(key)
    return WBApiKeyRead.model_validate(key)


@router.delete("/keys/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_key(
    key_id: int,
    authorization: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    user = await get_current_user(authorization, db)
    result = await db.execute(
        select(WBApiKey).where(WBApiKey.id == key_id, WBApiKey.user_id == user.id)
    )
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
    await db.delete(key)
    await db.commit()
    return None