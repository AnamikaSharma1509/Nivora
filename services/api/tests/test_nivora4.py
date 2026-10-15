import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import datetime, timezone, timedelta
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_timeline_auth_isolation_no_demo_characters():
    """Verify that unauthenticated /api/v1/timeline returns 401 and authenticated returns user-only timeline without demo characters"""
    # 1. Unauthenticated access must fail with 401
    unauth_res = client.get("/api/v1/timeline")
    assert unauth_res.status_code == 401

    # 2. Register new protagonist
    email = f"protagonist_{datetime.now().timestamp()}@example.com"
    reg_res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "display_name": "Dev Protagonist"
    })
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create active goal with target date
    target_date = (datetime.now(timezone.utc) + timedelta(days=90)).strftime("%Y-%m-%d")
    goal_res = client.post("/api/v1/goals", json={
        "title": "Become an AI Systems Engineer",
        "description": "Design reliable distributed infrastructure",
        "category": "Career",
        "current_situation": "Engineering student building programming and systems fundamentals",
        "target_outcome": "Deploy distributed LLM inference cluster",
        "target_date": target_date,
        "milestones": [
            {"id": "m1", "title": "Systems Programming & Linux Kernel Primitives", "weight": 30, "completed": False},
            {"id": "m2", "title": "Distributed Systems & Asynchronous Networking", "weight": 70, "completed": False}
        ]
    }, headers=headers)
    assert goal_res.status_code == 201

    # 4. Fetch personal timeline
    timeline_res = client.get("/api/v1/timeline", headers=headers)
    assert timeline_res.status_code == 200
    timeline = timeline_res.json()

    # CRITICAL: Must be personal, not Cary or any demo character!
    assert timeline["is_demo"] is False
    assert timeline["character"]["name"] == "Dev Protagonist"
    assert "cary" not in timeline["character"]["name"].lower()

    # Section A: Goal overview
    assert timeline["goal"]["title"] == "Become an AI Systems Engineer"
    assert timeline["goal"]["days_remaining"] is not None
    assert timeline["goal"]["days_remaining"] > 0
    assert timeline["goal"]["is_overdue"] is False

    # Section C: Urgency and deadline
    assert timeline["deadline_urgency"]["has_target_date"] is True
    assert timeline["deadline_urgency"]["remaining_days"] is not None

    # Section D: Journey statistics
    assert timeline["stats"]["total_episodes"] == 0  # User has no episodes yet - NOT demo character count!
    assert timeline["stats"]["current_streak"] == 0

    # Section F: Personalized Roadmap
    assert "roadmap" in timeline
    assert timeline["roadmap"]["domain"] == "ai_systems_engineer"
    assert len(timeline["roadmap"]["milestones"]) >= 3
    # Check that domain-specific milestones are present
    assert any("systems programming" in m["title"].lower() or "distributed" in m["title"].lower() for m in timeline["roadmap"]["milestones"])

def test_roadmap_different_domains():
    """Verify distinct goals produce distinct, domain-specific roadmaps"""
    # 1. Fintech founder user
    email_fintech = f"fintech_{datetime.now().timestamp()}@example.com"
    reg = client.post("/api/v1/auth/register", json={
        "email": email_fintech,
        "password": "Password123!",
        "display_name": "Fintech Founder"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/api/v1/goals", json={
        "title": "Build a Cross-Border Fintech Gateway",
        "category": "Startup",
        "current_situation": "Financial analyst with regulatory sandbox clearance"
    }, headers=headers)

    timeline = client.get("/api/v1/timeline", headers=headers).json()
    assert timeline["roadmap"]["domain"] == "fintech_entrepreneur"
    milestone_titles = [m["title"].lower() for m in timeline["roadmap"]["milestones"]]
    assert any("merchant" in t or "regulatory" in t or "ledger" in t for t in milestone_titles)

def test_character_identity_and_human_avatar():
    """Verify authenticated identity loading, avatar selection persistence, and no duplicate records"""
    email = f"avatar_test_{datetime.now().timestamp()}@example.com"
    reg = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "display_name": "Maya User"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get identity (auto-initializes custom persona)
    res = client.get("/api/v1/avatars/my-identity", headers=headers)
    assert res.status_code == 200
    id_data = res.json()
    assert id_data["name"] == "Maya User"
    assert id_data["is_custom"] is True
    avatar_id = id_data["id"]

    # 2. Update human-style avatar options
    avatar_opts = {
        "hair_style": "curly_fade",
        "hair_color": "chestnut_brown",
        "skin_tone": "olive",
        "clothing_color": "navy_blue",
        "gender": "feminine"
    }
    opt_res = client.post("/api/v1/avatars/my-avatar", json={
        "avatar_options": avatar_opts,
        "image_url": "/avatars/maya.png"
    }, headers=headers)
    assert opt_res.status_code == 200
    updated = opt_res.json()
    assert updated["id"] == avatar_id  # Same avatar, no duplicate
    assert updated["avatar_options"]["hair_style"] == "curly_fade"
    assert updated["avatar_options"]["clothing_color"] == "navy_blue"

    # 3. Update character details in-place
    update_res = client.put("/api/v1/avatars/my-identity", json={
        "career": "Lead AI Architect",
        "description": "Architecting resilient distributed systems and neural clusters.",
        "personality_traits": ["Curious", "Strategic", "Analytical"]
    }, headers=headers)
    assert update_res.status_code == 200
    updated_identity = update_res.json()
    assert updated_identity["id"] == avatar_id  # Strictly same record!
    assert updated_identity["career"] == "Lead AI Architect"

def test_trait_adoption_from_character():
    """Verify adopting traits from characters like Elena Rostova does not alter user identity or goals"""
    email = f"trait_test_{datetime.now().timestamp()}@example.com"
    reg = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "display_name": "Alex Protagonist"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a goal
    client.post("/api/v1/goals", json={
        "title": "Master Distributed Systems",
        "current_situation": "Software engineer"
    }, headers=headers)

    # 2. Get initial identity
    initial_id = client.get("/api/v1/avatars/my-identity", headers=headers).json()
    assert initial_id["name"] == "Alex Protagonist"

    # 3. Adopt Elena Rostova's traits: Analytical, Unflappable, Tactical
    adopt_res = client.post("/api/v1/avatars/adopt-traits", json={
        "traits": ["Analytical", "Unflappable", "Tactical"]
    }, headers=headers)
    assert adopt_res.status_code == 200
    adopt_data = adopt_res.json()
    assert adopt_data["status"] == "success"
    assert "Analytical" in adopt_data["aspirational_traits"]
    assert "Unflappable" in adopt_data["aspirational_traits"]
    assert "Tactical" in adopt_data["aspirational_traits"]
    assert len(adopt_data["practical_development_suggestions"]) >= 3

    # 4. Verify user identity attributes did NOT change
    verify_id = client.get("/api/v1/avatars/my-identity", headers=headers).json()
    assert verify_id["name"] == "Alex Protagonist"
    assert verify_id["id"] == initial_id["id"]
    # Existing personality traits intact
    assert "Curious" in verify_id["personality_traits"]
    # Aspirational traits added
    assert "Analytical" in verify_id["aspirational_traits"]

    # 5. Prevent duplicates if adopted again
    adopt_res2 = client.post("/api/v1/avatars/adopt-traits", json={
        "traits": ["Analytical"]
    }, headers=headers)
    assert adopt_res2.status_code == 200
    assert len(adopt_res2.json()["added_traits"]) == 0

    # 6. Remove a trait
    del_res = client.delete("/api/v1/avatars/aspirational-traits/Tactical", headers=headers)
    assert del_res.status_code == 200
    assert "Tactical" not in del_res.json()["aspirational_traits"]

def test_explore_other_lives_demo_continuity():
    """Verify demo characters retain their 5-day continuity in Explore Other Lives"""
    # Demo endpoint for Cary
    cary_res = client.get("/api/v1/timeline/demo/cary")
    assert cary_res.status_code == 200
    cary = cary_res.json()
    assert cary["is_demo"] is True
    assert cary["character"]["name"] == "Cary"
    assert len(cary["days"]) == 5

    # Demo endpoint for Elena
    elena_res = client.get("/api/v1/timeline/demo/elena")
    assert elena_res.status_code == 200
    elena = elena_res.json()
    assert elena["is_demo"] is True
    assert elena["character"]["name"] == "Elena Rostova"
