import { useState, useMemo, useCallback } from 'react'
import { useStore, usePersonalRecords } from '../store/context'
import SetLogger from '../components/workout/SetLogger'
import type { Exercise, ParsedWorkoutData, Difficulty } from '../types'

interface Props {
  data: ParsedWorkoutData | null
}

type Screen = 'groups' | 'exercises' | 'detail'

/* ── Muscle group visual config ─────────────────────────────────────────── */
const GROUP_META: Record<string, { emoji: string; gradient: string }> = {
  Chest:     { emoji: '💪', gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
  Back:      { emoji: '🏹', gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' },
  Legs:      { emoji: '🦵', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  Shoulders: { emoji: '🏋️', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  Arms:      { emoji: '🥊', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
  Core:      { emoji: '🔥', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
}

const DIFFICULTY_ORDER: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced']

const DIFF_COLORS: Record<Difficulty, string> = {
  Beginner:     'var(--success)',
  Intermediate: 'var(--gold)',
  Advanced:     'var(--danger)',
}

/* ── Back button ────────────────────────────────────────────────────────── */
function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2"
      style={{
        color: 'var(--accent)',
        fontWeight: 800,
        fontSize: 'var(--text-sm)',
        marginBottom: 'var(--space-5)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      {label}
    </button>
  )
}

/* ── Screen 1: Muscle group grid ────────────────────────────────────────── */
function MuscleGroupGrid({
  exercises,
  onSelect,
}: {
  exercises: Exercise[]
  onSelect: (group: string) => void
}) {
  const groups = useMemo(() => {
    const order = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']
    const counts: Record<string, number> = {}
    for (const e of exercises) {
      counts[e.muscleGroup] = (counts[e.muscleGroup] ?? 0) + 1
    }
    return order
      .filter(g => counts[g])
      .map(g => ({ name: g, count: counts[g], ...GROUP_META[g] }))
  }, [exercises])

  return (
    <div>
      <p className="page-title">Workout</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        {groups.map(g => (
          <button
            key={g.name}
            onClick={() => onSelect(g.name)}
            style={{
              background: g.gradient,
              border: 'none',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6) var(--space-4)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 'var(--space-2)',
              boxShadow: 'var(--shadow-md)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              textAlign: 'left',
              color: '#fff',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'
            }}
          >
            <span style={{ fontSize: '2.2rem', lineHeight: 1 }}>{g.emoji}</span>
            <div>
              <div style={{ fontWeight: 900, fontSize: 'var(--text-lg)', letterSpacing: '-0.01em' }}>
                {g.name}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', opacity: 0.8, fontWeight: 700, marginTop: 2 }}>
                {g.count} exercises
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Screen 2: Exercise list for a group ────────────────────────────────── */
function ExerciseList({
  group,
  exercises,
  onSelect,
  onBack,
}: {
  group: string
  exercises: Exercise[]
  onSelect: (e: Exercise) => void
  onBack: () => void
}) {
  const { state } = useStore()
  const groupExercises = useMemo(
    () => exercises.filter(e => e.muscleGroup === group),
    [exercises, group]
  )
  const meta = GROUP_META[group]

  return (
    <div>
      <BackButton label="Muscle Groups" onClick={onBack} />

      {/* Group header */}
      <div
        style={{
          background: meta?.gradient ?? 'var(--accent)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-5)',
          marginBottom: 'var(--space-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          color: '#fff',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <span style={{ fontSize: '2.5rem' }}>{meta?.emoji}</span>
        <div>
          <div style={{ fontWeight: 900, fontSize: 'var(--text-2xl)', letterSpacing: '-0.02em' }}>
            {group}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', opacity: 0.8, fontWeight: 600 }}>
            {groupExercises.length} exercises across 3 difficulties
          </div>
        </div>
      </div>

      {DIFFICULTY_ORDER.map(diff => {
        const diffExercises = groupExercises.filter(e => e.difficulty === diff)
        if (diffExercises.length === 0) return null
        return (
          <div key={diff} style={{ marginBottom: 'var(--space-5)' }}>
            <div
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: DIFF_COLORS[diff],
                marginBottom: 'var(--space-2)',
                paddingLeft: 'var(--space-1)',
              }}
            >
              {diff}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {diffExercises.map(ex => {
                const swappedName = state.exerciseSwaps[ex.name]
                const displayName = swappedName ?? ex.name
                const isSwapped = !!swappedName

                return (
                  <button
                    key={ex.name}
                    onClick={() => onSelect(ex)}
                    className="card card--interactive"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-4)',
                      width: '100%',
                      textAlign: 'left',
                      border: isSwapped
                        ? '1.5px solid var(--accent)'
                        : '1px solid var(--border)',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: 'var(--text-base)',
                          marginBottom: 'var(--space-1)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {displayName}
                      </div>
                      <div className="text-xs text-muted" style={{ fontWeight: 600 }}>
                        {isSwapped ? (
                          <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                            </svg>
                            Alt · was {ex.name}
                          </span>
                        ) : (
                          ex.equipment
                        )}
                      </div>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: 'var(--space-3)' }}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── PR display ─────────────────────────────────────────────────────────── */
function PRSection({ exerciseName, weightUnit }: { exerciseName: string; weightUnit: string }) {
  const pr = usePersonalRecords(exerciseName)
  if (!pr) return null

  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <div className="section-title">Your Performance</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        {/* Last performance */}
        <div
          className="card"
          style={{ background: 'var(--accent-subtle)', border: '1.5px solid var(--border-focus)' }}
        >
          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--accent)',
              marginBottom: 'var(--space-3)',
            }}
          >
            Last Session
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <StatPill label="Sets" value={String(pr.lastSets)} />
            <StatPill label="Reps" value={String(pr.lastReps)} />
            <StatPill label="Weight" value={pr.lastWeight > 0 ? `${pr.lastWeight} ${weightUnit}` : 'Bodyweight'} />
          </div>
          <div className="text-xs text-muted" style={{ marginTop: 'var(--space-3)' }}>
            {pr.lastDate}
          </div>
        </div>

        {/* All-time PRs */}
        <div
          className="card"
          style={{ background: 'var(--gold-bg)', border: '1.5px solid var(--gold)' }}
        >
          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--gold)',
              marginBottom: 'var(--space-3)',
            }}
          >
            All-Time PR
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <StatPill label="Max Reps" value={String(pr.maxReps)} gold />
            <StatPill label="Max Weight" value={pr.maxWeight > 0 ? `${pr.maxWeight} ${weightUnit}` : 'Bodyweight'} gold />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatPill({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: gold ? 'rgba(213,147,10,0.12)' : 'rgba(99,102,241,0.08)',
        borderRadius: 'var(--radius-sm)',
        padding: '4px var(--space-3)',
      }}
    >
      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 900, color: gold ? 'var(--gold)' : 'var(--accent)' }}>
        {value}
      </span>
    </div>
  )
}

/* ── Screen 3: Exercise detail ──────────────────────────────────────────── */
function ExerciseDetail({
  exercise,
  onBack,
}: {
  exercise: Exercise
  onBack: () => void
}) {
  const { state, dispatch } = useStore()
  const [confirmingSwap, setConfirmingSwap] = useState(false)

  const isSwapped = exercise.name in state.exerciseSwaps
  const swappedName = isSwapped ? state.exerciseSwaps[exercise.name] : null
  const displayName = swappedName ?? exercise.name
  const meta = GROUP_META[exercise.muscleGroup]

  const confirmSwap = useCallback(() => {
    dispatch({
      type: 'SWAP_EXERCISE',
      payload: { originalName: exercise.name, swappedName: exercise.alternative },
    })
    setConfirmingSwap(false)
  }, [dispatch, exercise])

  const handleRestore = useCallback(() => {
    dispatch({ type: 'RESTORE_EXERCISE', payload: { originalName: exercise.name } })
  }, [dispatch, exercise])

  return (
    <div>
      <BackButton label={exercise.muscleGroup} onClick={onBack} />

      {/* Active-swap banner */}
      {isSwapped && (
        <div
          style={{
            background: 'var(--accent-subtle)',
            border: '1.5px solid var(--accent)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
          }}
        >
          <div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Using Alternative
            </div>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Swapped from <strong style={{ color: 'var(--text-primary)' }}>{exercise.name}</strong>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
              Your progress is still tracked under the original name
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ flexShrink: 0 }}
            onClick={handleRestore}
          >
            Restore
          </button>
        </div>
      )}

      {/* Exercise header */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
          <span
            className="badge"
            style={{
              background: DIFF_COLORS[exercise.difficulty] + '22',
              color: DIFF_COLORS[exercise.difficulty],
            }}
          >
            {exercise.difficulty}
          </span>
          <span
            className="badge"
            style={{ background: meta?.gradient, color: '#fff', fontSize: '0.65rem' }}
          >
            {meta?.emoji} {exercise.muscleGroup}
          </span>
        </div>

        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {displayName}
        </h1>
      </div>

      {/* Description — always the original exercise's instructions */}
      <div className="card" style={{ marginBottom: 'var(--space-3)' }}>
        <div className="text-xs font-bold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
          How To
        </div>
        <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          {exercise.description}
        </p>
      </div>

      {/* Equipment + Alternative/Original */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <div className="card" style={{ padding: 'var(--space-4)' }}>
          <div className="text-xs font-bold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
            Equipment
          </div>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
            {exercise.equipment}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: 'var(--space-4)',
            background: isSwapped ? 'var(--bg-elevated)' : undefined,
          }}
        >
          <div className="text-xs font-bold text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
            {isSwapped ? 'Original' : 'Alternative'}
          </div>
          <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
            {isSwapped ? exercise.name : exercise.alternative}
          </div>
        </div>
      </div>

      {/* Swap controls */}
      {!isSwapped && (
        <div style={{ marginBottom: 'var(--space-5)' }}>
          {confirmingSwap ? (
            <div
              style={{
                background: 'var(--bg-elevated)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                Switch to alternative?
              </div>
              <div className="text-xs text-muted" style={{ marginBottom: 'var(--space-4)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{exercise.alternative}</strong> will replace{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{exercise.name}</strong> in your workout list.
                You can restore anytime without losing any progress.
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={confirmSwap}>
                  Confirm Swap
                </button>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => setConfirmingSwap(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-ghost btn-sm w-full"
              style={{ border: '1.5px dashed var(--border)' }}
              onClick={() => setConfirmingSwap(true)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
              Use Alternative Instead
            </button>
          )}
        </div>
      )}

      {/* PR Section — live from store, always keyed to original name */}
      <PRSection
        exerciseName={exercise.name}
        weightUnit={state.settings.weightUnit}
      />

      {/* Set Logger */}
      <div className="card card--elevated">
        <SetLogger exerciseName={exercise.name} />
      </div>
    </div>
  )
}

/* ── WorkoutView root ───────────────────────────────────────────────────── */
export default function WorkoutView({ data }: Props) {
  const [screen, setScreen] = useState<Screen>('groups')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  if (!data) {
    return (
      <div>
        <p className="page-title">Workout</p>
        <div className="card"><p className="text-muted">Loading exercises…</p></div>
      </div>
    )
  }

  if (screen === 'groups') {
    return (
      <MuscleGroupGrid
        exercises={data.exercises}
        onSelect={group => {
          setSelectedGroup(group)
          setScreen('exercises')
        }}
      />
    )
  }

  if (screen === 'exercises' && selectedGroup) {
    return (
      <ExerciseList
        group={selectedGroup}
        exercises={data.exercises}
        onSelect={ex => {
          setSelectedExercise(ex)
          setScreen('detail')
        }}
        onBack={() => setScreen('groups')}
      />
    )
  }

  if (screen === 'detail' && selectedExercise) {
    return (
      <ExerciseDetail
        exercise={selectedExercise}
        onBack={() => setScreen('exercises')}
      />
    )
  }

  return null
}
