import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPet, updatePet } from '../services/pets';
import { usePets } from '../context/PetContext';
import type { PetUpdate, Sex } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

export default function EditPetPage() {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const { refreshPets } = usePets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<PetUpdate>({});
  const [petName, setPetName] = useState('');

  useEffect(() => {
    if (!petId) return;
    getPet(petId)
      .then((p) => {
        setPetName(p.name);
        setForm({
          name: p.name,
          breed: p.breed ?? undefined,
          age_years: p.age_years ?? undefined,
          age_months: p.age_months ?? undefined,
          weight_lbs: p.weight_lbs ?? undefined,
          sex: p.sex,
          is_neutered: p.is_neutered,
          temperament: p.temperament ?? undefined,
          medical_notes: p.medical_notes ?? undefined,
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [petId]);

  const update = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petId) return;
    setSaving(true);
    setError('');
    try {
      await updatePet(petId, form);
      await refreshPets();
      navigate(`/pets/${petId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h2>Edit {petName}</h2>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={form.name ?? ''}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Breed</label>
              <input
                type="text"
                value={form.breed ?? ''}
                onChange={(e) => update('breed', e.target.value || undefined)}
              />
            </div>
            <div className="form-group">
              <label>Sex</label>
              <select value={form.sex ?? 'unknown'} onChange={(e) => update('sex', e.target.value as Sex)}>
                <option value="unknown">Unknown</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Age (years)</label>
              <input
                type="number"
                min="0"
                max="30"
                value={form.age_years ?? ''}
                onChange={(e) => update('age_years', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="form-group">
              <label>Age (months)</label>
              <input
                type="number"
                min="0"
                max="11"
                value={form.age_months ?? ''}
                onChange={(e) => update('age_months', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Weight (lbs)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.weight_lbs ?? ''}
                onChange={(e) => update('weight_lbs', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <div className="form-group">
              <label>Neutered / Spayed</label>
              <select
                value={form.is_neutered ? 'yes' : 'no'}
                onChange={(e) => update('is_neutered', e.target.value === 'yes')}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Medical Notes</label>
            <textarea
              value={form.medical_notes ?? ''}
              onChange={(e) => update('medical_notes', e.target.value || undefined)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(`/pets/${petId}`)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
