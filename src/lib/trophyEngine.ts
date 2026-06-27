import type { UserState, Trophy, Exercise } from '../types'

/* ── Helpers ────────────────────────────────────────────────────────────── */

function allLoggedNames(state: UserState): Set<string> {
  const names = new Set<string>()
  for (const session of state.sessions) {
    for (const log of session.sets) names.add(log.exerciseName)
  }
  return names
}

function hasBeatenAnyPR(state: UserState): boolean {
  // Group logs by exercise, sorted oldest-first
  const byExercise = new Map<string, { reps: number; weight: number }[]>()
  for (const session of state.sessions) {
    const sorted = [...session.sets].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp),
    )
    for (const log of sorted) {
      if (!byExercise.has(log.exerciseName)) byExercise.set(log.exerciseName, [])
      byExercise.get(log.exerciseName)!.push({ reps: log.reps, weight: log.weight })
    }
  }

  for (const logs of byExercise.values()) {
    if (logs.length < 2) continue
    let maxReps = logs[0].reps
    let maxWeight = logs[0].weight
    for (let i = 1; i < logs.length; i++) {
      if (logs[i].reps > maxReps || logs[i].weight > maxWeight) return true
      maxReps = Math.max(maxReps, logs[i].reps)
      maxWeight = Math.max(maxWeight, logs[i].weight)
    }
  }
  return false
}

/* ── Condition evaluator factory ────────────────────────────────────────── */

type Evaluator = (state: UserState) => boolean

function makeEvaluator(condition: string, exercises: Exercise[]): Evaluator | null {
  let m: RegExpMatchArray | null

  // "Log N total workout session(s)."
  m = condition.match(/Log (\d+) total workout sessions?/)
  if (m) {
    const n = parseInt(m[1], 10)
    return state => state.sessions.length >= n
  }

  // "Reach Character Level N."
  m = condition.match(/Reach Character Level (\d+)/)
  if (m) {
    const n = parseInt(m[1], 10)
    return state => state.level >= n
  }

  // "Try N different exercises."
  m = condition.match(/Try (\d+) different exercises/)
  if (m) {
    const n = parseInt(m[1], 10)
    return state => allLoggedNames(state).size >= n
  }

  // "Log a set that beats a previous Personal Record (PR)…"
  if (condition.includes('beats a previous Personal Record')) {
    return state => hasBeatenAnyPR(state)
  }

  // "Log at least 1 set for every exercise in Difficulty: X -> Muscle Group: Y."
  m = condition.match(/Difficulty: (\w+) -> Muscle Group: (.+?)\.?\s*$/)
  if (m) {
    const difficulty = m[1].trim()
    const muscleGroup = m[2].trim()
    const targets = exercises
      .filter(e => e.difficulty === difficulty && e.muscleGroup === muscleGroup)
      .map(e => e.name)

    if (targets.length === 0) return null

    return state => {
      const logged = allLoggedNames(state)
      return targets.every(name => logged.has(name))
    }
  }

  return null
}

/* ── Public API ─────────────────────────────────────────────────────────── */

/**
 * Returns the names of trophies that are newly earned in this state
 * (not already present in state.trophiesUnlocked).
 */
export function evaluateTrophies(
  state: UserState,
  exercises: Exercise[],
  trophies: Trophy[],
): string[] {
  const newlyUnlocked: string[] = []

  for (const trophy of trophies) {
    if (state.trophiesUnlocked.includes(trophy.name)) continue

    const evaluator = makeEvaluator(trophy.condition, exercises)
    if (!evaluator) continue

    if (evaluator(state)) newlyUnlocked.push(trophy.name)
  }

  return newlyUnlocked
}
