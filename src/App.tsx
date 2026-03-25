// ============================================================
// Work Clicker — Main App Layout ("Golden Hour Office")
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

/** Returns a CSS background based on shift progress */
function getShiftBackground(shiftStart: number, clockOutTime: number, isOnShift: boolean): string {
  if (!isOnShift) return '#FDFAF5';
  const now = Date.now();
  const total = clockOutTime - shiftStart;
  const elapsed = now - shiftStart;
  const progress = total > 0 ? Math.max(0, Math.min(1, elapsed / total)) : 0;
  const remaining = clockOutTime - now;

  if (remaining < 0) {
    // Overtime: warm red tint
    return 'linear-gradient(180deg, #FFF0EE 0%, #FFEAE5 100%)';
  }
  if (progress < 0.25) {
    // Morning: cool to warm
    return 'linear-gradient(180deg, #F0F4F8 0%, #FDFAF5 100%)';
  }
  if (progress < 0.75) {
    // Midday: warm white
    return '#FDFAF5';
  }
  // Golden hour
  return 'linear-gradient(180deg, #FFF8EE 0%, #FFF3E0 100%)';
}

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

  const storeClick = useGameStore((s) => s.click);
  const storeBuyStation = useGameStore((s) => s.buyStation);
  const storeBuyUpgrade = useGameStore((s) => s.buyUpgrade);
  const storeStartShift = useGameStore((s) => s.startShift);
  const storeSetClockOutTime = useGameStore((s) => s.setClockOutTime);
  const storeAddLogEntry = useGameStore((s) => s.addLogEntry);
  const storeClearEventLog = useGameStore((s) => s.clearEventLog);

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

  const bgStyle = useMemo(
    () => getShiftBackground(shiftStart, clockOutTime, isOnShift),
    [shiftStart, clockOutTime, isOnShift]
  );

  // Mobile layout
  if (isMobile) {
    return (
      <div style={{ ...styles.wrapper, background: bgStyle }}>
        {showWelcome && loginMessage && (
          <div style={styles.welcomeBanner}>{loginMessage}</div>
        )}

        {/* Top: Timer always visible */}
        <div style={{ padding: '4px 8px', flexShrink: 0 }}>
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
              WP: <strong style={styles.statValueAmber} className="tabular-nums">{formatNumber(wp)}</strong>
            </span>
            <span style={styles.statItem}>
              WP/s: <strong style={styles.statValueAmber} className="tabular-nums">{wpPerSecond.toFixed(1)}</strong>
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
              <WorkerAvatar shiftStart={shiftStart} clockOutTime={clockOutTime} isOnShift={isOnShift} />
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
              <EventPopup activeEvent={activeEvent} eventDefs={EVENTS} />
              <EventLog eventLog={eventLog} onAddLogEntry={storeAddLogEntry} onClearLog={storeClearEventLog} />
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
        {showLeaderboard && (
          <Leaderboard currentUsername={username} onClose={() => setShowLeaderboard(false)} />
        )}
        <Chat username={username} isMobile={true} />
      </div>
    );
  }

  // Desktop layout — 2-column
  return (
    <div style={{ ...styles.wrapper, background: bgStyle }}>
      {showWelcome && loginMessage && (
        <div style={styles.welcomeBanner}>{loginMessage}</div>
      )}

      {/* Top Bar — Warm Header */}
      <header style={styles.topBar}>
        <div style={styles.titleBlock}>
          <h1 style={styles.title}>WORK CLICKER</h1>
        </div>
        <div style={styles.statsBlock}>
          <span style={styles.wpDisplay} className="tabular-nums">
            {formatNumber(wp)} <span style={styles.wpLabel}>WP</span>
          </span>
        </div>
        <div style={styles.actionBlock}>
          <span style={styles.usernameLabel}>{username}</span>
          <button style={styles.headerBtn} onClick={() => setShowLeaderboard(true)}>
            LEADERBOARD
          </button>
          <button style={{ ...styles.headerBtn, ...styles.logoutBtn }} onClick={onLogout}>LOG OUT</button>
        </div>
      </header>

      {/* Clock-Out Timer - Full Width */}
      <div style={{ padding: '4px 12px', flexShrink: 0 }}>
        <ClockOutTimer
          shiftStart={shiftStart}
          clockOutTime={clockOutTime}
          isOnShift={isOnShift}
          onClockOutTimeChange={handleClockOutTimeChange}
          onStartShift={handleStartShift}
        />
      </div>

      {/* Main Two-Column Layout */}
      <main style={styles.main}>
        {/* Left Column (55%) — Worker + Work Button + Event + Log */}
        <section style={styles.leftCol}>
          <div style={styles.workerWorkArea}>
            <WorkerAvatar shiftStart={shiftStart} clockOutTime={clockOutTime} isOnShift={isOnShift} />
            <WorkButton wpPerClick={effectiveWpPerClick} onWork={handleWork} />
          </div>
          <EventPopup activeEvent={activeEvent} eventDefs={EVENTS} />
          <div style={styles.logArea}>
            <EventLog eventLog={eventLog} onAddLogEntry={storeAddLogEntry} onClearLog={storeClearEventLog} />
          </div>
        </section>

        {/* Right Column (45%) — Stats + Stations + Shop */}
        <aside style={styles.rightCol}>
          <StatsPanel
            wp={wp} wps={wpPerSecond} wpPerClick={effectiveWpPerClick}
            shiftStart={shiftStart} clockOutTime={clockOutTime}
            shiftsCompleted={shiftsCompleted} overtimeMinutes={overtimeMinutes}
            activeEventName={activeEventName} isOnShift={isOnShift}
          />
          <StationList ownedStations={stations} wpPerSecond={wpPerSecond} />
          <div style={styles.shopArea}>
            <Shop
              wp={wp} totalWp={totalWp} wpPerSecond={wpPerSecond}
              ownedStations={stations} purchasedUpgrades={upgrades}
              onBuyStation={handleBuyStation} onBuyUpgrade={handleBuyUpgrade}
              upgrades={UPGRADES} achievements={achievements}
            />
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        Built with Claude Code
      </footer>

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
    transition: 'background 2s ease',
  },

  // Welcome banner
  welcomeBanner: {
    position: 'fixed',
    top: '56px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#FFFFFF',
    border: '1px solid #E8E2D8',
    color: '#E8900C',
    padding: '10px 28px',
    fontSize: '14px',
    fontFamily: "'Source Sans 3', sans-serif",
    fontWeight: 600,
    letterSpacing: 0.5,
    zIndex: 6000,
    boxShadow: '0 4px 20px rgba(45,42,38,0.1)',
    whiteSpace: 'nowrap',
    borderRadius: 12,
  },

  // Username
  usernameLabel: {
    color: '#7A736A',
    fontSize: '13px',
    fontWeight: 600,
  },

  // Desktop top bar
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    height: 52,
    background: '#FFFFFF',
    borderBottom: '1px solid #E8E2D8',
    zIndex: 10,
    flexShrink: 0,
  },
  titleBlock: { display: 'flex', alignItems: 'center', gap: '8px' },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 900,
    letterSpacing: 3,
    color: '#2D2A26',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  statsBlock: { display: 'flex', gap: '20px', alignItems: 'center' },
  wpDisplay: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#E8900C',
    fontFamily: "'Source Sans 3', sans-serif",
    lineHeight: 1,
  },
  wpLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#B5AFA6',
    letterSpacing: 1,
  },
  statItem: { fontSize: '13px', color: '#7A736A', fontWeight: 500 },
  statValueAmber: { color: '#E8900C', fontSize: '14px', fontWeight: 700 },
  actionBlock: { display: 'flex', gap: '10px', alignItems: 'center' },
  headerBtn: {
    padding: '6px 16px',
    background: 'transparent',
    border: '1px solid #E8E2D8',
    color: '#7A736A',
    fontSize: '10px',
    fontFamily: "'Source Sans 3', sans-serif",
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    borderRadius: 20,
    transition: 'all 0.15s ease',
  },
  logoutBtn: {
    borderColor: 'rgba(196, 90, 60, 0.3)',
    color: '#C45A3C',
  },

  // 2-column layout
  main: { display: 'flex', flex: 1, overflow: 'hidden', gap: 12, padding: '8px 12px' },

  leftCol: {
    flex: '0 0 55%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflow: 'hidden',
  },
  workerWorkArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    padding: '8px 0',
  },
  logArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
  },

  rightCol: {
    flex: '0 0 45%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflow: 'hidden',
  },
  shopArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
  },

  // Footer
  footer: {
    padding: '4px 0',
    textAlign: 'center' as const,
    fontSize: '11px',
    color: '#B5AFA6',
    fontWeight: 400,
    letterSpacing: 0.3,
    flexShrink: 0,
  },

  // Mobile top bar
  topBarMobile: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 10px',
    height: 40,
    background: '#FFFFFF',
    borderBottom: '1px solid #E8E2D8',
    zIndex: 10,
    flexShrink: 0,
  },
  statsBlockMobile: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
  },
  actionBlockMobile: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    gap: '4px',
  },

  // Mobile content
  mobileContent: {
    flex: 1,
    overflowY: 'auto',
    paddingBottom: '60px',
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
