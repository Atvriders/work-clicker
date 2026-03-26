// ============================================================
// Work Clicker — "Corporate Dystopia Brutalism" Work Button
// Circular, amber-glow, stamp-press animation
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
  isOnShift: boolean;
  clockOutTime: number;
}

let floatIdCounter = 0;

const WorkButton: React.FC<WorkButtonProps> = ({ wpPerClick, onWork, isOnShift, clockOutTime }) => {
  const [floaters, setFloaters] = useState<FloatingText[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [borderFlash, setBorderFlash] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOvertime = isOnShift && clockOutTime > 0 && Date.now() > clockOutTime;
  const disabled = !isOnShift;

  // Detect if likely desktop (no touch support)
  const isDesktop = typeof window !== 'undefined' && !('ontouchstart' in window);

  const handleClick = useCallback((e?: React.MouseEvent) => {
    if (disabled) return;
    onWork();

    // Floating text
    const id = ++floatIdCounter;
    const x = 20 + Math.random() * 60;
    const y = 0 + Math.random() * 15;
    setFloaters((prev) => [...prev.slice(-8), { id, value: `+${wpPerClick.toFixed(1)} WP`, x, y }]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id));
    }, 1000);

    // Press animation
    setIsPressed(true);
    if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => setIsPressed(false), 150);

    // Border flash
    setBorderFlash(true);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setBorderFlash(false), 120);
  }, [onWork, wpPerClick, disabled]);

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

  // Colors based on state
  const accentColor = isOvertime ? '#E84D4D' : '#E8D44D';
  const accentDim = isOvertime ? 'rgba(232,77,77,0.25)' : 'rgba(232,212,77,0.15)';
  const accentGlow = isOvertime ? 'rgba(232,77,77,0.5)' : 'rgba(232,212,77,0.35)';

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '8px 0',
  };

  const buttonStyle: React.CSSProperties = {
    width: 140,
    height: 140,
    borderRadius: '50%',
    background: disabled
      ? 'radial-gradient(circle at 50% 45%, #3A3A3E 0%, #1A1A1E 70%)'
      : `radial-gradient(circle at 50% 45%, ${isOvertime ? '#8B2020' : '#B8A020'} 0%, ${isOvertime ? '#4A1515' : '#4A3F2F'} 55%, #1A1A1E 100%)`,
    border: `3px solid ${disabled ? '#4A4A4E' : borderFlash ? '#FFFFFF' : accentColor}`,
    boxShadow: disabled
      ? 'none'
      : isPressed
        ? `0 0 10px ${accentDim}, inset 0 2px 8px rgba(0,0,0,0.4)`
        : `0 0 20px ${accentDim}, 0 0 40px ${accentGlow}`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    transition: 'transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease, border-color 0.1s ease',
    transform: isPressed ? 'scale(0.92)' : 'scale(1)',
    userSelect: 'none',
    position: 'relative',
    overflow: 'visible',
    outline: 'none',
    opacity: disabled ? 0.5 : 1,
    padding: 0,
  };

  const topLabelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: disabled ? '#9AA8B8' : accentColor,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    marginBottom: 2,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: 32,
    lineHeight: 1,
    filter: disabled ? 'grayscale(1)' : 'none',
  };

  const wpLabelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: disabled ? '#7A8899' : accentColor,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    marginTop: 2,
    letterSpacing: 0.5,
  };

  const floaterStyle: React.CSSProperties = {
    position: 'absolute',
    color: accentColor,
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
    pointerEvents: 'none',
    animation: 'float-up 1s ease-out forwards',
    zIndex: 10,
    textShadow: `0 0 8px ${accentGlow}`,
  };

  const hintStyle: React.CSSProperties = {
    fontSize: 11,
    color: '#7A8899',
    letterSpacing: 0.5,
    fontWeight: 400,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
    textTransform: 'uppercase',
  };

  return (
    <div style={wrapperStyle}>
      <button
        ref={buttonRef}
        style={buttonStyle}
        onClick={handleClick}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow = `0 0 30px ${accentDim}, 0 0 60px ${accentGlow}`;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = `0 0 20px ${accentDim}, 0 0 40px ${accentGlow}`;
          }
        }}
      >
        <span style={topLabelStyle}>
          {disabled ? 'PUNCH IN' : isOvertime ? 'OVERTIME' : 'CLOCK IN'}
        </span>
        <span style={iconStyle}>
          {disabled ? '🚫' : isOvertime ? '🔥' : '💼'}
        </span>
        <span style={wpLabelStyle}>
          {disabled ? 'FIRST' : `+${wpPerClick.toFixed(1)} WP`}
        </span>
      </button>

      {/* Floating "+X WP" text */}
      {floaters.map((f) => (
        <div
          key={f.id}
          style={{
            ...floaterStyle,
            left: `${f.x}%`,
            top: `${f.y}%`,
          }}
        >
          {f.value}
        </div>
      ))}

      {/* Desktop-only spacebar hint */}
      {isDesktop && (
        <span style={hintStyle}>
          {disabled ? 'punch in first' : 'spacebar to work'}
        </span>
      )}
    </div>
  );
};

export default WorkButton;
