import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getABCLog, deleteABCLog } from '../services/abcLogs';
import type { ABCLog } from '../types';
import { SeverityBadge } from '../components/SeveritySlider';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

export default function ABCLogDetailPage() {
  const { logId } = useParams<{ logId: string }>();
  const navigate = useNavigate();
  const [log, setLog] = useState<ABCLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!logId) return;
    getABCLog(logId)
      .then(setLog)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load log'))
      .finally(() => setLoading(false));
  }, [logId]);

  const handleDelete = async () => {
    if (!logId) return;
    setDeleting(true);
    try {
      await deleteABCLog(logId);
      navigate('/abc-logs');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!log) return <ErrorBanner message={error || 'Log not found'} />;

  const sections = [
    {
      title: 'Antecedent (Trigger)',
      color: '#3B82F6',
      category: log.antecedent_category,
      tags: log.antecedent_tags,
      notes: log.antecedent_notes,
    },
    {
      title: 'Behavior',
      color: '#EF4444',
      category: log.behavior_category,
      tags: log.behavior_tags,
      notes: log.behavior_notes,
    },
    {
      title: 'Consequence',
      color: '#10B981',
      category: log.consequence_category,
      tags: log.consequence_tags,
      notes: log.consequence_notes,
    },
  ];

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Behavior Log Detail</h2>
          <p>
            {new Date(log.occurred_at).toLocaleDateString()} at{' '}
            {new Date(log.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/abc-logs')}>
            Back to List
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => setShowDelete(true)}>
            Delete
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
        <SeverityBadge severity={log.behavior_severity} />
        <span style={{ color: 'var(--text-secondary)' }}>Severity {log.behavior_severity}/5</span>
        {log.location && <span style={{ color: 'var(--text-secondary)' }}> | {log.location}</span>}
        {log.duration_seconds != null && (
          <span style={{ color: 'var(--text-secondary)' }}> | {log.duration_seconds}s duration</span>
        )}
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {sections.map((s) => (
          <div key={s.title} className="card" style={{ borderLeft: `4px solid ${s.color}` }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: 8, color: s.color }}>{s.title}</h3>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Category: </span>
              <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                {s.category.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {s.tags.map((t) => (
                <span key={t} className="chip" style={{ fontSize: '0.78rem', padding: '3px 10px' }}>
                  {t.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
            {s.notes && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                {s.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete this log?</h3>
            <p style={{ color: 'var(--text-secondary)' }}>This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
