import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserStats } from '../../../shared/types';

interface ResumeGenerationRequest {
  userId: string;
  userStats: UserStats;
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    summary?: string;
  };
  template: string;
  targetRole?: string;
  targetIndustry?: string;
}

interface ResumeSection {
  title: string;
  content: string;
  order: number;
}

interface GeneratedResume {
  sections: ResumeSection[];
  summary: string;
  skills: string[];
  experience: any[];
  achievements: string[];
  recommendations: string[];
}

export class GeminiResumeService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateResume(request: ResumeGenerationRequest): Promise<GeneratedResume> {
    try {
      const prompt = this.buildResumePrompt(request);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseResumeResponse(text, request);
    } catch (error) {
      console.error('Error generating resume with Gemini:', error);
      throw new Error('Failed to generate resume');
    }
  }

  private buildResumePrompt(request: ResumeGenerationRequest): string {
    const { userStats, personalInfo, targetRole, targetIndustry } = request;
    
    // Calculate key metrics from game stats
    const totalTasks = Object.values(userStats.categoryStats).reduce(
      (total, category) => total + category.tasksCompleted, 0
    );
    
    const strongestCategories = Object.entries(userStats.categoryStats)
      .sort(([,a], [,b]) => b.tasksCompleted - a.tasksCompleted)
      .slice(0, 3);
    
    const allSpecializations = Object.values(userStats.categoryStats)
      .flatMap(category => category.specializations);
    
    const averageRating = Object.values(userStats.categoryStats).reduce(
      (total, category) => total + category.averageRating, 0
    ) / Object.keys(userStats.categoryStats).length;

    return `
You are an expert resume writer and career coach. Generate a professional resume based on the following Good Grid platform achievements and user information.

PERSONAL INFORMATION:
- Name: ${personalInfo.name}
- Email: ${personalInfo.email}
- Phone: ${personalInfo.phone || 'Not provided'}
- Location: ${personalInfo.location || 'Not provided'}
- Current Summary: ${personalInfo.summary || 'Not provided'}

GOOD GRID ACHIEVEMENTS:
- Total Projects Completed: ${totalTasks}
- Trust Score: ${userStats.trustScore}/100
- Experience Level: ${userStats.currentLevel}
- Average Project Rating: ${averageRating.toFixed(1)}/5.0
- Unlocked Areas: ${userStats.unlockedZones.join(', ')}

STRONGEST WORK CATEGORIES:
${strongestCategories.map(([category, stats]) => 
  `- ${category}: ${stats.tasksCompleted} projects, ${stats.totalXP} XP, ${stats.averageRating.toFixed(1)} avg rating`
).join('\n')}

SPECIALIZED SKILLS:
${allSpecializations.join(', ')}

TARGET ROLE: ${targetRole || 'General professional role'}
TARGET INDUSTRY: ${targetIndustry || 'Various industries'}

INSTRUCTIONS:
1. Create a professional resume that translates Good Grid achievements into real-world professional experience
2. Frame the platform work as legitimate freelance/consulting/volunteer experience
3. Highlight transferable skills and quantifiable achievements
4. Use professional language while maintaining authenticity
5. Include a compelling professional summary
6. Create relevant work experience entries based on the strongest categories
7. List technical and soft skills derived from specializations
8. Add achievements section highlighting key metrics
9. Suggest areas for improvement based on gaps

FORMAT YOUR RESPONSE AS JSON:
{
  "summary": "Professional summary paragraph",
  "experience": [
    {
      "title": "Role title based on Good Grid work",
      "organization": "Good Grid Platform / Freelance",
      "duration": "Estimated timeframe",
      "description": "Professional description of work",
      "achievements": ["Quantified achievement 1", "Achievement 2"]
    }
  ],
  "skills": {
    "technical": ["Technical skill 1", "Technical skill 2"],
    "soft": ["Soft skill 1", "Soft skill 2"]
  },
  "achievements": [
    "Key achievement with metrics",
    "Another significant accomplishment"
  ],
  "recommendations": [
    "Suggestion for skill development",
    "Career advancement recommendation"
  ]
}

Make the resume compelling and professional while being truthful about the Good Grid platform experience.
`;
  }

  private parseResumeResponse(text: string, request: ResumeGenerationRequest): GeneratedResume {
    try {
      // Try to parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          sections: this.createResumeSections(parsed, request),
          summary: parsed.summary || '',
          skills: [...(parsed.skills?.technical || []), ...(parsed.skills?.soft || [])],
          experience: parsed.experience || [],
          achievements: parsed.achievements || [],
          recommendations: parsed.recommendations || []
        };
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
    }
    
    // Fallback to basic parsing if JSON fails
    return this.createFallbackResume(text, request);
  }

  private createResumeSections(parsed: any, request: ResumeGenerationRequest): ResumeSection[] {
    const sections: ResumeSection[] = [];
    
    // Professional Summary
    if (parsed.summary) {
      sections.push({
        title: 'Professional Summary',
        content: parsed.summary,
        order: 1
      });
    }
    
    // Experience
    if (parsed.experience && parsed.experience.length > 0) {
      const experienceContent = parsed.experience.map((exp: any) => `
        <div class="experience-item">
          <h4>${exp.title}</h4>
          <p class="organization">${exp.organization}</p>
          <p class="duration">${exp.duration}</p>
          <p class="description">${exp.description}</p>
          ${exp.achievements ? `
            <ul class="achievements">
              ${exp.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('');
      
      sections.push({
        title: 'Professional Experience',
        content: experienceContent,
        order: 2
      });
    }
    
    // Skills
    if (parsed.skills) {
      const skillsContent = `
        ${parsed.skills.technical ? `
          <div class="skill-category">
            <h4>Technical Skills</h4>
            <p>${parsed.skills.technical.join(', ')}</p>
          </div>
        ` : ''}
        ${parsed.skills.soft ? `
          <div class="skill-category">
            <h4>Core Competencies</h4>
            <p>${parsed.skills.soft.join(', ')}</p>
          </div>
        ` : ''}
      `;
      
      sections.push({
        title: 'Skills & Competencies',
        content: skillsContent,
        order: 3
      });
    }
    
    // Achievements
    if (parsed.achievements && parsed.achievements.length > 0) {
      const achievementsContent = `
        <ul class="achievements-list">
          ${parsed.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
        </ul>
      `;
      
      sections.push({
        title: 'Key Achievements',
        content: achievementsContent,
        order: 4
      });
    }
    
    return sections.sort((a, b) => a.order - b.order);
  }

  private createFallbackResume(text: string, request: ResumeGenerationRequest): GeneratedResume {
    const { userStats, personalInfo } = request;
    
    const totalTasks = Object.values(userStats.categoryStats).reduce(
      (total, category) => total + category.tasksCompleted, 0
    );
    
    const strongestCategory = Object.entries(userStats.categoryStats)
      .sort(([,a], [,b]) => b.tasksCompleted - a.tasksCompleted)[0];
    
    return {
      sections: [
        {
          title: 'Professional Summary',
          content: `Experienced professional with ${totalTasks} completed projects and a trust score of ${userStats.trustScore}. Specialized in ${strongestCategory?.[0] || 'various areas'} with proven track record in community contribution and collaborative work.`,
          order: 1
        },
        {
          title: 'Professional Experience',
          content: `
            <div class="experience-item">
              <h4>Freelance Professional</h4>
              <p class="organization">Good Grid Platform</p>
              <p class="duration">Recent</p>
              <p class="description">Completed ${totalTasks} projects across multiple categories with ${userStats.trustScore} trust score.</p>
            </div>
          `,
          order: 2
        }
      ],
      summary: personalInfo.summary || `Professional with ${totalTasks} completed projects`,
      skills: Object.values(userStats.categoryStats).flatMap(cat => cat.specializations),
      experience: [],
      achievements: [`Completed ${totalTasks} projects`, `Achieved ${userStats.trustScore} trust score`],
      recommendations: ['Continue building portfolio', 'Develop specialized skills']
    };
  }

  async generateResumeHTML(resume: GeneratedResume, template: string = 'modern'): Promise<string> {
    const templateStyles = this.getTemplateStyles(template);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Professional Resume</title>
    <style>${templateStyles}</style>
</head>
<body>
    <div class="resume-container">
        ${resume.sections.map(section => `
            <section class="resume-section">
                <h2 class="section-title">${section.title}</h2>
                <div class="section-content">${section.content}</div>
            </section>
        `).join('')}
    </div>
</body>
</html>
    `;
  }

  private getTemplateStyles(template: string): string {
    const baseStyles = `
      body {
        font-family: 'Arial', sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        background: #fff;
      }
      
      .resume-container {
        background: white;
        padding: 40px;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }
      
      .section-title {
        color: #2c3e50;
        border-bottom: 2px solid #3498db;
        padding-bottom: 5px;
        margin-bottom: 20px;
      }
      
      .experience-item {
        margin-bottom: 25px;
      }
      
      .experience-item h4 {
        color: #2c3e50;
        margin-bottom: 5px;
      }
      
      .organization {
        color: #3498db;
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .duration {
        color: #7f8c8d;
        font-style: italic;
        margin-bottom: 10px;
      }
      
      .achievements {
        margin-top: 10px;
      }
      
      .achievements li {
        margin-bottom: 5px;
      }
      
      .skill-category {
        margin-bottom: 15px;
      }
      
      .skill-category h4 {
        color: #2c3e50;
        margin-bottom: 5px;
      }
    `;
    
    if (template === 'creative') {
      return baseStyles + `
        .section-title {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          border-bottom: 2px solid #667eea;
        }
        
        .resume-container {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
      `;
    }
    
    return baseStyles;
  }
}

export default GeminiResumeService;