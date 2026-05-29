/**
 * googleFormApi — CSV schema mapping from Google Form responses to the
 * wizard draft / postulantes table shape.
 *
 * This module is used by the Edge Function sync-postulantes to convert
 * raw CSV rows into the target schema. It no longer fetches or caches
 * data directly — use postulantesApi.js for search operations.
 */

function normalize(str) {
  return (str ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim()
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
  if (
    s.startsWith('si') ||
    s.startsWith('sí') ||
    s === 'hare lo posible' ||
    s === 'haré lo posible'
  )
    return true
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
    acepta_pago_600: normalizeYesNo(
      row['¿Está dispuesto a contribuir con el aporte mensual de 600 pesos?'],
    ),
    autoriza_fotos_redes: normalizeYesNo(
      row[
        '¿Acepta que podamos compartir por redes sociales y/o medios de comunicaciones fotos/videos donde aparezca posiblemente el rostro parcial o total del alumno?'
      ],
    ),
    // Store raw phone for reference (no dedicated field in wizard, but kept in draft)
    _telefono_alumno: row['Número de teléfono del alumno'] ?? '',
    _correo: row['Dirección de correo electrónico'] ?? '',
  }
}
