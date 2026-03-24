// ============================================================
// Work Clicker — Event Popup (Slide-Down Banner)
// ============================================================

import React, { useEffect, useState } from 'react';
import { ActiveEvent, RandomEvent } from '../types';

const COLORS = {
  blue: '#1a73e8',
  green: '#34a853',
  red: '#ea4335',
  amber: '#fbbc04',
  card: '#1a2332',
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

  // Find event definition for display info
  const eventDef = activeEvent
    ? eventDefs.find((e) => e.id === activeEvent.event.id)
    : null;
  const isPositive = eventDef?.isPositive ?? true;
  const borderColor = isPositive ? COLORS.green : COLORS.red;

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

  const dynamicStyles: Record<string, React.CSSProperties> = {
    wrapper: {
      position: 'fixed',
      top: 0,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '-100%'})`,
      transition: 'transform 0.4s ease-in-out',
      zIndex: 1000,
      width: '90%',
      maxWidth: 500,
      pointerEvents: visible ? 'auto' : 'none',
    },
    banner: {
      background: COLORS.card,
      border: `2px solid ${borderColor}`,
      borderTop: 'none',
      borderRadius: '0 0 8px 8px',
      padding: 16,
      boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 15px ${isPositive ? 'rgba(52,168,83,0.2)' : 'rgba(234,67,53,0.2)'}`,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    icon: {
      fontSize: 22,
    },
    name: {
      fontSize: 16,
      fontWeight: 'bold',
      color: borderColor,
      textShadow: `0 0 8px ${borderColor}`,
      flex: 1,
    },
    timer: {
      fontSize: 13,
      color: COLORS.amber,
      fontWeight: 'bold',
    },
    description: {
      fontSize: 12,
      color: COLORS.muted,
      marginBottom: 10,
      lineHeight: 1.4,
    },
    progressTrack: {
      height: 4,
      background: 'rgba(255,255,255,0.1)',
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      background: borderColor,
      borderRadius: 2,
      transition: 'width 0.1s linear',
      boxShadow: `0 0 6px ${borderColor}`,
      width: `${progress * 100}%`,
    },
  };

  return (
    <div style={dynamicStyles.wrapper}>
      <div style={dynamicStyles.banner}>
        <div style={dynamicStyles.header}>
          <span style={dynamicStyles.icon}>{eventDef.icon}</span>
          <span style={dynamicStyles.name}>{eventDef.name}</span>
          <span style={dynamicStyles.timer}>{secs}s</span>
        </div>
        <div style={dynamicStyles.description}>{eventDef.description}</div>
        <div style={dynamicStyles.progressTrack}>
          <div style={dynamicStyles.progressBar} />
        </div>
      </div>
    </div>
  );
};

export default EventPopup;
