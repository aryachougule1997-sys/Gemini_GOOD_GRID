import React from 'react';
import { ColorScheme } from '../../../../shared/types';

interface ColorPickerProps {
  colorScheme: ColorScheme;
  onColorChange: (colorScheme: ColorScheme) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ colorScheme, onColorChange }) => {
  const predefinedColors = [
    '#FFB6C1', '#FFA07A', '#98FB98', '#87CEEB', '#DDA0DD',
    '#F0E68C', '#FF6347', '#40E0D0', '#EE82EE', '#90EE90',
    '#FFD700', '#FF69B4', '#00CED1', '#9370DB', '#32CD32'
  ];

  const handleColorChange = (colorType: keyof ColorScheme, color: string) => {
    onColorChange({
      ...colorScheme,
      [colorType]: color
    });
  };

  return (
    <div className="color-picker">
      <h3>Character Colors</h3>
      
      <div className="color-section">
        <label htmlFor="primary-color">Skin Color:</label>
        <div className="color-options">
          <input
            id="primary-color"
            type="color"
            value={colorScheme.primary}
            onChange={(e) => handleColorChange('primary', e.target.value)}
            className="color-input"
          />
          <div className="preset-colors">
            {predefinedColors.slice(0, 5).map((color, index) => (
              <button
                key={`primary-${index}`}
                className="color-preset"
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange('primary', color)}
                title={`Skin color ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="color-section">
        <label htmlFor="secondary-color">Shirt Color:</label>
        <div className="color-options">
          <input
            id="secondary-color"
            type="color"
            value={colorScheme.secondary}
            onChange={(e) => handleColorChange('secondary', e.target.value)}
            className="color-input"
          />
          <div className="preset-colors">
            {predefinedColors.slice(5, 10).map((color, index) => (
              <button
                key={`secondary-${index}`}
                className="color-preset"
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange('secondary', color)}
                title={`Shirt color ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="color-section">
        <label htmlFor="accent-color">Pants Color:</label>
        <div className="color-options">
          <input
            id="accent-color"
            type="color"
            value={colorScheme.accent}
            onChange={(e) => handleColorChange('accent', e.target.value)}
            className="color-input"
          />
          <div className="preset-colors">
            {predefinedColors.slice(10, 15).map((color, index) => (
              <button
                key={`accent-${index}`}
                className="color-preset"
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange('accent', color)}
                title={`Pants color ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;