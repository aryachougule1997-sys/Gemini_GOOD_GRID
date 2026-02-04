import React, { useState, useEffect } from 'react';
import { Organization, Task, WorkCategory, TaskStatus } from '../../types/api';
import './OrganizationDashboard.css';

interface OrganizationStats {
  totalTasks: number;
  completedTasks: number;
  activeVolunteers: number;
  averageRating: number;
}

interface OrganizationAnalytics {
  taskMetrics: {
    totalTasks: number;
    completedTasks: number;
    averageCompletionTime: number;
    completionRate: number;
  };
  volunteerMetrics: {
    totalVolunteers: number;
    activeVolunteers: number;
    retentionRate: number;
    averageRating: number;
  };
  impactMetrics: {
    totalRWIS: number;
    peopleHelped: number;
    hoursContributed: number;
    projectsCompleted: number;
  };
  categoryBreakdown: {
    freelance: { tasks: number; volunteers: number; impact: number };
    community: { tasks: number; volunteers: number; impact: number };
    corporate: { tasks: number; volunteers: number; impact: number };
  };
}

interface OrganizationDashboardProps {
  organizationId: string;
}

const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({ organizationId }) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [stats, setStats] = useState<OrganizationStats | null>(null);
  const [analytics, setAnalytics] = useState<OrganizationAnalytics | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'volunteers' | 'analytics'>('overview');

  useEffect(() => {
    fetchOrganizationData();
  }, [organizationId]);

  const fetchOrganizationData = async () => {
    try {
      setLoading(true);
      
      // Fetch organization details and stats
      const orgResponse = await fetch(`/api/organizations/${organizationId}`);
      if (!orgResponse.ok) throw new Error('Failed to fetch organization');
      const orgData = await orgResponse.json();
      
      setOrganization(orgData.data);
      setStats(orgData.data.stats);

      // Fetch analytics
      const analyticsResponse = await fetch(`/api/organizations/${organizationId}/analytics`);
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.data);
      }

      // Fetch recent tasks
      const tasksResponse = await fetch(`/api/organizations/${organizationId}/tasks?limit=10`);
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setTasks(tasksData.data.tasks || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: TaskStatus): string => {
    switch (status) {
      case 'OPEN': return '#4CAF50';
      case 'IN_PROGRESS': return '#FF9800';
      case 'COMPLETED': return '#2196F3';
      case 'VERIFIED': return '#9C27B0';
      case 'CANCELLED': return '#F44336';
      default: return '#757575';
    }
  };

  const getCategoryIcon = (category: WorkCategory): string => {
    switch (category) {
      case 'FREELANCE': return '🏢';
      case 'COMMUNITY': return '🌱';
      case 'CORPORATE': return '🏰';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className="organization-dashboard loading">
        <div className="loading-spinner">Loading organization dashboard...</div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="organization-dashboard error">
        <div className="error-message">
          {error || 'Organization not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="organization-dashboard">
      <div className="dashboard-header">
        <div className="org-info">
          <h1 className="org-name">
            {organization.name}
            {organization.verified && <span className="verified-badge">✓ Verified</span>}
          </h1>
          <p className="org-description">{organization.description}</p>
          <div className="org-meta">
            <span className="contact-email">📧 {organization.contactEmail}</span>
            {organization.website && (
              <a href={organization.website} target="_blank" rel="noopener noreferrer" className="website-link">
                🌐 Website
              </a>
            )}
          </div>
        </div>
        
        {stats && (
          <div className="quick-stats">
            <div className="stat-card">
              <div className="stat-value">{stats.totalTasks}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.completedTasks}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.activeVolunteers}</div>
              <div className="stat-label">Active Volunteers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.averageRating.toFixed(1)}</div>
              <div className="stat-label">Avg Rating</div>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button 
          className={`tab ${activeTab === 'volunteers' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteers')}
        >
          Volunteers
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="recent-tasks">
              <h3>Recent Tasks</h3>
              <div className="tasks-list">
                {tasks.length > 0 ? (
                  tasks.map(task => (
                    <div key={task.id} className="task-item">
                      <div className="task-header">
                        <span className="task-category">{getCategoryIcon(task.category)}</span>
                        <h4 className="task-title">{task.title}</h4>
                        <span 
                          className="task-status"
                          style={{ backgroundColor: getStatusColor(task.status) }}
                        >
                          {task.status}
                        </span>
                      </div>
                      <p className="task-description">{task.description.substring(0, 100)}...</p>
                      <div className="task-meta">
                        <span>XP: {task.rewards.xp}</span>
                        <span>RWIS: {task.rewards.rwisPoints}</span>
                        {task.deadline && (
                          <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-tasks">No tasks found</div>
                )}
              </div>
            </div>

            {analytics && (
              <div className="impact-summary">
                <h3>Impact Summary</h3>
                <div className="impact-metrics">
                  <div className="metric">
                    <div className="metric-value">{analytics.impactMetrics.totalRWIS}</div>
                    <div className="metric-label">Total RWIS</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">{analytics.impactMetrics.peopleHelped}</div>
                    <div className="metric-label">People Helped</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">{analytics.impactMetrics.hoursContributed}</div>
                    <div className="metric-label">Hours Contributed</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">{analytics.impactMetrics.projectsCompleted}</div>
                    <div className="metric-label">Projects Completed</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-tab">
            <div className="tasks-header">
              <h3>Task Management</h3>
              <button className="create-task-btn">+ Create New Task</button>
            </div>
            <div className="tasks-filters">
              <select className="filter-select">
                <option value="">All Categories</option>
                <option value="FREELANCE">Freelance</option>
                <option value="COMMUNITY">Community</option>
                <option value="CORPORATE">Corporate</option>
              </select>
              <select className="filter-select">
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="VERIFIED">Verified</option>
              </select>
            </div>
            <div className="tasks-grid">
              {tasks.map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-card-header">
                    <span className="task-category-icon">{getCategoryIcon(task.category)}</span>
                    <span 
                      className="task-status-badge"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {task.status}
                    </span>
                  </div>
                  <h4 className="task-card-title">{task.title}</h4>
                  <p className="task-card-description">{task.description.substring(0, 120)}...</p>
                  <div className="task-card-rewards">
                    <span>🎯 {task.rewards.xp} XP</span>
                    <span>🌟 {task.rewards.rwisPoints} RWIS</span>
                    {task.rewards.payment && <span>💰 ${task.rewards.payment}</span>}
                  </div>
                  <div className="task-card-actions">
                    <button className="edit-btn">Edit</button>
                    <button className="view-btn">View Applications</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div className="volunteers-tab">
            <h3>Volunteer Management</h3>
            <div className="volunteers-content">
              <p>Volunteer management interface will be loaded here...</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="analytics-tab">
            <h3>Analytics & Reports</h3>
            <div className="analytics-grid">
              <div className="analytics-card">
                <h4>Task Performance</h4>
                <div className="analytics-metrics">
                  <div className="metric-row">
                    <span>Completion Rate:</span>
                    <span>{(analytics.taskMetrics.completionRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="metric-row">
                    <span>Avg Completion Time:</span>
                    <span>{analytics.taskMetrics.averageCompletionTime} days</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h4>Volunteer Engagement</h4>
                <div className="analytics-metrics">
                  <div className="metric-row">
                    <span>Retention Rate:</span>
                    <span>{(analytics.volunteerMetrics.retentionRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="metric-row">
                    <span>Average Rating:</span>
                    <span>{analytics.volunteerMetrics.averageRating.toFixed(1)}/5</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card category-breakdown">
                <h4>Category Breakdown</h4>
                <div className="category-stats">
                  <div className="category-stat">
                    <span className="category-icon">🏢</span>
                    <div className="category-info">
                      <div className="category-name">Freelance</div>
                      <div className="category-numbers">
                        {analytics.categoryBreakdown.freelance.tasks} tasks, 
                        {analytics.categoryBreakdown.freelance.volunteers} volunteers
                      </div>
                    </div>
                  </div>
                  <div className="category-stat">
                    <span className="category-icon">🌱</span>
                    <div className="category-info">
                      <div className="category-name">Community</div>
                      <div className="category-numbers">
                        {analytics.categoryBreakdown.community.tasks} tasks, 
                        {analytics.categoryBreakdown.community.volunteers} volunteers
                      </div>
                    </div>
                  </div>
                  <div className="category-stat">
                    <span className="category-icon">🏰</span>
                    <div className="category-info">
                      <div className="category-name">Corporate</div>
                      <div className="category-numbers">
                        {analytics.categoryBreakdown.corporate.tasks} tasks, 
                        {analytics.categoryBreakdown.corporate.volunteers} volunteers
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationDashboard;