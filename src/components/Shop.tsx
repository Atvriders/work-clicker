// ============================================================
// Work Clicker — Shop ("Late Night at the Office")
// Office supply closet — dark theme
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
    <div style={styles.container} className="desk-card">
      <div style={styles.title}>SUPPLY CLOSET</div>

      {/* Tab Toggle — pill style */}
      <div style={styles.tabRow}>
        {(['STATIONS', 'UPGRADES', 'TROPHIES'] as ShopTab[]).map((t) => (
          <button
            key={t}
            style={{
              ...styles.tab,
              ...(tab === t ? styles.tabActive : {}),
            }}
            onClick={() => setTab(t)}
          >
            {t === 'STATIONS' ? '\uD83C\uDFE2' : t === 'UPGRADES' ? '\u2B06\uFE0F' : '\uD83C\uDFC6'}{' '}
            {t}
          </button>
        ))}
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
              const totalWps = owned > 0 ? +(st.baseWps * owned).toFixed(1) : 0;
              const pct = wpPerSecond > 0 && totalWps > 0 ? ((totalWps / wpPerSecond) * 100).toFixed(0) : null;

              return (
                <div
                  key={st.id}
                  className={`shop-item-card${canAfford ? '' : ' disabled'}`}
                  style={{
                    ...styles.card,
                    ...(canAfford ? styles.cardAffordable : styles.cardDisabled),
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
                    <span style={styles.priceTag} className="tabular-nums">
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
                className={`shop-item-card${canAfford ? '' : ' disabled'}`}
                style={{
                  ...styles.card,
                  ...(!prereqMet
                    ? styles.cardLocked
                    : canAfford
                      ? styles.cardAffordable
                      : styles.cardDisabled),
                }}
                onClick={() => canAfford && onBuyUpgrade(up.id)}
              >
                <div style={styles.cardHeader}>
                  <span style={styles.cardIcon}>{prereqMet ? up.icon : '\uD83D\uDD12'}</span>
                  <span style={styles.cardName}>{up.name}</span>
                </div>
                <div style={styles.cardFlavor}>{up.flavor}</div>
                <div style={styles.cardDesc}>{up.description}</div>
                <div style={styles.cardFooter}>
                  <span style={styles.priceTag} className="tabular-nums">
                    {formatNumber(up.cost)} WP
                  </span>
                  {!prereqMet ? (
                    <span style={styles.reqLabel}>
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
    padding: '14px',
    color: '#E8E6E1',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    background: '#1E1E22',
    borderRadius: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#E8D44D',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    paddingBottom: 10,
    letterSpacing: 2,
  },
  tabRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 12,
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    padding: '8px 0',
    textAlign: 'center' as const,
    fontSize: 10,
    letterSpacing: 0.5,
    cursor: 'pointer',
    border: 'none',
    background: '#3A3A3F',
    color: '#9E9B94',
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 600,
    transition: 'all 0.2s ease',
    borderRadius: 9999,
  },
  tabActive: {
    background: '#E8D44D',
    color: '#1A1A1E',
  },
  list: {
    flex: 1,
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 8,
    minHeight: 0,
  },
  card: {
    border: '1px dotted #3A3A3F',
    borderRadius: 6,
    padding: '10px 12px',
    background: '#2A2A2F',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  cardAffordable: {
    borderLeft: '3px solid #E8D44D',
    borderLeftStyle: 'solid' as const,
    background: '#2A2A2F',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardLocked: {
    opacity: 0.35,
    border: '1px solid #EF5350',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cardIcon: {
    fontSize: 18,
  },
  cardName: {
    flex: 1,
    fontSize: 13,
    fontWeight: 600,
    color: '#E8E6E1',
    fontFamily: "'Nunito', sans-serif",
  },
  cardCount: {
    fontSize: 11,
    color: '#E8D44D',
    fontWeight: 700,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  cardFlavor: {
    fontSize: 11,
    color: '#6B6860',
    lineHeight: 1.4,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  cardDesc: {
    fontSize: 11,
    color: '#9E9B94',
    marginBottom: 4,
    fontWeight: 500,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  priceTag: {
    fontSize: 13,
    color: '#E8D44D',
    fontWeight: 700,
    fontFamily: "'IBM Plex Mono', monospace",
    background: 'rgba(232,212,77,0.1)',
    padding: '2px 8px',
    borderRadius: 3,
    border: '1px solid rgba(232,212,77,0.2)',
  },
  cardEffect: {
    fontSize: 11,
    color: '#66BB6A',
    fontWeight: 600,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  cardPct: {
    fontSize: 10,
    color: '#6B6860',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  buyBtn: {
    background: '#E8D44D',
    border: 'none',
    color: '#1A1A1E',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 10,
    padding: '4px 14px',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 700,
    letterSpacing: 0.5,
    transition: 'all 0.15s ease',
  },
  buyBtnDisabled: {
    background: '#2A2A2F',
    color: '#6B6860',
    border: '1px solid #3A3A3F',
    cursor: 'not-allowed',
  },
  reqLabel: {
    fontSize: 10,
    color: '#EF5350',
    fontWeight: 600,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  emptyMsg: {
    color: '#6B6860',
    fontSize: 13,
    textAlign: 'center' as const,
    padding: '24px 0',
    fontFamily: "'IBM Plex Mono', monospace",
  },
};

export default Shop;
