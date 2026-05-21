import { supabase } from '../../lib/supabaseClient.js';
import { getMaestroLocal } from '../auth/maestroAuth.js';
import { escHTML } from '../utils/portalUtils.js';

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
    // Obtener alumnos del maestro
    const { data: alumnos } = await supabase
      .from('alumnos')
      .select('id, nombre, email, telefono')
      .eq('maestro_id', maestro.id);

    // Obtener clases del maestro
    const { data: clases } = await supabase
      .from('clases')
      .select('id, nombre, instrumento, descripcion')
      .eq('maestro_id', maestro.id);

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
              <button id="pm-btn-new-alumno" class="btn-apple-primary btn-apple-sm">
                <i class="bi bi-plus-lg"></i> Agregar Alumno
              </button>
            </div>

            <div class="pm-list">
              ${alumnos && alumnos.length > 0
                ? alumnos.map(a => `
                  <div class="pm-list-item">
                    <div class="pm-list-content">
                      <h3>${escHTML(a.nombre)}</h3>
                      <p>${escHTML(a.email || 'Sin email')}</p>
                    </div>
                    <button class="pm-btn-action" data-alumno-id="${a.id}" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                `).join('')
                : '<p class="pm-text-muted">No hay alumnos aún.</p>'
              }
            </div>
          </section>

          <!-- CLASES -->
          <section class="pm-section">
            <div class="pm-section-header">
              <h2>🎵 Clases (${clases?.length || 0})</h2>
              <button id="pm-btn-new-clase" class="btn-apple-primary btn-apple-sm">
                <i class="bi bi-plus-lg"></i> Agregar Clase
              </button>
            </div>

            <div class="pm-list">
              ${clases && clases.length > 0
                ? clases.map(c => `
                  <div class="pm-list-item">
                    <div class="pm-list-content">
                      <h3>${escHTML(c.nombre)} - ${escHTML(c.instrumento || 'Instrumento')}</h3>
                      <p>${escHTML(c.descripcion || 'Sin descripción')}</p>
                    </div>
                    <button class="pm-btn-action" data-clase-id="${c.id}" title="Eliminar">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                `).join('')
                : '<p class="pm-text-muted">No hay clases aún.</p>'
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

        .pm-section-header h2 {
          margin: 0;
          font-size: 1.1rem;
        }

        .pm-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .pm-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--pm-surface);
          border-radius: 6px;
          border: 1px solid var(--pm-border);
        }

        .pm-list-item:hover {
          background: var(--pm-surface-2);
        }

        .pm-list-content h3 {
          margin: 0 0 0.3rem 0;
          font-size: 0.95rem;
        }

        .pm-list-content p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--pm-text-muted);
        }

        .pm-btn-action {
          background: none;
          border: none;
          color: var(--pm-danger);
          cursor: pointer;
          padding: 0.5rem;
          font-size: 1rem;
        }

        .pm-btn-action:hover {
          background: rgba(239, 68, 68, 0.1);
          border-radius: 4px;
        }
      </style>
    `;

    container.innerHTML = html;

    // Event listeners
    document.getElementById('pm-btn-new-alumno')?.addEventListener('click', () => {
      alert('Funcionalidad de agregar alumno disponible proximamente');
    });

    document.getElementById('pm-btn-new-clase')?.addEventListener('click', () => {
      alert('Funcionalidad de agregar clase disponible proximamente');
    });

  } catch (err) {
    container.innerHTML = `<p class="pm-empty" style="color:red">Error: ${escHTML(err.message)}</p>`;
    console.error('[GestionAlumnosClasesView]', err);
  }
}
