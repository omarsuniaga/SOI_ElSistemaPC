import { actualizarPermiso } from '../api/permisosSupabase.js'

/**
 * Grant a permiso key to multiple maestros.
 * Best-effort: continues even if individual upserts fail.
 *
 * @param {string[]} maestroIds
 * @param {'alumnos:create'|'clases:enroll'|'planificacion:write'|'asistencias:write'} permisoKey
 * @returns {Promise<{ succeeded: string[], failed: string[] }>}
 */
export async function grantBulk(maestroIds, permisoKey) {
  const succeeded = []
  const failed = []

  for (const maestroId of maestroIds) {
    try {
      await actualizarPermiso(maestroId, { permisos: [permisoKey] })
      succeeded.push(maestroId)
    } catch {
      failed.push(maestroId)
    }
  }

  return { succeeded, failed }
}
