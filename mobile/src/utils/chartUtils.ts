import { colors } from '../constants/colors';

export function formatCategory(slug: string): string {
  return slug
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function severityColor(avg: number): string {
  if (avg <= 1.5) return colors.success;
  if (avg <= 2.5) return '#84CC16';
  if (avg <= 3.5) return colors.warning;
  if (avg <= 4.5) return '#F97316';
  return colors.error;
}
