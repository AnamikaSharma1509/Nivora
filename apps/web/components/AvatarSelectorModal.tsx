"use client";

import React, { useState } from "react";
import { X, Check, Sparkles, User, Palette } from "lucide-react";
import HumanAvatar, { AvatarOptions } from "./HumanAvatar";
import { api, AvatarItem } from "../lib/api";

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOptions?: AvatarOptions;
  currentImageUrl?: string | null;
  userName?: string;
  onAvatarSaved: (updated: AvatarItem) => void;
}

const SKIN_TONES = [
  { key: "fair", label: "Fair", hex: "#FDE2D2" },
  { key: "warm_beige", label: "Warm Beige", hex: "#E8BA93" },
  { key: "olive", label: "Olive", hex: "#CFA077" },
  { key: "bronze", label: "Bronze", hex: "#A56F46" },
  { key: "deep_brown", label: "Deep Brown", hex: "#623B2A" },
];

const HAIR_STYLES = [
  { key: "short_fade", label: "Short Fade" },
  { key: "slick_back", label: "Slick Back" },
  { key: "curly", label: "Curly Fade" },
  { key: "ponytail", label: "Ponytail" },
  { key: "bob", label: "Bob Cut" },
  { key: "wavy_long", label: "Wavy Long" },
  { key: "buzz", label: "Buzz Cut" },
  { key: "natural_afro", label: "Natural Afro" },
];

const HAIR_COLORS = [
  { key: "dark_black", label: "Dark Black", hex: "#1A1A1A" },
  { key: "chestnut_brown", label: "Chestnut Brown", hex: "#4A2E1B" },
  { key: "golden_blonde", label: "Golden Blonde", hex: "#D4AF37" },
  { key: "auburn_red", label: "Auburn Red", hex: "#873220" },
  { key: "silver_grey", label: "Silver Grey", hex: "#9CA3AF" },
];

const CLOTHING_COLORS = [
  { key: "emerald_teal", label: "Emerald Teal (Brand)", hex: "#7ED8B8" },
  { key: "navy_blue", label: "Navy Blue", hex: "#1E3A8A" },
  { key: "charcoal", label: "Charcoal Slate", hex: "#2B2D42" },
  { key: "royal_blue", label: "Royal Blue", hex: "#3B82F6" },
  { key: "ruby_red", label: "Ruby Red", hex: "#7F1D1D" },
  { key: "plum_purple", label: "Plum Purple", hex: "#6D28D9" },
];

const GENDERS = [
  { key: "neutral", label: "Neutral / Non-Gendered" },
  { key: "feminine", label: "Feminine" },
  { key: "masculine", label: "Masculine" },
];

export default function AvatarSelectorModal({
  isOpen,
  onClose,
  currentOptions,
  currentImageUrl,
  userName = "Protagonist",
  onAvatarSaved,
}: AvatarSelectorModalProps) {
  const [options, setOptions] = useState<AvatarOptions>(
    currentOptions || {
      skin_tone: "warm_beige",
      hair_style: "short_fade",
      hair_color: "dark_black",
      clothing_color: "emerald_teal",
      gender: "neutral",
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const res = await api.updateMyAvatarOptions({
        avatar_options: options,
      });
      onAvatarSaved(res);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save avatar customization");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-[#393B4B] shadow-2xl overflow-hidden flex flex-col my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#393B4B] bg-[#14151D]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#A8E6CF]/15 flex items-center justify-center text-[#A8E6CF]">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F6F5F8]">Customize Your Avatar Identity</h2>
              <p className="text-[11px] text-[#B9BBC7]">
                Human-style options: skin tone, hairstyle, colors, and presentation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#B9BBC7] hover:text-[#F6F5F8] hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Live Preview, Right Controls */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#14151D]/90 overflow-y-auto max-h-[75vh]">
          {/* Live Preview Box */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-[#1C1E2A] border border-[#393B4B] space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A8E6CF]">
              Live Preview
            </span>

            <HumanAvatar options={options} name={userName} size="xl" className="ring-4 ring-[#A8E6CF]/20" />

            <div className="text-center">
              <h4 className="text-sm font-bold text-[#F6F5F8]">{userName}</h4>
              <p className="text-[11px] text-[#A8E6CF] capitalize">
                {options.hair_style?.replace("_", " ")} • {options.skin_tone?.replace("_", " ")}
              </p>
            </div>

            <div className="w-full pt-3 border-t border-[#393B4B]/60 text-[10px] text-[#B9BBC7] text-center leading-relaxed">
              Persists consistently across header, characters, timeline, and episode cards.
            </div>
          </div>

          {/* Configuration Options */}
          <div className="md:col-span-8 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 text-xs text-[#FF6B6B]">
                {error}
              </div>
            )}

            {/* 1. Skin Tone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#F6F5F8] flex items-center justify-between">
                <span>1. Skin Tone</span>
                <span className="text-[11px] text-[#A8E6CF] font-normal capitalize">
                  {SKIN_TONES.find((s) => s.key === options.skin_tone)?.label}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SKIN_TONES.map((tone) => {
                  const active = options.skin_tone === tone.key;
                  return (
                    <button
                      key={tone.key}
                      onClick={() => setOptions((prev) => ({ ...prev, skin_tone: tone.key }))}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all text-xs ${
                        active
                          ? "bg-[#252735] border-[#A8E6CF] text-[#F6F5F8] shadow-sm font-semibold"
                          : "bg-[#14151D] border-[#393B4B] text-[#B9BBC7] hover:border-white/20"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/40"
                        style={{ backgroundColor: tone.hex }}
                      />
                      <span>{tone.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Hairstyle */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#F6F5F8] flex items-center justify-between">
                <span>2. Hairstyle</span>
                <span className="text-[11px] text-[#A8E6CF] font-normal">
                  {HAIR_STYLES.find((h) => h.key === options.hair_style)?.label}
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {HAIR_STYLES.map((style) => {
                  const active = options.hair_style === style.key;
                  return (
                    <button
                      key={style.key}
                      onClick={() => setOptions((prev) => ({ ...prev, hair_style: style.key }))}
                      className={`py-2 px-2.5 rounded-xl border text-xs text-center transition-all ${
                        active
                          ? "bg-[#A8E6CF]/15 border-[#A8E6CF] text-[#A8E6CF] font-bold"
                          : "bg-[#14151D] border-[#393B4B] text-[#B9BBC7] hover:text-white hover:border-white/20"
                      }`}
                    >
                      {style.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Hair Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#F6F5F8] flex items-center justify-between">
                <span>3. Hair Color</span>
                <span className="text-[11px] text-[#A8E6CF] font-normal">
                  {HAIR_COLORS.find((c) => c.key === options.hair_color)?.label}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLORS.map((col) => {
                  const active = options.hair_color === col.key;
                  return (
                    <button
                      key={col.key}
                      onClick={() => setOptions((prev) => ({ ...prev, hair_color: col.key }))}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all text-xs ${
                        active
                          ? "bg-[#252735] border-[#A8E6CF] text-[#F6F5F8] shadow-sm font-semibold"
                          : "bg-[#14151D] border-[#393B4B] text-[#B9BBC7] hover:border-white/20"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/40"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Clothing Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#F6F5F8] flex items-center justify-between">
                <span>4. Outfit Color</span>
                <span className="text-[11px] text-[#A8E6CF] font-normal">
                  {CLOTHING_COLORS.find((c) => c.key === options.clothing_color)?.label}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CLOTHING_COLORS.map((col) => {
                  const active = options.clothing_color === col.key;
                  return (
                    <button
                      key={col.key}
                      onClick={() => setOptions((prev) => ({ ...prev, clothing_color: col.key }))}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all text-xs ${
                        active
                          ? "bg-[#252735] border-[#A8E6CF] text-[#F6F5F8] shadow-sm font-semibold"
                          : "bg-[#14151D] border-[#393B4B] text-[#B9BBC7] hover:border-white/20"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/40"
                        style={{ backgroundColor: col.hex }}
                      />
                      <span>{col.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Gender Presentation */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#F6F5F8]">5. Gender Presentation</label>
              <div className="grid grid-cols-3 gap-2">
                {GENDERS.map((g) => {
                  const active = options.gender === g.key;
                  return (
                    <button
                      key={g.key}
                      onClick={() => setOptions((prev) => ({ ...prev, gender: g.key }))}
                      className={`py-2 px-3 rounded-xl border text-xs text-center transition-all ${
                        active
                          ? "bg-[#A8E6CF]/15 border-[#A8E6CF] text-[#A8E6CF] font-bold"
                          : "bg-[#14151D] border-[#393B4B] text-[#B9BBC7] hover:text-white"
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#393B4B] bg-[#14151D] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#20232E] hover:bg-[#252735] text-xs font-bold text-[#F6F5F8] border border-[#393B4B]"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-[#14151D] text-xs font-bold shadow-md transition-all hover:scale-105 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Avatar Selection"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
