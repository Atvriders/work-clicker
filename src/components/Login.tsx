// ============================================================
// Work Clicker — Login Screen ("Golden Hour Office")
// Warm welcome with editorial typography
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
        <div style={styles.subtitle}>Clock in. Get to work. Clock out.</div>

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
            LOG IN
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
    background: '#FDFAF5',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 40px',
    maxWidth: '420px',
    width: '90%',
    background: '#FFFFFF',
    borderRadius: 16,
    border: '1px solid #E8E2D8',
    boxShadow: '0 8px 32px rgba(45,42,38,0.08)',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '36px',
    fontWeight: 900,
    letterSpacing: 4,
    color: '#2D2A26',
    textAlign: 'center',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  subtitle: {
    fontSize: '15px',
    color: '#B5AFA6',
    marginBottom: '36px',
    fontWeight: 400,
    letterSpacing: 0.5,
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
    color: '#B5AFA6',
    fontWeight: 600,
  },
  input: {
    width: '100%',
    padding: '14px 18px',
    background: '#FDFAF5',
    border: '1px solid #E8E2D8',
    borderRadius: '10px',
    color: '#2D2A26',
    fontSize: '18px',
    fontFamily: "'Source Sans 3', sans-serif",
    letterSpacing: 0.5,
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  error: {
    color: '#C45A3C',
    fontSize: '13px',
    fontWeight: 500,
  },
  button: {
    padding: '14px 48px',
    background: 'linear-gradient(135deg, #E8900C, #D07E08)',
    border: 'none',
    borderRadius: '28px',
    color: '#FFFFFF',
    fontSize: '15px',
    fontFamily: "'Source Sans 3', sans-serif",
    fontWeight: 700,
    letterSpacing: 3,
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 16px rgba(232, 144, 12, 0.3)',
  },
  hint: {
    marginTop: '28px',
    fontSize: '12px',
    color: '#B5AFA6',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: '16px',
    color: '#E8900C',
    letterSpacing: 3,
    fontWeight: 600,
  },
};

export default Login;
