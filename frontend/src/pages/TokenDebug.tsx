import React, { useState, useEffect } from 'react';
import AuthService from '../services/authService';

const TokenDebug: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = () => {
    const token = AuthService.getToken();
    
    if (token) {
      // Decode JWT manually (just for display, not for security)
      try {
        const parts = token.split('.');
        const payload = JSON.parse(atob(parts[1]));
        setTokenInfo({
          exists: true,
          token: token,
          payload: payload,
          isExpired: payload.exp ? Date.now() >= payload.exp * 1000 : false
        });
      } catch (e) {
        setTokenInfo({
          exists: true,
          token: token,
          error: 'Could not decode token',
          rawError: e
        });
      }
    } else {
      setTokenInfo({
        exists: false,
        message: 'No token found in localStorage'
      });
    }
  };

  const testLogin = async () => {
    setTestResult({ loading: true });
    try {
      const result = await AuthService.login({
        email: testEmail,
        password: testPassword
      });
      setTestResult(result);
      checkToken(); // Refresh token info
    } catch (error) {
      setTestResult({ error: String(error) });
    }
  };

  const testVerify = async () => {
    setTestResult({ loading: true });
    try {
      const result = await AuthService.verifyToken();
      setTestResult(result);
    } catch (error) {
      setTestResult({ error: String(error) });
    }
  };

  const clearToken = () => {
    AuthService.logout();
    checkToken();
    setTestResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">🔍 Token Debug Tool</h1>
        
        {/* Current Token Status */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Current Token Status</h2>
          <div className="bg-slate-900/50 rounded-xl p-4 font-mono text-sm">
            <pre className="text-green-400 whitespace-pre-wrap break-all">
              {JSON.stringify(tokenInfo, null, 2)}
            </pre>
          </div>
          <button
            onClick={checkToken}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Token Info
          </button>
          <button
            onClick={clearToken}
            className="mt-4 ml-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Clear Token
          </button>
        </div>

        {/* Test Login */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Test Login</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Email</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Password</label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
              />
            </div>
            <button
              onClick={testLogin}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Test Login
            </button>
            <button
              onClick={testVerify}
              className="ml-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Test Verify Token
            </button>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Test Result</h2>
            <div className="bg-slate-900/50 rounded-xl p-4 font-mono text-sm">
              <pre className="text-yellow-400 whitespace-pre-wrap break-all">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 mt-6">
          <h2 className="text-2xl font-bold text-white mb-4">📖 How Tokens Work</h2>
          <div className="text-slate-300 space-y-3">
            <p><strong className="text-white">1. Login:</strong> You send email + password to backend</p>
            <p><strong className="text-white">2. Backend creates token:</strong> A special encrypted string that proves you're logged in</p>
            <p><strong className="text-white">3. Frontend stores token:</strong> Saved in localStorage as 'goodgrid_token'</p>
            <p><strong className="text-white">4. Every API request:</strong> Frontend sends token in Authorization header</p>
            <p><strong className="text-white">5. Backend verifies:</strong> Checks if token is valid and not expired</p>
            
            <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-600 rounded-lg">
              <p className="text-yellow-200"><strong>Common Issues:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Token expired (default: 7 days)</li>
                <li>User doesn't exist in database anymore</li>
                <li>JWT_SECRET mismatch between sessions</li>
                <li>Token not being sent with requests</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDebug;
