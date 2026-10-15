# Testing Strategy & Quality Assurance

## 1. Test Architecture

The test suite covers:
1. **Backend Unit Tests**: Domain logic, streak algorithms, XP calculations, narrative context builders, and Pydantic schema validation.
2. **Backend API Integration Tests**: Auth registration/login, goal and task CRUD, episode generation queuing, and job state transitions.
3. **Mock Media Pipeline Verification**: Validating FFmpeg assembly using deterministic test assets and verifying output with FFprobe.
4. **Frontend Unit & Component Tests**: Task interactions, onboarding wizard validation, and dashboard views.
5. **End-to-End Tests**: Complete flow from registration through task completion and episode video playback.

---

## 2. Running Tests

### 2.1. Backend Tests
```bash
# Activate virtual environment
# Windows:
services\api\venv\Scripts\activate
# Linux/Mac:
source services/api/venv/bin/activate

# Run pytest suite
cd services/api
pytest -v
```

### 2.2. Frontend Tests & Type Checking
```bash
cd apps/web
npm run lint
npm run build
```
