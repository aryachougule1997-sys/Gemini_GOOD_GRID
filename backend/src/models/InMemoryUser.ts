import bcrypt from 'bcrypt';

interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  characterData?: any;
  locationData?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface UserStats {
  userId: string;
  trustScore: number;
  rwisScore: number;
  xpPoints: number;
  currentLevel: number;
  categoryStats: {
    freelance: { tasksCompleted: number; totalXP: number; averageRating: number; specializations: string[] };
    community: { tasksCompleted: number; totalXP: number; averageRating: number; specializations: string[] };
    corporate: { tasksCompleted: number; totalXP: number; averageRating: number; specializations: string[] };
  };
}

// In-memory storage
const users: Map<string, User> = new Map();
const userStats: Map<string, UserStats> = new Map();
const usersByEmail: Map<string, User> = new Map();
const usersByUsername: Map<string, User> = new Map();

export class InMemoryUserModel {
  static async create(userData: {
    username: string;
    email: string;
    password: string;
    characterData?: any;
    locationData?: any;
  }): Promise<User> {
    const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    const user: User = {
      id,
      username: userData.username,
      email: userData.email,
      passwordHash,
      characterData: userData.characterData,
      locationData: userData.locationData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store user
    users.set(id, user);
    usersByEmail.set(userData.email, user);
    usersByUsername.set(userData.username, user);
    
    // Create initial stats
    const stats: UserStats = {
      userId: id,
      trustScore: 0,
      rwisScore: 0,
      xpPoints: 0,
      currentLevel: 1,
      categoryStats: {
        freelance: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] },
        community: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] },
        corporate: { tasksCompleted: 0, totalXP: 0, averageRating: 0, specializations: [] }
      }
    };
    
    userStats.set(id, stats);
    
    return user;
  }
  
  static async findById(id: string): Promise<User | null> {
    return users.get(id) || null;
  }
  
  static async findByEmail(email: string): Promise<User | null> {
    return usersByEmail.get(email) || null;
  }
  
  static async findByUsername(username: string): Promise<User | null> {
    return usersByUsername.get(username) || null;
  }
  
  static async emailExists(email: string): Promise<boolean> {
    return usersByEmail.has(email);
  }
  
  static async usernameExists(username: string): Promise<boolean> {
    return usersByUsername.has(username);
  }
  
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  static async getStats(userId: string): Promise<UserStats | null> {
    return userStats.get(userId) || null;
  }
  
  static async updateStats(userId: string, newStats: Partial<UserStats>): Promise<void> {
    const currentStats = userStats.get(userId);
    if (currentStats) {
      userStats.set(userId, { ...currentStats, ...newStats });
    }
  }
  
  static async updateCharacterData(userId: string, characterData: any): Promise<void> {
    const user = users.get(userId);
    if (user) {
      user.characterData = characterData;
      user.updatedAt = new Date();
      users.set(userId, user);
    }
  }
  
  // Debug method to see all users
  static getAllUsers(): User[] {
    return Array.from(users.values());
  }
}