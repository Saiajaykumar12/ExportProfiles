# Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Git repository (push your code to GitHub, GitLab, or Bitbucket)
- Google OAuth credentials (already configured)

## Important ⚠️ Database Migration

Your current project uses **SQLite**, which won't work with Vercel's serverless architecture because:
- Files are ephemeral and don't persist between deployments
- Each request runs in an isolated environment

### Option 1: Use Supabase (Recommended ✅)
You already have Supabase configured in your frontend. Migrate your database:

1. **Set up Supabase Tables:**
   ```sql
   -- Users table
   CREATE TABLE users (
     id TEXT PRIMARY KEY,
     googleId TEXT UNIQUE,
     displayName TEXT,
     email TEXT,
     photo TEXT,
     provider TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Links table
   CREATE TABLE links (
     id BIGSERIAL PRIMARY KEY,
     user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
     url TEXT,
     title TEXT,
     type TEXT,
     firstName TEXT,
     lastName TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **Update your backend to use Supabase** (we can help with this)

### Option 2: Use PostgreSQL on Railway/Render
Alternative serverless database options available.

---

## Step-by-Step Deployment

### Step 1: Update Google OAuth Callback URL
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Find your project and go to "OAuth 2.0 Client IDs"
3. Update **Authorized redirect URIs**:
   - Add: `https://your-vercel-project.vercel.app/api/auth/google/callback`
   - Or: `https://your-custom-domain.com/api/auth/google/callback`
4. Save changes

### Step 2: Prepare Your Repository

```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 3: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Easiest)
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub/GitLab repository
4. Vercel will auto-detect settings
5. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# For production
vercel --prod
```

### Step 4: Configure Environment Variables

In your **Vercel Dashboard**:
1. Go to your project → Settings → Environment Variables
2. Add these variables:

```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
SESSION_SECRET=generate_a_strong_random_string_here
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_role_key
NODE_ENV=production
FRONTEND_URL=https://your-vercel-project.vercel.app
```

**To generate a secure SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Verify Deployment

After deployment completes:

1. **Test Frontend:**
   - Visit: `https://your-vercel-project.vercel.app`
   - Should load your React app

2. **Test Backend:**
   - Visit: `https://your-vercel-project.vercel.app/api/user`
   - Should return backend status

3. **Test Google OAuth:**
   - Click login
   - Should redirect to Google login
   - After login, should redirect back to your app

---

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend API responds at `/api/*` routes
- [ ] Google OAuth login works
- [ ] Data persists (after database migration)
- [ ] Custom domain configured (if applicable)
- [ ] Enable auto-deployments on git push

---

## Troubleshooting

### "API routes not found"
- Verify `vercel.json` contains correct rewrites
- Check that backend environment variables are set
- Check Vercel build logs: Dashboard → Project → Deployments

### "CORS Error"
- Verify `FRONTEND_URL` is set correctly in Vercel
- Verify it matches your actual Vercel URL

### "Google login fails"
- Check Google Client ID/Secret in environment variables
- Verify callback URL is in Google Cloud Console authorized URIs

### "Database connection refused"
- Confirm you've migrated from SQLite to Supabase
- Verify `SUPABASE_URL` and keys in environment variables

---

## Next Steps

1. **Database Migration** - Migrate from SQLite to Supabase
2. **Update Backend Database Code** - Use Supabase client instead of sqlite3
3. **Custom Domain** - Add your domain in Vercel settings
4. **SSL Certificate** - Automatically provided by Vercel
5. **Analytics** - Enable in Vercel dashboard

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
