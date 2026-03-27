import { NextRequest, NextResponse } from 'next/server'
import { getMovieById } from '@/lib/mockData'
import { getSimilarMovies } from '@/lib/recommendations'
import type { ApiResponse, Movie } from '@/types'

interface MovieDetailResponse {
  movie: Movie
  similar: Movie[]
}

// GET /api/movies/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10)

  if (isNaN(id)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Invalid movie ID' },
      { status: 400 }
    )
  }

  const movie = getMovieById(id)

  if (!movie) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Movie not found' },
      { status: 404 }
    )
  }

  const similar = getSimilarMovies(id, 6)

  return NextResponse.json<ApiResponse<MovieDetailResponse>>(
    { success: true, data: { movie, similar } },
    {
      status: 200,
      headers: {
        // Cache for 24 hours — movie data rarely changes
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    }
  )
}
