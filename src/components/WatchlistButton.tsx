"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import { MediaType } from "@/types";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  size?: "sm" | "md" | "lg";
}

export default function WatchlistButton({
  tmdbId,
  mediaType,
  title,
  posterPath,
  size = "md",
}: WatchlistButtonProps) {
  const { isInWatchlist, addItem, removeItem, isLoaded } = useWatchlist();

  if (!isLoaded) return null;

  const inWatchlist = isInWatchlist(tmdbId, mediaType);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inWatchlist) {
      removeItem(tmdbId, mediaType);
    } else {
      addItem({ tmdbId, mediaType, title, posterPath });
    }
  };

  const sizeClasses = {
    sm: "p-1.5",
    md: "px-4 py-2",
    lg: "px-6 py-3",
  };

  if (size === "sm") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "rounded-lg transition-all",
          sizeClasses[size],
          inWatchlist
            ? "bg-[var(--accent)] text-white"
            : "bg-[var(--card)] text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--card-hover)]"
        )}
        aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={inWatchlist ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 rounded-xl font-medium transition-all text-sm",
        sizeClasses[size],
        inWatchlist
          ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
          : "border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      )}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={inWatchlist ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
    </button>
  );
}
