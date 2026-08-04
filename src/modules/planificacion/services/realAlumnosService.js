import { obtenerAlumnosInscritos } from '../../clases/api/clasesApi.js'
import { OfflineSyncAdapter } from '../api/offlineSyncAdapter.js'
import { obtenerEvaluacionesPorClase } from './evaluacionClaseService.js'
import { CalculadorSaludPerfil } from '../domain/CalculadorSaludPerfil.js'

/**
 * Servicio unificado para obtener la lista REAL de alumnos por clase
 * combinando inscripciones (alumnos_clases) y evaluaciones 1-5 estrellas.
 *
 * @param {string} claseId
 * @param {string|null} [nodoId] - Nodo curricular actual, si la vista que
 *   llama a este servicio está enfocada en un nodo específico. Cuando se
 *   provee, la evaluación resuelta desde la cola offline se filtra también
 *   por nodo (además de alumno + clase). Cuando se omite (listados
 *   genéricos de clase, no ligados a un nodo puntual) sólo se filtra por
 *   alumno + clase.
 */
export async function obtenerAlumnosRealesPorClase(claseId, nodoId = null) {
  let alumnosRaw = []
  try {
    const inscritos = await obtenerAlumnosInscritos(claseId)
    if (inscritos && inscritos.length > 0) {
      alumnosRaw = inscritos.map((item) => {
        const al = item.alumno || item
        return {
          id: al.id || item.alumno_id,
          nombre: al.nombre || al.nombre_completo || `${al.nombres || ''} ${al.apellidos || ''}`.trim() || `Alumno ${item.id}`,
          activo: al.estado === 'activo',
        }
      })
    }
  } catch (err) {
    console.warn('[realAlumnosService] No se pudo cargar la inscripción real de la clase:', err)
  }

  // Sin inscritos reales en `alumnos_clases`: el aula está vacía (clase nueva
  // o hiccup de RLS). NO se sustituye por un listado ajeno a la clase (fuga
  // de datos entre clases, ver auditoría M-2) ni por un catálogo semilla
  // ficticio (ver auditoría M-1). Un roster vacío es el resultado honesto.
  if (alumnosRaw.length === 0) {
    return []
  }

  const [colaOffline, evaluacionesRemotas] = await Promise.all([
    OfflineSyncAdapter.obtenerCola(),
    obtenerEvaluacionesPorClase(claseId).catch((err) => {
      console.warn('[realAlumnosService] No se pudo leer evaluaciones remotas de la clase:', err)
      return []
    }),
  ])

  const evaluacionesNormalizadas = [
    ..._normalizarEvaluacionesRemotas(evaluacionesRemotas),
    ..._normalizarEvaluacionesCola(colaOffline),
  ]

  return alumnosRaw.map((al) => {
    // Última evaluación registrada para este alumno (y nodo, si se indica).
    // Se combinan las evaluaciones persistidas en Supabase con la cola
    // offline local para que el panel refleje la fuente de verdad real.
    const evalsAlumno = evaluacionesNormalizadas.filter((item) => {
      if (String(item.alumnoId) !== String(al.id)) return false
      if (String(item.claseId) !== String(claseId)) return false
      if (nodoId != null && String(item.nodoId) !== String(nodoId)) return false
      return true
    }).sort((a, b) => b._orden - a._orden)

    const evalActual = evalsAlumno[0] || null
    const evalAnterior = evalsAlumno[1] || null

    const estrellas = evalActual ? evalActual.estrellas : 0 // 0 estrellas = Sin Registrar
    const estrellasAnteriores = evalAnterior ? evalAnterior.estrellas : null

    // NOTA (auditoría M-1): asistencias
    const ausenciasInjustificadas = 0
    const ausenciasJustificadas = 0

    // Cálculo IDIA de Salud
    const calculoIDIA = CalculadorSaludPerfil.calcular({
      totalIndicadores: 1,
      indicadoresLogrados: estrellas >= 3 ? 1 : 0,
      progresoContenidoPct: estrellas > 0 ? estrellas * 20 : 0,
      inasistenciasInjustificadas: ausenciasInjustificadas,
      inasistenciasJustificadas: ausenciasJustificadas,
    })

    return {
      id: al.id,
      nombre: al.nombre,
      estrellas, // 0..5 (Actual)
      estrellasAnteriores, // 0..5 o null (Anterior real)
      presente: true,
      idia: calculoIDIA.progresoAjustadoPct,
      estadoSalud: calculoIDIA.alertaAusentismo?.nivel
        ?? (calculoIDIA.progresoAjustadoPct >= 80 ? 'saludable' : calculoIDIA.progresoAjustadoPct >= 50 ? 'atencion' : 'riesgo'),
      alertaAusentismo: calculoIDIA.alertaAusentismo,
      ausencias: ausenciasInjustificadas + ausenciasJustificadas,
    }
  })
}

function _normalizarEvaluacionesRemotas(evaluaciones = []) {
  return (evaluaciones || []).map((e, idx) => ({
    alumnoId: e.alumno_id,
    claseId: e.clase_id,
    nodoId: e.indicator_id,
    estrellas: Number.isFinite(Number(e.nota)) ? Number(e.nota) : 0,
    timestamp: e.fecha_evaluacion || e.created_at || null,
    _orden: _toOrderValue(e.fecha_evaluacion || e.created_at || null, idx),
    _source: 'remote',
    _raw: e,
  }))
}

function _normalizarEvaluacionesCola(cola = []) {
  return (cola || []).map((e, idx) => ({
    alumnoId: e.alumnoId,
    claseId: e.claseId,
    nodoId: e.nodoId,
    estrellas: Number.isFinite(Number(e.estrellas)) ? Number(e.estrellas) : 0,
    timestamp: e.timestamp || null,
    _orden: _toOrderValue(e.timestamp || null, idx),
    _source: 'queue',
    _raw: e,
  }))
}

function _toOrderValue(timestamp, fallbackIdx = 0) {
  const value = Date.parse(timestamp || '')
  if (Number.isFinite(value)) return value
  return fallbackIdx
}
