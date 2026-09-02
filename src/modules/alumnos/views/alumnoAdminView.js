import { Modal } from 'bootstrap'
import { formatDate, escapeHTML } from '../utils/alumnosUtils.js'
import { calcularEdad } from '../domain/calcularEdad.js'
import { calcularCompletitud, NIVEL_COLOR, NIVEL_LABEL } from '../domain/completitudAlumno.js'
import { formatPhone, whatsappLink } from '../../../shared/utils/phoneUtils.js'
import { descargarFichaAlumno, descargarConstancia } from '../domain/generarPdfInscripcion.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { AlumnoForm, SECTIONS } from '../components/AlumnoForm.js'
import { PostulanteResolver } from '../components/PostulanteResolver.js'
import { AlumnoDeleteModal } from '../components/AlumnoDeleteModal.js'
import {
  obtenerAlumno,
  obtenerInscripcionesDetalladasAlumno,
  obtenerProgresoAlumno,
  obtenerResumenAcademico,
  obtenerAsistenciasAlumno,
  actualizarAlumno,
  reactivarAlumno,
} from '../api/alumnosApi.js'


// ─── Multi-phone splitter ─────────────────────────────────────────────────────

/**
 * Extrae todos los números de teléfono de un string que puede contener varios.
 * Detecta separadores: "y", "/", ",", ";", espacio entre secuencias numéricas.
 * @param {string} raw
 * @returns {string[]} array de números limpios (solo dígitos, mínimo 7)
 */
// ─── Completitud ─────────────────────────────────────────────────────────────

function renderCompletitudBanner(alumno) {
  const { porcentaje, nivel, camposFaltantes, porGrupo } = calcularCompletitud(alumno)
  const color = NIVEL_COLOR[nivel]
  const label = NIVEL_LABEL[nivel]

  if (nivel === 'completo') return ''

  const gruposIncompletos = Object.entries(porGrupo)
    .filter(([, g]) => g.faltantes.length > 0)
    .map(([nombre, g]) => `
      <div class="mb-1">
        <span class="fw-semibold small text-body">${nombre}</span>
        <span class="text-muted small ms-1">(${g.completos}/${g.total})</span>
        <div class="small text-muted">${g.faltantes.join(', ')}</div>
      </div>`)
    .join('')

  return `
    <div class="card border-${color} mb-3" id="completitud-banner">
      <div class="card-body py-2 px-3">
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-2 mb-1">
              <span class="badge bg-${color}">${label}</span>
              <span class="small fw-semibold">Perfil ${porcentaje}% completo</span>
              <span class="text-muted small">· ${camposFaltantes.length} campo(s) pendiente(s)</span>
              <button class="btn btn-link btn-sm p-0 ms-auto text-muted" id="btn-toggle-completitud">
                <i class="bi bi-chevron-down"></i> Ver detalle
              </button>
            </div>
            <div class="progress" style="height:6px">
              <div class="progress-bar bg-${color}" style="width:${porcentaje}%"></div>
            </div>
          </div>
        </div>
        <div id="completitud-detalle" class="mt-2 pt-2 border-top" style="display:none">
          ${gruposIncompletos}
        </div>
      </div>
    </div>`
}

// ─── Multi-phone splitter ─────────────────────────────────────────────────────

function splitPhones(raw) {
  if (!raw) return []
  // Extraer todas las secuencias de dígitos de al menos 7 caracteres
  const matches = String(raw).match(/\d[\d\s.-]{6,}\d/g)
  if (!matches) return [raw.trim()]
  return matches
    .map(m => m.replace(/[\s.-]/g, ''))
    .filter(m => m.length >= 7)
}

// ─── Field helpers ────────────────────────────────────────────────────────────

function val(v) {
  if (v === null || v === undefined || v === '') {
    return '<span class="text-muted fst-italic small">—</span>'
  }
  return escapeHTML(String(v))
}

function bool(v) {
  if (v === true || v === 'true' || v === 1 || v === '1') return 'Sí'
  if (v === false || v === 'false' || v === 0 || v === '0') return 'No'
  return '<span class="text-muted fst-italic small">—</span>'
}

function phoneDisplay(raw) {
  if (!raw) return '<span class="text-muted fst-italic small">—</span>'
  const phones = splitPhones(raw)
  if (phones.length <= 1) {
    const formatted = formatPhone(raw) || escapeHTML(raw)
    const link = whatsappLink(raw)
    const wa = link
      ? ` <a href="${escapeHTML(link)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-success py-0 ms-1" title="WhatsApp"><i class="bi bi-whatsapp"></i></a>`
      : ''
    return `<span>${escapeHTML(formatted)}</span>${wa}`
  }
  // Múltiples números: mostrar cada uno con su botón WhatsApp
  return phones.map((p, i) => {
    const formatted = formatPhone(p) || p
    const link = whatsappLink(p)
    const wa = link
      ? `<a href="${escapeHTML(link)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-success py-0 ms-1" title="WhatsApp ${i + 1}"><i class="bi bi-whatsapp"></i></a>`
      : ''
    return `<span class="me-2">${escapeHTML(formatted)}${wa}</span>`
  }).join('<span class="text-muted mx-1">·</span>')
}

// SECTIONS is imported from AlumnoForm.js


const TAB_LABELS = {
  personal: 'Personal',
  madre: 'Madre',
  padre: 'Padre',
  representante: 'Representante',
  salud: 'Salud',
  musical: 'Musical',
  clases: 'Clases',
  progreso: 'Progreso',
  asistencias: 'Asistencias',
}

// ─── Render helpers ───────────────────────────────────────────────────────────

function renderFieldValue(field, alumno) {
  const v = alumno[field.key]
  if (field.type === 'checkbox') return bool(v)
  if (field.type === 'phone') return phoneDisplay(v)
  if (field.type === 'date') return v ? val(formatDate(v)) : val(null)
  return val(v)
}

function renderFieldList(fields, alumno) {
  return fields.map(f => `
    <div class="row mb-2 align-items-start">
      <div class="col-5 col-md-4 text-muted small fw-semibold">${escapeHTML(f.label)}</div>
      <div class="col-7 col-md-8">${renderFieldValue(f, alumno)}</div>
    </div>
  `).join('')
}

// renderFormField is removed since form rendering is managed by AlumnoForm component

// ─── Initials avatar ──────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function renderAlumnoAdminView(container, params = {}) {
  let alumnoId = params?.alumnoId || params?.id
  if (!alumnoId && typeof window !== 'undefined') {
    const searchParams = window.location.search ? Object.fromEntries(new URLSearchParams(window.location.search)) : {}
    const hashParams = window.location.hash && window.location.hash.includes('?') ? Object.fromEntries(new URLSearchParams(window.location.hash.split('?')[1])) : {}
    alumnoId = searchParams.id || searchParams.alumnoId || hashParams.id || hashParams.alumnoId
    if (!alumnoId) {
      const parts = window.location.pathname.split('/').filter(Boolean)
      const idx = parts.findIndex(p => p === 'alumnos' || p === 'alumno')
      if (idx !== -1 && parts[idx + 1] && !['inactivos', 'duplicados', 'reporte-mes', 'inscribir', 'pdf-demo'].includes(parts[idx + 1])) {
        alumnoId = decodeURIComponent(parts[idx + 1])
      }
    }
  }

  if (!alumnoId) {
    container.innerHTML = '<div class="alert alert-danger m-4">ID de alumno no especificado.</div>'
    return
  }

  // Show spinner
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height:300px">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  `

  let alumno, clases
  try {
    // Consulta en paralelo para la tabla alumnos y la relacion de alumnos_clases (D04 Promise.all)
    const [alumnoRes, clasesRes] = await Promise.all([
      obtenerAlumno(alumnoId),
      obtenerInscripcionesDetalladasAlumno(alumnoId)
    ])
    alumno = alumnoRes
    clases = clasesRes
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger m-4">Error al cargar el alumno: ${escapeHTML(err.message || 'No encontrado')}</div>`
    return
  }

  // Lazy-load state
  let progresoLoaded = false
  let asistenciasLoaded = false

  // ─── Render full view ─────────────────────────────────────────────────────────

  function renderView() {
    const initials = getInitials(alumno.nombre_completo)
    const edad = calcularEdad(alumno.fecha_nacimiento)
    const activoBadge = alumno.activo
      ? '<span class="badge bg-success">Activo</span>'
      : '<span class="badge bg-secondary">Inactivo</span>'

    const sectionTabs = ['personal', 'madre', 'padre', 'representante', 'salud', 'musical']
    const allTabKeys = [...sectionTabs, 'clases', 'progreso', 'asistencias']

    const navItems = allTabKeys.map((key, i) => `
      <li class="nav-item" role="presentation">
        <button
          class="nav-link${i === 0 ? ' active' : ''}"
          id="tab-${key}"
          data-bs-toggle="tab"
          data-bs-target="#panel-${key}"
          type="button"
          role="tab"
          aria-controls="panel-${key}"
          aria-selected="${i === 0}"
        >${escapeHTML(TAB_LABELS[key])}</button>
      </li>
    `).join('')

    function renderSectionPanel(sectionKey) {
      const fields = SECTIONS[sectionKey]
      return `
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h6 class="fw-bold text-uppercase text-muted small mb-0">${escapeHTML(TAB_LABELS[sectionKey])}</h6>
          <button class="btn btn-sm btn-outline-primary" data-edit-section="${escapeHTML(sectionKey)}">
            <i class="bi bi-pencil me-1"></i>Editar
          </button>
        </div>
        <div id="fields-${sectionKey}">
          ${renderFieldList(fields, alumno)}
        </div>
      `
    }

    const tabPanels = `
      ${sectionTabs.map((key, i) => `
        <div
          class="tab-pane fade${i === 0 ? ' show active' : ''}"
          id="panel-${key}"
          role="tabpanel"
          aria-labelledby="tab-${key}"
        >
          <div class="p-3">
            ${renderSectionPanel(key)}
          </div>
        </div>
      `).join('')}

      <div class="tab-pane fade" id="panel-clases" role="tabpanel" aria-labelledby="tab-clases">
        <div class="p-3">
          <h6 class="fw-bold text-uppercase text-muted small mb-3">Clases inscritas</h6>
          ${clases.length === 0
            ? '<p class="text-muted fst-italic">Sin clases activas.</p>'
            : `<div class="list-group">
                 ${clases.map(c => {
                   const horarios = (c.clase_horarios || [])
                     .map(h => `${val(h.dia)} ${val(h.hora_inicio?.slice(0, 5) || '')}`)
                     .join(', ') || 'Sin horario'
                   return `
                     <div class="list-group-item d-flex justify-content-between align-items-center">
                       <span class="fw-semibold">${val(c.nombre)}</span>
                       <span class="text-muted small">${horarios}</span>
                     </div>
                   `
                 }).join('')}
              </div>`
          }
        </div>
      </div>

      <div class="tab-pane fade" id="panel-progreso" role="tabpanel" aria-labelledby="tab-progreso">
        <div class="p-3" id="progreso-content">
          <div class="text-muted fst-italic">Cargando progreso...</div>
        </div>
      </div>

      <div class="tab-pane fade" id="panel-asistencias" role="tabpanel" aria-labelledby="tab-asistencias">
        <div class="p-3" id="asistencias-content">
          <div class="text-muted fst-italic">Cargando asistencias...</div>
        </div>
      </div>
    `

    container.innerHTML = `
      <div class="container-fluid py-3 px-3 px-md-4">

        <!-- Back -->
        <button class="btn btn-link text-decoration-none ps-0 mb-3" id="btn-back">
          <i class="bi bi-arrow-left me-1"></i>Volver a Alumnos
        </button>

        <div id="completitud-banner-container">
          ${renderCompletitudBanner(alumno)}
        </div>

        <!-- Header card -->
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <div class="d-flex flex-wrap gap-3 align-items-start justify-content-between">
              <div class="d-flex gap-3 align-items-center">
                <div
                  class="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                  style="width:64px;height:64px;font-size:1.4rem;background:var(--bs-primary,#0d6efd)"
                >${escapeHTML(initials)}</div>
                <div>
                  <h4 class="mb-1 fw-bold">${val(alumno.nombre_completo)}</h4>
                  <div class="d-flex flex-wrap gap-2 align-items-center">
                    ${activoBadge}
                    ${alumno.instrumento_principal ? `<span class="badge bg-info text-dark">${val(alumno.instrumento_principal)}</span>` : ''}
                    ${alumno.nivel_actual ? `<span class="badge bg-light text-dark border">${val(alumno.nivel_actual)}</span>` : ''}
                    ${edad !== null ? `<span class="text-muted small">${escapeHTML(String(edad))} años</span>` : ''}
                    ${alumno.created_at ? `<span class="text-muted small">Inscrito: ${val(formatDate(alumno.created_at))}</span>` : ''}
                  </div>
                </div>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-outline-secondary btn-sm" id="btn-postulante">
                  <i class="bi bi-search me-1"></i>Buscar postulante
                </button>
                <button class="btn btn-outline-primary btn-sm" id="btn-ficha-pdf">
                  <i class="bi bi-file-earmark-pdf me-1"></i>Ficha PDF
                </button>
                <button class="btn btn-outline-success btn-sm" id="btn-constancia">
                  <i class="bi bi-file-earmark-text me-1"></i>Constancia
                </button>
                ${alumno.activo !== false ? `
                  <button class="btn btn-outline-danger btn-sm" id="btn-eliminar-alumno">
                    <i class="bi bi-person-x me-1"></i>Inactivar alumno
                  </button>
                ` : `
                  <button class="btn btn-outline-success btn-sm" id="btn-reactivar-alumno">
                    <i class="bi bi-arrow-counterclockwise me-1"></i>Reactivar alumno
                  </button>
                `}
              </div>
            </div>

          </div>
        </div>

        <!-- Postulante panel slot -->
        <div id="postulante-panel"></div>

        <!-- Tabs -->
        <div class="card shadow-sm">
          <div class="card-header p-0">
            <ul class="nav nav-tabs border-0 flex-nowrap overflow-auto" role="tablist">
              ${navItems}
            </ul>
          </div>
          <div class="card-body p-0">
            <div class="tab-content">
              ${tabPanels}
            </div>
          </div>
        </div>

      </div>

      <!-- Edit modal -->
      <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="editModalLabel">Editar sección</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body" id="editModalBody"></div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" id="btn-modal-save">
                <span id="modal-save-spinner" class="spinner-border spinner-border-sm d-none me-1" role="status"></span>
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    `

    attachEvents()
  }

  // ─── Lazy loaders ─────────────────────────────────────────────────────────────

  const NIVEL_LABEL_ACADEMICO = { basico: 'Básico', intermedio: 'Intermedio', avanzado: 'Avanzado' }

  function renderResumenAcademico(resumen) {
    if (!resumen || (resumen.promedioBase == null && resumen.totalEvaluaciones === 0)) return ''

    const nivelLabel = resumen.nivel ? (NIVEL_LABEL_ACADEMICO[resumen.nivel] || resumen.nivel) : null

    return `
      <div class="card bg-body-tertiary border-0 mb-4">
        <div class="card-body">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
            <h6 class="fw-bold text-uppercase text-muted small mb-0">Resumen académico</h6>
            ${nivelLabel ? `<span class="badge text-bg-secondary">${val(nivelLabel)}</span>` : ''}
          </div>
          <div class="row g-3 text-center">
            <div class="col-4">
              <div class="fs-4 fw-bold">${resumen.promedioBase != null ? resumen.promedioBase : '—'}</div>
              <div class="small text-muted">Base (reconciliado)</div>
            </div>
            <div class="col-4">
              <div class="fs-4 fw-bold">${resumen.promedioEvaluaciones != null ? resumen.promedioEvaluaciones : '—'}</div>
              <div class="small text-muted">${resumen.totalEvaluaciones} ${resumen.totalEvaluaciones === 1 ? 'evaluación' : 'evaluaciones'} del maestro</div>
            </div>
            <div class="col-4">
              <div class="fs-4 fw-bold text-primary">${resumen.promedioActualizado != null ? resumen.promedioActualizado : '—'}</div>
              <div class="small text-muted">Promedio actualizado</div>
            </div>
          </div>
          ${resumen.totalEvaluaciones > 0 ? `
            <div class="small text-muted mt-2 mb-0">
              El promedio actualizado combina el dato base con cada evaluación registrada por el maestro — se va diluyendo solo a medida que hay más evaluaciones reales.
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  async function loadProgreso() {
    if (progresoLoaded) return
    progresoLoaded = true
    const el = document.getElementById('progreso-content')
    if (!el) return

    try {
      const [data, resumen] = await Promise.all([
        obtenerProgresoAlumno(alumnoId),
        obtenerResumenAcademico(alumnoId).catch(() => null),
      ])

      const resumenHtml = renderResumenAcademico(resumen)

      if (!data || data.length === 0) {
        el.innerHTML = resumenHtml || '<p class="text-muted fst-italic">Sin registros de progreso.</p>'
        return
      }

      // Group by contenido_dsl
      const grouped = {}
      for (const p of data) {
        const key = p.contenido_dsl || 'Sin categoría'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(p)
      }

      function estadoBadgeClass(e) {
        if (!e) return 'bg-secondary'
        const l = e.toLowerCase()
        if (l.includes('excel') || l.includes('muy bien')) return 'bg-success'
        if (l.includes('bien') || l.includes('regular')) return 'bg-info text-dark'
        if (l.includes('mal') || l.includes('inici')) return 'bg-warning text-dark'
        return 'bg-secondary'
      }

      el.innerHTML = `
        ${resumenHtml}
        <h6 class="fw-bold text-uppercase text-muted small mb-3">Evaluaciones registradas</h6>
        ${Object.entries(grouped).map(([grupo, items]) => `
          <div class="mb-4">
            <div class="fw-semibold mb-2 border-bottom pb-1">${val(grupo)}</div>
            <div class="list-group list-group-flush">
              ${items.map(p => `
                <div class="list-group-item px-0 py-2 d-flex justify-content-between align-items-start">
                  <div>
                    ${val(p.observaciones)}
                    ${p.fecha_evaluacion ? `<div class="text-muted small mt-1">${val(formatDate(p.fecha_evaluacion))}</div>` : ''}
                  </div>
                  ${p.estado_cualitativo
                    ? `<span class="badge ${estadoBadgeClass(p.estado_cualitativo)} ms-2 flex-shrink-0">${val(p.estado_cualitativo)}</span>`
                    : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      `
    } catch (error) {
      el.innerHTML = `<div class="alert alert-warning">Error al cargar progreso: ${escapeHTML(error.message)}</div>`
    }
  }

  async function loadAsistencias() {
    if (asistenciasLoaded) return
    asistenciasLoaded = true
    const el = document.getElementById('asistencias-content')
    if (!el) return

    try {
      const data = await obtenerAsistenciasAlumno(alumnoId)

      if (!data || data.length === 0) {
        el.innerHTML = '<p class="text-muted fst-italic">Sin registros de asistencia.</p>'
        return
      }

      let presente = 0, ausente = 0, justificado = 0
      for (const a of data) {
        const e = (a.estado || a.asistio || '').toString().toLowerCase()
        if (e === 'true' || e === 'presente' || e === '1') presente++
        else if (e === 'justificado' || e === 'justified') justificado++
        else ausente++
      }
      const total = data.length
      const pct = total > 0 ? Math.round((presente / total) * 100) : 0

      function estadoLabel(a) {
        const e = (a.estado || a.asistio || '').toString().toLowerCase()
        if (e === 'true' || e === 'presente' || e === '1') return '<span class="badge bg-success">Presente</span>'
        if (e === 'justificado' || e === 'justified') return '<span class="badge bg-warning text-dark">Justificado</span>'
        return '<span class="badge bg-danger">Ausente</span>'
      }

      el.innerHTML = `
        <h6 class="fw-bold text-uppercase text-muted small mb-3">Asistencias (últimas 30)</h6>
        <div class="row g-2 mb-3">
          <div class="col-6 col-md-3">
            <div class="card text-center border-0 bg-light">
              <div class="card-body py-2">
                <div class="fs-4 fw-bold text-success">${escapeHTML(String(pct))}%</div>
                <div class="small text-muted">Asistencia</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card text-center border-0 bg-light">
              <div class="card-body py-2">
                <div class="fs-4 fw-bold text-success">${escapeHTML(String(presente))}</div>
                <div class="small text-muted">Presentes</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card text-center border-0 bg-light">
              <div class="card-body py-2">
                <div class="fs-4 fw-bold text-danger">${escapeHTML(String(ausente))}</div>
                <div class="small text-muted">Ausentes</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="card text-center border-0 bg-light">
              <div class="card-body py-2">
                <div class="fs-4 fw-bold text-warning">${escapeHTML(String(justificado))}</div>
                <div class="small text-muted">Justificados</div>
              </div>
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-sm table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(a => `
                <tr>
                  <td class="text-nowrap">${val(a.fecha ? formatDate(a.fecha) : null)}</td>
                  <td>${estadoLabel(a)}</td>
                  <td>${val(a.observaciones)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `
    } catch (error) {
      el.innerHTML = `<div class="alert alert-warning">Error al cargar asistencias: ${escapeHTML(error.message)}</div>`
    }
  }

  // ─── Event wiring ─────────────────────────────────────────────────────────────

  let activeModalSection = null
  let bsModal = null

  function attachEvents() {
    // Completitud — toggle detalle
    document.getElementById('btn-toggle-completitud')?.addEventListener('click', (e) => {
      const detalle = document.getElementById('completitud-detalle')
      const btn = e.currentTarget
      const visible = detalle.style.display !== 'none'
      detalle.style.display = visible ? 'none' : 'block'
      btn.innerHTML = visible
        ? '<i class="bi bi-chevron-down"></i> Ver detalle'
        : '<i class="bi bi-chevron-up"></i> Ocultar'
    })

    // Back button
    const btnBack = document.getElementById('btn-back')
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (window.router?.navigate) {
          window.router.navigate('alumnos')
        } else {
          history.back()
        }
      })
    }

    // PDF buttons
    const btnFicha = document.getElementById('btn-ficha-pdf')
    if (btnFicha) {
      btnFicha.addEventListener('click', async () => {
        try {
          btnFicha.disabled = true
          await descargarFichaAlumno(alumno)
        } catch (e) {
          console.error('Error generando ficha PDF:', e)
        } finally {
          btnFicha.disabled = false
        }
      })
    }

    const btnConstancia = document.getElementById('btn-constancia')
    if (btnConstancia) {
      btnConstancia.addEventListener('click', async () => {
        try {
          btnConstancia.disabled = true
          await descargarConstancia(alumno)
        } catch (e) {
          console.error('Error generando constancia:', e)
        } finally {
          btnConstancia.disabled = false
        }
      })
    }

    // Inactivar / Eliminar alumno
    const btnEliminar = document.getElementById('btn-eliminar-alumno')
    if (btnEliminar) {
      btnEliminar.addEventListener('click', () => {
        AlumnoDeleteModal.open({
          alumnoId: alumno.id,
          alumnoNombre: alumno.nombre_completo || alumno.nombre,
          onDeleted: () => {
            if (window.router?.navigate) {
              window.router.navigate('alumnos')
            } else {
              history.back()
            }
          }
        })
      })
    }

    // Reactivar alumno
    const btnReactivar = document.getElementById('btn-reactivar-alumno')
    if (btnReactivar) {
      btnReactivar.addEventListener('click', async () => {
        try {
          btnReactivar.disabled = true
          await reactivarAlumno(alumno.id)
          AppToast.success('Alumno reactivado exitosamente')
          alumno.activo = true
          renderView()
          attachEvents()
        } catch (err) {
          console.error('Error reactivando alumno:', err)
          AppToast.error(err.message || 'Error al reactivar el alumno')
        } finally {
          btnReactivar.disabled = false
        }
      })
    }


    // Postulante lookup
    const btnPostulante = document.getElementById('btn-postulante')
    if (btnPostulante) {
      btnPostulante.addEventListener('click', () => {
        const panel = container.querySelector('#postulante-panel')
        if (panel) {
          PostulanteResolver.resolve(alumno, panel, () => {
            // After data resolution, refresh tabs
            const activeTab = container.querySelector('.nav-link.active')
            if (activeTab) {
              const tabId = activeTab.id
              if (tabId === 'tab-progreso') {
                progresoLoaded = false
                loadProgreso()
              } else if (tabId === 'tab-asistencias') {
                asistenciasLoaded = false
                loadAsistencias()
              }
            }
          })
        }
      })
    }

    // Tab change — lazy load
    const progresoTab = document.getElementById('tab-progreso')
    if (progresoTab) {
      progresoTab.addEventListener('shown.bs.tab', loadProgreso)
    }

    const asistenciasTab = document.getElementById('tab-asistencias')
    if (asistenciasTab) {
      asistenciasTab.addEventListener('shown.bs.tab', loadAsistencias)
    }

    // Edit section buttons — scoped to container to avoid leaking to sibling views
    container.querySelectorAll('[data-edit-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        const sectionKey = btn.getAttribute('data-edit-section')
        openEditModal(sectionKey)
      })
    })

    // Modal save
    const btnSave = container.querySelector('#btn-modal-save')
    if (btnSave) {
      btnSave.addEventListener('click', saveModal)
    }
  }

  let activeFormInstance = null

  function openEditModal(sectionKey) {
    activeModalSection = sectionKey
    const body = document.getElementById('editModalBody')
    const title = document.getElementById('editModalLabel')

    if (title) title.textContent = `Editar — ${TAB_LABELS[sectionKey]}`
    if (body) {
      activeFormInstance = new AlumnoForm({ alumno, section: sectionKey })
      body.innerHTML = activeFormInstance.render()
    }

    const modalEl = document.getElementById('editModal')
    if (!modalEl) return

    if (!bsModal) {
      const ModalClass = Modal || window.bootstrap?.Modal
      bsModal = new ModalClass(modalEl)
    }
    bsModal.show()
  }

  async function saveModal() {
    if (!activeModalSection || !activeFormInstance) return

    const spinner = document.getElementById('modal-save-spinner')
    const btnSave = document.getElementById('btn-modal-save')

    const validation = activeFormInstance.validate(document.getElementById('editModalBody'))
    if (!validation.valid) {
      const firstErr = Object.values(validation.errors)[0]
      AppToast.error(firstErr)
      return
    }

    if (spinner) spinner.classList.remove('d-none')
    if (btnSave) btnSave.disabled = true

    try {
      const patch = validation.data
      await actualizarAlumno(alumno.id, patch)

      if (spinner) spinner.classList.add('d-none')
      if (btnSave) btnSave.disabled = false

      // Update local alumno object and re-render the active section's field list
      Object.assign(alumno, patch)

      const fieldsContainer = document.getElementById(`fields-${activeModalSection}`)
      if (fieldsContainer) {
        fieldsContainer.innerHTML = renderFieldList(SECTIONS[activeModalSection], alumno)
      }

      // Re-render completitud banner if it exists
      const bannerContainer = container.querySelector('#completitud-banner-container')
      if (bannerContainer) {
        bannerContainer.innerHTML = renderCompletitudBanner(alumno)
        // Re-bind completitud details toggle
        const btnToggle = bannerContainer.querySelector('#btn-toggle-completitud')
        if (btnToggle) {
          btnToggle.addEventListener('click', () => {
            const detail = bannerContainer.querySelector('#completitud-detalle')
            if (detail) {
              const hidden = detail.style.display === 'none'
              detail.style.display = hidden ? 'block' : 'none'
              btnToggle.innerHTML = hidden ? '<i class="bi bi-chevron-up"></i> Ocultar detalle' : '<i class="bi bi-chevron-down"></i> Ver detalle'
            }
          })
        }
      }

      if (bsModal) bsModal.hide()
    } catch (err) {
      if (spinner) spinner.classList.add('d-none')
      if (btnSave) btnSave.disabled = false
      console.error('[alumnoAdminView] Error al guardar cambios:', err)
      AppToast.error(err.message || 'Error al guardar los cambios')
    }
  }

  // ─── Initial render ───────────────────────────────────────────────────────────

  renderView()
}
