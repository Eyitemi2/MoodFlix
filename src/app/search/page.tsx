"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MovieGrid from "@/components/MovieGrid";
import { Movie } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<"multi" | "movie" | "tv">("multi");
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setTotalPages(0);
      return;
    }

    setIsLoading(true);
    fetch(
      `/api/search?query=${encodeURIComponent(debouncedQuery.trim())}&page=1&mediaType=${filter}`
    )
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setPage(data.page || 1);
        setTotalPages(data.totalPages || 0);
        setIsLoading(false);
      })
      .catch(() => {
        setResults([]);
        setIsLoading(false);
      });
  }, [debouncedQuery, filter]);

  const loadMore = () => {
    if (page >= totalPages || isLoading) return;

    setIsLoading(true);
    const nextPage = page + 1;
    fetch(
      `/api/search?query=${encodeURIComponent(debouncedQuery.trim())}&page=${nextPage}&mediaType=${filter}`
    )
      .then((res) => res.json())
      .then((data) => {
        setResults((prev) => [...prev, ...(data.results || [])]);
        setPage(data.page || nextPage);
        setTotalPages(data.totalPages || 0);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  const filters: { label: string; value: "multi" | "movie" | "tv" }[] = [
    { label: "All", value: "multi" },
    { label: "Movies", value: "movie" },
    { label: "TV Shows", value: "tv" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      {/* Search input */}
      <div className="max-w-xl mb-6">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies, TV shows..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-11 pr-4 py-3 text-base text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none transition-colors"
            autoFocus
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f.value
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {debouncedQuery.trim().length >= 2 ? (
        <>
          {!isLoading && results.length > 0 && (
            <p className="text-sm text-[var(--muted)] mb-4">
              Showing results for &ldquo;{debouncedQuery.trim()}&rdquo;
            </p>
          )}
          <MovieGrid
            movies={results}
            isLoading={isLoading && results.length === 0}
            emptyMessage={`No results for "${debouncedQuery.trim()}"`}
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
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-[var(--muted)]">
            Type at least 2 characters to search
          </p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
