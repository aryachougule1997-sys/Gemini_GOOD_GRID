import React from 'react';
import { render, screen } from '@testing-library/react';
import CharacterCanvas from '../CharacterCanvas';
import { CharacterData } from '../../../../../shared/types';

// Mock canvas context
const mockGetContext = jest.fn();
const mockClearRect = jest.fn();
const mockFillRect = jest.fn();

beforeEach(() => {
  mockGetContext.mockReturnValue({
    clearRect: mockClearRect,
    fillRect: mockFillRect,
    imageSmoothingEnabled: true
  });
  
  HTMLCanvasElement.prototype.getContext = mockGetContext;
  
  // Reset mocks
  mockClearRect.mockClear();
  mockFillRect.mockClear();
  mockGetContext.mockClear();
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

describe('CharacterCanvas', () => {
  it('renders canvas element with correct dimensions', () => {
    render(<CharacterCanvas characterData={mockCharacterData} width={200} height={200} />);
    
    const canvas = screen.getByTestId('character-canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '200');
    expect(canvas).toHaveAttribute('height', '200');
  });

  it('applies pixelated styling to canvas', () => {
    render(<CharacterCanvas characterData={mockCharacterData} />);
    
    const canvas = screen.getByTestId('character-canvas');
    expect(canvas).toHaveStyle({
      imageRendering: 'pixelated'
    });
  });

  it('calls canvas drawing methods when character data changes', () => {
    const { rerender } = render(<CharacterCanvas characterData={mockCharacterData} />);
    
    expect(mockGetContext).toHaveBeenCalledWith('2d');
    expect(mockClearRect).toHaveBeenCalled();
    expect(mockFillRect).toHaveBeenCalled();

    // Clear mocks and re-render with different data
    mockClearRect.mockClear();
    mockFillRect.mockClear();

    const updatedCharacterData: CharacterData = {
      ...mockCharacterData,
      colorPalette: {
        primary: '#FF0000',
        secondary: '#00FF00',
        accent: '#0000FF'
      }
    };

    rerender(<CharacterCanvas characterData={updatedCharacterData} />);
    
    expect(mockClearRect).toHaveBeenCalled();
    expect(mockFillRect).toHaveBeenCalled();
  });

  it('renders character with accessories', () => {
    const characterWithAccessories: CharacterData = {
      ...mockCharacterData,
      accessories: [
        {
          id: 'hat-1',
          name: 'Test Hat',
          type: 'HAT',
          unlockCondition: 'test'
        },
        {
          id: 'glasses-1',
          name: 'Test Glasses',
          type: 'GLASSES',
          unlockCondition: 'test'
        }
      ]
    };

    render(<CharacterCanvas characterData={characterWithAccessories} />);
    
    // Should call fillRect more times due to accessories
    expect(mockFillRect).toHaveBeenCalled();
  });

  it('handles missing canvas context gracefully', () => {
    mockGetContext.mockReturnValue(null);
    
    expect(() => {
      render(<CharacterCanvas characterData={mockCharacterData} />);
    }).not.toThrow();
  });

  it('uses default dimensions when not provided', () => {
    render(<CharacterCanvas characterData={mockCharacterData} />);
    
    const canvas = screen.getByTestId('character-canvas');
    expect(canvas).toHaveAttribute('width', '200');
    expect(canvas).toHaveAttribute('height', '200');
  });

  it('applies custom scale factor', () => {
    render(<CharacterCanvas characterData={mockCharacterData} scale={8} />);
    
    expect(mockGetContext).toHaveBeenCalledWith('2d');
    expect(mockFillRect).toHaveBeenCalled();
  });
});