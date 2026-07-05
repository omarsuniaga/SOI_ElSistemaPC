import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/ausenciasApi.js', () => ({
  obtenerClasesMaestro: vi.fn(),
  obtenerSesionesRango: vi.fn(),
  obtenerHorariosClases: vi.fn(),
  obtenerSalonesActivos: vi.fn(),
  obtenerSesionesOcupadas: vi.fn(),
  registrarAusencia: vi.fn(),
  crearNotificacionAusencia: vi.fn(),
}));

vi.mock('../../../lib/supabaseClient.js', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://cdn.test/ausencia.pdf' } })),
      })),
    },
  },
}));

import * as ausenciasApi from '../../api/ausenciasApi.js';
import {
  buildAbsencePayload,
  findAffectedClasses,
  findAvailableSalons,
  formatWhatsAppMessage,
} from '../ausenciaService.js';

describe('ausenciaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAffectedClasses', () => {
    it('returns classes affected by direct sessions and recurring schedules', async () => {
      ausenciasApi.obtenerClasesMaestro.mockResolvedValue([
        { id: 'c1', nombre: 'Violín I', instrumento: 'Violín' },
        { id: 'c2', nombre: 'Teoría', instrumento: 'Teoría' },
      ]);
      ausenciasApi.obtenerSesionesRango.mockResolvedValue([
        { clase_id: 'c1', fecha: '2026-05-20', hora_inicio: '09:00', hora_fin: '10:00' },
      ]);
      ausenciasApi.obtenerHorariosClases.mockResolvedValue([
        { clase_id: 'c2', dia: 'miércoles', hora_inicio: '11:00', hora_fin: '12:00' },
      ]);

      const result = await findAffectedClasses('m1', '2026-05-20', '2026-05-20');

      expect(result.map((item) => item.claseId)).toEqual(['c1', 'c2']);
      expect(result[0]).toMatchObject({
        className: 'Violín I',
        sessionDate: '2026-05-20',
        sessionTime: '09:00 - 10:00',
        selected: true,
      });
    });

    it('returns an empty list when the teacher has no classes', async () => {
      ausenciasApi.obtenerClasesMaestro.mockResolvedValue([]);

      await expect(findAffectedClasses('m-empty', '2026-05-20', '2026-05-20')).resolves.toEqual([]);
      expect(ausenciasApi.obtenerSesionesRango).not.toHaveBeenCalled();
    });
  });

  describe('findAvailableSalons', () => {
    it('excludes salons occupied at the selected date and time', async () => {
      ausenciasApi.obtenerSalonesActivos.mockResolvedValue([
        { id: 's1', nombre: 'Salón A', capacidad: 15 },
        { id: 's2', nombre: 'Salón B', capacidad: 10 },
      ]);
      ausenciasApi.obtenerSesionesOcupadas.mockResolvedValue([{ salon_id: 's2' }]);

      const result = await findAvailableSalons('2026-05-20', '10:00');

      expect(result).toEqual([{ id: 's1', nombre: 'Salón A', capacidad: 15 }]);
    });
  });

  describe('buildAbsencePayload', () => {
    it('maps selected class activities and coverage into the DB payload', () => {
      const payload = buildAbsencePayload({
        maestro: { id: 'm1', nombre_completo: 'Ada Lovelace' },
        formState: {
          fechaInicio: '2026-05-20',
          fechaFin: '2026-05-20',
          tipoAusencia: 'personal',
          urgencia: 'media',
          motivo: 'Motivo válido',
          duracionTipo: 'un_dia',
          clasesAfectadas: [
            { claseId: 'c1', selected: true, actividadReemplazo: 'Lectura guiada' },
            { claseId: 'c2', selected: false, actividadReemplazo: 'No debe persistir' },
          ],
          claseEmergente: {
            activo: true,
            claseId: 'c1',
            fechaNueva: '2026-05-22',
            horaNueva: '10:00',
            salonIdNuevo: 's1',
          },
        },
        archivoUrl: 'https://cdn.test/soporte.pdf',
      });

      expect(payload).toMatchObject({
        maestro_id: 'm1',
        tipo_ausencia: 'personal',
        fecha_inicio: '2026-05-20',
        fecha_fin: '2026-05-20',
        duracion_tipo: 'un_dia',
        clases_afectadas: ['c1'],
        actividades_por_clase: { c1: 'Lectura guiada' },
        archivo_url: 'https://cdn.test/soporte.pdf',
        estado: 'pendiente',
      });
      expect(payload.clase_emergente).toEqual({
        activo: true,
        clase_id: 'c1',
        fecha: '2026-05-22',
        hora: '10:00',
        salon_id: 's1',
      });
    });
  });

  describe('formatWhatsAppMessage', () => {
    it('generates a copyable Spanish summary with coverage details', () => {
      const text = formatWhatsAppMessage({
        maestro: { nombre_completo: 'Ada Lovelace' },
        ausencia: {
          tipo_ausencia: 'personal',
          urgencia: 'alta',
          fecha_inicio: '2026-05-20',
          fecha_fin: '2026-05-21',
        },
        clasesAfectadas: [{ className: 'Violín I' }, { className: 'Teoría' }],
        coverageSummary: 'Reprogramar clase el 2026-05-22 a las 10:00 en Salón A',
        approvalUrl: 'https://soi.test/admin/ausencias/123',
      });

      expect(text).toContain('Solicitud de ausencia');
      expect(text).toContain('Maestro: Ada Lovelace');
      expect(text).toContain('Clases afectadas: 2');
      expect(text).toContain('Solución: Reprogramar clase el 2026-05-22 a las 10:00 en Salón A');
      expect(text).toContain('https://soi.test/admin/ausencias/123');
    });
  });
});
