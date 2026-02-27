import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SeveritySlider, { SeverityBadge } from '../components/SeveritySlider';

describe('SeveritySlider', () => {
  it('renders a range input with min=1 and max=5', () => {
    render(<SeveritySlider value={3} onChange={vi.fn()} />);
    const input = screen.getByRole('slider');
    expect(input).toHaveAttribute('min', '1');
    expect(input).toHaveAttribute('max', '5');
  });

  it('shows the current value on the slider', () => {
    render(<SeveritySlider value={2} onChange={vi.fn()} />);
    expect(screen.getByRole('slider')).toHaveAttribute('value', '2');
  });

  it('displays the label for the current severity value', () => {
    render(<SeveritySlider value={3} onChange={vi.fn()} />);
    expect(screen.getByText(/Moderate/)).toBeInTheDocument();
  });

  it('displays "Mild" for value 1', () => {
    render(<SeveritySlider value={1} onChange={vi.fn()} />);
    expect(screen.getByText(/Mild/)).toBeInTheDocument();
  });

  it('displays "Severe" for value 5', () => {
    render(<SeveritySlider value={5} onChange={vi.fn()} />);
    expect(screen.getByText(/Severe/)).toBeInTheDocument();
  });

  it('calls onChange with a Number when the slider changes', () => {
    const onChange = vi.fn();
    render(<SeveritySlider value={2} onChange={onChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '4' } });
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('calls onChange exactly once per change event', () => {
    const onChange = vi.fn();
    render(<SeveritySlider value={1} onChange={onChange} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('SeverityBadge', () => {
  it('renders the severity number', () => {
    render(<SeverityBadge severity={4} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('applies the severity-badge class', () => {
    render(<SeverityBadge severity={2} />);
    expect(screen.getByText('2')).toHaveClass('severity-badge');
  });
});
