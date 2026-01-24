# Good Grid Database Setup Guide

## 🎯 Overview

This guide will help you set up the PostgreSQL database for the Good Grid platform authentication system. The database is required for the authentication system to work properly.

## 📋 Prerequisites

### 1. Install PostgreSQL

**Windows:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Make sure PostgreSQL service is running

**macOS:**
```bash
# Using Homebrew
brew install postgresql
brew services start postgresql

# Or using MacPorts
sudo port install postgresql14-server
sudo port load postgresql14-server
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Verify PostgreSQL Installation

```bash
# Check if PostgreSQL is running
psql --version

# Connect to PostgreSQL (you may need to set a password)
sudo -u postgres psql
```

## 🔧 Database Setup Steps

### Step 1: Configure Environment Variables

1. Copy the environment template:
```bash
cd GOOD_GRID/backend
cp .env.example .env
```

2. Edit the `.env` file and update the database credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=good_grid
DB_USER=postgres
DB_PASSWORD=your_actual_password_here

# JWT Configuration (change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Step 2: Create the Database

```bash
# Connect to PostgreSQL and create the database
psql -U postgres -c "CREATE DATABASE good_grid;"

# Or using createdb command
createdb -U postgres good_grid
```

### Step 3: Run Database Setup

**Option A: Automated Setup (Recommended)**
```bash
cd GOOD_GRID/backend
node setup-database.js
```

**Option B: Manual Setup**
```bash
cd GOOD_GRID/backend

# Install dependencies
npm install

# Run migrations to create tables
npm run migrate:up

# Run seeds to populate initial data
npm run migrate:seed

# Check status
npm run migrate:status
```

### Step 4: Test Database Connection

```bash
cd GOOD_GRID/backend
node test-db-connection.js
```

## 🗄️ Database Schema Overview

The Good Grid database includes the following core tables:

### Authentication Tables
- **users** - User accounts with credentials and profile data
- **user_stats** - User statistics (trust score, XP, level, etc.)

### Game World Tables
- **zones** - Geographic areas with unlock requirements
- **dungeons** - Work locations within zones
- **badges** - Achievement badges and unlock criteria

### Work System Tables
- **organizations** - Companies and organizations posting tasks
- **tasks** - Available work tasks
- **task_applications** - User applications for tasks
- **work_history** - Completed work records
- **user_achievements** - Earned badges and achievements

### Initial Data

The seed data includes:
- **8 zones** with different difficulty levels and terrain types
- **15 dungeons** across all zones for different work categories
- **21 badges** for various achievements and milestones
- **5 sample organizations** for testing

## 🧪 Testing the Authentication System

Once the database is set up, you can test the authentication system:

### 1. Start the Backend Server
```bash
cd GOOD_GRID/backend
npm run dev
```

### 2. Test API Endpoints

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Register a New User:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123",
    "characterData": {
      "baseSprite": "DEFAULT",
      "colorPalette": {
        "primary": "#FF6B6B",
        "secondary": "#4ECDC4",
        "accent": "#45B7D1"
      },
      "accessories": [],
      "unlockedItems": []
    },
    "locationData": {
      "coordinates": {"x": 50, "y": 50},
      "currentZone": "550e8400-e29b-41d4-a716-446655440001",
      "discoveredDungeons": []
    }
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

## 🔍 Troubleshooting

### Common Issues

**1. "Connection refused" error**
- PostgreSQL is not running
- Check: `sudo systemctl status postgresql` (Linux) or Services app (Windows)
- Start: `sudo systemctl start postgresql` (Linux)

**2. "Authentication failed" error**
- Wrong username/password in .env file
- Try connecting manually: `psql -U postgres -d good_grid`
- Reset postgres password if needed

**3. "Database does not exist" error**
- Create the database: `createdb -U postgres good_grid`
- Or use psql: `psql -U postgres -c "CREATE DATABASE good_grid;"`

**4. "Permission denied" error**
- Make sure the postgres user has the right permissions
- You might need to run commands with `sudo -u postgres`

### Useful Commands

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Connect to PostgreSQL
psql -U postgres

# List databases
psql -U postgres -l

# Connect to specific database
psql -U postgres -d good_grid

# Check tables in database
psql -U postgres -d good_grid -c "\dt"

# Reset database (WARNING: deletes all data)
npm run migrate:reset
```

## 🎉 Success Indicators

You'll know the setup is successful when:

1. ✅ `node test-db-connection.js` shows all green checkmarks
2. ✅ `npm run migrate:status` shows executed migrations
3. ✅ `curl http://localhost:3001/health` returns status OK
4. ✅ User registration and login work via API calls

## 📚 Next Steps

After database setup is complete:

1. **Frontend Integration** - Connect the React frontend to the authentication API
2. **Task System** - Implement the task creation and management system
3. **Gamification** - Add badge earning and level progression logic
4. **Real-time Features** - Set up WebSocket connections for live updates

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Verify your PostgreSQL installation and service status
3. Double-check your `.env` file configuration
4. Test the database connection manually with `psql`
5. Review the error messages in the console output

The authentication system is production-ready once the database is connected!