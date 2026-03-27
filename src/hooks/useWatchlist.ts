"use client";

import { useState, useEffect, useCallback } from "react";
import { WatchlistItem, MediaType } from "@/types";

const STORAGE_KEY = "moodflix-watchlist";

function loadWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveWatchlist(items: WatchlistItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(loadWatchlist());
    setIsLoaded(true);
  }, []);

  const addItem = useCallback(
    (item: Omit<WatchlistItem, "addedAt">) => {
      setItems((prev) => {
        const exists = prev.some(
          (i) => i.tmdbId === item.tmdbId && i.mediaType === item.mediaType
        );
        if (exists) return prev;

        const updated = [
          ...prev,
          { ...item, addedAt: new Date().toISOString() },
        ];
        saveWatchlist(updated);
        return updated;
      });
    },
    []
  );

  const removeItem = useCallback(
    (tmdbId: number, mediaType: MediaType) => {
      setItems((prev) => {
        const updated = prev.filter(
          (i) => !(i.tmdbId === tmdbId && i.mediaType === mediaType)
        );
        saveWatchlist(updated);
        return updated;
      });
    },
    []
  );

  const isInWatchlist = useCallback(
    (tmdbId: number, mediaType: MediaType) => {
      return items.some(
        (i) => i.tmdbId === tmdbId && i.mediaType === mediaType
      );
    },
    [items]
  );

  return { items, isLoaded, addItem, removeItem, isInWatchlist };
}
