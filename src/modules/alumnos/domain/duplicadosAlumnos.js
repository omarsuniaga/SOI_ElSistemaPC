/**
 * Detección y fusión de alumnos duplicados.
 * Puro — sin I/O, sin DOM, sin librerías externas.
 *
 * Responsabilidades:
 *  1. Normalizar nombres (tokens, acentos, puntuación, equivalencias fonéticas en español).
 *  2. Calcular similitud entre dos alumnos (soft token overlap, fonética, scoring + niveles de certeza).
 *  3. Bloqueo e indexación multi-clave para emparejar candidatos sin omisiones.
 *  4. Construir la fusión de dos registros (completa vacíos, resuelve conflictos, integra clases).
 */

// ─── Normalización de nombres y fonética ─────────────────────────────────────

const DIACRITICS_MAP = {
  á: 'a', à: 'a', â: 'a', ä: 'a', ã: 'a', å: 'a',
  é: 'e', è: 'e', ê: 'e', ë: 'e',
  í: 'i', ì: 'i', î: 'i', ï: 'i',
  ó: 'o', ò: 'o', ô: 'o', ö: 'o', õ: 'o',
  ú: 'u', ù: 'u', û: 'u', ü: 'u',
  ñ: 'n', ç: 'c',
}

function removeDiacritics(str) {
  return String(str ?? '').replace(/[áàâäãåéèêëíìîïóòôöõúùûüñç]/gi, (ch) => DIACRITICS_MAP[ch.toLowerCase()] || ch)
}

/**
 * Normaliza una cadena: minúsculas, sin acentos ni puntuación, espacios colapsados.
 * @param {string} value
 * @returns {string}
 */
export function normalizeText(value) {
  return removeDiacritics(String(value ?? ''))
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Normaliza un token fonéticamente para el contexto en español (Spanish Phonetic Key).
 * Mapea variaciones habituales: 'mathias' -> 'matias', 'sofia'/'sophia' -> 'sofia',
 * 'v' -> 'b', 'ph' -> 'f', 'z/c' -> 's', 'k/qu/ck' -> 'c', 'w' -> 'u', 'y' vocal -> 'i', 'h' muda removida.
 * @param {string} token
 * @returns {string}
 */
export function spanishPhoneticKey(token) {
  if (!token) return ''
  let s = normalizeText(token)
  s = s.replace(/ph/g, 'f') // ph -> f (antes de h muda)
  s = s.replace(/th/g, 't') // th -> t
  s = s.replace(/ch/g, 'c') // ch -> c
  s = s.replace(/sh/g, 's') // sh -> s
  s = s.replace(/h/g, '')   // h muda
  s = s.replace(/v/g, 'b')   // b/v equivalentes
  s = s.replace(/c(?=[ei])/g, 's') // c ante e/i -> s
  s = s.replace(/z/g, 's')   // z -> s
  s = s.replace(/ck/g, 'c')  // ck -> c
  s = s.replace(/qu/g, 'c')  // qu -> c
  s = s.replace(/k/g, 'c')   // k -> c
  s = s.replace(/y/g, 'i')   // y -> i
  s = s.replace(/w/g, 'u')   // w -> u
  s = s.replace(/(.)\1+/g, '$1') // colapsar letras repetidas
  return s
}

/**
 * Distancia de Levenshtein entre dos cadenas cortas.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function levenshtein(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      )
    }
  }
  return matrix[a.length][b.length]
}

/**
 * Similitud entre dos tokens individuales [0..1].
 * Combina igualdad exacta, igualdad fonética y distancia de edición.
 * @param {string} t1
 * @param {string} t2
 * @returns {number}
 */
export function tokenSimilarity(t1, t2) {
  if (!t1 || !t2) return 0.0
  if (t1 === t2) return 1.0

  // Coincidencia fonética (ej: matias vs mathias -> 0.95)
  const p1 = spanishPhoneticKey(t1)
  const p2 = spanishPhoneticKey(t2)
  if (p1 && p2 && p1 === p2) return 0.95

  const maxLen = Math.max(t1.length, t2.length)
  if (maxLen === 0) return 1.0

  const dist = levenshtein(t1, t2)
  if (dist === 1 && maxLen >= 4) return 0.88
  if (dist === 2 && maxLen >= 7) return 0.75

  const ratio = 1 - (dist / maxLen)
  return ratio >= 0.75 ? ratio : 0
}

/**
 * Convierte un nombre en su conjunto de tokens únicos ordenados.
 * @param {string} nombre
 * @returns {string[]}
 */
export function tokensNombre(nombre) {
  if (!nombre) return []
  return [...new Set(normalizeText(nombre).split(' ').filter(Boolean))]
}

/**
 * Índice de Jaccard entre dos conjuntos de tokens: |A∩B| / |A∪B|.
 * 1 = idénticos, 0 = sin solape.
 */
export function jaccard(tokensA, tokensB) {
  if (!tokensA.length && !tokensB.length) return 1
  const setB = new Set(tokensB)
  const inter = tokensA.filter((t) => setB.has(t)).length
  const union = new Set([...tokensA, ...tokensB]).size
  return union === 0 ? 0 : inter / union
}

/**
 * Evalúa si el conjunto `a` es subconjunto (exacto o difuso) del conjunto `b`.
 * Sirve para "Luis Martinez" ⊂ "Luis Eduardo Martínez Obando" o "Matias Paredes" ⊂ "Mathias Alejandro Paredes Masuoka".
 */
export function esSubset(tokensA, tokensB) {
  if (!tokensA.length) return false
  return tokensA.every((ta) => tokensB.some((tb) => tokenSimilarity(ta, tb) >= 0.85))
}

/**
 * Compara dos nombres y devuelve un puntaje [0..1] usando soft token alignment,
 * similitud fonética y cobertura de subconjuntos.
 */
export function compareNombres(nombreA, nombreB) {
  const normA = normalizeText(nombreA)
  const normB = normalizeText(nombreB)
  if (!normA && !normB) return 1.0
  if (!normA || !normB) return 0.0
  if (normA === normB) return 1.0

  const a = tokensNombre(nombreA)
  const b = tokensNombre(nombreB)

  const maxLen = Math.max(a.length, b.length)
  const minLen = Math.min(a.length, b.length)
  if (maxLen === 0) return 1.0
  if (minLen === 0) return 0.0

  // 1. Soft Token Alignment (cada token busca su mejor contraparte en el otro)
  let sumBestA = 0
  for (const ta of a) {
    let best = 0
    for (const tb of b) {
      const sim = tokenSimilarity(ta, tb)
      if (sim > best) best = sim
    }
    sumBestA += best
  }

  let sumBestB = 0
  for (const tb of b) {
    let best = 0
    for (const ta of a) {
      const sim = tokenSimilarity(ta, tb)
      if (sim > best) best = sim
    }
    sumBestB += best
  }

  const coverageA = sumBestA / a.length
  const coverageB = sumBestB / b.length
  const minCoverage = a.length <= b.length ? coverageA : coverageB

  // Soft Jaccard
  const softJaccard = (sumBestA + sumBestB) / (a.length + b.length)

  // Subconjunto suave: ej. "Matias Paredes" en "Mathias Alejandro Paredes Masuoka"
  let subsetScore = 0
  if (minLen >= 2 && minCoverage >= 0.85) {
    subsetScore = minCoverage * (0.80 + 0.20 * (minLen / maxLen))
  } else if (minLen === 1 && minCoverage >= 0.95 && maxLen <= 2) {
    subsetScore = 0.70
  }

  return Math.max(softJaccard, subsetScore)
}

// ─── Identidad y Señales Cruzadas ───────────────────────────────────────────

function normalizeComparable(value) {
  return normalizeText(value)
}

function sameVal(a, b) {
  const x = normalizeComparable(a)
  const y = normalizeComparable(b)
  if (!x || !y) return null
  return x === y
}

/**
 * Normaliza un número de teléfono (solo dígitos).
 */
export function normalizePhoneDigits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

function getStudentPhones(obj) {
  if (!obj) return []
  const keys = [
    'representante_tlf',
    'familiar_telefono',
    'madre_tlf_whatsapp',
    'padre_tlf_whatsapp',
    'contacto_emergencia_telefono',
    'telefono',
  ]
  const phones = []
  for (const k of keys) {
    const raw = normalizePhoneDigits(obj[k])
    if (raw.length >= 7) phones.push(raw)
  }
  return [...new Set(phones)]
}

function matchPhones(a, b) {
  const phonesA = getStudentPhones(a)
  const phonesB = getStudentPhones(b)
  if (!phonesA.length || !phonesB.length) return false
  for (const pa of phonesA) {
    for (const pb of phonesB) {
      if (pa === pb || pa.endsWith(pb) || pb.endsWith(pa)) return true
    }
  }
  return false
}

function matchCedula(a, b) {
  const keys = ['representante_cedula', 'madre_cedula', 'padre_cedula']
  for (const k of keys) {
    const ca = normalizeText(a?.[k])
    const cb = normalizeText(b?.[k])
    if (ca && cb && ca === cb && ca.length >= 5) return true
  }
  return false
}

function samePersonName(nameA, nameB) {
  if (!nameA || !nameB) return false
  const score = compareNombres(nameA, nameB)
  return score >= 0.68
}

/**
 * Campos de identidad evaluados para la coincidencia cruzada.
 */
export const MATCH_KEYS = [
  { key: 'fecha_nacimiento', peso: 3.5, label: 'Fecha de nacimiento' },
  { key: 'padre_nombre',     peso: 3.0, label: 'Padre' },
  { key: 'madre_nombre',     peso: 3.0, label: 'Madre' },
  { key: 'representante_cedula', peso: 3.0, label: 'Cédula' },
  { key: 'telefono',         peso: 3.0, label: 'Teléfono de contacto' },
  { key: 'representante_nombre', peso: 2.0, label: 'Representante' },
  { key: 'instrumento_principal', peso: 1.0, label: 'Instrumento' },
]

/**
 * Devuelve los campos de identidad que coinciden entre dos alumnos.
 */
export function camposCompartidos(a, b) {
  const matches = []

  // 1. Fecha de nacimiento
  if (sameVal(a?.fecha_nacimiento, b?.fecha_nacimiento) === true) {
    matches.push({ key: 'fecha_nacimiento', label: 'Fecha de nacimiento', peso: 3.5 })
  }

  // 2. Padre
  if (samePersonName(a?.padre_nombre, b?.padre_nombre) || samePersonName(a?.padre_nombre, b?.representante_nombre) || samePersonName(a?.representante_nombre, b?.padre_nombre)) {
    matches.push({ key: 'padre_nombre', label: 'Padre / Representante', peso: 3.0 })
  }

  // 3. Madre
  if (samePersonName(a?.madre_nombre, b?.madre_nombre) || samePersonName(a?.madre_nombre, b?.representante_nombre) || samePersonName(a?.representante_nombre, b?.madre_nombre)) {
    matches.push({ key: 'madre_nombre', label: 'Madre / Representante', peso: 3.0 })
  }

  // 4. Cédula
  if (matchCedula(a, b)) {
    matches.push({ key: 'representante_cedula', label: 'Cédula familiar', peso: 3.0 })
  }

  // 5. Teléfono
  if (matchPhones(a, b)) {
    matches.push({ key: 'telefono', label: 'Teléfono', peso: 3.0 })
  }

  // 6. Instrumento
  if (sameVal(a?.instrumento_principal, b?.instrumento_principal) === true) {
    matches.push({ key: 'instrumento_principal', label: 'Instrumento', peso: 1.0 })
  }

  return matches
}

/**
 * Detecta si dos alumnos son hermanos (comparten apellidos/padres/contacto pero sus nombres de pila son distintos).
 * Los hermanos comparten familia pero NO son la misma persona y no deben sugerirse como duplicados.
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */
export function sonHermanos(a, b) {
  const tokensA = tokensNombre(a?.nombre_completo || a?.nombre)
  const tokensB = tokensNombre(b?.nombre_completo || b?.nombre)
  if (tokensA.length === 0 || tokensB.length === 0) return false

  // Nombres de pila (primeros 1-2 tokens)
  const givenNamesA = tokensA.length > 2 ? tokensA.slice(0, -2) : [tokensA[0]]
  const givenNamesB = tokensB.length > 2 ? tokensB.slice(0, -2) : [tokensB[0]]

  // Verificar si hay alguna coincidencia (exacta o fonética) entre los nombres de pila
  const sharesGivenName = givenNamesA.some(ga =>
    tokensB.some(tb => tokenSimilarity(ga, tb) >= 0.80)
  ) || givenNamesB.some(gb =>
    tokensA.some(ta => tokenSimilarity(gb, ta) >= 0.80)
  )

  // Si los nombres de pila NO tienen coincidencia (ej. "Jose Tomas" vs "Alondra")
  if (!sharesGivenName) {
    const genA = normalizeText(a?.genero)
    const genB = normalizeText(b?.genero)
    const distinctGender = genA && genB && ((genA.startsWith('m') && genB.startsWith('f')) || (genA.startsWith('f') && genB.startsWith('m')))

    const fA = String(a?.fecha_nacimiento || '').slice(0, 4)
    const fB = String(b?.fecha_nacimiento || '').slice(0, 4)
    const distinctYear = fA && fB && fA.length === 4 && fB.length === 4 && fA !== fB

    const sharesFamily = (
      samePersonName(a?.padre_nombre, b?.padre_nombre) ||
      samePersonName(a?.madre_nombre, b?.madre_nombre) ||
      matchPhones(a, b) ||
      (tokensA.length >= 2 && tokensB.length >= 2 && tokenSimilarity(tokensA[tokensA.length - 1], tokensB[tokensB.length - 1]) >= 0.85)
    )

    if (sharesFamily || distinctGender || distinctYear) {
      return true
    }
  }

  return false
}

/**
 * Calcula la similitud global entre dos alumnos.
 *
 * @param {object} a
 * @param {object} b
 * @returns {{
 *   puntaje: number,
 *   nombreScore: number,
 *   coincidencias: object,
 *   esSubsetNombre: boolean,
 *   esHermano?: boolean
 * }}
 */
export function similitudEntre(a, b) {
  // Regla Anti-Hermanos: si son hermanos (nombres de pila disjuntos con misma familia/contacto), NO son duplicados
  if (sonHermanos(a, b)) {
    return {
      puntaje: 0.0,
      nombreScore: 0.0,
      esHermano: true,
      coincidencias: { compartidos: 0, peso: 0 },
      esSubsetNombre: false,
    }
  }

  const nombreScore = compareNombres(a?.nombre_completo || a?.nombre, b?.nombre_completo || b?.nombre)
  const compartidos = camposCompartidos(a, b)
  const pesoCompartido = compartidos.reduce((s, c) => s + c.peso, 0)
  const identityRatio = Math.min(1.0, pesoCompartido / 5.5)

  const aTokens = tokensNombre(a?.nombre_completo || a?.nombre)
  const bTokens = tokensNombre(b?.nombre_completo || b?.nombre)
  const esSubsetNombre =
    (aTokens.length >= 2 && bTokens.length >= 2) &&
    (esSubset(aTokens, bTokens) || esSubset(bTokens, aTokens) || nombreScore >= 0.82)

  let nombreComp = nombreScore

  // Si los nombres tienen cierta similitud y la identidad familiar confirma que es la misma persona:
  // Ej: "Matias Paredes" vs "Mathias Alejandro Paredes Masuoka" con mismo padre -> puntaje ~0.94+
  if (nombreScore >= 0.40 && identityRatio >= 0.45) {
    nombreComp = Math.max(nombreComp, 0.85)
  } else if (esSubsetNombre && identityRatio >= 0.30) {
    nombreComp = Math.max(nombreComp, 0.88)
  }

  // Probabilistic combination (Noisy-OR)
  const puntaje = 1 - (1 - nombreComp) * (1 - identityRatio)

  return {
    puntaje: Number(puntaje.toFixed(4)),
    nombreScore: Number(nombreScore.toFixed(4)),
    coincidencias: {
      compartidos: compartidos.length,
      peso: pesoCompartido,
      ...Object.fromEntries(compartidos.map((c) => [c.key, true])),
    },
    esSubsetNombre,
  }
}

export const NIVELES_DUPLICADO = [
  { nivel: 'alta',  umbral: 0.80, etiqueta: 'Alta certeza' },
  { nivel: 'media', umbral: 0.65, etiqueta: 'Posible duplicado' },
]

/**
 * Niveles de certeza (alta, media) basados en el puntaje de similitud.
 */
export function nivelDuplicado(puntaje) {
  if (puntaje >= NIVELES_DUPLICADO[0].umbral) return NIVELES_DUPLICADO[0]
  if (puntaje >= NIVELES_DUPLICADO[1].umbral) return NIVELES_DUPLICADO[1]
  return null
}

// ─── Detección de posibles duplicados (Multi-Index Blocking) ──────────────────

/**
 * Dado un conjunto de alumnos, detecta todas las parejas candidatas a duplicados
 * usando indexación multi-clave (tokens exactos, tokens fonéticos, teléfonos, padres, fechas)
 * y ordenadas por puntaje DESC.
 *
 * @param {object[]} alumnos
 * @param {{ minPuntaje?: number }} opts
 * @returns {Array<{a:object, b:object, puntaje:number, nivel:string, nombreScore:number, coincidencias:object, esSubsetNombre:boolean}>}
 */
export function detectarPosiblesDuplicados(alumnos, { minPuntaje = 0.65 } = {}) {
  const list = alumnos || []
  const results = []
  const checkedPairs = new Set()

  // Multi-index maps
  const tokenMap = new Map()
  const phoneMap = new Map()
  const parentMap = new Map()
  const birthMap = new Map()

  const addIndex = (map, key, idx) => {
    if (!key) return
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(idx)
  }

  list.forEach((alumno, idx) => {
    const nameTokens = tokensNombre(alumno?.nombre_completo || alumno?.nombre)
    nameTokens.forEach((t) => {
      if (t.length >= 2) {
        addIndex(tokenMap, t, idx)
        addIndex(tokenMap, spanishPhoneticKey(t), idx)
      }
    })

    const phones = getStudentPhones(alumno)
    phones.forEach((p) => addIndex(phoneMap, p.slice(-7), idx))

    const parentTokens = [
      ...tokensNombre(alumno?.padre_nombre),
      ...tokensNombre(alumno?.madre_nombre),
      ...tokensNombre(alumno?.representante_nombre),
    ]
    parentTokens.forEach((pt) => {
      if (pt.length >= 3) {
        addIndex(parentMap, pt, idx)
        addIndex(parentMap, spanishPhoneticKey(pt), idx)
      }
    })

    if (alumno?.fecha_nacimiento) {
      addIndex(birthMap, String(alumno.fecha_nacimiento).slice(0, 10), idx)
    }
  })

  const addPair = (i, j) => {
    if (i === j) return
    const minI = Math.min(i, j)
    const maxI = Math.max(i, j)
    const key = `${minI}_${maxI}`
    if (!checkedPairs.has(key)) {
      checkedPairs.add(key)
      const a = list[minI]
      const b = list[maxI]
      const score = similitudEntre(a, b)
      const nivel = nivelDuplicado(score.puntaje)
      if (score.puntaje >= minPuntaje && nivel) {
        results.push({ a, b, ...score, nivel: nivel.nivel, nivelEtiqueta: nivel.etiqueta })
      }
    }
  }

  // Iterate over blocks
  const evaluateBucket = (map, maxBucketSize = 150) => {
    for (const bucket of map.values()) {
      if (bucket.length > 1 && bucket.length <= maxBucketSize) {
        for (let i = 0; i < bucket.length; i++) {
          for (let j = i + 1; j < bucket.length; j++) {
            addPair(bucket[i], bucket[j])
          }
        }
      }
    }
  }

  evaluateBucket(tokenMap, 150)
  evaluateBucket(phoneMap, 50)
  evaluateBucket(parentMap, 100)
  evaluateBucket(birthMap, 100)

  return results.sort((x, y) => y.puntaje - x.puntaje)
}

/**
 * Compara un alumno nuevo contra la lista de alumnos existentes.
 */
export function detectarCandidatosDe(nuevoAlumno, alumnos, { minPuntaje = 0.65 } = {}) {
  const list = alumnos || []
  const results = []

  for (const a of list) {
    if (a.id === nuevoAlumno?.id) continue
    const score = similitudEntre(a, nuevoAlumno)
    const nivel = nivelDuplicado(score.puntaje)
    if (score.puntaje >= minPuntaje && nivel) {
      results.push({ a, b: nuevoAlumno, ...score, nivel: nivel.nivel, nivelEtiqueta: nivel.etiqueta })
    }
  }

  return results.sort((x, y) => y.puntaje - x.puntaje)
}

// ─── Fusión de dos registros ────────────────────────────────────────────────

export const CAMPOS_FUSION = [
  // Personal
  { key: 'nombre_completo', label: 'Nombre completo', grupo: 'Personal' },
  { key: 'genero', label: 'Género', grupo: 'Personal' },
  { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', grupo: 'Personal' },
  { key: 'nacionalidad', label: 'Nacionalidad', grupo: 'Personal' },
  { key: 'municipio_residencia', label: 'Municipio', grupo: 'Personal' },
  { key: 'direccion', label: 'Dirección', grupo: 'Personal' },
  // Contacto y familia
  { key: 'correo_representante', label: 'Correo del representante', grupo: 'Contacto' },
  { key: 'representante_cedula', label: 'Cédula del representante', grupo: 'Contacto' },
  { key: 'representante_tlf', label: 'Teléfono del representante', grupo: 'Contacto' },
  { key: 'representante_nombre', label: 'Nombre del representante', grupo: 'Contacto' },
  { key: 'representante_parentesco', label: 'Parentesco del representante', grupo: 'Contacto' },
  { key: 'madre_nombre', label: 'Nombre de la madre', grupo: 'Familia' },
  { key: 'madre_cedula', label: 'Cédula de la madre', grupo: 'Familia' },
  { key: 'madre_tlf_whatsapp', label: 'WhatsApp de la madre', grupo: 'Familia' },
  { key: 'padre_nombre', label: 'Nombre del padre', grupo: 'Familia' },
  { key: 'padre_cedula', label: 'Cédula del padre', grupo: 'Familia' },
  { key: 'padre_tlf_whatsapp', label: 'WhatsApp del padre', grupo: 'Familia' },
  { key: 'familiar_nombre', label: 'Nombre del familiar', grupo: 'Familia' },
  { key: 'familiar_telefono', label: 'Teléfono del familiar', grupo: 'Familia' },
  { key: 'familiar_parentesco', label: 'Parentesco del familiar', grupo: 'Familia' },
  { key: 'contacto_emergencia_nombre', label: 'Contacto de emergencia', grupo: 'Familia' },
  { key: 'contacto_emergencia_telefono', label: 'Tel. emergencia', grupo: 'Familia' },
  { key: 'contacto_emergencia_parentesco', label: 'Parentesco emergencia', grupo: 'Familia' },
  // Musical
  { key: 'instrumento_principal', label: 'Instrumento principal', grupo: 'Musical' },
  { key: 'instrumento_interes', label: 'Instrumento de interés', grupo: 'Musical' },
  { key: 'nivel_lectura_musical', label: 'Nivel lectura musical', grupo: 'Musical' },
  // Escolar y salud
  { key: 'centro_estudios', label: 'Centro de estudios', grupo: 'Escolar' },
  { key: 'grado_nivel', label: 'Grado / Nivel', grupo: 'Escolar' },
  { key: 'alergias_descripcion', label: 'Alergias', grupo: 'Salud' },
  { key: 'condiciones_medicas', label: 'Condiciones médicas', grupo: 'Salud' },
  { key: 'medicamentos', label: 'Medicamentos', grupo: 'Salud' },
]

function isEmptyValue(v) {
  if (v === null || v === undefined) return true
  if (typeof v === 'string') return v.trim() === ''
  return false
}

const TIPO = {
  COMPLETA: 'completa',
  CONFLICTO: 'conflicto',
  COINCIDE: 'coincide',
  VACIA: 'vacia',
}

function sameMergeComparable(va, vb, key) {
  if (key === 'fecha_nacimiento') {
    return normalizeComparable(va) === normalizeComparable(vb)
  }
  if (
    key === 'representante_tlf' ||
    key === 'madre_tlf_whatsapp' ||
    key === 'padre_tlf_whatsapp' ||
    key === 'familiar_telefono' ||
    key === 'contacto_emergencia_telefono'
  ) {
    return normalizePhoneDigits(va) === normalizePhoneDigits(vb)
  }
  return normalizeComparable(va) === normalizeComparable(vb)
}

/**
 * Determina la contribución por campo entre dos alumnos.
 */
export function evaluarCampo(campo, principal, obsoleto) {
  const va = principal?.[campo.key]
  const vb = obsoleto?.[campo.key]
  const emptyA = isEmptyValue(va)
  const emptyB = isEmptyValue(vb)

  let tipo, valorFusionado

  // Tratamiento especial para el nombre completo si uno es subconjunto del otro
  if (campo.key === 'nombre_completo' && !emptyA && !emptyB) {
    const a = tokensNombre(va)
    const b = tokensNombre(vb)
    const subsetAinB = esSubset(a, b)
    const subsetBinA = esSubset(b, a)
    if (subsetAinB || subsetBinA) {
      const masLargo = subsetAinB && !subsetBinA ? vb : subsetBinA && !subsetAinB ? va : (String(va).length >= String(vb).length ? va : vb)
      return {
        key: campo.key,
        label: campo.label,
        grupo: campo.grupo,
        tipo: TIPO.COMPLETA,
        valorPrincipal: va ?? null,
        valorObsoleto: vb ?? null,
        valorFusionado: masLargo,
        puedeElegir: false,
      }
    }
  }

  if (emptyA && emptyB) {
    tipo = TIPO.VACIA
    valorFusionado = null
  } else if (emptyA || emptyB) {
    tipo = TIPO.COMPLETA
    valorFusionado = emptyA ? vb : va
  } else if (sameMergeComparable(va, vb, campo.key)) {
    tipo = TIPO.COINCIDE
    valorFusionado = va
  } else {
    tipo = TIPO.CONFLICTO
    valorFusionado = va // default: conserva principal
  }

  return {
    key: campo.key,
    label: campo.label,
    grupo: campo.grupo,
    tipo,
    valorPrincipal: va ?? null,
    valorObsoleto: vb ?? null,
    valorFusionado: valorFusionado ?? null,
    puedeElegir: tipo === TIPO.CONFLICTO,
  }
}

/**
 * Construye el análisis completo de fusión entre dos alumnos.
 */
export function construirFusion(principal, obsoleto) {
  const campos = CAMPOS_FUSION.map((campo) => evaluarCampo(campo, principal, obsoleto))

  const resultante = {}
  for (const c of campos) {
    if (c.tipo !== TIPO.VACIA) resultante[c.key] = c.valorFusionado
  }

  const completados = campos.filter((c) => c.tipo === TIPO.COMPLETA)
  const conflictos = campos.filter((c) => c.tipo === TIPO.CONFLICTO)

  const resumenCambios = campos
    .filter((c) => c.tipo !== TIPO.COINCIDE && c.tipo !== TIPO.VACIA)
    .map((c) => ({
      key: c.key,
      label: c.label,
      anterior: isEmptyValue(principal?.[c.key]) ? c.valorFusionado : principal?.[c.key],
      nuevo: c.valorFusionado,
      tipo: c.tipo,
    }))

  return {
    campos,
    resultante,
    completados: completados.length,
    conflictos: conflictos.length,
    completadosLabels: completados.map((c) => c.label),
    conflictosLabels: conflictos.map((c) => c.label),
    resumenCambios,
  }
}

/**
 * Devuelve cuál de dos alumnos es el más completo (mayor número de campos no vacíos).
 */
export function quienEsMasCompleto(a, b) {
  const count = (x) => CAMPOS_FUSION.filter((c) => !isEmptyValue(x?.[c.key])).length
  const ca = count(a)
  const cb = count(b)
  if (ca === cb) return a
  return ca > cb ? a : b
}

export const FUSION_TIPO_LABEL = {
  [TIPO.COMPLETA]: 'Se completa',
  [TIPO.CONFLICTO]: 'Conflicto',
  [TIPO.COINCIDE]: 'Coincide',
  [TIPO.VACIA]: 'Vacío',
}