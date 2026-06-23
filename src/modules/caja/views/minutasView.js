/**
 * minutasView.js - Meeting minutes management
 * Route: #/minutas
 */
import * as cajaApi from '../api/cajaApi.js'
import { generateMinutaPdf } from '../pdf/minutaPdf.js'

const VERDE = '#059669'

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function visibilidadBadge(v) {
  const map = {
    cajero: { color: '#0d9488', bg: '#f0fdfa', label: 'Cajero' },
    admin:  { color: '#7c3aed', bg: '#faf5ff', label: 'Admin' },
    todos:  { color: '#059669', bg: '#f0fdf4', label: 'Todos' },
  }
  const cfg = map[v] || map.todos
  return '<span style="background:' + cfg.bg + ';color:' + cfg.color + ';font-size:0.6875rem;font-weight:600;'
    + 'padding:0.125rem 0.5rem;border-radius:9999px;border:1px solid ' + cfg.color + '33">'
    + cfg.label + '</span>'
}

function minutaCard(minuta) {
  const acuerdosCount = Array.isArray(minuta.acuerdos) ? minuta.acuerdos.length : 0
  return '<div style="background:#fff;border-radius:12px;padding:1.25rem;'
    + 'box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:0.875rem">'
    + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem">'
    + '<div style="flex:1;min-width:0">'
    + '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.375rem">'
    + visibilidadBadge(minuta.visibilidad)
    + '<span style="font-size:0.75rem;color:#94a3b8">' + fmtDate(minuta.fecha_reunion) + '</span>'
    + '</div>'
    + '<p style="margin:0 0 0.25rem;font-size:0.9375rem;font-weight:600;color:#0f172a">' + (minuta.titulo || 'Sin titulo') + '</p>'
    + '<p style="margin:0;font-size:0.75rem;color:#64748b">' + acuerdosCount + ' acuerdos</p>'
    + '</div>'
    + '<button data-mid="' + minuta.id + '" class="btn-dl-minuta" '
    + 'style="background:#f0fdf4;color:' + VERDE + ';border:1px solid #bbf7d0;'
    + 'border-radius:8px;padding:0.375rem 0.75rem;font-size:0.8125rem;cursor:pointer;flex-shrink:0;white-space:nowrap">'
    + '<i class="bi bi-file-pdf"></i> PDF</button>'
    + '</div></div>'
}

export async function render(container, session) {
  container.innerHTML = '<div style="padding:1.5rem"><p style="color:#94a3b8">Cargando minutas...</p></div>'

  const { data: minutas, error } = await cajaApi.getMinutas()

  if (error) {
    container.innerHTML = '<div style="padding:1.5rem"><p style="color:#ef4444">Error al cargar minutas.</p></div>'
    return { teardown() {} }
  }

  const list = minutas || []

  const formHtml =
    '<div id="nueva-minuta-form" style="display:none;background:#fff;border-radius:12px;'
    + 'padding:1.5rem;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:1.5rem">'
    + '<h3 style="margin:0 0 1rem;font-size:1rem;font-weight:700;color:#0f172a">Nueva Minuta</h3>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">'
    + '<div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#475569;margin-bottom:0.375rem">Titulo *</label>'
    + '<input id="nm-titulo" type="text" placeholder="Titulo de la reunion" class="form-control form-control-sm"></div>'
    + '<div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#475569;margin-bottom:0.375rem">Fecha *</label>'
    + '<input id="nm-fecha" type="date" class="form-control form-control-sm"></div></div>'
    + '<div style="margin-bottom:1rem"><label style="display:block;font-size:0.8125rem;font-weight:600;color:#475569;margin-bottom:0.375rem">Visibilidad</label>'
    + '<select id="nm-visibilidad" class="form-select form-select-sm" style="width:auto">'
    + '<option value="cajero">Cajero</option><option value="admin">Admin</option><option value="todos">Todos</option></select></div>'
    + '<div style="margin-bottom:1rem"><label style="display:block;font-size:0.8125rem;font-weight:600;color:#475569;margin-bottom:0.375rem">Participantes (uno por linea)</label>'
    + '<textarea id="nm-participantes" rows="3" placeholder="Nombre 1&#10;Nombre 2" class="form-control form-control-sm"></textarea></div>'
    + '<div style="margin-bottom:1.25rem"><label style="display:block;font-size:0.8125rem;font-weight:600;color:#475569;margin-bottom:0.375rem">Puntos tratados (uno por linea)</label>'
    + '<textarea id="nm-puntos" rows="4" placeholder="Punto 1&#10;Punto 2" class="form-control form-control-sm"></textarea></div>'
    + '<div style="display:flex;gap:0.75rem">'
    + '<button id="btn-nm-save" class="btn btn-sm" style="background:' + VERDE + ';color:#fff;border:none">Guardar</button>'
    + '<button id="btn-nm-cancel" class="btn btn-sm btn-outline-secondary">Cancelar</button></div>'
    + '<p id="nm-error" style="margin:0.5rem 0 0;font-size:0.8125rem;color:#ef4444;display:none"></p></div>'

  container.innerHTML =
    '<div style="padding:1.5rem;max-width:800px">'
    + '<div style="margin-bottom:1.5rem;display:flex;align-items:center;justify-content:space-between">'
    + '<div><h2 style="margin:0;font-size:1.25rem;font-weight:700;color:#0f172a">'
    + '<i class="bi bi-journal-text" style="color:' + VERDE + '"></i> Minutas</h2>'
    + '<p style="margin:0;font-size:0.8125rem;color:#64748b">' + list.length + ' minutas registradas</p></div>'
    + '<button id="btn-nueva-minuta" class="btn btn-sm" style="background:' + VERDE + ';color:#fff;border:none;font-weight:600">'
    + '<i class="bi bi-plus-circle"></i> Nueva Minuta</button></div>'
    + formHtml
    + '<div id="minutas-list">'
    + (list.length === 0
        ? '<div style="text-align:center;padding:3rem;color:#94a3b8"><i class="bi bi-journal-x" style="font-size:2rem"></i><p>Sin minutas registradas</p></div>'
        : list.map(minutaCard).join(''))
    + '</div></div>'

  // Toggle form
  const btnNueva = container.querySelector('#btn-nueva-minuta')
  const formEl = container.querySelector('#nueva-minuta-form')
  btnNueva?.addEventListener('click', () => {
    formEl.style.display = formEl.style.display === 'none' ? 'block' : 'none'
  })
  container.querySelector('#btn-nm-cancel')?.addEventListener('click', () => {
    formEl.style.display = 'none'
  })

  // Save minuta
  container.querySelector('#btn-nm-save')?.addEventListener('click', async () => {
    const titulo = container.querySelector('#nm-titulo').value.trim()
    const fecha = container.querySelector('#nm-fecha').value
    const visibilidad = container.querySelector('#nm-visibilidad').value
    const partText = container.querySelector('#nm-participantes').value
    const puntosText = container.querySelector('#nm-puntos').value
    const errEl = container.querySelector('#nm-error')

    if (!titulo) { errEl.textContent = 'El titulo es requerido.'; errEl.style.display = 'block'; return }
    errEl.style.display = 'none'

    const participantes = partText.split('\n').map(s => s.trim()).filter(Boolean)
    const puntos_tratados = puntosText.split('\n').map(s => s.trim()).filter(Boolean)
    const btnSave = container.querySelector('#btn-nm-save')
    btnSave.disabled = true
    btnSave.textContent = 'Guardando...'

    const { error: saveError } = await cajaApi.createMinuta({
      titulo,
      fecha_reunion: fecha || new Date().toISOString().slice(0, 10),
      visibilidad,
      participantes,
      puntos_tratados,
    })

    if (saveError) {
      errEl.textContent = 'Error al guardar: ' + String(saveError)
      errEl.style.display = 'block'
      btnSave.disabled = false
      btnSave.textContent = 'Guardar'
      return
    }

    await render(container, session)
  })

  // Download PDF buttons
  container.querySelectorAll('.btn-dl-minuta').forEach(btn => {
    btn.addEventListener('click', () => {
      const minuta = list.find(m => String(m.id) === btn.dataset.mid)
      if (!minuta) return
      const doc = generateMinutaPdf(minuta)
      const safe = (minuta.titulo || 'minuta').replace(/[^a-z0-9]/gi, '-').toLowerCase()
      doc.save('minuta-' + safe + '-' + new Date().toISOString().slice(0, 10) + '.pdf')
    })
  })

  return { teardown() {} }
}
