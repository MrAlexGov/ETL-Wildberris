from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(min_length=6)
    full_name: str | None = None


class UserLogin(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    full_name: str | None = None
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"