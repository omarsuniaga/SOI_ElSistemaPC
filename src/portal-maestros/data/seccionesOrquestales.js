/**
 * Section Registry — Mapa de secciones orquestales a instrumentos.
 *
 * Proporciona funciones para:
 *   - Normalizar nombres de instrumentos (NFD, lowercase, sin plural)
 *   - Resolver alumnos por sección orquestal
 *   - Expandir items de Groq con referencias a secciones
 *   - Construir contexto de secciones para prompts de IA
 *
 * Es una capa de datos pura: zero dependencies, zero side effects.
 */

// ---------------------------------------------------------------------------
// Mapa estático: sección → lista de instrumentos
// ---------------------------------------------------------------------------

const SECCION_MAP = {
  cuerdas: ['violín', 'viola', 'violonchelo', 'violoncello', 'contrabajo'],
  violines: ['violín'],
  violas: ['viola'],
  cellos: ['violonchelo', 'violoncello'],
  contrabajos: ['contrabajo'],
  maderas: ['flauta', 'oboe', 'clarinete'],
  vientos_madera: ['flauta', 'oboe', 'clarinete'],
  flautas: ['flauta'],
  oboes: ['oboe'],
  clarinetes: ['clarinete'],
  tutti: [],
  general: [],
  individual: [],
}

// ---------------------------------------------------------------------------
// Instrument normalization
// ---------------------------------------------------------------------------

/**
 * Normaliza un nombre de instrumento para matching:
 *   - lowercase
 *   - NFD decomposition + strip combining diacritical marks (accents)
 *   - Remove trailing plural ('es' → '' , 's' → '')
 *   - Trim whitespace
 *
 * @param {string|null|undefined} instr
 * @returns {string} Normalized instrument name
 */
function normalizarInstrumento(instr) {
  if (!instr || typeof instr !== 'string') return ''

  return instr
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining marks (accents)
    .split(/\s+/)
    .map((word) => {
      // Remove Spanish plural suffixes
      if (word.endsWith('es') && word.length > 4) {
        return word.slice(0, -2)
      }
      if (word.endsWith('s') && !word.endsWith('es') && word.length > 3) {
        return word.slice(0, -1)
      }
      return word
    })
    .join(' ')
}

// ---------------------------------------------------------------------------
// Student resolution by section
// ---------------------------------------------------------------------------

/**
 * Resuelve los alumnos presentes que pertenecen a una sección orquestal.
 *
 * - "tutti" / "general" → devuelve todos los presentes
 * - "individual" → devuelve []
 * - Sección no encontrada → console.warn + []
 *
 * Matching: normaliza el instrumento del alumno y verifica si incluye
 * (includes) alguno de los instrumentos de la sección.
 *
 * @param {string} seccion - Clave de sección en SECCION_MAP
 * @param {Array<{id, nombre_completo, instrumento_principal}>} presentes
 * @returns {Array<{id, nombre_completo, instrumento_principal}>}
 */
function getAlumnosBySeccion(seccion, presentes = []) {
  const instrs = SECCION_MAP[seccion]

  if (!instrs) {
    console.warn(`[seccionesOrquestales] Sección "${seccion}" no encontrada en el mapa`)
    return []
  }

  // Tutti / general → todos los presentes
  if (seccion === 'tutti' || seccion === 'general') {
    return presentes.map(normalizarAlumno)
  }

  // Individual → sin expansión
  if (seccion === 'individual') return []

  // Sección con instrumentos → filtrar por match
  const normalizedSectionInstrs = instrs.map(normalizarInstrumento)

  return presentes
    .filter((a) => {
      const instr = normalizarInstrumento(a.instrumento_principal || a.instrumento || '')
      return normalizedSectionInstrs.some((si) => instr.includes(si))
    })
    .map(normalizarAlumno)
}

/**
 * Normaliza un alumno a la estructura canónica {id, nombre_completo, instrumento_principal}.
 */
function normalizarAlumno(a) {
  return {
    id: a.id,
    nombre_completo: a.nombre_completo || a.nombre || '',
    instrumento_principal: a.instrumento_principal || a.instrumento || '',
  }
}

// ---------------------------------------------------------------------------
// Item expansion
// ---------------------------------------------------------------------------

/**
 * Expande items de Groq que tienen referencias a secciones orquestales.
 *
 * Para cada item donde `seccion` != 'individual' y `alumnos` esté vacío:
 *   - Si tiene sección reconocida en el mapa → expandir alumnos desde
 *     getAlumnosBySeccion
 *   - Si ya tiene alumnos → dejarlo como está
 * Items con es_colectivo=true NO se expanden (son verdaderamente colectivos).
 *
 * @param {Array} items - Items del JSON de Groq
 * @param {Array} presentes - Alumnos presentes [{id, nombre_completo, instrumento_principal}]
 * @returns {Array} Items transformados con alumnos expandidos
 */
function expandSeccionItems(items, presentes = []) {
  return items.map((item) => {
    // Individual → no expandir
    if (item.seccion === 'individual') return item

    // Explícitamente colectivo → no expandir
    if (item.es_colectivo === true) return item

    // Ya tiene alumnos resueltos → no expandir
    if (item.alumnos && item.alumnos.length > 0) return item

    // Solo expandir si la sección existe en el mapa
    const seccion = item.seccion || 'general'
    if (!(seccion in SECCION_MAP)) return item

    // Expandir! Usar nombre_completo (string) para compatibilidad con _buildDSL
    const alumnos = getAlumnosBySeccion(seccion, presentes).map((a) => a.nombre_completo)
    return { ...item, alumnos }
  })
}

// ---------------------------------------------------------------------------
// Section context builder (for AI prompts)
// ---------------------------------------------------------------------------

/**
 * Construye un string formateado con las secciones orquestales y los
 * alumnos presentes en cada una, para injectar en prompts de IA.
 *
 * Formato:
 *   SECCIONES:
 *   - violines (Violín): Ana García
 *   - maderas (Flauta, Oboe, Clarinete): Juan Pérez, Sofía Martínez
 *   - cuerdas (Violín, Viola, Violonchelo, Contrabajo): Ana García, ...
 *
 * Ignora secciones sin alumnos presentes.
 *
 * @param {Array} presentes - Alumnos presentes
 * @returns {string} Contexto formateado
 */
function buildSeccionContext(presentes = []) {
  const lines = ['SECCIONES:']

  for (const [seccion, instrs] of Object.entries(SECCION_MAP)) {
    const alumnos = getAlumnosBySeccion(seccion, presentes)
    if (alumnos.length === 0) continue

    const instrLabel = instrs.length > 0 ? instrs.join(', ') : seccion
    const names = alumnos.map((a) => a.nombre_completo).join(', ')

    lines.push(`- ${seccion} (${instrLabel}): ${names}`)
  }

  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export {
  SECCION_MAP,
  normalizarInstrumento,
  getAlumnosBySeccion,
  expandSeccionItems,
  buildSeccionContext,
}
