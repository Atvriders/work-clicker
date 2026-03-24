// ============================================================
// Work Clicker — Event Log (Work log with flavor messages)
// ============================================================

import React, { useEffect, useRef } from 'react';
import { EventLogEntry } from '../types';

const COLORS = {
  blue: '#1a73e8',
  amber: '#fbbc04',
  green: '#34a853',
  red: '#ea4335',
  card: '#1a2332',
  border: 'rgba(26,115,232,0.2)',
  text: '#e8eaed',
  muted: '#9aa0a6',
};

const TYPE_COLORS: Record<string, string> = {
  milestone: '#fbbc04',
  event: COLORS.amber,
  achievement: '#fbbc04',
  warning: COLORS.red,
  shift: COLORS.green,
};

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
  }, []); // empty deps — runs once

  const visible = eventLog.slice(-30);

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <span style={styles.title}>WORK LOG</span>
        <span style={styles.headerRight}>
          <span style={styles.entryCount}>{eventLog.length} entries</span>
          {onClearLog && (
            <button style={styles.clrButton} onClick={onClearLog}>
              CLR
            </button>
          )}
        </span>
      </div>
      <div style={styles.logArea} ref={scrollRef}>
        {visible.map((entry: EventLogEntry, i: number) => {
          const typeColor = TYPE_COLORS[entry.type] ?? COLORS.text;
          const age = visible.length - 1 - i;
          const opacity = Math.max(0.4, 1 - age * 0.02);

          return (
            <div key={entry.id} style={{ ...styles.entry, opacity }}>
              <span style={styles.timestamp}>
                [{formatTimestamp(entry.timestamp)}]
              </span>
              <span style={{ color: typeColor }}>{entry.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 6,
    padding: '6px 8px',
    color: COLORS.text,
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
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: 4,
    marginBottom: 4,
    flexShrink: 0,
  },
  title: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.blue,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  entryCount: {
    fontSize: 9,
    color: COLORS.muted,
    letterSpacing: 1,
    opacity: 0.5,
  },
  clrButton: {
    fontSize: 9,
    padding: '1px 5px',
    background: 'transparent',
    border: `1px solid ${COLORS.border}`,
    borderRadius: 3,
    color: COLORS.muted,
    cursor: 'pointer',
    letterSpacing: 1,
    lineHeight: 1.4,
  },
  logArea: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minHeight: 0,
  },
  entry: {
    fontSize: 12,
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
  timestamp: {
    color: COLORS.muted,
    marginRight: 4,
    fontSize: 10,
    opacity: 0.5,
  },
};

export default EventLog;
