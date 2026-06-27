# Workout Trophy PWA — Project State

## Current Step
**All steps complete** — app ready to deploy

## Completed Steps
- **Step 1 — Init** — claude.md, lessons_learned.md, .claude/skills.md created; Vite React TS project scaffolded; npm install complete; dev server running at http://localhost:5174/workout-tracker/
- **Step 2 — Parser** — `src/types/index.ts` + `src/lib/markdownParser.ts` complete; verified: 48 exercises (16 per difficulty), 23 trophies (Bronze 3, Silver 3, Gold 2, Platinum 15); zero TS errors
- **Step 3 — Store** — `src/store/actions.ts`, `src/store/context.tsx`, `src/lib/xpEngine.ts` complete; localStorage persistence, export/import wired, level curve verified, zero TS errors
- **Step 4 — Styling** — Full CSS design system in `globals.css`: light+dark tokens, Nunito, cards, buttons, inputs, badges, XP bar, nav shell, session bar, grid utilities. `ThemeToggle.tsx` + `Nav.tsx` built. Theme toggle lives in top-nav header. Session bar above bottom nav appears when today has logs.
- **Step 5 — Dashboard** — `src/views/Dashboard.tsx`: gradient level card, 4-stat row, today's session (empty CTA vs. in-progress recap), recent history list.
- **Step 6 — Workout Browser** — `src/views/WorkoutView.tsx`: muscle group grid → exercise list (grouped by difficulty) → exercise detail with PR display and swap controls.
- **Step 7 — Set Logger** — `src/components/workout/SetLogger.tsx`: reps/weight inputs, bodyweight toggle, quick-fill from last session, animated set list, shake on invalid, green flash on success.
- **Step 8 — Workout Swapping** — inline confirmation flow in `WorkoutView.tsx`; active-swap banner shows original name; swap indicator on exercise list; `SWAP_EXERCISE` / `RESTORE_EXERCISE` actions; logs always keyed to original name so PRs are preserved.
- **Step 9 — Trophy Engine** — `src/lib/trophyEngine.ts`: all 23 conditions evaluated (sessions, level, unique exercises, PR beats, platinum mastery). `src/hooks/useTrophyCheck.ts`: chain-unlock support, `initialUnlocked` ref prevents stale toasts on reload.
- **Step 10 — Trophy Room** — `src/views/TrophyView.tsx`: stats banner with tier breakdown, per-tier progress bars, gradient shimmer unlocked tiles with unlock date, locked tiles with lock icon. `trophyUnlockDates` added to `UserState` with localStorage migration.
- **Step 11 — Trophy Toast** — `src/components/TrophyToast.tsx`: slide-up from bottom, tier gradient text, countdown bar, Web Audio API chime (pitch varies by tier), queue-based with key-reset per entry, 4.5 s auto-dismiss.
- **Step 12 — Settings View** — `src/views/SettingsView.tsx`: Appearance (theme segmented control), Preferences (weight unit kg/lbs), Data & Backup (stats grid, export JSON, import with success/error feedback), Danger Zone (two-step reset — preserves theme/unit), About section.
- **Step 13 — PWA Config** — `vite-plugin-pwa` with `registerType: autoUpdate`, Workbox precache for `*.{js,css,html,ico,png,svg,md}`, manifest (name, theme_color #6366f1, standalone display), `public/icons/icon-192.png` + `icon-512.png` generated (black bg, white dumbbell). Build confirmed: sw.js + workbox generated, 11 entries precached.
- **Step 14 — GitHub Pages** — `.gitignore` created, git repo initialized, initial commit on `main`. Deploy script: `npm run deploy` (builds then `gh-pages -d dist`). Awaiting user to create GitHub repo `workout-tracker` and push.

## Implementation Order
1. [x] **Init** — claude.md, lessons_learned.md, .claude/skills.md, scaffold Vite project, dev server running
2. [x] **Parser** — `src/lib/markdownParser.ts` parses workouts.md into Exercise[] and Trophy[]
3. [x] **Store** — `src/store/actions.ts`, `src/store/context.tsx`, `src/lib/xpEngine.ts`
4. [x] **Styling foundation** — `globals.css` full token system, `ThemeToggle.tsx`, `Nav.tsx` with session bar
5. [x] **Dashboard view** — `src/views/Dashboard.tsx`: level card, stats row, today's session, recent history
6. [x] **Workout browser** — `src/views/WorkoutView.tsx`: muscle group grid → exercise list (grouped by difficulty) → exercise detail (description, equipment, swap controls, PR display)
7. [x] **Set logger** — `src/components/workout/SetLogger.tsx`: reps/weight inputs, bodyweight toggle, quick-fill, animated list
8. [x] **Workout swapping** — inline confirmation flow, active-swap banner, fixed description/equipment, list indicator
9. [x] **Trophy engine** — `src/lib/trophyEngine.ts` + `src/hooks/useTrophyCheck.ts`; all 23 conditions evaluated, chain-unlocks supported, toasts queued per session
10. [x] **Trophy Room view** — `src/views/TrophyView.tsx`: stats banner, per-tier progress bars, gradient unlocked tiles, locked tiles with lock icon, unlock dates
11. [x] **Trophy Toast** — `src/components/TrophyToast.tsx`: slide-up from bottom, tier gradient, countdown bar, Web Audio chime (pitch by tier), queue-based, key-reset per entry
12. [x] **Settings view** — theme toggle, weight unit, export/import JSON, stats summary, two-step reset
13. [x] **PWA config** — vite-plugin-pwa, manifest, icons (black/white dumbbell, 192+512)
14. [x] **GitHub Pages** — .gitignore, git init, initial commit on main, deploy via `npm run deploy`

## Active Decisions
- Framework: React 18 + TypeScript
- Build tool: Vite
- Font: Nunito (Google Fonts)
- Default weight unit: kg (user can change in Settings)
- GitHub repo name: `workout-tracker` → base path `/workout-tracker/`
- State: React Context + useReducer, persisted to localStorage
- Routing: hash-based (#dashboard, #workout, #trophies, #settings) — no React Router
- **Logging UX**: log sets one at a time — each "Add Set" tap creates one SetLog (sets=1, own reps+weight). Growing list shown mid-session.
- **Workout navigation**: Muscle group grid first → exercise list → exercise detail/log view
- **Session summary**: Sticky bar above bottom nav showing today's set count and XP earned
- **Theme toggle**: Lives in the top Nav/header, always visible — not near workout buttons

## Git & Deploy Protocol
- Every commit message must state **what changed and why** — not just "update X"
- Every commit body must include a revert path so any change can be undone safely
- Never force-push to `main` — use `git revert` to undo, never rewrite history
- Run `npm run deploy` after every push that should go live
- Full command reference in `.claude/skills.md`

## Key File Locations
- Workout data source: `workouts.md` (root) → copied to `public/workouts.md` at runtime
- Types: `src/types/index.ts`
- Markdown parser: `src/lib/markdownParser.ts`
- XP engine: `src/lib/xpEngine.ts`
- Trophy engine: `src/lib/trophyEngine.ts`
- Global store: `src/store/context.tsx`
- Global styles: `src/styles/globals.css`

## Open Questions
*(none currently)*
