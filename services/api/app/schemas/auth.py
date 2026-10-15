from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    display_name: str = Field(..., min_length=2, max_length=100)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    display_name: str
    is_new_user: bool = False
    has_completed_onboarding: bool = False

class UserPreferencesSchema(BaseModel):
    time_zone: str = "UTC"
    language: str = "en"
    email_notifications: bool = True
    daily_reminder_time: str = "20:00"
    preferred_tone: str = "motivational"
    caption_enabled: bool = True
    background_music_enabled: bool = True
    music_volume: float = 0.25

    class Config:
        from_attributes = True

class UserProfileResponse(BaseModel):
    id: str
    email: str
    display_name: str
    is_active: bool
    is_verified: bool
    level: int
    xp: int
    current_streak: int
    longest_streak: int
    preferences: Optional[UserPreferencesSchema] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class GoogleAuthCallbackRequest(BaseModel):
    code: Optional[str] = None
    state: Optional[str] = None
    credential: Optional[str] = None
    email: Optional[EmailStr] = None
    display_name: Optional[str] = None

