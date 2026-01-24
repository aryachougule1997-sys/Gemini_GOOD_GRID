import { Coordinates, ApiResponse } from '../../../shared/types';

export interface MovementState {
  position: Coordinates;
  direction: string;
  isMoving: boolean;
  lastUpdate: number;
}

export class CharacterMovementService {
  private static readonly DEMO_MODE = true;
  private static readonly POSITION_UPDATE_INTERVAL = 5000; // 5 seconds
  private static lastSaveTime = 0;

  /**
   * Save character position to storage (demo mode uses localStorage)
   */
  static async savePosition(userId: string, position: Coordinates): Promise<ApiResponse<void>> {
    if (this.DEMO_MODE) {
      try {
        const movementState: MovementState = {
          position,
          direction: 'down',
          isMoving: false,
          lastUpdate: Date.now()
        };
        
        localStorage.setItem(`character_movement_${userId}`, JSON.stringify(movementState));
        
        return {
          success: true,
          message: 'Position saved (demo mode)'
        };
      } catch (error) {
        return {
          success: false,
          error: 'Failed to save position to localStorage'
        };
      }
    }

    // Production API call would go here
    try {
      const response = await fetch(`/api/users/${userId}/movement`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ position })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save position'
      };
    }
  }

  /**
   * Load character position from storage
   */
  static async loadPosition(userId: string): Promise<ApiResponse<MovementState>> {
    if (this.DEMO_MODE) {
      try {
        const saved = localStorage.getItem(`character_movement_${userId}`);
        
        if (saved) {
          const movementState: MovementState = JSON.parse(saved);
          return {
            success: true,
            data: movementState,
            message: 'Position loaded (demo mode)'
          };
        } else {
          // Return default position
          return {
            success: true,
            data: {
              position: { x: 200, y: 200 },
              direction: 'down',
              isMoving: false,
              lastUpdate: Date.now()
            },
            message: 'Default position (demo mode)'
          };
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to load position from localStorage'
        };
      }
    }

    // Production API call would go here
    try {
      const response = await fetch(`/api/users/${userId}/movement`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load position'
      };
    }
  }

  /**
   * Debounced position saving to avoid too frequent updates
   */
  static async savePositionDebounced(userId: string, position: Coordinates): Promise<void> {
    const now = Date.now();
    
    if (now - this.lastSaveTime > this.POSITION_UPDATE_INTERVAL) {
      this.lastSaveTime = now;
      await this.savePosition(userId, position);
    }
  }

  /**
   * Validate if position is within allowed bounds
   */
  static isValidPosition(position: Coordinates, worldBounds: { width: number; height: number }): boolean {
    return position.x >= 0 && 
           position.x <= worldBounds.width && 
           position.y >= 0 && 
           position.y <= worldBounds.height;
  }

  /**
   * Calculate movement speed based on terrain type
   */
  static getMovementSpeed(terrainType: string): number {
    switch (terrainType) {
      case 'URBAN':
        return 200; // Normal speed on roads
      case 'FOREST':
        return 150; // Slower in forest
      case 'MOUNTAIN':
        return 120; // Slowest on mountains
      case 'WATER':
        return 100; // Very slow in water (if allowed)
      case 'DESERT':
        return 160; // Slightly slower in sand
      default:
        return 200;
    }
  }

  /**
   * Check if character can move to a specific terrain type
   */
  static canMoveToTerrain(terrainType: string, userBadges: string[]): boolean {
    switch (terrainType) {
      case 'WATER':
        return userBadges.includes('water-walker');
      case 'MOUNTAIN':
        return userBadges.includes('mountain-climber') || terrainType !== 'MOUNTAIN';
      case 'DESERT':
        return userBadges.includes('desert-wanderer') || terrainType !== 'DESERT';
      default:
        return true;
    }
  }

  /**
   * Get terrain type at specific coordinates
   */
  static getTerrainAtPosition(position: Coordinates, zones: any[]): string {
    for (const zone of zones) {
      if (position.x >= zone.coordinates.minX && 
          position.x <= zone.coordinates.maxX &&
          position.y >= zone.coordinates.minY && 
          position.y <= zone.coordinates.maxY) {
        return zone.terrainType;
      }
    }
    return 'URBAN'; // Default terrain
  }

  /**
   * Calculate distance between two positions
   */
  static calculateDistance(pos1: Coordinates, pos2: Coordinates): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get movement direction between two positions
   */
  static getMovementDirection(from: Coordinates, to: Coordinates): string {
    const deltaX = to.x - from.x;
    const deltaY = to.y - from.y;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }

  /**
   * Create movement path with waypoints (for future pathfinding)
   */
  static createMovementPath(from: Coordinates, to: Coordinates, obstacles: Coordinates[]): Coordinates[] {
    // Simple direct path for now - can be enhanced with A* pathfinding later
    return [from, to];
  }

  private static getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}