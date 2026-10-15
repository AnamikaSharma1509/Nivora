from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.productivity import Task, Goal
from app.models.story import Episode
from app.services.productivity_service import ProductivityService
from app.services.story_service import StoryService
from app.schemas.dashboard import DashboardOverviewResponse, ProductivityStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prod_service = ProductivityService(db)
    story_service = StoryService(db)

    # Active series
    series = story_service.get_active_series(current_user.id)

    # Tasks & Goals
    tasks = prod_service.list_tasks(current_user.id)
    goals = prod_service.list_goals(current_user.id)

    # Productivity metrics calculated from real DB data
    total_today = len(tasks)
    completed_today = len([t for t in tasks if t.status == "completed"])
    rate_today = round((completed_today / total_today * 100), 1) if total_today > 0 else 0.0

    # XP to next level
    xp_to_next = 250 - (current_user.xp % 250)

    stats = ProductivityStats(
        total_tasks_today=total_today,
        completed_tasks_today=completed_today,
        completion_rate_today=rate_today,
        current_streak=current_user.current_streak,
        longest_streak=current_user.longest_streak,
        level=current_user.level,
        xp=current_user.xp,
        xp_to_next_level=xp_to_next,
        weekly_completion_count=completed_today,
    )

    # Latest episode
    latest_episode = None
    if series:
        latest_episode = db.query(Episode).filter(
            Episode.series_id == series.id,
            Episode.user_id == current_user.id
        ).order_by(Episode.episode_number.desc()).first()

    return DashboardOverviewResponse(
        user=current_user,
        active_series=series,
        stats=stats,
        today_tasks=tasks,
        active_goals=goals,
        latest_episode=latest_episode,
        can_generate_today=total_today > 0
    )
