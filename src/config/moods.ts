import { Mood } from "@/types";

// TMDB Genre IDs reference:
// 28: Action, 12: Adventure, 16: Animation, 35: Comedy, 80: Crime,
// 99: Documentary, 18: Drama, 10751: Family, 14: Fantasy, 36: History,
// 27: Horror, 10402: Music, 9648: Mystery, 10749: Romance,
// 878: Science Fiction, 53: Thriller, 10770: TV Movie, 10752: War, 37: Western

export const MOODS: Mood[] = [
  {
    id: "happy",
    label: "Happy",
    emoji: "\ud83d\ude0a",
    description: "Feel-good vibes and laughter",
    color: "#FFD93D",
    genreIds: [35, 10751, 10402],
    keywords: ["feel-good", "uplifting", "comedy"],
  },
  {
    id: "sad",
    label: "Sad",
    emoji: "\ud83d\ude22",
    description: "Emotional and moving stories",
    color: "#6C9BCF",
    genreIds: [18, 10749],
    keywords: ["emotional", "drama", "tearjerker"],
  },
  {
    id: "thrilled",
    label: "Thrilled",
    emoji: "\ud83d\udd25",
    description: "Heart-pounding excitement",
    color: "#FF6B6B",
    genreIds: [28, 53],
    keywords: ["intense", "suspense", "action"],
  },
  {
    id: "relaxed",
    label: "Relaxed",
    emoji: "\ud83d\ude0c",
    description: "Calm and easy watching",
    color: "#95E1D3",
    genreIds: [16, 35, 99],
    keywords: ["light", "calming", "gentle"],
  },
  {
    id: "adventurous",
    label: "Adventurous",
    emoji: "\ud83e\udded",
    description: "Epic journeys and exploration",
    color: "#F38181",
    genreIds: [12, 14, 878],
    keywords: ["epic", "journey", "adventure"],
  },
  {
    id: "romantic",
    label: "Romantic",
    emoji: "\ud83d\udc95",
    description: "Love stories and warm hearts",
    color: "#FF9A9E",
    genreIds: [10749, 18, 35],
    keywords: ["love", "relationship", "romance"],
  },
  {
    id: "scared",
    label: "Scared",
    emoji: "\ud83d\udc7b",
    description: "Thrills, chills, and suspense",
    color: "#2C3333",
    genreIds: [27, 53, 9648],
    keywords: ["scary", "horror", "supernatural"],
  },
  {
    id: "curious",
    label: "Curious",
    emoji: "\ud83e\udd14",
    description: "Mind-bending and thought-provoking",
    color: "#AA96DA",
    genreIds: [99, 9648, 878],
    keywords: ["mind-bending", "thought-provoking", "mystery"],
  },
  {
    id: "nostalgic",
    label: "Nostalgic",
    emoji: "\ud83d\udd70\ufe0f",
    description: "Classic feels and timeless stories",
    color: "#E8DDB5",
    genreIds: [10751, 16, 18],
    keywords: ["classic", "retro", "timeless"],
  },
  {
    id: "inspired",
    label: "Inspired",
    emoji: "\u2728",
    description: "True stories that move you",
    color: "#FCCF31",
    genreIds: [18, 36, 10752],
    keywords: ["true-story", "motivational", "biography"],
  },
];

export const MOOD_MAP: Record<string, Mood> = Object.fromEntries(
  MOODS.map((mood) => [mood.id, mood])
);
