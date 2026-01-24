import { ResumeData, ResumeTemplate } from './geminiCareerService';
import * as fs from 'fs';
import * as path from 'path';

export interface ExportOptions {
  format: 'PDF' | 'HTML' | 'DOCX' | 'JSON';
  template: ResumeTemplate;
  includeGamification: boolean;
  professionalMode: boolean;
  colorScheme: 'BLUE' | 'GREEN' | 'PURPLE' | 'GRAY' | 'BLACK';
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  downloadUrl?: string;
  error?: string;
  metadata: {
    format: string;
    fileSize: number;
    generatedAt: Date;
    template: string;
  };
}

export class ResumeExportService {
    private templatesDir: string;
    private outputDir: string;

    constructor() {
        this.templatesDir = path.join(__dirname, '../templates/resume');
        this.outputDir = path.join(__dirname, '../../../exports/resumes');
        this.ensureDirectoriesExist();
    }

    /**
     * Export resume in specified format
     */
    async exportResume(
        resumeData: ResumeData,
        options: ExportOptions,
        userId: string
    ): Promise<ExportResult> {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `resume_${userId}_${timestamp}`;
            
            switch (options.format) {
                case 'HTML':
                    return await this.exportToHTML(resumeData, options, fileName);
                case 'PDF':
                    return await this.exportToPDF(resumeData, options, fileName);
                case 'DOCX':
                    return await this.exportToDocx(resumeData, options, fileName);
                case 'JSON':
                    return await this.exportToJSON(resumeData, options, fileName);
                default:
                    throw new Error(`Unsupported format: ${options.format}`);
            }
        } catch (error) {
            console.error('Resume export error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Export failed',
                metadata: {
                    format: options.format,
                    fileSize: 0,
                    generatedAt: new Date(),
                    template: options.template.name
                }
            };
        }
    }

    /**
     * Export to HTML format
     */
    private async exportToHTML(
        resumeData: ResumeData,
        options: ExportOptions,
        fileName: string
    ): Promise<ExportResult> {
        const htmlContent = this.generateHTMLContent(resumeData, options);
        const filePath = path.join(this.outputDir, `${fileName}.html`);
        
        await fs.promises.writeFile(filePath, htmlContent, 'utf8');
        
        const stats = await fs.promises.stat(filePath);
        
        return {
            success: true,
            filePath,
            downloadUrl: `/api/exports/resume/${path.basename(filePath)}`,
            metadata: {
                format: 'HTML',
                fileSize: stats.size,
                generatedAt: new Date(),
                template: options.template.name
            }
        };
    }

    /**
     * Export to PDF format (requires HTML to PDF conversion)
     */
    private async exportToPDF(
        resumeData: ResumeData,
        options: ExportOptions,
        fileName: string
    ): Promise<ExportResult> {
        // First generate HTML
        const htmlContent = this.generateHTMLContent(resumeData, options);
        
        // For now, we'll create a placeholder PDF export
        // In production, you'd use a library like puppeteer or similar
        const pdfContent = this.generatePDFPlaceholder(resumeData, options);
        const filePath = path.join(this.outputDir, `${fileName}.pdf`);
        
        await fs.promises.writeFile(filePath, pdfContent);
        
        const stats = await fs.promises.stat(filePath);
        
        return {
            success: true,
            filePath,
            downloadUrl: `/api/exports/resume/${path.basename(filePath)}`,
            metadata: {
                format: 'PDF',
                fileSize: stats.size,
                generatedAt: new Date(),
                template: options.template.name
            }
        };
    }

    /**
     * Export to DOCX format
     */
    private async exportToDocx(
        resumeData: ResumeData,
        options: ExportOptions,
        fileName: string
    ): Promise<ExportResult> {
        // Generate DOCX content (simplified version)
        const docxContent = this.generateDocxContent(resumeData, options);
        const filePath = path.join(this.outputDir, `${fileName}.docx`);
        
        await fs.promises.writeFile(filePath, docxContent);
        
        const stats = await fs.promises.stat(filePath);
        
        return {
            success: true,
            filePath,
            downloadUrl: `/api/exports/resume/${path.basename(filePath)}`,
            metadata: {
                format: 'DOCX',
                fileSize: stats.size,
                generatedAt: new Date(),
                template: options.template.name
            }
        };
    }

    /**
     * Export to JSON format
     */
    private async exportToJSON(
        resumeData: ResumeData,
        options: ExportOptions,
        fileName: string
    ): Promise<ExportResult> {
        const jsonContent = JSON.stringify(resumeData, null, 2);
        const filePath = path.join(this.outputDir, `${fileName}.json`);
        
        await fs.promises.writeFile(filePath, jsonContent, 'utf8');
        
        const stats = await fs.promises.stat(filePath);
        
        return {
            success: true,
            filePath,
            downloadUrl: `/api/exports/resume/${path.basename(filePath)}`,
            metadata: {
                format: 'JSON',
                fileSize: stats.size,
                generatedAt: new Date(),
                template: options.template.name
            }
        };
    }

    /**
     * Generate HTML content for resume
     */
    private generateHTMLContent(resumeData: ResumeData, options: ExportOptions): string {
        const colorScheme = this.getColorScheme(options.colorScheme);
        const gamificationSection = options.includeGamification ? this.generateGamificationHTML(resumeData) : '';
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.personalInfo.fullName} - Resume</title>
    <style>
        ${this.generateCSS(options.template, colorScheme)}
    </style>
</head>
<body>
    <div class="resume-container">
        <!-- Header Section -->
        <header class="resume-header">
            <h1>${resumeData.personalInfo.fullName}</h1>
            <div class="contact-info">
                <p>📧 ${resumeData.personalInfo.email}</p>
                ${resumeData.personalInfo.phone ? `<p>📞 ${resumeData.personalInfo.phone}</p>` : ''}
                <p>📍 ${resumeData.personalInfo.location}</p>
                ${resumeData.personalInfo.linkedIn ? `<p>🔗 ${resumeData.personalInfo.linkedIn}</p>` : ''}
            </div>
            ${options.includeGamification ? `
            <div class="gamification-stats">
                <div class="stat">
                    <span class="stat-label">Trust Score</span>
                    <span class="stat-value">${resumeData.personalInfo.trustScore}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Impact Score</span>
                    <span class="stat-value">${resumeData.personalInfo.rwisScore}</span>
                </div>
            </div>
            ` : ''}
        </header>

        <!-- Professional Summary -->
        <section class="section">
            <h2>Professional Summary</h2>
            <p>${resumeData.professionalSummary}</p>
        </section>

        <!-- Work Experience -->
        ${resumeData.workExperience.length > 0 ? `
        <section class="section">
            <h2>Work Experience</h2>
            ${resumeData.workExperience.map(exp => `
            <div class="experience-item">
                <div class="experience-header">
                    <h3>${exp.title}</h3>
                    <span class="duration">${exp.duration}</span>
                </div>
                <h4>${exp.organization} ${options.includeGamification ? `<span class="category-badge ${exp.category.toLowerCase()}">${exp.category}</span>` : ''}</h4>
                <ul>
                    ${exp.description.map(desc => `<li>${desc}</li>`).join('')}
                </ul>
                ${exp.achievements.length > 0 ? `
                <div class="achievements">
                    <strong>Key Achievements:</strong>
                    <ul>
                        ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                ${exp.impactMetrics.length > 0 ? `
                <div class="impact-metrics">
                    <strong>Impact:</strong> ${exp.impactMetrics.join(', ')}
                </div>
                ` : ''}
            </div>
            `).join('')}
        </section>
        ` : ''}

        <!-- Skills -->
        <section class="section">
            <h2>Skills</h2>
            <div class="skills-grid">
                ${resumeData.skills.technical.length > 0 ? `
                <div class="skill-category">
                    <h3>Technical Skills</h3>
                    <div class="skill-list">
                        ${resumeData.skills.technical.map(skill => `
                        <span class="skill-item">
                            ${skill.name} 
                            ${options.includeGamification ? `<span class="skill-level">(${skill.level})</span>` : ''}
                        </span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${resumeData.skills.soft.length > 0 ? `
                <div class="skill-category">
                    <h3>Soft Skills</h3>
                    <div class="skill-list">
                        ${resumeData.skills.soft.map(skill => `
                        <span class="skill-item">
                            ${skill.name}
                            ${options.includeGamification ? `<span class="skill-level">(${skill.level})</span>` : ''}
                        </span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </section>

        <!-- Achievements -->
        ${resumeData.achievements.length > 0 ? `
        <section class="section">
            <h2>Achievements & Recognition</h2>
            ${resumeData.achievements.map(achievement => `
            <div class="achievement-item">
                <h3>${achievement.title}</h3>
                <p>${achievement.description}</p>
                <span class="achievement-date">${new Date(achievement.date).toLocaleDateString()}</span>
                ${options.includeGamification ? `<span class="impact-score">Impact Score: ${achievement.impactScore}</span>` : ''}
            </div>
            `).join('')}
        </section>
        ` : ''}

        <!-- Volunteer Work -->
        ${resumeData.volunteerWork.length > 0 ? `
        <section class="section">
            <h2>Volunteer Experience</h2>
            ${resumeData.volunteerWork.map(volunteer => `
            <div class="volunteer-item">
                <h3>${volunteer.role}</h3>
                <h4>${volunteer.organization}</h4>
                <span class="duration">${volunteer.duration}</span>
                <p>${volunteer.description}</p>
                <p><strong>Impact:</strong> ${volunteer.impact}</p>
            </div>
            `).join('')}
        </section>
        ` : ''}

        <!-- Projects -->
        ${resumeData.projects.length > 0 ? `
        <section class="section">
            <h2>Projects</h2>
            ${resumeData.projects.map(project => `
            <div class="project-item">
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                <p><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>
                <p><strong>Duration:</strong> ${project.duration}</p>
                ${project.outcomes.length > 0 ? `<p><strong>Outcomes:</strong> ${project.outcomes.join(', ')}</p>` : ''}
            </div>
            `).join('')}
        </section>
        ` : ''}

        ${gamificationSection}

        <footer class="resume-footer">
            <p>Generated from Good Grid Profile • ${new Date().toLocaleDateString()}</p>
        </footer>
    </div>
</body>
</html>
        `;
    }

    /**
     * Generate CSS styles for resume
     */
    private generateCSS(template: ResumeTemplate, colorScheme: any): string {
        return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: ${colorScheme.text};
            background-color: ${colorScheme.background};
        }

        .resume-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .resume-header {
            text-align: center;
            border-bottom: 2px solid ${colorScheme.primary};
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .resume-header h1 {
            font-size: 2.5em;
            color: ${colorScheme.primary};
            margin-bottom: 10px;
        }

        .contact-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            margin-bottom: 15px;
        }

        .contact-info p {
            margin: 0;
            font-size: 0.9em;
        }

        .gamification-stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 15px;
        }

        .stat {
            text-align: center;
        }

        .stat-label {
            display: block;
            font-size: 0.8em;
            color: ${colorScheme.secondary};
            text-transform: uppercase;
        }

        .stat-value {
            display: block;
            font-size: 1.5em;
            font-weight: bold;
            color: ${colorScheme.primary};
        }

        .section {
            margin-bottom: 30px;
        }

        .section h2 {
            color: ${colorScheme.primary};
            border-bottom: 1px solid ${colorScheme.secondary};
            padding-bottom: 5px;
            margin-bottom: 15px;
            font-size: 1.3em;
        }

        .experience-item, .achievement-item, .volunteer-item, .project-item {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }

        .experience-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 5px;
        }

        .experience-header h3 {
            color: ${colorScheme.primary};
            font-size: 1.1em;
        }

        .duration {
            font-size: 0.9em;
            color: ${colorScheme.secondary};
            font-style: italic;
        }

        .category-badge {
            font-size: 0.7em;
            padding: 2px 8px;
            border-radius: 12px;
            color: white;
            text-transform: uppercase;
            font-weight: bold;
        }

        .category-badge.freelance { background-color: #3498db; }
        .category-badge.community { background-color: #2ecc71; }
        .category-badge.corporate { background-color: #9b59b6; }

        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }

        .skill-category h3 {
            color: ${colorScheme.primary};
            margin-bottom: 10px;
            font-size: 1em;
        }

        .skill-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .skill-item {
            background-color: ${colorScheme.background};
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.9em;
            border: 1px solid ${colorScheme.secondary};
        }

        .skill-level {
            color: ${colorScheme.secondary};
            font-size: 0.8em;
        }

        .achievements .impact-metrics {
            margin-top: 10px;
            font-size: 0.9em;
            color: ${colorScheme.secondary};
        }

        .impact-score {
            float: right;
            background-color: ${colorScheme.primary};
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.8em;
        }

        .resume-footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 0.8em;
            color: ${colorScheme.secondary};
        }

        @media print {
            .resume-container {
                box-shadow: none;
                margin: 0;
                padding: 0;
            }
        }
        `;
    }

    /**
     * Generate gamification section HTML
     */
    private generateGamificationHTML(resumeData: ResumeData): string {
        return `
        <section class="section gamification-section">
            <h2>🎮 Good Grid Achievements</h2>
            <div class="gamification-details">
                <p>This resume is powered by verified achievements from the Good Grid platform, 
                where real-world contributions are tracked, verified, and converted into career value.</p>
                
                <div class="platform-stats">
                    <div class="platform-stat">
                        <strong>Trust Score:</strong> ${resumeData.personalInfo.trustScore}/100
                        <small>Reliability and consistency metric</small>
                    </div>
                    <div class="platform-stat">
                        <strong>Impact Score:</strong> ${resumeData.personalInfo.rwisScore}
                        <small>Real-world contribution value</small>
                    </div>
                </div>
                
                <p><em>All achievements and work experience listed above have been verified through 
                AI-powered assessment and community validation on the Good Grid platform.</em></p>
            </div>
        </section>
        `;
    }

    /**
     * Get color scheme based on selection
     */
    private getColorScheme(scheme: string) {
        const schemes = {
            BLUE: {
                primary: '#3498db',
                secondary: '#7fb3d3',
                background: '#f8f9fa',
                text: '#2c3e50'
            },
            GREEN: {
                primary: '#2ecc71',
                secondary: '#58d68d',
                background: '#f8f9fa',
                text: '#2c3e50'
            },
            PURPLE: {
                primary: '#9b59b6',
                secondary: '#bb8fce',
                background: '#f8f9fa',
                text: '#2c3e50'
            },
            GRAY: {
                primary: '#34495e',
                secondary: '#85929e',
                background: '#f8f9fa',
                text: '#2c3e50'
            },
            BLACK: {
                primary: '#2c3e50',
                secondary: '#566573',
                background: '#ffffff',
                text: '#2c3e50'
            }
        };
        
        return schemes[scheme as keyof typeof schemes] || schemes.BLUE;
    }

    /**
     * Generate PDF placeholder content
     */
    private generatePDFPlaceholder(resumeData: ResumeData, options: ExportOptions): string {
        // In a real implementation, you'd use a library like puppeteer to convert HTML to PDF
        return `PDF Resume for ${resumeData.personalInfo.fullName}\nGenerated: ${new Date().toISOString()}\nTemplate: ${options.template.name}`;
    }

    /**
     * Generate DOCX content
     */
    private generateDocxContent(resumeData: ResumeData, options: ExportOptions): string {
        // In a real implementation, you'd use a library like docx to generate proper DOCX files
        return `DOCX Resume for ${resumeData.personalInfo.fullName}\nGenerated: ${new Date().toISOString()}\nTemplate: ${options.template.name}`;
    }

    /**
     * Ensure required directories exist
     */
    private ensureDirectoriesExist(): void {
        [this.templatesDir, this.outputDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    /**
     * Get available resume templates
     */
    getAvailableTemplates(): ResumeTemplate[] {
        return [
            {
                id: 'modern-tech',
                name: 'Modern Technical',
                description: 'Clean, modern design perfect for tech professionals',
                category: 'TECHNICAL',
                format: 'HTML',
                sections: ['summary', 'experience', 'skills', 'projects', 'achievements'],
                designStyle: 'MODERN'
            },
            {
                id: 'creative-portfolio',
                name: 'Creative Portfolio',
                description: 'Visually appealing design for creative professionals',
                category: 'CREATIVE',
                format: 'HTML',
                sections: ['summary', 'experience', 'skills', 'projects', 'portfolio'],
                designStyle: 'CREATIVE'
            },
            {
                id: 'business-professional',
                name: 'Business Professional',
                description: 'Traditional, professional format for business roles',
                category: 'BUSINESS',
                format: 'HTML',
                sections: ['summary', 'experience', 'skills', 'achievements', 'education'],
                designStyle: 'CLASSIC'
            },
            {
                id: 'academic-research',
                name: 'Academic & Research',
                description: 'Comprehensive format for academic and research positions',
                category: 'ACADEMIC',
                format: 'HTML',
                sections: ['summary', 'education', 'research', 'publications', 'experience'],
                designStyle: 'CLASSIC'
            },
            {
                id: 'minimal-clean',
                name: 'Minimal Clean',
                description: 'Simple, clean design that works for any industry',
                category: 'GENERAL',
                format: 'HTML',
                sections: ['summary', 'experience', 'skills', 'education'],
                designStyle: 'MINIMAL'
            }
        ];
    }
}