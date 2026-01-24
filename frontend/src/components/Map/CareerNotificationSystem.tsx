import React, { useState, useEffect } from 'react';
import { UserStats } from '../../../../shared/types';

interface CareerNotification {
  id: string;
  type: 'milestone' | 'unlock' | 'achievement';
  title: string;
  message: string;
  icon: string;
  action?: {
    label: string;
    callback: () => void;
  };
}

interface CareerNotificationSystemProps {
  userStats: UserStats;
  onCareerToolOpen: (tool: 'profile' | 'resume' | 'jobs' | 'hub') => void;
}

const CareerNotificationSystem: React.FC<CareerNotificationSystemProps> = ({
  userStats,
  onCareerToolOpen
}) => {
  const [notifications, setNotifications] = useState<CareerNotification[]>([]);
  const [lastStats, setLastStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (lastStats) {
      checkForCareerMilestones(lastStats, userStats);
    }
    setLastStats(userStats);
  }, [userStats]);

  const checkForCareerMilestones = (oldStats: UserStats, newStats: UserStats) => {
    const oldTotalTasks = Object.values(oldStats.categoryStats).reduce(
      (total, category) => total + category.tasksCompleted, 0
    );
    const newTotalTasks = Object.values(newStats.categoryStats).reduce(
      (total, category) => total + category.tasksCompleted, 0
    );

    // First task completed
    if (oldTotalTasks === 0 && newTotalTasks >= 1) {
      addNotification({
        id: 'first-task',
        type: 'milestone',
        title: '🎉 First Task Complete!',
        message: 'You\'ve completed your first task! Your career journey begins.',
        icon: '🏆',
        action: {
          label: 'Build Profile',
          callback: () => onCareerToolOpen('profile')
        }
      });
    }

    // Profile building unlocked
    if (oldTotalTasks < 3 && newTotalTasks >= 3) {
      addNotification({
        id: 'profile-ready',
        type: 'unlock',
        title: '👤 Profile Building Unlocked!',
        message: 'You can now build your professional profile and generate resumes!',
        icon: '🔓',
        action: {
          label: 'Build Profile',
          callback: () => onCareerToolOpen('profile')
        }
      });
    }

    // Trust milestone
    if (oldStats.trustScore < 25 && newStats.trustScore >= 25) {
      addNotification({
        id: 'trust-milestone',
        type: 'unlock',
        title: '🛡️ Trust Milestone Reached!',
        message: 'Job matching is now available! Employers trust reliable candidates.',
        icon: '🎯',
        action: {
          label: 'Find Jobs',
          callback: () => onCareerToolOpen('jobs')
        }
      });
    }

    // Career ready
    if ((oldTotalTasks < 10 || oldStats.trustScore < 50) && 
        (newTotalTasks >= 10 && newStats.trustScore >= 50)) {
      addNotification({
        id: 'career-ready',
        type: 'achievement',
        title: '🚀 Career Ready!',
        message: 'You\'re now ready for professional opportunities! Full career hub unlocked.',
        icon: '🌟',
        action: {
          label: 'Open Career Hub',
          callback: () => onCareerToolOpen('hub')
        }
      });
    }

    // Level milestones
    if (oldStats.currentLevel < 5 && newStats.currentLevel >= 5) {
      addNotification({
        id: 'level-5',
        type: 'milestone',
        title: '⭐ Level 5 Reached!',
        message: 'Your experience is growing! New career opportunities await.',
        icon: '🎖️'
      });
    }

    if (oldStats.currentLevel < 10 && newStats.currentLevel >= 10) {
      addNotification({
        id: 'level-10',
        type: 'achievement',
        title: '👑 Expert Level!',
        message: 'Level 10 achieved! You\'re now an experienced professional.',
        icon: '🏅',
        action: {
          label: 'Generate Resume',
          callback: () => onCareerToolOpen('resume')
        }
      });
    }
  };

  const addNotification = (notification: CareerNotification) => {
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 10 seconds if no action
    setTimeout(() => {
      removeNotification(notification.id);
    }, 10000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationAction = (notification: CareerNotification) => {
    if (notification.action) {
      notification.action.callback();
    }
    removeNotification(notification.id);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="career-notification-system">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={`career-notification ${notification.type}`}
        >
          <div className="notification-icon">{notification.icon}</div>
          <div className="notification-content">
            <div className="notification-title">{notification.title}</div>
            <div className="notification-message">{notification.message}</div>
            {notification.action && (
              <button
                className="notification-action"
                onClick={() => handleNotificationAction(notification)}
              >
                {notification.action.label}
              </button>
            )}
          </div>
          <button
            className="notification-close"
            onClick={() => removeNotification(notification.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default CareerNotificationSystem;