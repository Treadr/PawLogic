import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setError('Please enter a user ID');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(userId.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setUserId('demo-user-001');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>PawLogic</h1>
        <p className="tagline">The science behind the paws.</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-banner" style={{ marginBottom: 16, textAlign: 'left' }}><span>{error}</span></div>}

          <div className="form-group">
            <label>User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your user ID"
              autoFocus
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 20 }}>
          <button className="btn btn-outline btn-block btn-sm" onClick={handleDemoLogin}>
            Use Demo Account
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 8 }}>
            Development mode - JWT dev tokens
          </p>
        </div>
      </div>
    </div>
  );
}
