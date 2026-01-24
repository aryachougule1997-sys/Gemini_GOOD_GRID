import React from 'react';
import { Zone, Coordinates, User } from '../../../../shared/types';
import { MapService } from '../../services/mapService';

interface MapUIProps {
  zones: Zone[];
  selectedZone: Zone | null;
  unlockedZones: string[];
  playerPosition: Coordinates;
  user: User;
  onZoneSelect: (zone: Zone) => void;
  onZoneUnlock: (zone: Zone) => void;
}

const MapUI: React.FC<MapUIProps> = ({
  zones,
  selectedZone,
  unlockedZones,
  playerPosition,
  user,
  onZoneSelect,
  onZoneUnlock
}) => {
  // Mock user stats for demo
  const userLevel = 5;
  const userTrustScore = 60;
  const completedTasks = 12;
  const userBadges = ['water-walker', 'community-helper'];

  const renderZoneCard = (zone: Zone) => {
    const isUnlocked = unlockedZones.includes(zone.id);
    const { canUnlock, missingRequirements } = MapService.checkZoneUnlockRequirements(
      zone,
      userLevel,
      userTrustScore,
      completedTasks,
      userBadges
    );

    return (
      <div
        key={zone.id}
        className={`zone-card ${isUnlocked ? 'unlocked' : 'locked'} ${
          selectedZone?.id === zone.id ? 'selected' : ''
        }`}
        onClick={() => onZoneSelect(zone)}
      >
        <div className="zone-header">
          <h3>{zone.name}</h3>
          <div className="zone-status">
            {isUnlocked ? (
              <span className="status-unlocked">✅ Unlocked</span>
            ) : canUnlock ? (
              <button
                className="unlock-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onZoneUnlock(zone);
                }}
              >
                🔓 Unlock Now
              </button>
            ) : (
              <span className="status-locked">🔒 Locked</span>
            )}
          </div>
        </div>

        <div className="zone-info">
          <div className="zone-terrain">
            <span
              className="terrain-indicator"
              style={{ backgroundColor: MapService.getTerrainColor(zone.terrainType) }}
            />
            <span>{zone.terrainType}</span>
          </div>
          
          <div className="zone-difficulty">
            <span
              className="difficulty-indicator"
              style={{ backgroundColor: MapService.getDifficultyColor(zone.difficulty) }}
            />
            <span>{zone.difficulty}</span>
          </div>
        </div>

        {!isUnlocked && !canUnlock && (
          <div className="zone-requirements">
            <h4>Requirements:</h4>
            <ul>
              {missingRequirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {isUnlocked && (
          <div className="zone-stats">
            <p>📍 Coordinates: ({zone.coordinates.minX}, {zone.coordinates.minY})</p>
            <p>📏 Size: {zone.coordinates.maxX - zone.coordinates.minX} × {zone.coordinates.maxY - zone.coordinates.minY}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="map-ui">
      <div className="map-header">
        <h2>🗺️ World Map</h2>
        <div className="demo-mode-indicator">
          ✨ Demo Mode - Explore freely! ✨
        </div>
        <div className="player-info">
          <p>📍 Position: ({Math.round(playerPosition.x)}, {Math.round(playerPosition.y)})</p>
          <p>⭐ Level: {userLevel}</p>
          <p>🛡️ Trust Score: {userTrustScore}</p>
        </div>
      </div>

      <div className="map-controls">
        <h3>🎮 Controls</h3>
        <div className="controls-grid">
          <div className="control-item">
            <span className="control-key">WASD / Arrow Keys</span>
            <span className="control-desc">Move character</span>
          </div>
          <div className="control-item">
            <span className="control-key">Mouse Click</span>
            <span className="control-desc">Move to location</span>
          </div>
          <div className="control-item">
            <span className="control-key">Mouse Wheel</span>
            <span className="control-desc">Zoom in/out</span>
          </div>
          <div className="control-item">
            <span className="control-key">Click Dungeon</span>
            <span className="control-desc">Enter dungeon</span>
          </div>
        </div>
      </div>

      <div className="zones-list">
        <h3>🌍 Zones ({unlockedZones.length}/{zones.length} unlocked)</h3>
        <div className="zones-container">
          {zones.map(renderZoneCard)}
        </div>
      </div>

      {selectedZone && (
        <div className="zone-details">
          <h3>📋 Zone Details</h3>
          <div className="zone-detail-content">
            <h4>{selectedZone.name}</h4>
            <p><strong>Terrain:</strong> {selectedZone.terrainType}</p>
            <p><strong>Difficulty:</strong> {selectedZone.difficulty}</p>
            <p><strong>Area:</strong> {
              (selectedZone.coordinates.maxX - selectedZone.coordinates.minX) *
              (selectedZone.coordinates.maxY - selectedZone.coordinates.minY)
            } sq units</p>
            
            {selectedZone.unlockRequirements && Object.keys(selectedZone.unlockRequirements).length > 0 && (
              <div className="unlock-requirements">
                <h5>Unlock Requirements:</h5>
                {selectedZone.unlockRequirements.level && (
                  <p>• Level {selectedZone.unlockRequirements.level}+</p>
                )}
                {selectedZone.unlockRequirements.trustScore && (
                  <p>• Trust Score {selectedZone.unlockRequirements.trustScore}+</p>
                )}
                {selectedZone.unlockRequirements.completedTasks && (
                  <p>• {selectedZone.unlockRequirements.completedTasks}+ completed tasks</p>
                )}
                {selectedZone.unlockRequirements.specificBadges && (
                  <p>• Badges: {selectedZone.unlockRequirements.specificBadges.join(', ')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="map-legend">
        <h3>🎨 Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#3498db' }}></div>
            <span>Freelance Tower</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#27ae60' }}></div>
            <span>Community Garden</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#7f8c8d' }}></div>
            <span>Corporate Castle</span>
          </div>
        </div>
        
        <div className="terrain-legend">
          <h4>Terrain Types:</h4>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#666666' }}></div>
            <span>Urban</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#228B22' }}></div>
            <span>Forest</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#8B7355' }}></div>
            <span>Mountain</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4169E1' }}></div>
            <span>Water</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#F4A460' }}></div>
            <span>Desert</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapUI;