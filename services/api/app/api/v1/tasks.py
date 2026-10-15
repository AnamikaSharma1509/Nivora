from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.productivity_service import ProductivityService
from app.schemas.productivity import (
    TaskCreate, TaskUpdate, TaskResponse, TaskToggleResponse,
    VoiceExtractRequest, VoiceExtractResponse, ExtractedTaskItem
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/extract-voice", response_model=VoiceExtractResponse)
def extract_tasks_from_voice(
    data: VoiceExtractRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ProductivityService(db)
    extracted = service.extract_tasks_from_voice(data.transcript)
    total_pts = sum(t["points"] for t in extracted)
    return VoiceExtractResponse(
        transcript=data.transcript,
        tasks=[ExtractedTaskItem(**t) for t in extracted],
        total_suggested_points=total_pts
    )

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[str] = Query(None, description="pending | completed | all"),
    goal_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ProductivityService(db)
    return service.list_tasks(current_user.id, status_filter=status, goal_id=goal_id)

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ProductivityService(db)
    return service.create_task(current_user.id, data)

@router.get("/{task_id}", response_model=TaskResponse)
def get_task_detail(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ProductivityService(db)
    task = service.get_task(current_user.id, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ProductivityService(db)
    return service.update_task(current_user.id, task_id, data)

@router.patch("/{task_id}/toggle", response_model=TaskToggleResponse)
def toggle_task_status(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ProductivityService(db)
    task, xp_earned, new_xp, new_level, streak, streak_ext, lvl_up = service.toggle_task(
        current_user.id, task_id
    )
    return TaskToggleResponse(
        task=task,
        xp_earned=xp_earned,
        new_xp=new_xp,
        new_level=new_level,
        current_streak=streak,
        streak_extended=streak_ext,
        level_up=lvl_up
    )

@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ProductivityService(db)
    success = service.delete_task(current_user.id, task_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return {"message": "Task deleted successfully"}
