'use client'

import React, { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import type { MoodType, Filters, RecommendationResult } from '@/types'
import { MOOD_CONFIG } from '@/lib/mockData'
import { MoodSelector } from '@/components/MoodSelector'
import { MovieCard } from '@/components/MovieCard'
import { FiltersPanel } from '@/components/Filters'
import { usePersonalization } from '@/context/PersonalizationContext'
import { getSurpriseMovie } from '@/lib/recommendations'
import { useRouter } from 'next/navigation'

function RecommendationsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { history, insights } = usePersonalization()

  const initialMood = (searchParams.get('mood') as MoodType) || null
  const hiddenOnly = searchParams.get('hidden') === 'true'

  const [selectedMood, setSelectedMood] = useState<MoodType | null>(initialMood)
  const [filters, setFilters] = useState<Filters>({
    hiddenGemsOnly: hiddenOnly || undefined,
  })
  const [results, setResults] = useState<RecommendationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showExplanations, setShowExplanations] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchRecommendations = useCallback(
    async (mood: MoodType, currentFilters: Filters, currentPage: number) => {
      setLoading(true)
      try {
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mood,
            filters: currentFilters,
            page: currentPage,
            limit: 20,
          }),
        })
        const json = await res.json()
        if (json.success) {
          if (currentPage === 1) {
            setResults(json.data.results)
          } else {
            setResults((prev) => [...prev, ...json.data.results])
          }
          setHasMore(json.data.hasMore)
          setTotal(json.data.total)
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (selectedMood) {
      setPage(1)
      fetchRecommendations(selectedMood, filters, 1)
    }
  }, [selectedMood, filters, fetchRecommendations])

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood)
    setPage(1)
  }

  const handleLoadMore = () => {
    if (selectedMood && !loading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchRecommendations(selectedMood, filters, nextPage)
    }
  }

  const handleSurprise = () => {
    const movie = getSurpriseMovie(
      selectedMood ?? undefined,
      history.watchlist.map((w) => w.movieId)
    )
    if (movie) {
      router.push(`/movie/${movie.id}`)
    }
  }

  const moodConfig = MOOD_CONFIG.find((m) => m.id === selectedMood)

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {selectedMood ? (
            <>
              {moodConfig?.emoji} {moodConfig?.label} Picks
            </>
          ) : (
            'Discover by Mood'
          )}
        </h1>
        {selectedMood && (
          <p className="text-gray-400">
            {total} films matching your {moodConfig?.label.toLowerCase()} mood
          </p>
        )}
      </div>

      {/* Personalization insight */}
      {insights.suggestion && history.moodHistory.length > 0 && (
        <div className="card p-4 mb-6 flex items-start gap-3 bg-violet-900/20 border-violet-500/20">
          <span className="text-2xl">🧠</span>
          <div>
            <p className="text-violet-300 text-sm font-medium">Personalized for you</p>
            <p className="text-gray-400 text-sm">{insights.suggestion}</p>
          </div>
        </div>
      )}

      {/* Mood Selector */}
      <div className="mb-8">
        <p className="text-gray-400 text-sm mb-3">
          {selectedMood ? 'Switch your mood:' : 'How are you feeling right now?'}
        </p>
        <MoodSelector
          onSelect={handleMoodSelect}
          selectedMood={selectedMood}
          compact={!!selectedMood}
        />
      </div>

      {/* Toolbar */}
      {selectedMood && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <FiltersPanel filters={filters} onChange={setFilters} />

          <button
            onClick={() => setShowExplanations(!showExplanations)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showExplanations
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'bg-[#1a1a24] border-[#2a2a3a] text-gray-300 hover:border-violet-500'
            }`}
          >
            💡 Why These?
          </button>

          <button
            onClick={handleSurprise}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a2a3a] bg-[#1a1a24] text-gray-300 hover:bg-amber-600 hover:border-amber-500 hover:text-white text-sm font-medium transition-all"
          >
            🎲 Surprise Me
          </button>

          <div className="ml-auto text-sm text-gray-400">
            {total} result{total !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Results Grid */}
      {loading && results.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-[2/3] rounded-xl mb-2" />
              <div className="skeleton h-4 w-3/4 mb-1" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((result) => (
              <MovieCard
                key={result.movie.id}
                movie={result.movie}
                recommendation={result}
                showExplanation={showExplanations}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="btn-secondary px-8 py-3"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : selectedMood ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🎬</p>
          <p className="text-white font-semibold text-lg mb-2">No matches found</p>
          <p className="text-gray-400 text-sm mb-6">
            Try adjusting your filters or switching your mood
          </p>
          <button onClick={() => setFilters({})} className="btn-secondary">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">🎭</p>
          <p className="text-lg">Select a mood to get started</p>
        </div>
      )}
    </div>
  )
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <RecommendationsContent />
    </Suspense>
  )
}
