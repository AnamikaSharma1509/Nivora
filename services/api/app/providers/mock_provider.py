import os
import math
import struct
import wave
from typing import Optional, List, Dict, Any
from PIL import Image, ImageDraw, ImageFont
from app.providers.base import (
    BaseStoryProvider, BaseImageProvider, BaseTTSProvider,
    StoryContext, EpisodeScript, SceneScript, NarrativeUpdates
)

class MockStoryProvider(BaseStoryProvider):
    async def generate_episode_script(self, context: StoryContext) -> EpisodeScript:
        char_name = context.character_name or "Alex"
        genre = context.genre.lower()
        
        completed_count = len(context.completed_tasks)
        missed_count = len(context.missed_tasks)
        
        # Genre specific thematic tone
        genre_hooks = {
            "romantic_comedy": f"Just when {char_name}'s daily schedule seemed completely under control, an accidental coffee spill across an investor's contract changes everything...",
            "thriller": f"The encrypted message arrives at 11:42 PM. {char_name} knows tonight's deadlines were only the beginning of a much larger conspiracy...",
            "slice_of_life": f"The golden afternoon light streams into the studio. {char_name} takes a deep breath, reflecting on the small victories and quiet hurdles of the day...",
            "anime_adventure": f"With neon sparks crackling along the horizon, {char_name} awakens a latent spark of ambition to face the rival syndicate...",
            "scifi": f"Quantum telemetry confirms the breakthrough. But as {char_name} recalibrates the orbital relay, an anomalous signal emerges from sector 4...",
            "fantasy": f"The ancient guild ledger glows with azure runes. {char_name} completes the required quest rites, yet a whispered prophecy remains unfulfilled..."
        }
        
        hook = genre_hooks.get(genre, f"Another pivotal day in {char_name}'s journey unfolds with unexpected twists.")
        
        completed_titles = [t.get("title", "critical task") for t in context.completed_tasks]
        missed_titles = [t.get("title", "pending task") for t in context.missed_tasks]
        
        # Build 3-4 structured scenes reflecting task outcomes
        scenes: List[SceneScript] = []
        
        # Scene 1: The Morning Kickoff / Strategic Opening
        scenes.append(SceneScript(
            scene_number=1,
            title=f"Dawn of Ambition: {char_name}'s Strategy",
            visual_description=f"Wide cinematic shot of {char_name} in an elevated studio overlooking city sunrise, reviewing digital schematics with focused determination.",
            image_prompt=f"Cinematic 16:9 photography, {context.character_visual_attributes}, sunrise golden hour casting long shadows in modern aesthetic office, confident expression, high production value.",
            narration=f"Every breakthrough starts in the quiet hours before dawn. For {char_name}, today wasn't merely about checking off boxes—it was about proving that vision translates into reality.",
            dialogue=[
                {"speaker": char_name, "line": "If we don't build this future today, someone else will define it for us."}
            ],
            mood="inspirational",
            duration_seconds=15.0
        ))
        
        # Scene 2: The Breakthrough (Reflecting completed tasks)
        if completed_titles:
            primary_win = completed_titles[0]
            narration_win = f"Focus turned into tangible victory when {char_name} tackled {primary_win}. The momentum shifted instantly, sending shockwaves of respect across the industry."
        else:
            narration_win = f"{char_name} pushed through the mounting resistance, refusing to let the day slip without making foundational moves."
            
        scenes.append(SceneScript(
            scene_number=2,
            title="The Decisive Breakthrough",
            visual_description=f"Mid-shot of {char_name} celebrating an undeniable breakthrough, team members exchanging triumphant glances amidst high-tech screens.",
            image_prompt=f"Dynamic 16:9 shot of {char_name}, {context.character_visual_attributes}, vibrant neon teal and violet glow, celebratory high-energy atmosphere, cinematic lighting.",
            narration=narration_win,
            dialogue=[
                {"speaker": char_name, "line": "Look at these metrics. We didn't just meet the benchmark—we rewrote the standard."}
            ],
            mood="triumphant",
            duration_seconds=15.0
        ))
        
        # Scene 3: The Complication / Narrative Challenge (Reflecting missed tasks without shaming)
        if missed_titles:
            challenge_task = missed_titles[0]
            narration_challenge = f"Yet no true ascent comes without a cost. Setting aside '{challenge_task}' created an unexpected ripple effect—a ticking clock that would test {char_name}'s ingenuity."
        else:
            narration_challenge = f"Even with flawless execution, a new competitor surfaced on the radar, eager to challenge {char_name}'s expanding influence."
            
        scenes.append(SceneScript(
            scene_number=3,
            title="The Pressure Wave",
            visual_description=f"Dramatic low-angle shot of {char_name} reacting to a sudden notification on an ultra-thin glass tablet, amber warning hues contrasting against dark velvet tones.",
            image_prompt=f"Dramatic 16:9 cinematography, {char_name}, {context.character_visual_attributes}, warm amber and deep cosmic indigo color grading, intense dramatic tension, photorealistic render.",
            narration=narration_challenge,
            dialogue=[
                {"speaker": char_name, "line": "We've solved harder puzzles than this before. We adapt, we improvise, and we overcome."}
            ],
            mood="tense",
            duration_seconds=15.0
        ))
        
        # Scene 4: The Cliffhanger / Forward Momentum
        scenes.append(SceneScript(
            scene_number=4,
            title="A Midnight Horizon",
            visual_description=f"Sweeping silhouette of {char_name} looking out toward the sparkling skyline under a midnight sky, phone buzzing with an unlisted international caller ID.",
            image_prompt=f"Breathtaking 16:9 landscape portrait, silhouette of {char_name} against a starry sky and illuminated metropolis, subtle gold and cyan highlights, cinematic bokeh, 4K resolution.",
            narration=f"Tomorrow brings an entirely new chapter. As the city hums below, {char_name} knows that the greatest challenges are simply the prelude to achieving the ultimate ambition: {context.long_term_purpose or 'mastery'}.",
            dialogue=[
                {"speaker": "Industry Ally", "line": f"We saw what you accomplished today, {char_name}. Tomorrow we elevate to the next level."}
            ],
            mood="cliffhanger",
            duration_seconds=15.0
        ))
        
        summary = (
            f"In Episode {context.current_episode_number}, {char_name} made tangible progress on "
            f"{', '.join(completed_titles[:2]) if completed_titles else 'foundational preparations'}, "
            f"navigating around the challenge of {missed_titles[0] if missed_titles else 'emerging obstacles'} toward {context.long_term_purpose or 'their goal'}."
        )
        
        cliffhanger = f"An unexpected opportunity opens for {char_name}—if tomorrow's priorities are executed with precision."
        
        # Distinct, personalized episode title based on episode number and activity
        titles_pool = [
            "The First Systems",
            "A Market Worth Understanding",
            "The Breakthrough Execution",
            "Turning Theory to Architecture",
            "Unlocking the Horizon",
            "Resilience Under Pressure",
            "The Competitive Shift",
            "Foundational Traction"
        ]
        title_idx = (context.current_episode_number - 1) % len(titles_pool)
        ep_name = titles_pool[title_idx]
        if completed_titles:
            short_task = completed_titles[0][:28]
            ep_title = f"Episode {context.current_episode_number}: {ep_name}"
        else:
            ep_title = f"Episode {context.current_episode_number}: {ep_name}"

        # 70%, 80%, and 100% Alternative Outcome Scripts
        branch_previews = {
            "branch_70": {
                "threshold": 70,
                "title": "70% Partial Momentum",
                "narrative": f"{char_name} maintains baseline stability, making progress on core concepts while leaving one complex task unresolved for tomorrow's sprint.",
                "potential_next_day": "Tomorrow opens with recovery protocols to clear the bottleneck before midday.",
                "goal_impact": "Maintains steady consistency without accelerating roadmap velocity."
            },
            "branch_80": {
                "threshold": 80,
                "title": "80% High Velocity",
                "narrative": f"{char_name} completes the overwhelming majority of planned missions, unlocking key insights and earning the respect of mentors.",
                "potential_next_day": "Tomorrow introduces an advanced milestone challenge that expands technical scope.",
                "goal_impact": "Directly advances the current roadmap milestone and triggers journey momentum bonus."
            },
            "branch_100": {
                "threshold": 100,
                "title": "100% Total Mastery",
                "narrative": f"Flawless execution. {char_name} conquers every single weighted task on the plan, establishing an undeniable benchmark of excellence.",
                "potential_next_day": "Tomorrow unlocks a major milestone review and introduces an unexpected high-stakes alliance.",
                "goal_impact": "Maximum milestone weight secured, elevating overall goal achievement progress."
            }
        }
        
        return EpisodeScript(
            episode_title=ep_title,
            opening_hook=hook,
            scenes=scenes,
            cliffhanger=cliffhanger,
            summary=summary,
            branch_previews=branch_previews,
            narrative_updates=NarrativeUpdates(
                new_allies=[f"Advisor {char_name[:3]}"],
                new_rivals=["The Incumbent Standard"],
                unresolved_threads=[f"Tomorrow's high-stakes priority execution"],
                milestone_unlocked="Series Debut Chapter" if context.current_episode_number == 1 else None
            )
        )


class MockImageProvider(BaseImageProvider):
    async def generate_scene_image(
        self,
        prompt: str,
        character_reference: Optional[str] = None,
        style_genre: str = "cinematic",
        output_path: Optional[str] = None
    ) -> str:
        """
        Generates a high-quality, rich cinematic 1280x720 canvas with geometric glow,
        harmonious colors (dark surface #14151D, gold #F2D15C, and steel blue #60A5FA),
        and crisp typography so FFmpeg can render real, pristine video.
        """
        if not output_path:
            import tempfile
            output_path = os.path.join(tempfile.gettempdir(), f"mock_scene_{os.urandom(4).hex()}.png")
            
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        
        width, height = 1280, 720
        img = Image.new("RGBA", (width, height), (43, 45, 66, 255))  # Cosmic Indigo #2B2D42
        draw = ImageDraw.Draw(img)
        
        # Render a rich cinematic gradient background
        for y in range(height):
            ratio = y / height
            r = int(43 * (1 - ratio) + 107 * ratio)   # 2B -> 6B (Velvet Plum)
            g = int(45 * (1 - ratio) + 59 * ratio)    # 2D -> 3B
            b = int(66 * (1 - ratio) + 122 * ratio)   # 42 -> 7A
            draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
            
        # Draw glowing ambient circles
        draw.ellipse([width - 400, -100, width + 200, 500], fill=(255, 107, 107, 45))  # Aurora Coral glow
        draw.ellipse([-100, height - 300, 500, height + 300], fill=(59, 173, 168, 40)) # Teal glow
        
        # Cinematic letterbox overlay
        draw.rectangle([60, 60, width - 60, height - 60], outline=(69, 70, 93, 180), width=2)
        
        # Banner badge
        draw.rounded_rectangle([90, 90, 420, 140], radius=12, fill=(25, 27, 45, 220), outline=(255, 107, 107, 200), width=1)
        draw.text((115, 105), "YOUR LIFE, YOUR SERIES • AI CINEMA", fill=(255, 179, 71, 255)) # Solar Amber
        
        # Scene text extract
        display_text = prompt[:90] + "..." if len(prompt) > 90 else prompt
        draw.rounded_rectangle([90, height - 170, width - 90, height - 90], radius=16, fill=(25, 27, 45, 240), outline=(69, 70, 93, 200))
        draw.text((120, height - 145), "SCENE VISUALIZATION", fill=(168, 230, 207, 255)) # Neo Mint
        draw.text((120, height - 120), display_text, fill=(247, 245, 250, 255)) # Soft White
        
        img.convert("RGB").save(output_path, "PNG")
        return output_path


class MockTTSProvider(BaseTTSProvider):
    async def generate_narration_audio(
        self,
        text: str,
        voice: str = "alloy",
        output_path: Optional[str] = None
    ) -> str:
        """
        Generates a valid, multi-frequency harmonious WAV audio file that matches
        the spoken duration of the text (approx 140 words per minute).
        """
        if not output_path:
            import tempfile
            output_path = os.path.join(tempfile.gettempdir(), f"mock_tts_{os.urandom(4).hex()}.wav")
            
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        
        # Estimate duration based on word count (minimum 5s, max 20s)
        words = len(text.split())
        duration_sec = max(5.0, min(20.0, words / 2.3))
        
        sample_rate = 44100
        num_samples = int(duration_sec * sample_rate)
        
        # Generate pleasant ambient chord tone
        freq1, freq2 = 220.0, 330.0  # A3 + E4
        
        with wave.open(output_path, "wb") as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            
            frames = bytearray()
            for i in range(num_samples):
                t = i / sample_rate
                # Subtle fade in / fade out envelope
                env = min(1.0, t / 0.8) * min(1.0, (duration_sec - t) / 0.8)
                val = 0.35 * math.sin(2 * math.pi * freq1 * t) + 0.25 * math.sin(2 * math.pi * freq2 * t)
                sample = int(val * env * 32767 * 0.4)
                frames.extend(struct.pack("<h", max(-32768, min(32767, sample))))
                
            wav_file.writeframes(frames)
            
        return output_path
