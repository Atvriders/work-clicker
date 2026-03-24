# Work Clicker — Race the clock!

An idle/clicker game about getting as much work done as possible before clock-out. Earn Work Points (WP) by clicking, buy stations that generate passive income, unlock upgrades, trigger random office events, and compete on the leaderboard — all before your shift ends.

## Core Mechanics

- **Real-time clock-out** — Each shift has a countdown timer. When it hits zero, your shift is over. Earn as much WP as you can before time runs out.
- **WP currency** — Work Points are earned by clicking and through passive station income. Spend them on stations and upgrades to multiply your output.
- **Shifts** — Complete shifts to track your best performance. Your best single-shift WP is your leaderboard score.
- **Overtime** — Keep working past clock-out for bonus earnings.

## Stations

Stations generate passive WP per second (WPS). Each station can be purchased multiple times with escalating costs (1.15x multiplier per owned).

| Station | Base WPS | Base Cost | Tier |
|---------|----------|-----------|------|
| Sticky Notes | 0.1 | 15 | 1 |
| Coffee Machine | 0.5 | 100 | 1 |
| Desktop Computer | 2 | 500 | 2 |
| Standing Desk | 8 | 2,500 | 2 |
| Dual Monitors | 30 | 10,000 | 3 |
| Private Office | 120 | 50,000 | 3 |
| Executive Suite | 400 | 200,000 | 4 |
| Remote Work Setup | 2,500 | 1,000,000 | 4 |
| AI Assistant | 8,000 | 5,000,000 | 5 |
| Automation Pipeline | 25,000 | 25,000,000 | 5 |
| Outsource Team | 80,000 | 100,000,000 | 6 |
| CEO Position | 300,000 | 500,000,000 | 6 |

## Upgrades

Upgrades provide permanent multipliers to clicks or WPS. Some require prerequisites.

**Click Upgrades:** Coffee (x1.5), Energy Drink (x2), Ergonomic Keyboard (+3 flat), Second Monitor (x2), Friday Casual (x3)

**WPS Upgrades:** Noise Cancelling Headphones (x1.5), Slack Status: Busy (x1.5), VPN (x2), ChatGPT Subscription (x2), Unlimited PTO (x2.5), Stock Options (x3), Corner Office (x5), Executive Parking (x3), Company Card (x8), Golden Parachute (x10)

## Achievements

15 achievements across multiple categories:

- **Click milestones** — Employee Onboarding (1), Carpal Tunnel Candidate (100), The Human Macro (1,000), Repetitive Strain Legend (10,000)
- **WP milestones** — Minimum Effort (1K), Actually Productive (100K), Employee of the Month (10M), Corporate Machine (1B)
- **WPS milestones** — Getting Somewhere (10), Productivity Guru (1K), One Person Army (100K)
- **Shift milestones** — First Day on the Job (1), Regular Employee (10)
- **Hidden** — Overtime Warrior (30 min overtime), Lives at the Office (8 hours overtime)

## Random Events

Events trigger randomly during shifts and can help or hinder your progress:

| Event | Effect | Duration |
|-------|--------|----------|
| Coffee Break | Click power x3 | 20s |
| Donut Day | Click power x2.5 | 25s |
| Pizza Party | WPS x2 | 30s |
| Boss is on Vacation | WPS x2.5 | 45s |
| Power Nap | All x2 | 30s |
| Team Building Exercise | +5,000 WP bonus | Instant |
| Mandatory Meeting | No passive income | 15s |
| Fire Drill | No passive income | 10s |
| Server Outage | WPS x0.5 | 25s |
| TPS Reports Due | WPS x0.6 | 20s |
| Internet is Down | WPS x0.3 | 20s |
| Surprise Audit | Click power x0.5 | 20s |

## Multiplayer Features

- **Login** — Pick a username to save progress and appear on the leaderboard.
- **Leaderboard** — Compete for the highest single-shift WP. Shows online status (green dot for active players).
- **Ephemeral Chat** — Real-time WebSocket chat between online players. Messages are not persisted.

## Quick Start

```bash
# Install dependencies
npm install

# Run in development (server + Vite HMR)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The dev server runs Vite on port 3015 with API proxy to the Express backend on port 3014.

## Docker Deployment

```bash
# Pull and run with docker-compose
docker-compose up -d

# Or build locally
docker build -t work-clicker .
docker run -d -p 3014:3014 -v ./data:/app/data work-clicker
```

The SQLite database is stored in `./data/` and persisted via volume mount.

## Mobile Support

Fully responsive. The click button and all UI panels adapt to mobile screen sizes.

## Tech Stack

- **Frontend:** React 18, TypeScript, Zustand (state management), Vite 5
- **Backend:** Express 4, better-sqlite3, WebSocket (ws)
- **Database:** SQLite with WAL mode
- **Deployment:** Docker multi-arch (amd64, arm64, arm/v7), GitHub Container Registry

## Project Structure

```
work-clicker/
├── src/
│   ├── App.tsx              # Main game layout
│   ├── main.tsx             # React entry point
│   ├── components/
│   │   ├── WorkButton.tsx   # Main click target
│   │   ├── StationList.tsx  # Station purchasing
│   │   ├── Shop.tsx         # Upgrade shop
│   │   ├── ClockOutTimer.tsx # Shift countdown
│   │   ├── StatsPanel.tsx   # WP/WPS display
│   │   ├── EventPopup.tsx   # Random event overlay
│   │   ├── EventLog.tsx     # Event history
│   │   ├── Achievements.tsx # Achievement tracker
│   │   ├── Leaderboard.tsx  # Online leaderboard
│   │   ├── Chat.tsx         # Ephemeral chat
│   │   └── Login.tsx        # Username entry
│   ├── data/
│   │   ├── stations.ts      # Station definitions
│   │   ├── upgrades.ts      # Upgrade definitions
│   │   ├── achievements.ts  # Achievement definitions
│   │   └── events.ts        # Random event definitions
│   ├── stores/              # Zustand stores
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
├── server/
│   └── index.js             # Express + SQLite + WebSocket server
├── data/                    # SQLite database (gitignored)
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

Built with [Claude Code](https://claude.ai/claude-code)
