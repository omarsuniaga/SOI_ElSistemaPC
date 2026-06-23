/**
 * mensajesView.js - Internal messaging
 * Route: #/mensajes
 * Two-panel layout: left = hilo list, right = messages for selected hilo.
 */
import * as cajaApi from '../api/cajaApi.js'

const VERDE = '#059669'

function fmtDateTime(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('es-VE', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtDate(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function tipoBadge(tipo) {
  const map = {
    consulta:  { color: '#0d9488', label: 'Consulta' },
    aviso:     { color: '#f59e0b', label: 'Aviso' },
    urgente:   { color: '#ef4444', label: 'Urgente' },
    interno:   { color: '#64748b', label: 'Interno' },
  }
  const cfg = map[tipo] || map.interno
  return '<span style="font-size:0.6875rem;font-weight:600;color:' + cfg.color + ';'
    + 'background:' + cfg.color + '18;padding:0.1rem 0.4rem;border-radius:4px">'
    + cfg.label + '</span>'
}

export async function render(container, session) {
  container.innerHTML = '<div style="padding:1.5rem"><p style="color:#94a3b8">Cargando mensajes...</p></div>'

  const { data: hilos, error } = await cajaApi.getHilos()

  if (error) {
    container.innerHTML = '<div style="padding:1.5rem"><p style="color:#ef4444">Error al cargar hilos.</p></div>'
    return { teardown() {} }
  }

  const hiloList = hilos || []
  let selectedHiloId = null
  let mensajesCache = {}

  function renderHiloItem(hilo, active) {
    return '<div data-hilo-id="' + hilo.id + '" class="hilo-item" '
      + 'style="padding:0.875rem 1rem;cursor:pointer;border-bottom:1px solid #f1f5f9;'
      + (active ? 'background:#f0fdf4;border-left:3px solid ' + VERDE + ';' : 'border-left:3px solid transparent;')
      + '">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.25rem">'
      + '<p style="margin:0;font-size:0.875rem;font-weight:600;color:#0f172a;'
      + 'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px">'
      + (hilo.titulo || 'Hilo sin titulo') + '</p>'
      + (hilo.tipo ? tipoBadge(hilo.tipo) : '')
      + '</div>'
      + '<p style="margin:0;font-size:0.75rem;color:#94a3b8">' + fmtDate(hilo.created_at) + '</p>'
      + '</div>'
  }

  function renderMessage(msg) {
    const isOwn = msg.autor_id === session?.user?.id
    return '<div style="display:flex;justify-content:' + (isOwn ? 'flex-end' : 'flex-start') + ';margin-bottom:0.75rem">'
      + '<div style="max-width:70%;background:' + (isOwn ? VERDE : '#f1f5f9') + ';'
      + 'color:' + (isOwn ? '#fff' : '#0f172a') + ';'
      + 'border-radius:12px;padding:0.625rem 0.875rem">'
      + '<p style="margin:0 0 0.25rem;font-size:0.8125rem">' + (msg.contenido || '') + '</p>'
      + '<p style="margin:0;font-size:0.6875rem;opacity:0.7">'
      + (msg.autor_nombre || msg.rol_autor || 'Usuario') + ' &bull; ' + fmtDateTime(msg.created_at) + '</p>'
      + '</div></div>'
  }

  function renderNewHiloForm() {
    return '<div id="new-hilo-form" style="display:none;padding:1rem;background:#f8fafc;border-top:1px solid #e2e8f0">'
      + '<p style="margin:0 0 0.5rem;font-size:0.8125rem;font-weight:600;color:#0f172a">Nuevo hilo</p>'
      + '<input id="nh-titulo" type="text" placeholder="Titulo del hilo" class="form-control form-control-sm mb-2">'
      + '<input id="nh-tema" type="text" placeholder="Tema" class="form-control form-control-sm mb-2">'
      + '<input id="nh-dept" type="text" placeholder="Departamentos involucrados" class="form-control form-control-sm mb-2">'
      + '<select id="nh-tipo" class="form-select form-select-sm mb-2">'
      + '<option value="interno">Interno</option><option value="consulta">Consulta</option>'
      + '<option value="aviso">Aviso</option><option value="urgente">Urgente</option></select>'
      + '<div style="display:flex;gap:0.5rem">'
      + '<button id="btn-nh-save" class="btn btn-sm" style="background:' + VERDE + ';color:#fff;border:none">Crear hilo</button>'
      + '<button id="btn-nh-cancel" class="btn btn-sm btn-outline-secondary">Cancelar</button></div>'
      + '<p id="nh-error" style="margin:0.5rem 0 0;font-size:0.75rem;color:#ef4444;display:none"></p>'
      + '</div>'
  }

  async function loadMessages(hiloId) {
    const panel = container.querySelector('#msgs-panel')
    if (!panel) return
    panel.innerHTML = '<p style="padding:1rem;color:#94a3b8;font-size:0.875rem">Cargando mensajes...</p>'

    const { data, error: msgErr } = await cajaApi.getMensajesByHilo(hiloId)
    if (msgErr) {
      panel.innerHTML = '<p style="padding:1rem;color:#ef4444">Error al cargar mensajes.</p>'
      return
    }

    mensajesCache[hiloId] = data || []
    const msgs = mensajesCache[hiloId]

    const hilo = hiloList.find(h => h.id === hiloId)

    panel.innerHTML =
      '<div style="padding:1rem;border-bottom:1px solid #e2e8f0;background:#fafafa">'
      + '<p style="margin:0;font-size:0.9375rem;font-weight:700;color:#0f172a">' + (hilo?.titulo || '-') + '</p>'
      + '<p style="margin:0;font-size:0.75rem;color:#64748b">' + (hilo?.tema || '') + '</p>'
      + '</div>'
      + '<div id="msgs-scroll" style="flex:1;overflow-y:auto;padding:1rem">'
      + (msgs.length === 0
          ? '<p style="text-align:center;color:#94a3b8;margin-top:2rem">Sin mensajes. Iniciá la conversacion.</p>'
          : msgs.map(renderMessage).join(''))
      + '</div>'
      + '<div style="padding:0.875rem;border-top:1px solid #e2e8f0;display:flex;gap:0.625rem">'
      + '<input id="msg-input" type="text" placeholder="Escribi un mensaje..." class="form-control form-control-sm" style="flex:1">'
      + '<button id="btn-send-msg" class="btn btn-sm" style="background:' + VERDE + ';color:#fff;border:none;white-space:nowrap">'
      + '<i class="bi bi-send"></i> Enviar</button>'
      + '</div>'

    // Scroll to bottom
    const scroll = panel.querySelector('#msgs-scroll')
    if (scroll) scroll.scrollTop = scroll.scrollHeight

    // Send message
    panel.querySelector('#btn-send-msg')?.addEventListener('click', async () => {
      const input = panel.querySelector('#msg-input')
      const contenido = input?.value.trim()
      if (!contenido) return
      input.value = ''

      const { error: sendErr } = await cajaApi.sendMensaje({
        hilo_id: hiloId,
        autor_id: session?.user?.id,
        rol_autor: session?.user?.user_metadata?.role || 'cajero',
        contenido,
        tipo: 'texto',
        departamento_destino: hilo?.departamentos_involucrados || null,
      })

      if (!sendErr) {
        await loadMessages(hiloId)
      }
    })

    // Enter key to send
    panel.querySelector('#msg-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') panel.querySelector('#btn-send-msg')?.click()
    })
  }

  function build() {
    container.innerHTML =
      '<div style="padding:1.5rem;max-width:1100px">'
      + '<div style="margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between">'
      + '<h2 style="margin:0;font-size:1.25rem;font-weight:700;color:#0f172a">'
      + '<i class="bi bi-chat-dots-fill" style="color:' + VERDE + '"></i> Mensajes</h2>'
      + '<button id="btn-new-hilo" class="btn btn-sm" style="background:' + VERDE + ';color:#fff;border:none;font-weight:600">'
      + '<i class="bi bi-plus-circle"></i> Nuevo hilo</button>'
      + '</div>'
      + renderNewHiloForm()
      + '<div style="display:flex;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);'
      + 'overflow:hidden;height:calc(100vh - 220px);min-height:400px">'
      // Left panel — hilo list
      + '<div style="width:240px;flex-shrink:0;border-right:1px solid #e2e8f0;overflow-y:auto">'
      + (hiloList.length === 0
          ? '<p style="padding:1rem;color:#94a3b8;font-size:0.875rem">Sin hilos</p>'
          : hiloList.map(h => renderHiloItem(h, false)).join(''))
      + '</div>'
      // Right panel — messages
      + '<div id="msgs-panel" style="flex:1;display:flex;flex-direction:column;overflow:hidden">'
      + '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8">'
      + '<div style="text-align:center"><i class="bi bi-chat-left-text" style="font-size:2rem;display:block;margin-bottom:0.5rem"></i>'
      + 'Selecciona un hilo para ver los mensajes</div></div>'
      + '</div>'
      + '</div></div>'

    // Hilo click
    container.querySelectorAll('.hilo-item').forEach(el => {
      el.addEventListener('click', async () => {
        selectedHiloId = Number(el.dataset.hiloId) || el.dataset.hiloId
        container.querySelectorAll('.hilo-item').forEach(i => {
          i.style.background = ''
          i.style.borderLeft = '3px solid transparent'
        })
        el.style.background = '#f0fdf4'
        el.style.borderLeft = '3px solid ' + VERDE
        await loadMessages(selectedHiloId)
      })
    })

    // New hilo toggle
    const btnNew = container.querySelector('#btn-new-hilo')
    const hiloForm = container.querySelector('#new-hilo-form')
    btnNew?.addEventListener('click', () => {
      hiloForm.style.display = hiloForm.style.display === 'none' ? 'block' : 'none'
    })
    container.querySelector('#btn-nh-cancel')?.addEventListener('click', () => {
      hiloForm.style.display = 'none'
    })

    // Save new hilo (send first message creates the thread via sendMensaje pattern)
    container.querySelector('#btn-nh-save')?.addEventListener('click', async () => {
      const titulo = container.querySelector('#nh-titulo')?.value.trim()
      const errEl = container.querySelector('#nh-error')
      if (!titulo) { errEl.textContent = 'El titulo es requerido.'; errEl.style.display = 'block'; return }
      errEl.style.display = 'none'
      const tema = container.querySelector('#nh-tema')?.value.trim()
      const dept = container.querySelector('#nh-dept')?.value.trim()
      const tipo = container.querySelector('#nh-tipo')?.value

      const { data: nuevoHilo, error: hiloErr } = await cajaApi.createHilo({
        titulo,
        tema: tema || null,
        departamentos_involucrados: dept ? [dept] : ['caja'],
        creado_por: session?.user?.id,
      })

      if (hiloErr || !nuevoHilo) {
        errEl.textContent = 'Error creando hilo: ' + String(hiloErr)
        errEl.style.display = 'block'
        return
      }

      const { error: sendErr } = await cajaApi.sendMensaje({
        hilo_id: nuevoHilo.id,
        autor_id: session?.user?.id,
        rol_autor: session?.user?.user_metadata?.role || 'cajero',
        contenido: '[Hilo iniciado] ' + titulo,
        tipo,
        departamento_destino: dept ? [dept] : ['caja'],
        leido_por: {},
      })

      if (sendErr) {
        errEl.textContent = 'Error: ' + String(sendErr)
        errEl.style.display = 'block'
        return
      }

      await render(container, session)
    })
  }

  build()

  return { teardown() {} }
}
