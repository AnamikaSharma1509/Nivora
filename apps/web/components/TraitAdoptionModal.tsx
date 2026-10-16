"use client";

import React, { useState } from "react";
import { X, Check, Sparkles, ShieldCheck, ArrowRight, BookOpen } from "lucide-react";
import { api, AvatarItem } from "../lib/api";

interface TraitAdoptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: AvatarItem | null;
  currentUserTraits?: string[];
  currentAspirationalTraits?: string[];
  onTraitsAdopted: (newTraits: string[]) => void;
}

const TRAIT_DESCRIPTIONS: Record<string, string> = {
  analytical: "Rigorous logical breakdown of complex systems, stress-testing edge cases and assumptions.",
  unflappable: "Poised emotional stability under unexpected setbacks, operational emergencies, or pressure.",
  tactical: "Deft short-term execution precision, breaking major projects into high-velocity sequential sprints.",
  resourceful: "Creative problem-solving using existing primitives and tooling before writing bespoke overhead.",
  curious: "Relentless appetite for foundational understanding, tracing root causes rather than skimming surfaces.",
  resilient: "Rapid operational bounce-back from setbacks, treating failures as telemetry for guardrails.",
  visionary: "Clear long-term horizon clarity, aligning daily micro-efforts to a transcendent multi-year destination.",
  strategic: "Discerning high-leverage 80/20 priorities from trivial tasks and saying no to seductive distractions.",
  disciplined: "Consistent execution of non-negotiable standards regardless of fluctuating mood or motivation.",
  empathetic: "Deep active listening and cognitive perspective-taking that strengthens collaborative alignment.",
  creative: "Original synthesis of disparate domains to craft non-obvious solutions and evocative experiences.",
  competitive: "Healthy pursuit of peak performance standards, benchmarking against the very best in the field.",
};

export default function TraitAdoptionModal({
  isOpen,
  onClose,
  character,
  currentUserTraits = [],
  currentAspirationalTraits = [],
  onTraitsAdopted,
}: TraitAdoptionModalProps) {
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{
    added: string[];
    suggestions: Array<{ trait: string; suggestion: string }>;
  } | null>(null);

  if (!isOpen || !character) return null;

  const availableTraits = character.personality_traits || [];

  const toggleTrait = (trait: string) => {
    const tClean = trait.trim();
    if (selectedTraits.includes(tClean)) {
      setSelectedTraits(selectedTraits.filter((t) => t !== tClean));
    } else {
      setSelectedTraits([...selectedTraits, tClean]);
    }
  };

  const handleAdopt = async () => {
    if (selectedTraits.length === 0) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await api.adoptTraits(selectedTraits);
      setSuccessResult({
        added: res.added_traits,
        suggestions: res.practical_development_suggestions || [],
      });
      onTraitsAdopted(res.aspirational_traits);
    } catch (err: any) {
      setError(err?.message || "Failed to adopt traits");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedTraits([]);
    setSuccessResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border border-[#393B4B] shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#393B4B] bg-[#14151D]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#A8E6CF]/15 flex items-center justify-center text-[#A8E6CF]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F6F5F8]">Adopt Traits from {character.name}</h2>
              <p className="text-[11px] text-[#A8E6CF]">{character.career || character.archetype}</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#B9BBC7] hover:text-[#F6F5F8] hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 bg-[#14151D]/90 overflow-y-auto max-h-[70vh]">
          {successResult ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#A8E6CF]/15 border border-[#A8E6CF]/30 space-y-2">
                <div className="flex items-center space-x-2 text-[#A8E6CF] font-bold text-sm">
                  <Check className="w-4 h-4" />
                  <span>Aspirational Traits Successfully Adopted!</span>
                </div>
                <p className="text-xs text-[#F6F5F8] leading-relaxed">
                  These qualities have been added to your aspirational character profile. Your core identity, name, career, and destination goal remain preserved.
                </p>
              </div>

              {/* Practical Micro-action Suggestions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#B9BBC7] flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#A8E6CF]" />
                  <span>Suggested Practical Development Activities</span>
                </h4>

                <div className="space-y-2.5">
                  {successResult.suggestions.map((s, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#1C1E2A] border border-[#393B4B] space-y-1">
                      <span className="text-[11px] font-bold text-[#A8E6CF] uppercase tracking-wide">
                        Trait: {s.trait}
                      </span>
                      <p className="text-xs text-[#B9BBC7] leading-relaxed">
                        {s.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Identity Protection Notice */}
              <div className="p-3.5 rounded-2xl bg-[#20232E] border border-[#393B4B] flex items-start space-x-3 text-xs text-[#B9BBC7]">
                <ShieldCheck className="w-4 h-4 text-[#A8E6CF] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Adopting traits adds them to your <strong className="text-white">Aspirational Traits</strong> list. This does <strong className="text-[#A8E6CF]">not</strong> overwrite your identity, name, avatar, career, biography, or active goals.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 text-xs text-[#FF6B6B]">
                  {error}
                </div>
              )}

              {/* Trait Selection List */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#F6F5F8]">
                  Select traits to develop ({selectedTraits.length} selected):
                </label>

                <div className="space-y-2">
                  {availableTraits.map((trait) => {
                    const isSelected = selectedTraits.includes(trait);
                    const isAlreadyAdopted = currentAspirationalTraits.some(
                      (t) => t.toLowerCase() === trait.toLowerCase()
                    );
                    const desc =
                      TRAIT_DESCRIPTIONS[trait.toLowerCase()] ||
                      `Cultivate deliberate mastery and tactical application of ${trait}.`;

                    return (
                      <div
                        key={trait}
                        onClick={() => !isAlreadyAdopted && toggleTrait(trait)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isAlreadyAdopted
                            ? "bg-[#14151D] border-[#393B4B]/40 opacity-60 cursor-not-allowed"
                            : isSelected
                            ? "bg-[#A8E6CF]/10 border-[#A8E6CF] shadow-sm"
                            : "bg-[#1C1E2A] border-[#393B4B] hover:border-white/20"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-[#F6F5F8] capitalize">{trait}</span>
                            {isAlreadyAdopted && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#252735] text-[#A8E6CF]">
                                Already in Aspirational List
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#B9BBC7] leading-relaxed">{desc}</p>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                            isSelected
                              ? "bg-[#A8E6CF] border-[#A8E6CF] text-[#14151D]"
                              : "border-[#393B4B] bg-[#14151D]"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#393B4B] bg-[#14151D] flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-[#20232E] hover:bg-[#252735] text-xs font-bold text-[#F6F5F8] border border-[#393B4B]"
          >
            {successResult ? "Done" : "Cancel"}
          </button>

          {!successResult && (
            <button
              onClick={handleAdopt}
              disabled={selectedTraits.length === 0 || submitting}
              className="flex items-center space-x-2 px-6 py-2 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-[#14151D] text-xs font-bold shadow-md transition-all hover:scale-105 disabled:opacity-50"
            >
              <span>{submitting ? "Adopting..." : `Add Selected Traits (${selectedTraits.length})`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
