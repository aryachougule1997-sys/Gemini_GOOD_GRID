import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  className?: string;
  showNumbers?: boolean;
}

const XPBar: React.FC<XPBarProps> = ({ 
  currentXP, 
  maxXP, 
  level, 
  className = '',
  showNumbers = true 
}) => {
  const percentage = Math.min((currentXP / maxXP) * 100, 100);
  
  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-white">Level {level}</span>
        </div>
        {showNumbers && (
          <span className="text-xs text-gray-300">
            {currentXP.toLocaleString()} / {maxXP.toLocaleString()} XP
          </span>
        )}
      </div>
      
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-600">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 rounded-full" />
          <motion.div
            className="absolute right-0 top-0 h-full w-1 bg-white/60 rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>
      
      {percentage === 100 && (
        <motion.div
          className="absolute -top-2 -right-2"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default XPBar;