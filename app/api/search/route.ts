import { NextRequest, NextResponse } from 'next/server'
import { searchMovies } from '@/lib/recommendations'
import { checkRateLimit } from '@/lib/validation'
import type { ApiResponse, SearchResult } from '@/types'

// GET /api/search?q=inception&page=1&limit=20
export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { allowed } = checkRateLimit(`search:${ip}`, 60, 60_000)

  if (!allowed) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Too many requests' },
      { status: 429 }
    )
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.trim() ?? ''
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50)

  if (!query) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Search query is required' },
      { status: 400 }
    )
  }

  if (query.length > 100) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Query too long (max 100 characters)' },
      { status: 400 }
    )
  }

  const { movies, total } = searchMovies(query, page, limit)

  const result: SearchResult = {
    movies,
    total,
    query,
    page,
  }

  return NextResponse.json<ApiResponse<SearchResult>>(
    { success: true, data: result },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    }
  )
}
