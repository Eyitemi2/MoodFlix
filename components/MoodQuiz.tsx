'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { MoodType } from '@/types'
import { MOOD_CONFIG } from '@/lib/mockData'

// ─── Quiz Data ────────────────────────────────────────────────────────────────

interface QuizQuestion {
  id: string
  text: string
  options: {
    label: string
    emoji: string
    moods: MoodType[] // moods this answer contributes to
    weight: number    // scoring weight
  }[]
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'energy',
    text: "What's your energy level right now?",
    options: [
      { label: 'Totally drained', emoji: '🛋️', moods: ['relaxed', 'emotional'], weight: 2 },
      { label: 'Low, want to unwind', emoji: '☕', moods: ['relaxed', 'nostalgic'], weight: 2 },
      { label: 'Normal, just chilling', emoji: '😊', moods: ['playful', 'romantic'], weight: 2 },
      { label: 'High, ready to go!', emoji: '⚡', moods: ['adventurous', 'thrilled'], weight: 2 },
    ],
  },
  {
    id: 'feeling',
    text: 'Which feeling is closest to your current state?',
    options: [
      { label: 'Happy & light', emoji: '😄', moods: ['playful', 'relaxed'], weight: 3 },
      { label: 'Thoughtful & deep', emoji: '🤔', moods: ['curious', 'emotional', 'dark'], weight: 3 },
      { label: 'Nostalgic & warm', emoji: '🕰️', moods: ['nostalgic', 'romantic'], weight: 3 },
      { label: 'Tense or edgy', emoji: '😬', moods: ['thrilled', 'dark'], weight: 3 },
    ],
  },
  {
    id: 'social',
    text: 'Are you watching alone or with someone?',
    options: [
      { label: 'Solo — deep dive', emoji: '🎧', moods: ['dark', 'curious', 'inspired'], weight: 1 },
      { label: 'Solo — fun night', emoji: '🍿', moods: ['playful', 'adventurous'], weight: 1 },
      { label: 'With a partner', emoji: '💑', moods: ['romantic', 'playful'], weight: 2 },
      { label: 'With friends/family', emoji: '👨‍👩‍👧', moods: ['playful', 'nostalgic', 'adventurous'], weight: 2 },
    ],
  },
  {
    id: 'want',
    text: 'What do you want from this watch session?',
    options: [
      { label: 'Cry it out', emoji: '😭', moods: ['emotional'], weight: 4 },
      { label: 'Laugh out loud', emoji: '😂', moods: ['playful'], weight: 4 },
      { label: 'Get my heart racing', emoji: '😱', moods: ['thrilled', 'adventurous'], weight: 4 },
      { label: 'Feel inspired', emoji: '💡', moods: ['inspired', 'emotional'], weight: 4 },
    ],
  },
  {
    id: 'vibe',
    text: 'Pick a vibe that appeals to you right now:',
    options: [
      { label: 'Dark & psychological', emoji: '🌑', moods: ['dark', 'curious'], weight: 3 },
      { label: 'Sweet & romantic', emoji: '💕', moods: ['romantic', 'playful'], weight: 3 },
      { label: 'Epic & cinematic', emoji: '🗺️', moods: ['adventurous', 'inspired'], weight: 3 },
      { label: 'Cozy & familiar', emoji: '🛖', moods: ['relaxed', 'nostalgic'], weight: 3 },
    ],
  },
]

// ─── Mood Scoring ─────────────────────────────────────────────────────────────

function scoreAnswers(
  answers: Record<string, { moods: MoodType[]; weight: number }>
): MoodType {
  const scores: Record<string, number> = {}

  Object.values(answers).forEach(({ moods, weight }) => {
    moods.forEach((mood) => {
      scores[mood] = (scores[mood] ?? 0) + weight
    })
  })

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return (sorted[0]?.[0] ?? 'relaxed') as MoodType
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MoodQuizProps {
  onComplete?: (mood: MoodType) => void
  onClose?: () => void
}

export function MoodQuiz({ onComplete, onClose }: MoodQuizProps) {
  const router = useRouter()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<
    Record<string, { moods: MoodType[]; weight: number }>
  >({})
  const [result, setResult] = useState<MoodType | null>(null)
  const [animating, setAnimating] = useState(false)

  const question = QUIZ_QUESTIONS[currentQ]
  const progress = ((currentQ) / QUIZ_QUESTIONS.length) * 100
  const isLast = currentQ === QUIZ_QUESTIONS.length - 1

  const handleAnswer = (option: QuizQuestion['options'][0]) => {
    const newAnswers = {
      ...answers,
      [question.id]: { moods: option.moods, weight: option.weight },
    }
    setAnswers(newAnswers)

    if (isLast) {
      const mood = scoreAnswers(newAnswers)
      setResult(mood)
    } else {
      setAnimating(true)
      setTimeout(() => {
        setCurrentQ((q) => q + 1)
        setAnimating(false)
      }, 200)
    }
  }

  const handleGoWatch = () => {
    if (result) {
      if (onComplete) {
        onComplete(result)
      } else {
        router.push(`/recommendations?mood=${result}`)
      }
    }
  }

  const moodConfig = MOOD_CONFIG.find((m) => m.id === result)

  // Result screen
  if (result && moodConfig) {
    return (
      <div className="text-center px-4 py-8 animate-fade-in">
        <div className="text-6xl mb-4">{moodConfig.emoji}</div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Your mood is:{' '}
          <span className={moodConfig.textColor}>{moodConfig.label}</span>
        </h2>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
          {moodConfig.description}
        </p>

        {/* Mood score breakdown */}
        <div className="card p-4 mb-8 text-left max-w-xs mx-auto">
          <p className="text-xs text-gray-500 mb-3">Your mood profile</p>
          {Object.entries(
            Object.values(answers).reduce(
              (acc, { moods, weight }) => {
                moods.forEach((m) => { acc[m] = (acc[m] ?? 0) + weight })
                return acc
              },
              {} as Record<string, number>
            )
          )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([mood, score]) => {
              const mc = MOOD_CONFIG.find((m) => m.id === mood)
              const max = 16
              const pct = Math.min((score / max) * 100, 100)
              return (
                <div key={mood} className="flex items-center gap-2 mb-2">
                  <span className="text-sm w-4">{mc?.emoji}</span>
                  <span className="text-xs text-gray-400 w-20 capitalize">{mood}</span>
                  <div className="flex-1 h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${mc?.gradient} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-6">{score}</span>
                </div>
              )
            })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleGoWatch}
            className="btn-primary px-8 py-3"
          >
            Find {moodConfig.label} Films →
          </button>
          <button
            onClick={() => {
              setCurrentQ(0)
              setAnswers({})
              setResult(null)
            }}
            className="btn-secondary"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    )
  }

  // Question screen
  return (
    <div className={`transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Question {currentQ + 1} of {QUIZ_QUESTIONS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-1.5 bg-[#2a2a3a] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="text-xl font-bold text-white mb-6 text-center">
        {question.text}
      </h3>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((option) => (
          <button
            key={option.label}
            onClick={() => handleAnswer(option)}
            className="card p-4 text-left hover:border-violet-500 hover:bg-violet-900/10 transition-all duration-200 active:scale-95 group"
          >
            <span className="text-2xl mb-2 block">{option.emoji}</span>
            <span className="text-white text-sm font-medium group-hover:text-violet-300 transition-colors">
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {/* Back button */}
      {currentQ > 0 && (
        <button
          onClick={() => setCurrentQ((q) => q - 1)}
          className="mt-4 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Back
        </button>
      )}
    </div>
  )
}
