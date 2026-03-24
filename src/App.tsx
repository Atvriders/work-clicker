// ============================================================
// Work Clicker — Main App Layout
// ============================================================

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { STATIONS } from './data/stations';
import { EventLogEntry, ActiveEvent, RandomEvent } from './types';
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

// ---- Upgrade definitions ----
const UPGRADES = [
  { id: 'ergo_keyboard', name: 'Ergonomic Keyboard', description: '+1 WP per click', flavor: 'Your wrists thank you. Your wallet does not.', cost: 50, icon: '\u2328\uFE0F', tier: 1 },
  { id: 'second_monitor', name: 'Second Monitor', description: '+2 WP per click', flavor: 'One for Slack, one for work. Guess which gets used more.', cost: 250, icon: '\uD83D\uDCFA', tier: 1 },
  { id: 'noise_cancelling', name: 'Noise-Cancelling Headphones', description: '2x click multiplier', flavor: 'You can no longer hear your coworkers. Bliss.', cost: 1000, icon: '\uD83C\uDFA7', tier: 2 },
  { id: 'standing_mat', name: 'Anti-Fatigue Mat', description: '1.5x WPS multiplier', flavor: 'Standing desk users swear by it. Sitting desk users swear at it.', cost: 5000, icon: '\uD83E\uDDF1', requires: 'ergo_keyboard', tier: 2 },
  { id: 'coffee_subscription', name: 'Premium Coffee Subscription', description: '2x WPS multiplier', flavor: 'Single-origin, ethically sourced, obnoxiously expensive.', cost: 25000, icon: '\u2615', tier: 3 },
  { id: 'productivity_app', name: 'Productivity App Suite', description: '+5 WP per click', flavor: 'You now have 12 apps to manage your 3 tasks.', cost: 100000, icon: '\uD83D\uDCF1', requires: 'noise_cancelling', tier: 3 },
  { id: 'corner_office', name: 'Corner Office Upgrade', description: '3x click multiplier', flavor: 'The view is nice. The expectations are not.', cost: 500000, icon: '\uD83C\uDFE2', requires: 'coffee_subscription', tier: 4 },
  { id: 'ai_copilot', name: 'AI Copilot', description: '5x WPS multiplier', flavor: 'It writes your code and your emails. Soon it will write your resignation.', cost: 2500000, icon: '\uD83E\uDD16', requires: 'productivity_app', tier: 4 },
  { id: 'golden_stapler', name: 'Golden Stapler', description: '+10 WP per click', flavor: 'Believe it or not, this is a status symbol.', cost: 10000000, icon: '\uD83D\uDCCE', tier: 5 },
  { id: 'executive_parking', name: 'Executive Parking Spot', description: '10x click multiplier', flavor: 'Right next to the building. Power move.', cost: 50000000, icon: '\uD83C\uDD7F\uFE0F', requires: 'corner_office', tier: 5 },
];

// ---- Random event definitions ----
const RANDOM_EVENTS: RandomEvent[] = [
  { id: 'coffee_rush', name: 'Coffee Rush', description: 'Someone made fresh coffee! 2x WPS for 30s.', icon: '\u2615', effect: { type: 'wps_multiplier', value: 2 }, duration: 30000, weight: 3, minWps: 0, isPositive: true },
  { id: 'server_down', name: 'Server Outage', description: 'Servers are down. No passive WP for 20s!', icon: '\uD83D\uDCA5', effect: { type: 'no_passive', value: 0 }, duration: 20000, weight: 2, minWps: 1, isPositive: false },
  { id: 'boss_away', name: 'Boss Is Away', description: 'The boss left early! 3x click multiplier for 25s.', icon: '\uD83D\uDE0E', effect: { type: 'click_multiplier', value: 3 }, duration: 25000, weight: 2, minWps: 5, isPositive: true },
  { id: 'free_lunch', name: 'Free Lunch', description: 'Catered lunch! Bonus 500 WP.', icon: '\uD83C\uDF55', effect: { type: 'bonus_wp', value: 500 }, duration: 5000, weight: 2, minWps: 10, isPositive: true },
  { id: 'mandatory_training', name: 'Mandatory Training', description: 'HR training video. 0.5x WPS for 30s.', icon: '\uD83D\uDCBC', effect: { type: 'wps_multiplier', value: 0.5 }, duration: 30000, weight: 2, minWps: 5, isPositive: false },
  { id: 'hackathon', name: 'Hackathon', description: 'Company hackathon! 5x click multiplier for 20s.', icon: '\uD83D\uDE80', effect: { type: 'click_multiplier', value: 5 }, duration: 20000, weight: 1, minWps: 50, isPositive: true },
  { id: 'fire_drill', name: 'Fire Drill', description: 'Evacuation! No WP generation for 15s.', icon: '\uD83D\uDE92', effect: { type: 'no_passive', value: 0 }, duration: 15000, weight: 1, minWps: 20, isPositive: false },
  { id: 'bonus_season', name: 'Bonus Season', description: 'Annual bonus dropped! +2000 WP.', icon: '\uD83D\uDCB0', effect: { type: 'bonus_wp', value: 2000 }, duration: 5000, weight: 1, minWps: 100, isPositive: true },
  { id: 'internet_down', name: 'Internet Outage', description: 'WiFi died. 0.25x WPS for 25s.', icon: '\uD83D\uDCF6', effect: { type: 'wps_multiplier', value: 0.25 }, duration: 25000, weight: 1, minWps: 30, isPositive: false },
  { id: 'team_morale', name: 'Team Morale Boost', description: 'Pizza party! 4x WPS for 15s.', icon: '\uD83C\uDF89', effect: { type: 'wps_multiplier', value: 4 }, duration: 15000, weight: 1, minWps: 200, isPositive: true },
];

// ---- Helper: getStationCost ----
function getStationCost(station: typeof STATIONS[0], owned: number): number {
  return Math.floor(station.baseCost * Math.pow(station.costMultiplier, owned));
}

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

// ---- Default clock-out: 8 hours from now ----
function getDefaultClockOut(): number {
  return Date.now() + 8 * 60 * 60 * 1000;
}

let logIdCounter = 0;

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
  // ---- Core game state ----
  const [wp, setWp] = useState(0);
  const [totalWp, setTotalWp] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [stations, setStations] = useState<Record<string, number>>({});
  const [purchasedUpgrades, setPurchasedUpgrades] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [activeEvent, setActiveEvent] = useState<ActiveEvent | null>(null);
  const [shiftStart, setShiftStart] = useState(Date.now());
  const [clockOutTime, setClockOutTime] = useState(getDefaultClockOut());
  const [isOnShift, setIsOnShift] = useState(false);
  const [shiftsCompleted, setShiftsCompleted] = useState(0);
  const [overtimeMinutes, setOvertimeMinutes] = useState(0);

  // Mobile
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<MobileTab>('work');
  const [showWelcome, setShowWelcome] = useState(!!loginMessage);

  // Refs for game loop
  const wpRef = useRef(wp);
  wpRef.current = wp;
  const stationsRef = useRef(stations);
  stationsRef.current = stations;
  const upgradesRef = useRef(purchasedUpgrades);
  upgradesRef.current = purchasedUpgrades;
  const activeEventRef = useRef(activeEvent);
  activeEventRef.current = activeEvent;

  // Computed values
  const baseClickWp = 1
    + (purchasedUpgrades.includes('ergo_keyboard') ? 1 : 0)
    + (purchasedUpgrades.includes('second_monitor') ? 2 : 0)
    + (purchasedUpgrades.includes('productivity_app') ? 5 : 0)
    + (purchasedUpgrades.includes('golden_stapler') ? 10 : 0);

  const clickMultiplier = 1
    * (purchasedUpgrades.includes('noise_cancelling') ? 2 : 1)
    * (purchasedUpgrades.includes('corner_office') ? 3 : 1)
    * (purchasedUpgrades.includes('executive_parking') ? 10 : 1);

  let eventClickMult = 1;
  if (activeEvent && activeEvent.event.effect.type === 'click_multiplier' && activeEvent.endTime > Date.now()) {
    eventClickMult = activeEvent.event.effect.value;
  }

  const wpPerClick = baseClickWp * clickMultiplier * eventClickMult;

  // WPS calculation
  const baseWps = STATIONS.reduce((sum, st) => {
    const count = stations[st.id] ?? 0;
    return sum + st.baseWps * count;
  }, 0);

  const wpsMultiplier = 1
    * (purchasedUpgrades.includes('standing_mat') ? 1.5 : 1)
    * (purchasedUpgrades.includes('coffee_subscription') ? 2 : 1)
    * (purchasedUpgrades.includes('ai_copilot') ? 5 : 1);

  let eventWpsMult = 1;
  let noPassive = false;
  if (activeEvent && activeEvent.endTime > Date.now()) {
    if (activeEvent.event.effect.type === 'wps_multiplier') {
      eventWpsMult = activeEvent.event.effect.value;
    } else if (activeEvent.event.effect.type === 'no_passive') {
      noPassive = true;
    }
  }

  const wpPerSecond = noPassive ? 0 : baseWps * wpsMultiplier * eventWpsMult;

  // Auto-dismiss welcome
  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // ---- Game loop (passive WP generation) ----
  useEffect(() => {
    if (!isOnShift) return;
    const interval = setInterval(() => {
      const currentWps = (() => {
        const base = STATIONS.reduce((sum, st) => {
          const count = stationsRef.current[st.id] ?? 0;
          return sum + st.baseWps * count;
        }, 0);
        const upMult = 1
          * (upgradesRef.current.includes('standing_mat') ? 1.5 : 1)
          * (upgradesRef.current.includes('coffee_subscription') ? 2 : 1)
          * (upgradesRef.current.includes('ai_copilot') ? 5 : 1);

        const ev = activeEventRef.current;
        if (ev && ev.endTime > Date.now()) {
          if (ev.event.effect.type === 'no_passive') return 0;
          if (ev.event.effect.type === 'wps_multiplier') return base * upMult * ev.event.effect.value;
        }
        return base * upMult;
      })();

      const gain = currentWps / 10; // 100ms tick
      if (gain > 0) {
        setWp((prev) => prev + gain);
        setTotalWp((prev) => prev + gain);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isOnShift]);

  // ---- Random events ----
  useEffect(() => {
    if (!isOnShift) return;
    const interval = setInterval(() => {
      if (activeEventRef.current && activeEventRef.current.endTime > Date.now()) return;

      // Clear expired event
      if (activeEventRef.current && activeEventRef.current.endTime <= Date.now()) {
        setActiveEvent(null);
      }

      // Roll for new event (20% chance every 30s)
      if (Math.random() > 0.2) return;

      const eligible = RANDOM_EVENTS.filter((e) => wpPerSecond >= e.minWps);
      if (eligible.length === 0) return;

      const totalWeight = eligible.reduce((s, e) => s + e.weight, 0);
      let roll = Math.random() * totalWeight;
      let picked: RandomEvent | null = null;
      for (const e of eligible) {
        roll -= e.weight;
        if (roll <= 0) { picked = e; break; }
      }
      if (!picked) return;

      const now = Date.now();
      const newEvent: ActiveEvent = {
        event: picked,
        startTime: now,
        endTime: now + picked.duration,
      };
      setActiveEvent(newEvent);

      // Bonus WP events
      if (picked.effect.type === 'bonus_wp') {
        setWp((prev) => prev + picked!.effect.value);
        setTotalWp((prev) => prev + picked!.effect.value);
      }

      addLogEntry(`EVENT: ${picked.name} - ${picked.description}`, 'event');
    }, 30000);
    return () => clearInterval(interval);
  }, [isOnShift, wpPerSecond]);

  // ---- Log entry helper ----
  const addLogEntry = useCallback((message: string, type: EventLogEntry['type']) => {
    setEventLog((prev) => {
      const entry: EventLogEntry = {
        id: String(++logIdCounter),
        timestamp: Date.now(),
        message,
        type,
      };
      return [...prev.slice(-99), entry];
    });
  }, []);

  // ---- Click handler ----
  const handleWork = useCallback(() => {
    if (!isOnShift) return;
    setWp((prev) => prev + wpPerClick);
    setTotalWp((prev) => prev + wpPerClick);
    setTotalClicks((prev) => prev + 1);
    addLogEntry(`Completed task (+${wpPerClick.toFixed(1)} WP)`, 'milestone');
  }, [wpPerClick, isOnShift, addLogEntry]);

  // ---- Buy station ----
  const handleBuyStation = useCallback((stationId: string) => {
    const station = STATIONS.find((s) => s.id === stationId);
    if (!station) return;
    const owned = stations[stationId] ?? 0;
    const cost = getStationCost(station, owned);
    if (wp < cost) return;

    setWp((prev) => prev - cost);
    setStations((prev) => ({ ...prev, [stationId]: (prev[stationId] ?? 0) + 1 }));
    addLogEntry(`Purchased ${station.name} (${formatNumber(cost)} WP)`, 'milestone');
  }, [wp, stations, addLogEntry]);

  // ---- Buy upgrade ----
  const handleBuyUpgrade = useCallback((upgradeId: string) => {
    const upgrade = UPGRADES.find((u) => u.id === upgradeId);
    if (!upgrade) return;
    if (purchasedUpgrades.includes(upgradeId)) return;
    if (upgrade.requires && !purchasedUpgrades.includes(upgrade.requires)) return;
    if (wp < upgrade.cost) return;

    setWp((prev) => prev - upgrade.cost);
    setPurchasedUpgrades((prev) => [...prev, upgradeId]);
    addLogEntry(`Upgraded: ${upgrade.name}`, 'achievement');
  }, [wp, purchasedUpgrades, addLogEntry]);

  // ---- Clock-out time change ----
  const handleClockOutTimeChange = useCallback((hours: number, minutes: number) => {
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    if (d.getTime() < Date.now()) {
      d.setDate(d.getDate() + 1);
    }
    setClockOutTime(d.getTime());
  }, []);

  // ---- Start shift ----
  const handleStartShift = useCallback(() => {
    const now = Date.now();
    setShiftStart(now);
    setClockOutTime(now + 8 * 60 * 60 * 1000);
    setIsOnShift(true);
    setEventLog([]);
    addLogEntry('Shift started. Clock is ticking!', 'shift');
  }, [addLogEntry]);

  // ---- Achievement checks ----
  useEffect(() => {
    const checks: [string, boolean][] = [
      ['first_click', totalClicks >= 1],
      ['wp_100', totalWp >= 100],
      ['wp_1000', totalWp >= 1000],
      ['wp_10000', totalWp >= 10000],
      ['wp_100000', totalWp >= 100000],
      ['wp_1000000', totalWp >= 1000000],
      ['clicks_100', totalClicks >= 100],
      ['clicks_1000', totalClicks >= 1000],
      ['wps_10', wpPerSecond >= 10],
      ['wps_100', wpPerSecond >= 100],
      ['wps_1000', wpPerSecond >= 1000],
      ['shift_1', shiftsCompleted >= 1],
      ['shift_5', shiftsCompleted >= 5],
      ['shift_10', shiftsCompleted >= 10],
      ['overtime_30', overtimeMinutes >= 30],
      ['overtime_60', overtimeMinutes >= 60],
      ['first_station', Object.values(stations).some((v) => v > 0)],
      ['all_stations', STATIONS.every((st) => (stations[st.id] ?? 0) > 0)],
      ['speed_demon', wpPerSecond >= 10000],
      ['million_clicks', totalClicks >= 10000],
    ];

    for (const [id, met] of checks) {
      if (met && !achievements.includes(id)) {
        setAchievements((prev) => [...prev, id]);
        addLogEntry(`TROPHY UNLOCKED: ${id}`, 'achievement');
      }
    }
  }, [totalWp, totalClicks, wpPerSecond, shiftsCompleted, overtimeMinutes, stations, achievements, addLogEntry]);

  // ---- Save/sync to server ----
  useEffect(() => {
    if (!isOnShift) return;
    const interval = setInterval(() => {
      try {
        fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callsign: username,
            total_qsos: Math.floor(totalWp),
            qso_per_second: wpPerSecond,
            stations_owned: Object.values(stations).reduce((a, b) => a + b, 0),
            achievements_count: achievements.length,
            shifts_completed: shiftsCompleted,
          }),
        });
      } catch {
        // Silently fail
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [username, totalWp, wpPerSecond, stations, achievements, shiftsCompleted, isOnShift]);

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
              <WorkButton wpPerClick={wpPerClick} onWork={handleWork} />
            </section>
          )}
          {activeTab === 'stats' && (
            <section style={styles.mobileSection}>
              <StatsPanel
                wp={wp} wps={wpPerSecond} wpPerClick={wpPerClick}
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
                ownedStations={stations} purchasedUpgrades={purchasedUpgrades}
                onBuyStation={handleBuyStation} onBuyUpgrade={handleBuyUpgrade}
                upgrades={UPGRADES} achievements={achievements}
              />
            </section>
          )}
          {activeTab === 'log' && (
            <section style={styles.mobileSection}>
              <EventLog eventLog={eventLog} onAddLogEntry={addLogEntry} />
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

        <EventPopup activeEvent={activeEvent} eventDefs={RANDOM_EVENTS} />
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
          <span style={{ fontSize: 20 }}>\uD83D\uDCBC</span>
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
            wp={wp} wps={wpPerSecond} wpPerClick={wpPerClick}
            shiftStart={shiftStart} clockOutTime={clockOutTime}
            shiftsCompleted={shiftsCompleted} overtimeMinutes={overtimeMinutes}
            activeEventName={activeEventName} isOnShift={isOnShift}
          />
          <StationList ownedStations={stations} wpPerSecond={wpPerSecond} />
        </aside>

        {/* Center Column */}
        <section style={styles.centerCol}>
          <div style={styles.centerWorkArea}>
            <WorkButton wpPerClick={wpPerClick} onWork={handleWork} />
          </div>
          <div style={styles.centerLogArea}>
            <EventLog eventLog={eventLog} onAddLogEntry={addLogEntry} />
          </div>
        </section>

        {/* Right Column */}
        <aside style={styles.rightCol}>
          <Shop
            wp={wp} totalWp={totalWp} wpPerSecond={wpPerSecond}
            ownedStations={stations} purchasedUpgrades={purchasedUpgrades}
            onBuyStation={handleBuyStation} onBuyUpgrade={handleBuyUpgrade}
            upgrades={UPGRADES} achievements={achievements}
          />
        </aside>
      </main>

      {/* Event Popup Overlay */}
      <EventPopup activeEvent={activeEvent} eventDefs={RANDOM_EVENTS} />

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
