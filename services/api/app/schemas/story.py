from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AvatarResponse(BaseModel):
    id: str
    name: str
    archetype: str
    description: str
    personality_traits: List[str]
    visual_prompt_attributes: str
    image_url: Optional[str]
    is_template: bool

    class Config:
        from_attributes = True

class SeriesCreate(BaseModel):
    avatar_id: str
    title: str = Field(..., min_length=2, max_length=255)
    genre: str = Field(default="Corporate Drama")
    long_term_purpose: Optional[str] = None

class SeriesResponse(BaseModel):
    id: str
    user_id: str
    avatar_id: str
    title: str
    genre: str
    long_term_purpose: Optional[str]
    current_season: int
    current_episode_number: int
    narrative_state: Dict[str, Any]
    status: str
    avatar: Optional[AvatarResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SceneDialogue(BaseModel):
    speaker: str
    line: str

class SceneResponse(BaseModel):
    id: str
    scene_number: int
    title: Optional[str]
    visual_description: str
    image_prompt: str
    narration_text: str
    dialogue: List[Dict[str, str]]
    mood: str
    duration_seconds: float
    image_url: Optional[str]
    audio_url: Optional[str]

    class Config:
        from_attributes = True

class EpisodeGenerateRequest(BaseModel):
    series_id: Optional[str] = None
    format: str = "video"  # "video" | "text"
    additional_context: Optional[str] = None

class EpisodeResponse(BaseModel):
    id: str
    series_id: str
    episode_number: int
    day_number: Optional[int] = 1
    episode_slot: Optional[str] = "A"
    title: str
    summary: Optional[str]
    opening_hook: Optional[str]
    cliffhanger: Optional[str]
    full_script: Optional[str] = None
    branch_previews: Dict[str, Any] = {}
    generation_status: str
    video_url: Optional[str]
    thumbnail_url: Optional[str]
    captions_url: Optional[str]
    duration_seconds: float
    task_snapshot: Dict[str, Any]
    scenes: List[SceneResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True

class GenerationJobResponse(BaseModel):
    id: str
    episode_id: str
    job_type: str
    status: str
    progress_percent: int
    current_stage: str
    error_message: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
