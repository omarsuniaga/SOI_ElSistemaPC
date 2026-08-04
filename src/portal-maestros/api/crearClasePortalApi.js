import { obtenerAlumnos } from '../../modules/alumnos/api/alumnosApi.js'
import { obtenerMaestrosActivos } from '../../modules/maestros/api/maestrosApi.js'
import { obtenerProgramas } from '../../modules/programas/api/programasApi.js'
import { obtenerSalonesActivos } from '../../modules/salones/api/salonesApi.js'

function normalizeAlumnosPayload(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.alumnos)) return payload.alumnos
  return []
}

export async function obtenerDatosCreadorClases() {
  const [maestros, salones, programas, alumnosPayload] = await Promise.all([
    obtenerMaestrosActivos(),
    obtenerSalonesActivos(),
    obtenerProgramas(),
    obtenerAlumnos({ pageSize: 1000 }),
  ])

  return {
    maestros: maestros || [],
    salones: salones || [],
    programas: programas || [],
    alumnos: normalizeAlumnosPayload(alumnosPayload).filter((alumno) => alumno?.activo !== false && alumno?.is_active !== false),
  }
}
