// ============================================================
// Work Clicker — Event Popup ("Golden Hour Office")
// Inline warm card with colored left border
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
  const accentColor = isPositive ? '#4A8B5C' : '#C45A3C';

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
        animation: visible ? 'slide-in 0.4s ease-out' : 'none',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          ...styles.banner,
          borderLeft: `4px solid ${accentColor}`,
        }}
        className="warm-card"
      >
        <div style={styles.header}>
          <span style={styles.icon}>{eventDef.icon}</span>
          <span style={{ ...styles.name, color: accentColor }}>{eventDef.name}</span>
          <span style={styles.description}>{eventDef.description}</span>
          <span style={styles.timer} className="tabular-nums">{secs}s</span>
        </div>
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressBar,
              background: accentColor,
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
  banner: {
    padding: '8px 12px',
    borderRadius: 10,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  icon: {
    fontSize: 18,
    flexShrink: 0,
  },
  name: {
    fontSize: 13,
    fontWeight: 700,
    flexShrink: 0,
  },
  description: {
    fontSize: 11,
    color: '#7A736A',
    flex: 1,
    minWidth: 0,
    lineHeight: 1.3,
  },
  timer: {
    fontSize: 12,
    color: '#E8900C',
    fontWeight: 700,
    flexShrink: 0,
  },
  progressTrack: {
    height: 3,
    background: '#F5F0E8',
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
