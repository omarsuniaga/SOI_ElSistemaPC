/**
 * comunicacionesView.js — Central de Comunicaciones (portal COM).
 * Tres pestañas:
 *   1. Directorio  — contactos filtrables por sección/instrumento + selección múltiple
 *   2. Compositor  — editor con plantillas, variables, asistente IA (GROQ) y envío
 *                    por WhatsApp (links wa.me) o correo institucional (Resend)
 *   3. Plantillas  — CRUD de document_templates
 *
 * Patrón: retorna { teardown() } (AbortController).
 */

import '../styles/comunicaciones.css'
import * as api from '../api/comunicacionesApi.js'
import { mejorarConIA } from '../api/comunicacionesApi.js'
import { FAMILIAS, construirWaLink, resolverVariables, normalizarTelefono } from '../domain/secciones.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const VARIABLES = ['{nombre_alumno}', '{representante}', '{instrumento}', '{seccion}']

const state = {
  contactos: [],
  plantillas: [],
  tab: 'directorio',
  filtroFamilia: 'todas',
  busqueda: '',
  seleccion: new Set(),
  canal: 'whatsapp',
  asunto: '',
  mensaje: '',
}

let _abort = null

export async function renderComunicacionesView(container) {
  _abort?.abort()
  _abort = new AbortController()

  container.innerHTML = loadingHTML()
  try {
    const [contactos, plantillas] = await Promise.all([api.getContactos(), api.getPlantillas()])
    state.contactos = contactos
    state.plantillas = plantillas
    renderShell(container)
  } catch (err) {
    console.error('[Comunicaciones] Error:', err)
    container.innerHTML = `<div class="container mt-5"><div class="alert alert-danger">
      <h5><i class="bi bi-exclamation-triangle"></i> Error al cargar Comunicaciones</h5>
      <p>${escapeHTML(err.message)}</p></div></div>`
  }

  return { teardown: () => _abort?.abort() }
}

function loadingHTML() {
  return `<div class="d-flex justify-content-center align-items-center" style="min-height:400px">
    <div class="text-center"><div class="spinner-border text-primary mb-3"></div>
    <p class="text-muted">Cargando central de comunicaciones...</p></div></div>`
}

function renderShell(container) {
  container.innerHTML = `
    <div class="page-container comm-portal">
      <div class="d-flex align-items-center gap-3 mb-3">
        <div class="brand-badge rounded-3 d-flex align-items-center justify-content-center"
          style="width:42px;height:42px;background:rgba(219,39,119,0.1);color:#db2777">
          <i class="bi bi-megaphone fs-4"></i>
        </div>
        <div>
          <h1 class="mb-0 h3">Central de Comunicaciones</h1>
          <p class="text-muted small mb-0">Directorio · WhatsApp · Correo · Plantillas · IA</p>
        </div>
      </div>

      <ul class="nav nav-pills comm-tabs mb-3">
        ${tabBtn('directorio', 'bi-journal-text', 'Directorio')}
        ${tabBtn('compositor', 'bi-pencil-square', `Compositor${state.seleccion.size ? ` (${state.seleccion.size})` : ''}`)}
        ${tabBtn('plantillas', 'bi-files', 'Plantillas')}
      </ul>

      <div id="comm-body"></div>
    </div>
  `
  container.querySelectorAll('.comm-tab-btn').forEach((b) =>
    b.addEventListener('click', () => { state.tab = b.dataset.tab; renderShell(container) }, { signal: _abort.signal }),
  )
  renderBody(container)
}

function tabBtn(id, icon, label) {
  return `<li class="nav-item"><button class="nav-link comm-tab-btn ${state.tab === id ? 'active' : ''}" data-tab="${id}">
    <i class="bi ${icon} me-1"></i>${label}</button></li>`
}

function renderBody(container) {
  const body = container.querySelector('#comm-body')
  if (state.tab === 'directorio') renderDirectorio(container, body)
  else if (state.tab === 'compositor') renderCompositor(container, body)
  else renderPlantillas(container, body)
}

// ── Tab 1: Directorio ─────────────────────────────────────────────────────────
function contactosFiltrados() {
  let res = [...state.contactos]
  if (state.filtroFamilia !== 'todas') res = res.filter((c) => c.familia === state.filtroFamilia)
  if (state.busqueda) {
    const q = state.busqueda.toLowerCase()
    res = res.filter(
      (c) =>
        (c.alumno || '').toLowerCase().includes(q) ||
        (c.contactoNombre || '').toLowerCase().includes(q) ||
        (c.instrumento || '').toLowerCase().includes(q),
    )
  }
  return res
}

function renderDirectorio(container, body) {
  const lista = contactosFiltrados()
  const familias = Object.entries(FAMILIAS)
  const conteoFamilia = (f) => state.contactos.filter((c) => c.familia === f).length

  body.innerHTML = `
    <div class="d-flex gap-2 flex-wrap mb-3 align-items-center">
      <input type="text" class="form-control form-control-sm" id="commBuscar" style="max-width:260px"
        placeholder="🔍 Buscar alumno, representante o instrumento" value="${escapeHTML(state.busqueda)}">
      <button class="btn btn-sm ${state.filtroFamilia === 'todas' ? 'btn-primary' : 'btn-outline-secondary'} comm-fam" data-fam="todas">
        Todas (${state.contactos.length})
      </button>
      ${familias
        .filter(([f]) => conteoFamilia(f) > 0)
        .map(
          ([f, fam]) =>
            `<button class="btn btn-sm ${state.filtroFamilia === f ? 'btn-primary' : 'btn-outline-secondary'} comm-fam" data-fam="${f}">
              <i class="bi ${fam.icon} me-1"></i>${fam.label} (${conteoFamilia(f)})
            </button>`,
        )
        .join('')}
    </div>

    <div class="d-flex justify-content-between align-items-center mb-2">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="commSelAll">
        <label class="form-check-label small" for="commSelAll">Seleccionar los ${lista.length} filtrados</label>
      </div>
      <div class="small text-muted">
        <span class="fw-bold text-primary">${state.seleccion.size}</span> seleccionados
        ${state.seleccion.size ? `· <button class="btn btn-link btn-sm p-0 align-baseline" id="commClear">limpiar</button>` : ''}
      </div>
    </div>

    <div class="table-responsive comm-table-wrap">
      <table class="table table-sm table-hover align-middle mb-0">
        <thead class="table-light"><tr>
          <th style="width:36px"></th><th>Alumno</th><th>Instrumento</th><th>Representante</th>
          <th>WhatsApp</th><th>Correo</th>
        </tr></thead>
        <tbody>
          ${
            lista.length === 0
              ? `<tr><td colspan="6" class="text-center text-muted py-4">Sin contactos para este filtro</td></tr>`
              : lista.map(filaContacto).join('')
          }
        </tbody>
      </table>
    </div>

    <div class="comm-sticky-actions mt-3">
      <button class="btn btn-primary" id="commToComposer" ${state.seleccion.size === 0 ? 'disabled' : ''}>
        <i class="bi bi-pencil-square me-1"></i> Redactar a ${state.seleccion.size} contacto${state.seleccion.size === 1 ? '' : 's'}
      </button>
    </div>
  `

  const signal = _abort.signal
  body.querySelector('#commBuscar')?.addEventListener('input', (e) => {
    state.busqueda = e.target.value
    renderDirectorio(container, body)
  }, { signal })

  body.querySelectorAll('.comm-fam').forEach((b) =>
    b.addEventListener('click', () => { state.filtroFamilia = b.dataset.fam; renderDirectorio(container, body) }, { signal }),
  )

  const allFiltradosSeleccionados = lista.length > 0 && lista.every((c) => state.seleccion.has(c.alumnoId))
  const selAll = body.querySelector('#commSelAll')
  if (selAll) selAll.checked = allFiltradosSeleccionados
  selAll?.addEventListener('change', (e) => {
    lista.forEach((c) => (e.target.checked ? state.seleccion.add(c.alumnoId) : state.seleccion.delete(c.alumnoId)))
    renderShell(container)
  }, { signal })

  body.querySelector('#commClear')?.addEventListener('click', () => { state.seleccion.clear(); renderShell(container) }, { signal })

  body.querySelectorAll('.comm-row-check').forEach((chk) =>
    chk.addEventListener('change', (e) => {
      e.target.checked ? state.seleccion.add(chk.dataset.id) : state.seleccion.delete(chk.dataset.id)
      renderShell(container)
    }, { signal }),
  )

  body.querySelector('#commToComposer')?.addEventListener('click', () => { state.tab = 'compositor'; renderShell(container) }, { signal })
}

function filaContacto(c) {
  const wa = normalizarTelefono(c.whatsapp)
  return `<tr>
    <td><input class="form-check-input comm-row-check" type="checkbox" data-id="${c.alumnoId}" ${state.seleccion.has(c.alumnoId) ? 'checked' : ''}></td>
    <td class="fw-semibold">${escapeHTML(c.alumno || '')}</td>
    <td><span class="badge bg-light text-dark border">${escapeHTML(c.instrumento || '—')}</span></td>
    <td class="small">${escapeHTML(c.contactoNombre || '')}</td>
    <td class="small">${wa ? `<i class="bi bi-whatsapp text-success"></i> ${escapeHTML(c.whatsapp)}` : '<span class="text-muted">—</span>'}</td>
    <td class="small">${c.email ? `<i class="bi bi-envelope text-primary"></i> ${escapeHTML(c.email)}` : '<span class="text-muted">—</span>'}</td>
  </tr>`
}

// ── Tab 2: Compositor ─────────────────────────────────────────────────────────
function seleccionados() {
  return state.contactos.filter((c) => state.seleccion.has(c.alumnoId))
}

function renderCompositor(container, body) {
  const sel = seleccionados()
  if (sel.length === 0) {
    body.innerHTML = `<div class="alert alert-info"><i class="bi bi-info-circle me-1"></i>
      No hay destinatarios. Andá al <button class="btn btn-link btn-sm p-0 align-baseline" id="commGoDir">Directorio</button> y seleccioná contactos.</div>`
    body.querySelector('#commGoDir')?.addEventListener('click', () => { state.tab = 'directorio'; renderShell(container) }, { signal: _abort.signal })
    return
  }

  const conWa = sel.filter((c) => normalizarTelefono(c.whatsapp)).length
  const conEmail = sel.filter((c) => c.email).length
  const plantillasCanal = state.plantillas

  body.innerHTML = `
    <div class="row g-3">
      <div class="col-lg-7">
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <div class="btn-group mb-3" role="group">
              <button class="btn btn-sm ${state.canal === 'whatsapp' ? 'btn-success' : 'btn-outline-success'} comm-canal" data-canal="whatsapp">
                <i class="bi bi-whatsapp me-1"></i>WhatsApp (${conWa})
              </button>
              <button class="btn btn-sm ${state.canal === 'email' ? 'btn-primary' : 'btn-outline-primary'} comm-canal" data-canal="email">
                <i class="bi bi-envelope me-1"></i>Correo (${conEmail})
              </button>
            </div>

            <div class="mb-2">
              <label class="form-label small fw-semibold d-flex justify-content-between">
                <span>Plantilla</span>
                <span class="text-muted">Variables: insertá con los botones</span>
              </label>
              <select class="form-select form-select-sm mb-2" id="commTpl">
                <option value="">— Sin plantilla (escribir desde cero) —</option>
                ${plantillasCanal.map((p) => `<option value="${p.id}">${escapeHTML(p.nombre)} · ${escapeHTML(p.tipo || '')}</option>`).join('')}
              </select>
            </div>

            ${
              state.canal === 'email'
                ? `<div class="mb-2"><input type="text" class="form-control form-control-sm" id="commAsunto"
                     placeholder="Asunto del correo" value="${escapeHTML(state.asunto)}"></div>`
                : ''
            }

            <div class="mb-2 d-flex flex-wrap gap-1">
              ${VARIABLES.map((v) => `<button class="btn btn-outline-secondary btn-sm py-0 comm-var" data-var="${v}">${v}</button>`).join('')}
            </div>

            <textarea class="form-control" id="commMsg" rows="8" placeholder="Escribí el mensaje...">${escapeHTML(state.mensaje)}</textarea>

            <div class="d-flex gap-2 mt-2 flex-wrap">
              <button class="btn btn-sm btn-outline-primary" id="commIA">
                <i class="bi bi-stars me-1"></i>Mejorar con IA
              </button>
              <button class="btn btn-sm btn-outline-secondary" id="commIAOpts">
                <i class="bi bi-sliders me-1"></i>Ajustar tono…
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-5">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <h6 class="fw-bold mb-2"><i class="bi bi-people me-1"></i>${sel.length} destinatarios</h6>
            <div class="comm-recipients mb-3">
              ${sel.slice(0, 40).map((c) => `<span class="badge bg-light text-dark border me-1 mb-1">${escapeHTML(c.alumno)}</span>`).join('')}
              ${sel.length > 40 ? `<span class="badge bg-secondary">+${sel.length - 40} más</span>` : ''}
            </div>
            <div id="commActionZone"></div>
          </div>
        </div>
      </div>
    </div>
  `

  const signal = _abort.signal
  body.querySelectorAll('.comm-canal').forEach((b) =>
    b.addEventListener('click', () => { state.canal = b.dataset.canal; renderCompositor(container, body) }, { signal }),
  )
  const msgEl = body.querySelector('#commMsg')
  msgEl?.addEventListener('input', (e) => { state.mensaje = e.target.value }, { signal })
  body.querySelector('#commAsunto')?.addEventListener('input', (e) => { state.asunto = e.target.value }, { signal })

  body.querySelector('#commTpl')?.addEventListener('change', (e) => {
    const tpl = state.plantillas.find((p) => p.id === e.target.value)
    if (tpl) { state.mensaje = tpl.contenido || ''; renderCompositor(container, body) }
  }, { signal })

  body.querySelectorAll('.comm-var').forEach((b) =>
    b.addEventListener('click', () => { insertarEnTextarea(msgEl, b.dataset.var); state.mensaje = msgEl.value }, { signal }),
  )

  body.querySelector('#commIA')?.addEventListener('click', () => mejorarTexto(container, body, ''), { signal })
  body.querySelector('#commIAOpts')?.addEventListener('click', () => abrirAjusteTono(container, body), { signal })

  renderActionZone(container, body)
}

function renderActionZone(container, body) {
  const zone = body.querySelector('#commActionZone')
  if (!zone) return
  const sel = seleccionados()

  if (state.canal === 'whatsapp') {
    zone.innerHTML = `
      <button class="btn btn-success w-100" id="commGenWa">
        <i class="bi bi-whatsapp me-1"></i>Generar links de WhatsApp
      </button>
      <p class="text-muted small mt-2 mb-0">Se abre un link por contacto con el mensaje pre-cargado (personalizado con sus variables). Hacés clic y se envía desde tu WhatsApp.</p>
      <div id="commWaLinks" class="mt-2"></div>
    `
    body.querySelector('#commGenWa')?.addEventListener('click', () => generarLinksWa(body), { signal: _abort.signal })
  } else {
    const conEmail = sel.filter((c) => c.email)
    zone.innerHTML = `
      <button class="btn btn-primary w-100" id="commSendMail" ${conEmail.length === 0 ? 'disabled' : ''}>
        <i class="bi bi-send me-1"></i>Enviar a ${conEmail.length} correo${conEmail.length === 1 ? '' : 's'}
      </button>
      <p class="text-muted small mt-2 mb-0">El correo va por la fundación (Resend). Los destinatarios van en copia oculta (bcc).</p>
    `
    body.querySelector('#commSendMail')?.addEventListener('click', () => enviarCorreos(body), { signal: _abort.signal })
  }
}

function generarLinksWa(body) {
  const sel = seleccionados().filter((c) => normalizarTelefono(c.whatsapp))
  const cont = body.querySelector('#commWaLinks')
  if (sel.length === 0) {
    cont.innerHTML = `<div class="alert alert-warning small mb-0">Ningún destinatario tiene un WhatsApp válido.</div>`
    return
  }
  cont.innerHTML = `
    <div class="d-grid gap-1 comm-wa-list">
      ${sel
        .map((c) => {
          const link = construirWaLink(c.whatsapp, resolverVariables(state.mensaje, c))
          return `<a href="${link}" target="_blank" rel="noopener" class="btn btn-outline-success btn-sm text-start">
            <i class="bi bi-whatsapp me-1"></i>${escapeHTML(c.alumno)} <span class="text-muted">— ${escapeHTML(c.contactoNombre)}</span>
          </a>`
        })
        .join('')}
    </div>
    <button class="btn btn-link btn-sm mt-1 p-0" id="commWaAll">Abrir todos (puede bloquear el navegador)</button>
  `
  body.querySelector('#commWaAll')?.addEventListener('click', () => {
    sel.forEach((c) => window.open(construirWaLink(c.whatsapp, resolverVariables(state.mensaje, c)), '_blank', 'noopener'))
  }, { signal: _abort.signal })
}

async function enviarCorreos(body) {
  const sel = seleccionados().filter((c) => c.email)
  const asunto = state.asunto.trim()
  const mensaje = state.mensaje.trim()
  if (!asunto) { AppToast.show('Falta el asunto del correo', 'error'); return }
  if (!mensaje) { AppToast.show('El mensaje está vacío', 'error'); return }

  const btn = body.querySelector('#commSendMail')
  const original = btn.innerHTML
  btn.disabled = true
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Enviando...'

  try {
    // Personalizamos por destinatario sólo si NO hay variables compartidas ambiguas;
    // para correo masivo enviamos un cuerpo común (las variables se resuelven al primer
    // contacto como ejemplo institucional). Para envíos 1-a-1 personalizados, usar WhatsApp.
    const html = mensajeAHtml(resolverVariables(mensaje, sel[0]))
    const res = await api.enviarCorreo({ to: sel.map((c) => c.email), subject: asunto, html })
    AppToast.show(`Correo enviado a ${res.enviados} de ${res.total} destinatarios`, res.fallidos ? 'warning' : 'success')
  } catch (err) {
    AppToast.show(`Error: ${err.message}`, 'error')
  } finally {
    btn.disabled = false
    btn.innerHTML = original
  }
}

async function mejorarTexto(container, body, instruccion) {
  const texto = state.mensaje.trim()
  if (!texto) { AppToast.show('Escribí algo primero para mejorarlo', 'error'); return }
  const btn = body.querySelector('#commIA')
  const original = btn?.innerHTML
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Mejorando...' }
  try {
    const mejorado = await mejorarConIA(texto, instruccion)
    state.mensaje = mejorado
    renderCompositor(container, body)
    AppToast.show('Mensaje mejorado con IA', 'success')
  } catch (err) {
    AppToast.show(`IA no disponible: ${err.message}`, 'error')
    if (btn && original) { btn.disabled = false; btn.innerHTML = original }
  }
}

function abrirAjusteTono(container, body) {
  AppModal.open({
    title: 'Ajustar tono con IA',
    body: `
      <p class="small text-muted">Elegí cómo querés que la IA reescriba el mensaje:</p>
      <div class="d-grid gap-2">
        ${['Más formal', 'Más cálido y cercano', 'Más corto y directo', 'Más motivador', 'Corregir ortografía y gramática']
          .map((t) => `<button class="btn btn-outline-primary comm-tono" data-tono="${t}">${t}</button>`)
          .join('')}
      </div>`,
    hideSave: true,
    cancelText: 'Cerrar',
  })
  // Los botones viven en el modal global; los cableamos tras render.
  setTimeout(() => {
    document.querySelectorAll('.comm-tono').forEach((b) =>
      b.addEventListener('click', () => { AppModal.close(); mejorarTexto(container, body, b.dataset.tono) }, { once: true }),
    )
  }, 50)
}

// ── Tab 3: Plantillas ─────────────────────────────────────────────────────────
function renderPlantillas(container, body) {
  body.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted small mb-0">Plantillas reutilizables para mensajes y correos. Usá variables como {nombre_alumno}.</p>
      <button class="btn btn-primary btn-sm" id="commNewTpl"><i class="bi bi-plus-lg me-1"></i>Nueva plantilla</button>
    </div>
    <div class="row g-2">
      ${
        state.plantillas.length === 0
          ? `<div class="col-12"><div class="alert alert-info">Aún no hay plantillas.</div></div>`
          : state.plantillas.map(tarjetaPlantilla).join('')
      }
    </div>
  `
  const signal = _abort.signal
  body.querySelector('#commNewTpl')?.addEventListener('click', () => editarPlantilla(container, null), { signal })
  body.querySelectorAll('.comm-tpl-edit').forEach((b) =>
    b.addEventListener('click', () => editarPlantilla(container, state.plantillas.find((p) => p.id === b.dataset.id)), { signal }),
  )
  body.querySelectorAll('.comm-tpl-use').forEach((b) =>
    b.addEventListener('click', () => {
      const tpl = state.plantillas.find((p) => p.id === b.dataset.id)
      state.mensaje = tpl?.contenido || ''
      state.tab = 'compositor'
      renderShell(container)
    }, { signal }),
  )
}

function tarjetaPlantilla(p) {
  return `<div class="col-md-6 col-xl-4">
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start">
          <h6 class="fw-bold mb-1">${escapeHTML(p.nombre)}</h6>
          <span class="badge bg-light text-dark border">${escapeHTML(p.tipo || 'mensaje')}</span>
        </div>
        <p class="text-muted small mb-2">${escapeHTML(p.descripcion || '')}</p>
        <p class="small comm-tpl-preview">${escapeHTML((p.contenido || '').slice(0, 120))}${(p.contenido || '').length > 120 ? '…' : ''}</p>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-primary comm-tpl-use" data-id="${p.id}"><i class="bi bi-pencil-square me-1"></i>Usar</button>
          <button class="btn btn-sm btn-outline-secondary comm-tpl-edit" data-id="${p.id}"><i class="bi bi-gear"></i></button>
        </div>
      </div>
    </div>
  </div>`
}

function editarPlantilla(container, plantilla) {
  const esNueva = !plantilla
  AppModal.open({
    title: esNueva ? 'Nueva plantilla' : 'Editar plantilla',
    size: 'lg',
    body: `
      <div class="mb-2"><label class="form-label small fw-semibold">Nombre *</label>
        <input type="text" class="form-control form-control-sm" id="tplNombre" value="${escapeHTML(plantilla?.nombre || '')}"></div>
      <div class="row g-2 mb-2">
        <div class="col-6"><label class="form-label small fw-semibold">Tipo</label>
          <select class="form-select form-select-sm" id="tplTipo">
            ${['mensaje', 'correo', 'carta'].map((t) => `<option value="${t}" ${plantilla?.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select></div>
        <div class="col-6"><label class="form-label small fw-semibold">Descripción</label>
          <input type="text" class="form-control form-control-sm" id="tplDesc" value="${escapeHTML(plantilla?.descripcion || '')}"></div>
      </div>
      <div class="mb-1"><label class="form-label small fw-semibold">Contenido</label>
        <div class="mb-1 d-flex flex-wrap gap-1">
          ${VARIABLES.map((v) => `<button type="button" class="btn btn-outline-secondary btn-sm py-0 tplVar" data-var="${v}">${v}</button>`).join('')}
        </div>
        <textarea class="form-control" id="tplContenido" rows="6">${escapeHTML(plantilla?.contenido || '')}</textarea>
      </div>
    `,
    saveText: esNueva ? 'Crear' : 'Guardar',
    deleteText: 'Eliminar',
    onDelete: esNueva
      ? null
      : async () => {
          try {
            await api.eliminarPlantilla(plantilla.id)
            state.plantillas = state.plantillas.filter((p) => p.id !== plantilla.id)
            AppToast.show('Plantilla eliminada', 'success')
            renderShell(container)
          } catch (err) {
            AppToast.show(`Error: ${err.message}`, 'error')
            return false
          }
        },
    onSave: async (mb) => {
      const nombre = mb.querySelector('#tplNombre').value.trim()
      if (!nombre) { AppToast.show('El nombre es obligatorio', 'error'); return false }
      const payload = {
        id: plantilla?.id,
        nombre,
        tipo: mb.querySelector('#tplTipo').value,
        descripcion: mb.querySelector('#tplDesc').value.trim(),
        contenido: mb.querySelector('#tplContenido').value,
        variables: VARIABLES.filter((v) => mb.querySelector('#tplContenido').value.includes(v)).map((v) => v.replace(/[{}]/g, '')),
      }
      try {
        const guardada = await api.guardarPlantilla(payload)
        const idx = state.plantillas.findIndex((p) => p.id === guardada.id)
        if (idx >= 0) state.plantillas[idx] = guardada
        else state.plantillas.push(guardada)
        AppToast.show('Plantilla guardada', 'success')
        renderShell(container)
      } catch (err) {
        AppToast.show(`Error: ${err.message}`, 'error')
        return false
      }
    },
  })
  setTimeout(() => {
    document.querySelectorAll('.tplVar').forEach((b) =>
      b.addEventListener('click', () => {
        const ta = document.querySelector('#tplContenido')
        insertarEnTextarea(ta, b.dataset.var)
      }),
    )
  }, 50)
}

// ── Utilidades ─────────────────────────────────────────────────────────────────
function insertarEnTextarea(ta, texto) {
  if (!ta) return
  const start = ta.selectionStart ?? ta.value.length
  const end = ta.selectionEnd ?? ta.value.length
  ta.value = ta.value.slice(0, start) + texto + ta.value.slice(end)
  ta.focus()
  ta.selectionStart = ta.selectionEnd = start + texto.length
}

function mensajeAHtml(texto) {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;line-height:1.6;color:#1f2937">
    ${escapeHTML(texto).replace(/\n/g, '<br>')}
  </div>`
}

function escapeHTML(str) {
  if (str == null) return ''
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
