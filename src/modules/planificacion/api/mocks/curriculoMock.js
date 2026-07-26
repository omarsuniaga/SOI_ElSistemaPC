// Mock dataset in memory representing curriculo tables
let dbCurriculos = [
  {
    id: 'curr_mock_1',
    instrumento: 'Violín',
    nivel: 'Nivel 1 — Iniciación',
    descripcion: 'Curriculo base para Violín Inicial',
    activo: true,
    created_at: new Date().toISOString()
  }
]

let dbPilares = [
  { id: 'pilar_mock_1', curriculo_id: 'curr_mock_1', nombre: 'Técnica de Arco', orden: 0 },
  { id: 'pilar_mock_2', curriculo_id: 'curr_mock_1', nombre: 'Postura y Afinación', orden: 1 }
]

let dbObjetivos = [
  { id: 'obj_mock_1', pilar_id: 'pilar_mock_1', descripcion: 'Agarre correcto del arco', orden: 0 },
  { id: 'obj_mock_2', pilar_id: 'pilar_mock_1', descripcion: 'Sonido continuo sin raspar', orden: 1 },
  { id: 'obj_mock_3', pilar_id: 'pilar_mock_2', descripcion: 'Colocación correcta del violín', orden: 0 }
]

export async function obtenerCurriculo(instrumento, nivel) {
  const c = dbCurriculos.find(
    curr => curr.activo &&
    (!instrumento || curr.instrumento === instrumento) &&
    (!nivel || curr.nivel === nivel)
  )
  if (!c) return null

  const pilares = dbPilares
    .filter(p => p.curriculo_id === c.id)
    .sort((a, b) => a.orden - b.orden)
    .map(p => {
      const objetivos = dbObjetivos
        .filter(o => o.pilar_id === p.id)
        .sort((a, b) => a.orden - b.orden)
      return { ...p, curriculo_objetivos: objetivos }
    })

  return { ...c, curriculo_pilares: pilares }
}

export async function listarCurriculos() {
  return dbCurriculos.map(c => {
    const pilares = dbPilares.filter(p => p.curriculo_id === c.id)
    const pilarIds = pilares.map(p => p.id)
    const objs = dbObjetivos.filter(o => pilarIds.includes(o.pilar_id))
    return {
      ...c,
      total_objetivos: objs.length
    }
  })
}

export async function crearCurriculo({ instrumento, nivel, descripcion }) {
  const newCurr = {
    id: `curr_mock_${Date.now()}`,
    instrumento,
    nivel,
    descripcion,
    activo: true,
    created_at: new Date().toISOString()
  }
  dbCurriculos.push(newCurr)
  return newCurr
}

export async function actualizarCurriculo(id, fields) {
  const idx = dbCurriculos.findIndex(c => c.id === id)
  if (idx < 0) throw new Error('Curriculo no encontrado')
  dbCurriculos[idx] = { ...dbCurriculos[idx], ...fields, updated_at: new Date().toISOString() }
  return dbCurriculos[idx]
}

export async function toggleActivoCurriculo(id, activo) {
  return actualizarCurriculo(id, { activo })
}

// ── Pillars ──────────────────────────────────────────────────────────────────

export async function crearPilar(curriculo_id, nombre, orden = 0) {
  const newPilar = {
    id: `pilar_mock_${Date.now()}`,
    curriculo_id,
    nombre,
    orden
  }
  dbPilares.push(newPilar)
  return newPilar
}

export async function actualizarPilar(id, fields) {
  const idx = dbPilares.findIndex(p => p.id === id)
  if (idx < 0) throw new Error('Pilar no encontrado')
  dbPilares[idx] = { ...dbPilares[idx], ...fields }
  return dbPilares[idx]
}

export async function eliminarPilar(id) {
  dbPilares = dbPilares.filter(p => p.id !== id)
}

// ── Objectives ───────────────────────────────────────────────────────────────

export async function crearObjetivo(pilar_id, descripcion, orden = 0) {
  const newObj = {
    id: `obj_mock_${Date.now()}`,
    pilar_id,
    descripcion,
    orden
  }
  dbObjetivos.push(newObj)
  return newObj
}

export async function actualizarObjetivo(id, fields) {
  const idx = dbObjetivos.findIndex(o => o.id === id)
  if (idx < 0) throw new Error('Objetivo no encontrado')
  dbObjetivos[idx] = { ...dbObjetivos[idx], ...fields }
  return dbObjetivos[idx]
}

export async function eliminarObjetivo(id) {
  dbObjetivos = dbObjetivos.filter(o => o.id !== id)
}

// ── Adopt AI Proposal ────────────────────────────────────────────────────────

export async function adoptarPropuesta({ instrumento, nivel, descripcion, pilares }) {
  if (!instrumento || instrumento.trim() === '') {
    throw new Error('El instrumento es obligatorio para crear el plan.')
  }
  if (!pilares || pilares.length === 0) {
    throw new Error('La propuesta debe tener al menos un pilar.')
  }

  const curriculo = await crearCurriculo({
    instrumento: instrumento.trim(),
    nivel: nivel?.trim() || '',
    descripcion: descripcion?.trim() || 'Plan generado por IA',
  })

  const allObjetivos = []

  for (let i = 0; i < pilares.length; i++) {
    const pilarData = pilares[i]
    const pilar = await crearPilar(curriculo.id, pilarData.nombre || `Pilar ${i + 1}`, i)

    const objetivos = pilarData.objetivos || []
    for (let j = 0; j < objetivos.length; j++) {
      const objetivo = await crearObjetivo(pilar.id, objetivos[j].descripcion || `Objetivo ${j + 1}`, j)
      allObjetivos.push({ id: objetivo.id, descripcion: objetivo.descripcion })
    }
  }

  return { curriculo, allObjetivos }
}
