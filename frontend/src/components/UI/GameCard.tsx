import React from 'react';
import { motion } from 'framer-motion';

interface GameCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'legendary' | 'epic' | 'rare' | 'common';
  glowing?: boolean;
  onClick?: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  glowing = false,
  onClick 
}) => {
  const variantStyles = {
    default: 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600',
    legendary: 'bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-500',
    epic: 'bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-500',
    rare: 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500',
    common: 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-500'
  };

  const glowStyles = {
    default: '',
    legendary: 'shadow-orange-500/20',
    epic: 'shadow-purple-500/20',
    rare: 'shadow-blue-500/20',
    common: 'shadow-gray-500/20'
  };

  return (
    <motion.div
      className={`
        relative rounded-xl border backdrop-blur-sm
        ${variantStyles[variant]}
        ${glowing ? `shadow-2xl ${glowStyles[variant]}` : 'shadow-lg'}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {glowing && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GameCard;