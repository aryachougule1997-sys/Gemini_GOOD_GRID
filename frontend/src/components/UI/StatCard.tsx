import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'cyan' | 'pink';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: IconComponent,
  trend,
  color,
  size = 'md',
  animated = true,
  onClick
}) => {
  const colorConfig = {
    blue: {
      gradient: 'from-blue-600 to-blue-700',
      accent: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      glow: 'shadow-blue-500/20'
    },
    green: {
      gradient: 'from-green-600 to-green-700',
      accent: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      glow: 'shadow-green-500/20'
    },
    purple: {
      gradient: 'from-purple-600 to-purple-700',
      accent: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      glow: 'shadow-purple-500/20'
    },
    orange: {
      gradient: 'from-orange-600 to-orange-700',
      accent: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      glow: 'shadow-orange-500/20'
    },
    red: {
      gradient: 'from-red-600 to-red-700',
      accent: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      glow: 'shadow-red-500/20'
    },
    yellow: {
      gradient: 'from-yellow-600 to-yellow-700',
      accent: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      glow: 'shadow-yellow-500/20'
    },
    cyan: {
      gradient: 'from-cyan-600 to-cyan-700',
      accent: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      glow: 'shadow-cyan-500/20'
    },
    pink: {
      gradient: 'from-pink-600 to-pink-700',
      accent: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/30',
      glow: 'shadow-pink-500/20'
    }
  };

  const sizeConfig = {
    sm: {
      container: 'p-4',
      icon: 'w-8 h-8',
      iconContainer: 'w-12 h-12',
      title: 'text-sm',
      value: 'text-xl',
      subtitle: 'text-xs'
    },
    md: {
      container: 'p-6',
      icon: 'w-10 h-10',
      iconContainer: 'w-16 h-16',
      title: 'text-base',
      value: 'text-3xl',
      subtitle: 'text-sm'
    },
    lg: {
      container: 'p-8',
      icon: 'w-12 h-12',
      iconContainer: 'w-20 h-20',
      title: 'text-lg',
      value: 'text-4xl',
      subtitle: 'text-base'
    }
  };

  const colors = colorConfig[color];
  const sizes = sizeConfig[size];

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend.value < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.isPositive === undefined) {
      return trend.value > 0 ? 'text-green-400' : trend.value < 0 ? 'text-red-400' : 'text-gray-400';
    }
    return trend.isPositive ? 'text-green-400' : 'text-red-400';
  };

  return (
    <motion.div
      className={`
        relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl 
        border ${colors.border} shadow-xl ${colors.glow} overflow-hidden
        ${onClick ? 'cursor-pointer hover:shadow-2xl' : ''}
        ${sizes.container}
      `}
      initial={animated ? { opacity: 0, scale: 0.9 } : false}
      animate={animated ? { opacity: 1, scale: 1 } : false}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-12 translate-y-12" />
      </div>

      {/* Content */}
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <h3 className={`${colors.accent} font-medium ${sizes.title} mb-2`}>
            {title}
          </h3>

          {/* Value */}
          <motion.div
            className={`text-white font-bold ${sizes.value} mb-1`}
            initial={animated ? { opacity: 0, y: 10 } : false}
            animate={animated ? { opacity: 1, y: 0 } : false}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.div>

          {/* Subtitle */}
          {subtitle && (
            <p className={`text-slate-400 ${sizes.subtitle}`}>
              {subtitle}
            </p>
          )}

          {/* Trend */}
          {trend && (
            <motion.div
              className={`flex items-center gap-1 mt-2 ${getTrendColor()}`}
              initial={animated ? { opacity: 0, x: -10 } : false}
              animate={animated ? { opacity: 1, x: 0 } : false}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {Math.abs(trend.value)}% {trend.label}
              </span>
            </motion.div>
          )}
        </div>

        {/* Icon */}
        <motion.div
          className={`
            ${sizes.iconContainer} rounded-2xl bg-gradient-to-br ${colors.gradient} 
            flex items-center justify-center shadow-lg
          `}
          initial={animated ? { opacity: 0, rotate: -10 } : false}
          animate={animated ? { opacity: 1, rotate: 0 } : false}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ rotate: 5, scale: 1.05 }}
        >
          <IconComponent className={`${sizes.icon} text-white`} />
        </motion.div>
      </div>

      {/* Hover Glow Effect */}
      {onClick && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Animated Border */}
      <motion.div
        className={`absolute inset-0 rounded-2xl border-2 ${colors.border} opacity-0`}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default StatCard;