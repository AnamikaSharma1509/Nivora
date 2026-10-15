import React from "react";

export interface AvatarOptions {
  hair_style?: string;
  hair_color?: string;
  skin_tone?: string;
  clothing_color?: string;
  gender?: "masculine" | "feminine" | "neutral" | string;
}

interface HumanAvatarProps {
  options?: AvatarOptions | null;
  imageUrl?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SKIN_COLORS: Record<string, string> = {
  fair: "#FDE2D2",
  warm_beige: "#E8BA93",
  olive: "#CFA077",
  bronze: "#A56F46",
  deep_brown: "#623B2A",
};

const HAIR_COLORS: Record<string, string> = {
  dark_black: "#1A1A1A",
  chestnut_brown: "#4A2E1B",
  golden_blonde: "#D4AF37",
  auburn_red: "#873220",
  silver_grey: "#9CA3AF",
};

const CLOTHING_COLORS: Record<string, string> = {
  emerald_teal: "#7ED8B8",
  navy_blue: "#1E3A8A",
  charcoal: "#2B2D42",
  royal_blue: "#3B82F6",
  ruby_red: "#7F1D1D",
  plum_purple: "#6D28D9",
};

const SIZE_MAP = {
  xs: "w-7 h-7 text-xs",
  sm: "w-9 h-9 text-xs",
  md: "w-12 h-12 text-sm",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-2xl",
};

export default function HumanAvatar({
  options,
  imageUrl,
  name = "User",
  size = "md",
  className = "",
}: HumanAvatarProps) {
  // If an external image URL is explicitly provided and options are not custom SVG, show image with fallback
  const [imageError, setImageError] = React.useState(false);

  const skinToneKey = options?.skin_tone || "warm_beige";
  const skin = SKIN_COLORS[skinToneKey] || SKIN_COLORS.warm_beige;

  const hairColorKey = options?.hair_color || "dark_black";
  const hairColor = HAIR_COLORS[hairColorKey] || HAIR_COLORS.dark_black;

  const clothingColorKey = options?.clothing_color || "emerald_teal";
  const clothing = CLOTHING_COLORS[clothingColorKey] || CLOTHING_COLORS.emerald_teal;

  const style = options?.hair_style || "short_fade";
  const gender = options?.gender || "neutral";

  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  if (imageUrl && !imageError && (!options || Object.keys(options).length === 0)) {
    return (
      <div className={`relative rounded-2xl overflow-hidden bg-[#14151D] border border-[#393B4B] shrink-0 ${sizeClass} ${className}`}>
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Render stylized human SVG avatar
  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-[#14151D] border border-[#393B4B] flex items-center justify-center shrink-0 shadow-inner ${sizeClass} ${className}`}
      title={`${name}'s Avatar`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Background gradient */}
        <rect width="100" height="100" fill="#1C1E2A" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="#252735" strokeWidth="2" />

        {/* Clothing / Torso */}
        <path
          d="M20 98C20 78 32 70 50 70C68 70 80 78 80 98H20Z"
          fill={clothing}
        />
        {/* Collar / Lapel */}
        <path
          d="M44 70L50 82L56 70"
          stroke="#14151D"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Neck */}
        <rect x="44" y="52" width="12" height="20" rx="4" fill={skin} />

        {/* Head */}
        <ellipse cx="50" cy="46" rx="20" ry="23" fill={skin} />

        {/* Facial features: Eyebrows, Eyes, Mouth */}
        {/* Eyebrows */}
        <path d="M38 38C40 37 43 37 45 38" stroke="#14151D" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M55 38C57 37 60 37 62 38" stroke="#14151D" strokeWidth="1.8" strokeLinecap="round" />

        {/* Eyes */}
        <circle cx="41" cy="43" r="2.2" fill="#14151D" />
        <circle cx="59" cy="43" r="2.2" fill="#14151D" />
        <circle cx="41.8" cy="42.2" r="0.7" fill="#FFFFFF" />
        <circle cx="59.8" cy="42.2" r="0.7" fill="#FFFFFF" />

        {/* Nose subtle contour */}
        <path d="M50 44V49L52 50" stroke="#14151D" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4" />

        {/* Friendly smile */}
        <path d="M44 55C47 58 53 58 56 55" stroke="#14151D" strokeWidth="1.8" strokeLinecap="round" />

        {/* Hairstyle variations */}
        {style === "short_fade" && (
          <path
            d="M30 42C30 26 38 21 50 21C62 21 70 26 70 42C67 36 63 32 50 32C37 32 33 36 30 42Z"
            fill={hairColor}
          />
        )}

        {style === "curly" && (
          <g fill={hairColor}>
            <circle cx="35" cy="30" r="10" />
            <circle cx="50" cy="24" r="11" />
            <circle cx="65" cy="30" r="10" />
            <circle cx="30" cy="40" r="8" />
            <circle cx="70" cy="40" r="8" />
            <path d="M32 35C35 25 65 25 68 35C65 30 35 30 32 35Z" />
          </g>
        )}

        {style === "slick_back" && (
          <path
            d="M29 44C29 25 38 20 50 20C62 20 71 25 71 44C68 32 60 28 50 28C40 28 32 32 29 44Z"
            fill={hairColor}
          />
        )}

        {style === "ponytail" && (
          <g fill={hairColor}>
            <path d="M30 42C30 25 38 22 50 22C62 22 70 25 70 42C67 33 62 29 50 29C38 29 33 33 30 42Z" />
            <path d="M68 28C78 28 84 40 78 56C76 58 73 54 74 46C75 38 72 32 68 28Z" />
          </g>
        )}

        {style === "bob" && (
          <g fill={hairColor}>
            <path d="M28 42C28 25 38 22 50 22C62 22 72 25 72 42C72 58 68 62 66 64C66 52 64 36 50 34C36 36 34 52 34 64C32 62 28 58 28 42Z" />
          </g>
        )}

        {style === "wavy_long" && (
          <g fill={hairColor}>
            <path d="M28 42C28 24 38 20 50 20C62 20 72 24 72 42C74 58 75 72 68 76C68 62 66 40 50 34C34 40 32 62 32 76C25 72 26 58 28 42Z" />
          </g>
        )}

        {style === "buzz" && (
          <path
            d="M31 43C31 28 38 24 50 24C62 24 69 28 69 43C67 36 62 34 50 34C38 34 33 36 31 43Z"
            fill={hairColor}
            opacity="0.85"
          />
        )}

        {style === "natural_afro" && (
          <g fill={hairColor}>
            <circle cx="50" cy="38" r="28" opacity="0.95" />
            <ellipse cx="50" cy="46" rx="20" ry="23" fill={skin} />
            <path d="M38 38C40 37 43 37 45 38" stroke="#14151D" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M55 38C57 37 60 37 62 38" stroke="#14151D" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="41" cy="43" r="2.2" fill="#14151D" />
            <circle cx="59" cy="43" r="2.2" fill="#14151D" />
            <path d="M44 55C47 58 53 58 56 55" stroke="#14151D" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
}
