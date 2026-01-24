import React, { useState, useEffect } from 'react';
import { WorkCategory } from '../../../../shared/types';
import './AdvancedDungeonUnlock.css';

interface AdvancedDungeonUnlockProps {
  dungeonUnlocks: AdvancedDungeonUnlock[];
  onDungeonSelect?: (dungeonId: string) => void;
}

interface AdvancedDungeonUnlock {
  dungeonId: string;
  dungeonName: string;
  category: WorkCategory;
  tier: 'BASIC' | 'ADVANCED' | 'EXPERT' | 'MASTER';
  unlockRequirements: {
    categoryTasksCompleted: number;
    categoryXP: number;
    categoryRating: number;
    specialBadges?: string[];
  };
  unlocked: boolean;
  progressToUnlock: number;
}

const AdvancedDungeonUnlock: React.FC<AdvancedDungeonUnlockProps> = ({
  dungeonUnlocks,
  onDungeonSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WorkCategory>('FREELANCE');
  const [expandedDungeon, setExpandedDungeon] = useState<string | null>(null);

  const getCategoryDungeons = (category: WorkCategory) => {
    return dungeonUnlocks.filter(dungeon => dungeon.category === category);
  };

  const getTierColor = (tier: string) => {
    const colors = {
      BASIC: '#48bb78',
      ADVANCED: '#ed8936',
      EXPERT: '#e53e3e',
      MASTER: '#805ad5'
    };
    return colors[tier as keyof typeof colors] || colors.BASIC;
  };

  const getTierIcon = (tier: string) => {
    const icons = {
      BASIC: '🌟',
      ADVANCED: '⭐',
      EXPERT: '💫',
      MASTER: '✨'
    };
    return icons[tier as keyof typeof icons] || icons.BASIC;
  };

  const getCategoryIcon = (category: WorkCategory) => {
    const icons = {
      FREELANCE: '💼',
      COMMUNITY: '🌱',
      CORPORATE: '🏢'
    };
    return icons[category] || '⚡';
  };

  const getCategoryColor = (category: WorkCategory) => {
    const colors = {
      FREELANCE: '#805ad5',
      COMMUNITY: '#38a169',
      CORPORATE: '#3182ce'
    };
    return colors[category] || colors.FREELANCE;
  };

  const formatRequirement = (key: string, value: any) => {
    const labels = {
      categoryTasksCompleted: 'Tasks Completed',
      categoryXP: 'Category XP',
      categoryRating: 'Average Rating',
      specialBadges: 'Required Badges'
    };

    const label = labels[key as keyof typeof labels] || key;

    if (key === 'categoryRating') {
      return `${label}: ${value.toFixed(1)}/5.0`;
    } else if (key === 'specialBadges' && Array.isArray(value)) {
      return `${label}: ${value.join(', ')}`;
    } else {
      return `${label}: ${value.toLocaleString()}`;
    }
  };

  return (
    <div className="advanced-dungeon-unlock">
      <div className="dungeon-header">
        <h2>Advanced Dungeons</h2>
        <p>Unlock specialized dungeons by mastering each work category</p>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {(['FREELANCE', 'COMMUNITY', 'CORPORATE'] as WorkCategory[]).map(category => (
          <button
            key={category}
            className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
            style={{ '--category-color': getCategoryColor(category) } as React.CSSProperties}
          >
            <span className="category-icon">{getCategoryIcon(category)}</span>
            <span className="category-name">{category}</span>
            <span className="category-count">
              {getCategoryDungeons(category).filter(d => d.unlocked).length}/
              {getCategoryDungeons(category).length}
            </span>
          </button>
        ))}
      </div>

      {/* Dungeon Grid */}
      <div className="dungeon-grid">
        {getCategoryDungeons(selectedCategory).map(dungeon => (
          <div
            key={dungeon.dungeonId}
            className={`dungeon-card ${dungeon.unlocked ? 'unlocked' : 'locked'} ${
              expandedDungeon === dungeon.dungeonId ? 'expanded' : ''
            }`}
            onClick={() => {
              if (dungeon.unlocked && onDungeonSelect) {
                onDungeonSelect(dungeon.dungeonId);
              } else {
                setExpandedDungeon(
                  expandedDungeon === dungeon.dungeonId ? null : dungeon.dungeonId
                );
              }
            }}
            style={{ '--tier-color': getTierColor(dungeon.tier) } as React.CSSProperties}
          >
            {/* Dungeon Header */}
            <div className="dungeon-card-header">
              <div className="dungeon-tier">
                <span className="tier-icon">{getTierIcon(dungeon.tier)}</span>
                <span className="tier-name">{dungeon.tier}</span>
              </div>
              
              <div className="dungeon-status">
                {dungeon.unlocked ? (
                  <span className="status-unlocked">✓ UNLOCKED</span>
                ) : (
                  <span className="status-locked">🔒 LOCKED</span>
                )}
              </div>
            </div>

            {/* Dungeon Name */}
            <h3 className="dungeon-name">{dungeon.dungeonName}</h3>

            {/* Progress Bar */}
            {!dungeon.unlocked && (
              <div className="progress-section">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${dungeon.progressToUnlock}%` }}
                  />
                </div>
                <span className="progress-text">{dungeon.progressToUnlock}% Complete</span>
              </div>
            )}

            {/* Unlock Requirements (Expanded) */}
            {expandedDungeon === dungeon.dungeonId && !dungeon.unlocked && (
              <div className="requirements-section">
                <h4>Unlock Requirements:</h4>
                <div className="requirements-list">
                  {Object.entries(dungeon.unlockRequirements).map(([key, value]) => {
                    if (key === 'specialBadges' && (!value || (Array.isArray(value) && value.length === 0))) {
                      return null;
                    }
                    return (
                      <div key={key} className="requirement-item">
                        <span className="requirement-label">
                          {formatRequirement(key, value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unlocked Features */}
            {dungeon.unlocked && expandedDungeon === dungeon.dungeonId && (
              <div className="features-section">
                <h4>Special Features:</h4>
                <div className="features-list">
                  <div className="feature-item">
                    <span className="feature-icon">⚡</span>
                    <span>Higher XP multipliers</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🏆</span>
                    <span>Exclusive {dungeon.tier.toLowerCase()} badges</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">💎</span>
                    <span>Premium task opportunities</span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🎯</span>
                    <span>Specialized skill development</span>
                  </div>
                </div>
                
                <button 
                  className="enter-dungeon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDungeonSelect) {
                      onDungeonSelect(dungeon.dungeonId);
                    }
                  }}
                >
                  Enter Dungeon
                </button>
              </div>
            )}

            {/* Tier Glow Effect */}
            {dungeon.unlocked && (
              <div className="tier-glow" />
            )}
          </div>
        ))}
      </div>

      {/* Category Summary */}
      <div className="category-summary">
        <div className="summary-card">
          <h3>{selectedCategory} Mastery Progress</h3>
          <div className="mastery-stats">
            <div className="stat-item">
              <span className="stat-label">Unlocked Tiers:</span>
              <span className="stat-value">
                {getCategoryDungeons(selectedCategory).filter(d => d.unlocked).length} / {getCategoryDungeons(selectedCategory).length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Highest Tier:</span>
              <span className="stat-value">
                {getCategoryDungeons(selectedCategory)
                  .filter(d => d.unlocked)
                  .reduce((highest, dungeon) => {
                    const tierOrder = { BASIC: 1, ADVANCED: 2, EXPERT: 3, MASTER: 4 };
                    const currentTier = tierOrder[dungeon.tier as keyof typeof tierOrder];
                    const highestTier = tierOrder[highest as keyof typeof tierOrder] || 0;
                    return currentTier > highestTier ? dungeon.tier : highest;
                  }, 'NONE')
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDungeonUnlock;