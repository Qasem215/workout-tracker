# Future Improvements

Items deferred from the initial build — functional but worth revisiting for polish.

---

## 🎮 PlayStation-Style Trophy Icons

**What:** Replace the current emoji tier indicators (🥉🥈🥇💎) with custom SVG icons
that mimic the real PlayStation trophy cup shapes — a small bronze cup, medium silver
cup, large gold cup, and a special platinum diamond/star shape, each with a metallic
sheen animation.

**Why deferred:** Pure visual polish; no structural changes needed. The current gradient
card system, tier colours, and locked/unlocked states are already designed to accept a
drop-in icon swap.

**How to implement:**
- Design 4 SVG components: `BronzeTrophy`, `SilverTrophy`, `GoldTrophy`, `PlatinumTrophy`
- Add a CSS `@keyframes shimmer` sweep animation to the Platinum icon
- Replace the emoji in `TrophyTile` (TrophyView.tsx) and the tier section headers
- Optionally add a short unlock chime sound (`.mp3` in `/public`) played in `useTrophyCheck.ts`
  when a trophy is dispatched
- Affected files: `src/views/TrophyView.tsx`, `src/styles/globals.css`

**Effort estimate:** ~2–3 hours (SVG design is the bulk of the work)

---

## 📊 Workout Streak Counter

**What:** Track and display a consecutive-days streak on the Dashboard (e.g. "🔥 7-day
streak"). Break the streak if no session is logged on a calendar day.

**How to implement:**
- Compute streak from `state.sessions` sorted by date — count backwards from today
- Add a `StreakCard` component to `Dashboard.tsx`
- No store changes needed (derived from existing session data)

**Effort estimate:** ~1 hour

---

## 🗑️ Delete / Edit a Logged Set

**What:** Allow users to remove a mis-logged set from today's session via a swipe-to-delete
or a small trash icon on each row in `SetLogger.tsx`.

**How to implement:**
- Add `DELETE_SET` action to `store/actions.ts`
- Reducer removes the matching set by `timestamp` from the correct session
- Recalculate `session.xpEarned` and `state.totalXP` after deletion

**Effort estimate:** ~1–2 hours

---

## 🔍 Exercise Search

**What:** A search bar in the Workout view that filters all 48 exercises by name in
real-time, bypassing the muscle group grid.

**How to implement:**
- Add a search input at the top of `MuscleGroupGrid` in `WorkoutView.tsx`
- When non-empty, replace the grid with a flat filtered list of exercises
- Tap navigates directly to the exercise detail screen

**Effort estimate:** ~1 hour

---

## 🌐 GitHub Pages Automated Deploy (CI/CD)

**What:** A GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically
builds and deploys to GitHub Pages on every push to `main`.

**How to implement:**
- Add `.github/workflows/deploy.yml` using `actions/checkout`, `actions/setup-node`,
  `npm run build`, and `peaceiris/actions-gh-pages`
- Currently the `npm run deploy` script using `gh-pages` requires manual triggering

**Effort estimate:** ~30 minutes
