"use client";

import { useState, useCallback } from "react";
import { MoodId, Movie } from "@/types";

export function useMood() {
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchRecommendations = useCallback(
    async (mood: MoodId, pageNum: number = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/recommendations?mood=${mood}&page=${pageNum}&mediaType=all`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch recommendations");
        }
        const data = await res.json();
        setRecommendations(data.results);
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const selectMood = useCallback(
    (mood: MoodId) => {
      setSelectedMood(mood);
      fetchRecommendations(mood, 1);
    },
    [fetchRecommendations]
  );

  const loadMore = useCallback(() => {
    if (selectedMood && page < totalPages) {
      fetchRecommendations(selectedMood, page + 1);
    }
  }, [selectedMood, page, totalPages, fetchRecommendations]);

  return {
    selectedMood,
    recommendations,
    isLoading,
    error,
    page,
    totalPages,
    selectMood,
    loadMore,
  };
}
