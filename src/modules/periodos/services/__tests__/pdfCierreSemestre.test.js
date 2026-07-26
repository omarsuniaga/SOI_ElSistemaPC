import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../../lib/supabaseClient.js', () => ({
  supabase: { from: vi.fn(), rpc: vi.fn(), auth: { getUser: vi.fn() } },
}))

import { clasificarDocente, generarInformePdfCierreSemestre } from '../pdfCierreSemestre.js'
import { supabase } from '../../../../lib/supabaseClient.js'
import { normalizarReporte } from '../../api/reporteCierreApi.js'

/** Payload mínimo pero representativo de fn_reporte_cierre_semestre. */
function reporteFalso(overrides = {}) {
  return normalizarReporte({
    meta: { generado_en: '2026-07-26T12:00:00Z', parametros: { escala_calificacion: 5, umbral_nota_pct: 70, umbral_asistencia_pct: 75 } },
    resumen: {
      periodo: { id: 'p-1', nombre: 'Semestre 2026-I', fecha_inicio: '2026-01-01', fecha_fin: '2026-06-30', activo: false, cerrado: false },
      clases_activas: 11, alumnos_activos: 202, maestros_activos: 13,
      sesiones_periodo: 47, sesiones_registradas: 27, sesiones_borrador: 19,
      sesiones_pendientes: 16, sesiones_sin_clase: 7, marcas_asistencia: 280,
      pct_cumplimiento_registro: 57.4,
    },
    docentes: [
      { nombre: 'Camilo Lico', clases_a_cargo: 2, sesiones: 23, registradas: 14, borradores: 9, marcas_registradas: 115, marcas_tardias: 46, pct_cumplimiento: 60.9, pct_puntualidad: 60, estado_evaluacion: 'EVALUABLE' },
      { nombre: 'Omar Suniaga', clases_a_cargo: 3, sesiones: 0, registradas: 0, borradores: 0, marcas_registradas: 0, marcas_tardias: 0, pct_cumplimiento: null, pct_puntualidad: null, estado_evaluacion: 'SIN_DATOS' },
    ],
    clases: [
      { nombre: 'Violines N1-A', maestro: 'Camilo Lico', inscritos: 11, sesiones: 16, marcas: 104, tasa_asistencia: 79.8, alerta_reconciliacion: null, estado_evaluacion: 'EVALUABLE' },
      { nombre: 'Violines N0-A', maestro: 'Dyakenson', inscritos: 1, sesiones: 11, marcas: 80, tasa_asistencia: 88.8, alerta_reconciliacion: 'MARCAS_EXCEDEN_MATRICULA', estado_evaluacion: 'EVALUABLE' },
    ],
    asistencia: { total_marcas: 280, presentes: 220, ausentes: 52, justificados: 8, tasa_global: 81.4, marcas_tardias: 94, pct_registro_puntual: 66.4, por_dia_semana: { Sabado: 20 } },
    alumnos_riesgo: [{ nombre: 'Alumno X', total_marcas: 8, ausencias: 4, pct_ausencias: 50 }],
    promocion: [
      { nombre: 'Ana', instrumento: 'Violín', promedio: 4.2, pct_nota: 84, pct_asistencia: 90, veredicto: 'PROMUEVE', motivo: 'Cumple ambos criterios' },
      { nombre: 'Luis', instrumento: 'Viola', promedio: 2.5, pct_nota: 50, pct_asistencia: 80, veredicto: 'NO_PROMUEVE', motivo: 'Rendimiento por debajo del umbral' },
      { nombre: 'Sin registro', instrumento: null, promedio: null, pct_nota: null, pct_asistencia: null, veredicto: 'SIN_DATOS', motivo: 'Sin evaluaciones ni marcas' },
    ],
    promocion_totales: { PROMUEVE: 1, NO_PROMUEVE: 1, SIN_DATOS: 1 },
    instrumentos: {
      total_activos: 307, requieren_mantenimiento: 138, en_reparacion: 7,
      comodatos_activos: 29, alumnos_con_instrumento: 28, dados_de_baja: 12,
      comodatos_vencidos: 0, comodatos_sin_contrato: 29,
      historial_reparaciones: { estado: 'SIN_DATOS', motivo: 'La tabla inventario_reparaciones no tiene registros' },
    },
    brechas: [
      { dimension: 'Asistencia del personal docente', estado: 'SIN_DATOS', motivo: 'Sin registros', accion: 'Instrumentar' },
    ],
    calidad_datos: { marcas_tabla_asistencias: 280, marcas_jsonb_sesiones: 262, nota: 'Fuentes divergentes' },
    ...overrides,
  }, {
    retencion: { estado: 'SIN_DATOS', motivo: 'No hay bajas registradas' },
    avance_pedagogico: { estado: 'PARCIAL', motivo: 'Cobertura 4.5 %' },
    contingencias: { estado: 'EVALUABLE', clases_emergentes: 0, suplencias_docentes: 0 },
    justificaciones: { estado: 'PARCIAL', motivo: 'Sin causal normalizada' },
    asistencia_docente: { estado: 'SIN_DATOS', motivo: 'Captura recién habilitada' },
  })
}

describe('pdfCierreSemestre', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('clasificarDocente', () => {
    it('clasifica los rangos de eficiencia docente', () => {
      expect(clasificarDocente(95, 'EVALUABLE').nivel).toBe('EFICIENTE')
      expect(clasificarDocente(80, 'EVALUABLE').nivel).toBe('ACEPTABLE')
      expect(clasificarDocente(60, 'EVALUABLE').nivel).toBe('REGULAR')
      expect(clasificarDocente(40, 'EVALUABLE').nivel).toBe('INSOLVENTE')
    })

    it('NO clasifica a un docente sin actividad registrada', () => {
      // Ausencia de datos no es incumplimiento. Un docente sin sesiones no puede
      // aparecer como "INSOLVENTE" en un documento que va a la directiva.
      expect(clasificarDocente(null, 'SIN_DATOS').nivel).toBe('SIN_DATOS')
      expect(clasificarDocente(null, 'SIN_CLASES_ASIGNADAS').badge).toBe('Sin evaluar')
      expect(clasificarDocente(0, 'SIN_DATOS').nivel).not.toBe('INSOLVENTE')
    })
  })

  describe('generarInformePdfCierreSemestre', () => {
    it('genera un jsPDF a partir de un reporte ya obtenido, sin volver a consultar', async () => {
      const doc = await generarInformePdfCierreSemestre(reporteFalso())
      expect(doc).toBeDefined()
      expect(typeof doc.save).toBe('function')
      expect(supabase.rpc).not.toHaveBeenCalled()
    })

    it('consulta la RPC cuando recibe un id de período', async () => {
      supabase.rpc.mockResolvedValue({ data: reporteCrudoMinimo(), error: null })
      const doc = await generarInformePdfCierreSemestre('p-1')
      expect(doc).toBeDefined()
      expect(supabase.rpc).toHaveBeenCalledWith('fn_reporte_cierre_semestre', expect.objectContaining({ p_periodo_id: 'p-1' }))
    })

    it('produce más de una página con el contenido completo', async () => {
      const doc = await generarInformePdfCierreSemestre(reporteFalso())
      expect(doc.internal.getNumberOfPages()).toBeGreaterThan(1)
    })

    it('rechaza un reporte sin datos de período en vez de emitir un PDF vacío', async () => {
      await expect(generarInformePdfCierreSemestre({})).rejects.toThrow(/no contiene datos/i)
    })
  })
})

function reporteCrudoMinimo() {
  return {
    meta: { parametros: {} },
    resumen: { periodo: { id: 'p-1', nombre: 'X', fecha_inicio: '2026-01-01', fecha_fin: '2026-06-30' } },
    docentes: [], clases: [], asistencia: {}, alumnos_riesgo: [],
    promocion: [], promocion_totales: {}, instrumentos: {}, brechas: [], calidad_datos: {},
  }
}
