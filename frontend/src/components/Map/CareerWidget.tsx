import React, { useState, useEffect } from 'react';
import { UserStats } from '../../../../shared/types';

interface CareerWidgetProps {
  userStats: UserStats;
  onToolOpen: (tool: 'profile' | 'resume' | 'jobs' | 'hub') => void;
}

const CareerWidget: React.FC<CareerWidgetProps> = ({ userStats, onToolOpen }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);

  const getCareerProgress = () => {
    const totalTasks = Object.values(userStats.categoryStats).reduce(
      (total, category) => total + category.tasksCompleted, 0
    );
    
    const milestones = [
      { 
        id: 'first-task', 
        title: 'First Task Complete', 
        description: 'Complete your first task',
        requirement: 1,
        current: totalTasks,
        completed: totalTasks >= 1,
        reward: 'Profile building unlocked'
      },
      { 
        id: 'profile-ready', 
        title: 'Profile Ready', 
        description: 'Complete 3 tasks to build your profile',
        requirement: 3,
        current: totalTasks,
        completed: totalTasks >= 3,
        reward: 'Resume generation unlocked'
      },
      { 
        id: 'trust-builder', 
        title: 'Trust Builder', 
        description: 'Reach 25 trust score',
        requirement: 25,
        current: userStats.trustScore,
        completed: userStats.trustScore >= 25,
        reward: 'Job matching unlocked'
      },
      { 
        id: 'career-ready', 
        title: 'Career Ready', 
        description: 'Complete 10 tasks with 50+ trust score',
        requirement: 10,
        current: totalTasks,
        completed: totalTasks >= 10 && userStats.trustScore >= 50,
        reward: 'Full career hub access'
      },
      { 
        id: 'expert-level', 
        title: 'Expert Level', 
        description: 'Reach level 10',
        requirement: 10,
        current: userStats.currentLevel,
        completed: userStats.currentLevel >= 10,
        reward: 'Premium career features'
      }
    ];

    const completedMilestones = milestones.filter(m => m.completed).length;
    const nextMilestone = milestones.find(m => !m.completed);
    
    return {
      totalTasks,
      milestones,
      completedMilestones,
      nextMilestone,
      careerScore: Math.round((completedMilestones / milestones.length) * 100)
    };
  };

  const progress = getCareerProgress();

  return (
    <div className="career-widget">
      <div 
        className="career-widget-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="widget-icon">💼</div>
        <div className="widget-info">
          <div className="widget-title">Career Progress</div>
          <div className="widget-score">{progress.careerScore}% Complete</div>
        </div>
        <div className="widget-toggle">
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>

      {isExpanded && (
        <div className="career-widget-content">
          {/* Progress Bar */}
          <div className="career-progress-bar">
            <div className="progress-track">
              <div 
                className="progress-fill"
                style={{ width: `${progress.careerScore}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {progress.completedMilestones}/{progress.milestones.length} Milestones
            </div>
          </div>

          {/* Next Milestone */}
          {progress.nextMilestone && (
            <div className="next-milestone">
              <div className="milestone-header">🎯 Next Goal</div>
              <div className="milestone-title">{progress.nextMilestone.title}</div>
              <div className="milestone-progress">
                {progress.nextMilestone.current}/{progress.nextMilestone.requirement}
              </div>
              <div className="milestone-reward">
                🎁 {progress.nextMilestone.reward}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="career-quick-actions">
            <button
              className={`quick-action ${progress.totalTasks >= 3 ? 'enabled' : 'disabled'}`}
              onClick={() => progress.totalTasks >= 3 && onToolOpen('profile')}
              disabled={progress.totalTasks < 3}
            >
              👤 Profile
            </button>
            <button
              className={`quick-action ${progress.totalTasks >= 3 ? 'enabled' : 'disabled'}`}
              onClick={() => progress.totalTasks >= 3 && onToolOpen('resume')}
              disabled={progress.totalTasks < 3}
            >
              📄 Resume
            </button>
            <button
              className={`quick-action ${userStats.trustScore >= 25 ? 'enabled' : 'disabled'}`}
              onClick={() => userStats.trustScore >= 25 && onToolOpen('jobs')}
              disabled={userStats.trustScore < 25}
            >
              🎯 Jobs
            </button>
          </div>

          {/* Milestones Toggle */}
          <button
            className="milestones-toggle"
            onClick={() => setShowMilestones(!showMilestones)}
          >
            {showMilestones ? '▲ Hide' : '▼ Show'} All Milestones
          </button>

          {/* All Milestones */}
          {showMilestones && (
            <div className="milestones-list">
              {progress.milestones.map((milestone) => (
                <div 
                  key={milestone.id}
                  className={`milestone-item ${milestone.completed ? 'completed' : 'pending'}`}
                >
                  <div className="milestone-status">
                    {milestone.completed ? '✅' : '⏳'}
                  </div>
                  <div className="milestone-details">
                    <div className="milestone-name">{milestone.title}</div>
                    <div className="milestone-desc">{milestone.description}</div>
                    <div className="milestone-progress-bar">
                      <div 
                        className="milestone-progress-fill"
                        style={{ 
                          width: `${Math.min(100, (milestone.current / milestone.requirement) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="milestone-numbers">
                      {milestone.current}/{milestone.requirement}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Career Hub Link */}
          <button
            className="full-hub-button"
            onClick={() => onToolOpen('hub')}
          >
            🚀 Open Full Career Hub
          </button>
        </div>
      )}
    </div>
  );
};

export default CareerWidget;