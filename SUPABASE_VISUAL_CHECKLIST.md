# 🔧 Supabase Setup - Visual Checklist

## What You Just Did ✅
You created a Supabase account and project. Great! Now continue...

---

## STEP 1️⃣: Get Your 3 Secret Keys (Copy-Paste Ready)

### Where to find them:
```
Supabase Dashboard
    ↓
Click: Settings (bottom left gear icon)
    ↓
Click: API (in the menu)
    ↓
You'll see a section called "Project API keys"
```

### What to copy:
```
🔑 KEY 1: Project URL
   Location: Top of the "Project API keys" section
   Looks like: https://xxxxx.supabase.co
   Name it: SUPABASE_URL

🔑 KEY 2: Anon Public
   Location: Under "Project API keys"
   Looks like: eyJhbGc...
   Name it: SUPABASE_ANON_KEY

🔑 KEY 3: Service Role ⚠️ SECRET!
   Location: Under "Project API keys"
   Looks like: eyJhbGc... (longer than KEY 2)
   Name it: SUPABASE_SERVICE_ROLE_KEY
```

### Save them like this:
```txt
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...very...long...string...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...even...longer...string...
```

---

## STEP 2️⃣: Create Database Tables

### In Supabase:
```
Left Sidebar → SQL Editor → New Query
```

### Copy this entire file:
```
File: backend/SUPABASE_MIGRATION.sql
Action: Open it and copy everything (Ctrl+A, Ctrl+C)
```

### Paste into Supabase:
```
Paste in the SQL Editor (Ctrl+V)
Click: Run button
Wait: 3 seconds
Look for: "Query executed successfully" ✅
```

---

## STEP 3️⃣: Verify Tables Created

### Check it worked:
```
Left Sidebar → Tables
Look for:
  ✅ users (with 8 columns)
  ✅ links (with 9 columns)
```

**If you see both tables = SUPABASE IS DONE! ✅**

---

## STEP 4️⃣: Update Your .env File

### Open this file:
```
backend/.env
```

### Replace with this:
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
SUPABASE_URL=<paste KEY 1 here>
SUPABASE_ANON_KEY=<paste KEY 2 here>
SUPABASE_SERVICE_ROLE_KEY=<paste KEY 3 here>
SESSION_SECRET=<see below>
FRONTEND_URL=http://localhost:8080
NODE_ENV=development
```

### Generate SESSION_SECRET:
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output and paste as SESSION_SECRET

### Save the file:
```
Ctrl+S
```

---

## STEP 5️⃣: Install Dependencies

### Terminal 1:
```powershell
npm install
```

### Terminal 2:
```powershell
cd backend
npm install
cd ..
```

**Wait for both to finish (you'll see "added X packages")**

---

## ✅ Done with Supabase!

### What you have now:
- ✅ Supabase project created
- ✅ Database tables created
- ✅ 3 API keys saved securely
- ✅ .env file updated
- ✅ Dependencies installed

### Next: Test Locally
```
Terminal 1: cd backend && npm start
Terminal 2: npm run dev
Browser: http://localhost:8080
```

---

## 📸 Visual Map

```
You are here ↓
    │
    ├─ Supabase Setup (DONE!) ✅
    │
    ├─ Local Testing (NEXT)
    │  ├─ Start backend
    │  ├─ Start frontend
    │  ├─ Test login
    │  └─ Test creating link
    │
    ├─ Deploy to Vercel
    │  ├─ Push to GitHub
    │  ├─ Connect to Vercel
    │  ├─ Add env variables
    │  └─ Deploy
    │
    └─ Update Google OAuth
       └─ Add Vercel URL to Google Console
```

---

## 🚨 Common Mistakes

❌ **Mistake:** Forgot to copy one of the 3 keys
✅ **Fix:** Go back to Settings → API and copy again

❌ **Mistake:** Pasted wrong key in wrong place
✅ **Fix:** Check the key names (URL, ANON_KEY, SERVICE_ROLE_KEY)

❌ **Mistake:** Didn't run SQL, or it failed
✅ **Fix:** Go to SQL Editor → New Query → Paste again → Click Run

❌ **Mistake:** Tables don't show up in Tables tab
✅ **Fix:** Refresh the page (F5) or wait a few seconds

❌ **Mistake:** npm install failed
✅ **Fix:** Delete node_modules, delete package-lock.json, run npm install again

---

## 🎯 Summary: What Happened

### Before Supabase:
```
Your app used SQLite (a file)
❌ Files don't persist on Vercel
❌ Each deployment is fresh
❌ You'd lose all data
```

### After Supabase:
```
Your app uses PostgreSQL (cloud database)
✅ Data persists forever
✅ Works perfectly on Vercel
✅ Scales with your app
```

---

**You're ready for Phase 3: Local Testing!** 🚀

Open: `SETUP_GUIDE.md` → Phase 3
