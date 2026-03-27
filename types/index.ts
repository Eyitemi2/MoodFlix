// ─── Core Entities ───────────────────────────────────────────────────────────

export type MoodType =
  | 'relaxed'
  | 'playful'
  | 'emotional'
  | 'thrilled'
  | 'adventurous'
  | 'romantic'
  | 'inspired'
  | 'nostalgic'
  | 'curious'
  | 'dark'

export interface MoodConfig {
  id: MoodType
  label: string
  emoji: string
  description: string
  gradient: string
  textColor: string
}

export interface Movie {
  id: number
  title: string
  year: number
  rating: number          // 0–10
  voteCount: number
  duration: number        // minutes
  genres: string[]
  moods: MoodType[]       // primary mood first
  synopsis: string
  posterPath: string      // TMDB path: /abc123.jpg
  trailerKey: string      // YouTube video ID
  cast: string[]
  director: string
  platforms: string[]     // e.g. ['Netflix', 'Prime Video']
  isHiddenGem: boolean
  popularityScore: number // 0–100
  language: string
}

// ─── Recommendation Engine ────────────────────────────────────────────────────

export interface RecommendationResult {
  movie: Movie
  score: number            // 0–100
  explanation: string      // "Why this?" text
  matchReasons: string[]   // Bullet points for the UI
  moodMatchStrength: 'primary' | 'secondary'
}

export interface RecommendationRequest {
  mood: MoodType
  filters?: Filters
  page?: number
  limit?: number
  userId?: string
  includePersonalization?: boolean
}

export interface RecommendationResponse {
  results: RecommendationResult[]
  total: number
  mood: MoodType
  page: number
  hasMore: boolean
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface Filters {
  genres?: string[]
  yearFrom?: number
  yearTo?: number
  minRating?: number
  maxDuration?: number
  platforms?: string[]
  hiddenGemsOnly?: boolean
  includeNonEnglish?: boolean
}

// ─── Watchlist ────────────────────────────────────────────────────────────────

export type WatchStatus = 'to_watch' | 'watched' | 'loved'

export interface WatchlistItem {
  movieId: number
  movie?: Movie
  addedAt: string
  status: WatchStatus
  rating?: number         // 1–5 stars
}

// ─── Personalization ─────────────────────────────────────────────────────────

export type InteractionType =
  | 'view'
  | 'trailer_play'
  | 'watchlist_add'
  | 'watchlist_remove'
  | 'share'
  | 'rate'

export interface UserInteraction {
  movieId: number
  type: InteractionType
  timestamp: string
  value?: number          // for ratings
}

export interface MoodHistoryEntry {
  mood: MoodType
  timestamp: string
}

export interface UserHistory {
  moodHistory: MoodHistoryEntry[]
  interactions: UserInteraction[]
  watchlist: WatchlistItem[]
  ratedMovies: { movieId: number; rating: number }[]
}

export interface PersonalizationData {
  preferredGenres: Record<string, number>   // genre -> weight
  dislikedGenres: Record<string, number>
  moodFrequency: Record<MoodType, number>
  recentlyWatched: number[]                 // movieIds
  avgRating: number
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: string
  code?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResult {
  movies: Movie[]
  total: number
  query: string
  page: number
}
