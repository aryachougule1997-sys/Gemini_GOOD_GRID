import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Star } from 'lucide-react';

interface XPBarProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
  category?: string;
  showLevel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const XPBar: React.FC<XPBarProps> = ({
  currentXP,
  nextLevelXP,
  level,
  category,
  showLevel = true,
  size = 'md',
  animated = true
}) => {
  const progress = Math.min((currentXP / nextLevelXP) * 100, 100);
  const remainingXP = Math.max(nextLevelXP - currentXP, 0);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const containerClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 ${containerClasses[size]}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className={`font-bold text-yellow-400 ${textClasses[size]}`}>
              {currentXP.toLocaleString()} XP
            </span>
          </div>
          {category && (
            <span className={`text-slate-400 ${textClasses[size]}`}>
              • {category}
            </span>
          )}
        </div>
        
        {showLevel && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-purple-400" />
            <span className={`font-bold text-purple-400 ${textClasses[size]}`}>
              LV {level}
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className={`bg-slate-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: animated ? 1.5 : 0, 
            ease: "easeOut",
            delay: animated ? 0.2 : 0
          }}
        >
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>

      {/* Progress Text */}
      <div className="flex items-center justify-between mt-2">
        <span className={`text-slate-400 ${textClasses[size]}`}>
          {remainingXP > 0 ? `${remainingXP.toLocaleString()} XP to next level` : 'Max Level!'}
        </span>
        <span className={`font-bold text-slate-300 ${textClasses[size]}`}>
          {progress.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

export default XPBar;