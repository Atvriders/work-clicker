// ============================================================
// Work Clicker — Clock-Out Timer ("Late Night at the Office")
// Dark card with yellow LED countdown, color-shifting numbers
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
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

function formatTimeValue(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

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

  // Color logic: green → amber → red
  let timerColor = '#66BB6A';
  let isPulsing = false;
  if (isOvertime) {
    timerColor = '#EF5350';
    isPulsing = true;
  } else if (remaining < 30 * 60 * 1000) {
    timerColor = '#EF5350';
    if (remaining < 5 * 60 * 1000) isPulsing = true;
  } else if (remaining < 2 * 60 * 60 * 1000) {
    timerColor = '#FFA726';
  }

  // Progress
  const shiftDuration = clockOutTime - shiftStart;
  const elapsed = now - shiftStart;
  const progress = shiftDuration > 0 ? Math.min(1, Math.max(0, elapsed / shiftDuration)) : 0;

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [h, m] = val.split(':').map(Number);
    onClockOutTimeChange(h, m);
  };

  // Not on shift
  if (!isOnShift) {
    return (
      <div style={styles.container}>
        <div style={styles.offShiftRow}>
          <span style={styles.offShiftLabel}>NOT CLOCKED IN</span>
          <button style={styles.startButton} onClick={onStartShift}>
            PUNCH IN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.mainRow}>
        {/* Status label */}
        <span style={styles.statusLabel}>
          {isOvertime ? '\u26A0 OVERTIME' : 'CLOCK-OUT IN'}
        </span>

        {/* Countdown — LED style */}
        <span
          className="tabular-nums"
          style={{
            ...styles.countdown,
            color: timerColor,
            animation: isPulsing ? 'gentle-pulse 1s ease-in-out infinite' : 'none',
            textShadow: `0 0 10px ${timerColor}50, 0 0 2px ${timerColor}30`,
          }}
        >
          {isOvertime ? '+' : ''}{formatCountdown(absRemaining)}
        </span>

        {/* Progress bar — yellow on dark track, rounded */}
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressBar,
              width: `${progress * 100}%`,
              background: isOvertime
                ? '#EF5350'
                : '#E8D44D',
            }}
          />
        </div>

        {/* Clock-out time input */}
        <div style={styles.clockOutGroup}>
          <span style={styles.clockOutLabel}>CLOCK-OUT AT:</span>
          <input
            type="time"
            value={formatTimeValue(new Date(clockOutTime))}
            onChange={handleTimeChange}
            style={styles.timeInput}
          />
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '12px 18px',
    flexShrink: 0,
    background: '#2A2A2F',
    borderRadius: 8,
  },
  mainRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  statusLabel: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#9E9B94',
    textTransform: 'uppercase',
    fontWeight: 600,
    flexShrink: 0,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  countdown: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 1,
    flexShrink: 0,
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  progressTrack: {
    flex: 1,
    height: 8,
    background: '#3A3A3F',
    borderRadius: 4,
    overflow: 'hidden',
    minWidth: 80,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.5s linear',
  },
  clockOutGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  clockOutLabel: {
    fontSize: 10,
    color: '#9E9B94',
    letterSpacing: 0.5,
    fontWeight: 600,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  timeInput: {
    padding: '5px 10px',
    background: '#1A1A1E',
    border: '1px solid #3A3A3F',
    borderRadius: 4,
    color: '#E8D44D',
    fontSize: 13,
    fontFamily: "'IBM Plex Mono', monospace",
    outline: 'none',
    // focus yellow border handled via CSS class if needed
  },
  offShiftRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  offShiftLabel: {
    fontSize: 13,
    letterSpacing: 2,
    color: '#9E9B94',
    fontWeight: 600,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  startButton: {
    padding: '10px 28px',
    background: '#E8D44D',
    border: 'none',
    borderRadius: 6,
    color: '#1A1A1E',
    fontSize: 13,
    fontFamily: "'IBM Plex Mono', monospace",
    fontWeight: 700,
    letterSpacing: 2,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(232, 212, 77, 0.2)',
  },
};

export default ClockOutTimer;
