'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useWatchlist } from '@/context/WatchlistContext'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { count } = useWatchlist()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const isActive = (path: string) =>
    pathname === path ? 'text-white' : 'text-gray-400 hover:text-white'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f13]/80 backdrop-blur-md border-b border-[#2a2a3a]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl">🎬</span>
          <span className="font-bold text-xl text-gradient">MoodFlix</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden sm:flex items-center gap-1">
          <Link href="/" className={`btn-ghost text-sm transition-colors ${isActive('/')}`}>
            Home
          </Link>
          <Link
            href="/recommendations"
            className={`btn-ghost text-sm transition-colors ${isActive('/recommendations')}`}
          >
            Discover
          </Link>
          <Link
            href="/search"
            className={`btn-ghost text-sm transition-colors ${isActive('/search')}`}
          >
            Search
          </Link>
          <Link
            href="/quiz"
            className={`btn-ghost text-sm transition-colors ${isActive('/quiz')}`}
          >
            🎭 Mood Quiz
          </Link>
          <Link
            href="/surprise"
            className={`btn-ghost text-sm transition-colors ${isActive('/surprise')}`}
          >
            🎲 Surprise Me
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {/* Search toggle */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="input-field text-sm w-48 sm:w-64 py-1.5"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-gray-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="btn-ghost"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
            </button>
          )}

          {/* Watchlist */}
          <Link href="/watchlist" className="relative btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  )
}
