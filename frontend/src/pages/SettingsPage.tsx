import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { userId, logout } = useAuth();

  return (
    <div>
      <div className="page-header">
        <h2>Settings</h2>
      </div>

      <div className="card" style={{ maxWidth: 600 }}>
        <div className="settings-section">
          <h3>Account</h3>
          <div className="settings-item">
            <div>
              <div style={{ fontWeight: 600 }}>User ID</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{userId}</div>
            </div>
          </div>
          <div className="settings-item">
            <div>
              <div style={{ fontWeight: 600 }}>Subscription</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Free Tier</div>
            </div>
            <span className="chip chip-active" style={{ fontSize: '0.72rem' }}>Free</span>
          </div>
        </div>

        <div className="settings-section">
          <h3>Feature Status</h3>
          {[
            { name: 'Pet Profiles', status: 'Active' },
            { name: 'ABC Behavior Logging', status: 'Active' },
            { name: 'Pattern Detection', status: 'Active' },
            { name: 'AI Coaching', status: 'Active' },
            { name: 'Progress Charts', status: 'Active' },
            { name: 'Behavior Intervention Plans', status: 'Coming Soon' },
            { name: 'Multi-Pet Analysis', status: 'Coming Soon' },
            { name: 'Vet Reports', status: 'Coming Soon' },
          ].map((f) => (
            <div key={f.name} className="settings-item">
              <span>{f.name}</span>
              <span
                className="chip"
                style={{
                  fontSize: '0.72rem',
                  padding: '2px 10px',
                  background: f.status === 'Active' ? 'var(--primary-light)' : 'var(--accent-light)',
                  color: f.status === 'Active' ? 'var(--primary)' : 'var(--accent)',
                  borderColor: 'transparent',
                }}
              >
                {f.status}
              </span>
            </div>
          ))}
        </div>

        <div className="settings-section">
          <h3>About</h3>
          <div className="settings-item">
            <div>
              <div style={{ fontWeight: 600 }}>PawLogic</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                The science behind the paws. AI-augmented pet behavior analysis using Applied Behavior Analysis (ABA) methodology.
              </div>
            </div>
          </div>
          <div className="settings-item">
            <span>Version</span>
            <span style={{ color: 'var(--text-secondary)' }}>1.0.0-beta</span>
          </div>
        </div>

        <button className="btn btn-danger btn-block" onClick={logout} style={{ marginTop: 16 }}>
          Log Out
        </button>
      </div>
    </div>
  );
}
