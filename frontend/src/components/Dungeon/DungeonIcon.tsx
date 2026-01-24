import React from 'react';
import { Dungeon, WorkCategory, Point } from '../../../../shared/types';
import { DungeonService } from '../../services/dungeonService';
import './Dungeon.css';

interface DungeonIconProps {
  dungeon: Dungeon;
  userPosition: Point;
  isAccessible: boolean;
  onClick: (dungeon: Dungeon) => void;
  scale?: number;
}

const DungeonIcon: React.FC<DungeonIconProps> = ({
  dungeon,
  userPosition,
  isAccessible,
  onClick,
  scale = 1
}) => {
  const categoryInfo = DungeonService.getCategoryInfo(dungeon.type);
  const isInRange = DungeonService.isWithinInteractionRange(userPosition, dungeon.coordinates);
  const spriteUrl = DungeonService.getDungeonSpriteUrl(dungeon.type, dungeon.spriteAsset);

  const handleClick = () => {
    if (isAccessible && isInRange) {
      onClick(dungeon);
    }
  };

  const iconStyle = {
    transform: `scale(${scale})`,
    filter: isAccessible ? 'none' : 'grayscale(100%) opacity(0.5)',
    cursor: isAccessible && isInRange ? 'pointer' : 'default'
  };

  return (
    <div 
      className={`dungeon-icon ${dungeon.type.toLowerCase()} ${isInRange ? 'in-range' : ''} ${isAccessible ? 'accessible' : 'locked'}`}
      style={iconStyle}
      onClick={handleClick}
      title={`${dungeon.name} - ${categoryInfo.name}`}
    >
      {/* Dungeon sprite */}
      <div className="dungeon-sprite">
        <img 
          src={spriteUrl} 
          alt={dungeon.name}
          onError={(e) => {
            // Fallback to emoji if image fails to load
            const target = e.currentTarget as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              const emojiElement = parent.querySelector('.dungeon-emoji') as HTMLElement;
              if (emojiElement) {
                target.style.display = 'none';
                emojiElement.style.display = 'flex';
              }
            }
          }}
        />
        <div className="dungeon-emoji" style={{ display: 'none' }}>
          {categoryInfo.icon}
        </div>
      </div>

      {/* Dungeon name */}
      <div className="dungeon-name">
        {dungeon.name}
      </div>

      {/* Task count indicator */}
      {dungeon.availableTasks && dungeon.availableTasks.length > 0 && (
        <div className="task-count-badge">
          {dungeon.availableTasks.length}
        </div>
      )}

      {/* Access indicator */}
      {!isAccessible && (
        <div className="lock-indicator">
          🔒
        </div>
      )}

      {/* Interaction hint */}
      {isInRange && isAccessible && (
        <div className="interaction-hint">
          Click to enter
        </div>
      )}

      {/* Special features indicator */}
      {dungeon.specialFeatures && dungeon.specialFeatures.length > 0 && (
        <div className="special-features-indicator">
          ✨
        </div>
      )}
    </div>
  );
};

export default DungeonIcon;