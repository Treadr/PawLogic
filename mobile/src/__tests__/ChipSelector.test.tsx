import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ChipSelector from '../components/ChipSelector';

const OPTIONS = ['scratches_couch', 'hissing', 'barking'];

describe('ChipSelector', () => {
  it('renders every option, humanising underscores', () => {
    const { getByText } = render(
      <ChipSelector options={OPTIONS} selected={[]} onToggle={jest.fn()} />,
    );
    expect(getByText('scratches couch')).toBeTruthy();
    expect(getByText('hissing')).toBeTruthy();
    expect(getByText('barking')).toBeTruthy();
  });

  it('calls onToggle with the tapped option value', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <ChipSelector options={OPTIONS} selected={[]} onToggle={onToggle} />,
    );
    fireEvent.press(getByText('hissing'));
    expect(onToggle).toHaveBeenCalledWith('hissing');
  });

  it('does not call onToggle on unmounted options', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <ChipSelector options={OPTIONS} selected={[]} onToggle={onToggle} />,
    );
    fireEvent.press(getByText('barking'));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith('barking');
  });

  it('fires separate onToggle calls for each press', () => {
    const onToggle = jest.fn();
    const { getByText } = render(
      <ChipSelector options={OPTIONS} selected={[]} onToggle={onToggle} />,
    );
    fireEvent.press(getByText('scratches couch'));
    fireEvent.press(getByText('barking'));
    expect(onToggle).toHaveBeenCalledTimes(2);
    expect(onToggle).toHaveBeenNthCalledWith(1, 'scratches_couch');
    expect(onToggle).toHaveBeenNthCalledWith(2, 'barking');
  });

  it('renders selected chips without error', () => {
    const { getByText } = render(
      <ChipSelector options={OPTIONS} selected={['hissing']} onToggle={jest.fn()} />,
    );
    expect(getByText('hissing')).toBeTruthy();
  });
});
