import Phaser from 'phaser';
import { WorkCategory, Dungeon, Point } from '../../../shared/types';

// API and utility interfaces
export interface DungeonAccessCheck {
  trustScore: number;
  level: number;
  badges: string[];
}

export interface CategoryInfo {
  name: string;
  icon: string;
  description: string;
}

// Sprite generation interfaces
export interface DungeonSpriteConfig {
  category: WorkCategory;
  width: number;
  height: number;
  colors: {
    primary: number;
    secondary: number;
    accent: number;
    highlight: number;
  };
}

export interface DungeonFallbackConfig {
  emoji: string;
  backgroundColor: number;
  textColor: number;
}

// Dungeon State Management Types
export interface DungeonState {
  isAccessible: boolean;
  isInRange: boolean;
  isLocked: boolean;
  proximityLevel: 'far' | 'near' | 'close';
  visualEffects: DungeonVisualEffect[];
}

export interface DungeonVisualEffect {
  type: 'glow' | 'scale' | 'pulse' | 'particles';
  intensity: number;
  color?: number;
}

export interface DungeonSpriteData {
  dungeon: Dungeon;
  state: DungeonState;
  baseTexture: string;
  fallbackTexture: string;
  interactionRange: number;
}

export class DungeonService {
  private static readonly API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  public static readonly INTERACTION_RANGE = 100; // pixels - made public for MapEngine access

  // Texture caching for performance optimization
  private static textureGenerationCache: Map<string, boolean> = new Map();
  private static spriteCreationQueue: Set<string> = new Set();

  // Category information for UI display
  private static readonly CATEGORY_INFO: Record<WorkCategory, CategoryInfo> = {
    FREELANCE: {
      name: 'Freelance Tower',
      icon: '🏢',
      description: 'Independent work opportunities'
    },
    COMMUNITY: {
      name: 'Community Garden',
      icon: '🌱',
      description: 'Collaborative community projects'
    },
    CORPORATE: {
      name: 'Corporate Castle',
      icon: '🏰',
      description: 'Enterprise-level opportunities'
    }
  };

  // Sprite generation configurations
  private static readonly CATEGORY_CONFIGS: Record<WorkCategory, DungeonSpriteConfig> = {
    FREELANCE: {
      category: 'FREELANCE',
      width: 32,
      height: 48,
      colors: {
        primary: 0x3498db,    // Blue
        secondary: 0x2980b9,  // Darker blue
        accent: 0x85c1e9,     // Light blue
        highlight: 0xffffff   // White
      }
    },
    COMMUNITY: {
      category: 'COMMUNITY',
      width: 40,
      height: 32,
      colors: {
        primary: 0x27ae60,    // Green
        secondary: 0x2ecc71,  // Light green
        accent: 0xe74c3c,     // Red (flowers)
        highlight: 0xf39c12   // Orange (details)
      }
    },
    CORPORATE: {
      category: 'CORPORATE',
      width: 48,
      height: 40,
      colors: {
        primary: 0x7f8c8d,    // Gray
        secondary: 0x95a5a6,  // Light gray
        accent: 0x34495e,     // Dark blue-gray
        highlight: 0xecf0f1   // Very light gray
      }
    }
  };

  private static readonly FALLBACK_CONFIGS: Record<WorkCategory, DungeonFallbackConfig> = {
    FREELANCE: {
      emoji: '🏢',
      backgroundColor: 0x3498db,
      textColor: 0xffffff
    },
    COMMUNITY: {
      emoji: '🌱',
      backgroundColor: 0x27ae60,
      textColor: 0xffffff
    },
    CORPORATE: {
      emoji: '🏰',
      backgroundColor: 0x7f8c8d,
      textColor: 0xffffff
    }
  };

  // API Methods
  static async getAllDungeons(): Promise<Dungeon[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/dungeons`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.dungeons || [];
    } catch (error) {
      console.error('Error fetching dungeons:', error);
      throw error;
    }
  }

  static async getDungeonById(dungeonId: string): Promise<Dungeon> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/dungeons/${dungeonId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.dungeon;
    } catch (error) {
      console.error('Error fetching dungeon:', error);
      throw error;
    }
  }

  static async checkDungeonAccess(
    dungeonId: string, 
    userStats: DungeonAccessCheck, 
    authToken: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/api/dungeons/${dungeonId}/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(userStats)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.canAccess || false;
    } catch (error) {
      console.error('Error checking dungeon access:', error);
      throw error;
    }
  }

  // Utility Methods
  static getCategoryInfo(category: WorkCategory): CategoryInfo {
    return this.CATEGORY_INFO[category];
  }

  static isWithinInteractionRange(userPosition: Point, dungeonPosition: Point): boolean {
    const distance = Math.sqrt(
      Math.pow(userPosition.x - dungeonPosition.x, 2) + 
      Math.pow(userPosition.y - dungeonPosition.y, 2)
    );
    return distance <= this.INTERACTION_RANGE;
  }

  static calculateDistance(pos1: Point, pos2: Point): number {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + 
      Math.pow(pos1.y - pos2.y, 2)
    );
  }

  // Dungeon State Management
  static getDungeonState(
    dungeon: Dungeon, 
    userStats: { trustScore: number; level: number; badges: string[] }, 
    userPosition: Point
  ): DungeonState {
    const distance = this.calculateDistance(userPosition, dungeon.coordinates);
    const isInRange = distance <= this.INTERACTION_RANGE;
    const isAccessible = this.checkLocalAccess(dungeon, userStats);
    const isLocked = !isAccessible;
    
    // Determine proximity level with more granular levels
    let proximityLevel: 'far' | 'near' | 'close';
    if (distance <= this.INTERACTION_RANGE * 0.4) {
      proximityLevel = 'close';
    } else if (distance <= this.INTERACTION_RANGE * 0.8) {
      proximityLevel = 'near';
    } else {
      proximityLevel = 'far';
    }

    // Generate enhanced visual effects based on state
    const visualEffects: DungeonVisualEffect[] = [];
    
    if (isLocked) {
      // Locked dungeons get subtle red glow and grayscale effect
      visualEffects.push({
        type: 'glow',
        intensity: 0.4,
        color: 0xff4444
      });
    } else if (isAccessible && isInRange) {
      // Accessible dungeons in range get bright green glow and particles
      visualEffects.push({
        type: 'glow',
        intensity: proximityLevel === 'close' ? 1.0 : 0.8,
        color: 0x00ff88
      });
      
      // Add scale effect for very close proximity
      if (proximityLevel === 'close') {
        visualEffects.push({
          type: 'scale',
          intensity: 1.05
        });
        
        // Add particle effect for close proximity
        visualEffects.push({
          type: 'particles',
          intensity: 0.8,
          color: 0x00ff88
        });
      }
      
      // Add pulse effect for near proximity
      if (proximityLevel === 'near') {
        visualEffects.push({
          type: 'pulse',
          intensity: 0.6
        });
      }
    } else if (isAccessible && proximityLevel === 'near') {
      // Accessible dungeons that are near but not in range get subtle glow
      visualEffects.push({
        type: 'glow',
        intensity: 0.3,
        color: 0x88ff88
      });
    } else if (isAccessible && proximityLevel === 'close') {
      // Accessible dungeons that are close but not in range get stronger glow
      visualEffects.push({
        type: 'glow',
        intensity: 0.5,
        color: 0x88ff88
      });
      
      visualEffects.push({
        type: 'pulse',
        intensity: 0.4
      });
    }

    return {
      isAccessible,
      isInRange,
      isLocked,
      proximityLevel,
      visualEffects
    };
  }

  private static checkLocalAccess(
    dungeon: Dungeon, 
    userStats: { trustScore: number; level: number; badges: string[] }
  ): boolean {
    const requirements = dungeon.entryRequirements;
    
    if (requirements.trustScore && userStats.trustScore < requirements.trustScore) {
      return false;
    }
    
    if (requirements.level && userStats.level < requirements.level) {
      return false;
    }
    
    if (requirements.badges && requirements.badges.length > 0) {
      const hasAllBadges = requirements.badges.every(badge => 
        userStats.badges.includes(badge)
      );
      if (!hasAllBadges) {
        return false;
      }
    }
    
    return true;
  }

  // Enhanced Sprite Generation Methods
  static createEnhancedDungeonSprites(scene: Phaser.Scene): void {
    const graphics = scene.add.graphics();

    // Create sprites for each category with caching
    Object.values(this.CATEGORY_CONFIGS).forEach(config => {
      const cacheKey = `dungeon-${config.category.toLowerCase()}`;
      
      // Check if texture already exists to avoid regeneration
      if (!scene.textures.exists(cacheKey) && !this.textureGenerationCache.has(cacheKey)) {
        this.textureGenerationCache.set(cacheKey, true);
        this.createCategorySprite(graphics, config);
      }
    });

    // Create fallback sprites with caching
    Object.entries(this.FALLBACK_CONFIGS).forEach(([category, fallbackConfig]) => {
      const cacheKey = `dungeon-${category.toLowerCase()}-fallback`;
      
      if (!scene.textures.exists(cacheKey) && !this.textureGenerationCache.has(cacheKey)) {
        this.textureGenerationCache.set(cacheKey, true);
        this.createFallbackSprite(graphics, category as WorkCategory, fallbackConfig);
      }
    });

    graphics.destroy();
  }

  // Performance optimization: Clear texture cache when needed
  static clearTextureCache(): void {
    this.textureGenerationCache.clear();
    this.spriteCreationQueue.clear();
  }

  // Performance testing utility
  static getPerformanceMetrics(): { 
    cachedTextures: number; 
    queuedSprites: number; 
    cacheKeys: string[] 
  } {
    return {
      cachedTextures: this.textureGenerationCache.size,
      queuedSprites: this.spriteCreationQueue.size,
      cacheKeys: Array.from(this.textureGenerationCache.keys())
    };
  }

  private static createCategorySprite(graphics: Phaser.GameObjects.Graphics, config: DungeonSpriteConfig): void {
    graphics.clear();

    switch (config.category) {
      case 'FREELANCE':
        this.createFreelanceTowerSprite(graphics, config);
        break;
      case 'COMMUNITY':
        this.createCommunityGardenSprite(graphics, config);
        break;
      case 'CORPORATE':
        this.createCorporateCastleSprite(graphics, config);
        break;
    }

    graphics.generateTexture(`dungeon-${config.category.toLowerCase()}`, config.width, config.height);
  }

  private static createFreelanceTowerSprite(graphics: Phaser.GameObjects.Graphics, config: DungeonSpriteConfig): void {
    const { width, height, colors } = config;

    // Main building structure
    graphics.fillStyle(colors.primary);
    graphics.fillRect(0, 0, width, height);

    // Building floors with windows
    graphics.fillStyle(colors.secondary);
    for (let floor = 0; floor < 4; floor++) {
      const floorY = 4 + (floor * 10);
      graphics.fillRect(2, floorY, width - 4, 8);
      
      // Windows
      graphics.fillStyle(colors.highlight);
      for (let window = 0; window < 3; window++) {
        const windowX = 4 + (window * 8);
        graphics.fillRect(windowX, floorY + 1, 6, 6);
      }
      graphics.fillStyle(colors.secondary);
    }

    // Entrance
    graphics.fillStyle(colors.accent);
    graphics.fillRect(width/2 - 4, height - 12, 8, 12);
    
    // Entrance door
    graphics.fillStyle(colors.secondary);
    graphics.fillRect(width/2 - 2, height - 10, 4, 8);

    // Rooftop details
    graphics.fillStyle(colors.highlight);
    graphics.fillRect(width/2 - 2, 0, 4, 4);
    
    // Antenna
    graphics.lineStyle(1, colors.highlight);
    graphics.lineBetween(width/2, 0, width/2, -4);
  }

  private static createCommunityGardenSprite(graphics: Phaser.GameObjects.Graphics, config: DungeonSpriteConfig): void {
    const { width, height, colors } = config;

    // Base ground
    graphics.fillStyle(colors.primary);
    graphics.fillRect(0, 0, width, height);

    // Garden plots (irregular shapes)
    graphics.fillStyle(colors.secondary);
    
    // Large central plot
    graphics.fillEllipse(width/2, height/2, 16, 12);
    
    // Smaller plots
    graphics.fillEllipse(width * 0.25, height * 0.3, 10, 8);
    graphics.fillEllipse(width * 0.75, height * 0.7, 12, 10);
    graphics.fillEllipse(width * 0.8, height * 0.25, 8, 6);

    // Flowers and plants
    graphics.fillStyle(colors.accent);
    const flowerPositions = [
      { x: width * 0.3, y: height * 0.4 },
      { x: width * 0.6, y: height * 0.3 },
      { x: width * 0.7, y: height * 0.6 },
      { x: width * 0.2, y: height * 0.7 },
      { x: width * 0.85, y: height * 0.3 }
    ];

    flowerPositions.forEach(pos => {
      graphics.fillCircle(pos.x, pos.y, 2);
    });

    // Garden paths
    graphics.fillStyle(colors.highlight);
    graphics.fillRect(0, height * 0.6, width, 2);
    graphics.fillRect(width * 0.4, 0, 2, height);

    // Fence posts
    graphics.fillStyle(colors.accent);
    for (let i = 0; i < width; i += 8) {
      graphics.fillRect(i, 0, 1, 4);
      graphics.fillRect(i, height - 4, 1, 4);
    }
  }

  private static createCorporateCastleSprite(graphics: Phaser.GameObjects.Graphics, config: DungeonSpriteConfig): void {
    const { width, height, colors } = config;

    // Main castle structure
    graphics.fillStyle(colors.primary);
    graphics.fillRect(0, 0, width, height);

    // Castle walls with depth
    graphics.fillStyle(colors.secondary);
    graphics.fillRect(2, 2, width - 4, height - 2);

    // Towers
    graphics.fillStyle(colors.primary);
    graphics.fillRect(0, 0, 8, height * 0.8);
    graphics.fillRect(width - 8, 0, 8, height * 0.8);
    graphics.fillRect(width/2 - 4, 0, 8, height * 0.6);

    // Tower tops (crenellations)
    graphics.fillStyle(colors.accent);
    for (let i = 0; i < 8; i += 2) {
      graphics.fillRect(i, height * 0.8 - 4, 1, 4);
      graphics.fillRect(width - 8 + i, height * 0.8 - 4, 1, 4);
    }
    for (let i = 0; i < 8; i += 2) {
      graphics.fillRect(width/2 - 4 + i, height * 0.6 - 4, 1, 4);
    }

    // Main entrance
    graphics.fillStyle(colors.accent);
    graphics.fillRect(width/2 - 6, height - 16, 12, 16);
    
    // Entrance arch
    graphics.fillStyle(colors.secondary);
    graphics.fillRect(width/2 - 4, height - 14, 8, 12);

    // Windows
    graphics.fillStyle(colors.accent);
    const windowPositions = [
      { x: 4, y: height * 0.3 },
      { x: 4, y: height * 0.5 },
      { x: width - 6, y: height * 0.3 },
      { x: width - 6, y: height * 0.5 },
      { x: width/2 - 1, y: height * 0.2 },
      { x: width/2 - 1, y: height * 0.4 }
    ];

    windowPositions.forEach(pos => {
      graphics.fillRect(pos.x, pos.y, 2, 3);
    });

    // Flag on central tower
    graphics.fillStyle(colors.highlight);
    graphics.fillRect(width/2, 0, 1, 8);
    graphics.fillTriangle(width/2 + 1, 2, width/2 + 1, 6, width/2 + 4, 4);
  }

  private static createFallbackSprite(
    graphics: Phaser.GameObjects.Graphics, 
    category: WorkCategory, 
    fallbackConfig: DungeonFallbackConfig
  ): void {
    graphics.clear();

    const size = 32;
    
    // Background circle
    graphics.fillStyle(fallbackConfig.backgroundColor);
    graphics.fillCircle(size/2, size/2, size/2 - 2);

    // Border
    graphics.lineStyle(2, fallbackConfig.textColor);
    graphics.strokeCircle(size/2, size/2, size/2 - 2);

    graphics.generateTexture(`dungeon-${category.toLowerCase()}-fallback`, size, size);
  }

  static getDungeonSpriteUrl(category: WorkCategory, customSpriteAsset?: string): string {
    // If a custom sprite asset is provided, use it
    if (customSpriteAsset) {
      return customSpriteAsset;
    }

    // Otherwise, return a data URL for the category emoji as fallback
    const fallbackConfig = this.FALLBACK_CONFIGS[category];
    
    // Create a simple data URL with the emoji
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = `#${fallbackConfig.backgroundColor.toString(16).padStart(6, '0')}`;
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fill();

    // Emoji
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fallbackConfig.emoji, 16, 16);

    return canvas.toDataURL();
  }

  static getDungeonSpriteKey(dungeon: Dungeon, scene: Phaser.Scene): string {
    const primaryKey = `dungeon-${dungeon.type.toLowerCase()}`;
    const fallbackKey = `dungeon-${dungeon.type.toLowerCase()}-fallback`;
    const emojiKey = `dungeon-${dungeon.type.toLowerCase()}-emoji`;

    // Check if primary sprite exists
    if (scene.textures.exists(primaryKey)) {
      return primaryKey;
    }

    // Check if fallback sprite exists
    if (scene.textures.exists(fallbackKey)) {
      return fallbackKey;
    }

    // Create emoji fallback if needed (with caching)
    if (!scene.textures.exists(emojiKey) && !this.spriteCreationQueue.has(emojiKey)) {
      this.spriteCreationQueue.add(emojiKey);
      this.createEmojiSprite(scene, dungeon.type, emojiKey);
      this.spriteCreationQueue.delete(emojiKey);
    }

    return emojiKey;
  }

  private static createEmojiSprite(scene: Phaser.Scene, category: WorkCategory, textureKey: string): void {
    const fallbackConfig = this.FALLBACK_CONFIGS[category];
    const size = 32;

    // Create a canvas to render emoji
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = `#${fallbackConfig.backgroundColor.toString(16).padStart(6, '0')}`;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Emoji
    ctx.font = `${size * 0.6}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fallbackConfig.emoji, size/2, size/2);

    // Convert canvas to texture
    scene.textures.addCanvas(textureKey, canvas);
  }

  static preloadDungeonSprites(scene: Phaser.Scene): void {
    // Try to load custom sprite assets if they exist
    const assetPath = 'assets/sprites/dungeons/';
    
    Object.keys(this.CATEGORY_CONFIGS).forEach(category => {
      const lowerCategory = category.toLowerCase();
      const assetKey = `dungeon-${lowerCategory}-asset`;
      
      // Attempt to load custom asset
      scene.load.image(assetKey, `${assetPath}${lowerCategory}.png`);
      
      // Set up error handling for failed loads
      scene.load.on(`fileerror-image-${assetKey}`, () => {
        console.warn(`Failed to load custom sprite for ${category}, using procedural generation`);
      });
    });
  }

  static validateDungeonSprites(scene: Phaser.Scene): boolean {
    const requiredCategories: WorkCategory[] = ['FREELANCE', 'COMMUNITY', 'CORPORATE'];
    
    return requiredCategories.every(category => {
      const spriteKey = this.getDungeonSpriteKey({ type: category } as Dungeon, scene);
      return scene.textures.exists(spriteKey);
    });
  }
}