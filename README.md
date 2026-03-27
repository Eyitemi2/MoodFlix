# 🎬 MoodFlix

> **Tell us how you feel. We'll find what to watch.**

MoodFlix is a mood-based movie and series recommendation platform built with **Next.js 14 App Router**, deployed on **Vercel**. Instead of browsing endless catalogs, users pick their current mood and receive instant, scored, explainable recommendations from a curated library of 50+ films.

---

## ✨ Features

### MVP (Shipped)
- 🎭 **10-mood selector** — Relaxed, Playful, Emotional, Thrilled, Adventurous, Romantic, Inspired, Nostalgic, Curious, Dark
- 🧠 **Intelligent scoring engine** — Mood match (40%) + Rating (25%) + Popularity (20%) + Recency (10%) + Hidden gem bonus
- 💡 **"Why This?" explainer** — Natural language explanation for every recommendation
- 🎲 **Surprise Me** — Weighted random film picker with mood filter
- 🎭 **Mood Quiz** — 5-question quiz for users who can't name their mood
- 💎 **Hidden Gems** — Surfaces overlooked high-quality films
- 📋 **Watchlist** — Save, mark watched, rate 1–5 stars (localStorage MVP)
- 🔍 **Search** — Full-text search by title, director, cast, genre
- 🌙 **Dark/Light mode** — Persisted theme toggle
- 📱 **Fully responsive** — Mobile, tablet, desktop

### V1 (Next)
- 🔐 User auth (NextAuth.js)
- ☁️ Cloud-synced watchlist (PostgreSQL via Neon)
- 📈 Personalization engine — mood history + genre affinity
- 🔗 Real TMDB API integration

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

```bash
# 1. Clone the repo
git clone https://github.com/Eyitemi2/MoodFlix.git
cd MoodFlix

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local — TMDB_API_KEY is optional (mock data used if blank)

# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Description |
|---|---|---|
| `TMDB_API_KEY` | No (MVP) | TMDB API key — get free at [themoviedb.org](https://www.themoviedb.org/settings/api) |
| `DATABASE_URL` | V1 only | PostgreSQL connection string (Neon recommended) |
| `NEXTAUTH_SECRET` | V1 only | 32+ char secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | V1 only | Your production URL |
| `NEXT_PUBLIC_APP_URL` | No | Public URL for client-side use |

> 💡 **For MVP**: Only `TMDB_API_KEY` matters, and it's optional — mock data covers 50 films out of the box.

---

## 📁 Project Structure

```
moodflix/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Home (ISR — 1h)
│   ├── recommendations/        # Mood → recommendations (SSR)
│   ├── movie/[id]/             # Movie detail (ISR — 24h)
│   ├── watchlist/              # Watchlist (CSR)
│   ├── search/                 # Search (SSR)
│   ├── surprise/               # Surprise Me (CSR)
│   ├── quiz/                   # Mood Quiz (SSR)
│   └── api/                    # Serverless API routes
│       ├── recommendations/    # POST — scored recommendations
│       ├── movies/[id]/        # GET — movie detail + similar
│       ├── trending/           # GET — trending (ISR cached)
│       ├── search/             # GET — full-text search
│       └── watchlist/          # GET|POST|PATCH|DELETE
├── components/                 # Reusable UI components
│   ├── MoodSelector.tsx        # 10-mood grid
│   ├── MovieCard.tsx           # Poster card with score bar
│   ├── TrailerPlayer.tsx       # YouTube embed player
│   ├── MoodQuiz.tsx            # 5-question quiz engine
│   ├── Filters.tsx             # Genre/year/rating filters panel
│   ├── WatchlistButton.tsx     # Add/remove watchlist
│   ├── ThemeToggle.tsx         # Dark/light mode toggle
│   ├── Navbar.tsx              # Responsive navigation
│   └── ErrorBoundary.tsx       # React error boundary
├── context/                    # React Context providers
│   ├── WatchlistContext.tsx    # Global watchlist state
│   ├── PersonalizationContext.tsx # Mood + interaction tracking
│   └── ThemeContext.tsx        # Dark/light theme state
├── lib/                        # Core business logic
│   ├── mockData.ts             # 50 curated films (TMDB data)
│   ├── recommendations.ts      # Recommendation engine
│   ├── scoring.ts              # 5-factor scoring algorithm
│   ├── personalization.ts      # User history + insights
│   └── validation.ts          # Zod schemas + rate limiting
├── types/                      # TypeScript interfaces
├── prisma/                     # Database schema (V1)
└── lib/__tests__/              # Jest unit tests
```

---

## 🧠 Recommendation Engine

The engine runs in 5 layers:

```
Layer 1 → Mood Filter       Filter movies matching selected mood
Layer 2 → Hard Filters      Apply genre/year/rating/duration/platform limits
Layer 3 → Scoring           5-factor weighted scoring per movie
Layer 4 → Personalization   Boost/suppress based on user history (V1)
Layer 5 → Explanation       Generate "Why this?" text per result
```

**Scoring weights:**

| Factor | Weight | Notes |
|---|---|---|
| Mood match (primary) | 40 pts | Movie's first mood = selected mood |
| Mood match (secondary) | 25 pts | Mood appears anywhere in moods array |
| Rating | 25 pts | Normalized from 0–10 |
| Popularity | 20 pts | Normalized from 0–100 |
| Recency | 10 pts | Degrades with film age |
| Hidden gem bonus | +5 pts | Flat bonus for gems |

---

## 📡 API Reference

### `POST /api/recommendations`
Get mood-based recommendations.

**Request body:**
```json
{
  "mood": "curious",
  "filters": {
    "genres": ["Thriller"],
    "yearFrom": 2000,
    "minRating": 7.5,
    "maxDuration": 150,
    "hiddenGemsOnly": false
  },
  "page": 1,
  "limit": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "movie": { "id": 27205, "title": "Inception", ... },
        "score": 92,
        "explanation": "Inception is an exceptional match...",
        "matchReasons": ["Perfectly matched to your curious mood", "..."],
        "moodMatchStrength": "primary"
      }
    ],
    "total": 8,
    "mood": "curious",
    "page": 1,
    "hasMore": false
  }
}
```

### `GET /api/movies/[id]`
Get movie detail + similar films.

### `GET /api/trending?limit=12`
Get trending movies (cached 1h via Vercel ISR).

### `GET /api/search?q=inception&page=1`
Full-text search across title, cast, director, genres.

### `GET|POST|PATCH|DELETE /api/watchlist`
Watchlist CRUD (auth required in V1).

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Tests cover the scoring engine and recommendation engine with 20+ test cases.

---

## 🚢 Deploying to Vercel

### Option A: GitHub Integration (recommended)

1. Push this repo to GitHub:
   ```bash
   git remote add origin https://github.com/Eyitemi2/MoodFlix.git
   git push -u origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new) → Import from GitHub → Select `MoodFlix`

3. Set environment variables in the Vercel dashboard:
   - `TMDB_API_KEY` (optional for MVP)
   - `DATABASE_URL` (required for V1)
   - `NEXTAUTH_SECRET` (required for V1)

4. Deploy. Vercel auto-detects Next.js — no config needed.

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel
```

---

## 🗺️ Roadmap

- [ ] **V1** — User auth, cloud watchlist sync, real TMDB API
- [ ] **V2** — Native mobile app (Expo)
- [ ] **V3** — Voice mood input, AI mood detection from text
- [ ] **V4** — Social features — share watchlists, friend activity

---

## 🙏 Built With

- [Next.js 14](https://nextjs.org/) — App Router, ISR, SSR, serverless functions
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first styling
- [TMDB](https://www.themoviedb.org/) — Movie data & imagery
- [Prisma](https://www.prisma.io/) — Type-safe ORM (V1)
- [Zod](https://zod.dev/) — Schema validation
- [Vercel](https://vercel.com/) — Hosting + serverless

---

## 📄 License

MIT © 2026 Eyitemi2

---

*Built with ❤️ using MoodFlix — Phase 1–9 complete.*
