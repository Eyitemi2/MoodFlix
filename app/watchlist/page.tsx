'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { WatchStatus, WatchlistItem } from '@/types'
import { MOCK_MOVIES, getPosterUrl } from '@/lib/mockData'
import { useWatchlist } from '@/context/WatchlistContext'

const TABS: { label: string; value: WatchStatus | 'all'; emoji: string }[] = [
  { label: 'All', value: 'all', emoji: '📋' },
  { label: 'To Watch', value: 'to_watch', emoji: '🎬' },
  { label: 'Watched', value: 'watched', emoji: '✅' },
  { label: 'Loved It', value: 'loved', emoji: '❤️' },
]

const STAR_RATINGS = [1, 2, 3, 4, 5]

export default function WatchlistPage() {
  const { watchlist, remove, updateStatus, count } = useWatchlist()
  const [activeTab, setActiveTab] = useState<WatchStatus | 'all'>('all')

  const filteredItems =
    activeTab === 'all'
      ? watchlist
      : watchlist.filter((w) => w.status === activeTab)

  const itemsWithMovies = filteredItems
    .map((item) => ({
      ...item,
      movie: MOCK_MOVIES.find((m) => m.id === item.movieId),
    }))
    .filter((item) => item.movie)

  const tabCounts = {
    all: watchlist.length,
    to_watch: watchlist.filter((w) => w.status === 'to_watch').length,
    watched: watchlist.filter((w) => w.status === 'watched').length,
    loved: watchlist.filter((w) => w.status === 'loved').length,
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">My Watchlist</h1>
        <p className="text-gray-400">{count} title{count !== 1 ? 's' : ''} saved</p>
      </div>

      {watchlist.length === 0 ? (
        /* Empty State */
        <div className="text-center py-24">
          <p className="text-6xl mb-4">📋</p>
          <h2 className="text-xl font-semibold text-white mb-2">Your watchlist is empty</h2>
          <p className="text-gray-400 mb-8">
            Start discovering films and save the ones you want to watch.
          </p>
          <Link href="/recommendations" className="btn-primary">
            Discover Films
          </Link>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.value
                    ? 'bg-violet-600 text-white'
                    : 'bg-[#1a1a24] text-gray-400 hover:text-white border border-[#2a2a3a]'
                }`}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
                <span
                  className={`ml-1 text-xs rounded-full px-1.5 ${
                    activeTab === tab.value ? 'bg-white/20' : 'bg-[#2a2a3a]'
                  }`}
                >
                  {tabCounts[tab.value]}
                </span>
              </button>
            ))}
          </div>

          {/* Items List */}
          {itemsWithMovies.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p>No items in this category yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {itemsWithMovies.map(({ movie, ...item }) => (
                <WatchlistItemRow
                  key={item.movieId}
                  item={item as WatchlistItem}
                  movie={movie!}
                  onRemove={() => remove(item.movieId)}
                  onStatusChange={(status, rating) =>
                    updateStatus(item.movieId, status, rating)
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Watchlist Item Row ───────────────────────────────────────────────────────

interface WatchlistItemRowProps {
  item: WatchlistItem
  movie: (typeof MOCK_MOVIES)[0]
  onRemove: () => void
  onStatusChange: (status: WatchStatus, rating?: number) => void
}

function WatchlistItemRow({ item, movie, onRemove, onStatusChange }: WatchlistItemRowProps) {
  const [showRating, setShowRating] = useState(false)
  const addedDate = new Date(item.addedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const statusConfig: Record<WatchStatus, { label: string; color: string; emoji: string }> = {
    to_watch: { label: 'To Watch', color: 'text-blue-400', emoji: '🎬' },
    watched: { label: 'Watched', color: 'text-green-400', emoji: '✅' },
    loved: { label: 'Loved It', color: 'text-pink-400', emoji: '❤️' },
  }

  const sc = statusConfig[item.status]

  return (
    <div className="card p-4 flex gap-4 group">
      {/* Poster */}
      <Link href={`/movie/${movie.id}`} className="flex-shrink-0">
        <div className="relative w-16 h-24 rounded-lg overflow-hidden">
          <Image
            src={getPosterUrl(movie.posterPath)}
            alt={movie.title}
            fill
            className="object-cover"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/movie/${movie.id}`}>
              <h3 className="text-white font-semibold hover:text-violet-400 transition-colors">
                {movie.title}
              </h3>
            </Link>
            <p className="text-gray-500 text-sm">{movie.year} · {movie.genres[0]}</p>
          </div>

          {/* Remove button */}
          <button
            onClick={onRemove}
            className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xl leading-none flex-shrink-0"
            aria-label="Remove from watchlist"
          >
            ×
          </button>
        </div>

        {/* Status + Controls */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Status badge */}
          <span className={`text-xs font-medium ${sc.color}`}>
            {sc.emoji} {sc.label}
          </span>

          <span className="text-gray-600 text-xs">· Added {addedDate}</span>

          {/* Status actions */}
          <div className="flex gap-2 ml-auto">
            {item.status !== 'watched' && item.status !== 'loved' && (
              <button
                onClick={() => { onStatusChange('watched'); setShowRating(true) }}
                className="text-xs px-3 py-1 bg-[#2a2a3a] hover:bg-green-600 text-gray-400 hover:text-white rounded-full transition-colors"
              >
                Mark Watched
              </button>
            )}
            {item.status === 'watched' && !showRating && (
              <button
                onClick={() => { onStatusChange('loved') }}
                className="text-xs px-3 py-1 bg-[#2a2a3a] hover:bg-pink-600 text-gray-400 hover:text-white rounded-full transition-colors"
              >
                Loved It ❤️
              </button>
            )}
          </div>
        </div>

        {/* Star Rating */}
        {(showRating || item.rating) && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-gray-500 mr-1">Rate:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => { onStatusChange('watched', star); setShowRating(false) }}
                className={`text-lg transition-transform hover:scale-125 ${
                  (item.rating ?? 0) >= star ? 'text-yellow-400' : 'text-gray-600'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
