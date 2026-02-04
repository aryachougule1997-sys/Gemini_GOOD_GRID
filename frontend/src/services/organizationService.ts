import { Organization, Task, WorkCategory, TaskStatus } from '../types/api';

export interface OrganizationRegistrationData {
  name: string;
  description?: string;
  contactEmail: string;
  website?: string;
}

export interface OrganizationStats {
  totalTasks: number;
  completedTasks: number;
  activeVolunteers: number;
  averageRating: number;
}

export interface OrganizationAnalytics {
  taskMetrics: {
    totalTasks: number;
    completedTasks: number;
    averageCompletionTime: number;
    completionRate: number;
  };
  volunteerMetrics: {
    totalVolunteers: number;
    activeVolunteers: number;
    retentionRate: number;
    averageRating: number;
  };
  impactMetrics: {
    totalRWIS: number;
    peopleHelped: number;
    hoursContributed: number;
    projectsCompleted: number;
  };
  categoryBreakdown: {
    freelance: { tasks: number; volunteers: number; impact: number };
    community: { tasks: number; volunteers: number; impact: number };
    corporate: { tasks: number; volunteers: number; impact: number };
  };
}

export interface Volunteer {
  userId: string;
  username: string;
  email: string;
  tasksCompleted: number;
  averageRating: number;
  totalXP: number;
  totalRWIS: number;
  categories: WorkCategory[];
  lastActivity: Date;
}

export interface OrganizationRating {
  rating: number;
  feedback?: string;
  taskId?: string;
}

export interface ImpactReport {
  summary: {
    totalImpact: number;
    tasksCompleted: number;
    volunteersEngaged: number;
    hoursContributed: number;
  };
  categoryImpact: Record<string, any>;
  topVolunteers: any[];
  achievements: any[];
  testimonials: any[];
}

class OrganizationService {
  private baseUrl = '/api/organizations';

  /**
   * Register a new organization
   */
  async registerOrganization(data: OrganizationRegistrationData): Promise<Organization> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to register organization');
    }

    return result.data;
  }

  /**
   * Get organization by ID
   */
  async getOrganization(id: string): Promise<Organization & { stats?: OrganizationStats }> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch organization');
    }

    return result.data;
  }

  /**
   * Update organization profile
   */
  async updateOrganization(id: string, data: Partial<OrganizationRegistrationData>): Promise<Organization> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update organization');
    }

    return result.data;
  }

  /**
   * Get all organizations with optional filtering
   */
  async getOrganizations(filters?: {
    verified?: boolean;
    search?: string;
  }): Promise<Organization[]> {
    const params = new URLSearchParams();
    if (filters?.verified !== undefined) params.append('verified', filters.verified.toString());
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${this.baseUrl}?${params}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch organizations');
    }

    return result.data;
  }

  /**
   * Get organization's tasks
   */
  async getOrganizationTasks(id: string, filters?: {
    status?: TaskStatus;
    category?: WorkCategory;
    page?: number;
    limit?: number;
  }): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${this.baseUrl}/${id}/tasks?${params}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch organization tasks');
    }

    return result.data;
  }

  /**
   * Get organization's volunteers
   */
  async getOrganizationVolunteers(id: string, filters?: {
    category?: WorkCategory;
    page?: number;
    limit?: number;
  }): Promise<{
    volunteers: Volunteer[];
    total: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${this.baseUrl}/${id}/volunteers?${params}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch organization volunteers');
    }

    return result.data;
  }

  /**
   * Get organization analytics
   */
  async getOrganizationAnalytics(id: string, timeframe: string = '30d'): Promise<OrganizationAnalytics> {
    const response = await fetch(`${this.baseUrl}/${id}/analytics?timeframe=${timeframe}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch organization analytics');
    }

    return result.data;
  }

  /**
   * Generate impact report
   */
  async getImpactReport(id: string, options?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ImpactReport> {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);

    const response = await fetch(`${this.baseUrl}/${id}/impact-report?${params}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to generate impact report');
    }

    return result.data;
  }

  /**
   * Rate an organization
   */
  async rateOrganization(id: string, rating: OrganizationRating): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/${id}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(rating),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit rating');
    }

    return result.data;
  }

  /**
   * Verify organization (admin only)
   */
  async verifyOrganization(id: string, verified: boolean): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}/${id}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ verified }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update verification status');
    }
  }
}

export const organizationService = new OrganizationService();