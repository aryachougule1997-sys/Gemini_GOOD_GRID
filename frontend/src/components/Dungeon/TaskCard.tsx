import React, { useState } from 'react';
import { Task } from '../../../../shared/types';
import TaskSubmissionModal from '../TaskSubmission/TaskSubmissionModal';
import { taskSubmissionService } from '../../services/taskSubmissionService';
import { taskManagementService } from '../../services/taskManagementService';
import './Dungeon.css';

interface TaskCardProps {
  task: Task;
  isAccessible: boolean;
  onClick: () => void;
  userStats: {
    trustScore: number;
    level: number;
    badges: string[];
  };
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isAccessible,
  onClick,
  userStats
}) => {
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');

  const getDifficultyLevel = (trustScoreMin: number): string => {
    if (trustScoreMin <= 10) return 'Beginner';
    if (trustScoreMin <= 25) return 'Intermediate';
    if (trustScoreMin <= 50) return 'Advanced';
    return 'Expert';
  };

  const getDifficultyColor = (trustScoreMin: number): string => {
    if (trustScoreMin <= 10) return '#10B981'; // Green
    if (trustScoreMin <= 25) return '#F59E0B'; // Yellow
    if (trustScoreMin <= 50) return '#EF4444'; // Red
    return '#8B5CF6'; // Purple
  };

  const formatTimeCommitment = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)} minutes`;
    if (hours === 1) return '1 hour';
    if (hours < 24) return `${hours} hours`;
    const days = Math.round(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  const formatDeadline = (deadline: Date): string => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 7) return `Due in ${diffDays} days`;
    if (diffDays < 30) return `Due in ${Math.ceil(diffDays / 7)} weeks`;
    return `Due in ${Math.ceil(diffDays / 30)} months`;
  };

  const handleApplyForTask = async () => {
    try {
      setIsApplying(true);
      await taskManagementService.applyForTask(task.id, applicationMessage);
      
      alert('Application submitted successfully! You will be notified when the task creator reviews your application.');
      setShowApplicationModal(false);
      setApplicationMessage('');
      
    } catch (error) {
      console.error('Task application failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to apply for task');
    } finally {
      setIsApplying(false);
    }
  };

  const handleSubmitTask = async (submissionText: string, files: File[]) => {
    try {
      setIsSubmitting(true);
      await taskSubmissionService.submitTaskCompletion(task.id, submissionText, files);
      
      alert('Task submitted successfully! You will be notified when it\'s reviewed.');
      setShowSubmissionModal(false);
      
    } catch (error) {
      console.error('Task submission failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const trustScoreMin = task.requirements.trustScoreMin || 0;
  const difficultyLevel = getDifficultyLevel(trustScoreMin);
  const difficultyColor = getDifficultyColor(trustScoreMin);

  return (
    <>
      <div 
        className={`task-card ${task.category.toLowerCase()} ${isAccessible ? 'accessible' : 'locked'}`}
        onClick={isAccessible ? onClick : undefined}
        style={{ cursor: isAccessible ? 'pointer' : 'default' }}
      >
        {/* Task header */}
        <div className="task-header">
          <h4 className="task-title">{task.title}</h4>
          <div 
            className="difficulty-badge"
            style={{ backgroundColor: difficultyColor }}
          >
            {difficultyLevel}
          </div>
        </div>

        {/* Task description */}
        <p className="task-description">
          {task.description.length > 120 
            ? `${task.description.substring(0, 120)}...` 
            : task.description
          }
        </p>

        {/* Task requirements */}
        <div className="task-requirements">
          <div className="requirement-item">
            <span className="requirement-label">Trust Score:</span>
            <span className={`requirement-value ${userStats.trustScore >= trustScoreMin ? 'met' : 'unmet'}`}>
              {trustScoreMin}+ {userStats.trustScore >= trustScoreMin ? '✅' : '❌'}
            </span>
          </div>
          
          {task.requirements.level && (
            <div className="requirement-item">
              <span className="requirement-label">Level:</span>
              <span className={`requirement-value ${userStats.level >= task.requirements.level ? 'met' : 'unmet'}`}>
                {task.requirements.level}+ {userStats.level >= task.requirements.level ? '✅' : '❌'}
              </span>
            </div>
          )}

          <div className="requirement-item">
            <span className="requirement-label">Time:</span>
            <span className="requirement-value">
              {formatTimeCommitment(task.requirements.timeCommitment)}
            </span>
          </div>
        </div>

        {/* Task rewards */}
        <div className="task-rewards">
          <div className="reward-item">
            <span className="reward-icon">⭐</span>
            <span className="reward-value">{task.rewards.xp} XP</span>
          </div>
          <div className="reward-item">
            <span className="reward-icon">🤝</span>
            <span className="reward-value">+{task.rewards.trustScoreBonus} Trust</span>
          </div>
          <div className="reward-item">
            <span className="reward-icon">🌍</span>
            <span className="reward-value">{task.rewards.rwisPoints} RWIS</span>
          </div>
          {task.rewards.payment && (
            <div className="reward-item">
              <span className="reward-icon">💰</span>
              <span className="reward-value">${task.rewards.payment}</span>
            </div>
          )}
        </div>

        {/* Skills required */}
        {task.requirements.skills && task.requirements.skills.length > 0 && (
          <div className="task-skills">
            <span className="skills-label">Skills:</span>
            <div className="skills-list">
              {task.requirements.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
              {task.requirements.skills.length > 3 && (
                <span className="skill-tag more">
                  +{task.requirements.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Deadline */}
        {task.deadline && (
          <div className="task-deadline">
            <span className="deadline-icon">⏰</span>
            <span className="deadline-text">
              {formatDeadline(task.deadline)}
            </span>
          </div>
        )}

        {/* Action buttons */}
        {isAccessible && task.status === 'OPEN' && (
          <div className="task-actions">
            <button
              className="apply-task-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowApplicationModal(true);
              }}
            >
              Apply for Task
            </button>
          </div>
        )}

        {/* Show submit button for tasks in progress */}
        {isAccessible && task.status === 'IN_PROGRESS' && (
          <div className="task-actions">
            <button
              className="submit-task-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowSubmissionModal(true);
              }}
            >
              Submit Completion
            </button>
          </div>
        )}

        {/* Lock indicator */}
        {!isAccessible && (
          <div className="task-lock-overlay">
            <div className="lock-icon">🔒</div>
            <div className="lock-message">
              Requirements not met
            </div>
          </div>
        )}

        {/* Category indicator */}
        <div className="task-category-indicator">
          {task.category}
        </div>
      </div>

      {/* Task Application Modal */}
      {showApplicationModal && (
        <div className="modal-overlay">
          <div className="application-modal">
            <div className="modal-header">
              <h3>Apply for Task</h3>
              <button 
                className="close-button" 
                onClick={() => {
                  setShowApplicationModal(false);
                  setApplicationMessage('');
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="task-summary">
                <h4>{task.title}</h4>
                <p>{task.description}</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="applicationMessage">
                  Application Message (Optional)
                </label>
                <textarea
                  id="applicationMessage"
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="Tell the task creator why you're the right person for this job..."
                  rows={4}
                />
              </div>
              
              <div className="modal-actions">
                <button
                  onClick={() => {
                    setShowApplicationModal(false);
                    setApplicationMessage('');
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyForTask}
                  className="apply-button"
                  disabled={isApplying}
                >
                  {isApplying ? 'Applying...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Submission Modal */}
      {showSubmissionModal && (
        <TaskSubmissionModal
          task={task}
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
          onSubmit={handleSubmitTask}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

export default TaskCard;