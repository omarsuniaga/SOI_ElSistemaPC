/**
 * ProgressBar — Bootstrap 5.3 progress bar reflecting wizard step progress.
 */

/**
 * Render the wizard progress bar.
 *
 * @param {{ currentStep: number, totalSteps: number }} opts
 * @returns {string} HTML string
 */
export function renderProgressBar({ currentStep, totalSteps }) {
  const pct = Math.round((currentStep / totalSteps) * 100)
  return `
    <div class="progress mb-3" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Progreso del formulario">
      <div class="progress-bar" style="width: ${pct}%">${pct}%</div>
    </div>`
}
