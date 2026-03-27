# 📡 MoodFlix API Documentation

Base URL: `https://your-domain.vercel.app` (or `http://localhost:3000` for dev)

All responses follow the shape:
```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": "Description" }
```

---

## POST `/api/recommendations`

Get mood-based movie recommendations, scored and explained.

**Rate limit:** 30 requests / 60 seconds per IP

### Request

```http
POST /api/recommendations
Content-Type: application/json
```

```json
{
  "mood": "curious",
  "filters": {
    "genres": ["Thriller", "Mystery"],
    "yearFrom": 2000,
    "yearTo": 2024,
    "minRating": 7.5,
    "maxDuration": 150,
    "platforms": ["Netflix", "Prime Video"],
    "hiddenGemsOnly": false,
    "includeNonEnglish": true
  },
  "page": 1,
  "limit": 20
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `mood` | string (enum) | ✅ | One of 10 valid moods (see Moods table) |
| `filters` | object | ❌ | Optional filter constraints |
| `filters.genres` | string[] | ❌ | Filter to specific genres |
| `filters.yearFrom` | number | ❌ | Earliest release year |
| `filters.yearTo` | number | ❌ | Latest release year |
| `filters.minRating` | number (0–10) | ❌ | Minimum IMDb-style rating |
| `filters.maxDuration` | number (minutes) | ❌ | Maximum film duration |
| `filters.platforms` | string[] | ❌ | Filter to streaming platforms |
| `filters.hiddenGemsOnly` | boolean | ❌ | Return only hidden gem films |
| `page` | number | ❌ | Page number (default: 1) |
| `limit` | number (1–50) | ❌ | Results per page (default: 20) |

### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "movie": {
          "id": 27205,
          "title": "Inception",
          "year": 2010,
          "rating": 8.8,
          "voteCount": 2200000,
          "duration": 148,
          "genres": ["Action", "Science Fiction", "Thriller"],
          "moods": ["curious", "thrilled", "adventurous"],
          "synopsis": "A thief who steals corporate secrets...",
          "posterPath": "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
          "trailerKey": "YoHD9XEInc0",
          "cast": ["Leonardo DiCaprio", "Joseph Gordon-Levitt"],
          "director": "Christopher Nolan",
          "platforms": ["Max", "Prime Video"],
          "isHiddenGem": false,
          "popularityScore": 94,
          "language": "en"
        },
        "score": 92,
        "explanation": "Inception is an exceptional match for your current mood...",
        "matchReasons": [
          "Perfectly matched to your curious mood as its primary vibe",
          "Critically acclaimed with a 8.8/10 rating",
          "Directed by acclaimed filmmaker Christopher Nolan"
        ],
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

### Valid Moods

| Mood | Description |
|---|---|
| `relaxed` | Cozy, feel-good, easy watching |
| `playful` | Comedies and fun adventures |
| `emotional` | Moving dramas |
| `thrilled` | Thrillers and horror |
| `adventurous` | Action and epic journeys |
| `romantic` | Love stories |
| `inspired` | Biopics and motivational |
| `nostalgic` | Classics and retro |
| `curious` | Mysteries and mind-benders |
| `dark` | Noir and psychological |

### Error Responses

| Status | Code | Meaning |
|---|---|---|
| 400 | Bad Request | Invalid mood, missing fields, validation failure |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## GET `/api/movies/[id]`

Get full movie details plus a list of similar films.

**Cache:** `s-maxage=86400` (ISR — 24 hours)

### Request

```http
GET /api/movies/27205
```

### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "movie": { /* full Movie object */ },
    "similar": [ /* array of up to 6 Movie objects */ ]
  }
}
```

### Error Responses

| Status | Meaning |
|---|---|
| 400 | Invalid (non-numeric) movie ID |
| 404 | Movie not found in library |

---

## GET `/api/trending`

Get trending movies sorted by a combined popularity + rating score.

**Cache:** `s-maxage=3600` (ISR — 1 hour)

### Request

```http
GET /api/trending?limit=12
```

| Param | Type | Default | Max |
|---|---|---|---|
| `limit` | number | 12 | 30 |

### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "movies": [ /* Movie[] */ ],
    "count": 12
  }
}
```

---

## GET `/api/search`

Full-text search across title, director, cast, genres, synopsis, and moods.

**Cache:** `s-maxage=300` (5 minutes)
**Rate limit:** 60 requests / 60 seconds per IP

### Request

```http
GET /api/search?q=christopher+nolan&page=1&limit=20
```

| Param | Type | Required | Description |
|---|---|---|---|
| `q` | string (1–100 chars) | ✅ | Search query |
| `page` | number | ❌ | Page number (default: 1) |
| `limit` | number (1–50) | ❌ | Results per page (default: 20) |

### Response `200 OK`

```json
{
  "success": true,
  "data": {
    "movies": [ /* Movie[] */ ],
    "total": 3,
    "query": "christopher nolan",
    "page": 1
  }
}
```

---

## GET `/api/watchlist`

**V1 — requires auth.** Returns placeholder in MVP.

```http
GET /api/watchlist
Authorization: Bearer <session-token>
```

---

## POST `/api/watchlist`

Add a movie to the authenticated user's watchlist.

```http
POST /api/watchlist
Content-Type: application/json

{ "movieId": 27205 }
```

**Response `201 Created`**
```json
{ "success": true, "data": { "movieId": 27205, "added": true } }
```

---

## PATCH `/api/watchlist`

Update a watchlist item's status and optional rating.

```http
PATCH /api/watchlist
Content-Type: application/json

{
  "movieId": 27205,
  "status": "watched",
  "rating": 5
}
```

| `status` values | Meaning |
|---|---|
| `to_watch` | Saved, not yet watched |
| `watched` | Marked as watched |
| `loved` | Watched and loved it |

---

## DELETE `/api/watchlist`

Remove a movie from the watchlist.

```http
DELETE /api/watchlist?movieId=27205
```

---

## Movie Object Schema

```typescript
interface Movie {
  id: number              // TMDB movie ID
  title: string
  year: number
  rating: number          // 0–10 (IMDb-style)
  voteCount: number
  duration: number        // minutes
  genres: string[]
  moods: MoodType[]       // primary mood first
  synopsis: string
  posterPath: string      // TMDB path: /abc123.jpg
  trailerKey: string      // YouTube video ID
  cast: string[]
  director: string
  platforms: string[]     // streaming platforms
  isHiddenGem: boolean
  popularityScore: number // 0–100
  language: string        // ISO 639-1 code
}
```

**Poster URL construction:**
```
https://image.tmdb.org/t/p/w500{posterPath}
```

**Trailer URL construction:**
```
https://www.youtube.com/watch?v={trailerKey}
```
