# 🍳 Scramble Egg
### *Chaos Management App*

> **For minds that think in all directions at once.**

🌐 [scramble-egg.vercel.app](https://scramble-egg.vercel.app)

---

## What is Scramble Egg?

Scramble Egg is a personal chaos manager built for the way creative, entrepreneurial minds actually work — **non-linear, fast, and always full**.

Most productivity apps are designed for organized people. Scramble Egg is designed for everyone else.

**You dump. AI organizes. You focus.**

---

## Core Features

### ⚡ Instant Dump
Zero friction capture. Type anything, anytime. No folders, no categories, no structure required.

### 🤖 AI Auto-Categorize
Every item gets analyzed by AI and sorted into:
- 💡 **Ide** — creative ideas and sparks
- ⚡ **Task** — things that need doing now
- ⏳ **Pending** — in progress or waiting
- 🅿️ **Parking Lot** — good ideas, not yet the right time
- ✅ **Done** — completed and celebrated

### 🎤 Voice Input
Speak in Bahasa Indonesia — Web Speech API transcribes and AI categorizes in real time.

### 🔍 Smart Search
Full-text search across item text and AI notes with live highlighting.

### 🧠 Weekly Digest
One tap. AI reads everything on your plate and gives you a summary, 3 prioritized actions, and your overall mood.

### 🎨 Vision Board
AI extracts themes and energy from your chaos and turns it into a personal vision board with headline, word cloud, affirmations, and daily mantra.

### 😂 Scramble Mood
AI reads your chaos level and generates a cute illustration of your mental state — 5 scenes, with auto caption + hashtags, ready to share.

---

## Tech Stack

| Frontend | AI | Deployment |
|----------|----|-----------|
| Next.js 16 + React 19 | DeepSeek V4 Flash Free (OpenCode Zen) | Vercel |
| Tailwind CSS 4 + shadcn/ui | Pollinations AI (image gen) | |
| Framer Motion + Zustand | | |
| Web Speech API (voice) | | |

---

## Getting Started

```bash
git clone https://github.com/bangnevgo/ScrambleEgg.git
cd ScrambleEgg
bun install
bun dev
```

Environment: set `ZAI_API_KEY` (get at [opencode.ai/auth](https://opencode.ai/auth)) in `.env.local` or Vercel dashboard.

---

## Project Structure

```
src/
├── app/api/ai/          # categorize, digest, vision, mood
├── components/ui/       # shadcn/ui components
├── lib/                 # ai, db, utils
└── store/               # zustand state
```

---

## API

All endpoints: `POST /api/ai/{categorize|digest|vision|mood}`

See [API docs](src/app/api/ai/) for request/response schemas.

---

## Roadmap

- [x] Dump + AI categorize
- [x] Voice input (Bahasa Indonesia)
- [x] Smart search
- [x] Weekly digest, Vision Board, Mood Board
- [ ] Edit item text
- [ ] Export / backup
- [ ] Stats dashboard
- [ ] PWA — installable on mobile
- [ ] Auth + cloud sync

---

## Philosophy

Productivity culture has a toxic relationship with chaos. Everything has to be organized, color-coded, and reviewed weekly. But the most creative people don't work that way.

**Chaos isn't the enemy of productivity. Unmanaged chaos is.**

Scramble Egg gives chaos a place to live — and AI to make sense of it — so your brain can stay free to do what it does best.

*Berantakan itu valid. Yang penting tetap bergerak.*

---

🌐 [scramble-egg.vercel.app](https://scramble-egg.vercel.app)
