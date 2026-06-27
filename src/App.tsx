import { useEffect, useState, useCallback } from 'react'
import { StoreProvider } from './store/context'
import { fetchAndParseWorkouts } from './lib/markdownParser'
import { useTrophyCheck } from './hooks/useTrophyCheck'
import Nav from './components/Nav'
import TrophyToast from './components/TrophyToast'
import Dashboard from './views/Dashboard'
import WorkoutView from './views/WorkoutView'
import TrophyView from './views/TrophyView'
import SettingsView from './views/SettingsView'
import type { ParsedWorkoutData } from './types'

type View = 'dashboard' | 'workout' | 'trophies' | 'settings'

function useHashNav(): [View, (v: View) => void] {
  const getView = (): View => {
    const hash = window.location.hash.replace('#', '') as View
    return ['dashboard', 'workout', 'trophies', 'settings'].includes(hash)
      ? hash
      : 'dashboard'
  }

  const [view, setView] = useState<View>(getView)

  useEffect(() => {
    const onHashChange = () => setView(getView())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((v: View) => {
    window.location.hash = v
    setView(v)
  }, [])

  return [view, navigate]
}

/* ── App shell ─────────────────────────────────────────────────────────── */

function Shell() {
  const [view, navigate] = useHashNav()
  const [data, setData] = useState<ParsedWorkoutData | null>(null)

  useEffect(() => {
    fetchAndParseWorkouts(import.meta.env.BASE_URL.replace(/\/$/, ''))
      .then(setData)
      .catch(console.error)
  }, [])

  // Trophy engine — runs after every XP change, dispatches unlocks, queues toasts
  const { toastQueue, dismissToast } = useTrophyCheck(data)


  return (
    <div className="app-shell">
      <Nav view={view} onNavigate={navigate} />
      <TrophyToast queue={toastQueue} onDismiss={dismissToast} />
      <main className="page-content">
        {view === 'dashboard'  && <Dashboard data={data} onNavigate={navigate} />}
        {view === 'workout'    && <WorkoutView data={data} />}
        {view === 'trophies'   && <TrophyView data={data} />}
        {view === 'settings'   && <SettingsView />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
