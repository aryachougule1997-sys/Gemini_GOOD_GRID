import { CharacterData, AccessoryItem, ApiResponse } from '../../../shared/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export class CharacterService {
  // Demo mode flag - set to true to work without backend
  private static readonly DEMO_MODE = true;

  /**
   * Save character data to the backend (or localStorage in demo mode)
   */
  static async saveCharacter(userId: string, characterData: CharacterData): Promise<ApiResponse<CharacterData>> {
    if (this.DEMO_MODE) {
      // In demo mode, save to localStorage
      try {
        localStorage.setItem(`character_${userId}`, JSON.stringify(characterData));
        return {
          success: true,
          data: characterData,
          message: 'Character saved successfully (demo mode)'
        };
      } catch (error) {
        return {
          success: false,
          error: 'Failed to save character to localStorage'
        };
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/character`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(characterData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving character:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save character'
      };
    }
  }

  /**
   * Load character data from the backend (or localStorage in demo mode)
   */
  static async loadCharacter(userId: string): Promise<ApiResponse<CharacterData>> {
    if (this.DEMO_MODE) {
      // In demo mode, load from localStorage
      try {
        const saved = localStorage.getItem(`character_${userId}`);
        if (saved) {
          const characterData = JSON.parse(saved);
          return {
            success: true,
            data: characterData,
            message: 'Character loaded successfully (demo mode)'
          };
        } else {
          return {
            success: false,
            error: 'No saved character found'
          };
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to load character from localStorage'
        };
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/character`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading character:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load character'
      };
    }
  }

  /**
   * Get available accessories for the user (demo mode returns defaults)
   */
  static async getAvailableAccessories(userId: string): Promise<ApiResponse<AccessoryItem[]>> {
    if (this.DEMO_MODE) {
      // In demo mode, return default accessories
      return {
        success: true,
        data: this.getDefaultAccessories(),
        message: 'Default accessories loaded (demo mode)'
      };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/accessories`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error loading accessories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load accessories'
      };
    }
  }

  /**
   * Get default starter accessories
   */
  static getDefaultAccessories(): AccessoryItem[] {
    return [
      {
        id: 'starter-hat-1',
        name: 'Basic Cap',
        type: 'HAT',
        unlockCondition: 'starter'
      },
      {
        id: 'starter-glasses-1',
        name: 'Simple Glasses',
        type: 'GLASSES',
        unlockCondition: 'starter'
      },
      {
        id: 'starter-tool-1',
        name: 'Beginner Tool',
        type: 'TOOL',
        unlockCondition: 'starter'
      }
    ];
  }

  /**
   * Create default character data
   */
  static createDefaultCharacter(): CharacterData {
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

  /**
   * Validate character data
   */
  static validateCharacterData(characterData: CharacterData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate base sprite
    const validSpriteTypes = ['DEFAULT', 'CASUAL', 'PROFESSIONAL', 'CREATIVE'];
    if (!validSpriteTypes.includes(characterData.baseSprite)) {
      errors.push('Invalid sprite type');
    }

    // Validate color palette
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    if (!hexColorRegex.test(characterData.colorPalette.primary)) {
      errors.push('Invalid primary color format');
    }
    if (!hexColorRegex.test(characterData.colorPalette.secondary)) {
      errors.push('Invalid secondary color format');
    }
    if (!hexColorRegex.test(characterData.colorPalette.accent)) {
      errors.push('Invalid accent color format');
    }

    // Validate accessories
    if (!Array.isArray(characterData.accessories)) {
      errors.push('Accessories must be an array');
    } else {
      characterData.accessories.forEach((accessory, index) => {
        if (!accessory.id || !accessory.name || !accessory.type) {
          errors.push(`Invalid accessory at index ${index}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get authentication token from localStorage
   */
  private static getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  /**
   * Generate character preview as data URL
   */
  static generateCharacterPreview(characterData: CharacterData, size: number = 64): string {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return '';
    }

    // Disable image smoothing for pixelated effect
    ctx.imageSmoothingEnabled = false;
    
    // Simple character rendering for preview
    const scale = size / 16; // 16x16 base size
    
    // Head
    ctx.fillStyle = characterData.colorPalette.primary;
    ctx.fillRect(6 * scale, 2 * scale, 4 * scale, 4 * scale);
    
    // Eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(7 * scale, 3 * scale, scale, scale);
    ctx.fillRect(9 * scale, 3 * scale, scale, scale);
    
    // Body
    ctx.fillStyle = characterData.colorPalette.secondary;
    ctx.fillRect(6 * scale, 6 * scale, 4 * scale, 6 * scale);
    
    // Arms
    ctx.fillStyle = characterData.colorPalette.primary;
    ctx.fillRect(4 * scale, 7 * scale, 2 * scale, 4 * scale);
    ctx.fillRect(10 * scale, 7 * scale, 2 * scale, 4 * scale);
    
    // Legs
    ctx.fillStyle = characterData.colorPalette.accent;
    ctx.fillRect(6 * scale, 12 * scale, 2 * scale, 4 * scale);
    ctx.fillRect(8 * scale, 12 * scale, 2 * scale, 4 * scale);

    return canvas.toDataURL();
  }
}