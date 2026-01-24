import React from 'react';
import { 
    User, 
    Map, 
    Briefcase, 
    Home,
    Settings,
    Crown,
    Rocket
} from 'lucide-react';

interface QuickNavProps {
    onNavigateToCharacter?: () => void;
    onNavigateToMap?: () => void;
    onNavigateToCareer?: () => void;
    currentPage?: string;
}

const QuickNav: React.FC<QuickNavProps> = ({
    onNavigateToCharacter,
    onNavigateToMap,
    onNavigateToCareer,
    currentPage = 'map'
}) => {
    const navItems = [
        {
            id: 'character',
            label: 'Character',
            icon: User,
            onClick: onNavigateToCharacter,
            color: 'from-purple-500 to-pink-500'
        },
        {
            id: 'map',
            label: 'Map',
            icon: Map,
            onClick: onNavigateToMap,
            color: 'from-green-500 to-blue-500'
        },
        {
            id: 'career',
            label: 'Career Hub',
            icon: Briefcase,
            onClick: onNavigateToCareer,
            color: 'from-orange-500 to-red-500'
        }
    ];

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-4 shadow-2xl">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
                        <span className="text-white font-semibold">Good Grid</span>
                    </div>
                    <div className="w-px h-6 bg-white/20"></div>
                    <div className="flex space-x-2">
                        {navItems.map((item) => (
                            <div key={item.id} className="relative">
                                {/* NEW Badge for Career Hub */}
                                {item.id === 'career' && (
                                    <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                                        NEW!
                                    </div>
                                )}
                                
                                <button
                                    onClick={item.onClick}
                                    className={`relative group transition-all duration-300 ${
                                        currentPage === item.id ? 'scale-110' : 'hover:scale-105'
                                    }`}
                                    title={item.label}
                                >
                                    <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg ${
                                        currentPage === item.id ? 'ring-2 ring-white/50' : ''
                                    } ${item.id === 'career' ? 'animate-pulse-border border-2' : ''}`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    {currentPage === item.id && (
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    )}
                                    
                                    {/* Sparkle effect for career hub */}
                                    {item.id === 'career' && (
                                        <>
                                            <div className="absolute -top-1 -left-1 text-yellow-300 animate-ping text-xs">✨</div>
                                            <div className="absolute -bottom-1 -right-1 text-yellow-300 animate-ping animation-delay-1000 text-xs">⭐</div>
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickNav;