import React, { useState, useEffect } from 'react';
import { 
    User, 
    Briefcase, 
    Star, 
    Trophy, 
    Target, 
    Brain,
    Sparkles,
    Download,
    Eye,
    Edit3,
    Save,
    Camera,
    MapPin,
    Calendar,
    Award,
    TrendingUp,
    Zap,
    Shield,
    Heart,
    Gamepad2,
    Rocket,
    Crown,
    Gem
} from 'lucide-react';

interface ProfileBuilderProps {
    userId: string;
    onProfileUpdate?: (profile: any) => void;
}

interface CharacterStats {
    trustScore: number;
    rwisScore: number;
    currentLevel: number;
    totalXP: number;
    unlockedZones: string[];
}

interface CategoryProgress {
    freelance: {
        tasksCompleted: number;
        totalXP: number;
        averageRating: number;
        specializations: string[];
        level: number;
    };
    community: {
        tasksCompleted: number;
        totalXP: number;
        averageRating: number;
        specializations: string[];
        level: number;
    };
    corporate: {
        tasksCompleted: number;
        totalXP: number;
        averageRating: number;
        specializations: string[];
        level: number;
    };
}

const EnhancedProfileBuilder: React.FC<ProfileBuilderProps> = ({ userId, onProfileUpdate }) => {
    const [activeTab, setActiveTab] = useState<'character' | 'career' | 'achievements' | 'ai-insights'>('character');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [aiInsights, setAiInsights] = useState<any>(null);
    const [generatingInsights, setGeneratingInsights] = useState(false);

    // Mock data - in real app, this would come from API
    const [characterStats] = useState<CharacterStats>({
        trustScore: 87,
        rwisScore: 145,
        currentLevel: 12,
        totalXP: 3450,
        unlockedZones: ['downtown', 'tech-district', 'community-hub', 'corporate-center']
    });

    const [categoryProgress] = useState<CategoryProgress>({
        freelance: {
            tasksCompleted: 23,
            totalXP: 1800,
            averageRating: 4.7,
            specializations: ['Web Development', 'UI/UX Design', 'JavaScript', 'React'],
            level: 8
        },
        community: {
            tasksCompleted: 15,
            totalXP: 1200,
            averageRating: 4.9,
            specializations: ['Event Planning', 'Tutoring', 'Environmental Projects'],
            level: 6
        },
        corporate: {
            tasksCompleted: 8,
            totalXP: 450,
            averageRating: 4.3,
            specializations: ['Data Analysis', 'Project Management'],
            level: 4
        }
    });

    const [profileData, setProfileData] = useState({
        personalInfo: {
            fullName: 'Alex Rivera',
            email: 'alex.rivera@example.com',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            linkedIn: 'linkedin.com/in/alexrivera',
            portfolio: 'alexrivera.dev',
            bio: 'Passionate developer and community contributor with a track record of delivering high-quality projects and making meaningful impact.'
        },
        careerGoals: {
            targetRole: 'Senior Full-Stack Developer',
            targetIndustry: 'Technology',
            timeframe: '6-12 months',
            salaryRange: '$90,000 - $120,000',
            workPreference: 'Remote/Hybrid'
        },
        skills: {
            technical: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
            soft: ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration'],
            learning: ['TypeScript', 'GraphQL', 'Docker', 'AWS']
        }
    });

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 1500);
    }, []);

    const generateAIInsights = async () => {
        setGeneratingInsights(true);
        try {
            // Simulate AI analysis
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            setAiInsights({
                careerRecommendations: [
                    {
                        title: 'Senior Frontend Developer',
                        company: 'TechCorp Inc.',
                        matchScore: 92,
                        reasoning: 'Your React expertise and high trust score make you an excellent fit',
                        salaryRange: '$95,000 - $125,000'
                    },
                    {
                        title: 'Full-Stack Engineer',
                        company: 'StartupXYZ',
                        matchScore: 88,
                        reasoning: 'Strong community involvement shows leadership potential',
                        salaryRange: '$85,000 - $110,000'
                    }
                ],
                skillAnalysis: {
                    strengths: ['React Development', 'Community Leadership', 'Project Delivery'],
                    gaps: ['TypeScript', 'Cloud Architecture', 'DevOps'],
                    nextSteps: ['Complete TypeScript certification', 'Build cloud-native project', 'Learn Docker/Kubernetes']
                },
                careerPath: {
                    current: 'Mid-level Developer',
                    next: 'Senior Developer (6-12 months)',
                    future: 'Tech Lead (2-3 years)',
                    ultimate: 'Engineering Manager (4-5 years)'
                }
            });
        } catch (error) {
            console.error('Failed to generate AI insights:', error);
        } finally {
            setGeneratingInsights(false);
        }
    };

    const getLevelColor = (level: number) => {
        if (level >= 10) return 'from-purple-500 to-pink-500';
        if (level >= 7) return 'from-blue-500 to-purple-500';
        if (level >= 4) return 'from-green-500 to-blue-500';
        return 'from-yellow-500 to-green-500';
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'freelance': return <Briefcase className="w-5 h-5" />;
            case 'community': return <Heart className="w-5 h-5" />;
            case 'corporate': return <Shield className="w-5 h-5" />;
            default: return <Star className="w-5 h-5" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-32 h-32 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                        <Gamepad2 className="w-12 h-12 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-6">Loading Your Profile</h2>
                    <p className="text-purple-300 mt-2">Preparing your career adventure...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            {/* Header */}
            <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-4 border-white/20">
                                    <Crown className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                    <span className="text-xs font-bold text-white">{characterStats.currentLevel}</span>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{profileData.personalInfo.fullName}</h1>
                                <p className="text-purple-300">Level {characterStats.currentLevel} Career Adventurer</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-center">
                                <div className="text-xl font-bold text-green-400">{characterStats.trustScore}</div>
                                <div className="text-xs text-gray-300">Trust</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-blue-400">{characterStats.rwisScore}</div>
                                <div className="text-xs text-gray-300">Impact</div>
                            </div>
                            <div className="text-center">
                                <div className="text-xl font-bold text-purple-400">{characterStats.totalXP}</div>
                                <div className="text-xs text-gray-300">XP</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-2 mb-8">
                    <div className="flex space-x-2">
                        {[
                            { id: 'character', label: 'Character Profile', icon: User },
                            { id: 'career', label: 'Career Builder', icon: Briefcase },
                            { id: 'achievements', label: 'Achievements', icon: Trophy },
                            { id: 'ai-insights', label: 'AI Insights', icon: Brain }
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                                    activeTab === id
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-8">
                    {activeTab === 'character' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Character Avatar & Stats */}
                            <div className="lg:col-span-1">
                                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                                    <div className="text-center mb-6">
                                        <div className="relative inline-block">
                                            <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-4 border-white/20 mb-4">
                                                <User className="w-16 h-16 text-white" />
                                            </div>
                                            <button className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                                                <Camera className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">{profileData.personalInfo.fullName}</h3>
                                        <p className="text-purple-300">Career Level {characterStats.currentLevel}</p>
                                    </div>

                                    {/* XP Progress */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm text-gray-300 mb-2">
                                            <span>XP Progress</span>
                                            <span>{characterStats.totalXP} / {(characterStats.currentLevel + 1) * 500}</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-3">
                                            <div 
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${(characterStats.totalXP % 500) / 5}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-green-500/20 rounded-xl p-3 text-center">
                                            <Shield className="w-6 h-6 text-green-400 mx-auto mb-1" />
                                            <div className="text-lg font-bold text-green-400">{characterStats.trustScore}</div>
                                            <div className="text-xs text-gray-300">Trust Score</div>
                                        </div>
                                        <div className="bg-blue-500/20 rounded-xl p-3 text-center">
                                            <Zap className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                                            <div className="text-lg font-bold text-blue-400">{characterStats.rwisScore}</div>
                                            <div className="text-xs text-gray-300">Impact Score</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="lg:col-span-2">
                                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-white">Personal Information</h3>
                                        <button
                                            onClick={() => setIsEditing(!isEditing)}
                                            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors"
                                        >
                                            {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                                            <span>{isEditing ? 'Save' : 'Edit'}</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={profileData.personalInfo.fullName}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={profileData.personalInfo.email}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                value={profileData.personalInfo.phone}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                                            <input
                                                type="text"
                                                value={profileData.personalInfo.location}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                                            <input
                                                type="url"
                                                value={profileData.personalInfo.linkedIn}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio</label>
                                            <input
                                                type="url"
                                                value={profileData.personalInfo.portfolio}
                                                disabled={!isEditing}
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                                        <textarea
                                            value={profileData.personalInfo.bio}
                                            disabled={!isEditing}
                                            rows={4}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'career' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Career Goals */}
                            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                    <Target className="w-6 h-6 mr-2 text-purple-400" />
                                    Career Goals
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Target Role</label>
                                        <input
                                            type="text"
                                            value={profileData.careerGoals.targetRole}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Target Industry</label>
                                        <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                            <option value="Technology">Technology</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Education">Education</option>
                                            <option value="Non-profit">Non-profit</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Timeframe</label>
                                        <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                                            <option value="3-6 months">3-6 months</option>
                                            <option value="6-12 months">6-12 months</option>
                                            <option value="1-2 years">1-2 years</option>
                                            <option value="2+ years">2+ years</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Salary Range</label>
                                        <input
                                            type="text"
                                            value={profileData.careerGoals.salaryRange}
                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                    <Sparkles className="w-6 h-6 mr-2 text-yellow-400" />
                                    Skills & Expertise
                                </h3>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-300 mb-3">Technical Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {profileData.skills.technical.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-300 mb-3">Soft Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {profileData.skills.soft.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-300 mb-3">Currently Learning</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {profileData.skills.learning.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Category Progress */}
                            {Object.entries(categoryProgress).map(([category, progress]) => (
                                <div key={category} className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 bg-gradient-to-r ${getLevelColor(progress.level)} rounded-full flex items-center justify-center`}>
                                                {getCategoryIcon(category)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white capitalize">{category}</h3>
                                                <p className="text-sm text-gray-300">Level {progress.level}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-white">{progress.tasksCompleted}</div>
                                            <div className="text-xs text-gray-300">Tasks</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-300">XP Earned</span>
                                            <span className="text-white font-medium">{progress.totalXP}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-300">Avg Rating</span>
                                            <div className="flex items-center space-x-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-white font-medium">{progress.averageRating}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-300 mb-2">Specializations</div>
                                            <div className="flex flex-wrap gap-1">
                                                {progress.specializations.map((spec: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 bg-white/10 text-xs rounded text-gray-300"
                                                    >
                                                        {spec}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'ai-insights' && (
                        <div className="space-y-8">
                            {!aiInsights ? (
                                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
                                    <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-white mb-4">AI Career Analysis</h3>
                                    <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                                        Get personalized career insights powered by Gemini AI. Discover job opportunities, 
                                        skill gaps, and career paths tailored to your Good Grid profile.
                                    </p>
                                    <button
                                        onClick={generateAIInsights}
                                        disabled={generatingInsights}
                                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 flex items-center space-x-2 mx-auto"
                                    >
                                        {generatingInsights ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span>Analyzing Your Profile...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Rocket className="w-5 h-5" />
                                                <span>Generate AI Insights</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Job Recommendations */}
                                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                            <Briefcase className="w-6 h-6 mr-2 text-blue-400" />
                                            Job Recommendations
                                        </h3>
                                        <div className="space-y-4">
                                            {aiInsights.careerRecommendations.map((job: any, index: number) => (
                                                <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-semibold text-white">{job.title}</h4>
                                                            <p className="text-gray-300 text-sm">{job.company}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-green-400 font-bold">{job.matchScore}%</div>
                                                            <div className="text-xs text-gray-400">Match</div>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-300 text-sm mb-2">{job.reasoning}</p>
                                                    <div className="text-purple-300 text-sm font-medium">{job.salaryRange}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Skill Analysis */}
                                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                            <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
                                            Skill Analysis
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-green-300 mb-2">Strengths</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {aiInsights.skillAnalysis.strengths.map((strength: string, index: number) => (
                                                        <span key={index} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">
                                                            {strength}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-red-300 mb-2">Skill Gaps</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {aiInsights.skillAnalysis.gaps.map((gap: string, index: number) => (
                                                        <span key={index} className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-sm">
                                                            {gap}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-blue-300 mb-2">Next Steps</h4>
                                                <ul className="space-y-1">
                                                    {aiInsights.skillAnalysis.nextSteps.map((step: string, index: number) => (
                                                        <li key={index} className="text-gray-300 text-sm flex items-start">
                                                            <span className="text-blue-400 mr-2">•</span>
                                                            {step}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Career Path */}
                                    <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                                            <Award className="w-6 h-6 mr-2 text-yellow-400" />
                                            Career Progression Path
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            {Object.entries(aiInsights.careerPath).map(([key, value], index) => (
                                                <div key={key} className="flex items-center">
                                                    <div className="text-center">
                                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                                                            key === 'current' ? 'bg-green-500' : 'bg-gray-600'
                                                        }`}>
                                                            <Gem className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div className="text-sm text-white font-medium">{value as string}</div>
                                                        <div className="text-xs text-gray-400 capitalize">{key}</div>
                                                    </div>
                                                    {index < Object.entries(aiInsights.careerPath).length - 1 && (
                                                        <div className="w-16 h-0.5 bg-gray-600 mx-4"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnhancedProfileBuilder;