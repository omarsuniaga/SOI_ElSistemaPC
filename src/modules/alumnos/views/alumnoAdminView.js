import { supabase } from '../../../lib/supabaseClient.js'
import { formatDate, calcularEdad, escapeHTML } from '../utils/alumnosUtils.js'
import { formatPhone, whatsappLink } from '../../../shared/utils/phoneUtils.js'

/**
 * Admin-side student profile view.
 * Receives params as { alumnoId } OR { id } (hash-based navigation compat).
 */
export async function renderAlumnoAdminView(container, params = {}) {
  const alumnoId = params.alumnoId || params.id
  container.innerHTML = `<div class="d-flex justify-content-center align-items-center py-5">
    <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>
  </div>`

  if (!alumnoId) {
    container.innerHTML = `<div class="alert alert-warning m-4">No se especificó el alumno.</div>`
    return
  }

  try {
    const [{ data: alumno, error: alumnoErr }, { data: clases }] = await Promise.all([
      supabase
        .from('alumnos')
        .select('id, nombre_completo, instrumento_principal, tlf_alumno, fecha_nacimiento, created_at, nivel_actual, representante_nombre, representante_tlf, correo_representante, direccion, genero, estado')
        .eq('id', alumnoId)
        .single(),
      supabase
        .from('alumnos_clases')
        .select('clase_id, clases(id, nombre, dia, hora_inicio)')
        .eq('alumno_id', alumnoId)
        .eq('activo', true),
    ])

    if (alumnoErr || !alumno) {
      container.innerHTML = `
        <div class="d-flex flex-column align-items-center py-5 gap-3">
          <i class="bi bi-person-x fs-1 text-muted"></i>
          <p class="text-muted">Alumno no encontrado.</p>
          <button class="btn btn-secondary btn-sm" onclick="window.history.back()">Volver</button>
        </div>`
      return
    }

    const edad = alumno.fecha_nacimiento ? calcularEdad(alumno.fecha_nacimiento) : null
    const iniciales = alumno.nombre_completo
      ? alumno.nombre_completo.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
      : '?'

    const estadoBadge = alumno.estado === 'activo'
      ? '<span class="badge bg-success">Activo</span>'
      : alumno.estado === 'inactivo'
        ? '<span class="badge bg-secondary">Inactivo</span>'
        : `<span class="badge bg-warning text-dark">${escapeHTML(alumno.estado || 'Sin estado')}</span>`

    const clasesHTML = (clases || []).length > 0
      ? (clases || []).map(ac => {
          const c = ac.clases
          if (!c) return ''
          return `<li class="list-group-item d-flex align-items-center gap-2">
            <i class="bi bi-music-note-beamed text-primary"></i>
            <span>${escapeHTML(c.nombre)}</span>
            <small class="text-muted ms-auto">${escapeHTML(c.dia || '')} ${escapeHTML(c.hora_inicio || '')}</small>
          </li>`
        }).join('')
      : `<li class="list-group-item text-muted"><i class="bi bi-info-circle me-2"></i>Sin clases inscritas</li>`

    const waRep = alumno.representante_tlf ? whatsappLink(alumno.representante_tlf) : null
    const waAlumno = alumno.tlf_alumno ? whatsappLink(alumno.tlf_alumno) : null

    container.innerHTML = `
      <div class="container-fluid py-4" style="max-width:860px;">
        <!-- Back button -->
        <button class="btn btn-outline-secondary btn-sm mb-4" id="anv-back-btn">
          <i class="bi bi-arrow-left me-1"></i> Volver
        </button>

        <!-- Header card -->
        <div class="card shadow-sm mb-4">
          <div class="card-body d-flex align-items-center gap-4 flex-wrap">
            <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                 style="width:72px;height:72px;font-size:1.6rem;font-weight:700;">${iniciales}</div>
            <div class="flex-grow-1">
              <h4 class="mb-1">${escapeHTML(alumno.nombre_completo)}</h4>
              <div class="d-flex gap-2 flex-wrap align-items-center">
                ${estadoBadge}
                ${alumno.instrumento_principal ? `<span class="badge bg-light text-dark border"><i class="bi bi-music-note me-1"></i>${escapeHTML(alumno.instrumento_principal)}</span>` : ''}
                ${alumno.nivel_actual ? `<span class="badge bg-info text-dark">${escapeHTML(alumno.nivel_actual)}</span>` : ''}
                ${edad !== null ? `<small class="text-muted">${edad} años</small>` : ''}
              </div>
            </div>
            <div class="text-muted small text-end">
              <div>ID: <code class="user-select-all">${alumno.id}</code></div>
              <div>Inscrito: ${formatDate(alumno.created_at)}</div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Contact info -->
          <div class="col-md-6">
            <div class="card h-100 shadow-sm">
              <div class="card-header"><i class="bi bi-person-lines-fill me-2"></i>Datos del alumno</div>
              <ul class="list-group list-group-flush">
                ${alumno.fecha_nacimiento ? `<li class="list-group-item"><i class="bi bi-calendar me-2 text-muted"></i>${formatDate(alumno.fecha_nacimiento)}</li>` : ''}
                ${alumno.genero ? `<li class="list-group-item"><i class="bi bi-gender-ambiguous me-2 text-muted"></i>${escapeHTML(alumno.genero)}</li>` : ''}
                ${alumno.tlf_alumno ? `<li class="list-group-item">
                  <i class="bi bi-telephone me-2 text-muted"></i>${formatPhone(alumno.tlf_alumno)}
                  ${waAlumno ? `<a href="${waAlumno}" target="_blank" class="btn btn-sm btn-outline-success ms-2 py-0"><i class="bi bi-whatsapp"></i></a>` : ''}
                </li>` : ''}
                ${alumno.direccion ? `<li class="list-group-item"><i class="bi bi-geo-alt me-2 text-muted"></i>${escapeHTML(alumno.direccion)}</li>` : ''}
              </ul>
            </div>
          </div>

          <!-- Representative -->
          <div class="col-md-6">
            <div class="card h-100 shadow-sm">
              <div class="card-header"><i class="bi bi-people me-2"></i>Representante</div>
              <ul class="list-group list-group-flush">
                ${alumno.representante_nombre ? `<li class="list-group-item"><i class="bi bi-person me-2 text-muted"></i>${escapeHTML(alumno.representante_nombre)}</li>` : ''}
                ${alumno.representante_tlf ? `<li class="list-group-item">
                  <i class="bi bi-telephone me-2 text-muted"></i>${formatPhone(alumno.representante_tlf)}
                  ${waRep ? `<a href="${waRep}" target="_blank" class="btn btn-sm btn-outline-success ms-2 py-0"><i class="bi bi-whatsapp"></i></a>` : ''}
                </li>` : ''}
                ${alumno.correo_representante ? `<li class="list-group-item"><i class="bi bi-envelope me-2 text-muted"></i>${escapeHTML(alumno.correo_representante)}</li>` : ''}
                ${!alumno.representante_nombre && !alumno.representante_tlf ? `<li class="list-group-item text-muted">Sin datos de representante</li>` : ''}
              </ul>
            </div>
          </div>

          <!-- Classes -->
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-header"><i class="bi bi-music-note-list me-2"></i>Clases inscritas</div>
              <ul class="list-group list-group-flush">${clasesHTML}</ul>
            </div>
          </div>
        </div>
      </div>`

    container.querySelector('#anv-back-btn')?.addEventListener('click', () => {
      if (window.router) {
        window.router.navigate('alumnos')
      } else {
        window.history.back()
      }
    })
  } catch (err) {
    console.error('[AlumnoAdminView] Error:', err)
    container.innerHTML = `<div class="alert alert-danger m-4">Error al cargar el perfil del alumno: ${escapeHTML(err.message)}</div>`
  }
}
