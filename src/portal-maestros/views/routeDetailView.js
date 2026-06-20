import { academicService } from '../../modules/academic-routes/services/academicService';

export const RouteDetailView = {
  async render(params) {
    const routeId = params?.id;
    // Buscamos studentId en la URL si existe (ej. #/ruta-detalle/id?studentId=...)
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const studentId = urlParams.get('studentId');

    const container = document.createElement('div');
    container.className = 'pm-view pm-animate-fade-in';
    
    container.innerHTML = `
      <div class="pm-asist-header" style="margin-bottom: 2rem;">
        <button class="btn-icon-pm" id="back-to-library" style="margin-bottom: 0.5rem; margin-left: -8px;">
          <i class="bi bi-chevron-left"></i> Volver a Librería
        </button>
        <div id="route-header-content">
          <div class="pm-loading"><div class="pm-spinner"></div></div>
        </div>
      </div>

      <div id="route-hierarchy" class="pm-hierarchy-container">
        <!-- Árbol de Niveles y Nodos -->
      </div>
    `;

    container.querySelector('#back-to-library').onclick = () => {
      window.location.hash = '#/ruta-libreria';
    };

    if (routeId) {
      this.loadRouteDetail(container, routeId, studentId);
    } else {
      container.innerHTML = '<div class="pm-placeholder"><i class="bi bi-x-circle"></i><p>ID de ruta no proporcionado.</p></div>';
    }

    return container;
  },

  async loadRouteDetail(container, routeId, studentId) {
    const header = container.querySelector('#route-header-content');
    const hierarchy = container.querySelector('#route-hierarchy');
    
    try {
      const [structure, progress] = await Promise.all([
        academicService.getRouteDetail(routeId),
        studentId ? academicService.getStudentProgress(studentId, routeId) : Promise.resolve([])
      ]);

      // Mapear progreso para búsqueda rápida
      const progressMap = new Map(progress.map(p => [p.node_id, p]));

      // Renderizar Header
      header.innerHTML = `
        <h2 class="apple-display-md" style="font-size: 1.5rem;">Estructura Académica</h2>
        <p class="apple-caption">Visualización de niveles, nodos e indicadores.</p>
        ${studentId ? `
          <div class="badge-apple" style="background: var(--apple-secondary); padding: 4px 12px; margin-top: 8px;">
            Viendo progreso de alumno
          </div>
        ` : ''}
      `;

      if (!structure || structure.length === 0) {
        hierarchy.innerHTML = `
          <div class="pm-placeholder">
            <i class="bi bi-diagram-3"></i>
            <p>Esta ruta no tiene niveles o bloques definidos.</p>
          </div>
        `;
        return;
      }

      // Renderizar Jerarquía
      hierarchy.innerHTML = structure.map(block => `
        <div class="pm-block-section" style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--apple-primary); margin-bottom: 1rem; border-bottom: 1px solid var(--pm-border); padding-bottom: 0.5rem;">
            ${block.name}
          </h3>
          ${block.levels.map(level => `
            <div class="pm-level-card card-apple" style="margin-bottom: 1rem; border-left: 4px solid var(--apple-secondary);">
              <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem;">${level.name}</h4>
              <div class="pm-nodes-grid" style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${level.nodes.map(node => {
                  const nodeStatus = progressMap.get(node.id)?.status || 'pending';
                  const statusToken = academicService.getStatusToken(nodeStatus);
                  
                  return `
                    <div class="pm-node-item" style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background: var(--pm-surface-2); border-radius: 10px;">
                      <div class="node-status-icon" style="color: ${statusToken.color}; font-size: 1.25rem;">
                        <i class="bi ${statusToken.icon}"></i>
                      </div>
                      <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-weight: 600; font-size: 0.9rem;">${node.title}</span>
                          <span class="apple-caption" style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: ${statusToken.bg}; color: ${statusToken.color};">
                            ${statusToken.label}
                          </span>
                        </div>
                        <p class="apple-caption" style="margin: 0.25rem 0;">${node.description || ''}</p>
                        
                        <!-- Indicadores colapsables o miniatura -->
                        <div class="pm-indicators-list" style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.4rem;">
                          ${node.indicators.map(ind => `
                            <span class="apple-caption" style="font-size: 0.65rem; padding: 2px 8px; background: var(--pm-surface); border: 1px solid var(--pm-border); border-radius: 99px;">
                              ${ind.description}
                            </span>
                          `).join('')}
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `).join('');

    } catch (error) {
      console.error('Error al cargar detalle de ruta:', error);
      hierarchy.innerHTML = '<p class="pm-error-msg">Error al cargar la estructura académica.</p>';
    }
  }
};
