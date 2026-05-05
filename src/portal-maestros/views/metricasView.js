/**
 * Vista Métricas — implementación completa en F7.
 * @param {HTMLElement} container
 */
export function renderMetricasView(container) {
  container.innerHTML = `
    <div class="pm-empty">
      <div style="font-size:2.5rem;margin-bottom:.5rem;">📊</div>
      <p>Métricas disponibles próximamente.</p>
      <small style="color:var(--pm-text-muted)">Esta vista se completa en Fase 7.</small>
    </div>
  `
}
