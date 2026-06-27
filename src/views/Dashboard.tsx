import { useMemo } from 'react'
import { useStore } from '../store/context'
import { calcLevel, xpForLevel, xpToNextLevel } from '../lib/xpEngine'
import type { ParsedWorkoutData, WorkoutSession } from '../types'

type View = 'dashboard' | 'workout' | 'trophies' | 'settings'

interface Props {
  data: ParsedWorkoutData | null
  onNavigate: (v: View) => void
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  const now = new Date()
  const diffDays = Math.round((now.setHours(0,0,0,0) - d.setHours(0,0,0,0)) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/* ── Level Card ─────────────────────────────────────────────────────────── */
function LevelCard() {
  const { state } = useStore()
  const xp = state.totalXP
  const level = calcLevel(xp)
  const thisLevelXP = xpForLevel(level)
  const nextLevelXP = xpForLevel(level + 1)
  const progress =
    nextLevelXP > thisLevelXP
      ? Math.min(((xp - thisLevelXP) / (nextLevelXP - thisLevelXP)) * 100, 100)
      : 100

  return (
    <div
      className="card card--elevated"
      style={{
        background: 'linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%)',
        border: 'none',
        color: '#fff',
        marginBottom: 'var(--space-4)',
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-5)' }}>
        <div>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              opacity: 0.8,
              marginBottom: 'var(--space-1)',
            }}
          >
            Character Level
          </div>
          <div
            style={{
              fontSize: 'clamp(3rem, 14vw, 4.5rem)',
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            {level}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              opacity: 0.75,
              marginBottom: 'var(--space-1)',
            }}
          >
            Total XP
          </div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 900 }}>
            ⚡ {xp.toLocaleString()}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', opacity: 0.75, marginTop: 'var(--space-1)' }}>
            {xpToNextLevel(xp).toLocaleString()} XP to Level {level + 1}
          </div>
        </div>
      </div>

      {/* XP bar */}
      <div style={{ height: 10, background: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'rgba(255,255,255,0.9)',
            borderRadius: 999,
            transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      </div>
      <div
        className="flex justify-between"
        style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', opacity: 0.65 }}
      >
        <span>Lv {level}</span>
        <span>Lv {level + 1}</span>
      </div>
    </div>
  )
}

/* ── Stats Row ──────────────────────────────────────────────────────────── */
function StatsRow({ data }: { data: ParsedWorkoutData | null }) {
  const { state } = useStore()

  const uniqueExercises = useMemo(() => {
    const names = state.sessions.flatMap(s => s.sets.map(l => l.exerciseName))
    return new Set(names).size
  }, [state.sessions])

  const totalSets = useMemo(
    () => state.sessions.reduce((acc, s) => acc + s.sets.length, 0),
    [state.sessions]
  )

  const stats = [
    { value: state.sessions.length, label: 'Sessions' },
    { value: totalSets, label: 'Sets Logged' },
    { value: uniqueExercises, label: `of ${data?.exercises.length ?? '–'} Exercises` },
    { value: state.trophiesUnlocked.length, label: `of ${data?.trophies.length ?? '–'} Trophies` },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: 'var(--space-3)',
        marginBottom: 'var(--space-4)',
      }}
    >
      {stats.map(s => (
        <div className="card" key={s.label} style={{ textAlign: 'center', padding: 'var(--space-3) var(--space-2)' }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--accent)' }}>
            {s.value}
          </div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.2 }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Today's Session ────────────────────────────────────────────────────── */
function TodaySession({ todaySession, onNavigate }: {
  todaySession: WorkoutSession | undefined
  onNavigate: (v: View) => void
}) {
  if (!todaySession || todaySession.sets.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-5)', marginBottom: 'var(--space-4)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>💪</div>
        <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
          No workout logged today
        </div>
        <div className="text-muted text-sm" style={{ marginBottom: 'var(--space-5)' }}>
          Pick a muscle group and start logging sets.
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('workout')}>
          Start Today's Workout
        </button>
      </div>
    )
  }

  const exerciseSummary = useMemo(() => {
    const map = new Map<string, number>()
    for (const log of todaySession.sets) {
      map.set(log.exerciseName, (map.get(log.exerciseName) ?? 0) + 1)
    }
    return Array.from(map.entries())
  }, [todaySession.sets])

  return (
    <div className="card card--elevated" style={{ marginBottom: 'var(--space-4)' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <div className="text-xs font-bold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
            Today's Session
          </div>
          <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)' }}>In Progress</div>
        </div>
        <div className="flex gap-3">
          <div className="badge badge--xp">⚡ +{todaySession.xpEarned} XP</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        {exerciseSummary.map(([name, count]) => (
          <div
            key={name}
            className="flex items-center justify-between"
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{name}</span>
            <span className="badge badge--accent">{count} {count === 1 ? 'set' : 'sets'}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-primary w-full" onClick={() => onNavigate('workout')}>
        Continue Session
      </button>
    </div>
  )
}

/* ── Recent History ─────────────────────────────────────────────────────── */
function RecentHistory({ sessions }: { sessions: WorkoutSession[] }) {
  const today = todayISO()
  const recent = useMemo(
    () =>
      [...sessions]
        .filter(s => s.date !== today)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4),
    [sessions, today]
  )

  if (recent.length === 0) return null

  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <div className="section-title">Recent Activity</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {recent.map(session => {
          const distinctExercises = [...new Set(session.sets.map(s => s.exerciseName))]
          const totalSets = session.sets.length
          return (
            <div
              key={session.id}
              className="card flex items-center justify-between"
              style={{ padding: 'var(--space-4)' }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', marginBottom: 2 }}>
                  {formatDate(session.date)}
                </div>
                <div
                  className="text-muted"
                  style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}
                >
                  {distinctExercises.slice(0, 3).join(' · ')}
                  {distinctExercises.length > 3 && ` +${distinctExercises.length - 3} more`}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 'var(--space-4)' }}>
                <div className="badge badge--xp" style={{ marginBottom: 4 }}>⚡ {session.xpEarned}</div>
                <div className="text-xs text-muted">{totalSets} sets</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Dashboard root ─────────────────────────────────────────────────────── */
export default function Dashboard({ data, onNavigate }: Props) {
  const { state } = useStore()
  const today = todayISO()
  const todaySession = state.sessions.find(s => s.date === today)

  return (
    <div>
      <LevelCard />
      <StatsRow data={data} />
      <TodaySession todaySession={todaySession} onNavigate={onNavigate} />
      <RecentHistory sessions={state.sessions} />
    </div>
  )
}
