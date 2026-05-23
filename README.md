# 🍳 Scramble Egg

**Chaos Management App** — Dump your brain, AI organizes.

🌐 [scramble-egg.vercel.app](https://scramble-egg.vercel.app)

---

## What is Scramble Egg?

Scramble Egg is a personal chaos manager built for non-linear thinkers. Type anything, voice your thoughts — AI auto-categorizes, summarizes, and visualizes your mental state.

Most productivity apps require structure *before* you can use them. Scramble Egg works the other way: dump first, organize never (AI does it for you).

---

## Features

| Feature | Description |
|---------|-------------|
| **⚡ Instant Dump** | Zero-friction text input. Type anything, no folders, no structure |
| **🤖 AI Auto-Categorize** | AI reads each dump and categorizes it: 💡Ide / ⚡Task / ⏳Pending / 🅿️Parking Lot / ✅Done |
| **🎤 Voice Input** | Speak in Bahasa Indonesia — Web Speech API transcribes in real-time |
| **🔍 Smart Search** | Full-text search across all dumps and AI notes with live highlighting |
| **🧠 Weekly Digest** | AI summarizes your week + 3 prioritized actions + mood |
| **🎨 Vision Board** | AI generates headline, themes, word cloud, affirmations, daily mantra from your dumps |
| **😂 Scramble Mood** | AI creates a cute illustration of your mental state — 5 scenes, auto caption + hashtags, ready to share |

---

## Tech Stack

| Layer | Tech |
|-------|------|
| **Framework** | Next.js 16 + React 19 |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Animation** | Framer Motion |
| **State** | Zustand (persisted to localStorage) |
| **AI (Text)** | DeepSeek V4 Flash Free via OpenCode Zen |
| **AI (Image)** | Pollinations AI |
| **Deployment** | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- OpenCode Zen API key ([get one here](https://opencode.ai/auth))

### Setup

```bash
# Clone
git clone https://github.com/bangnevgo/ScrambleEgg.git
cd ScrambleEgg

# Install dependencies
bun install

# Set up environment
# Create .env.local (or configure ~/.z-ai-config):
#   ZAI_API_KEY=oc-zen-your-key-here
#   ZAI_BASE_URL=https://opencode.ai/zen/v1

# Run dev server
bun dev
```

Visit `http://localhost:4000` in your browser.

---

## Project Structure

```
src/
├── app/
│   ├── api/ai/
│   │   ├── categorize/route.ts   # AI categorizes text → category + note
│   │   ├── digest/route.ts       # AI generates weekly summary
│   │   ├── vision/route.ts       # AI generates vision board
│   │   └── mood/route.ts         # AI generates image prompt + caption
│   ├── globals.css               # Theme tokens + animations
│   ├── layout.tsx                # Root layout with fonts
│   └── page.tsx                  # Main app (Dump, Search, Vision, Mood tabs)
├── components/ui/                # shadcn/ui components
├── lib/
│   ├── ai.ts                     # AI client (config via env / ~/.z-ai-config)
│   ├── db.ts                     # Prisma client (future use)
│   ├── design-token.ts           # CSS token utilities
│   └── utils.ts                  # shadcn utils
└── store/
    └── useScrambleStore.ts       # Zustand state (items, digests, visions, moods)
```

---

## API Endpoints

All AI endpoints are `POST /api/ai/{feature}`.

### `POST /api/ai/categorize`
```json
{ "text": "string" }
// → { "category": "ide|task|pending|parking", "note": "string" }
```

### `POST /api/ai/digest`
```json
{ "items": [{ "text": "string", "category": "string", "aiNote": "string" }] }
// → { "summary": "string", "priorities": ["string"], "mood": "string" }
```

### `POST /api/ai/vision`
```json
{ "items": [{ "text": "string", "category": "string", "aiNote": "string" }] }
// → { "headline": "string", "themes": ["string"], "wordCloud": ["string"],
//     "affirmations": ["string"], "dailyMantra": "string" }
```

### `POST /api/ai/mood`
```json
{ "items": [{ "text": "string", "category": "string" }], "scene": "my-brain|me-today|me-this-week|my-parking-lot|done-party" }
// → { "imageUrl": "string", "caption": "string", "hashtags": "string" }
```

---

## Deployment

Deploy to Vercel with one click:

1. Push to GitHub
2. Import repo to [vercel.com](https://vercel.com)
3. Set environment variable `ZAI_API_KEY`
4. Deploy

---

## Roadmap

- [x] Instant dump + AI categorize
- [x] Voice input (Bahasa Indonesia)
- [x] Smart search with live highlight
- [x] Weekly digest
- [x] Vision board
- [x] Scramble Mood image generator
- [ ] Edit item text
- [ ] Export / backup data
- [ ] Stats dashboard
- [ ] PWA — installable on mobile
- [ ] Auth + cloud sync

---

## The Philosophy

> **Chaos isn't the enemy of productivity. Unmanaged chaos is.**

Scramble Egg gives chaos a place to live — and AI to make sense of it.

*Berantakan itu valid. Yang penting tetap bergerak.*

---

🌐 [scramble-egg.vercel.app](https://scramble-egg.vercel.app)
