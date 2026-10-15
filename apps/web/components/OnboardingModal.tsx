"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Check, ArrowRight, ArrowLeft, Target, ListTodo, Film, User, Shield } from "lucide-react";
import { api, AvatarItem, GenreItem } from "@/lib/api";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [avatars, setAvatars] = useState<AvatarItem[]>([]);
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form selections
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [selectedGenreId, setSelectedGenreId] = useState<string>("romantic_comedy");
  const [seriesTitle, setSeriesTitle] = useState("Ascent: My Next Chapter");
  const [goalTitle, setGoalTitle] = useState("Build & Launch Next-Gen Platform");
  const [goalCategory, setGoalCategory] = useState("Startup");
  const [task1Title, setTask1Title] = useState("Finalize investor pitch deck");
  const [task2Title, setTask2Title] = useState("Run 5-mile tempo workout");

  useEffect(() => {
    if (isOpen) {
      Promise.all([api.getAvatars(), api.getGenres()]).then(([avs, gens]) => {
        setAvatars(avs);
        setGenres(gens);
        if (avs.length > 0 && !selectedAvatarId) {
          setSelectedAvatarId(avs[0].id);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      // 1. Create series
      const series = await api.createSeries({
        avatar_id: selectedAvatarId,
        title: seriesTitle,
        genre: selectedGenreId,
        long_term_purpose: goalTitle,
      });

      // 2. Create goal
      const goal = await api.createGoal({
        title: goalTitle,
        category: goalCategory,
        description: `Primary storyline arc for ${seriesTitle}`,
      });

      // 3. Create initial tasks
      if (task1Title.trim()) {
        await api.createTask({
          title: task1Title,
          priority: "high",
          goal_id: goal.id,
        });
      }
      if (task2Title.trim()) {
        await api.createTask({
          title: task2Title,
          priority: "medium",
          goal_id: goal.id,
        });
      }

      onComplete();
    } catch (e: any) {
      alert(`Onboarding error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-3xl glass-panel-glow rounded-2xl overflow-hidden p-6 sm:p-8 animate-fade-in">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#45465D]/40">
          <div>
            <span className="text-xs font-bold text-[#FF6B6B] uppercase tracking-wider">Step {step} of 4</span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F7F5FA]">
              {step === 1 && "Choose Your Digital Avatar"}
              {step === 2 && "Select Your Narrative Genre"}
              {step === 3 && "Define Your Major Ambition"}
              {step === 4 && "Set Today's First Missions"}
            </h2>
          </div>
          <div className="flex space-x-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  step === i ? "bg-[#FF6B6B] w-6" : step > i ? "bg-[#A8E6CF]" : "bg-[#45465D]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Avatar Archetype */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-[#B8B8C9]">
              Your avatar represents your digital alter-ego across all upcoming streaming episodes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {avatars.map((av) => (
                <div
                  key={av.id}
                  onClick={() => setSelectedAvatarId(av.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    selectedAvatarId === av.id
                      ? "bg-[#FF6B6B]/15 border-[#FF6B6B] shadow-lg shadow-[#FF6B6B]/20"
                      : "bg-[#191B2D]/70 border-[#45465D]/50 hover:border-[#B8B8C9]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-[#FFB347]">
                      {av.archetype}
                    </span>
                    {selectedAvatarId === av.id && <Check className="w-4 h-4 text-[#FF6B6B]" />}
                  </div>
                  <h3 className="font-bold text-[#F7F5FA] text-base">{av.name}</h3>
                  <p className="text-xs text-[#B8B8C9] mt-1 line-clamp-2">{av.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Genre */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[#B8B8C9]">
              Every genre shapes the music, visual atmosphere, humor, and dramatic tone of your daily episodes.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
              {genres.map((g) => (
                <div
                  key={g.id}
                  onClick={() => setSelectedGenreId(g.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    selectedGenreId === g.id
                      ? "bg-[#FF6B6B]/15 border-[#FF6B6B] shadow-lg shadow-[#FF6B6B]/20"
                      : "bg-[#191B2D]/70 border-[#45465D]/50 hover:border-[#B8B8C9]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-[#F7F5FA] text-base">{g.name}</h3>
                    {selectedGenreId === g.id && <Check className="w-4 h-4 text-[#FF6B6B]" />}
                  </div>
                  <span className="text-xs font-semibold text-[#FFB347] block mb-1.5">{g.tagline}</span>
                  <p className="text-xs text-[#B8B8C9]">{g.tone_description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Long-term Goal & Series Title */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B8C9] mb-1">
                Series Title
              </label>
              <input
                type="text"
                value={seriesTitle}
                onChange={(e) => setSeriesTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#191B2D] border border-[#45465D] text-white focus:outline-none focus:border-[#FF6B6B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B8C9] mb-1">
                Your Primary Long-Term Goal
              </label>
              <input
                type="text"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g. Raise seed round, pass bar examination, run marathon"
                className="w-full px-4 py-2.5 rounded-xl bg-[#191B2D] border border-[#45465D] text-white focus:outline-none focus:border-[#FF6B6B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#B8B8C9] mb-1">
                Category
              </label>
              <select
                value={goalCategory}
                onChange={(e) => setGoalCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#191B2D] border border-[#45465D] text-white focus:outline-none focus:border-[#FF6B6B]"
              >
                <option value="Startup">Startup & Business</option>
                <option value="Career">Career & Promotion</option>
                <option value="Education">Education & Exams</option>
                <option value="Fitness">Fitness & Health</option>
                <option value="Creative">Creative Project</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 4: First Tasks */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-[#B8B8C9]">
              Add your first two tasks for today. Checking them off will immediately fuel Episode 1's breakthrough!
            </p>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A8E6CF] mb-1">
                Mission 1 (High Priority)
              </label>
              <input
                type="text"
                value={task1Title}
                onChange={(e) => setTask1Title(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#191B2D] border border-[#45465D] text-white focus:outline-none focus:border-[#FF6B6B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#FFB347] mb-1">
                Mission 2 (Medium Priority)
              </label>
              <input
                type="text"
                value={task2Title}
                onChange={(e) => setTask2Title(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#191B2D] border border-[#45465D] text-white focus:outline-none focus:border-[#FF6B6B]"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#45465D]/40">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#B8B8C9] hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl text-sm font-bold bg-[#FF6B6B] text-[#191B2D] hover:opacity-95 shadow-lg shadow-[#FF6B6B]/25"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinishOnboarding}
              disabled={loading}
              className="flex items-center space-x-2 px-8 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#FF6B6B] to-[#FFB347] text-[#191B2D] hover:opacity-95 shadow-lg shadow-[#FF6B6B]/30 disabled:opacity-50"
            >
              {loading ? (
                <span>Building Your Series...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Launch My Series</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
