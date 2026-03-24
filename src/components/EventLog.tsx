// ============================================================
// Work Clicker — Event Log (Clean Modern Log)
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
    <div style={styles.container} className="glass-card">
      <div style={styles.titleRow}>
        <span style={styles.title}>{'\uD83D\uDCDD'} Work Log</span>
        <span style={styles.headerRight}>
          <span style={styles.entryCount}>{eventLog.length} entries</span>
          {onClearLog && (
            <button style={styles.clrButton} onClick={onClearLog}>
              Clear
            </button>
          )}
        </span>
      </div>
      <div style={styles.logArea} ref={scrollRef}>
        {visible.map((entry: EventLogEntry, i: number) => {
          const age = visible.length - 1 - i;
          const opacity = Math.max(0.4, 1 - age * 0.02);

          return (
            <div key={entry.id} style={{ ...styles.entry, opacity }}>
              <span className={`log-dot ${entry.type}`} />
              <span style={styles.timestamp}>
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
    padding: '10px 12px',
    color: '#e8eaed',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    minHeight: 0,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(26, 115, 232, 0.1)',
    paddingBottom: 6,
    marginBottom: 6,
    flexShrink: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1a73e8',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  entryCount: {
    fontSize: 10,
    color: '#9aa0a6',
    opacity: 0.6,
    fontWeight: 500,
  },
  clrButton: {
    fontSize: 10,
    padding: '2px 8px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(26, 115, 232, 0.15)',
    borderRadius: 6,
    color: '#9aa0a6',
    cursor: 'pointer',
    fontWeight: 500,
  },
  logArea: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minHeight: 0,
  },
  entry: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0,
    fontSize: 12,
    lineHeight: 1.5,
    padding: '1px 0',
  },
  timestamp: {
    color: '#9aa0a6',
    fontSize: 10,
    opacity: 0.6,
    marginRight: 6,
    flexShrink: 0,
    fontWeight: 500,
    lineHeight: 1.8,
  },
  message: {
    color: '#c5cad1',
    lineHeight: 1.5,
  },
};

export default EventLog;
