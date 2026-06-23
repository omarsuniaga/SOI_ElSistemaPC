/**
 * tareasView.js - Task board (Kanban-style)
 * Route: #/tareas
 */

import * as cajaApi from '../api/cajaApi.js'

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function prioridadBadge(p) {
  const map = { alta: ['#fee2e2','#7f1d1d'], media: ['#fef9c3','#713f12'], baja: ['#f0fdf4','#065f46'] }
  const [bg, text] = map[p || 'baja'] || ['#f8fafc','#475569']
  return '<span style="background:' + bg + ';color:' + text + ';font-size:0.65rem;font-weight:600;padding:0.1rem 0.4rem;border-radius:6px">' + (p || 'baja') + '</span>'
}

function navigate(hash) {
  window.dispatchEvent(new CustomEvent('caja:navigate', { detail: hash }))
}

export async function render(container, session) {
  container.innerHTML = '<div style="padding:1.5rem"><p style="color:#94a3b8">Cargando tareas...</p></div>'

  const { data: tareas, error } = await cajaApi.getTareas(session?.user?.id)
  if (error) {
    container.innerHTML = '<div style="padding:1.5rem"><p style="color:#ef4444">Error al cargar tareas</p></div>'
    return { teardown() {} }
  }

  let allTareas = tareas || []
  let showNewForm = false

  const COLUMNAS = [
    { key: 'pendiente',   label: 'Pendiente',   color: '#f59e0b' },
    { key: 'en_progreso', label: 'En Progreso',  color: '#3b82f6' },
    { key: 'completada',  label: 'Completada',   color: '#059669' },
    { key: 'vencida',     label: 'Vencida',      color: '#ef4444' },
  ]

  function renderContent() {
    const columnaHtml = COLUMNAS.map(col => {
      const items = allTareas.filter(t => t.estado === col.key)
      const cardsHtml = items.length === 0
        ? '<p style="text-align:center;color:#94a3b8;padding:1rem 0;font-size:0.8125rem">Sin tareas</p>'
        : items.map(t =>
            '<div style="background:#fff;border-radius:10px;padding:0.875rem;margin-bottom:0.5rem;box-shadow:0 1px 2px rgba(0,0,0,0.06)">'
            + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.5rem;margin-bottom:0.5rem">'
            + '<p style="margin:0;font-size:0.875rem;font-weight:600;color:#0f172a;flex:1">' + t.titulo + '</p>'
            + prioridadBadge(t.prioridad)
            + '</div>'
            + (t.descripcion ? '<p style="margin:0 0 0.5rem;font-size:0.75rem;color:#64748b">' + t.descripcion + '</p>' : '')
            + '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.375rem">'
            + '<span style="font-size:0.7rem;color:#94a3b8"><i class="bi bi-calendar"></i> ' + fmtDate(t.fecha_vencimiento) + '</span>'
            + (t.familia_id ? '<button class="btn-tarea-familia" data-familia="' + t.familia_id + '" style="font-size:0.7rem;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:0.1rem 0.375rem;cursor:pointer;color:#065f46"><i class="bi bi-people"></i> Familia</button>' : '')
            + '</div>'
            + '<select class="tarea-estado-sel" data-id="' + t.id + '" style="margin-top:0.625rem;width:100%;border:1px solid #e2e8f0;border-radius:6px;padding:0.25rem 0.375rem;font-size:0.75rem;background:#f8fafc">'
            + COLUMNAS.map(c => '<option value="' + c.key + '"' + (t.estado === c.key ? ' selected' : '') + '>' + c.label + '</option>').join('')
            + '</select>'
            + '</div>'
          ).join('')

      return '<div style="flex:1;min-width:200px;max-width:280px">'
        + '<div style="border-top:3px solid ' + col.color + ';border-radius:2px;margin-bottom:0.75rem"></div>'
        + '<h3 style="margin:0 0 0.75rem;font-size:0.8125rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">'
        + col.label + ' <span style="font-weight:400;color:#94a3b8">(' + items.length + ')</span></h3>'
        + cardsHtml
        + '</div>'
    }).join('')

    const newFormHtml = !showNewForm ? '' :
      '<div style="background:#fff;border-radius:12px;padding:1.25rem;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin-bottom:1.5rem">'
      + '<h3 style="margin:0 0 0.875rem;font-size:0.9375rem;font-weight:700;color:#0f172a">Nueva tarea</h3>'
      + '<input id="new-titulo" type="text" placeholder="Titulo de la tarea..." style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;margin-bottom:0.625rem">'
      + '<textarea id="new-desc" rows="2" placeholder="Descripcion..." style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;margin-bottom:0.625rem"></textarea>'
      + '<div style="display:flex;gap:0.625rem;flex-wrap:wrap">'
      + '<select id="new-prioridad" style="border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;flex:1">'
      + '<option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option>'
      + '</select>'
      + '<input id="new-fecha" type="date" style="border:1px solid #cbd5e1;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.875rem;flex:1">'
      + '</div>'
      + '<div id="new-error" style="display:none;color:#ef4444;font-size:0.8125rem;margin-top:0.5rem"></div>'
      + '<div style="display:flex;gap:0.5rem;margin-top:0.875rem">'
      + '<button id="btn-new-cancel" style="flex:1;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:0.5rem;cursor:pointer">Cancelar</button>'
      + '<button id="btn-new-confirm" style="flex:1;background:#059669;color:#fff;border:none;border-radius:8px;padding:0.5rem;font-weight:600;cursor:pointer">Crear Tarea</button>'
      + '</div></div>'

    container.innerHTML =
      '<div style="padding:1.5rem;max-width:1200px">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem">'
      + '<h2 style="margin:0;font-size:1.125rem;font-weight:700;color:#0f172a">Tablero de Tareas</h2>'
      + '<button id="btn-nueva-tarea" style="background:#059669;color:#fff;border:none;border-radius:8px;padding:0.5rem 1rem;font-size:0.875rem;font-weight:600;cursor:pointer"><i class="bi bi-plus"></i> Nueva Tarea</button>'
      + '</div>'
      + newFormHtml
      + '<div style="display:flex;gap:1rem;overflow-x:auto;padding-bottom:1rem">'
      + columnaHtml
      + '</div></div>'

    container.querySelector('#btn-nueva-tarea')?.addEventListener('click', () => { showNewForm = true; renderContent() })
    container.querySelector('#btn-new-cancel')?.addEventListener('click', () => { showNewForm = false; renderContent() })
    container.querySelector('#btn-new-confirm')?.addEventListener('click', async () => {
      const titulo = container.querySelector('#new-titulo').value.trim()
      const prioridad = container.querySelector('#new-prioridad').value
      const fecha_vencimiento = container.querySelector('#new-fecha').value
      const descripcion = container.querySelector('#new-desc').value
      const errEl = container.querySelector('#new-error')
      if (!titulo) { errEl.style.display=''; errEl.textContent='El titulo es requerido'; return }
      const { data, error } = await cajaApi.createTarea({ titulo, descripcion, prioridad, fecha_vencimiento, cajero_id: session?.user?.id, estado: 'pendiente' })
      if (error) { errEl.style.display=''; errEl.textContent='Error: '+(error.message||'desconocido'); return }
      if (data) allTareas = [data, ...allTareas]
      showNewForm = false
      renderContent()
    })

    container.querySelectorAll('.tarea-estado-sel').forEach(sel => {
      sel.addEventListener('change', async () => {
        const tareaId = sel.dataset.id
        const newEstado = sel.value
        const { error } = await cajaApi.updateTareaEstado(tareaId, newEstado)
        if (!error) {
          const t = allTareas.find(t => t.id === tareaId)
          if (t) t.estado = newEstado
          renderContent()
        }
      })
    })

    container.querySelectorAll('.btn-tarea-familia').forEach(btn => {
      btn.addEventListener('click', () => navigate('#/familias/' + btn.dataset.familia))
    })
  }

  renderContent()
  return { teardown() {} }
}
