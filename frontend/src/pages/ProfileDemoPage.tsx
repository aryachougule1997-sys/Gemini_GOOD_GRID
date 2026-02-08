import React from 'react';
import ComprehensiveProfileDashboard from '../components/Profile/ComprehensiveProfileDashboard';

const ProfileDemoPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            <ComprehensiveProfileDashboard userId="demo-user-123" />
        </div>
    );
};

export default ProfileDemoPage;