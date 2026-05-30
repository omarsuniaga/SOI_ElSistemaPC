/**
 * Wizard State Machine — pure reducer, no DOM, no I/O.
 *
 * State shape:
 * {
 *   currentStep: number,        // 1-based
 *   totalSteps: number,
 *   maxReachedStep: number,     // highest step the user has visited
 *   draft: object,              // accumulated form data
 *   errors: object,             // current step's validation errors
 *   submitted: boolean,
 * }
 */

/**
 * Create the initial wizard state.
 *
 * @param {number} totalSteps
 * @returns {object}
 */
export function crearWizard(totalSteps) {
  return {
    currentStep: 1,
    totalSteps,
    maxReachedStep: totalSteps,
    draft: {},
    errors: {},
    submitted: false,
  }
}

/**
 * Attempt to advance to the next step.
 * Merges stepData into draft. Runs validateFn against the merged draft.
 * If validation fails, returns same state with errors set.
 * If already at last step, returns unchanged state.
 *
 * @param {object} state
 * @param {object} stepData - current step's form values
 * @param {function} validateFn - (draft) => { valid: boolean, errors: object }
 * @returns {object} new state
 */
export function avanzar(state, stepData, validateFn) {
  if (state.currentStep >= state.totalSteps) return state

  const mergedDraft = { ...state.draft, ...stepData }

  if (validateFn) {
    const { valid, errors } = validateFn(mergedDraft)
    if (!valid) {
      return {
        ...state,
        draft: mergedDraft,
        errors: errors || {},
      }
    }
  }

  const nextStep = state.currentStep + 1
  return {
    ...state,
    draft: mergedDraft,
    errors: {},
    currentStep: nextStep,
    maxReachedStep: Math.max(state.maxReachedStep, nextStep),
  }
}

/**
 * Go back to the previous step.
 * Always allowed (no validation on back). Clears errors.
 *
 * @param {object} state
 * @returns {object} new state
 */
export function retroceder(state) {
  if (state.currentStep <= 1) return { ...state, errors: {} }
  return { ...state, currentStep: state.currentStep - 1, errors: {} }
}

/**
 * Jump to an arbitrary step n.
 * Only allowed if n <= maxReachedStep and n >= 1.
 *
 * @param {object} state
 * @param {number} n - target step (1-based)
 * @returns {object} new state
 */
export function irAPaso(state, n) {
  if (n < 1 || n > state.maxReachedStep) return state
  return { ...state, currentStep: n, errors: {} }
}

/**
 * Mark the wizard as submitted.
 *
 * @param {object} state
 * @returns {object} new state
 */
export function marcarEnviado(state) {
  return { ...state, submitted: true }
}
