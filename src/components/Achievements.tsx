// ============================================================
// Work Clicker — Achievements ("Late Night Office")
// Employee of the Month wall with dark theme
// ============================================================

import React, { useState } from 'react';
import { ACHIEVEMENTS } from '../data/achievements';

interface AchievementsProps {
  unlockedIds: string[];
}

const Achievements: React.FC<AchievementsProps> = ({ unlockedIds }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const unlockedCount = unlockedIds.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>EMPLOYEE OF THE MONTH</div>
        <div style={styles.count}>
          {unlockedCount} / {totalCount}
        </div>
      </div>

      <div style={styles.grid}>
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlockedIds.includes(ach.id);
          const isHovered = hoveredId === ach.id;
          const showInfo = isUnlocked || !ach.hidden;

          return (
            <div
              key={ach.id}
              style={{
                ...styles.badge,
                ...(isUnlocked ? styles.badgeUnlocked : styles.badgeLocked),
              }}
              onMouseEnter={() => setHoveredId(ach.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <span
                style={
                  isUnlocked ? styles.badgeIcon : styles.badgeIconLocked
                }
              >
                {isUnlocked ? ach.icon : ach.hidden ? '?' : ach.icon}
              </span>
              <span
                style={
                  isUnlocked ? styles.badgeName : styles.badgeNameLocked
                }
              >
                {showInfo ? ach.name : '???'}
              </span>

              {isHovered && (
                <div style={styles.tooltip}>
                  <div style={styles.tooltipName}>
                    {showInfo ? ach.name : '???'}
                  </div>
                  <div style={styles.tooltipDesc}>
                    {showInfo ? ach.description : 'Keep working to unlock!'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 4,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #3A3A3F',
    paddingBottom: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#E8D44D',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    letterSpacing: 1,
  },
  count: {
    fontSize: 12,
    color: '#E8D44D',
    fontWeight: 700,
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))',
    gap: 8,
  },
  badge: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 10,
    border: '1px solid #3A3A3F',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: 75,
    textAlign: 'center',
    background: '#2A2A2F',
  },
  badgeUnlocked: {
    background: '#2A2A2F',
    borderColor: '#E8D44D',
    boxShadow: '0 0 12px rgba(232, 212, 77, 0.2)',
  },
  badgeLocked: {
    background: '#252528',
    borderColor: '#3A3A3F',
  },
  badgeIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  badgeIconLocked: {
    fontSize: 26,
    marginBottom: 4,
    filter: 'grayscale(100%) brightness(0.4)',
  },
  badgeName: {
    fontSize: 10,
    lineHeight: 1.2,
    color: '#D0CDC6',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 600,
  },
  badgeNameLocked: {
    fontSize: 10,
    lineHeight: 1.2,
    color: '#6B6860',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 14px',
    fontSize: 12,
    color: '#D0CDC6',
    zIndex: 100,
    pointerEvents: 'none',
    marginBottom: 8,
    maxWidth: 220,
    whiteSpace: 'normal',
    background: '#1A1A1E',
    borderRadius: 10,
    border: '1px solid #3A3A3F',
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
  },
  tooltipName: {
    fontWeight: 700,
    marginBottom: 3,
    color: '#E8D44D',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    fontSize: 13,
  },
  tooltipDesc: {
    color: '#9E9B94',
    fontSize: 11,
    lineHeight: 1.4,
  },
};

export default Achievements;
