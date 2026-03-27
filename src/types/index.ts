// TMDB API response types

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  media_type?: "movie" | "tv";
  original_language: string;
}

export interface TMDBMovieDetail {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  status: string;
  tagline: string;
  popularity: number;
  original_language: string;
  videos?: {
    results: TMDBVideo[];
  };
  similar?: {
    results: TMDBMovie[];
  };
  credits?: {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
  };
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// App types

export type MediaType = "movie" | "tv" | "all";

export type MoodId =
  | "happy"
  | "sad"
  | "thrilled"
  | "relaxed"
  | "adventurous"
  | "romantic"
  | "scared"
  | "curious"
  | "nostalgic"
  | "inspired";

export interface Mood {
  id: MoodId;
  label: string;
  emoji: string;
  description: string;
  color: string;
  genreIds: number[];
  keywords: string[];
}

export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  popularity: number;
  mediaType: MediaType;
}

export interface MovieDetail extends Movie {
  genres: { id: number; name: string }[];
  runtime: number | null;
  numberOfSeasons: number | null;
  status: string;
  tagline: string;
  trailer: TrailerInfo | null;
  similar: Movie[];
  cast: CastMember[];
  director: string | null;
}

export interface TrailerInfo {
  key: string;
  name: string;
  site: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface WatchlistItem {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  addedAt: string;
}

export interface RecommendationResponse {
  results: Movie[];
  page: number;
  totalPages: number;
  mood: MoodId;
}

export interface MovieDetailResponse {
  details: MovieDetail;
}

export interface SurpriseResponse {
  movie: MovieDetail;
  mood: MoodId;
  explanation: string;
}

export interface APIError {
  error: string;
  status: number;
}
