import { confirmDialog } from '../../../shared/components/AppConfirmDialog.js'
import {
  verificarConflictoInscripcion,
  resolverConflictoInscripcion,
  inscribirAlumno,
} from '../api/clasesApi.js'

/**
 * Orquesta el flujo "verificar → confirmar → resolver → inscribir" para un
 * único alumno. Se comparte entre claseModal.js y alumnoInscripcionModal.js
 * para no duplicar la misma lógica en ambos lugares.
 *
 * @param {Object} params
 * @param {string} params.alumnoId
 * @param {string} params.claseDestinoId
 * @param {string} [params.alumnoNombre] - Para mensajes más claros en el diálogo
 * @param {string} [params.horaInicio]
 * @param {string} [params.horaFin]
 * @returns {Promise<{enrolled: boolean, cancelled: boolean}>}
 *   enrolled=true si se inscribió (con o sin conflicto resuelto).
 *   cancelled=true si el admin canceló el diálogo (no se inscribió).
 */
export async function inscribirConManejoDeConflicto({ alumnoId, claseDestinoId, alumnoNombre = 'El alumno', horaInicio = null, horaFin = null }) {
  const conflicto = await verificarConflictoInscripcion(alumnoId, claseDestinoId)

  if (conflicto) {
    const mensaje = `${alumnoNombre} ya está inscrito en <strong>${conflicto.clase_nombre}</strong>, que se solapa el ${conflicto.horario}. ` +
      `¿Deseás desinscribirlo de esa clase e inscribirlo en la nueva de todas formas? ` +
      `La clase "${conflicto.clase_nombre}" quedará marcada para revisión.`

    const aceptado = await confirmDialog({
      title: 'Conflicto de horario del alumno',
      message: mensaje,
      confirmText: 'Sí, reasignar',
      cancelText: 'Cancelar',
    })

    if (!aceptado) {
      return { enrolled: false, cancelled: true }
    }

    const motivo = `Se desinscribió automáticamente a ${alumnoNombre} porque fue reasignado a otra clase con horario en conflicto (${conflicto.horario}).`
    await resolverConflictoInscripcion(conflicto.clase_id, alumnoId, motivo)
  }

  await inscribirAlumno(claseDestinoId, alumnoId, horaInicio, horaFin)
  return { enrolled: true, cancelled: false }
}
