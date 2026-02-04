import React, { useState } from 'react';
import RetroGameProfileDashboard from '../components/Profile/RetroGameProfileDashboard';
import DarkFantasyWorkModal from '../components/Profile/DarkFantasyWorkModal';
import './DarkGameProfilePage.css';

interface WorkHistoryItem {
  id: string;
  title: string;
  category: 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
  description: string;
  completedAt: string;
  xpGained: number;
  trustScoreGain: number;
  rwisGain: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  skills: string[];
  clientFeedback?: string;
  artifacts: string[];
  duration: string;
  teamMembers?: string[];
}

const DarkGameProfilePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkHistoryItem | null>(null);

  // Sample work item for demo
  const sampleWorkItem: WorkHistoryItem = {
    id: '1',
    title: 'E-commerce Platform Development',
    category: 'FREELANCE',
    description: 'Developed a full-stack e-commerce platform using React, Node.js, and PostgreSQL. Implemented user authentication, payment processing, inventory management, and admin dashboard. The platform supports multiple vendors and includes advanced search functionality.',
    completedAt: '2024-01-15',
    xpGained: 250,
    trustScoreGain: 15,
    rwisGain: 180,
    difficulty: 'advanced',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Stripe API', 'AWS', 'Docker'],
    clientFeedback: 'Exceptional work! The developer delivered beyond expectations. The platform is robust, user-friendly, and scalable. Communication was excellent throughout the project.',
    artifacts: ['Project Screenshots', 'Code Repository', 'Technical Documentation', 'User Manual', 'Performance Reports'],
    duration: '6 weeks',
    teamMembers: ['Alice Johnson (UI/UX)', 'Bob Smith (Backend)', 'Carol Davis (QA)']
  };

  const openModal = () => {
    setSelectedWorkItem(sampleWorkItem);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedWorkItem(null);
  };

  return (
    <div className="dark-game-profile-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">🎮</span>
            Dark Gaming Profile System
          </h1>
          <p className="page-subtitle">
            Experience your professional journey through the lens of classic dark fantasy RPGs
          </p>
        </div>
        
        <div className="demo-controls">
          <button className="demo-btn" onClick={openModal}>
            <span className="btn-icon">🗡️</span>
            View Quest Details
          </button>
        </div>
      </div>

      {/* Main Profile Dashboard */}
      <div className="profile-container">
        <RetroGameProfileDashboard />
      </div>

      {/* Features Showcase */}
      <div className="features-showcase">
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🌌</div>
            <h3>Animated Starfield Background</h3>
            <p>Dynamic particle systems create an immersive space-like atmosphere with twinkling stars and floating nebulae.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚔️</div>
            <h3>RPG-Style Character System</h3>
            <p>Pixelated character avatars with level progression, animated sprites, and category-specific guild memberships.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🏰</div>
            <h3>Guild-Based Categories</h3>
            <p>Work experience organized into Freelance Towers, Community Gardens, and Corporate Castles with unique themes.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">💎</div>
            <h3>Achievement System</h3>
            <p>Collectible badges with rarity levels, glowing effects, and category-specific rewards that showcase your accomplishments.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📜</div>
            <h3>Quest Log Interface</h3>
            <p>Work history presented as completed quests with XP rewards, difficulty ratings, and detailed progress tracking.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔮</div>
            <h3>Dark Fantasy Modals</h3>
            <p>Immersive detail views with magical particle effects, animated backgrounds, and medieval-inspired design elements.</p>
          </div>
        </div>
      </div>

      {/* Work Detail Modal */}
      <DarkFantasyWorkModal
        isOpen={isModalOpen}
        onClose={closeModal}
        workItem={selectedWorkItem}
      />
    </div>
  );
};

export default DarkGameProfilePage;