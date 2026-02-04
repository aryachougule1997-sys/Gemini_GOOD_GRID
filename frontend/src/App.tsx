import React, { useState } from 'react';
import './App.css';
import CharacterCreationPage from './pages/CharacterCreationPage';
import MapPage from './pages/MapPage';
import GamificationTestPage from './pages/GamificationTestPage';
import ZoneProgressionPage from './pages/ZoneProgressionPage';
import CareerHub from './components/Career/CareerHub';
import MainNavigation from './components/Navigation/MainNavigation';
import MapCareerDemo from './components/Demo/MapCareerDemo';
import ProfileDemoPage from './pages/ProfileDemoPage';
import DarkGameProfilePage from './pages/DarkGameProfilePage';
import ComprehensiveProfileDashboard from './components/Profile/ComprehensiveProfileDashboard';
import GamifiedUIDemo from './components/Demo/GamifiedUIDemo';
import GamifiedOrganizationDashboard from './components/Organization/GamifiedOrganizationDashboard';
import { CharacterData as GameCharacterData, User, Dungeon, UserStats, Task } from '../../shared/types';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'character' | 'map' | 'career' | 'integrated' | 'gamification' | 'zones' | 'profile' | 'dark-profile' | 'comprehensive-profile' | 'gamified-demo' | 'organization'>('home'); // Show home by default
  const [characterData, setCharacterData] = useState<GameCharacterData | null>(null);
  
  // Mock user stats for demo
  const mockUserStats: UserStats = {
    userId: 'demo-user',
    trustScore: 87,
    rwisScore: 145,
    xpPoints: 2850,
    currentLevel: 12,
    unlockedZones: ['starter-town', 'tech-district', 'community-hub'],
    categoryStats: {
      freelance: {
        tasksCompleted: 15,
        totalXP: 800,
        averageRating: 4.8,
        specializations: ['web-development', 'ui-design', 'react']
      },
      community: {
        tasksCompleted: 23,
        totalXP: 1200,
        averageRating: 4.9,
        specializations: ['environmental', 'education', 'mentoring']
      },
      corporate: {
        tasksCompleted: 8,
        totalXP: 850,
        averageRating: 4.5,
        specializations: ['project-management', 'consulting', 'strategy']
      }
    }
  };

  // Mock user data for demo
  const mockUser: User = {
    id: 'demo-user',
    username: 'GoodGridHero',
    email: 'hero@goodgrid.com',
    characterData: characterData || {
      baseSprite: 'DEFAULT',
      colorPalette: {
        primary: '#feca57',
        secondary: '#48dbfb',
        accent: '#ff9ff3'
      },
      accessories: [
        {
          id: 'crown-1',
          name: 'Achievement Crown',
          type: 'HAT',
          unlockCondition: 'Complete 10 tasks'
        }
      ],
      unlockedItems: []
    },
    locationData: {
      coordinates: { x: 400, y: 300 },
      currentZone: 'starter-town',
      discoveredDungeons: ['freelance-tower-1', 'community-garden-1']
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const handleCharacterCreated = (data: GameCharacterData) => {
    setCharacterData(data);
    setCurrentPage('integrated');
    console.log('Character created:', data);
  };

  const handleNavigateToCharacterCreation = () => {
    setCurrentPage('character');
  };

  const handleNavigateToMap = () => {
    setCurrentPage('map');
  };

  const handleNavigateToDungeon = (dungeon: Dungeon) => {
    console.log('Navigating to dungeon:', dungeon);
    // In a real app, this would navigate to the dungeon interface
    alert(`Welcome to ${dungeon.name}! 🏰\n\nThis is where you'd see available tasks and challenges.`);
  };

  const handleTaskSelect = (task: Task) => {
    console.log('Task selected:', task);
    // In a real app, this would navigate to the task details or application page
    alert(`Task Selected: ${task.title}\n\nThis would open the task application interface.`);
  };

  const handleNavigateToCareer = () => {
    setCurrentPage('career');
  };

  const handleNavigateToIntegrated = () => {
    setCurrentPage('integrated');
  };

  const handleNavigateToGamification = () => {
    setCurrentPage('gamification');
  };

  const handleNavigateToZones = () => {
    setCurrentPage('zones');
  };

  const handleNavigateToProfile = () => {
    setCurrentPage('profile');
  };

  const handleNavigateToDarkProfile = () => {
    setCurrentPage('dark-profile');
  };

  const handleNavigateToHome = () => {
    setCurrentPage('home');
  };

  const handleNavigateToOrganization = () => {
    setCurrentPage('organization');
  };

  const handleNavigateToComprehensiveProfile = () => {
    setCurrentPage('comprehensive-profile');
  };

  const handleNavigateToGamifiedDemo = () => {
    setCurrentPage('gamified-demo');
  };

  // Add persistent header for all pages except home
  const renderWithHeader = (content: React.ReactNode) => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Persistent Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleNavigateToHome}
              className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <span className="text-xl font-bold">Good Grid</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleNavigateToMap}
              className={`px-4 py-2 rounded-lg transition-all ${currentPage === 'map' ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              🗺️ Map
            </button>
            <button 
              onClick={handleNavigateToCareer}
              className={`px-4 py-2 rounded-lg transition-all ${currentPage === 'career' ? 'bg-orange-500 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              💼 Career
            </button>
            <button 
              onClick={handleNavigateToComprehensiveProfile}
              className={`px-4 py-2 rounded-lg transition-all ${currentPage === 'comprehensive-profile' ? 'bg-pink-500 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              👤 Profile
            </button>
            <button 
              onClick={handleNavigateToOrganization}
              className={`px-4 py-2 rounded-lg transition-all ${currentPage === 'organization' ? 'bg-purple-500 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
            >
              🏰 Guild
            </button>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-blue-400">
              <span>🛡️</span>
              <span>{mockUserStats.trustScore}</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-400">
              <span>⚡</span>
              <span>{mockUserStats.rwisScore}</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <span>LV</span>
              <span>{mockUserStats.currentLevel}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="flex-1">
        {content}
      </div>
    </div>
  );

  // Show integrated navigation by default
  if (currentPage === 'integrated') {
    return renderWithHeader(<MapCareerDemo />);
  }

  if (currentPage === 'character') {
    return renderWithHeader(
      <CharacterCreationPage
        userId={mockUser.id}
        onCharacterCreated={handleCharacterCreated}
        onCancel={characterData ? handleNavigateToIntegrated : handleNavigateToHome}
      />
    );
  }

  if (currentPage === 'map') {
    return renderWithHeader(
      <div className="h-screen flex flex-col">
        <div className="flex-1 p-4">
          <MapPage
            user={mockUser}
            characterData={characterData || mockUser.characterData}
            userStats={mockUserStats}
            onNavigateToCharacterCreation={handleNavigateToCharacterCreation}
            onNavigateToDungeon={handleNavigateToDungeon}
            onTaskSelect={handleTaskSelect}
            onNavigateToCareer={handleNavigateToCareer}
            authToken="demo-token"
          />
        </div>
      </div>
    );
  }

  if (currentPage === 'career') {
    return renderWithHeader(
      <div key={Date.now()}> {/* Cache busting key */}
        <CareerHub userId={mockUser.id} />
      </div>
    );
  }

  if (currentPage === 'gamification') {
    return renderWithHeader(<GamificationTestPage />);
  }

  if (currentPage === 'zones') {
    return renderWithHeader(
      <ZoneProgressionPage
        userStats={mockUserStats}
        onUserStatsUpdate={(newStats) => {
          console.log('User stats updated:', newStats);
          // In a real app, this would update the global state
        }}
        onNavigateBack={handleNavigateToHome}
      />
    );
  }

  if (currentPage === 'profile') {
    return renderWithHeader(<ProfileDemoPage />);
  }

  if (currentPage === 'dark-profile') {
    return renderWithHeader(<DarkGameProfilePage />);
  }

  if (currentPage === 'comprehensive-profile') {
    return renderWithHeader(<ComprehensiveProfileDashboard userId="demo-user" />);
  }

  if (currentPage === 'organization') {
    return renderWithHeader(<GamifiedOrganizationDashboard organizationId="demo-org" />);
  }

  if (currentPage === 'gamified-demo') {
    return renderWithHeader(<GamifiedUIDemo />);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl">
              <span className="text-3xl">⚡</span>
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Good Grid
          </h1>
          <p className="text-xl text-purple-200 mb-2">Gamified Community Contribution Platform</p>
          <p className="text-lg text-purple-300">🚀 Now with AI-Powered Career Tools! 🚀</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8 max-w-8xl w-full">
          {/* Character Creation Card */}
          <div 
            onClick={handleNavigateToCharacterCreation}
            className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-white/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">👤</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Create Character</h3>
                <p className="text-purple-100 mb-4">Design your unique avatar and start your journey</p>
                <div className="flex items-center text-sm text-purple-200">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Customization & Personalization
                </div>
              </div>
            </div>
          </div>

          {/* Map Exploration Card */}
          <div 
            onClick={handleNavigateToMap}
            className="group cursor-pointer transform hover:scale-105 transition-all duration-300"
          >
            <div className="bg-gradient-to-br from-green-600 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-white/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🗺️</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Explore Map</h3>
                <p className="text-green-100 mb-4">Discover zones, complete quests, and earn rewards</p>
                <div className="flex items-center text-sm text-green-200">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                  Adventure & Quests
                </div>
              </div>
            </div>
          </div>

          {/* Career Hub Card - NEW & HIGHLIGHTED */}
          <div 
            onClick={handleNavigateToCareer}
            className="group cursor-pointer transform hover:scale-105 transition-all duration-300 relative"
          >
            {/* NEW Badge */}
            <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
              🆕 NEW!
            </div>
            
            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border-2 border-yellow-400/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">💼</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Career Hub</h3>
                <p className="text-orange-100 mb-4">AI-powered resume builder, job matching & career insights</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-orange-200">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    🤖 AI Resume Generator
                  </div>
                  <div className="flex items-center text-sm text-orange-200">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    🎯 Smart Job Matching
                  </div>
                  <div className="flex items-center text-sm text-orange-200">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                    📊 Career Analytics
                  </div>
                </div>
              </div>
              
              {/* Sparkle Animation */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-8 text-yellow-300 animate-ping">✨</div>
                <div className="absolute bottom-8 left-6 text-yellow-300 animate-ping animation-delay-1000">⭐</div>
                <div className="absolute top-1/2 right-4 text-yellow-300 animate-ping animation-delay-2000">💫</div>
              </div>
            </div>
          </div>

          {/* Gamification Test Card - NEW */}
          <div 
            onClick={handleNavigateToGamification}
            className="group cursor-pointer transform hover:scale-105 transition-all duration-300 relative"
          >
            {/* TEST Badge */}
            <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
              🧪 TEST
            </div>
            
            <div className="bg-gradient-to-br from-cyan-600 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border-2 border-cyan-400/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🎮</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Gamification</h3>
                <p className="text-cyan-100 mb-4">Test the new gamification system with XP, badges & leaderboards</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-cyan-200">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                    ⭐ XP & Level System
                  </div>
                  <div className="flex items-center text-sm text-cyan-200">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    🏅 Badge Collection
                  </div>
                  <div className="flex items-center text-sm text-cyan-200">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                    🏆 Trust Score & RWIS
                  </div>
                </div>
              </div>
              
              {/* Game Animation */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-8 text-yellow-300 animate-bounce">🎯</div>
                <div className="absolute bottom-8 left-6 text-green-300 animate-bounce animation-delay-1000">🏅</div>
                <div className="absolute top-1/2 right-4 text-purple-300 animate-bounce animation-delay-2000">⚡</div>
              </div>
            </div>
          </div>

          {/* Zone Progression Card - NEWEST */}
          <div 
            onClick={handleNavigateToZones}
            className="group cursor-pointer transform hover:scale-105 transition-all duration-300 relative"
          >
            {/* NEWEST Badge */}
            <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
              ✨ NEWEST!
            </div>
            
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border-2 border-emerald-400/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🗺️</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Zone Progression</h3>
                <p className="text-emerald-100 mb-4">Unlock new zones with stunning celebrations & advanced dungeons</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-emerald-200">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                    🎉 Zone Unlock Celebrations
                  </div>
                  <div className="flex items-center text-sm text-emerald-200">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                    🏰 Advanced Dungeon Tiers
                  </div>
                  <div className="flex items-center text-sm text-emerald-200">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    🌟 Progressive Map Reveal
                  </div>
                </div>
              </div>
              
              {/* Zone Animation */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-8 text-yellow-300 animate-pulse">🌟</div>
                <div className="absolute bottom-8 left-6 text-purple-300 animate-pulse animation-delay-1000">🏰</div>
                <div className="absolute top-1/2 right-4 text-blue-300 animate-pulse animation-delay-2000">🗺️</div>
              </div>
            </div>
          </div>

          {/* Profile Dashboard Card - LATEST */}
          <div 
            onClick={handleNavigateToProfile}
            className="group cursor-pointer transform hover:scale-105 transition-all duration-300 relative"
          >
            {/* LATEST Badge */}
            <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-pink-400 to-rose-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
              🔥 LATEST!
            </div>
            
            <div className="bg-gradient-to-br from-pink-600 to-rose-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border-2 border-pink-400/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">👤</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Profile Dashboard</h3>
                <p className="text-pink-100 mb-4">Comprehensive profile with work history, analytics & customization</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-pink-200">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                    📊 Work History Tracking
                  </div>
                  <div className="flex items-center text-sm text-pink-200">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    🎨 Character Customization
                  </div>
                  <div className="flex items-center text-sm text-pink-200">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                    📈 Analytics & Insights
                  </div>
                </div>
              </div>
              
              {/* Profile Animation */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-8 text-yellow-300 animate-bounce">👑</div>
                <div className="absolute bottom-8 left-6 text-green-300 animate-bounce animation-delay-1000">🏆</div>
                <div className="absolute top-1/2 right-4 text-purple-300 animate-bounce animation-delay-2000">⭐</div>
              </div>
            </div>
          </div>

          {/* Dark Gaming Profile Card - HOTTEST */}
          <div 
            onClick={handleNavigateToDarkProfile}
            className="group cursor-pointer transform hover:scale-105 transition-all duration-300 relative"
          >
            {/* HOTTEST Badge */}
            <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-red-500 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
              🔥 HOTTEST!
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border-2 border-purple-500/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🎮</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Dark Gaming UI</h3>
                <p className="text-purple-100 mb-4">Retro dark fantasy profile with animated starfields & RPG elements</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-purple-200">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                    🌌 Animated Starfield
                  </div>
                  <div className="flex items-center text-sm text-purple-200">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                    ⚔️ RPG-Style Interface
                  </div>
                  <div className="flex items-center text-sm text-purple-200">
                    <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                    🏰 Guild System
                  </div>
                </div>
              </div>
              
              {/* Dark Gaming Animation */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-8 text-purple-300 animate-pulse">⚡</div>
                <div className="absolute bottom-8 left-6 text-orange-300 animate-pulse animation-delay-1000">🔮</div>
                <div className="absolute top-1/2 right-4 text-pink-300 animate-pulse animation-delay-2000">✨</div>
              </div>
            </div>
          </div>

          {/* Organization Guild Dashboard Card - BRAND NEW */}
          <div 
            onClick={handleNavigateToOrganization}
            className="group cursor-pointer transform hover:scale-105 transition-all duration-300 relative"
          >
            {/* BRAND NEW Badge */}
            <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-bounce">
              ✨ BRAND NEW!
            </div>
            
            <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border-2 border-violet-400/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🏰</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Guild Dashboard</h3>
                <p className="text-violet-100 mb-4">Epic organization management with gamified quest boards & guild analytics</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-violet-200">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                    ⚔️ Quest Board Management
                  </div>
                  <div className="flex items-center text-sm text-violet-200">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    👥 Guild Member System
                  </div>
                  <div className="flex items-center text-sm text-violet-200">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    📊 Analytics Crystal
                  </div>
                </div>
              </div>
              
              {/* Guild Animation */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 right-8 text-yellow-300 animate-pulse">👑</div>
                <div className="absolute bottom-8 left-6 text-green-300 animate-pulse animation-delay-1000">⚔️</div>
                <div className="absolute top-1/2 right-4 text-blue-300 animate-pulse animation-delay-2000">🏆</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 max-w-4xl w-full">
          <div className="bg-black/20 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
            <h2 className="text-3xl font-bold text-white text-center mb-8">🚀 New AI-Powered Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-white font-semibold mb-2">AI Analysis</h3>
                <p className="text-gray-300 text-sm">Smart career insights powered by Gemini AI</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Auto Resume</h3>
                <p className="text-gray-300 text-sm">Generate professional resumes instantly</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Job Matching</h3>
                <p className="text-gray-300 text-sm">Find perfect opportunities based on your skills</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-white font-semibold mb-2">Progress Tracking</h3>
                <p className="text-gray-300 text-sm">Gamified career advancement system</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center space-y-4">
          <button 
            onClick={handleNavigateToCareer}
            className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-12 py-4 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transform transition-all duration-300 animate-pulse"
          >
            🚀 Try Career Hub Now! 🚀
          </button>
          
          {/* Profile Dashboard Button - LATEST */}
          <div>
            <button 
              onClick={handleNavigateToProfile}
              className="bg-gradient-to-r from-pink-400 via-rose-500 to-red-600 text-white px-12 py-4 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transform transition-all duration-300 animate-pulse"
            >
              🔥 View Profile Dashboard! 🔥
            </button>
          </div>
          
          {/* Zone Progression Button - NEWEST */}
          <div>
            <button 
              onClick={handleNavigateToZones}
              className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 text-white px-12 py-4 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transform transition-all duration-300 animate-bounce"
            >
              ✨ Explore Zone Progression! ✨
            </button>
          </div>
          
          {/* Dark Gaming Profile Button - HOTTEST */}
          <div>
            <button 
              onClick={handleNavigateToDarkProfile}
              className="bg-gradient-to-r from-gray-800 via-purple-900 to-black text-white px-12 py-4 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transform transition-all duration-300 animate-pulse border-2 border-purple-500"
            >
              🎮 Experience Dark Gaming UI! 🌌
            </button>
          </div>
          
          {/* Organization Guild Dashboard Button - BRAND NEW */}
          <div>
            <button 
              onClick={handleNavigateToOrganization}
              className="bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-800 text-white px-12 py-4 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transform transition-all duration-300 animate-bounce border-2 border-violet-400"
            >
              🏰 Manage Your Guild! ⚔️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;