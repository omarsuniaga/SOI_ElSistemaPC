/**
 * campanasView.js - Campaign management view
 * Route: #/campanas
 * Allows Katherine to create and manage recovery campaigns, view participations.
 */
import * as cajaApi from '../api/cajaApi.js'

const VERDE = '#059669'
const EMERALD_LIGHT = '#d1fae5'
const EMERALD_BORDER = '#6ee7b7'

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtMoney(val) {
  return '$' + Number(val || 0).toFixed(2)
}

function estadoBadge(campana) {
  const now = new Date()
  const fin = new Date(campana.fecha_fin)
  const inicio = new Date(campana.fecha_inicio)
  if (!campana.activa) return '<span style="background:#f1f5f9;color:#64748b;font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:9999px">Inactiva</span>'
  if (fin < now) return '<span style="background:#fef2f2;color:#dc2626;font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:9999px">Finalizada</span>'
  if (inicio > now) return '<span style="background:#fff7ed;color:#ea580c;font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:9999px">Proxima</span>'
  return '<span style="background:' + EMERALD_LIGHT + ';color:#059669;font-size:0.7rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:9999px">Activa</span>'
}

function campanaCard(campana) {
  return '<div class="camp-card" data-id="' + campana.id + '" style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:1.25rem;margin-bottom:1rem">'
    + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem">'
    + '<div style="flex:1;min-width:0">'
    + '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.35rem">'
    + estadoBadge(campana)
    + '<span style="font-size:1rem;font-weight:700;color:#0f172a">' + campana.nombre + '</span>'
    + '</div>'
    + (campana.descripcion ? '<p style="margin:0 0 0.5rem;font-size:0.8125rem;color:#475569">' + campana.descripcion + '</p>' : '')
    + '<div style="display:flex;gap:1.25rem;flex-wrap:wrap;font-size:0.75rem;color:#64748b">'
    + '<span><i class="bi bi-calendar-event me-1"></i>' + fmtDate(campana.fecha_inicio) + ' — ' + fmtDate(campana.fecha_fin) + '</span>'
    + (campana.incentivo ? '<span><i class="bi bi-gift me-1"></i>' + campana.incentivo + '</span>' : '')
    + '</div>'
    + '</div>'
    + '<button class="btn-ver-participaciones" data-id="' + campana.id + '" data-nombre="' + campana.nombre + '"'
    + ' style="flex-shrink:0;background:' + EMERALD_LIGHT + ';border:1px solid ' + EMERALD_BORDER + ';color:#065f46;'
    + 'border-radius:8px;padding:0.375rem 0.75rem;font-size:0.8125rem;font-weight:600;cursor:pointer;white-space:nowrap">'
    + '<i class="bi bi-people me-1"></i>Ver participantes</button>'
    + '</div>'
    + '</div>'
}

function newCampanaForm() {
  const today = new Date().toISOString().slice(0, 10)
  return '<div id="form-campana" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:1.5rem;margin-bottom:1.5rem">'
    + '<h3 style="margin:0 0 1rem;font-size:1rem;font-weight:700;color:#0f172a">Nueva Campana de Recuperacion</h3>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">'
    + '<div style="grid-column:1/-1">'
    + '<label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.3rem">Nombre *</label>'
    + '<input id="camp-nombre" type="text" placeholder="Ej: Campana Puntualidad Junio" required'
    + ' style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;box-sizing:border-box">'
    + '</div>'
    + '<div style="grid-column:1/-1">'
    + '<label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.3rem">Descripcion</label>'
    + '<textarea id="camp-descripcion" rows="2" placeholder="Descripcion breve de la campana..."'
    + ' style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;resize:vertical;box-sizing:border-box"></textarea>'
    + '</div>'
    + '<div style="grid-column:1/-1">'
    + '<label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.3rem">Incentivo</label>'
    + '<input id="camp-incentivo" type="text" placeholder="Ej: 5% descuento proximo mes, prioridad en turnos..."'
    + ' style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;box-sizing:border-box">'
    + '</div>'
    + '<div>'
    + '<label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.3rem">Fecha inicio *</label>'
    + '<input id="camp-inicio" type="date" value="' + today + '" required'
    + ' style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;box-sizing:border-box">'
    + '</div>'
    + '<div>'
    + '<label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.3rem">Fecha fin *</label>'
    + '<input id="camp-fin" type="date" required'
    + ' style="width:100%;border:1px solid #d1d5db;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;box-sizing:border-box">'
    + '</div>'
    + '</div>'
    + '<div style="display:flex;gap:0.75rem;margin-top:1rem;justify-content:flex-end">'
    + '<button id="btn-cancel-form" style="background:#fff;border:1px solid #d1d5db;color:#374151;border-radius:8px;'
    + 'padding:0.5rem 1rem;font-size:0.875rem;cursor:pointer">Cancelar</button>'
    + '<button id="btn-submit-campana" style="background:' + VERDE + ';border:none;color:#fff;border-radius:8px;'
    + 'padding:0.5rem 1.25rem;font-size:0.875rem;font-weight:600;cursor:pointer">'
    + '<i class="bi bi-plus-circle me-1"></i>Crear Campana</button>'
    + '</div>'
    + '</div>'
}

function participacionesOverlay(nombre, participaciones, familias) {
  const rows = participaciones.length === 0
    ? '<tr><td colspan="3" style="text-align:center;padding:1.5rem;color:#94a3b8">Sin participaciones registradas</td></tr>'
    : participaciones.map(p => {
        const nomFam = p.familias?.nombre_familia || p.familia_id
        return '<tr>'
          + '<td style="padding:0.6rem 0.75rem;font-size:0.8125rem;color:#0f172a">' + nomFam + '</td>'
          + '<td style="padding:0.6rem 0.75rem;text-align:center">'
          + (p.aceptada ? '<span style="color:' + VERDE + ';font-weight:700">Si</span>' : '<span style="color:#94a3b8">No</span>')
          + '</td>'
          + '<td style="padding:0.6rem 0.75rem;text-align:right;font-size:0.8125rem">' + fmtMoney(p.monto_recuperado) + '</td>'
          + '</tr>'
      }).join('')

  const familiaOptions = familias.map(f =>
    '<option value="' + f.id + '">' + f.nombre_familia + '</option>'
  ).join('')

  return '<div id="participaciones-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:500;display:flex;align-items:center;justify-content:center;padding:1rem">'
    + '<div style="background:#fff;border-radius:16px;width:100%;max-width:680px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3)">'
    + '<div style="padding:1.25rem 1.5rem;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between">'
    + '<h3 style="margin:0;font-size:1rem;font-weight:700;color:#0f172a">Participantes: ' + nombre + '</h3>'
    + '<button id="btn-close-overlay" style="background:none;border:none;cursor:pointer;font-size:1.25rem;color:#94a3b8;line-height:1">&#x2715;</button>'
    + '</div>'
    + '<div style="overflow-y:auto;flex:1;padding:1.25rem">'
    + '<div style="margin-bottom:1.25rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:1rem">'
    + '<p style="margin:0 0 0.75rem;font-size:0.875rem;font-weight:600;color:#374151">Registrar participacion</p>'
    + '<div style="display:flex;gap:0.75rem;align-items:center">'
    + '<select id="sel-familia" style="flex:1;border:1px solid #d1d5db;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem">'
    + '<option value="">Seleccionar familia...</option>'
    + familiaOptions
    + '</select>'
    + '<button id="btn-registrar-part" style="background:' + VERDE + ';border:none;color:#fff;border-radius:8px;'
    + 'padding:0.5rem 1rem;font-size:0.875rem;font-weight:600;cursor:pointer;white-space:nowrap">'
    + '<i class="bi bi-check2-circle me-1"></i>Registrar</button>'
    + '</div>'
    + '</div>'
    + '<table style="width:100%;border-collapse:collapse">'
    + '<thead><tr style="background:#f8fafc">'
    + '<th style="padding:0.6rem 0.75rem;text-align:left;font-size:0.75rem;font-weight:700;color:#64748b;border-bottom:1px solid #e2e8f0">Familia</th>'
    + '<th style="padding:0.6rem 0.75rem;text-align:center;font-size:0.75rem;font-weight:700;color:#64748b;border-bottom:1px solid #e2e8f0">Acepto</th>'
    + '<th style="padding:0.6rem 0.75rem;text-align:right;font-size:0.75rem;font-weight:700;color:#64748b;border-bottom:1px solid #e2e8f0">Monto recuperado</th>'
    + '</tr></thead>'
    + '<tbody id="participaciones-tbody">' + rows + '</tbody>'
    + '</table>'
    + '</div>'
    + '</div>'
    + '</div>'
}

export async function render(container, session) {
  container.innerHTML = '<div style="padding:1.5rem"><p style="color:#94a3b8">Cargando campanas...</p></div>'

  const { data: campanas, error } = await cajaApi.getCampanas()
  let { data: familias } = await cajaApi.getFamilias()

  if (error) {
    container.innerHTML = '<div style="padding:1.5rem"><p style="color:#ef4444">Error al cargar campanas de recuperacion.</p></div>'
    return { teardown() {} }
  }

  const campanasArr = campanas || []
  familias = familias || []

  let showForm = false
  let overlayActiveCampanaId = null
  let overlayActiveCampanaNombre = null

  function renderView() {
    container.innerHTML =
      '<div style="padding:1.5rem;max-width:860px">'
      + '<div style="margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem">'
      + '<div>'
      + '<h2 style="margin:0;font-size:1.375rem;font-weight:800;color:#0f172a">Campanas de Recuperacion</h2>'
      + '<p style="margin:0.25rem 0 0;font-size:0.875rem;color:#64748b">'
      + campanasArr.length + ' campana' + (campanasArr.length !== 1 ? 's' : '') + ' registrada' + (campanasArr.length !== 1 ? 's' : '')
      + '</p>'
      + '</div>'
      + '<button id="btn-nueva-campana" style="background:' + VERDE + ';border:none;color:#fff;border-radius:10px;'
      + 'padding:0.5rem 1.125rem;font-size:0.875rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:0.4rem">'
      + '<i class="bi bi-plus-lg"></i>Nueva Campana</button>'
      + '</div>'
      + (showForm ? newCampanaForm() : '')
      + '<div id="campanas-list">'
      + (campanasArr.length === 0
        ? '<div style="text-align:center;padding:3rem 1rem;background:#fff;border:1px solid #e2e8f0;border-radius:12px">'
          + '<i class="bi bi-megaphone" style="font-size:2.5rem;color:#cbd5e1;display:block;margin-bottom:0.75rem"></i>'
          + '<p style="color:#94a3b8;margin:0">No hay campanas registradas. Crea la primera.</p>'
          + '</div>'
        : campanasArr.map(campanaCard).join(''))
      + '</div>'
      + '</div>'

    // Nueva campana toggle
    container.querySelector('#btn-nueva-campana')?.addEventListener('click', () => {
      showForm = true
      renderView()
    })

    // Cancel form
    container.querySelector('#btn-cancel-form')?.addEventListener('click', () => {
      showForm = false
      renderView()
    })

    // Submit new campana
    container.querySelector('#btn-submit-campana')?.addEventListener('click', async () => {
      const nombre = container.querySelector('#camp-nombre')?.value?.trim()
      const descripcion = container.querySelector('#camp-descripcion')?.value?.trim()
      const incentivo = container.querySelector('#camp-incentivo')?.value?.trim()
      const fecha_inicio = container.querySelector('#camp-inicio')?.value
      const fecha_fin = container.querySelector('#camp-fin')?.value

      if (!nombre || !fecha_inicio || !fecha_fin) {
        alert('Completa los campos obligatorios: nombre, fecha inicio y fecha fin.')
        return
      }
      if (fecha_fin < fecha_inicio) {
        alert('La fecha de fin debe ser posterior a la fecha de inicio.')
        return
      }

      const btn = container.querySelector('#btn-submit-campana')
      btn.disabled = true
      btn.textContent = 'Creando...'

      const { data, error: createErr } = await cajaApi.createCampana({
        nombre,
        descripcion: descripcion || null,
        incentivo: incentivo || null,
        fecha_inicio,
        fecha_fin,
        creado_por: session.user.id,
        activa: true,
      })

      if (createErr || !data) {
        alert('Error al crear la campana. Intenta nuevamente.')
        btn.disabled = false
        btn.innerHTML = '<i class="bi bi-plus-circle me-1"></i>Crear Campana'
        return
      }

      campanasArr.unshift(data)
      showForm = false
      renderView()
    })

    // Ver participaciones buttons
    container.querySelectorAll('.btn-ver-participaciones').forEach(btn => {
      btn.addEventListener('click', async () => {
        const campanaId = btn.dataset.id
        const campanaNombre = btn.dataset.nombre
        overlayActiveCampanaId = campanaId
        overlayActiveCampanaNombre = campanaNombre
        await openOverlay(campanaId, campanaNombre)
      })
    })
  }

  async function openOverlay(campanaId, campanaNombre) {
    const { data: parts } = await cajaApi.getCampanaParticipaciones(campanaId)
    const participaciones = parts || []

    const overlayDiv = document.createElement('div')
    overlayDiv.innerHTML = participacionesOverlay(campanaNombre, participaciones, familias)
    const overlayEl = overlayDiv.firstChild
    document.body.appendChild(overlayEl)

    // Close overlay
    overlayEl.querySelector('#btn-close-overlay')?.addEventListener('click', () => {
      document.body.removeChild(overlayEl)
    })
    overlayEl.addEventListener('click', (e) => {
      if (e.target === overlayEl) document.body.removeChild(overlayEl)
    })

    // Registrar participacion
    overlayEl.querySelector('#btn-registrar-part')?.addEventListener('click', async () => {
      const sel = overlayEl.querySelector('#sel-familia')
      const familia_id = sel?.value
      if (!familia_id) { alert('Selecciona una familia.'); return }

      const btnReg = overlayEl.querySelector('#btn-registrar-part')
      btnReg.disabled = true
      btnReg.textContent = 'Registrando...'

      const { data: newPart, error: partErr } = await cajaApi.registrarParticipacion(campanaId, familia_id)

      if (partErr || !newPart) {
        alert('Error al registrar participacion.')
        btnReg.disabled = false
        btnReg.innerHTML = '<i class="bi bi-check2-circle me-1"></i>Registrar'
        return
      }

      // Update table
      const tbody = overlayEl.querySelector('#participaciones-tbody')
      const nomFam = familias.find(f => f.id === familia_id)?.nombre_familia || familia_id
      const newRow = document.createElement('tr')
      newRow.innerHTML = '<td style="padding:0.6rem 0.75rem;font-size:0.8125rem;color:#0f172a">' + nomFam + '</td>'
        + '<td style="padding:0.6rem 0.75rem;text-align:center"><span style="color:' + VERDE + ';font-weight:700">Si</span></td>'
        + '<td style="padding:0.6rem 0.75rem;text-align:right;font-size:0.8125rem">$0.00</td>'
      const emptyMsg = tbody.querySelector('td[colspan]')
      if (emptyMsg) tbody.innerHTML = ''
      tbody.appendChild(newRow)

      sel.value = ''
      btnReg.disabled = false
      btnReg.innerHTML = '<i class="bi bi-check2-circle me-1"></i>Registrar'
    })
  }

  renderView()

  return {
    teardown() {
      // Remove any overlay if still open
      const overlay = document.getElementById('participaciones-overlay')
      if (overlay) document.body.removeChild(overlay)
    },
  }
}
