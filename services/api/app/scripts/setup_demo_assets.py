import os
import shutil

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.."))
STORAGE_DIR = os.path.join(BASE_DIR, "storage")
DEMO_STORAGE = os.path.join(STORAGE_DIR, "demo")
WEB_PUBLIC_DEMO = os.path.join(BASE_DIR, "apps/web/public/demo")

# Find available real master.mp4 files
source_episodes_dir = os.path.join(STORAGE_DIR, "episodes")
available_mp4s = []
if os.path.exists(source_episodes_dir):
    for root, dirs, files in os.walk(source_episodes_dir):
        for f in files:
            if f.endswith(".mp4"):
                available_mp4s.append(os.path.join(root, f))

print(f"Found {len(available_mp4s)} source MP4 videos.")
primary_mp4 = available_mp4s[0] if available_mp4s else None

characters = ["cary", "meera", "aarav", "ananya", "riya", "arjun"]
slots = ["episode-a.mp4", "episode-b.mp4"]

for char in characters:
    for day in range(1, 6):
        day_str = f"day-0{day}"
        storage_day_dir = os.path.join(DEMO_STORAGE, char, day_str)
        web_day_dir = os.path.join(WEB_PUBLIC_DEMO, char, day_str)
        os.makedirs(storage_day_dir, exist_ok=True)
        os.makedirs(web_day_dir, exist_ok=True)
        
        for slot in slots:
            target_storage = os.path.join(storage_day_dir, slot)
            target_web = os.path.join(web_day_dir, slot)
            
            # If we have a primary mp4, copy it to target
            if primary_mp4 and not os.path.exists(target_storage):
                shutil.copyfile(primary_mp4, target_storage)
            if primary_mp4 and not os.path.exists(target_web):
                shutil.copyfile(primary_mp4, target_web)

print("Demo media assets setup completed successfully!")
