import React, { useState } from 'react';
import GameifiedDashboard from '../components/Gamification/GameifiedDashboard';

const GamificationTestPage: React.FC = () => {
  const [userId, setUserId] = useState('test-user-id');
  const [authToken, setAuthToken] = useState('');

  const handleSetToken = () => {
    if (authToken.trim()) {
      localStorage.setItem('authToken', authToken.trim());
      alert('Auth token set! You can now test the gamification features.');
    }
  };

  const handleClearToken = () => {
    localStorage.removeItem('authToken');
    setAuthToken('');
    alert('Auth token cleared!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        background: '#f3f4f6', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #d1d5db'
      }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>🧪 Gamification System Test</h2>
        <p style={{ margin: '0 0 16px 0', color: '#6b7280' }}>
          This page allows you to test the gamification system. You'll need to set an auth token to access the API.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
              User ID:
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                minWidth: '200px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
              Auth Token:
            </label>
            <input
              type="text"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Enter JWT token"
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                minWidth: '300px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
            <button
              onClick={handleSetToken}
              style={{
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Set Token
            </button>
            <button
              onClick={handleClearToken}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Clear Token
            </button>
          </div>
        </div>
        
        <div style={{ marginTop: '16px', padding: '12px', background: '#fef3c7', borderRadius: '6px', border: '1px solid #f59e0b' }}>
          <p style={{ margin: '0', fontSize: '0.875rem', color: '#92400e' }}>
            <strong>Note:</strong> The backend server should be running on port 3001. 
            You can test the calculator without authentication, but other features require a valid JWT token.
          </p>
        </div>
      </div>

      <GameifiedDashboard userId={userId} />
    </div>
  );
};

export default GamificationTestPage;