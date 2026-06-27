/**
 * seguimientoMock.js — Datos en memoria del CRM de seguimiento (espejo del adaptador).
 */

const LATENCIA = 180
const delay = (v) => new Promise((r) => setTimeout(() => r(v), LATENCIA))
const clone = (x) => JSON.parse(JSON.stringify(x))

function hoyMas(dias) {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

let registros = [
  {
    id: 'mock-seg-1',
    alumno_id: 'mock-al-001',
    contacto_nombre: 'María Pérez',
    contacto_telefono: '8095551001',
    contacto_email: 'maria.perez@example.com',
    canal: 'llamada',
    fecha: new Date(Date.now() - 2 * 86400000).toISOString(),
    resultado: 'reagendar',
    notas: 'Pidió volver a llamar para confirmar asistencia al concierto.',
    requiere_seguimiento: true,
    proxima_accion: 'Confirmar asistencia al concierto de gala',
    proxima_fecha: hoyMas(-1), // vencido
    estado: 'abierto',
    responsable_id: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'mock-seg-2',
    alumno_id: 'mock-al-006',
    contacto_nombre: 'Carmen Soto',
    contacto_telefono: '8295551006',
    contacto_email: 'carmen.soto@example.com',
    canal: 'whatsapp',
    fecha: new Date(Date.now() - 1 * 86400000).toISOString(),
    resultado: 'contactado',
    notas: 'Avisada del cambio de horario de ensayo. Quedó en confirmar transporte.',
    requiere_seguimiento: true,
    proxima_accion: 'Confirmar transporte',
    proxima_fecha: hoyMas(0), // hoy
    estado: 'abierto',
    responsable_id: null,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'mock-seg-3',
    alumno_id: 'mock-al-004',
    contacto_nombre: 'Pedro Núñez',
    contacto_telefono: '8095551004',
    contacto_email: null,
    canal: 'correo',
    fecha: new Date(Date.now() - 5 * 86400000).toISOString(),
    resultado: 'resuelto',
    notas: 'Entregó documentación de inscripción completa.',
    requiere_seguimiento: false,
    proxima_accion: null,
    proxima_fecha: null,
    estado: 'cerrado',
    responsable_id: null,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
]

let _seq = 100

export async function getSeguimientos(filtros = {}) {
  let res = registros.map(clone)
  if (filtros.alumno_id) res = res.filter((r) => r.alumno_id === filtros.alumno_id)
  if (filtros.estado) res = res.filter((r) => r.estado === filtros.estado)
  if (filtros.canal) res = res.filter((r) => r.canal === filtros.canal)
  res.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return delay(res)
}

export async function getSeguimientosByAlumno(alumnoId) {
  return getSeguimientos({ alumno_id: alumnoId })
}

export async function crearSeguimiento(payload) {
  const nuevo = {
    id: `mock-seg-${_seq++}`,
    alumno_id: payload.alumno_id || null,
    contacto_nombre: payload.contacto_nombre || null,
    contacto_telefono: payload.contacto_telefono || null,
    contacto_email: payload.contacto_email || null,
    canal: payload.canal || 'llamada',
    fecha: payload.fecha || new Date().toISOString(),
    resultado: payload.resultado || 'contactado',
    notas: payload.notas || null,
    requiere_seguimiento: !!payload.requiere_seguimiento,
    proxima_accion: payload.proxima_accion || null,
    proxima_fecha: payload.proxima_fecha || null,
    estado: payload.estado || 'abierto',
    responsable_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  registros.unshift(nuevo)
  return delay(clone(nuevo))
}

export async function actualizarSeguimiento(id, updates = {}) {
  const idx = registros.findIndex((r) => r.id === id)
  if (idx < 0) throw new Error('Seguimiento no encontrado')
  registros[idx] = { ...registros[idx], ...updates, updated_at: new Date().toISOString() }
  return delay(clone(registros[idx]))
}

export async function cerrarSeguimiento(id) {
  return actualizarSeguimiento(id, { estado: 'cerrado', requiere_seguimiento: false })
}

export async function eliminarSeguimiento(id) {
  registros = registros.filter((r) => r.id !== id)
  return delay(true)
}
