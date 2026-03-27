import { z } from 'zod'

// ─── Mood ─────────────────────────────────────────────────────────────────────

const VALID_MOODS = [
  'relaxed', 'playful', 'emotional', 'thrilled', 'adventurous',
  'romantic', 'inspired', 'nostalgic', 'curious', 'dark',
] as const

export const MoodSchema = z.enum(VALID_MOODS)

// ─── Filters ─────────────────────────────────────────────────────────────────

export const FiltersSchema = z.object({
  genres: z.array(z.string()).optional(),
  yearFrom: z.coerce.number().min(1900).max(2030).optional(),
  yearTo: z.coerce.number().min(1900).max(2030).optional(),
  minRating: z.coerce.number().min(0).max(10).optional(),
  maxDuration: z.coerce.number().min(1).max(600).optional(),
  platforms: z.array(z.string()).optional(),
  hiddenGemsOnly: z.coerce.boolean().optional(),
  includeNonEnglish: z.coerce.boolean().optional(),
})

// ─── Recommendations Request ──────────────────────────────────────────────────

export const RecommendationRequestSchema = z.object({
  mood: MoodSchema,
  filters: FiltersSchema.optional(),
  page: z.coerce.number().min(1).max(100).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  userId: z.string().optional(),
  includePersonalization: z.coerce.boolean().optional(),
})

// ─── Search ───────────────────────────────────────────────────────────────────

export const SearchSchema = z.object({
  q: z.string().min(1).max(100).trim(),
  page: z.coerce.number().min(1).max(100).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
})

// ─── Watchlist ────────────────────────────────────────────────────────────────

export const AddWatchlistSchema = z.object({
  movieId: z.number().int().positive(),
})

export const UpdateWatchlistSchema = z.object({
  movieId: z.number().int().positive(),
  status: z.enum(['to_watch', 'watched', 'loved']),
  rating: z.number().min(1).max(5).optional(),
})

// ─── Rate Limiter (simple in-memory) ─────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests = 30,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: maxRequests - entry.count }
}

// ─── Helper: Parse request body safely ────────────────────────────────────────

export async function parseBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)
    if (!result.success) {
      const errorMessage = result.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')
      return { data: null, error: errorMessage }
    }
    return { data: result.data, error: null }
  } catch {
    return { data: null, error: 'Invalid JSON body' }
  }
}
