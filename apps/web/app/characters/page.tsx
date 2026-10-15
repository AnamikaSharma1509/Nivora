"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Sparkles,
  Plus,
  Edit3,
  Check,
  Eye,
  Briefcase,
  Globe,
  Sliders,
  ChevronRight,
  UserCheck,
  Target,
  Trash2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Palette,
  Lightbulb
} from "lucide-react";
import { api, AvatarItem, getStoredToken } from "@/lib/api";
import HumanAvatar from "@/components/HumanAvatar";
import AvatarSelectorModal from "@/components/AvatarSelectorModal";
import TraitAdoptionModal from "@/components/TraitAdoptionModal";

const CATEGORIES = [
  "All",
  "Technology and AI",
  "Entrepreneurship",
  "Business and corporate",
  "Science and research",
  "Healthcare and medicine",
  "Arts and creative",
  "Sports and fitness",
  "Leadership and public service",
  "Analytical thinking",
];

const PRACTICAL_ACTIONS: Record<string, string> = {
  analytical: "Compare two alternative architectural solutions and document your trade-off matrix before committing.",
  unflappable: "When an unexpected bug or blocker emerges, pause 60 seconds and log three deterministic next steps.",
  tactical: "Break today's primary objective into 45-minute sprint blocks with explicit definition of done.",
  resourceful: "Attempt to solve a problem using existing native tooling before importing external dependencies.",
  curious: "Read the foundational source code or RFC behind an API you use routinely.",
  resilient: "Treat a failed task or broken streak as telemetry: add a recovery checkpoint for tomorrow.",
  visionary: "Write a 3-sentence summary of what your goal delivers 12 months after successful completion.",
  strategic: "Identify the single highest-leverage task today and complete it before checking notifications.",
  disciplined: "Execute your morning deep-work session at the exact scheduled hour without negotiation.",
  empathetic: "Ask clarifying questions to uncover the underlying needs behind a stakeholder's feedback.",
  creative: "Synthesize ideas from an unrelated industry to solve a persistent friction in your workflow.",
  competitive: "Benchmark your daily throughput against the highest industry standard and refine your latency.",
};

export default function CharactersPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  // Authenticated User Identity State
  const [myIdentity, setMyIdentity] = useState<AvatarItem | null>(null);
  const [loadingIdentity, setLoadingIdentity] = useState(true);

  // Public / Template Characters State
  const [avatars, setAvatars] = useState<AvatarItem[]>([]);
  const [loadingAvatars, setLoadingAvatars] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedNationality, setSelectedNationality] = useState("All");

  // Modals State
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isTraitModalOpen, setIsTraitModalOpen] = useState(false);
  const [selectedCharForAdoption, setSelectedCharForAdoption] = useState<AvatarItem | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<AvatarItem | null>(null);

  // Edit Identity Inline Form State
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: "",
    career: "",
    description: "",
    genre_preferences: ["Corporate Drama"],
    personality_traits: [] as string[],
  });
  const [savingIdentity, setSavingIdentity] = useState(false);

  useEffect(() => {
    const t = getStoredToken();
    setToken(t);
    if (t) {
      loadMyIdentity();
    } else {
      setLoadingIdentity(false);
    }
    loadAvatars();
  }, [selectedCategory, selectedNationality]);

  const loadMyIdentity = async () => {
    try {
      setLoadingIdentity(true);
      const identity = await api.getMyIdentity();
      setMyIdentity(identity);
      setEditForm({
        display_name: identity.display_name || identity.name,
        career: identity.career || identity.archetype || "",
        description: identity.description || "",
        genre_preferences: identity.genre_preferences || ["Corporate Drama"],
        personality_traits: identity.personality_traits || [],
      });
    } catch (err) {
      console.error("Failed to load user identity", err);
    } finally {
      setLoadingIdentity(false);
    }
  };

  const loadAvatars = async () => {
    try {
      setLoadingAvatars(true);
      const data = await api.getAvatars({
        category: selectedCategory,
        nationality: selectedNationality,
      });
      setAvatars(data);
    } catch (err) {
      console.error("Failed to load character library", err);
    } finally {
      setLoadingAvatars(false);
    }
  };

  const handleSaveIdentity = async () => {
    try {
      setSavingIdentity(true);
      const updated = await api.updateMyIdentity(editForm);
      setMyIdentity(updated);
      setIsEditingIdentity(false);
    } catch (err) {
      console.error("Failed to save identity changes", err);
    } finally {
      setSavingIdentity(false);
    }
  };

  const handleRemoveAspirationalTrait = async (trait: string) => {
    try {
      const res = await api.removeAspirationalTrait(trait);
      setMyIdentity((prev) => (prev ? { ...prev, aspirational_traits: res.aspirational_traits } : prev));
    } catch (err) {
      console.error("Failed to remove trait", err);
    }
  };

  const handleOpenTraitAdoption = (char: AvatarItem) => {
    if (!token) {
      router.push("/login");
      return;
    }
    setSelectedCharForAdoption(char);
    setIsTraitModalOpen(true);
  };

  const filteredAvatars = avatars.filter((av) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      av.name.toLowerCase().includes(q) ||
      (av.career && av.career.toLowerCase().includes(q)) ||
      av.archetype.toLowerCase().includes(q) ||
      av.description.toLowerCase().includes(q) ||
      (av.personality_traits && av.personality_traits.some((t) => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#393B4B] pb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#A8E6CF]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#A8E6CF]">
              Protagonist Architecture
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#F6F5F8]">
            Character & Identity
          </h1>
          <p className="text-[#B9BBC7] text-sm mt-1 max-w-2xl">
            You are always the protagonist of your journey. Customize your personal visual avatar, review active traits, and adopt aspirational virtues from other innovators.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          {token && (
            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-[#14151D] text-xs font-bold shadow-md transition-all"
            >
              <Palette className="w-4 h-4" />
              <span>Change Avatar</span>
            </button>
          )}
          <Link
            href="/explore-other-lives"
            className="px-4 py-2.5 rounded-xl bg-[#252735] hover:bg-[#1D1F2B] border border-[#393B4B] text-[#B9BBC7] hover:text-white text-xs font-semibold transition-all"
          >
            Explore Other Lives
          </Link>
        </div>
      </div>

      {/* SECTION 1 & 2: AUTHENTICATED USER'S OWN IDENTITY (FIRST-CLASS) */}
      {token && myIdentity && (
        <div className="space-y-8">
          {/* Section 1: My Character */}
          <section className="glass-panel rounded-3xl p-6 md:p-8 border border-[#393B4B] space-y-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#393B4B]/60 pb-5">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-[#A8E6CF]" />
                <h2 className="text-xl font-bold text-[#F6F5F8]">My Character (Protagonist)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#A8E6CF]/15 text-[#A8E6CF] border border-[#A8E6CF]/30">
                  Active Persona
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#252735] hover:bg-[#1D1F2B] border border-[#393B4B] text-xs font-semibold text-[#F6F5F8] flex items-center space-x-1.5 transition-colors"
                >
                  <Palette className="w-3.5 h-3.5 text-[#A8E6CF]" />
                  <span>Change Avatar</span>
                </button>
                <button
                  onClick={() => setIsEditingIdentity(!isEditingIdentity)}
                  className="px-3 py-1.5 rounded-xl bg-[#252735] hover:bg-[#1D1F2B] border border-[#393B4B] text-xs font-semibold text-[#F6F5F8] flex items-center space-x-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#A8E6CF]" />
                  <span>{isEditingIdentity ? "Cancel Editing" : "Edit Your Character"}</span>
                </button>
              </div>
            </div>

            {/* Profile Overview */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="shrink-0">
                <HumanAvatar
                  options={myIdentity.avatar_options}
                  imageUrl={myIdentity.image_url}
                  name={myIdentity.display_name || myIdentity.name}
                  size="xl"
                  className="border-2 border-[#A8E6CF]/40 shadow-xl"
                />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-[#F6F5F8]">
                    {myIdentity.display_name || myIdentity.name}
                  </h3>
                  <p className="text-sm font-semibold text-[#A8E6CF] mt-0.5">
                    {myIdentity.career || myIdentity.archetype || "Career Protagonist"}
                  </p>
                  <p className="text-xs text-[#B9BBC7] mt-2 leading-relaxed max-w-3xl">
                    {myIdentity.description || "Building toward your long-term ambitions through daily disciplined execution."}
                  </p>
                </div>

                {/* Current Personality Traits */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#B9BBC7]">
                    Current Attributes (Present Day)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {myIdentity.personality_traits && myIdentity.personality_traits.length > 0 ? (
                      myIdentity.personality_traits.map((trait) => (
                        <span
                          key={trait}
                          className="px-3 py-1 rounded-xl text-xs font-medium bg-[#14151D] text-[#F6F5F8] border border-[#393B4B]"
                        >
                          {trait}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#B9BBC7]">No current traits configured yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Inline Identity Editor */}
            {isEditingIdentity && (
              <div className="pt-6 border-t border-[#393B4B] space-y-4 bg-[#14151D]/60 p-6 rounded-2xl">
                <h4 className="text-sm font-bold text-[#F6F5F8]">Edit Persona Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[#B9BBC7]">Display Name</label>
                    <input
                      type="text"
                      value={editForm.display_name}
                      onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#14151D] border border-[#393B4B] rounded-xl text-xs text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#B9BBC7]">Role / Career Target</label>
                    <input
                      type="text"
                      value={editForm.career}
                      onChange={(e) => setEditForm({ ...editForm, career: e.target.value })}
                      className="w-full px-3 py-2 bg-[#14151D] border border-[#393B4B] rounded-xl text-xs text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#B9BBC7]">Biography & Purpose</label>
                  <textarea
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-[#14151D] border border-[#393B4B] rounded-xl text-xs text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={() => setIsEditingIdentity(false)}
                    className="px-4 py-2 rounded-xl bg-[#252735] text-xs font-semibold text-[#F6F5F8]"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={savingIdentity}
                    onClick={handleSaveIdentity}
                    className="px-5 py-2 rounded-xl bg-[#A8E6CF] text-[#14151D] text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {savingIdentity ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Section 2: My Aspirational Traits */}
          <section className="glass-panel rounded-3xl p-6 md:p-8 border border-[#393B4B] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#393B4B]/60 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8E6CF]">
                  Character Development
                </span>
                <h3 className="text-xl font-bold text-[#F6F5F8]">My Aspirational Traits</h3>
                <p className="text-xs text-[#B9BBC7] mt-0.5">
                  Attributes you admire and are actively developing through daily tasks and deliberate practice.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#A8E6CF]/10 text-[#A8E6CF] border border-[#A8E6CF]/30 self-start sm:self-auto">
                {myIdentity.aspirational_traits?.length || 0} Traits in Progress
              </span>
            </div>

            {myIdentity.aspirational_traits && myIdentity.aspirational_traits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myIdentity.aspirational_traits.map((trait) => {
                  const actionSuggestion = PRACTICAL_ACTIONS[trait.toLowerCase()] || "Integrate deliberate practice of this trait into your daily task plan.";
                  return (
                    <div
                      key={trait}
                      className="p-5 rounded-2xl bg-[#14151D] border border-[#393B4B] flex flex-col justify-between space-y-3 group hover:border-[#A8E6CF]/50 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#A8E6CF]/15 text-[#A8E6CF]">
                            Aspirational
                          </span>
                          <button
                            onClick={() => handleRemoveAspirationalTrait(trait)}
                            className="text-[#B9BBC7] hover:text-[#FF6B6B] transition-colors p-1"
                            title="Remove from aspirational traits"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="text-base font-bold text-[#F6F5F8] capitalize">{trait}</h4>
                        <div className="pt-2 border-t border-[#393B4B]/60 space-y-1">
                          <span className="text-[10px] text-[#A8E6CF] uppercase font-bold flex items-center space-x-1">
                            <Lightbulb className="w-3 h-3" />
                            <span>Recommended Micro-Action:</span>
                          </span>
                          <p className="text-xs text-[#B9BBC7] leading-relaxed">
                            {actionSuggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#14151D] border border-[#393B4B] text-center space-y-3">
                <BookOpen className="w-8 h-8 text-[#B9BBC7]/40 mx-auto" />
                <h4 className="text-sm font-bold text-[#F6F5F8]">No Aspirational Traits Adopted Yet</h4>
                <p className="text-xs text-[#B9BBC7] max-w-md mx-auto">
                  Browse predefined innovators below (like Elena Rostova, Cary, or Meera). When you discover virtues you admire, click <strong>"Add Traits to My Character"</strong> to add them without replacing your persona.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Unauthenticated Visitor Welcome Banner */}
      {!token && (
        <div className="p-6 rounded-3xl bg-[#252735]/80 border border-[#A8E6CF]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-[#F6F5F8]">Create Your Personal Protagonist</h3>
            <p className="text-xs text-[#B9BBC7]">
              Sign in to Nivora to customize your own human avatar, manage personal traits, and track your goal roadmap.
            </p>
          </div>
          <div className="flex space-x-3 shrink-0">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-[#20232E] border border-[#393B4B] text-xs font-bold text-[#F6F5F8]"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 rounded-xl bg-[#A8E6CF] text-[#14151D] text-xs font-bold"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {/* SECTION 4: DISCOVER OTHER CHARACTERS & SEARCH */}
      <section className="space-y-6">
        <div className="border-b border-[#393B4B] pb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8E6CF]">
            Inspirational Character Library
          </span>
          <h3 className="text-2xl font-bold text-[#F6F5F8]">Discover Other Characters</h3>
          <p className="text-xs text-[#B9BBC7] mt-1">
            Explore diverse innovators, executives, and pioneers. Select any character to preview their archetype or adopt specific traits into your own personal development plan.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="glass-panel rounded-2xl p-4 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B9BBC7]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name (e.g. Elena Rostova), career, skills, or traits..."
                className="w-full pl-10 pr-4 py-2 bg-[#14151D] border border-[#393B4B] rounded-xl text-sm text-[#F6F5F8] placeholder-[#B9BBC7]/50 focus:outline-none focus:border-[#A8E6CF]"
              />
            </div>

            {/* Nationality Filter */}
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-[#A8E6CF]" />
              <select
                value={selectedNationality}
                onChange={(e) => setSelectedNationality(e.target.value)}
                className="bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
              >
                <option value="All">All Backgrounds</option>
                <option value="Indian">Indian Protagonists</option>
                <option value="International">International Protagonists</option>
              </select>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#393B4B]/50">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-[#A8E6CF] text-[#14151D] shadow-sm"
                      : "bg-[#14151D] text-[#B9BBC7] border border-[#393B4B] hover:text-white hover:border-white/30"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Character Cards Grid */}
        {loadingAvatars ? (
          <div className="py-24 text-center text-[#B9BBC7]">Loading character library...</div>
        ) : filteredAvatars.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <p className="text-base text-[#F6F5F8] font-semibold">No character identities found.</p>
            <p className="text-xs text-[#B9BBC7]">Try resetting filters or searching for terms like "AI" or "Founder".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAvatars.map((avatar) => (
              <div
                key={avatar.id}
                className="glass-panel rounded-2xl p-5 flex flex-col justify-between border border-[#393B4B] hover:border-[#A8E6CF]/60 hover:shadow-xl transition-all group"
              >
                <div className="space-y-4">
                  {/* Top row: Avatar & Career */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-[#14151D] border border-[#393B4B] overflow-hidden flex items-center justify-center shrink-0">
                        {avatar.image_url ? (
                          <img
                            src={avatar.image_url}
                            alt={avatar.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : null}
                        <span className="text-base font-bold text-[#A8E6CF]">
                          {avatar.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#F6F5F8] group-hover:text-[#A8E6CF] transition-colors">
                          {avatar.display_name || avatar.name}
                        </h4>
                        <p className="text-xs text-[#A8E6CF] font-medium">
                          {avatar.career || avatar.archetype}
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#14151D] text-[#B9BBC7] border border-[#393B4B]">
                      {avatar.nationality || "International"}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-[#B9BBC7] line-clamp-3 leading-relaxed">
                    {avatar.description}
                  </p>

                  {/* Personality Traits */}
                  {avatar.personality_traits && avatar.personality_traits.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-semibold text-[#B9BBC7] uppercase">Signature Traits:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {avatar.personality_traits.map((trait) => (
                          <span
                            key={trait}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#14151D] text-[#F6F5F8] border border-[#393B4B]"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions: Add Traits to My Character */}
                <div className="pt-5 mt-4 border-t border-[#393B4B] flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewAvatar(avatar)}
                    className="px-3 py-2 rounded-xl bg-[#14151D] hover:bg-white/5 border border-[#393B4B] text-xs font-semibold text-[#B9BBC7] hover:text-white transition-colors"
                  >
                    Preview
                  </button>

                  <button
                    onClick={() => handleOpenTraitAdoption(avatar)}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-[#14151D] text-xs font-bold transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Traits to My Character</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Human Avatar Selector Modal */}
      {isAvatarModalOpen && (
        <AvatarSelectorModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          currentOptions={myIdentity?.avatar_options}
          currentImageUrl={myIdentity?.image_url}
          userName={myIdentity?.display_name || myIdentity?.name}
          onAvatarSaved={(updated) => {
            setMyIdentity(updated);
            setIsAvatarModalOpen(false);
          }}
        />
      )}

      {/* Trait Adoption Modal */}
      {isTraitModalOpen && selectedCharForAdoption && (
        <TraitAdoptionModal
          isOpen={isTraitModalOpen}
          onClose={() => setIsTraitModalOpen(false)}
          character={selectedCharForAdoption}
          currentUserTraits={myIdentity?.personality_traits || []}
          currentAspirationalTraits={myIdentity?.aspirational_traits || []}
          onTraitsAdopted={(newTraits) => {
            setMyIdentity((prev) => prev ? { ...prev, aspirational_traits: newTraits } : prev);
            setIsTraitModalOpen(false);
          }}
        />
      )}

      {/* Preview Profile Modal */}
      {previewAvatar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl glass-panel rounded-2xl border border-[#393B4B] p-6 space-y-5">
            <button
              onClick={() => setPreviewAvatar(null)}
              className="absolute top-4 right-4 p-2 text-[#B9BBC7] hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-[#14151D] border border-[#393B4B] flex items-center justify-center text-2xl font-bold text-[#A8E6CF]">
                {previewAvatar.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#F6F5F8]">
                  {previewAvatar.display_name || previewAvatar.name}
                </h3>
                <p className="text-xs text-[#A8E6CF] font-medium">
                  {previewAvatar.career || previewAvatar.archetype} • {previewAvatar.category}
                </p>
                <p className="text-[11px] text-[#B9BBC7]">{previewAvatar.nationality}</p>
              </div>
            </div>

            <p className="text-sm text-[#F6F5F8] leading-relaxed">
              {previewAvatar.description}
            </p>

            <div className="space-y-2 text-xs">
              {previewAvatar.strengths && previewAvatar.strengths.length > 0 && (
                <p>
                  <strong className="text-[#A8E6CF]">Strengths:</strong> {previewAvatar.strengths.join(", ")}
                </p>
              )}
              {previewAvatar.personality_traits && previewAvatar.personality_traits.length > 0 && (
                <p>
                  <strong className="text-white">Personality Traits:</strong> {previewAvatar.personality_traits.join(", ")}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-[#393B4B] flex justify-end space-x-3">
              <button
                onClick={() => setPreviewAvatar(null)}
                className="px-4 py-2 rounded-xl bg-[#252735] hover:bg-[#1D1F2B] border border-[#393B4B] text-xs font-semibold text-[#F6F5F8]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const av = previewAvatar;
                  setPreviewAvatar(null);
                  handleOpenTraitAdoption(av);
                }}
                className="px-5 py-2 rounded-xl bg-[#A8E6CF] text-[#14151D] text-xs font-bold"
              >
                Add Traits to My Character
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
