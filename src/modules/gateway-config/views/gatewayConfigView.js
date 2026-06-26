import { obtenerGatewayConfig, actualizarGatewayConfig } from '../api/gatewayApi.js'

const state = {
  config: null,
  edit: {},
  cargando: true,
}

export async function renderGatewayConfigView(container) {
  try {
    state.cargando = true
    state.config = await obtenerGatewayConfig()
    render(container)
  } catch (err) {
    renderError(container, err.message)
  } finally {
    state.cargando = false
  }
}

async function guardarCambios(container) {
  if (!Object.keys(state.edit).length) return
  try {
    state.cargando = true
    state.config = await actualizarGatewayConfig(state.edit)
    state.edit = {}
    render(container)
  } catch (err) {
    renderError(container, err.message)
  } finally {
    state.cargando = false
  }
}

function render(container) {
  const { config, edit, cargando } = state
  container.innerHTML = `
    <div style="max-width: 700px; font-family: monospace;">
      <h1>Gateway WhatsApp (Baileys) — Subsistema 4</h1>
      ${
        !config
          ? '<p style="color: #666;">No hay configuración activa. Contacta al administrador.</p>'
          : `
        <table style="width: 100%; border-collapse: collapse;">
          <tbody>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold; width: 180px;">Número dedicado</td>
              <td style="padding: 12px;">
                <strong>${edit.numero_wid ?? config.numero_wid ?? '(sin asignar)'}</strong>
              </td>
              <td style="padding: 12px;">
                <input type="text" id="inp_numero_wid"
                  value="${edit.numero_wid ?? config.numero_wid ?? ''}"
                  placeholder="Ej: +1 (829) 555-0123"
                  style="padding: 6px; width: 220px;"
                />
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Nombre amigable</td>
              <td style="padding: 12px;">
                <strong>${edit.numero_nombre ?? config.numero_nombre ?? '(sin nombre)'}</strong>
              </td>
              <td style="padding: 12px;">
                <input type="text" id="inp_numero_nombre"
                  value="${edit.numero_nombre ?? config.numero_nombre ?? ''}"
                  placeholder="Ej: Inscripción 2026"
                  style="padding: 6px; width: 220px;"
                />
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Cap diario (msgs)</td>
              <td style="padding: 12px;">
                <strong>${edit.cap_diario ?? config.cap_diario}</strong>
              </td>
              <td style="padding: 12px;">
                <input type="number" id="inp_cap_diario"
                  value="${edit.cap_diario ?? config.cap_diario}"
                  style="padding: 6px; width: 220px;"
                />
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Warmup desde</td>
              <td style="padding: 12px;">
                <strong>${edit.warmup_desde ?? config.warmup_desde ?? '(no iniciado)'}</strong>
              </td>
              <td style="padding: 12px;">
                <input type="date" id="inp_warmup_desde"
                  value="${edit.warmup_desde ?? config.warmup_desde ?? ''}"
                  style="padding: 6px; width: 220px;"
                />
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Warmup dias</td>
              <td colspan="2" style="padding: 12px;">
                <strong>${config.warmup_dias}</strong> (fijo)
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Jitter (seg)</td>
              <td colspan="2" style="padding: 12px;">
                <strong>${config.jitter_min_seg}–${config.jitter_max_seg}s</strong> (fijo)
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px; font-weight: bold;">Rate limit</td>
              <td colspan="2" style="padding: 12px;">
                <strong>${config.rate_limit_hora} msgs/hora</strong> (fijo)
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold;">Activo</td>
              <td colspan="2" style="padding: 12px;">
                <strong style="color: ${config.activo ? 'green' : 'red'};">
                  ${config.activo ? '✓ SÍ' : '✗ NO'}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
        <div style="margin-top: 24px;">
          <button id="btn_guardar"
            style="
              padding: 10px 20px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              ${cargando || !Object.keys(edit).length ? 'opacity: 0.5; cursor: not-allowed;' : ''}
            "
            ${cargando || !Object.keys(edit).length ? 'disabled' : ''}
          >
            ${cargando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      `
      }
    </div>
  `

  if (config && !cargando) {
    const inpNumeroWid = container.querySelector('#inp_numero_wid')
    const inpNumeroNombre = container.querySelector('#inp_numero_nombre')
    const inpCapDiario = container.querySelector('#inp_cap_diario')
    const inpWarmupDesde = container.querySelector('#inp_warmup_desde')
    const btnGuardar = container.querySelector('#btn_guardar')

    if (inpNumeroWid) inpNumeroWid.addEventListener('change', (e) => {
      state.edit.numero_wid = e.target.value || null
      render(container)
    })
    if (inpNumeroNombre) inpNumeroNombre.addEventListener('change', (e) => {
      state.edit.numero_nombre = e.target.value || null
      render(container)
    })
    if (inpCapDiario) inpCapDiario.addEventListener('change', (e) => {
      state.edit.cap_diario = parseInt(e.target.value) || null
      render(container)
    })
    if (inpWarmupDesde) inpWarmupDesde.addEventListener('change', (e) => {
      state.edit.warmup_desde = e.target.value || null
      render(container)
    })
    if (btnGuardar) btnGuardar.addEventListener('click', () => guardarCambios(container))
  }
}

function renderError(container, message) {
  container.innerHTML = `<div style="color: red; padding: 20px;">Error: ${message}</div>`
}
