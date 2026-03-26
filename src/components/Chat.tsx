// ============================================================
// Work Clicker — Chat ("Corporate Dystopia Brutalism")
// The Break Room — sanctioned social interaction zone
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
  const [showUsers, setShowUsers] = useState(true);
  const [inputFocused, setInputFocused] = useState(false);
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

  const s = styles;

  // Collapsed button
  if (!open) {
    return (
      <button
        style={{
          ...s.chatButton,
          bottom: isMobile ? '68px' : '16px',
        }}
        onClick={() => setOpen(true)}
      >
        <span role="img" aria-label="chat" style={{ fontSize: 18 }}>💬</span>
        {unread > 0 && (
          <span style={s.badge}>{unread > 99 ? '99+' : unread}</span>
        )}
      </button>
    );
  }

  // Expanded chat window
  return (
    <div
      style={{
        ...s.chatWindow,
        bottom: isMobile ? '68px' : '16px',
      }}
    >
      <div style={s.amberBorder} />
      <div style={s.chatHeader}>
        <span style={s.chatTitle}>BREAK ROOM</span>
        <span style={s.onlineLabel}>
          <span style={s.greenDotHeader} />
          {onlineUsers.length}
        </span>
        <button style={s.chatCollapseBtn} onClick={() => setOpen(false)}>&#10005;</button>
      </div>

      {/* Online users bar (collapsible) */}
      <div
        style={s.onlineToggle}
        onClick={() => setShowUsers(!showUsers)}
      >
        <span style={{ color: '#555', fontSize: 9, letterSpacing: '0.1em' }}>
          {showUsers ? '▾' : '▸'} ONLINE ({onlineUsers.length})
        </span>
      </div>

      {showUsers && (
        <div style={s.onlineBar}>
          {onlineUsers.length > 0 ? onlineUsers.map((u) => (
            <span key={u} style={s.onlineUser}>
              <span style={s.greenDot} />
              {u}
            </span>
          )) : (
            <span style={{ color: '#333', fontSize: 9 }}>No one else online</span>
          )}
        </div>
      )}

      <div style={s.messageList}>
        {messages.length === 0 ? (
          <div style={s.emptyChat}>No messages yet</div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.username === username;
            return (
              <div
                key={msg.id}
                style={{
                  ...s.messageRow,
                  background: isOwn ? 'rgba(212,160,23,0.08)' : 'transparent',
                }}
              >
                <div style={s.msgHeader}>
                  <span style={{
                    color: isOwn ? '#D4A017' : '#888',
                    fontWeight: 700,
                    fontSize: 11,
                  }}>
                    {msg.username}
                  </span>
                  <span style={s.timestamp}>{formatTime(msg.timestamp)}</span>
                </div>
                <div style={s.messageText}>{msg.message}</div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={s.inputRow}>
        <input
          style={{
            ...s.chatInput,
            borderColor: inputFocused ? '#D4A017' : '#222',
            boxShadow: inputFocused ? '0 0 0 1px rgba(212,160,23,0.3)' : 'none',
          }}
          type="text"
          maxLength={200}
          placeholder="Type message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        />
        <button
          style={{
            ...s.sendBtn,
            opacity: !input.trim() || !connected ? 0.3 : 1,
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
    right: 16,
    zIndex: 4000,
    background: '#D4A017',
    border: 'none',
    color: '#0a0a0a',
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    fontSize: 16,
    fontWeight: 700,
    padding: 0,
    borderRadius: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    boxShadow: '0 2px 12px rgba(212,160,23,0.3)',
    transition: 'background 0.15s ease',
  },
  badge: {
    background: '#EF5350',
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 5px',
    borderRadius: 0,
    minWidth: 16,
    textAlign: 'center',
    letterSpacing: 0,
    position: 'absolute',
    top: -6,
    right: -6,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
  },

  chatWindow: {
    position: 'fixed',
    right: 16,
    width: 300,
    height: 420,
    zIndex: 4000,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    background: '#111',
    borderRadius: 0,
    border: '1px solid #222',
    boxShadow: '0 4px 40px rgba(0,0,0,0.6)',
    overflow: 'hidden',
  },
  amberBorder: {
    height: 3,
    width: '100%',
    background: '#D4A017',
    flexShrink: 0,
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    background: '#141414',
    borderBottom: '1px solid #1a1a1a',
    flexShrink: 0,
    gap: 8,
  },
  chatTitle: {
    color: '#D4A017',
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    letterSpacing: '0.1em',
    flex: 1,
  },
  onlineLabel: {
    fontSize: 10,
    color: '#4CAF50',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontWeight: 600,
  },
  greenDotHeader: {
    display: 'inline-block',
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: '#4CAF50',
  },
  chatCollapseBtn: {
    background: 'transparent',
    border: '1px solid #222',
    color: '#555',
    fontSize: 12,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    cursor: 'pointer',
    padding: '2px 8px',
    borderRadius: 0,
    fontWeight: 400,
    lineHeight: 1,
  },

  onlineToggle: {
    padding: '4px 12px',
    cursor: 'pointer',
    background: '#0e0e0e',
    borderBottom: '1px solid #1a1a1a',
    flexShrink: 0,
    userSelect: 'none',
  },
  onlineBar: {
    padding: '4px 12px 6px',
    fontSize: 9,
    color: '#666',
    borderBottom: '1px solid #1a1a1a',
    flexShrink: 0,
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    fontWeight: 500,
    background: '#0e0e0e',
  },
  onlineUser: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
  },
  greenDot: {
    display: 'inline-block',
    width: 4,
    height: 4,
    borderRadius: '50%',
    background: '#4CAF50',
  },

  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '6px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    background: '#0a0a0a',
  },
  emptyChat: {
    color: '#333',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 60,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    letterSpacing: '0.05em',
  },
  messageRow: {
    padding: '5px 12px',
    borderBottom: '1px solid #111',
  },
  msgHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 1,
  },
  timestamp: {
    color: '#333',
    fontSize: 10,
    fontVariantNumeric: 'tabular-nums',
  },
  messageText: {
    color: '#777',
    fontSize: 11,
    lineHeight: 1.4,
    wordBreak: 'break-word',
  },

  inputRow: {
    display: 'flex',
    gap: 0,
    padding: '8px 10px',
    borderTop: '1px solid #1a1a1a',
    flexShrink: 0,
    background: '#111',
  },
  chatInput: {
    flex: 1,
    background: '#0a0a0a',
    border: '1px solid #222',
    borderRight: 'none',
    color: '#999',
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    fontSize: 11,
    padding: '8px 10px',
    outline: 'none',
    borderRadius: 0,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  },
  sendBtn: {
    background: '#D4A017',
    border: 'none',
    color: '#0a0a0a',
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.1em',
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: 0,
    transition: 'opacity 0.15s ease',
  },
};

export default Chat;
