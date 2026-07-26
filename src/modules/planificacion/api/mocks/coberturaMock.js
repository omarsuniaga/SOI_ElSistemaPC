let dbCobertura = []

/**
 * Simulates upserting coverage records.
 */
export async function upsertCobertura(registros) {
  registros.forEach((reg) => {
    const idx = dbCobertura.findIndex(
      (c) => c.alumno_id === reg.alumno_id && c.objetivo_id === reg.objetivo_id
    )
    const record = {
      id: idx >= 0 ? dbCobertura[idx].id : `cob_mock_${Date.now()}_${reg.alumno_id}`,
      fecha: new Date().toISOString().split('T')[0],
      ...reg,
    }

    if (idx >= 0) dbCobertura[idx] = record
    else dbCobertura.push(record)
  })
  return registros
}

/**
 * Gets student objectives coverage.
 */
export async function obtenerCoberturaPorAlumno(alumno_id) {
  const filtered = dbCobertura.filter((c) => c.alumno_id === alumno_id)
  return filtered.map((c) => ({
    ...c,
    curriculo_objetivos: {
      id: c.objetivo_id,
      descripcion: `Objetivo curricular simulado ${c.objetivo_id}`,
      pilar_id: 'pilar_mock_1',
      curriculo_pilares: {
        id: 'pilar_mock_1',
        nombre: 'Pilar Pedagógico General',
      },
    },
  }))
}

/**
 * Gets plan coverage.
 */
export async function obtenerCoberturaPorPlan(plan_id) {
  return dbCobertura
    .filter((c) => c.plan_id === plan_id)
    .map((c) => ({
      alumno_id: c.alumno_id,
      objetivo_id: c.objetivo_id,
      nivel: c.nivel,
      confirmado: c.confirmado,
    }))
}

/**
 * Confirms objectives coverage.
 */
export async function confirmarCobertura(ids) {
  dbCobertura.forEach((c) => {
    if (ids.includes(c.id)) {
      c.confirmado = true
    }
  })
}
