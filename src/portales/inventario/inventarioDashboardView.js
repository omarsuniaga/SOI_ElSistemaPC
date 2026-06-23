import { supabase } from '../../lib/supabaseClient.js'
import { renderStockInstrumentosView } from '../../modules/inventario/views/stockInstrumentosView.js'
import { renderControlComodatosView } from '../../modules/inventario/views/controlComodatosView.js'
import { renderAlertasComodatosView } from '../../modules/inventario/views/alertasComodatosView.js'
import { renderDetalleInstrumentoView } from '../../modules/inventario/views/detalleInstrumentoView.js'
import { renderHistorialInstrumentoView } from '../../modules/inventario/views/historialInstrumentoView.js'
import { renderDashboardInventarioView } from '../../modules/inventario/views/dashboardInventarioView.js'
import { renderTareasView } from '../../modules/hermes/views/tareasView.js'

export function renderInventarioPortal(app, session) {
  const userEmail = session?.user?.email ?? 'Usuario'

  app.style.background = '#f8fafc'
  app.innerHTML = `
    <nav style="background:linear-gradient(90deg,#2563eb,#0891b2);color:#fff;
      padding:0 1.5rem;height:56px;display:flex;align-items:center;
      justify-content:space-between;box-shadow:0 2px 8px rgba(0,0,0,0.15);position:sticky;top:0;z-index:100">
      <div style="display:flex;align-items:center;gap:0.75rem">
        <i class="bi bi-music-note-list" style="font-size:1.25rem"></i>
        <span style="font-weight:700;font-size:1rem;letter-spacing:0.02em">Portal de Inventario</span>
      </div>
      <div style="display:flex;align-items:center;gap:1rem">
        <span style="font-size:0.8125rem;opacity:0.85">${userEmail}</span>
        <button id="btn-logout" style="background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);
          color:#fff;border-radius:8px;padding:0.25rem 0.75rem;font-size:0.8125rem;cursor:pointer">
          <i class="bi bi-box-arrow-right me-1"></i>Salir
        </button>
      </div>
    </nav>

    <div style="background:#fff;border-bottom:1px solid #e2e8f0;padding:0 1.5rem;display:flex;gap:0">
      <button class="portal-tab active" data-view="dashboard"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-speedometer2 me-1"></i>Inicio
      </button>
      <button class="portal-tab" data-view="stock"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-music-note-list me-1"></i>Instrumentos
      </button>
      <button class="portal-tab" data-view="comodatos"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-clipboard-check me-1"></i>Comodatos
      </button>
      <button class="portal-tab" data-view="alertas"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-exclamation-triangle me-1"></i>Alertas
      </button>
      <button class="portal-tab" data-view="tareas"
        style="border:none;background:none;padding:0.875rem 1.25rem;font-size:0.875rem;
        cursor:pointer;border-bottom:2px solid transparent;color:#64748b;font-weight:500">
        <i class="bi bi-list-task me-1"></i>Tareas (Hermes)
      </button>
    </div>

    <div id="portal-content" style="background:#f8fafc;min-height:calc(100vh - 105px)"></div>
  `

  const content = app.querySelector('#portal-content')
  let _teardown = null

  function showTab(viewName) {
    app.querySelectorAll('.portal-tab').forEach(tab => {
      const isActive = tab.dataset.view === viewName
      tab.style.borderBottomColor = isActive ? '#2563eb' : 'transparent'
      tab.style.color = isActive ? '#2563eb' : '#64748b'
    })

    _teardown?.teardown?.()

    if (viewName === 'dashboard') {
      renderDashboardInventarioView(content).then(r => { _teardown = r })
    } else if (viewName === 'stock') {
      renderStockInstrumentosView(content).then(r => { _teardown = r })
    } else if (viewName === 'comodatos') {
      renderControlComodatosView(content).then(r => { _teardown = r })
    } else if (viewName === 'alertas') {
      renderAlertasComodatosView(content).then(r => { _teardown = r })
    } else if (viewName === 'tareas') {
      renderTareasView(content, { departamento: 'LOG', hideCalendarBtn: true }).then(r => { _teardown = r })
    }
  }

  app.querySelectorAll('.portal-tab').forEach(tab => {
    tab.addEventListener('click', () => showTab(tab.dataset.view))
  })

  app.querySelector('#btn-logout')?.addEventListener('click', async () => {
    await supabase.auth.signOut()
    window.location.reload()
  })

  // Router interno: views navegan con window.router.navigate(ruta, params)
  window.router = {
    navigate: (path, params) => {
      if (path === 'inventario-dashboard') {
        showTab('dashboard')
      } else if (path === 'inventario-stock') {
        showTab('stock')
      } else if (path === 'inventario-comodatos') {
        showTab('comodatos')
      } else if (path === 'inventario-alertas') {
        showTab('alertas')
      } else if (path === 'inventario-tareas') {
        showTab('tareas')
      } else if (path === 'inventario-detalle') {
        _teardown?.teardown?.()
        renderDetalleInstrumentoView(content, params).then(r => { _teardown = r })
      } else if (path === 'inventario-historial') {
        _teardown?.teardown?.()
        renderHistorialInstrumentoView(content, params).then(r => { _teardown = r })
      }
    }
  }

  showTab('dashboard')
}
