/**
 * Detección y fusión de alumnos duplicados.
 * Puro — sin I/O, sin DOM, sin librerías externas.
 *
 * Responsabilidades:
 *  1. Normalizar nombres (tokens, acentos, puntuación).
 *  2. Calcular similitud entre dos alumnos (scoring + niveles de certeza).
 *  3. Agrupar una lista de alumnos en posibles duplicados.
 *  4. Construir la fusión de dos registros (completa vacíos, resuelve conflictos).
 */

// ─── Normalización de nombres ───────────────────────────────────────────────

const DIACRITICS_MAP = {
  á: 'a', à: 'a', â: 'a', ä: 'a', ã: 'a', å: 'a',
  é: 'e', è: 'e', ê: 'e', ë: 'e',
  í: 'i', ì: 'i', î: 'i', ï: 'i',
  ó: 'o', ò: 'o', ô: 'o', ö: 'o', õ: 'o',
  ú: 'u', ù: 'u', û: 'u', ü: 'u',
  ñ: 'n', ç: 'c',
}

function removeDiacritics(str) {
  return str.replace(/[áàâäãåéèêëíìîïóòôöõúùûüñç]/g, ch => DIACRITICS_MAP[ch] || ch)
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
 * Convierte un nombre en su conjunto de tokens únicos.
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
  const inter = tokensA.filter(t => setB.has(t)).length
  const union = new Set([...tokensA, ...tokensB]).size
  return union === 0 ? 0 : inter / union
}

/**
 * Evalúa si el conjunto `a` es subconjunto del conjunto `b` (a ⊆ b).
 * Sirve para "Luis Martinez" ⊂ "Luis Eduardo Martínez Obando".
 */
export function esSubset(tokensA, tokensB) {
  if (!tokensA.length) return false
  const setB = new Set(tokensB)
  return tokensA.every(t => setB.has(t))
}

/**
 * Compara dos nombres y devuelve un puntaje [0..1].
 * Toma el máximo entre Jaccard y la "inclusión" (cuando un nombre es
 * subconjunto del otro y representa una porción razonable del más largo).
 */
export function compareNombres(nombreA, nombreB) {
  const a = tokensNombre(nombreA)
  const b = tokensNombre(nombreB)

  const maxLen = Math.max(a.length, b.length)
  const minLen = Math.min(a.length, b.length)
  if (maxLen === 0) return 1

  const jac = jaccard(a, b)
  let inclusion = 0
  const subsetAinB = esSubset(a, b)
  const subsetBinA = esSubset(b, a)
  if (subsetAinB || subsetBinA) {
    // La fracción de tokens comunes sobre el nombre más largo. Penaliza un
    // "Luis" ⊂ "Luis Eduardo Martínez Obando" (solo 1/3) a favor de una
    // proporción más informativa.
    inclusion = minLen / maxLen
  }

  return Math.max(jac, inclusion)
}

// ─── Similitud entre dos alumnos ────────────────────────────────────────────

function normalizeComparable(value) {
  return normalizeText(value)
}

function sameVal(a, b) {
  const x = normalizeComparable(a)
  const y = normalizeComparable(b)
  if (!x || !y) return null // no se puede comparar si alguno está vacío
  return x === y
}

/**
 * Campos usados para el matcheo por identidad familiar/musical.
 */
const MATCH_KEYS = [
  { key: 'fecha_nacimiento', peso: 3, label: 'Fecha de nacimiento' },
  { key: 'madre_nombre',     peso: 2, label: 'Madre' },
  { key: 'padre_nombre',     peso: 2, label: 'Padre' },
  { key: 'representante_cedula', peso: 2, label: 'Cédula del representante' },
  { key: 'instrumento_principal', peso: 1, label: 'Instrumento' },
]

/**
 * Devuelve los campos de identidad que coinciden entre dos alumnos (no vacíos).
 */
export function camposCompartidos(a, b) {
  return MATCH_KEYS
    .map(m => {
      const v = sameVal(a?.[m.key], b?.[m.key])
      return v === true ? { key: m.key, label: m.label, peso: m.peso } : null
    })
    .filter(Boolean)
}

const PESO_MATCH_MAX = MATCH_KEYS.reduce((s, m) => s + m.peso, 0)

/**
 * Calcula la similitud entre dos alumnos.
 *
 * @returns {{
 *   puntaje: number,            // 0..1 global
 *   nombreScore: number,        // 0..1
 *   coincidencias: {compartidos: number, peso: number, [key]: true},
 *   esSubsetNombre: boolean
 * }}
 */
export function similitudEntre(a, b) {
  const nombreScore = compareNombres(a?.nombre_completo, b?.nombre_completo)
  const compartidos = camposCompartidos(a, b)
  const pesoCompartido = compartidos.reduce((s, c) => s + c.peso, 0)
  const identityRatio = pesoCompartido / PESO_MATCH_MAX

  const esSubsetNombre =
    esSubset(tokensNombre(a?.nombre_completo), tokensNombre(b?.nombre_completo)) ||
    esSubset(tokensNombre(b?.nombre_completo), tokensNombre(a?.nombre_completo))

  // El nombre se refuerza cuando un registro es subconjunto del otro Y la
  // identidad (fecha/padres/instrumento) confirma que es la misma persona.
  // Ej: "Luis Martinez" ⊂ "Luis Eduardo Martínez Obando" con misma fecha,
  // madre e instrumento → se eleva a ~0.85+.
  let nombreComp = nombreScore
  if (esSubsetNombre && identityRatio >= 0.5) {
    nombreComp = Math.max(nombreComp, 0.7)
  }

  // Combinación "noisy-or" (probabilística): la pareja es duplicado si el
  // nombre o la identidad lo confirman; cuando coinciden ambos, se dispara.
  // Devuelve 1 para registros idénticos.
  const puntaje = 1 - (1 - nombreComp) * (1 - identityRatio)

  return {
    puntaje,
    nombreScore,
    coincidencias: {
      compartidos: compartidos.length,
      peso: pesoCompartido,
      ...Object.fromEntries(compartidos.map(c => [c.key, true])),
    },
    esSubsetNombre,
  }
}

const NIVELES_DUPLICADO = [
  { nivel: 'alta',     umbral: 0.82,   etiqueta: 'Alta certeza' },
  { nivel: 'media',    umbral: 0.68,   etiqueta: 'Posible duplicado' },
]

/**
 * Niveles de certeza (alto, medio) basados en el puntaje de similitud.
 */
export function nivelDuplicado(puntaje) {
  if (puntaje >= NIVELES_DUPLICADO[0].umbral) return NIVELES_DUPLICADO[0]
  if (puntaje >= NIVELES_DUPLICADO[1].umbral) return NIVELES_DUPLICADO[1]
  return null
}

/**
 * Normaliza un número de teléfono (solo dígitos) si se provee.
 */
export function normalizePhoneDigits(value) {
  return String(value ?? '').replace(/\D/g, '')
}

// ─── Detección de posibles duplicados ───────────────────────────────────────

/**
 * Dado un conjunto de alumnos, devuelve todas las parejas candidatas a ser
 * duplicados, ordenadas por puntaje DESC.
 *
 * Comparación O(n²) con pre-filtro barato: se compara solo cuando los nombres
 * comparten al menos el primer token, para no hacer el scoring completo entre
 * alumnos con nombres totalmente disímiles.
 *
 * @param {object[]} alumnos
 * @param {{ minPuntaje?: number }} opts
 * @returns {Array<{a:object, b:object, puntaje:number, nivel:string, nombreScore:number, coincidencias:object, esSubsetNombre:boolean}>}
 */
export function detectarPosiblesDuplicados(alumnos, { minPuntaje = 0.68 } = {}) {
  const list = alumnos || []
  const results = []

  for (let i = 0; i < list.length; i++) {
    const a = list[i]
    const primerTokenA = tokensNombre(a?.nombre_completo)?.[0]
    if (!primerTokenA) continue

    for (let j = i + 1; j < list.length; j++) {
      const b = list[j]
      if (!tokensNombre(b?.nombre_completo).includes(primerTokenA)) continue

      const score = similitudEntre(a, b)
      const nivel = nivelDuplicado(score.puntaje)
      if (score.puntaje >= minPuntaje && nivel) {
        results.push({ a, b, ...score, nivel: nivel.nivel, nivelEtiqueta: nivel.etiqueta })
      }
    }
  }

  return results.sort((x, y) => y.puntaje - x.puntaje)
}

/**
 * Devuelve las parejas candidatas de una lista, ordenadas por puntaje DESC.
 * Igual que `detectarPosiblesDuplicados` pero en forma de utilidad exportada
 * para comparar un alumno nuevo contra los existentes.
 */
export function detectarCandidatosDe(nuevoAlumno, alumnos, { minPuntaje = 0.68 } = {}) {
  const list = alumnos || []
  const results = []
  for (const a of list) {
    if (a.id === nuevoAlumno?.id) continue
    if (!tokensNombre(a?.nombre_completo).some(t => tokensNombre(nuevoAlumno?.nombre_completo).includes(t))) continue
    const score = similitudEntre(a, nuevoAlumno)
    const nivel = nivelDuplicado(score.puntaje)
    if (score.puntaje >= minPuntaje && nivel) {
      results.push({ a, b: nuevoAlumno, ...score, nivel: nivel.nivel, nivelEtiqueta: nivel.etiqueta })
    }
  }
  return results.sort((x, y) => y.puntaje - x.puntaje)
}

// ─── Fusión de dos registros ────────────────────────────────────────────────

/**
 * Campos considerados para la fusión, incluyendo etiqueta y grupo.
 * Se excluyen los campos de identidad (id) y de relación (clases, familia_id).
 */
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

/**
 * Tipo de celda para la previsualización de fusión.
 */
const TIPO = {
  COMPLETA: 'completa',   // solo un registro tiene valor → se adopta
  CONFLICTO: 'conflicto', // ambos tienen valor DISTINTO → elige el usuario
  COINCIDE: 'coincide',   // ambos con el MISMO valor → sin conflicto
  VACIA: 'vacia',         // ninguno tiene valor
}

/**
 * Normaliza un valor para comparación de coincidencia (fechas y teléfonos).
 */
function sameMergeComparable(va, vb, key) {
  if (key === 'fecha_nacimiento') {
    return normalizeComparable(va) === normalizeComparable(vb)
  }
  if (key === 'representante_tlf' || key === 'madre_tlf_whatsapp' || key === 'padre_tlf_whatsapp' || key === 'familiar_telefono' || key === 'contacto_emergencia_telefono') {
    return normalizePhoneDigits(va) === normalizePhoneDigits(vb)
  }
  return normalizeComparable(va) === normalizeComparable(vb)
}

/**
 * Determina la contribución por campo entre dos alumnos hacia un registro
 * único. `principal` gana en empate.
 *
 * @returns {{
 *   key, label, grupo, tipo,
 *   valorPrincipal, valorObsoleto, valorFusionado,
 *   puedeElegir: boolean
 * }}
 */
export function evaluarCampo(campo, principal, obsoleto) {
  const va = principal?.[campo.key]
  const vb = obsoleto?.[campo.key]
  const emptyA = isEmptyValue(va)
  const emptyB = isEmptyValue(vb)

  let tipo, valorFusionado

  // El nombre completo se trata especialmente: si uno de los dos registros
  // es subconjunto del otro (ej. "Luis Martinez" ⊂ "Luis Eduardo Martínez
  // Obando"), se adopta el más largo sin pedir confirmación.
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
    valorFusionado = va // default: gana principal
  }

  return {
    key: campo.key,
    label: campo.label,
    grupo: campo.grupo,
    tipo,
    valorPrincipal: va ?? null,
    valorObsoleto: vb ?? null,
    valorFusionado: valorFusionado ?? null,
    // Solo se pide decisión al usuario cuando hay conflicto real.
    puedeElegir: tipo === TIPO.CONFLICTO,
  }
}

/**
 * Construye el análisis completo de fusión entre dos alumnos.
 * `principal` es el registro que se conserva (por defecto el más completo).
 *
 * @returns {{
 *   campos: Array,               // por cada campo de CAMPOS_FUSION
 *   resultante: object,          // las claves resultantes (sin null)
 *   completados: number,
 *   conflictos: number,
 *   completadosLabels: string[],
 *   conflictosLabels: string[],
 *   resumenCambios: Array<{key,label,anterior,nuevo}>
 * }}
 */
export function construirFusion(principal, obsoleto) {
  const campos = CAMPOS_FUSION.map(campo => evaluarCampo(campo, principal, obsoleto))

  const resultante = {}
  for (const c of campos) {
    if (c.tipo !== TIPO.VACIA) resultante[c.key] = c.valorFusionado
  }

  const completados = campos.filter(c => c.tipo === TIPO.COMPLETA)
  const conflictos = campos.filter(c => c.tipo === TIPO.CONFLICTO)

  const resumenCambios = campos
    .filter(c => c.tipo !== TIPO.COINCIDE && c.tipo !== TIPO.VACIA)
    .map(c => ({
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
    completadosLabels: completados.map(c => c.label),
    conflictosLabels: conflictos.map(c => c.label),
    resumenCambios,
  }
}

/**
 * Devuelve cuál de dos alumnos es el más completo (mayor número de
 * CAMPOS_FUSION no vacíos). Sirve para elegir el candidato a "principal".
 */
export function quienEsMasCompleto(a, b) {
  const count = (x) => CAMPOS_FUSION.filter(c => !isEmptyValue(x?.[c.key])).length
  const ca = count(a)
  const cb = count(b)
  if (ca === cb) return a // empate → se conserva el primero
  return ca > cb ? a : b
}

export const FUSION_TIPO_LABEL = {
  [TIPO.COMPLETA]: 'Se completa',
  [TIPO.CONFLICTO]: 'Conflicto',
  [TIPO.COINCIDE]: 'Coincide',
  [TIPO.VACIA]: 'Vacío',
}