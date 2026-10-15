from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, String, cast
from app.core.database import get_db
from app.api.deps import get_current_user, get_optional_user
from app.models.user import User
from app.models.story import Avatar, Series
from app.models.productivity import Goal
from app.schemas.avatar import (
    AvatarCreateRequest, AvatarUpdateRequest, AvatarResponse,
    AdoptTraitsRequest, AvatarOptionsUpdateRequest
)

router = APIRouter(prefix="/avatars", tags=["Avatars & Identities"])

TRAIT_PRACTICAL_SUGGESTIONS: Dict[str, str] = {
    "analytical": "Compare two alternative technical solutions before making an architectural decision, documenting key assumptions.",
    "unflappable": "When an urgent disruption occurs today, pause for 60 seconds to structure your response before acting.",
    "tactical": "Break down your most complex pending task into three 25-minute sequential sprints.",
    "resourceful": "Solve a blocker using an existing open-source primitive or available tooling before writing custom code from scratch.",
    "curious": "Spend 20 minutes deep-diving into the source implementation of a library function you use daily.",
    "resilient": "Review a past missed task or setback and write down a single operational guardrail to prevent recurrence.",
    "visionary": "Write a 3-sentence summary of what your goal achievement will look like 12 months from today.",
    "strategic": "Identify which one task on your daily plan produces 80% of the long-term progress toward your destination milestone.",
    "calm under pressure": "Take 3 deep measured breaths before entering high-stakes meetings or debugging sessions.",
    "disciplined": "Complete your highest-priority milestone task before checking email or social feeds.",
    "empathetic": "In your next collaboration, summarize the other person's perspective before offering your critique.",
    "expressive": "Clearly articulate the 'why' behind today's deliverable in your daily reflection notes.",
    "humble": "Acknowledge team contributions and actively invite constructive feedback on your latest draft.",
    "focused": "Block out a 90-minute uninterrupted deep work window with notifications silenced.",
}

def _ensure_user_identity(user: User, db: Session) -> Avatar:
    # 1. Check if user already owns a custom avatar
    avatar = db.query(Avatar).filter(Avatar.user_id == user.id).first()
    if avatar:
        return avatar

    # 2. Check if user has an active series with an avatar
    series = db.query(Series).filter(Series.user_id == user.id, Series.status == "active").first()
    if series and series.avatar:
        if series.avatar.user_id == user.id:
            return series.avatar
        # Fork the template into a user-owned custom avatar
        t = series.avatar
        user_copy = Avatar(
            user_id=user.id,
            name=user.display_name,
            display_name=user.display_name,
            archetype=t.archetype or "Protagonist",
            career=t.career or "Ambitious Creator",
            category=t.category or "Technology and AI",
            nationality=t.nationality or "International",
            preferred_language=t.preferred_language or "English",
            age_range=t.age_range or "25-35",
            description=t.description or f"{user.display_name}'s personalized protagonist identity.",
            personality_traits=t.personality_traits or ["Curious", "Disciplined", "Ambitious"],
            aspirational_traits=t.aspirational_traits or [],
            strengths=t.strengths or ["Focus", "Determination"],
            weaknesses=t.weaknesses or [],
            motivations=t.motivations or ["Mastery", "Excellence"],
            visual_prompt_attributes=t.visual_prompt_attributes or f"{user.display_name}, cinematic photorealistic",
            visual_style=t.visual_style or "Cinematic Photorealistic",
            image_url=t.image_url or "/avatars/meera.png",
            avatar_options=t.avatar_options or {
                "hair_style": "short_fade",
                "hair_color": "dark_black",
                "skin_tone": "warm_beige",
                "clothing_color": "emerald_teal",
                "gender": "neutral"
            },
            is_template=False,
            is_custom=True
        )
        db.add(user_copy)
        series.avatar_id = user_copy.id
        db.commit()
        db.refresh(user_copy)
        return user_copy

    # 3. Create fresh personalized avatar based on user info & active goal
    active_goal = db.query(Goal).filter(Goal.user_id == user.id, Goal.is_completed == False).order_by(Goal.created_at.desc()).first()
    archetype = "Tech Founder"
    career = "AI Systems Engineer"
    category = "Technology and AI"
    if active_goal:
        title_l = active_goal.title.lower()
        if "fintech" in title_l or "startup" in title_l or "founder" in title_l:
            archetype = "Fintech Founder"
            career = "Entrepreneur"
            category = "Business and entrepreneurship"
        elif "med" in title_l or "doctor" in title_l:
            archetype = "Physician"
            career = "Medical Resident"
            category = "Medicine and healthcare"
        elif "design" in title_l:
            archetype = "Product Designer"
            career = "Lead Designer"
            category = "Creative professions"
        elif "athlete" in title_l or "sport" in title_l:
            archetype = "Athlete"
            career = "Sports Scientist"
            category = "Sports and fitness"

    avatar = Avatar(
        user_id=user.id,
        name=user.display_name,
        display_name=user.display_name,
        archetype=archetype,
        career=career,
        category=category,
        nationality="International",
        preferred_language="English",
        age_range="25-35",
        description=active_goal.description if active_goal and active_goal.description else f"{user.display_name} pursuing destination goal excellence.",
        personality_traits=["Curious", "Disciplined", "Ambitious"],
        aspirational_traits=[],
        strengths=["Dedication", "Strategic Thinking"],
        weaknesses=["Impatience with slow progress"],
        motivations=["Mastery", "Impact"],
        visual_prompt_attributes=f"{user.display_name}, {career}, cinematic photorealistic",
        visual_style="Cinematic Photorealistic",
        image_url="/avatars/meera.png",
        avatar_options={
            "hair_style": "short_fade",
            "hair_color": "dark_black",
            "skin_tone": "warm_beige",
            "clothing_color": "emerald_teal",
            "gender": "neutral"
        },
        is_template=False,
        is_custom=True
    )
    db.add(avatar)
    db.commit()
    db.refresh(avatar)
    return avatar


@router.get("/my-identity", response_model=AvatarResponse)
def get_my_identity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the current authenticated user's persistent character identity.
    If none exists, safely initializes their custom persona without duplicating.
    """
    return _ensure_user_identity(current_user, db)


@router.put("/my-identity", response_model=AvatarResponse)
def update_my_identity(
    data: AvatarUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates the authenticated user's character identity in-place.
    Never creates duplicate identity records.
    """
    avatar = _ensure_user_identity(current_user, db)
    
    for k, v in data.model_dump(exclude_unset=True).items():
        if v is not None:
            setattr(avatar, k, v)
            
    db.commit()
    db.refresh(avatar)
    return avatar


@router.post("/my-avatar", response_model=AvatarResponse)
def update_my_avatar_options(
    data: AvatarOptionsUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Saves the user's human-style avatar choices (hair style, skin tone, clothing color, gender)
    """
    avatar = _ensure_user_identity(current_user, db)
    avatar.avatar_options = data.avatar_options
    if data.image_url:
        avatar.image_url = data.image_url
    db.commit()
    db.refresh(avatar)
    return avatar


@router.post("/adopt-traits")
def adopt_traits(
    data: AdoptTraitsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Adopts selected aspirational traits from other characters into the user's aspirational list.
    Preserves user's name, career, avatar, and existing traits.
    Prevents duplicate entries.
    """
    avatar = _ensure_user_identity(current_user, db)
    current_aspirational = list(avatar.aspirational_traits or [])
    current_lower = {t.lower(): t for t in current_aspirational}

    added = []
    for trait in data.traits:
        t_clean = trait.strip().capitalize()
        if t_clean.lower() not in current_lower:
            current_aspirational.append(t_clean)
            current_lower[t_clean.lower()] = t_clean
            added.append(t_clean)

    avatar.aspirational_traits = current_aspirational
    db.commit()
    db.refresh(avatar)

    suggestions = []
    for t in added:
        sug = TRAIT_PRACTICAL_SUGGESTIONS.get(t.lower(), f"Deliberately practice applying '{t}' during your daily focus sprint.")
        suggestions.append({"trait": t, "suggestion": sug})

    return {
        "status": "success",
        "message": f"Successfully adopted {len(added)} trait(s) into your aspirational character profile.",
        "added_traits": added,
        "aspirational_traits": avatar.aspirational_traits,
        "practical_development_suggestions": suggestions
    }


@router.delete("/aspirational-traits/{trait}")
def remove_aspirational_trait(
    trait: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Removes an aspirational trait from the user's development list.
    """
    avatar = _ensure_user_identity(current_user, db)
    current_aspirational = list(avatar.aspirational_traits or [])
    
    updated = [t for t in current_aspirational if t.lower() != trait.lower().strip()]
    avatar.aspirational_traits = updated
    db.commit()
    db.refresh(avatar)

    return {
        "status": "success",
        "message": f"Removed '{trait}' from aspirational traits.",
        "aspirational_traits": avatar.aspirational_traits
    }


@router.get("", response_model=List[AvatarResponse])
@router.get("/", response_model=List[AvatarResponse])
def list_avatars(
    category: Optional[str] = Query(None),
    nationality: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    custom_only: bool = Query(False),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    query = db.query(Avatar)
    
    if custom_only:
        if not current_user:
            return []
        query = query.filter(Avatar.user_id == current_user.id, Avatar.is_custom == True)
    else:
        if current_user:
            query = query.filter(or_(Avatar.is_template == True, Avatar.user_id == current_user.id))
        else:
            query = query.filter(Avatar.is_template == True)
            
    if category and category != "All":
        # Extract meaningful keywords for flexible matching across category variations
        cat_words = [w for w in category.replace("and", "").replace("&", "").split() if len(w) > 2]
        if cat_words:
            query = query.filter(or_(*[Avatar.category.ilike(f"%{w}%") for w in cat_words]))
        else:
            query = query.filter(Avatar.category.ilike(f"%{category}%"))
        
    if nationality and nationality != "All":
        query = query.filter(Avatar.nationality.ilike(f"%{nationality}%"))
        
    if search:
        s = f"%{search.strip()}%"
        # Search by name, career, archetype, description, and cast personality traits
        query = query.filter(or_(
            Avatar.name.ilike(s),
            Avatar.display_name.ilike(s),
            Avatar.archetype.ilike(s),
            Avatar.career.ilike(s),
            Avatar.description.ilike(s),
            cast(Avatar.personality_traits, String).ilike(s),
            cast(Avatar.aspirational_traits, String).ilike(s),
            Avatar.category.ilike(s)
        ))
        
    return query.order_by(Avatar.is_custom.desc(), Avatar.created_at.asc()).all()


@router.post("", response_model=AvatarResponse, status_code=status.HTTP_201_CREATED)
def create_custom_identity(
    data: AvatarCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    avatar = Avatar(
        user_id=current_user.id,
        name=data.name,
        display_name=data.display_name or data.name,
        archetype=data.archetype,
        career=data.career,
        category=data.category,
        nationality=data.nationality or "International",
        preferred_language=data.preferred_language or "English",
        age_range=data.age_range or "25-35",
        description=data.description,
        personality_traits=data.personality_traits,
        aspirational_traits=data.aspirational_traits or [],
        strengths=data.strengths,
        weaknesses=data.weaknesses,
        motivations=data.motivations,
        visual_prompt_attributes=data.visual_prompt_attributes or f"{data.name}, {data.career}, {data.archetype}",
        visual_style=data.visual_style or "Cinematic Photorealistic",
        image_url=data.image_url,
        avatar_options=data.avatar_options or {},
        genre_preferences=data.genre_preferences,
        story_preferences=data.story_preferences,
        is_template=False,
        is_custom=True,
    )
    db.add(avatar)
    db.commit()
    db.refresh(avatar)
    return avatar


@router.get("/{avatar_id}", response_model=AvatarResponse)
def get_avatar(avatar_id: str, db: Session = Depends(get_db)):
    avatar = db.query(Avatar).filter(Avatar.id == avatar_id).first()
    if not avatar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character identity not found")
    return avatar


@router.put("/{avatar_id}", response_model=AvatarResponse)
def update_avatar(
    avatar_id: str,
    data: AvatarUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    avatar = db.query(Avatar).filter(Avatar.id == avatar_id).first()
    if not avatar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Character identity not found")
        
    # If the avatar is a shared template, fork it into a customized user-owned copy
    if avatar.is_template or avatar.user_id != current_user.id:
        user_copy = Avatar(
            user_id=current_user.id,
            name=data.name or avatar.name,
            display_name=data.display_name or avatar.display_name or avatar.name,
            archetype=data.archetype or avatar.archetype,
            career=data.career or avatar.career,
            category=data.category or avatar.category,
            nationality=data.nationality or avatar.nationality,
            preferred_language=data.preferred_language or avatar.preferred_language,
            age_range=data.age_range or avatar.age_range,
            description=data.description or avatar.description,
            personality_traits=data.personality_traits if data.personality_traits is not None else avatar.personality_traits,
            aspirational_traits=data.aspirational_traits if data.aspirational_traits is not None else avatar.aspirational_traits,
            strengths=data.strengths if data.strengths is not None else avatar.strengths,
            weaknesses=data.weaknesses if data.weaknesses is not None else avatar.weaknesses,
            motivations=data.motivations if data.motivations is not None else avatar.motivations,
            visual_prompt_attributes=data.visual_prompt_attributes or avatar.visual_prompt_attributes,
            visual_style=data.visual_style or avatar.visual_style,
            image_url=data.image_url or avatar.image_url,
            avatar_options=data.avatar_options if data.avatar_options is not None else avatar.avatar_options,
            genre_preferences=data.genre_preferences if data.genre_preferences is not None else avatar.genre_preferences,
            story_preferences=data.story_preferences if data.story_preferences is not None else avatar.story_preferences,
            is_template=False,
            is_custom=True,
        )
        db.add(user_copy)
        db.commit()
        db.refresh(user_copy)
        return user_copy
    else:
        # User owns this custom identity, apply updates directly
        for k, v in data.model_dump(exclude_unset=True).items():
            if v is not None:
                setattr(avatar, k, v)
        db.commit()
        db.refresh(avatar)
        return avatar
