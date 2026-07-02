import{t as e}from"./academicService-D-BIm-fm.js";var t={async render(e){let t=e?.id,n=new URLSearchParams(window.location.hash.split(`?`)[1]).get(`studentId`),r=document.createElement(`div`);return r.className=`pm-view pm-animate-fade-in`,r.innerHTML=`
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
    `,r.querySelector(`#back-to-library`).onclick=()=>{window.location.hash=`#/ruta-libreria`},t?this.loadRouteDetail(r,t,n):r.innerHTML=`<div class="pm-placeholder"><i class="bi bi-x-circle"></i><p>ID de ruta no proporcionado.</p></div>`,r},async loadRouteDetail(t,n,r){let i=t.querySelector(`#route-header-content`),a=t.querySelector(`#route-hierarchy`);try{let[t,o]=await Promise.all([e.getRouteDetail(n),r?e.getStudentProgress(r,n):Promise.resolve([])]),s=new Map(o.map(e=>[e.node_id,e]));if(i.innerHTML=`
        <h2 class="apple-display-md" style="font-size: 1.5rem;">Estructura Académica</h2>
        <p class="apple-caption">Visualización de niveles, nodos e indicadores.</p>
        ${r?`
          <div class="badge-apple" style="background: var(--apple-secondary); padding: 4px 12px; margin-top: 8px;">
            Viendo progreso de alumno
          </div>
        `:``}
      `,!t||t.length===0){a.innerHTML=`
          <div class="pm-placeholder">
            <i class="bi bi-diagram-3"></i>
            <p>Esta ruta no tiene niveles o bloques definidos.</p>
          </div>
        `;return}a.innerHTML=t.map(t=>`
        <div class="pm-block-section" style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--apple-primary); margin-bottom: 1rem; border-bottom: 1px solid var(--pm-border); padding-bottom: 0.5rem;">
            ${t.name}
          </h3>
          ${t.levels.map(t=>`
            <div class="pm-level-card card-apple" style="margin-bottom: 1rem; border-left: 4px solid var(--apple-secondary);">
              <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem;">${t.name}</h4>
              <div class="pm-nodes-grid" style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${t.nodes.map(t=>{let n=s.get(t.id)?.status||`pending`,r=e.getStatusToken(n);return`
                    <div class="pm-node-item" style="display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; background: var(--pm-surface-2); border-radius: 10px;">
                      <div class="node-status-icon" style="color: ${r.color}; font-size: 1.25rem;">
                        <i class="bi ${r.icon}"></i>
                      </div>
                      <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <span style="font-weight: 600; font-size: 0.9rem;">${t.title}</span>
                          <span class="apple-caption" style="font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; background: ${r.bg}; color: ${r.color};">
                            ${r.label}
                          </span>
                        </div>
                        <p class="apple-caption" style="margin: 0.25rem 0;">${t.description||``}</p>
                        
                        <!-- Indicadores colapsables o miniatura -->
                        <div class="pm-indicators-list" style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.4rem;">
                          ${t.indicators.map(e=>`
                            <span class="apple-caption" style="font-size: 0.65rem; padding: 2px 8px; background: var(--pm-surface); border: 1px solid var(--pm-border); border-radius: 99px;">
                              ${e.description}
                            </span>
                          `).join(``)}
                        </div>
                      </div>
                    </div>
                  `}).join(``)}
              </div>
            </div>
          `).join(``)}
        </div>
      `).join(``)}catch(e){console.error(`Error al cargar detalle de ruta:`,e),a.innerHTML=`<p class="pm-error-msg">Error al cargar la estructura académica.</p>`}}};export{t as RouteDetailView};