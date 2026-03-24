// Work Clicker — Type Definitions

export interface WorkStation {
  id: string;
  name: string;
  description: string;
  flavor: string;
  baseCost: number;
  baseWps: number;
  costMultiplier: number;
  icon: string;
  tier: number;
  unlockAt: number;
}

export type UpgradeType =
  | 'click_multiplier'
  | 'click_flat'
  | 'wps_multiplier'
  | 'coffee_boost'
  | 'break_time';

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  flavor: string;
  cost: number;
  type: UpgradeType;
  value: number;
  duration?: number;
  icon: string;
  requires?: string;
  tier: number;
}

export type AchievementCondition =
  | { type: 'total_wp'; value: number }
  | { type: 'total_clicks'; value: number }
  | { type: 'wps'; value: number }
  | { type: 'shifts_completed'; value: number }
  | { type: 'overtime_worked'; value: number };

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: AchievementCondition;
  hidden: boolean;
}

export type EventEffectType =
  | 'wps_multiplier'
  | 'click_multiplier'
  | 'no_passive'
  | 'bonus_wp'
  | 'coffee_break';

export interface EventEffect {
  type: EventEffectType;
  value: number;
}

export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: EventEffect;
  duration: number;
  weight: number;
  minWps: number;
  isPositive: boolean;
}

export interface ActiveEvent {
  event: RandomEvent;
  startTime: number;
  endTime: number;
}

export type EventLogType = 'milestone' | 'event' | 'achievement' | 'warning' | 'shift';

export interface EventLogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: EventLogType;
}

export interface GameState {
  wp: number;
  totalWp: number;
  totalClicks: number;
  wpPerClick: number;
  wpPerSecond: number;
  clickMultiplier: number;
  stations: Record<string, number>;
  upgrades: string[];
  achievements: string[];
  activeEvent: ActiveEvent | null;
  eventLog: EventLogEntry[];
  shiftStart: number;
  clockOutTime: number;
  shiftsCompleted: number;
  overtimeMinutes: number;
  isOnShift: boolean;
  coffeeLevel: number;
  breakTimeLeft: number;
  callsign: string;
  discountActive: number;
  startTime: number;
}
