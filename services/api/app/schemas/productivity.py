from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class GoalCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    category: str = "Career"
    current_situation: Optional[str] = None
    target_outcome: Optional[str] = None
    milestones: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    target_date: Optional[datetime] = None

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    current_situation: Optional[str] = None
    target_outcome: Optional[str] = None
    milestones: Optional[List[Dict[str, Any]]] = None
    target_date: Optional[datetime] = None
    is_completed: Optional[bool] = None

class GoalTargetDateUpdate(BaseModel):
    target_date: datetime

class GoalResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    category: str
    current_situation: Optional[str] = None
    target_outcome: Optional[str] = None
    milestones: Optional[List[Dict[str, Any]]] = []
    target_date: Optional[datetime]
    is_completed: bool
    progress_percentage: float
    created_at: datetime
    updated_at: datetime
    total_tasks: Optional[int] = 0
    completed_tasks: Optional[int] = 0

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = None
    priority: str = Field(default="medium", pattern="^(low|medium|high|urgent)$")
    points: int = Field(default=25, ge=1, le=100)
    category: str = Field(default="Work")
    goal_id: Optional[str] = None
    due_date: Optional[datetime] = None
    is_recurring: bool = False
    recurrence_rule: Optional[str] = None
    goal_alignment: Optional[str] = "routine"
    milestone_id: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    points: Optional[int] = None
    category: Optional[str] = None
    goal_id: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    is_recurring: Optional[bool] = None
    recurrence_rule: Optional[str] = None
    goal_alignment: Optional[str] = None
    milestone_id: Optional[str] = None

class TaskResponse(BaseModel):
    id: str
    user_id: str
    goal_id: Optional[str]
    title: str
    description: Optional[str]
    priority: str
    points: int = 25
    category: str = "Work"
    status: str
    goal_alignment: Optional[str] = "routine"
    alignment_score: Optional[int] = 70
    alignment_reason: Optional[str] = None
    milestone_id: Optional[str] = None
    suggested_next_step: Optional[str] = None
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    xp_reward: int
    is_recurring: bool
    recurrence_rule: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskToggleResponse(BaseModel):
    task: TaskResponse
    xp_earned: int
    new_xp: int
    new_level: int
    current_streak: int
    streak_extended: bool
    level_up: bool

class VoiceExtractRequest(BaseModel):
    transcript: str = Field(..., min_length=3, description="Voice transcription text")

class ExtractedTaskItem(BaseModel):
    title: str
    description: str
    priority: str = "medium"
    points: int = 25
    category: str = "Work"
    due_at: Optional[str] = None
    confidence: float = 0.95

class VoiceExtractResponse(BaseModel):
    transcript: str
    tasks: List[ExtractedTaskItem]
    total_suggested_points: int

