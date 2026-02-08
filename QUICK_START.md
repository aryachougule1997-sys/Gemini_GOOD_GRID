# 🚀 Quick Start Guide

## Get the Project Running in 5 Minutes

### Step 1: Ensure PostgreSQL is Running
Make sure PostgreSQL is installed and running on your system.

### Step 2: Setup Database
```bash
cd GOOD_GRID/GOOD_GRID/backend
npm run migrate:setup
```

This creates all necessary tables in the `good_grid` database.

### Step 3: Start Backend
```bash
cd GOOD_GRID/GOOD_GRID/backend
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Good Grid Backend Server running on port 3001
```

### Step 4: Start Frontend (New Terminal)
```bash
cd GOOD_GRID/GOOD_GRID/frontend
npm start
```

You should see:
```
Compiled successfully!
Local: http://localhost:3000
```

### Step 5: Test the Application

1. Open http://localhost:3000
2. Click "Try Complete Auth System"
3. Click "Create Account"
4. Fill in:
   - Email: test@example.com
   - Password: password123
   - Choose: Join as Hero
5. Click "Begin Your Journey"
6. Complete profile setup
7. Create your character
8. ✅ You're in!

## What to Expect

### After Registration
- Console shows: "✅ Token saved to localStorage after registration"
- You proceed to profile setup
- No 401 errors
- Everything works smoothly

### After Login
- Console shows: "✅ Token saved to localStorage after login"
- If you have a profile: Go directly to dashboard
- If no profile: Complete profile setup
- No 401 errors

### Dashboard Features
- View your character
- See your stats (XP, Trust Score, Level)
- Create tasks
- View profile
- Access all features without errors

## Verify Everything Works

Open browser console (F12) and run:
```javascript
localStorage.getItem('goodgrid_token')
```

Should return a JWT token string (not null).

## Common Issues

### "Cannot connect to database"
- Ensure PostgreSQL is running
- Check credentials in `backend/.env`
- Verify database `good_grid` exists

### "Registration failed"
- Check backend terminal for error details
- Ensure database tables exist (`npm run migrate:setup`)
- Check backend logs

### "Access token required"
- This is normal if you're not logged in
- Register or login to get a token
- Check localStorage has 'goodgrid_token'

## That's It!

Your Good Grid platform is now running and fully functional! 🎉

For detailed documentation, see:
- `PROJECT_STABILIZATION_COMPLETE.md` - Complete technical details
- `TOKEN_STORAGE_FIX.md` - Token authentication details
- `BACKEND_INTEGRATION_COMPLETE.md` - Backend architecture
