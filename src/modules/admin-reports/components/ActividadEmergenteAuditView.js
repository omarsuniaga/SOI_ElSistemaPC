import * as adapter from '../../../portal-maestros/services/confirmacionesEmergentesAdapter.js'

/**
 * Component / View: ActividadEmergenteAuditView (Portal ADM)
 * Read-only auditable query table of all institutional activity confirmations.
 * Allows administrators (ADM) to inspect historical confirmations, response metadata,
 * and export records to CSV.
 *
 * Enforces role check: only users with admin / superadmin / inventarista roles can view data.
 */

export function renderActividadEmergenteAuditView(container, {
  userRole = 'admin',
  onExportCsv
} = {}) {
  if (!container) throw new Error('renderActividadEmergenteAuditView: contenedor DOM requerido.')

  const ES_ADMIN = ['admin', 'superadmin', 'inventarista'].includes(userRole)

  let estado = {
    loading: true,
    confirmaciones: [],
    filtros: {
      fecha: '',
      maestro_id: '',
      actividad_id: '',
      estado_validacion: '',
      respuesta: ''
    },
    filaExpandidaId: null
  }

  function render() {
    if (!ES_ADMIN) {
      container.innerHTML = `
        <div data-role="acceso-denegado" style="padding: 3rem 1.5rem; text-align: center; font-family: system-ui, sans-serif;">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔒</div>
          <h2 style="font-size: 1.3rem; font-weight: 700; color: #991b1b; margin: 0 0 0.5rem 0;">Acceso Denegado</h2>
          <p style="color: #64748b; font-size: 0.95rem; margin: 0;">
            Solo los administradores autorizados tienen acceso a la pista de auditoría de actividades institucionales.
          </p>
        </div>
      `
      return
    }

    container.innerHTML = `
      <div class="adm-audit-view" style="padding: 1.5rem; max-width: 1200px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
        <header style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 2rem;">
          <div>
            <h1 style="font-size: 1.5rem; font-weight: 700; color: #0f172a; margin: 0 0 0.5rem 0;">
              Auditoría: Justificación de Actividades Emergentes
            </h1>
            <p style="margin: 0; color: #64748b; font-size: 0.95rem;">
              Registro histórico inmutable y trazabilidad de confirmaciones institucionales.
            </p>
          </div>

          <button type="button" data-action="exportar-csv" data-role="btn-exportar-csv"
                  style="min-height: 40px; padding: 0.5rem 1rem; background: #059669; color: #ffffff; border: none; border-radius: 8px; font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 0.5rem;">
            📥 Exportar a CSV
          </button>
        </header>

        <!-- Filtros -->
        <section style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; align-items: end;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Fecha</label>
              <input type="date" data-role="filtro-fecha" value="${estado.filtros.fecha}"
                     style="width: 100%; box-sizing: border-box; padding: 0.4rem 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Maestro ID</label>
              <input type="text" data-role="filtro-maestro" placeholder="UUID maestro..." value="${estado.filtros.maestro_id}"
                     style="width: 100%; box-sizing: border-box; padding: 0.4rem 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem;" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Estado Validación</label>
              <select data-role="filtro-estado-validacion" style="width: 100%; box-sizing: border-box; padding: 0.4rem 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; background: #ffffff;">
                <option value="">Todos</option>
                <option value="validado" ${estado.filtros.estado_validacion === 'validado' ? 'selected' : ''}>Validado</option>
                <option value="pendiente" ${estado.filtros.estado_validacion === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="rechazado" ${estado.filtros.estado_validacion === 'rechazado' ? 'selected' : ''}>Rechazado</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.25rem;">Respuesta</label>
              <select data-role="filtro-respuesta" style="width: 100%; box-sizing: border-box; padding: 0.4rem 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; background: #ffffff;">
                <option value="">Todas</option>
                <option value="si" ${estado.filtros.respuesta === 'si' ? 'selected' : ''}>Sí</option>
                <option value="no" ${estado.filtros.respuesta === 'no' ? 'selected' : ''}>No</option>
                <option value="no_aplica" ${estado.filtros.respuesta === 'no_aplica' ? 'selected' : ''}>No Aplica</option>
                <option value="no_se" ${estado.filtros.respuesta === 'no_se' ? 'selected' : ''}>No Sé</option>
              </select>
            </div>

            <div>
              <button type="button" data-action="aplicar-filtros" style="width: 100%; min-height: 34px; padding: 0.4rem 0.8rem; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; font-weight: 500; cursor: pointer;">
                Filtrar
              </button>
            </div>
          </div>
        </section>

        <!-- Tabla -->
        <section style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="overflow-x: auto;">
            <table data-role="tabla-auditoria" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.875rem;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; font-size: 0.75rem; text-transform: uppercase;">
                  <th style="padding: 0.75rem 1rem;">Actividad</th>
                  <th style="padding: 0.75rem 1rem;">Fecha</th>
                  <th style="padding: 0.75rem 1rem;">Maestro</th>
                  <th style="padding: 0.75rem 1rem;">Respuesta</th>
                  <th style="padding: 0.75rem 1rem;">Estado Validación</th>
                  <th style="padding: 0.75rem 1rem;">Respondido Por</th>
                  <th style="padding: 0.75rem 1rem; text-align: right;">Detalle</th>
                </tr>
              </thead>
              <tbody>
                ${renderFilas()}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `

    vincularEventos()
  }

  function renderFilas() {
    if (estado.loading) {
      return `<tr><td colspan="7" style="padding: 2rem; text-align: center; color: #64748b;">Cargando registros auditables...</td></tr>`
    }

    if (estado.confirmaciones.length === 0) {
      return `<tr><td colspan="7" data-role="sin-registros" style="padding: 2rem; text-align: center; color: #64748b;">No se encontraron registros de auditoría.</td></tr>`
    }

    return estado.confirmaciones.map(c => {
      const esExpandida = estado.filaExpandidaId === c.id
      const actNombre = c.actividad_info?.actividad || c.actividad?.actividad || 'Actividad'
      const respondidoPor = c.respondido_por || '—'
      const clases = c.clases_afectadas || []

      return `
        <tr data-role="fila-auditoria" data-id="${c.id}" style="border-bottom: 1px solid #f1f5f9; ${esExpandida ? 'background: #f8fafc;' : ''}">
          <td style="padding: 0.75rem 1rem; font-weight: 600; color: #0f172a;">${actNombre}</td>
          <td style="padding: 0.75rem 1rem; color: #64748b;">${c.fecha}</td>
          <td style="padding: 0.75rem 1rem; font-family: monospace; font-size: 0.8rem;">${c.maestro_id}</td>
          <td style="padding: 0.75rem 1rem; font-weight: 600;">${(c.respuesta || '').toUpperCase()}</td>
          <td style="padding: 0.75rem 1rem;">${c.estado_validacion || 'pendiente'}</td>
          <td style="padding: 0.75rem 1rem; font-family: monospace; font-size: 0.8rem; color: #64748b;">${respondidoPor}</td>
          <td style="padding: 0.75rem 1rem; text-align: right;">
            <button type="button" data-action="toggle-expandir" data-id="${c.id}" data-role="btn-expandir"
                    style="min-height: 32px; padding: 0.25rem 0.6rem; font-size: 0.8rem; background: transparent; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer;">
              ${esExpandida ? 'Ocultar ▲' : 'Auditoría ▼'}
            </button>
          </td>
        </tr>

        ${esExpandida ? `
          <tr data-role="fila-detalle-expandida" style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <td colspan="7" style="padding: 1rem 1.5rem;">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; font-size: 0.85rem; color: #334155;">
                <div>
                  <strong>Pista de Auditoría:</strong>
                  <div style="font-family: monospace; font-size: 0.8rem; margin-top: 0.25rem;">
                    <div>Confirmación ID: ${c.id}</div>
                    <div>Respondido At: ${c.respondido_at || c.created_at || '—'}</div>
                    <div>Última actualización: ${c.updated_at || '—'}</div>
                    <div>Usuario responsable: ${c.respondido_por || '—'}</div>
                  </div>
                </div>

                <div>
                  <strong>Observaciones:</strong>
                  <p style="margin: 0.25rem 0 0 0; color: #64748b;">${c.observaciones || 'Sin observaciones registradas.'}</p>
                </div>

                <div>
                  <strong>Clases Afectadas (${clases.length}):</strong>
                  ${clases.length > 0 ? `
                    <ul style="margin: 0.25rem 0 0 0; padding-left: 1.25rem; font-size: 0.8rem; color: #64748b;">
                      ${clases.map(cl => `<li>${cl.clase_nombre || 'Clase'} (${cl.alumnos_count || 0} alumnos)</li>`).join('')}
                    </ul>
                  ` : '<div style="color: #94a3b8; font-size: 0.8rem; margin-top: 0.25rem;">Ninguna clase registrada</div>'}
                </div>
              </div>
            </td>
          </tr>
        ` : ''}
      `
    }).join('')
  }

  function vincularEventos() {
    if (!ES_ADMIN) return

    // Filtros
    const fFecha = container.querySelector('[data-role="filtro-fecha"]')
    if (fFecha) fFecha.onchange = (e) => { estado.filtros.fecha = e.target.value }

    const fMaestro = container.querySelector('[data-role="filtro-maestro"]')
    if (fMaestro) fMaestro.oninput = (e) => { estado.filtros.maestro_id = e.target.value.trim() }

    const fVal = container.querySelector('[data-role="filtro-estado-validacion"]')
    if (fVal) fVal.onchange = (e) => { estado.filtros.estado_validacion = e.target.value }

    const fResp = container.querySelector('[data-role="filtro-respuesta"]')
    if (fResp) fResp.onchange = (e) => { estado.filtros.respuesta = e.target.value }

    const btnFiltrar = container.querySelector('[data-action="aplicar-filtros"]')
    if (btnFiltrar) btnFiltrar.onclick = () => { cargarDatos() }

    // Toggle expandir
    container.querySelectorAll('[data-action="toggle-expandir"]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id
        estado.filaExpandidaId = estado.filaExpandidaId === id ? null : id
        render()
      }
    })

    // Exportar CSV
    const btnCsv = container.querySelector('[data-action="exportar-csv"]')
    if (btnCsv) {
      btnCsv.onclick = () => {
        const csvContent = exportarCsv()
        if (typeof onExportCsv === 'function') {
          onExportCsv(csvContent)
        }
      }
    }
  }

  function exportarCsv() {
    const encabezados = [
      'id', 'actividad', 'maestro_id', 'fecha', 'respuesta',
      'estado_validacion', 'respondido_por', 'respondido_at', 'updated_at', 'observaciones'
    ]

    const filas = estado.confirmaciones.map(c => [
      c.id,
      `"${(c.actividad_info?.actividad || c.actividad?.actividad || '').replace(/"/g, '""')}"`,
      c.maestro_id,
      c.fecha,
      c.respuesta,
      c.estado_validacion,
      c.respondido_por || '',
      c.respondido_at || c.created_at || '',
      c.updated_at || '',
      `"${(c.observaciones || '').replace(/"/g, '""')}"`
    ])

    const csvText = [
      encabezados.join(','),
      ...filas.map(f => f.join(','))
    ].join('\n')

    if (typeof window !== 'undefined' && window.document) {
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `auditoria_actividades_emergentes_${new Date().toISOString().split('T')[0]}.csv`
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    return csvText
  }

  async function cargarDatos() {
    estado.loading = true
    render()

    try {
      let items = await adapter.obtenerTodasLasConfirmaciones(estado.filtros)
      if (estado.filtros.respuesta) {
        items = (items || []).filter(c => c.respuesta === estado.filtros.respuesta)
      }
      estado.confirmaciones = items || []
      estado.loading = false
      render()
    } catch {
      estado.loading = false
      render()
    }
  }

  if (ES_ADMIN) {
    cargarDatos()
  } else {
    render()
  }

  return {
    reload: cargarDatos,
    exportarCsv
  }
}
