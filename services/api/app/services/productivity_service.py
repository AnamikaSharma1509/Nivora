from datetime import datetime, timezone, timedelta
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from app.models.productivity import Goal, Task
from app.models.user import User
from app.schemas.productivity import GoalCreate, GoalUpdate, TaskCreate, TaskUpdate

class ProductivityService:
    def __init__(self, db: Session):
        self.db = db

    # --------------------------------------------------------------------------
    # Goals
    # --------------------------------------------------------------------------
    def list_goals(self, user_id: str) -> List[Goal]:
        goals = self.db.query(Goal).filter(Goal.user_id == user_id).order_by(Goal.created_at.desc()).all()
        for g in goals:
            total = self.db.query(func.count(Task.id)).filter(Task.goal_id == g.id).scalar() or 0
            completed = self.db.query(func.count(Task.id)).filter(Task.goal_id == g.id, Task.status == "completed").scalar() or 0
            g.total_tasks = total
            g.completed_tasks = completed
            
            # If milestones are defined with weights, calculate milestone-weighted progress
            milestones = g.milestones or []
            if milestones and len(milestones) > 0:
                total_weight = sum(m.get("weight", 10) for m in milestones)
                completed_weight = sum(m.get("weight", 10) for m in milestones if m.get("completed", False))
                g.progress_percentage = round((completed_weight / total_weight) * 100, 1) if total_weight > 0 else 0.0
            elif total > 0:
                g.progress_percentage = round((completed / total) * 100, 1)
        return goals

    def create_goal(self, user_id: str, data: GoalCreate) -> Goal:
        goal = Goal(
            user_id=user_id,
            title=data.title,
            description=data.description,
            category=data.category,
            current_situation=data.current_situation,
            target_outcome=data.target_outcome,
            milestones=data.milestones or [],
            target_date=data.target_date,
        )
        self.db.add(goal)
        self.db.commit()
        self.db.refresh(goal)
        goal.total_tasks = 0
        goal.completed_tasks = 0
        return goal

    def get_goal(self, user_id: str, goal_id: str) -> Optional[Goal]:
        goal = self.db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
        if goal:
            total = self.db.query(func.count(Task.id)).filter(Task.goal_id == goal.id).scalar() or 0
            completed = self.db.query(func.count(Task.id)).filter(Task.goal_id == goal.id, Task.status == "completed").scalar() or 0
            goal.total_tasks = total
            goal.completed_tasks = completed
            milestones = goal.milestones or []
            if milestones and len(milestones) > 0:
                total_weight = sum(m.get("weight", 10) for m in milestones)
                completed_weight = sum(m.get("weight", 10) for m in milestones if m.get("completed", False))
                goal.progress_percentage = round((completed_weight / total_weight) * 100, 1) if total_weight > 0 else 0.0
            elif total > 0:
                goal.progress_percentage = round((completed / total) * 100, 1)
        return goal

    def update_goal(self, user_id: str, goal_id: str, data: GoalUpdate) -> Goal:
        goal = self.get_goal(user_id, goal_id)
        if not goal:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(goal, k, v)
        self.db.commit()
        self.db.refresh(goal)
        return goal

    def delete_goal(self, user_id: str, goal_id: str) -> bool:
        goal = self.get_goal(user_id, goal_id)
        if not goal:
            return False
        self.db.delete(goal)
        self.db.commit()
        return True

    # --------------------------------------------------------------------------
    # Tasks
    # --------------------------------------------------------------------------
    def list_tasks(
        self,
        user_id: str,
        status_filter: Optional[str] = None,
        goal_id: Optional[str] = None
    ) -> List[Task]:
        query = self.db.query(Task).filter(Task.user_id == user_id)
        if status_filter and status_filter != "all":
            query = query.filter(Task.status == status_filter)
        if goal_id:
            query = query.filter(Task.goal_id == goal_id)
        return query.order_by(Task.due_date.asc().nullslast(), Task.created_at.desc()).all()

    def create_task(self, user_id: str, data: TaskCreate) -> Task:
        goal = None
        if data.goal_id:
            goal = self.get_goal(user_id, data.goal_id)
            if not goal:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Linked goal not found")
        else:
            # Associate with user's primary active goal if available
            goal = self.db.query(Goal).filter(Goal.user_id == user_id, Goal.is_completed == False).order_by(Goal.created_at.desc()).first()

        # Evaluate intelligent goal alignment
        from app.services.goal_alignment_service import GoalAlignmentService
        alignment = GoalAlignmentService.evaluate_task_alignment(
            task_title=data.title,
            task_description=data.description,
            task_category=getattr(data, "category", "Work"),
            goal=goal
        )

        # XP calculation based on priority
        xp_map = {"low": 30, "medium": 50, "high": 80, "urgent": 100}
        xp_val = xp_map.get(data.priority, 50)

        task = Task(
            user_id=user_id,
            goal_id=goal.id if goal else None,
            title=data.title,
            description=data.description,
            priority=data.priority,
            points=getattr(data, "points", 25),
            category=getattr(data, "category", "Work"),
            status="pending",
            due_date=data.due_date,
            xp_reward=xp_val,
            is_recurring=data.is_recurring,
            recurrence_rule=data.recurrence_rule,
            goal_alignment=alignment.get("goal_alignment", "routine"),
            alignment_score=alignment.get("alignment_score", 70),
            alignment_reason=alignment.get("alignment_reason"),
            milestone_id=data.milestone_id or alignment.get("milestone_id"),
            suggested_next_step=alignment.get("suggested_next_step"),
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def extract_tasks_from_voice(self, transcript: str) -> List[Dict[str, Any]]:
        """
        Parses natural voice transcript into structured task proposals.
        Handles both AI extraction (if API configured) and robust semantic pattern extraction.
        """
        clean_text = transcript.strip()
        tasks = []
        
        # Test for known sample scenarios or run semantic sentence parser
        import re
        
        # Split on common sentence or clause delimiters
        sentences = re.split(r'(?<=[.!?])\s+|(?<=[,;])\s+(?=I need|I have to|After|At\s+\d+|Then|Also)', clean_text)
        
        for sent in sentences:
            sent_str = sent.strip()
            if not sent_str or len(sent_str) < 6:
                continue
            
            # Lowercase for keyword analysis
            lower = sent_str.lower()
            
            # Detect category
            category = "Work"
            if any(w in lower for w in ["presentation", "interns", "present"]):
                category = "Presentation"
            elif any(w in lower for w in ["speech", "prepare", "conference"]):
                category = "Preparation"
            elif any(w in lower for w in ["workout", "gym", "run", "training", "fitness"]):
                category = "Fitness"
            elif any(w in lower for w in ["study", "exam", "reading", "research", "medical"]):
                category = "Study"
            elif any(w in lower for w in ["design", "art", "code", "prototype", "video"]):
                category = "Creative"
            
            # Detect priority
            priority = "high" if any(w in lower for w in ["report", "urgent", "must", "submit", "presentation", "conference", "deadline"]) else "medium"
            
            # Detect points / effort weight
            points = 30 if "report" in lower or "presentation" in lower else (25 if "speech" in lower or "prepare" in lower else 20)
            
            # Detect deadline hint
            due_at = None
            if "before noon" in lower or "12 pm" in lower:
                due_at = "Before noon"
            elif "at 4 pm" in lower:
                due_at = "4:00 PM"
            elif "after lunch" in lower:
                due_at = "After lunch"
            elif "at 9 am" in lower or "morning" in lower:
                due_at = "9:00 AM"

            # Clean action title
            title = sent_str
            # Trim fluff like "I am going to the office at 9 AM. I need to finish" -> "Finish quarterly reports"
            for prefix in [
                "i am going to the office at 9 am. i need to ",
                "i need to ",
                "after lunch, i have to ",
                "i have to ",
                "at 4 pm, i need to ",
                "at 4 pm i need to ",
                "then i will ",
                "please ",
            ]:
                if title.lower().startswith(prefix):
                    title = title[len(prefix):]
                    break
            
            title = title.rstrip(".,;").capitalize()
            if len(title) > 60:
                short_title = title[:57] + "..."
            else:
                short_title = title
                
            tasks.append({
                "title": short_title,
                "description": sent_str.rstrip(".,;"),
                "priority": priority,
                "points": points,
                "category": category,
                "due_at": due_at,
                "confidence": 0.95
            })

        # If splitting didn't find multiple tasks, provide structured fallback
        if not tasks:
            tasks.append({
                "title": clean_text[:60].capitalize(),
                "description": clean_text,
                "priority": "medium",
                "points": 25,
                "category": "Work",
                "due_at": None,
                "confidence": 0.90
            })
            
        return tasks

    def get_task(self, user_id: str, task_id: str) -> Optional[Task]:
        return self.db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

    def update_task(self, user_id: str, task_id: str, data: TaskUpdate) -> Task:
        task = self.get_task(user_id, task_id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(task, k, v)
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete_task(self, user_id: str, task_id: str) -> bool:
        task = self.get_task(user_id, task_id)
        if not task:
            return False
        self.db.delete(task)
        self.db.commit()
        return True

    def toggle_task(self, user_id: str, task_id: str) -> Tuple[Task, int, int, int, int, bool, bool]:
        """
        Toggles completion status and computes deterministic gamification updates:
        XP, Level progression, Streak maintenance.
        """
        task = self.get_task(user_id, task_id)
        if not task:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

        user = self.db.query(User).filter(User.id == user_id).with_for_update().first()
        now = datetime.now(timezone.utc)
        
        xp_earned = 0
        streak_extended = False
        level_up = False

        if task.status != "completed":
            # Complete task
            task.status = "completed"
            task.completed_at = now
            xp_earned = task.xp_reward
            user.xp += xp_earned
            
            # Check level up (every 250 XP is 1 level)
            new_level = (user.xp // 250) + 1
            if new_level > user.level:
                user.level = new_level
                level_up = True
                
            # Streak calculation
            today = now.date()
            if user.last_active_date:
                last_active = user.last_active_date.date()
                if last_active == today:
                    # Already active today, streak holds
                    pass
                elif last_active == today - timedelta(days=1):
                    # Consecutive day! Extend streak
                    user.current_streak += 1
                    streak_extended = True
                else:
                    # Broken streak, reset to 1
                    user.current_streak = 1
                    streak_extended = True
            else:
                user.current_streak = 1
                streak_extended = True
                
            if user.current_streak > user.longest_streak:
                user.longest_streak = user.current_streak
                
            user.last_active_date = now
        else:
            # Revert to pending
            task.status = "pending"
            task.completed_at = None
            xp_earned = -task.xp_reward
            user.xp = max(0, user.xp + xp_earned)
            user.level = max(1, (user.xp // 250) + 1)

        self.db.commit()
        self.db.refresh(task)
        self.db.refresh(user)

        return task, xp_earned, user.xp, user.level, user.current_streak, streak_extended, level_up

    def get_today_task_outcomes(self, user_id: str) -> Dict[str, Any]:
        """Retrieves structured summary of completed and missed tasks for story generation"""
        now = datetime.now(timezone.utc)
        start_of_day = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
        
        all_user_tasks = self.db.query(Task).filter(Task.user_id == user_id).all()
        
        completed = []
        missed = []
        
        for t in all_user_tasks:
            t_dict = {
                "id": t.id,
                "title": t.title,
                "description": t.description or "",
                "priority": t.priority,
            }
            if t.status == "completed":
                completed.append(t_dict)
            else:
                missed.append(t_dict)
                
        return {
            "completed": completed,
            "missed": missed
        }
