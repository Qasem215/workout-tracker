import { useRef, useState } from 'react'
import { useStore } from '../store/context'
import type { Theme, WeightUnit } from '../types'

/* ── Segmented control ───────────────────────────────────────────────────── */
function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { label: string; value: T }[]
  onChange: (v: T) => void
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-full)',
        padding: 3,
        gap: 2,
      }}
    >
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: 'var(--space-2) var(--space-5)',
            borderRadius: 'var(--radius-full)',
            fontWeight: 800,
            fontSize: 'var(--text-sm)',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
            background: value === opt.value ? 'var(--bg-card)' : 'transparent',
            color: value === opt.value ? 'var(--accent)' : 'var(--text-muted)',
            boxShadow: value === opt.value ? 'var(--shadow-sm)' : 'none',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

/* ── Section wrapper ─────────────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--space-5)' }}>
      <div
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-3)',
          paddingLeft: 'var(--space-1)',
        }}
      >
        {title}
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

/* ── Row within a section ────────────────────────────────────────────────── */
function Row({
  label,
  sublabel,
  children,
  danger,
}: {
  label: string
  sublabel?: string
  children?: React.ReactNode
  danger?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid var(--border)',
        gap: 'var(--space-4)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 'var(--text-sm)',
            color: danger ? 'var(--danger)' : 'var(--text-primary)',
          }}
        >
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2, fontWeight: 600 }}>
            {sublabel}
          </div>
        )}
      </div>
      {children && <div style={{ flexShrink: 0 }}>{children}</div>}
    </div>
  )
}

/* ── Import button ───────────────────────────────────────────────────────── */
function ImportButton() {
  const { importState } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importState(file)
      setStatus('success')
    } catch {
      setStatus('error')
    }
    setTimeout(() => setStatus('idle'), 2500)
    if (inputRef.current) inputRef.current.value = ''
  }

  const label =
    status === 'success' ? '✓ Imported!' :
    status === 'error'   ? '✕ Invalid file' :
    '↑ Import'

  const bg =
    status === 'success' ? 'var(--success)' :
    status === 'error'   ? 'var(--danger)'  :
    'var(--bg-elevated)'

  const color =
    status !== 'idle' ? '#fff' : 'var(--text-primary)'

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
      <button
        className="btn btn-sm"
        style={{ background: bg, color, border: '1px solid var(--border)', transition: 'all 0.2s ease', fontWeight: 800 }}
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </button>
    </>
  )
}

/* ── Reset guard ─────────────────────────────────────────────────────────── */
function ResetRow() {
  const { dispatch } = useStore()
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--danger)', marginBottom: 'var(--space-2)' }}>
          This will permanently delete all sessions, XP, and trophies.
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            className="btn btn-danger btn-sm"
            style={{ flex: 1 }}
            onClick={() => {
              dispatch({ type: 'RESET_STATE' })
              setConfirming(false)
            }}
          >
            Yes, reset everything
          </button>
          <button
            className="btn btn-ghost btn-sm"
            style={{ flex: 1 }}
            onClick={() => setConfirming(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <Row label="Reset All Data" danger>
      <button
        className="btn btn-sm"
        style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger)', fontWeight: 800 }}
        onClick={() => setConfirming(true)}
      >
        Reset
      </button>
    </Row>
  )
}

/* ── Stats summary ───────────────────────────────────────────────────────── */
function DataStats() {
  const { state } = useStore()
  const totalSets = state.sessions.reduce((acc, s) => acc + s.sets.length, 0)
  const uniqueExercises = new Set(state.sessions.flatMap(s => s.sets.map(l => l.exerciseName))).size

  const stats = [
    { label: 'Sessions', value: state.sessions.length },
    { label: 'Sets', value: totalSets },
    { label: 'Exercises', value: uniqueExercises },
    { label: 'Trophies', value: state.trophiesUnlocked.length },
    { label: 'Total XP', value: state.totalXP.toLocaleString() },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-2)',
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {stats.map(s => (
        <div key={s.label} style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: 'var(--text-lg)', color: 'var(--accent)' }}>
            {s.value}
          </div>
          <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── SettingsView root ───────────────────────────────────────────────────── */
export default function SettingsView() {
  const { state, dispatch, exportState } = useStore()

  const setTheme = (theme: Theme) =>
    dispatch({ type: 'SET_THEME', payload: { theme } })

  const setUnit = (unit: WeightUnit) =>
    dispatch({ type: 'SET_WEIGHT_UNIT', payload: { unit } })

  return (
    <div>
      <p className="page-title">Settings</p>

      {/* Appearance */}
      <Section title="Appearance">
        <Row label="Theme" sublabel="Applies across the whole app">
          <SegmentedControl<Theme>
            value={state.settings.theme}
            options={[
              { label: '☀️ Light', value: 'light' },
              { label: '🌙 Dark', value: 'dark' },
            ]}
            onChange={setTheme}
          />
        </Row>
      </Section>

      {/* Preferences */}
      <Section title="Workout Preferences">
        <Row label="Weight Unit" sublabel="Used in the set logger and PRs">
          <SegmentedControl<WeightUnit>
            value={state.settings.weightUnit}
            options={[
              { label: 'kg', value: 'kg' },
              { label: 'lbs', value: 'lbs' },
            ]}
            onChange={setUnit}
          />
        </Row>
      </Section>

      {/* Data & Backup */}
      <Section title="Data & Backup">
        <DataStats />
        <Row
          label="Export Progress"
          sublabel="Downloads a JSON backup of all your data"
        >
          <button
            className="btn btn-sm btn-secondary"
            style={{ fontWeight: 800 }}
            onClick={exportState}
          >
            ↓ Export
          </button>
        </Row>
        <Row
          label="Import Progress"
          sublabel="Restore from a previously exported backup"
        >
          <ImportButton />
        </Row>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone">
        <ResetRow />
      </Section>

      {/* About */}
      <Section title="About">
        <Row label="Workout Tracker" sublabel="Version 0.1.0" />
        <Row
          label="Workout Database"
          sublabel="workouts.md · 48 exercises · 23 trophies"
        />
      </Section>
    </div>
  )
}
