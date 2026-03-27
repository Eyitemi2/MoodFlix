'use client'

import React from 'react'
import { useTheme } from '@/context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#0f0f13]"
      style={{ background: isDark ? '#3730a3' : '#e2e8f0' }}
    >
      {/* Track icons */}
      <span className="absolute left-1 top-1/2 -translate-y-1/2 text-xs select-none pointer-events-none">
        {isDark ? '🌙' : ''}
      </span>
      <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs select-none pointer-events-none">
        {!isDark ? '☀️' : ''}
      </span>
      {/* Thumb */}
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${
          isDark ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
