import { PASSAGE_FOCUS_TAGS } from '../../modules/repertoire/domain/passages.js'

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))

export function renderSessionRepertoirePanel(container, { sessionId, adapter, montajeOptions = [], initialRecords = [], createdBy = null } = {}) {
  if (!container) return { destroy() {} }
  const records = [...initialRecords]
  let selectedWorkId = null
  const render = () => {
    container.innerHTML = `<section class="session-repertoire-panel" aria-labelledby="session-repertoire-title"><h3 id="session-repertoire-title">Repertorio trabajado</h3>${sessionId ? `<form class="session-repertoire-form"><label>Montaje <select name="montajeId" required><option value="">Seleccione</option>${montajeOptions.map((montaje) => `<option value="${escape(montaje.id)}">${escape(montaje.obra?.titulo || montaje.nombre || montaje.id)}</option>`).join('')}</select></label><label>Fila <select name="filaId"><option value="">Todas / no especificada</option></select></label><label>Pasaje (opcional) <select name="passageId"><option value="">Sin pasaje</option></select></label><label>Compases <input name="measureIds" placeholder="20-35 o 44,48,52,56" required></label><fieldset><legend>Foco pedagógico</legend>${PASSAGE_FOCUS_TAGS.map((tag) => `<label><input type="checkbox" name="focusTags" value="${tag}"> ${tag}</label>`).join('')}</fieldset><label>Notas <textarea name="notes" rows="2"></textarea></label><div class="session-repertoire-tempos"><label>Tempo actual <input name="tempoActual" type="number" min="1"></label><label>Tempo objetivo <input name="tempoObjetivo" type="number" min="1"></label></div><button type="submit" class="btn btn-primary">Guardar repertorio trabajado</button><p class="session-repertoire-status" role="status"></p></form>` : '<p class="session-repertoire-status">Guarde o abra una sesión existente para registrar repertorio.</p>'}<div class="session-repertoire-history" aria-live="polite">${records.map((record) => `<article><strong>${escape(record.montageName || record.montaje_id)}</strong> · cc. ${escape(record.measureIds?.join(', '))}<br><small>${escape(record.focusTags?.join(' / '))}${record.notes ? ` · ${escape(record.notes)}` : ''}</small></article>`).join('')}</div></section>`
    if (records.length) {
      const label = document.createElement('label')
      label.textContent = 'Relacionar con repertorio trabajado '
      const selector = document.createElement('select')
      selector.className = 'session-repertoire-observation-select'
      selector.innerHTML = '<option value="">Ninguno</option>' + records.map((record) => `<option value="${escape(record.id)}">${escape(record.montageName || record.montaje_id)} · cc. ${escape(record.measureIds?.join(', '))}</option>`).join('')
      selector.value = selectedWorkId || ''
      selector.addEventListener('change', (event) => { selectedWorkId = event.target.value || null })
      label.append(selector)
      container.querySelector('.session-repertoire-history')?.after(label)
    }
    const form = container.querySelector('form')
    const montajeSelect = form?.querySelector('[name="montajeId"]')
    const filaSelect = form?.querySelector('[name="filaId"]')
    const passageSelect = form?.querySelector('[name="passageId"]')
    montajeSelect?.addEventListener('change', () => { const montage = montajeOptions.find((item) => item.id === montajeSelect.value); filaSelect.innerHTML = '<option value="">Todas / no especificada</option>' + (montage?.filas || []).map((fila) => `<option value="${escape(fila.id)}">${escape(fila.nombre)}</option>`).join(''); passageSelect.innerHTML = '<option value="">Sin pasaje</option>' + (montage?.passages || []).filter((passage) => !passage.archived_at).map((passage) => `<option value="${escape(passage.id)}">${escape(passage.name || passage.nombre)}</option>`).join('') })
    form?.addEventListener('submit', async (event) => { event.preventDefault(); const data = new FormData(form); const rawMeasures = String(data.get('measureIds') || '').trim(); const measureIds = rawMeasures.includes('-') ? (() => { const [start, end] = rawMeasures.split('-').map(Number); return Array.from({ length: end - start + 1 }, (_, index) => String(start + index)) })() : rawMeasures.split(',').map((measure) => measure.trim()).filter(Boolean); const payload = { sessionId, montajeId: data.get('montajeId'), createdBy: createdBy || adapter.currentMaestroId || 'session-user', filaId: data.get('filaId') || null, passageId: data.get('passageId') || null, measureIds, focusTags: data.getAll('focusTags'), notes: data.get('notes') || '', tempoActual: data.get('tempoActual') ? Number(data.get('tempoActual')) : null, tempoObjetivo: data.get('tempoObjetivo') ? Number(data.get('tempoObjetivo')) : null }; const status = form.querySelector('.session-repertoire-status'); try { const saved = await adapter.createSessionRepertoireWork(payload); records.push({ ...saved, measureIds, focusTags: payload.focusTags, notes: payload.notes, montageName: montajeOptions.find((item) => item.id === payload.montajeId)?.obra?.titulo }); if (saved.id && adapter.addSessionRepertoireWorkMeasures) await adapter.addSessionRepertoireWorkMeasures(saved.id, measureIds); render() } catch (error) { status.textContent = error.message } })
  }
  render()
  if (sessionId && adapter?.historyBySession) adapter.historyBySession(sessionId).then((history = []) => { if (!history.length) return; records.splice(0, records.length, ...history.map((record) => ({ ...record, measureIds: record.measureIds || record.sesion_repertorio_trabajo_compases?.map((item) => item.montaje_compas_id) || [], focusTags: record.focusTags || record.focus_tags || [], notes: record.notes || record.notas || '', montageName: montajeOptions.find((item) => item.id === record.montaje_id)?.obra?.titulo || record.montaje_id }))); render() }).catch(() => {})
  return { destroy() { container.innerHTML = '' }, getRecords: () => [...records], getSelectedWorkId: () => selectedWorkId }
}
