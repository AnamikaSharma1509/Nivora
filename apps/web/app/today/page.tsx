"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  ArrowRight,
  Clock,
  Layers,
  AlertCircle,
  Target,
  Compass,
  Check,
  TrendingUp,
  Info,
  ChevronRight
} from "lucide-react";
import { api, Task, ExtractedVoiceTask, Goal, UserProfile, getStoredToken } from "@/lib/api";

export default function TodayPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState<Goal | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [extractedTasks, setExtractedTasks] = useState<ExtractedVoiceTask[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [speechAudioEnabled, setSpeechAudioEnabled] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Manual task entry state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Work");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newPoints, setNewPoints] = useState(25);
  const [newDueDate, setNewDueDate] = useState("");

  // Recognition ref
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }
    loadData();
    initSpeechRecognition();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, goalsData, profileData] = await Promise.all([
        api.getTasks("all"),
        api.getGoals(),
        api.getMe(),
      ]);
      setTasks(tasksData);
      setUserProfile(profileData);

      // If user has no goals yet, redirect to onboarding so they define their final goal
      if (goalsData && goalsData.length > 0) {
        setPrimaryGoal(goalsData[0]);
      } else {
        router.push("/onboarding");
        return;
      }
    } catch (err: any) {
      console.error("Failed to load today page data", err);
      if (err?.message?.includes("401") || err?.message?.includes("credentials")) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const initSpeechRecognition = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setVoiceSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        setRecognitionInstance(recognition);
      }
    }
  };

  const toggleListening = () => {
    if (!recognitionInstance) {
      // Fallback demo spoken input for testing when browser audio permissions are restricted
      const sampleText =
        "Learn Python functions and review distributed systems architecture. Solve 5 algorithm exercises and test the API integration.";
      setTranscript(sampleText);
      setStatusMessage("Sample voice plan transcript loaded.");
      return;
    }

    if (isListening) {
      recognitionInstance.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      try {
        recognitionInstance.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Could not start speech recognition", err);
      }
    }
  };

  const handleExtractFromTranscript = async () => {
    if (!transcript.trim()) return;
    try {
      setExtracting(true);
      const res = await api.extractVoiceTasks(transcript);
      setExtractedTasks(res.tasks);
      speakFeedback(`Identified ${res.tasks.length} proposed missions from your voice entry.`);
    } catch (err) {
      console.error("Task extraction failed", err);
    } finally {
      setExtracting(false);
    }
  };

  const handleAddExtractedTask = async (task: ExtractedVoiceTask, index: number) => {
    try {
      const created = await api.createTask({
        title: task.title,
        description: task.description,
        priority: task.priority,
        points: task.points,
        category: task.category,
        goal_id: primaryGoal?.id,
      });
      setTasks((prev) => [created, ...prev]);
      setExtractedTasks((prev) => prev.filter((_, i) => i !== index));
      speakFeedback(`Added ${task.title}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAllExtracted = async () => {
    for (const t of extractedTasks) {
      try {
        const created = await api.createTask({
          title: t.title,
          description: t.description,
          priority: t.priority,
          points: t.points,
          category: t.category,
          goal_id: primaryGoal?.id,
        });
        setTasks((prev) => [created, ...prev]);
      } catch (err) {
        console.error(err);
      }
    }
    setExtractedTasks([]);
    speakFeedback("All voice tasks added to your plan.");
  };

  const handleCreateManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await api.createTask({
        title: newTitle,
        priority: newPriority,
        points: newPoints,
        category: newCategory,
        due_date: newDueDate ? new Date(newDueDate).toISOString() : undefined,
        goal_id: primaryGoal?.id,
      });
      setTasks((prev) => [created, ...prev]);
      setNewTitle("");
      speakFeedback(`Added task: ${created.title}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (taskId: string, title: string) => {
    try {
      const res = await api.toggleTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: res.task.status } : t))
      );
      if (res.task.status === "completed") {
        speakFeedback(`${title} marked complete.`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  const speakFeedback = (text: string) => {
    if (!speechAudioEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Points & Progress calculations
  const totalPoints = tasks.reduce((acc, t) => acc + (t.points || 25), 0) || 100;
  const completedPoints = tasks
    .filter((t) => t.status === "completed")
    .reduce((acc, t) => acc + (t.points || 25), 0);
  const completionPercentage = tasks.length > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  // Streak-based Journey Momentum: min(streak / 400, 1) * 100
  const streakDays = userProfile?.current_streak ?? 0;
  const journeyMomentum = Math.min(Math.round((streakDays / 400) * 100), 100);

  // Milestone-based goal progress
  const milestones = primaryGoal?.milestones || [];
  const completedMilestones = milestones.filter((m) => m.completed).length;
  const goalProgressPercentage = primaryGoal?.progress_percentage ?? 0;

  // Goal alignment counts
  const directCount = tasks.filter((t) => t.goal_alignment === "direct").length;
  const skillCount = tasks.filter((t) => t.goal_alignment === "skill").length;
  const supportCount = tasks.filter((t) => t.goal_alignment === "support").length;
  const routineCount = tasks.filter((t) => t.goal_alignment === "routine").length;
  const unrelatedCount = tasks.filter((t) => t.goal_alignment === "unrelated").length;

  // Next Milestone
  const nextMilestone = milestones.find((m) => !m.completed) || milestones[0];

  const handleEvaluateDay = async () => {
    try {
      setEvaluating(true);
      const res = await api.evaluateToday();
      setStatusMessage(
        `Day ${res.day_number} completed! Completion: ${res.completion_percentage}%. Active Streak: ${res.current_streak} days.`
      );
      speakFeedback(`Day evaluated. Completion: ${res.completion_percentage} percent.`);
      
      // Navigate to authenticated user's episode studio
      if (res.episode_id) {
        router.push(`/episodes/${res.episode_id}`);
      } else {
        router.push("/episodes");
      }
    } catch (err: any) {
      console.error("Day evaluation failed", err);
      alert(`Could not evaluate day: ${err.message}`);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. GOAL PROGRESS DASHBOARD AT THE TOP */}
      {primaryGoal && (
        <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-[#393B4B] space-y-5 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#393B4B]/60 pb-5">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#A8E6CF]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8E6CF]">
                  Final Ambition Target
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F6F5F8] tracking-tight">
                {primaryGoal.title}
              </h1>
              <p className="text-xs text-[#858B98]">
                <strong>Current Baseline:</strong> {primaryGoal.current_situation || "Starting journey"}
              </p>
            </div>

            {/* Quick action: Finish Day & Unlock Episode */}
            <div className="flex items-center space-x-3 shrink-0">
              <button
                type="button"
                onClick={() => setSpeechAudioEnabled(!speechAudioEnabled)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  speechAudioEnabled
                    ? "bg-[#20232E] text-[#A8E6CF] border-[#393B4B]"
                    : "bg-[#14151D] text-[#858B98] border-[#393B4B]"
                }`}
                title="Toggle spoken task feedback"
              >
                {speechAudioEnabled ? <Volume2 className="w-4 h-4 text-[#A8E6CF]" /> : <VolumeX className="w-4 h-4 text-[#858B98]" />}
                <span className="hidden sm:inline">{speechAudioEnabled ? "Voice On" : "Voice Muted"}</span>
              </button>

              <button
                type="button"
                onClick={handleEvaluateDay}
                disabled={evaluating}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-[#14151D] text-sm font-bold shadow-md transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <span>{evaluating ? "Unlocking Episode..." : "Finish Day & Unlock Episode"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Metrics Grid: Journey Momentum vs Goal Achievement */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
            {/* Journey Momentum */}
            <div className="p-4 rounded-2xl bg-[#20232E] border border-[#393B4B] space-y-1">
              <span className="text-[11px] font-bold text-[#858B98] uppercase tracking-wider block">
                Journey Momentum
              </span>
              <div className="text-2xl font-extrabold text-[#F2D15C]">
                {journeyMomentum}%
              </div>
              <span className="text-[10px] text-[#858B98]">
                {streakDays} of 400 Qualifying Days
              </span>
            </div>

            {/* Goal Progress */}
            <div className="p-4 rounded-2xl bg-[#20232E] border border-[#393B4B] space-y-1">
              <span className="text-[11px] font-bold text-[#858B98] uppercase tracking-wider block">
                Goal Achievement
              </span>
              <div className="text-2xl font-extrabold text-[#60A5FA]">
                {goalProgressPercentage}%
              </div>
              <span className="text-[10px] text-[#858B98]">
                {milestones.length > 0 ? `${completedMilestones}/${milestones.length} Milestones` : "Roadmap active"}
              </span>
            </div>

            {/* Today's Plan Completion */}
            <div className="p-4 rounded-2xl bg-[#20232E] border border-[#393B4B] space-y-1">
              <span className="text-[11px] font-bold text-[#858B98] uppercase tracking-wider block">
                Today&apos;s Plan
              </span>
              <div className="text-2xl font-extrabold text-[#F6F5F8]">
                {completionPercentage}%
              </div>
              <span className="text-[10px] text-[#858B98]">
                {tasks.filter((t) => t.status === "completed").length} of {tasks.length} Completed
              </span>
            </div>

            {/* Next Milestone */}
            <div className="p-4 rounded-2xl bg-[#20232E] border border-[#393B4B] space-y-1">
              <span className="text-[11px] font-bold text-[#858B98] uppercase tracking-wider block">
                Next Milestone
              </span>
              <div className="text-xs font-bold text-[#F6F5F8] line-clamp-2 mt-1">
                {nextMilestone ? nextMilestone.title : "Maintain execution"}
              </div>
            </div>
          </div>

          {/* Goal Alignment Assessment Breakdown */}
          <div className="p-4 rounded-2xl bg-[#14151D] border border-[#393B4B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[#F6F5F8]">Goal Alignment:</span>
              {directCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#F2D15C]/15 border border-[#F2D15C]/40 text-[#F2D15C] font-semibold">
                  {directCount} Direct
                </span>
              )}
              {skillCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#60A5FA]/15 border border-[#60A5FA]/40 text-[#60A5FA] font-semibold">
                  {skillCount} Skill
                </span>
              )}
              {supportCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#A8E6CF]/15 border border-[#A8E6CF]/40 text-[#A8E6CF] font-semibold">
                  {supportCount} Support
                </span>
              )}
              {routineCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#20232E] border border-[#393B4B] text-[#858B98] font-semibold">
                  {routineCount} Routine
                </span>
              )}
              {unrelatedCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#20232E] border border-[#393B4B] text-[#858B98]">
                  {unrelatedCount} Unrelated
                </span>
              )}
            </div>

            <div className="text-[#858B98] text-[11px]">
              {directCount >= 1
                ? "You have high-priority actions directly moving toward your goal today."
                : "Tip: Add a focused task that directly advances your key roadmap milestone."}
            </div>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-[#20232E] border border-[#A8E6CF]/40 text-[#A8E6CF] text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#A8E6CF]" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-xs text-[#858B98] hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: Voice Input & Manual Creation (Left 5 cols) vs Today's Checklist (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Voice Input & Manual Entry */}
        <div className="lg:col-span-5 space-y-6">
          {/* Voice Input Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-4 border border-[#393B4B]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#F6F5F8] flex items-center space-x-2">
                  <Mic className="w-4 h-4 text-[#F2D15C]" />
                  <span>Voice Task Entry</span>
                </h2>
                <p className="text-xs text-[#858B98] mt-0.5">
                  Speak your planned steps naturally. AI will extract and align your tasks.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl transition-all shadow-md ${
                  isListening
                    ? "bg-[#F2D15C] text-[#171923] animate-pulse ring-4 ring-[#F2D15C]/30"
                    : "bg-[#20232E] hover:bg-[#252735] text-[#F2D15C] border border-[#393B4B]"
                }`}
                title={isListening ? "Stop listening" : "Start speaking"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="e.g., Learn Python functions, solve 5 coding exercises, and finish distributed systems notes..."
              className="w-full bg-[#14151D] border border-[#393B4B] rounded-xl p-3 text-sm text-[#F6F5F8] placeholder-[#858B98]/40 focus:outline-none focus:border-[#F2D15C]"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#858B98]">
                {isListening ? "Listening actively..." : voiceSupported ? "Ready to listen" : "Voice entry available"}
              </span>
              <button
                type="button"
                onClick={handleExtractFromTranscript}
                disabled={extracting || !transcript.trim()}
                className="px-4 py-2 bg-[#20232E] hover:bg-[#252735] border border-[#393B4B] rounded-xl text-xs font-bold text-[#F2D15C] flex items-center space-x-1.5 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{extracting ? "Extracting..." : "Parse into Tasks"}</span>
              </button>
            </div>

            {/* Extracted Tasks Proposal List */}
            {extractedTasks.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-[#393B4B]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F6F5F8]">
                    Proposed Missions ({extractedTasks.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddAllExtracted}
                    className="text-xs font-bold text-[#F2D15C] hover:underline"
                  >
                    + Add All
                  </button>
                </div>

                <div className="space-y-2">
                  {extractedTasks.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#14151D] border border-[#393B4B] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#F6F5F8] truncate">{item.title}</div>
                        <div className="text-[10px] text-[#858B98]">
                          {item.category} • +{item.points} pts
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddExtractedTask(item, idx)}
                        className="px-2.5 py-1 rounded-lg bg-[#20232E] hover:bg-[#252735] text-xs font-bold text-[#F2D15C] shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Manual Task Entry Card */}
          <div className="glass-panel rounded-2xl p-6 space-y-4 border border-[#393B4B]">
            <h2 className="text-base font-bold text-[#F6F5F8] flex items-center space-x-2">
              <Plus className="w-4 h-4 text-[#F2D15C]" />
              <span>Manual Task Entry</span>
            </h2>

            <form onSubmit={handleCreateManualTask} className="space-y-3">
              <div>
                <label className="text-xs text-[#858B98] font-medium">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Learn Python functions"
                  className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] placeholder-[#858B98]/40 focus:outline-none focus:border-[#F2D15C]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#858B98] font-medium">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#F2D15C]"
                  >
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Presentation">Presentation</option>
                    <option value="Preparation">Preparation</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Creative">Creative</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#858B98] font-medium">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#F2D15C]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#858B98] font-medium">Points Weight</label>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    step="5"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#F2D15C]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#858B98] font-medium">Target Time</label>
                  <input
                    type="datetime-local"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#F2D15C]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#20232E] hover:bg-[#252735] border border-[#393B4B] hover:border-[#F2D15C] text-[#F6F5F8] text-xs font-bold transition-all"
              >
                + Add Task to Plan
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Today's Tasks Checklist & Goal Alignment Feedback */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl p-6 space-y-4 min-h-[500px] border border-[#393B4B]">
            <div className="flex items-center justify-between border-b border-[#393B4B] pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#F6F5F8]">Today&apos;s Missions</h2>
                <span className="text-xs text-[#858B98]">
                  {tasks.filter((t) => t.status === "completed").length} of {tasks.length} completed
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F2D15C]/15 text-[#F2D15C] border border-[#F2D15C]/30">
                {totalPoints} Total Points
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-[#858B98]">Loading today&apos;s schedule...</div>
            ) : tasks.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-[#858B98]/40 mx-auto" />
                <p className="text-base text-[#F6F5F8] font-medium">No tasks recorded for today yet.</p>
                <p className="text-xs text-[#858B98] max-w-sm mx-auto">
                  Use the microphone on the left to speak your day, or manually add tasks to launch your day&apos;s journey.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isCompleted = task.status === "completed";
                  const alignment = task.goal_alignment || "routine";
                  
                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col gap-2.5 ${
                        isCompleted
                          ? "bg-[#14151D]/80 border-[#393B4B]/60 opacity-80"
                          : "bg-[#20232E] border-[#393B4B] hover:border-[#858B98] shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(task.id, task.title)}
                            className="mt-0.5 text-[#F2D15C] hover:scale-110 transition-transform shrink-0"
                            title={isCompleted ? "Mark pending" : "Mark completed"}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-[#F2D15C]" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#858B98]" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-semibold ${
                                isCompleted ? "line-through text-[#858B98]" : "text-[#F6F5F8]"
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-[#858B98] mt-0.5 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-[#858B98] hover:text-[#E8EAF0] p-1 rounded-lg hover:bg-white/5 transition-colors shrink-0"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Goal Alignment Badge & Metadata */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#393B4B]/40">
                        {/* Alignment category tag */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            alignment === "direct"
                              ? "bg-[#F2D15C]/20 text-[#F2D15C] border border-[#F2D15C]/40"
                              : alignment === "skill"
                              ? "bg-[#60A5FA]/20 text-[#60A5FA] border border-[#60A5FA]/40"
                              : alignment === "support"
                              ? "bg-[#A8E6CF]/20 text-[#A8E6CF] border border-[#A8E6CF]/40"
                              : "bg-[#14151D] text-[#858B98] border border-[#393B4B]"
                          }`}
                        >
                          {alignment.toUpperCase()} {task.alignment_score ? `(${task.alignment_score}%)` : ""}
                        </span>

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#14151D] text-[#858B98] border border-[#393B4B]">
                          {task.category || "Work"}
                        </span>

                        <span className="text-[10px] font-bold text-[#F2D15C]">
                          +{task.points || 25} pts
                        </span>

                        {task.due_date && (
                          <span className="text-[10px] text-[#858B98] flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-[#F2D15C]" />
                            <span>{new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                        )}
                      </div>

                      {/* Alignment explanation & suggested next step */}
                      {task.alignment_reason && (
                        <div className="text-[11px] text-[#858B98] bg-[#14151D]/60 p-2 rounded-lg border border-[#393B4B]/50 space-y-0.5">
                          <p><strong className="text-[#E8EAF0]">Why this matters:</strong> {task.alignment_reason}</p>
                          {task.suggested_next_step && (
                            <p className="text-[#A8E6CF]"><strong className="text-[#A8E6CF]">Next step:</strong> {task.suggested_next_step}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
