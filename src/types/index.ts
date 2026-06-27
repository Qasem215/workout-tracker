export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'
export type TrophyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
export type WeightUnit = 'kg' | 'lbs'
export type Theme = 'light' | 'dark'

export interface Exercise {
  name: string
  difficulty: Difficulty
  muscleGroup: string
  equipment: string
  alternative: string
  description: string
}

export interface Trophy {
  name: string
  tier: TrophyTier
  condition: string
  reward: number
  unlockedAt?: string
}

export interface SetLog {
  exerciseName: string
  sets: number
  reps: number
  weight: number
  timestamp: string
}

export interface WorkoutSession {
  id: string
  date: string
  sets: SetLog[]
  xpEarned: number
}

export interface PersonalRecord {
  maxReps: number
  maxWeight: number
  lastReps: number
  lastWeight: number
  lastDate: string
}

export interface UserState {
  totalXP: number
  level: number
  sessions: WorkoutSession[]
  trophiesUnlocked: string[]
  trophyUnlockDates: Record<string, string>
  exerciseSwaps: Record<string, string>
  settings: {
    theme: Theme
    weightUnit: WeightUnit
  }
}

export interface ParsedWorkoutData {
  exercises: Exercise[]
  trophies: Trophy[]
}
