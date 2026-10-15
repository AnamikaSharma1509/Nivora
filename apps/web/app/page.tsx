"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Play,
  Sparkles,
  CheckCircle2,
  Film,
  Flame,
  ArrowRight,
  Mic,
  CalendarCheck,
  History,
  Users,
  Layers,
  Award,
  Clock,
  Compass,
  FileText
} from "lucide-react";
import NivoraLogo from "@/components/NivoraLogo";
import EpisodePlayerModal from "@/components/EpisodePlayerModal";
import { EpisodeItem } from "@/lib/api";

const DEMO_CHARACTERS = [
  {
    key: "cary",
    name: "Cary Vance",
    role: "Startup Founder & CEO",
    genre: "Corporate Drama",
    avatar: "/avatars/cary.png",
    bio: "Scaling an AI infrastructure startup through critical quarterly deliverables and board audits.",
    episodeTitle: "The Quarter-End Deadline",
    videoUrl: "/demo/cary/day-01/episode-a.mp4",
  },
  {
    key: "meera",
    name: "Meera Sharma",
    role: "AI Systems Engineer",
    genre: "Tech Drama",
    avatar: "/avatars/meera.png",
    bio: "Pioneering distributed neural transformer clusters in Bangalore's premier engineering lab.",
    episodeTitle: "First Epoch: The Model Awakening",
    videoUrl: "/demo/meera/day-01/episode-a.mp4",
  },
  {
    key: "aarav",
    name: "Aarav Kapoor",
    role: "Fintech Entrepreneur",
    genre: "Business Drama",
    avatar: "/avatars/aarav.png",
    bio: "Building instantaneous cross-border settlement rails for Mumbai merchants and global trade.",
    episodeTitle: "The Merchant Rail",
    videoUrl: "/demo/aarav/day-01/episode-a.mp4",
  },
  {
    key: "ananya",
    name: "Dr. Ananya Sen",
    role: "Medical Resident",
    genre: "Slice of Life & Drama",
    avatar: "/avatars/ananya.png",
    bio: "Navigating surgical emergency rotations, diagnostic precision, and board examinations.",
    episodeTitle: "Grand Rounds & Vascular Precision",
    videoUrl: "/demo/ananya/day-01/episode-a.mp4",
  },
  {
    key: "riya",
    name: "Riya Varma",
    role: "Lead Product Designer",
    genre: "Creative Rom-Com",
    avatar: "/avatars/riya.png",
    bio: "Directing generative studio aesthetics and human-centered design for global digital tools.",
    episodeTitle: "The Blank Canvas",
    videoUrl: "/demo/riya/day-01/episode-a.mp4",
  },
  {
    key: "arjun",
    name: "Arjun Rathore",
    role: "Decathlete & Sports Scientist",
    genre: "Sports Drama",
    avatar: "/avatars/arjun.png",
    bio: "Balancing biomechanical telemetry, hurdle mechanics, and national championship trials.",
    episodeTitle: "Dawn Track & The 400m Record",
    videoUrl: "/demo/arjun/day-01/episode-a.mp4",
  },
];

export default function LandingPage() {
  const [selectedDemoEpisode, setSelectedDemoEpisode] = useState<EpisodeItem | null>(null);

  // Cary's investor showcase episode
  const caryShowcaseEpisode: EpisodeItem = {
    id: "cary-investor-showcase",
    series_id: "cary-series",
    episode_number: 1,
    title: "Episode 1: The Quarter-End Deadline",
    summary:
      "Cary finishes the quarterly reports by noon, hands over the audited documents to the executive committee, and delivers the conference keynote address.",
    opening_hook: "The morning sun strikes the high-rise glass as Cary reviews revenue variances before the executive deadline...",
    cliffhanger: "A surprise confidential inquiry arrives from an international institutional backer...",
    full_script: `[SCENE 1: Office Arrival - Morning]
Narration: Cary enters the modern office carrying the final quarter-end forecasts. With the board review scheduled for noon, there is zero margin for error.

[SCENE 2: Audited Handover]
Narration: Walking into the executive boardroom, Cary places the audited document on the table. The review is swift and unanimous. The quarterly goal is marked complete.

[SCENE 3: Keynote Address & Cliffhanger]
Cary: "We are building productivity systems that empower creators to produce their life's defining work."
Narration: The auditorium responds with enthusiasm. As Cary steps backstage, an unlisted invitation opens the door to tomorrow's major challenge.`,
    generation_status: "completed",
    video_url: "/demo/cary/day-01/episode-a.mp4",
    duration_seconds: 60.0,
    scenes: [
      {
        id: "s1",
        scene_number: 1,
        title: "Scene 1: Office Arrival",
        visual_description: "Cary reviewing financial charts at dawn.",
        image_prompt: "Cinematic shot of Cary in navy blazer, modern glass office.",
        narration_text: "Every quarter comes down to the discipline of the final morning.",
        dialogue: [{ speaker: "Cary", line: "Let's lock in these final projections." }],
        mood: "focused",
        duration_seconds: 20,
      },
      {
        id: "s2",
        scene_number: 2,
        title: "Scene 2: Report Handover",
        visual_description: "Delivering the quarterly report to the manager.",
        image_prompt: "Cary handing over leather-bound quarterly report.",
        narration_text: "The handover confirms all goals achieved ahead of schedule.",
        dialogue: [{ speaker: "Manager", line: "Exemplary execution, Cary." }],
        mood: "triumphant",
        duration_seconds: 20,
      },
      {
        id: "s3",
        scene_number: 3,
        title: "Scene 3: Keynote & Cliffhanger",
        visual_description: "Auditorium speech leading into the next chapter.",
        image_prompt: "Cary on conference stage with holographic screen.",
        narration_text: "A new institutional partnership inquiry arrives.",
        dialogue: [{ speaker: "Cary", line: "This is just our first milestone." }],
        mood: "cliffhanger",
        duration_seconds: 20,
      },
    ],
    branch_previews: {
      branch_80: {
        narrative: "Completing 80% tasks keeps operations steady, but a metrics variance requires an evening audit.",
        outcome: "Steady Arc with Pending Challenge",
        reward: "+50 XP",
      },
      branch_90: {
        narrative: "Reaching 90% completion earns management praise and early partner interest.",
        outcome: "High Momentum & Growth",
        reward: "+80 XP",
      },
      branch_100: {
        narrative: "Flawless 100% completion unlocks the golden narrative milestone and highest tier rewards.",
        outcome: "Mastery Achieved & Golden Milestone Unlocked",
        reward: "+120 XP, Legendary Streak Multiplier",
      },
    },
    created_at: "2026-10-15T00:00:00.000Z",
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[82vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient atmospheric backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1D1F2B]/60 via-[#14151D] to-[#14151D] pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#A8E6CF]/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          {/* Header Tag */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#252735] border border-[#393B4B] text-xs font-semibold text-[#A8E6CF] shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#A8E6CF]" />
            <span>AI-Powered Episodic Productivity Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F6F5F8] leading-[1.08]">
            Turn Your Daily Goals Into A{" "}
            <span className="text-gradient-coral">Cinematic Series</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-[#B9BBC7] max-w-3xl mx-auto font-normal leading-relaxed">
            Speak your tasks at dawn. Complete your goals by noon. At sunset, watch your custom digital avatar star in a high-fidelity narrative episode shaped by your real achievements.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/today"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-[#14151D] font-extrabold text-base shadow-xl transition-all hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Mic className="w-5 h-5 text-[#14151D]" />
              <span>Start Today&apos;s Plan</span>
            </Link>

            <button
              onClick={() => setSelectedDemoEpisode(caryShowcaseEpisode)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#252735] hover:bg-[#1D1F2B] border border-[#393B4B] text-[#F6F5F8] font-bold text-base transition-all hover:scale-105 flex items-center justify-center space-x-2.5 shadow-lg"
            >
              <Play className="w-4 h-4 fill-current text-[#FF6B6B]" />
              <span>Watch Investor Showcase Episode</span>
            </button>
          </div>

          {/* Feature Highlights Pills */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#B9BBC7]">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#A8E6CF]" />
              <span>Voice-First Task Entry</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#A8E6CF]" />
              <span>30+ Indian & International Identities</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#A8E6CF]" />
              <span>5-Day Persistent Timeline & Streaks</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#A8E6CF]" />
              <span>80%, 90%, 100% Branching Scenarios</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. INVESTOR SHOWCASE: SIX DEMO CHARACTERS & 60 SAMPLE EPISODES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#393B4B] pb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#A8E6CF] mb-1">
              <Film className="w-4 h-4" />
              <span>Curated Investor Showcase</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F6F5F8]">
              6 Characters • 60 Sample Episodes
            </h2>
            <p className="text-xs sm:text-sm text-[#B9BBC7] mt-1">
              Explore 5 full days of task histories, persistent streaks, and genuine assembled video episodes.
            </p>
          </div>

          <Link
            href="/timeline"
            className="flex items-center space-x-1 text-xs font-bold text-[#A8E6CF] hover:underline shrink-0"
          >
            <span>Explore Complete Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Character Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_CHARACTERS.map((char) => (
            <div
              key={char.key}
              className="glass-panel rounded-2xl p-5 border border-[#393B4B] hover:border-[#A8E6CF]/60 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-[#14151D] border border-[#393B4B] flex items-center justify-center font-bold text-base text-[#A8E6CF]">
                      {char.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#F6F5F8] group-hover:text-[#A8E6CF] transition-colors">
                        {char.name}
                      </h3>
                      <p className="text-xs text-[#A8E6CF] font-medium">{char.role}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#252735] text-[#B9BBC7] border border-[#393B4B]">
                    {char.genre}
                  </span>
                </div>

                <p className="text-xs text-[#B9BBC7] line-clamp-2 leading-relaxed">
                  {char.bio}
                </p>

                <div className="p-3 rounded-xl bg-[#14151D] border border-[#393B4B] space-y-1">
                  <span className="text-[10px] font-bold text-[#FFB347] uppercase tracking-wider block">
                    Day 1 Episode Preview
                  </span>
                  <p className="text-xs font-bold text-[#F6F5F8] truncate">{char.episodeTitle}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#393B4B] flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedDemoEpisode({
                      ...caryShowcaseEpisode,
                      id: `demo-${char.key}-d1`,
                      title: `${char.name}: ${char.episodeTitle}`,
                      video_url: char.videoUrl,
                    });
                  }}
                  className="flex items-center space-x-1.5 py-1.5 px-3 rounded-lg bg-[#252735] hover:bg-[#A8E6CF] hover:text-[#14151D] text-xs font-bold text-[#F6F5F8] transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Watch Video</span>
                </button>

                <Link
                  href={`/timeline?char=${char.key}`}
                  className="text-xs font-semibold text-[#B9BBC7] hover:text-white"
                >
                  View 5-Day Journey →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. HOW NIVORA WORKS: 3-STAGE EPISODIC ENGINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A8E6CF]">
            Episodic Productivity Engine
          </span>
          <h2 className="text-3xl font-extrabold text-[#F6F5F8]">How Nivora Powers Your Life</h2>
          <p className="text-xs sm:text-sm text-[#B9BBC7]">
            Turning task discipline into high-stakes narrative progression with three synchronized systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-panel rounded-2xl p-6 border border-[#393B4B] space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B6B]/15 border border-[#FF6B6B]/30 flex items-center justify-center text-[#FF6B6B]">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F6F5F8]">1. Speak & Weight Your Day</h3>
            <p className="text-xs text-[#B9BBC7] leading-relaxed">
              Use voice input or manual entry to state your goals naturally. Our AI extracts structured tasks with priority points, categories, and due dates.
            </p>
            <div className="text-[11px] font-semibold text-[#A8E6CF]">
              • Spoken Voice Feedback on Completion
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel rounded-2xl p-6 border border-[#393B4B] space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#A8E6CF]/15 border border-[#A8E6CF]/30 flex items-center justify-center text-[#A8E6CF]">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F6F5F8]">2. Persistent Streaks & Recovery</h3>
            <p className="text-xs text-[#B9BBC7] leading-relaxed">
              Achieve 80%+ daily points to maintain your streak. If life interrupts and you miss a day, our continuity recovery system preserves your history.
            </p>
            <div className="text-[11px] font-semibold text-[#A8E6CF]">
              • 80%, 90%, 100% Branching Scenarios
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel rounded-2xl p-6 border border-[#393B4B] space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFB347]/15 border border-[#FFB347]/30 flex items-center justify-center text-[#FFB347]">
              <Film className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#F6F5F8]">3. Daily Assembled AI Episodes</h3>
            <p className="text-xs text-[#B9BBC7] leading-relaxed">
              Watch your customized protagonist star in a genuine MP4 video episode with screenplay dialogue, scene navigation, and next-day cliffhangers.
            </p>
            <div className="text-[11px] font-semibold text-[#A8E6CF]">
              • Video Studio with Fullscreen Player
            </div>
          </div>
        </div>
      </section>

      {/* 4. CUSTOM IDENTITY BUILDER CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel-glow rounded-3xl p-8 md:p-12 border border-[#A8E6CF]/40 relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#A8E6CF]/20 text-[#A8E6CF] border border-[#A8E6CF]/40">
              Identity & Personality Creator
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#F6F5F8] tracking-tight">
              Create Your Digital Aspirational Persona
            </h2>
            <p className="text-sm text-[#B9BBC7] leading-relaxed">
              Don&apos;t settle for generic avatars. Use our 7-step builder to configure your character&apos;s career, nationality, strengths, growing edges, clothing aesthetic, and cinematic tone.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/characters"
                className="px-6 py-3 rounded-xl bg-[#A8E6CF] text-[#14151D] font-bold text-sm shadow-lg hover:bg-[#7ED8B8] transition-all hover:scale-105"
              >
                Open Character Builder
              </Link>
              <Link
                href="/timeline"
                className="px-6 py-3 rounded-xl bg-[#252735] text-[#F6F5F8] font-semibold text-sm border border-[#393B4B] hover:bg-[#1D1F2B] transition-colors"
              >
                Inspect 5-Day Demo Timeline
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Episode Player Modal */}
      {selectedDemoEpisode && (
        <EpisodePlayerModal
          isOpen={true}
          episode={selectedDemoEpisode}
          onClose={() => setSelectedDemoEpisode(null)}
        />
      )}
    </div>
  );
}
