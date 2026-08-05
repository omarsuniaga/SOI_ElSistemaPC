const APPROVED_EXPORT_STATES = new Set(['activa', 'cerrada', 'publicada', 'revisado', 'aprobada'])

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getPlanificacionRawEstado(plan) {
  return String(plan?.estado || '')
    .trim()
    .toLowerCase()
}

export function resolveExportableEstadoAliases(estados = ['approved']) {
  const requested = Array.isArray(estados) && estados.length > 0 ? estados : ['approved']
  const resolved = new Set()

  requested.forEach((estado) => {
    const raw = String(estado || '')
      .trim()
      .toLowerCase()

    if (!raw || raw === 'approved') {
      APPROVED_EXPORT_STATES.forEach((value) => resolved.add(value))
      return
    }

    if (raw === 'all') {
      resolved.add('all')
      return
    }

    resolved.add(raw)
  })

  return [...resolved]
}

export function isPlanificacionEstadoExportable(plan, estados = ['approved']) {
  const allowed = resolveExportableEstadoAliases(estados)
  if (allowed.includes('all')) return true
  return allowed.includes(getPlanificacionRawEstado(plan))
}

export function isPlanificacionApproved(plan) {
  return APPROVED_EXPORT_STATES.has(getPlanificacionRawEstado(plan))
}

export function formatPlanificacionExportDate(dateValue, locale = 'es-DO') {
  if (!dateValue) return 'Sin fecha'

  const parsed = new Date(dateValue)
  if (Number.isNaN(parsed.getTime())) return String(dateValue)

  return parsed.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function getExportableClassesFromPlans(plans = []) {
  const grouped = new Map()

  plans.forEach((plan) => {
    const claseId = plan?.clase_id || plan?.claseId
    if (!claseId) return

    if (!grouped.has(claseId)) {
      grouped.set(claseId, {
        claseId,
        claseNombre: plan?.clase_nombre || plan?.clases?.nombre || 'Clase sin nombre',
        instrumento: plan?.instrumento || 'General',
        totalPlanificaciones: 0,
      })
    }

    grouped.get(claseId).totalPlanificaciones += 1
  })

  return [...grouped.values()].sort((a, b) => a.claseNombre.localeCompare(b.claseNombre))
}

function sortPlans(plans = []) {
  return [...plans].sort((a, b) => {
    const dateA = new Date(a?.fecha_inicio || a?.fecha || a?.updated_at || 0).getTime()
    const dateB = new Date(b?.fecha_inicio || b?.fecha || b?.updated_at || 0).getTime()
    if (dateA !== dateB) return dateA - dateB
    return String(a?.tema || a?.titulo || '').localeCompare(String(b?.tema || b?.titulo || ''))
  })
}

export function buildPlanificacionExportPayload({
  planes = [],
  maestro = null,
  scope = 'all',
  claseId = null,
  generatedAt = new Date().toISOString(),
} = {}) {
  const filtered = claseId
    ? planes.filter((plan) => String(plan?.clase_id || plan?.claseId) === String(claseId))
    : [...planes]

  const groupedByClass = new Map()
  sortPlans(filtered).forEach((plan) => {
    const key = plan?.clase_id || plan?.claseId || 'sin-clase'
    if (!groupedByClass.has(key)) {
      groupedByClass.set(key, {
        claseId: key === 'sin-clase' ? null : key,
        claseNombre: plan?.clase_nombre || plan?.clases?.nombre || 'Clase sin nombre',
        instrumento: plan?.instrumento || 'General',
        planificaciones: [],
      })
    }
    groupedByClass.get(key).planificaciones.push(plan)
  })

  const clases = [...groupedByClass.values()].sort((a, b) => a.claseNombre.localeCompare(b.claseNombre))
  const targetClass =
    scope === 'class'
      ? clases.find((item) => String(item.claseId) === String(claseId)) || clases[0] || null
      : null

  return {
    scope: scope === 'class' ? 'class' : 'all',
    claseId: scope === 'class' ? claseId : null,
    generatedAt,
    generatedAtLabel: formatPlanificacionExportDate(generatedAt),
    maestro: {
      id: maestro?.id || null,
      nombre:
        maestro?.nombre_completo ||
        maestro?.nombre ||
        maestro?.full_name ||
        'Maestro no identificado',
    },
    totalPlanificaciones: filtered.length,
    totalClases: clases.length,
    clases,
    classDocument: targetClass,
  }
}

export function buildPlanificacionExportFilename(payload, extension = 'pdf') {
  const maestroSlug = slugify(payload?.maestro?.nombre || 'maestro')
  const suffix =
    payload?.scope === 'class'
      ? slugify(payload?.classDocument?.claseNombre || payload?.claseId || 'clase')
      : 'todas-las-clases'

  return `planificacion-${maestroSlug}-${suffix}.${extension}`
}
