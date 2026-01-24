import { GoogleGenerativeAI } from '@google/generative-ai';
import { User, UserStats, WorkCategory, WorkHistoryItem } from '../../../shared/types';

export interface SkillProfile {
  technicalSkills: SkillAssessment[];
  softSkills: SkillAssessment[];
  categoryExpertise: CategoryExpertise[];
  emergingSkills: string[];
  skillGaps: string[];
  overallLevel: number; // 1-10
}

export interface SkillAssessment {
  skill: string;
  level: number; // 1-10
  confidence: number; // 0-100
  evidenceCount: number;
  lastDemonstrated: Date;
  growthTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

export interface CategoryExpertise {
  category: WorkCategory;
  level: number; // 1-10
  specializations: string[];
  totalExperience: number; // hours
  averageQuality: number; // 1-5
  growthRate: number; // XP per month
}

export interface CareerInsights {
  strongestCategories: WorkCategory[];
  recommendedFocus: WorkCategory;
  skillDevelopmentPlan: SkillDevelopmentStep[];
  careerTrajectory: string;
  marketValue: number; // 1-100
}

export interface SkillDevelopmentStep {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  estimatedTimeToAchieve: number; // weeks
  recommendedTasks: string[];
  learningResources: string[];
}

export class GeminiProfileAnalysisService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * Analyze user's complete skill profile based on work history
     */
    async analyzeSkillProfile(
        user: User,
        userStats: UserStats,
        workHistory: WorkHistoryItem[]
    ): Promise<SkillProfile> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildSkillProfilePrompt(user, userStats, workHistory);
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            return this.parseSkillProfileResponse(text);
        } catch (error) {
            console.error('Skill profile analysis error:', error);
            return this.fallbackSkillProfile(userStats, workHistory);
        }
    }

    /**
     * Generate career insights and recommendations
     */
    async generateCareerInsights(
        user: User,
        userStats: UserStats,
        workHistory: WorkHistoryItem[],
        skillProfile: SkillProfile
    ): Promise<CareerInsights> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildCareerInsightsPrompt(user, userStats, workHistory, skillProfile);
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            return this.parseCareerInsightsResponse(text);
        } catch (error) {
            console.error('Career insights generation error:', error);
            return this.fallbackCareerInsights(userStats, skillProfile);
        }
    }

    /**
     * Analyze skill gaps and recommend development paths
     */
    async analyzeSkillGaps(
        userStats: UserStats,
        workHistory: WorkHistoryItem[],
        targetCategory?: WorkCategory
    ): Promise<{
        identifiedGaps: string[];
        prioritySkills: string[];
        developmentPlan: SkillDevelopmentStep[];
        estimatedTimeToImprove: number; // weeks
    }> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildSkillGapPrompt(userStats, workHistory, targetCategory);
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            return this.parseSkillGapResponse(text);
        } catch (error) {
            console.error('Skill gap analysis error:', error);
            return {
                identifiedGaps: [],
                prioritySkills: [],
                developmentPlan: [],
                estimatedTimeToImprove: 12
            };
        }
    }

    /**
     * Track skill progression over time
     */
    async trackSkillProgression(
        userId: string,
        timeframe: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'
    ): Promise<{
        skillGrowth: { skill: string; growthRate: number }[];
        categoryProgression: { category: WorkCategory; improvement: number }[];
        milestones: { skill: string; level: number; achievedDate: Date }[];
        projectedGrowth: { skill: string; projectedLevel: number; timeToAchieve: number }[];
    }> {
        try {
            // This would typically fetch historical data from database
            // For now, return empty structure
            return {
                skillGrowth: [],
                categoryProgression: [],
                milestones: [],
                projectedGrowth: []
            };
        } catch (error) {
            console.error('Skill progression tracking error:', error);
            return {
                skillGrowth: [],
                categoryProgression: [],
                milestones: [],
                projectedGrowth: []
            };
        }
    }

    private buildSkillProfilePrompt(
        user: User,
        userStats: UserStats,
        workHistory: WorkHistoryItem[]
    ): string {
        return `
You are an AI career analyst for a gamified work platform. Analyze this user's complete skill profile.

USER PROFILE:
Username: ${user.username}
Current Level: ${userStats.currentLevel}
Trust Score: ${userStats.trustScore}
RWIS Score: ${userStats.rwisScore}
Total XP: ${userStats.xpPoints}

CATEGORY PERFORMANCE:
Freelance: ${userStats.categoryStats.freelance.tasksCompleted} tasks, ${userStats.categoryStats.freelance.totalXP} XP, ${userStats.categoryStats.freelance.averageRating}/5 rating
Community: ${userStats.categoryStats.community.tasksCompleted} tasks, ${userStats.categoryStats.community.totalXP} XP, ${userStats.categoryStats.community.averageRating}/5 rating
Corporate: ${userStats.categoryStats.corporate.tasksCompleted} tasks, ${userStats.categoryStats.corporate.totalXP} XP, ${userStats.categoryStats.corporate.averageRating}/5 rating

WORK HISTORY:
${workHistory.map(item => `
- Task ID: ${item.taskId} (${item.category})
- Quality Score: ${item.qualityScore || 'Not rated'}/5
- XP Earned: ${item.xpEarned}
- Completion Date: ${item.completionDate || 'Not completed'}
- Trust Score Change: ${item.trustScoreChange}
`).join('\n')}

ANALYSIS REQUIREMENTS:
1. Identify technical skills with proficiency levels (1-10)
2. Assess soft skills and their development
3. Evaluate category expertise and specializations
4. Identify emerging skills showing growth
5. Detect skill gaps limiting opportunities
6. Calculate overall skill level (1-10)

Consider work quality, consistency, growth patterns, and skill diversity.

Respond in JSON format:
{
  "technicalSkills": [
    {
      "skill": "JavaScript",
      "level": 7,
      "confidence": 85,
      "evidenceCount": 12,
      "lastDemonstrated": "2024-01-15",
      "growthTrend": "IMPROVING"
    }
  ],
  "softSkills": [
    {
      "skill": "Communication",
      "level": 6,
      "confidence": 75,
      "evidenceCount": 8,
      "lastDemonstrated": "2024-01-10",
      "growthTrend": "STABLE"
    }
  ],
  "categoryExpertise": [
    {
      "category": "FREELANCE",
      "level": 6,
      "specializations": ["Web Development", "UI Design"],
      "totalExperience": 240,
      "averageQuality": 4.2,
      "growthRate": 150
    }
  ],
  "emergingSkills": ["React", "Node.js"],
  "skillGaps": ["Advanced Database Design", "Project Management"],
  "overallLevel": 6
}

Base assessments on actual performance data and demonstrated competencies.
`;
    }

    private buildCareerInsightsPrompt(
        user: User,
        userStats: UserStats,
        workHistory: WorkHistoryItem[],
        skillProfile: SkillProfile
    ): string {
        return `
Generate career insights and strategic recommendations for this user.

USER DATA:
Username: ${user.username}
Level: ${userStats.currentLevel}
Overall Skill Level: ${skillProfile.overallLevel}

SKILL PROFILE SUMMARY:
Technical Skills: ${skillProfile.technicalSkills.map(s => `${s.skill} (${s.level}/10)`).join(', ')}
Soft Skills: ${skillProfile.softSkills.map(s => `${s.skill} (${s.level}/10)`).join(', ')}
Category Expertise: ${skillProfile.categoryExpertise.map(c => `${c.category} (${c.level}/10)`).join(', ')}
Emerging Skills: ${skillProfile.emergingSkills.join(', ')}
Skill Gaps: ${skillProfile.skillGaps.join(', ')}

WORK PERFORMANCE:
Total Tasks: ${workHistory.length}
Average Quality: ${workHistory.length > 0 ? workHistory.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / workHistory.length : 0}/5
Consistency: ${this.calculateConsistency(workHistory)}

CAREER ANALYSIS REQUIREMENTS:
1. Identify strongest categories for focus
2. Recommend primary career direction
3. Create skill development roadmap
4. Assess market positioning and value
5. Provide strategic career guidance

Consider growth potential, market demand, and user's demonstrated strengths.

Respond in JSON format:
{
  "strongestCategories": ["FREELANCE", "COMMUNITY"],
  "recommendedFocus": "FREELANCE",
  "skillDevelopmentPlan": [
    {
      "skill": "Advanced JavaScript",
      "currentLevel": 6,
      "targetLevel": 8,
      "estimatedTimeToAchieve": 12,
      "recommendedTasks": ["Build complex web applications", "Contribute to open source"],
      "learningResources": ["Advanced JS courses", "Code review participation"]
    }
  ],
  "careerTrajectory": "Strong potential for senior freelance developer role with community involvement",
  "marketValue": 75
}

Provide actionable, specific recommendations based on data analysis.
`;
    }

    private buildSkillGapPrompt(
        userStats: UserStats,
        workHistory: WorkHistoryItem[],
        targetCategory?: WorkCategory
    ): string {
        return `
Analyze skill gaps and create development recommendations.

USER PERFORMANCE:
Level: ${userStats.currentLevel}
Trust Score: ${userStats.trustScore}
${targetCategory ? `Target Category: ${targetCategory}` : 'General skill development'}

CATEGORY STATS:
Freelance: ${userStats.categoryStats.freelance.tasksCompleted} tasks, specializations: ${userStats.categoryStats.freelance.specializations.join(', ')}
Community: ${userStats.categoryStats.community.tasksCompleted} tasks, specializations: ${userStats.categoryStats.community.specializations.join(', ')}
Corporate: ${userStats.categoryStats.corporate.tasksCompleted} tasks, specializations: ${userStats.categoryStats.corporate.specializations.join(', ')}

RECENT WORK HISTORY:
${workHistory.slice(-10).map(item => `
- Task ID: ${item.taskId} (${item.category}) - Quality: ${item.qualityScore || 'Not rated'}/5
`).join('\n')}

GAP ANALYSIS REQUIREMENTS:
1. Identify missing skills limiting opportunities
2. Prioritize skills by impact and achievability
3. Create step-by-step development plan
4. Estimate realistic timelines
5. Suggest specific learning approaches

${targetCategory ? `Focus on skills needed for ${targetCategory} category advancement.` : 'Consider all categories for comprehensive development.'}

Respond in JSON format:
{
  "identifiedGaps": ["Advanced Database Design", "Leadership Skills"],
  "prioritySkills": ["Database Design", "API Development"],
  "developmentPlan": [
    {
      "skill": "Database Design",
      "currentLevel": 3,
      "targetLevel": 6,
      "estimatedTimeToAchieve": 8,
      "recommendedTasks": ["Database optimization projects", "Schema design tasks"],
      "learningResources": ["Database design courses", "Practice with real projects"]
    }
  ],
  "estimatedTimeToImprove": 16
}

Prioritize high-impact skills that unlock new opportunities.
`;
    }

    private parseSkillProfileResponse(text: string): SkillProfile {
        try {
            const parsed = JSON.parse(text);
            return {
                technicalSkills: Array.isArray(parsed.technicalSkills) 
                    ? parsed.technicalSkills.map(this.validateSkillAssessment)
                    : [],
                softSkills: Array.isArray(parsed.softSkills)
                    ? parsed.softSkills.map(this.validateSkillAssessment)
                    : [],
                categoryExpertise: Array.isArray(parsed.categoryExpertise)
                    ? parsed.categoryExpertise.map(this.validateCategoryExpertise)
                    : [],
                emergingSkills: Array.isArray(parsed.emergingSkills) ? parsed.emergingSkills : [],
                skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : [],
                overallLevel: Math.max(1, Math.min(10, parsed.overallLevel || 1))
            };
        } catch (error) {
            console.error('Failed to parse skill profile response:', error);
            return this.fallbackSkillProfile({} as UserStats, []);
        }
    }

    private parseCareerInsightsResponse(text: string): CareerInsights {
        try {
            const parsed = JSON.parse(text);
            return {
                strongestCategories: Array.isArray(parsed.strongestCategories) 
                    ? parsed.strongestCategories.filter((c: string) => ['FREELANCE', 'COMMUNITY', 'CORPORATE'].includes(c))
                    : [],
                recommendedFocus: ['FREELANCE', 'COMMUNITY', 'CORPORATE'].includes(parsed.recommendedFocus)
                    ? parsed.recommendedFocus
                    : 'COMMUNITY',
                skillDevelopmentPlan: Array.isArray(parsed.skillDevelopmentPlan)
                    ? parsed.skillDevelopmentPlan.map(this.validateSkillDevelopmentStep)
                    : [],
                careerTrajectory: parsed.careerTrajectory || 'Continue developing skills across all categories',
                marketValue: Math.max(0, Math.min(100, parsed.marketValue || 50))
            };
        } catch (error) {
            console.error('Failed to parse career insights response:', error);
            return this.fallbackCareerInsights({} as UserStats, {} as SkillProfile);
        }
    }

    private parseSkillGapResponse(text: string) {
        try {
            const parsed = JSON.parse(text);
            return {
                identifiedGaps: Array.isArray(parsed.identifiedGaps) ? parsed.identifiedGaps : [],
                prioritySkills: Array.isArray(parsed.prioritySkills) ? parsed.prioritySkills : [],
                developmentPlan: Array.isArray(parsed.developmentPlan)
                    ? parsed.developmentPlan.map(this.validateSkillDevelopmentStep)
                    : [],
                estimatedTimeToImprove: Math.max(1, parsed.estimatedTimeToImprove || 12)
            };
        } catch (error) {
            console.error('Failed to parse skill gap response:', error);
            return {
                identifiedGaps: [],
                prioritySkills: [],
                developmentPlan: [],
                estimatedTimeToImprove: 12
            };
        }
    }

    private validateSkillAssessment(skill: any): SkillAssessment {
        return {
            skill: skill.skill || 'Unknown Skill',
            level: Math.max(1, Math.min(10, skill.level || 1)),
            confidence: Math.max(0, Math.min(100, skill.confidence || 50)),
            evidenceCount: Math.max(0, skill.evidenceCount || 0),
            lastDemonstrated: skill.lastDemonstrated ? new Date(skill.lastDemonstrated) : new Date(),
            growthTrend: ['IMPROVING', 'STABLE', 'DECLINING'].includes(skill.growthTrend) 
                ? skill.growthTrend 
                : 'STABLE'
        };
    }

    private validateCategoryExpertise(category: any): CategoryExpertise {
        return {
            category: ['FREELANCE', 'COMMUNITY', 'CORPORATE'].includes(category.category)
                ? category.category
                : 'COMMUNITY',
            level: Math.max(1, Math.min(10, category.level || 1)),
            specializations: Array.isArray(category.specializations) ? category.specializations : [],
            totalExperience: Math.max(0, category.totalExperience || 0),
            averageQuality: Math.max(1, Math.min(5, category.averageQuality || 3)),
            growthRate: Math.max(0, category.growthRate || 0)
        };
    }

    private validateSkillDevelopmentStep(step: any): SkillDevelopmentStep {
        return {
            skill: step.skill || 'Unknown Skill',
            currentLevel: Math.max(1, Math.min(10, step.currentLevel || 1)),
            targetLevel: Math.max(1, Math.min(10, step.targetLevel || 5)),
            estimatedTimeToAchieve: Math.max(1, step.estimatedTimeToAchieve || 8),
            recommendedTasks: Array.isArray(step.recommendedTasks) ? step.recommendedTasks : [],
            learningResources: Array.isArray(step.learningResources) ? step.learningResources : []
        };
    }

    private fallbackSkillProfile(userStats: UserStats, workHistory: WorkHistoryItem[]): SkillProfile {
        return {
            technicalSkills: [],
            softSkills: [
                {
                    skill: 'Communication',
                    level: 5,
                    confidence: 70,
                    evidenceCount: workHistory.length,
                    lastDemonstrated: new Date(),
                    growthTrend: 'STABLE'
                }
            ],
            categoryExpertise: [],
            emergingSkills: [],
            skillGaps: ['AI analysis unavailable'],
            overallLevel: Math.max(1, Math.min(10, userStats.currentLevel || 1))
        };
    }

    private fallbackCareerInsights(userStats: UserStats, skillProfile: SkillProfile): CareerInsights {
        return {
            strongestCategories: ['COMMUNITY'],
            recommendedFocus: 'COMMUNITY',
            skillDevelopmentPlan: [],
            careerTrajectory: 'Continue building experience across all categories',
            marketValue: 50
        };
    }

    private calculateConsistency(workHistory: WorkHistoryItem[]): string {
        if (workHistory.length < 3) return 'Insufficient data';
        
        const scores = workHistory.map(item => item.qualityScore || 0).filter(score => score > 0);
        if (scores.length === 0) return 'No quality scores available';
        
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
        
        if (variance < 0.5) return 'Very Consistent';
        if (variance < 1.0) return 'Consistent';
        if (variance < 2.0) return 'Moderately Consistent';
        return 'Inconsistent';
    }
}