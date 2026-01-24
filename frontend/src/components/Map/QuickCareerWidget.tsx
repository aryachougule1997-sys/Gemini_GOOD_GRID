import React, { useState } from 'react';
import { UserStats } from '../../../../shared/types';

interface QuickCareerWidgetProps {
  userStats: UserStats;
  onOpenCareerTools: () => void;
  onOpenFullHub: () => void;
}

const QuickCareerWidget: React.FC<QuickCareerWidgetProps> = ({
  userStats,
  onOpenCareerTools,
  onOpenFullHub
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCareerInsights = () => {
    const totalTasks = Object.values(userStats.categoryStats).reduce(
      (total, category) => total + category.tasksCompleted, 0
    );
    
    const strongestCategory = Object.entries(userStats.categoryStats)
      .sort(([,a], [,b]) => b.tasksCompleted - a.tasksCompleted)[0];
    
    const readinessScore = Math.min(
      userStats.trustScore + 
      (userStats.currentLevel * 5) + 
      (totalTasks * 2), 
      100
    );
    
    let readinessLevel = 'Getting Started';
    let readinessColor = '#ff4757';
    let nextStep = 'Complete more tasks to build your portfolio';
    
    if (readinessScore >= 80) {
      readinessLevel = 'Career Ready';
      readinessColor = '#43e97b';
      nextStep = 'Start applying for opportunities!';
    } else if (readinessScore >= 60) {
      readinessLevel = 'Almost Ready';
      readinessColor = '#feca57';
      nextStep = 'Build more trust score and complete specialized tasks';
    } else if (readinessScore >= 40) {
      readinessLevel = 'Building Skills';
      readinessColor = '#ff9ff3';
      nextStep = 'Focus on consistent quality work';
    }
    
    return {
      totalTasks,
      strongestCategory: strongestCategory ? strongestCategory[0] : 'none',
      readinessScore,
      readinessLevel,
      readinessColor,
      nextStep
    };
  };

  const insights = getCareerInsights();

  return (
    <div className="quick-career-widget">
      <div 
        className="widget-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="widget-title">
          <span className="widget-icon">💼</span>
          <span className="widget-text">Career Progress</span>
        </div>
        <div className="readiness-indicator">
          <div 
            className="readiness-dot"
            style={{ backgroundColor: insights.readinessColor }}
          ></div>
          <span className="readiness-percentage">{insights.readinessScore}%</span>
        </div>
        <button className="expand-button">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="widget-content">
          <div className="career-summary">
            <div className="summary-item">
              <span className="summary-label">Readiness:</span>
              <span 
                className="summary-value"
                style={{ color: insights.readinessColor }}
              >
                {insights.readinessLevel}
              </span>
            </div>
            
            <div className="summary-item">
              <span className="summary-label">Portfolio:</span>
              <span className="summary-value">{insights.totalTasks} projects</span>
            </div>
            
            <div className="summary-item">
              <span className="summary-label">Specialty:</span>
              <span className="summary-value">{insights.strongestCategory}</span>
            </div>
            
            <div className="summary-item">
              <span className="summary-label">Trust:</span>
              <span className="summary-value">{userStats.trustScore}/100</span>
            </div>
          </div>
          
          <div className="next-step">
            <h5>💡 Next Step:</h5>
            <p>{insights.nextStep}</p>
          </div>
          
          <div className="quick-actions">
            <button 
              className="quick-action-btn primary"
              onClick={onOpenCareerTools}
            >
              🎯 Career Tools
            </button>
            <button 
              className="quick-action-btn secondary"
              onClick={onOpenFullHub}
            >
              🚀 Full Hub
            </button>
          </div>
          
          {insights.readinessScore >= 70 && (
            <div className="career-opportunity">
              <div className="opportunity-icon">🌟</div>
              <div className="opportunity-text">
                <strong>You're ready for opportunities!</strong>
                <br />
                <small>Check the job matcher for personalized recommendations</small>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickCareerWidget;