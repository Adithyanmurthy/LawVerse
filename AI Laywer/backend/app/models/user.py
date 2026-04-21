import uuid
from datetime import datetime, timedelta

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base

PLAN_LIMITS = {"free": 3, "starter": 25, "pro": 100, "team": 500}


def _reset_date() -> datetime:
    return datetime.utcnow() + timedelta(days=30)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    google_id: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    avatar_url: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    plan: Mapped[str] = mapped_column(String(20), default="free", nullable=False)
    analyses_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    analyses_reset_at: Mapped[datetime] = mapped_column(DateTime, default=_reset_date, nullable=False)
    stripe_customer_id: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    stripe_sub_id: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    @property
    def monthly_limit(self) -> int:
        return PLAN_LIMITS.get(self.plan, 3)

    def reset_if_needed(self) -> None:
        """Reset monthly counter if the reset window has passed."""
        if datetime.utcnow() >= self.analyses_reset_at:
            self.analyses_used = 0
            self.analyses_reset_at = _reset_date()
