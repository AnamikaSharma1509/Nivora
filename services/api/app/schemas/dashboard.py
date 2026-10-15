from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.schemas.auth import UserProfileResponse
from app.schemas.productivity import TaskResponse, GoalResponse
from app.schemas.story import SeriesResponse, EpisodeResponse

class ProductivityStats(BaseModel):
    total_tasks_today: int
    completed_tasks_today: int
    completion_rate_today: float
    current_streak: int
    longest_streak: int
    level: int
    xp: int
    xp_to_next_level: int
    weekly_completion_count: int

class DashboardOverviewResponse(BaseModel):
    user: UserProfileResponse
    active_series: Optional[SeriesResponse] = None
    stats: ProductivityStats
    today_tasks: List[TaskResponse]
    active_goals: List[GoalResponse]
    latest_episode: Optional[EpisodeResponse] = None
    can_generate_today: bool = True
