// ============================================================
// Work Clicker — Chat Box (WebSocket ephemeral chat)
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

const COLORS = {
  blue: '#1a73e8',
  amber: '#fbbc04',
  card: '#1a2332',
  border: 'rgba(26,115,232,0.2)',
  text: '#e8eaed',
  muted: '#9aa0a6',
};

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

  // Track open state in ref for WS callback access
  useEffect(() => {
    openRef.current = open;
    if (open) {
      setUnread(0);
    }
  }, [open]);

  // Auto-scroll when new messages arrive while open
  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open, scrollToBottom]);

  // WebSocket connection
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

    ws.onerror = () => {
      // onclose will fire after onerror
    };
  }, [username]);

  // Connect on mount, cleanup on unmount
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
          bottom: isMobile ? '64px' : '16px',
        }}
        onClick={() => setOpen(true)}
      >
        CHAT
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
        bottom: isMobile ? '64px' : '16px',
      }}
    >
      {/* Header */}
      <div style={styles.chatHeader}>
        <span style={styles.chatTitle}>OFFICE CHAT</span>
        <span style={{ fontSize: 8, color: COLORS.muted, letterSpacing: 1, opacity: 0.5 }}>TEMP — LOST ON RELOAD</span>
        <button style={styles.chatCloseBtn} onClick={() => setOpen(false)}>X</button>
      </div>

      {/* Online users */}
      <div style={styles.onlineBar}>
        <span style={styles.onlineIndicator}>{connected ? '\u25CF' : '\u25CB'}</span>
        {' '}
        ONLINE: {onlineUsers.length > 0 ? onlineUsers.join(', ') : 'none'}
      </div>

      {/* Messages */}
      <div style={styles.messageList}>
        {messages.length === 0 ? (
          <div style={styles.emptyChat}>No messages yet</div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.username === username;
            return (
              <div key={msg.id} style={styles.messageRow}>
                <span style={styles.timestamp}>[{formatTime(msg.timestamp)}]</span>{' '}
                <span style={isOwn ? styles.ownCallsign : styles.otherCallsign}>
                  {msg.username}:
                </span>{' '}
                <span style={isOwn ? styles.ownMessage : styles.otherMessage}>
                  {msg.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
  // Collapsed chat button
  chatButton: {
    position: 'fixed',
    right: '16px',
    zIndex: 4000,
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.blue,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '2px',
    padding: '6px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 0 10px rgba(26,115,232,0.1)',
  },
  badge: {
    background: '#ea4335',
    color: '#fff',
    fontSize: '9px',
    fontWeight: 700,
    padding: '1px 5px',
    borderRadius: '8px',
    minWidth: '16px',
    textAlign: 'center',
    letterSpacing: '0',
  },

  // Expanded chat window
  chatWindow: {
    position: 'fixed',
    right: '16px',
    width: '300px',
    height: '400px',
    zIndex: 4000,
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 20px rgba(26,115,232,0.1)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    borderBottom: `1px solid ${COLORS.border}`,
    flexShrink: 0,
  },
  chatTitle: {
    color: COLORS.blue,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '2px',
    textShadow: '0 0 6px rgba(26,115,232,0.4)',
  },
  chatCloseBtn: {
    background: 'none',
    border: `1px solid ${COLORS.border}`,
    color: COLORS.blue,
    fontSize: '10px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    cursor: 'pointer',
    padding: '2px 6px',
    borderRadius: 3,
    letterSpacing: '1px',
  },

  // Online users bar
  onlineBar: {
    padding: '4px 10px',
    fontSize: '9px',
    color: '#34a853',
    letterSpacing: '1px',
    borderBottom: `1px solid rgba(26,115,232,0.1)`,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  onlineIndicator: {
    fontSize: '8px',
  },

  // Messages area
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  emptyChat: {
    color: COLORS.muted,
    fontSize: '11px',
    textAlign: 'center',
    marginTop: '40px',
    letterSpacing: '1px',
    opacity: 0.5,
  },
  messageRow: {
    fontSize: '11px',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },
  timestamp: {
    color: COLORS.muted,
    fontSize: '10px',
    opacity: 0.5,
  },
  ownCallsign: {
    color: COLORS.amber,
    fontWeight: 700,
  },
  otherCallsign: {
    color: COLORS.blue,
    fontWeight: 700,
  },
  ownMessage: {
    color: COLORS.amber,
  },
  otherMessage: {
    color: COLORS.text,
  },

  // Input area
  inputRow: {
    display: 'flex',
    gap: '4px',
    padding: '8px 10px',
    borderTop: `1px solid ${COLORS.border}`,
    flexShrink: 0,
  },
  chatInput: {
    flex: 1,
    background: '#0f1923',
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '11px',
    padding: '6px 8px',
    outline: 'none',
    borderRadius: '4px',
  },
  sendBtn: {
    background: 'none',
    border: `1px solid ${COLORS.border}`,
    color: COLORS.blue,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1px',
    padding: '4px 10px',
    cursor: 'pointer',
    borderRadius: '4px',
  },
};

export default Chat;
