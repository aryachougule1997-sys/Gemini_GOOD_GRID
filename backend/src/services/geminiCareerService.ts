import { GoogleGenerativeAI } from '@google/generative-ai';
import { User, UserStats, WorkHistoryItem, WorkCategory } from '../../../shared/types';

export interface ResumeData {
  personalInfo: PersonalInfo;
  professionalSummary: string;
  workExperience: WorkExperienceItem[];
  skills: SkillSection;
  achievements: AchievementItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  volunteerWork: VolunteerWorkItem[];
  projects: ProjectItem[];
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  location: string;
  linkedIn?: string;
  portfolio?: string;
  trustScore: number;
  rwisScore: number;
}

export interface WorkExperienceItem {
  title: string;
  organization: string;
  category: WorkCategory;
  duration: string;
  description: string[];
  achievements: string[];
  skillsUsed: string[];
  impactMetrics: string[];
}

export interface SkillSection {
  technical: SkillItem[];
  soft: SkillItem[];
  languages: SkillItem[];
  tools: SkillItem[];
}

export interface SkillItem {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience: number;
  endorsements: number;
}

export interface AchievementItem {
  title: string;
  description: string;
  date: Date;
  category: string;
  impactScore: number;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date: Date;
  verificationUrl?: string;
  skills: string[];
}

export interface VolunteerWorkItem {
  organization: string;
  role: string;
  duration: string;
  description: string;
  impact: string;
  skillsGained: string[];
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string[];
  duration: string;
  outcomes: string[];
  category: WorkCategory;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  graduationDate?: Date;
  gpa?: number;
  relevantCoursework: string[];
}

export interface JobRecommendation {
  title: string;
  company: string;
  location: string;
  salaryRange?: string;
  matchScore: number; // 0-100
  reasoning: string;
  requiredSkills: string[];
  matchingSkills: string[];
  skillGaps: string[];
  experienceLevel: string;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE';
  category: WorkCategory;
  applicationDeadline?: Date;
  jobUrl?: string;
  companyDescription: string;
  growthOpportunities: string[];
}

export interface CareerPathRecommendation {
  pathName: string;
  description: string;
  timeframe: string; // "6 months", "1-2 years", etc.
  currentFitScore: number; // 0-100
  steps: CareerStep[];
  requiredSkills: string[];
  salaryProgression: SalaryRange[];
  jobTitles: string[];
  industries: string[];
}

export interface CareerStep {
  stepNumber: number;
  title: string;
  description: string;
  duration: string;
  requiredActions: string[];
  skillsToGain: string[];
  recommendedTasks: string[];
  milestones: string[];
}

export interface SalaryRange {
  level: string;
  minSalary: number;
  maxSalary: number;
  currency: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'TECHNICAL' | 'CREATIVE' | 'BUSINESS' | 'ACADEMIC' | 'GENERAL';
  format: 'PDF' | 'HTML' | 'DOCX';
  sections: string[];
  designStyle: 'MODERN' | 'CLASSIC' | 'CREATIVE' | 'MINIMAL';
}

export class GeminiCareerService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * Generate a comprehensive resume from user's Good Grid profile
     */
    async generateResume(
        user: User,
        userStats: UserStats,
        workHistory: WorkHistoryItem[],
        template: ResumeTemplate,
        additionalInfo?: Partial<PersonalInfo>
    ): Promise<ResumeData> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildResumeGenerationPrompt(
                user, userStats, workHistory, template, additionalInfo
            );
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            return this.parseResumeResponse(text, user, userStats);
        } catch (error) {
            console.error('Resume generation error:', error);
            return this.fallbackResumeGeneration(user, userStats, workHistory);
        }
    }

    /**
     * Get AI-powered job recommendations based on user profile
     */
    async getJobRecommendations(
        user: User,
        userStats: UserStats,
        workHistory: WorkHistoryItem[],
        preferences: {
            jobTypes: string[];
            locations: string[];
            salaryRange?: { min: number; max: number };
            remoteWork: boolean;
            categories: WorkCategory[];
        },
        limit: number = 10
    ): Promise<JobRecommendation[]> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildJobRecommendationPrompt(
                user, userStats, workHistory, preferences, limit
            );
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            return this.parseJobRecommendations(text);
        } catch (error) {
            console.error('Job recommendation error:', error);
            return this.fallbackJobRecommendations(userStats, preferences);
        }
    }

    /**
     * Generate career path recommendations
     */
    async getCareerPathRecommendations(
        user: User,
        userStats: UserStats,
        workHistory: WorkHistoryItem[],
        targetIndustries?: string[],
        timeframe?: string
    ): Promise<CareerPathRecommendation[]> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildCareerPathPrompt(
                user, userStats, workHistory, targetIndustries, timeframe
            );
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            return this.parseCareerPathRecommendations(text);
        } catch (error) {
            console.error('Career path recommendation error:', error);
            return this.fallbackCareerPaths(userStats);
        }
    }

    /**
     * Generate professional summary for LinkedIn/resume
     */
    async generateProfessionalSummary(
        user: User,
        userStats: UserStats,
        workHistory: WorkHistoryItem[],
        targetAudience: 'RECRUITERS' | 'CLIENTS' | 'GENERAL' = 'GENERAL'
    ): Promise<string> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildProfessionalSummaryPrompt(
                user, userStats, workHistory, targetAudience
            );
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            return this.parseProfessionalSummary(text);
        } catch (error) {
            console.error('Professional summary generation error:', error);
            return this.fallbackProfessionalSummary(userStats, workHistory);
        }
    }

    /**
     * Analyze skill gaps for target job positions
     */
    async analyzeSkillGapsForJob(
        userStats: UserStats,
        workHistory: WorkHistoryItem[],
        targetJobTitle: string,
        targetCompany?: string
    ): Promise<{
        matchingSkills: string[];
        skillGaps: string[];
        developmentPlan: string[];
        timeToReadiness: string;
        recommendedTasks: string[];
        confidenceScore: number;
    }> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildSkillGapAnalysisPrompt(
                userStats, workHistory, targetJobTitle, targetCompany
            );
            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            return this.parseSkillGapAnalysis(text);
        } catch (error) {
            console.error('Skill gap analysis error:', error);
            return {
                matchingSkills: [],
                skillGaps: ['Analysis unavailable'],
                developmentPlan: ['Continue building experience'],
                timeToReadiness: '6-12 months',
                recommendedTasks: [],
                confidenceScore: 50
            };
        }
    }

    private buildResumeGenerationPrompt(
        user: User,
        userStats: UserStats,
        workHistory: WorkHistoryItem[],
        template: ResumeTemplate,
        additionalInfo?: Partial<PersonalInfo>
    ): string {
        return `
You are an expert resume writer and career counselor. Generate a professional resume based on this user's Good Grid profile.

USER PROFILE:
Username: ${user.username}
Email: ${user.email}
Trust Score: ${userStats.trustScore}
RWIS Score: ${userStats.rwisScore}
Current Level: ${userStats.currentLevel}
Total XP: ${userStats.xpPoints}

WORK HISTORY:
${workHistory.map(item => `
- Task ID: ${item.taskId} (${item.category})
- Quality Score: ${item.qualityScore || 'Not rated'}/5
- XP Earned: ${item.xpEarned}
- Trust Score Change: ${item.trustScoreChange}
- RWIS Earned: ${item.rwisEarned}
- Completion Date: ${item.completionDate || 'Not completed'}
`).join('\n')}

CATEGORY PERFORMANCE:
Freelance: ${userStats.categoryStats.freelance.tasksCompleted} tasks, ${userStats.categoryStats.freelance.totalXP} XP, ${userStats.categoryStats.freelance.averageRating}/5 rating
Community: ${userStats.categoryStats.community.tasksCompleted} tasks, ${userStats.categoryStats.community.totalXP} XP, ${userStats.categoryStats.community.averageRating}/5 rating
Corporate: ${userStats.categoryStats.corporate.tasksCompleted} tasks, ${userStats.categoryStats.corporate.totalXP} XP, ${userStats.categoryStats.corporate.averageRating}/5 rating

TEMPLATE REQUIREMENTS:
Template: ${template.name}
Category: ${template.category}
Style: ${template.designStyle}
Sections: ${template.sections.join(', ')}

ADDITIONAL INFO:
${additionalInfo ? JSON.stringify(additionalInfo) : 'None provided'}

RESUME GENERATION INSTRUCTIONS:
1. Create a professional summary highlighting key achievements
2. Transform Good Grid work into professional experience entries
3. Extract and categorize skills from work history
4. Convert badges and achievements into professional accomplishments
5. Quantify impact using Trust Score, RWIS, and project outcomes
6. Use professional language while maintaining authenticity
7. Tailor content to the template category and style

Respond in JSON format:
{
  "personalInfo": {
    "fullName": "User Name",
    "email": "user@email.com",
    "location": "City, State",
    "trustScore": ${userStats.trustScore},
    "rwisScore": ${userStats.rwisScore}
  },
  "professionalSummary": "Compelling 2-3 sentence summary",
  "workExperience": [
    {
      "title": "Role Title",
      "organization": "Organization Name",
      "category": "FREELANCE",
      "duration": "Jan 2024 - Present",
      "description": ["Key responsibility 1", "Key responsibility 2"],
      "achievements": ["Achievement 1", "Achievement 2"],
      "skillsUsed": ["Skill1", "Skill2"],
      "impactMetrics": ["Metric 1", "Metric 2"]
    }
  ],
  "skills": {
    "technical": [{"name": "JavaScript", "level": "Advanced", "yearsOfExperience": 2, "endorsements": 5}],
    "soft": [{"name": "Leadership", "level": "Intermediate", "yearsOfExperience": 1, "endorsements": 3}],
    "languages": [],
    "tools": []
  },
  "achievements": [
    {
      "title": "Achievement Title",
      "description": "Description",
      "date": "2024-01-15",
      "category": "Professional",
      "impactScore": 85
    }
  ],
  "certifications": [],
  "volunteerWork": [],
  "projects": []
}

Focus on professional presentation while accurately representing the user's Good Grid achievements.
`;
    }

    private buildJobRecommendationPrompt(
        user: User,
        userStats: UserStats,
        workHistory: WorkHistoryItem[],
        preferences: any,
        limit: number
    ): string {
        return `
You are an AI career advisor and job matching expert. Recommend suitable job opportunities based on this user's profile.

USER PROFILE:
Trust Score: ${userStats.trustScore}
RWIS Score: ${userStats.rwisScore}
Current Level: ${userStats.currentLevel}
Total Experience: ${workHistory.length} completed tasks

CATEGORY EXPERIENCE:
Freelance: ${userStats.categoryStats.freelance.tasksCompleted} tasks, ${userStats.categoryStats.freelance.averageRating}/5 rating
Community: ${userStats.categoryStats.community.tasksCompleted} tasks, ${userStats.categoryStats.community.averageRating}/5 rating
Corporate: ${userStats.categoryStats.corporate.tasksCompleted} tasks, ${userStats.categoryStats.corporate.averageRating}/5 rating

SPECIALIZATIONS:
Freelance: ${userStats.categoryStats.freelance.specializations.join(', ')}
Community: ${userStats.categoryStats.community.specializations.join(', ')}
Corporate: ${userStats.categoryStats.corporate.specializations.join(', ')}

JOB PREFERENCES:
Job Types: ${preferences.jobTypes.join(', ')}
Locations: ${preferences.locations.join(', ')}
Remote Work: ${preferences.remoteWork ? 'Yes' : 'No'}
Categories: ${preferences.categories.join(', ')}
${preferences.salaryRange ? `Salary Range: $${preferences.salaryRange.min} - $${preferences.salaryRange.max}` : ''}

WORK HISTORY ANALYSIS:
${workHistory.slice(-5).map(item => `
- Category: ${item.category}, Quality: ${item.qualityScore}/5, XP: ${item.xpEarned}
`).join('\n')}

JOB RECOMMENDATION REQUIREMENTS:
1. Match jobs to user's demonstrated skills and experience
2. Consider trust score for responsibility level
3. Factor in category preferences and specializations
4. Provide realistic salary expectations
5. Include growth opportunities
6. Explain match reasoning clearly
7. Identify skill gaps and development needs

Respond with ${limit} job recommendations in JSON format:
[
  {
    "title": "Software Developer",
    "company": "Tech Company Inc",
    "location": "San Francisco, CA",
    "salaryRange": "$70,000 - $90,000",
    "matchScore": 85,
    "reasoning": "Strong match based on technical skills and project experience",
    "requiredSkills": ["JavaScript", "React", "Node.js"],
    "matchingSkills": ["JavaScript", "React"],
    "skillGaps": ["Node.js", "Advanced Testing"],
    "experienceLevel": "Mid-level",
    "jobType": "FULL_TIME",
    "category": "FREELANCE",
    "companyDescription": "Growing tech startup focused on web applications",
    "growthOpportunities": ["Senior Developer", "Tech Lead", "Engineering Manager"]
  }
]

Prioritize realistic, achievable opportunities that align with the user's Good Grid experience.
`;
    }

    private buildCareerPathPrompt(
        user: User,
        userStats: UserStats,
        workHistory: WorkHistoryItem[],
        targetIndustries?: string[],
        timeframe?: string
    ): string {
        return `
You are a career strategist. Create detailed career path recommendations based on this user's Good Grid profile.

USER PROFILE:
Current Level: ${userStats.currentLevel}
Trust Score: ${userStats.trustScore}
RWIS Score: ${userStats.rwisScore}
Total Tasks: ${workHistory.length}

EXPERIENCE BREAKDOWN:
Freelance: ${userStats.categoryStats.freelance.tasksCompleted} tasks, specializations: ${userStats.categoryStats.freelance.specializations.join(', ')}
Community: ${userStats.categoryStats.community.tasksCompleted} tasks, specializations: ${userStats.categoryStats.community.specializations.join(', ')}
Corporate: ${userStats.categoryStats.corporate.tasksCompleted} tasks, specializations: ${userStats.categoryStats.corporate.specializations.join(', ')}

${targetIndustries ? `TARGET INDUSTRIES: ${targetIndustries.join(', ')}` : ''}
${timeframe ? `TIMEFRAME: ${timeframe}` : 'TIMEFRAME: 2-3 years'}

CAREER PATH REQUIREMENTS:
1. Build on existing strengths and experience
2. Provide realistic progression timelines
3. Include specific skill development steps
4. Suggest Good Grid tasks to support growth
5. Consider salary progression
6. Account for different career trajectories

Create 3-5 career path recommendations in JSON format:
[
  {
    "pathName": "Full-Stack Developer",
    "description": "Progression from current skills to senior development role",
    "timeframe": "18-24 months",
    "currentFitScore": 75,
    "steps": [
      {
        "stepNumber": 1,
        "title": "Strengthen Frontend Skills",
        "description": "Build advanced React and JavaScript expertise",
        "duration": "3-6 months",
        "requiredActions": ["Complete advanced React projects", "Learn TypeScript"],
        "skillsToGain": ["TypeScript", "Advanced React", "State Management"],
        "recommendedTasks": ["Build complex web applications", "Contribute to open source"],
        "milestones": ["Complete 5 React projects", "Earn TypeScript certification"]
      }
    ],
    "requiredSkills": ["JavaScript", "React", "Node.js", "Databases"],
    "salaryProgression": [
      {"level": "Junior", "minSalary": 50000, "maxSalary": 70000, "currency": "USD"},
      {"level": "Mid-level", "minSalary": 70000, "maxSalary": 95000, "currency": "USD"}
    ],
    "jobTitles": ["Junior Developer", "Frontend Developer", "Full-Stack Developer"],
    "industries": ["Technology", "Startups", "E-commerce"]
  }
]

Focus on actionable, realistic paths that leverage the user's Good Grid achievements.
`;
    }

    private buildProfessionalSummaryPrompt(
        user: User,
        userStats: UserStats,
        workHistory: WorkHistoryItem[],
        targetAudience: string
    ): string {
        return `
Create a compelling professional summary for ${targetAudience.toLowerCase()} based on this Good Grid profile.

USER ACHIEVEMENTS:
Trust Score: ${userStats.trustScore} (reliability indicator)
RWIS Score: ${userStats.rwisScore} (real-world impact)
Level: ${userStats.currentLevel}
Total Projects: ${workHistory.length}

CATEGORY PERFORMANCE:
Freelance: ${userStats.categoryStats.freelance.tasksCompleted} projects, ${userStats.categoryStats.freelance.averageRating}/5 rating
Community: ${userStats.categoryStats.community.tasksCompleted} projects, ${userStats.categoryStats.community.averageRating}/5 rating
Corporate: ${userStats.categoryStats.corporate.tasksCompleted} projects, ${userStats.categoryStats.corporate.averageRating}/5 rating

SPECIALIZATIONS:
${Object.values(userStats.categoryStats).flatMap(cat => cat.specializations).join(', ')}

TARGET AUDIENCE: ${targetAudience}

SUMMARY REQUIREMENTS:
- 2-3 compelling sentences
- Highlight key strengths and achievements
- Include quantifiable impact metrics
- Use professional language
- Tailor tone for ${targetAudience}
- Emphasize reliability (Trust Score) and impact (RWIS)

Generate a professional summary that converts Good Grid achievements into career value.
`;
    }

    private buildSkillGapAnalysisPrompt(
        userStats: UserStats,
        workHistory: WorkHistoryItem[],
        targetJobTitle: string,
        targetCompany?: string
    ): string {
        return `
Analyze skill gaps for this target position based on the user's Good Grid profile.

USER PROFILE:
Trust Score: ${userStats.trustScore}
Current Level: ${userStats.currentLevel}
Experience: ${workHistory.length} completed tasks

CATEGORY EXPERIENCE:
Freelance: ${userStats.categoryStats.freelance.tasksCompleted} tasks, specializations: ${userStats.categoryStats.freelance.specializations.join(', ')}
Community: ${userStats.categoryStats.community.tasksCompleted} tasks, specializations: ${userStats.categoryStats.community.specializations.join(', ')}
Corporate: ${userStats.categoryStats.corporate.tasksCompleted} tasks, specializations: ${userStats.categoryStats.corporate.specializations.join(', ')}

TARGET POSITION:
Job Title: ${targetJobTitle}
${targetCompany ? `Company: ${targetCompany}` : ''}

ANALYSIS REQUIREMENTS:
1. Identify skills the user already has
2. Determine missing skills for the target role
3. Create a development plan with timelines
4. Suggest specific Good Grid tasks to build missing skills
5. Estimate time to job readiness
6. Provide confidence score for success

Respond in JSON format:
{
  "matchingSkills": ["skill1", "skill2"],
  "skillGaps": ["missing_skill1", "missing_skill2"],
  "developmentPlan": ["Step 1: Learn X", "Step 2: Practice Y"],
  "timeToReadiness": "6-9 months",
  "recommendedTasks": ["Complete React projects", "Build portfolio"],
  "confidenceScore": 75
}

Be realistic and actionable in your recommendations.
`;
    }

    private parseResumeResponse(text: string, user: User, userStats: UserStats): ResumeData {
        try {
            const parsed = JSON.parse(text);
            return {
                personalInfo: {
                    fullName: parsed.personalInfo?.fullName || user.username,
                    email: parsed.personalInfo?.email || user.email,
                    phone: parsed.personalInfo?.phone,
                    location: parsed.personalInfo?.location || 'Location not specified',
                    linkedIn: parsed.personalInfo?.linkedIn,
                    portfolio: parsed.personalInfo?.portfolio,
                    trustScore: userStats.trustScore,
                    rwisScore: userStats.rwisScore
                },
                professionalSummary: parsed.professionalSummary || 'Experienced professional with strong track record of delivering results.',
                workExperience: Array.isArray(parsed.workExperience) ? parsed.workExperience : [],
                skills: parsed.skills || { technical: [], soft: [], languages: [], tools: [] },
                achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
                education: Array.isArray(parsed.education) ? parsed.education : [],
                certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
                volunteerWork: Array.isArray(parsed.volunteerWork) ? parsed.volunteerWork : [],
                projects: Array.isArray(parsed.projects) ? parsed.projects : []
            };
        } catch (error) {
            console.error('Failed to parse resume response:', error);
            return this.fallbackResumeGeneration(user, userStats, []);
        }
    }

    private parseJobRecommendations(text: string): JobRecommendation[] {
        try {
            const parsed = JSON.parse(text);
            if (!Array.isArray(parsed)) return [];
            
            return parsed.map(job => ({
                title: job.title || 'Position Available',
                company: job.company || 'Company',
                location: job.location || 'Location TBD',
                salaryRange: job.salaryRange,
                matchScore: Math.max(0, Math.min(100, job.matchScore || 50)),
                reasoning: job.reasoning || 'Good potential match',
                requiredSkills: Array.isArray(job.requiredSkills) ? job.requiredSkills : [],
                matchingSkills: Array.isArray(job.matchingSkills) ? job.matchingSkills : [],
                skillGaps: Array.isArray(job.skillGaps) ? job.skillGaps : [],
                experienceLevel: job.experienceLevel || 'Entry-level',
                jobType: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE'].includes(job.jobType) 
                    ? job.jobType 
                    : 'FULL_TIME',
                category: ['FREELANCE', 'COMMUNITY', 'CORPORATE'].includes(job.category) 
                    ? job.category 
                    : 'CORPORATE',
                applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline) : undefined,
                jobUrl: job.jobUrl,
                companyDescription: job.companyDescription || 'Growing company with opportunities for advancement',
                growthOpportunities: Array.isArray(job.growthOpportunities) ? job.growthOpportunities : []
            }));
        } catch (error) {
            console.error('Failed to parse job recommendations:', error);
            return [];
        }
    }

    private parseCareerPathRecommendations(text: string): CareerPathRecommendation[] {
        try {
            const parsed = JSON.parse(text);
            if (!Array.isArray(parsed)) return [];
            
            return parsed.map(path => ({
                pathName: path.pathName || 'Career Path',
                description: path.description || 'Professional development opportunity',
                timeframe: path.timeframe || '1-2 years',
                currentFitScore: Math.max(0, Math.min(100, path.currentFitScore || 50)),
                steps: Array.isArray(path.steps) ? path.steps : [],
                requiredSkills: Array.isArray(path.requiredSkills) ? path.requiredSkills : [],
                salaryProgression: Array.isArray(path.salaryProgression) ? path.salaryProgression : [],
                jobTitles: Array.isArray(path.jobTitles) ? path.jobTitles : [],
                industries: Array.isArray(path.industries) ? path.industries : []
            }));
        } catch (error) {
            console.error('Failed to parse career path recommendations:', error);
            return [];
        }
    }

    private parseProfessionalSummary(text: string): string {
        // Extract the summary from the response, handling various formats
        const cleanText = text.replace(/```|json|JSON/g, '').trim();
        
        try {
            const parsed = JSON.parse(cleanText);
            return parsed.summary || parsed.professionalSummary || cleanText;
        } catch {
            return cleanText || 'Experienced professional with a strong track record of delivering results and making meaningful contributions.';
        }
    }

    private parseSkillGapAnalysis(text: string) {
        try {
            const parsed = JSON.parse(text);
            return {
                matchingSkills: Array.isArray(parsed.matchingSkills) ? parsed.matchingSkills : [],
                skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : [],
                developmentPlan: Array.isArray(parsed.developmentPlan) ? parsed.developmentPlan : [],
                timeToReadiness: parsed.timeToReadiness || '6-12 months',
                recommendedTasks: Array.isArray(parsed.recommendedTasks) ? parsed.recommendedTasks : [],
                confidenceScore: Math.max(0, Math.min(100, parsed.confidenceScore || 50))
            };
        } catch (error) {
            console.error('Failed to parse skill gap analysis:', error);
            return {
                matchingSkills: [],
                skillGaps: ['Analysis unavailable'],
                developmentPlan: ['Continue building experience'],
                timeToReadiness: '6-12 months',
                recommendedTasks: [],
                confidenceScore: 50
            };
        }
    }

    private fallbackResumeGeneration(user: User, userStats: UserStats, workHistory: WorkHistoryItem[]): ResumeData {
        return {
            personalInfo: {
                fullName: user.username,
                email: user.email,
                location: 'Location not specified',
                trustScore: userStats.trustScore,
                rwisScore: userStats.rwisScore
            },
            professionalSummary: `Dedicated professional with ${userStats.currentLevel} levels of experience and a trust score of ${userStats.trustScore}. Proven track record of delivering quality work across multiple categories.`,
            workExperience: [],
            skills: { technical: [], soft: [], languages: [], tools: [] },
            achievements: [],
            education: [],
            certifications: [],
            volunteerWork: [],
            projects: []
        };
    }

    private fallbackJobRecommendations(userStats: UserStats, preferences: any): JobRecommendation[] {
        const strongestCategory = this.getStrongestCategory(userStats);
        
        return [{
            title: 'Entry Level Position',
            company: 'Growing Company',
            location: preferences.locations[0] || 'Remote',
            matchScore: 60,
            reasoning: 'Good fit based on your experience level and category focus',
            requiredSkills: [],
            matchingSkills: [],
            skillGaps: [],
            experienceLevel: 'Entry-level',
            jobType: 'FULL_TIME',
            category: strongestCategory,
            companyDescription: 'Company focused on growth and development',
            growthOpportunities: ['Senior Role', 'Team Lead']
        }];
    }

    private fallbackCareerPaths(userStats: UserStats): CareerPathRecommendation[] {
        return [{
            pathName: 'Professional Development',
            description: 'Continue building experience and skills',
            timeframe: '1-2 years',
            currentFitScore: 70,
            steps: [],
            requiredSkills: [],
            salaryProgression: [],
            jobTitles: [],
            industries: []
        }];
    }

    private fallbackProfessionalSummary(userStats: UserStats, workHistory: WorkHistoryItem[]): string {
        return `Experienced professional with ${userStats.currentLevel} levels of achievement and ${workHistory.length} completed projects. Strong track record of reliability with a trust score of ${userStats.trustScore} and significant real-world impact.`;
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