// ============================================================
// Work Clicker — Global Leaderboard
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';

interface LeaderboardEntry {
  callsign: string;
  total_qsos: number;
  qso_per_second: number;
  stations_owned: number;
  achievements_count: number;
  is_online: number;
  shifts_completed?: number;
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
  card: '#1a2332',
  border: 'rgba(26,115,232,0.2)',
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
      // Network error -- keep existing data
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
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>LEADERBOARD</h2>
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
                  const isMe = entry.callsign === currentUsername;
                  const rowStyle = isMe ? styles.rowHighlight : styles.row;
                  const online = entry.is_online === 1;
                  return (
                    <tr key={entry.callsign} style={rowStyle}>
                      <td style={styles.td}>{i + 1}</td>
                      <td style={{ ...styles.td, textAlign: 'left', fontWeight: isMe ? 700 : 400 }}>
                        <span style={styles.callsignCell}>
                          <span
                            style={online ? styles.onlineDot : styles.offlineDot}
                            title={online ? 'Online' : 'Offline'}
                          />
                          {entry.callsign}
                        </span>
                      </td>
                      <td style={styles.td}>{formatNum(entry.total_qsos)}</td>
                      <td style={styles.td}>{entry.shifts_completed ?? entry.stations_owned}</td>
                      <td style={styles.td}>{entry.qso_per_second.toFixed(1)}</td>
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
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5000,
  },
  panel: {
    background: '#0f1923',
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    padding: '24px',
    maxWidth: '700px',
    width: '95%',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 30px rgba(26,115,232,0.1)',
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
    letterSpacing: '3px',
    color: COLORS.blue,
    textShadow: '0 0 8px rgba(26,115,232,0.6)',
  },
  closeBtn: {
    background: 'none',
    border: `1px solid ${COLORS.blue}`,
    color: COLORS.blue,
    fontSize: '14px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    cursor: 'pointer',
    padding: '4px 10px',
    borderRadius: 4,
    letterSpacing: '2px',
  },
  subtitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    marginTop: '4px',
  },
  subtitle: {
    fontSize: '10px',
    letterSpacing: '3px',
    color: COLORS.muted,
  },
  onlineCount: {
    fontSize: '10px',
    letterSpacing: '1px',
    color: COLORS.green,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
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
    letterSpacing: '3px',
  },
  empty: {
    color: COLORS.muted,
    textAlign: 'center',
    padding: '32px',
    fontSize: '12px',
    letterSpacing: '1px',
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
    padding: '6px 8px',
    textAlign: 'right',
    color: COLORS.muted,
    borderBottom: `1px solid ${COLORS.border}`,
    fontSize: '10px',
    letterSpacing: '1px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '5px 8px',
    textAlign: 'right',
    color: COLORS.text,
    borderBottom: '1px solid rgba(26,115,232,0.06)',
    whiteSpace: 'nowrap',
  },
  row: {
    background: 'transparent',
  },
  rowHighlight: {
    background: 'rgba(26, 115, 232, 0.08)',
    boxShadow: 'inset 0 0 10px rgba(26,115,232,0.05)',
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
    fontSize: '9px',
    color: COLORS.muted,
    letterSpacing: '2px',
    textAlign: 'center',
    opacity: 0.5,
  },
};

export default Leaderboard;
