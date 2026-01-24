import { GoogleGenerativeAI } from '@google/generative-ai';
import { Task, User, UserStats, WorkCategory, TaskRequirements } from '../../../shared/types';

export interface TaskRecommendation {
  task: Task;
  matchScore: number; // 0-100 compatibility score
  reasoning: string;
  skillAlignment: string[];
  difficultyMatch: 'PERFECT' | 'GOOD' | 'CHALLENGING' | 'TOO_EASY' | 'TOO_HARD';
  categoryFit: number; // 0-100 how well it fits user's category preferences
}

export interface TaskMatchingCriteria {
  preferredCategories: WorkCategory[];
  skillKeywords: string[];
  availabilityHours: number;
  difficultyPreference: 'EASY' | 'MODERATE' | 'CHALLENGING' | 'ANY';
  locationRadius?: number;
  trustScoreRange: { min: number; max: number };
}

export class GeminiTaskMatchingService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * Match tasks to user based on their profile and preferences
     */
    async matchTasksToUser(
        availableTasks: Task[],
        user: User,
        userStats: UserStats,
        criteria?: TaskMatchingCriteria
    ): Promise<TaskRecommendation[]> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildTaskMatchingPrompt(availableTasks, user, userStats, criteria);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseTaskMatchingResponse(text, availableTasks);
        } catch (error) {
            console.error('Task matching error:', error);
            
            // Fallback to basic matching when AI fails
            return this.fallbackTaskMatching(availableTasks, user, userStats, criteria);
        }
    }

    /**
     * Get personalized task recommendations based on user's work history
     */
    async getPersonalizedRecommendations(
        user: User,
        userStats: UserStats,
        workHistory: any[],
        availableTasks: Task[],
        limit: number = 10
    ): Promise<TaskRecommendation[]> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildPersonalizedRecommendationPrompt(
                user, userStats, workHistory, availableTasks, limit
            );
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseTaskMatchingResponse(text, availableTasks);
        } catch (error) {
            console.error('Personalized recommendation error:', error);
            
            // Fallback to category-based recommendations
            return this.fallbackPersonalizedRecommendations(user, userStats, availableTasks, limit);
        }
    }

    /**
     * Analyze user's skill progression and suggest next steps
     */
    async analyzeSkillProgression(
        user: User,
        userStats: UserStats,
        workHistory: any[]
    ): Promise<{
        currentSkills: string[];
        emergingSkills: string[];
        recommendedSkillPaths: string[];
        nextLevelTasks: Task[];
        skillGaps: string[];
    }> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildSkillProgressionPrompt(user, userStats, workHistory);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseSkillProgressionResponse(text);
        } catch (error) {
            console.error('Skill progression analysis error:', error);
            
            return {
                currentSkills: [],
                emergingSkills: [],
                recommendedSkillPaths: [],
                nextLevelTasks: [],
                skillGaps: []
            };
        }
    }

    private buildTaskMatchingPrompt(
        tasks: Task[],
        user: User,
        userStats: UserStats,
        criteria?: TaskMatchingCriteria
    ): string {
        return `
You are an AI task matching system for a gamified community contribution platform.
Analyze the user profile and match them with the most suitable tasks.

USER PROFILE:
Username: ${user.username}
Trust Score: ${userStats.trustScore}
RWIS Score: ${userStats.rwisScore}
XP Points: ${userStats.xpPoints}
Current Level: ${userStats.currentLevel}
Unlocked Zones: ${userStats.unlockedZones.join(', ')}

CATEGORY EXPERIENCE:
Freelance: ${userStats.categoryStats.freelance.tasksCompleted} tasks, ${userStats.categoryStats.freelance.totalXP} XP, ${userStats.categoryStats.freelance.averageRating}/5 rating
Community: ${userStats.categoryStats.community.tasksCompleted} tasks, ${userStats.categoryStats.community.totalXP} XP, ${userStats.categoryStats.community.averageRating}/5 rating
Corporate: ${userStats.categoryStats.corporate.tasksCompleted} tasks, ${userStats.categoryStats.corporate.totalXP} XP, ${userStats.categoryStats.corporate.averageRating}/5 rating

MATCHING CRITERIA:
${criteria ? `
Preferred Categories: ${criteria.preferredCategories.join(', ')}
Skill Keywords: ${criteria.skillKeywords.join(', ')}
Available Hours: ${criteria.availabilityHours}
Difficulty Preference: ${criteria.difficultyPreference}
Trust Score Range: ${criteria.trustScoreRange.min}-${criteria.trustScoreRange.max}
` : 'No specific criteria provided - use general matching'}

AVAILABLE TASKS:
${tasks.map((task, index) => `
Task ${index + 1}:
- ID: ${task.id}
- Title: ${task.title}
- Category: ${task.category}
- Description: ${task.description}
- Required Trust Score: ${task.requirements.trustScoreMin}
- Time Commitment: ${task.requirements.timeCommitment} hours
- Required Skills: ${task.requirements.skills.join(', ')}
- XP Reward: ${task.rewards.xp}
- RWIS Points: ${task.rewards.rwisPoints}
`).join('\n')}

MATCHING INSTRUCTIONS:
1. Consider user's experience level and category preferences
2. Match skill requirements with user's demonstrated abilities
3. Ensure trust score requirements are met
4. Consider task difficulty vs user level for optimal challenge
5. Factor in time commitment vs user availability
6. Prioritize tasks that help user progress in their preferred categories

Respond with a JSON array of task recommendations:
[
  {
    "taskId": "task_id_here",
    "matchScore": 85,
    "reasoning": "Detailed explanation of why this task matches",
    "skillAlignment": ["skill1", "skill2"],
    "difficultyMatch": "GOOD",
    "categoryFit": 90
  }
]

Rank tasks by match score (highest first). Include only tasks with match score >= 60.
`;
    }

    private buildPersonalizedRecommendationPrompt(
        user: User,
        userStats: UserStats,
        workHistory: any[],
        availableTasks: Task[],
        limit: number
    ): string {
        return `
You are an AI recommendation system for a gamified work platform.
Analyze the user's work history and provide personalized task recommendations.

USER PROFILE:
Username: ${user.username}
Trust Score: ${userStats.trustScore}
Current Level: ${userStats.currentLevel}
Total XP: ${userStats.xpPoints}

WORK HISTORY ANALYSIS:
Total Completed Tasks: ${workHistory.length}
Recent Work Pattern: ${JSON.stringify(workHistory.slice(-10))}

CATEGORY PERFORMANCE:
Freelance: ${userStats.categoryStats.freelance.tasksCompleted} tasks, avg rating ${userStats.categoryStats.freelance.averageRating}/5
Community: ${userStats.categoryStats.community.tasksCompleted} tasks, avg rating ${userStats.categoryStats.community.averageRating}/5
Corporate: ${userStats.categoryStats.corporate.tasksCompleted} tasks, avg rating ${userStats.categoryStats.corporate.averageRating}/5

AVAILABLE TASKS:
${availableTasks.slice(0, 20).map((task, index) => `
Task ${index + 1}: ${task.title} (${task.category}) - ${task.requirements.timeCommitment}h, ${task.rewards.xp} XP
Skills: ${task.requirements.skills.join(', ')}
Trust Score Required: ${task.requirements.trustScoreMin}
`).join('\n')}

RECOMMENDATION CRITERIA:
1. Build on user's demonstrated strengths
2. Introduce appropriate challenges for growth
3. Consider user's category preferences based on history
4. Suggest tasks that unlock new opportunities
5. Balance between comfort zone and skill development
6. Prioritize high-impact tasks (RWIS score)

Provide ${limit} personalized recommendations in JSON format:
[
  {
    "taskId": "task_id",
    "matchScore": 92,
    "reasoning": "Why this task is perfect for this user's growth",
    "skillAlignment": ["matching_skills"],
    "difficultyMatch": "PERFECT",
    "categoryFit": 95
  }
]

Focus on quality over quantity. Explain the growth opportunity each task provides.
`;
    }

    private buildSkillProgressionPrompt(
        user: User,
        userStats: UserStats,
        workHistory: any[]
    ): string {
        return `
Analyze this user's skill progression and career development on our platform.

USER DATA:
Username: ${user.username}
Level: ${userStats.currentLevel}
Trust Score: ${userStats.trustScore}
Total Tasks: ${workHistory.length}

WORK HISTORY:
${workHistory.map(item => `
- Category: ${item.category}
- Quality Score: ${item.qualityScore}/5
- XP Earned: ${item.xpEarned}
- Skills Used: ${item.skillsUsed || 'Not specified'}
- Completion Date: ${item.completionDate}
`).join('\n')}

CATEGORY BREAKDOWN:
Freelance: ${userStats.categoryStats.freelance.tasksCompleted} tasks, specializations: ${userStats.categoryStats.freelance.specializations.join(', ')}
Community: ${userStats.categoryStats.community.tasksCompleted} tasks, specializations: ${userStats.categoryStats.community.specializations.join(', ')}
Corporate: ${userStats.categoryStats.corporate.tasksCompleted} tasks, specializations: ${userStats.categoryStats.corporate.specializations.join(', ')}

ANALYSIS REQUIREMENTS:
1. Identify current skill strengths based on task performance
2. Detect emerging skills from recent work patterns
3. Recommend skill development paths for career growth
4. Identify skill gaps that limit opportunities
5. Suggest next-level tasks for skill advancement

Respond in JSON format:
{
  "currentSkills": ["skill1", "skill2"],
  "emergingSkills": ["developing_skill1"],
  "recommendedSkillPaths": ["path1: description", "path2: description"],
  "nextLevelTasks": [],
  "skillGaps": ["gap1", "gap2"]
}

Be specific and actionable in your recommendations.
`;
    }

    private parseTaskMatchingResponse(text: string, availableTasks: Task[]): TaskRecommendation[] {
        try {
            const parsed = JSON.parse(text);
            const recommendations: TaskRecommendation[] = [];

            for (const item of parsed) {
                const task = availableTasks.find(t => t.id === item.taskId);
                if (task) {
                    recommendations.push({
                        task,
                        matchScore: Math.max(0, Math.min(100, item.matchScore || 0)),
                        reasoning: item.reasoning || 'No reasoning provided',
                        skillAlignment: Array.isArray(item.skillAlignment) ? item.skillAlignment : [],
                        difficultyMatch: ['PERFECT', 'GOOD', 'CHALLENGING', 'TOO_EASY', 'TOO_HARD'].includes(item.difficultyMatch) 
                            ? item.difficultyMatch 
                            : 'GOOD',
                        categoryFit: Math.max(0, Math.min(100, item.categoryFit || 0))
                    });
                }
            }

            return recommendations.sort((a, b) => b.matchScore - a.matchScore);
        } catch (error) {
            console.error('Failed to parse task matching response:', error);
            return [];
        }
    }

    private parseSkillProgressionResponse(text: string) {
        try {
            const parsed = JSON.parse(text);
            return {
                currentSkills: Array.isArray(parsed.currentSkills) ? parsed.currentSkills : [],
                emergingSkills: Array.isArray(parsed.emergingSkills) ? parsed.emergingSkills : [],
                recommendedSkillPaths: Array.isArray(parsed.recommendedSkillPaths) ? parsed.recommendedSkillPaths : [],
                nextLevelTasks: Array.isArray(parsed.nextLevelTasks) ? parsed.nextLevelTasks : [],
                skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : []
            };
        } catch (error) {
            console.error('Failed to parse skill progression response:', error);
            return {
                currentSkills: [],
                emergingSkills: [],
                recommendedSkillPaths: [],
                nextLevelTasks: [],
                skillGaps: []
            };
        }
    }

    private fallbackTaskMatching(
        tasks: Task[],
        user: User,
        userStats: UserStats,
        criteria?: TaskMatchingCriteria
    ): TaskRecommendation[] {
        // Simple fallback matching based on trust score and category preferences
        return tasks
            .filter(task => task.requirements.trustScoreMin <= userStats.trustScore)
            .map(task => ({
                task,
                matchScore: this.calculateBasicMatchScore(task, userStats, criteria),
                reasoning: 'Basic matching (AI service unavailable)',
                skillAlignment: [],
                difficultyMatch: 'GOOD' as const,
                categoryFit: criteria?.preferredCategories.includes(task.category) ? 80 : 50
            }))
            .filter(rec => rec.matchScore >= 60)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 10);
    }

    private fallbackPersonalizedRecommendations(
        user: User,
        userStats: UserStats,
        availableTasks: Task[],
        limit: number
    ): TaskRecommendation[] {
        // Fallback based on user's strongest category
        const strongestCategory = this.getStrongestCategory(userStats);
        
        return availableTasks
            .filter(task => task.category === strongestCategory)
            .filter(task => task.requirements.trustScoreMin <= userStats.trustScore + 10)
            .map(task => ({
                task,
                matchScore: this.calculateBasicMatchScore(task, userStats),
                reasoning: 'Recommended based on your strongest category',
                skillAlignment: [],
                difficultyMatch: 'GOOD' as const,
                categoryFit: 85
            }))
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);
    }

    private calculateBasicMatchScore(
        task: Task,
        userStats: UserStats,
        criteria?: TaskMatchingCriteria
    ): number {
        let score = 50; // Base score

        // Trust score compatibility
        if (task.requirements.trustScoreMin <= userStats.trustScore) {
            score += 20;
        } else {
            score -= (task.requirements.trustScoreMin - userStats.trustScore) * 2;
        }

        // Category preference
        if (criteria?.preferredCategories.includes(task.category)) {
            score += 15;
        }

        // Level appropriateness
        const levelDiff = Math.abs(userStats.currentLevel - (task.requirements.level || 1));
        if (levelDiff <= 1) {
            score += 10;
        } else {
            score -= levelDiff * 5;
        }

        // XP reward attractiveness
        if (task.rewards.xp >= 50) {
            score += 5;
        }

        return Math.max(0, Math.min(100, score));
    }

    private getStrongestCategory(userStats: UserStats): WorkCategory {
        const categories = userStats.categoryStats;
        
        if (categories.freelance.totalXP >= categories.community.totalXP && 
            categories.freelance.totalXP >= categories.corporate.totalXP) {
            return 'FREELANCE';
        } else if (categories.community.totalXP >= categories.corporate.totalXP) {
            return 'COMMUNITY';
        } else {
            return 'CORPORATE';
        }
    }
}