// ============================================================
// Work Clicker — Event Log ("Corporate Dystopia Brutalism")
// Clean dark panel activity log with colored status dots
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
    case 'milestone':
      return '#F59E0B';
    case 'achievement':
      return '#00FF66';
    case 'warning':
      return '#FF2E2E';
    default:
      return 'var(--text-muted, #7A8899)';
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

  const containerStyle: React.CSSProperties = {
    padding: '12px 14px',
    color: 'var(--text-primary, #E8E6E1)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    minHeight: 0,
    background: 'var(--bg-card, #1E1E22)',
    borderRadius: 2,
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border, #2A2A2F)',
    paddingBottom: 8,
    marginBottom: 4,
    flexShrink: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-secondary, #9E9B94)',
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
    letterSpacing: 2,
    textTransform: 'uppercase',
  };

  const headerRightStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  const entryCountStyle: React.CSSProperties = {
    fontSize: 10,
    color: 'var(--text-muted, #7A8899)',
    fontWeight: 500,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
  };

  const clearBtnStyle: React.CSSProperties = {
    fontSize: 13,
    padding: '2px 4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    lineHeight: 1,
    borderRadius: 2,
    color: 'var(--text-muted, #7A8899)',
    transition: 'color 0.15s ease',
  };

  const logAreaStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    minHeight: 0,
  };

  const getEntryStyle = (i: number, total: number): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: 0,
    fontSize: 11,
    lineHeight: 1.6,
    padding: '5px 4px',
    borderBottom: i < total - 1 ? '1px solid var(--border, #2A2A2F)' : 'none',
    animation: 'eventLogSlideUp 0.25s ease-out',
  });

  const dotStyle = (type: EventLogEntry['type']): React.CSSProperties => ({
    width: 4,
    height: 4,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 7,
    marginRight: 8,
    background: getDotColor(type),
  });

  const timestampStyle: React.CSSProperties = {
    color: 'var(--text-muted, #7A8899)',
    fontSize: 10,
    marginRight: 8,
    flexShrink: 0,
    fontWeight: 500,
    lineHeight: 1.8,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', monospace",
    fontVariantNumeric: 'tabular-nums',
  };

  const messageStyle: React.CSSProperties = {
    color: 'var(--text-secondary, #9E9B94)',
    fontSize: 11,
    lineHeight: 1.6,
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>ACTIVITY LOG</span>
        <span style={headerRightStyle}>
          <span style={entryCountStyle}>{eventLog.length}</span>
          {onClearLog && (
            <button
              style={clearBtnStyle}
              onClick={onClearLog}
              title="Clear log"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#F59E0B';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  'var(--text-muted, #7A8899)';
              }}
            >
              🗑
            </button>
          )}
        </span>
      </div>
      <div style={logAreaStyle} ref={scrollRef}>
        {visible.map((entry: EventLogEntry, i: number) => (
          <div key={entry.id} style={getEntryStyle(i, visible.length)}>
            <span style={dotStyle(entry.type)} />
            <span style={timestampStyle}>
              {formatTimestamp(entry.timestamp)}
            </span>
            <span style={messageStyle}>{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventLog;
