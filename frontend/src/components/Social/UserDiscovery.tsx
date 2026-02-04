import React, { useState, useEffect } from 'react';
import { MapPin, Users, Star, Shield, Zap, MessageCircle, UserPlus, Filter, Search } from 'lucide-react';
import './SocialFeatures.css';

interface NearbyUser {
    id: string;
    username: string;
    avatar: string;
    level: number;
    trustScore: number;
    rwisScore: number;
    totalXP: number;
    zone: string;
    distance: number; // in km
    specializations: string[];
    badges: number;
    availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
    lastActive: string;
    mutualConnections: number;
    isOnline: boolean;
}

interface UserDiscoveryProps {
    currentUserId: string;
    currentUserZone: string;
}

const UserDiscovery: React.FC<UserDiscoveryProps> = ({ currentUserId, currentUserZone }) => {
    const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<NearbyUser[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE' | 'BUSY' | 'OFFLINE'>('ALL');
    const [sortBy, setSortBy] = useState<'distance' | 'level' | 'trust' | 'activity'>('distance');
    const [loading, setLoading] = useState(true);

    // Mock data
    useEffect(() => {
        const mockUsers: NearbyUser[] = [
            {
                id: '1',
                username: 'CommunityHero',
                avatar: '🦸‍♂️',
                level: 15,
                trustScore: 95,
                rwisScore: 180,
                totalXP: 4200,
                zone: currentUserZone,
                distance: 0.5,
                specializations: ['Event Planning', 'Community Outreach', 'Fundraising'],
                badges: 12,
                availability: 'AVAILABLE',
                lastActive: '2 minutes ago',
                mutualConnections: 3,
                isOnline: true
            },
            {
                id: '2',
                username: 'CodeMaster',
                avatar: '👨‍💻',
                level: 14,
                trustScore: 92,
                rwisScore: 165,
                totalXP: 3800,
                zone: currentUserZone,
                distance: 1.2,
                specializations: ['React', 'Node.js', 'Full Stack Development'],
                badges: 10,
                availability: 'BUSY',
                lastActive: '15 minutes ago',
                mutualConnections: 1,
                isOnline: true
            },
            {
                id: '3',
                username: 'EcoWarrior',
                avatar: '🌱',
                level: 11,
                trustScore: 85,
                rwisScore: 140,
                totalXP: 3200,
                zone: currentUserZone,
                distance: 2.1,
                specializations: ['Environmental Projects', 'Sustainability', 'Education'],
                badges: 9,
                availability: 'AVAILABLE',
                lastActive: '1 hour ago',
                mutualConnections: 2,
                isOnline: false
            },
            {
                id: '4',
                username: 'TechNinja',
                avatar: '🥷',
                level: 10,
                trustScore: 82,
                rwisScore: 135,
                totalXP: 3000,
                zone: currentUserZone,
                distance: 3.5,
                specializations: ['JavaScript', 'Python', 'Data Analysis'],
                badges: 7,
                availability: 'OFFLINE',
                lastActive: '3 hours ago',
                mutualConnections: 0,
                isOnline: false
            },
            {
                id: '5',
                username: 'DesignGuru',
                avatar: '🎨',
                level: 13,
                trustScore: 88,
                rwisScore: 155,
                totalXP: 3600,
                zone: currentUserZone,
                distance: 4.2,
                specializations: ['UI/UX Design', 'Branding', 'Creative Direction'],
                badges: 11,
                availability: 'AVAILABLE',
                lastActive: '30 minutes ago',
                mutualConnections: 4,
                isOnline: true
            }
        ];

        setTimeout(() => {
            setNearbyUsers(mockUsers);
            setLoading(false);
        }, 800);
    }, [currentUserZone]);

    // Filter and sort users
    useEffect(() => {
        let filtered = nearbyUsers.filter(user => {
            const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                user.specializations.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesAvailability = availabilityFilter === 'ALL' || user.availability === availabilityFilter;
            return matchesSearch && matchesAvailability;
        });

        // Sort users
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'distance':
                    return a.distance - b.distance;
                case 'level':
                    return b.level - a.level;
                case 'trust':
                    return b.trustScore - a.trustScore;
                case 'activity':
                    return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
                default:
                    return a.distance - b.distance;
            }
        });

        setFilteredUsers(filtered);
    }, [nearbyUsers, searchTerm, availabilityFilter, sortBy]);

    const getAvailabilityColor = (availability: string) => {
        switch (availability) {
            case 'AVAILABLE':
                return 'text-green-400';
            case 'BUSY':
                return 'text-yellow-400';
            case 'OFFLINE':
                return 'text-gray-400';
            default:
                return 'text-gray-400';
        }
    };

    const getAvailabilityBg = (availability: string) => {
        switch (availability) {
            case 'AVAILABLE':
                return 'bg-green-400';
            case 'BUSY':
                return 'bg-yellow-400';
            case 'OFFLINE':
                return 'bg-gray-400';
            default:
                return 'bg-gray-400';
        }
    };

    const connectWithUser = (userId: string) => {
        console.log('Connecting with user:', userId);
        // In real app, this would make an API call
    };

    const messageUser = (userId: string) => {
        console.log('Messaging user:', userId);
        // In real app, this would open chat or make an API call
    };

    if (loading) {
        return (
            <div className="user-discovery-container">
                <div className="loading-state">
                    <div className="pixel-loader"></div>
                    <div className="loading-text">Discovering Nearby Heroes...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="user-discovery-container">
            {/* Header */}
            <div className="discovery-header">
                <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-green-400" />
                    <div>
                        <h2 className="text-2xl font-bold text-white font-mono">USER DISCOVERY</h2>
                        <div className="flex items-center gap-2 text-gray-300">
                            <MapPin className="w-4 h-4" />
                            <span className="font-mono text-sm">{currentUserZone.toUpperCase()}</span>
                        </div>
                    </div>
                </div>
                <div className="discovery-stats">
                    <div className="stat-item">
                        <span className="stat-value">{filteredUsers.length}</span>
                        <span className="stat-label">Heroes Found</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{filteredUsers.filter(u => u.isOnline).length}</span>
                        <span className="stat-label">Online Now</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="discovery-filters">
                <div className="search-container">
                    <Search className="w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                
                <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value as any)}
                    className="filter-select"
                >
                    <option value="ALL">All Status</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="BUSY">Busy</option>
                    <option value="OFFLINE">Offline</option>
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="filter-select"
                >
                    <option value="distance">Distance</option>
                    <option value="level">Level</option>
                    <option value="trust">Trust Score</option>
                    <option value="activity">Last Active</option>
                </select>
            </div>

            {/* User List */}
            <div className="users-list">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="user-card">
                        {/* User Header */}
                        <div className="user-card-header">
                            <div className="user-avatar-section">
                                <div className="user-avatar-large">
                                    <span className="text-3xl">{user.avatar}</span>
                                    <div className={`online-indicator ${user.isOnline ? 'online' : 'offline'}`}></div>
                                </div>
                                <div className="user-basic-info">
                                    <h3 className="user-name">{user.username}</h3>
                                    <div className="user-level-badge">Level {user.level}</div>
                                    <div className={`user-availability ${getAvailabilityColor(user.availability)}`}>
                                        <div className={`availability-dot ${getAvailabilityBg(user.availability)}`}></div>
                                        {user.availability}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="user-location-info">
                                <div className="distance-badge">
                                    <MapPin className="w-3 h-3" />
                                    {user.distance}km away
                                </div>
                                <div className="last-active">
                                    Last active: {user.lastActive}
                                </div>
                            </div>
                        </div>

                        {/* User Stats */}
                        <div className="user-stats-grid">
                            <div className="stat-card trust">
                                <Shield className="w-5 h-5 text-blue-400" />
                                <div>
                                    <div className="stat-value">{user.trustScore}</div>
                                    <div className="stat-label">Trust</div>
                                </div>
                            </div>
                            <div className="stat-card impact">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                <div>
                                    <div className="stat-value">{user.rwisScore}</div>
                                    <div className="stat-label">Impact</div>
                                </div>
                            </div>
                            <div className="stat-card badges">
                                <Star className="w-5 h-5 text-purple-400" />
                                <div>
                                    <div className="stat-value">{user.badges}</div>
                                    <div className="stat-label">Badges</div>
                                </div>
                            </div>
                            <div className="stat-card connections">
                                <Users className="w-5 h-5 text-green-400" />
                                <div>
                                    <div className="stat-value">{user.mutualConnections}</div>
                                    <div className="stat-label">Mutual</div>
                                </div>
                            </div>
                        </div>

                        {/* Specializations */}
                        <div className="user-specializations">
                            <div className="specializations-label">Specializations:</div>
                            <div className="specializations-tags">
                                {user.specializations.slice(0, 3).map((spec) => (
                                    <span key={spec} className="specialization-tag">
                                        {spec}
                                    </span>
                                ))}
                                {user.specializations.length > 3 && (
                                    <span className="specialization-tag more">
                                        +{user.specializations.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="user-actions">
                            <button 
                                onClick={() => connectWithUser(user.id)}
                                className="connect-btn"
                            >
                                <UserPlus className="w-4 h-4" />
                                CONNECT
                            </button>
                            <button 
                                onClick={() => messageUser(user.id)}
                                className="message-btn"
                                disabled={!user.isOnline}
                            >
                                <MessageCircle className="w-4 h-4" />
                                MESSAGE
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="empty-state">
                    <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white font-mono mb-2">No Heroes Found</h3>
                    <p className="text-gray-400 font-mono text-sm">
                        Try adjusting your search filters or check back later!
                    </p>
                </div>
            )}
        </div>
    );
};

export default UserDiscovery;