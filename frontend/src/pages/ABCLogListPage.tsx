import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePets } from '../context/PetContext';
import { listABCLogs, getABCLogSummary } from '../services/abcLogs';
import type { ABCLog, ABCLogSummary } from '../types';
import { SeverityBadge } from '../components/SeveritySlider';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

const SEVERITY_FILTERS = [0, 1, 2, 3, 4, 5]; // 0 = all

export default function ABCLogListPage() {
  const { selectedPet } = usePets();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<ABCLog[]>([]);
  const [summary, setSummary] = useState<ABCLogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [severityFilter, setSeverityFilter] = useState(0);

  useEffect(() => {
    if (!selectedPet) return;
    setLoading(true);
    Promise.all([
      listABCLogs(selectedPet.id, 200),
      getABCLogSummary(selectedPet.id),
    ])
      .then(([l, s]) => { setLogs(l); setSummary(s); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load logs'))
      .finally(() => setLoading(false));
  }, [selectedPet]);

  if (!selectedPet) {
    return (
      <div className="empty-state">
        <h3>No pet selected</h3>
        <p>Select a pet from the sidebar.</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Loading behavior logs..." />;

  const filtered = severityFilter > 0
    ? logs.filter((l) => l.behavior_severity >= severityFilter)
    : logs;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Behavior Logs - {selectedPet.name}</h2>
          <p>{summary?.total_logs ?? 0} total logs</p>
        </div>
        <Link to="/abc-logs/new" className="btn btn-primary">
          + New Log
        </Link>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {summary && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{summary.total_logs}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Avg Severity</span>
              <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{summary.severity_avg?.toFixed(1) ?? '--'}</div>
            </div>
            {summary.top_behaviors.slice(0, 3).map((b) => (
              <div key={b.category}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {b.category.replace(/_/g, ' ')}
                </span>
                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{b.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Filter by severity:</span>
        {SEVERITY_FILTERS.map((s) => (
          <button
            key={s}
            className={`chip ${severityFilter === s ? 'chip-active' : ''}`}
            onClick={() => setSeverityFilter(s)}
          >
            {s === 0 ? 'All' : `${s}+`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{'\ud83d\udcdd'}</div>
          <h3>No behavior logs yet</h3>
          <p>Start logging incidents to build a behavior profile.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="list-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Antecedent</th>
                <th>Behavior</th>
                <th>Consequence</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} onClick={() => navigate(`/abc-logs/${log.id}`)}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(log.occurred_at).toLocaleDateString()}
                    <br />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {new Date(log.occurred_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {log.antecedent_category.replace(/_/g, ' ')}
                    <br />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {log.antecedent_tags.join(', ')}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {log.behavior_category.replace(/_/g, ' ')}
                    <br />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {log.behavior_tags.join(', ')}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {log.consequence_category.replace(/_/g, ' ')}
                  </td>
                  <td>
                    <SeverityBadge severity={log.behavior_severity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
