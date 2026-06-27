export function computeScore(ratings) {
  const values = Object.values(ratings).filter((v) => typeof v === 'number');
  if (!values.length) return null;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round((avg / 5) * 100);
}

export function scoreColor(score) {
  if (score === null || score === undefined) return 'var(--ink-soft)';
  if (score >= 70) return '#2F7A4F';
  if (score >= 40) return '#C97C0A';
  return '#B73B30';
}
