"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Target,
  Compass,
  Check,
  Plus,
  Trash2,
  BookOpen,
  Film,
  User,
  Shield,
  Layers,
  HelpCircle
} from "lucide-react";
import { api, AvatarItem, GenreItem, getStoredToken } from "@/lib/api";
import NivoraLogo from "@/components/NivoraLogo";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [avatars, setAvatars] = useState<AvatarItem[]>([]);
  const [genres, setGenres] = useState<GenreItem[]>([]);

  // Step 2: Inspirational Character
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [isCustomIdentity, setIsCustomIdentity] = useState(false);
  const [customArchetype, setCustomArchetype] = useState("AI Systems Engineer");

  // Step 3: Final Goal
  const [goalTitle, setGoalTitle] = useState("Become an AI systems engineer");
  const [goalCategory, setGoalCategory] = useState("Technology and AI");
  const [targetOutcome, setTargetOutcome] = useState("Design and deploy scalable autonomous AI infrastructure at a premier lab");
  const [targetDate, setTargetDate] = useState("");

  // Step 4: Current Situation
  const [currentSituation, setCurrentSituation] = useState("First-year engineering student learning basic coding");

  // Step 5: Roadmaps / Milestones Gap
  const [milestones, setMilestones] = useState<Array<{ id: string; title: string; weight: number; completed: boolean }>>([
    { id: "m1", title: "Master Python fundamentals and basic algorithms", weight: 20, completed: false },
    { id: "m2", title: "Data structures and algorithm design patterns", weight: 20, completed: false },
    { id: "m3", title: "Mathematics and machine learning foundations", weight: 20, completed: false },
    { id: "m4", title: "Distributed systems and GPU acceleration pipelines", weight: 20, completed: false },
    { id: "m5", title: "Deploy flagship production AI infrastructure project", weight: 20, completed: false },
  ]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");

  // Step 6: Series Name
  const [seriesTitle, setSeriesTitle] = useState("Risers into the Entrepreneurial Ground");

  // Step 7: Story Preferences
  const [selectedGenre, setSelectedGenre] = useState("Technology Drama");
  const [narrativeTone, setNarrativeTone] = useState("Motivational & Grounded");
  const [preferredLanguage, setPreferredLanguage] = useState("English");

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([api.getAvatars(), api.getGenres()]).then(([avs, gens]) => {
      setAvatars(avs);
      setGenres(gens);
      if (avs.length > 0) {
        // Find Meera or default to first
        const meera = avs.find((a) => a.name.toLowerCase() === "meera");
        setSelectedAvatarId(meera ? meera.id : avs[0].id);
      }
    }).catch(console.error);
  }, [router]);

  // Dynamic milestone generation when situation or goal changes
  const updateSuggestedMilestones = (goal: string, situation: string) => {
    const gLower = goal.toLowerCase();
    if (gLower.includes("ai") || gLower.includes("engineer") || gLower.includes("software")) {
      setMilestones([
        { id: "m1", title: "Master Python programming and Linux essentials", weight: 20, completed: false },
        { id: "m2", title: "Data structures, algorithms, and system design", weight: 20, completed: false },
        { id: "m3", title: "Deep learning frameworks and model fine-tuning", weight: 20, completed: false },
        { id: "m4", title: "High-throughput distributed systems & GPU clusters", weight: 20, completed: false },
        { id: "m5", title: "Flagship production AI infrastructure deployment", weight: 20, completed: false },
      ]);
    } else if (gLower.includes("fintech") || gLower.includes("entrepreneur") || gLower.includes("startup") || gLower.includes("founder")) {
      setMilestones([
        { id: "m1", title: "Customer discovery & merchant interview synthesis", weight: 20, completed: false },
        { id: "m2", title: "Payment rails, regulatory research & unit economics", weight: 20, completed: false },
        { id: "m3", title: "Functional prototype and pilot merchant onboarding", weight: 20, completed: false },
        { id: "m4", title: "Institutional angel round & partner integrations", weight: 20, completed: false },
        { id: "m5", title: "Scale to first $100K annualized transaction volume", weight: 20, completed: false },
      ]);
    } else if (gLower.includes("med") || gLower.includes("doctor") || gLower.includes("resident")) {
      setMilestones([
        { id: "m1", title: "Master clinical pharmacology & diagnostics", weight: 20, completed: false },
        { id: "m2", title: "High-acuity emergency rotation excellence", weight: 20, completed: false },
        { id: "m3", title: "Surgical procedure certifications & case logging", weight: 20, completed: false },
        { id: "m4", title: "Medical residency licensing examination defense", weight: 20, completed: false },
        { id: "m5", title: "Appointment to chief clinical surgical fellow", weight: 20, completed: false },
      ]);
    } else {
      setMilestones([
        { id: "m1", title: "Core foundational skill acquisition", weight: 25, completed: false },
        { id: "m2", title: "Build initial practical project portfolio", weight: 25, completed: false },
        { id: "m3", title: "Real-world execution under pressure", weight: 25, completed: false },
        { id: "m4", title: "Achieve the primary master outcome", weight: 25, completed: false },
      ]);
    }
  };

  const handleAddMilestone = () => {
    if (!newMilestoneTitle.trim()) return;
    setMilestones([
      ...milestones,
      {
        id: `m_${Date.now()}`,
        title: newMilestoneTitle.trim(),
        weight: 15,
        completed: false,
      },
    ]);
    setNewMilestoneTitle("");
  };

  const handleRemoveMilestone = (id: string) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      // 1. Create User's Personal Goal
      const createdGoal = await api.createGoal({
        title: goalTitle,
        category: goalCategory,
        description: targetOutcome,
        current_situation: currentSituation,
        target_outcome: targetOutcome,
        target_date: targetDate ? new Date(targetDate).toISOString() : undefined,
        milestones: milestones,
      });

      // 2. Create User's Series
      const chosenAvatarId = selectedAvatarId || (avatars[0]?.id || "");
      await api.createSeries({
        avatar_id: chosenAvatarId,
        title: seriesTitle,
        genre: selectedGenre,
        long_term_purpose: goalTitle,
      });

      // 3. Create First Foundational Tasks mapped to Milestone 1
      const firstMilestone = milestones[0];
      await api.createTask({
        title: `Learn core concepts for ${firstMilestone ? firstMilestone.title : goalTitle}`,
        description: "Initial foundational study sprint to activate day 1 journey momentum",
        category: "Study",
        priority: "high",
        points: 30,
        goal_id: createdGoal.id,
        milestone_id: firstMilestone?.id,
      });

      await api.createTask({
        title: `Complete 3 practical exercises connected to ${goalTitle}`,
        description: "Hands-on application to demonstrate direct goal advancement",
        category: "Work",
        priority: "medium",
        points: 25,
        goal_id: createdGoal.id,
        milestone_id: firstMilestone?.id,
      });

      // 4. Open authenticated user's own dashboard
      router.push("/today");
    } catch (err: any) {
      console.error("Onboarding failed", err);
      alert(`Setup notice: ${err.message || "Failed to complete onboarding"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#14151D] text-[#F6F5F8] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-[#F2D15C]/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        {/* Header Branding & Step Counter */}
        <div className="flex items-center justify-between border-b border-[#393B4B] pb-5">
          <Link href="/" className="inline-flex items-center">
            <NivoraLogo size="md" />
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F2D15C]">
              Step {step} of 7
            </span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className={`w-6 h-1.5 rounded-full transition-all ${
                    step === i
                      ? "bg-[#F2D15C]"
                      : step > i
                      ? "bg-[#A8E6CF]"
                      : "bg-[#252735]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* STEP 1: WELCOME & THE CORE CONCEPT */}
        {step === 1 && (
          <div className="glass-panel rounded-3xl p-8 sm:p-10 space-y-6 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-[#F2D15C]/15 border border-[#F2D15C]/30 flex items-center justify-center text-[#F2D15C]">
              <Compass className="w-7 h-7" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F6F5F8] tracking-tight">
                Turn your everyday tasks into an evolving story.
              </h1>
              <p className="text-sm sm:text-base text-[#858B98] leading-relaxed">
                Nivora helps you choose a future you want to build, verifies whether your daily actions are moving you closer to that destination, and transforms each completed day into a cinematic, personalized episode.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#20232E] border border-[#393B4B] space-y-3">
              <span className="text-xs font-bold text-[#F2D15C] uppercase tracking-wider block">
                The Non-Negotiable Principle
              </span>
              <p className="text-xs text-[#E8EAF0] leading-relaxed">
                <strong>You are the protagonist.</strong> The characters you browse are merely aspirational inspirations. Every script, timeline milestone, and episode belongs exclusively to you and your chosen ambition.
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-[#F2D15C] hover:bg-[#e6c44d] text-[#171923] font-bold text-sm flex items-center space-x-2 transition-all shadow-md"
              >
                <span>Begin Your Journey</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ASPIRATIONAL REFERENCE / INSPIRATION */}
        {step === 2 && (
          <div className="glass-panel rounded-3xl p-8 space-y-6 animate-in fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F2D15C]">Inspirational Reference</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F6F5F8] mt-1">
                Who inspires the person you want to become?
              </h2>
              <p className="text-xs text-[#858B98] mt-1">
                Select an inspirational archetype to guide your story style and future-self framing, or define your own identity.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {avatars.slice(0, 6).map((av) => {
                const isSelected = selectedAvatarId === av.id && !isCustomIdentity;
                return (
                  <div
                    key={av.id}
                    onClick={() => {
                      setSelectedAvatarId(av.id);
                      setIsCustomIdentity(false);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#F2D15C]/15 border-[#F2D15C] shadow-md"
                        : "bg-[#20232E] border-[#393B4B] hover:border-[#858B98]"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#14151D] flex items-center justify-center font-bold text-[#F2D15C] text-sm">
                        {av.name[0]}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-[#F6F5F8] truncate">{av.name}</div>
                        <div className="text-[11px] text-[#858B98] truncate">{av.archetype}</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#858B98] mt-2.5 line-clamp-2">
                      {av.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-[#20232E] border border-[#393B4B] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#F6F5F8] block">Prefer your own custom identity?</span>
                <span className="text-[11px] text-[#858B98]">Skip character reference and define your archetype directly.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomIdentity(!isCustomIdentity)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isCustomIdentity
                    ? "bg-[#F2D15C] text-[#171923]"
                    : "bg-[#14151D] text-[#858B98] border border-[#393B4B]"
                }`}
              >
                {isCustomIdentity ? "Custom Active" : "Define Custom"}
              </button>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#858B98] hover:text-[#F6F5F8]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-[#F2D15C] hover:bg-[#e6c44d] text-[#171923] font-bold text-sm flex items-center space-x-2 shadow-md"
              >
                <span>Continue to Goal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DEFINE THE FINAL GOAL */}
        {step === 3 && (
          <div className="glass-panel rounded-3xl p-8 space-y-6 animate-in fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F2D15C]">Your Destination</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F6F5F8] mt-1">
                What is the one major goal you want to achieve?
              </h2>
              <p className="text-xs text-[#858B98] mt-1">
                This is the north star that your daily tasks will be evaluated against.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#858B98]">Goal Title</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => {
                    setGoalTitle(e.target.value);
                    updateSuggestedMilestones(e.target.value, currentSituation);
                  }}
                  placeholder="e.g., Become an AI systems engineer"
                  className="w-full px-4 py-3 bg-[#14151D] border border-[#393B4B] rounded-xl text-sm text-[#F6F5F8] focus:outline-none focus:border-[#F2D15C]"
                />
              </div>

              {/* Quick suggestion pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  "Become an AI systems engineer",
                  "Launch a scalable fintech startup",
                  "Become a surgical medical resident",
                  "Build and scale an AI infrastructure company",
                  "Become a lead product designer"
                ].map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => {
                      setGoalTitle(sugg);
                      updateSuggestedMilestones(sugg, currentSituation);
                    }}
                    className="px-3 py-1 rounded-lg text-xs bg-[#20232E] hover:bg-[#252735] border border-[#393B4B] text-[#858B98] hover:text-[#F6F5F8] transition-colors"
                  >
                    {sugg}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#858B98]">Domain / Category</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#14151D] border border-[#393B4B] rounded-xl text-sm text-[#F6F5F8] focus:outline-none focus:border-[#F2D15C]"
                  >
                    <option value="Technology and AI">Technology and AI</option>
                    <option value="Business and entrepreneurship">Business & Entrepreneurship</option>
                    <option value="Medicine and healthcare">Medicine & Healthcare</option>
                    <option value="Arts and entertainment">Arts & Design</option>
                    <option value="Sports and fitness">Sports & Fitness</option>
                    <option value="Science and research">Science & Research</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#858B98]">Target Date (Optional)</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#14151D] border border-[#393B4B] rounded-xl text-sm text-[#F6F5F8] focus:outline-none focus:border-[#F2D15C]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#858B98]">Desired Target Outcome</label>
                <textarea
                  rows={2}
                  value={targetOutcome}
                  onChange={(e) => setTargetOutcome(e.target.value)}
                  placeholder="Describe what success looks like when you achieve this goal..."
                  className="w-full px-4 py-2.5 bg-[#14151D] border border-[#393B4B] rounded-xl text-sm text-[#F6F5F8] focus:outline-none focus:border-[#F2D15C]"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#858B98] hover:text-[#F6F5F8]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-xl bg-[#F2D15C] hover:bg-[#e6c44d] text-[#171923] font-bold text-sm flex items-center space-x-2 shadow-md"
              >
                <span>Current Starting Point</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DESCRIBE CURRENT SITUATION */}
        {step === 4 && (
          <div className="glass-panel rounded-3xl p-8 space-y-6 animate-in fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F2D15C]">Your Baseline</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F6F5F8] mt-1">
                Where are you starting from today?
              </h2>
              <p className="text-xs text-[#858B98] mt-1">
                Nivora will compare your current reality against your destination to identify the exact skill gap.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#858B98]">Current Situation / Stage</label>
                <input
                  type="text"
                  required
                  value={currentSituation}
                  onChange={(e) => {
                    setCurrentSituation(e.target.value);
                    updateSuggestedMilestones(goalTitle, e.target.value);
                  }}
                  placeholder="e.g., First-year engineering student learning basic coding"
                  className="w-full px-4 py-3 bg-[#14151D] border border-[#393B4B] rounded-xl text-sm text-[#F6F5F8] focus:outline-none focus:border-[#F2D15C]"
                />
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-2">
                {[
                  "First-year engineering student",
                  "Junior software developer",
                  "Early-stage founder building prototype",
                  "Medical student preparing for clinical rotations",
                  "Creative designer building portfolio",
                  "Professional transitioning into AI"
                ].map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => {
                      setCurrentSituation(stg);
                      updateSuggestedMilestones(goalTitle, stg);
                    }}
                    className="px-3 py-1 rounded-lg text-xs bg-[#20232E] hover:bg-[#252735] border border-[#393B4B] text-[#858B98] hover:text-[#F6F5F8] transition-colors"
                  >
                    {stg}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#858B98] hover:text-[#F6F5F8]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-6 py-2.5 rounded-xl bg-[#F2D15C] hover:bg-[#e6c44d] text-[#171923] font-bold text-sm flex items-center space-x-2 shadow-md"
              >
                <span>Review Milestone Gap</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: IDENTIFY THE GAP & MILESTONES */}
        {step === 5 && (
          <div className="glass-panel rounded-3xl p-8 space-y-6 animate-in fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F2D15C]">Roadmap & Gap Analysis</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F6F5F8] mt-1">
                Your Roadmap from Today to the Goal
              </h2>
              <p className="text-xs text-[#858B98] mt-1">
                These milestone steps bridge your starting position with your target outcome. You can edit, add, or reorder them.
              </p>
            </div>

            {/* Gap comparison banner */}
            <div className="p-4 rounded-2xl bg-[#20232E] border border-[#393B4B] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-[#858B98] uppercase font-bold block">Starting Point</span>
                <span className="text-[#F6F5F8] font-semibold">{currentSituation}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#F2D15C] uppercase font-bold block">Target Destination</span>
                <span className="text-[#F2D15C] font-semibold">{goalTitle}</span>
              </div>
            </div>

            {/* Milestone List */}
            <div className="space-y-2.5">
              {milestones.map((m, idx) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-[#14151D] border border-[#393B4B] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-[#F2D15C]/15 text-[#F2D15C] text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-[#F6F5F8]">{m.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(m.id)}
                    className="text-[#858B98] hover:text-[#E8EAF0] p-1 shrink-0"
                    title="Remove milestone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Milestone Field */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="Add a custom roadmap milestone..."
                className="flex-1 px-4 py-2 bg-[#14151D] border border-[#393B4B] rounded-xl text-xs text-[#F6F5F8] focus:outline-none focus:border-[#F2D15C]"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-3.5 py-2 bg-[#20232E] hover:bg-[#252735] border border-[#393B4B] text-xs font-bold rounded-xl text-[#F2D15C] flex items-center space-x-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#858B98] hover:text-[#F6F5F8]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(6)}
                className="px-6 py-2.5 rounded-xl bg-[#F2D15C] hover:bg-[#e6c44d] text-[#171923] font-bold text-sm flex items-center space-x-2 shadow-md"
              >
                <span>Name Your Series</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: NAME THE SERIES */}
        {step === 6 && (
          <div className="glass-panel rounded-3xl p-8 space-y-6 animate-in fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F2D15C]">Your Story Identity</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F6F5F8] mt-1">
                What would you like to call your series?
              </h2>
              <p className="text-xs text-[#858B98] mt-1">
                This is the overarching title for your episodic journey. You can customize it at any time.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#858B98]">Series Title</label>
                <input
                  type="text"
                  required
                  value={seriesTitle}
                  onChange={(e) => setSeriesTitle(e.target.value)}
                  placeholder="e.g., Risers into the Entrepreneurial Ground"
                  className="w-full px-4 py-3 bg-[#14151D] border border-[#393B4B] rounded-xl text-sm text-[#F6F5F8] focus:outline-none focus:border-[#F2D15C]"
                />
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-2">
                {[
                  "Risers into the Entrepreneurial Ground",
                  "Building My AI Future",
                  "From Student to Systems Engineer",
                  "The Founder Journey",
                  "My Road to Fintech",
                  "Becoming the Person I Imagined"
                ].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSeriesTitle(st)}
                    className="px-3 py-1 rounded-lg text-xs bg-[#20232E] hover:bg-[#252735] border border-[#393B4B] text-[#858B98] hover:text-[#F6F5F8] transition-colors"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#858B98] hover:text-[#F6F5F8]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(7)}
                className="px-6 py-2.5 rounded-xl bg-[#F2D15C] hover:bg-[#e6c44d] text-[#171923] font-bold text-sm flex items-center space-x-2 shadow-md"
              >
                <span>Story Preferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: STORY PREFERENCES & LAUNCH */}
        {step === 7 && (
          <div className="glass-panel rounded-3xl p-8 space-y-6 animate-in fade-in">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F2D15C]">Final Personalization</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F6F5F8] mt-1">
                Choose your story aesthetics and launch
              </h2>
              <p className="text-xs text-[#858B98] mt-1">
                Customize narrative tone and visual framing for your upcoming daily episodes.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#858B98]">Genre Theme</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#14151D] border border-[#393B4B] rounded-xl text-sm text-[#F6F5F8] focus:outline-none focus:border-[#F2D15C]"
                  >
                    <option value="Technology Drama">Technology Drama</option>
                    <option value="Inspirational Corporate">Inspirational Corporate</option>
                    <option value="Slice of Life & Mastery">Slice of Life & Mastery</option>
                    <option value="Workplace Drama">Workplace Drama</option>
                    <option value="Creative Romantic Comedy">Creative Romantic Comedy</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#858B98]">Narrative Tone</label>
                  <select
                    value={narrativeTone}
                    onChange={(e) => setNarrativeTone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#14151D] border border-[#393B4B] rounded-xl text-sm text-[#F6F5F8] focus:outline-none focus:border-[#F2D15C]"
                  >
                    <option value="Motivational & Grounded">Motivational & Grounded</option>
                    <option value="Sharp & Analytical">Sharp & Analytical</option>
                    <option value="Warm & Reflective">Warm & Reflective</option>
                    <option value="High-Stakes Dramatic">High-Stakes Dramatic</option>
                  </select>
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="p-5 rounded-2xl bg-[#20232E] border border-[#F2D15C]/30 space-y-3">
                <span className="text-xs font-bold text-[#F2D15C] uppercase tracking-wider block">
                  Your Personal Workspace Summary
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#858B98] block">Primary Goal:</span>
                    <span className="font-semibold text-[#F6F5F8]">{goalTitle}</span>
                  </div>
                  <div>
                    <span className="text-[#858B98] block">Series Title:</span>
                    <span className="font-semibold text-[#F6F5F8]">{seriesTitle}</span>
                  </div>
                  <div>
                    <span className="text-[#858B98] block">Current Stage:</span>
                    <span className="font-semibold text-[#F6F5F8]">{currentSituation}</span>
                  </div>
                  <div>
                    <span className="text-[#858B98] block">Roadmap:</span>
                    <span className="font-semibold text-[#F6F5F8]">{milestones.length} Strategic Milestones</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(6)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#858B98] hover:text-[#F6F5F8]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCompleteOnboarding}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-[#F2D15C] hover:bg-[#e6c44d] text-[#171923] font-bold text-sm flex items-center space-x-2 shadow-lg hover:scale-105 transition-all disabled:opacity-50"
              >
                <span>{loading ? "Creating Your Workspace..." : "Create My Personal Dashboard"}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
