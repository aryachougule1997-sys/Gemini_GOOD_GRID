import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Crown, Zap, Shield, Trophy } from 'lucide-react';

interface AchievementBadgeProps {
  id: string;
  name: string;
  description: string;
  category: 'SKILL' | 'ACHIEVEMENT' | 'CATEGORY' | 'SPECIAL';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  earnedDate?: Date;
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  id,
  name,
  description,
  category,
  rarity,
  earnedDate,
  isUnlocked,
  progress = 0,
  maxProgress = 100,
  onClick,
  size = 'md'
}) => {
  const rarityConfig = {
    COMMON: {
      gradient: 'from-gray-500 to-gray-600',
      glow: 'shadow-gray-500/30',
      border: 'border-gray-400/50',
      text: 'text-gray-300'
    },
    UNCOMMON: {
      gradient: 'from-green-500 to-green-600',
      glow: 'shadow-green-500/30',
      border: 'border-green-400/50',
      text: 'text-green-300'
    },
    RARE: {
      gradient: 'from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/30',
      border: 'border-blue-400/50',
      text: 'text-blue-300'
    },
    EPIC: {
      gradient: 'from-purple-500 to-purple-600',
      glow: 'shadow-purple-500/30',
      border: 'border-purple-400/50',
      text: 'text-purple-300'
    },
    LEGENDARY: {
      gradient: 'from-yellow-500 to-orange-500',
      glow: 'shadow-yellow-500/30',
      border: 'border-yellow-400/50',
      text: 'text-yellow-300'
    }
  };

  const categoryIcons = {
    SKILL: Zap,
    ACHIEVEMENT: Trophy,
    CATEGORY: Award,
    SPECIAL: Crown
  };

  const sizeConfig = {
    sm: {
      container: 'w-20 h-20',
      icon: 'w-8 h-8',
      text: 'text-xs',
      padding: 'p-2'
    },
    md: {
      container: 'w-24 h-24',
      icon: 'w-10 h-10',
      text: 'text-sm',
      padding: 'p-3'
    },
    lg: {
      container: 'w-32 h-32',
      icon: 'w-12 h-12',
      text: 'text-base',
      padding: 'p-4'
    }
  };

  const config = rarityConfig[rarity];
  const sizes = sizeConfig[size];
  const IconComponent = categoryIcons[category];
  const progressPercentage = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;

  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main Badge */}
      <div
        className={`
          ${sizes.container} ${sizes.padding}
          relative rounded-2xl border-2 ${config.border}
          ${isUnlocked 
            ? `bg-gradient-to-br ${config.gradient} ${config.glow} shadow-lg` 
            : 'bg-slate-800 border-slate-600 shadow-md'
          }
          flex flex-col items-center justify-center
          transition-all duration-300
        `}
      >
        {/* Background Pattern */}
        {isUnlocked && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
            <div className="absolute bottom-1 left-1 w-3 h-3 bg-white rounded-full" />
          </div>
        )}

        {/* Icon */}
        <div className="relative">
          <IconComponent 
            className={`
              ${sizes.icon} 
              ${isUnlocked ? 'text-white' : 'text-slate-500'}
              transition-colors duration-300
            `} 
          />
          
          {/* Rarity Stars */}
          {isUnlocked && rarity !== 'COMMON' && (
            <div className="absolute -top-1 -right-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
            </div>
          )}
        </div>

        {/* Progress Bar (for locked badges) */}
        {!isUnlocked && maxProgress > 0 && (
          <div className="absolute bottom-1 left-1 right-1">
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Unlock Animation */}
        {isUnlocked && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '100%', opacity: [0, 1, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 5,
              ease: "easeInOut"
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <motion.div
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none z-10"
        initial={{ opacity: 0, y: 10 }}
        whileHover={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 max-w-xs">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm">{name}</h4>
            <span className={`text-xs px-2 py-1 rounded-full ${config.text} bg-black/20`}>
              {rarity}
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-2">{description}</p>
          
          {isUnlocked && earnedDate && (
            <p className="text-xs text-slate-400">
              Earned: {earnedDate.toLocaleDateString()}
            </p>
          )}
          
          {!isUnlocked && maxProgress > 0 && (
            <p className="text-xs text-slate-400">
              Progress: {progress}/{maxProgress} ({progressPercentage.toFixed(1)}%)
            </p>
          )}
        </div>
      </motion.div>

      {/* Rarity Glow Effect */}
      {isUnlocked && rarity === 'LEGENDARY' && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-orange-500/20"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
};

export default AchievementBadge;