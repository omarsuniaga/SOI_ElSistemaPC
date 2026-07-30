import { getPeriods, getTransitionPreview, cloneClasses, bulkEnrollStudents } from '../api/semesterTransition.js'
import { getSourceStudents, getInstrumentFacets } from '../api/studentClassifier.js'
import { createPeriodSelector } from './PeriodSelector.js'
import { createClassEditor } from './ClassEditor.js'
import { createStudentClassifier } from './StudentClassifier.js'

const STEP_LABELS = ['Periodo', 'Clases', 'Alumnos', 'Confirmar']

/**
 * Create a TransitionWizard — a 4-step guided wizard for semester transitions.
 *
 * @param {HTMLElement} container - Mount target
 * @param {Object} [options]
 * @param {Function} [options.onComplete] - Called with execution results on completion
 * @returns {{ element: HTMLElement, destroy: Function, getState: Function }}
 */
export function createTransitionWizard(container, options = {}) {
  const { onComplete } = options
  const el = document.createElement('div')
  el.className = 'ts-transition-wizard'

  const state = {
    currentStep: 1,
    sourcePeriodId: null,
    targetPeriodId: null,
    classes: [],
    selectedClassIds: new Set(),
    classEdits: {},
    students: [],
    selectedStudentIds: new Set(),
    results: null,
    error: null,
    loading: false,
  }

  let periodSelector = null

  function renderStepIndicator() {
    const indicator = document.createElement('div')
    indicator.className = 'ts-step-indicator-bar'

    for (let i = 0; i < STEP_LABELS.length; i++) {
      const stepNum = i + 1
      const stepEl = document.createElement('span')
      stepEl.className = 'ts-step-indicator'
      stepEl.dataset.step = stepNum
      stepEl.textContent = STEP_LABELS[i]

      if (stepNum === state.currentStep) {
        stepEl.classList.add('ts-step-active')
      } else if (stepNum < state.currentStep) {
        stepEl.classList.add('ts-step-completed')
      }

      indicator.appendChild(stepEl)
    }

    return indicator
  }

  function renderNavigation() {
    const nav = document.createElement('div')
    nav.className = 'ts-nav-bar'

    if (state.currentStep > 1) {
      const backBtn = document.createElement('button')
      backBtn.className = 'ts-back-btn'
      backBtn.textContent = 'Atras'
      backBtn.addEventListener('click', () => {
        state.currentStep--
        renderStep()
      })
      nav.appendChild(backBtn)
    }

    if (state.currentStep < 4) {
      const nextBtn = document.createElement('button')
      nextBtn.className = 'ts-next-btn'
      nextBtn.textContent = state.currentStep === 3 ? 'Revisar' : 'Siguiente'
      nextBtn.addEventListener('click', async () => {
        if (await validateCurrentStep()) {
          state.currentStep++
          renderStep()
        }
      })
      nav.appendChild(nextBtn)
    }

    return nav
  }

  async function validateCurrentStep() {
    switch (state.currentStep) {
      case 1:
        if (!state.sourcePeriodId || !state.targetPeriodId) return false
        if (state.sourcePeriodId === state.targetPeriodId) return false
        return true
      case 2:
        return state.selectedClassIds.size > 0
      case 3:
        return true // student selection is optional
      default:
        return true
    }
  }

  function renderStep1() {
    const section = document.createElement('div')
    section.className = 'ts-step-periods'

    const title = document.createElement('h3')
    title.textContent = 'Seleccionar periodos'
    section.appendChild(title)

    const grid = document.createElement('div')
    grid.className = 'ts-periods-grid'

    // Source period
    const sourceCol = document.createElement('div')
    sourceCol.className = 'ts-period-column'
    const sourceLabel = document.createElement('label')
    sourceLabel.textContent = 'Periodo origen (a clonar)'
    sourceCol.appendChild(sourceLabel)

    periodSelector = createPeriodSelector(sourceCol, {
      onChange: (period) => {
        state.sourcePeriodId = period.id
      },
    })
    periodSelector.load()

    grid.appendChild(sourceCol)

    // Target period
    const targetCol = document.createElement('div')
    targetCol.className = 'ts-period-column'
    const targetLabel = document.createElement('label')
    targetLabel.textContent = 'Periodo destino'
    targetCol.appendChild(targetLabel)

    const targetSelector = createPeriodSelector(targetCol, {
      onChange: (period) => {
        state.targetPeriodId = period.id
      },
    })
    targetSelector.load()

    grid.appendChild(targetCol)
    section.appendChild(grid)

    return section
  }

  async function renderStep2() {
    const section = document.createElement('div')
    section.className = 'ts-step-preview'

    state.loading = true

    try {
      const preview = await getTransitionPreview(state.sourcePeriodId, state.targetPeriodId)
      state.classes = preview.toCreate

      // Initialize selected IDs (all selected by default)
      state.selectedClassIds = new Set(preview.toCreate.map(c => c.id))

      const title = document.createElement('h3')
      title.textContent = `Clases a clonar (${preview.toCreate.length})`
      section.appendChild(title)

      if (preview.toSkip.length > 0) {
        const skipInfo = document.createElement('p')
        skipInfo.className = 'ts-skip-info'
        skipInfo.textContent = `${preview.toSkip.length} clase(s) ya existen en el destino y seran omitidas`
        section.appendChild(skipInfo)
      }

      // Select all checkbox
      const selectAllWrap = document.createElement('div')
      selectAllWrap.className = 'ts-select-all-wrap'
      const selectAll = document.createElement('input')
      selectAll.type = 'checkbox'
      selectAll.className = 'ts-select-all'
      selectAll.checked = true
      selectAll.addEventListener('change', () => {
        if (selectAll.checked) {
          state.classes.forEach(c => state.selectedClassIds.add(c.id))
        } else {
          state.selectedClassIds.clear()
        }
        renderClassList()
      })
      const selectAllLabel = document.createElement('span')
      selectAllLabel.textContent = 'Seleccionar todas'
      selectAllWrap.appendChild(selectAll)
      selectAllWrap.appendChild(selectAllLabel)
      section.appendChild(selectAllWrap)

      // Class list
      const listEl = document.createElement('div')
      listEl.className = 'ts-class-list'
      section.appendChild(listEl)

      function renderClassList() {
        listEl.innerHTML = ''
        for (const cls of state.classes) {
          const row = document.createElement('div')
          row.className = 'ts-class-row'

          const checkbox = document.createElement('input')
          checkbox.type = 'checkbox'
          checkbox.className = 'ts-class-check'
          checkbox.checked = state.selectedClassIds.has(cls.id)
          checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
              state.selectedClassIds.add(cls.id)
            } else {
              state.selectedClassIds.delete(cls.id)
            }
            // Update select-all
            selectAll.checked = state.classes.every(c => state.selectedClassIds.has(c.id))
            selectAll.indeterminate = !selectAll.checked && state.classes.some(c => state.selectedClassIds.has(c.id))
          })

          const info = document.createElement('span')
          info.className = 'ts-class-info'
          info.textContent = `${cls.nombre} — ${cls.instrumento || ''}`

          row.appendChild(checkbox)
          row.appendChild(info)
          listEl.appendChild(row)
        }

        // Sync select-all state
        selectAll.checked = state.classes.every(c => state.selectedClassIds.has(c.id))
        selectAll.indeterminate = !selectAll.checked && state.classes.some(c => state.selectedClassIds.has(c.id))
      }

      renderClassList()
    } catch (err) {
      state.error = err.message
      const errorEl = document.createElement('div')
      errorEl.className = 'ts-step-error'
      errorEl.textContent = `Error al cargar preview: ${err.message}`
      section.appendChild(errorEl)
    }

    state.loading = false
    return section
  }

  async function renderStep3() {
    const section = document.createElement('div')
    section.className = 'ts-step-students'

    state.loading = true

    try {
      const students = await getSourceStudents(state.sourcePeriodId)
      state.students = students

      const title = document.createElement('h3')
      title.textContent = `Seleccionar alumnos (${students.length})`
      section.appendChild(title)

      const classifier = createStudentClassifier(section, {
        students,
        onSelectionChange: (selected) => {
          state.selectedStudentIds = new Set(selected)
        },
      })
    } catch (err) {
      const errorEl = document.createElement('div')
      errorEl.className = 'ts-step-error'
      errorEl.textContent = `Error al cargar alumnos: ${err.message}`
      section.appendChild(errorEl)
    }

    state.loading = false
    return section
  }

  function renderStep4() {
    const section = document.createElement('div')
    section.className = 'ts-step-confirm'

    const title = document.createElement('h3')
    title.textContent = 'Confirmar transicion'
    section.appendChild(title)

    const summary = document.createElement('div')
    summary.className = 'ts-summary'

    const classCount = document.createElement('p')
    classCount.textContent = `Clases a clonar: ${state.selectedClassIds.size}`
    summary.appendChild(classCount)

    const studentCount = document.createElement('p')
    studentCount.textContent = `Alumnos a inscribir: ${state.selectedStudentIds.size}`
    summary.appendChild(studentCount)

    section.appendChild(summary)

    // Execute button
    const executeBtn = document.createElement('button')
    executeBtn.className = 'ts-execute-btn'
    executeBtn.textContent = 'Ejecutar transicion'
    executeBtn.addEventListener('click', async () => {
      executeBtn.disabled = true
      executeBtn.textContent = 'Ejecutando...'

      try {
        // 1. Clone classes
        const selectedClasses = state.classes.filter(c => state.selectedClassIds.has(c.id))
        const cloneResult = await cloneClasses(state.sourcePeriodId, state.targetPeriodId, {
          excludeClassIds: state.classes.filter(c => !state.selectedClassIds.has(c.id)).map(c => c.id),
          edits: state.classEdits,
          onProgress: (current, total) => {
            executeBtn.textContent = `Clonando clases... ${current}/${total}`
          },
        })

        // 2. Build class mapping for enrollment
        const classMapping = cloneResult.created.map((newClass, i) => ({
          sourceClassId: selectedClasses[i]?.id,
          targetClassId: newClass.id,
        }))

        // 3. Enroll students
        const enrollResult = await bulkEnrollStudents(state.sourcePeriodId, state.targetPeriodId, {
          classMapping,
          onProgress: (current, total) => {
            executeBtn.textContent = `Inscribiendo alumnos... ${current}/${total}`
          },
        })

        state.results = { cloneResult, enrollResult }
        executeBtn.textContent = 'Completado'
        onComplete?.(state.results)
      } catch (err) {
        state.error = err.message
        executeBtn.textContent = 'Error — reintentar'
        executeBtn.disabled = false
      }
    })
    section.appendChild(executeBtn)

    // Results display
    if (state.results) {
      const resultsEl = document.createElement('div')
      resultsEl.className = 'ts-results'
      const resultText = document.createElement('p')
      resultText.textContent = `Transicion completa: ${state.results.cloneResult.created.length} clases clonadas, ${state.results.enrollResult.enrolled} alumnos inscritos`
      resultsEl.appendChild(resultText)
      section.appendChild(resultsEl)
    }

    return section
  }

  async function renderStep() {
    el.innerHTML = ''

    // Step indicator
    el.appendChild(renderStepIndicator())

    // Step content
    const content = document.createElement('div')
    content.className = 'ts-step-content'

    switch (state.currentStep) {
      case 1:
        content.appendChild(renderStep1())
        break
      case 2:
        content.appendChild(await renderStep2())
        break
      case 3:
        content.appendChild(await renderStep3())
        break
      case 4:
        content.appendChild(renderStep4())
        break
    }

    el.appendChild(content)

    // Navigation
    el.appendChild(renderNavigation())
  }

  function getState() {
    return { ...state }
  }

  function destroy() {
    if (periodSelector) periodSelector.destroy()
    el.remove()
  }

  renderStep()
  container.appendChild(el)

  return { element: el, destroy, getState }
}
