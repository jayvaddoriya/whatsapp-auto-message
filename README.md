# WhatsApp Auto-Message Broadcast Scheduler System

A premium, responsive WhatsApp broadcasting and scheduling system built with Node.js, React (Vite), SQLite, and Baileys. Supports dark/light modes and English/Gujarati languages.

## 🚀 One-Click Cloud Deployment

You can deploy this application directly from GitHub using the buttons below:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/jayvaddoriya/whatsapp-auto-message)
&nbsp;&nbsp;
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/jayvaddoriya/whatsapp-auto-message)

> [!IMPORTANT]
> **Stateful Volume Mounting (Persistent Storage)**
> Since SQLite databases (`backend/database.sqlite`) and WhatsApp login sessions (`backend/auth/`) are stored locally, you **MUST** attach a **Persistent Volume (Disk)** and mount it to `/app/backend` (or the folder where the backend runs) in Railway/Render settings. Otherwise, your WhatsApp connection will be lost every time the server restarts.

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Lucide Icons, Pure CSS (Responsive UI, Glassmorphism, Theme/Lang Switchers).
- **Backend**: Node.js, Express, SQLite3, `@whiskeysockets/baileys` (WhatsApp Web socket connection), `node-cron` background runner.

---

## 💻 Local Setup & Execution

### 1. Install dependencies
From the project root directory, run:
```bash
npm run install:all
```

### 2. Run in Development Mode
Starts the backend on port `5000` (with nodemon) and the Vite frontend on port `5173` (with HMR and api proxying):
```bash
npm run dev
```
Navigate to `http://localhost:5173`.

### 3. Run in Production Mode (Single Unified Server)
Compiles frontend assets to `dist/` and runs the backend Express server which serves the React assets directly under a single process:
```bash
# Build frontend
npm run build

# Start production server
npm run start
```
Navigate to `http://localhost:5000`.
