import { describe, it, expect } from 'vitest';
import { INSTRUMENT_COLORS, getInstrumentColor, getTeacherColor } from '../utils/colorMap.js';

describe('colorMap', () => {
  it('returns a color for known instruments', () => {
    expect(getInstrumentColor('Piano')).toBe('#818cf8');
    expect(getInstrumentColor('Violín')).toBe('#34d399');
    expect(getInstrumentColor('Guitarra')).toBe('#f472b6');
  });

  it('returns fallback color for unknown instrument', () => {
    expect(getInstrumentColor('Theremin')).toBe('#94a3b8');
  });

  it('returns consistent HSL string for teacher IDs', () => {
    const c1 = getTeacherColor('t-001');
    const c2 = getTeacherColor('t-001');
    expect(c1).toBe(c2);
    expect(c1).toMatch(/^hsl\(\d+, 70%, 88%\)$/);
  });

  it('INSTRUMENT_COLORS keys are lowercase', () => {
    Object.keys(INSTRUMENT_COLORS).forEach(k => {
      expect(k).toBe(k.toLowerCase());
    });
  });
});
