"use client";

import { useState } from "react";
import { TrailerInfo } from "@/types";

interface TrailerPlayerProps {
  trailer: TrailerInfo;
  title: string;
}

export default function TrailerPlayer({ trailer, title }: TrailerPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isPlaying) {
    return (
      <button
        onClick={() => setIsPlaying(true)}
        className="group relative w-full aspect-video rounded-xl overflow-hidden bg-[var(--card)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
      >
        <img
          src={`https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`}
          alt={`${title} trailer thumbnail`}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-white font-semibold shadow-lg transition-transform group-hover:scale-110">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Play Trailer
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
        title={trailer.name || `${title} trailer`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
