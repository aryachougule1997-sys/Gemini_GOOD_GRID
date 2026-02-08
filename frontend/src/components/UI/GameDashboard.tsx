import React from 'react';
import { motion } from 'framer-motion';
import { User, Zap, Shield, Target, Award, TrendingUp } from 'lucide-react';
import XPBar from './XPBar';
import LevelCard from './LevelCard';
import AchievementBadge from './AchievementBadge';
import ProgressPanel, { createXPMetric, createTaskMetric, createTrustMetric } from './ProgressPanel';
import StatCard from './StatCard';

interface GameDashboardProps {
  user: {
    id: string;
    username: string;
    characterData: any;
  };
  stats: {
    trustScore: number;
    rwisScore: number;
    xpPoints: number;
    currentLevel: number;
    categoryStats: {
      freelance: { tasksCompleted: number; totalXP: number; averageRating: number; };
      community: { tasksCompleted: number; totalXP: number; averageRating: number; };
      corporate: { tasksCompleted: number; totalXP: number; averageRating: number; };
    };
  };
  badges: Array<{
    id: string;
    name: string;
    description: string;
    category: 'SKILL' | 'ACHIEVEMENT' | 'CATEGORY' | 'SPECIAL';
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    earnedDate: Date;
  }>;
  onNavigateToProfile?: () => void;
  onNavigateToTasks?: () => void;
  onNavigateToAchievements?: () => void;
}

const GameDashboard: React.FC<GameDashboardProps> = ({
  user,
  stats,
  badges,
  onNavigateToProfile,
  onNavigateToTasks,
  onNavigateToAchievements
}) => {
  const nextLevelXP = (stats.currentLevel + 1) * 1000; // Example calculation
  const totalTasks = stats.categoryStats.freelance.tasksCompleted + 
                    stats.categoryStats.community.tasksCompleted + 
                    stats.categoryStats.corporate.tasksCompleted;

  const progressMetrics = [
    createXPMetric(stats.xpPoints, nextLevelXP),
    createTaskMetric(totalTasks, 100),
    createTrustMetric(stats.trustScore, 100)
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{user.username}</span>!
              </h1>
              <p className="text-slate-400 text-lg">Ready for your next adventure?</p>
            </div>
            
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Trust Score"
            value={stats.trustScore}
            subtitle="Reliability Rating"
            icon={Shield}
            color="blue"
            trend={stats.trustScore > 0 ? { value: 8, label: 'this week', isPositive: true } : undefined}
            onClick={onNavigateToProfile}
          />
          
          <StatCard
            title="Impact Score"
            value={stats.rwisScore}
            subtitle="Real-World Impact"
            icon={Target}
            color="green"
            trend={stats.rwisScore > 0 ? { value: 15, label: 'this month', isPositive: true } : undefined}
            onClick={onNavigateToProfile}
          />
          
          <StatCard
            title="Total Tasks"
            value={totalTasks}
            subtitle="Completed Quests"
            icon={Award}
            color="purple"
            trend={totalTasks > 0 ? { value: 12, label: 'this week', isPositive: true } : undefined}
            onClick={onNavigateToTasks}
          />
          
          <StatCard
            title="Current Level"
            value={stats.currentLevel}
            subtitle="Hero Rank"
            icon={TrendingUp}
            color="orange"
            onClick={onNavigateToProfile}
          />
        </div>

        {/* XP Progress */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <XPBar
            currentXP={stats.xpPoints}
            nextLevelXP={nextLevelXP}
            level={stats.currentLevel}
            size="lg"
            animated={true}
          />
        </motion.div>

        {/* Category Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <LevelCard
            level={Math.floor(stats.categoryStats.freelance.totalXP / 200) + 1}
            title="Freelance Master"
            xp={stats.categoryStats.freelance.totalXP}
            nextLevelXP={(Math.floor(stats.categoryStats.freelance.totalXP / 200) + 1) * 200}
            category="FREELANCE"
            rank="Independent Professional"
            onClick={onNavigateToProfile}
          />
          
          <LevelCard
            level={Math.floor(stats.categoryStats.community.totalXP / 200) + 1}
            title="Community Champion"
            xp={stats.categoryStats.community.totalXP}
            nextLevelXP={(Math.floor(stats.categoryStats.community.totalXP / 200) + 1) * 200}
            category="COMMUNITY"
            rank="Local Hero"
            onClick={onNavigateToProfile}
          />
          
          <LevelCard
            level={Math.floor(stats.categoryStats.corporate.totalXP / 200) + 1}
            title="Corporate Leader"
            xp={stats.categoryStats.corporate.totalXP}
            nextLevelXP={(Math.floor(stats.categoryStats.corporate.totalXP / 200) + 1) * 200}
            category="CORPORATE"
            rank="Executive Contributor"
            onClick={onNavigateToProfile}
          />
        </div>

        {/* Progress Panel and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Panel */}
          <ProgressPanel
            title="Quest Progress"
            subtitle="Your journey to mastery"
            metrics={progressMetrics}
            onViewDetails={onNavigateToProfile}
          />

          {/* Recent Achievements */}
          <motion.div
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Achievements</h3>
              <motion.button
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                onClick={onNavigateToAchievements}
              >
                View All
              </motion.button>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {badges.slice(0, 8).map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <AchievementBadge
                    id={badge.id}
                    name={badge.name}
                    description={badge.description}
                    category={badge.category}
                    rarity={badge.rarity}
                    earnedDate={badge.earnedDate}
                    isUnlocked={true}
                    size="sm"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;