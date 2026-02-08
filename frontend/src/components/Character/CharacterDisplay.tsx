import React, { useRef, useEffect } from 'react';

interface CharacterDisplayProps {
  characterData: any;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CharacterDisplay: React.FC<CharacterDisplayProps> = ({ 
  characterData, 
  size = 'md', 
  className = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sizeConfig = {
    sm: { width: 120, height: 160 },
    md: { width: 200, height: 260 },
    lg: { width: 300, height: 400 }
  };

  const { width, height } = sizeConfig[size];

  useEffect(() => {
    if (characterData) {
      drawCharacter();
    }
  }, [characterData]);

  const drawCharacter = () => {
    const canvas = canvasRef.current;
    if (!canvas || !characterData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    drawBackground(ctx, canvas.width, canvas.height);
    
    // Draw character base
    drawCharacterBase(ctx, canvas.width, canvas.height);
    
    // Draw character details
    drawCharacterDetails(ctx, canvas.width, canvas.height);
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    
    switch (characterData.background) {
      case 'city':
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        break;
      case 'forest':
        gradient.addColorStop(0, '#2d5016');
        gradient.addColorStop(1, '#0f2027');
        break;
      case 'mountains':
        gradient.addColorStop(0, '#4b79a1');
        gradient.addColorStop(1, '#283e51');
        break;
      case 'space':
        gradient.addColorStop(0, '#0c0c0c');
        gradient.addColorStop(1, '#1a1a2e');
        break;
      case 'dungeon':
        gradient.addColorStop(0, '#2c1810');
        gradient.addColorStop(1, '#0f0f0f');
        break;
      default:
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const drawCharacterBase = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = width / 300; // Scale based on canvas size
    
    // Draw head
    ctx.fillStyle = characterData.skinTone || '#F4C2A1';
    ctx.beginPath();
    ctx.arc(centerX, centerY - 60 * scale, 40 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw body
    ctx.fillRect(centerX - 25 * scale, centerY - 20 * scale, 50 * scale, 80 * scale);
    
    // Draw arms
    ctx.fillRect(centerX - 45 * scale, centerY - 10 * scale, 20 * scale, 60 * scale);
    ctx.fillRect(centerX + 25 * scale, centerY - 10 * scale, 20 * scale, 60 * scale);
    
    // Draw legs
    ctx.fillRect(centerX - 20 * scale, centerY + 60 * scale, 15 * scale, 60 * scale);
    ctx.fillRect(centerX + 5 * scale, centerY + 60 * scale, 15 * scale, 60 * scale);
  };

  const drawCharacterDetails = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = width / 300;
    
    // Draw hair
    if (characterData.hairStyle !== 'bald') {
      ctx.fillStyle = characterData.hairColor || '#8B4513';
      ctx.fillRect(centerX - 35 * scale, centerY - 95 * scale, 70 * scale, 30 * scale);
    }
    
    // Draw eyes
    ctx.fillStyle = characterData.eyeColor || '#4A90E2';
    ctx.beginPath();
    ctx.arc(centerX - 12 * scale, centerY - 65 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.arc(centerX + 12 * scale, centerY - 65 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw outfit indicator
    ctx.fillStyle = getOutfitColor();
    ctx.fillRect(centerX - 25 * scale, centerY - 20 * scale, 50 * scale, 80 * scale);
    
    // Add class symbol
    ctx.fillStyle = '#FFD700';
    ctx.font = `${24 * scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(getClassSymbol(), centerX, centerY + 100 * scale);
  };

  const getOutfitColor = () => {
    const colors = {
      armor: '#C0C0C0',
      robes: '#4B0082',
      stealth: '#2F4F4F',
      holy: '#FFD700',
      ranger: '#228B22',
      casual: '#4169E1'
    };
    return colors[characterData.outfit as keyof typeof colors] || '#4169E1';
  };

  const getClassSymbol = () => {
    const symbols = {
      WARRIOR: '⚔️',
      MAGE: '🔮',
      ROGUE: '🗡️',
      PALADIN: '✨',
      ARCHER: '🏹'
    };
    return symbols[characterData.characterClass as keyof typeof symbols] || '⚔️';
  };

  if (!characterData) {
    return (
      <div className={`bg-slate-700 rounded-xl flex items-center justify-center ${className}`} 
           style={{ width, height }}>
        <span className="text-slate-400 text-sm">No Character</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`rounded-xl border border-slate-600 ${className}`}
    />
  );
};

export default CharacterDisplay;