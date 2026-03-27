import { NextRequest, NextResponse } from 'next/server'
import { AddWatchlistSchema, UpdateWatchlistSchema, parseBody } from '@/lib/validation'
import type { ApiResponse } from '@/types'

/**
 * NOTE: In MVP, watchlist is managed client-side via localStorage.
 * These endpoints are the V1 implementation for when auth + DB is added.
 * They return placeholder responses until NextAuth + Prisma are configured.
 */

// GET /api/watchlist — Get current user's watchlist
export async function GET(request: NextRequest) {
  // V1: Check auth session here
  // const session = await auth()
  // if (!session?.user?.id) return unauthorized()

  // MVP placeholder
  return NextResponse.json<ApiResponse<{ message: string }>>(
    {
      success: true,
      data: {
        message:
          'Watchlist is managed client-side in MVP. Enable auth in V1 to sync across devices.',
      },
    },
    { status: 200 }
  )
}

// POST /api/watchlist — Add movie to watchlist
export async function POST(request: NextRequest) {
  const { data, error } = await parseBody(request, AddWatchlistSchema)

  if (error || !data) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: error ?? 'Invalid body' },
      { status: 400 }
    )
  }

  // V1: Upsert to DB via Prisma
  // const session = await auth()
  // await prisma.watchlistItem.upsert({ ... })

  return NextResponse.json<ApiResponse<{ movieId: number; added: boolean }>>(
    { success: true, data: { movieId: data.movieId, added: true } },
    { status: 201 }
  )
}

// PATCH /api/watchlist — Update watchlist item status
export async function PATCH(request: NextRequest) {
  const { data, error } = await parseBody(request, UpdateWatchlistSchema)

  if (error || !data) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: error ?? 'Invalid body' },
      { status: 400 }
    )
  }

  return NextResponse.json<ApiResponse<typeof data>>(
    { success: true, data },
    { status: 200 }
  )
}

// DELETE /api/watchlist — Remove from watchlist
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const movieId = parseInt(searchParams.get('movieId') ?? '', 10)

  if (isNaN(movieId)) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'movieId query param required' },
      { status: 400 }
    )
  }

  return NextResponse.json<ApiResponse<{ movieId: number; removed: boolean }>>(
    { success: true, data: { movieId, removed: true } },
    { status: 200 }
  )
}
