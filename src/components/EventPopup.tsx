// ============================================================
// Work Clicker — Event Popup ("Corporate Dystopia Brutalism")
// Floating notification bar — slides down from top of work zone
// ============================================================

import React, { useEffect, useState } from 'react';
import { ActiveEvent, RandomEvent } from '../types';

interface EventPopupProps {
  activeEvent: ActiveEvent | null;
  eventDefs: RandomEvent[];
}

const POSITIVE_COLOR = '#00FF66';
const NEGATIVE_COLOR = '#FF2E2E';

const EventPopup: React.FC<EventPopupProps> = ({ activeEvent, eventDefs }) => {
  const [visible, setVisible] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  const eventDef = activeEvent
    ? eventDefs.find((e) => e.id === activeEvent.event.id)
    : null;
  const isPositive = eventDef?.isPositive ?? true;

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
  const accentColor = isPositive ? POSITIVE_COLOR : NEGATIVE_COLOR;

  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 400,
    margin: '0 auto',
    flexShrink: 0,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(-20px)',
    transition: 'opacity 0.35s ease-out, transform 0.35s ease-out',
    pointerEvents: visible ? 'auto' : 'none',
  };

  const barStyle: React.CSSProperties = {
    position: 'relative',
    background: 'var(--bg-card, #1E1E22)',
    borderLeft: `3px solid ${accentColor}`,
    borderRadius: 0,
    padding: '10px 14px 12px 14px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  };

  const topRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: 20,
    flexShrink: 0,
    lineHeight: 1,
  };

  const centerStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  };

  const nameStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'var(--text-primary, #E8E6E1)',
    lineHeight: 1.2,
  };

  const descStyle: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--text-secondary, #9E9B94)',
    lineHeight: 1.3,
  };

  const timerStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
    fontVariantNumeric: 'tabular-nums',
    color: accentColor,
    flexShrink: 0,
    letterSpacing: 0.5,
  };

  const progressTrackStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    background: 'rgba(255,255,255,0.06)',
  };

  const progressFillStyle: React.CSSProperties = {
    height: '100%',
    width: `${progress * 100}%`,
    background: accentColor,
    transition: 'width 0.1s linear',
  };

  return (
    <div style={wrapperStyle}>
      <div style={barStyle}>
        <div style={topRowStyle}>
          <span style={iconStyle}>{eventDef.icon}</span>
          <div style={centerStyle}>
            <span style={nameStyle}>{eventDef.name}</span>
            <span style={descStyle}>{eventDef.description}</span>
          </div>
          <span style={timerStyle}>{secs}s</span>
        </div>
        <div style={progressTrackStyle}>
          <div style={progressFillStyle} />
        </div>
      </div>
    </div>
  );
};

export default EventPopup;
