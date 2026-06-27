# Project Skills — Workout Trophy PWA

## Dev Server
```bash
cd "/Users/qasem/Desktop/PARA/1 - Projects/workout_app"
npm run dev
```
Runs at http://localhost:5173 (Vite default). Hot module replacement is active.

## Build
```bash
npm run build
```
Output goes to `dist/`. Base path is `/workout-tracker/` (configured in vite.config.ts).

## Deploy to GitHub Pages
```bash
npm run deploy
```
Uses `gh-pages` package to push `dist/` to the `gh-pages` branch.

## Parser Convention (`src/lib/markdownParser.ts`)
- Uses a state-machine approach over lines of workouts.md
- Section detected by `# Workout Database` and `# Trophy Registry` H1 headers
- Difficulty detected by `# Difficulty: X` H1 headers within the Workout Database section
- Muscle group detected by `## Muscle Group: X` H2 headers
- Exercise detected by `### ExerciseName` H3 headers
- Exercise fields parsed from `- **Field**: value` lines beneath each H3
- Trophy tier detected by `## Tier: X` H2 headers within the Trophy Registry section
- Trophy name detected by `### TrophyName` H3 headers
- Trophy fields parsed from `- **Field**: value` lines

## Trophy Engine Convention (`src/lib/trophyEngine.ts`)
- Called with `(state: UserState, exercises: Exercise[], trophies: Trophy[])`
- Returns `string[]` — names of newly unlocked trophies (not previously in `state.trophiesUnlocked`)
- Condition strings are matched with `includes()` pattern matching, not regex, for readability
- Each trophy condition maps to a pure evaluator function: `(state, exercises) => boolean`

## XP Engine Convention (`src/lib/xpEngine.ts`)
- Per set logged: +25 XP
- Session completion bonus (≥3 distinct exercises in one session): +150 XP
- Trophy unlock XP: added as specified in Trophy Registry
- Level formula: `Math.floor(Math.pow(totalXP / 200, 0.6))`
- "XP to next level" = XP threshold for `(level + 1)` minus `totalXP`

## Styling Convention
- All colors and spacing via CSS custom properties on `:root` and `[data-theme="dark"]`
- Font: Nunito loaded from Google Fonts in `index.html`
- Component styles in `src/styles/globals.css` and co-located `<style>` blocks are avoided — all CSS in `src/styles/`
- Dark mode: `document.documentElement.setAttribute('data-theme', 'dark')`

## Data Flow
```
workouts.md (public/) 
  → fetch() in useWorkouts hook 
  → markdownParser.ts 
  → Exercise[] + Trophy[] (in-memory, re-parsed on mount)

User actions (log set, swap exercise, unlock trophy) 
  → dispatch() to useReducer 
  → new UserState 
  → localStorage.setItem('workout-tracker-state', JSON.stringify(state))
  → trophyEngine evaluates new state → new unlocks → UNLOCK_TROPHY dispatch
```

## localStorage Key
`workout-tracker-state` — full UserState JSON blob.
