# Multimedia Pipeline & FFmpeg Video Assembly Specification

## 1. Overview

The multimedia pipeline turns the structured script into an engaging, playable motion-comic MP4 video.

```text
Scene Image Prompts ---> [Image Generator / Canvas] ---> scene_1.png, scene_2.png...
Narration Text     ---> [TTS Engine / Voice Audio]  ---> narration_1.mp3, narration_2.mp3...
Timestamps         ---> [Caption Generator]        ---> episode.vtt / burned subtitles
Background Music   ---> [Genre Audio Bank]         ---> background_track.mp3
                          |
                          v
                 [FFmpeg Assembly Engine]
                          |
                          v
                  episode_final.mp4 (H.264/AAC, 1280x720, 24fps)
```

---

## 2. FFmpeg Video Assembly Mechanics

### 2.1. Ken Burns Pan & Zoom Filter
Static scene images are made visually dynamic by applying subtle zoom and pan transitions:
```bash
ffmpeg -loop 1 -i scene_1.png -t 15 -vf "scale=1920x1080,zoompan=z='min(zoom+0.0015,1.2)':d=375:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps=25" -c:v libx264 -pix_fmt yuv420p scene_1.mp4
```

### 2.2. Audio Mixing & Ducking
Narration takes primary auditory focus. Background music from the genre soundtrack is ducked when speech occurs:
```bash
ffmpeg -i scene_video.mp4 -i narration.mp3 -i background_music.mp3 \
  -filter_complex "[2:a]volume=0.18[bg];[1:a]volume=1.0[narration];[narration][bg]amix=inputs=2:duration=first[aout]" \
  -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k output.mp4
```

### 2.3. Output Verification with FFprobe
Every completed video is verified before database update:
1. Video stream is present and encoded with H.264.
2. Audio stream is present with valid sample rate (>= 44100Hz).
3. Duration matches expected scene summation (tolerance: ±1.5s).
4. Bitrate is within streaming bounds (1.5 Mbps to 4.0 Mbps).

---

## 3. Storage Adapters

The application supports interchangeable storage backends:
- **`LocalStorageAdapter`**: Used in local development. Serves files directly via FastAPI static file route `/media/...`.
- **`S3StorageAdapter`**: Used for AWS S3 and Cloudflare R2 in production. Generates signed pre-authenticated streaming URLs.
