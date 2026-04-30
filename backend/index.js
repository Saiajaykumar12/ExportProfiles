import express from 'express';
import passport from 'passport';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db, run, get, query } from './database.js'; // Import DB helpers

dotenv.config();

const app = express();

// Enable CORS
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using HTTPS
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
    let user = await get('SELECT * FROM users WHERE googleId = ?', [profile.id]);

    if (!user) {
      // Create new user
      const result = await run(
        'INSERT INTO users (id, googleId, displayName, email, photo, provider) VALUES (?, ?, ?, ?, ?, ?)',
        [
          profile.id, // using google id as user id for simplicity, or generate a uuid
          profile.id,
          profile.displayName,
          profile.emails[0].value,
          profile.photos[0].value,
          'google'
        ]
      );
      user = await get('SELECT * FROM users WHERE id = ?', [profile.id]);
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await get('SELECT * FROM users WHERE id = ?', [id]);
    done(null, user);
  } catch (err) {
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
  res.redirect('http://localhost:8080/submit');
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
    const links = await query('SELECT * FROM links WHERE userId = ? ORDER BY createdAt DESC', [req.user.id]);
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
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const startOfDay = `${today} 00:00:00`;
    const endOfDay = `${today} 23:59:59`;

    const count = await get(
      'SELECT COUNT(*) as count FROM links WHERE userId = ? AND createdAt BETWEEN ? AND ?',
      [req.user.id, startOfDay, endOfDay]
    );

    if (count.count >= 50) {
      return res.status(429).json({ error: 'Daily limit reached. You can only save 50 links per day.' });
    }

    const result = await run(
      'INSERT INTO links (userId, url, title, type, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, url, title || url, type || 'Basic URL', firstName || '', lastName || '']
    );
    const newLink = await get('SELECT * FROM links WHERE id = ?', [result.id]);
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
    const link = await get('SELECT * FROM links WHERE id = ?', [linkId]);

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    if (link.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await run('DELETE FROM links WHERE id = ?', [linkId]);
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
    const link = await get('SELECT * FROM links WHERE id = ? AND userId = ?', [linkId, req.user.id]);
    if (!link) {
      return res.status(404).send('Link not found');
    }
    // Create CSV content with MAIL column
    const csv = `SNO,LINK,FIRST NAME,LAST NAME,MAIL,TYPE,TIME,DATE\n1,${link.url},${link.firstName || ''},${link.lastName || ''},${req.user.email || ''},${link.type || ''},${new Date(link.createdAt).toLocaleTimeString()},${new Date(link.createdAt).toLocaleDateString()}`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="profile_data_${linkId}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to generate CSV');
  }
});

app.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});