'use client'

import React, { useState, useEffect } from 'react'
import { getYouTubeEmbedUrl } from '@/lib/mockData'
import { usePersonalization } from '@/context/PersonalizationContext'

interface TrailerPlayerProps {
  trailerKey: string
  movieId: number
  movieTitle: string
  posterPath?: string
}

export function TrailerPlayer({
  trailerKey,
  movieId,
  movieTitle,
  posterPath,
}: TrailerPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const { trackTrailerPlay } = usePersonalization()
  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/original${posterPath}`
    : null

  const handlePlay = () => {
    setPlaying(true)
    trackTrailerPlay(movieId)
  }

  // Close player on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPlaying(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!trailerKey) {
    return (
      <div className="aspect-video bg-[#1a1a24] rounded-xl flex items-center justify-center">
        <p className="text-gray-500 text-sm">Trailer not available</p>
      </div>
    )
  }

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
      {playing ? (
        <>
          <iframe
            src={getYouTubeEmbedUrl(trailerKey)}
            title={`${movieTitle} - Official Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
          {/* Close button */}
          <button
            onClick={() => setPlaying(false)}
            className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors z-10"
            aria-label="Close trailer"
          >
            ×
          </button>
        </>
      ) : (
        <>
          {/* Thumbnail */}
          {posterUrl ? (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${posterUrl})` }}
            />
          ) : (
            <div
              className="w-full h-full bg-cover bg-center bg-gray-800"
            />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Play button */}
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 group"
            aria-label={`Play ${movieTitle} trailer`}
          >
            <div className="w-16 h-16 bg-white/20 hover:bg-violet-600 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110 backdrop-blur-sm border-2 border-white/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="w-7 h-7 ml-1"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              Watch Trailer
            </span>
          </button>
        </>
      )}
    </div>
  )
}

// ─── Inline Modal Trailer ─────────────────────────────────────────────────────

interface TrailerModalProps {
  trailerKey: string
  movieId: number
  movieTitle: string
  onClose: () => void
}

export function TrailerModal({
  trailerKey,
  movieId,
  movieTitle,
  onClose,
}: TrailerModalProps) {
  const { trackTrailerPlay } = usePersonalization()

  useEffect(() => {
    trackTrailerPlay(movieId)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [movieId, onClose, trackTrailerPlay])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-semibold">{movieTitle} — Official Trailer</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="aspect-video rounded-xl overflow-hidden">
          <iframe
            src={getYouTubeEmbedUrl(trailerKey)}
            title={`${movieTitle} - Official Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}
