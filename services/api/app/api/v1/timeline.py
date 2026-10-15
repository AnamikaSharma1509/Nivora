from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.deps import get_current_user, get_optional_user
from app.models.user import User
from app.models.productivity import Task, DailyPlan, Goal
from app.models.story import Series, Episode, Avatar
from app.services.roadmap_service import RoadmapService

router = APIRouter(prefix="/timeline", tags=["Timeline & Continuity"])

DEMO_CHARACTERS = {
    "cary": {
        "name": "Cary",
        "title": "Startup Founder & CEO",
        "genre": "Corporate Drama",
        "avatar": "/avatars/cary.png",
        "career": "Startup Founder & CEO",
        "bio": "Ambitious founder steering an AI infrastructure company through tight deadlines, board reviews, and series-A milestones.",
        "personality": ["Ambitious", "Analytical", "Resilient", "Strategic"],
    },
    "meera": {
        "name": "Meera",
        "title": "AI Systems Engineer",
        "genre": "Tech Drama & Inspiration",
        "avatar": "/avatars/meera.png",
        "career": "AI Engineer",
        "bio": "Brilliant machine learning architect debugging distributed neural clusters and presenting cutting-edge research.",
        "personality": ["Curious", "Creative", "Persistent", "Collaborative"],
    },
    "aarav": {
        "name": "Aarav",
        "title": "Fintech Entrepreneur",
        "genre": "Business Drama",
        "avatar": "/avatars/aarav.png",
        "career": "Entrepreneur",
        "bio": "Dynamic founder building India's fastest-growing cross-border payments gateway while courting venture partners.",
        "personality": ["Visionary", "Energetic", "Adaptable", "Charismatic"],
    },
    "ananya": {
        "name": "Ananya",
        "title": "Medical Resident",
        "genre": "Slice of Life & Drama",
        "avatar": "/avatars/ananya.png",
        "career": "Medical Student / Resident",
        "bio": "Dedicated physician-in-training navigating clinical rotations, surgical diagnostics, and high-stakes licensing exams.",
        "personality": ["Disciplined", "Empathetic", "Reflective", "Focused"],
    },
    "riya": {
        "name": "Riya",
        "title": "Lead Product Designer",
        "genre": "Creative Rom-Com & Drama",
        "avatar": "/avatars/riya.png",
        "career": "Creative Professional & Designer",
        "bio": "Innovative design lead managing global client launches, generative studio aesthetics, and creative team dynamics.",
        "personality": ["Expressive", "Imaginative", "Socially Aware", "Bold"],
    },
    "arjun": {
        "name": "Arjun",
        "title": "Decathlete & Sports Scientist",
        "genre": "Sports Drama",
        "avatar": "/avatars/arjun.png",
        "career": "Aspiring Athlete",
        "bio": "Relentless competitor balancing biometric tracking, endurance cycles, and national championship trials.",
        "personality": ["Competitive", "Disciplined", "Resilient", "Stoic"],
    },
    "elena": {
        "name": "Elena Rostova",
        "title": "Tech Founder & Cybersecurity Architect",
        "genre": "High-Stakes Tech Drama",
        "avatar": "/avatars/elena.png",
        "career": "Technology Founder",
        "bio": "A brilliant cybersecurity architect uncovering corporate anomalies while building decentralized privacy networks.",
        "personality": ["Analytical", "Unflappable", "Tactical", "Resourceful"],
    }
}


@router.get("/demo/{character_key}")
def get_demo_timeline(character_key: str, db: Session = Depends(get_db)):
    key = character_key.lower().strip()
    if key not in DEMO_CHARACTERS:
        key = "cary"
        
    char_info = DEMO_CHARACTERS[key]
    
    # Query demo episodes for this character from DB
    episodes = db.query(Episode).filter(
        Episode.demo_character_key == key
    ).order_by(Episode.day_number.asc(), Episode.episode_slot.asc()).all()
    
    # Group episodes by day_number (1 to 5)
    days = []
    
    # Pre-calculated demo daily narratives
    demo_day_plans = {
        1: {
            "tasks": [
                {"title": "Review financial charts & finish quarterly report", "points": 30, "status": "completed", "category": "Work", "due_at": "Before noon"},
                {"title": "Handover finalized document to executive board", "points": 20, "status": "completed", "category": "Work", "due_at": "1:00 PM"},
                {"title": "Deliver keynote presentation to incoming cohorts", "points": 30, "status": "completed", "category": "Presentation", "due_at": "After lunch"},
                {"title": "Prepare 5-minute conference address", "points": 20, "status": "completed", "category": "Preparation", "due_at": "4:00 PM"},
            ],
            "is_missed": False,
            "completion_percentage": 100.0,
            "streak_qualified": True,
            "branch_previews": {
                "branch_80": {
                    "narrative": f"{char_info['name']} completes the report on time, but a key metrics variance triggers an impromptu evening audit.",
                    "outcome": "Good progress made with one pending operational challenge.",
                    "reward": "+50 XP, Continuity Unlocked"
                },
                "branch_90": {
                    "narrative": f"{char_info['name']} delivers a compelling draft that earns leadership praise, yet an unexpected partner question arises.",
                    "outcome": "Strong momentum, team confidence elevated.",
                    "reward": "+80 XP, Partner Inquiry"
                },
                "branch_100": {
                    "narrative": f"{char_info['name']} executes all scheduled deliverables flawlessly, earning a surprise invitation from a tier-1 institutional backer.",
                    "outcome": "Flawless Day 1 milestone unlocked, strategic doors open.",
                    "reward": "+120 XP, Legendary Streak Multiplier"
                }
            }
        },
        2: {
            "tasks": [
                {"title": "Review term sheet redlines & feedback", "points": 35, "status": "completed", "category": "Work", "due_at": "10:30 AM"},
                {"title": "Conduct emergency architecture sync with core leads", "points": 35, "status": "completed", "category": "Work", "due_at": "2:00 PM"},
                {"title": "Draft follow-up brief for institutional committee", "points": 30, "status": "completed", "category": "Work", "due_at": "5:30 PM"},
            ],
            "is_missed": False,
            "completion_percentage": 100.0,
            "streak_qualified": True,
            "branch_previews": {
                "branch_80": {
                    "narrative": f"Crucial redlines are reconciled, but team bandwidth requires pushing back the integration deadline.",
                    "outcome": "Tension rises over timeline commitments.",
                    "reward": "+60 XP"
                },
                "branch_90": {
                    "narrative": f"Technical leads align on design parameters, leaving only one governance approval outstanding.",
                    "outcome": "High cohesion with minimal friction.",
                    "reward": "+90 XP"
                },
                "branch_100": {
                    "narrative": f"Unanimous executive consensus achieved on all clauses; partner committee moves directly to closing phase.",
                    "outcome": "Day 2 Milestone: Complete consensus locked in.",
                    "reward": "+130 XP, High Momentum"
                }
            }
        },
        3: {
            "tasks": [
                {"title": "Scheduled deep-work sprint & strategy alignment", "points": 50, "status": "missed", "category": "Work", "due_at": "11:00 AM"},
                {"title": "Cross-functional roadmap sync", "points": 50, "status": "missed", "category": "Planning", "due_at": "3:00 PM"},
            ],
            "is_missed": True,
            "completion_percentage": 0.0,
            "streak_qualified": False,
            "recovery_message": f"{char_info['name']} faced severe operational disruptions and missed Day 3. The previous 2-day streak paused, but continuity recovery triggers immediately upon return.",
            "branch_previews": {
                "branch_80": {"narrative": "Partial recovery saves immediate client deliverables.", "outcome": "Stabilized", "reward": "+40 XP"},
                "branch_90": {"narrative": "Resilient sprint recovers core architecture milestone.", "outcome": "Bounce back", "reward": "+75 XP"},
                "branch_100": {"narrative": "Phenomenal double-shift clears backlog completely.", "outcome": "Full comeback unlocked", "reward": "+150 XP, Resilience Badge"}
            }
        },
        4: {
            "tasks": [
                {"title": "Crisis triage & backlog recovery sprint", "points": 40, "status": "completed", "category": "Work", "due_at": "9:30 AM"},
                {"title": "Resolve critical deployment blocker", "points": 35, "status": "completed", "category": "Work", "due_at": "1:00 PM"},
                {"title": "Customer satisfaction debrief & sign-off", "points": 25, "status": "completed", "category": "Work", "due_at": "4:30 PM"},
            ],
            "is_missed": False,
            "completion_percentage": 100.0,
            "streak_qualified": True,
            "recovery_message": "Resumed journey on Day 4. Streak reset to 1 day, previous longest streak preserved at 2 days.",
            "branch_previews": {
                "branch_80": {"narrative": "Triage holds the ship steady, but fatigue shows.", "outcome": "Recovering", "reward": "+50 XP"},
                "branch_90": {"narrative": "Quick resolution earns praise from client champions.", "outcome": "Reputation restored", "reward": "+85 XP"},
                "branch_100": {"narrative": "Flawless turnaround turns a critical setback into a landmark victory.", "outcome": "Turning point achieved", "reward": "+140 XP"}
            }
        },
        5: {
            "tasks": [
                {"title": "Final product milestone presentation", "points": 40, "status": "completed", "category": "Presentation", "due_at": "11:00 AM"},
                {"title": "Sign pilot contracts with anchor partners", "points": 35, "status": "completed", "category": "Work", "due_at": "2:30 PM"},
                {"title": "Host celebration townhall & retrospective", "points": 25, "status": "completed", "category": "Personal", "due_at": "5:00 PM"},
            ],
            "is_missed": False,
            "completion_percentage": 100.0,
            "streak_qualified": True,
            "branch_previews": {
                "branch_80": {"narrative": "Pilot signed with conditional trial terms.", "outcome": "Validated", "reward": "+70 XP"},
                "branch_90": {"narrative": "Contracts signed unconditionally; expansion talks begin.", "outcome": "Major Growth", "reward": "+100 XP"},
                "branch_100": {"narrative": "Multi-year deal signed with full prepayment; Season 1 grand finale unlocked!", "outcome": "Season 1 Victory", "reward": "+200 XP, Season Champion Trophy"}
            }
        }
    }
    
    for day_num in range(1, 6):
        day_eps = [e for e in episodes if e.day_number == day_num]
        ep_a = next((e for e in day_eps if e.episode_slot == "A"), None)
        ep_b = next((e for e in day_eps if e.episode_slot == "B"), None)
        
        plan_meta = demo_day_plans.get(day_num, {
            "tasks": [],
            "is_missed": False,
            "completion_percentage": 100.0,
            "streak_qualified": True,
            "branch_previews": {}
        })
        
        days.append({
            "day_number": day_num,
            "date": f"Day {day_num}",
            "is_missed": plan_meta["is_missed"],
            "completion_percentage": plan_meta["completion_percentage"],
            "streak_qualified": plan_meta["streak_qualified"],
            "recovery_message": plan_meta.get("recovery_message"),
            "tasks": plan_meta["tasks"],
            "episodes": {
                "episode_a": {
                    "id": ep_a.id if ep_a else f"demo-{key}-d{day_num}-a",
                    "title": ep_a.title if ep_a else f"{char_info['name']}: Day {day_num} Part 1",
                    "summary": ep_a.summary if ep_a else f"Morning sprint and initial tasks for Day {day_num}.",
                    "full_script": ep_a.full_script if ep_a else None,
                    "video_url": ep_a.video_url if ep_a else f"/media/demo/{key}/day-0{day_num}/episode-a.mp4",
                    "thumbnail_url": ep_a.thumbnail_url if ep_a else f"/thumbnails/{key}_day{day_num}_a.png",
                    "duration_seconds": ep_a.duration_seconds if ep_a else 60.0,
                    "generation_status": ep_a.generation_status if ep_a else "completed"
                },
                "episode_b": {
                    "id": ep_b.id if ep_b else f"demo-{key}-d{day_num}-b",
                    "title": ep_b.title if ep_b else f"{char_info['name']}: Day {day_num} Part 2",
                    "summary": ep_b.summary if ep_b else f"Afternoon execution and cliffhanger for Day {day_num}.",
                    "full_script": ep_b.full_script if ep_b else None,
                    "video_url": ep_b.video_url if ep_b else f"/media/demo/{key}/day-0{day_num}/episode-b.mp4",
                    "thumbnail_url": ep_b.thumbnail_url if ep_b else f"/thumbnails/{key}_day{day_num}_b.png",
                    "duration_seconds": ep_b.duration_seconds if ep_b else 60.0,
                    "generation_status": ep_b.generation_status if ep_b else "completed"
                }
            },
            "branch_previews": plan_meta["branch_previews"]
        })

    return {
        "character": char_info,
        "is_demo": True,
        "character_key": key,
        "stats": {
            "total_tracked_days": 5,
            "current_streak": 2,
            "longest_streak": 2,
            "completed_tasks": 13,
            "missed_tasks": 2,
            "episodes_generated": 10,
            "overall_completion_rate": 86.6,
        },
        "days": days
    }

@router.get("")
@router.get("/")
def get_user_timeline(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Dedicated personal Timeline for the authenticated protagonist.
    Strictly isolated: never mixes demo character histories or public investor demo records.
    """
    now = datetime.now(timezone.utc)

    # 1. Fetch user's active goal
    active_goal = db.query(Goal).filter(
        Goal.user_id == current_user.id,
        Goal.is_completed == False
    ).order_by(Goal.created_at.desc()).first()

    # 2. Fetch user's active series & avatar
    series = db.query(Series).filter(Series.user_id == current_user.id, Series.status == "active").first()
    avatar = None
    if series and series.avatar:
        avatar = series.avatar
    else:
        avatar = db.query(Avatar).filter(Avatar.user_id == current_user.id).first()

    # 3. Fetch user's actual tasks
    tasks = db.query(Task).filter(Task.user_id == current_user.id).order_by(Task.due_date.asc().nullslast(), Task.created_at.desc()).all()
    
    # 4. Fetch user's persistent daily plans
    daily_plans = db.query(DailyPlan).filter(
        DailyPlan.user_id == current_user.id
    ).order_by(DailyPlan.day_number.asc()).all()

    # 5. Fetch user's own episodes ONLY (Never demo episodes)
    episodes = db.query(Episode).filter(
        Episode.user_id == current_user.id
    ).order_by(Episode.episode_number.asc()).all()

    # Calculate metrics
    total_tasks_count = len(tasks)
    completed_tasks_count = sum(1 for t in tasks if t.status == "completed")
    overall_rate = round((completed_tasks_count / total_tasks_count * 100), 1) if total_tasks_count > 0 else 0.0

    # Journey Momentum: min(streak / 400.0, 1.0) * 100
    journey_momentum = round(min(current_user.current_streak / 400.0, 1.0) * 100, 2)

    # Goal Progress: completed milestone weights / total milestone weights
    milestones = active_goal.milestones or [] if active_goal else []
    completed_milestones_count = 0
    remaining_milestones_count = len(milestones)
    goal_progress = 0.0
    if milestones and len(milestones) > 0:
        total_weight = sum(m.get("weight", 10) for m in milestones)
        completed_weight = sum(m.get("weight", 10) for m in milestones if m.get("completed", False))
        goal_progress = round((completed_weight / total_weight) * 100, 1) if total_weight > 0 else 0.0
        completed_milestones_count = sum(1 for m in milestones if m.get("completed", False))
        remaining_milestones_count = len(milestones) - completed_milestones_count
    elif total_tasks_count > 0:
        goal_progress = overall_rate

    # Generate personalized roadmap
    roadmap_data = RoadmapService.generate_personalized_roadmap(active_goal, tasks)

    # Target date & deadline urgency
    target_date = active_goal.target_date if (active_goal and active_goal.target_date) else None
    if target_date:
        if target_date.tzinfo is None:
            target_date_utc = target_date.replace(tzinfo=timezone.utc)
        else:
            target_date_utc = target_date
        remaining_days = (target_date_utc - now).days
        is_overdue = remaining_days < 0
        if is_overdue:
            remaining_time_label = f"Overdue by {abs(remaining_days)} day{'s' if abs(remaining_days) > 1 else ''}"
            schedule_status = "overdue"
        elif remaining_days == 0:
            remaining_time_label = "Target deadline is today"
            schedule_status = "on_schedule"
        elif remaining_days < 30:
            remaining_time_label = f"{remaining_days} days remaining"
            schedule_status = roadmap_data.get("schedule_status", "on_schedule")
        else:
            months = remaining_days // 30
            rem_d = remaining_days % 30
            remaining_time_label = f"{months} mo {rem_d} d remaining" if rem_d else f"{months} mo remaining"
            schedule_status = roadmap_data.get("schedule_status", "on_schedule")

        created_at_utc = active_goal.created_at.replace(tzinfo=timezone.utc) if active_goal.created_at.tzinfo is None else active_goal.created_at
        total_planned_days = max(1, (target_date_utc - created_at_utc).days)
        elapsed_days = max(0, (now - created_at_utc).days)
        progress_through_timeline = min(100.0, round((elapsed_days / total_planned_days) * 100, 1))
    else:
        remaining_days = None
        is_overdue = False
        remaining_time_label = "No target date set"
        schedule_status = "not_set"
        progress_through_timeline = 0.0

    current_milestone = roadmap_data.get("summary", {}).get("current_milestone", "First Milestone Sprint")
    next_milestone_deadline = roadmap_data.get("summary", {}).get("next_milestone_deadline")

    # Format today's task list and compute alignment breakdown
    today_tasks_list = []
    direct_count = 0
    indirect_count = 0
    routine_count = 0
    direct_titles = []

    for t in tasks:
        align = t.goal_alignment or "routine"
        if align == "direct":
            direct_count += 1
            if len(direct_titles) < 2:
                direct_titles.append(t.title)
        elif align in ["skill", "support"]:
            indirect_count += 1
        else:
            routine_count += 1

        today_tasks_list.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "status": t.status,
            "priority": t.priority,
            "points": t.points,
            "category": t.category,
            "goal_alignment": align,
            "milestone_id": t.milestone_id,
            "alignment_score": t.alignment_score or 70,
            "alignment_reason": t.alignment_reason or "Contributes to daily productivity momentum.",
            "due_at": t.due_date.strftime("%I:%M %p") if t.due_date else None,
            "completed_at": t.completed_at.strftime("%I:%M %p") if t.completed_at else None,
            "suggested_next_step": t.suggested_next_step
        })

    # Alignment explanation
    explanation_parts = []
    if direct_titles:
        goal_name = active_goal.title if active_goal else "your ultimate ambition"
        explanation_parts.append(f"Your focus on '{direct_titles[0]}' directly accelerates your {goal_name} roadmap.")
    if indirect_count > 0:
        explanation_parts.append(f"{indirect_count} task(s) strengthen prerequisite foundation and system capabilities.")
    if routine_count > 0 and (direct_count == 0 and indirect_count == 0):
        explanation_parts.append("Consider aligning today's remaining tasks with your primary milestones to maximize forward momentum.")
    elif not explanation_parts:
        explanation_parts.append("Maintain consistency across today's tasks to extend your qualifying streak.")
    concise_explanation = " ".join(explanation_parts)

    today_summary = {
        "total_tasks": total_tasks_count,
        "completed_tasks": completed_tasks_count,
        "remaining_tasks": max(0, total_tasks_count - completed_tasks_count),
        "weighted_completion_percentage": overall_rate,
        "direct_supporting_count": direct_count,
        "indirect_supporting_count": indirect_count,
        "routine_or_unaligned_count": routine_count,
        "concise_explanation": concise_explanation
    }

    # Format historical daily journey
    days = []
    if not daily_plans:
        days = [{
            "day_number": 1,
            "date": now.strftime("%Y-%m-%d"),
            "is_missed": False,
            "completion_percentage": overall_rate,
            "streak_qualified": overall_rate >= 80.0,
            "recovery_message": None,
            "next_recommended_action": "Complete remaining aligned tasks before midnight evaluation to qualify your streak.",
            "tasks": [{"title": t.title, "points": t.points, "status": t.status, "category": t.category, "due_at": t.due_date.strftime("%I:%M %p") if t.due_date else None} for t in tasks],
            "episodes": {
                "episode_a": {
                    "id": episodes[0].id if len(episodes) > 0 else None,
                    "title": episodes[0].title if len(episodes) > 0 else "Episode 1: The Initial Ascent",
                    "summary": episodes[0].summary if len(episodes) > 0 else "Your personal journey begins with deliberate daily focus.",
                    "full_script": episodes[0].full_script if len(episodes) > 0 else None,
                    "video_url": episodes[0].video_url if len(episodes) > 0 else None,
                    "thumbnail_url": episodes[0].thumbnail_url if len(episodes) > 0 else None,
                    "duration_seconds": episodes[0].duration_seconds if len(episodes) > 0 else 60.0,
                    "generation_status": episodes[0].generation_status if len(episodes) > 0 else "pending"
                },
                "episode_b": {
                    "id": episodes[1].id if len(episodes) > 1 else None,
                    "title": episodes[1].title if len(episodes) > 1 else "Episode 2: Evening Evaluation",
                    "summary": episodes[1].summary if len(episodes) > 1 else "Reflecting on daily outcomes and locking in tomorrow's milestone priorities.",
                    "full_script": episodes[1].full_script if len(episodes) > 1 else None,
                    "video_url": episodes[1].video_url if len(episodes) > 1 else None,
                    "thumbnail_url": episodes[1].thumbnail_url if len(episodes) > 1 else None,
                    "duration_seconds": episodes[1].duration_seconds if len(episodes) > 1 else 60.0,
                    "generation_status": episodes[1].generation_status if len(episodes) > 1 else "pending"
                }
            },
            "branch_previews": {
                "branch_80": {"narrative": "Completing 80% weighted points secures continuity and unlocks tomorrow's morning momentum advantage.", "outcome": "Steady Rise", "reward": "+50 XP"},
                "branch_90": {"narrative": "Reaching 90% reveals unexpected progress on your destination milestone.", "outcome": "Accelerated Velocity", "reward": "+80 XP"},
                "branch_100": {"narrative": "Flawless 100% completion unlocks the golden narrative sequence and maximum streak multiplier.", "outcome": "Mastery Achieved", "reward": "+120 XP"}
            }
        }]
    else:
        for p in daily_plans:
            day_eps = [e for e in episodes if getattr(e, "day_number", 1) == p.day_number]
            ep_a = next((e for e in day_eps if getattr(e, "episode_slot", "A") == "A"), (day_eps[0] if day_eps else None))
            ep_b = next((e for e in day_eps if getattr(e, "episode_slot", "A") == "B"), (day_eps[1] if len(day_eps) > 1 else None))

            days.append({
                "day_number": p.day_number,
                "date": p.plan_date,
                "is_missed": p.is_missed,
                "completion_percentage": p.completion_percentage,
                "streak_qualified": p.streak_qualified,
                "recovery_message": "Streak recovered! Keep the momentum." if not p.is_missed and p.streak_qualified else (
                    "Operational pause. Prioritize tomorrow's core tasks to resume your streak." if p.is_missed else None
                ),
                "next_recommended_action": "Target the next uncompleted milestone deliverable." if p.streak_qualified else "Resume consistent focus.",
                "tasks": p.task_snapshot or [],
                "episodes": {
                    "episode_a": {
                        "id": ep_a.id if ep_a else None,
                        "title": ep_a.title if ep_a else f"Day {p.day_number} Part 1",
                        "summary": ep_a.summary if ep_a else "Morning sprint and execution.",
                        "full_script": ep_a.full_script if ep_a else None,
                        "video_url": ep_a.video_url if ep_a else None,
                        "thumbnail_url": ep_a.thumbnail_url if ep_a else None,
                        "duration_seconds": ep_a.duration_seconds if ep_a else 60.0,
                        "generation_status": ep_a.generation_status if ep_a else "completed"
                    },
                    "episode_b": {
                        "id": ep_b.id if ep_b else None,
                        "title": ep_b.title if ep_b else f"Day {p.day_number} Part 2",
                        "summary": ep_b.summary if ep_b else "Evening retrospective and outcome.",
                        "full_script": ep_b.full_script if ep_b else None,
                        "video_url": ep_b.video_url if ep_b else None,
                        "thumbnail_url": ep_b.thumbnail_url if ep_b else None,
                        "duration_seconds": ep_b.duration_seconds if ep_b else 60.0,
                        "generation_status": ep_b.generation_status if ep_b else "completed"
                    }
                },
                "branch_previews": {
                    "branch_80": {"narrative": "Completing 80% secures steady progression.", "outcome": "Solid Advance", "reward": "+50 XP"},
                    "branch_90": {"narrative": "90% completion gains momentum.", "outcome": "High Momentum", "reward": "+80 XP"},
                    "branch_100": {"narrative": "100% completion unlocks the golden milestone arc.", "outcome": "Golden Milestone", "reward": "+120 XP"}
                }
            })

    days_elapsed = max(1, (now - current_user.created_at.replace(tzinfo=timezone.utc)).days) if current_user.created_at else max(len(days), 1)

    return {
        "character": {
            "name": current_user.display_name,
            "title": avatar.archetype if avatar else "Protagonist",
            "genre": series.genre if series else "Personal Journey",
            "avatar": avatar.image_url if (avatar and avatar.image_url) else "/avatars/meera.png",
            "career": avatar.career if (avatar and avatar.career) else "Ambitious Creator",
            "bio": active_goal.description if active_goal else (avatar.description if avatar else "Your personal life journey."),
            "personality": avatar.personality_traits if avatar else ["Disciplined", "Ambitious"],
            "aspirational_traits": avatar.aspirational_traits if avatar else [],
            "avatar_options": avatar.avatar_options if avatar else {}
        },
        "goal": {
            "title": active_goal.title if active_goal else "Define Your Core Ambition",
            "description": active_goal.description if active_goal else "Set a destination goal to align daily actions.",
            "category": active_goal.category if active_goal else "Career",
            "current_situation": active_goal.current_situation if active_goal else "Starting fresh",
            "target_outcome": active_goal.target_outcome if active_goal else None,
            "target_date": target_date.strftime("%Y-%m-%d") if target_date else None,
            "days_remaining": remaining_days,
            "remaining_time_label": remaining_time_label,
            "is_overdue": is_overdue,
            "schedule_status": schedule_status,
            "goal_progress": goal_progress,
            "journey_momentum": journey_momentum,
            "milestones": milestones,
            "next_milestone": current_milestone
        } if active_goal else None,
        "today_tasks": today_tasks_list,
        "today_summary": today_summary,
        "deadline_urgency": {
            "target_date": target_date.strftime("%Y-%m-%d") if target_date else None,
            "remaining_days": remaining_days,
            "remaining_time_label": remaining_time_label,
            "progress_through_planned_timeline": progress_through_timeline,
            "current_milestone": current_milestone,
            "next_milestone_deadline": next_milestone_deadline,
            "schedule_status": schedule_status,
            "is_overdue": is_overdue,
            "has_target_date": target_date is not None
        },
        "stats": {
            "total_tracked_days": max(len(days), 1),
            "current_streak": current_user.current_streak,
            "longest_streak": current_user.longest_streak,
            "completed_tasks": completed_tasks_count,
            "missed_tasks": max(0, total_tasks_count - completed_tasks_count),
            "episodes_generated": len(episodes),
            "total_episodes": len(episodes),
            "overall_completion_rate": overall_rate,
            "journey_momentum": journey_momentum,
            "goal_progress": goal_progress,
            "completed_milestones": completed_milestones_count,
            "remaining_milestones": remaining_milestones_count,
            "days_elapsed": days_elapsed
        },
        "roadmap": roadmap_data,
        "days": days,
        "is_demo": False,
        "journey_momentum": journey_momentum,
        "goal_progress": goal_progress
    }


@router.post("/evaluate-today")
async def evaluate_today(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Evaluates today's task points and creates a persistent snapshot.
    Evaluates streak qualification (threshold >= 80% weighted points).
    Unlocks and generates the user's personalized daily episode.
    """
    tasks = db.query(Task).filter(Task.user_id == current_user.id).all()
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    total_pts = sum(t.points for t in tasks)
    completed_pts = sum(t.points for t in tasks if t.status == "completed")
    
    rate = round((completed_pts / total_pts * 100), 1) if total_pts > 0 else 0.0
    qualifies = rate >= 80.0
    
    # Check if a plan already exists for today
    plan = db.query(DailyPlan).filter(
        DailyPlan.user_id == current_user.id,
        DailyPlan.plan_date == today_str
    ).first()
    
    snapshot = [
        {
            "id": t.id,
            "title": t.title,
            "points": t.points,
            "category": t.category,
            "status": t.status,
            "priority": t.priority,
            "goal_alignment": t.goal_alignment
        } for t in tasks
    ]
    
    if not plan:
        count_previous = db.query(func.count(DailyPlan.id)).filter(DailyPlan.user_id == current_user.id).scalar() or 0
        plan = DailyPlan(
            user_id=current_user.id,
            plan_date=today_str,
            day_number=count_previous + 1,
            total_points=total_pts,
            completed_points=completed_pts,
            completion_percentage=rate,
            task_snapshot=snapshot,
            is_missed=rate == 0.0 and len(tasks) > 0,
            streak_qualified=qualifies
        )
        db.add(plan)
    else:
        plan.total_points = total_pts
        plan.completed_points = completed_pts
        plan.completion_percentage = rate
        plan.task_snapshot = snapshot
        plan.streak_qualified = qualifies
        plan.is_missed = rate == 0.0 and len(tasks) > 0
    
    # Update streak
    if qualifies:
        current_user.current_streak += 1
        if current_user.current_streak > current_user.longest_streak:
            current_user.longest_streak = current_user.current_streak
    else:
        current_user.current_streak = 0
        
    current_user.last_active_date = datetime.now(timezone.utc)
    db.commit()
    db.refresh(plan)
    db.refresh(current_user)

    # Journey momentum calculation: min(consecutive_days / 400, 1) * 100
    journey_momentum = round(min(current_user.current_streak / 400.0, 1.0) * 100, 1)

    # Generate or retrieve user's personalized daily episode
    from app.services.story_service import StoryService
    from app.schemas.story import EpisodeGenerateRequest
    story_service = StoryService(db)

    # Ensure user has an active series
    series = story_service.get_active_series(current_user.id)
    if not series:
        from app.schemas.story import SeriesCreate
        active_goal = db.query(Goal).filter(Goal.user_id == current_user.id).first()
        default_avatar = db.query(Avatar).filter(Avatar.name == "Meera").first() or db.query(Avatar).first()
        if default_avatar:
            series = story_service.create_series(
                current_user.id,
                SeriesCreate(
                    avatar_id=default_avatar.id,
                    title=f"{current_user.display_name}'s Ascent",
                    genre="Technology Drama",
                    long_term_purpose=active_goal.title if active_goal else "Strategic Goal Mastery"
                )
            )

    episode_id = None
    if series:
        # Check if an episode for this day already exists to ensure idempotency
        existing_ep = db.query(Episode).filter(
            Episode.user_id == current_user.id,
            Episode.day_number == plan.day_number
        ).first()

        if existing_ep:
            episode_id = existing_ep.id
        else:
            try:
                new_ep, _ = await story_service.generate_episode(
                    current_user.id,
                    EpisodeGenerateRequest(series_id=series.id),
                    sync_generation=True
                )
                new_ep.day_number = plan.day_number
                db.commit()
                episode_id = new_ep.id
            except Exception as e:
                print(f"Notice during episode generation: {e}")
                # If an episode already exists for this series, fallback to latest
                latest = db.query(Episode).filter(Episode.user_id == current_user.id).order_by(Episode.created_at.desc()).first()
                if latest:
                    episode_id = latest.id

    return {
        "status": "evaluated",
        "day_number": plan.day_number,
        "completion_percentage": rate,
        "streak_qualified": qualifies,
        "current_streak": current_user.current_streak,
        "longest_streak": current_user.longest_streak,
        "journey_momentum": journey_momentum,
        "plan_id": plan.id,
        "episode_id": episode_id
    }
