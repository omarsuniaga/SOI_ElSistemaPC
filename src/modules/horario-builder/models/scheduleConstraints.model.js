/**
 * Model representing schedule constraints and period definitions.
 */

export const JORNADA = {
  lunes:     { inicio: '10:00', fin: '19:00' },
  martes:    { inicio: '10:00', fin: '19:00' },
  miércoles: { inicio: '10:00', fin: '19:00' },
  jueves:    { inicio: '10:00', fin: '19:00' },
  viernes:   { inicio: '10:00', fin: '19:00' },
  sábado:    { inicio: '09:00', fin: '13:00' },
  domingo:   { inicio: '00:00', fin: '00:00' }
};

export const PERIODOS = [
  { id: 'S1-2026', nombre: 'Semestre 1 (Ene–Jul 2026)', inicio: '2026-01-01', fin: '2026-07-31' },
  { id: 'S2-2026', nombre: 'Semestre 2 (Ago–Dic 2026)', inicio: '2026-08-01', fin: '2026-12-31' },
];

export const DIAS_SEMANA = [
  { key: 'lunes',     label: 'Lunes' },
  { key: 'martes',    label: 'Martes' },
  { key: 'miércoles', label: 'Miércoles' },
  { key: 'jueves',    label: 'Jueves' },
  { key: 'viernes',   label: 'Viernes' },
  { key: 'sábado',    label: 'Sábado' }
];
