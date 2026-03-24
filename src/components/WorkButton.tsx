// ============================================================
// Work Clicker — Main "DO WORK" Click Button
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

const COLORS = {
  blue: '#1a73e8',
  card: '#1a2332',
  border: 'rgba(26,115,232,0.2)',
  text: '#e8eaed',
  muted: '#9aa0a6',
};

let floatIdCounter = 0;

const WorkButton: React.FC<WorkButtonProps> = ({ wpPerClick, onWork }) => {
  const [floaters, setFloaters] = useState<FloatingText[]>([]);
  const [isGlowing, setIsGlowing] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const glowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    onWork();

    // Floating text
    const id = ++floatIdCounter;
    const x = 40 + Math.random() * 20; // % from left
    const y = 10 + Math.random() * 20;  // % from top
    setFloaters((prev) => [...prev.slice(-8), { id, value: `+${wpPerClick.toFixed(1)} WP`, x, y }]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id));
    }, 1000);

    // Glow
    setIsGlowing(true);
    if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
    glowTimerRef.current = setTimeout(() => setIsGlowing(false), 200);
  }, [onWork, wpPerClick]);

  // Spacebar trigger (skip if typing in an input)
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
          boxShadow: isGlowing
            ? '0 0 20px rgba(26,115,232,0.6), 0 0 40px rgba(26,115,232,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
            : '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
          borderColor: isGlowing ? '#4da3ff' : 'rgba(26,115,232,0.3)',
          transform: isGlowing ? 'scale(0.97)' : 'scale(1)',
        }}
        onClick={handleClick}
      >
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

      <style>{`
        @keyframes float-up {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          60% { opacity: 0.7; transform: translateY(-40px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-80px) scale(0.8); }
        }
      `}</style>
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
    padding: '16px 0',
  },
  button: {
    width: 220,
    height: 100,
    background: 'linear-gradient(180deg, #243447 0%, #1a2332 100%)',
    border: '2px solid rgba(26,115,232,0.3)',
    borderRadius: 12,
    color: COLORS.text,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    transition: 'all 0.1s ease',
    userSelect: 'none',
    position: 'relative',
  },
  buttonLabel: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: 4,
    color: '#e8eaed',
    textShadow: '0 0 10px rgba(26,115,232,0.4)',
  },
  buttonSub: {
    fontSize: 11,
    color: COLORS.muted,
    letterSpacing: 1,
  },
  floater: {
    position: 'absolute',
    color: COLORS.blue,
    fontSize: 18,
    fontWeight: 700,
    pointerEvents: 'none',
    animation: 'float-up 1s ease-out forwards',
    textShadow: '0 0 8px rgba(26,115,232,0.6)',
    zIndex: 10,
  },
  hint: {
    fontSize: 10,
    color: COLORS.muted,
    opacity: 0.5,
    letterSpacing: 1,
  },
};

export default WorkButton;
