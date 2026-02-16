import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPet } from '../services/pets';
import { usePets } from '../context/PetContext';
import type { PetCreate, Species, Sex } from '../types';
import ErrorBanner from '../components/ErrorBanner';

export default function AddPetPage() {
  const navigate = useNavigate();
  const { refreshPets } = usePets();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PetCreate>({
    name: '',
    species: 'cat',
  });

  const update = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createPet(form);
      await refreshPets();
      navigate('/pets');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pet');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Add New Pet</h2>
        <p>Create a profile for your pet</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="card" style={{ maxWidth: 600 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Pet's name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Species *</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {(['cat', 'dog'] as Species[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`chip ${form.species === s ? 'chip-active' : ''}`}
                  style={{ fontSize: '1rem', padding: '10px 24px' }}
                  onClick={() => update('species', s)}
                >
                  {s === 'cat' ? '\ud83d\udc31' : '\ud83d\udc36'} {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Breed</label>
              <input
                type="text"
                value={form.breed ?? ''}
                onChange={(e) => update('breed', e.target.value || undefined)}
                placeholder="e.g., Maine Coon"
              />
            </div>
            <div className="form-group">
              <label>Sex</label>
              <select
                value={form.sex ?? 'unknown'}
                onChange={(e) => update('sex', e.target.value as Sex)}
              >
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
              placeholder="Any health conditions, allergies, medications..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/pets')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Add Pet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
