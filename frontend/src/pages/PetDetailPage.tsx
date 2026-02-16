import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPet, deletePet } from '../services/pets';
import { getABCLogSummary } from '../services/abcLogs';
import { usePets } from '../context/PetContext';
import type { Pet, ABCLogSummary } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

export default function PetDetailPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const { refreshPets } = usePets();
  const [pet, setPet] = useState<Pet | null>(null);
  const [summary, setSummary] = useState<ABCLogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!petId) return;
    setLoading(true);
    Promise.all([getPet(petId), getABCLogSummary(petId)])
      .then(([p, s]) => { setPet(p); setSummary(s); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load pet'))
      .finally(() => setLoading(false));
  }, [petId]);

  const handleDelete = async () => {
    if (!petId) return;
    setDeleting(true);
    try {
      await deletePet(petId);
      await refreshPets();
      navigate('/pets');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!pet) return <ErrorBanner message={error || 'Pet not found'} />;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>
            {pet.species === 'cat' ? '\ud83d\udc31' : '\ud83d\udc36'} {pet.name}
          </h2>
          <p>
            {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
            {pet.breed && ` \u2022 ${pet.breed}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/pets/${petId}/edit`} className="btn btn-outline btn-sm">Edit</Link>
          <button className="btn btn-danger btn-sm" onClick={() => setShowDelete(true)}>Delete</button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="card-grid">
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Details</h3>
          <table style={{ width: '100%', fontSize: '0.9rem' }}>
            <tbody>
              {[
                ['Sex', pet.sex],
                ['Neutered/Spayed', pet.is_neutered ? 'Yes' : 'No'],
                ['Age', pet.age_years != null ? `${pet.age_years}y ${pet.age_months ?? 0}m` : '--'],
                ['Weight', pet.weight_lbs != null ? `${pet.weight_lbs} lbs` : '--'],
              ].map(([label, val]) => (
                <tr key={label}>
                  <td style={{ color: 'var(--text-secondary)', padding: '6px 0', width: '40%' }}>{label}</td>
                  <td style={{ padding: '6px 0', textTransform: 'capitalize' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pet.temperament && pet.temperament.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Temperament: </span>
              {pet.temperament.map((t) => (
                <span key={t} className="chip" style={{ fontSize: '0.72rem', padding: '2px 8px', marginRight: 4 }}>
                  {t}
                </span>
              ))}
            </div>
          )}
          {pet.medical_notes && (
            <div style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Medical Notes:</strong> {pet.medical_notes}
            </div>
          )}
        </div>

        {summary && (
          <div className="card">
            <h3 style={{ marginBottom: 12 }}>Behavior Summary</h3>
            <div className="card-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="stat-card">
                <div className="stat-value">{summary.total_logs}</div>
                <div className="stat-label">Total Logs</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{summary.severity_avg?.toFixed(1) ?? '--'}</div>
                <div className="stat-label">Avg Severity</div>
              </div>
            </div>
            {summary.top_behaviors.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Top Behaviors</h4>
                {summary.top_behaviors.slice(0, 5).map((b) => (
                  <div key={b.category} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem' }}>
                    <span style={{ textTransform: 'capitalize' }}>{b.category.replace(/_/g, ' ')}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{b.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <Link to="/abc-logs/new" className="btn btn-primary" style={{ marginRight: 12 }}>
          Log Behavior
        </Link>
        <Link to="/abc-logs" className="btn btn-outline">
          View All Logs
        </Link>
      </div>

      {showDelete && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete {pet.name}?</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              This will permanently delete this pet and all associated behavior logs, insights, and progress data.
            </p>
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
