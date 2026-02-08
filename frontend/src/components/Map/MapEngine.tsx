import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { Zone, Dungeon, Coordinates, CharacterData as GameCharacterData, UserStats } from '../../../../shared/types';
import { DungeonService, DungeonState, DungeonVisualEffect } from '../../services/dungeonService';

interface MapEngineProps {
  zones: Zone[];
  dungeons: Dungeon[];
  playerPosition: Coordinates;
  characterData: GameCharacterData;
  userStats: UserStats;
  onPlayerMove?: (newPosition: Coordinates) => void;
  onDungeonEnter?: (dungeon: Dungeon) => void;
  width?: number;
  height?: number;
}

class MapScene extends Phaser.Scene {
  private zones: Zone[] = [];
  private dungeons: Dungeon[] = [];
  private playerSprite!: Phaser.GameObjects.Sprite;
  private playerPosition: Coordinates = { x: 0, y: 0 };
  private characterData!: GameCharacterData;
  private userStats!: UserStats;
  private onPlayerMove?: (newPosition: Coordinates) => void;
  private onDungeonEnter?: (dungeon: Dungeon) => void;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private isMoving: boolean = false;
  private movementTween?: Phaser.Tweens.Tween;
  private lastDirection: string = 'down';
  private movementSpeed: number = 200;

  // Dungeon state management
  private dungeonStates: Map<string, DungeonState> = new Map();
  private dungeonSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private dungeonEffects: Map<string, Phaser.GameObjects.GameObject[]> = new Map();
  private lastDungeonUpdatePosition?: { x: number; y: number };
  private lastDungeonStateUpdate?: number;

  // Performance optimization properties
  private dungeonLabels: Map<string, Phaser.GameObjects.Text> = new Map();
  private visibleDungeons: Set<string> = new Set();
  private cullDistance: number = 800; // Distance beyond which dungeons are culled
  private textureCache: Map<string, boolean> = new Map();
  private performanceMetrics = {
    visibleDungeonCount: 0,
    culledDungeonCount: 0,
    lastCullTime: 0,
    frameCount: 0
  };

  constructor() {
    super({ key: 'MapScene' });
  }

  destroy() {
    // Clean up all dungeon resources before destroying the scene
    this.cleanupDungeonResources();
    // Note: Phaser.Scene doesn't have a destroy method, cleanup is handled by Phaser
  }

  init(data: any) {
    this.zones = data.zones || [];
    this.dungeons = data.dungeons || [];
    this.playerPosition = data.playerPosition || { x: 400, y: 300 };
    this.characterData = data.characterData || this.getDefaultCharacterData();
    this.userStats = data.userStats || this.getDefaultUserStats();
    this.onPlayerMove = data.onPlayerMove;
    this.onDungeonEnter = data.onDungeonEnter;
  }

  preload() {
    // Create simple colored rectangles for terrain types
    this.load.image('terrain-urban', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==');

    // Preload custom dungeon sprites (with error handling)
    DungeonService.preloadDungeonSprites(this);

    // Create pixel art textures programmatically
    this.createTerrainTextures();
    this.createPlayerSprite();
    this.createEnhancedDungeonSprites();
  }

  create() {
    // Calculate world bounds based on actual zone coordinates
    const worldBounds = this.calculateWorldBounds();
    this.physics.world.setBounds(worldBounds.minX, worldBounds.minY, worldBounds.width, worldBounds.height);

    // Render zones as terrain
    this.renderZones();

    // Validate and fix dungeon coordinates
    this.validateDungeonCoordinates();

    // Render dungeons
    this.renderDungeons();

    // Create player sprite
    this.createPlayer();

    // Set up camera with proper bounds
    this.setupCamera(worldBounds);

    // Set up controls
    this.setupControls();

    // Set up interactions
    this.setupInteractions();
  }

  update() {
    this.handlePlayerMovement();
    
    // Performance optimization: Update dungeon states and culling less frequently
    if (this.time.now - (this.lastDungeonStateUpdate || 0) > 100) { // Update max every 100ms
      this.updateDungeonStates();
      this.performDungeonCulling();
      this.lastDungeonStateUpdate = this.time.now;
    }

    // Validate dungeon positioning stability during camera movement
    this.validateDungeonPositionStability();

    // Update performance metrics
    this.updatePerformanceMetrics();
  }

  private validateDungeonPositionStability() {
    // Check if any dungeon sprites have moved from their expected positions
    this.dungeonSprites.forEach((sprite, dungeonId) => {
      const dungeon = this.dungeons.find(d => d.id === dungeonId);
      if (!dungeon) return;

      const expectedX = dungeon.coordinates.x;
      const expectedY = dungeon.coordinates.y;

      // Allow for small floating point differences
      const tolerance = 0.1;

      if (Math.abs(sprite.x - expectedX) > tolerance || Math.abs(sprite.y - expectedY) > tolerance) {
        console.warn(`Dungeon ${dungeon.name} position drift detected. Correcting position.`);
        sprite.setPosition(expectedX, expectedY);

        // Also update the label position
        const label = this.children.list.find(child =>
          child instanceof Phaser.GameObjects.Text &&
          Math.abs(child.x - expectedX) < 5 &&
          Math.abs(child.y - (expectedY - 60)) < 5
        ) as Phaser.GameObjects.Text;

        if (label) {
          label.setPosition(expectedX, expectedY - 60);
        }
      }
    });
  }

  private createTerrainTextures() {
    const graphics = this.add.graphics();

    // Urban terrain (gray with building patterns)
    graphics.fillStyle(0x666666);
    graphics.fillRect(0, 0, 64, 64);
    graphics.fillStyle(0x888888);
    graphics.fillRect(8, 8, 16, 24);
    graphics.fillRect(40, 16, 12, 20);
    graphics.fillRect(20, 32, 20, 16);
    graphics.generateTexture('terrain-urban', 64, 64);
    graphics.clear();

    // Forest terrain (green with tree patterns)
    graphics.fillStyle(0x228B22);
    graphics.fillRect(0, 0, 64, 64);
    graphics.fillStyle(0x006400);
    graphics.fillCircle(16, 16, 8);
    graphics.fillCircle(48, 20, 6);
    graphics.fillCircle(32, 40, 10);
    graphics.fillCircle(12, 48, 7);
    graphics.generateTexture('terrain-forest', 64, 64);
    graphics.clear();

    // Mountain terrain (brown/gray with rocky patterns)
    graphics.fillStyle(0x8B7355);
    graphics.fillRect(0, 0, 64, 64);
    graphics.fillStyle(0x696969);
    graphics.fillTriangle(32, 8, 16, 32, 48, 32);
    graphics.fillTriangle(48, 16, 40, 40, 56, 40);
    graphics.fillTriangle(16, 24, 8, 48, 24, 48);
    graphics.generateTexture('terrain-mountain', 64, 64);
    graphics.clear();

    // Water terrain (blue with wave patterns)
    graphics.fillStyle(0x4169E1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.fillStyle(0x1E90FF);
    for (let i = 0; i < 64; i += 16) {
      graphics.fillEllipse(i + 8, 16, 12, 4);
      graphics.fillEllipse(i + 8, 32, 12, 4);
      graphics.fillEllipse(i + 8, 48, 12, 4);
    }
    graphics.generateTexture('terrain-water', 64, 64);
    graphics.clear();

    // Desert terrain (sandy with dune patterns)
    graphics.fillStyle(0xF4A460);
    graphics.fillRect(0, 0, 64, 64);
    graphics.fillStyle(0xDEB887);
    graphics.fillEllipse(20, 20, 24, 8);
    graphics.fillEllipse(44, 40, 20, 6);
    graphics.fillEllipse(16, 48, 16, 4);
    graphics.generateTexture('terrain-desert', 64, 64);
    graphics.clear();
  }

  private createPlayerSprite() {
    const graphics = this.add.graphics();

    // Convert hex colors to numbers with safe defaults
    const primaryColor = parseInt((this.characterData?.colorPalette?.primary || '#FFB6C1').replace('#', ''), 16);
    const secondaryColor = parseInt((this.characterData?.colorPalette?.secondary || '#87CEEB').replace('#', ''), 16);
    const accentColor = parseInt((this.characterData?.colorPalette?.accent || '#98FB98').replace('#', ''), 16);

    // Create animation frames for different directions
    this.createPlayerAnimationFrames(graphics, primaryColor, secondaryColor, accentColor);
  }

  private createPlayerAnimationFrames(
    graphics: Phaser.GameObjects.Graphics,
    primaryColor: number,
    secondaryColor: number,
    accentColor: number
  ) {
    const spriteSize = 32;
    const directions = ['down', 'up', 'left', 'right'];

    directions.forEach((direction, dirIndex) => {
      // Create 3 frames for walking animation
      for (let frame = 0; frame < 3; frame++) {
        graphics.clear();

        // Shadow
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillRect(14, 30, 4, 2);

        // Calculate animation offset for walking
        const walkOffset = frame === 1 ? 1 : 0; // Middle frame has slight offset
        const legOffset = frame === 0 ? -1 : frame === 2 ? 1 : 0;

        // Head with direction-based positioning
        this.drawCharacterHead(graphics, direction, primaryColor, walkOffset);

        // Body
        this.drawCharacterBody(graphics, secondaryColor, walkOffset);

        // Arms with walking animation
        this.drawCharacterArms(graphics, primaryColor, direction, walkOffset);

        // Legs with walking animation
        this.drawCharacterLegs(graphics, accentColor, legOffset);

        // Add sprite type specific details
        this.addSpriteTypeDetails(graphics, this.characterData.baseSprite, 8, 16);

        // Add accessories
        this.addAccessories(graphics);

        // Generate texture for this frame
        const textureName = `player-${direction}-${frame}`;
        graphics.generateTexture(textureName, spriteSize, spriteSize + 4);
      }
    });

    // Create idle texture (same as down-1)
    graphics.clear();
    this.drawIdleCharacter(graphics, primaryColor, secondaryColor, accentColor);
    this.addSpriteTypeDetails(graphics, this.characterData.baseSprite, 8, 16);
    this.addAccessories(graphics);
    graphics.generateTexture('player-idle', spriteSize, spriteSize + 4);

    graphics.destroy();
  }

  private drawCharacterHead(graphics: Phaser.GameObjects.Graphics, direction: string, primaryColor: number, walkOffset: number) {
    // Head position adjustments based on direction
    let headX = 10;
    let headY = 4 + walkOffset;

    if (direction === 'left') headX -= 1;
    if (direction === 'right') headX += 1;

    // Head (6x6 pixels) with shading
    graphics.fillStyle(primaryColor);
    graphics.fillRect(headX, headY, 12, 12);

    // Head highlight
    const lighterPrimary = this.lightenColor(primaryColor, 0.3);
    graphics.fillStyle(lighterPrimary);
    graphics.fillRect(headX, headY, 6, 6);

    // Eyes based on direction
    this.drawEyes(graphics, direction, headX, headY);

    // Mouth
    graphics.fillStyle(0x000000);
    graphics.fillRect(headX + 5, headY + 8, 2, 1);
  }

  private drawEyes(graphics: Phaser.GameObjects.Graphics, direction: string, headX: number, headY: number) {
    graphics.fillStyle(0x000000);

    switch (direction) {
      case 'up':
        // Eyes looking up
        graphics.fillRect(headX + 2, headY + 3, 2, 2);
        graphics.fillRect(headX + 8, headY + 3, 2, 2);
        break;
      case 'down':
        // Eyes looking down/forward
        graphics.fillRect(headX + 2, headY + 4, 2, 2);
        graphics.fillRect(headX + 8, headY + 4, 2, 2);
        break;
      case 'left':
        // Eyes looking left
        graphics.fillRect(headX + 1, headY + 4, 2, 2);
        graphics.fillRect(headX + 7, headY + 4, 2, 2);
        break;
      case 'right':
        // Eyes looking right
        graphics.fillRect(headX + 3, headY + 4, 2, 2);
        graphics.fillRect(headX + 9, headY + 4, 2, 2);
        break;
    }

    // Eye sparkles
    graphics.fillStyle(0xffffff);
    switch (direction) {
      case 'up':
        graphics.fillRect(headX + 2, headY + 3, 1, 1);
        graphics.fillRect(headX + 8, headY + 3, 1, 1);
        break;
      case 'down':
        graphics.fillRect(headX + 2, headY + 4, 1, 1);
        graphics.fillRect(headX + 8, headY + 4, 1, 1);
        break;
      case 'left':
        graphics.fillRect(headX + 1, headY + 4, 1, 1);
        graphics.fillRect(headX + 7, headY + 4, 1, 1);
        break;
      case 'right':
        graphics.fillRect(headX + 3, headY + 4, 1, 1);
        graphics.fillRect(headX + 9, headY + 4, 1, 1);
        break;
    }
  }

  private drawCharacterBody(graphics: Phaser.GameObjects.Graphics, secondaryColor: number, walkOffset: number) {
    // Body (8x10 pixels) with shading
    graphics.fillStyle(secondaryColor);
    graphics.fillRect(8, 16 + walkOffset, 16, 12);

    // Body highlight
    const lighterSecondary = this.lightenColor(secondaryColor, 0.2);
    graphics.fillStyle(lighterSecondary);
    graphics.fillRect(8, 16 + walkOffset, 8, 6);
  }

  private drawCharacterArms(graphics: Phaser.GameObjects.Graphics, primaryColor: number, direction: string, walkOffset: number) {
    const lighterPrimary = this.lightenColor(primaryColor, 0.3);

    // Arms with direction-based positioning
    let leftArmX = 4;
    let rightArmX = 24;
    let armY = 18 + walkOffset;

    // Arm swing animation based on direction
    if (direction === 'left') {
      leftArmX -= 1;
      rightArmX += 1;
    } else if (direction === 'right') {
      leftArmX += 1;
      rightArmX -= 1;
    }

    // Left arm
    graphics.fillStyle(primaryColor);
    graphics.fillRect(leftArmX, armY, 4, 8);
    graphics.fillStyle(lighterPrimary);
    graphics.fillRect(leftArmX, armY, 2, 4);

    // Right arm
    graphics.fillStyle(primaryColor);
    graphics.fillRect(rightArmX, armY, 4, 8);
    graphics.fillStyle(lighterPrimary);
    graphics.fillRect(rightArmX, armY, 2, 4);
  }

  private drawCharacterLegs(graphics: Phaser.GameObjects.Graphics, accentColor: number, legOffset: number) {
    const lighterAccent = this.lightenColor(accentColor, 0.2);

    // Legs with walking animation
    const leftLegX = 10 + legOffset;
    const rightLegX = 18 - legOffset;

    // Left leg
    graphics.fillStyle(accentColor);
    graphics.fillRect(leftLegX, 28, 4, 8);
    graphics.fillStyle(lighterAccent);
    graphics.fillRect(leftLegX, 28, 2, 4);

    // Right leg
    graphics.fillStyle(accentColor);
    graphics.fillRect(rightLegX, 28, 4, 8);
    graphics.fillStyle(lighterAccent);
    graphics.fillRect(rightLegX, 28, 2, 4);

    // Feet
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(leftLegX - 1, 35, 6, 2);
    graphics.fillRect(rightLegX - 1, 35, 6, 2);
  }

  private drawIdleCharacter(graphics: Phaser.GameObjects.Graphics, primaryColor: number, secondaryColor: number, accentColor: number) {
    // Shadow
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRect(14, 30, 4, 2);

    // Head
    graphics.fillStyle(primaryColor);
    graphics.fillRect(10, 4, 12, 12);

    // Head highlight
    const lighterPrimary = this.lightenColor(primaryColor, 0.3);
    graphics.fillStyle(lighterPrimary);
    graphics.fillRect(10, 4, 6, 6);

    // Eyes
    graphics.fillStyle(0x000000);
    graphics.fillRect(12, 8, 2, 2);
    graphics.fillRect(18, 8, 2, 2);

    // Eye sparkles
    graphics.fillStyle(0xffffff);
    graphics.fillRect(12, 8, 1, 1);
    graphics.fillRect(18, 8, 1, 1);

    // Mouth
    graphics.fillStyle(0x000000);
    graphics.fillRect(15, 12, 2, 1);

    // Body
    graphics.fillStyle(secondaryColor);
    graphics.fillRect(8, 16, 16, 12);

    // Body highlight
    const lighterSecondary = this.lightenColor(secondaryColor, 0.2);
    graphics.fillStyle(lighterSecondary);
    graphics.fillRect(8, 16, 8, 6);

    // Arms
    graphics.fillStyle(primaryColor);
    graphics.fillRect(4, 18, 4, 8);
    graphics.fillRect(24, 18, 4, 8);

    // Arm highlights
    graphics.fillStyle(lighterPrimary);
    graphics.fillRect(4, 18, 2, 4);
    graphics.fillRect(24, 18, 2, 4);

    // Legs
    graphics.fillStyle(accentColor);
    graphics.fillRect(10, 28, 4, 8);
    graphics.fillRect(18, 28, 4, 8);

    // Leg highlights
    const lighterAccent = this.lightenColor(accentColor, 0.2);
    graphics.fillStyle(lighterAccent);
    graphics.fillRect(10, 28, 2, 4);
    graphics.fillRect(18, 28, 2, 4);

    // Feet
    graphics.fillStyle(0x8B4513);
    graphics.fillRect(9, 35, 6, 2);
    graphics.fillRect(17, 35, 6, 2);
  }

  private addSpriteTypeDetails(graphics: Phaser.GameObjects.Graphics, spriteType: string, bodyX: number, bodyY: number) {
    switch (spriteType) {
      case 'PROFESSIONAL':
        // Tie
        graphics.fillStyle(0x333333);
        graphics.fillRect(bodyX + 6, bodyY + 2, 4, 8);
        // Tie highlight
        graphics.fillStyle(0x555555);
        graphics.fillRect(bodyX + 6, bodyY + 2, 2, 4);
        break;
      case 'CREATIVE':
        // Paint splashes
        graphics.fillStyle(0xff6b6b);
        graphics.fillRect(bodyX + 2, bodyY + 4, 2, 2);
        graphics.fillStyle(0x4ecdc4);
        graphics.fillRect(bodyX + 10, bodyY + 6, 2, 2);
        graphics.fillStyle(0xfeca57);
        graphics.fillRect(bodyX + 6, bodyY + 8, 2, 2);
        break;
      case 'CASUAL':
        // Casual shirt pattern
        graphics.fillStyle(0xffffff);
        graphics.fillRect(bodyX + 4, bodyY + 2, 2, 2);
        graphics.fillRect(bodyX + 10, bodyY + 2, 2, 2);
        graphics.fillRect(bodyX + 7, bodyY + 6, 2, 2);
        break;
      default:
        // Default - simple chest detail
        graphics.fillStyle(0xffffff);
        graphics.fillRect(bodyX + 6, bodyY + 4, 4, 2);
        break;
    }
  }

  private addAccessories(graphics: Phaser.GameObjects.Graphics) {
    (this.characterData?.accessories || []).forEach(accessory => {
      switch (accessory.type) {
        case 'HAT':
          // Detailed hat with shading
          graphics.fillStyle(0x8B4513); // Brown hat
          graphics.fillRect(8, 2, 16, 4);
          // Hat highlight
          graphics.fillStyle(0xA0522D);
          graphics.fillRect(8, 2, 8, 2);
          // Hat band
          graphics.fillStyle(0x654321);
          graphics.fillRect(8, 5, 16, 1);
          break;
        case 'GLASSES':
          // Detailed glasses with frames
          graphics.fillStyle(0x333333);
          // Left lens frame
          graphics.fillRect(11, 7, 4, 4);
          // Right lens frame
          graphics.fillRect(17, 7, 4, 4);
          // Bridge
          graphics.fillStyle(0x666666);
          graphics.fillRect(15, 8, 2, 1);
          // Lenses (transparent effect)
          graphics.fillStyle(0x87CEEB, 0.3);
          graphics.fillRect(12, 8, 2, 2);
          graphics.fillRect(18, 8, 2, 2);
          break;
        case 'TOOL':
          // Detailed tool in hand
          graphics.fillStyle(0x654321); // Handle
          graphics.fillRect(26, 20, 2, 6);
          // Tool head
          graphics.fillStyle(0xC0C0C0); // Silver
          graphics.fillRect(25, 18, 4, 2);
          // Tool highlight
          graphics.fillStyle(0xE5E5E5);
          graphics.fillRect(25, 18, 2, 1);
          break;
        case 'CLOTHING':
          // Cape or additional clothing
          graphics.fillStyle(0x800080); // Purple cape
          graphics.fillRect(6, 16, 2, 8);
          graphics.fillRect(24, 16, 2, 8);
          break;
        case 'BADGE_DISPLAY':
          // Badge on chest
          graphics.fillStyle(0xFFD700); // Gold badge
          graphics.fillRect(13, 18, 6, 4);
          // Badge star
          graphics.fillStyle(0xFFA500);
          graphics.fillRect(15, 19, 2, 2);
          break;
      }
    });
  }

  private lightenColor(color: number, factor: number): number {
    const r = Math.min(255, Math.floor(((color >> 16) & 0xFF) * (1 + factor)));
    const g = Math.min(255, Math.floor(((color >> 8) & 0xFF) * (1 + factor)));
    const b = Math.min(255, Math.floor((color & 0xFF) * (1 + factor)));
    return (r << 16) | (g << 8) | b;
  }

  private calculateWorldBounds() {
    if (this.zones.length === 0) {
      // Fallback to default bounds if no zones
      return { minX: 0, minY: 0, width: 2000, height: 2000 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // Calculate the overall bounding box from all zones
    this.zones.forEach(zone => {
      minX = Math.min(minX, zone.coordinates.minX);
      minY = Math.min(minY, zone.coordinates.minY);
      maxX = Math.max(maxX, zone.coordinates.maxX);
      maxY = Math.max(maxY, zone.coordinates.maxY);
    });

    // Add padding around the world bounds
    const padding = 100;
    return {
      minX: minX - padding,
      minY: minY - padding,
      width: (maxX - minX) + (padding * 2),
      height: (maxY - minY) + (padding * 2)
    };
  }

  private validateDungeonCoordinates() {
    // Validate that all dungeons are positioned within their zone boundaries
    this.dungeons.forEach(dungeon => {
      const zone = this.zones.find(z => z.id === dungeon.zoneId);
      if (!zone) {
        console.warn(`Dungeon ${dungeon.id} references non-existent zone ${dungeon.zoneId}`);
        return;
      }

      const { coordinates: zoneCoords } = zone;
      const dungeonCoords = dungeon.coordinates;

      // Check if dungeon is within zone bounds
      const isWithinBounds =
        dungeonCoords.x >= zoneCoords.minX &&
        dungeonCoords.x <= zoneCoords.maxX &&
        dungeonCoords.y >= zoneCoords.minY &&
        dungeonCoords.y <= zoneCoords.maxY;

      if (!isWithinBounds) {
        console.warn(`Dungeon ${dungeon.name} (${dungeon.id}) is outside zone bounds. Adjusting position.`);

        // Clamp dungeon coordinates to zone bounds with some margin
        const margin = 50; // Keep dungeons away from zone edges
        dungeon.coordinates.x = Math.max(
          zoneCoords.minX + margin,
          Math.min(zoneCoords.maxX - margin, dungeonCoords.x)
        );
        dungeon.coordinates.y = Math.max(
          zoneCoords.minY + margin,
          Math.min(zoneCoords.maxY - margin, dungeonCoords.y)
        );

        console.log(`Adjusted ${dungeon.name} position to (${dungeon.coordinates.x}, ${dungeon.coordinates.y})`);
      }
    });

    // Check for overlapping dungeons and adjust positions
    this.preventDungeonOverlaps();
  }

  private preventDungeonOverlaps() {
    const minDistance = 80; // Minimum distance between dungeons

    for (let i = 0; i < this.dungeons.length; i++) {
      for (let j = i + 1; j < this.dungeons.length; j++) {
        const dungeon1 = this.dungeons[i];
        const dungeon2 = this.dungeons[j];

        // Only check dungeons in the same zone
        if (dungeon1.zoneId !== dungeon2.zoneId) continue;

        const distance = DungeonService.calculateDistance(
          dungeon1.coordinates,
          dungeon2.coordinates
        );

        if (distance < minDistance) {
          console.warn(`Dungeons ${dungeon1.name} and ${dungeon2.name} are too close. Adjusting positions.`);

          // Move the second dungeon away from the first
          const angle = Math.atan2(
            dungeon2.coordinates.y - dungeon1.coordinates.y,
            dungeon2.coordinates.x - dungeon1.coordinates.x
          );

          const newX = dungeon1.coordinates.x + Math.cos(angle) * minDistance;
          const newY = dungeon1.coordinates.y + Math.sin(angle) * minDistance;

          // Find the zone to ensure we stay within bounds
          const zone = this.zones.find(z => z.id === dungeon2.zoneId);
          if (zone) {
            const margin = 50;
            dungeon2.coordinates.x = Math.max(
              zone.coordinates.minX + margin,
              Math.min(zone.coordinates.maxX - margin, newX)
            );
            dungeon2.coordinates.y = Math.max(
              zone.coordinates.minY + margin,
              Math.min(zone.coordinates.maxY - margin, newY)
            );
          } else {
            dungeon2.coordinates.x = newX;
            dungeon2.coordinates.y = newY;
          }

          console.log(`Adjusted ${dungeon2.name} position to (${dungeon2.coordinates.x}, ${dungeon2.coordinates.y})`);
        }
      }
    }
  }

  private getDefaultCharacterData(): GameCharacterData {
    return {
      baseSprite: 'DEFAULT',
      colorPalette: {
        primary: '#FFB6C1',
        secondary: '#87CEEB',
        accent: '#98FB98'
      },
      accessories: [],
      unlockedItems: []
    };
  }

  private getDefaultUserStats(): UserStats {
    return {
      userId: 'default',
      trustScore: 50,
      rwisScore: 0,
      xpPoints: 0,
      currentLevel: 1,
      unlockedZones: [],
      categoryStats: {
        freelance: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] },
        community: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] },
        corporate: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] }
      }
    };
  }

  // Coordinate system utilities
  private worldToScreen(worldCoords: { x: number; y: number }): { x: number; y: number } {
    // Convert world coordinates to screen coordinates using camera transform
    const camera = this.cameras.main;
    return {
      x: (worldCoords.x - camera.scrollX) * camera.zoom,
      y: (worldCoords.y - camera.scrollY) * camera.zoom
    };
  }

  private screenToWorld(screenCoords: { x: number; y: number }): { x: number; y: number } {
    // Convert screen coordinates to world coordinates using camera transform
    const camera = this.cameras.main;
    return {
      x: (screenCoords.x / camera.zoom) + camera.scrollX,
      y: (screenCoords.y / camera.zoom) + camera.scrollY
    };
  }

  private validateWorldCoordinates(coords: { x: number; y: number }): boolean {
    // Check if coordinates are within the world bounds
    const worldBounds = this.physics.world.bounds;
    return (
      coords.x >= worldBounds.x &&
      coords.x <= worldBounds.x + worldBounds.width &&
      coords.y >= worldBounds.y &&
      coords.y <= worldBounds.y + worldBounds.height
    );
  }

  private clampToWorldBounds(coords: { x: number; y: number }): { x: number; y: number } {
    // Clamp coordinates to stay within world bounds
    const worldBounds = this.physics.world.bounds;
    return {
      x: Math.max(worldBounds.x, Math.min(worldBounds.x + worldBounds.width, coords.x)),
      y: Math.max(worldBounds.y, Math.min(worldBounds.y + worldBounds.height, coords.y))
    };
  }

  private createEnhancedDungeonSprites() {
    // Use the enhanced DungeonService to create all dungeon sprites with caching
    DungeonService.createEnhancedDungeonSprites(this);

    // Validate that all sprites were created successfully
    if (!DungeonService.validateDungeonSprites(this)) {
      console.warn('Some dungeon sprites failed to load, fallbacks will be used');
    }

    // Cache texture availability for performance
    this.cacheTextureAvailability();
  }

  private cacheTextureAvailability() {
    const categories = ['freelance', 'community', 'corporate'];
    categories.forEach(category => {
      const textureKey = `dungeon-${category}`;
      this.textureCache.set(textureKey, this.textures.exists(textureKey));
    });
  }

  private renderZones() {
    this.zones.forEach(zone => {
      const terrainKey = `terrain-${zone.terrainType.toLowerCase()}`;

      // Create tiled terrain for the zone
      const zoneWidth = zone.coordinates.maxX - zone.coordinates.minX;
      const zoneHeight = zone.coordinates.maxY - zone.coordinates.minY;

      // Create terrain tiles
      const terrainTiles: Phaser.GameObjects.Image[] = [];

      for (let x = zone.coordinates.minX; x < zone.coordinates.maxX; x += 64) {
        for (let y = zone.coordinates.minY; y < zone.coordinates.maxY; y += 64) {
          const tile = this.add.image(x, y, terrainKey);
          tile.setOrigin(0, 0);
          tile.setDisplaySize(64, 64);
          terrainTiles.push(tile);

          // Add zone boundary visual
          if (x === zone.coordinates.minX || x >= zone.coordinates.maxX - 64 ||
            y === zone.coordinates.minY || y >= zone.coordinates.maxY - 64) {
            tile.setTint(0xffffff);
            tile.setAlpha(0.8);
          }
        }
      }

      // Note: Water collision temporarily disabled to fix runtime error
      // TODO: Implement proper collision detection in future enhancement

      // Add zone label
      const centerX = (zone.coordinates.minX + zone.coordinates.maxX) / 2;
      const centerY = (zone.coordinates.minY + zone.coordinates.maxY) / 2;

      const label = this.add.text(centerX, centerY, zone.name, {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
      });
      label.setOrigin(0.5);

      // Add zone unlock status indicator
      if (!(zone as any).unlocked) {
        // Create fog overlay for locked zones
        const fogOverlay = this.add.rectangle(
          centerX, centerY,
          zoneWidth, zoneHeight,
          0x000000, 0.6
        );
        fogOverlay.setStrokeStyle(2, 0xff0000);

        const lockLabel = this.add.text(centerX, centerY + 30, 'LOCKED', {
          fontSize: '14px',
          color: '#ff0000',
          backgroundColor: '#000000',
          padding: { x: 6, y: 3 }
        });
        lockLabel.setOrigin(0.5);
      }
    });
  }

  private showTemporaryMessage(message: string) {
    const messageText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 100,
      message,
      {
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#ff0000',
        padding: { x: 12, y: 8 }
      }
    );
    messageText.setOrigin(0.5);
    messageText.setScrollFactor(0); // Keep fixed to camera

    // Fade out after 2 seconds
    this.tweens.add({
      targets: messageText,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        messageText.destroy();
      }
    });
  }

  private handleDungeonInteraction(dungeon: Dungeon, dungeonSprite: Phaser.GameObjects.Sprite) {
    const currentState = this.dungeonStates.get(dungeon.id);

    // Calculate current distance for precise checking
    const distance = DungeonService.calculateDistance(
      this.playerPosition,
      dungeon.coordinates
    );

    if (!currentState) {
      this.showInteractionFeedback(dungeonSprite, 'error');
      this.showTemporaryMessage('Unable to determine dungeon status');
      return;
    }

    // Check accessibility first
    if (!currentState.isAccessible) {
      this.showInteractionFeedback(dungeonSprite, 'denied');
      this.showTemporaryMessage('You do not meet the requirements for this dungeon');
      return;
    }

    // Check distance with precise calculation
    if (!currentState.isInRange) {
      this.showInteractionFeedback(dungeonSprite, 'tooFar');
      const requiredDistance = DungeonService.INTERACTION_RANGE;
      const moveDistance = Math.ceil(distance - requiredDistance);
      this.showTemporaryMessage(`Move ${moveDistance} units closer to interact with this dungeon`);
      return;
    }

    // Success - enter dungeon
    this.showInteractionFeedback(dungeonSprite, 'success');

    // Add success visual feedback
    this.addSuccessEffects(dungeonSprite);

    // Notify parent component to open dungeon
    if (this.onDungeonEnter) {
      this.onDungeonEnter(dungeon);
    }
  }

  private showInteractionFeedback(sprite: Phaser.GameObjects.Sprite, type: 'success' | 'denied' | 'tooFar' | 'error') {
    // Visual feedback based on interaction result
    let feedbackColor: number;
    let feedbackScale: number;
    let feedbackDuration: number;

    switch (type) {
      case 'success':
        feedbackColor = 0x00ff00;
        feedbackScale = 1.2;
        feedbackDuration = 300;
        break;
      case 'denied':
        feedbackColor = 0xff0000;
        feedbackScale = 0.9;
        feedbackDuration = 200;
        break;
      case 'tooFar':
        feedbackColor = 0xffaa00;
        feedbackScale = 1.05;
        feedbackDuration = 250;
        break;
      case 'error':
        feedbackColor = 0xff00ff;
        feedbackScale = 0.95;
        feedbackDuration = 200;
        break;
    }

    // Create feedback flash
    const originalTint = sprite.tint;
    sprite.setTint(feedbackColor);

    // Scale feedback
    const originalScaleX = sprite.scaleX;
    const originalScaleY = sprite.scaleY;

    this.tweens.add({
      targets: sprite,
      scaleX: originalScaleX * feedbackScale,
      scaleY: originalScaleY * feedbackScale,
      duration: feedbackDuration / 2,
      ease: 'Power2',
      yoyo: true,
      onComplete: () => {
        // Restore original tint after feedback
        sprite.setTint(originalTint);
      }
    });
  }

  private addSuccessEffects(sprite: Phaser.GameObjects.Sprite) {
    // Create success particle burst
    const successParticles = this.add.particles(sprite.x, sprite.y - 20, 'terrain-urban', {
      scale: { start: 0.2, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 800,
      frequency: -1, // Burst mode
      quantity: 12,
      tint: 0x00ff88,
      speed: { min: 50, max: 100 },
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Circle(0, 0, 10),
        quantity: 12
      }
    });

    // Auto-destroy particles after burst
    this.time.delayedCall(1000, () => {
      successParticles.destroy();
    });

    // Add success glow ring
    const successRing = this.add.graphics();
    successRing.lineStyle(3, 0x00ff88, 0.8);
    successRing.strokeCircle(sprite.x, sprite.y, 30);

    // Animate ring expansion and fade
    this.tweens.add({
      targets: successRing,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onUpdate: () => {
        const progress = 1 - successRing.alpha;
        const radius = 30 + (progress * 20);
        successRing.clear();
        successRing.lineStyle(3, 0x00ff88, successRing.alpha);
        successRing.strokeCircle(sprite.x, sprite.y, radius);
      },
      onComplete: () => {
        successRing.destroy();
      }
    });
  }

  private renderDungeons() {
    console.log('🏰 Rendering dungeons:', this.dungeons.length, 'dungeons found');
    this.dungeons.forEach(dungeon => {
      console.log('  - Rendering dungeon:', dungeon.name, 'at', dungeon.coordinates);
      // Validate coordinates before rendering
      if (!this.isValidCoordinate(dungeon.coordinates)) {
        console.error(`Invalid coordinates for dungeon ${dungeon.name}: (${dungeon.coordinates.x}, ${dungeon.coordinates.y})`);
        return;
      }

      // Use DungeonService to get the appropriate sprite key with fallback logic
      const spriteKey = DungeonService.getDungeonSpriteKey(dungeon, this);

      const dungeonSprite = this.add.sprite(
        dungeon.coordinates.x,
        dungeon.coordinates.y,
        spriteKey
      );
      dungeonSprite.setOrigin(0.5, 1);
      dungeonSprite.setInteractive();
      dungeonSprite.setData('dungeon', dungeon);

      // Store sprite reference for state management
      this.dungeonSprites.set(dungeon.id, dungeonSprite);

      // Initialize dungeon state
      const initialState = DungeonService.getDungeonState(
        dungeon,
        {
          trustScore: this.userStats.trustScore,
          level: this.userStats.currentLevel,
          badges: [] // TODO: Extract badges from userStats when available
        },
        this.playerPosition
      );
      this.dungeonStates.set(dungeon.id, initialState);

      // Apply initial visual effects
      this.applyDungeonVisualEffects(dungeon.id, initialState);

      // Enhanced visual effects
      dungeonSprite.setTint(0xffffff);

      // Enhanced hover effects with smooth transitions - only for accessible dungeons in range
      dungeonSprite.on('pointerover', () => {
        const currentState = this.dungeonStates.get(dungeon.id);
        if (currentState?.isAccessible && currentState?.isInRange) {
          // Add enhanced hover glow
          this.addHoverEffects(dungeonSprite, currentState);
        }
      });

      dungeonSprite.on('pointerout', () => {
        const currentState = this.dungeonStates.get(dungeon.id);
        if (currentState?.isAccessible && currentState?.isInRange) {
          // Remove hover effects
          this.removeHoverEffects(dungeonSprite);
        }
      });

      // Handle all dungeon interactions within Phaser
      dungeonSprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        // Prevent event bubbling to prevent click-to-move
        pointer.event.stopPropagation();

        this.handleDungeonInteraction(dungeon, dungeonSprite);
      });

      // Add dungeon name label with improved styling
      const label = this.add.text(
        dungeon.coordinates.x,
        dungeon.coordinates.y - 60,
        dungeon.name,
        {
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 6, y: 3 },
          stroke: '#333333',
          strokeThickness: 1
        }
      );
      label.setOrigin(0.5);

      // Add subtle glow effect to the label
      label.setAlpha(0.9);

      // Store label reference for culling
      this.dungeonLabels.set(dungeon.id, label);
    });

    // Note: Initial culling will be performed after player creation
  }

  private performDungeonCulling() {
    // Safety check: don't perform culling if player sprite isn't ready yet
    if (!this.playerSprite) {
      return;
    }

    const camera = this.cameras.main;
    const playerPos = { x: this.playerSprite.x, y: this.playerSprite.y };
    const cullStartTime = performance.now();

    let visibleCount = 0;
    let culledCount = 0;

    this.dungeons.forEach(dungeon => {
      const distance = DungeonService.calculateDistance(playerPos, dungeon.coordinates);
      const sprite = this.dungeonSprites.get(dungeon.id);
      const label = this.dungeonLabels.get(dungeon.id);
      
      if (!sprite || !label) return;

      const shouldBeVisible = distance <= this.cullDistance;
      const isCurrentlyVisible = this.visibleDungeons.has(dungeon.id);

      if (shouldBeVisible && !isCurrentlyVisible) {
        // Show dungeon
        sprite.setVisible(true);
        label.setVisible(true);
        this.visibleDungeons.add(dungeon.id);
        visibleCount++;
      } else if (!shouldBeVisible && isCurrentlyVisible) {
        // Hide dungeon and clean up effects
        sprite.setVisible(false);
        label.setVisible(false);
        this.clearDungeonEffects(dungeon.id);
        this.visibleDungeons.delete(dungeon.id);
        culledCount++;
      } else if (shouldBeVisible) {
        visibleCount++;
      } else {
        culledCount++;
      }
    });

    // Update performance metrics
    this.performanceMetrics.visibleDungeonCount = visibleCount;
    this.performanceMetrics.culledDungeonCount = culledCount;
    this.performanceMetrics.lastCullTime = performance.now() - cullStartTime;
  }

  private updatePerformanceMetrics() {
    this.performanceMetrics.frameCount++;
    
    // Log performance metrics every 5 seconds in development
    if (process.env.NODE_ENV === 'development' && this.performanceMetrics.frameCount % 300 === 0) {
      console.log('Dungeon Rendering Performance:', {
        visibleDungeons: this.performanceMetrics.visibleDungeonCount,
        culledDungeons: this.performanceMetrics.culledDungeonCount,
        lastCullTime: `${this.performanceMetrics.lastCullTime.toFixed(2)}ms`,
        totalDungeons: this.dungeons.length,
        cullDistance: this.cullDistance
      });
    }
  }

  public cleanupDungeonResources() {
    // Clean up all dungeon sprites and effects
    this.dungeonSprites.forEach((sprite, dungeonId) => {
      this.clearDungeonEffects(dungeonId);
      if (sprite && !sprite.scene) {
        sprite.destroy();
      }
    });

    // Clean up labels
    this.dungeonLabels.forEach((label, dungeonId) => {
      if (label && !label.scene) {
        label.destroy();
      }
    });

    // Clear all maps
    this.dungeonSprites.clear();
    this.dungeonLabels.clear();
    this.dungeonEffects.clear();
    this.dungeonStates.clear();
    this.visibleDungeons.clear();
    this.textureCache.clear();

    console.log('Dungeon resources cleaned up');
  }

  private isValidCoordinate(coord: { x: number; y: number }): boolean {
    return (
      typeof coord.x === 'number' &&
      typeof coord.y === 'number' &&
      !isNaN(coord.x) &&
      !isNaN(coord.y) &&
      isFinite(coord.x) &&
      isFinite(coord.y)
    );
  }

  private createPlayer() {
    this.playerSprite = this.add.sprite(
      this.playerPosition.x,
      this.playerPosition.y,
      'player-idle'
    );
    this.playerSprite.setScale(1.5);
    this.physics.add.existing(this.playerSprite);

    // Set player physics body
    const body = this.playerSprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setSize(20, 24);

    // Create walking animations
    this.createPlayerAnimations();

    // Start with idle animation
    this.playerSprite.play('idle');

    // Initialize culling system now that player sprite exists
    this.performDungeonCulling();
  }

  private createPlayerAnimations() {
    const directions = ['down', 'up', 'left', 'right'];

    directions.forEach(direction => {
      // Walking animation
      this.anims.create({
        key: `walk-${direction}`,
        frames: [
          { key: `player-${direction}-0` },
          { key: `player-${direction}-1` },
          { key: `player-${direction}-2` },
          { key: `player-${direction}-1` }
        ],
        frameRate: 8,
        repeat: -1
      });
    });

    // Idle animation (subtle breathing effect)
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'player-idle' }],
      frameRate: 1,
      repeat: -1
    });
  }

  private setupCamera(worldBounds?: { minX: number; minY: number; width: number; height: number }) {
    this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    if (worldBounds) {
      this.cameras.main.setBounds(
        worldBounds.minX,
        worldBounds.minY,
        worldBounds.width,
        worldBounds.height
      );
    } else {
      // Fallback bounds
      this.cameras.main.setBounds(0, 0, 2000, 2000);
    }

    this.cameras.main.setDeadzone(100, 100);
  }

  private setupControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys('W,S,A,D');

    // Mouse/touch controls for zooming
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      const currentZoom = this.cameras.main.zoom;
      const newZoom = Phaser.Math.Clamp(currentZoom - deltaY * 0.001, 0.5, 2);
      this.cameras.main.setZoom(newZoom);
    });
  }

  private setupInteractions() {
    // Add click-to-move functionality (only when not clicking on interactive objects)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) return;

      // Check if we clicked on a dungeon sprite first
      const clickedObjects = this.input.hitTestPointer(pointer);
      const clickedDungeon = clickedObjects.find(obj =>
        obj.getData && obj.getData('dungeon')
      );

      if (clickedDungeon) {
        // Dungeon interaction is handled by the sprite's own event handlers
        return;
      }

      // If no dungeon was clicked, proceed with click-to-move
      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

      // Validate the world point before moving
      if (this.validateWorldCoordinates(worldPoint)) {
        this.movePlayerTo(worldPoint.x, worldPoint.y);
      } else {
        console.warn(`Click target outside world bounds: (${worldPoint.x}, ${worldPoint.y})`);
        // Clamp to world bounds and move there instead
        const clampedPoint = this.clampToWorldBounds(worldPoint);
        this.movePlayerTo(clampedPoint.x, clampedPoint.y);
      }
    });
  }

  private handlePlayerMovement() {
    const body = this.playerSprite.body as Phaser.Physics.Arcade.Body;
    let isMoving = false;
    let direction = this.lastDirection;

    body.setVelocity(0);

    // Keyboard movement with animation
    if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
      body.setVelocityX(-this.movementSpeed);
      direction = 'left';
      isMoving = true;
    } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
      body.setVelocityX(this.movementSpeed);
      direction = 'right';
      isMoving = true;
    }

    if (this.cursors.up.isDown || this.wasdKeys.W.isDown) {
      body.setVelocityY(-this.movementSpeed);
      direction = 'up';
      isMoving = true;
    } else if (this.cursors.down.isDown || this.wasdKeys.S.isDown) {
      body.setVelocityY(this.movementSpeed);
      direction = 'down';
      isMoving = true;
    }

    // Normalize diagonal movement
    if (body.velocity.x !== 0 && body.velocity.y !== 0) {
      body.velocity.normalize().scale(this.movementSpeed);
    }

    // Handle animation changes
    if (isMoving && !this.isMoving) {
      // Started moving
      this.isMoving = true;
      this.lastDirection = direction;
      this.playerSprite.play(`walk-${direction}`);
      this.addMovementEffects();
    } else if (!isMoving && this.isMoving) {
      // Stopped moving
      this.isMoving = false;
      this.playerSprite.play('idle');
      this.removeMovementEffects();
    } else if (isMoving && direction !== this.lastDirection) {
      // Changed direction
      this.lastDirection = direction;
      this.playerSprite.play(`walk-${direction}`);
    }

    // Update player position and notify parent component
    const newPosition = {
      x: this.playerSprite.x,
      y: this.playerSprite.y
    };

    if (this.onPlayerMove &&
      (Math.abs(newPosition.x - this.playerPosition.x) > 5 ||
        Math.abs(newPosition.y - this.playerPosition.y) > 5)) {
      this.playerPosition = newPosition;
      this.onPlayerMove(newPosition);
    }
  }

  private addMovementEffects() {
    // Temporarily disabled to check if this causes flashing
    // Add subtle dust particles when moving
    /*
    const particles = this.add.particles(this.playerSprite.x, this.playerSprite.y + 15, 'terrain-urban', {
      scale: { start: 0.1, end: 0 },
      alpha: { start: 0.3, end: 0 },
      lifespan: 300,
      frequency: 100,
      quantity: 1,
      tint: 0x8B7355
    });
    
    particles.startFollow(this.playerSprite, 0, 15);
    this.playerSprite.setData('dustParticles', particles);
    */
  }

  private removeMovementEffects() {
    const particles = this.playerSprite.getData('dustParticles');
    if (particles) {
      particles.destroy();
      this.playerSprite.setData('dustParticles', null);
    }
  }

  private updateDungeonStates() {
    // Only update dungeon states if player position has changed significantly
    const currentPlayerPos = { x: this.playerSprite.x, y: this.playerSprite.y };
    const lastUpdatePos = this.lastDungeonUpdatePosition || { x: 0, y: 0 };

    const distanceMoved = Math.sqrt(
      Math.pow(currentPlayerPos.x - lastUpdatePos.x, 2) +
      Math.pow(currentPlayerPos.y - lastUpdatePos.y, 2)
    );

    // Only update if player moved more than 10 pixels to reduce flashing
    if (distanceMoved < 10) {
      return;
    }

    this.lastDungeonUpdatePosition = currentPlayerPos;

    // Only update visible dungeons for performance
    this.visibleDungeons.forEach(dungeonId => {
      const dungeon = this.dungeons.find(d => d.id === dungeonId);
      if (!dungeon) return;

      const currentState = this.dungeonStates.get(dungeon.id);

      // Calculate new state
      const newState = DungeonService.getDungeonState(
        dungeon,
        {
          trustScore: this.userStats.trustScore,
          level: this.userStats.currentLevel,
          badges: [] // TODO: Extract badges from userStats when available
        },
        currentPlayerPos
      );

      // Check if state has changed
      if (!currentState || this.hasStateChanged(currentState, newState)) {
        this.dungeonStates.set(dungeon.id, newState);
        this.applyDungeonVisualEffects(dungeon.id, newState);
      }
    });
  }

  private hasStateChanged(oldState: DungeonState, newState: DungeonState): boolean {
    // Only consider significant state changes to reduce flashing
    return (
      oldState.isAccessible !== newState.isAccessible ||
      oldState.isInRange !== newState.isInRange ||
      oldState.isLocked !== newState.isLocked ||
      oldState.proximityLevel !== newState.proximityLevel
      // Removed visual effects length check as it can cause unnecessary updates
    );
  }

  private applyDungeonVisualEffects(dungeonId: string, state: DungeonState) {
    const sprite = this.dungeonSprites.get(dungeonId);
    if (!sprite) return;

    // Clear existing effects
    this.clearDungeonEffects(dungeonId);

    const effects: Phaser.GameObjects.GameObject[] = [];

    // Apply visual effects based on state
    state.visualEffects.forEach(effect => {
      switch (effect.type) {
        case 'glow':
          this.applyGlowEffect(sprite, effect, effects);
          break;
        case 'scale':
          this.applyScaleEffect(sprite, effect, effects);
          break;
        case 'pulse':
          this.applyPulseEffect(sprite, effect, effects);
          break;
        case 'particles':
          this.applyParticleEffect(sprite, effect, effects);
          break;
      }
    });

    // Add locked dungeon visual indicators
    if (state.isLocked) {
      this.applyLockedDungeonEffects(sprite, effects);
    }

    // Store effects for cleanup
    this.dungeonEffects.set(dungeonId, effects);

    // Apply accessibility tinting with smooth transitions
    this.applyAccessibilityTinting(sprite, state);
  }

  private clearDungeonEffects(dungeonId: string) {
    const sprite = this.dungeonSprites.get(dungeonId);
    const effects = this.dungeonEffects.get(dungeonId);

    if (effects) {
      effects.forEach(effect => {
        if (effect.destroy) {
          effect.destroy();
        }
      });
      this.dungeonEffects.delete(dungeonId);
    }

    // Clear any existing tweens on the sprite
    if (sprite) {
      const existingTweens = ['scaleTween', 'pulseTween', 'tintTween', 'hoverScaleTween'];
      existingTweens.forEach(tweenKey => {
        const tween = sprite.getData(tweenKey);
        if (tween) {
          tween.destroy();
          sprite.setData(tweenKey, null);
        }
      });

      // Clear hover effects
      this.removeHoverEffects(sprite);
    }
  }

  private applyGlowEffect(
    sprite: Phaser.GameObjects.Sprite,
    effect: DungeonVisualEffect,
    effects: Phaser.GameObjects.GameObject[]
  ) {
    // Create a glow effect using a larger, semi-transparent copy
    const glow = this.add.sprite(sprite.x, sprite.y, sprite.texture.key);
    glow.setOrigin(sprite.originX, sprite.originY);
    glow.setScale(sprite.scaleX * 1.2, sprite.scaleY * 1.2);
    glow.setAlpha(0.3 * effect.intensity);
    glow.setTint(effect.color || 0x00ff88);
    glow.setDepth(sprite.depth - 1);

    // Add pulsing animation
    this.tweens.add({
      targets: glow,
      alpha: 0.1 * effect.intensity,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    effects.push(glow);
  }

  private applyScaleEffect(
    sprite: Phaser.GameObjects.Sprite,
    effect: DungeonVisualEffect,
    effects: Phaser.GameObjects.GameObject[]
  ) {
    const scaleTween = this.tweens.add({
      targets: sprite,
      scaleX: sprite.scaleX * effect.intensity,
      scaleY: sprite.scaleY * effect.intensity,
      duration: 300,
      ease: 'Power2'
    });

    // Store tween reference for cleanup (tweens don't have destroy method, but we can stop them)
    sprite.setData('scaleTween', scaleTween);
  }

  private applyPulseEffect(
    sprite: Phaser.GameObjects.Sprite,
    effect: DungeonVisualEffect,
    effects: Phaser.GameObjects.GameObject[]
  ) {
    const pulseTween = this.tweens.add({
      targets: sprite,
      scaleX: sprite.scaleX * (1 + effect.intensity * 0.1),
      scaleY: sprite.scaleY * (1 + effect.intensity * 0.1),
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    sprite.setData('pulseTween', pulseTween);
  }

  private applyParticleEffect(
    sprite: Phaser.GameObjects.Sprite,
    effect: DungeonVisualEffect,
    effects: Phaser.GameObjects.GameObject[]
  ) {
    // Create particle effect around the dungeon
    const particles = this.add.particles(sprite.x, sprite.y - 20, 'terrain-urban', {
      scale: { start: 0.1, end: 0 },
      alpha: { start: 0.5 * effect.intensity, end: 0 },
      lifespan: 1000,
      frequency: 200,
      quantity: 1,
      tint: effect.color || 0x00ff88,
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Circle(0, 0, 20),
        quantity: 8
      }
    });

    effects.push(particles);
  }

  private applyLockedDungeonEffects(
    sprite: Phaser.GameObjects.Sprite,
    effects: Phaser.GameObjects.GameObject[]
  ) {
    // Create lock icon overlay
    const lockIcon = this.add.graphics();
    lockIcon.fillStyle(0x000000, 0.8);
    lockIcon.fillCircle(0, 0, 12);

    // Lock body
    lockIcon.fillStyle(0xffffff);
    lockIcon.fillRect(-4, -2, 8, 6);

    // Lock shackle
    lockIcon.lineStyle(2, 0xffffff);
    lockIcon.strokeCircle(0, -4, 3);

    // Position lock icon
    lockIcon.x = sprite.x + sprite.width * 0.3;
    lockIcon.y = sprite.y - sprite.height * 0.3;
    lockIcon.setDepth(sprite.depth + 1);

    effects.push(lockIcon);

    // Add grayscale effect by creating a desaturated overlay
    const grayscaleOverlay = this.add.rectangle(
      sprite.x, sprite.y,
      sprite.width, sprite.height,
      0x000000, 0.4
    );
    grayscaleOverlay.setOrigin(sprite.originX, sprite.originY);
    grayscaleOverlay.setDepth(sprite.depth + 0.5);

    effects.push(grayscaleOverlay);
  }

  private applyAccessibilityTinting(sprite: Phaser.GameObjects.Sprite, state: DungeonState) {
    // Clear any existing tinting tweens
    const existingTween = sprite.getData('tintTween');
    if (existingTween) {
      existingTween.destroy();
    }

    let targetTint: number;
    let targetAlpha: number;

    if (state.isLocked) {
      targetTint = 0x666666;
      targetAlpha = 0.7;
    } else if (state.isAccessible && state.isInRange) {
      targetTint = 0x00ff88;
      targetAlpha = 1.0;
    } else if (state.isAccessible) {
      targetTint = 0x88ff88;
      targetAlpha = 0.9;
    } else {
      targetTint = 0xffffff;
      targetAlpha = 1.0;
    }

    // Check if tint actually needs to change to prevent unnecessary updates
    if (sprite.tint === targetTint && Math.abs(sprite.alpha - targetAlpha) < 0.01) {
      return;
    }

    // Create smooth transition to new tint and alpha
    const tintTween = this.tweens.add({
      targets: sprite,
      alpha: targetAlpha,
      duration: 300,
      ease: 'Power2',
      onUpdate: () => {
        // Interpolate tint color smoothly
        const progress = tintTween.progress;
        const currentTint = sprite.tint;
        const newTint = this.interpolateColor(currentTint, targetTint, progress);
        sprite.setTint(newTint);
      },
      onComplete: () => {
        sprite.setData('tintTween', null);
      }
    });

    sprite.setData('tintTween', tintTween);
  }

  private interpolateColor(color1: number, color2: number, factor: number): number {
    const r1 = (color1 >> 16) & 0xFF;
    const g1 = (color1 >> 8) & 0xFF;
    const b1 = color1 & 0xFF;

    const r2 = (color2 >> 16) & 0xFF;
    const g2 = (color2 >> 8) & 0xFF;
    const b2 = color2 & 0xFF;

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return (r << 16) | (g << 8) | b;
  }

  private addHoverEffects(sprite: Phaser.GameObjects.Sprite, state: DungeonState) {
    // Clear any existing hover effects
    this.removeHoverEffects(sprite);

    const hoverEffects: Phaser.GameObjects.GameObject[] = [];

    // Enhanced glow effect for hover
    const hoverGlow = this.add.sprite(sprite.x, sprite.y, sprite.texture.key);
    hoverGlow.setOrigin(sprite.originX, sprite.originY);
    hoverGlow.setScale(sprite.scaleX * 1.3, sprite.scaleY * 1.3);
    hoverGlow.setAlpha(0.4);
    hoverGlow.setTint(0x00ffff);
    hoverGlow.setDepth(sprite.depth - 1);

    // Pulsing hover glow
    this.tweens.add({
      targets: hoverGlow,
      alpha: 0.2,
      scaleX: sprite.scaleX * 1.4,
      scaleY: sprite.scaleY * 1.4,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    hoverEffects.push(hoverGlow);

    // Scale up the main sprite
    const scaleUpTween = this.tweens.add({
      targets: sprite,
      scaleX: sprite.scaleX * 1.15,
      scaleY: sprite.scaleY * 1.15,
      duration: 200,
      ease: 'Back.easeOut'
    });

    // Add sparkle particles for hover
    const sparkleParticles = this.add.particles(sprite.x, sprite.y - 10, 'terrain-urban', {
      scale: { start: 0.05, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 600,
      frequency: 150,
      quantity: 2,
      tint: 0x00ffff,
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Circle(0, 0, 15),
        quantity: 6
      }
    });

    hoverEffects.push(sparkleParticles);

    // Store hover effects for cleanup
    sprite.setData('hoverEffects', hoverEffects);
    sprite.setData('hoverScaleTween', scaleUpTween);
  }

  private removeHoverEffects(sprite: Phaser.GameObjects.Sprite) {
    // Clean up hover effects
    const hoverEffects = sprite.getData('hoverEffects');
    if (hoverEffects) {
      hoverEffects.forEach((effect: Phaser.GameObjects.GameObject) => {
        if (effect.destroy) {
          effect.destroy();
        }
      });
      sprite.setData('hoverEffects', null);
    }

    // Reset scale with smooth transition
    const existingScaleTween = sprite.getData('hoverScaleTween');
    if (existingScaleTween) {
      existingScaleTween.destroy();
    }

    const scaleDownTween = this.tweens.add({
      targets: sprite,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Back.easeIn',
      onComplete: () => {
        sprite.setData('hoverScaleTween', null);
      }
    });

    sprite.setData('hoverScaleTween', scaleDownTween);
  }

  private movePlayerTo(x: number, y: number) {
    // Validate and clamp coordinates to world bounds
    const targetCoords = this.clampToWorldBounds({ x, y });

    if (!this.validateWorldCoordinates(targetCoords)) {
      console.warn(`Invalid target coordinates: (${x}, ${y}). Movement cancelled.`);
      return;
    }

    // Stop current movement
    if (this.movementTween) {
      this.movementTween.destroy();
    }

    // Calculate direction for animation
    const deltaX = targetCoords.x - this.playerSprite.x;
    const deltaY = targetCoords.y - this.playerSprite.y;
    let direction = 'down';

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
    }

    // Start walking animation
    this.isMoving = true;
    this.lastDirection = direction;
    this.playerSprite.play(`walk-${direction}`);
    this.addMovementEffects();

    // Calculate movement duration based on distance
    const distance = Phaser.Math.Distance.Between(this.playerSprite.x, this.playerSprite.y, targetCoords.x, targetCoords.y);
    const duration = Math.min(3000, Math.max(500, distance * 3));

    // Create smooth movement tween
    this.movementTween = this.tweens.add({
      targets: this.playerSprite,
      x: targetCoords.x,
      y: targetCoords.y,
      duration: duration,
      ease: 'Power2',
      onComplete: () => {
        this.isMoving = false;
        this.playerSprite.play('idle');
        this.removeMovementEffects();
        this.movementTween = undefined;
      }
    });
  }
}

const MapEngine: React.FC<MapEngineProps> = ({
  zones,
  dungeons,
  playerPosition,
  characterData,
  userStats,
  onPlayerMove,
  onDungeonEnter,
  width = 800,
  height = 600
}) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width,
      height,
      parent: containerRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: MapScene,
      backgroundColor: '#2c3e50'
    };

    gameRef.current = new Phaser.Game(config);

    // Pass data to scene
    gameRef.current.scene.start('MapScene', {
      zones,
      dungeons,
      playerPosition,
      characterData,
      userStats,
      onPlayerMove,
      onDungeonEnter
    });

    return () => {
      if (gameRef.current) {
        // Get the scene and clean up resources before destroying
        const scene = gameRef.current.scene.getScene('MapScene') as MapScene;
        if (scene && scene.scene.isActive()) {
          scene.cleanupDungeonResources();
        }
        
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    // Update scene data when props change (excluding playerPosition to avoid constant restarts)
    if (gameRef.current) {
      const scene = gameRef.current.scene.getScene('MapScene') as MapScene;
      if (scene) {
        scene.scene.restart({
          zones,
          dungeons,
          playerPosition,
          characterData,
          userStats,
          onPlayerMove,
          onDungeonEnter
        });
      }
    }
  }, [zones, dungeons, characterData, userStats, onPlayerMove, onDungeonEnter]); // Removed playerPosition from dependencies

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minWidth: `${width}px`,
        minHeight: `${height}px`,
        border: '2px solid #00ff88',
        borderRadius: '10px',
        overflow: 'hidden',
        position: 'relative'
      }}
    />
  );
};

export default MapEngine;