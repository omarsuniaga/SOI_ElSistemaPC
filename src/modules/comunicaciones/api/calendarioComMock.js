/**
 * calendarioComMock.js — Eventos demo para la lente de calendario (portal COM).
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

const eventos = [
  { id: 'mock-ev-1', titulo: 'Concierto de Gala de Fin de Ciclo', descripcion: 'Presentación de la orquesta sinfónica juvenil.', categoria: 'concierto', fecha_inicio: enDias(12), fecha_fin: enDias(12, 21), ubicacion: 'Teatro Nacional', departamento_responsable: 'DIR', estado: 'programado' },
  { id: 'mock-ev-2', titulo: 'Apertura de inscripciones nuevo ciclo', descripcion: 'Inicio de la temporada de inscripciones 2026-II.', categoria: 'inscripcion', fecha_inicio: enDias(3, 8), fecha_fin: enDias(20, 17), ubicacion: 'Sede central', departamento_responsable: 'ADM', estado: 'programado' },
  { id: 'mock-ev-3', titulo: 'Ensayo general seccional de cuerdas', descripcion: 'Preparación para el concierto de gala.', categoria: 'ensayo', fecha_inicio: enDias(8, 15), fecha_fin: enDias(8, 18), ubicacion: 'Salón 3', departamento_responsable: 'ACM', estado: 'programado' },
  { id: 'mock-ev-4', titulo: 'Reunión con patrocinadores', descripcion: 'Presentación de resultados del trimestre a aliados.', categoria: 'patrocinio', fecha_inicio: enDias(5, 10), fecha_fin: enDias(5, 12), ubicacion: 'Sala de juntas', departamento_responsable: 'DIR', estado: 'programado' },
  { id: 'mock-ev-5', titulo: 'Corte de asistencia mensual', descripcion: 'Cierre de registros de asistencia del mes.', categoria: 'corte', fecha_inicio: enDias(25, 9), fecha_fin: enDias(25, 10), ubicacion: '—', departamento_responsable: 'ACM', estado: 'programado' },
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
  res.sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
  return delay(res)
}
