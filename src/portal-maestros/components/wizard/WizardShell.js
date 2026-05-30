/**
 * WizardShell — orchestrates the 5-step inscripción wizard.
 *
 * Mounts into a container, subscribes to state machine transitions,
 * saves draft on every change, renders step content.
 *
 * Design decisions:
 * - D1: pure state-machine reducer drives transitions
 * - D3: ConditionalField removes DOM nodes on hide
 * - D7: draft persisted to localStorage
 */

import { crearWizard, avanzar, retroceder, irAPaso, marcarEnviado } from './wizardStateMachine.js'
import { guardarBorrador, cargarBorrador, limpiarBorrador } from './draftStorage.js'
import { renderProgressBar } from './ProgressBar.js'
import { renderStepNav } from './StepNav.js'
import {
  descargarFichaAlumno,
  descargarConstancia,
} from '../../../modules/alumnos/domain/generarPdfInscripcion.js'
import { mountPreloadSearch } from './PreloadSearch.js'
import { supabase } from '../../../lib/supabaseClient.js'

/**
 * Render the static wizard shell (progress + nav + content area + footer buttons).
 *
 * @param {{ currentStep, totalSteps, title, content, canGoPrev, canGoNext,
 *           isLastStep, isLastRequiredStep, isLastOptionalStep, isOptionalStep,
 *           steps, maxReachedStep }} opts
 * @returns {string} HTML string
 */
export function renderWizardShell({
  currentStep,
  totalSteps,
  title,
  content,
  canGoPrev,
  canGoNext,
  isLastStep,
  isLastRequiredStep,
  isLastOptionalStep,
  isOptionalStep,
  steps,
  maxReachedStep,
}) {
  const progressBar = renderProgressBar({ currentStep, totalSteps })
  const stepNav = renderStepNav({ steps, currentStep, maxReachedStep })

  return `
    <div class="wizard-inscripcion container-fluid py-3">
      ${progressBar}
      ${stepNav}
      <div class="card shadow-sm">
        <div class="card-header">
          <h5 class="card-title mb-0">Paso ${currentStep} de ${totalSteps}: ${title}</h5>
        </div>
        <div class="card-body">
          <div id="wizard-step-slot">
            ${content}
          </div>
        </div>
        <div class="card-footer d-flex justify-content-between align-items-center gap-2 flex-wrap">
          <button
            type="button"
            id="wiz-btn-prev"
            class="btn btn-outline-secondary"
            ${!canGoPrev ? 'disabled' : ''}
          >
            <i class="bi bi-arrow-left"></i> Atrás
          </button>
          <button type="button" id="wiz-btn-draft" class="btn btn-outline-secondary btn-sm">
            <i class="bi bi-floppy"></i> Guardar borrador
          </button>
          <div class="d-flex gap-2 flex-wrap">
            ${
              isLastOptionalStep
                ? `<button type="button" id="wiz-btn-submit" class="btn btn-success">
                   <i class="bi bi-check-circle"></i> Finalizar inscripción completa
                 </button>`
                : isLastRequiredStep
                  ? `<button type="button" id="wiz-btn-submit-basic" class="btn btn-outline-success">
                     <i class="bi bi-check2"></i> Finalizar inscripción
                   </button>
                   <button type="button" id="wiz-btn-next" class="btn btn-primary">
                     Agregar perfil <i class="bi bi-arrow-right"></i>
                   </button>`
                  : isOptionalStep
                    ? `<button type="button" id="wiz-btn-submit-basic" class="btn btn-outline-secondary btn-sm">
                       <i class="bi bi-skip-forward"></i> Completar después
                     </button>
                     <button type="button" id="wiz-btn-next" class="btn btn-primary">
                       Siguiente <i class="bi bi-arrow-right"></i>
                     </button>`
                    : `<button type="button" id="wiz-btn-next" class="btn btn-primary">
                       Siguiente <i class="bi bi-arrow-right"></i>
                     </button>`
            }
          </div>
        </div>
      </div>
    </div>`
}

/**
 * Mount the wizard into a DOM container.
 *
 * @param {HTMLElement} container
 * @param {object[]} stepModules       - array of { id, title, render, validate, getState }
 * @param {function}  onSubmit         - async (draft) => alumno
 * @param {number}    [pasosObligatorios] - last required step (default: all steps required)
 * @returns {{ destroy: function }}
 */
export function mountWizard(container, stepModules, onSubmit, pasosObligatorios) {
  const required = pasosObligatorios ?? stepModules.length
  const savedDraft = cargarBorrador()
  let state = crearWizard(stepModules.length)

  if (savedDraft) {
    state = { ...state, draft: savedDraft }
  }

  function getCurrentStep() {
    return stepModules[state.currentStep - 1]
  }

  function render() {
    const step = getCurrentStep()
    const cur = state.currentStep
    const content = step.render(state.draft)

    container.innerHTML = renderWizardShell({
      currentStep: cur,
      totalSteps: state.totalSteps,
      title: step.title,
      content,
      canGoPrev: cur > 1,
      canGoNext: true,
      isLastStep: cur === state.totalSteps,
      isLastRequiredStep: cur === required,
      isLastOptionalStep: cur === state.totalSteps && cur > required,
      isOptionalStep: cur > required && cur < state.totalSteps,
      steps: stepModules.map((s, i) => ({
        id: s.id,
        title: s.title,
        optional: i >= required,
      })),
      maxReachedStep: state.maxReachedStep,
    })

    bindEvents()
  }

  async function doSubmit(btn) {
    if (btn) {
      btn.disabled = true
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...'
    }
    try {
      const step = getCurrentStep()
      const stepData = step.getState(container)
      state = { ...state, draft: { ...state.draft, ...stepData } }
      const alumnoGuardado = await onSubmit({
        ...state.draft,
        fecha_aceptacion_compromisos: new Date().toISOString(),
      })

      const postulanteId = state.draft._postulante_id
      if (postulanteId && alumnoGuardado?.id) {
        try {
          await supabase
            .from('postulantes')
            .update({ estado: 'inscrito', alumno_id: alumnoGuardado.id })
            .eq('id', postulanteId)
        } catch (_e) {
          console.warn('[Wizard] Could not update postulante estado:', _e.message)
        }
      }

      limpiarBorrador()
      state = marcarEnviado(state)

      const alumnoParaPdf = { ...state.draft, ...(alumnoGuardado ?? {}) }

      container.innerHTML = `
        <div class="card shadow-sm mt-4">
          <div class="card-body text-center py-4">
            <i class="bi bi-check-circle-fill text-success" style="font-size:3rem"></i>
            <h4 class="mt-3 text-success">¡Inscripción completada!</h4>
            <p class="text-muted mb-4">
              <strong>${alumnoParaPdf.nombre_completo ?? 'El alumno'}</strong> ha sido registrado exitosamente en El Sistema Punta Cana.
            </p>

            <div class="alert alert-warning text-start mb-4">
              <i class="bi bi-cash-coin me-2"></i>
              <strong>Próximo paso:</strong> Dirigirse a caja para realizar el pago de <strong>RD$600</strong> y recibir:
              tarjeta de pagos mensuales, horario de clases, lista de útiles y T-shirt del programa.
            </div>

            <div class="d-flex flex-wrap justify-content-center gap-3">
              <button id="btn-pdf-ficha" class="btn btn-primary btn-lg">
                <i class="bi bi-file-earmark-person me-2"></i>Descargar Ficha del Alumno
              </button>
              <button id="btn-pdf-constancia" class="btn btn-outline-primary btn-lg">
                <i class="bi bi-file-earmark-text me-2"></i>Descargar Constancia
              </button>
            </div>

            <p class="text-muted small mt-3">
              <i class="bi bi-printer me-1"></i>
              Imprime la ficha para la carpeta interna y la constancia para entregársela al representante.
            </p>
          </div>
        </div>`

      container.querySelector('#btn-pdf-ficha')?.addEventListener('click', () => {
        try {
          descargarFichaAlumno(alumnoParaPdf)
        } catch (e) {
          console.error('Error generando ficha:', e)
        }
      })
      container.querySelector('#btn-pdf-constancia')?.addEventListener('click', () => {
        try {
          descargarConstancia(alumnoParaPdf)
        } catch (e) {
          console.error('Error generando constancia:', e)
        }
      })
    } catch (_err) {
      if (btn) {
        btn.disabled = false
        btn.innerHTML = btn.dataset.label ?? 'Finalizar'
      }
      const slot = container.querySelector('#wizard-step-slot')
      if (slot) {
        const err = document.createElement('div')
        err.className = 'alert alert-danger mt-3'
        err.textContent = 'Error al guardar. Por favor intenta de nuevo.'
        slot.after(err)
      }
    }
  }

  function bindEvents() {
    const prevBtn = container.querySelector('#wiz-btn-prev')
    const nextBtn = container.querySelector('#wiz-btn-next')
    const submitBtn = container.querySelector('#wiz-btn-submit')
    const submitBasicBtn = container.querySelector('#wiz-btn-submit-basic')
    const draftBtn = container.querySelector('#wiz-btn-draft')

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        state = retroceder(state)
        render()
      })
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const step = getCurrentStep()
        const stepData = step.getState(container)
        state = avanzar(state, stepData)
        guardarBorrador(state.draft)
        render()
      })
    }

    if (submitBtn) {
      submitBtn.dataset.label = submitBtn.textContent
      submitBtn.addEventListener('click', () => doSubmit(submitBtn))
    }

    if (submitBasicBtn) {
      submitBasicBtn.dataset.label = submitBasicBtn.textContent
      submitBasicBtn.addEventListener('click', () => doSubmit(submitBasicBtn))
    }

    if (draftBtn) {
      draftBtn.addEventListener('click', () => {
        const step = getCurrentStep()
        const stepData = step.getState(container)
        state = { ...state, draft: { ...state.draft, ...stepData } }
        guardarBorrador(state.draft)
        draftBtn.textContent = '¡Guardado!'
        setTimeout(() => {
          draftBtn.innerHTML = '<i class="bi bi-floppy"></i> Guardar borrador'
        }, 1500)
      })
    }

    // Step nav click events
    const stepNavBtns = container.querySelectorAll('[data-step]')
    stepNavBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const n = parseInt(btn.getAttribute('data-step'), 10)
        const step = getCurrentStep()
        const stepData = step.getState(container)
        state = { ...state, draft: { ...state.draft, ...stepData } }
        guardarBorrador(state.draft)
        state = irAPaso(state, n)
        render()
      })
    })
  }

  mountPreloadSearch(container).then((prefilledDraft) => {
    if (prefilledDraft) {
      state = { ...state, draft: { ...state.draft, ...prefilledDraft } }
    }
    render()
  })

  return {
    destroy() {
      container.innerHTML = ''
    },
  }
}
