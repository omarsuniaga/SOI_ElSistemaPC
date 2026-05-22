import { supabase } from '../../lib/supabaseClient.js';
import { getMaestroLocal } from '../auth/maestroAuth.js';
import { escHTML } from '../utils/portalUtils.js';
import { getPermisos, solicitarPermiso } from '../services/permisoService.js';
import { registrarAlumnoModal } from '../components/registrarAlumnoModal.js';
import { gestionarClasesModal } from '../components/gestionarClasesModal.js';

/**
 * Vista para que maestro gestione sus alumnos y clases
 * Disponible solo cuando tiene permisos aprobados
 */
export async function renderGestionAlumnosClasesView(container) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`;

  const maestro = getMaestroLocal();
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`;
    return;
  }

  try {
    // Consultar permisos del maestro
    const permisos = await getPermisos(maestro.id);

    // Obtener alumnos del maestro
    const { data: alumnos } = await supabase
      .from('alumnos')
      .select('id, nombre, apellido, email, telefono')
      .eq('maestro_id', maestro.id); // Si existe relacion directa, sino por inscripcion

    // Obtener clases del maestro
    const { data: clases } = await supabase
      .from('clases')
      .select('id, nombre, instrumento, descripcion')
      .eq('maestro_id', maestro.id);

    const renderAlumnoBtn = () => {
      if (permisos.puede_registrar_alumnos) {
        return `<button id="pm-btn-new-alumno" class="btn-apple-primary btn-apple-sm">
                  <i class="bi bi-plus-lg"></i> Agregar Alumno
                </button>`;
      }
      return `<button id="pm-btn-req-alumno" class="btn btn-outline-secondary btn-sm" title="Solicitar permiso al Administrador">
                <i class="bi bi-lock"></i> Solicitar Permiso
              </button>`;
    };

    const renderClaseBtn = () => {
      if (permisos.puede_inscribir_clases) {
        return `<button id="pm-btn-new-clase" class="btn-apple-primary btn-apple-sm">
                  <i class="bi bi-plus-lg"></i> Gestionar / Agregar Clases
                </button>`;
      }
      return `<button id="pm-btn-req-clase" class="btn btn-outline-secondary btn-sm" title="Solicitar permiso al Administrador">
                <i class="bi bi-lock"></i> Solicitar Permiso
              </button>`;
    };

    const html = `
      <div class="pm-container">
        <div class="pm-header">
          <h1>⚙️ Gestión de Alumnos y Clases</h1>
          <p class="pm-text-muted">Administra tus alumnos y clases</p>
        </div>

        <div class="pm-sections">
          <!-- ALUMNOS -->
          <section class="pm-section">
            <div class="pm-section-header">
              <h2>👥 Alumnos (${alumnos?.length || 0})</h2>
              ${renderAlumnoBtn()}
            </div>

            <div class="pm-list">
              ${alumnos && alumnos.length > 0
                ? alumnos.map(a => `
                  <div class="pm-list-item">
                    <div class="pm-list-content">
                      <h3>${escHTML(a.nombre)} ${escHTML(a.apellido || '')}</h3>
                      <p>${escHTML(a.email || 'Sin email')}</p>
                    </div>
                  </div>
                `).join('')
                : '<p class="pm-text-muted">No tienes alumnos registrados aún.</p>'
              }
            </div>
          </section>

          <!-- CLASES -->
          <section class="pm-section">
            <div class="pm-section-header">
              <h2>🎵 Clases (${clases?.length || 0})</h2>
              ${renderClaseBtn()}
            </div>

            <div class="pm-list">
              ${clases && clases.length > 0
                ? clases.map(c => `
                  <div class="pm-list-item">
                    <div class="pm-list-content">
                      <h3>${escHTML(c.nombre)} - ${escHTML(c.instrumento || 'Instrumento')}</h3>
                      <p>${escHTML(c.descripcion || 'Sin descripción')}</p>
                    </div>
                  </div>
                `).join('')
                : '<p class="pm-text-muted">No tienes clases creadas aún.</p>'
              }
            </div>
          </section>
        </div>
      </div>

      <style>
        .pm-section {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          border: 1px solid var(--pm-border);
        }
        .pm-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .pm-section-header h2 { margin: 0; font-size: 1.1rem; }
        .pm-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .pm-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--pm-surface);
          border-radius: 6px;
          border: 1px solid var(--pm-border);
        }
        .pm-list-item:hover { background: var(--pm-surface-2); }
        .pm-list-content h3 { margin: 0 0 0.3rem 0; font-size: 0.95rem; }
        .pm-list-content p { margin: 0; font-size: 0.8rem; color: var(--pm-text-muted); }
      </style>
    `;

    container.innerHTML = html;

    // Listeners modales
    const setupModals = () => {
      let modalAlumnoInst = null;
      let modalClasesInst = null;

      const btnNewAlumno = document.getElementById('pm-btn-new-alumno');
      if (btnNewAlumno) {
        btnNewAlumno.addEventListener('click', () => {
          if (!modalAlumnoInst) modalAlumnoInst = registrarAlumnoModal();
          modalAlumnoInst.show(maestro.id);
        });
      }

      const btnNewClase = document.getElementById('pm-btn-new-clase');
      if (btnNewClase) {
        btnNewClase.addEventListener('click', () => {
          if (!modalClasesInst) modalClasesInst = gestionarClasesModal();
          modalClasesInst.show(maestro.id);
        });
      }
    };
    setupModals();

    // Listeners solicitudes permiso
    document.getElementById('pm-btn-req-alumno')?.addEventListener('click', async (e) => {
      try {
        e.target.disabled = true;
        e.target.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Solicitando...';
        await solicitarPermiso(maestro.id, 'alumnos:create');
        alert('Solicitud enviada al administrador.');
        renderGestionAlumnosClasesView(container);
      } catch (err) {
        alert('Error al solicitar permiso: ' + err.message);
        e.target.disabled = false;
        e.target.innerHTML = '<i class="bi bi-lock"></i> Solicitar Permiso';
      }
    });

    document.getElementById('pm-btn-req-clase')?.addEventListener('click', async (e) => {
      try {
        e.target.disabled = true;
        e.target.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Solicitando...';
        await solicitarPermiso(maestro.id, 'clases:enroll');
        alert('Solicitud enviada al administrador.');
        renderGestionAlumnosClasesView(container);
      } catch (err) {
        alert('Error al solicitar permiso: ' + err.message);
        e.target.disabled = false;
        e.target.innerHTML = '<i class="bi bi-lock"></i> Solicitar Permiso';
      }
    });

    // Refrescar al recibir eventos custom
    const refreshView = () => renderGestionAlumnosClasesView(container);
    
    window.removeEventListener('alumno-registrado', refreshView);
    window.addEventListener('alumno-registrado', refreshView, { once: true });

    window.removeEventListener('clase-creada', refreshView);
    window.addEventListener('clase-creada', refreshView, { once: true });

  } catch (err) {
    container.innerHTML = `<p class="pm-empty" style="color:red">Error: ${escHTML(err.message)}</p>`;
    console.error('[GestionAlumnosClasesView]', err);
  }
}
