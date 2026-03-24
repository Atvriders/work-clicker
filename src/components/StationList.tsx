// ============================================================
// Work Clicker — Station List (Glassmorphism)
// ============================================================

import React from 'react';
import { STATIONS } from '../data/stations';

interface StationListProps {
  ownedStations: Record<string, number>;
  wpPerSecond: number;
}

const COLORS = {
  blue: '#1a73e8',
  amber: '#fbbc04',
  green: '#34a853',
  text: '#e8eaed',
  muted: '#9aa0a6',
};

const StationList: React.FC<StationListProps> = ({ ownedStations, wpPerSecond }) => {
  const owned = STATIONS
    .filter((st) => (ownedStations[st.id] ?? 0) > 0)
    .sort((a, b) => a.tier - b.tier);

  return (
    <div style={styles.container} className="glass-card">
      <div style={styles.title}>
        {'\uD83C\uDFE2'} Stations
        <span style={styles.titleLabel}>{owned.length} active</span>
      </div>

      {owned.length === 0 ? (
        <div style={styles.emptyMsg}>No stations yet</div>
      ) : (
        owned.map((st) => {
          const count = ownedStations[st.id] ?? 0;
          const totalWps = +(st.baseWps * count).toFixed(1);
          const pct = wpPerSecond > 0 ? (totalWps / wpPerSecond) * 100 : 0;
          return (
            <div key={st.id} style={styles.row}>
              <div style={styles.rowTop}>
                <span style={styles.icon}>{st.icon}</span>
                <span style={styles.name}>{st.name}</span>
                <span style={styles.count}>x{count}</span>
                <span style={styles.wps}>{totalWps} w/s</span>
              </div>
              <div style={styles.barTrack}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, pct)}%`,
                  background: pct > 50
                    ? `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.green})`
                    : pct > 20
                      ? COLORS.amber
                      : 'rgba(26, 115, 232, 0.4)',
                  borderRadius: 2,
                  boxShadow: pct > 50 ? `0 0 4px ${COLORS.blue}40` : 'none',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '10px 12px',
    color: '#e8eaed',
    overflow: 'auto',
    flexShrink: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.blue,
    borderBottom: '1px solid rgba(26, 115, 232, 0.1)',
    paddingBottom: 6,
    marginBottom: 6,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  titleLabel: {
    fontSize: 10,
    color: COLORS.muted,
    opacity: 0.6,
    fontWeight: 500,
    marginLeft: 'auto',
  },
  emptyMsg: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    padding: '12px 0',
    opacity: 0.5,
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '4px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  rowTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
  },
  icon: {
    fontSize: 14,
    width: 20,
    textAlign: 'center',
    flexShrink: 0,
  },
  name: {
    flex: 1,
    color: '#e8eaed',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 11,
    fontWeight: 500,
  },
  count: {
    color: COLORS.amber,
    fontWeight: 700,
    flexShrink: 0,
    fontSize: 11,
  },
  wps: {
    color: COLORS.muted,
    fontSize: 10,
    flexShrink: 0,
    minWidth: 50,
    textAlign: 'right',
    fontWeight: 500,
  },
  barTrack: {
    height: 3,
    background: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
  },
};

export default StationList;
