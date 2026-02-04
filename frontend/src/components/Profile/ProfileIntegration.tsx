import React, { useState, useEffect } from 'react';
import ComprehensiveProfileDashboard from './ComprehensiveProfileDashboard';
import AccessoryCustomization from './AccessoryCustomization';
import { 
    LevelProgress, 
    SkillProgress, 
    AchievementProgress, 
    StatComparison, 
    CategoryComparison 
} from './VisualProgressIndicators';
import { 
    User, 
    Settings, 
    Download, 
    Share2, 
    Trophy, 
    Star,
    Shield,
    Zap,
    Clock,
    TrendingUp
} from 'lucide-react';

interface ProfileIntegrationProps {
    userId: string;
    onNavigate?: (section: string) => void;
}

interface ProfileData {
    id: string;
    username: string;
    email: string;
    characterData: any;
    locationData: any;
    trustScore: number;
    rwisScore: number;
    xpPoints: number;
    currentLevel: number;
    unlockedZones: string[];
    categoryStats: any;
    totalTasksCompleted: number;
    totalHoursContributed: number;
    joinDate: string;
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

const ProfileIntegration: React.FC<ProfileIntegrationProps> = ({ userId, onNavigate }) => {
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [workHistory, setWorkHistory] = useState<WorkHistoryItem[]>([]);
    const [badges, setBadges] = useState<Badge[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'dashboard' | 'customization' | 'analytics'>('dashboard');

    useEffect(() => {
        loadProfileData();
    }, [userId]);

    const loadProfileData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load profile data
            const profileResponse = await fetch(`/api/profile/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!profileResponse.ok) {
                throw new Error('Failed to load profile data');
            }

            const profileResult = await profileResponse.json();
            setProfileData(profileResult.data);

            // Load work history
            const workHistoryResponse = await fetch(`/api/profile/${userId}/work-history`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (workHistoryResponse.ok) {
                const workHistoryResult = await workHistoryResponse.json();
                setWorkHistory(workHistoryResult.data);
            }

            // Load badges
            const badgesResponse = await fetch(`/api/profile/${userId}/badges`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (badgesResponse.ok) {
                const badgesResult = await badgesResponse.json();
                setBadges(badgesResult.data.badges);
            }

            // Load analytics
            const analyticsResponse = await fetch(`/api/profile/${userId}/analytics`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (analyticsResponse.ok) {
                const analyticsResult = await analyticsResponse.json();
                setAnalytics(analyticsResult.data);
            }

        } catch (err) {
            console.error('Error loading profile data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleExportProfile = async (format: 'json' | 'pdf' | 'linkedin') => {
        try {
            const response = await fetch(`/api/profile/${userId}/export`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ format })
            });

            if (!response.ok) {
                throw new Error('Failed to export profile');
            }

            const result = await response.json();
            
            // Handle different export formats
            if (format === 'json') {
                const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `profile-${userId}.json`;
                a.click();
                URL.revokeObjectURL(url);
            } else if (format === 'linkedin') {
                // Copy LinkedIn-formatted data to clipboard
                navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
                alert('LinkedIn-formatted profile data copied to clipboard!');
            }

        } catch (err) {
            console.error('Error exporting profile:', err);
            alert('Failed to export profile');
        }
    };

    const handleAccessoryEquip = async (accessoryId: string) => {
        // Mock implementation - would integrate with backend
        console.log('Equipping accessory:', accessoryId);
    };

    const handleAccessoryUnequip = async (accessoryId: string) => {
        // Mock implementation - would integrate with backend
        console.log('Unequipping accessory:', accessoryId);
    };

    const handleSaveCustomization = async (equippedItems: string[]) => {
        // Mock implementation - would save to backend
        console.log('Saving customization:', equippedItems);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Error Loading Profile</h2>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button
                        onClick={loadProfileData}
                        className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
                    <p className="text-gray-300">The requested profile could not be found.</p>
                </div>
            </div>
        );
    }

    // Prepare data for visual components
    const skillsData = [
        { name: 'Web Development', level: 8, maxLevel: 10, xp: 1600, category: 'TECHNICAL' },
        { name: 'Project Management', level: 6, maxLevel: 10, xp: 1200, category: 'LEADERSHIP' },
        { name: 'Community Engagement', level: 7, maxLevel: 10, xp: 1400, category: 'COMMUNICATION' },
        { name: 'Data Analysis', level: 5, maxLevel: 10, xp: 1000, category: 'TECHNICAL' }
    ];

    const achievementsData = badges.map(badge => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        progress: 100, // Completed badges
        maxProgress: 100,
        icon: badge.icon,
        rarity: badge.rarity,
        isCompleted: true
    }));

    const statsData = [
        {
            label: 'Trust Score',
            current: profileData.trustScore,
            previous: profileData.trustScore - 5,
            max: 100,
            icon: <Shield className="w-5 h-5 text-green-400" />,
            color: 'green'
        },
        {
            label: 'Impact Score',
            current: profileData.rwisScore,
            previous: profileData.rwisScore - 12,
            max: 200,
            icon: <Zap className="w-5 h-5 text-blue-400" />,
            color: 'blue'
        },
        {
            label: 'Tasks Completed',
            current: profileData.totalTasksCompleted,
            previous: profileData.totalTasksCompleted - 3,
            max: 100,
            icon: <Trophy className="w-5 h-5 text-purple-400" />,
            color: 'purple'
        },
        {
            label: 'Hours Contributed',
            current: profileData.totalHoursContributed,
            previous: profileData.totalHoursContributed - 15,
            max: 500,
            icon: <Clock className="w-5 h-5 text-orange-400" />,
            color: 'orange'
        }
    ];

    const categoryData = [
        {
            name: 'Freelance',
            level: profileData.categoryStats?.freelance?.level || 1,
            xp: profileData.categoryStats?.freelance?.totalXP || 0,
            maxXP: (profileData.categoryStats?.freelance?.level || 1) * 200,
            tasksCompleted: profileData.categoryStats?.freelance?.tasksCompleted || 0,
            averageRating: profileData.categoryStats?.freelance?.averageRating || 0,
            color: 'from-blue-500 to-cyan-500',
            icon: <Star className="w-6 h-6 text-white" />
        },
        {
            name: 'Community',
            level: profileData.categoryStats?.community?.level || 1,
            xp: profileData.categoryStats?.community?.totalXP || 0,
            maxXP: (profileData.categoryStats?.community?.level || 1) * 200,
            tasksCompleted: profileData.categoryStats?.community?.tasksCompleted || 0,
            averageRating: profileData.categoryStats?.community?.averageRating || 0,
            color: 'from-green-500 to-emerald-500',
            icon: <Shield className="w-6 h-6 text-white" />
        },
        {
            name: 'Corporate',
            level: profileData.categoryStats?.corporate?.level || 1,
            xp: profileData.categoryStats?.corporate?.totalXP || 0,
            maxXP: (profileData.categoryStats?.corporate?.level || 1) * 200,
            tasksCompleted: profileData.categoryStats?.corporate?.tasksCompleted || 0,
            averageRating: profileData.categoryStats?.corporate?.averageRating || 0,
            color: 'from-purple-500 to-violet-500',
            icon: <Trophy className="w-6 h-6 text-white" />
        }
    ];

    const mockAccessories = [
        {
            id: 'crown-gold',
            name: 'Golden Crown',
            type: 'HAT' as const,
            unlockCondition: 'Reach level 10',
            equipped: false,
            unlocked: profileData.currentLevel >= 10,
            rarity: 'LEGENDARY' as const,
            category: 'ACHIEVEMENT',
            description: 'A majestic golden crown for reaching level 10',
            unlockProgress: profileData.currentLevel,
            maxProgress: 10
        },
        {
            id: 'glasses-tech',
            name: 'Tech Glasses',
            type: 'GLASSES' as const,
            unlockCondition: 'Complete 10 freelance tasks',
            equipped: true,
            unlocked: (profileData.categoryStats?.freelance?.tasksCompleted || 0) >= 10,
            rarity: 'RARE' as const,
            category: 'FREELANCE',
            description: 'Stylish glasses for tech professionals',
            unlockProgress: profileData.categoryStats?.freelance?.tasksCompleted || 0,
            maxProgress: 10
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            {/* Navigation Header */}
            <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => setActiveView('dashboard')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeView === 'dashboard'
                                        ? 'bg-purple-500/20 text-purple-400'
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <User className="w-5 h-5" />
                                <span>Dashboard</span>
                            </button>
                            <button
                                onClick={() => setActiveView('customization')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeView === 'customization'
                                        ? 'bg-purple-500/20 text-purple-400'
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Settings className="w-5 h-5" />
                                <span>Customization</span>
                            </button>
                            <button
                                onClick={() => setActiveView('analytics')}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeView === 'analytics'
                                        ? 'bg-purple-500/20 text-purple-400'
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <TrendingUp className="w-5 h-5" />
                                <span>Analytics</span>
                            </button>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => handleExportProfile('json')}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                            <button
                                onClick={() => handleExportProfile('linkedin')}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                <span>LinkedIn</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeView === 'dashboard' && (
                    <ComprehensiveProfileDashboard userId={userId} />
                )}

                {activeView === 'customization' && (
                    <AccessoryCustomization
                        accessories={mockAccessories}
                        onEquipAccessory={handleAccessoryEquip}
                        onUnequipAccessory={handleAccessoryUnequip}
                        onSaveCustomization={handleSaveCustomization}
                    />
                )}

                {activeView === 'analytics' && (
                    <div className="space-y-8">
                        {/* Level Progress */}
                        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Level Progression</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <LevelProgress
                                    currentLevel={profileData.currentLevel}
                                    currentXP={profileData.xpPoints}
                                    nextLevelXP={profileData.currentLevel * 500}
                                />
                                {categoryData.map((category) => (
                                    <LevelProgress
                                        key={category.name}
                                        currentLevel={category.level}
                                        currentXP={category.xp}
                                        nextLevelXP={category.maxXP}
                                        category={category.name.toUpperCase()}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Skills Progress */}
                        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                            <SkillProgress skills={skillsData} />
                        </div>

                        {/* Achievement Progress */}
                        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                            <AchievementProgress achievements={achievementsData} />
                        </div>

                        {/* Performance Stats */}
                        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                            <StatComparison stats={statsData} />
                        </div>

                        {/* Category Comparison */}
                        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                            <CategoryComparison categories={categoryData} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileIntegration;