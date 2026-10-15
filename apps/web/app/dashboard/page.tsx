"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, Flame, CheckCircle, Circle, Plus, Film, Play, Trophy,
  Clock, ArrowRight, Target, AlertCircle, RefreshCw, Trash2, ListTodo
} from "lucide-react";
import EpisodePlayerModal from "@/components/EpisodePlayerModal";
import OnboardingModal from "@/components/OnboardingModal";
import { api, DashboardOverview, Task, Goal, EpisodeItem, getStoredToken } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & player
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState<EpisodeItem | null>(null);
  const [generating, setGenerating] = useState(false);

  // New task form
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newTaskGoalId, setNewTaskGoalId] = useState<string>("");

  // New goal form toggle
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("Startup");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardOverview();
      setData(res);
      if (!res.active_series) {
        setShowOnboarding(true);
      }
    } catch (e: any) {
      if (e.message.includes("401") || e.message.includes("credentials")) {
        router.push("/login");
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }
    loadDashboard();
  }, [router]);

  const handleToggleTask = async (taskId: string) => {
    if (!data) return;
    try {
      const res = await api.toggleTask(taskId);
      // Refresh local state smoothly
      setData((prev) => {
        if (!prev) return prev;
        const updatedTasks = prev.today_tasks.map((t) => (t.id === taskId ? res.task : t));
        const completedCount = updatedTasks.filter((t) => t.status === "completed").length;
        const totalCount = updatedTasks.length;
        return {
          ...prev,
          user: {
            ...prev.user,
            xp: res.new_xp,
            level: res.new_level,
            current_streak: res.current_streak,
          },
          stats: {
            ...prev.stats,
            completed_tasks_today: completedCount,
            completion_rate_today: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
            current_streak: res.current_streak,
            xp: res.new_xp,
            level: res.new_level,
          },
          today_tasks: updatedTasks,
        };
      });
    } catch (e: any) {
      alert(`Error toggling task: ${e.message}`);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const task = await api.createTask({
        title: newTaskTitle,
        priority: newTaskPriority,
        goal_id: newTaskGoalId || undefined,
      });
      setNewTaskTitle("");
      loadDashboard();
    } catch (e: any) {
      alert(`Failed to add task: ${e.message}`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      loadDashboard();
    } catch (e: any) {
      alert(`Failed to delete task: ${e.message}`);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    try {
      await api.createGoal({
        title: newGoalTitle,
        category: newGoalCategory,
      });
      setNewGoalTitle("");
      setShowGoalModal(false);
      loadDashboard();
    } catch (e: any) {
      alert(`Failed to create goal: ${e.message}`);
    }
  };

  const handleGenerateEpisode = async () => {
    setGenerating(true);
    try {
      const ep = await api.generateEpisode({
        series_id: data?.active_series?.id,
        format: "video",
      });
      setActiveEpisode(ep);
      loadDashboard();
    } catch (e: any) {
      alert(`Episode generation error: ${e.message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#14151D] flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#FF6B6B] animate-spin mx-auto" />
            <p className="text-sm text-[#B8B8C9]">Connecting to series narrative engine...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#14151D] text-[#F6F5F8] flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Welcome & Active Series Banner */}
        <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FF6B6B]/20 text-[#FF6B6B] border border-[#FF6B6B]/30">
                {data?.active_series?.genre ? data.active_series.genre.replace("_", " ").toUpperCase() : "ACTIVE SERIES"}
              </span>
              <span className="text-xs text-[#B8B8C9]">
                Season {data?.active_series?.current_season || 1} • Episode {data?.active_series?.current_episode_number || 0}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              {data?.active_series?.title || "Your Series Storyline"}
            </h1>
            <p className="text-sm text-[#B8B8C9] max-w-xl">
              Starring <span className="text-white font-semibold">{data?.user.display_name}</span>. 
              {data?.active_series?.long_term_purpose && (
                <span> Objective: &ldquo;{data.active_series.long_term_purpose}&rdquo;</span>
              )}
            </p>
          </div>

          <div className="flex items-center space-x-4 z-10">
            <button
              onClick={handleGenerateEpisode}
              disabled={generating}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#FF6B6B] to-[#FFB347] text-[#191B2D] shadow-xl shadow-[#FF6B6B]/25 hover:scale-105 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Episode...</span>
                </>
              ) : (
                <>
                  <Film className="w-4 h-4" />
                  <span>Generate Today&apos;s Episode</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Daily Completion */}
          <div className="glass-panel p-5 rounded-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B8B8C9]">Today&apos;s Missions</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {data?.stats.completed_tasks_today}/{data?.stats.total_tasks_today}
              </span>
              <span className="text-xs font-bold text-[#A8E6CF]">
                {data?.stats.completion_rate_today}%
              </span>
            </div>
            <div className="w-full bg-[#191B2D] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#A8E6CF] to-[#3BADA8] h-full transition-all"
                style={{ width: `${data?.stats.completion_rate_today || 0}%` }}
              />
            </div>
          </div>

          {/* Current Streak */}
          <div className="glass-panel p-5 rounded-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B8B8C9]">Current Streak</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#FFB347]">
                {data?.stats.current_streak} Days
              </span>
              <Flame className="w-5 h-5 text-[#FFB347] animate-bounce" />
            </div>
            <span className="text-xs text-[#B8B8C9] block">Record: {data?.stats.longest_streak} days</span>
          </div>

          {/* XP & Level */}
          <div className="glass-panel p-5 rounded-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B8B8C9]">Producer Level</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                Lvl {data?.stats.level}
              </span>
              <span className="text-xs font-semibold text-[#FF6B6B]">{data?.stats.xp} XP</span>
            </div>
            <span className="text-xs text-[#B8B8C9] block">{data?.stats.xp_to_next_level} XP to Level {(data?.stats.level || 1) + 1}</span>
          </div>

          {/* Latest Episode */}
          <div className="glass-panel p-5 rounded-2xl space-y-2 flex flex-col justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B8B8C9]">Latest Episode</span>
            {data?.latest_episode ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block truncate max-w-[120px]">
                    {data.latest_episode.title}
                  </span>
                  <span className="text-[11px] text-[#A8E6CF]">Ready to watch</span>
                </div>
                <button
                  onClick={() => setActiveEpisode(data.latest_episode || null)}
                  className="p-2 rounded-xl bg-[#FF6B6B] text-[#191B2D] hover:scale-105 transition-transform"
                >
                  <Play className="w-4 h-4 fill-[#191B2D]" />
                </button>
              </div>
            ) : (
              <span className="text-xs text-[#B8B8C9]">Ready for your debut</span>
            )}
          </div>
        </div>

        {/* Main Content Grid: Tasks (Left 2 cols) & Goals / Episode Spotlight (Right 1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Tasks Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Daily Missions</h2>
                  <p className="text-xs text-[#B8B8C9]">Check off items to drive your character&apos;s storyline today.</p>
                </div>
              </div>

              {/* Add Task Input Bar */}
              <form onSubmit={handleCreateTask} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Add a new daily mission..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#191B2D] border border-[#45465D] text-sm text-white placeholder-[#B8B8C9]/60 focus:outline-none focus:border-[#FF6B6B]"
                  />
                  <select
                    value={newTaskPriority}
                    onChange={(e: any) => setNewTaskPriority(e.target.value)}
                    className="px-3 py-2.5 rounded-xl bg-[#191B2D] border border-[#45465D] text-xs font-semibold text-white focus:outline-none"
                  >
                    <option value="low">Low Priority (+30 XP)</option>
                    <option value="medium">Medium Priority (+50 XP)</option>
                    <option value="high">High Priority (+80 XP)</option>
                    <option value="urgent">Urgent (+100 XP)</option>
                  </select>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B6B] text-[#191B2D] hover:opacity-95 shadow-md shadow-[#FF6B6B]/25 flex items-center justify-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Tasks List */}
              <div className="space-y-2.5">
                {data?.today_tasks && data.today_tasks.length > 0 ? (
                  data.today_tasks.map((task) => {
                    const isCompleted = task.status === "completed";
                    return (
                      <div
                        key={task.id}
                        className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                          isCompleted
                            ? "bg-[#191B2D]/40 border-[#45465D]/30 opacity-70"
                            : "bg-[#191B2D]/80 border-[#45465D]/60 hover:border-[#B8B8C9]"
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 flex-1 min-w-0 pr-3">
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className="flex-shrink-0 text-[#FF6B6B] hover:scale-110 transition-transform"
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-[#A8E6CF] fill-[#A8E6CF]/20" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#B8B8C9]" />
                            )}
                          </button>
                          <div className="truncate">
                            <span className={`text-sm font-medium block truncate ${isCompleted ? "line-through text-[#B8B8C9]" : "text-white"}`}>
                              {task.title}
                            </span>
                            {task.description && (
                              <span className="text-xs text-[#B8B8C9] block truncate">{task.description}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            task.priority === "urgent" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                            task.priority === "high" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                            "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}>
                            +{task.xp_reward} XP
                          </span>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-[#B8B8C9] hover:text-[#FF6B6B] rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 border border-dashed border-[#45465D] rounded-2xl p-6">
                    <ListTodo className="w-10 h-10 text-[#B8B8C9] mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-semibold text-white">No missions scheduled today</p>
                    <p className="text-xs text-[#B8B8C9] mt-1">Add your daily tasks above to jumpstart your next episode.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Goals & Narrative Column */}
          <div className="space-y-6">
            {/* Long-term Goals Card */}
            <div className="glass-panel rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-[#FF6B6B]" />
                  <h3 className="text-base font-bold text-white">Core Goals</h3>
                </div>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="text-xs font-bold text-[#FF6B6B] hover:underline"
                >
                  + Add Goal
                </button>
              </div>

              <div className="space-y-3">
                {data?.active_goals && data.active_goals.length > 0 ? (
                  data.active_goals.map((g) => (
                    <div key={g.id} className="p-3.5 rounded-xl bg-[#191B2D] border border-[#45465D]/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate max-w-[180px]">{g.title}</span>
                        <span className="text-[10px] font-bold text-[#FFB347] uppercase">{g.category}</span>
                      </div>
                      <div className="w-full bg-[#2B2D42] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#FF6B6B] to-[#FFB347] h-full transition-all"
                          style={{ width: `${g.progress_percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-[#B8B8C9]">
                        <span>{g.completed_tasks || 0} of {g.total_tasks || 0} tasks done</span>
                        <span>{g.progress_percentage}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#B8B8C9]">No long-term goals configured yet.</p>
                )}
              </div>
            </div>

            {/* Episode Spotlight Player Preview Card */}
            {data?.latest_episode && (
              <div className="glass-panel-glow rounded-3xl p-5 space-y-3 border border-[#FF6B6B]/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FF6B6B] uppercase tracking-wider">Today&apos;s Episode</span>
                  <span className="text-[11px] text-[#B8B8C9]">Ep {data.latest_episode.episode_number}</span>
                </div>
                <h4 className="font-bold text-white text-sm">{data.latest_episode.title}</h4>
                <p className="text-xs text-[#B8B8C9] line-clamp-2">{data.latest_episode.summary}</p>

                <button
                  onClick={() => setActiveEpisode(data.latest_episode || null)}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#FF6B6B] text-[#191B2D] hover:opacity-95 shadow-md shadow-[#FF6B6B]/25 flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4 fill-[#191B2D]" />
                  <span>Play Episode ({Math.round(data.latest_episode.duration_seconds)}s)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Episode Video Player Modal */}
      {activeEpisode && (
        <EpisodePlayerModal
          episode={activeEpisode}
          onClose={() => setActiveEpisode(null)}
        />
      )}

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={() => {
          setShowOnboarding(false);
          loadDashboard();
        }}
      />

      {/* Create Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create Long-Term Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#B8B8C9] mb-1">Goal Title</label>
                <input
                  type="text"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  placeholder="e.g. Master React 19 and Python"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#191B2D] border border-[#45465D] text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#B8B8C9] mb-1">Category</label>
                <select
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#191B2D] border border-[#45465D] text-white text-sm"
                >
                  <option value="Startup">Startup</option>
                  <option value="Career">Career</option>
                  <option value="Education">Education</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Creative">Creative</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#B8B8C9] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#FF6B6B] text-[#191B2D]"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
