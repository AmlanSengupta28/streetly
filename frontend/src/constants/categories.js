export const CATEGORIES = [
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'electricity', label: 'Electricity Supply' },
  { key: 'water', label: 'Water Supply' },
  { key: 'dust', label: 'Dust & Air' },
  { key: 'roads', label: 'Road Condition' },
  { key: 'drainage', label: 'Drainage' },
];

export const LEVEL_LABELS = ['', 'Bad', 'Poor', 'OK', 'Good', 'Great'];

export const ISSUE_TAGS = [
  'Potholes', 'Garbage dumping', 'Waterlogging', 'Stray animals',
  'Broken streetlight', 'Illegal parking', 'Sewage overflow',
  'Encroachment', 'Noise', 'Water tanker dependency',
];

export const ISSUES = [
  { key: 'potholes',     label: 'Potholes',             chipLabel: 'Potholes',        desc: 'Pits or holes in the road surface' },
  { key: 'waterlogging', label: 'Waterlogging',          chipLabel: 'Waterlogging',    desc: 'Water collects and stays after rain' },
  { key: 'littering',    label: 'Littering / Garbage',   chipLabel: 'Garbage',         desc: 'Trash dumped on the road or footpath' },
  { key: 'construction', label: 'Construction / Rubble', chipLabel: 'Construction',    desc: 'Building debris blocking the road' },
  { key: 'dust',         label: 'Dust & Air Pollution',  chipLabel: 'Dust & Air',      desc: 'Heavy dust or vehicle smoke in the area' },
  { key: 'drainage',     label: 'Drainage / Foul Smell', chipLabel: 'Drainage',        desc: 'Blocked drain or sewage odour' },
  { key: 'streetlight',  label: 'Broken Street Light',   chipLabel: 'No Light',    desc: 'Lights out or missing at night' },
  { key: 'footpath',     label: 'Footpath Issues',       chipLabel: 'Footpath',    desc: 'Footpath broken, blocked, or missing' },
];

export const GURGAON_CENTER = [28.4595, 77.0266];
