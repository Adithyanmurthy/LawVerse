import urllib.parse

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models import User
from app.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.services.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
GOOGLE_SCOPES = "openid email profile"


def _google_redirect_uri() -> str:
    return f"{settings.backend_url.rstrip('/')}/api/auth/google/callback"


@router.post("/register", response_model=TokenResponse)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    existing = await db.execute(select(User).where(User.email == payload.email.lower()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    user = User(
        email=payload.email.lower(),
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)) -> dict:
    user.reset_if_needed()
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "plan": user.plan,
        "analyses_used": user.analyses_used,
        "analyses_limit": user.monthly_limit,
        "analyses_remaining": max(0, user.monthly_limit - user.analyses_used),
        "created_at": user.created_at.isoformat(),
    }


@router.patch("/me")
async def update_me(
    payload: dict,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    if "full_name" in payload:
        user.full_name = str(payload["full_name"]).strip()[:255]
    await db.commit()
    await db.refresh(user)
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "plan": user.plan,
        "analyses_used": user.analyses_used,
        "analyses_limit": user.monthly_limit,
        "analyses_remaining": max(0, user.monthly_limit - user.analyses_used),
        "created_at": user.created_at.isoformat(),
    }


@router.get("/google")
async def google_login():
    if not settings.google_client_id:
        raise HTTPException(status_code=503, detail="Google OAuth not configured")
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": _google_redirect_uri(),
        "response_type": "code",
        "scope": GOOGLE_SCOPES,
        "access_type": "offline",
        "prompt": "select_account",
    }
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}")


@router.get("/google/callback")
async def google_callback(code: str = Query(...), db: AsyncSession = Depends(get_db)):
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(status_code=503, detail="Google OAuth not configured")

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": _google_redirect_uri(),
            "grant_type": "authorization_code",
        })
    if token_resp.status_code != 200:
        return RedirectResponse(f"{settings.frontend_url}/login?error=oauth_failed")

    access_token = token_resp.json().get("access_token")

    async with httpx.AsyncClient() as client:
        profile_resp = await client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )
    if profile_resp.status_code != 200:
        return RedirectResponse(f"{settings.frontend_url}/login?error=oauth_failed")

    profile = profile_resp.json()
    email = profile.get("email", "").lower()
    if not email:
        return RedirectResponse(f"{settings.frontend_url}/login?error=oauth_failed")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user:
        if not user.google_id:
            user.google_id = profile.get("sub", "")
        if not user.avatar_url and profile.get("picture"):
            user.avatar_url = profile["picture"]
        if not user.full_name and profile.get("name"):
            user.full_name = profile["name"]
        await db.commit()
    else:
        user = User(
            email=email,
            hashed_password="",
            full_name=profile.get("name", ""),
            google_id=profile.get("sub", ""),
            avatar_url=profile.get("picture", ""),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    jwt_token = create_access_token(user.id)
    return RedirectResponse(f"{settings.frontend_url}/auth/callback?token={jwt_token}")
