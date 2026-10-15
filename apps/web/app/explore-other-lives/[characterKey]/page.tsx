"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Compass,
  ArrowLeft,
  Play,
  Film,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Target,
  FileText,
  ShieldCheck,
  Flame
} from "lucide-react";
import { api, TimelineData, TimelineDay, EpisodeItem } from "@/lib/api";
import EpisodePlayerModal from "@/components/EpisodePlayerModal";

function StoryContent() {
  const params = useParams();
  const characterKey = (params?.characterKey as string) || "cary";

  const [timeline, setTimeline] = useState<TimelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);
  const [activeModalEpisode, setActiveModalEpisode] = useState<EpisodeItem | null>(null);

  useEffect(() => {
    loadDemoTimeline(characterKey);
  }, [characterKey]);

  const loadDemoTimeline = async (key: string) => {
    try {
      setLoading(true);
      const data = await api.getDemoTimeline(key);
      setTimeline(data);
      if (data.days && data.days.length > 0) {
        setSelectedDayNumber(data.days[0].day_number);
      }
    } catch (err) {
      console.error("Failed to load demo character timeline", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedDay = timeline?.days.find((d) => d.day_number === selectedDayNumber) || timeline?.days?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation Back link */}
      <div className="flex items-center justify-between border-b border-[#393B4B] pb-4">
        <Link
          href="/explore-other-lives"
          className="flex items-center space-x-2 text-xs font-bold text-[#A8E6CF] hover:text-[#7ED8B8] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Other Lives Gallery</span>
        </Link>

        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#A8E6CF]/15 text-[#A8E6CF] border border-[#A8E6CF]/30">
          Inspirational Demo Continuity
        </span>
      </div>

      {loading || !timeline ? (
        <div className="py-24 text-center text-[#B9BBC7]">Loading dedicated character continuity...</div>
      ) : (
        <>
          {/* 1. Character Overview & Destination Goal Banner */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-[#393B4B]/60 pb-6">
              <div className="flex items-start space-x-5">
                <div className="w-20 h-20 rounded-2xl bg-[#14151D] border border-[#393B4B] flex items-center justify-center text-3xl font-bold text-[#A8E6CF] shrink-0 overflow-hidden shadow-lg">
                  {timeline.character.avatar ? (
                    <img
                      src={timeline.character.avatar}
                      alt={timeline.character.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <span>{timeline.character.name.charAt(0)}</span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#A8E6CF]/15 text-[#A8E6CF] border border-[#A8E6CF]/30 uppercase tracking-wider">
                      {timeline.character.career || timeline.character.title}
                    </span>
                    <span className="text-xs text-[#B9BBC7]">• {timeline.character.genre}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F6F5F8]">
                    {timeline.character.name}
                  </h1>

                  <p className="text-xs sm:text-sm text-[#B9BBC7] max-w-2xl leading-relaxed">
                    {timeline.character.bio}
                  </p>
                </div>
              </div>

              {/* Personality traits pill cluster */}
              <div className="flex flex-wrap gap-1.5 self-start md:self-auto max-w-xs">
                {timeline.character.personality?.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-1 rounded-lg bg-[#14151D] border border-[#393B4B] text-[11px] font-semibold text-[#F6F5F8]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Destination Goal & Continuity Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#858B98] flex items-center space-x-1">
                  <Target className="w-3.5 h-3.5 text-[#A8E6CF]" />
                  <span>Destination Goal & Final Ambition</span>
                </span>
                <p className="text-sm font-semibold text-[#F6F5F8] leading-relaxed">
                  {timeline.goal?.title || timeline.character.bio}
                </p>
              </div>

              <div className="md:col-span-5 grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[#14151D] border border-[#393B4B] text-center">
                  <span className="text-[10px] text-[#858B98] uppercase font-semibold">Tracked Days</span>
                  <p className="text-xl font-black text-[#F6F5F8] mt-0.5">{timeline.stats.total_tracked_days}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#14151D] border border-[#393B4B] text-center">
                  <span className="text-[10px] text-[#A8E6CF] uppercase font-semibold flex items-center justify-center space-x-1">
                    <Flame className="w-3 h-3 text-[#FFB347]" />
                    <span>Streak</span>
                  </span>
                  <p className="text-xl font-black text-[#F6F5F8] mt-0.5">{timeline.stats.current_streak} d</p>
                </div>

                <div className="p-3 rounded-xl bg-[#14151D] border border-[#393B4B] text-center">
                  <span className="text-[10px] text-[#858B98] uppercase font-semibold">Completion</span>
                  <p className="text-xl font-black text-[#A8E6CF] mt-0.5">{timeline.stats.overall_completion_rate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 5-Day Sample Continuity Timeline Tabs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#F6F5F8]">5-Day Continuity Journey</h2>
              <span className="text-xs text-[#B9BBC7]">Select a day to inspect episodic execution</span>
            </div>

            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {timeline.days.map((day) => {
                const active = selectedDayNumber === day.day_number;
                return (
                  <button
                    key={day.day_number}
                    onClick={() => setSelectedDayNumber(day.day_number)}
                    className={`flex items-center space-x-3 px-5 py-3 rounded-2xl border transition-all shrink-0 ${
                      active
                        ? "bg-[#252735] border-[#A8E6CF] text-[#F6F5F8] shadow-lg scale-102"
                        : "bg-[#14151D] border-[#393B4B] text-[#B9BBC7] hover:border-white/30"
                    }`}
                  >
                    <div className="text-left">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-bold">Day {day.day_number}</span>
                        {day.is_missed ? (
                          <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" title="Missed day" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-[#A8E6CF]" title="Completed day" />
                        )}
                      </div>
                      <span className="text-[11px] text-[#B9BBC7] font-medium">
                        {day.completion_percentage}% Output
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day View */}
          {selectedDay && (
            <div className="space-y-8">
              {/* Recovery Banner if Missed */}
              {selectedDay.is_missed && (
                <div className="p-4 rounded-2xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 flex items-start space-x-3 text-sm text-[#FF6B6B]">
                  <div className="font-bold">Missed Day Record (Day {selectedDay.day_number}):</div>
                  <div className="text-xs text-[#B9BBC7]">
                    {selectedDay.recovery_message ||
                      "Operational disruptions interrupted scheduled deliverables. The continuous streak paused, and continuity recovery resumed on Day 4."}
                  </div>
                </div>
              )}

              {/* Tasks Snapshot (Left) vs Episodes (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Tasks */}
                <div className="lg:col-span-5 glass-panel rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#393B4B] pb-3">
                    <h3 className="text-sm font-bold text-[#F6F5F8]">
                      Day {selectedDay.day_number} Scheduled Deliverables
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        selectedDay.completion_percentage >= 80
                          ? "bg-[#A8E6CF]/15 text-[#A8E6CF]"
                          : "bg-[#FF6B6B]/15 text-[#FF6B6B]"
                      }`}
                    >
                      {selectedDay.completion_percentage}% Completed
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedDay.tasks?.map((t, idx) => {
                      const completed = t.status === "completed";
                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#14151D] border border-[#393B4B] flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start space-x-2.5">
                            {completed ? (
                              <CheckCircle2 className="w-4 h-4 text-[#A8E6CF] shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-[#FF6B6B] shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className={`text-xs font-semibold ${completed ? "text-[#F6F5F8]" : "text-[#B9BBC7] line-through"}`}>
                                {t.title}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                {t.category && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#252735] text-[#B9BBC7]">
                                    {t.category}
                                  </span>
                                )}
                                {t.due_at && (
                                  <span className="text-[10px] text-[#A8E6CF] flex items-center space-x-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{t.due_at}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold text-[#A8E6CF] shrink-0">
                            +{t.points} pts
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Episodes A and B */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-sm font-bold text-[#F6F5F8]">
                    Day {selectedDay.day_number} Verified Episodes
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Episode A Card */}
                    {selectedDay.episodes?.episode_a && (
                      <div className="glass-panel rounded-2xl p-5 border border-[#393B4B] flex flex-col justify-between space-y-4 hover:border-[#A8E6CF]/50 transition-all">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#A8E6CF]/15 text-[#A8E6CF]">
                              Episode A • Morning
                            </span>
                            <span className="text-[11px] text-[#B9BBC7]">~60s</span>
                          </div>

                          <h4 className="text-base font-bold text-[#F6F5F8]">
                            {selectedDay.episodes.episode_a.title}
                          </h4>

                          <p className="text-xs text-[#B9BBC7] line-clamp-3 leading-relaxed">
                            {selectedDay.episodes.episode_a.summary}
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveModalEpisode(selectedDay.episodes.episode_a!)}
                          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#252735] hover:bg-[#A8E6CF] hover:text-[#14151D] text-[#F6F5F8] text-xs font-bold transition-all shadow-md"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Watch Episode A</span>
                        </button>
                      </div>
                    )}

                    {/* Episode B Card */}
                    {selectedDay.episodes?.episode_b && (
                      <div className="glass-panel rounded-2xl p-5 border border-[#393B4B] flex flex-col justify-between space-y-4 hover:border-[#60A5FA]/50 transition-all">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#60A5FA]/15 text-[#60A5FA]">
                              Episode B • Afternoon Outcome
                            </span>
                            <span className="text-[11px] text-[#B9BBC7]">~60s</span>
                          </div>

                          <h4 className="text-base font-bold text-[#F6F5F8]">
                            {selectedDay.episodes.episode_b.title}
                          </h4>

                          <p className="text-xs text-[#B9BBC7] line-clamp-3 leading-relaxed">
                            {selectedDay.episodes.episode_b.summary}
                          </p>
                        </div>

                        <button
                          onClick={() => setActiveModalEpisode(selectedDay.episodes.episode_b!)}
                          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-[#252735] hover:bg-[#60A5FA] hover:text-[#14151D] text-[#F6F5F8] text-xs font-bold transition-all shadow-md"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Watch Episode B</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Branching Scenarios (70%, 80%, 100%) */}
              {selectedDay.branch_previews && (
                <div className="glass-panel rounded-2xl p-6 space-y-4">
                  <div className="flex items-center space-x-2 border-b border-[#393B4B] pb-3">
                    <Sparkles className="w-4 h-4 text-[#A8E6CF]" />
                    <h3 className="text-sm font-bold text-[#F6F5F8]">
                      Branching Scenario Outcomes
                    </h3>
                  </div>

                  <p className="text-xs text-[#B9BBC7]">
                    How episodic narratives branch depending on task execution standards:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 80% */}
                    <div className="p-4 rounded-xl bg-[#14151D] border border-[#393B4B] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#A8E6CF]/15 text-[#A8E6CF]">
                          80% Completion
                        </span>
                        <span className="text-[10px] text-[#B9BBC7]">Steady Progress</span>
                      </div>
                      <p className="text-xs text-[#F6F5F8] font-medium leading-relaxed">
                        {selectedDay.branch_previews.branch_80?.narrative}
                      </p>
                      <div className="pt-2 border-t border-[#393B4B]/50 text-[11px] text-[#B9BBC7] space-y-0.5">
                        <p><strong className="text-white">Outcome:</strong> {selectedDay.branch_previews.branch_80?.outcome}</p>
                        <p><strong className="text-white">Reward:</strong> {selectedDay.branch_previews.branch_80?.reward}</p>
                      </div>
                    </div>

                    {/* 90% */}
                    <div className="p-4 rounded-xl bg-[#14151D] border border-[#393B4B] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#60A5FA]/15 text-[#60A5FA]">
                          90% Completion
                        </span>
                        <span className="text-[10px] text-[#60A5FA]">High Velocity</span>
                      </div>
                      <p className="text-xs text-[#F6F5F8] font-medium leading-relaxed">
                        {selectedDay.branch_previews.branch_90?.narrative}
                      </p>
                      <div className="pt-2 border-t border-[#393B4B]/50 text-[11px] text-[#B9BBC7] space-y-0.5">
                        <p><strong className="text-white">Outcome:</strong> {selectedDay.branch_previews.branch_90?.outcome}</p>
                        <p><strong className="text-white">Reward:</strong> {selectedDay.branch_previews.branch_90?.reward}</p>
                      </div>
                    </div>

                    {/* 100% */}
                    <div className="p-4 rounded-xl bg-[#14151D] border border-[#393B4B] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#A8E6CF]/20 text-[#A8E6CF]">
                          100% Mastery
                        </span>
                        <span className="text-[10px] text-[#A8E6CF]">Legendary</span>
                      </div>
                      <p className="text-xs text-[#F6F5F8] font-medium leading-relaxed">
                        {selectedDay.branch_previews.branch_100?.narrative}
                      </p>
                      <div className="pt-2 border-t border-[#393B4B]/50 text-[11px] text-[#B9BBC7] space-y-0.5">
                        <p><strong className="text-white">Outcome:</strong> {selectedDay.branch_previews.branch_100?.outcome}</p>
                        <p><strong className="text-white">Reward:</strong> {selectedDay.branch_previews.branch_100?.reward}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
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

export default function DemoCharacterStoryPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-24 text-center text-[#B9BBC7]">Loading demo story...</div>}>
      <StoryContent />
    </Suspense>
  );
}
