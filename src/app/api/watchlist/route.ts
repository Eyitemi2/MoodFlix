import { NextRequest, NextResponse } from "next/server";
import { WatchlistItem } from "@/types";

// MVP: In-memory watchlist store (per-server instance)
// In production, this would use a database with user authentication
const watchlistStore = new Map<string, WatchlistItem[]>();

function getUserWatchlist(userId: string): WatchlistItem[] {
  return watchlistStore.get(userId) || [];
}

export async function GET(request: NextRequest) {
  try {
    // MVP: use a default user ID (auth comes in V1)
    const userId = request.headers.get("x-user-id") || "anonymous";
    const watchlist = getUserWatchlist(userId);

    return NextResponse.json({ items: watchlist });
  } catch (error) {
    console.error("Watchlist GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch watchlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "anonymous";
    const body = await request.json();

    const { tmdbId, mediaType, title, posterPath } = body;

    if (!tmdbId || !mediaType || !title) {
      return NextResponse.json(
        { error: "Missing required fields: tmdbId, mediaType, title" },
        { status: 400 }
      );
    }

    const watchlist = getUserWatchlist(userId);

    // Check if already in watchlist
    const exists = watchlist.some(
      (item) => item.tmdbId === tmdbId && item.mediaType === mediaType
    );

    if (exists) {
      return NextResponse.json(
        { error: "Item already in watchlist" },
        { status: 409 }
      );
    }

    const newItem: WatchlistItem = {
      tmdbId,
      mediaType,
      title,
      posterPath: posterPath || null,
      addedAt: new Date().toISOString(),
    };

    watchlist.push(newItem);
    watchlistStore.set(userId, watchlist);

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Watchlist POST error:", error);
    return NextResponse.json(
      { error: "Failed to add to watchlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id") || "anonymous";
    const body = await request.json();

    const { tmdbId, mediaType } = body;

    if (!tmdbId || !mediaType) {
      return NextResponse.json(
        { error: "Missing required fields: tmdbId, mediaType" },
        { status: 400 }
      );
    }

    const watchlist = getUserWatchlist(userId);
    const filtered = watchlist.filter(
      (item) => !(item.tmdbId === tmdbId && item.mediaType === mediaType)
    );

    if (filtered.length === watchlist.length) {
      return NextResponse.json(
        { error: "Item not found in watchlist" },
        { status: 404 }
      );
    }

    watchlistStore.set(userId, filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Watchlist DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to remove from watchlist" },
      { status: 500 }
    );
  }
}
