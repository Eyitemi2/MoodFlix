import type {
  Movie,
  MoodType,
  RecommendationRequest,
  RecommendationResponse,
  Filters,
  UserHistory,
} from '@/types'
import { MOCK_MOVIES } from './mockData'
import { buildRecommendationResult, scoreMovie } from './scoring'

// ─── Main Recommendation Entry Point ─────────────────────────────────────────

export function getRecommendations(
  request: RecommendationRequest
): RecommendationResponse {
  const {
    mood,
    filters,
    page = 1,
    limit = 20,
    userHistory,
  } = request

  // Step 1: Filter by mood
  let candidates = filterByMood(MOCK_MOVIES, mood)

  // Step 2: Apply hard filters
  if (filters) {
    candidates = applyFilters(candidates, filters)
  }

  // Step 3: Score every candidate
  const scored = candidates.map((movie) =>
    buildRecommendationResult(movie, mood, userHistory)
  )

  // Step 4: Sort by score descending
  scored.sort((a, b) => b.score - a.score)

  // Step 5: Paginate
  const total = scored.length
  const startIdx = (page - 1) * limit
  const paginated = scored.slice(startIdx, startIdx + limit)

  return {
    results: paginated,
    total,
    mood,
    page,
    hasMore: startIdx + limit < total,
  }
}

// ─── Layer 1: Mood Filter ─────────────────────────────────────────────────────

function filterByMood(movies: Movie[], mood: MoodType): Movie[] {
  return movies.filter((m) => m.moods.includes(mood))
}

// ─── Layer 2: Hard Filters ────────────────────────────────────────────────────

function applyFilters(movies: Movie[], filters: Filters): Movie[] {
  return movies.filter((movie) => {
    // Genre filter
    if (filters.genres && filters.genres.length > 0) {
      const hasGenre = filters.genres.some((g) =>
        movie.genres.includes(g)
      )
      if (!hasGenre) return false
    }

    // Year range
    if (filters.yearFrom && movie.year < filters.yearFrom) return false
    if (filters.yearTo && movie.year > filters.yearTo) return false

    // Minimum rating
    if (filters.minRating && movie.rating < filters.minRating) return false

    // Max duration
    if (filters.maxDuration && movie.duration > filters.maxDuration) return false

    // Platform filter
    if (filters.platforms && filters.platforms.length > 0) {
      const availableOnPlatform = filters.platforms.some((p) =>
        movie.platforms.includes(p)
      )
      if (!availableOnPlatform) return false
    }

    // Hidden gems only
    if (filters.hiddenGemsOnly && !movie.isHiddenGem) return false

    // Language filter (default: include English + non-English unless filtered)
    if (!filters.includeNonEnglish && movie.language !== 'en') {
      // Still include — great films from all languages
      // Only filter if user specifically wants English-only
    }

    return true
  })
}

// ─── Trending Movies ─────────────────────────────────────────────────────────

export function getTrending(limit = 12): Movie[] {
  return [...MOCK_MOVIES]
    .sort((a, b) => {
      // Sort by a combination of popularity and rating
      const scoreA = a.popularityScore * 0.6 + a.rating * 4
      const scoreB = b.popularityScore * 0.6 + b.rating * 4
      return scoreB - scoreA
    })
    .slice(0, limit)
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function searchMovies(
  query: string,
  page = 1,
  limit = 20
): { movies: Movie[]; total: number; page: number } {
  const q = query.toLowerCase().trim()

  if (!q) {
    return { movies: [], total: 0, page }
  }

  const results = MOCK_MOVIES.filter((movie) => {
    return (
      movie.title.toLowerCase().includes(q) ||
      movie.director.toLowerCase().includes(q) ||
      movie.cast.some((c) => c.toLowerCase().includes(q)) ||
      movie.genres.some((g) => g.toLowerCase().includes(q)) ||
      movie.synopsis.toLowerCase().includes(q) ||
      movie.moods.some((m) => m.toLowerCase().includes(q)) ||
      String(movie.year).includes(q)
    )
  })

  // Sort by relevance: title match first, then popularity
  results.sort((a, b) => {
    const aTitle = a.title.toLowerCase().startsWith(q) ? 1 : 0
    const bTitle = b.title.toLowerCase().startsWith(q) ? 1 : 0
    if (bTitle !== aTitle) return bTitle - aTitle
    return b.popularityScore - a.popularityScore
  })

  const total = results.length
  const startIdx = (page - 1) * limit
  const paginated = results.slice(startIdx, startIdx + limit)

  return { movies: paginated, total, page }
}

// ─── Similar Movies ───────────────────────────────────────────────────────────

export function getSimilarMovies(movieId: number, limit = 6): Movie[] {
  const source = MOCK_MOVIES.find((m) => m.id === movieId)
  if (!source) return []

  return MOCK_MOVIES.filter((m) => m.id !== movieId)
    .map((movie) => {
      // Score similarity: shared moods + shared genres
      const sharedMoods = movie.moods.filter((mood) =>
        source.moods.includes(mood)
      ).length
      const sharedGenres = movie.genres.filter((genre) =>
        source.genres.includes(genre)
      ).length
      const similarityScore = sharedMoods * 3 + sharedGenres * 2 + movie.rating
      return { movie, similarityScore }
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)
    .map((r) => r.movie)
}

// ─── Surprise Me ─────────────────────────────────────────────────────────────

export function getSurpriseMovie(
  mood?: MoodType,
  excludeIds: number[] = []
): Movie | null {
  let pool = mood
    ? MOCK_MOVIES.filter((m) => m.moods.includes(mood))
    : MOCK_MOVIES

  // Exclude already seen/watchlisted
  pool = pool.filter((m) => !excludeIds.includes(m.id))

  // Filter to reasonably good movies
  pool = pool.filter((m) => m.rating >= 7.0)

  if (pool.length === 0) return null

  // Weighted random: higher-rated movies slightly more likely
  const totalWeight = pool.reduce((sum, m) => sum + m.rating, 0)
  let random = Math.random() * totalWeight

  for (const movie of pool) {
    random -= movie.rating
    if (random <= 0) return movie
  }

  return pool[0]
}

// ─── Hidden Gems ──────────────────────────────────────────────────────────────

export function getHiddenGems(mood?: MoodType, limit = 6): Movie[] {
  let gems = MOCK_MOVIES.filter((m) => m.isHiddenGem)
  if (mood) {
    gems = gems.filter((m) => m.moods.includes(mood))
  }
  return gems
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit)
}
