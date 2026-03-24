// ============================================================
// Work Clicker — Clock-Out Countdown Timer (Compact Single Row)
// ============================================================

import React, { useEffect, useRef } from 'react';

interface ClockOutTimerProps {
  shiftStart: number;
  clockOutTime: number;
  isOnShift: boolean;
  onClockOutTimeChange: (hours: number, minutes: number) => void;
  onStartShift: () => void;
}

const COLORS = {
  blue: '#1a73e8',
  green: '#34a853',
  amber: '#fbbc04',
  red: '#ea4335',
  text: '#e8eaed',
  muted: '#9aa0a6',
};

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

  // Color logic
  let timerColor = COLORS.green;
  let isPulsing = false;
  if (isOvertime) {
    timerColor = COLORS.red;
    isPulsing = true;
  } else if (remaining < 30 * 60 * 1000) {
    timerColor = COLORS.red;
    if (remaining < 5 * 60 * 1000) isPulsing = true;
  } else if (remaining < 2 * 60 * 60 * 1000) {
    timerColor = COLORS.amber;
  }

  // Shift progress
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
      <div style={styles.container} className="glass-card">
        <div style={styles.offShiftRow}>
          <span style={styles.offShiftLabel}>NOT CLOCKED IN</span>
          <button style={styles.startButton} onClick={onStartShift}>
            START NEW SHIFT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="glass-card">
      <div style={styles.mainRow}>
        {/* Status label */}
        <span style={styles.statusLabel}>
          {isOvertime ? 'OVERTIME' : 'CLOCK-OUT IN'}
        </span>

        {/* Countdown */}
        <span
          style={{
            ...styles.countdown,
            color: timerColor,
            textShadow: `0 0 12px ${timerColor}60`,
            animation: isPulsing ? 'pulse-red 1s ease-in-out infinite' : 'none',
          }}
        >
          {isOvertime ? '+' : ''}{formatCountdown(absRemaining)}
        </span>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressBar,
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${COLORS.blue}, ${timerColor})`,
              boxShadow: `0 0 6px ${timerColor}60`,
            }}
          />
        </div>

        {/* Clock-out time input */}
        <div style={styles.clockOutGroup}>
          <span style={styles.clockOutLabel}>Out:</span>
          <input
            type="time"
            value={formatTimeValue(new Date(clockOutTime))}
            onChange={handleTimeChange}
            style={styles.timeInput}
          />
        </div>
      </div>

      <style>{`
        @keyframes pulse-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '8px 16px',
    flexShrink: 0,
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
    color: '#9aa0a6',
    textTransform: 'uppercase',
    fontWeight: 600,
    flexShrink: 0,
  },
  countdown: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: 1,
    flexShrink: 0,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    minWidth: 80,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
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
    color: '#9aa0a6',
    letterSpacing: 0.5,
    fontWeight: 600,
  },
  timeInput: {
    padding: '4px 8px',
    background: 'rgba(15, 25, 35, 0.6)',
    border: '1px solid rgba(26, 115, 232, 0.25)',
    borderRadius: 6,
    color: '#e8eaed',
    fontSize: 12,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    outline: 'none',
  },
  offShiftRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  offShiftLabel: {
    fontSize: 12,
    letterSpacing: 2,
    color: '#9aa0a6',
    fontWeight: 600,
  },
  startButton: {
    padding: '8px 24px',
    background: 'linear-gradient(135deg, #1a73e8, #1557b0)',
    border: 'none',
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 2,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default ClockOutTimer;
