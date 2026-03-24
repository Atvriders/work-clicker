// ============================================================
// Work Clicker — Achievements Grid (Glassmorphism Trophy Display)
// ============================================================

import React, { useState } from 'react';
import { ACHIEVEMENTS } from '../data/achievements';

const COLORS = {
  blue: '#1a73e8',
  amber: '#fbbc04',
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
        <div style={styles.title}>{'\uD83C\uDFC6'} TROPHIES</div>
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
                <div style={styles.tooltip} className="glass-card">
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
    borderBottom: '1px solid rgba(26, 115, 232, 0.1)',
    paddingBottom: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: 700,
    color: COLORS.blue,
  },
  count: {
    fontSize: 11,
    color: COLORS.amber,
    fontWeight: 700,
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
    borderRadius: 10,
    border: '1px solid rgba(26, 115, 232, 0.12)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: 70,
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  badgeUnlocked: {
    background: 'rgba(26, 115, 232, 0.06)',
    borderColor: 'rgba(26, 115, 232, 0.25)',
  },
  badgeLocked: {
    background: 'rgba(128, 128, 128, 0.04)',
    borderColor: 'rgba(128, 128, 128, 0.15)',
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
    fontWeight: 500,
  },
  badgeNameLocked: {
    fontSize: 9,
    lineHeight: 1.2,
    color: 'rgba(128, 128, 128, 0.5)',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '8px 12px',
    fontSize: 11,
    color: COLORS.text,
    zIndex: 100,
    pointerEvents: 'none',
    marginBottom: 6,
    maxWidth: 220,
    whiteSpace: 'normal',
  },
  tooltipName: {
    fontWeight: 700,
    marginBottom: 3,
    color: COLORS.blue,
  },
  tooltipDesc: {
    color: COLORS.muted,
  },
};

export default Achievements;
