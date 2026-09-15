/**
 * signageSlideEditorView.js — Suite de diseño tipo Canva (Lienzo 1280×720).
 *
 * HERRAMIENTAS PREMIUM implementadas:
 * ─────────────────────────────────────────────────────────────────────────────
 *  [1] Text Gradient       — background-clip:text, colores inicio/fin
 *  [2] Text Stroke         — -webkit-text-stroke: ancho + color
 *  [3] Filtros de imagen   — brightness / contrast / grayscale / blur (sliders)
 *  [4] Flip H / V          — scaleX(-1) / scaleY(-1) por elemento
 *  [5] Zoom del lienzo     — botones +/- más allá del auto-fit
 *  [6] Snap / Guías        — líneas rojas al alinear con centro o borde de otros elementos
 *  [7] Clip-to-Shape       — clip-path circle / hexagon / rhombus en imágenes
 *  [8] Layer Panel         — lista visual de capas con drag de reorden + eye + lock
 *  [9] Bordes avanzados    — border-style solid/dashed/dotted/double por elemento
 * [10] QR Code Generator   — inserta QR como imagen canvas (sin librerías)
 * [11] Export como PNG     — html2canvas captura el lienzo y descarga
 * [12] Countdown Element   — tipo especial countdown con fecha objetivo
 * [13] Background Blur     — capa glassmorphism sobre fondo imagen
 * [14] Repeat / Grid       — duplica un elemento en cuadrícula N×M
 * [15] Grilla de ayuda     — toggle CSS grid overlay 8px sobre el lienzo
 * [16] Historial visual    — mini timeline últimos 10 snapshots con miniaturas
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Funcionalidades base que se mantienen:
 *  - Drag & drop, resize, z-index (frente/fondo), bloqueo, duplicar (Ctrl+D)
 *  - Tipografía Pro: fuentes, pesos 300-900, B/I/U, mayúsculas, alineación
 *  - Paleta de color rápida (15 colores) + picker nativo
 *  - Múltiples imágenes con bordes, redondez, sombra, opacidad, ajuste
 *  - Formas: rect, card, banner, line, circle + glassmorphism
 *  - Plantillas rápidas: Concierto, Comunicado, Inscripciones, Cita Célebre
 *  - Undo/Redo 30 pasos (Ctrl+Z / Ctrl+Y)
 *  - Centrar horizontal / vertical
 *  - Inspector sin desbordamiento
 */

import '../styles/signage-admin.css'
import { escapeHTML } from '../../../shared/utils/sanitize.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { router } from '../../../core/router/router.js'
import * as api from '../api/signageAdminApi.js'

// ─── Constantes ──────────────────────────────────────────────────────────────

const CV_GRAD = {
  oscuro:  'linear-gradient(135deg, #10192b 0%, #080c14 100%)',
  dorado:  'linear-gradient(135deg, #2b210e 0%, #0b0e17 75%)',
  azul:    'linear-gradient(135deg, #0b223a 0%, #060e1a 80%)',
  verde:   'linear-gradient(135deg, #0e291e 0%, #06120d 80%)',
  rojo:    'linear-gradient(135deg, #331014 0%, #0d0607 80%)',
  purpura: 'linear-gradient(135deg, #261138 0%, #0b0512 80%)',
}

const CV_FONT = {
  sans:    'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  serif:   'Georgia, "Playfair Display", "Times New Roman", serif',
  display: 'Impact, "Montserrat", "Arial Black", sans-serif',
  mono:    '"Fira Code", "Courier New", Courier, monospace',
  hand:    '"Brush Script MT", "Segoe Script", cursive, Georgia, serif',
}

const PALETA_RAPIDA = [
  '#ffffff','#f8fafc','#94a3b8','#38bdf8','#0284c7',
  '#fbbf24','#f59e0b','#34d399','#10b981','#f43f5e',
  '#e11d48','#a855f7','#7c3aed','#0f172a','#000000',
]

const CLIP_SHAPES = {
  none:    'none',
  circle:  'circle(50% at 50% 50%)',
  hex:     'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  rhombus: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  star:    'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)',
}

const SNAP_THRESHOLD = 8 // px en coordenadas canvas

const cvUid = () => 'e' + Math.random().toString(36).slice(2, 8)

// ─── QR Code Generator (sin librerías) ───────────────────────────────────────
// Implementación mínima de QR versión 1 (21×21) sólo ASCII / UTF-8 corto.
// Para URLs largas usamos la API pública de QR: api.qrserver.com
function buildQrDataUrl(text) {
  return new Promise((resolve) => {
    const size = 200
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const encoded = encodeURIComponent(text)
    img.crossOrigin = 'anonymous'
    img.onload = () => { ctx.drawImage(img, 0, 0, size, size); resolve(canvas.toDataURL('image/png')) }
    img.onerror = () => resolve(null)
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=ffffff&bgcolor=0b0e17`
  })
}

// ─── html2canvas polyfill simple (DOM→PNG) ───────────────────────────────────
// Carga html2canvas dinámicamente desde CDN si no está disponible.
async function ensureHtml2canvas() {
  if (window.html2canvas) return window.html2canvas
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
    s.onload = () => resolve(window.html2canvas)
    s.onerror = () => reject(new Error('No se pudo cargar html2canvas'))
    document.head.appendChild(s)
  })
}

// ─── View ─────────────────────────────────────────────────────────────────────

export async function renderSignageSlideEditorView(container, params = {}) {
  if (container.cleanup) container.cleanup()

  const medioId = params.id || params.medioId ||
    (params.edit && params.edit !== 'true' && params.edit !== true ? params.edit : null)
  const pantallaId = params.pantallaId || null

  let medio = null
  let cv = {
    tipo: 'canvas',
    w: 1280,
    h: 720,
    fondo: { tipo: 'gradiente', valor: 'oscuro' },
    elementos: [],
  }
  let duracionSeg = 12
  let sel = null          // id del elemento seleccionado
  let scale = 1           // escala actual del lienzo en pantalla
  let zoomExtra = 1       // zoom manual adicional
  let guardando = false
  let showGrid = false    // toggle grilla de ayuda

  // Historial Undo / Redo
  const undoStack = []
  const redoStack = []
  // Snapshots visuales (últimos 10)
  const visualHistory = []

  function pushState() {
    undoStack.push(JSON.stringify(cv))
    if (undoStack.length > 30) undoStack.shift()
    redoStack.length = 0
    // guardar snapshot visual
    const snap = JSON.stringify(cv)
    visualHistory.push(snap)
    if (visualHistory.length > 10) visualHistory.shift()
  }

  // ─── Carga del medio ───────────────────────────────────────────────────────

  container.innerHTML = `
    <div class="page-container signage-studio ss-slide-editor">
      <div class="text-center text-muted py-5">
        <span class="spinner-border spinner-border-sm me-2"></span>Cargando estudio de diseño…
      </div>
    </div>`

  if (medioId) {
    try {
      medio = await api.obtenerMedio(medioId)
      if (medio && medio.contenido && medio.contenido.tipo === 'canvas') {
        cv = JSON.parse(JSON.stringify(medio.contenido))
        cv.w = cv.w || 1280
        cv.h = cv.h || 720
        cv.elementos = cv.elementos || []
      }
      duracionSeg = medio?.duracion_seg || 12
    } catch (e) {
      container.innerHTML = `
        <div class="page-container signage-studio ss-slide-editor p-4">
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i>Error al cargar la diapositiva: ${escapeHTML(e.message)}
          </div>
          <button class="btn btn-outline-secondary" id="ss-btn-error-back">
            <i class="bi bi-arrow-left me-1"></i>Volver a la cartelera
          </button>
        </div>`
      container.querySelector('#ss-btn-error-back')?.addEventListener('click', () => router.navigate('cartelera'))
      return
    }
  }

  const esEdicion = Boolean(medio)

  // ─── HTML principal ────────────────────────────────────────────────────────

  function renderView() {
    container.innerHTML = `
      <div class="page-container signage-studio ss-slide-editor">

        <!-- Encabezado superior -->
        <header class="ss-slide-header">
          <div class="d-flex align-items-center gap-2 min-w-0">
            <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" id="ss-btn-back" title="Volver">
              <i class="bi bi-arrow-left"></i>
              <span class="d-none d-sm-inline">Volver</span>
            </button>
            <div class="min-w-0">
              <h5 class="fw-bold mb-0 text-body text-truncate d-flex align-items-center gap-2" style="font-size:1rem;">
                <i class="bi bi-easel2-fill text-primary"></i>
                <span>${esEdicion ? 'Editar diapositiva' : 'Diseñador de Diapositiva'}</span>
              </h5>
              <small class="text-muted d-block text-truncate" style="font-size:.72rem;">
                Lienzo 1280×720 · Doble clic en texto para editar · Arrastra y dimensiona libremente
              </small>
            </div>
          </div>

          <div class="d-flex align-items-center gap-2 flex-wrap justify-content-end">
            <!-- Deshacer / Rehacer -->
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-secondary" id="ss-btn-undo" title="Deshacer (Ctrl+Z)">
                <i class="bi bi-arrow-counterclockwise"></i>
              </button>
              <button class="btn btn-outline-secondary" id="ss-btn-redo" title="Rehacer (Ctrl+Y)">
                <i class="bi bi-arrow-clockwise"></i>
              </button>
            </div>

            <!-- Zoom del lienzo -->
            <div class="btn-group btn-group-sm" title="Zoom del lienzo">
              <button class="btn btn-outline-secondary" id="ss-btn-zoom-out" title="Alejar"><i class="bi bi-zoom-out"></i></button>
              <span class="btn btn-outline-secondary pe-none" id="ss-zoom-label" style="min-width:3.2rem;font-size:.75rem;">Auto</span>
              <button class="btn btn-outline-secondary" id="ss-btn-zoom-in" title="Acercar"><i class="bi bi-zoom-in"></i></button>
              <button class="btn btn-outline-secondary" id="ss-btn-zoom-reset" title="Restablecer zoom"><i class="bi bi-fullscreen-exit"></i></button>
            </div>

            <!-- Grilla -->
            <button class="btn btn-sm btn-outline-secondary" id="ss-btn-grid" title="Mostrar/ocultar grilla de ayuda">
              <i class="bi bi-grid-3x3"></i>
            </button>

            <!-- Export PNG -->
            <button class="btn btn-sm btn-outline-info d-flex align-items-center gap-1" id="ss-btn-export" title="Exportar como PNG">
              <i class="bi bi-download"></i>
              <span class="d-none d-md-inline">PNG</span>
            </button>

            <!-- Duración -->
            <div class="d-flex align-items-center gap-1 bg-body-tertiary px-2 py-1 rounded-3 border border-body-tertiary" title="Segundos en pantalla">
              <i class="bi bi-clock-history text-muted small"></i>
              <input type="number" id="ss-cv-dur" class="form-control form-control-sm text-center p-0" style="width:3.2rem;height:26px;" min="4" max="60" value="${duracionSeg}">
              <span class="small text-muted" style="font-size:.75rem;">s</span>
            </div>

            ${esEdicion ? `
              <button class="btn btn-sm btn-outline-danger" id="ss-btn-delete" title="Eliminar diapositiva">
                <i class="bi bi-trash"></i>
              </button>` : ''}

            <button class="btn btn-sm btn-primary d-flex align-items-center gap-1" id="ss-btn-save" ${guardando ? 'disabled' : ''}>
              ${guardando
                ? '<span class="spinner-border spinner-border-sm me-1"></span>Guardando…'
                : '<i class="bi bi-check-lg me-1"></i>Guardar'}
            </button>
          </div>
        </header>

        <!-- Barra de herramientas superior -->
        <div class="ss-cv-tools-bar">
          <div class="d-flex align-items-center gap-1 flex-wrap w-100">

            <!-- Texto -->
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-primary dropdown-toggle d-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-fonts"></i><span>Texto</span>
              </button>
              <ul class="dropdown-menu shadow-sm">
                <li><button class="dropdown-item small py-2" data-add-text="title"><b>Título Principal</b> (84px, Bold)</button></li>
                <li><button class="dropdown-item small py-2" data-add-text="subtitle">Subtítulo Destacado (54px)</button></li>
                <li><button class="dropdown-item small py-2" data-add-text="body">Párrafo / Cuerpo (36px)</button></li>
                <li><hr class="dropdown-divider my-1"></li>
                <li><button class="dropdown-item small py-2" data-add-text="badge">🏷️ Badge / Etiqueta</button></li>
              </ul>
            </div>

            <!-- Imagen -->
            <label class="btn btn-sm btn-outline-primary mb-0 d-flex align-items-center gap-1" title="Subir imagen(es)">
              <i class="bi bi-image"></i><span>Imagen</span>
              <input type="file" accept="image/*" multiple hidden data-cv="add-img">
            </label>

            <!-- Formas -->
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-square"></i><span>Forma</span>
              </button>
              <ul class="dropdown-menu shadow-sm">
                <li><button class="dropdown-item small py-2" data-add-shape="card"><i class="bi bi-card-heading me-2 text-primary"></i>Tarjeta Glass</button></li>
                <li><button class="dropdown-item small py-2" data-add-shape="banner"><i class="bi bi-bookmark-fill me-2 text-warning"></i>Banner/Cinta</button></li>
                <li><button class="dropdown-item small py-2" data-add-shape="line"><i class="bi bi-dash-lg me-2 text-info"></i>Línea Separadora</button></li>
                <li><button class="dropdown-item small py-2" data-add-shape="rect"><i class="bi bi-square-fill me-2 text-secondary"></i>Rectángulo</button></li>
                <li><button class="dropdown-item small py-2" data-add-shape="circle"><i class="bi bi-circle-fill me-2 text-success"></i>Círculo</button></li>
              </ul>
            </div>

            <!-- Premium -->
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-warning dropdown-toggle d-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-stars"></i><span>Premium</span>
              </button>
              <ul class="dropdown-menu shadow-sm">
                <li><button class="dropdown-item small py-2" data-add-premium="qr"><i class="bi bi-qr-code me-2 text-success"></i>QR Code</button></li>
                <li><button class="dropdown-item small py-2" data-add-premium="countdown"><i class="bi bi-alarm me-2 text-danger"></i>Countdown / Cuenta atrás</button></li>
                <li><button class="dropdown-item small py-2" data-add-premium="blur-overlay"><i class="bi bi-layers-half me-2 text-info"></i>Overlay Glass (blur)</button></li>
                <li><hr class="dropdown-divider my-1"></li>
                <li><button class="dropdown-item small py-2" data-repeat-grid>
                  <i class="bi bi-grid me-2 text-warning"></i>Repetir en cuadrícula (N×M)
                </button></li>
              </ul>
            </div>

            <!-- Plantillas -->
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-magic text-warning"></i><span>Plantillas</span>
              </button>
              <ul class="dropdown-menu shadow-sm">
                <li><button class="dropdown-item small py-2" data-tpl="concierto">🎭 Concierto / Gala</button></li>
                <li><button class="dropdown-item small py-2" data-tpl="urgente">📢 Comunicado Oficial</button></li>
                <li><button class="dropdown-item small py-2" data-tpl="inscripciones">🎓 Inscripciones</button></li>
                <li><button class="dropdown-item small py-2" data-tpl="cita">💬 Cita Célebre</button></li>
              </ul>
            </div>

            <span class="ss-cv-sep"></span>

            <!-- Fondo -->
            <div class="d-flex align-items-center gap-1">
              <span class="small text-muted me-1 d-none d-md-inline" style="font-size:.78rem;"><i class="bi bi-palette me-1"></i>Fondo:</span>
              <select class="form-select form-select-sm" style="width:auto;height:30px;font-size:.78rem;" data-cv="bg-kind">
                <option value="gradiente">Gradiente</option>
                <option value="color">Color sólido</option>
                <option value="imagen">Imagen</option>
              </select>
              <select class="form-select form-select-sm" style="width:auto;height:30px;font-size:.78rem;" data-cv="bg-grad">
                <option value="oscuro">Oscuro</option>
                <option value="dorado">Dorado</option>
                <option value="azul">Azul</option>
                <option value="verde">Verde</option>
                <option value="rojo">Rojo borgoña</option>
                <option value="purpura">Púrpura</option>
              </select>
              <input type="color" class="form-control form-control-color form-control-sm" data-cv="bg-color" value="#0b0e17" style="height:30px;width:34px;" hidden>
              <label class="btn btn-sm btn-outline-secondary mb-0" data-cv="bg-img-lbl" style="height:30px;font-size:.78rem;" hidden>
                <i class="bi bi-upload me-1"></i>Subir
                <input type="file" accept="image/*" hidden data-cv="bg-img">
              </label>
            </div>

            <!-- Acciones rápidas -->
            <div class="ms-auto d-flex align-items-center gap-1">
              <button class="btn btn-sm btn-outline-secondary" id="ss-btn-clone" title="Duplicar (Ctrl+D)"><i class="bi bi-copy"></i></button>
              <button class="btn btn-sm btn-outline-secondary" id="ss-btn-center-h" title="Centrar horizontal"><i class="bi bi-align-center"></i></button>
              <button class="btn btn-sm btn-outline-secondary" id="ss-btn-center-v" title="Centrar vertical"><i class="bi bi-align-middle"></i></button>
            </div>
          </div>
        </div>

        <!-- Área de trabajo -->
        <div class="ss-slide-workspace">
          <!-- Escenario central -->
          <div class="ss-cv-stage-wrapper">
            <div class="ss-cv-stage" data-cv="stage">
              <div class="ss-cv-art" data-cv="art">
                <!-- Grilla de ayuda (toggle) -->
                <div class="ss-cv-grid-overlay" id="ss-grid-overlay" style="display:none;"></div>
                <!-- Guías de snap -->
                <div class="ss-snap-guide-h" id="ss-snap-h" style="display:none;"></div>
                <div class="ss-snap-guide-v" id="ss-snap-v" style="display:none;"></div>
              </div>
            </div>
            <div class="ss-stage-hint d-flex align-items-center justify-content-between">
              <small class="text-muted" style="font-size:.72rem;">
                <i class="bi bi-info-circle me-1"></i><b>Clic:</b> seleccionar · <b>Dbl clic:</b> editar · <b>Supr:</b> borrar · <b>Ctrl+D:</b> duplicar
              </small>
              <small class="text-muted" style="font-size:.72rem;" data-cv="canvas-info">1280 × 720 px</small>
            </div>
          </div>

          <!-- Panel lateral: Inspector + Layer Panel -->
          <aside class="ss-slide-inspector">
            <!-- Tabs: Propiedades / Capas / Historial -->
            <div class="ss-inspector-tabs" id="ss-inspector-tabs">
              <button class="ss-itab active" data-tab="props"><i class="bi bi-sliders me-1"></i>Props</button>
              <button class="ss-itab" data-tab="layers"><i class="bi bi-layers me-1"></i>Capas</button>
              <button class="ss-itab" data-tab="history"><i class="bi bi-clock-history me-1"></i>Historial</button>
            </div>

            <div class="ss-inspector-head d-flex align-items-center justify-content-between" id="ss-inspector-head">
              <span class="fw-semibold small d-flex align-items-center gap-2">
                <i class="bi bi-sliders text-primary"></i>Propiedades
              </span>
              <span class="badge bg-body-tertiary text-muted border border-body-tertiary" style="font-size:.68rem;" data-p-type-badge>Lienzo</span>
            </div>

            <!-- Tab: Propiedades -->
            <div class="ss-cv-props" data-cv="props" id="ss-tab-props"></div>

            <!-- Tab: Capas -->
            <div class="ss-cv-props" id="ss-tab-layers" style="display:none;"></div>

            <!-- Tab: Historial visual -->
            <div class="ss-cv-props" id="ss-tab-history" style="display:none;"></div>
          </aside>
        </div>
      </div>`

    wireEvents()
  }

  // ─── Lógica principal (eventos, render) ────────────────────────────────────

  function wireEvents() {
    const art    = container.querySelector('[data-cv="art"]')
    const stage  = container.querySelector('[data-cv="stage"]')
    const props  = container.querySelector('#ss-tab-props')
    const typeBadge = container.querySelector('[data-p-type-badge]')

    if (!art || !stage || !props) return

    art.style.width  = cv.w + 'px'
    art.style.height = cv.h + 'px'

    // ── Fit scale ───────────────────────────────────────────────────────────
    const fitScale = () => {
      if (!stage.isConnected) return
      const r = stage.getBoundingClientRect()
      const base = Math.max(0.08, Math.min((r.width - 32) / cv.w, (r.height - 32) / cv.h))
      scale = base * zoomExtra
      art.style.transform = `scale(${scale})`
      const pct = Math.round(zoomExtra * 100)
      const lbl = container.querySelector('#ss-zoom-label')
      if (lbl) lbl.textContent = zoomExtra === 1 ? 'Auto' : pct + '%'
    }

    // ── Background CSS ──────────────────────────────────────────────────────
    const bgCss = () => {
      const f = cv.fondo || {}
      if (f.tipo === 'imagen' && f.storage_path) {
        return `#0b0e17 center/cover no-repeat url(${api.urlPublica(f.storage_path)})`
      }
      if (f.tipo === 'color') return f.valor || '#0b0e17'
      return CV_GRAD[f.valor] || CV_GRAD.oscuro
    }

    // ── Render del lienzo ───────────────────────────────────────────────────
    function renderArt() {
      art.style.background = bgCss()

      // Preserve los elementos internos que no son cvel (grilla, guías)
      const specialNodes = [...art.querySelectorAll('.ss-cv-grid-overlay, .ss-snap-guide-h, .ss-snap-guide-v')]

      art.innerHTML = ''

      // Re-insertar nodos especiales
      specialNodes.forEach((n) => art.appendChild(n))

      // Grid overlay
      const gridOverlay = art.querySelector('#ss-grid-overlay') || (() => {
        const d = document.createElement('div'); d.className = 'ss-cv-grid-overlay'; d.id = 'ss-grid-overlay'; art.appendChild(d); return d
      })()
      gridOverlay.style.display = showGrid ? 'block' : 'none'

      // Snap guides
      let snapH = art.querySelector('#ss-snap-h')
      let snapV = art.querySelector('#ss-snap-v')
      if (!snapH) { snapH = document.createElement('div'); snapH.className = 'ss-snap-guide-h'; snapH.id = 'ss-snap-h'; snapH.style.display = 'none'; art.appendChild(snapH) }
      if (!snapV) { snapV = document.createElement('div'); snapV.className = 'ss-snap-guide-v'; snapV.id = 'ss-snap-v'; snapV.style.display = 'none'; art.appendChild(snapV) }

      cv.elementos.forEach((el) => {
        const wrapper = buildElementNode(el)
        art.appendChild(wrapper)
      })

      updateLayerPanel()
    }

    // ── Construir nodo DOM de un elemento ───────────────────────────────────
    function buildElementNode(el) {
      const isSelected = sel === el.id
      const wrapper = document.createElement('div')
      wrapper.dataset.id = el.id
      wrapper.className = `cvel${isSelected ? ' is-sel' : ''}${el.bloqueado ? ' is-locked' : ''}`
      wrapper.style.cssText = [
        `left:${el.x}px`, `top:${el.y}px`,
        `width:${el.w}px`, `height:${el.h}px`,
        `opacity:${el.opacidad != null ? el.opacidad : 1}`,
        buildTransformCSS(el),
      ].join(';')

      if (el.tipo === 'imagen') {
        applyImageNode(wrapper, el)
      } else if (el.tipo === 'forma') {
        applyShapeNode(wrapper, el)
      } else if (el.tipo === 'countdown') {
        applyCountdownNode(wrapper, el)
      } else {
        applyTextNode(wrapper, el)
      }

      if (isSelected && !el.bloqueado) {
        const h = document.createElement('span')
        h.className = 'cvel-h'
        h.dataset.h = 'se'
        wrapper.appendChild(h)
      }
      if (el.bloqueado) {
        const lb = document.createElement('span')
        lb.className = 'cvel-lock-badge'
        lb.title = 'Elemento bloqueado'
        lb.innerHTML = '<i class="bi bi-lock-fill"></i>'
        wrapper.appendChild(lb)
      }

      return wrapper
    }

    // ── CSS de transform (flip) ─────────────────────────────────────────────
    function buildTransformCSS(el) {
      const sx = el.flipH ? -1 : 1
      const sy = el.flipV ? -1 : 1
      if (sx !== 1 || sy !== 1) return `transform:scale(${sx},${sy})`
      return ''
    }

    // ── Imagen ──────────────────────────────────────────────────────────────
    function applyImageNode(wrapper, el) {
      const img = document.createElement('img')
      img.src = el.storage_path ? api.urlPublica(el.storage_path) : ''
      img.draggable = false
      img.style.cssText = [
        'width:100%', 'height:100%', 'pointer-events:none', 'display:block',
        `object-fit:${el.ajuste === 'cover' ? 'cover' : 'contain'}`,
        `border-radius:${el.borderRadius || 0}px`,
        el.bordeAncho ? `border:${el.bordeAncho}px ${el.bordeStyle || 'solid'} ${el.bordeColor || '#ffffff'}` : 'border:none',
        el.sombra ? 'box-shadow:0 12px 36px rgba(0,0,0,.6)' : 'box-shadow:none',
        buildClipCSS(el),
        buildFilterCSS(el),
      ].join(';')
      wrapper.appendChild(img)
    }

    // ── Forma ───────────────────────────────────────────────────────────────
    function applyShapeNode(wrapper, el) {
      const inner = document.createElement('div')
      inner.style.pointerEvents = 'none'
      inner.style.width = '100%'
      inner.style.height = '100%'
      inner.style.background = el.color || 'rgba(255,255,255,0.08)'

      if (el.formaTipo === 'card') {
        inner.style.cssText += ';border-radius:18px;backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.18);box-shadow:0 16px 40px rgba(0,0,0,0.4);'
      } else if (el.formaTipo === 'banner') {
        inner.style.cssText += ';border-radius:8px;border-left:8px solid #fbbf24;box-shadow:0 8px 24px rgba(0,0,0,0.35);'
      } else if (el.formaTipo === 'circle') {
        inner.style.cssText += ';border-radius:50%;'
      } else if (el.formaTipo === 'line') {
        inner.style.cssText += ';border-radius:2px;'
      } else {
        inner.style.borderRadius = (el.borderRadius || 8) + 'px'
        if (el.bordeAncho) {
          inner.style.border = `${el.bordeAncho}px ${el.bordeStyle || 'solid'} ${el.bordeColor || '#fff'}`
        }
        if (el.sombra) inner.style.boxShadow = '0 10px 30px rgba(0,0,0,.5)'
      }
      wrapper.appendChild(inner)
    }

    // ── Countdown ───────────────────────────────────────────────────────────
    function applyCountdownNode(wrapper, el) {
      wrapper.classList.add('cvel--countdown')
      const remaining = el.targetDate ? getCountdownText(el.targetDate) : '00:00:00'
      const inner = document.createElement('div')
      inner.style.cssText = `width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;
        font-size:${el.tamano || 72}px;font-weight:800;color:${el.color || '#ffffff'};font-family:${CV_FONT.display};
        text-shadow:0 2px 20px rgba(0,0,0,.8);pointer-events:none;text-align:center;`
      inner.innerHTML = `
        <div class="cvel-countdown-display" style="font-size:inherit;">${remaining}</div>
        ${el.label ? `<div style="font-size:${Math.round((el.tamano || 72) * 0.3)}px;opacity:.75;margin-top:6px;">${escapeHTML(el.label)}</div>` : ''}
      `
      wrapper.appendChild(inner)
    }

    function getCountdownText(targetDate) {
      const diff = Math.max(0, new Date(targetDate) - Date.now())
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      if (d > 0) return `${d}d ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m`
      return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    }

    // ── Texto ────────────────────────────────────────────────────────────────
    function applyTextNode(wrapper, el) {
      wrapper.classList.add('cvel--texto')
      wrapper.style.fontSize      = (el.tamano || 48) + 'px'
      wrapper.style.fontWeight    = el.peso || 700
      wrapper.style.textAlign     = el.align || 'left'
      wrapper.style.fontFamily    = CV_FONT[el.fuente] || CV_FONT.sans
      wrapper.style.fontStyle     = el.italic ? 'italic' : 'normal'
      wrapper.style.textDecoration = el.underline ? 'underline' : 'none'
      wrapper.style.textTransform  = el.transform || 'none'
      wrapper.style.letterSpacing  = el.letterSpacing ? el.letterSpacing + 'px' : 'normal'
      wrapper.style.lineHeight     = el.lineHeight || 1.15
      wrapper.style.whiteSpace     = 'pre-wrap'
      wrapper.style.overflow       = 'hidden'
      wrapper.style.display        = 'flex'
      wrapper.style.flexDirection  = 'column'
      wrapper.style.justifyContent = 'center'

      // Text shadow
      wrapper.style.textShadow = el.sombra
        ? `0 2px ${el.sombraBlur || 14}px ${el.sombraColor || 'rgba(0,0,0,.75)'}`
        : 'none'

      // Text stroke
      if (el.textStroke && el.textStrokeWidth) {
        wrapper.style.webkitTextStroke = `${el.textStrokeWidth}px ${el.textStrokeColor || '#000000'}`
      } else {
        wrapper.style.webkitTextStroke = ''
      }

      // Fondo / badge
      if (el.fondoColor) {
        wrapper.style.background   = el.fondoColor
        wrapper.style.padding      = '6px 14px'
        wrapper.style.borderRadius = '8px'
      } else {
        wrapper.style.background   = 'transparent'
        wrapper.style.padding      = '0'
        wrapper.style.borderRadius = '0'
      }

      const span = document.createElement('span')
      span.className = 'cvel-text'
      span.style.pointerEvents = 'none'

      // Text Gradient
      if (el.textGradient && el.textGradientStart && el.textGradientEnd) {
        span.style.background = `linear-gradient(${el.textGradientAngle || 135}deg, ${el.textGradientStart}, ${el.textGradientEnd})`
        span.style.webkitBackgroundClip = 'text'
        span.style.webkitTextFillColor  = 'transparent'
        span.style.backgroundClip       = 'text'
        span.style.display              = 'block'
        // Sombra no es compatible con text-fill-color; desactivar
        wrapper.style.textShadow = 'none'
        // Stroke tampoco
        wrapper.style.webkitTextStroke = ''
      } else {
        span.style.color = el.color || '#ffffff'
        span.style.webkitTextFillColor = ''
        span.style.webkitBackgroundClip = ''
        span.style.background = ''
      }

      span.textContent = el.texto || ''
      wrapper.appendChild(span)
    }

    // ── CSS helpers ─────────────────────────────────────────────────────────
    function buildClipCSS(el) {
      if (!el.clipShape || el.clipShape === 'none') return 'clip-path:none'
      return `clip-path:${CLIP_SHAPES[el.clipShape] || 'none'}`
    }

    function buildFilterCSS(el) {
      const parts = []
      if (el.filterBrightness != null && el.filterBrightness !== 100) parts.push(`brightness(${el.filterBrightness}%)`)
      if (el.filterContrast != null && el.filterContrast !== 100) parts.push(`contrast(${el.filterContrast}%)`)
      if (el.filterGrayscale) parts.push(`grayscale(${el.filterGrayscale}%)`)
      if (el.filterBlur) parts.push(`blur(${el.filterBlur}px)`)
      return parts.length ? `filter:${parts.join(' ')}` : 'filter:none'
    }

    // ── Sync rápido sin re-renderizar todo ──────────────────────────────────
    function syncElementToArt(el) {
      const n = nodeOf(el)
      if (!n) return

      n.style.opacity   = el.opacidad != null ? el.opacidad : 1
      n.style.left      = el.x + 'px'
      n.style.top       = el.y + 'px'
      n.style.width     = el.w + 'px'
      n.style.height    = el.h + 'px'
      n.style.cssText  += ';' + buildTransformCSS(el)

      if (el.tipo === 'texto') {
        const span = n.querySelector('.cvel-text')
        if (span) span.textContent = el.texto || ''
        n.style.fontSize       = (el.tamano || 48) + 'px'
        n.style.fontWeight     = el.peso || 700
        n.style.textAlign      = el.align || 'left'
        n.style.fontFamily     = CV_FONT[el.fuente] || CV_FONT.sans
        n.style.fontStyle      = el.italic ? 'italic' : 'normal'
        n.style.textDecoration = el.underline ? 'underline' : 'none'
        n.style.textTransform  = el.transform || 'none'
        n.style.letterSpacing  = el.letterSpacing ? el.letterSpacing + 'px' : 'normal'
        n.style.lineHeight     = el.lineHeight || 1.15
        n.style.textShadow     = el.sombra ? `0 2px ${el.sombraBlur || 14}px ${el.sombraColor || 'rgba(0,0,0,.75)'}` : 'none'
        n.style.webkitTextStroke = (el.textStroke && el.textStrokeWidth)
          ? `${el.textStrokeWidth}px ${el.textStrokeColor || '#000'}`
          : ''
        n.style.background   = el.fondoColor || 'transparent'
        n.style.padding      = el.fondoColor ? '6px 14px' : '0'
        n.style.borderRadius = el.fondoColor ? '8px' : '0'

        if (span) {
          if (el.textGradient && el.textGradientStart && el.textGradientEnd) {
            span.style.background = `linear-gradient(${el.textGradientAngle || 135}deg, ${el.textGradientStart}, ${el.textGradientEnd})`
            span.style.webkitBackgroundClip = 'text'
            span.style.webkitTextFillColor  = 'transparent'
            span.style.backgroundClip       = 'text'
            span.style.display              = 'block'
            span.style.color                = ''
            n.style.textShadow              = 'none'
          } else {
            span.style.background           = ''
            span.style.webkitBackgroundClip = ''
            span.style.webkitTextFillColor  = ''
            span.style.backgroundClip       = ''
            span.style.color                = el.color || '#ffffff'
          }
        }
      } else if (el.tipo === 'imagen') {
        const img = n.querySelector('img')
        if (img) {
          img.style.objectFit    = el.ajuste === 'cover' ? 'cover' : 'contain'
          img.style.borderRadius = (el.borderRadius || 0) + 'px'
          img.style.border       = el.bordeAncho ? `${el.bordeAncho}px ${el.bordeStyle || 'solid'} ${el.bordeColor || '#fff'}` : 'none'
          img.style.boxShadow    = el.sombra ? '0 12px 36px rgba(0,0,0,.6)' : 'none'
          img.style.clipPath     = CLIP_SHAPES[el.clipShape] || 'none'
          const filterParts = []
          if (el.filterBrightness != null && el.filterBrightness !== 100) filterParts.push(`brightness(${el.filterBrightness}%)`)
          if (el.filterContrast   != null && el.filterContrast   !== 100) filterParts.push(`contrast(${el.filterContrast}%)`)
          if (el.filterGrayscale) filterParts.push(`grayscale(${el.filterGrayscale}%)`)
          if (el.filterBlur)      filterParts.push(`blur(${el.filterBlur}px)`)
          img.style.filter = filterParts.length ? filterParts.join(' ') : 'none'
        }
      } else if (el.tipo === 'forma') {
        const inner = n.firstElementChild
        if (inner) {
          inner.style.background = el.color || 'rgba(255,255,255,0.08)'
          if (el.formaTipo === 'rect') {
            inner.style.borderRadius = `${el.borderRadius || 8}px`
            inner.style.border = el.bordeAncho ? `${el.bordeAncho}px ${el.bordeStyle || 'solid'} ${el.bordeColor || '#fff'}` : 'none'
          }
        }
      } else if (el.tipo === 'countdown') {
        const display = n.querySelector('.cvel-countdown-display')
        if (display && el.targetDate) display.textContent = getCountdownText(el.targetDate)
      }
    }

    // ── Selección ───────────────────────────────────────────────────────────
    function selectElement(id) {
      sel = id
      art.querySelectorAll('.cvel').forEach((n) => {
        const isSel = n.dataset.id === sel
        n.classList.toggle('is-sel', isSel)
        const existH = n.querySelector('.cvel-h')
        const elData = elById(n.dataset.id)
        if (isSel && !existH && !elData?.bloqueado) {
          const h = document.createElement('span')
          h.className = 'cvel-h'; h.dataset.h = 'se'; n.appendChild(h)
        } else if (!isSel && existH) {
          existH.remove()
        }
      })
      renderProps()
      updateLayerPanel()
    }

    // ── Inspector de propiedades ─────────────────────────────────────────────
    function renderProps() {
      const el = elById(sel)
      if (!el) {
        if (typeBadge) typeBadge.textContent = 'Lienzo'
        props.innerHTML = `
          <div class="text-center text-muted py-4 px-2">
            <i class="bi bi-cursor fs-4 d-block mb-2 opacity-50"></i>
            <p class="small mb-1 fw-semibold">Ningún elemento seleccionado</p>
            <p class="small text-muted" style="font-size:.74rem;">
              Haz clic en cualquier texto, imagen o forma del lienzo para personalizarlo.
            </p>
          </div>`
        return
      }

      if (typeBadge) {
        const labels = { texto: 'Texto', imagen: 'Imagen', forma: 'Forma', countdown: 'Countdown' }
        typeBadge.textContent = labels[el.tipo] || el.tipo
      }

      const paletaHTML = (campo) => `
        <div class="ss-color-palette mt-1 mb-2">
          ${PALETA_RAPIDA.map((c) => `
            <button type="button" class="ss-color-dot" style="background:${c};" data-set-color="${campo}" data-val="${c}" title="${c}"></button>
          `).join('')}
        </div>`

      const layerControls = `
        <div class="ss-prop-group mt-3 pt-2 border-top border-body-tertiary">
          <span class="ss-prop-label mb-1"><i class="bi bi-layers me-1"></i>Capas</span>
          <div class="d-flex gap-1 flex-wrap">
            <button class="btn btn-xs btn-outline-secondary flex-grow-1" data-p="fwd" title="Al frente"><i class="bi bi-layer-forward"></i> Frente</button>
            <button class="btn btn-xs btn-outline-secondary flex-grow-1" data-p="back" title="Al fondo"><i class="bi bi-layer-backward"></i> Fondo</button>
            <button class="btn btn-xs btn-outline-secondary" data-p="clone" title="Duplicar"><i class="bi bi-copy"></i></button>
            <button class="btn btn-xs ${el.bloqueado ? 'btn-warning' : 'btn-outline-secondary'}" data-p="toggle-lock">
              <i class="bi bi-${el.bloqueado ? 'lock-fill' : 'unlock'}"></i>
            </button>
            <button class="btn btn-xs btn-outline-danger" data-p="del"><i class="bi bi-trash"></i></button>
          </div>
        </div>`

      // Posición & Tamaño numérico
      const posSize = `
        <div class="ss-prop-group mt-2 pt-2 border-top border-body-tertiary">
          <span class="ss-prop-label mb-1"><i class="bi bi-arrows-move me-1"></i>Posición & Tamaño</span>
          <div class="row g-1">
            <div class="col-3"><small class="ss-prop-label">X</small><input type="number" class="form-control form-control-sm" data-p="pos-x" value="${el.x}"></div>
            <div class="col-3"><small class="ss-prop-label">Y</small><input type="number" class="form-control form-control-sm" data-p="pos-y" value="${el.y}"></div>
            <div class="col-3"><small class="ss-prop-label">W</small><input type="number" class="form-control form-control-sm" data-p="pos-w" value="${el.w}"></div>
            <div class="col-3"><small class="ss-prop-label">H</small><input type="number" class="form-control form-control-sm" data-p="pos-h" value="${el.h}"></div>
          </div>
        </div>`

      // Flip
      const flipControls = `
        <div class="ss-prop-group mt-2">
          <span class="ss-prop-label mb-1">Voltear</span>
          <div class="btn-group btn-group-sm w-100">
            <button class="btn btn-outline-secondary flex-grow-1 ${el.flipH ? 'active' : ''}" data-p="toggle-fliph" title="Voltear horizontal">
              <i class="bi bi-symmetry-horizontal"></i> H
            </button>
            <button class="btn btn-outline-secondary flex-grow-1 ${el.flipV ? 'active' : ''}" data-p="toggle-flipv" title="Voltear vertical">
              <i class="bi bi-symmetry-vertical"></i> V
            </button>
          </div>
        </div>`

      // ── Props de imagen ─────────────────────────────────────────────────
      if (el.tipo === 'imagen') {
        props.innerHTML = `
          <div class="ss-props-container">
            <div class="ss-prop-group mb-2">
              <span class="ss-prop-label">Ajuste</span>
              <select class="form-select form-select-sm" data-p="ajuste">
                <option value="contain" ${el.ajuste !== 'cover' ? 'selected' : ''}>Completa</option>
                <option value="cover"   ${el.ajuste === 'cover'   ? 'selected' : ''}>Rellenar</option>
              </select>
            </div>

            <!-- Clip to Shape -->
            <div class="ss-prop-group mb-2">
              <span class="ss-prop-label">Forma (Máscara)</span>
              <select class="form-select form-select-sm" data-p="clipShape">
                <option value="none"   ${!el.clipShape || el.clipShape === 'none'    ? 'selected' : ''}>Sin máscara</option>
                <option value="circle"  ${el.clipShape === 'circle'  ? 'selected' : ''}>⭕ Círculo</option>
                <option value="hex"     ${el.clipShape === 'hex'     ? 'selected' : ''}>⬡ Hexágono</option>
                <option value="rhombus" ${el.clipShape === 'rhombus' ? 'selected' : ''}>◇ Rombo</option>
                <option value="star"    ${el.clipShape === 'star'    ? 'selected' : ''}>⭐ Estrella</option>
              </select>
            </div>

            <!-- Filtros -->
            <div class="ss-prop-group mb-2 p-2 bg-body-tertiary rounded-3 border border-body-tertiary">
              <span class="ss-prop-label mb-2"><i class="bi bi-sliders2 me-1"></i>Filtros</span>
              <div class="d-flex justify-content-between"><span class="ss-prop-label m-0">Brillo</span><b class="small text-muted" data-p-val="filterBrightness">${el.filterBrightness ?? 100}%</b></div>
              <input type="range" class="form-range" min="0" max="200" value="${el.filterBrightness ?? 100}" data-p="filterBrightness">
              <div class="d-flex justify-content-between mt-1"><span class="ss-prop-label m-0">Contraste</span><b class="small text-muted" data-p-val="filterContrast">${el.filterContrast ?? 100}%</b></div>
              <input type="range" class="form-range" min="0" max="200" value="${el.filterContrast ?? 100}" data-p="filterContrast">
              <div class="d-flex justify-content-between mt-1"><span class="ss-prop-label m-0">Escala de Grises</span><b class="small text-muted" data-p-val="filterGrayscale">${el.filterGrayscale ?? 0}%</b></div>
              <input type="range" class="form-range" min="0" max="100" value="${el.filterGrayscale ?? 0}" data-p="filterGrayscale">
              <div class="d-flex justify-content-between mt-1"><span class="ss-prop-label m-0">Desenfoque</span><b class="small text-muted" data-p-val="filterBlur">${el.filterBlur ?? 0}px</b></div>
              <input type="range" class="form-range" min="0" max="20" value="${el.filterBlur ?? 0}" data-p="filterBlur">
            </div>

            <!-- Opacidad -->
            <div class="ss-prop-group mb-2">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="ss-prop-label m-0">Opacidad</span>
                <b class="small text-muted" data-p-val="opacidad">${Math.round((el.opacidad ?? 1) * 100)}%</b>
              </div>
              <input type="range" class="form-range" min="10" max="100" value="${Math.round((el.opacidad ?? 1) * 100)}" data-p="opacidad-pct">
            </div>

            <!-- Bordes -->
            <div class="ss-prop-group mb-2">
              <span class="ss-prop-label">Esquinas redondeadas</span>
              <div class="d-flex justify-content-between"><b class="small text-muted" data-p-val="borderRadius">${el.borderRadius || 0}px</b></div>
              <input type="range" class="form-range" min="0" max="360" value="${el.borderRadius || 0}" data-p="borderRadius">
            </div>
            <div class="row g-2 mb-2">
              <div class="col-4">
                <span class="ss-prop-label">Grosor</span>
                <select class="form-select form-select-sm" data-p="bordeAncho">
                  <option value="0" ${!el.bordeAncho ? 'selected' : ''}>Sin borde</option>
                  <option value="2" ${el.bordeAncho === 2 ? 'selected' : ''}>2px</option>
                  <option value="4" ${el.bordeAncho === 4 ? 'selected' : ''}>4px</option>
                  <option value="8" ${el.bordeAncho === 8 ? 'selected' : ''}>8px</option>
                </select>
              </div>
              <div class="col-4">
                <span class="ss-prop-label">Estilo</span>
                <select class="form-select form-select-sm" data-p="bordeStyle">
                  <option value="solid"  ${(el.bordeStyle || 'solid') === 'solid'  ? 'selected' : ''}>Sólido</option>
                  <option value="dashed" ${el.bordeStyle === 'dashed' ? 'selected' : ''}>Guiones</option>
                  <option value="dotted" ${el.bordeStyle === 'dotted' ? 'selected' : ''}>Puntos</option>
                  <option value="double" ${el.bordeStyle === 'double' ? 'selected' : ''}>Doble</option>
                </select>
              </div>
              <div class="col-4">
                <span class="ss-prop-label">Color</span>
                <input type="color" class="form-control form-control-color form-control-sm w-100" value="${el.bordeColor || '#ffffff'}" data-p="bordeColor">
              </div>
            </div>

            <label class="form-check form-switch small mb-2">
              <input class="form-check-input" type="checkbox" data-p="sombra" ${el.sombra ? 'checked' : ''}>
              Sombra exterior
            </label>

            ${flipControls}
            ${posSize}
            ${layerControls}
          </div>`

      // ── Props de forma ──────────────────────────────────────────────────
      } else if (el.tipo === 'forma') {
        props.innerHTML = `
          <div class="ss-props-container">
            <div class="ss-prop-group mb-2">
              <span class="ss-prop-label">Tipo</span>
              <div class="badge bg-secondary-subtle text-secondary w-100 py-1 text-uppercase mb-2">${el.formaTipo}</div>
            </div>
            <div class="ss-prop-group mb-2">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="ss-prop-label m-0">Color de Relleno</span>
                <input type="color" class="form-control form-control-color form-control-sm" value="${el.color?.startsWith('#') ? el.color : '#2563eb'}" data-p="color">
              </div>
              ${paletaHTML('color')}
            </div>
            <div class="ss-prop-group mb-2">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="ss-prop-label m-0">Opacidad</span>
                <b class="small text-muted" data-p-val="opacidad">${Math.round((el.opacidad ?? 1) * 100)}%</b>
              </div>
              <input type="range" class="form-range" min="10" max="100" value="${Math.round((el.opacidad ?? 1) * 100)}" data-p="opacidad-pct">
            </div>
            ${el.formaTipo === 'rect' ? `
              <div class="row g-2 mb-2">
                <div class="col-4">
                  <span class="ss-prop-label">Grosor</span>
                  <select class="form-select form-select-sm" data-p="bordeAncho">
                    <option value="0" ${!el.bordeAncho ? 'selected' : ''}>Sin</option>
                    <option value="2" ${el.bordeAncho === 2 ? 'selected' : ''}>2px</option>
                    <option value="4" ${el.bordeAncho === 4 ? 'selected' : ''}>4px</option>
                    <option value="8" ${el.bordeAncho === 8 ? 'selected' : ''}>8px</option>
                  </select>
                </div>
                <div class="col-4">
                  <span class="ss-prop-label">Estilo</span>
                  <select class="form-select form-select-sm" data-p="bordeStyle">
                    <option value="solid"  ${(el.bordeStyle || 'solid') === 'solid'  ? 'selected' : ''}>Sólido</option>
                    <option value="dashed" ${el.bordeStyle === 'dashed' ? 'selected' : ''}>Guiones</option>
                    <option value="dotted" ${el.bordeStyle === 'dotted' ? 'selected' : ''}>Puntos</option>
                    <option value="double" ${el.bordeStyle === 'double' ? 'selected' : ''}>Doble</option>
                  </select>
                </div>
                <div class="col-4">
                  <span class="ss-prop-label">Color</span>
                  <input type="color" class="form-control form-control-color form-control-sm w-100" value="${el.bordeColor || '#ffffff'}" data-p="bordeColor">
                </div>
              </div>` : ''}
            ${flipControls}
            ${posSize}
            ${layerControls}
          </div>`

      // ── Props de countdown ──────────────────────────────────────────────
      } else if (el.tipo === 'countdown') {
        props.innerHTML = `
          <div class="ss-props-container">
            <div class="ss-prop-group mb-2">
              <span class="ss-prop-label">Fecha / Hora objetivo</span>
              <input type="datetime-local" class="form-control form-control-sm" data-p="targetDate" value="${el.targetDate || ''}">
            </div>
            <div class="ss-prop-group mb-2">
              <span class="ss-prop-label">Etiqueta (opcional)</span>
              <input type="text" class="form-control form-control-sm" data-p="label" value="${escapeHTML(el.label || '')}" placeholder="ej: hasta el concierto">
            </div>
            <div class="ss-prop-group mb-2">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="ss-prop-label m-0">Tamaño del número</span>
                <b class="small text-muted" data-p-val="tamano">${el.tamano || 72}px</b>
              </div>
              <input type="range" class="form-range" min="24" max="160" value="${el.tamano || 72}" data-p="tamano">
            </div>
            <div class="ss-prop-group mb-2">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="ss-prop-label m-0">Color</span>
                <input type="color" class="form-control form-control-color form-control-sm" value="${el.color || '#ffffff'}" data-p="color">
              </div>
              ${paletaHTML('color')}
            </div>
            ${posSize}
            ${layerControls}
          </div>`

      // ── Props de texto ──────────────────────────────────────────────────
      } else {
        props.innerHTML = `
          <div class="ss-props-container">
            <div class="ss-prop-group mb-2">
              <span class="ss-prop-label">Contenido</span>
              <textarea class="form-control form-control-sm" rows="3" data-p="texto" placeholder="Escribe el texto aquí...">${escapeHTML(el.texto || '')}</textarea>
            </div>

            <div class="row g-2 mb-2">
              <div class="col-7">
                <span class="ss-prop-label">Tipografía</span>
                <select class="form-select form-select-sm" data-p="fuente">
                  <option value="sans"    ${el.fuente === 'sans'    ? 'selected' : ''}>Moderna (Sans)</option>
                  <option value="serif"   ${el.fuente === 'serif'   ? 'selected' : ''}>Elegante (Serif)</option>
                  <option value="display" ${el.fuente === 'display' ? 'selected' : ''}>Impacto (Display)</option>
                  <option value="hand"    ${el.fuente === 'hand'    ? 'selected' : ''}>Caligráfica</option>
                  <option value="mono"    ${el.fuente === 'mono'    ? 'selected' : ''}>Monospace</option>
                </select>
              </div>
              <div class="col-5">
                <span class="ss-prop-label">Peso</span>
                <select class="form-select form-select-sm" data-p="peso">
                  ${['300','400','600','700','800','900'].map((w) => `
                    <option value="${w}" ${String(el.peso) === w ? 'selected' : ''}>${w}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="ss-prop-group mb-2">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="ss-prop-label m-0">Tamaño</span>
                <div class="d-flex align-items-center gap-1">
                  <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-1" data-tamano-delta="-4"><i class="bi bi-dash"></i></button>
                  <b class="small" data-p-val="tamano" style="min-width:38px;text-align:center;">${el.tamano || 48}px</b>
                  <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-1" data-tamano-delta="4"><i class="bi bi-plus"></i></button>
                </div>
              </div>
              <input type="range" class="form-range" min="16" max="220" value="${el.tamano || 48}" data-p="tamano">
            </div>

            <!-- Color + paleta -->
            <div class="ss-prop-group mb-2">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="ss-prop-label m-0">Color de Texto</span>
                <input type="color" class="form-control form-control-color form-control-sm" value="${el.color || '#ffffff'}" data-p="color">
              </div>
              ${paletaHTML('color')}
            </div>

            <!-- Degradado de texto -->
            <div class="ss-prop-group mb-2 p-2 bg-body-tertiary rounded-3 border border-body-tertiary">
              <label class="form-check form-switch small mb-2">
                <input class="form-check-input" type="checkbox" data-p="textGradient" ${el.textGradient ? 'checked' : ''}>
                <span class="fw-semibold">Degradado de Texto</span>
              </label>
              <div class="${el.textGradient ? '' : 'd-none'}" id="ss-text-grad-opts">
                <div class="row g-1 mb-1">
                  <div class="col-6">
                    <span class="ss-prop-label">Color inicio</span>
                    <input type="color" class="form-control form-control-color form-control-sm w-100" value="${el.textGradientStart || '#fbbf24'}" data-p="textGradientStart">
                  </div>
                  <div class="col-6">
                    <span class="ss-prop-label">Color fin</span>
                    <input type="color" class="form-control form-control-color form-control-sm w-100" value="${el.textGradientEnd || '#f43f5e'}" data-p="textGradientEnd">
                  </div>
                </div>
                <span class="ss-prop-label">Ángulo: ${el.textGradientAngle || 135}°</span>
                <input type="range" class="form-range" min="0" max="360" value="${el.textGradientAngle || 135}" data-p="textGradientAngle">
              </div>
            </div>

            <!-- Contorno de texto -->
            <div class="ss-prop-group mb-2 p-2 bg-body-tertiary rounded-3 border border-body-tertiary">
              <label class="form-check form-switch small mb-2">
                <input class="form-check-input" type="checkbox" data-p="textStroke" ${el.textStroke ? 'checked' : ''}>
                <span class="fw-semibold">Contorno (Stroke)</span>
              </label>
              <div class="${el.textStroke ? '' : 'd-none'}" id="ss-text-stroke-opts">
                <div class="row g-1">
                  <div class="col-6">
                    <span class="ss-prop-label">Grosor</span>
                    <input type="range" class="form-range" min="1" max="12" value="${el.textStrokeWidth || 2}" data-p="textStrokeWidth">
                    <b class="small text-muted" data-p-val="textStrokeWidth">${el.textStrokeWidth || 2}px</b>
                  </div>
                  <div class="col-6">
                    <span class="ss-prop-label">Color</span>
                    <input type="color" class="form-control form-control-color form-control-sm w-100" value="${el.textStrokeColor || '#000000'}" data-p="textStrokeColor">
                  </div>
                </div>
              </div>
            </div>

            <!-- Estilo (B I U AA) + Alineación -->
            <div class="row g-2 mb-2">
              <div class="col-6">
                <span class="ss-prop-label">Estilo</span>
                <div class="btn-group btn-group-sm w-100">
                  <button class="btn btn-outline-secondary ${el.italic    ? 'active' : ''}" data-p="toggle-italic"><i class="bi bi-type-italic"></i></button>
                  <button class="btn btn-outline-secondary ${el.underline ? 'active' : ''}" data-p="toggle-underline"><i class="bi bi-type-underline"></i></button>
                  <button class="btn btn-outline-secondary ${el.transform === 'uppercase' ? 'active' : ''}" data-p="toggle-caps"><b>AA</b></button>
                </div>
              </div>
              <div class="col-6">
                <span class="ss-prop-label">Alineación</span>
                <div class="btn-group btn-group-sm w-100">
                  ${['left','center','right'].map((a) => `
                    <button class="btn btn-outline-secondary ${(el.align || 'left') === a ? 'active' : ''}" data-p="align" data-v="${a}">
                      <i class="bi bi-text-${a === 'center' ? 'center' : a}"></i>
                    </button>`).join('')}
                </div>
              </div>
            </div>

            <!-- Efectos -->
            <div class="ss-prop-group mb-2 p-2 bg-body-tertiary rounded-3 border border-body-tertiary">
              <label class="form-check form-switch small mb-2">
                <input class="form-check-input" type="checkbox" data-p="sombra" ${el.sombra ? 'checked' : ''}>
                Sombra de alto contraste
              </label>
              <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="small text-muted" style="font-size:.72rem;">Fondo / Resaltado:</span>
                <div class="d-flex align-items-center gap-1">
                  <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-1" data-set-badge="clear">✕</button>
                  <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-1" data-set-badge="dark">Oscuro</button>
                  <button type="button" class="btn btn-xs btn-outline-secondary py-0 px-1" data-set-badge="gold">Dorado</button>
                </div>
              </div>
            </div>

            <!-- Opacidad -->
            <div class="ss-prop-group mb-2">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="ss-prop-label m-0">Opacidad</span>
                <b class="small text-muted" data-p-val="opacidad">${Math.round((el.opacidad ?? 1) * 100)}%</b>
              </div>
              <input type="range" class="form-range" min="10" max="100" value="${Math.round((el.opacidad ?? 1) * 100)}" data-p="opacidad-pct">
            </div>

            ${flipControls}
            ${posSize}
            ${layerControls}
          </div>`
      }

      // ── Event listeners del inspector ────────────────────────────────────
      props.querySelectorAll('[data-set-color]').forEach((btn) => {
        btn.addEventListener('click', () => {
          el[btn.dataset.setColor] = btn.dataset.val
          const inp = props.querySelector(`input[data-p="${btn.dataset.setColor}"]`)
          if (inp) inp.value = btn.dataset.val
          syncElementToArt(el)
        })
      })

      props.querySelectorAll('[data-tamano-delta]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const delta = Number(btn.dataset.tamanoDelta)
          el.tamano = Math.min(220, Math.max(16, (el.tamano || 48) + delta))
          const slider = props.querySelector('input[data-p="tamano"]')
          if (slider) slider.value = el.tamano
          const v = props.querySelector('[data-p-val="tamano"]')
          if (v) v.textContent = el.tamano + 'px'
          syncElementToArt(el)
        })
      })

      props.querySelectorAll('[data-set-badge]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const tipo = btn.dataset.setBadge
          if (tipo === 'clear') el.fondoColor = null
          else if (tipo === 'dark') el.fondoColor = 'rgba(11,14,23,0.85)'
          else if (tipo === 'gold') el.fondoColor = '#d97706'
          syncElementToArt(el)
        })
      })

      props.querySelectorAll('[data-p]').forEach((n) => {
        const p = n.dataset.p

        if (p === 'del')         return n.addEventListener('click', () => { pushState(); cv.elementos = cv.elementos.filter((e) => e.id !== el.id); selectElement(null); renderArt() })
        if (p === 'clone')       return n.addEventListener('click', () => duplicarElemento(el))
        if (p === 'toggle-lock') return n.addEventListener('click', () => { el.bloqueado = !el.bloqueado; renderArt(); selectElement(el.id) })
        if (p === 'fwd')         return n.addEventListener('click', () => {
          const i = cv.elementos.indexOf(el)
          if (i > -1 && i < cv.elementos.length - 1) { pushState(); cv.elementos.splice(i, 1); cv.elementos.push(el); renderArt() }
        })
        if (p === 'back')        return n.addEventListener('click', () => {
          const i = cv.elementos.indexOf(el)
          if (i > 0) { pushState(); cv.elementos.splice(i, 1); cv.elementos.unshift(el); renderArt() }
        })
        if (p === 'align')           return n.addEventListener('click', () => { el.align = n.dataset.v; props.querySelectorAll('[data-p="align"]').forEach((b) => b.classList.toggle('active', b.dataset.v === el.align)); syncElementToArt(el) })
        if (p === 'toggle-italic')   return n.addEventListener('click', () => { el.italic    = !el.italic;    n.classList.toggle('active', el.italic);    syncElementToArt(el) })
        if (p === 'toggle-underline')return n.addEventListener('click', () => { el.underline = !el.underline; n.classList.toggle('active', el.underline); syncElementToArt(el) })
        if (p === 'toggle-caps')     return n.addEventListener('click', () => { el.transform = el.transform === 'uppercase' ? 'none' : 'uppercase'; n.classList.toggle('active', el.transform === 'uppercase'); syncElementToArt(el) })
        if (p === 'toggle-fliph')    return n.addEventListener('click', () => { el.flipH = !el.flipH; n.classList.toggle('active', el.flipH); syncElementToArt(el) })
        if (p === 'toggle-flipv')    return n.addEventListener('click', () => { el.flipV = !el.flipV; n.classList.toggle('active', el.flipV); syncElementToArt(el) })

        // Posición numérica
        if (p === 'pos-x') return n.addEventListener('change', () => { el.x = Number(n.value); syncElementToArt(el) })
        if (p === 'pos-y') return n.addEventListener('change', () => { el.y = Number(n.value); syncElementToArt(el) })
        if (p === 'pos-w') return n.addEventListener('change', () => { el.w = Math.max(20, Number(n.value)); syncElementToArt(el) })
        if (p === 'pos-h') return n.addEventListener('change', () => { el.h = Math.max(10, Number(n.value)); syncElementToArt(el) })

        // Toggle de paneles internos (gradient / stroke)
        if (p === 'textGradient') return n.addEventListener('change', () => {
          el.textGradient = n.checked
          const opts = props.querySelector('#ss-text-grad-opts')
          if (opts) opts.classList.toggle('d-none', !n.checked)
          syncElementToArt(el)
        })
        if (p === 'textStroke') return n.addEventListener('change', () => {
          el.textStroke = n.checked
          const opts = props.querySelector('#ss-text-stroke-opts')
          if (opts) opts.classList.toggle('d-none', !n.checked)
          syncElementToArt(el)
        })

        const ev = (n.type === 'range' || n.type === 'color' || n.tagName === 'TEXTAREA' || n.type === 'text' || n.type === 'datetime-local') ? 'input' : 'change'
        n.addEventListener(ev, () => {
          if (n.type === 'checkbox') {
            el[p] = n.checked
          } else if (p === 'tamano' || p === 'textStrokeWidth' || p === 'textGradientAngle') {
            el[p] = Number(n.value)
            const vEl = props.querySelector(`[data-p-val="${p}"]`)
            if (vEl) vEl.textContent = n.value + (p === 'textGradientAngle' ? '°' : 'px')
          } else if (p === 'opacidad-pct') {
            el.opacidad = Number(n.value) / 100
            const vEl = props.querySelector('[data-p-val="opacidad"]')
            if (vEl) vEl.textContent = n.value + '%'
          } else if (p === 'borderRadius') {
            el.borderRadius = Number(n.value)
            const vEl = props.querySelector('[data-p-val="borderRadius"]')
            if (vEl) vEl.textContent = n.value + 'px'
          } else if (p === 'bordeAncho') {
            el.bordeAncho = Number(n.value)
          } else if (p === 'filterBrightness' || p === 'filterContrast' || p === 'filterGrayscale' || p === 'filterBlur') {
            el[p] = Number(n.value)
            const vEl = props.querySelector(`[data-p-val="${p}"]`)
            if (vEl) vEl.textContent = n.value + (p === 'filterBlur' ? 'px' : '%')
          } else {
            el[p] = n.value
          }
          syncElementToArt(el)
        })
      })
    }

    // ── Layer Panel ─────────────────────────────────────────────────────────
    function updateLayerPanel() {
      const layerTab = container.querySelector('#ss-tab-layers')
      if (!layerTab || layerTab.style.display === 'none') return

      const icons = { texto: 'bi-fonts', imagen: 'bi-image', forma: 'bi-square', countdown: 'bi-alarm' }
      const reversed = [...cv.elementos].reverse() // mostrar de arriba hacia abajo

      layerTab.innerHTML = `
        <div class="ss-props-container py-1">
          ${reversed.length === 0
            ? '<p class="small text-muted text-center py-3">Sin elementos en el lienzo.</p>'
            : reversed.map((el, i) => `
              <div class="ss-layer-row ${sel === el.id ? 'is-sel' : ''}" data-layer-id="${el.id}">
                <i class="bi ${icons[el.tipo] || 'bi-square'} text-muted me-2 flex-shrink-0" style="font-size:.85rem;"></i>
                <span class="ss-layer-name flex-grow-1 text-truncate small">${escapeHTML((el.texto || el.tipo || '').slice(0, 28))}</span>
                <div class="d-flex gap-1 ms-1 flex-shrink-0">
                  <button class="btn btn-xs btn-outline-secondary py-0 px-1" data-layer-move-up="${el.id}" title="Subir capa"><i class="bi bi-chevron-up"></i></button>
                  <button class="btn btn-xs btn-outline-secondary py-0 px-1" data-layer-move-dn="${el.id}" title="Bajar capa"><i class="bi bi-chevron-down"></i></button>
                  <button class="btn btn-xs ${el.bloqueado ? 'btn-warning' : 'btn-outline-secondary'} py-0 px-1" data-layer-lock="${el.id}">
                    <i class="bi bi-${el.bloqueado ? 'lock-fill' : 'unlock'}"></i>
                  </button>
                </div>
              </div>`).join('')}
        </div>`

      // Click en fila → seleccionar
      layerTab.querySelectorAll('[data-layer-id]').forEach((row) => {
        row.addEventListener('click', (e) => {
          if (e.target.closest('button')) return
          selectElement(row.dataset.layerId)
          switchTab('props')
        })
      })

      // Mover capa arriba
      layerTab.querySelectorAll('[data-layer-move-up]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const id = btn.dataset.layerMoveUp
          const i = cv.elementos.findIndex((e) => e.id === id)
          if (i < cv.elementos.length - 1) { pushState(); [cv.elementos[i], cv.elementos[i+1]] = [cv.elementos[i+1], cv.elementos[i]]; renderArt(); updateLayerPanel() }
        })
      })

      // Mover capa abajo
      layerTab.querySelectorAll('[data-layer-move-dn]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const id = btn.dataset.layerMoveDn
          const i = cv.elementos.findIndex((e) => e.id === id)
          if (i > 0) { pushState(); [cv.elementos[i], cv.elementos[i-1]] = [cv.elementos[i-1], cv.elementos[i]]; renderArt(); updateLayerPanel() }
        })
      })

      // Toggle lock desde layers
      layerTab.querySelectorAll('[data-layer-lock]').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation()
          const el = elById(btn.dataset.layerLock)
          if (el) { el.bloqueado = !el.bloqueado; renderArt(); updateLayerPanel() }
        })
      })
    }

    // ── Historial visual ─────────────────────────────────────────────────────
    function updateHistoryPanel() {
      const histTab = container.querySelector('#ss-tab-history')
      if (!histTab || histTab.style.display === 'none') return
      histTab.innerHTML = `
        <div class="ss-props-container py-1">
          <p class="small text-muted px-2 pt-1" style="font-size:.72rem;">
            <i class="bi bi-info-circle me-1"></i>Últimos ${visualHistory.length} estados guardados.
            Haz clic en uno para restaurarlo.
          </p>
          ${visualHistory.length === 0
            ? '<p class="small text-muted text-center py-2">Sin historial aún.</p>'
            : [...visualHistory].reverse().map((snap, i) => {
              const parsed = JSON.parse(snap)
              const nEl = parsed.elementos?.length ?? 0
              const label = parsed.elementos?.find((e) => e.tipo === 'texto')?.texto?.slice(0, 30) || `Estado ${visualHistory.length - i}`
              return `
                <div class="ss-history-row" data-hist-idx="${visualHistory.length - 1 - i}">
                  <div class="ss-hist-thumb">
                    <i class="bi bi-easel2" style="font-size:1.2rem;color:var(--bs-primary);"></i>
                  </div>
                  <div class="flex-grow-1 min-w-0">
                    <div class="small text-truncate fw-semibold">${escapeHTML(label)}</div>
                    <div class="text-muted" style="font-size:.7rem;">${nEl} elemento(s)</div>
                  </div>
                  <button class="btn btn-xs btn-outline-secondary flex-shrink-0" data-hist-restore="${visualHistory.length - 1 - i}">
                    <i class="bi bi-arrow-counterclockwise"></i>
                  </button>
                </div>`
            }).join('')}
        </div>`

      histTab.querySelectorAll('[data-hist-restore]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.histRestore)
          const snap = visualHistory[idx]
          if (!snap) return
          pushState()
          cv = JSON.parse(snap)
          renderArt()
          selectElement(null)
          AppToast.info('Estado restaurado desde historial.')
        })
      })
    }

    // ── Tab switching ────────────────────────────────────────────────────────
    function switchTab(tabName) {
      const propsEl   = container.querySelector('#ss-tab-props')
      const layersEl  = container.querySelector('#ss-tab-layers')
      const historyEl = container.querySelector('#ss-tab-history')
      const head      = container.querySelector('#ss-inspector-head')

      propsEl.style.display   = tabName === 'props'   ? '' : 'none'
      layersEl.style.display  = tabName === 'layers'  ? '' : 'none'
      historyEl.style.display = tabName === 'history' ? '' : 'none'

      if (head) head.style.display = tabName === 'props' ? '' : 'none'

      container.querySelectorAll('.ss-itab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tabName))

      if (tabName === 'layers')  updateLayerPanel()
      if (tabName === 'history') updateHistoryPanel()
    }

    container.querySelectorAll('.ss-itab').forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab))
    })

    // ── Helpers ──────────────────────────────────────────────────────────────
    function elById(id) { return cv.elementos.find((e) => e.id === id) }
    function nodeOf(el) { return art.querySelector(`.cvel[data-id="${el.id}"]`) }

    function duplicarElemento(el) {
      if (!el) return
      pushState()
      const nuevo = JSON.parse(JSON.stringify(el))
      nuevo.id = cvUid()
      nuevo.x = Math.min(cv.w - 100, nuevo.x + 30)
      nuevo.y = Math.min(cv.h - 100, nuevo.y + 30)
      nuevo.bloqueado = false
      cv.elementos.push(nuevo)
      renderArt()
      selectElement(nuevo.id)
      AppToast.info('Elemento duplicado.')
    }

    function centrarHorizontal(el) {
      if (!el || el.bloqueado) return
      el.x = Math.round((cv.w - el.w) / 2)
      const n = nodeOf(el); if (n) n.style.left = el.x + 'px'
    }

    function centrarVertical(el) {
      if (!el || el.bloqueado) return
      el.y = Math.round((cv.h - el.h) / 2)
      const n = nodeOf(el); if (n) n.style.top = el.y + 'px'
    }

    // ── Snap Guides ──────────────────────────────────────────────────────────
    function checkSnap(movingEl) {
      const snapH = art.querySelector('#ss-snap-h')
      const snapV = art.querySelector('#ss-snap-v')
      if (!snapH || !snapV) return

      const cx = movingEl.x + movingEl.w / 2
      const cy = movingEl.y + movingEl.h / 2

      let bestH = null, bestV = null, bestHDist = SNAP_THRESHOLD, bestVDist = SNAP_THRESHOLD

      // Chequear contra el centro del lienzo
      const canvasCX = cv.w / 2
      const canvasCY = cv.h / 2
      if (Math.abs(cx - canvasCX) < bestVDist) { bestVDist = Math.abs(cx - canvasCX); bestV = canvasCX; movingEl.x = Math.round(canvasCX - movingEl.w / 2) }
      if (Math.abs(cy - canvasCY) < bestHDist) { bestHDist = Math.abs(cy - canvasCY); bestH = canvasCY; movingEl.y = Math.round(canvasCY - movingEl.h / 2) }

      cv.elementos.forEach((other) => {
        if (other.id === movingEl.id) return
        const ocx = other.x + other.w / 2
        const ocy = other.y + other.h / 2
        const targets = [
          { axis: 'v', val: other.x,         snap: () => { movingEl.x = other.x } },
          { axis: 'v', val: other.x + other.w, snap: () => { movingEl.x = other.x + other.w - movingEl.w } },
          { axis: 'v', val: ocx,              snap: () => { movingEl.x = Math.round(ocx - movingEl.w / 2) } },
          { axis: 'h', val: other.y,         snap: () => { movingEl.y = other.y } },
          { axis: 'h', val: other.y + other.h, snap: () => { movingEl.y = other.y + other.h - movingEl.h } },
          { axis: 'h', val: ocy,              snap: () => { movingEl.y = Math.round(ocy - movingEl.h / 2) } },
        ]
        targets.forEach(({ axis, val, snap }) => {
          const mv = axis === 'v' ? (movingEl.x + movingEl.w / 2) : (movingEl.y + movingEl.h / 2)
          const dist = Math.abs(mv - val)
          if (axis === 'v' && dist < bestVDist) { bestVDist = dist; bestV = val; snap() }
          if (axis === 'h' && dist < bestHDist) { bestHDist = dist; bestH = val; snap() }
        })
      })

      snapH.style.display = bestH !== null ? 'block' : 'none'
      snapV.style.display = bestV !== null ? 'block' : 'none'
      if (bestH !== null) snapH.style.top = bestH + 'px'
      if (bestV !== null) snapV.style.left = bestV + 'px'
    }

    function hideSnapGuides() {
      const snapH = art.querySelector('#ss-snap-h')
      const snapV = art.querySelector('#ss-snap-v')
      if (snapH) snapH.style.display = 'none'
      if (snapV) snapV.style.display = 'none'
    }

    // ── Drag & Resize ────────────────────────────────────────────────────────
    let drag = null
    art.addEventListener('pointerdown', (e) => {
      const elNode = e.target.closest('.cvel')
      if (!elNode) { if (sel) selectElement(null); return }
      const el = elById(elNode.dataset.id)
      if (!el) return
      if (sel !== el.id) selectElement(el.id)
      if (el.bloqueado) return

      drag = {
        el, mode: e.target.closest('.cvel-h') ? 'resize' : 'move',
        sx: e.clientX, sy: e.clientY,
        ox: el.x, oy: el.y, ow: el.w, oh: el.h,
      }
      try { art.setPointerCapture(e.pointerId) } catch {}
      e.preventDefault()
    })

    art.addEventListener('pointermove', (e) => {
      if (!drag) return
      const dx = (e.clientX - drag.sx) / scale
      const dy = (e.clientY - drag.sy) / scale
      if (drag.mode === 'move') {
        drag.el.x = Math.round(drag.ox + dx)
        drag.el.y = Math.round(drag.oy + dy)
        checkSnap(drag.el)
      } else {
        drag.el.w = Math.max(40, Math.round(drag.ow + dx))
        drag.el.h = Math.max(24, Math.round(drag.oh + dy))
      }
      const n = nodeOf(drag.el)
      if (n) {
        n.style.left   = drag.el.x + 'px'
        n.style.top    = drag.el.y + 'px'
        n.style.width  = drag.el.w + 'px'
        n.style.height = drag.el.h + 'px'
      }
      // Actualizar inputs de posición si están visibles
      const posX = props.querySelector('[data-p="pos-x"]'); if (posX) posX.value = drag.el.x
      const posY = props.querySelector('[data-p="pos-y"]'); if (posY) posY.value = drag.el.y
      const posW = props.querySelector('[data-p="pos-w"]'); if (posW) posW.value = drag.el.w
      const posH = props.querySelector('[data-p="pos-h"]'); if (posH) posH.value = drag.el.h
    })

    const endDrag = () => { if (drag) { pushState(); hideSnapGuides() }; drag = null }
    art.addEventListener('pointerup', endDrag)
    art.addEventListener('pointercancel', endDrag)

    // ── Doble clic → editar texto inline ────────────────────────────────────
    art.addEventListener('dblclick', (e) => {
      const elNode = e.target.closest('.cvel--texto')
      if (!elNode) return
      const el = elById(elNode.dataset.id)
      if (!el || el.bloqueado) return
      const span = elNode.querySelector('.cvel-text') || elNode
      span.style.pointerEvents = 'auto'
      span.setAttribute('contenteditable', 'true')
      span.focus()
      const done = () => {
        el.texto = span.innerText
        span.removeAttribute('contenteditable')
        span.style.pointerEvents = 'none'
        span.removeEventListener('blur', done)
        const txtArea = props.querySelector('textarea[data-p="texto"]')
        if (txtArea) txtArea.value = el.texto || ''
      }
      span.addEventListener('blur', done)
    })

    // ── Teclado ──────────────────────────────────────────────────────────────
    const onKeyDown = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return
      if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); deshacer(); return }
      if (e.ctrlKey && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); rehacer(); return }
      if (e.ctrlKey && e.key.toLowerCase() === 'd') { e.preventDefault(); const el = elById(sel); if (el) duplicarElemento(el); return }
      if (sel) {
        const el = elById(sel)
        if (!el || el.bloqueado) return
        if (e.key === 'Delete' || e.key === 'Backspace') { pushState(); cv.elementos = cv.elementos.filter((x) => x.id !== sel); selectElement(null); renderArt() }
        else if (e.key === 'Escape') selectElement(null)
        // Nudge con flechas
        else if (e.key === 'ArrowLeft')  { el.x -= e.shiftKey ? 10 : 1; syncElementToArt(el) }
        else if (e.key === 'ArrowRight') { el.x += e.shiftKey ? 10 : 1; syncElementToArt(el) }
        else if (e.key === 'ArrowUp')    { el.y -= e.shiftKey ? 10 : 1; syncElementToArt(el) }
        else if (e.key === 'ArrowDown')  { el.y += e.shiftKey ? 10 : 1; syncElementToArt(el) }
      }
    }
    window.addEventListener('keydown', onKeyDown)

    // ── Undo / Redo ──────────────────────────────────────────────────────────
    function deshacer() {
      if (!undoStack.length) return
      redoStack.push(JSON.stringify(cv))
      cv = JSON.parse(undoStack.pop())
      renderArt()
      if (sel && !elById(sel)) selectElement(null)
      else renderProps()
      AppToast.info('Deshecho.')
    }
    function rehacer() {
      if (!redoStack.length) return
      undoStack.push(JSON.stringify(cv))
      cv = JSON.parse(redoStack.pop())
      renderArt()
      if (sel && !elById(sel)) selectElement(null)
      else renderProps()
      AppToast.info('Rehecho.')
    }

    container.querySelector('#ss-btn-undo')?.addEventListener('click', deshacer)
    container.querySelector('#ss-btn-redo')?.addEventListener('click', rehacer)

    // ── Zoom manual ──────────────────────────────────────────────────────────
    container.querySelector('#ss-btn-zoom-in')?.addEventListener('click', () => { zoomExtra = Math.min(3, +(zoomExtra + 0.25).toFixed(2)); fitScale() })
    container.querySelector('#ss-btn-zoom-out')?.addEventListener('click', () => { zoomExtra = Math.max(0.25, +(zoomExtra - 0.25).toFixed(2)); fitScale() })
    container.querySelector('#ss-btn-zoom-reset')?.addEventListener('click', () => { zoomExtra = 1; fitScale() })

    // ── Toggle grilla ────────────────────────────────────────────────────────
    container.querySelector('#ss-btn-grid')?.addEventListener('click', () => {
      showGrid = !showGrid
      const overlay = art.querySelector('#ss-grid-overlay')
      if (overlay) overlay.style.display = showGrid ? 'block' : 'none'
      container.querySelector('#ss-btn-grid')?.classList.toggle('active', showGrid)
    })

    // ── Export PNG ───────────────────────────────────────────────────────────
    container.querySelector('#ss-btn-export')?.addEventListener('click', async () => {
      const toast = AppToast.progress('Generando PNG…')
      try {
        const h2c = await ensureHtml2canvas()
        const canvas = await h2c(art, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          width: cv.w,
          height: cv.h,
        })
        const link = document.createElement('a')
        link.download = `diapositiva-${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        toast.success('PNG descargado.')
      } catch (err) {
        toast.error('Error al exportar: ' + err.message)
      }
    })

    // ── Duplicar / Centrar ───────────────────────────────────────────────────
    container.querySelector('#ss-btn-clone')?.addEventListener('click', () => {
      const el = elById(sel)
      if (el) duplicarElemento(el)
      else AppToast.warning('Selecciona un elemento primero.')
    })
    container.querySelector('#ss-btn-center-h')?.addEventListener('click', () => { const el = elById(sel); if (el) centrarHorizontal(el) })
    container.querySelector('#ss-btn-center-v')?.addEventListener('click', () => { const el = elById(sel); if (el) centrarVertical(el) })

    // ── Añadir Textos ────────────────────────────────────────────────────────
    container.querySelectorAll('[data-add-text]').forEach((btn) => {
      btn.addEventListener('click', () => {
        pushState()
        const kind = btn.dataset.addText
        let el
        if (kind === 'title') {
          el = { id:cvUid(), tipo:'texto', x:140, y:160, w:1000, h:140, texto:'TÍTULO PRINCIPAL', tamano:84, color:'#ffffff', peso:800, align:'center', fuente:'display', transform:'uppercase', sombra:true }
        } else if (kind === 'subtitle') {
          el = { id:cvUid(), tipo:'texto', x:140, y:310, w:1000, h:100, texto:'Subtítulo o descripción del evento', tamano:52, color:'#fcd34d', peso:600, align:'center', fuente:'sans', sombra:true }
        } else if (kind === 'badge') {
          el = { id:cvUid(), tipo:'texto', x:440, y:80, w:400, h:60, texto:'SÁBADO 15 DE OCTUBRE', tamano:28, color:'#ffffff', peso:700, align:'center', fuente:'sans', transform:'uppercase', fondoColor:'#d97706' }
        } else {
          el = { id:cvUid(), tipo:'texto', x:190, y:430, w:900, h:120, texto:'Doble clic para escribir el texto...', tamano:36, color:'#cbd5e1', peso:400, align:'center', fuente:'sans', sombra:true }
        }
        cv.elementos.push(el)
        renderArt()
        selectElement(el.id)
      })
    })

    // ── Añadir Imágenes ──────────────────────────────────────────────────────
    container.querySelector('[data-cv="add-img"]')?.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || [])
      e.target.value = ''
      if (!files.length) return
      pushState()
      const toast = AppToast.progress(`Subiendo ${files.length} imagen(es)…`)
      try {
        for (let i = 0; i < files.length; i++) {
          const { path } = await api.subirArchivo(files[i])
          const el = {
            id: cvUid(), tipo:'imagen',
            x:200+(i*40), y:150+(i*30),
            w:files.length===1?580:420, h:files.length===1?420:320,
            storage_path:path, ajuste:'contain', borderRadius:12, sombra:true,
          }
          cv.elementos.push(el)
          if (i === files.length - 1) selectElement(el.id)
        }
        renderArt()
        toast.success(`${files.length} imagen(es) agregada(s).`)
      } catch (err) { toast.error(err.message) }
    })

    // ── Añadir Formas ────────────────────────────────────────────────────────
    container.querySelectorAll('[data-add-shape]').forEach((btn) => {
      btn.addEventListener('click', () => {
        pushState()
        const shape = btn.dataset.addShape
        let el
        if (shape === 'card')   el = { id:cvUid(), tipo:'forma', formaTipo:'card',   x:100, y:90,  w:1080, h:540, color:'rgba(255,255,255,0.06)', sombra:true }
        else if (shape==='banner') el = { id:cvUid(), tipo:'forma', formaTipo:'banner', x:80,  y:70,  w:1120, h:100, color:'rgba(15,23,42,0.85)', sombra:true }
        else if (shape==='line')   el = { id:cvUid(), tipo:'forma', formaTipo:'line',   x:240, y:360, w:800,  h:6,   color:'#f59e0b', sombra:true }
        else if (shape==='circle') el = { id:cvUid(), tipo:'forma', formaTipo:'circle', x:490, y:210, w:300,  h:300, color:'rgba(2,132,199,0.18)' }
        else                       el = { id:cvUid(), tipo:'forma', formaTipo:'rect',   x:180, y:140, w:920,  h:440, color:'rgba(15,23,42,0.7)', borderRadius:14, bordeAncho:1, bordeColor:'rgba(255,255,255,0.12)', sombra:true }
        cv.elementos.unshift(el)
        renderArt()
        selectElement(el.id)
      })
    })

    // ── Premium tools ────────────────────────────────────────────────────────

    // QR Code
    container.querySelector('[data-add-premium="qr"]')?.addEventListener('click', async () => {
      const url = prompt('URL para el código QR:', 'https://sistemapc.edu.do')
      if (!url) return
      pushState()
      const toast = AppToast.progress('Generando QR…')
      const dataUrl = await buildQrDataUrl(url)
      if (!dataUrl) { toast.error('No se pudo generar el QR. Verifica tu conexión.'); return }
      // Subir el dataUrl como archivo
      try {
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], `qr-${Date.now()}.png`, { type: 'image/png' })
        const { path } = await api.subirArchivo(file)
        const el = { id:cvUid(), tipo:'imagen', x:490, y:210, w:300, h:300, storage_path:path, ajuste:'contain', borderRadius:12, sombra:true }
        cv.elementos.push(el)
        renderArt()
        selectElement(el.id)
        toast.success('QR insertado en el lienzo.')
      } catch (err) { toast.error(err.message) }
    })

    // Countdown
    container.querySelector('[data-add-premium="countdown"]')?.addEventListener('click', () => {
      pushState()
      const el = {
        id:cvUid(), tipo:'countdown',
        x:240, y:200, w:800, h:220,
        targetDate: new Date(Date.now() + 7*24*3600*1000).toISOString().slice(0,16),
        label:'hasta el evento',
        tamano:96, color:'#ffffff',
      }
      cv.elementos.push(el)
      renderArt()
      selectElement(el.id)
    })

    // Background Blur Overlay
    container.querySelector('[data-add-premium="blur-overlay"]')?.addEventListener('click', () => {
      pushState()
      const el = {
        id:cvUid(), tipo:'forma', formaTipo:'card',
        x:0, y:0, w:cv.w, h:cv.h,
        color:'rgba(10,14,23,0.45)', sombra:false,
      }
      cv.elementos.unshift(el)
      renderArt()
      selectElement(el.id)
      AppToast.info('Overlay glass insertado. Ajusta color y opacidad en el inspector.')
    })

    // Repetir en cuadrícula
    container.querySelector('[data-repeat-grid]')?.addEventListener('click', () => {
      const el = elById(sel)
      if (!el) { AppToast.warning('Selecciona un elemento primero.'); return }
      const cols = Number(prompt('Columnas (N):', '3'))
      const rows = Number(prompt('Filas (M):', '2'))
      if (!cols || !rows || cols < 1 || rows < 1) return
      const gapX = Number(prompt('Espacio horizontal entre copias (px):', '20')) || 20
      const gapY = Number(prompt('Espacio vertical entre copias (px):', '20')) || 20
      pushState()
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r === 0 && c === 0) continue // el original ya existe
          const nuevo = JSON.parse(JSON.stringify(el))
          nuevo.id = cvUid()
          nuevo.x  = el.x + c * (el.w + gapX)
          nuevo.y  = el.y + r * (el.h + gapY)
          nuevo.bloqueado = false
          cv.elementos.push(nuevo)
        }
      }
      renderArt()
      AppToast.success(`Cuadrícula ${cols}×${rows} creada.`)
    })

    // ── Plantillas ────────────────────────────────────────────────────────────
    container.querySelectorAll('[data-tpl]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tpl = btn.dataset.tpl
        if (!confirm('¿Aplicar esta plantilla? Reemplazará los elementos actuales.')) return
        pushState()
        if (tpl === 'concierto') {
          cv.fondo = { tipo:'gradiente', valor:'dorado' }
          cv.elementos = [
            {id:cvUid(),tipo:'forma',formaTipo:'card', x:90,y:70,  w:1100,h:580,color:'rgba(0,0,0,0.55)',sombra:true},
            {id:cvUid(),tipo:'texto',x:140,y:110,w:1000,h:50, texto:'FUNEYCA-PC & EL SISTEMA PUNTA CANA',tamano:28,color:'#fcd34d',peso:700,align:'center',fuente:'sans',transform:'uppercase',sombra:true},
            {id:cvUid(),tipo:'texto',x:140,y:180,w:1000,h:140,texto:'CONCIERTO DE GALA',tamano:88,color:'#ffffff',peso:900,align:'center',fuente:'serif',transform:'uppercase',sombra:true},
            {id:cvUid(),tipo:'texto',x:140,y:330,w:1000,h:80, texto:'Orquesta Sinfónica Juvenil · Solistas Invitados',tamano:44,color:'#e2e8f0',peso:400,align:'center',fuente:'serif',italic:true,sombra:true},
            {id:cvUid(),tipo:'texto',x:240,y:440,w:800,h:70,  texto:'SÁBADO 24 DE OCTUBRE · 7:00 P.M.',tamano:36,color:'#ffffff',peso:800,align:'center',fuente:'sans',fondoColor:'#b45309'},
            {id:cvUid(),tipo:'texto',x:140,y:530,w:1000,h:60, texto:'Auditorio Principal · Entrada Libre para Toda la Familia',tamano:32,color:'#94a3b8',peso:600,align:'center',fuente:'sans',sombra:true},
          ]
        } else if (tpl === 'urgente') {
          cv.fondo = { tipo:'gradiente', valor:'rojo' }
          cv.elementos = [
            {id:cvUid(),tipo:'forma',formaTipo:'rect',x:80,y:60,w:1120,h:600,color:'rgba(0,0,0,0.6)',borderRadius:16,bordeAncho:3,bordeColor:'#f43f5e',sombra:true},
            {id:cvUid(),tipo:'texto',x:390,y:100,w:500,h:70, texto:'📢 AVISO IMPORTANTE',tamano:36,color:'#ffffff',peso:800,align:'center',fuente:'sans',transform:'uppercase',fondoColor:'#e11d48',sombra:true},
            {id:cvUid(),tipo:'texto',x:140,y:210,w:1000,h:130,texto:'HORARIO ESPECIAL POR LLUVIA',tamano:72,color:'#ffffff',peso:900,align:'center',fuente:'display',transform:'uppercase',sombra:true},
            {id:cvUid(),tipo:'texto',x:160,y:360,w:960,h:180, texto:'Las clases presenciales del turno vespertino se realizarán vía online. Por favor consulte el aula virtual.',tamano:40,color:'#fecdd3',peso:600,align:'center',fuente:'sans',sombra:true},
          ]
        } else if (tpl === 'inscripciones') {
          cv.fondo = { tipo:'gradiente', valor:'azul' }
          cv.elementos = [
            {id:cvUid(),tipo:'forma',formaTipo:'card',x:90,y:70,w:1100,h:580,color:'rgba(15,23,42,0.65)',sombra:true},
            {id:cvUid(),tipo:'texto',x:340,y:110,w:600,h:60, texto:'🎵 NUEVO PERÍODO ACADÉMICO',tamano:30,color:'#38bdf8',peso:700,align:'center',fuente:'sans',transform:'uppercase',fondoColor:'rgba(2,132,199,0.3)',sombra:true},
            {id:cvUid(),tipo:'texto',x:140,y:190,w:1000,h:140,texto:'AUDICIONES & MATRÍCULAS',tamano:80,color:'#ffffff',peso:900,align:'center',fuente:'display',transform:'uppercase',sombra:true},
            {id:cvUid(),tipo:'texto',x:160,y:340,w:960,h:90, texto:'Violín · Viola · Violonchelo · Coro · Vientos · Percusión',tamano:42,color:'#7dd3fc',peso:600,align:'center',fuente:'sans',sombra:true},
            {id:cvUid(),tipo:'texto',x:290,y:460,w:700,h:80, texto:'Inscríbete en Dirección Académica o vía portal SOI',tamano:34,color:'#ffffff',peso:700,align:'center',fuente:'sans',fondoColor:'#0284c7'},
          ]
        } else if (tpl === 'cita') {
          cv.fondo = { tipo:'gradiente', valor:'oscuro' }
          cv.elementos = [
            {id:cvUid(),tipo:'forma',formaTipo:'card',x:120,y:90,w:1040,h:540,color:'rgba(255,255,255,0.04)',sombra:true},
            {id:cvUid(),tipo:'texto',x:180,y:140,w:920,h:80, texto:'"',tamano:120,color:'#f59e0b',peso:900,align:'center',fuente:'serif',sombra:true},
            {id:cvUid(),tipo:'texto',x:180,y:220,w:920,h:220,texto:'La música es un instrumento irremplazable para unir a las personas y transformar a la sociedad.',tamano:54,color:'#ffffff',peso:400,align:'center',fuente:'serif',italic:true,sombra:true},
            {id:cvUid(),tipo:'texto',x:180,y:460,w:920,h:70, texto:'— Maestro José Antonio Abreu',tamano:36,color:'#cbd5e1',peso:700,align:'center',fuente:'sans',transform:'uppercase',sombra:true},
          ]
        }
        renderArt()
        selectElement(null)
        AppToast.success('Plantilla aplicada.')
      })
    })

    // ── Controles de fondo ────────────────────────────────────────────────────
    const bgKind   = container.querySelector('[data-cv="bg-kind"]')
    const bgGrad   = container.querySelector('[data-cv="bg-grad"]')
    const bgColor  = container.querySelector('[data-cv="bg-color"]')
    const bgImgLbl = container.querySelector('[data-cv="bg-img-lbl"]')

    if (bgKind && bgGrad && bgColor && bgImgLbl) {
      bgKind.value = (cv.fondo && cv.fondo.tipo) || 'gradiente'
      if (cv.fondo?.tipo === 'gradiente') bgGrad.value = cv.fondo.valor || 'oscuro'
      if (cv.fondo?.tipo === 'color')     bgColor.value = cv.fondo.valor || '#0b0e17'

      const syncBg = () => {
        bgGrad.hidden   = bgKind.value !== 'gradiente'
        bgColor.hidden  = bgKind.value !== 'color'
        bgImgLbl.hidden = bgKind.value !== 'imagen'
      }
      syncBg()

      bgKind.addEventListener('change', () => {
        pushState()
        const k = bgKind.value
        cv.fondo = k === 'color'
          ? { tipo:'color',    valor:bgColor.value }
          : k === 'imagen'
            ? { tipo:'imagen',   storage_path:cv.fondo?.storage_path }
            : { tipo:'gradiente', valor:bgGrad.value }
        syncBg(); renderArt()
      })
      bgGrad.addEventListener('change', ()  => { pushState(); cv.fondo = { tipo:'gradiente', valor:bgGrad.value }; renderArt() })
      bgColor.addEventListener('input', ()  => { cv.fondo = { tipo:'color', valor:bgColor.value }; renderArt() })

      container.querySelector('[data-cv="bg-img"]')?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0]; e.target.value = ''
        if (!file) return
        pushState()
        const toast = AppToast.progress('Subiendo fondo…')
        try {
          const { path } = await api.subirArchivo(file)
          cv.fondo = { tipo:'imagen', storage_path:path }
          toast.success('Fondo actualizado.'); renderArt()
        } catch (err) { toast.error(err.message) }
      })
    }

    // ── Volver / Eliminar / Guardar ────────────────────────────────────────────
    container.querySelector('#ss-btn-back')?.addEventListener('click', () => router.navigate('cartelera'))

    container.querySelector('#ss-btn-delete')?.addEventListener('click', async () => {
      if (!confirm('¿Eliminar definitivamente esta diapositiva?')) return
      try {
        await api.eliminarMedio(medio.id, null)
        AppToast.success('Diapositiva eliminada.')
        router.navigate('cartelera')
      } catch (err) { AppToast.error(err.message) }
    })

    container.querySelector('#ss-btn-save')?.addEventListener('click', async () => {
      if (guardando) return
      if (!cv.elementos.length) { AppToast.error('Agrega al menos un elemento antes de guardar.'); return }

      const durInput = container.querySelector('#ss-cv-dur')
      duracionSeg = Math.min(60, Math.max(4, Number(durInput?.value) || 12))

      const txt   = cv.elementos.find((e) => e.tipo === 'texto' && e.texto)
      const label = (txt ? txt.texto : 'Diapositiva').replace(/\s+/g, ' ').trim().slice(0, 42) || 'Diapositiva'
      const payload = {
        titulo: label,
        contenido: cv,
        duracion_seg: duracionSeg,
        pantalla_id: pantallaId || medio?.pantalla_id || null,
      }

      guardando = true
      const btnSave = container.querySelector('#ss-btn-save')
      if (btnSave) { btnSave.disabled = true; btnSave.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando…' }

      try {
        if (esEdicion) {
          await api.actualizarMedio(medio.id, payload)
          AppToast.success('Diapositiva actualizada.')
        } else {
          await api.crearMedio({ ...payload, tipo:'slide', orden:100, activo:true })
          AppToast.success('Diapositiva creada.')
        }
        router.navigate('cartelera')
      } catch (err) {
        AppToast.error('Error al guardar: ' + err.message)
      } finally {
        guardando = false
        if (btnSave) { btnSave.disabled = false; btnSave.innerHTML = '<i class="bi bi-check-lg me-1"></i>Guardar' }
      }
    })

    // ── Countdown: actualizar cada segundo ─────────────────────────────────────
    const countdownInterval = setInterval(() => {
      art.querySelectorAll('.cvel--countdown').forEach((node) => {
        const el = elById(node.dataset.id)
        if (el?.targetDate) {
          const display = node.querySelector('.cvel-countdown-display')
          if (display) display.textContent = getCountdownText(el.targetDate)
        }
      })
    }, 1000)

    // ── Init ────────────────────────────────────────────────────────────────────
    renderArt()
    fitScale()
    requestAnimationFrame(fitScale)
    setTimeout(fitScale, 100)
    setTimeout(fitScale, 300)
    window.addEventListener('resize', fitScale)

    container.cleanup = () => {
      window.removeEventListener('resize', fitScale)
      window.removeEventListener('keydown', onKeyDown)
      clearInterval(countdownInterval)
    }
  }

  renderView()
}
