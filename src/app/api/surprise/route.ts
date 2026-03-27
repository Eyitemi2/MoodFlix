import { NextRequest, NextResponse } from "next/server";
import { getRecommendationsForMood, getMoodExplanation } from "@/lib/mood-engine";
import { transformMovie } from "@/lib/recommendations";
import { getMovieDetail } from "@/lib/tmdb";
import { MOODS } from "@/config/moods";
import { MoodId } from "@/types";
import { getRandomItem, validateMood } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    let moodId = searchParams.get("mood") as MoodId | null;

    // Pick a random mood if none provided
    if (!moodId) {
      moodId = getRandomItem(MOODS).id;
    } else if (!validateMood(moodId)) {
      return NextResponse.json(
        { error: "Invalid mood parameter" },
        { status: 400 }
      );
    }

    // Get a random page (1-5) for variety
    const randomPage = Math.floor(Math.random() * 5) + 1;

    const { movies } = await getRecommendationsForMood(moodId, "movie", randomPage);

    if (!movies.results.length) {
      // Fallback to page 1
      const fallback = await getRecommendationsForMood(moodId, "movie", 1);
      if (!fallback.movies.results.length) {
        return NextResponse.json(
          { error: "No recommendations found" },
          { status: 404 }
        );
      }
      movies.results = fallback.movies.results;
    }

    // Pick a random movie from the results
    const randomMovie = getRandomItem(movies.results);
    const detail = await getMovieDetail(randomMovie.id, "movie");

    // Build trailer info
    let trailer = null;
    if (detail.videos?.results) {
      const yt = detail.videos.results.find(
        (v) => v.site === "YouTube" && v.type === "Trailer"
      ) || detail.videos.results.find((v) => v.site === "YouTube");

      if (yt) {
        trailer = { key: yt.key, name: yt.name, site: yt.site };
      }
    }

    const similar = (detail.similar?.results || [])
      .slice(0, 6)
      .map((m) => transformMovie(m, "movie"));

    const cast = (detail.credits?.cast || []).slice(0, 10).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path,
    }));

    const director = detail.credits?.crew?.find(
      (c) => c.job === "Director"
    )?.name || null;

    const movieTitle = detail.title || detail.name || "Untitled";
    const explanation = getMoodExplanation(moodId, movieTitle);

    return NextResponse.json({
      movie: {
        id: detail.id,
        title: movieTitle,
        overview: detail.overview,
        posterPath: detail.poster_path,
        backdropPath: detail.backdrop_path,
        releaseDate: detail.release_date || "",
        voteAverage: detail.vote_average,
        voteCount: detail.vote_count,
        genreIds: detail.genres.map((g) => g.id),
        popularity: detail.popularity,
        mediaType: "movie",
        genres: detail.genres,
        runtime: detail.runtime || null,
        numberOfSeasons: null,
        status: detail.status,
        tagline: detail.tagline,
        trailer,
        similar,
        cast,
        director,
      },
      mood: moodId,
      explanation,
    });
  } catch (error) {
    console.error("Surprise error:", error);
    return NextResponse.json(
      { error: "Failed to get surprise recommendation" },
      { status: 500 }
    );
  }
}
