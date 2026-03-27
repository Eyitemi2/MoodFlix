'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import type { WatchlistItem, WatchStatus } from '@/types'
import {
  loadUserHistory,
  addToWatchlist,
  removeFromWatchlist,
  updateWatchlistStatus,
  isInWatchlist,
  getWatchlistWithMovies,
} from '@/lib/personalization'

interface WatchlistContextValue {
  watchlist: WatchlistItem[]
  isInList: (movieId: number) => boolean
  add: (movieId: number) => void
  remove: (movieId: number) => void
  updateStatus: (movieId: number, status: WatchStatus, rating?: number) => void
  count: number
  refresh: () => void
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])

  const refresh = useCallback(() => {
    const history = loadUserHistory()
    setWatchlist(history.watchlist)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isInList = useCallback(
    (movieId: number) => isInWatchlist(movieId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [watchlist]
  )

  const add = useCallback(
    (movieId: number) => {
      addToWatchlist(movieId)
      refresh()
    },
    [refresh]
  )

  const remove = useCallback(
    (movieId: number) => {
      removeFromWatchlist(movieId)
      refresh()
    },
    [refresh]
  )

  const updateStatus = useCallback(
    (movieId: number, status: WatchStatus, rating?: number) => {
      updateWatchlistStatus(movieId, status, rating)
      refresh()
    },
    [refresh]
  )

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        isInList,
        add,
        remove,
        updateStatus,
        count: watchlist.length,
        refresh,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist(): WatchlistContextValue {
  const ctx = useContext(WatchlistContext)
  if (!ctx) {
    throw new Error('useWatchlist must be used inside WatchlistProvider')
  }
  return ctx
}
