// ============================================================
// Work Clicker — Worker Avatar ("Golden Hour Office")
// Bigger, more expressive, with desk illustration
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

const SLEEP_LINES = [
  'Zzz... not clocked in yet...',
  'Alarm didn\'t go off...',
  'Five more minutes...',
  'Is it Monday already?',
];

const ARRIVING_LINES = [
  'Just got here... need coffee...',
  'Where\'s the coffee machine?',
  'Morning... *yawns*',
  'Who schedules 9am meetings?',
  'Let me check my emails first...',
];

const FOCUSED_LINES = [
  'In the zone!',
  'Don\'t talk to me, I\'m coding.',
  'This sprint is going great!',
  'Actually enjoying this task.',
  'Flow state achieved.',
];

const STRESSED_LINES = [
  'So many deadlines...',
  'Who approved this timeline?!',
  'The build is broken again.',
  'Three meetings back to back...',
  'I need a vacation.',
];

const ANXIOUS_LINES = [
  'Watching the clock...',
  'Is it 5 yet?',
  'Almost there...',
  'Can time move faster please?',
  'Packing up mentally...',
];

const EXCITED_LINES = [
  'ALMOST FREE!!!',
  'FREEDOM IS SO CLOSE!',
  'Shutting down in T-minus...',
  'Already thinking about dinner!',
];

const OVERTIME_LINES = [
  'Overtime... send help...',
  'Everyone else already left...',
  'The office lights dimmed...',
  'My chair is my home now.',
];

const OVERTIME_BAD_LINES = [
  'WHY AM I STILL HERE?!',
  'This is a hostage situation.',
  'I forgot what sunlight looks like.',
  'Do I even have a life outside?',
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getWorkerState(shiftStart: number, clockOutTime: number, isOnShift: boolean, now: number): WorkerState {
  if (!isOnShift) {
    return {
      emoji: '\uD83D\uDE34',
      accessory: '',
      message: pickRandom(SLEEP_LINES),
      animation: 'worker-float',
      mood: 'sleeping',
    };
  }

  const totalDuration = clockOutTime - shiftStart;
  const elapsed = now - shiftStart;
  const progress = totalDuration > 0 ? elapsed / totalDuration : 0;
  const remaining = clockOutTime - now;

  // Overtime
  if (remaining < 0) {
    const overtimeMin = Math.abs(remaining) / 60000;
    if (overtimeMin > 30) {
      return {
        emoji: '\uD83D\uDE2D',
        accessory: '\uD83D\uDCCB',
        message: pickRandom(OVERTIME_BAD_LINES),
        animation: 'worker-shake',
        mood: 'overtime-bad',
      };
    }
    return {
      emoji: '\uD83D\uDE2D',
      accessory: '\u23F0',
      message: pickRandom(OVERTIME_LINES),
      animation: 'worker-shake',
      mood: 'overtime',
    };
  }

  // Last 5 minutes
  if (remaining < 5 * 60 * 1000) {
    return {
      emoji: '\uD83E\uDD29',
      accessory: '\uD83C\uDF89',
      message: pickRandom(EXCITED_LINES),
      animation: 'worker-bounce',
      mood: 'excited',
    };
  }

  // Almost done (75-95%)
  if (progress >= 0.75) {
    return {
      emoji: '\uD83D\uDE2C',
      accessory: '\u23F0',
      message: pickRandom(ANXIOUS_LINES),
      animation: 'worker-wiggle',
      mood: 'anxious',
    };
  }

  // Late shift (50-75%)
  if (progress >= 0.5) {
    return {
      emoji: '\uD83D\uDE24',
      accessory: '\uD83D\uDCC4',
      message: pickRandom(STRESSED_LINES),
      animation: 'worker-shake',
      mood: 'stressed',
    };
  }

  // Mid shift (25-50%)
  if (progress >= 0.25) {
    return {
      emoji: '\uD83E\uDDD1\u200D\uD83D\uDCBB',
      accessory: '',
      message: pickRandom(FOCUSED_LINES),
      animation: 'worker-pulse',
      mood: 'focused',
    };
  }

  // Start of shift (0-25%)
  return {
    emoji: '\uD83D\uDE10',
    accessory: '\u2615',
    message: pickRandom(ARRIVING_LINES),
    animation: 'worker-float',
    mood: 'arriving',
  };
}

const WorkerAvatar: React.FC<WorkerAvatarProps> = ({ shiftStart, clockOutTime, isOnShift }) => {
  const [now, setNow] = useState(Date.now());
  const [messageKey, setMessageKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  // Rotate speech bubbles every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => setMessageKey((k) => k + 1), 6000);
    return () => clearInterval(interval);
  }, []);

  const state = getWorkerState(shiftStart, clockOutTime, isOnShift, now);

  // Celebration check
  const remaining = clockOutTime - now;
  const isComplete = isOnShift && remaining < 0 && remaining > -2000;

  return (
    <div className="worker-avatar-container">
      {/* Speech bubble */}
      <div key={messageKey} className={`worker-speech-bubble ${state.mood}`}>
        <span>{state.message}</span>
      </div>

      {/* Character */}
      <div className={`worker-character ${state.animation}`}>
        <span className="worker-emoji">{state.emoji}</span>
        {state.accessory && <span className="worker-accessory">{state.accessory}</span>}
      </div>

      {/* Subtle desk */}
      <div className="worker-desk" />

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
