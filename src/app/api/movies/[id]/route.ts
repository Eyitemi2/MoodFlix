import { NextRequest, NextResponse } from "next/server";
import { getMovieDetail } from "@/lib/tmdb";
import { transformMovie } from "@/lib/recommendations";
import { MovieDetail, TrailerInfo } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const mediaType = (searchParams.get("type") || "movie") as "movie" | "tv";

    const movieId = parseInt(id, 10);
    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const tmdbDetail = await getMovieDetail(movieId, mediaType);

    // Extract YouTube trailer
    let trailer: TrailerInfo | null = null;
    if (tmdbDetail.videos?.results) {
      const ytTrailer = tmdbDetail.videos.results.find(
        (v) => v.site === "YouTube" && v.type === "Trailer" && v.official
      ) || tmdbDetail.videos.results.find(
        (v) => v.site === "YouTube" && v.type === "Trailer"
      ) || tmdbDetail.videos.results.find(
        (v) => v.site === "YouTube"
      );

      if (ytTrailer) {
        trailer = {
          key: ytTrailer.key,
          name: ytTrailer.name,
          site: ytTrailer.site,
        };
      }
    }

    // Transform similar movies
    const similar = (tmdbDetail.similar?.results || [])
      .slice(0, 12)
      .map((m) => transformMovie(m, mediaType));

    // Extract cast
    const cast = (tmdbDetail.credits?.cast || []).slice(0, 10).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path,
    }));

    // Find director
    const director = tmdbDetail.credits?.crew?.find(
      (c) => c.job === "Director"
    )?.name || null;

    const details: MovieDetail = {
      id: tmdbDetail.id,
      title: tmdbDetail.title || tmdbDetail.name || "Untitled",
      overview: tmdbDetail.overview,
      posterPath: tmdbDetail.poster_path,
      backdropPath: tmdbDetail.backdrop_path,
      releaseDate: tmdbDetail.release_date || tmdbDetail.first_air_date || "",
      voteAverage: tmdbDetail.vote_average,
      voteCount: tmdbDetail.vote_count,
      genreIds: tmdbDetail.genres.map((g) => g.id),
      popularity: tmdbDetail.popularity,
      mediaType,
      genres: tmdbDetail.genres,
      runtime: tmdbDetail.runtime || null,
      numberOfSeasons: tmdbDetail.number_of_seasons || null,
      status: tmdbDetail.status,
      tagline: tmdbDetail.tagline,
      trailer,
      similar,
      cast,
      director,
    };

    return NextResponse.json(
      { details },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=172800",
        },
      }
    );
  } catch (error) {
    console.error("Movie detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie details" },
      { status: 500 }
    );
  }
}
