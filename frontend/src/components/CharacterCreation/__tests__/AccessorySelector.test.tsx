import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AccessorySelector from '../AccessorySelector';
import { AccessoryItem } from '../../../../../shared/types';

const mockAvailableAccessories: AccessoryItem[] = [
  {
    id: 'hat-1',
    name: 'Basic Cap',
    type: 'HAT',
    unlockCondition: 'starter'
  },
  {
    id: 'hat-2',
    name: 'Fancy Hat',
    type: 'HAT',
    unlockCondition: 'level_5'
  },
  {
    id: 'glasses-1',
    name: 'Simple Glasses',
    type: 'GLASSES',
    unlockCondition: 'starter'
  },
  {
    id: 'tool-1',
    name: 'Beginner Tool',
    type: 'TOOL',
    unlockCondition: 'first_task'
  }
];

const mockSelectedAccessories: AccessoryItem[] = [
  {
    id: 'hat-1',
    name: 'Basic Cap',
    type: 'HAT',
    unlockCondition: 'starter'
  }
];

const mockOnAccessoryToggle = jest.fn();

beforeEach(() => {
  mockOnAccessoryToggle.mockClear();
});

describe('AccessorySelector', () => {
  it('renders accessories section title', () => {
    render(
      <AccessorySelector
        selectedAccessories={[]}
        availableAccessories={mockAvailableAccessories}
        onAccessoryToggle={mockOnAccessoryToggle}
      />
    );
    
    expect(screen.getByText('Accessories')).toBeInTheDocument();
  });

  it('groups accessories by type', () => {
    render(
      <AccessorySelector
        selectedAccessories={[]}
        availableAccessories={mockAvailableAccessories}
        onAccessoryToggle={mockOnAccessoryToggle}
      />
    );
    
    expect(screen.getByText('Hats')).toBeInTheDocument();
    expect(screen.getByText('Glasses')).toBeInTheDocument();
    expect(screen.getByText('Tools')).toBeInTheDocument();
  });

  it('displays all available accessories', () => {
    render(
      <AccessorySelector
        selectedAccessories={[]}
        availableAccessories={mockAvailableAccessories}
        onAccessoryToggle={mockOnAccessoryToggle}
      />
    );
    
    expect(screen.getByText('Basic Cap')).toBeInTheDocument();
    expect(screen.getByText('Fancy Hat')).toBeInTheDocument();
    expect(screen.getByText('Simple Glasses')).toBeInTheDocument();
    expect(screen.getByText('Beginner Tool')).toBeInTheDocument();
  });

  it('marks selected accessories with selected class', () => {
    render(
      <AccessorySelector
        selectedAccessories={mockSelectedAccessories}
        availableAccessories={mockAvailableAccessories}
        onAccessoryToggle={mockOnAccessoryToggle}
      />
    );
    
    const basicCapButton = screen.getByText('Basic Cap').closest('button');
    const fancyHatButton = screen.getByText('Fancy Hat').closest('button');
    
    expect(basicCapButton).toHaveClass('selected');
    expect(fancyHatButton).not.toHaveClass('selected');
  });

  it('calls onAccessoryToggle when accessory is clicked', () => {
    render(
      <AccessorySelector
        selectedAccessories={[]}
        availableAccessories={mockAvailableAccessories}
        onAccessoryToggle={mockOnAccessoryToggle}
      />
    );
    
    const basicCapButton = screen.getByText('Basic Cap').closest('button');
    fireEvent.click(basicCapButton!);
    
    expect(mockOnAccessoryToggle).toHaveBeenCalledWith(mockAvailableAccessories[0]);
  });

  it('displays appropriate icons for accessory types', () => {
    render(
      <AccessorySelector
        selectedAccessories={[]}
        availableAccessories={mockAvailableAccessories}
        onAccessoryToggle={mockOnAccessoryToggle}
      />
    );
    
    // Check for emoji icons (this is a simple check, in a real app you might use data-testid)
    expect(screen.getByText('🎩')).toBeInTheDocument(); // Hat icon
    expect(screen.getByText('👓')).toBeInTheDocument(); // Glasses icon
    expect(screen.getByText('🔧')).toBeInTheDocument(); // Tool icon
  });

  it('shows no accessories message when list is empty', () => {
    render(
      <AccessorySelector
        selectedAccessories={[]}
        availableAccessories={[]}
        onAccessoryToggle={mockOnAccessoryToggle}
      />
    );
    
    expect(screen.getByText(/no accessories available yet/i)).toBeInTheDocument();
    expect(screen.getByText(/complete tasks to unlock accessories/i)).toBeInTheDocument();
  });

  it('does not render empty categories', () => {
    const onlyHats: AccessoryItem[] = [
      {
        id: 'hat-1',
        name: 'Basic Cap',
        type: 'HAT',
        unlockCondition: 'starter'
      }
    ];

    render(
      <AccessorySelector
        selectedAccessories={[]}
        availableAccessories={onlyHats}
        onAccessoryToggle={mockOnAccessoryToggle}
      />
    );
    
    expect(screen.getByText('Hats')).toBeInTheDocument();
    expect(screen.queryByText('Glasses')).not.toBeInTheDocument();
    expect(screen.queryByText('Tools')).not.toBeInTheDocument();
  });

  it('handles multiple accessories of the same type', () => {
    render(
      <AccessorySelector
        selectedAccessories={[]}
        availableAccessories={mockAvailableAccessories}
        onAccessoryToggle={mockOnAccessoryToggle}
      />
    );
    
    // Should show both hats under the Hats category
    expect(screen.getByText('Basic Cap')).toBeInTheDocument();
    expect(screen.getByText('Fancy Hat')).toBeInTheDocument();
  });

  it('provides tooltips for accessory items', () => {
    render(
      <AccessorySelector
        selectedAccessories={[]}
        availableAccessories={mockAvailableAccessories}
        onAccessoryToggle={mockOnAccessoryToggle}
      />
    );
    
    const basicCapButton = screen.getByText('Basic Cap').closest('button');
    expect(basicCapButton).toHaveAttribute('title', 'Basic Cap');
  });
});