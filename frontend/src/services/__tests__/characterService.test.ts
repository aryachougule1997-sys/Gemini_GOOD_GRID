import { CharacterService } from '../characterService';
import { CharacterData, AccessoryItem } from '../../../../shared/types';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

const mockCharacterData: CharacterData = {
  baseSprite: 'DEFAULT',
  colorPalette: {
    primary: '#FFB6C1',
    secondary: '#87CEEB',
    accent: '#98FB98'
  },
  accessories: [],
  unlockedItems: []
};

beforeEach(() => {
  mockFetch.mockClear();
  mockLocalStorage.getItem.mockClear();
  mockLocalStorage.getItem.mockReturnValue('mock-token');
});

describe('CharacterService', () => {
  describe('saveCharacter', () => {
    it('successfully saves character data', async () => {
      const mockResponse = {
        success: true,
        data: mockCharacterData
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await CharacterService.saveCharacter('user-123', mockCharacterData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/users/user-123/character',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token'
          },
          body: JSON.stringify(mockCharacterData)
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('handles save errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response);

      const result = await CharacterService.saveCharacter('user-123', mockCharacterData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP error! status: 500');
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await CharacterService.saveCharacter('user-123', mockCharacterData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('loadCharacter', () => {
    it('successfully loads character data', async () => {
      const mockResponse = {
        success: true,
        data: mockCharacterData
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await CharacterService.loadCharacter('user-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/users/user-123/character',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer mock-token'
          }
        })
      );

      expect(result).toEqual(mockResponse);
    });

    it('handles load errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      } as Response);

      const result = await CharacterService.loadCharacter('user-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP error! status: 404');
    });
  });

  describe('getAvailableAccessories', () => {
    it('successfully loads available accessories', async () => {
      const mockAccessories: AccessoryItem[] = [
        {
          id: 'hat-1',
          name: 'Basic Cap',
          type: 'HAT',
          unlockCondition: 'starter'
        }
      ];

      const mockResponse = {
        success: true,
        data: mockAccessories
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const result = await CharacterService.getAvailableAccessories('user-123');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/users/user-123/accessories',
        expect.objectContaining({
          headers: {
            'Authorization': 'Bearer mock-token'
          }
        })
      );

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDefaultAccessories', () => {
    it('returns default starter accessories', () => {
      const accessories = CharacterService.getDefaultAccessories();

      expect(accessories).toHaveLength(3);
      expect(accessories[0]).toEqual(
        expect.objectContaining({
          name: 'Basic Cap',
          type: 'HAT',
          unlockCondition: 'starter'
        })
      );
    });
  });

  describe('createDefaultCharacter', () => {
    it('returns default character data', () => {
      const character = CharacterService.createDefaultCharacter();

      expect(character).toEqual({
        baseSprite: 'DEFAULT',
        colorPalette: {
          primary: '#FFB6C1',
          secondary: '#87CEEB',
          accent: '#98FB98'
        },
        accessories: [],
        unlockedItems: []
      });
    });
  });

  describe('validateCharacterData', () => {
    it('validates correct character data', () => {
      const result = CharacterService.validateCharacterData(mockCharacterData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects invalid sprite type', () => {
      const invalidCharacter = {
        ...mockCharacterData,
        baseSprite: 'INVALID' as any
      };

      const result = CharacterService.validateCharacterData(invalidCharacter);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid sprite type');
    });

    it('detects invalid color format', () => {
      const invalidCharacter = {
        ...mockCharacterData,
        colorPalette: {
          primary: 'invalid-color',
          secondary: '#87CEEB',
          accent: '#98FB98'
        }
      };

      const result = CharacterService.validateCharacterData(invalidCharacter);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid primary color format');
    });

    it('detects invalid accessories array', () => {
      const invalidCharacter = {
        ...mockCharacterData,
        accessories: 'not-an-array' as any
      };

      const result = CharacterService.validateCharacterData(invalidCharacter);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Accessories must be an array');
    });

    it('detects invalid accessory objects', () => {
      const invalidCharacter = {
        ...mockCharacterData,
        accessories: [{ id: '', name: '', type: '' }] as any
      };

      const result = CharacterService.validateCharacterData(invalidCharacter);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid accessory at index 0');
    });
  });

  describe('generateCharacterPreview', () => {
    // Mock canvas and context
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(),
      toDataURL: jest.fn()
    };

    const mockContext = {
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      imageSmoothingEnabled: true
    };

    beforeEach(() => {
      mockCanvas.getContext.mockReturnValue(mockContext);
      mockCanvas.toDataURL.mockReturnValue('data:image/png;base64,mock-data');
      
      // Mock document.createElement
      jest.spyOn(document, 'createElement').mockReturnValue(mockCanvas as any);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('generates character preview data URL', () => {
      const result = CharacterService.generateCharacterPreview(mockCharacterData);

      expect(document.createElement).toHaveBeenCalledWith('canvas');
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockCanvas.toDataURL).toHaveBeenCalled();
      expect(result).toBe('data:image/png;base64,mock-data');
    });

    it('handles missing canvas context', () => {
      mockCanvas.getContext.mockReturnValue(null);

      const result = CharacterService.generateCharacterPreview(mockCharacterData);

      expect(result).toBe('');
    });

    it('uses custom size parameter', () => {
      CharacterService.generateCharacterPreview(mockCharacterData, 128);

      expect(mockCanvas.width).toBe(128);
      expect(mockCanvas.height).toBe(128);
    });
  });
});