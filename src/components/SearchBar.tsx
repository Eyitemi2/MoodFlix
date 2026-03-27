"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  compact?: boolean;
  defaultValue?: string;
}

export default function SearchBar({ compact, defaultValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
        width="16"
        height="16"
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
        placeholder="Search movies & shows..."
        className={`w-full rounded-lg border border-[var(--border)] bg-[var(--card)] pl-9 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none transition-colors ${
          compact ? "py-1.5" : "py-2.5"
        }`}
      />
    </form>
  );
}
