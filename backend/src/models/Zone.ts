import pool from '../config/database';
import { Zone, Dungeon, TerrainType, DifficultyLevel, UnlockCriteria, Requirements, BoundingBox, Point, WorkCategory } from '../../../shared/types';

export class ZoneModel {
  /**
   * Find all zones
   */
  static async findAll(): Promise<Zone[]> {
    const result = await pool.query(
      `SELECT id, name, terrain_type, unlock_requirements, difficulty, coordinates, created_at
       FROM zones 
       ORDER BY difficulty, name`
    );
    
    return result.rows.map(zone => ({
      id: zone.id,
      name: zone.name,
      terrainType: zone.terrain_type as TerrainType,
      unlockRequirements: zone.unlock_requirements as UnlockCriteria,
      difficulty: zone.difficulty as DifficultyLevel,
      coordinates: zone.coordinates as BoundingBox,
      createdAt: zone.created_at
    }));
  }

  /**
   * Find zone by ID
   */
  static async findById(id: string): Promise<Zone | null> {
    const result = await pool.query(
      `SELECT id, name, terrain_type, unlock_requirements, difficulty, coordinates, created_at
       FROM zones WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const zone = result.rows[0];
    return {
      id: zone.id,
      name: zone.name,
      terrainType: zone.terrain_type as TerrainType,
      unlockRequirements: zone.unlock_requirements as UnlockCriteria,
      difficulty: zone.difficulty as DifficultyLevel,
      coordinates: zone.coordinates as BoundingBox,
      createdAt: zone.created_at
    };
  }

  /**
   * Find zones with their dungeons
   */
  static async findAllWithDungeons(): Promise<Zone[]> {
    const result = await pool.query(`
      SELECT 
        z.id, z.name, z.terrain_type, z.unlock_requirements, z.difficulty, z.coordinates, z.created_at,
        d.id as dungeon_id, d.name as dungeon_name, d.type as dungeon_type, 
        d.coordinates as dungeon_coordinates, d.sprite_asset, d.entry_requirements, d.special_features, d.created_at as dungeon_created_at
      FROM zones z
      LEFT JOIN dungeons d ON z.id = d.zone_id
      ORDER BY z.difficulty, z.name, d.name
    `);
    
    const zonesMap = new Map<string, Zone>();
    
    result.rows.forEach(row => {
      if (!zonesMap.has(row.id)) {
        zonesMap.set(row.id, {
          id: row.id,
          name: row.name,
          terrainType: row.terrain_type as TerrainType,
          unlockRequirements: row.unlock_requirements as UnlockCriteria,
          difficulty: row.difficulty as DifficultyLevel,
          coordinates: row.coordinates as BoundingBox,
          createdAt: row.created_at,
          dungeons: []
        });
      }
      
      const zone = zonesMap.get(row.id)!;
      
      if (row.dungeon_id) {
        zone.dungeons!.push({
          id: row.dungeon_id,
          type: row.dungeon_type as WorkCategory,
          name: row.dungeon_name,
          zoneId: row.id,
          coordinates: row.dungeon_coordinates as Point,
          spriteAsset: row.sprite_asset,
          entryRequirements: row.entry_requirements as Requirements,
          specialFeatures: row.special_features || [],
          createdAt: row.dungeon_created_at
        });
      }
    });
    
    return Array.from(zonesMap.values());
  }

  /**
   * Find zones unlocked for a user based on their stats
   */
  static async findUnlockedForUser(userTrustScore: number, userLevel: number, userBadges: string[]): Promise<Zone[]> {
    const result = await pool.query(
      `SELECT id, name, terrain_type, unlock_requirements, difficulty, coordinates, created_at
       FROM zones 
       ORDER BY difficulty, name`
    );
    
    return result.rows
      .map(zone => ({
        id: zone.id,
        name: zone.name,
        terrainType: zone.terrain_type as TerrainType,
        unlockRequirements: zone.unlock_requirements as UnlockCriteria,
        difficulty: zone.difficulty as DifficultyLevel,
        coordinates: zone.coordinates as BoundingBox,
        createdAt: zone.created_at
      }))
      .filter(zone => this.isZoneUnlocked(zone.unlockRequirements, userTrustScore, userLevel, userBadges));
  }

  /**
   * Check if a zone is unlocked for a user
   */
  private static isZoneUnlocked(
    requirements: UnlockCriteria,
    userTrustScore: number,
    userLevel: number,
    userBadges: string[]
  ): boolean {
    if (requirements.trustScore && userTrustScore < requirements.trustScore) {
      return false;
    }
    
    if (requirements.level && userLevel < requirements.level) {
      return false;
    }
    
    if (requirements.specificBadges && requirements.specificBadges.length > 0) {
      const hasAllBadges = requirements.specificBadges.every(badge => userBadges.includes(badge));
      if (!hasAllBadges) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Create a new zone
   */
  static async create(zoneData: {
    name: string;
    terrainType: TerrainType;
    unlockRequirements: UnlockCriteria;
    difficulty: DifficultyLevel;
    coordinates: BoundingBox;
  }): Promise<Zone> {
    const result = await pool.query(
      `INSERT INTO zones (name, terrain_type, unlock_requirements, difficulty, coordinates)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, terrain_type, unlock_requirements, difficulty, coordinates, created_at`,
      [
        zoneData.name,
        zoneData.terrainType,
        JSON.stringify(zoneData.unlockRequirements),
        zoneData.difficulty,
        JSON.stringify(zoneData.coordinates)
      ]
    );
    
    const zone = result.rows[0];
    return {
      id: zone.id,
      name: zone.name,
      terrainType: zone.terrain_type as TerrainType,
      unlockRequirements: zone.unlock_requirements as UnlockCriteria,
      difficulty: zone.difficulty as DifficultyLevel,
      coordinates: zone.coordinates as BoundingBox,
      createdAt: zone.created_at
    };
  }
}

export class DungeonModel {
  /**
   * Find all dungeons
   */
  static async findAll(): Promise<Dungeon[]> {
    const result = await pool.query(
      `SELECT id, name, type, zone_id, coordinates, sprite_asset, entry_requirements, special_features, created_at
       FROM dungeons 
       ORDER BY zone_id, name`
    );
    
    return result.rows.map(dungeon => ({
      id: dungeon.id,
      type: dungeon.type as WorkCategory,
      name: dungeon.name,
      zoneId: dungeon.zone_id,
      coordinates: dungeon.coordinates as Point,
      spriteAsset: dungeon.sprite_asset,
      entryRequirements: dungeon.entry_requirements as Requirements,
      specialFeatures: dungeon.special_features || [],
      createdAt: dungeon.created_at
    }));
  }

  /**
   * Find dungeon by ID
   */
  static async findById(id: string): Promise<Dungeon | null> {
    const result = await pool.query(
      `SELECT id, name, type, zone_id, coordinates, sprite_asset, entry_requirements, special_features, created_at
       FROM dungeons WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const dungeon = result.rows[0];
    return {
      id: dungeon.id,
      type: dungeon.type as WorkCategory,
      name: dungeon.name,
      zoneId: dungeon.zone_id,
      coordinates: dungeon.coordinates as Point,
      spriteAsset: dungeon.sprite_asset,
      entryRequirements: dungeon.entry_requirements as Requirements,
      specialFeatures: dungeon.special_features || [],
      createdAt: dungeon.created_at
    };
  }

  /**
   * Find dungeons by zone
   */
  static async findByZone(zoneId: string): Promise<Dungeon[]> {
    const result = await pool.query(
      `SELECT id, name, type, zone_id, coordinates, sprite_asset, entry_requirements, special_features, created_at
       FROM dungeons 
       WHERE zone_id = $1
       ORDER BY name`,
      [zoneId]
    );
    
    return result.rows.map(dungeon => ({
      id: dungeon.id,
      type: dungeon.type as WorkCategory,
      name: dungeon.name,
      zoneId: dungeon.zone_id,
      coordinates: dungeon.coordinates as Point,
      spriteAsset: dungeon.sprite_asset,
      entryRequirements: dungeon.entry_requirements as Requirements,
      specialFeatures: dungeon.special_features || [],
      createdAt: dungeon.created_at
    }));
  }

  /**
   * Find dungeons by type
   */
  static async findByType(type: WorkCategory): Promise<Dungeon[]> {
    const result = await pool.query(
      `SELECT id, name, type, zone_id, coordinates, sprite_asset, entry_requirements, special_features, created_at
       FROM dungeons 
       WHERE type = $1
       ORDER BY zone_id, name`,
      [type]
    );
    
    return result.rows.map(dungeon => ({
      id: dungeon.id,
      type: dungeon.type as WorkCategory,
      name: dungeon.name,
      zoneId: dungeon.zone_id,
      coordinates: dungeon.coordinates as Point,
      spriteAsset: dungeon.sprite_asset,
      entryRequirements: dungeon.entry_requirements as Requirements,
      specialFeatures: dungeon.special_features || [],
      createdAt: dungeon.created_at
    }));
  }

  /**
   * Create a new dungeon
   */
  static async create(dungeonData: {
    name: string;
    type: WorkCategory;
    zoneId: string;
    coordinates: Point;
    spriteAsset?: string;
    entryRequirements: Requirements;
    specialFeatures?: string[];
  }): Promise<Dungeon> {
    const result = await pool.query(
      `INSERT INTO dungeons (name, type, zone_id, coordinates, sprite_asset, entry_requirements, special_features)
       VALUES ($1, $2, $3, POINT($4, $5), $6, $7, $8)
       RETURNING id, name, type, zone_id, coordinates, sprite_asset, entry_requirements, special_features, created_at`,
      [
        dungeonData.name,
        dungeonData.type,
        dungeonData.zoneId,
        dungeonData.coordinates.x,
        dungeonData.coordinates.y,
        dungeonData.spriteAsset,
        JSON.stringify(dungeonData.entryRequirements),
        JSON.stringify(dungeonData.specialFeatures || [])
      ]
    );
    
    const dungeon = result.rows[0];
    return {
      id: dungeon.id,
      type: dungeon.type as WorkCategory,
      name: dungeon.name,
      zoneId: dungeon.zone_id,
      coordinates: dungeon.coordinates as Point,
      spriteAsset: dungeon.sprite_asset,
      entryRequirements: dungeon.entry_requirements as Requirements,
      specialFeatures: dungeon.special_features || [],
      createdAt: dungeon.created_at
    };
  }

  /**
   * Check if user can access dungeon
   */
  static async canUserAccess(dungeonId: string, userTrustScore: number, userLevel: number, userBadges: string[]): Promise<boolean> {
    const dungeon = await this.findById(dungeonId);
    if (!dungeon) {
      return false;
    }
    
    const requirements = dungeon.entryRequirements;
    
    if (requirements.trustScore && userTrustScore < requirements.trustScore) {
      return false;
    }
    
    if (requirements.level && userLevel < requirements.level) {
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
}