// ============================================================
// Work Clicker — Event Popup (Toast-Style, Slide from Right)
// ============================================================

import React, { useEffect, useState } from 'react';
import { ActiveEvent, RandomEvent } from '../types';

const COLORS = {
  green: '#34a853',
  red: '#ea4335',
  amber: '#fbbc04',
  text: '#e8eaed',
  muted: '#9aa0a6',
};

interface EventPopupProps {
  activeEvent: ActiveEvent | null;
  eventDefs: RandomEvent[];
}

const EventPopup: React.FC<EventPopupProps> = ({ activeEvent, eventDefs }) => {
  const [visible, setVisible] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const eventDef = activeEvent
    ? eventDefs.find((e) => e.id === activeEvent.event.id)
    : null;
  const isPositive = eventDef?.isPositive ?? true;
  const accentColor = isPositive ? COLORS.green : COLORS.red;

  useEffect(() => {
    if (activeEvent) {
      const total = activeEvent.endTime - Date.now();
      setTotalDuration(total > 0 ? total : 1);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [activeEvent?.event.id]);

  useEffect(() => {
    if (!activeEvent) return;
    const interval = setInterval(() => {
      const r = Math.max(0, activeEvent.endTime - Date.now());
      setRemaining(r);
      if (r <= 0) {
        setVisible(false);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [activeEvent]);

  const progress = totalDuration > 0 ? remaining / totalDuration : 0;

  if (!activeEvent || !eventDef) return null;

  const secs = Math.ceil(remaining / 1000);

  return (
    <div
      style={{
        ...styles.wrapper,
        animation: visible ? 'slide-in-right 0.4s ease-out' : 'slide-out-right 0.3s ease-in',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          ...styles.banner,
          borderLeft: `3px solid ${accentColor}`,
          boxShadow: `0 4px 24px rgba(0, 0, 0, 0.4), 0 0 12px ${accentColor}15`,
        }}
        className="glass-card"
      >
        <div style={styles.header}>
          <span style={styles.icon}>{eventDef.icon}</span>
          <span style={{ ...styles.name, color: accentColor }}>{eventDef.name}</span>
          <span style={styles.timer}>{secs}s</span>
        </div>
        <div style={styles.description}>{eventDef.description}</div>
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressBar,
              background: accentColor,
              boxShadow: `0 0 6px ${accentColor}80`,
              width: `${progress * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'fixed',
    top: 56,
    right: 16,
    zIndex: 1000,
    width: 340,
    maxWidth: '90vw',
  },
  banner: {
    padding: 14,
    borderRadius: 10,
    borderLeft: '3px solid #34a853',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  icon: {
    fontSize: 20,
  },
  name: {
    fontSize: 14,
    fontWeight: 700,
    flex: 1,
  },
  timer: {
    fontSize: 12,
    color: COLORS.amber,
    fontWeight: 700,
  },
  description: {
    fontSize: 11,
    color: COLORS.muted,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  progressTrack: {
    height: 3,
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.1s linear',
  },
};

export default EventPopup;
