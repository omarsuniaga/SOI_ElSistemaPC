import { supabase } from '../../../lib/supabaseClient.js'
import { registrarPago } from '../api/finanzasApi.js'

export async function renderRegistroPagosView(container) {
  const _ac = new AbortController()

  container.innerHTML = '<p class="p-4">Cargando alumnos...</p>'

  const { data: alumnos, error } = await supabase
    .from('alumnos')
    .select('id, nombre_completo')
    .eq('activo', true)
    .order('nombre_completo')

  if (error) {
    container.innerHTML = `<div class="alert alert-danger m-4">Error al cargar alumnos: ${error.message}</div>`
    return { teardown: () => _ac.abort() }
  }

  const alumnoOptions = alumnos
    .map(a => `<option value="${a.id}">${a.nombre_completo}</option>`)
    .join('')

  // Default periodo_mes = first day of current month
  const today = new Date()
  const defaultPeriodo = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`

  container.innerHTML = `
    <div class="container-fluid p-4">
      <div class="d-flex align-items-center gap-2 mb-4">
        <button id="btn-back" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-left"></i>
        </button>
        <h4 class="mb-0"><i class="bi bi-cash-coin me-2"></i>Registrar Pago</h4>
      </div>

      <div class="card shadow-sm" style="max-width:540px">
        <div class="card-body">
          <form id="form-pago" novalidate>
            <div class="mb-3">
              <label class="form-label fw-semibold">Alumno</label>
              <select class="form-select" name="alumno_id" required>
                <option value="">— Seleccionar alumno —</option>
                ${alumnoOptions}
              </select>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="form-label fw-semibold">Monto (RD$)</label>
                <input type="number" class="form-control" name="monto" min="1" step="0.01" required placeholder="600.00" />
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">Concepto</label>
                <select class="form-select" name="concepto" required>
                  <option value="mensualidad">Mensualidad</option>
                  <option value="inscripcion">Inscripción</option>
                  <option value="uniforme">Uniforme</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="form-label fw-semibold">Período (mes cubierto)</label>
                <input type="date" class="form-control" name="periodo_mes" value="${defaultPeriodo}" required />
                <div class="form-text">Primer día del mes que cubre este pago.</div>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">Método de pago</label>
                <select class="form-select" name="metodo_pago" required>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="deposito">Depósito</option>
                  <option value="beca">Beca</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Referencia / N° transacción</label>
              <input type="text" class="form-control" name="referencia_transaccion" placeholder="Opcional" />
            </div>

            <div id="form-error" class="alert alert-danger d-none"></div>
            <div id="form-success" class="alert alert-success d-none"></div>

            <button type="submit" id="btn-submit" class="btn btn-primary w-100">
              <i class="bi bi-save me-1"></i> Registrar Pago
            </button>
          </form>
        </div>
      </div>
    </div>
  `

  const form = container.querySelector('#form-pago')
  const errEl = container.querySelector('#form-error')
  const okEl = container.querySelector('#form-success')

  container.querySelector('#btn-back')?.addEventListener('click', () => {
    window.router?.navigate('finanzas-balance')
  }, { signal: _ac.signal })

  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    errEl.classList.add('d-none')
    okEl.classList.add('d-none')

    const fd = new FormData(form)
    const alumno_id = fd.get('alumno_id')
    const monto = parseFloat(fd.get('monto'))
    const concepto = fd.get('concepto')
    const periodo_mes = fd.get('periodo_mes')
    const metodo_pago = fd.get('metodo_pago')
    const referencia_transaccion = fd.get('referencia_transaccion') || null

    if (!alumno_id || !monto || !concepto || !periodo_mes || !metodo_pago) {
      errEl.textContent = 'Completá todos los campos requeridos.'
      errEl.classList.remove('d-none')
      return
    }

    const btn = container.querySelector('#btn-submit')
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...'

    const { data: session } = await supabase.auth.getSession()
    const registrado_por = session?.session?.user?.id ?? null

    const { error: saveErr } = await registrarPago({
      alumno_id, monto, concepto, periodo_mes, metodo_pago,
      referencia_transaccion, registrado_por
    })

    btn.disabled = false
    btn.innerHTML = '<i class="bi bi-save me-1"></i> Registrar Pago'

    if (saveErr) {
      errEl.textContent = saveErr.message.includes('uix_pagos_mensualidad_mes')
        ? 'Ya existe una mensualidad registrada para este alumno en ese período.'
        : saveErr.message
      errEl.classList.remove('d-none')
    } else {
      okEl.textContent = 'Pago registrado correctamente.'
      okEl.classList.remove('d-none')
      form.reset()
      form.querySelector('[name="periodo_mes"]').value = defaultPeriodo
    }
  }, { signal: _ac.signal })

  return { teardown: () => _ac.abort() }
}
