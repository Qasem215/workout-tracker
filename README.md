# Workout Tracker

A gamified, minimalist workout tracking Progressive Web App (PWA). Log sets, earn XP, level up, and unlock trophies — all offline, all in your browser, no account required.

**Live app → [qasem215.github.io/workout-tracker](https://qasem215.github.io/workout-tracker/)**

---

## What it does

- **Log workouts** — pick a muscle group, choose an exercise, log sets with reps and weight one at a time
- **Track personal records** — last performance and all-time PRs shown before every set
- **Earn XP & level up** — +25 XP per set, +150 XP session bonus (≥3 different exercises)
- **Unlock trophies** — 23 trophies across Bronze, Silver, Gold, and Platinum tiers with toast notifications
- **Swap exercises** — replace any exercise with its alternative; PRs stay linked to the original
- **Export / import** — download a JSON backup and restore it on any device
- **Works offline** — full PWA with a service worker; install it to your home screen

---

## How to use

1. Open the app on any device
2. Tap **Workout** → choose a muscle group → choose an exercise
3. Enter reps and weight → tap **Add Set**
4. Repeat for each set; your XP and session stats update live
5. Check the **Trophy Room** to see your progress toward unlocks
6. Go to **Settings** to change theme, weight unit (kg/lbs), or export your data

---

## Exercise database

48 exercises across 6 muscle groups (Chest, Back, Shoulders, Arms, Legs, Core), each available in Beginner, Intermediate, and Advanced difficulty. Sourced from `workouts.md` at the root of this repo — plain Markdown, easy to edit.

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| PWA | vite-plugin-pwa (Workbox) |
| Styling | CSS custom properties — no CSS-in-JS |
| State | React Context + useReducer, persisted to localStorage |
| Routing | Hash-based (`#dashboard`, `#workout`, `#trophies`, `#settings`) |
| Font | Nunito (Google Fonts) |
| Deploy | GitHub Pages via `gh-pages` |

No backend. No database. No account. Everything lives in your browser's localStorage.

---

## Run locally

```bash
git clone https://github.com/Qasem215/workout-tracker.git
cd workout-tracker
npm install
npm run dev
```

App runs at `http://localhost:5173/workout-tracker/`.

---

## Deploy

```bash
npm run deploy
```

Builds the app and pushes `dist/` to the `gh-pages` branch automatically.

---

## Adding exercises or trophies

Edit `workouts.md` at the project root — it's plain Markdown parsed at runtime. The format is:

```markdown
# Difficulty: Beginner

## Muscle Group: Chest

### Exercise Name
- **Equipment**: Dumbbells
- **Alternative**: Another Exercise Name
- **Description**: How to perform it.
```

Trophies follow the same file under `# Trophy Registry`. No code changes needed for new entries.
