// ============================================================
// Work Clicker — "DO WORK" Button ("Late Night at the Office")
// Stamp-style — large square, yellow, stamp-press animation
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
          transform: isPressed ? 'scale(0.92) rotate(-1.5deg)' : 'scale(1)',
          boxShadow: isPressed
            ? '0 2px 4px rgba(0,0,0,0.5), inset 0 2px 4px rgba(0,0,0,0.2)'
            : '0 6px 20px rgba(232,212,77,0.2), 0 2px 8px rgba(0,0,0,0.4)',
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
    width: 160,
    height: 160,
    background: '#E8D44D',
    border: '3px solid #4A3F2F',
    borderRadius: 12,
    color: '#1A1A1E',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.12s ease',
    userSelect: 'none',
    position: 'relative',
    overflow: 'hidden',
    borderBottom: '5px solid #4A3F2F',
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 3,
    color: '#1A1A1E',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  floater: {
    position: 'absolute',
    color: '#E8D44D',
    fontSize: 18,
    fontWeight: 700,
    fontFamily: "'IBM Plex Mono', monospace",
    pointerEvents: 'none',
    animation: 'float-up 1s ease-out forwards',
    zIndex: 10,
    textShadow: '0 0 8px rgba(232,212,77,0.5)',
  },
  hint: {
    fontSize: 12,
    color: '#6B6860',
    letterSpacing: 0.3,
    fontWeight: 400,
    fontFamily: "'IBM Plex Mono', monospace",
  },
};

export default WorkButton;
