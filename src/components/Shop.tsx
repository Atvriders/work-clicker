// ============================================================
// Work Clicker — Shop ("Golden Hour Office")
// Editorial cards with amber accents
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
    <div style={styles.container} className="warm-card">
      <div style={styles.title}>Shop</div>

      {/* Tab Toggle — Pill style */}
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
                    <span style={styles.cardCost} className="tabular-nums">
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
                    ? { ...styles.cardDisabled, opacity: 0.35 }
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
                  <span style={styles.cardCost} className="tabular-nums">
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
    color: '#2D2A26',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#2D2A26',
    fontFamily: "'Playfair Display', Georgia, serif",
    paddingBottom: 10,
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
    textAlign: 'center',
    fontSize: 10,
    letterSpacing: 0.5,
    cursor: 'pointer',
    border: '1px solid #E8E2D8',
    background: '#FDFAF5',
    color: '#7A736A',
    fontFamily: "'Source Sans 3', sans-serif",
    fontWeight: 600,
    transition: 'all 0.2s ease',
    borderRadius: 20,
  },
  tabActive: {
    background: '#E8900C',
    color: '#FFFFFF',
    borderColor: '#E8900C',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    minHeight: 0,
  },
  card: {
    border: '1px solid #E8E2D8',
    borderRadius: 10,
    padding: '10px 12px',
    background: '#FFFFFF',
    transition: 'all 0.2s ease',
  },
  cardAffordable: {
    borderLeft: '3px solid #E8900C',
    background: '#FFFDF9',
  },
  cardDisabled: {
    opacity: 0.5,
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
    color: '#2D2A26',
  },
  cardCount: {
    fontSize: 11,
    color: '#E8900C',
    fontWeight: 700,
  },
  cardFlavor: {
    fontSize: 11,
    color: '#B5AFA6',
    lineHeight: 1.4,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  cardDesc: {
    fontSize: 11,
    color: '#7A736A',
    marginBottom: 4,
    fontWeight: 500,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  cardCost: {
    fontSize: 13,
    color: '#E8900C',
    fontWeight: 700,
  },
  cardEffect: {
    fontSize: 11,
    color: '#4A8B5C',
    fontWeight: 600,
  },
  cardPct: {
    fontSize: 10,
    color: '#B5AFA6',
  },
  buyBtn: {
    background: 'linear-gradient(135deg, #E8900C, #D07E08)',
    border: 'none',
    color: '#FFFFFF',
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: 10,
    padding: '4px 14px',
    borderRadius: 16,
    cursor: 'pointer',
    fontWeight: 700,
    letterSpacing: 0.5,
    transition: 'all 0.15s ease',
  },
  buyBtnDisabled: {
    background: '#E8E2D8',
    color: '#B5AFA6',
    cursor: 'not-allowed',
  },
  reqLabel: {
    fontSize: 10,
    color: '#C45A3C',
    fontWeight: 600,
  },
  emptyMsg: {
    color: '#B5AFA6',
    fontSize: 13,
    textAlign: 'center',
    padding: '24px 0',
  },
};

export default Shop;
