import React, { useState, useEffect } from 'react';
import { Crown, Gamepad2, Zap, Shield, Star, Users, Trophy, Map, User, Settings } from 'lucide-react';
import ComprehensiveProfileDashboard from '../Profile/ComprehensiveProfileDashboard';
import SocialHub from '../Social/SocialHub';
import './GamifiedUIDemo.css';

interface GameState {
    currentView: 'map' | 'profile' | 'social' | 'dungeon';
    playerLevel: number;
    playerXP: number;
    playerTrust: number;
    playerImpact: number;
    currentZone: string;
    unlockedAreas: string[];
    notifications: number;
}

const GamifiedUIDemo: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>({
        currentView: 'map',
        playerLevel: 12,
        playerXP: 3450,
        playerTrust: 87,
        playerImpact: 145,
        currentZone: 'tech-district',
        unlockedAreas: ['downtown', 'tech-district', 'community-hub'],
        notifications: 3
    });

    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showXPGain, setShowXPGain] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second for dynamic elements
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Simulate level up animation
    const triggerLevelUp = () => {
        setShowLevelUp(true);
        setGameState(prev => ({ ...prev, playerLevel: prev.playerLevel + 1 }));
        setTimeout(() => setShowLevelUp(false), 3000);
    };

    // Simulate XP gain
    const triggerXPGain = () => {
        setShowXPGain(true);
        setGameState(prev => ({ ...prev, playerXP: prev.playerXP + 50 }));
        setTimeout(() => setShowXPGain(false), 2000);
    };

    const getViewTitle = () => {
        switch (gameState.currentView) {
            case 'map': return 'WORLD MAP';
            case 'profile': return 'HERO PROFILE';
            case 'social': return 'SOCIAL HUB';
            case 'dungeon': return 'DUNGEON QUEST';
            default: return 'GOOD GRID';
        }
    };

    return (
        <div className="gamified-ui-demo">
            {/* Animated Background */}
            <div className="game-background">
                <div className="stars-field"></div>
                <div className="nebula-clouds"></div>
                <div className="floating-particles"></div>
            </div>

            {/* Level Up Animation */}
            {showLevelUp && (
                <div className="level-up-overlay">
                    <div className="level-up-animation">
                        <div className="level-up-burst"></div>
                        <div className="level-up-text">
                            <div className="level-up-title">LEVEL UP!</div>
                            <div className="level-up-number">LEVEL {gameState.playerLevel}</div>
                            <div className="level-up-subtitle">New abilities unlocked!</div>
                        </div>
                        <div className="level-up-sparkles">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className={`sparkle sparkle-${i + 1}`}>✨</div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* XP Gain Animation */}
            {showXPGain && (
                <div className="xp-gain-animation">
                    <div className="xp-gain-text">+50 XP</div>
                </div>
            )}

            {/* Gaming HUD Header */}
            <div className="gaming-hud-header">
                {/* Left Side - Player Stats */}
                <div className="player-stats-hud">
                    <div className="player-avatar">
                        <div className="avatar-frame">
                            <div className="pixel-character">🎮</div>
                            <div className="level-indicator">LV.{gameState.playerLevel}</div>
                        </div>
                    </div>
                    
                    <div className="stats-bars">
                        <div className="stat-bar xp-bar">
                            <div className="stat-label">
                                <Zap className="w-3 h-3" />
                                XP
                            </div>
                            <div className="bar-container">
                                <div 
                                    className="bar-fill xp-fill" 
                                    style={{ width: `${(gameState.playerXP % 500) / 5}%` }}
                                ></div>
                                <div className="bar-text">{gameState.playerXP} / {gameState.playerLevel * 500}</div>
                            </div>
                        </div>
                        
                        <div className="stat-bar trust-bar">
                            <div className="stat-label">
                                <Shield className="w-3 h-3" />
                                TRUST
                            </div>
                            <div className="bar-container">
                                <div 
                                    className="bar-fill trust-fill" 
                                    style={{ width: `${gameState.playerTrust}%` }}
                                ></div>
                                <div className="bar-text">{gameState.playerTrust}/100</div>
                            </div>
                        </div>
                        
                        <div className="stat-bar impact-bar">
                            <div className="stat-label">
                                <Star className="w-3 h-3" />
                                IMPACT
                            </div>
                            <div className="bar-container">
                                <div 
                                    className="bar-fill impact-fill" 
                                    style={{ width: `${Math.min(100, (gameState.playerImpact / 200) * 100)}%` }}
                                ></div>
                                <div className="bar-text">{gameState.playerImpact}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center - Current View Title */}
                <div className="view-title-section">
                    <div className="view-title">{getViewTitle()}</div>
                    <div className="zone-indicator">
                        <Map className="w-4 h-4" />
                        {gameState.currentZone.toUpperCase().replace('-', ' ')}
                    </div>
                    <div className="game-time">
                        {currentTime.toLocaleTimeString()}
                    </div>
                </div>

                {/* Right Side - Quick Actions */}
                <div className="quick-actions-hud">
                    <button onClick={triggerXPGain} className="hud-button xp-button">
                        <Zap className="w-4 h-4" />
                        +XP
                    </button>
                    <button onClick={triggerLevelUp} className="hud-button level-button">
                        <Crown className="w-4 h-4" />
                        LVL UP
                    </button>
                    <div className="notifications-indicator">
                        <div className="notification-count">{gameState.notifications}</div>
                    </div>
                </div>
            </div>

            {/* Gaming Navigation Menu */}
            <div className="gaming-nav-menu">
                <button
                    onClick={() => setGameState(prev => ({ ...prev, currentView: 'map' }))}
                    className={`nav-button ${gameState.currentView === 'map' ? 'active' : ''}`}
                >
                    <div className="nav-icon">
                        <Map className="w-6 h-6" />
                    </div>
                    <div className="nav-label">WORLD MAP</div>
                    <div className="nav-description">Explore zones</div>
                </button>

                <button
                    onClick={() => setGameState(prev => ({ ...prev, currentView: 'profile' }))}
                    className={`nav-button ${gameState.currentView === 'profile' ? 'active' : ''}`}
                >
                    <div className="nav-icon">
                        <User className="w-6 h-6" />
                    </div>
                    <div className="nav-label">PROFILE</div>
                    <div className="nav-description">Hero stats</div>
                </button>

                <button
                    onClick={() => setGameState(prev => ({ ...prev, currentView: 'social' }))}
                    className={`nav-button ${gameState.currentView === 'social' ? 'active' : ''}`}
                >
                    <div className="nav-icon">
                        <Users className="w-6 h-6" />
                        {gameState.notifications > 0 && (
                            <div className="nav-notification-badge">{gameState.notifications}</div>
                        )}
                    </div>
                    <div className="nav-label">SOCIAL</div>
                    <div className="nav-description">Connect & compete</div>
                </button>

                <button
                    onClick={() => setGameState(prev => ({ ...prev, currentView: 'dungeon' }))}
                    className={`nav-button ${gameState.currentView === 'dungeon' ? 'active' : ''}`}
                >
                    <div className="nav-icon">
                        <Gamepad2 className="w-6 h-6" />
                    </div>
                    <div className="nav-label">DUNGEON</div>
                    <div className="nav-description">Epic quests</div>
                </button>
            </div>

            {/* Main Content Area */}
            <div className="main-content-area">
                {gameState.currentView === 'map' && (
                    <div className="content-wrapper">
                        <div className="p-8 text-center text-white">
                            <h2 className="text-3xl font-bold mb-4">🗺️ WORLD MAP</h2>
                            <p className="text-gray-300">Interactive map coming soon...</p>
                        </div>
                    </div>
                )}

                {gameState.currentView === 'profile' && (
                    <div className="content-wrapper">
                        <ComprehensiveProfileDashboard userId="demo-user" />
                    </div>
                )}

                {gameState.currentView === 'social' && (
                    <div className="content-wrapper">
                        <SocialHub 
                            currentUserId="demo-user" 
                            currentUserZone={gameState.currentZone}
                        />
                    </div>
                )}

                {gameState.currentView === 'dungeon' && (
                    <div className="content-wrapper">
                        <div className="p-8 text-center text-white">
                            <h2 className="text-3xl font-bold mb-4">🏰 DUNGEON QUEST</h2>
                            <p className="text-gray-300">Epic dungeon adventures coming soon...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Gaming Footer HUD */}
            <div className="gaming-footer-hud">
                <div className="footer-stats">
                    <div className="footer-stat">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span>Rank #3</span>
                    </div>
                    <div className="footer-stat">
                        <Users className="w-4 h-4 text-green-400" />
                        <span>24 Online</span>
                    </div>
                    <div className="footer-stat">
                        <Star className="w-4 h-4 text-purple-400" />
                        <span>8 Badges</span>
                    </div>
                </div>
                
                <div className="footer-actions">
                    <button className="footer-button">
                        <Settings className="w-4 h-4" />
                        SETTINGS
                    </button>
                </div>
            </div>

            {/* Floating UI Elements */}
            <div className="floating-ui-elements">
                <div className="floating-coin coin-1">🪙</div>
                <div className="floating-coin coin-2">💎</div>
                <div className="floating-coin coin-3">⭐</div>
                <div className="floating-coin coin-4">🏆</div>
            </div>
        </div>
    );
};

export default GamifiedUIDemo;