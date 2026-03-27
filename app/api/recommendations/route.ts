import { NextRequest, NextResponse } from 'next/server'
import { getRecommendations } from '@/lib/recommendations'
import { RecommendationRequestSchema, parseBody, checkRateLimit } from '@/lib/validation'
import type { ApiResponse, RecommendationResponse } from '@/types'

// POST /api/recommendations
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { allowed } = checkRateLimit(`recommendations:${ip}`, 30, 60_000)

  if (!allowed) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Too many requests. Please slow down.' },
      { status: 429 }
    )
  }

  // Parse + validate body
  const { data, error } = await parseBody(request, RecommendationRequestSchema)
  if (error || !data) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: error ?? 'Invalid request body' },
      { status: 400 }
    )
  }

  try {
    const results = getRecommendations(data)

    return NextResponse.json<ApiResponse<RecommendationResponse>>(
      { success: true, data: results },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store', // Personalized — never cache
        },
      }
    )
  } catch (err) {
    console.error('[/api/recommendations] Error:', err)
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
