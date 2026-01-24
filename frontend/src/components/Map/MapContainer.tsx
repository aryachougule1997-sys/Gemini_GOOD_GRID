import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Zone, Dungeon, Coordinates, User, CharacterData as GameCharacterData, Task, UserStats } from '../../../../shared/types';
import MapEngine from './MapEngine';
import MapUI from './MapUI';
import CareerWidget from './CareerWidget';
import CareerNotificationSystem from './CareerNotificationSystem';
import { DungeonContainer } from '../Dungeon';
import CareerHub from '../Career/CareerHub';
import IntegratedCareerPanel from './IntegratedCareerPanel';
import QuickCareerWidget from './QuickCareerWidget';
import AIResumeBuilder from '../Career/AIResumeBuilder';
import AIJobMatcher from '../Career/AIJobMatcher';
import EnhancedProfileBuilder from '../Profile/EnhancedProfileBuilder';
import { MapService } from '../../services/mapService';
import { DungeonService } from '../../services/dungeonService';
import { CharacterMovementService } from '../../services/characterMovementService';
import './Map.css';

interface MapContainerProps {
  user: User;
  characterData: GameCharacterData;
  userStats: UserStats;
  onDungeonEnter?: (dungeon: Dungeon) => void;
  onZoneUnlock?: (zone: Zone) => void;
  onTaskSelect?: (task: Task) => void;
  authToken?: string;
}

const MapContainer: React.FC<MapContainerProps> = ({
  user,
  characterData,
  userStats,
  onDungeonEnter,
  onZoneUnlock,
  onTaskSelect,
  authToken
}) => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [dungeons, setDungeons] = useState<Dungeon[]>([]);
  const [playerPosition, setPlayerPosition] = useState<Coordinates>(
    user.locationData?.coordinates || { x: 200, y: 200 }
  );
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedDungeon, setSelectedDungeon] = useState<Dungeon | null>(null);
  const [dungeonAccessibility, setDungeonAccessibility] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlockedZones, setUnlockedZones] = useState<string[]>(['starter-town']);
  const [currentTerrain, setCurrentTerrain] = useState<string>('URBAN');
  const [movementSpeed, setMovementSpeed] = useState<number>(200);
  const [showCareerHub, setShowCareerHub] = useState(false);
  const [showIntegratedCareer, setShowIntegratedCareer] = useState(false);
  const [careerNotifications, setCareerNotifications] = useState<string[]>([]);
  const [activeCareerTool, setActiveCareerTool] = useState<'none' | 'profile' | 'resume' | 'jobs' | 'hub'>('none');
  const [showCareerPanel, setShowCareerPanel] = useState(false);

  useEffect(() => {
    loadMapData();
    loadPlayerPosition();
    checkDungeonAccessibility();
    checkCareerMilestones();
  }, []);

  useEffect(() => {
    checkDungeonAccessibility();
    checkCareerMilestones();
  }, [dungeons, userStats, authToken]);

  const checkCareerMilestones = () => {
    const notifications: string[] = [];
    
    // Check for career milestone achievements
    const totalTasks = Object.values(userStats.categoryStats).reduce(
      (total, category) => total + category.tasksCompleted, 0
    );
    
    if (totalTasks >= 10 && !localStorage.getItem('career-milestone-10')) {
      notifications.push('🎉 Career Milestone: 10 tasks completed! Your resume is getting stronger!');
      localStorage.setItem('career-milestone-10', 'true');
    }
    
    if (userStats.trustScore >= 50 && !localStorage.getItem('career-milestone-trust-50')) {
      notifications.push('🛡️ Trust Milestone: 50+ Trust Score! Employers love reliable candidates!');
      localStorage.setItem('career-milestone-trust-50', 'true');
    }
    
    if (userStats.currentLevel >= 5 && !localStorage.getItem('career-milestone-level-5')) {
      notifications.push('⭐ Level Milestone: Level 5 reached! Time to explore new career opportunities!');
      localStorage.setItem('career-milestone-level-5', 'true');
    }
    
    // Check for diverse experience
    const categoriesWithTasks = Object.values(userStats.categoryStats).filter(
      category => category.tasksCompleted > 0
    ).length;
    
    if (categoriesWithTasks >= 2 && !localStorage.getItem('career-milestone-diverse')) {
      notifications.push('🌟 Versatility Bonus: Experience across multiple work categories! Perfect for career growth!');
      localStorage.setItem('career-milestone-diverse', 'true');
    }
    
    setCareerNotifications(notifications);
    
    // Auto-clear notifications after 10 seconds
    if (notifications.length > 0) {
      setTimeout(() => setCareerNotifications([]), 10000);
    }
  };

  const loadPlayerPosition = async () => {
    try {
      const result = await CharacterMovementService.loadPosition(user.id);
      if (result.success && result.data) {
        setPlayerPosition(result.data.position);
        updateTerrainInfo(result.data.position);
      }
    } catch (error) {
      console.error('Error loading player position:', error);
    }
  };

  const checkDungeonAccessibility = async () => {
    if (!authToken || dungeons.length === 0) return;
    
    const accessibility: Record<string, boolean> = {};
    
    try {
      await Promise.all(
        dungeons.map(async (dungeon) => {
          try {
            const canAccess = await DungeonService.checkDungeonAccess(
              dungeon.id,
              {
                trustScore: userStats.trustScore,
                level: userStats.currentLevel,
                badges: userStats.unlockedZones
              },
              authToken
            );
            accessibility[dungeon.id] = canAccess;
          } catch (error) {
            console.error(`Error checking access for dungeon ${dungeon.id}:`, error);
            // Fallback to local check
            accessibility[dungeon.id] = checkLocalDungeonAccess(dungeon);
          }
        })
      );
    } catch (error) {
      console.error('Error checking dungeon accessibility:', error);
      // Fallback to local checks for all dungeons
      dungeons.forEach(dungeon => {
        accessibility[dungeon.id] = checkLocalDungeonAccess(dungeon);
      });
    }
    
    setDungeonAccessibility(accessibility);
  };

  const checkLocalDungeonAccess = (dungeon: Dungeon): boolean => {
    const requirements = dungeon.entryRequirements;
    
    if (requirements.trustScore && userStats.trustScore < requirements.trustScore) {
      return false;
    }
    
    if (requirements.level && userStats.currentLevel < requirements.level) {
      return false;
    }
    
    if (requirements.badges && requirements.badges.length > 0) {
      const hasAllBadges = requirements.badges.every(badge => 
        userStats.unlockedZones.includes(badge)
      );
      if (!hasAllBadges) {
        return false;
      }
    }
    
    return true;
  };

  const loadMapData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load zones from API or use default data
      const defaultZones = MapService.getDefaultZones();
      setZones(defaultZones);

      // Load dungeons from API
      try {
        const apiDungeons = await DungeonService.getAllDungeons();
        setDungeons(apiDungeons);
      } catch (dungeonError) {
        console.warn('Failed to load dungeons from API, using default data:', dungeonError);
        const defaultDungeons = MapService.getDefaultDungeons();
        setDungeons(defaultDungeons);
      }

      // Check which zones the user has unlocked
      checkUnlockedZones(defaultZones);
    } catch (err) {
      console.error('Error loading map data:', err);
      setError('Failed to load map data');
    } finally {
      setIsLoading(false);
    }
  };

  const checkUnlockedZones = (allZones: Zone[]) => {
    const unlocked = ['starter-town']; // Always start with starter town
    
    // Use actual user stats
    const userLevel = userStats.currentLevel;
    const userTrustScore = userStats.trustScore;
    const completedTasks = Object.values(userStats.categoryStats).reduce(
      (total, category) => total + category.tasksCompleted, 0
    );
    const userBadges = userStats.unlockedZones; // Simplified - in production, get actual badges

    allZones.forEach(zone => {
      if (zone.id === 'starter-town') return; // Already unlocked
      
      const { canUnlock } = MapService.checkZoneUnlockRequirements(
        zone,
        userLevel,
        userTrustScore,
        completedTasks,
        userBadges
      );
      
      if (canUnlock) {
        unlocked.push(zone.id);
      }
    });

    setUnlockedZones(unlocked);
  };

  const handlePlayerMove = useCallback(async (newPosition: Coordinates) => {
    // Validate position bounds
    if (!CharacterMovementService.isValidPosition(newPosition, { width: 2000, height: 2000 })) {
      return;
    }

    setPlayerPosition(newPosition);
    updateTerrainInfo(newPosition);
    
    // Save position with debouncing
    try {
      await CharacterMovementService.savePositionDebounced(user.id, newPosition);
    } catch (error) {
      console.error('Failed to save player position:', error);
    }
  }, [user.id]);

  const updateTerrainInfo = (position: Coordinates) => {
    const terrain = CharacterMovementService.getTerrainAtPosition(position, zones);
    setCurrentTerrain(terrain);
    
    // Update movement speed based on terrain
    const speed = CharacterMovementService.getMovementSpeed(terrain);
    setMovementSpeed(speed);
    
    // Check if player can move on this terrain
    const userBadges = userStats.unlockedZones; // Simplified - get actual badges in production
    if (!CharacterMovementService.canMoveToTerrain(terrain, userBadges)) {
      setError(`You need special equipment to traverse ${terrain.toLowerCase()} terrain!`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDungeonEnter = useCallback((dungeon: Dungeon) => {
    // All distance and accessibility checks are now handled in MapEngine
    // This function is called only when the interaction is successful
    setSelectedDungeon(dungeon);
    if (onDungeonEnter) {
      onDungeonEnter(dungeon);
    }
  }, [onDungeonEnter]);

  const handleZoneSelect = (zone: Zone) => {
    setSelectedZone(zone);
  };

  const handleZoneUnlock = (zone: Zone) => {
    if (!unlockedZones.includes(zone.id)) {
      setUnlockedZones(prev => [...prev, zone.id]);
      if (onZoneUnlock) {
        onZoneUnlock(zone);
      }
    }
  };

  const handleTaskSelect = (task: Task) => {
    if (onTaskSelect) {
      onTaskSelect(task);
    }
  };

  const getVisibleZones = (): Zone[] => {
    return zones.map(zone => ({
      ...zone,
      // Add unlock status to zone data
      unlocked: unlockedZones.includes(zone.id)
    })) as Zone[];
  };

  const getVisibleDungeons = (): Dungeon[] => {
    // Only show dungeons in unlocked zones
    return dungeons.filter(dungeon => unlockedZones.includes(dungeon.zoneId));
  };

  const getCareerProgressSummary = () => {
    const totalTasks = Object.values(userStats.categoryStats).reduce(
      (total, category) => total + category.tasksCompleted, 0
    );
    
    const strongestCategory = Object.entries(userStats.categoryStats)
      .sort(([,a], [,b]) => b.tasksCompleted - a.tasksCompleted)[0];
    
    return {
      totalTasks,
      strongestCategory: strongestCategory ? strongestCategory[0] : 'none',
      level: userStats.currentLevel,
      trustScore: userStats.trustScore,
      isCareerReady: totalTasks >= 5 && userStats.trustScore >= 25,
      canGenerateResume: totalTasks >= 3,
      canAccessJobs: userStats.trustScore >= 15
    };
  };

  const handleCareerToolOpen = (tool: 'profile' | 'resume' | 'jobs' | 'hub') => {
    setActiveCareerTool(tool);
    setShowCareerPanel(true);
  };

  const handleCareerToolClose = () => {
    setActiveCareerTool('none');
    setShowCareerPanel(false);
  };

  const renderCareerTool = () => {
    switch (activeCareerTool) {
      case 'profile':
        return <EnhancedProfileBuilder userId={user.id} />;
      case 'resume':
        return <AIResumeBuilder userId={user.id} />;
      case 'jobs':
        return <AIJobMatcher userId={user.id} />;
      case 'hub':
        return <CareerHub userId={user.id} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="map-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading the world...</p>
        </div>
      </div>
    );
  }

  if (error && zones.length === 0) {
    return (
      <div className="map-error">
        <h2>Failed to Load Map</h2>
        <p>{error}</p>
        <button onClick={loadMapData}>Retry</button>
      </div>
    );
  }

  // Show Career Hub if requested
  if (showCareerHub) {
    return (
      <div className="career-hub-container">
        <button 
          className="back-to-map-button"
          onClick={() => setShowCareerHub(false)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🗺️ Back to Map
        </button>
        <CareerHub userId={user.id} />
      </div>
    );
  }

  // Show Career Tool Panel if active
  if (showCareerPanel && activeCareerTool !== 'none') {
    return (
      <div className="career-tool-container">
        <div className="career-tool-header">
          <button 
            className="back-to-map-button"
            onClick={handleCareerToolClose}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '25px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🗺️ Back to Map
          </button>
          <div className="career-tool-title">
            {activeCareerTool === 'profile' && '👤 Profile Builder'}
            {activeCareerTool === 'resume' && '📄 AI Resume Generator'}
            {activeCareerTool === 'jobs' && '🎯 Job Matcher'}
            {activeCareerTool === 'hub' && '🚀 Career Hub'}
          </div>
        </div>
        <div className="career-tool-content">
          {renderCareerTool()}
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      {error && (
        <div className="map-error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {/* Career Notifications */}
      {careerNotifications.length > 0 && (
        <div className="career-notifications">
          {careerNotifications.map((notification, index) => (
            <div key={index} className="career-notification">
              <span>{notification}</span>
              <button onClick={() => setCareerNotifications(prev => prev.filter((_, i) => i !== index))}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Integrated Career Panel */}
      <IntegratedCareerPanel
        user={user}
        userStats={userStats}
        isOpen={showIntegratedCareer}
        onClose={() => setShowIntegratedCareer(false)}
      />
      
      {/* Career Access Buttons */}
      <div className="career-hub-access">
        {/* Integrated Career Panel Button - Primary */}
        <button 
          className="integrated-career-button"
          onClick={() => setShowIntegratedCareer(true)}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 100,
            background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
            color: '#000',
            border: '3px solid #fff',
            padding: '15px 25px',
            borderRadius: '25px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'pulse 2s infinite'
          }}
        >
          🎯 Career Tools
          <div style={{
            background: '#ff4757',
            color: '#fff',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {getCareerProgressSummary().totalTasks}
          </div>
        </button>
        
        {/* Full Career Hub Button - Secondary */}
        <button 
          className="career-hub-button"
          onClick={() => setShowCareerHub(true)}
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 100,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: '2px solid #fff',
            padding: '12px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🚀 Full Hub
        </button>
      </div>

      {/* Career Widget - Integrated career tools directly on map */}
      <CareerWidget 
        userStats={userStats}
        onToolOpen={handleCareerToolOpen}
      />
      
      {/* Movement Status Display */}
      <div className="movement-status">
        <div className="status-item">
          <span className="status-label">Terrain:</span>
          <span className={`status-value terrain-${currentTerrain.toLowerCase()}`}>
            {currentTerrain}
          </span>
        </div>
        <div className="status-item">
          <span className="status-label">Speed:</span>
          <span className="status-value">{movementSpeed}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Position:</span>
          <span className="status-value">
            ({Math.round(playerPosition.x)}, {Math.round(playerPosition.y)})
          </span>
        </div>
        <div className="status-item career-progress">
          <span className="status-label">Career:</span>
          <span className="status-value">
            L{userStats.currentLevel} • {getCareerProgressSummary().totalTasks} tasks • {userStats.trustScore} trust
          </span>
        </div>
      </div>
      
      <div className="map-content">
        <div className="map-engine-container">
          <MapEngine
            zones={getVisibleZones()}
            dungeons={getVisibleDungeons()}
            playerPosition={playerPosition}
            characterData={characterData}
            userStats={userStats}
            onPlayerMove={handlePlayerMove}
            onDungeonEnter={handleDungeonEnter}
            width={800}
            height={600}
          />
          
          {/* Movement Controls Help */}
          <div className="movement-controls">
            <h4>Movement Controls</h4>
            <div className="control-row">
              <span className="control-key">WASD / Arrows</span>
              <span className="control-desc">Move</span>
            </div>
            <div className="control-row">
              <span className="control-key">Click</span>
              <span className="control-desc">Move to</span>
            </div>
            <div className="control-row">
              <span className="control-key">Scroll</span>
              <span className="control-desc">Zoom</span>
            </div>
            <div className="control-row career-hint">
              <span className="control-key">🎯</span>
              <span className="control-desc">Career Tools - Resume, Jobs & Profile</span>
            </div>
            <div className="control-row career-hint">
              <span className="control-key">🚀</span>
              <span className="control-desc">Full Career Hub for advanced features</span>
            </div>
          </div>
        </div>
        
        <div className="map-sidebar">
          <MapUI
            zones={zones}
            selectedZone={selectedZone}
            unlockedZones={unlockedZones}
            playerPosition={playerPosition}
            user={user}
            onZoneSelect={handleZoneSelect}
            onZoneUnlock={handleZoneUnlock}
          />
          
          {/* Quick Career Widget */}
          <QuickCareerWidget
            userStats={userStats}
            onOpenCareerTools={() => setShowIntegratedCareer(true)}
            onOpenFullHub={() => setShowCareerHub(true)}
          />
        </div>
      </div>
      
      {/* Dungeon Modal System - Only for interior display */}
      {selectedDungeon && (
        <DungeonContainer
          dungeons={[selectedDungeon]}
          userPosition={playerPosition}
          userStats={{
            trustScore: userStats.trustScore,
            level: userStats.currentLevel,
            badges: userStats.unlockedZones // Simplified - use actual badges in production
          }}
          onTaskSelect={handleTaskSelect}
          authToken={authToken}
          selectedDungeon={selectedDungeon}
          onDungeonEnter={(dungeon) => {
            if (dungeon) {
              setSelectedDungeon(dungeon);
            } else {
              setSelectedDungeon(null);
            }
          }}
        />
      )}
    </div>
  );
};

export default MapContainer;