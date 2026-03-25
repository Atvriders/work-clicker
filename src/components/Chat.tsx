// ============================================================
// Work Clicker — Chat ("Late Night Office")
// Office IM client with dark theme
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ChatMessage {
  id: number;
  username: string;
  message: string;
  timestamp: string;
}

interface ChatProps {
  username: string;
  isMobile?: boolean;
}

let msgIdCounter = 0;

function formatTime(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '??:??';
  }
}

const Chat: React.FC<ChatProps> = ({ username, isMobile = false }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const openRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    openRef.current = open;
    if (open) {
      setUnread(0);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open, scrollToBottom]);

  const connectWs = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: 'join', username }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'chat') {
          const msg: ChatMessage = {
            id: ++msgIdCounter,
            username: data.username,
            message: data.message,
            timestamp: data.timestamp,
          };
          setMessages((prev) => [...prev.slice(-199), msg]);
          if (!openRef.current) {
            setUnread((prev) => prev + 1);
          }
        } else if (data.type === 'online') {
          setOnlineUsers(data.users || []);
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      reconnectTimerRef.current = setTimeout(() => {
        connectWs();
      }, 3000);
    };

    ws.onerror = () => {};
  }, [username]);

  useEffect(() => {
    connectWs();

    pingTimerRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 5000);

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connectWs]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      type: 'chat',
      username,
      message: trimmed,
    }));
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Collapsed button
  if (!open) {
    return (
      <button
        style={{
          ...styles.chatButton,
          bottom: isMobile ? '68px' : '16px',
        }}
        onClick={() => setOpen(true)}
      >
        <span role="img" aria-label="chat">💬</span>
        {unread > 0 && (
          <span style={styles.badge}>{unread > 99 ? '99+' : unread}</span>
        )}
      </button>
    );
  }

  // Expanded chat window
  return (
    <div
      style={{
        ...styles.chatWindow,
        bottom: isMobile ? '68px' : '16px',
      }}
    >
      <div style={styles.chatHeader}>
        <span style={styles.chatTitle}>Office Chat</span>
        <span style={styles.tempLabel}>Temporary — lost on reload</span>
        <button style={styles.chatCloseBtn} onClick={() => setOpen(false)}>&times;</button>
      </div>

      <div style={styles.onlineBar}>
        {onlineUsers.length > 0 ? onlineUsers.map((u) => (
          <span key={u} style={styles.onlineUser}>
            <span style={styles.greenDot} />
            {u}
          </span>
        )) : (
          <span style={{ color: '#6B6860', fontSize: 10 }}>No one else online</span>
        )}
      </div>

      <div style={styles.messageList}>
        {messages.length === 0 ? (
          <div style={styles.emptyChat}>No messages yet</div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.username === username;
            return (
              <div
                key={msg.id}
                style={{
                  ...styles.messageRow,
                  background: isOwn ? 'rgba(232,212,77,0.1)' : '#333338',
                }}
              >
                <span style={styles.timestamp}>{formatTime(msg.timestamp)}</span>
                <span style={isOwn ? styles.ownCallsign : styles.otherCallsign}>
                  {msg.username}:
                </span>{' '}
                <span style={styles.messageText}>
                  {msg.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.chatInput}
          type="text"
          maxLength={200}
          placeholder="Type message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: !input.trim() || !connected ? 0.4 : 1,
          }}
          onClick={sendMessage}
          disabled={!input.trim() || !connected}
        >
          SEND
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  chatButton: {
    position: 'fixed',
    right: '16px',
    zIndex: 4000,
    background: '#E8D44D',
    border: 'none',
    color: '#1A1A1E',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    fontSize: '16px',
    fontWeight: 700,
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(232, 212, 77, 0.25)',
    transition: 'all 0.2s ease',
    width: '42px',
    height: '42px',
    justifyContent: 'center',
  },
  badge: {
    background: '#EF5350',
    color: '#fff',
    fontSize: '9px',
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: '10px',
    minWidth: '16px',
    textAlign: 'center',
    letterSpacing: 0,
    position: 'absolute',
    top: '-4px',
    right: '-4px',
  },

  chatWindow: {
    position: 'fixed',
    right: '16px',
    width: '340px',
    height: '420px',
    zIndex: 4000,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    background: '#2A2A2F',
    borderRadius: 14,
    border: '1px solid #3A3A3F',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    background: '#E8D44D',
    flexShrink: 0,
  },
  chatTitle: {
    color: '#1A1A1E',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  tempLabel: {
    fontSize: 9,
    color: '#6B6860',
    fontWeight: 400,
  },
  chatCloseBtn: {
    background: 'rgba(26,26,30,0.15)',
    border: 'none',
    color: '#1A1A1E',
    fontSize: '16px',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    cursor: 'pointer',
    padding: '0 8px',
    borderRadius: 12,
    fontWeight: 700,
    lineHeight: '22px',
  },

  onlineBar: {
    padding: '6px 14px',
    fontSize: '10px',
    color: '#E8D44D',
    borderBottom: '1px solid #3A3A3F',
    flexShrink: 0,
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    fontWeight: 600,
  },
  onlineUser: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  greenDot: {
    display: 'inline-block',
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: '#66BB6A',
  },

  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  emptyChat: {
    color: '#6B6860',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '40px',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  messageRow: {
    fontSize: '12px',
    lineHeight: '1.5',
    wordBreak: 'break-word',
    padding: '3px 6px',
    borderRadius: 6,
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  timestamp: {
    color: '#6B6860',
    fontSize: '10px',
    marginRight: 4,
    fontVariantNumeric: 'tabular-nums',
  },
  ownCallsign: {
    color: '#E8D44D',
    fontWeight: 700,
  },
  otherCallsign: {
    color: '#D0CDC6',
    fontWeight: 700,
  },
  messageText: {
    color: '#9E9B94',
  },

  inputRow: {
    display: 'flex',
    gap: '6px',
    padding: '10px 14px',
    borderTop: '1px solid #3A3A3F',
    flexShrink: 0,
  },
  chatInput: {
    flex: 1,
    background: '#1A1A1E',
    border: '1px solid #3A3A3F',
    color: '#D0CDC6',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    fontSize: '12px',
    padding: '8px 12px',
    outline: 'none',
    borderRadius: '10px',
  },
  sendBtn: {
    background: '#E8D44D',
    border: 'none',
    color: '#1A1A1E',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: 0.5,
    padding: '6px 14px',
    cursor: 'pointer',
    borderRadius: '10px',
    transition: 'all 0.15s ease',
  },
};

export default Chat;
