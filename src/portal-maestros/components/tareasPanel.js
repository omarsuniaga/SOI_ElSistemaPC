import { enqueue } from '../services/offlineQueue.js';
import { supabase } from '../../lib/supabaseClient.js';

/**
 * Componente: TareasPanel
 * Muestra la lista de tareas pendientes para el maestro, agrupadas por alumno.
 * 
 * @param {HTMLElement} container 
 * @param {{ maestroId: string }} options
 */
export async function renderTareasPanel(container, { maestroId }) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`;

  try {
    // 1. Obtener tareas de Supabase (o IndexedDB en futuro offline-first completo)
    const { data: tareas, error } = await supabase
      .from('maestro_tareas')
      .select(`
        *,
        alumno:alumnos(nombre_completo)
      `)
      .eq('maestro_id', maestroId)
      .eq('completada', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!tareas || tareas.length === 0) {
      container.innerHTML = `
        <div class="pm-empty">
          <i class="bi bi-check-circle" style="font-size: 2rem; color: var(--pm-success);"></i>
          <p>No tienes tareas pendientes.</p>
        </div>
      `;
      return;
    }

    // 2. Renderizar lista
    container.innerHTML = `
      <div class="pm-tareas-list" style="padding: 1rem;">
        <h2 style="font-size: 1rem; font-weight: 700; margin-bottom: 1rem;">Tareas Pendientes</h2>
        ${tareas.map(tarea => `
          <div class="pm-card" style="margin-bottom: 0.75rem; border-left: 4px solid var(--pm-primary);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <div style="font-weight: 700; font-size: 0.9rem;">${tarea.alumno?.nombre_completo || 'Alumno'}</div>
                <p style="margin: 0.25rem 0; font-size: 0.85rem;">${tarea.tarea}</p>
                <div style="font-size: 0.7rem; color: var(--pm-text-muted);">
                  <i class="bi bi-calendar"></i> Asignada: ${new Date(tarea.created_at).toLocaleDateString()}
                </div>
              </div>
              <button class="pm-tarea-done-btn" data-id="${tarea.id}" style="background: none; border: 1px solid var(--pm-border); border-radius: 50%; width: 28px; height: 28px; cursor: pointer; color: var(--pm-text-muted);">
                <i class="bi bi-check"></i>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // 3. Eventos
    container.querySelectorAll('.pm-tarea-done-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        btn.style.background = 'var(--pm-success)';
        btn.style.color = 'white';
        btn.innerHTML = '<i class="bi bi-check-lg"></i>';

        // Registro offline de completitud
        await enqueue({
          tabla: 'maestro_tareas',
          operacion: 'update',
          payload: { id, completada: true }
        });

        // Remover visualmente tras un breve delay
        setTimeout(() => {
          const card = btn.closest('.pm-card');
          card.style.opacity = '0';
          card.style.transform = 'translateX(20px)';
          card.style.transition = 'all 0.3s ease';
          setTimeout(() => {
            card.remove();
            if (container.querySelectorAll('.pm-card').length === 0) {
              renderTareasPanel(container, { maestroId });
            }
          }, 300);
        }, 500);
      };
    });

  } catch (err) {
    container.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Error: ${err.message}</p>`;
  }
}
