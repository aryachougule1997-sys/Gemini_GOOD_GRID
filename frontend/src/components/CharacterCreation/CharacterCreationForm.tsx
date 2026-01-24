import React, { useState, useCallback, useEffect } from 'react';
import { CharacterData, ColorScheme, AccessoryItem, SpriteType } from '../../../../shared/types';
import CharacterCanvas from './CharacterCanvas';
import ColorPicker from './ColorPicker';
import AccessorySelector from './AccessorySelector';
import SpriteTypeSelector from './SpriteTypeSelector';

interface CharacterCreationFormProps {
  initialCharacterData?: Partial<CharacterData>;
  availableAccessories?: AccessoryItem[];
  onSave: (characterData: CharacterData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const CharacterCreationForm: React.FC<CharacterCreationFormProps> = ({
  initialCharacterData,
  availableAccessories = [],
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [characterData, setCharacterData] = useState<CharacterData>({
    baseSprite: initialCharacterData?.baseSprite || 'DEFAULT',
    colorPalette: initialCharacterData?.colorPalette || {
      primary: '#FFB6C1',
      secondary: '#87CEEB',
      accent: '#98FB98'
    },
    accessories: initialCharacterData?.accessories || [],
    unlockedItems: initialCharacterData?.unlockedItems || []
  });

  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger confetti when character changes significantly
  useEffect(() => {
    if (characterData.accessories.length > 0) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [characterData.accessories.length]);

  const handleColorChange = useCallback((colorScheme: ColorScheme) => {
    setCharacterData(prev => ({
      ...prev,
      colorPalette: colorScheme
    }));
  }, []);

  const handleSpriteTypeChange = useCallback((spriteType: SpriteType) => {
    setCharacterData(prev => ({
      ...prev,
      baseSprite: spriteType
    }));
  }, []);

  const handleAccessoryToggle = useCallback((accessory: AccessoryItem) => {
    setCharacterData(prev => {
      const isSelected = prev.accessories.some(selected => selected.id === accessory.id);
      
      if (isSelected) {
        // Remove accessory
        return {
          ...prev,
          accessories: prev.accessories.filter(selected => selected.id !== accessory.id)
        };
      } else {
        // Add accessory (limit to one per type for simplicity)
        const filteredAccessories = prev.accessories.filter(
          selected => selected.type !== accessory.type
        );
        return {
          ...prev,
          accessories: [...filteredAccessories, accessory]
        };
      }
    });
  }, []);

  const handleSave = () => {
    onSave(characterData);
  };

  const handleReset = () => {
    setCharacterData({
      baseSprite: 'DEFAULT',
      colorPalette: {
        primary: '#FFB6C1',
        secondary: '#87CEEB',
        accent: '#98FB98'
      },
      accessories: [],
      unlockedItems: []
    });
  };

  const getStyleDescription = (spriteType: SpriteType): string => {
    switch (spriteType) {
      case 'PROFESSIONAL': return '👑 Elite Executive';
      case 'CREATIVE': return '✨ Visionary Artist';
      case 'CASUAL': return '😎 Cool Adventurer';
      default: return '🦸‍♂️ Legendary Hero';
    }
  };

  return (
    <div className="character-creation-form">
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][Math.floor(Math.random() * 5)]
            }} />
          ))}
        </div>
      )}
      
      <div className="character-creation-header">
        <h2>🌟 HERO CREATOR SUPREME 🌟</h2>
        <p>🚀 Forge your legendary avatar and embark on epic adventures! 🚀</p>
        <div className="demo-mode-indicator">
          ✨ Demo Mode - No backend required! ✨
        </div>
      </div>

      <div className="character-creation-content">
        <div className="character-preview-section">
          <h3>✨ Preview ✨</h3>
          <div className="canvas-container">
            <CharacterCanvas 
              characterData={characterData}
              width={280}
              height={280}
              scale={6}
            />
          </div>
          <div className="preview-info">
            <p><strong>🎭 Style:</strong> {getStyleDescription(characterData.baseSprite)}</p>
            <p><strong>⚔️ Gear:</strong> {characterData.accessories.length} epic items equipped</p>
            <p><strong>⚡ Power Level:</strong> {Math.max(1, characterData.accessories.length * 15 + 25)} ⭐</p>
          </div>
        </div>

        <div className="character-customization-section">
          <SpriteTypeSelector
            selectedSpriteType={characterData.baseSprite}
            onSpriteTypeChange={handleSpriteTypeChange}
          />

          <ColorPicker
            colorScheme={characterData.colorPalette}
            onColorChange={handleColorChange}
          />

          <AccessorySelector
            selectedAccessories={characterData.accessories}
            availableAccessories={availableAccessories}
            onAccessoryToggle={handleAccessoryToggle}
          />
        </div>
      </div>

      <div className="character-creation-actions">
        <button
          type="button"
          onClick={handleReset}
          className="reset-button"
          disabled={isLoading}
        >
          🔄 Reset
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={isLoading}
          >
            ❌ Cancel
          </button>
        )}
        
        <button
          type="button"
          onClick={handleSave}
          className="save-button"
          disabled={isLoading}
        >
          {isLoading ? '✨ Creating Legend...' : '🚀 Launch Hero'}
        </button>
      </div>
    </div>
  );
};

export default CharacterCreationForm;