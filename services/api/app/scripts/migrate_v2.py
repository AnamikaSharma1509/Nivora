import sys
from app.core.database import engine
from sqlalchemy import text

statements = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;",
    "ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL;",
    "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 25;",
    "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Work';",
    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE;",
    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);",
    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS career VARCHAR(100);",
    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Technology and AI';",
    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS nationality VARCHAR(100) DEFAULT 'International';",
    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(50) DEFAULT 'English';",
    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS age_range VARCHAR(50) DEFAULT '25-35';",
    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS strengths JSON DEFAULT '[]'::json;",
    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS weaknesses JSON DEFAULT '[]'::json;",
    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS motivations JSON DEFAULT '[]'::json;",
    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS visual_style VARCHAR(100) DEFAULT 'Cinematic Photorealistic';",
    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS genre_preferences JSON DEFAULT '[]'::json;",
    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS story_preferences JSON DEFAULT '{}'::json;",
    "ALTER TABLE avatars ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE episodes ADD COLUMN IF NOT EXISTS day_number INTEGER DEFAULT 1;",
    "ALTER TABLE episodes ADD COLUMN IF NOT EXISTS episode_slot VARCHAR(10) DEFAULT 'A';",
    "ALTER TABLE episodes ADD COLUMN IF NOT EXISTS demo_character_key VARCHAR(50);",
    "ALTER TABLE episodes ADD COLUMN IF NOT EXISTS full_script TEXT;",
    "ALTER TABLE episodes ADD COLUMN IF NOT EXISTS branch_previews JSON DEFAULT '{}'::json;",
]

def run_migration():
    for stmt in statements:
        with engine.connect() as conn:
            try:
                conn.execute(text(stmt))
                conn.commit()
                print(f"Applied: {stmt.split()[2]} {stmt.split()[5] if len(stmt.split()) > 5 else ''}")
            except Exception as e:
                print(f"Error on {stmt}: {e}")

if __name__ == "__main__":
    run_migration()
    print("Migration finished.")
