import { isEligible } from '../domain/eligibility.js'

export function createEvaluacionView(container, adapter) {
  const state = {
    students: [],
    evaluations: new Map(),
    selectedStudentId: null,
    formState: { c1: null, c2: null, c3: null, c4: null, c5: null, c6: null, c7: null, c8: null },
    saving: false,
  }

  const render = () => {
    container.innerHTML = `
      <div class="row">
        <div class="col-md-5">
          <div class="card">
            <div class="card-header"><h5>Estudiantes</h5></div>
            <div class="list-group list-group-flush" id="student-list"></div>
          </div>
        </div>
        <div class="col-md-7">
          <div class="card">
            <div class="card-header"><h5>Evaluación</h5></div>
            <div class="card-body" id="evaluation-form">
              <div class="text-muted">Selecciona un estudiante para evaluar</div>
            </div>
          </div>
        </div>
      </div>`
    renderStudentList()
  }

  const renderStudentList = () => {
    const list = container.querySelector('#student-list')
    list.innerHTML = state.students.map(s => {
      const ev = state.evaluations.get(s.id)
      const isComplete = ev && ev.c1 !== null
      const badge = isComplete
        ? '<span class="badge bg-success ms-2">✓</span>'
        : '<span class="badge bg-secondary ms-2">—</span>'
      const active = state.selectedStudentId === s.id ? 'active' : ''
      return `<button class="list-group-item list-group-item-action ${active}" data-student-id="${s.id}">
        <strong>${s.full_name}</strong><small class="text-muted ms-2">${s.section_id}</small>${badge}
      </button>`
    }).join('')

    list.querySelectorAll('[data-student-id]').forEach(btn => {
      btn.addEventListener('click', () => selectStudent(btn.dataset.studentId))
    })
  }

  const renderForm = () => {
    const form = container.querySelector('#evaluation-form')
    const criteria = [
      { key: 'c1', label: 'Afinación General' },
      { key: 'c2', label: 'Ritmo Escala' },
      { key: 'c3', label: 'Sonido' },
      { key: 'c4', label: 'Digitación' },
      { key: 'c5', label: 'Afinación Repertorio' },
      { key: 'c6', label: 'Ritmo Repertorio' },
      { key: 'c7', label: 'Articulación' },
      { key: 'c8', label: 'Lectura' },
    ]

    const canSave = isEligible({ ...state.formState, student_id: state.selectedStudentId, jurado_id: 'placeholder' })
    form.innerHTML = `
      <form id="eval-form">
        ${criteria.map(c => `
          <div class="mb-2 row">
            <label class="col-sm-4 col-form-label">${c.label}</label>
            <div class="col-sm-8">
              <select class="form-select" data-key="${c.key}">
                <option value="">—</option>
                ${[1,2,3,4].map(v => `<option value="${v}" ${state.formState[c.key] === v ? 'selected' : ''}>${v}</option>`).join('')}
              </select>
            </div>
          </div>`).join('')}
        <button type="submit" class="btn btn-primary w-100" ${canSave ? '' : 'disabled'}>
          ${state.saving ? 'Guardando...' : 'Guardar Evaluación'}
        </button>
      </form>`

    form.querySelectorAll('[data-key]').forEach(sel => {
      sel.addEventListener('change', () => {
        state.formState[sel.dataset.key] = sel.value ? Number(sel.value) : null
        renderForm()
      })
    })

    form.querySelector('#eval-form').addEventListener('submit', async (e) => {
      e.preventDefault()
      if (state.saving) return
      state.saving = true
      renderForm()
      try {
        await adapter.saveEvaluation({
          student_id: state.selectedStudentId,
          jurado_id: 'usr-jurado-1',
          ...state.formState,
        })
        state.evaluations.set(state.selectedStudentId, { ...state.formState, c1: state.formState.c1 })
        renderStudentList()
      } catch (err) {
        alert('Error al guardar: ' + err.message)
      } finally {
        state.saving = false
        renderForm()
      }
    })
  }

  const selectStudent = (studentId) => {
    state.selectedStudentId = studentId
    const existing = state.evaluations.get(studentId)
    state.formState = existing
      ? { c1: existing.c1, c2: existing.c2, c3: existing.c3, c4: existing.c4, c5: existing.c5, c6: existing.c6, c7: existing.c7, c8: existing.c8 }
      : { c1: null, c2: null, c3: null, c4: null, c5: null, c6: null, c7: null, c8: null }
    renderStudentList()
    renderForm()
  }

  const load = async () => {
    try {
      const [students, evals] = await Promise.all([
        adapter.getAssignedStudents('usr-jurado-1'),
        adapter.getEvaluationsByJurado('usr-jurado-1'),
      ])
      state.students = students
      evals.forEach(e => state.evaluations.set(e.student_id, e))
      render()
    } catch (err) {
      container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`
    }
  }

  load()
  return { destroy: () => { container.innerHTML = '' } }
}
