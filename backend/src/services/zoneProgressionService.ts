import { UserModel } from '../models/User';
import { ZoneModel, DungeonModel } from '../models/Zone';
import { WorkHistoryModel } from '../models/WorkHistory';
import { UserAchievementModel } from '../models/Badge';
import { 
  Zone, 
  Dungeon, 
  UserStats, 
  UnlockCriteria, 
  WorkCategory,
  DifficultyLevel,
  TerrainType,
  BoundingBox,
  Point
} from '../../../shared/types';

export interface ZoneUnlockResult {
  zoneId: string;
  zoneName: string;
  unlocked: boolean;
  reason?: string;
  newDungeonsUnlocked: Dungeon[];
  celebrationData: ZoneCelebrationData;
}

export interface ZoneCelebrationData {
  animationType: 'ZONE_UNLOCK' | 'DUNGEON_UNLOCK' | 'AREA_REVEAL';
  title: string;
  description: string;
  rewards: {
    xp?: number;
    trustScore?: number;
    badges?: string[];
    specialFeatures?: string[];
  };
  visualEffects: {
    mapRevealAnimation: boolean;
    particleEffects: string[];
    soundEffects: string[];
  };
}

export interface AdvancedDungeonUnlock {
  dungeonId: string;
  dungeonName: string;
  category: WorkCategory;
  tier: 'BASIC' | 'ADVANCED' | 'EXPERT' | 'MASTER';
  unlockRequirements: {
    categoryTasksCompleted: number;
    categoryXP: number;
    categoryRating: number;
    specialBadges?: string[];
  };
  unlocked: boolean;
  progressToUnlock: number; // 0-100 percentage
}

export interface ZoneProgressionStatus {
  currentZones: Zone[];
  unlockedZones: Zone[];
  lockedZones: Zone[];
  nextUnlockableZone?: Zone;
  progressToNextZone: number;
  advancedDungeons: AdvancedDungeonUnlock[];
  zoneSpecificContent: ZoneSpecificContent[];
}

export interface ZoneSpecificContent {
  zoneId: string;
  contentType: 'TASK_DIFFICULTY_SCALING' | 'SPECIAL_DUNGEONS' | 'UNIQUE_REWARDS' | 'TERRAIN_BONUSES';
  content: {
    difficultyMultiplier?: number;
    specialDungeonTypes?: string[];
    uniqueRewards?: string[];
    terrainBonuses?: Record<string, number>;
  };
}

export class ZoneProgressionService {
  /**
   * Check and process zone unlocks for a user
   */
  static async checkZoneUnlocks(userId: string): Promise<ZoneUnlockResult[]> {
    const userStats = await UserModel.getStats(userId);
    if (!userStats) {
      throw new Error('User stats not found');
    }

    const allZones = await ZoneModel.findAll();
    const userBadges = await UserAchievementModel.findByUser(userId);
    const badgeNames = userBadges.map(achievement => achievement.badge?.name || '');
    const workHistory = await WorkHistoryModel.findByUser(userId);
    const categoryStats = await WorkHistoryModel.getUserCategoryStats(userId);

    const unlockResults: ZoneUnlockResult[] = [];

    for (const zone of allZones) {
      // Skip if already unlocked
      if (userStats.unlockedZones.includes(zone.id)) {
        continue;
      }

      const unlockResult = await this.evaluateZoneUnlock(
        zone,
        userStats,
        badgeNames,
        workHistory,
        categoryStats
      );

      if (unlockResult.unlocked) {
        // Update user's unlocked zones
        const updatedZones = [...userStats.unlockedZones, zone.id];
        await UserModel.updateStats(userId, { unlockedZones: updatedZones });

        // Find newly unlocked dungeons in this zone
        const zoneDungeons = await DungeonModel.findByZone(zone.id);
        const newDungeonsUnlocked = zoneDungeons.filter(dungeon =>
          this.isDungeonUnlockedForUser(dungeon, userStats, badgeNames)
        );

        unlockResults.push({
          ...unlockResult,
          newDungeonsUnlocked
        });
      }
    }

    return unlockResults;
  }

  /**
   * Evaluate if a specific zone should be unlocked
   */
  private static async evaluateZoneUnlock(
    zone: Zone,
    userStats: UserStats,
    userBadges: string[],
    workHistory: any[],
    categoryStats: any
  ): Promise<ZoneUnlockResult> {
    const requirements = zone.unlockRequirements;
    const unlockReasons: string[] = [];
    let canUnlock = true;

    // Check trust score requirement
    if (requirements.trustScore && userStats.trustScore < requirements.trustScore) {
      canUnlock = false;
      unlockReasons.push(`Need ${requirements.trustScore} Trust Score (current: ${userStats.trustScore})`);
    }

    // Check level requirement
    if (requirements.level && userStats.currentLevel < requirements.level) {
      canUnlock = false;
      unlockReasons.push(`Need Level ${requirements.level} (current: ${userStats.currentLevel})`);
    }

    // Check completed tasks requirement
    if (requirements.completedTasks) {
      const totalTasks = workHistory.length;
      if (totalTasks < requirements.completedTasks) {
        canUnlock = false;
        unlockReasons.push(`Need ${requirements.completedTasks} completed tasks (current: ${totalTasks})`);
      }
    }

    // Check specific badges requirement
    if (requirements.specificBadges && requirements.specificBadges.length > 0) {
      const missingBadges = requirements.specificBadges.filter(badge => !userBadges.includes(badge));
      if (missingBadges.length > 0) {
        canUnlock = false;
        unlockReasons.push(`Need badges: ${missingBadges.join(', ')}`);
      }
    }

    const celebrationData = this.generateZoneCelebrationData(zone, canUnlock);

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      unlocked: canUnlock,
      reason: canUnlock ? 'Zone unlocked!' : unlockReasons.join('; '),
      newDungeonsUnlocked: [], // Will be populated by caller
      celebrationData
    };
  }

  /**
   * Generate celebration data for zone unlock
   */
  private static generateZoneCelebrationData(zone: Zone, unlocked: boolean): ZoneCelebrationData {
    if (!unlocked) {
      return {
        animationType: 'ZONE_UNLOCK',
        title: `${zone.name} - Locked`,
        description: 'Continue your journey to unlock this zone',
        rewards: {},
        visualEffects: {
          mapRevealAnimation: false,
          particleEffects: [],
          soundEffects: []
        }
      };
    }

    const terrainEffects = this.getTerrainSpecificEffects(zone.terrainType);
    const difficultyRewards = this.getDifficultyBasedRewards(zone.difficulty);

    return {
      animationType: 'ZONE_UNLOCK',
      title: `${zone.name} Unlocked!`,
      description: `You've gained access to the ${zone.terrainType.toLowerCase()} region of ${zone.name}. New adventures await!`,
      rewards: {
        xp: difficultyRewards.xp,
        trustScore: difficultyRewards.trustScore,
        badges: difficultyRewards.badges,
        specialFeatures: [
          `${zone.terrainType} terrain bonuses`,
          `${zone.difficulty} difficulty tasks`,
          'New dungeon types'
        ]
      },
      visualEffects: {
        mapRevealAnimation: true,
        particleEffects: terrainEffects.particles,
        soundEffects: terrainEffects.sounds
      }
    };
  }

  /**
   * Get terrain-specific visual effects
   */
  private static getTerrainSpecificEffects(terrain: TerrainType): {
    particles: string[];
    sounds: string[];
  } {
    const effects = {
      URBAN: {
        particles: ['city_lights', 'building_sparkles', 'traffic_flow'],
        sounds: ['city_ambience', 'construction', 'traffic']
      },
      FOREST: {
        particles: ['falling_leaves', 'forest_sparkles', 'wind_effects'],
        sounds: ['forest_ambience', 'birds_chirping', 'wind_through_trees']
      },
      MOUNTAIN: {
        particles: ['snow_particles', 'rock_debris', 'mountain_mist'],
        sounds: ['mountain_wind', 'rock_falling', 'echo_effects']
      },
      WATER: {
        particles: ['water_ripples', 'bubble_effects', 'wave_particles'],
        sounds: ['water_flowing', 'waves_crashing', 'underwater_ambience']
      },
      DESERT: {
        particles: ['sand_particles', 'heat_shimmer', 'dust_clouds'],
        sounds: ['desert_wind', 'sand_shifting', 'desert_ambience']
      }
    };

    return effects[terrain] || effects.URBAN;
  }

  /**
   * Get difficulty-based rewards
   */
  private static getDifficultyBasedRewards(difficulty: DifficultyLevel): {
    xp: number;
    trustScore: number;
    badges: string[];
  } {
    const rewards = {
      BEGINNER: { xp: 50, trustScore: 5, badges: [] },
      INTERMEDIATE: { xp: 100, trustScore: 10, badges: ['Zone Explorer'] },
      ADVANCED: { xp: 200, trustScore: 20, badges: ['Zone Explorer', 'Advanced Adventurer'] },
      EXPERT: { xp: 400, trustScore: 40, badges: ['Zone Explorer', 'Advanced Adventurer', 'Expert Navigator'] }
    };

    return rewards[difficulty] || rewards.BEGINNER;
  }

  /**
   * Check if dungeon is unlocked for user
   */
  private static isDungeonUnlockedForUser(
    dungeon: Dungeon,
    userStats: UserStats,
    userBadges: string[]
  ): boolean {
    const requirements = dungeon.entryRequirements;

    if (requirements.trustScore && userStats.trustScore < requirements.trustScore) {
      return false;
    }

    if (requirements.level && userStats.currentLevel < requirements.level) {
      return false;
    }

    if (requirements.badges && requirements.badges.length > 0) {
      const hasAllBadges = requirements.badges.every(badge => userBadges.includes(badge));
      if (!hasAllBadges) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get advanced dungeon unlocks within categories
   */
  static async getAdvancedDungeonUnlocks(userId: string): Promise<AdvancedDungeonUnlock[]> {
    const userStats = await UserModel.getStats(userId);
    if (!userStats) {
      throw new Error('User stats not found');
    }

    const categoryStats = await WorkHistoryModel.getUserCategoryStats(userId);
    const allDungeons = await DungeonModel.findAll();
    const advancedUnlocks: AdvancedDungeonUnlock[] = [];

    // Define advanced dungeon tiers for each category
    const dungeonTiers = this.getAdvancedDungeonTiers();

    for (const dungeon of allDungeons) {
      const categoryKey = dungeon.type.toLowerCase() as keyof typeof categoryStats;
      const userCategoryStats = categoryStats[categoryKey];

      for (const tier of dungeonTiers[dungeon.type] || []) {
        const unlock: AdvancedDungeonUnlock = {
          dungeonId: `${dungeon.id}_${tier.tier}`,
          dungeonName: `${dungeon.name} - ${tier.tier}`,
          category: dungeon.type,
          tier: tier.tier,
          unlockRequirements: tier.requirements,
          unlocked: this.checkAdvancedDungeonUnlock(userCategoryStats, tier.requirements),
          progressToUnlock: this.calculateAdvancedDungeonProgress(userCategoryStats, tier.requirements)
        };

        advancedUnlocks.push(unlock);
      }
    }

    return advancedUnlocks;
  }

  /**
   * Define advanced dungeon tiers
   */
  private static getAdvancedDungeonTiers(): Record<WorkCategory, Array<{
    tier: 'BASIC' | 'ADVANCED' | 'EXPERT' | 'MASTER';
    requirements: {
      categoryTasksCompleted: number;
      categoryXP: number;
      categoryRating: number;
      specialBadges?: string[];
    };
  }>> {
    return {
      FREELANCE: [
        {
          tier: 'BASIC',
          requirements: { categoryTasksCompleted: 0, categoryXP: 0, categoryRating: 0 }
        },
        {
          tier: 'ADVANCED',
          requirements: { categoryTasksCompleted: 10, categoryXP: 500, categoryRating: 3.5 }
        },
        {
          tier: 'EXPERT',
          requirements: { 
            categoryTasksCompleted: 25, 
            categoryXP: 1500, 
            categoryRating: 4.0,
            specialBadges: ['Freelance Specialist']
          }
        },
        {
          tier: 'MASTER',
          requirements: { 
            categoryTasksCompleted: 50, 
            categoryXP: 3000, 
            categoryRating: 4.5,
            specialBadges: ['Freelance Specialist', 'Master Freelancer']
          }
        }
      ],
      COMMUNITY: [
        {
          tier: 'BASIC',
          requirements: { categoryTasksCompleted: 0, categoryXP: 0, categoryRating: 0 }
        },
        {
          tier: 'ADVANCED',
          requirements: { categoryTasksCompleted: 15, categoryXP: 750, categoryRating: 3.5 }
        },
        {
          tier: 'EXPERT',
          requirements: { 
            categoryTasksCompleted: 35, 
            categoryXP: 2000, 
            categoryRating: 4.0,
            specialBadges: ['Community Champion']
          }
        },
        {
          tier: 'MASTER',
          requirements: { 
            categoryTasksCompleted: 75, 
            categoryXP: 4500, 
            categoryRating: 4.5,
            specialBadges: ['Community Champion', 'Community Leader']
          }
        }
      ],
      CORPORATE: [
        {
          tier: 'BASIC',
          requirements: { categoryTasksCompleted: 0, categoryXP: 0, categoryRating: 0 }
        },
        {
          tier: 'ADVANCED',
          requirements: { categoryTasksCompleted: 8, categoryXP: 400, categoryRating: 3.5 }
        },
        {
          tier: 'EXPERT',
          requirements: { 
            categoryTasksCompleted: 20, 
            categoryXP: 1200, 
            categoryRating: 4.0,
            specialBadges: ['Corporate Professional']
          }
        },
        {
          tier: 'MASTER',
          requirements: { 
            categoryTasksCompleted: 40, 
            categoryXP: 2500, 
            categoryRating: 4.5,
            specialBadges: ['Corporate Professional', 'Executive Level']
          }
        }
      ]
    };
  }

  /**
   * Check if advanced dungeon tier is unlocked
   */
  private static checkAdvancedDungeonUnlock(
    userCategoryStats: any,
    requirements: any
  ): boolean {
    if (userCategoryStats.tasksCompleted < requirements.categoryTasksCompleted) {
      return false;
    }

    if (userCategoryStats.totalXP < requirements.categoryXP) {
      return false;
    }

    if (userCategoryStats.averageRating < requirements.categoryRating) {
      return false;
    }

    // Note: Badge checking would require additional user badge data
    // For now, we'll assume badge requirements are met if other criteria are met

    return true;
  }

  /**
   * Calculate progress towards advanced dungeon unlock
   */
  private static calculateAdvancedDungeonProgress(
    userCategoryStats: any,
    requirements: any
  ): number {
    const taskProgress = Math.min(100, (userCategoryStats.tasksCompleted / requirements.categoryTasksCompleted) * 100);
    const xpProgress = Math.min(100, (userCategoryStats.totalXP / requirements.categoryXP) * 100);
    const ratingProgress = Math.min(100, (userCategoryStats.averageRating / requirements.categoryRating) * 100);

    // Average of all progress metrics
    return Math.floor((taskProgress + xpProgress + ratingProgress) / 3);
  }

  /**
   * Get zone-specific content and difficulty scaling
   */
  static async getZoneSpecificContent(zoneId: string): Promise<ZoneSpecificContent[]> {
    const zone = await ZoneModel.findById(zoneId);
    if (!zone) {
      return [];
    }

    const content: ZoneSpecificContent[] = [];

    // Task difficulty scaling based on zone difficulty
    content.push({
      zoneId,
      contentType: 'TASK_DIFFICULTY_SCALING',
      content: {
        difficultyMultiplier: this.getDifficultyMultiplier(zone.difficulty)
      }
    });

    // Terrain-specific bonuses
    content.push({
      zoneId,
      contentType: 'TERRAIN_BONUSES',
      content: {
        terrainBonuses: this.getTerrainBonuses(zone.terrainType)
      }
    });

    // Special dungeon types based on terrain and difficulty
    content.push({
      zoneId,
      contentType: 'SPECIAL_DUNGEONS',
      content: {
        specialDungeonTypes: this.getSpecialDungeonTypes(zone.terrainType, zone.difficulty)
      }
    });

    // Unique rewards for this zone
    content.push({
      zoneId,
      contentType: 'UNIQUE_REWARDS',
      content: {
        uniqueRewards: this.getUniqueZoneRewards(zone.terrainType, zone.difficulty)
      }
    });

    return content;
  }

  /**
   * Get difficulty multiplier for zone
   */
  private static getDifficultyMultiplier(difficulty: DifficultyLevel): number {
    const multipliers = {
      BEGINNER: 1.0,
      INTERMEDIATE: 1.3,
      ADVANCED: 1.6,
      EXPERT: 2.0
    };

    return multipliers[difficulty] || 1.0;
  }

  /**
   * Get terrain-specific bonuses
   */
  private static getTerrainBonuses(terrain: TerrainType): Record<string, number> {
    const bonuses = {
      URBAN: {
        'tech_tasks_xp_bonus': 1.2,
        'networking_trust_bonus': 1.15,
        'business_rwis_bonus': 1.1
      },
      FOREST: {
        'environmental_tasks_xp_bonus': 1.3,
        'sustainability_trust_bonus': 1.2,
        'conservation_rwis_bonus': 1.4
      },
      MOUNTAIN: {
        'challenge_tasks_xp_bonus': 1.25,
        'perseverance_trust_bonus': 1.3,
        'leadership_rwis_bonus': 1.2
      },
      WATER: {
        'research_tasks_xp_bonus': 1.2,
        'collaboration_trust_bonus': 1.25,
        'innovation_rwis_bonus': 1.3
      },
      DESERT: {
        'endurance_tasks_xp_bonus': 1.4,
        'resilience_trust_bonus': 1.35,
        'survival_rwis_bonus': 1.25
      }
    };

    return bonuses[terrain] || bonuses.URBAN;
  }

  /**
   * Get special dungeon types for terrain and difficulty
   */
  private static getSpecialDungeonTypes(terrain: TerrainType, difficulty: DifficultyLevel): string[] {
    const specialTypes = {
      URBAN: {
        BEGINNER: ['Startup Incubator', 'Community Center'],
        INTERMEDIATE: ['Tech Hub', 'Innovation Lab'],
        ADVANCED: ['Corporate Headquarters', 'Research Institute'],
        EXPERT: ['Global Enterprise', 'Think Tank']
      },
      FOREST: {
        BEGINNER: ['Nature Center', 'Trail Maintenance'],
        INTERMEDIATE: ['Conservation Project', 'Wildlife Sanctuary'],
        ADVANCED: ['Research Station', 'Eco-Lodge'],
        EXPERT: ['Biosphere Reserve', 'Climate Research Facility']
      },
      MOUNTAIN: {
        BEGINNER: ['Base Camp', 'Visitor Center'],
        INTERMEDIATE: ['Climbing School', 'Weather Station'],
        ADVANCED: ['Rescue Operations', 'Observatory'],
        EXPERT: ['Extreme Conditions Lab', 'Peak Research Station']
      },
      WATER: {
        BEGINNER: ['Marina', 'Aquarium'],
        INTERMEDIATE: ['Marine Lab', 'Diving Center'],
        ADVANCED: ['Oceanographic Institute', 'Underwater Habitat'],
        EXPERT: ['Deep Sea Research', 'Submersible Operations']
      },
      DESERT: {
        BEGINNER: ['Oasis Outpost', 'Desert Museum'],
        INTERMEDIATE: ['Solar Farm', 'Archaeological Site'],
        ADVANCED: ['Survival Training', 'Astronomical Observatory'],
        EXPERT: ['Extreme Environment Lab', 'Space Simulation Facility']
      }
    };

    return specialTypes[terrain]?.[difficulty] || ['Standard Dungeon'];
  }

  /**
   * Get unique rewards for zone
   */
  private static getUniqueZoneRewards(terrain: TerrainType, difficulty: DifficultyLevel): string[] {
    const baseRewards = {
      URBAN: ['City Explorer Badge', 'Tech Innovator Title', 'Urban Planner Certification'],
      FOREST: ['Forest Guardian Badge', 'Eco Warrior Title', 'Conservation Specialist Certification'],
      MOUNTAIN: ['Peak Climber Badge', 'Mountain Guide Title', 'Extreme Conditions Certification'],
      WATER: ['Ocean Explorer Badge', 'Marine Biologist Title', 'Aquatic Specialist Certification'],
      DESERT: ['Desert Survivor Badge', 'Nomad Title', 'Extreme Environment Certification']
    };

    const difficultyBonuses = {
      BEGINNER: [],
      INTERMEDIATE: ['Zone Specialist Badge'],
      ADVANCED: ['Zone Specialist Badge', 'Advanced Explorer Title'],
      EXPERT: ['Zone Specialist Badge', 'Advanced Explorer Title', 'Master Navigator Certification']
    };

    return [
      ...(baseRewards[terrain] || []),
      ...(difficultyBonuses[difficulty] || [])
    ];
  }

  /**
   * Get comprehensive zone progression status for user
   */
  static async getZoneProgressionStatus(userId: string): Promise<ZoneProgressionStatus> {
    const userStats = await UserModel.getStats(userId);
    if (!userStats) {
      throw new Error('User stats not found');
    }

    const allZones = await ZoneModel.findAll();
    const userBadges = await UserAchievementModel.findByUser(userId);
    const badgeNames = userBadges.map(achievement => achievement.badge?.name || '');
    const workHistory = await WorkHistoryModel.findByUser(userId);
    const categoryStats = await WorkHistoryModel.getUserCategoryStats(userId);

    const unlockedZones = allZones.filter(zone => userStats.unlockedZones.includes(zone.id));
    const lockedZones = allZones.filter(zone => !userStats.unlockedZones.includes(zone.id));

    // Find next unlockable zone
    let nextUnlockableZone: Zone | undefined;
    let progressToNextZone = 0;

    for (const zone of lockedZones) {
      const unlockResult = await this.evaluateZoneUnlock(
        zone,
        userStats,
        badgeNames,
        workHistory,
        categoryStats
      );

      if (!nextUnlockableZone || unlockResult.unlocked) {
        nextUnlockableZone = zone;
        // Calculate progress based on requirements
        progressToNextZone = this.calculateZoneUnlockProgress(zone, userStats, workHistory.length);
        if (unlockResult.unlocked) break;
      }
    }

    const advancedDungeons = await this.getAdvancedDungeonUnlocks(userId);
    const zoneSpecificContent: ZoneSpecificContent[] = [];

    for (const zone of unlockedZones) {
      const content = await this.getZoneSpecificContent(zone.id);
      zoneSpecificContent.push(...content);
    }

    return {
      currentZones: unlockedZones,
      unlockedZones,
      lockedZones,
      nextUnlockableZone,
      progressToNextZone,
      advancedDungeons,
      zoneSpecificContent
    };
  }

  /**
   * Calculate progress towards zone unlock
   */
  private static calculateZoneUnlockProgress(
    zone: Zone,
    userStats: UserStats,
    totalTasks: number
  ): number {
    const requirements = zone.unlockRequirements;
    const progressMetrics: number[] = [];

    if (requirements.trustScore) {
      progressMetrics.push(Math.min(100, (userStats.trustScore / requirements.trustScore) * 100));
    }

    if (requirements.level) {
      progressMetrics.push(Math.min(100, (userStats.currentLevel / requirements.level) * 100));
    }

    if (requirements.completedTasks) {
      progressMetrics.push(Math.min(100, (totalTasks / requirements.completedTasks) * 100));
    }

    if (progressMetrics.length === 0) {
      return 100; // No requirements means already unlockable
    }

    return Math.floor(progressMetrics.reduce((sum, progress) => sum + progress, 0) / progressMetrics.length);
  }
}