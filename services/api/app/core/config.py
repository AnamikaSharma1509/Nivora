import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    APP_NAME: str = "Nivora"
    APP_ENV: str = "development"
    DEBUG: bool = True
    APP_URL: str = "http://localhost:3000"
    API_URL: str = "http://localhost:8000"

    # Security & Tokens
    SECRET_KEY: str = "ylys_super_secure_secret_key_change_in_production_2026_sdga_nivora"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:3000/auth/callback"

    # Database
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5433
    POSTGRES_DB: str = "your_life_your_series"
    DATABASE_URL: str = "postgresql+psycopg://postgres:password@localhost:5433/your_life_your_series"
    ASYNC_DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5433/your_life_your_series"

    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_URL: str = "redis://localhost:6379/0"

    # Storage
    STORAGE_BACKEND: str = "local"  # local | s3 | r2
    LOCAL_STORAGE_DIR: str = "./storage"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "your-life-your-series-media"
    S3_ENDPOINT_URL: Optional[str] = None

    # AI Providers
    STORY_PROVIDER: str = "mock"  # mock | openai | anthropic | gemini | groq
    STORY_MODEL: str = "gpt-4o-mini"
    IMAGE_PROVIDER: str = "mock"  # mock | openai | stability | replicate
    IMAGE_MODEL: str = "dall-e-3"
    TTS_PROVIDER: str = "mock"  # mock | openai | elevenlabs
    TTS_VOICE: str = "alloy"

    # Provider API Keys
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    STABILITY_API_KEY: Optional[str] = None
    REPLICATE_API_TOKEN: Optional[str] = None
    ELEVENLABS_API_KEY: Optional[str] = None
    ELEVENLABS_VOICE_ID: Optional[str] = None

    # Tools
    FFMPEG_PATH: str = "ffmpeg"
    FFPROBE_PATH: str = "ffprobe"

    # Email & Notifications
    EMAIL_BACKEND: str = "console"  # console | smtp | sendgrid | resend
    EMAIL_FROM: str = "no-reply@yourlifeyourseries.com"

    # Billing
    BILLING_PROVIDER: str = "mock"  # mock | stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
