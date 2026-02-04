import React, { useState, useEffect } from 'react';
import { WorkCategory, TaskRequirements, TaskRewards } from '../../types/api';
import './TaskCreationForm.css';

interface TaskCreationData {
  title: string;
  description: string;
  category: WorkCategory;
  requirements: TaskRequirements;
  rewards: TaskRewards;
  deadline: string;
}

interface TaskCreationFormProps {
  organizationId: string;
  onTaskCreated?: (taskId: string) => void;
  onCancel?: () => void;
}

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  organizationId,
  onTaskCreated,
  onCancel
}) => {
  const [formData, setFormData] = useState<TaskCreationData>({
    title: '',
    description: '',
    category: 'COMMUNITY',
    requirements: {
      skills: [],
      trustScoreMin: 0,
      timeCommitment: 1,
      location: '',
      level: 1,
      specificBadges: []
    },
    rewards: {
      xp: 50,
      trustScoreBonus: 5,
      rwisPoints: 10,
      badges: [],
      payment: undefined
    },
    deadline: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryInfo = {
    FREELANCE: {
      name: 'Freelance Tower',
      icon: '🏢',
      description: 'Individual client work with payment',
      showPayment: true
    },
    COMMUNITY: {
      name: 'Community Garden',
      icon: '🌱',
      description: 'Volunteer community service',
      showPayment: false
    },
    CORPORATE: {
      name: 'Corporate Castle',
      icon: '🏰',
      description: 'Structured organizational tasks',
      showPayment: false
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('requirements.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          [field]: field === 'skills' ? value.split(',').map(s => s.trim()).filter(s => s) : 
                   ['trustScoreMin', 'timeCommitment', 'level'].includes(field) ? Number(value) : value
        }
      }));
    } else if (name.startsWith('rewards.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        rewards: {
          ...prev.rewards,
          [field]: ['xp', 'trustScoreBonus', 'rwisPoints', 'payment'].includes(field) ? 
                   (value === '' ? undefined : Number(value)) : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (error) setError(null);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.requirements.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: {
          ...prev.requirements,
          skills: [...prev.requirements.skills, skillInput.trim()]
        }
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        skills: prev.requirements.skills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (formData.title.length < 5) return 'Title must be at least 5 characters';
    if (!formData.description.trim()) return 'Description is required';
    if (formData.description.length < 20) return 'Description must be at least 20 characters';
    if (formData.requirements.skills.length === 0) return 'At least one skill is required';
    if (formData.requirements.timeCommitment <= 0) return 'Time commitment must be positive';
    if (formData.rewards.xp <= 0) return 'XP reward must be positive';
    if (formData.rewards.trustScoreBonus < 0) return 'Trust score bonus cannot be negative';
    if (formData.rewards.rwisPoints < 0) return 'RWIS points cannot be negative';
    if (formData.category === 'FREELANCE' && (!formData.rewards.payment || formData.rewards.payment <= 0)) {
      return 'Payment is required for freelance tasks';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const taskData = {
        ...formData,
        organizationId,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT auth
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create task');
      }

      if (onTaskCreated) {
        onTaskCreated(data.data.id);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while creating the task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-creation-form">
      <div className="form-header">
        <h2>Create New Task</h2>
        <p>Post a new opportunity for volunteers and freelancers</p>
      </div>

      <form onSubmit={handleSubmit} className="task-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="title" className="form-label">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter a clear, descriptive title"
              maxLength={200}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">Category *</label>
            <div className="category-selector">
              {Object.entries(categoryInfo).map(([key, info]) => (
                <label key={key} className={`category-option ${formData.category === key ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="category"
                    value={key}
                    checked={formData.category === key}
                    onChange={handleInputChange}
                  />
                  <div className="category-content">
                    <span className="category-icon">{info.icon}</span>
                    <div className="category-info">
                      <div className="category-name">{info.name}</div>
                      <div className="category-description">{info.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              placeholder="Provide detailed information about the task, expectations, and deliverables..."
              maxLength={2000}
              rows={6}
              required
            />
            <div className="char-count">{formData.description.length}/2000</div>
          </div>

          <div className="form-group">
            <label htmlFor="deadline" className="form-label">Deadline</label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              className="form-input"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </div>

        {/* Requirements */}
        <div className="form-section">
          <h3>Requirements</h3>
          
          <div className="form-group">
            <label className="form-label">Required Skills *</label>
            <div className="skills-input">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="form-input"
                placeholder="Enter a skill and press Add"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button type="button" onClick={addSkill} className="add-skill-btn">Add</button>
            </div>
            <div className="skills-list">
              {formData.requirements.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="remove-skill">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="requirements.trustScoreMin" className="form-label">Min Trust Score</label>
              <input
                type="number"
                name="requirements.trustScoreMin"
                value={formData.requirements.trustScoreMin}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                max="1000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="requirements.timeCommitment" className="form-label">Time Commitment (hours) *</label>
              <input
                type="number"
                name="requirements.timeCommitment"
                value={formData.requirements.timeCommitment}
                onChange={handleInputChange}
                className="form-input"
                min="0.5"
                step="0.5"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="requirements.level" className="form-label">Min Level</label>
              <input
                type="number"
                name="requirements.level"
                value={formData.requirements.level}
                onChange={handleInputChange}
                className="form-input"
                min="1"
                max="100"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="requirements.location" className="form-label">Location</label>
            <input
              type="text"
              name="requirements.location"
              value={formData.requirements.location}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Specific location if required (optional)"
            />
          </div>
        </div>

        {/* Rewards */}
        <div className="form-section">
          <h3>Rewards</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="rewards.xp" className="form-label">XP Reward *</label>
              <input
                type="number"
                name="rewards.xp"
                value={formData.rewards.xp}
                onChange={handleInputChange}
                className="form-input"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rewards.trustScoreBonus" className="form-label">Trust Score Bonus *</label>
              <input
                type="number"
                name="rewards.trustScoreBonus"
                value={formData.rewards.trustScoreBonus}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="rewards.rwisPoints" className="form-label">RWIS Points *</label>
              <input
                type="number"
                name="rewards.rwisPoints"
                value={formData.rewards.rwisPoints}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                required
              />
            </div>
          </div>

          {categoryInfo[formData.category].showPayment && (
            <div className="form-group">
              <label htmlFor="rewards.payment" className="form-label">Payment Amount ($) *</label>
              <input
                type="number"
                name="rewards.payment"
                value={formData.rewards.payment || ''}
                onChange={handleInputChange}
                className="form-input"
                min="0"
                step="0.01"
                placeholder="0.00"
                required={formData.category === 'FREELANCE'}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="cancel-btn" disabled={loading}>
              Cancel
            </button>
          )}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating Task...
              </>
            ) : (
              'Create Task'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskCreationForm;