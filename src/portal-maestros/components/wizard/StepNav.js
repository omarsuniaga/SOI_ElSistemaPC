/**
 * StepNav — Bootstrap 5.3 nav-pills step indicator for the wizard.
 * Steps already visited (index <= maxReachedStep) are clickable.
 */

/**
 * @typedef {{ id: string, title: string }} StepDefinition
 */

/**
 * Render the step nav pills.
 *
 * @param {{ steps: StepDefinition[], currentStep: number, maxReachedStep: number }} opts
 * @returns {string} HTML string
 */
export function renderStepNav({ steps, currentStep, maxReachedStep }) {
  const items = steps
    .map((step, index) => {
      const stepNum = index + 1
      const isActive = stepNum === currentStep
      const isVisited = stepNum <= maxReachedStep
      const activeClass = isActive ? 'active' : ''
      const disabledAttr = !isVisited ? 'disabled aria-disabled="true"' : ''
      const dataStep = `data-step="${stepNum}"`
      return `
        <li class="nav-item" role="presentation">
          <button
            class="nav-link ${activeClass}"
            type="button"
            ${dataStep}
            ${disabledAttr}
            aria-label="Paso ${stepNum}: ${step.title}"
          >
            <span class="d-none d-md-inline">${stepNum}. ${step.title}</span>
            <span class="d-md-none">${stepNum}</span>
          </button>
        </li>`
    })
    .join('')

  return `<ul class="nav nav-pills nav-fill mb-3 flex-wrap">${items}</ul>`
}
