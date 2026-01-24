import React, { useState, useEffect } from 'react';
import { WorkCategory, TaskRequirements, TaskRewards } from '../../../../shared/types';
import { taskManagementService } from '../../services/taskManagementService';
import './TaskManagement.css';

interface TaskCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: any) => void;
  defaultCategory?: WorkCategory;
  dungeonId?: string;
  organizationId?: string;
}

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  defaultCategory,
  dungeonId,
  organizationId
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: defaultCategory || 'COMMUNITY' as WorkCategory,
    requirements: {
      skills: [''],
      trustScoreMin: 0,
      timeCommitment: 1,
      location: '',
      level: 1,
      specificBadges: []
    } as TaskRequirements,
    rewards: {
      xp: 10,
      trustScoreBonus: 1,
      rwisPoints: 5,
      badges: [],
      payment: undefined
    } as TaskRewards,
    deadline: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (defaultCategory) {
      setFormData(prev => ({ ...prev, category: defaultCategory }));
    }
  }, [defaultCategory]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRequirementChange = (field: keyof TaskRequirements, value: any) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [field]: value
      }
    }));
  };

  const handleRewardChange = (field: keyof TaskRewards, value: any) => {
    setFormData(prev => ({
      ...prev,
      rewards: {
        ...prev.rewards,
        [field]: value
      }
    }));
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...formData.requirements.skills];
    newSkills[index] = value;
    handleRequirementChange('skills', newSkills);
  };

  const addSkill = () => {
    handleRequirementChange('skills', [...formData.requirements.skills, '']);
  };

  const removeSkill = (index: number) => {
    const newSkills = formData.requirements.skills.filter((_, i) => i !== index);
    handleRequirementChange('skills', newSkills);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    const validSkills = formData.requirements.skills.filter(skill => skill.trim());
    if (validSkills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }

    if (formData.requirements.timeCommitment <= 0) {
      newErrors.timeCommitment = 'Time commitment must be positive';
    }

    if (formData.rewards.xp <= 0) {
      newErrors.xp = 'XP reward must be positive';
    }

    if (formData.category === 'FREELANCE' && (!formData.rewards.payment || formData.rewards.payment <= 0)) {
      newErrors.payment = 'Freelance tasks must have a payment amount';
    }

    if (formData.category === 'COMMUNITY' && formData.rewards.payment) {
      newErrors.payment = 'Community tasks should not have payment';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty skills
      const cleanedRequirements = {
        ...formData.requirements,
        skills: formData.requirements.skills.filter(skill => skill.trim())
      };

      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        dungeonId,
        organizationId,
        requirements: cleanedRequirements,
        rewards: formData.rewards,
        deadline: formData.deadline ? new Date(formData.deadline) : null
      };

      const task = await taskManagementService.createTask(taskData);
      onTaskCreated(task);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: defaultCategory || 'COMMUNITY',
        requirements: {
          skills: [''],
          trustScoreMin: 0,
          timeCommitment: 1,
          location: '',
          level: 1,
          specificBadges: []
        },
        rewards: {
          xp: 10,
          trustScoreBonus: 1,
          rwisPoints: 5,
          badges: [],
          payment: undefined
        },
        deadline: ''
      });
      
    } catch (error) {
      console.error('Task creation failed:', error);
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to create task' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="task-creation-modal">
        <div className="modal-header">
          <h2>Create New Task</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="task-creation-form">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="title">Task Title *</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter a clear, descriptive title"
                className={errors.title ? 'error' : ''}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide detailed information about the task, expectations, and deliverables"
                rows={4}
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as WorkCategory)}
                disabled={!!defaultCategory}
              >
                <option value="FREELANCE">Freelance (Paid Work)</option>
                <option value="COMMUNITY">Community (Volunteering)</option>
                <option value="CORPORATE">Corporate (Organizational)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="deadline">Deadline (Optional)</label>
              <input
                id="deadline"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="form-section">
            <h3>Requirements</h3>
            
            <div className="form-group">
              <label>Required Skills *</label>
              {formData.requirements.skills.map((skill, index) => (
                <div key={index} className="skill-input-group">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder="Enter a skill (e.g., JavaScript, Design, Communication)"
                  />
                  {formData.requirements.skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="remove-skill-button"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addSkill} className="add-skill-button">
                Add Another Skill
              </button>
              {errors.skills && <span className="error-message">{errors.skills}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="trustScore">Minimum Trust Score</label>
                <input
                  id="trustScore"
                  type="number"
                  min="0"
                  max="1000"
                  value={formData.requirements.trustScoreMin}
                  onChange={(e) => handleRequirementChange('trustScoreMin', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="level">Minimum Level</label>
                <input
                  id="level"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.requirements.level}
                  onChange={(e) => handleRequirementChange('level', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="timeCommitment">Time Commitment (hours) *</label>
              <input
                id="timeCommitment"
                type="number"
                min="0.5"
                step="0.5"
                value={formData.requirements.timeCommitment}
                onChange={(e) => handleRequirementChange('timeCommitment', parseFloat(e.target.value) || 1)}
                className={errors.timeCommitment ? 'error' : ''}
              />
              {errors.timeCommitment && <span className="error-message">{errors.timeCommitment}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="location">Location (Optional)</label>
              <input
                id="location"
                type="text"
                value={formData.requirements.location}
                onChange={(e) => handleRequirementChange('location', e.target.value)}
                placeholder="Specify if location-specific (e.g., Remote, New York, Online)"
              />
            </div>
          </div>

          {/* Rewards */}
          <div className="form-section">
            <h3>Rewards</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="xp">XP Reward *</label>
                <input
                  id="xp"
                  type="number"
                  min="1"
                  value={formData.rewards.xp}
                  onChange={(e) => handleRewardChange('xp', parseInt(e.target.value) || 10)}
                  className={errors.xp ? 'error' : ''}
                />
                {errors.xp && <span className="error-message">{errors.xp}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="trustBonus">Trust Score Bonus</label>
                <input
                  id="trustBonus"
                  type="number"
                  min="0"
                  value={formData.rewards.trustScoreBonus}
                  onChange={(e) => handleRewardChange('trustScoreBonus', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="rwis">RWIS Points</label>
                <input
                  id="rwis"
                  type="number"
                  min="0"
                  value={formData.rewards.rwisPoints}
                  onChange={(e) => handleRewardChange('rwisPoints', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            {formData.category === 'FREELANCE' && (
              <div className="form-group">
                <label htmlFor="payment">Payment Amount ($) *</label>
                <input
                  id="payment"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.rewards.payment || ''}
                  onChange={(e) => handleRewardChange('payment', parseFloat(e.target.value) || undefined)}
                  placeholder="Enter payment amount"
                  className={errors.payment ? 'error' : ''}
                />
                {errors.payment && <span className="error-message">{errors.payment}</span>}
              </div>
            )}

            {formData.category === 'COMMUNITY' && formData.rewards.payment && (
              <div className="warning-message">
                Community tasks should not include payment. Consider removing the payment amount.
              </div>
            )}
          </div>

          {/* Submit */}
          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreationForm;