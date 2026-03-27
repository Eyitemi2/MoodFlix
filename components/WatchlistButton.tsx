'use client'

import React from 'react'
import { useWatchlist } from '@/context/WatchlistContext'

interface WatchlistButtonProps {
  movieId: number
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function WatchlistButton({
  movieId,
  iconOnly = false,
  size = 'md',
  className = '',
}: WatchlistButtonProps) {
  const { isInList, add, remove } = useWatchlist()
  const inList = isInList(movieId)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inList) {
      remove(movieId)
    } else {
      add(movieId)
    }
  }

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  }

  const iconSize = iconSizes[size]

  return (
    <button
      onClick={handleClick}
      title={inList ? 'Remove from watchlist' : 'Add to watchlist'}
      aria-label={inList ? 'Remove from watchlist' : 'Add to watchlist'}
      className={`
        flex items-center gap-2 rounded-lg font-medium transition-all duration-200 active:scale-95
        ${
          iconOnly
            ? `bg-black/60 hover:bg-black/80 ${sizeClasses[size]}`
            : inList
            ? `bg-violet-600 hover:bg-violet-500 text-white ${sizeClasses[size]}`
            : `bg-[#2a2a3a] hover:bg-violet-600 text-gray-300 hover:text-white ${sizeClasses[size]}`
        }
        ${className}
      `}
    >
      {inList ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={iconSize}
          height={iconSize}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          />
        </svg>
      )}
      {!iconOnly && (
        <span>{inList ? 'In Watchlist' : 'Add to Watchlist'}</span>
      )}
    </button>
  )
}
