import time
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    create_user,
)

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

_rate_attempts: dict[str, list[float]] = defaultdict(list)


def rate_limit(max_attempts: int = 5, window_seconds: int = 60):
    async def limiter(request: Request):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        attempts = _rate_attempts[client_ip]
        attempts[:] = [t for t in attempts if now - t < window_seconds]
        if len(attempts) >= max_attempts:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Demasiados intentos. Espera un minuto.",
            )
        attempts.append(now)
    return limiter


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/v1/auth",
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _limited: None = Depends(rate_limit(3, 60)),
):
    user_data = UserCreate(**data.model_dump())
    user = await create_user(db, user_data)
    return {"success": True, "data": UserResponse.model_validate(user).model_dump()}


@router.post("/login")
async def login(
    data: LoginRequest,
    response: Response,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _limited: None = Depends(rate_limit(5, 60)),
):
    user = await authenticate_user(db, data.email, data.password)
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    set_auth_cookies(response, access_token, refresh_token)
    return {
        "success": True,
        "data": {
            "user": UserResponse.model_validate(user).model_dump(),
            "access_token": access_token,
        },
    }


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/api/v1/auth")
    return {"success": True, "data": {"message": "Logged out"}}


@router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    refresh_token_cookie = request.cookies.get("refresh_token")
    if not refresh_token_cookie:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

    try:
        payload = jwt.decode(refresh_token_cookie, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    access_token = create_access_token(user_id)
    new_refresh_token = create_refresh_token(user_id)
    set_auth_cookies(response, access_token, new_refresh_token)
    return {"success": True, "data": {"access_token": access_token}}


@router.get("/me")
async def me(current_user: User = Depends(get_current_user)):
    return {"success": True, "data": UserResponse.model_validate(current_user).model_dump()}
