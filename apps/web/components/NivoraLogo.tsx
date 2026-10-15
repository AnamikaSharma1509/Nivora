import React from "react";

interface NivoraLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showWordmark?: boolean;
}

export default function NivoraLogo({
  size = "md",
  className = "",
  showWordmark = true,
}: NivoraLogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl",
  };

  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* 
        Nivora Monogram:
        Solid black circle background with grey N monogram.
        Features a solid straight first vertical stroke, a dramatic diagonal stroke,
        and a right-hand vertical stroke with the upper origin and characteristic middle disconnection.
      */}
      <svg
        className={`${iconSizes[size]} shrink-0`}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Nivora Logo"
      >
        {/* Solid Black Circular Medallion */}
        <circle cx="18" cy="18" r="17" fill="#0B0C10" stroke="#393B4B" strokeWidth="1.2" />
        
        {/* Left Straight Solid Vertical Stroke */}
        <path
          d="M10.5 9.5H13.8V26.5H10.5V9.5Z"
          fill="#D1D5DB"
        />

        {/* Dramatic Diagonal Stroke */}
        <path
          d="M13.8 9.5L24.8 26.5H21.2L11.5 11.5V9.5H13.8Z"
          fill="#B9BBC7"
        />

        {/* Right Vertical Upper Stroke (Starting at top right with middle interruption) */}
        <path
          d="M22.2 9.5H25.5V17.8H22.2V9.5Z"
          fill="#D1D5DB"
        />

        {/* Right Vertical Lower Segment (After interruption) */}
        <path
          d="M22.2 21.8H25.5V26.5H22.2V21.8Z"
          fill="#9CA3AF"
        />
      </svg>

      {showWordmark && (
        <span
          className={`font-extrabold tracking-tight text-[#F6F5F8] ${textSizes[size]}`}
          style={{ letterSpacing: "-0.03em" }}
        >
          Nivora
        </span>
      )}
    </div>
  );
}
