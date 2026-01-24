import React, { useState } from 'react';
import { User, CharacterData as GameCharacterData, UserStats } from '../../../../shared/types';
import MapContainer from '../Map/MapContainer';
import CareerHub from '../Career/CareerHub';
import CharacterCreationForm from '../CharacterCreation/CharacterCreationForm';
import './Navigation.css';

interface MainNavigationProps {
  user: User;
  characterData: GameCharacterData;
  userStats: UserStats;
  authToken?: string;
  onCharacterUpdate?: (characterData: GameCharacterData) => void;
}

type ViewType = 'map' | 'career' | 'character';

const MainNavigation: React.FC<MainNavigationProps> = ({
  user,
  characterData,
  userStats,
  authToken,
  onCharacterUpdate
}) => {
  const [currentView, setCurrentView] = useState<ViewType>('map');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [currentCharacterData, setCurrentCharacterData] = useState<GameCharacterData>(characterData);

  const getCareerProgressSummary = () => {
    const totalTasks = Object.values(userStats.categoryStats).reduce(
      (total, category) => total + category.tasksCompleted, 0
    );
    
    return {
      totalTasks,
      level: userStats.currentLevel,
      trustScore: userStats.trustScore,
      hasNewOpportunities: totalTasks > 0 && userStats.trustScore >= 25
    };
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    
    // Add transition notification
    if (view === 'career') {
      setNotifications(['🚀 Welcome to your Career Hub! Your Good Grid achievements are powering real opportunities.']);
      setTimeout(() => setNotifications([]), 5000);
    } else if (view === 'map') {
      setNotifications(['🗺️ Back to the adventure! Complete more tasks to unlock career opportunities.']);
      setTimeout(() => setNotifications([]), 5000);
    } else if (view === 'character') {
      setNotifications(['👤 Time to customize your hero! Create the perfect avatar for your journey.']);
      setTimeout(() => setNotifications([]), 5000);
    }
  };

  const handleCharacterSave = (newCharacterData: GameCharacterData) => {
    setCurrentCharacterData(newCharacterData);
    if (onCharacterUpdate) {
      onCharacterUpdate(newCharacterData);
    }
    setCurrentView('map');
    setNotifications(['✨ Your character has been updated! Looking great, hero!']);
    setTimeout(() => setNotifications([]), 5000);
  };

  const careerProgress = getCareerProgressSummary();

  return (
    <div className="main-navigation-container">
      {/* Navigation Header */}
      <div className="navigation-header">
        <div className="nav-brand">
          <div className="brand-icon">🌟</div>
          <div className="brand-text">
            <h1>Good Grid</h1>
            <p>Level {userStats.currentLevel} • {careerProgress.totalTasks} Tasks</p>
          </div>
        </div>
        
        <div className="nav-controls">
          <button
            className={`nav-button ${currentView === 'map' ? 'active' : ''}`}
            onClick={() => handleViewChange('map')}
          >
            <span className="nav-icon">🗺️</span>
            <span className="nav-label">Adventure Map</span>
            <div className="nav-description">Explore dungeons & complete tasks</div>
          </button>
          
          <button
            className={`nav-button ${currentView === 'character' ? 'active' : ''}`}
            onClick={() => handleViewChange('character')}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-label">Character Builder</span>
            <div className="nav-description">Customize your hero's appearance</div>
          </button>
          
          <button
            className={`nav-button ${currentView === 'career' ? 'active' : ''}`}
            onClick={() => handleViewChange('career')}
          >
            <span className="nav-icon">🚀</span>
            <span className="nav-label">Career Hub</span>
            <div className="nav-description">Real jobs, AI resumes & career growth</div>
            {careerProgress.hasNewOpportunities && (
              <div className="nav-notification">
                <span className="notification-dot"></span>
                <span className="notification-text">New opportunities!</span>
              </div>
            )}
          </button>
        </div>
        
        <div className="user-info">
          <div className="user-avatar">
            <div className="avatar-icon">👑</div>
            <div className="level-badge">{userStats.currentLevel}</div>
          </div>
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-icon">🛡️</span>
              <span className="stat-value">{userStats.trustScore}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⭐</span>
              <span className="stat-value">{userStats.xpPoints}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="navigation-notifications">
          {notifications.map((notification, index) => (
            <div key={index} className="nav-notification-banner">
              <span>{notification}</span>
              <button onClick={() => setNotifications(prev => prev.filter((_, i) => i !== index))}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* View Content */}
      <div className="navigation-content">
        {currentView === 'map' ? (
          <MapContainer
            user={user}
            characterData={currentCharacterData}
            userStats={userStats}
            authToken={authToken}
            onDungeonEnter={(dungeon) => {
              console.log('Entered dungeon:', dungeon.name);
            }}
            onZoneUnlock={(zone) => {
              setNotifications([`🎉 New zone unlocked: ${zone.name}! Your career opportunities are expanding!`]);
              setTimeout(() => setNotifications([]), 5000);
            }}
            onTaskSelect={(task) => {
              console.log('Selected task:', task.title);
            }}
          />
        ) : currentView === 'character' ? (
          <div className="character-creation-wrapper">
            <CharacterCreationForm
              initialCharacterData={currentCharacterData}
              availableAccessories={[
                {
                  id: 'crown-1',
                  name: 'Achievement Crown',
                  type: 'HAT',
                  unlockCondition: 'Complete 10 tasks'
                },
                {
                  id: 'glasses-1',
                  name: 'Smart Glasses',
                  type: 'GLASSES',
                  unlockCondition: 'Complete 5 tech tasks'
                },
                {
                  id: 'cape-1',
                  name: 'Hero Cape',
                  type: 'CLOTHING',
                  unlockCondition: 'Reach level 10'
                },
                {
                  id: 'sword-1',
                  name: 'Code Sword',
                  type: 'TOOL',
                  unlockCondition: 'Complete 15 freelance tasks'
                },
                {
                  id: 'badge-1',
                  name: 'Community Champion',
                  type: 'BADGE_DISPLAY',
                  unlockCondition: 'Complete 20 community tasks'
                }
              ]}
              onSave={handleCharacterSave}
              onCancel={() => setCurrentView('map')}
              isLoading={false}
            />
          </div>
        ) : (
          <CareerHub userId={user.id} />
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="navigation-footer">
        <div className="quick-stats">
          <div className="quick-stat">
            <span className="quick-stat-label">Adventure Progress:</span>
            <span className="quick-stat-value">
              {careerProgress.totalTasks} tasks • Level {careerProgress.level}
            </span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-label">Career Readiness:</span>
            <span className="quick-stat-value">
              {careerProgress.trustScore >= 50 ? 'Ready for opportunities!' : 'Building reputation...'}
            </span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-label">Current Focus:</span>
            <span className="quick-stat-value">
              {currentView === 'map' ? 'Exploring & Task Completion' : 
               currentView === 'character' ? 'Character Customization' : 
               'Career Development'}
            </span>
          </div>
        </div>
        
        <div className="integration-indicator">
          <div className="indicator-dot active"></div>
          <span>Map ↔ Career Integration Active</span>
        </div>
      </div>
    </div>
  );
};

export default MainNavigation;