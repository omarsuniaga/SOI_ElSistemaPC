const TOKEN_PATTERNS = {
  // Prioriza 'todos' (cierre exacto). Si no, permite palabras (nombres) pero es estricto con los límites.
  alumnos: /#(todos\b|[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+(?:de|la|las|los|del|y|el)\b)?(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*|[A-Za-zÁÉÍÓÚáéíóúÑñ]+)/g,
  contenido: /\[([^\]]+)\]/g,
  sugerencias: /\(([^)]+)\)/g,
  tareas: /\{([^}]+)\}/g,
  medidas: /\$([^\s$]+)/g,
  objetivos: />([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g,
  niveles: />NIVEL-(\d{1,2})/g,
  nodos: />NODO:([A-Z_]+)/g,
  capas: /:::CAPA:\s*([A-Z_]+)/g,
  calificacion: /(\d)\/(\d)/g,
  estados: /!(LOGRADO|EN_PROGRESO|INICIADO)/gi,
}

/**
 * Detecta si el texto está en modo DSL o lenguaje natural.
 * @param {string} text
 * @returns {'dsl' | 'natural'}
 */
export function detectInputMode(text) {
  if (!text || typeof text !== 'string' || !text.trim()) return 'dsl'
  const hasTokens = /[#\[\(\{\$>]/.test(text)
  return hasTokens ? 'dsl' : 'natural'
}

export const TOKEN_COLORS = {
  alumnos: '#0d6efd',
  contenido: '#198754',
  sugerencias: '#fd7e14',
  tareas: '#9333ea',
  medidas: '#6dd5ed',
  calificacion: '#dc3545',
  objetivos: '#6c757d',
  niveles: '#5856d6',
  nodos: '#af52de',
  capas: '#ff9500',
  estados: { LOGRADO: '#198754', EN_PROGRESO: '#0d6efd', INICIADO: '#6c757d' },
}

export const CAPA_MAP = {
  TECNICA: ['Escalas', 'Arpegios y patrones', 'Mano izquierda', 'Arco'],
  CORE: ['Sonido', 'Afinación'],
  REPERTORIO: ['Estudios técnicos', 'Repertorio / Obra-hito'],
}

function extractTokens(text, pattern) {
  if (!text) return []
  const results = []
  let match
  const regex = new RegExp(pattern.source, pattern.flags)
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      // Limpieza proactiva: si es un nombre (#alumno), cortamos en el primer caracter especial o token
      let cleaned = match[1].trim();
      if (pattern.source.includes('#')) {
        const parts = cleaned.split(/(?=\s[#\[\(\{\$>])/);
        cleaned = parts[0].trim();
      }
      results.push(cleaned)
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

function parseDSLSection(text) {
  return {
    alumnos: extractTokens(text, TOKEN_PATTERNS.alumnos),
    contenido: extractTokens(text, TOKEN_PATTERNS.contenido),
    sugerencias: extractTokens(text, TOKEN_PATTERNS.sugerencias),
    tareas: extractTokens(text, TOKEN_PATTERNS.tareas),
    medidas: extractTokens(text, TOKEN_PATTERNS.medidas),
    calificacion: extractCalificacion(text),
    objetivos: extractTokens(text, TOKEN_PATTERNS.objetivos),
    niveles: extractTokens(text, TOKEN_PATTERNS.niveles),
    nodos: extractTokens(text, TOKEN_PATTERNS.nodos),
    capas: extractTokens(text, TOKEN_PATTERNS.capas),
    estados: extractTokens(text, TOKEN_PATTERNS.estados).map(e => e.toUpperCase()),
  }
}

/**
 * Parsea el DSL organizándolo por capas si se detectan bloques :::CAPA
 */
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
      niveles: [],
      nodos: [],
      capas: [],
      estados: [],
      por_capas: {}
    }
  }

  // 1. Extraer bloques por capas
  const capasRaw = text.split(/:::CAPA:/);
  const por_capas = {};
  
  if (capasRaw.length > 1) {
    capasRaw.forEach(bloque => {
      if (!bloque.trim()) return;
      const lines = bloque.split('\n');
      const capaName = lines[0].trim().toUpperCase();
      const content = lines.slice(1).join('\n');
      if (capaName) {
        por_capas[capaName] = parseDSLSection(content);
      }
    });
  }

  return {
    ...parseDSLSection(text),
    por_capas
  }
}

// Alias for legacy support
export const parseDsl = parseDSL;

export function highlightDSL(text) {
  if (!text) return ''

  // 1. Escapar HTML base
  let result = escapeHtml(text)
  
  // 2. Mapa de placeholders para evitar colisiones
  const placeholders = []
  function pushPlaceholder(html) {
    const id = `__DSL_TOKEN_${placeholders.length}__`
    placeholders.push({ id, html })
    return id
  }

  // 3. Aplicar transformaciones usando placeholders
  
  // Capas
  result = result.replace(TOKEN_PATTERNS.capas, (_, capa) => {
    return pushPlaceholder(`<span class="dsl-token dsl-capa" style="background:${TOKEN_COLORS.capas}22; color:${TOKEN_COLORS.capas}; font-weight:800; padding:2px 6px; border-radius:4px">:::CAPA: ${capa}</span>`)
  })

  // Niveles
  result = result.replace(/&gt;NIVEL-(\d{1,2})/g, (_, nivel) => {
    return pushPlaceholder(`<span class="dsl-token dsl-nivel" style="color:${TOKEN_COLORS.niveles}; font-weight:700">&gt;NIVEL-${nivel}</span>`)
  })

  // Nodos
  result = result.replace(/&gt;NODO:([A-Z_]+)/g, (_, nodo) => {
    return pushPlaceholder(`<span class="dsl-token dsl-nodo" style="color:${TOKEN_COLORS.nodos}; font-weight:600">&gt;NODO:${nodo}</span>`)
  })

  // Objetivos
  result = result.replace(/&gt;([A-Z]{1,3}(?:-[A-Za-z]+)?-[0-9]+(?:\.[0-9]+)?)/g, (_, objetivo) => {
    return pushPlaceholder(`<span class="dsl-token dsl-objetivo" data-objetivo="${objetivo}">&gt;${objetivo}</span>`)
  })

  // Alumnos
  result = result.replace(TOKEN_PATTERNS.alumnos, (_, nombre) => {
    return pushPlaceholder(`<span class="dsl-token dsl-alumno" data-nombre="${nombre}">#${nombre}</span>`)
  })

  // Contenido
  result = result.replace(TOKEN_PATTERNS.contenido, (_, contenido) => {
    return pushPlaceholder(`<span class="dsl-token dsl-contenido" data-contenido="${contenido}">[${contenido}]</span>`)
  })

  // Sugerencias
  result = result.replace(TOKEN_PATTERNS.sugerencias, (_, sugerencia) => {
    return pushPlaceholder(`<span class="dsl-token dsl-sugerencia" data-sugerencia="${sugerencia}">(${sugerencia})</span>`)
  })

  // Tareas
  result = result.replace(TOKEN_PATTERNS.tareas, (_, tarea) => {
    return pushPlaceholder(`<span class="dsl-token dsl-tarea" data-tarea="${tarea}">{${tarea}}</span>`)
  })

  // Medidas
  result = result.replace(TOKEN_PATTERNS.medidas, (_, medida) => {
    return pushPlaceholder(`<span class="dsl-token dsl-medida" data-medida="${medida}">$${medida}</span>`)
  })

  // Estados de progreso
  result = result.replace(/!(LOGRADO|EN_PROGRESO|INICIADO)/gi, (_, estado) => {
    const estadoUp = estado.toUpperCase()
    const colorMap = { LOGRADO: '#198754', EN_PROGRESO: '#0d6efd', INICIADO: '#6c757d' }
    const color = colorMap[estadoUp] ?? '#6c757d'
    return pushPlaceholder(
      `<span class="dsl-token dsl-estado" style="color:${color};font-weight:700;background:${color}18;padding:1px 4px;border-radius:3px">!${estadoUp}</span>`
    )
  })

  // Calificación
  result = result.replace(TOKEN_PATTERNS.calificacion, (_, v, s) => {
    return pushPlaceholder(`<span class="dsl-token dsl-calificacion" data-valor="${v}" data-sobre="${s}">${v}/${s}</span>`)
  })

  // 4. Restaurar placeholders (en orden inverso para manejar posibles anidamientos si existieran)
  for (let i = placeholders.length - 1; i >= 0; i--) {
    result = result.replace(placeholders[i].id, placeholders[i].html)
  }

  return result
}

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
  if (parsed.calificacion) summary.push(`calificación: ${parsed.calificacion.valor}/${parsed.calificacion.sobre}`)
  if (parsed.estados && parsed.estados.length > 0) summary.push(`${parsed.estados.length} estado(s)`)
  if (parsed.objetivos.length > 0) summary.push(`${parsed.objetivos.length} objetivo(s)`)
  if (parsed.niveles.length > 0) summary.push(`${parsed.niveles.length} nivel(es)`)
  if (parsed.nodos.length > 0) summary.push(`${parsed.nodos.length} nodo(s)`)
  if (Object.keys(parsed.por_capas).length > 0) summary.push(`${Object.keys(parsed.por_capas).length} capa(s)`)

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
