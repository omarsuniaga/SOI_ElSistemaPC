/**
 * departamentosMock.js — Datos en memoria de departamentos (espejo del adaptador).
 */

const LATENCIA = 150
const delay = (v) => new Promise((r) => setTimeout(() => r(v), LATENCIA))
const clone = (x) => JSON.parse(JSON.stringify(x))

let departamentos = [
  { id: 'mock-dep-dir', codigo: 'DIR', nombre: 'Dirección', descripcion: null, email: null, activo: true, updated_at: new Date().toISOString() },
  { id: 'mock-dep-acm', codigo: 'ACM', nombre: 'Académica', descripcion: null, email: null, activo: true, updated_at: new Date().toISOString() },
  { id: 'mock-dep-adm', codigo: 'ADM', nombre: 'Administración', descripcion: null, email: null, activo: true, updated_at: new Date().toISOString() },
  { id: 'mock-dep-fin', codigo: 'FIN', nombre: 'Financiero', descripcion: null, email: null, activo: true, updated_at: new Date().toISOString() },
  { id: 'mock-dep-com', codigo: 'COM', nombre: 'Comunicaciones', descripcion: null, email: null, activo: true, updated_at: new Date().toISOString() },
  { id: 'mock-dep-log', codigo: 'LOG', nombre: 'Logística', descripcion: null, email: null, activo: true, updated_at: new Date().toISOString() },
  { id: 'mock-dep-tec', codigo: 'TECNICO', nombre: 'Técnico', descripcion: null, email: null, activo: true, updated_at: new Date().toISOString() },
]

export async function getDepartamentos() {
  return delay(departamentos.map(clone))
}

export async function actualizarDepartamento(id, updates = {}) {
  const idx = departamentos.findIndex((d) => d.id === id)
  if (idx < 0) throw new Error('Departamento no encontrado')
  departamentos[idx] = { ...departamentos[idx], ...updates, updated_at: new Date().toISOString() }
  return delay(clone(departamentos[idx]))
}
