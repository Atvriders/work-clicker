// ============================================================
// Work Clicker — Backend Server (Express + SQLite + WebSocket)
// ============================================================

import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ---- Ensure data directory exists ----
const dataDir = path.join(ROOT, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// ---- SQLite setup ----
const db = new Database(path.join(dataDir, 'workclicker.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS saves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    save_data TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    username TEXT NOT NULL,
    best_shift_wp REAL DEFAULT 0,
    total_shifts INTEGER DEFAULT 0,
    total_wp REAL DEFAULT 0,
    wps REAL DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// ---- Prepared statements ----
const stmts = {
  findUser: db.prepare('SELECT id, username, created_at FROM users WHERE username = ?'),
  createUser: db.prepare('INSERT INTO users (username) VALUES (?)'),
  upsertSave: db.prepare(`
    INSERT INTO saves (user_id, save_data, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET save_data = excluded.save_data, updated_at = datetime('now')
  `),
  getSave: db.prepare('SELECT save_data FROM saves WHERE user_id = ?'),
  getLeaderboard: db.prepare(`
    SELECT username, best_shift_wp, total_shifts, total_wp, wps,
      CASE WHEN updated_at >= datetime('now', '-90 seconds') THEN 1 ELSE 0 END AS is_online
    FROM leaderboard
    ORDER BY best_shift_wp DESC
    LIMIT 50
  `),
  upsertLeaderboard: db.prepare(`
    INSERT INTO leaderboard (user_id, username, best_shift_wp, total_shifts, total_wp, wps, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET
      username = excluded.username,
      best_shift_wp = MAX(leaderboard.best_shift_wp, excluded.best_shift_wp),
      total_shifts = excluded.total_shifts,
      total_wp = excluded.total_wp,
      wps = excluded.wps,
      updated_at = datetime('now')
  `),
};

// ---- Express app ----
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ---- Auth endpoints ----

app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username required' });
  }

  const normalized = username.trim();
  let user = stmts.findUser.get(normalized);
  let isNew = false;

  if (!user) {
    const result = stmts.createUser.run(normalized);
    user = { id: result.lastInsertRowid, username: normalized, created_at: new Date().toISOString() };
    isNew = true;
  }

  res.json({ id: user.id, username: user.username, isNew });
});

// ---- Save endpoints ----

app.post('/api/save', (req, res) => {
  const { username, saveData } = req.body;
  if (!username || !saveData) return res.status(400).json({ error: 'username and saveData required' });

  const user = stmts.findUser.get(String(username).trim());
  if (!user) return res.status(404).json({ error: 'User not found' });

  const dataStr = typeof saveData === 'string' ? saveData : JSON.stringify(saveData);
  stmts.upsertSave.run(user.id, dataStr);

  res.json({ ok: true });
});

app.get('/api/save', (req, res) => {
  const username = req.query.username;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const user = stmts.findUser.get(String(username).trim());
  if (!user) return res.status(404).json({ error: 'User not found' });

  const row = stmts.getSave.get(user.id);
  if (!row) return res.json({ saveData: null });

  try {
    res.json({ saveData: JSON.parse(row.save_data) });
  } catch {
    res.json({ saveData: null });
  }
});

// ---- Leaderboard endpoints ----

app.get('/api/leaderboard', (_req, res) => {
  const rows = stmts.getLeaderboard.all();
  res.json(rows);
});

app.post('/api/leaderboard', (req, res) => {
  const { username, bestShiftWp, totalShifts, totalWp, wps } = req.body;
  if (!username) return res.status(400).json({ error: 'username required' });

  const user = stmts.findUser.get(String(username).trim());
  if (!user) return res.status(404).json({ error: 'User not found' });

  stmts.upsertLeaderboard.run(
    user.id,
    user.username,
    bestShiftWp ?? 0,
    totalShifts ?? 0,
    totalWp ?? 0,
    wps ?? 0,
  );

  res.json({ ok: true });
});

// ---- Production: serve static files ----
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(ROOT, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ---- Create HTTP server and WebSocket server ----
const server = createServer(app);

const wss = new WebSocketServer({ server, path: '/ws' });

// Track connected users: ws -> username
const connectedUsers = new Map();

function getOnlineUsers() {
  const users = [];
  for (const username of connectedUsers.values()) {
    if (username && !users.includes(username)) {
      users.push(username);
    }
  }
  return users.sort();
}

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(msg);
    }
  }
}

wss.on('connection', (ws) => {
  connectedUsers.set(ws, null);

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      if (data.type === 'join' && data.username) {
        const username = String(data.username).trim();
        connectedUsers.set(ws, username);
        broadcast({ type: 'online', users: getOnlineUsers() });
      } else if (data.type === 'chat' && data.username && data.message) {
        const username = String(data.username).trim();
        const message = String(data.message).trim().slice(0, 200);
        if (message.length > 0) {
          broadcast({
            type: 'chat',
            username,
            message,
            timestamp: new Date().toISOString(),
          });
        }
      } else if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'online', users: getOnlineUsers() }));
      }
    } catch {
      // Ignore malformed messages
    }
  });

  ws.on('close', () => {
    connectedUsers.delete(ws);
    broadcast({ type: 'online', users: getOnlineUsers() });
  });
});

// ---- Start server ----
const PORT = process.env.PORT || 3014;
server.listen(PORT, () => {
  console.log(`Work Clicker server running on http://localhost:${PORT}`);
});
