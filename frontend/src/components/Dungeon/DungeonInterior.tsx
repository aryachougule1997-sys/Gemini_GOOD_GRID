import React, { useState, useEffect } from 'react';
import { Dungeon, Task, WorkCategory } from '../../../../shared/types';
import { DungeonService } from '../../services/dungeonService';
import { taskManagementService } from '../../services/taskManagementService';
import TaskList from './TaskList';
import TaskCreationForm from '../TaskManagement/TaskCreationForm';
import TaskApplicationManager from '../TaskManagement/TaskApplicationManager';
import './Dungeon.css';

interface DungeonInteriorProps {
  dungeon: Dungeon;
  onExit: () => void;
  onTaskSelect: (task: Task) => void;
  userStats: {
    trustScore: number;
    level: number;
    badges: string[];
  };
  canCreateTasks?: boolean;
}

const DungeonInterior: React.FC<DungeonInteriorProps> = ({
  dungeon,
  onExit,
  onTaskSelect,
  userStats,
  canCreateTasks = false
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskCreation, setShowTaskCreation] = useState(false);
  const [showApplicationManager, setShowApplicationManager] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryInfo = DungeonService.getCategoryInfo(dungeon.type);

  useEffect(() => {
    loadTasks();
  }, [dungeon.id]);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the new task management service to load tasks
      const dungeonTasks = await taskManagementService.getTasksByCategory(
        dungeon.type,
        dungeon.id
      );
      setTasks(dungeonTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    onTaskSelect(task);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const handleApplicationProcessed = () => {
    // Refresh tasks to update any status changes
    loadTasks();
  };

  const filteredTasks = tasks.filter(task => {
    if (selectedCategory === 'all') return true;
    return task.category === selectedCategory.toUpperCase();
  });

  const getInteriorDescription = (category: WorkCategory): string => {
    switch (category) {
      case 'FREELANCE':
        return 'Welcome to the Freelance Tower! Here you can find individual client projects, showcase your portfolio, and build your independent career.';
      case 'COMMUNITY':
        return 'Welcome to the Community Garden! This is where volunteers gather to make a positive impact on their local communities.';
      case 'CORPORATE':
        return 'Welcome to the Corporate Castle! Discover structured career opportunities and professional development programs.';
      default:
        return 'Welcome to this opportunity hub!';
    }
  };

  return (
    <div className={`dungeon-interior ${dungeon.type.toLowerCase()}`}>
      {/* Header */}
      <div className="dungeon-header">
        <button className="exit-button" onClick={onExit}>
          ← Exit
        </button>
        <div className="dungeon-title">
          <h1>{dungeon.name}</h1>
          <span className="dungeon-category">{categoryInfo.name}</span>
        </div>
        
        {/* Action buttons */}
        <div className="dungeon-actions">
          {canCreateTasks && (
            <button
              onClick={() => setShowTaskCreation(true)}
              className="create-task-button"
            >
              Create Task
            </button>
          )}
          
          {selectedTask && canCreateTasks && (
            <button
              onClick={() => setShowApplicationManager(true)}
              className="manage-applications-button"
            >
              Manage Applications
            </button>
          )}
        </div>
      </div>

      {/* Interior description */}
      <div className="dungeon-description">
        <p>{getInteriorDescription(dungeon.type)}</p>
      </div>

      {/* Special features */}
      {dungeon.specialFeatures && dungeon.specialFeatures.length > 0 && (
        <div className="special-features">
          <h3>Special Features</h3>
          <div className="features-grid">
            {dungeon.specialFeatures.map((feature, index) => (
              <div key={index} className="feature-item">
                {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task filters */}
      <div className="task-filters">
        <h3>Available Opportunities</h3>
        <div className="filter-buttons">
          <button 
            className={selectedCategory === 'all' ? 'active' : ''}
            onClick={() => setSelectedCategory('all')}
          >
            All ({tasks.length})
          </button>
          {dungeon.type === 'FREELANCE' && (
            <button 
              className={selectedCategory === 'freelance' ? 'active' : ''}
              onClick={() => setSelectedCategory('freelance')}
            >
              Freelance ({tasks.filter(t => t.category === 'FREELANCE').length})
            </button>
          )}
          {dungeon.type === 'COMMUNITY' && (
            <button 
              className={selectedCategory === 'community' ? 'active' : ''}
              onClick={() => setSelectedCategory('community')}
            >
              Community ({tasks.filter(t => t.category === 'COMMUNITY').length})
            </button>
          )}
          {dungeon.type === 'CORPORATE' && (
            <button 
              className={selectedCategory === 'corporate' ? 'active' : ''}
              onClick={() => setSelectedCategory('corporate')}
            >
              Corporate ({tasks.filter(t => t.category === 'CORPORATE').length})
            </button>
          )}
        </div>
      </div>

      {/* Tasks section */}
      <div className="tasks-section">
        {loading ? (
          <div className="loading-spinner">Loading opportunities...</div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Failed to Load Tasks</h3>
            <p>{error}</p>
            <button onClick={loadTasks} className="retry-button">
              Try Again
            </button>
          </div>
        ) : filteredTasks.length > 0 ? (
          <TaskList 
            tasks={filteredTasks}
            onTaskSelect={handleTaskSelect}
            userStats={userStats}
          />
        ) : (
          <div className="no-tasks">
            <p>No opportunities available at the moment.</p>
            <p>Check back later for new {categoryInfo.name.toLowerCase()}!</p>
          </div>
        )}
      </div>

      {/* Entry requirements info */}
      <div className="entry-requirements">
        <h4>Entry Requirements</h4>
        <div className="requirements-list">
          {dungeon.entryRequirements.trustScore && (
            <div className="requirement-item">
              Trust Score: {dungeon.entryRequirements.trustScore}+
              {userStats.trustScore >= dungeon.entryRequirements.trustScore ? ' ✅' : ' ❌'}
            </div>
          )}
          {dungeon.entryRequirements.level && (
            <div className="requirement-item">
              Level: {dungeon.entryRequirements.level}+
              {userStats.level >= dungeon.entryRequirements.level ? ' ✅' : ' ❌'}
            </div>
          )}
          {dungeon.entryRequirements.badges && dungeon.entryRequirements.badges.length > 0 && (
            <div className="requirement-item">
              Required Badges: {dungeon.entryRequirements.badges.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Modal */}
      {showTaskCreation && (
        <TaskCreationForm
          isOpen={showTaskCreation}
          onClose={() => setShowTaskCreation(false)}
          onTaskCreated={handleTaskCreated}
          defaultCategory={dungeon.type}
          dungeonId={dungeon.id}
        />
      )}

      {/* Application Manager Modal */}
      {showApplicationManager && selectedTask && (
        <TaskApplicationManager
          task={selectedTask}
          isOpen={showApplicationManager}
          onClose={() => setShowApplicationManager(false)}
          onApplicationProcessed={handleApplicationProcessed}
        />
      )}
    </div>
  );
};

export default DungeonInterior;