# API Reference - Your Deployed Endpoints

## Base URLs

**Local Development:**
```
Frontend: http://localhost:8080
Backend: http://localhost:8081
```

**Production (Vercel):**
```
Frontend: https://your-project-name.vercel.app
Backend API: https://your-project-name.vercel.app/api/*
```

---

## Authentication Endpoints

### POST /auth/google
Redirects user to Google login
```
GET /auth/google
Response: Redirects to Google login screen
```

### GET /auth/google/choose
Forces account selection (useful for testing multiple accounts)
```
GET /auth/google/choose
Response: Redirects to Google account selection
```

### GET /auth/google/callback
Google OAuth callback (automatic redirect)
```
GET /auth/google/callback?code=...
Response: Redirects to /submit on success
Note: Automatically handled by Passport
```

### GET /logout
Log out current user
```
GET /logout
Response: Redirects to home page
```

---

## User Endpoints

### GET /api/user
Get current logged-in user info
```
GET /api/user
Headers: Requires session cookie (set after login)

Response (authenticated):
{
  "user": {
    "id": "google-id",
    "google_id": "google-id",
    "display_name": "John Doe",
    "email": "john@example.com",
    "photo": "https://...",
    "provider": "google"
  }
}

Response (not authenticated):
{
  "user": null
}
```

---

## Links Endpoints

### GET /api/links
Get all links for logged-in user (newest first)
```
GET /api/links
Headers: 
  - Cookie: session=...
  
Response (Success - 200):
{
  "links": [
    {
      "id": 1,
      "user_id": "google-id",
      "url": "https://example.com",
      "title": "My Site",
      "type": "Website",
      "first_name": "John",
      "last_name": "Doe",
      "created_at": "2024-05-14T10:30:00.000Z",
      "updated_at": "2024-05-14T10:30:00.000Z"
    }
  ]
}

Response (Not authenticated - 401):
{
  "error": "Not authenticated"
}
```

### POST /api/links
Create a new link
```
POST /api/links
Content-Type: application/json
Headers:
  - Cookie: session=...

Body:
{
  "url": "https://example.com",           // Required
  "title": "My Website",                  // Optional
  "type": "Website",                      // Optional
  "firstName": "John",                    // Optional
  "lastName": "Doe"                       // Optional
}

Response (Success - 201):
{
  "link": {
    "id": 1,
    "user_id": "google-id",
    "url": "https://example.com",
    "title": "My Website",
    "type": "Website",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2024-05-14T10:30:00.000Z"
  }
}

Response (No URL - 400):
{
  "error": "URL is required"
}

Response (Daily limit exceeded - 429):
{
  "error": "Daily limit reached. You can only save 50 links per day."
}

Response (Not authenticated - 401):
{
  "error": "Not authenticated"
}
```

### DELETE /api/links/:id
Delete a specific link
```
DELETE /api/links/1
Headers:
  - Cookie: session=...

Response (Success - 200):
{
  "success": true
}

Response (Link not found - 404):
{
  "error": "Link not found"
}

Response (Not owner - 403):
{
  "error": "Unauthorized"
}

Response (Not authenticated - 401):
{
  "error": "Not authenticated"
}
```

---

## Download Endpoints

### GET /api/download/:linkId
Download a link as CSV file
```
GET /api/download/1
Headers:
  - Cookie: session=...

Response (Success - 200):
Headers:
  - Content-Type: text/csv
  - Content-Disposition: attachment; filename="profile_data_1.csv"

Body:
SNO,LINK,FIRST NAME,LAST NAME,MAIL,TYPE,TIME,DATE
1,https://example.com,John,Doe,john@example.com,Website,10:30:00 AM,5/14/2024

Response (Link not found - 404):
Link not found

Response (Not owner - 403):
Unauthorized

Response (Not authenticated - 401):
Error
```

---

## Status Endpoints

### GET /
Health check / Home page
```
GET /
Response: "Goo-Link-Dash Backend is running!"
```

---

## Error Handling

All endpoints return appropriate HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (missing required fields) |
| 401 | Not authenticated |
| 403 | Forbidden (not authorized to access resource) |
| 404 | Resource not found |
| 429 | Too many requests (daily limit exceeded) |
| 500 | Server error |

---

## Rate Limits

**Daily link limit:** 50 links per user per calendar day
- Resets at midnight UTC
- Returns 429 status when exceeded

---

## Session Management

Session cookies are:
- ✅ HttpOnly (cannot be accessed via JavaScript)
- ✅ Secure in production (HTTPS only)
- ✅ SameSite: Lax (CSRF protection)
- ✅ Persisted across requests

No need to pass authentication tokens - just use cookies!

---

## Testing Endpoints (cURL examples)

### Get user info:
```bash
curl -X GET http://localhost:8081/api/user \
  -H "Cookie: session=your_session_cookie" \
  -H "Content-Type: application/json"
```

### Create a link:
```bash
curl -X POST http://localhost:8081/api/links \
  -H "Cookie: session=your_session_cookie" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "title": "Example",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Get all links:
```bash
curl -X GET http://localhost:8081/api/links \
  -H "Cookie: session=your_session_cookie"
```

### Delete a link:
```bash
curl -X DELETE http://localhost:8081/api/links/1 \
  -H "Cookie: session=your_session_cookie"
```

---

## Frontend Integration

Your React frontend will call these endpoints from:

**Local:**
```javascript
fetch('http://localhost:8081/api/links', { credentials: 'include' })
```

**Production:**
```javascript
fetch('/api/links', { credentials: 'include' })
// Vercel handles routing to your backend
```

---

## Database Schema

### Users Table
```sql
users {
  id TEXT PRIMARY KEY
  google_id TEXT UNIQUE
  display_name TEXT
  email TEXT
  photo TEXT
  provider TEXT
  created_at TIMESTAMP
  updated_at TIMESTAMP
}
```

### Links Table
```sql
links {
  id BIGSERIAL PRIMARY KEY
  user_id TEXT FOREIGN KEY
  url TEXT
  title TEXT
  type TEXT
  first_name TEXT
  last_name TEXT
  created_at TIMESTAMP
  updated_at TIMESTAMP
}
```

---

## Environment Variables Required

For backend to function, set these:

```bash
# Authentication
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Database
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Security
SESSION_SECRET=...

# Configuration
FRONTEND_URL=http://localhost:8080
NODE_ENV=development
PORT=8081 (optional, defaults to 8081)
```

---

## Common Issues & Solutions

**Problem:** Getting 401 errors on authenticated endpoints
**Solution:** Make sure you're logged in and session cookie is being sent

**Problem:** Daily limit shows as reached immediately
**Solution:** This is expected behavior after creating 50 links in a day

**Problem:** CORS errors from frontend
**Solution:** Verify `FRONTEND_URL` environment variable matches where frontend is running

---

## Support

For deployment issues, check:
- Vercel logs: https://vercel.com/dashboard
- Supabase logs: https://app.supabase.com
- Backend logs: Check Vercel Deployments → Latest → Logs
