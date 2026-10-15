# NIVORA 4.0: PRODUCTION ARCHITECTURE & ENGINEERING SPECIFICATION
## Personalized Goal Timeline, Custom Protagonist Identity, Domain Roadmaps & High-Availability Infrastructure

This document details the production architecture, data flow isolation, security boundaries, roadmap generation algorithms, avatar and trait persistence, and deployment readiness for **Nivora 4.0**.

---

## 1. Executive Summary & Non-Negotiable Core Principle

Nivora 4.0 establishes the authenticated user as the sole protagonist of their life timeline and goal development.

### Core Data Ownership Rule:
- **Authenticated User = Sole Protagonist**: Every private user record (goals, tasks, daily snapshots, episodes, streak counts, timeline logs) is strictly scoped to `current_user.id` and verified through server-side authorization.
- **Personal Timeline (`/timeline`)**: Returns exclusively authenticated user records. Querying `/api/v1/timeline/me` without a valid token returns `HTTP 401 Unauthorized` and never falls back to demo character timelines.
- **Explore Other Lives (`/explore-other-lives`)**: Public, read-only demonstration space for curated innovators (Cary, Meera, Aarav, Ananya, Riya, Arjun, Elena Rostova). Clicking any demo character opens a full dedicated page (`/explore-other-lives/[characterKey]`) with verified 5-day continuity and branching narrative outcomes. Demo content is isolated in frontend, backend routes, and database models.

---

## 2. Production Topology & Architecture

```text
+-----------------------------------------------------------------------------------+
|                                 CLIENT BROWSERS                                   |
|   Next.js 16 (App Router) • React 19 • Tailwind CSS v4 • Human Avatar Engine      |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / WSS
                                           v
+-----------------------------------------------------------------------------------+
|                        INGRESS & REVERSE PROXY (Cloudflare / NGINX)               |
|            SSL Termination • DDoS Mitigation • WAF • Edge Caching                 |
+------------------------------------------+----------------------------------------+
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
                   v                                               v
+--------------------------------------+       +------------------------------------+
|         WEB APPLICATION PODS         |       |         API SERVICE PODS           |
|  Node.js 20+ Runtime • SSR & SSG     |       |  FastAPI • Python 3.11+ • Uvicorn  |
|  Next.js 16 Static & Dynamic Routes  |       |  REST Endpoints • Pydantic v2      |
+--------------------------------------+       +-----------------+------------------+
                                                                 |
               +-------------------------------------------------+--------------------------------------+
               |                                                 |                                      |
               v                                                 v                                      v
+-----------------------------+               +----------------------------------+   +----------------------------------+
|     POSTGRESQL 17+ HA       |               |         REDIS 7+ CACHE           |   |       MEDIA & BACKGROUND WORKER  |
|  Relational Persistence     |               |  Token Blacklist • Rate Limits   |   |  FFmpeg 9.0+ Motion-Comic        |
|  User Scoped Data Models    |               |  Task Queues • Idempotency Keys  |   |  Libx264 / AAC Assembly Pipeline |
+-----------------------------+               +----------------------------------+   +----------------------------------+
```

---

## 3. Data Flow & Ownership Boundaries

### 3.1. Personal Timeline Data Flow (`GET /api/v1/timeline/me`)
1. **Authorization**: Ingress inspects `Authorization: Bearer <JWT>`. `get_current_user` extracts `user_id` from the token and verifies active status in the database.
2. **Goal & Target Horizon**: Retrieves active user goal (`user_id == current_user.id`, `is_active == True`). Resolves user's selected target date and computes remaining days in the user's timezone.
3. **Pacing & Schedule Assessment**: Computes elapsed journey days, expected progress vs actual milestone weights, and labels schedule status:
   - `ahead`: Current progress exceeds time elapsed ratio.
   - `on_schedule`: Current progress is aligned with planned horizon.
   - `behind`: Milestone completion lags behind target timeline.
   - `overdue`: Current date is past the target date.
4. **Task Alignment & Today's Summary**: Gathers today's tasks and computes direct support, indirect skill development, and routine task breakdown with structured AI alignment feedback.
5. **Personal Statistics**: Aggregates only user-owned persistent records:
   - `total_episodes`: Count of episodes belonging to user's series (`series.user_id == current_user.id`).
   - `current_streak` & `longest_streak`: Calculated from qualifying user daily snapshots.
   - `completed_milestones` & `remaining_milestones`: Sourced from user's active goal milestones.
6. **Chronological Snapshots**: Gathers previous days of the user's actual journey. Days where no episode was generated return a clean empty state rather than demo character videos.

### 3.2. Demo Character Data Flow (`GET /api/v1/timeline/demo/{character_key}`)
- Strictly scoped to explicitly marked public demonstration characters (`is_demo == True`).
- Sourced from curated fixtures and demo series.
- Read-only; browsing demo characters has zero side-effects on user profile, streaks, or goals.

---

## 4. Personalized Roadmap Generation Engine

Located in `services/api/app/services/roadmap_service.py`:
- **Domain Identification**: Analyzes goal title, career archetype, and purpose statement to map into domains:
  - `ai_systems_engineer`
  - `fintech_entrepreneur`
  - `medical_resident`
  - `lead_product_designer`
  - `sports_scientist`
  - `general_goal`
- **Horizon & Monthly Checkpoints**:
  - Dynamically scales checkpoints based on target date (`Month 1`, `Month 2`, `Month 3`, and `Remaining Horizon`).
  - Assigns completion criteria, evidence requirements, weekly suggested pace, and milestone weights.
- **Feasibility Evaluation**:
  - Compares the duration between today and the target date with expected domain difficulty.
  - Generates actionable advice (e.g. extending date, increasing weekly study hours, or phase-based scoping) if the schedule is overly compressed.
  - Operates reliably even when external AI providers are offline using deterministic heuristics.

---

## 5. Goal Achievement Progress vs. Journey Momentum

Maintains mathematical separation between consistency and milestone delivery:

| Metric | Calculation | Purpose | Behavior on Missed Day |
| :--- | :--- | :--- | :--- |
| **Journey Momentum** | $\min(\text{streak} / 400, 1.0) \times 100$ | Measures daily consistency and habit momentum | Current streak resets to 0; longest streak is preserved |
| **Goal Achievement Progress** | $\sum \text{completed\_weights} / \sum \text{total\_weights} \times 100$ | Measures actual demonstrated completion of milestones | **Preserved 100%**. Never decrements or resets on missed days |

---

## 6. Custom Protagonist Identity & Human Avatar Engine

### 6.1. Vector Human Avatar System (`HumanAvatar.tsx`)
- Pure SVG rendering without external image dependencies or broken CDNs.
- Configurable attributes:
  - `skin_tone`: Fair (`#FDE2D2`), Warm Beige (`#E8BA93`), Olive (`#CFA077`), Bronze (`#A56F46`), Deep Brown (`#623B2A`).
  - `hair_style`: Short Fade, Slick Back, Curly, Ponytail, Bob, Wavy Long, Buzz Cut, Natural Afro.
  - `hair_color`: Dark Black (`#1A1A1A`), Chestnut Brown (`#4A2E1B`), Golden Blonde (`#D4AF37`), Auburn Red (`#873220`), Silver Grey (`#9CA3AF`).
  - `clothing_color`: Emerald Teal (`#7ED8B8`), Navy Blue (`#1E3A8A`), Charcoal (`#2B2D42`), Royal Blue (`#3B82F6`), Ruby Red (`#7F1D1D`), Plum Purple (`#6D28D9`).
  - `gender`: Masculine, Feminine, Neutral presentation.

### 6.2. Persistent Persona Management
- `GET /api/v1/avatars/my-identity`: Fetches or safely creates the user's single identity record.
- `PUT /api/v1/avatars/my-identity`: In-place updates for display name, career, biography, and personality traits. Prevents duplicate persona creation.
- `POST /api/v1/avatars/my-avatar`: Saves structured `avatar_options` into the user's account.

### 6.3. Aspirational Trait Adoption Flow
- Sourced from innovator profiles (e.g. Elena Rostova's *Analytical, Unflappable, Tactical*).
- `POST /api/v1/avatars/adopt-traits`: Appends selected traits to `user.aspirational_traits` without altering persona name, avatar, bio, or goal. Prevents duplicate traits.
- `DELETE /api/v1/avatars/aspirational-traits/{trait}`: Safely removes an adopted trait.
- Paired with actionable micro-actions for deliberate daily practice.

---

## 7. Branding & Color System Specifications

- **Circular N Emblem**: Solid black circular medallion (`#0B0C10`), straight vertical first stroke, dramatic diagonal stroke, and right vertical stroke with middle disconnection.
- **Primary Brand Color**: Turquoise `#A8E6CF` (derived from the *Create My Identity* button) with hover state `#7ED8B8` and dark contrast text `#14151D`.
- **Secondary Accent**: Yellow/Amber (`#F2D15C`, `#FFB347`) is strictly confined to small micro-badges: streak flames, level counters, and milestone awards.
- **Red Decorative Accents**: Removed from normal UI flows; reserved strictly for critical error alerts and missed-day indicators.

---

## 8. Database Migrations & Integrity

- Database schema uses SQLAlchemy declarative models with automated column detection.
- Added fields in `User` and `Avatar`:
  - `users.avatar_options`: JSON dictionary storing vector avatar attributes.
  - `users.aspirational_traits`: JSON array storing adopted developmental virtues.
  - `goals.target_date`: Date column storing the user's horizon deadline.
- Safe migrations preserve all existing users, tasks, and demo videos without data loss.

---

## 9. Security, Monitoring & Backup

- **JWT Validation**: Signed with `HS256`, 1-day expiration, invalidated upon logout via Redis token blacklist.
- **CORS Policies**: Explicit origin validation (`FRONTEND_URL`), restricting credentials to authorized frontends.
- **Rate Limiting**: 60 requests/minute per authenticated user IP on API endpoints; 5 requests/minute on LLM generation jobs.
- **Automated Backups**: Continuous Write-Ahead Log (WAL) archiving for PostgreSQL with daily physical snapshots retained for 30 days.

---

## 10. Production Readiness Checklist

| System Component | Implementation Status | Test Coverage | Operational Readiness |
| :--- | :--- | :--- | :--- |
| **Personal Timeline Isolation** | Implemented | Verified (Unit & Integration tests passing) | Ready for Production |
| **Target Date & Countdown** | Implemented | Verified | Ready for Production |
| **Domain-Specific Roadmap Engine** | Implemented | Verified (5 domains tested) | Ready for Production |
| **Journey Momentum vs Goal Progress** | Implemented | Verified | Ready for Production |
| **Vector Human Avatar System** | Implemented | Verified (All variants render clean) | Ready for Production |
| **Aspirational Trait Adoption** | Implemented | Verified (Duplicate prevention tested) | Ready for Production |
| **Explore Other Lives Full-Page** | Implemented | Verified (Dedicated route & scenarios) | Ready for Production |
| **Elena Rostova Demo Profile** | Implemented | Verified | Ready for Production |
| **Nivora Circular N Logo** | Implemented | Verified | Ready for Production |
| **Turquoise Brand Color Palette** | Implemented | Verified | Ready for Production |
| **Google OAuth 2.0 Flow** | Implemented | Verified (No fake investor logins) | Awaiting Production Client Secret |
| **AI Screenplay & Telemetry** | Implemented | Verified (Deterministic fallbacks active) | Optional AI API Key for Live LLM |
| **FFmpeg Media Encoding Pipeline** | Implemented | Verified | Ready on systems with FFmpeg installed |
