import type { Theme, WeightUnit, UserState } from '../types'

export type Action =
  | {
      type: 'LOG_SET'
      payload: { exerciseName: string; sets: number; reps: number; weight: number }
    }
  | {
      type: 'UNLOCK_TROPHY'
      payload: { trophyName: string; xpReward: number }
    }
  | {
      type: 'SWAP_EXERCISE'
      payload: { originalName: string; swappedName: string }
    }
  | {
      type: 'RESTORE_EXERCISE'
      payload: { originalName: string }
    }
  | { type: 'SET_THEME'; payload: { theme: Theme } }
  | { type: 'SET_WEIGHT_UNIT'; payload: { unit: WeightUnit } }
  | { type: 'IMPORT_STATE'; payload: { state: UserState } }
  | { type: 'RESET_STATE' }
