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

    const renderAlumnoRow = (a) => `
      <div class="pgac-list-item">
        <div class="pgac-list-avatar">
          ${(a.nombre?.[0] || '?').toUpperCase()}
        </div>
        <div class="pgac-list-info">
          <span class="pgac-list-name">${escHTML(a.nombre)} ${escHTML(a.apellido || '')}</span>
          <span class="pgac-list-sub">${escHTML(a.email || 'Sin email')}</span>
        </div>
      </div>`;

    const renderClaseRow = (c) => `
      <div class="pgac-list-item">
        <div class="pgac-list-avatar pgac-list-avatar--teal">
          <i class="bi bi-music-note-beamed"></i>
        </div>
        <div class="pgac-list-info">
          <span class="pgac-list-name">${escHTML(c.nombre)}</span>
          <span class="pgac-list-sub">${escHTML(c.instrumento || 'Sin instrumento')}</span>
        </div>
      </div>`;

    const html = `
      <div class="card-apple pm-settings-section" style="margin-top:0.75rem;">
        <div class="pm-settings-section__header">
          <i class="bi bi-people pm-icon-blue" aria-hidden="true"></i>
          <div>
            <h3 class="pm-settings-section__title">Alumnos</h3>
            <p class="pm-settings-section__desc">${alumnos?.length || 0} registrado${(alumnos?.length || 0) !== 1 ? 's' : ''}</p>
          </div>
          <div style="margin-left:auto;">${renderAlumnoBtn()}</div>
        </div>
        <div class="pgac-list">
          ${alumnos && alumnos.length > 0
            ? alumnos.map(renderAlumnoRow).join('')
            : '<p style="font-size:0.82rem;color:var(--pm-text-muted);margin:0.5rem 0 0;">No tenés alumnos registrados aún.</p>'
          }
        </div>
      </div>

      <div class="card-apple pm-settings-section">
        <div class="pm-settings-section__header">
          <i class="bi bi-music-note-list pm-icon-teal" aria-hidden="true"></i>
          <div>
            <h3 class="pm-settings-section__title">Clases</h3>
            <p class="pm-settings-section__desc">${clases?.length || 0} activa${(clases?.length || 0) !== 1 ? 's' : ''}</p>
          </div>
          <div style="margin-left:auto;">${renderClaseBtn()}</div>
        </div>
        <div class="pgac-list">
          ${clases && clases.length > 0
            ? clases.map(renderClaseRow).join('')
            : '<p style="font-size:0.82rem;color:var(--pm-text-muted);margin:0.5rem 0 0;">No tenés clases creadas aún.</p>'
          }
        </div>
      </div>
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
