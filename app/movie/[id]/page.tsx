import React from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getMovieById, getPosterUrl, TMDB_BACKDROP_BASE } from '@/lib/mockData'
import { getSimilarMovies } from '@/lib/recommendations'
import { TrailerPlayer } from '@/components/TrailerPlayer'
import { WatchlistButton } from '@/components/WatchlistButton'
import { MovieCard } from '@/components/MovieCard'
import { MOOD_CONFIG } from '@/lib/mockData'

export const revalidate = 86400 // ISR: revalidate every 24 hours

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const movie = getMovieById(parseInt(params.id, 10))
  if (!movie) return { title: 'Movie Not Found' }

  return {
    title: `${movie.title} (${movie.year})`,
    description: movie.synopsis,
    openGraph: {
      title: movie.title,
      description: movie.synopsis,
      images: [getPosterUrl(movie.posterPath)],
    },
  }
}

export default function MovieDetailPage({ params }: Props) {
  const movie = getMovieById(parseInt(params.id, 10))

  if (!movie) notFound()

  const similar = getSimilarMovies(movie.id, 6)
  const moodConfigs = movie.moods.map(
    (m) => MOOD_CONFIG.find((mc) => mc.id === m)!
  ).filter(Boolean)

  return (
    <div className="min-h-screen">
      {/* ── Backdrop Header ────────────────────────────────────────────── */}
      <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${TMDB_BACKDROP_BASE}${movie.posterPath})`,
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f13] via-[#0f0f13]/60 to-black/40" />
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-48 relative pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="relative w-48 sm:w-56 md:w-64 rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={getPosterUrl(movie.posterPath)}
                alt={movie.title}
                width={256}
                height={384}
                className="w-full object-cover"
                priority
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-2">
            <div className="flex flex-wrap items-start gap-2 mb-2">
              {movie.isHiddenGem && (
                <span className="badge bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  💎 Hidden Gem
                </span>
              )}
              {moodConfigs.slice(0, 2).map((mc) => (
                <span
                  key={mc.id}
                  className="badge bg-violet-600/20 text-violet-300 border border-violet-500/30"
                >
                  {mc.emoji} {mc.label}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-4">
              <span className="text-yellow-400 font-semibold">★ {movie.rating.toFixed(1)}</span>
              <span>·</span>
              <span>{movie.year}</span>
              <span>·</span>
              <span>{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
              <span>·</span>
              <span>{movie.genres.join(', ')}</span>
            </div>

            <p className="text-gray-300 leading-relaxed mb-6 max-w-2xl">
              {movie.synopsis}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
              <WatchlistButton movieId={movie.id} size="lg" />
              <a
                href={`https://www.youtube.com/watch?v=${movie.trailerKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Trailer
              </a>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
              <div>
                <span className="text-gray-500">Director</span>
                <p className="text-white">{movie.director}</p>
              </div>
              <div>
                <span className="text-gray-500">Cast</span>
                <p className="text-white">{movie.cast.slice(0, 3).join(', ')}</p>
              </div>
              <div>
                <span className="text-gray-500">Language</span>
                <p className="text-white capitalize">{movie.language === 'en' ? 'English' : movie.language}</p>
              </div>
              <div>
                <span className="text-gray-500">Vote Count</span>
                <p className="text-white">{movie.voteCount.toLocaleString()} votes</p>
              </div>
            </div>

            {/* Platforms */}
            {movie.platforms.length > 0 && (
              <div>
                <span className="text-gray-500 text-sm">Available on</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {movie.platforms.map((p) => (
                    <span key={p} className="badge bg-[#2a2a3a] text-gray-300 border border-[#3a3a4a]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Trailer Section ───────────────────────────────────────────── */}
        <div className="mt-10">
          <h2 className="section-title mb-4">Trailer</h2>
          <div className="max-w-2xl">
            <TrailerPlayer
              trailerKey={movie.trailerKey}
              movieId={movie.id}
              movieTitle={movie.title}
              posterPath={movie.posterPath}
            />
          </div>
        </div>

        {/* ── "Why This?" Section ───────────────────────────────────────── */}
        <div className="mt-10 card p-6 bg-violet-900/10 border-violet-500/20">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            💡 Why people love this film
          </h2>
          <ul className="space-y-2">
            {moodConfigs.map((mc) => (
              <li key={mc.id} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-violet-400 mt-0.5">→</span>
                <span>Perfect for a <strong>{mc.label}</strong> mood — {mc.description}</span>
              </li>
            ))}
            <li className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-violet-400 mt-0.5">→</span>
              <span>
                {movie.rating >= 8.5
                  ? `Critically acclaimed masterpiece rated ${movie.rating}/10`
                  : `Highly rated at ${movie.rating}/10 with ${movie.voteCount.toLocaleString()} votes`}
              </span>
            </li>
            {movie.isHiddenGem && (
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-violet-400 mt-0.5">→</span>
                <span>A hidden gem — loved by those who've found it, rarely talked about</span>
              </li>
            )}
          </ul>
        </div>

        {/* ── Similar Movies ────────────────────────────────────────────── */}
        {similar.length > 0 && (
          <div className="mt-10">
            <h2 className="section-title mb-4">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {similar.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
