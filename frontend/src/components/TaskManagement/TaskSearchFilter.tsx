import React, { useState, useEffect } from 'react';
import { WorkCategory, TaskStatus } from '../../../../shared/types';
import './TaskManagement.css';

interface TaskSearchFilterProps {
  onFiltersChange: (filters: TaskSearchFilters) => void;
  initialFilters?: Partial<TaskSearchFilters>;
  showCategoryFilter?: boolean;
  showStatusFilter?: boolean;
}

export interface TaskSearchFilters {
  category?: WorkCategory;
  status?: TaskStatus;
  searchText?: string;
  minTrustScore?: number;
  maxTrustScore?: number;
  skills?: string[];
  location?: string;
  minReward?: number;
  maxReward?: number;
  deadlineBefore?: Date;
  deadlineAfter?: Date;
  sortBy?: 'created_at' | 'deadline' | 'trust_score' | 'xp_reward';
  sortOrder?: 'ASC' | 'DESC';
}

const TaskSearchFilter: React.FC<TaskSearchFilterProps> = ({
  onFiltersChange,
  initialFilters = {},
  showCategoryFilter = true,
  showStatusFilter = true
}) => {
  const [filters, setFilters] = useState<TaskSearchFilters>({
    sortBy: 'created_at',
    sortOrder: 'DESC',
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (key: keyof TaskSearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const handleSkillAdd = () => {
    if (skillInput.trim() && (!filters.skills || !filters.skills.includes(skillInput.trim()))) {
      const newSkills = [...(filters.skills || []), skillInput.trim()];
      handleFilterChange('skills', newSkills);
      setSkillInput('');
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    const newSkills = (filters.skills || []).filter(skill => skill !== skillToRemove);
    handleFilterChange('skills', newSkills.length > 0 ? newSkills : undefined);
  };

  const handleSkillKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSkillAdd();
    }
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'created_at',
      sortOrder: 'DESC'
    });
    setSkillInput('');
  };

  const hasActiveFilters = () => {
    return Object.keys(filters).some(key => {
      if (key === 'sortBy' || key === 'sortOrder') return false;
      return filters[key as keyof TaskSearchFilters] !== undefined;
    });
  };

  return (
    <div className="task-search-filter">
      {/* Basic Search */}
      <div className="search-section">
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Search tasks by title, description, or skills..."
            value={filters.searchText || ''}
            onChange={(e) => handleFilterChange('searchText', e.target.value)}
            className="search-input"
          />
          <button 
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`advanced-toggle ${showAdvanced ? 'active' : ''}`}
          >
            Advanced Filters
          </button>
        </div>

        {/* Quick Filters */}
        <div className="quick-filters">
          {showCategoryFilter && (
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value as WorkCategory)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="FREELANCE">Freelance</option>
              <option value="COMMUNITY">Community</option>
              <option value="CORPORATE">Corporate</option>
            </select>
          )}

          {showStatusFilter && (
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value as TaskStatus)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="VERIFIED">Verified</option>
            </select>
          )}

          <select
            value={`${filters.sortBy}_${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('_');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
            className="filter-select"
          >
            <option value="created_at_DESC">Newest First</option>
            <option value="created_at_ASC">Oldest First</option>
            <option value="deadline_ASC">Deadline (Soonest)</option>
            <option value="deadline_DESC">Deadline (Latest)</option>
            <option value="xp_reward_DESC">Highest XP</option>
            <option value="xp_reward_ASC">Lowest XP</option>
            <option value="trust_score_ASC">Easiest (Low Trust Score)</option>
            <option value="trust_score_DESC">Hardest (High Trust Score)</option>
          </select>

          {hasActiveFilters() && (
            <button onClick={clearFilters} className="clear-filters-button">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="advanced-filters">
          <div className="filter-row">
            {/* Trust Score Range */}
            <div className="filter-group">
              <label>Trust Score Range</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  value={filters.minTrustScore || ''}
                  onChange={(e) => handleFilterChange('minTrustScore', parseInt(e.target.value) || undefined)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  value={filters.maxTrustScore || ''}
                  onChange={(e) => handleFilterChange('maxTrustScore', parseInt(e.target.value) || undefined)}
                />
              </div>
            </div>

            {/* Reward Range */}
            <div className="filter-group">
              <label>Payment Range ($)</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  step="0.01"
                  value={filters.minReward || ''}
                  onChange={(e) => handleFilterChange('minReward', parseFloat(e.target.value) || undefined)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  step="0.01"
                  value={filters.maxReward || ''}
                  onChange={(e) => handleFilterChange('maxReward', parseFloat(e.target.value) || undefined)}
                />
              </div>
            </div>
          </div>

          <div className="filter-row">
            {/* Location */}
            <div className="filter-group">
              <label>Location</label>
              <input
                type="text"
                placeholder="Enter location or 'Remote'"
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            {/* Deadline Range */}
            <div className="filter-group">
              <label>Deadline Range</label>
              <div className="date-inputs">
                <input
                  type="date"
                  value={filters.deadlineAfter ? filters.deadlineAfter.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFilterChange('deadlineAfter', e.target.value ? new Date(e.target.value) : undefined)}
                  placeholder="After"
                />
                <span>to</span>
                <input
                  type="date"
                  value={filters.deadlineBefore ? filters.deadlineBefore.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFilterChange('deadlineBefore', e.target.value ? new Date(e.target.value) : undefined)}
                  placeholder="Before"
                />
              </div>
            </div>
          </div>

          {/* Skills Filter */}
          <div className="filter-group skills-filter">
            <label>Required Skills</label>
            <div className="skills-input-section">
              <div className="skill-input-group">
                <input
                  type="text"
                  placeholder="Add a skill to filter by..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleSkillKeyPress}
                />
                <button type="button" onClick={handleSkillAdd} disabled={!skillInput.trim()}>
                  Add
                </button>
              </div>
              
              {filters.skills && filters.skills.length > 0 && (
                <div className="selected-skills">
                  {filters.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleSkillRemove(skill)}
                        className="remove-skill"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="active-filters-summary">
          <span className="summary-label">Active filters:</span>
          {filters.category && <span className="filter-tag">Category: {filters.category}</span>}
          {filters.status && <span className="filter-tag">Status: {filters.status}</span>}
          {filters.searchText && <span className="filter-tag">Search: "{filters.searchText}"</span>}
          {filters.minTrustScore !== undefined && <span className="filter-tag">Min Trust: {filters.minTrustScore}</span>}
          {filters.maxTrustScore !== undefined && <span className="filter-tag">Max Trust: {filters.maxTrustScore}</span>}
          {filters.minReward !== undefined && <span className="filter-tag">Min Payment: ${filters.minReward}</span>}
          {filters.maxReward !== undefined && <span className="filter-tag">Max Payment: ${filters.maxReward}</span>}
          {filters.location && <span className="filter-tag">Location: {filters.location}</span>}
          {filters.skills && filters.skills.length > 0 && (
            <span className="filter-tag">Skills: {filters.skills.join(', ')}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskSearchFilter;