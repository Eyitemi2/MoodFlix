"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SurpriseResponse } from "@/types";
import { MOOD_MAP } from "@/config/moods";
import Image from "next/image";
import { getPosterUrl, getBackdropUrl, formatRating, formatYear, formatRuntime } from "@/lib/utils";
import TrailerPlayer from "@/components/TrailerPlayer";
import WatchlistButton from "@/components/WatchlistButton";
import { DetailSkeleton } from "@/components/ui/Skeleton";

export default function SurprisePage() {
  const router = useRouter();
  const [data, setData] = useState<SurpriseResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSurprise = () => {
    setLoading(true);
    fetch("/api/surprise")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSurprise();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (!data?.movie) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-[var(--muted)]">Could not find a surprise. Try again!</p>
        <button
          onClick={fetchSurprise}
          className="mt-4 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const movie = data.movie;
  const mood = MOOD_MAP[data.mood];
  const backdropUrl = getBackdropUrl(movie.backdropPath);
  const posterUrl = getPosterUrl(movie.posterPath, "large");

  return (
    <div>
      {/* Backdrop */}
      {backdropUrl && (
        <div className="relative h-[300px] sm:h-[400px] w-full">
          <Image src={backdropUrl} alt={movie.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/60 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Surprise banner */}
        <div className={`${backdropUrl ? "-mt-24 relative z-10" : "pt-8"} mb-8`}>
          <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{mood?.emoji}</span>
              <div>
                <p className="text-sm text-[var(--muted)]">Your surprise mood</p>
                <p className="font-bold text-lg">{mood?.label}</p>
              </div>
            </div>
            <p className="text-[var(--muted)] text-sm italic">{data.explanation}</p>
          </div>

          {/* Movie info */}
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 w-40 sm:w-48 mx-auto sm:mx-0">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-xl">
                <Image src={posterUrl} alt={movie.title} fill className="object-cover" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-[var(--muted)] italic mb-3">&ldquo;{movie.tagline}&rdquo;</p>
              )}

              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                <span className="flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD93D" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span className="font-semibold">{formatRating(movie.voteAverage)}</span>
                </span>
                <span className="text-[var(--border)]">|</span>
                <span className="text-[var(--muted)]">{formatYear(movie.releaseDate)}</span>
                {movie.runtime && (
                  <>
                    <span className="text-[var(--border)]">|</span>
                    <span className="text-[var(--muted)]">{formatRuntime(movie.runtime)}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((g) => (
                  <span key={g.id} className="rounded-full bg-[var(--background)] border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                    {g.name}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <WatchlistButton tmdbId={movie.id} mediaType="movie" title={movie.title} posterPath={movie.posterPath} />
                <button
                  onClick={fetchSurprise}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                >
                  Surprise Me Again
                </button>
                <button
                  onClick={() => router.push(`/movie/${movie.id}`)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                >
                  Full Details
                </button>
              </div>

              <p className="text-[var(--muted)] leading-relaxed">{movie.overview}</p>
            </div>
          </div>
        </div>

        {/* Trailer */}
        {movie.trailer && (
          <section className="mt-8">
            <h2 className="text-xl font-bold mb-4">Trailer</h2>
            <TrailerPlayer trailer={movie.trailer} title={movie.title} />
          </section>
        )}
      </div>
    </div>
  );
}
