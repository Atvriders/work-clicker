// ============================================================
// Work Clicker — Login Screen ("Late Night Office")
// Clock-in terminal with dark theme
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';

interface LoginProps {
  onLogin: (username: string, isNew: boolean) => void;
}

const USERNAME_KEY = 'work-clicker-username';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.container}>
          <div style={styles.loadingText}>CONNECTING...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <h1 style={styles.title}>WORK CLICKER</h1>
        <div style={styles.subtitle}>Clock in to start your shift</div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>YOUR NAME</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            style={styles.input}
            autoFocus
            maxLength={20}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button}>
            CLOCK IN
          </button>
        </form>

        <div style={styles.hint}>
          Your name is your identity. No password needed.
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
    background: '#1A1A1E',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 40px',
    maxWidth: '420px',
    width: '90%',
    background: '#2A2A2F',
    borderRadius: 16,
    border: '1px solid #3A3A3F',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: 4,
    color: '#E8D44D',
    textAlign: 'center',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  subtitle: {
    fontSize: '15px',
    color: '#9E9B94',
    marginBottom: '36px',
    fontWeight: 400,
    letterSpacing: 0.5,
    fontFamily: "'Nunito', 'Source Sans 3', sans-serif",
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    width: '100%',
  },
  label: {
    fontSize: '11px',
    letterSpacing: 2,
    color: '#9E9B94',
    fontWeight: 600,
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    background: '#1A1A1E',
    border: '1px solid #E8D44D',
    borderRadius: '10px',
    color: '#E8D44D',
    fontSize: '18px',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    letterSpacing: 0.5,
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  error: {
    color: '#EF5350',
    fontSize: '13px',
    fontWeight: 500,
  },
  button: {
    padding: '14px 48px',
    background: '#E8D44D',
    border: 'none',
    borderRadius: '28px',
    color: '#1A1A1E',
    fontSize: '15px',
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 16px rgba(232, 212, 77, 0.25)',
  },
  hint: {
    marginTop: '28px',
    fontSize: '12px',
    color: '#6B6860',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: '16px',
    color: '#E8D44D',
    letterSpacing: 3,
    fontWeight: 600,
    fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
  },
};

export default Login;
