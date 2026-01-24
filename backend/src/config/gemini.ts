import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Initialize Gemini Pro model
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Gemini service class for AI operations
export class GeminiService {
  static async analyzeText(prompt: string): Promise<string> {
    try {
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini AI Error:', error);
      throw new Error('Failed to analyze text with Gemini AI');
    }
  }

  static async categorizeTask(taskDescription: string): Promise<string> {
    const prompt = `
      Analyze the following task description and categorize it into one of three categories:
      - FREELANCE: Individual client work, paid projects, skill-based services
      - COMMUNITY: Volunteering, community service, social causes, environmental projects
      - CORPORATE: Organizational tasks, structured projects, formal business processes
      
      Task Description: "${taskDescription}"
      
      Respond with only the category name (FREELANCE, COMMUNITY, or CORPORATE).
    `;
    
    return this.analyzeText(prompt);
  }

  static async assessTaskDifficulty(taskDescription: string, userSkills: string[]): Promise<string> {
    const prompt = `
      Assess the difficulty level of this task for a user with the following skills: ${userSkills.join(', ')}
      
      Task: "${taskDescription}"
      
      Rate the difficulty as: BEGINNER, INTERMEDIATE, ADVANCED, or EXPERT
      
      Respond with only the difficulty level.
    `;
    
    return this.analyzeText(prompt);
  }

  static async matchTasksToUser(tasks: string[], userProfile: string): Promise<string> {
    const prompt = `
      Given the following user profile and list of available tasks, recommend the top 3 most suitable tasks.
      
      User Profile: "${userProfile}"
      
      Available Tasks:
      ${tasks.map((task, index) => `${index + 1}. ${task}`).join('\n')}
      
      Provide recommendations with brief explanations for each match.
    `;
    
    return this.analyzeText(prompt);
  }
}

export default GeminiService;