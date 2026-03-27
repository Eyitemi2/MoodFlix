'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { Movie } from '@/types'
import { MovieCard } from '@/components/MovieCard'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<Movie[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=20`)
      const json = await res.json()
      if (json.success) {
        setResults(json.data.movies)
        setTotal(json.data.total)
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Trigger search when URL has a query param
  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery)
    }
  }, [initialQuery, doSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      doSearch(query)
    }
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Search</h1>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, director, cast, or genre..."
            className="input-field text-base"
            autoFocus
          />
          <button type="submit" className="btn-primary px-6 flex-shrink-0">
            Search
          </button>
        </form>

        {/* Quick mood links */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <span className="text-gray-500 text-sm mr-1">Try:</span>
          {['Christopher Nolan', 'Comedy', 'Hidden Gems', '2019', 'Thriller'].map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term)
                router.push(`/search?q=${encodeURIComponent(term)}`)
                doSearch(term)
              }}
              className="text-xs text-violet-400 hover:text-violet-300 bg-violet-900/20 border border-violet-500/20 px-3 py-1 rounded-full transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-[2/3] rounded-xl mb-2" />
              <div className="skeleton h-4 w-3/4 mb-1" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : searched ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-400 text-sm">
              {total} result{total !== 1 ? 's' : ''} for{' '}
              <span className="text-white font-medium">"{initialQuery || query}"</span>
            </p>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-white font-semibold text-lg mb-2">No results found</p>
              <p className="text-gray-400 text-sm mb-6">
                Try a different title, director, or genre
              </p>
              <button
                onClick={() => setQuery('')}
                className="btn-secondary"
              >
                Clear Search
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <p className="text-5xl mb-4">🎬</p>
          <p>Search for movies, directors, or genres</p>
        </div>
      )}
    </div>
  )
}
