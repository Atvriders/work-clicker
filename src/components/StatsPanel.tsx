// ============================================================
// Work Clicker — Stats Panel ("Late Night at the Office")
// Terminal monitor style — dark card with green tint
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
    <div style={styles.container}>
      <div style={styles.inner}>
        <div style={styles.titleBar}>
          <span style={styles.titleDots}>
            <span style={styles.dotRed} />
            <span style={styles.dotYellow} />
            <span style={styles.dotGreen} />
          </span>
          <span style={styles.title}>SYSTEM STATUS</span>
          <span style={styles.titleRight}>v2.4.1</span>
        </div>

        {/* Stats grid */}
        <div style={styles.grid}>
          <StatItem label="TOTAL_WP" value={formatNumber(wp)} highlight />
          <StatItem label="WP/SEC" value={wps.toFixed(1)} />
          <StatItem label="WP/CLICK" value={wpPerClick.toFixed(1)} />
          <StatItem label="SHIFTS" value={String(shiftsCompleted)} />
          <StatItem
            label="OVERTIME"
            value={`${overtimeMinutes.toFixed(0)}m`}
            danger={overtimeMinutes > 0}
          />
          {isOnShift && (
            <StatItem label="PROGRESS" value={`${progressPct}%`} />
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

        {/* Active event — yellow pill */}
        {activeEventName && (
          <div style={styles.eventBlock}>
            <span style={styles.eventPill}>{activeEventName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface StatItemProps {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, highlight, danger }) => (
  <div style={styles.statCell}>
    <span style={styles.statLabel}>{label}:</span>
    <span
      className="tabular-nums"
      style={{
        ...styles.statValue,
        ...(highlight ? styles.statHighlight : {}),
        ...(danger ? styles.statDanger : {}),
      }}
    >
      {value}
    </span>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 0,
    background: '#1E2420',
    borderRadius: 8,
    borderTop: '2px solid #66BB6A',
    color: '#E8E6E1',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  inner: {
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    position: 'relative',
    zIndex: 2,
  },
  titleBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 8,
    borderBottom: '1px solid rgba(102,187,106,0.15)',
  },
  titleDots: {
    display: 'flex',
    gap: 4,
  },
  dotRed: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#EF5350',
  },
  dotYellow: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#E8D44D',
  },
  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#66BB6A',
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    color: '#66BB6A',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    letterSpacing: 2,
    flex: 1,
  },
  titleRight: {
    fontSize: 10,
    color: 'rgba(102,187,106,0.4)',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 4,
  },
  statCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 8px',
    borderRadius: 2,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  statLabel: {
    fontSize: 10,
    color: '#9E9B94',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 600,
    color: '#E8E6E1',
    lineHeight: 1.2,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  statHighlight: {
    fontSize: 18,
    fontWeight: 700,
    color: '#E8D44D',
    textShadow: '0 0 6px rgba(232,212,77,0.3)',
  },
  statDanger: {
    color: '#EF5350',
    textShadow: '0 0 4px rgba(239,83,80,0.3)',
  },
  progressTrack: {
    height: 4,
    background: 'rgba(102,187,106,0.1)',
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
    padding: '4px 8px',
  },
  eventPill: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1A1A1E',
    background: '#E8D44D',
    padding: '3px 10px',
    borderRadius: 12,
    fontFamily: "'IBM Plex Mono', monospace",
    letterSpacing: 0.5,
  },
};

export default StatsPanel;
