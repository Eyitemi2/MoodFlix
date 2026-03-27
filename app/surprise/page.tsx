'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Movie, MoodType } from '@/types'
import { MOOD_CONFIG, getPosterUrl } from '@/lib/mockData'
import { getSurpriseMovie } from '@/lib/recommendations'
import { WatchlistButton } from '@/components/WatchlistButton'
import { useWatchlist } from '@/context/WatchlistContext'
import { usePersonalization } from '@/context/PersonalizationContext'

export default function SurpriseMePage() {
  const { watchlist } = useWatchlist()
  const { trackView } = usePersonalization()
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [movie, setMovie] = useState<Movie | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [spunCount, setSpunCount] = useState(0)

  const excludeIds = watchlist
    .filter((w) => w.status === 'watched')
    .map((w) => w.movieId)

  const spin = useCallback(() => {
    setSpinning(true)
    setRevealed(false)

    // Dramatic delay for effect
    setTimeout(() => {
      const pick = getSurpriseMovie(selectedMood ?? undefined, excludeIds)
      setMovie(pick)
      setSpinning(false)

      setTimeout(() => {
        setRevealed(true)
        if (pick) trackView(pick.id)
        setSpunCount((c) => c + 1)
      }, 100)
    }, 1200)
  }, [selectedMood, excludeIds, trackView])

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-6xl mb-4 animate-pulse-slow">🎲</div>
        <h1 className="text-4xl font-bold text-white mb-3">Surprise Me</h1>
        <p className="text-gray-400 max-w-md">
          Feeling indecisive? Let fate decide. We'll pick a great film for you —
          filtered by your mood if you want one.
        </p>
      </div>

      {/* Optional mood filter */}
      <div className="mb-8 w-full max-w-lg">
        <p className="text-gray-500 text-sm text-center mb-3">
          Narrow it down by mood (optional):
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedMood(null)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selectedMood === null
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'bg-[#1a1a24] border-[#2a2a3a] text-gray-400 hover:border-violet-500'
            }`}
          >
            🎭 Any Mood
          </button>
          {MOOD_CONFIG.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMood(m.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selectedMood === m.id
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-[#1a1a24] border-[#2a2a3a] text-gray-400 hover:border-violet-500'
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={spinning}
        className={`relative px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-200 active:scale-95
          ${
            spinning
              ? 'bg-violet-800 text-violet-300 cursor-wait'
              : 'bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-lg shadow-violet-900/40 hover:shadow-violet-800/60'
          }`}
      >
        {spinning ? (
          <span className="flex items-center gap-3">
            <span className="inline-block animate-spin text-2xl">🎲</span>
            Picking your film...
          </span>
        ) : spunCount === 0 ? (
          '🎲 Spin!'
        ) : (
          '🎲 Spin Again'
        )}
      </button>

      {/* Result card */}
      {movie && (
        <div
          className={`mt-12 w-full max-w-sm transition-all duration-500 ${
            revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Poster */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-violet-900/30 mb-4 aspect-[2/3]">
            <Image
              src={getPosterUrl(movie.posterPath)}
              alt={movie.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h2 className="text-2xl font-bold text-white leading-tight mb-1">
                {movie.title}
              </h2>
              <p className="text-gray-300 text-sm">
                {movie.year} · {movie.genres[0]} · ★ {movie.rating.toFixed(1)}
              </p>
            </div>
          </div>

          {/* Synopsis */}
          <p className="text-gray-400 text-sm leading-relaxed mb-5 line-clamp-3">
            {movie.synopsis}
          </p>

          {/* Mood tags */}
          <div className="flex flex-wrap gap-2 mb-5">
            {movie.moods.slice(0, 3).map((m) => {
              const mc = MOOD_CONFIG.find((c) => c.id === m)
              return (
                <span
                  key={m}
                  className={`badge bg-[#2a2a3a] ${mc?.textColor} border border-[#3a3a4a]`}
                >
                  {mc?.emoji} {mc?.label}
                </span>
              )
            })}
            {movie.isHiddenGem && (
              <span className="badge bg-amber-500/20 text-amber-400 border border-amber-500/30">
                💎 Hidden Gem
              </span>
            )}
          </div>

          {/* CTA row */}
          <div className="flex gap-3">
            <Link href={`/movie/${movie.id}`} className="btn-primary flex-1 text-center">
              View Details
            </Link>
            <WatchlistButton movieId={movie.id} iconOnly={false} size="md" />
          </div>

          {/* Spin count easter egg */}
          {spunCount >= 3 && (
            <p className="text-center text-xs text-gray-600 mt-4">
              {spunCount} spins and still deciding? 😄 Trust the algorithm.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
