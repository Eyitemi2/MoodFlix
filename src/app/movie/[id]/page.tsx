"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { MovieDetail } from "@/types";
import { getPosterUrl, getBackdropUrl, formatRating, formatYear, formatRuntime, getProfileUrl } from "@/lib/utils";
import TrailerPlayer from "@/components/TrailerPlayer";
import WatchlistButton from "@/components/WatchlistButton";
import MovieGrid from "@/components/MovieGrid";
import { DetailSkeleton } from "@/components/ui/Skeleton";

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "movie";
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/movies/${id}?type=${type}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setMovie(data.details);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, type]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <p className="text-[var(--muted)] text-lg">
          {error || "Movie not found"}
        </p>
      </div>
    );
  }

  const backdropUrl = getBackdropUrl(movie.backdropPath);
  const posterUrl = getPosterUrl(movie.posterPath, "large");

  return (
    <div>
      {/* Backdrop */}
      {backdropUrl && (
        <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full">
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/60 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main info */}
        <div className={`flex flex-col sm:flex-row gap-6 sm:gap-8 ${backdropUrl ? "-mt-32 relative z-10" : "pt-8"}`}>
          {/* Poster */}
          <div className="flex-shrink-0 w-48 sm:w-56 mx-auto sm:mx-0">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-[var(--muted)] italic mb-4">
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD93D" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="font-semibold">{formatRating(movie.voteAverage)}</span>
                <span className="text-[var(--muted)]">({movie.voteCount.toLocaleString()})</span>
              </span>
              <span className="text-[var(--border)]">|</span>
              <span className="text-[var(--muted)]">{formatYear(movie.releaseDate)}</span>
              {movie.runtime && (
                <>
                  <span className="text-[var(--border)]">|</span>
                  <span className="text-[var(--muted)]">{formatRuntime(movie.runtime)}</span>
                </>
              )}
              {movie.numberOfSeasons && (
                <>
                  <span className="text-[var(--border)]">|</span>
                  <span className="text-[var(--muted)]">{movie.numberOfSeasons} Season{movie.numberOfSeasons > 1 ? "s" : ""}</span>
                </>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full bg-[var(--card)] border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mb-6">
              <WatchlistButton
                tmdbId={movie.id}
                mediaType={movie.mediaType}
                title={movie.title}
                posterPath={movie.posterPath}
                size="md"
              />
              {movie.director && (
                <span className="text-sm text-[var(--muted)]">
                  Directed by <span className="text-[var(--foreground)]">{movie.director}</span>
                </span>
              )}
            </div>

            {/* Overview */}
            <p className="text-[var(--muted)] leading-relaxed">
              {movie.overview}
            </p>
          </div>
        </div>

        {/* Trailer */}
        {movie.trailer && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">Trailer</h2>
            <TrailerPlayer trailer={movie.trailer} title={movie.title} />
          </section>
        )}

        {/* Cast */}
        {movie.cast.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-4">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {movie.cast.map((member) => (
                <div key={member.id} className="flex-shrink-0 w-24 text-center">
                  <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden bg-[var(--card)] mb-2">
                    <Image
                      src={getProfileUrl(member.profilePath, "medium")}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium leading-tight line-clamp-1">
                    {member.name}
                  </p>
                  <p className="text-[10px] text-[var(--muted)] leading-tight line-clamp-1">
                    {member.character}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar */}
        {movie.similar.length > 0 && (
          <section className="mt-10 pb-8">
            <h2 className="text-xl font-bold mb-4">Similar Titles</h2>
            <MovieGrid movies={movie.similar} />
          </section>
        )}
      </div>
    </div>
  );
}
