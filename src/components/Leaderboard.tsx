// ============================================================
// Work Clicker — Leaderboard ("Golden Hour Office")
// Clean modal with warm borders
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
          <h2 style={styles.title}>Leaderboard</h2>
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
                        color: isMe ? '#E8900C' : '#2D2A26',
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
    background: 'rgba(45, 42, 38, 0.3)',
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
    background: '#FFFFFF',
    borderRadius: 16,
    border: '1px solid #E8E2D8',
    boxShadow: '0 16px 48px rgba(45,42,38,0.15)',
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
    color: '#2D2A26',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  closeBtn: {
    background: 'transparent',
    border: '1px solid #E8E2D8',
    color: '#7A736A',
    fontSize: '20px',
    fontFamily: "'Source Sans 3', sans-serif",
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
    color: '#B5AFA6',
    fontWeight: 600,
  },
  onlineCount: {
    fontSize: '11px',
    letterSpacing: 0.5,
    color: '#4A8B5C',
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
    background: '#4A8B5C',
  },
  loading: {
    color: '#E8900C',
    textAlign: 'center',
    padding: '32px',
    letterSpacing: 2,
    fontWeight: 600,
  },
  empty: {
    color: '#B5AFA6',
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
  th: {
    padding: '10px 8px',
    textAlign: 'right',
    color: '#B5AFA6',
    borderBottom: '1px solid #E8E2D8',
    fontSize: '10px',
    letterSpacing: 0.5,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '8px',
    textAlign: 'right',
    color: '#2D2A26',
    borderBottom: '1px solid #F5F0E8',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  row: {
    background: 'transparent',
  },
  rowHighlight: {
    background: '#FFF3E0',
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
    background: '#4A8B5C',
    flexShrink: 0,
  },
  offlineDot: {
    display: 'inline-block',
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#D8D3CC',
    flexShrink: 0,
  },
  footer: {
    marginTop: '14px',
    fontSize: '11px',
    color: '#B5AFA6',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
};

export default Leaderboard;
