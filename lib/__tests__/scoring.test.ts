/**
 * Phase 7 — Unit Tests: Scoring Engine
 * Run with: npx jest lib/__tests__/scoring.test.ts
 */

import { scoreMovie, generateExplanation, getMoodMatchStrength } from '../scoring'
import type { Movie } from '@/types'

// ─── Mock movie fixture ───────────────────────────────────────────────────────

const mockMovie: Movie = {
  id: 1,
  title: 'Test Film',
  year: 2022,
  rating: 8.5,
  voteCount: 500000,
  duration: 120,
  genres: ['Drama', 'Thriller'],
  moods: ['curious', 'dark'],
  synopsis: 'A test movie for unit testing.',
  posterPath: '/test.jpg',
  trailerKey: 'abc123',
  cast: ['Actor A', 'Actor B'],
  director: 'Director X',
  platforms: ['Netflix'],
  isHiddenGem: false,
  popularityScore: 80,
  language: 'en',
}

const hiddenGemMovie: Movie = {
  ...mockMovie,
  id: 2,
  isHiddenGem: true,
  popularityScore: 40,
  rating: 7.5,
  moods: ['relaxed'],
}

// ─── scoreMovie tests ─────────────────────────────────────────────────────────

describe('scoreMovie()', () => {
  test('returns 0 when mood does not match', () => {
    const score = scoreMovie(mockMovie, 'romantic')
    expect(score).toBe(0)
  })

  test('primary mood match scores higher than secondary', () => {
    // 'curious' is primary mood for mockMovie
    const primaryScore = scoreMovie(mockMovie, 'curious')
    // 'dark' is secondary
    const secondaryScore = scoreMovie(mockMovie, 'dark')
    expect(primaryScore).toBeGreaterThan(secondaryScore)
  })

  test('score is between 0 and 100', () => {
    const score = scoreMovie(mockMovie, 'curious')
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  test('hidden gem receives bonus points', () => {
    const normalScore = scoreMovie({ ...hiddenGemMovie, isHiddenGem: false }, 'relaxed')
    const gemScore = scoreMovie(hiddenGemMovie, 'relaxed')
    expect(gemScore).toBeGreaterThan(normalScore)
  })

  test('high rating increases score vs low rating', () => {
    const highRated = scoreMovie(mockMovie, 'curious')
    const lowRated = scoreMovie({ ...mockMovie, rating: 5.0 }, 'curious')
    expect(highRated).toBeGreaterThan(lowRated)
  })

  test('recent films score higher on recency component', () => {
    const recentScore = scoreMovie({ ...mockMovie, year: 2025 }, 'curious')
    const oldScore = scoreMovie({ ...mockMovie, year: 1970 }, 'curious')
    expect(recentScore).toBeGreaterThan(oldScore)
  })

  test('returns integer (rounded score)', () => {
    const score = scoreMovie(mockMovie, 'curious')
    expect(Number.isInteger(score)).toBe(true)
  })
})

// ─── getMoodMatchStrength tests ───────────────────────────────────────────────

describe('getMoodMatchStrength()', () => {
  test('returns "primary" when mood is first in moods array', () => {
    const strength = getMoodMatchStrength(mockMovie, 'curious')
    expect(strength).toBe('primary')
  })

  test('returns "secondary" when mood is not first in array', () => {
    const strength = getMoodMatchStrength(mockMovie, 'dark')
    expect(strength).toBe('secondary')
  })
})

// ─── generateExplanation tests ────────────────────────────────────────────────

describe('generateExplanation()', () => {
  test('returns non-empty explanation string', () => {
    const { explanation } = generateExplanation(mockMovie, 'curious', 85)
    expect(typeof explanation).toBe('string')
    expect(explanation.length).toBeGreaterThan(20)
  })

  test('returns array of match reasons', () => {
    const { matchReasons } = generateExplanation(mockMovie, 'curious', 85)
    expect(Array.isArray(matchReasons)).toBe(true)
    expect(matchReasons.length).toBeGreaterThan(0)
    expect(matchReasons.length).toBeLessThanOrEqual(3)
  })

  test('high score generates strong language', () => {
    const { explanation } = generateExplanation(mockMovie, 'curious', 90)
    expect(explanation).toMatch(/exceptional|strong|captures/i)
  })

  test('hidden gem gets a gem mention in reasons', () => {
    const { matchReasons } = generateExplanation(
      { ...mockMovie, isHiddenGem: true },
      'curious',
      75
    )
    const hasGemReason = matchReasons.some((r) =>
      r.toLowerCase().includes('gem') || r.toLowerCase().includes('overlooked')
    )
    expect(hasGemReason).toBe(true)
  })
})
