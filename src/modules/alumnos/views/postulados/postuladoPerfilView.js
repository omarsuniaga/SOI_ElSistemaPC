import {
  obtenerPostulante,
  actualizarEstadoPostulante,
  hayConflictoCita,
  agregarNota,
} from '../../api/postulantesApi.js'
import {
  ESTADO_LABELS,
  ESTADO_COLOR,
  accionesDisponibles,
  TRANSICIONES,
} from '../../domain/postuladoStateMachine.js'
import { router } from '../../../../core/router/router.js'
import { guardarBorrador } from '../../../../portal-maestros/components/wizard/draftStorage.js'
import { calcularEdad as calcularEdadDomain } from '../../domain/calcularEdad.js'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PALABRAS_NO_NOMBRE = /\b(alumno|alumna|puede|asistir|depende|transporte|p[uú]blico|propio|padres|amigos|familiares|punta\s*cana|veron|ver[oó]n|bávaro|bavaro|friusa|cortecito|ciudad|pueblo|municipio|sector|calle|avenida|disponibilidad|actividades|limitada|posible|haré|hare|cristiano|evang[eé]lico|cat[oó]lico)\b/i

const DOCS_REQUERIDOS = [
  { id: 'cedula_rep',   label: 'Cédula del representante' },
  { id: 'partida',      label: 'Partida de nacimiento' },
  { id: 'constancia',   label: 'Constancia escolar' },
  { id: 'foto',         label: 'Foto del alumno' },
  { id: 'docs_medicos', label: 'Documentos médicos (si aplica)' },
]

const PIPELINE_MAIN = [
  { id: 'postulado',     label: 'Postulado',      num: 1 },
  { id: 'contactado',    label: 'Contactado',     num: 2 },
  { id: 'cita_agendada', label: 'Cita agendada',  num: 3 },
  { id: 'documentos_ok', label: 'Documentos OK',  num: 4 },
  { id: 'inscrito',      label: 'Inscrito',       num: 5 },
]

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let state = {
  postulante: null,
  cargando: false,
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function esNombrePersona(texto) {
  if (!texto) return false
  const t = texto.trim()
  return t.length >= 4
    && t.length <= 70
    && !t.includes(',')
    && t.split(/\s+/).length <= 5
    && !PALABRAS_NO_NOMBRE.test(t)
    && /[A-ZÁÉÍÓÚÑ]/.test(t)
}

function resolverNombre(p) {
  return [p.nombre_completo, p.madre_nombre, p.padre_nombre, p.representante_nombre]
    .map(v => (v ?? '').trim())
    .find(esNombrePersona) ?? 'Sin nombre registrado'
}

function buildInscripcionDraft(p) {
  return {
    _postulante_id: p.id,
    nombre_completo:       resolverNombre(p),
    fecha_nacimiento:      p.fecha_nacimiento      || '',
    nacionalidad:          p.nacionalidad          || '',
    tiene_pasaporte:       p.tiene_pasaporte       ?? false,
    sabe_leer:             p.sabe_leer             ?? null,
    sabe_escribir:         p.sabe_escribir         ?? null,
    genero:                p.genero                || '',
    como_se_entero:        p.como_se_entero        || '',
    municipio_residencia:  p.municipio_residencia  || '',
    sector_calle_numero:   p.sector_calle_numero   || '',
    direccion:             p.direccion             || '',
    ubicacion_maps_url:    p.ubicacion_maps_url    || '',
    madre_nombre:          p.madre_nombre          || '',
    madre_cedula:          p.madre_cedula          || '',
    madre_tlf_whatsapp:    p.madre_tlf_whatsapp    || '',
    padre_nombre:          p.padre_nombre          || '',
    padre_cedula:          p.padre_cedula          || '',
    padre_tlf_whatsapp:    p.padre_tlf_whatsapp    || '',
    representante_nombre:         p.representante_nombre     || p.madre_nombre || '',
    representante_parentesco:     p.representante_parentesco || '',
    representante_cedula:         p.representante_cedula     || '',
    representante_tlf:            p.representante_tlf || p.telefono_representante || p.madre_tlf_whatsapp || '',
    correo_representante:         p.correo                   || '',
    beneficiario_subsidio_estado: p.beneficiario_subsidio_estado ?? false,
    acepta_pago_600:              p.acepta_pago_600          ?? false,
    instrumento_interes:           p.instrumento_interes          || '',
    tiene_conocimientos_musicales: p.tiene_conocimientos_musicales ?? false,
    instrumento_previo:            p.instrumento_previo           || '',
    nivel_lectura_musical:         p.nivel_lectura_musical        || '',
    interes_musical:               p.interes_musical              || '',
    por_que_unirse:                p.por_que_unirse               || '',
    sentimiento_musica_clasica:    p.sentimiento_musica_clasica   || '',
    musico_favorito:               p.musico_favorito              || '',
    autoriza_fotos_redes: p.autoriza_fotos_redes ?? false,
  }
}

function calcularEdad(fechaNacStr) {
  const edad = calcularEdadDomain(fechaNacStr, { fallback: null })
  if (edad === null) return 'Sin definir'
  return `${edad} años`
}

function formatDateTime(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDate(isoString) {
  if (!isoString) return '-'
  return new Date(isoString).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function buildWaUrl(phone, repNombre, nombreAlumno) {
  const clean = (phone || '').replace(/[^0-9]/g, '')
  const msg = encodeURIComponent(
    `Hola ${repNombre}, le contactamos de *El Sistema Punta Cana*. ` +
    `Hemos recibido la postulación de *${nombreAlumno}* y queremos coordinar el proceso de inscripción. ` +
    `¿Cuándo podría venir a nuestra sede para la entrevista? 🎵`
  )
  return `https://wa.me/${clean}?text=${msg}`
}

function docsKey(id) {
  return `docs_${id}`
}

function loadDocs(postulanteId) {
  try {
    const raw = localStorage.getItem(docsKey(postulanteId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveDocs(postulanteId, checked) {
  localStorage.setItem(docsKey(postulanteId), JSON.stringify(checked))
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export async function renderPostuladoPerfilView(container, params) {
  const id = params?.id
  if (!id) {
    container.innerHTML = `<div class="alert alert-danger m-4">Error: ID de postulante no provisto.</div>`
    return
  }
  await cargarPostulante(container, id)
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

async function cargarPostulante(container, id) {
  state.cargando = true
  container.innerHTML = `
    <div class="d-flex justify-content-center align-items-center" style="min-height:400px">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando perfil...</span>
      </div>
    </div>`

  try {
    state.postulante = await obtenerPostulante(id)
    state.cargando = false

    if (!state.postulante) {
      container.innerHTML = `
        <div class="container py-5 text-center">
          <i class="bi bi-person-x display-1 text-muted"></i>
          <h2 class="mt-3 fw-bold">Postulante no encontrado</h2>
          <p class="text-muted">El postulante con ID "${id}" no existe en el sistema.</p>
          <button class="btn btn-primary rounded-pill px-4 mt-3" id="btn-error-back">
            <i class="bi bi-arrow-left me-1"></i> Volver al listado
          </button>
        </div>`
      document.getElementById('btn-error-back')?.addEventListener('click', () => router.navigate('postulados'))
      return
    }

    renderContent(container)
  } catch (err) {
    state.cargando = false
    container.innerHTML = `
      <div class="container py-5 text-center">
        <div class="alert alert-danger p-4 rounded-3">
          <i class="bi bi-exclamation-triangle-fill fs-1 mb-2 d-block"></i>
          <h4 class="fw-bold">Error al cargar perfil</h4>
          <p>${err.message}</p>
          <button class="btn btn-primary rounded-pill px-4 mt-2" id="btn-error-retry">
            <i class="bi bi-arrow-clockwise me-1"></i> Reintentar
          </button>
        </div>
      </div>`
    document.getElementById('btn-error-retry')?.addEventListener('click', () => cargarPostulante(container, id))
  }
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function renderContent(container) {
  const p = state.postulante
  const estado = p.estado || 'postulado'
  const nombreAlumno = resolverNombre(p)
  const repNombre = p.representante_nombre || p.madre_nombre || 'Representante'
  const badgeColor = ESTADO_COLOR[estado] || 'secondary'
  const label = ESTADO_LABELS[estado] || 'Postulado'

  container.innerHTML = `
    <div class="container-fluid py-3 px-3 px-md-4">

      <!-- TOP BAR -->
      <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
        <button class="btn btn-link text-decoration-none ps-0 text-secondary" id="btn-back-list">
          <i class="bi bi-arrow-left me-1"></i> Volver a Postulados
        </button>
        <div class="d-flex gap-2 flex-wrap">
          ${p.madre_tlf_whatsapp ? `
            <a href="${buildWaUrl(p.madre_tlf_whatsapp, repNombre, nombreAlumno)}"
               target="_blank" rel="noopener"
               class="btn btn-outline-success btn-sm rounded-pill">
              <i class="bi bi-whatsapp me-1"></i> WhatsApp Madre
            </a>` : ''}
          ${p.padre_tlf_whatsapp ? `
            <a href="${buildWaUrl(p.padre_tlf_whatsapp, repNombre, nombreAlumno)}"
               target="_blank" rel="noopener"
               class="btn btn-outline-success btn-sm rounded-pill">
              <i class="bi bi-whatsapp me-1"></i> WhatsApp Padre
            </a>` : ''}
        </div>
      </div>

      <!-- NAME + BADGE -->
      <div class="mb-3">
        <h4 class="fw-bold mb-1">${nombreAlumno}
          <span class="badge bg-${badgeColor} ms-2 fs-6 align-middle">${label}</span>
        </h4>
        <p class="text-muted small mb-0">
          ${p.instrumento_interes || p.instrumento || ''}
          ${p.instrumento_interes || p.instrumento ? '·' : ''}
          Postulado el: ${formatDate(p.created_at)}
        </p>
      </div>

      <!-- PIPELINE -->
      <div class="card border-secondary-subtle shadow-sm rounded-3 mb-4">
        <div class="card-body py-3 px-4 overflow-auto">
          ${renderPipeline(estado)}
        </div>
      </div>

      <!-- TWO-COLUMN LAYOUT -->
      <div class="row g-4">

        <!-- LEFT col -->
        <div class="col-lg-7">

          <!-- PROXIMO PASO -->
          <div class="card border-secondary-subtle shadow-sm rounded-3 mb-4" id="card-proximo-paso">
            ${renderProximoPaso(p, estado, repNombre, nombreAlumno)}
          </div>

          <!-- NOTAS DE SEGUIMIENTO -->
          <div class="card border-secondary-subtle shadow-sm rounded-3">
            <div class="card-header bg-transparent border-0 pt-3 pb-0 px-4">
              <h6 class="fw-bold mb-0"><i class="bi bi-pencil-square me-2 text-primary"></i>Notas de seguimiento</h6>
            </div>
            <div class="card-body px-4 pb-4">
              <textarea class="form-control mb-2" id="textarea-nueva-nota" rows="3"
                placeholder="Agregar nota de seguimiento..."></textarea>
              <button class="btn btn-primary btn-sm rounded-pill px-4 fw-semibold" id="btn-save-note">
                <span class="spinner-border spinner-border-sm d-none me-1" id="save-note-spinner"></span>
                Guardar nota
              </button>
              <div class="mt-4" id="notes-timeline">
                ${renderNotesTimeline(p)}
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT col -->
        <div class="col-lg-5">

          <!-- DATOS DEL POSTULANTE -->
          <div class="card border-secondary-subtle shadow-sm rounded-3 mb-4">
            <div class="card-header bg-transparent border-0 pt-3 pb-0 px-4">
              <h6 class="fw-bold mb-0"><i class="bi bi-person-lines-fill me-2 text-primary"></i>Datos del postulante</h6>
            </div>
            <div class="card-body px-4 pb-4">
              ${renderDatosCard(p)}
            </div>
          </div>

          <!-- DOCUMENTOS -->
          <div class="card border-secondary-subtle shadow-sm rounded-3">
            <div class="card-header bg-transparent border-0 pt-3 pb-0 px-4">
              <h6 class="fw-bold mb-0"><i class="bi bi-folder-check me-2 text-primary"></i>Documentos</h6>
            </div>
            <div class="card-body px-4 pb-4">
              ${renderDocsChecklist(p.id)}
            </div>
          </div>

        </div>
      </div>
    </div>
  `

  attachEvents(container)
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

function renderPipeline(estadoActual) {
  const sideStates = ['no_show', 'en_espera', 'descartado', 'reprogramado']
  const isSide = sideStates.includes(estadoActual)

  // Map side states to their nearest main step index for highlighting
  const sideToMainIdx = {
    no_show:     2,
    reprogramado: 2,
    en_espera:   3,
    descartado:  -1,
  }

  let currentMainIdx = PIPELINE_MAIN.findIndex(s => s.id === estadoActual)
  if (isSide) currentMainIdx = sideToMainIdx[estadoActual] ?? -1

  return `
    <div class="d-flex align-items-center gap-1 overflow-auto py-1">
      ${PIPELINE_MAIN.map((step, idx) => {
        const isCompleted = idx < currentMainIdx
        const isActive    = idx === currentMainIdx && !isSide
        const isSideHere  = idx === currentMainIdx && isSide

        let circleClass = 'bg-light border border-secondary text-secondary'
        let labelClass  = 'text-secondary'

        if (isCompleted) {
          circleClass = 'bg-success text-white border border-success'
          labelClass  = 'text-success fw-semibold'
        } else if (isActive) {
          const c = ESTADO_COLOR[step.id] || 'primary'
          circleClass = `bg-${c} text-white border border-${c}`
          labelClass  = `text-${c} fw-bold`
        } else if (isSideHere) {
          const c = ESTADO_COLOR[estadoActual] || 'secondary'
          circleClass = `bg-${c} bg-opacity-25 text-${c} border border-${c}`
          labelClass  = `text-${c} fw-semibold`
        }

        const connector = idx < PIPELINE_MAIN.length - 1
          ? `<div class="flex-grow-1 border-top border-secondary-subtle" style="min-width:20px;margin-top:-8px"></div>`
          : ''

        return `
          <div class="d-flex flex-column align-items-center" style="min-width:64px">
            <div class="rounded-circle d-flex align-items-center justify-content-center fw-bold ${circleClass}"
                 style="width:36px;height:36px;font-size:.9rem">
              ${isCompleted ? '<i class="bi bi-check-lg"></i>' : step.num}
            </div>
            <div class="text-center mt-1 small ${labelClass}" style="font-size:.75rem;white-space:nowrap">
              ${step.label}
            </div>
            ${isSideHere ? `<span class="badge bg-${ESTADO_COLOR[estadoActual]} mt-1" style="font-size:.65rem">${ESTADO_LABELS[estadoActual]}</span>` : ''}
          </div>
          ${connector}`
      }).join('')}
    </div>
  `
}

// ---------------------------------------------------------------------------
// Próximo Paso card
// ---------------------------------------------------------------------------

function renderProximoPaso(p, estado, repNombre, nombreAlumno) {
  const color = ESTADO_COLOR[estado] || 'secondary'

  switch (estado) {

    case 'postulado':
      return `
        <div class="card-header bg-${color} bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-${color}"><i class="bi bi-telephone-outbound me-2"></i>Próximo paso: Contactar a la familia</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">El representante aún no ha sido contactado. Iniciá la comunicación por WhatsApp.</p>
          <div class="d-flex flex-wrap gap-2 mb-3">
            ${p.madre_tlf_whatsapp ? `
              <a href="${buildWaUrl(p.madre_tlf_whatsapp, repNombre, nombreAlumno)}"
                 target="_blank" rel="noopener"
                 class="btn btn-success btn-sm rounded-pill">
                <i class="bi bi-whatsapp me-1"></i> WhatsApp Madre
              </a>` : ''}
            ${p.padre_tlf_whatsapp ? `
              <a href="${buildWaUrl(p.padre_tlf_whatsapp, repNombre, nombreAlumno)}"
                 target="_blank" rel="noopener"
                 class="btn btn-success btn-sm rounded-pill">
                <i class="bi bi-whatsapp me-1"></i> WhatsApp Padre
              </a>` : ''}
          </div>
          <button class="btn btn-outline-${color} btn-sm rounded-pill fw-semibold" id="btn-accion-contactado">
            <i class="bi bi-check-lg me-1"></i> Marcar como Contactado
          </button>
        </div>`

    case 'contactado':
      return `
        <div class="card-header bg-${color} bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-${color}"><i class="bi bi-calendar-plus me-2"></i>Próximo paso: Agendar cita presencial</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">Ya hubo contacto. Coordiná una fecha y hora para la entrevista de inscripción.</p>
          <div class="mb-3">
            <label class="form-label fw-semibold small">Fecha y hora de la cita</label>
            <input type="datetime-local" class="form-control" id="input-fecha-cita">
            <div class="form-text">El sistema validará conflictos con otras citas (±30 min).</div>
          </div>
          <button class="btn btn-${color} btn-sm rounded-pill fw-semibold" id="btn-accion-cita-agendada">
            <span class="spinner-border spinner-border-sm d-none me-1" id="spinner-cita"></span>
            <i class="bi bi-calendar-check me-1"></i> Confirmar cita
          </button>
          <div class="alert alert-danger mt-2 d-none" id="cita-inline-error"></div>
        </div>`

    case 'cita_agendada': {
      const fechaStr = p.fecha_cita ? formatDateTime(p.fecha_cita) : 'Sin fecha registrada'
      return `
        <div class="card-header bg-${color} bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-${color}"><i class="bi bi-calendar-event me-2"></i>Cita agendada para: ${fechaStr}</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">El día de la cita, confirmá si el representante llegó y revisá los documentos.</p>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-success btn-sm rounded-pill fw-semibold" id="btn-accion-documentos-ok">
              <i class="bi bi-check2-circle me-1"></i> Llegó — revisar documentos
            </button>
            <button class="btn btn-outline-danger btn-sm rounded-pill" id="btn-accion-no-show">
              <i class="bi bi-calendar-x me-1"></i> No se presentó
            </button>
          </div>
        </div>`
    }

    case 'documentos_ok':
      return `
        <div class="card-header bg-${color} bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-${color}"><i class="bi bi-check-circle me-2"></i>¡Listo para inscribir!</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">Toda la documentación fue verificada. Podés iniciar el proceso formal de inscripción.</p>
          <button class="btn btn-success rounded-pill fw-semibold px-4" id="btn-accion-inscribir">
            <i class="bi bi-mortarboard-fill me-2"></i> Iniciar inscripción
          </button>
        </div>`

    case 'no_show':
      return `
        <div class="card-header bg-${color} bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-${color}"><i class="bi bi-calendar-x me-2"></i>No se presentó a la cita</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">Podés reprogramar una nueva fecha o descartar la postulación.</p>
          <div class="mb-3">
            <label class="form-label fw-semibold small">Nueva fecha de cita</label>
            <input type="datetime-local" class="form-control" id="input-fecha-reprogramar">
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-warning btn-sm rounded-pill fw-semibold" id="btn-accion-reprogramar">
              <span class="spinner-border spinner-border-sm d-none me-1" id="spinner-reprogramar"></span>
              <i class="bi bi-arrow-clockwise me-1"></i> Reprogramar cita
            </button>
            <button class="btn btn-outline-dark btn-sm rounded-pill" id="btn-accion-descartar">
              <i class="bi bi-person-x me-1"></i> Descartar
            </button>
          </div>
        </div>`

    case 'en_espera':
      return `
        <div class="card-header bg-${color} bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-${color}"><i class="bi bi-hourglass-split me-2"></i>En lista de espera</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">No hay cupo disponible actualmente. Cuando se libere un lugar, avisales.</p>
          <div class="mb-3">
            <label class="form-label fw-semibold small">Fecha y hora de la nueva cita</label>
            <input type="datetime-local" class="form-control" id="input-fecha-espera">
          </div>
          <button class="btn btn-primary btn-sm rounded-pill fw-semibold" id="btn-accion-espera-cita">
            <span class="spinner-border spinner-border-sm d-none me-1" id="spinner-espera"></span>
            <i class="bi bi-calendar-plus me-1"></i> Disponible — agendar cita
          </button>
          <div class="alert alert-danger mt-2 d-none" id="espera-cita-error"></div>
        </div>`

    case 'inscrito':
      return `
        <div class="card-header bg-success bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-success"><i class="bi bi-person-check-fill me-2"></i>Alumno inscrito</h6>
        </div>
        <div class="card-body px-4 pb-4">
          <p class="text-muted small mb-3">El proceso fue completado exitosamente.</p>
          ${p.alumno_id ? `
            <button class="btn btn-outline-success btn-sm rounded-pill" id="btn-ver-alumno">
              Ver perfil del alumno <i class="bi bi-arrow-right ms-1"></i>
            </button>` : '<p class="text-muted small">Sin perfil de alumno vinculado.</p>'}
        </div>`

    case 'descartado': {
      const motivo = (p.notas_seguimiento || '').split('\n').find(l => l.toLowerCase().includes('descart')) || ''
      return `
        <div class="card-header bg-dark bg-opacity-10 border-0 pt-3 pb-0 px-4">
          <h6 class="fw-bold text-secondary"><i class="bi bi-person-dash me-2"></i>Postulación descartada</h6>
        </div>
        <div class="card-body px-4 pb-4">
          ${motivo ? `<p class="text-muted small mb-0">${motivo}</p>` : '<p class="text-muted small mb-0">Sin motivo registrado.</p>'}
        </div>`
    }

    default:
      return `
        <div class="card-body px-4 py-4">
          <p class="text-muted small mb-0">Estado desconocido: <code>${estado}</code></p>
        </div>`
  }
}

// ---------------------------------------------------------------------------
// Datos card
// ---------------------------------------------------------------------------

function renderDatosCard(p) {
  const row = (label, val) => {
    const display = val != null && val !== ''
      ? `<span class="fw-medium">${val}</span>`
      : `<span class="text-muted fst-italic">Sin definir</span>`
    return `
      <div class="d-flex justify-content-between py-1 border-bottom border-light">
        <span class="text-muted small">${label}</span>
        <span class="small text-end">${display}</span>
      </div>`
  }

  const repNombre = p.representante_nombre || p.nombre_representante || ''
  const repParentesco = p.representante_parentesco || ''
  const repDisplay = [repNombre, repParentesco].filter(Boolean).join(' · ')

  return `
    ${row('Instrumento', p.instrumento_interes || p.instrumento)}
    ${row('Edad', calcularEdad(p.fecha_nacimiento))}
    ${row('Municipio', p.municipio_residencia)}
    ${row('Madre', [p.madre_nombre, p.madre_tlf_whatsapp].filter(Boolean).join(' — '))}
    ${row('Padre', [p.padre_nombre, p.padre_tlf_whatsapp].filter(Boolean).join(' — '))}
    ${row('Representante', repDisplay)}
    ${row('Correo', p.correo)}
    ${row('Postulado el', formatDate(p.created_at))}
  `
}

// ---------------------------------------------------------------------------
// Docs checklist
// ---------------------------------------------------------------------------

function renderDocsChecklist(postulanteId) {
  const checked = loadDocs(postulanteId)
  return DOCS_REQUERIDOS.map(doc => `
    <div class="form-check mb-2">
      <input class="form-check-input doc-check" type="checkbox"
             id="doc-${doc.id}" data-doc-id="${doc.id}"
             ${checked[doc.id] ? 'checked' : ''}>
      <label class="form-check-label small" for="doc-${doc.id}">${doc.label}</label>
    </div>
  `).join('')
}

// ---------------------------------------------------------------------------
// Notes timeline
// ---------------------------------------------------------------------------

function renderNotesTimeline(p) {
  const notasText = p.notas_seguimiento || p.notes || ''
  const lines = notasText.split('\n').filter(l => l.trim())

  if (lines.length === 0) {
    return `<p class="text-muted small fst-italic">Sin notas registradas.</p>`
  }

  return `
    <h6 class="fw-bold small text-secondary text-uppercase mb-2">Historial</h6>
    ${lines.map(nota => `
      <div class="d-flex gap-2 mb-2 pb-2 border-bottom border-light">
        <div class="mt-1 rounded-circle bg-primary flex-shrink-0" style="width:8px;height:8px"></div>
        <p class="small mb-0">${nota}</p>
      </div>`).join('')}
  `
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

function attachEvents(container) {
  const p = state.postulante
  const id = p.id
  const estado = p.estado || 'postulado'

  // Back
  container.querySelector('#btn-back-list')?.addEventListener('click', () => {
    window.router?.navigate('postulados') ?? router.navigate('postulados')
  })

  // Ver perfil alumno
  container.querySelector('#btn-ver-alumno')?.addEventListener('click', () => {
    window.router?.navigate('alumno', { id: p.alumno_id }) ?? router.navigate('alumno', { id: p.alumno_id })
  })

  // Docs checkboxes
  container.querySelectorAll('.doc-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = loadDocs(id)
      const docId = cb.getAttribute('data-doc-id')
      if (cb.checked) {
        checked[docId] = true
      } else {
        delete checked[docId]
      }
      saveDocs(id, checked)
    })
  })

  // Save note
  container.querySelector('#btn-save-note')?.addEventListener('click', async () => {
    const textarea = container.querySelector('#textarea-nueva-nota')
    const note = (textarea?.value || '').trim()
    if (!note) return

    const btn = container.querySelector('#btn-save-note')
    const spinner = container.querySelector('#save-note-spinner')

    try {
      btn.disabled = true
      spinner?.classList.remove('d-none')
      const updated = await agregarNota(id, note)
      state.postulante = updated
      textarea.value = ''
      // Refresh only the notes section
      const timelineEl = container.querySelector('#notes-timeline')
      if (timelineEl) timelineEl.innerHTML = renderNotesTimeline(state.postulante)
    } catch (err) {
      alert(`Error al agregar nota: ${err.message}`)
    } finally {
      btn.disabled = false
      spinner?.classList.add('d-none')
    }
  })

  // ── STATE ACTIONS ─────────────────────────────────────────────────────────

  // Marcar como contactado
  container.querySelector('#btn-accion-contactado')?.addEventListener('click', async () => {
    try {
      const updated = await actualizarEstadoPostulante(id, 'contactado', {
        notas_seguimiento: 'Contacto iniciado vía WhatsApp.',
      })
      state.postulante = updated
      renderContent(container)
    } catch (err) {
      alert(`Error al cambiar estado: ${err.message}`)
    }
  })

  // Confirmar cita (contactado → cita_agendada)
  container.querySelector('#btn-accion-cita-agendada')?.addEventListener('click', async () => {
    const input = container.querySelector('#input-fecha-cita')
    const errorEl = container.querySelector('#cita-inline-error')
    const btn = container.querySelector('#btn-accion-cita-agendada')
    const spinner = container.querySelector('#spinner-cita')

    if (!input?.value) {
      errorEl?.classList.remove('d-none')
      if (errorEl) errorEl.textContent = 'Debe seleccionar una fecha y hora.'
      return
    }

    try {
      btn.disabled = true
      spinner?.classList.remove('d-none')
      errorEl?.classList.add('d-none')

      const isoDate = new Date(input.value).toISOString()
      const conflicto = await hayConflictoCita(isoDate, id)
      if (conflicto) {
        errorEl?.classList.remove('d-none')
        if (errorEl) errorEl.textContent = 'Conflicto: ya existe otra cita en un rango de ±30 minutos.'
        return
      }

      const updated = await actualizarEstadoPostulante(id, 'cita_agendada', {
        fecha_cita: isoDate,
        notas_seguimiento: `Cita agendada para: ${formatDateTime(isoDate)}`,
      })
      state.postulante = updated
      renderContent(container)
    } catch (err) {
      alert(`Error al agendar cita: ${err.message}`)
    } finally {
      btn.disabled = false
      spinner?.classList.add('d-none')
    }
  })

  // Llegó — documentos OK
  container.querySelector('#btn-accion-documentos-ok')?.addEventListener('click', async () => {
    try {
      const updated = await actualizarEstadoPostulante(id, 'documentos_ok', {
        notas_seguimiento: 'Representante presente. Documentación revisada.',
      })
      state.postulante = updated
      renderContent(container)
    } catch (err) {
      alert(`Error al actualizar estado: ${err.message}`)
    }
  })

  // No se presentó → no_show
  container.querySelector('#btn-accion-no-show')?.addEventListener('click', async () => {
    try {
      const updated = await actualizarEstadoPostulante(id, 'no_show', {
        notas_seguimiento: 'No se presentó a la cita agendada.',
      })
      state.postulante = updated
      renderContent(container)
    } catch (err) {
      alert(`Error al actualizar estado: ${err.message}`)
    }
  })

  // Iniciar inscripción
  container.querySelector('#btn-accion-inscribir')?.addEventListener('click', () => {
    const draft = buildInscripcionDraft(p)
    guardarBorrador(draft)
    window.router?.navigate('alumnos-inscribir') ?? router.navigate('alumnos-inscribir')
  })

  // Reprogramar cita (no_show → reprogramado → cita_agendada)
  container.querySelector('#btn-accion-reprogramar')?.addEventListener('click', async () => {
    const input = container.querySelector('#input-fecha-reprogramar')
    const btn = container.querySelector('#btn-accion-reprogramar')
    const spinner = container.querySelector('#spinner-reprogramar')

    if (!input?.value) {
      alert('Seleccioná una nueva fecha para la cita.')
      return
    }

    try {
      btn.disabled = true
      spinner?.classList.remove('d-none')

      const isoDate = new Date(input.value).toISOString()
      const conflicto = await hayConflictoCita(isoDate, id)
      if (conflicto) {
        alert('Conflicto: ya existe otra cita en un rango de ±30 minutos.')
        return
      }

      // Transition: no_show → reprogramado first (if valid), then reprogramado → cita_agendada
      // The state machine allows no_show → reprogramado → cita_agendada
      let updated = await actualizarEstadoPostulante(id, 'reprogramado', {
        notas_seguimiento: `Cita reprogramada para: ${formatDateTime(isoDate)}`,
      })
      updated = await actualizarEstadoPostulante(id, 'cita_agendada', {
        fecha_cita: isoDate,
        notas_seguimiento: `Nueva cita agendada: ${formatDateTime(isoDate)}`,
      })
      state.postulante = updated
      renderContent(container)
    } catch (err) {
      alert(`Error al reprogramar: ${err.message}`)
    } finally {
      btn.disabled = false
      spinner?.classList.add('d-none')
    }
  })

  // Descartar desde no_show
  container.querySelector('#btn-accion-descartar')?.addEventListener('click', async () => {
    const razon = prompt('Indicá la razón del descarte:')
    if (razon === null) return // cancelled
    try {
      const updated = await actualizarEstadoPostulante(id, 'descartado', {
        notas_seguimiento: `Postulación descartada. Razón: ${razon || 'Sin detallar'}`,
      })
      state.postulante = updated
      renderContent(container)
    } catch (err) {
      alert(`Error al descartar: ${err.message}`)
    }
  })

  // En espera → cita_agendada
  container.querySelector('#btn-accion-espera-cita')?.addEventListener('click', async () => {
    const input = container.querySelector('#input-fecha-espera')
    const errorEl = container.querySelector('#espera-cita-error')
    const btn = container.querySelector('#btn-accion-espera-cita')
    const spinner = container.querySelector('#spinner-espera')

    if (!input?.value) {
      errorEl?.classList.remove('d-none')
      if (errorEl) errorEl.textContent = 'Seleccioná una fecha para la cita.'
      return
    }

    try {
      btn.disabled = true
      spinner?.classList.remove('d-none')
      errorEl?.classList.add('d-none')

      const isoDate = new Date(input.value).toISOString()
      const conflicto = await hayConflictoCita(isoDate, id)
      if (conflicto) {
        errorEl?.classList.remove('d-none')
        if (errorEl) errorEl.textContent = 'Conflicto: ya existe otra cita en ±30 minutos.'
        return
      }

      const updated = await actualizarEstadoPostulante(id, 'cita_agendada', {
        fecha_cita: isoDate,
        notas_seguimiento: `Cita agendada desde lista de espera: ${formatDateTime(isoDate)}`,
      })
      state.postulante = updated
      renderContent(container)
    } catch (err) {
      alert(`Error al agendar cita: ${err.message}`)
    } finally {
      btn.disabled = false
      spinner?.classList.add('d-none')
    }
  })
}
