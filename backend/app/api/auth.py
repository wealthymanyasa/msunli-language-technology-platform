from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any, Optional

from app.models.base import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    Token, UserCreate, RegisterRequest, UserResponse, UserMeResponse,
    LoginRequest, RefreshRequest
)
from app.auth.jwt import (
    create_access_token, create_refresh_token,
    decode_access_token, decode_refresh_token
)
from app.auth.security import hash_password, verify_password, generate_api_key
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: RegisterRequest, db: Session = Depends(get_db)) -> Any:
    repo = UserRepository(db)

    if repo.email_exists(user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    if repo.username_exists(user_data.name):
        raise HTTPException(status_code=400, detail="Username already taken")

    api_key = generate_api_key()

    user = repo.create(
        email=user_data.email,
        username=user_data.name,
        hashed_password=hash_password(user_data.password),
        api_key=api_key,
        role="user",
    )

    return user


def _lookup_user(repo: UserRepository, login: str) -> Optional[User]:
    user = repo.get_by_username(login)
    if not user:
        user = repo.get_by_email(login)
    return user


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> Any:
    repo = UserRepository(db)
    user = _lookup_user(repo, form_data.username)

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled")

    repo.record_login(user.id)

    access_token = create_access_token(data={"sub": user.username, "user_id": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": user.username, "user_id": str(user.id)})

    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")


@router.post("/login/json", response_model=Token)
async def login_json(login_data: LoginRequest, db: Session = Depends(get_db)) -> Any:
    repo = UserRepository(db)
    user = _lookup_user(repo, login_data.username)

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled")

    repo.record_login(user.id)

    access_token = create_access_token(data={"sub": user.username, "user_id": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": user.username, "user_id": str(user.id)})

    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")


@router.post("/refresh", response_model=Token)
async def refresh(refresh_data: RefreshRequest) -> Any:
    payload = decode_refresh_token(refresh_data.refresh_token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    access_token = create_access_token(data={
        "sub": payload.get("sub"),
        "user_id": payload.get("user_id"),
    })
    new_refresh_token = create_refresh_token(data={
        "sub": payload.get("sub"),
        "user_id": payload.get("user_id"),
    })

    return Token(access_token=access_token, refresh_token=new_refresh_token, token_type="bearer")


@router.get("/me", response_model=UserMeResponse)
async def read_users_me(current_user=Depends(get_current_user)) -> Any:
    return current_user
