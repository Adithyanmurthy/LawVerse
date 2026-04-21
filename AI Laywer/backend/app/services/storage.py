import os
import uuid
from pathlib import Path

import boto3
from fastapi import UploadFile
from supabase import Client, create_client

from app.core.config import settings


ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}


def _ensure_upload_root() -> Path:
    root = Path(settings.upload_dir).resolve()
    root.mkdir(parents=True, exist_ok=True)
    return root


def _content_type(ext: str) -> str:
    if ext == "pdf":
        return "application/pdf"
    if ext == "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return "text/plain"


def _supabase_client() -> Client:
    if not settings.supabase_url or not settings.supabase_key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_KEY are required for supabase storage")
    return create_client(settings.supabase_url, settings.supabase_key)


def _r2_client():
    if not settings.r2_endpoint_url or not settings.r2_access_key_id or not settings.r2_secret_access_key:
        raise RuntimeError("R2 endpoint/access key/secret are required for r2 storage")
    return boto3.client(
        "s3",
        endpoint_url=settings.r2_endpoint_url,
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        region_name="auto",
    )


async def upload_contract(file: UploadFile, user_id: str) -> str:
    ext = (file.filename or "").split(".")[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("Only PDF, DOCX, and TXT files are allowed")

    content = await file.read()
    max_bytes = settings.max_upload_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise ValueError(f"File too large. Maximum size is {settings.max_upload_mb}MB.")

    key = f"{user_id}/{uuid.uuid4()}.{ext}"

    backend = settings.storage_backend.lower()
    if backend == "supabase":
        sb = _supabase_client()
        sb.storage.from_(settings.supabase_bucket).upload(
            key,
            content,
            file_options={"content-type": _content_type(ext)},
        )
        return f"supabase:{key}"

    if backend == "r2":
        r2 = _r2_client()
        r2.put_object(
            Bucket=settings.r2_bucket,
            Key=key,
            Body=content,
            ContentType=_content_type(ext),
        )
        return f"r2:{key}"

    root = _ensure_upload_root()
    user_dir = root / user_id
    user_dir.mkdir(parents=True, exist_ok=True)
    abs_path = user_dir / f"{uuid.uuid4()}.{ext}"
    abs_path.write_bytes(content)
    return f"local:{abs_path}"


def download_contract(file_path: str) -> bytes:
    if file_path.startswith("supabase:"):
        key = file_path.split(":", 1)[1]
        sb = _supabase_client()
        return sb.storage.from_(settings.supabase_bucket).download(key)
    if file_path.startswith("r2:"):
        key = file_path.split(":", 1)[1]
        r2 = _r2_client()
        return r2.get_object(Bucket=settings.r2_bucket, Key=key)["Body"].read()
    path = file_path.split(":", 1)[1] if file_path.startswith("local:") else file_path
    return Path(path).read_bytes()


def delete_contract(file_path: str) -> None:
    if file_path.startswith("supabase:"):
        key = file_path.split(":", 1)[1]
        sb = _supabase_client()
        sb.storage.from_(settings.supabase_bucket).remove([key])
        return
    if file_path.startswith("r2:"):
        key = file_path.split(":", 1)[1]
        r2 = _r2_client()
        r2.delete_object(Bucket=settings.r2_bucket, Key=key)
        return
    path = file_path.split(":", 1)[1] if file_path.startswith("local:") else file_path
    p = Path(path)
    if p.exists():
        os.remove(p)
