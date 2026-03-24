// ============================================================
// Work Clicker — Stats Panel (Left Sidebar)
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

const COLORS = {
  blue: '#1a73e8',
  green: '#34a853',
  amber: '#fbbc04',
  red: '#ea4335',
  card: '#1a2332',
  border: 'rgba(26,115,232,0.2)',
  text: '#e8eaed',
  muted: '#9aa0a6',
};

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

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        STATS
        <span style={styles.titleLabel}>// PERFORMANCE</span>
      </div>

      {/* Total WP */}
      <div style={styles.statBlock}>
        <div style={styles.statLabel}>TOTAL WP</div>
        <div style={styles.statBig}>{formatNumber(wp)}</div>
      </div>

      {/* WP/sec */}
      <div style={styles.row}>
        <span style={styles.statLabel}>WP/sec</span>
        <span style={styles.statValue}>{wps.toFixed(1)}</span>
      </div>

      {/* WP/click */}
      <div style={styles.row}>
        <span style={styles.statLabel}>WP/click</span>
        <span style={styles.statValue}>{wpPerClick.toFixed(1)}</span>
      </div>

      {/* Shift progress bar */}
      {isOnShift && (
        <div style={styles.progressSection}>
          <div style={styles.row}>
            <span style={styles.statLabel}>Shift Progress</span>
            <span style={styles.statValue}>{progressPct}%</span>
          </div>
          <div style={styles.progressTrack}>
            <div
              style={{
                ...styles.progressBar,
                width: `${progress * 100}%`,
                background: progress > 0.9 ? COLORS.green : progress > 0.7 ? COLORS.amber : COLORS.blue,
              }}
            />
          </div>
        </div>
      )}

      <div style={styles.divider} />

      {/* Shifts completed */}
      <div style={styles.row}>
        <span style={styles.statLabel}>Shifts Completed</span>
        <span style={styles.statValue}>{shiftsCompleted}</span>
      </div>

      {/* Overtime */}
      <div style={styles.row}>
        <span style={styles.statLabel}>Overtime (min)</span>
        <span style={{
          ...styles.statValue,
          color: overtimeMinutes > 0 ? COLORS.red : COLORS.muted,
        }}>
          {overtimeMinutes.toFixed(0)}
        </span>
      </div>

      {/* Active event */}
      {activeEventName && (
        <>
          <div style={styles.divider} />
          <div style={styles.eventBlock}>
            <div style={styles.eventLabel}>ACTIVE EVENT</div>
            <div style={styles.eventName}>{activeEventName}</div>
          </div>
        </>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: '8px 10px',
    color: COLORS.text,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  title: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.blue,
    paddingBottom: 4,
    borderBottom: `1px solid ${COLORS.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  titleLabel: {
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 1,
    opacity: 0.5,
  },
  statBlock: {
    textAlign: 'center',
    padding: '8px 0',
  },
  statBig: {
    fontSize: 32,
    fontWeight: 700,
    color: COLORS.text,
    textShadow: '0 0 10px rgba(26,115,232,0.3)',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.text,
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  progressTrack: {
    height: 4,
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 1s linear',
  },
  divider: {
    height: 1,
    background: COLORS.border,
    margin: '2px 0',
  },
  eventBlock: {
    textAlign: 'center',
  },
  eventLabel: {
    fontSize: 9,
    color: COLORS.amber,
    letterSpacing: 2,
    marginBottom: 2,
  },
  eventName: {
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.amber,
    textShadow: '0 0 6px rgba(251,188,4,0.4)',
  },
};

export default StatsPanel;
