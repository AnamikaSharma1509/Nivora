import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, Integer, Float, ForeignKey, DateTime, Text, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Avatar(Base):
    __tablename__ = "avatars"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(100), nullable=False)
    display_name = Column(String(100), nullable=True)
    archetype = Column(String(50), nullable=False)  # CEO, AI Engineer, Entrepreneur, Student, etc.
    career = Column(String(100), nullable=True)
    category = Column(String(50), default="Technology and AI")
    nationality = Column(String(100), default="International")
    preferred_language = Column(String(50), default="English")
    age_range = Column(String(50), default="25-35")
    description = Column(Text, nullable=False)
    
    personality_traits = Column(JSON, default=list)  # ["ambitious", "visionary", "resilient"]
    aspirational_traits = Column(JSON, default=list)  # ["analytical", "unflappable", "tactical"]
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    motivations = Column(JSON, default=list)
    
    visual_prompt_attributes = Column(Text, nullable=False)  # prompt styling
    visual_style = Column(String(100), default="Cinematic Photorealistic")
    image_url = Column(String(500), nullable=True)
    avatar_options = Column(JSON, default=dict)  # {"hair_style": "...", "hair_color": "...", "skin_tone": "...", "clothing_color": "..."}
    
    genre_preferences = Column(JSON, default=list)
    story_preferences = Column(JSON, default=dict)
    
    is_template = Column(Boolean, default=True)
    is_custom = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    series = relationship("Series", back_populates="avatar")


class Series(Base):
    __tablename__ = "series"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    avatar_id = Column(String(36), ForeignKey("avatars.id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    genre = Column(String(50), default="romantic_comedy")  # romantic_comedy, thriller, slice_of_life, anime_adventure, scifi, fantasy
    long_term_purpose = Column(Text, nullable=True)
    current_season = Column(Integer, default=1)
    current_episode_number = Column(Integer, default=0)
    
    # Continuity State
    narrative_state = Column(JSON, default=dict)
    status = Column(String(20), default="active")  # active, completed, paused

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="series")
    avatar = relationship("Avatar", back_populates="series")
    episodes = relationship("Episode", back_populates="series", cascade="all, delete-orphan", order_by="Episode.episode_number")


class Episode(Base):
    __tablename__ = "episodes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    series_id = Column(String(36), ForeignKey("series.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    episode_number = Column(Integer, nullable=False)
    day_number = Column(Integer, default=1)
    episode_slot = Column(String(10), default="A")  # "A" or "B"
    demo_character_key = Column(String(50), nullable=True)  # "cary", "meera", "aarav", "ananya", "riya", "arjun"
    
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=True)
    opening_hook = Column(Text, nullable=True)
    cliffhanger = Column(Text, nullable=True)
    full_script = Column(Text, nullable=True)
    
    script_json = Column(JSON, default=dict)
    task_snapshot = Column(JSON, default=dict)  # {"completed": [...], "missed": [...]}
    branch_previews = Column(JSON, default=dict)  # {"branch_80": {...}, "branch_90": {...}, "branch_100": {...}}
    
    # Generation status
    # queued, script_generating, image_generating, audio_generating, video_assembling, completed, failed
    generation_status = Column(String(30), default="completed", index=True)
    
    video_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    captions_url = Column(String(500), nullable=True)
    duration_seconds = Column(Float, default=60.0)
    view_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    series = relationship("Series", back_populates="episodes")
    user = relationship("User", back_populates="episodes")
    scenes = relationship("Scene", back_populates="episode", cascade="all, delete-orphan", order_by="Scene.scene_number")
    generation_jobs = relationship("GenerationJob", back_populates="episode", cascade="all, delete-orphan")
    media_assets = relationship("MediaAsset", back_populates="episode", cascade="all, delete-orphan")


class Scene(Base):
    __tablename__ = "scenes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    episode_id = Column(String(36), ForeignKey("episodes.id", ondelete="CASCADE"), nullable=False, index=True)
    scene_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=True)
    visual_description = Column(Text, nullable=False)
    image_prompt = Column(Text, nullable=False)
    narration_text = Column(Text, nullable=False)
    dialogue = Column(JSON, default=list)  # [{"speaker": "Cary", "line": "..."}]
    mood = Column(String(50), default="neutral")
    duration_seconds = Column(Float, default=15.0)
    
    image_url = Column(String(500), nullable=True)
    audio_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    episode = relationship("Episode", back_populates="scenes")


class GenerationJob(Base):
    __tablename__ = "generation_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    episode_id = Column(String(36), ForeignKey("episodes.id", ondelete="CASCADE"), nullable=False, index=True)
    
    job_type = Column(String(50), default="episode_full")  # episode_full, scene_image, scene_tts, video_assembly
    status = Column(String(30), default="queued", index=True)  # queued, processing, completed, failed, cancelled
    progress_percent = Column(Integer, default=0)
    current_stage = Column(String(100), default="Job submitted")
    error_message = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    idempotency_key = Column(String(255), unique=True, index=True, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    episode = relationship("Episode", back_populates="generation_jobs")


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    episode_id = Column(String(36), ForeignKey("episodes.id", ondelete="CASCADE"), nullable=True, index=True)
    scene_id = Column(String(36), ForeignKey("scenes.id", ondelete="SET NULL"), nullable=True)
    
    asset_type = Column(String(50), nullable=False)  # image, audio, video, subtitle, thumbnail
    storage_key = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    duration_seconds = Column(Float, nullable=True)
    resolution = Column(String(20), nullable=True)  # e.g., "1280x720"

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    episode = relationship("Episode", back_populates="media_assets")
