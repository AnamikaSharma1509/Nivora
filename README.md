# NIVORA 4.0 🎬✨
> *"Your Life. Your Destination. Your Series. One Day At A Time."*

**Nivora** is an AI-powered episodic productivity and goal-development platform that connects an individual's present-day daily tasks to their long-term life ambitions. Through cinematic screenplay generation, episodic motion-comic rendering, and domain-specific roadmap progression, Nivora turns personal ambition into daily momentum where the authenticated user is always the protagonist.

---

## 🌟 The Core Product Principle (Data Ownership & Protagonist Isolation)

> **The selected character is an inspiration. The authenticated user is the sole protagonist. The final goal is the destination. Daily tasks are the steps. Milestones are the roadmap. Episodes are the narrative representation of the journey.**

### Strict Separation: Personal Timeline vs. Explore Other Lives
1. **Personal Timeline (`/timeline`)**:
   - Queries exclusively the authenticated user's records via server-validated tokens (`GET /api/v1/timeline/me`).
   - Contains **zero** histories, tasks, or episodes from predefined demo characters (Cary, Meera, Aarav, Ananya, Riya, Arjun, Elena Rostova).
   - Reflects the user's current destination goal, target completion horizon, active milestone pacing, user-owned tasks, and user-generated episodes.
2. **Explore Other Lives (`/explore-other-lives`)**:
   - The dedicated inspirational gallery showcasing curated innovators and founders.
   - Clicking a demo character navigates to a full-page, dedicated 5-day timeline and narrative story view (`/explore-other-lives/[characterKey]`) with scenario previews (70%, 80%, 100% completion outcomes), without opening small modal popups.
   - Demo content is strictly read-only and never alters the user's personal profile or data.

---

## 🏗️ Technology Stack

- **Frontend (`apps/web`)**: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, Lucide Icons.
- **Backend API (`services/api`)**: FastAPI, Python 3.11+, SQLAlchemy 2.0, PostgreSQL 17/18, SQLite (test/local), Redis 7, Pydantic v2, Bcrypt, JWT authentication.
- **Media Engine**: FFmpeg 9.0+, FFprobe, Pillow motion-comic graphics, libx264/AAC encoding.
- **Authentication**: JWT authentication with genuine Google OAuth 2.0 / OpenID Connect flow.

---

## 🎨 Design System, Logo & Brand Palette

- **Primary Brand Accent**: Turquoise `#A8E6CF` (sourced directly from the *Create My Identity* button) with hover state `#7ED8B8` and dark contrast text `#14151D`. Used across all primary buttons, progress indicators, active navigation states, goal progress bars, and timeline checkpoints.
- **Supporting Palette**: Navy blue, light blue (`#60A5FA`), dark charcoal (`#14151D`, `#20232E`), grey (`#858B98`, `#B9BBC7`), and white (`#F6F5F8`).
- **Secondary Highlights**: Warm amber/yellow (`#F2D15C`, `#FFB347`) is reserved exclusively for small highlights: active streak flames, level badges, and milestone awards. It is never used as a dominant background.
- **Circular N Logo**: A reusable custom SVG component featuring a solid black circular medallion (`#0B0C10`), a grey N monogram with a straight vertical first stroke, a dramatic diagonal cursive stroke, and a right vertical stroke starting at the upper position with the characteristic middle disconnection.

---

## 🚀 Key Systems in Nivora 4.0

### 1. Personalized Timeline Layout (`/timeline`)
Structured into 6 progressive sections:
- **Section A: Final Goal Overview**: Real goal title, current baseline stage, target date, remaining days countdown, Milestone-weighted Goal Achievement Progress, and Streak-based Journey Momentum. If no deadline is configured, an interactive deadline picker prompt is provided.
- **Section B: Today's Tasks & Goal Alignment**: Live tasks snapshot with priority, points, milestone associations, direct/skill/support alignment tags, and concise AI strategic alignment feedback.
- **Section C: Goal Deadline & Urgency Pacing**: Dynamic visual timeline tracking progress through the planned horizon, current milestone checkpoint, next milestone deadline, and schedule status badge (*Ahead of Pace*, *On Schedule*, *Behind Target Pace*, or *Overdue Reassessment*).
- **Section D: Journey Statistics**: Persistent account-level statistics counting only the user's own data (Total episodes, current qualifying streak, longest streak, completed tasks, goal progress %, completed milestones, remaining milestones, days elapsed).
- **Section E: Chronological Journey Log**: Day-by-day record of planned tasks, completion percentages, streak qualifications, user's own episode playback (or clean empty state), and missed-day continuity recovery banners.
- **Section F: Personalized Target Roadmap**: Domain-specific milestone breakdown through Month 1, Month 2, Month 3, and destination horizon with feasibility analysis.

### 2. Domain-Specific Personalized Roadmap Generation
A dedicated roadmap engine (`app/services/roadmap_service.py`) analyzes the user's specific career domain, starting point, and target date:
- **AI Systems Engineer**: Kernel optimization, distributed inference clusters, model quantization, production low-latency pipelines.
- **Fintech Entrepreneur**: Regulatory sandboxes, merchant credit scoring, automated reconciliation rails, payment aggregator licensing.
- **Medical Resident**: Clinical ward telemetry, emergency trauma protocols, laparoscopic procedures, ICU fellowship.
- **Product Designer**: Spatial computing ergonomics, tactile micro-haptics, spatial design systems.
- **Decathlete & Sports Scientist**: Biomechanical stride telemetry, metabolic lactate curves, national trials qualification.
- **Feasibility Assessment**: Compares the user's deadline with standard domain pacing, flagging overly compressed timelines and offering scope/cadence adjustments.

### 3. Journey Momentum vs. Goal Achievement Progress
Maintains clean separation between daily consistency and actual milestone delivery:
- **Journey Momentum (Consistency Progress)**:
  $$\text{momentum} = \min\left(\frac{\text{streak}}{400}, 1.0\right) \times 100$$
- **Goal Achievement Progress (Milestone Delivery)**:
  $$\text{goal\_progress} = \frac{\sum \text{completed\_milestone\_weights}}{\sum \text{total\_milestone\_weights}} \times 100$$
Missed days break the current streak but preserve all accumulated milestone progress, historical logs, and previously generated episodes.

### 4. Human-Style Avatar System & Custom Persona
- **Vector Human Avatars (`HumanAvatar.tsx`)**: Illustrated avatars supporting multiple skin tones (*fair, warm beige, olive, bronze, deep brown*), hairstyles (*fade, slick back, curly, ponytail, bob, wavy, buzz, afro*), hair colors (*dark black, chestnut, blonde, auburn, silver*), clothing colors (*emerald teal, navy blue, charcoal, royal blue, ruby red, plum*), and gender presentations (*masculine, feminine, neutral*).
- **In-Place Persistence**: Saved directly into `user.avatar_options` via `POST /api/v1/avatars/my-avatar` and `PUT /api/v1/avatars/my-identity` without creating duplicate persona rows. Rendered consistently across Navbar, Characters, Dashboard, and Timeline.

### 5. Aspirational Trait Adoption Flow
- **Current Traits vs. Aspirational Traits**: Distinguishes between attributes the user currently identifies with and virtues they want to cultivate (*analytical, unflappable, tactical, resilient, strategic, empathetic, disciplined*).
- **Trait Adoption (`TraitAdoptionModal.tsx`)**: Allows users to discover traits in characters (such as Elena Rostova) and adopt them into their own development list without replacing their name, avatar, bio, or goal.
- **Micro-Action Development**: Connects each aspirational trait to actionable daily behaviors (e.g., *Analytical: Document trade-off matrices before committing code; Unflappable: Log 3 deterministic next steps during blockers*).

### 6. Explore Other Lives (`/explore-other-lives`)
Dedicated full-page character stories for 7 inspirational archetypes:
1. **Cary Vance**: Startup CEO & Founder
2. **Meera Patel**: AI Systems Engineer
3. **Aarav Singhania**: Fintech Entrepreneur
4. **Dr. Ananya Iyer**: Medical Resident
5. **Riya Sen**: Lead Product Designer
6. **Arjun Rathore**: Decathlete & Sports Scientist
7. **Elena Rostova**: Technology Founder & CEO (*Analytical, Unflappable, Tactical*)

---

## 🧪 Testing & Verification

### Run Complete Pytest Backend Test Suite (18/18 passing):
```powershell
# In PowerShell:
& "services\api\venv\Scripts\python.exe" -m pytest -v
```

### Run Frontend TypeScript Compilation:
```powershell
cd apps/web
npx tsc --noEmit
```

---

## 🛠️ Local Development Setup

### 1. Backend Service
```powershell
cd services/api
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Application
```powershell
cd apps/web
npm install
npm run dev
```

Visit `http://localhost:3000` to interact with the application.
