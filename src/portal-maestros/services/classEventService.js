/**
 * classEventService — Service layer for class events, methodology, and homework.
 * DataAdapter pattern: all Supabase calls here, UI never touches DB directly.
 */

import { supabase } from '../../lib/supabaseClient.js'

/**
 * Generate or retrieve a class event for a student+session pair.
 * Finds the active academic plan, current level, nodes, and last homework.
 *
 * @param {{ studentId: string, teacherId: string, sessionId: string }} params
 * @returns {Promise<{ classEventId: string, level: object, activeNodes: object[], suggestedNodes: object[], lastHomework: object|null, academicPlanId: string }>}
 */
export async function generateClassEvent({ studentId, teacherId, sessionId }) {
  if (!studentId || !teacherId || !sessionId) {
    throw new Error('studentId, teacherId, and sessionId are required')
  }

  // 1. Find student's active academic_plan (status='in_process')
  const { data: plan, error: planErr } = await supabase
    .from('academic_plans')
    .select('id, route_version_id')
    .eq('student_id', studentId)
    .eq('status', 'in_process')
    .limit(1)
    .single()

  if (planErr || !plan) {
    throw new Error(`No active academic plan found for student ${studentId}`)
  }

  // 2. Find current level from student_level_progress (pending/in_process, ordered by level order_index)
  const { data: levelProgress, error: levelErr } = await supabase
    .from('student_level_progress')
    .select('id, level_id, status, levels!inner(id, route_version_id, level_number, name, order_index)')
    .eq('student_id', studentId)
    .in('status', ['pending', 'in_process'])
    .order('levels(order_index)', { ascending: true })
    .limit(1)
    .single()

  if (levelErr || !levelProgress) {
    throw new Error(`No active level found for student ${studentId}`)
  }

  const level = levelProgress.levels

  // 3. Get nodes for that level with their student_node_progress
  const { data: nodes, error: nodesErr } = await supabase
    .from('nodes')
    .select('id, key, name, type, is_critical, is_required, order_index')
    .eq('level_id', level.id)
    .order('order_index', { ascending: true })

  if (nodesErr) {
    throw new Error(`Error fetching nodes: ${nodesErr.message}`)
  }

  // Get student's node progress for these nodes
  const nodeIds = (nodes || []).map(n => n.id)
  let nodeProgressMap = {}

  if (nodeIds.length > 0) {
    const { data: nodeProgress } = await supabase
      .from('student_node_progress')
      .select('id, node_id, status, updated_at')
      .eq('student_id', studentId)
      .in('node_id', nodeIds)

    if (nodeProgress) {
      nodeProgressMap = Object.fromEntries(nodeProgress.map(np => [np.node_id, np]))
    }
  }

  const activeNodes = (nodes || []).map(node => ({
    ...node,
    progress: nodeProgressMap[node.id] || null,
  }))

  // Suggested nodes: pending or in_process, following hierarchical order
  const suggestedNodes = activeNodes
    .filter(n => {
      const status = n.progress?.status
      return !status || status === 'pending' || status === 'in_process'
    })
    .sort((a, b) => a.order_index - b.order_index)

  // 4. Get last homework
  const { data: lastHomework } = await supabase
    .from('homework_assignments')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // 5. Upsert class_event for session+student
  const { data: existingEvent } = await supabase
    .from('class_events')
    .select('id')
    .eq('session_id', sessionId)
    .eq('student_id', studentId)
    .maybeSingle()

  let classEventId

  if (existingEvent) {
    classEventId = existingEvent.id
  } else {
    const { data: newEvent, error: insertErr } = await supabase
      .from('class_events')
      .insert({
        teacher_id: teacherId,
        student_id: studentId,
        academic_plan_id: plan.id,
        session_id: sessionId,
        level_id: level.id,
        event_date: new Date().toISOString().split('T')[0],
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertErr) {
      throw new Error(`Error creating class event: ${insertErr.message}`)
    }
    classEventId = newEvent.id
  }

  return {
    classEventId,
    level,
    activeNodes,
    suggestedNodes,
    lastHomework: lastHomework || null,
    academicPlanId: plan.id,
  }
}

/**
 * Fetch an existing class_event with methodology and homework joined.
 *
 * @param {string} sessionId
 * @param {string} studentId
 * @returns {Promise<object|null>}
 */
export async function getClassEvent(sessionId, studentId) {
  if (!sessionId || !studentId) {
    throw new Error('sessionId and studentId are required')
  }

  const { data, error } = await supabase
    .from('class_events')
    .select(`
      *,
      class_event_methodology(*),
      homework_assignments(*)
    `)
    .eq('session_id', sessionId)
    .eq('student_id', studentId)
    .maybeSingle()

  if (error) {
    throw new Error(`Error fetching class event: ${error.message}`)
  }

  return data || null
}

/**
 * Upsert class_event_methodology for a class event.
 *
 * @param {string} classEventId
 * @param {object} data - methodology fields
 * @returns {Promise<object>}
 */
export async function saveMethodology(classEventId, data) {
  if (!classEventId) {
    throw new Error('classEventId is required')
  }

  const { data: result, error } = await supabase
    .from('class_event_methodology')
    .upsert(
      { class_event_id: classEventId, ...data },
      { onConflict: 'class_event_id' }
    )
    .select()
    .single()

  if (error) {
    throw new Error(`Error saving methodology: ${error.message}`)
  }

  return result
}

/**
 * Update the status of a class event.
 *
 * @param {string} classEventId
 * @param {string} status
 * @returns {Promise<object>}
 */
export async function updateClassEventStatus(classEventId, status) {
  if (!classEventId || !status) {
    throw new Error('classEventId and status are required')
  }

  const { data, error } = await supabase
    .from('class_events')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', classEventId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating class event status: ${error.message}`)
  }

  return data
}

/**
 * Insert a homework assignment for a class event.
 *
 * @param {{ classEventId: string, studentId: string, teacherId: string, description: string, dueDate?: string, nodeId?: string }} params
 * @returns {Promise<object>}
 */
export async function assignHomework({ classEventId, studentId, teacherId, description, dueDate, nodeId }) {
  if (!classEventId || !studentId || !teacherId) {
    throw new Error('classEventId, studentId, and teacherId are required')
  }
  if (!description || description.trim().length === 0) {
    throw new Error('description is required')
  }

  const row = {
    class_event_id: classEventId,
    student_id: studentId,
    teacher_id: teacherId,
    description: description.trim(),
    status: 'pending',
  }
  if (dueDate) row.due_date = dueDate
  if (nodeId) row.node_id = nodeId

  const { data, error } = await supabase
    .from('homework_assignments')
    .insert(row)
    .select()
    .single()

  if (error) {
    throw new Error(`Error assigning homework: ${error.message}`)
  }

  return data
}

/**
 * Get recent homework assignments for a student.
 *
 * @param {string} studentId
 * @param {{ limit?: number }} options
 * @returns {Promise<object[]>}
 */
export async function getStudentHomework(studentId, { limit = 10 } = {}) {
  if (!studentId) {
    throw new Error('studentId is required')
  }

  const { data, error } = await supabase
    .from('homework_assignments')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Error fetching homework: ${error.message}`)
  }

  return data || []
}
