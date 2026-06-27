import logging
from typing import Any, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.models.base import get_db
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserResponse
from app.core.dependencies import get_admin_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])


class UpdateRoleRequest(BaseModel):
    role: str = Field(..., pattern=r"^(user|admin)$")


class ToggleActiveResponse(BaseModel):
    id: UUID
    is_active: bool


@router.get("/users", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(get_admin_user),
) -> Any:
    repo = UserRepository(db)
    return repo.get_all(skip=skip, limit=limit)


@router.patch("/users/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: UUID,
    body: UpdateRoleRequest,
    db: Session = Depends(get_db),
    _=Depends(get_admin_user),
) -> Any:
    repo = UserRepository(db)
    user = repo.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return repo.update(user_id, role=body.role)


@router.patch("/users/{user_id}/toggle-active", response_model=ToggleActiveResponse)
async def toggle_user_active(
    user_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(get_admin_user),
) -> Any:
    repo = UserRepository(db)
    user = repo.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    updated = repo.update(user_id, is_active=not user.is_active)
    return ToggleActiveResponse(id=updated.id, is_active=updated.is_active)
