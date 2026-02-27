import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SeveritySlider from '../components/SeveritySlider';

describe('SeveritySlider', () => {
  it('renders severity levels 1 through 5', () => {
    const { getByText } = render(
      <SeveritySlider value={3} onChange={jest.fn()} />,
    );
    [1, 2, 3, 4, 5].forEach((n) => expect(getByText(String(n))).toBeTruthy());
  });

  it('shows the label for the current value', () => {
    const { getByText } = render(<SeveritySlider value={3} onChange={jest.fn()} />);
    expect(getByText('Moderate')).toBeTruthy();
  });

  it('shows "Mild" for value 1', () => {
    const { getByText } = render(<SeveritySlider value={1} onChange={jest.fn()} />);
    expect(getByText('Mild')).toBeTruthy();
  });

  it('shows "Severe" for value 5', () => {
    const { getByText } = render(<SeveritySlider value={5} onChange={jest.fn()} />);
    expect(getByText('Severe')).toBeTruthy();
  });

  it('calls onChange with the tapped level number', () => {
    const onChange = jest.fn();
    const { getByText } = render(<SeveritySlider value={1} onChange={onChange} />);
    // Each dot shows its level number as text
    fireEvent.press(getByText('4'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('calls onChange with correct level when pressing 2', () => {
    const onChange = jest.fn();
    const { getByText } = render(<SeveritySlider value={5} onChange={onChange} />);
    fireEvent.press(getByText('2'));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
