import React, { useState } from 'react';
import { 
    Briefcase, 
    Star, 
    Zap,
    Shield,
    Heart,
    TrendingUp,
    Search,
    Download,
    ExternalLink,
    Award,
    FileText,
    User
} from 'lucide-react';
import './RetroGameProfileDashboard.css';
import RealResumeBuilder from './RealResumeBuilder';

interface ComprehensiveProfileDashboardProps {
    userId: string;
}

interface WorkHistoryItem {
    id: string;
    title: string;
    category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
    organization: string;
    description: string;
    completionDate: string;
    duration: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'VERIFIED';
    qualityScore: number;
    rating: number;
    xpEarned: number;
    trustScoreChange: number;
    rwisEarned: number;
    skills: string[];
    clientFeedback?: string;
    impact?: string;
    clientOrganization: string;
    projectType: string;
    deliverables: string[];
    challenges: string[];
    achievements: string[];
}

interface CategoryStats {
    tasksCompleted: number;
    totalXP: number;
    averageRating: number;
    specializations: string[];
    level: number;
    trustScore: number;
    totalEarnings?: number;
    impactScore: number;
    nextLevelXP: number;
    badges: Badge[];
}

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    category: string;
    earnedDate: string;
    requirements: string;
}

const ComprehensiveProfileDashboard: React.FC<ComprehensiveProfileDashboardProps> = ({ userId }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'work-history' | 'achievements' | 'analytics' | 'resume-builder'>('overview');
    const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'FREELANCE' | 'COMMUNITY' | 'CORPORATE'>('ALL');
    const [workHistoryFilter, setWorkHistoryFilter] = useState('');
    const [selectedWorkItem, setSelectedWorkItem] = useState<WorkHistoryItem | null>(null);

    // Mock data - in real app, this would come from API
    const [userStats] = useState({
        trustScore: 87,
        rwisScore: 145,
        currentLevel: 12,
        totalXP: 3450,
        unlockedZones: ['downtown', 'tech-district', 'community-hub', 'corporate-center'],
        totalTasksCompleted: 46,
        totalHoursContributed: 234,
        joinDate: '2023-06-15'
    });

    const [categoryStats] = useState<Record<string, CategoryStats>>({
        FREELANCE: {
            tasksCompleted: 23,
            totalXP: 1800,
            averageRating: 4.7,
            specializations: ['Web Development', 'UI/UX Design', 'JavaScript', 'React'],
            trustScore: 92,
            totalEarnings: 15750,
            impactScore: 85,
            level: 8,
            nextLevelXP: 2000,
            badges: [
                { id: 'web-master', name: 'Web Master', description: 'Complete 20 web development projects', icon: '💻', rarity: 'RARE', category: 'FREELANCE', earnedDate: '2024-01-15', requirements: '20 web projects' }
            ]
        },
        COMMUNITY: {
            tasksCompleted: 15,
            totalXP: 1200,
            averageRating: 4.9,
            specializations: ['Event Planning', 'Tutoring', 'Environmental Projects'],
            trustScore: 95,
            impactScore: 120,
            level: 6,
            nextLevelXP: 1500,
            badges: [
                { id: 'community-champion', name: 'Community Champion', description: 'Complete 10 community service projects', icon: '🏆', rarity: 'RARE', category: 'COMMUNITY', earnedDate: '2024-01-10', requirements: '10 community projects' }
            ]
        },
        CORPORATE: {
            tasksCompleted: 8,
            totalXP: 450,
            averageRating: 4.3,
            specializations: ['Data Analysis', 'Project Management'],
            trustScore: 78,
            impactScore: 65,
            level: 4,
            nextLevelXP: 800,
            badges: [
                { id: 'data-analyst', name: 'Data Analyst', description: 'Complete 5 data analysis projects', icon: '📊', rarity: 'COMMON', category: 'CORPORATE', earnedDate: '2023-11-20', requirements: '5 data projects' }
            ]
        }
    });

    const [workHistory] = useState<WorkHistoryItem[]>([
        {
            id: '1',
            title: 'E-commerce Website Development',
            category: 'FREELANCE',
            organization: 'TechStart Solutions',
            description: 'Built a full-stack e-commerce platform with React, Node.js, and PostgreSQL',
            completionDate: '2024-01-20',
            duration: '6 weeks',
            status: 'VERIFIED',
            qualityScore: 5,
            rating: 5,
            skills: ['React', 'Node.js', 'PostgreSQL', 'Stripe API', 'AWS'],
            impact: 'Increased client sales by 40% within first month',
            clientFeedback: 'Exceptional work! Alex delivered beyond expectations and provided excellent support.',
            xpEarned: 150,
            trustScoreChange: 5,
            rwisEarned: 25,
            clientOrganization: 'TechStart Solutions',
            projectType: 'Web Development',
            deliverables: ['Responsive website', 'Admin dashboard', 'Payment integration', 'Documentation'],
            challenges: ['Complex inventory management', 'Payment gateway integration', 'Mobile optimization'],
            achievements: ['Delivered 1 week early', 'Zero critical bugs', 'Client referral received']
        }
    ]);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'FREELANCE': return <Briefcase className="w-5 h-5 text-blue-400" />;
            case 'COMMUNITY': return <Heart className="w-5 h-5 text-green-400" />;
            case 'CORPORATE': return <Shield className="w-5 h-5 text-purple-400" />;
            default: return <Star className="w-5 h-5" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'FREELANCE': return 'from-blue-500 to-cyan-500';
            case 'COMMUNITY': return 'from-green-500 to-emerald-500';
            case 'CORPORATE': return 'from-purple-500 to-violet-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const filteredWorkHistory = workHistory
        .filter(item => selectedCategory === 'ALL' || item.category === selectedCategory)
        .filter(item => item.title.toLowerCase().includes(workHistoryFilter.toLowerCase()));

    const getOverallProgress = () => {
        const totalXP = Object.values(categoryStats).reduce((sum, stats) => sum + stats.totalXP, 0);
        const nextLevelXP = userStats.currentLevel * 500;
        return Math.min(100, (totalXP / nextLevelXP) * 100);
    };

    const getAllBadges = () => {
        return Object.values(categoryStats).flatMap(stats => stats.badges);
    };

    return (
        <div className="retro-profile-dashboard">
            {/* Animated Gaming Background */}
            <div className="game-background">
                <div className="stars-layer"></div>
                <div className="nebula-layer"></div>
                <div className="particles-layer"></div>
            </div>
            
            {/* Floating Gaming Elements */}
            <div className="floating-coins">
                <div className="coin coin-1">🪙</div>
                <div className="coin coin-2">💎</div>
                <div className="coin coin-3">⭐</div>
            </div>

            <div className="dashboard-content">
                {/* Retro Gaming Character Header */}
                <div className="character-header">
                    <div className="character-portrait">
                        <div className="pixel-character">
                            <div className="character-sprite"></div>
                        </div>
                        <div className="level-badge">LV.{userStats.currentLevel}</div>
                    </div>
                    
                    <div className="character-info">
                        <h1 className="character-name">HERO PROFILE</h1>
                        <div className="character-title">Elite Community Contributor</div>
                        
                        <div className="xp-container">
                            <div className="xp-label">Experience Points</div>
                            <div className="xp-bar">
                                <div 
                                    className="xp-fill" 
                                    style={{ width: `${getOverallProgress()}%` }}
                                ></div>
                                <div className="xp-text">{userStats.totalXP} / {userStats.currentLevel * 500} XP</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="stats-panel">
                        <div className="stat-item trust-score">
                            <div className="stat-icon">🛡️</div>
                            <div>
                                <div className="stat-value">{userStats.trustScore}</div>
                                <div className="stat-label">Trust Score</div>
                            </div>
                        </div>
                        <div className="stat-item rwis-score">
                            <div className="stat-icon">⚡</div>
                            <div>
                                <div className="stat-value">{userStats.rwisScore}</div>
                                <div className="stat-label">Impact Score</div>
                            </div>
                        </div>
                        <div className="stat-item total-tasks">
                            <div className="stat-icon">⚔️</div>
                            <div>
                                <div className="stat-value">{userStats.totalTasksCompleted}</div>
                                <div className="stat-label">Quests Done</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Retro Gaming Navigation Tabs */}
                <div className="game-tabs">
                    {[
                        { id: 'overview', label: 'STATS', icon: '📊' },
                        { id: 'work-history', label: 'QUESTS', icon: '⚔️' },
                        { id: 'achievements', label: 'TROPHIES', icon: '🏆' },
                        { id: 'analytics', label: 'INSIGHTS', icon: '📈' },
                        { id: 'resume-builder', label: 'RESUME', icon: '📄' }
                    ].map(({ id, label, icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as any)}
                            className={`tab-button ${activeTab === id ? 'active' : ''}`}
                        >
                            <span className="tab-icon">{icon}</span>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Tab Content with Retro Gaming Style */}
                <div className="tab-content">
                    {activeTab === 'overview' && (
                        <div className="guild-sections">
                            {/* Freelance Guild */}
                            <div className="guild-card freelance">
                                <div className="guild-header">
                                    <h3>🏢 FREELANCE GUILD</h3>
                                    <div className="guild-level">LV.{categoryStats.FREELANCE.level}</div>
                                </div>
                                <div className="guild-stats">
                                    <div className="guild-stat">
                                        <span>Quests Completed:</span>
                                        <span>{categoryStats.FREELANCE.tasksCompleted}</span>
                                    </div>
                                    <div className="guild-stat">
                                        <span>Total XP:</span>
                                        <span>{categoryStats.FREELANCE.totalXP}</span>
                                    </div>
                                    <div className="guild-stat">
                                        <span>Rating:</span>
                                        <span>⭐ {categoryStats.FREELANCE.averageRating}</span>
                                    </div>
                                    <div className="guild-stat">
                                        <span>Trust Score:</span>
                                        <span>🛡️ {categoryStats.FREELANCE.trustScore}</span>
                                    </div>
                                    <div className="guild-stat">
                                        <span>Earnings:</span>
                                        <span>💰 ${categoryStats.FREELANCE.totalEarnings}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Community Guild */}
                            <div className="guild-card community">
                                <div className="guild-header">
                                    <h3>🌱 COMMUNITY GUILD</h3>
                                    <div className="guild-level">LV.{categoryStats.COMMUNITY.level}</div>
                                </div>
                                <div className="guild-stats">
                                    <div className="guild-stat">
                                        <span>Quests Completed:</span>
                                        <span>{categoryStats.COMMUNITY.tasksCompleted}</span>
                                    </div>
                                    <div className="guild-stat">
                                        <span>Total XP:</span>
                                        <span>{categoryStats.COMMUNITY.totalXP}</span>
                                    </div>
                                    <div className="guild-stat">
                                        <span>Rating:</span>
                                        <span>⭐ {categoryStats.COMMUNITY.averageRating}</span>
                                    </div>
                                    <div className="guild-stat">
                                        <span>Trust Score:</span>
                                        <span>🛡️ {categoryStats.COMMUNITY.trustScore}</span>
                                    </div>
                                    <div className="guild-stat">
                                        <span>Impact Score:</span>
                                        <span>⚡ {categoryStats.COMMUNITY.impactScore}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Corporate Guild */}
                            <div className="guild-card corporate">
                                <div className="guild-header">
                                    <h3>🏰 CORPORATE GUILD</h3>
                                    <div className="guild-level">LV.{categoryStats.CORPORATE.level}</div>
                                </div>
                                <div className="guild-stats">
                                    <div className="guild-stat">
                                        <span>Quests Completed:</span>
                                        <span>{categoryStats.CORPORATE.tasksCompleted}</span>
                                    </div>
                                    <div className="guild-stat">
                                        <span>Total XP:</span>
                                        <span>{categoryStats.CORPORATE.totalXP}</span>
                                    </div>
                                    <div className="guild-stat">
                                        <span>Rating:</span>
                                        <span>⭐ {categoryStats.CORPORATE.averageRating}</span>
                                    </div>
                                    <div className="guild-stat">
                                        <span>Trust Score:</span>
                                        <span>🛡️ {categoryStats.CORPORATE.trustScore}</span>
                                    </div>
                                    <div className="guild-stat">
                                        <span>Impact Score:</span>
                                        <span>⚡ {categoryStats.CORPORATE.impactScore}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'work-history' && (
                        <div className="quest-log">
                            {/* Filter Controls */}
                            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-black/30 border border-white/50">
                                <div className="flex items-center gap-2">
                                    <Search className="w-4 h-4 text-white" />
                                    <input
                                        type="text"
                                        placeholder="Search quests..."
                                        value={workHistoryFilter}
                                        onChange={(e) => setWorkHistoryFilter(e.target.value)}
                                        className="bg-black/50 border border-white/30 text-white px-3 py-2 font-mono text-sm"
                                    />
                                </div>
                                
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                                    className="bg-black/50 border border-white/30 text-white px-3 py-2 font-mono text-sm"
                                >
                                    <option value="ALL">🌟 ALL GUILDS</option>
                                    <option value="FREELANCE">🏢 FREELANCE</option>
                                    <option value="COMMUNITY">🌱 COMMUNITY</option>
                                    <option value="CORPORATE">🏛️ CORPORATE</option>
                                </select>
                            </div>

                            {/* Quest Entries */}
                            {filteredWorkHistory.map((quest) => (
                                <div key={quest.id} className="quest-entry" onClick={() => setSelectedWorkItem(quest)}>
                                    <div className={`quest-icon ${quest.category.toLowerCase()}`}>
                                        {getCategoryIcon(quest.category)}
                                    </div>
                                    
                                    <div className="quest-details">
                                        <h3 className="quest-title">{quest.title}</h3>
                                        <div className="quest-meta">
                                            <span className="quest-date">{new Date(quest.completionDate).toLocaleDateString()}</span>
                                            <span className={`difficulty-badge ${quest.qualityScore >= 5 ? 'expert' : quest.qualityScore >= 4 ? 'advanced' : quest.qualityScore >= 3 ? 'intermediate' : 'beginner'}`}>
                                                {quest.qualityScore >= 5 ? 'LEGENDARY' : quest.qualityScore >= 4 ? 'EPIC' : quest.qualityScore >= 3 ? 'RARE' : 'COMMON'}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < quest.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-300 text-sm mt-2">{quest.description}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {quest.skills.slice(0, 3).map((skill) => (
                                                <span key={skill} className="px-2 py-1 bg-white/10 border border-white/30 text-xs font-mono">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="quest-rewards">
                                        <div className="reward-item">
                                            <Zap className="reward-icon text-yellow-400" />
                                            <span>{quest.xpEarned} XP</span>
                                        </div>
                                        <div className="reward-item">
                                            <TrendingUp className="reward-icon text-green-400" />
                                            <span>+{quest.trustScoreChange} Trust</span>
                                        </div>
                                        <div className="reward-item">
                                            <Heart className="reward-icon text-red-400" />
                                            <span>{quest.rwisEarned} Impact</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'achievements' && (
                        <div className="badges-grid">
                            {getAllBadges().map((badge) => (
                                <div key={badge.id} className={`badge-card ${badge.rarity.toLowerCase()}`}>
                                    <div className="badge-icon">{badge.icon}</div>
                                    <div className="badge-name">{badge.name}</div>
                                    <div className="badge-description">{badge.description}</div>
                                    <div className={`badge-category ${badge.category.toLowerCase()}`}>
                                        {badge.category}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2">
                                        Earned: {new Date(badge.earnedDate).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'analytics' && (
                        <div className="analytics-dashboard">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Progress Charts */}
                                <div className="progress-section">
                                    <h3 className="text-2xl font-bold text-white font-mono mb-6">📊 PROGRESS ANALYTICS</h3>
                                    
                                    {/* Category Progress Bars */}
                                    {Object.entries(categoryStats).map(([category, stats]) => (
                                        <div key={category} className="mb-6">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-white font-mono">{category} GUILD</span>
                                                <span className="text-sm text-gray-300">LV.{stats.level}</span>
                                            </div>
                                            <div className="w-full bg-black/50 border border-white/30 h-6 relative">
                                                <div 
                                                    className={`h-full bg-gradient-to-r ${getCategoryColor(category)} transition-all duration-500`}
                                                    style={{ width: `${Math.min(100, (stats.totalXP / stats.nextLevelXP) * 100)}%` }}
                                                ></div>
                                                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-mono">
                                                    {stats.totalXP} / {stats.nextLevelXP} XP
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Export Options */}
                                <div className="export-section">
                                    <h3 className="text-2xl font-bold text-white font-mono mb-6">📄 EXPORT PROFILE</h3>
                                    <div className="space-y-4">
                                        <button 
                                            onClick={() => setActiveTab('resume-builder')}
                                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-white text-white font-mono py-3 px-6 hover:scale-105 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FileText className="w-4 h-4" />
                                            BUILD PROFESSIONAL RESUME
                                        </button>
                                        <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 border-2 border-white text-white font-mono py-3 px-6 hover:scale-105 transition-all flex items-center justify-center gap-2">
                                            <ExternalLink className="w-4 h-4" />
                                            LINKEDIN EXPORT
                                        </button>
                                        <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-white text-white font-mono py-3 px-6 hover:scale-105 transition-all flex items-center justify-center gap-2">
                                            <Award className="w-4 h-4" />
                                            CERTIFICATE GENERATOR
                                        </button>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="mt-8 space-y-4">
                                        <div className="bg-black/30 border border-white/30 p-4">
                                            <div className="text-white font-mono text-sm">TOTAL CONTRIBUTION TIME</div>
                                            <div className="text-2xl font-bold text-green-400">{userStats.totalHoursContributed}h</div>
                                        </div>
                                        <div className="bg-black/30 border border-white/30 p-4">
                                            <div className="text-white font-mono text-sm">MEMBER SINCE</div>
                                            <div className="text-2xl font-bold text-blue-400">{new Date(userStats.joinDate).toLocaleDateString()}</div>
                                        </div>
                                        <div className="bg-black/30 border border-white/30 p-4">
                                            <div className="text-white font-mono text-sm">ZONES UNLOCKED</div>
                                            <div className="text-2xl font-bold text-purple-400">{userStats.unlockedZones.length}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'resume-builder' && (
                        <div className="resume-builder-container">
                            <RealResumeBuilder userId={userId} />
                        </div>
                    )}
                </div>

                {/* Quest Detail Modal */}
                {selectedWorkItem && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                        <div className="bg-gradient-to-br from-gray-900 to-purple-900 border-2 border-white max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <h2 className="text-2xl font-bold text-white font-mono">{selectedWorkItem.title}</h2>
                                    <button 
                                        onClick={() => setSelectedWorkItem(null)}
                                        className="text-white hover:text-red-400 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-white font-mono font-bold mb-2">📋 QUEST DETAILS</h3>
                                        <p className="text-gray-300">{selectedWorkItem.description}</p>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-white font-mono font-bold mb-2">🏢 CLIENT</h3>
                                        <p className="text-gray-300">{selectedWorkItem.clientOrganization}</p>
                                    </div>
                                    
                                    {selectedWorkItem.clientFeedback && (
                                        <div>
                                            <h3 className="text-white font-mono font-bold mb-2">💬 CLIENT FEEDBACK</h3>
                                            <p className="text-gray-300 italic">"{selectedWorkItem.clientFeedback}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComprehensiveProfileDashboard;