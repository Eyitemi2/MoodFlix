'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Movie, RecommendationResult } from '@/types'
import { getPosterUrl } from '@/lib/mockData'
import { WatchlistButton } from './WatchlistButton'

interface MovieCardProps {
  movie: Movie
  recommendation?: RecommendationResult
  showExplanation?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function MovieCard({
  movie,
  recommendation,
  showExplanation = false,
  size = 'md',
}: MovieCardProps) {
  const [imageError, setImageError] = useState(false)
  const posterUrl = imageError
    ? `https://via.placeholder.com/300x450/1a1a24/6b7280?text=${encodeURIComponent(movie.title)}`
    : getPosterUrl(movie.posterPath)

  const cardSizes = {
    sm: 'w-36',
    md: 'w-full',
    lg: 'w-full',
  }

  return (
    <div className={`group relative ${cardSizes[size]} flex flex-col`}>
      <Link href={`/movie/${movie.id}`}>
        {/* Poster */}
        <div className="relative overflow-hidden rounded-xl bg-[#1a1a24] aspect-[2/3]">
          <Image
            src={posterUrl}
            alt={`${movie.title} poster`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick info on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <p className="text-white text-xs line-clamp-3 leading-relaxed">
              {movie.synopsis}
            </p>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {movie.isHiddenGem && (
              <span className="badge bg-amber-500/90 text-white text-[10px]">
                💎 Hidden Gem
              </span>
            )}
            {recommendation?.moodMatchStrength === 'primary' && (
              <span className="badge bg-violet-600/90 text-white text-[10px]">
                ✨ Perfect Match
              </span>
            )}
          </div>

          {/* Watchlist button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <WatchlistButton movieId={movie.id} iconOnly size="sm" />
          </div>

          {/* Rating */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 rounded-full px-2 py-0.5">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-white text-xs font-semibold">{movie.rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>

      {/* Card info below poster */}
      <div className="mt-2 flex-1">
        <Link href={`/movie/${movie.id}`}>
          <h3 className="text-white font-semibold text-sm leading-tight hover:text-violet-400 transition-colors line-clamp-2">
            {movie.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span>{movie.year}</span>
          <span>·</span>
          <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
          {movie.genres[0] && (
            <>
              <span>·</span>
              <span>{movie.genres[0]}</span>
            </>
          )}
        </div>

        {/* Score bar (shown when coming from recommendations) */}
        {recommendation && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Match</span>
              <span className="text-xs font-semibold text-violet-400">
                {recommendation.score}%
              </span>
            </div>
            <div className="h-1 bg-[#2a2a3a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${recommendation.score}%` }}
              />
            </div>
          </div>
        )}

        {/* Explanation snippet */}
        {showExplanation && recommendation?.explanation && (
          <p className="mt-1.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {recommendation.explanation}
          </p>
        )}

        {/* Platform badges */}
        {movie.platforms.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {movie.platforms.slice(0, 2).map((platform) => (
              <span
                key={platform}
                className="badge bg-[#2a2a3a] text-gray-400 text-[10px]"
              >
                {platform}
              </span>
            ))}
            {movie.platforms.length > 2 && (
              <span className="badge bg-[#2a2a3a] text-gray-400 text-[10px]">
                +{movie.platforms.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
