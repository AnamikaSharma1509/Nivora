from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.productivity_service import ProductivityService
from app.schemas.productivity import GoalCreate, GoalUpdate, GoalResponse, GoalTargetDateUpdate

router = APIRouter(prefix="/goals", tags=["Goals"])

@router.get("", response_model=List[GoalResponse])
def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ProductivityService(db)
    return service.list_goals(current_user.id)

@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    data: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ProductivityService(db)
    return service.create_goal(current_user.id, data)

@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal_detail(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ProductivityService(db)
    goal = service.get_goal(current_user.id, goal_id)
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return goal

@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: str,
    data: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ProductivityService(db)
    return service.update_goal(current_user.id, goal_id, data)

@router.put("/{goal_id}/target-date", response_model=GoalResponse)
def update_goal_target_date(
    goal_id: str,
    data: GoalTargetDateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ProductivityService(db)
    return service.update_goal(current_user.id, goal_id, GoalUpdate(target_date=data.target_date))

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ProductivityService(db)
    success = service.delete_goal(current_user.id, goal_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return {"message": "Goal deleted successfully"}
