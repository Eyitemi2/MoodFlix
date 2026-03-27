"use client";

import { MOODS } from "@/config/moods";
import { MoodId } from "@/types";
import { cn } from "@/lib/utils";

interface MoodSelectorProps {
  selectedMood: MoodId | null;
  onSelect: (mood: MoodId) => void;
  isLoading?: boolean;
}

export default function MoodSelector({
  selectedMood,
  onSelect,
  isLoading,
}: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
      {MOODS.map((mood) => {
        const isSelected = selectedMood === mood.id;
        return (
          <button
            key={mood.id}
            onClick={() => onSelect(mood.id)}
            disabled={isLoading}
            className={cn(
              "group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 sm:p-5 transition-all duration-200",
              "hover:scale-105 hover:shadow-lg active:scale-100",
              isSelected
                ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-md"
                : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--muted)]",
              isLoading && "opacity-60 cursor-not-allowed"
            )}
          >
            <span className="text-3xl sm:text-4xl transition-transform group-hover:scale-110">
              {mood.emoji}
            </span>
            <span
              className={cn(
                "text-sm font-semibold transition-colors",
                isSelected ? "text-[var(--accent)]" : "text-[var(--foreground)]"
              )}
            >
              {mood.label}
            </span>
            <span className="text-xs text-[var(--muted)] text-center leading-tight">
              {mood.description}
            </span>
            {isSelected && (
              <div
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
