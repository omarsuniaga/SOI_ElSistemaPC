import { AppModal } from '../../../shared/components/AppModal.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { inscribirAlumno, desinscribirAlumno, obtenerAlumnosInscritos, obtenerClase, actualizarTurnoInscripcion } from '../api/clasesApi.js'
import { crearAlumno } from '../../alumnos/api/alumnosApi.js'
import { escapeHTML, getInitials } from '../utils/clasesUtils.js'

export async function openAlumnoInscripcionModal(claseId) {
  AppModal.open({
    title: 'Inscripción de alumnos',
    size: 'lg',
    hideSave: true,
    cancelText: 'Cerrar',
    body: `<div class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></div>`,
  })

  try {
    const [inscritosRaw, todosRes, clase] = await Promise.all([
      obtenerAlumnosInscritos(claseId),
      supabase.from('alumnos').select('*').eq('activo', true).order('nombre_completo', { ascending: true }),
      obtenerClase(claseId)
    ])

    const inscritosIds = new Set(inscritosRaw.map(r => r.alumno_id))
    const inscritos   = inscritosRaw.map(r => r.alumno).filter(Boolean)
    const disponibles = (todosRes.data || []).filter(a => !inscritosIds.has(a.id))

    AppModal.open({
      title: 'Inscripción de alumnos',
      size: 'lg',
      hideSave: true,
      cancelText: 'Cerrar',
      body: _buildBody(inscritos, disponibles, claseId, clase, inscritosRaw),
    })

    requestAnimationFrame(() => _wireEvents(claseId, clase))
  } catch (err) {
    AppModal.open({
      title: 'Error',
      size: 'sm',
      hideSave: true,
      cancelText: 'Cerrar',
      body: `<p class="text-danger">${escapeHTML(err.message)}</p>`,
    })
  }
}

function _buildBody(inscritos, disponibles, claseId, clase, inscritosRaw) {
  const isRotativa = clase?.tipo_clase === 'individual'

  return `
    <div class="input-group mb-3">
      <span class="input-group-text"><i class="bi bi-search"></i></span>
      <input type="text" id="insc-buscar" class="form-control form-control-sm" placeholder="Buscar por nombre o instrumento..." autocomplete="off">
      <button class="btn btn-outline-secondary btn-sm" type="button" id="insc-btn-nuevo" title="Registrar nuevo alumno">
        <i class="bi bi-person-plus"></i> Nuevo
      </button>
    </div>

    <div id="insc-form-nuevo" class="mb-3 p-3 border rounded bg-body-secondary d-none">
      <p class="small fw-semibold mb-2">Registrar nuevo alumno</p>
      <div class="row g-2">
        <div class="col-12">
          <input type="text" id="insc-nuevo-nombre" class="form-control form-control-sm" placeholder="Nombre completo *">
        </div>
        <div class="col-md-6">
          <input type="text" id="insc-nuevo-instrumento" class="form-control form-control-sm" placeholder="Instrumento *">
        </div>
          <div class="col-md-6">
            <input type="tel" id="insc-nuevo-telefono" class="form-control form-control-sm" placeholder="Teléfono representante *">
          </div>
          <div class="col-12 d-flex justify-content-end gap-2 mt-1">
            <button type="button" class="btn btn-sm btn-secondary" id="insc-btn-cancelar-nuevo">Cancelar</button>
            <button type="button" class="btn btn-sm btn-primary" id="insc-btn-guardar-nuevo">
              <i class="bi bi-floppy"></i> Guardar e inscribir
            </button>
          </div>
      </div>
    </div>

    <div class="mb-3">
      <h6 class="fw-semibold mb-2">
        <i class="bi bi-people-fill text-success me-1"></i>
        Inscritos (${inscritos.length})
      </h6>
      <div id="lista-inscritos">
        ${inscritos.length === 0
          ? '<p class="text-muted small mb-0">Sin alumnos inscritos aún.</p>'
          : inscritos.map(a => {
              const inscripcion = inscritosRaw.find(r => r.alumno_id === a.id)
              return _rowInscrito(a, isRotativa, inscripcion?.hora_inicio, inscripcion?.hora_fin)
            }).join('')}
      </div>
    </div>

    <hr class="my-3">

    <div>
      <h6 class="fw-semibold mb-2">
        <i class="bi bi-person-plus-fill text-primary me-1"></i>
        Agregar alumnos (${disponibles.length} disponibles)
      </h6>


      <div id="lista-disponibles" style="max-height: 280px; overflow-y: auto;">
        ${disponibles.length === 0
          ? '<p class="text-muted small mb-0">No quedan alumnos disponibles.</p>'
          : disponibles.map(a => _rowDisponible(a, isRotativa)).join('')}
      </div>

      ${disponibles.length > 0 ? `
      <div class="mt-3 d-flex justify-content-end">
        <button type="button" class="btn btn-primary btn-sm" id="insc-btn-inscribir">
          <i class="bi bi-person-check"></i> Inscribir seleccionados
        </button>
      </div>` : ''}
    </div>
  `
}

function _rowInscrito(a, isRotativa, horaInicio, horaFin) {
  const nombre = escapeHTML(a.nombre_completo || a.nombre || 'Alumno')
  const instrumento = escapeHTML(a.instrumento_principal || '')
  
  let turnoHtml = ''
  if (isRotativa) {
    const timeDisplay = (horaInicio && horaFin) ? `${horaInicio.slice(0,5)} a ${horaFin.slice(0,5)}` : 'Sin turno'
    turnoHtml = `
      <div class="d-flex align-items-center gap-2 ms-auto me-3 turno-container">
        <span class="badge bg-secondary turno-display"><i class="bi bi-clock"></i> ${timeDisplay}</span>
        <div class="turno-edit-form d-none d-flex gap-1">
          <input type="time" class="form-control form-control-sm" style="width: 80px;" value="${horaInicio ? horaInicio.slice(0,5) : ''}">
          <input type="time" class="form-control form-control-sm" style="width: 80px;" value="${horaFin ? horaFin.slice(0,5) : ''}">
          <button class="btn btn-sm btn-success btn-guardar-turno" data-alumno-id="${a.id}"><i class="bi bi-check2"></i></button>
          <button class="btn btn-sm btn-light btn-cancelar-turno"><i class="bi bi-x"></i></button>
        </div>
        <button class="btn btn-sm btn-link py-0 px-1 text-muted btn-editar-turno" title="Editar turno"><i class="bi bi-pencil-square"></i></button>
      </div>
    `
  }

  return `
    <div class="d-flex align-items-center py-2 border-bottom inscrito-item" 
         data-alumno-id="${a.id}"
         data-name="${nombre.toLowerCase()}"
         data-instrumento="${instrumento.toLowerCase()}">
      <div class="d-flex align-items-center gap-2" style="flex: 1;">
        <div class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold"
             style="width:32px;height:32px;font-size:.75rem;flex-shrink:0">${getInitials(nombre)}</div>
        <div>
          <span class="small fw-semibold d-block lh-1">${nombre}</span>
          ${instrumento ? `<small class="text-muted" style="font-size: 0.7rem;"><i class="bi bi-music-note-beamed"></i> ${instrumento}</small>` : ''}
        </div>
      </div>
      ${turnoHtml}
      <button type="button" class="btn btn-outline-danger btn-sm py-0 desinscribir-btn" data-alumno-id="${a.id}" title="Quitar">
        <i class="bi bi-person-x"></i>
      </button>
    </div>
  `
}

function _rowDisponible(a, isRotativa) {
  const nombre = escapeHTML(a.nombre_completo || a.nombre || 'Alumno')
  const instrumento = escapeHTML(a.instrumento_principal || '')
  
  let turnoHtml = ''
  if (isRotativa) {
    turnoHtml = `
      <div class="d-flex gap-1 ms-auto me-2">
        <input type="time" class="form-control form-control-sm new-hora-inicio" style="width: 80px;" placeholder="Inicio">
        <input type="time" class="form-control form-control-sm new-hora-fin" style="width: 80px;" placeholder="Fin">
      </div>
    `
  }

  return `
    <div class="d-flex align-items-center py-2 border-bottom disponible-item"
           data-alumno-id="${a.id}"
           data-name="${nombre.toLowerCase()}"
           data-instrumento="${instrumento.toLowerCase()}">
      <div class="d-flex align-items-center gap-2 cursor-pointer flex-grow-1" onclick="this.parentElement.querySelector('input[type=checkbox]').click()">
        <input class="form-check-input mt-0 flex-shrink-0" type="checkbox" value="${a.id}" onclick="event.stopPropagation()">
        <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
             style="width:32px;height:32px;font-size:.75rem;flex-shrink:0">${getInitials(nombre)}</div>
        <div>
          <span class="small d-block lh-1">${nombre}</span>
          ${instrumento ? `<small class="text-muted" style="font-size: 0.7rem;"><i class="bi bi-music-note-beamed"></i> ${instrumento}</small>` : ''}
        </div>
      </div>
      ${turnoHtml}
    </div>
  `
}

function _wireEvents(claseId, clase) {
  const isRotativa = clase?.tipo_clase === 'individual'
  // Búsqueda en inscritos y disponibles
  document.getElementById('insc-buscar')?.addEventListener('input', e => {
    const term = e.target.value.toLowerCase()
    
    // Filtrar disponibles
    document.querySelectorAll('.disponible-item').forEach(item => {
      const match = (item.dataset.name || '').includes(term) || (item.dataset.instrumento || '').includes(term)
      item.style.display = match ? '' : 'none'
    })

    // Filtrar inscritos
    document.querySelectorAll('.inscrito-item').forEach(item => {
      const match = (item.dataset.name || '').includes(term) || (item.dataset.instrumento || '').includes(term)
      item.style.display = match ? '' : 'none'
    })
  })

  // Toggle formulario nuevo alumno
  document.getElementById('insc-btn-nuevo')?.addEventListener('click', () => {
    document.getElementById('insc-form-nuevo').classList.remove('d-none')
    document.getElementById('insc-nuevo-nombre').focus()
  })
  document.getElementById('insc-btn-cancelar-nuevo')?.addEventListener('click', _resetNuevoForm)

    document.getElementById('insc-btn-guardar-nuevo')?.addEventListener('click', async () => {
    const nombre      = document.getElementById('insc-nuevo-nombre').value.trim()
    const instrumento = document.getElementById('insc-nuevo-instrumento').value.trim()
    const telefono    = document.getElementById('insc-nuevo-telefono').value.trim()

    if (!nombre || !instrumento || !telefono) {
      alert('Nombre, instrumento y teléfono son obligatorios')
      return
    }

    const btn = document.getElementById('insc-btn-guardar-nuevo')
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>'

    try {
      const nuevoAlumno = await crearAlumno({
        nombre_completo:        nombre,
        instrumento_principal:  instrumento,
        familiar_telefono:      telefono,
        activo:                 true,
      })
      await inscribirAlumno(claseId, nuevoAlumno.id)
      openAlumnoInscripcionModal(claseId)
    } catch (err) {
      alert(err.message)
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-floppy"></i> Guardar e inscribir'
    }
  })

  // Desinscribir
  document.querySelectorAll('.desinscribir-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      const alumnoId = e.currentTarget.dataset.alumnoId
      try {
        await desinscribirAlumno(claseId, alumnoId)
        openAlumnoInscripcionModal(claseId)
      } catch (err) {
        alert(err.message)
      }
    })
  })

  // Editar turnos (si rotativa)
  document.querySelectorAll('.btn-editar-turno').forEach(btn => {
    btn.addEventListener('click', e => {
      const container = e.currentTarget.closest('.turno-container')
      container.querySelector('.turno-display').classList.add('d-none')
      container.querySelector('.turno-edit-form').classList.remove('d-none')
      e.currentTarget.classList.add('d-none')
    })
  })

  document.querySelectorAll('.btn-cancelar-turno').forEach(btn => {
    btn.addEventListener('click', e => {
      const container = e.currentTarget.closest('.turno-container')
      container.querySelector('.turno-display').classList.remove('d-none')
      container.querySelector('.turno-edit-form').classList.add('d-none')
      container.querySelector('.btn-editar-turno').classList.remove('d-none')
    })
  })

  document.querySelectorAll('.btn-guardar-turno').forEach(btn => {
    btn.addEventListener('click', async e => {
      const alumnoId = e.currentTarget.dataset.alumnoId
      const container = e.currentTarget.closest('.turno-container')
      const inputs = container.querySelectorAll('input[type="time"]')
      const horaInicio = inputs[0].value || null
      const horaFin = inputs[1].value || null

      e.currentTarget.disabled = true
      try {
        await actualizarTurnoInscripcion(claseId, alumnoId, horaInicio, horaFin)
        openAlumnoInscripcionModal(claseId)
      } catch (err) {
        alert(err.message)
        e.currentTarget.disabled = false
      }
    })
  })

  // Inscribir seleccionados
  document.getElementById('insc-btn-inscribir')?.addEventListener('click', async () => {
    const checks = [...document.querySelectorAll('#lista-disponibles input[type="checkbox"]:checked')]
    if (!checks.length) { alert('Seleccioná al menos un alumno'); return }

    const btn = document.getElementById('insc-btn-inscribir')
    btn.disabled = true
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Inscribiendo...'

    try {
      for (const cb of checks) {
        let horaInicio = null, horaFin = null
        if (isRotativa) {
          const row = cb.closest('.disponible-item')
          horaInicio = row.querySelector('.new-hora-inicio')?.value || null
          horaFin = row.querySelector('.new-hora-fin')?.value || null
        }
        await inscribirAlumno(claseId, cb.value, horaInicio, horaFin)
      }
      openAlumnoInscripcionModal(claseId)
    } catch (err) {
      alert(err.message)
      btn.disabled = false
      btn.innerHTML = '<i class="bi bi-person-check"></i> Inscribir seleccionados'
    }
  })
}

function _resetNuevoForm() {
  document.getElementById('insc-form-nuevo').classList.add('d-none')
  document.getElementById('insc-nuevo-nombre').value = ''
  document.getElementById('insc-nuevo-instrumento').value = ''
  document.getElementById('insc-nuevo-telefono').value = ''
}
