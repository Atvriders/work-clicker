// ============================================================
// Work Clicker — Event Popup ("Late Night at the Office")
// Sticky note notification — inline, sits above EventLog
// ============================================================

import React, { useEffect, useState } from 'react';
import { ActiveEvent, RandomEvent } from '../types';

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

  const bgColor = isPositive ? '#FFEB3B' : '#F48FB1';
  const rotation = isPositive ? '1deg' : '-1deg';
  const barColor = isPositive ? '#C9B200' : '#C2185B';

  return (
    <div
      style={{
        ...styles.wrapper,
        animation: visible ? 'slide-in 0.4s ease-out' : 'none',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          ...styles.note,
          background: bgColor,
          transform: `rotate(${rotation})`,
        }}
      >
        <div style={styles.topLine}>
          <span style={styles.icon}>{eventDef.icon}</span>
          <span style={styles.name}>{eventDef.name}</span>
          <span style={styles.timer} className="tabular-nums">{secs}s</span>
        </div>
        <div style={styles.description}>{eventDef.description}</div>
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressBar,
              background: barColor,
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
    width: '100%',
    flexShrink: 0,
  },
  note: {
    padding: '8px 12px',
    borderRadius: 4,
    boxShadow: '2px 2px 6px rgba(0,0,0,0.35)',
  },
  topLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 16,
    flexShrink: 0,
  },
  name: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1A1A1E',
    flex: 1,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  timer: {
    fontSize: 12,
    color: '#1A1A1E',
    fontWeight: 700,
    flexShrink: 0,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  description: {
    fontSize: 11,
    color: '#333',
    lineHeight: 1.3,
    marginTop: 3,
    marginBottom: 6,
  },
  progressTrack: {
    height: 2,
    background: 'rgba(0,0,0,0.12)',
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
