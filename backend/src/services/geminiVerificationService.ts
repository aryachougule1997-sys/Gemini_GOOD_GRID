import { GoogleGenerativeAI } from '@google/generative-ai';
import { TaskSubmission, Task, AIVerificationResult } from '../../../shared/types';

export class GeminiVerificationService {
    private genAI: GoogleGenerativeAI;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    /**
     * Verify task completion using Gemini AI
     */
    async verifyTaskCompletion(
        submission: TaskSubmission, 
        task: Task
    ): Promise<AIVerificationResult> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildVerificationPrompt(submission, task);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseVerificationResponse(text);
        } catch (error) {
            console.error('Gemini verification error:', error);
            
            // Fallback verification result when AI fails
            return {
                score: 50,
                passed: false,
                reasoning: 'AI verification service temporarily unavailable. Manual review required.',
                flaggedIssues: ['AI_SERVICE_ERROR'],
                suggestedImprovements: ['Please retry submission or request manual review'],
                requiresManualReview: true,
                verifiedAt: new Date()
            };
        }
    }

    /**
     * Analyze task submission for fraud detection
     */
    async detectFraudulentActivity(
        submission: TaskSubmission,
        task: Task,
        userHistory: any[]
    ): Promise<{
        isFraudulent: boolean;
        confidence: number;
        reasons: string[];
        riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    }> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildFraudDetectionPrompt(submission, task, userHistory);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseFraudDetectionResponse(text);
        } catch (error) {
            console.error('Fraud detection error:', error);
            
            // Conservative fallback - flag for manual review
            return {
                isFraudulent: false,
                confidence: 0,
                reasons: ['AI_SERVICE_ERROR'],
                riskLevel: 'MEDIUM'
            };
        }
    }

    /**
     * Generate personalized feedback for task completion
     */
    async generateFeedback(
        submission: TaskSubmission,
        task: Task,
        verificationResult: AIVerificationResult
    ): Promise<{
        feedback: string;
        suggestions: string[];
        strengths: string[];
        areasForImprovement: string[];
    }> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = this.buildFeedbackPrompt(submission, task, verificationResult);
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return this.parseFeedbackResponse(text);
        } catch (error) {
            console.error('Feedback generation error:', error);
            
            return {
                feedback: 'Thank you for your submission. Our team will review it shortly.',
                suggestions: [],
                strengths: [],
                areasForImprovement: []
            };
        }
    }

    private buildVerificationPrompt(submission: TaskSubmission, task: Task): string {
        return `
You are an AI task verification system for a community contribution platform. 
Analyze the following task submission and determine if it meets the requirements.

TASK DETAILS:
Title: ${task.title}
Description: ${task.description}
Category: ${task.category}
Requirements: ${JSON.stringify(task.requirements)}
Expected Deliverables: ${JSON.stringify(task.rewards)}

SUBMISSION DETAILS:
Submission Text: ${submission.submissionText || 'No text provided'}
File Attachments: ${submission.fileAttachments.length} files attached
Submission Date: ${submission.submittedAt}

VERIFICATION CRITERIA:
1. Does the submission address all task requirements?
2. Is the quality of work appropriate for the task difficulty?
3. Are all required deliverables present?
4. Does the submission show genuine effort and completion?
5. Are there any red flags indicating potential fraud or plagiarism?

Please respond in the following JSON format:
{
    "score": <number 0-100>,
    "passed": <boolean>,
    "reasoning": "<detailed explanation>",
    "flaggedIssues": ["<issue1>", "<issue2>"],
    "suggestedImprovements": ["<improvement1>", "<improvement2>"],
    "requiresManualReview": <boolean>
}

Be thorough but fair in your assessment. Consider the task category and difficulty level.
`;
    }

    private buildFraudDetectionPrompt(
        submission: TaskSubmission, 
        task: Task, 
        userHistory: any[]
    ): string {
        return `
You are a fraud detection system for a community contribution platform.
Analyze this submission for potential fraudulent activity.

SUBMISSION:
Text: ${submission.submissionText || 'No text provided'}
Files: ${submission.fileAttachments.length} attachments
Submission Time: ${submission.submittedAt}
Revision Count: ${submission.revisionCount}

TASK:
Category: ${task.category}
Difficulty: ${task.requirements.trustScoreMin || 0} trust score required
Time Commitment: ${task.requirements.timeCommitment} hours

USER HISTORY:
Previous Submissions: ${userHistory.length}
Recent Activity Pattern: ${JSON.stringify(userHistory.slice(-5))}

FRAUD INDICATORS TO CHECK:
1. Submission quality vs. user experience level
2. Time between task acceptance and submission
3. Generic or copy-paste content
4. Inconsistent writing style or technical level
5. Unrealistic completion speed
6. Pattern of similar submissions

Respond in JSON format:
{
    "isFraudulent": <boolean>,
    "confidence": <number 0-100>,
    "reasons": ["<reason1>", "<reason2>"],
    "riskLevel": "<LOW|MEDIUM|HIGH>"
}
`;
    }

    private buildFeedbackPrompt(
        submission: TaskSubmission,
        task: Task,
        verificationResult: AIVerificationResult
    ): string {
        return `
Generate constructive feedback for a task submission on a community contribution platform.

TASK: ${task.title}
CATEGORY: ${task.category}
SUBMISSION STATUS: ${verificationResult.passed ? 'APPROVED' : 'NEEDS IMPROVEMENT'}
AI SCORE: ${verificationResult.score}/100

SUBMISSION CONTENT: ${submission.submissionText || 'File-based submission'}

Provide encouraging, specific, and actionable feedback in JSON format:
{
    "feedback": "<main feedback message>",
    "suggestions": ["<actionable suggestion 1>", "<suggestion 2>"],
    "strengths": ["<what they did well 1>", "<strength 2>"],
    "areasForImprovement": ["<area 1>", "<area 2>"]
}

Keep feedback positive and constructive, focusing on growth and learning.
`;
    }

    private parseVerificationResponse(text: string): AIVerificationResult {
        try {
            const parsed = JSON.parse(text);
            return {
                score: Math.max(0, Math.min(100, parsed.score || 0)),
                passed: Boolean(parsed.passed),
                reasoning: parsed.reasoning || 'No reasoning provided',
                flaggedIssues: Array.isArray(parsed.flaggedIssues) ? parsed.flaggedIssues : [],
                suggestedImprovements: Array.isArray(parsed.suggestedImprovements) ? parsed.suggestedImprovements : [],
                requiresManualReview: Boolean(parsed.requiresManualReview),
                verifiedAt: new Date()
            };
        } catch (error) {
            console.error('Failed to parse verification response:', error);
            return {
                score: 0,
                passed: false,
                reasoning: 'Failed to parse AI response',
                flaggedIssues: ['PARSING_ERROR'],
                suggestedImprovements: ['Please retry submission'],
                requiresManualReview: true,
                verifiedAt: new Date()
            };
        }
    }

    private parseFraudDetectionResponse(text: string) {
        try {
            const parsed = JSON.parse(text);
            return {
                isFraudulent: Boolean(parsed.isFraudulent),
                confidence: Math.max(0, Math.min(100, parsed.confidence || 0)),
                reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
                riskLevel: ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.riskLevel) 
                    ? parsed.riskLevel 
                    : 'MEDIUM'
            };
        } catch (error) {
            console.error('Failed to parse fraud detection response:', error);
            return {
                isFraudulent: false,
                confidence: 0,
                reasons: ['PARSING_ERROR'],
                riskLevel: 'MEDIUM' as const
            };
        }
    }

    private parseFeedbackResponse(text: string) {
        try {
            const parsed = JSON.parse(text);
            return {
                feedback: parsed.feedback || 'Thank you for your submission.',
                suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
                strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
                areasForImprovement: Array.isArray(parsed.areasForImprovement) ? parsed.areasForImprovement : []
            };
        } catch (error) {
            console.error('Failed to parse feedback response:', error);
            return {
                feedback: 'Thank you for your submission. Our team will review it shortly.',
                suggestions: [],
                strengths: [],
                areasForImprovement: []
            };
        }
    }
}