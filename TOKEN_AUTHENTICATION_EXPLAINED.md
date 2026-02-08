# 🔐 Token Authentication - Complete Guide

## What Are Tokens and Why Do You Need Them?

### The Simple Explanation

Think of a token like a **VIP wristband at a concert**:
- You show your ticket (email/password) at the entrance
- Security gives you a wristband (token)
- Now you can go anywhere in the venue without showing your ticket again
- The wristband proves you paid and are allowed to be there

### In Technical Terms

A **JWT (JSON Web Token)** is a secure, encrypted string that contains:
- Your user ID
- Your username
- Your email
- An expiration date (default: 7 days)

## How Token Authentication Works in Good Grid

```
┌─────────────┐                    ┌─────────────┐
│   FRONTEND  │                    │   BACKEND   │
│ (React App) │                    │ (Node.js)   │
└─────────────┘                    └─────────────┘
       │                                  │
       │  1. Login (email + password)     │
       │─────────────────────────────────>│
       │                                  │
       │                                  │  2. Check PostgreSQL
       │                                  │     - User exists?
       │                                  │     - Password correct?
       │                                  │
       │  3. Return token + user data     │
       │<─────────────────────────────────│
       │                                  │
       │  4. Store token in localStorage  │
       │     Key: 'goodgrid_token'        │
       │                                  │
       │  5. Every API request includes:  │
       │     Authorization: Bearer <token>│
       │─────────────────────────────────>│
       │                                  │
       │                                  │  6. Verify token:
       │                                  │     - Valid signature?
       │                                  │     - Not expired?
       │                                  │     - User still exists?
       │                                  │
       │  7. Return requested data        │
       │<─────────────────────────────────│
```

## Why You're Getting "Invalid or Expired Token" Errors

### Reason 1: User Doesn't Exist in PostgreSQL (MOST LIKELY)

**What happened:**
- You switched from in-memory storage to PostgreSQL
- Old users from in-memory storage don't exist in PostgreSQL
- Your old token references a user that doesn't exist anymore

**Solution:**
```
1. Clear your browser's localStorage
2. Register a NEW account
3. This creates a user in PostgreSQL
4. You'll get a valid token
```

### Reason 2: Token Expired

**What happened:**
- Tokens expire after 7 days (configurable in backend/.env)
- Your token is older than 7 days

**Solution:**
```
1. Log in again
2. Get a fresh token
```

### Reason 3: JWT_SECRET Changed

**What happened:**
- The JWT_SECRET in backend/.env changed
- Old tokens were signed with the old secret
- Backend can't verify them anymore

**Solution:**
```
1. Check backend/.env for JWT_SECRET
2. If it changed, all users need to log in again
```

### Reason 4: Token Not Being Sent

**What happened:**
- Frontend is making API requests without including the token
- Backend rejects the request

**Solution:**
```
1. Check browser DevTools → Network tab
2. Look at API requests
3. Check if Authorization header is present
4. Should be: Authorization: Bearer <token>
```

## How to Fix Your Current Issue

### Step 1: Clear Everything
```javascript
// Open browser console (F12) and run:
localStorage.clear();
```

### Step 2: Make Sure Backend is Running
```bash
cd GOOD_GRID/GOOD_GRID/backend
npm run dev
```

Should see:
```
✅ Server running on port 3001
✅ Connected to PostgreSQL database: good_grid
```

### Step 3: Make Sure Frontend is Running
```bash
cd GOOD_GRID/GOOD_GRID/frontend
npm start
```

Should see:
```
✅ Compiled successfully!
✅ Local: http://localhost:3000
```

### Step 4: Register a New Account

1. Go to http://localhost:3000
2. Click "Try Complete Auth System"
3. Click "Create Account" / "Register"
4. Fill in the form:
   - Username: anything you want
   - Email: test@example.com (or any email)
   - Password: password123 (or any password)
5. Complete profile setup
6. You're in!

### Step 5: Use Token Debug Tool

1. Go to http://localhost:3000
2. Click "Token Debug Tool"
3. You'll see:
   - Current token status
   - Token contents (decoded)
   - Whether it's expired
   - Test login functionality

## Understanding Token Storage

### Where is the token stored?

```javascript
// Frontend stores it in localStorage:
localStorage.setItem('goodgrid_token', '<your-token>');

// You can see it in browser:
// DevTools → Application → Local Storage → http://localhost:3000
```

### How is the token used?

```javascript
// Every API request includes it:
fetch('http://localhost:3001/api/profile/123', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### How does backend verify it?

```javascript
// Backend extracts and verifies:
const token = req.headers.authorization.substring(7); // Remove 'Bearer '
const decoded = jwt.verify(token, JWT_SECRET);
// decoded = { userId: '123', username: 'hero', email: 'hero@example.com' }
```

## Do You REALLY Need Tokens?

### YES! Here's why:

1. **Security**: Without tokens, anyone could pretend to be any user
   ```
   // BAD (no auth):
   GET /api/profile/123  → Returns user 123's data (anyone can access!)
   
   // GOOD (with token):
   GET /api/profile/123 + Authorization: Bearer <token>
   → Backend verifies token belongs to user 123
   → Only returns data if token is valid
   ```

2. **Stateless**: Backend doesn't need to store session data
   - Token contains all needed info
   - Backend just verifies signature
   - Scales better (no session storage needed)

3. **Multi-device**: Same token works everywhere
   - Use on phone, tablet, desktop
   - No need to log in on each device

4. **API Protection**: Prevents unauthorized access
   - Creating tasks requires valid token
   - Viewing profiles requires valid token
   - Updating data requires valid token

## Common Token Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid or expired token" | User doesn't exist in DB | Register new account |
| "Access token required" | Token not being sent | Check Authorization header |
| "User not found" | User deleted from DB | Register new account |
| Token expired | Token older than 7 days | Log in again |
| Can't decode token | Token corrupted | Clear localStorage, log in again |

## Token Debug Checklist

When you have token issues, check:

1. ✅ Backend is running (port 3001)
2. ✅ Frontend is running (port 3000)
3. ✅ PostgreSQL is running
4. ✅ User exists in database
5. ✅ Token exists in localStorage
6. ✅ Token is not expired
7. ✅ Token is being sent with requests
8. ✅ JWT_SECRET hasn't changed

## Quick Commands

### Check if user exists in database:
```bash
psql -U postgres -d good_grid -c "SELECT id, username, email FROM users;"
```

### Check backend logs:
```bash
# Look for errors in backend terminal
# Common errors:
# - "User not found"
# - "Invalid token"
# - "Database connection error"
```

### Clear localStorage:
```javascript
// In browser console:
localStorage.clear();
```

### Test login manually:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Next Steps

1. **Use the Token Debug Tool** at http://localhost:3000 → "Token Debug Tool"
2. **Register a new account** to get a fresh token
3. **Check backend logs** for specific errors
4. **Read TOKEN_DEBUG.md** for more troubleshooting steps

## Still Having Issues?

If you're still getting token errors after:
- Clearing localStorage
- Registering a new account
- Checking backend is running
- Verifying PostgreSQL is running

Then check:
1. Backend terminal for error messages
2. Browser console for error messages
3. Network tab in DevTools to see actual API responses
4. Use Token Debug Tool to see token status

The Token Debug Tool will show you exactly what's wrong!
