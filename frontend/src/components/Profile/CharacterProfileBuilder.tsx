import React, { useState, useEffect } from 'react';
import { 
    User, 
    Briefcase, 
    Star, 
    Trophy, 
    Target, 
    Zap,
    Download,
    Eye,
    Edit3,
    Sparkles,
    Brain,
    TrendingUp,
    Award,
    MapPin,
    Calendar,
    ExternalLink,
    ChevronRight,
    Palette,
    Settings,
    Crown,
    Shield,
    Heart,
    Rocket,
    Gem,
    Camera,
    Save,
    Wand2
} from 'lucide-react';

interface CharacterProfileBuilderProps {
    userId: string;
}

interface CharacterData {
    baseSprite: string;
    colorPalette: {
        primary: string;
        secondary: string;
        accent: string;
    };
    accessories: AccessoryItem[];
    unlockedItems: UnlockableItem[];
}

interface AccessoryItem {
    id: string;
    name: string;
    type: 'HAT' | 'GLASSES' | 'CLOTHING' | 'TOOL' | 'BADGE_DISPLAY';
    unlockCondition: string;
    equipped: boolean;
}

interface UnlockableItem {
    id: string;
    name: string;
    category: string;
    unlocked: boolean;
    unlockRequirement: string;
}

interface UserStats {
    trustScore: number;
    rwisScore: number;
    currentLevel: number;
    totalXP: number;
    categoryStats: {
        freelance: CategoryStats;
        community: CategoryStats;
        corporate: CategoryStats;
    };
}

interface CategoryStats {
    tasksCompleted: number;
    totalXP: number;
    averageRating: number;
    specializations: string[];
}

const CharacterProfileBuilder: React.FC<CharacterProfileBuilderProps> = ({ userId }) => {
    const [activeTab, setActiveTab] = useState<'appearance' | 'stats' | 'achievements' | 'career'>('appearance');
    const [characterData, setCharacterData] = useState<CharacterData>({
        baseSprite: 'DEFAULT',
        colorPalette: {
            primary: '#3B82F6',
            secondary: '#8B5CF6',
            accent: '#10B981'
        },
        accessories: [],
        unlockedItems: []
    });
    
    const [userStats] = useState<UserStats>({
        trustScore: 87,
        rwisScore: 145,
        currentLevel: 12,
        totalXP: 3450,
        categoryStats: {
            freelance: {
                tasksCompleted: 23,
                totalXP: 1800,
                averageRating: 4.7,
                specializations: ['Web Development', 'UI/UX Design']
            },
            community: {
                tasksCompleted: 15,
                totalXP: 1200,
                averageRating: 4.9,
                specializations: ['Event Planning', 'Environmental Projects']
            },
            corporate: {
                tasksCompleted: 8,
                totalXP: 450,
                averageRating: 4.3,
                specializations: ['Data Analysis', 'Project Management']
            }
        }
    });

    const [isEditing, setIsEditing] = useState(false);
    const [selectedSprite, setSelectedSprite] = useState('DEFAULT');
    const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

    const spriteOptions = [
        { id: 'DEFAULT', name: 'Classic Hero', preview: '🧙‍♂️' },
        { id: 'CASUAL', name: 'Casual Explorer', preview: '👤' },
        { id: 'PROFESSIONAL', name: 'Business Pro', preview: '👔' },
        { id: 'CREATIVE', name: 'Creative Artist', preview: '🎨' },
        { id: 'TECH', name: 'Tech Wizard', preview: '💻' },
        { id: 'COMMUNITY', name: 'Community Leader', preview: '🤝' }
    ];

    const colorPalettes = [
        { name: 'Ocean Blue', primary: '#3B82F6', secondary: '#06B6D4', accent: '#10B981' },
        { name: 'Purple Magic', primary: '#8B5CF6', secondary: '#A855F7', accent: '#EC4899' },
        { name: 'Forest Green', primary: '#10B981', secondary: '#059669', accent: '#F59E0B' },
        { name: 'Sunset Orange', primary: '#F97316', secondary: '#EF4444', accent: '#FBBF24' },
        { name: 'Royal Purple', primary: '#7C3AED', secondary: '#9333EA', accent: '#F472B6' },
        { name: 'Cyber Neon', primary: '#06B6D4', secondary: '#8B5CF6', accent: '#10B981' }
    ];

    const availableAccessories: AccessoryItem[] = [
        { id: 'crown', name: 'Leadership Crown', type: 'HAT', unlockCondition: 'Complete 10 community tasks', equipped: false },
        { id: 'glasses', name: 'Tech Glasses', type: 'GLASSES', unlockCondition: 'Complete 5 freelance tasks', equipped: false },
        { id: 'cape', name: 'Hero Cape', type: 'CLOTHING', unlockCondition: 'Reach Trust Score 50', equipped: false },
        { id: 'badge', name: 'Impact Badge', type: 'BADGE_DISPLAY', unlockCondition: 'Earn 100 RWIS points', equipped: false },
        { id: 'tool', name: 'Multi-Tool', type: 'TOOL', unlockCondition: 'Complete tasks in all categories', equipped: false }
    ];

    const handleColorPaletteChange = (palette: any) => {
        setCharacterData(prev => ({
            ...prev,
            colorPalette: palette
        }));
    };

    const handleAccessoryToggle = (accessoryId: string) => {
        setSelectedAccessories(prev => 
            prev.includes(accessoryId) 
                ? prev.filter(id => id !== accessoryId)
                : [...prev, accessoryId]
        );
    };

    const handleSaveCharacter = () => {
        // Save character data
        console.log('Saving character:', characterData);
        setIsEditing(false);
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'freelance': return <Briefcase className="w-5 h-5 text-blue-400" />;
            case 'community': return <Heart className="w-5 h-5 text-green-400" />;
            case 'corporate': return <Shield className="w-5 h-5 text-purple-400" />;
            default: return <Star className="w-5 h-5" />;
        }
    };

    const getXPProgress = () => {
        const currentLevelXP = userStats.currentLevel * 500;
        const nextLevelXP = (userStats.currentLevel + 1) * 500;
        const progress = ((userStats.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
        return Math.max(0, Math.min(100, progress));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            {/* Header */}
            <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div 
                                    className="w-20 h-20 rounded-full flex items-center justify-center border-4 border-white/20 text-4xl"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${characterData.colorPalette.primary}, ${characterData.colorPalette.secondary})` 
                                    }}
                                >
                                    {spriteOptions.find(s => s.id === selectedSprite)?.preview || '🧙‍♂️'}
                                </div>
                                <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-white">
                                    <span className="text-sm font-bold text-white">{userStats.currentLevel}</span>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Character Profile</h1>
                                <p className="text-purple-300">Level {userStats.currentLevel} • {userStats.totalXP} XP</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-1">
                                    <Shield className="w-6 h-6 text-green-400" />
                                </div>
                                <div className="text-lg font-bold text-green-400">{userStats.trustScore}</div>
                                <div className="text-xs text-gray-300">Trust</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-1">
                                    <Zap className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="text-lg font-bold text-blue-400">{userStats.rwisScore}</div>
                                <div className="text-xs text-gray-300">Impact</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Navigation Tabs */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-2 mb-8">
                    <div className="flex space-x-2">
                        {[
                            { id: 'appearance', label: 'Appearance', icon: Palette },
                            { id: 'stats', label: 'Statistics', icon: TrendingUp },
                            { id: 'achievements', label: 'Achievements', icon: Trophy },
                            { id: 'career', label: 'Career Path', icon: Target }
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
                {activeTab === 'appearance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Character Preview */}
                        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Character Preview</h2>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors"
                                >
                                    {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                                    <span>{isEditing ? 'Save' : 'Edit'}</span>
                                </button>
                            </div>

                            <div className="text-center mb-8">
                                <div 
                                    className="w-48 h-48 mx-auto rounded-full flex items-center justify-center border-4 border-white/20 text-8xl mb-4"
                                    style={{ 
                                        background: `linear-gradient(135deg, ${characterData.colorPalette.primary}, ${characterData.colorPalette.secondary})` 
                                    }}
                                >
                                    {spriteOptions.find(s => s.id === selectedSprite)?.preview || '🧙‍♂️'}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {spriteOptions.find(s => s.id === selectedSprite)?.name}
                                </h3>
                                <p className="text-purple-300">Level {userStats.currentLevel} Character</p>
                            </div>

                            {/* XP Progress */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm text-gray-300 mb-2">
                                    <span>Level Progress</span>
                                    <span>{userStats.totalXP} / {(userStats.currentLevel + 1) * 500} XP</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-4">
                                    <div 
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                        style={{ width: `${getXPProgress()}%` }}
                                    >
                                        <Sparkles className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Equipped Accessories */}
                            <div>
                                <h4 className="text-lg font-semibold text-white mb-3">Equipped Items</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedAccessories.length > 0 ? (
                                        selectedAccessories.map(accessoryId => {
                                            const accessory = availableAccessories.find(a => a.id === accessoryId);
                                            return accessory ? (
                                                <div key={accessoryId} className="bg-white/10 rounded-lg p-3 text-center">
                                                    <div className="text-2xl mb-1">
                                                        {accessory.type === 'HAT' && '👑'}
                                                        {accessory.type === 'GLASSES' && '🤓'}
                                                        {accessory.type === 'CLOTHING' && '🦸'}
                                                        {accessory.type === 'BADGE_DISPLAY' && '🏆'}
                                                        {accessory.type === 'TOOL' && '🔧'}
                                                    </div>
                                                    <div className="text-sm text-white font-medium">{accessory.name}</div>
                                                </div>
                                            ) : null;
                                        })
                                    ) : (
                                        <div className="col-span-2 text-center text-gray-400 py-8">
                                            No accessories equipped
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Customization Panel */}
                        <div className="space-y-6">
                            {/* Sprite Selection */}
                            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Character Style</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {spriteOptions.map((sprite) => (
                                        <button
                                            key={sprite.id}
                                            onClick={() => setSelectedSprite(sprite.id)}
                                            disabled={!isEditing}
                                            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                                selectedSprite === sprite.id
                                                    ? 'border-purple-500 bg-purple-500/20'
                                                    : 'border-gray-600 hover:border-gray-500'
                                            } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="text-3xl mb-2">{sprite.preview}</div>
                                            <div className="text-sm text-white font-medium">{sprite.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Palette */}
                            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Color Palette</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {colorPalettes.map((palette, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleColorPaletteChange(palette)}
                                            disabled={!isEditing}
                                            className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                                                characterData.colorPalette.primary === palette.primary
                                                    ? 'border-white'
                                                    : 'border-gray-600 hover:border-gray-500'
                                            } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex space-x-1 mb-2">
                                                <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.primary }}></div>
                                                <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.secondary }}></div>
                                                <div className="w-4 h-4 rounded" style={{ backgroundColor: palette.accent }}></div>
                                            </div>
                                            <div className="text-sm text-white">{palette.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Accessories */}
                            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Accessories</h3>
                                <div className="space-y-3">
                                    {availableAccessories.map((accessory) => {
                                        const isUnlocked = userStats.trustScore >= 50; // Simple unlock logic
                                        const isEquipped = selectedAccessories.includes(accessory.id);
                                        
                                        return (
                                            <div
                                                key={accessory.id}
                                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                                    isUnlocked 
                                                        ? 'border-gray-600 bg-white/5' 
                                                        : 'border-gray-700 bg-gray-800/50'
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-2xl">
                                                        {accessory.type === 'HAT' && '👑'}
                                                        {accessory.type === 'GLASSES' && '🤓'}
                                                        {accessory.type === 'CLOTHING' && '🦸'}
                                                        {accessory.type === 'BADGE_DISPLAY' && '🏆'}
                                                        {accessory.type === 'TOOL' && '🔧'}
                                                    </div>
                                                    <div>
                                                        <div className={`font-medium ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                                                            {accessory.name}
                                                        </div>
                                                        <div className="text-sm text-gray-400">
                                                            {accessory.unlockCondition}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleAccessoryToggle(accessory.id)}
                                                    disabled={!isUnlocked || !isEditing}
                                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                                        !isUnlocked
                                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                            : isEquipped
                                                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                                    } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    {!isUnlocked ? 'Locked' : isEquipped ? 'Remove' : 'Equip'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Category Stats */}
                        {Object.entries(userStats.categoryStats).map(([category, stats]) => (
                            <div key={category} className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    {getCategoryIcon(category)}
                                    <h3 className="text-xl font-bold text-white capitalize">{category}</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Tasks Completed</span>
                                        <span className="text-white font-bold">{stats.tasksCompleted}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Total XP</span>
                                        <span className="text-white font-bold">{stats.totalXP}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-300">Average Rating</span>
                                        <div className="flex items-center space-x-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            <span className="text-white font-bold">{stats.averageRating}</span>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-gray-300 mb-2">Specializations</div>
                                        <div className="flex flex-wrap gap-2">
                                            {stats.specializations.map((spec, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm"
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

                {activeTab === 'achievements' && (
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-4">Achievements Coming Soon</h2>
                        <p className="text-gray-300">Your badges, milestones, and special accomplishments will be displayed here.</p>
                    </div>
                )}

                {activeTab === 'career' && (
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-8 text-center">
                        <Rocket className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-4">Career Path Analysis</h2>
                        <p className="text-gray-300 mb-6">
                            AI-powered career insights and recommendations based on your Good Grid achievements.
                        </p>
                        <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300">
                            Generate Career Insights
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CharacterProfileBuilder;