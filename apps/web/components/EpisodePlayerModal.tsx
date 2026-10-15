"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sparkles,
  Film,
  Clock,
  Layers,
  FileText,
  Subtitles,
  ChevronRight,
  TrendingUp,
  Award
} from "lucide-react";
import { EpisodeItem } from "@/lib/api";

interface EpisodePlayerModalProps {
  episode: EpisodeItem | null;
  isOpen?: boolean;
  onClose: () => void;
}

export default function EpisodePlayerModal({
  episode,
  isOpen = true,
  onClose,
}: EpisodePlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [captionsActive, setCaptionsActive] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " " && videoRef.current) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!isOpen || !episode) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
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
    setDuration(videoRef.current.duration || episode.duration_seconds || 60);

    // Sync active scene
    if (episode.scenes && episode.scenes.length > 0) {
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
    if (!videoRef.current || !episode.scenes) return;
    let time = 0;
    for (let i = 0; i < index; i++) {
      time += episode.scenes[i].duration_seconds;
    }
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    setActiveSceneIndex(index);
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if ((container as any).webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
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

  // Video source resolution: local demo media or fallback
  const videoSrc = episode.video_url || "/demo/cary/day-01/episode-a.mp4";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl glass-panel rounded-2xl border border-[#393B4B] shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#393B4B] bg-[#14151D]/60 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded text-xs font-black bg-[#A8E6CF]/15 text-[#A8E6CF] border border-[#A8E6CF]/30">
              Episode {episode.episode_number}
            </span>
            <h2 className="text-lg md:text-xl font-extrabold text-[#F6F5F8] truncate max-w-xl">
              {episode.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#B9BBC7] hover:text-white hover:bg-white/5 transition-colors"
            title="Close studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Studio Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* 1. TOP AREA: Full Episode Screenplay / Script Panel */}
          <div className="glass-panel rounded-xl p-5 border border-[#393B4B] space-y-3">
            <div className="flex items-center justify-between border-b border-[#393B4B]/60 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A8E6CF] flex items-center space-x-1.5">
                <FileText className="w-4 h-4" />
                <span>Full Screenplay & Script Narrative</span>
              </span>
              <span className="text-[11px] text-[#B9BBC7]">Continuity Engine • Cinematic Arc</span>
            </div>

            <div className="text-xs md:text-sm text-[#F6F5F8] leading-relaxed whitespace-pre-line bg-[#14151D]/70 p-4 rounded-xl border border-[#393B4B]/50 max-h-48 overflow-y-auto font-mono">
              {episode.full_script ||
                `[SCENE 1: Office Arrival - Morning]
Narration: The morning sun strikes the glass facade of the high-rise. Cary walks through the revolving doors with focused determination, carrying the finalized performance data.

[SCENE 2: The Audited Handover]
Narration: With every forecast verified, Cary presents the report directly to the executive committee. The review is swift, acknowledging zero discrepancy.

[SCENE 3: Keynote Address & Cliffhanger]
Cary: "We are building intelligence systems that empower people to do their life's finest work."
Narration: The speech concludes to applause, but an unexpected investor inquiry signals that tomorrow's stakes will be even higher.`}
            </div>
          </div>

          {/* 2. VIDEO AREA: Cinematic HTML5 Video Player */}
          <div
            ref={playerContainerRef}
            className="relative rounded-2xl overflow-hidden bg-black border border-[#393B4B] shadow-2xl group"
          >
            <video
              ref={videoRef}
              src={videoSrc}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="w-full aspect-video object-contain"
              playsInline
            />

            {/* Big Center Play Overlay Button when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#14151D]/80 hover:bg-[#A8E6CF] hover:text-[#14151D] text-[#A8E6CF] border border-[#A8E6CF]/40 flex items-center justify-center transition-all hover:scale-110 shadow-2xl"
              >
                <Play className="w-7 h-7 fill-current ml-1" />
              </button>
            )}

            {/* Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 space-y-2 opacity-95 transition-opacity">
              {/* Progress Seek Bar */}
              <input
                type="range"
                min="0"
                max={duration || 60}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#A8E6CF]"
              />

              <div className="flex items-center justify-between text-xs text-[#F6F5F8]">
                <div className="flex items-center space-x-3">
                  <button onClick={togglePlay} className="hover:text-[#A8E6CF] transition-colors">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button onClick={toggleMute} className="hover:text-[#A8E6CF] transition-colors">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="font-mono text-[11px] text-[#B9BBC7]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setCaptionsActive(!captionsActive)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      captionsActive
                        ? "bg-[#A8E6CF]/20 text-[#A8E6CF] border-[#A8E6CF]/40"
                        : "text-[#B9BBC7] border-[#393B4B]"
                    }`}
                    title="Toggle captions"
                  >
                    CC
                  </button>

                  <button onClick={toggleFullscreen} className="hover:text-[#A8E6CF] transition-colors" title="Toggle Fullscreen">
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. MIDDLE AREA: Scene-by-Scene Navigation (Seeking in Video) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B9BBC7] flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-[#A8E6CF]" />
                <span>Scene Navigation (Click to Jump)</span>
              </span>
              <span className="text-[11px] text-[#B9BBC7]">
                Active: Scene {activeSceneIndex + 1} of {(episode.scenes && episode.scenes.length) || 3}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {((episode.scenes && episode.scenes.length > 0)
                ? episode.scenes
                : [
                    {
                      id: "s1",
                      scene_number: 1,
                      title: "Scene 1: Office Arrival",
                      visual_description: "Cary arrives at dawn with completed reports.",
                      duration_seconds: 20,
                      narration_text: "Finalizing metrics before the executive review.",
                    },
                    {
                      id: "s2",
                      scene_number: 2,
                      title: "Scene 2: Report Handover",
                      visual_description: "Executive committee approves the forecasts.",
                      duration_seconds: 20,
                      narration_text: "Approval secured without hesitation.",
                    },
                    {
                      id: "s3",
                      scene_number: 3,
                      title: "Scene 3: Keynote & Cliffhanger",
                      visual_description: "Auditorium address leads into an investor opportunity.",
                      duration_seconds: 20,
                      narration_text: "An unlisted invitation opens tomorrow's door.",
                    },
                  ]
              ).map((scene, idx) => {
                const isActive = activeSceneIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => jumpToScene(idx)}
                    className={`p-3.5 rounded-xl text-left border transition-all ${
                      isActive
                        ? "bg-[#252735] border-[#A8E6CF] shadow-lg scale-102"
                        : "bg-[#14151D] border-[#393B4B] hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isActive ? "bg-[#A8E6CF] text-[#14151D]" : "bg-[#252735] text-[#B9BBC7]"
                        }`}
                      >
                        Scene {scene.scene_number}
                      </span>
                      <span className="text-[10px] text-[#B9BBC7]">~{scene.duration_seconds}s</span>
                    </div>

                    <p className={`text-xs font-bold truncate ${isActive ? "text-[#A8E6CF]" : "text-[#F6F5F8]"}`}>
                      {scene.title}
                    </p>
                    <p className="text-[11px] text-[#B9BBC7] line-clamp-2 mt-1">
                      {scene.narration_text || scene.visual_description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. BOTTOM AREA: What Happens Next? 80%, 90%, 100% Branching Preview Cards */}
          <div className="glass-panel rounded-xl p-5 border border-[#393B4B] space-y-3">
            <div className="flex items-center space-x-2 border-b border-[#393B4B]/60 pb-2">
              <Sparkles className="w-4 h-4 text-[#FFB347]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#F6F5F8]">
                What Happens Next? Potential Tomorrow Outcomes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#14151D] border border-[#393B4B] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#A8E6CF]/15 text-[#A8E6CF]">
                    80% Goal Completion
                  </span>
                  <span className="text-[10px] text-[#B9BBC7]">Steady Arc</span>
                </div>
                <p className="text-xs text-[#F6F5F8] leading-relaxed">
                  {episode.branch_previews?.branch_80?.narrative ||
                    "Completes major milestones, but a metrics variance requires an impromptu evening audit."}
                </p>
                <p className="text-[11px] text-[#A8E6CF] font-semibold pt-1">
                  Reward: +50 XP, Continuity Maintained
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#14151D] border border-[#393B4B] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFB347]/15 text-[#FFB347]">
                    90% Goal Completion
                  </span>
                  <span className="text-[10px] text-[#FFB347]">High Momentum</span>
                </div>
                <p className="text-xs text-[#F6F5F8] leading-relaxed">
                  {episode.branch_previews?.branch_90?.narrative ||
                    "Delivers a compelling presentation that earns leadership praise and early partner interest."}
                </p>
                <p className="text-[11px] text-[#FFB347] font-semibold pt-1">
                  Reward: +80 XP, Partner Inquiry Unlocked
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#14151D] border border-[#393B4B] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF6B6B]/15 text-[#FF6B6B]">
                    100% Goal Completion
                  </span>
                  <span className="text-[10px] text-[#FF6B6B]">Mastery</span>
                </div>
                <p className="text-xs text-[#F6F5F8] leading-relaxed">
                  {episode.branch_previews?.branch_100?.narrative ||
                    "Executes all planned deliverables flawlessly, earning a surprise invitation from an institutional backer."}
                </p>
                <p className="text-[11px] text-[#FF6B6B] font-semibold pt-1">
                  Reward: +120 XP, Legendary Streak Multiplier
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
