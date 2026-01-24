import React, { useEffect, useState } from 'react';
import './ZoneUnlockCelebration.css';

interface ZoneUnlockCelebrationProps {
  isVisible: boolean;
  celebrationData: {
    animationType: 'ZONE_UNLOCK' | 'DUNGEON_UNLOCK' | 'AREA_REVEAL';
    title: string;
    description: string;
    rewards: {
      xp?: number;
      trustScore?: number;
      badges?: string[];
      specialFeatures?: string[];
    };
    visualEffects: {
      mapRevealAnimation: boolean;
      particleEffects: string[];
      soundEffects: string[];
    };
  };
  onCelebrationComplete: () => void;
}

const ZoneUnlockCelebration: React.FC<ZoneUnlockCelebrationProps> = ({
  isVisible,
  celebrationData,
  onCelebrationComplete
}) => {
  const [animationPhase, setAnimationPhase] = useState<'entrance' | 'main' | 'rewards' | 'exit'>('entrance');
  const [particlesVisible, setParticlesVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const phases = [
      { phase: 'entrance', duration: 1000 },
      { phase: 'main', duration: 2000 },
      { phase: 'rewards', duration: 3000 },
      { phase: 'exit', duration: 1000 }
    ];

    let currentPhaseIndex = 0;
    setAnimationPhase('entrance');
    setParticlesVisible(true);

    const phaseTimer = () => {
      if (currentPhaseIndex < phases.length - 1) {
        currentPhaseIndex++;
        setAnimationPhase(phases[currentPhaseIndex].phase as any);
        setTimeout(phaseTimer, phases[currentPhaseIndex].duration);
      } else {
        setParticlesVisible(false);
        setTimeout(() => {
          onCelebrationComplete();
        }, 500);
      }
    };

    setTimeout(phaseTimer, phases[0].duration);

    // Play sound effects
    celebrationData.visualEffects.soundEffects.forEach((sound, index) => {
      setTimeout(() => {
        // In a real implementation, you would play actual sound files
        console.log(`Playing sound: ${sound}`);
      }, index * 500);
    });

  }, [isVisible, celebrationData, onCelebrationComplete]);

  if (!isVisible) return null;

  return (
    <div className={`zone-unlock-celebration ${animationPhase}`}>
      {/* Background overlay */}
      <div className="celebration-overlay" />
      
      {/* Particle effects */}
      {particlesVisible && (
        <div className="particle-container">
          {celebrationData.visualEffects.particleEffects.map((effect, index) => (
            <div key={index} className={`particle-effect ${effect}`}>
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className={`particle particle-${i}`} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Main celebration content */}
      <div className="celebration-content">
        {/* Title animation */}
        <div className={`celebration-title ${animationPhase}`}>
          <h1>{celebrationData.title}</h1>
          <div className="title-underline" />
        </div>

        {/* Description */}
        <div className={`celebration-description ${animationPhase}`}>
          <p>{celebrationData.description}</p>
        </div>

        {/* Zone unlock icon */}
        <div className={`unlock-icon ${celebrationData.animationType.toLowerCase()}`}>
          <div className="icon-glow" />
          <div className="icon-core">
            {celebrationData.animationType === 'ZONE_UNLOCK' && (
              <svg viewBox="0 0 100 100" className="zone-icon">
                <circle cx="50" cy="50" r="40" className="zone-circle" />
                <path d="M30 50 L45 65 L70 35" className="unlock-check" />
              </svg>
            )}
            {celebrationData.animationType === 'DUNGEON_UNLOCK' && (
              <svg viewBox="0 0 100 100" className="dungeon-icon">
                <rect x="20" y="30" width="60" height="50" className="dungeon-base" />
                <polygon points="20,30 50,10 80,30" className="dungeon-roof" />
                <rect x="40" y="50" width="20" height="30" className="dungeon-door" />
              </svg>
            )}
            {celebrationData.animationType === 'AREA_REVEAL' && (
              <svg viewBox="0 0 100 100" className="reveal-icon">
                <circle cx="50" cy="50" r="35" className="reveal-circle" />
                <path d="M35 50 Q50 30 65 50 Q50 70 35 50" className="reveal-wave" />
              </svg>
            )}
          </div>
        </div>

        {/* Rewards section */}
        {animationPhase === 'rewards' && (
          <div className="celebration-rewards">
            <h3>Rewards Earned!</h3>
            <div className="rewards-grid">
              {celebrationData.rewards.xp && (
                <div className="reward-item xp">
                  <div className="reward-icon">⭐</div>
                  <div className="reward-text">
                    <span className="reward-amount">+{celebrationData.rewards.xp}</span>
                    <span className="reward-type">XP</span>
                  </div>
                </div>
              )}
              
              {celebrationData.rewards.trustScore && (
                <div className="reward-item trust">
                  <div className="reward-icon">🛡️</div>
                  <div className="reward-text">
                    <span className="reward-amount">+{celebrationData.rewards.trustScore}</span>
                    <span className="reward-type">Trust Score</span>
                  </div>
                </div>
              )}

              {celebrationData.rewards.badges && celebrationData.rewards.badges.map((badge, index) => (
                <div key={index} className="reward-item badge">
                  <div className="reward-icon">🏆</div>
                  <div className="reward-text">
                    <span className="reward-amount">{badge}</span>
                    <span className="reward-type">Badge</span>
                  </div>
                </div>
              ))}
            </div>

            {celebrationData.rewards.specialFeatures && (
              <div className="special-features">
                <h4>New Features Unlocked:</h4>
                <ul>
                  {celebrationData.rewards.specialFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Continue button */}
        {animationPhase === 'rewards' && (
          <button 
            className="continue-button"
            onClick={onCelebrationComplete}
          >
            Continue Adventure
          </button>
        )}
      </div>

      {/* Map reveal animation overlay */}
      {celebrationData.visualEffects.mapRevealAnimation && (
        <div className="map-reveal-overlay">
          <div className="reveal-wave-animation" />
        </div>
      )}
    </div>
  );
};

export default ZoneUnlockCelebration;