import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { UserState, WorkoutSession, SetLog } from '../types'
import type { Action } from './actions'
import {
  calcLevel,
  xpForSets,
  sessionBonusXP,
  earnedSessionBonus,
  distinctExerciseCount,
} from '../lib/xpEngine'

const STORAGE_KEY = 'workout-tracker-state'

const INITIAL_STATE: UserState = {
  totalXP: 0,
  level: 1,
  sessions: [],
  trophiesUnlocked: [],
  trophyUnlockDates: {},
  exerciseSwaps: {},
  settings: {
    theme: 'light',
    weightUnit: 'kg',
  },
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function loadState(): UserState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_STATE
    const parsed = JSON.parse(raw) as UserState
    // Migrate older saves that predate trophyUnlockDates
    if (!parsed.trophyUnlockDates) parsed.trophyUnlockDates = {}
    return parsed
  } catch {
    return INITIAL_STATE
  }
}

function saveState(state: UserState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function reducer(state: UserState, action: Action): UserState {
  switch (action.type) {
    case 'LOG_SET': {
      const { exerciseName, sets, reps, weight } = action.payload
      const today = todayISO()

      const newLog: SetLog = {
        exerciseName,
        sets,
        reps,
        weight,
        timestamp: new Date().toISOString(),
      }

      // Find or create today's session
      const existingIdx = state.sessions.findIndex(s => s.date === today)
      let sessions: WorkoutSession[]
      let prevDistinct = 0

      if (existingIdx === -1) {
        // First entry of the day — new session
        const newSession: WorkoutSession = {
          id: today,
          date: today,
          sets: [newLog],
          xpEarned: 0,
        }
        sessions = [...state.sessions, newSession]
        prevDistinct = 0
      } else {
        const existing = state.sessions[existingIdx]
        prevDistinct = distinctExerciseCount(existing)
        const updated: WorkoutSession = {
          ...existing,
          sets: [...existing.sets, newLog],
        }
        sessions = state.sessions.map((s, i) => (i === existingIdx ? updated : s))
      }

      // Calculate XP earned for this log entry
      const sessionIdx = existingIdx === -1 ? sessions.length - 1 : existingIdx
      const updatedSession = sessions[sessionIdx]
      const newDistinct = distinctExerciseCount(updatedSession)

      let xpGained = xpForSets(sets)
      if (earnedSessionBonus(prevDistinct, newDistinct)) {
        xpGained += sessionBonusXP()
      }

      // Update session xpEarned
      sessions = sessions.map((s, i) =>
        i === sessionIdx ? { ...s, xpEarned: s.xpEarned + xpGained } : s,
      )

      const totalXP = state.totalXP + xpGained

      return {
        ...state,
        sessions,
        totalXP,
        level: calcLevel(totalXP),
      }
    }

    case 'UNLOCK_TROPHY': {
      const { trophyName, xpReward } = action.payload
      if (state.trophiesUnlocked.includes(trophyName)) return state

      const totalXP = state.totalXP + xpReward
      return {
        ...state,
        trophiesUnlocked: [...state.trophiesUnlocked, trophyName],
        trophyUnlockDates: {
          ...state.trophyUnlockDates,
          [trophyName]: new Date().toISOString(),
        },
        totalXP,
        level: calcLevel(totalXP),
      }
    }

    case 'SWAP_EXERCISE': {
      const { originalName, swappedName } = action.payload
      return {
        ...state,
        exerciseSwaps: { ...state.exerciseSwaps, [originalName]: swappedName },
      }
    }

    case 'RESTORE_EXERCISE': {
      const { originalName } = action.payload
      const swaps = { ...state.exerciseSwaps }
      delete swaps[originalName]
      return { ...state, exerciseSwaps: swaps }
    }

    case 'SET_THEME': {
      return { ...state, settings: { ...state.settings, theme: action.payload.theme } }
    }

    case 'SET_WEIGHT_UNIT': {
      return { ...state, settings: { ...state.settings, weightUnit: action.payload.unit } }
    }

    case 'IMPORT_STATE': {
      return action.payload.state
    }

    case 'RESET_STATE': {
      return { ...INITIAL_STATE, settings: { ...state.settings } }
    }

    default:
      return state
  }
}

interface StoreContextType {
  state: UserState
  dispatch: React.Dispatch<Action>
  exportState: () => void
  importState: (file: File) => Promise<void>
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)

  // Persist every state change to localStorage
  useEffect(() => {
    saveState(state)
  }, [state])

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.settings.theme)
  }, [state.settings.theme])

  const exportState = useCallback(() => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workout-tracker-backup-${todayISO()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [state])

  const importState = useCallback(async (file: File) => {
    const text = await file.text()
    const parsed = JSON.parse(text) as UserState
    dispatch({ type: 'IMPORT_STATE', payload: { state: parsed } })
  }, [])

  return (
    <StoreContext.Provider value={{ state, dispatch, exportState, importState }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

/** Compute personal records for a given exercise name from session history. */
export function usePersonalRecords(exerciseName: string) {
  const { state } = useStore()
  const allLogs = state.sessions.flatMap(s =>
    s.sets.filter(l => l.exerciseName === exerciseName),
  )
  if (allLogs.length === 0) return null

  const sorted = [...allLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  )
  const last = sorted[0]

  return {
    lastReps: last.reps,
    lastWeight: last.weight,
    lastSets: last.sets,
    lastDate: last.timestamp.slice(0, 10),
    maxReps: Math.max(...allLogs.map(l => l.reps)),
    maxWeight: Math.max(...allLogs.map(l => l.weight)),
  }
}
