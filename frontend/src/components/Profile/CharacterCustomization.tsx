import React, { useState } from 'react';
import { 
    Palette, 
    Crown, 
    Glasses, 
    Shirt, 
    Wrench, 
    Award,
    Lock,
    Unlock,
    Save,
    RotateCcw,
    Eye,
    Sparkles,
    Star
} from 'lucide-react';

interface AccessoryItem {
    id: string;
    name: string;
    type: 'HAT' | 'GLASSES' | 'CLOTHING' | 'TOOL' | 'BADGE_DISPLAY' | 'BACKGROUND';
    unlockCondition: string;
    equipped: boolean;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    category: string;
    unlocked: boolean;
    previewUrl?: string;
    description: string;
}

interface CharacterCustomizationProps {
    userId: string;
    currentLevel: number;
    trustScore: number;
    rwisScore: number;
    completedTasks: { freelance: number; community: number; corporate: number };
}

const CharacterCustomization: React.FC<CharacterCustomizationProps> = ({ 
    userId, 
    currentLevel, 
    trustScore, 
    rwisScore, 
    completedTasks 
}) => {
    const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'HAT' | 'GLASSES' | 'CLOTHING' | 'TOOL' | 'BADGE_DISPLAY' | 'BACKGROUND'>('ALL');
    const [selectedRarity, setSelectedRarity] = useState<'ALL' | 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'>('ALL');
    const [previewMode, setPreviewMode] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Mock accessories data - in real app, this would come from API
    const [accessories, setAccessories] = useState<AccessoryItem[]>([
        {
            id: 'crown-gold',
            name: 'Golden Crown',
            type: 'HAT',
            unlockCondition: 'Reach level 10',
            equipped: false,
            rarity: 'LEGENDARY',
            category: 'ACHIEVEMENT',
            unlocked: currentLevel >= 10,
            description: 'A majestic golden crown for true leaders',
            previewUrl: '/assets/accessories/crown-gold.png'
        },
        {
            id: 'crown-silver',
            name: 'Silver Crown',
            type: 'HAT',
            unlockCondition: 'Reach level 5',
            equipped: false,
            rarity: 'RARE',
            category: 'ACHIEVEMENT',
            unlocked: currentLevel >= 5,
            description: 'A shining silver crown for emerging leaders',
            previewUrl: '/assets/accessories/crown-silver.png'
        },
        {
            id: 'glasses-tech',
            name: 'Tech Glasses',
            type: 'GLASSES',
            unlockCondition: 'Complete 10 freelance tasks',
            equipped: true,
            rarity: 'RARE',
            category: 'FREELANCE',
            unlocked: completedTasks.freelance >= 10,
            description: 'High-tech glasses for the digital professional',
            previewUrl: '/assets/accessories/glasses-tech.png'
        },
        {
            id: 'glasses-reading',
            name: 'Reading Glasses',
            type: 'GLASSES',
            unlockCondition: 'Complete 5 freelance tasks',
            equipped: false,
            rarity: 'COMMON',
            category: 'FREELANCE',
            unlocked: completedTasks.freelance >= 5,
            description: 'Classic reading glasses for focused work',
            previewUrl: '/assets/accessories/glasses-reading.png'
        },
        {
            id: 'cape-hero',
            name: 'Hero Cape',
            type: 'CLOTHING',
            unlockCondition: 'Earn 100 RWIS points',
            equipped: false,
            rarity: 'EPIC',
            category: 'COMMUNITY',
            unlocked: rwisScore >= 100,
            description: 'A flowing cape for community heroes',
            previewUrl: '/assets/accessories/cape-hero.png'
        },
        {
            id: 'shirt-volunteer',
            name: 'Volunteer Shirt',
            type: 'CLOTHING',
            unlockCondition: 'Complete 5 community tasks',
            equipped: false,
            rarity: 'UNCOMMON',
            category: 'COMMUNITY',
            unlocked: completedTasks.community >= 5,
            description: 'A comfortable shirt showing your volunteer spirit',
            previewUrl: '/assets/accessories/shirt-volunteer.png'
        },
        {
            id: 'badge-corporate',
            name: 'Corporate Badge',
            type: 'BADGE_DISPLAY',
            unlockCondition: 'Complete 5 corporate tasks',
            equipped: false,
            rarity: 'UNCOMMON',
            category: 'CORPORATE',
            unlocked: completedTasks.corporate >= 5,
            description: 'A professional badge for corporate achievements',
            previewUrl: '/assets/accessories/badge-corporate.png'
        },
        {
            id: 'tool-hammer',
            name: 'Golden Hammer',
            type: 'TOOL',
            unlockCondition: 'Complete 20 tasks total',
            equipped: false,
            rarity: 'RARE',
            category: 'ACHIEVEMENT',
            unlocked: (completedTasks.freelance + completedTasks.community + completedTasks.corporate) >= 20,
            description: 'A golden hammer symbolizing your building skills',
            previewUrl: '/assets/accessories/tool-hammer.png'
        },
        {
            id: 'bg-galaxy',
            name: 'Galaxy Background',
            type: 'BACKGROUND',
            unlockCondition: 'Reach Trust Score 80',
            equipped: true,
            rarity: 'RARE',
            category: 'ACHIEVEMENT',
            unlocked: trustScore >= 80,
            description: 'A stunning galaxy background for your profile',
            previewUrl: '/assets/backgrounds/galaxy.png'
        },
        {
            id: 'bg-forest',
            name: 'Forest Background',
            type: 'BACKGROUND',
            unlockCondition: 'Complete 10 community tasks',
            equipped: false,
            rarity: 'UNCOMMON',
            category: 'COMMUNITY',
            unlocked: completedTasks.community >= 10,
            description: 'A peaceful forest scene for nature lovers',
            previewUrl: '/assets/backgrounds/forest.png'
        }
    ]);

    const getCategoryIcon = (type: string) => {
        switch (type) {
            case 'HAT': return <Crown className="w-5 h-5" />;
            case 'GLASSES': return <Glasses className="w-5 h-5" />;
            case 'CLOTHING': return <Shirt className="w-5 h-5" />;
            case 'TOOL': return <Wrench className="w-5 h-5" />;
            case 'BADGE_DISPLAY': return <Award className="w-5 h-5" />;
            case 'BACKGROUND': return <Palette className="w-5 h-5" />;
            default: return <Star className="w-5 h-5" />;
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'COMMON': return 'border-gray-400 bg-gray-400/10 text-gray-300';
            case 'UNCOMMON': return 'border-green-400 bg-green-400/10 text-green-300';
            case 'RARE': return 'border-blue-400 bg-blue-400/10 text-blue-300';
            case 'EPIC': return 'border-purple-400 bg-purple-400/10 text-purple-300';
            case 'LEGENDARY': return 'border-yellow-400 bg-yellow-400/10 text-yellow-300';
            default: return 'border-gray-400 bg-gray-400/10 text-gray-300';
        }
    };

    const getRarityGlow = (rarity: string) => {
        switch (rarity) {
            case 'COMMON': return 'shadow-gray-400/20';
            case 'UNCOMMON': return 'shadow-green-400/20';
            case 'RARE': return 'shadow-blue-400/20';
            case 'EPIC': return 'shadow-purple-400/20';
            case 'LEGENDARY': return 'shadow-yellow-400/20';
            default: return 'shadow-gray-400/20';
        }
    };

    const filteredAccessories = accessories.filter(accessory => {
        const categoryMatch = selectedCategory === 'ALL' || accessory.type === selectedCategory;
        const rarityMatch = selectedRarity === 'ALL' || accessory.rarity === selectedRarity;
        return categoryMatch && rarityMatch;
    });

    const toggleAccessory = (accessoryId: string) => {
        setAccessories(prev => {
            const accessory = prev.find(acc => acc.id === accessoryId);
            if (!accessory || !accessory.unlocked) return prev;

            // If it's the same type, unequip others first
            const updatedAccessories = prev.map(acc => 
                acc.type === accessory.type && acc.id !== accessoryId 
                    ? { ...acc, equipped: false }
                    : acc
            );
            
            // Then toggle the selected one
            return updatedAccessories.map(acc =>
                acc.id === accessoryId 
                    ? { ...acc, equipped: !acc.equipped }
                    : acc
            );
        });
        setHasUnsavedChanges(true);
    };

    const saveCustomization = async () => {
        try {
            // In real app, this would make an API call
            console.log('Saving customization for user:', userId);
            console.log('Equipped accessories:', accessories.filter(acc => acc.equipped));
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setHasUnsavedChanges(false);
            // Show success message
        } catch (error) {
            console.error('Error saving customization:', error);
        }
    };

    const resetToDefault = () => {
        setAccessories(prev => prev.map(accessory => ({
            ...accessory,
            equipped: false
        })));
        setHasUnsavedChanges(true);
    };

    const getEquippedAccessories = () => {
        return accessories.filter(acc => acc.equipped);
    };

    return (
        <div className="space-y-8">
            {/* Character Preview */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Character Preview</h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                                previewMode 
                                    ? 'bg-purple-500 text-white' 
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                        >
                            <Eye className="w-4 h-4" />
                            <span>Preview Mode</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Character Display */}
                    <div className="flex-1">
                        <div className="relative w-full max-w-md mx-auto aspect-square bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl border border-white/20 overflow-hidden">
                            {/* Background */}
                            {accessories.find(acc => acc.type === 'BACKGROUND' && acc.equipped) && (
                                <div className="absolute inset-0 opacity-30">
                                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600" />
                                </div>
                            )}
                            
                            {/* Character Base */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-4 border-white/20 relative">
                                    {/* Character face/icon */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Crown className="w-16 h-16 text-white" />
                                    </div>
                                    
                                    {/* Equipped accessories overlay */}
                                    {getEquippedAccessories().map(accessory => (
                                        <div key={accessory.id} className="absolute inset-0 flex items-center justify-center">
                                            <div className={`text-2xl ${getRarityGlow(accessory.rarity)} rounded-full p-2`}>
                                                {accessory.type === 'HAT' && '👑'}
                                                {accessory.type === 'GLASSES' && '🤓'}
                                                {accessory.type === 'CLOTHING' && '🦸'}
                                                {accessory.type === 'TOOL' && '🔨'}
                                                {accessory.type === 'BADGE_DISPLAY' && '🏆'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Level indicator */}
                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                                <span className="text-white font-bold">Lv. {currentLevel}</span>
                            </div>
                        </div>
                    </div>

                    {/* Equipped Items Summary */}
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-4">Currently Equipped</h4>
                        <div className="space-y-3">
                            {getEquippedAccessories().length === 0 ? (
                                <div className="text-gray-400 text-center py-8">
                                    No accessories equipped
                                </div>
                            ) : (
                                getEquippedAccessories().map(accessory => (
                                    <div key={accessory.id} className={`p-4 rounded-lg border ${getRarityColor(accessory.rarity)}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {getCategoryIcon(accessory.type)}
                                                <div>
                                                    <div className="font-semibold">{accessory.name}</div>
                                                    <div className="text-sm opacity-75">{accessory.description}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs px-2 py-1 bg-white/10 rounded-full">
                                                    {accessory.rarity}
                                                </span>
                                                <button
                                                    onClick={() => toggleAccessory(accessory.id)}
                                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as any)}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="ALL">All Categories</option>
                            <option value="HAT">Hats</option>
                            <option value="GLASSES">Glasses</option>
                            <option value="CLOTHING">Clothing</option>
                            <option value="TOOL">Tools</option>
                            <option value="BADGE_DISPLAY">Badges</option>
                            <option value="BACKGROUND">Backgrounds</option>
                        </select>
                        
                        <select
                            value={selectedRarity}
                            onChange={(e) => setSelectedRarity(e.target.value as any)}
                            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="ALL">All Rarities</option>
                            <option value="COMMON">Common</option>
                            <option value="UNCOMMON">Uncommon</option>
                            <option value="RARE">Rare</option>
                            <option value="EPIC">Epic</option>
                            <option value="LEGENDARY">Legendary</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={resetToDefault}
                            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Reset</span>
                        </button>
                        
                        <button
                            onClick={saveCustomization}
                            disabled={!hasUnsavedChanges}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                hasUnsavedChanges
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Accessories Grid */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Available Accessories</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAccessories.map(accessory => (
                        <div 
                            key={accessory.id} 
                            className={`relative p-4 rounded-xl border transition-all duration-300 ${
                                accessory.unlocked 
                                    ? `${getRarityColor(accessory.rarity)} hover:scale-105 cursor-pointer ${
                                        accessory.equipped ? 'ring-2 ring-white/50' : ''
                                    }`
                                    : 'border-gray-600 bg-gray-600/10 text-gray-500 cursor-not-allowed'
                            }`}
                            onClick={() => accessory.unlocked && toggleAccessory(accessory.id)}
                        >
                            {/* Lock/Unlock indicator */}
                            <div className="absolute top-2 right-2">
                                {accessory.unlocked ? (
                                    accessory.equipped ? (
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                    ) : (
                                        <Unlock className="w-5 h-5 text-green-400" />
                                    )
                                ) : (
                                    <Lock className="w-5 h-5 text-gray-500" />
                                )}
                            </div>

                            {/* Accessory preview */}
                            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-white/5 rounded-lg">
                                {getCategoryIcon(accessory.type)}
                            </div>

                            {/* Accessory info */}
                            <div className="text-center">
                                <h4 className="font-bold mb-1">{accessory.name}</h4>
                                <p className="text-sm opacity-75 mb-2">{accessory.description}</p>
                                
                                <div className="flex items-center justify-center space-x-2 mb-2">
                                    <span className="text-xs px-2 py-1 bg-white/10 rounded-full">
                                        {accessory.rarity}
                                    </span>
                                    <span className="text-xs px-2 py-1 bg-white/10 rounded-full">
                                        {accessory.type}
                                    </span>
                                </div>

                                <div className="text-xs opacity-60">
                                    {accessory.unlocked ? 'Unlocked!' : accessory.unlockCondition}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredAccessories.length === 0 && (
                    <div className="text-center text-gray-400 py-12">
                        No accessories found matching your filters
                    </div>
                )}
            </div>
        </div>
    );
};

export default CharacterCustomization;