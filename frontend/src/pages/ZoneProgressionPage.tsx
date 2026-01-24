import React from 'react';
import ZoneProgressionManager from '../components/ZoneProgression/ZoneProgressionManager';
import { UserStats } from '../../../shared/types';

interface ZoneProgressionPageProps {
  userStats: UserStats;
  onUserStatsUpdate?: (newStats: UserStats) => void;
  onNavigateBack?: () => void;
}

const ZoneProgressionPage: React.FC<ZoneProgressionPageProps> = ({
  userStats,
  onUserStatsUpdate,
  onNavigateBack
}) => {
  return (
    <div className="zone-progression-page">
      {/* Navigation Header */}
      {onNavigateBack && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={onNavigateBack}
            className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-black/70 transition-all duration-300 flex items-center gap-2"
          >
            ← Back to Home
          </button>
        </div>
      )}

      {/* Zone Progression Manager */}
      <ZoneProgressionManager
        userStats={userStats}
        onUserStatsUpdate={onUserStatsUpdate}
      />
    </div>
  );
};

export default ZoneProgressionPage;