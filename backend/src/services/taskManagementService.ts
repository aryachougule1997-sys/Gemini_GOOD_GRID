import { TaskModel, TaskApplicationModel } from '../models/Task';
import { UserModel } from '../models/User';
import { OrganizationModel } from '../models/Organization';
import { GeminiTaskCategorizationService } from './geminiTaskCategorizationService';
import { GeminiTaskMatchingService } from './geminiTaskMatchingService';
import { NotificationService } from './notificationService';
import { 
  Task, 
  TaskApplication, 
  WorkCategory, 
  TaskStatus, 
  ApplicationStatus,
  TaskRequirements,
  TaskRewards,
  User
} from '../../../shared/types';

export class TaskManagementService {
  private geminiCategorization: GeminiTaskCategorizationService;
  private geminiMatching: GeminiTaskMatchingService;
  private notificationService: NotificationService;

  constructor() {
    this.geminiCategorization = new GeminiTaskCategorizationService();
    this.geminiMatching = new GeminiTaskMatchingService();
    this.notificationService = new NotificationService();
  }

  /**
   * Create a new task with AI-powered categorization and validation
   */
  async createTask(taskData: {
    title: string;
    description: string;
    category?: WorkCategory; // Optional - AI will suggest if not provided
    dungeonId?: string | null;
    creatorId: string;
    organizationId?: string | null;
    requirements: TaskRequirements;
    rewards: TaskRewards;
    deadline?: Date | null;
  }): Promise<Task> {
    // Validate creator exists
    const creator = await UserModel.findById(taskData.creatorId);
    if (!creator) {
      throw new Error('Creator not found');
    }

    // Validate organization if provided
    if (taskData.organizationId) {
      const organization = await OrganizationModel.findById(taskData.organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }
    }

    // Use AI to categorize task if category not provided
    let category = taskData.category;
    if (!category) {
      // For now, default to COMMUNITY if no category provided
      // In a real implementation, you would use AI categorization
      category = 'COMMUNITY';
    }

    // Validate task requirements and rewards
    this.validateTaskRequirements(taskData.requirements);
    this.validateTaskRewards(taskData.rewards, category);

    // Create the task
    const task = await TaskModel.create({
      ...taskData,
      category
    });

    // Send notifications to potentially interested users
    // await this.notifyPotentialApplicants(task);

    return task;
  }

  /**
   * Get tasks with advanced filtering and search
   */
  async searchTasks(filters: {
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
    deadline?: {
      before?: Date;
      after?: Date;
    };
    searchText?: string;
    sortBy?: 'created_at' | 'deadline' | 'trust_score' | 'xp_reward';
    sortOrder?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
  }): Promise<{
    tasks: Task[];
    total: number;
    hasMore: boolean;
  }> {
    // Build dynamic query based on filters
    const tasks = await TaskModel.search({
      category: filters.category,
      status: filters.status || 'OPEN',
      minTrustScore: filters.minTrustScore,
      maxTrustScore: filters.maxTrustScore,
      skills: filters.skills,
      limit: filters.limit || 20,
      offset: filters.offset || 0
    });

    // Apply additional filtering that's not in the base search
    let filteredTasks = tasks;

    if (filters.dungeonId) {
      filteredTasks = filteredTasks.filter(task => task.dungeonId === filters.dungeonId);
    }

    if (filters.creatorId) {
      filteredTasks = filteredTasks.filter(task => task.creatorId === filters.creatorId);
    }

    if (filters.organizationId) {
      filteredTasks = filteredTasks.filter(task => task.organizationId === filters.organizationId);
    }

    if (filters.minReward) {
      filteredTasks = filteredTasks.filter(task => 
        (task.rewards.payment || 0) >= filters.minReward!
      );
    }

    if (filters.maxReward) {
      filteredTasks = filteredTasks.filter(task => 
        (task.rewards.payment || 0) <= filters.maxReward!
      );
    }

    if (filters.deadline) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.deadline) return false;
        const taskDeadline = new Date(task.deadline);
        
        if (filters.deadline!.before && taskDeadline > filters.deadline!.before) {
          return false;
        }
        
        if (filters.deadline!.after && taskDeadline < filters.deadline!.after) {
          return false;
        }
        
        return true;
      });
    }

    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.requirements.skills.some(skill => 
          skill.toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredTasks.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'created_at':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'deadline':
            aValue = a.deadline ? new Date(a.deadline).getTime() : 0;
            bValue = b.deadline ? new Date(b.deadline).getTime() : 0;
            break;
          case 'trust_score':
            aValue = a.requirements.trustScoreMin || 0;
            bValue = b.requirements.trustScoreMin || 0;
            break;
          case 'xp_reward':
            aValue = a.rewards.xp;
            bValue = b.rewards.xp;
            break;
          default:
            return 0;
        }
        
        const order = filters.sortOrder === 'DESC' ? -1 : 1;
        return aValue > bValue ? order : aValue < bValue ? -order : 0;
      });
    }

    const total = filteredTasks.length;
    const hasMore = (filters.offset || 0) + (filters.limit || 20) < total;

    return {
      tasks: filteredTasks,
      total,
      hasMore
    };
  }

  /**
   * Apply for a task
   */
  async applyForTask(taskId: string, userId: string, applicationMessage?: string): Promise<TaskApplication> {
    // Check if task exists and is open
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status !== 'OPEN') {
      throw new Error('Task is not accepting applications');
    }

    // Check if user already applied
    const hasApplied = await TaskApplicationModel.hasUserApplied(taskId, userId);
    if (hasApplied) {
      throw new Error('You have already applied for this task');
    }

    // Check if user meets requirements
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const meetsRequirements = await this.checkTaskRequirements(task, user);
    if (!meetsRequirements.eligible) {
      throw new Error(`Requirements not met: ${meetsRequirements.reasons.join(', ')}`);
    }

    // Create application
    const application = await TaskApplicationModel.create({
      taskId,
      userId,
      applicationMessage
    });

    // Notify task creator
    // await this.notificationService.sendNotification({
    //   userId: task.creatorId,
    //   type: 'TASK_APPLICATION',
    //   title: 'New Task Application',
    //   message: `${user.username} applied for your task: ${task.title}`,
    //   data: {
    //     taskId: task.id,
    //     applicationId: application.id,
    //     applicantId: userId
    //   }
    // });

    return application;
  }

  /**
   * Accept or reject a task application
   */
  async processApplication(
    applicationId: string, 
    decision: 'ACCEPTED' | 'REJECTED', 
    processedBy: string,
    feedback?: string
  ): Promise<void> {
    const application = await TaskApplicationModel.findById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const task = await TaskModel.findById(application.taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Verify the processor has permission (task creator or organization admin)
    if (task.creatorId !== processedBy) {
      // TODO: Add organization admin check when implemented
      throw new Error('Unauthorized to process this application');
    }

    // Update application status
    await TaskApplicationModel.updateStatus(applicationId, decision);

    // If accepted, update task status and reject other applications
    if (decision === 'ACCEPTED') {
      await TaskModel.updateStatus(task.id, 'IN_PROGRESS');
      
      // Reject all other pending applications for this task
      const otherApplications = await TaskApplicationModel.findByTask(task.id);
      for (const otherApp of otherApplications) {
        if (otherApp.id !== applicationId && otherApp.status === 'PENDING') {
          await TaskApplicationModel.updateStatus(otherApp.id, 'REJECTED');
          
          // Notify rejected applicants
          // await this.notificationService.sendNotification({
          //   userId: otherApp.userId,
          //   type: 'APPLICATION_REJECTED',
          //   title: 'Application Update',
          //   message: `Your application for "${task.title}" was not selected this time.`,
          //   data: { taskId: task.id, applicationId: otherApp.id }
          // });
        }
      }
    }

    // Notify the applicant
    const notificationType = decision === 'ACCEPTED' ? 'APPLICATION_ACCEPTED' : 'APPLICATION_REJECTED';
    const message = decision === 'ACCEPTED' 
      ? `Congratulations! Your application for "${task.title}" has been accepted.`
      : `Your application for "${task.title}" was not selected this time.`;

    // await this.notificationService.sendNotification({
    //   userId: application.userId,
    //   type: notificationType,
    //   title: 'Application Update',
    //   message: feedback ? `${message} Feedback: ${feedback}` : message,
    //   data: { taskId: task.id, applicationId: application.id }
    // });
  }

  /**
   * Get task applications for a specific task
   */
  async getTaskApplications(taskId: string, requesterId: string): Promise<TaskApplication[]> {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Verify requester has permission to view applications
    if (task.creatorId !== requesterId) {
      // TODO: Add organization admin check when implemented
      throw new Error('Unauthorized to view applications');
    }

    return await TaskApplicationModel.findByTask(taskId);
  }

  /**
   * Get user's task applications
   */
  async getUserApplications(userId: string): Promise<TaskApplication[]> {
    return await TaskApplicationModel.findByUser(userId);
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus, updatedBy: string): Promise<void> {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Verify permission to update status
    if (task.creatorId !== updatedBy) {
      // TODO: Add organization admin and assigned user checks
      throw new Error('Unauthorized to update task status');
    }

    await TaskModel.updateStatus(taskId, status);

    // Send notifications based on status change
    if (status === 'COMPLETED') {
      // Notify all stakeholders that task is completed
      const applications = await TaskApplicationModel.findByTask(taskId);
      const acceptedApplication = applications.find(app => app.status === 'ACCEPTED');
      
      if (acceptedApplication) {
        // await this.notificationService.sendNotification({
        //   userId: acceptedApplication.userId,
        //   type: 'TASK_COMPLETED',
        //   title: 'Task Completed',
        //   message: `The task "${task.title}" has been marked as completed. Verification is in progress.`,
        //   data: { taskId: task.id }
        // });
      }
    }
  }

  /**
   * Get recommended tasks for a user using AI
   */
  async getRecommendedTasks(userId: string, limit: number = 10): Promise<Task[]> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get user's profile and work history for AI analysis
    const userProfile = await UserModel.getUserProfile(userId);
    
    // Get available tasks
    const availableTasks = await TaskModel.search({
      status: 'OPEN',
      limit: 50 // Get more tasks for AI to analyze
    });

    // Use AI to match tasks to user
    // For now, return the first few tasks that meet requirements
    const accessibleRecommendations = [];
    for (const task of availableTasks.slice(0, limit)) {
      const meetsRequirements = await this.checkTaskRequirements(task, user);
      if (meetsRequirements.eligible) {
        accessibleRecommendations.push(task);
      }
    }

    return accessibleRecommendations;
  }

  /**
   * Get tasks by category for dungeon display
   */
  async getTasksByCategory(category: WorkCategory, dungeonId?: string): Promise<Task[]> {
    if (dungeonId) {
      return await TaskModel.findByDungeon(dungeonId);
    } else {
      return await TaskModel.findByCategory(category);
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string): Promise<Task | null> {
    return await TaskModel.findById(taskId);
  }

  /**
   * Private helper methods
   */
  private validateTaskRequirements(requirements: TaskRequirements): void {
    if (requirements.trustScoreMin < 0) {
      throw new Error('Trust score minimum cannot be negative');
    }

    if (requirements.timeCommitment <= 0) {
      throw new Error('Time commitment must be positive');
    }

    if (requirements.skills.length === 0) {
      throw new Error('At least one skill must be specified');
    }
  }

  private validateTaskRewards(rewards: TaskRewards, category: WorkCategory): void {
    if (rewards.xp <= 0) {
      throw new Error('XP reward must be positive');
    }

    if (rewards.trustScoreBonus < 0) {
      throw new Error('Trust score bonus cannot be negative');
    }

    if (rewards.rwisPoints < 0) {
      throw new Error('RWIS points cannot be negative');
    }

    // Freelance tasks should have payment
    if (category === 'FREELANCE' && (!rewards.payment || rewards.payment <= 0)) {
      throw new Error('Freelance tasks must have a payment amount');
    }

    // Community tasks shouldn't have payment
    if (category === 'COMMUNITY' && rewards.payment) {
      throw new Error('Community tasks should not have payment');
    }
  }

  private async checkTaskRequirements(task: Task, user: User): Promise<{
    eligible: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];
    const userStats = await UserModel.getUserStats(user.id);

    if (!userStats) {
      reasons.push('User stats not found');
      return { eligible: false, reasons };
    }

    if (task.requirements.trustScoreMin && userStats.trustScore < task.requirements.trustScoreMin) {
      reasons.push(`Trust score too low (need ${task.requirements.trustScoreMin}, have ${userStats.trustScore})`);
    }

    if (task.requirements.level && userStats.currentLevel < task.requirements.level) {
      reasons.push(`Level too low (need ${task.requirements.level}, have ${userStats.currentLevel})`);
    }

    if (task.requirements.specificBadges && task.requirements.specificBadges.length > 0) {
      const userBadges = await UserModel.getUserBadges(user.id);
      const userBadgeNames = userBadges.map(b => b.name);
      
      const missingBadges = task.requirements.specificBadges.filter(
        badge => !userBadgeNames.includes(badge)
      );
      
      if (missingBadges.length > 0) {
        reasons.push(`Missing required badges: ${missingBadges.join(', ')}`);
      }
    }

    return {
      eligible: reasons.length === 0,
      reasons
    };
  }

  private async notifyPotentialApplicants(task: Task): Promise<void> {
    // Get users who might be interested in this task
    // This is a simplified version - in production, you'd want more sophisticated matching
    const potentialUsers = await UserModel.findUsersWithSkills(task.requirements.skills);
    
    for (const user of potentialUsers.slice(0, 10)) { // Limit notifications
      const meetsRequirements = await this.checkTaskRequirements(task, user);
      
      if (meetsRequirements.eligible) {
        // await this.notificationService.sendNotification({
        //   userId: user.id,
        //   type: 'NEW_TASK_AVAILABLE',
        //   title: 'New Opportunity Available',
        //   message: `A new ${task.category.toLowerCase()} opportunity matching your skills is available: ${task.title}`,
        //   data: { taskId: task.id }
        // });
      }
    }
  }
}