import { useEffect, useState } from 'react'
import type { TrophyToastEntry } from '../hooks/useTrophyCheck'
import type { TrophyTier } from '../types'

const DISMISS_DELAY = 4500
const EXIT_DURATION = 380

/* ── Tier config ────────────────────────────────────────────────────────── */
const TIER: Record<TrophyTier, { gradient: string; glow: string; emoji: string; label: string }> = {
  Bronze:   { gradient: 'linear-gradient(135deg, #b5651d 0%, #d4883a 100%)', glow: 'rgba(185,101,29,0.45)',  emoji: '🥉', label: 'Bronze' },
  Silver:   { gradient: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)', glow: 'rgba(107,114,128,0.4)',  emoji: '🥈', label: 'Silver' },
  Gold:     { gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)', glow: 'rgba(180,83,9,0.45)',   emoji: '🥇', label: 'Gold'   },
  Platinum: { gradient: 'linear-gradient(135deg, #5b21b6 0%, #8b5cf6 100%)', glow: 'rgba(91,33,182,0.5)',   emoji: '💎', label: 'Platinum' },
}

/* ── Web Audio chime (no audio files needed) ────────────────────────────── */
function playChime(tier: TrophyTier) {
  try {
    const ctx = new AudioContext()
    // Progressively higher tones: C5 → E5 → G5 → C6
    const freq: Record<TrophyTier, number> = {
      Bronze: 523, Silver: 659, Gold: 784, Platinum: 1047,
    }
    // Two-note ding for Platinum, single note otherwise
    const notes = tier === 'Platinum'
      ? [{ f: 784, t: 0 }, { f: 1047, t: 0.18 }]
      : [{ f: freq[tier], t: 0 }]

    for (const { f, t } of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(f, ctx.currentTime + t)
      gain.gain.setValueAtTime(0, ctx.currentTime + t)
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 1.0)
      osc.start(ctx.currentTime + t)
      osc.stop(ctx.currentTime + t + 1.0)
    }
  } catch {
    // AudioContext unavailable — silent fail
  }
}

/* ── Single toast item ──────────────────────────────────────────────────── */
function ToastItem({
  entry,
  onDismiss,
}: {
  entry: TrophyToastEntry
  onDismiss: () => void
}) {
  const [exiting, setExiting] = useState(false)
  const cfg = TIER[entry.tier as TrophyTier]

  const dismiss = () => {
    if (exiting) return
    setExiting(true)
    setTimeout(onDismiss, EXIT_DURATION)
  }

  // Auto-dismiss timer
  useEffect(() => {
    playChime(entry.tier as TrophyTier)
    const t = setTimeout(dismiss, DISMISS_DELAY)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed',
        bottom: 'calc(var(--nav-height) + var(--space-4))',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - var(--space-8))',
        maxWidth: 420,
        zIndex: 200,
        cursor: 'pointer',
        animation: exiting
          ? `toastOut ${EXIT_DURATION}ms cubic-bezier(0.4,0,1,1) forwards`
          : 'toastIn 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: `0 8px 40px ${cfg.glow}, 0 2px 8px rgba(0,0,0,0.2)`,
        userSelect: 'none',
      }}
    >
      {/* Card body */}
      <div
        style={{
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'stretch',
          gap: 0,
        }}
      >
        {/* Left accent strip */}
        <div
          style={{
            width: 6,
            background: cfg.gradient,
            flexShrink: 0,
          }}
        />

        {/* Tier emoji column */}
        <div
          style={{
            background: cfg.gradient,
            width: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            flexShrink: 0,
          }}
        >
          {cfg.emoji}
        </div>

        {/* Text content */}
        <div style={{ flex: 1, padding: 'var(--space-4) var(--space-4) var(--space-4) var(--space-3)', minWidth: 0 }}>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 'var(--space-1)',
              background: cfg.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {cfg.label} Trophy Unlocked
          </div>

          <div
            style={{
              fontWeight: 900,
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-1)',
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {entry.name}
          </div>

          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              fontWeight: 700,
            }}
          >
            ⚡ +{entry.xpReward.toLocaleString()} XP
          </div>
        </div>

        {/* Dismiss × */}
        <div
          style={{
            padding: 'var(--space-3)',
            color: 'var(--text-muted)',
            fontSize: 'var(--text-lg)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            fontWeight: 300,
            lineHeight: 1,
          }}
        >
          ×
        </div>
      </div>

      {/* Countdown bar */}
      <div
        style={{
          height: 3,
          background: 'var(--bg-elevated)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            background: cfg.gradient,
            animation: `countdown ${DISMISS_DELAY}ms linear forwards`,
            transformOrigin: 'left',
          }}
        />
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(30px) scale(0.94); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1);    }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1);    }
          to   { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.96); }
        }
        @keyframes countdown {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </div>
  )
}

/* ── Public component — renders the head of the queue ───────────────────── */
export default function TrophyToast({
  queue,
  onDismiss,
}: {
  queue: TrophyToastEntry[]
  onDismiss: (id: string) => void
}) {
  if (queue.length === 0) return null

  const first = queue[0]
  return (
    <ToastItem
      key={first.id}
      entry={first}
      onDismiss={() => onDismiss(first.id)}
    />
  )
}
