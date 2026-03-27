"use client";

import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/types";
import { getPosterUrl, formatRating, formatYear } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const posterUrl = getPosterUrl(movie.posterPath, "medium");
  const year = formatYear(movie.releaseDate);
  const rating = formatRating(movie.voteAverage);
  const mediaParam = movie.mediaType === "tv" ? "?type=tv" : "";

  return (
    <Link
      href={`/movie/${movie.id}${mediaParam}`}
      className="group flex flex-col gap-2"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-[var(--card)]">
        <Image
          src={posterUrl}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Rating badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-1 text-xs font-semibold backdrop-blur-sm">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="#FFD93D"
            stroke="none"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="text-white">{rating}</span>
        </div>
        {/* Media type badge */}
        {movie.mediaType === "tv" && (
          <div className="absolute top-2 left-2 rounded-md bg-[var(--accent)]/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            TV
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-xs text-gray-300 line-clamp-3">
              {movie.overview}
            </p>
          </div>
        </div>
      </div>
      <div className="px-1">
        <h3 className="text-sm font-medium leading-tight line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
          {movie.title}
        </h3>
        <p className="text-xs text-[var(--muted)] mt-0.5">{year}</p>
      </div>
    </Link>
  );
}
