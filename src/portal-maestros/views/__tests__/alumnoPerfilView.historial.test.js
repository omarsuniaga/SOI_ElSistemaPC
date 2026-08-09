import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderAlumnoPerfilView } from '../alumnoPerfilView.js'
import * as maestroAuth from '../../auth/maestroAuth.js'

/**
 * alumnoPerfilView.historial.test.js
 *
 * "Historial de Clases" en el perfil del alumno debe: (a) mostrar solo
 * sesiones donde el alumno estuvo "presente" (estado 'P'), (b) mostrar el
 * contenido de esa sesión, y (c) mostrar la calificación de esa MISMA
 * sesión cuando existe un registro en `progresos` (que ya trae
 * sesion_clase_id + contenido_dsl + calificacion en una sola fila — a
 * diferencia de indicator_attempts, que solo conoce la clase, nunca la
 * sesión puntual).
 */

vi.mock('../../auth/maestroAuth.js')
vi.mock('../../../lib/supabaseClient.js', () => ({ supabase: { from: vi.fn() } }))

import { supabase } from '../../../lib/supabaseClient.js'

function chain(resolvedValue) {
  const c = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve(resolvedValue)),
    then: (onFulfilled) => Promise.resolve(resolvedValue).then(onFulfilled),
  }
  return c
}

const ALUMNO_ID = 'alumno-1'

const MOCK_ALUMNO = {
  id: ALUMNO_ID,
  nombre_completo: 'Ana Pérez',
  instrumento_principal: 'Violín',
  nivel_actual: 2,
  created_at: '2026-01-01',
}

function setupSupabase({ sesiones = [], progresos = [], clases = [], periodoActivo = null }) {
  const chains = {}
  supabase.from.mockImplementation((table) => {
    switch (table) {
      case 'alumnos':
        return chain({ data: MOCK_ALUMNO, error: null })
      case 'alumnos_clases':
        return chain({ data: [{ clase_id: 'clase-1' }], error: null })
      case 'periodos':
        return chain({ data: periodoActivo, error: periodoActivo ? null : new Error('no rows') })
      case 'sesiones_clase':
        chains.sesiones = chain({ data: sesiones, error: null })
        return chains.sesiones
      case 'indicator_attempts':
        chains.indicatorAttempts = chain({ data: [], error: null })
        return chains.indicatorAttempts
      case 'evaluacion_indicador':
        chains.evaluacionIndicador = chain({ data: [], error: null })
        return chains.evaluacionIndicador
      case 'ausencias':
        chains.ausencias = chain({ data: [], error: null })
        return chains.ausencias
      case 'justificaciones':
        return chain({ data: [], error: null })
      case 'progresos':
        chains.progresos = chain({ data: progresos, error: null })
        return chains.progresos
      case 'clases':
        return chain({ data: clases, error: null })
      default:
        return chain({ data: [], error: null })
    }
  })
  return chains
}

describe('alumnoPerfilView — Historial de Clases (contenido + calificación de la misma sesión)', () => {
  let container

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    maestroAuth.getMaestroLocal.mockReturnValue({ id: 'maestro-1', nombre: 'Test' })
    vi.clearAllMocks()
    maestroAuth.getMaestroLocal.mockReturnValue({ id: 'maestro-1', nombre: 'Test' })
  })

  afterEach(() => {
    container?.remove()
  })

  it('muestra la calificación de progresos junto al contenido de la misma sesión', async () => {
    setupSupabase({
      sesiones: [{
        id: 'sesion-1',
        clase_id: 'clase-1',
        fecha: '2026-08-01',
        contenido_dsl: 'Escalas de Do Mayor',
        asistencia: [{ alumno_id: ALUMNO_ID, estado: 'P' }],
      }],
      progresos: [{
        id: 'prog-1',
        sesion_clase_id: 'sesion-1',
        clase_id: 'clase-1',
        contenido_dsl: 'Escalas de Do Mayor',
        estado_cualitativo: 'LOGRADO',
        calificacion: 8,
        observaciones: 'Muy buena postura',
        fecha_evaluacion: '2026-08-01',
      }],
      clases: [{ id: 'clase-1', nombre: 'Violín Inicial' }],
    })

    await renderAlumnoPerfilView(container, { alumnoId: ALUMNO_ID })

    expect(container.textContent).toContain('Historial de Clases')
    expect(container.textContent).toContain('Escalas de Do Mayor')
    expect(container.textContent).toContain('8/10')
    expect(container.textContent).toContain('Muy buena postura')
  })

  it('sin registro en progresos, sigue mostrando el contenido general (compatibilidad hacia atrás)', async () => {
    setupSupabase({
      sesiones: [{
        id: 'sesion-2',
        clase_id: 'clase-1',
        fecha: '2026-08-02',
        contenido_dsl: 'Repaso de arco',
        asistencia: [{ alumno_id: ALUMNO_ID, estado: 'P' }],
      }],
      progresos: [],
      clases: [{ id: 'clase-1', nombre: 'Violín Inicial' }],
    })

    await renderAlumnoPerfilView(container, { alumnoId: ALUMNO_ID })

    expect(container.textContent).toContain('Repaso de arco')
    expect(container.textContent).not.toContain('/10')
  })

  it('sesión sin contenido_dsl pero CON registro en progresos igual aparece en el historial', async () => {
    setupSupabase({
      sesiones: [{
        id: 'sesion-3',
        clase_id: 'clase-1',
        fecha: '2026-08-03',
        contenido_dsl: null,
        asistencia: [{ alumno_id: ALUMNO_ID, estado: 'P' }],
      }],
      progresos: [{
        id: 'prog-3',
        sesion_clase_id: 'sesion-3',
        clase_id: 'clase-1',
        contenido_dsl: 'Postura corporal',
        estado_cualitativo: 'EN_PROGRESO',
        calificacion: 5,
        observaciones: null,
        fecha_evaluacion: '2026-08-03',
      }],
      clases: [{ id: 'clase-1', nombre: 'Violín Inicial' }],
    })

    await renderAlumnoPerfilView(container, { alumnoId: ALUMNO_ID })

    expect(container.textContent).toContain('Postura corporal')
    expect(container.textContent).toContain('5/10')
  })

  it('sesión "Ausente" muestra el contenido dado (sin calificación) con badge de No asistió', async () => {
    setupSupabase({
      sesiones: [{
        id: 'sesion-5',
        clase_id: 'clase-1',
        fecha: '2026-08-05',
        contenido_dsl: 'Arpegios menores',
        asistencia: [{ alumno_id: ALUMNO_ID, estado: 'A' }],
      }],
      progresos: [],
      clases: [{ id: 'clase-1', nombre: 'Violín Inicial' }],
    })

    await renderAlumnoPerfilView(container, { alumnoId: ALUMNO_ID })

    expect(container.textContent).toContain('Arpegios menores')
    expect(container.textContent).toContain('No asistió')
    expect(container.textContent).toContain('Pendiente de recuperar')
  })

  it('sesión "Justificado" también aparece con contenido, badge distinto al de Ausente', async () => {
    setupSupabase({
      sesiones: [{
        id: 'sesion-6',
        clase_id: 'clase-1',
        fecha: '2026-08-06',
        contenido_dsl: 'Digitación en 3ra posición',
        asistencia: [{ alumno_id: ALUMNO_ID, estado: 'J' }],
      }],
      progresos: [],
      clases: [{ id: 'clase-1', nombre: 'Violín Inicial' }],
    })

    await renderAlumnoPerfilView(container, { alumnoId: ALUMNO_ID })

    expect(container.textContent).toContain('Digitación en 3ra posición')
    expect(container.textContent).toContain('Justificado')
  })

  it('si el alumno recupera el mismo contenido en una sesión posterior, se anota la recuperación en la sesión perdida', async () => {
    setupSupabase({
      sesiones: [
        {
          id: 'sesion-perdida',
          clase_id: 'clase-1',
          fecha: '2026-08-01',
          contenido_dsl: 'Escalas de Sol Mayor',
          asistencia: [{ alumno_id: ALUMNO_ID, estado: 'A' }],
        },
        {
          id: 'sesion-recuperacion',
          clase_id: 'clase-1',
          fecha: '2026-08-08', // posterior
          contenido_dsl: 'Escalas de Sol Mayor', // mismo contenido, misma clase
          asistencia: [{ alumno_id: ALUMNO_ID, estado: 'P' }],
        },
      ],
      progresos: [],
      clases: [{ id: 'clase-1', nombre: 'Violín Inicial' }],
    })

    await renderAlumnoPerfilView(container, { alumnoId: ALUMNO_ID })

    expect(container.textContent).toContain('Recuperó este contenido')
    expect(container.textContent).not.toContain('Pendiente de recuperar')
  })

  it('NO anota recuperación si el contenido posterior es distinto o es de otra clase', async () => {
    setupSupabase({
      sesiones: [
        {
          id: 'sesion-perdida-2',
          clase_id: 'clase-1',
          fecha: '2026-08-01',
          contenido_dsl: 'Escalas de Sol Mayor',
          asistencia: [{ alumno_id: ALUMNO_ID, estado: 'A' }],
        },
        {
          id: 'sesion-otra-cosa',
          clase_id: 'clase-1',
          fecha: '2026-08-08',
          contenido_dsl: 'Arco staccato', // contenido distinto
          asistencia: [{ alumno_id: ALUMNO_ID, estado: 'P' }],
        },
      ],
      progresos: [],
      clases: [{ id: 'clase-1', nombre: 'Violín Inicial' }],
    })

    await renderAlumnoPerfilView(container, { alumnoId: ALUMNO_ID })

    expect(container.textContent).toContain('Pendiente de recuperar')
    expect(container.textContent).not.toContain('Recuperó este contenido')
  })

  it('por defecto ("Período actual") filtra desde la fecha de inicio del período activo', async () => {
    const periodoActivo = { id: 'per-1', nombre: '2do Semestre 2026', fecha_inicio: '2026-07-01', fecha_fin: '2026-12-15', activo: true }
    const chains = setupSupabase({ sesiones: [], progresos: [], clases: [], periodoActivo })

    await renderAlumnoPerfilView(container, { alumnoId: ALUMNO_ID })

    expect(chains.sesiones.gte).toHaveBeenCalledWith('fecha', '2026-07-01')
    expect(chains.progresos.gte).toHaveBeenCalledWith('fecha_evaluacion', '2026-07-01')
    expect(chains.ausencias.gte).toHaveBeenCalledWith('fecha_inicio', '2026-07-01')
    expect(container.textContent).toContain('2do Semestre 2026')
    expect(container.textContent).toContain('Mostrando desde el inicio')
  })

  it('rango "todo" no aplica ningún corte de fecha, aunque haya un período activo', async () => {
    const periodoActivo = { id: 'per-1', nombre: '2do Semestre 2026', fecha_inicio: '2026-07-01', fecha_fin: '2026-12-15', activo: true }
    const chains = setupSupabase({ sesiones: [], progresos: [], clases: [], periodoActivo })

    await renderAlumnoPerfilView(container, { alumnoId: ALUMNO_ID, rango: 'todo' })

    expect(chains.sesiones.gte).not.toHaveBeenCalled()
    expect(chains.progresos.gte).not.toHaveBeenCalled()
  })

  it('sin período activo configurado, "Período actual" no corta nada (fail-open) y avisa en la UI', async () => {
    const chains = setupSupabase({ sesiones: [], progresos: [], clases: [], periodoActivo: null })

    await renderAlumnoPerfilView(container, { alumnoId: ALUMNO_ID })

    expect(chains.sesiones.gte).not.toHaveBeenCalled()
    expect(container.textContent).toContain('No hay un período académico activo')
  })

  it('rango "1y" filtra desde hace 1 año, sin depender del período académico', async () => {
    const periodoActivo = { id: 'per-1', nombre: '2do Semestre 2026', fecha_inicio: '2026-07-01', fecha_fin: '2026-12-15', activo: true }
    const chains = setupSupabase({ sesiones: [], progresos: [], clases: [], periodoActivo })

    await renderAlumnoPerfilView(container, { alumnoId: ALUMNO_ID, rango: '1y' })

    const cutoffUsado = chains.sesiones.gte.mock.calls[0][1]
    expect(cutoffUsado).not.toBe('2026-07-01') // no es la fecha del período
    expect(cutoffUsado < '2026-07-01').toBe(true) // es anterior — cubre más historia
  })

  it('sesión con estado "Tardanza" no entra al historial (solo P/A/J muestran contenido)', async () => {
    setupSupabase({
      sesiones: [{
        id: 'sesion-4',
        clase_id: 'clase-1',
        fecha: '2026-08-04',
        contenido_dsl: 'Contenido que no debe verse',
        asistencia: [{ alumno_id: ALUMNO_ID, estado: 'T' }],
      }],
      progresos: [],
      clases: [{ id: 'clase-1', nombre: 'Violín Inicial' }],
    })

    await renderAlumnoPerfilView(container, { alumnoId: ALUMNO_ID })

    expect(container.textContent).not.toContain('Contenido que no debe verse')
  })
})
