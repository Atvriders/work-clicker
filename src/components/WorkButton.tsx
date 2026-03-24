// ============================================================
// Work Clicker — Main "DO WORK" Click Button (Modern Office)
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';

interface FloatingText {
  id: number;
  value: string;
  x: number;
  y: number;
}

interface WorkButtonProps {
  wpPerClick: number;
  onWork: () => void;
}

let floatIdCounter = 0;

const WorkButton: React.FC<WorkButtonProps> = ({ wpPerClick, onWork }) => {
  const [floaters, setFloaters] = useState<FloatingText[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback((e?: React.MouseEvent) => {
    onWork();

    // Floating text
    const id = ++floatIdCounter;
    const x = 30 + Math.random() * 40;
    const y = 5 + Math.random() * 20;
    setFloaters((prev) => [...prev.slice(-8), { id, value: `+${wpPerClick.toFixed(1)} WP`, x, y }]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id));
    }, 1000);

    // Press animation
    setIsPressed(true);
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => setIsPressed(false), 150);
  }, [onWork, wpPerClick]);

  // Spacebar trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        handleClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClick]);

  return (
    <div style={styles.wrapper}>
      <button
        ref={buttonRef}
        style={{
          ...styles.button,
          transform: isPressed ? 'scale(0.96)' : 'scale(1)',
          boxShadow: isPressed
            ? '0 2px 8px rgba(26, 115, 232, 0.4), 0 0 30px rgba(26, 115, 232, 0.2), inset 0 2px 4px rgba(0,0,0,0.2)'
            : '0 4px 16px rgba(26, 115, 232, 0.3), 0 0 40px rgba(26, 115, 232, 0.1)',
        }}
        onClick={handleClick}
      >
        <span style={styles.buttonIcon}>{'\uD83D\uDCBC'}</span>
        <span style={styles.buttonLabel}>DO WORK</span>
        <span style={styles.buttonSub}>+{wpPerClick.toFixed(1)} WP per click</span>
      </button>

      {/* Floating "+X WP" text */}
      {floaters.map((f) => (
        <div
          key={f.id}
          style={{
            ...styles.floater,
            left: `${f.x}%`,
            top: `${f.y}%`,
          }}
        >
          {f.value}
        </div>
      ))}

      <span style={styles.hint}>or press SPACEBAR</span>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '8px 0',
  },
  button: {
    width: 240,
    height: 80,
    background: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 50%, #1a73e8 100%)',
    border: 'none',
    borderRadius: 12,
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    transition: 'all 0.15s ease',
    userSelect: 'none',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonIcon: {
    fontSize: 18,
    lineHeight: 1,
  },
  buttonLabel: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: 3,
    color: '#ffffff',
  },
  buttonSub: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 0.5,
    fontWeight: 500,
  },
  floater: {
    position: 'absolute',
    color: '#1a73e8',
    fontSize: 18,
    fontWeight: 700,
    pointerEvents: 'none',
    animation: 'float-up 1s ease-out forwards',
    textShadow: '0 0 12px rgba(26, 115, 232, 0.6)',
    zIndex: 10,
  },
  hint: {
    fontSize: 10,
    color: '#9aa0a6',
    opacity: 0.4,
    letterSpacing: 0.5,
    fontWeight: 500,
  },
};

export default WorkButton;
