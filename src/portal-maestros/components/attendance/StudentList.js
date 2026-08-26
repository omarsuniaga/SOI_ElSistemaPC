import { escHTML } from '../../utils/portalUtils.js'

const DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']

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
  justificaciones = {},
  obtenerJustificacion,
  eliminarJustificacion,
  isRotativa = false,
  // callbacks
  onEstadoChange,
  onOpenProgressPanel,
  onOpenEvaluationDrawer,
  onOpenJustifModal,
  onJustifDeleted,
  onAutoSave,
  onAnnounce,
  onUpdateSnapshots,
  onTurnoChange,
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
      if (a.hora_inicio && b.hora_inicio) {
        return a.hora_inicio.localeCompare(b.hora_inicio)
      }
      return 0
    })
  }

  function updateStudentRowState(id, newEstado) {
    const itemEl = listEl.querySelector(`.pm-asist-item[data-id="${id}"]`)
    if (!itemEl) {
      renderLista()
      return
    }

    itemEl.classList.remove('estado-p', 'estado-j', 'estado-a')
    if (newEstado) {
      itemEl.classList.add(`estado-${newEstado.toLowerCase()}`)
    }

    const btnP = itemEl.querySelector('.pm-asist-btn[data-action="P"]')
    const btnJ = itemEl.querySelector('.pm-asist-btn[data-action="J"]')
    const btnA = itemEl.querySelector('.pm-asist-btn[data-action="A"]')

    if (btnP) btnP.classList.toggle('active-p', newEstado === 'P')
    if (btnJ) btnJ.classList.toggle('active-j', newEstado === 'J')
    if (btnA) btnA.classList.toggle('active-a', newEstado === 'A')
  }

  function renderLista(animateId = null) {
    if (animateId && listEl.children.length > 0) {
      updateStudentRowState(animateId, estado[animateId])
      return
    }

    const sorted = _sortAlumnos(alumnos, estado)
    listEl.innerHTML = sorted.map((a) => _renderAlumnoItem(a, estado[a.id])).join('')
  }

  function _renderAlumnoItem(a, est) {
    const colorClass = est ? `estado-${est.toLowerCase()}` : ''
    const tieneTurno = a.hora_inicio && a.hora_fin
    const diaLabel = a.dia ? `${a.dia[0].toUpperCase()}${a.dia.slice(1)} ` : ''
    const turnoStr = tieneTurno ? ` · 🕒 ${diaLabel}${a.hora_inicio.slice(0, 5)}–${a.hora_fin.slice(0, 5)}` : ''
    const turnoEditBtn = isRotativa
      ? `<button class="pm-turno-edit-btn" data-action="turno" data-id="${a.id}" title="Turno individual">
           <i class="bi bi-clock-history"></i>
         </button>`
      : ''
    return `
      <div class="pm-asist-item ${colorClass}" data-id="${a.id}">
        <div class="pm-asist-avatar">${a.nombre_completo[0]}</div>
        <div class="pm-asist-info">
          <span class="pm-asist-nombre">${escHTML(a.nombre_completo)}</span>
          <span class="pm-asist-instrumento">${escHTML(a.instrumento_principal || '—')}${escHTML(turnoStr)}</span>
        </div>
        ${turnoEditBtn}
        <div class="pm-asist-btns">
          <button class="pm-asist-btn ${est === 'P' ? 'active-p' : ''}" data-action="P" data-id="${a.id}">P</button>
          <button class="pm-asist-btn ${est === 'J' ? 'active-j' : ''}" data-action="J" data-id="${a.id}">J</button>
          <button class="pm-asist-btn ${est === 'A' ? 'active-a' : ''}" data-action="A" data-id="${a.id}">A</button>
        </div>
    </div>
    `
  }

  function _openTurnoEditor(alumnoId) {
    const alumno = alumnos.find((a) => a.id === alumnoId)
    if (!alumno) return

    const overlay = document.createElement('div')
    overlay.className = 'pm-turno-overlay'
    overlay.innerHTML = `
      <div class="pm-turno-dialog" role="dialog" aria-modal="true" aria-label="Turno individual">
        <h4>Turno de ${escHTML(alumno.nombre_completo)}</h4>
        <p class="pm-turno-hint">Dejá el día vacío si el alumno va el mismo día que el resto de la clase.</p>
        <label class="pm-turno-field">
          <span>Día</span>
          <select id="pm-turno-dia">
            <option value="">(mismo día que la clase)</option>
            ${DIAS.map((d) => `<option value="${d}" ${d === alumno.dia ? 'selected' : ''}>${d[0].toUpperCase()}${d.slice(1)}</option>`).join('')}
          </select>
        </label>
        <div class="pm-turno-row">
          <label class="pm-turno-field">
            <span>Inicio</span>
            <input type="time" id="pm-turno-inicio" value="${alumno.hora_inicio ? alumno.hora_inicio.slice(0, 5) : ''}" />
          </label>
          <label class="pm-turno-field">
            <span>Fin</span>
            <input type="time" id="pm-turno-fin" value="${alumno.hora_fin ? alumno.hora_fin.slice(0, 5) : ''}" />
          </label>
        </div>
        <div class="pm-turno-actions">
          <button type="button" class="pm-turno-btn-ghost" id="pm-turno-cancelar">Cancelar</button>
          <button type="button" class="pm-turno-btn-primary" id="pm-turno-guardar">Guardar</button>
        </div>
      </div>
    `
    document.body.appendChild(overlay)

    const close = () => overlay.remove()
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })
    overlay.querySelector('#pm-turno-cancelar').addEventListener('click', close)

    overlay.querySelector('#pm-turno-guardar').addEventListener('click', async () => {
      const dia = overlay.querySelector('#pm-turno-dia').value || null
      const hora_inicio = overlay.querySelector('#pm-turno-inicio').value || null
      const hora_fin = overlay.querySelector('#pm-turno-fin').value || null

      const btn = overlay.querySelector('#pm-turno-guardar')
      btn.disabled = true
      btn.textContent = 'Guardando…'
      try {
        if (onTurnoChange) await onTurnoChange(alumnoId, { dia, hora_inicio, hora_fin })
        close()
        renderLista(alumnoId)
      } catch (err) {
        console.error('[StudentList] Error guardando turno:', err)
        btn.disabled = false
        btn.textContent = 'Guardar'
        if (onAnnounce) onAnnounce('No se pudo guardar el turno: ' + (err.message || err))
      }
    })
  }

  listEl.onclick = async (e) => {
    const turnoBtn = e.target.closest('.pm-turno-edit-btn')
    if (turnoBtn) {
      _openTurnoEditor(turnoBtn.dataset.id)
      return
    }

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
        // Al presionar sobre el mismo botón 'J', desmarcar (pasar a null)
        if (onEstadoChange) onEstadoChange(id, null)
        let justifExistente = justificaciones?.[id] || null
        if (justifExistente?.id && typeof eliminarJustificacion === 'function') {
          eliminarJustificacion(justifExistente.id).catch(console.warn)
        }
        if (justificaciones && justificaciones[id]) {
          delete justificaciones[id]
        }
        if (typeof onJustifDeleted === 'function') onJustifDeleted(id)
        updateStudentRowState(id, null)
        if (onAutoSave) await onAutoSave(true)
        if (onAnnounce) onAnnounce(`Justificación desmarcada para ${alumno.nombre_completo}.`)
      } else {
        // Abrir el modal de justificación. NO marcamos 'J' por adelantado;
        // se marcará cuando el maestro confirme y guarde la justificación en el modal.
        const prevEstado = estado[id] || null
        const justifExistente = justificaciones?.[id] || null
        if (onOpenJustifModal) onOpenJustifModal(alumno, justifExistente, prevEstado)
      }
      return
    }

    // P/A toggle
    const nextState = estado[id] === action ? null : action
    if (onEstadoChange) onEstadoChange(id, nextState)
    updateStudentRowState(id, nextState)

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
