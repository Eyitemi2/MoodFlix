'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import type { MoodType, UserHistory } from '@/types'
import {
  loadUserHistory,
  recordMoodSelection,
  recordInteraction,
  buildPersonalizationProfile,
  getMoodInsights,
  type MoodInsight,
} from '@/lib/personalization'

interface PersonalizationContextValue {
  history: UserHistory
  insights: MoodInsight
  trackMood: (mood: MoodType) => void
  trackView: (movieId: number) => void
  trackTrailerPlay: (movieId: number) => void
  refresh: () => void
}

const PersonalizationContext = createContext<PersonalizationContextValue | null>(null)

export function PersonalizationProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<UserHistory>({
    moodHistory: [],
    interactions: [],
    watchlist: [],
    ratedMovies: [],
  })
  const [insights, setInsights] = useState<MoodInsight>({
    dominantMood: null,
    moodStreak: null,
    moodStreakCount: 0,
    recentMoods: [],
    suggestion: 'Start exploring to get personalized insights!',
  })

  const refresh = useCallback(() => {
    const loaded = loadUserHistory()
    setHistory(loaded)
    setInsights(getMoodInsights(loaded))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const trackMood = useCallback(
    (mood: MoodType) => {
      recordMoodSelection(mood)
      refresh()
    },
    [refresh]
  )

  const trackView = useCallback((movieId: number) => {
    recordInteraction(movieId, 'view')
  }, [])

  const trackTrailerPlay = useCallback((movieId: number) => {
    recordInteraction(movieId, 'trailer_play')
  }, [])

  return (
    <PersonalizationContext.Provider
      value={{
        history,
        insights,
        trackMood,
        trackView,
        trackTrailerPlay,
        refresh,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  )
}

export function usePersonalization(): PersonalizationContextValue {
  const ctx = useContext(PersonalizationContext)
  if (!ctx) {
    throw new Error('usePersonalization must be used inside PersonalizationProvider')
  }
  return ctx
}
