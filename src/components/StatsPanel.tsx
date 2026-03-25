// ============================================================
// Work Clicker — Stats Panel ("Late Night at the Office")
// Vertical card layout for left column
// ============================================================

import React from 'react';

interface StatsPanelProps {
  wp: number;
  wps: number;
  wpPerClick: number;
  shiftStart: number;
  clockOutTime: number;
  shiftsCompleted: number;
  overtimeMinutes: number;
  activeEventName: string | null;
  isOnShift: boolean;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  wp,
  wps,
  wpPerClick,
  shiftStart,
  clockOutTime,
  shiftsCompleted,
  overtimeMinutes,
  activeEventName,
  isOnShift,
}) => {
  const now = Date.now();
  const shiftDuration = clockOutTime - shiftStart;
  const elapsed = now - shiftStart;
  const progress = isOnShift && shiftDuration > 0 ? Math.min(1, Math.max(0, elapsed / shiftDuration)) : 0;
  const progressPct = (progress * 100).toFixed(1);

  const stats: { label: string; value: string; highlight?: boolean; danger?: boolean }[] = [
    { label: 'TOTAL WP', value: formatNumber(wp), highlight: true },
    { label: 'WP/SEC', value: wps.toFixed(1) },
    { label: 'WP/CLICK', value: wpPerClick.toFixed(1) },
    { label: 'SHIFTS', value: String(shiftsCompleted) },
    { label: 'OVERTIME', value: `${overtimeMinutes.toFixed(0)}m`, danger: overtimeMinutes > 0 },
  ];

  if (isOnShift) {
    stats.push({ label: 'PROGRESS', value: `${progressPct}%` });
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>STATS</div>

      <div style={styles.statsList}>
        {stats.map((s) => (
          <div key={s.label} style={styles.statRow}>
            <span style={styles.statLabel}>{s.label}</span>
            <span
              className="tabular-nums"
              style={{
                ...styles.statValue,
                ...(s.highlight ? styles.statHighlight : {}),
                ...(s.danger ? styles.statDanger : {}),
              }}
            >
              {s.value}
            </span>
          </div>
        ))}

        {activeEventName && (
          <div style={styles.statRow}>
            <span style={styles.statLabel}>EVENT</span>
            <span style={styles.eventPill}>{activeEventName}</span>
          </div>
        )}
      </div>

      {/* Shift progress bar */}
      {isOnShift && (
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressBar,
              width: `${progress * 100}%`,
              background: progress > 0.9 ? '#66BB6A' : progress > 0.7 ? '#FFA726' : '#E8D44D',
              boxShadow: `0 0 4px ${progress > 0.9 ? '#66BB6A' : '#E8D44D'}40`,
            }}
          />
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#2A2A2F',
    borderRadius: 8,
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: 11,
    fontWeight: 700,
    color: '#E8D44D',
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    borderBottom: '1px solid #3A3A3F',
    paddingBottom: 6,
  },
  statsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2px 0',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B6860',
    fontWeight: 600,
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#E8E6E1',
    lineHeight: 1.2,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  statHighlight: {
    fontSize: 16,
    fontWeight: 700,
    color: '#E8D44D',
    textShadow: '0 0 6px rgba(232,212,77,0.3)',
  },
  statDanger: {
    color: '#EF5350',
    textShadow: '0 0 4px rgba(239,83,80,0.3)',
  },
  eventPill: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1A1A1E',
    background: '#E8D44D',
    padding: '2px 8px',
    borderRadius: 10,
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: 0.5,
    whiteSpace: 'nowrap',
  },
  progressTrack: {
    height: 3,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 1s linear',
  },
};

export default StatsPanel;
