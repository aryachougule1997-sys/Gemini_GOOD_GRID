import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Star, Shield, Zap, MessageCircle, UserPlus, X } from 'lucide-react';
import './SocialFeatures.css';

interface TeamMember {
    id: string;
    username: string;
    avatar: string;
    level: number;
    trustScore: number;
    specializations: string[];
    availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
    zone: string;
    badges: number;
    completedTasks: number;
}

interface Team {
    id: string;
    name: string;
    description: string;
    category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
    members: TeamMember[];
    maxMembers: number;
    requiredSkills: string[];
    status: 'RECRUITING' | 'ACTIVE' | 'COMPLETED';
    createdBy: string;
    taskId?: string;
}

interface TeamFormationProps {
    currentUserId: string;
    currentUserZone: string;
}

const TeamFormation: React.FC<TeamFormationProps> = ({ currentUserId, currentUserZone }) => {
    const [activeTab, setActiveTab] = useState<'browse' | 'my-teams' | 'create'>('browse');
    const [teams, setTeams] = useState<Team[]>([]);
    const [availableUsers, setAvailableUsers] = useState<TeamMember[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'FREELANCE' | 'COMMUNITY' | 'CORPORATE'>('ALL');
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Mock data
    useEffect(() => {
        const mockTeams: Team[] = [
            {
                id: '1',
                name: 'Green City Cleanup Crew',
                description: 'Join us for a city-wide environmental cleanup initiative. We need organizers, photographers, and volunteers!',
                category: 'COMMUNITY',
                members: [
                    {
                        id: '1',
                        username: 'EcoLeader',
                        avatar: '🌱',
                        level: 12,
                        trustScore: 95,
                        specializations: ['Event Planning', 'Environmental Projects'],
                        availability: 'AVAILABLE',
                        zone: currentUserZone,
                        badges: 8,
                        completedTasks: 25
                    }
                ],
                maxMembers: 5,
                requiredSkills: ['Event Planning', 'Photography', 'Community Outreach'],
                status: 'RECRUITING',
                createdBy: '1'
            },
            {
                id: '2',
                name: 'Web Dev Dream Team',
                description: 'Building a platform for local nonprofits. Looking for React developers and UI/UX designers.',
                category: 'FREELANCE',
                members: [
                    {
                        id: '2',
                        username: 'CodeMaster',
                        avatar: '👨‍💻',
                        level: 15,
                        trustScore: 92,
                        specializations: ['React', 'Node.js', 'Full Stack'],
                        availability: 'AVAILABLE',
                        zone: currentUserZone,
                        badges: 12,
                        completedTasks: 40
                    },
                    {
                        id: '3',
                        username: 'DesignGuru',
                        avatar: '🎨',
                        level: 11,
                        trustScore: 88,
                        specializations: ['UI/UX', 'Figma', 'Branding'],
                        availability: 'BUSY',
                        zone: currentUserZone,
                        badges: 9,
                        completedTasks: 30
                    }
                ],
                maxMembers: 4,
                requiredSkills: ['React', 'UI/UX Design', 'JavaScript'],
                status: 'RECRUITING',
                createdBy: '2'
            },
            {
                id: '3',
                name: 'Corporate Analytics Squad',
                description: 'Data analysis project for improving company efficiency. Need Python experts and data visualization specialists.',
                category: 'CORPORATE',
                members: [
                    {
                        id: '4',
                        username: 'DataNinja',
                        avatar: '📊',
                        level: 13,
                        trustScore: 90,
                        specializations: ['Python', 'Data Analysis', 'Machine Learning'],
                        availability: 'AVAILABLE',
                        zone: currentUserZone,
                        badges: 10,
                        completedTasks: 35
                    }
                ],
                maxMembers: 3,
                requiredSkills: ['Python', 'Data Analysis', 'SQL'],
                status: 'RECRUITING',
                createdBy: '4'
            }
        ];

        const mockUsers: TeamMember[] = [
            {
                id: '5',
                username: 'TechEnthusiast',
                avatar: '🚀',
                level: 10,
                trustScore: 85,
                specializations: ['JavaScript', 'React', 'Node.js'],
                availability: 'AVAILABLE',
                zone: currentUserZone,
                badges: 7,
                completedTasks: 20
            },
            {
                id: '6',
                username: 'CommunityBuilder',
                avatar: '🤝',
                level: 14,
                trustScore: 93,
                specializations: ['Event Planning', 'Social Media', 'Fundraising'],
                availability: 'AVAILABLE',
                zone: currentUserZone,
                badges: 11,
                completedTasks: 45
            },
            {
                id: '7',
                username: 'DataWizard',
                avatar: '🧙‍♂️',
                level: 12,
                trustScore: 87,
                specializations: ['Python', 'SQL', 'Tableau'],
                availability: 'BUSY',
                zone: currentUserZone,
                badges: 9,
                completedTasks: 28
            }
        ];

        setTeams(mockTeams);
        setAvailableUsers(mockUsers);
    }, [currentUserZone]);

    const filteredTeams = teams.filter(team => {
        const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            team.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || team.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'FREELANCE':
                return '💼';
            case 'COMMUNITY':
                return '🌱';
            case 'CORPORATE':
                return '🏢';
            default:
                return '⭐';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'FREELANCE':
                return 'from-blue-500 to-cyan-500';
            case 'COMMUNITY':
                return 'from-green-500 to-emerald-500';
            case 'CORPORATE':
                return 'from-purple-500 to-violet-500';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

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

    const joinTeam = (teamId: string) => {
        console.log('Joining team:', teamId);
        // In real app, this would make an API call
    };

    const createTeam = () => {
        setShowCreateForm(true);
    };

    return (
        <div className="team-formation-container">
            {/* Header */}
            <div className="team-header">
                <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-400" />
                    <div>
                        <h2 className="text-2xl font-bold text-white font-mono">TEAM FORMATION</h2>
                        <div className="text-gray-300 font-mono text-sm">Collaborate on epic quests together!</div>
                    </div>
                </div>
                <button 
                    onClick={createTeam}
                    className="create-team-btn"
                >
                    <Plus className="w-4 h-4" />
                    CREATE TEAM
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="team-tabs">
                <button
                    onClick={() => setActiveTab('browse')}
                    className={`tab-button ${activeTab === 'browse' ? 'active' : ''}`}
                >
                    <Search className="w-4 h-4" />
                    BROWSE TEAMS
                </button>
                <button
                    onClick={() => setActiveTab('my-teams')}
                    className={`tab-button ${activeTab === 'my-teams' ? 'active' : ''}`}
                >
                    <Users className="w-4 h-4" />
                    MY TEAMS
                </button>
            </div>

            {/* Content */}
            {activeTab === 'browse' && (
                <div className="browse-teams">
                    {/* Filters */}
                    <div className="team-filters">
                        <div className="search-container">
                            <Search className="w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search teams..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value as any)}
                            className="category-filter"
                        >
                            <option value="ALL">All Categories</option>
                            <option value="FREELANCE">Freelance</option>
                            <option value="COMMUNITY">Community</option>
                            <option value="CORPORATE">Corporate</option>
                        </select>
                    </div>

                    {/* Team List */}
                    <div className="teams-grid">
                        {filteredTeams.map((team) => (
                            <div key={team.id} className="team-card">
                                <div className="team-card-header">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{getCategoryIcon(team.category)}</span>
                                        <div>
                                            <h3 className="team-name">{team.name}</h3>
                                            <div className="team-category">{team.category}</div>
                                        </div>
                                    </div>
                                    <div className="team-status">
                                        <span className={`status-badge ${team.status.toLowerCase()}`}>
                                            {team.status}
                                        </span>
                                    </div>
                                </div>

                                <p className="team-description">{team.description}</p>

                                <div className="team-members">
                                    <div className="members-header">
                                        <span className="font-mono text-sm text-gray-300">
                                            Members ({team.members.length}/{team.maxMembers})
                                        </span>
                                    </div>
                                    <div className="members-list">
                                        {team.members.map((member) => (
                                            <div key={member.id} className="member-avatar-small">
                                                <span className="text-lg">{member.avatar}</span>
                                                <div className={`availability-dot ${getAvailabilityColor(member.availability)}`}></div>
                                            </div>
                                        ))}
                                        {Array.from({ length: team.maxMembers - team.members.length }).map((_, index) => (
                                            <div key={`empty-${index}`} className="member-slot-empty">
                                                <Plus className="w-4 h-4 text-gray-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="required-skills">
                                    <div className="font-mono text-xs text-gray-400 mb-2">Required Skills:</div>
                                    <div className="skills-tags">
                                        {team.requiredSkills.slice(0, 3).map((skill) => (
                                            <span key={skill} className="skill-tag">
                                                {skill}
                                            </span>
                                        ))}
                                        {team.requiredSkills.length > 3 && (
                                            <span className="skill-tag">+{team.requiredSkills.length - 3}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="team-actions">
                                    <button 
                                        onClick={() => joinTeam(team.id)}
                                        className="join-team-btn"
                                        disabled={team.members.length >= team.maxMembers}
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        {team.members.length >= team.maxMembers ? 'FULL' : 'JOIN TEAM'}
                                    </button>
                                    <button 
                                        onClick={() => setSelectedTeam(team)}
                                        className="view-team-btn"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        VIEW
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'my-teams' && (
                <div className="my-teams">
                    <div className="empty-state">
                        <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white font-mono mb-2">No Teams Yet</h3>
                        <p className="text-gray-400 font-mono text-sm mb-6">
                            Join a team or create your own to start collaborating!
                        </p>
                        <button onClick={createTeam} className="create-team-btn">
                            <Plus className="w-4 h-4" />
                            CREATE YOUR FIRST TEAM
                        </button>
                    </div>
                </div>
            )}

            {/* Team Detail Modal */}
            {selectedTeam && (
                <div className="team-modal-overlay">
                    <div className="team-modal">
                        <div className="team-modal-header">
                            <h2 className="text-2xl font-bold text-white font-mono">{selectedTeam.name}</h2>
                            <button 
                                onClick={() => setSelectedTeam(null)}
                                className="close-btn"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="team-modal-content">
                            <p className="text-gray-300 mb-6">{selectedTeam.description}</p>
                            
                            <div className="team-members-detailed">
                                <h3 className="text-lg font-bold text-white font-mono mb-4">Team Members</h3>
                                {selectedTeam.members.map((member) => (
                                    <div key={member.id} className="member-card">
                                        <div className="member-info">
                                            <span className="member-avatar">{member.avatar}</span>
                                            <div>
                                                <div className="member-name">{member.username}</div>
                                                <div className="member-level">Level {member.level}</div>
                                            </div>
                                        </div>
                                        <div className="member-stats">
                                            <div className="stat-item">
                                                <Shield className="w-4 h-4 text-blue-400" />
                                                <span>{member.trustScore}</span>
                                            </div>
                                            <div className="stat-item">
                                                <Star className="w-4 h-4 text-yellow-400" />
                                                <span>{member.badges}</span>
                                            </div>
                                        </div>
                                        <div className={`member-availability ${getAvailabilityColor(member.availability)}`}>
                                            {member.availability}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamFormation;