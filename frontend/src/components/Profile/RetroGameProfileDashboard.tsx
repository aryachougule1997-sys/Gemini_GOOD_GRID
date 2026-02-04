import React, { useState, useEffect } from 'react';
import './RetroGameProfileDashboard.css';

interface ProfileStats {
  level: number;
  xp: number;
  nextLevelXp: number;
  trustScore: number;
  rwisScore: number;
  totalTasks: number;
  badges: Badge[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
}

interface WorkHistoryItem {
  id: string;
  title: string;
  category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
  completedAt: string;
  xpGained: number;
  trustScoreGain: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

const RetroGameProfileDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'achievements'>('overview');
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading profile data
    setTimeout(() => {
      setProfileStats({
        level: 15,
        xp: 2450,
        nextLevelXp: 3000,
        trustScore: 87,
        rwisScore: 1250,
        totalTasks: 42,
        badges: [
          { id: '1', name: 'Code Warrior', description: 'Complete 10 coding tasks', icon: '⚔️', rarity: 'rare', category: 'FREELANCE' },
          { id: '2', name: 'Community Hero', description: 'Help 50 community members', icon: '🛡️', rarity: 'epic', category: 'COMMUNITY' },
          { id: '3', name: 'Corporate Champion', description: 'Excel in corporate projects', icon: '👑', rarity: 'legendary', category: 'CORPORATE' }
        ]
      });
      
      setWorkHistory([
        { id: '1', title: 'Website Development', category: 'FREELANCE', completedAt: '2024-01-15', xpGained: 150, trustScoreGain: 5, difficulty: 'intermediate' },
        { id: '2', title: 'Community Garden Project', category: 'COMMUNITY', completedAt: '2024-01-10', xpGained: 100, trustScoreGain: 8, difficulty: 'beginner' },
        { id: '3', title: 'Corporate Data Analysis', category: 'CORPORATE', completedAt: '2024-01-05', xpGained: 200, trustScoreGain: 10, difficulty: 'advanced' }
      ]);
      
      setIsLoading(false);
    }, 1000);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FREELANCE': return '#ff6b35';
      case 'COMMUNITY': return '#4ecdc4';
      case 'CORPORATE': return '#45b7d1';
      default: return '#666';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return '#888';
      case 'rare': return '#4a90e2';
      case 'epic': return '#9b59b6';
      case 'legendary': return '#f39c12';
      default: return '#888';
    }
  };

  if (isLoading) {
    return (
      <div className="retro-profile-dashboard loading">
        <div className="loading-screen">
          <div className="pixel-loader"></div>
          <div className="loading-text">Loading Character Data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="retro-profile-dashboard">
      {/* Animated Background */}
      <div className="game-background">
        <div className="stars-layer"></div>
        <div className="nebula-layer"></div>
        <div className="particles-layer"></div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Header with Character */}
        <div className="character-header">
          <div className="character-portrait">
            <div className="pixel-character">
              <div className="character-sprite"></div>
              <div className="level-badge">LV.{profileStats?.level}</div>
            </div>
          </div>
          
          <div className="character-info">
            <h1 className="character-name">Pixel Warrior</h1>
            <div className="character-title">Master of All Trades</div>
            
            {/* XP Bar */}
            <div className="xp-container">
              <div className="xp-label">Experience Points</div>
              <div className="xp-bar">
                <div 
                  className="xp-fill" 
                  style={{ width: `${(profileStats!.xp / profileStats!.nextLevelXp) * 100}%` }}
                ></div>
                <div className="xp-text">{profileStats?.xp} / {profileStats?.nextLevelXp} XP</div>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="stats-panel">
            <div className="stat-item trust-score">
              <div className="stat-icon">🛡️</div>
              <div className="stat-value">{profileStats?.trustScore}</div>
              <div className="stat-label">Trust Score</div>
            </div>
            <div className="stat-item rwis-score">
              <div className="stat-icon">🌟</div>
              <div className="stat-value">{profileStats?.rwisScore}</div>
              <div className="stat-label">RWIS</div>
            </div>
            <div className="stat-item total-tasks">
              <div className="stat-icon">⚔️</div>
              <div className="stat-value">{profileStats?.totalTasks}</div>
              <div className="stat-label">Quests</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="game-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="tab-icon">📊</span>
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="tab-icon">📜</span>
            Quest Log
          </button>
          <button 
            className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            <span className="tab-icon">🏆</span>
            Achievements
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-panel">
              <div className="guild-sections">
                <div className="guild-card freelance">
                  <div className="guild-header">
                    <h3>🏰 Freelance Tower</h3>
                    <div className="guild-level">Level 8</div>
                  </div>
                  <div className="guild-stats">
                    <div className="guild-stat">
                      <span>Projects:</span>
                      <span>15</span>
                    </div>
                    <div className="guild-stat">
                      <span>Rating:</span>
                      <span>4.8⭐</span>
                    </div>
                  </div>
                </div>

                <div className="guild-card community">
                  <div className="guild-header">
                    <h3>🌳 Community Garden</h3>
                    <div className="guild-level">Level 12</div>
                  </div>
                  <div className="guild-stats">
                    <div className="guild-stat">
                      <span>Contributions:</span>
                      <span>23</span>
                    </div>
                    <div className="guild-stat">
                      <span>Impact:</span>
                      <span>850 RWIS</span>
                    </div>
                  </div>
                </div>

                <div className="guild-card corporate">
                  <div className="guild-header">
                    <h3>🏢 Corporate Castle</h3>
                    <div className="guild-level">Level 6</div>
                  </div>
                  <div className="guild-stats">
                    <div className="guild-stat">
                      <span>Projects:</span>
                      <span>4</span>
                    </div>
                    <div className="guild-stat">
                      <span>Performance:</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-panel">
              <div className="quest-log">
                {workHistory.map((item) => (
                  <div key={item.id} className="quest-entry">
                    <div className="quest-icon" style={{ backgroundColor: getCategoryColor(item.category) }}>
                      {item.category === 'FREELANCE' && '💼'}
                      {item.category === 'COMMUNITY' && '🤝'}
                      {item.category === 'CORPORATE' && '🏢'}
                    </div>
                    <div className="quest-details">
                      <h4 className="quest-title">{item.title}</h4>
                      <div className="quest-meta">
                        <span className="quest-date">{new Date(item.completedAt).toLocaleDateString()}</span>
                        <span className={`difficulty-badge ${item.difficulty}`}>{item.difficulty}</span>
                      </div>
                    </div>
                    <div className="quest-rewards">
                      <div className="reward-item">
                        <span className="reward-icon">⚡</span>
                        <span>+{item.xpGained} XP</span>
                      </div>
                      <div className="reward-item">
                        <span className="reward-icon">🛡️</span>
                        <span>+{item.trustScoreGain}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="achievements-panel">
              <div className="badges-grid">
                {profileStats?.badges.map((badge) => (
                  <div 
                    key={badge.id} 
                    className={`badge-card ${badge.rarity}`}
                    style={{ boxShadow: `0 0 20px ${getRarityGlow(badge.rarity)}` }}
                  >
                    <div className="badge-icon">{badge.icon}</div>
                    <div className="badge-name">{badge.name}</div>
                    <div className="badge-description">{badge.description}</div>
                    <div className="badge-category" style={{ color: getCategoryColor(badge.category) }}>
                      {badge.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Elements */}
      <div className="floating-coins">
        <div className="coin coin-1">💰</div>
        <div className="coin coin-2">💎</div>
        <div className="coin coin-3">⭐</div>
      </div>
    </div>
  );
};

export default RetroGameProfileDashboard;