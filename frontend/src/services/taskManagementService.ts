import { 
  Task, 
  TaskApplication, 
  WorkCategory, 
  TaskStatus, 
  TaskRequirements, 
  TaskRewards,
  ApiResponse,
  PaginatedResponse
} from '../../../shared/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface TaskSearchFilters {
  category?: WorkCategory;
  status?: TaskStatus;
  dungeonId?: string;
  creatorId?: string;
  organizationId?: string;
  minTrustScore?: number;
  maxTrustScore?: number;
  skills?: string[];
  location?: string;
  minReward?: number;
  maxReward?: number;
  deadlineBefore?: Date;
  deadlineAfter?: Date;
  searchText?: string;
  sortBy?: 'created_at' | 'deadline' | 'trust_score' | 'xp_reward';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export interface TaskCreationData {
  title: string;
  description: string;
  category?: WorkCategory;
  dungeonId?: string | null;
  organizationId?: string | null;
  requirements: TaskRequirements;
  rewards: TaskRewards;
  deadline?: Date | null;
}

class TaskManagementService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('goodgrid_token'); // Changed from 'authToken' to 'goodgrid_token'
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Request failed');
    }
    
    return data.data;
  }

  /**
   * Create a new task
   */
  async createTask(taskData: TaskCreationData): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        ...taskData,
        deadline: taskData.deadline?.toISOString()
      })
    });

    return this.handleResponse<Task>(response);
  }

  /**
   * Search tasks with filters
   */
  async searchTasks(filters: TaskSearchFilters): Promise<{
    tasks: Task[];
    pagination: {
      total: number;
      hasMore: boolean;
      limit: number;
      offset: number;
    };
  }> {
    const params = new URLSearchParams();

    // Add all filter parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'skills' && Array.isArray(value)) {
          params.append(key, value.join(','));
        } else if (key === 'deadlineBefore' || key === 'deadlineAfter') {
          params.append(key, (value as Date).toISOString());
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/tasks/search?${params}`, {
      headers: this.getAuthHeaders()
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to search tasks');
    }

    return {
      tasks: result.data,
      pagination: result.pagination
    };
  }

  /**
   * Get default sample tasks for empty dungeons
   */
  private getDefaultTasksForCategory(category: WorkCategory): Task[] {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 7); // 7 days from now

    const sampleTasks: Record<WorkCategory, Task[]> = {
      FREELANCE: [
        {
          id: 'sample-freelance-1',
          title: 'Website Design for Local Business',
          description: 'Create a modern, responsive website for a local coffee shop. Must include menu, location, and contact information.',
          category: 'FREELANCE',
          status: 'OPEN',
          creatorId: 'system',
          dungeonId: null,
          requirements: {
            trustScoreMin: 10,
            level: 1,
            skills: ['Web Design', 'HTML/CSS'],
            timeCommitment: 20
          },
          rewards: {
            xp: 150,
            trustScoreBonus: 5,
            rwisPoints: 10,
            payment: 500
          },
          deadline: baseDate,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'sample-freelance-2',
          title: 'Logo Design Project',
          description: 'Design a professional logo for a startup tech company. Multiple concepts required.',
          category: 'FREELANCE',
          status: 'OPEN',
          creatorId: 'system',
          dungeonId: null,
          requirements: {
            trustScoreMin: 5,
            level: 1,
            skills: ['Graphic Design', 'Adobe Illustrator'],
            timeCommitment: 10
          },
          rewards: {
            xp: 100,
            trustScoreBonus: 3,
            rwisPoints: 8,
            payment: 300
          },
          deadline: baseDate,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      COMMUNITY: [
        {
          id: 'sample-community-1',
          title: 'Community Garden Cleanup',
          description: 'Help clean and maintain the local community garden. Bring gloves and enthusiasm!',
          category: 'COMMUNITY',
          status: 'OPEN',
          creatorId: 'system',
          dungeonId: null,
          requirements: {
            trustScoreMin: 0,
            level: 1,
            skills: ['Gardening', 'Teamwork'],
            timeCommitment: 4
          },
          rewards: {
            xp: 50,
            trustScoreBonus: 10,
            rwisPoints: 15
          },
          deadline: baseDate,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'sample-community-2',
          title: 'Food Bank Volunteer',
          description: 'Assist with sorting and distributing food donations at the local food bank.',
          category: 'COMMUNITY',
          status: 'OPEN',
          creatorId: 'system',
          dungeonId: null,
          requirements: {
            trustScoreMin: 0,
            level: 1,
            skills: ['Organization', 'Communication'],
            timeCommitment: 3
          },
          rewards: {
            xp: 40,
            trustScoreBonus: 8,
            rwisPoints: 12
          },
          deadline: baseDate,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      CORPORATE: [
        {
          id: 'sample-corporate-1',
          title: 'Junior Developer Position',
          description: 'Entry-level software development role. Work on real projects with mentorship from senior developers.',
          category: 'CORPORATE',
          status: 'OPEN',
          creatorId: 'system',
          dungeonId: null,
          requirements: {
            trustScoreMin: 20,
            level: 2,
            skills: ['JavaScript', 'React', 'Git'],
            timeCommitment: 160
          },
          rewards: {
            xp: 500,
            trustScoreBonus: 20,
            rwisPoints: 50,
            payment: 4000
          },
          deadline: baseDate,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'sample-corporate-2',
          title: 'Marketing Intern',
          description: 'Support marketing team with social media, content creation, and campaign analysis.',
          category: 'CORPORATE',
          status: 'OPEN',
          creatorId: 'system',
          dungeonId: null,
          requirements: {
            trustScoreMin: 15,
            level: 1,
            skills: ['Social Media', 'Content Writing', 'Analytics'],
            timeCommitment: 120
          },
          rewards: {
            xp: 300,
            trustScoreBonus: 15,
            rwisPoints: 30,
            payment: 2500
          },
          deadline: baseDate,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    };

    return sampleTasks[category] || [];
  }

  /**
   * Get tasks by category (for dungeon display)
   */
  async getTasksByCategory(category: WorkCategory, dungeonId?: string): Promise<Task[]> {
    try {
      const params = new URLSearchParams();
      if (dungeonId) {
        params.append('dungeonId', dungeonId);
      }

      const response = await fetch(`${API_BASE_URL}/tasks/category/${category}?${params}`, {
        headers: this.getAuthHeaders()
      });

      const tasks = await this.handleResponse<Task[]>(response);
      
      // If no tasks found, return default sample tasks for demo purposes
      if (!tasks || tasks.length === 0) {
        return this.getDefaultTasksForCategory(category);
      }
      
      return tasks;
    } catch (error) {
      console.warn('Failed to fetch tasks, using default sample tasks:', error);
      // On error, return default sample tasks instead of failing
      return this.getDefaultTasksForCategory(category);
    }
  }

  /**
   * Get recommended tasks for current user
   */
  async getRecommendedTasks(limit: number = 10): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/recommendations?limit=${limit}`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<Task[]>(response);
  }

  /**
   * Get specific task by ID
   */
  async getTaskById(taskId: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<Task>(response);
  }

  /**
   * Apply for a task
   */
  async applyForTask(taskId: string, applicationMessage?: string): Promise<TaskApplication> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/apply`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ applicationMessage })
    });

    return this.handleResponse<TaskApplication>(response);
  }

  /**
   * Get applications for a task (task creator only)
   */
  async getTaskApplications(taskId: string): Promise<TaskApplication[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/applications`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<TaskApplication[]>(response);
  }

  /**
   * Process a task application (accept/reject)
   */
  async processApplication(
    applicationId: string, 
    decision: 'ACCEPTED' | 'REJECTED', 
    feedback?: string
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/applications/${applicationId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ decision, feedback })
    });

    await this.handleResponse<void>(response);
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });

    await this.handleResponse<void>(response);
  }

  /**
   * Get user's task applications
   */
  async getUserApplications(): Promise<TaskApplication[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/my-applications`, {
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<TaskApplication[]>(response);
  }

  /**
   * Get tasks created by current user
   */
  async getMyTasks(filters?: {
    status?: TaskStatus;
    limit?: number;
    offset?: number;
  }): Promise<{
    tasks: Task[];
    pagination: {
      total: number;
      hasMore: boolean;
      limit: number;
      offset: number;
    };
  }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const response = await fetch(`${API_BASE_URL}/tasks/my-tasks?${params}`, {
      headers: this.getAuthHeaders()
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to get tasks');
    }

    return {
      tasks: result.data,
      pagination: result.pagination
    };
  }

  /**
   * Get task statistics for dashboard
   */
  async getTaskStats(): Promise<{
    totalTasks: number;
    openTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    totalApplications: number;
    pendingApplications: number;
  }> {
    // This would be implemented as a separate endpoint in a real system
    // For now, we'll aggregate from existing endpoints
    const [myTasks, myApplications] = await Promise.all([
      this.getMyTasks({ limit: 1000 }),
      this.getUserApplications()
    ]);

    const tasks = myTasks.tasks;
    
    return {
      totalTasks: tasks.length,
      openTasks: tasks.filter(t => t.status === 'OPEN').length,
      inProgressTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completedTasks: tasks.filter(t => t.status === 'COMPLETED' || t.status === 'VERIFIED').length,
      totalApplications: myApplications.length,
      pendingApplications: myApplications.filter(a => a.status === 'PENDING').length
    };
  }
}

export const taskManagementService = new TaskManagementService();