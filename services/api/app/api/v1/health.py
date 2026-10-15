import redis
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.services.media_pipeline import MediaPipelineService

router = APIRouter(tags=["Health & Diagnostics"])

@router.get("/health")
def health(db: Session = Depends(get_db)):
    return readiness(db)

@router.get("/health/live")
def liveness():
    return {"status": "ok", "app": settings.APP_NAME, "env": settings.APP_ENV}

@router.get("/health/ready")
def readiness(db: Session = Depends(get_db)):
    health_status = {"status": "ok", "checks": {}}
    
    # Check Database
    try:
        db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = "connected"
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["checks"]["database"] = f"error: {str(e)}"

    # Check Redis
    try:
        r = redis.Redis.from_url(settings.REDIS_URL, socket_timeout=1)
        r.ping()
        health_status["checks"]["redis"] = "connected"
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["checks"]["redis"] = f"error: {str(e)}"

    # Check FFmpeg
    media_service = MediaPipelineService()
    health_status["checks"]["ffmpeg"] = "available" if media_service.is_ffmpeg_available() else "unavailable"

    return health_status
