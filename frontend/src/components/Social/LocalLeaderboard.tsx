import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Star, TrendingUp, Users, MapPin, Shield, Zap } from 'lucide-react';
import './SocialFeatures.css';

interface LeaderboardUser {
    id: string;
    username: string;
    avatar: string;
    trustScore: number;
    rwisScore: number;
    totalXP: number;
    level: number;
    zone: string;
    badges: number;
    rank: number;
    isCurrentUser?: boolean;
}

interface LocalLeaderboardProps {
    currentUserZone: string;
    currentUserId: string;
}

const LocalLeaderboard: React.FC<LocalLeaderboardProps> = ({ currentUserZone, currentUserId }) => {
    const [activeTab, setActiveTab] = useState<'trust' | 'impact' | 'xp'>('trust');
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    // Mock data - in real app, this would come from API
    useEffect(() => {
        const mockData: LeaderboardUser[] = [
            {
                id: '1',
                username: 'CommunityHero',
                avatar: '🦸‍♂️',
                trustScore: 95,
                rwisScore: 180,
                totalXP: 4200,
                level: 15,
                zone: currentUserZone,
                badges: 12,
                rank: 1
            },
            {
                id: '2',
                username: 'CodeMaster',
                avatar: '👨‍💻',
                trustScore: 92,
                rwisScore: 165,
                totalXP: 3800,
                level: 14,
                zone: currentUserZone,
                badges: 10,
                rank: 2
            },
            {
                id: currentUserId,
                username: 'You',
                avatar: '🎮',
                trustScore: 87,
                rwisScore: 145,
                totalXP: 3450,
                level: 12,
                zone: currentUserZone,
                badges: 8,
                rank: 3,
                isCurrentUser: true
            },
            {
                id: '4',
                username: 'EcoWarrior',
                avatar: '🌱',
                trustScore: 85,
                rwisScore: 140,
                totalXP: 3200,
                level: 11,
                zone: currentUserZone,
                badges: 9,
                rank: 4
            },
            {
                id: '5',
                username: 'TechNinja',
                avatar: '🥷',
                trustScore: 82,
                rwisScore: 135,
                totalXP: 3000,
                level: 10,
                zone: currentUserZone,
                badges: 7,
                rank: 5
            }
        ];

        // Sort based on active tab
        const sortedData = [...mockData].sort((a, b) => {
            switch (activeTab) {
                case 'trust':
                    return b.trustScore - a.trustScore;
                case 'impact':
                    return b.rwisScore - a.rwisScore;
                case 'xp':
                    return b.totalXP - a.totalXP;
                default:
                    return b.trustScore - a.trustScore;
            }
        });

        // Update ranks
        sortedData.forEach((user, index) => {
            user.rank = index + 1;
        });

        setTimeout(() => {
            setLeaderboardData(sortedData);
            setLoading(false);
        }, 500);
    }, [activeTab, currentUserZone, currentUserId]);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="w-6 h-6 text-yellow-400" />;
            case 2:
                return <Medal className="w-6 h-6 text-gray-400" />;
            case 3:
                return <Medal className="w-6 h-6 text-amber-600" />;
            default:
                return <span className="w-6 h-6 flex items-center justify-center text-white font-bold">{rank}</span>;
        }
    };

    const getScoreValue = (user: LeaderboardUser) => {
        switch (activeTab) {
            case 'trust':
                return user.trustScore;
            case 'impact':
                return user.rwisScore;
            case 'xp':
                return user.totalXP;
            default:
                return user.trustScore;
        }
    };

    const getScoreLabel = () => {
        switch (activeTab) {
            case 'trust':
                return 'Trust Score';
            case 'impact':
                return 'Impact Score';
            case 'xp':
                return 'Total XP';
            default:
                return 'Trust Score';
        }
    };

    if (loading) {
        return (
            <div className="leaderboard-container">
                <div className="loading-state">
                    <div className="pixel-loader"></div>
                    <div className="loading-text">Loading Leaderboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="leaderboard-container">
            {/* Header */}
            <div className="leaderboard-header">
                <div className="flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    <div>
                        <h2 className="text-2xl font-bold text-white font-mono">LOCAL LEADERBOARD</h2>
                        <div className="flex items-center gap-2 text-gray-300">
                            <MapPin className="w-4 h-4" />
                            <span className="font-mono text-sm">{currentUserZone.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                    <Users className="w-5 h-5" />
                    <span className="font-mono">{leaderboardData.length} Heroes</span>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="leaderboard-tabs">
                <button
                    onClick={() => setActiveTab('trust')}
                    className={`tab-button ${activeTab === 'trust' ? 'active' : ''}`}
                >
                    <Shield className="w-4 h-4" />
                    TRUST SCORE
                </button>
                <button
                    onClick={() => setActiveTab('impact')}
                    className={`tab-button ${activeTab === 'impact' ? 'active' : ''}`}
                >
                    <TrendingUp className="w-4 h-4" />
                    IMPACT SCORE
                </button>
                <button
                    onClick={() => setActiveTab('xp')}
                    className={`tab-button ${activeTab === 'xp' ? 'active' : ''}`}
                >
                    <Zap className="w-4 h-4" />
                    TOTAL XP
                </button>
            </div>

            {/* Leaderboard List */}
            <div className="leaderboard-list">
                {leaderboardData.map((user) => (
                    <div 
                        key={user.id} 
                        className={`leaderboard-entry ${user.isCurrentUser ? 'current-user' : ''} ${user.rank <= 3 ? 'top-three' : ''}`}
                    >
                        {/* Rank */}
                        <div className="rank-section">
                            {getRankIcon(user.rank)}
                        </div>

                        {/* User Info */}
                        <div className="user-info">
                            <div className="user-avatar">{user.avatar}</div>
                            <div className="user-details">
                                <div className="username">{user.username}</div>
                                <div className="user-level">Level {user.level}</div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="user-stats">
                            <div className="primary-stat">
                                <div className="stat-value">{getScoreValue(user)}</div>
                                <div className="stat-label">{getScoreLabel()}</div>
                            </div>
                            <div className="secondary-stats">
                                <div className="stat-item">
                                    <Star className="w-3 h-3 text-yellow-400" />
                                    <span>{user.badges}</span>
                                </div>
                            </div>
                        </div>

                        {/* Rank Change Indicator */}
                        {user.rank <= 3 && (
                            <div className="rank-indicator">
                                <div className={`rank-badge rank-${user.rank}`}>
                                    #{user.rank}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="leaderboard-footer">
                <div className="text-center text-gray-400 font-mono text-sm">
                    Rankings update every hour • Compete with local heroes!
                </div>
            </div>
        </div>
    );
};

export default LocalLeaderboard;