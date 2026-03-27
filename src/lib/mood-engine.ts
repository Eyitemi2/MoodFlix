import { MOOD_MAP } from "@/config/moods";
import { MoodId, MediaType, TMDBMovie, TMDBResponse } from "@/types";
import { discoverByGenres } from "./tmdb";

interface MoodQuery {
  genreIds: number[];
  keywords: string[];
  extraParams: Record<string, string>;
}

function buildMoodQuery(moodId: MoodId): MoodQuery {
  const mood = MOOD_MAP[moodId];
  if (!mood) {
    throw new Error(`Unknown mood: ${moodId}`);
  }

  const extraParams: Record<string, string> = {};

  // Mood-specific tuning
  switch (moodId) {
    case "happy":
      extraParams["vote_average.gte"] = "6.5";
      break;
    case "sad":
      extraParams["vote_average.gte"] = "7.0";
      break;
    case "nostalgic":
      extraParams["primary_release_date.lte"] = "2005-12-31";
      break;
    case "scared":
      extraParams["vote_average.gte"] = "6.0";
      break;
    case "inspired":
      extraParams["vote_average.gte"] = "7.0";
      break;
  }

  return {
    genreIds: mood.genreIds,
    keywords: mood.keywords,
    extraParams,
  };
}

export async function getRecommendationsForMood(
  moodId: MoodId,
  mediaType: MediaType = "all",
  page: number = 1
): Promise<{ movies: TMDBResponse<TMDBMovie>; tv: TMDBResponse<TMDBMovie> | null }> {
  const query = buildMoodQuery(moodId);

  if (mediaType === "movie" || mediaType === "all") {
    const movies = await discoverByGenres(query.genreIds, "movie", page, query.extraParams);

    if (mediaType === "movie") {
      return { movies, tv: null };
    }

    const tv = await discoverByGenres(query.genreIds, "tv", page, query.extraParams);
    return { movies, tv };
  }

  const tv = await discoverByGenres(query.genreIds, "tv", page, query.extraParams);
  const emptyResponse: TMDBResponse<TMDBMovie> = { page: 1, results: [], total_pages: 0, total_results: 0 };
  return { movies: emptyResponse, tv };
}

export function getMoodExplanation(moodId: MoodId, movieTitle: string): string {
  const mood = MOOD_MAP[moodId];
  if (!mood) return "";

  const explanations: Record<MoodId, string> = {
    happy: `"${movieTitle}" is perfect for your happy mood \u2014 expect feel-good moments and plenty of laughs.`,
    sad: `"${movieTitle}" matches your reflective mood with an emotionally rich, moving story.`,
    thrilled: `"${movieTitle}" delivers the adrenaline rush you're craving with intense, edge-of-your-seat action.`,
    relaxed: `"${movieTitle}" is a laid-back watch \u2014 perfect for unwinding without heavy plot twists.`,
    adventurous: `"${movieTitle}" takes you on an epic journey \u2014 ideal for your adventurous spirit.`,
    romantic: `"${movieTitle}" is a heartwarming love story to match your romantic mood.`,
    scared: `"${movieTitle}" will keep you on the edge of your seat with chills and suspense.`,
    curious: `"${movieTitle}" is a thought-provoking pick that will keep your mind engaged.`,
    nostalgic: `"${movieTitle}" is a timeless classic that'll take you back to simpler times.`,
    inspired: `"${movieTitle}" is an uplifting true story that will leave you feeling motivated.`,
  };

  return explanations[moodId];
}
