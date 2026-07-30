import { supabase } from '../../../lib/supabaseClient.js'
import { checkPeriodoSupport } from '../../../lib/periodoSniffer.js'

/**
 * Helper: convert time string to minutes for overlap comparison.
 * Reuses the same logic as clasesApi.js.
 */
function timeToMinutes(timeStr) {
  if (!timeStr) return 0
  const cleanTime = timeStr.trim()
  let isPM = false
  let timePart = cleanTime

  if (cleanTime.toLowerCase().includes('pm')) {
    isPM = true
    timePart = cleanTime.toLowerCase().replace('pm', '').trim()
  } else if (cleanTime.toLowerCase().includes('am')) {
    timePart = cleanTime.toLowerCase().replace('am', '').trim()
  }

  const parts = timePart.split(':')
  let hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0

  if (isPM && hours < 12) hours += 12
  else if (!isPM && hours === 12) hours = 0

  return hours * 60 + minutes
}

/**
 * Return all academic periods with class counts, ordered by fecha_inicio descending.
 *
 * @returns {Promise<Array>} Periods with { id, nombre, fecha_inicio, fecha_fin, activo, classCount }
 */
export async function getPeriods() {
  const { data: periodos, error: pError } = await supabase
    .from('periodos')
    .select('*')
    .order('fecha_inicio', { ascending: false })

  if (pError) throw pError

  const { data: clases, error: cError } = await supabase
    .from('clases')
    .select('periodo_id')

  if (cError) throw cError

  // Count classes per period
  const countMap = {}
  for (const c of (clases || [])) {
    const pid = c.periodo_id
    if (pid) countMap[pid] = (countMap[pid] || 0) + 1
  }

  return (periodos || []).map(p => ({
    ...p,
    classCount: countMap[p.id] || 0,
  }))
}

/**
 * Preview what would happen if we clone from source to target period.
 * Read-only — writes nothing to the database.
 *
 * @param {string} sourcePeriodId
 * @param {string} targetPeriodId
 * @returns {Promise<{ toCreate: Array, toSkip: Array, existingInTarget: number }>}
 */
export async function getTransitionPreview(sourcePeriodId, targetPeriodId) {
  // Fetch source classes
  const { data: sourceClasses, error: sErr } = await supabase
    .from('clases')
    .select('*')
    .eq('periodo_id', sourcePeriodId)

  if (sErr) throw sErr

  // Fetch existing classes in target
  const { data: targetClasses, error: tErr } = await supabase
    .from('clases')
    .select('*')
    .eq('periodo_id', targetPeriodId)

  if (tErr) throw tErr

  const targetNames = new Set((targetClasses || []).map(c => c.nombre))

  const toCreate = []
  const toSkip = []

  for (const cls of (sourceClasses || [])) {
    if (targetNames.has(cls.nombre)) {
      toSkip.push(cls)
    } else {
      toCreate.push(cls)
    }
  }

  return {
    toCreate,
    toSkip,
    existingInTarget: (targetClasses || []).length,
  }
}

/**
 * Clone classes from source period to target period.
 * Idempotent: classes already in target (by name) are skipped.
 *
 * @param {string} sourcePeriodId
 * @param {string} targetPeriodId
 * @param {Object} [options]
 * @param {string[]} [options.excludeClassIds] - Class IDs to skip
 * @param {Object} [options.edits] - { [sourceClassId]: { teacher, schedules, capacity } }
 * @param {Function} [options.onProgress] - (current, total) callback
 * @returns {Promise<{ created: Array, skipped: string[], errors: Array }>}
 */
export async function cloneClasses(sourcePeriodId, targetPeriodId, options = {}) {
  const { excludeClassIds = [], edits = {}, onProgress = () => {} } = options

  // Fetch source classes with horarios
  const { data: sourceClasses, error: sErr } = await supabase
    .from('clases')
    .select('*')
    .eq('periodo_id', sourcePeriodId)

  if (sErr) throw sErr

  // Fetch existing target classes for idempotency check
  const { data: targetClasses, error: tErr } = await supabase
    .from('clases')
    .select('*')
    .eq('periodo_id', targetPeriodId)

  if (tErr) throw tErr

  const targetNames = new Set((targetClasses || []).map(c => c.nombre))
  const excludeSet = new Set(excludeClassIds)

  // Fetch horarios for source classes
  const sourceClassIds = (sourceClasses || []).map(c => c.id)
  let allHorarios = []
  if (sourceClassIds.length > 0) {
    const { data: horarios } = await supabase
      .from('clase_horarios')
      .select('*')
      .in('clase_id', sourceClassIds)
    allHorarios = horarios || []
  }

  const created = []
  const skipped = []
  const errors = []
  let current = 0
  const total = (sourceClasses || []).length

  for (const cls of (sourceClasses || [])) {
    current++

    // Skip excluded classes
    if (excludeSet.has(cls.id)) {
      skipped.push(cls.id)
      onProgress(current, total)
      continue
    }

    // Skip if already in target (idempotent)
    if (targetNames.has(cls.nombre)) {
      skipped.push(cls.id)
      onProgress(current, total)
      continue
    }

    // Strip id and set target period
    const classData = { ...cls }
    delete classData.id
    classData.periodo_id = targetPeriodId

    // Apply edits if any
    const edit = edits[cls.id]
    if (edit) {
      if (edit.teacher !== undefined) classData.maestro_principal_id = edit.teacher
      if (edit.capacity !== undefined) classData.capacidad_maxima = edit.capacity
    }

    try {
      const { data: inserted, error: insertErr } = await supabase
        .from('clases')
        .insert([classData])
        .select()

      if (insertErr) {
        errors.push({ classId: cls.id, error: insertErr.message })
        onProgress(current, total)
        continue
      }

      const newClass = inserted[0]

      // Clone horarios for this class
      const classHorarios = allHorarios.filter(h => h.clase_id === cls.id)
      if (classHorarios.length > 0) {
        const horariosData = classHorarios.map(h => ({
          clase_id: newClass.id,
          dia: h.dia,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          salon_id: h.salon_id || null,
          maestro_id: newClass.maestro_principal_id || null,
        }))

        const { error: horErr } = await supabase
          .from('clase_horarios')
          .insert(horariosData)

        if (horErr) {
          // Class created but horarios failed — still count as created with warning
          errors.push({ classId: cls.id, error: `Horarios failed: ${horErr.message}` })
        }
      }

      created.push(newClass)
    } catch (err) {
      errors.push({ classId: cls.id, error: err.message })
    }

    onProgress(current, total)
  }

  return { created, skipped, errors }
}

/**
 * Bulk-enroll students from source classes into target-period classes.
 * Creates new enrollment records; does not copy source records directly.
 *
 * @param {string} sourcePeriodId
 * @param {string} targetPeriodId
 * @param {Object} [options]
 * @param {Array} [options.classMapping] - [{ sourceClassId, targetClassId }]
 * @param {Map<string, Set<string>>} [options.excludeStudentIds] - classId → Set of studentIds
 * @param {Function} [options.onProgress] - (current, total) callback
 * @returns {Promise<{ enrolled: number, skipped: number, errors: Array }>}
 */
export async function bulkEnrollStudents(sourcePeriodId, targetPeriodId, options = {}) {
  const { classMapping = [], excludeStudentIds = new Map(), onProgress = () => {} } = options

  let enrolled = 0
  let skipped = 0
  const errors = []
  let current = 0
  const total = classMapping.length

  for (const mapping of classMapping) {
    current++
    const { sourceClassId, targetClassId } = mapping

    try {
      // Fetch source enrollments
      const { data: enrollments, error: eErr } = await supabase
        .from('alumnos_clases')
        .select('alumno_id, clase_id, activo, fecha_inscripcion, hora_inicio, hora_fin')
        .eq('clase_id', sourceClassId)
        .eq('activo', true)

      if (eErr) {
        errors.push({ classId: sourceClassId, error: eErr.message })
        onProgress(current, total)
        continue
      }

      const excluded = excludeStudentIds.get(sourceClassId) || new Set()
      const toEnroll = (enrollments || []).filter(e => !excluded.has(e.alumno_id))
      const skippedCount = (enrollments || []).length - toEnroll.length
      skipped += skippedCount

      if (toEnroll.length === 0) {
        onProgress(current, total)
        continue
      }

      // Create new enrollment records for target class
      const newEnrollments = toEnroll.map(e => ({
        clase_id: targetClassId,
        alumno_id: e.alumno_id,
        activo: true,
        fecha_inscripcion: new Date().toISOString().split('T')[0],
        hora_inicio: e.hora_inicio || null,
        hora_fin: e.hora_fin || null,
      }))

      const { error: insertErr } = await supabase
        .from('alumnos_clases')
        .insert(newEnrollments)

      if (insertErr) {
        errors.push({ classId: sourceClassId, error: insertErr.message })
      } else {
        enrolled += toEnroll.length
      }
    } catch (err) {
      errors.push({ classId: sourceClassId, error: err.message })
    }

    onProgress(current, total)
  }

  return { enrolled, skipped, errors }
}

/**
 * Detect room and teacher conflicts for classes against the target period.
 * Reuses the query pattern from verificarSolapamiento in clasesApi.js.
 *
 * @param {Array} classes - Array of class objects with horarios
 * @param {string} targetPeriodId
 * @returns {Promise<Array>} Array of Conflict objects
 */
export async function validateConflicts(classes, targetPeriodId) {
  const allHorarios = []

  for (const cls of classes) {
    for (const h of (cls.horarios || [])) {
      if (h.dia && h.hora_inicio && h.hora_fin) {
        allHorarios.push({
          claseId: cls.id,
          dia: h.dia,
          hora_inicio: h.hora_inicio,
          hora_fin: h.hora_fin,
          salon_id: h.salon_id || null,
          maestroId: cls.maestro_principal_id || null,
        })
      }
    }
  }

  if (allHorarios.length === 0) return []

  // Collect unique days to query
  const days = [...new Set(allHorarios.map(h => h.dia))]

  // Batch-fetch existing schedules for target period
  const { data: existingSchedules, error } = await supabase
    .from('clase_horarios')
    .select('*, clases!inner(id, nombre, maestro_principal_id)')
    .in('dia', days)

  if (error || !existingSchedules) return []

  // Filter to target period classes only
  const targetClassIds = new Set()
  const { data: targetClasses } = await supabase
    .from('clases')
    .select('id')
    .eq('periodo_id', targetPeriodId)

  for (const c of (targetClasses || [])) targetClassIds.add(c.id)

  const targetSchedules = existingSchedules.filter(s => targetClassIds.has(s.clase_id))

  const conflicts = []
  const seen = new Set()

  for (const input of allHorarios) {
    const inputStart = timeToMinutes(input.hora_inicio)
    const inputEnd = timeToMinutes(input.hora_fin)

    for (const existing of targetSchedules) {
      const existStart = timeToMinutes(existing.hora_inicio)
      const existEnd = timeToMinutes(existing.hora_fin)

      // Check time overlap
      if (inputStart >= existEnd || inputEnd <= existStart) continue

      // Check room conflict
      if (input.salon_id && existing.salon_id === input.salon_id) {
        const key = `room:${input.claseId}:${existing.clase_id}:${input.dia}`
        if (!seen.has(key)) {
          seen.add(key)
          conflicts.push({
            classId: input.claseId,
            type: 'room',
            conflictingClass: existing.clases?.nombre || 'Unknown',
            detail: `Salón ocupado por "${existing.clases?.nombre}"`,
            timeSlot: `${input.dia} ${input.hora_inicio}–${input.hora_fin}`,
          })
        }
      }

      // Check teacher conflict
      if (input.maestroId && existing.clases?.maestro_principal_id === input.maestroId) {
        const key = `teacher:${input.claseId}:${existing.clase_id}:${input.dia}`
        if (!seen.has(key)) {
          seen.add(key)
          conflicts.push({
            classId: input.claseId,
            type: 'teacher',
            conflictingClass: existing.clases?.nombre || 'Unknown',
            detail: `Maestro asignado a "${existing.clases?.nombre}"`,
            timeSlot: `${input.dia} ${input.hora_inicio}–${input.hora_fin}`,
          })
        }
      }
    }
  }

  return conflicts
}
