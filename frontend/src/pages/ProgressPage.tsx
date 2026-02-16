import { useEffect, useState } from 'react';
import { usePets } from '../context/PetContext';
import { getBehaviorFrequency, getSeverityTrend, getCategoryBreakdown } from '../services/progress';
import type { FrequencyData, SeverityTrendData, CategoryBreakdown } from '../types';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorBanner from '../components/ErrorBanner';

const PIE_COLORS = ['#0D9E85', '#FF7759', '#3B82F6', '#EAB308', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export default function ProgressPage() {
  const { selectedPet } = usePets();
  const [days, setDays] = useState(30);
  const [frequency, setFrequency] = useState<FrequencyData | null>(null);
  const [severity, setSeverity] = useState<SeverityTrendData | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedPet) return;
    setLoading(true);
    setError('');
    Promise.all([
      getBehaviorFrequency(selectedPet.id, days),
      getSeverityTrend(selectedPet.id, days),
      getCategoryBreakdown(selectedPet.id, days),
    ])
      .then(([f, s, c]) => { setFrequency(f); setSeverity(s); setCategories(c); })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [selectedPet, days]);

  if (!selectedPet) {
    return <div className="empty-state"><h3>Select a pet</h3></div>;
  }

  if (loading) return <LoadingSpinner message="Loading progress data..." />;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Progress - {selectedPet.name}</h2>
          <p>Behavior trends and analysis</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[7, 14, 30, 60, 90].map((d) => (
            <button
              key={d}
              className={`chip ${days === d ? 'chip-active' : ''}`}
              onClick={() => setDays(d)}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {/* Frequency Chart */}
      {frequency && frequency.data.length > 0 && (
        <div className="chart-container">
          <h3>Behavior Frequency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={frequency.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                labelFormatter={(d) => new Date(d).toLocaleDateString()}
                contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Incidents" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Severity Trend */}
      {severity && severity.data.length > 0 && (
        <div className="chart-container">
          <h3>Severity Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={severity.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(d) => new Date(d).toLocaleDateString()}
                contentStyle={{ borderRadius: 8, border: '1px solid var(--border)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="avg_severity" stroke="var(--primary)" strokeWidth={2} name="Average" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="max_severity" stroke="var(--accent)" strokeWidth={2} name="Maximum" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown */}
      {categories && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {[
            { title: 'Behaviors', data: categories.behaviors },
            { title: 'Antecedents (Triggers)', data: categories.antecedents },
            { title: 'Consequences', data: categories.consequences },
          ].map(({ title, data }) => (
            data.length > 0 && (
              <div key={title} className="chart-container">
                <h3>{title}</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.map((d) => ({ ...d, name: d.category.replace(/_/g, ' ') }))}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(props) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                    >
                      {data.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )
          ))}
        </div>
      )}

      {(!frequency || frequency.data.length === 0) && (!severity || severity.data.length === 0) && (
        <div className="empty-state">
          <div className="empty-icon">{'\ud83d\udcc8'}</div>
          <h3>No data yet</h3>
          <p>Log behavior incidents to see progress charts.</p>
        </div>
      )}
    </div>
  );
}
