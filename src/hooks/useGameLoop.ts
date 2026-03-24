// ============================================================
// Work Clicker — Game Loop (requestAnimationFrame)
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '../stores/useGameStore';
import { AchievementCondition } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';
import { EVENTS } from '../data/events';

// ---- Helpers ----

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function checkCondition(
  condition: AchievementCondition,
  state: ReturnType<typeof useGameStore.getState>,
): boolean {
  switch (condition.type) {
    case 'total_wp':
      return state.totalWp >= condition.value;
    case 'total_clicks':
      return state.totalClicks >= condition.value;
    case 'wps':
      return state.wpPerSecond >= condition.value;
    case 'shifts_completed':
      return state.shiftsCompleted >= condition.value;
    case 'overtime_worked':
      return state.overtimeMinutes >= condition.value;
    default:
      return false;
  }
}

// ---- The Hook ----

export function useGameLoop(): void {
  const lastFrameRef = useRef<number>(0);
  const lastAchievementCheckRef = useRef<number>(0);
  const nextEventTimeRef = useRef<number>(0);
  const lastSaveRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const scheduleNextEvent = useCallback(() => {
    nextEventTimeRef.current = Date.now() + randomBetween(45_000, 120_000);
  }, []);

  useEffect(() => {
    // Load saved game on mount
    const store = useGameStore.getState();
    store.load();

    // Retroactively unlock achievements after load (delayed for async server fetch)
    setTimeout(() => {
      let achievements: any[];
      try {
        // using top-level import ACHIEVEMENTS
        achievements = ACHIEVEMENTS;
      } catch {
        return;
      }

      const current = useGameStore.getState();
      for (const ach of achievements) {
        if (current.achievements.includes(ach.id)) continue;
        if (checkCondition(ach.condition, current)) {
          useGameStore.setState((s) => ({
            achievements: [...s.achievements, ach.id],
          }));
        }
      }
    }, 1500);

    const now = Date.now();
    lastFrameRef.current = now;
    lastAchievementCheckRef.current = now;
    lastSaveRef.current = now;
    scheduleNextEvent();

    function loop(_timestamp: number) {
      const now = Date.now();
      const deltaMs = Math.min(now - lastFrameRef.current, 200); // Cap at 200ms
      lastFrameRef.current = now;

      const state = useGameStore.getState();

      // -- Tick (passive production, event expiry, clock-out check) --
      if (deltaMs > 0) {
        state.tick(deltaMs);
      }

      // -- Achievement check (every 1 second) --
      if (now - lastAchievementCheckRef.current >= 1000) {
        lastAchievementCheckRef.current = now;

        let achievements: any[];
        try {
          // using top-level import ACHIEVEMENTS
          achievements = ACHIEVEMENTS;
        } catch {
          achievements = [];
        }

        const current = useGameStore.getState();

        for (const ach of achievements) {
          if (current.achievements.includes(ach.id)) continue;
          if (checkCondition(ach.condition, current)) {
            useGameStore.setState((s) => ({
              achievements: [...s.achievements, ach.id],
              eventLog: [
                {
                  id: `log-${Date.now()}-ach-${ach.id}`,
                  timestamp: Date.now(),
                  message: `Achievement unlocked: ${ach.name} — ${ach.description}`,
                  type: 'achievement' as const,
                },
                ...s.eventLog,
              ].slice(0, 200),
            }));
          }
        }
      }

      // -- Random events (every 45-120 seconds) --
      if (now >= nextEventTimeRef.current) {
        scheduleNextEvent();
        const current = useGameStore.getState();

        // Only trigger events while on shift, don't stack timed events
        if (current.isOnShift && (!current.activeEvent || current.activeEvent.endTime === 0)) {
          let events: any[];
          try {
            // using top-level import EVENTS
            events = EVENTS;
          } catch {
            events = [];
          }

          // Filter eligible events
          const eligible = events.filter(
            (e: any) => current.wpPerSecond >= (e.minWps ?? 0),
          );

          if (eligible.length > 0) {
            // Weighted random selection
            const totalWeight = eligible.reduce((sum: number, e: any) => sum + e.weight, 0);
            let roll = Math.random() * totalWeight;
            let chosen = eligible[0];
            for (const e of eligible) {
              roll -= e.weight;
              if (roll <= 0) {
                chosen = e;
                break;
              }
            }
            current.setEvent(chosen);
          }
        }
      }

      // -- Auto-save (every 30 seconds) --
      if (now - lastSaveRef.current >= 30_000) {
        lastSaveRef.current = now;
        useGameStore.getState().save();
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      // Save on unmount
      useGameStore.getState().save();
    };
  }, [scheduleNextEvent]);
}
