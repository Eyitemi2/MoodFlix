'use client'

import React, { useState } from 'react'
import type { Filters } from '@/types'
import { ALL_GENRES, ALL_PLATFORMS } from '@/lib/mockData'

interface FiltersProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export function FiltersPanel({ filters, onChange }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const update = (partial: Partial<Filters>) => {
    onChange({ ...filters, ...partial })
  }

  const toggleGenre = (genre: string) => {
    const current = filters.genres ?? []
    const updated = current.includes(genre)
      ? current.filter((g) => g !== genre)
      : [...current, genre]
    update({ genres: updated.length > 0 ? updated : undefined })
  }

  const togglePlatform = (platform: string) => {
    const current = filters.platforms ?? []
    const updated = current.includes(platform)
      ? current.filter((p) => p !== platform)
      : [...current, platform]
    update({ platforms: updated.length > 0 ? updated : undefined })
  }

  const clearAll = () => {
    onChange({})
  }

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== false && (Array.isArray(v) ? v.length > 0 : true)
  )

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
          hasActiveFilters
            ? 'bg-violet-600 border-violet-500 text-white'
            : 'bg-[#1a1a24] border-[#2a2a3a] text-gray-300 hover:border-violet-500'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        Filters
        {hasActiveFilters && (
          <span className="bg-white/20 text-white text-xs rounded-full px-1.5 py-0.5">
            ON
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 z-30 w-72 card p-4 shadow-xl animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="text-violet-400 text-xs hover:text-violet-300"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Rating */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-2">
              Minimum Rating: {filters.minRating?.toFixed(1) ?? 'Any'}
            </label>
            <input
              type="range"
              min="0"
              max="9"
              step="0.5"
              value={filters.minRating ?? 0}
              onChange={(e) =>
                update({
                  minRating: parseFloat(e.target.value) || undefined,
                })
              }
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>9.0</span>
            </div>
          </div>

          {/* Year Range */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-400 mb-1">From Year</label>
              <input
                type="number"
                min="1920"
                max="2026"
                placeholder="1920"
                value={filters.yearFrom ?? ''}
                onChange={(e) =>
                  update({
                    yearFrom: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="input-field py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">To Year</label>
              <input
                type="number"
                min="1920"
                max="2026"
                placeholder="2026"
                value={filters.yearTo ?? ''}
                onChange={(e) =>
                  update({
                    yearTo: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="input-field py-1.5 text-sm"
              />
            </div>
          </div>

          {/* Max Duration */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 mb-1">
              Max Duration (min): {filters.maxDuration ?? 'No limit'}
            </label>
            <input
              type="range"
              min="60"
              max="240"
              step="15"
              value={filters.maxDuration ?? 240}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                update({ maxDuration: val < 240 ? val : undefined })
              }}
              className="w-full accent-violet-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1h</span>
              <span>4h+</span>
            </div>
          </div>

          {/* Hidden Gems */}
          <div className="mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hiddenGemsOnly ?? false}
                onChange={(e) => update({ hiddenGemsOnly: e.target.checked || undefined })}
                className="accent-violet-500 w-4 h-4"
              />
              <span className="text-sm text-gray-300">Hidden gems only 💎</span>
            </label>
          </div>

          {/* Genres */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Genres</p>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {ALL_GENRES.slice(0, 12).map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`badge cursor-pointer transition-colors ${
                    filters.genres?.includes(genre)
                      ? 'bg-violet-600 text-white'
                      : 'bg-[#2a2a3a] text-gray-400 hover:bg-[#3a3a4a]'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Platforms</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_PLATFORMS.slice(0, 8).map((platform) => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`badge cursor-pointer transition-colors text-xs ${
                    filters.platforms?.includes(platform)
                      ? 'bg-violet-600 text-white'
                      : 'bg-[#2a2a3a] text-gray-400 hover:bg-[#3a3a4a]'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
