import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChipSelector from '../components/ChipSelector';

const OPTIONS = ['scratches_couch', 'hissing', 'barking'];

describe('ChipSelector', () => {
  it('renders all options with underscores replaced by spaces', () => {
    render(<ChipSelector options={OPTIONS} selected={[]} onChange={vi.fn()} />);
    expect(screen.getByText('scratches couch')).toBeInTheDocument();
    expect(screen.getByText('hissing')).toBeInTheDocument();
    expect(screen.getByText('barking')).toBeInTheDocument();
  });

  it('adds chip-active class to selected chips', () => {
    render(<ChipSelector options={OPTIONS} selected={['hissing']} onChange={vi.fn()} />);
    expect(screen.getByText('hissing').closest('button')).toHaveClass('chip-active');
    expect(screen.getByText('barking').closest('button')).not.toHaveClass('chip-active');
  });

  it('calls onChange with the new combined selection when an unselected chip is clicked (multi-select)', () => {
    const onChange = vi.fn();
    render(<ChipSelector options={OPTIONS} selected={['hissing']} onChange={onChange} />);
    fireEvent.click(screen.getByText('barking'));
    expect(onChange).toHaveBeenCalledWith(['hissing', 'barking']);
  });

  it('removes a chip from selection when the same chip is clicked again', () => {
    const onChange = vi.fn();
    render(<ChipSelector options={OPTIONS} selected={['hissing']} onChange={onChange} />);
    fireEvent.click(screen.getByText('hissing'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('replaces selection entirely in single-select mode', () => {
    const onChange = vi.fn();
    render(
      <ChipSelector
        options={OPTIONS}
        selected={['hissing']}
        onChange={onChange}
        multiple={false}
      />,
    );
    fireEvent.click(screen.getByText('barking'));
    expect(onChange).toHaveBeenCalledWith(['barking']);
  });

  it('renders an empty state without errors when options is empty', () => {
    const { container } = render(
      <ChipSelector options={[]} selected={[]} onChange={vi.fn()} />,
    );
    expect(container.querySelector('.chip-selector')).toBeInTheDocument();
  });
});
