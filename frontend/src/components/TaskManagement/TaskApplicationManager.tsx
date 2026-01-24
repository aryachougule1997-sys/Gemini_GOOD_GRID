import React, { useState, useEffect } from 'react';
import { TaskApplication, Task, ApplicationStatus } from '../../../../shared/types';
import { taskManagementService } from '../../services/taskManagementService';
import './TaskManagement.css';

interface TaskApplicationManagerProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onApplicationProcessed: () => void;
}

const TaskApplicationManager: React.FC<TaskApplicationManagerProps> = ({
  task,
  isOpen,
  onClose,
  onApplicationProcessed
}) => {
  const [applications, setApplications] = useState<TaskApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<TaskApplication | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [processingDecision, setProcessingDecision] = useState<'ACCEPTED' | 'REJECTED' | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen, task.id]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const apps = await taskManagementService.getTaskApplications(task.id);
      setApplications(apps);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessApplication = async (applicationId: string, decision: 'ACCEPTED' | 'REJECTED') => {
    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    setSelectedApplication(application);
    setProcessingDecision(decision);
    setShowFeedbackModal(true);
  };

  const confirmProcessApplication = async () => {
    if (!selectedApplication || !processingDecision) return;

    try {
      setProcessing(selectedApplication.id);
      
      await taskManagementService.processApplication(
        selectedApplication.id,
        processingDecision,
        feedback
      );

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: processingDecision as ApplicationStatus }
            : app
        )
      );

      setShowFeedbackModal(false);
      setFeedback('');
      setSelectedApplication(null);
      setProcessingDecision(null);
      onApplicationProcessed();

    } catch (error) {
      console.error('Failed to process application:', error);
      alert(error instanceof Error ? error.message : 'Failed to process application');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: ApplicationStatus): string => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'ACCEPTED': return '#10B981';
      case 'REJECTED': return '#EF4444';
      case 'WITHDRAWN': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: ApplicationStatus): string => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'ACCEPTED': return '✅';
      case 'REJECTED': return '❌';
      case 'WITHDRAWN': return '↩️';
      default: return '❓';
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay">
        <div className="application-manager-modal">
          <div className="modal-header">
            <h2>Manage Applications</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>

          <div className="task-info">
            <h3>{task.title}</h3>
            <p className="task-category">{task.category}</p>
          </div>

          <div className="applications-content">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No Applications Yet</h3>
                <p>No one has applied for this task yet. Applications will appear here when users apply.</p>
              </div>
            ) : (
              <div className="applications-list">
                <div className="applications-header">
                  <h4>{applications.length} Application{applications.length !== 1 ? 's' : ''}</h4>
                  <div className="status-summary">
                    <span className="status-count pending">
                      {applications.filter(app => app.status === 'PENDING').length} Pending
                    </span>
                    <span className="status-count accepted">
                      {applications.filter(app => app.status === 'ACCEPTED').length} Accepted
                    </span>
                    <span className="status-count rejected">
                      {applications.filter(app => app.status === 'REJECTED').length} Rejected
                    </span>
                  </div>
                </div>

                {applications.map((application) => (
                  <div key={application.id} className="application-card">
                    <div className="application-header">
                      <div className="applicant-info">
                        <h4>User ID: {application.userId}</h4>
                        <p className="application-date">
                          Applied {formatDate(application.appliedAt)}
                        </p>
                      </div>
                      <div className="application-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(application.status) }}
                        >
                          {getStatusIcon(application.status)} {application.status}
                        </span>
                      </div>
                    </div>

                    {application.applicationMessage && (
                      <div className="application-message">
                        <h5>Application Message:</h5>
                        <p>{application.applicationMessage}</p>
                      </div>
                    )}

                    {application.status === 'PENDING' && (
                      <div className="application-actions">
                        <button
                          onClick={() => handleProcessApplication(application.id, 'ACCEPTED')}
                          className="accept-button"
                          disabled={processing === application.id}
                        >
                          {processing === application.id ? 'Processing...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleProcessApplication(application.id, 'REJECTED')}
                          className="reject-button"
                          disabled={processing === application.id}
                        >
                          {processing === application.id ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedApplication && (
        <div className="modal-overlay">
          <div className="feedback-modal">
            <div className="modal-header">
              <h3>
                {processingDecision === 'ACCEPTED' ? 'Accept' : 'Reject'} Application
              </h3>
              <button 
                className="close-button" 
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedback('');
                  setSelectedApplication(null);
                  setProcessingDecision(null);
                }}
              >
                ×
              </button>
            </div>

            <div className="feedback-content">
              <p>
                You are about to <strong>{processingDecision?.toLowerCase()}</strong> the application from User ID: {selectedApplication.userId}
              </p>

              <div className="form-group">
                <label htmlFor="feedback">
                  Feedback {processingDecision === 'REJECTED' ? '(Optional)' : '(Recommended)'}
                </label>
                <textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={
                    processingDecision === 'ACCEPTED'
                      ? "Congratulations! Here's what to expect next..."
                      : "Thank you for your interest. We encourage you to..."
                  }
                  rows={4}
                />
              </div>

              <div className="feedback-actions">
                <button
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setFeedback('');
                    setSelectedApplication(null);
                    setProcessingDecision(null);
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmProcessApplication}
                  className={processingDecision === 'ACCEPTED' ? 'accept-button' : 'reject-button'}
                  disabled={processing === selectedApplication.id}
                >
                  {processing === selectedApplication.id 
                    ? 'Processing...' 
                    : `Confirm ${processingDecision === 'ACCEPTED' ? 'Accept' : 'Reject'}`
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskApplicationManager;