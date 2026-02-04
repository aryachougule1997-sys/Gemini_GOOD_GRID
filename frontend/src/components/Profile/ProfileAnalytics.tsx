import React, { useState } from 'react';
import { 
    TrendingUp, 
    BarChart3, 
    PieChart, 
    Calendar,
    Target,
    Award,
    Clock,
    Star,
    Zap,
    Shield,
    Heart,
    Briefcase,
    Filter,
    Download
} from 'lucide-react';

interface ProfileAnalyticsProps {
    userId: string;
}

interface AnalyticsData {
    timeRange: 'week' | 'month' | 'year';
    data: Array<{
        category: string;
        tasks_completed: number;
        total_xp: number;
        total_rwis: number;
        avg_rating: number;
        completion_day: string;
    }>;
    summary: {
        totalTasks: number;
        totalXP: number;
        totalRWIS: number;
        averageRating: number;
    };
}

const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({ userId }) => {
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
    const [selectedMetric, setSelectedMetric] = useState<'tasks' | 'xp' | 'rwis' | 'rating'>('tasks');

    // Mock analytics data - in real app, this would come from API
    const [analyticsData] = useState<AnalyticsData>({
        timeRange: 'month',
        data: [
            { category: 'FREELANCE', tasks_completed: 8, total_xp: 1200, total_rwis: 180, avg_rating: 4.7, completion_day: '2024-01-20' },
            { category: 'COMMUNITY', tasks_completed: 12, total_xp: 1800, total_rwis: 450, avg_rating: 4.9, completion_day: '2024-01-20' },
            { category: 'CORPORATE', tasks_completed: 4, total_xp: 600, total_rwis: 120, avg_rating: 4.3, completion_day: '2024-01-20' }
        ],
        summary: {
            totalTasks: 24,
            totalXP: 3600,
            totalRWIS: 750,
            averageRating: 4.6
        }
    });

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
            case 'FREELANCE': return 'bg-blue-500';
            case 'COMMUNITY': return 'bg-green-500';
            case 'CORPORATE': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    const getMetricValue = (item: any, metric: string) => {
        switch (metric) {
            case 'tasks': return item.tasks_completed;
            case 'xp': return item.total_xp;
            case 'rwis': return item.total_rwis;
            case 'rating': return item.avg_rating;
            default: return 0;
        }
    };

    const getMetricLabel = (metric: string) => {
        switch (metric) {
            case 'tasks': return 'Tasks Completed';
            case 'xp': return 'XP Earned';
            case 'rwis': return 'Impact Score';
            case 'rating': return 'Average Rating';
            default: return '';
        }
    };

    const getMetricIcon = (metric: string) => {
        switch (metric) {
            case 'tasks': return <Target className="w-5 h-5" />;
            case 'xp': return <Award className="w-5 h-5" />;
            case 'rwis': return <Zap className="w-5 h-5" />;
            case 'rating': return <Star className="w-5 h-5" />;
            default: return <BarChart3 className="w-5 h-5" />;
        }
    };

    const exportAnalytics = () => {
        const exportData = {
            userId,
            timeRange,
            generatedAt: new Date().toISOString(),
            summary: analyticsData.summary,
            categoryBreakdown: analyticsData.data,
            insights: {
                mostActiveCategory: analyticsData.data.reduce((prev, current) => 
                    prev.tasks_completed > current.tasks_completed ? prev : current
                ).category,
                highestRatedCategory: analyticsData.data.reduce((prev, current) => 
                    prev.avg_rating > current.avg_rating ? prev : current
                ).category,
                totalContributionHours: Math.floor(analyticsData.summary.totalTasks * 2.5), // Estimated
                impactPerTask: Math.round(analyticsData.summary.totalRWIS / analyticsData.summary.totalTasks)
            }
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `profile_analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const maxValue = Math.max(...analyticsData.data.map(item => getMetricValue(item, selectedMetric)));

    return (
        <div className="space-y-8">
            {/* Controls */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-gray-400" />
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value as any)}
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="week">Last Week</option>
                                <option value="month">Last Month</option>
                                <option value="year">Last Year</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={selectedMetric}
                                onChange={(e) => setSelectedMetric(e.target.value as any)}
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                                <option value="tasks">Tasks Completed</option>
                                <option value="xp">XP Earned</option>
                                <option value="rwis">Impact Score</option>
                                <option value="rating">Average Rating</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={exportAnalytics}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                        <Download className="w-5 h-5" />
                        <span>Export Analytics</span>
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full">
                            <Target className="w-6 h-6 text-blue-400" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{analyticsData.summary.totalTasks}</div>
                    <div className="text-sm text-gray-300">Total Tasks</div>
                    <div className="text-xs text-green-400 mt-2">+15% from last period</div>
                </div>

                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full">
                            <Award className="w-6 h-6 text-purple-400" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{analyticsData.summary.totalXP.toLocaleString()}</div>
                    <div className="text-sm text-gray-300">Total XP</div>
                    <div className="text-xs text-green-400 mt-2">+22% from last period</div>
                </div>

                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full">
                            <Zap className="w-6 h-6 text-green-400" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{analyticsData.summary.totalRWIS}</div>
                    <div className="text-sm text-gray-300">Impact Score</div>
                    <div className="text-xs text-green-400 mt-2">+18% from last period</div>
                </div>

                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-full">
                            <Star className="w-6 h-6 text-yellow-400" />
                        </div>
                        <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{analyticsData.summary.averageRating.toFixed(1)}</div>
                    <div className="text-sm text-gray-300">Avg Rating</div>
                    <div className="text-xs text-green-400 mt-2">+0.3 from last period</div>
                </div>
            </div>

            {/* Category Performance Chart */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Category Performance</h3>
                    <div className="flex items-center space-x-2 text-gray-300">
                        {getMetricIcon(selectedMetric)}
                        <span>{getMetricLabel(selectedMetric)}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {analyticsData.data.map((item, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {getCategoryIcon(item.category)}
                                    <span className="text-white font-medium capitalize">{item.category.toLowerCase()}</span>
                                </div>
                                <span className="text-white font-bold">
                                    {selectedMetric === 'rating' 
                                        ? getMetricValue(item, selectedMetric).toFixed(1)
                                        : getMetricValue(item, selectedMetric).toLocaleString()
                                    }
                                </span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-3">
                                <div 
                                    className={`h-3 rounded-full ${getCategoryColor(item.category)} transition-all duration-500`}
                                    style={{ 
                                        width: `${(getMetricValue(item, selectedMetric) / maxValue) * 100}%` 
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Insights */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Performance Insights</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-lg">
                            <div>
                                <div className="text-green-400 font-semibold">Most Active Category</div>
                                <div className="text-white capitalize">
                                    {analyticsData.data.reduce((prev, current) => 
                                        prev.tasks_completed > current.tasks_completed ? prev : current
                                    ).category.toLowerCase()}
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-green-400">
                                {Math.max(...analyticsData.data.map(item => item.tasks_completed))} tasks
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg">
                            <div>
                                <div className="text-yellow-400 font-semibold">Highest Rated Category</div>
                                <div className="text-white capitalize">
                                    {analyticsData.data.reduce((prev, current) => 
                                        prev.avg_rating > current.avg_rating ? prev : current
                                    ).category.toLowerCase()}
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-yellow-400">
                                {Math.max(...analyticsData.data.map(item => item.avg_rating)).toFixed(1)} ⭐
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-lg">
                            <div>
                                <div className="text-purple-400 font-semibold">Impact per Task</div>
                                <div className="text-white">Average RWIS earned</div>
                            </div>
                            <div className="text-2xl font-bold text-purple-400">
                                {Math.round(analyticsData.summary.totalRWIS / analyticsData.summary.totalTasks)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Growth Trends */}
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Growth Trends</h3>
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                                +25%
                            </div>
                            <div className="text-gray-300">Overall Growth</div>
                            <div className="text-sm text-green-400">Compared to last {timeRange}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <div className="text-xl font-bold text-blue-400">+18%</div>
                                <div className="text-sm text-gray-300">Task Completion</div>
                            </div>
                            <div className="text-center p-4 bg-white/5 rounded-lg">
                                <div className="text-xl font-bold text-green-400">+32%</div>
                                <div className="text-sm text-gray-300">Impact Score</div>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-lg">
                            <div className="text-blue-400 font-semibold mb-2">Projected Next Level</div>
                            <div className="text-white">Based on current growth rate</div>
                            <div className="text-sm text-gray-300 mt-1">Estimated: 2-3 weeks</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileAnalytics;