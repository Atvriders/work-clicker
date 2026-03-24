// ============================================================
// Work Clicker — Stats Panel (Glassmorphism Card)
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
    <div style={styles.container} className="glass-card">
      <div style={styles.title}>
        {'\uD83D\uDCCA'} Stats
      </div>

      {/* Stats grid */}
      <div style={styles.grid}>
        <div style={styles.statCell}>
          <span style={styles.statIcon}>{'\uD83D\uDCB0'}</span>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Total WP</span>
            <span style={styles.statBig}>{formatNumber(wp)}</span>
          </div>
        </div>

        <div style={styles.statCell}>
          <span style={styles.statIcon}>{'\u26A1'}</span>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>WP/sec</span>
            <span style={styles.statValue}>{wps.toFixed(1)}</span>
          </div>
        </div>

        <div style={styles.statCell}>
          <span style={styles.statIcon}>{'\uD83D\uDDB1\uFE0F'}</span>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>WP/click</span>
            <span style={styles.statValue}>{wpPerClick.toFixed(1)}</span>
          </div>
        </div>

        <div style={styles.statCell}>
          <span style={styles.statIcon}>{'\u2705'}</span>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Shifts Done</span>
            <span style={styles.statValue}>{shiftsCompleted}</span>
          </div>
        </div>

        <div style={styles.statCell}>
          <span style={styles.statIcon}>{'\u23F0'}</span>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Overtime</span>
            <span style={{
              ...styles.statValue,
              color: overtimeMinutes > 0 ? COLORS.red : COLORS.muted,
            }}>
              {overtimeMinutes.toFixed(0)}m
            </span>
          </div>
        </div>

        {isOnShift && (
          <div style={styles.statCell}>
            <span style={styles.statIcon}>{'\uD83D\uDCC8'}</span>
            <div style={styles.statInfo}>
              <span style={styles.statLabel}>Shift Progress</span>
              <span style={styles.statValue}>{progressPct}%</span>
            </div>
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
              background: progress > 0.9 ? COLORS.green : progress > 0.7 ? COLORS.amber : COLORS.blue,
            }}
          />
        </div>
      )}

      {/* Active event */}
      {activeEventName && (
        <div style={styles.eventBlock}>
          <span style={styles.eventIcon}>{'\uD83C\uDF1F'}</span>
          <span style={styles.eventName}>{activeEventName}</span>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '12px 14px',
    color: '#e8eaed',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.blue,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 6,
    borderBottom: '1px solid rgba(26, 115, 232, 0.12)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
  },
  statCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 8px',
    borderRadius: 8,
    background: 'rgba(255, 255, 255, 0.03)',
  },
  statIcon: {
    fontSize: 16,
    lineHeight: 1,
    flexShrink: 0,
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 0,
  },
  statLabel: {
    fontSize: 9,
    color: '#9aa0a6',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  statBig: {
    fontSize: 18,
    fontWeight: 700,
    color: '#e8eaed',
    lineHeight: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#e8eaed',
    lineHeight: 1.2,
  },
  progressTrack: {
    height: 4,
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 1s linear',
  },
  eventBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 8px',
    borderRadius: 8,
    background: 'rgba(251, 188, 4, 0.08)',
    border: '1px solid rgba(251, 188, 4, 0.15)',
  },
  eventIcon: {
    fontSize: 14,
  },
  eventName: {
    fontSize: 12,
    fontWeight: 600,
    color: COLORS.amber,
  },
};

export default StatsPanel;
