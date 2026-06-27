/**
 * instrumentosMock.js — Datos en memoria que reflejan el esquema REAL de `instrumentos`.
 * Espejo del adaptador Supabase — MISMA API, datos en memoria.
 *
 * Estados válidos: disponible | asignado | danado | en_reparacion | fuera_de_uso
 *
 * "Mock First": la feature funciona en Demo mode antes de ir a producción.
 */

const LATENCIA = 200

const instrumentos = [
  {
    id: 'inst-001',
    codigo: 'VIO-001',
    nombre: 'Violín 4/4',
    tipo: 'cuerda',
    marca: 'Stentor',
    serie: 'SN-12345',
    estado: 'disponible',
    alumno_id: null,
    alumno_nombre: null,
    notas: 'Buen estado general',
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'inst-002',
    codigo: 'VIO-002',
    nombre: 'Violín 3/4',
    tipo: 'cuerda',
    marca: 'Yamaha',
    serie: 'YMH-9901',
    estado: 'asignado',
    alumno_id: 'alu-demo-001',
    alumno_nombre: 'María Pérez',
    notas: null,
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
  {
    id: 'inst-003',
    codigo: 'GIT-001',
    nombre: 'Guitarra Clásica',
    tipo: 'cuerda',
    marca: 'Yamaha',
    serie: 'CG-142C',
    estado: 'danado',
    alumno_id: null,
    alumno_nombre: null,
    notas: 'Clavijero roto, necesita reparación',
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-05-10T00:00:00Z',
  },
  {
    id: 'inst-004',
    codigo: 'CEL-001',
    nombre: 'Cello 4/4',
    tipo: 'cuerda',
    marca: 'Stentor',
    serie: 'SN-CELL-002',
    estado: 'en_reparacion',
    alumno_id: null,
    alumno_nombre: null,
    notas: 'Puente colapsado — en taller desde 2026-06-01',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'inst-005',
    codigo: 'FLA-001',
    nombre: 'Flauta traversa',
    tipo: 'viento',
    marca: 'Jupiter',
    serie: null,
    estado: 'disponible',
    alumno_id: null,
    alumno_nombre: null,
    notas: null,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-01T00:00:00Z',
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const clone = (t) => JSON.parse(JSON.stringify(t))
const delay = (val) => new Promise((resolve) => setTimeout(() => resolve(val), LATENCIA))

let _seq = 1
const genId = () => `inst-mock-${String(_seq++).padStart(4, '0')}`

// ─── API ─────────────────────────────────────────────────────────────────────

export async function listarInstrumentos(filtros = {}) {
  let res = instrumentos.map(clone)
  if (filtros.estado) res = res.filter((i) => i.estado === filtros.estado)
  if (filtros.tipo) res = res.filter((i) => i.tipo === filtros.tipo)
  if (filtros.buscar) {
    const q = filtros.buscar.toLowerCase()
    res = res.filter(
      (i) =>
        i.nombre.toLowerCase().includes(q) ||
        i.codigo.toLowerCase().includes(q) ||
        (i.marca || '').toLowerCase().includes(q),
    )
  }
  return delay(res)
}

export async function crearInstrumento(payload) {
  const nuevo = {
    id: genId(),
    codigo: payload.codigo,
    nombre: payload.nombre,
    tipo: payload.tipo || null,
    marca: payload.marca || null,
    serie: payload.serie || null,
    estado: 'disponible',
    alumno_id: null,
    alumno_nombre: null,
    notas: payload.notas || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  instrumentos.unshift(nuevo)
  return delay(clone(nuevo))
}

export async function actualizarInstrumento(id, updates) {
  const inst = instrumentos.find((i) => i.id === id)
  if (!inst) throw new Error('Instrumento no encontrado')
  Object.assign(inst, updates, { updated_at: new Date().toISOString() })
  return delay(clone(inst))
}

export async function cambiarEstadoInstrumento(id, estado) {
  const ESTADOS_VALIDOS = ['disponible', 'asignado', 'danado', 'en_reparacion', 'fuera_de_uso']
  if (!ESTADOS_VALIDOS.includes(estado)) {
    throw new Error(`Estado inválido: "${estado}". Válidos: ${ESTADOS_VALIDOS.join(', ')}`)
  }
  const inst = instrumentos.find((i) => i.id === id)
  if (!inst) throw new Error('Instrumento no encontrado')
  inst.estado = estado
  inst.updated_at = new Date().toISOString()
  return delay(clone(inst))
}

export async function asignarInstrumento(id, alumnoId, alumnoNombre) {
  const inst = instrumentos.find((i) => i.id === id)
  if (!inst) throw new Error('Instrumento no encontrado')
  inst.alumno_id = alumnoId
  inst.alumno_nombre = alumnoNombre
  inst.estado = 'asignado'
  inst.updated_at = new Date().toISOString()
  return delay(clone(inst))
}
