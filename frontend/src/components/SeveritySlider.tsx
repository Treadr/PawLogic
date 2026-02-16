const SEVERITY_LABELS = ['', 'Mild', 'Low', 'Moderate', 'High', 'Severe'];
const SEVERITY_COLORS = ['', '#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];

interface SeveritySliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function SeveritySlider({ value, onChange }: SeveritySliderProps) {
  return (
    <div className="severity-slider">
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: SEVERITY_COLORS[value] }}
      />
      <div className="severity-labels">
        <span className="severity-value" style={{ color: SEVERITY_COLORS[value] }}>
          {value} - {SEVERITY_LABELS[value]}
        </span>
      </div>
    </div>
  );
}

export function SeverityBadge({ severity }: { severity: number }) {
  return (
    <span
      className="severity-badge"
      style={{ backgroundColor: SEVERITY_COLORS[severity] }}
    >
      {severity}
    </span>
  );
}
