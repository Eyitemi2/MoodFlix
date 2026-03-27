"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useMood } from "@/hooks/useMood";
import { MoodId } from "@/types";
import { MOOD_MAP } from "@/config/moods";
import MovieGrid from "@/components/MovieGrid";
import MoodSelector from "@/components/MoodSelector";
import { validateMood } from "@/lib/utils";

function RecommendationsContent() {
  const searchParams = useSearchParams();
  const moodParam = searchParams.get("mood");
  const {
    selectedMood,
    recommendations,
    isLoading,
    error,
    selectMood,
    page,
    totalPages,
    loadMore,
  } = useMood();

  useEffect(() => {
    if (moodParam && validateMood(moodParam) && moodParam !== selectedMood) {
      selectMood(moodParam as MoodId);
    }
  }, [moodParam, selectedMood, selectMood]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {selectedMood
          ? `${MOOD_MAP[selectedMood]?.emoji} ${MOOD_MAP[selectedMood]?.label} Recommendations`
          : "Pick a Mood"}
      </h1>

      <div className="mb-10">
        <MoodSelector
          selectedMood={selectedMood}
          onSelect={selectMood}
          isLoading={isLoading}
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-6 text-red-400 text-sm">
          {error}
        </div>
      )}

      {selectedMood && (
        <>
          <MovieGrid
            movies={recommendations}
            isLoading={isLoading}
            emptyMessage="No recommendations found"
          />

          {page < totalPages && !isLoading && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                className="px-6 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--border)] text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense>
      <RecommendationsContent />
    </Suspense>
  );
}
