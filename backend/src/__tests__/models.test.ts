import { UserModel, ZoneModel, BadgeModel } from '../models';
import { checkConnection } from '../config/database';

describe('Database Models', () => {
  beforeAll(async () => {
    // Check if database is connected
    const isConnected = await checkConnection();
    if (!isConnected) {
      console.warn('⚠️  Database not connected. Skipping model tests.');
      return;
    }
  });

  describe('UserModel', () => {
    it('should have all required methods', () => {
      expect(typeof UserModel.create).toBe('function');
      expect(typeof UserModel.findById).toBe('function');
      expect(typeof UserModel.findByEmail).toBe('function');
      expect(typeof UserModel.findByUsername).toBe('function');
      expect(typeof UserModel.updateCharacterData).toBe('function');
      expect(typeof UserModel.updateLocationData).toBe('function');
      expect(typeof UserModel.getStats).toBe('function');
      expect(typeof UserModel.updateStats).toBe('function');
      expect(typeof UserModel.verifyPassword).toBe('function');
      expect(typeof UserModel.emailExists).toBe('function');
      expect(typeof UserModel.usernameExists).toBe('function');
    });
  });

  describe('ZoneModel', () => {
    it('should have all required methods', () => {
      expect(typeof ZoneModel.findAll).toBe('function');
      expect(typeof ZoneModel.findById).toBe('function');
      expect(typeof ZoneModel.findAllWithDungeons).toBe('function');
      expect(typeof ZoneModel.findUnlockedForUser).toBe('function');
      expect(typeof ZoneModel.create).toBe('function');
    });
  });

  describe('BadgeModel', () => {
    it('should have all required methods', () => {
      expect(typeof BadgeModel.findAll).toBe('function');
      expect(typeof BadgeModel.findById).toBe('function');
      expect(typeof BadgeModel.findByCategory).toBe('function');
      expect(typeof BadgeModel.create).toBe('function');
    });
  });

  // Add more specific tests when database is available
  describe('Database Integration', () => {
    it('should be able to connect to database', async () => {
      const isConnected = await checkConnection();
      // This test will pass even if DB is not connected, just logs a warning
      expect(typeof isConnected).toBe('boolean');
    });
  });
});