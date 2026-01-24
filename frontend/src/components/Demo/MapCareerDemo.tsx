import React from 'react';
import MainNavigation from '../Navigation/MainNavigation';
import { User, CharacterData, UserStats } from '../../../../shared/types';

const MapCareerDemo: React.FC = () => {
  // Mock user data for demonstration
  const mockUser: User = {
    id: 'demo-user-123',
    username: 'GoodGridHero',
    email: 'hero@goodgrid.com',
    characterData: {
      baseSprite: 'DEFAULT',
      colorPalette: {
        primary: '#feca57',
        secondary: '#48dbfb',
        accent: '#ff9ff3'
      },
      accessories: [
        {
          id: 'crown-1',
          name: 'Achievement Crown',
          type: 'HAT',
          unlockCondition: 'Complete 10 tasks'
        }
      ],
      unlockedItems: []
    },
    locationData: {
      coordinates: { x: 400, y: 300 },
      currentZone: 'starter-town',
      discoveredDungeons: ['freelance-tower-1', 'community-garden-1']
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date()
  };

  const mockCharacterData: CharacterData = {
    baseSprite: 'DEFAULT',
    colorPalette: {
      primary: '#feca57',
      secondary: '#48dbfb',
      accent: '#ff9ff3'
    },
    accessories: [
      {
        id: 'crown-1',
        name: 'Achievement Crown',
        type: 'HAT',
        unlockCondition: 'Complete 10 tasks'
      }
    ],
    unlockedItems: []
  };

  const mockUserStats: UserStats = {
    userId: 'demo-user-123',
    trustScore: 87,
    rwisScore: 145,
    xpPoints: 2850,
    currentLevel: 12,
    unlockedZones: ['starter-town', 'tech-district', 'community-hub'],
    categoryStats: {
      freelance: {
        tasksCompleted: 15,
        totalXP: 800,
        averageRating: 4.8,
        specializations: ['web-development', 'ui-design', 'react']
      },
      community: {
        tasksCompleted: 23,
        totalXP: 1200,
        averageRating: 4.9,
        specializations: ['environmental', 'education', 'mentoring']
      },
      corporate: {
        tasksCompleted: 8,
        totalXP: 850,
        averageRating: 4.5,
        specializations: ['project-management', 'consulting', 'strategy']
      }
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <MainNavigation
        user={mockUser}
        characterData={mockCharacterData}
        userStats={mockUserStats}
        authToken="demo-token"
      />
    </div>
  );
};

export default MapCareerDemo;