"""Database layer — async SQLite for demo, swappable to PostgreSQL."""
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config.settings import DB_URL

engine = create_async_engine(DB_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id = sa.Column(sa.Integer, primary_key=True)
    email = sa.Column(sa.String, unique=True, nullable=False)
    password_hash = sa.Column(sa.String, nullable=False)
    full_name = sa.Column(sa.String, default="")
    role = sa.Column(sa.String, default="viewer")


class Document(Base):
    __tablename__ = "documents"
    id = sa.Column(sa.Integer, primary_key=True)
    external_id = sa.Column(sa.String, unique=True)
    case_name = sa.Column(sa.String)
    court = sa.Column(sa.String)
    jurisdiction = sa.Column(sa.String)
    year = sa.Column(sa.Integer)
    decade = sa.Column(sa.String)
    text = sa.Column(sa.Text)
    source = sa.Column(sa.String)
    word_count = sa.Column(sa.Integer)


class ConceptEmbedding(Base):
    __tablename__ = "concept_embeddings"
    id = sa.Column(sa.Integer, primary_key=True)
    concept = sa.Column(sa.String, nullable=False)
    decade = sa.Column(sa.String, nullable=False)
    embedding_json = sa.Column(sa.Text)  # JSON array of floats
    doc_count = sa.Column(sa.Integer, default=0)
    __table_args__ = (sa.UniqueConstraint("concept", "decade"),)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db():
    async with async_session() as session:
        yield session
