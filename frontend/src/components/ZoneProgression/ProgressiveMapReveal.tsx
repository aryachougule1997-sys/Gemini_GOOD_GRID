import React, { useEffect, useRef, useState } from 'react';
import { Zone, Dungeon, UserStats } from '../../../../shared/types';
import './ProgressiveMapReveal.css';

interface ProgressiveMapRevealProps {
  zones: Zone[];
  dungeons: Dungeon[];
  userStats: UserStats;
  onZoneReveal?: (zoneId: string) => void;
  onDungeonReveal?: (dungeonId: string) => void;
}

interface RevealedArea {
  zoneId: string;
  revealProgress: number; // 0-100
  isFullyRevealed: boolean;
  revealStartTime: number;
}

const ProgressiveMapReveal: React.FC<ProgressiveMapRevealProps> = ({
  zones,
  dungeons,
  userStats,
  onZoneReveal,
  onDungeonReveal
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealedAreas, setRevealedAreas] = useState<Map<string, RevealedArea>>(new Map());
  const [animationFrame, setAnimationFrame] = useState<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 800;

    // Initialize revealed areas for unlocked zones
    const newRevealedAreas = new Map<string, RevealedArea>();
    userStats.unlockedZones.forEach(zoneId => {
      newRevealedAreas.set(zoneId, {
        zoneId,
        revealProgress: 100,
        isFullyRevealed: true,
        revealStartTime: Date.now()
      });
    });

    setRevealedAreas(newRevealedAreas);
    
    // Start animation loop
    const animate = () => {
      drawMap(ctx, canvas.width, canvas.height);
      setAnimationFrame(prev => prev + 1);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // Cleanup animation frame if needed
    };
  }, [zones, dungeons, userStats]);

  const drawMap = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    drawBackground(ctx, width, height);

    // Draw zones with progressive reveal
    zones.forEach(zone => {
      drawZoneWithReveal(ctx, zone, width, height);
    });

    // Draw dungeons
    dungeons.forEach(dungeon => {
      const zone = zones.find(z => z.id === dungeon.zoneId);
      if (zone && userStats.unlockedZones.includes(zone.id)) {
        drawDungeon(ctx, dungeon, zone, width, height);
      }
    });

    // Draw fog of war for locked areas
    drawFogOfWar(ctx, width, height);
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawZoneWithReveal = (ctx: CanvasRenderingContext2D, zone: Zone, mapWidth: number, mapHeight: number) => {
    const isUnlocked = userStats.unlockedZones.includes(zone.id);
    const revealData = revealedAreas.get(zone.id);

    // Calculate zone position on canvas
    const zoneX = (zone.coordinates.minX / 2000) * mapWidth;
    const zoneY = (zone.coordinates.minY / 2000) * mapHeight;
    const zoneWidth = ((zone.coordinates.maxX - zone.coordinates.minX) / 2000) * mapWidth;
    const zoneHeight = ((zone.coordinates.maxY - zone.coordinates.minY) / 2000) * mapHeight;

    if (isUnlocked) {
      // Draw revealed zone
      drawRevealedZone(ctx, zone, zoneX, zoneY, zoneWidth, zoneHeight, revealData?.revealProgress || 100);
    } else {
      // Draw locked zone silhouette
      drawLockedZone(ctx, zone, zoneX, zoneY, zoneWidth, zoneHeight);
    }
  };

  const drawRevealedZone = (
    ctx: CanvasRenderingContext2D,
    zone: Zone,
    x: number,
    y: number,
    width: number,
    height: number,
    revealProgress: number
  ) => {
    // Get terrain-specific colors
    const terrainColors = getTerrainColors(zone.terrainType);
    
    // Create clipping mask for reveal effect
    ctx.save();
    
    if (revealProgress < 100) {
      // Create circular reveal mask
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const maxRadius = Math.sqrt(width * width + height * height) / 2;
      const currentRadius = (revealProgress / 100) * maxRadius;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.clip();
    }

    // Draw terrain base
    const gradient = ctx.createRadialGradient(
      x + width / 2, y + height / 2, 0,
      x + width / 2, y + height / 2, Math.max(width, height) / 2
    );
    gradient.addColorStop(0, terrainColors.primary);
    gradient.addColorStop(0.7, terrainColors.secondary);
    gradient.addColorStop(1, terrainColors.dark);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);

    // Add terrain-specific patterns
    drawTerrainPattern(ctx, zone.terrainType, x, y, width, height);

    // Draw zone border
    ctx.strokeStyle = terrainColors.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Add zone label
    if (revealProgress > 50) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(zone.name, x + width / 2, y + height / 2);
    }

    // Add difficulty indicator
    drawDifficultyIndicator(ctx, zone.difficulty, x + width - 30, y + 10);

    ctx.restore();

    // Add reveal wave effect if currently revealing
    if (revealProgress < 100 && revealProgress > 0) {
      drawRevealWave(ctx, x + width / 2, y + height / 2, revealProgress);
    }
  };

  const drawLockedZone = (
    ctx: CanvasRenderingContext2D,
    zone: Zone,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    // Draw silhouette
    ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
    ctx.fillRect(x, y, width, height);

    // Draw dashed border
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x, y, width, height);
    ctx.setLineDash([]);

    // Add lock icon
    drawLockIcon(ctx, x + width / 2, y + height / 2);

    // Add "Locked" text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('LOCKED', x + width / 2, y + height / 2 + 25);
  };

  const drawDungeon = (
    ctx: CanvasRenderingContext2D,
    dungeon: Dungeon,
    zone: Zone,
    mapWidth: number,
    mapHeight: number
  ) => {
    // Calculate dungeon position relative to zone
    const dungeonX = (dungeon.coordinates.x / 2000) * mapWidth;
    const dungeonY = (dungeon.coordinates.y / 2000) * mapHeight;

    // Get dungeon colors based on category
    const dungeonColors = getDungeonColors(dungeon.type);

    // Draw dungeon base
    ctx.fillStyle = dungeonColors.base;
    ctx.fillRect(dungeonX - 15, dungeonY - 10, 30, 20);

    // Draw dungeon roof/top
    ctx.fillStyle = dungeonColors.roof;
    ctx.beginPath();
    ctx.moveTo(dungeonX - 18, dungeonY - 10);
    ctx.lineTo(dungeonX, dungeonY - 25);
    ctx.lineTo(dungeonX + 18, dungeonY - 10);
    ctx.closePath();
    ctx.fill();

    // Draw dungeon door
    ctx.fillStyle = dungeonColors.door;
    ctx.fillRect(dungeonX - 5, dungeonY - 5, 10, 15);

    // Add category icon
    drawDungeonCategoryIcon(ctx, dungeon.type, dungeonX, dungeonY - 30);

    // Add glow effect for special dungeons
    if (dungeon.specialFeatures && dungeon.specialFeatures.length > 0) {
      ctx.shadowColor = dungeonColors.glow;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = dungeonColors.glow;
      ctx.lineWidth = 2;
      ctx.strokeRect(dungeonX - 20, dungeonY - 30, 40, 40);
      ctx.shadowBlur = 0;
    }
  };

  const drawFogOfWar = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Create fog overlay for unexplored areas
    const fogGradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) / 2
    );
    fogGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    fogGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.3)');
    fogGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');

    // Apply fog to locked areas only
    zones.forEach(zone => {
      if (!userStats.unlockedZones.includes(zone.id)) {
        const zoneX = (zone.coordinates.minX / 2000) * width;
        const zoneY = (zone.coordinates.minY / 2000) * height;
        const zoneWidth = ((zone.coordinates.maxX - zone.coordinates.minX) / 2000) * width;
        const zoneHeight = ((zone.coordinates.maxY - zone.coordinates.minY) / 2000) * height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(zoneX, zoneY, zoneWidth, zoneHeight);

        // Add animated fog particles
        drawFogParticles(ctx, zoneX, zoneY, zoneWidth, zoneHeight);
      }
    });
  };

  const getTerrainColors = (terrain: string) => {
    const colors = {
      URBAN: {
        primary: '#4a5568',
        secondary: '#2d3748',
        dark: '#1a202c',
        border: '#718096'
      },
      FOREST: {
        primary: '#38a169',
        secondary: '#2f855a',
        dark: '#276749',
        border: '#48bb78'
      },
      MOUNTAIN: {
        primary: '#a0aec0',
        secondary: '#718096',
        dark: '#4a5568',
        border: '#cbd5e0'
      },
      WATER: {
        primary: '#4299e1',
        secondary: '#3182ce',
        dark: '#2c5282',
        border: '#63b3ed'
      },
      DESERT: {
        primary: '#ed8936',
        secondary: '#dd6b20',
        dark: '#c05621',
        border: '#f6ad55'
      }
    };

    return colors[terrain as keyof typeof colors] || colors.URBAN;
  };

  const getDungeonColors = (category: string) => {
    const colors = {
      FREELANCE: {
        base: '#805ad5',
        roof: '#6b46c1',
        door: '#553c9a',
        glow: '#a78bfa'
      },
      COMMUNITY: {
        base: '#38a169',
        roof: '#2f855a',
        door: '#276749',
        glow: '#68d391'
      },
      CORPORATE: {
        base: '#3182ce',
        roof: '#2c5282',
        door: '#2a4365',
        glow: '#63b3ed'
      }
    };

    return colors[category as keyof typeof colors] || colors.FREELANCE;
  };

  const drawTerrainPattern = (
    ctx: CanvasRenderingContext2D,
    terrain: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    ctx.save();
    ctx.globalAlpha = 0.3;

    switch (terrain) {
      case 'URBAN':
        // Draw building silhouettes
        for (let i = 0; i < 5; i++) {
          const buildingX = x + (i * width / 5) + 10;
          const buildingHeight = 20 + Math.random() * 30;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(buildingX, y + height - buildingHeight, width / 6, buildingHeight);
        }
        break;
      
      case 'FOREST':
        // Draw tree shapes
        for (let i = 0; i < 8; i++) {
          const treeX = x + Math.random() * width;
          const treeY = y + Math.random() * height;
          ctx.fillStyle = 'rgba(0, 100, 0, 0.4)';
          ctx.beginPath();
          ctx.arc(treeX, treeY, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      
      case 'MOUNTAIN':
        // Draw mountain peaks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + height);
        for (let i = 0; i < width; i += 20) {
          ctx.lineTo(x + i, y + height - Math.random() * 40);
        }
        ctx.stroke();
        break;
      
      case 'WATER':
        // Draw wave patterns
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          const waveY = y + (i + 1) * height / 4;
          ctx.moveTo(x, waveY);
          for (let j = 0; j < width; j += 10) {
            ctx.lineTo(x + j, waveY + Math.sin(j * 0.1 + animationFrame * 0.1) * 3);
          }
          ctx.stroke();
        }
        break;
      
      case 'DESERT':
        // Draw sand dunes
        ctx.fillStyle = 'rgba(255, 255, 0, 0.1)';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(x + i * width / 3, y + height - 10, width / 6, 15, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
    }

    ctx.restore();
  };

  const drawDifficultyIndicator = (
    ctx: CanvasRenderingContext2D,
    difficulty: string,
    x: number,
    y: number
  ) => {
    const colors = {
      BEGINNER: '#48bb78',
      INTERMEDIATE: '#ed8936',
      ADVANCED: '#e53e3e',
      EXPERT: '#805ad5'
    };

    const color = colors[difficulty as keyof typeof colors] || colors.BEGINNER;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(difficulty[0], x, y + 3);
  };

  const drawLockIcon = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    
    // Lock body
    ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
    ctx.fillRect(x - 8, y - 2, 16, 12);
    
    // Lock shackle
    ctx.beginPath();
    ctx.arc(x, y - 8, 6, Math.PI, 0, false);
    ctx.stroke();
  };

  const drawDungeonCategoryIcon = (ctx: CanvasRenderingContext2D, category: string, x: number, y: number) => {
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    
    const icons = {
      FREELANCE: '💼',
      COMMUNITY: '🌱',
      CORPORATE: '🏢'
    };
    
    const icon = icons[category as keyof typeof icons] || '⚡';
    ctx.fillText(icon, x, y);
  };

  const drawRevealWave = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, progress: number) => {
    const radius = (progress / 100) * 100;
    
    ctx.strokeStyle = `rgba(255, 215, 0, ${1 - progress / 100})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Add inner ripple
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.5 - progress / 200})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
  };

  const drawFogParticles = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    ctx.fillStyle = 'rgba(200, 200, 200, 0.1)';
    
    for (let i = 0; i < 10; i++) {
      const particleX = x + Math.random() * width;
      const particleY = y + Math.random() * height;
      const size = 2 + Math.random() * 4;
      
      ctx.beginPath();
      ctx.arc(particleX, particleY, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Handle zone reveal animation
  const triggerZoneReveal = (zoneId: string) => {
    setRevealedAreas(prev => {
      const newMap = new Map(prev);
      newMap.set(zoneId, {
        zoneId,
        revealProgress: 0,
        isFullyRevealed: false,
        revealStartTime: Date.now()
      });
      return newMap;
    });

    // Animate reveal progress
    const animateReveal = () => {
      setRevealedAreas(prev => {
        const newMap = new Map(prev);
        const area = newMap.get(zoneId);
        if (area && area.revealProgress < 100) {
          const elapsed = Date.now() - area.revealStartTime;
          const progress = Math.min(100, (elapsed / 2000) * 100); // 2 second reveal
          
          newMap.set(zoneId, {
            ...area,
            revealProgress: progress,
            isFullyRevealed: progress >= 100
          });

          if (progress < 100) {
            requestAnimationFrame(animateReveal);
          } else if (onZoneReveal) {
            onZoneReveal(zoneId);
          }
        }
        return newMap;
      });
    };

    animateReveal();
  };

  return (
    <div className="progressive-map-reveal">
      <canvas
        ref={canvasRef}
        className="map-canvas"
        onClick={(e) => {
          // Handle click events for zone interaction
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Check if click is on a locked zone and show unlock requirements
            console.log(`Clicked at: ${x}, ${y}`);
          }
        }}
      />
      
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color unlocked"></div>
          <span>Unlocked Zones</span>
        </div>
        <div className="legend-item">
          <div className="legend-color locked"></div>
          <span>Locked Zones</span>
        </div>
        <div className="legend-item">
          <div className="legend-color dungeon"></div>
          <span>Dungeons</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveMapReveal;