// ============================================================
// Work Clicker — Shop (Right Sidebar - Compact)
// ============================================================

import React, { useState } from 'react';
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

const COLORS = {
  blue: '#1a73e8',
  green: '#34a853',
  amber: '#fbbc04',
  red: '#ea4335',
  card: '#1a2332',
  border: 'rgba(26,115,232,0.2)',
  text: '#e8eaed',
  muted: '#9aa0a6',
};

type ShopTab = 'STATIONS' | 'UPGRADES' | 'TROPHIES';

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

function getStationCost(station: typeof STATIONS[0], owned: number): number {
  return Math.floor(station.baseCost * Math.pow(station.costMultiplier, owned));
}

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
}) => {
  const [tab, setTab] = useState<ShopTab>('STATIONS');

  const unlockedStations = STATIONS.filter((st) => totalWp >= st.unlockAt);
  const availableUpgrades = upgrades
    .filter((up) => !purchasedUpgrades.includes(up.id))
    .sort((a, b) => a.cost - b.cost);

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        SHOP
        <span style={styles.titleLabel}>// OFFICE SUPPLY</span>
      </div>

      {/* Tab Toggle */}
      <div style={styles.tabRow}>
        <button
          style={{
            ...styles.tab,
            ...styles.tabLeft,
            ...(tab === 'STATIONS' ? styles.tabActive : {}),
          }}
          onClick={() => setTab('STATIONS')}
        >
          STATIONS
        </button>
        <button
          style={{
            ...styles.tab,
            ...(tab === 'UPGRADES' ? styles.tabActive : {}),
          }}
          onClick={() => setTab('UPGRADES')}
        >
          UPGRADES
        </button>
        <button
          style={{
            ...styles.tab,
            ...styles.tabRight,
            ...(tab === 'TROPHIES' ? styles.tabActive : {}),
          }}
          onClick={() => setTab('TROPHIES')}
        >
          TROPHIES
        </button>
      </div>

      {/* List */}
      <div style={styles.list}>
        {tab === 'TROPHIES' ? (
          <Achievements unlockedIds={achievements} />
        ) : tab === 'STATIONS' ? (
          unlockedStations.length === 0 ? (
            <div style={styles.emptyMsg}>No stations unlocked yet</div>
          ) : (
            unlockedStations.map((st) => {
              const owned = ownedStations[st.id] ?? 0;
              const cost = getStationCost(st, owned);
              const canAfford = wp >= cost;

              // WPS percentage for owned stations
              const totalWps = owned > 0 ? +(st.baseWps * owned).toFixed(1) : 0;
              const pct = wpPerSecond > 0 && totalWps > 0 ? ((totalWps / wpPerSecond) * 100).toFixed(0) : null;

              return (
                <div
                  key={st.id}
                  style={{
                    ...styles.card,
                    ...(canAfford
                      ? { borderColor: 'rgba(26,115,232,0.3)' }
                      : styles.cardDisabled),
                  }}
                  onClick={() => canAfford && onBuyStation(st.id)}
                >
                  <div style={styles.cardHeader}>
                    <span style={styles.cardIcon}>{st.icon}</span>
                    <span style={styles.cardName}>{st.name}</span>
                    {owned > 0 && (
                      <span style={styles.cardCount}>x{owned}</span>
                    )}
                    {pct && (
                      <span style={styles.cardPct}>{pct}%</span>
                    )}
                  </div>
                  <div style={styles.cardFlavor}>{st.flavor}</div>
                  <div style={styles.cardFooter}>
                    <span style={styles.cardCost}>
                      {formatNumber(cost)} WP
                    </span>
                    <span style={styles.cardEffect}>
                      +{st.baseWps} w/s
                    </span>
                    <button
                      style={{
                        ...styles.buyBtn,
                        ...(!canAfford ? styles.buyBtnDisabled : {}),
                      }}
                      disabled={!canAfford}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canAfford) onBuyStation(st.id);
                      }}
                    >
                      BUY
                    </button>
                  </div>
                </div>
              );
            })
          )
        ) : availableUpgrades.length === 0 ? (
          <div style={styles.emptyMsg}>No upgrades available</div>
        ) : (
          availableUpgrades.map((up) => {
            const prereqMet = !up.requires || purchasedUpgrades.includes(up.requires);
            const canAfford = wp >= up.cost && prereqMet;
            const requiresName = up.requires
              ? upgrades.find((u) => u.id === up.requires)?.name ?? up.requires
              : '';

            return (
              <div
                key={up.id}
                style={{
                  ...styles.card,
                  ...(!prereqMet
                    ? { ...styles.cardDisabled, borderColor: 'rgba(234,67,53,0.2)' }
                    : canAfford
                      ? { borderColor: 'rgba(26,115,232,0.3)' }
                      : styles.cardDisabled),
                }}
                onClick={() => canAfford && onBuyUpgrade(up.id)}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}>{prereqMet ? up.icon : '\uD83D\uDD12'}</span>
                  <span style={styles.cardName}>{up.name}</span>
                </div>
                <div style={styles.cardFlavor}>{up.flavor}</div>
                <div style={{ fontSize: 10, color: '#5e9cf5', marginBottom: 3 }}>
                  {up.description}
                </div>
                <div style={styles.cardFooter}>
                  <span style={styles.cardCost}>
                    {formatNumber(up.cost)} WP
                  </span>
                  {!prereqMet ? (
                    <span style={{
                      fontSize: 9,
                      color: COLORS.red,
                      fontWeight: 'bold',
                    }}>
                      Req: {requiresName}
                    </span>
                  ) : (
                    <button
                      style={{
                        ...styles.buyBtn,
                        ...(!canAfford ? styles.buyBtnDisabled : {}),
                      }}
                      disabled={!canAfford}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canAfford) onBuyUpgrade(up.id);
                      }}
                    >
                      BUY
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: '8px 8px',
    color: COLORS.text,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  title: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.blue,
    paddingBottom: 4,
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  titleLabel: {
    fontSize: 9,
    color: '#b0b5bc',
    letterSpacing: 1,
    opacity: 0.7,
  },
  tabRow: {
    display: 'flex',
    gap: 0,
    marginBottom: 6,
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    padding: '5px 0',
    textAlign: 'center',
    fontSize: 10,
    letterSpacing: 1,
    cursor: 'pointer',
    border: `1px solid ${COLORS.border}`,
    background: 'transparent',
    color: '#b0b5bc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: 'bold',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: 'rgba(26,115,232,0.1)',
    color: COLORS.blue,
    borderColor: COLORS.blue,
    boxShadow: '0 0 4px rgba(26,115,232,0.2)',
  },
  tabLeft: {
    borderRadius: '3px 0 0 3px',
  },
  tabRight: {
    borderRadius: '0 3px 3px 0',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minHeight: 0,
  },
  card: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: 3,
    padding: '6px 8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  cardDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  cardIcon: {
    fontSize: 14,
  },
  cardName: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardCount: {
    fontSize: 10,
    color: COLORS.amber,
    fontWeight: 'bold',
  },
  cardFlavor: {
    fontSize: 9,
    color: '#b0b5bc',
    opacity: 0.8,
    lineHeight: 1.3,
    marginBottom: 3,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  cardCost: {
    fontSize: 10,
    color: COLORS.amber,
    fontWeight: 'bold',
  },
  cardEffect: {
    fontSize: 10,
    color: COLORS.blue,
  },
  cardPct: {
    fontSize: 9,
    color: '#b0b5bc',
    opacity: 0.7,
  },
  buyBtn: {
    background: 'rgba(26,115,232,0.1)',
    border: `1px solid ${COLORS.blue}`,
    color: COLORS.blue,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: 9,
    padding: '2px 8px',
    borderRadius: 2,
    cursor: 'pointer',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  buyBtnDisabled: {
    background: 'transparent',
    borderColor: 'rgba(26,115,232,0.2)',
    color: 'rgba(26,115,232,0.3)',
    cursor: 'not-allowed',
  },
  emptyMsg: {
    color: '#b0b5bc',
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '16px 0',
  },
};

export default Shop;
