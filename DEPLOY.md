# 🚀 MoodFlix Deployment Guide

This guide covers pushing to GitHub and deploying to Vercel in under 5 minutes.

---

## Step 1 — Get a GitHub Personal Access Token

1. Go to → **https://github.com/settings/tokens/new**
2. Set note: `MoodFlix deploy`
3. Set expiry: 30 days (or no expiry)
4. Check scope: ✅ **repo** (full repository access)
5. Click **Generate token**
6. **Copy the token** (you won't see it again)

---

## Step 2 — Push to GitHub

Open your terminal, navigate to this folder, then run:

```bash
# Replace YOUR_PAT with the token you just copied
git push https://YOUR_PAT@github.com/Eyitemi2/MoodFlix.git main
```

**Example:**
```bash
git push https://ghp_abc123xyz@github.com/Eyitemi2/MoodFlix.git main
```

That's it — your code is on GitHub.

---

## Step 3 — Deploy to Vercel (GitHub Integration)

1. Go to **https://vercel.com/new**
2. Click **"Import Git Repository"**
3. Select **Eyitemi2/MoodFlix**
4. Vercel auto-detects Next.js — no framework config needed
5. Under **Environment Variables**, add:
   ```
   TMDB_API_KEY     = (leave blank for MVP — mock data works)
   ```
6. Click **Deploy**

Your live URL will be: `https://moodflix-eyitemi2.vercel.app` (or similar)

---

## Step 4 — Automatic CI/CD (free)

After the first deploy, every `git push` to `main` triggers a new production deployment automatically. No extra setup needed.

---

## Optional: Add a Custom Domain

In Vercel Dashboard → Project → Settings → Domains → Add `moodflix.com` or any domain you own.

---

## Environment Variables Reference

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Required |
|---|---|---|
| `TMDB_API_KEY` | From themoviedb.org/settings/api | Optional (MVP uses mock data) |
| `DATABASE_URL` | Neon/Supabase PostgreSQL URL | V1 only |
| `DATABASE_URL_UNPOOLED` | Direct (non-pooled) DB URL | V1 only |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | V1 only |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | V1 only |

---

## Vercel CLI (Alternative)

If you prefer the CLI instead of the dashboard:

```bash
# Install Vercel CLI
npm i -g vercel

# Inside the project folder
vercel login
vercel --prod
```

---

## Troubleshooting

**Build fails with "Cannot find module @prisma/client"**
→ This is expected if DATABASE_URL isn't set. Remove the Prisma import from `lib/prisma.ts` for MVP (it's not used until V1 auth is added).

**Images not loading**
→ TMDB images are publicly accessible. If they fail, check `next.config.ts` has `image.tmdb.org` in `remotePatterns`.

**API routes 500 in production**
→ Check Vercel Function logs: Dashboard → Deployments → Functions tab.
