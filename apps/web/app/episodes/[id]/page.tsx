"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sparkles,
  Film,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Target
} from "lucide-react";
import { Suspense } from "react";
import { api, EpisodeItem, getStoredToken } from "@/lib/api";

function EpisodeStudioContent() {
  const params = useParams();
  const router = useRouter();
  const episodeId = params?.id as string;

  const [episode, setEpisode] = useState<EpisodeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [captionsActive, setCaptionsActive] = useState(true);

  // Selected outcome card state (70%, 80%, 100%)
  const [selectedOutcomeKey, setSelectedOutcomeKey] = useState<"branch_70" | "branch_80" | "branch_100">("branch_80");

  useEffect(() => {
    if (!episodeId) return;
    loadEpisode();
  }, [episodeId]);

  const loadEpisode = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getEpisodeDetail(episodeId);
      setEpisode(data);
    } catch (err: any) {
      console.error("Failed to load episode", err);
      // Fallback: If not found in user episodes, try searching in demo timelines
      try {
        const demoTimeline = await api.getTimeline("cary");
        let foundEp: EpisodeItem | null = null;
        demoTimeline.days.forEach((d) => {
          if (d.episodes?.episode_a?.id === episodeId) foundEp = d.episodes.episode_a;
          if (d.episodes?.episode_b?.id === episodeId) foundEp = d.episodes.episode_b;
        });
        if (foundEp) {
          setEpisode(foundEp);
          return;
        }
      } catch {}
      setError(err?.message || "Episode not found or access denied.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);
    setDuration(videoRef.current.duration || episode?.duration_seconds || 60);

    // Sync active scene
    if (episode?.scenes && episode.scenes.length > 0) {
      let accumulated = 0;
      for (let i = 0; i < episode.scenes.length; i++) {
        accumulated += episode.scenes[i].duration_seconds;
        if (cur <= accumulated) {
          setActiveSceneIndex(i);
          break;
        }
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTime = Number(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const jumpToScene = (index: number) => {
    setActiveSceneIndex(index);
    if (!episode?.scenes) return;
    let time = 0;
    for (let i = 0; i < index; i++) {
      time += episode.scenes[i].duration_seconds;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }

    // Scroll script container to matching heading if available
    const el = document.getElementById(`scene-heading-${index + 1}`);
    if (el && scriptContainerRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 space-y-4">
        <RefreshCw className="w-8 h-8 text-[#F2D15C] animate-spin" />
        <p className="text-sm font-semibold text-[#B9BBC7]">Loading full-screen episode studio...</p>
      </div>
    );
  }

  if (error || !episode) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <AlertCircle className="w-12 h-12 text-[#F2D15C]" />
        <h2 className="text-xl font-bold text-[#F6F5F8]">{error || "Episode Not Found"}</h2>
        <p className="text-xs text-[#858B98] max-w-md">
          This episode either belongs to another series or has not been generated yet.
        </p>
        <Link
          href="/episodes"
          className="px-5 py-2.5 rounded-xl bg-[#20232E] border border-[#393B4B] text-xs font-bold text-[#F6F5F8] hover:border-[#F2D15C] transition-all flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Episodes</span>
        </Link>
      </div>
    );
  }

  // Fallback branch preview definitions
  const branchPreviews: Record<string, any> = episode.branch_previews || {
    branch_70: {
      narrative: "Completes primary core tasks, but leaves final validation pending. Tomorrow begins with an impromptu verification sprint.",
      next_step: "Address remaining verification gaps before advancing to new scope.",
      goal_impact: "Partial milestone credit (+5% foundational learning).",
    },
    branch_80: {
      narrative: "Executes major milestones cleanly. Gains valuable domain insight that opens tomorrow's practical design phase.",
      next_step: "Begin drafting the next functional architectural component.",
      goal_impact: "Steady milestone advancement (+15% milestone momentum).",
    },
    branch_100: {
      narrative: "Flawlessly finishes every planned deliverable. Unlocks high-impact recognition and positions tomorrow for advanced innovation.",
      next_step: "Initiate next major roadmap phase with double momentum.",
      goal_impact: "Maximum milestone completion (+25% accelerated progress).",
    },
  };

  // Video source handling
  const hasPlayableVideo = !!episode.video_url && episode.generation_status === "completed";
  const videoSrc = episode.video_url || "/demo/cary/day-01/episode-a.mp4";

  return (
    <div className="w-full h-full flex flex-col bg-[#14151D] text-[#F6F5F8]">
      {/* Studio Top Bar */}
      <div className="shrink-0 px-4 md:px-6 py-3 border-b border-[#393B4B] bg-[#14151D] flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3 truncate">
          <Link
            href="/episodes"
            className="p-1.5 rounded-lg text-[#858B98] hover:text-[#F6F5F8] hover:bg-[#20232E] transition-colors shrink-0"
            title="Back to Episodes"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <span className="px-2.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-[#F2D15C]/15 text-[#F2D15C] border border-[#F2D15C]/30 shrink-0">
            Ep {episode.episode_number}
          </span>

          <div className="truncate">
            <h1 className="text-sm md:text-base font-extrabold text-[#F6F5F8] truncate">
              {episode.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider bg-[#20232E] text-[#A8E6CF] border border-[#393B4B]">
            {hasPlayableVideo ? "Playable Video" : "Preview Mode"}
          </span>

          <Link
            href="/episodes"
            className="text-xs font-semibold text-[#858B98] hover:text-[#F6F5F8] transition-colors hidden sm:inline-block"
          >
            Back to Episodes
          </Link>
        </div>
      </div>

      {/* Four-Panel Desktop Layout / Stacked Mobile Layout */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-2 p-3 md:p-4 gap-4 h-[calc(100vh-8.5rem)]">
        {/* LEFT COLUMN: Panel 1 (Video) + Panel 2 (Outcomes) */}
        <div className="flex flex-col space-y-4 lg:h-full lg:overflow-hidden">
          {/* PANEL 1: VIDEO PLAYER / DESIGNED PLACEHOLDER */}
          <div
            ref={playerContainerRef}
            className="relative rounded-2xl overflow-hidden bg-black border border-[#393B4B] shadow-2xl flex flex-col justify-center shrink-0 aspect-video group"
          >
            {hasPlayableVideo ? (
              <video
                ref={videoRef}
                src={videoSrc}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain"
                playsInline
              />
            ) : (
              /* Designed Video Placeholder */
              <div className="w-full h-full relative flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#14151D] via-[#20232E] to-[#14151D]">
                <div className="w-14 h-14 rounded-2xl bg-[#F2D15C]/10 border border-[#F2D15C]/30 flex items-center justify-center mb-3">
                  <Film className="w-7 h-7 text-[#F2D15C]" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#F2D15C] mb-1">
                  Preview Mode • Script Active
                </span>
                <h3 className="text-base font-extrabold text-[#F6F5F8] max-w-sm mb-1">
                  {episode.title}
                </h3>
                <p className="text-[11px] text-[#858B98] max-w-xs">
                  Read the complete narrative screenplay in Panel 3. Motion comic video is queued for background assembly.
                </p>
                <div className="mt-3 px-3 py-1 rounded-full bg-[#14151D] border border-[#393B4B] text-[10px] text-[#A8E6CF] font-mono">
                  Full Screenplay Validated
                </div>
              </div>
            )}

            {/* Play overlay button if playable and paused */}
            {hasPlayableVideo && !isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-[#14151D]/80 hover:bg-[#F2D15C] hover:text-[#14151D] text-[#F2D15C] border border-[#F2D15C]/40 flex items-center justify-center transition-all hover:scale-110 shadow-2xl z-10"
              >
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </button>
            )}

            {/* Video Controls Bar */}
            {hasPlayableVideo && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 space-y-2 opacity-95 transition-opacity z-10">
                <input
                  type="range"
                  min="0"
                  max={duration || 60}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#F2D15C]"
                />

                <div className="flex items-center justify-between text-xs text-[#F6F5F8]">
                  <div className="flex items-center space-x-3">
                    <button onClick={togglePlay} className="hover:text-[#F2D15C] transition-colors">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    <button onClick={toggleMute} className="hover:text-[#F2D15C] transition-colors">
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <span className="font-mono text-[10px] text-[#858B98]">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setCaptionsActive(!captionsActive)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                        captionsActive
                          ? "bg-[#F2D15C]/20 text-[#F2D15C] border-[#F2D15C]/40"
                          : "text-[#858B98] border-[#393B4B]"
                      }`}
                      title="Toggle captions"
                    >
                      CC
                    </button>

                    <button onClick={toggleFullscreen} className="hover:text-[#F2D15C] transition-colors" title="Toggle Fullscreen">
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PANEL 2: 70% / 80% / 100% POTENTIAL TOMORROW OUTCOMES */}
          <div className="glass-panel rounded-2xl p-4 border border-[#393B4B] flex-1 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#393B4B]/70 pb-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F2D15C] flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Panel 2: Potential Tomorrow Outcomes</span>
              </span>
              <span className="text-[10px] text-[#858B98]">Click card to inspect scenario</span>
            </div>

            {/* 3 Outcome Scenario Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-2">
              {/* 70% Card */}
              <button
                type="button"
                onClick={() => setSelectedOutcomeKey("branch_70")}
                className={`p-3 rounded-xl text-left border transition-all ${
                  selectedOutcomeKey === "branch_70"
                    ? "bg-[#20232E] border-[#A8E6CF] shadow-md"
                    : "bg-[#14151D] border-[#393B4B] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#A8E6CF]/15 text-[#A8E6CF]">
                    70% Completion
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#F6F5F8] line-clamp-1">Partial Arc</p>
                <p className="text-[10px] text-[#858B98] line-clamp-2 mt-0.5 leading-snug">
                  {branchPreviews.branch_70?.narrative || "Foundational steps verified."}
                </p>
              </button>

              {/* 80% Card */}
              <button
                type="button"
                onClick={() => setSelectedOutcomeKey("branch_80")}
                className={`p-3 rounded-xl text-left border transition-all ${
                  selectedOutcomeKey === "branch_80"
                    ? "bg-[#20232E] border-[#F2D15C] shadow-md"
                    : "bg-[#14151D] border-[#393B4B] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#F2D15C]/15 text-[#F2D15C]">
                    80% Completion
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#F6F5F8] line-clamp-1">High Momentum</p>
                <p className="text-[10px] text-[#858B98] line-clamp-2 mt-0.5 leading-snug">
                  {branchPreviews.branch_80?.narrative || "Major milestones completed cleanly."}
                </p>
              </button>

              {/* 100% Card */}
              <button
                type="button"
                onClick={() => setSelectedOutcomeKey("branch_100")}
                className={`p-3 rounded-xl text-left border transition-all ${
                  selectedOutcomeKey === "branch_100"
                    ? "bg-[#20232E] border-[#60A5FA] shadow-md"
                    : "bg-[#14151D] border-[#393B4B] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#60A5FA]/15 text-[#60A5FA]">
                    100% Completion
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#F6F5F8] line-clamp-1">Mastery Breakthrough</p>
                <p className="text-[10px] text-[#858B98] line-clamp-2 mt-0.5 leading-snug">
                  {branchPreviews.branch_100?.narrative || "Flawless execution of all deliverables."}
                </p>
              </button>
            </div>

            {/* Selected Scenario Details Preview */}
            <div className="bg-[#14151D] p-3 rounded-xl border border-[#393B4B]/60 text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-[#F6F5F8]">
                  Detailed Scenario Impact:{" "}
                  <span className="text-[#F2D15C]">
                    {selectedOutcomeKey === "branch_70"
                      ? "70% Milestone Delivery"
                      : selectedOutcomeKey === "branch_80"
                      ? "80% Core Delivery"
                      : "100% Perfect Delivery"}
                  </span>
                </span>
                <span className="text-[10px] text-[#A8E6CF]">
                  {branchPreviews[selectedOutcomeKey]?.goal_impact || "Continuous Progress"}
                </span>
              </div>
              <p className="text-[11px] text-[#858B98] leading-relaxed">
                {branchPreviews[selectedOutcomeKey]?.narrative}
              </p>
              {branchPreviews[selectedOutcomeKey]?.next_step && (
                <p className="text-[10px] text-[#A8E6CF] font-semibold pt-0.5">
                  Suggested Next Step: {branchPreviews[selectedOutcomeKey].next_step}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Panel 3 (Full Script) + Panel 4 (Scene Navigation) */}
        <div className="flex flex-col space-y-4 lg:h-full lg:overflow-hidden">
          {/* PANEL 3: FULL EPISODE SCRIPT */}
          <div className="glass-panel rounded-2xl p-4 border border-[#393B4B] flex flex-col lg:h-3/5 overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#393B4B]/70 pb-2 mb-2 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A8E6CF] flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>Panel 3: Full Episode Script</span>
              </span>
              <span className="text-[10px] text-[#858B98] font-mono">Personalized Screenplay</span>
            </div>

            <div
              ref={scriptContainerRef}
              className="flex-1 overflow-y-auto pr-1 text-xs text-[#F6F5F8] leading-relaxed font-mono space-y-3 bg-[#14151D]/70 p-3 rounded-xl border border-[#393B4B]/50"
            >
              {episode.full_script ? (
                <div className="whitespace-pre-line">{episode.full_script}</div>
              ) : (
                <div className="space-y-3">
                  <div className="border-b border-[#393B4B]/50 pb-2">
                    <p className="text-[#F2D15C] font-bold">
                      === EPISODE {episode.episode_number}: {episode.title.toUpperCase()} ===
                    </p>
                    <p className="text-[11px] text-[#858B98] mt-0.5">{episode.summary}</p>
                  </div>

                  {episode.scenes && episode.scenes.length > 0 ? (
                    episode.scenes.map((sc, idx) => (
                      <div key={idx} id={`scene-heading-${idx + 1}`} className="space-y-1">
                        <p className="text-[#A8E6CF] font-bold">
                          [SCENE {sc.scene_number}: {sc.title}]
                        </p>
                        <p className="text-[11px] text-[#858B98]">Visual: {sc.visual_description}</p>
                        <p className="text-xs text-[#F6F5F8]">Narration: {sc.narration_text}</p>
                        {sc.dialogue && Array.isArray(sc.dialogue) && sc.dialogue.map((d: any, dIdx: number) => (
                          <p key={dIdx} className="text-xs text-[#F2D15C] pl-3 italic">
                            {d.speaker}: "{d.line}"
                          </p>
                        ))}
                      </div>
                    ))
                  ) : (
                    <p className="text-[#858B98]">Generating scene screenplay...</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* PANEL 4: SCENE NAVIGATION */}
          <div className="glass-panel rounded-2xl p-4 border border-[#393B4B] flex flex-col lg:h-2/5 overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#393B4B]/70 pb-2 mb-2 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-[#858B98] flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-[#F2D15C]" />
                <span>Panel 4: Scene Navigation</span>
              </span>
              <span className="text-[10px] text-[#858B98]">
                Active: Scene {activeSceneIndex + 1} of {(episode.scenes && episode.scenes.length) || 3}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {((episode.scenes && episode.scenes.length > 0)
                ? episode.scenes
                : [
                    {
                      id: "s1",
                      scene_number: 1,
                      title: "Scene 1: Opening Groundwork",
                      visual_description: "Focused morning session completing foundational tasks.",
                      duration_seconds: 20,
                      narration_text: "Beginning the day with deliberate effort.",
                    },
                    {
                      id: "s2",
                      scene_number: 2,
                      title: "Scene 2: Core Execution",
                      visual_description: "Working through technical hurdles and validating progress.",
                      duration_seconds: 20,
                      narration_text: "Each completed step solidifies practical capability.",
                    },
                    {
                      id: "s3",
                      scene_number: 3,
                      title: "Scene 3: Horizon Outlook",
                      visual_description: "Reviewing daily momentum and anticipating tomorrow's challenge.",
                      duration_seconds: 20,
                      narration_text: "A clear trajectory toward the ultimate destination.",
                    },
                  ]
              ).map((scene, idx) => {
                const isActive = activeSceneIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => jumpToScene(idx)}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isActive
                        ? "bg-[#20232E] border-[#F2D15C] shadow-lg"
                        : "bg-[#14151D] border-[#393B4B] hover:border-white/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isActive ? "bg-[#F2D15C] text-[#14151D]" : "bg-[#20232E] text-[#858B98]"
                          }`}
                        >
                          Scene {scene.scene_number}
                        </span>
                        <span className="text-[9px] text-[#858B98]">~{scene.duration_seconds}s</span>
                      </div>
                      <p className={`text-xs font-bold truncate ${isActive ? "text-[#F2D15C]" : "text-[#F6F5F8]"}`}>
                        {scene.title}
                      </p>
                    </div>

                    <p className="text-[10px] text-[#858B98] line-clamp-2 mt-1 leading-snug">
                      {scene.narration_text || scene.visual_description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EpisodeStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 space-y-4">
          <RefreshCw className="w-8 h-8 text-[#F2D15C] animate-spin" />
        </div>
      }
    >
      <EpisodeStudioContent />
    </Suspense>
  );
}
