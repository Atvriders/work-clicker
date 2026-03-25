// ============================================================
// Work Clicker — Chat ("Golden Hour Office")
// Minimal warm chat with amber accents
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
        Chat
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
        <span style={styles.tempLabel}>Messages are temporary</span>
        <button style={styles.chatCloseBtn} onClick={() => setOpen(false)}>&times;</button>
      </div>

      <div style={styles.onlineBar}>
        {onlineUsers.length > 0 ? onlineUsers.map((u) => (
          <span key={u} style={styles.onlineUser}>
            <span style={styles.greenDot} />
            {u}
          </span>
        )) : (
          <span style={{ color: '#B5AFA6', fontSize: 10 }}>No one else online</span>
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
                  background: isOwn ? '#FFF3E0' : 'transparent',
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
    background: '#E8900C',
    border: 'none',
    color: '#FFFFFF',
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: 0.5,
    padding: '8px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(232, 144, 12, 0.3)',
    transition: 'all 0.2s ease',
  },
  badge: {
    background: '#C45A3C',
    color: '#fff',
    fontSize: '9px',
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: '10px',
    minWidth: '16px',
    textAlign: 'center',
    letterSpacing: 0,
  },

  chatWindow: {
    position: 'fixed',
    right: '16px',
    width: '340px',
    height: '420px',
    zIndex: 4000,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Source Sans 3', sans-serif",
    background: '#FFFFFF',
    borderRadius: 14,
    border: '1px solid #E8E2D8',
    boxShadow: '0 8px 32px rgba(45,42,38,0.12)',
    overflow: 'hidden',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    borderBottom: '1px solid #E8E2D8',
    flexShrink: 0,
  },
  chatTitle: {
    color: '#2D2A26',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  tempLabel: {
    fontSize: 9,
    color: '#B5AFA6',
    fontWeight: 400,
  },
  chatCloseBtn: {
    background: 'transparent',
    border: '1px solid #E8E2D8',
    color: '#7A736A',
    fontSize: '16px',
    fontFamily: "'Source Sans 3', sans-serif",
    cursor: 'pointer',
    padding: '0 8px',
    borderRadius: 12,
    fontWeight: 400,
    lineHeight: '22px',
  },

  onlineBar: {
    padding: '6px 14px',
    fontSize: '10px',
    color: '#4A8B5C',
    borderBottom: '1px solid #F5F0E8',
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
    background: '#4A8B5C',
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
    color: '#B5AFA6',
    fontSize: '12px',
    textAlign: 'center',
    marginTop: '40px',
  },
  messageRow: {
    fontSize: '12px',
    lineHeight: '1.5',
    wordBreak: 'break-word',
    padding: '3px 6px',
    borderRadius: 6,
  },
  timestamp: {
    color: '#B5AFA6',
    fontSize: '10px',
    marginRight: 4,
    fontVariantNumeric: 'tabular-nums',
  },
  ownCallsign: {
    color: '#E8900C',
    fontWeight: 700,
  },
  otherCallsign: {
    color: '#2D2A26',
    fontWeight: 700,
  },
  messageText: {
    color: '#7A736A',
  },

  inputRow: {
    display: 'flex',
    gap: '6px',
    padding: '10px 14px',
    borderTop: '1px solid #E8E2D8',
    flexShrink: 0,
  },
  chatInput: {
    flex: 1,
    background: '#FDFAF5',
    border: '1px solid #E8E2D8',
    color: '#2D2A26',
    fontFamily: "'Source Sans 3', sans-serif",
    fontSize: '12px',
    padding: '8px 12px',
    outline: 'none',
    borderRadius: '10px',
  },
  sendBtn: {
    background: '#E8900C',
    border: 'none',
    color: '#FFFFFF',
    fontFamily: "'Source Sans 3', sans-serif",
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
