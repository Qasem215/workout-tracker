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

## 📉 Progress Decay for Inactivity

**What:** If no session is logged for more than 7 consecutive days, start reducing XP or a separate "fitness level" multiplier — a gentle nudge to stay consistent without punishing casual users too harshly.

**How to implement:**
- Compute days since last session on app load; if >7, apply a decay factor to a new `fitnessMultiplier` field in `UserState`
- Show a "you've been away X days" warning card on the Dashboard
- Keep total XP untouched — decay only affects the multiplier so it feels recoverable

**Effort estimate:** ~2 hours

---

## 🚫 Overtraining Cap

**What:** Cap XP gains per session or per day so logging 100 sets in one day doesn't break the leveling curve. Could also surface a "rest day recommended" warning after a high-volume session.

**How to implement:**
- Add a `dailyXPCap` constant (e.g. 1000 XP/day); check in the `LOG_SET` reducer before awarding XP
- Optionally add a `OVERTRAINING_WARNING` UI state shown on Dashboard when today's volume exceeds a threshold

**Effort estimate:** ~1–2 hours

---

## 📈 Set/Rep/Weight Trends

**What:** A Trends view (or section in Dashboard) showing charts of weight progression and volume over time per exercise — the data is already in `state.sessions`, just needs visualization.

**How to implement:**
- Add a `#trends` view with a simple line/bar chart per exercise using a lightweight library (e.g. `recharts` or hand-drawn SVG paths)
- Filter by exercise name, show last 30 days
- Export already includes full set logs; import restores them — no store changes needed

**Effort estimate:** ~4–6 hours (chart library integration is the bulk)

---

## 📐 Exponential XP Curve & Trophy Difficulty Scaling

**What:** Make mid-to-late progress feel earned by steepening the XP curve and spacing trophy milestones exponentially rather than linearly. Early trophies stay accessible (first session, first 5 exercises) but later ones require real commitment.

**How to implement:**
- Revise `calcLevel()` in `xpEngine.ts` to use a steeper exponent — e.g. raise the power from `0.6` toward `0.45` so higher levels demand dramatically more XP
- Rewrite session-count and unique-exercise trophy thresholds to follow exponential steps: 1 → 5 → 15 → 50 → 150 sessions instead of even intervals
- Add an optional "XP to next level" preview on the Dashboard so users can always see how far they are — critical when gaps widen
- Consider a `PRESTIGE` mechanic at max level: reset XP but keep trophies and gain a visible prestige badge

**Effort estimate:** ~2–3 hours (curve tuning + trophy condition rewrites + regression-testing all 23 evaluators)

---

## 💪 Expanded Exercise & Trophy Database

**What:** Grow the `workouts.md` database — more exercises per muscle group (especially Arms and Core which only have 2 per tier), new muscle groups (e.g. Calves, Forearms), and additional trophies for new milestones.

**Ideas:**
- New exercises: Face Pulls, Cable Flyes, Wrist Curls, Calf Raises, Nordic Curls
- New trophies: "Iron Consistency" (30-day streak), "Century Club" (100 total sessions), tier-specific mastery trophies per muscle group
- Slight wording tweaks to existing trophy conditions for better readability

**Effort estimate:** ~2–3 hours (data entry + trophy engine verification)

---

## 🌐 GitHub Pages Automated Deploy (CI/CD)

**What:** A GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically
builds and deploys to GitHub Pages on every push to `main`.

**How to implement:**
- Add `.github/workflows/deploy.yml` using `actions/checkout`, `actions/setup-node`,
  `npm run build`, and `peaceiris/actions-gh-pages`
- Currently the `npm run deploy` script using `gh-pages` requires manual triggering

**Effort estimate:** ~30 minutes
