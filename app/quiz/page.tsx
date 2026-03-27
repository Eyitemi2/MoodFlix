import React from 'react'
import { MoodQuiz } from '@/components/MoodQuiz'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mood Quiz — Find Your Vibe',
  description: 'Answer 5 quick questions and we\'ll figure out exactly what you should watch tonight.',
}

export default function QuizPage() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎭</div>
          <h1 className="text-3xl font-bold text-white mb-3">Mood Quiz</h1>
          <p className="text-gray-400">
            Not sure how you feel? Answer 5 quick questions and we'll find
            the perfect film for tonight.
          </p>
        </div>

        {/* Quiz component */}
        <div className="card p-6 sm:p-8">
          <MoodQuiz />
        </div>
      </div>
    </div>
  )
}
