// ============================================================
// Work Clicker — Leaderboard ("Corporate Dystopia Brutalism")
// Surveillance-grade performance rankings
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

const RANK_COLORS: Record<number, string> = {
  1: '#FFD700',
  2: '#C0C0C0',
  3: '#CD7F32',
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

  const s = styles;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.panel} onClick={(e) => e.stopPropagation()}>
        <div style={s.amberBorder} />
        <div style={s.header}>
          <h2 style={s.title}>LEADERBOARD</h2>
          <button style={s.closeBtn} onClick={onClose}>
            &#10005;
          </button>
        </div>
        <div style={s.subtitleRow}>
          <span style={s.subtitle}>EMPLOYEE PERFORMANCE INDEX</span>
          <span style={s.onlineCount}>
            <span style={s.onlineDotSmall} />
            {onlineCount} online
          </span>
        </div>

        {loading ? (
          <div style={s.loading}>LOADING...</div>
        ) : entries.length === 0 ? (
          <div style={s.empty}>No workers on the board yet. Be the first!</div>
        ) : (
          <div style={s.tableWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>#</th>
                  <th style={{ ...s.th, textAlign: 'left' }}>NAME</th>
                  <th style={s.th}>BEST WP</th>
                  <th style={s.th}>SHIFTS</th>
                  <th style={s.th}>WP/s</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => {
                  const isMe = entry.username === currentUsername;
                  const online = entry.is_online === 1;
                  const rank = i + 1;
                  const rankColor = RANK_COLORS[rank] || '#555';

                  const rowStyle: React.CSSProperties = {
                    background: isMe ? 'rgba(212,160,23,0.12)' : (i % 2 === 0 ? '#141414' : '#111'),
                    transition: 'background 0.1s ease',
                  };

                  return (
                    <tr
                      key={entry.username}
                      style={rowStyle}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(212,160,23,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = isMe
                          ? 'rgba(212,160,23,0.12)'
                          : (i % 2 === 0 ? '#141414' : '#111');
                      }}
                    >
                      <td style={{ ...s.td, color: rankColor, fontWeight: 700 }}>
                        {rank}
                      </td>
                      <td style={{
                        ...s.td,
                        textAlign: 'left',
                        fontWeight: isMe ? 700 : 400,
                        color: isMe ? '#D4A017' : '#bbb',
                      }}>
                        <span style={s.nameCell}>
                          {online && <span style={s.onlineDot} />}
                          {entry.username}
                        </span>
                      </td>
                      <td style={s.td}>{formatNum(entry.best_shift_wp)}</td>
                      <td style={s.td}>{entry.total_shifts}</td>
                      <td style={s.td}>{entry.wps.toFixed(1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={s.footer}>Auto-refreshes every 30s</div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5000,
  },
  panel: {
    maxWidth: 680,
    width: '95%',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#111',
    border: '1px solid #222',
    borderRadius: 0,
    boxShadow: '0 0 80px rgba(0,0,0,0.7)',
    overflow: 'hidden',
  },
  amberBorder: {
    height: 3,
    width: '100%',
    background: '#D4A017',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px 0',
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: '#D4A017',
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  closeBtn: {
    background: 'transparent',
    border: '1px solid #333',
    color: '#666',
    fontSize: 16,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    cursor: 'pointer',
    padding: '4px 10px',
    borderRadius: 0,
    fontWeight: 400,
    lineHeight: 1,
    transition: 'color 0.15s ease',
  },
  subtitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 24px 16px',
  },
  subtitle: {
    fontSize: 9,
    letterSpacing: '0.15em',
    color: '#555',
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
  },
  onlineCount: {
    fontSize: 10,
    letterSpacing: '0.05em',
    color: '#4CAF50',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
  },
  onlineDotSmall: {
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#4CAF50',
  },
  loading: {
    color: '#D4A017',
    textAlign: 'center',
    padding: 40,
    letterSpacing: '0.15em',
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    fontSize: 13,
  },
  empty: {
    color: '#555',
    textAlign: 'center',
    padding: 40,
    fontSize: 12,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
  },
  tableWrap: {
    overflowY: 'auto',
    flex: 1,
    padding: '0 24px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 12,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
  },
  th: {
    padding: '10px 8px',
    textAlign: 'right',
    color: '#555',
    borderBottom: '1px solid #222',
    fontSize: 9,
    letterSpacing: '0.1em',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    textTransform: 'uppercase',
  },
  td: {
    padding: '9px 8px',
    textAlign: 'right',
    color: '#888',
    borderBottom: '1px solid #1a1a1a',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  nameCell: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    display: 'inline-block',
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#4CAF50',
    flexShrink: 0,
  },
  footer: {
    padding: '12px 24px',
    fontSize: 10,
    color: '#333',
    letterSpacing: '0.1em',
    textAlign: 'center',
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    borderTop: '1px solid #1a1a1a',
  },
};

export default Leaderboard;
