/**
 * HomeworkPanel — Shows existing homework for a class event + form to add new ones.
 */

import { escHTML } from '../utils/portalUtils.js'
import { assignHomework } from '../services/classEventService.js'
import { supabase } from '../../lib/supabaseClient.js'

/**
 * @param {{ classEventId: string, studentId: string, teacherId: string, nodes: Array<{ id: string, name: string }> }} params
 * @returns {{ el: HTMLElement, refresh: () => Promise<void>, destroy: () => void }}
 */
export function createHomeworkPanel({ classEventId, studentId, teacherId, nodes }) {
  const el = document.createElement('div')
  el.className = 'pm-homework-panel'

  let destroyed = false

  async function fetchHomework() {
    const { data, error } = await supabase
      .from('homework_assignments')
      .select('*')
      .eq('class_event_id', classEventId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Error fetching homework: ${error.message}`)
    return data || []
  }

  function renderList(items) {
    if (!items.length) {
      return '<div class="pm-empty">No hay tareas asignadas aun.</div>'
    }

    return items.map(item => {
      const node = nodes.find(n => n.id === item.node_id)
      const nodeBadge = node
        ? `<span class="pm-badge pm-homework-panel-node">${escHTML(node.name)}</span>`
        : ''
      const dueDateStr = item.due_date
        ? `<span class="pm-homework-panel-due"><i class="bi bi-calendar"></i> ${escHTML(item.due_date)}</span>`
        : ''

      return `
        <div class="pm-homework-panel-item">
          <p class="pm-homework-panel-desc">${escHTML(item.description)}</p>
          <div class="pm-homework-panel-meta">${nodeBadge}${dueDateStr}</div>
        </div>`
    }).join('')
  }

  function render(items) {
    const nodeOptions = nodes.map(n =>
      `<option value="${escHTML(n.id)}">${escHTML(n.name)}</option>`
    ).join('')

    el.innerHTML = `
      <div class="pm-homework-panel-header">
        <h3><i class="bi bi-pencil"></i> Tareas</h3>
      </div>
      <div class="pm-homework-panel-list">${renderList(items)}</div>
      <form class="pm-homework-panel-form">
        <textarea class="pm-input pm-homework-panel-textarea" placeholder="Descripcion de la tarea..." rows="3"></textarea>
        <select class="pm-input pm-homework-panel-select">
          <option value="">Nodo (opcional)</option>
          ${nodeOptions}
        </select>
        <input type="date" class="pm-input pm-homework-panel-date" />
        <button type="submit" class="pm-btn pm-btn-secondary pm-btn-block pm-homework-panel-submit">
          Asignar Tarea
        </button>
      </form>`

    const form = el.querySelector('.pm-homework-panel-form')
    form.addEventListener('submit', handleSubmit)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const textarea = el.querySelector('.pm-homework-panel-textarea')
    const select = el.querySelector('.pm-homework-panel-select')
    const dateInput = el.querySelector('.pm-homework-panel-date')
    const btn = el.querySelector('.pm-homework-panel-submit')

    const description = textarea.value.trim()
    if (!description) {
      textarea.focus()
      return
    }

    btn.disabled = true
    btn.textContent = 'Guardando...'

    try {
      const params = { classEventId, studentId, teacherId, description }
      const nodeId = select.value
      const dueDate = dateInput.value

      if (nodeId) params.nodeId = nodeId
      if (dueDate) params.dueDate = dueDate

      await assignHomework(params)
      await refresh()
    } catch (err) {
      console.error('HomeworkPanel: error assigning homework', err)
    } finally {
      btn.disabled = false
      btn.textContent = 'Asignar Tarea'
    }
  }

  async function refresh() {
    if (destroyed) return
    try {
      const items = await fetchHomework()
      render(items)
    } catch (err) {
      console.error('HomeworkPanel: error refreshing', err)
    }
  }

  function destroy() {
    destroyed = true
    el.innerHTML = ''
  }

  // Initial load
  refresh()

  return { el, refresh, destroy }
}
