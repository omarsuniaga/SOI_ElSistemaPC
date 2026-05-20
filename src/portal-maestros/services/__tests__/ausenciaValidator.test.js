import { describe, expect, it } from 'vitest';

import {
  validateAbsenceRequest,
  validateDateRange,
  validateSupportFile,
} from '../ausenciaValidator.js';

describe('ausenciaValidator', () => {
  describe('validateDateRange', () => {
    it('accepts a valid one-day range', () => {
      expect(validateDateRange('2026-05-20', '2026-05-20')).toEqual({
        valid: true,
        duracionTipo: 'un_dia',
        errors: {},
      });
    });

    it('rejects an end date before the start date', () => {
      const result = validateDateRange('2026-05-21', '2026-05-20');

      expect(result.valid).toBe(false);
      expect(result.errors.fechaFin).toBe('La fecha final no puede ser anterior a la fecha inicial.');
    });
  });

  describe('validateSupportFile', () => {
    it('accepts PDF and image files up to 5MB', () => {
      const file = new File(['support'], 'soporte.pdf', { type: 'application/pdf' });

      expect(validateSupportFile(file)).toEqual({ valid: true, errors: {} });
    });

    it('rejects unsupported file types', () => {
      const file = new File(['bad'], 'soporte.exe', { type: 'application/x-msdownload' });

      const result = validateSupportFile(file);

      expect(result.valid).toBe(false);
      expect(result.errors.archivo).toBe('El documento debe ser PDF, JPG o PNG.');
    });
  });

  describe('validateAbsenceRequest', () => {
    it('requires a replacement activity for each selected affected class', () => {
      const result = validateAbsenceRequest({
        fechaInicio: '2026-05-20',
        fechaFin: '2026-05-20',
        tipoAusencia: 'personal',
        urgencia: 'media',
        motivo: 'Cita familiar impostergable',
        clasesAfectadas: [
          { claseId: 'clase-1', selected: true, actividadReemplazo: '' },
        ],
      });

      expect(result.valid).toBe(false);
      expect(result.errors['actividad_clase-1']).toBe('Indicá la actividad de reemplazo para esta clase.');
    });

    it('accepts a complete request with selected class activities', () => {
      const result = validateAbsenceRequest({
        fechaInicio: '2026-05-20',
        fechaFin: '2026-05-21',
        tipoAusencia: 'capacitacion',
        urgencia: 'alta',
        motivo: 'Capacitación institucional confirmada.',
        clasesAfectadas: [
          { claseId: 'clase-1', selected: true, actividadReemplazo: 'Repasar escala mayor y registrar dudas.' },
        ],
        archivo: null,
      });

      expect(result.valid).toBe(true);
      expect(result.duracionTipo).toBe('varios_dias');
      expect(result.errors).toEqual({});
    });
  });
});
