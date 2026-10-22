# Ethio Exam Hall — Vercel Independent Deployment Guide

This guide describes how to deploy all 3 parts of Ethio Exam Hall (**Backend API**, **Student Main Website**, and **Admin Control Center**) to **Vercel** independently from the same GitHub repository (`https://github.com/Fira-Tech-Solutions/ethio_exam_hall.git`).

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │             PostgreSQL                 │
                      │  (Neon / Supabase / Vercel Postgres)   │
                      └──────────────────┬─────────────────────┘
                                         │
                                         ▼
                 ┌──────────────────────────────────────────────────┐
                 │             Project 1: Backend API               │
                 │      (Vercel Serverless Node.js Express)         │
                 │   Root Directory: backend_service                │
                 │   URL: https://ethio-exam-backend.vercel.app     │
                 └───────────────▲──────────────────▲───────────────┘
                                 │                  │
                                 │ REST API Calls   │ REST API Calls
                                 │                  │
        ┌────────────────────────┴────────┐        ┌┴─────────────────────────────────┐
        │    Project 2: Main Website      │        │    Project 3: Admin Panel        │
        │      (Vite + React SPA)         │        │      (Vite + React SPA)          │
        │ Root Directory: main_website    │        │ Root Directory: admin_panel      │
        │ URL: https://ethio-exam.vercel  │        │ URL: https://ethio-admin.vercel  │
        └─────────────────────────────────┘        └──────────────────────────────────┘
```

---

## 1. Database Setup (Prerequisite)

Before deploying the backend, prepare a hosted PostgreSQL database:
- **Neon Serverless Postgres** (Recommended: free tier, instant provisioning): [https://neon.tech](https://neon.tech)
- Or **Supabase**: [https://supabase.com](https://supabase.com)
- Or **Vercel Postgres**

Copy the connection string URL (e.g., `postgresql://user:password@ep-cool-fog-12345.us-east-2.aws.neon.tech/ethio_exam_hall?sslmode=require`).

### Run Initial Migrations & Seed Data:
Run this from your terminal once against your remote database:
```bash
cd backend_service
DATABASE_URL="postgresql://user:password@..." npm run migrate
DATABASE_URL="postgresql://user:password@..." npm run seed
```

---

## 2. Deploy Project 1: Backend Service (`backend_service`)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New...** -> **Project**.
2. Select your repository: `Fira-Tech-Solutions/ethio_exam_hall`.
3. Configure Project Settings:
   - **Project Name**: `ethio-exam-backend`
   - **Framework Preset**: `Other`
   - **Root Directory**: Click *Edit* and select **`backend_service`**.
4. In **Environment Variables**, add:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | `postgresql://...` | Hosted PostgreSQL connection string |
   | `DB_SSL` | `true` | Enables secure SSL connection |
   | `CORS_ORIGIN` | `*` | Or comma-separated frontend URLs |
   | `JWT_SECRET` | `your_secret_production_key_here` | 32+ character random string |
   | `JWT_EXPIRES_IN` | `7d` | Token expiry |
   | `FRONTEND_URL` | `https://ethio-exam.vercel.app` | Your deployed student site URL |
   | `BACKEND_URL` | `https://ethio-exam-backend.vercel.app` | This project's Vercel URL |
   | `TELEGRAM_LOGIN_ENABLED` | `true` | Enable Telegram authentication |
   | `TELEGRAM_CLIENT_ID` | `8617112949` | Your Bot ID from @BotFather |
   | `TELEGRAM_CLIENT_SECRET` | `8617112949:AA...` | Your Bot Token from @BotFather |
   | `TELEGRAM_BOT_USERNAME` | `ET_EXAM_HALL_bot` | Your Telegram Bot Username |
   | `TELEGRAM_REDIRECT_URI` | `https://ethio-exam-backend.vercel.app/api/auth/telegram/callback` | Callback URL |
   | `TELEGRAM_ORIGIN` | `https://ethio-exam-backend.vercel.app` | Allowed Origin domain |
5. Click **Deploy**.
6. When deployment finishes, test: `https://ethio-exam-backend.vercel.app/api/health` -> should return `status: "healthy"`.

---

## 3. Deploy Project 2: Student Main Website (`main_website`)

1. In Vercel Dashboard, click **Add New...** -> **Project**.
2. Select `Fira-Tech-Solutions/ethio_exam_hall`.
3. Configure Project Settings:
   - **Project Name**: `ethio-exam`
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`main_website`**.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://ethio-exam-backend.vercel.app` | URL from Project 1 |
5. Click **Deploy**.
6. The client-side routing, service worker, and API communication are pre-configured in `vercel.json` and will work out of the box.

---

## 4. Deploy Project 3: Admin Control Center (`admin_panel`)

1. In Vercel Dashboard, click **Add New...** -> **Project**.
2. Select `Fira-Tech-Solutions/ethio_exam_hall`.
3. Configure Project Settings:
   - **Project Name**: `ethio-exam-admin`
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`admin_panel`**.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://ethio-exam-backend.vercel.app` | URL from Project 1 |
5. Click **Deploy**.

---

## 5. Telegram @BotFather Allowed Domain Setup

Once your backend is live on Vercel:
1. Open [@BotFather](https://t.me/BotFather) in Telegram.
2. Send `/setdomain`.
3. Select your bot: `@ET_EXAM_HALL_bot`.
4. Enter your backend Vercel domain (without `https://`):
   ```
   ethio-exam-backend.vercel.app
   ```
5. BotFather will reply: `Success! Domain linked to the bot.`
