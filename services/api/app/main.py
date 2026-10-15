import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.v1 import api_v1_router
from app.core.database import Base, engine

# Create tables in development if not using alembic directly
Base.metadata.create_all(bind=engine)

# Ensure newly introduced columns exist in existing PostgreSQL/SQLite tables
def _ensure_schema_columns():
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            # Check dialect
            dialect_name = engine.dialect.name
            if dialect_name == "postgresql":
                migration_statements = [
                    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS aspirational_traits JSONB DEFAULT '[]'::jsonb",
                    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS avatar_options JSONB DEFAULT '{}'::jsonb",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_options JSONB DEFAULT '{}'::jsonb",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS aspirational_traits JSONB DEFAULT '[]'::jsonb",
                    "ALTER TABLE goals ADD COLUMN IF NOT EXISTS target_date TIMESTAMP WITH TIME ZONE"
                ]
            else:
                # SQLite fallback
                migration_statements = [
                    "ALTER TABLE avatars ADD COLUMN aspirational_traits JSON",
                    "ALTER TABLE avatars ADD COLUMN avatar_options JSON",
                    "ALTER TABLE users ADD COLUMN avatar_options JSON",
                    "ALTER TABLE users ADD COLUMN aspirational_traits JSON",
                    "ALTER TABLE goals ADD COLUMN target_date DATETIME"
                ]
            for stmt in migration_statements:
                try:
                    conn.execute(text(stmt))
                    conn.commit()
                except Exception:
                    pass
    except Exception as e:
        print(f"Schema check notice: {e}")

_ensure_schema_columns()

# Ensure local storage directories exist
os.makedirs(settings.LOCAL_STORAGE_DIR, exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for 'Your Life, Your Series' - turn your daily goals and tasks into an episodic AI web series.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local media directory for streaming playback
if os.path.exists(settings.LOCAL_STORAGE_DIR):
    app.mount("/media", StaticFiles(directory=settings.LOCAL_STORAGE_DIR), name="media")

# Include v1 API router
app.include_router(api_v1_router)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "api_v1": "/api/v1"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
