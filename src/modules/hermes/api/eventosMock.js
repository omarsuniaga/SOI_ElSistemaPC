/**
 * eventosMock.js — Eventos institucionales demo para el portal ADM.
 *
 * Espejo de calendario_institucional en memoria. Incluye el flujo de estados:
 *   pendiente → aceptado → preprogramado → concretado
 *                                  ↘ cancelado
 */

const LATENCIA = 180
const delay = (v) => new Promise((r) => setTimeout(() => r(v), LATENCIA))
const clone = (x) => JSON.parse(JSON.stringify(x))

function enDias(dias, hora = 18) {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  d.setHours(hora, 0, 0, 0)
  return d.toISOString()
}

let eventos = [
  {
    id: 'mock-ev-1',
    titulo: 'Concierto de Gala de Fin de Ciclo',
    descripcion: 'Presentación de la orquesta sinfónica juvenil ante patrocinadores y familias.',
    categoria: 'concierto',
    fecha_inicio: enDias(12),
    fecha_fin: enDias(12, 21),
    ubicacion: 'Teatro Nacional',
    departamento_responsable: 'DIR',
    estado: 'pendiente',
    metadata: null,
    created_at: enDias(-3),
  },
  {
    id: 'mock-ev-2',
    titulo: 'Apertura de inscripciones nuevo ciclo',
    descripcion: 'Inicio de la temporada de inscripciones 2026-II. Se espera alta demanda.',
    categoria: 'inscripcion',
    fecha_inicio: enDias(3, 8),
    fecha_fin: enDias(20, 17),
    ubicacion: 'Sede central',
    departamento_responsable: 'ADM',
    estado: 'pendiente',
    metadata: null,
    created_at: enDias(-7),
  },
  {
    id: 'mock-ev-3',
    titulo: 'Pago de nómina mensual',
    descripcion: 'Procesar pago de nómina de maestros y personal administrativo.',
    categoria: 'pago',
    fecha_inicio: enDias(5, 9),
    fecha_fin: enDias(5, 10),
    ubicacion: '—',
    departamento_responsable: 'FIN',
    estado: 'pendiente',
    metadata: null,
    created_at: enDias(-2),
  },
  {
    id: 'mock-ev-4',
    titulo: 'Reunión con patrocinadores',
    descripcion: 'Presentación de resultados del trimestre a aliados estratégicos.',
    categoria: 'reunion',
    fecha_inicio: enDias(8, 10),
    fecha_fin: enDias(8, 12),
    ubicacion: 'Sala de juntas',
    departamento_responsable: 'DIR',
    estado: 'aceptado',
    metadata: { planificacion: { responsable: 'María G.', notas: 'Preparar presentación de resultados' } },
    created_at: enDias(-15),
  },
  {
    id: 'mock-ev-5',
    titulo: 'Auditoría interna de inventario',
    descripcion: 'Revisión anual de instrumentos y equipos.',
    categoria: 'auditoria',
    fecha_inicio: enDias(30, 8),
    fecha_fin: enDias(32, 17),
    ubicacion: 'Sede central',
    departamento_responsable: 'ADM',
    estado: 'aceptado',
    metadata: null,
    created_at: enDias(-10),
  },
  {
    id: 'mock-ev-6',
    titulo: 'Taller de mantenimiento de instrumentos',
    descripcion: 'Taller de limpieza y ajuste de instrumentos de cuerda y viento.',
    categoria: 'otro',
    fecha_inicio: enDias(15, 14),
    fecha_fin: enDias(15, 17),
    ubicacion: 'Salón de ensayos',
    departamento_responsable: 'TECNICO',
    estado: 'preprogramado',
    metadata: {
      planificacion: {
        responsable: 'Carlos M.',
        recursos: 'Kit de limpieza, herramientas de ajuste',
        notas: 'Coordinar con ACM para disponibilidad de instrumentos',
        fecha_tentativa: enDias(15, 14).slice(0, 10),
      },
    },
    created_at: enDias(-20),
  },
  {
    id: 'mock-ev-7',
    titulo: 'Corte de asistencia mensual',
    descripcion: 'Cierre de registros de asistencia del mes.',
    categoria: 'corte',
    fecha_inicio: enDias(25, 9),
    fecha_fin: enDias(25, 10),
    ubicacion: '—',
    departamento_responsable: 'ACM',
    estado: 'pendiente',
    metadata: null,
    created_at: enDias(-5),
  },
]

export async function getEventos(filtros = {}) {
  const desde = filtros.desde ? new Date(filtros.desde) : new Date()
  const dias = filtros.dias ?? 120
  const hasta = new Date(desde.getTime() + dias * 86400000)

  let res = eventos
    .map(clone)
    .filter((e) => {
      const f = new Date(e.fecha_inicio)
      return f >= desde && f <= hasta
    })

  if (filtros.categoria && filtros.categoria !== 'todas') {
    res = res.filter((e) => e.categoria === filtros.categoria)
  }
  if (filtros.estado && filtros.estado !== 'todos') {
    res = res.filter((e) => e.estado === filtros.estado)
  }
  if (filtros.departamento && filtros.departamento !== 'todos') {
    res = res.filter((e) => e.departamento_responsable === filtros.departamento)
  }

  res.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
  return delay(res)
}

export async function actualizarEstadoEvento(id, nuevoEstado) {
  const idx = eventos.findIndex((e) => e.id === id)
  if (idx === -1) throw new Error(`Evento ${id} no encontrado`)

  eventos[idx] = { ...eventos[idx], estado: nuevoEstado }
  return delay(clone(eventos[idx]))
}

export async function preprogramarEvento(id, datos) {
  const idx = eventos.findIndex((e) => e.id === id)
  if (idx === -1) throw new Error(`Evento ${id} no encontrado`)

  eventos[idx] = {
    ...eventos[idx],
    estado: 'preprogramado',
    metadata: {
      ...(eventos[idx].metadata || {}),
      planificacion: {
        responsable: datos.responsable || '',
        recursos: datos.recursos || '',
        notas: datos.notas || '',
        fecha_tentativa: datos.fecha_tentativa || null,
      },
    },
  }
  return delay(clone(eventos[idx]))
}

export async function getEventoById(id) {
  const e = eventos.find((ev) => ev.id === id)
  return delay(e ? clone(e) : null)
}
