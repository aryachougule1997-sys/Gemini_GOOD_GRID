import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DungeonIcon from '../DungeonIcon';
import { Dungeon, WorkCategory } from '../../../../../shared/types';

const mockDungeon: Dungeon = {
  id: 'test-dungeon-1',
  type: 'FREELANCE' as WorkCategory,
  name: 'Test Freelance Tower',
  zoneId: 'starter-town',
  coordinates: { x: 100, y: 100 },
  spriteAsset: 'test-tower.png',
  entryRequirements: { trustScore: 10, level: 1 },
  specialFeatures: ['client_meeting_rooms', 'portfolio_showcase'],
  availableTasks: [
    {
      id: 'task-1',
      title: 'Test Task',
      description: 'A test task',
      category: 'FREELANCE' as WorkCategory,
      dungeonId: 'test-dungeon-1',
      creatorId: 'creator-1',
      requirements: { skills: [], trustScoreMin: 10, timeCommitment: 2 },
      rewards: { xp: 100, trustScoreBonus: 5, rwisPoints: 25 },
      status: 'OPEN',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  createdAt: new Date()
};

const mockUserPosition = { x: 100, y: 100 };

describe('DungeonIcon', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  test('renders dungeon icon with name', () => {
    render(
      <DungeonIcon
        dungeon={mockDungeon}
        userPosition={mockUserPosition}
        isAccessible={true}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Test Freelance Tower')).toBeInTheDocument();
  });

  test('shows task count badge when tasks are available', () => {
    render(
      <DungeonIcon
        dungeon={mockDungeon}
        userPosition={mockUserPosition}
        isAccessible={true}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument(); // Task count badge
  });

  test('shows lock indicator when not accessible', () => {
    render(
      <DungeonIcon
        dungeon={mockDungeon}
        userPosition={mockUserPosition}
        isAccessible={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('🔒')).toBeInTheDocument();
  });

  test('shows interaction hint when in range and accessible', () => {
    render(
      <DungeonIcon
        dungeon={mockDungeon}
        userPosition={mockUserPosition} // Same position as dungeon
        isAccessible={true}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Click to enter')).toBeInTheDocument();
  });

  test('calls onClick when clicked and accessible', () => {
    render(
      <DungeonIcon
        dungeon={mockDungeon}
        userPosition={mockUserPosition}
        isAccessible={true}
        onClick={mockOnClick}
      />
    );

    fireEvent.click(screen.getByText('Test Freelance Tower').closest('.dungeon-icon')!);
    expect(mockOnClick).toHaveBeenCalledWith(mockDungeon);
  });

  test('does not call onClick when not accessible', () => {
    render(
      <DungeonIcon
        dungeon={mockDungeon}
        userPosition={mockUserPosition}
        isAccessible={false}
        onClick={mockOnClick}
      />
    );

    fireEvent.click(screen.getByText('Test Freelance Tower').closest('.dungeon-icon')!);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  test('applies correct CSS class for dungeon type', () => {
    const { container } = render(
      <DungeonIcon
        dungeon={mockDungeon}
        userPosition={mockUserPosition}
        isAccessible={true}
        onClick={mockOnClick}
      />
    );

    expect(container.querySelector('.dungeon-icon.freelance')).toBeInTheDocument();
  });

  test('shows special features indicator when features exist', () => {
    render(
      <DungeonIcon
        dungeon={mockDungeon}
        userPosition={mockUserPosition}
        isAccessible={true}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('✨')).toBeInTheDocument();
  });

  test('applies scale transformation', () => {
    const { container } = render(
      <DungeonIcon
        dungeon={mockDungeon}
        userPosition={mockUserPosition}
        isAccessible={true}
        onClick={mockOnClick}
        scale={1.5}
      />
    );

    const dungeonIcon = container.querySelector('.dungeon-icon');
    expect(dungeonIcon).toHaveStyle('transform: scale(1.5)');
  });

  test('handles different work categories', () => {
    const communityDungeon = {
      ...mockDungeon,
      type: 'COMMUNITY' as WorkCategory,
      name: 'Community Garden'
    };

    const { container } = render(
      <DungeonIcon
        dungeon={communityDungeon}
        userPosition={mockUserPosition}
        isAccessible={true}
        onClick={mockOnClick}
      />
    );

    expect(container.querySelector('.dungeon-icon.community')).toBeInTheDocument();
    expect(screen.getByText('Community Garden')).toBeInTheDocument();
  });
});