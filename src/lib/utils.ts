import { IMAGE_SIZES } from "@/config/constants";

export function getPosterUrl(path: string | null, size: keyof typeof IMAGE_SIZES.poster = "medium"): string {
  if (!path) return "/icons/no-poster.svg";
  return `${IMAGE_SIZES.poster[size]}${path}`;
}

export function getBackdropUrl(path: string | null, size: keyof typeof IMAGE_SIZES.backdrop = "large"): string {
  if (!path) return "";
  return `${IMAGE_SIZES.backdrop[size]}${path}`;
}

export function getProfileUrl(path: string | null, size: keyof typeof IMAGE_SIZES.profile = "medium"): string {
  if (!path) return "/icons/no-avatar.svg";
  return `${IMAGE_SIZES.profile[size]}${path}`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatYear(dateString: string): string {
  if (!dateString) return "N/A";
  return new Date(dateString).getFullYear().toString();
}

export function formatRuntime(minutes: number | null): string {
  if (!minutes) return "N/A";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function validateMood(mood: string): boolean {
  const validMoods = [
    "happy", "sad", "thrilled", "relaxed", "adventurous",
    "romantic", "scared", "curious", "nostalgic", "inspired",
  ];
  return validMoods.includes(mood);
}

export function validateMediaType(type: string): boolean {
  return ["movie", "tv", "all"].includes(type);
}

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
