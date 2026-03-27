'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'moodflix_theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    const preferred =
      stored ??
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
    setTheme(preferred)
    document.documentElement.classList.toggle('dark', preferred === 'dark')
    document.documentElement.classList.toggle('light', preferred === 'light')
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      document.documentElement.classList.toggle('light', next === 'light')
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
