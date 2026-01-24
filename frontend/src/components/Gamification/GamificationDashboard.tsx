import React, { useState, useEffect } from 'react';
import { GamificationService, UserProgressionStatus, LeaderboardEntry, Badge } from '../../services/gamificationService';
import './GamificationDashboard.css';

interface GamificationDashboardProps {
  userId: string;
}

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ userId }) => {
  const [progression, setProgression] = useState<UserProgressionStatus | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'leaderboard' | 'calculator'>('overview');

  useEffect(() => {
    loadGamificationData();
  }, [userId]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [progressionData, leaderboardData, badgesData, userBadgesData] = await Promise.all([
        GamificationService.getUserProgression(userId),
        GamificationService.getLeaderboard('trustScore', 10),
        GamificationService.getBadges(),
        GamificationService.getUserBadges(userId)
      ]);

      setProgression(progressionData);
      setLeaderboard(leaderboardData);
      setBadges(badgesData);
      setUserBadges(userBadgesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gamification data');
      console.error('Error loading gamification data:', err);
    } finally {
      setLoading(false);
    }
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

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'freelance': return '#EF4444';
      case 'community': return '#10B981';
      case 'corporate': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="gamification-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading gamification data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gamification-dashboard error">
        <div className="error-message">
          <h3>Error Loading Gamification Data</h3>
          <p>{error}</p>
          <button onClick={loadGamificationData} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!progression) {
    return (
      <div className="gamification-dashboard error">
        <p>No progression data available</p>
      </div>
    );
  }

  return (
    <div className="gamification-dashboard">
      <div className="dashboard-header">
        <h2>🎮 Gamification Dashboard</h2>
        <div className="tab-navigation">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'badges' ? 'active' : ''}
            onClick={() => setActiveTab('badges')}
          >
            Badges
          </button>
          <button 
            className={activeTab === 'leaderboard' ? 'active' : ''}
            onClick={() => setActiveTab('leaderboard')}
          >
            Leaderboard
          </button>
          <button 
            className={activeTab === 'calculator' ? 'active' : ''}
            onClick={() => setActiveTab('calculator')}
          >
            Calculator
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-tab">
          {/* User Stats Overview */}
          <div className="stats-grid">
            <div className="stat-card level">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <h3>Level {progression.stats.currentLevel}</h3>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progression.levelProgress.progressPercentage}%` }}
                  ></div>
                </div>
                <p>{progression.levelProgress.xpInCurrentLevel} / {progression.levelProgress.xpRequiredForNextLevel} XP</p>
              </div>
            </div>

            <div className="stat-card xp">
              <div className="stat-icon">⭐</div>
              <div className="stat-content">
                <h3>{progression.stats.xpPoints.toLocaleString()}</h3>
                <p>Total XP</p>
              </div>
            </div>

            <div className="stat-card trust">
              <div className="stat-icon">🤝</div>
              <div className="stat-content">
                <h3>{progression.stats.trustScore}</h3>
                <p>Trust Score</p>
              </div>
            </div>

            <div className="stat-card rwis">
              <div className="stat-icon">🌍</div>
              <div className="stat-content">
                <h3>{progression.stats.rwisScore}</h3>
                <p>Real-World Impact</p>
              </div>
            </div>
          </div>

          {/* Category Stats */}
          <div className="category-stats">
            <h3>Work Category Progress</h3>
            <div className="category-grid">
              {Object.entries(progression.stats.categoryStats).map(([category, stats]) => (
                <div key={category} className="category-card">
                  <div className="category-header">
                    <h4 style={{ color: getCategoryColor(category) }}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </h4>
                  </div>
                  <div className="category-metrics">
                    <div className="metric">
                      <span className="metric-label">Tasks:</span>
                      <span className="metric-value">{stats.tasksCompleted}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">XP:</span>
                      <span className="metric-value">{stats.totalXP}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Rating:</span>
                      <span className="metric-value">{stats.averageRating.toFixed(1)}⭐</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Badges */}
          <div className="recent-badges">
            <h3>Recent Achievements</h3>
            <div className="badges-grid">
              {userBadges.slice(0, 6).map((achievement) => (
                <div key={achievement.id} className="badge-card">
                  <div 
                    className="badge-icon"
                    style={{ borderColor: getRarityColor(achievement.badge?.rarity || 'COMMON') }}
                  >
                    🏅
                  </div>
                  <div className="badge-info">
                    <h4>{achievement.badge?.name || 'Unknown Badge'}</h4>
                    <p className="badge-description">{achievement.badge?.description}</p>
                    <span 
                      className="badge-rarity"
                      style={{ color: getRarityColor(achievement.badge?.rarity || 'COMMON') }}
                    >
                      {achievement.badge?.rarity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="badges-tab">
          <div className="badges-header">
            <h3>Badge Collection ({userBadges.length} earned)</h3>
          </div>
          <div className="badges-grid">
            {badges.map((badge) => {
              const isEarned = userBadges.some(ub => ub.badgeId === badge.id);
              return (
                <div key={badge.id} className={`badge-card ${isEarned ? 'earned' : 'locked'}`}>
                  <div 
                    className="badge-icon"
                    style={{ borderColor: getRarityColor(badge.rarity) }}
                  >
                    {isEarned ? '🏅' : '🔒'}
                  </div>
                  <div className="badge-info">
                    <h4>{badge.name}</h4>
                    <p className="badge-description">{badge.description}</p>
                    <div className="badge-meta">
                      <span 
                        className="badge-rarity"
                        style={{ color: getRarityColor(badge.rarity) }}
                      >
                        {badge.rarity}
                      </span>
                      <span className="badge-category">{badge.category}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="leaderboard-tab">
          <h3>Trust Score Leaderboard</h3>
          <div className="leaderboard-list">
            {leaderboard.map((entry, index) => (
              <div key={entry.userId} className={`leaderboard-entry ${entry.userId === userId ? 'current-user' : ''}`}>
                <div className="rank">
                  {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${entry.rank}`}
                </div>
                <div className="username">{entry.username}</div>
                <div className="score">{entry.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'calculator' && (
        <div className="calculator-tab">
          <GamificationCalculator />
        </div>
      )}
    </div>
  );
};

// Simple calculator component for testing calculations
const GamificationCalculator: React.FC = () => {
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
    <div className="calculator">
      <h3>Gamification Calculator</h3>
      <div className="calculator-form">
        <div className="form-group">
          <label>Task Rewards XP:</label>
          <input 
            type="number" 
            value={taskRewards.xp} 
            onChange={(e) => setTaskRewards({...taskRewards, xp: parseInt(e.target.value)})}
          />
        </div>
        <div className="form-group">
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="FREELANCE">Freelance</option>
            <option value="COMMUNITY">Community</option>
            <option value="CORPORATE">Corporate</option>
          </select>
        </div>
        <div className="form-group">
          <label>Quality Score (1-5):</label>
          <input 
            type="number" 
            min="1" 
            max="5" 
            value={qualityScore} 
            onChange={(e) => setQualityScore(parseInt(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label>Completion Time (1.0 = on time):</label>
          <input 
            type="number" 
            step="0.1" 
            value={completionTime} 
            onChange={(e) => setCompletionTime(parseFloat(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label>User Level:</label>
          <input 
            type="number" 
            min="1" 
            value={userLevel} 
            onChange={(e) => setUserLevel(parseInt(e.target.value))}
          />
        </div>
        <button onClick={calculateAll} disabled={loading} className="calculate-button">
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
      </div>

      {results && (
        <div className="calculation-results">
          <div className="result-section">
            <h4>XP Calculation</h4>
            <p><strong>Total XP:</strong> {results.xpResult.totalXP}</p>
            <p><strong>Base XP:</strong> {results.xpResult.baseXP}</p>
            <p><strong>Bonus XP:</strong> {results.xpResult.bonusXP}</p>
            <div className="reasoning">
              <strong>Reasoning:</strong>
              <ul>
                {results.xpResult.reasoning.map((reason: string, index: number) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="result-section">
            <h4>Trust Score Calculation</h4>
            <p><strong>Total Trust Score:</strong> {results.trustResult.totalTrustScore}</p>
            <p><strong>Base Trust Score:</strong> {results.trustResult.baseTrustScore}</p>
            <p><strong>Bonus Trust Score:</strong> {results.trustResult.bonusTrustScore}</p>
            <div className="reasoning">
              <strong>Reasoning:</strong>
              <ul>
                {results.trustResult.reasoning.map((reason: string, index: number) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="result-section">
            <h4>RWIS Calculation</h4>
            <p><strong>Total RWIS:</strong> {results.rwisResult.totalRWIS}</p>
            <p><strong>Base RWIS:</strong> {results.rwisResult.baseRWIS}</p>
            <p><strong>Bonus RWIS:</strong> {results.rwisResult.bonusRWIS}</p>
            <div className="reasoning">
              <strong>Reasoning:</strong>
              <ul>
                {results.rwisResult.reasoning.map((reason: string, index: number) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationDashboard;