interface UserProfile {
  // Auth data
  userId: string;
  email: string;
  userType: 'WORKER' | 'PROVIDER';
  
  // Personal data
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  location: {
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  profileImage?: string; // Base64 or URL
  bio: string;
  
  // Gaming profile
  gamingUsername: string;
  characterName: string;
  characterClass: 'WARRIOR' | 'MAGE' | 'ROGUE' | 'PALADIN' | 'ARCHER';
  characterData: any;
  
  // Game stats
  stats: {
    trustScore: number;
    rwisScore: number;
    xpPoints: number;
    currentLevel: number;
    categoryStats: {
      freelance: { tasksCompleted: number; totalXP: number; averageRating: number; };
      community: { tasksCompleted: number; totalXP: number; averageRating: number; };
      corporate: { tasksCompleted: number; totalXP: number; averageRating: number; };
    };
  };
  
  // Achievements
  badges: Array<{
    id: string;
    name: string;
    description: string;
    category: 'SKILL' | 'ACHIEVEMENT' | 'CATEGORY' | 'SPECIAL';
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    earnedDate: Date;
  }>;
  
  // Professional data (for workers)
  workExperience?: any[];
  skills?: any[];
  education?: any[];
  certifications?: any[];
  portfolio?: any[];
  
  // Organization data (for providers)
  organizationDetails?: any;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

class ProfileService {
  private baseUrl = 'http://localhost:3001/api'; // Backend URL
  
  // Create new user profile
  async createProfile(profileData: any): Promise<UserProfile> {
    try {
      // Convert File to base64 if profile image exists
      let profileImageBase64 = null;
      if (profileData.profileImage instanceof File) {
        profileImageBase64 = await this.fileToBase64(profileData.profileImage);
      }
      
      // Initialize new user with zero stats
      const newUserProfile: UserProfile = {
        ...profileData,
        profileImage: profileImageBase64,
        stats: {
          trustScore: 0,
          rwisScore: 0,
          xpPoints: 0,
          currentLevel: 1,
          categoryStats: {
            freelance: { tasksCompleted: 0, totalXP: 0, averageRating: 0 },
            community: { tasksCompleted: 0, totalXP: 0, averageRating: 0 },
            corporate: { tasksCompleted: 0, totalXP: 0, averageRating: 0 }
          }
        },
        badges: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store in localStorage for demo (since we don't have a create profile API endpoint yet)
      // TODO: Replace with actual API call when backend profile creation endpoint is ready
      localStorage.setItem(`profile_${profileData.userId}`, JSON.stringify(newUserProfile));
      
      return newUserProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }
  
  // Get user profile
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      // First try to get from backend API
      const response = await fetch(`${this.baseUrl}/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('goodgrid_token') || ''}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Convert backend data to frontend format
          const backendProfile = result.data;
          
          // Get user stats from backend
          const statsResponse = await fetch(`${this.baseUrl}/profile/${userId}/stats`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('goodgrid_token') || ''}`
            }
          });
          
          let stats = {
            trustScore: 0,
            rwisScore: 0,
            xpPoints: 0,
            currentLevel: 1,
            categoryStats: {
              freelance: { tasksCompleted: 0, totalXP: 0, averageRating: 0 },
              community: { tasksCompleted: 0, totalXP: 0, averageRating: 0 },
              corporate: { tasksCompleted: 0, totalXP: 0, averageRating: 0 }
            }
          };
          
          if (statsResponse.ok) {
            const statsResult = await statsResponse.json();
            if (statsResult) {
              stats = {
                trustScore: statsResult.trustScore || 0,
                rwisScore: statsResult.rwisScore || 0,
                xpPoints: statsResult.xpPoints || 0,
                currentLevel: statsResult.currentLevel || 1,
                categoryStats: statsResult.categoryStats || stats.categoryStats
              };
            }
          }
          
          // Get badges from backend
          const badgesResponse = await fetch(`${this.baseUrl}/profile/${userId}/badges`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('goodgrid_token') || ''}`
            }
          });
          
          let badges: any[] = [];
          if (badgesResponse.ok) {
            const badgesResult = await badgesResponse.json();
            if (badgesResult.success && badgesResult.data?.badges) {
              badges = badgesResult.data.badges;
            }
          }
          
          // Convert to frontend UserProfile format
          const profile: UserProfile = {
            userId: backendProfile.id,
            email: backendProfile.email,
            userType: 'WORKER', // Default, should be determined from backend
            firstName: backendProfile.username.split('_')[0] || 'User',
            lastName: backendProfile.username.split('_')[1] || '',
            dateOfBirth: '1990-01-01', // Default
            location: {
              city: backendProfile.locationData?.city || 'Unknown',
              country: backendProfile.locationData?.country || 'Unknown',
              coordinates: backendProfile.locationData?.coordinates
            },
            profileImage: undefined,
            bio: 'Gaming enthusiast and task master',
            gamingUsername: backendProfile.username,
            characterName: backendProfile.characterData?.name || 'Hero',
            characterClass: backendProfile.characterData?.class || 'WARRIOR',
            characterData: backendProfile.characterData,
            stats,
            badges,
            createdAt: new Date(backendProfile.createdAt),
            updatedAt: new Date(backendProfile.updatedAt)
          };
          
          return profile;
        }
      }
      
      // Fallback to localStorage for demo profiles
      const profileData = localStorage.getItem(`profile_${userId}`);
      if (profileData) {
        const profile = JSON.parse(profileData);
        // Convert date strings back to Date objects
        profile.createdAt = new Date(profile.createdAt);
        profile.updatedAt = new Date(profile.updatedAt);
        profile.badges = profile.badges.map((badge: any) => ({
          ...badge,
          earnedDate: new Date(badge.earnedDate)
        }));
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting profile:', error);
      
      // Fallback to localStorage on network error
      try {
        const profileData = localStorage.getItem(`profile_${userId}`);
        if (profileData) {
          const profile = JSON.parse(profileData);
          profile.createdAt = new Date(profile.createdAt);
          profile.updatedAt = new Date(profile.updatedAt);
          profile.badges = profile.badges.map((badge: any) => ({
            ...badge,
            earnedDate: new Date(badge.earnedDate)
          }));
          return profile;
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
      
      return null;
    }
  }
  
  // Update user profile
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // For character data updates, use the backend API
      if (updates.characterData) {
        const response = await fetch(`${this.baseUrl}/profile/${userId}/character`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('goodgrid_token') || ''}`
          },
          body: JSON.stringify(updates.characterData)
        });

        if (response.ok) {
          console.log('Character data updated successfully in backend');
        }
      }
      
      // For stats updates, use the backend API if available
      if (updates.stats) {
        // Try to update category stats in backend
        try {
          for (const [category, categoryStats] of Object.entries(updates.stats.categoryStats || {})) {
            await fetch(`${this.baseUrl}/profile/${userId}/category-stats`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('goodgrid_token') || ''}`
              },
              body: JSON.stringify({
                category,
                stats: categoryStats
              })
            });
          }
        } catch (backendError) {
          console.warn('Backend stats update failed, using localStorage fallback');
        }
      }
      
      // Always update localStorage for immediate UI updates
      const existingProfile = await this.getProfile(userId);
      if (!existingProfile) {
        throw new Error('Profile not found');
      }
      
      const updatedProfile = {
        ...existingProfile,
        ...updates,
        updatedAt: new Date()
      };
      
      localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
  
  // Update character data
  async updateCharacter(userId: string, characterData: any): Promise<UserProfile> {
    return this.updateProfile(userId, { characterData });
  }
  
  // Update stats (for task completion, etc.)
  async updateStats(userId: string, statUpdates: any): Promise<UserProfile> {
    const profile = await this.getProfile(userId);
    if (!profile) throw new Error('Profile not found');
    
    const updatedStats = {
      ...profile.stats,
      ...statUpdates
    };
    
    return this.updateProfile(userId, { stats: updatedStats });
  }
  
  // Add achievement badge
  async addBadge(userId: string, badge: any): Promise<UserProfile> {
    const profile = await this.getProfile(userId);
    if (!profile) throw new Error('Profile not found');
    
    const newBadge = {
      ...badge,
      earnedDate: new Date()
    };
    
    const updatedBadges = [...profile.badges, newBadge];
    return this.updateProfile(userId, { badges: updatedBadges });
  }
  
  // Helper function to convert File to base64
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
  
  // Get all profiles (for admin/leaderboard)
  async getAllProfiles(): Promise<UserProfile[]> {
    try {
      const profiles: UserProfile[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('profile_')) {
          const profileData = localStorage.getItem(key);
          if (profileData) {
            const profile = JSON.parse(profileData);
            profile.createdAt = new Date(profile.createdAt);
            profile.updatedAt = new Date(profile.updatedAt);
            profile.badges = profile.badges.map((badge: any) => ({
              ...badge,
              earnedDate: new Date(badge.earnedDate)
            }));
            profiles.push(profile);
          }
        }
      }
      return profiles;
    } catch (error) {
      console.error('Error getting all profiles:', error);
      return [];
    }
  }
  
  // Delete profile
  async deleteProfile(userId: string): Promise<boolean> {
    try {
      localStorage.removeItem(`profile_${userId}`);
      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  }
}

export default new ProfileService();
export type { UserProfile };