import { NextRequest, NextResponse } from "next/server";
import { getTrending } from "@/lib/tmdb";
import { transformMovie } from "@/lib/recommendations";
import { MediaType } from "@/types";
import { validateMediaType } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const timeWindow = (searchParams.get("timeWindow") || "week") as "day" | "week";
    const mediaType = (searchParams.get("mediaType") || "all") as MediaType;
    const page = parseInt(searchParams.get("page") || "1", 10);

    if (!validateMediaType(mediaType)) {
      return NextResponse.json(
        { error: "Invalid mediaType" },
        { status: 400 }
      );
    }

    if (!["day", "week"].includes(timeWindow)) {
      return NextResponse.json(
        { error: "Invalid timeWindow. Use 'day' or 'week'" },
        { status: 400 }
      );
    }

    const data = await getTrending(mediaType, timeWindow, page);
    const results = data.results
      .filter((m) => m.media_type === "movie" || m.media_type === "tv")
      .map((m) => transformMovie(m));

    return NextResponse.json(
      { results, page: data.page, totalPages: data.total_pages },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error("Trending error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending content" },
      { status: 500 }
    );
  }
}
