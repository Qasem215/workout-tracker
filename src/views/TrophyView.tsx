import { useMemo } from 'react'
import { useStore } from '../store/context'
import type { ParsedWorkoutData, Trophy, TrophyTier } from '../types'

interface Props {
  data: ParsedWorkoutData | null
}

/* ── Tier visual config ─────────────────────────────────────────────────── */
const TIER_CONFIG: Record<TrophyTier, {
  label: string
  emoji: string
  gradient: string
  color: string
  bg: string
  glow: string
}> = {
  Bronze: {
    label: 'Bronze',
    emoji: '🥉',
    gradient: 'linear-gradient(135deg, #b5651d 0%, #d4883a 100%)',
    color: 'var(--bronze)',
    bg: 'var(--bronze-bg)',
    glow: 'rgba(185,101,29,0.25)',
  },
  Silver: {
    label: 'Silver',
    emoji: '🥈',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
    color: 'var(--silver)',
    bg: 'var(--silver-bg)',
    glow: 'rgba(107,114,128,0.25)',
  },
  Gold: {
    label: 'Gold',
    emoji: '🥇',
    gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
    color: 'var(--gold)',
    bg: 'var(--gold-bg)',
    glow: 'rgba(180,83,9,0.25)',
  },
  Platinum: {
    label: 'Platinum',
    emoji: '💎',
    gradient: 'linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)',
    color: 'var(--platinum)',
    bg: 'var(--platinum-bg)',
    glow: 'rgba(91,33,182,0.3)',
  },
}

const TIER_ORDER: TrophyTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ── Icons ──────────────────────────────────────────────────────────────── */
function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

/* ── Overall stats banner ───────────────────────────────────────────────── */
function StatsBanner({ trophies, unlocked }: { trophies: Trophy[]; unlocked: string[] }) {
  const total = trophies.length
  const unlockedCount = unlocked.length
  const pct = total > 0 ? (unlockedCount / total) * 100 : 0

  const byTier = useMemo(() =>
    TIER_ORDER.map(tier => ({
      tier,
      total: trophies.filter(t => t.tier === tier).length,
      earned: unlocked.filter(name => trophies.find(t => t.name === name && t.tier === tier)).length,
      cfg: TIER_CONFIG[tier],
    })), [trophies, unlocked])

  return (
    <div
      className="card card--elevated"
      style={{
        background: 'linear-gradient(135deg, var(--accent) 0%, #7c3aed 100%)',
        border: 'none',
        color: '#fff',
        marginBottom: 'var(--space-5)',
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Trophy Room
          </div>
          <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 900, lineHeight: 1 }}>
            {unlockedCount}<span style={{ fontSize: 'var(--text-xl)', opacity: 0.7 }}>/{total}</span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', opacity: 0.7, marginTop: 4 }}>
            {Math.round(pct)}% complete
          </div>
        </div>
        <div style={{ fontSize: '3.5rem', opacity: 0.9 }}>🏆</div>
      </div>

      {/* Overall progress bar */}
      <div style={{ height: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'rgba(255,255,255,0.85)', borderRadius: 999, transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </div>

      {/* Tier breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
        {byTier.map(({ tier, total: t, earned, cfg }) => (
          <div key={tier} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)' }}>
            <div style={{ fontSize: '1.25rem' }}>{cfg.emoji}</div>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 900, marginTop: 2 }}>{earned}/{t}</div>
            <div style={{ fontSize: '0.6rem', opacity: 0.7, fontWeight: 700, textTransform: 'uppercase' }}>{tier}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Single trophy tile ─────────────────────────────────────────────────── */
function TrophyTile({ trophy, isUnlocked, unlockedAt }: {
  trophy: Trophy
  isUnlocked: boolean
  unlockedAt?: string
}) {
  const cfg = TIER_CONFIG[trophy.tier]

  if (isUnlocked) {
    return (
      <div
        style={{
          background: cfg.gradient,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-4)',
          boxShadow: `0 4px 20px ${cfg.glow}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          animation: 'fadeIn 0.3s ease',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Shimmer overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* Tier emoji */}
        <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>{cfg.emoji}</div>

        {/* Name */}
        <div style={{ fontWeight: 900, fontSize: 'var(--text-sm)', lineHeight: 1.25, marginTop: 'var(--space-1)' }}>
          {trophy.name}
        </div>

        {/* Condition */}
        <div style={{ fontSize: '0.68rem', opacity: 0.85, fontWeight: 600, lineHeight: 1.4, flex: 1 }}>
          {trophy.condition}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 900 }}>
              ⚡ {trophy.reward.toLocaleString()} XP
            </span>
            {unlockedAt && (
              <span style={{ fontSize: '0.62rem', opacity: 0.75, fontWeight: 700 }}>
                {formatDate(unlockedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Locked tile
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        opacity: 0.55,
      }}
    >
      {/* Lock icon */}
      <div style={{ color: 'var(--text-muted)' }}>
        <LockIcon />
      </div>

      {/* Name */}
      <div style={{ fontWeight: 900, fontSize: 'var(--text-sm)', lineHeight: 1.25, color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
        {trophy.name}
      </div>

      {/* Condition */}
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.4, flex: 1 }}>
        {trophy.condition}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 900, color: 'var(--text-muted)' }}>
          ⚡ {trophy.reward.toLocaleString()} XP
        </span>
      </div>
    </div>
  )
}

/* ── Tier section ───────────────────────────────────────────────────────── */
function TierSection({ tier, trophies, unlockedNames, unlockDates }: {
  tier: TrophyTier
  trophies: Trophy[]
  unlockedNames: string[]
  unlockDates: Record<string, string>
}) {
  const cfg = TIER_CONFIG[tier]
  const tierTrophies = trophies.filter(t => t.tier === tier)
  const earnedCount = tierTrophies.filter(t => unlockedNames.includes(t.name)).length
  const pct = tierTrophies.length > 0 ? (earnedCount / tierTrophies.length) * 100 : 0

  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      {/* Tier header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: '1.5rem' }}>{cfg.emoji}</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 'var(--text-base)', color: cfg.color }}>
              {cfg.label}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 700 }}>
              {earnedCount} / {tierTrophies.length} unlocked
            </div>
          </div>
        </div>

        {earnedCount === tierTrophies.length && tierTrophies.length > 0 && (
          <span className="badge" style={{ background: cfg.bg, color: cfg.color, fontSize: '0.65rem' }}>
            Complete ✓
          </span>
        )}
      </div>

      {/* Tier progress bar */}
      <div style={{ height: 5, background: 'var(--bg-elevated)', borderRadius: 999, overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: cfg.gradient,
          borderRadius: 999,
          transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      </div>

      {/* Trophy grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        {tierTrophies.map(trophy => {
          const isUnlocked = unlockedNames.includes(trophy.name)
          return (
            <TrophyTile
              key={trophy.name}
              trophy={trophy}
              isUnlocked={isUnlocked}
              unlockedAt={unlockDates[trophy.name]}
            />
          )
        })}
      </div>
    </div>
  )
}

/* ── TrophyView root ────────────────────────────────────────────────────── */
export default function TrophyView({ data }: Props) {
  const { state } = useStore()
  // state.trophyUnlockDates passed down through TierSection

  if (!data) {
    return (
      <div>
        <p className="page-title">Trophies</p>
        <div className="card"><p className="text-muted">Loading…</p></div>
      </div>
    )
  }

  return (
    <div>
      <StatsBanner trophies={data.trophies} unlocked={state.trophiesUnlocked} />

      {TIER_ORDER.map(tier => (
        <TierSection
          key={tier}
          tier={tier}
          trophies={data.trophies}
          unlockedNames={state.trophiesUnlocked}
          unlockDates={state.trophyUnlockDates}
        />
      ))}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
