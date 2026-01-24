import React, { useState, useEffect } from 'react';
import { TaskSubmission } from '../../../shared/types';
import { taskSubmissionService } from '../services/taskSubmissionService';
import SubmissionStatusCard from '../components/TaskSubmission/SubmissionStatusCard';
import '../components/TaskSubmission/TaskSubmission.css';

const MySubmissionsPage: React.FC = () => {
    const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('ALL');
    const [resubmittingId, setResubmittingId] = useState<string | null>(null);

    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await taskSubmissionService.getUserSubmissions(50, 0);
            setSubmissions(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleResubmit = async (submissionId: string, submissionText: string, files: File[]) => {
        try {
            setResubmittingId(submissionId);
            await taskSubmissionService.resubmitWithRevisions(submissionId, submissionText, files);
            
            // Reload submissions to show updated status
            await loadSubmissions();
            
            alert('Task resubmitted successfully!');
        } catch (err) {
            console.error('Resubmission failed:', err);
            alert(err instanceof Error ? err.message : 'Failed to resubmit task');
        } finally {
            setResubmittingId(null);
        }
    };

    const filteredSubmissions = submissions.filter(submission => {
        if (filter === 'ALL') return true;
        return submission.status === filter;
    });

    const getStatusCounts = () => {
        const counts = {
            ALL: submissions.length,
            PENDING: 0,
            UNDER_REVIEW: 0,
            APPROVED: 0,
            REJECTED: 0,
            NEEDS_REVISION: 0
        };

        submissions.forEach(submission => {
            if (submission.status in counts) {
                counts[submission.status as keyof typeof counts]++;
            }
        });

        return counts;
    };

    const statusCounts = getStatusCounts();

    if (loading) {
        return (
            <div className="submissions-page">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your submissions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="submissions-page">
                <div className="error-container">
                    <h2>Error Loading Submissions</h2>
                    <p>{error}</p>
                    <button onClick={loadSubmissions} className="retry-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="submissions-page">
            <div className="page-header">
                <h1>My Task Submissions</h1>
                <p>Track the status of your completed tasks and view feedback</p>
            </div>

            {/* Status Filter */}
            <div className="submissions-filter">
                <h3>Filter by Status:</h3>
                <div className="filter-buttons">
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <button
                            key={status}
                            className={`filter-button ${filter === status ? 'active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            {status.replace('_', ' ')} ({count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Submissions List */}
            <div className="submissions-list">
                {filteredSubmissions.length === 0 ? (
                    <div className="empty-submissions">
                        <div className="empty-icon">📋</div>
                        <h3>
                            {filter === 'ALL' 
                                ? 'No Submissions Yet' 
                                : `No ${filter.replace('_', ' ').toLowerCase()} submissions`
                            }
                        </h3>
                        <p>
                            {filter === 'ALL'
                                ? 'Start completing tasks to see your submissions here!'
                                : 'Try changing the filter to see other submissions.'
                            }
                        </p>
                    </div>
                ) : (
                    filteredSubmissions.map((submission) => (
                        <SubmissionStatusCard
                            key={submission.id}
                            submission={submission}
                            taskTitle={(submission as any).task_title || 'Unknown Task'}
                            taskCategory={(submission as any).task_category || 'COMMUNITY'}
                            onResubmit={
                                submission.status === 'NEEDS_REVISION'
                                    ? (text, files) => handleResubmit(submission.id, text, files)
                                    : undefined
                            }
                            isResubmitting={resubmittingId === submission.id}
                        />
                    ))
                )}
            </div>

            {/* Summary Stats */}
            {submissions.length > 0 && (
                <div className="submissions-summary">
                    <h3>Summary</h3>
                    <div className="summary-stats">
                        <div className="stat-item">
                            <span className="stat-number">{submissions.length}</span>
                            <span className="stat-label">Total Submissions</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{statusCounts.APPROVED}</span>
                            <span className="stat-label">Approved</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {Math.round((statusCounts.APPROVED / submissions.length) * 100)}%
                            </span>
                            <span className="stat-label">Success Rate</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {statusCounts.PENDING + statusCounts.UNDER_REVIEW}
                            </span>
                            <span className="stat-label">In Review</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MySubmissionsPage;