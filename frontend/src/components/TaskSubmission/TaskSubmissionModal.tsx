import React, { useState, useRef } from 'react';
import { Task, FileAttachment } from '../../../../shared/types';
import './TaskSubmission.css';

interface TaskSubmissionModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (submissionText: string, files: File[]) => Promise<void>;
    isSubmitting?: boolean;
}

const TaskSubmissionModal: React.FC<TaskSubmissionModalProps> = ({
    task,
    isOpen,
    onClose,
    onSubmit,
    isSubmitting = false
}) => {
    const [submissionText, setSubmissionText] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!submissionText.trim() && selectedFiles.length === 0) {
            alert('Please provide either a text submission or upload files');
            return;
        }

        try {
            await onSubmit(submissionText, selectedFiles);
            // Reset form on successful submission
            setSubmissionText('');
            setSelectedFiles([]);
            onClose();
        } catch (error) {
            console.error('Submission failed:', error);
        }
    };

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files);
        const validFiles = newFiles.filter(file => {
            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                return false;
            }
            return true;
        });

        // Limit to 5 files total
        const totalFiles = selectedFiles.length + validFiles.length;
        if (totalFiles > 5) {
            alert('Maximum 5 files allowed per submission');
            return;
        }

        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    return (
        <div className="task-submission-modal-overlay">
            <div className="task-submission-modal">
                <div className="modal-header">
                    <h2>Submit Task Completion</h2>
                    <button 
                        className="close-button"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </div>

                <div className="modal-content">
                    {/* Task Summary */}
                    <div className="task-summary">
                        <h3>{task.title}</h3>
                        <p className="task-category">{task.category}</p>
                        <div className="task-rewards">
                            <span className="reward">⭐ {task.rewards.xp} XP</span>
                            <span className="reward">🤝 +{task.rewards.trustScoreBonus} Trust</span>
                            <span className="reward">🌍 {task.rewards.rwisPoints} RWIS</span>
                            {task.rewards.payment && (
                                <span className="reward">💰 ${task.rewards.payment}</span>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="submission-form">
                        {/* Text Submission */}
                        <div className="form-group">
                            <label htmlFor="submissionText">
                                Describe your work and results:
                            </label>
                            <textarea
                                id="submissionText"
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                                placeholder="Explain what you accomplished, any challenges you faced, and the results of your work..."
                                rows={6}
                                className="submission-textarea"
                            />
                        </div>

                        {/* File Upload */}
                        <div className="form-group">
                            <label>Upload supporting files (optional):</label>
                            <div 
                                className={`file-upload-area ${dragActive ? 'drag-active' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="upload-content">
                                    <div className="upload-icon">📁</div>
                                    <p>Drag and drop files here, or click to select</p>
                                    <p className="upload-hint">
                                        Max 5 files, 10MB each. Supported: Images, PDFs, Documents, Archives
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf,.txt,.doc,.docx,.zip"
                                    onChange={(e) => handleFileSelect(e.target.files)}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {/* Selected Files */}
                            {selectedFiles.length > 0 && (
                                <div className="selected-files">
                                    <h4>Selected Files:</h4>
                                    {selectedFiles.map((file, index) => (
                                        <div key={index} className="file-item">
                                            <div className="file-info">
                                                <span className="file-name">{file.name}</span>
                                                <span className="file-size">{formatFileSize(file.size)}</span>
                                            </div>
                                            <button
                                                type="button"
                                                className="remove-file"
                                                onClick={() => removeFile(index)}
                                                disabled={isSubmitting}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submission Guidelines */}
                        <div className="submission-guidelines">
                            <h4>Submission Guidelines:</h4>
                            <ul>
                                <li>Provide clear evidence of task completion</li>
                                <li>Include screenshots, photos, or documents as proof</li>
                                <li>Explain any challenges and how you overcame them</li>
                                <li>Be honest and thorough in your description</li>
                                <li>Files will be reviewed by AI and potentially human reviewers</li>
                            </ul>
                        </div>

                        {/* Action Buttons */}
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={isSubmitting || (!submissionText.trim() && selectedFiles.length === 0)}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Task'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TaskSubmissionModal;