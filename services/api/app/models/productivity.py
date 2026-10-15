import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, Integer, Float, ForeignKey, DateTime, Text, Enum, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Goal(Base):
    __tablename__ = "goals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="Career")  # Career, Fitness, Education, Startup, Creative, Personal
    current_situation = Column(Text, nullable=True)
    target_outcome = Column(Text, nullable=True)
    milestones = Column(JSON, default=list)  # [{"id": "m1", "title": "...", "weight": 20, "completed": False}]
    target_date = Column(DateTime, nullable=True)
    is_completed = Column(Boolean, default=False)
    progress_percentage = Column(Float, default=0.0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="goals")
    tasks = relationship("Task", back_populates="goal", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    goal_id = Column(String(36), ForeignKey("goals.id", ondelete="SET NULL"), nullable=True, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String(20), default="medium")  # low, medium, high, urgent
    status = Column(String(20), default="pending")    # pending, in_progress, completed, missed, archived
    
    # Goal alignment assessment
    goal_alignment = Column(String(30), default="routine")  # direct, skill, support, routine, unrelated
    alignment_score = Column(Integer, default=70)
    alignment_reason = Column(Text, nullable=True)
    milestone_id = Column(String(50), nullable=True)
    suggested_next_step = Column(Text, nullable=True)
    
    due_date = Column(DateTime, nullable=True, index=True)
    completed_at = Column(DateTime, nullable=True)
    
    xp_reward = Column(Integer, default=50)
    points = Column(Integer, default=25)  # Task points / effort weight
    category = Column(String(50), default="Work")  # Work, Presentation, Study, Fitness, Creative, Personal, Other
    is_recurring = Column(Boolean, default=False)
    recurrence_rule = Column(String(100), nullable=True)  # e.g., FREQ=DAILY

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="tasks")
    goal = relationship("Goal", back_populates="tasks")


class DailyPlan(Base):
    __tablename__ = "daily_plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    day_number = Column(Integer, default=1)
    
    total_points = Column(Integer, default=0)
    completed_points = Column(Integer, default=0)
    completion_percentage = Column(Float, default=0.0)
    
    task_snapshot = Column(JSON, default=list)  # Snapshots of tasks at evaluation
    is_missed = Column(Boolean, default=False)
    streak_qualified = Column(Boolean, default=False)
    
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="daily_plans")

