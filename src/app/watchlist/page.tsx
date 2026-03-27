"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import Image from "next/image";
import Link from "next/link";
import { getPosterUrl } from "@/lib/utils";
import { MovieGridSkeleton } from "@/components/ui/Skeleton";

export default function WatchlistPage() {
  const { items, isLoaded, removeItem } = useWatchlist();

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>
        <MovieGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Watchlist</h1>
        {items.length > 0 && (
          <span className="text-sm text-[var(--muted)]">
            {items.length} title{items.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mb-4 opacity-40"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-[var(--muted)] text-lg mb-2">
            Your watchlist is empty
          </p>
          <p className="text-[var(--muted)] text-sm mb-6">
            Browse movies and add them to your watchlist to keep track of what you want to watch.
          </p>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Discover Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {items.map((item) => {
            const posterUrl = getPosterUrl(item.posterPath, "medium");
            const mediaParam = item.mediaType === "tv" ? "?type=tv" : "";

            return (
              <div key={`${item.mediaType}-${item.tmdbId}`} className="group relative flex flex-col gap-2">
                <Link href={`/movie/${item.tmdbId}${mediaParam}`}>
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[var(--card)]">
                    <Image
                      src={posterUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {item.mediaType === "tv" && (
                      <div className="absolute top-2 left-2 rounded-md bg-[var(--accent)]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        TV
                      </div>
                    )}
                  </div>
                </Link>

                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.tmdbId, item.mediaType)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white/70 hover:text-red-400 hover:bg-black/90 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Remove from watchlist"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                <div className="px-1">
                  <h3 className="text-sm font-medium leading-tight line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    Added {new Date(item.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
