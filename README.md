# Play‑Board Review Space

A full‐stack video‑game review platform—**frontend** in React + Vite + TypeScript, **backend** in Node/Bun, with database migrations, Docker, Nginx reverse‑proxy, and more.

---

## Table of Contents

1. [Monorepo Layout](#monorepo‑layout)  
2. [Features](#features)  
3. [Tech Stack](#tech‑stack)  
4. [Prerequisites](#prerequisites)  
5. [Getting Started](#getting‑started)  
   - [Running Frontend Locally](#running‑frontend‑locally)  
   - [Running Backend Locally](#running‑backend‑locally)  
   - [Running Both via Docker Compose](#running‑both‑via‑docker‑compose)  
6. [Available Scripts](#available‑scripts)  
7. [Environment Variables](#environment‑variables)  
8. [Project Structure](#project‑structure)  
9. [Deployment](#deployment)  
   - [Static Build & Serve](#static‑build‑serve)  
   - [Docker](#docker)  
   - [Vercel / Netlify (Frontend Only)](#vercel‑netlify)  
10. [Contributing](#contributing)  
11. [License](#license)  

## Monorepo Layout

```bash
📁 play‑board-review-space-main/
├── backend/                   # 🚀 Node/Bun API service
│   ├── src/                   # • controllers, routes, models, index.ts
│   ├── migrations/            # • DB migration scripts
│   ├── package.json           # • backend dependencies & scripts
│   ├── bun.lockb              # • bun lockfile (if using Bun)
│   ├── .env.example           # • example env vars for backend
│   └── README.md              # • backend‑specific docs
├── migrations/                 # 🔄 shared DB migration folder
├── nginx.conf                  # 🌐 Nginx reverse proxy config
├── docker-compose.yml          # 🐳 service orchestration (db, api, web, nginx)
├── index.html                  # 📄 static fallback (for SPA + nginx)
├── src/                        # 🎨 frontend Vite app (React + TS)
├── public/                     # 📁 frontend static assets (videos, svg)
├── scripts/                    # 🤖 misc scripts (e.g. scrape.js)
├── postcss.config.js           # 🛠 PostCSS
├── tailwind.config.ts          # 🎨 Tailwind config
├── vite.config.ts              # ⚡ Vite config
├── tsconfig*.json              # 🔧 TypeScript configs
├── package.json                # 📦 root lock & scripts
├── package-lock.json / bun.lockb
├── .gitignore
├── Dockerfile                  # 🐳 multi‑stage Dockerfile
└── README.md
```

## Features
- **Games Collection**  
  - Browse, filter by genre, full‑text search, sort by newest/oldest/rating/reviews  
- **Game Detail Pages**  
  - Cover image, metadata, description, composer, publisher, company profile  
- **User Reviews & Ratings**  
  - Read existing reviews, submit new ones, live‑update average rating  
- **Auth** (mocked)  
  - Login / Register, protected “Add Game” page  
- **Dark / Light Mode**  
- **Mobile‑First & Responsive**  
- **Bohemia Interactive Showcase** at `/bohemia-games`  
- **Containerized**  
  - Docker Compose for API, frontend, Postgres, Nginx  

## Tech Stack
- **Frontend:** Vite • React • TypeScript • Tailwind CSS • shadcn/ui  
- **Backend:** Node.js (or Bun) • Express / Fastify • TypeScript  
- **DB & Migrations:** PostgreSQL • [Knex / TypeORM / Prisma] migrations  
- **Routing:** React Router v6  
- **Icons:** Lucide React  
- **Auth:** JWT (mocked in-memory)  
- **Containerization:** Docker & Docker Compose  
- **Reverse Proxy:** Nginx  

## Prerequisites
- **Node.js** v16+ & **npm** (or **yarn**)  
- **Bun** (optional, if you’re using Bun for backend)  
- **Docker** & **docker‑compose** (for the “one‑command” setup)  
- **PostgreSQL** (if running backend without Docker)  

## Getting Started
### Running Frontend Locally
```bash
# from repo root
cd src
npm install
npm run dev
# → http://localhost:8080
```
### Running Backend Locally
```bash
# from repo root
cd backend
npm install           # or bun install
cp .env.example .env  # configure DB_URL, PORT, JWT_SECRET, etc.
npm run migrate       # run migrations (e.g. via Knex/TypeORM/Prisma)
npm run dev           # start backend on http://localhost:4000 (default)
```
By default the frontend will call `http://localhost:4000/api`—you can override that with `VITE_API_BASE` in the FE `.env`.

### Running Both via Docker Compose

```bash
# from repo root
docker-compose up --build
```
This will spin up:

-   **postgres** (exposed on 5432)
    
-   **backend** (on port 4000)
    
-   **frontend** (on port 8080)
    
-   **nginx** (reverse‑proxy on port 80 → frontend + API)

## Available Scripts

-   `npm run dev` — start Vite dev server
    
-   `npm run build` — bundle for production
    
-   `npm run preview` — serve the `dist/` locally
    
-   `npm run lint` / `npm run format`

-   `npm run dev` — start server with hot‑reload
    
-   `npm run migrate` — run DB migrations
    
-   `npm run seed` — seed initial data
    
-   `npm run start` — production start

## Environment Variables

`.env` (frontend)

`VITE_API_BASE`, `VITE_PORT`, etc.

`backend/.env`

`PORT`, `DATABASE_URL`, `JWT_SECRET`, etc.

Be sure to copy each `.env.example` and fill in your values before running.

## Project Structure
```
.
├── backend/              # API service
│   ├── migrations/       # DB migrations
│   ├── src/              # server code (routes, controllers)
│   ├── .env.example      # env var template
│   ├── package.json      # backend scripts & deps
│   └── bun.lockb         # (if using Bun)
├── migrations/           # (optional) shared migrations
├── docker-compose.yml    # orchestration for all services
├── nginx.conf            # reverse‑proxy configuration
├── src/                  # frontend Vite + React + TS
│   ├── pages/            # React Router views
│   ├── components/       # UI & layout
│   ├── services/api.ts   # in‑memory mock API
│   ├── types/            # TS interfaces
│   └── index.css         # Tailwind imports & custom styles
├── public/               # static assets (videos, icons)
├── scripts/              # misc scripts (e.g. scraper)
├── .gitignore
├── Dockerfile            # multi‑stage for production
├── README.md             # this doc
└── package.json          # root (can hold shared scripts)

```
## Deployment

### Static Build & Serve
```bash
# build frontend only
cd src
npm run build
# serve `dist/` with any static server
npx serve -s dist
```
### Docker
```bash
docker-compose -f docker-compose.yml up -d --build
# browse to http://localhost
```

### Vercel / Netlify (frontend)

-   Set build command → `npm run build`
    
-   Set publish dir → `dist`
    
-   Add `VITE_API_BASE` to environment
    

_Backend_ can go on Heroku/Render etc., point `VITE_API_BASE` at its URL.

## Contributing

1.  Fork & clone
    
2.  `git checkout -b feat/...`
    
3.  `npm install && npm run dev`
    
4.  Push & open a PR

## License

This project is licensed under the MIT License.
