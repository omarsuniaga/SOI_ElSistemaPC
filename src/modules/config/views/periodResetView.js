import {
  DEFAULT_CUTOFF, confirmationPhrase, executePeriodReset, getPeriodResetStatus, listResetPeriods,
  preparePeriodResetBackup, previewPeriodReset,
} from '../api/periodResetApi.js'

const preserved = ['Sesiones y contenidos', 'Alumnos, maestros y clases', 'Horarios y matrículas', 'Currículo', 'Ausencias', 'Notificaciones generales']

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character])
}

export async function renderPeriodResetView(container) {
  container.innerHTML = `<main class="container py-4" aria-labelledby="reset-title">
    <h2 id="reset-title"><i class="bi bi-shield-check me-2"></i>Inicio seguro de período</h2>
    <p class="text-muted">Vista previa, respaldo auditable para recuperación por base de datos y ejecución atómica. Ningún dato cambia durante la vista previa.</p>
    <div class="alert alert-warning"><strong>Operación destructiva.</strong> Revise el alcance y complete ambas confirmaciones.</div>
    <form id="reset-plan" class="card card-body mb-3">
      <div class="row g-3"><div class="col-md-4"><label class="form-label" for="reset-cutoff">Fecha de corte</label><input id="reset-cutoff" type="date" class="form-control" value="${DEFAULT_CUTOFF}" required></div>
      <div class="col-md-8"><label class="form-label" for="reset-period">Período objetivo</label><select id="reset-period" class="form-select" required><option value="">Cargando…</option></select></div></div>
      <button id="preview-reset" class="btn btn-primary mt-3" type="submit">Generar vista previa</button>
    </form>
    <section id="reset-result" aria-live="polite"></section>
  </main>`

  const form = container.querySelector('#reset-plan')
  const periodSelect = container.querySelector('#reset-period')
  const result = container.querySelector('#reset-result')
  try {
    const periods = await listResetPeriods()
    periodSelect.innerHTML = '<option value="">Seleccione un período</option>' + periods.map(p => `<option value="${escapeHtml(p.id)}" ${p.nombre === 'Semestre 2026-II' ? 'selected' : ''}>${escapeHtml(p.nombre)} (${escapeHtml(p.fecha_inicio)})${p.activo ? ' · activo' : ''}</option>`).join('')
  } catch (error) {
    result.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const button = container.querySelector('#preview-reset')
    button.disabled = true
    result.innerHTML = '<div class="alert alert-info">Calculando alcance…</div>'
    try {
      const cutoff = container.querySelector('#reset-cutoff').value
      const preview = await previewPeriodReset(cutoff, periodSelect.value)
      renderPreview(result, preview, cutoff)
    } catch (error) {
      result.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`
    } finally { button.disabled = false }
  })
}

function renderPreview(container, preview, cutoff) {
  const blockers = preview.blockers || []
  const counts = preview.counts || {}
  container.innerHTML = `<div class="card card-body">
    <h3 class="h5">Vista previa</h3>
    ${blockers.length ? `<div class="alert alert-danger"><strong>Bloqueos:</strong><ul>${blockers.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div>` : ''}
    <dl class="row">${Object.entries(counts).map(([k, v]) => `<dt class="col-8">${escapeHtml(k.replaceAll('_', ' '))}</dt><dd class="col-4 text-end">${escapeHtml(v)}</dd>`).join('')}</dl>
    <h4 class="h6">Se preservará</h4><ul>${preserved.map(x => `<li>${x}</li>`).join('')}</ul>
    <button id="prepare-backup" type="button" class="btn btn-outline-primary" ${blockers.length ? 'disabled' : ''}>Preparar respaldo auditable</button>
    <div id="execute-zone" class="mt-3"></div></div>`
  container.querySelector('#prepare-backup')?.addEventListener('click', async (event) => {
    event.currentTarget.disabled = true
    const zone = container.querySelector('#execute-zone')
    zone.innerHTML = '<div class="alert alert-info">Creando respaldo…</div>'
    try {
      await preparePeriodResetBackup(preview.run_id)
      const phrase = confirmationPhrase(cutoff)
      zone.innerHTML = `<div class="alert alert-success">Respaldo preparado para la ejecución <code>${escapeHtml(preview.run_id)}</code>.</div>
        <label class="form-label" for="reset-phrase">Escriba <strong>${escapeHtml(phrase)}</strong></label>
        <input id="reset-phrase" class="form-control" autocomplete="off">
        <div class="form-check mt-3"><input id="reset-ack" class="form-check-input" type="checkbox"><label for="reset-ack" class="form-check-label">Confirmo que revisé el alcance y el respaldo.</label></div>
        <button id="execute-reset" type="button" class="btn btn-danger mt-3" disabled>Ejecutar reinicio</button>`
      const input = zone.querySelector('#reset-phrase'); const ack = zone.querySelector('#reset-ack'); const execute = zone.querySelector('#execute-reset')
      const sync = () => { execute.disabled = input.value !== phrase || !ack.checked }
      input.addEventListener('input', sync); ack.addEventListener('change', sync)
      execute.addEventListener('click', async () => {
        execute.disabled = true; input.disabled = true; ack.disabled = true
        zone.insertAdjacentHTML('beforeend', '<div id="execution-status" class="alert alert-info mt-3">Ejecutando transacción y verificando…</div>')
        try {
          const response = await executePeriodReset(preview.run_id, input.value)
          zone.querySelector('#execution-status').className = 'alert alert-success mt-3'
          zone.querySelector('#execution-status').textContent = `Completado. Ejecución ${response.run_id}.`
        } catch (error) {
          const statusBox = zone.querySelector('#execution-status')
          try {
            const run = await getPeriodResetStatus(preview.run_id)
            if (run.status === 'completed') {
              statusBox.className = 'alert alert-success mt-3'
              statusBox.textContent = `Completado y reconciliado después de perder la respuesta. Ejecución ${run.run_id}.`
              return
            }
            statusBox.className = 'alert alert-danger mt-3'
            statusBox.textContent = `${error.message} Estado del servidor: ${run.status}.`
            if (run.status === 'backed_up') { execute.disabled = false; input.disabled = false; ack.disabled = false }
          } catch {
            statusBox.className = 'alert alert-danger mt-3'
            statusBox.textContent = `${error.message} No fue posible reconciliar el estado; conserve el ID ${preview.run_id}.`
          }
        }
      })
    } catch (error) { zone.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`; event.currentTarget.disabled = false }
  })
}
