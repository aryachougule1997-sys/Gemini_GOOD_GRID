import React from 'react';
import { Task } from '../../../../shared/types';
import TaskCard from '../Dungeon/TaskCard';
import './Dungeon.css';

interface TaskListProps {
    tasks: Task[];
    onTaskSelect: (task: Task) => void;
    userStats: {
        trustScore: number;
        level: number;
        badges: string[];
    };
}

const TaskList: React.FC<TaskListProps> = ({
    tasks,
    onTaskSelect,
    userStats
}) => {
    const sortedTasks = [...tasks].sort((a, b) => {
        // Sort by difficulty (trust score requirement) and then by creation date
        const aTrustScore = a.requirements.trustScoreMin || 0;
        const bTrustScore = b.requirements.trustScoreMin || 0;

        if (aTrustScore !== bTrustScore) {
            return aTrustScore - bTrustScore;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const canUserAccessTask = (task: Task): boolean => {
        const requirements = task.requirements;

        if (requirements.trustScoreMin && userStats.trustScore < requirements.trustScoreMin) {
            return false;
        }

        if (requirements.level && userStats.level < requirements.level) {
            return false;
        }

        if (requirements.specificBadges && requirements.specificBadges.length > 0) {
            const hasAllBadges = requirements.specificBadges.every(badge =>
                userStats.badges.includes(badge)
            );
            if (!hasAllBadges) {
                return false;
            }
        }

        return true;
    };

    const accessibleTasks = sortedTasks.filter(task => canUserAccessTask(task));
    const lockedTasks = sortedTasks.filter(task => !canUserAccessTask(task));

    return (
        <div className="task-list">
            {/* Accessible tasks */}
            {accessibleTasks.length > 0 && (
                <div className="task-section">
                    <h4 className="section-title">Available Opportunities</h4>
                    <div className="tasks-grid">
                        {accessibleTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                isAccessible={true}
                                onClick={() => onTaskSelect(task)}
                                userStats={userStats}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Locked tasks */}
            {lockedTasks.length > 0 && (
                <div className="task-section locked-section">
                    <h4 className="section-title">Locked Opportunities</h4>
                    <p className="section-description">
                        Complete more tasks and build your reputation to unlock these opportunities.
                    </p>
                    <div className="tasks-grid">
                        {lockedTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                isAccessible={false}
                                onClick={() => { }} // No action for locked tasks
                                userStats={userStats}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {tasks.length === 0 && (
                <div className="empty-task-list">
                    <div className="empty-icon">📋</div>
                    <h3>No Opportunities Available</h3>
                    <p>This dungeon doesn't have any opportunities right now.</p>
                    <p>Check back later or explore other dungeons!</p>
                </div>
            )}
        </div>
    );
};

export default TaskList;