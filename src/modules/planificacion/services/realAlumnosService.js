import { obtenerAlumnosInscritos } from '../../clases/api/clasesApi.js'
import { OfflineSyncAdapter } from '../api/offlineSyncAdapter.js'
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

  // Obtener cola local de evaluaciones para combinar puntajes de estrellas
  const colaOffline = await OfflineSyncAdapter.obtenerCola()

  return alumnosRaw.map((al) => {
    // Última evaluación registrada para este alumno (y nodo, si se indica).
    // guardarLocal() apila (push) al final de la cola, por lo que se recorre
    // en reversa para quedarnos con la MÁS RECIENTE, no con la más antigua
    // (ver auditoría M-3). También se exige coincidencia de claseId (y de
    // nodoId cuando se especifica) para que la evaluación de un nodo/clase
    // no se filtre hacia otro nodo/clase del mismo alumno.
    const evalRegistrada = [...colaOffline].reverse().find((item) => {
      if (String(item.alumnoId) !== String(al.id)) return false
      if (String(item.claseId) !== String(claseId)) return false
      if (nodoId != null && String(item.nodoId) !== String(nodoId)) return false
      return true
    })
    const estrellas = evalRegistrada ? evalRegistrada.estrellas : 0 // 0 estrellas = Sin Registrar

    // NOTA (auditoría M-1): aún no existe una consulta real de `asistencias`
    // indexada por (claseId, alumnoId) sin pasar por sesion_clase_id — ver
    // asistenciasSupabase.js. Mientras esa consulta no se incorpore, se usa
    // el valor honesto "sin datos" (0 inasistencias, presente=true) en vez
    // de inventar un patrón de asistencia falso.
    const ausenciasInjustificadas = 0
    const ausenciasJustificadas = 0

    // Cálculo IDIA de Salud — contrato real de CalculadorSaludPerfil.calcular
    // (ver auditoría C-3): el dominio no recibe avanceCurricularPct ni
    // devuelve idia/estadoSalud, así que se traduce explícitamente.
    const calculoIDIA = CalculadorSaludPerfil.calcular({
      totalIndicadores: 1,
      indicadoresLogrados: estrellas >= 3 ? 1 : 0,
      inasistenciasInjustificadas: ausenciasInjustificadas,
      inasistenciasJustificadas: ausenciasJustificadas,
    })

    return {
      id: al.id,
      nombre: al.nombre,
      estrellas, // 0..5
      presente: true,
      idia: calculoIDIA.progresoAjustadoPct,
      estadoSalud: calculoIDIA.alertaAusentismo?.nivel
        ?? (calculoIDIA.progresoAjustadoPct >= 80 ? 'saludable' : calculoIDIA.progresoAjustadoPct >= 50 ? 'atencion' : 'riesgo'),
      alertaAusentismo: calculoIDIA.alertaAusentismo,
      ausencias: ausenciasInjustificadas + ausenciasJustificadas,
    }
  })
}
