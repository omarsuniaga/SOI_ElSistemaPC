import * as adapter from '../../../portal-maestros/services/confirmacionesEmergentesAdapter.js'

/**
 * Component / View: ActividadEmergenteManagerView (Portal ACM)
 * Allows Coordinación Académica (ACM) to:
 * 1. Create institutional activities with specific scope (institución, programa, orquesta, coro, grupo, maestros_específicos)
 *    and trigger scope broadcasting to affected maestros.
 * 2. View and filter confirmation records across maestros and dates.
 * 3. Validate or reject ambiguous 'no_se' confirmations with observations.
 * 4. Display aggregated metrics and breakdown by maestro.
 */

export function renderActividadEmergenteManagerView(container, {
  onActividadCreada,
  onValidacionCompletada
} = {}) {
  if (!container) throw new Error('renderActividadEmergenteManagerView: contenedor DOM requerido.')

  let estado = {
    loading: true,
    confirmaciones: [],
    filtros: {
      fecha: '',
      maestro_id: '',
      estado_validacion: ''
    },
    // Formulario de creación
    nuevoForm: {
      nombre: '',
      fecha: new Date().toISOString().split('T')[0],
      lugar: '',
      alcance_tipo: 'institucion',
      alcance_config_raw: ''
    },
    mensajeCreacion: null,
    errorCreacion: null,
    creando: false,
    // Modal de validación
    modalValidacion: null,
    validacionEstado: 'validado',
    validacionObservaciones: '',
    validando: false,
    errorValidacion: null
  }

  function render() {
    const resumen = adapter.obtenerResumenAgregado(estado.confirmaciones)

    container.innerHTML = `
      <div class="acm-actividad-manager" style="padding: 1.5rem; max-width: 1200px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
        <header style="margin-bottom: 2rem;">
          <h1 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 0.5rem 0;">
            Gestión de Actividades Institucionales y Justificaciones
          </h1>
          <p style="margin: 0; color: #64748b; font-size: 0.95rem;">
            Coordina actividades de impacto institucional, define su alcance y valida confirmaciones de maestros.
          </p>
        </header>

        <!-- Resumen Agregado (KPIs) -->
        <section data-role="resumen-agregado" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 0.8rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Total Confirmadas</div>
            <div data-role="kpi-total" style="font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-top: 0.25rem;">${resumen.total}</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 0.8rem; color: #16a34a; font-weight: 600; text-transform: uppercase;">Sí (Justificadas)</div>
            <div data-role="kpi-si" style="font-size: 1.75rem; font-weight: 700; color: #16a34a; margin-top: 0.25rem;">${resumen.si}</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 0.8rem; color: #dc2626; font-weight: 600; text-transform: uppercase;">No (Sin Justificar)</div>
            <div data-role="kpi-no" style="font-size: 1.75rem; font-weight: 700; color: #dc2626; margin-top: 0.25rem;">${resumen.no}</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 0.8rem; color: #475569; font-weight: 600; text-transform: uppercase;">No Aplica</div>
            <div data-role="kpi-no_aplica" style="font-size: 1.75rem; font-weight: 700; color: #475569; margin-top: 0.25rem;">${resumen.no_aplica}</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="font-size: 0.8rem; color: #d97706; font-weight: 600; text-transform: uppercase;">No Sé (Pendientes)</div>
            <div data-role="kpi-no_se" style="font-size: 1.75rem; font-weight: 700; color: #d97706; margin-top: 0.25rem;">${resumen.no_se}</div>
          </div>
        </section>

        <!-- Formulario Crear Actividad Institucional -->
        <section class="pm-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <h2 style="font-size: 1.15rem; font-weight: 700; margin: 0 0 1rem 0; color: #0f172a;">
            Crear Nueva Actividad Institucional
          </h2>

          ${estado.mensajeCreacion ? `
            <div data-role="alerta-creacion-exito" style="background: #ecfdf5; border: 1px solid #10b981; color: #065f46; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem;">
              ${estado.mensajeCreacion}
            </div>
          ` : ''}

          ${estado.errorCreacion ? `
            <div data-role="alerta-creacion-error" style="background: #fef2f2; border: 1px solid #ef4444; color: #991b1b; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem;">
              ${estado.errorCreacion}
            </div>
          ` : ''}

          <form data-role="form-crear-actividad" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: #334155;">Nombre de Actividad *</label>
              <input type="text" data-role="input-actividad-nombre" required placeholder="Ej: Concierto Anual" value="${estado.nuevoForm.nombre}"
                     style="width: 100%; box-sizing: border-box; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: #334155;">Fecha de Actividad *</label>
              <input type="date" data-role="input-actividad-fecha" required value="${estado.nuevoForm.fecha}"
                     style="width: 100%; box-sizing: border-box; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: #334155;">Lugar</label>
              <input type="text" data-role="input-actividad-lugar" placeholder="Ej: Sala Simón Bolívar" value="${estado.nuevoForm.lugar}"
                     style="width: 100%; box-sizing: border-box; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: #334155;">Tipo de Alcance *</label>
              <select data-role="select-actividad-alcance" style="width: 100%; box-sizing: border-box; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; background: #ffffff;">
                <option value="institucion" ${estado.nuevoForm.alcance_tipo === 'institucion' ? 'selected' : ''}>Toda la Institución (Todos los Maestros)</option>
                <option value="programa" ${estado.nuevoForm.alcance_tipo === 'programa' ? 'selected' : ''}>Programa Específico</option>
                <option value="orquesta" ${estado.nuevoForm.alcance_tipo === 'orquesta' ? 'selected' : ''}>Orquesta</option>
                <option value="coro" ${estado.nuevoForm.alcance_tipo === 'coro' ? 'selected' : ''}>Coro</option>
                <option value="grupo" ${estado.nuevoForm.alcance_tipo === 'grupo' ? 'selected' : ''}>Grupo / Clases Específicas</option>
                <option value="maestros_especificos" ${estado.nuevoForm.alcance_tipo === 'maestros_especificos' ? 'selected' : ''}>Maestros Específicos (Lista)</option>
              </select>
            </div>

            <div style="grid-column: 1 / -1;">
              ${renderAlcanceConfigInput()}
            </div>

            <div style="grid-column: 1 / -1; display: flex; justify-content: flex-end; margin-top: 0.5rem;">
              <button type="button" data-action="crear-actividad" data-role="btn-submit-actividad" ${estado.creando ? 'disabled' : ''}
                      style="min-height: 44px; padding: 0.6rem 1.5rem; background: #2563eb; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; font-size: 0.95rem; cursor: ${estado.creando ? 'not-allowed' : 'pointer'};">
                ${estado.creando ? 'Creando y difundiéndo...' : 'Crear y Notificar por Alcance'}
              </button>
            </div>
          </form>
        </section>

        <!-- Tabla de Confirmaciones con Filtros -->
        <section style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
            <h2 style="font-size: 1.15rem; font-weight: 700; margin: 0; color: #0f172a;">
              Confirmaciones de Maestros
            </h2>

            <!-- Barra de Filtros -->
            <div data-role="filtros-confirmaciones" style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
              <input type="date" data-role="filtro-fecha" value="${estado.filtros.fecha}" title="Filtrar por fecha"
                     style="padding: 0.4rem 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem;" />
              
              <input type="text" data-role="filtro-maestro" placeholder="ID de Maestro..." value="${estado.filtros.maestro_id}"
                     style="padding: 0.4rem 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; width: 140px;" />

              <select data-role="filtro-estado-validacion" style="padding: 0.4rem 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; background: #ffffff;">
                <option value="">Todos los Estados</option>
                <option value="pendiente" ${estado.filtros.estado_validacion === 'pendiente' ? 'selected' : ''}>Pendiente de Validación</option>
                <option value="validado" ${estado.filtros.estado_validacion === 'validado' ? 'selected' : ''}>Validados</option>
                <option value="rechazado" ${estado.filtros.estado_validacion === 'rechazado' ? 'selected' : ''}>Rechazados</option>
              </select>

              <button type="button" data-action="aplicar-filtros" style="min-height: 36px; padding: 0.4rem 0.8rem; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; cursor: pointer;">
                Filtrar
              </button>
            </div>
          </div>

          <!-- Contenido Tabla -->
          <div style="overflow-x: auto;">
            <table data-role="tabla-confirmaciones" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
              <thead>
                <tr style="border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 0.8rem; text-transform: uppercase;">
                  <th style="padding: 0.75rem 1rem;">Actividad</th>
                  <th style="padding: 0.75rem 1rem;">Fecha</th>
                  <th style="padding: 0.75rem 1rem;">Maestro</th>
                  <th style="padding: 0.75rem 1rem;">Respuesta</th>
                  <th style="padding: 0.75rem 1rem;">Estado Validación</th>
                  <th style="padding: 0.75rem 1rem;">Observaciones</th>
                  <th style="padding: 0.75rem 1rem; text-align: right;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${renderFilasTabla()}
              </tbody>
            </table>
          </div>
        </section>

        ${estado.modalValidacion ? renderModalValidacion() : ''}
      </div>
    `

    vincularEventos()
  }

  function renderAlcanceConfigInput() {
    const tipo = estado.nuevoForm.alcance_tipo
    let placeholder = ''
    let ayuda = ''

    if (tipo === 'programa') {
      placeholder = '{"programa_id": "uuid-programa"}'
      ayuda = 'Especifica el ID del programa al que aplica la actividad.'
    } else if (tipo === 'grupo') {
      placeholder = '{"clase_ids": ["clase-uuid-1", "clase-uuid-2"]}'
      ayuda = 'Especifica los IDs de las clases o grupos incluidos.'
    } else if (tipo === 'maestros_especificos') {
      placeholder = '{"maestro_ids": ["maestro-1", "maestro-2"]}'
      ayuda = 'Especifica la lista exacta de maestro_ids afectados.'
    } else {
      return ''
    }

    return `
      <div>
        <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: #334155;">
          Configuración de Alcance (JSON)
        </label>
        <input type="text" data-role="input-alcance-config" placeholder='${placeholder}' value="${estado.nuevoForm.alcance_config_raw}"
               style="width: 100%; box-sizing: border-box; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-size: 0.85rem;" />
        <span style="font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; display: block;">${ayuda}</span>
      </div>
    `
  }

  function renderFilasTabla() {
    if (estado.loading) {
      return `<tr><td colspan="7" style="padding: 2rem; text-align: center; color: #64748b;">Cargando confirmaciones...</td></tr>`
    }

    if (estado.confirmaciones.length === 0) {
      return `<tr><td colspan="7" data-role="tabla-vacia" style="padding: 2rem; text-align: center; color: #64748b;">No hay confirmaciones que coincidan con los filtros.</td></tr>`
    }

    return estado.confirmaciones.map(c => {
      const actNombre = c.actividad_info?.actividad || c.actividad?.actividad || 'Actividad Institucional'
      const maestroId = c.maestro_id || c.maestro?.id || '—'
      const respuesta = c.respuesta || '—'
      const estadoVal = c.estado_validacion || 'pendiente'
      const esNoSe = respuesta === 'no_se'

      const badgeRespuestaStyle = {
        si: 'background: #dcfce7; color: #15803d;',
        no: 'background: #fee2e2; color: #b91c1c;',
        no_aplica: 'background: #f1f5f9; color: #475569;',
        no_se: 'background: #fef3c7; color: #b45309;'
      }[respuesta] || 'background: #f1f5f9; color: #475569;'

      const badgeValStyle = {
        validado: 'background: #dcfce7; color: #15803d;',
        rechazado: 'background: #fee2e2; color: #b91c1c;',
        pendiente: 'background: #fef3c7; color: #b45309;'
      }[estadoVal] || 'background: #f1f5f9; color: #475569;'

      return `
        <tr data-role="fila-confirmacion" data-id="${c.id}" style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 0.75rem 1rem; font-weight: 600; color: #1e293b;">${actNombre}</td>
          <td style="padding: 0.75rem 1rem; color: #64748b;">${c.fecha}</td>
          <td style="padding: 0.75rem 1rem; color: #334155; font-family: monospace; font-size: 0.85rem;">${maestroId}</td>
          <td style="padding: 0.75rem 1rem;">
            <span data-role="badge-respuesta" style="padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; ${badgeRespuestaStyle}">
              ${respuesta.toUpperCase()}
            </span>
          </td>
          <td style="padding: 0.75rem 1rem;">
            <span data-role="badge-estado-val" style="padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; ${badgeValStyle}">
              ${estadoVal}
            </span>
          </td>
          <td style="padding: 0.75rem 1rem; color: #64748b; font-size: 0.85rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${c.observaciones || '—'}
          </td>
          <td style="padding: 0.75rem 1rem; text-align: right;">
            ${esNoSe ? `
              <button type="button" data-action="abrir-validar" data-id="${c.id}" data-role="btn-validar-acm"
                      style="min-height: 36px; padding: 0.35rem 0.75rem; background: #0284c7; color: #ffffff; border: none; border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer;">
                Validar
              </button>
            ` : `
              <span style="font-size: 0.8rem; color: #94a3b8;">—</span>
            `}
          </td>
        </tr>
      `
    }).join('')
  }

  function renderModalValidacion() {
    const c = estado.modalValidacion
    if (!c) return ''
    const actNombre = c.actividad_info?.actividad || c.actividad?.actividad || 'Actividad'

    return `
      <div data-role="modal-validacion-acm" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem; box-sizing: border-box;">
        <div style="background: #ffffff; border-radius: 14px; width: 100%; max-width: 480px; box-sizing: border-box; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          <div style="padding: 1.25rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: #0f172a;">Validar Respuesta "No Sé"</h3>
            <button type="button" data-action="cerrar-modal-val" style="background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b;">&times;</button>
          </div>

          <div style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
            ${estado.errorValidacion ? `
              <div style="background: #fef2f2; border: 1px solid #ef4444; color: #991b1b; padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.85rem;">
                ${estado.errorValidacion}
              </div>
            ` : ''}

            <div style="font-size: 0.85rem; color: #475569; background: #f8fafc; padding: 0.75rem; border-radius: 8px;">
              <div><strong>Actividad:</strong> ${actNombre}</div>
              <div><strong>Fecha:</strong> ${c.fecha}</div>
              <div><strong>Maestro:</strong> ${c.maestro_id}</div>
              ${c.observaciones ? `<div><strong>Obs maestro:</strong> ${c.observaciones}</div>` : ''}
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: #334155;">Resolución de Coordinación</label>
              <select data-role="select-resolucion-val" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem;">
                <option value="validado" ${estado.validacionEstado === 'validado' ? 'selected' : ''}>Validar (Aplica justificación institucional)</option>
                <option value="rechazado" ${estado.validacionEstado === 'rechazado' ? 'selected' : ''}>Rechazar (No justificó las clases del maestro)</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem; color: #334155;">Observaciones de Coordinación</label>
              <textarea data-role="input-observaciones-val" rows="3" placeholder="Añade el motivo de la resolución..."
                        style="width: 100%; box-sizing: border-box; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem;">${estado.validacionObservaciones}</textarea>
            </div>
          </div>

          <div style="padding: 1rem 1.25rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 0.75rem; background: #f8fafc;">
            <button type="button" data-action="cerrar-modal-val" style="min-height: 40px; padding: 0.5rem 1rem; border: 1px solid #cbd5e1; background: #ffffff; border-radius: 6px; font-size: 0.85rem; cursor: pointer;">
              Cancelar
            </button>
            <button type="button" data-action="guardar-val" data-role="btn-guardar-val" ${estado.validando ? 'disabled' : ''}
                    style="min-height: 40px; padding: 0.5rem 1.25rem; background: #0284c7; color: #ffffff; border: none; border-radius: 6px; font-weight: 600; font-size: 0.85rem; cursor: ${estado.validando ? 'not-allowed' : 'pointer'};">
              ${estado.validando ? 'Guardando...' : 'Guardar Resolución'}
            </button>
          </div>
        </div>
      </div>
    `
  }

  function vincularEventos() {
    // Input form crear
    const inputNombre = container.querySelector('[data-role="input-actividad-nombre"]')
    if (inputNombre) {
      inputNombre.oninput = (e) => { estado.nuevoForm.nombre = e.target.value }
    }

    const inputFecha = container.querySelector('[data-role="input-actividad-fecha"]')
    if (inputFecha) {
      inputFecha.oninput = (e) => { estado.nuevoForm.fecha = e.target.value }
    }

    const inputLugar = container.querySelector('[data-role="input-actividad-lugar"]')
    if (inputLugar) {
      inputLugar.oninput = (e) => { estado.nuevoForm.lugar = e.target.value }
    }

    const selectAlcance = container.querySelector('[data-role="select-actividad-alcance"]')
    if (selectAlcance) {
      selectAlcance.onchange = (e) => {
        estado.nuevoForm.alcance_tipo = e.target.value
        render()
      }
    }

    const inputConfig = container.querySelector('[data-role="input-alcance-config"]')
    if (inputConfig) {
      inputConfig.oninput = (e) => { estado.nuevoForm.alcance_config_raw = e.target.value }
    }

    // Submit crear actividad
    const btnCrear = container.querySelector('[data-action="crear-actividad"]')
    if (btnCrear) {
      btnCrear.onclick = async () => { await ejecutarCrearActividad() }
    }

    // Filtros
    const filtroFecha = container.querySelector('[data-role="filtro-fecha"]')
    if (filtroFecha) {
      filtroFecha.onchange = (e) => { estado.filtros.fecha = e.target.value }
    }

    const filtroMaestro = container.querySelector('[data-role="filtro-maestro"]')
    if (filtroMaestro) {
      filtroMaestro.oninput = (e) => { estado.filtros.maestro_id = e.target.value.trim() }
    }

    const filtroVal = container.querySelector('[data-role="filtro-estado-validacion"]')
    if (filtroVal) {
      filtroVal.onchange = (e) => { estado.filtros.estado_validacion = e.target.value }
    }

    const btnFiltrar = container.querySelector('[data-action="aplicar-filtros"]')
    if (btnFiltrar) {
      btnFiltrar.onclick = async () => { await cargarConfirmaciones() }
    }

    // Abrir validar
    container.querySelectorAll('[data-action="abrir-validar"]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id
        const item = estado.confirmaciones.find(c => c.id === id)
        if (item) {
          estado.modalValidacion = item
          estado.validacionEstado = 'validado'
          estado.validacionObservaciones = ''
          estado.errorValidacion = null
          render()
        }
      }
    })

    // Cerrar modal validacion
    container.querySelectorAll('[data-action="cerrar-modal-val"]').forEach(btn => {
      btn.onclick = () => {
        estado.modalValidacion = null
        render()
      }
    })

    // Cambiar resolucion modal
    const selResolucion = container.querySelector('[data-role="select-resolucion-val"]')
    if (selResolucion) {
      selResolucion.onchange = (e) => { estado.validacionEstado = e.target.value }
    }

    // Input obs modal
    const inputObsVal = container.querySelector('[data-role="input-observaciones-val"]')
    if (inputObsVal) {
      inputObsVal.oninput = (e) => { estado.validacionObservaciones = e.target.value }
    }

    // Guardar resolucion
    const btnGuardarVal = container.querySelector('[data-action="guardar-val"]')
    if (btnGuardarVal) {
      btnGuardarVal.onclick = async () => { await ejecutarGuardarValidacion() }
    }
  }

  async function ejecutarCrearActividad() {
    if (!estado.nuevoForm.nombre || !estado.nuevoForm.fecha || estado.creando) return

    estado.creando = true
    estado.mensajeCreacion = null
    estado.errorCreacion = null
    render()

    let alcanceConfig = {}
    if (estado.nuevoForm.alcance_config_raw) {
      try {
        alcanceConfig = JSON.parse(estado.nuevoForm.alcance_config_raw)
      } catch (err) {
        estado.errorCreacion = 'El formato de Configuración de Alcance no es un JSON válido.'
        estado.creando = false
        render()
        return
      }
    }

    try {
      const resultado = await adapter.crearActividadInstitucional({
        actividad: estado.nuevoForm.nombre,
        fecha: estado.nuevoForm.fecha,
        lugar: estado.nuevoForm.lugar || null,
        alcance_tipo: estado.nuevoForm.alcance_tipo,
        alcance_config: alcanceConfig
      })

      const count = resultado.maestros_notificados?.length || 0
      estado.mensajeCreacion = `Actividad creada, ${count} maestros notificados.`
      estado.creando = false
      estado.nuevoForm.nombre = ''
      estado.nuevoForm.lugar = ''
      estado.nuevoForm.alcance_config_raw = ''

      if (typeof onActividadCreada === 'function') {
        onActividadCreada(resultado)
      }

      await cargarConfirmaciones()
    } catch (err) {
      estado.errorCreacion = err?.message || 'Error al crear la actividad institucional.'
      estado.creando = false
      render()
    }
  }

  async function ejecutarGuardarValidacion() {
    if (!estado.modalValidacion || estado.validando) return

    estado.validando = true
    estado.errorValidacion = null
    render()

    try {
      const updated = await adapter.validarConfirmacionAcm({
        confirmacion_id: estado.modalValidacion.id,
        estado_validacion: estado.validacionEstado,
        observaciones: estado.validacionObservaciones || undefined
      })

      estado.modalValidacion = null
      estado.validando = false

      if (typeof onValidacionCompletada === 'function') {
        onValidacionCompletada(updated)
      }

      await cargarConfirmaciones()
    } catch (err) {
      estado.errorValidacion = err?.message || 'Error al validar la confirmación.'
      estado.validando = false
      render()
    }
  }

  async function cargarConfirmaciones() {
    estado.loading = true
    render()

    try {
      const items = await adapter.obtenerTodasLasConfirmaciones(estado.filtros)
      estado.confirmaciones = items || []
      estado.loading = false
      render()
    } catch (err) {
      estado.loading = false
      render()
    }
  }

  // Carga inicial
  cargarConfirmaciones()

  return {
    reload: cargarConfirmaciones
  }
}
