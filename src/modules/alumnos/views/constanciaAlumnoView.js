import { router } from '../../../core/router/router.js'
import { obtenerAlumno, obtenerInscripcionesDetalladasAlumno } from '../api/alumnosApi.js'
import { certificateDefaults, certificateToday, validateCertificate } from '../domain/certificateData.js'
import { descargarConstancia, generarConstanciaEstudios } from '../domain/generarPdfInscripcion.js'
import { escapeHTML } from '../utils/alumnosUtils.js'

const labels = {
  nombre_completo: 'Nombre completo del alumno', fecha_nacimiento: 'Fecha de nacimiento (opcional)',
  nacionalidad: 'Nacionalidad (opcional)', fecha_ingreso: 'Fecha real de ingreso a El Sistema Punta Cana',
  formacion: 'Instrumento o programa que cursa', representante_nombre: 'Nombre del padre, madre o representante',
  representante_parentesco: 'Parentesco con el alumno', representante_cedula: 'Documento de identidad del representante',
}

export const renderConstanciaInscripcionView = (container, params) => renderCertificate(container, params, 'inscripcion')
export const renderConstanciaEstudiosView = (container, params) => renderCertificate(container, params, 'estudios')

async function renderCertificate(container, params = {}, type) {
  const title = type === 'inscripcion' ? 'Constancia de inscripción' : 'Constancia de estudios'
  container.innerHTML = '<p class="p-4" role="status">Cargando datos del alumno…</p>'
  if (!params.id) {
    container.innerHTML = '<p class="alert alert-danger m-4">Selecciona primero un alumno desde su perfil.</p>'
    return
  }
  try {
    const [alumno, clases] = await Promise.all([
      obtenerAlumno(params.id), obtenerInscripcionesDetalladasAlumno(params.id),
    ])
    if (!alumno) throw new Error('Alumno no encontrado.')
    if (alumno.activo === false) {
      container.innerHTML = '<p class="alert alert-warning m-4">El alumno figura inactivo. Revisa su situación en el perfil antes de emitir una constancia de inscripción o de estudios actuales.</p>'
      return
    }
    const defaults = certificateDefaults(alumno, clases)
    const fields = Object.keys(defaults).filter(field => type === 'inscripcion' || !field.startsWith('representante_'))
    const optional = new Set(['fecha_nacimiento', 'nacionalidad'])
    container.innerHTML = `
      <section class="container py-4" style="max-width:900px">
        <a class="btn btn-link ps-0 mb-3" data-back href="${router._portalPrefix}/alumnos/${encodeURIComponent(alumno.id)}">Volver al perfil</a>
        <h1 class="h4">${title}</h1>
        <p>${type === 'inscripcion'
          ? 'Documento para que el padre, madre o representante firme la aceptación de la beca y el compromiso de pagar el aporte restante.'
          : 'Documento institucional que acredita la pertenencia del alumno, su fecha de ingreso y la formación musical que cursa.'}</p>
        <p class="text-muted">Revisa y completa los datos antes de generar. Los ajustes de esta pantalla se usan solo en la constancia; no modifican el perfil del alumno.</p>
        <form class="card card-body" novalidate>
          <div class="row g-3">${fields.map(field => `
            <div class="col-12 col-md-6">
              <label class="form-label" for="certificate-${field}">${labels[field]}${optional.has(field) ? '' : ' *'}</label>
              <input class="form-control" id="certificate-${field}" name="${field}" maxlength="200"
                type="${field.startsWith('fecha_') ? 'date' : 'text'}" ${field.startsWith('fecha_') ? `max="${certificateToday()}"` : ''}
                ${optional.has(field) ? '' : 'required'} value="${escapeHTML(defaults[field])}" aria-describedby="error-${field}">
              <div class="invalid-feedback" id="error-${field}"></div>
            </div>`).join('')}</div>
          <p class="small text-muted mt-3">La fecha de ingreso debe corresponder al inicio real del alumno en la institución. Para coro o iniciación, indica el programa en el campo de formación.</p>
          <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="certificate-reviewed" required>
            <label class="form-check-label" for="certificate-reviewed">He revisado los datos que aparecerán en la constancia.</label>
          </div>
          <p role="alert" data-message class="text-danger"></p>
          <button class="btn btn-primary align-self-start" type="submit">Generar PDF de ${type === 'inscripcion' ? 'inscripción' : 'estudios'}</button>
          <p class="small text-muted mt-3 mb-0">${type === 'inscripcion' ? 'Generar el PDF no registra una aceptación ni una firma. El representante debe firmar el documento impreso.' : 'Documento preparado para firma y sello de la institución.'}</p>
        </form>
      </section>`
    container.querySelector('[data-back]').addEventListener('click', e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      router.navigate(`alumnos/${encodeURIComponent(alumno.id)}`)
    })
    const form = container.querySelector('form')
    form.addEventListener('submit', async event => {
      event.preventDefault()
      const values = Object.fromEntries(fields.map(field => [field, form.elements.namedItem(field).value.trim()]))
      const errors = validateCertificate(values, type)
      for (const field of fields) {
        form.elements.namedItem(field).classList.toggle('is-invalid', Boolean(errors[field]))
        container.querySelector(`#error-${field}`).textContent = errors[field] || ''
      }
      const message = container.querySelector('[data-message]')
      if (Object.keys(errors).length) {
        message.textContent = 'Completa o corrige los campos señalados.'
        form.querySelector('.is-invalid')?.focus()
        return
      }
      if (!container.querySelector('#certificate-reviewed').checked) {
        message.textContent = 'Confirma que revisaste los datos antes de generar.'
        return
      }
      const button = form.querySelector('button[type="submit"]')
      button.disabled = true
      message.textContent = ''
      try {
        const data = { ...alumno, ...values }
        if (type === 'inscripcion') await descargarConstancia(data)
        else {
          const doc = generarConstanciaEstudios(data)
          const name = values.nombre_completo.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')
          doc.save(`constancia-estudios-${name}.pdf`)
        }
      } catch (error) {
        console.error('No se pudo generar la constancia:', error)
        message.textContent = 'No se pudo generar el PDF. Revisa los datos e intenta nuevamente.'
      } finally {
        button.disabled = false
      }
    })
  } catch (error) {
    console.error('No se pudo cargar el alumno:', error)
    container.innerHTML = '<p class="alert alert-danger m-4">No se pudieron cargar los datos del alumno. Vuelve al listado e intenta nuevamente.</p>'
  }
}
