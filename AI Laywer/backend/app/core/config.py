from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "AI Contract Copilot"
    app_env: str = "development"
    secret_key: str = "replace_me"
    access_token_expire_minutes: int = 60 * 24 * 7

    database_url: str = "sqlite+aiosqlite:///./app.db"
    upload_dir: str = "./uploads"
    max_upload_mb: int = 20
    
    # Cloudflare D1 Configuration
    cloudflare_account_id: str | None = None
    cloudflare_d1_database_id: str | None = None
    cloudflare_d1_api_token: str | None = None
    
    storage_backend: str = "local"
    supabase_url: str | None = None
    supabase_key: str | None = None
    supabase_bucket: str = "contracts"
    r2_access_key_id: str | None = None
    r2_secret_access_key: str | None = None
    r2_bucket: str = "contracts"
    r2_endpoint_url: str | None = None

    groq_api_key: str | None = None
    gemini_api_key: str | None = None
    cf_account_id: str | None = None
    cf_api_token: str | None = None

    google_client_id: str | None = None
    google_client_secret: str | None = None
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"

    razorpay_key_id: str | None = None
    razorpay_key_secret: str | None = None
    razorpay_webhook_secret: str | None = None
    razorpay_currency: str = "INR"
    razorpay_amount_starter: int | None = None   # paise, e.g. 240000 = ₹2400
    razorpay_amount_pro: int | None = None        # paise, e.g. 650000 = ₹6500
    razorpay_amount_team: int | None = None       # paise, e.g. 2000000 = ₹20000


settings = Settings()
