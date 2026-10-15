# REST API Specification: Your Life, Your Series

Version: `v1`  
Base URL: `/api/v1`  
Interactive Swagger/OpenAPI Docs: `http://localhost:8000/docs`

---

## 1. Authentication & User Management

### `POST /api/v1/auth/register`
Creates a new user account.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "display_name": "Cary Woods"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "display_name": "Cary Woods",
    "access_token": "jwt_token_here",
    "token_type": "bearer"
  }
  ```

### `POST /api/v1/auth/login`
Authenticates a user and returns a short-lived JWT access token and sets an HttpOnly refresh cookie.
- **Request Body** (JSON or Form):
  ```json
  {
    "username": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```

### `GET /api/v1/auth/me`
Returns current authenticated user profile, preferences, streak, and level.

---

## 2. Avatars & Genres

### `GET /api/v1/avatars`
Lists all available template avatars (CEO, Artist, Athlete, Student, Tech Founder, etc.).

### `GET /api/v1/genres`
Returns all supported story genres with theme colors, narrative tones, and sample tropes.

---

## 3. Goals & Productivity Tasks

### `GET /api/v1/goals`
Retrieves all user goals with calculated completion percentages and linked task counts.

### `POST /api/v1/goals`
Creates a new long-term goal.

### `GET /api/v1/tasks`
Lists tasks with query filters:
- `status`: `pending | completed | missed | all`
- `goal_id`: optional UUID filter
- `date`: optional ISO date string

### `POST /api/v1/tasks`
Creates a new task.
- **Request Body**:
  ```json
  {
    "title": "Pitch deck finalized for angel investors",
    "description": "Include Q3 financials and growth metrics",
    "priority": "high",
    "goal_id": "optional-goal-uuid",
    "due_date": "2026-10-16T18:00:00Z",
    "is_recurring": false
  }
  ```

### `PATCH /api/v1/tasks/{task_id}/toggle`
Toggles task completion status, increments XP and streak deterministically, and updates goal progress.

---

## 4. Series & Story Episodes

### `GET /api/v1/series/active`
Retrieves current active series for the user, including character archetype, genre, current season/episode, and continuity narrative state.

### `POST /api/v1/series`
Initializes a new series during onboarding or when starting a new season.

### `POST /api/v1/episodes/generate`
Queues the generation of today's episode based on the user's completed vs. missed tasks.
- **Request Body**:
  ```json
  {
    "series_id": "uuid",
    "notes": "Optional extra real-life context for today",
    "format": "video" // "video" | "text"
  }
  ```
- **Response `202 Accepted`**:
  ```json
  {
    "job_id": "job-uuid",
    "episode_id": "episode-uuid",
    "status": "queued",
    "message": "Episode generation started in background queue"
  }
  ```

### `GET /api/v1/episodes`
Lists user's episode library with thumbnails, summaries, generation status, and duration.

### `GET /api/v1/episodes/{episode_id}`
Returns complete episode detail including scene list, video streaming URL, captions (VTT), script text, and linked task snapshots.

### `GET /api/v1/generation-jobs/{job_id}`
Checks the real-time background generation progress, current stage, and error details if any.

---

## 5. Dashboard & Analytics

### `GET /api/v1/dashboard/overview`
Returns the consolidated daily payload:
- Daily task checklist
- Completion percentage
- Active streak & XP level
- Latest episode card
- Recommended next action
