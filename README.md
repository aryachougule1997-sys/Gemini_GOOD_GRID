# Good Grid Platform

An AI-powered, location-based community contribution platform that gamifies real-world volunteering and local tasks. Transform community service into an engaging Pokemon-style adventure where users build trust scores, unlock geographical zones, earn badges and XP, and convert contributions into verified career achievements.

## 🎮 Features

- **Pixelated Character System**: Create and customize your avatar with unlockable accessories
- **Geographical Map Exploration**: Discover dungeons and opportunities in your local area
- **Three Work Categories**: 
  - 🏗️ **Freelance Towers**: Individual client work and skill-based services
  - 🌱 **Community Gardens**: Volunteering and social impact projects  
  - 🏰 **Corporate Castles**: Structured organizational tasks and formal projects
- **AI-Powered Matching**: Gemini AI analyzes tasks and matches them to user skills
- **Gamification System**: Earn XP, badges, Trust Score, and Real-World Impact Score (RWIS)
- **Career Integration**: Export achievements as professional portfolios and certificates

## 🏗️ Architecture

```
├── frontend/          # React.js + TypeScript + Phaser.js
├── backend/           # Node.js + Express.js + PostgreSQL
├── shared/types/      # Shared TypeScript interfaces
└── docs/             # Documentation and specs
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 14+
- Redis 6+ (optional, for caching)
- Google Cloud Platform account (for Gemini AI)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd GOOD_GRID
   npm run install:all
   ```

2. **Set up environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Set up the database:**
   ```bash
   # Create PostgreSQL database
   createdb good_grid
   
   # Run schema setup
   npm run setup:db
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

   This starts:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/health

## 🔧 Configuration

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=good_grid
DB_USER=postgres
DB_PASSWORD=your_password

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# JWT
JWT_SECRET=your_jwt_secret

# Google Cloud Platform
GOOGLE_CLOUD_PROJECT_ID=your_project_id
```

### Google Cloud Platform Setup

1. Create a GCP project
2. Enable the Gemini API
3. Create a service account and download the key
4. Set `GOOGLE_APPLICATION_CREDENTIALS` to the key file path

## 📁 Project Structure

```
GOOD_GRID/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── database/       # Database schema and migrations
│   │   └── utils/          # Utility functions
│   └── package.json
├── shared/types/            # Shared TypeScript types
│   ├── index.ts            # Type definitions
│   └── package.json
└── package.json            # Root package.json with workspace config
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend
```

## 🏗️ Building

```bash
# Build all packages
npm run build

# Build specific packages
npm run build:frontend
npm run build:backend
npm run build:shared
```

## 🚀 Deployment

The application is designed to be deployed on Google Cloud Platform:

1. **Frontend**: Deploy to Cloud Storage + Cloud CDN
2. **Backend**: Deploy to Cloud Run or Compute Engine
3. **Database**: Use Cloud SQL for PostgreSQL
4. **Caching**: Use Memorystore for Redis

## 📚 API Documentation

Once the backend is running, API documentation is available at:
- Health check: `GET /health`
- API info: `GET /api`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the requirements and design documents in `.kiro/specs/good-grid-platform/`

## 🎯 Roadmap

See the implementation tasks in `.kiro/specs/good-grid-platform/tasks.md` for the complete development roadmap.