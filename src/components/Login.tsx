// ============================================================
// Work Clicker — Login Screen (Modern Office)
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
        <div style={styles.container} className="glass-card">
          <div style={styles.loadingText}>CONNECTING...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.container} className="glass-card">
        <div style={styles.logoIcon}>{'\uD83D\uDCBC'}</div>
        <h1 style={styles.title}>WORK CLICKER</h1>
        <div style={styles.subtitle}>EMPLOYEE LOGIN</div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>ENTER YOUR NAME</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
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
    background: 'linear-gradient(135deg, #0f1923 0%, #141e2b 50%, #0f1923 100%)',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    maxWidth: '420px',
    width: '90%',
  },
  logoIcon: {
    fontSize: '52px',
    marginBottom: '8px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '26px',
    fontWeight: 700,
    letterSpacing: 2,
    color: '#1a73e8',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '12px',
    letterSpacing: 3,
    color: '#9aa0a6',
    marginBottom: '32px',
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  label: {
    fontSize: '11px',
    letterSpacing: 1.5,
    color: '#9aa0a6',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(15, 25, 35, 0.6)',
    border: '1px solid rgba(26, 115, 232, 0.3)',
    borderRadius: '8px',
    color: '#e8eaed',
    fontSize: '18px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    letterSpacing: 1,
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  },
  error: {
    color: '#ea4335',
    fontSize: '12px',
    fontWeight: 500,
  },
  button: {
    padding: '12px 36px',
    background: 'linear-gradient(135deg, #1a73e8, #1557b0)',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(26, 115, 232, 0.3)',
  },
  hint: {
    marginTop: '24px',
    fontSize: '11px',
    color: '#9aa0a6',
    letterSpacing: 0.5,
    textAlign: 'center',
    opacity: 0.5,
  },
  loadingText: {
    fontSize: '16px',
    color: '#1a73e8',
    letterSpacing: 3,
    fontWeight: 600,
  },
};

export default Login;
