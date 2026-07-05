/**
 * alumnoAdminView.js — Admin portal student profile view.
 * Queries Supabase directly via select('*') — uses raw DB column names.
 */

import { supabase } from '../../../lib/supabaseClient.js'
import { formatDate, escapeHTML } from '../utils/alumnosUtils.js'
import { calcularEdad } from '../domain/calcularEdad.js'
import { calcularCompletitud, NIVEL_COLOR, NIVEL_LABEL } from '../domain/completitudAlumno.js'
import { formatPhone, whatsappLink } from '../../../shared/utils/phoneUtils.js'
import { descargarFichaAlumno, descargarConstancia } from '../domain/generarPdfInscripcion.js'
import { buscarPostulante } from '../api/postulantesSupabase.js'
import { AppToast } from '../../../shared/components/AppToast.js'

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

// ─── Sections definition ─────────────────────────────────────────────────────

const SECTIONS = {
  personal: [
    { key: 'nombre_completo', label: 'Nombre completo' },
    { key: 'fecha_nacimiento', label: 'Fecha de nacimiento', type: 'date' },
    { key: 'genero', label: 'Género', type: 'select', options: [{ v: '', l: '—' }, { v: 'M', l: 'Masculino' }, { v: 'F', l: 'Femenino' }, { v: 'O', l: 'Otro' }] },
    { key: 'nacionalidad', label: 'Nacionalidad' },
    { key: 'tiene_pasaporte', label: 'Tiene pasaporte', type: 'checkbox' },
    { key: 'sabe_leer', label: 'Sabe leer', type: 'checkbox' },
    { key: 'sabe_escribir', label: 'Sabe escribir', type: 'checkbox' },
    { key: 'como_se_entero', label: 'Cómo se enteró' },
    { key: 'municipio_residencia', label: 'Municipio' },
    { key: 'sector_calle_numero', label: 'Sector / Calle / Número' },
    { key: 'direccion', label: 'Dirección completa', type: 'textarea' },
    { key: 'ubicacion_maps_url', label: 'URL Google Maps' },
    { key: 'activo', label: 'Alumno activo', type: 'checkbox' },
  ],
  madre: [
    { key: 'madre_nombre', label: 'Nombre' },
    { key: 'madre_cedula', label: 'Cédula' },
    { key: 'madre_tlf_whatsapp', label: 'Teléfono / WhatsApp', type: 'phone' },
  ],
  padre: [
    { key: 'padre_nombre', label: 'Nombre' },
    { key: 'padre_cedula', label: 'Cédula' },
    { key: 'padre_tlf_whatsapp', label: 'Teléfono / WhatsApp', type: 'phone' },
  ],
  representante: [
    { key: 'representante_nombre', label: 'Nombre' },
    { key: 'representante_parentesco', label: 'Parentesco' },
    { key: 'representante_cedula', label: 'Cédula' },
    { key: 'representante_tlf', label: 'Teléfono', type: 'phone' },
    { key: 'correo_representante', label: 'Correo electrónico' },
    { key: 'otro_responsable_nombre', label: 'Otro responsable — Nombre' },
    { key: 'otro_responsable_cedula', label: 'Otro responsable — Cédula' },
    { key: 'otro_responsable_tlf', label: 'Otro responsable — Teléfono', type: 'phone' },
    { key: 'contacto_emergencia_nombre', label: 'Emergencia — Nombre' },
    { key: 'contacto_emergencia_telefono', label: 'Emergencia — Teléfono', type: 'phone' },
    { key: 'beneficiario_subsidio_estado', label: 'Beneficiario subsidio', type: 'checkbox' },
    { key: 'subsidio_descripcion', label: 'Descripción subsidio', type: 'textarea' },
    { key: 'apoyo_actividades', label: 'Apoyo en actividades', type: 'textarea' },
  ],
  salud: [
    { key: 'tiene_alergias', label: 'Tiene alergias', type: 'checkbox' },
    { key: 'alergias_descripcion', label: 'Descripción alergias', type: 'textarea' },
    { key: 'tiene_condicion_transmisible', label: 'Tiene condición transmisible', type: 'checkbox' },
    { key: 'condicion_transmisible_desc', label: 'Descripción condición', type: 'textarea' },
    { key: 'tiene_alergia_medicamento', label: 'Tiene alergia a medicamento', type: 'checkbox' },
    { key: 'alergia_medicamento_desc', label: 'Descripción alergia medicamento', type: 'textarea' },
    { key: 'impedimento_social', label: 'Impedimento social', type: 'checkbox' },
    { key: 'problemas_conducta', label: 'Problemas de conducta' },
    { key: 'centro_estudios', label: 'Centro de estudios' },
    { key: 'grado_nivel', label: 'Grado / Nivel' },
    { key: 'padres_en_vida', label: 'Padres en vida' },
  ],
  musical: [
    { key: 'instrumento_principal', label: 'Instrumento principal' },
    { key: 'nivel_actual', label: 'Nivel actual' },
    { key: 'tiene_conocimientos_musicales', label: 'Tiene conocimientos musicales', type: 'checkbox' },
    { key: 'instrumento_previo', label: 'Instrumento previo' },
    { key: 'nivel_lectura_musical', label: 'Nivel de lectura musical' },
    { key: 'interes_musical', label: 'Interés musical' },
    { key: 'instrumento_interes', label: 'Instrumento de interés' },
    { key: 'sentimiento_musica_clasica', label: 'Sentimiento hacia música clásica', type: 'textarea' },
    { key: 'sentimiento_aprender_instrumento', label: 'Sentimiento al aprender instrumento', type: 'textarea' },
    { key: 'aspiracion_instrumento', label: 'Aspiración con el instrumento', type: 'textarea' },
    { key: 'musico_favorito', label: 'Músico favorito' },
    { key: 'preferencia_aprendizaje_musical', label: 'Preferencia de aprendizaje', type: 'textarea' },
    { key: 'por_que_unirse', label: 'Por qué unirse', type: 'textarea' },
    { key: 'autoriza_fotos_redes', label: 'Autoriza fotos en redes', type: 'checkbox' },
  ],
}

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

function renderFormField(field, alumno) {
  const v = alumno[field.key]
  const id = `modal-field-${field.key}`

  if (field.type === 'checkbox') {
    const checked = (v === true || v === 'true' || v === 1 || v === '1') ? 'checked' : ''
    return `
      <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" id="${id}" name="${escapeHTML(field.key)}" ${checked}>
        <label class="form-check-label" for="${id}">${escapeHTML(field.label)}</label>
      </div>
    `
  }

  if (field.type === 'textarea') {
    return `
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${id}">${escapeHTML(field.label)}</label>
        <textarea class="form-control" id="${id}" name="${escapeHTML(field.key)}" rows="3">${v != null ? escapeHTML(String(v)) : ''}</textarea>
      </div>
    `
  }

  if (field.type === 'select') {
    const opts = (field.options || []).map(o =>
      `<option value="${escapeHTML(o.v)}" ${v === o.v ? 'selected' : ''}>${escapeHTML(o.l)}</option>`
    ).join('')
    return `
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${id}">${escapeHTML(field.label)}</label>
        <select class="form-select" id="${id}" name="${escapeHTML(field.key)}">${opts}</select>
      </div>
    `
  }

  if (field.type === 'date') {
    const dateVal = v ? String(v).slice(0, 10) : ''
    return `
      <div class="mb-3">
        <label class="form-label fw-semibold" for="${id}">${escapeHTML(field.label)}</label>
        <input type="date" class="form-control" id="${id}" name="${escapeHTML(field.key)}" value="${escapeHTML(dateVal)}">
      </div>
    `
  }

  // default: text (also handles phone — editable as plain text)
  return `
    <div class="mb-3">
      <label class="form-label fw-semibold" for="${id}">${escapeHTML(field.label)}</label>
      <input type="text" class="form-control" id="${id}" name="${escapeHTML(field.key)}" value="${v != null ? escapeHTML(String(v)) : ''}">
    </div>
  `
}

// ─── Initials avatar ──────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function renderAlumnoAdminView(container, params = {}) {
  const alumnoId = params.alumnoId || params.id
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

  // D04: Fetch alumno and enrolled classes in parallel
  const [{ data: alumno, error: alumnoError }, { data: clasesData }] = await Promise.all([
    supabase
      .from('alumnos')
      .select('*')
      .eq('id', alumnoId)
      .single(),
    supabase
      .from('alumnos_clases')
      .select('clase_id, clases(id, nombre, clase_horarios(dia, hora_inicio))')
      .eq('alumno_id', alumnoId)
      .eq('activo', true),
  ])

  if (alumnoError || !alumno) {
    container.innerHTML = `<div class="alert alert-danger m-4">Error al cargar el alumno: ${escapeHTML(alumnoError?.message || 'No encontrado')}</div>`
    return
  }

  const clases = (clasesData || []).map(r => r.clases).filter(Boolean)

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

        ${renderCompletitudBanner(alumno)}

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

  async function loadProgreso() {
    if (progresoLoaded) return
    progresoLoaded = true
    const el = document.getElementById('progreso-content')
    if (!el) return

    const { data, error } = await supabase
      .from('progresos')
      .select('*')
      .eq('alumno_id', alumnoId)
      .order('fecha', { ascending: false })

    if (error) {
      el.innerHTML = `<div class="alert alert-warning">Error al cargar progreso: ${escapeHTML(error.message)}</div>`
      return
    }

    if (!data || data.length === 0) {
      el.innerHTML = '<p class="text-muted fst-italic">Sin registros de progreso.</p>'
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
      <h6 class="fw-bold text-uppercase text-muted small mb-3">Progreso</h6>
      ${Object.entries(grouped).map(([grupo, items]) => `
        <div class="mb-4">
          <div class="fw-semibold mb-2 border-bottom pb-1">${val(grupo)}</div>
          <div class="list-group list-group-flush">
            ${items.map(p => `
              <div class="list-group-item px-0 py-2 d-flex justify-content-between align-items-start">
                <div>
                  ${val(p.observaciones)}
                  ${p.fecha ? `<div class="text-muted small mt-1">${val(formatDate(p.fecha))}</div>` : ''}
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
  }

  async function loadAsistencias() {
    if (asistenciasLoaded) return
    asistenciasLoaded = true
    const el = document.getElementById('asistencias-content')
    if (!el) return

    const { data, error } = await supabase
      .from('asistencias')
      .select('*')
      .eq('alumno_id', alumnoId)
      .order('fecha', { ascending: false })
      .limit(30)

    if (error) {
      el.innerHTML = `<div class="alert alert-warning">Error al cargar asistencias: ${escapeHTML(error.message)}</div>`
      return
    }

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

    // Postulante lookup
    const btnPostulante = document.getElementById('btn-postulante')
    if (btnPostulante) {
      btnPostulante.addEventListener('click', () => _buscarYmostrarPostulante(alumno, container))
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

  function openEditModal(sectionKey) {
    activeModalSection = sectionKey
    const fields = SECTIONS[sectionKey]
    const body = document.getElementById('editModalBody')
    const title = document.getElementById('editModalLabel')

    if (title) title.textContent = `Editar — ${TAB_LABELS[sectionKey]}`
    if (body) {
      body.innerHTML = `<form id="edit-form">${fields.map(f => renderFormField(f, alumno)).join('')}</form>`
    }

    const modalEl = document.getElementById('editModal')
    if (!modalEl) return

    if (!bsModal) {
      bsModal = new bootstrap.Modal(modalEl)
    }
    bsModal.show()
  }

  async function saveModal() {
    if (!activeModalSection) return

    const fields = SECTIONS[activeModalSection]
    const spinner = document.getElementById('modal-save-spinner')
    const btnSave = document.getElementById('btn-modal-save')

    if (spinner) spinner.classList.remove('d-none')
    if (btnSave) btnSave.disabled = true

    const patch = {}
    for (const field of fields) {
      // Defensive check: skip fields that do not exist as columns in the DB table
      if (alumno[field.key] === undefined) {
        continue
      }
      const el = document.querySelector(`[name="${field.key}"]`)
      if (!el) continue
      if (field.type === 'checkbox') {
        patch[field.key] = el.checked
      } else {
        const raw = el.value.trim()
        patch[field.key] = raw === '' ? null : raw
      }
    }

    const { error } = await supabase
      .from('alumnos')
      .update(patch)
      .eq('id', alumnoId)

    if (spinner) spinner.classList.add('d-none')
    if (btnSave) btnSave.disabled = false

    if (error) {
      AppToast.error(`Error al guardar: ${error.message}`)
      return
    }

    // Update local alumno object and re-render the active section's field list
    Object.assign(alumno, patch)

    const fieldsContainer = document.getElementById(`fields-${activeModalSection}`)
    if (fieldsContainer) {
      fieldsContainer.innerHTML = renderFieldList(fields, alumno)
    }

    if (bsModal) bsModal.hide()
  }

  // ─── Initial render ───────────────────────────────────────────────────────────

  renderView()
}

// ─── Postulante lookup ────────────────────────────────────────────────────────

async function _buscarYmostrarPostulante(alumno, container) {
  const panel = container.querySelector('#postulante-panel')
  if (!panel) return

  panel.innerHTML = `
    <div class="card border-warning shadow-sm mb-4">
      <div class="card-body text-center py-3">
        <div class="spinner-border spinner-border-sm text-warning me-2"></div>
        <span class="small text-muted">Buscando en postulantes...</span>
      </div>
    </div>`

  try {
    const resultados = await buscarPostulante(alumno.nombre_completo)

    if (!resultados || resultados.length === 0) {
      panel.innerHTML = `
        <div class="alert alert-info d-flex align-items-center gap-2 mb-4">
          <i class="bi bi-info-circle"></i>
          <span class="small">No se encontraron postulantes con el nombre <strong>${escapeHTML(alumno.nombre_completo)}</strong>.</span>
          <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel"><i class="bi bi-x"></i></button>
        </div>`
      panel.querySelector('#btn-close-panel')?.addEventListener('click', () => panel.innerHTML = '')
      return
    }

    const postulante = resultados[0]

    // Detectar campos que están vacíos en alumno pero tienen valor en postulante
    const CAMPOS_PRECARGABLES = [
      'madre_nombre', 'madre_cedula', 'madre_tlf_whatsapp',
      'padre_nombre', 'padre_cedula', 'padre_tlf_whatsapp',
      'representante_nombre', 'representante_parentesco', 'representante_tlf', 'representante_cedula',
      'correo_representante', 'municipio_residencia', 'sector_calle_numero', 'direccion',
      'nacionalidad', 'centro_estudios', 'grado_nivel', 'instrumento_interes',
      'como_se_entero', 'ubicacion_maps_url',
    ]

    const camposDisponibles = CAMPOS_PRECARGABLES.filter(k => {
      const enAlumno = alumno[k]
      const enPostulante = postulante[k]
      return (!enAlumno || enAlumno === '') && enPostulante && enPostulante !== ''
    })

    const filas = CAMPOS_PRECARGABLES.map(k => {
      const vAlumno = alumno[k]
      const vPost = postulante[k]
      const tieneDato = vPost && vPost !== ''
      const yaLleno = vAlumno && vAlumno !== ''
      if (!tieneDato) return ''
      return `<tr class="${yaLleno ? '' : 'table-warning'}">
        <td class="small fw-semibold">${escapeHTML(k.replace(/_/g, ' '))}</td>
        <td class="small">${escapeHTML(String(vPost))}</td>
        <td class="small text-muted">${yaLleno ? escapeHTML(String(vAlumno)) : '<em>vacío</em>'}</td>
        <td class="text-center">${yaLleno ? '' : '<i class="bi bi-arrow-left-circle text-warning"></i>'}</td>
      </tr>`
    }).filter(Boolean).join('')

    panel.innerHTML = `
      <div class="card border-warning shadow-sm mb-4">
        <div class="card-header d-flex align-items-center gap-2 bg-warning bg-opacity-10">
          <i class="bi bi-person-check text-warning fs-5"></i>
          <div class="flex-grow-1">
            <div class="fw-bold small">Postulante encontrado: ${escapeHTML(postulante.nombre_completo || '')}</div>
            <div class="text-muted" style="font-size:0.72rem">Estado: ${escapeHTML(postulante.estado || '—')} · ID: ${escapeHTML(postulante.id || '')}</div>
          </div>
          <button class="btn btn-sm btn-outline-secondary" id="btn-close-panel"><i class="bi bi-x"></i></button>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-sm mb-0">
              <thead class="table-light">
                <tr>
                  <th class="small">Campo</th>
                  <th class="small">En postulante</th>
                  <th class="small">En alumno</th>
                  <th class="small text-center">Nuevo</th>
                </tr>
              </thead>
              <tbody>${filas || '<tr><td colspan="4" class="text-center text-muted small py-3">Todos los datos ya están cargados en el alumno.</td></tr>'}</tbody>
            </table>
          </div>
        </div>
        ${camposDisponibles.length > 0 ? `
        <div class="card-footer d-flex justify-content-between align-items-center">
          <span class="small text-muted"><i class="bi bi-arrow-left-circle text-warning me-1"></i>${camposDisponibles.length} campo(s) nuevo(s) disponibles</span>
          <button class="btn btn-sm btn-warning" id="btn-precargar">
            <i class="bi bi-cloud-download me-1"></i>Precargar datos faltantes
          </button>
        </div>` : ''}
      </div>`

    panel.querySelector('#btn-close-panel')?.addEventListener('click', () => panel.innerHTML = '')

    panel.querySelector('#btn-precargar')?.addEventListener('click', async () => {
      const btn = panel.querySelector('#btn-precargar')
      btn.disabled = true
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...'

      try {
        const patch = {}
        camposDisponibles.forEach(k => {
          if (postulante[k]) patch[k] = postulante[k]
        })

        const { error } = await supabase.from('alumnos').update(patch).eq('id', alumno.id)
        if (error) throw error

        Object.assign(alumno, patch)

        panel.innerHTML = `
          <div class="alert alert-success d-flex align-items-center gap-2 mb-4">
            <i class="bi bi-check-circle-fill"></i>
            <span class="small">${camposDisponibles.length} campo(s) precargados correctamente desde postulante. Recargá los tabs para ver los cambios.</span>
            <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel2"><i class="bi bi-x"></i></button>
          </div>`
        panel.querySelector('#btn-close-panel2')?.addEventListener('click', () => panel.innerHTML = '')
      } catch (err) {
        btn.disabled = false
        btn.innerHTML = '<i class="bi bi-cloud-download me-1"></i>Precargar datos faltantes'
        panel.insertAdjacentHTML('beforeend', `
          <div class="alert alert-danger small mt-2">Error al guardar: ${escapeHTML(err.message)}</div>`)
      }
    })

  } catch (err) {
    panel.innerHTML = `
      <div class="alert alert-danger d-flex align-items-center gap-2 mb-4">
        <i class="bi bi-exclamation-triangle"></i>
        <span class="small">Error al buscar postulante: ${escapeHTML(err.message)}</span>
        <button class="btn btn-sm btn-outline-secondary ms-auto" id="btn-close-panel"><i class="bi bi-x"></i></button>
      </div>`
    panel.querySelector('#btn-close-panel')?.addEventListener('click', () => panel.innerHTML = '')
  }
}
