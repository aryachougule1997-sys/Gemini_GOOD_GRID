import React from 'react';
import { AccessoryItem, AccessoryType } from '../../../../shared/types';

interface AccessorySelectorProps {
  selectedAccessories: AccessoryItem[];
  availableAccessories: AccessoryItem[];
  onAccessoryToggle: (accessory: AccessoryItem) => void;
}

const AccessorySelector: React.FC<AccessorySelectorProps> = ({
  selectedAccessories,
  availableAccessories,
  onAccessoryToggle
}) => {
  const accessoryCategories: { type: AccessoryType; label: string; emoji: string; description: string }[] = [
    { type: 'HAT', label: 'Epic Headgear', emoji: '👑', description: 'Crown yourself with legendary style!' },
    { type: 'GLASSES', label: 'Vision Enhancers', emoji: '🕶️', description: 'See the future with crystal clarity!' },
    { type: 'CLOTHING', label: 'Power Armor', emoji: '🦾', description: 'Gear up for maximum impact!' },
    { type: 'TOOL', label: 'Hero Equipment', emoji: '⚡', description: 'Wield the tools of champions!' },
    { type: 'BADGE_DISPLAY', label: 'Victory Trophies', emoji: '🏆', description: 'Display your epic achievements!' }
  ];

  const isAccessorySelected = (accessory: AccessoryItem): boolean => {
    return selectedAccessories.some(selected => selected.id === accessory.id);
  };

  const getAccessoriesByType = (type: AccessoryType): AccessoryItem[] => {
    return availableAccessories.filter(accessory => accessory.type === type);
  };

  return (
    <div className="accessory-selector">
      <h3>Accessories</h3>

      {accessoryCategories.map(category => {
        const accessories = getAccessoriesByType(category.type);

        if (accessories.length === 0) return null;

        return (
          <div key={category.type} className="accessory-category">
            <h4>{category.emoji} {category.label}</h4>
            <p className="category-description">{category.description}</p>
            <div className="accessory-grid">
              {accessories.map(accessory => (
                <button
                  key={accessory.id}
                  className={`accessory-item ${isAccessorySelected(accessory) ? 'selected' : ''}`}
                  onClick={() => onAccessoryToggle(accessory)}
                  title={accessory.name}
                >
                  <div className="accessory-icon">
                    {getAccessoryIcon(accessory.type)}
                  </div>
                  <span className="accessory-name">{accessory.name}</span>
                  {isAccessorySelected(accessory) && (
                    <div className="equipped-badge">✨ Equipped</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {availableAccessories.length === 0 && (
        <div className="no-accessories">
          <div className="no-accessories-icon">🎁</div>
          <p>🌟 Treasure Chest Awaits! 🌟</p>
          <p>Embark on epic quests and complete thrilling challenges to unlock incredible gear and legendary accessories for your hero!</p>
        </div>
      )}
    </div>
  );
};

const getAccessoryIcon = (type: AccessoryType): string => {
  switch (type) {
    case 'HAT':
      return '🎩';
    case 'GLASSES':
      return '👓';
    case 'CLOTHING':
      return '👕';
    case 'TOOL':
      return '🔧';
    case 'BADGE_DISPLAY':
      return '🏆';
    default:
      return '📦';
  }
};

export default AccessorySelector;