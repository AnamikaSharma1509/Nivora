"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Briefcase,
  Smile,
  Palette,
  Film,
  Sliders,
  CheckCircle2
} from "lucide-react";
import { api, AvatarItem } from "../lib/api";

interface IdentityBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIdentityCreated: (newAvatar: AvatarItem) => void;
  initialData?: Partial<AvatarItem>;
}

const CAREER_OPTIONS = [
  "Software Engineer",
  "AI Engineer",
  "Technology Entrepreneur",
  "Startup Founder & CEO",
  "Medical Doctor / Resident",
  "Product Designer",
  "Creative Director",
  "Decathlete / Athlete",
  "Filmmaker & Director",
  "Theoretical Physicist",
  "Civil Services Aspirant",
  "Corporate Strategy VP",
  "Robotics Engineer",
  "Financial Analyst",
  "Architect & Spatial Designer",
  "Classical & Indie Musician",
  "Constitutional Lawyer",
  "Culinary Chef & Founder",
  "Investigative Journalist",
  "Biomedical Scientist",
  "Freelance Creator",
  "University Researcher",
];

const PERSONALITY_TRAIT_OPTIONS = [
  "Ambitious",
  "Analytical",
  "Curious",
  "Disciplined",
  "Creative",
  "Empathetic",
  "Resilient",
  "Charismatic",
  "Introverted",
  "Extroverted",
  "Calm",
  "Playful",
  "Competitive",
  "Reflective",
  "Adventurous",
  "Methodical",
  "Visionary",
  "Tenacious",
];

const GENRE_OPTIONS = [
  { id: "Corporate Drama", label: "Corporate Drama" },
  { id: "Technology Drama", label: "Technology & AI Drama" },
  { id: "Inspirational", label: "Inspirational & Biography" },
  { id: "Slice of Life", label: "Slice of Life & Personal Growth" },
  { id: "Romantic Comedy", label: "Romantic Comedy" },
  { id: "Sports Drama", label: "Sports Drama" },
  { id: "Thriller", label: "Thriller & Suspense" },
  { id: "Science Fiction", label: "Science Fiction" },
  { id: "Creative Drama", label: "Creative & Arts Drama" },
];

export default function IdentityBuilderModal({
  isOpen,
  onClose,
  onIdentityCreated,
  initialData,
}: IdentityBuilderModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(initialData?.name || "");
  const [displayName, setDisplayName] = useState(initialData?.display_name || "");
  const [career, setCareer] = useState(initialData?.career || "Technology Entrepreneur");
  const [customCareer, setCustomCareer] = useState("");
  const [category, setCategory] = useState(initialData?.category || "Technology and AI");
  const [nationality, setNationality] = useState(initialData?.nationality || "Indian");
  const [preferredLanguage, setPreferredLanguage] = useState(initialData?.preferred_language || "English");
  const [ageRange, setAgeRange] = useState(initialData?.age_range || "25-32");
  const [description, setDescription] = useState(initialData?.description || "");

  // Personality
  const [selectedTraits, setSelectedTraits] = useState<string[]>(initialData?.personality_traits || ["Ambitious", "Curious"]);
  const [strengths, setStrengths] = useState<string>(initialData?.strengths?.join(", ") || "Deep focus, Creative problem solving");
  const [weaknesses, setWeaknesses] = useState<string>(initialData?.weaknesses?.join(", ") || "Perfectionism, Over-committing");
  const [motivations, setMotivations] = useState<string>(initialData?.motivations?.join(", ") || "Building tools that elevate human potential");

  // Appearance
  const [visualStyle, setVisualStyle] = useState(initialData?.visual_style || "Cinematic Photorealistic");
  const [clothingStyle, setClothingStyle] = useState("Modern tailored smart-casual");
  const [settingStyle, setSettingStyle] = useState("Vibrant high-tech studio with natural daylight");

  // Genre & Tone
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialData?.genre_preferences || ["Technology Drama"]);
  const [humorLevel, setHumorLevel] = useState("Balanced");
  const [emotionalIntensity, setEmotionalIntensity] = useState("High");
  const [pacing, setPacing] = useState("Fast-paced");

  if (!isOpen) return null;

  const toggleTrait = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter((t) => t !== trait));
    } else {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  const toggleGenre = (genreId: string) => {
    if (selectedGenres.includes(genreId)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genreId));
      }
    } else {
      setSelectedGenres([...selectedGenres, genreId]);
    }
  };

  const handleSaveIdentity = async () => {
    try {
      setSaving(true);
      setError(null);

      const finalCareer = customCareer.trim() ? customCareer.trim() : career;
      const payload = {
        name: name.trim() || "Alex Mercer",
        display_name: displayName.trim() || name.trim() || "Alex",
        archetype: finalCareer,
        career: finalCareer,
        category: category,
        nationality: nationality,
        preferred_language: preferredLanguage,
        age_range: ageRange,
        description: description.trim() || `An ambitious ${finalCareer} striving towards major milestones.`,
        personality_traits: selectedTraits,
        strengths: strengths.split(",").map((s) => s.trim()).filter(Boolean),
        weaknesses: weaknesses.split(",").map((s) => s.trim()).filter(Boolean),
        motivations: motivations.split(",").map((s) => s.trim()).filter(Boolean),
        visual_style: visualStyle,
        visual_prompt_attributes: `${name}, ${finalCareer}, ${clothingStyle}, ${settingStyle}, ${visualStyle}`,
        image_url: initialData?.image_url || "/avatars/cary.png",
        genre_preferences: selectedGenres,
        story_preferences: {
          humor_level: humorLevel,
          emotional_intensity: emotionalIntensity,
          pacing: pacing,
        },
      };

      let result: AvatarItem;
      if (initialData?.id && initialData.is_custom) {
        result = await api.updateAvatar(initialData.id, payload);
      } else {
        result = await api.createCustomAvatar(payload);
      }

      onIdentityCreated(result);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save identity");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel rounded-2xl border border-[#393B4B] shadow-2xl p-6 md:p-8 space-y-6 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-[#B9BBC7] hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#A8E6CF]/15 border border-[#A8E6CF]/30 flex items-center justify-center text-[#A8E6CF]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#F6F5F8]">Custom Identity Builder</h2>
            <p className="text-xs text-[#B9BBC7]">
              Step {currentStep} of 7 •{" "}
              {currentStep === 1 && "Identity Basics"}
              {currentStep === 2 && "Career & Ambitions"}
              {currentStep === 3 && "Personality & Strengths"}
              {currentStep === 4 && "Visual Appearance"}
              {currentStep === 5 && "Genre & Narrative Tone"}
              {currentStep === 6 && "Story Preferences"}
              {currentStep === 7 && "Preview & Save"}
            </p>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-7 gap-1.5 py-1">
          {[1, 2, 3, 4, 5, 6, 7].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all ${
                step === currentStep
                  ? "bg-[#A8E6CF]"
                  : step < currentStep
                  ? "bg-[#A8E6CF]/40"
                  : "bg-[#252735]"
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#FF6B6B]/15 border border-[#FF6B6B]/30 text-xs text-[#FF6B6B]">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="space-y-4 min-h-[300px]">
          {/* STEP 1: BASICS */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#B9BBC7]">Character Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Rohan, Maya, Liam"
                    className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#B9BBC7]">Display Full Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g., Rohan Verma"
                    className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#B9BBC7]">Cultural Context</label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                  >
                    <option value="Indian">Indian</option>
                    <option value="International">International</option>
                    <option value="South Asian">South Asian</option>
                    <option value="East Asian">East Asian</option>
                    <option value="European">European</option>
                    <option value="American">American</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#B9BBC7]">Age Range</label>
                  <input
                    type="text"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    placeholder="24-30"
                    className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#B9BBC7]">Preferred Language</label>
                  <input
                    type="text"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    placeholder="English & Hindi"
                    className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#B9BBC7]">Short Biography & Vision</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your character's background, current struggles, and overarching aspirations..."
                  rows={3}
                  className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl p-3 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                />
              </div>
            </div>
          )}

          {/* STEP 2: CAREER */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#B9BBC7]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                >
                  <option value="Technology and AI">Technology and AI</option>
                  <option value="Business and entrepreneurship">Business & Entrepreneurship</option>
                  <option value="Corporate careers">Corporate Careers</option>
                  <option value="Science and research">Science & Research</option>
                  <option value="Medicine and healthcare">Medicine & Healthcare</option>
                  <option value="Arts and entertainment">Arts & Entertainment</option>
                  <option value="Sports and fitness">Sports & Fitness</option>
                  <option value="Law and public service">Law & Public Service</option>
                  <option value="Creative professions">Creative Professions</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#B9BBC7]">Select Profession</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto pr-1">
                  {CAREER_OPTIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCareer(c);
                        setCustomCareer("");
                      }}
                      className={`p-2.5 rounded-xl text-left text-xs font-medium border transition-all ${
                        career === c && !customCareer
                          ? "bg-[#A8E6CF]/15 text-[#A8E6CF] border-[#A8E6CF]"
                          : "bg-[#14151D] text-[#B9BBC7] border-[#393B4B] hover:border-white/30"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#B9BBC7]">Or Enter Custom Profession</label>
                <input
                  type="text"
                  value={customCareer}
                  onChange={(e) => setCustomCareer(e.target.value)}
                  placeholder="e.g., Quantum Algorithm Engineer, Renewable Grid Architect"
                  className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: PERSONALITY */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#B9BBC7]">Select Personality Traits (Multi-select)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PERSONALITY_TRAIT_OPTIONS.map((trait) => {
                    const active = selectedTraits.includes(trait);
                    return (
                      <button
                        key={trait}
                        type="button"
                        onClick={() => toggleTrait(trait)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          active
                            ? "bg-[#A8E6CF] text-[#14151D] border-[#A8E6CF]"
                            : "bg-[#14151D] text-[#B9BBC7] border-[#393B4B] hover:text-white"
                        }`}
                      >
                        {trait}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#B9BBC7]">Core Strengths</label>
                <input
                  type="text"
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="e.g., Deep focus, Strategic resilience, Clear communication"
                  className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#B9BBC7]">Weaknesses / Growing Edges</label>
                <input
                  type="text"
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="e.g., Perfectionism, Impatience with legacy systems"
                  className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#B9BBC7]">Primary Motivations</label>
                <input
                  type="text"
                  value={motivations}
                  onChange={(e) => setMotivations(e.target.value)}
                  placeholder="e.g., Scaling sustainable technology, Empowering rural communities"
                  className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: APPEARANCE */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#B9BBC7]">Visual Art Style</label>
                <select
                  value={visualStyle}
                  onChange={(e) => setVisualStyle(e.target.value)}
                  className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                >
                  <option value="Cinematic Photorealistic">Cinematic Photorealistic</option>
                  <option value="Anime Inspired Graphic">Anime Inspired Graphic</option>
                  <option value="Film Grain Noir">Film Grain Noir</option>
                  <option value="Warm Editorial Portrait">Warm Editorial Portrait</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#B9BBC7]">Clothing & Wardrobe Aesthetic</label>
                <input
                  type="text"
                  value={clothingStyle}
                  onChange={(e) => setClothingStyle(e.target.value)}
                  placeholder="e.g., Tailored navy blazer, casual linen shirt, athletic performance gear"
                  className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#B9BBC7]">Atmospheric Setting / Environment</label>
                <input
                  type="text"
                  value={settingStyle}
                  onChange={(e) => setSettingStyle(e.target.value)}
                  placeholder="e.g., Modern high-rise studio, quiet hospital hallway at night, dawn athletic track"
                  className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                />
              </div>
            </div>
          )}

          {/* STEP 5: GENRE & TONE */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-[#B9BBC7]">Select Compatible Genres</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GENRE_OPTIONS.map((g) => {
                  const active = selectedGenres.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGenre(g.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        active
                          ? "bg-[#A8E6CF]/15 text-[#A8E6CF] border-[#A8E6CF] font-semibold"
                          : "bg-[#14151D] text-[#B9BBC7] border-[#393B4B] hover:border-white/30"
                      }`}
                    >
                      <Film className="w-4 h-4 mb-2 text-[#FF6B6B]" />
                      <p className="text-xs">{g.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: STORY PREFERENCES */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#B9BBC7]">Humour Level</label>
                  <select
                    value={humorLevel}
                    onChange={(e) => setHumorLevel(e.target.value)}
                    className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                  >
                    <option value="Subtle">Subtle</option>
                    <option value="Balanced">Balanced</option>
                    <option value="Witty & Playful">Witty & Playful</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#B9BBC7]">Emotional Intensity</label>
                  <select
                    value={emotionalIntensity}
                    onChange={(e) => setEmotionalIntensity(e.target.value)}
                    className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                  >
                    <option value="Grounded">Grounded</option>
                    <option value="High">High</option>
                    <option value="Dramatic">Dramatic</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#B9BBC7]">Story Pacing</label>
                  <select
                    value={pacing}
                    onChange={(e) => setPacing(e.target.value)}
                    className="w-full mt-1 bg-[#14151D] border border-[#393B4B] rounded-xl px-3 py-2 text-sm text-[#F6F5F8] focus:outline-none focus:border-[#A8E6CF]"
                  >
                    <option value="Fast-paced">Fast-paced</option>
                    <option value="Balanced">Balanced</option>
                    <option value="Introspective">Introspective</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#14151D] border border-[#393B4B] space-y-1">
                <span className="text-xs font-bold text-[#A8E6CF]">Episodic Rule</span>
                <p className="text-xs text-[#B9BBC7]">
                  These story preferences guide our AI narrative engine to match dialogue cadence, cliffhanger rhythm, and episode tone to your personal ambition.
                </p>
              </div>
            </div>
          )}

          {/* STEP 7: PREVIEW */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#14151D] border border-[#A8E6CF]/40 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#F6F5F8]">
                      {displayName || name || "Alex Mercer"}
                    </h3>
                    <p className="text-xs text-[#A8E6CF] font-medium">
                      {customCareer || career} • {category}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#A8E6CF]/15 text-[#A8E6CF]">
                    {nationality}
                  </span>
                </div>

                <p className="text-xs text-[#B9BBC7]">
                  {description || `A driven ${customCareer || career} striving for landmark achievements.`}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedTraits.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#252735] text-[#F6F5F8] border border-[#393B4B]"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#393B4B] text-xs text-[#B9BBC7] space-y-1">
                  <p>
                    <strong className="text-white">Genre:</strong> {selectedGenres.join(", ")}
                  </p>
                  <p>
                    <strong className="text-white">Visual Style:</strong> {visualStyle}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#252735] border border-[#393B4B] text-xs text-[#B9BBC7]">
                <Sparkles className="w-4 h-4 text-[#FFB347] inline mr-1.5" />
                <span>
                  Sample Episode Hook: “The deadline clock begins as {name || 'your hero'} steps into the arena, ready to transform daily discipline into an unforgettable saga.”
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#393B4B]">
          <button
            type="button"
            disabled={currentStep === 1 || saving}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium text-[#B9BBC7] hover:text-white disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < 7 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-[#14151D] text-sm font-bold shadow-md transition-all hover:scale-105"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveIdentity}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-[#FF6B6B] hover:bg-[#ff5252] text-white text-sm font-bold shadow-lg transition-all hover:scale-105 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? "Saving Identity..." : "Save & Choose Identity"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
