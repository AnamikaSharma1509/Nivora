"""
Targeted cleanup script for Nivora 3.0:
Safely finds and deletes any test user associated with 'Anamika Sharma' or 'anamika'
without deleting other users or public demo series/avatars.
"""

import sys
import os

# Add services/api to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services", "api")))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User, UserPreference, Notification, UserAchievement
from app.models.productivity import Goal, Task, DailyPlan
from app.models.story import Series, Episode, Scene, GenerationJob, MediaAsset

def inspect_and_clean_test_users():
    db: Session = SessionLocal()
    try:
        print("=== NIVORA USER DATABASE INSPECTION ===")
        all_users = db.query(User).all()
        print(f"Total users found in database: {len(all_users)}")
        for u in all_users:
            print(f" - User ID: {u.id} | Email: {u.email} | Name: {u.display_name} | Created: {u.created_at}")

        # Find target test accounts
        target_users = [
            u for u in all_users
            if "anamika" in (u.email or "").lower() or "anamika" in (u.display_name or "").lower()
        ]

        if not target_users:
            print("\nNo user records found matching 'Anamika' or 'anamika'. Database is already clean of Anamika test data.")
            return

        print(f"\nFound {len(target_users)} test account(s) matching 'Anamika' to clean:")
        for target in target_users:
            print(f"--> Deleting user: {target.display_name} ({target.email}) [ID: {target.id}]")

            # Count associated records before deletion
            tasks_count = db.query(Task).filter(Task.user_id == target.id).count()
            goals_count = db.query(Goal).filter(Goal.user_id == target.id).count()
            plans_count = db.query(DailyPlan).filter(DailyPlan.user_id == target.id).count()
            series_count = db.query(Series).filter(Series.user_id == target.id).count()
            episodes_count = db.query(Episode).filter(Episode.user_id == target.id).count()

            print(f"    Cascading records: {tasks_count} tasks, {goals_count} goals, {plans_count} daily plans, {series_count} series, {episodes_count} episodes.")

            # SQLAlchemy cascade will delete related rows, but explicit delete ensures full FK integrity
            db.delete(target)
            db.commit()
            print(f"    Successfully removed test account {target.id} and all related entities.")

        print("\n=== CLEANUP VERIFICATION ===")
        remaining_users = db.query(User).all()
        print(f"Remaining users in database: {len(remaining_users)}")
        for u in remaining_users:
            print(f" - Remaining: {u.display_name} ({u.email})")

    except Exception as e:
        db.rollback()
        print(f"Error during cleanup: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    inspect_and_clean_test_users()
