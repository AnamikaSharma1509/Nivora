from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.story import Episode, GenerationJob
from app.services.story_service import StoryService
from app.schemas.story import (
    EpisodeGenerateRequest, EpisodeResponse, GenerationJobResponse
)

router = APIRouter(tags=["Episodes & Multimedia"])

@router.post("/episodes/generate", response_model=EpisodeResponse, status_code=status.HTTP_201_CREATED)
async def generate_episode(
    request: EpisodeGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = StoryService(db)
    episode, job = await service.generate_episode(
        user_id=current_user.id,
        request=request,
        sync_generation=True
    )
    return episode

@router.get("/episodes", response_model=List[EpisodeResponse])
def list_episodes(
    series_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = StoryService(db)
    return service.list_episodes(current_user.id, series_id)

@router.get("/episodes/{episode_id}", response_model=EpisodeResponse)
def get_episode_detail(
    episode_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = StoryService(db)
    episode = service.get_episode(current_user.id, episode_id)
    if not episode:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Episode not found")
    return episode

@router.get("/generation-jobs/{job_id}", response_model=GenerationJobResponse)
def get_generation_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    job = db.query(GenerationJob).filter(GenerationJob.id == job_id, GenerationJob.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation job not found")
    return job
