from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.goals import router as goals_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.series import router as series_router
from app.api.v1.episodes import router as episodes_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.health import router as health_router
from app.api.v1.avatars import router as avatars_router
from app.api.v1.timeline import router as timeline_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router)
api_v1_router.include_router(goals_router)
api_v1_router.include_router(tasks_router)
api_v1_router.include_router(series_router)
api_v1_router.include_router(episodes_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(health_router)
api_v1_router.include_router(avatars_router)
api_v1_router.include_router(timeline_router)
