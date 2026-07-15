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
      { key: 'c3', label: 'Postura y Técnica (30%)' },
      { key: 'c1', label: 'Afinación (30%)' },
      { key: 'c2', label: 'Ritmo (20%)' },
      { key: 'c4', label: 'Musicalidad (20%)' },
    ]

    const canSave = isEligible({ ...state.formState, student_id: state.selectedStudentId, jurado_id: 'placeholder' })
    
    // Cálculo en tiempo real del promedio ponderado
    const c1 = Number(state.formState.c1) || 0
    const c2 = Number(state.formState.c2) || 0
    const c3 = Number(state.formState.c3) || 0
    const c4 = Number(state.formState.c4) || 0
    const promedio = (c3 * 0.3) + (c1 * 0.3) + (c2 * 0.2) + (c4 * 0.2)

    let dictamen = 'INCOMPLETO'
    let badgeClass = 'bg-secondary'
    if (canSave) {
      if (promedio >= 4.0) {
        dictamen = 'PROMOVIDO'
        badgeClass = 'bg-success'
      } else if (promedio >= 2.8) {
        dictamen = 'PERMANECE EN NIVEL ACTUAL'
        badgeClass = 'bg-warning text-dark'
      } else {
        dictamen = 'NO PROMOVIDO'
        badgeClass = 'bg-danger'
      }
    }

    const valueLabels = {
      1: '1 - Inicial',
      2: '2 - En Desarrollo',
      3: '3 - Competente',
      4: '4 - Sobresaliente',
      5: '5 - Excepcional'
    }

    form.innerHTML = `
      <form id="eval-form">
        ${criteria.map(c => `
          <div class="mb-3 row align-items-center">
            <label class="col-sm-5 col-form-label fw-semibold">${c.label}</label>
            <div class="col-sm-7">
              <select class="form-select" data-key="${c.key}">
                <option value="">— Seleccionar nota —</option>
                ${[1,2,3,4,5].map(v => `<option value="${v}" ${state.formState[c.key] === v ? 'selected' : ''}>${valueLabels[v]}</option>`).join('')}
              </select>
            </div>
          </div>`).join('')}
        
        <div class="my-4 p-3 bg-light rounded border border-secondary-subtle">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-bold text-secondary">Promedio Ponderado:</span>
            <span class="fs-4 fw-bold text-primary">${canSave ? promedio.toFixed(2) : '—'} / 5.00</span>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <span class="fw-bold text-secondary">Dictamen Sugerido:</span>
            <span class="badge ${badgeClass} fs-6 px-3 py-2">${dictamen}</span>
          </div>
        </div>

        <button type="submit" class="btn btn-primary w-100 py-2 fs-5" ${canSave ? '' : 'disabled'}>
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
          c1: state.formState.c1,
          c2: state.formState.c2,
          c3: state.formState.c3,
          c4: state.formState.c4,
          c5: null,
          c6: null,
          c7: null,
          c8: null
        })
        state.evaluations.set(state.selectedStudentId, { 
          c1: state.formState.c1, 
          c2: state.formState.c2, 
          c3: state.formState.c3, 
          c4: state.formState.c4,
          c5: null,
          c6: null,
          c7: null,
          c8: null
        })
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
      ? { c1: existing.c1, c2: existing.c2, c3: existing.c3, c4: existing.c4, c5: null, c6: null, c7: null, c8: null }
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
