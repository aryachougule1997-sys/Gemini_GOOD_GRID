export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Re-export types from shared types
export type WorkCategory = 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'CANCELLED';

export interface Organization {
  id: string;
  name: string;
  description?: string;
  verified: boolean;
  contactEmail: string;
  website?: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: WorkCategory;
  dungeonId: string | null;
  creatorId: string;
  organizationId?: string | null;
  requirements: TaskRequirements;
  rewards: TaskRewards;
  status: TaskStatus;
  deadline?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskRequirements {
  skills: string[];
  trustScoreMin: number;
  timeCommitment: number; // in hours
  location?: string;
  level?: number;
  specificBadges?: string[];
}

export interface TaskRewards {
  xp: number;
  trustScoreBonus: number;
  rwisPoints: number;
  badges?: string[];
  payment?: number; // For freelance tasks
}