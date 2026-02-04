import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, 
  Users, 
  Target, 
  TrendingUp, 
  Award, 
  Zap, 
  Star,
  Shield,
  Sword,
  Castle,
  Sparkles,
  Trophy,
  ChevronRight,
  Plus,
  Eye,
  Edit3,
  BarChart3,
  UserCheck
} from 'lucide-react';

interface OrganizationStats {
  totalTasks: number;
  completedTasks: number;
  activeVolunteers: number;
  averageRating: number;
  totalRWIS: number;
  organizationLevel: number;
  organizationXP: number;
  nextLevelXP: number;
}

interface GamifiedOrganizationDashboardProps {
  organizationId: string;
}

const GamifiedOrganizationDashboard: React.FC<GamifiedOrganizationDashboardProps> = ({ organizationId }) => {
  const [activeTab, setActiveTab] = useState<'command-center' | 'quest-board' | 'guild-members' | 'analytics-crystal'>('command-center');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const mockStats: OrganizationStats = {
    totalTasks: 156,
    completedTasks: 142,
    activeVolunteers: 89,
    averageRating: 4.8,
    totalRWIS: 12450,
    organizationLevel: 15,
    organizationXP: 8750,
    nextLevelXP: 10000
  };

  const mockOrganization = {
    name: "EcoWarriors Guild",
    description: "Legendary environmental champions saving the world one quest at a time",
    verified: true,
    guildRank: "Mythic",
    establishedDate: "2023",
    totalImpact: "50,000+ lives changed"
  };

  const mockRecentQuests = [
    {
      id: '1',
      title: 'Ocean Cleanup Expedition',
      category: 'COMMUNITY',
      status: 'COMPLETED',
      xpReward: 250,
      rwisReward: 150,
      volunteers: 12,
      completionRate: 100
    },
    {
      id: '2',
      title: 'Tree Planting Campaign',
      category: 'COMMUNITY',
      status: 'IN_PROGRESS',
      xpReward: 180,
      rwisReward: 120,
      volunteers: 8,
      completionRate: 75
    },
    {
      id: '3',
      title: 'Solar Panel Installation',
      category: 'CORPORATE',
      status: 'OPEN',
      xpReward: 300,
      rwisReward: 200,
      volunteers: 0,
      completionRate: 0
    }
  ];

  const mockTopVolunteers = [
    { name: 'EcoHero_Alex', level: 28, tasksCompleted: 45, totalXP: 12500, avatar: '🌟' },
    { name: 'GreenWarrior_Sam', level: 24, tasksCompleted: 38, totalXP: 9800, avatar: '🌱' },
    { name: 'CleanupChamp_Jordan', level: 22, tasksCompleted: 32, totalXP: 8200, avatar: '♻️' },
    { name: 'SolarSage_Riley', level: 20, tasksCompleted: 28, totalXP: 7100, avatar: '☀️' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'from-green-500 to-emerald-600';
      case 'IN_PROGRESS': return 'from-yellow-500 to-orange-600';
      case 'OPEN': return 'from-blue-500 to-cyan-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FREELANCE': return <Castle className="w-5 h-5" />;
      case 'COMMUNITY': return <Users className="w-5 h-5" />;
      case 'CORPORATE': return <Shield className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const tabs = [
    { id: 'command-center', label: 'Command Center', icon: <Crown className="w-5 h-5" /> },
    { id: 'quest-board', label: 'Quest Board', icon: <Sword className="w-5 h-5" /> },
    { id: 'guild-members', label: 'Guild Members', icon: <Users className="w-5 h-5" /> },
    { id: 'analytics-crystal', label: 'Analytics Crystal', icon: <BarChart3 className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Guild Header */}
        <div className="mb-8 opacity-0 animate-fade-in">
          <div className="bg-gradient-to-r from-slate-800/50 to-purple-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  {mockOrganization.verified && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{mockOrganization.name}</h1>
                    <div className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                      <span className="text-sm font-bold text-black">{mockOrganization.guildRank} Tier</span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-2">{mockOrganization.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>🏛️ Est. {mockOrganization.establishedDate}</span>
                    <span>🌟 {mockOrganization.totalImpact}</span>
                  </div>
                </div>
              </div>

              {/* Guild Level & XP */}
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-xl font-bold text-white">Level {mockStats.organizationLevel}</span>
                </div>
                <div className="w-48 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 ease-out"
                    style={{ width: `${(mockStats.organizationXP / mockStats.nextLevelXP) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {mockStats.organizationXP.toLocaleString()} / {mockStats.nextLevelXP.toLocaleString()} XP
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: 'Total Quests', 
              value: mockStats.totalTasks, 
              icon: <Target className="w-6 h-6" />, 
              color: 'from-blue-500 to-cyan-500',
              change: '+12 this week'
            },
            { 
              label: 'Completed', 
              value: mockStats.completedTasks, 
              icon: <Trophy className="w-6 h-6" />, 
              color: 'from-green-500 to-emerald-500',
              change: '91% success rate'
            },
            { 
              label: 'Guild Members', 
              value: mockStats.activeVolunteers, 
              icon: <Users className="w-6 h-6" />, 
              color: 'from-purple-500 to-pink-500',
              change: '+7 new heroes'
            },
            { 
              label: 'Guild Rating', 
              value: mockStats.averageRating, 
              icon: <Star className="w-6 h-6" />, 
              color: 'from-yellow-500 to-orange-500',
              change: 'Legendary tier'
            }
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="relative group hover:scale-105 hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`bg-gradient-to-br ${stat.color} p-6 rounded-xl shadow-lg border border-white/10`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-white/80">{stat.icon}</div>
                  <Sparkles className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
                <div className="text-sm text-white/80 mb-2">{stat.label}</div>
                <div className="text-xs text-white/60">{stat.change}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 bg-slate-800/50 backdrop-blur-sm rounded-xl p-2 border border-slate-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'command-center' && (
            <div
              key="command-center"
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 opacity-0 animate-fade-in"
            >
              {/* Recent Quests */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Sword className="w-5 h-5 mr-2 text-purple-400" />
                    Recent Quests
                  </h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4" />
                    <span>New Quest</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {mockRecentQuests.map((quest, index) => (
                    <div
                      key={quest.id}
                      className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:border-purple-500/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(quest.category)}
                          <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                            {quest.title}
                          </h4>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getStatusColor(quest.status)}`}>
                          {quest.status.replace('_', ' ')}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-gray-400">
                          <span>⚡ {quest.xpReward} XP</span>
                          <span>🌟 {quest.rwisReward} RWIS</span>
                          <span>👥 {quest.volunteers} heroes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-slate-600 rounded">
                            <Eye className="w-4 h-4 text-gray-400 hover:text-white" />
                          </button>
                          <button className="p-1 hover:bg-slate-600 rounded">
                            <Edit3 className="w-4 h-4 text-gray-400 hover:text-white" />
                          </button>
                        </div>
                      </div>
                      
                      {quest.status === 'IN_PROGRESS' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{quest.completionRate}%</span>
                          </div>
                          <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000"
                              style={{ width: `${quest.completionRate}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Guild Members */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                    Top Guild Members
                  </h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 rounded-lg text-gray-300 hover:text-white transition-colors">
                    <UserCheck className="w-4 h-4" />
                    <span>Manage</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {mockTopVolunteers.map((volunteer, index) => (
                    <div
                      key={volunteer.name}
                      className="flex items-center space-x-4 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{volunteer.avatar}</div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-yellow-400">#{index + 1}</span>
                          {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                            {volunteer.name}
                          </h4>
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                            Lv.{volunteer.level}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>🎯 {volunteer.tasksCompleted} quests</span>
                          <span>⚡ {volunteer.totalXP.toLocaleString()} XP</span>
                        </div>
                      </div>
                      
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quest-board' && (
            <div
              key="quest-board"
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8"
            >
              <div className="text-center py-12">
                <Sword className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Quest Board</h3>
                <p className="text-gray-400 mb-6">Manage and create epic quests for your guild members</p>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:scale-105 transition-transform">
                  Create New Quest
                </button>
              </div>
            </div>
          )}

          {activeTab === 'guild-members' && (
            <div
              key="guild-members"
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8"
            >
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Guild Members</h3>
                <p className="text-gray-400 mb-6">Manage your heroic guild members and their achievements</p>
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-medium hover:scale-105 transition-transform">
                  View All Members
                </button>
              </div>
            </div>
          )}

          {activeTab === 'analytics-crystal' && (
            <div
              key="analytics-crystal"
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8"
            >
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Analytics Crystal</h3>
                <p className="text-gray-400 mb-6">Mystical insights into your guild's performance and impact</p>
                <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-white font-medium hover:scale-105 transition-transform">
                  View Analytics
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamifiedOrganizationDashboard;