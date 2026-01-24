import React from 'react';
import { SpriteType } from '../../../../shared/types';

interface SpriteTypeSelectorProps {
  selectedSpriteType: SpriteType;
  onSpriteTypeChange: (spriteType: SpriteType) => void;
}

const SpriteTypeSelector: React.FC<SpriteTypeSelectorProps> = ({
  selectedSpriteType,
  onSpriteTypeChange
}) => {
  const spriteTypes: { type: SpriteType; label: string; description: string; emoji: string }[] = [
    {
      type: 'DEFAULT',
      label: 'Legendary Hero',
      description: '⚔️ Master of all trades! Ready to conquer any challenge with courage and determination!',
      emoji: '🦸‍♂️'
    },
    {
      type: 'CASUAL',
      label: 'Cool Adventurer',
      description: '🌟 Effortlessly awesome! Tackles quests with style and a laid-back attitude that wins hearts!',
      emoji: '😎'
    },
    {
      type: 'PROFESSIONAL',
      label: 'Elite Executive',
      description: '💼 Corporate superhero! Dominates boardrooms and battlefields with unmatched leadership skills!',
      emoji: '👑'
    },
    {
      type: 'CREATIVE',
      label: 'Visionary Artist',
      description: '🎨 Imagination unleashed! Paints the world with brilliant ideas and transforms dreams into reality!',
      emoji: '✨'
    }
  ];

  return (
    <div className="sprite-type-selector">
      <h3>Character Style</h3>
      <div className="sprite-type-grid">
        {spriteTypes.map(sprite => (
          <button
            key={sprite.type}
            className={`sprite-type-option ${selectedSpriteType === sprite.type ? 'selected' : ''}`}
            onClick={() => onSpriteTypeChange(sprite.type)}
          >
            <div className="sprite-type-preview">
              {sprite.emoji}
            </div>
            <div className="sprite-type-info">
              <h4>{sprite.label}</h4>
              <p>{sprite.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpriteTypeSelector;