/**
 * Progress History Formatter
 * Converts bulk-fetched source data into continuous timelines with gap-filling and bucketing
 * Pure function: no Supabase imports
 */

/**
 * Computes SHA256 hash for deduplication (browser/Node 18+)
 * @param {string} text - Text to hash
 * @returns {Promise<string>} Hex digest
 */
async function sha256(text) {
  // Use Web Crypto API (browser) or node:crypto fallback
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(text)
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', msgUint8)
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Fallback for Node.js
  try {
    const crypto = await import('node:crypto')
    return crypto.createHash('sha256').update(text).digest('hex')
  } catch {
    // Minimal sync fallback (not cryptographically strong, but acceptable for dedup)
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }
}

/**
 * Builds ISO week key from date string
 * @param {string} dateStr - ISO date (YYYY-MM-DD)
 * @returns {string} ISO week key (YYYY-Www)
 */
function getWeekKey(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z')
  const jan4 = new Date(d.getUTCFullYear(), 0, 4)
  const msPerDay = 86400000
  const weekStartMs =
    jan4 - (jan4.getUTCDay() || 7) * msPerDay + msPerDay
  const weekNum = Math.round((d - weekStartMs) / msPerDay / 7) + 1
  const year = d.getUTCFullYear()
  return `${year}-W${String(weekNum).padStart(2, '0')}`
}

/**
 * Builds month key from date string
 * @param {string} dateStr - ISO date (YYYY-MM-DD)
 * @returns {string} Month key (YYYY-MM)
 */
function getMonthKey(dateStr) {
  return dateStr.substring(0, 7)
}

/**
 * Generates all ISO weeks between from and to dates
 * @param {string} from - ISO date (YYYY-MM-DD)
 * @param {string} to - ISO date (YYYY-MM-DD)
 * @returns {Array<{key: string, fecha_inicio: string, fecha_fin: string}>}
 */
function generateWeekRanges(from, to) {
  const weeks = []
  let current = new Date(from + 'T00:00:00Z')
  const end = new Date(to + 'T00:00:00Z')

  // Find first Monday on or before 'from'
  const day = current.getUTCDay()
  const diff = current.getUTCDate() - day + (day === 0 ? -6 : 1)
  current = new Date(current.getUTCFullYear(), current.getUTCMonth(), diff)

  while (current <= end) {
    const key = getWeekKey(current.toISOString().split('T')[0])
    const weekStart = new Date(current)
    const weekEnd = new Date(current)
    weekEnd.setUTCDate(weekEnd.getUTCDate() + 6)

    weeks.push({
      key,
      fecha_inicio: weekStart.toISOString().split('T')[0],
      fecha_fin: weekEnd.toISOString().split('T')[0],
    })

    current.setUTCDate(current.getUTCDate() + 7)
  }

  return weeks
}

/**
 * Generates all months between from and to dates
 * @param {string} from - ISO date (YYYY-MM-DD)
 * @param {string} to - ISO date (YYYY-MM-DD)
 * @returns {Array<{key: string, fecha_inicio: string, fecha_fin: string}>}
 */
function generateMonthRanges(from, to) {
  const months = []
  const [fromYear, fromMonth] = from.split('-').map(Number)
  const [toYear, toMonth] = to.split('-').map(Number)

  let year = fromYear
  let month = fromMonth

  while (year < toYear || (year === toYear && month <= toMonth)) {
    const key = `${year}-${String(month).padStart(2, '0')}`
    const lastDay = new Date(year, month, 0).getDate()

    months.push({
      key,
      fecha_inicio: `${year}-${String(month).padStart(2, '0')}-01`,
      fecha_fin: `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
    })

    month++
    if (month > 12) {
      month = 1
      year++
    }
  }

  return months
}

/**
 * Partitions rows by (alumnoId, bucketKey)
 * @param {Array} rows - Rows with alumno_id and date field
 * @param {string} dateField - Name of date field in row
 * @param {Function} keyFn - (dateStr) => bucketKey
 * @returns {Map<alumnoId, Map<bucketKey, Array<row>>>}
 */
function partitionByAlumnoAndBucket(rows, dateField, keyFn) {
  const partitions = new Map()
  for (const row of rows) {
    const alumnoId = row.alumno_id
    if (!partitions.has(alumnoId)) {
      partitions.set(alumnoId, new Map())
    }

    const bucketKey = keyFn(row[dateField])
    const bucketMap = partitions.get(alumnoId)
    if (!bucketMap.has(bucketKey)) {
      bucketMap.set(bucketKey, [])
    }
    bucketMap.get(bucketKey).push(row)
  }
  return partitions
}

/**
 * Reduces progresos into average grade
 * @param {Array} rows - Progresos rows
 * @returns {Object} { calificacion: float | null }
 */
function reduceGradeBucket(rows) {
  const nonNull = rows.filter(r => r.calificacion !== null && r.calificacion !== undefined)
  if (nonNull.length === 0) return { calificacion: null }

  const sum = nonNull.reduce((acc, r) => acc + parseFloat(r.calificacion), 0)
  return { calificacion: sum / nonNull.length }
}

/**
 * Reduces asistencias into attendance rate
 * @param {Array} rows - Asistencias rows
 * @returns {Object} { asistencia_rate: float | null }
 */
function reduceAttendanceBucket(rows) {
  if (rows.length === 0) return { asistencia_rate: null }

  const counted = rows.filter(
    r => r.estado === 'presente' || r.estado === 'tarde' || r.estado === 'justificado'
  ).length
  return { asistencia_rate: counted / rows.length }
}

/**
 * Reduces indicator_attempts into pass stats
 * @param {Array} rows - Indicator attempt rows
 * @returns {Object} { passed, total }
 */
function reduceIndicatorBucket(rows) {
  if (rows.length === 0) return { passed: 0, total: 0 }

  const passed = rows.filter(r => r.passed === true).length
  return { passed, total: rows.length }
}

/**
 * Formats progress data into continuous history timeline
 * @param {Object} options - { alumnoIds, from, to, granularity, asis, prog, attempts, obs }
 * @returns {Map<alumnoId, ProgressHistory>}
 */
export function format({ alumnoIds, from, to, granularity = 'week', asis, prog, attempts, obs }) {
  // Determine bucket ranges based on granularity
  let ranges
  let dateField
  let keyFn

  if (granularity === 'week') {
    ranges = generateWeekRanges(from, to)
    dateField = 'fecha'
    keyFn = getWeekKey
  } else if (granularity === 'month') {
    ranges = generateMonthRanges(from, to)
    dateField = 'fecha_evaluacion'
    keyFn = getMonthKey
  } else if (granularity === 'evaluacion') {
    // For evaluacion granularity, extract unique evaluacion_ids
    const uniqueEvalIds = new Set()
    for (const row of prog || []) {
      if (row.alumno_id && row.evaluacion_id) {
        uniqueEvalIds.add(row.evaluacion_id)
      }
    }
    ranges = Array.from(uniqueEvalIds)
      .sort()
      .map(id => ({
        key: id,
        fecha_inicio: null,
        fecha_fin: null,
      }))
    dateField = 'evaluacion_id'
    keyFn = id => id
  }

  // Partition sources by alumno and bucket
  const asisPart = partitionByAlumnoAndBucket(asis || [], 'fecha', keyFn)
  const progPart = partitionByAlumnoAndBucket(prog || [], dateField, keyFn)
  const attPart = partitionByAlumnoAndBucket(attempts || [], 'fecha', keyFn)
  const obsPart = partitionByAlumnoAndBucket(obs || [], 'fecha', keyFn)

  // Build result Map
  const result = new Map()

  for (const alumnoId of alumnoIds) {
    const alumnoAsis = asisPart.get(alumnoId) || new Map()
    const alumnoProg = progPart.get(alumnoId) || new Map()
    const alumnoAtt = attPart.get(alumnoId) || new Map()
    const alumnoObs = obsPart.get(alumnoId) || new Map()

    // Build buckets (including gap-fills)
    const buckets = ranges.map(range => {
      const key = range.key
      const asisRows = alumnoAsis.get(key) || []
      const progRows = alumnoProg.get(key) || []
      const attRows = alumnoAtt.get(key) || []
      const obsRows = alumnoObs.get(key) || []

      // Reduce each source
      const gradeData = reduceGradeBucket(progRows)
      const attendanceData = reduceAttendanceBucket(asisRows)
      const indicatorData = reduceIndicatorBucket(attRows)

      // Deduplicate and sort observaciones
      const dedupMap = new Map()
      for (const obsRow of obsRows) {
        const key = `${alumnoId}|${obsRow.texto}|${obsRow.fecha}`
        if (!dedupMap.has(key)) {
          dedupMap.set(key, obsRow)
        }
      }
      const sortedObs = Array.from(dedupMap.values())
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .map(o => ({
          id: o.id,
          texto: o.texto,
          source: o.tipo === 'sesion' ? 'sesion' : 'alumno',
        }))

      // Build bucket object
      const bucket = {
        bucket_key: key,
        fecha_inicio: range.fecha_inicio,
        fecha_fin: range.fecha_fin,
        calificacion: gradeData.calificacion,
        indicadores: indicatorData,
        asistencia_rate: attendanceData.asistencia_rate,
        observaciones: sortedObs,
      }

      // Add tipo_evaluacion for evaluacion granularity
      if (granularity === 'evaluacion' && progRows.length > 0) {
        bucket.tipo_evaluacion = progRows[0].tipo_evaluacion || null
      } else if (granularity === 'evaluacion') {
        bucket.tipo_evaluacion = null
      }

      return bucket
    })

    // Sort buckets by fecha_inicio
    buckets.sort((a, b) => {
      if (!a.fecha_inicio || !b.fecha_inicio) return 0
      return new Date(a.fecha_inicio) - new Date(b.fecha_inicio)
    })

    result.set(alumnoId, {
      alumnoId,
      granularity,
      buckets,
    })
  }

  return result
}
