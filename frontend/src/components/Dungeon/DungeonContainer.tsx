import React, { useState, useEffect } from 'react';
import { Dungeon, Task, Point } from '../../../../shared/types';
import { DungeonService } from '../../services/dungeonService';
import DungeonIcon from './DungeonIcon';
import DungeonInterior from './DungeonInterior';
import './Dungeon.css';

interface DungeonContainerProps {
  dungeons: Dungeon[];
  userPosition: Point;
  userStats: {
    trustScore: number;
    level: number;
    badges: string[];
  };
  onTaskSelect: (task: Task) => void;
  authToken?: string;
  selectedDungeon?: Dungeon | null;
  onDungeonEnter?: (dungeon: Dungeon) => void;
}

const DungeonContainer: React.FC<DungeonContainerProps> = ({
  dungeons,
  userPosition,
  userStats,
  onTaskSelect,
  authToken,
  selectedDungeon: externalSelectedDungeon,
  onDungeonEnter
}) => {
  const [internalSelectedDungeon, setInternalSelectedDungeon] = useState<Dungeon | null>(null);
  const [dungeonAccessibility, setDungeonAccessibility] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Use external selectedDungeon if provided, otherwise use internal state
  const selectedDungeon = externalSelectedDungeon !== undefined ? externalSelectedDungeon : internalSelectedDungeon;
  const setSelectedDungeon = externalSelectedDungeon !== undefined ? 
    (dungeon: Dungeon | null) => onDungeonEnter?.(dungeon!) : 
    setInternalSelectedDungeon;

  useEffect(() => {
    checkDungeonAccessibility();
  }, [dungeons, userStats, authToken]);

  const checkDungeonAccessibility = async () => {
    if (!authToken) return;
    
    setLoading(true);
    const accessibility: Record<string, boolean> = {};
    
    try {
      await Promise.all(
        dungeons.map(async (dungeon) => {
          try {
            const canAccess = await DungeonService.checkDungeonAccess(
              dungeon.id,
              userStats,
              authToken
            );
            accessibility[dungeon.id] = canAccess;
          } catch (error) {
            console.error(`Error checking access for dungeon ${dungeon.id}:`, error);
            // Fallback to local check
            accessibility[dungeon.id] = checkLocalAccess(dungeon);
          }
        })
      );
    } catch (error) {
      console.error('Error checking dungeon accessibility:', error);
      // Fallback to local checks for all dungeons
      dungeons.forEach(dungeon => {
        accessibility[dungeon.id] = checkLocalAccess(dungeon);
      });
    }
    
    setDungeonAccessibility(accessibility);
    setLoading(false);
  };

  const checkLocalAccess = (dungeon: Dungeon): boolean => {
    const requirements = dungeon.entryRequirements;
    
    if (requirements.trustScore && userStats.trustScore < requirements.trustScore) {
      return false;
    }
    
    if (requirements.level && userStats.level < requirements.level) {
      return false;
    }
    
    if (requirements.badges && requirements.badges.length > 0) {
      const hasAllBadges = requirements.badges.every(badge => 
        userStats.badges.includes(badge)
      );
      if (!hasAllBadges) {
        return false;
      }
    }
    
    return true;
  };

  const handleExitDungeon = () => {
    setSelectedDungeon(null);
  };

  const handleTaskSelect = (task: Task) => {
    onTaskSelect(task);
    // Optionally close dungeon after task selection
    // setSelectedDungeon(null);
  };

  // Group dungeons by category for better organization
  const dungeonsByCategory = dungeons.reduce((acc, dungeon) => {
    if (!acc[dungeon.type]) {
      acc[dungeon.type] = [];
    }
    acc[dungeon.type].push(dungeon);
    return acc;
  }, {} as Record<string, Dungeon[]>);

  if (selectedDungeon) {
    return (
      <DungeonInterior
        dungeon={selectedDungeon}
        onExit={handleExitDungeon}
        onTaskSelect={handleTaskSelect}
        userStats={userStats}
      />
    );
  }

  return (
    <div className="dungeon-container">
      {loading && (
        <div className="dungeon-loading">
          Checking dungeon accessibility...
        </div>
      )}
      
      {/* All dungeon interactions are now handled in MapEngine Phaser scene */}
      
      {/* Category legend */}
      <div className="dungeon-legend">
        <h4>Dungeon Types</h4>
        {Object.entries(dungeonsByCategory).map(([category, categoryDungeons]) => {
          const categoryInfo = DungeonService.getCategoryInfo(category as any);
          return (
            <div key={category} className="legend-item">
              <span className="legend-icon">{categoryInfo.icon}</span>
              <span className="legend-name">{categoryInfo.name}</span>
              <span className="legend-count">({categoryDungeons.length})</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DungeonContainer;