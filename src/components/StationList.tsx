// ============================================================
// Work Clicker — Station List ("Golden Hour Office")
// Clean white card with amber progress bars
// ============================================================

import React from 'react';
import { STATIONS } from '../data/stations';

interface StationListProps {
  ownedStations: Record<string, number>;
  wpPerSecond: number;
}

const StationList: React.FC<StationListProps> = ({ ownedStations, wpPerSecond }) => {
  const owned = STATIONS
    .filter((st) => (ownedStations[st.id] ?? 0) > 0)
    .sort((a, b) => a.tier - b.tier);

  return (
    <div style={styles.container} className="warm-card">
      <div style={styles.titleRow}>
        <span style={styles.title}>Your Stations</span>
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
                  background: 'linear-gradient(90deg, #E8900C, #E8B30C)',
                  borderRadius: 2,
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
    padding: '12px 14px',
    color: '#2D2A26',
    overflow: 'auto',
    flexShrink: 0,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #E8E2D8',
    paddingBottom: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#2D2A26',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  titleLabel: {
    fontSize: 11,
    color: '#B5AFA6',
    fontWeight: 500,
  },
  emptyMsg: {
    color: '#B5AFA6',
    fontSize: 13,
    textAlign: 'center',
    padding: '12px 0',
  },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    padding: '6px 0',
    borderBottom: '1px solid #F5F0E8',
  },
  rowTop: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
  },
  icon: {
    fontSize: 16,
    width: 22,
    textAlign: 'center',
    flexShrink: 0,
  },
  name: {
    flex: 1,
    color: '#2D2A26',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 13,
    fontWeight: 500,
  },
  count: {
    color: '#FFFFFF',
    fontWeight: 700,
    flexShrink: 0,
    fontSize: 11,
    background: '#E8900C',
    padding: '1px 8px',
    borderRadius: 12,
  },
  wps: {
    color: '#7A736A',
    fontSize: 11,
    flexShrink: 0,
    minWidth: 55,
    textAlign: 'right',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  barTrack: {
    height: 3,
    background: '#F5F0E8',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
  },
};

export default StationList;
