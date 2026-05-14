import express from 'express';
import passport from 'passport';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db } from './supabase.js'; // Import Supabase helpers

dotenv.config();

const app = express();

// Get environment variables
const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
const sessionSecret = process.env.SESSION_SECRET || 'secretkey';

// Enable CORS with environment-based origin
app.use(cors({
  origin: frontendUrl,
  credentials: true
}));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: isProduction, // true only in production (HTTPS)
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await db.get('users', { google_id: profile.id });

    if (!user) {
      // Create new user
      user = await db.insert('users', {
        id: profile.id,
        google_id: profile.id,
        display_name: profile.displayName,
        email: profile.emails[0]?.value,
        photo: profile.photos[0]?.value,
        provider: 'google'
      });
    }
    return done(null, user);
  } catch (err) {
    console.error('Auth error:', err);
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.get('users', { id });
    done(null, user);
  } catch (err) {
    console.error('Deserialize error:', err);
    done(err);
  }
});


// Homepage route
app.get('/', (req, res) => {
  res.send('Goo-Link-Dash Backend is running!');
});

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Route to force account selection
app.get('/auth/google/choose', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  session: true
}), (req, res) => {
  // Redirect to frontend submission page after login
  res.redirect(`${frontendUrl}/submit`);
});

// User API
app.get('/api/user', (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
});

// --- Links API ---

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// GET /api/links - Get all links for the logged-in user
app.get('/api/links', ensureAuthenticated, async (req, res) => {
  try {
    const links = await db.query('links', { user_id: req.user.id }, { orderBy: { column: 'created_at', ascending: false } });
    res.json({ links });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
});

// POST /api/links - Create a new link
app.post('/api/links', ensureAuthenticated, async (req, res) => {
  const { url, title, type, firstName, lastName } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Check if user has already saved a link today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await db.count('links', { 
      user_id: req.user.id 
    });

    // Check links created today
    const linksToday = await db.query('links', { user_id: req.user.id });
    const todayCount = linksToday.filter(link => {
      const linkDate = new Date(link.created_at);
      linkDate.setHours(0, 0, 0, 0);
      return linkDate.getTime() === today.getTime();
    }).length;

    if (todayCount >= 50) {
      return res.status(429).json({ error: 'Daily limit reached. You can only save 50 links per day.' });
    }

    const newLink = await db.insert('links', {
      user_id: req.user.id,
      url,
      title: title || url,
      type: type || 'Basic URL',
      first_name: firstName || '',
      last_name: lastName || ''
    });

    res.status(201).json({ link: newLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create link' });
  }
});

// DELETE /api/links/:id - Delete a link
app.delete('/api/links/:id', ensureAuthenticated, async (req, res) => {
  const linkId = req.params.id;

  try {
    // Check if link belongs to user
    const link = await db.get('links', { id: parseInt(linkId) });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (link.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await db.delete('links', { id: parseInt(linkId) });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete link' });
  }
});


app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});


// --- Download Link as CSV ---
app.get('/api/download/:linkId', ensureAuthenticated, async (req, res) => {
  const linkId = req.params.linkId;
  try {
    // Fetch the link for the logged-in user
    const link = await db.get('links', { id: parseInt(linkId), user_id: req.user.id });
    
    if (!link) {
      return res.status(404).send('Link not found');
    }
    
    // Create CSV content with MAIL column
    const csv = `SNO,LINK,FIRST NAME,LAST NAME,MAIL,TYPE,TIME,DATE\n1,${link.url},${link.first_name || ''},${link.last_name || ''},${req.user.email || ''},${link.type || ''},${new Date(link.created_at).toLocaleTimeString()},${new Date(link.created_at).toLocaleDateString()}`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="profile_data_${linkId}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to generate CSV');
  }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});