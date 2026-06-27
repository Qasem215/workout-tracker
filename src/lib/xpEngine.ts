import type { WorkoutSession } from '../types'

const XP_PER_SET = 25
const XP_SESSION_BONUS = 150
const SESSION_BONUS_THRESHOLD = 3

export function xpForSets(sets: number): number {
  return sets * XP_PER_SET
}

/** Returns true if this is the exact moment the session crosses the bonus threshold. */
export function earnedSessionBonus(
  prevDistinctCount: number,
  newDistinctCount: number,
): boolean {
  return (
    prevDistinctCount < SESSION_BONUS_THRESHOLD &&
    newDistinctCount >= SESSION_BONUS_THRESHOLD
  )
}

export function sessionBonusXP(): number {
  return XP_SESSION_BONUS
}

/** RPG-style level from total XP. Slow early, accelerates mid-game. */
export function calcLevel(totalXP: number): number {
  if (totalXP <= 0) return 1
  return Math.floor(Math.pow(totalXP / 200, 0.6)) + 1
}

/** XP required to reach a given level. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.round(Math.pow(level - 1, 1 / 0.6) * 200)
}

/** XP remaining until the next level. */
export function xpToNextLevel(totalXP: number): number {
  const current = calcLevel(totalXP)
  return xpForLevel(current + 1) - totalXP
}

/** Count distinct exercise names logged in a session. */
export function distinctExerciseCount(session: WorkoutSession): number {
  return new Set(session.sets.map(s => s.exerciseName)).size
}
