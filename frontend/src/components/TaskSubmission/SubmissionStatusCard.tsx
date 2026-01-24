import React, { useState } from 'react';
import { TaskSubmission, FileAttachment } from '../../../../shared/types';
import TaskSubmissionModal from './TaskSubmissionModal';
import './TaskSubmission.css';

interface SubmissionStatusCardProps {
    submission: TaskSubmission;
    taskTitle: string;
    taskCategory: string;
    onResubmit?: (submissionText: string, files: File[]) => Promise<void>;
    isResubmitting?: boolean;
}

const SubmissionStatusCard: React.FC<SubmissionStatusCardProps> = ({
    submission,
    taskTitle,
    taskCategory,
    onResubmit,
    isResubmitting = false
}) => {
    const [showResubmitModal, setShowResubmitModal] = useState(false);

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'PENDING':
                return 'pending';
            case 'UNDER_REVIEW':
                return 'under-review';
            case 'APPROVED':
                return 'approved';
            case 'REJECTED':
                return 'rejected';
            case 'NEEDS_REVISION':
                return 'needs-revision';
            default:
                return 'pending';
        }
    };

    const getStatusText = (status: string): string => {
        switch (status) {
            case 'PENDING':
                return 'Pending Review';
            case 'UNDER_REVIEW':
                return 'Under Review';
            case 'APPROVED':
                return 'Approved';
            case 'REJECTED':
                return 'Rejected';
            case 'NEEDS_REVISION':
                return 'Needs Revision';
            default:
                return status;
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

    const getFileIcon = (mimeType: string): string => {
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType === 'application/pdf') return '📄';
        if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
        if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
        return '📁';
    };

    const handleResubmit = async (submissionText: string, files: File[]) => {
        if (onResubmit) {
            await onResubmit(submissionText, files);
            setShowResubmitModal(false);
        }
    };

    // Create a mock task object for the resubmit modal
    const mockTask = {
        id: submission.taskId,
        title: taskTitle,
        category: taskCategory as any,
        rewards: {
            xp: 0,
            trustScoreBonus: 0,
            rwisPoints: 0
        }
    };

    return (
        <>
            <div className="submission-status-card">
                <div className="submission-header">
                    <h3 className="submission-title">{taskTitle}</h3>
                    <span className={`submission-status ${getStatusColor(submission.status)}`}>
                        {getStatusText(submission.status)}
                    </span>
                </div>

                <div className="submission-meta">
                    <span>Category: {taskCategory}</span>
                    <span>Submitted: {formatDate(submission.submittedAt)}</span>
                    {submission.revisionCount > 0 && (
                        <span>Revisions: {submission.revisionCount}</span>
                    )}
                </div>

                {submission.submissionText && (
                    <div className="submission-text">
                        {submission.submissionText}
                    </div>
                )}

                {submission.fileAttachments && submission.fileAttachments.length > 0 && (
                    <div className="submission-files">
                        <h4>Attached Files:</h4>
                        <div className="file-list">
                            {submission.fileAttachments.map((file: FileAttachment, index: number) => (
                                <a
                                    key={index}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="file-link"
                                >
                                    <span>{getFileIcon(file.mimeType)}</span>
                                    <span>{file.originalName}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Verification Result */}
                {submission.aiVerificationResult && Object.keys(submission.aiVerificationResult).length > 0 && (
                    <div className="ai-verification-result">
                        <h4>AI Analysis:</h4>
                        <div className="verification-score">
                            Score: {submission.aiVerificationResult.score}/100
                        </div>
                        {submission.aiVerificationResult.reasoning && (
                            <p className="verification-reasoning">
                                {submission.aiVerificationResult.reasoning}
                            </p>
                        )}
                        {submission.aiVerificationResult.suggestedImprovements && 
                         submission.aiVerificationResult.suggestedImprovements.length > 0 && (
                            <div className="suggested-improvements">
                                <strong>Suggestions:</strong>
                                <ul>
                                    {submission.aiVerificationResult.suggestedImprovements.map((suggestion, index) => (
                                        <li key={index}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Feedback */}
                {submission.feedback && (
                    <div className="submission-feedback">
                        <h4 className="feedback-title">Feedback:</h4>
                        <p className="feedback-text">{submission.feedback}</p>
                    </div>
                )}

                {/* Resubmit Button */}
                {submission.status === 'NEEDS_REVISION' && onResubmit && (
                    <button
                        className="resubmit-button"
                        onClick={() => setShowResubmitModal(true)}
                        disabled={isResubmitting}
                    >
                        {isResubmitting ? 'Resubmitting...' : 'Resubmit with Revisions'}
                    </button>
                )}

                {/* Status-specific messages */}
                {submission.status === 'PENDING' && (
                    <div className="status-message pending-message">
                        <p>🔄 Your submission is being processed by our AI verification system.</p>
                    </div>
                )}

                {submission.status === 'UNDER_REVIEW' && (
                    <div className="status-message review-message">
                        <p>👨‍💼 Your submission is being reviewed by our team.</p>
                    </div>
                )}

                {submission.status === 'APPROVED' && (
                    <div className="status-message approved-message">
                        <p>🎉 Congratulations! Your submission has been approved and rewards have been distributed.</p>
                    </div>
                )}

                {submission.status === 'REJECTED' && (
                    <div className="status-message rejected-message">
                        <p>❌ Your submission was not approved. Please review the feedback and consider applying for similar tasks in the future.</p>
                    </div>
                )}
            </div>

            {/* Resubmit Modal */}
            {showResubmitModal && (
                <TaskSubmissionModal
                    task={mockTask as any}
                    isOpen={showResubmitModal}
                    onClose={() => setShowResubmitModal(false)}
                    onSubmit={handleResubmit}
                    isSubmitting={isResubmitting}
                />
            )}
        </>
    );
};

export default SubmissionStatusCard;