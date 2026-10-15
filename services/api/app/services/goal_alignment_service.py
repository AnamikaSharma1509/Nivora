import re
from typing import Dict, Any, Optional, List
from app.models.productivity import Goal

class GoalAlignmentService:
    @staticmethod
    def evaluate_task_alignment(
        task_title: str,
        task_description: Optional[str] = None,
        task_category: str = "Work",
        goal: Optional[Goal] = None
    ) -> Dict[str, Any]:
        """
        Evaluates how a task connects to the user's ultimate goal.
        Categorizes into:
        - direct: directly advances the goal or key milestone
        - skill: builds a required capability or prerequisite knowledge
        - support: indirect support, career foundation, or health/enabling activity
        - routine: life maintenance, routine work, essential chores
        - unrelated: clear distraction or outside stated goal focus
        """
        title_lower = task_title.lower()
        desc_lower = (task_description or "").lower()
        full_text = f"{title_lower} {desc_lower}"

        if not goal:
            return {
                "goal_alignment": "routine",
                "alignment_score": 60,
                "alignment_reason": "No active long-term goal defined yet. This task contributes to your daily momentum.",
                "milestone_id": None,
                "suggested_next_step": "Define your primary ambition in onboarding or settings to get personalized goal alignment."
            }

        goal_title_lower = goal.title.lower()
        goal_desc_lower = (goal.description or "").lower()
        goal_text = f"{goal_title_lower} {goal_desc_lower} {goal.category.lower()}"
        
        milestones = goal.milestones or []
        matched_milestone_id = None
        matched_milestone_title = None

        # Check milestone match
        for m in milestones:
            m_title = m.get("title", "").lower()
            if m_title and any(w in full_text for w in m_title.split() if len(w) > 3):
                matched_milestone_id = m.get("id")
                matched_milestone_title = m.get("title")
                break

        # Semantic keywords based on goal category/topic
        is_ai_goal = any(w in goal_text for w in ["ai", "machine learning", "ml", "engineer", "software", "systems", "code"])
        is_startup_goal = any(w in goal_text for w in ["startup", "entrepreneur", "ceo", "fintech", "business", "founder", "venture", "revenue"])
        is_med_goal = any(w in goal_text for w in ["med", "doctor", "health", "resident", "clinical", "hospital"])
        is_creative_goal = any(w in goal_text for w in ["design", "art", "creative", "film", "story", "write", "portfolio"])
        is_fitness_goal = any(w in goal_text for w in ["athlete", "marathon", "fitness", "run", "sport", "physique"])

        # Direct alignment checks
        if is_ai_goal and any(w in full_text for w in ["python", "algorithm", "linux", "neural", "api", "model", "code", "debug", "data structure", "docker", "transformer"]):
            return {
                "goal_alignment": "direct",
                "alignment_score": 95,
                "alignment_reason": f"Directly builds core technical proficiency required for {goal.title}.",
                "milestone_id": matched_milestone_id or (milestones[0].get("id") if milestones else None),
                "suggested_next_step": "Test your implementation with boundary test cases to solidify understanding."
            }
        
        if is_startup_goal and any(w in full_text for w in ["pitch", "investor", "customer", "market", "pricing", "financial", "revenue", "product", "hiring", "deck", "term sheet", "user interview", "payment"]):
            return {
                "goal_alignment": "direct",
                "alignment_score": 95,
                "alignment_reason": f"Directly moves the needle on business traction for {goal.title}.",
                "milestone_id": matched_milestone_id or (milestones[0].get("id") if milestones else None),
                "suggested_next_step": "Document specific metrics or feedback immediately after the interaction."
            }

        if is_med_goal and any(w in full_text for w in ["clinical", "rounds", "patient", "surgical", "exam", "diagnostic", "pharmacology"]):
            return {
                "goal_alignment": "direct",
                "alignment_score": 95,
                "alignment_reason": f"Direct medical competency advancement for {goal.title}.",
                "milestone_id": matched_milestone_id,
                "suggested_next_step": "Review the differential diagnosis literature for today's complex cases."
            }

        # Skill building check
        if any(w in full_text for w in ["learn", "study", "read", "practice", "course", "exercise", "tutorial", "workshop"]):
            return {
                "goal_alignment": "skill",
                "alignment_score": 85,
                "alignment_reason": f"Builds foundational knowledge that feeds directly into {goal.title}.",
                "milestone_id": matched_milestone_id,
                "suggested_next_step": "Summarize three key takeaways into your permanent learning notes."
            }

        # Supporting & enabling check
        if task_category in ["Fitness", "Health"] or any(w in full_text for w in ["workout", "sleep", "meditate", "walk", "energy", "run", "nutrition"]):
            return {
                "goal_alignment": "support",
                "alignment_score": 75,
                "alignment_reason": "Maintains physical energy and cognitive stamina necessary for sustained high performance.",
                "milestone_id": None,
                "suggested_next_step": "Keep hydration high and stay mindful of recovery intervals."
            }

        if any(w in full_text for w in ["plan", "organize", "schedule", "clean", "desk", "inbox", "review"]):
            return {
                "goal_alignment": "support",
                "alignment_score": 70,
                "alignment_reason": "Creates an organized operational environment that clears mental friction for goal execution.",
                "milestone_id": None,
                "suggested_next_step": "Protect 90 minutes of undisturbed deep work right after organizing."
            }

        # Unrelated / distraction check
        if any(w in full_text for w in ["netflix", "scroll", "gaming", "browse random", "distraction", "binge"]):
            return {
                "goal_alignment": "unrelated",
                "alignment_score": 30,
                "alignment_reason": "Recreation is legitimate for balance, but does not move you closer to your primary ambition.",
                "milestone_id": None,
                "suggested_next_step": "Set a firm boundary on leisure time before returning to your key milestone."
            }

        # Default routine
        return {
            "goal_alignment": "routine",
            "alignment_score": 65,
            "alignment_reason": "Maintains daily responsibilities and steady forward consistency.",
            "milestone_id": matched_milestone_id,
            "suggested_next_step": "Pair this routine responsibility with a focused 30-minute block on your core ambition."
        }
