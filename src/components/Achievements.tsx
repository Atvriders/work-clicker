// ============================================================
// Work Clicker — Achievements Grid (Trophy display)
// ============================================================

import React, { useState } from 'react';
import { ACHIEVEMENTS } from '../data/achievements';

const COLORS = {
  blue: '#1a73e8',
  amber: '#fbbc04',
  card: '#1a2332',
  border: 'rgba(26,115,232,0.2)',
  text: '#e8eaed',
  muted: '#9aa0a6',
};

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
        <div style={styles.title}>TROPHIES</div>
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
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.blue,
  },
  count: {
    fontSize: 11,
    color: COLORS.amber,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: 8,
  },
  badge: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 6,
    border: `1px solid ${COLORS.border}`,
    cursor: 'pointer',
    transition: 'all 0.15s',
    minHeight: 70,
    textAlign: 'center',
  },
  badgeUnlocked: {
    background: 'rgba(26,115,232,0.05)',
    borderColor: 'rgba(26,115,232,0.3)',
  },
  badgeLocked: {
    background: 'rgba(128,128,128,0.05)',
    borderColor: 'rgba(128,128,128,0.2)',
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeIconLocked: {
    fontSize: 24,
    marginBottom: 4,
    filter: 'grayscale(100%) brightness(0.4)',
  },
  badgeName: {
    fontSize: 9,
    lineHeight: 1.2,
    color: COLORS.text,
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  badgeNameLocked: {
    fontSize: 9,
    lineHeight: 1.2,
    color: 'rgba(128,128,128,0.5)',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#0f1923',
    border: `1px solid ${COLORS.blue}`,
    borderRadius: 4,
    padding: '8px 10px',
    fontSize: 11,
    color: COLORS.text,
    zIndex: 100,
    pointerEvents: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
    marginBottom: 6,
    maxWidth: 220,
    whiteSpace: 'normal',
  },
  tooltipName: {
    fontWeight: 'bold',
    marginBottom: 3,
    color: COLORS.blue,
  },
  tooltipDesc: {
    color: COLORS.muted,
  },
};

export default Achievements;
