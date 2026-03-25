// ============================================================
// Work Clicker — "DO WORK" Button ("Golden Hour Office")
// Large pill, amber gradient, floating WP feedback
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
    const x = 25 + Math.random() * 50;
    const y = 5 + Math.random() * 15;
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
          transform: isPressed ? 'scale(0.95)' : 'scale(1)',
          boxShadow: isPressed
            ? '0 2px 8px rgba(232, 144, 12, 0.3), inset 0 2px 4px rgba(0,0,0,0.1)'
            : '0 4px 16px rgba(232, 144, 12, 0.25), 0 2px 6px rgba(232, 144, 12, 0.15)',
        }}
        onClick={handleClick}
      >
        <span style={styles.buttonLabel}>DO WORK</span>
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

      <span style={styles.hint}>
        +{wpPerClick.toFixed(1)} WP per click &middot; or press SPACEBAR
      </span>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '8px 0',
  },
  button: {
    width: 260,
    height: 64,
    background: 'linear-gradient(135deg, #E8900C 0%, #D07E08 100%)',
    border: 'none',
    borderRadius: 32,
    color: '#FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    userSelect: 'none',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonLabel: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 4,
    color: '#FFFFFF',
    fontFamily: "'Source Sans 3', sans-serif",
  },
  floater: {
    position: 'absolute',
    color: '#E8900C',
    fontSize: 18,
    fontWeight: 700,
    fontFamily: "'Source Sans 3', sans-serif",
    pointerEvents: 'none',
    animation: 'float-up 1s ease-out forwards',
    zIndex: 10,
  },
  hint: {
    fontSize: 12,
    color: '#B5AFA6',
    letterSpacing: 0.3,
    fontWeight: 400,
  },
};

export default WorkButton;
