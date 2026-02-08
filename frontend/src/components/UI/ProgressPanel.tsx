import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, Award, Zap, Shield } from 'lucide-react';

interface ProgressMetric {
  label: string;
  value: number;
  maxValue: number;
  icon: React.ComponentType<any>;
  color: string;
  unit?: string;
}

interface ProgressPanelProps {
  title: string;
  subtitle?: string;
  metrics: ProgressMetric[];
  className?: string;
  showOverallProgress?: boolean;
  onViewDetails?: () => void;
}

const ProgressPanel: React.FC<ProgressPanelProps> = ({
  title,
  subtitle,
  metrics,
  className = '',
  showOverallProgress = true,
  onViewDetails
}) => {
  const overallProgress = metrics.length > 0 
    ? metrics.reduce((sum, metric) => sum + (metric.value / metric.maxValue), 0) / metrics.length * 100
    : 0;

  return (
    <motion.div
      className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-xl overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            {subtitle && (
              <p className="text-slate-400 text-sm">{subtitle}</p>
            )}
          </div>
          
          {showOverallProgress && (
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {overallProgress.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400">Overall</div>
            </div>
          )}
        </div>

        {/* Overall Progress Bar */}
        {showOverallProgress && (
          <div className="mt-4">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="p-6 space-y-4">
        {metrics.map((metric, index) => {
          const progress = (metric.value / metric.maxValue) * 100;
          const IconComponent = metric.icon;
          
          return (
            <motion.div
              key={index}
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-medium text-sm">{metric.label}</span>
                  <span className="text-white font-bold">
                    {metric.value.toLocaleString()}
                    {metric.unit && <span className="text-slate-400 ml-1">{metric.unit}</span>}
                    <span className="text-slate-400 mx-1">/</span>
                    {metric.maxValue.toLocaleString()}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${metric.color} rounded-full relative`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 + index * 0.1 }}
                  >
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 4,
                        ease: "easeInOut",
                        delay: index * 0.5
                      }}
                    />
                  </motion.div>
                </div>
                
                {/* Progress Text */}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-slate-400">
                    {progress >= 100 ? 'Complete!' : `${(metric.maxValue - metric.value).toLocaleString()} remaining`}
                  </span>
                  <span className="text-xs font-medium text-slate-300">
                    {progress.toFixed(1)}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Button */}
      {onViewDetails && (
        <div className="p-6 pt-0">
          <motion.button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewDetails}
          >
            <TrendingUp className="w-4 h-4" />
            View Detailed Progress
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

// Predefined metric configurations for common use cases
export const createXPMetric = (current: number, target: number): ProgressMetric => ({
  label: 'Experience Points',
  value: current,
  maxValue: target,
  icon: Zap,
  color: 'from-yellow-500 to-orange-500',
  unit: 'XP'
});

export const createTaskMetric = (completed: number, target: number): ProgressMetric => ({
  label: 'Tasks Completed',
  value: completed,
  maxValue: target,
  icon: Target,
  color: 'from-green-500 to-emerald-500',
  unit: 'tasks'
});

export const createTrustMetric = (current: number, target: number): ProgressMetric => ({
  label: 'Trust Score',
  value: current,
  maxValue: target,
  icon: Shield,
  color: 'from-blue-500 to-cyan-500'
});

export const createStreakMetric = (current: number, target: number): ProgressMetric => ({
  label: 'Daily Streak',
  value: current,
  maxValue: target,
  icon: Clock,
  color: 'from-purple-500 to-pink-500',
  unit: 'days'
});

export const createAchievementMetric = (earned: number, total: number): ProgressMetric => ({
  label: 'Achievements',
  value: earned,
  maxValue: total,
  icon: Award,
  color: 'from-orange-500 to-red-500',
  unit: 'badges'
});

export default ProgressPanel;