// ============================================================
// Work Clicker — Shift Clock (Corporate Dystopia Brutalism)
// Compact panel, LED countdown, progress bar, punch in/out
// ============================================================

import React, { useEffect, useRef } from 'react';

interface ClockOutTimerProps {
  shiftStart: number;
  clockOutTime: number;
  isOnShift: boolean;
  onClockOutTimeChange: (hours: number, minutes: number) => void;
  onStartShift: () => void;
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(Math.abs(ms) / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatTimeValue(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

const FONT_MONO = "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace";

const COLOR_GREEN = '#39FF14';
const COLOR_AMBER = '#FFA726';
const COLOR_DANGER = '#EF5350';

const ClockOutTimer: React.FC<ClockOutTimerProps> = ({
  shiftStart,
  clockOutTime,
  isOnShift,
  onClockOutTimeChange,
  onStartShift,
}) => {
  const [now, setNow] = React.useState(Date.now());
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      setNow(Date.now());
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const remaining = clockOutTime - now;
  const isOvertime = remaining < 0;
  const absRemaining = Math.abs(remaining);

  // Color logic: green (>2h) -> amber (30min-2h) -> danger (<30min)
  let timerColor = COLOR_GREEN;
  if (isOvertime) {
    timerColor = COLOR_DANGER;
  } else if (remaining < 30 * 60 * 1000) {
    timerColor = COLOR_DANGER;
  } else if (remaining < 2 * 60 * 60 * 1000) {
    timerColor = COLOR_AMBER;
  }

  // Progress
  const shiftDuration = clockOutTime - shiftStart;
  const elapsed = now - shiftStart;
  const progress = shiftDuration > 0 ? Math.min(1, Math.max(0, elapsed / shiftDuration)) : 0;

  // Overtime minutes
  const overtimeMinutes = Math.floor(absRemaining / 60000);

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [h, m] = val.split(':').map(Number);
    onClockOutTimeChange(h, m);
  };

  const panelStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    padding: '10px 14px',
    boxShadow: 'var(--shadow)',
    flexShrink: 0,
  };

  const headerStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: FONT_MONO,
    fontWeight: 600,
    letterSpacing: 2,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    margin: 0,
    marginBottom: 6,
  };

  // Not on shift — show PUNCH IN
  if (!isOnShift) {
    return (
      <div style={panelStyle}>
        <div style={headerStyle}>SHIFT CLOCK</div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <span style={{
            fontSize: 11,
            fontFamily: FONT_MONO,
            fontWeight: 600,
            letterSpacing: 1.5,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
          }}>
            NOT CLOCKED IN
          </span>
          <button
            onClick={onStartShift}
            style={{
              padding: '7px 20px',
              background: 'var(--bg-primary)',
              border: `1px solid ${COLOR_AMBER}`,
              borderRadius: 3,
              color: COLOR_AMBER,
              fontSize: 11,
              fontFamily: FONT_MONO,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            PUNCH IN
          </button>
        </div>
      </div>
    );
  }

  // On shift — show timer, progress, controls
  const countdownStyle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 700,
    fontFamily: FONT_MONO,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: 1,
    color: timerColor,
    textShadow: `0 0 12px ${timerColor}60, 0 0 4px ${timerColor}40`,
    lineHeight: 1,
    animation: (isOvertime || remaining < 5 * 60 * 1000)
      ? 'gentle-pulse 1s ease-in-out infinite'
      : 'none',
  };

  const progressTrackStyle: React.CSSProperties = {
    width: '100%',
    height: 3,
    background: 'var(--bg-card)',
    borderRadius: 0,
    overflow: 'hidden',
    marginTop: 8,
    border: '1px solid var(--border)',
  };

  const progressFillStyle: React.CSSProperties = {
    height: '100%',
    width: `${progress * 100}%`,
    background: isOvertime
      ? COLOR_DANGER
      : `linear-gradient(90deg, ${timerColor}80, ${timerColor})`,
    transition: 'width 0.5s linear',
    borderRadius: 0,
  };

  const overtimeStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: FONT_MONO,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: COLOR_DANGER,
    textTransform: 'uppercase',
    animation: 'gentle-pulse 1s ease-in-out infinite',
    marginTop: 6,
  };

  const bottomRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  };

  const timeInputStyle: React.CSSProperties = {
    padding: '4px 8px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: 3,
    color: 'var(--text-primary)',
    fontSize: 12,
    fontFamily: FONT_MONO,
    outline: 'none',
    width: 90,
  };

  const endShiftBtnStyle: React.CSSProperties = {
    padding: '4px 12px',
    background: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 3,
    color: 'var(--text-muted)',
    fontSize: 10,
    fontFamily: FONT_MONO,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>SHIFT CLOCK</div>

      {/* LED countdown */}
      <div style={countdownStyle}>
        {isOvertime ? '+' : ''}{formatCountdown(absRemaining)}
      </div>

      {/* Progress bar */}
      <div style={progressTrackStyle}>
        <div style={progressFillStyle} />
      </div>

      {/* Overtime indicator */}
      {isOvertime && (
        <div style={overtimeStyle}>
          OVERTIME +{overtimeMinutes}m
        </div>
      )}

      {/* Bottom row: time picker + end shift */}
      <div style={bottomRowStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 10,
            fontFamily: FONT_MONO,
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}>
            OUT:
          </span>
          <input
            type="time"
            value={formatTimeValue(new Date(clockOutTime))}
            onChange={handleTimeChange}
            style={timeInputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = COLOR_AMBER;
              e.currentTarget.style.boxShadow = `0 0 0 1px ${COLOR_AMBER}40`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
        <button
          onClick={onStartShift}
          style={endShiftBtnStyle}
        >
          END SHIFT
        </button>
      </div>
    </div>
  );
};

export default ClockOutTimer;
