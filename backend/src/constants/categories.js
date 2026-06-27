// Single source of truth for rating categories and issue tags.
// The frontend has an identical copy at frontend/src/constants/categories.js —
// keep both in sync when you add/remove a category.

export const CATEGORIES = [
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'electricity', label: 'Electricity Supply' },
  { key: 'water', label: 'Water Supply' },
  { key: 'dust', label: 'Dust & Air' },
  { key: 'roads', label: 'Street Condition' },
  { key: 'drainage', label: 'Drainage' },
];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);

export const ISSUE_TAGS = [
  'Potholes',
  'Garbage dumping',
  'Waterlogging',
  'Stray animals',
  'Broken streetlight',
  'Illegal parking',
  'Sewage overflow',
  'Encroachment',
  'Noise',
  'Water tanker dependency',
];
