import type { Movie, MoodType, RecommendationResult, UserHistory } from '@/types'
import { MOOD_CONFIG } from './mockData'

// ─── Scoring Weights ──────────────────────────────────────────────────────────

const WEIGHTS = {
  MOOD_PRIMARY: 40,     // Movie's first mood matches exactly
  MOOD_SECONDARY: 25,   // Mood is in movie's list (not primary)
  RATING: 25,           // Normalized IMDb-style rating
  POPULARITY: 20,       // Popularity score (0-100)
  RECENCY: 10,          // Recent films get a slight bonus
  HIDDEN_GEM_BONUS: 5,  // Flat bonus for hidden gems
} as const

// ─── Score a single movie ─────────────────────────────────────────────────────

export function scoreMovie(
  movie: Movie,
  mood: MoodType,
  userHistory?: UserHistory
): number {
  let score = 0

  // 1. Mood match component (0–40 pts)
  const primaryMood = movie.moods[0]
  if (primaryMood === mood) {
    score += WEIGHTS.MOOD_PRIMARY
  } else if (movie.moods.includes(mood)) {
    score += WEIGHTS.MOOD_SECONDARY
  } else {
    return 0 // Movie doesn't match mood at all
  }

  // 2. Rating component (0–25 pts)
  // Normalize rating from 0-10 scale to 0-25
  const ratingScore = (movie.rating / 10) * WEIGHTS.RATING
  score += ratingScore

  // 3. Popularity component (0–20 pts)
  // Normalize popularity from 0-100 to 0-20
  const popularityScore = (movie.popularityScore / 100) * WEIGHTS.POPULARITY
  score += popularityScore

  // 4. Recency component (0–10 pts)
  const currentYear = new Date().getFullYear()
  const ageInYears = currentYear - movie.year
  let recencyScore = 0
  if (ageInYears <= 2) recencyScore = WEIGHTS.RECENCY
  else if (ageInYears <= 5) recencyScore = WEIGHTS.RECENCY * 0.8
  else if (ageInYears <= 10) recencyScore = WEIGHTS.RECENCY * 0.5
  else if (ageInYears <= 20) recencyScore = WEIGHTS.RECENCY * 0.3
  else recencyScore = WEIGHTS.RECENCY * 0.1
  score += recencyScore

  // 5. Hidden gem bonus (+5 flat)
  if (movie.isHiddenGem) {
    score += WEIGHTS.HIDDEN_GEM_BONUS
  }

  // 6. Personalization adjustments (if user history available)
  if (userHistory) {
    score += applyPersonalizationAdjustments(movie, userHistory)
  }

  // Cap at 100
  return Math.min(100, Math.round(score))
}

// ─── Personalization score adjustments ────────────────────────────────────────

function applyPersonalizationAdjustments(
  movie: Movie,
  history: UserHistory
): number {
  let adjustment = 0

  // Boost genres the user has liked
  const ratedMovieIds = history.ratedMovies.map((r) => r.movieId)
  const avgUserRating =
    history.ratedMovies.length > 0
      ? history.ratedMovies.reduce((sum, r) => sum + r.rating, 0) /
        history.ratedMovies.length
      : 3

  // Check if user has liked similar genre movies
  if (history.ratedMovies.length > 0) {
    const highRatedMovies = history.ratedMovies.filter((r) => r.rating >= 4)
    // +3 for genre affinity (simplified — a full implementation would cross-reference genres)
    if (highRatedMovies.length > 0) {
      adjustment += 3
    }
  }

  // Penalize recently watched
  const recentlyWatched = history.watchlist
    .filter((w) => w.status === 'watched')
    .map((w) => w.movieId)

  if (recentlyWatched.includes(movie.id)) {
    adjustment -= 20 // Strong penalty to avoid re-recommending watched content
  }

  // Penalize movies already in watchlist (user knows about them)
  const watchlistIds = history.watchlist.map((w) => w.movieId)
  if (watchlistIds.includes(movie.id)) {
    adjustment -= 10
  }

  return adjustment
}

// ─── Generate "Why This?" explanation ────────────────────────────────────────

export function generateExplanation(
  movie: Movie,
  mood: MoodType,
  score: number
): { explanation: string; matchReasons: string[] } {
  const moodConfig = MOOD_CONFIG.find((m) => m.id === mood)
  const moodLabel = moodConfig?.label ?? mood
  const isPrimary = movie.moods[0] === mood
  const reasons: string[] = []

  // Mood match reason
  if (isPrimary) {
    reasons.push(
      `Perfectly matched to your ${moodLabel.toLowerCase()} mood as its primary vibe`
    )
  } else {
    reasons.push(
      `Strong ${moodLabel.toLowerCase()} elements alongside its other themes`
    )
  }

  // Rating reason
  if (movie.rating >= 8.5) {
    reasons.push(`Critically acclaimed with a ${movie.rating}/10 rating`)
  } else if (movie.rating >= 7.5) {
    reasons.push(`Highly rated at ${movie.rating}/10 by viewers worldwide`)
  } else if (movie.rating >= 7.0) {
    reasons.push(`Well-received with a solid ${movie.rating}/10 score`)
  }

  // Hidden gem reason
  if (movie.isHiddenGem) {
    reasons.push(`A hidden gem — beloved by those who've seen it, but often overlooked`)
  }

  // Director/quality reason
  const notableDirectors = [
    'Christopher Nolan', 'Steven Spielberg', 'Wes Anderson', 'David Fincher',
    'Denis Villeneuve', 'Bong Joon-ho', 'Darren Aronofsky', 'Damien Chazelle',
    'Alejandro González Iñárritu', 'Richard Linklater',
  ]
  if (notableDirectors.includes(movie.director)) {
    reasons.push(`Directed by acclaimed filmmaker ${movie.director}`)
  }

  // Genre interest reason
  const genreDescriptions: Record<string, string> = {
    Drama: 'a compelling drama with depth and substance',
    Thriller: 'a gripping thriller to keep you on edge',
    Comedy: 'a feel-good comedy to lift your spirits',
    'Science Fiction': 'mind-expanding sci-fi with big ideas',
    Romance: 'a heartfelt romance story',
    Horror: 'a well-crafted horror experience',
    Action: 'high-energy action sequences',
    Animation: 'beautifully crafted animation',
    Biography: 'an inspiring true story',
    Mystery: 'a satisfying mystery to unravel',
  }

  const primaryGenre = movie.genres[0]
  if (genreDescriptions[primaryGenre]) {
    reasons.push(`Features ${genreDescriptions[primaryGenre]}`)
  }

  // Construct main explanation
  let explanation: string
  if (score >= 80) {
    explanation = `${movie.title} is an exceptional match for your current mood. `
  } else if (score >= 65) {
    explanation = `${movie.title} is a strong pick for how you're feeling right now. `
  } else {
    explanation = `${movie.title} captures elements that resonate with your mood. `
  }

  explanation += isPrimary
    ? `This ${movie.genres[0].toLowerCase()} from ${movie.year} is built around the ${moodLabel.toLowerCase()} experience.`
    : `While primarily a ${movie.genres[0].toLowerCase()}, it weaves in ${moodLabel.toLowerCase()} moments throughout.`

  return {
    explanation,
    matchReasons: reasons.slice(0, 3), // Max 3 bullet reasons
  }
}

// ─── Determine mood match strength ────────────────────────────────────────────

export function getMoodMatchStrength(
  movie: Movie,
  mood: MoodType
): 'primary' | 'secondary' {
  return movie.moods[0] === mood ? 'primary' : 'secondary'
}

// ─── Build full RecommendationResult ─────────────────────────────────────────

export function buildRecommendationResult(
  movie: Movie,
  mood: MoodType,
  userHistory?: UserHistory
): RecommendationResult {
  const score = scoreMovie(movie, mood, userHistory)
  const { explanation, matchReasons } = generateExplanation(movie, mood, score)
  const moodMatchStrength = getMoodMatchStrength(movie, mood)

  return {
    movie,
    score,
    explanation,
    matchReasons,
    moodMatchStrength,
  }
}
