/**
 * googleFormApi — fetches the public Google Sheet (Form responses) as CSV
 * and provides search + field mapping to the wizard draft shape.
 *
 * The sheet is published publicly; no API key required.
 */

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSllLwP-2-O1yFvjHVy-rpUP6mY469R5XtMQxr0o9DX446jfIdAZuz-Ppxqaofn0vApf8FrPT8KJ7P7/pub?gid=1036949263&single=true&output=csv'

// Simple in-memory cache so we only fetch once per session
let _cache = null

function parseCSV(text) {
  const lines = text.split('\n')
  if (lines.length < 2) return []

  const headers = splitCSVRow(lines[0])
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const values = splitCSVRow(line)
    const row = {}
    headers.forEach((h, idx) => { row[h.trim()] = (values[idx] ?? '').trim() })
    rows.push(row)
  }

  return rows
}

// Handles quoted fields with commas inside
function splitCSVRow(line) {
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function normalize(str) {
  return (str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseDate(str) {
  if (!str) return ''
  // DD/MM/YYYY → YYYY-MM-DD
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!match) return ''
  const [, d, m, y] = match
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

function normalizeYesNo(str) {
  const s = normalize(str)
  if (s.startsWith('si') || s.startsWith('sí') || s === 'hare lo posible' || s === 'haré lo posible') return true
  if (s.startsWith('no')) return false
  return null
}

function mapRepresentante(str) {
  const s = normalize(str)
  // check ambos first — "Ambos (Padre y Madre)" contains both "madre" and "padre"
  if (s.includes('ambos') || s.includes('ambas')) return 'ambos'
  if (s.includes('madre')) return 'madre'
  if (s.includes('padre')) return 'padre'
  return str?.trim() ?? ''
}

/**
 * Map a raw CSV row to the wizard draft shape.
 */
export function mapRowToDraft(row) {
  return {
    nombre_completo: row['Nombre del Alumno'] ?? '',
    fecha_nacimiento: parseDate(row['Fecha de Nacimiento del Alumno']),
    nacionalidad: row['Nacionalidad'] ?? '',
    sector_calle_numero: row['Dirección completa del alumno'] ?? '',
    madre_nombre: row['¿Cuál es el nombre completo de la madre?'] ?? '',
    padre_nombre: row['¿Cuál es el nombre completo del padre?'] ?? '',
    // "Numero telefónico de ambos padres" goes to madre; "Telefono opcional" to padre
    madre_tlf_whatsapp: row['¿Numero telefónico de ambos padres?'] ?? '',
    padre_tlf_whatsapp: row['Telefono opcional'] ?? '',
    representante_parentesco: mapRepresentante(row['¿Quién sera su representante legal?']),
    acepta_pago_600: normalizeYesNo(row['¿Está dispuesto a contribuir con el aporte mensual de 600 pesos?']),
    autoriza_fotos_redes: normalizeYesNo(
      row['¿Acepta que podamos compartir por redes sociales y/o medios de comunicaciones fotos/videos donde aparezca posiblemente el rostro parcial o total del alumno?'],
    ),
    // Store raw phone for reference (no dedicated field in wizard, but kept in draft)
    _telefono_alumno: row['Número de teléfono del alumno'] ?? '',
    _correo: row['Dirección de correo electrónico'] ?? '',
  }
}

/**
 * Fetch and cache the postulantes list.
 * @returns {Promise<object[]>} raw CSV rows
 */
export async function fetchPostulantes() {
  if (_cache) return _cache
  const res = await fetch(SHEET_CSV_URL)
  if (!res.ok) throw new Error(`Error fetching form data: ${res.status}`)
  const text = await res.text()
  _cache = parseCSV(text)
  return _cache
}

/**
 * Search postulantes by name OR phone (partial match, accent-insensitive).
 *
 * @param {string} query
 * @returns {Promise<Array<{ raw: object, draft: object }>>}
 */
export async function buscarPostulante(query) {
  const q = normalize(query)
  if (!q || q.length < 2) return []

  const rows = await fetchPostulantes()

  return rows
    .filter((row) => {
      const name = normalize(row['Nombre del Alumno'])
      const phone1 = normalize(row['Número de teléfono del alumno'])
      const phone2 = normalize(row['¿Numero telefónico de ambos padres?'])
      const phone3 = normalize(row['Telefono opcional'])
      return (
        name.includes(q) ||
        phone1.includes(q) ||
        phone2.includes(q) ||
        phone3.includes(q)
      )
    })
    .map((raw) => ({ raw, draft: mapRowToDraft(raw) }))
}

/** Invalidate cache (e.g. after a page reload action) */
export function invalidarCachePostulantes() {
  _cache = null
}
