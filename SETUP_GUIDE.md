# Complete Vercel Deployment Setup Guide

> 📌 **All code changes have been completed!** Follow these steps carefully.

---

## PHASE 1: Supabase Setup (10 minutes)

### Step 1.1: Create Supabase Project
1. Go to https://supabase.com
2. Click **"Start your project"** (sign up if needed)
3. Create a new project:
   - **Project name:** `goo-link-dash` (or your preference)
   - **Database password:** Generate a strong password (save it!)
   - **Region:** Choose closest to you (or `us-east-1`)
4. Click **"Create new project"**
5. Wait ~2 minutes for the project to initialize

### Step 1.2: Get Your Credentials
Once your project loads:

1. Go to **Settings** (bottom left) → **API**
2. Copy these three values and save them:
   - `Project URL` → Save as `SUPABASE_URL`
   - `anon public` key → Save as `SUPABASE_ANON_KEY`
   - `service_role` key → Save as `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (Keep secret!)

**Keep these somewhere safe!** You'll need them in the next steps.

### Step 1.3: Create Database Tables
1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open file: `backend/SUPABASE_MIGRATION.sql`
4. Copy **the entire contents** and paste into Supabase SQL Editor
5. Click **"Run"** button (top right)
6. ✅ You should see "Query executed successfully"

**Done!** Your database is ready.

---

## PHASE 2: Update Your Local Environment (5 minutes)

### Step 2.1: Update Backend .env File
Edit `backend/.env` and update these values:

```
GOOGLE_CLIENT_ID=715186309950-kn1nc4p7sgo8hkoh6vj1j2vagflni8qp.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# ADD THESE (from Supabase):
SUPABASE_URL=<paste your Project URL here>
SUPABASE_ANON_KEY=<paste your anon public key here>
SUPABASE_SERVICE_ROLE_KEY=<paste your service_role key here>

# Generate a random session secret:
SESSION_SECRET=<see Step 2.2 below>

FRONTEND_URL=http://localhost:8080
NODE_ENV=development
```

### Step 2.2: Generate Session Secret (one-time)
In your terminal, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `SESSION_SECRET` in `backend/.env`

### Step 2.3: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

---

## PHASE 3: Test Locally (5 minutes)

### Step 3.1: Test Backend Connection
```bash
# From project root, go to backend directory
cd backend

# Test connection to Supabase
node -e "
import('./supabase.js').then(m => {
  console.log('✅ Supabase module loaded successfully');
  console.log('Backend is ready for Supabase');
});
"
```

### Step 3.2: Start Backend (Terminal 1)
```bash
cd backend
npm start
```

Expected output:
```
Backend running on http://localhost:8081
```

### Step 3.3: Start Frontend (Terminal 2)
```bash
npm run dev
```

Expected output:
```
vite v... ready in ... ms

➜  Local:   http://localhost:8080
```

### Step 3.4: Test in Browser
1. Go to http://localhost:8080
2. Try **Login with Google**
   - Should redirect to Google login
   - After login, should show your dashboard
3. Try **Adding a link**
   - Should save successfully
4. Go to Supabase dashboard → Tables → `links` 
   - You should see your test link! ✅

---

## PHASE 4: Update Google OAuth Redirect URL (5 minutes)

### Step 4.1: Get Your Vercel URL (You'll create this in Phase 5)
After deploying to Vercel, you'll get a URL like: `https://your-project-name.vercel.app`

### Step 4.2: Update Google Cloud Console
1. Go to https://console.cloud.google.com/
2. Select your project
3. Go to **Credentials** → Find "OAuth 2.0 Client IDs"
4. Click your OAuth client
5. Under **Authorized redirect URIs**, add:
   ```
   https://your-project-name.vercel.app/auth/google/callback
   ```
6. Click **Save**

---

## PHASE 5: Deploy to Vercel (10 minutes)

### Step 5.1: Push to GitHub
```bash
# From project root
git add .
git commit -m "Implement Supabase migration for Vercel deployment"
git push origin main
```

### Step 5.2: Create Vercel Project
1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Select your GitHub repository
4. Click **"Import"**

### Step 5.3: Configure Environment Variables
Vercel will show a configuration page. Click **"Environment Variables"**

Add these (from your Supabase credentials):
```
GOOGLE_CLIENT_ID = 715186309950-kn1nc4p7sgo8hkoh6vj1j2vagflni8qp.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = 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
SUPABASE_URL = <your Supabase URL>
SUPABASE_ANON_KEY = <your anon key>
SUPABASE_SERVICE_ROLE_KEY = <your service role key>
SESSION_SECRET = <same one from .env>
NODE_ENV = production
FRONTEND_URL = https://your-project-name.vercel.app
```

**For `FRONTEND_URL`:** You can update this after deployment when you get your URL.

### Step 5.4: Deploy
Click **"Deploy"** button and wait ~5 minutes.

Once complete, you'll get your URL: `https://your-project-name.vercel.app`

---

## PHASE 6: Final Configuration (5 minutes)

### Step 6.1: Update Vercel Environment Variable
1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. Find `FRONTEND_URL`
3. Update it to your actual Vercel URL: `https://your-project-name.vercel.app`
4. Redeploy:
   - Go to **Deployments** → Click the latest → **Redeploy**

### Step 6.2: Update Google OAuth (if not done in Phase 4)
Go back to Google Cloud Console and update the callback URL with your actual Vercel URL.

---

## Phase 7: Test Production Deployment (5 minutes)

### Step 7.1: Test Frontend
Visit: `https://your-project-name.vercel.app`
- Should load your app ✅

### Step 7.2: Test Backend API
Visit: `https://your-project-name.vercel.app/api/user`
- Should show API response ✅

### Step 7.3: Test Google Login
1. Click **"Login with Google"**
2. Should redirect to Google (may ask which account)
3. After login, should show your dashboard ✅

### Step 7.4: Test Database Operations
1. Try adding a link
2. Go to Supabase → `links` table
3. Should see your new link ✅

---

## ✅ Deployment Complete!

Your app is now live on Vercel with a production database!

### What You Have:
- ✅ React frontend on Vercel
- ✅ Express backend on Vercel serverless
- ✅ PostgreSQL database on Supabase
- ✅ Google OAuth authentication
- ✅ Auto-deployment on git push

### Next Steps (Optional):
- [ ] Add custom domain in Vercel settings
- [ ] Set up automatic backups in Supabase
- [ ] Enable analytics in Vercel
- [ ] Configure error tracking

---

## 🆘 Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
cd backend
npm install
npm start
```

### "SUPABASE_URL is undefined"
- Check `backend/.env` has all three Supabase credentials
- Restart backend after updating .env

### "Google login fails"
- Verify callback URL in Google Cloud Console matches your Vercel URL
- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

### "Links not saving"
- Go to Supabase dashboard → check `links` table exists
- Check backend logs in Vercel dashboard

### "CORS error when accessing API"
- Verify `FRONTEND_URL` environment variable in Vercel is correct
- Redeploy after changing it

### Need more help?
- Check Vercel logs: Dashboard → Project → Deployments → Latest → Logs
- Check Supabase logs: Dashboard → Logs
- Check backend console output

---

## 📚 Files Modified
- `backend/index.js` - Updated to use Supabase
- `backend/package.json` - Added @supabase/supabase-js dependency
- `backend/.env` - Updated with Supabase credentials
- `backend/supabase.js` - NEW: Supabase connection module
- `backend/SUPABASE_MIGRATION.sql` - NEW: Database schema
- `vercel.json` - Updated for proper deployment
