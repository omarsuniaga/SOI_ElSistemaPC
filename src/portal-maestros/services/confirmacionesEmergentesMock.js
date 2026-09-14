/**
 * Mock implementation of the institutional activity confirmation service.
 * Used in Demo Mode (config.isDemoMode = true).
 */

export const MOCK_ACTIVIDADES = [
  {
    id: 'act-demo-institucion-1',
    actividad: 'Concierto Anual del Sistema',
    fecha: '2026-09-15',
    lugar: 'Auditorio Principal',
    alcance_tipo: 'institucion',
    alcance_config: {},
    maestro_id: 'maestro-organizador-uuid',
    estado: 'pendiente',
    hora_inicio: '09:00',
    hora_fin: '13:00'
  },
  {
    id: 'act-demo-programa-1',
    actividad: 'Masterclass de Cuerdas Frotadas',
    fecha: '2026-09-15',
    lugar: 'Sala 101',
    alcance_tipo: 'programa',
    alcance_config: { programa_id: 'prog-orquesta-uuid' },
    maestro_id: 'maestro-cuerdas-uuid',
    estado: 'pendiente',
    hora_inicio: '10:00',
    hora_fin: '12:00'
  },
  {
    id: 'act-demo-especificos-1',
    actividad: 'Ensayo Seccional de Metales',
    fecha: '2026-09-16',
    lugar: 'Sala 204',
    alcance_tipo: 'maestros_especificos',
    alcance_config: { maestro_ids: ['maestro-1', 'maestro-2'] },
    maestro_id: 'maestro-metales-uuid',
    estado: 'pendiente',
    hora_inicio: '14:00',
    hora_fin: '17:00'
  },
  {
    id: 'act-demo-orquesta-1',
    actividad: 'Gira de Ensamble de Cuerdas',
    fecha: '2026-09-17',
    lugar: 'Teatro Municipal',
    alcance_tipo: 'orquesta',
    alcance_config: {},
    maestro_id: 'maestro-director-uuid',
    estado: 'pendiente',
    hora_inicio: '08:30',
    hora_fin: '12:30'
  },
  {
    id: 'act-demo-grupo-1',
    actividad: 'Taller Intensivo de Percusión',
    fecha: '2026-09-18',
    lugar: 'Aula Magna',
    alcance_tipo: 'grupo',
    alcance_config: { clase_ids: ['clase-perc-1', 'clase-perc-2'] },
    maestro_id: 'maestro-percusion-uuid',
    estado: 'pendiente',
    hora_inicio: '15:00',
    hora_fin: '18:00'
  }
]

let confirmacionesStore = [
  {
    id: 'conf-mock-1',
    actividad_id: 'act-demo-institucion-1',
    maestro_id: 'maestro-3',
    fecha: '2026-09-15',
    respuesta: 'si',
    estado_validacion: 'validado',
    respondido_por: 'user-3',
    respondido_at: '2026-09-15T09:30:00.000Z',
    clases_afectadas: [{ clase_id: 'clase-m3-1', clase_nombre: 'Violín I', alumnos_count: 12 }],
    observaciones: 'Participación confirmada',
    created_at: '2026-09-15T09:30:00.000Z',
    updated_at: '2026-09-15T09:30:00.000Z'
  },
  {
    id: 'conf-mock-2',
    actividad_id: 'act-demo-institucion-1',
    maestro_id: 'maestro-4',
    fecha: '2026-09-15',
    respuesta: 'no_se',
    estado_validacion: 'pendiente',
    respondido_por: 'user-4',
    respondido_at: '2026-09-15T11:00:00.000Z',
    clases_afectadas: [{ clase_id: 'clase-m4-1', clase_nombre: 'Viola', alumnos_count: 8 }],
    observaciones: 'Pendiente de verificar con coordinación',
    created_at: '2026-09-15T11:00:00.000Z',
    updated_at: '2026-09-15T11:00:00.000Z'
  }
]

export function _resetMockStore(initialConfirmaciones = null) {
  confirmacionesStore = initialConfirmaciones ? [...initialConfirmaciones] : []
}

export function _getStore() {
  return [...confirmacionesStore]
}

/**
 * Simulates RPC fn_maestros_afectados_por_alcance logic in memory.
 */
export async function obtenerMaestrosAfectadosPorAlcance({
  actividad_id,
  alcance_tipo,
  alcance_config = {},
  fecha,
  clasesContexto = []
} = {}) {
  switch (alcance_tipo) {
    case 'institucion': {
      if (clasesContexto.length > 0) {
        const maestros = clasesContexto
          .filter(c => !fecha || c.fecha === fecha)
          .map(c => c.maestro_id)
          .filter(Boolean)
        return Array.from(new Set(maestros))
      }
      return ['maestro-1', 'maestro-2', 'maestro-3', 'maestro-4']
    }
    case 'programa': {
      const progId = alcance_config?.programa_id
      if (clasesContexto.length > 0) {
        const maestros = clasesContexto
          .filter(c => (!fecha || c.fecha === fecha) && c.programa_id === progId)
          .map(c => c.maestro_id)
          .filter(Boolean)
        return Array.from(new Set(maestros))
      }
      return ['maestro-1', 'maestro-2']
    }
    case 'orquesta': {
      if (clasesContexto.length > 0) {
        const maestros = clasesContexto
          .filter(c => (!fecha || c.fecha === fecha) && c.tipo_clase === 'orquesta')
          .map(c => c.maestro_id)
          .filter(Boolean)
        return Array.from(new Set(maestros))
      }
      return ['maestro-1']
    }
    case 'coro': {
      if (clasesContexto.length > 0) {
        const maestros = clasesContexto
          .filter(c => (!fecha || c.fecha === fecha) && c.tipo_clase === 'coro')
          .map(c => c.maestro_id)
          .filter(Boolean)
        return Array.from(new Set(maestros))
      }
      return ['maestro-5']
    }
    case 'grupo': {
      const claseIds = alcance_config?.clase_ids || []
      if (claseIds.length === 0 && alcance_config?.grupo_id) {
        claseIds.push(alcance_config.grupo_id)
      }
      if (clasesContexto.length > 0) {
        const maestros = clasesContexto
          .filter(c => (!fecha || c.fecha === fecha) && claseIds.includes(c.id || c.clase_id))
          .map(c => c.maestro_id)
          .filter(Boolean)
        return Array.from(new Set(maestros))
      }
      return ['maestro-1']
    }
    case 'maestros_especificos': {
      const list = alcance_config?.maestro_ids || []
      return [...list]
    }
    default:
      return []
  }
}

/**
 * Idempotent confirmation of an institutional activity.
 */
export async function confirmarActividad(datos) {
  const { actividad_id, maestro_id, fecha, respuesta, observaciones, respondido_por, clases_afectadas } = datos || {}

  if (!actividad_id) throw new Error('confirmarActividad: se requiere actividad_id.')
  if (!maestro_id) throw new Error('confirmarActividad: se requiere maestro_id.')
  if (!fecha) throw new Error('confirmarActividad: se requiere fecha.')
  if (!respuesta) throw new Error('confirmarActividad: se requiere respuesta.')

  const validRespuestas = ['si', 'no', 'no_aplica', 'no_se']
  if (!validRespuestas.includes(respuesta)) {
    throw new Error(`confirmarActividad: respuesta inválida "${respuesta}". Debe ser una de: ${validRespuestas.join(', ')}`)
  }

  const existingIndex = confirmacionesStore.findIndex(
    c => c.actividad_id === actividad_id && c.maestro_id === maestro_id && c.fecha === fecha
  )

  const now = new Date().toISOString()
  const estadoValidacion = respuesta === 'no_se' ? 'pendiente' : 'validado'

  if (existingIndex >= 0) {
    const existing = confirmacionesStore[existingIndex]
    const updated = {
      ...existing,
      respuesta,
      estado_validacion: estadoValidacion,
      respondido_por: respondido_por || maestro_id,
      respondido_at: now,
      clases_afectadas: clases_afectadas || existing.clases_afectadas || [],
      observaciones: observaciones !== undefined ? observaciones : existing.observaciones,
      updated_at: now
    }
    confirmacionesStore[existingIndex] = updated
    return { ...updated }
  }

  const nueva = {
    id: `conf-mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actividad_id,
    maestro_id,
    fecha,
    respuesta,
    estado_validacion: estadoValidacion,
    respondido_por: respondido_por || maestro_id,
    respondido_at: now,
    clases_afectadas: clases_afectadas || [],
    observaciones: observaciones || null,
    created_at: now,
    updated_at: now
  }

  confirmacionesStore.push(nueva)
  return { ...nueva }
}

/**
 * Retrieves pending confirmations for a given maestro.
 */
export async function obtenerConfirmacionesPendientes(maestroId) {
  if (!maestroId) throw new Error('obtenerConfirmacionesPendientes: se requiere maestroId.')

  // Return activities applicable to this maestro that have not been confirmed with 'si' / 'no' / 'no_aplica'
  const pendientes = []

  for (const actividad of MOCK_ACTIVIDADES) {
    const afectados = await obtenerMaestrosAfectadosPorAlcance({
      actividad_id: actividad.id,
      alcance_tipo: actividad.alcance_tipo,
      alcance_config: actividad.alcance_config,
      fecha: actividad.fecha
    })

    if (afectados.includes(maestroId)) {
      const confirmacion = confirmacionesStore.find(
        c => c.actividad_id === actividad.id && c.maestro_id === maestroId && c.fecha === actividad.fecha
      )

      // If no confirmation exists or is in 'no_se' with estado_validacion 'pendiente'
      if (!confirmacion || (confirmacion.respuesta === 'no_se' && confirmacion.estado_validacion === 'pendiente')) {
        pendientes.push({
          id: confirmacion?.id || `pendiente-${actividad.id}-${maestroId}`,
          actividad_id: actividad.id,
          maestro_id: maestroId,
          fecha: actividad.fecha,
          estado: 'pendiente',
          confirmacion: confirmacion || null,
          actividad_info: { ...actividad },
          sesion_clase: { ...actividad }
        })
      }
    }
  }

  return pendientes
}

/**
 * Retrieves an institutional activity by its root session ID.
 */
export async function obtenerActividadPorId(actividad_id) {
  if (!actividad_id) throw new Error('obtenerActividadPorId: se requiere actividad_id.')
  const found = MOCK_ACTIVIDADES.find(a => a.id === actividad_id)
  return found ? { ...found } : null
}

/**
 * Retrieves activities and confirmations for a maestro on a given date or range.
 */
export async function obtenerActividadesPorAlcance(maestroId, fecha) {
  if (!maestroId) throw new Error('obtenerActividadesPorAlcance: se requiere maestroId.')

  return confirmacionesStore
    .filter(c => c.maestro_id === maestroId && (!fecha || c.fecha === fecha))
    .map(c => ({ ...c }))
}
