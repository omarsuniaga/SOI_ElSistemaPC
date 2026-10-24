import { AppToast } from '../../../shared/components/AppToast.js'
import { createRecordExemption, revokeRecordExemption, getClassValidity, saveClassValidity } from '../api/recordExemptionsAdapter.js'
import { escapeHTML as esc } from '../../../shared/utils/sanitize.js'

/** One transaction per administrative decision; success is shown only after persistence. */
export async function openRecordExemptionDialog({ row, maestroId, exemptions = [], onSaved, validity = false }) {
  const dialog = document.createElement('dialog')
  dialog.setAttribute('aria-label', validity ? 'Vigencia de la clase' : 'Exonerar clase')
  dialog.style.cssText = 'max-width:600px;width:calc(100% - 24px);max-height:90vh;overflow:auto;border:1px solid var(--bs-border-color,#ddd);border-radius:16px;padding:24px;background:var(--bs-body-bg,#fff);color:var(--bs-body-color,#222)'
  document.body.append(dialog)
  const restoreFocus = document.activeElement
  const close = () => { dialog.remove(); restoreFocus?.focus() }
  dialog.addEventListener('cancel', close)
  dialog.innerHTML = '<p role="status">Cargando…</p><button type="button" data-close>Cerrar</button>'
  dialog.querySelector('[data-close]').onclick = close
  if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '')
  try {
    const data = validity ? await getClassValidity(row.clase_id) : null
    if (!dialog.isConnected) return
    const history = exemptions.filter(x => x.clase_id === row.clase_id && x.fecha === row.fecha)
    dialog.innerHTML = `<form>
      <h3>${validity ? 'Vigencia de la clase' : 'Exonerar clase'}</h3>
      <p class="small text-muted mb-1">${validity ? 'Configuración de vigencia' : 'Paso 2 de 2 · Motivo y confirmación'}</p><p class="fw-semibold">${esc(row.clase_nombre)} · ${esc(new Intl.DateTimeFormat('es-DO',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${row.fecha}T12:00:00Z`)))}</p>
      ${validity ? `<p>Vacío: se usa la fecha de creación en Santo Domingo. Los registros históricos reales se conservan.</p>
        <label>Inicio efectivo de la clase <input class="form-control" name="start" type="date" value="${esc(data.clase.fecha_inicio || '')}"></label>
        ${data.horarios.map((h, i) => `<fieldset class="border rounded p-2 mt-2"><legend class="fs-6">${esc(h.dia)} ${esc(h.hora_inicio || '')}</legend>
          <label>Desde <input class="form-control" name="from-${i}" type="date" value="${esc(h.vigente_desde || '')}"></label>
          <label>Hasta (inclusive) <input class="form-control" name="to-${i}" type="date" value="${esc(h.vigente_hasta || '')}"></label></fieldset>`).join('')}` : `
        <p>Libera la obligación seleccionada. No crea contenido ni marca alumnos presentes.</p>
        <label>Obligación <select class="form-select" name="scope"><option value="ambos">Asistencia y contenido</option><option value="asistencia">Solo asistencia</option><option value="contenido">Solo contenido</option></select></label>
        <label class="d-block mt-2">Motivo obligatorio <textarea class="form-control" name="reason" required minlength="10" maxlength="2000" rows="3"></textarea></label>
        ${history.length ? `<h4 class="fs-6 mt-3">Historial de decisiones</h4>${history.map(x => `<div class="border rounded p-2 mt-2"><strong>${esc(x.alcance)} · ${x.revocado_en ? 'Revocada' : 'Activa'}</strong><p>${esc(x.motivo)}</p><small>Autor: ${esc(x.creado_por)} · ${esc(x.creado_en)}</small>${x.revocado_en ? `<p>Revocación: ${esc(x.motivo_revocacion)} · ${esc(x.revocado_por)} · ${esc(x.revocado_en)}</p>` : `<button type="button" class="btn btn-sm btn-outline-danger d-block" data-revoke="${esc(x.id)}">Revocar con motivo</button>`}</div>`).join('')}` : ''}`}
      <p role="alert" class="text-danger" data-error></p>
      <div class="d-flex flex-wrap gap-2 mt-3"><button type="button" class="btn btn-outline-secondary" data-close>Cancelar</button>
      <button type="submit" class="btn btn-primary">${validity ? 'Guardar vigencia' : 'Confirmar exoneración'}</button></div>
    </form>`
    const form = dialog.querySelector('form')
    let revokeId = null
    dialog.querySelector('[data-close]').onclick = close
    dialog.querySelectorAll('[data-revoke]').forEach(button => button.onclick = () => {
      revokeId = button.dataset.revoke
      form.querySelector('[name=reason]').focus()
      form.querySelector('[type=submit]').textContent = 'Confirmar revocación'
      form.querySelector('[data-error]').textContent = 'Escriba el motivo de la revocación en el campo obligatorio.'
    })
    let saving = false
    form.onsubmit = async (event) => {
      event.preventDefault()
      if (saving || !form.reportValidity()) return
      saving = true
      const buttons = form.querySelectorAll('button')
      buttons.forEach(b => { b.disabled = true })
      try {
        const fields = new FormData(form)
        if (validity) await saveClassValidity(row.clase_id, fields.get('start'), data.horarios.map((h, i) => ({ id: h.id, vigente_desde: fields.get(`from-${i}`) || null, vigente_hasta: fields.get(`to-${i}`) || null })))
        else if (revokeId) await revokeRecordExemption(revokeId, fields.get('reason'))
        else await createRecordExemption({ claseId: row.clase_id, maestroId, fecha: row.fecha, alcance: fields.get('scope'), motivo: fields.get('reason') })
        close()
        AppToast.show(validity ? 'Vigencia guardada.' : revokeId ? 'Exoneración revocada.' : 'Exoneración registrada correctamente.', 'success')
        await onSaved?.()
      } catch (error) {
        form.querySelector('[data-error]').textContent = error.message
      } finally { saving = false; buttons.forEach(b => { b.disabled = false }) }
    }
  } catch (error) {
    dialog.innerHTML = `<p role="alert">${esc(error.message)}</p><button data-close>Cerrar</button>`
    dialog.querySelector('[data-close]').onclick = close
  }
}
