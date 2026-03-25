// ============================================================
// Work Clicker — Leaderboard ("Late Night Office")
// Office whiteboard modal with dark theme
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
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>LEADERBOARD</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>
        <div style={styles.subtitleRow}>
          <span style={styles.subtitle}>TOP WORKERS WORLDWIDE</span>
          <span style={styles.onlineCount}>
            <span style={styles.onlineDotSmall} />
            {onlineCount} online
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
                <tr style={styles.headerRow}>
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
                  const online = entry.is_online === 1;
                  return (
                    <tr
                      key={entry.username}
                      style={isMe ? styles.rowHighlight : styles.row}
                    >
                      <td style={styles.td}>{i + 1}</td>
                      <td style={{
                        ...styles.td,
                        textAlign: 'left',
                        fontWeight: isMe ? 700 : 400,
                        color: isMe ? '#E8D44D' : '#D0CDC6',
                      }}>
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
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5000,
  },
  panel: {
    padding: '28px',
    maxWidth: '700px',
    width: '95%',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#2A2A2F',
    borderRadius: 12,
    border: '1px solid #3A3A3F',
    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 700,
    color: '#E8D44D',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    letterSpacing: 2,
  },
  closeBtn: {
    background: 'transparent',
    border: '1px solid #3A3A3F',
    color: '#9E9B94',
    fontSize: '20px',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    cursor: 'pointer',
    padding: '2px 12px',
    borderRadius: 20,
    fontWeight: 400,
    lineHeight: 1.2,
  },
  subtitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    marginTop: '8px',
  },
  subtitle: {
    fontSize: '10px',
    letterSpacing: 2,
    color: '#9E9B94',
    fontWeight: 600,
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  onlineCount: {
    fontSize: '11px',
    letterSpacing: 0.5,
    color: '#66BB6A',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 600,
  },
  onlineDotSmall: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#66BB6A',
  },
  loading: {
    color: '#E8D44D',
    textAlign: 'center',
    padding: '32px',
    letterSpacing: 2,
    fontWeight: 600,
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  empty: {
    color: '#9E9B94',
    textAlign: 'center',
    padding: '32px',
    fontSize: '13px',
  },
  tableWrap: {
    overflowY: 'auto',
    flex: 1,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  headerRow: {
    background: '#333338',
  },
  th: {
    padding: '10px 8px',
    textAlign: 'right',
    color: '#9E9B94',
    borderBottom: '1px solid #3A3A3F',
    fontSize: '10px',
    letterSpacing: 0.5,
    fontWeight: 700,
    whiteSpace: 'nowrap',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  td: {
    padding: '8px',
    textAlign: 'right',
    color: '#D0CDC6',
    borderBottom: '1px solid #3A3A3F',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  row: {
    background: 'transparent',
  },
  rowHighlight: {
    background: 'rgba(232,212,77,0.1)',
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
    background: '#66BB6A',
    flexShrink: 0,
  },
  offlineDot: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#6B6860',
    flexShrink: 0,
  },
  footer: {
    marginTop: '14px',
    fontSize: '11px',
    color: '#6B6860',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
};

export default Leaderboard;
