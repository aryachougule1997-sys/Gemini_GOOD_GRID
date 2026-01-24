import React, { useRef, useEffect } from 'react';
import { CharacterData, ColorScheme, AccessoryItem } from '../../../../shared/types';

interface CharacterCanvasProps {
  characterData: CharacterData;
  width?: number;
  height?: number;
  scale?: number;
}

const CharacterCanvas: React.FC<CharacterCanvasProps> = ({
  characterData,
  width = 200,
  height = 200,
  scale = 4
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Disable image smoothing for pixelated effect
    ctx.imageSmoothingEnabled = false;
    
    renderCharacter(ctx, characterData, width, height, scale);
  }, [characterData, width, height, scale]);

  const renderCharacter = (
    ctx: CanvasRenderingContext2D,
    character: CharacterData,
    canvasWidth: number,
    canvasHeight: number,
    pixelScale: number
  ) => {
    const baseSize = 16; // Base sprite size in pixels
    const scaledSize = baseSize * pixelScale;
    const offsetX = (canvasWidth - scaledSize) / 2;
    const offsetY = (canvasHeight - scaledSize) / 2;

    // Draw base character sprite
    drawBaseSprite(ctx, character.baseSprite, character.colorPalette, offsetX, offsetY, pixelScale);
    
    // Draw accessories in order
    character.accessories.forEach(accessory => {
      drawAccessory(ctx, accessory, character.colorPalette, offsetX, offsetY, pixelScale);
    });
  };

  const drawBaseSprite = (
    ctx: CanvasRenderingContext2D,
    spriteType: string,
    colors: ColorScheme,
    x: number,
    y: number,
    scale: number
  ) => {
    const pixelSize = scale;
    
    // Add subtle shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 7 * pixelSize, y + 16 * pixelSize, 2 * pixelSize, pixelSize);
    
    // Head (6x6 pixels) with shading - larger and more detailed
    ctx.fillStyle = colors.primary;
    ctx.fillRect(x + 5 * pixelSize, y + 2 * pixelSize, 6 * pixelSize, 6 * pixelSize);
    
    // Head highlight
    ctx.fillStyle = lightenColor(colors.primary, 20);
    ctx.fillRect(x + 5 * pixelSize, y + 2 * pixelSize, 3 * pixelSize, 3 * pixelSize);
    
    // Eyes (2x2 pixels each) with sparkle - larger eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 6 * pixelSize, y + 4 * pixelSize, 1.5 * pixelSize, 1.5 * pixelSize);
    ctx.fillRect(x + 8.5 * pixelSize, y + 4 * pixelSize, 1.5 * pixelSize, 1.5 * pixelSize);
    
    // Eye sparkles
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 6 * pixelSize, y + 4 * pixelSize, pixelSize/2, pixelSize/2);
    ctx.fillRect(x + 8.5 * pixelSize, y + 4 * pixelSize, pixelSize/2, pixelSize/2);
    
    // Mouth - more detailed
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 7 * pixelSize, y + 6.5 * pixelSize, 2 * pixelSize, pixelSize/2);
    
    // Body (6x8 pixels) with shading - larger body
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(x + 5 * pixelSize, y + 8 * pixelSize, 6 * pixelSize, 8 * pixelSize);
    
    // Body highlight
    ctx.fillStyle = lightenColor(colors.secondary, 15);
    ctx.fillRect(x + 5 * pixelSize, y + 8 * pixelSize, 3 * pixelSize, 4 * pixelSize);
    
    // Body details based on sprite type
    if (spriteType === 'PROFESSIONAL') {
      // Tie
      ctx.fillStyle = '#333333';
      ctx.fillRect(x + 7 * pixelSize, y + 9 * pixelSize, 2 * pixelSize, 5 * pixelSize);
      // Tie highlight
      ctx.fillStyle = '#555555';
      ctx.fillRect(x + 7 * pixelSize, y + 9 * pixelSize, pixelSize, 2.5 * pixelSize);
    } else if (spriteType === 'CREATIVE') {
      // Paint splashes
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(x + 6 * pixelSize, y + 10 * pixelSize, pixelSize, pixelSize);
      ctx.fillStyle = '#4ecdc4';
      ctx.fillRect(x + 8.5 * pixelSize, y + 11 * pixelSize, pixelSize, pixelSize);
      ctx.fillStyle = '#feca57';
      ctx.fillRect(x + 7 * pixelSize, y + 13 * pixelSize, pixelSize, pixelSize);
    } else if (spriteType === 'CASUAL') {
      // Casual shirt pattern
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6 * pixelSize, y + 9 * pixelSize, pixelSize, pixelSize);
      ctx.fillRect(x + 8.5 * pixelSize, y + 9 * pixelSize, pixelSize, pixelSize);
      ctx.fillRect(x + 7.25 * pixelSize, y + 12 * pixelSize, pixelSize, pixelSize);
    } else {
      // Default - simple chest detail
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 6.5 * pixelSize, y + 10 * pixelSize, 3 * pixelSize, pixelSize);
    }
    
    // Arms (3x6 pixels each) with shading - larger arms
    ctx.fillStyle = colors.primary;
    ctx.fillRect(x + 2 * pixelSize, y + 9 * pixelSize, 3 * pixelSize, 6 * pixelSize);
    ctx.fillRect(x + 11 * pixelSize, y + 9 * pixelSize, 3 * pixelSize, 6 * pixelSize);
    
    // Arm highlights
    ctx.fillStyle = lightenColor(colors.primary, 20);
    ctx.fillRect(x + 2 * pixelSize, y + 9 * pixelSize, 1.5 * pixelSize, 3 * pixelSize);
    ctx.fillRect(x + 11 * pixelSize, y + 9 * pixelSize, 1.5 * pixelSize, 3 * pixelSize);
    
    // Legs (3x6 pixels each) with shading - larger legs
    ctx.fillStyle = colors.accent;
    ctx.fillRect(x + 5.5 * pixelSize, y + 16 * pixelSize, 2.5 * pixelSize, 6 * pixelSize);
    ctx.fillRect(x + 8 * pixelSize, y + 16 * pixelSize, 2.5 * pixelSize, 6 * pixelSize);
    
    // Leg highlights
    ctx.fillStyle = lightenColor(colors.accent, 15);
    ctx.fillRect(x + 5.5 * pixelSize, y + 16 * pixelSize, 1.25 * pixelSize, 3 * pixelSize);
    ctx.fillRect(x + 8 * pixelSize, y + 16 * pixelSize, 1.25 * pixelSize, 3 * pixelSize);
    
    // Feet - more detailed
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + 5 * pixelSize, y + 21.5 * pixelSize, 3 * pixelSize, 1.5 * pixelSize);
    ctx.fillRect(x + 8 * pixelSize, y + 21.5 * pixelSize, 3 * pixelSize, 1.5 * pixelSize);
  };

  const lightenColor = (color: string, percent: number): string => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const drawAccessory = (
    ctx: CanvasRenderingContext2D,
    accessory: AccessoryItem,
    colors: ColorScheme,
    x: number,
    y: number,
    scale: number
  ) => {
    const pixelSize = scale;
    
    switch (accessory.type) {
      case 'HAT':
        // Detailed hat with shading
        ctx.fillStyle = '#8B4513'; // Brown hat
        ctx.fillRect(x + 4 * pixelSize, y + 1 * pixelSize, 8 * pixelSize, 2.5 * pixelSize);
        // Hat highlight
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(x + 4 * pixelSize, y + 1 * pixelSize, 4 * pixelSize, 1.25 * pixelSize);
        // Hat band
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + 4 * pixelSize, y + 3 * pixelSize, 8 * pixelSize, pixelSize/2);
        break;
      case 'GLASSES':
        // Detailed glasses with frames
        ctx.fillStyle = '#333333';
        // Left lens frame
        ctx.fillRect(x + 5.5 * pixelSize, y + 3.5 * pixelSize, 2.5 * pixelSize, 2.5 * pixelSize);
        // Right lens frame
        ctx.fillRect(x + 8 * pixelSize, y + 3.5 * pixelSize, 2.5 * pixelSize, 2.5 * pixelSize);
        // Bridge
        ctx.fillStyle = '#666666';
        ctx.fillRect(x + 7.5 * pixelSize, y + 4.5 * pixelSize, pixelSize, pixelSize/2);
        // Lenses (transparent effect)
        ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
        ctx.fillRect(x + 6 * pixelSize, y + 4 * pixelSize, 1.5 * pixelSize, 1.5 * pixelSize);
        ctx.fillRect(x + 8.5 * pixelSize, y + 4 * pixelSize, 1.5 * pixelSize, 1.5 * pixelSize);
        break;
      case 'TOOL':
        // Detailed tool with handle and head
        ctx.fillStyle = '#654321'; // Handle
        ctx.fillRect(x + 12 * pixelSize, y + 11 * pixelSize, 1.5 * pixelSize, 4 * pixelSize);
        // Tool head
        ctx.fillStyle = '#C0C0C0'; // Silver
        ctx.fillRect(x + 11.5 * pixelSize, y + 9.5 * pixelSize, 2.5 * pixelSize, 1.5 * pixelSize);
        // Tool highlight
        ctx.fillStyle = '#E5E5E5';
        ctx.fillRect(x + 11.5 * pixelSize, y + 9.5 * pixelSize, 1.25 * pixelSize, pixelSize/2);
        break;
      case 'CLOTHING':
        // Cape or additional clothing
        ctx.fillStyle = '#800080'; // Purple cape
        ctx.fillRect(x + 3.5 * pixelSize, y + 8 * pixelSize, 1.5 * pixelSize, 6 * pixelSize);
        ctx.fillRect(x + 11 * pixelSize, y + 8 * pixelSize, 1.5 * pixelSize, 6 * pixelSize);
        break;
      case 'BADGE_DISPLAY':
        // Badge on chest
        ctx.fillStyle = '#FFD700'; // Gold badge
        ctx.fillRect(x + 6.5 * pixelSize, y + 10 * pixelSize, 3 * pixelSize, 2.5 * pixelSize);
        // Badge star
        ctx.fillStyle = '#FFA500';
        ctx.fillRect(x + 7.5 * pixelSize, y + 10.5 * pixelSize, pixelSize, pixelSize);
        break;
      default:
        break;
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      data-testid="character-canvas"
      style={{
        border: '6px solid #333',
        borderRadius: '15px',
        imageRendering: 'pixelated',
        background: 'linear-gradient(145deg, #87CEEB, #98FB98)',
        boxShadow: `
          0 0 20px rgba(0, 255, 136, 0.4),
          inset 0 0 20px rgba(255, 255, 255, 0.2),
          inset 0 0 40px rgba(0, 0, 0, 0.1)
        `,
        position: 'relative'
      }}
    />
  );
};

export default CharacterCanvas;