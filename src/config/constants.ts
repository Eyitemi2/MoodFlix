export const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const IMAGE_SIZES = {
  poster: {
    small: `${TMDB_IMAGE_BASE}/w185`,
    medium: `${TMDB_IMAGE_BASE}/w342`,
    large: `${TMDB_IMAGE_BASE}/w500`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
  backdrop: {
    small: `${TMDB_IMAGE_BASE}/w300`,
    medium: `${TMDB_IMAGE_BASE}/w780`,
    large: `${TMDB_IMAGE_BASE}/w1280`,
    original: `${TMDB_IMAGE_BASE}/original`,
  },
  profile: {
    small: `${TMDB_IMAGE_BASE}/w45`,
    medium: `${TMDB_IMAGE_BASE}/w185`,
    large: `${TMDB_IMAGE_BASE}/h632`,
  },
} as const;

export const ITEMS_PER_PAGE = 20;

export const REVALIDATION_TIMES = {
  trending: 3600,      // 1 hour
  movieDetail: 86400,  // 24 hours
  search: 1800,        // 30 minutes
} as const;
