import React, { useState } from 'react';
import { 
    Crown, 
    Glasses, 
    Shirt, 
    Wrench, 
    Award, 
    Image, 
    Lock, 
    Unlock,
    Star,
    Sparkles,
    Palette,
    Settings,
    Save,
    RotateCcw
} from 'lucide-react';

interface AccessoryItem {
    id: string;
    name: string;
    type: 'HAT' | 'GLASSES' | 'CLOTHING' | 'TOOL' | 'BADGE_DISPLAY' | 'BACKGROUND';
    unlockCondition: string;
    equipped: boolean;
    unlocked: boolean;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
    category: string;
    description: string;
    previewUrl?: string;
    unlockProgress?: number;
    maxProgress?: number;
}

interface CharacterCustomizationProps {
    accessories: AccessoryItem[];
    onEquipAccessory: (accessoryId: string) => void;
    onUnequipAccessory: (accessoryId: string) => void;
    onSaveCustomization: (equippedItems: string[]) => void;
}

const AccessoryCustomization: React.FC<CharacterCustomizationProps> = ({
    accessories,
    onEquipAccessory,
    onUnequipAccessory,
    onSaveCustomization
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [selectedRarity, setSelectedRarity] = useState<string>('ALL');
    const [previewMode, setPreviewMode] = useState(false);

    const getAccessoryIcon = (type: string) => {
        switch (type) {
            case 'HAT': return <Crown className="w-5 h-5" />;
            case 'GLASSES': return <Glasses className="w-5 h-5" />;
            case 'CLOTHING': return <Shirt className="w-5 h-5" />;
            case 'TOOL': return <Wrench className="w-5 h-5" />;
            case 'BADGE_DISPLAY': return <Award className="w-5 h-5" />;
            case 'BACKGROUND': return <Image className="w-5 h-5" />;
            default: return <Star className="w-5 h-5" />;
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'COMMON': return 'border-gray-400 bg-gray-400/10 text-gray-400';
            case 'UNCOMMON': return 'border-green-400 bg-green-400/10 text-green-400';
            case 'RARE': return 'border-blue-400 bg-blue-400/10 text-blue-400';
            case 'EPIC': return 'border-purple-400 bg-purple-400/10 text-purple-400';
            case 'LEGENDARY': return 'border-yellow-400 bg-yellow-400/10 text-yellow-400';
            default: return 'border-gray-400 bg-gray-400/10 text-gray-400';
        }
    };

    const getRarityGlow = (rarity: string) => {
        switch (rarity) {
            case 'LEGENDARY': return 'shadow-lg shadow-yellow-500/50 animate-pulse';
            case 'EPIC': return 'shadow-lg shadow-purple-500/50';
            case 'RARE': return 'shadow-lg shadow-blue-500/50';
            default: return '';
        }
    };

    const filteredAccessories = accessories.filter(accessory => {
        const categoryMatch = selectedCategory === 'ALL' || accessory.category === selectedCategory;
        const rarityMatch = selectedRarity === 'ALL' || accessory.rarity === selectedRarity;
        return categoryMatch && rarityMatch;
    });

    const equippedAccessories = accessories.filter(acc => acc.equipped);
    const unlockedAccessories = accessories.filter(acc => acc.unlocked);
    const lockedAccessories = accessories.filter(acc => !acc.unlocked);

    const handleToggleAccessory = (accessory: AccessoryItem) => {
        if (!accessory.unlocked) return;
        
        if (accessory.equipped) {
            onUnequipAccessory(accessory.id);
        } else {
            onEquipAccessory(accessory.id);
        }
    };

    const handleSaveCustomization = () => {
        const equippedIds = equippedAccessories.map(acc => acc.id);
        onSaveCustomization(equippedIds);
    };

    const resetToDefaults = () => {
        equippedAccessories.forEach(acc => onUnequipAccessory(acc.id));
    };

    return (
        <div className="space-y-6">
            {/* Character Preview */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Character Customization</h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                previewMode 
                                    ? 'bg-purple-500/20 text-purple-400' 
                                    : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                        >
                            <Palette className="w-4 h-4 mr-2 inline" />
                            Preview Mode
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Character Display */}
                    <div className="text-center">
                        <div className="relative w-64 h-64 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-white/10 flex items-center justify-center mb-4 overflow-hidden">
                            {/* Base Character */}
                            <Crown className="w-32 h-32 text-yellow-400" />
                            
                            {/* Equipped Accessories Overlay */}
                            {equippedAccessories.map((accessory) => (
                                <div 
                                    key={accessory.id}
                                    className={`absolute inset-0 flex items-center justify-center ${getRarityGlow(accessory.rarity)}`}
                                >
                                    {getAccessoryIcon(accessory.type)}
                                </div>
                            ))}
                            
                            {/* Sparkle Effects for Legendary Items */}
                            {equippedAccessories.some(acc => acc.rarity === 'LEGENDARY') && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <Sparkles className="absolute top-4 left-4 w-4 h-4 text-yellow-400 animate-pulse" />
                                    <Sparkles className="absolute top-8 right-6 w-3 h-3 text-yellow-400 animate-pulse delay-300" />
                                    <Sparkles className="absolute bottom-6 left-8 w-3 h-3 text-yellow-400 animate-pulse delay-700" />
                                </div>
                            )}
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2">Your Character</h3>
                        <p className="text-gray-300 mb-4">Level 12 Adventurer</p>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-lg font-bold text-purple-400">{equippedAccessories.length}</div>
                                <div className="text-xs text-gray-300">Equipped</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-blue-400">{unlockedAccessories.length}</div>
                                <div className="text-xs text-gray-300">Unlocked</div>
                            </div>
                            <div>
                                <div className="text-lg font-bold text-yellow-400">
                                    {equippedAccessories.filter(acc => acc.rarity === 'LEGENDARY' || acc.rarity === 'EPIC').length}
                                </div>
                                <div className="text-xs text-gray-300">Rare+</div>
                            </div>
                        </div>
                    </div>

                    {/* Currently Equipped */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Currently Equipped</h3>
                        <div className="space-y-3 mb-6">
                            {equippedAccessories.length > 0 ? (
                                equippedAccessories.map((accessory) => (
                                    <div 
                                        key={accessory.id}
                                        className={`p-3 rounded-lg border ${getRarityColor(accessory.rarity)} flex items-center justify-between`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            {getAccessoryIcon(accessory.type)}
                                            <div>
                                                <div className="font-bold text-white">{accessory.name}</div>
                                                <div className="text-xs text-gray-400">{accessory.type}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onUnequipAccessory(accessory.id)}
                                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                                        >
                                            Unequip
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No accessories equipped</p>
                                    <p className="text-sm">Browse the collection below to customize your character</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={handleSaveCustomization}
                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                <span>Save Look</span>
                            </button>
                            <button
                                onClick={resetToDefaults}
                                className="px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="ALL">All Categories</option>
                                <option value="ACHIEVEMENT">Achievement</option>
                                <option value="FREELANCE">Freelance</option>
                                <option value="COMMUNITY">Community</option>
                                <option value="CORPORATE">Corporate</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-300 mb-1">Rarity</label>
                            <select
                                value={selectedRarity}
                                onChange={(e) => setSelectedRarity(e.target.value)}
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
                    </div>
                    
                    <div className="text-sm text-gray-300">
                        Showing {filteredAccessories.length} of {accessories.length} items
                    </div>
                </div>
            </div>

            {/* Accessory Collection */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Accessory Collection</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAccessories.map((accessory) => (
                        <div 
                            key={accessory.id}
                            className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 cursor-pointer ${
                                accessory.unlocked 
                                    ? `${getRarityColor(accessory.rarity)} ${accessory.equipped ? getRarityGlow(accessory.rarity) : ''}`
                                    : 'border-gray-600 bg-gray-600/10 opacity-60'
                            }`}
                            onClick={() => handleToggleAccessory(accessory)}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${accessory.unlocked ? 'bg-white/10' : 'bg-gray-600/20'}`}>
                                        {getAccessoryIcon(accessory.type)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{accessory.name}</div>
                                        <div className="text-xs text-gray-400">{accessory.type}</div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    {accessory.unlocked ? (
                                        <Unlock className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <Lock className="w-4 h-4 text-gray-500" />
                                    )}
                                    {accessory.equipped && (
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    )}
                                </div>
                            </div>
                            
                            <p className="text-sm text-gray-300 mb-3">{accessory.description}</p>
                            
                            {/* Unlock Progress */}
                            {!accessory.unlocked && accessory.unlockProgress !== undefined && accessory.maxProgress && (
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Progress</span>
                                        <span>{accessory.unlockProgress} / {accessory.maxProgress}</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-1">
                                        <div 
                                            className="h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                            style={{ width: `${(accessory.unlockProgress / accessory.maxProgress) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRarityColor(accessory.rarity)}`}>
                                        {accessory.rarity}
                                    </span>
                                    <span className="text-xs text-gray-400">{accessory.category}</span>
                                </div>
                                
                                {accessory.unlocked ? (
                                    <button
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                            accessory.equipped
                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                                : 'bg-white/10 text-white hover:bg-white/20'
                                        }`}
                                    >
                                        {accessory.equipped ? 'Equipped' : 'Equip'}
                                    </button>
                                ) : (
                                    <div className="text-xs text-gray-500">
                                        {accessory.unlockCondition}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                {filteredAccessories.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <Star className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No accessories found</p>
                        <p>Try adjusting your filters or unlock more items by completing tasks</p>
                    </div>
                )}
            </div>

            {/* Unlock Progress Summary */}
            {lockedAccessories.length > 0 && (
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Unlock Progress</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lockedAccessories.slice(0, 4).map((accessory) => (
                            <div key={accessory.id} className="p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center space-x-3 mb-2">
                                    {getAccessoryIcon(accessory.type)}
                                    <div>
                                        <div className="font-medium text-white">{accessory.name}</div>
                                        <div className="text-xs text-gray-400">{accessory.rarity}</div>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-300">{accessory.unlockCondition}</div>
                                {accessory.unlockProgress !== undefined && accessory.maxProgress && (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-700 rounded-full h-1">
                                            <div 
                                                className="h-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                                style={{ width: `${(accessory.unlockProgress / accessory.maxProgress) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessoryCustomization;