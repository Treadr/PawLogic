import { formatCategory, severityColor } from '../utils/chartUtils';

describe('formatCategory', () => {
  it('converts a two-word snake_case slug to Title Case', () => {
    expect(formatCategory('scratches_couch')).toBe('Scratches Couch');
  });

  it('handles a single-word slug', () => {
    expect(formatCategory('barking')).toBe('Barking');
  });

  it('handles a three-word slug', () => {
    expect(formatCategory('owner_leaving_home')).toBe('Owner Leaving Home');
  });

  it('capitalises the first letter of each word', () => {
    expect(formatCategory('urinated_outside_box')).toBe('Urinated Outside Box');
  });
});

describe('severityColor', () => {
  it('returns success green for avg exactly 1', () => {
    expect(severityColor(1)).toBe('#22C55E');
  });

  it('returns success green for avg at the 1.5 boundary', () => {
    expect(severityColor(1.5)).toBe('#22C55E');
  });

  it('returns yellow-green for avg = 2', () => {
    expect(severityColor(2)).toBe('#84CC16');
  });

  it('returns yellow-green at the 2.5 boundary', () => {
    expect(severityColor(2.5)).toBe('#84CC16');
  });

  it('returns amber for avg = 3', () => {
    expect(severityColor(3)).toBe('#F59E0B');
  });

  it('returns amber at the 3.5 boundary', () => {
    expect(severityColor(3.5)).toBe('#F59E0B');
  });

  it('returns orange for avg = 4', () => {
    expect(severityColor(4)).toBe('#F97316');
  });

  it('returns orange at the 4.5 boundary', () => {
    expect(severityColor(4.5)).toBe('#F97316');
  });

  it('returns error red for avg = 5', () => {
    expect(severityColor(5)).toBe('#EF4444');
  });
});
