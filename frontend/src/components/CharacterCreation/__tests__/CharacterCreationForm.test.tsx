import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CharacterCreationForm from '../CharacterCreationForm';
import { CharacterData, AccessoryItem } from '../../../../../shared/types';

const mockInitialCharacterData: CharacterData = {
  baseSprite: 'DEFAULT',
  colorPalette: {
    primary: '#FFB6C1',
    secondary: '#87CEEB',
    accent: '#98FB98'
  },
  accessories: [],
  unlockedItems: []
};

const mockAvailableAccessories: AccessoryItem[] = [
  {
    id: 'hat-1',
    name: 'Basic Cap',
    type: 'HAT',
    unlockCondition: 'starter'
  },
  {
    id: 'glasses-1',
    name: 'Simple Glasses',
    type: 'GLASSES',
    unlockCondition: 'starter'
  }
];

const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

// Mock the CharacterCanvas component since it uses canvas
jest.mock('../CharacterCanvas', () => {
  return function MockCharacterCanvas() {
    return <div data-testid="character-canvas">Character Preview</div>;
  };
});

beforeEach(() => {
  mockOnSave.mockClear();
  mockOnCancel.mockClear();
});

describe('CharacterCreationForm', () => {
  it('renders form with all sections', () => {
    render(
      <CharacterCreationForm
        initialCharacterData={mockInitialCharacterData}
        availableAccessories={mockAvailableAccessories}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByText('Create Your Character')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Character Style')).toBeInTheDocument();
    expect(screen.getByText('Character Colors')).toBeInTheDocument();
    expect(screen.getByText('Accessories')).toBeInTheDocument();
  });

  it('displays character preview', () => {
    render(
      <CharacterCreationForm
        initialCharacterData={mockInitialCharacterData}
        availableAccessories={mockAvailableAccessories}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByTestId('character-canvas')).toBeInTheDocument();
  });

  it('shows save, reset, and cancel buttons', () => {
    render(
      <CharacterCreationForm
        initialCharacterData={mockInitialCharacterData}
        availableAccessories={mockAvailableAccessories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Save Character')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not show cancel button when onCancel is not provided', () => {
    render(
      <CharacterCreationForm
        initialCharacterData={mockInitialCharacterData}
        availableAccessories={mockAvailableAccessories}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('calls onSave with character data when save button is clicked', () => {
    render(
      <CharacterCreationForm
        initialCharacterData={mockInitialCharacterData}
        availableAccessories={mockAvailableAccessories}
        onSave={mockOnSave}
      />
    );
    
    const saveButton = screen.getByText('Save Character');
    fireEvent.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith(mockInitialCharacterData);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <CharacterCreationForm
        initialCharacterData={mockInitialCharacterData}
        availableAccessories={mockAvailableAccessories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('resets character data when reset button is clicked', async () => {
    render(
      <CharacterCreationForm
        initialCharacterData={mockInitialCharacterData}
        availableAccessories={mockAvailableAccessories}
        onSave={mockOnSave}
      />
    );
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // After reset, save should be called with default values
    const saveButton = screen.getByText('Save Character');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          baseSprite: 'DEFAULT',
          accessories: []
        })
      );
    });
  });

  it('disables buttons when loading', () => {
    render(
      <CharacterCreationForm
        initialCharacterData={mockInitialCharacterData}
        availableAccessories={mockAvailableAccessories}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );
    
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Saving...')).toBeDisabled();
  });

  it('updates character data when sprite type changes', async () => {
    render(
      <CharacterCreationForm
        initialCharacterData={mockInitialCharacterData}
        availableAccessories={mockAvailableAccessories}
        onSave={mockOnSave}
      />
    );
    
    // Find and click the Professional sprite type
    const professionalButton = screen.getByText('Professional').closest('button');
    fireEvent.click(professionalButton!);
    
    // Save and check the updated data
    const saveButton = screen.getByText('Save Character');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          baseSprite: 'PROFESSIONAL'
        })
      );
    });
  });

  it('displays preview info correctly', () => {
    const characterWithAccessories: CharacterData = {
      ...mockInitialCharacterData,
      baseSprite: 'CREATIVE',
      accessories: [mockAvailableAccessories[0]]
    };

    render(
      <CharacterCreationForm
        initialCharacterData={characterWithAccessories}
        availableAccessories={mockAvailableAccessories}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Style: CREATIVE';
    })).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Accessories: 1';
    })).toBeInTheDocument();
  });

  it('handles empty available accessories gracefully', () => {
    render(
      <CharacterCreationForm
        initialCharacterData={mockInitialCharacterData}
        availableAccessories={[]}
        onSave={mockOnSave}
      />
    );
    
    expect(screen.getByText(/no accessories available yet/i)).toBeInTheDocument();
  });

  it('uses default values when no initial data provided', () => {
    render(
      <CharacterCreationForm
        availableAccessories={mockAvailableAccessories}
        onSave={mockOnSave}
      />
    );
    
    const saveButton = screen.getByText('Save Character');
    fireEvent.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        baseSprite: 'DEFAULT',
        accessories: [],
        unlockedItems: []
      })
    );
  });
});