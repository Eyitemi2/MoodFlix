import { NextRequest, NextResponse } from 'next/server'
import { getTrending } from '@/lib/recommendations'
import type { ApiResponse, Movie } from '@/types'

// GET /api/trending?limit=12
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '12', 10), 30)

  const movies = getTrending(isNaN(limit) ? 12 : limit)

  return NextResponse.json<ApiResponse<{ movies: Movie[]; count: number }>>(
    { success: true, data: { movies, count: movies.length } },
    {
      status: 200,
      headers: {
        // ISR-style caching: fresh for 1 hour, stale for another hour
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600',
      },
    }
  )
}
