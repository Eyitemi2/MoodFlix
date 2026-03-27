import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { WatchlistProvider } from '@/context/WatchlistContext'
import { PersonalizationProvider } from '@/context/PersonalizationContext'
import { ThemeProvider } from '@/context/ThemeContext'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'MoodFlix — Find What to Watch Based on How You Feel',
    template: '%s | MoodFlix',
  },
  description:
    'Tell us how you feel. We\'ll find what to watch. Mood-based movie and series recommendations powered by your emotions.',
  keywords: [
    'movie recommendations',
    'mood based movies',
    'what to watch',
    'film discovery',
    'series recommendations',
  ],
  openGraph: {
    title: 'MoodFlix',
    description: 'Tell us how you feel. We\'ll find what to watch.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans min-h-screen bg-[#0f0f13] text-white`}>
        <ThemeProvider>
          <PersonalizationProvider>
            <WatchlistProvider>
              <Navbar />
              <main className="pt-16">
                {children}
              </main>
            </WatchlistProvider>
          </PersonalizationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
