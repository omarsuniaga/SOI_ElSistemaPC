/**
 * departamentosMock.js — Datos en memoria de departamentos (espejo del adaptador).
 */

const LATENCIA = 150
const delay = (v) => new Promise((r) => setTimeout(() => r(v), LATENCIA))
const clone = (x) => JSON.parse(JSON.stringify(x))

const base = (codigo, nombre) => ({
  id: `mock-dep-${codigo.toLowerCase()}`,
  codigo,
  nombre,
  descripcion: null,
  email: null,
  responsable_nombre: null,
  responsable_email: null,
  activo: true,
  updated_at: new Date().toISOString(),
})

let departamentos = [
  base('DIR', 'Dirección'),
  base('ACM', 'Académica'),
  base('ADM', 'Administración'),
  base('FIN', 'Financiero'),
  base('COM', 'Comunicaciones'),
  base('LOG', 'Logística'),
  base('TECNICO', 'Técnico'),
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

export async function enviarCorreoPrueba(email, codigo = '') {
  if (!email) throw new Error('El departamento no tiene correo definido')
  return delay({ ok: true, total: 1, enviados: 1, fallidos: 0, _codigo: codigo })
}
