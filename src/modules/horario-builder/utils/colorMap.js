export const INSTRUMENT_COLORS = {
  'piano':      '#818cf8',
  'violín':     '#34d399',
  'violin':     '#34d399',
  'guitarra':   '#f472b6',
  'canto':      '#fb923c',
  'voz':        '#ec4899',
  'percusión':  '#a78bfa',
  'percusion':  '#a78bfa',
  'solfeo':     '#38bdf8',
  'cello':      '#f59e0b',
  'flauta':     '#06b6d4',
  'trompeta':   '#84cc16',
  'general':    '#94a3b8'
};

/**
 * Returns the display color for a given instrument name.
 * Case-insensitive. Falls back to #94a3b8 (slate) for unknown instruments.
 */
export function getInstrumentColor(instrument = '') {
  return INSTRUMENT_COLORS[instrument.toLowerCase()] ?? INSTRUMENT_COLORS.general;
}

/**
 * Returns a consistent pastel HSL color for a teacher ID.
 * Same algorithm as the original hashStringToColor in horarioBuilderView.js.
 */
export function getTeacherColor(teacherId = '') {
  let hash = 0;
  for (let i = 0; i < teacherId.length; i++) {
    hash = teacherId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 88%)`;
}
