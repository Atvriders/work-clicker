// ============================================================
// Work Clicker — Main App Layout
// ============================================================

import React, { useCallback, useState, useEffect } from 'react';
import { useGameStore } from './stores/useGameStore';
import { useGameLoop } from './hooks/useGameLoop';
import { UPGRADES } from './data/upgrades';
import { EVENTS } from './data/events';
import ClockOutTimer from './components/ClockOutTimer';
import WorkButton from './components/WorkButton';
import StatsPanel from './components/StatsPanel';
import StationList from './components/StationList';
import EventLog from './components/EventLog';
import Shop from './components/Shop';
import EventPopup from './components/EventPopup';
import Login from './components/Login';
import Leaderboard from './components/Leaderboard';
import Chat from './components/Chat';

const MOBILE_BREAKPOINT = 768;
const USERNAME_KEY = 'work-clicker-username';

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
  // ---- Wire everything to the Zustand store ----
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

  const storeClick = useGameStore((s) => s.click);
  const storeBuyStation = useGameStore((s) => s.buyStation);
  const storeBuyUpgrade = useGameStore((s) => s.buyUpgrade);
  const storeStartShift = useGameStore((s) => s.startShift);
  const storeSetClockOutTime = useGameStore((s) => s.setClockOutTime);
  const storeAddLogEntry = useGameStore((s) => s.addLogEntry);

  // Start the game loop (handles ticks, events, achievements, auto-save)
  useGameLoop();

  // Mobile
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<MobileTab>('work');
  const [showWelcome, setShowWelcome] = useState(!!loginMessage);

  // Effective WP per click (including event modifiers for display)
  const effectiveWpPerClick = (() => {
    let eventClickMult = 1;
    if (activeEvent && activeEvent.endTime > Date.now()) {
      if (activeEvent.event.effect.type === 'click_multiplier') {
        eventClickMult = activeEvent.event.effect.value;
      }
    }
    return wpPerClick * clickMultiplier * eventClickMult;
  })();

  // Auto-dismiss welcome
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // ---- Click handler ----
  const handleWork = useCallback(() => {
    storeClick();
  }, [storeClick]);

  // ---- Buy station ----
  const handleBuyStation = useCallback((stationId: string) => {
    storeBuyStation(stationId);
  }, [storeBuyStation]);

  // ---- Buy upgrade ----
  const handleBuyUpgrade = useCallback((upgradeId: string) => {
    storeBuyUpgrade(upgradeId);
  }, [storeBuyUpgrade]);

  // ---- Clock-out time change ----
  const handleClockOutTimeChange = useCallback((hours: number, minutes: number) => {
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    if (d.getTime() < Date.now()) {
      d.setDate(d.getDate() + 1);
    }
    storeSetClockOutTime(d.getTime());
  }, [storeSetClockOutTime]);

  // ---- Start shift ----
  const handleStartShift = useCallback(() => {
    const now = Date.now();
    const clockOut = now + 8 * 60 * 60 * 1000;
    storeStartShift(clockOut);
  }, [storeStartShift]);

  const activeEventName = activeEvent && activeEvent.endTime > Date.now()
    ? activeEvent.event.name
    : null;

  // Mobile layout
  if (isMobile) {
    return (
      <div style={styles.wrapper}>
        {showWelcome && loginMessage && (
          <div style={styles.welcomeBanner}>{loginMessage}</div>
        )}

        {/* Top: Timer always visible */}
        <div style={{ padding: '4px 6px', flexShrink: 0 }}>
          <ClockOutTimer
            shiftStart={shiftStart}
            clockOutTime={clockOutTime}
            isOnShift={isOnShift}
            onClockOutTimeChange={handleClockOutTimeChange}
            onStartShift={handleStartShift}
          />
        </div>

        {/* Header row */}
        <header style={styles.topBarMobile}>
          <div style={styles.statsBlockMobile}>
            <span style={styles.statItem}>
              WP: <strong style={styles.statValue}>{formatNumber(wp)}</strong>
            </span>
            <span style={styles.statItem}>
              WP/s: <strong style={styles.statValue}>{wpPerSecond.toFixed(1)}</strong>
            </span>
          </div>
          <div style={styles.actionBlockMobile}>
            <button style={styles.headerBtn} onClick={() => setShowLeaderboard(true)}>LB</button>
            <button style={{ ...styles.headerBtn, ...styles.logoutBtn }} onClick={onLogout}>OUT</button>
          </div>
        </header>

        {/* Tab Content */}
        <div className="mobile-content" style={styles.mobileContent}>
          {activeTab === 'work' && (
            <section style={styles.mobileSection}>
              <WorkButton wpPerClick={effectiveWpPerClick} onWork={handleWork} />
            </section>
          )}
          {activeTab === 'stats' && (
            <section style={styles.mobileSection}>
              <StatsPanel
                wp={wp} wps={wpPerSecond} wpPerClick={effectiveWpPerClick}
                shiftStart={shiftStart} clockOutTime={clockOutTime}
                shiftsCompleted={shiftsCompleted} overtimeMinutes={overtimeMinutes}
                activeEventName={activeEventName} isOnShift={isOnShift}
              />
              <StationList ownedStations={stations} wpPerSecond={wpPerSecond} />
            </section>
          )}
          {activeTab === 'shop' && (
            <section style={styles.mobileSection}>
              <Shop
                wp={wp} totalWp={totalWp} wpPerSecond={wpPerSecond}
                ownedStations={stations} purchasedUpgrades={upgrades}
                onBuyStation={handleBuyStation} onBuyUpgrade={handleBuyUpgrade}
                upgrades={UPGRADES} achievements={achievements}
              />
            </section>
          )}
          {activeTab === 'log' && (
            <section style={styles.mobileSection}>
              <EventLog eventLog={eventLog} onAddLogEntry={storeAddLogEntry} />
            </section>
          )}
        </div>

        {/* Bottom Tab Bar */}
        <nav className="mobile-tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`mobile-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="mobile-tab-icon">{tab.icon}</span>
              <span className="mobile-tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <EventPopup activeEvent={activeEvent} eventDefs={EVENTS} />
        {showLeaderboard && (
          <Leaderboard currentUsername={username} onClose={() => setShowLeaderboard(false)} />
        )}
        <Chat username={username} isMobile={true} />
      </div>
    );
  }

  // Desktop layout
  return (
    <div style={styles.wrapper}>
      {showWelcome && loginMessage && (
        <div style={styles.welcomeBanner}>{loginMessage}</div>
      )}

      {/* Top Bar */}
      <header style={styles.topBar}>
        <div style={styles.titleBlock}>
          <span style={{ fontSize: 20 }}>{'\uD83D\uDCBC'}</span>
          <h1 style={styles.title}>WORK CLICKER</h1>
        </div>
        <div style={styles.statsBlock}>
          <span style={styles.statItem}>
            WP: <strong style={styles.statValue}>{formatNumber(wp)}</strong>
          </span>
          <span style={styles.statItem}>
            WP/s: <strong style={styles.statValue}>{wpPerSecond.toFixed(1)}</strong>
          </span>
        </div>
        <div style={styles.actionBlock}>
          <span style={styles.usernameLabel}>{username}</span>
          <button style={styles.headerBtn} onClick={() => setShowLeaderboard(true)}>LEADERBOARD</button>
          <button style={{ ...styles.headerBtn, ...styles.logoutBtn }} onClick={onLogout}>LOG OUT</button>
        </div>
      </header>

      {/* Clock-Out Timer - Full Width */}
      <div style={{ padding: '4px 8px', flexShrink: 0 }}>
        <ClockOutTimer
          shiftStart={shiftStart}
          clockOutTime={clockOutTime}
          isOnShift={isOnShift}
          onClockOutTimeChange={handleClockOutTimeChange}
          onStartShift={handleStartShift}
        />
      </div>

      {/* Main Three-Column Layout */}
      <main style={styles.main}>
        {/* Left Column */}
        <aside style={styles.leftCol}>
          <StatsPanel
            wp={wp} wps={wpPerSecond} wpPerClick={effectiveWpPerClick}
            shiftStart={shiftStart} clockOutTime={clockOutTime}
            shiftsCompleted={shiftsCompleted} overtimeMinutes={overtimeMinutes}
            activeEventName={activeEventName} isOnShift={isOnShift}
          />
          <StationList ownedStations={stations} wpPerSecond={wpPerSecond} />
        </aside>

        {/* Center Column */}
        <section style={styles.centerCol}>
          <div style={styles.centerWorkArea}>
            <WorkButton wpPerClick={effectiveWpPerClick} onWork={handleWork} />
          </div>
          <div style={styles.centerLogArea}>
            <EventLog eventLog={eventLog} onAddLogEntry={storeAddLogEntry} />
          </div>
        </section>

        {/* Right Column */}
        <aside style={styles.rightCol}>
          <Shop
            wp={wp} totalWp={totalWp} wpPerSecond={wpPerSecond}
            ownedStations={stations} purchasedUpgrades={upgrades}
            onBuyStation={handleBuyStation} onBuyUpgrade={handleBuyUpgrade}
            upgrades={UPGRADES} achievements={achievements}
          />
        </aside>
      </main>

      {/* Event Popup Overlay */}
      <EventPopup activeEvent={activeEvent} eventDefs={EVENTS} />

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Leaderboard currentUsername={username} onClose={() => setShowLeaderboard(false)} />
      )}

      {/* Chat */}
      <Chat username={username} />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    background: '#0f1923',
  },

  // Welcome banner
  welcomeBanner: {
    position: 'fixed',
    top: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1a2332',
    border: '1px solid #1a73e8',
    color: '#1a73e8',
    padding: '10px 24px',
    fontSize: '13px',
    letterSpacing: '2px',
    zIndex: 6000,
    textShadow: '0 0 6px rgba(26,115,232,0.4)',
    boxShadow: '0 0 20px rgba(26,115,232,0.15)',
    whiteSpace: 'nowrap',
    borderRadius: 6,
  },

  // Username display
  usernameLabel: {
    color: '#fbbc04',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '2px',
  },

  // Desktop top bar
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '6px 16px', background: '#1a2332',
    borderBottom: '1px solid rgba(26,115,232,0.2)', zIndex: 10, flexShrink: 0,
  },
  titleBlock: { display: 'flex', alignItems: 'center', gap: '8px' },
  title: {
    margin: 0, fontSize: '16px', fontWeight: 700, letterSpacing: '3px',
    color: '#1a73e8',
    textShadow: '0 0 8px rgba(26,115,232,0.6)',
  },
  statsBlock: { display: 'flex', gap: '24px', alignItems: 'center' },
  statItem: { fontSize: '12px', color: '#9aa0a6', letterSpacing: '1px' },
  statValue: { color: '#e8eaed', fontSize: '14px', textShadow: '0 0 6px rgba(26,115,232,0.4)' },
  actionBlock: { display: 'flex', gap: '6px', alignItems: 'center' },
  headerBtn: {
    padding: '3px 12px', background: 'rgba(26,115,232,0.1)', border: '1px solid rgba(26,115,232,0.3)',
    color: '#1a73e8', fontSize: '10px', fontFamily: 'system-ui, -apple-system, sans-serif',
    letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 4,
  },
  logoutBtn: { borderColor: 'rgba(234,67,53,0.3)', color: '#ea4335', background: 'rgba(234,67,53,0.05)' },

  // Desktop columns
  main: { display: 'flex', flex: 1, overflow: 'hidden' },
  leftCol: {
    width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column',
    gap: '4px', padding: '4px', overflowY: 'auto', borderRight: '1px solid rgba(26,115,232,0.1)',
  },
  centerCol: {
    flex: 1, display: 'flex', flexDirection: 'column',
    gap: '4px', padding: '4px', overflow: 'hidden',
  },
  centerWorkArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  centerLogArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
  },
  rightCol: {
    width: '340px', flexShrink: 0, display: 'flex', flexDirection: 'column',
    padding: '4px', overflowY: 'auto', borderLeft: '1px solid rgba(26,115,232,0.1)',
  },

  // Mobile top bar
  topBarMobile: {
    position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '4px 10px', background: '#1a2332',
    borderBottom: '1px solid rgba(26,115,232,0.2)', zIndex: 10, flexShrink: 0,
  },
  statsBlockMobile: {
    display: 'flex', justifyContent: 'center', gap: '12px',
  },
  actionBlockMobile: {
    position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
    display: 'flex', gap: '4px',
  },

  // Mobile content
  mobileContent: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '56px',
  },
  mobileSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 8px',
    width: '100%',
  },
};

export default App;
