import axios from 'axios';

interface JobSearchParams {
    skills: string[];
    experience: string;
    location?: string;
    jobType?: string;
    salaryMin?: number;
    salaryMax?: number;
}

interface JobListing {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    requirements: string[];
    salaryRange?: string;
    jobType: string;
    postedDate: string;
    applyUrl: string;
    source: string;
}

class JobApiService {
    private indeedApiKey: string;
    private linkedinApiKey: string;
    private adzunaApiKey: string;

    constructor() {
        this.indeedApiKey = process.env.INDEED_API_KEY || '';
        this.linkedinApiKey = process.env.LINKEDIN_API_KEY || '';
        this.adzunaApiKey = process.env.ADZUNA_API_KEY || '';
    }

    async searchJobs(params: JobSearchParams): Promise<JobListing[]> {
        const allJobs: JobListing[] = [];

        try {
            // Search multiple job APIs in parallel
            const [indeedJobs, linkedinJobs, adzunaJobs] = await Promise.allSettled([
                this.searchIndeed(params),
                this.searchLinkedIn(params),
                this.searchAdzuna(params)
            ]);

            // Combine results from all sources
            if (indeedJobs.status === 'fulfilled') {
                allJobs.push(...indeedJobs.value);
            }
            if (linkedinJobs.status === 'fulfilled') {
                allJobs.push(...linkedinJobs.value);
            }
            if (adzunaJobs.status === 'fulfilled') {
                allJobs.push(...adzunaJobs.value);
            }

            // Remove duplicates and sort by relevance
            const uniqueJobs = this.removeDuplicates(allJobs);
            return this.sortByRelevance(uniqueJobs, params);

        } catch (error) {
            console.error('Error searching jobs:', error);
            // Return sample jobs if APIs fail
            return this.getSampleJobs(params);
        }
    }

    private async searchIndeed(params: JobSearchParams): Promise<JobListing[]> {
        if (!this.indeedApiKey) {
            return this.getSampleJobs(params, 'Indeed');
        }

        try {
            const response = await axios.get('https://api.indeed.com/ads/apisearch', {
                params: {
                    publisher: this.indeedApiKey,
                    q: params.skills.join(' OR '),
                    l: params.location || 'Remote',
                    sort: 'relevance',
                    radius: 25,
                    st: 'jobsite',
                    jt: params.jobType || 'fulltime',
                    start: 0,
                    limit: 10,
                    fromage: 14,
                    format: 'json',
                    v: '2'
                }
            });

            return response.data.results.map((job: any) => ({
                id: `indeed_${job.jobkey}`,
                title: job.jobtitle,
                company: job.company,
                location: job.formattedLocation,
                description: job.snippet,
                requirements: this.extractRequirements(job.snippet),
                salaryRange: job.salary || 'Not specified',
                jobType: job.jobtype || 'Full-time',
                postedDate: job.date,
                applyUrl: job.url,
                source: 'Indeed'
            }));
        } catch (error) {
            console.error('Indeed API error:', error);
            return [];
        }
    }

    private async searchLinkedIn(params: JobSearchParams): Promise<JobListing[]> {
        if (!this.linkedinApiKey) {
            return this.getSampleJobs(params, 'LinkedIn');
        }

        try {
            // LinkedIn API implementation
            const response = await axios.get('https://api.linkedin.com/v2/jobSearch', {
                headers: {
                    'Authorization': `Bearer ${this.linkedinApiKey}`,
                    'X-Restli-Protocol-Version': '2.0.0'
                },
                params: {
                    keywords: params.skills.join(' '),
                    locationId: params.location,
                    count: 10
                }
            });

            return response.data.elements.map((job: any) => ({
                id: `linkedin_${job.id}`,
                title: job.title,
                company: job.companyName,
                location: job.location,
                description: job.description,
                requirements: this.extractRequirements(job.description),
                salaryRange: 'Not specified',
                jobType: job.employmentType || 'Full-time',
                postedDate: job.listedAt,
                applyUrl: `https://linkedin.com/jobs/view/${job.id}`,
                source: 'LinkedIn'
            }));
        } catch (error) {
            console.error('LinkedIn API error:', error);
            return [];
        }
    }

    private async searchAdzuna(params: JobSearchParams): Promise<JobListing[]> {
        if (!this.adzunaApiKey) {
            return this.getSampleJobs(params, 'Adzuna');
        }

        try {
            const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/us/search/1`, {
                params: {
                    app_id: process.env.ADZUNA_APP_ID,
                    app_key: this.adzunaApiKey,
                    what: params.skills.join(' '),
                    where: params.location || 'Remote',
                    results_per_page: 10,
                    sort_by: 'relevance'
                }
            });

            return response.data.results.map((job: any) => ({
                id: `adzuna_${job.id}`,
                title: job.title,
                company: job.company.display_name,
                location: job.location.display_name,
                description: job.description,
                requirements: this.extractRequirements(job.description),
                salaryRange: job.salary_min && job.salary_max ? 
                    `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}` : 
                    'Not specified',
                jobType: job.contract_type || 'Full-time',
                postedDate: job.created,
                applyUrl: job.redirect_url,
                source: 'Adzuna'
            }));
        } catch (error) {
            console.error('Adzuna API error:', error);
            return [];
        }
    }

    private getSampleJobs(params: JobSearchParams, source: string = 'Sample'): JobListing[] {
        const skillsStr = params.skills.join(', ');
        
        return [
            {
                id: `${source.toLowerCase()}_1`,
                title: `Senior ${params.skills[0]} Developer`,
                company: 'Tech Innovations Inc',
                location: params.location || 'Remote',
                description: `We're looking for an experienced developer with skills in ${skillsStr}. Join our dynamic team and work on cutting-edge projects.`,
                requirements: params.skills,
                salaryRange: '$80,000 - $120,000',
                jobType: params.jobType || 'Full-time',
                postedDate: new Date().toISOString(),
                applyUrl: '#',
                source
            },
            {
                id: `${source.toLowerCase()}_2`,
                title: `${params.skills[0]} Specialist`,
                company: 'Digital Solutions LLC',
                location: params.location || 'Hybrid',
                description: `Seeking a specialist in ${skillsStr} to lead our development initiatives. Great benefits and growth opportunities.`,
                requirements: params.skills.slice(0, 3),
                salaryRange: '$70,000 - $100,000',
                jobType: 'Contract',
                postedDate: new Date(Date.now() - 86400000).toISOString(),
                applyUrl: '#',
                source
            }
        ];
    }

    private extractRequirements(description: string): string[] {
        const commonSkills = [
            'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker',
            'Git', 'TypeScript', 'HTML', 'CSS', 'MongoDB', 'PostgreSQL', 'Redis',
            'Kubernetes', 'GraphQL', 'REST API', 'Agile', 'Scrum'
        ];

        return commonSkills.filter(skill => 
            description.toLowerCase().includes(skill.toLowerCase())
        );
    }

    private removeDuplicates(jobs: JobListing[]): JobListing[] {
        const seen = new Set();
        return jobs.filter(job => {
            const key = `${job.title}_${job.company}`.toLowerCase();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    private sortByRelevance(jobs: JobListing[], params: JobSearchParams): JobListing[] {
        return jobs.sort((a, b) => {
            const aScore = this.calculateRelevanceScore(a, params);
            const bScore = this.calculateRelevanceScore(b, params);
            return bScore - aScore;
        });
    }

    private calculateRelevanceScore(job: JobListing, params: JobSearchParams): number {
        let score = 0;
        
        // Score based on skill matches
        params.skills.forEach(skill => {
            if (job.title.toLowerCase().includes(skill.toLowerCase()) ||
                job.description.toLowerCase().includes(skill.toLowerCase())) {
                score += 10;
            }
        });

        // Bonus for recent postings
        const daysSincePosted = (Date.now() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSincePosted < 7) score += 5;
        if (daysSincePosted < 3) score += 5;

        // Bonus for salary information
        if (job.salaryRange && job.salaryRange !== 'Not specified') {
            score += 3;
        }

        return score;
    }
}

export default new JobApiService();