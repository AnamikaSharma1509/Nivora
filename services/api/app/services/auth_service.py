from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserPreference
from app.models.productivity import Goal
from app.models.story import Series
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, UserPreferencesSchema
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token

class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register_user(self, data: UserRegisterRequest) -> User:
        existing = self.db.query(User).filter(User.email == data.email.lower()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists."
            )
        
        user = User(
            email=data.email.lower(),
            hashed_password=get_password_hash(data.password),
            display_name=data.display_name,
            level=1,
            xp=0,
            current_streak=0,
            longest_streak=0,
        )
        self.db.add(user)
        self.db.flush()
        
        # Initialize default user preferences
        prefs = UserPreference(
            user_id=user.id,
            time_zone="UTC",
            language="en",
            email_notifications=True,
            daily_reminder_time="20:00",
            preferred_tone="motivational",
            caption_enabled=True,
            background_music_enabled=True,
            music_volume=0.25,
        )
        self.db.add(prefs)
        self.db.commit()
        self.db.refresh(user)
        return user

    def authenticate_user(self, data: UserLoginRequest) -> tuple[User, str, str]:
        user = self.db.query(User).filter(User.email == data.email.lower()).first()
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive."
            )
            
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        return user, access_token, refresh_token

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def update_preferences(self, user_id: str, prefs_data: UserPreferencesSchema) -> UserPreference:
        prefs = self.db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
        if not prefs:
            prefs = UserPreference(user_id=user_id)
            self.db.add(prefs)
            
        for k, v in prefs_data.model_dump(exclude_unset=True).items():
            setattr(prefs, k, v)
            
        self.db.commit()
        self.db.refresh(prefs)
        return prefs

    def has_completed_onboarding(self, user_id: str) -> bool:
        has_goal = self.db.query(Goal).filter(Goal.user_id == user_id).first() is not None
        has_series = self.db.query(Series).filter(Series.user_id == user_id).first() is not None
        return has_goal or has_series

    def authenticate_or_create_google_user(self, google_id: str, email: str, display_name: str) -> tuple[User, str, str, bool]:
        user = self.db.query(User).filter((User.google_id == google_id) | (User.email == email.lower())).first()
        is_new_user = False
        if not user:
            is_new_user = True
            user = User(
                email=email.lower(),
                google_id=google_id,
                display_name=display_name or email.split("@")[0].capitalize(),
                is_active=True,
                is_verified=True,
                level=1,
                xp=0,
                current_streak=0,
                longest_streak=0,
            )
            self.db.add(user)
            self.db.flush()
            prefs = UserPreference(
                user_id=user.id,
                time_zone="UTC",
                language="en",
                email_notifications=True,
                daily_reminder_time="20:00",
                preferred_tone="motivational",
                caption_enabled=True,
                background_music_enabled=True,
                music_volume=0.25,
            )
            self.db.add(prefs)
            self.db.commit()
            self.db.refresh(user)
        else:
            if not user.google_id:
                user.google_id = google_id
                user.is_verified = True
                self.db.commit()
                self.db.refresh(user)
        
        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        return user, access_token, refresh_token, is_new_user

    def delete_account(self, user_id: str) -> bool:
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        self.db.delete(user)
        self.db.commit()
        return True

