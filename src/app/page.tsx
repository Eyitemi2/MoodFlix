"use client";

import { useState, useEffect } from "react";
import MoodSelector from "@/components/MoodSelector";
import MovieGrid from "@/components/MovieGrid";
import { useMood } from "@/hooks/useMood";
import { Movie } from "@/types";
import { MOOD_MAP } from "@/config/moods";
import Link from "next/link";

export default function Home() {
  const { selectedMood, recommendations, isLoading, error, selectMood, page, totalPages, loadMore } = useMood();
  const [trending, setTrending] = useState<Movie[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trending?timeWindow=week&mediaType=all")
      .then((res) => res.json())
      .then((data) => {
        setTrending(data.results || []);
        setTrendingLoading(false);
      })
      .catch(() => setTrendingLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <section className="text-center py-12 sm:py-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          How are you feeling{" "}
          <span className="text-[var(--accent)]">today</span>?
        </h1>
        <p className="text-[var(--muted)] text-lg sm:text-xl max-w-2xl mx-auto mb-2">
          Pick your mood and discover movies & shows that match how you feel.
        </p>

        {/* Surprise Me */}
        <Link
          href="/movie/surprise"
          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-[var(--card)] border border-[var(--border)] text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 4l3 3-3 3" />
            <path d="M6 20l-3-3 3-3" />
            <path d="M21 7H9a5 5 0 0 0 0 10h12" />
          </svg>
          Surprise Me
        </Link>
      </section>

      {/* Mood Selector */}
      <section className="mb-12">
        <MoodSelector
          selectedMood={selectedMood}
          onSelect={selectMood}
          isLoading={isLoading}
        />
      </section>

      {/* Recommendations */}
      {selectedMood && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {MOOD_MAP[selectedMood]?.emoji}{" "}
              {MOOD_MAP[selectedMood]?.label} Picks
            </h2>
            {recommendations.length > 0 && (
              <span className="text-sm text-[var(--muted)]">
                Page {page} of {totalPages}
              </span>
            )}
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-6 text-red-400 text-sm">
              {error}
            </div>
          )}

          <MovieGrid movies={recommendations} isLoading={isLoading} emptyMessage="No recommendations found for this mood" />

          {page < totalPages && !isLoading && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              >
                Load More
              </button>
            </div>
          )}
        </section>
      )}

      {/* Trending */}
      {!selectedMood && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Trending This Week</h2>
          </div>
          <MovieGrid
            movies={trending.slice(0, 10)}
            isLoading={trendingLoading}
            emptyMessage="Unable to load trending content"
          />
        </section>
      )}
    </div>
  );
}
