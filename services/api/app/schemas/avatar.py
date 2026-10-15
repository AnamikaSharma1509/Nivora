from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class AvatarCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    display_name: Optional[str] = None
    archetype: str = Field(default="Tech Founder")
    career: Optional[str] = "Entrepreneur"
    category: str = Field(default="Technology and AI")
    nationality: Optional[str] = "International"
    preferred_language: Optional[str] = "English"
    age_range: Optional[str] = "25-35"
    description: str = Field(..., min_length=5)
    
    personality_traits: List[str] = Field(default_factory=list)
    aspirational_traits: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    motivations: List[str] = Field(default_factory=list)
    
    visual_prompt_attributes: Optional[str] = "Cinematic character portrait"
    visual_style: Optional[str] = "Cinematic Photorealistic"
    image_url: Optional[str] = None
    avatar_options: Dict[str, Any] = Field(default_factory=dict)
    
    genre_preferences: List[str] = Field(default_factory=list)
    story_preferences: Dict[str, Any] = Field(default_factory=dict)

class AvatarUpdateRequest(BaseModel):
    name: Optional[str] = None
    display_name: Optional[str] = None
    archetype: Optional[str] = None
    career: Optional[str] = None
    category: Optional[str] = None
    nationality: Optional[str] = None
    preferred_language: Optional[str] = None
    age_range: Optional[str] = None
    description: Optional[str] = None
    
    personality_traits: Optional[List[str]] = None
    aspirational_traits: Optional[List[str]] = None
    strengths: Optional[List[str]] = None
    weaknesses: Optional[List[str]] = None
    motivations: Optional[List[str]] = None
    
    visual_prompt_attributes: Optional[str] = None
    visual_style: Optional[str] = None
    image_url: Optional[str] = None
    avatar_options: Optional[Dict[str, Any]] = None
    
    genre_preferences: Optional[List[str]] = None
    story_preferences: Optional[Dict[str, Any]] = None

class AdoptTraitsRequest(BaseModel):
    traits: List[str] = Field(..., min_length=1, description="List of aspirational traits to adopt")

class AvatarOptionsUpdateRequest(BaseModel):
    avatar_options: Dict[str, Any] = Field(..., description="Human avatar visual attributes (hair, skin, clothing, gender)")
    image_url: Optional[str] = None

class AvatarResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    name: str
    display_name: Optional[str] = None
    archetype: str
    career: Optional[str] = None
    category: str
    nationality: Optional[str] = "International"
    preferred_language: Optional[str] = "English"
    age_range: Optional[str] = "25-35"
    description: str
    
    personality_traits: List[str] = []
    aspirational_traits: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    motivations: List[str] = []
    
    visual_prompt_attributes: Optional[str] = None
    visual_style: Optional[str] = "Cinematic Photorealistic"
    image_url: Optional[str] = None
    avatar_options: Dict[str, Any] = {}
    
    genre_preferences: List[str] = []
    story_preferences: Dict[str, Any] = {}
    
    is_template: bool
    is_custom: bool
    created_at: datetime

    class Config:
        from_attributes = True

