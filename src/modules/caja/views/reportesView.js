/**
 * reportesView.js - Reporting hub
 * Route: #/reportes
 * Four report cards: Cierre del dia, Estado cuenta familiar, Reporte mora, Impacto social.
 */
import * as cajaApi from '../api/cajaApi.js'
import {
  aggregateCierreCaja,
  buildEstadoCuentaFamiliar,
  buildMoraReport,
  buildImpactoSocial,
} from '../domain/reporte.js'
import { generateCierreCaja } from '../pdf/cierreCajaDiario.js'
import { generateEstadoCuenta } from '../pdf/estadoCuentaFamiliar.js'
import { generateReporteMora } from '../pdf/reporteMora.js'
import { generateImpactoSocial } from '../pdf/reporteImpactoSocial.js'

const VERDE = '#059669'

function fmtMoney(val) {
  return '$' + Number(val || 0).toFixed(2)
}

function loadingSpinner() {
  return '<span class="spinner-border spinner-border-sm" role="status"></span> Cargando...'
}

function cardShell(id, icon, title, body) {
  return '<div id="' + id + '" style="background:#fff;border-radius:12px;padding:1.5rem;'
    + 'box-shadow:0 1px 3px rgba(0,0,0,0.08)">'
    + '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem">'
    + '<i class="bi ' + icon + '" style="color:' + VERDE + ';font-size:1.25rem"></i>'
    + '<h3 style="margin:0;font-size:1rem;font-weight:700;color:#0f172a">' + title + '</h3>'
    + '</div>'
    + body
    + '</div>'
}

export async function render(container, session) {
  container.innerHTML = '<div style="padding:1.5rem"><p style="color:#94a3b8">Cargando reportes...</p></div>'

  // Pre-load familias (used by 3 of 4 reports)
  const { data: familias, error: famErr } = await cajaApi.getFamilias()
  const { data: cierreHoy, error: cierreErr } = await cajaApi.getCierreCajaHoy()

  const familiaList = familias || []

  // --- Card 1: Cierre del dia ---
  const cierreData = cierreHoy || { totalGeneral: 0, porMetodo: {}, cantidadTransacciones: 0 }
  const cierreMetodos = Object.entries(cierreData.porMetodo || {})

  const cierreCardBody =
    '<p style="font-size:0.875rem;color:#64748b;margin-bottom:0.75rem">Resumen del cierre de hoy</p>'
    + (cierreErr
        ? '<p style="color:#ef4444;font-size:0.875rem">Error al cargar cierre.</p>'
        : '<div style="margin-bottom:1rem">'
          + '<p style="margin:0;font-size:1.5rem;font-weight:800;color:' + VERDE + '">' + fmtMoney(cierreData.totalGeneral) + '</p>'
          + '<p style="margin:0;font-size:0.75rem;color:#94a3b8">' + (cierreData.cantidadTransacciones || 0) + ' transacciones</p>'
          + '</div>'
          + (cierreMetodos.length > 0
              ? '<div style="margin-bottom:1rem">'
                + cierreMetodos.map(([m, d]) =>
                    '<div style="display:flex;justify-content:space-between;font-size:0.8125rem;'
                    + 'padding:0.25rem 0;border-bottom:1px solid #f1f5f9;color:#475569">'
                    + '<span>' + m + '</span><span style="font-weight:600">' + fmtMoney(d.total) + '</span></div>'
                  ).join('')
                + '</div>'
              : '<p style="font-size:0.875rem;color:#94a3b8">Sin pagos registrados hoy</p>')
          )
    + '<button id="btn-dl-cierre" class="btn btn-sm w-100" '
    + 'style="background:' + VERDE + ';color:#fff;border:none;font-weight:600;margin-top:0.5rem"'
    + (cierreErr ? ' disabled' : '')
    + '><i class="bi bi-download"></i> Descargar PDF</button>'

  // --- Card 2: Estado de cuenta familiar ---
  const familiaOptions = familiaList.map(f =>
    '<option value="' + f.id + '">' + (f.nombre || f.codigo || f.id) + '</option>'
  ).join('')

  const estadoCardBody =
    '<p style="font-size:0.875rem;color:#64748b;margin-bottom:0.75rem">Selecciona una familia para generar el estado de cuenta</p>'
    + '<select id="select-familia-estado" class="form-select form-select-sm mb-3">'
    + '<option value="">— Selecciona una familia —</option>'
    + familiaOptions
    + '</select>'
    + '<div id="estado-preview" style="min-height:60px;margin-bottom:1rem"></div>'
    + '<button id="btn-dl-estado" class="btn btn-sm w-100" disabled '
    + 'style="background:' + VERDE + ';color:#fff;border:none;font-weight:600">'
    + '<i class="bi bi-download"></i> Descargar PDF</button>'

  // --- Card 3: Reporte de mora ---
  const familiasMora = familiaList.filter(f => (f.saldo_pendiente || 0) > 0 || (f.cuotas_pendientes || 0) > 0)
  const moraCardBody =
    '<p style="font-size:0.875rem;color:#64748b;margin-bottom:0.75rem">Familias con cuotas pendientes</p>'
    + '<div style="margin-bottom:1rem">'
    + '<p style="margin:0;font-size:1.5rem;font-weight:800;color:#ef4444">' + familiasMora.length + '</p>'
    + '<p style="margin:0;font-size:0.75rem;color:#94a3b8">familias con saldo pendiente</p>'
    + '</div>'
    + '<button id="btn-dl-mora" class="btn btn-sm w-100" '
    + 'style="background:#ef4444;color:#fff;border:none;font-weight:600;margin-top:0.5rem">'
    + '<i class="bi bi-download"></i> Descargar PDF</button>'

  // --- Card 4: Impacto social ---
  const impactoCardBody =
    '<p style="font-size:0.875rem;color:#64748b;margin-bottom:0.75rem">Datos de becas y patrocinios</p>'
    + '<div style="background:#fef9c3;border:1px solid #fde68a;border-radius:8px;padding:0.75rem;margin-bottom:1rem">'
    + '<p style="margin:0;font-size:0.8125rem;color:#92400e;font-weight:600">Datos en PR5</p>'
    + '<p style="margin:0;font-size:0.75rem;color:#b45309">El modulo de becas y patrocinios se incorpora en la proxima iteracion.</p>'
    + '</div>'
    + '<button class="btn btn-sm w-100" disabled '
    + 'style="background:#e2e8f0;color:#94a3b8;border:none;cursor:not-allowed" '
    + 'title="Disponible en PR5">'
    + '<i class="bi bi-download"></i> Descargar PDF (PR5)</button>'

  container.innerHTML =
    '<div style="padding:1.5rem;max-width:1100px">'
    + '<div style="margin-bottom:1.5rem">'
    + '<h2 style="margin:0;font-size:1.25rem;font-weight:700;color:#0f172a">'
    + '<i class="bi bi-bar-chart-fill" style="color:' + VERDE + '"></i> Reportes</h2>'
    + '<p style="margin:0;font-size:0.8125rem;color:#64748b">Centro de reportes y descarga de PDFs</p>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.25rem">'
    + cardShell('card-cierre',  'bi-cash-stack',       'Cierre del dia',              cierreCardBody)
    + cardShell('card-estado',  'bi-file-earmark-text', 'Estado de cuenta familiar',   estadoCardBody)
    + cardShell('card-mora',    'bi-exclamation-triangle', 'Reporte de mora',           moraCardBody)
    + cardShell('card-impacto', 'bi-heart-pulse',       'Impacto social',              impactoCardBody)
    + '</div></div>'

  // --- Wire up Cierre PDF ---
  container.querySelector('#btn-dl-cierre')?.addEventListener('click', () => {
    const doc = generateCierreCaja(cierreData, new Date().toISOString().slice(0, 10))
    doc.save('cierre-caja-' + new Date().toISOString().slice(0, 10) + '.pdf')
  })

  // --- Wire up Estado de cuenta ---
  let estadoDoc = null
  const selectFamilia = container.querySelector('#select-familia-estado')
  const btnDlEstado = container.querySelector('#btn-dl-estado')
  const estadoPreview = container.querySelector('#estado-preview')

  selectFamilia?.addEventListener('change', async () => {
    const familiaId = selectFamilia.value
    if (!familiaId) {
      estadoPreview.innerHTML = ''
      btnDlEstado.disabled = true
      estadoDoc = null
      return
    }

    estadoPreview.innerHTML = '<p style="font-size:0.875rem;color:#94a3b8">' + loadingSpinner() + '</p>'
    btnDlEstado.disabled = true

    const { data: familiaDetail, error: fdErr } = await cajaApi.getFamiliaById(familiaId)
    if (fdErr || !familiaDetail) {
      estadoPreview.innerHTML = '<p style="color:#ef4444;font-size:0.875rem">Error al cargar familia.</p>'
      return
    }

    const { familia, cuotas, pagos, wallet } = familiaDetail
    const statement = buildEstadoCuentaFamiliar(familia, cuotas || [], pagos || [], wallet)

    estadoPreview.innerHTML =
      '<div style="font-size:0.8125rem;color:#475569">'
      + '<p style="margin:0"><b>' + (familia?.nombre || '-') + '</b></p>'
      + '<p style="margin:0">Cuotas: ' + fmtMoney(statement.resumen.totalCuotas)
      + ' | Pagado: ' + fmtMoney(statement.resumen.totalPagado)
      + ' | Pendiente: <b style="color:' + (statement.resumen.saldoPendiente > 0 ? '#ef4444' : VERDE) + '">'
      + fmtMoney(statement.resumen.saldoPendiente) + '</b></p>'
      + '</div>'

    estadoDoc = generateEstadoCuenta(statement)
    btnDlEstado.disabled = false
  })

  btnDlEstado?.addEventListener('click', () => {
    if (!estadoDoc) return
    const familiaId = selectFamilia?.value || 'familia'
    estadoDoc.save('estado-cuenta-' + familiaId + '-' + new Date().toISOString().slice(0, 10) + '.pdf')
  })

  // --- Wire up Mora PDF ---
  container.querySelector('#btn-dl-mora')?.addEventListener('click', () => {
    // Build mora report from families with pending balance
    const cuotasMora = familiasMora.map(f => ({
      familia_id: f.id,
      fecha_vencimiento: f.proxima_cuota_vencimiento || new Date().toISOString(),
      monto_base: f.saldo_pendiente || 0,
      saldo_pendiente: f.saldo_pendiente || 0,
    }))
    const representantes = familiasMora.map(f => ({
      familia_id: f.id,
      nombre: f.representante_nombre || f.representante || '-',
      email: f.email || '-',
    }))
    const moraData = buildMoraReport(cuotasMora, representantes, new Date())
    const doc = generateReporteMora(moraData)
    doc.save('reporte-mora-' + new Date().toISOString().slice(0, 10) + '.pdf')
  })

  return {
    teardown() {
      estadoDoc = null
    },
  }
}
