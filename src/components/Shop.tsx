// ============================================================
// Work Clicker — Shop ("Corporate Dystopia Brutalism")
// Concrete walls, amber warning lights, oppressive efficiency
// ============================================================

import React, { useState, useCallback } from 'react';
import { STATIONS } from '../data/stations';
import Achievements from './Achievements';

interface ShopProps {
  wp: number;
  totalWp: number;
  wpPerSecond: number;
  ownedStations: Record<string, number>;
  purchasedUpgrades: string[];
  onBuyStation: (stationId: string) => void;
  onBuyUpgrade: (upgradeId: string) => void;
  upgrades: UpgradeDef[];
  achievements: string[];
  prestigeLevel: number;
  prestigeMultiplier: number;
  prestigeCost: number;
  onPrestige: () => void;
}

interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  flavor: string;
  cost: number;
  icon: string;
  requires?: string;
  tier: number;
}

type ShopTab = 'STATIONS' | 'UPGRADES' | 'TROPHIES' | 'PRESTIGE';

/* ── Palette ─────────────────────────────────────────────── */
const C = {
  bg:          '#121214',
  bgCard:      '#1A1A1E',
  bgCardHover: '#222226',
  border:      '#2A2A2F',
  borderLight: '#3A3A3F',
  amber:       '#D4A017',
  amberBright: '#F5B800',
  amberDim:    'rgba(212,160,23,0.12)',
  amberGlow:   'rgba(212,160,23,0.25)',
  danger:      '#C62828',
  dangerDim:   '#EF5350',
  green:       '#4CAF50',
  textPrimary: '#D0CDC6',
  textMuted:   '#9AA8B8',
  textDim:     '#7A8899',
  mono:        "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
  sans:        "'Inter', 'Nunito', system-ui, sans-serif",
} as const;

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

function getStationCost(station: typeof STATIONS[0], owned: number): number {
  return Math.floor(station.baseCost * Math.pow(station.costMultiplier, owned));
}

/* ── Styles ──────────────────────────────────────────────── */

const s = {
  container: {
    padding: '14px',
    color: C.textPrimary,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    background: C.bg,
    borderRadius: 0,
    borderRight: `1px solid ${C.border}`,
  } as React.CSSProperties,

  tabRow: {
    display: 'flex',
    gap: 0,
    marginBottom: 0,
    flexShrink: 0,
    borderBottom: `1px solid ${C.border}`,
  } as React.CSSProperties,

  tab: {
    flex: 1,
    padding: '10px 0 8px',
    textAlign: 'center' as const,
    fontSize: 11,
    letterSpacing: '0.08em',
    cursor: 'pointer',
    border: 'none',
    borderBottom: '2px solid transparent',
    background: 'transparent',
    color: C.textMuted,
    fontFamily: C.mono,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    transition: 'color 0.15s, border-color 0.15s',
  } as React.CSSProperties,

  tabActive: {
    color: C.amber,
    borderBottom: `2px solid ${C.amber}`,
  } as React.CSSProperties,

  list: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 6,
    minHeight: 0,
    paddingTop: 10,
    paddingBottom: 4,
  } as React.CSSProperties,

  emptyMsg: {
    color: C.textMuted,
    fontSize: 12,
    textAlign: 'center' as const,
    padding: '32px 0',
    fontFamily: C.mono,
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
  } as React.CSSProperties,
};

/* ── Component ───────────────────────────────────────────── */

const Shop: React.FC<ShopProps> = ({
  wp,
  totalWp,
  wpPerSecond,
  ownedStations,
  purchasedUpgrades,
  onBuyStation,
  onBuyUpgrade,
  upgrades,
  achievements,
  prestigeLevel,
  prestigeMultiplier,
  prestigeCost,
  onPrestige,
}) => {
  const [tab, setTab] = useState<ShopTab>('STATIONS');
  const [showPrestigeConfirm, setShowPrestigeConfirm] = useState(false);
  const [flashId, setFlashId] = useState<string | null>(null);

  const unlockedStations = STATIONS.filter((st) => totalWp >= st.unlockAt);
  const availableUpgrades = upgrades.sort((a, b) => a.cost - b.cost);

  const flash = useCallback((id: string) => {
    setFlashId(id);
    setTimeout(() => setFlashId(null), 150);
  }, []);

  /* ── Render Tabs ──── */
  const renderTabs = () => (
    <div style={s.tabRow}>
      {(['STATIONS', 'UPGRADES', 'TROPHIES', 'PRESTIGE'] as ShopTab[]).map((t) => (
        <button
          key={t}
          style={{
            ...s.tab,
            ...(tab === t ? s.tabActive : {}),
          }}
          onClick={() => setTab(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );

  /* ── Station Card ──── */
  const renderStation = (st: typeof STATIONS[0]) => {
    const owned = ownedStations[st.id] ?? 0;
    const cost = getStationCost(st, owned);
    const canAfford = wp >= cost;
    const totalWps = owned > 0 ? +(st.baseWps * owned).toFixed(1) : 0;
    const pct = wpPerSecond > 0 && totalWps > 0 ? ((totalWps / wpPerSecond) * 100) : 0;
    const isFlashing = flashId === st.id;

    const cardStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      background: isFlashing ? 'rgba(212,160,23,0.15)' : C.bgCard,
      borderLeft: canAfford ? `3px solid ${C.amber}` : '3px solid transparent',
      borderTop: `1px solid ${C.border}`,
      borderRight: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      cursor: canAfford ? 'pointer' : 'default',
      transition: 'background 0.12s, border-color 0.12s',
      opacity: canAfford ? 1 : 0.55,
      position: 'relative',
    };

    return (
      <div
        key={st.id}
        style={cardStyle}
        onClick={() => {
          if (canAfford) {
            flash(st.id);
            onBuyStation(st.id);
          }
        }}
        onMouseEnter={(e) => {
          if (canAfford) (e.currentTarget as HTMLElement).style.background = C.bgCardHover;
          if (canAfford) (e.currentTarget as HTMLElement).style.borderLeftColor = C.amberBright;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = C.bgCard;
          if (canAfford) (e.currentTarget as HTMLElement).style.borderLeftColor = C.amber;
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0, width: 28, textAlign: 'center' as const }}>
          {st.icon}
        </div>

        {/* Name + Description */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.textPrimary,
            fontFamily: C.sans,
            marginBottom: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {st.name}
          </div>
          <div style={{
            fontSize: 11,
            color: C.textMuted,
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            +{st.baseWps} w/s per unit
          </div>
          {/* WPS contribution bar */}
          {owned > 0 && pct > 0 && (
            <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                height: 3,
                flex: 1,
                background: C.border,
                borderRadius: 0,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(pct, 100)}%`,
                  background: C.amber,
                  transition: 'width 0.3s',
                }} />
              </div>
              <span style={{
                fontSize: 9,
                color: C.textMuted,
                fontFamily: C.mono,
                flexShrink: 0,
              }}>
                {pct.toFixed(0)}%
              </span>
            </div>
          )}
        </div>

        {/* Cost + Count (right) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: 4 }}>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            fontFamily: C.mono,
            color: canAfford ? C.amber : C.dangerDim,
          }}>
            {formatNumber(cost)} WP
          </span>
          {owned > 0 && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              fontFamily: C.mono,
              color: C.bg,
              background: C.amber,
              padding: '1px 6px',
              borderRadius: 2,
              lineHeight: 1.4,
            }}>
              x{owned}
            </span>
          )}
        </div>
      </div>
    );
  };

  /* ── Upgrade Card ──── */
  const renderUpgrade = (up: UpgradeDef) => {
    const isPurchased = purchasedUpgrades.includes(up.id);
    const prereqMet = !up.requires || purchasedUpgrades.includes(up.requires);
    const canAfford = wp >= up.cost && prereqMet && !isPurchased;
    const requiresName = up.requires
      ? upgrades.find((u) => u.id === up.requires)?.name ?? up.requires
      : '';
    const isFlashing = flashId === up.id;

    const cardStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      background: isFlashing ? 'rgba(212,160,23,0.15)' : C.bgCard,
      borderLeft: isPurchased
        ? `3px solid ${C.green}`
        : canAfford
          ? `3px solid ${C.amber}`
          : '3px solid transparent',
      borderTop: `1px solid ${!prereqMet ? C.danger : C.border}`,
      borderRight: `1px solid ${!prereqMet ? C.danger : C.border}`,
      borderBottom: `1px solid ${!prereqMet ? C.danger : C.border}`,
      cursor: canAfford ? 'pointer' : 'default',
      transition: 'background 0.12s, border-color 0.12s',
      opacity: isPurchased ? 0.5 : !prereqMet ? 0.35 : canAfford ? 1 : 0.55,
      position: 'relative',
      overflow: 'hidden',
    };

    return (
      <div
        key={up.id}
        style={cardStyle}
        onClick={() => {
          if (canAfford) {
            flash(up.id);
            onBuyUpgrade(up.id);
          }
        }}
        onMouseEnter={(e) => {
          if (canAfford) (e.currentTarget as HTMLElement).style.background = C.bgCardHover;
          if (canAfford) (e.currentTarget as HTMLElement).style.borderLeftColor = C.amberBright;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = C.bgCard;
          if (canAfford) (e.currentTarget as HTMLElement).style.borderLeftColor = C.amber;
        }}
      >
        {/* PURCHASED stamp */}
        {isPurchased && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-12deg)',
            fontSize: 14,
            fontWeight: 900,
            fontFamily: C.mono,
            color: C.green,
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            border: `2px solid ${C.green}`,
            padding: '2px 12px',
            pointerEvents: 'none',
            opacity: 0.7,
            whiteSpace: 'nowrap',
          }}>
            PURCHASED
          </div>
        )}

        {/* Icon */}
        <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0, width: 28, textAlign: 'center' as const }}>
          {prereqMet ? up.icon : '\uD83D\uDD12'}
        </div>

        {/* Name + Description */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            color: C.textPrimary,
            fontFamily: C.sans,
            marginBottom: 2,
          }}>
            {up.name}
          </div>
          <div style={{
            fontSize: 11,
            color: C.textMuted,
            lineHeight: 1.3,
            marginBottom: 2,
          }}>
            {up.description}
          </div>
          {!prereqMet && (
            <div style={{
              fontSize: 10,
              color: C.dangerDim,
              fontFamily: C.mono,
              fontWeight: 600,
              marginTop: 2,
            }}>
              {'\uD83D\uDD12'} Requires: {requiresName}
            </div>
          )}
        </div>

        {/* Cost (right) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: 4 }}>
          {!isPurchased && (
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              fontFamily: C.mono,
              color: canAfford ? C.amber : C.dangerDim,
            }}>
              {formatNumber(up.cost)} WP
            </span>
          )}
        </div>
      </div>
    );
  };

  /* ── Prestige Panel ──── */
  const renderPrestige = () => {
    const canPrestige = wp >= prestigeCost;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: '16px 8px',
        alignItems: 'center',
      }}>
        {/* Current Level */}
        <div style={{
          textAlign: 'center',
          padding: '20px 0 12px',
          width: '100%',
        }}>
          <div style={{
            fontSize: 11,
            fontFamily: C.mono,
            color: C.textMuted,
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            marginBottom: 8,
          }}>
            PRESTIGE CLEARANCE
          </div>
          <div style={{
            fontSize: 36,
            fontWeight: 900,
            color: C.amber,
            fontFamily: C.mono,
            lineHeight: 1,
          }}>
            LEVEL {prestigeLevel}
          </div>
          <div style={{
            fontSize: 14,
            color: C.amberBright,
            fontWeight: 700,
            fontFamily: C.mono,
            marginTop: 6,
          }}>
            {prestigeMultiplier.toFixed(2)}x ALL PRODUCTION
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: 1, background: C.border }} />

        {/* Cost Display */}
        <div style={{
          textAlign: 'center',
          padding: '8px 0',
        }}>
          <div style={{
            fontSize: 10,
            fontFamily: C.mono,
            color: C.textMuted,
            letterSpacing: '0.1em',
            marginBottom: 6,
          }}>
            NEXT LEVEL REQUIRES
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 800,
            fontFamily: C.mono,
            color: canPrestige ? C.amber : C.dangerDim,
          }}>
            {formatNumber(prestigeCost)} WP
          </div>
          {!canPrestige && (
            <div style={{
              fontSize: 11,
              fontFamily: C.mono,
              color: C.textMuted,
              marginTop: 4,
            }}>
              ({formatNumber(prestigeCost - wp)} more needed)
            </div>
          )}
          <div style={{
            fontSize: 11,
            fontFamily: C.mono,
            color: C.green,
            marginTop: 6,
          }}>
            Next: {(1 + (prestigeLevel + 1) * 0.25).toFixed(2)}x multiplier
          </div>
        </div>

        {/* ASCEND Button or Confirm */}
        {!showPrestigeConfirm ? (
          <button
            style={{
              width: '100%',
              padding: '14px 0',
              fontSize: 15,
              fontWeight: 900,
              fontFamily: C.mono,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              border: 'none',
              cursor: canPrestige ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
              ...(canPrestige ? {
                background: C.amber,
                color: C.bg,
              } : {
                background: C.border,
                color: C.textDim,
              }),
            }}
            disabled={!canPrestige}
            onClick={() => setShowPrestigeConfirm(true)}
          >
            ASCEND
          </button>
        ) : (
          <div style={{
            width: '100%',
            border: `2px solid ${C.danger}`,
            background: '#1A1214',
            padding: 16,
          }}>
            <div style={{
              fontSize: 13,
              color: C.dangerDim,
              fontWeight: 800,
              fontFamily: C.mono,
              textAlign: 'center',
              letterSpacing: '0.1em',
              marginBottom: 10,
            }}>
              CONFIRM ASCENSION?
            </div>
            <div style={{
              fontSize: 11,
              color: C.textMuted,
              textAlign: 'center',
              lineHeight: 1.6,
              marginBottom: 14,
            }}>
              This action is irreversible. All stations, upgrades, and current WP will be reset.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: 11,
                  fontWeight: 800,
                  fontFamily: C.mono,
                  letterSpacing: '0.1em',
                  border: 'none',
                  cursor: 'pointer',
                  background: C.amber,
                  color: C.bg,
                }}
                onClick={() => { onPrestige(); setShowPrestigeConfirm(false); }}
              >
                CONFIRM
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '10px 0',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: C.mono,
                  letterSpacing: '0.1em',
                  border: `1px solid ${C.borderLight}`,
                  cursor: 'pointer',
                  background: 'transparent',
                  color: C.textMuted,
                }}
                onClick={() => setShowPrestigeConfirm(false)}
              >
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ width: '100%', height: 1, background: C.border }} />

        {/* YOU KEEP */}
        <div style={{
          width: '100%',
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          padding: '12px 14px',
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 800,
            fontFamily: C.mono,
            color: C.green,
            letterSpacing: '0.1em',
            marginBottom: 8,
          }}>
            YOU KEEP:
          </div>
          <div style={{
            fontSize: 11,
            color: C.textMuted,
            lineHeight: 1.8,
            paddingLeft: 8,
            fontFamily: C.mono,
          }}>
            Prestige level + multiplier<br/>
            Total WP (lifetime)<br/>
            Achievements / Trophies<br/>
            Shifts completed
          </div>
        </div>

        {/* YOU LOSE */}
        <div style={{
          width: '100%',
          background: C.bgCard,
          border: `1px solid ${C.danger}`,
          padding: '12px 14px',
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 800,
            fontFamily: C.mono,
            color: C.dangerDim,
            letterSpacing: '0.1em',
            marginBottom: 8,
          }}>
            YOU LOSE:
          </div>
          <div style={{
            fontSize: 11,
            color: C.textMuted,
            lineHeight: 1.8,
            paddingLeft: 8,
            fontFamily: C.mono,
          }}>
            Current WP (set to 0)<br/>
            All stations (reset)<br/>
            All upgrades (reset)
          </div>
        </div>
      </div>
    );
  };

  /* ── Main Render ──── */
  return (
    <div style={s.container}>
      {renderTabs()}

      <div style={s.list}>
        {tab === 'STATIONS' ? (
          unlockedStations.length === 0 ? (
            <div style={s.emptyMsg}>NO STATIONS UNLOCKED</div>
          ) : (
            unlockedStations.map(renderStation)
          )
        ) : tab === 'UPGRADES' ? (
          availableUpgrades.length === 0 ? (
            <div style={s.emptyMsg}>NO UPGRADES AVAILABLE</div>
          ) : (
            availableUpgrades.map(renderUpgrade)
          )
        ) : tab === 'TROPHIES' ? (
          <Achievements unlockedIds={achievements} />
        ) : (
          renderPrestige()
        )}
      </div>
    </div>
  );
};

export default Shop;
