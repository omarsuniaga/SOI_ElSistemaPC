const TOKEN_PATTERNS = {
  alumnos: /#([A-Za-zÁÉÍÓÚáéíóúÑñ]+(?:\s+[A-Za-zÁÉÍÓÚáéíóúÑñ]+)*)/g,
  contenido: /\[([^\]]+)\]/g,
  sugerencias: /\(([^)]+)\)/g,
  tareas: /\{([^}]+)\}/g,
  medidas: /\$([^\s$]+)/g,
  objetivos: />([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g,
  calificacion: /(\d)\/(\d)/g,
}

export const TOKEN_COLORS = {
  alumnos: '#0d6efd',
  contenido: '#198754',
  sugerencias: '#fd7e14',
  tareas: '#9333ea',
  medidas: '#6dd5ed',
  calificacion: '#dc3545',
  objetivos: '#6c757d',
}

export const TOKEN_LABELS = {
  alumnos: 'Alumno',
  contenido: 'Contenido',
  sugerencias: 'Sugerencia',
  tareas: 'Tarea',
  medidas: 'Medida',
  calificacion: 'Calificación',
  objetivos: 'Objetivo',
}

function extractTokens(text, pattern) {
  if (!text) return []
  const results = []
  let match
  const regex = new RegExp(pattern.source, pattern.flags)
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      results.push(match[1].trim())
    }
  }
  return results
}

function extractCalificacion(text) {
  if (!text) return null
  const match = text.match(/(\d)\/(\d)/)
  if (!match) return null

  const valor = parseInt(match[1], 10)
  const sobre = parseInt(match[2], 10)

  if (valor < 0 || valor > 5) return null
  if (sobre !== 5) return null

  return { valor, sobre }
}

export function parseDSL(text) {
  if (!text || typeof text !== 'string') {
    return {
      alumnos: [],
      contenido: [],
      sugerencias: [],
      tareas: [],
      medidas: [],
      calificacion: null,
      objetivos: [],
    }
  }

  return {
    alumnos: extractTokens(text, TOKEN_PATTERNS.alumnos),
    contenido: extractTokens(text, TOKEN_PATTERNS.contenido),
    sugerencias: extractTokens(text, TOKEN_PATTERNS.sugerencias),
    tareas: extractTokens(text, TOKEN_PATTERNS.tareas),
    medidas: extractTokens(text, TOKEN_PATTERNS.medidas),
    calificacion: extractCalificacion(text),
    objetivos: extractTokens(text, TOKEN_PATTERNS.objetivos),
  }
}

/**
 * Generate profile assertions from parsed DSL tokens.
 * Called by the extraction pipeline (edge function) for deterministic pre-fill.
 *
 * @param {Object} parsed — output of parseDSL()
 * @param {Object} alumnoMap — { alumnoNombre: alumnoId }
 * @param {Object} indicatorMap — { "VL-N2-12": "indicator-uuid", ... }
 * @param {string} obsId — observaciones_sesion.id
 * @returns {Array<{alumno_id, dimension, item, indicator_id?, madurez, confianza, estado, evidencia_texto, creado_por}>}
 */
export function generateProfileAssertions(parsed, alumnoMap = {}, indicatorMap = {}, obsId = null) {
  const assertions = []

  // Track unique combos to avoid duplicates (same alumno + dimension + item)
  const seen = new Set()

  function add(alumnoId, dimension, item, indicatorId, evidencia) {
    const key = `${alumnoId}|${dimension}|${item}`
    if (seen.has(key)) return
    seen.add(key)
    assertions.push({
      alumno_id: alumnoId,
      dimension,
      item,
      indicator_id: indicatorId || null,
      madurez: 'introducido',
      confianza: 1.0,
      estado: 'confirmado',
      evidencia_texto: evidencia || null,
      creado_por: 'dsl',
    })
  }

  for (const alumnoNombre of parsed.alumnos) {
    const alumnoId = alumnoMap[alumnoNombre]

    // Skip alumnos not in the session (shouldn't happen, but guard)
    if (!alumnoId) continue

    // Objectives: >VL-N2-12 → dimension='objetivo'
    for (const objCode of parsed.objetivos) {
      const cleanCode = objCode.replace(/^>/, '')
      const indicatorId = indicatorMap[cleanCode] || null
      add(alumnoId, 'objetivo', objCode, indicatorId, objCode)
    }

    // Content items: [texto] → dimension='escala' or 'tecnica' (context-dependent)
    for (const content of parsed.contenido) {
      add(alumnoId, 'escala', content, null, `[${content}]`)
    }

    // Medidas with scores: $medida 4/5 → hint at progress
    // (these don't create standalone assertions but can enrich existing ones)
  }

  return assertions
}

/**
 * Check if a parsed DSL text contains any profile-relevant tokens.
 * Used by the extraction pipeline to decide if LLM extraction is needed.
 */
export function hasProfileTokens(parsed) {
  return parsed.objetivos.length > 0 || parsed.contenido.length > 0 || parsed.alumnos.length > 0
}

// Alias for legacy support
export const parseDsl = parseDSL

export function highlightDSL(text) {
  if (!text) return ''

  let result = text

  result = result.replace(TOKEN_PATTERNS.calificacion, (_, v, s) => {
    return `<span class="dsl-token dsl-calificacion" data-valor="${v}" data-sobre="${s}">${v}/${s}</span>`
  })

  result = result.replace(TOKEN_PATTERNS.objetivos, (_, objetivo) => {
    return `<span class="dsl-token dsl-objetivo" data-objetivo="${objetivo}">__OBJ_START__${objetivo}__OBJ_END__</span>`
  })

  result = result.replace(TOKEN_PATTERNS.alumnos, (_, nombre) => {
    return `<span class="dsl-token dsl-alumno" data-nombre="${nombre}">#${nombre}</span>`
  })

  result = result.replace(TOKEN_PATTERNS.contenido, (_, contenido) => {
    return `<span class="dsl-token dsl-contenido" data-contenido="${contenido}">[${contenido}]</span>`
  })

  result = result.replace(TOKEN_PATTERNS.sugerencias, (_, sugerencia) => {
    return `<span class="dsl-token dsl-sugerencia" data-sugerencia="${sugerencia}">(${sugerencia})</span>`
  })

  result = result.replace(TOKEN_PATTERNS.tareas, (_, tarea) => {
    return `<span class="dsl-token dsl-tarea" data-tarea="${tarea}">{${tarea}}</span>`
  })

  result = result.replace(TOKEN_PATTERNS.medidas, (_, medida) => {
    return `<span class="dsl-token dsl-medida" data-medida="${medida}">$${medida}</span>`
  })

  result = escapeHtml(result)
  result = result.replace(/__OBJ_START__/g, '&gt;')
  result = result.replace(/__OBJ_END__/g, '')

  return result
}

// Alias for legacy support
export const highlightDsl = highlightDSL

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function getTokenSummary(parsed) {
  const summary = []

  if (parsed.alumnos.length > 0) summary.push(`${parsed.alumnos.length} alumno(s)`)
  if (parsed.contenido.length > 0) summary.push(`${parsed.contenido.length} contenido(s)`)
  if (parsed.sugerencias.length > 0) summary.push(`${parsed.sugerencias.length} sugerencia(s)`)
  if (parsed.tareas.length > 0) summary.push(`${parsed.tareas.length} tarea(s)`)
  if (parsed.medidas.length > 0) summary.push(`${parsed.medidas.length} medida(s)`)
  if (parsed.calificacion)
    summary.push(`calificación: ${parsed.calificacion.valor}/${parsed.calificacion.sobre}`)
  if (parsed.objetivos.length > 0) summary.push(`${parsed.objetivos.length} objetivo(s)`)

  return summary.length > 0 ? summary.join(', ') : 'Sin tokens'
}

export function validateDsl(text) {
  const errors = []
  const parsed = parseDSL(text)

  if (parsed.calificacion) {
    if (parsed.calificacion.valor < 0 || parsed.calificacion.valor > 5) {
      errors.push('La calificación debe estar entre 0 y 5')
    }
    if (parsed.calificacion.sobre !== 5) {
      errors.push('El denominador de la calificación debe ser 5')
    }
  } else if (text && /\d\/\d/.test(text)) {
    const match = text.match(/(\d)\/(\d)/)
    if (match) {
      const valor = parseInt(match[1], 10)
      if (valor < 0 || valor > 5) {
        errors.push('La calificación debe estar entre 0 y 5')
      } else {
        errors.push('El denominador de la calificación debe ser 5')
      }
    }
  }

  if (text && text.length > 10000) {
    errors.push('El texto excede el límite de 10KB')
  }

  return { valid: errors.length === 0, errors }
}
