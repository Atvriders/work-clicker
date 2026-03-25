// ============================================================
// Work Clicker — Worker Avatar ("Late Night at the Office")
// Worker at desk with glowing monitor, coffee cup, sticky note speech bubbles
// ============================================================

import React, { useState, useEffect, useRef } from 'react';

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
  monitorContent: string;
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
      monitorContent: '\u23FB',
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
        monitorContent: '\uD83D\uDD25',
      };
    }
    return {
      emoji: '\uD83D\uDE2D',
      accessory: '\u23F0',
      message: pickRandom(OVERTIME_LINES),
      animation: 'worker-shake',
      mood: 'overtime',
      monitorContent: '\u23F0',
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
      monitorContent: '\uD83C\uDF89',
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
      monitorContent: '\uD83D\uDD52',
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
      monitorContent: '\uD83D\uDCE7',
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
      monitorContent: '\uD83D\uDCBB',
    };
  }

  // Start of shift (0-25%)
  return {
    emoji: '\uD83D\uDE10',
    accessory: '\u2615',
    message: pickRandom(ARRIVING_LINES),
    animation: 'worker-float',
    mood: 'arriving',
    monitorContent: '\uD83D\uDCE7',
  };
}

const WorkerAvatar: React.FC<WorkerAvatarProps> = ({ shiftStart, clockOutTime, isOnShift }) => {
  const [now, setNow] = useState(Date.now());
  const [messageKey, setMessageKey] = useState(0);
  const [speechOpacity, setSpeechOpacity] = useState(1);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  // Rotate speech bubbles every 5 seconds with fade in/out
  useEffect(() => {
    // Initial fade in
    setSpeechOpacity(1);

    const interval = setInterval(() => {
      // Start fade out at 4s (700ms fade out duration)
      setSpeechOpacity(0);
      fadeTimerRef.current = setTimeout(() => {
        // After fade out completes, change message and fade in
        setMessageKey((k) => k + 1);
        setSpeechOpacity(1);
      }, 700);
    }, 5000);

    return () => {
      clearInterval(interval);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const state = getWorkerState(shiftStart, clockOutTime, isOnShift, now);

  // Celebration check
  const remaining = clockOutTime - now;
  const isComplete = isOnShift && remaining < 0 && remaining > -2000;

  return (
    <div style={styles.container}>
      {/* Speech bubble — sticky note style */}
      <div
        key={messageKey}
        style={{
          ...styles.speechBubble,
          opacity: speechOpacity,
          transition: speechOpacity === 1 ? 'opacity 0.3s ease-in' : 'opacity 0.7s ease-out',
        }}
        className={`worker-speech-bubble ${state.mood}`}
      >
        <span style={styles.speechText}>{state.message}</span>
      </div>

      {/* Character sitting behind desk */}
      <div style={styles.sceneWrap}>
        {/* Worker */}
        <div className={`worker-character ${state.animation}`} style={styles.characterWrap}>
          <span style={styles.workerEmoji}>{state.emoji}</span>
          {state.accessory && <span style={styles.accessory}>{state.accessory}</span>}
        </div>

        {/* Desk surface */}
        <div style={styles.desk}>
          {/* Monitor on desk */}
          <div style={styles.monitor}>
            <span style={styles.monitorContent}>{state.monitorContent}</span>
          </div>
          {/* Coffee cup always on desk */}
          <span style={styles.coffee}>&#9749;</span>
        </div>
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

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '8px 0',
  },
  speechBubble: {
    background: '#FFEB3B',
    color: '#1A1A1E',
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: 6,
    transform: 'rotate(1deg)',
    boxShadow: '2px 3px 8px rgba(0,0,0,0.35)',
    maxWidth: 220,
    textAlign: 'center' as const,
    lineHeight: 1.35,
  },
  speechText: {
    color: '#1A1A1E',
  },
  sceneWrap: {
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    marginTop: 2,
  },
  characterWrap: {
    position: 'relative' as const,
    zIndex: 2,
    marginBottom: -10,
  },
  workerEmoji: {
    fontSize: 48,
    display: 'block',
    lineHeight: 1,
  },
  accessory: {
    position: 'absolute' as const,
    fontSize: 18,
    top: -2,
    right: -14,
  },
  desk: {
    position: 'relative' as const,
    width: 160,
    height: 28,
    background: '#333338',
    borderRadius: 4,
    zIndex: 3,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  },
  monitor: {
    position: 'absolute' as const,
    top: -22,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 40,
    height: 20,
    background: '#23232a',
    borderRadius: 3,
    border: '1.5px solid #444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 12px rgba(79,195,247,0.35), 0 0 4px rgba(79,195,247,0.2)',
    zIndex: 4,
  },
  monitorContent: {
    fontSize: 11,
    lineHeight: 1,
  },
  coffee: {
    position: 'absolute' as const,
    right: 12,
    top: -14,
    fontSize: 16,
    zIndex: 5,
  },
};

export default WorkerAvatar;
