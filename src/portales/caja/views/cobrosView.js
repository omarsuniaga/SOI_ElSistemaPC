import { obtenerBalanceAlumnos, obtenerPagosAlumno, registrarPagosLote } from '../../../modules/finanzas/api/finanzasApi.js'
import { generarReciboCobro } from '../utils/reciboPdf.js'

const MONTO_MENSUALIDAD = 600

function buildMonthWindow(today = new Date()) {
  const base = new Date(today.getFullYear(), today.getMonth(), 1)
  const months = []
  for (let i = 12; i >= 1; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1)
    months.push(d)
  }
  months.push(base)
  for (let i = 1; i <= 6; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() + i, 1)
    months.push(d)
  }
  return months.map(d => ({
    date: d,
    key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`,
    label: d.toLocaleDateString('es-DO', { year: 'numeric', month: 'short' }),
    isFuture: d > base,
    isCurrent: d.getTime() === base.getTime(),
  }))
}

function monthIsPaid(key, pagosAlumno) {
  return pagosAlumno.some(p => p.concepto === 'mensualidad' && p.periodo_mes?.startsWith(key.slice(0, 7)))
}

function cellStyle(isPaid, isFuture, isCurrent, checked) {
  if (isPaid) return 'background:#dcfce7;color:#166534;border:2px solid #86efac'
  if (isFuture) return `background:${checked ? '#dbeafe' : '#f8fafc'};color:${checked ? '#1d4ed8' : '#94a3b8'};border:2px solid ${checked ? '#93c5fd' : '#e2e8f0'}`
  return `background:${checked ? '#fee2e2' : '#fff5f5'};color:#991b1b;border:2px solid ${checked ? '#fca5a5' : '#fecaca'}`
}

function renderMonthGrid(months, pagosAlumno, checkedKeys) {
  return months.map(m => {
    const paid = monthIsPaid(m.key, pagosAlumno)
    const checked = checkedKeys.has(m.key)
    const style = cellStyle(paid, m.isFuture, m.isCurrent, checked)
    const canToggle = !paid

    return `
      <div class="month-cell" data-key="${m.key}" data-future="${m.isFuture}" data-paid="${paid}"
        style="border-radius:8px;padding:0.5rem 0.4rem;text-align:center;cursor:${canToggle ? 'pointer' : 'default'};
          user-select:none;transition:all 0.15s;min-width:68px;${style}">
        ${paid
          ? `<div style="font-size:0.95rem">✅</div>`
          : `<div style="font-size:0.95rem">${checked ? (m.isFuture ? '☑️' : '❌') : (m.isFuture ? '⬜' : '☐')}</div>`}
        <div style="font-size:0.7rem;font-weight:600;margin-top:2px;line-height:1.2">${m.label}</div>
        ${m.isCurrent && !paid ? '<div style="font-size:0.6rem;margin-top:1px;opacity:0.7">Actual</div>' : ''}
      </div>
    `
  }).join('')
}

export async function renderCobrosView(container, session, initialStudent = null) {
  const ctrl = new AbortController()
  const { signal } = ctrl
  const today = new Date()
  const months = buildMonthWindow(today)

  let allAlumnos = []
  let selectedAlumno = null
  let pagosAlumno = []
  let checkedKeys = new Set()
  let metodo = 'Efectivo'

  container.innerHTML = `
    <style>
      #alumno-search:focus {
        border-color: #059669 !important;
        box-shadow: 0 0 0 2px rgba(5, 150, 105, 0.1);
      }
      .search-item:hover {
        background: #f0fdf4 !important;
      }
    </style>
    <div style="padding:1.5rem;max-width:900px;margin:0 auto">
      <div style="margin-bottom:1.25rem">
        <div style="position:relative">
          <i class="bi bi-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#94a3b8"></i>
          <input id="alumno-search" type="text" placeholder="Buscar alumno por nombre..."
            style="width:100%;padding:0.75rem 0.75rem 0.75rem 2.5rem;border:1px solid #e2e8f0;
              border-radius:10px;font-size:0.9rem;outline:none;background:#fff;box-sizing:border-box;
              transition:border-color 0.15s, box-shadow 0.15s" />
        </div>
        <div id="search-results" style="background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 10px 10px;
          display:none;max-height:220px;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,0.08)"></div>
      </div>

      <div id="cobro-panel" style="display:none">
        <div id="alumno-card"
          style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:1rem 1.25rem;margin-bottom:1rem;
            display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <div style="width:38px;height:38px;background:#dcfce7;border-radius:50%;
              display:flex;align-items:center;justify-content:center">
              <i class="bi bi-person" style="color:#059669;font-size:1rem"></i>
            </div>
            <div>
              <div id="alumno-nombre" style="font-weight:700;color:#0f172a;font-size:0.95rem"></div>
              <div id="alumno-estado-badge" style="margin-top:2px"></div>
            </div>
          </div>
          <button id="btn-cambiar"
            style="background:#f1f5f9;border:1px solid #e2e8f0;color:#64748b;border-radius:8px;
              padding:0.3rem 0.75rem;font-size:0.8rem;cursor:pointer">
            Cambiar alumno
          </button>
        </div>

        <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:1.25rem;margin-bottom:1rem">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;flex-wrap:wrap;gap:0.5rem">
            <span style="font-weight:600;color:#0f172a;font-size:0.9rem">
              <i class="bi bi-calendar3 me-1" style="color:#059669"></i>Seleccionar meses
            </span>
            <div style="display:flex;gap:0.5rem">
              <button id="btn-pendientes"
                style="background:#fee2e2;color:#991b1b;border:1px solid #fecaca;border-radius:7px;
                  padding:0.3rem 0.75rem;font-size:0.78rem;cursor:pointer;font-weight:500">
                Marcar pendientes
              </button>
              <button id="btn-limpiar"
                style="background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;border-radius:7px;
                  padding:0.3rem 0.75rem;font-size:0.78rem;cursor:pointer">
                Limpiar
              </button>
            </div>
          </div>
          <div id="month-grid" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:flex-start"></div>
        </div>

        <div style="background:#fff;border-radius:12px;border:1px solid #e2e8f0;padding:1.25rem">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;flex-wrap:wrap;gap:0.75rem">
            <div>
              <div style="font-size:0.75rem;color:#64748b;font-weight:500;text-transform:uppercase;letter-spacing:0.04em">Total a cobrar</div>
              <div id="total-label" style="font-size:1.75rem;font-weight:800;color:#0f172a">RD$ 0</div>
              <div id="meses-label" style="font-size:0.8rem;color:#64748b;margin-top:1px">0 meses seleccionados</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.5rem;align-items:flex-end">
              <div style="font-size:0.8rem;color:#64748b;font-weight:500">Método de pago</div>
              <div style="display:flex;gap:0.5rem">
                <button class="btn-metodo active-metodo" data-m="Efectivo"
                  style="border-radius:8px;padding:0.4rem 1rem;font-size:0.85rem;cursor:pointer;font-weight:500;
                    background:#059669;color:#fff;border:2px solid #059669">
                  <i class="bi bi-cash me-1"></i>Efectivo
                </button>
                <button class="btn-metodo" data-m="Transferencia"
                  style="border-radius:8px;padding:0.4rem 1rem;font-size:0.85rem;cursor:pointer;font-weight:500;
                    background:#fff;color:#64748b;border:2px solid #e2e8f0">
                  <i class="bi bi-phone me-1"></i>Transferencia
                </button>
              </div>
            </div>
          </div>
          <button id="btn-confirmar" disabled
            style="width:100%;background:#059669;color:#fff;border:none;border-radius:10px;
              padding:0.85rem;font-size:0.95rem;font-weight:700;cursor:pointer;
              opacity:0.5;transition:opacity 0.2s">
            <i class="bi bi-receipt me-2"></i>Registrar cobro y generar recibo
          </button>
          <div id="cobro-error" style="display:none;margin-top:0.75rem;padding:0.6rem 0.85rem;
            background:#fee2e2;color:#991b1b;border-radius:8px;font-size:0.85rem"></div>
        </div>
      </div>

      <div id="cobro-placeholder" style="text-align:center;padding:4rem 1rem;color:#94a3b8">
        <i class="bi bi-search" style="font-size:2.5rem;display:block;margin-bottom:0.75rem"></i>
        <div style="font-size:0.95rem">Buscá un alumno para registrar un cobro</div>
      </div>
    </div>
  `

  // Load all alumnos for search
  const { data: balData } = await obtenerBalanceAlumnos()
  allAlumnos = balData?.alumnos ?? []

  function refreshGrid() {
    const grid = container.querySelector('#month-grid')
    if (!grid) return
    grid.innerHTML = renderMonthGrid(months, pagosAlumno, checkedKeys)
    const count = checkedKeys.size
    const total = count * MONTO_MENSUALIDAD
    container.querySelector('#total-label').textContent = `RD$ ${total.toLocaleString('es-DO')}`
    container.querySelector('#meses-label').textContent = `${count} ${count === 1 ? 'mes' : 'meses'} seleccionado${count !== 1 ? 's' : ''}`
    const btn = container.querySelector('#btn-confirmar')
    btn.disabled = count === 0
    btn.style.opacity = count === 0 ? '0.5' : '1'
    btn.style.cursor = count === 0 ? 'default' : 'pointer'

    grid.querySelectorAll('.month-cell').forEach(cell => {
      if (cell.dataset.paid === 'true') return
      cell.addEventListener('click', () => {
        const k = cell.dataset.key
        if (checkedKeys.has(k)) checkedKeys.delete(k)
        else checkedKeys.add(k)
        refreshGrid()
      }, { signal, once: true })
    })
  }

  async function selectAlumno(alumno) {
    selectedAlumno = alumno
    checkedKeys = new Set()
    container.querySelector('#alumno-search').value = ''
    container.querySelector('#search-results').style.display = 'none'
    container.querySelector('#cobro-placeholder').style.display = 'none'
    container.querySelector('#cobro-panel').style.display = 'block'
    container.querySelector('#alumno-nombre').textContent = alumno.nombre_completo

    const { data } = await obtenerPagosAlumno(alumno.id)
    pagosAlumno = data ?? []

    // Pre-select pending past months
    months.forEach(m => {
      if (!m.isFuture && !monthIsPaid(m.key, pagosAlumno)) {
        checkedKeys.add(m.key)
      }
    })

    // Estado badge
    const pendingCount = months.filter(m => !m.isFuture && !monthIsPaid(m.key, pagosAlumno)).length
    const badge = container.querySelector('#alumno-estado-badge')
    if (alumno.exento_mensualidad) {
      badge.innerHTML = '<span style="font-size:0.75rem;background:#e0e7ff;color:#3730a3;border-radius:6px;padding:2px 8px;font-weight:600">Exento</span>'
    } else if (pendingCount === 0) {
      badge.innerHTML = '<span style="font-size:0.75rem;background:#dcfce7;color:#166534;border-radius:6px;padding:2px 8px;font-weight:600">Al día ✓</span>'
    } else {
      badge.innerHTML = `<span style="font-size:0.75rem;background:#fee2e2;color:#991b1b;border-radius:6px;padding:2px 8px;font-weight:600">${pendingCount} mes${pendingCount !== 1 ? 'es' : ''} pendiente${pendingCount !== 1 ? 's' : ''}</span>`
    }

    refreshGrid()
  }

  // Search logic
  const searchInput = container.querySelector('#alumno-search')
  const searchResults = container.querySelector('#search-results')

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase()
    if (q.length < 1) { searchResults.style.display = 'none'; return }
    const matches = allAlumnos.filter(a => a.nombre_completo.toLowerCase().includes(q)).slice(0, 8)
    if (matches.length === 0) {
      searchResults.innerHTML = `<div style="padding:0.75rem 1rem;color:#94a3b8;font-size:0.875rem">Sin resultados</div>`
    } else {
      searchResults.innerHTML = matches.map(a => `
        <div class="search-item" data-id="${a.id}"
          style="padding:0.7rem 1rem;cursor:pointer;font-size:0.875rem;color:#0f172a;
            border-bottom:1px solid #f1f5f9;transition:background 0.1s">
          <i class="bi bi-person-circle me-2" style="color:#059669"></i>${a.nombre_completo}
        </div>
      `).join('')
    }
    searchResults.style.display = 'block'
    searchResults.querySelectorAll('.search-item').forEach(item => {
      item.addEventListener('click', () => {
        const alumno = allAlumnos.find(a => a.id === item.dataset.id)
        if (alumno) selectAlumno(alumno)
      }, { signal })
    })
  }, { signal })

  document.addEventListener('click', (e) => {
    if (!container.querySelector('#alumno-search')?.contains(e.target) &&
        !searchResults.contains(e.target)) {
      searchResults.style.display = 'none'
    }
  }, { signal })

  // Pending button
  container.querySelector('#btn-pendientes')?.addEventListener('click', () => {
    checkedKeys = new Set()
    months.forEach(m => {
      if (!m.isFuture && !monthIsPaid(m.key, pagosAlumno)) checkedKeys.add(m.key)
    })
    refreshGrid()
  }, { signal })

  // Clear button
  container.querySelector('#btn-limpiar')?.addEventListener('click', () => {
    checkedKeys = new Set()
    refreshGrid()
  }, { signal })

  // Method buttons
  container.querySelectorAll('.btn-metodo').forEach(btn => {
    btn.addEventListener('click', () => {
      metodo = btn.dataset.m
      container.querySelectorAll('.btn-metodo').forEach(b => {
        const active = b === btn
        b.style.background = active ? '#059669' : '#fff'
        b.style.color = active ? '#fff' : '#64748b'
        b.style.borderColor = active ? '#059669' : '#e2e8f0'
      })
    }, { signal })
  })

  // Change student
  container.querySelector('#btn-cambiar')?.addEventListener('click', () => {
    selectedAlumno = null
    pagosAlumno = []
    checkedKeys = new Set()
    container.querySelector('#cobro-panel').style.display = 'none'
    container.querySelector('#cobro-placeholder').style.display = 'block'
    container.querySelector('#alumno-search').value = ''
    container.querySelector('#alumno-search').focus()
  }, { signal })

  // Confirm
  container.querySelector('#btn-confirmar')?.addEventListener('click', async () => {
    if (checkedKeys.size === 0 || !selectedAlumno) return
    const btn = container.querySelector('#btn-confirmar')
    const errEl = container.querySelector('#cobro-error')
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...'
    errEl.style.display = 'none'

    const cajeroId = session?.user?.id
    const pagos = [...checkedKeys].sort().map(key => ({
      alumno_id: selectedAlumno.id,
      concepto: 'mensualidad',
      periodo_mes: key,
      monto: MONTO_MENSUALIDAD,
      metodo_pago: metodo.toLowerCase(),
      cajero_id: cajeroId,
    }))

    const { error } = await registrarPagosLote(pagos)

    if (error) {
      errEl.textContent = `Error al registrar: ${error.message}`
      errEl.style.display = 'block'
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-receipt me-2"></i>Registrar cobro y generar recibo'
      return
    }

    const numero = Date.now() % 1000000
    const mesesLabels = [...checkedKeys].sort().map(key => {
      const m = months.find(mo => mo.key === key)
      return { key, label: m?.label ?? key }
    })

    generarReciboCobro({
      alumno: selectedAlumno,
      meses: mesesLabels,
      monto: checkedKeys.size * MONTO_MENSUALIDAD,
      metodo,
      cajero: session?.user?.email ?? 'Cajero',
      numero,
    })

    // Reload payments and refresh
    const { data } = await obtenerPagosAlumno(selectedAlumno.id)
    pagosAlumno = data ?? []
    checkedKeys = new Set()
    refreshGrid()

    btn.disabled = false
    btn.innerHTML = '<i class="bi bi-receipt me-2"></i>Registrar cobro y generar recibo'

    // Confirmation flash
    const flash = document.createElement('div')
    flash.style.cssText = 'position:fixed;top:70px;right:1.5rem;background:#059669;color:#fff;border-radius:10px;padding:0.75rem 1.25rem;font-size:0.875rem;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.15)'
    flash.textContent = `✅ Cobro registrado — RD$ ${(checkedKeys.size * MONTO_MENSUALIDAD || mesesLabels.length * MONTO_MENSUALIDAD).toLocaleString('es-DO')}`
    document.body.appendChild(flash)
    setTimeout(() => flash.remove(), 3500)
  }, { signal })

  if (initialStudent) {
    const fullStudent = allAlumnos.find(a => a.id === initialStudent.id)
    selectAlumno(fullStudent || initialStudent)
  }

  return { teardown: () => ctrl.abort() }
}
