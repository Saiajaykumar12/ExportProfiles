# Supabase Setup - Step by Step

Your project is created! Now follow these exact steps:

---

## STEP 1: Get Your Credentials (2 minutes)

After your project finishes loading:

### 1.1 Find the API credentials page
- In Supabase dashboard, look at the **LEFT SIDEBAR**
- Click **"Settings"** (gear icon at bottom)
- Click **"API"** (in the left menu under Settings)

### 1.2 Copy These Three Values and SAVE THEM SOMEWHERE SAFE:

You'll see a section called **"Project API keys"**

**VALUE 1: Copy the Project URL**
- Look for: **"Project URL"**
- It looks like: `https://xxxxxxxxxxxx.supabase.co`
- **Copy and paste it into a text file or notepad**
- **Label it:** `SUPABASE_URL`

**VALUE 2: Copy the Anon Public Key**
- Look for: **"anon public"** key
- It's a long string starting with `eyJ...`
- **Copy and paste it**
- **Label it:** `SUPABASE_ANON_KEY`

**VALUE 3: Copy the Service Role Key (⚠️ Keep this SECRET!)**
- Look for: **"service_role"** key  
- It's a long string starting with `eyJ...` (longer than anon key)
- **Copy and paste it**
- **Label it:** `SUPABASE_SERVICE_ROLE_KEY`

**Save all three in a text file like this:**
```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

## STEP 2: Create Database Tables (5 minutes)

### 2.1 Go to SQL Editor
- In Supabase dashboard, click **"SQL Editor"** (left sidebar)
- Click the **"New Query"** button (top right)

### 2.2 Copy the SQL Code
- Open this file on your computer: `backend/SUPABASE_MIGRATION.sql`
- **Select ALL the text** (Ctrl+A)
- **Copy it** (Ctrl+C)

### 2.3 Paste into Supabase
- In Supabase SQL Editor, **paste the SQL** (Ctrl+V)
- You should see a long block of SQL code

### 2.4 Run the SQL
- Click the **"Run"** button (bottom right of the SQL box)
- Wait a few seconds...
- You should see: **"Query executed successfully"** ✅

---

## STEP 3: Verify Tables Were Created (2 minutes)

### 3.1 Check Tables Tab
- Click **"Tables"** in the left sidebar
- You should see TWO tables:
  - ✅ `users` table
  - ✅ `links` table

### 3.2 Click on "users" table
- You should see these columns:
  ```
  id (text)
  google_id (text)
  display_name (text)
  email (text)
  photo (text)
  provider (text)
  created_at (timestamp)
  updated_at (timestamp)
  ```

### 3.3 Click on "links" table
- You should see these columns:
  ```
  id (bigint)
  user_id (text)
  url (text)
  title (text)
  type (text)
  first_name (text)
  last_name (text)
  created_at (timestamp)
  updated_at (timestamp)
  ```

**If you see both tables with these columns, you're DONE with Supabase! ✅**

---

## STEP 4: Add Environment Variables to Your .env File (3 minutes)

Now go back to your code:

### 4.1 Open backend/.env
- On your computer, open: `backend/.env`

### 4.2 Replace the content with this:
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Paste your three Supabase values here:
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Generate a session secret (see step 4.3)
SESSION_SECRET=<you will generate this>

FRONTEND_URL=http://localhost:8080
NODE_ENV=development
```

### 4.3 Generate SESSION_SECRET
- Open PowerShell or Command Prompt
- Run this command:
  ```
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Copy the output (a long random string)
- Paste it as your `SESSION_SECRET` value

### 4.4 Final .env should look like:
```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SESSION_SECRET=a3f2b9e8d7c6f5a4b3e8d7c6f5a4b3e8d7c6f5a4b3e8d7c6f5a4b3e8d7c6f5a4
FRONTEND_URL=http://localhost:8080
NODE_ENV=development
```

**SAVE the file!** (Ctrl+S)

---

## STEP 5: Install Dependencies (5 minutes)

### 5.1 Install Frontend Dependencies
- Open PowerShell/Terminal in your project root
- Run:
  ```
  npm install
  ```
- Wait for it to finish (you'll see "added X packages")

### 5.2 Install Backend Dependencies
- Run:
  ```
  cd backend
  npm install
  cd ..
  ```
- Wait for it to finish

**Done!** You now have all dependencies installed ✅

---

## ✅ Supabase Setup Complete!

### Summary of what you did:
1. ✅ Created Supabase project
2. ✅ Got your 3 API credentials
3. ✅ Created database tables
4. ✅ Updated `.env` file
5. ✅ Installed dependencies

### Next Steps:
- Follow **PHASE 3: Test Locally** in SETUP_GUIDE.md
- Start your backend: `cd backend && npm start`
- Start your frontend: `npm run dev`

---

## 🆘 Troubleshooting

### ❌ "Query executed successfully" didn't show up
- **Solution:** Try running the SQL again
- Make sure you copied the entire SQL file
- Check for any error messages

### ❌ Tables are not showing in Tables tab
- **Solution:** Refresh the page (F5)
- Wait a few seconds and check again

### ❌ I can't find the API credentials
- **Solution:** 
  - Go to Supabase dashboard
  - Click Settings (bottom left)
  - Click API
  - Scroll down to see all keys

### ❌ npm install failed
- **Solution:**
  - Delete `node_modules` folder
  - Delete `package-lock.json` file
  - Run `npm install` again

---

## 📌 Important Notes

✅ **Your 3 credentials are unique to your project** - Keep them safe!
✅ **Never commit .env to GitHub** - It's already in .gitignore
✅ **SERVICE_ROLE_KEY is SECRET** - Don't share it!
✅ **Different from GOOGLE credentials** - Keep both safe!

---

## Quick Reference - Your Credentials Location

```
Supabase Dashboard
├─ Settings (bottom left)
│  └─ API
│     ├─ Project URL ← SUPABASE_URL
│     ├─ anon public key ← SUPABASE_ANON_KEY
│     └─ service_role key ← SUPABASE_SERVICE_ROLE_KEY
```

---

**That's it for Supabase!** Continue with Phase 3 testing. 🎉
