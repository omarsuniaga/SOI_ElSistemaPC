import { assertEnum, validateMontajeDates, MONTAJE_ESTADOS, APLICABILIDAD_COMPAS, ESTADOS_PREPARACION } from '../domain/repertoireFoundation.js'

const TABLES = Object.freeze({
  obras: 'obras',
  versiones: 'obra_versiones',
  montajes: 'montajes',
  secciones: 'montaje_secciones',
  filas: 'montaje_filas',
  alumnos: 'montaje_alumnos',
  compases: 'obra_compases',
  estados: 'catalogo_estados_preparacion'
})

function requireClient(client) {
  if (!client?.from) throw new TypeError('Se requiere un cliente Supabase compatible')
  return client
}

async function insert(client, table, payload) {
  const { data, error } = await client.from(table).insert(payload).select().single()
  if (error) throw error
  return data
}

export function createRepertoireAdapter(client) {
  const supabase = requireClient(client)
  return {
    async createObra(payload) {
      if (!payload?.titulo?.trim()) throw new TypeError('La obra requiere título')
      return insert(supabase, TABLES.obras, payload)
    },
    async createVersion(payload) {
      if (!payload?.obra_id || !payload?.nombre?.trim()) throw new TypeError('La versión requiere obra_id y nombre')
      return insert(supabase, TABLES.versiones, payload)
    },
    async createMontaje(payload) {
      if (!payload?.obra_version_id) throw new TypeError('El montaje requiere obra_version_id')
      assertEnum(payload.estado || 'PLANIFICADO', MONTAJE_ESTADOS, 'estado')
      validateMontajeDates(payload)
      return insert(supabase, TABLES.montajes, { estado: 'PLANIFICADO', ...payload })
    },
    async updateRowPreparation(id, state) {
      assertEnum(state, ESTADOS_PREPARACION, 'estado_preparacion')
      const { data, error } = await supabase.from('montaje_compases').update({ estado_preparacion: state }).eq('id', id).select().single()
      if (error) throw error
      return data
    },
    async updateStudentPreparation(payload) {
      if (!payload?.montaje_alumno_id || !payload?.montaje_compas_id) throw new TypeError('La preparación individual requiere alumno y compás')
      assertEnum(payload.estado_preparacion, ESTADOS_PREPARACION, 'estado_preparacion')
      return insert(supabase, 'montaje_alumno_compases', payload)
    },
    async addSection(payload) {
      if (!payload?.montaje_id || !payload?.nombre?.trim()) throw new TypeError('La sección requiere montaje_id y nombre')
      return insert(supabase, TABLES.secciones, payload)
    },
    async addRow(payload) {
      if (!payload?.montaje_seccion_id || !payload?.nombre?.trim()) throw new TypeError('La fila requiere sección y nombre')
      return insert(supabase, TABLES.filas, payload)
    },
    async assignStudent(payload) {
      if (!payload?.montaje_fila_id || !payload?.alumno_id) throw new TypeError('La asignación requiere fila y alumno')
      return insert(supabase, TABLES.alumnos, payload)
    },
    async addMeasure(payload) {
      if (!payload?.obra_version_id || payload.indice_interno == null || !payload.numero_visible) {
        throw new TypeError('El compás requiere versión, índice interno y número visible')
      }
      return insert(supabase, TABLES.compases, payload)
    },
    async listPreparationCatalog() {
      const { data, error } = await supabase.from(TABLES.estados).select('*').order('orden')
      if (error) throw error
      return data || []
    },
    assertApplicability(value) { return assertEnum(value, APLICABILIDAD_COMPAS, 'aplicabilidad') },
    assertPreparationState(value) { return assertEnum(value, ESTADOS_PREPARACION, 'estado_preparacion') }
  }
}
