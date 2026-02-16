import { useEffect, useState, useCallback } from 'react';
import { usePets } from '../context/PetContext';
import { listInsights, markInsightRead } from '../services/insights';
import { detectPatterns } from '../services/analysis';
import type { Insight } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

const TYPE_BADGE: Record<string, string> = {
  pattern: 'badge-pattern',
  function: 'badge-function',
  correlation: 'badge-correlation',
  recommendation: 'badge-recommendation',
};

const FUNCTION_LABELS: Record<string, string> = {
  attention: 'Attention-seeking',
  escape: 'Escape/Avoidance',
  tangible: 'Access to tangibles',
  sensory: 'Sensory/Automatic',
};

export default function InsightsPage() {
  const { selectedPet } = usePets();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    if (!selectedPet) return;
    setLoading(true);
    try {
      const list = await listInsights(selectedPet.id);
      setInsights(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [selectedPet]);

  useEffect(() => { loadInsights(); }, [loadInsights]);

  const handleDetect = async () => {
    if (!selectedPet) return;
    setDetecting(true);
    setError('');
    try {
      const result = await detectPatterns(selectedPet.id);
      if (result.patterns_found > 0) {
        await loadInsights();
      } else {
        setError('No new patterns detected. Try logging more behavior incidents.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pattern detection failed');
    } finally {
      setDetecting(false);
    }
  };

  const handleToggleRead = async (insight: Insight) => {
    try {
      const updated = await markInsightRead(insight.id, !insight.is_read);
      setInsights((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  if (!selectedPet) {
    return <div className="empty-state"><h3>Select a pet</h3></div>;
  }

  if (loading) return <LoadingSpinner message="Loading insights..." />;

  const filtered = filter === 'all'
    ? insights
    : filter === 'unread'
      ? insights.filter((i) => !i.is_read)
      : insights.filter((i) => i.insight_type === filter);

  const unreadCount = insights.filter((i) => !i.is_read).length;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Insights - {selectedPet.name}</h2>
          <p>{insights.length} insights, {unreadCount} unread</p>
        </div>
        <button className="btn btn-primary" onClick={handleDetect} disabled={detecting}>
          {detecting ? 'Analyzing...' : 'Run Pattern Detection'}
        </button>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="tabs">
        {[
          { key: 'all', label: 'All' },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'pattern', label: 'Patterns' },
          { key: 'function', label: 'Functions' },
          { key: 'correlation', label: 'Correlations' },
          { key: 'recommendation', label: 'Tips' },
        ].map((t) => (
          <button
            key={t.key}
            className={`tab ${filter === t.key ? 'active' : ''}`}
            onClick={() => setFilter(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{'\ud83d\udca1'}</div>
          <h3>No insights yet</h3>
          <p>Log at least 10 behavior incidents, then run pattern detection.</p>
        </div>
      ) : (
        filtered.map((insight) => (
          <div
            key={insight.id}
            className={`insight-card ${!insight.is_read ? 'unread' : ''}`}
            onClick={() => setExpanded(expanded === insight.id ? null : insight.id)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`insight-type-badge ${TYPE_BADGE[insight.insight_type] ?? ''}`}>
                  {insight.insight_type}
                </span>
                {insight.behavior_function && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {FUNCTION_LABELS[insight.behavior_function] ?? insight.behavior_function}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                {new Date(insight.created_at).toLocaleDateString()}
              </span>
            </div>

            <h4 style={{ fontSize: '0.95rem', marginBottom: 4 }}>{insight.title}</h4>

            {expanded === insight.id && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {insight.body}
                </p>
                {insight.confidence != null && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Confidence: {Math.round(insight.confidence * 100)}%
                    </span>
                    <div className="confidence-bar">
                      <div className="confidence-fill" style={{ width: `${insight.confidence * 100}%` }} />
                    </div>
                  </div>
                )}
                <button
                  className="btn btn-sm btn-outline"
                  style={{ marginTop: 12 }}
                  onClick={(e) => { e.stopPropagation(); handleToggleRead(insight); }}
                >
                  Mark as {insight.is_read ? 'unread' : 'read'}
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
