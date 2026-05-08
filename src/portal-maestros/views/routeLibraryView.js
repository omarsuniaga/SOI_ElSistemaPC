import { academicService } from '../../modules/academic-routes/services/academicService';

export const RouteLibraryView = {
  async render() {
    const container = document.createElement('div');
    container.className = 'pm-view pm-animate-fade-in';
    
    container.innerHTML = `
      <div class="pm-asist-header">
        <h2 class="apple-display-md" style="font-size: 1.75rem;">Librería de Rutas</h2>
        <p class="apple-caption">Explora y selecciona las rutas académicas disponibles.</p>
      </div>

      <div class="pm-search-bar" style="margin-bottom: 1.5rem;">
        <div class="input-apple-group" style="position: relative;">
          <i class="bi bi-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--pm-text-muted);"></i>
          <input type="text" id="route-search" class="input-apple" placeholder="Buscar ruta o instrumento..." style="padding-left: 36px;">
        </div>
      </div>

      <div id="routes-grid" class="pm-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
        <div class="pm-loading">
          <div class="pm-spinner"></div>
        </div>
      </div>
    `;

    this.loadRoutes(container);
    return container;
  },

  async loadRoutes(container) {
    const grid = container.querySelector('#routes-grid');
    try {
      const routes = await academicService.fetchRoutes();
      
      if (!routes || routes.length === 0) {
        grid.innerHTML = `
          <div class="pm-placeholder" style="grid-column: 1 / -1;">
            <i class="bi bi-journal-x"></i>
            <p>No se encontraron rutas académicas activas.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = routes.map(route => `
        <div class="card-apple route-card pm-animate-slide-up" data-id="${route.id}" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <span class="badge-apple" style="background: var(--pm-primary); padding: 4px 10px; border-radius: 8px;">
                ${route.instrument_id || 'General'}
              </span>
              <span class="apple-caption" style="font-size: 0.7rem; font-weight: 600;">
                v${route.route_versions?.[0]?.version_number || '1.0'}
              </span>
            </div>
            <h3 class="pm-card-title" style="font-size: 1.1rem; margin-bottom: 0.5rem;">${route.name}</h3>
            <p class="apple-caption" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 1rem;">
              ${route.description || 'Sin descripción disponible.'}
            </p>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto;">
             <span class="apple-caption" style="font-size: 0.75rem;">
               <i class="bi bi-calendar-event"></i> ${new Date(route.created_at).toLocaleDateString()}
             </span>
             <button class="btn-apple-utility" style="padding: 4px 12px; font-size: 0.8rem;">Ver Detalle</button>
          </div>
        </div>
      `).join('');

      grid.querySelectorAll('.route-card').forEach(card => {
        card.onclick = () => {
          const id = card.getAttribute('data-id');
          window.location.hash = `#/ruta-detalle/${id}`;
        };
      });

      // Lógica de búsqueda básica
      const searchInput = container.querySelector('#route-search');
      searchInput.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        grid.querySelectorAll('.route-card').forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(term) ? 'flex' : 'none';
        });
      };

    } catch (error) {
      console.error('Error al cargar rutas:', error);
      grid.innerHTML = `
        <div class="pm-placeholder" style="grid-column: 1 / -1;">
          <i class="bi bi-exclamation-triangle" style="color: var(--apple-danger);"></i>
          <p>Error al cargar las rutas académicas.</p>
        </div>
      `;
    }
  }
};
