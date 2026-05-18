/**
 * EmptyCurriculumState — renders a contextual empty state for curriculum views.
 *
 * @param {{ reason?: string }} options
 * @returns {string} HTML string
 */
export function EmptyCurriculumState({ reason } = {}) {
  const messages = {
    no_instrument: 'Esta clase no tiene instrumento asignado. Configurala desde Clases.',
    no_route: 'No hay ruta académica para este instrumento aún. Contactá al coordinador.',
    error: 'No se pudo cargar el currículo. Intentá de nuevo.',
  }

  const icons = {
    no_instrument: 'bi-music-note-beamed',
    no_route: 'bi-signpost',
    error: 'bi-exclamation-triangle',
  }

  const message = messages[reason] ?? 'No hay información curricular disponible para esta clase.'
  const icon = icons[reason] ?? 'bi-info-circle'

  return `
    <div class="pm-empty-curriculum-state" role="status" aria-live="polite">
      <i class="bi ${icon} pm-empty-curriculum-icon"></i>
      <p class="pm-empty-curriculum-message">${message}</p>
    </div>
  `
}
