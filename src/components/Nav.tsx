import ThemeToggle from './ThemeToggle'
import { useStore } from '../store/context'

type View = 'dashboard' | 'workout' | 'trophies' | 'settings'

interface NavProps {
  view: View
  onNavigate: (v: View) => void
}

const tabs: { id: View; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'workout',
    label: 'Workout',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16M2 9l2 3-2 3M22 9l-2 3 2 3"/>
      </svg>
    ),
  },
  {
    id: 'trophies',
    label: 'Trophies',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
      </svg>
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

function SessionBar() {
  const { state } = useStore()
  const today = new Date().toISOString().slice(0, 10)
  const todaySession = state.sessions.find(s => s.date === today)
  if (!todaySession || todaySession.sets.length === 0) return null

  const setCount = todaySession.sets.length
  const distinctExercises = new Set(todaySession.sets.map(s => s.exerciseName)).size

  return (
    <div className="session-bar">
      <div className="session-bar__info">
        <span className="session-bar__stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5h11M4 12h16M2 9l2 3-2 3M22 9l-2 3 2 3"/>
          </svg>
          {setCount} {setCount === 1 ? 'set' : 'sets'}
        </span>
        <span className="session-bar__stat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          {distinctExercises} {distinctExercises === 1 ? 'exercise' : 'exercises'}
        </span>
      </div>
      <span className="session-bar__stat" style={{ fontSize: 'var(--text-xs)', opacity: 0.85 }}>
        +{todaySession.xpEarned} XP today
      </span>
    </div>
  )
}

export default function Nav({ view, onNavigate }: NavProps) {
  return (
    <>
      <header className="top-nav">
        <div className="top-nav__brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
            <path d="M6.5 6.5h11M4 12h16M2 9l2 3-2 3M22 9l-2 3 2 3"/>
          </svg>
          Workout<span>Tracker</span>
        </div>
        <ThemeToggle />
      </header>

      <SessionBar />

      <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab${view === tab.id ? ' active' : ''}`}
            onClick={() => onNavigate(tab.id)}
            aria-current={view === tab.id ? 'page' : undefined}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  )
}
