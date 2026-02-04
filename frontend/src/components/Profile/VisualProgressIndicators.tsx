import React from 'react';
import { 
    Star, 
    Trophy, 
    Zap, 
    Shield, 
    Crown, 
    TrendingUp,
    Target,
    Award,
    Sparkles
} from 'lucide-react';

interface ProgressRingProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    children?: React.ReactNode;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
    progress,
    size = 120,
    strokeWidth = 8,
    color = '#8b5cf6',
    backgroundColor = '#374151',
    children
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = `${(progress / 100) * circumference} ${circumference}`;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
};

interface LevelProgressProps {
    currentLevel: number;
    currentXP: number;
    nextLevelXP: number;
    category?: string;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
    currentLevel,
    currentXP,
    nextLevelXP,
    category
}) => {
    const progress = (currentXP / nextLevelXP) * 100;
    
    const getCategoryColor = (cat?: string) => {
        switch (cat?.toUpperCase()) {
            case 'FREELANCE': return '#3b82f6';
            case 'COMMUNITY': return '#10b981';
            case 'CORPORATE': return '#8b5cf6';
            default: return '#f59e0b';
        }
    };

    const getCategoryIcon = (cat?: string) => {
        switch (cat?.toUpperCase()) {
            case 'FREELANCE': return <Star className="w-6 h-6" />;
            case 'COMMUNITY': return <Shield className="w-6 h-6" />;
            case 'CORPORATE': return <Trophy className="w-6 h-6" />;
            default: return <Crown className="w-6 h-6" />;
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <ProgressRing 
                progress={progress} 
                color={getCategoryColor(category)}
                size={100}
            >
                <div className="text-center">
                    <div className="text-white text-lg font-bold">{currentLevel}</div>
                    <div className="text-gray-300 text-xs">Level</div>
                </div>
            </ProgressRing>
            
            <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                    {getCategoryIcon(category)}
                    <span className="text-white font-semibold">
                        {category ? category.charAt(0) + category.slice(1).toLowerCase() : 'Overall'}
                    </span>
                </div>
                <div className="text-sm text-gray-300">
                    {currentXP} / {nextLevelXP} XP
                </div>
                <div className="text-xs text-gray-400">
                    {nextLevelXP - currentXP} XP to next level
                </div>
            </div>
        </div>
    );
};

interface SkillProgressProps {
    skills: Array<{
        name: string;
        level: number;
        maxLevel: number;
        xp: number;
        category: string;
    }>;
}

export const SkillProgress: React.FC<SkillProgressProps> = ({ skills }) => {
    const getSkillColor = (category: string) => {
        switch (category.toUpperCase()) {
            case 'TECHNICAL': return 'from-blue-500 to-cyan-500';
            case 'CREATIVE': return 'from-purple-500 to-pink-500';
            case 'LEADERSHIP': return 'from-green-500 to-emerald-500';
            case 'COMMUNICATION': return 'from-orange-500 to-red-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Skill Progression</h3>
            {skills.map((skill, index) => {
                const progress = (skill.level / skill.maxLevel) * 100;
                
                return (
                    <div key={index} className="bg-black/20 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{skill.name}</span>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-300">Level {skill.level}</span>
                                <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                            <div 
                                className={`h-3 rounded-full bg-gradient-to-r ${getSkillColor(skill.category)} transition-all duration-1000 ease-out`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>{skill.category}</span>
                            <span>{skill.xp} XP</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

interface AchievementProgressProps {
    achievements: Array<{
        id: string;
        name: string;
        description: string;
        progress: number;
        maxProgress: number;
        icon: string;
        rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
        isCompleted: boolean;
    }>;
}

export const AchievementProgress: React.FC<AchievementProgressProps> = ({ achievements }) => {
    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'COMMON': return 'from-gray-400 to-gray-500';
            case 'UNCOMMON': return 'from-green-400 to-green-500';
            case 'RARE': return 'from-blue-400 to-blue-500';
            case 'EPIC': return 'from-purple-400 to-purple-500';
            case 'LEGENDARY': return 'from-yellow-400 to-orange-500';
            default: return 'from-gray-400 to-gray-500';
        }
    };

    const getRarityGlow = (rarity: string) => {
        switch (rarity) {
            case 'LEGENDARY': return 'shadow-lg shadow-yellow-500/50';
            case 'EPIC': return 'shadow-lg shadow-purple-500/50';
            case 'RARE': return 'shadow-lg shadow-blue-500/50';
            default: return '';
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Achievement Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                    const progress = (achievement.progress / achievement.maxProgress) * 100;
                    
                    return (
                        <div 
                            key={achievement.id} 
                            className={`bg-black/30 rounded-lg p-4 border border-white/10 ${
                                achievement.isCompleted ? getRarityGlow(achievement.rarity) : ''
                            } transition-all duration-300 hover:bg-black/40`}
                        >
                            <div className="flex items-start space-x-3">
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getRarityColor(achievement.rarity)} flex items-center justify-center text-2xl ${
                                    achievement.isCompleted ? 'animate-pulse' : 'opacity-60'
                                }`}>
                                    {achievement.icon}
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-white font-semibold">{achievement.name}</h4>
                                        {achievement.isCompleted && (
                                            <Award className="w-5 h-5 text-yellow-400" />
                                        )}
                                    </div>
                                    
                                    <p className="text-gray-300 text-sm mb-3">{achievement.description}</p>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-400">Progress</span>
                                            <span className="text-white">
                                                {achievement.progress} / {achievement.maxProgress}
                                            </span>
                                        </div>
                                        
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} transition-all duration-1000 ease-out`}
                                                style={{ width: `${Math.min(100, progress)}%` }}
                                            />
                                        </div>
                                        
                                        <div className="flex justify-between items-center">
                                            <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white font-medium`}>
                                                {achievement.rarity}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {Math.round(progress)}% Complete
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface StatComparisonProps {
    stats: Array<{
        label: string;
        current: number;
        previous: number;
        max: number;
        icon: React.ReactNode;
        color: string;
    }>;
}

export const StatComparison: React.FC<StatComparisonProps> = ({ stats }) => {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const progress = (stat.current / stat.max) * 100;
                    const change = stat.current - stat.previous;
                    const changePercent = stat.previous > 0 ? ((change / stat.previous) * 100) : 0;
                    
                    return (
                        <div key={index} className="bg-black/30 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                                    {stat.icon}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white">{stat.current}</div>
                                    <div className="text-xs text-gray-400">{stat.label}</div>
                                </div>
                            </div>
                            
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                <div 
                                    className={`h-2 rounded-full bg-${stat.color}-500 transition-all duration-1000 ease-out`}
                                    style={{ width: `${Math.min(100, progress)}%` }}
                                />
                            </div>
                            
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">{Math.round(progress)}% of max</span>
                                <div className={`flex items-center space-x-1 ${
                                    change >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    <TrendingUp className={`w-3 h-3 ${change < 0 ? 'rotate-180' : ''}`} />
                                    <span>{change >= 0 ? '+' : ''}{change}</span>
                                    <span>({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%)</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface CategoryComparisonProps {
    categories: Array<{
        name: string;
        level: number;
        xp: number;
        maxXP: number;
        tasksCompleted: number;
        averageRating: number;
        color: string;
        icon: React.ReactNode;
    }>;
}

export const CategoryComparison: React.FC<CategoryComparisonProps> = ({ categories }) => {
    const maxLevel = Math.max(...categories.map(cat => cat.level));
    const maxTasks = Math.max(...categories.map(cat => cat.tasksCompleted));

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-bold text-white mb-4">Category Comparison</h3>
            
            {categories.map((category, index) => {
                const levelProgress = (category.level / maxLevel) * 100;
                const taskProgress = (category.tasksCompleted / maxTasks) * 100;
                const xpProgress = (category.xp / category.maxXP) * 100;
                
                return (
                    <div key={index} className="bg-black/30 rounded-lg p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color}`}>
                                    {category.icon}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-white">{category.name}</h4>
                                    <p className="text-gray-300">Level {category.level}</p>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className="flex items-center space-x-1 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            className={`w-4 h-4 ${
                                                i < Math.floor(category.averageRating) 
                                                    ? 'text-yellow-400 fill-current' 
                                                    : 'text-gray-600'
                                            }`} 
                                        />
                                    ))}
                                </div>
                                <div className="text-sm text-gray-300">{category.averageRating.toFixed(1)} avg</div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{category.level}</div>
                                <div className="text-xs text-gray-400">Level</div>
                                <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                                    <div 
                                        className={`h-1 rounded-full bg-gradient-to-r ${category.color}`}
                                        style={{ width: `${levelProgress}%` }}
                                    />
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{category.tasksCompleted}</div>
                                <div className="text-xs text-gray-400">Tasks</div>
                                <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                                    <div 
                                        className={`h-1 rounded-full bg-gradient-to-r ${category.color}`}
                                        style={{ width: `${taskProgress}%` }}
                                    />
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <div className="text-lg font-bold text-white">{category.xp}</div>
                                <div className="text-xs text-gray-400">XP</div>
                                <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                                    <div 
                                        className={`h-1 rounded-full bg-gradient-to-r ${category.color}`}
                                        style={{ width: `${xpProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <div className="text-sm text-gray-300">
                                {category.maxXP - category.xp} XP to next level
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default {
    LevelProgress,
    SkillProgress,
    AchievementProgress,
    StatComparison,
    CategoryComparison,
    ProgressRing
};