import { TMDBMovie, Movie, MediaType } from "@/types";

/**
 * Transform TMDB movie data into our app's Movie type
 */
export function transformMovie(tmdb: TMDBMovie, fallbackMediaType: MediaType = "movie"): Movie {
  return {
    id: tmdb.id,
    title: tmdb.title || tmdb.name || "Untitled",
    overview: tmdb.overview,
    posterPath: tmdb.poster_path,
    backdropPath: tmdb.backdrop_path,
    releaseDate: tmdb.release_date || tmdb.first_air_date || "",
    voteAverage: tmdb.vote_average,
    voteCount: tmdb.vote_count,
    genreIds: tmdb.genre_ids,
    popularity: tmdb.popularity,
    mediaType: tmdb.media_type || fallbackMediaType,
  };
}

/**
 * Score and sort movies by relevance for mood-based recommendations.
 * Higher score = better recommendation.
 */
export function scoreAndSort(movies: TMDBMovie[], targetGenres: number[]): TMDBMovie[] {
  const scored = movies.map((movie) => {
    let score = 0;

    // Genre overlap bonus (0-30 points)
    const genreOverlap = movie.genre_ids.filter((g) => targetGenres.includes(g)).length;
    score += genreOverlap * 10;

    // Popularity (0-25 points, normalized)
    score += Math.min(movie.popularity / 4, 25);

    // Rating quality (0-20 points)
    score += movie.vote_average * 2;

    // Vote confidence (0-10 points)
    score += Math.min(movie.vote_count / 500, 10);

    // Recency bonus (0-15 points)
    const year = new Date(movie.release_date || movie.first_air_date || "").getFullYear();
    if (!isNaN(year)) {
      const currentYear = new Date().getFullYear();
      const age = currentYear - year;
      score += Math.max(15 - age, 0);
    }

    return { movie, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.movie);
}

/**
 * Merge and deduplicate movie and TV results
 */
export function mergeResults(
  movies: TMDBMovie[],
  tvShows: TMDBMovie[],
  targetGenres: number[]
): TMDBMovie[] {
  const moviesWithType = movies.map((m) => ({ ...m, media_type: "movie" as const }));
  const tvWithType = tvShows.map((m) => ({ ...m, media_type: "tv" as const }));

  const combined = [...moviesWithType, ...tvWithType];

  // Deduplicate by id + media_type
  const seen = new Set<string>();
  const unique = combined.filter((item) => {
    const key = `${item.media_type}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return scoreAndSort(unique, targetGenres);
}
