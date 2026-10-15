"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Film, Play, Sparkles, Clock, Calendar, RefreshCw, Compass } from "lucide-react";
import { api, EpisodeItem, SeriesItem, getStoredToken } from "@/lib/api";

function EpisodesContent() {
  const router = useRouter();
  const [episodes, setEpisodes] = useState<EpisodeItem[]>([]);
  const [activeSeries, setActiveSeries] = useState<SeriesItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    try {
      setLoading(true);
      const token = getStoredToken();
      if (!token) {
        setIsAuthenticated(false);
        setEpisodes([]);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);

      // Fetch user's active series title
      try {
        const seriesData = await api.getActiveSeries();
        setActiveSeries(seriesData);
      } catch (e) {
        console.warn("No active series found", e);
      }

      // Fetch user-owned episodes only
      const userEps = await api.getEpisodes();
      setEpisodes(userEps || []);
    } catch (err) {
      console.error("Error loading user episodes", err);
      setEpisodes([]);
    } finally {
      setLoading(false);
    }
  };

  const seriesTitle = activeSeries?.title || "My Journey";

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#393B4B]">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Film className="w-5 h-5 text-[#F2D15C]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#F2D15C]">
              Personal Streaming Vault
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#F6F5F8]">{seriesTitle}</h1>
          <p className="text-xs sm:text-sm text-[#858B98] mt-1">
            Your personalized cinematic episodes and screenplays generated from real daily task executions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/explore-other-lives"
            className="px-3.5 py-2 rounded-xl bg-[#20232E] border border-[#393B4B] hover:border-[#F2D15C] text-xs font-bold text-[#858B98] hover:text-[#F6F5F8] transition-all flex items-center space-x-2"
          >
            <Compass className="w-4 h-4 text-[#F2D15C]" />
            <span>Explore Other Lives</span>
          </Link>

          <Link
            href="/today"
            className="px-4 py-2 rounded-xl bg-[#F2D15C] hover:bg-[#ffe17d] text-[#14151D] text-xs font-black transition-all shadow-md"
          >
            Today's Plan
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#F2D15C] animate-spin mx-auto" />
          <p className="text-sm text-[#858B98]">Loading your personalized episodes...</p>
        </div>
      ) : !isAuthenticated ? (
        <div className="py-20 text-center space-y-5 glass-panel rounded-2xl border border-[#393B4B] p-8 max-w-xl mx-auto">
          <Film className="w-12 h-12 text-[#F2D15C] mx-auto opacity-80" />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#F6F5F8]">Sign in to View Your Story</h2>
            <p className="text-xs text-[#858B98] leading-relaxed">
              Every day you execute tasks toward your destination goal, Nivora generates an episodic screenplay and motion video dedicated to your journey.
            </p>
          </div>
          <div className="flex items-center justify-center space-x-3 pt-2">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-[#F2D15C] text-[#14151D] text-xs font-black hover:bg-[#ffe17d] transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/explore-other-lives"
              className="px-5 py-2.5 rounded-xl bg-[#20232E] border border-[#393B4B] text-xs font-bold text-[#858B98] hover:text-white transition-all"
            >
              Explore Sample Stories
            </Link>
          </div>
        </div>
      ) : episodes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {episodes.map((ep) => (
            <div
              key={ep.id}
              className="glass-panel rounded-2xl overflow-hidden border border-[#393B4B] hover:border-[#F2D15C]/60 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Media Card Preview */}
              <div
                onClick={() => router.push(`/episodes/${ep.id}`)}
                className="relative aspect-video bg-[#14151D] cursor-pointer overflow-hidden flex items-center justify-center"
              >
                {ep.thumbnail_url ? (
                  <img
                    src={ep.thumbnail_url}
                    alt={ep.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#14151D] via-[#20232E] to-[#14151D] p-4 text-center">
                    <Film className="w-8 h-8 text-[#F2D15C]/60 mb-2" />
                    <span className="text-[10px] text-[#858B98] font-mono">Personal Screenplay</span>
                  </div>
                )}

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[#14151D]/80 group-hover:bg-[#F2D15C] text-[#F2D15C] group-hover:text-[#14151D] border border-[#F2D15C]/40 flex items-center justify-center transition-all group-hover:scale-110 shadow-lg">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>

                {/* Top Badge */}
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#14151D]/90 text-[#F2D15C] border border-[#F2D15C]/40 backdrop-blur-md">
                    Episode {ep.episode_number}
                  </span>
                </div>

                <div className="absolute bottom-3 right-3 text-[10px] font-mono font-bold bg-black/80 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                  {ep.duration_seconds ? `${Math.round(ep.duration_seconds)}s` : "Preview"}
                </div>
              </div>

              {/* Text Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3
                    onClick={() => router.push(`/episodes/${ep.id}`)}
                    className="text-base font-bold text-[#F6F5F8] group-hover:text-[#F2D15C] cursor-pointer transition-colors line-clamp-1"
                  >
                    {ep.title}
                  </h3>
                  <p className="text-xs text-[#858B98] line-clamp-2 leading-relaxed">
                    {ep.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#393B4B] flex items-center justify-between text-xs">
                  <button
                    onClick={() => router.push(`/episodes/${ep.id}`)}
                    className="text-xs font-bold text-[#F2D15C] hover:underline flex items-center space-x-1"
                  >
                    <span>Open Episode Studio</span>
                    <span>→</span>
                  </button>

                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#20232E] text-[#A8E6CF] border border-[#393B4B]">
                    {ep.generation_status === "completed" ? "Verified Video" : "Preview Mode"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-24 text-center space-y-4 glass-panel rounded-2xl border border-[#393B4B] p-8 max-w-md mx-auto">
          <Film className="w-12 h-12 text-[#F2D15C] mx-auto opacity-70" />
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#F6F5F8]">Your story starts with today's tasks.</h3>
            <p className="text-xs text-[#858B98] leading-relaxed">
              Complete your daily tasks to unlock your very first cinematic episode and see your progress come alive.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/today"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#F2D15C] text-[#14151D] text-xs font-black hover:bg-[#ffe17d] transition-all shadow-md"
            >
              Plan Today's Tasks
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EpisodesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-[#858B98]">
          Loading episodes...
        </div>
      }
    >
      <EpisodesContent />
    </Suspense>
  );
}
