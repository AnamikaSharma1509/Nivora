import os
import json
import httpx
from typing import Optional
from app.core.config import settings
from app.providers.base import (
    BaseStoryProvider, BaseImageProvider, BaseTTSProvider,
    StoryContext, EpisodeScript
)
from app.providers.mock_provider import MockStoryProvider, MockImageProvider, MockTTSProvider

class OpenAIScriptProvider(BaseStoryProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.mock_fallback = MockStoryProvider()

    async def generate_episode_script(self, context: StoryContext) -> EpisodeScript:
        if not self.api_key or self.api_key.startswith("placeholder"):
            return await self.mock_fallback.generate_episode_script(context)

        system_prompt = (
            "You are the master narrative architect for 'Your Life, Your Series', an episodic TV production "
            "where a user's digital alter-ego stars in a gripping web series reflecting their daily real-world productivity.\n"
            "Generate a structured script with 3-4 scenes for an episode lasting approx 60-90 seconds.\n"
            "STRICT RULES:\n"
            "1. Celebrate completed tasks as narrative triumphs and breakthroughs.\n"
            "2. Adapt missed tasks as constructive narrative plot hurdles, comedic complications, or ticking clocks. NEVER shame, humiliate, or demoralize the user.\n"
            "3. Maintain character continuity from previous episodes.\n"
            "4. Return strictly valid JSON adhering to the required schema."
        )

        user_content = {
            "character": {
                "name": context.character_name,
                "archetype": context.character_archetype,
                "traits": context.character_traits,
                "visual_attributes": context.character_visual_attributes,
            },
            "genre": context.genre,
            "long_term_purpose": context.long_term_purpose,
            "episode_number": context.current_episode_number,
            "completed_tasks": context.completed_tasks,
            "missed_tasks": context.missed_tasks,
            "prior_narrative_state": context.prior_narrative_state,
            "additional_notes": context.additional_notes,
        }

        schema = {
            "type": "object",
            "properties": {
                "episode_title": {"type": "string"},
                "opening_hook": {"type": "string"},
                "scenes": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "scene_number": {"type": "integer"},
                            "title": {"type": "string"},
                            "visual_description": {"type": "string"},
                            "image_prompt": {"type": "string"},
                            "narration": {"type": "string"},
                            "dialogue": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "speaker": {"type": "string"},
                                        "line": {"type": "string"}
                                    },
                                    "required": ["speaker", "line"]
                                }
                            },
                            "mood": {"type": "string"},
                            "duration_seconds": {"type": "number"}
                        },
                        "required": ["scene_number", "title", "visual_description", "image_prompt", "narration", "dialogue", "mood", "duration_seconds"]
                    }
                },
                "cliffhanger": {"type": "string"},
                "summary": {"type": "string"},
                "narrative_updates": {
                    "type": "object",
                    "properties": {
                        "new_allies": {"type": "array", "items": {"type": "string"}},
                        "new_rivals": {"type": "array", "items": {"type": "string"}},
                        "unresolved_threads": {"type": "array", "items": {"type": "string"}},
                        "milestone_unlocked": {"type": "string"}
                    },
                    "required": ["new_allies", "new_rivals", "unresolved_threads"]
                }
            },
            "required": ["episode_title", "opening_hook", "scenes", "cliffhanger", "summary", "narrative_updates"]
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": settings.STORY_MODEL,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": json.dumps(user_content)}
                        ],
                        "response_format": {"type": "json_object"}
                    }
                )
                res.raise_for_status()
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                return EpisodeScript(**parsed)
        except Exception:
            # Safe recovery: fallback to deterministic engine
            return await self.mock_fallback.generate_episode_script(context)


class OpenAIImageProvider(BaseImageProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.mock_fallback = MockImageProvider()

    async def generate_scene_image(
        self,
        prompt: str,
        character_reference: Optional[str] = None,
        style_genre: str = "cinematic",
        output_path: Optional[str] = None
    ) -> str:
        if not self.api_key or self.api_key.startswith("placeholder"):
            return await self.mock_fallback.generate_scene_image(prompt, character_reference, style_genre, output_path)

        if not output_path:
            import tempfile
            output_path = os.path.join(tempfile.gettempdir(), f"openai_img_{os.urandom(4).hex()}.png")

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/images/generations",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": settings.IMAGE_MODEL or "dall-e-3",
                        "prompt": f"{prompt}. Cinematic 16:9 widescreen composition, rich lighting, photorealistic production value.",
                        "n": 1,
                        "size": "1792x1024",
                        "response_format": "url"
                    }
                )
                res.raise_for_status()
                img_url = res.json()["data"][0]["url"]
                
                # Download and save locally
                dl_res = await client.get(img_url)
                dl_res.raise_for_status()
                with open(output_path, "wb") as f:
                    f.write(dl_res.content)
                return output_path
        except Exception:
            return await self.mock_fallback.generate_scene_image(prompt, character_reference, style_genre, output_path)


class OpenAITTSProvider(BaseTTSProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.mock_fallback = MockTTSProvider()

    async def generate_narration_audio(
        self,
        text: str,
        voice: str = "alloy",
        output_path: Optional[str] = None
    ) -> str:
        if not self.api_key or self.api_key.startswith("placeholder"):
            return await self.mock_fallback.generate_narration_audio(text, voice, output_path)

        if not output_path:
            import tempfile
            output_path = os.path.join(tempfile.gettempdir(), f"openai_tts_{os.urandom(4).hex()}.mp3")

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(
                    "https://api.openai.com/v1/audio/speech",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": "tts-1",
                        "input": text,
                        "voice": voice or settings.TTS_VOICE or "alloy",
                    }
                )
                res.raise_for_status()
                with open(output_path, "wb") as f:
                    f.write(res.content)
                return output_path
        except Exception:
            return await self.mock_fallback.generate_narration_audio(text, voice, output_path)
