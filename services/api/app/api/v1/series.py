from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.story import Avatar, Series
from app.services.story_service import StoryService
from app.schemas.story import AvatarResponse, SeriesCreate, SeriesResponse

router = APIRouter(tags=["Series & Avatars"])


@router.get("/genres")
def get_genres() -> List[Dict[str, Any]]:
    return [
        {
            "id": "romantic_comedy",
            "name": "Romantic Comedy",
            "tagline": "Sparks, ambition, and delightful workplace chaos",
            "accent_color": "#FF6B6B",
            "tone_description": "Lighthearted, witty dialogue, heartwarming relationship dynamics, and playful hurdles.",
            "sample_character": "Cary, a brilliant young CEO navigating high-stakes pitch meetings and accidental coffee dates."
        },
        {
            "id": "thriller",
            "name": "Corporate & Tech Thriller",
            "tagline": "Encrypted deadlines, corporate espionage, and high-wire tension",
            "accent_color": "#FFB347",
            "tone_description": "Fast-paced, high suspense, high-stakes negotiations, mystery phone calls, and critical cliffhangers.",
            "sample_character": "Elena, an ethical security hacker racing to deploy code before a midnight breach."
        },
        {
            "id": "slice_of_life",
            "name": "Slice of Life",
            "tagline": "Authentic personal growth, warm aesthetics, and mindful triumphs",
            "accent_color": "#A8E6CF",
            "tone_description": "Cozy, realistic emotional depth, celebrating daily rituals, quiet breakthroughs, and creative milestones.",
            "sample_character": "Leo, a freelance designer building his dream architectural studio one blueprint at a time."
        },
        {
            "id": "anime_adventure",
            "name": "Anime Action & Shonen",
            "tagline": "Overcoming limits, awakening power, and legendary teamwork",
            "accent_color": "#3BADA8",
            "tone_description": "Electric dynamism, high-energy breakthroughs, rivalries turned alliances, and epic personal progression.",
            "sample_character": "Ren, an aspiring athlete training to surpass the national championship tournament."
        },
        {
            "id": "scifi",
            "name": "Cyberpunk & Deep Sci-Fi",
            "tagline": "Quantum milestones, orbital startups, and tomorrow's frontier",
            "accent_color": "#6B3B7A",
            "tone_description": "Futuristic neon cities, speculative technology, synthetic mentors, and planetary-scale ambitions.",
            "sample_character": "Nova, a neural-network architect pioneering clean terraforming algorithms."
        },
        {
            "id": "fantasy",
            "name": "Guild Fantasy & Epic Lore",
            "tagline": "Quests, runes, legendary contracts, and mystical mastery",
            "accent_color": "#FFD166",
            "tone_description": "Enchanted archives, adventurer guilds, rare artifact quests, and mythic progression.",
            "sample_character": "Kaelen, a novice scholar rising through the Grand Arcane Library hierarchy."
        }
    ]

@router.get("/series/active", response_model=SeriesResponse | None)
def get_active_series(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = StoryService(db)
    return service.get_active_series(current_user.id)

@router.post("/series", response_model=SeriesResponse, status_code=status.HTTP_201_CREATED)
def create_series(
    data: SeriesCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = StoryService(db)
    return service.create_series(current_user.id, data)
