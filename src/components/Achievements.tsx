// ============================================================
// Work Clicker — Achievements ("Corporate Dystopia Brutalism")
// Concrete slab achievement wall — amber glow on unlocked badges
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
      {/* Header — right-aligned progress counter */}
      <div style={styles.header}>
        <span style={styles.counter}>
          {unlockedCount} / {totalCount} UNLOCKED
        </span>
      </div>

      {/* Achievement grid */}
      <div style={styles.grid}>
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlockedIds.includes(ach.id);
          const isHovered = hoveredId === ach.id;
          const isHidden = !isUnlocked && ach.hidden;
          const showInfo = isUnlocked || !ach.hidden;

          // Build card style
          const cardStyle: React.CSSProperties = {
            ...styles.card,
            ...(isUnlocked ? styles.cardUnlocked : {}),
            ...(!isUnlocked && !isHidden ? styles.cardLocked : {}),
            ...(isHidden ? styles.cardHidden : {}),
          };

          return (
            <div
              key={ach.id}
              style={cardStyle}
              onMouseEnter={() => setHoveredId(ach.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Icon or placeholder */}
              <span
                style={
                  isUnlocked
                    ? styles.icon
                    : isHidden
                      ? styles.iconHidden
                      : styles.iconLocked
                }
              >
                {isUnlocked ? ach.icon : isHidden ? '???' : '?'}
              </span>

              {/* Name (only shown when unlocked) */}
              {isUnlocked && (
                <span style={styles.name}>{ach.name}</span>
              )}

              {/* Tooltip */}
              {isHovered && (
                <div style={styles.tooltip}>
                  <div style={styles.tooltipArrow} />
                  <div style={styles.tooltipName}>
                    {showInfo ? ach.name : '???'}
                  </div>
                  <div style={styles.tooltipDesc}>
                    {showInfo
                      ? ach.description
                      : 'Keep working to unlock!'}
                  </div>
                  {showInfo && ach.condition && (
                    <div style={styles.tooltipCondition}>
                      {formatCondition(ach.condition)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Format an unlock condition for display */
function formatCondition(condition: { type: string; value: number }): string {
  const v = condition.value.toLocaleString();
  switch (condition.type) {
    case 'total_clicks':
      return `Reach ${v} clicks`;
    case 'total_wp':
      return `Earn ${v} WP`;
    case 'upgrades':
      return `Buy ${v} upgrades`;
    case 'wp_rate':
      return `Reach ${v} WP/s`;
    default:
      return `${condition.type}: ${v}`;
  }
}

// ────────────────────────────────────────────────────────────
// Styles — all inline, CSS custom properties for theme tokens
// ────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 4,
  },

  // Header — right-aligned counter
  header: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: '1px solid var(--border, #2A2A2F)',
  },
  counter: {
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-secondary, #9E9B94)',
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },

  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
    gap: 8,
  },

  // Base card
  card: {
    position: 'relative' as const,
    width: '100%',
    aspectRatio: '1',
    maxHeight: 72,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
  },

  // Unlocked variant
  cardUnlocked: {
    background: 'var(--bg-card, #2A2A2F)',
    border: '1px solid var(--accent, #E8D44D)',
    boxShadow: '0 0 8px var(--accent-dim, rgba(232, 212, 77, 0.15))',
  },

  // Locked variant (known but not yet earned)
  cardLocked: {
    background: 'var(--bg-primary, #1E1E22)',
    border: '1px solid var(--border, #2A2A2F)',
  },

  // Hidden variant (not revealed)
  cardHidden: {
    background: 'var(--bg-primary, #1E1E22)',
    border: '1px solid var(--border, #252528)',
  },

  // Icons
  icon: {
    fontSize: 24,
    lineHeight: 1,
    marginBottom: 2,
  },
  iconLocked: {
    fontSize: 20,
    lineHeight: 1,
    color: 'var(--text-muted, #6B6860)',
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
  },
  iconHidden: {
    fontSize: 14,
    lineHeight: 1,
    color: 'var(--text-muted, #555250)',
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: 1,
  },

  // Name label (unlocked only)
  name: {
    fontSize: 8,
    lineHeight: 1.2,
    color: 'var(--text-secondary, #9E9B94)',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    textAlign: 'center' as const,
    padding: '0 2px',
    fontWeight: 600,
  },

  // Tooltip — dark panel with amber border, positioned above card
  tooltip: {
    position: 'absolute' as const,
    bottom: 'calc(100% + 10px)',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '8px 12px',
    zIndex: 200,
    pointerEvents: 'none' as const,
    minWidth: 160,
    maxWidth: 220,
    whiteSpace: 'normal' as const,
    background: '#111114',
    border: '1px solid var(--accent, #E8D44D)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
  },
  tooltipArrow: {
    position: 'absolute' as const,
    bottom: -6,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid var(--accent, #E8D44D)',
  },
  tooltipName: {
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
    fontWeight: 700,
    fontSize: 12,
    color: 'var(--accent, #E8D44D)',
    marginBottom: 3,
    lineHeight: 1.3,
  },
  tooltipDesc: {
    fontSize: 11,
    lineHeight: 1.4,
    color: 'var(--text-secondary, #9E9B94)',
    marginBottom: 4,
  },
  tooltipCondition: {
    fontSize: 9,
    lineHeight: 1.3,
    color: 'var(--text-muted, #6B6860)',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: 0.5,
    borderTop: '1px solid #2A2A2F',
    paddingTop: 4,
    marginTop: 2,
  },
};

export default Achievements;
