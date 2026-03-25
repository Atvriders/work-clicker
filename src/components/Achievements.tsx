// ============================================================
// Work Clicker — Achievements ("Golden Hour Office")
// Trophy case with gold borders
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
        <div style={styles.title}>Trophies</div>
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
    borderBottom: '1px solid #E8E2D8',
    paddingBottom: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#2D2A26',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  count: {
    fontSize: 12,
    color: '#E8900C',
    fontWeight: 700,
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
    border: '1px solid #E8E2D8',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: 75,
    textAlign: 'center',
    background: '#FFFFFF',
  },
  badgeUnlocked: {
    background: '#FFFDF9',
    borderColor: '#E8B30C',
    boxShadow: '0 2px 8px rgba(232, 179, 12, 0.12)',
  },
  badgeLocked: {
    background: '#F9F7F4',
    borderColor: '#E8E2D8',
  },
  badgeIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  badgeIconLocked: {
    fontSize: 26,
    marginBottom: 4,
    filter: 'grayscale(100%) brightness(0.6)',
  },
  badgeName: {
    fontSize: 10,
    lineHeight: 1.2,
    color: '#2D2A26',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontWeight: 600,
  },
  badgeNameLocked: {
    fontSize: 10,
    lineHeight: 1.2,
    color: '#B5AFA6',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 14px',
    fontSize: 12,
    color: '#2D2A26',
    zIndex: 100,
    pointerEvents: 'none',
    marginBottom: 8,
    maxWidth: 220,
    whiteSpace: 'normal',
    background: '#FFFFFF',
    borderRadius: 10,
    border: '1px solid #E8E2D8',
    boxShadow: '0 4px 16px rgba(45,42,38,0.1)',
  },
  tooltipName: {
    fontWeight: 700,
    marginBottom: 3,
    color: '#2D2A26',
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 13,
  },
  tooltipDesc: {
    color: '#7A736A',
    fontSize: 11,
    lineHeight: 1.4,
  },
};

export default Achievements;
