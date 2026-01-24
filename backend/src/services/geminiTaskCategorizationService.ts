import { GoogleGenerativeAI } from '@google/generative-ai';
import { Task, WorkCategory, DifficultyLevel, TaskRequirements, TaskRewards } from '../../../shared/types';

export interface TaskCategorization {
  category: WorkCategory;
  confidence: number; // 0-100
  reasoning: string;
  suggestedSkills: string[];
  estimatedDifficulty: DifficultyLevel;
  timeEstimate: number; // in hours
  impactScore: number; // RWIS potential 0-100
}

export interface TaskAnalysis {
  categorization: TaskCategorization;
  suggestedRequirements: TaskRequirements;
  suggestedRewards: TaskRewards;
  qualityScore: number; // 0-100 how well-defined the task is
  improvementSuggestions: string[];
}

export class GeminiTaskCategorizationService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * Categorize a task into one of the three work categories
     */
    async categorizeTask(
        title: string,
        description: string,
        organizationContext?: string
    ): Promise<TaskCategorization> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildCategorizationPrompt(title, description, organizationContext);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseCategorizationResponse(text);
        } catch (error) {
            console.error('Task categorization error:', error);
            
            // Fallback categorization
            return this.fallbackCategorization(title, description);
        }
    }

    /**
     * Perform comprehensive task analysis including categorization and suggestions
     */
    async analyzeTask(
        title: string,
        description: string,
        organizationContext?: string,
        existingRequirements?: Partial<TaskRequirements>
    ): Promise<TaskAnalysis> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildTaskAnalysisPrompt(
                title, description, organizationContext, existingRequirements
            );
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseTaskAnalysisResponse(text);
        } catch (error) {
            console.error('Task analysis error:', error);
            
            // Fallback analysis
            const categorization = await this.categorizeTask(title, description, organizationContext);
            return this.fallbackTaskAnalysis(categorization, title, description);
        }
    }

    /**
     * Assess task difficulty based on requirements and description
     */
    async assessTaskDifficulty(
        task: Partial<Task>,
        userSkillLevel?: number
    ): Promise<{
        difficulty: DifficultyLevel;
        confidence: number;
        reasoning: string;
        skillRequirements: string[];
        timeEstimate: number;
        prerequisiteSkills: string[];
    }> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildDifficultyAssessmentPrompt(task, userSkillLevel);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseDifficultyAssessmentResponse(text);
        } catch (error) {
            console.error('Difficulty assessment error:', error);
            
            return {
                difficulty: 'INTERMEDIATE',
                confidence: 50,
                reasoning: 'AI assessment unavailable - default difficulty assigned',
                skillRequirements: [],
                timeEstimate: 4,
                prerequisiteSkills: []
            };
        }
    }

    /**
     * Validate and improve task descriptions
     */
    async validateTaskDescription(
        title: string,
        description: string,
        category: WorkCategory
    ): Promise<{
        isValid: boolean;
        qualityScore: number;
        issues: string[];
        suggestions: string[];
        improvedDescription?: string;
    }> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildValidationPrompt(title, description, category);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseValidationResponse(text);
        } catch (error) {
            console.error('Task validation error:', error);
            
            return {
                isValid: true,
                qualityScore: 70,
                issues: [],
                suggestions: ['AI validation service temporarily unavailable'],
                improvedDescription: undefined
            };
        }
    }

    private buildCategorizationPrompt(
        title: string,
        description: string,
        organizationContext?: string
    ): string {
        return `
You are an AI task categorization system for a gamified work platform with three categories:

1. FREELANCE: Individual client work, skill-based services, creative projects, consulting
2. COMMUNITY: Volunteering, social causes, environmental projects, community service
3. CORPORATE: Structured organizational work, formal business processes, institutional tasks

TASK TO CATEGORIZE:
Title: ${title}
Description: ${description}
${organizationContext ? `Organization Context: ${organizationContext}` : ''}

CATEGORIZATION CRITERIA:
- FREELANCE: Direct client relationships, skill monetization, creative/technical services
- COMMUNITY: Social impact, volunteering, open participation, cause-driven
- CORPORATE: Formal structure, business processes, organizational hierarchy, compliance

ANALYSIS REQUIREMENTS:
1. Determine the primary work category
2. Assess confidence level (0-100)
3. Identify required skills
4. Estimate difficulty level (BEGINNER/INTERMEDIATE/ADVANCED/EXPERT)
5. Estimate time commitment in hours
6. Assess potential real-world impact (RWIS score 0-100)

Respond in JSON format:
{
  "category": "FREELANCE|COMMUNITY|CORPORATE",
  "confidence": 85,
  "reasoning": "Detailed explanation of categorization decision",
  "suggestedSkills": ["skill1", "skill2", "skill3"],
  "estimatedDifficulty": "INTERMEDIATE",
  "timeEstimate": 6,
  "impactScore": 75
}

Consider the nature of work, target audience, and organizational structure.
`;
    }

    private buildTaskAnalysisPrompt(
        title: string,
        description: string,
        organizationContext?: string,
        existingRequirements?: Partial<TaskRequirements>
    ): string {
        return `
Perform comprehensive analysis of this task for a gamified work platform.

TASK DETAILS:
Title: ${title}
Description: ${description}
${organizationContext ? `Organization: ${organizationContext}` : ''}
${existingRequirements ? `Existing Requirements: ${JSON.stringify(existingRequirements)}` : ''}

ANALYSIS FRAMEWORK:
1. Categorize into FREELANCE/COMMUNITY/CORPORATE
2. Assess task quality and completeness
3. Suggest appropriate requirements (skills, trust score, time)
4. Recommend rewards (XP, RWIS, trust score bonus)
5. Identify improvement opportunities

REWARD CALCULATION GUIDELINES:
- XP: 10-20 (simple), 25-50 (moderate), 60-100 (complex), 120+ (expert)
- RWIS: Based on community impact and reach
- Trust Score Bonus: 1-5 for reliable completion
- Payment (Freelance only): Market rate consideration

REQUIREMENTS GUIDELINES:
- Trust Score: 0-25 (beginner), 25-50 (intermediate), 50-100 (advanced), 100+ (expert)
- Skills: Specific, measurable abilities needed
- Time: Realistic estimate including learning curve
- Level: 1-3 (beginner), 4-6 (intermediate), 7-9 (advanced), 10+ (expert)

Respond in JSON format:
{
  "categorization": {
    "category": "COMMUNITY",
    "confidence": 90,
    "reasoning": "Clear community service focus",
    "suggestedSkills": ["communication", "organization"],
    "estimatedDifficulty": "INTERMEDIATE",
    "timeEstimate": 8,
    "impactScore": 85
  },
  "suggestedRequirements": {
    "skills": ["skill1", "skill2"],
    "trustScoreMin": 25,
    "timeCommitment": 8,
    "level": 3
  },
  "suggestedRewards": {
    "xp": 45,
    "trustScoreBonus": 3,
    "rwisPoints": 85,
    "payment": 0
  },
  "qualityScore": 85,
  "improvementSuggestions": ["suggestion1", "suggestion2"]
}

Be specific and actionable in your recommendations.
`;
    }

    private buildDifficultyAssessmentPrompt(
        task: Partial<Task>,
        userSkillLevel?: number
    ): string {
        return `
Assess the difficulty level of this task for our gamified platform.

TASK INFORMATION:
Title: ${task.title}
Description: ${task.description}
Category: ${task.category}
${task.requirements ? `Requirements: ${JSON.stringify(task.requirements)}` : ''}
${userSkillLevel ? `User Skill Level: ${userSkillLevel}/10` : ''}

DIFFICULTY LEVELS:
- BEGINNER: Basic tasks, minimal experience needed, clear instructions
- INTERMEDIATE: Some experience required, moderate complexity
- ADVANCED: Significant expertise needed, complex problem-solving
- EXPERT: Specialized knowledge, high-stakes, innovative solutions

ASSESSMENT CRITERIA:
1. Technical complexity and skill requirements
2. Time investment and learning curve
3. Problem-solving complexity
4. Risk and responsibility level
5. Innovation and creativity required
6. Collaboration and communication needs

${userSkillLevel ? 'Consider if this task is appropriate for the user\'s current skill level.' : ''}

Respond in JSON format:
{
  "difficulty": "INTERMEDIATE",
  "confidence": 85,
  "reasoning": "Requires moderate technical skills and some experience",
  "skillRequirements": ["skill1", "skill2"],
  "timeEstimate": 12,
  "prerequisiteSkills": ["basic_skill1", "basic_skill2"]
}

Be precise in your assessment and explain your reasoning clearly.
`;
    }

    private buildValidationPrompt(
        title: string,
        description: string,
        category: WorkCategory
    ): string {
        return `
Validate and improve this task description for quality and clarity.

TASK:
Title: ${title}
Description: ${description}
Category: ${category}

VALIDATION CRITERIA:
1. Clear and specific objectives
2. Measurable deliverables
3. Appropriate scope for category
4. Realistic expectations
5. Sufficient detail for completion
6. Professional and engaging language

QUALITY SCORING (0-100):
- 90-100: Excellent, ready to publish
- 70-89: Good, minor improvements needed
- 50-69: Adequate, some issues to address
- 30-49: Poor, significant improvements required
- 0-29: Unacceptable, major revision needed

COMMON ISSUES TO CHECK:
- Vague or unclear objectives
- Missing success criteria
- Unrealistic time estimates
- Inappropriate difficulty for category
- Poor grammar or formatting
- Insufficient context or background

Respond in JSON format:
{
  "isValid": true,
  "qualityScore": 78,
  "issues": ["issue1", "issue2"],
  "suggestions": ["improvement1", "improvement2"],
  "improvedDescription": "Optional improved version if score < 70"
}

Provide constructive feedback that helps task creators improve their submissions.
`;
    }

    private parseCategorizationResponse(text: string): TaskCategorization {
        try {
            const parsed = JSON.parse(text);
            return {
                category: ['FREELANCE', 'COMMUNITY', 'CORPORATE'].includes(parsed.category) 
                    ? parsed.category 
                    : 'COMMUNITY',
                confidence: Math.max(0, Math.min(100, parsed.confidence || 50)),
                reasoning: parsed.reasoning || 'No reasoning provided',
                suggestedSkills: Array.isArray(parsed.suggestedSkills) ? parsed.suggestedSkills : [],
                estimatedDifficulty: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(parsed.estimatedDifficulty)
                    ? parsed.estimatedDifficulty
                    : 'INTERMEDIATE',
                timeEstimate: Math.max(1, parsed.timeEstimate || 4),
                impactScore: Math.max(0, Math.min(100, parsed.impactScore || 50))
            };
        } catch (error) {
            console.error('Failed to parse categorization response:', error);
            return this.fallbackCategorization('', '');
        }
    }

    private parseTaskAnalysisResponse(text: string): TaskAnalysis {
        try {
            const parsed = JSON.parse(text);
            return {
                categorization: this.parseCategorizationResponse(JSON.stringify(parsed.categorization)),
                suggestedRequirements: {
                    skills: Array.isArray(parsed.suggestedRequirements?.skills) 
                        ? parsed.suggestedRequirements.skills 
                        : [],
                    trustScoreMin: Math.max(0, parsed.suggestedRequirements?.trustScoreMin || 0),
                    timeCommitment: Math.max(1, parsed.suggestedRequirements?.timeCommitment || 4),
                    level: Math.max(1, Math.min(10, parsed.suggestedRequirements?.level || 1))
                },
                suggestedRewards: {
                    xp: Math.max(10, parsed.suggestedRewards?.xp || 25),
                    trustScoreBonus: Math.max(1, Math.min(10, parsed.suggestedRewards?.trustScoreBonus || 2)),
                    rwisPoints: Math.max(0, Math.min(100, parsed.suggestedRewards?.rwisPoints || 50)),
                    payment: parsed.suggestedRewards?.payment || 0
                },
                qualityScore: Math.max(0, Math.min(100, parsed.qualityScore || 70)),
                improvementSuggestions: Array.isArray(parsed.improvementSuggestions) 
                    ? parsed.improvementSuggestions 
                    : []
            };
        } catch (error) {
            console.error('Failed to parse task analysis response:', error);
            const fallbackCategorization = this.fallbackCategorization('', '');
            return this.fallbackTaskAnalysis(fallbackCategorization, '', '');
        }
    }

    private parseDifficultyAssessmentResponse(text: string) {
        try {
            const parsed = JSON.parse(text);
            return {
                difficulty: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(parsed.difficulty)
                    ? parsed.difficulty
                    : 'INTERMEDIATE',
                confidence: Math.max(0, Math.min(100, parsed.confidence || 50)),
                reasoning: parsed.reasoning || 'No reasoning provided',
                skillRequirements: Array.isArray(parsed.skillRequirements) ? parsed.skillRequirements : [],
                timeEstimate: Math.max(1, parsed.timeEstimate || 4),
                prerequisiteSkills: Array.isArray(parsed.prerequisiteSkills) ? parsed.prerequisiteSkills : []
            };
        } catch (error) {
            console.error('Failed to parse difficulty assessment response:', error);
            return {
                difficulty: 'INTERMEDIATE' as DifficultyLevel,
                confidence: 50,
                reasoning: 'Parsing error - default assessment',
                skillRequirements: [],
                timeEstimate: 4,
                prerequisiteSkills: []
            };
        }
    }

    private parseValidationResponse(text: string) {
        try {
            const parsed = JSON.parse(text);
            return {
                isValid: Boolean(parsed.isValid),
                qualityScore: Math.max(0, Math.min(100, parsed.qualityScore || 70)),
                issues: Array.isArray(parsed.issues) ? parsed.issues : [],
                suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
                improvedDescription: parsed.improvedDescription || undefined
            };
        } catch (error) {
            console.error('Failed to parse validation response:', error);
            return {
                isValid: true,
                qualityScore: 70,
                issues: ['Parsing error'],
                suggestions: ['Please review task description manually'],
                improvedDescription: undefined
            };
        }
    }

    private fallbackCategorization(title: string, description: string): TaskCategorization {
        // Simple keyword-based fallback
        const text = (title + ' ' + description).toLowerCase();
        
        let category: WorkCategory = 'COMMUNITY';
        if (text.includes('freelance') || text.includes('client') || text.includes('design') || text.includes('development')) {
            category = 'FREELANCE';
        } else if (text.includes('corporate') || text.includes('business') || text.includes('company') || text.includes('organization')) {
            category = 'CORPORATE';
        }

        return {
            category,
            confidence: 60,
            reasoning: 'Fallback categorization based on keywords',
            suggestedSkills: [],
            estimatedDifficulty: 'INTERMEDIATE',
            timeEstimate: 4,
            impactScore: 50
        };
    }

    private fallbackTaskAnalysis(
        categorization: TaskCategorization,
        title: string,
        description: string
    ): TaskAnalysis {
        return {
            categorization,
            suggestedRequirements: {
                skills: categorization.suggestedSkills,
                trustScoreMin: categorization.estimatedDifficulty === 'BEGINNER' ? 0 : 25,
                timeCommitment: categorization.timeEstimate,
                level: categorization.estimatedDifficulty === 'BEGINNER' ? 1 : 3
            },
            suggestedRewards: {
                xp: categorization.timeEstimate * 5,
                trustScoreBonus: 2,
                rwisPoints: categorization.impactScore,
                payment: categorization.category === 'FREELANCE' ? 50 : 0
            },
            qualityScore: 70,
            improvementSuggestions: ['AI analysis unavailable - manual review recommended']
        };
    }
}