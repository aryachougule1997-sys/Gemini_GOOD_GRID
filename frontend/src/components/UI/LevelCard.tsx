import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Zap, TrendingUp } from 'lucide-react';

interface LevelCardProps {
  level: number;
  title: string;
  xp: number;
  nextLevelXP: number;
  category?: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
  rank?: string;
  isMaxLevel?: boolean;
  onClick?: () => void;
}

const LevelCard: React.FC<LevelCardProps> = ({
  level,
  title,
  xp,
  nextLevelXP,
  category,
  rank,
  isMaxLevel = false,
  onClick
}) => {
  const progress = Math.min((xp / nextLevelXP) * 100, 100);
  
  const categoryColors = {
    FREELANCE: {
      gradient: 'from-blue-600 to-cyan-600',
      accent: 'text-cyan-400',
      border: 'border-cyan-500/30',
      glow: 'shadow-cyan-500/20'
    },
    COMMUNITY: {
      gradient: 'from-green-600 to-emerald-600',
      accent: 'text-emerald-400',
      border: 'border-emerald-500/30',
      glow: 'shadow-emerald-500/20'
    },
    CORPORATE: {
      gradient: 'from-purple-600 to-violet-600',
      accent: 'text-violet-400',
      border: 'border-violet-500/30',
      glow: 'shadow-violet-500/20'
    }
  };

  const colors = category ? categoryColors[category] : {
    gradient: 'from-slate-600 to-slate-700',
    accent: 'text-slate-400',
    border: 'border-slate-500/30',
    glow: 'shadow-slate-500/20'
  };

  return (
    <motion.div
      className={`relative bg-gradient-to-br ${colors.gradient} rounded-2xl p-6 border ${colors.border} shadow-xl ${colors.glow} cursor-pointer group overflow-hidden`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-12 translate-y-12" />
      </div>

      {/* Level Badge */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg`}>
              {isMaxLevel ? (
                <Crown className="w-6 h-6 text-white" />
              ) : (
                <Star className="w-6 h-6 text-white" />
              )}
            </div>
            {/* Level number overlay */}
            <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white">
              {level}
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold text-lg">{title}</h3>
            {rank && (
              <p className={`${colors.accent} text-sm font-medium`}>{rank}</p>
            )}
          </div>
        </div>

        {/* Category Badge */}
        {category && (
          <div className={`px-3 py-1 bg-black/20 rounded-full border ${colors.border}`}>
            <span className="text-white text-xs font-medium">{category}</span>
          </div>
        )}
      </div>

      {/* XP Progress */}
      <div className="relative mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-medium">
              {xp.toLocaleString()} XP
            </span>
          </div>
          {!isMaxLevel && (
            <span className="text-white/70 text-sm">
              {(nextLevelXP - xp).toLocaleString()} to next
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-black/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-white/80">Progress</span>
        </div>
        <span className="text-white font-bold">{progress.toFixed(1)}%</span>
      </div>

      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100"
        initial={false}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default LevelCard;