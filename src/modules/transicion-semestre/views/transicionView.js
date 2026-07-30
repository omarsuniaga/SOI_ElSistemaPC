import { createTransitionWizard } from '../components/TransitionWizard.js'

/**
 * transicionView.js — Entry point for the Semester Transition wizard route.
 *
 * Mounts the TransitionWizard into the router-provided container and exposes
 * a destroy handle for cleanup when the route is navigated away.
 *
 * @param {HTMLElement} container - Render target managed by the router
 * @returns {{ destroy: () => void }}
 */
export function init(container) {
  const wizard = createTransitionWizard(container)

  return {
    destroy: () => {
      wizard.destroy()
    },
  }
}
