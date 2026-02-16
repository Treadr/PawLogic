import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePets } from '../context/PetContext';
import { getDashboard } from '../services/progress';
import { getInsightSummary } from '../services/insights';
import type { DashboardData, InsightSummary } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

export default function DashboardPage() {
  const { selectedPet, pets } = usePets();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [insightSummary, setInsightSummary] = useState<InsightSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedPet) return;
    setLoading(true);
    setError('');
    Promise.all([
      getDashboard(selectedPet.id),
      getInsightSummary(selectedPet.id),
    ])
      .then(([d, i]) => {
        setDashboard(d);
        setInsightSummary(i);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [selectedPet]);

  if (pets.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h2>Welcome to PawLogic</h2>
          <p>Get started by adding your first pet.</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">\ud83d\udc3e</div>
          <h3>No pets yet</h3>
          <p>Add a pet to start tracking behaviors with ABA science.</p>
          <Link to="/pets/add" className="btn btn-primary" style={{ marginTop: 16 }}>
            Add Your First Pet
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard {selectedPet ? `- ${selectedPet.name}` : ''}</h2>
        <p>Overview of behavior tracking and insights</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {dashboard && (
        <>
          <div className="card-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-value">{dashboard.total_logs}</div>
              <div className="stat-label">Total Logs</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboard.recent_7d}</div>
              <div className="stat-label">Last 7 Days</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {dashboard.trend_pct > 0 ? '+' : ''}{dashboard.trend_pct}%
              </div>
              <div className="stat-label">7-Day Trend</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {dashboard.avg_severity?.toFixed(1) ?? '--'}
              </div>
              <div className="stat-label">Avg Severity</div>
            </div>
          </div>

          <div className="card-grid">
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>Pattern Detection</h3>
              {dashboard.pattern_detection_ready ? (
                <>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
                    Enough data collected for AI pattern detection.
                  </p>
                  <Link to="/insights" className="btn btn-primary btn-sm">
                    View Insights
                  </Link>
                </>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>
                  Log at least 10 behavior incidents to unlock pattern detection.
                  Currently at {dashboard.total_logs}/10.
                </p>
              )}
            </div>

            {insightSummary && (
              <div className="card">
                <h3 style={{ marginBottom: 12 }}>Insights</h3>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {insightSummary.total}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Total</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                      {insightSummary.unread}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Unread</div>
                  </div>
                </div>
                {insightSummary.unread > 0 && (
                  <Link to="/insights" className="btn btn-accent btn-sm" style={{ marginTop: 12 }}>
                    View Unread
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="card-grid" style={{ marginTop: 24 }}>
            <Link to="/abc-logs/new" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>\ud83d\udcdd</div>
              <h3>Log Behavior</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Record an ABC incident in under 30 seconds
              </p>
            </Link>

            <Link to="/coaching" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>\ud83e\udde0</div>
              <h3>Ask the Coach</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Get AI-powered behavior advice
              </p>
            </Link>

            <Link to="/progress" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>\ud83d\udcc8</div>
              <h3>View Progress</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Charts and trends over time
              </p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
