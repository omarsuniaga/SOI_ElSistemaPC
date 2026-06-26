import {
  listarCampanias,
  crearCampania,
  desactivarCampania,
  previewCampania,
  activarCampania,
  encolarCampania,
} from '../api/campaniasApi.js'

const state = {
  campanias: [],
  seleccionada: null, // id
  preview: null, // resultado de fn_preview_campania
  cargando: false,
}

const ACCION_LABEL = { inscripcion: 'Inscripción', reinscripcion: 'Reinscripción' }

export async function renderCampaniasView(container) {
  await cargar(container)
}

async function cargar(container) {
  try {
    renderSkeleton(container)
    state.campanias = await listarCampanias()
    render(container)
  } catch (err) {
    renderError(container, err.message)
  }
}

function renderSkeleton(container) {
  container.innerHTML = `
    <div class="container-fluid py-4 px-3 px-md-4">
      <h1 class="h3 fw-bold mb-4">Períodos / Campañas</h1>
      <div class="d-flex justify-content-center py-5"><div class="spinner-border text-primary"></div></div>
    </div>`
}

function renderError(container, msg) {
  container.innerHTML = `
    <div class="container py-5 text-center">
      <div class="alert alert-danger border-0 shadow-sm p-4 rounded-3">
        <i class="bi bi-exclamation-triangle-fill fs-1 d-block mb-2"></i>
        <h4 class="fw-bold">Error al cargar campañas</h4>
        <p>${esc(msg)}</p>
        <button class="btn btn-primary rounded-pill px-4 mt-2" id="btn-retry">Reintentar</button>
      </div>
    </div>`
  document.getElementById('btn-retry')?.addEventListener('click', () => renderCampaniasView(container))
}

function render(container) {
  const sel = state.campanias.find((c) => c.id === state.seleccionada) || null

  container.innerHTML = `
    <div class="container-fluid py-4 px-3 px-md-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h1 class="h3 fw-bold mb-1">Períodos / Campañas</h1>
          <p class="text-body-secondary mb-0 small">Inscripción y reinscripción · activación con previsualización</p>
        </div>
      </div>

      <div class="alert alert-warning border-0 shadow-sm small d-flex align-items-start gap-2" role="alert">
        <i class="bi bi-shield-exclamation fs-5"></i>
        <div>El envío real está <strong>bloqueado</strong> hasta el módulo anti-ban. Activar una campaña
        <strong>materializa la audiencia</strong> (deduplicada y trazable), pero <strong>no manda WhatsApps</strong>.</div>
      </div>

      <div class="row g-3">
        <div class="col-12 col-lg-7">
          ${renderLista()}
        </div>
        <div class="col-12 col-lg-5">
          ${renderFormCrear()}
          ${sel ? renderPanelEjecucion(sel) : ''}
        </div>
      </div>
    </div>`

  attach(container)
}

function renderLista() {
  if (state.campanias.length === 0) {
    return `<div class="card border-0 shadow-sm rounded-3"><div class="card-body text-body-secondary text-center py-5">
      <i class="bi bi-megaphone fs-1 d-block mb-2 opacity-50"></i>No hay campañas. Creá una a la derecha.</div></div>`
  }
  const filas = state.campanias.map((c) => {
    const activa = c.activo
    const isSel = c.id === state.seleccionada
    return `
      <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-2 ${isSel ? 'active' : ''}" data-sel="${c.id}">
        <span class="text-truncate">
          <span class="fw-semibold">${esc(c.nombre)}</span>
          <span class="badge text-bg-secondary ms-1">${ACCION_LABEL[c.accion] || c.accion} ${esc(c.tipo)}</span>
          <br><small class="${isSel ? '' : 'text-body-secondary'}">${esc(c.fecha_inicio)} → ${esc(c.fecha_fin)}</small>
        </span>
        <span class="badge rounded-pill ${activa ? 'text-bg-success' : 'text-bg-light'}">${activa ? 'Activa' : 'Inactiva'}</span>
      </button>`
  }).join('')
  return `<div class="card border-0 shadow-sm rounded-3 overflow-hidden">
    <div class="list-group list-group-flush">${filas}</div></div>`
}

function renderFormCrear() {
  return `
    <div class="card border-0 shadow-sm rounded-3 mb-3">
      <div class="card-body">
        <h2 class="h6 fw-bold mb-3"><i class="bi bi-plus-circle me-1"></i>Nueva campaña</h2>
        <form id="form-campania" class="row g-2">
          <div class="col-12">
            <input class="form-control form-control-sm" name="nombre" placeholder="Nombre (ej: Inscripción A 2026)" required>
          </div>
          <div class="col-6">
            <select class="form-select form-select-sm" name="accion" required>
              <option value="inscripcion">Inscripción</option>
              <option value="reinscripcion">Reinscripción</option>
            </select>
          </div>
          <div class="col-6">
            <select class="form-select form-select-sm" name="tipo" required>
              <option value="A">Semestre A</option>
              <option value="B">Semestre B</option>
            </select>
          </div>
          <div class="col-6">
            <input type="date" class="form-control form-control-sm" name="fecha_inicio" required>
          </div>
          <div class="col-6">
            <input type="date" class="form-control form-control-sm" name="fecha_fin" required>
          </div>
          <div class="col-12">
            <button class="btn btn-sm btn-primary rounded-pill px-3 w-100" type="submit">Crear campaña</button>
          </div>
        </form>
      </div>
    </div>`
}

function renderPanelEjecucion(c) {
  const p = state.preview
  let cuerpo
  if (state.cargando) {
    cuerpo = `<div class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>`
  } else if (!p) {
    cuerpo = `<p class="text-body-secondary small mb-0">Previsualizá la audiencia antes de activar.</p>`
  } else if (p.accion === 'inscripcion') {
    const excede = (p.primer_contacto + p.recuperacion) > p.cupo_disponible
    cuerpo = `
      <ul class="list-unstyled small mb-2">
        <li>• Primer contacto: <strong>${p.primer_contacto}</strong></li>
        <li>• Recuperación: <strong>${p.recuperacion}</strong></li>
        <li class="text-body-secondary">• Sin teléfono: ${p.sin_telefono}</li>
        <li>• Cupo disponible: <strong>${p.cupo_disponible}</strong> / ${p.cupo_total}</li>
      </ul>
      ${excede ? `<div class="alert alert-warning py-2 px-2 small mb-2">⚠️ La audiencia supera el cupo disponible. Abrí otro grupo de Iniciación Musical o enviá en tandas.</div>` : ''}`
  } else {
    cuerpo = `
      <ul class="list-unstyled small mb-2">
        <li>• Reinscripción: <strong>${p.reinscripcion}</strong></li>
        <li class="text-body-secondary">• Sin teléfono: ${p.sin_telefono}</li>
      </ul>`
  }

  return `
    <div class="card border-0 shadow-sm rounded-3">
      <div class="card-body">
        <h2 class="h6 fw-bold mb-2"><i class="bi bi-play-circle me-1"></i>${esc(c.nombre)}</h2>
        ${cuerpo}
        <div class="d-flex gap-2 flex-wrap mt-2">
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3" id="btn-preview">
            <i class="bi bi-search me-1"></i>Previsualizar
          </button>
          <button class="btn btn-sm btn-primary rounded-pill px-3" id="btn-activar" ${state.preview ? '' : 'disabled'}>
            <i class="bi bi-megaphone me-1"></i>Activar y materializar
          </button>
          ${c.activo ? `<button class="btn btn-sm btn-success rounded-pill px-3" id="btn-encolar" title="Mueve una tanda a la cola respetando opt-out y tope diario">
            <i class="bi bi-send me-1"></i>Encolar tanda (anti-ban)
          </button>` : ''}
          ${c.activo ? `<button class="btn btn-sm btn-outline-secondary rounded-pill px-3" id="btn-desactivar">Desactivar</button>` : ''}
        </div>
      </div>
    </div>`
}

function attach(container) {
  container.querySelectorAll('[data-sel]').forEach((b) =>
    b.addEventListener('click', () => {
      state.seleccionada = b.dataset.sel
      state.preview = null
      render(container)
    }))

  container.querySelector('#form-campania')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const fd = new FormData(e.target)
    try {
      const nueva = await crearCampania({
        nombre: fd.get('nombre'),
        accion: fd.get('accion'),
        tipo: fd.get('tipo'),
        fecha_inicio: fd.get('fecha_inicio'),
        fecha_fin: fd.get('fecha_fin'),
      })
      state.seleccionada = nueva.id
      state.preview = null
      await cargar(container)
    } catch (err) {
      alert(`Error al crear campaña: ${err.message}`)
    }
  })

  container.querySelector('#btn-preview')?.addEventListener('click', async () => {
    state.cargando = true
    render(container)
    try {
      state.preview = await previewCampania(state.seleccionada)
    } catch (err) {
      alert(`Error en preview: ${err.message}`)
    } finally {
      state.cargando = false
      render(container)
    }
  })

  container.querySelector('#btn-activar')?.addEventListener('click', async () => {
    if (!confirm('Esto materializa la audiencia deduplicada (no envía WhatsApps). ¿Continuar?')) return
    try {
      const r = await activarCampania(state.seleccionada)
      alert(`Campaña activada. Audiencia materializada: ${r.materializados} contacto(s).`)
      state.preview = null
      await cargar(container)
    } catch (err) {
      alert(`Error al activar: ${err.message}`)
    }
  })

  container.querySelector('#btn-encolar')?.addEventListener('click', async () => {
    if (!confirm('Esto mueve una tanda a la cola de envío (respeta opt-out y tope diario). Los mensajes se despachan con ritmo anti-ban solo si el gateway está activo. ¿Continuar?')) return
    try {
      const r = await encolarCampania(state.seleccionada)
      alert(`Encolados: ${r.encolados}. Tope hoy: ${r.cap_hoy} · Enviados hoy: ${r.enviados_hoy} · Restante: ${r.restante_tras_encolar}.`)
      await cargar(container)
    } catch (err) {
      alert(`Error al encolar: ${err.message}`)
    }
  })

  container.querySelector('#btn-desactivar')?.addEventListener('click', async () => {
    try {
      await desactivarCampania(state.seleccionada)
      await cargar(container)
    } catch (err) {
      alert(`Error al desactivar: ${err.message}`)
    }
  })
}

function esc(s) {
  if (s == null) return ''
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
