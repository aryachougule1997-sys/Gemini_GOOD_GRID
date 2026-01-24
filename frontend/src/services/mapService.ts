import { Zone, Dungeon, Coordinates, ApiResponse, TerrainType, DifficultyLevel, WorkCategory } from '../../../shared/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export class MapService {
  // Demo mode flag - set to true to work without backend
  private static readonly DEMO_MODE = true;

  /**
   * Get all zones for the map (demo mode returns defaults)
   */
  static async getZones(): Promise<ApiResponse<Zone[]>> {
    if (this.DEMO_MODE) {
      return {
        success: true,
        data: this.getDefaultZones(),
        message: 'Default zones loaded (demo mode)'
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/zones`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading zones:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load zones'
      };
    }
  }

  /**
   * Get dungeons for a specific zone or all dungeons (demo mode returns defaults)
   */
  static async getDungeons(zoneId?: string): Promise<ApiResponse<Dungeon[]>> {
    if (this.DEMO_MODE) {
      const allDungeons = this.getDefaultDungeons();
      const filteredDungeons = zoneId 
        ? allDungeons.filter(dungeon => dungeon.zoneId === zoneId)
        : allDungeons;
      
      return {
        success: true,
        data: filteredDungeons,
        message: 'Default dungeons loaded (demo mode)'
      };
    }

    try {
      const url = zoneId 
        ? `${API_BASE_URL}/zones/${zoneId}/dungeons`
        : `${API_BASE_URL}/dungeons`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading dungeons:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load dungeons'
      };
    }
  }

  /**
   * Update player position (demo mode saves to localStorage)
   */
  static async updatePlayerPosition(userId: string, position: Coordinates): Promise<ApiResponse<void>> {
    if (this.DEMO_MODE) {
      try {
        localStorage.setItem(`player_position_${userId}`, JSON.stringify(position));
        return {
          success: true,
          message: 'Position updated (demo mode)'
        };
      } catch (error) {
        return {
          success: false,
          error: 'Failed to save position to localStorage'
        };
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/position`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(position)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating player position:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update position'
      };
    }
  }

  /**
   * Check if user can access a zone (demo mode always returns true for unlocked zones)
   */
  static async checkZoneAccess(userId: string, zoneId: string): Promise<ApiResponse<boolean>> {
    if (this.DEMO_MODE) {
      // In demo mode, simulate zone access based on basic criteria
      const unlockedZones = ['starter-town', 'green-meadows', 'crystal-peaks', 'azure-lakes'];
      return {
        success: true,
        data: unlockedZones.includes(zoneId),
        message: 'Zone access checked (demo mode)'
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/zones/${zoneId}/access`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking zone access:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check zone access'
      };
    }
  }

  /**
   * Get default zones for development/demo
   */
  static getDefaultZones(): Zone[] {
    return [
      {
        id: 'starter-town',
        name: 'Starter Town',
        terrainType: 'URBAN',
        unlockRequirements: {},
        difficulty: 'BEGINNER',
        coordinates: {
          minX: 0,
          minY: 0,
          maxX: 400,
          maxY: 400
        },
        createdAt: new Date()
      },
      {
        id: 'green-meadows',
        name: 'Green Meadows',
        terrainType: 'FOREST',
        unlockRequirements: {
          level: 2,
          completedTasks: 3
        },
        difficulty: 'BEGINNER',
        coordinates: {
          minX: 400,
          minY: 0,
          maxX: 800,
          maxY: 400
        },
        createdAt: new Date()
      },
      {
        id: 'crystal-peaks',
        name: 'Crystal Peaks',
        terrainType: 'MOUNTAIN',
        unlockRequirements: {
          level: 5,
          trustScore: 50,
          completedTasks: 10
        },
        difficulty: 'INTERMEDIATE',
        coordinates: {
          minX: 0,
          minY: 400,
          maxX: 400,
          maxY: 800
        },
        createdAt: new Date()
      },
      {
        id: 'azure-lakes',
        name: 'Azure Lakes',
        terrainType: 'WATER',
        unlockRequirements: {
          level: 3,
          completedTasks: 5,
          specificBadges: ['water-walker']
        },
        difficulty: 'INTERMEDIATE',
        coordinates: {
          minX: 400,
          minY: 400,
          maxX: 800,
          maxY: 600
        },
        createdAt: new Date()
      },
      {
        id: 'golden-dunes',
        name: 'Golden Dunes',
        terrainType: 'DESERT',
        unlockRequirements: {
          level: 7,
          trustScore: 75,
          completedTasks: 20
        },
        difficulty: 'ADVANCED',
        coordinates: {
          minX: 800,
          minY: 0,
          maxX: 1200,
          maxY: 400
        },
        createdAt: new Date()
      },
      {
        id: 'shadow-realm',
        name: 'Shadow Realm',
        terrainType: 'MOUNTAIN',
        unlockRequirements: {
          level: 15,
          trustScore: 100,
          completedTasks: 50,
          specificBadges: ['shadow-walker', 'master-explorer']
        },
        difficulty: 'EXPERT',
        coordinates: {
          minX: 800,
          minY: 400,
          maxX: 1200,
          maxY: 800
        },
        createdAt: new Date()
      }
    ];
  }

  /**
   * Get default dungeons for development/demo
   */
  static getDefaultDungeons(): Dungeon[] {
    return [
      // Starter Town Dungeons
      {
        id: 'starter-freelance-tower',
        type: 'FREELANCE',
        name: 'Beginner\'s Tower',
        zoneId: 'starter-town',
        coordinates: { x: 150, y: 200 },
        entryRequirements: {},
        specialFeatures: ['tutorial-tasks', 'skill-assessment'],
        createdAt: new Date()
      },
      {
        id: 'starter-community-garden',
        type: 'COMMUNITY',
        name: 'Welcome Garden',
        zoneId: 'starter-town',
        coordinates: { x: 250, y: 300 },
        entryRequirements: {},
        specialFeatures: ['community-intro', 'local-connections'],
        createdAt: new Date()
      },
      {
        id: 'starter-corporate-castle',
        type: 'CORPORATE',
        name: 'Training Grounds',
        zoneId: 'starter-town',
        coordinates: { x: 350, y: 150 },
        entryRequirements: {},
        specialFeatures: ['corporate-basics', 'professional-development'],
        createdAt: new Date()
      },
      
      // Green Meadows Dungeons
      {
        id: 'meadows-freelance-tower',
        type: 'FREELANCE',
        name: 'Skill Spire',
        zoneId: 'green-meadows',
        coordinates: { x: 550, y: 200 },
        entryRequirements: { level: 2 },
        specialFeatures: ['advanced-freelancing', 'portfolio-building'],
        createdAt: new Date()
      },
      {
        id: 'meadows-community-garden',
        type: 'COMMUNITY',
        name: 'Harmony Grove',
        zoneId: 'green-meadows',
        coordinates: { x: 650, y: 300 },
        entryRequirements: { level: 2 },
        specialFeatures: ['team-projects', 'environmental-tasks'],
        createdAt: new Date()
      },
      
      // Crystal Peaks Dungeons
      {
        id: 'peaks-freelance-tower',
        type: 'FREELANCE',
        name: 'Summit Spire',
        zoneId: 'crystal-peaks',
        coordinates: { x: 200, y: 600 },
        entryRequirements: { level: 5, trustScore: 50 },
        specialFeatures: ['expert-challenges', 'high-value-projects'],
        createdAt: new Date()
      },
      {
        id: 'peaks-corporate-castle',
        type: 'CORPORATE',
        name: 'Executive Fortress',
        zoneId: 'crystal-peaks',
        coordinates: { x: 300, y: 700 },
        entryRequirements: { level: 5, trustScore: 50 },
        specialFeatures: ['leadership-tasks', 'strategic-projects'],
        createdAt: new Date()
      },
      
      // Azure Lakes Dungeons
      {
        id: 'lakes-community-garden',
        type: 'COMMUNITY',
        name: 'Reflection Sanctuary',
        zoneId: 'azure-lakes',
        coordinates: { x: 600, y: 500 },
        entryRequirements: { level: 3, badges: ['water-walker'] },
        specialFeatures: ['meditation-tasks', 'wellness-projects'],
        createdAt: new Date()
      },
      
      // Golden Dunes Dungeons
      {
        id: 'dunes-freelance-tower',
        type: 'FREELANCE',
        name: 'Mirage Tower',
        zoneId: 'golden-dunes',
        coordinates: { x: 1000, y: 200 },
        entryRequirements: { level: 7, trustScore: 75 },
        specialFeatures: ['legendary-projects', 'master-crafting'],
        createdAt: new Date()
      },
      {
        id: 'dunes-corporate-castle',
        type: 'CORPORATE',
        name: 'Empire Citadel',
        zoneId: 'golden-dunes',
        coordinates: { x: 1100, y: 300 },
        entryRequirements: { level: 7, trustScore: 75 },
        specialFeatures: ['empire-building', 'global-impact'],
        createdAt: new Date()
      },
      
      // Shadow Realm Dungeons
      {
        id: 'shadow-ultimate-tower',
        type: 'FREELANCE',
        name: 'Void Nexus',
        zoneId: 'shadow-realm',
        coordinates: { x: 1000, y: 600 },
        entryRequirements: { level: 15, trustScore: 100, badges: ['shadow-walker'] },
        specialFeatures: ['ultimate-challenges', 'reality-shaping'],
        createdAt: new Date()
      }
    ];
  }

  /**
   * Check if user meets zone unlock requirements
   */
  static checkZoneUnlockRequirements(
    zone: Zone, 
    userLevel: number, 
    userTrustScore: number, 
    completedTasks: number, 
    userBadges: string[]
  ): { canUnlock: boolean; missingRequirements: string[] } {
    const missing: string[] = [];
    
    if (zone.unlockRequirements.level && userLevel < zone.unlockRequirements.level) {
      missing.push(`Level ${zone.unlockRequirements.level} required (current: ${userLevel})`);
    }
    
    if (zone.unlockRequirements.trustScore && userTrustScore < zone.unlockRequirements.trustScore) {
      missing.push(`Trust Score ${zone.unlockRequirements.trustScore} required (current: ${userTrustScore})`);
    }
    
    if (zone.unlockRequirements.completedTasks && completedTasks < zone.unlockRequirements.completedTasks) {
      missing.push(`${zone.unlockRequirements.completedTasks} completed tasks required (current: ${completedTasks})`);
    }
    
    if (zone.unlockRequirements.specificBadges) {
      const missingBadges = zone.unlockRequirements.specificBadges.filter(
        badge => !userBadges.includes(badge)
      );
      if (missingBadges.length > 0) {
        missing.push(`Required badges: ${missingBadges.join(', ')}`);
      }
    }
    
    return {
      canUnlock: missing.length === 0,
      missingRequirements: missing
    };
  }

  /**
   * Get terrain color for rendering
   */
  static getTerrainColor(terrainType: TerrainType): string {
    switch (terrainType) {
      case 'URBAN': return '#666666';
      case 'FOREST': return '#228B22';
      case 'MOUNTAIN': return '#8B7355';
      case 'WATER': return '#4169E1';
      case 'DESERT': return '#F4A460';
      default: return '#666666';
    }
  }

  /**
   * Get difficulty color for UI
   */
  static getDifficultyColor(difficulty: DifficultyLevel): string {
    switch (difficulty) {
      case 'BEGINNER': return '#00ff88';
      case 'INTERMEDIATE': return '#feca57';
      case 'ADVANCED': return '#ff6b6b';
      case 'EXPERT': return '#8a2be2';
      default: return '#666666';
    }
  }

  /**
   * Get work category color
   */
  static getCategoryColor(category: WorkCategory): string {
    switch (category) {
      case 'FREELANCE': return '#3498db';
      case 'COMMUNITY': return '#27ae60';
      case 'CORPORATE': return '#7f8c8d';
      default: return '#666666';
    }
  }

  /**
   * Calculate distance between two coordinates
   */
  static calculateDistance(pos1: Coordinates, pos2: Coordinates): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get authentication token from localStorage
   */
  private static getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}