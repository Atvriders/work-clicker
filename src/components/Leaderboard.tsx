// ============================================================
// Work Clicker — Global Leaderboard (Glassmorphism)
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';

interface LeaderboardEntry {
  username: string;
  best_shift_wp: number;
  total_shifts: number;
  total_wp: number;
  wps: number;
  is_online: number;
}

interface LeaderboardProps {
  currentUsername: string;
  onClose: () => void;
}

function formatNum(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Math.floor(n).toString();
}

const COLORS = {
  blue: '#1a73e8',
  green: '#34a853',
  amber: '#fbbc04',
  text: '#e8eaed',
  muted: '#9aa0a6',
};

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUsername, onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch {
      // Keep existing data
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30_000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const onlineCount = entries.filter((e) => e.is_online === 1).length;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} className="glass-card" onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{'\uD83C\uDFC6'} LEADERBOARD</h2>
          <button style={styles.closeBtn} onClick={onClose}>X</button>
        </div>
        <div style={styles.subtitleRow}>
          <span style={styles.subtitle}>TOP WORKERS WORLDWIDE</span>
          <span style={styles.onlineCount}>
            <span style={styles.onlineDotSmall} />
            {onlineCount} worker{onlineCount !== 1 ? 's' : ''} online
          </span>
        </div>

        {loading ? (
          <div style={styles.loading}>LOADING...</div>
        ) : entries.length === 0 ? (
          <div style={styles.empty}>No workers on the board yet. Be the first!</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>#</th>
                  <th style={{ ...styles.th, textAlign: 'left' }}>NAME</th>
                  <th style={styles.th}>BEST WP</th>
                  <th style={styles.th}>SHIFTS</th>
                  <th style={styles.th}>WP/s</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const isMe = entry.username === currentUsername;
                  const rowStyle = isMe ? styles.rowHighlight : styles.row;
                  const online = entry.is_online === 1;
                  return (
                    <tr key={entry.username} style={rowStyle}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={{ ...styles.td, textAlign: 'left', fontWeight: isMe ? 700 : 400 }}>
                        <span style={styles.callsignCell}>
                          <span
                            style={online ? styles.onlineDot : styles.offlineDot}
                            title={online ? 'Online' : 'Offline'}
                          />
                          {entry.username}
                        </span>
                      </td>
                      <td style={styles.td}>{formatNum(entry.best_shift_wp)}</td>
                      <td style={styles.td}>{entry.total_shifts}</td>
                      <td style={styles.td}>{entry.wps.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={styles.footer}>Refreshes every 30 seconds</div>

        <style>{`
          @keyframes pulse-online-lb {
            0%, 100% { opacity: 1; box-shadow: 0 0 4px #34a853; }
            50% { opacity: 0.5; box-shadow: 0 0 8px #34a853; }
          }
        `}</style>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5000,
  },
  panel: {
    padding: '24px',
    maxWidth: '700px',
    width: '95%',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: 2,
    color: COLORS.blue,
  },
  closeBtn: {
    background: 'rgba(26, 115, 232, 0.08)',
    border: '1px solid rgba(26, 115, 232, 0.2)',
    color: COLORS.blue,
    fontSize: '13px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    cursor: 'pointer',
    padding: '4px 12px',
    borderRadius: 8,
    fontWeight: 600,
  },
  subtitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    marginTop: '6px',
  },
  subtitle: {
    fontSize: '10px',
    letterSpacing: 2,
    color: COLORS.muted,
    fontWeight: 600,
  },
  onlineCount: {
    fontSize: '10px',
    letterSpacing: 0.5,
    color: COLORS.green,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 600,
  },
  onlineDotSmall: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: COLORS.green,
    boxShadow: `0 0 4px ${COLORS.green}`,
    animation: 'pulse-online-lb 2s ease-in-out infinite',
  },
  loading: {
    color: COLORS.blue,
    textAlign: 'center',
    padding: '32px',
    letterSpacing: 2,
    fontWeight: 600,
  },
  empty: {
    color: COLORS.muted,
    textAlign: 'center',
    padding: '32px',
    fontSize: '12px',
  },
  tableWrap: {
    overflowY: 'auto',
    flex: 1,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
  },
  th: {
    padding: '8px',
    textAlign: 'right',
    color: COLORS.muted,
    borderBottom: '1px solid rgba(26, 115, 232, 0.12)',
    fontSize: '10px',
    letterSpacing: 0.5,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '6px 8px',
    textAlign: 'right',
    color: COLORS.text,
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    whiteSpace: 'nowrap',
  },
  row: {
    background: 'transparent',
  },
  rowHighlight: {
    background: 'rgba(26, 115, 232, 0.06)',
    borderRadius: 6,
  },
  callsignCell: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  onlineDot: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: COLORS.green,
    boxShadow: `0 0 4px ${COLORS.green}`,
    animation: 'pulse-online-lb 2s ease-in-out infinite',
    flexShrink: 0,
  },
  offlineDot: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#444',
    flexShrink: 0,
  },
  footer: {
    marginTop: '12px',
    fontSize: '10px',
    color: COLORS.muted,
    letterSpacing: 1,
    textAlign: 'center',
    opacity: 0.4,
  },
};

export default Leaderboard;
