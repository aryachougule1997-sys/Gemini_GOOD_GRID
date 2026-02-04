import React from 'react';
import { 
    X, 
    Star, 
    Calendar, 
    Clock, 
    Award, 
    Target, 
    CheckCircle, 
    AlertCircle,
    Briefcase,
    Heart,
    Shield,
    ExternalLink,
    Download
} from 'lucide-react';

interface WorkHistoryItem {
    id: string;
    title: string;
    category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
    organization: string;
    description: string;
    completionDate: string;
    duration: string;
    status: 'COMPLETED' | 'IN_PROGRESS' | 'VERIFIED';
    qualityScore: number;
    rating: number;
    xpEarned: number;
    trustScoreChange: number;
    rwisEarned: number;
    skills: string[];
    clientFeedback?: string;
    impact?: string;
    clientOrganization: string;
    projectType: string;
    deliverables: string[];
    challenges: string[];
    achievements: string[];
}

interface WorkHistoryDetailModalProps {
    workItem: WorkHistoryItem;
    isOpen: boolean;
    onClose: () => void;
}

const WorkHistoryDetailModal: React.FC<WorkHistoryDetailModalProps> = ({ workItem, isOpen, onClose }) => {
    if (!isOpen) return null;

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'FREELANCE': return <Briefcase className="w-5 h-5 text-blue-400" />;
            case 'COMMUNITY': return <Heart className="w-5 h-5 text-green-400" />;
            case 'CORPORATE': return <Shield className="w-5 h-5 text-purple-400" />;
            default: return <Star className="w-5 h-5" />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'FREELANCE': return 'from-blue-500 to-cyan-500';
            case 'COMMUNITY': return 'from-green-500 to-emerald-500';
            case 'CORPORATE': return 'from-purple-500 to-violet-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'VERIFIED': return <Award className="w-5 h-5 text-yellow-400" />;
            case 'IN_PROGRESS': return <AlertCircle className="w-5 h-5 text-orange-400" />;
            default: return <Clock className="w-5 h-5 text-gray-400" />;
        }
    };

    const exportWorkItem = () => {
        const exportData = {
            title: workItem.title,
            category: workItem.category,
            organization: workItem.organization,
            description: workItem.description,
            completionDate: workItem.completionDate,
            duration: workItem.duration,
            rating: workItem.rating,
            skills: workItem.skills,
            achievements: workItem.achievements,
            impact: workItem.impact,
            clientFeedback: workItem.clientFeedback
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${workItem.title.replace(/\s+/g, '_')}_work_history.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-black/30 backdrop-blur-sm border-b border-white/10 p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${getCategoryColor(workItem.category)}`}>
                            {getCategoryIcon(workItem.category)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{workItem.title}</h2>
                            <div className="flex items-center space-x-4 text-gray-300">
                                <span>{workItem.organization}</span>
                                <span>•</span>
                                <span className="capitalize">{workItem.category.toLowerCase()}</span>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                    {getStatusIcon(workItem.status)}
                                    <span className="capitalize">{workItem.status.toLowerCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={exportWorkItem}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            title="Export work item"
                        >
                            <Download className="w-5 h-5 text-white" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-full mx-auto mb-2">
                                <Star className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div className="text-2xl font-bold text-yellow-400">{workItem.rating}</div>
                            <div className="text-sm text-gray-300">Rating</div>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mx-auto mb-2">
                                <Award className="w-6 h-6 text-purple-400" />
                            </div>
                            <div className="text-2xl font-bold text-purple-400">{workItem.xpEarned}</div>
                            <div className="text-sm text-gray-300">XP Earned</div>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mx-auto mb-2">
                                <Target className="w-6 h-6 text-green-400" />
                            </div>
                            <div className="text-2xl font-bold text-green-400">{workItem.rwisEarned}</div>
                            <div className="text-sm text-gray-300">Impact Score</div>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-4 text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mx-auto mb-2">
                                <Clock className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="text-2xl font-bold text-blue-400">{workItem.duration}</div>
                            <div className="text-sm text-gray-300">Duration</div>
                        </div>
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            {/* Description */}
                            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Project Description</h3>
                                <p className="text-gray-300 leading-relaxed">{workItem.description}</p>
                            </div>

                            {/* Skills Used */}
                            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Skills Demonstrated</h3>
                                <div className="flex flex-wrap gap-2">
                                    {workItem.skills.map((skill, index) => (
                                        <span 
                                            key={index}
                                            className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-full text-purple-300 text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Project Timeline */}
                            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Timeline</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-5 h-5 text-blue-400" />
                                        <span className="text-gray-300">Completed: {new Date(workItem.completionDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Clock className="w-5 h-5 text-green-400" />
                                        <span className="text-gray-300">Duration: {workItem.duration}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Deliverables */}
                            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Deliverables</h3>
                                <ul className="space-y-2">
                                    {workItem.deliverables.map((deliverable, index) => (
                                        <li key={index} className="flex items-center space-x-3">
                                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            <span className="text-gray-300">{deliverable}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Challenges Overcome */}
                            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Challenges Overcome</h3>
                                <ul className="space-y-2">
                                    {workItem.challenges.map((challenge, index) => (
                                        <li key={index} className="flex items-center space-x-3">
                                            <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                            <span className="text-gray-300">{challenge}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Key Achievements */}
                            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Key Achievements</h3>
                                <ul className="space-y-2">
                                    {workItem.achievements.map((achievement, index) => (
                                        <li key={index} className="flex items-center space-x-3">
                                            <Award className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                            <span className="text-gray-300">{achievement}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Impact & Feedback */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Impact Statement */}
                        {workItem.impact && (
                            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Real-World Impact</h3>
                                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-lg p-4">
                                    <p className="text-green-300 leading-relaxed">{workItem.impact}</p>
                                </div>
                            </div>
                        )}

                        {/* Client Feedback */}
                        {workItem.clientFeedback && (
                            <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                                <h3 className="text-xl font-bold text-white mb-4">Client Feedback</h3>
                                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-lg p-4">
                                    <p className="text-blue-300 leading-relaxed italic">"{workItem.clientFeedback}"</p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-gray-400 text-sm">— {workItem.clientOrganization}</span>
                                        <div className="flex items-center space-x-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    className={`w-4 h-4 ${i < workItem.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4 pt-6 border-t border-white/10">
                        <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all">
                            <ExternalLink className="w-5 h-5" />
                            <span>View Project</span>
                        </button>
                        <button 
                            onClick={exportWorkItem}
                            className="flex items-center space-x-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-all"
                        >
                            <Download className="w-5 h-5" />
                            <span>Export Details</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkHistoryDetailModal;