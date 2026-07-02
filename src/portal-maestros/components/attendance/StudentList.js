import { escHTML } from '../../utils/portalUtils.js'

/**
 * createStudentList
 * Renderiza la lista de alumnos con botones P/J/A y click handler delegado.
 *
 * Callbacks:
 *   onEstadoChange(id, newEstado)  — toggle attendance
 *   onOpenProgressPanel(alumno)    — opens progress panel (when rutaId exists)
 *   onOpenEvaluationDrawer(student, snapshots) — opens evaluation drawer
 *   onOpenJustifModal(alumno, justifExistente, prevEstado) — opens justif modal
 *   onAutoSave(immediate)          — triggers debounced/immediate save
 *   onAnnounce(msg)                — a11y announcement
 *   onUpdateSnapshots(fn)          — mutates snapshots array
 */
export function createStudentList(container, {
  alumnos,
  estado,
  rutaId,
  canOpenProgressPanel = Boolean(rutaId),
  sesionId,
  fechaHoy,
  snapshots,
  justificaciones,
  obtenerJustificacion,
  // callbacks
  onEstadoChange,
  onOpenProgressPanel,
  onOpenEvaluationDrawer,
  onOpenJustifModal,
  onAutoSave,
  onAnnounce,
  onUpdateSnapshots,
}) {
  const listEl = container.querySelector('#pm-alumnos-list')
  if (!listEl) return { destroy() {}, render() {} }

  let _activeProgressPanel = null

  function _sortAlumnos(alumnos, estado) {
    return [...alumnos].sort((a, b) => {
      const aM = estado[a.id] !== null
      const bM = estado[b.id] !== null
      if (!aM && bM) return -1
      if (aM && !bM) return 1
      return 0
    })
  }

  function renderLista(animateId = null) {
    const sorted = _sortAlumnos(alumnos, estado)
    let prevRect = null
    if (animateId) {
      const el = listEl.querySelector(`[data-id="${animateId}"]`)
      if (el) prevRect = el.getBoundingClientRect()
    }

    listEl.innerHTML = sorted.map((a) => _renderAlumnoItem(a, estado[a.id])).join('')

    if (animateId && prevRect) {
      const newEl = listEl.querySelector(`[data-id="${animateId}"]`)
      const newRect = newEl.getBoundingClientRect()
      const deltaY = prevRect.top - newRect.top
      newEl.animate(
        [
          { transform: `translateY(${deltaY}px)`, opacity: 0.7 },
          { transform: 'translateY(0)', opacity: 1 },
        ],
        { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      )
    }
  }

  function _renderAlumnoItem(a, est) {
    const colorClass = est ? `estado-${est.toLowerCase()}` : ''
    return `
      <div class="pm-asist-item ${colorClass}" data-id="${a.id}">
        <div class="pm-asist-avatar">${a.nombre_completo[0]}</div>
        <div class="pm-asist-info">
          <span class="pm-asist-nombre">${escHTML(a.nombre_completo)}</span>
          <span class="pm-asist-instrumento">${escHTML(a.instrumento_principal || '—')}</span>
        </div>
        <div class="pm-asist-btns">
          <button class="pm-asist-btn ${est === 'P' ? 'active-p' : ''}" data-action="P" data-id="${a.id}">P</button>
          <button class="pm-asist-btn ${est === 'J' ? 'active-j' : ''}" data-action="J" data-id="${a.id}">J</button>
          <button class="pm-asist-btn ${est === 'A' ? 'active-a' : ''}" data-action="A" data-id="${a.id}">A</button>
        </div>
    </div>
    `
  }

  listEl.onclick = async (e) => {
    const btn = e.target.closest('.pm-asist-btn')
    const nameLabel = e.target.closest('.pm-asist-nombre')

    if (nameLabel) {
      const studentId = nameLabel.closest('.pm-asist-item').dataset.id
      const student = alumnos.find((a) => a.id === studentId)
      if (!student) return

      if (canOpenProgressPanel) {
        if (_activeProgressPanel) _activeProgressPanel.destroy()
        if (onOpenProgressPanel) onOpenProgressPanel(student)
        return
      }

      // Fallback: evaluation drawer
      let studentSnapshots = snapshots.filter((s) => s.student_id === studentId)
      if (studentSnapshots.length === 0) {
        try {
          const { academicService } =
              await import('../../../modules/academic-routes/services/academicService.js')
          const newSnaps = await academicService.createSnapshotForStudent(
            sesionId, studentId, fechaHoy,
          )
          if (newSnaps) {
            studentSnapshots = newSnaps
            if (onUpdateSnapshots) onUpdateSnapshots(newSnaps)
          }
        } catch (err) {
          console.error('Error creando snapshot on-demand:', err)
        }
      }
      if (onOpenEvaluationDrawer) onOpenEvaluationDrawer(student, studentSnapshots)
      return
    }

    if (!btn) return
    const { id, action } = btn.dataset

    if (window.navigator.vibrate) window.navigator.vibrate(10)

    // Interceptor para estado "J" (Justificado)
    if (action === 'J') {
      const alumno = alumnos.find((a) => a.id === id)
      if (!alumno) return

      if (estado[id] === 'J') {
        let justifExistente = justificaciones[id] || null
        if (!justifExistente && sesionId && obtenerJustificacion) {
          justifExistente = await obtenerJustificacion(sesionId, id)
          if (justifExistente && onUpdateSnapshots) {
            // Store in parent's justificaciones — handled by callback
          }
        }
        if (onOpenJustifModal) onOpenJustifModal(alumno, justifExistente, null)
        if (onAnnounce) onAnnounce(`Editando justificación de ${alumno.nombre_completo}.`)
      } else {
        if (onEstadoChange) onEstadoChange(id, 'J')
        renderLista(id)
        if (onAutoSave) await onAutoSave(true)
        if (onOpenJustifModal) onOpenJustifModal(alumno, null, null)
        if (onAnnounce) onAnnounce(`Justificación marcada para ${alumno.nombre_completo}.`)
      }
      return
    }

    // P/J/A toggle
    if (onEstadoChange) onEstadoChange(id, estado[id] === action ? null : action)
    renderLista(id)

    if (onAnnounce) {
      const presentes = Object.values(estado).filter((v) => v === 'P').length
      const ausentes = Object.values(estado).filter((v) => v === 'A').length
      const justificados = Object.values(estado).filter((v) => v === 'J').length
      onAnnounce(
        `Asistencia actualizada. ${presentes} presentes, ${ausentes} ausentes, ${justificados} justificados.`,
      )
    }
    if (onAutoSave) await onAutoSave(true)
  }

  return {
    render(animateId) {
      renderLista(animateId)
    },
    destroy() {
      listEl.onclick = null
      if (_activeProgressPanel) {
        _activeProgressPanel.destroy()
        _activeProgressPanel = null
      }
    },
  }
}
