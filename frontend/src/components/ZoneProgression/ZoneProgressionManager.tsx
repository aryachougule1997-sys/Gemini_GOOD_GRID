import React, { useState, useEffect, useCallback } from 'react';
import { Zone, Dungeon, UserStats } from '../../../../shared/types';
import ZoneUnlockCelebration from './ZoneUnlockCelebration';
import ProgressiveMapReveal from './ProgressiveMapReveal';
import AdvancedDungeonUnlockComponent from './AdvancedDungeonUnlock';
import './ZoneProgressionManager.css';

interface ZoneProgressionManagerProps {
  userStats: UserStats;
  onUserStatsUpdate?: (newStats: UserStats) => void;
}

interface ZoneProgressionStatus {
  currentZones: Zone[];
  unlockedZones: Zone[];
  lockedZones: Zone[];
  nextUnlockableZone?: Zone;
  progressToNextZone: number;
  advancedDungeons: AdvancedDungeonUnlock[];
  zoneSpecificContent: ZoneSpecificContent[];
}

interface AdvancedDungeonUnlock {
  dungeonId: string;
  dungeonName: string;
  category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
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

interface ZoneSpecificContent {
  zoneId: string;
  contentType: 'TASK_DIFFICULTY_SCALING' | 'SPECIAL_DUNGEONS' | 'UNIQUE_REWARDS' | 'TERRAIN_BONUSES';
  content: {
    difficultyMultiplier?: number;
    specialDungeonTypes?: string[];
    uniqueRewards?: string[];
    terrainBonuses?: Record<string, number>;
  };
}

interface ZoneUnlockResult {
  zoneId: string;
  zoneName: string;
  unlocked: boolean;
  reason?: string;
  newDungeonsUnlocked: Dungeon[];
  celebrationData: {
    animationType: 'ZONE_UNLOCK' | 'DUNGEON_UNLOCK' | 'AREA_REVEAL';
    title: string;
    description: string;
    rewards: {
      xp?: number;
      trustScore?: number;
      badges?: string[];
      specialFeatures?: string[];
    };
    visualEffects: {
      mapRevealAnimation: boolean;
      particleEffects: string[];
      soundEffects: string[];
    };
  };
}

const ZoneProgressionManager: React.FC<ZoneProgressionManagerProps> = ({
  userStats,
  onUserStatsUpdate
}) => {
  const [progressionStatus, setProgressionStatus] = useState<ZoneProgressionStatus | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [dungeons, setDungeons] = useState<Dungeon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'map' | 'dungeons' | 'progress'>('map');
  const [autoCheckUnlocks, setAutoCheckUnlocks] = useState(true);

  // Fetch progression status (using mock data for demo)
  const fetchProgressionStatus = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockZones: Zone[] = [
        {
          id: 'starter-town',
          name: 'Starter Town',
          terrainType: 'URBAN',
          unlockRequirements: { trustScore: 0, level: 1 },
          difficulty: 'BEGINNER',
          coordinates: { minX: 0, minY: 0, maxX: 400, maxY: 400 },
          createdAt: new Date(),
          dungeons: [
            {
              id: 'freelance-tower-1',
              type: 'FREELANCE',
              name: 'Freelance Tower',
              zoneId: 'starter-town',
              coordinates: { x: 200, y: 200 },
              entryRequirements: { trustScore: 5 },
              specialFeatures: ['beginner-friendly'],
              createdAt: new Date()
            }
          ]
        },
        {
          id: 'tech-district',
          name: 'Tech District',
          terrainType: 'URBAN',
          unlockRequirements: { trustScore: 25, level: 3 },
          difficulty: 'INTERMEDIATE',
          coordinates: { minX: 400, minY: 0, maxX: 800, maxY: 400 },
          createdAt: new Date(),
          dungeons: [
            {
              id: 'innovation-hub',
              type: 'CORPORATE',
              name: 'Innovation Hub',
              zoneId: 'tech-district',
              coordinates: { x: 600, y: 200 },
              entryRequirements: { trustScore: 30 },
              specialFeatures: ['tech-focused'],
              createdAt: new Date()
            }
          ]
        },
        {
          id: 'community-hub',
          name: 'Community Gardens',
          terrainType: 'FOREST',
          unlockRequirements: { trustScore: 50, level: 5 },
          difficulty: 'INTERMEDIATE',
          coordinates: { minX: 0, minY: 400, maxX: 400, maxY: 800 },
          createdAt: new Date(),
          dungeons: [
            {
              id: 'community-center',
              type: 'COMMUNITY',
              name: 'Community Center',
              zoneId: 'community-hub',
              coordinates: { x: 200, y: 600 },
              entryRequirements: { trustScore: 40 },
              specialFeatures: ['community-focused'],
              createdAt: new Date()
            }
          ]
        },
        {
          id: 'mountain-peaks',
          name: 'Mountain Peaks',
          terrainType: 'MOUNTAIN',
          unlockRequirements: { trustScore: 100, level: 10 },
          difficulty: 'ADVANCED',
          coordinates: { minX: 400, minY: 400, maxX: 800, maxY: 800 },
          createdAt: new Date()
        },
        {
          id: 'crystal-caves',
          name: 'Crystal Caves',
          terrainType: 'MOUNTAIN',
          unlockRequirements: { trustScore: 200, level: 15 },
          difficulty: 'EXPERT',
          coordinates: { minX: 800, minY: 400, maxX: 1200, maxY: 800 },
          createdAt: new Date()
        }
      ];

      const mockAdvancedDungeons: AdvancedDungeonUnlock[] = [
        {
          dungeonId: 'freelance-basic',
          dungeonName: 'Freelance Hub - Basic',
          category: 'FREELANCE',
          tier: 'BASIC',
          unlockRequirements: { categoryTasksCompleted: 0, categoryXP: 0, categoryRating: 0 },
          unlocked: true,
          progressToUnlock: 100
        },
        {
          dungeonId: 'freelance-advanced',
          dungeonName: 'Freelance Hub - Advanced',
          category: 'FREELANCE',
          tier: 'ADVANCED',
          unlockRequirements: { categoryTasksCompleted: 10, categoryXP: 500, categoryRating: 3.5 },
          unlocked: userStats.categoryStats.freelance.tasksCompleted >= 10,
          progressToUnlock: Math.min(100, (userStats.categoryStats.freelance.tasksCompleted / 10) * 100)
        },
        {
          dungeonId: 'community-basic',
          dungeonName: 'Community Center - Basic',
          category: 'COMMUNITY',
          tier: 'BASIC',
          unlockRequirements: { categoryTasksCompleted: 0, categoryXP: 0, categoryRating: 0 },
          unlocked: true,
          progressToUnlock: 100
        },
        {
          dungeonId: 'community-advanced',
          dungeonName: 'Community Center - Advanced',
          category: 'COMMUNITY',
          tier: 'ADVANCED',
          unlockRequirements: { categoryTasksCompleted: 15, categoryXP: 750, categoryRating: 3.5 },
          unlocked: userStats.categoryStats.community.tasksCompleted >= 15,
          progressToUnlock: Math.min(100, (userStats.categoryStats.community.tasksCompleted / 15) * 100)
        },
        {
          dungeonId: 'corporate-basic',
          dungeonName: 'Corporate Tower - Basic',
          category: 'CORPORATE',
          tier: 'BASIC',
          unlockRequirements: { categoryTasksCompleted: 0, categoryXP: 0, categoryRating: 0 },
          unlocked: true,
          progressToUnlock: 100
        },
        {
          dungeonId: 'corporate-advanced',
          dungeonName: 'Corporate Tower - Advanced',
          category: 'CORPORATE',
          tier: 'ADVANCED',
          unlockRequirements: { categoryTasksCompleted: 8, categoryXP: 400, categoryRating: 3.5 },
          unlocked: userStats.categoryStats.corporate.tasksCompleted >= 8,
          progressToUnlock: Math.min(100, (userStats.categoryStats.corporate.tasksCompleted / 8) * 100)
        }
      ];

      const unlockedZones = mockZones.filter(zone => userStats.unlockedZones.includes(zone.id));
      const lockedZones = mockZones.filter(zone => !userStats.unlockedZones.includes(zone.id));
      const nextUnlockableZone = lockedZones.find(zone => {
        const meetsRequirements = 
          (!zone.unlockRequirements.trustScore || userStats.trustScore >= zone.unlockRequirements.trustScore * 0.8) &&
          (!zone.unlockRequirements.level || userStats.currentLevel >= zone.unlockRequirements.level * 0.8);
        return meetsRequirements;
      });

      const mockProgressionStatus: ZoneProgressionStatus = {
        currentZones: unlockedZones,
        unlockedZones,
        lockedZones,
        nextUnlockableZone,
        progressToNextZone: nextUnlockableZone ? Math.min(100, 
          ((userStats.trustScore / (nextUnlockableZone.unlockRequirements.trustScore || 1)) + 
           (userStats.currentLevel / (nextUnlockableZone.unlockRequirements.level || 1))) * 50
        ) : 0,
        advancedDungeons: mockAdvancedDungeons,
        zoneSpecificContent: [
          {
            zoneId: 'starter-town',
            contentType: 'TASK_DIFFICULTY_SCALING',
            content: { difficultyMultiplier: 1.0 }
          },
          {
            zoneId: 'tech-district',
            contentType: 'TERRAIN_BONUSES',
            content: { terrainBonuses: { 'tech_tasks_xp_bonus': 1.2 } }
          }
        ]
      };

      setProgressionStatus(mockProgressionStatus);
      setZones(mockZones);
      
      // Get all dungeons from all zones
      const allDungeons = mockZones.flatMap(zone => zone.dungeons || []);
      setDungeons(allDungeons);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userStats]);

  // Check for zone unlocks (mock implementation for demo)
  const checkZoneUnlocks = useCallback(async () => {
    try {
      // Mock zone unlock logic
      const lockedZones = zones.filter(zone => !userStats.unlockedZones.includes(zone.id));
      
      for (const zone of lockedZones) {
        const meetsRequirements = 
          (!zone.unlockRequirements.trustScore || userStats.trustScore >= zone.unlockRequirements.trustScore) &&
          (!zone.unlockRequirements.level || userStats.currentLevel >= zone.unlockRequirements.level);
        
        if (meetsRequirements) {
          // Show celebration for newly unlocked zone
          const celebrationData = {
            animationType: 'ZONE_UNLOCK' as const,
            title: `${zone.name} Unlocked!`,
            description: `You've gained access to ${zone.name}. New adventures await!`,
            rewards: {
              xp: zone.difficulty === 'BEGINNER' ? 50 : zone.difficulty === 'INTERMEDIATE' ? 100 : 200,
              trustScore: zone.difficulty === 'BEGINNER' ? 5 : zone.difficulty === 'INTERMEDIATE' ? 10 : 20,
              badges: ['Zone Explorer'],
              specialFeatures: [`${zone.terrainType} terrain bonuses`, `${zone.difficulty} difficulty tasks`]
            },
            visualEffects: {
              mapRevealAnimation: true,
              particleEffects: zone.terrainType === 'URBAN' ? ['city_lights'] : 
                              zone.terrainType === 'FOREST' ? ['forest_sparkles'] : 
                              zone.terrainType === 'MOUNTAIN' ? ['snow_particles'] : ['city_lights'],
              soundEffects: ['zone_unlock', 'celebration']
            }
          };
          
          setCelebrationData(celebrationData);
          setShowCelebration(true);
          
          // Update user stats (in a real app, this would be done on the backend)
          if (onUserStatsUpdate) {
            const newStats = {
              ...userStats,
              unlockedZones: [...userStats.unlockedZones, zone.id]
            };
            onUserStatsUpdate(newStats);
          }
          
          // Refresh progression status
          setTimeout(() => {
            fetchProgressionStatus();
          }, 1000);
          
          break; // Only unlock one zone at a time for better UX
        }
      }
      
    } catch (err) {
      console.error('Error checking zone unlocks:', err);
    }
  }, [zones, userStats, onUserStatsUpdate, fetchProgressionStatus]);

  // Initial load
  useEffect(() => {
    fetchProgressionStatus();
  }, [fetchProgressionStatus]);

  // Auto-check for unlocks when user stats change
  useEffect(() => {
    if (autoCheckUnlocks && userStats) {
      checkZoneUnlocks();
    }
  }, [userStats.trustScore, userStats.currentLevel, userStats.xpPoints, autoCheckUnlocks, checkZoneUnlocks]);

  // Handle zone reveal
  const handleZoneReveal = useCallback((zoneId: string) => {
    console.log(`Zone revealed: ${zoneId}`);
    // Could trigger additional effects or analytics here
  }, []);

  // Handle dungeon reveal
  const handleDungeonReveal = useCallback((dungeonId: string) => {
    console.log(`Dungeon revealed: ${dungeonId}`);
    // Could trigger additional effects or analytics here
  }, []);

  // Handle dungeon selection
  const handleDungeonSelect = useCallback((dungeonId: string) => {
    console.log(`Dungeon selected: ${dungeonId}`);
    // Navigate to dungeon or show dungeon details
    // This would typically integrate with your routing system
  }, []);

  // Handle celebration completion
  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
    setCelebrationData(null);
  }, []);

  if (loading) {
    return (
      <div className="zone-progression-loading">
        <div className="loading-spinner" />
        <p>Loading zone progression...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="zone-progression-error">
        <h3>Error Loading Zone Progression</h3>
        <p>{error}</p>
        <button onClick={fetchProgressionStatus} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!progressionStatus) {
    return (
      <div className="zone-progression-empty">
        <p>No progression data available</p>
      </div>
    );
  }

  return (
    <div className="zone-progression-manager">
      {/* Zone Unlock Celebration */}
      <ZoneUnlockCelebration
        isVisible={showCelebration}
        celebrationData={celebrationData}
        onCelebrationComplete={handleCelebrationComplete}
      />

      {/* Header */}
      <div className="progression-header">
        <h1>Zone Progression</h1>
        <div className="progression-stats">
          <div className="stat-item">
            <span className="stat-label">Zones Unlocked</span>
            <span className="stat-value">{progressionStatus.unlockedZones.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Zones</span>
            <span className="stat-value">{progressionStatus.unlockedZones.length + progressionStatus.lockedZones.length}</span>
          </div>
          {progressionStatus.nextUnlockableZone && (
            <div className="stat-item">
              <span className="stat-label">Next Zone Progress</span>
              <span className="stat-value">{progressionStatus.progressToNextZone}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="progression-controls">
        <div className="tab-buttons">
          <button
            className={`tab-button ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            🗺️ Map View
          </button>
          <button
            className={`tab-button ${activeTab === 'dungeons' ? 'active' : ''}`}
            onClick={() => setActiveTab('dungeons')}
          >
            🏰 Advanced Dungeons
          </button>
          <button
            className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            📊 Progress Details
          </button>
        </div>

        <div className="control-buttons">
          <button
            onClick={checkZoneUnlocks}
            className="check-unlocks-button"
            disabled={loading}
          >
            🔍 Check Unlocks
          </button>
          <button
            onClick={() => {
              // Demo: Trigger a zone unlock celebration
              const mockCelebration = {
                animationType: 'ZONE_UNLOCK' as const,
                title: 'Mountain Peaks Unlocked!',
                description: 'You\'ve gained access to the challenging Mountain Peaks region. New adventures await!',
                rewards: {
                  xp: 200,
                  trustScore: 20,
                  badges: ['Zone Explorer', 'Mountain Climber'],
                  specialFeatures: ['Mountain terrain bonuses', 'Advanced difficulty tasks', 'Special climbing dungeons']
                },
                visualEffects: {
                  mapRevealAnimation: true,
                  particleEffects: ['snow_particles', 'mountain_mist'],
                  soundEffects: ['zone_unlock', 'mountain_wind']
                }
              };
              setCelebrationData(mockCelebration);
              setShowCelebration(true);
            }}
            className="demo-unlock-button"
          >
            🎉 Demo Unlock
          </button>
          <label className="auto-check-toggle">
            <input
              type="checkbox"
              checked={autoCheckUnlocks}
              onChange={(e) => setAutoCheckUnlocks(e.target.checked)}
            />
            Auto-check unlocks
          </label>
        </div>
      </div>

      {/* Content */}
      <div className="progression-content">
        {activeTab === 'map' && (
          <div className="map-tab">
            <ProgressiveMapReveal
              zones={zones}
              dungeons={dungeons}
              userStats={userStats}
              onZoneReveal={handleZoneReveal}
              onDungeonReveal={handleDungeonReveal}
            />
          </div>
        )}

        {activeTab === 'dungeons' && (
          <div className="dungeons-tab">
            <AdvancedDungeonUnlockComponent
              dungeonUnlocks={progressionStatus.advancedDungeons}
              onDungeonSelect={handleDungeonSelect}
            />
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="progress-tab">
            <div className="progress-details">
              <div className="progress-section">
                <h3>Current Progress</h3>
                <div className="progress-grid">
                  <div className="progress-card">
                    <h4>Trust Score</h4>
                    <div className="progress-value">{userStats.trustScore}</div>
                    <div className="progress-description">
                      Higher trust scores unlock advanced zones
                    </div>
                  </div>
                  <div className="progress-card">
                    <h4>Level</h4>
                    <div className="progress-value">{userStats.currentLevel}</div>
                    <div className="progress-description">
                      Level requirements for zone access
                    </div>
                  </div>
                  <div className="progress-card">
                    <h4>Total Tasks</h4>
                    <div className="progress-value">
                      {Object.values(userStats.categoryStats).reduce((sum, cat) => sum + cat.tasksCompleted, 0)}
                    </div>
                    <div className="progress-description">
                      Task completion unlocks new areas
                    </div>
                  </div>
                </div>
              </div>

              {progressionStatus.nextUnlockableZone && (
                <div className="progress-section">
                  <h3>Next Zone: {progressionStatus.nextUnlockableZone.name}</h3>
                  <div className="next-zone-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${progressionStatus.progressToNextZone}%` }}
                      />
                    </div>
                    <div className="progress-percentage">
                      {progressionStatus.progressToNextZone}% Complete
                    </div>
                  </div>
                  <div className="unlock-requirements">
                    <h4>Requirements:</h4>
                    <ul>
                      {progressionStatus.nextUnlockableZone.unlockRequirements.trustScore && (
                        <li>Trust Score: {progressionStatus.nextUnlockableZone.unlockRequirements.trustScore}</li>
                      )}
                      {progressionStatus.nextUnlockableZone.unlockRequirements.level && (
                        <li>Level: {progressionStatus.nextUnlockableZone.unlockRequirements.level}</li>
                      )}
                      {progressionStatus.nextUnlockableZone.unlockRequirements.completedTasks && (
                        <li>Completed Tasks: {progressionStatus.nextUnlockableZone.unlockRequirements.completedTasks}</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              <div className="progress-section">
                <h3>Zone-Specific Content</h3>
                <div className="content-grid">
                  {progressionStatus.zoneSpecificContent.map((content, index) => (
                    <div key={index} className="content-card">
                      <h4>{content.contentType.replace(/_/g, ' ')}</h4>
                      <div className="content-details">
                        {content.content.difficultyMultiplier && (
                          <p>Difficulty Multiplier: {content.content.difficultyMultiplier}x</p>
                        )}
                        {content.content.specialDungeonTypes && (
                          <div>
                            <p>Special Dungeons:</p>
                            <ul>
                              {content.content.specialDungeonTypes.map((type, i) => (
                                <li key={i}>{type}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {content.content.uniqueRewards && (
                          <div>
                            <p>Unique Rewards:</p>
                            <ul>
                              {content.content.uniqueRewards.map((reward, i) => (
                                <li key={i}>{reward}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneProgressionManager;