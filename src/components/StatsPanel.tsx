// ============================================================
// Work Clicker — Stats Panel ("Corporate Dystopia Brutalism")
// EMPLOYEE METRICS — 2-column grid, all inline styles
// ============================================================

import React from 'react';
import { ActiveEvent } from '../types';

interface StatsPanelProps {
  wp: number;
  wps: number;
  wpPerClick: number;
  shiftStart: number;
  clockOutTime: number;
  shiftsCompleted: number;
  overtimeMinutes: number;
  activeEventName: string | null;
  activeEvent: ActiveEvent | null;
  isOnShift: boolean;
  prestigeLevel: number;
  prestigeMultiplier: number;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  wp,
  wps,
  wpPerClick,
  shiftStart,
  clockOutTime,
  shiftsCompleted,
  overtimeMinutes,
  activeEventName,
  activeEvent,
  isOnShift,
  prestigeLevel,
  prestigeMultiplier,
}) => {
  const now = Date.now();
  const shiftDuration = clockOutTime - shiftStart;
  const elapsed = now - shiftStart;
  const progress = isOnShift && shiftDuration > 0 ? Math.min(1, Math.max(0, elapsed / shiftDuration)) : 0;

  const isActiveEventPositive = activeEvent && activeEvent.endTime > now
    ? activeEvent.event.isPositive
    : true;

  const stats: {
    label: string;
    value: string;
    color: string;
  }[] = [
    { label: 'TOTAL WP', value: formatNumber(wp), color: '#FFB800' },
    { label: 'WP/SEC', value: wps.toFixed(1), color: '#00FF66' },
    { label: 'WP/CLICK', value: wpPerClick.toFixed(1), color: '#E8E6E1' },
    { label: 'SHIFTS', value: String(shiftsCompleted), color: '#E8E6E1' },
    {
      label: 'OVERTIME',
      value: `${overtimeMinutes.toFixed(0)}m`,
      color: overtimeMinutes > 0 ? '#EF5350' : '#7A8899',
    },
    {
      label: 'PRESTIGE',
      value: prestigeLevel > 0 ? `${prestigeLevel} ×${prestigeMultiplier.toFixed(2)}` : '0',
      color: prestigeLevel > 0 ? '#FFB800' : '#7A8899',
    },
  ];

  return (
    <div
      style={{
        background: '#111113',
        border: '1px solid #2A2A2F',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#6A7A8A',
          fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          borderBottom: '1px solid #2A2A2F',
          paddingBottom: 8,
        }}
      >
        EMPLOYEE METRICS
      </div>

      {/* 2-column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px 16px',
        }}
      >
        {stats.map((s) => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#7A8899',
                fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                lineHeight: 1,
              }}
            >
              {s.label}
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: s.color,
                fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1.2,
              }}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Shift progress bar */}
      {isOnShift && (
        <div
          style={{
            height: 4,
            background: '#1A1A1E',
            overflow: 'hidden',
            marginTop: 2,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress * 100}%`,
              background: '#FFB800',
              transition: 'width 1s linear',
            }}
          />
        </div>
      )}

      {/* Active event banner */}
      {activeEventName && activeEvent && activeEvent.endTime > now && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            background: '#1A1A1E',
            border: `1px solid ${isActiveEventPositive ? '#00FF6640' : '#EF535040'}`,
            borderLeft: `3px solid ${isActiveEventPositive ? '#00FF66' : '#EF5350'}`,
            fontSize: 11,
            fontWeight: 600,
            color: isActiveEventPositive ? '#00FF66' : '#EF5350',
            fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
            letterSpacing: '0.04em',
          }}
        >
          <span style={{ fontSize: 14 }}>{activeEvent.event.icon}</span>
          <span>{activeEventName}</span>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
