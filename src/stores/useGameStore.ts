// ============================================================
// Work Clicker — Core Game Store (Zustand)
// ============================================================

import { create } from 'zustand';
import {
  GameState,
  EventLogEntry,
  EventLogType,
  ActiveEvent,
  EventEffect,
  RandomEvent,
} from '../types';
import { STATIONS, getStationCost } from '../data/stations';
import { UPGRADES } from '../data/upgrades';

// ---- Constants ----

const SAVE_KEY = 'work-clicker-save';
const USERNAME_KEY = 'work-clicker-username';

// ---- Default clock-out: today at 5:00 PM ----

function getDefaultClockOut(): number {
  const d = new Date();
  d.setHours(17, 0, 0, 0);
  // If it's already past 5 PM, set to tomorrow 5 PM
  if (d.getTime() <= Date.now()) {
    d.setDate(d.getDate() + 1);
  }
  return d.getTime();
}

// ---- Initial state ----

const initialState: GameState = {
  wp: 0,
  totalWp: 0,
  totalClicks: 0,
  wpPerClick: 1,
  wpPerSecond: 0,
  clickMultiplier: 1,
  stations: {},
  upgrades: [],
  achievements: [],
  activeEvent: null,
  eventLog: [],
  shiftStart: 0,
  clockOutTime: getDefaultClockOut(),
  shiftsCompleted: 0,
  overtimeMinutes: 0,
  isOnShift: false,
  coffeeLevel: 0,
  breakTimeLeft: 0,
  callsign: '',
  discountActive: 0,
  startTime: Date.now(),
  prestigeLevel: 0,
  prestigeMultiplier: 1,
};

// ---- Store actions interface ----

interface GameActions {
  click: () => void;
  tick: (deltaMs: number) => void;
  buyStation: (id: string) => void;
  buyUpgrade: (id: string) => void;
  startShift: (clockOutTime: number) => void;
  endShift: () => void;
  setClockOutTime: (time: number) => void;
  setEvent: (event: RandomEvent) => void;
  clearEvent: () => void;
  addLogEntry: (message: string, type: EventLogType) => void;
  clearEventLog: () => void;
  recalcWps: () => void;
  getPrestigeCost: () => number;
  prestige: () => void;
  save: () => void;
  load: () => void;
  reset: () => void;
}

export type GameStore = GameState & GameActions;

// ---- Helpers ----

let logIdCounter = 0;
function makeLogEntry(message: string, type: EventLogType): EventLogEntry {
  return {
    id: `log-${Date.now()}-${logIdCounter++}`,
    timestamp: Date.now(),
    message,
    type,
  };
}

/** Get event modifiers from the active event. */
function getEventModifiers(event: ActiveEvent | null): {
  wpsMult: number;
  clickMult: number;
  noPassive: boolean;
} {
  const result = { wpsMult: 1, clickMult: 1, noPassive: false };
  if (!event) return result;

  const eff = event.event.effect;
  switch (eff.type) {
    case 'wps_multiplier':
      result.wpsMult *= eff.value;
      break;
    case 'click_multiplier':
      result.clickMult *= eff.value;
      break;
    case 'no_passive':
      result.noPassive = true;
      break;
    default:
      break;
  }
  return result;
}

// ---- Work task messages for click variety ----

const WORK_TASKS = [
  'Answered emails',
  'Filed TPS report',
  'Attended standup',
  'Fixed the printer',
  'Updated spreadsheet',
  'Replied to Slack',
  'Submitted expense report',
  'Organized desk',
  'Refactored codebase',
  'Closed a ticket',
  'Reviewed PR',
  'Deployed to staging',
  'Wrote documentation',
  'Scheduled meeting',
  'Cleared inbox',
  'Updated Jira board',
  'Made coffee run',
  'Fixed a bug',
  'Onboarded new hire',
  'Gave presentation',
];

// ---- The Store ----

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  // --- Click ---
  click: () => {
    set((s) => {
      if (!s.isOnShift) return {}; // Can't work if not on shift

      const eventMods = getEventModifiers(s.activeEvent);
      const gained = s.wpPerClick * s.clickMultiplier * eventMods.clickMult * s.prestigeMultiplier;
      const task = WORK_TASKS[Math.floor(Math.random() * WORK_TASKS.length)];

      const newLog = [
        makeLogEntry(`${task} (+${gained.toFixed(1)} WP)`, 'milestone'),
        ...s.eventLog,
      ].slice(0, 200);

      return {
        wp: s.wp + gained,
        totalWp: s.totalWp + gained,
        totalClicks: s.totalClicks + 1,
        eventLog: newLog,
      };
    });
  },

  // --- Tick (game loop) ---
  tick: (deltaMs: number) => {
    set((s) => {
      const deltaSec = deltaMs / 1000;
      const now = Date.now();
      const patch: Partial<GameState> = {};

      // -- Event expiry --
      let activeEvent = s.activeEvent;
      if (activeEvent && activeEvent.endTime > 0 && now >= activeEvent.endTime) {
        activeEvent = null;
        patch.discountActive = 0;
      }
      patch.activeEvent = activeEvent;

      // -- Clock-out check --
      if (s.isOnShift && now >= s.clockOutTime) {
        // Auto end shift
        const overtimeMs = now - s.clockOutTime;
        const overtimeMin = Math.floor(overtimeMs / 60000);
        patch.isOnShift = false;
        patch.shiftsCompleted = s.shiftsCompleted + 1;
        patch.overtimeMinutes = s.overtimeMinutes + overtimeMin;
        patch.eventLog = [
          makeLogEntry(
            `SHIFT COMPLETE! Earned ${s.wp.toFixed(0)} WP this shift.${overtimeMin > 0 ? ` (${overtimeMin}min overtime)` : ''}`,
            'shift',
          ),
          ...s.eventLog,
        ].slice(0, 200);

        // Submit to leaderboard
        const username = localStorage.getItem(USERNAME_KEY) || s.callsign;
        if (username) {
          const stationsOwned = Object.values(s.stations).reduce((sum, n) => sum + n, 0);
          fetch('/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username,
              bestShiftWp: s.wp,
              totalShifts: (s.shiftsCompleted || 0) + 1,
              totalWp: s.totalWp,
              wps: s.wpPerSecond,
            }),
          }).catch(() => {});
        }

        return patch;
      }

      // -- Passive WP production (only while on shift) --
      if (s.isOnShift) {
        const eventMods = getEventModifiers(activeEvent);
        if (!eventMods.noPassive && s.wpPerSecond > 0) {
          const gained = s.wpPerSecond * deltaSec * eventMods.wpsMult * s.prestigeMultiplier;
          patch.wp = (patch.wp ?? s.wp) + gained;
          patch.totalWp = (patch.totalWp ?? s.totalWp) + gained;
        }
      }

      // -- Coffee level decay --
      if (s.coffeeLevel > 0) {
        patch.coffeeLevel = Math.max(0, s.coffeeLevel - deltaSec * 0.01);
      }

      return patch;
    });
  },

  // --- Buy Station ---
  buyStation: (id: string) => {
    const s = get();
    // Dynamic import would be needed for stations data;
    // for now we use a lazy approach — the component passes cost info
    // Actually, follow ham-radio pattern: import stations data
    let stationsList: any[];
    let getStationCostFn: (st: any, owned: number) => number;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // using top-level import STATIONS
      stationsList = STATIONS;
      getStationCostFn = getStationCost;
    } catch {
      return;
    }

    const station = stationsList.find((st: any) => st.id === id);
    if (!station) return;

    const owned = s.stations[id] ?? 0;
    let cost = getStationCostFn(station, owned);
    if (s.discountActive) cost = Math.floor(cost * (1 - s.discountActive));
    if (s.wp < cost) return;

    const newStations = { ...s.stations, [id]: owned + 1 };

    // Recalculate WPS
    let totalWps = 0;
    for (const st of stationsList) {
      const count = newStations[st.id] ?? 0;
      if (count > 0) totalWps += st.baseWps * count;
    }

    set({
      wp: s.wp - cost,
      stations: newStations,
      wpPerSecond: totalWps,
    });
  },

  // --- Buy Upgrade ---
  buyUpgrade: (id: string) => {
    const s = get();
    if (s.upgrades.includes(id)) return;

    let upgradesList: any[];
    try {
      // using top-level import UPGRADES
      upgradesList = UPGRADES;
    } catch {
      return;
    }

    const upgrade = upgradesList.find((u: any) => u.id === id);
    if (!upgrade) return;

    if (upgrade.requires && !s.upgrades.includes(upgrade.requires)) return;

    let cost = upgrade.cost;
    if (s.discountActive) cost = Math.floor(cost * (1 - s.discountActive));
    if (s.wp < cost) return;

    const newUpgrades = [...s.upgrades, id];

    const patch: Partial<GameState> = {
      wp: s.wp - cost,
      upgrades: newUpgrades,
    };

    // Apply upgrade effects
    if (upgrade.type === 'click_multiplier') {
      patch.clickMultiplier = s.clickMultiplier * upgrade.value;
    } else if (upgrade.type === 'click_flat') {
      patch.wpPerClick = s.wpPerClick + upgrade.value;
    } else if (upgrade.type === 'wps_multiplier') {
      // Recalculate total WPS with multiplier
      patch.wpPerSecond = s.wpPerSecond * upgrade.value;
    }

    set(patch);
  },

  // --- Shift Management ---
  startShift: (clockOutTime: number) => {
    set((s) => ({
      shiftStart: Date.now(),
      clockOutTime,
      isOnShift: true,
      wp: 0, // Reset WP for new shift
      eventLog: [
        makeLogEntry(
          `Started new shift! Clock out at ${new Date(clockOutTime).toLocaleTimeString()}.`,
          'shift',
        ),
        ...s.eventLog,
      ].slice(0, 200),
    }));
  },

  endShift: () => {
    const s = get();
    if (!s.isOnShift) return;

    const now = Date.now();
    const overtimeMs = Math.max(0, now - s.clockOutTime);
    const overtimeMin = Math.floor(overtimeMs / 60000);

    // Submit to leaderboard
    const username = localStorage.getItem(USERNAME_KEY) || s.callsign;
    if (username) {
      fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          bestShiftWp: s.wp,
          totalShifts: s.shiftsCompleted + 1,
          totalWp: s.totalWp,
          wps: s.wpPerSecond,
        }),
      }).catch(() => {});
    }

    set({
      isOnShift: false,
      shiftsCompleted: s.shiftsCompleted + 1,
      overtimeMinutes: s.overtimeMinutes + overtimeMin,
      eventLog: [
        makeLogEntry(
          `SHIFT COMPLETE! Earned ${s.wp.toFixed(0)} WP this shift.${overtimeMin > 0 ? ` (${overtimeMin}min overtime)` : ''}`,
          'shift',
        ),
        ...s.eventLog,
      ].slice(0, 200),
    });
  },

  setClockOutTime: (time: number) => {
    set({ clockOutTime: time });
  },

  // --- Events ---
  setEvent: (event: RandomEvent) => {
    const s = get();
    const now = Date.now();
    const durationMs = event.duration * 1000;
    const endTime = durationMs > 0 ? now + durationMs : 0;

    const activeEvent: ActiveEvent = {
      event,
      startTime: now,
      endTime,
    };

    // Apply immediate effects
    const patch: Partial<GameState> = {};
    if (event.effect.type === 'bonus_wp') {
      const bonus = event.effect.value * s.prestigeMultiplier;
      patch.wp = s.wp + bonus;
      patch.totalWp = s.totalWp + bonus;
    }

    set({
      ...patch,
      activeEvent: durationMs > 0 ? activeEvent : s.activeEvent,
      eventLog: [
        makeLogEntry(`${event.icon} ${event.name}: ${event.description}`, 'event'),
        ...s.eventLog,
      ].slice(0, 200),
    });
  },

  clearEvent: () => {
    set({ activeEvent: null, discountActive: 0 });
  },

  // --- Log ---
  addLogEntry: (message: string, type: EventLogType) => {
    set((s) => ({
      eventLog: [makeLogEntry(message, type), ...s.eventLog].slice(0, 200),
    }));
  },

  // --- Clear Event Log ---
  clearEventLog: () => {
    set({ eventLog: [] });
  },

  // --- Recalc WPS ---
  recalcWps: () => {
    const s = get();
    let stationsList: any[];
    try {
      // using top-level import STATIONS
      stationsList = STATIONS;
    } catch {
      return;
    }

    let totalWps = 0;
    for (const st of stationsList) {
      const count = s.stations[st.id] ?? 0;
      if (count > 0) totalWps += st.baseWps * count;
    }

    // Apply WPS multiplier upgrades
    let wpsMult = 1;
    let clickFlat = 1;
    let clickMult = 1;
    try {
      // using top-level import UPGRADES
      for (const uid of s.upgrades) {
        const upg = UPGRADES.find((u: any) => u.id === uid);
        if (!upg) continue;
        if (upg.type === 'wps_multiplier') wpsMult *= upg.value;
        if (upg.type === 'click_flat') clickFlat += upg.value;
        if (upg.type === 'click_multiplier') clickMult *= upg.value;
      }
    } catch {
      // Data not available yet
    }

    set({
      wpPerSecond: totalWps * wpsMult,
      wpPerClick: clickFlat,
      clickMultiplier: clickMult,
    });
  },

  // --- Prestige ---
  getPrestigeCost: () => {
    const s = get();
    return Math.floor(100 * Math.pow(2, s.prestigeLevel));
  },

  prestige: () => {
    const s = get();
    const cost = Math.floor(100 * Math.pow(2, s.prestigeLevel));
    if (s.wp < cost) return;

    const newLevel = s.prestigeLevel + 1;
    const newMultiplier = 1 + newLevel * 0.25;

    set({
      wp: 0,
      wpPerClick: 1,
      wpPerSecond: 0,
      clickMultiplier: 1,
      stations: {},
      upgrades: [],
      activeEvent: null,
      coffeeLevel: 0,
      breakTimeLeft: 0,
      discountActive: 0,
      prestigeLevel: newLevel,
      prestigeMultiplier: newMultiplier,
      eventLog: [
        makeLogEntry(
          `PRESTIGE! Level ${newLevel} — ${newMultiplier.toFixed(2)}x multiplier`,
          'milestone',
        ),
        ...s.eventLog,
      ].slice(0, 200),
    });
  },

  // --- Save / Load / Reset ---
  save: () => {
    const s = get();
    const username = localStorage.getItem(USERNAME_KEY) || s.callsign;
    const saveData: GameState = {
      wp: s.wp,
      totalWp: s.totalWp,
      totalClicks: s.totalClicks,
      wpPerClick: s.wpPerClick,
      wpPerSecond: s.wpPerSecond,
      clickMultiplier: s.clickMultiplier,
      stations: s.stations,
      upgrades: s.upgrades,
      achievements: s.achievements,
      activeEvent: s.activeEvent,
      eventLog: s.eventLog.slice(0, 50),
      shiftStart: s.shiftStart,
      clockOutTime: s.clockOutTime,
      shiftsCompleted: s.shiftsCompleted,
      overtimeMinutes: s.overtimeMinutes,
      isOnShift: s.isOnShift,
      coffeeLevel: s.coffeeLevel,
      breakTimeLeft: s.breakTimeLeft,
      callsign: username || '',
      discountActive: s.discountActive,
      startTime: s.startTime,
      prestigeLevel: s.prestigeLevel,
      prestigeMultiplier: s.prestigeMultiplier,
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    } catch {
      // Storage full or unavailable
    }

    // Sync to server if logged in
    if (username) {
      fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, saveData }),
      }).catch(() => {});

      fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          bestShiftWp: s.wp,
          totalShifts: s.shiftsCompleted,
          totalWp: s.totalWp,
          wps: s.wpPerSecond,
        }),
      }).catch(() => {});
    }
  },

  load: () => {
    const username = localStorage.getItem(USERNAME_KEY);

    // Try server first if logged in
    if (username) {
      fetch(`/api/save?username=${encodeURIComponent(username)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((result) => {
          if (result?.saveData) {
            const data = result.saveData as Partial<GameState>;
            set({ ...initialState, ...data, callsign: username });
            get().recalcWps();
            return;
          }
          loadFromLocalStorage();
        })
        .catch(() => {
          loadFromLocalStorage();
        });
    } else {
      loadFromLocalStorage();
    }

    function loadFromLocalStorage() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) {
          set({ ...initialState, callsign: username || '', startTime: Date.now() });
          return;
        }
        const data = JSON.parse(raw) as Partial<GameState>;
        set({ ...initialState, ...data, callsign: username || '' });
        get().recalcWps();
      } catch {
        set({ ...initialState, callsign: username || '', startTime: Date.now() });
      }
    }
  },

  reset: () => {
    localStorage.removeItem(SAVE_KEY);
    set({ ...initialState, startTime: Date.now(), clockOutTime: getDefaultClockOut(), prestigeLevel: 0, prestigeMultiplier: 1 });
  },
}));
