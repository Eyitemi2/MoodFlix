/**
 * Phase 5 — Personalization & Intelligence
 *
 * This module manages user behavior tracking and builds a personalization
 * profile to improve recommendation quality over time.
 *
 * In MVP: data is stored in localStorage (no auth required)
 * In V1:  data syncs to PostgreSQL via /api/user/history
 */

import type {
  UserHistory,
  MoodType,
  InteractionType,
  WatchStatus,
  PersonalizationData,
  MoodHistoryEntry,
  UserInteraction,
  WatchlistItem,
} from '@/types'
import { MOCK_MOVIES } from './mockData'

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  MOOD_HISTORY: 'moodflix_mood_history',
  INTERACTIONS: 'moodflix_interactions',
  WATCHLIST: 'moodflix_watchlist',
  RATED_MOVIES: 'moodflix_rated_movies',
} as const

// ─── Read/Write UserHistory from localStorage ─────────────────────────────────

export function loadUserHistory(): UserHistory {
  if (typeof window === 'undefined') {
    return emptyHistory()
  }

  try {
    const moodHistory: MoodHistoryEntry[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.MOOD_HISTORY) || '[]'
    )
    const interactions: UserInteraction[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.INTERACTIONS) || '[]'
    )
    const watchlist: WatchlistItem[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]'
    )
    const ratedMovies: { movieId: number; rating: number }[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.RATED_MOVIES) || '[]'
    )

    return { moodHistory, interactions, watchlist, ratedMovies }
  } catch {
    return emptyHistory()
  }
}

function emptyHistory(): UserHistory {
  return {
    moodHistory: [],
    interactions: [],
    watchlist: [],
    ratedMovies: [],
  }
}

// ─── Record Mood Selection ────────────────────────────────────────────────────

export function recordMoodSelection(mood: MoodType): void {
  if (typeof window === 'undefined') return

  const history = loadUserHistory()
  const entry: MoodHistoryEntry = {
    mood,
    timestamp: new Date().toISOString(),
  }

  // Keep last 50 mood entries
  const updated = [entry, ...history.moodHistory].slice(0, 50)
  localStorage.setItem(STORAGE_KEYS.MOOD_HISTORY, JSON.stringify(updated))
}

// ─── Record Interaction ───────────────────────────────────────────────────────

export function recordInteraction(
  movieId: number,
  type: InteractionType,
  value?: number
): void {
  if (typeof window === 'undefined') return

  const history = loadUserHistory()
  const interaction: UserInteraction = {
    movieId,
    type,
    timestamp: new Date().toISOString(),
    value,
  }

  // Keep last 200 interactions
  const updated = [interaction, ...history.interactions].slice(0, 200)
  localStorage.setItem(STORAGE_KEYS.INTERACTIONS, JSON.stringify(updated))
}

// ─── Watchlist Operations ──────────────────────────────────────────────────────

export function addToWatchlist(movieId: number): WatchlistItem {
  const history = loadUserHistory()
  const existing = history.watchlist.find((w) => w.movieId === movieId)

  if (existing) return existing

  const item: WatchlistItem = {
    movieId,
    addedAt: new Date().toISOString(),
    status: 'to_watch',
  }

  const updated = [item, ...history.watchlist]
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(updated))

  recordInteraction(movieId, 'watchlist_add')

  return item
}

export function removeFromWatchlist(movieId: number): void {
  const history = loadUserHistory()
  const updated = history.watchlist.filter((w) => w.movieId !== movieId)
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(updated))
  recordInteraction(movieId, 'watchlist_remove')
}

export function updateWatchlistStatus(
  movieId: number,
  status: WatchStatus,
  rating?: number
): void {
  const history = loadUserHistory()
  const updated = history.watchlist.map((w) =>
    w.movieId === movieId ? { ...w, status, rating } : w
  )
  localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(updated))

  if (rating !== undefined) {
    rateMovie(movieId, rating)
  }
}

export function isInWatchlist(movieId: number): boolean {
  const history = loadUserHistory()
  return history.watchlist.some((w) => w.movieId === movieId)
}

export function getWatchlistWithMovies(): (WatchlistItem & {
  movie?: ReturnType<typeof MOCK_MOVIES.find>
})[] {
  const history = loadUserHistory()
  return history.watchlist.map((item) => ({
    ...item,
    movie: MOCK_MOVIES.find((m) => m.id === item.movieId),
  }))
}

// ─── Rating ───────────────────────────────────────────────────────────────────

export function rateMovie(movieId: number, rating: number): void {
  if (typeof window === 'undefined') return

  const stored: { movieId: number; rating: number }[] = JSON.parse(
    localStorage.getItem(STORAGE_KEYS.RATED_MOVIES) || '[]'
  )

  const filtered = stored.filter((r) => r.movieId !== movieId)
  const updated = [{ movieId, rating }, ...filtered]
  localStorage.setItem(STORAGE_KEYS.RATED_MOVIES, JSON.stringify(updated))

  recordInteraction(movieId, 'rate', rating)
}

// ─── Build Personalization Profile ────────────────────────────────────────────

export function buildPersonalizationProfile(
  history: UserHistory
): PersonalizationData {
  // 1. Genre preferences from ratings
  const preferredGenres: Record<string, number> = {}
  const dislikedGenres: Record<string, number> = {}

  history.ratedMovies.forEach(({ movieId, rating }) => {
    const movie = MOCK_MOVIES.find((m) => m.id === movieId)
    if (!movie) return

    movie.genres.forEach((genre) => {
      if (rating >= 4) {
        preferredGenres[genre] = (preferredGenres[genre] ?? 0) + (rating - 3)
      } else if (rating <= 2) {
        dislikedGenres[genre] = (dislikedGenres[genre] ?? 0) + (3 - rating)
      }
    })
  })

  // 2. Mood frequency from mood history
  const moodFrequency = {} as Record<MoodType, number>
  history.moodHistory.forEach(({ mood }) => {
    moodFrequency[mood] = (moodFrequency[mood] ?? 0) + 1
  })

  // 3. Recently watched (last 14 days)
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const recentlyWatched = history.watchlist
    .filter(
      (w) =>
        w.status === 'watched' && new Date(w.addedAt) > twoWeeksAgo
    )
    .map((w) => w.movieId)

  // 4. Average rating
  const avgRating =
    history.ratedMovies.length > 0
      ? history.ratedMovies.reduce((sum, r) => sum + r.rating, 0) /
        history.ratedMovies.length
      : 3

  return {
    preferredGenres,
    dislikedGenres,
    moodFrequency,
    recentlyWatched,
    avgRating,
  }
}

// ─── Mood Insights ────────────────────────────────────────────────────────────

export interface MoodInsight {
  dominantMood: MoodType | null
  moodStreak: MoodType | null
  moodStreakCount: number
  recentMoods: MoodType[]
  suggestion: string
}

export function getMoodInsights(history: UserHistory): MoodInsight {
  if (history.moodHistory.length === 0) {
    return {
      dominantMood: null,
      moodStreak: null,
      moodStreakCount: 0,
      recentMoods: [],
      suggestion: "Start exploring to get personalized insights!",
    }
  }

  const recent = history.moodHistory.slice(0, 10)
  const recentMoods = recent.map((h) => h.mood)

  // Find dominant mood (last 30 entries)
  const moodCounts: Record<string, number> = {}
  history.moodHistory.slice(0, 30).forEach(({ mood }) => {
    moodCounts[mood] = (moodCounts[mood] ?? 0) + 1
  })
  const dominantMood = Object.entries(moodCounts).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] as MoodType | null

  // Find current streak (same mood multiple times in a row)
  let moodStreak: MoodType | null = null
  let moodStreakCount = 0
  if (recent.length >= 2) {
    const lastMood = recent[0].mood
    let streak = 1
    for (let i = 1; i < recent.length; i++) {
      if (recent[i].mood === lastMood) streak++
      else break
    }
    if (streak >= 2) {
      moodStreak = lastMood
      moodStreakCount = streak
    }
  }

  // Personalized suggestion
  let suggestion = ''
  if (moodStreak && moodStreakCount >= 3) {
    const moodLabels: Record<string, string> = {
      dark: 'dark', emotional: 'emotional', thrilled: 'thrilled',
    }
    if (moodLabels[moodStreak]) {
      suggestion = `You've been in a ${moodStreak} mood lately — maybe try something ${moodStreak === 'dark' ? 'lighter' : 'uplifting'} for a change?`
    }
  } else if (dominantMood) {
    suggestion = `Your go-to mood has been "${dominantMood}" — we've got more great picks lined up.`
  }

  return {
    dominantMood,
    moodStreak,
    moodStreakCount,
    recentMoods,
    suggestion,
  }
}
