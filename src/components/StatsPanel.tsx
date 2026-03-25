// ============================================================
// Work Clicker — Stats Panel ("Golden Hour Office")
// Clean white card with 2-column stat grid
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

  return (
    <div style={styles.container} className="warm-card">
      <div style={styles.title}>Stats</div>

      {/* Stats grid */}
      <div style={styles.grid}>
        <StatItem icon="\uD83D\uDCB0" label="Total WP" value={formatNumber(wp)} large />
        <StatItem icon="\u26A1" label="WP/sec" value={wps.toFixed(1)} />
        <StatItem icon="\uD83D\uDDB1\uFE0F" label="WP/click" value={wpPerClick.toFixed(1)} />
        <StatItem icon="\u2705" label="Shifts Done" value={String(shiftsCompleted)} />
        <StatItem
          icon="\u23F0"
          label="Overtime"
          value={`${overtimeMinutes.toFixed(0)}m`}
          valueColor={overtimeMinutes > 0 ? '#C45A3C' : undefined}
        />
        {isOnShift && (
          <StatItem icon="\uD83D\uDCC8" label="Shift Progress" value={`${progressPct}%`} />
        )}
      </div>

      {/* Shift progress bar */}
      {isOnShift && (
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressBar,
              width: `${progress * 100}%`,
              background: progress > 0.9 ? '#4A8B5C' : progress > 0.7 ? '#E8B30C' : '#E8900C',
            }}
          />
        </div>
      )}

      {/* Active event */}
      {activeEventName && (
        <div style={styles.eventBlock}>
          <span style={styles.eventName}>{activeEventName}</span>
        </div>
      )}
    </div>
  );
};

interface StatItemProps {
  icon: string;
  label: string;
  value: string;
  large?: boolean;
  valueColor?: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, large, valueColor }) => (
  <div style={styles.statCell}>
    <span style={styles.statIcon}>{icon}</span>
    <div style={styles.statInfo}>
      <span style={styles.statLabel}>{label}</span>
      <span
        className="tabular-nums"
        style={{
          ...(large ? styles.statBig : styles.statValue),
          ...(valueColor ? { color: valueColor } : {}),
        }}
      >
        {value}
      </span>
    </div>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '14px 16px',
    color: '#2D2A26',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#2D2A26',
    fontFamily: "'Playfair Display', Georgia, serif",
    paddingBottom: 8,
    borderBottom: '1px solid #E8E2D8',
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
    padding: '8px 10px',
    borderRadius: 8,
    background: '#FDFAF5',
  },
  statIcon: {
    fontSize: 18,
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
    fontSize: 10,
    color: '#B5AFA6',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  statBig: {
    fontSize: 20,
    fontWeight: 700,
    color: '#E8900C',
    lineHeight: 1,
    fontFamily: "'Source Sans 3', sans-serif",
  },
  statValue: {
    fontSize: 15,
    fontWeight: 600,
    color: '#2D2A26',
    lineHeight: 1.2,
    fontFamily: "'Source Sans 3', sans-serif",
  },
  progressTrack: {
    height: 5,
    background: '#F5F0E8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 1s linear',
  },
  eventBlock: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 20,
    background: '#FFF3E0',
    border: '1px solid rgba(232, 144, 12, 0.2)',
    alignSelf: 'flex-start',
  },
  eventName: {
    fontSize: 12,
    fontWeight: 600,
    color: '#E8900C',
  },
};

export default StatsPanel;
