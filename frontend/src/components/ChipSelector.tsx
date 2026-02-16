interface ChipSelectorProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
}

export default function ChipSelector({ options, selected, onChange, multiple = true }: ChipSelectorProps) {
  const toggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else if (multiple) {
      onChange([...selected, option]);
    } else {
      onChange([option]);
    }
  };

  return (
    <div className="chip-selector">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`chip ${selected.includes(opt) ? 'chip-active' : ''}`}
          onClick={() => toggle(opt)}
        >
          {opt.replace(/_/g, ' ')}
        </button>
      ))}
    </div>
  );
}
