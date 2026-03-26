// ============================================================
// Work Clicker — Worker Avatar ("Corporate Dystopia Brutalism")
// Centered brutalist layout: dark tones, amber accents, minimal desk
// ============================================================

import React, { useState, useEffect, useRef } from 'react';

interface WorkerAvatarProps {
  shiftStart: number;
  clockOutTime: number;
  isOnShift: boolean;
}

interface WorkerState {
  emoji: string;
  message: string;
  animationClass: string;
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
      message: pickRandom(SLEEP_LINES),
      animationClass: 'worker-float',
      mood: 'sleeping',
    };
  }

  const totalDuration = clockOutTime - shiftStart;
  const elapsed = now - shiftStart;
  const progress = totalDuration > 0 ? elapsed / totalDuration : 0;
  const remaining = clockOutTime - now;

  // Overtime (bad — >30 min)
  if (remaining < 0) {
    const overtimeMin = Math.abs(remaining) / 60000;
    if (overtimeMin > 30) {
      return {
        emoji: '\uD83D\uDE2D',
        message: pickRandom(OVERTIME_BAD_LINES),
        animationClass: 'worker-shake',
        mood: 'overtime-bad',
      };
    }
    return {
      emoji: '\uD83D\uDE2D',
      message: pickRandom(OVERTIME_LINES),
      animationClass: 'worker-shake',
      mood: 'overtime',
    };
  }

  // Last 5 minutes
  if (remaining < 5 * 60 * 1000) {
    return {
      emoji: '\uD83E\uDD29',
      message: pickRandom(EXCITED_LINES),
      animationClass: 'worker-bounce',
      mood: 'excited',
    };
  }

  // Almost done (75-95%)
  if (progress >= 0.75) {
    return {
      emoji: '\uD83D\uDE2C',
      message: pickRandom(ANXIOUS_LINES),
      animationClass: 'worker-shake',
      mood: 'anxious',
    };
  }

  // Late shift — stressed (60%+)
  if (progress >= 0.6) {
    return {
      emoji: '\uD83D\uDE24',
      message: pickRandom(STRESSED_LINES),
      animationClass: 'worker-shake',
      mood: 'stressed',
    };
  }

  // Mid shift (25-60%)
  if (progress >= 0.25) {
    return {
      emoji: '\uD83E\uDDD1\u200D\uD83D\uDCBB',
      message: pickRandom(FOCUSED_LINES),
      animationClass: 'worker-pulse',
      mood: 'focused',
    };
  }

  // Start of shift (0-25%) — coffee
  return {
    emoji: '\u2615',
    message: pickRandom(ARRIVING_LINES),
    animationClass: '',
    mood: 'arriving',
  };
}

const WorkerAvatar: React.FC<WorkerAvatarProps> = ({ shiftStart, clockOutTime, isOnShift }) => {
  const [now, setNow] = useState(Date.now());
  const [messageKey, setMessageKey] = useState(0);
  const [speechOpacity, setSpeechOpacity] = useState(1);
  const [speechSlide, setSpeechSlide] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [fullMessage, setFullMessage] = useState('');
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  const state = getWorkerState(shiftStart, clockOutTime, isOnShift, now);

  // Set initial message on mount
  useEffect(() => {
    setFullMessage(state.message);
    setDisplayedText('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger slide-up on new message
  useEffect(() => {
    setSpeechSlide(true);
  }, [fullMessage, messageKey]);

  // Typewriter effect: when fullMessage changes, type it out char by char
  useEffect(() => {
    if (!fullMessage) return;

    // Clear any existing timers
    if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    setDisplayedText('');
    setSpeechOpacity(1);
    let charIndex = 0;

    const typeNextChar = () => {
      charIndex++;
      setDisplayedText(fullMessage.slice(0, charIndex));

      if (charIndex < fullMessage.length) {
        typeTimerRef.current = setTimeout(typeNextChar, 50);
      } else {
        // Fully typed — hold for 4 seconds, then fade out over 0.5s, then next message
        holdTimerRef.current = setTimeout(() => {
          setSpeechOpacity(0);
          setSpeechSlide(false);
          fadeTimerRef.current = setTimeout(() => {
            // Pick next message based on current state
            const newState = getWorkerState(shiftStart, clockOutTime, isOnShift, Date.now());
            setFullMessage(newState.message);
            setMessageKey((k) => k + 1);
          }, 500);
        }, 4000);
      }
    };

    typeTimerRef.current = setTimeout(typeNextChar, 50);

    return () => {
      if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [fullMessage, messageKey, shiftStart, clockOutTime, isOnShift]);

  // Celebration check
  const remaining = clockOutTime - now;
  const isComplete = isOnShift && remaining < 0 && remaining > -2000;

  const isOvertime = state.mood === 'overtime' || state.mood === 'overtime-bad';

  return (
    <div style={styles.container}>
      {/* Speech bubble — brutalist dark card with amber border */}
      <div
        key={messageKey}
        style={{
          ...styles.speechBubble,
          opacity: speechOpacity,
          transform: speechSlide ? 'translateY(0)' : 'translateY(6px)',
          transition: speechOpacity === 1
            ? 'opacity 0.3s ease-in, transform 0.3s ease-out'
            : 'opacity 0.5s ease-out, transform 0.5s ease-out',
        }}
      >
        <span style={styles.speechText}>{displayedText}<span style={styles.cursor}>|</span></span>
      </div>

      {/* Worker emoji — centered, with animation class */}
      <div
        className={`worker-character ${state.animationClass}`}
        style={{
          ...styles.workerWrap,
          ...(isOvertime ? { filter: 'saturate(0.6) brightness(0.9)', color: '#FF4444' } : {}),
        }}
      >
        <span style={styles.workerEmoji}>{state.emoji}</span>
      </div>

      {/* Minimal desk — thin line with monitor and coffee */}
      <div style={styles.deskLine}>
        <span style={styles.deskMonitor}>{'\uD83D\uDCBB'}</span>
        <span style={styles.deskCoffee}>{'\u2615'}</span>
      </div>

      {/* Confetti on shift completion — amber/green colored pieces */}
      {(state.mood === 'excited' || isComplete) && (
        <div className="worker-confetti">
          <span className="confetti-piece c1" style={{ color: '#FFB800' }}>{'\u25A0'}</span>
          <span className="confetti-piece c2" style={{ color: '#4CAF50' }}>{'\u25A0'}</span>
          <span className="confetti-piece c3" style={{ color: '#FFB800' }}>{'\u25CF'}</span>
          <span className="confetti-piece c4" style={{ color: '#4CAF50' }}>{'\u25CF'}</span>
          <span className="confetti-piece c5" style={{ color: '#FFB800' }}>{'\u25A0'}</span>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    gap: 8,
  },
  speechBubble: {
    background: 'var(--bg-card)',
    borderLeft: '3px solid var(--accent)',
    padding: '6px 10px',
    maxWidth: 200,
    minHeight: 18,
    textAlign: 'left' as const,
    lineHeight: 1.35,
  },
  speechText: {
    fontFamily: "'DM Sans', 'Inter', sans-serif",
    fontSize: 11,
    color: 'var(--text-secondary)',
    letterSpacing: '0.01em',
  },
  cursor: {
    color: 'var(--accent)',
    fontWeight: 400,
    animation: 'blink-cursor 1s step-end infinite',
  },
  workerWrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerEmoji: {
    fontSize: 48,
    display: 'block',
    lineHeight: 1,
    textAlign: 'center' as const,
  },
  deskLine: {
    position: 'relative' as const,
    width: 120,
    height: 1,
    background: 'var(--text-secondary)',
    opacity: 0.4,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 24,
    marginTop: 2,
  },
  deskMonitor: {
    position: 'absolute' as const,
    top: -16,
    left: 20,
    fontSize: 13,
    opacity: 0.7,
  },
  deskCoffee: {
    position: 'absolute' as const,
    top: -14,
    right: 16,
    fontSize: 11,
    opacity: 0.6,
  },
};

export default WorkerAvatar;
