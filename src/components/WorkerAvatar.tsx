// ============================================================
// Work Clicker — Worker Avatar (Animated ASCII Character)
// ============================================================

import React, { useState, useEffect } from 'react';

interface WorkerAvatarProps {
  shiftStart: number;
  clockOutTime: number;
  isOnShift: boolean;
}

interface WorkerState {
  emoji: string;
  accessory: string;
  message: string;
  animation: string;
  mood: string;
}

function getWorkerState(shiftStart: number, clockOutTime: number, isOnShift: boolean, now: number): WorkerState {
  if (!isOnShift) {
    return {
      emoji: '\uD83D\uDE34',
      accessory: '',
      message: 'Zzz... not clocked in yet...',
      animation: 'worker-float',
      mood: 'sleeping',
    };
  }

  const totalDuration = clockOutTime - shiftStart;
  const elapsed = now - shiftStart;
  const progress = totalDuration > 0 ? elapsed / totalDuration : 0;
  const remaining = clockOutTime - now;

  // Shift complete (overtime)
  if (remaining < 0) {
    const overtimeMin = Math.abs(remaining) / 60000;
    if (overtimeMin > 30) {
      return {
        emoji: '\uD83D\uDE2D',
        accessory: '\uD83D\uDCCB',
        message: 'WHY AM I STILL HERE?!',
        animation: 'worker-shake',
        mood: 'overtime-bad',
      };
    }
    return {
      emoji: '\uD83D\uDE2D',
      accessory: '\u23F0',
      message: 'Overtime... send help...',
      animation: 'worker-shake',
      mood: 'overtime',
    };
  }

  // Last 5 minutes
  if (remaining < 5 * 60 * 1000) {
    return {
      emoji: '\uD83E\uDD29',
      accessory: '\uD83C\uDF89',
      message: 'ALMOST FREE!!!',
      animation: 'worker-bounce',
      mood: 'excited',
    };
  }

  // Almost done (75-95%)
  if (progress >= 0.75) {
    return {
      emoji: '\uD83D\uDE2C',
      accessory: '\uD83D\uDC40\u23F0',
      message: 'Watching the clock...',
      animation: 'worker-wiggle',
      mood: 'anxious',
    };
  }

  // Late shift (50-75%)
  if (progress >= 0.5) {
    return {
      emoji: '\uD83D\uDE30',
      accessory: '\uD83D\uDCC4\uD83D\uDCA6',
      message: 'So many deadlines...',
      animation: 'worker-shake',
      mood: 'stressed',
    };
  }

  // Mid shift (25-50%)
  if (progress >= 0.25) {
    return {
      emoji: '\uD83D\uDE24',
      accessory: '\u2328\uFE0F\uD83D\uDCA8',
      message: 'In the zone!',
      animation: 'worker-pulse',
      mood: 'focused',
    };
  }

  // Start of shift (0-25%)
  return {
    emoji: '\uD83D\uDE10',
    accessory: '\u2615',
    message: 'Just got here... need coffee...',
    animation: 'worker-float',
    mood: 'arriving',
  };
}

const WorkerAvatar: React.FC<WorkerAvatarProps> = ({ shiftStart, clockOutTime, isOnShift }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  const state = getWorkerState(shiftStart, clockOutTime, isOnShift, now);

  // Check for shift complete celebration
  const remaining = clockOutTime - now;
  const isComplete = isOnShift && remaining < 0 && remaining > -2000;

  return (
    <div className="worker-avatar-container">
      {/* Speech bubble */}
      <div className={`worker-speech-bubble ${state.mood}`}>
        <span>{state.message}</span>
      </div>

      {/* Character */}
      <div className={`worker-character ${state.animation}`}>
        <span className="worker-emoji">{state.emoji}</span>
        <span className="worker-accessory">{state.accessory}</span>
      </div>

      {/* Confetti for celebration states */}
      {(state.mood === 'excited' || isComplete) && (
        <div className="worker-confetti">
          <span className="confetti-piece c1">{'\uD83C\uDF8A'}</span>
          <span className="confetti-piece c2">{'\u2728'}</span>
          <span className="confetti-piece c3">{'\uD83C\uDF89'}</span>
          <span className="confetti-piece c4">{'\uD83C\uDF8A'}</span>
          <span className="confetti-piece c5">{'\u2728'}</span>
        </div>
      )}
    </div>
  );
};

export default WorkerAvatar;
