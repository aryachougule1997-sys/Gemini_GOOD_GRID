import React, { useState } from 'react';
import { Zone, Dungeon, User, CharacterData as GameCharacterData, UserStats, Task } from '../../../shared/types';
import MapContainer from '../components/Map/MapContainer';
import QuickNav from '../components/Navigation/QuickNav';

interface MapPageProps {
  user: User;
  characterData: GameCharacterData;
  userStats: UserStats;
  onNavigateToCharacterCreation?: () => void;
  onNavigateToDungeon?: (dungeon: Dungeon) => void;
  onTaskSelect?: (task: Task) => void;
  onNavigateToCareer?: () => void;
  authToken?: string;
}

const MapPage: React.FC<MapPageProps> = ({
  user,
  characterData,
  userStats,
  onNavigateToCharacterCreation,
  onNavigateToDungeon,
  onTaskSelect,
  onNavigateToCareer,
  authToken
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const handleDungeonEnter = (dungeon: Dungeon) => {
    console.log('Entering dungeon:', dungeon);
    
    // Show entry message
    setCelebrationMessage(`🏰 Entering ${dungeon.name}! 🏰`);
    setShowCelebration(true);
    
    setTimeout(() => {
      setShowCelebration(false);
      if (onNavigateToDungeon) {
        onNavigateToDungeon(dungeon);
      }
    }, 2000);
  };

  const handleZoneUnlock = (zone: Zone) => {
    console.log('Zone unlocked:', zone);
    
    // Show unlock celebration
    setCelebrationMessage(`🎉 ${zone.name} Unlocked! 🎉`);
    setShowCelebration(true);
    
    setTimeout(() => {
      setShowCelebration(false);
    }, 3000);
  };

  const handleTaskSelect = (task: Task) => {
    console.log('Task selected:', task);
    if (onTaskSelect) {
      onTaskSelect(task);
    }
  };

  return (
    <div className="map-page">
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <h2>{celebrationMessage}</h2>
            <div className="celebration-animation">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="celebration-particle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    backgroundColor: ['#00ff88', '#ff6b6b', '#45b7d1', '#feca57', '#8a2be2'][Math.floor(Math.random() * 5)]
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      <QuickNav
        onNavigateToCharacter={onNavigateToCharacterCreation}
        onNavigateToCareer={onNavigateToCareer}
        currentPage="map"
      />
      
      <MapContainer
        user={user}
        characterData={characterData}
        userStats={userStats}
        onDungeonEnter={handleDungeonEnter}
        onZoneUnlock={handleZoneUnlock}
        onTaskSelect={handleTaskSelect}
        authToken={authToken}
      />
    </div>
  );
};

export default MapPage;