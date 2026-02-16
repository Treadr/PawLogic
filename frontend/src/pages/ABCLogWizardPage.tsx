import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePets } from '../context/PetContext';
import { getTaxonomy, createABCLog } from '../services/abcLogs';
import type { Taxonomy, ABCLogCreate } from '../types';
import ChipSelector from '../components/ChipSelector';
import SeveritySlider from '../components/SeveritySlider';
import ErrorBanner from '../components/ErrorBanner';
import LoadingSpinner from '../components/LoadingSpinner';

const STEPS = ['Antecedent', 'Behavior', 'Consequence', 'Details'];

export default function ABCLogWizardPage() {
  const navigate = useNavigate();
  const { selectedPet } = usePets();
  const [step, setStep] = useState(0);
  const [taxonomy, setTaxonomy] = useState<Taxonomy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Partial<ABCLogCreate>>({
    behavior_severity: 3,
  });

  useEffect(() => {
    if (!selectedPet) return;
    getTaxonomy(selectedPet.species)
      .then(setTaxonomy)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load taxonomy'))
      .finally(() => setLoading(false));
  }, [selectedPet]);

  const update = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }));

  const canAdvance = () => {
    if (step === 0) return form.antecedent_category && (form.antecedent_tags?.length ?? 0) > 0;
    if (step === 1) return form.behavior_category && (form.behavior_tags?.length ?? 0) > 0;
    if (step === 2) return form.consequence_category && (form.consequence_tags?.length ?? 0) > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedPet) return;
    setSaving(true);
    setError('');
    try {
      await createABCLog({
        pet_id: selectedPet.id,
        antecedent_category: form.antecedent_category!,
        antecedent_tags: form.antecedent_tags!,
        antecedent_notes: form.antecedent_notes,
        behavior_category: form.behavior_category!,
        behavior_tags: form.behavior_tags!,
        behavior_severity: form.behavior_severity ?? 3,
        behavior_notes: form.behavior_notes,
        consequence_category: form.consequence_category!,
        consequence_tags: form.consequence_tags!,
        consequence_notes: form.consequence_notes,
        location: form.location,
        duration_seconds: form.duration_seconds,
      });
      navigate('/abc-logs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (!selectedPet) {
    return (
      <div className="empty-state">
        <h3>No pet selected</h3>
        <p>Select a pet from the sidebar to log behavior.</p>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Loading behavior categories..." />;
  if (!taxonomy) return <ErrorBanner message="Failed to load taxonomy" />;

  const antecedentCats = Object.keys(taxonomy.antecedent_categories);
  const behaviorCats = Object.keys(taxonomy.behavior_categories);
  const consequenceCats = Object.keys(taxonomy.consequence_categories);

  return (
    <div>
      <div className="page-header">
        <h2>Log Behavior - {selectedPet.name}</h2>
        <p>Step {step + 1} of 4: {STEPS[step]}</p>
      </div>

      <div className="wizard-steps">
        {STEPS.map((_, i) => (
          <div key={i} className={`wizard-step ${i === step ? 'active' : i < step ? 'completed' : ''}`} />
        ))}
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="card" style={{ maxWidth: 700 }}>
        {/* Step 0: Antecedent */}
        {step === 0 && (
          <div>
            <h3>What was happening before?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.85rem' }}>
              Select the trigger category and specific triggers
            </p>

            <div className="form-group">
              <label>Category</label>
              <ChipSelector
                options={antecedentCats}
                selected={form.antecedent_category ? [form.antecedent_category] : []}
                onChange={(s) => {
                  update('antecedent_category', s[0] || '');
                  update('antecedent_tags', []);
                }}
                multiple={false}
              />
            </div>

            {form.antecedent_category && (
              <div className="form-group">
                <label>Triggers</label>
                <ChipSelector
                  options={taxonomy.antecedent_categories[form.antecedent_category] ?? []}
                  selected={form.antecedent_tags ?? []}
                  onChange={(s) => update('antecedent_tags', s)}
                />
              </div>
            )}

            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                value={form.antecedent_notes ?? ''}
                onChange={(e) => update('antecedent_notes', e.target.value || undefined)}
                placeholder="Additional context..."
              />
            </div>
          </div>
        )}

        {/* Step 1: Behavior */}
        {step === 1 && (
          <div>
            <h3>What did {selectedPet.name} do?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.85rem' }}>
              Select the behavior type and severity
            </p>

            <div className="form-group">
              <label>Category</label>
              <ChipSelector
                options={behaviorCats}
                selected={form.behavior_category ? [form.behavior_category] : []}
                onChange={(s) => {
                  update('behavior_category', s[0] || '');
                  update('behavior_tags', []);
                }}
                multiple={false}
              />
            </div>

            {form.behavior_category && (
              <div className="form-group">
                <label>Behaviors</label>
                <ChipSelector
                  options={taxonomy.behavior_categories[form.behavior_category] ?? []}
                  selected={form.behavior_tags ?? []}
                  onChange={(s) => update('behavior_tags', s)}
                />
              </div>
            )}

            <div className="form-group">
              <label>Severity</label>
              <SeveritySlider
                value={form.behavior_severity ?? 3}
                onChange={(v) => update('behavior_severity', v)}
              />
            </div>

            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                value={form.behavior_notes ?? ''}
                onChange={(e) => update('behavior_notes', e.target.value || undefined)}
                placeholder="Describe the behavior..."
              />
            </div>
          </div>
        )}

        {/* Step 2: Consequence */}
        {step === 2 && (
          <div>
            <h3>What happened after?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.85rem' }}>
              Select the consequence type
            </p>

            <div className="form-group">
              <label>Category</label>
              <ChipSelector
                options={consequenceCats}
                selected={form.consequence_category ? [form.consequence_category] : []}
                onChange={(s) => {
                  update('consequence_category', s[0] || '');
                  update('consequence_tags', []);
                }}
                multiple={false}
              />
            </div>

            {form.consequence_category && (
              <div className="form-group">
                <label>Consequences</label>
                <ChipSelector
                  options={taxonomy.consequence_categories[form.consequence_category] ?? []}
                  selected={form.consequence_tags ?? []}
                  onChange={(s) => update('consequence_tags', s)}
                />
              </div>
            )}

            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                value={form.consequence_notes ?? ''}
                onChange={(e) => update('consequence_notes', e.target.value || undefined)}
                placeholder="What happened next..."
              />
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div>
            <h3>Additional Details</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.85rem' }}>
              Optional context for better analysis
            </p>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={form.location ?? ''}
                  onChange={(e) => update('location', e.target.value || undefined)}
                  placeholder="e.g., Living room"
                />
              </div>
              <div className="form-group">
                <label>Duration (seconds)</label>
                <input
                  type="number"
                  min="0"
                  value={form.duration_seconds ?? ''}
                  onChange={(e) => update('duration_seconds', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="card" style={{ marginTop: 20, background: 'var(--primary-light)' }}>
              <h4 style={{ marginBottom: 8 }}>Summary</h4>
              <div style={{ fontSize: '0.85rem' }}>
                <p><strong>Antecedent:</strong> {form.antecedent_category?.replace(/_/g, ' ')} - {form.antecedent_tags?.join(', ')}</p>
                <p><strong>Behavior:</strong> {form.behavior_category?.replace(/_/g, ' ')} - {form.behavior_tags?.join(', ')} (severity: {form.behavior_severity})</p>
                <p><strong>Consequence:</strong> {form.consequence_category?.replace(/_/g, ' ')} - {form.consequence_tags?.join(', ')}</p>
                {form.location && <p><strong>Location:</strong> {form.location}</p>}
              </div>
            </div>
          </div>
        )}

        <div className="wizard-nav">
          <button
            className="btn btn-outline"
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/abc-logs')}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < 3 ? (
            <button
              className="btn btn-primary"
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
            >
              Next
            </button>
          ) : (
            <button
              className="btn btn-accent"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Log'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
