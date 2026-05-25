import { escHTML } from '../utils/portalUtils.js'
import { normalizePhone } from '../../shared/utils/phoneUtils.js'
import { getPermisos } from '../services/permisoService.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { crearAlumno, validarEmail, validarCedula } from '../../modules/alumnos/api/alumnosApi.js'
import { getMisClases } from '../services/maestroDataService.js'
import { setFieldError, clearAllFieldErrors } from '../utils/a11yUtils.js'

// ─── ESTADO LOCAL ────────────────────────────────────────────
const viewState = {
  maestro: null,
  permisos: null,
  clases: [],
  submitting: false,
  checked: false,
}

// ─── RENDER PRINCIPAL ────────────────────────────────────────
export async function renderRegistroAlumnoView(container) {
  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `
      <div class="pm-settings-empty">
        <i class="bi bi-shield-lock"></i>
        <p>No hay sesión activa. Inicia sesión para continuar.</p>
      </div>`
    return
  }

  viewState.maestro = maestro
  viewState.submitting = false

  // Check permissions
  const permisos = await getPermisos(maestro.id)
  viewState.permisos = permisos
  viewState.checked = true

  if (!permisos.puede_registrar_alumnos) {
    renderSinPermiso(container, permisos, maestro.id)
    return
  }

  // Load teacher's classes
  try {
    const clases = await getMisClases()
    viewState.clases = Array.isArray(clases) ? clases : []
  } catch (err) {
    console.warn('[RegistroAlumno] Error cargando clases:', err.message)
    viewState.clases = []
  }

  renderForm(container)
  initListeners()
  animateSections()
}

// ─── SIN PERMISO ─────────────────────────────────────────────
function renderSinPermiso(container, permisos, maestroId) {
  const solicitudes = permisos?.solicitudes || []
  const solicitudActual = permisos?.solicitud_actual
  const pending =
    solicitudes.includes('alumnos:create') ||
    solicitudes.includes('registrar_alumnos') ||
    (solicitudActual?.estado === 'pendiente' && solicitudActual?.solicita_alumnos)

  container.innerHTML = `
    <div class="pm-settings pm-fade-in registro-alumno-view" role="main" aria-label="Registro de alumnos">
      <div class="pm-settings-empty" style="padding: 4rem 2rem; text-align: center; background: var(--pm-surface-2); border-radius: 16px; border: 1px solid var(--pm-border); max-width: 500px; margin: 2rem auto;">
        <div style="width:80px; height:80px; background:rgba(59,130,246,0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; margin: 0 auto 1.5rem;">
          <i class="bi bi-shield-exclamation" style="font-size:2.5rem; color:var(--pm-primary, #3b82f6);"></i>
        </div>
        <h2 style="font-weight:700; margin-bottom:0.75rem; color: var(--pm-text);">Acceso de Colaborador Requerido</h2>
        <p style="color:var(--pm-text-muted); max-width:400px; margin:0 auto 1.5rem; line-height: 1.5; font-size: 0.9rem;">
          Para poder registrar nuevos alumnos en el sistema y asignarlos a tus clases, necesitás tener activo el permiso de inscripción.
        </p>
        <div id="pm-register-action-container">
          ${pending ? `
            <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); padding: 0.85rem; border-radius: 10px; display: inline-flex; align-items: center; gap: 8px; color: #eab308; font-weight: 600; font-size: 0.85rem;">
              <i class="bi bi-clock-history"></i> Solicitud Pendiente de Aprobación
            </div>
          ` : `
            <button class="btn-apple-primary" id="btn-solicitar-acceso-registro" style="padding: 0.6rem 1.5rem; font-size: 0.9rem;">
              <i class="bi bi-send-fill" style="margin-right: 6px;"></i> Solicitar Permiso de Registro
            </button>
          `}
        </div>
      </div>
    </div>`

  const btn = document.getElementById('btn-solicitar-acceso-registro')
  if (btn) {
    btn.addEventListener('click', async () => {
      btn.disabled = true
      const originalHtml = btn.innerHTML
      btn.innerHTML = `<span class="pm-settings-spinner"></span> Enviando...`

      try {
        const { solicitarPermiso } = await import('../services/permisoService.js')
        await solicitarPermiso(maestroId, 'alumnos:create')
        
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: { message: 'Solicitud de permiso enviada correctamente.', type: 'success' }
        }))

        // Update view state dynamically
        const actionContainer = document.getElementById('pm-register-action-container')
        if (actionContainer) {
          actionContainer.innerHTML = `
            <div style="background: rgba(234, 179, 8, 0.1); border: 1px solid rgba(234, 179, 8, 0.3); padding: 0.85rem; border-radius: 10px; display: inline-flex; align-items: center; gap: 8px; color: #eab308; font-weight: 600; font-size: 0.85rem; animation: pm-error-fade-in 0.3s ease;">
              <i class="bi bi-clock-history"></i> Solicitud Pendiente de Aprobación
            </div>`
        }
      } catch (err) {
        window.dispatchEvent(new CustomEvent('showToast', {
          detail: { message: 'Error al solicitar: ' + err.message, type: 'danger' }
        }))
        btn.disabled = false
        btn.innerHTML = originalHtml
      }
    })
  }
}


// ─── FORMULARIO (APPLE CARD DESIGN) ─────────────────────────
function renderForm(container) {
  container.innerHTML = `
    <div class="pm-settings pm-fade-in registro-alumno-view" role="main" aria-label="Registro de alumnos">
      <header class="pm-settings-header">
        <h1 class="apple-display-md">Registrar Alumno</h1>
        <p class="apple-caption">Completa los datos del nuevo estudiante</p>
      </header>

      <div class="pm-settings-grid" style="grid-template-columns: 1fr;">
        <!-- Datos del Estudiante -->
        <section class="card-apple pm-settings-section" aria-labelledby="alumno-title">
          <div class="pm-settings-section__header">
            <i class="bi bi-person-plus pm-icon-blue" aria-hidden="true"></i>
            <div>
              <h3 id="alumno-title" class="pm-settings-section__title">Datos del Estudiante</h3>
              <p class="pm-settings-section__desc">Información básica del alumno</p>
            </div>
          </div>
          <div class="pm-settings-form-grid" style="grid-template-columns: repeat(2, 1fr);">
            <div class="pm-settings-field" style="grid-column: 1 / -1;">
              <label for="reg-nombre" class="apple-caption">Nombre Completo *</label>
              <input type="text" class="input-apple" id="reg-nombre" placeholder="Nombre y apellidos del alumno" autocomplete="off" maxlength="100">
            </div>
            <div class="pm-settings-field">
              <label for="reg-fecha-nac" class="apple-caption">Fecha de Nacimiento *</label>
              <input type="date" class="input-apple" id="reg-fecha-nac">
            </div>
            <div class="pm-settings-field">
              <label for="reg-instrumento" class="apple-caption">Instrumento Principal *</label>
              <input type="text" class="input-apple" id="reg-instrumento" placeholder="Ej. Violín, Piano..." autocomplete="off" maxlength="100">
            </div>
          </div>
        </section>

        <!-- Representante -->
        <section class="card-apple pm-settings-section" aria-labelledby="representante-title">
          <div class="pm-settings-section__header">
            <i class="bi bi-people pm-icon-teal" aria-hidden="true"></i>
            <div>
              <h3 id="representante-title" class="pm-settings-section__title">Representante</h3>
              <p class="pm-settings-section__desc">Datos del padre, madre o tutor legal</p>
            </div>
          </div>
          <div class="pm-settings-form-grid" style="grid-template-columns: repeat(2, 1fr);">
            <div class="pm-settings-field">
              <label for="reg-rep-nombre" class="apple-caption">Nombre Completo *</label>
              <input type="text" class="input-apple" id="reg-rep-nombre" placeholder="Nombre del representante" autocomplete="off" maxlength="100">
            </div>
            <div class="pm-settings-field">
              <label for="reg-rep-tlf" class="apple-caption">Teléfono *</label>
              <input type="tel" class="input-apple" id="reg-rep-tlf" placeholder="809-000-0000" autocomplete="off" maxlength="20">
            </div>
            <div class="pm-settings-field">
              <label for="reg-rep-cedula" class="apple-caption">Cédula</label>
              <input type="text" class="input-apple" id="reg-rep-cedula" placeholder="000-0000000-0" autocomplete="off" maxlength="20">
            </div>
            <div class="pm-settings-field">
              <label for="reg-rep-email" class="apple-caption">Correo Electrónico</label>
              <input type="email" class="input-apple" id="reg-rep-email" placeholder="correo@ejemplo.com" autocomplete="off" maxlength="100">
            </div>
            <div class="pm-settings-field" style="grid-column: 1 / -1;">
              <label for="reg-direccion" class="apple-caption">Dirección</label>
              <input type="text" class="input-apple" id="reg-direccion" placeholder="Dirección completa del alumno" autocomplete="off" maxlength="255">
            </div>
          </div>
        </section>

        <!-- Asignación de Clase -->
        <section class="card-apple pm-settings-section" aria-labelledby="clase-title">
          <div class="pm-settings-section__header">
            <i class="bi bi-easel pm-icon-amber" aria-hidden="true"></i>
            <div>
              <h3 id="clase-title" class="pm-settings-section__title">Asignar a una Clase</h3>
              <p class="pm-settings-section__desc">Selecciona la clase del alumno (opcional)</p>
            </div>
          </div>
          <div class="pm-settings-form-grid" style="grid-template-columns: 1fr;">
            <div class="pm-settings-field">
              <label for="reg-clase" class="apple-caption">Clase</label>
              <select class="input-apple" id="reg-clase">
                <option value="">Sin clase (solo registro)</option>
                ${viewState.clases.map(c =>
                  `<option value="${escHTML(c.id)}">${escHTML(c.nombre || 'Clase sin nombre')}</option>`
                ).join('')}
              </select>
              ${viewState.clases.length === 0 ? '<p class="apple-caption" style="color:var(--pm-warning); margin-top:0.25rem;"><i class="bi bi-exclamation-triangle"></i> No tienes clases asignadas</p>' : ''}
            </div>
          </div>
        </section>

        <!-- Acciones -->
        <div class="pm-settings-actions" style="gap: 0.75rem;">
          <button class="btn-apple-primary" id="btn-registrar-alumno" style="flex: 1;">
            <i class="bi bi-person-plus-fill" aria-hidden="true"></i>
            <span>Registrar Alumno</span>
          </button>
          <button class="btn-apple-secondary" id="btn-cancelar-registro">
            <i class="bi bi-x-lg" aria-hidden="true"></i>
            <span>Cancelar</span>
          </button>
        </div>
      </div>

    </div>

    <style>
      .input-apple[aria-invalid="true"] {
        border-color: var(--pm-danger, #ef4444);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
      }
      .registro-alumno-view .card-apple {
        background: var(--pm-surface);
        color: var(--pm-text);
        border-color: var(--pm-border);
      }
      .registro-alumno-view .pm-settings-section__title,
      .registro-alumno-view .apple-display-md {
        color: var(--pm-text);
      }
      .registro-alumno-view .input-apple,
      .registro-alumno-view select.input-apple {
        background: var(--pm-surface);
        color: var(--pm-text);
        border-color: var(--pm-border);
      }
      .registro-alumno-view .input-apple::placeholder {
        color: var(--pm-text-muted);
        opacity: .9;
      }
      [data-bs-theme="dark"] .registro-alumno-view .card-apple,
      [data-portal-theme="dark"] .registro-alumno-view .card-apple {
        background: rgba(28, 28, 30, .92);
        border-color: rgba(148, 163, 184, .28);
        box-shadow: 0 18px 45px rgba(0, 0, 0, .24);
      }
      [data-bs-theme="dark"] .registro-alumno-view .input-apple,
      [data-bs-theme="dark"] .registro-alumno-view select.input-apple,
      [data-portal-theme="dark"] .registro-alumno-view .input-apple,
      [data-portal-theme="dark"] .registro-alumno-view select.input-apple {
        background: rgba(15, 23, 42, .72);
        color: var(--pm-text);
        border-color: rgba(148, 163, 184, .35);
      }
      .pm-field-error {
        display: block;
        font-size: 0.75rem;
        color: var(--pm-danger, #ef4444);
        margin-top: 0.25rem;
        font-weight: 500;
        animation: pm-error-fade-in 0.2s ease;
      }
      @keyframes pm-error-fade-in {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>`
}

// ─── VALIDACIÓN CLIENTE ──────────────────────────────────────
function getFormData() {
  const nombre = document.getElementById('reg-nombre')?.value.trim()
  const fechaNac = document.getElementById('reg-fecha-nac')?.value
  const instrumento = document.getElementById('reg-instrumento')?.value.trim()
  const repNombre = document.getElementById('reg-rep-nombre')?.value.trim()
  const repTlf = document.getElementById('reg-rep-tlf')?.value.trim()
  const repCedula = document.getElementById('reg-rep-cedula')?.value.trim()
  const repEmail = document.getElementById('reg-rep-email')?.value.trim()
  const direccion = document.getElementById('reg-direccion')?.value.trim()
  const claseId = document.getElementById('reg-clase')?.value

  return { nombre, fechaNac, instrumento, repNombre, repTlf, repCedula, repEmail, direccion, claseId }
}

function validateForm(data) {
  const errors = [] // { fieldId: string, message: string }

  if (!data.nombre) errors.push({ fieldId: 'reg-nombre', message: 'El nombre del alumno es obligatorio' })
  else if (data.nombre.length < 3) errors.push({ fieldId: 'reg-nombre', message: 'El nombre debe tener al menos 3 caracteres' })
  else if (data.nombre.length > 100) errors.push({ fieldId: 'reg-nombre', message: 'El nombre no puede exceder 100 caracteres' })

  if (!data.fechaNac) errors.push({ fieldId: 'reg-fecha-nac', message: 'La fecha de nacimiento es obligatoria' })
  else {
    const fecha = new Date(data.fechaNac)
    const hoy = new Date()
    if (fecha > hoy) errors.push({ fieldId: 'reg-fecha-nac', message: 'La fecha de nacimiento no puede ser futura' })
    const edad = hoy.getFullYear() - fecha.getFullYear()
    if (edad < 3) errors.push({ fieldId: 'reg-fecha-nac', message: 'El alumno debe tener mínimo 3 años' })
    if (edad > 100) errors.push({ fieldId: 'reg-fecha-nac', message: 'Verifica la fecha de nacimiento' })
  }

  if (!data.instrumento) errors.push({ fieldId: 'reg-instrumento', message: 'El instrumento principal es obligatorio' })
  else if (data.instrumento.length > 100) errors.push({ fieldId: 'reg-instrumento', message: 'El instrumento no puede exceder 100 caracteres' })

  if (!data.repNombre) errors.push({ fieldId: 'reg-rep-nombre', message: 'El nombre del representante es obligatorio' })
  else if (data.repNombre.length > 100) errors.push({ fieldId: 'reg-rep-nombre', message: 'El nombre del representante no puede exceder 100 caracteres' })

  if (!data.repTlf) errors.push({ fieldId: 'reg-rep-tlf', message: 'El teléfono del representante es obligatorio' })
  else if (data.repTlf.length > 20) errors.push({ fieldId: 'reg-rep-tlf', message: 'El teléfono no puede exceder 20 caracteres' })

  if (data.repCedula && data.repCedula.length > 20) errors.push({ fieldId: 'reg-rep-cedula', message: 'La cédula no puede exceder 20 caracteres' })

  if (data.repEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.repEmail)) errors.push({ fieldId: 'reg-rep-email', message: 'El formato del correo electrónico no es válido' })
    else if (data.repEmail.length > 100) errors.push({ fieldId: 'reg-rep-email', message: 'El correo no puede exceder 100 caracteres' })
  }

  if (data.direccion && data.direccion.length > 255) errors.push({ fieldId: 'reg-direccion', message: 'La dirección no puede exceder 255 caracteres' })

  return errors
}

// ─── EVENTOS ─────────────────────────────────────────────────
function initListeners() {
  document.getElementById('btn-registrar-alumno')?.addEventListener('click', handleSubmit)
  document.getElementById('btn-cancelar-registro')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: { message: 'Registro cancelado', type: 'info' }
    }))
    window.location.hash = '#/hoy'
  })
}

async function handleSubmit() {
  if (viewState.submitting) return

  const data = getFormData()
  const errors = validateForm(data)

  if (errors.length > 0) {
    // Clear previous inline errors and set new field-specific errors
    clearAllFieldErrors(document.getElementById('reg-nombre')?.closest('.pm-settings') || document)
    errors.forEach(err => {
      const inputEl = document.getElementById(err.fieldId)
      if (inputEl) setFieldError(inputEl, err.message)
    })
    return
  }

  // ─── REG-04: Duplicate detection ──────────────────────────
  if (data.repEmail) {
    const emailExiste = await validarEmail(data.repEmail)
    if (emailExiste) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { message: 'El correo del representante ya está registrado en el sistema', type: 'danger' }
      }))
      viewState.submitting = false
      return
    }
  }

  if (data.repCedula) {
    const cedulaExiste = await validarCedula(data.repCedula)
    if (cedulaExiste) {
      window.dispatchEvent(new CustomEvent('showToast', {
        detail: { message: 'La cédula del representante ya está registrada en el sistema', type: 'danger' }
      }))
      viewState.submitting = false
      return
    }
  }
  // ─────────────────────────────────────────────────────────

  viewState.submitting = true
  const btn = document.getElementById('btn-registrar-alumno')
  const originalHtml = btn.innerHTML
  btn.disabled = true
  btn.innerHTML = '<span class="pm-settings-spinner"></span><span>Registrando...</span>'

  try {
    // Crear alumno
    const alumnoData = {
      nombre: data.nombre,
      nombre_completo: data.nombre,
      fecha_nacimiento: data.fechaNac,
      instrumento: data.instrumento,
      instrumento_principal: data.instrumento,
      representante_nombre: data.repNombre,
      familiar_nombre: data.repNombre,
      representante_tlf: normalizePhone(data.repTlf) || data.repTlf,
      familiar_telefono: normalizePhone(data.repTlf) || data.repTlf,
      representante_cedula: data.repCedula || null,
      correo_representante: data.repEmail || null,
      direccion: data.direccion || null,
      is_active: true,
      activo: true,
    }

    const nuevoAlumno = await crearAlumno(alumnoData)

    // Si se seleccionó una clase, inscribir al alumno
    if (data.claseId) {
      try {
        const { inscribirAlumno } = await import('../../modules/clases/api/clasesApi.js')
        if (typeof inscribirAlumno === 'function') {
          await inscribirAlumno(data.claseId, nuevoAlumno.id)
        }
      } catch (err) {
        console.warn('[Registro] No se pudo inscribir en clase:', err.message)
        // No es crítico — el alumno ya fue creado
      }
    }

    window.dispatchEvent(new CustomEvent('showToast', {
      detail: { message: `Alumno ${data.nombre} registrado exitosamente`, type: 'success' }
    }))

    // Reset form
    document.getElementById('reg-nombre').value = ''
    document.getElementById('reg-fecha-nac').value = ''
    document.getElementById('reg-instrumento').value = ''
    document.getElementById('reg-rep-nombre').value = ''
    document.getElementById('reg-rep-tlf').value = ''
    document.getElementById('reg-rep-cedula').value = ''
    document.getElementById('reg-rep-email').value = ''
    document.getElementById('reg-direccion').value = ''
    document.getElementById('reg-clase').value = ''

  } catch (err) {
    window.dispatchEvent(new CustomEvent('showToast', {
      detail: { message: 'Error al registrar: ' + err.message, type: 'danger' }
    }))
  } finally {
    viewState.submitting = false
    btn.disabled = false
    btn.innerHTML = originalHtml
  }
}

// ─── ANIMACIONES ─────────────────────────────────────────────
function animateSections() {
  const sections = document.querySelectorAll('.card-apple')
  sections.forEach((sec, i) => {
    sec.style.opacity = '0'
    sec.style.transform = 'translateY(12px)'
    setTimeout(() => {
      sec.style.transition = 'opacity 0.4s ease, transform 0.4s ease'
      sec.style.opacity = '1'
      sec.style.transform = 'translateY(0)'
    }, 50 * i)
  })
}
