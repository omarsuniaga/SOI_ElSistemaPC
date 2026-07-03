/**
 * Mock simple en memoria para solicitudes_necesidades.
 */

const _rows = []

export function __resetForTests() {
  _rows.length = 0
}

function _clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function _nowIso() {
  return new Date().toISOString()
}

function _withDefaults(data) {
  return {
    id: crypto.randomUUID(),
    correlation_id: null,
    link_tienda: null,
    costo_estimado: null,
    presupuesto: null,
    departamento_actual: 'ACM',
    pre_aprobada_por: null,
    presupuestado_por: null,
    estado: 'pendiente',
    respuesta_admin: null,
    fecha_solicitud: new Date().toISOString().slice(0, 10),
    created_at: _nowIso(),
    updated_at: _nowIso(),
    ...data,
  }
}

export async function crearSolicitud(data) {
  const row = _withDefaults(data)
  _rows.unshift(row)
  return _clone(row)
}

export async function listarPorMaestro(maestroId) {
  return _clone(_rows.filter(r => r.maestro_id === maestroId))
}

export async function listarPorDepartamento(departamento, estados = []) {
  return _clone(_rows.filter(r =>
    (!departamento || r.departamento_actual === departamento || r.estado === departamento) &&
    (estados.length === 0 || estados.includes(r.estado))
  ))
}

async function _patch(id, patch) {
  const idx = _rows.findIndex(r => r.id === id)
  if (idx === -1) throw new Error('Solicitud no encontrada')
  _rows[idx] = { ..._rows[idx], ...patch, updated_at: _nowIso() }
  return _clone(_rows[idx])
}

export const preAprobar = (id, actorId, respuesta_admin = null) =>
  _patch(id, { estado: 'pre_aprobada_acm', pre_aprobada_por: actorId, respuesta_admin })

export const rechazar = (id, actorId, respuesta_admin = null) =>
  _patch(id, { estado: 'rechazada_acm', pre_aprobada_por: actorId, respuesta_admin })

export const escalarAFin = (id, actorId = null) =>
  _patch(id, { estado: 'en_presupuesto', departamento_actual: 'FIN', pre_aprobada_por: actorId })

export const cargarPresupuesto = (id, actorId, presupuesto, costo_estimado = null, respuesta_admin = null) =>
  _patch(id, {
    estado: 'presupuestada',
    presupuesto,
    costo_estimado,
    presupuestado_por: actorId,
    respuesta_admin,
  })

export const resolver = (id, estado, actorId = null, respuesta_admin = null) =>
  _patch(id, {
    estado,
    presupuestado_por: actorId,
    respuesta_admin,
  })

export const cancelar = (id) => _patch(id, { estado: 'cancelada' })

export async function contarPendientes(departamento) {
  return _rows.filter(r =>
    r.departamento_actual === departamento && ['pendiente', 'en_presupuesto', 'presupuestada'].includes(r.estado)
  ).length
}

export async function contarNovedadesMaestro(maestroId, desde) {
  return _rows.filter(r =>
    r.maestro_id === maestroId && new Date(r.updated_at) >= new Date(desde)
  ).length
}
