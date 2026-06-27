const LATENCIA = 200
const delay = (val) => new Promise((r) => setTimeout(() => r(val), LATENCIA))
const clone = (x) => JSON.parse(JSON.stringify(x))

let _seq = 100
let _seqCamp = 50

const instituciones = [
  { id: 'mock-ins-1', nombre: 'Colegio San Judas Tadeo', tipo: 'colegio', sector: 'educacion', contacto_nombre: 'María Santos', cargo: 'Directora', email: 'maria.santos@sjtadeo.edu.do', telefono: '8095552001', estado: 'contactado', notas: 'Interesados en concierto navideño' },
  { id: 'mock-ins-2', nombre: 'Fundación Ciencia y Arte', tipo: 'fundacion', sector: 'cultural', contacto_nombre: 'Carlos Monegro', cargo: 'Presidente', email: 'cmonegro@fca.org.do', telefono: '8295552002', estado: 'lead', notas: '' },
  { id: 'mock-ins-3', nombre: 'Ayuntamiento Punta Cana', tipo: 'institucion', sector: 'gobierno', contacto_nombre: 'Ana Veras', cargo: 'Directora de Cultura', email: 'averas@ayuntamientopc.gob.do', telefono: '8495552003', estado: 'aceptado', notas: 'Concierto pactado para agosto' },
  { id: 'mock-ins-4', nombre: 'Hotel Paradisus Palma Real', tipo: 'empresa', sector: 'hotelero', contacto_nombre: 'Roberto Hernández', cargo: 'Gerente de Eventos', email: 'rhernandez@paradisus.com', telefono: '8095552004', estado: 'en_negociacion', notas: 'Negociando fecha para temporada alta' },
  { id: 'mock-ins-5', nombre: 'Iglesia San José Obrero', tipo: 'iglesia', sector: 'religioso', contacto_nombre: 'Padre Luis', cargo: 'Párroco', email: 'padreluis@sjose.org', telefono: '8095552005', estado: 'lead', notas: '' },
]

const campanias = [
  {
    id: 'mock-camp-1', titulo: 'Temporada Navidad 2026', temporada: 'Navidad 2026',
    asunto: 'Conciertos navideños para su institución',
    cuerpo_html: '<h2>Estimados amigos</h2><p>Les invitamos a disfrutar de nuestros conciertos navideños...</p>',
    cuerpo_texto: 'Estimados amigos: Les invitamos a disfrutar de nuestros conciertos navideños...',
    estado: 'enviada', fecha_envio: '2026-06-20T10:00:00.000Z',
    enviados: 5, abiertos: 3, respondidos: 1, created_at: '2026-06-15T08:00:00.000Z',
  },
  {
    id: 'mock-camp-2', titulo: 'Oferta Conciertos Educativos', temporada: 'Verano 2026',
    asunto: 'Programas educativos musicales para su centro',
    cuerpo_html: '<h2>Estimado/a directivo/a</h2><p>Queremos presentarle nuestros programas educativos...</p>',
    cuerpo_texto: 'Estimado/a directivo/a: Queremos presentarle nuestros programas educativos...',
    estado: 'borrador', fecha_envio: null,
    enviados: 0, abiertos: 0, respondidos: 0, created_at: '2026-06-24T14:00:00.000Z',
  },
]

const destinatarios = [
  { id: 'mock-dest-1', campania_id: 'mock-camp-1', institucion_id: 'mock-ins-1', estado: 'enviado', fecha_envio: '2026-06-20T10:00:00.000Z' },
  { id: 'mock-dest-2', campania_id: 'mock-camp-1', institucion_id: 'mock-ins-2', estado: 'abierto', fecha_envio: '2026-06-20T10:00:00.000Z' },
  { id: 'mock-dest-3', campania_id: 'mock-camp-1', institucion_id: 'mock-ins-3', estado: 'respondido', fecha_envio: '2026-06-20T10:00:00.000Z', fecha_respuesta: '2026-06-22T15:30:00.000Z', respuesta_texto: 'Nos encantaría participar' },
  { id: 'mock-dest-4', campania_id: 'mock-camp-1', institucion_id: 'mock-ins-4', estado: 'enviado', fecha_envio: '2026-06-20T10:00:00.000Z' },
  { id: 'mock-dest-5', campania_id: 'mock-camp-1', institucion_id: 'mock-ins-5', estado: 'abierto', fecha_envio: '2026-06-20T10:00:00.000Z' },
]

export async function getInstituciones() {
  return delay(instituciones.map(clone))
}

export async function getInstitucion(id) {
  const ins = instituciones.find((i) => i.id === id)
  return delay(ins ? clone(ins) : null)
}

export async function guardarInstitucion(data) {
  const idx = instituciones.findIndex((i) => i.id === data.id)
  if (idx >= 0) {
    instituciones[idx] = { ...instituciones[idx], ...data, updated_at: new Date().toISOString() }
    return delay(clone(instituciones[idx]))
  }
  const nueva = { id: `mock-ins-${_seq++}`, estado: 'lead', ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  instituciones.push(nueva)
  return delay(clone(nueva))
}

export async function eliminarInstitucion(id) {
  const idx = instituciones.findIndex((i) => i.id === id)
  if (idx >= 0) instituciones.splice(idx, 1)
  return delay(true)
}

export async function getCampanias() {
  return delay(campanias.map(clone))
}

export async function getCampania(id) {
  const c = campanias.find((c) => c.id === id)
  return delay(c ? clone(c) : null)
}

export async function guardarCampania(data) {
  const idx = campanias.findIndex((c) => c.id === data.id)
  if (idx >= 0) {
    campanias[idx] = { ...campanias[idx], ...data, updated_at: new Date().toISOString() }
    return delay(clone(campanias[idx]))
  }
  const nueva = { id: `mock-camp-${_seqCamp++}`, estado: 'borrador', enviados: 0, abiertos: 0, respondidos: 0, ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  campanias.push(nueva)
  return delay(clone(nueva))
}

export async function eliminarCampania(id) {
  const idx = campanias.findIndex((c) => c.id === id)
  if (idx >= 0) {
    campanias.splice(idx, 1)
    for (let i = destinatarios.length - 1; i >= 0; i--) {
      if (destinatarios[i].campania_id === id) destinatarios.splice(i, 1)
    }
  }
  return delay(true)
}

export async function enviarCampania(campaniaId) {
  const camp = campanias.find((c) => c.id === campaniaId)
  if (!camp) return delay({ ok: false, error: 'Campaña no encontrada' })
  const dests = destinatarios.filter((d) => d.campania_id === campaniaId)
  const now = new Date().toISOString()
  camp.estado = 'enviada'
  camp.fecha_envio = now
  camp.enviados = dests.length
  for (const d of dests) {
    d.estado = 'enviado'
    d.fecha_envio = now
  }
  return delay({ ok: true, total: dests.length })
}

export async function getDestinatarios(campaniaId) {
  const dests = destinatarios.filter((d) => d.campania_id === campaniaId).map(clone)
  for (const d of dests) {
    d.institucion = instituciones.find((i) => i.id === d.institucion_id) || null
  }
  return delay(dests)
}

export async function registrarRespuesta(destinatarioId, respuestaTexto) {
  const dest = destinatarios.find((d) => d.id === destinatarioId)
  if (!dest) return delay(null)
  dest.estado = 'respondido'
  dest.fecha_respuesta = new Date().toISOString()
  dest.respuesta_texto = respuestaTexto
  const camp = campanias.find((c) => c.id === dest.campania_id)
  if (camp) camp.respondidos = (camp.respondidos || 0) + 1
  if (dest.institucion_id) {
    const ins = instituciones.find((i) => i.id === dest.institucion_id)
    if (ins) {
      ins.estado = 'en_negociacion'
      ins.ultima_gestion = new Date().toISOString()
    }
  }
  return delay(clone(dest))
}

export async function getProspeccionLog() {
  return delay([])
}
