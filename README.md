# ExportProfiles 🚀

A full-stack web application that allows users to **sign in with Google, save URLs/links, and export their saved profiles as a CSV file**.

Built during my **AI Automation Internship** using Lovable (AI UI builder) and Claude AI.

---

## 🔍 What It Does

- Google OAuth login (sign in with your Google account)
- Save URLs with title, type, first name, and last name
- Daily link limit per user
- Export all saved links as a **CSV file**
- Fully deployed on **Vercel** with a cloud database

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express (Serverless on Vercel) |
| Database | Supabase (PostgreSQL) |
| Auth | Google OAuth 2.0 |
| Deployment | Vercel |

---

## 🏗 Architecture
Browser
↓
Vercel Frontend (React + Vite)
↓ API calls
Vercel Backend (Express serverless)
↓ queries
Supabase PostgreSQL (Cloud Database)
↓ auth
Google Cloud Console (OAuth)

---

## ⚙️ Features

- ✅ Google OAuth authentication
- ✅ Save and manage profile links
- ✅ Daily link limit enforcement
- ✅ CSV export functionality
- ✅ Row Level Security (RLS) on database
- ✅ Production-ready deployment on Vercel

---

## 🤖 Built With AI

This project was built entirely using AI tools:
- **Lovable** — for UI generation and frontend scaffolding
- **Claude AI** — for backend logic, database design, and deployment setup

---

## 🚀 Getting Started

1. Clone the repo  
   `git clone https://github.com/Saiajaykumar12/ExportProfiles.git`

2. Install dependencies  
   `npm install`

3. Set up environment variables (see `.env.example`)

4. Start the dev server  
   `npm run dev`

See `SETUP_GUIDE.md` for full setup instructions including Supabase and Google OAuth configuration.

---

## 📁 Project Structure
├── src/          # React frontend
├── backend/      # Express API (serverless)
├── supabase/     # DB migrations
├── api/          # Vercel API routes
└── public/       # Static assets
