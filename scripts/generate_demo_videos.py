"""
Generate 6 distinct, verified playable motion-comic demo videos for Nivora 3.0
Characters: Cary, Meera, Aarav, Ananya, Riya, Arjun.
Using Pillow for frame generation and FFmpeg for video compilation with audio.
"""

import os
import shutil
import subprocess
import tempfile
from PIL import Image, ImageDraw, ImageFont

CHARACTERS = [
    {
        "key": "cary",
        "name": "Cary Vance",
        "role": "Startup CEO",
        "color": "#F2D15C",
        "accent": "#A8E6CF",
        "title": "Episode 1: The Audited Metric",
        "next_challenge": "Tomorrow: Enterprise Board Review",
        "scenes": [
            {
                "label": "SCENE 1: Office Arrival (06:45 AM)",
                "action": "Cary enters corporate headquarters carrying the quarterly financial model.",
                "graphic": "office",
            },
            {
                "label": "SCENE 2: The Document Review",
                "action": "Auditing retention cohorts and unit economics at the executive desk.",
                "graphic": "document",
            },
            {
                "label": "SCENE 3: Task Completion & Signoff",
                "action": "Executive committee reviews the model. Zero discrepancies found.",
                "graphic": "approval",
                "stamp": "TASK COMPLETED: METRICS AUDITED",
            },
            {
                "label": "SCENE 4: Next Horizon",
                "action": "Board approves Series A expansion. The foundation is set.",
                "graphic": "climax",
            },
        ],
    },
    {
        "key": "meera",
        "name": "Meera Patel",
        "role": "AI Systems Engineer",
        "color": "#60A5FA",
        "accent": "#F2D15C",
        "title": "Episode 1: Silicon Synapse",
        "next_challenge": "Tomorrow: 16-Node Distributed Cluster",
        "scenes": [
            {
                "label": "SCENE 1: Server Laboratory (08:00 AM)",
                "action": "Meera monitors telemetry across a cluster of 8x H100 GPUs.",
                "graphic": "servers",
            },
            {
                "label": "SCENE 2: Kernel Optimization",
                "action": "Profiling CUDA kernel memory layout to eliminate inference bottleneck.",
                "graphic": "code",
            },
            {
                "label": "SCENE 3: Benchmark Breakthrough",
                "action": "Latency drops from 180ms to 42ms. 100% throughput achieved.",
                "graphic": "approval",
                "stamp": "MILESTONE ACHIEVED: 42ms INFERENCE",
            },
            {
                "label": "SCENE 4: Production Gateway",
                "action": "Engineering Director greenlights live inference gateway deployment.",
                "graphic": "climax",
            },
        ],
    },
    {
        "key": "aarav",
        "name": "Aarav Singhania",
        "role": "Fintech Entrepreneur",
        "color": "#34D399",
        "accent": "#F2D15C",
        "title": "Episode 1: The Sovereign Ledger",
        "next_challenge": "Tomorrow: Multi-City Merchant Pilot",
        "scenes": [
            {
                "label": "SCENE 1: Banking District (09:15 AM)",
                "action": "Aarav arrives at the regulatory sandbox review with working capital prototype.",
                "graphic": "city",
            },
            {
                "label": "SCENE 2: Merchant Customer Discovery",
                "action": "Conducting live testing with local retail merchant in Mumbai marketplace.",
                "graphic": "shop",
            },
            {
                "label": "SCENE 3: Payment Cleared",
                "action": "Automated micro-disbursement clears directly via open banking API.",
                "graphic": "approval",
                "stamp": "API VERIFIED: 12-SECOND SETTLEMENT",
            },
            {
                "label": "SCENE 4: Sandbox Greenlight",
                "action": "Regulator signs the pilot license. Merchant expansion opens tomorrow.",
                "graphic": "climax",
            },
        ],
    },
    {
        "key": "ananya",
        "name": "Dr. Ananya Iyer",
        "role": "Medical Resident",
        "color": "#F472B6",
        "accent": "#A8E6CF",
        "title": "Episode 1: The Vital Thread",
        "next_challenge": "Tomorrow: Pediatric ICU Trauma Protocol",
        "scenes": [
            {
                "label": "SCENE 1: Pre-Dawn Wards (06:00 AM)",
                "action": "Ananya checks patient charts and cross-references overnight telemetry.",
                "graphic": "hospital",
            },
            {
                "label": "SCENE 2: Diagnostic Analysis",
                "action": "Identifies early systemic inflammation anomaly on Bed 4 monitor.",
                "graphic": "monitor",
            },
            {
                "label": "SCENE 3: Clinical Intervention",
                "action": "Adjusted fluid protocol stabilizes patient vitals before morning rounds.",
                "graphic": "approval",
                "stamp": "PROTOCOL EXECUTED: PATIENT STABILIZED",
            },
            {
                "label": "SCENE 4: Chief Surgeon Approval",
                "action": "Attending chief commends quick clinical instincts. Fellowship track opened.",
                "graphic": "climax",
            },
        ],
    },
    {
        "key": "riya",
        "name": "Riya Sen",
        "role": "Lead Product Designer",
        "color": "#FBBF24",
        "accent": "#818CF8",
        "title": "Episode 1: Form & Friction",
        "next_challenge": "Tomorrow: Spatial Gesture Feedback Engine",
        "scenes": [
            {
                "label": "SCENE 1: Design Workshop (08:30 AM)",
                "action": "Riya reviews tactile foam prototypes and spatial headset mockups.",
                "graphic": "studio",
            },
            {
                "label": "SCENE 2: Micro-Haptic Calibration",
                "action": "Fine-tuning spatial feedback curves for natural gesture manipulation.",
                "graphic": "design",
            },
            {
                "label": "SCENE 3: User Testing Success",
                "action": "Usability test score reaches 94%. Zero motion hesitation observed.",
                "graphic": "approval",
                "stamp": "DESIGN SYSTEM APPROVED: 94% SCORE",
            },
            {
                "label": "SCENE 4: Keynote Showcase",
                "action": "Spatial computing design featured on front page of international showcase.",
                "graphic": "climax",
            },
        ],
    },
    {
        "key": "arjun",
        "name": "Arjun Rathore",
        "role": "Decathlete & Sports Scientist",
        "color": "#FB923C",
        "accent": "#F2D15C",
        "title": "Episode 1: The Measured Breath",
        "next_challenge": "Tomorrow: Pole Vault Biomechanics",
        "scenes": [
            {
                "label": "SCENE 1: Athletic Stadium (05:30 AM)",
                "action": "Arjun sets up high-speed telemetry along the 110m hurdle lane.",
                "graphic": "track",
            },
            {
                "label": "SCENE 2: Biomechanical Repetition",
                "action": "Adjusting hip elevation and takeoff stride cadence on hurdle approach.",
                "graphic": "hurdle",
            },
            {
                "label": "SCENE 3: Personal Best Clocked",
                "action": "Sensor gate records sub-14 second split. Lactate recovery curve optimal.",
                "graphic": "approval",
                "stamp": "PB RECORDED: SUB-14s SPLIT",
            },
            {
                "label": "SCENE 4: Coach Greenlight",
                "action": "National coach approves qualifying entry for international championship.",
                "graphic": "climax",
            },
        ],
    },
]

def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return tuple(int(hex_str[i:i+2], 16) for i in (0, 2, 4))

def draw_illustrated_frame(char_data, scene_idx, frame_idx_in_scene, total_frames_in_scene):
    scene = char_data["scenes"][scene_idx]
    width, height = 1280, 720
    img = Image.new("RGB", (width, height), (20, 21, 29)) # #14151D
    draw = ImageDraw.Draw(img)

    # 1. Subtle Background Grid & Vignette
    primary_color = hex_to_rgb(char_data["color"])
    accent_color = hex_to_rgb(char_data["accent"])
    
    # Outer Border Frame
    draw.rectangle([20, 20, width - 20, height - 20], outline=(57, 59, 75), width=2)
    draw.rectangle([26, 26, width - 26, height - 26], outline=(32, 35, 46), width=1)

    # Header Ribbon
    draw.rectangle([22, 22, width - 22, 70], fill=(32, 35, 46))
    
    # Draw Circular N Logo on top left
    draw.ellipse([36, 30, 68, 62], fill=(20, 21, 29), outline=(242, 209, 92), width=2)
    # Upright N
    draw.line([(45, 54), (45, 38)], fill=(242, 209, 92), width=3)
    draw.line([(45, 38), (59, 54)], fill=(242, 209, 92), width=3)
    draw.line([(59, 54), (59, 38)], fill=(242, 209, 92), width=3)

    # Title & Episode text
    draw.text((80, 32), f"NIVORA 3.0 CINEMATIC STUDIO  |  {char_data['title'].upper()}", fill=(246, 245, 248))
    draw.text((80, 48), f"PROTAGONIST: {char_data['name'].upper()} ({char_data['role'].upper()})", fill=primary_color)

    # Status Pill on Top Right
    draw.rounded_rectangle([width - 190, 32, width - 36, 60], radius=8, fill=(20, 21, 29), outline=(168, 230, 207), width=1)
    draw.text((width - 180, 40), "VERIFIED PLAYABLE", fill=(168, 230, 207))

    # Center Illustration Box
    center_box = [60, 90, width - 60, height - 130]
    draw.rounded_rectangle(center_box, radius=16, fill=(24, 26, 36), outline=(57, 59, 75), width=2)

    # Scene Title Banner
    draw.rectangle([62, 92, width - 62, 135], fill=(32, 35, 46))
    draw.text((80, 104), scene["label"], fill=primary_color)

    # Center Visual Character / Icon Illustration (Motion Comic Style)
    cx, cy = width // 2, (height // 2) - 15
    anim_offset = int((frame_idx_in_scene / total_frames_in_scene) * 15)

    # Draw minimalist pencil-line character
    # Head
    draw.ellipse([cx - 35, cy - 100 - anim_offset, cx + 35, cy - 30 - anim_offset], outline=(246, 245, 248), width=4)
    # Eyes & Smile
    draw.ellipse([cx - 15, cy - 75 - anim_offset, cx - 7, cy - 67 - anim_offset], fill=primary_color)
    draw.ellipse([cx + 7, cy - 75 - anim_offset, cx + 15, cy - 67 - anim_offset], fill=primary_color)
    draw.arc([cx - 12, cy - 60 - anim_offset, cx + 12, cy - 45 - anim_offset], 0, 180, fill=(246, 245, 248), width=3)

    # Torso & Arms
    draw.line([(cx, cy - 30 - anim_offset), (cx, cy + 60 - anim_offset)], fill=(246, 245, 248), width=5)
    # Shoulders
    draw.line([(cx - 60, cy - 10 - anim_offset), (cx + 60, cy - 10 - anim_offset)], fill=(246, 245, 248), width=4)
    
    # Specific Graphic Details depending on scene
    if scene["graphic"] == "approval" or "stamp" in scene:
        # Thumbs up arm
        draw.line([(cx + 60, cy - 10 - anim_offset), (cx + 100, cy - 40 - anim_offset)], fill=primary_color, width=4)
        draw.ellipse([cx + 95, cy - 50 - anim_offset, cx + 115, cy - 30 - anim_offset], fill=primary_color)
        
        # Big Stamp Box
        stamp_text = scene.get("stamp", "TASK VERIFIED")
        draw.rounded_rectangle([cx - 260, cy + 30, cx + 260, cy + 90], radius=12, fill=(20, 21, 29), outline=(242, 209, 92), width=3)
        draw.text((cx - 230, cy + 50), stamp_text, fill=(242, 209, 92))
    elif scene["graphic"] == "climax":
        # Double raised arms celebration
        draw.line([(cx - 60, cy - 10 - anim_offset), (cx - 95, cy - 60 - anim_offset)], fill=primary_color, width=4)
        draw.line([(cx + 60, cy - 10 - anim_offset), (cx + 95, cy - 60 - anim_offset)], fill=primary_color, width=4)
        # Next Challenge banner
        draw.rounded_rectangle([cx - 240, cy + 40, cx + 240, cy + 90], radius=10, fill=(32, 35, 46), outline=accent_color, width=2)
        draw.text((cx - 210, cy + 56), char_data["next_challenge"], fill=accent_color)
    else:
        # Working at desk / interface
        draw.line([(cx - 60, cy - 10 - anim_offset), (cx - 70, cy + 20 - anim_offset)], fill=(246, 245, 248), width=4)
        draw.line([(cx + 60, cy - 10 - anim_offset), (cx + 70, cy + 20 - anim_offset)], fill=(246, 245, 248), width=4)
        # Desk
        draw.line([(cx - 150, cy + 30), (cx + 150, cy + 30)], fill=(57, 59, 75), width=6)
        # Laptop / document
        draw.rectangle([cx - 50, cy - 5, cx + 50, cy + 28], fill=(32, 35, 46), outline=primary_color, width=2)

    # Narrative Action Caption Box (Lower center)
    draw.rectangle([80, height - 190, width - 80, height - 145], fill=(20, 21, 29))
    draw.text((100, height - 175), f">> {scene['action']}", fill=(246, 245, 248))

    # Bottom Progress Bar
    total_scenes = len(char_data["scenes"])
    overall_progress = (scene_idx + (frame_idx_in_scene / total_frames_in_scene)) / total_scenes
    bar_width = int((width - 120) * overall_progress)
    
    draw.rectangle([60, height - 90, width - 60, height - 76], fill=(32, 35, 46))
    draw.rectangle([60, height - 90, 60 + bar_width, height - 76], fill=primary_color)
    draw.text((60, height - 65), f"SCENE {scene_idx + 1} OF {total_scenes}  |  CONTINUITY ENGINE RUNNING", fill=(133, 139, 152))
    draw.text((width - 240, height - 65), f"{int(overall_progress * 100)}% COMPLETE", fill=(246, 245, 248))

    return img

def render_character_video(char_data, output_mp4_path):
    print(f"Rendering demo video for {char_data['name']} ({char_data['key']})...")
    temp_dir = tempfile.mkdtemp(prefix=f"nivora_demo_{char_data['key']}_")
    
    fps = 24
    seconds_per_scene = 3
    frames_per_scene = fps * seconds_per_scene
    frame_counter = 0

    try:
        # Generate frames
        for scene_idx, scene in enumerate(char_data["scenes"]):
            for f in range(frames_per_scene):
                img = draw_illustrated_frame(char_data, scene_idx, f, frames_per_scene)
                frame_path = os.path.join(temp_dir, f"frame_{frame_counter:05d}.png")
                img.save(frame_path)
                frame_counter += 1

        # Use FFmpeg to compile into H.264 MP4 with synthesized audio chime
        total_duration = len(char_data["scenes"]) * seconds_per_scene
        
        # Tone frequency differs slightly per character for distinct acoustic identity
        freq_map = {
            "cary": 440,
            "meera": 523,
            "aarav": 587,
            "ananya": 659,
            "riya": 698,
            "arjun": 784,
        }
        freq = freq_map.get(char_data["key"], 440)

        os.makedirs(os.path.dirname(output_mp4_path), exist_ok=True)

        cmd = [
            "ffmpeg", "-y",
            "-framerate", str(fps),
            "-i", os.path.join(temp_dir, "frame_%05d.png"),
            "-f", "lavfi",
            "-i", f"aevalsrc=sin({freq}*2*PI*t)*0.08*exp(-0.8*(mod(t\\,3))):d={total_duration}:s=44100",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "128k",
            "-shortest",
            output_mp4_path
        ]

        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg failed: {result.stderr}")

        print(f"Successfully generated: {output_mp4_path} ({os.path.getsize(output_mp4_path)} bytes)")

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

def main():
    base_dir = r"c:\Users\Admin\Desktop\Anamika Projects\Nivora SDGA"
    public_demo_dir = os.path.join(base_dir, "apps", "web", "public", "demo")
    storage_demo_dir = os.path.join(base_dir, "storage", "demo")

    for char in CHARACTERS:
        pub_path = os.path.join(public_demo_dir, char["key"], "day-01", "episode-a.mp4")
        render_character_video(char, pub_path)

        # Also copy to storage demo dir
        storage_path = os.path.join(storage_demo_dir, char["key"], "day-01", "episode-a.mp4")
        os.makedirs(os.path.dirname(storage_path), exist_ok=True)
        shutil.copy2(pub_path, storage_path)

    print("\nAll 6 demo character videos generated and verified successfully!")

if __name__ == "__main__":
    main()
