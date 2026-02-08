import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthFlow } from '../components/Auth';
import { GameDashboard } from '../components/UI';
import { CharacterDisplay } from '../components/Character';
import { MapContainer } from '../components/Map';
import { MainNav } from '../components/Navigation';
import CareerHub from '../components/Career/CareerHub';
import ComprehensiveProfileDashboard from '../components/Profile/ComprehensiveProfileDashboard';
import TaskCreationForm from '../components/TaskManagement/TaskCreationForm';
import { User, MapPin, Calendar, Mail, Shield, Zap, Award, Target, Trophy, Users, FileText, Settings } from 'lucide-react';
import ProfileService, { UserProfile } from '../services/profileService';
import { User as GameUser, CharacterData, UserStats } from '../../../shared/types';

const AuthDemo: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [showTaskCreationForm, setShowTaskCreationForm] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (userData?.userId) {
        try {
          setIsLoading(true);
          const profile = await ProfileService.getProfile(userData.userId);
          if (profile) {
            setUserProfile(profile);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (userData?.userId && !userProfile) {
      loadProfile();
    }
  }, [userData, userProfile]);

  const handleAuthComplete = async (completeUserData: any) => {
    console.log('🎯 handleAuthComplete called with:', completeUserData);
    console.log('🔑 userId:', completeUserData?.userId);
    
    setUserData(completeUserData);
    setIsLoading(true);
    
    try {
      // If profile data is already in completeUserData, use it directly
      if (completeUserData.characterData && completeUserData.stats) {
        console.log('✅ Using profile data from completeUserData');
        setUserProfile(completeUserData);
      } else {
        // Otherwise fetch it
        console.log('📡 Fetching profile for userId:', completeUserData.userId);
        const profile = await ProfileService.getProfile(completeUserData.userId);
        if (profile) {
          console.log('✅ Profile loaded:', profile);
          setUserProfile(profile);
        } else {
          console.warn('⚠️ No profile found for userId:', completeUserData.userId);
        }
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
    } finally {
      setIsLoading(false);
      setIsAuthenticated(true);
      console.log('✅ Authentication complete, userData set:', completeUserData);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserData(null);
    setUserProfile(null);
    setCurrentPage('dashboard');
  };

  const simulateTaskCompletion = async () => {
    if (!userData?.userId || !userProfile) return;
    
    try {
      const xpGained = Math.floor(Math.random() * 100) + 50;
      const updatedStats = {
        ...currentStats,
        xpPoints: currentStats.xpPoints + xpGained,
        trustScore: Math.min(currentStats.trustScore + 5, 100),
        categoryStats: {
          ...currentStats.categoryStats,
          freelance: {
            ...currentStats.categoryStats.freelance,
            tasksCompleted: currentStats.categoryStats.freelance.tasksCompleted + 1,
            totalXP: currentStats.categoryStats.freelance.totalXP + xpGained
          }
        }
      };
      
      const newLevel = Math.floor(updatedStats.xpPoints / 1000) + 1;
      if (newLevel > currentStats.currentLevel) {
        updatedStats.currentLevel = newLevel;
      }
      
      const updatedProfile = await ProfileService.updateStats(userData.userId, updatedStats);
      setUserProfile(updatedProfile);
      
      if (currentStats.categoryStats.freelance.tasksCompleted === 0) {
        const firstTaskBadge = {
          id: 'first_task_' + Date.now(),
          name: 'First Steps',
          description: 'Completed your first task',
          category: 'ACHIEVEMENT' as const,
          rarity: 'COMMON' as const
        };
        
        const profileWithBadge = await ProfileService.addBadge(userData.userId, firstTaskBadge);
        setUserProfile(profileWithBadge);
      }
    } catch (error) {
      console.error('Error simulating task completion:', error);
    }
  };

  const currentStats = userProfile?.stats || {
    trustScore: 0,
    rwisScore: 0,
    xpPoints: 0,
    currentLevel: 1,
    categoryStats: {
      freelance: { tasksCompleted: 0, totalXP: 0, averageRating: 0 },
      community: { tasksCompleted: 0, totalXP: 0, averageRating: 0 },
      corporate: { tasksCompleted: 0, totalXP: 0, averageRating: 0 }
    }
  };

  const currentBadges = userProfile?.badges || [];

  const gameUser: GameUser | null = userProfile ? {
    id: userProfile.userId,
    username: userProfile.gamingUsername,
    email: userProfile.email,
    characterData: userProfile.characterData,
    locationData: {
      coordinates: userProfile.location.coordinates 
        ? { x: userProfile.location.coordinates.lat || 200, y: userProfile.location.coordinates.lng || 200 }
        : { x: 200, y: 200 },
      currentZone: 'starter-town',
      discoveredDungeons: []
    },
    createdAt: userProfile.createdAt,
    updatedAt: userProfile.updatedAt
  } : null;

  const gameCharacterData: CharacterData | null = userProfile ? {
    name: userProfile.characterName,
    class: userProfile.characterClass,
    level: userProfile.stats.currentLevel,
    ...userProfile.characterData
  } : null;

  const gameUserStats: UserStats | null = userProfile ? {
    userId: userProfile.userId,
    trustScore: userProfile.stats.trustScore,
    rwisScore: userProfile.stats.rwisScore,
    xpPoints: userProfile.stats.xpPoints,
    currentLevel: userProfile.stats.currentLevel,
    unlockedZones: ['starter-town'],
    categoryStats: {
      freelance: {
        tasksCompleted: userProfile.stats.categoryStats.freelance.tasksCompleted,
        totalXP: userProfile.stats.categoryStats.freelance.totalXP,
        averageRating: userProfile.stats.categoryStats.freelance.averageRating,
        specializations: []
      },
      community: {
        tasksCompleted: userProfile.stats.categoryStats.community.tasksCompleted,
        totalXP: userProfile.stats.categoryStats.community.totalXP,
        averageRating: userProfile.stats.categoryStats.community.averageRating,
        specializations: []
      },
      corporate: {
        tasksCompleted: userProfile.stats.categoryStats.corporate.tasksCompleted,
        totalXP: userProfile.stats.categoryStats.corporate.totalXP,
        averageRating: userProfile.stats.categoryStats.corporate.averageRating,
        specializations: []
      }
    }
  } : null;

  if (!isAuthenticated) {
    return <AuthFlow onAuthComplete={handleAuthComplete} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
              ⚡
            </motion.div>
          </div>
          <p className="text-white text-lg">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  // Map View
  if (currentPage === 'map' && gameUser && gameCharacterData && gameUserStats) {
    console.log('🗺️ Rendering Map with user:', gameUser);
    return (
      <div className="relative w-full h-screen bg-slate-900">
        <MainNav
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          userProfile={{
            gamingUsername: userData?.gamingUsername,
            characterClass: userData?.characterClass,
            currentLevel: currentStats.currentLevel
          }}
        />
        <div className="w-full h-[calc(100vh-4rem)]">
          <MapContainer
            user={gameUser}
            characterData={gameCharacterData}
            userStats={gameUserStats}
            onDungeonEnter={(dungeon) => console.log('Entered dungeon:', dungeon)}
            onZoneUnlock={(zone) => console.log('Unlocked zone:', zone)}
            onTaskSelect={(task) => console.log('Selected task:', task)}
          />
        </div>
      </div>
    );
  }

  // Career Hub View
  if (currentPage === 'career' && userData?.userId) {
    console.log('🎯 Rendering Career Hub with userId:', userData.userId);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <MainNav
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          userProfile={{
            gamingUsername: userData?.gamingUsername,
            characterClass: userData?.characterClass,
            currentLevel: currentStats.currentLevel
          }}
        />
        <CareerHub userId={userData.userId} />
      </div>
    );
  }

  // Main Dashboard and Other Pages
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <MainNav
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        userProfile={{
          gamingUsername: userData?.gamingUsername,
          characterClass: userData?.characterClass,
          currentLevel: currentStats.currentLevel
        }}
      />

      <div className="max-w-7xl mx-auto p-6">
        {currentPage === 'dashboard' && (
          <>
            {currentStats.xpPoints === 0 && (
              <motion.div
                className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 mb-8 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🎉</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Welcome to Good Grid, {userData?.firstName}!</h3>
                    <p className="text-green-100">
                      Your adventure begins now! Complete tasks to earn XP, build your reputation, and unlock achievements.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 shadow-2xl p-8 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="flex items-start gap-6 mb-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden">
                      {userData?.profileImage ? (
                        <img src={URL.createObjectURL(userData.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <User className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {userData?.firstName} {userData?.lastName}
                      </h2>
                      <p className="text-slate-400 mb-4">{userData?.bio}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Mail className="w-4 h-4" />
                          {userData?.email}
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <MapPin className="w-4 h-4" />
                          {userData?.location?.city}, {userData?.location?.country}
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Calendar className="w-4 h-4" />
                          Born {new Date(userData?.dateOfBirth).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Shield className="w-4 h-4" />
                          User ID: {userData?.userId}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Character Profile
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex justify-center">
                        {userData?.characterData ? (
                          <CharacterDisplay characterData={userData.characterData} size="md" className="shadow-lg" />
                        ) : (
                          <div className="w-48 h-64 bg-slate-600 rounded-xl flex items-center justify-center">
                            <span className="text-slate-400">No Character Created</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl mb-1">🎮</div>
                          <div className="text-white font-medium">{userData?.characterName}</div>
                          <div className="text-slate-400 text-sm">Character</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl mb-1">⚔️</div>
                          <div className="text-white font-medium">{userData?.characterClass}</div>
                          <div className="text-slate-400 text-sm">Class</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl mb-1">⭐</div>
                          <div className="text-white font-medium">Level {currentStats.currentLevel}</div>
                          <div className="text-slate-400 text-sm">Hero Level</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl mb-1">🏆</div>
                          <div className="text-white font-medium">{currentBadges.length}</div>
                          <div className="text-slate-400 text-sm">Achievements</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="w-6 h-6" />
                      <span className="text-2xl font-bold">{currentStats.trustScore}</span>
                    </div>
                    <div className="text-blue-100">Trust Score</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="w-6 h-6" />
                      <span className="text-2xl font-bold">{currentStats.rwisScore}</span>
                    </div>
                    <div className="text-green-100">Impact Score</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="w-6 h-6" />
                      <span className="text-2xl font-bold">{currentStats.xpPoints.toLocaleString()}</span>
                    </div>
                    <div className="text-yellow-100">Experience Points</div>
                  </div>
                  
                  <button
                    onClick={simulateTaskCompletion}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-colors font-medium"
                  >
                    Complete Task (Demo)
                  </button>
                </div>
              </div>
            </motion.div>

            <GameDashboard
              user={{
                id: userData?.userId,
                username: userData?.gamingUsername,
                characterData: userData?.characterData
              }}
              stats={currentStats}
              badges={currentBadges}
              onNavigateToProfile={() => setCurrentPage('profile')}
              onNavigateToTasks={() => setCurrentPage('tasks')}
              onNavigateToAchievements={() => setCurrentPage('achievements')}
            />
          </>
        )}

        {currentPage === 'profile' && userData?.userId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
          >
            {(() => { console.log('👤 Rendering Profile with userId:', userData.userId); return null; })()}
            <ComprehensiveProfileDashboard userId={userData.userId} />
          </motion.div>
        )}

        {currentPage === 'tasks' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
          >
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Target className="w-8 h-8 text-green-400" />
                  Tasks & Quests
                </h2>
                <button
                  onClick={() => setShowTaskCreationForm(true)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-colors font-medium flex items-center gap-2"
                >
                  <span className="text-xl">+</span>
                  Create Quest
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                  <div className="text-4xl font-bold mb-2">{currentStats.categoryStats.freelance.tasksCompleted}</div>
                  <div className="text-blue-100">Freelance Tasks</div>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
                  <div className="text-4xl font-bold mb-2">{currentStats.categoryStats.community.tasksCompleted}</div>
                  <div className="text-green-100">Community Tasks</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
                  <div className="text-4xl font-bold mb-2">{currentStats.categoryStats.corporate.tasksCompleted}</div>
                  <div className="text-purple-100">Corporate Tasks</div>
                </div>
              </div>
              
              <div className="bg-slate-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Available Tasks</h3>
                <p className="text-slate-400 mb-4">Browse and accept tasks from the community to earn XP and build your reputation.</p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-colors font-medium">
                  Browse All Tasks
                </button>
              </div>
            </div>

            {/* Task Creation Form Modal */}
            {showTaskCreationForm && (
              <TaskCreationForm
                isOpen={showTaskCreationForm}
                onClose={() => setShowTaskCreationForm(false)}
                onTaskCreated={(task) => {
                  console.log('Task created:', task);
                  setShowTaskCreationForm(false);
                  // You can add a success notification here
                }}
              />
            )}
          </motion.div>
        )}

        {currentPage === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
          >
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-400" />
                Achievements & Badges
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Trophy className="w-12 h-12" />
                    <div className="text-4xl font-bold">{currentBadges.length}</div>
                  </div>
                  <div className="text-yellow-100">Total Badges Earned</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Award className="w-12 h-12" />
                    <div className="text-4xl font-bold">{currentStats.currentLevel}</div>
                  </div>
                  <div className="text-purple-100">Current Level</div>
                </div>
              </div>
              {currentBadges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentBadges.map((badge, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-700/50 rounded-2xl p-6 text-center hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      <div className="text-5xl mb-3">🏆</div>
                      <div className="text-white font-bold mb-1">{badge.name}</div>
                      <div className="text-slate-400 text-sm">{badge.description}</div>
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          badge.rarity === 'LEGENDARY' ? 'bg-yellow-600' :
                          badge.rarity === 'EPIC' ? 'bg-purple-600' :
                          badge.rarity === 'RARE' ? 'bg-blue-600' :
                          'bg-slate-600'
                        }`}>
                          {badge.rarity}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-700/50 rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-white mb-2">No Badges Yet</h3>
                  <p className="text-slate-400 mb-6">Complete tasks to earn your first achievement badge!</p>
                  <button
                    onClick={simulateTaskCompletion}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-colors font-medium"
                  >
                    Complete a Task (Demo)
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {currentPage === 'social' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
          >
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Users className="w-8 h-8 text-cyan-400" />
                Social Hub
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-2xl p-6 text-white text-center">
                  <Users className="w-12 h-12 mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-2">Connect</div>
                  <div className="text-cyan-100">Find other players in your zone</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-2">Compete</div>
                  <div className="text-purple-100">Climb the leaderboards</div>
                </div>
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white text-center">
                  <Shield className="w-12 h-12 mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-2">Collaborate</div>
                  <div className="text-green-100">Form teams for tasks</div>
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Coming Soon</h3>
                <p className="text-slate-400">Connect with other players, form teams, and compete on leaderboards!</p>
              </div>
            </div>
          </motion.div>
        )}

        {currentPage === 'submissions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
          >
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-400" />
                My Submissions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                  <div className="text-4xl font-bold mb-2">
                    {currentStats.categoryStats.freelance.tasksCompleted + 
                     currentStats.categoryStats.community.tasksCompleted + 
                     currentStats.categoryStats.corporate.tasksCompleted}
                  </div>
                  <div className="text-green-100">Total Completed</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-6 text-white">
                  <div className="text-4xl font-bold mb-2">0</div>
                  <div className="text-yellow-100">In Progress</div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                  <div className="text-4xl font-bold mb-2">
                    {((currentStats.categoryStats.freelance.averageRating + 
                       currentStats.categoryStats.community.averageRating + 
                       currentStats.categoryStats.corporate.averageRating) / 3).toFixed(1)}
                  </div>
                  <div className="text-blue-100">Average Rating</div>
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Work History</h3>
                <p className="text-slate-400">View all your completed tasks and submissions here.</p>
              </div>
            </div>
          </motion.div>
        )}

        {currentPage === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-6"
          >
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700 shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Settings className="w-8 h-8 text-slate-400" />
                Settings
              </h2>
              <div className="space-y-6">
                <div className="bg-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Email Notifications</div>
                        <div className="text-slate-400 text-sm">Receive updates about your tasks</div>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Enabled
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Profile Visibility</div>
                        <div className="text-slate-400 text-sm">Control who can see your profile</div>
                      </div>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Public
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Privacy & Security</h3>
                  <div className="space-y-4">
                    <button className="w-full px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors text-left">
                      Change Password
                    </button>
                    <button className="w-full px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors text-left">
                      Two-Factor Authentication
                    </button>
                    <button className="w-full px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors text-left">
                      Privacy Settings
                    </button>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Danger Zone</h3>
                  <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AuthDemo;
