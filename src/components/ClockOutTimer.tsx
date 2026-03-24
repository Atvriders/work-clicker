// ============================================================
// Work Clicker — Clock-Out Countdown Timer (THE MAIN FEATURE)
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
  card: '#1a2332',
  bg: '#0f1923',
  border: 'rgba(26,115,232,0.2)',
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

  // Tick every 100ms for smooth countdown
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
  const isShiftComplete = isOnShift && isOvertime;
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

  // Shift elapsed
  const shiftDuration = clockOutTime - shiftStart;
  const elapsed = now - shiftStart;
  const progress = shiftDuration > 0 ? Math.min(1, Math.max(0, elapsed / shiftDuration)) : 0;

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // "HH:MM"
    if (!val) return;
    const [h, m] = val.split(':').map(Number);
    onClockOutTimeChange(h, m);
  };

  // Not on shift
  if (!isOnShift) {
    return (
      <div style={styles.container}>
        <div style={styles.offShiftLabel}>NOT CLOCKED IN</div>
        <button style={styles.startButton} onClick={onStartShift}>
          START NEW SHIFT
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Status label */}
      <div style={styles.statusRow}>
        <span style={styles.statusLabel}>
          {isShiftComplete ? 'SHIFT COMPLETE!' : 'TIME UNTIL CLOCK-OUT'}
        </span>
      </div>

      {/* Huge countdown */}
      <div
        style={{
          ...styles.countdown,
          color: timerColor,
          textShadow: `0 0 24px ${timerColor}99, 0 0 8px ${timerColor}60`,
          animation: isPulsing ? 'pulse-red 1s ease-in-out infinite' : 'none',
        }}
      >
        {isOvertime ? (
          <>
            <span style={styles.overtimeLabel}>OVERTIME!</span>
            <span>+{formatCountdown(absRemaining)}</span>
          </>
        ) : (
          formatCountdown(remaining)
        )}
      </div>

      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressBar,
            width: `${progress * 100}%`,
            background: timerColor,
            boxShadow: `0 0 8px ${timerColor}80`,
          }}
        />
      </div>

      {/* Clock-out time inline input */}
      <div style={styles.clockOutRow}>
        <span style={styles.clockOutLabel}>Clock-out:</span>
        <input
          type="time"
          value={formatTimeValue(new Date(clockOutTime))}
          onChange={handleTimeChange}
          style={styles.timeInput}
        />
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
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    padding: '12px 24px',
    textAlign: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 11,
    letterSpacing: 3,
    color: '#c5cad1',
    textTransform: 'uppercase',
  },
  countdown: {
    fontSize: 48,
    fontWeight: 700,
    letterSpacing: 2,
    lineHeight: 1.2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },
  overtimeLabel: {
    fontSize: 18,
    letterSpacing: 6,
    fontWeight: 700,
    color: '#ff4444',
    animation: 'flash-overtime 1s ease-in-out infinite',
  },
  progressTrack: {
    height: 4,
    background: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.5s linear',
  },
  clockOutRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  clockOutLabel: {
    fontSize: 11,
    color: '#c5cad1',
    letterSpacing: 1,
  },
  offShiftLabel: {
    fontSize: 14,
    letterSpacing: 4,
    color: '#c5cad1',
    marginBottom: 12,
  },
  startButton: {
    padding: '12px 32px',
    background: COLORS.blue,
    border: 'none',
    borderRadius: 6,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 3,
    cursor: 'pointer',
  },
  timeInput: {
    padding: '3px 6px',
    background: '#0f1923',
    border: `1px solid ${COLORS.blue}`,
    borderRadius: 4,
    color: '#e8eaed',
    fontSize: 13,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    outline: 'none',
  },
};

export default ClockOutTimer;
