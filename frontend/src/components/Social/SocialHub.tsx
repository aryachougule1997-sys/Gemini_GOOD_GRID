import React, { useState } from 'react';
import { Users, Trophy, Search, MessageCircle, Bell } from 'lucide-react';
import LocalLeaderboard from './LocalLeaderboard';
import TeamFormation from './TeamFormation';
import UserDiscovery from './UserDiscovery';
import './SocialFeatures.css';

interface SocialHubProps {
    currentUserId: string;
    currentUserZone: string;
}

const SocialHub: React.FC<SocialHubProps> = ({ currentUserId, currentUserZone }) => {
    const [activeTab, setActiveTab] = useState<'discovery' | 'teams' | 'leaderboard' | 'notifications'>('discovery');
    const [notifications] = useState([
        {
            id: '1',
            type: 'team_invite',
            message: 'CodeMaster invited you to join "Web Dev Dream Team"',
            timestamp: '5 minutes ago',
            unread: true
        },
        {
            id: '2',
            type: 'achievement',
            message: 'CommunityHero earned a new badge: "Environmental Champion"',
            timestamp: '1 hour ago',
            unread: true
        },
        {
            id: '3',
            type: 'leaderboard',
            message: 'You moved up to #3 in the local Trust Score leaderboard!',
            timestamp: '2 hours ago',
            unread: false
        }
    ]);

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="social-hub-container">
            {/* Social Hub Header */}
            <div className="social-hub-header">
                <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-cyan-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-white font-mono">SOCIAL HUB</h1>
                        <div className="text-gray-300 font-mono text-sm">Connect • Collaborate • Compete</div>
                    </div>
                </div>
                
                <div className="social-stats">
                    <div className="stat-bubble">
                        <Users className="w-5 h-5 text-green-400" />
                        <span className="stat-value">24</span>
                        <span className="stat-label">Online</span>
                    </div>
                    <div className="stat-bubble">
                        <MessageCircle className="w-5 h-5 text-blue-400" />
                        <span className="stat-value">7</span>
                        <span className="stat-label">Teams</span>
                    </div>
                    <div className="stat-bubble">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="stat-value">#3</span>
                        <span className="stat-label">Rank</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="social-nav-tabs">
                <button
                    onClick={() => setActiveTab('discovery')}
                    className={`social-tab ${activeTab === 'discovery' ? 'active' : ''}`}
                >
                    <Search className="w-5 h-5" />
                    <span>DISCOVER</span>
                    <div className="tab-description">Find nearby heroes</div>
                </button>
                
                <button
                    onClick={() => setActiveTab('teams')}
                    className={`social-tab ${activeTab === 'teams' ? 'active' : ''}`}
                >
                    <Users className="w-5 h-5" />
                    <span>TEAMS</span>
                    <div className="tab-description">Form epic squads</div>
                </button>
                
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`social-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
                >
                    <Trophy className="w-5 h-5" />
                    <span>LEADERBOARD</span>
                    <div className="tab-description">Compete locally</div>
                </button>
                
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={`social-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                >
                    <Bell className="w-5 h-5" />
                    <span>ACTIVITY</span>
                    <div className="tab-description">Latest updates</div>
                    {unreadCount > 0 && (
                        <div className="notification-badge">{unreadCount}</div>
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <div className="social-content">
                {activeTab === 'discovery' && (
                    <UserDiscovery 
                        currentUserId={currentUserId}
                        currentUserZone={currentUserZone}
                    />
                )}
                
                {activeTab === 'teams' && (
                    <TeamFormation 
                        currentUserId={currentUserId}
                        currentUserZone={currentUserZone}
                    />
                )}
                
                {activeTab === 'leaderboard' && (
                    <LocalLeaderboard 
                        currentUserId={currentUserId}
                        currentUserZone={currentUserZone}
                    />
                )}
                
                {activeTab === 'notifications' && (
                    <div className="notifications-panel">
                        <div className="notifications-header">
                            <h2 className="text-2xl font-bold text-white font-mono">ACTIVITY FEED</h2>
                            <div className="text-gray-300 font-mono text-sm">Stay updated with your community</div>
                        </div>
                        
                        <div className="notifications-list">
                            {notifications.map((notification) => (
                                <div 
                                    key={notification.id} 
                                    className={`notification-item ${notification.unread ? 'unread' : ''}`}
                                >
                                    <div className="notification-icon">
                                        {notification.type === 'team_invite' && <Users className="w-5 h-5 text-blue-400" />}
                                        {notification.type === 'achievement' && <Trophy className="w-5 h-5 text-yellow-400" />}
                                        {notification.type === 'leaderboard' && <Trophy className="w-5 h-5 text-green-400" />}
                                    </div>
                                    <div className="notification-content">
                                        <div className="notification-message">{notification.message}</div>
                                        <div className="notification-timestamp">{notification.timestamp}</div>
                                    </div>
                                    {notification.unread && (
                                        <div className="unread-indicator"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {notifications.length === 0 && (
                            <div className="empty-notifications">
                                <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white font-mono mb-2">No Activity Yet</h3>
                                <p className="text-gray-400 font-mono text-sm">
                                    Start connecting with other heroes to see updates here!
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialHub;