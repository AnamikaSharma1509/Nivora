import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_user_ownership_and_isolation():
    """Verify User A and User B have strict data isolation"""
    # 1. Register User A (Anamika)
    res_a = client.post("/api/v1/auth/register", json={
        "email": "anamika.isolated@example.com",
        "password": "Password123!",
        "display_name": "Anamika Sharma"
    })
    assert res_a.status_code == 201
    token_a = res_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # 2. Register User B (Riya)
    res_b = client.post("/api/v1/auth/register", json={
        "email": "riya.isolated@example.com",
        "password": "Password123!",
        "display_name": "Riya Sen"
    })
    assert res_b.status_code == 201
    token_b = res_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. Anamika creates a destination goal and an aligned task
    goal_res = client.post("/api/v1/goals", json={
        "title": "Become an AI Systems Engineer",
        "description": "Design reliable infrastructure",
        "current_situation": "First year engineering student",
        "target_outcome": "Deploy distributed inference cluster",
        "milestones": [
            {"id": "m1", "title": "Python Programming", "weight": 30, "completed": False},
            {"id": "m2", "title": "Linux & Distributed Systems", "weight": 70, "completed": False}
        ]
    }, headers=headers_a)
    assert goal_res.status_code == 201
    goal_a_id = goal_res.json()["id"]

    task_res = client.post("/api/v1/tasks", json={
        "title": "Learn Python Functions",
        "points": 20,
        "goal_id": goal_a_id,
        "milestone_id": "m1"
    }, headers=headers_a)
    assert task_res.status_code == 201
    task_a = task_res.json()
    assert task_a["goal_alignment"] in ["direct", "foundational", "supporting"]
    assert task_a["alignment_reason"] is not None

    # 4. Riya queries tasks and goals - MUST NOT see Anamika's records
    riya_tasks = client.get("/api/v1/tasks", headers=headers_b).json()
    assert len(riya_tasks) == 0

    riya_goals = client.get("/api/v1/goals", headers=headers_b).json()
    assert len(riya_goals) == 0

def test_intelligent_goal_alignment_and_milestones():
    """Verify intelligent task alignment service against destination goals"""
    # Login as Anamika
    login_res = client.post("/api/v1/auth/login", json={
        "email": "anamika.isolated@example.com",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create directly aligned task
    task_direct = client.post("/api/v1/tasks", json={
        "title": "Write 5 Python recursive functions and test edge cases",
        "points": 30
    }, headers=headers).json()

    assert task_direct["alignment_score"] >= 70
    assert task_direct["alignment_reason"] is not None
    assert "technical" in task_direct["alignment_reason"].lower() or "ai systems engineer" in task_direct["alignment_reason"].lower()

def test_journey_momentum_and_progress_separation():
    """Verify Journey Momentum formula: min(streak/400, 1)*100 and separate milestone progress"""
    login_res = client.post("/api/v1/auth/login", json={
        "email": "anamika.isolated@example.com",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    timeline = client.get("/api/v1/timeline", headers=headers).json()
    assert "journey_momentum" in timeline
    assert "goal_progress" in timeline
    # With 0 streak, momentum is 0.0%
    assert timeline["journey_momentum"] == 0.0

def test_google_oauth_no_fake_investor():
    """Verify Google OAuth fails explicitly when unconfigured and never auto-logs fake investor"""
    res = client.post("/api/v1/auth/google/callback", json={
        "code": "invalid_mock_code"
    })
    # Must fail with 400 or 503, NEVER return 200 with investor demo account!
    assert res.status_code in [400, 503]
    assert "investor" not in res.text.lower()
