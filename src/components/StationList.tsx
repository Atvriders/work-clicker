// ============================================================
// Work Clicker — Station List ("Late Night at the Office")
// Dark rows with colored left borders, yellow badges, WPS bars
// ============================================================

import React from 'react';
import { STATIONS } from '../data/stations';

interface StationListProps {
  ownedStations: Record<string, number>;
  wpPerSecond: number;
}

const BORDER_COLORS = ['#E8D44D', '#F48FB1', '#81D4FA', '#A5D6A7'];

const StationList: React.FC<StationListProps> = ({ ownedStations, wpPerSecond }) => {
  const owned = STATIONS
    .filter((st) => (ownedStations[st.id] ?? 0) > 0)
    .sort((a, b) => a.tier - b.tier);

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <span style={styles.title}>YOUR STATIONS</span>
        <span style={styles.titleLabel}>{owned.length} active</span>
      </div>

      {owned.length === 0 ? (
        <div style={styles.emptyMsg}>No stations yet -- buy some from the supply closet</div>
      ) : (
        <div style={styles.stationGrid}>
          {owned.map((st, i) => {
            const count = ownedStations[st.id] ?? 0;
            const totalWps = +(st.baseWps * count).toFixed(1);
            const wpsContribution = wpPerSecond > 0 ? totalWps / wpPerSecond : 0;
            const borderColor = BORDER_COLORS[i % BORDER_COLORS.length];

            return (
              <div
                key={st.id}
                style={{
                  ...styles.stationRow,
                  borderLeft: `3px solid ${borderColor}`,
                }}
              >
                <span style={styles.stationIcon}>{st.icon}</span>
                <div style={styles.stationInfo}>
                  <div style={styles.stationNameRow}>
                    <span style={styles.stationName}>{st.name}</span>
                    <span style={styles.countBadge}>x{count}</span>
                  </div>
                  <div style={styles.wpsRow}>
                    <span style={styles.wpsLabel}>{totalWps} w/s</span>
                    <div style={styles.wpsTrack}>
                      <div
                        style={{
                          ...styles.wpsBar,
                          width: `${Math.min(100, wpsContribution * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '12px 14px',
    color: '#E8E6E1',
    overflow: 'auto',
    flexShrink: 0,
    background: '#2A2A2F',
    borderRadius: 8,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #3A3A3F',
    paddingBottom: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    color: '#E8D44D',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    letterSpacing: 1.5,
  },
  titleLabel: {
    fontSize: 11,
    color: '#9E9B94',
    fontWeight: 500,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  emptyMsg: {
    color: '#9E9B94',
    fontSize: 12,
    textAlign: 'center',
    padding: '12px 0',
    fontFamily: "'IBM Plex Mono', monospace",
    fontStyle: 'italic',
  },
  stationGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  stationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    background: '#232328',
    borderRadius: 4,
  },
  stationIcon: {
    fontSize: 20,
    lineHeight: 1,
    flexShrink: 0,
  },
  stationInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  stationNameRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stationName: {
    fontSize: 12,
    fontWeight: 600,
    color: '#E8E6E1',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  countBadge: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1A1A1E',
    background: '#E8D44D',
    padding: '1px 7px',
    borderRadius: 10,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  wpsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  wpsLabel: {
    fontSize: 10,
    color: '#9E9B94',
    fontWeight: 600,
    fontFamily: "'IBM Plex Mono', monospace",
    whiteSpace: 'nowrap',
  },
  wpsTrack: {
    flex: 1,
    height: 4,
    background: '#3A3A3F',
    borderRadius: 2,
    overflow: 'hidden',
  },
  wpsBar: {
    height: '100%',
    background: '#E8D44D',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
};

export default StationList;
