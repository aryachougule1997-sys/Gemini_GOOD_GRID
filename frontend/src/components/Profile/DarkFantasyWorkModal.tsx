import React, { useState } from 'react';
import './DarkFantasyWorkModal.css';

interface WorkHistoryItem {
  id: string;
  title: string;
  category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
  description: string;
  completedAt: string;
  xpGained: number;
  trustScoreGain: number;
  rwisGain: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  skills: string[];
  clientFeedback?: string;
  artifacts: string[]; // Screenshots, documents, etc.
  duration: string;
  teamMembers?: string[];
}

interface DarkFantasyWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  workItem: WorkHistoryItem | null;
}

const DarkFantasyWorkModal: React.FC<DarkFantasyWorkModalProps> = ({
  isOpen,
  onClose,
  workItem
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'artifacts' | 'rewards'>('details');

  if (!isOpen || !workItem) return null;

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'FREELANCE':
        return {
          color: '#ff6b35',
          icon: '🏰',
          title: 'Freelance Tower Quest',
          bgGradient: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(255, 107, 53, 0.05))'
        };
      case 'COMMUNITY':
        return {
          color: '#4ecdc4',
          icon: '🌳',
          title: 'Community Garden Mission',
          bgGradient: 'linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(78, 205, 196, 0.05))'
        };
      case 'CORPORATE':
        return {
          color: '#45b7d1',
          icon: '🏢',
          title: 'Corporate Castle Campaign',
          bgGradient: 'linear-gradient(135deg, rgba(69, 183, 209, 0.1), rgba(69, 183, 209, 0.05))'
        };
      default:
        return {
          color: '#666',
          icon: '⚔️',
          title: 'Unknown Quest',
          bgGradient: 'linear-gradient(135deg, rgba(102, 102, 102, 0.1), rgba(102, 102, 102, 0.05))'
        };
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4caf50';
      case 'intermediate': return '#ffc107';
      case 'advanced': return '#ff5722';
      case 'expert': return '#f44336';
      default: return '#666';
    }
  };

  const theme = getCategoryTheme(workItem.category);

  return (
    <div className="dark-fantasy-modal-overlay" onClick={onClose}>
      <div className="dark-fantasy-modal" onClick={(e) => e.stopPropagation()}>
        {/* Animated Background */}
        <div className="modal-background">
          <div className="magic-particles"></div>
          <div className="floating-runes"></div>
        </div>

        {/* Header */}
        <div className="modal-header" style={{ background: theme.bgGradient }}>
          <div className="quest-emblem">
            <div className="emblem-icon" style={{ color: theme.color }}>
              {theme.icon}
            </div>
            <div className="emblem-glow" style={{ boxShadow: `0 0 30px ${theme.color}` }}></div>
          </div>
          
          <div className="quest-info">
            <div className="quest-category" style={{ color: theme.color }}>
              {theme.title}
            </div>
            <h2 className="quest-title">{workItem.title}</h2>
            <div className="quest-meta">
              <span className="completion-date">
                Completed: {new Date(workItem.completedAt).toLocaleDateString()}
              </span>
              <span 
                className="difficulty-indicator"
                style={{ 
                  color: getDifficultyColor(workItem.difficulty),
                  textShadow: `0 0 10px ${getDifficultyColor(workItem.difficulty)}`
                }}
              >
                {workItem.difficulty.toUpperCase()} DIFFICULTY
              </span>
            </div>
          </div>

          <button className="close-button" onClick={onClose}>
            <span className="close-icon">✕</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <span className="tab-icon">📜</span>
            Quest Details
          </button>
          <button 
            className={`tab-btn ${activeTab === 'artifacts' ? 'active' : ''}`}
            onClick={() => setActiveTab('artifacts')}
          >
            <span className="tab-icon">🗡️</span>
            Artifacts
          </button>
          <button 
            className={`tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            <span className="tab-icon">💎</span>
            Rewards
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {activeTab === 'details' && (
            <div className="details-panel">
              <div className="quest-description">
                <h3>Quest Chronicle</h3>
                <p>{workItem.description}</p>
              </div>

              <div className="quest-stats">
                <div className="stat-row">
                  <span className="stat-label">Duration:</span>
                  <span className="stat-value">{workItem.duration}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Skills Utilized:</span>
                  <div className="skills-list">
                    {workItem.skills.map((skill, index) => (
                      <span key={index} className="skill-tag" style={{ borderColor: theme.color }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                {workItem.teamMembers && workItem.teamMembers.length > 0 && (
                  <div className="stat-row">
                    <span className="stat-label">Party Members:</span>
                    <div className="team-list">
                      {workItem.teamMembers.map((member, index) => (
                        <span key={index} className="team-member">
                          👤 {member}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {workItem.clientFeedback && (
                <div className="client-feedback">
                  <h3>Client Testimonial</h3>
                  <div className="feedback-scroll">
                    <p>"{workItem.clientFeedback}"</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'artifacts' && (
            <div className="artifacts-panel">
              <h3>Quest Artifacts & Evidence</h3>
              <div className="artifacts-grid">
                {workItem.artifacts.map((artifact, index) => (
                  <div key={index} className="artifact-item">
                    <div className="artifact-icon">📄</div>
                    <div className="artifact-name">{artifact}</div>
                    <div className="artifact-glow"></div>
                  </div>
                ))}
                {workItem.artifacts.length === 0 && (
                  <div className="no-artifacts">
                    <div className="empty-icon">🗃️</div>
                    <p>No artifacts recorded for this quest</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="rewards-panel">
              <h3>Quest Rewards Earned</h3>
              <div className="rewards-grid">
                <div className="reward-card xp">
                  <div className="reward-icon">⚡</div>
                  <div className="reward-amount">+{workItem.xpGained}</div>
                  <div className="reward-label">Experience Points</div>
                  <div className="reward-glow xp-glow"></div>
                </div>

                <div className="reward-card trust">
                  <div className="reward-icon">🛡️</div>
                  <div className="reward-amount">+{workItem.trustScoreGain}</div>
                  <div className="reward-label">Trust Score</div>
                  <div className="reward-glow trust-glow"></div>
                </div>

                <div className="reward-card rwis">
                  <div className="reward-icon">🌟</div>
                  <div className="reward-amount">+{workItem.rwisGain}</div>
                  <div className="reward-label">RWIS Points</div>
                  <div className="reward-glow rwis-glow"></div>
                </div>
              </div>

              <div className="total-impact">
                <h4>Total Impact Calculation</h4>
                <div className="impact-formula">
                  <span>Base XP: {workItem.xpGained}</span>
                  <span>×</span>
                  <span>Difficulty Multiplier: {
                    workItem.difficulty === 'expert' ? '2.0' :
                    workItem.difficulty === 'advanced' ? '1.5' :
                    workItem.difficulty === 'intermediate' ? '1.2' : '1.0'
                  }</span>
                  <span>=</span>
                  <span className="final-impact" style={{ color: theme.color }}>
                    {Math.round(workItem.xpGained * (
                      workItem.difficulty === 'expert' ? 2.0 :
                      workItem.difficulty === 'advanced' ? 1.5 :
                      workItem.difficulty === 'intermediate' ? 1.2 : 1.0
                    ))} Total Impact
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="quest-signature">
            <span>Quest completed in the realm of {theme.title}</span>
            <div className="signature-seal" style={{ borderColor: theme.color }}>
              {theme.icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkFantasyWorkModal;