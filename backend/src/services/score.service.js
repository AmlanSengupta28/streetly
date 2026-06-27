import { CATEGORY_KEYS } from '../constants/categories.js';

/**
 * Computes a 0-100 score from a partial ratings object.
 * Missing categories are excluded from the average rather than
 * counted as zero — a report that only rates "water" shouldn't be
 * punished for not mentioning electricity.
 */
export function computeScore(ratings) {
  const values = CATEGORY_KEYS
    .map((key) => ratings[key])
    .filter((v) => typeof v === 'number' && v >= 1 && v <= 5);

  if (values.length === 0) return null;

  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round((avg / 5) * 100);
}
