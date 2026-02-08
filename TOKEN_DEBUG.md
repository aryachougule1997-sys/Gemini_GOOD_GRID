# Token Authentication Debug Guide

## What's Happening

You're getting "Invalid or expired token" errors. This happens when:

1. **User doesn't exist in PostgreSQL database** - After switching from in-memory to PostgreSQL, old users don't exist anymore
2. **Token is expired** - Tokens last 7 days by default
3. **JWT_SECRET changed** - If the secret key changed, old tokens become invalid
4. **Token not being sent properly** - Frontend might not be including the token in requests

## Quick Fix: Create a New Account

Since you switched to PostgreSQL, you need to **register a new account**:

1. Go to the login page
2. Click "Create Account" / "Register"
3. Fill in the registration form
4. This will create a user in PostgreSQL and give you a valid token

## Debug Steps

### Step 1: Check if Backend is Running
```bash
# In GOOD_GRID/GOOD_GRID/backend directory
npm run dev
```

Backend should be running on http://localhost:3001

### Step 2: Check if PostgreSQL is Running
```bash
# Check if database exists
psql -U postgres -d good_grid -c "SELECT COUNT(*) FROM users;"
```

### Step 3: Use Token Debug Page

I created a debug page for you at:
```
http://localhost:3000/token-debug
```

This page will show you:
- Current token status
- Token contents (decoded)
- Whether token is expired
- Test login functionality

### Step 4: Check Browser Console

Open browser DevTools (F12) and check:
1. **Console tab** - Look for error messages
2. **Network tab** - Check API requests to see if token is being sent
3. **Application tab** → Local Storage → Check for 'goodgrid_token'

## Common Solutions

### Solution 1: Clear Everything and Start Fresh
```javascript
// In browser console:
localStorage.clear();
// Then refresh page and register a new account
```

### Solution 2: Check Backend Logs
Look at your backend terminal for errors like:
- "User not found"
- "Invalid token"
- Database connection errors

### Solution 3: Verify JWT_SECRET
Check `backend/.env` file:
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

If this changed, all old tokens are invalid.

## How to Add Token Debug Page to Your App

Add this route to your App.tsx or router:
```tsx
import TokenDebug from './pages/TokenDebug';

// In your routes:
<Route path="/token-debug" element={<TokenDebug />} />
```

## Understanding the Token Flow

```
1. User logs in
   ↓
2. Backend checks email/password in PostgreSQL
   ↓
3. Backend creates JWT token with user info
   ↓
4. Frontend stores token in localStorage
   ↓
5. Every API request includes: Authorization: Bearer <token>
   ↓
6. Backend verifies token and checks if user exists
   ↓
7. If valid: Request succeeds
   If invalid: "Invalid or expired token" error
```

## Next Steps

1. **Register a new account** (easiest solution)
2. Use the Token Debug page to see what's happening
3. Check backend logs for specific errors
4. Make sure both frontend (3000) and backend (3001) are running

## Do You Really Need Tokens?

**YES!** Tokens are essential for:
- Security: Proving who you are without sending password every time
- Stateless authentication: Backend doesn't need to store session data
- API protection: Preventing unauthorized access to user data
- Multi-device support: Same token works across devices

Without tokens, anyone could access anyone's data by just guessing user IDs!
