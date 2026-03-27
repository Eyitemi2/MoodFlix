import { TMDB_BASE_URL } from "@/config/constants";
import {
  TMDBMovie,
  TMDBMovieDetail,
  TMDBResponse,
  MediaType,
} from "@/types";

const TMDB_API_KEY = process.env.TMDB_API_KEY || "";

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function discoverByGenres(
  genreIds: number[],
  mediaType: "movie" | "tv" = "movie",
  page: number = 1,
  extraParams: Record<string, string> = {}
): Promise<TMDBResponse<TMDBMovie>> {
  const endpoint = `/discover/${mediaType}`;
  return tmdbFetch<TMDBResponse<TMDBMovie>>(endpoint, {
    with_genres: genreIds.join(","),
    sort_by: "popularity.desc",
    page: String(page),
    "vote_count.gte": "50",
    ...extraParams,
  });
}

export async function getTrending(
  mediaType: MediaType = "all",
  timeWindow: "day" | "week" = "week",
  page: number = 1
): Promise<TMDBResponse<TMDBMovie>> {
  const type = mediaType === "all" ? "all" : mediaType;
  return tmdbFetch<TMDBResponse<TMDBMovie>>(`/trending/${type}/${timeWindow}`, {
    page: String(page),
  });
}

export async function searchMulti(
  query: string,
  page: number = 1
): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch<TMDBResponse<TMDBMovie>>("/search/multi", {
    query,
    page: String(page),
    include_adult: "false",
  });
}

export async function searchByType(
  query: string,
  mediaType: "movie" | "tv" = "movie",
  page: number = 1
): Promise<TMDBResponse<TMDBMovie>> {
  return tmdbFetch<TMDBResponse<TMDBMovie>>(`/search/${mediaType}`, {
    query,
    page: String(page),
    include_adult: "false",
  });
}

export async function getMovieDetail(
  id: number,
  mediaType: "movie" | "tv" = "movie"
): Promise<TMDBMovieDetail> {
  return tmdbFetch<TMDBMovieDetail>(`/${mediaType}/${id}`, {
    append_to_response: "videos,similar,credits",
  });
}

export async function getMoviesByIds(
  ids: number[],
  mediaType: "movie" | "tv" = "movie"
): Promise<TMDBMovieDetail[]> {
  const results = await Promise.allSettled(
    ids.map((id) => getMovieDetail(id, mediaType))
  );
  return results
    .filter((r): r is PromiseFulfilledResult<TMDBMovieDetail> => r.status === "fulfilled")
    .map((r) => r.value);
}
