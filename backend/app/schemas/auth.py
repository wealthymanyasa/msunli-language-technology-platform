from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
import uuid


class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[uuid.UUID] = None


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1)


class RefreshRequest(BaseModel):
    refresh_token: str


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    is_active: bool
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserMeResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    is_active: bool
    role: str
    api_key: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True
