// ============================================================
// Work Clicker — Main App Layout ("Corporate Dystopia Brutalism")
// Bloomberg Terminal meets dystopian cubicle farm
// ============================================================

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useGameStore } from './stores/useGameStore';
import { useGameLoop } from './hooks/useGameLoop';
import { UPGRADES } from './data/upgrades';
import { EVENTS } from './data/events';
import ClockOutTimer from './components/ClockOutTimer';
import WorkButton from './components/WorkButton';
import WorkerAvatar from './components/WorkerAvatar';
import StatsPanel from './components/StatsPanel';
import StationList from './components/StationList';
import EventLog from './components/EventLog';
import Shop from './components/Shop';
import EventPopup from './components/EventPopup';
import ProductivityPulse from './components/ProductivityPulse';
import Login from './components/Login';
import Leaderboard from './components/Leaderboard';
import Chat from './components/Chat';

const MOBILE_BREAKPOINT = 900;
const USERNAME_KEY = 'work-clicker-username';
const TOPBAR_HEIGHT = 56;

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}

type MobileTab = 'work' | 'stats' | 'shop' | 'log';

const TABS: { key: MobileTab; icon: string; label: string }[] = [
  { key: 'work', icon: '\uD83D\uDCBC', label: 'Work' },
  { key: 'stats', icon: '\uD83D\uDCCA', label: 'Stats' },
  { key: 'shop', icon: '\uD83D\uDED2', label: 'Shop' },
  { key: 'log', icon: '\uD83D\uDCDC', label: 'Log' },
];

// ── Brutalist panel wrapper ─────────────────────────────────
const Panel: React.FC<{
  title?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ title, children, style }) => (
  <div style={{ ...sty.panel, ...style }}>
    {title && <div style={sty.panelHeader}>{title}</div>}
    <div style={{ padding: 0 }}>{children}</div>
  </div>
);

const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState<string | null>(() => localStorage.getItem(USERNAME_KEY));
  const [loginMessage, setLoginMessage] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  if (loggedIn) {
    return <GameApp
      username={loggedIn}
      loginMessage={loginMessage}
      showLeaderboard={showLeaderboard}
      setShowLeaderboard={setShowLeaderboard}
      onLogout={() => {
        localStorage.removeItem(USERNAME_KEY);
        localStorage.removeItem('work-clicker-save');
        useGameStore.getState().reset();
        setLoggedIn(null);
        setLoginMessage('');
      }}
    />;
  }

  return (
    <Login onLogin={(name, isNew) => {
      setLoggedIn(name);
      setLoginMessage(isNew ? `Welcome aboard, ${name}!` : `Welcome back, ${name}!`);
    }} />
  );
};

interface GameAppProps {
  username: string;
  loginMessage: string;
  showLeaderboard: boolean;
  setShowLeaderboard: (show: boolean) => void;
  onLogout: () => void;
}

const GameApp: React.FC<GameAppProps> = ({ username, loginMessage, showLeaderboard, setShowLeaderboard, onLogout }) => {
  const wp = useGameStore((s) => s.wp);
  const totalWp = useGameStore((s) => s.totalWp);
  const stations = useGameStore((s) => s.stations);
  const upgrades = useGameStore((s) => s.upgrades);
  const achievements = useGameStore((s) => s.achievements);
  const eventLog = useGameStore((s) => s.eventLog);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const shiftStart = useGameStore((s) => s.shiftStart);
  const clockOutTime = useGameStore((s) => s.clockOutTime);
  const isOnShift = useGameStore((s) => s.isOnShift);
  const shiftsCompleted = useGameStore((s) => s.shiftsCompleted);
  const overtimeMinutes = useGameStore((s) => s.overtimeMinutes);
  const wpPerClick = useGameStore((s) => s.wpPerClick);
  const wpPerSecond = useGameStore((s) => s.wpPerSecond);
  const clickMultiplier = useGameStore((s) => s.clickMultiplier);
  const totalClicks = useGameStore((s) => s.totalClicks);
  const startTime = useGameStore((s) => s.startTime);

  const prestigeLevel = useGameStore((s) => s.prestigeLevel);
  const prestigeMultiplier = useGameStore((s) => s.prestigeMultiplier);

  const storeClick = useGameStore((s) => s.click);
  const storeBuyStation = useGameStore((s) => s.buyStation);
  const storeBuyUpgrade = useGameStore((s) => s.buyUpgrade);
  const storeStartShift = useGameStore((s) => s.startShift);
  const storeSetClockOutTime = useGameStore((s) => s.setClockOutTime);
  const storeAddLogEntry = useGameStore((s) => s.addLogEntry);
  const storeClearEventLog = useGameStore((s) => s.clearEventLog);
  const storePrestige = useGameStore((s) => s.prestige);
  const storeGetPrestigeCost = useGameStore((s) => s.getPrestigeCost);

  useGameLoop();

  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<MobileTab>('work');
  const [showWelcome, setShowWelcome] = useState(!!loginMessage);

  const effectiveWpPerClick = (() => {
    let eventClickMult = 1;
    if (activeEvent && activeEvent.endTime > Date.now()) {
      if (activeEvent.event.effect.type === 'click_multiplier') {
        eventClickMult = activeEvent.event.effect.value;
      }
    }
    return wpPerClick * clickMultiplier * eventClickMult;
  })();

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  const handleWork = useCallback(() => {
    storeClick();
  }, [storeClick]);

  const handleBuyStation = useCallback((stationId: string) => {
    storeBuyStation(stationId);
  }, [storeBuyStation]);

  const handleBuyUpgrade = useCallback((upgradeId: string) => {
    storeBuyUpgrade(upgradeId);
  }, [storeBuyUpgrade]);

  const handleClockOutTimeChange = useCallback((hours: number, minutes: number) => {
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    if (d.getTime() < Date.now()) {
      d.setDate(d.getDate() + 1);
    }
    storeSetClockOutTime(d.getTime());
  }, [storeSetClockOutTime]);

  const handleStartShift = useCallback(() => {
    const now = Date.now();
    const clockOut = now + 8 * 60 * 60 * 1000;
    storeStartShift(clockOut);
  }, [storeStartShift]);

  const activeEventName = activeEvent && activeEvent.endTime > Date.now()
    ? activeEvent.event.name
    : null;

  // Shift progress percentage (0-100)
  const shiftProgress = useMemo(() => {
    if (!isOnShift || !shiftStart || !clockOutTime) return 0;
    const total = clockOutTime - shiftStart;
    if (total <= 0) return 0;
    const elapsed = Date.now() - shiftStart;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }, [isOnShift, shiftStart, clockOutTime]);

  // ── MOBILE LAYOUT ─────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={sty.wrapper}>
        {showWelcome && loginMessage && (
          <div style={sty.welcomeBanner}>{loginMessage}</div>
        )}

        {/* Heartbeat line */}
        <div style={sty.heartbeatLine} />

        {/* Compact mobile top bar: WP + WP/s */}
        <header style={sty.topBarMobile}>
          <div style={sty.mobileWpBlock}>
            <span style={sty.mobileWpValue} className="tabular-nums">{formatNumber(wp)}</span>
            <span style={sty.mobileWpUnit}>WP</span>
          </div>
          <div style={sty.mobileRateBlock}>
            <span style={sty.mobileRate} className="tabular-nums">{wpPerSecond.toFixed(1)}/s</span>
          </div>
          <div style={sty.mobileActions}>
            <button style={sty.iconBtn} onClick={() => setShowLeaderboard(true)} title="Leaderboard">LB</button>
            <button style={{ ...sty.iconBtn, color: '#EF5350', borderColor: 'rgba(239,83,80,0.4)' }} onClick={onLogout} title="Log Out">X</button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="mobile-content" style={sty.mobileContent}>
          {activeTab === 'work' && (
            <section style={sty.mobileSection}>
              <ClockOutTimer
                shiftStart={shiftStart}
                clockOutTime={clockOutTime}
                isOnShift={isOnShift}
                onClockOutTimeChange={handleClockOutTimeChange}
                onStartShift={handleStartShift}
              />
              <WorkerAvatar shiftStart={shiftStart} clockOutTime={clockOutTime} isOnShift={isOnShift} />
              <WorkButton wpPerClick={effectiveWpPerClick} onWork={handleWork} isOnShift={isOnShift} clockOutTime={clockOutTime} />
            </section>
          )}
          {activeTab === 'stats' && (
            <section style={sty.mobileSection}>
              <StatsPanel
                wp={wp} wps={wpPerSecond} wpPerClick={effectiveWpPerClick}
                shiftStart={shiftStart} clockOutTime={clockOutTime}
                shiftsCompleted={shiftsCompleted} overtimeMinutes={overtimeMinutes}
                activeEventName={activeEventName} activeEvent={activeEvent}
                isOnShift={isOnShift}
                prestigeLevel={prestigeLevel} prestigeMultiplier={prestigeMultiplier}
              />
              <StationList ownedStations={stations} wpPerSecond={wpPerSecond} />
            </section>
          )}
          {activeTab === 'shop' && (
            <section style={sty.mobileSection}>
              <Shop
                wp={wp} totalWp={totalWp} wpPerSecond={wpPerSecond}
                ownedStations={stations} purchasedUpgrades={upgrades}
                onBuyStation={handleBuyStation} onBuyUpgrade={handleBuyUpgrade}
                upgrades={UPGRADES} achievements={achievements}
                prestigeLevel={prestigeLevel} prestigeMultiplier={prestigeMultiplier}
                prestigeCost={storeGetPrestigeCost()} onPrestige={storePrestige}
              />
            </section>
          )}
          {activeTab === 'log' && (
            <section style={sty.mobileSection}>
              <EventPopup activeEvent={activeEvent} eventDefs={EVENTS} />
              <ProductivityPulse
                wp={wp}
                totalWp={totalWp}
                wpPerSecond={wpPerSecond}
                wpPerClick={effectiveWpPerClick}
                shiftsCompleted={shiftsCompleted}
                overtimeMinutes={overtimeMinutes}
                isOnShift={isOnShift}
                prestigeLevel={prestigeLevel}
                totalClicks={totalClicks}
                stations={stations}
                upgrades={upgrades}
                achievements={achievements}
                startTime={startTime}
              />
              <EventLog eventLog={eventLog} onAddLogEntry={storeAddLogEntry} onClearLog={storeClearEventLog} />
            </section>
          )}
        </div>

        {/* Bottom Tab Bar — pill buttons */}
        <nav style={sty.mobileTabBar}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              style={{
                ...sty.mobileTabBtn,
                ...(activeTab === tab.key ? sty.mobileTabBtnActive : {}),
              }}
              onClick={() => setActiveTab(tab.key)}
            >
              <span style={{ fontSize: 16, lineHeight: '1' }}>{tab.icon}</span>
              <span style={sty.mobileTabLabel}>{tab.label}</span>
            </button>
          ))}
        </nav>

        {showLeaderboard && (
          <Leaderboard currentUsername={username} onClose={() => setShowLeaderboard(false)} />
        )}
        <Chat username={username} isMobile={true} />
      </div>
    );
  }

  // ── DESKTOP LAYOUT ────────────────────────────────────────
  return (
    <div style={sty.wrapper}>
      {showWelcome && loginMessage && (
        <div style={sty.welcomeBanner}>{loginMessage}</div>
      )}

      {/* Heartbeat line — 2px amber/green gradient */}
      <div style={sty.heartbeatLine} />

      {/* ── TOP BAR (fixed, z-100) ───────────────────────── */}
      <header style={sty.topBar}>
        {/* Left sector: brand + prestige badge */}
        <div style={sty.topBarLeft}>
          <span style={sty.brandMark}>{'\u258C'}</span>
          <h1 style={sty.brandTitle}>WORK CLICKER</h1>
          {prestigeLevel > 0 && (
            <span style={sty.prestigeBadge}>P{prestigeLevel}</span>
          )}
        </div>

        {/* Center sector: WP counter + thin shift progress bar */}
        <div style={sty.topBarCenter}>
          <div style={sty.wpRow}>
            <span style={sty.wpBlocks}>{'\u2588\u2588'}</span>
            <span style={sty.wpValue} className="tabular-nums">{formatNumber(wp)}</span>
            <span style={sty.wpUnit}>WP</span>
          </div>
          {/* Shift progress bar */}
          <div style={sty.shiftTrack}>
            <div style={{ ...sty.shiftFill, width: `${shiftProgress}%` }} />
          </div>
        </div>

        {/* Right sector: rate + user icon + logout */}
        <div style={sty.topBarRight}>
          <div style={sty.rateChip}>
            <span style={{ fontSize: 12 }}>{'\u26A1'}</span>
            <span style={sty.rateVal} className="tabular-nums">{wpPerSecond.toFixed(1)}/s</span>
          </div>
          <button style={sty.iconBtn} onClick={() => setShowLeaderboard(true)} title="Leaderboard">
            {'\uD83D\uDC64'}
          </button>
          <button
            style={{ ...sty.iconBtn, color: '#EF5350', borderColor: 'rgba(239,83,80,0.3)' }}
            onClick={onLogout}
            title="Log Out"
          >
            LOG OUT
          </button>
        </div>
      </header>

      {/* ── 3-COLUMN MAIN AREA ───────────────────────────── */}
      <main style={sty.main}>

        {/* LEFT COLUMN (300px) — Timer, Stats, Stations */}
        <div style={sty.leftCol}>
          <Panel title="SHIFT TIMER">
            <ClockOutTimer
              shiftStart={shiftStart}
              clockOutTime={clockOutTime}
              isOnShift={isOnShift}
              onClockOutTimeChange={handleClockOutTimeChange}
              onStartShift={handleStartShift}
            />
          </Panel>

          <Panel title="METRICS" style={{ flexShrink: 0 }}>
            <StatsPanel
              wp={wp} wps={wpPerSecond} wpPerClick={effectiveWpPerClick}
              shiftStart={shiftStart} clockOutTime={clockOutTime}
              shiftsCompleted={shiftsCompleted} overtimeMinutes={overtimeMinutes}
              activeEventName={activeEventName} activeEvent={activeEvent}
              isOnShift={isOnShift}
              prestigeLevel={prestigeLevel} prestigeMultiplier={prestigeMultiplier}
            />
          </Panel>

          <Panel title="STATIONS" style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            <StationList ownedStations={stations} wpPerSecond={wpPerSecond} />
          </Panel>
        </div>

        {/* CENTER COLUMN (flex-1) — Work Zone, Event, Work Log */}
        <div style={sty.centerCol}>
          <Panel title="WORK ZONE" style={{ flexShrink: 0 }}>
            <div style={sty.workZoneInner}>
              <WorkerAvatar shiftStart={shiftStart} clockOutTime={clockOutTime} isOnShift={isOnShift} />
              <WorkButton wpPerClick={effectiveWpPerClick} onWork={handleWork} isOnShift={isOnShift} clockOutTime={clockOutTime} />
            </div>
          </Panel>

          <EventPopup activeEvent={activeEvent} eventDefs={EVENTS} />

          <Panel title="PRODUCTIVITY PULSE" style={{ flex: 3, overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <ProductivityPulse
              wp={wp}
              totalWp={totalWp}
              wpPerSecond={wpPerSecond}
              wpPerClick={effectiveWpPerClick}
              shiftsCompleted={shiftsCompleted}
              overtimeMinutes={overtimeMinutes}
              isOnShift={isOnShift}
              prestigeLevel={prestigeLevel}
              totalClicks={totalClicks}
              stations={stations}
              upgrades={upgrades}
              achievements={achievements}
              startTime={startTime}
            />
          </Panel>

          <Panel title="WORK LOG" style={{ flex: 1, overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
              <EventLog eventLog={eventLog} onAddLogEntry={storeAddLogEntry} onClearLog={storeClearEventLog} />
            </div>
          </Panel>
        </div>

        {/* RIGHT COLUMN (340px) — Shop / Requisitions */}
        <div style={sty.rightCol}>
          <Panel title="REQUISITIONS" style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            <Shop
              wp={wp} totalWp={totalWp} wpPerSecond={wpPerSecond}
              ownedStations={stations} purchasedUpgrades={upgrades}
              onBuyStation={handleBuyStation} onBuyUpgrade={handleBuyUpgrade}
              upgrades={UPGRADES} achievements={achievements}
              prestigeLevel={prestigeLevel} prestigeMultiplier={prestigeMultiplier}
              prestigeCost={storeGetPrestigeCost()} onPrestige={storePrestige}
            />
          </Panel>
        </div>
      </main>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Leaderboard currentUsername={username} onClose={() => setShowLeaderboard(false)} />
      )}

      {/* Chat */}
      <Chat username={username} />
    </div>
  );
};

// ════════════════════════════════════════════════════════════════
// STYLE CONSTANTS — Corporate Dystopia Brutalism
// ════════════════════════════════════════════════════════════════
const MONO = "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace";
const AMBER = '#E8D44D';
const TERM_GREEN = '#66BB6A';
const BG_PRI = '#0D0D0F';
const BG_SEC = '#141418';
const BG_PANEL = '#18181D';
const BORDER = '#2A2A30';

const sty: Record<string, React.CSSProperties> = {
  // ── Shell ──────────────────────────────────────────────────
  wrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: BG_PRI,
  },

  heartbeatLine: {
    height: 2,
    flexShrink: 0,
    background: `linear-gradient(90deg, ${AMBER} 0%, ${TERM_GREEN} 50%, ${AMBER} 100%)`,
    opacity: 0.7,
  },

  welcomeBanner: {
    position: 'fixed',
    top: TOPBAR_HEIGHT + 14,
    left: '50%',
    transform: 'translateX(-50%)',
    background: BG_PANEL,
    border: `1px solid ${AMBER}`,
    color: AMBER,
    padding: '10px 28px',
    fontSize: '13px',
    fontFamily: MONO,
    fontWeight: 600,
    letterSpacing: 0.5,
    zIndex: 6000,
    boxShadow: `0 4px 24px rgba(0,0,0,0.6), 0 0 12px rgba(232,212,77,0.08)`,
    whiteSpace: 'nowrap',
    borderRadius: 0,
  },

  // ── Panel (shared brutalist card) ──────────────────────────
  panel: {
    background: BG_PANEL,
    border: `1px solid ${BORDER}`,
    borderRadius: 0,
  },
  panelHeader: {
    fontSize: 11,
    fontFamily: MONO,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: '#6B6860',
    padding: '6px 10px',
    borderBottom: `1px solid ${BORDER}`,
    background: 'rgba(255,255,255,0.015)',
    userSelect: 'none' as const,
  },

  // ════════════════════════════════════════════════════════════
  // DESKTOP TOP BAR — fixed, z-100
  // ════════════════════════════════════════════════════════════
  topBar: {
    position: 'fixed',
    top: 2,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: TOPBAR_HEIGHT,
    padding: '0 16px',
    background: BG_SEC,
    borderBottom: `1px solid ${BORDER}`,
    zIndex: 100,
    flexShrink: 0,
    gap: 12,
  },

  // Left: brand
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  brandMark: {
    color: AMBER,
    fontSize: 22,
    lineHeight: '1',
    fontFamily: MONO,
  },
  brandTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '0.15em',
    color: AMBER,
    fontFamily: MONO,
    textTransform: 'uppercase' as const,
    lineHeight: '1',
  },
  prestigeBadge: {
    display: 'inline-block',
    background: AMBER,
    color: BG_PRI,
    fontSize: 10,
    fontWeight: 700,
    fontFamily: MONO,
    padding: '2px 6px',
    borderRadius: 0,
    letterSpacing: '0.05em',
    lineHeight: '1.2',
    marginLeft: 4,
  },

  // Center: WP counter + progress
  topBarCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    flex: '0 1 auto',
    minWidth: 180,
  },
  wpRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  wpBlocks: {
    color: AMBER,
    fontSize: 12,
    fontFamily: MONO,
    opacity: 0.5,
    lineHeight: '1',
  },
  wpValue: {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: MONO,
    color: AMBER,
    lineHeight: '1',
    textShadow: '0 0 10px rgba(232,212,77,0.25)',
    fontVariantNumeric: 'tabular-nums',
  },
  wpUnit: {
    fontSize: 11,
    fontWeight: 600,
    fontFamily: MONO,
    color: '#6B6860',
    letterSpacing: '0.1em',
    lineHeight: '1',
  },
  shiftTrack: {
    width: '100%',
    maxWidth: 160,
    height: 3,
    background: '#2A2A30',
    borderRadius: 0,
    overflow: 'hidden',
  },
  shiftFill: {
    height: '100%',
    background: `linear-gradient(90deg, ${AMBER}, ${TERM_GREEN})`,
    transition: 'width 1s linear',
  },

  // Right: rate + buttons
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  rateChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  rateVal: {
    fontSize: 14,
    fontWeight: 700,
    fontFamily: MONO,
    color: TERM_GREEN,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: '1',
  },
  iconBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5px 10px',
    background: 'transparent',
    border: `1px solid ${BORDER}`,
    color: '#9E9B94',
    fontSize: 10,
    fontFamily: MONO,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    borderRadius: 0,
    transition: 'all 0.12s ease',
    lineHeight: '1',
  },

  // ════════════════════════════════════════════════════════════
  // 3-COLUMN MAIN
  // ════════════════════════════════════════════════════════════
  main: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    marginTop: TOPBAR_HEIGHT + 2,
    height: `calc(100vh - ${TOPBAR_HEIGHT + 2}px)`,
    position: 'relative',
    zIndex: 1,
    minHeight: 0,
  },

  leftCol: {
    width: 300,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflowY: 'auto',
    minHeight: 0,
  },

  centerCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflow: 'hidden',
    minHeight: 0,
  },

  rightCol: {
    width: 340,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    minHeight: 0,
  },

  workZoneInner: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: '8px 16px',
  },

  // ════════════════════════════════════════════════════════════
  // MOBILE
  // ════════════════════════════════════════════════════════════
  topBarMobile: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 10px',
    height: 44,
    background: BG_SEC,
    borderBottom: `1px solid ${BORDER}`,
    zIndex: 10,
    flexShrink: 0,
  },
  mobileWpBlock: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  mobileWpValue: {
    fontSize: 18,
    fontWeight: 700,
    fontFamily: MONO,
    color: AMBER,
    fontVariantNumeric: 'tabular-nums',
  },
  mobileWpUnit: {
    fontSize: 10,
    fontWeight: 600,
    fontFamily: MONO,
    color: '#6B6860',
    letterSpacing: '0.1em',
  },
  mobileRateBlock: {
    display: 'flex',
    alignItems: 'center',
  },
  mobileRate: {
    fontSize: 13,
    fontWeight: 700,
    fontFamily: MONO,
    color: TERM_GREEN,
    fontVariantNumeric: 'tabular-nums',
  },
  mobileActions: {
    display: 'flex',
    gap: 4,
  },

  mobileContent: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: 68,
    position: 'relative',
    zIndex: 1,
  },
  mobileSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '10px 8px',
    width: '100%',
  },

  // Bottom tab bar — pill buttons
  mobileTabBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 58,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    background: BG_SEC,
    borderTop: `1px solid ${BORDER}`,
    zIndex: 1000,
    padding: '0 12px',
    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  },
  mobileTabBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flex: 1,
    height: 40,
    background: 'rgba(255,255,255,0.03)',
    border: `1px solid ${BORDER}`,
    borderRadius: 20,
    color: '#6B6860',
    fontFamily: MONO,
    fontSize: 10,
    cursor: 'pointer',
    padding: '4px 0',
    transition: 'all 0.15s ease',
  },
  mobileTabBtnActive: {
    background: 'rgba(232,212,77,0.1)',
    borderColor: AMBER,
    color: AMBER,
  },
  mobileTabLabel: {
    fontSize: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    fontWeight: 600,
    fontFamily: MONO,
  },
};

export default App;
