'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[MoodFlix ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <p className="text-4xl mb-4">🎬</p>
            <h2 className="text-xl font-semibold text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              className="btn-secondary"
            >
              Try Again
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
