// ============================================================
// Work Clicker — Station List (Compact with WPS bars)
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
  card: '#1a2332',
  border: 'rgba(26,115,232,0.2)',
  text: '#e8eaed',
  muted: '#9aa0a6',
};

const StationList: React.FC<StationListProps> = ({ ownedStations, wpPerSecond }) => {
  const owned = STATIONS
    .filter((st) => (ownedStations[st.id] ?? 0) > 0)
    .sort((a, b) => a.tier - b.tier);

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        YOUR STATIONS
        <span style={styles.titleLabel}>// {owned.length} active</span>
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
              {/* WPS contribution bar */}
              <div style={styles.barTrack}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, pct)}%`,
                  background: pct > 50 ? COLORS.blue : pct > 20 ? COLORS.amber : 'rgba(26,115,232,0.4)',
                  borderRadius: 1,
                  boxShadow: pct > 50 ? `0 0 4px ${COLORS.blue}` : 'none',
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
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: '8px 10px',
    color: COLORS.text,
    overflow: 'auto',
    flex: 1,
    minHeight: 0,
  },
  title: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.blue,
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 4,
    marginBottom: 4,
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
  emptyMsg: {
    color: COLORS.muted,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '8px 0',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    padding: '3px 0',
    borderBottom: '1px solid rgba(26,115,232,0.06)',
  },
  rowTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 11,
  },
  icon: {
    fontSize: 12,
    width: 18,
    textAlign: 'center',
    flexShrink: 0,
  },
  name: {
    flex: 1,
    color: COLORS.text,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 10,
  },
  count: {
    color: COLORS.amber,
    fontWeight: 'bold',
    flexShrink: 0,
    fontSize: 10,
  },
  wps: {
    color: COLORS.muted,
    fontSize: 9,
    flexShrink: 0,
    minWidth: 50,
    textAlign: 'right',
  },
  barTrack: {
    height: 2,
    background: 'rgba(26,115,232,0.08)',
    borderRadius: 1,
    overflow: 'hidden',
    marginTop: 1,
  },
};

export default StationList;
