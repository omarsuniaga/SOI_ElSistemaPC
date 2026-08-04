function normalizePermissionRecord(permiso) {
  if (!permiso) return null

  return {
    ...permiso,
    id: permiso.id ?? null,
    maestro_id: permiso.maestro_id ?? '',
    maestro_nombre: permiso.maestros?.nombre_completo ?? permiso.maestro_nombre ?? '',
    maestro_email: permiso.maestros?.correo ?? permiso.maestro_email ?? '',
    maestro_activo: permiso.maestro_activo ?? true,
    puede_registrar_alumnos: permiso.puede_registrar_alumnos ?? false,
    puede_inscribir_clases: permiso.puede_inscribir_clases ?? false,
    puede_crear_clases: permiso.puede_crear_clases ?? false,
    permisos: Array.isArray(permiso.permisos) ? permiso.permisos : [],
    solicitudes: Array.isArray(permiso.solicitudes) ? permiso.solicitudes : [],
    concedido_por: permiso.concedido_por ?? null,
    concedido_por_nombre: permiso.concedido_por_nombre ?? null,
    creado_en: permiso.creado_en || null,
    actualizado_en: permiso.actualizado_en || null,
  }
}

function toClassAssignments(clase) {
  if (!clase) return { principalId: null, suplenteId: null }

  return {
    principalId: clase.maestro_principal_id ?? clase.maestro_titular_id ?? clase.maestro_id ?? null,
    suplenteId: clase.maestro_suplente_id ?? clase.maestro_auxiliar_id ?? null,
  }
}

export function buildClassSummaryByMaestro(clases = []) {
  return (clases || []).reduce((acc, clase) => {
    const { principalId, suplenteId } = toClassAssignments(clase)

    if (principalId) {
      if (!acc[principalId]) {
        acc[principalId] = { total: 0, principal: 0, suplente: 0 }
      }
      acc[principalId].total += 1
      acc[principalId].principal += 1
    }

    if (suplenteId) {
      if (!acc[suplenteId]) {
        acc[suplenteId] = { total: 0, principal: 0, suplente: 0 }
      }
      acc[suplenteId].total += 1
      acc[suplenteId].suplente += 1
    }

    return acc
  }, {})
}

function buildRosterEntry({ maestro = null, permiso = null, summary = null }) {
  const normalizedPermiso = normalizePermissionRecord(permiso) || {}
  const maestroId = maestro?.id ?? normalizedPermiso.maestro_id ?? ''
  const total = Number(summary?.total ?? 0)
  const principal = Number(summary?.principal ?? 0)
  const suplente = Number(summary?.suplente ?? 0)

  return {
    ...normalizedPermiso,
    maestro_id: maestroId,
    maestro_nombre: maestro?.nombre_completo ?? maestro?.nombre ?? normalizedPermiso.maestro_nombre ?? '',
    maestro_email: maestro?.correo ?? maestro?.email ?? normalizedPermiso.maestro_email ?? '',
    maestro_activo: maestro?.activo ?? maestro?.is_active ?? normalizedPermiso.maestro_activo ?? true,
    total_clases_asignadas: total,
    clases_titular: principal,
    clases_suplente: suplente,
    puede_gestionar_clases_habilitable: total > 0,
    tiene_clases_asignadas: total > 0,
  }
}

export function mergePermisosRoster({ maestros = [], permisos = [], clases = [] }) {
  const classSummaryByMaestro = buildClassSummaryByMaestro(clases)
  const permisosByMaestro = new Map(
    (permisos || [])
      .map((permiso) => normalizePermissionRecord(permiso))
      .filter(Boolean)
      .map((permiso) => [permiso.maestro_id, permiso]),
  )

  const maestroIds = new Set([
    ...(maestros || []).map((maestro) => maestro?.id).filter(Boolean),
    ...permisosByMaestro.keys(),
  ])

  return [...maestroIds]
    .map((maestroId) =>
      buildRosterEntry({
        maestro: (maestros || []).find((entry) => entry?.id === maestroId) ?? null,
        permiso: permisosByMaestro.get(maestroId) ?? null,
        summary: classSummaryByMaestro[maestroId] ?? null,
      }),
    )
    .sort((a, b) => {
      const byName = String(a.maestro_nombre || '').localeCompare(String(b.maestro_nombre || ''), 'es', {
        sensitivity: 'base',
      })
      if (byName !== 0) return byName
      return String(a.maestro_id || '').localeCompare(String(b.maestro_id || ''), 'es', {
        sensitivity: 'base',
      })
    })
}

export function buildSinglePermisoRoster({ maestro = null, permiso = null, clases = [] }) {
  const summary = buildClassSummaryByMaestro(clases)
  const maestroId = maestro?.id ?? permiso?.maestro_id ?? ''
  return buildRosterEntry({
    maestro,
    permiso,
    summary: summary[maestroId] ?? null,
  })
}
