import { BadgeModel } from '../models/Badge';
import { BadgeCategory, BadgeRarity, BadgeUnlockCriteria } from '../../../shared/types';

export interface BadgeDefinition {
  name: string;
  description: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  iconUrl?: string;
  unlockCriteria: BadgeUnlockCriteria;
}

export class BadgeInitializationService {
  /**
   * Initialize all default badges in the system
   */
  static async initializeDefaultBadges(): Promise<void> {
    const badges = this.getDefaultBadgeDefinitions();
    
    for (const badgeData of badges) {
      try {
        // Check if badge already exists
        const existingBadges = await BadgeModel.findAll();
        const exists = existingBadges.some(badge => badge.name === badgeData.name);
        
        if (!exists) {
          await BadgeModel.create(badgeData);
          console.log(`Created badge: ${badgeData.name}`);
        }
      } catch (error) {
        console.error(`Error creating badge ${badgeData.name}:`, error);
      }
    }
  }

  /**
   * Get all default badge definitions
   */
  private static getDefaultBadgeDefinitions(): BadgeDefinition[] {
    return [
      // Achievement Badges - General Milestones
      {
        name: 'First Steps',
        description: 'Complete your first task on Good Grid',
        category: 'ACHIEVEMENT',
        rarity: 'COMMON',
        iconUrl: '/badges/first-steps.png',
        unlockCriteria: {
          tasksCompleted: 1
        }
      },
      {
        name: 'Getting Started',
        description: 'Complete 5 tasks',
        category: 'ACHIEVEMENT',
        rarity: 'COMMON',
        iconUrl: '/badges/getting-started.png',
        unlockCriteria: {
          tasksCompleted: 5
        }
      },
      {
        name: 'Task Warrior',
        description: 'Complete 25 tasks',
        category: 'ACHIEVEMENT',
        rarity: 'UNCOMMON',
        iconUrl: '/badges/task-warrior.png',
        unlockCriteria: {
          tasksCompleted: 25
        }
      },
      {
        name: 'Dedicated Contributor',
        description: 'Complete 50 tasks',
        category: 'ACHIEVEMENT',
        rarity: 'RARE',
        iconUrl: '/badges/dedicated-contributor.png',
        unlockCriteria: {
          tasksCompleted: 50
        }
      },
      {
        name: 'Master Achiever',
        description: 'Complete 100 tasks',
        category: 'ACHIEVEMENT',
        rarity: 'EPIC',
        iconUrl: '/badges/master-achiever.png',
        unlockCriteria: {
          tasksCompleted: 100
        }
      },
      {
        name: 'Legend',
        description: 'Complete 250 tasks',
        category: 'ACHIEVEMENT',
        rarity: 'LEGENDARY',
        iconUrl: '/badges/legend.png',
        unlockCriteria: {
          tasksCompleted: 250
        }
      },

      // Trust Score Badges
      {
        name: 'Trustworthy',
        description: 'Reach 25 Trust Score',
        category: 'ACHIEVEMENT',
        rarity: 'COMMON',
        iconUrl: '/badges/trustworthy.png',
        unlockCriteria: {
          trustScore: 25
        }
      },
      {
        name: 'Reliable',
        description: 'Reach 50 Trust Score',
        category: 'ACHIEVEMENT',
        rarity: 'UNCOMMON',
        iconUrl: '/badges/reliable.png',
        unlockCriteria: {
          trustScore: 50
        }
      },
      {
        name: 'Dependable',
        description: 'Reach 100 Trust Score',
        category: 'ACHIEVEMENT',
        rarity: 'RARE',
        iconUrl: '/badges/dependable.png',
        unlockCriteria: {
          trustScore: 100
        }
      },
      {
        name: 'Pillar of Trust',
        description: 'Reach 200 Trust Score',
        category: 'ACHIEVEMENT',
        rarity: 'EPIC',
        iconUrl: '/badges/pillar-of-trust.png',
        unlockCriteria: {
          trustScore: 200
        }
      },
      {
        name: 'Trust Champion',
        description: 'Reach 500 Trust Score',
        category: 'ACHIEVEMENT',
        rarity: 'LEGENDARY',
        iconUrl: '/badges/trust-champion.png',
        unlockCriteria: {
          trustScore: 500
        }
      },

      // Category-Specific Badges - Freelance
      {
        name: 'Freelance Starter',
        description: 'Complete 5 freelance tasks',
        category: 'CATEGORY',
        rarity: 'COMMON',
        iconUrl: '/badges/freelance-starter.png',
        unlockCriteria: {
          categoryTasks: {
            freelance: 5
          }
        }
      },
      {
        name: 'Independent Professional',
        description: 'Complete 15 freelance tasks',
        category: 'CATEGORY',
        rarity: 'UNCOMMON',
        iconUrl: '/badges/independent-professional.png',
        unlockCriteria: {
          categoryTasks: {
            freelance: 15
          }
        }
      },
      {
        name: 'Freelance Expert',
        description: 'Complete 30 freelance tasks',
        category: 'CATEGORY',
        rarity: 'RARE',
        iconUrl: '/badges/freelance-expert.png',
        unlockCriteria: {
          categoryTasks: {
            freelance: 30
          }
        }
      },
      {
        name: 'Master Freelancer',
        description: 'Complete 75 freelance tasks',
        category: 'CATEGORY',
        rarity: 'EPIC',
        iconUrl: '/badges/master-freelancer.png',
        unlockCriteria: {
          categoryTasks: {
            freelance: 75
          }
        }
      },

      // Category-Specific Badges - Community
      {
        name: 'Community Helper',
        description: 'Complete 5 community tasks',
        category: 'CATEGORY',
        rarity: 'COMMON',
        iconUrl: '/badges/community-helper.png',
        unlockCriteria: {
          categoryTasks: {
            community: 5
          }
        }
      },
      {
        name: 'Local Champion',
        description: 'Complete 15 community tasks',
        category: 'CATEGORY',
        rarity: 'UNCOMMON',
        iconUrl: '/badges/local-champion.png',
        unlockCriteria: {
          categoryTasks: {
            community: 15
          }
        }
      },
      {
        name: 'Community Leader',
        description: 'Complete 30 community tasks',
        category: 'CATEGORY',
        rarity: 'RARE',
        iconUrl: '/badges/community-leader.png',
        unlockCriteria: {
          categoryTasks: {
            community: 30
          }
        }
      },
      {
        name: 'Social Impact Hero',
        description: 'Complete 75 community tasks',
        category: 'CATEGORY',
        rarity: 'EPIC',
        iconUrl: '/badges/social-impact-hero.png',
        unlockCriteria: {
          categoryTasks: {
            community: 75
          }
        }
      },

      // Category-Specific Badges - Corporate
      {
        name: 'Corporate Contributor',
        description: 'Complete 5 corporate tasks',
        category: 'CATEGORY',
        rarity: 'COMMON',
        iconUrl: '/badges/corporate-contributor.png',
        unlockCriteria: {
          categoryTasks: {
            corporate: 5
          }
        }
      },
      {
        name: 'Professional Partner',
        description: 'Complete 15 corporate tasks',
        category: 'CATEGORY',
        rarity: 'UNCOMMON',
        iconUrl: '/badges/professional-partner.png',
        unlockCriteria: {
          categoryTasks: {
            corporate: 15
          }
        }
      },
      {
        name: 'Corporate Expert',
        description: 'Complete 30 corporate tasks',
        category: 'CATEGORY',
        rarity: 'RARE',
        iconUrl: '/badges/corporate-expert.png',
        unlockCriteria: {
          categoryTasks: {
            corporate: 30
          }
        }
      },
      {
        name: 'Executive Contributor',
        description: 'Complete 75 corporate tasks',
        category: 'CATEGORY',
        rarity: 'EPIC',
        iconUrl: '/badges/executive-contributor.png',
        unlockCriteria: {
          categoryTasks: {
            corporate: 75
          }
        }
      },

      // Multi-Category Badges
      {
        name: 'Well-Rounded',
        description: 'Complete at least 10 tasks in each category',
        category: 'SPECIAL',
        rarity: 'RARE',
        iconUrl: '/badges/well-rounded.png',
        unlockCriteria: {
          categoryTasks: {
            freelance: 10,
            community: 10,
            corporate: 10
          }
        }
      },
      {
        name: 'Triple Threat',
        description: 'Complete at least 25 tasks in each category',
        category: 'SPECIAL',
        rarity: 'EPIC',
        iconUrl: '/badges/triple-threat.png',
        unlockCriteria: {
          categoryTasks: {
            freelance: 25,
            community: 25,
            corporate: 25
          }
        }
      },
      {
        name: 'Master of All',
        description: 'Complete at least 50 tasks in each category',
        category: 'SPECIAL',
        rarity: 'LEGENDARY',
        iconUrl: '/badges/master-of-all.png',
        unlockCriteria: {
          categoryTasks: {
            freelance: 50,
            community: 50,
            corporate: 50
          }
        }
      },

      // Skill-Based Badges
      {
        name: 'Tech Wizard',
        description: 'Complete 20 technology-related tasks',
        category: 'SKILL',
        rarity: 'UNCOMMON',
        iconUrl: '/badges/tech-wizard.png',
        unlockCriteria: {
          skillTasks: {
            'technology': 20
          }
        }
      },
      {
        name: 'Creative Genius',
        description: 'Complete 20 creative tasks',
        category: 'SKILL',
        rarity: 'UNCOMMON',
        iconUrl: '/badges/creative-genius.png',
        unlockCriteria: {
          skillTasks: {
            'creative': 20
          }
        }
      },
      {
        name: 'Communication Expert',
        description: 'Complete 20 communication tasks',
        category: 'SKILL',
        rarity: 'UNCOMMON',
        iconUrl: '/badges/communication-expert.png',
        unlockCriteria: {
          skillTasks: {
            'communication': 20
          }
        }
      },
      {
        name: 'Problem Solver',
        description: 'Complete 20 problem-solving tasks',
        category: 'SKILL',
        rarity: 'UNCOMMON',
        iconUrl: '/badges/problem-solver.png',
        unlockCriteria: {
          skillTasks: {
            'problem-solving': 20
          }
        }
      },

      // Special Achievement Badges
      {
        name: 'Early Adopter',
        description: 'One of the first 100 users on Good Grid',
        category: 'SPECIAL',
        rarity: 'RARE',
        iconUrl: '/badges/early-adopter.png',
        unlockCriteria: {
          tasksCompleted: 1 // Special criteria handled separately
        }
      },
      {
        name: 'Mentor',
        description: 'Help 10 new users complete their first tasks',
        category: 'SPECIAL',
        rarity: 'EPIC',
        iconUrl: '/badges/mentor.png',
        unlockCriteria: {
          mentorships: 10
        }
      },
      {
        name: 'Explorer',
        description: 'Unlock all available zones',
        category: 'SPECIAL',
        rarity: 'EPIC',
        iconUrl: '/badges/explorer.png',
        unlockCriteria: {
          allZonesUnlocked: true
        }
      },
      {
        name: 'Zone Master',
        description: 'Fully explore 5 zones',
        category: 'SPECIAL',
        rarity: 'RARE',
        iconUrl: '/badges/zone-master.png',
        unlockCriteria: {
          zonesFullyExplored: 5
        }
      },

      // Quality and Excellence Badges
      {
        name: 'Quality Focused',
        description: 'Maintain an average rating of 4.5+ over 20 tasks',
        category: 'ACHIEVEMENT',
        rarity: 'RARE',
        iconUrl: '/badges/quality-focused.png',
        unlockCriteria: {
          tasksCompleted: 20 // Quality check handled separately
        }
      },
      {
        name: 'Perfectionist',
        description: 'Receive 10 perfect 5-star ratings',
        category: 'ACHIEVEMENT',
        rarity: 'EPIC',
        iconUrl: '/badges/perfectionist.png',
        unlockCriteria: {
          tasksCompleted: 10 // Perfect ratings check handled separately
        }
      },

      // Consistency Badges
      {
        name: 'Consistent Contributor',
        description: 'Complete at least 1 task per week for 4 weeks',
        category: 'ACHIEVEMENT',
        rarity: 'UNCOMMON',
        iconUrl: '/badges/consistent-contributor.png',
        unlockCriteria: {
          tasksCompleted: 4 // Consistency check handled separately
        }
      },
      {
        name: 'Daily Grinder',
        description: 'Complete tasks on 30 different days',
        category: 'ACHIEVEMENT',
        rarity: 'RARE',
        iconUrl: '/badges/daily-grinder.png',
        unlockCriteria: {
          tasksCompleted: 30 // Daily activity check handled separately
        }
      }
    ];
  }

  /**
   * Get badge definitions by category
   */
  static getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
    return this.getDefaultBadgeDefinitions().filter(badge => badge.category === category);
  }

  /**
   * Get badge definitions by rarity
   */
  static getBadgesByRarity(rarity: BadgeRarity): BadgeDefinition[] {
    return this.getDefaultBadgeDefinitions().filter(badge => badge.rarity === rarity);
  }

  /**
   * Get a specific badge definition by name
   */
  static getBadgeByName(name: string): BadgeDefinition | undefined {
    return this.getDefaultBadgeDefinitions().find(badge => badge.name === name);
  }
}