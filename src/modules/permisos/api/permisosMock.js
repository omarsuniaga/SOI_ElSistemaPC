import permisosMockData from '../../../assets/data/mocks/permisos.json'
import maestrosMockData from '../../../assets/data/mocks/maestros.json'
import clasesMockData from '../../../assets/data/mocks/clases.json'
import { buildSinglePermisoRoster, mergePermisosRoster } from './permisosRoster.js'

// Simulación de delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Persistencia en memoria local
const permisos = [...permisosMockData]

function normalizePermiso(p) {
  if (!p) return null
  return {
    id: p.id,
    maestro_id: p.maestro_id ?? '',
    maestro_nombre: p.maestro_nombre ?? '',
    maestro_email: p.maestro_email ?? '',
    puede_registrar_alumnos: p.puede_registrar_alumnos ?? false,
    puede_inscribir_clases: p.puede_inscribir_clases ?? false,
    puede_crear_clases: p.puede_crear_clases ?? false,
    permisos: Array.isArray(p.permisos) ? p.permisos : [],
    solicitudes: Array.isArray(p.solicitudes) ? p.solicitudes : [],
    concedido_por: p.concedido_por ?? null,
    concedido_por_nombre: p.concedido_por_nombre ?? null,
    creado_en: p.creado_en || null,
    actualizado_en: p.actualizado_en || null,
  }
}

export async function obtenerPermisos() {
  await delay()
  return mergePermisosRoster({
    maestros: maestrosMockData,
    permisos: permisos.map(normalizePermiso),
    clases: clasesMockData?.clases || [],
  })
}

export async function obtenerPermisoPorMaestro(maestroId) {
  await delay()
  const permiso = permisos.find(p => p.maestro_id === maestroId)
  const maestro = maestrosMockData.find(m => m.id === maestroId) || null

  return buildSinglePermisoRoster({
    maestro,
    permiso: normalizePermiso(permiso || {
      id: null,
      maestro_id: maestroId,
      puede_registrar_alumnos: false,
      puede_inscribir_clases: false,
      puede_crear_clases: false,
      permisos: [],
      solicitudes: [],
      concedido_por: null,
      concedido_por_nombre: null,
      creado_en: null,
      actualizado_en: null,
    }),
    clases: (clasesMockData?.clases || []).filter((clase) => {
      const principalId = clase.maestro_principal_id ?? clase.maestro_titular_id ?? clase.maestro_id ?? null
      const suplenteId = clase.maestro_suplente_id ?? clase.maestro_auxiliar_id ?? null
      return principalId === maestroId || suplenteId === maestroId
    }),
  })
}

export async function actualizarPermiso(maestroId, changes) {
  await delay()
  const index = permisos.findIndex(p => p.maestro_id === maestroId)
  const now = new Date().toISOString()

  if (index === -1) {
    // Upsert: insertar nuevo
    const nuevo = {
      id: Math.random().toString(36).substr(2, 9),
      maestro_id: maestroId,
      maestro_nombre: changes.maestro_nombre || '',
      maestro_email: changes.maestro_email || '',
      puede_registrar_alumnos: changes.puede_registrar_alumnos ?? false,
      puede_inscribir_clases: changes.puede_inscribir_clases ?? false,
      puede_crear_clases: changes.puede_crear_clases ?? false,
      permisos: Array.isArray(changes.permisos) ? changes.permisos : [],
      solicitudes: Array.isArray(changes.solicitudes) ? changes.solicitudes : [],
      concedido_por: changes.concedido_por || null,
      concedido_por_nombre: changes.concedido_por_nombre || null,
      creado_en: now,
      actualizado_en: now,
    }
    permisos.push(nuevo)
    return normalizePermiso(nuevo)
  }

  // Upsert: actualizar existente
  permisos[index] = {
    ...permisos[index],
    puede_registrar_alumnos: changes.puede_registrar_alumnos ?? permisos[index].puede_registrar_alumnos,
    puede_inscribir_clases: changes.puede_inscribir_clases ?? permisos[index].puede_inscribir_clases,
    puede_crear_clases: changes.puede_crear_clases ?? permisos[index].puede_crear_clases,
    permisos: Array.isArray(changes.permisos) ? changes.permisos : permisos[index].permisos,
    solicitudes: Array.isArray(changes.solicitudes) ? changes.solicitudes : permisos[index].solicitudes,
    concedido_por: changes.concedido_por ?? permisos[index].concedido_por,
    concedido_por_nombre: changes.concedido_por_nombre ?? permisos[index].concedido_por_nombre,
    actualizado_en: now,
  }
  return normalizePermiso(permisos[index])
}
