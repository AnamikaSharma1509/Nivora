import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from conftest import TestingSessionLocal

client = TestClient(app)

def test_health_liveness():
    res = client.get("/api/v1/health/live")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_genres_endpoint():
    res = client.get("/api/v1/genres")
    assert res.status_code == 200
    genres = res.json()
    assert len(genres) >= 6
    genre_ids = [g["id"] for g in genres]
    assert "romantic_comedy" in genre_ids
    assert "thriller" in genre_ids

def test_auth_registration_and_login():
    reg_data = {
        "email": "testhero@yourlifeyourseries.com",
        "password": "SuperPassword123!",
        "display_name": "Test Protagonist"
    }
    # Register
    res = client.post("/api/v1/auth/register", json=reg_data)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["email"] == reg_data["email"].lower()
    
    # Login
    login_data = {
        "email": "testhero@yourlifeyourseries.com",
        "password": "SuperPassword123!"
    }
    login_res = client.post("/api/v1/auth/login", json=login_data)
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    
    # Get Current User
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["display_name"] == "Test Protagonist"

def test_goal_and_task_lifecycle():
    # Login to get token
    login_res = client.post("/api/v1/auth/login", json={
        "email": "testhero@yourlifeyourseries.com",
        "password": "SuperPassword123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Goal
    goal_data = {
        "title": "Complete Series Pilot Season",
        "description": "Establish first five streaming episodes",
        "category": "Career"
    }
    goal_res = client.post("/api/v1/goals", json=goal_data, headers=headers)
    assert goal_res.status_code == 201
    goal_id = goal_res.json()["id"]
    assert goal_res.json()["title"] == goal_data["title"]

    # 2. Create Task linked to Goal
    task_data = {
        "title": "Write pitch script",
        "description": "Finalize scene outline",
        "priority": "high",
        "goal_id": goal_id
    }
    task_res = client.post("/api/v1/tasks", json=task_data, headers=headers)
    assert task_res.status_code == 201
    task_id = task_res.json()["id"]
    assert task_res.json()["status"] == "pending"

    # 3. Toggle Task Completion & Verify Deterministic Gamification (XP & Streak)
    toggle_res = client.patch(f"/api/v1/tasks/{task_id}/toggle", headers=headers)
    assert toggle_res.status_code == 200
    toggle_data = toggle_res.json()
    assert toggle_data["task"]["status"] == "completed"
    assert toggle_data["xp_earned"] == 80
    assert toggle_data["current_streak"] == 1

    # 4. Verify Dashboard Overview
    dash_res = client.get("/api/v1/dashboard/overview", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["stats"]["total_tasks_today"] >= 1
    assert dash_data["stats"]["completed_tasks_today"] >= 1
    assert dash_data["stats"]["current_streak"] == 1

def test_episode_generation_flow():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "testhero@yourlifeyourseries.com",
        "password": "SuperPassword123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get Avatars and create series
    avatars_res = client.get("/api/v1/avatars")
    assert avatars_res.status_code == 200
    avatars = avatars_res.json()
    if not avatars:
        # Create avatar in test db if empty
        from app.models.story import Avatar
        db = TestingSessionLocal()
        av = Avatar(
            name="Cary Test",
            archetype="CEO",
            description="Test CEO",
            personality_traits=["ambitious"],
            visual_prompt_attributes="young businesswoman in blue blazer",
            is_template=True
        )
        db.add(av)
        db.commit()
        av_id = av.id
        db.close()
    else:
        av_id = avatars[0]["id"]

    series_res = client.post("/api/v1/series", json={
        "avatar_id": av_id,
        "title": "Rise of Test Hero",
        "genre": "romantic_comedy",
        "long_term_purpose": "Achieve legendary software impact"
    }, headers=headers)
    assert series_res.status_code == 201
    series_id = series_res.json()["id"]

    # 2. Trigger Episode Generation
    gen_res = client.post("/api/v1/episodes/generate", json={
        "series_id": series_id,
        "format": "video"
    }, headers=headers)
    assert gen_res.status_code == 201
    ep_data = gen_res.json()
    assert ep_data["episode_number"] == 1
    assert "Episode 1" in ep_data["title"]
    assert ep_data["generation_status"] == "completed"
    assert len(ep_data["scenes"]) >= 3
    assert ep_data["video_url"] is not None

    # 3. Retrieve Episode Library
    list_res = client.get("/api/v1/episodes", headers=headers)
    assert list_res.status_code == 200
    eps = list_res.json()
    assert len(eps) >= 1

def test_google_auth_flow():
    # 1. Test google url endpoint
    url_res = client.get("/api/v1/auth/google/url")
    assert url_res.status_code == 200
    assert "url" in url_res.json()
    
    # 2. Test google callback when unconfigured returns explicit 503 error (never auto-logging investor)
    callback_res = client.post("/api/v1/auth/google/callback", json={
        "code": "sample_mock_oauth_code"
    })
    assert callback_res.status_code in [400, 503]
    assert "investor" not in callback_res.text.lower()

def test_voice_task_extraction():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "testhero@yourlifeyourseries.com",
        "password": "SuperPassword123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    sample_voice = (
        "I am going to the office at 9 AM. I need to finish two quarterly reports "
        "and submit them to my manager before noon. After lunch, I have to give a presentation "
        "to the newly joined interns. At 4 PM, I need to prepare a five-minute speech for the conference."
    )
    res = client.post("/api/v1/tasks/extract-voice", json={"transcript": sample_voice}, headers=headers)
    assert res.status_code == 200
    body = res.json()
    assert "tasks" in body
    assert len(body["tasks"]) >= 3
    assert body["total_suggested_points"] >= 50
    categories = [t["category"] for t in body["tasks"]]
    assert "Work" in categories or "Presentation" in categories or "Preparation" in categories

def test_custom_identity_creation():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "testhero@yourlifeyourseries.com",
        "password": "SuperPassword123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    custom_identity_payload = {
        "name": "Vikram Adani",
        "display_name": "Vikram",
        "archetype": "Clean Energy Architect",
        "career": "Solar Grid Engineer",
        "category": "Technology and AI",
        "nationality": "Indian",
        "preferred_language": "English & Hindi",
        "age_range": "28-35",
        "description": "Pioneering distributed solar microgrids for smart agrarian cooperatives.",
        "personality_traits": ["Analytical", "Visionary", "Disciplined"],
        "strengths": ["Grid engineering", "Clean energy modeling"],
        "weaknesses": ["Impatience with government zoning permits"],
        "motivations": ["Accelerating decentralized renewable transition"],
        "visual_style": "Cinematic Photorealistic",
        "genre_preferences": ["Technology Drama", "Inspirational"]
    }
    create_res = client.post("/api/v1/avatars", json=custom_identity_payload, headers=headers)
    assert create_res.status_code == 201
    av_data = create_res.json()
    assert av_data["is_custom"] is True
    assert av_data["is_template"] is False
    assert av_data["name"] == "Vikram Adani"

def test_timeline_demo_and_evaluation():
    # 1. Public demo timeline for Cary
    demo_res = client.get("/api/v1/timeline/demo/cary")
    assert demo_res.status_code == 200
    demo_data = demo_res.json()
    assert demo_data["character"]["name"] == "Cary"
    assert len(demo_data["days"]) == 5
    day_1 = demo_data["days"][0]
    assert day_1["day_number"] == 1
    assert day_1["episodes"]["episode_a"]["title"] is not None
    assert "branch_80" in day_1["branch_previews"]

    # 2. Authenticated user today evaluation
    login_res = client.post("/api/v1/auth/login", json={
        "email": "testhero@yourlifeyourseries.com",
        "password": "SuperPassword123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    eval_res = client.post("/api/v1/timeline/evaluate-today", headers=headers)
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert "completion_percentage" in eval_data
    assert "current_streak" in eval_data


