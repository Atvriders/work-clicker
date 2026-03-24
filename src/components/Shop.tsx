// ============================================================
// Work Clicker — Shop (Modern Glassmorphism Cards)
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
    <div style={styles.container} className="glass-card">
      <div style={styles.title}>
        {'\uD83D\uDED2'} Shop
      </div>

      {/* Tab Toggle */}
      <div style={styles.tabRow}>
        {(['STATIONS', 'UPGRADES', 'TROPHIES'] as ShopTab[]).map((t, i) => (
          <button
            key={t}
            style={{
              ...styles.tab,
              ...(i === 0 ? styles.tabLeft : i === 2 ? styles.tabRight : {}),
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
                className={`shop-item-card${canAfford ? '' : ' disabled'}`}
                style={{
                  ...styles.card,
                  ...(!prereqMet
                    ? { ...styles.cardDisabled, borderColor: 'rgba(234, 67, 53, 0.15)' }
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
                  <span style={styles.cardCost}>
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
    padding: '12px',
    color: '#e8eaed',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.blue,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 8,
  },
  tabRow: {
    display: 'flex',
    gap: 0,
    marginBottom: 10,
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    padding: '7px 0',
    textAlign: 'center',
    fontSize: 10,
    letterSpacing: 0.5,
    cursor: 'pointer',
    border: '1px solid rgba(26, 115, 232, 0.15)',
    background: 'rgba(255, 255, 255, 0.03)',
    color: '#9aa0a6',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: 'rgba(26, 115, 232, 0.12)',
    color: COLORS.blue,
    borderColor: 'rgba(26, 115, 232, 0.3)',
  },
  tabLeft: {
    borderRadius: '8px 0 0 8px',
  },
  tabRight: {
    borderRadius: '0 8px 8px 0',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minHeight: 0,
  },
  card: {
    border: '1px solid rgba(26, 115, 232, 0.12)',
    borderRadius: 10,
    padding: '8px 10px',
    background: 'rgba(255, 255, 255, 0.03)',
  },
  cardAffordable: {
    borderColor: 'rgba(26, 115, 232, 0.25)',
    background: 'rgba(26, 115, 232, 0.04)',
  },
  cardDisabled: {
    opacity: 0.4,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  cardIcon: {
    fontSize: 16,
  },
  cardName: {
    flex: 1,
    fontSize: 12,
    fontWeight: 600,
    color: '#e8eaed',
  },
  cardCount: {
    fontSize: 11,
    color: COLORS.amber,
    fontWeight: 700,
  },
  cardFlavor: {
    fontSize: 10,
    color: '#9aa0a6',
    opacity: 0.8,
    lineHeight: 1.3,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 10,
    color: 'rgba(26, 115, 232, 0.7)',
    marginBottom: 4,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  cardCost: {
    fontSize: 11,
    color: COLORS.amber,
    fontWeight: 700,
  },
  cardEffect: {
    fontSize: 10,
    color: COLORS.blue,
    fontWeight: 500,
  },
  cardPct: {
    fontSize: 9,
    color: '#9aa0a6',
    opacity: 0.6,
  },
  buyBtn: {
    background: 'linear-gradient(135deg, rgba(26, 115, 232, 0.2), rgba(26, 115, 232, 0.1))',
    border: '1px solid rgba(26, 115, 232, 0.35)',
    color: COLORS.blue,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: 10,
    padding: '3px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 700,
    letterSpacing: 0.5,
    transition: 'all 0.15s ease',
  },
  buyBtnDisabled: {
    background: 'transparent',
    borderColor: 'rgba(26, 115, 232, 0.1)',
    color: 'rgba(26, 115, 232, 0.25)',
    cursor: 'not-allowed',
  },
  reqLabel: {
    fontSize: 9,
    color: COLORS.red,
    fontWeight: 600,
  },
  emptyMsg: {
    color: '#9aa0a6',
    fontSize: 12,
    textAlign: 'center',
    padding: '24px 0',
    opacity: 0.6,
  },
};

export default Shop;
