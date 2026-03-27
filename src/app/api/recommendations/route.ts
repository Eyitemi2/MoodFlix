import { NextRequest, NextResponse } from "next/server";
import { getRecommendationsForMood } from "@/lib/mood-engine";
import { mergeResults, transformMovie } from "@/lib/recommendations";
import { MOOD_MAP } from "@/config/moods";
import { MoodId, MediaType } from "@/types";
import { validateMood, validateMediaType } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const mood = searchParams.get("mood");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const mediaType = (searchParams.get("mediaType") || "all") as MediaType;

    if (!mood || !validateMood(mood)) {
      return NextResponse.json(
        { error: "Invalid or missing mood parameter" },
        { status: 400 }
      );
    }

    if (!validateMediaType(mediaType)) {
      return NextResponse.json(
        { error: "Invalid mediaType. Use 'movie', 'tv', or 'all'" },
        { status: 400 }
      );
    }

    const moodConfig = MOOD_MAP[mood];
    const { movies, tv } = await getRecommendationsForMood(
      mood as MoodId,
      mediaType,
      page
    );

    let results;
    let totalPages: number;

    if (mediaType === "all" && tv) {
      const merged = mergeResults(movies.results, tv.results, moodConfig.genreIds);
      results = merged.map((m) => transformMovie(m));
      totalPages = Math.max(movies.total_pages, tv.total_pages);
    } else if (mediaType === "tv" && tv) {
      results = tv.results.map((m) => transformMovie(m, "tv"));
      totalPages = tv.total_pages;
    } else {
      results = movies.results.map((m) => transformMovie(m, "movie"));
      totalPages = movies.total_pages;
    }

    return NextResponse.json(
      { results, page, totalPages, mood },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
