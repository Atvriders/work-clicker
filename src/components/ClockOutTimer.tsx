// ============================================================
// Work Clicker — Clock-Out Timer ("Golden Hour Office")
// Compact warm bar with amber progress
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

  // Color logic
  let timerColor = '#4A8B5C'; // success green
  let isPulsing = false;
  if (isOvertime) {
    timerColor = '#C45A3C';
    isPulsing = true;
  } else if (remaining < 30 * 60 * 1000) {
    timerColor = '#C45A3C';
    if (remaining < 5 * 60 * 1000) isPulsing = true;
  } else if (remaining < 2 * 60 * 60 * 1000) {
    timerColor = '#E8900C';
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
      <div style={styles.container} className="warm-card">
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
    <div style={styles.container} className="warm-card">
      <div style={styles.mainRow}>
        {/* Status label */}
        <span style={styles.statusLabel}>
          {isOvertime ? 'OVERTIME' : 'CLOCK-OUT IN'}
        </span>

        {/* Countdown */}
        <span
          className="tabular-nums"
          style={{
            ...styles.countdown,
            color: timerColor,
            animation: isPulsing ? 'gentle-pulse 1s ease-in-out infinite' : 'none',
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
              background: `linear-gradient(90deg, #E8900C, ${timerColor})`,
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
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '10px 18px',
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
    color: '#B5AFA6',
    textTransform: 'uppercase',
    fontWeight: 600,
    flexShrink: 0,
  },
  countdown: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 1,
    flexShrink: 0,
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  progressTrack: {
    flex: 1,
    height: 8,
    background: '#F5F0E8',
    borderRadius: 4,
    overflow: 'hidden',
    minWidth: 80,
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
    fontSize: 11,
    color: '#B5AFA6',
    letterSpacing: 0.5,
    fontWeight: 600,
  },
  timeInput: {
    padding: '5px 10px',
    background: '#FDFAF5',
    border: '1px solid #E8E2D8',
    borderRadius: 8,
    color: '#2D2A26',
    fontSize: 13,
    fontFamily: "'Source Sans 3', sans-serif",
    outline: 'none',
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
    color: '#B5AFA6',
    fontWeight: 600,
  },
  startButton: {
    padding: '10px 28px',
    background: 'linear-gradient(135deg, #E8900C, #D07E08)',
    border: 'none',
    borderRadius: 24,
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: "'Source Sans 3', sans-serif",
    fontWeight: 700,
    letterSpacing: 2,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(232, 144, 12, 0.25)',
  },
};

export default ClockOutTimer;
