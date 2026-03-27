'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MoodType } from '@/types'
import { MOOD_CONFIG } from '@/lib/mockData'
import { usePersonalization } from '@/context/PersonalizationContext'

interface MoodSelectorProps {
  onSelect?: (mood: MoodType) => void
  selectedMood?: MoodType | null
  compact?: boolean
}

export function MoodSelector({ onSelect, selectedMood, compact = false }: MoodSelectorProps) {
  const router = useRouter()
  const { trackMood } = usePersonalization()
  const [hoveredMood, setHoveredMood] = useState<MoodType | null>(null)

  const handleMoodClick = (mood: MoodType) => {
    trackMood(mood)
    if (onSelect) {
      onSelect(mood)
    } else {
      router.push(`/recommendations?mood=${mood}`)
    }
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {MOOD_CONFIG.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleMoodClick(mood.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
              transition-all duration-200 border
              ${
                selectedMood === mood.id
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-[#1a1a24] border-[#2a2a3a] text-gray-300 hover:border-violet-500 hover:text-white'
              }
            `}
          >
            <span>{mood.emoji}</span>
            <span>{mood.label}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Description tooltip */}
      <div className="h-8 mb-4 text-center">
        {hoveredMood && (
          <p className="text-gray-400 text-sm animate-fade-in">
            {MOOD_CONFIG.find((m) => m.id === hoveredMood)?.description}
          </p>
        )}
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {MOOD_CONFIG.map((mood) => {
          const isSelected = selectedMood === mood.id
          const isHovered = hoveredMood === mood.id

          return (
            <button
              key={mood.id}
              onClick={() => handleMoodClick(mood.id)}
              onMouseEnter={() => setHoveredMood(mood.id)}
              onMouseLeave={() => setHoveredMood(null)}
              className={`
                relative group flex flex-col items-center justify-center
                p-4 rounded-2xl border-2 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#0f0f13]
                ${
                  isSelected
                    ? `bg-gradient-to-br ${mood.gradient} border-transparent text-white shadow-lg scale-105`
                    : 'bg-[#1a1a24] border-[#2a2a3a] text-gray-300 hover:border-[#4a4a5a] hover:scale-105 hover:bg-[#22223a]'
                }
              `}
              aria-pressed={isSelected}
              aria-label={`${mood.label} mood: ${mood.description}`}
            >
              {/* Glow effect on selected */}
              {isSelected && (
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${mood.gradient} opacity-20 blur-xl`}
                />
              )}

              <span
                className={`text-3xl mb-2 transition-transform duration-200 ${
                  isHovered || isSelected ? 'scale-125' : ''
                }`}
              >
                {mood.emoji}
              </span>

              <span
                className={`text-sm font-semibold ${
                  isSelected ? 'text-white' : mood.textColor
                }`}
              >
                {mood.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
