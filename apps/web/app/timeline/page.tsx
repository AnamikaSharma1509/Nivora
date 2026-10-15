"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Flame,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  Play,
  Film,
  Award,
  ChevronRight,
  TrendingUp,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
  Target,
  Compass,
  AlertCircle,
  CheckSquare,
  BarChart3,
  CalendarDays,
  Info
} from "lucide-react";
import { api, TimelineData, TimelineDay, EpisodeItem, getStoredToken } from "@/lib/api";
import EpisodePlayerModal from "@/components/EpisodePlayerModal";
import HumanAvatar from "@/components/HumanAvatar";

function PersonalTimelineContent() {
  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [activeModalEpisode, setActiveModalEpisode] = useState<EpisodeItem | null>(null);

  // Set / Edit Target Date Modal State
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [newTargetDate, setNewTargetDate] = useState("");
  const [updatingDate, setUpdatingDate] = useState(false);

  useEffect(() => {
    loadPersonalTimeline();
  }, []);

  const loadPersonalTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getPersonalTimeline();
      setTimeline(data);
      if (data.days && data.days.length > 0) {
        setSelectedDayNumber(data.days[0].day_number);
      }
      if (data.deadline_urgency?.target_date) {
        setNewTargetDate(data.deadline_urgency.target_date);
      }
    } catch (err: any) {
      console.error("Failed to load personal timeline", err);
      setError(err?.message || "Failed to load your personal timeline. Please log in or check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTargetDate = async () => {
    if (!newTargetDate || !timeline?.goal) return;
    try {
      setUpdatingDate(true);
      // Find goal ID from timeline if available or pass goal's active record
      const goalId = (timeline.goal as any).id || "active";
      await api.updateGoalTargetDate(goalId, newTargetDate);
      setIsDateModalOpen(false);
      await loadPersonalTimeline();
    } catch (err) {
      console.error("Failed to update target date", err);
    } finally {
      setUpdatingDate(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#A8E6CF] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[#B9BBC7] text-sm">Loading your personalized goal timeline...</p>
      </div>
    );
  }

  if (error || !timeline) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="p-4 rounded-2xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 text-[#FF6B6B] inline-block">
          <AlertCircle className="w-8 h-8 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-[#F6F5F8]">Personal Timeline Unavailable</h2>
        <p className="text-sm text-[#B9BBC7] max-w-md mx-auto">
          {error || "We couldn't retrieve your personal goal data. Please ensure you are logged in."}
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-[#14151D] text-xs font-bold transition-all"
          >
            Sign In to Nivora
          </Link>
          <Link
            href="/explore-other-lives"
            className="px-5 py-2.5 rounded-xl bg-[#252735] hover:bg-[#1D1F2B] border border-[#393B4B] text-[#F6F5F8] text-xs font-semibold transition-all"
          >
            Explore Other Lives
          </Link>
        </div>
      </div>
    );
  }

  const selectedDay = timeline.days.find((d) => d.day_number === selectedDayNumber) || timeline.days[0];
  const goal = timeline.goal;
  const deadline = timeline.deadline_urgency;
  const summary = timeline.today_summary;
  const roadmap = timeline.roadmap;
  const stats = timeline.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Title & User Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#393B4B] pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#F6F5F8]">
              Personal Timeline
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#A8E6CF]/15 text-[#A8E6CF] border border-[#A8E6CF]/30">
              Authenticated Protagonist
            </span>
          </div>
          <p className="text-[#B9BBC7] text-sm">
            Your personal, single-protagonist journey. Tracking daily execution, goal alignment, and milestones toward your final ambition.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <Link
            href="/today"
            className="px-4 py-2 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-[#14151D] text-xs font-bold shadow-md transition-all flex items-center space-x-2"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Today's Tasks</span>
          </Link>
          <Link
            href="/explore-other-lives"
            className="px-4 py-2 rounded-xl bg-[#252735] hover:bg-[#1D1F2B] border border-[#393B4B] text-[#B9BBC7] hover:text-white text-xs font-semibold transition-all flex items-center space-x-2"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore Other Lives</span>
          </Link>
        </div>
      </div>

      {/* SECTION A: FINAL GOAL OVERVIEW */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 border border-[#393B4B] space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#A8E6CF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex items-start space-x-4">
            <HumanAvatar
              options={timeline.character.avatar_options}
              imageUrl={timeline.character.avatar}
              name={timeline.character.name}
              size="lg"
              className="border-2 border-[#A8E6CF]/50 shadow-md"
            />
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8E6CF] bg-[#A8E6CF]/10 px-2.5 py-0.5 rounded-full border border-[#A8E6CF]/20">
                Current Goal Horizon
              </span>
              <h2 className="text-2xl font-black text-[#F6F5F8] pt-1">
                {goal?.title || "Establish Your Primary Goal"}
              </h2>
              <p className="text-xs text-[#B9BBC7] leading-relaxed max-w-2xl">
                {goal?.description || "Define your long-term destination to begin tracking aligned milestones."}
              </p>
            </div>
          </div>

          {/* Target Date Pill & Action */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 shrink-0">
            {deadline?.has_target_date ? (
              <div className="text-left lg:text-right">
                <span className="text-[11px] text-[#B9BBC7] uppercase font-semibold">Target Horizon</span>
                <p className="text-sm font-bold text-[#F6F5F8] flex items-center lg:justify-end space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#A8E6CF]" />
                  <span>{deadline.target_date}</span>
                </p>
                <span className="text-[11px] text-[#A8E6CF] font-medium">
                  {deadline.remaining_time_label || `${deadline.remaining_days} days remaining`}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setIsDateModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#A8E6CF]/15 text-[#A8E6CF] border border-[#A8E6CF]/30 hover:bg-[#A8E6CF] hover:text-[#14151D] text-xs font-bold transition-all flex items-center space-x-1.5"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Set Goal Deadline</span>
              </button>
            )}

            {deadline?.has_target_date && (
              <button
                onClick={() => setIsDateModalOpen(true)}
                className="text-[11px] text-[#B9BBC7] hover:text-[#A8E6CF] underline transition-colors"
              >
                Change Deadline
              </button>
            )}
          </div>
        </div>

        {/* Goal Detail Tags & Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#393B4B]/60 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#14151D] border border-[#393B4B] space-y-1">
            <span className="text-[10px] text-[#B9BBC7] uppercase font-bold">Current Stage</span>
            <p className="text-xs font-bold text-[#F6F5F8] line-clamp-2">
              {goal?.current_situation || "Building foundational fundamentals and establishing baseline consistency."}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#14151D] border border-[#393B4B] space-y-1">
            <span className="text-[10px] text-[#B9BBC7] uppercase font-bold">Next Milestone</span>
            <p className="text-xs font-bold text-[#A8E6CF] line-clamp-2">
              {goal?.next_milestone || roadmap?.summary?.current_milestone || "Core Foundations Mastery"}
            </p>
          </div>

          {/* Goal Achievement Progress (Milestone-based) */}
          <div className="p-3.5 rounded-2xl bg-[#14151D] border border-[#393B4B] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#B9BBC7] uppercase font-bold flex items-center space-x-1">
                <span>Goal Achievement</span>
                <span title="Calculated strictly from completed milestone weights" className="cursor-help">
                  <Info className="w-3 h-3 text-[#B9BBC7]" />
                </span>
              </span>
              <span className="text-xs font-black text-[#A8E6CF]">{goal?.goal_progress || 0}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#252735] overflow-hidden">
              <div
                className="h-full bg-[#A8E6CF] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(goal?.goal_progress || 0, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#B9BBC7]">Milestone Completion Weight</p>
          </div>

          {/* Journey Momentum (Streak-based) */}
          <div className="p-3.5 rounded-2xl bg-[#14151D] border border-[#393B4B] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#B9BBC7] uppercase font-bold flex items-center space-x-1">
                <span>Journey Momentum</span>
                <span title="Calculated from streak: min(streak/400, 1) * 100%" className="cursor-help">
                  <Info className="w-3 h-3 text-[#B9BBC7]" />
                </span>
              </span>
              <span className="text-xs font-black text-[#FFB347]">{goal?.journey_momentum || 0}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#252735] overflow-hidden">
              <div
                className="h-full bg-[#FFB347] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(goal?.journey_momentum || 0, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#B9BBC7]">Consistency Progress (Streak)</p>
          </div>
        </div>
      </section>

      {/* SECTION B: TODAY'S TASKS & GOAL ALIGNMENT */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 border border-[#393B4B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#393B4B]/70 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8E6CF]">
              Active Alignment
            </span>
            <h3 className="text-xl font-bold text-[#F6F5F8]">Today's Tasks & Goal Alignment</h3>
          </div>

          <Link
            href="/today"
            className="text-xs font-bold text-[#A8E6CF] hover:underline flex items-center space-x-1 self-start sm:self-auto"
          >
            <span>Open Daily Studio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Task Summary Badges */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-[#14151D] border border-[#393B4B] text-center">
              <span className="text-[10px] text-[#B9BBC7] uppercase font-semibold">Total Planned</span>
              <p className="text-lg font-black text-[#F6F5F8] mt-0.5">{summary.total_tasks}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#14151D] border border-[#393B4B] text-center">
              <span className="text-[10px] text-[#A8E6CF] uppercase font-semibold">Completed</span>
              <p className="text-lg font-black text-[#A8E6CF] mt-0.5">{summary.completed_tasks}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#14151D] border border-[#393B4B] text-center">
              <span className="text-[10px] text-[#FFB347] uppercase font-semibold">Remaining</span>
              <p className="text-lg font-black text-[#FFB347] mt-0.5">{summary.remaining_tasks}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#14151D] border border-[#393B4B] text-center">
              <span className="text-[10px] text-[#A8E6CF] uppercase font-semibold">Direct Support</span>
              <p className="text-lg font-black text-[#A8E6CF] mt-0.5">{summary.direct_supporting_count}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#14151D] border border-[#393B4B] text-center">
              <span className="text-[10px] text-[#B9BBC7] uppercase font-semibold">Indirect / Systems</span>
              <p className="text-lg font-black text-[#B9BBC7] mt-0.5">{summary.indirect_supporting_count}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#14151D] border border-[#393B4B] text-center">
              <span className="text-[10px] text-[#B9BBC7] uppercase font-semibold">Weighted Prog</span>
              <p className="text-lg font-black text-[#F6F5F8] mt-0.5">{summary.weighted_completion_percentage}%</p>
            </div>
          </div>
        )}

        {/* AI Alignment Explanation Box */}
        {summary?.concise_explanation && (
          <div className="p-4 rounded-2xl bg-[#252735]/80 border border-[#A8E6CF]/30 flex items-start space-x-3 text-xs text-[#F6F5F8] leading-relaxed">
            <Sparkles className="w-4 h-4 text-[#A8E6CF] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#A8E6CF]">Goal Alignment Analysis: </strong>
              <span>{summary.concise_explanation}</span>
            </div>
          </div>
        )}

        {/* Today's Actual Task List */}
        <div className="space-y-2.5">
          {timeline.today_tasks && timeline.today_tasks.length > 0 ? (
            timeline.today_tasks.map((task, idx) => {
              const completed = task.status === "completed";
              return (
                <div
                  key={task.id || idx}
                  className="p-3.5 rounded-xl bg-[#14151D] border border-[#393B4B] flex items-center justify-between gap-4 hover:border-[#393B4B]/90 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    {completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#A8E6CF] shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-[#B9BBC7]/40 shrink-0" />
                    )}
                    <div>
                      <p className={`text-xs font-semibold ${completed ? "text-[#F6F5F8]" : "text-[#B9BBC7]"}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#252735] text-[#A8E6CF] border border-[#A8E6CF]/20">
                          Direct Goal Support
                        </span>
                        {task.category && (
                          <span className="text-[10px] text-[#B9BBC7]">
                            {task.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <span className="text-[10px] font-bold text-[#A8E6CF] bg-[#A8E6CF]/10 px-2 py-0.5 rounded">
                      +{task.points} pts
                    </span>
                    <span className="text-[10px] text-[#B9BBC7] uppercase font-medium">
                      {task.priority}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 rounded-2xl bg-[#14151D] border border-[#393B4B] text-center space-y-2">
              <p className="text-xs text-[#B9BBC7]">No tasks recorded for today yet.</p>
              <Link
                href="/today"
                className="inline-block px-4 py-2 rounded-xl bg-[#A8E6CF] text-[#14151D] text-xs font-bold"
              >
                Plan Today's Tasks
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* SECTION C: GOAL DEADLINE & URGENCY TIMELINE */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 border border-[#393B4B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#393B4B]/70 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8E6CF]">
              Urgency & Timeline Schedule
            </span>
            <h3 className="text-xl font-bold text-[#F6F5F8]">Goal Deadline & Pacing</h3>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                deadline?.schedule_status === "ahead" || deadline?.schedule_status === "on_schedule"
                  ? "bg-[#A8E6CF]/15 text-[#A8E6CF] border border-[#A8E6CF]/30"
                  : deadline?.is_overdue
                  ? "bg-[#FF6B6B]/15 text-[#FF6B6B] border border-[#FF6B6B]/30"
                  : "bg-[#FFB347]/15 text-[#FFB347] border border-[#FFB347]/30"
              }`}
            >
              {deadline?.schedule_status === "on_schedule"
                ? "On Schedule"
                : deadline?.schedule_status === "ahead"
                ? "Ahead of Pace"
                : deadline?.is_overdue
                ? "Reassessment Needed (Overdue)"
                : deadline?.schedule_status === "behind"
                ? "Behind Target Pace"
                : "Provisional Timeline"}
            </span>
          </div>
        </div>

        {deadline?.has_target_date ? (
          <div className="space-y-6">
            {/* Visual Timeline Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#B9BBC7]">Journey Start</span>
                <span className="font-bold text-[#A8E6CF]">
                  {deadline.remaining_time_label || `${deadline.remaining_days} Days Remaining`}
                </span>
                <span className="text-[#B9BBC7] font-semibold">{deadline.target_date}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#14151D] border border-[#393B4B] overflow-hidden p-0.5">
                <div
                  className="h-full bg-[#A8E6CF] rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${Math.min(Math.max(deadline.progress_through_planned_timeline || 15, 5), 100)}%` }}
                />
              </div>
            </div>

            {/* Checkpoint Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#14151D] border border-[#393B4B]">
                <span className="text-[10px] text-[#B9BBC7] uppercase font-bold">Active Checkpoint</span>
                <p className="text-xs font-bold text-[#F6F5F8] mt-1">
                  {deadline.current_milestone || "Foundational Development"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#14151D] border border-[#393B4B]">
                <span className="text-[10px] text-[#B9BBC7] uppercase font-bold">Next Milestone Target</span>
                <p className="text-xs font-bold text-[#A8E6CF] mt-1">
                  {deadline.next_milestone_deadline || "Within 30 Days"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#14151D] border border-[#393B4B]">
                <span className="text-[10px] text-[#B9BBC7] uppercase font-bold">Target Horizon</span>
                <p className="text-xs font-bold text-[#F6F5F8] mt-1">
                  {deadline.remaining_days ? `${deadline.remaining_days} Days to Destination` : "Horizon Open"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#14151D] border border-[#393B4B] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-[#F6F5F8]">Set Your Goal Deadline</h4>
              <p className="text-xs text-[#B9BBC7]">
                Establish a target date to enable dynamic time-remaining countdowns and structured milestone pacing.
              </p>
            </div>
            <button
              onClick={() => setIsDateModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-[#14151D] text-xs font-bold transition-all shadow-md shrink-0"
            >
              Set Your Goal Deadline
            </button>
          </div>
        )}
      </section>

      {/* SECTION D: JOURNEY STATISTICS */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 border border-[#393B4B] space-y-6">
        <div className="border-b border-[#393B4B]/70 pb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8E6CF]">
            Authenticated Metrics
          </span>
          <h3 className="text-xl font-bold text-[#F6F5F8]">Personal Journey Statistics</h3>
          <p className="text-xs text-[#B9BBC7] mt-0.5">
            Strictly persistent data belonging to your account. Demo character episodes and streaks are excluded.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#14151D] border border-[#393B4B] text-center">
            <span className="text-[10px] text-[#B9BBC7] uppercase font-bold">Total Episodes</span>
            <p className="text-xl font-black text-[#A8E6CF] mt-1">{stats.total_episodes || 0}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#14151D] border border-[#393B4B] text-center">
            <span className="text-[10px] text-[#FFB347] uppercase font-bold flex items-center justify-center space-x-1">
              <Flame className="w-3 h-3" />
              <span>Streak</span>
            </span>
            <p className="text-xl font-black text-[#FFB347] mt-1">{stats.current_streak} d</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#14151D] border border-[#393B4B] text-center">
            <span className="text-[10px] text-[#B9BBC7] uppercase font-bold">Longest Streak</span>
            <p className="text-xl font-black text-[#F6F5F8] mt-1">{stats.longest_streak} d</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#14151D] border border-[#393B4B] text-center">
            <span className="text-[10px] text-[#A8E6CF] uppercase font-bold">Done Tasks</span>
            <p className="text-xl font-black text-[#A8E6CF] mt-1">{stats.completed_tasks}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#14151D] border border-[#393B4B] text-center">
            <span className="text-[10px] text-[#A8E6CF] uppercase font-bold">Goal Progress</span>
            <p className="text-xl font-black text-[#A8E6CF] mt-1">{stats.goal_progress || 0}%</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#14151D] border border-[#393B4B] text-center">
            <span className="text-[10px] text-[#A8E6CF] uppercase font-bold">Completed MS</span>
            <p className="text-xl font-black text-[#A8E6CF] mt-1">{stats.completed_milestones || 0}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#14151D] border border-[#393B4B] text-center">
            <span className="text-[10px] text-[#FFB347] uppercase font-bold">Remaining MS</span>
            <p className="text-xl font-black text-[#FFB347] mt-1">{stats.remaining_milestones || 0}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#14151D] border border-[#393B4B] text-center">
            <span className="text-[10px] text-[#B9BBC7] uppercase font-bold">Days Elapsed</span>
            <p className="text-xl font-black text-[#F6F5F8] mt-1">{stats.days_elapsed || 1} d</p>
          </div>
        </div>
      </section>

      {/* SECTION E: PERSONAL JOURNEY HISTORY */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 border border-[#393B4B] space-y-6">
        <div className="border-b border-[#393B4B]/70 pb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8E6CF]">
            Chronological History
          </span>
          <h3 className="text-xl font-bold text-[#F6F5F8]">Personal Journey Log</h3>
          <p className="text-xs text-[#B9BBC7] mt-0.5">
            Day-by-day record of your actual completed tasks, streak status, and generated episodes.
          </p>
        </div>

        {/* Day Selector Tabs */}
        {timeline.days && timeline.days.length > 0 && (
          <div className="flex items-center space-x-3 overflow-x-auto pb-2">
            {timeline.days.map((day) => {
              const active = selectedDayNumber === day.day_number;
              return (
                <button
                  key={day.day_number}
                  onClick={() => setSelectedDayNumber(day.day_number)}
                  className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl border transition-all shrink-0 ${
                    active
                      ? "bg-[#252735] border-[#A8E6CF] text-[#F6F5F8] shadow-md scale-102"
                      : "bg-[#14151D] border-[#393B4B] text-[#B9BBC7] hover:border-white/30"
                  }`}
                >
                  <div className="text-left">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold">Day {day.day_number}</span>
                      {day.is_missed ? (
                        <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" title="Missed day" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-[#A8E6CF]" title="Streak preserved" />
                      )}
                    </div>
                    <span className="text-[10px] text-[#B9BBC7]">
                      {day.completion_percentage}% Completed
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Day Details */}
        {selectedDay && (
          <div className="space-y-6">
            {/* Missed Day Banner if any */}
            {selectedDay.is_missed && (
              <div className="p-4 rounded-2xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 flex items-start space-x-3 text-xs text-[#FF6B6B]">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">Missed Day Record (Day {selectedDay.day_number})</h4>
                  <p className="text-xs text-[#B9BBC7] mt-0.5">
                    {selectedDay.recovery_message ||
                      "This day did not meet the qualifying completion threshold. Your accumulated milestones remain safe. Complete today's planned tasks to restart your streak."}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Day's Tasks */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-[#14151D] border border-[#393B4B] space-y-4">
                <div className="flex items-center justify-between border-b border-[#393B4B] pb-3">
                  <h4 className="text-sm font-bold text-[#F6F5F8]">
                    Day {selectedDay.day_number} Tasks Snapshot
                  </h4>
                  <span className="text-xs font-bold text-[#A8E6CF]">
                    {selectedDay.completion_percentage}% Completed
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedDay.tasks && selectedDay.tasks.length > 0 ? (
                    selectedDay.tasks.map((task, idx) => {
                      const completed = task.status === "completed";
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#252735]/60 border border-[#393B4B] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center space-x-2.5">
                            {completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#A8E6CF] shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
                            )}
                            <span className={completed ? "text-[#F6F5F8] font-medium" : "text-[#B9BBC7] line-through"}>
                              {task.title}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-[#A8E6CF] shrink-0">
                            +{task.points} pts
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-[#B9BBC7] py-4 text-center">No task records preserved for this day.</p>
                  )}
                </div>

                {selectedDay.next_recommended_action && (
                  <div className="pt-3 border-t border-[#393B4B]/60 text-[11px] text-[#B9BBC7]">
                    <strong className="text-white">Recommended Next Action: </strong>
                    {selectedDay.next_recommended_action}
                  </div>
                )}
              </div>

              {/* Day's Generated Episodes */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-[#14151D] border border-[#393B4B] space-y-4">
                <div className="flex items-center justify-between border-b border-[#393B4B] pb-3">
                  <h4 className="text-sm font-bold text-[#F6F5F8]">
                    Personal Episodes (Day {selectedDay.day_number})
                  </h4>
                  <span className="text-xs text-[#B9BBC7]">
                    Studio Vault
                  </span>
                </div>

                {selectedDay.episodes?.episode_a || selectedDay.episodes?.episode_b ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedDay.episodes.episode_a && (
                      <div className="p-4 rounded-xl bg-[#252735] border border-[#393B4B] flex flex-col justify-between space-y-3 group hover:border-[#A8E6CF]/50 transition-all">
                        <div className="space-y-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#A8E6CF]/15 text-[#A8E6CF]">
                            Episode A
                          </span>
                          <h5 className="text-xs font-bold text-[#F6F5F8] line-clamp-1">
                            {selectedDay.episodes.episode_a.title}
                          </h5>
                          <p className="text-[11px] text-[#B9BBC7] line-clamp-2 leading-relaxed">
                            {selectedDay.episodes.episode_a.summary}
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveModalEpisode(selectedDay.episodes.episode_a!)}
                          className="w-full py-2 rounded-lg bg-[#A8E6CF] text-[#14151D] text-xs font-bold flex items-center justify-center space-x-1.5 hover:bg-[#7ED8B8] transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Watch Episode</span>
                        </button>
                      </div>
                    )}

                    {selectedDay.episodes.episode_b && (
                      <div className="p-4 rounded-xl bg-[#252735] border border-[#393B4B] flex flex-col justify-between space-y-3 group hover:border-[#FFB347]/50 transition-all">
                        <div className="space-y-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFB347]/15 text-[#FFB347]">
                            Episode B
                          </span>
                          <h5 className="text-xs font-bold text-[#F6F5F8] line-clamp-1">
                            {selectedDay.episodes.episode_b.title}
                          </h5>
                          <p className="text-[11px] text-[#B9BBC7] line-clamp-2 leading-relaxed">
                            {selectedDay.episodes.episode_b.summary}
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveModalEpisode(selectedDay.episodes.episode_b!)}
                          className="w-full py-2 rounded-lg bg-[#FFB347] text-[#14151D] text-xs font-bold flex items-center justify-center space-x-1.5 hover:bg-[#e09e36] transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Watch Episode</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-3">
                    <Film className="w-8 h-8 text-[#B9BBC7]/40 mx-auto" />
                    <p className="text-xs text-[#B9BBC7]">No episode generated for this day yet.</p>
                    <Link
                      href="/today"
                      className="inline-block px-4 py-2 rounded-xl bg-[#A8E6CF] text-[#14151D] text-xs font-bold hover:bg-[#7ED8B8] transition-colors"
                    >
                      Generate in Today's Studio
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION F: IDEAL ROADMAP */}
      <section className="glass-panel rounded-3xl p-6 md:p-8 border border-[#393B4B] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#393B4B]/70 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8E6CF]">
              Aspirational Horizon
            </span>
            <h3 className="text-xl font-bold text-[#F6F5F8]">Personalized Target Roadmap</h3>
            <p className="text-xs text-[#B9BBC7] mt-0.5">
              Domain-specific milestones tailored to your goal ({roadmap?.domain || "Engineering & Leadership"}), current starting point, and target date.
            </p>
          </div>

          {roadmap?.feasibility && (
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#A8E6CF]/15 text-[#A8E6CF] border border-[#A8E6CF]/30">
                {roadmap.feasibility.assessment}
              </span>
            </div>
          )}
        </div>

        {/* Feasibility Advice Card */}
        {roadmap?.feasibility?.advice && (
          <div className="p-4 rounded-2xl bg-[#14151D] border border-[#393B4B] flex items-start space-x-3 text-xs text-[#B9BBC7] leading-relaxed">
            <TrendingUp className="w-4 h-4 text-[#A8E6CF] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Feasibility Assessment: </strong>
              <span>{roadmap.feasibility.advice}</span>
            </div>
          </div>
        )}

        {/* Monthly Milestones Grid */}
        <div className="space-y-4">
          {roadmap?.milestones && roadmap.milestones.length > 0 ? (
            roadmap.milestones.map((ms, idx) => {
              const isDone = ms.status === "completed";
              const isInProg = ms.status === "in_progress";
              return (
                <div
                  key={ms.id || idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    isDone
                      ? "bg-[#14151D]/90 border-[#A8E6CF]/50"
                      : isInProg
                      ? "bg-[#252735] border-[#A8E6CF] shadow-md"
                      : "bg-[#14151D] border-[#393B4B]"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8E6CF] bg-[#A8E6CF]/10 px-2 py-0.5 rounded border border-[#A8E6CF]/20">
                          {ms.month_checkpoint ? `Month ${ms.month_checkpoint}` : `Milestone ${idx + 1}`}
                        </span>
                        <h4 className="text-sm font-bold text-[#F6F5F8]">{ms.title}</h4>
                      </div>
                      <p className="text-xs text-[#B9BBC7] leading-relaxed max-w-3xl">
                        {ms.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isDone
                            ? "bg-[#A8E6CF]/20 text-[#A8E6CF]"
                            : isInProg
                            ? "bg-[#FFB347]/20 text-[#FFB347]"
                            : "bg-[#393B4B] text-[#B9BBC7]"
                        }`}
                      >
                        {isDone ? "Completed" : isInProg ? "Active Progress" : "Upcoming"}
                      </span>
                      <span className="text-[10px] text-[#B9BBC7] font-semibold">
                        Weight: {ms.weight}%
                      </span>
                    </div>
                  </div>

                  {/* Milestone Details: Why it matters & Completion Criteria */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 mt-3 border-t border-[#393B4B]/60 text-xs">
                    <div>
                      <strong className="text-[10px] text-[#A8E6CF] uppercase block font-bold">Why It Matters</strong>
                      <p className="text-[11px] text-[#B9BBC7] mt-0.5 leading-relaxed">{ms.why_it_matters}</p>
                    </div>
                    <div>
                      <strong className="text-[10px] text-[#A8E6CF] uppercase block font-bold">Required Evidence</strong>
                      <p className="text-[11px] text-[#B9BBC7] mt-0.5 leading-relaxed">{ms.required_tasks_or_evidence}</p>
                    </div>
                    <div>
                      <strong className="text-[10px] text-[#A8E6CF] uppercase block font-bold">Weekly Suggested Pace</strong>
                      <p className="text-[11px] text-[#B9BBC7] mt-0.5 leading-relaxed">{ms.suggested_weekly_pace}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#B9BBC7]">
              No roadmap milestones generated yet.
            </div>
          )}
        </div>
      </section>

      {/* Target Date Dialog / Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-[#393B4B] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#393B4B] pb-3">
              <h3 className="text-base font-bold text-[#F6F5F8]">Set Your Goal Deadline</h3>
              <button
                onClick={() => setIsDateModalOpen(false)}
                className="text-[#B9BBC7] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#B9BBC7] leading-relaxed">
              Choose an ambitious yet realistic completion date for your goal. Nivora will calculate dynamic urgency, monthly milestones, and consistency pacing based on this deadline.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#F6F5F8] block">Target Date</label>
              <input
                type="date"
                value={newTargetDate}
                onChange={(e) => setNewTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14151D] border border-[#393B4B] text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setIsDateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#252735] hover:bg-[#1D1F2B] border border-[#393B4B] text-xs font-semibold text-[#F6F5F8]"
              >
                Cancel
              </button>
              <button
                disabled={updatingDate || !newTargetDate}
                onClick={handleSaveTargetDate}
                className="px-5 py-2 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-[#14151D] text-xs font-bold transition-all disabled:opacity-50"
              >
                {updatingDate ? "Saving..." : "Save Deadline"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Episode Player Modal */}
      {activeModalEpisode && (
        <EpisodePlayerModal
          isOpen={true}
          episode={activeModalEpisode}
          onClose={() => setActiveModalEpisode(null)}
        />
      )}
    </div>
  );
}

export default function TimelinePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center text-[#B9BBC7]">Loading timeline...</div>}>
      <PersonalTimelineContent />
    </Suspense>
  );
}
