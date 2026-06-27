import { useEffect, useRef, useState, useCallback } from 'react'
import { useStore } from '../store/context'
import { evaluateTrophies } from '../lib/trophyEngine'
import type { ParsedWorkoutData } from '../types'

export interface TrophyToastEntry {
  name: string
  tier: string
  xpReward: number
  id: string
}

export function useTrophyCheck(data: ParsedWorkoutData | null): {
  toastQueue: TrophyToastEntry[]
  dismissToast: (id: string) => void
} {
  const { state, dispatch } = useStore()
  const [toastQueue, setToastQueue] = useState<TrophyToastEntry[]>([])

  // Snapshot of unlocked trophies at mount — we never show toasts for these
  // (they were earned in a previous session and already saved to localStorage)
  const initialUnlocked = useRef<Set<string>>(new Set(state.trophiesUnlocked))

  useEffect(() => {
    if (!data) return

    const newlyEarned = evaluateTrophies(state, data.exercises, data.trophies)
    if (newlyEarned.length === 0) return

    for (const trophyName of newlyEarned) {
      const trophy = data.trophies.find(t => t.name === trophyName)
      if (!trophy) continue

      // Always update persistent state
      dispatch({ type: 'UNLOCK_TROPHY', payload: { trophyName, xpReward: trophy.reward } })

      // Only queue a toast if this trophy was earned in THIS session
      if (!initialUnlocked.current.has(trophyName)) {
        setToastQueue(prev => [
          ...prev,
          {
            name: trophy.name,
            tier: trophy.tier,
            xpReward: trophy.reward,
            id: `${trophy.name}-${Date.now()}`,
          },
        ])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.totalXP, data])
  // state.totalXP is the right trigger: it changes on every LOG_SET and every
  // UNLOCK_TROPHY, so chain-unlocks (trophy XP → level up → level trophy) resolve.

  const dismissToast = useCallback((id: string) => {
    setToastQueue(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toastQueue, dismissToast }
}
