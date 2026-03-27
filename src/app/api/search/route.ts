import { NextRequest, NextResponse } from "next/server";
import { searchMulti, searchByType } from "@/lib/tmdb";
import { transformMovie } from "@/lib/recommendations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("query");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const mediaType = searchParams.get("mediaType") || "multi";

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing search query" },
        { status: 400 }
      );
    }

    if (query.trim().length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    let data;
    if (mediaType === "multi") {
      data = await searchMulti(query.trim(), page);
    } else if (mediaType === "movie" || mediaType === "tv") {
      data = await searchByType(query.trim(), mediaType, page);
    } else {
      return NextResponse.json(
        { error: "Invalid mediaType. Use 'movie', 'tv', or 'multi'" },
        { status: 400 }
      );
    }

    const results = data.results
      .filter((m) => {
        const type = (m as { media_type?: string }).media_type || mediaType;
        return type !== "person";
      })
      .map((m) => transformMovie(m, mediaType === "tv" ? "tv" : "movie"));

    return NextResponse.json(
      { results, page: data.page, totalPages: data.total_pages },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}
