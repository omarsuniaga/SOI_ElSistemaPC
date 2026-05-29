import postulantesData from '../../../assets/data/mocks/postulantes.json'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

let data = [...postulantesData]

function normalize(str) {
  return (str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function buscarPostulante(query) {
  await delay()
  const q = normalize(query)
  if (!q || q.length < 2) return []

  return data.filter((p) => {
    const name = normalize(p.nombre_completo)
    const phone1 = normalize(p.telefono_alumno)
    const phone2 = normalize(p.madre_tlf_whatsapp)
    const phone3 = normalize(p.padre_tlf_whatsapp)
    return name.includes(q) || phone1.includes(q) || phone2.includes(q) || phone3.includes(q)
  })
}

export async function obtenerPostulante(id) {
  await delay(100)
  return data.find((p) => p.id === id) ?? null
}

export async function sincronizarPostulantes() {
  await delay(500)
  return {
    status: 'success',
    total_rows: data.length,
    upserted: data.length,
    errors: 0,
    timestamp: new Date().toISOString(),
    _mock: true,
  }
}

export async function listarPostulantes() {
  await delay()
  return [...data]
}

export async function backfillDesdePostulantes(dryRun = false) {
  await delay(400)

  // Simulate matching: try to find postulantes by email or name for existing alumnos
  // In mock mode we only have postulantes data, so this simulates the result shape
  const matches = data
    .filter((p) => p.estado !== 'inscrito')
    .map((p) => ({
      alumno_id: 'mock-' + p.id,
      alumno_nombre: p.nombre_completo,
      postulante_id: p.id,
      postulante_nombre: p.nombre_completo,
      match_tipo: 'email',
      campos_llenados: 5,
      accion: dryRun ? 'preview' : 'updated',
    }))

  if (!dryRun) {
    // Simulate marking postulantes as inscritos
    data = data.map((p) =>
      matches.some((m) => m.postulante_id === p.id)
        ? { ...p, estado: 'inscrito', alumno_id: 'mock-' + p.id }
        : p,
    )
  }

  return {
    success: true,
    data: matches,
    dry_run: dryRun,
  }
}
