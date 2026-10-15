import os
import sys
import asyncio
from datetime import datetime, timezone, timedelta

# Add parent path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.core.database import SessionLocal, Base, engine
from app.models.user import User, UserPreference, Achievement
from app.models.productivity import Goal, Task
from app.models.story import Avatar, Series, Episode, Scene
from app.core.security import get_password_hash
from app.services.story_service import StoryService
from app.schemas.story import EpisodeGenerateRequest

def seed_database():
    print("[Seed] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Avatars
        existing_avatars = db.query(Avatar).count()
        if existing_avatars == 0:
            print("[Seed] Creating default avatar archetypes...")
            avatars = [
                Avatar(
                    name="Cary Woods",
                    archetype="CEO",
                    description="An ambitious young startup founder scaling an AI analytics platform against fierce Silicon Valley competitors.",
                    personality_traits=["ambitious", "quick-witted", "resilient", "charismatic"],
                    visual_prompt_attributes="young professional woman with sharp tailoring, dark wavy hair, confident posture in glass high-rise office",
                    image_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
                    is_template=True,
                ),
                Avatar(
                    name="Elena Rostova",
                    archetype="Tech Founder",
                    description="A brilliant cybersecurity architect uncovering corporate conspiracies while building decentralized privacy networks.",
                    personality_traits=["analytical", "unflappable", "tactical", "resourceful"],
                    visual_prompt_attributes="sharp modern hacker aesthetic, dark jacket, illuminated multi-monitor command setup with neon accents",
                    image_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80",
                    is_template=True,
                ),
                Avatar(
                    name="Maya Lin",
                    archetype="Artist",
                    description="A visionary visual storyteller and creative director turning independent concepts into global design sensations.",
                    personality_traits=["creative", "intuitive", "passionate", "empathic"],
                    visual_prompt_attributes="stylish minimalist artist studio, paint-dappled apron, warm natural daylight and large canvas sketches",
                    image_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
                    is_template=True,
                ),
                Avatar(
                    name="Lucas Wright",
                    archetype="Athlete",
                    description="A disciplined endurance athlete preparing for an international championship while coaching high-performance youth.",
                    personality_traits=["disciplined", "energizing", "unyielding", "humble"],
                    visual_prompt_attributes="athletic physique, modern track and training facility, sunrise mist, focused athletic determination",
                    image_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
                    is_template=True,
                ),
                Avatar(
                    name="Dr. Julian Hayes",
                    archetype="Scholar",
                    description="A quantum computing researcher decoding clean energy algorithms in an elite university observatory.",
                    personality_traits=["intellectual", "curious", "measured", "visionary"],
                    visual_prompt_attributes="distinguished academic researcher, tweed blazer, grand library with holographic physics diagrams",
                    image_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
                    is_template=True,
                ),
            ]
            db.add_all(avatars)
            db.commit()
            print("[Seed] Created 5 avatar archetypes.")

        # 2. Achievements
        existing_achievements = db.query(Achievement).count()
        if existing_achievements == 0:
            print("[Seed] Creating achievement badges...")
            achievements = [
                Achievement(
                    slug="series_debut",
                    title="Series Debut",
                    description="Generated and streamed your very first personalized AI episode.",
                    badge_icon="play-circle",
                    category="story",
                    xp_bonus=100
                ),
                Achievement(
                    slug="streak_champion_3",
                    title="Three-Day Streak",
                    description="Completed tasks 3 consecutive days in a row.",
                    badge_icon="flame",
                    category="productivity",
                    xp_bonus=150
                ),
                Achievement(
                    slug="first_milestone",
                    title="First Milestone",
                    description="Fully completed your first long-term goal milestone.",
                    badge_icon="trophy",
                    category="goals",
                    xp_bonus=200
                ),
                Achievement(
                    slug="flawless_execution",
                    title="Flawless Execution",
                    description="Finished every single scheduled task in a day with 100% completion rate.",
                    badge_icon="award",
                    category="productivity",
                    xp_bonus=250
                ),
            ]
            db.add_all(achievements)
            db.commit()
            print("[Seed] Created achievement badges.")

        # 3. Demo User
        demo_user = db.query(User).filter(User.email == "demo@yourlifeyourseries.com").first()
        if not demo_user:
            print("[Seed] Creating demo user: demo@yourlifeyourseries.com / Password123!")
            demo_user = User(
                email="demo@yourlifeyourseries.com",
                hashed_password=get_password_hash("Password123!"),
                display_name="Cary Woods",
                level=2,
                xp=350,
                current_streak=3,
                longest_streak=5,
                last_active_date=datetime.now(timezone.utc),
            )
            db.add(demo_user)
            db.flush()

            prefs = UserPreference(
                user_id=demo_user.id,
                time_zone="America/New_York",
                language="en",
                preferred_tone="motivational",
                caption_enabled=True,
                background_music_enabled=True,
                music_volume=0.25
            )
            db.add(prefs)

            # Goals
            goal1 = Goal(
                user_id=demo_user.id,
                title="Close $1.5M Seed Round for AI Platform",
                description="Secure lead venture investor and finalize subscription terms.",
                category="Startup",
                target_date=datetime.now(timezone.utc) + timedelta(days=45),
                is_completed=False,
                progress_percentage=65.0
            )
            goal2 = Goal(
                user_id=demo_user.id,
                title="Master 10K Running Pace",
                description="Run sub-45 minute 10K for endurance and mental clarity.",
                category="Fitness",
                target_date=datetime.now(timezone.utc) + timedelta(days=30),
                is_completed=False,
                progress_percentage=40.0
            )
            db.add_all([goal1, goal2])
            db.flush()

            # Tasks
            now = datetime.now(timezone.utc)
            t1 = Task(
                user_id=demo_user.id,
                goal_id=goal1.id,
                title="Send updated pitch deck with Q3 ARR metrics",
                description="Include 140% net revenue retention figures.",
                priority="urgent",
                status="completed",
                completed_at=now - timedelta(hours=3),
                due_date=now + timedelta(hours=2),
                xp_reward=100
            )
            t2 = Task(
                user_id=demo_user.id,
                goal_id=goal1.id,
                title="Conduct partner technical due-diligence call",
                description="Review security posture and database architecture.",
                priority="high",
                status="completed",
                completed_at=now - timedelta(hours=1),
                due_date=now + timedelta(hours=4),
                xp_reward=80
            )
            t3 = Task(
                user_id=demo_user.id,
                goal_id=goal2.id,
                title="5-mile interval sprint workout",
                description="Track heart rate and maintain tempo.",
                priority="medium",
                status="pending",
                due_date=now + timedelta(hours=5),
                xp_reward=50
            )
            db.add_all([t1, t2, t3])
            db.flush()

            # Series
            avatar = db.query(Avatar).filter(Avatar.name == "Cary Woods").first()
            series = Series(
                user_id=demo_user.id,
                avatar_id=avatar.id if avatar else None,
                title="Ascent: The Cary Woods Story",
                genre="romantic_comedy",
                long_term_purpose="Build a category-defining AI enterprise while maintaining heart and balance",
                current_season=1,
                current_episode_number=0,
                narrative_state={
                    "allies": ["Marcus Vance (Lead Engineer)", "Elena (Angel Investor)"],
                    "rivals": ["Apex Venture Capital"],
                    "unresolved_threads": ["The midnight European term-sheet proposal"],
                },
                status="active"
            )
            db.add(series)
            db.commit()
            print("[Seed] Created demo user with goals, tasks, and active series.")

            # Generate first demo episode
            print("[Seed] Generating initial demo episode with FFmpeg multimedia assembly...")
            story_service = StoryService(db)
            loop = asyncio.get_event_loop()
            loop.run_until_complete(
                story_service.generate_episode(
                    user_id=demo_user.id,
                    request=EpisodeGenerateRequest(series_id=series.id, format="video"),
                    sync_generation=True
                )
            )
            print("[Seed] Initial demo episode generated successfully!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
