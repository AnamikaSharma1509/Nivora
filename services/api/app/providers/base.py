from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class SceneScript(BaseModel):
    scene_number: int
    title: str
    visual_description: str
    image_prompt: str
    narration: str
    dialogue: List[Dict[str, str]] = []
    mood: str = "neutral"
    duration_seconds: float = 15.0

class NarrativeUpdates(BaseModel):
    new_allies: List[str] = []
    new_rivals: List[str] = []
    unresolved_threads: List[str] = []
    milestone_unlocked: Optional[str] = None

class EpisodeScript(BaseModel):
    episode_title: str
    opening_hook: str
    scenes: List[SceneScript]
    cliffhanger: str
    summary: str
    narrative_updates: NarrativeUpdates
    branch_previews: Dict[str, Any] = Field(default_factory=dict)

class StoryContext(BaseModel):
    character_name: str
    character_archetype: str
    character_traits: List[str]
    character_visual_attributes: str
    genre: str
    long_term_purpose: Optional[str] = None
    current_season: int = 1
    current_episode_number: int = 1
    completed_tasks: List[Dict[str, Any]]
    missed_tasks: List[Dict[str, Any]]
    prior_narrative_state: Dict[str, Any] = {}
    prior_episode_summaries: List[str] = []
    additional_notes: Optional[str] = None


class BaseStoryProvider(ABC):
    @abstractmethod
    async def generate_episode_script(self, context: StoryContext) -> EpisodeScript:
        pass


class BaseImageProvider(ABC):
    @abstractmethod
    async def generate_scene_image(
        self,
        prompt: str,
        character_reference: Optional[str] = None,
        style_genre: str = "cinematic",
        output_path: Optional[str] = None
    ) -> str:
        """Returns the local file path or cloud URL of the generated image"""
        pass


class BaseTTSProvider(ABC):
    @abstractmethod
    async def generate_narration_audio(
        self,
        text: str,
        voice: str = "alloy",
        output_path: Optional[str] = None
    ) -> str:
        """Returns the local file path or cloud URL of the generated audio (mp3/wav)"""
        pass


class BaseStorageAdapter(ABC):
    @abstractmethod
    async def store_file(self, source_path: str, destination_key: str, content_type: str) -> str:
        """Stores a file and returns its public or signed URL"""
        pass

    @abstractmethod
    async def get_url(self, key: str, expires_in_seconds: int = 3600) -> str:
        pass
