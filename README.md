# ⚔️ CodeQuest

A game for learning to code. Like Codecademy, freeCodeCamp and Scrimba, but built around **XP, streaks, boss fights, animated visuals and real code that actually runs**.

It's designed for **20–30 minutes a day**, taking you from noob to job-ready over **3–9 months**. It covers JavaScript, TypeScript, React, how computers really work, Python, SQL, Alembic migrations, data structures and algorithms, servers, system design, AWS, and AI engineering (RAG, embeddings, agents).

> Built for someone who started as a junior dev, leaned on AI from day one, and now wants to *actually understand* what's going on. The rule is simple: **no AI in the arena.**

## What a lesson looks like

Every lesson mixes a few kinds of steps:

| Step | What you do |
| --- | --- |
| 🧸 **Concept** | Opens with a "stupid simple" everyday analogy, *then* the real explanation with code |
| 👀 **Visual** | An animated step-through. Watch the code run line by line while the call stack, memory, queues and data change next to it |
| 🎯 **Quiz** | "Predict the output", "spot the bug", pick the right design. Wrong answers come back later in spaced-repetition review |
| ⌨️ **Code** | Write real code in a VS Code-style editor. It runs in your browser and automated tests check it |
| 🧠 **Explain it back** | Explain the idea in your own words (Feynman technique). Your answers are saved to a journal |

### Your code really runs (all in the browser, no server)

| Language | How it runs |
| --- | --- |
| JavaScript | In a Web Worker with a 3-second timeout, so an infinite loop can't freeze the tab |
| TypeScript | The **real TypeScript compiler** checks types first. Type errors block the run, just like CI |
| React + TSX | Renders live in a sandboxed preview. Tests click buttons and type into inputs |
| Python | Real CPython via [Pyodide](https://pyodide.org) (WebAssembly). Downloads about 10 MB the first time |
| SQL | Real SQLite via [sql.js](https://sql.js.org). Each run gets a fresh database |

### Game mechanics

- **XP and 17 levels**, from *Noob* to *Staff Legend*
- **Daily streaks**. Buy a 🧊 streak freeze with gems so one missed day doesn't reset it
- **Combos** for first-try correct answers
- **Boss lessons** at the end of each realm
- **14 achievements**, including *Raw Brainpower*: 10 challenges passed with no hints
- **25-minute focus session timer** that counts your daily minutes and pays bonus XP
- **Spaced repetition review**: questions come back after 1 → 3 → 7 → 17… days
- **Activity heatmap**, journal, and progress export/import

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run build` | Type-check and build to `dist/` |
| `npm run validate` | Run every challenge's solution against its tests (and check the starter code fails) |
| `npm run lint` | Run oxlint |

Your progress lives in your browser's localStorage. There are no accounts and no backend. Use **Profile → Export** to back it up.

## Host it for free

The app is a static site (no server, no database), so any free static host works.

**Vercel (recommended):** push this repo to GitHub, then at [vercel.com/new](https://vercel.com/new) import it. Vercel detects Vite automatically (build: `npm run build`, output: `dist`). The Hobby plan is free, and every push to `main` redeploys.

Netlify, Cloudflare Pages and GitHub Pages also work with the same settings.

**Install it like an app:** once it's hosted, open it in Chrome or Edge and choose *Install CodeQuest* (the icon in the address bar). On iPhone, use Share → *Add to Home Screen*. It then opens in its own window with its own icon.

## Project layout

```
src/
  content/        ← all the lessons (one file per realm). This is where you add content.
    visuals.ts    ← the animated step-throughs
  engine/         ← code runners: runJs, runReact, runPython, runSql + the test harness
  game/           ← XP, levels, streaks, achievements, spaced repetition
  components/     ← UI: lesson player, code editor, quiz, visualizer, pages
scripts/
  validate-content.ts   ← checks every lesson before it ships
```

## Adding a lesson

Open the realm's file in `src/content/` and add an entry to `lessons` (copy an existing one). Then run `npm run validate`. It fails if your solution doesn't pass your tests, or if the starter code passes without any work. See [CURRICULUM.md](./CURRICULUM.md) for the full roadmap and the list of lessons still to build.
