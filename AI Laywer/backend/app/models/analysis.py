import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_id: Mapped[str] = mapped_column(String(36), ForeignKey("contracts.id"), unique=True, index=True, nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False, default="LOW")
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.5)
    summary: Mapped[str] = mapped_column(Text, default="", nullable=False)
    contract_type: Mapped[str] = mapped_column(String(80), default="Unknown", nullable=False)
    parties: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    governing_law: Mapped[str] = mapped_column(String(120), default="", nullable=False)
    issues: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    clauses: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    processing_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    provider_used: Mapped[str] = mapped_column(String(30), default="rules_only", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class IssueFeedback(Base):
    __tablename__ = "issue_feedback"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analysis_id: Mapped[str] = mapped_column(String(36), ForeignKey("analyses.id"), index=True, nullable=False)
    clause_id: Mapped[str] = mapped_column(String(80), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    is_correct: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    comment: Mapped[str] = mapped_column(Text, default="", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
