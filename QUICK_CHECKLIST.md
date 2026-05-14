# 🚀 Quick Deployment Checklist

## PHASE 1: Supabase Setup
- [ ] Go to https://supabase.com and create account
- [ ] Create new project (save your password!)
- [ ] Copy Project URL → `SUPABASE_URL`
- [ ] Copy anon public key → `SUPABASE_ANON_KEY`
- [ ] Copy service_role key → `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Go to SQL Editor in Supabase
- [ ] Copy entire contents of `backend/SUPABASE_MIGRATION.sql`
- [ ] Paste into SQL Editor and click "Run"
- [ ] Verify: Go to Tables tab, should see `users` and `links` tables ✓

## PHASE 2: Local Environment
- [ ] Open `backend/.env`
- [ ] Paste Supabase URL, anon key, and service role key
- [ ] Generate session secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Paste session secret into `SESSION_SECRET` in `.env`
- [ ] Run: `npm install` (frontend dependencies)
- [ ] Run: `cd backend && npm install` (backend dependencies)
- [ ] Run: `cd ..` (back to root)

## PHASE 3: Test Locally
- [ ] Open Terminal 1: `cd backend && npm start` (should show port 8081)
- [ ] Open Terminal 2: `npm run dev` (should show port 8080)
- [ ] Open browser: http://localhost:8080
- [ ] Click "Login with Google" and test login ✓
- [ ] Try adding a test link ✓
- [ ] Go to Supabase dashboard → Tables → links → should see your test link ✓
- [ ] Stop both servers (Ctrl+C)

## PHASE 4: Google OAuth Update (do after Vercel deployment)
- [ ] Deploy to Vercel (Phase 5 first)
- [ ] Note your Vercel URL: `https://your-project.vercel.app`
- [ ] Go to https://console.cloud.google.com
- [ ] Click Credentials → OAuth Client
- [ ] Add to "Authorized redirect URIs": `https://your-project.vercel.app/auth/google/callback`
- [ ] Click Save

## PHASE 5: Vercel Deployment
- [ ] Commit all changes: `git add .`
- [ ] `git commit -m "Add Supabase migration for Vercel"`
- [ ] `git push origin main`
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New" → "Project"
- [ ] Select your GitHub repository
- [ ] Click "Import"
- [ ] Click "Environment Variables"
- [ ] Add all variables:
  - `GOOGLE_CLIENT_ID` = your value
  - `GOOGLE_CLIENT_SECRET` = your value
  - `SUPABASE_URL` = your Supabase URL
  - `SUPABASE_ANON_KEY` = your key
  - `SUPABASE_SERVICE_ROLE_KEY` = your key (⚠️ keep secret!)
  - `SESSION_SECRET` = your random secret
  - `NODE_ENV` = `production`
  - `FRONTEND_URL` = `https://your-vercel-project.vercel.app` (update after first deploy)
- [ ] Click "Deploy"
- [ ] Wait 5-10 minutes for deployment
- [ ] Copy your Vercel URL when deployment completes

## PHASE 6: Update Frontend URL
- [ ] In Vercel dashboard, go to Settings → Environment Variables
- [ ] Update `FRONTEND_URL` to your actual Vercel URL
- [ ] Go to Deployments → Latest → Click "Redeploy"
- [ ] Wait for redeployment to complete

## PHASE 7: Test Production
- [ ] Visit your Vercel URL in browser ✓
- [ ] Click "Login with Google" ✓
- [ ] Test adding a link ✓
- [ ] Try downloading CSV ✓
- [ ] Try deleting a link ✓

## Post-Launch (Optional)
- [ ] Add custom domain in Vercel
- [ ] Enable Vercel analytics
- [ ] Set up automatic Supabase backups
- [ ] Monitor Vercel logs

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module @supabase/supabase-js" | Run: `cd backend && npm install` |
| "SUPABASE_URL is undefined" | Update `backend/.env` with all credentials |
| "Google login fails" | Check Google Console callback URL matches Vercel URL |
| "Links not saving" | Check Supabase tables exist, verify credentials |
| "CORS error" | Verify `FRONTEND_URL` in Vercel environment variables |
| "Deployment fails" | Check Vercel logs: Dashboard → Deployments → Latest → Logs |

---

## 📞 Support Files
- `SETUP_GUIDE.md` - Detailed step-by-step (READ THIS!)
- `IMPLEMENTATION_SUMMARY.md` - What was changed
- `backend/SUPABASE_MIGRATION.sql` - Database schema
- `backend/supabase.js` - Supabase connection code

---

**Total Time: ~50 minutes**

Good luck! 🚀
