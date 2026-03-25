// ============================================================
// Work Clicker — Event Log ("Late Night at the Office")
// Clipboard / work log — dark theme with ruled lines
// ============================================================

import React, { useEffect, useRef } from 'react';
import { EventLogEntry } from '../types';

const WORK_FLAVOR = [
  'Replied to email chain',
  'Attended standup meeting',
  'Fixed a bug',
  'Pushed to production on Friday',
  'Pretended to understand the architecture diagram',
  'Refactored legacy code',
  'Updated Jira ticket',
  'Wrote unit tests',
  'Merged pull request',
  'Reviewed code changes',
  'Updated documentation nobody reads',
  'Attended all-hands meeting',
  'Debugged CSS alignment issue',
  'Resolved merge conflict',
  'Added TODO comment in code',
  'Optimized database query',
  'Deployed to staging',
  'Created a spreadsheet',
  'Replied "sounds good" to Slack message',
  'Scheduled a meeting about a meeting',
  'Nodded thoughtfully during presentation',
  'Googled error message',
  'Stack Overflow saved you again',
  'Survived another sprint planning',
  'Moved ticket to "In Progress"',
  'Closed browser tab you had open for 3 weeks',
  'Forgot what you were doing, checked Slack',
  'Explained the same thing for the 4th time',
  'Smiled and waved during video call',
  'Pretended VPN was slow',
];

interface EventLogProps {
  eventLog: EventLogEntry[];
  onAddLogEntry: (message: string, type: EventLogEntry['type']) => void;
  onClearLog?: () => void;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function getDotColor(type: EventLogEntry['type']): string {
  switch (type) {
    case 'achievement': return '#66BB6A';
    case 'warning': return '#EF5350';
    default: return '#E8D44D';
  }
}

const EventLog: React.FC<EventLogProps> = ({ eventLog, onAddLogEntry, onClearLog }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const addLogRef = useRef(onAddLogEntry);
  addLogRef.current = onAddLogEntry;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [eventLog]);

  // Periodic flavor messages
  useEffect(() => {
    const interval = setInterval(() => {
      const msg = WORK_FLAVOR[Math.floor(Math.random() * WORK_FLAVOR.length)];
      addLogRef.current(msg, 'event');
    }, 5000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, []);

  const visible = eventLog.slice(-30);

  return (
    <div style={styles.container} className="desk-card">
      <div style={styles.titleRow}>
        <span style={styles.title}>WORK LOG ✏️</span>
        <span style={styles.headerRight}>
          <span style={styles.entryCount}>{eventLog.length} entries</span>
          {onClearLog && (
            <button style={styles.clrButton} onClick={onClearLog} title="Clear log">
              🗑️
            </button>
          )}
        </span>
      </div>
      <div style={styles.logArea} ref={scrollRef}>
        {visible.map((entry: EventLogEntry, i: number) => {
          const isEven = i % 2 === 0;
          return (
            <div
              key={entry.id}
              style={{
                ...styles.entry,
                background: isEven ? '#2A2A2F' : '#262629',
              }}
            >
              <span
                style={{
                  ...styles.dot,
                  background: getDotColor(entry.type),
                }}
              />
              <span style={styles.timestamp} className="tabular-nums">
                {formatTimestamp(entry.timestamp)}
              </span>
              <span style={styles.message}>{entry.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '12px 14px',
    color: '#E8E6E1',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    minHeight: 0,
    background: '#1E1E22',
    borderRadius: 10,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #3A3A3F',
    paddingBottom: 8,
    marginBottom: 6,
    flexShrink: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#E8E6E1',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    letterSpacing: 1.5,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  entryCount: {
    fontSize: 11,
    color: '#6B6860',
    fontWeight: 500,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  clrButton: {
    fontSize: 16,
    padding: '2px 4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    lineHeight: 1,
    borderRadius: 4,
    transition: 'background 0.15s ease',
  },
  logArea: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    minHeight: 0,
    backgroundImage:
      'repeating-linear-gradient(to bottom, transparent, transparent 23px, #3A3A3F 23px, #3A3A3F 24px)',
  },
  entry: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0,
    fontSize: 13,
    lineHeight: 1.5,
    padding: '3px 6px',
    borderRadius: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 6,
    marginRight: 8,
  },
  timestamp: {
    color: '#6B6860',
    fontSize: 10,
    marginRight: 8,
    flexShrink: 0,
    fontWeight: 500,
    lineHeight: 1.9,
    fontFamily: "'IBM Plex Mono', monospace",
  },
  message: {
    color: '#9E9B94',
    lineHeight: 1.5,
  },
};

export default EventLog;
