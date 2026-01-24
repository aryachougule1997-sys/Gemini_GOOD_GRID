import React, { useState, useEffect } from 'react';
import { GamificationService, UserProgressionStatus, LeaderboardEntry, Badge } from '../../services/gamificationService';
import './GameifiedDashboard.css';

interface GameifiedDashboardProps {
  userId: string;
}

const GameifiedDashboard: React.FC<GameifiedDashboardProps> = ({ userId }) => {
  const [progression, setProgression] = useState<UserProgressionStatus | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'leaderboard' | 'calculator'>('stats');
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [showXPGain, setShowXPGain] = useState(false);
  const [xpGainAmount, setXPGainAmount] = useState(0);

  // Mock data for demonstration
  const mockProgression: UserProgressionStatus = {
    stats: {
      userId: 'demo-user',
      trustScore: 87,
      rwisScore: 145,
      xpPoints: 2850,
      currentLevel: 12,
      unlockedZones: ['starter-town', 'tech-district', 'community-hub'],
      categoryStats: {
        freelance: {
          tasksCompleted: 15,
          totalXP: 800,
          averageRating: 4.8,
          specializations: ['web-development', 'ui-design', 'react']
        },
        community: {
          tasksCompleted: 23,
          totalXP: 1200,
          averageRating: 4.9,
          specializations: ['environmental', 'education', 'mentoring']
        },
        corporate: {
          tasksCompleted: 8,
          totalXP: 850,
          averageRating: 4.5,
          specializations: ['project-management', 'consulting', 'strategy']
        }
      }
    },
    levelProgress: {
      currentLevel: 12,
      xpInCurrentLevel: 350,
      xpRequiredForNextLevel: 500,
      progressPercentage: 70
    },
    badges: [],
    recentAchievements: []
  };

  const mockBadges: Badge[] = [
    {
      id: '1',
      name: 'First Steps',
      description: 'Complete your first task',
      category: 'ACHIEVEMENT',
      rarity: 'COMMON',
      iconUrl: '🏅',
      unlockCriteria: { tasksCompleted: 1 },
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'Community Champion',
      description: 'Complete 10 community tasks',
      category: 'CATEGORY',
      rarity: 'RARE',
      iconUrl: '🌟',
      unlockCriteria: { categoryTasks: { community: 10 } },
      createdAt: new Date()
    },
    {
      id: '3',
      name: 'Trust Builder',
      description: 'Reach 50 Trust Score',
      category: 'ACHIEVEMENT',
      rarity: 'UNCOMMON',
      iconUrl: '🤝',
      unlockCriteria: { trustScore: 50 },
      createdAt: new Date()
    }
  ];

  const mockLeaderboard: LeaderboardEntry[] = [
    { userId: '1', username: 'GridMaster', value: 156, rank: 1 },
    { userId: '2', username: 'CommunityHero', value: 134, rank: 2 },
    { userId: '3', username: 'TaskWarrior', value: 98, rank: 3 },
    { userId: userId, username: 'You', value: 87, rank: 4 },
    { userId: '4', username: 'SkillBuilder', value: 76, rank: 5 }
  ];

  useEffect(() => {
    // Use mock data for demonstration
    setProgression(mockProgression);
    setBadges(mockBadges);
    setUserBadges([mockBadges[0], mockBadges[2]]); // User has earned 2 badges
    setLeaderboard(mockLeaderboard);
    setLoading(false);
  }, [userId]);

  const simulateXPGain = (amount: number) => {
    setXPGainAmount(amount);
    setShowXPGain(true);
    setTimeout(() => setShowXPGain(false), 2000);
  };

  const simulateLevelUp = () => {
    setShowLevelUpAnimation(true);
    setTimeout(() => setShowLevelUpAnimation(false), 3000);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return '#9CA3AF';
      case 'UNCOMMON': return '#10B981';
      case 'RARE': return '#3B82F6';
      case 'EPIC': return '#8B5CF6';
      case 'LEGENDARY': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return '0 0 10px rgba(156, 163, 175, 0.5)';
      case 'UNCOMMON': return '0 0 15px rgba(16, 185, 129, 0.6)';
      case 'RARE': return '0 0 20px rgba(59, 130, 246, 0.7)';
      case 'EPIC': return '0 0 25px rgba(139, 92, 246, 0.8)';
      case 'LEGENDARY': return '0 0 30px rgba(245, 158, 11, 0.9)';
      default: return 'none';
    }
  };

  if (loading) {
    return (
      <div className="gamified-dashboard loading">
        <div className="loading-screen">
          <div className="loading-spinner-game"></div>
          <div className="loading-text">
            <span>Loading your adventure...</span>
            <div className="loading-dots">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!progression) {
    return (
      <div className="gamified-dashboard error">
        <div className="error-screen">
          <div className="error-icon">⚠️</div>
          <h3>Adventure Unavailable</h3>
          <p>Unable to load your progress data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gamified-dashboard">
      {/* Animated Background */}
      <div className="game-background">
        <div className="floating-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className={`particle particle-${i % 4}`}></div>
          ))}
        </div>
      </div>

      {/* Level Up Animation */}
      {showLevelUpAnimation && (
        <div className="level-up-overlay">
          <div className="level-up-animation">
            <div className="level-up-burst"></div>
            <div className="level-up-text">
              <h1>LEVEL UP!</h1>
              <p>You reached Level {progression.stats.currentLevel + 1}!</p>
              <div className="level-up-rewards">
                <span>🎉 New features unlocked!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* XP Gain Animation */}
      {showXPGain && (
        <div className="xp-gain-animation">
          <span>+{xpGainAmount} XP</span>
        </div>
      )}

      {/* Header with Player Stats */}
      <div className="game-header">
        <div className="player-info">
          <div className="avatar-container">
            <div className="avatar">
              <span className="avatar-emoji">🦸</span>
              <div className="level-badge">{progression.stats.currentLevel}</div>
            </div>
          </div>
          
          <div className="player-stats">
            <div className="player-name">GridHero</div>
            <div className="xp-bar-container">
              <div className="xp-bar">
                <div 
                  className="xp-fill" 
                  style={{ width: `${progression.levelProgress.progressPercentage}%` }}
                ></div>
                <div className="xp-text">
                  {progression.levelProgress.xpInCurrentLevel} / {progression.levelProgress.xpRequiredForNextLevel} XP
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="currency-display">
          <div className="currency-item trust">
            <span className="currency-icon">🤝</span>
            <span className="currency-value">{progression.stats.trustScore}</span>
            <span className="currency-label">Trust</span>
          </div>
          <div className="currency-item rwis">
            <span className="currency-icon">🌍</span>
            <span className="currency-value">{progression.stats.rwisScore}</span>
            <span className="currency-label">Impact</span>
          </div>
          <div className="currency-item xp">
            <span className="currency-icon">⭐</span>
            <span className="currency-value">{progression.stats.xpPoints.toLocaleString()}</span>
            <span className="currency-label">Total XP</span>
          </div>
        </div>
      </div>

      {/* Game Navigation */}
      <div className="game-navigation">
        <button 
          className={`nav-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-label">Stats</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'badges' ? 'active' : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          <span className="tab-icon">🏅</span>
          <span className="tab-label">Badges</span>
          <span className="badge-count">{userBadges.length}</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <span className="tab-icon">🏆</span>
          <span className="tab-label">Rankings</span>
        </button>
        <button 
          className={`nav-tab ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          <span className="tab-icon">🧮</span>
          <span className="tab-label">Calculator</span>
        </button>
      </div>

      {/* Game Content */}
      <div className="game-content">
        {activeTab === 'stats' && (
          <div className="stats-panel">
            <div className="stats-grid">
              {/* Category Progress Cards */}
              {Object.entries(progression.stats.categoryStats).map(([category, stats]) => (
                <div key={category} className="category-card">
                  <div className="card-header">
                    <div className="category-icon">
                      {category === 'freelance' ? '💼' : category === 'community' ? '🌟' : '🏢'}
                    </div>
                    <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                  </div>
                  <div className="card-stats">
                    <div className="stat-item">
                      <span className="stat-value">{stats.tasksCompleted}</span>
                      <span className="stat-label">Tasks</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{stats.totalXP}</span>
                      <span className="stat-label">XP</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{stats.averageRating.toFixed(1)}⭐</span>
                      <span className="stat-label">Rating</span>
                    </div>
                  </div>
                  <div className="progress-ring">
                    <svg className="progress-ring-svg" width="60" height="60">
                      <circle
                        className="progress-ring-circle-bg"
                        stroke="#374151"
                        strokeWidth="4"
                        fill="transparent"
                        r="26"
                        cx="30"
                        cy="30"
                      />
                      <circle
                        className="progress-ring-circle"
                        stroke={category === 'freelance' ? '#EF4444' : category === 'community' ? '#10B981' : '#3B82F6'}
                        strokeWidth="4"
                        fill="transparent"
                        r="26"
                        cx="30"
                        cy="30"
                        strokeDasharray={`${(stats.tasksCompleted / 30) * 163.36} 163.36`}
                      />
                    </svg>
                    <div className="progress-text">{Math.min(100, Math.round((stats.tasksCompleted / 30) * 100))}%</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons for Demo */}
            <div className="demo-actions">
              <button 
                className="demo-button xp-button"
                onClick={() => simulateXPGain(150)}
              >
                🎯 Simulate XP Gain (+150)
              </button>
              <button 
                className="demo-button level-button"
                onClick={simulateLevelUp}
              >
                🚀 Simulate Level Up
              </button>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="badges-panel">
            <div className="badges-header">
              <h2>🏅 Badge Collection</h2>
              <div className="collection-stats">
                <span>{userBadges.length} / {badges.length} Collected</span>
                <div className="collection-progress">
                  <div 
                    className="collection-fill" 
                    style={{ width: `${(userBadges.length / badges.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="badges-showcase">
              {badges.map((badge) => {
                const isEarned = userBadges.some(ub => ub.id === badge.id);
                return (
                  <div 
                    key={badge.id} 
                    className={`badge-showcase-item ${isEarned ? 'earned' : 'locked'}`}
                    style={{ 
                      boxShadow: isEarned ? getRarityGlow(badge.rarity) : 'none',
                      borderColor: getRarityColor(badge.rarity)
                    }}
                  >
                    <div className="badge-icon-large">
                      {isEarned ? badge.iconUrl : '🔒'}
                    </div>
                    <div className="badge-info">
                      <h4 style={{ color: getRarityColor(badge.rarity) }}>
                        {badge.name}
                      </h4>
                      <p>{badge.description}</p>
                      <div className="badge-rarity">
                        <span 
                          className="rarity-gem"
                          style={{ backgroundColor: getRarityColor(badge.rarity) }}
                        ></span>
                        {badge.rarity}
                      </div>
                    </div>
                    {isEarned && <div className="earned-checkmark">✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="leaderboard-panel">
            <div className="leaderboard-header">
              <h2>🏆 Trust Score Rankings</h2>
              <div className="season-info">Season 1 • 7 days left</div>
            </div>
            
            <div className="leaderboard-list">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.userId} 
                  className={`leaderboard-entry ${entry.userId === userId ? 'current-player' : ''} ${index < 3 ? 'top-three' : ''}`}
                >
                  <div className="rank-display">
                    {index === 0 && <span className="crown">👑</span>}
                    {index < 3 ? (
                      <div className={`medal medal-${index + 1}`}>
                        {['🥇', '🥈', '🥉'][index]}
                      </div>
                    ) : (
                      <span className="rank-number">#{entry.rank}</span>
                    )}
                  </div>
                  
                  <div className="player-avatar">
                    <span>{entry.userId === userId ? '🦸' : '👤'}</span>
                  </div>
                  
                  <div className="player-details">
                    <span className="player-name">{entry.username}</span>
                    {entry.userId === userId && <span className="you-indicator">YOU</span>}
                  </div>
                  
                  <div className="score-display">
                    <span className="score-value">{entry.value}</span>
                    <span className="score-label">Trust</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calculator' && (
          <div className="calculator-panel">
            <GameCalculator />
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Calculator Component
const GameCalculator: React.FC = () => {
  const [taskRewards, setTaskRewards] = useState({ xp: 100, trustScoreBonus: 5, rwisPoints: 50 });
  const [category, setCategory] = useState('FREELANCE');
  const [qualityScore, setQualityScore] = useState(3);
  const [completionTime, setCompletionTime] = useState(1);
  const [userLevel, setUserLevel] = useState(1);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculateAll = async () => {
    try {
      setLoading(true);
      const [xpResult, trustResult, rwisResult] = await Promise.all([
        GamificationService.calculateXP({
          taskRewards,
          category,
          qualityScore,
          completionTime,
          userLevel
        }),
        GamificationService.calculateTrustScore({
          taskRewards,
          category,
          qualityScore,
          onTime: completionTime <= 1
        }),
        GamificationService.calculateRWIS({
          taskRewards,
          category,
          qualityScore,
          taskComplexity: 'MEDIUM'
        })
      ]);

      setResults({ xpResult, trustResult, rwisResult });
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-calculator">
      <div className="calculator-header">
        <h2>🧮 Reward Calculator</h2>
        <p>Test different scenarios to see how rewards are calculated</p>
      </div>
      
      <div className="calculator-form">
        <div className="form-section">
          <h3>Task Settings</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Base XP Reward</label>
              <input 
                type="number" 
                value={taskRewards.xp} 
                onChange={(e) => setTaskRewards({...taskRewards, xp: parseInt(e.target.value)})}
                className="game-input"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="game-select"
              >
                <option value="FREELANCE">💼 Freelance</option>
                <option value="COMMUNITY">🌟 Community</option>
                <option value="CORPORATE">🏢 Corporate</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Performance Metrics</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Quality Score</label>
              <div className="quality-selector">
                {[1, 2, 3, 4, 5].map(score => (
                  <button
                    key={score}
                    className={`quality-star ${score <= qualityScore ? 'active' : ''}`}
                    onClick={() => setQualityScore(score)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Completion Time</label>
              <div className="time-selector">
                <button 
                  className={`time-option ${completionTime === 0.8 ? 'active' : ''}`}
                  onClick={() => setCompletionTime(0.8)}
                >
                  🚀 Early
                </button>
                <button 
                  className={`time-option ${completionTime === 1 ? 'active' : ''}`}
                  onClick={() => setCompletionTime(1)}
                >
                  ⏰ On Time
                </button>
                <button 
                  className={`time-option ${completionTime === 1.2 ? 'active' : ''}`}
                  onClick={() => setCompletionTime(1.2)}
                >
                  🐌 Late
                </button>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={calculateAll} 
          disabled={loading} 
          className="calculate-button-game"
        >
          {loading ? '🔄 Calculating...' : '🎯 Calculate Rewards'}
        </button>
      </div>

      {results && (
        <div className="calculation-results-game">
          <div className="result-card xp-result">
            <div className="result-header">
              <span className="result-icon">⭐</span>
              <h3>XP Calculation</h3>
            </div>
            <div className="result-value">+{results.xpResult.totalXP} XP</div>
            <div className="result-breakdown">
              <div className="breakdown-item">
                <span>Base XP:</span>
                <span>{results.xpResult.baseXP}</span>
              </div>
              <div className="breakdown-item">
                <span>Bonus XP:</span>
                <span>+{results.xpResult.bonusXP}</span>
              </div>
            </div>
          </div>

          <div className="result-card trust-result">
            <div className="result-header">
              <span className="result-icon">🤝</span>
              <h3>Trust Score</h3>
            </div>
            <div className="result-value">+{results.trustResult.totalTrustScore}</div>
            <div className="result-breakdown">
              <div className="breakdown-item">
                <span>Base Trust:</span>
                <span>{results.trustResult.baseTrustScore}</span>
              </div>
              <div className="breakdown-item">
                <span>Bonus Trust:</span>
                <span>+{results.trustResult.bonusTrustScore}</span>
              </div>
            </div>
          </div>

          <div className="result-card rwis-result">
            <div className="result-header">
              <span className="result-icon">🌍</span>
              <h3>Impact Score</h3>
            </div>
            <div className="result-value">+{results.rwisResult.totalRWIS}</div>
            <div className="result-breakdown">
              <div className="breakdown-item">
                <span>Base RWIS:</span>
                <span>{results.rwisResult.baseRWIS}</span>
              </div>
              <div className="breakdown-item">
                <span>Bonus RWIS:</span>
                <span>+{results.rwisResult.bonusRWIS}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameifiedDashboard;