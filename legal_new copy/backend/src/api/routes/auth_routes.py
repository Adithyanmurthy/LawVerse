"""Auth routes — register/login with JWT."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.src.services.database import User, async_session
import bcrypt
from jose import jwt
from datetime import datetime, timedelta, timezone
from config.settings import JWT_SECRET
import sqlalchemy as sa

router = APIRouter(prefix="/auth", tags=["auth"])


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def _create_token(data: dict, expires_minutes: int = 60) -> str:
    return jwt.encode({**data, "exp": datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)},
                      JWT_SECRET, algorithm="HS256")


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(req: RegisterRequest):
    async with async_session() as session:
        exists = await session.execute(sa.select(User).where(User.email == req.email))
        if exists.scalar():
            raise HTTPException(400, "Email already registered")
        user = User(email=req.email, password_hash=_hash_password(req.password), full_name=req.full_name)
        session.add(user)
        await session.commit()
    return {"message": "Registered", "email": req.email}


@router.post("/login")
async def login(req: LoginRequest):
    async with async_session() as session:
        result = await session.execute(sa.select(User).where(User.email == req.email))
        user = result.scalar()
    if not user or not _verify_password(req.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    token = _create_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}
