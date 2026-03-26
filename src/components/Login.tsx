// ============================================================
// Work Clicker — Login Screen ("Corporate Dystopia Brutalism")
// Bleak clock-in terminal from the void
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';

interface LoginProps {
  onLogin: (username: string, isNew: boolean) => void;
}

const USERNAME_KEY = 'work-clicker-username';

const BLINK_KEYFRAMES = `
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}
@keyframes heartbeat-line {
  0% { background-position: -300px 0; }
  100% { background-position: 300px 0; }
}
`;

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState(false);

  const doLogin = useCallback(async (name: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }
      const data = await res.json();
      localStorage.setItem(USERNAME_KEY, data.username);
      onLogin(data.username, data.isNew);
    } catch (err: any) {
      setError(err.message || 'Connection failed');
      setLoading(false);
    }
  }, [onLogin]);

  useEffect(() => {
    const saved = localStorage.getItem(USERNAME_KEY);
    if (saved) {
      doLogin(saved);
    } else {
      setLoading(false);
    }
  }, [doLogin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Enter your name');
      return;
    }
    doLogin(trimmed);
  };

  const s = styles;

  if (loading) {
    return (
      <div style={s.wrapper}>
        <style>{BLINK_KEYFRAMES}</style>
        <div style={s.card}>
          <div style={s.heartbeatLine} />
          <div style={s.cardInner}>
            <div style={s.loadingText}>AUTHENTICATING...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.wrapper}>
      <style>{BLINK_KEYFRAMES}</style>
      <div style={s.card}>
        <div style={s.heartbeatLine} />
        <div style={s.cardInner}>
          <h1 style={s.title}>WORK CLICKER</h1>
          <div style={s.subtitle}>Clock in. Grind. Clock out.</div>

          <form onSubmit={handleSubmit} style={s.form}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Enter employee ID..."
              style={{
                ...s.input,
                borderColor: focused ? '#D4A017' : '#333',
                boxShadow: focused ? '0 0 0 2px rgba(212,160,23,0.25)' : 'none',
              }}
              autoFocus
              maxLength={20}
            />

            {error && <div style={s.error}>{error}</div>}

            <button type="submit" style={s.button}>
              PUNCH IN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    background: '#0a0a0a',
    margin: 0,
    padding: 0,
  },
  card: {
    maxWidth: 360,
    width: '90%',
    background: '#111',
    border: '1px solid #222',
    borderRadius: 0,
    boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 1px rgba(212,160,23,0.3)',
    overflow: 'hidden',
    position: 'relative',
  },
  heartbeatLine: {
    height: 3,
    width: '100%',
    background: 'linear-gradient(90deg, transparent 0%, #D4A017 40%, #E8D44D 50%, #D4A017 60%, transparent 100%)',
    backgroundSize: '300px 3px',
    backgroundRepeat: 'no-repeat',
    animation: 'heartbeat-line 2s ease-in-out infinite',
  },
  cardInner: {
    padding: '48px 36px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '0.2em',
    color: '#D4A017',
    textAlign: 'center',
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 13,
    color: '#555',
    marginBottom: 36,
    fontWeight: 400,
    fontStyle: 'italic',
    letterSpacing: '0.05em',
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
    width: '100%',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    background: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: 0,
    color: '#ccc',
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    letterSpacing: '0.05em',
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  error: {
    color: '#EF5350',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    letterSpacing: '0.05em',
  },
  button: {
    width: '100%',
    padding: '14px 0',
    background: '#D4A017',
    border: 'none',
    borderRadius: 0,
    color: '#0a0a0a',
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: 8,
    transition: 'background 0.15s ease',
  },
  loadingText: {
    fontSize: 15,
    color: '#D4A017',
    letterSpacing: '0.15em',
    fontWeight: 700,
    fontFamily: "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace",
    animation: 'blink 1.2s ease-in-out infinite',
  },
};

export default Login;
