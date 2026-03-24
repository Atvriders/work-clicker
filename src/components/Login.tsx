// ============================================================
// Work Clicker — Login Screen
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

  // Auto-login if username exists in localStorage
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
        <div style={styles.logoIcon}>&#128188;</div>
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
    background: 'linear-gradient(180deg, #0a1219 0%, #0f1923 50%, #0a1219 100%)',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    background: '#1a2332',
    border: '1px solid rgba(26,115,232,0.3)',
    borderRadius: '8px',
    boxShadow: '0 0 30px rgba(26,115,232,0.1)',
    maxWidth: '400px',
    width: '90%',
  },
  logoIcon: {
    fontSize: '48px',
    marginBottom: '8px',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '24px',
    fontWeight: 700,
    letterSpacing: '3px',
    color: '#1a73e8',
    textShadow: '0 0 8px rgba(26,115,232,0.6)',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '12px',
    letterSpacing: '4px',
    color: '#9aa0a6',
    marginBottom: '32px',
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
    letterSpacing: '2px',
    color: '#9aa0a6',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: '#0f1923',
    border: '1px solid rgba(26,115,232,0.4)',
    borderRadius: '4px',
    color: '#e8eaed',
    fontSize: '18px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    letterSpacing: '2px',
    textAlign: 'center',
    outline: 'none',
    boxSizing: 'border-box',
  },
  error: {
    color: '#ea4335',
    fontSize: '12px',
    letterSpacing: '1px',
  },
  button: {
    padding: '10px 32px',
    background: '#1a73e8',
    border: 'none',
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: 600,
    letterSpacing: '3px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'background 0.2s',
  },
  hint: {
    marginTop: '24px',
    fontSize: '10px',
    color: '#9aa0a6',
    letterSpacing: '1px',
    textAlign: 'center',
    opacity: 0.6,
  },
  loadingText: {
    fontSize: '16px',
    color: '#1a73e8',
    letterSpacing: '4px',
    textShadow: '0 0 8px rgba(26,115,232,0.6)',
  },
};

export default Login;
