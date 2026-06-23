import { obtenerComodatosActivos, obtenerActivos, intercambiarInstrumentos } from '../api/inventarioApi.js'

export async function renderIntercambioInstrumentosView(container) {
  const _ac = new AbortController()
  let step = 1; let selectedComodato = null; let selectedActivoDestino = null

  container.innerHTML = '<p class="p-4">Cargando...</p>'
  const { data: comodatos } = await obtenerComodatosActivos()
  const { data: activosResult } = await obtenerActivos({ pageSize: 200 })
  const activos = activosResult?.data || activosResult || []
  const activeComodatos = (comodatos || []).filter(c => c.estado === 'activo')
  renderWizard()

  function renderWizard() {
    container.innerHTML = [
      '<div class="container-fluid p-4">',
      '<div class="d-flex justify-content-between align-items-center mb-4">',
      '<h4 class="mb-0"><i class="bi bi-arrow-left-right me-2"></i>Intercambio de instrumentos</h4>',
      '<button id="btn-cancelar-intercambio" class="btn btn-outline-secondary btn-sm"><i class="bi bi-x-lg me-1"></i> Cancelar</button>',
      '</div>',
      '<div class="card shadow-sm"><div class="card-body">',
      '<ul class="nav nav-pills nav-justified mb-4">',
      '<li class="nav-item"><span class="nav-link' + (step >= 1 ? ' active' : ' disabled') + '">Paso 1: Seleccionar alumno</span></li>',
      '<li class="nav-item"><span class="nav-link' + (step >= 2 ? ' active' : ' disabled') + '">Paso 2: Seleccionar destino</span></li>',
      '<li class="nav-item"><span class="nav-link' + (step >= 3 ? ' active' : ' disabled') + '">Paso 3: Confirmaci\u00f3n</span></li>',
      '</ul>',
      '<div id="paso-1" class="step-pane"' + (step === 1 ? '' : ' style="display:none"') + '>',
      '<h5>Seleccion\u00e1 el alumno con comodato activo</h5>',
      '<select id="select-comodato-origen" class="form-select form-select-lg mb-3">',
      '<option value="">\u2014 Seleccionar alumno/instrumento \u2014</option>',
      activeComodatos.map(c => '<option value="' + c.id + '">' + (c.alumno_nombre || c.alumno_id || 'Alumno') + ' \u2014 ' + ((c.inventario_activos && c.inventario_activos.codigo_inventario) || c.activo_id || '---') + '</option>').join(''),
      '</select>',
      '<button id="btn-paso-1" class="btn btn-primary" disabled><i class="bi bi-arrow-right me-1"></i> Siguiente</button>',
      '</div>',
      '<div id="paso-2" class="step-pane"' + (step === 2 ? '' : ' style="display:none"') + '>',
      '<h5>Seleccion\u00e1 el instrumento destino</h5>',
      '<select id="select-activo-destino" class="form-select form-select-lg mb-3">',
      '<option value="">\u2014 Seleccionar instrumento \u2014</option>',
      activos.filter(a => a.estado_uso !== 'de_baja' && a.estado_uso !== 'en_reparacion').map(a => '<option value="' + a.id + '">' + (a.codigo_inventario || a.id) + ' \u2014 ' + (a.tipo_instrumento || '') + '</option>').join(''),
      '</select>',
      '<button id="btn-paso-2" class="btn btn-primary" disabled><i class="bi bi-arrow-right me-1"></i> Siguiente</button>',
      '</div>',
      '<div id="paso-3" class="step-pane"' + (step === 3 ? '' : ' style="display:none"') + '>',
      '<h5>Resumen del intercambio</h5>',
      '<div class="alert alert-info"><p class="mb-1"><strong>Origen:</strong> <span id="resumen-origen">---</span></p><p class="mb-1"><strong>Destino:</strong> <span id="resumen-destino">---</span></p></div>',
      '<div class="d-flex gap-2"><button id="btn-atras" class="btn btn-outline-secondary"><i class="bi bi-arrow-left me-1"></i> Atr\u00e1s</button><button id="btn-confirmar-intercambio" class="btn btn-success"><i class="bi bi-check-lg me-1"></i> Confirmar intercambio</button></div>',
      '</div>',
      '</div></div>',
      '<div id="resultado-intercambio" class="d-none"></div>',
      '</div>',
    ].join('\n')
    bindWizard()
  }

  function bindWizard() {
    container.querySelector('#select-comodato-origen')?.addEventListener('change', () => {
      container.querySelector('#btn-paso-1').disabled = !container.querySelector('#select-comodato-origen').value
    }, { signal: _ac.signal })
    container.querySelector('#btn-paso-1')?.addEventListener('click', () => {
      const sel = container.querySelector('#select-comodato-origen')
      selectedComodato = activeComodatos.find(c => c.id === sel.value); if (!selectedComodato) return
      step = 2; renderWizard()
    }, { signal: _ac.signal })
    container.querySelector('#select-activo-destino')?.addEventListener('change', () => {
      container.querySelector('#btn-paso-2').disabled = !container.querySelector('#select-activo-destino').value
    }, { signal: _ac.signal })
    container.querySelector('#btn-paso-2')?.addEventListener('click', () => {
      selectedActivoDestino = activos.find(a => a.id === container.querySelector('#select-activo-destino').value); if (!selectedActivoDestino) return
      step = 3; renderWizard()
      const o = container.querySelector('#resumen-origen'); if (o && selectedComodato) o.textContent = (selectedComodato.alumno_nombre || 'Alumno') + ' entrega: ' + ((selectedComodato.inventario_activos && selectedComodato.inventario_activos.codigo_inventario) || selectedComodato.activo_id || '---')
      const d = container.querySelector('#resumen-destino'); if (d && selectedActivoDestino) d.textContent = 'Recibe: ' + (selectedActivoDestino.codigo_inventario || selectedActivoDestino.id) + ' \u2014 ' + (selectedActivoDestino.tipo_instrumento || '')
    }, { signal: _ac.signal })
    container.querySelector('#btn-atras')?.addEventListener('click', () => { if (step > 1) { step--; renderWizard() } }, { signal: _ac.signal })
    container.querySelector('#btn-confirmar-intercambio')?.addEventListener('click', async () => {
      if (!selectedComodato || !selectedActivoDestino) return
      const btn = container.querySelector('#btn-confirmar-intercambio'); btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Procesando...'
      const { data, error } = await intercambiarInstrumentos(selectedComodato.id, selectedActivoDestino.id, selectedComodato.alumno_id)
      btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-lg me-1"></i> Confirmar intercambio'
      if (error) { alert('Error: ' + error.message); return }
      const resultDiv = container.querySelector('#resultado-intercambio'); resultDiv.classList.remove('d-none')
      resultDiv.innerHTML = '<div class="alert alert-success mt-3"><h5><i class="bi bi-check-circle me-1"></i> Intercambio realizado</h5><p>El intercambio se registr\u00f3 correctamente.</p><button onclick="window.router?.navigate(\'inventario-comodatos\')" class="btn btn-outline-primary btn-sm"><i class="bi bi-arrow-left me-1"></i> Volver a Comodatos</button></div>'
    }, { signal: _ac.signal })
    container.querySelector('#btn-cancelar-intercambio')?.addEventListener('click', () => { window.router?.navigate('inventario-comodatos') }, { signal: _ac.signal })
  }
  return { teardown: () => _ac.abort() }
}
