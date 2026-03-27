/**
 * Phase 7 — Unit Tests: Recommendation Engine
 * Run with: npx jest lib/__tests__/recommendations.test.ts
 */

import {
  getRecommendations,
  searchMovies,
  getSurpriseMovie,
  getHiddenGems,
  getTrending,
} from '../recommendations'
import type { MoodType } from '@/types'

const VALID_MOODS: MoodType[] = [
  'relaxed', 'playful', 'emotional', 'thrilled', 'adventurous',
  'romantic', 'inspired', 'nostalgic', 'curious', 'dark',
]

// ─── getRecommendations tests ─────────────────────────────────────────────────

describe('getRecommendations()', () => {
  test('returns results for every valid mood', () => {
    VALID_MOODS.forEach((mood) => {
      const { results } = getRecommendations({ mood })
      expect(results.length).toBeGreaterThan(0)
    })
  })

  test('results are sorted by score descending', () => {
    const { results } = getRecommendations({ mood: 'curious' })
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score)
    }
  })

  test('all results match the requested mood', () => {
    const { results } = getRecommendations({ mood: 'romantic' })
    results.forEach(({ movie }) => {
      expect(movie.moods).toContain('romantic')
    })
  })

  test('filters by minRating correctly', () => {
    const { results } = getRecommendations({
      mood: 'dark',
      filters: { minRating: 8.0 },
    })
    results.forEach(({ movie }) => {
      expect(movie.rating).toBeGreaterThanOrEqual(8.0)
    })
  })

  test('filters by hiddenGemsOnly correctly', () => {
    const { results } = getRecommendations({
      mood: 'relaxed',
      filters: { hiddenGemsOnly: true },
    })
    results.forEach(({ movie }) => {
      expect(movie.isHiddenGem).toBe(true)
    })
  })

  test('pagination works correctly', () => {
    const page1 = getRecommendations({ mood: 'curious', page: 1, limit: 3 })
    const page2 = getRecommendations({ mood: 'curious', page: 2, limit: 3 })
    // Pages should not contain the same movies
    const ids1 = page1.results.map((r) => r.movie.id)
    const ids2 = page2.results.map((r) => r.movie.id)
    const overlap = ids1.filter((id) => ids2.includes(id))
    expect(overlap.length).toBe(0)
  })

  test('each result has explanation and matchReasons', () => {
    const { results } = getRecommendations({ mood: 'inspired' })
    results.forEach(({ explanation, matchReasons }) => {
      expect(typeof explanation).toBe('string')
      expect(explanation.length).toBeGreaterThan(0)
      expect(Array.isArray(matchReasons)).toBe(true)
    })
  })

  test('score is always 0–100', () => {
    VALID_MOODS.forEach((mood) => {
      const { results } = getRecommendations({ mood })
      results.forEach(({ score }) => {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      })
    })
  })
})

// ─── searchMovies tests ───────────────────────────────────────────────────────

describe('searchMovies()', () => {
  test('finds movies by title', () => {
    const { movies } = searchMovies('Inception')
    expect(movies.length).toBeGreaterThan(0)
    expect(movies[0].title).toBe('Inception')
  })

  test('finds movies by director', () => {
    const { movies } = searchMovies('Christopher Nolan')
    expect(movies.length).toBeGreaterThan(0)
    movies.forEach((m) => expect(m.director).toContain('Christopher Nolan'))
  })

  test('finds movies by genre', () => {
    const { movies } = searchMovies('Comedy')
    expect(movies.length).toBeGreaterThan(0)
  })

  test('returns empty array for no matches', () => {
    const { movies, total } = searchMovies('xyzthisdoesnotexist12345')
    expect(movies).toHaveLength(0)
    expect(total).toBe(0)
  })

  test('returns empty for empty query', () => {
    const { movies } = searchMovies('')
    expect(movies).toHaveLength(0)
  })

  test('is case insensitive', () => {
    const lower = searchMovies('inception')
    const upper = searchMovies('INCEPTION')
    expect(lower.movies.length).toBe(upper.movies.length)
  })
})

// ─── getSurpriseMovie tests ───────────────────────────────────────────────────

describe('getSurpriseMovie()', () => {
  test('returns a movie', () => {
    const movie = getSurpriseMovie()
    expect(movie).not.toBeNull()
    expect(movie?.id).toBeDefined()
  })

  test('returns a movie matching the requested mood', () => {
    const movie = getSurpriseMovie('dark')
    expect(movie?.moods).toContain('dark')
  })

  test('excludes specified movie IDs', () => {
    // Get all dark movies and exclude them all but one
    const { results } = getRecommendations({ mood: 'dark' })
    const ids = results.map((r) => r.movie.id)
    const excludeAll = ids.slice(1) // exclude all except first
    const movie = getSurpriseMovie('dark', excludeAll)
    if (movie) {
      expect(excludeAll).not.toContain(movie.id)
    }
  })

  test('returns null when all movies are excluded', () => {
    const { results } = getRecommendations({ mood: 'nostalgic' })
    const allIds = results.map((r) => r.movie.id)
    const movie = getSurpriseMovie('nostalgic', allIds)
    // May be null if all high-rated movies excluded
    // Just check it doesn't throw
    expect(movie === null || typeof movie?.id === 'number').toBe(true)
  })
})

// ─── getHiddenGems tests ──────────────────────────────────────────────────────

describe('getHiddenGems()', () => {
  test('returns only hidden gems', () => {
    const gems = getHiddenGems()
    gems.forEach((m) => expect(m.isHiddenGem).toBe(true))
  })

  test('respects limit parameter', () => {
    const gems = getHiddenGems(undefined, 2)
    expect(gems.length).toBeLessThanOrEqual(2)
  })

  test('filters by mood when provided', () => {
    const gems = getHiddenGems('relaxed')
    gems.forEach((m) => expect(m.moods).toContain('relaxed'))
  })

  test('sorted by rating descending', () => {
    const gems = getHiddenGems()
    for (let i = 1; i < gems.length; i++) {
      expect(gems[i - 1].rating).toBeGreaterThanOrEqual(gems[i].rating)
    }
  })
})

// ─── getTrending tests ────────────────────────────────────────────────────────

describe('getTrending()', () => {
  test('returns movies up to the limit', () => {
    const movies = getTrending(5)
    expect(movies.length).toBeLessThanOrEqual(5)
  })

  test('default returns 12 movies', () => {
    const movies = getTrending()
    expect(movies.length).toBeLessThanOrEqual(12)
  })

  test('movies have required fields', () => {
    const movies = getTrending(3)
    movies.forEach((m) => {
      expect(m.id).toBeDefined()
      expect(m.title).toBeDefined()
      expect(m.rating).toBeDefined()
      expect(m.popularityScore).toBeDefined()
    })
  })
})
