import { AppModal } from '../../../shared/components/AppModal.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { obtenerAlumno, actualizarAlumno, PARENTESCOS } from '../api/alumnosApi.js'

function parentescoOptions(selected) {
  return PARENTESCOS.map(
    (p) =>
      `<option value="${p.value}" ${p.value === selected ? 'selected' : ''}>${p.label}</option>`,
  ).join('')
}

function buildForm(alumno) {
  const a = alumno || {}
  return `<form class="row g-3">
    <div class="col-12">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-person me-1 text-primary"></i>Datos del Alumno</h6>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Nombre completo</label>
      <input type="text" class="form-control form-control-sm" id="ed-nombre" value="${a.nombre_completo || ''}" readonly>
    </div>
    <div class="col-md-3">
      <label class="form-label small fw-semibold">Fecha de nacimiento</label>
      <input type="date" class="form-control form-control-sm" id="ed-fecha-nacimiento" value="${a.fecha_nacimiento || ''}">
    </div>
    <div class="col-md-2">
      <label class="form-label small fw-semibold">Nacionalidad</label>
      <select class="form-select form-select-sm" id="ed-nacionalidad">
        <option value="">Seleccionar...</option>
        <option value="dominicana" ${a.nacionalidad === 'dominicana' ? 'selected' : ''}>Dominicana</option>
        <option value="extranjero" ${a.nacionalidad === 'extranjero' ? 'selected' : ''}>Extranjero</option>
      </select>
    </div>
    <div class="col-md-3">
      <label class="form-label small fw-semibold">Municipio de residencia</label>
      <input type="text" class="form-control form-control-sm" id="ed-municipio" value="${a.municipio_residencia || ''}">
    </div>
    <div class="col-12">
      <label class="form-label small fw-semibold">Dirección / Sector + Calle + Número</label>
      <input type="text" class="form-control form-control-sm" id="ed-direccion" value="${a.sector_calle_numero || ''}">
    </div>

    <div class="col-12 mt-3">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-person-fill me-1 text-info"></i>Datos de la Madre</h6>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Nombre completo</label>
      <input type="text" class="form-control form-control-sm" id="ed-madre-nombre" value="${a.madre_nombre || ''}">
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Cédula</label>
      <input type="text" class="form-control form-control-sm" id="ed-madre-cedula" value="${a.madre_cedula || ''}">
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Teléfono WhatsApp</label>
      <input type="tel" class="form-control form-control-sm" id="ed-madre-tlf" value="${a.madre_tlf_whatsapp || ''}">
    </div>

    <div class="col-12 mt-3">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-person-fill me-1 text-info"></i>Datos del Padre</h6>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Nombre completo</label>
      <input type="text" class="form-control form-control-sm" id="ed-padre-nombre" value="${a.padre_nombre || ''}">
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Cédula</label>
      <input type="text" class="form-control form-control-sm" id="ed-padre-cedula" value="${a.padre_cedula || ''}">
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Teléfono WhatsApp</label>
      <input type="tel" class="form-control form-control-sm" id="ed-padre-tlf" value="${a.padre_tlf_whatsapp || ''}">
    </div>

    <div class="col-12 mt-3">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-person-badge me-1 text-primary"></i>Representante</h6>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Nombre</label>
      <input type="text" class="form-control form-control-sm" id="ed-rep-nombre" value="${a.representante_nombre || ''}">
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Parentesco</label>
      <select class="form-select form-select-sm" id="ed-rep-parentesco">
        ${parentescoOptions(a.representante_parentesco)}
      </select>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Teléfono</label>
      <input type="tel" class="form-control form-control-sm" id="ed-rep-tlf" value="${a.representante_tlf || ''}">
    </div>

    <div class="col-12 mt-3">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-music-note-beamed me-1 text-success"></i>Perfil Musical</h6>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Interés musical</label>
      <select class="form-select form-select-sm" id="ed-interes">
        <option value="">Seleccionar...</option>
        <option value="cantar" ${a.interes_musical === 'cantar' ? 'selected' : ''}>Cantar</option>
        <option value="instrumento" ${a.interes_musical === 'instrumento' ? 'selected' : ''}>Instrumento</option>
        <option value="ambas" ${a.interes_musical === 'ambas' ? 'selected' : ''}>Ambas</option>
      </select>
    </div>
    <div class="col-md-4">
      <label class="form-label small fw-semibold">Instrumento de interés</label>
      <input type="text" class="form-control form-control-sm" id="ed-instrumento" value="${a.instrumento_interes || ''}">
    </div>
    <div class="col-md-4">
      <label class="form-check form-switch pt-4">
        <input class="form-check-input" type="checkbox" id="ed-conocimientos" ${a.tiene_conocimientos_musicales ? 'checked' : ''}>
        <span class="form-check-label small">Tiene conocimientos musicales</span>
      </label>
    </div>

    <div class="col-12 mt-3">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-mortarboard me-1 text-secondary"></i>Datos Escolares</h6>
    </div>
    <div class="col-md-6">
      <label class="form-label small fw-semibold">Centro de estudios</label>
      <input type="text" class="form-control form-control-sm" id="ed-centro-estudios" value="${a.centro_estudios || ''}">
    </div>
    <div class="col-md-6">
      <label class="form-label small fw-semibold">Grado / Nivel</label>
      <input type="text" class="form-control form-control-sm" id="ed-grado" value="${a.grado_nivel || ''}">
    </div>

    <div class="col-12 mt-3">
      <h6 class="border-bottom pb-2 mb-0"><i class="bi bi-check-circle me-1 text-warning"></i>Compromisos</h6>
    </div>
    <div class="col-md-4">
      <label class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="ed-pago-600" ${a.acepta_pago_600 ? 'checked' : ''}>
        <span class="form-check-label small">Acepta aporte RD$600</span>
      </label>
    </div>
    <div class="col-md-4">
      <label class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="ed-fotos-redes" ${a.autoriza_fotos_redes ? 'checked' : ''}>
        <span class="form-check-label small">Autoriza fotos / redes</span>
      </label>
    </div>
    <div class="col-md-4">
      <label class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="ed-beca-4500" ${a.acepta_beca_4500 ? 'checked' : ''}>
        <span class="form-check-label small">Acepta beca RD$4,500</span>
      </label>
    </div>
  </form>`
}

function collectData() {
  const g = (id) => document.getElementById(id)
  const val = (id) => g(id)?.value?.trim() || null
  const chk = (id) => g(id)?.checked ?? false
  const notEmpty = (v) => (v !== null && v !== '' ? v : null)

  return {
    fecha_nacimiento: val('ed-fecha-nacimiento'),
    nacionalidad: val('ed-nacionalidad'),
    municipio_residencia: val('ed-municipio'),
    sector_calle_numero: val('ed-direccion'),
    madre_nombre: val('ed-madre-nombre'),
    madre_cedula: val('ed-madre-cedula'),
    madre_tlf_whatsapp: notEmpty(val('ed-madre-tlf')),
    padre_nombre: val('ed-padre-nombre'),
    padre_cedula: val('ed-padre-cedula'),
    padre_tlf_whatsapp: notEmpty(val('ed-padre-tlf')),
    representante_nombre: val('ed-rep-nombre'),
    representante_parentesco: val('ed-rep-parentesco'),
    representante_tlf: notEmpty(val('ed-rep-tlf')),
    interes_musical: val('ed-interes'),
    instrumento_interes: val('ed-instrumento'),
    tiene_conocimientos_musicales: chk('ed-conocimientos'),
    centro_estudios: val('ed-centro-estudios'),
    grado_nivel: val('ed-grado'),
    acepta_pago_600: chk('ed-pago-600'),
    autoriza_fotos_redes: chk('ed-fotos-redes'),
    acepta_beca_4500: chk('ed-beca-4500'),
  }
}

export async function openEditAlumnoModal(alumnoId, { onSaved } = {}) {
  let alumno
  try {
    alumno = await obtenerAlumno(alumnoId)
  } catch (err) {
    AppToast.error('Error al cargar datos del alumno')
    return
  }

  AppModal.open({
    title: `Editar: ${alumno.nombre_completo || 'Alumno'}`,
    size: 'xl',
    saveText: 'Guardar cambios',
    body: buildForm(alumno),
    onSave: async () => {
      try {
        const datos = collectData()
        await actualizarAlumno(alumnoId, datos)
        AppToast.success('Alumno actualizado correctamente')
        if (onSaved) onSaved()
      } catch (err) {
        AppToast.error(err.message || 'Error al guardar los cambios')
        return false
      }
    },
  })
}
