import { obtenerBalanceAlumnos, obtenerCobradoHoy } from '../../../modules/finanzas/api/finanzasApi.js'
import { calcularEstadoFinanciero } from '../../../modules/finanzas/domain/cobranza.js'

const BADGE = {
  verde:    'background:#dcfce7;color:#166534;border:1px solid #bbf7d0',
  amarillo: 'background:#fef9c3;color:#854d0e;border:1px solid #fef08a',
  rojo:     'background:#fee2e2;color:#991b1b;border:1px solid #fecaca',
}

const SORT_ORDER = { rojo: 0, amarillo: 1, verde: 2 }

export async function renderCajaDashboardHomeView(container, onCobrar) {
  const ctrl = new AbortController()
  const { signal } = ctrl

  container.innerHTML = `
    <style>
      .balance-row:hover {
        background: #f8fafc !important;
      }
    </style>
    <div style="padding:1.5rem">
      <div id="kpi-row" style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.5rem">
        <div class="kpi-skeleton" style="${skeletonStyle()}"></div>
        <div class="kpi-skeleton" style="${skeletonStyle()}"></div>
        <div class="kpi-skeleton" style="${skeletonStyle()}"></div>
        <div class="kpi-skeleton" style="${skeletonStyle()}"></div>
      </div>
      <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
        <div style="padding:1rem 1.25rem;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:0.5rem">
          <i class="bi bi-traffic-light" style="color:#059669;font-size:1rem"></i>
          <span style="font-weight:600;color:#0f172a">Semáforo de Alumnos</span>
        </div>
        <div id="semaforo-body" style="padding:1rem">
          <div style="color:#64748b;text-align:center;padding:2rem;font-size:0.875rem">Cargando...</div>
        </div>
      </div>
    </div>
  `

  const [{ data: balData, error: balErr }, { data: cobradoHoy }] = await Promise.all([
    obtenerBalanceAlumnos(),
    obtenerCobradoHoy(),
  ])

  if (balErr || !balData) {
    container.querySelector('#semaforo-body').innerHTML =
      `<div class="alert alert-danger m-3 small">Error al cargar datos: ${balErr?.message}</div>`
    return { teardown: () => ctrl.abort() }
  }

  const { alumnos, pagos } = balData
  const hoy = new Date()

  const alumnosConEstado = alumnos.map(a => {
    const pagosA = pagos.filter(p => p.alumno_id === a.id)
    const estado = calcularEstadoFinanciero(a, pagosA, hoy)
    return { ...a, ...estado }
  })

  alumnosConEstado.sort((a, b) => {
    const diff = SORT_ORDER[a.estado] - SORT_ORDER[b.estado]
    if (diff !== 0) return diff
    return b.dias - a.dias
  })

  const counts = { verde: 0, amarillo: 0, rojo: 0 }
  alumnosConEstado.forEach(a => counts[a.estado]++)

  // KPI cards
  container.querySelector('#kpi-row').innerHTML = `
    ${kpiCard('bi-currency-dollar', 'Cobrado hoy', `RD$ ${(cobradoHoy ?? 0).toLocaleString('es-DO')}`, '#059669', '#dcfce7')}
    ${kpiCard('bi-check-circle', 'Al día', counts.verde, '#2563eb', '#dbeafe')}
    ${kpiCard('bi-exclamation-triangle', 'En mora', counts.amarillo, '#d97706', '#fef3c7')}
    ${kpiCard('bi-x-octagon', 'Bloqueados', counts.rojo, '#dc2626', '#fee2e2')}
  `

  // Semaphore table
  if (alumnosConEstado.length === 0) {
    container.querySelector('#semaforo-body').innerHTML =
      `<div style="color:#64748b;text-align:center;padding:2rem;font-size:0.875rem">No hay alumnos activos.</div>`
    return { teardown: () => ctrl.abort() }
  }

  container.querySelector('#semaforo-body').innerHTML = `
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:0.875rem">
        <thead>
          <tr style="background:#f8fafc;color:#64748b;text-align:left">
            <th style="padding:0.6rem 0.75rem;font-weight:600;border-bottom:1px solid #e2e8f0">Alumno</th>
            <th style="padding:0.6rem 0.75rem;font-weight:600;border-bottom:1px solid #e2e8f0">Estado</th>
            <th style="padding:0.6rem 0.75rem;font-weight:600;border-bottom:1px solid #e2e8f0;text-align:center">Mora (días)</th>
            <th style="padding:0.6rem 0.75rem;font-weight:600;border-bottom:1px solid #e2e8f0;text-align:right"></th>
          </tr>
        </thead>
        <tbody>
          ${alumnosConEstado.map(a => `
            <tr class="balance-row" style="border-bottom:1px solid #f1f5f9;transition:background 0.15s">
              <td style="padding:0.65rem 0.75rem;font-weight:500;color:#0f172a">
                ${a.nombre_completo}
                ${a.exento_mensualidad ? '<span style="font-size:0.7rem;background:#e0e7ff;color:#3730a3;border-radius:4px;padding:0 5px;margin-left:6px">Exento</span>' : ''}
              </td>
              <td style="padding:0.65rem 0.75rem">
                <span style="font-size:0.75rem;font-weight:600;border-radius:6px;padding:3px 8px;${BADGE[a.estado]}">
                  ${a.etiqueta}
                </span>
              </td>
              <td style="padding:0.65rem 0.75rem;text-align:center;color:${a.dias > 0 ? '#dc2626' : '#64748b'}">
                ${a.dias === 999 ? '—' : a.dias > 0 ? a.dias : '0'}
              </td>
              <td style="padding:0.65rem 0.75rem;text-align:right">
                ${!a.exento_mensualidad && a.estado !== 'verde'
                  ? `<button class="btn-cobrar" data-id="${a.id}" data-nombre="${a.nombre_completo}"
                      style="background:#059669;color:#fff;border:none;border-radius:7px;
                      padding:0.3rem 0.85rem;font-size:0.8rem;cursor:pointer;font-weight:500">
                      <i class="bi bi-cash me-1"></i>Cobrar
                    </button>`
                  : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `

  container.querySelectorAll('.btn-cobrar').forEach(btn => {
    btn.addEventListener('click', () => {
      onCobrar?.({ id: btn.dataset.id, nombre_completo: btn.dataset.nombre })
    }, { signal })
  })

  return { teardown: () => ctrl.abort() }
}

function kpiCard(icon, label, value, color, bg) {
  return `
    <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:1.1rem 1.25rem;
      display:flex;align-items:center;gap:0.85rem">
      <div style="width:42px;height:42px;border-radius:10px;background:${bg};
        display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <i class="bi ${icon}" style="font-size:1.1rem;color:${color}"></i>
      </div>
      <div>
        <div style="font-size:0.75rem;color:#64748b;font-weight:500;letter-spacing:0.02em;text-transform:uppercase">${label}</div>
        <div style="font-size:1.25rem;font-weight:700;color:#0f172a;margin-top:1px">${value}</div>
      </div>
    </div>
  `
}

function skeletonStyle() {
  return 'background:#e2e8f0;border-radius:12px;height:72px;animation:pulse 1.5s ease-in-out infinite'
}
