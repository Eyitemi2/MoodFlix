import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MoodSelector } from '@/components/MoodSelector'
import { MovieCard } from '@/components/MovieCard'
import { getTrendingMovies } from '@/lib/mockData'

export const revalidate = 3600 // ISR: revalidate every hour

export default function HomePage() {
  const trending = getTrendingMovies(12)

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 sm:px-6 py-20 sm:py-28">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-transparent to-pink-950/20 pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-600/20 border border-violet-500/30 rounded-full px-4 py-1.5 mb-6">
            <span className="text-violet-400 text-sm font-medium">✨ Mood-powered discovery</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
            Tell us how you feel.
            <br />
            <span className="text-gradient">We'll find what to watch.</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Stop endlessly scrolling. Pick your mood and get instant,
            explainable recommendations from 50+ curated films and series —
            across all platforms.
          </p>

          {/* Mood Selector */}
          <MoodSelector />

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 mt-12 text-center">
            {[
              { label: 'Curated Titles', value: '50+' },
              { label: 'Mood Categories', value: '10' },
              { label: 'Streaming Platforms', value: '8+' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-gray-500 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Section ────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-16 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="section-title flex items-center gap-2">
              🔥 Trending Now
            </h2>
            <p className="text-muted text-sm mt-1">Most popular picks this week</p>
          </div>
          <Link href="/recommendations" className="btn-ghost text-sm text-violet-400 hover:text-violet-300">
            See all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {trending.slice(0, 6).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 bg-[#12121a] border-t border-[#2a2a3a]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-title mb-2">How MoodFlix Works</h2>
          <p className="text-muted mb-12">Three steps to your perfect watch</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                emoji: '🎭',
                title: 'Pick Your Mood',
                description:
                  'Choose from 10 curated moods — from Relaxed and Playful to Dark and Curious.',
              },
              {
                step: '02',
                emoji: '🧠',
                title: 'Get Smart Picks',
                description:
                  'Our engine scores and ranks films by mood match, rating, and your personal taste.',
              },
              {
                step: '03',
                emoji: '🍿',
                title: 'Watch & Save',
                description:
                  'Watch trailers, understand why each film was picked, and save to your watchlist.',
              },
            ].map(({ step, emoji, title, description }) => (
              <div key={step} className="card p-6 text-left">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{emoji}</span>
                  <div>
                    <p className="text-violet-400 text-xs font-bold mb-1">STEP {step}</p>
                    <h3 className="text-white font-semibold mb-2">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hidden Gems Teaser ────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-16 max-w-7xl mx-auto">
        <div className="card p-8 bg-gradient-to-r from-amber-900/20 to-yellow-900/10 border-amber-500/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-amber-400 font-semibold text-sm mb-2">💎 HIDDEN GEMS</p>
              <h2 className="text-2xl font-bold text-white mb-2">
                Discover overlooked masterpieces
              </h2>
              <p className="text-gray-400 text-sm max-w-md">
                Great films loved by those who've seen them — but buried under the mainstream.
                We surface them so you don't miss out.
              </p>
            </div>
            <Link href="/recommendations?hidden=true" className="btn-primary whitespace-nowrap">
              Explore Hidden Gems
            </Link>
          </div>
        </div>
      </section>

      {/* ── More Trending ────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-20 max-w-7xl mx-auto">
        <h2 className="section-title mb-6">More to Explore</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {trending.slice(6, 12).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  )
}
