# NIVORA 2.0: PRODUCTION BLUEPRINT & ARCHITECTURE MASTER PLAN

---

## 1. PRODUCT OVERVIEW

**Nivora** is an AI-powered episodic productivity and storytelling platform that turns real daily goals, tasks, and personal discipline into a continuous, cinematic web series.

Users configure an aspirational digital protagonist—either chosen from a curated library of Indian and international identities across careers, cultures, and archetypes, or built from scratch using a comprehensive 7-step identity builder. Each day, users define their weighted commitments through voice-first speech recognition or structured manual entry. As tasks are executed and verified, Nivora’s narrative engine maps daily completion percentages (80%, 90%, 100%) to branching story outcomes, synthesizing script narratives, scene visuals, voiceover narration, and synchronized captions into an assembled MP4 streaming episode.

### Core Value Proposition
- **Voice-First Productivity:** Speech-to-text natural language task capture with automatic classification, effort weighting (points), and real-time audio confirmation.
- **Narrative Continuity & Branching:** Episodic progression tied to verifiable task completion (80% steady recovery, 90% high velocity, 100% golden milestone).
- **Persistent Journey & Streaks:** Uncompromising historical timeline tracking 5-day demo timelines, missed-day recovery without erasing past achievements, and streak qualifications.
- **Cinematic Streaming Aesthetics:** Inspired by premier streaming interfaces (Netflix, Prime Video, Disney+ Hotstar) with an elevated dark palette (`#14151D`), solid single-color N monogram, and responsive fullscreen media studio.

---

## 2. CURRENT REPOSITORY ARCHITECTURE

| Layer | Technology | Current Implementation |
|---|---|---|
| **Frontend Framework** | Next.js 16.4 (App Router, Turbopack) | React 19, TypeScript, Vanilla CSS design tokens with Tailwind utility classes. |
| **Backend API** | FastAPI (Python 3.11) | RESTful API v1 (`/api/v1`), Pydantic v2 schemas, CORS middleware, JWT session security. |
| **Relational Database** | PostgreSQL 18 (Port 5433) | SQLAlchemy 2.0 ORM with Psycopg 3. Tables for Users, Avatars, Series, Episodes, Scenes, Goals, Tasks, DailyPlans. |
| **Cache & Task Broker** | Redis 7.0 (Port 6379) | In-memory token storage, rate-limiting counters, and background job queue adapter. |
| **Authentication** | JWT + Google OAuth 2.0 | Dual-mode: email/password with bcrypt password hashing + Google OAuth URL & callback handler. |
| **Media Assembly Pipeline** | FFmpeg 9.0.1 / FFprobe | Automated multi-track compositor: scene stills + pan/zoom motion filter + TTS audio + WebVTT subtitles -> H.264 MP4. |
| **Local Media Streaming** | FastAPI StaticFiles | Mounted at `/media` serving `/episodes` and `/demo` storage hierarchies with byte-range streaming support. |

---

## 3. EXTERNAL API INVENTORY

The following external services are supported or recommended for commercial scaling:

| Service Category | Recommended Provider | Purpose | Required Credentials | Env Variable Name | Free Tier? | Commercial Billing Considerations |
|---|---|---|---|---|---|---|
| **Story & Script LLM** | OpenAI (GPT-4o / GPT-4o-mini) or Anthropic (Claude 3.5 Sonnet) | Episodic script generation, scene breakdown, and voice task extraction. | API Key | `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | Pay-as-you-go | ~$0.15 - $0.60 per 1M input tokens; ~$0.60 - $2.40 per 1M output tokens. Script cost: ~$0.003/episode. |
| **Image Generation** | OpenAI DALL-E 3, Midjourney API (via Replicate), or Stable Diffusion XL | Character and scene keyframe rendering. | API Key / Token | `OPENAI_API_KEY` or `REPLICATE_API_TOKEN` | Trial credits only | DALL-E 3: $0.040/image (standard) or $0.080/image (HD). 3 scenes = ~$0.12/episode. SDXL on Replicate: ~$0.003 - $0.01/image. |
| **Text-to-Speech (TTS)** | ElevenLabs or OpenAI Audio TTS | Expressive character dialogue and narrative voiceovers. | API Key & Voice ID | `ELEVENLABS_API_KEY` & `ELEVENLABS_VOICE_ID` or `OPENAI_API_KEY` | ElevenLabs: 10k chars/mo free; OpenAI: Pay-as-you-go | OpenAI TTS: $0.015 per 1,000 characters (~$0.01/min episode). ElevenLabs Creator: $22/mo for 100k characters. |
| **Speech-to-Text (STT)** | Web Speech API (in-browser) + OpenAI Whisper (server fallback) | Voice task transcription. | Browser permission (Client) or OpenAI Key | `OPENAI_API_KEY` | Browser: 100% Free; Whisper: $0.006 / min | Client-side Web Speech API incurs zero infrastructure cost. |
| **AI Motion Video (Mode B)** | Runway Gen-3 Alpha, Luma Dream Machine, or Kling AI | AI moving video generation for scenes. | API Token | `RUNWAY_API_SECRET` or `LUMA_API_KEY` | Limited free trials | ~$0.05 to $0.25 per 5-second video clip. High cost driver ($0.60 - $1.50 per 60s episode). Optional mode. |
| **Google Authentication** | Google Cloud Platform (OAuth 2.0) | One-tap and OAuth 2.0 user registration and authentication. | Client ID & Client Secret | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | 100% Free | Unlimited standard OAuth logins at zero cost. |
| **Object Storage** | Cloudflare R2 or Amazon S3 | Storing assembled MP4 videos, thumbnails, and audio assets. | S3 Access Key, Secret, Bucket, Endpoint | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` | R2: 10GB free, $0 egress fees | Cloudflare R2 is strongly recommended over S3 to eliminate bandwidth egress costs. Storage: $0.015/GB/mo. |
| **Transactional Email** | Resend or SendGrid | Account confirmation, password reset, and daily morning episode drop alerts. | API Key | `RESEND_API_KEY` | Resend: 3,000 emails/mo free | $20/mo for 50,000 emails. |
| **Error Monitoring** | Sentry | Full-stack exception tracking and trace telemetry. | Sentry DSN | `SENTRY_DSN` | 5,000 errors/mo free | Team plan: $26/mo. |
| **Payment Gateway** | Stripe (International) + Razorpay (India) | Subscription billing for Pro episodes and customized video renders. | Publishable & Secret Keys | `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_ID` | Standard per-tx fee | Stripe: 2.9% + 30¢; Razorpay: 2% domestic card/UPI. |

---

## 4. EXACT ENVIRONMENT VARIABLES SPECIFICATION

```env
# ==============================================================================
# NIVORA 2.0 CONFIGURATION ENVIRONMENT SPECIFICATION
# ==============================================================================

# Core App Setup
APP_NAME=Nivora
APP_ENV=development                       # development | staging | production
DEBUG=true
APP_URL=http://localhost:3000
API_URL=http://localhost:8000

# Security & Secrets
SECRET_KEY=ylys_super_secure_secret_key_change_in_production_2026_sdga_nivora
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=120
REFRESH_TOKEN_EXPIRE_DAYS=30

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Database (PostgreSQL 18)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_DB=your_life_your_series
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5433/your_life_your_series
ASYNC_DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5433/your_life_your_series

# Redis Cache & Background Queue
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_URL=redis://localhost:6379/0

# Storage (Local dev fallback vs Cloud S3/R2)
STORAGE_BACKEND=local                     # local | s3 | r2
LOCAL_STORAGE_DIR=./storage
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=auto
S3_BUCKET_NAME=nivora-media-vault
S3_ENDPOINT_URL=https://<account_id>.r2.cloudflarestorage.com

# AI Storytelling Providers
STORY_PROVIDER=mock                      # mock | openai | anthropic | gemini | groq
STORY_MODEL=gpt-4o-mini
IMAGE_PROVIDER=mock                      # mock | openai | stability | replicate
IMAGE_MODEL=dall-e-3
TTS_PROVIDER=mock                        # mock | openai | elevenlabs
TTS_VOICE=alloy

# External API Keys (Leave blank for mock mode)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
GROQ_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
REPLICATE_API_TOKEN=

# Media Binaries
FFMPEG_PATH=ffmpeg
FFPROBE_PATH=ffprobe

# Email & Notifications
EMAIL_BACKEND=console                    # console | resend | sendgrid | smtp
RESEND_API_KEY=
EMAIL_FROM=notifications@nivora.ai
```

---

## 5. VIDEO GENERATION PIPELINE ARCHITECTURE

The Nivora video synthesis pipeline supports two production modes:

```
[User Day Tasks & Points] 
           │
           ▼
[1. Script & Narrative Generation] ──► Structured screenplay (Title, Act 1/2, Scenes, Branch Previews)
           │
           ▼
[2. Visual Identity & Scene Planning] ──► Character visual prompts with consistent wardrobe & style
           │
           ├──► Mode A: Motion-Comic (Default, Highly Scalable, Cost: ~$0.08 - $0.15)
           │        ├─ Scene keyframes generated via DALL-E 3 / SDXL
           │        ├─ Pan & zoom kinetic camera motion (Ken Burns effect)
           │        ├─ TTS voice narration (OpenAI / ElevenLabs)
           │        ├─ WebVTT caption synthesis & audio sync
           │        └─ FFmpeg multi-track render -> H.264 1280x720 24fps MP4
           │
           └──► Mode B: AI Motion Video (Premium Tier, Cost: ~$0.80 - $1.80)
                    ├─ Image-to-Video generation via Runway Gen-3 / Luma Dream Machine
                    ├─ Direct video clip generation per scene
                    ├─ Lip-sync / dialogue conditioning
                    └─ FFmpeg audio & scene concatenation -> H.264 MP4
           │
           ▼
[3. Storage Upload & Database Record] ──► Upload to R2 / S3, persist MediaAsset record
           │
           ▼
[4. Streaming Playback] ──► Fullscreen HTML5 Player with seek synchronization & captions
```

### Motion-Comic Pipeline: Step-by-Step Production Guarantees
1. **Scene Text Rendering Overlays:** AI image generation models often distort small text inside graphics. Nivora composits readable document overlays (e.g., "Quarterly Revenue Report - Approved") as clean vector graphics directly during video assembly.
2. **Audio-Video Synchronization:** Narration audio clips are generated per scene first; their precise duration determines the scene duration in FFmpeg, ensuring zero audio cutoff or awkward silence.
3. **Cross-Browser Captions:** WebVTT files are generated alongside the master MP4 with millisecond timestamps, rendering subtitles cleanly on iOS, Android, macOS, and Windows.

---

## 6. DATABASE SCHEMA & PERSISTENCE ENTITIES

The PostgreSQL database enforces the following relations:

```
           ┌──────────────┐
           │    User      │
           └──────┬───────┘
                  │ 1
        ┌─────────┼─────────────────────────┐
        │ *       │ 1                       │ *
  ┌─────▼────┐ ┌──▼───────────┐       ┌─────▼───────┐
  │   Task   │ │  UserPrefs   │       │  DailyPlan  │
  └─────┬────┘ └──────────────┘       └─────────────┘
        │ *
  ┌─────▼────┐
  │   Goal   │
  └──────────┘
                  │ 1
                  │
        ┌─────────┴─────────┐
        │ 1                 │ *
  ┌─────▼────┐        ┌─────▼───────┐
  │  Series  │───────►│   Avatar    │ (Template or Custom User-Owned)
  └─────┬────┘ 1    * └─────────────┘
        │
        │ 1
        │
  ┌─────▼────┐
  │ Episode  │ (Stores full_script, branch_previews, task_snapshot, day_number)
  └─────┬────┘
        │
        ├───► [ Scene ] (Scene descriptions, image_url, audio_url, dialogue)
        ├───► [ GenerationJob ] (Idempotent job progress & retries)
        └───► [ MediaAsset ] (S3 / R2 storage keys, MIME type, file size)
```

### Historical Persistence Guarantee
When a user evaluates their day, a immutable snapshot record is stored in `DailyPlan` containing the exact tasks, point weights, and completion status. If the user edits tomorrow's tasks or changes goals in the future, yesterday's timeline record remains historically exact and immune to retroactive mutation.

---

## 7. SIX INVESTOR DEMO CHARACTERS & 60 SAMPLE EPISODES

Nivora includes 6 fully-seeded demo characters representing diverse backgrounds, careers, and storytelling genres:

| # | Character | Archetype | Genre | 5-Day Narrative Arc | Video Showcase Status |
|---|---|---|---|---|---|
| **1** | **Cary Vance** | Startup Founder & CEO | Corporate Drama | Managing quarter-end deadlines, board term-sheets, day 3 infrastructure outage, emergency turnaround, and multi-million enterprise contract close. | **Fully Assembled MP4 Master Video** (`/demo/cary/day-01/episode-a.mp4`) with pan/zoom motion, voiceover, and captions. |
| **2** | **Meera Sharma** | AI Systems Engineer | Tech Drama & Inspiration | Booting a 100B transformer cluster, debugging distributed GPU synchronization, weight corruption recovery, paper defense, and mobile edge deployment. | Playable Animatic & Video Preview (`/demo/meera/day-01/...`). |
| **3** | **Aarav Kapoor** | Fintech Entrepreneur | Business Drama | Rolling out merchant UPI rails across Mumbai markets, central bank regulatory defense, personal liquidity guarantee, and cross-border Singapore expansion. | Playable Animatic & Video Preview (`/demo/aarav/day-01/...`). |
| **4** | **Dr. Ananya Sen** | Medical Resident | Slice of Life & Growth | First complex vascular procedure, elusive pediatric diagnosis, monsoon casualty night, surgical board examination, and rural clinic initiative. | Playable Animatic & Video Preview (`/demo/ananya/day-01/...`). |
| **5** | **Riya Varma** | Lead Product Designer | Creative Rom-Com & Drama | Designing spatial aesthetic identities, creative block breakthrough at national gallery, design of the year award, and independent studio opening. | Playable Animatic & Video Preview (`/demo/riya/day-01/...`). |
| **6** | **Arjun Rathore** | Decathlete & Sports Scientist | Sports Drama | Biomechanical dawn interval training, high-jump 2.10m psychological hurdle, hamstring injury recovery protocol, and national decathlon record. | Playable Animatic & Video Preview (`/demo/arjun/day-01/...`). |

*Total seeded sample episodes in PostgreSQL:* **6 characters × 5 days × 2 episodes/day = 60 distinct episodes** with unique scripts, summaries, hooks, cliffhangers, and branching previews.

---

## 8. DEVELOPMENT SETUP COMMANDS

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL 16+ (Running on port 5433 or configured port)
- Redis (Running on port 6379)
- FFmpeg installed in system PATH

### Step 1: Backend Setup
```powershell
cd "services/api"
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Run migrations and seed the 6 demo characters + 60 episodes
python -m app.scripts.migrate_v2
python -m app.scripts.setup_demo_assets
python -m app.scripts.seed_nivora_2

# Start Backend API
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Step 2: Frontend Setup
```powershell
cd "apps/web"
npm install
npm run build    # Verify clean build
npm run dev      # Start dev server on http://localhost:3000
```

### Step 3: Run Test Suite
```powershell
cd "services/api"
.\venv\Scripts\pytest.exe -v
# Output: 9 passed (Health, Genres, Auth, Tasks/Goals, Episodes, Google OAuth, Voice Extraction, Custom Identity, Timeline)
```

---

## 9. PRODUCTION DEPLOYMENT ARCHITECTURE

### Recommended Infrastructure
- **Frontend Hosting:** Vercel or AWS Amplify hosting the Next.js App Router bundle.
- **Backend API Hosting:** AWS ECS (Fargate) or Railway / Render running containerized FastAPI.
- **Background Workers:** Celery / ARQ workers running on dedicated CPU instances equipped with FFmpeg.
- **Database:** Managed PostgreSQL (AWS Aurora Serverless v2 or Supabase / Neon).
- **Media Object Storage:** Cloudflare R2 (enables zero-egress cost streaming of high-resolution MP4 episodes).

---

## 10. COST PROJECTIONS & SCALING ECONOMICS

| Scale | Daily Active Users | Daily Episodes Generated | Estimated LLM Cost | Estimated Image / Video Cost | Estimated TTS Cost | Estimated Storage & Bandwidth | Total Estimated Cost / Mo | Cost Per Active User / Mo |
|---|---|---|---|---|---|---|---|---|
| **100 Users** | 70 | 70 (Mode A) | $6.30 | $168.00 | $21.00 | $4.50 | **~$200 / mo** | ~$2.00 / user |
| **1,000 Users** | 700 | 700 (Mode A) | $63.00 | $1,680.00 | $210.00 | $35.00 | **~$1,988 / mo** | ~$1.98 / user |
| **10,000 Users** | 7,000 | 7,000 (Mode A) | $630.00 | $12,600.00 (discounted bulk SDXL) | $1,470.00 | $280.00 | **~$14,980 / mo** | ~$1.50 / user |

*Pricing Strategy:* A subscription price of **$9.99/mo** (Standard) or **$19.99/mo** (Pro) yields an attractive gross margin of 78% to 85% at scale using the Mode A Motion-Comic pipeline.

---

## 11. IMPLEMENTATION VERIFICATION STATUS

| Feature | Requirement | Local Status | Production Readiness |
|---|---|---|---|
| **Branding & Logo** | Nivora brand, solid N monogram, no tagline | **IMPLEMENTED** | Ready |
| **Design System** | `#14151D` dark cinematic streaming interface | **IMPLEMENTED** | Ready |
| **Character Library** | 30+ Indian & International profiles across 10 categories | **IMPLEMENTED & SEEDED** | Ready |
| **Custom Identity Creator** | 7-step identity builder saving custom user-owned personas | **IMPLEMENTED** | Ready |
| **Voice Task Input** | Speech-to-text recognition, task extraction, review | **IMPLEMENTED** | Ready (Web Speech API + Backend extraction) |
| **Google Authentication** | Real Google OAuth route, callback, dev simulation | **IMPLEMENTED** | Ready (Requires client credentials in prod) |
| **Episode Studio** | Full script panel, scene seeking, HTML5 video player, fullscreen | **IMPLEMENTED** | Ready |
| **Next-Day Story Branching** | 80%, 90%, 100% scenario preview cards | **IMPLEMENTED** | Ready |
| **Investor Showcase** | 6 demo characters, 5 days, 2 eps/day (60 distinct episodes) | **IMPLEMENTED & SEEDED** | Ready |
| **Cary Day 1 Video Media** | Real assembled playable MP4 master video files | **VERIFIED PLAYABLE** | Ready |
| **Persistent Timeline** | Dedicated `/timeline` page, streak qualification & resets | **IMPLEMENTED** | Ready |
| **Automated Testing** | Full coverage of auth, tasks, episodes, timeline, custom identity | **9/9 PASSED** | Ready |
| **Next.js Production Build** | Static generation & compilation | **PASSED (12/12 routes)** | Ready |
