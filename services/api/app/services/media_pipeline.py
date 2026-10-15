import os
import subprocess
import json
import tempfile
import asyncio
from typing import List, Dict, Any, Optional, Tuple
from app.core.config import settings

class MediaPipelineService:
    def __init__(self, ffmpeg_path: Optional[str] = None, ffprobe_path: Optional[str] = None):
        self.ffmpeg_path = ffmpeg_path or settings.FFMPEG_PATH or "ffmpeg"
        self.ffprobe_path = ffprobe_path or settings.FFPROBE_PATH or "ffprobe"

    def is_ffmpeg_available(self) -> bool:
        try:
            res = subprocess.run([self.ffmpeg_path, "-version"], capture_output=True, text=True, timeout=5)
            return res.returncode == 0
        except Exception:
            return False

    def probe_media_file(self, filepath: str) -> Dict[str, Any]:
        """Runs ffprobe on a media file to inspect streams and duration"""
        cmd = [
            self.ffprobe_path,
            "-v", "quiet",
            "-print_format", "json",
            "-show_format",
            "-show_streams",
            filepath
        ]
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if res.returncode != 0:
            raise RuntimeError(f"FFprobe failed on {filepath}: {res.stderr}")
        return json.loads(res.stdout)

    def create_webvtt_captions(self, scenes: List[Dict[str, Any]], output_path: str) -> str:
        """Generates a valid WebVTT subtitle file with aligned timestamps"""
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        
        current_time = 0.0
        vtt_content = ["WEBVTT\n"]
        
        for idx, scene in enumerate(scenes, 1):
            duration = float(scene.get("duration_seconds", 15.0))
            start_sec = current_time
            end_sec = current_time + duration
            
            def format_timestamp(s: float) -> str:
                hrs = int(s // 3600)
                mins = int((s % 3600) // 60)
                secs = s % 60
                return f"{hrs:02d}:{mins:02d}:{secs:06.3f}"
            
            time_line = f"{format_timestamp(start_sec)} --> {format_timestamp(end_sec)}"
            narration = scene.get("narration_text") or scene.get("narration") or ""
            
            vtt_content.append(f"{idx}\n{time_line}\n{narration}\n")
            current_time = end_sec
            
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(vtt_content))
            
        return output_path

    async def assemble_scene_video(
        self,
        image_path: str,
        audio_path: str,
        output_path: str,
        duration: float = 15.0
    ) -> str:
        """
        Combines a single scene image and narration audio clip into a 1280x720 MP4
        with smooth pan/zoom effect using safe subprocess arguments.
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        
        # Calculate frame count for 25 fps
        fps = 25
        total_frames = int(duration * fps)
        
        # Ken Burns slow zoom filter
        vf_filter = (
            f"scale=1920x1080,"
            f"zoompan=z='min(zoom+0.0012,1.15)':d={total_frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps={fps},"
            f"format=yuv420p"
        )
        
        cmd = [
            self.ffmpeg_path,
            "-y",
            "-loop", "1",
            "-i", image_path,
            "-i", audio_path,
            "-vf", vf_filter,
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-preset", "veryfast",
            "-c:a", "aac",
            "-b:a", "192k",
            "-t", str(duration),
            "-pix_fmt", "yuv420p",
            "-shortest",
            output_path
        ]
        
        # Run asynchronously in thread pool
        proc = await asyncio.to_thread(subprocess.run, cmd, capture_output=True, text=True, timeout=90)
        if proc.returncode != 0:
            # Fallback simpler filter if zoompan encountered errors
            simple_cmd = [
                self.ffmpeg_path,
                "-y",
                "-loop", "1",
                "-i", image_path,
                "-i", audio_path,
                "-vf", "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
                "-c:v", "libx264",
                "-preset", "ultrafast",
                "-c:a", "aac",
                "-b:a", "192k",
                "-t", str(duration),
                output_path
            ]
            fallback_proc = await asyncio.to_thread(subprocess.run, simple_cmd, capture_output=True, text=True, timeout=60)
            if fallback_proc.returncode != 0:
                raise RuntimeError(f"FFmpeg assembly failed: {fallback_proc.stderr}")
                
        return output_path

    async def concat_episode_scenes(
        self,
        scene_video_paths: List[str],
        output_path: str
    ) -> str:
        """
        Concatenates multiple scene MP4 files into a single continuous episode MP4.
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        
        # Write concat demuxer file list
        temp_dir = os.path.dirname(os.path.abspath(output_path))
        list_file = os.path.join(temp_dir, f"concat_list_{os.urandom(4).hex()}.txt")
        
        with open(list_file, "w", encoding="utf-8") as f:
            for p in scene_video_paths:
                # Escape path for ffmpeg concat
                clean_path = os.path.abspath(p).replace("\\", "/")
                f.write(f"file '{clean_path}'\n")
                
        cmd = [
            self.ffmpeg_path,
            "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", list_file,
            "-c", "copy",
            "-movflags", "+faststart",
            output_path
        ]
        
        try:
            proc = await asyncio.to_thread(subprocess.run, cmd, capture_output=True, text=True, timeout=120)
            if proc.returncode != 0:
                # Re-encode concat fallback
                re_cmd = [
                    self.ffmpeg_path,
                    "-y",
                    "-f", "concat",
                    "-safe", "0",
                    "-i", list_file,
                    "-c:v", "libx264",
                    "-c:a", "aac",
                    "-movflags", "+faststart",
                    output_path
                ]
                re_proc = await asyncio.to_thread(subprocess.run, re_cmd, capture_output=True, text=True, timeout=120)
                if re_proc.returncode != 0:
                    raise RuntimeError(f"FFmpeg concat failed: {re_proc.stderr}")
            return output_path
        finally:
            if os.path.exists(list_file):
                try:
                    os.remove(list_file)
                except Exception:
                    pass

    async def build_full_episode_video(
        self,
        scene_data: List[Dict[str, Any]],  # List of {"image_path": str, "audio_path": str, "duration": float, "narration": str}
        output_video_path: str,
        output_captions_path: Optional[str] = None
    ) -> Tuple[str, Optional[str], float]:
        """
        Orchestrates complete multi-scene video assembly:
        1. Compiles each scene with Ken Burns pan/zoom.
        2. Concatenates into final master MP4.
        3. Generates WebVTT subtitles.
        4. Verifies output via FFprobe.
        """
        temp_scenes = []
        total_duration = sum(float(s.get("duration", 15.0)) for s in scene_data)
        
        try:
            for idx, scene in enumerate(scene_data, 1):
                img = scene["image_path"]
                aud = scene["audio_path"]
                dur = float(scene.get("duration", 15.0))
                
                scene_out = os.path.join(tempfile.gettempdir(), f"scene_part_{idx}_{os.urandom(4).hex()}.mp4")
                await self.assemble_scene_video(img, aud, scene_out, duration=dur)
                temp_scenes.append(scene_out)
                
            await self.concat_episode_scenes(temp_scenes, output_video_path)
            
            # Subtitles
            captions_file = None
            if output_captions_path:
                captions_file = self.create_webvtt_captions(scene_data, output_captions_path)
                
            # Verify with ffprobe
            probe_data = self.probe_media_file(output_video_path)
            actual_duration = float(probe_data.get("format", {}).get("duration", total_duration))
            
            return output_video_path, captions_file, actual_duration
            
        finally:
            # Clean up intermediate scene mp4s
            for p in temp_scenes:
                if os.path.exists(p):
                    try:
                        os.remove(p)
                    except Exception:
                        pass
