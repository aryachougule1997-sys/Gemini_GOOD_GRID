import React, { useState, useEffect } from 'react';
import { UserStats, User } from '../../../../shared/types';
import AIResumeBuilder from '../Career/AIResumeBuilder';
import AIJobMatcher from '../Career/AIJobMatcher';
import CareerDashboard from '../Career/CareerDashboard';
import './Map.css';

interface IntegratedCareerPanelProps {
  user: User;
  userStats: UserStats;
  isOpen: boolean;
  onClose: () => void;
}

type CareerView = 'dashboard' | 'profile' | 'resume' | 'jobs' | 'achievements';

const IntegratedCareerPanel: React.FC<IntegratedCareerPanelProps> = ({
  user,
  userStats,
  isOpen,
  onClose
}) => {
  const [currentView, setCurrentView] = useState<CareerView>('dashboard');
  const [profileData, setProfileData] = useState({
    name: user.username,
    email: user.email,
    phone: '',
    location: '',
    summary: '',
    skills: [] as string[],
    experience: [] as any[],
    education: [] as any[],
    certifications: [] as any[]
  });

  useEffect(() => {
    // Auto-populate profile data from game achievements
    if (userStats) {
      const gameSkills: string[] = [];
      
      // Extract skills from specializations
      Object.values(userStats.categoryStats).forEach(category => {
        gameSkills.push(...category.specializations);
      });
      
      // Generate summary based on achievements
      const totalTasks = Object.values(userStats.categoryStats).reduce(
        (total, category) => total + category.tasksCompleted, 0
      );
      
      const strongestCategory = Object.entries(userStats.categoryStats)
        .sort(([,a], [,b]) => b.tasksCompleted - a.tasksCompleted)[0];
      
      const autoSummary = `Experienced professional with ${totalTasks} completed projects and a trust score of ${userStats.trustScore}. Specialized in ${strongestCategory?.[0] || 'various areas'} with proven track record in community contribution and collaborative work. Level ${userStats.currentLevel} contributor with expertise across multiple domains.`;
      
      setProfileData(prev => ({
        ...prev,
        skills: Array.from(new Set([...prev.skills, ...gameSkills])),
        summary: prev.summary || autoSummary
      }));
    }
  }, [userStats, user]);

  const getCareerReadinessScore = () => {
    let score = 0;
    
    // Base score from game stats
    score += Math.min(userStats.trustScore, 50); // Max 50 points
    score += Math.min(userStats.currentLevel * 5, 25); // Max 25 points
    
    const totalTasks = Object.values(userStats.categoryStats).reduce(
      (total, category) => total + category.tasksCompleted, 0
    );
    score += Math.min(totalTasks * 2, 20); // Max 20 points
    
    // Profile completeness
    if (profileData.summary) score += 5;
    if (profileData.phone) score += 2;
    if (profileData.location) score += 2;
    if (profileData.skills.length > 0) score += 3;
    
    return Math.min(score, 100);
  };

  const renderProfileEditor = () => (
    <div className="career-profile-editor">
      <h3>🎯 Professional Profile</h3>
      <p className="profile-subtitle">Your Good Grid achievements are automatically included!</p>
      
      <div className="profile-form">
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your professional name"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="professional@email.com"
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, State or Remote"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Professional Summary</label>
          <textarea
            value={profileData.summary}
            onChange={(e) => setProfileData(prev => ({ ...prev, summary: e.target.value }))}
            placeholder="Brief description of your professional background and goals..."
            rows={4}
          />
          <small>💡 Tip: Your Good Grid achievements are automatically highlighted in resumes!</small>
        </div>
        
        <div className="game-achievements-preview">
          <h4>🎮 Your Good Grid Achievements</h4>
          <div className="achievement-stats">
            <div className="stat-card">
              <span className="stat-number">{Object.values(userStats.categoryStats).reduce((total, category) => total + category.tasksCompleted, 0)}</span>
              <span className="stat-label">Projects Completed</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{userStats.trustScore}</span>
              <span className="stat-label">Trust Score</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{userStats.currentLevel}</span>
              <span className="stat-label">Experience Level</span>
            </div>
          </div>
          
          <div className="specializations">
            <h5>Proven Specializations:</h5>
            <div className="skill-tags">
              {Object.values(userStats.categoryStats).flatMap(category => 
                category.specializations.map((spec: string, index: number) => (
                  <span key={index} className="skill-tag game-skill">{spec}</span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="career-achievements">
      <h3>🏆 Career-Ready Achievements</h3>
      
      <div className="achievement-categories">
        {Object.entries(userStats.categoryStats).map(([category, stats]) => (
          <div key={category} className="achievement-category">
            <h4>{category.charAt(0).toUpperCase() + category.slice(1)} Experience</h4>
            <div className="category-stats">
              <div className="stat-item">
                <span className="stat-icon">📋</span>
                <span className="stat-text">{stats.tasksCompleted} Projects Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⭐</span>
                <span className="stat-text">{stats.totalXP} XP Earned</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📊</span>
                <span className="stat-text">{stats.averageRating.toFixed(1)} Average Rating</span>
              </div>
            </div>
            
            <div className="specializations">
              <h5>Specializations:</h5>
              <div className="spec-list">
                {stats.specializations.map((spec: string, index: number) => (
                  <span key={index} className="spec-badge">{spec}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="career-readiness">
        <h4>📈 Career Readiness Score</h4>
        <div className="readiness-meter">
          <div className="meter-bar">
            <div 
              className="meter-fill" 
              style={{ width: `${getCareerReadinessScore()}%` }}
            ></div>
          </div>
          <span className="readiness-score">{getCareerReadinessScore()}/100</span>
        </div>
        
        <div className="readiness-tips">
          <h5>💡 Improve Your Score:</h5>
          <ul>
            {getCareerReadinessScore() < 70 && <li>Complete more tasks to build your portfolio</li>}
            {!profileData.phone && <li>Add your phone number to your profile</li>}
            {!profileData.location && <li>Specify your location or remote preference</li>}
            {profileData.skills.length < 5 && <li>Develop more specialized skills through tasks</li>}
            {userStats.trustScore < 50 && <li>Build trust score through consistent quality work</li>}
          </ul>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="integrated-career-panel-overlay">
      <div className="integrated-career-panel">
        {/* Header */}
        <div className="career-panel-header">
          <div className="header-title">
            <h2>🚀 Career Development Hub</h2>
            <p>Transform your Good Grid achievements into career opportunities</p>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {/* Navigation */}
        <div className="career-nav">
          <button 
            className={`nav-tab ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-tab ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentView('profile')}
          >
            👤 Profile
          </button>
          <button 
            className={`nav-tab ${currentView === 'resume' ? 'active' : ''}`}
            onClick={() => setCurrentView('resume')}
          >
            📄 Resume Builder
          </button>
          <button 
            className={`nav-tab ${currentView === 'jobs' ? 'active' : ''}`}
            onClick={() => setCurrentView('jobs')}
          >
            💼 Job Matching
          </button>
          <button 
            className={`nav-tab ${currentView === 'achievements' ? 'active' : ''}`}
            onClick={() => setCurrentView('achievements')}
          >
            🏆 Achievements
          </button>
        </div>
        
        {/* Content */}
        <div className="career-panel-content">
          {currentView === 'dashboard' && (
            <CareerDashboard userId={user.id} />
          )}
          
          {currentView === 'profile' && renderProfileEditor()}
          
          {currentView === 'resume' && (
            <div className="resume-builder-container">
              <div className="resume-intro">
                <h3>📄 AI-Powered Resume Builder</h3>
                <p>Your Good Grid achievements are automatically included and professionally formatted!</p>
              </div>
              <AIResumeBuilder userId={user.id} />
            </div>
          )}
          
          {currentView === 'jobs' && (
            <div className="job-matcher-container">
              <div className="job-intro">
                <h3>💼 Smart Job Matching</h3>
                <p>Find opportunities that match your Good Grid skills and experience level!</p>
              </div>
              <AIJobMatcher userId={user.id} />
            </div>
          )}
          
          {currentView === 'achievements' && renderAchievements()}
        </div>
        
        {/* Footer */}
        <div className="career-panel-footer">
          <div className="footer-stats">
            <span>Career Readiness: {getCareerReadinessScore()}%</span>
            <span>•</span>
            <span>Trust Score: {userStats.trustScore}</span>
            <span>•</span>
            <span>Level: {userStats.currentLevel}</span>
          </div>
          <button 
            className="back-to-map-btn"
            onClick={onClose}
          >
            🗺️ Back to Adventure
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntegratedCareerPanel;