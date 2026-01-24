import { DungeonModel, ZoneModel } from '../models/Zone';
import { TaskModel } from '../models/Task';
import { Dungeon, WorkCategory, Point, Requirements, Task } from '../../../shared/types';

export class DungeonService {
  /**
   * Get all dungeons with their available tasks
   */
  static async getAllDungeonsWithTasks(): Promise<Dungeon[]> {
    const dungeons = await DungeonModel.findAll();
    
    // Fetch tasks for each dungeon
    const dungeonsWithTasks = await Promise.all(
      dungeons.map(async (dungeon) => {
        const tasks = await TaskModel.findByDungeon(dungeon.id);
        return {
          ...dungeon,
          availableTasks: tasks
        };
      })
    );
    
    return dungeonsWithTasks;
  }

  /**
   * Get dungeons by work category
   */
  static async getDungeonsByCategory(category: WorkCategory): Promise<Dungeon[]> {
    const dungeons = await DungeonModel.findByType(category);
    
    // Fetch tasks for each dungeon
    const dungeonsWithTasks = await Promise.all(
      dungeons.map(async (dungeon) => {
        const tasks = await TaskModel.findByDungeon(dungeon.id);
        return {
          ...dungeon,
          availableTasks: tasks
        };
      })
    );
    
    return dungeonsWithTasks;
  }

  /**
   * Get dungeon by ID with tasks
   */
  static async getDungeonById(dungeonId: string): Promise<Dungeon | null> {
    const dungeon = await DungeonModel.findById(dungeonId);
    if (!dungeon) {
      return null;
    }
    
    const tasks = await TaskModel.findByDungeon(dungeonId);
    return {
      ...dungeon,
      availableTasks: tasks
    };
  }

  /**
   * Get dungeons in a specific zone
   */
  static async getDungeonsByZone(zoneId: string): Promise<Dungeon[]> {
    const dungeons = await DungeonModel.findByZone(zoneId);
    
    // Fetch tasks for each dungeon
    const dungeonsWithTasks = await Promise.all(
      dungeons.map(async (dungeon) => {
        const tasks = await TaskModel.findByDungeon(dungeon.id);
        return {
          ...dungeon,
          availableTasks: tasks
        };
      })
    );
    
    return dungeonsWithTasks;
  }

  /**
   * Check if user can access a dungeon
   */
  static async canUserAccessDungeon(
    dungeonId: string, 
    userTrustScore: number, 
    userLevel: number, 
    userBadges: string[]
  ): Promise<boolean> {
    return await DungeonModel.canUserAccess(dungeonId, userTrustScore, userLevel, userBadges);
  }

  /**
   * Create a new dungeon
   */
  static async createDungeon(dungeonData: {
    name: string;
    type: WorkCategory;
    zoneId: string;
    coordinates: Point;
    spriteAsset?: string;
    entryRequirements: Requirements;
    specialFeatures?: string[];
  }): Promise<Dungeon> {
    return await DungeonModel.create(dungeonData);
  }

  /**
   * Get dungeon placement suggestions for a zone
   */
  static async suggestDungeonPlacements(zoneId: string, count: number = 3): Promise<Point[]> {
    const zone = await ZoneModel.findById(zoneId);
    if (!zone) {
      throw new Error('Zone not found');
    }

    const existingDungeons = await DungeonModel.findByZone(zoneId);
    const existingPoints = existingDungeons.map(d => d.coordinates);

    const suggestions: Point[] = [];
    const { coordinates } = zone;
    const width = coordinates.maxX - coordinates.minX;
    const height = coordinates.maxY - coordinates.minY;

    // Generate random points that don't conflict with existing dungeons
    while (suggestions.length < count) {
      const point: Point = {
        x: coordinates.minX + Math.random() * width,
        y: coordinates.minY + Math.random() * height
      };

      // Check minimum distance from existing dungeons (at least 50 units apart)
      const minDistance = 50;
      const tooClose = existingPoints.some(existing => {
        const distance = Math.sqrt(
          Math.pow(point.x - existing.x, 2) + Math.pow(point.y - existing.y, 2)
        );
        return distance < minDistance;
      });

      if (!tooClose) {
        suggestions.push(point);
        existingPoints.push(point); // Add to existing points to avoid clustering
      }
    }

    return suggestions;
  }

  /**
   * Get category-specific dungeon features
   */
  static getCategoryFeatures(category: WorkCategory): string[] {
    switch (category) {
      case 'FREELANCE':
        return [
          'client_meeting_rooms',
          'portfolio_showcase',
          'skill_testing_area',
          'payment_processing',
          'project_management_tools'
        ];
      case 'COMMUNITY':
        return [
          'volunteer_coordination',
          'impact_tracking',
          'group_collaboration_space',
          'resource_sharing',
          'community_bulletin_board'
        ];
      case 'CORPORATE':
        return [
          'formal_application_process',
          'hr_integration',
          'compliance_checking',
          'mentorship_programs',
          'career_progression_tracking'
        ];
      default:
        return [];
    }
  }

  /**
   * Generate category-specific dungeon name
   */
  static generateDungeonName(category: WorkCategory, zoneId: string): string {
    const prefixes = {
      FREELANCE: ['Freelancer\'s', 'Independent', 'Creative', 'Skill', 'Talent'],
      COMMUNITY: ['Community', 'Volunteer', 'Service', 'Impact', 'Unity'],
      CORPORATE: ['Corporate', 'Professional', 'Enterprise', 'Business', 'Executive']
    };

    const suffixes = {
      FREELANCE: ['Tower', 'Hub', 'Studio', 'Workshop', 'Loft'],
      COMMUNITY: ['Garden', 'Center', 'Hall', 'Commons', 'Plaza'],
      CORPORATE: ['Castle', 'Complex', 'Headquarters', 'Building', 'Campus']
    };

    const prefix = prefixes[category][Math.floor(Math.random() * prefixes[category].length)];
    const suffix = suffixes[category][Math.floor(Math.random() * suffixes[category].length)];

    return `${prefix} ${suffix}`;
  }

  /**
   * Get default entry requirements by category
   */
  static getDefaultEntryRequirements(category: WorkCategory): Requirements {
    switch (category) {
      case 'FREELANCE':
        return {
          trustScore: 10,
          level: 1
        };
      case 'COMMUNITY':
        return {
          trustScore: 0,
          level: 1
        };
      case 'CORPORATE':
        return {
          trustScore: 25,
          level: 2
        };
      default:
        return {
          trustScore: 0,
          level: 1
        };
    }
  }
}