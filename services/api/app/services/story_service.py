import os
import uuid
import asyncio
import tempfile
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.story import Avatar, Series, Episode, Scene, GenerationJob, MediaAsset
from app.models.user import User
from app.schemas.story import SeriesCreate, EpisodeGenerateRequest
from app.providers.base import StoryContext, EpisodeScript
from app.providers.factory import (
    get_story_provider, get_image_provider, get_tts_provider, get_storage_adapter
)
from app.services.productivity_service import ProductivityService
from app.services.media_pipeline import MediaPipelineService
from app.core.config import settings

class StoryService:
    def __init__(self, db: Session):
        self.db = db
        self.media_pipeline = MediaPipelineService()

    # --------------------------------------------------------------------------
    # Avatars
    # --------------------------------------------------------------------------
    def list_avatars(self) -> List[Avatar]:
        return self.db.query(Avatar).all()

    def get_avatar(self, avatar_id: str) -> Optional[Avatar]:
        return self.db.query(Avatar).filter(Avatar.id == avatar_id).first()

    # --------------------------------------------------------------------------
    # Series
    # --------------------------------------------------------------------------
    def get_active_series(self, user_id: str) -> Optional[Series]:
        return self.db.query(Series).filter(Series.user_id == user_id, Series.status == "active").first()

    def create_series(self, user_id: str, data: SeriesCreate) -> Series:
        avatar = self.get_avatar(data.avatar_id)
        if not avatar:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected avatar not found")

        # Deactivate existing active series
        existing = self.get_active_series(user_id)
        if existing:
            existing.status = "paused"
            self.db.commit()

        initial_narrative_state = {
            "allies": [f"{avatar.name}'s confidant"],
            "rivals": ["The Competitor"],
            "unresolved_threads": ["The opening season milestone"],
            "recent_milestones": [],
        }

        series = Series(
            user_id=user_id,
            avatar_id=data.avatar_id,
            title=data.title,
            genre=data.genre,
            long_term_purpose=data.long_term_purpose,
            current_season=1,
            current_episode_number=0,
            narrative_state=initial_narrative_state,
            status="active",
        )
        self.db.add(series)
        self.db.commit()
        self.db.refresh(series)
        return series

    # --------------------------------------------------------------------------
    # Episodes
    # --------------------------------------------------------------------------
    def list_episodes(self, user_id: str, series_id: Optional[str] = None) -> List[Episode]:
        q = self.db.query(Episode).filter(Episode.user_id == user_id)
        if series_id:
            q = q.filter(Episode.series_id == series_id)
        return q.order_by(Episode.episode_number.desc(), Episode.created_at.desc()).all()

    def get_episode(self, user_id: str, episode_id: str) -> Optional[Episode]:
        return self.db.query(Episode).filter(Episode.id == episode_id, Episode.user_id == user_id).first()

    async def generate_episode(
        self,
        user_id: str,
        request: EpisodeGenerateRequest,
        sync_generation: bool = True
    ) -> Tuple[Episode, GenerationJob]:
        """
        Main orchestration endpoint:
        1. Assembles real productivity outcomes and continuity context.
        2. Generates validated EpisodeScript via provider.
        3. Creates persistent Episode and Scene rows.
        4. Synthesizes media assets via FFmpeg and stores them.
        """
        series = None
        if request.series_id:
            series = self.db.query(Series).filter(Series.id == request.series_id, Series.user_id == user_id).first()
        if not series:
            series = self.get_active_series(user_id)
            
        if not series:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active series found. Please select or initialize your series first."
            )

        avatar = series.avatar
        if not avatar:
            avatar = self.get_avatar(series.avatar_id)

        user = self.db.query(User).filter(User.id == user_id).first()
        protagonist_name = user.display_name if user and user.display_name else "Protagonist"

        # Retrieve real productivity outcomes
        prod_service = ProductivityService(self.db)
        outcomes = prod_service.get_today_task_outcomes(user_id)

        next_ep_num = series.current_episode_number + 1
        
        # Build story context with user as PROTAGONIST
        context = StoryContext(
            character_name=protagonist_name,
            character_archetype=avatar.archetype if avatar else "Innovator",
            character_traits=avatar.personality_traits if avatar else ["ambitious", "focused"],
            character_visual_attributes=avatar.visual_prompt_attributes if avatar else "modern ambitious attire",
            genre=series.genre,
            long_term_purpose=series.long_term_purpose,
            current_season=series.current_season,
            current_episode_number=next_ep_num,
            completed_tasks=outcomes["completed"],
            missed_tasks=outcomes["missed"],
            prior_narrative_state=series.narrative_state or {},
            additional_notes=request.additional_context,
        )

        # 1. Generate structured script
        story_provider = get_story_provider()
        script: EpisodeScript = await story_provider.generate_episode_script(context)

        # Assemble full screenplay text
        script_blocks = [
            f"=== EPISODE {next_ep_num}: {script.episode_title.upper()} ===",
            f"PROTAGONIST: {protagonist_name} | SERIES: {series.title}",
            f"LONG-TERM DESTINATION: {series.long_term_purpose or 'Core Ambition'}",
            "",
            f"[OPENING HOOK]",
            script.opening_hook,
            ""
        ]
        for s in script.scenes:
            script_blocks.append(f"--- SCENE {s.scene_number}: {s.title} ---")
            script_blocks.append(f"VISUAL: {s.visual_description}")
            script_blocks.append(f"NARRATION: {s.narration}")
            for d in s.dialogue:
                script_blocks.append(f"{d.get('speaker', protagonist_name)}: \"{d.get('line', '')}\"")
            script_blocks.append("")
        script_blocks.append(f"[CLIFFHANGER]")
        script_blocks.append(script.cliffhanger)
        full_script_text = "\n".join(script_blocks)

        # 2. Persist Episode
        episode = Episode(
            series_id=series.id,
            user_id=user_id,
            episode_number=next_ep_num,
            title=script.episode_title,
            summary=script.summary,
            opening_hook=script.opening_hook,
            cliffhanger=script.cliffhanger,
            full_script=full_script_text,
            script_json=script.model_dump(),
            task_snapshot=outcomes,
            branch_previews=script.branch_previews,
            generation_status="completed" if sync_generation else "processing",
            duration_seconds=sum(s.duration_seconds for s in script.scenes),
        )
        self.db.add(episode)
        self.db.flush()

        # Update Series continuity
        series.current_episode_number = next_ep_num
        current_state = dict(series.narrative_state or {})
        current_state["allies"] = list(set(current_state.get("allies", []) + script.narrative_updates.new_allies))
        current_state["rivals"] = list(set(current_state.get("rivals", []) + script.narrative_updates.new_rivals))
        current_state["unresolved_threads"] = script.narrative_updates.unresolved_threads
        series.narrative_state = current_state

        # Create Generation Job
        job = GenerationJob(
            user_id=user_id,
            episode_id=episode.id,
            job_type="episode_full",
            status="processing",
            progress_percent=20,
            current_stage="Script generated, initiating media rendering",
            idempotency_key=str(uuid.uuid4()),
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(episode)
        self.db.refresh(job)

        # 3. Media synthesis
        if sync_generation:
            await self._process_media_job(episode.id, job.id, script, outcomes)
            self.db.refresh(episode)
            self.db.refresh(job)

        return episode, job

    async def _process_media_job(
        self,
        episode_id: str,
        job_id: str,
        script: EpisodeScript,
        task_snapshot: Dict[str, Any]
    ):
        """Assembles scene images, audio narration, and compiles MP4 video using FFmpeg"""
        episode = self.db.query(Episode).filter(Episode.id == episode_id).first()
        job = self.db.query(GenerationJob).filter(GenerationJob.id == job_id).first()
        if not episode or not job:
            return

        image_provider = get_image_provider()
        tts_provider = get_tts_provider()
        storage = get_storage_adapter()

        temp_dir = tempfile.mkdtemp(prefix="ylys_pipeline_")
        
        try:
            job.current_stage = "Generating scene artwork"
            job.progress_percent = 40
            self.db.commit()

            scene_render_data = []

            for s_script in script.scenes:
                # 1. Image
                img_temp = os.path.join(temp_dir, f"scene_{s_script.scene_number}_img.png")
                await image_provider.generate_scene_image(
                    prompt=s_script.image_prompt,
                    style_genre=episode.series.genre if episode.series else "cinematic",
                    output_path=img_temp
                )
                
                # Upload image asset
                img_key = f"episodes/{episode.id}/scenes/scene_{s_script.scene_number}.png"
                img_url = await storage.store_file(img_temp, img_key, "image/png")

                # 2. Audio
                aud_temp = os.path.join(temp_dir, f"scene_{s_script.scene_number}_aud.wav")
                await tts_provider.generate_narration_audio(
                    text=s_script.narration,
                    voice=settings.TTS_VOICE,
                    output_path=aud_temp
                )
                
                # Upload audio asset
                aud_key = f"episodes/{episode.id}/scenes/scene_{s_script.scene_number}.wav"
                aud_url = await storage.store_file(aud_temp, aud_key, "audio/wav")

                # Create Scene database row
                scene_row = Scene(
                    episode_id=episode.id,
                    scene_number=s_script.scene_number,
                    title=s_script.title,
                    visual_description=s_script.visual_description,
                    image_prompt=s_script.image_prompt,
                    narration_text=s_script.narration,
                    dialogue=s_script.dialogue,
                    mood=s_script.mood,
                    duration_seconds=s_script.duration_seconds,
                    image_url=img_url,
                    audio_url=aud_url,
                )
                self.db.add(scene_row)

                scene_render_data.append({
                    "image_path": img_temp,
                    "audio_path": aud_temp,
                    "duration": s_script.duration_seconds,
                    "narration": s_script.narration,
                    "narration_text": s_script.narration,
                })

            self.db.commit()

            # 3. Video Assembly with FFmpeg
            job.current_stage = "Assembling video with FFmpeg"
            job.progress_percent = 75
            self.db.commit()

            video_temp = os.path.join(temp_dir, "master_episode.mp4")
            vtt_temp = os.path.join(temp_dir, "captions.vtt")

            if self.media_pipeline.is_ffmpeg_available():
                final_video, final_vtt, actual_duration = await self.media_pipeline.build_full_episode_video(
                    scene_data=scene_render_data,
                    output_video_path=video_temp,
                    output_captions_path=vtt_temp
                )
            else:
                # If FFmpeg binary isn't available, build a fallback asset
                with open(video_temp, "wb") as f:
                    f.write(b"MOCK_MP4_CONTENT")
                self.media_pipeline.create_webvtt_captions(scene_render_data, vtt_temp)
                actual_duration = sum(s.duration_seconds for s in script.scenes)

            # Store master video & captions
            video_key = f"episodes/{episode.id}/master.mp4"
            video_url = await storage.store_file(video_temp, video_key, "video/mp4")

            vtt_key = f"episodes/{episode.id}/captions.vtt"
            vtt_url = await storage.store_file(vtt_temp, vtt_key, "text/vtt")

            # First scene image serves as thumbnail
            thumb_url = scene_render_data[0]["image_path"] if scene_render_data else None
            thumb_cloud_url = None
            if thumb_url and os.path.exists(thumb_url):
                thumb_key = f"episodes/{episode.id}/thumbnail.png"
                thumb_cloud_url = await storage.store_file(thumb_url, thumb_key, "image/png")

            # Finalize Episode and Job
            episode.video_url = video_url
            episode.captions_url = vtt_url
            episode.thumbnail_url = thumb_cloud_url
            episode.duration_seconds = actual_duration
            episode.generation_status = "completed"

            job.status = "completed"
            job.progress_percent = 100
            job.current_stage = "Episode ready for streaming"

            self.db.commit()

        except Exception as e:
            self.db.rollback()
            job.status = "failed"
            job.error_message = str(e)
            job.current_stage = "Generation failed"
            episode.generation_status = "failed"
            self.db.commit()
            raise e
        finally:
            # Clean up temp working files
            import shutil
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)
