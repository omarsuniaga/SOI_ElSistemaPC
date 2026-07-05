import { useAuth } from '../hooks/useAuth.js';
import { supabase } from '../../../lib/supabaseClient.js';

const state = {
  loading: false,
  error: null
};

export function renderPerfilView(container) {
  const user = useAuth.getUser();
  
  if (!user) {
    container.innerHTML = `
      <div class="container py-4">
        <div class="alert alert-warning">
          <i class="bi bi-exclamation-triangle me-2"></i>
          Debes iniciar sesión para ver tu perfil.
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="container py-4">
      <div class="perfil-header mb-4">
        <h2 class="fw-bold">
          <i class="bi bi-person-circle me-2"></i>Mi Perfil
        </h2>
        <p class="text-muted">Gestiona tu información personal y contraseña</p>
      </div>

      <div class="row">
        <div class="col-lg-4 mb-4">
          <div class="card-apple p-4 text-center">
            <div class="perfil-avatar mx-auto mb-3">
              ${user.user_metadata?.avatar_url 
                ? `<img src="${user.user_metadata.avatar_url}" alt="Avatar" class="rounded-circle" style="width: 100px; height: 100px; object-fit: cover;">`
                : `<i class="bi bi-person-fill" style="font-size: 3rem;"></i>`
              }
            </div>
            <h5 class="fw-bold">${user.user_metadata?.full_name || user.email?.split('@')[0]}</h5>
            <span class="badge bg-primary bg-opacity-10 text-primary">${user.role || 'Usuario'}</span>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card-apple p-4 mb-4">
            <h5 class="fw-bold mb-3">
              <i class="bi bi-person me-2"></i>Datos Personales
            </h5>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label label-apple">Nombre completo</label>
                <input type="text" class="input-apple" id="perfilNombre" 
                  value="${user.user_metadata?.full_name || ''}" 
                  placeholder="Tu nombre completo">
              </div>
              <div class="col-md-6">
                <label class="form-label label-apple">Correo electrónico</label>
                <input type="email" class="input-apple" id="perfilEmail" 
                  value="${user.email || ''}" disabled>
                <small class="text-muted">El correo no puede cambiarse</small>
              </div>
              <div class="col-12">
                <button class="btn-apple-primary" id="btnGuardarDatos">
                  <i class="bi bi-check-lg me-1"></i>Guardar cambios
                </button>
              </div>
            </div>
          </div>

          <div class="card-apple p-4 mb-4">
            <h5 class="fw-bold mb-3">
              <i class="bi bi-key me-2"></i>Cambiar Contraseña
            </h5>
            <form id="perfilPasswordForm">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label label-apple">Contraseña actual</label>
                  <input type="password" class="input-apple" id="passwordActual" required
                    placeholder="Ingresa tu contraseña actual">
                </div>
                <div class="col-md-6">
                  <label class="form-label label-apple">Nueva contraseña</label>
                  <input type="password" class="input-apple" id="passwordNueva" required
                    placeholder="Mínimo 8 caracteres">
                </div>
                <div class="col-md-6">
                  <label class="form-label label-apple">Confirmar contraseña</label>
                  <input type="password" class="input-apple" id="passwordConfirmar" required
                    placeholder="Repite la nueva contraseña">
                </div>
                <div class="col-12">
                  <div id="passwordError" class="alert alert-danger d-none"></div>
                  <button type="submit" class="btn-apple-secondary" id="btnCambiarPassword">
                    <i class="bi bi-key-fill me-1"></i>Cambiar contraseña
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div class="card-apple p-4">
            <h5 class="fw-bold mb-3">
              <i class="bi bi-calendar-minus me-2"></i>Solicitar Ausencia
            </h5>
            <p class="text-muted mb-3">Solicita días de ausencia y Assigna un maestro sustituto</p>
            <button class="btn-apple-primary" data-bs-toggle="modal" data-bs-target="#ausenciaModal">
              <i class="bi bi-plus-lg me-1"></i>Nueva solicitud
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="ausenciaModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-calendar-minus me-2"></i>Solicitud de Ausencia
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="ausenciaModalBody">
            <div class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="mt-2 text-muted">Cargando formulario...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  cargarComponentesPerfil(container);
}

async function cargarComponentesPerfil(container) {
  const { renderAusenciaForm } = await import('../components/ausenciaForm.js');
  const { renderAusenciaHistorial } = await import('../components/ausenciaHistorial.js');

  document.getElementById('ausenciaModalBody').innerHTML = renderAusenciaForm();

  const modalBody = container.querySelector('.card-apple:last-child');
  if (modalBody) {
    const historialContainer = document.createElement('div');
    historialContainer.className = 'mt-4';
    historialContainer.innerHTML = `
      <h6 class="fw-bold mb-3">
        <i class="bi bi-clock-history me-2"></i>Historial de Ausencias
      </h6>
      <div id="ausenciaHistorialContainer"></div>
    `;
    modalBody.appendChild(historialContainer);
    document.getElementById('ausenciaHistorialContainer').innerHTML = renderAusenciaHistorial();
  }

  container.querySelector('#btnGuardarDatos')?.addEventListener('click', guardarDatosPersonales);
  container.querySelector('#perfilPasswordForm')?.addEventListener('submit', cambiarPassword);
}

async function guardarDatosPersonales() {
  const nombre = document.getElementById('perfilNombre').value.trim();
  if (!nombre) {
    mostrarError('El nombre no puede estar vacío');
    return;
  }

  state.loading = true;
  const btn = document.getElementById('btnGuardarDatos');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Guardando...`;

  try {
    const { error } = await supabase.auth.updateUser({ data: { full_name: nombre } });
    
    if (error) throw error;

    mostrarExito('Datos guardados correctamente');
  } catch (error) {
    mostrarError(error.message);
  } finally {
    state.loading = false;
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-check-lg me-1"></i>Guardar cambios`;
  }
}

async function cambiarPassword(e) {
  e.preventDefault();
  
  const actual = document.getElementById('passwordActual').value;
  const nueva = document.getElementById('passwordNueva').value;
  const confirmar = document.getElementById('passwordConfirmar').value;

  const errorDiv = document.getElementById('passwordError');
  
  if (nueva.length < 8) {
    mostrarErrorPassword('La contraseña debe tener al menos 8 caracteres');
    return;
  }

  if (nueva !== confirmar) {
    mostrarErrorPassword('Las contraseñas no coinciden');
    return;
  }

  state.loading = true;
  const btn = document.getElementById('btnCambiarPassword');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Cambiando...`;

  try {
    const { error } = await supabase.auth.updateUser({
      password: nueva
    });

    if (error) throw error;

    document.getElementById('perfilPasswordForm').reset();
    mostrarExito('Contraseña cambiada correctamente');
  } catch (error) {
    if (error.message.includes('same')) {
      mostrarErrorPassword('La nueva contraseña debe ser diferente a la actual');
    } else {
      mostrarErrorPassword(error.message);
    }
  } finally {
    state.loading = false;
    btn.disabled = false;
    btn.innerHTML = `<i class="bi bi-key-fill me-1"></i>Cambiar contraseña`;
  }
}

function mostrarError(mensaje) {
  window.dispatchEvent(new CustomEvent('showToast', { 
    detail: { message: mensaje, type: 'danger' } 
  }));
}

function mostrarExito(mensaje) {
  window.dispatchEvent(new CustomEvent('showToast', { 
    detail: { message: mensaje, type: 'success' } 
  }));
}

function mostrarErrorPassword(mensaje) {
  const errorDiv = document.getElementById('passwordError');
  if (errorDiv) {
    errorDiv.textContent = mensaje;
    errorDiv.classList.remove('d-none');
  }
}

