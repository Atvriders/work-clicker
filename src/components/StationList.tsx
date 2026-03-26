// ============================================================
// Work Clicker — Station List ("Corporate Dystopia Brutalism")
// Bleak concrete UI with amber accents and terminal green WPS
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

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flexShrink: 0,
    background: 'var(--bg-secondary, #1a1a1e)',
    border: '1px solid var(--border, #2a2a2f)',
    borderRadius: 0,
  };

  const headerStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    color: 'var(--text-secondary, #9E9B94)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    padding: '10px 14px',
    borderBottom: '1px solid var(--border, #2a2a2f)',
    margin: 0,
    userSelect: 'none',
  };

  const scrollAreaStyle: React.CSSProperties = {
    overflowY: 'auto',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  };

  const emptyStyle: React.CSSProperties = {
    color: 'var(--text-secondary, #9E9B94)',
    fontSize: 12,
    textAlign: 'center',
    padding: '24px 16px',
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
    opacity: 0.6,
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>YOUR STATIONS</div>

      {owned.length === 0 ? (
        <div style={emptyStyle}>No stations yet — buy one from the Shop</div>
      ) : (
        <div style={scrollAreaStyle}>
          {owned.map((st) => {
            const count = ownedStations[st.id] ?? 0;
            const totalWps = +(st.baseWps * count).toFixed(1);
            const wpsContribution = wpPerSecond > 0 ? totalWps / wpPerSecond : 0;

            const cardStyle: React.CSSProperties = {
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-primary, #232328)',
              border: '1px solid var(--border, #2a2a2f)',
              borderRadius: 2,
              overflow: 'hidden',
              cursor: 'default',
              transition: 'border-color 0.15s ease, background 0.15s ease',
            };

            const cardInnerStyle: React.CSSProperties = {
              display: 'flex',
              alignItems: 'center',
              padding: '6px 10px',
              gap: 10,
            };

            const iconStyle: React.CSSProperties = {
              fontSize: 20,
              lineHeight: 1,
              flexShrink: 0,
              width: 24,
              textAlign: 'center',
            };

            const centerStyle: React.CSSProperties = {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              minWidth: 0,
            };

            const nameStyle: React.CSSProperties = {
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-primary, #E8E6E1)',
              fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            };

            const wpsLabelStyle: React.CSSProperties = {
              fontSize: 10,
              fontWeight: 500,
              color: '#39FF14',
              fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
              letterSpacing: 0.5,
            };

            const badgeStyle: React.CSSProperties = {
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
              color: 'var(--accent, #E8D44D)',
              background: 'var(--accent-dim, rgba(232, 212, 77, 0.12))',
              borderRadius: 10,
              padding: '1px 8px',
              flexShrink: 0,
              lineHeight: '16px',
            };

            const barTrackStyle: React.CSSProperties = {
              width: '100%',
              height: 2,
              background: 'transparent',
            };

            const barFillStyle: React.CSSProperties = {
              height: '100%',
              width: `${Math.min(100, wpsContribution * 100)}%`,
              background: 'var(--accent, #E8D44D)',
              transition: 'width 0.3s ease',
            };

            return (
              <div
                key={st.id}
                style={cardStyle}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent, #E8D44D)';
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-hover, #2a2a30)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border, #2a2a2f)';
                  (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-primary, #232328)';
                }}
              >
                <div style={cardInnerStyle}>
                  <span style={iconStyle}>{st.icon}</span>
                  <div style={centerStyle}>
                    <span style={nameStyle}>{st.name}</span>
                    <span style={wpsLabelStyle}>{totalWps} w/s</span>
                  </div>
                  <span style={badgeStyle}>&times;{count}</span>
                </div>
                <div style={barTrackStyle}>
                  <div style={barFillStyle} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StationList;
