import { useState, useRef, useEffect } from 'react'
import { useStore, usePersonalRecords } from '../../store/context'
import type { SetLog } from '../../types'

interface Props {
  exerciseName: string
}

function SetRow({ log, index }: { log: SetLog; index: number }) {
  const weightUnit = useStore().state.settings.weightUnit
  const isNew = useRef(true)
  useEffect(() => { isNew.current = false }, [])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-md)',
        animation: 'fadeSlideIn 0.25s ease',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'var(--accent)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--text-xs)',
          fontWeight: 900,
          flexShrink: 0,
        }}
      >
        {index + 1}
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 'var(--space-4)' }}>
        <span style={{ fontWeight: 800, fontSize: 'var(--text-sm)' }}>
          {log.reps} <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>reps</span>
        </span>
        <span style={{ fontWeight: 800, fontSize: 'var(--text-sm)' }}>
          {log.weight > 0
            ? <>{log.weight} <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{weightUnit}</span></>
            : <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Bodyweight</span>
          }
        </span>
      </div>
      <span className="badge badge--xp">+25 XP</span>
    </div>
  )
}

export default function SetLogger({ exerciseName }: Props) {
  const { state, dispatch } = useStore()
  const pr = usePersonalRecords(exerciseName)
  const { weightUnit } = state.settings

  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [isBodyweight, setIsBodyweight] = useState(false)
  const [shake, setShake] = useState(false)
  const [flash, setFlash] = useState(false)
  const repsRef = useRef<HTMLInputElement>(null)

  // Today's sets for this exercise
  const today = new Date().toISOString().slice(0, 10)
  const todaySession = state.sessions.find(s => s.date === today)
  const todaySets = (todaySession?.sets ?? []).filter(
    s => s.exerciseName === exerciseName,
  )

  const handleQuickFill = () => {
    if (!pr) return
    setReps(String(pr.lastReps))
    if (pr.lastWeight === 0) {
      setIsBodyweight(true)
      setWeight('')
    } else {
      setIsBodyweight(false)
      setWeight(String(pr.lastWeight))
    }
    repsRef.current?.focus()
  }

  const handleAdd = () => {
    const repsNum = parseInt(reps, 10)
    if (!repsNum || repsNum <= 0) {
      setShake(true)
      setTimeout(() => setShake(false), 400)
      repsRef.current?.focus()
      return
    }
    const weightNum = isBodyweight ? 0 : Math.max(0, parseFloat(weight) || 0)

    dispatch({
      type: 'LOG_SET',
      payload: { exerciseName, sets: 1, reps: repsNum, weight: weightNum },
    })

    // Flash feedback, keep weight for next set, clear reps
    setFlash(true)
    setTimeout(() => setFlash(false), 500)
    setReps('')
    setTimeout(() => repsRef.current?.focus(), 50)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd()
  }

  const isValid = parseInt(reps, 10) > 0

  return (
    <div>
      {/* ── Section header ─────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div className="section-title" style={{ marginBottom: 0 }}>Log a Set</div>
        {todaySets.length > 0 && (
          <span className="badge badge--accent">{todaySets.length} logged today</span>
        )}
      </div>

      {/* ── Quick fill ─────────────────────────────────────── */}
      {pr && (
        <button
          className="btn btn-ghost btn-sm w-full"
          onClick={handleQuickFill}
          style={{
            marginBottom: 'var(--space-3)',
            border: '1.5px dashed var(--border)',
            borderRadius: 'var(--radius-md)',
            justifyContent: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
          Repeat last: {pr.lastReps} reps
          {pr.lastWeight > 0 ? ` · ${pr.lastWeight} ${weightUnit}` : ' · Bodyweight'}
        </button>
      )}

      {/* ── Input row ──────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-3)',
          animation: shake ? 'shake 0.4s ease' : undefined,
        }}
      >
        <div className="input-group">
          <label className="input-label">Reps</label>
          <input
            ref={repsRef}
            className="input"
            type="number"
            inputMode="numeric"
            min="1"
            placeholder="10"
            value={reps}
            onChange={e => setReps(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ textAlign: 'center', fontWeight: 900, fontSize: 'var(--text-xl)' }}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Weight ({weightUnit})</label>
          <input
            className="input"
            type="number"
            inputMode="decimal"
            min="0"
            step="2.5"
            placeholder={isBodyweight ? '—' : '0'}
            value={isBodyweight ? '' : weight}
            disabled={isBodyweight}
            onChange={e => setWeight(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              textAlign: 'center',
              fontWeight: 900,
              fontSize: 'var(--text-xl)',
              opacity: isBodyweight ? 0.4 : 1,
            }}
          />
        </div>
      </div>

      {/* ── Bodyweight toggle ──────────────────────────────── */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
          cursor: 'pointer',
          userSelect: 'none',
          width: 'fit-content',
        }}
      >
        <div
          onClick={() => { setIsBodyweight(v => !v); if (!isBodyweight) setWeight('') }}
          style={{
            width: 36,
            height: 20,
            borderRadius: 999,
            background: isBodyweight ? 'var(--accent)' : 'var(--border)',
            position: 'relative',
            transition: 'background 0.2s ease',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 2,
              left: isBodyweight ? 18 : 2,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'left 0.2s ease',
            }}
          />
        </div>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Bodyweight
        </span>
      </label>

      {/* ── Add Set button ─────────────────────────────────── */}
      <button
        className="btn btn-primary w-full"
        onClick={handleAdd}
        style={{
          marginBottom: 'var(--space-5)',
          fontSize: 'var(--text-lg)',
          padding: 'var(--space-4)',
          background: flash
            ? 'var(--success)'
            : !isValid
            ? 'var(--text-muted)'
            : undefined,
          transition: 'background 0.3s ease, transform 0.1s ease',
          cursor: !isValid ? 'not-allowed' : 'pointer',
        }}
      >
        {flash ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Set Added!
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            Add Set
          </>
        )}
      </button>

      {/* ── Today's set list ───────────────────────────────── */}
      {todaySets.length > 0 && (
        <div>
          <div
            className="text-xs font-bold text-muted"
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 'var(--space-2)',
            }}
          >
            Today's Sets
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {todaySets.map((log, i) => (
              <SetRow key={log.timestamp} log={log} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Animations ─────────────────────────────────────── */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
      `}</style>
    </div>
  )
}
