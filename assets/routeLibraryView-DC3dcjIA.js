import{t as e}from"./academicService-osA8Qsjr.js";var t={async render(){let e=document.createElement(`div`);return e.className=`pm-view pm-animate-fade-in`,e.innerHTML=`
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
    `,this.loadRoutes(e),e},async loadRoutes(t){let n=t.querySelector(`#routes-grid`);try{let r=await e.fetchRoutes();if(!r||r.length===0){n.innerHTML=`
          <div class="pm-placeholder" style="grid-column: 1 / -1;">
            <i class="bi bi-journal-x"></i>
            <p>No se encontraron rutas académicas activas.</p>
          </div>
        `;return}n.innerHTML=r.map(e=>`
        <div class="card-apple route-card pm-animate-slide-up" data-id="${e.id}" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <span class="badge-apple" style="background: var(--pm-primary); padding: 4px 10px; border-radius: 8px;">
                ${e.instrument_id||`General`}
              </span>
              <span class="apple-caption" style="font-size: 0.7rem; font-weight: 600;">
                v${e.route_versions?.[0]?.version_number||`1.0`}
              </span>
            </div>
            <h3 class="pm-card-title" style="font-size: 1.1rem; margin-bottom: 0.5rem;">${e.name}</h3>
            <p class="apple-caption" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 1rem;">
              ${e.description||`Sin descripción disponible.`}
            </p>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto;">
             <span class="apple-caption" style="font-size: 0.75rem;">
               <i class="bi bi-calendar-event"></i> ${new Date(e.created_at).toLocaleDateString()}
             </span>
             <button class="btn-apple-utility" style="padding: 4px 12px; font-size: 0.8rem;">Ver Detalle</button>
          </div>
        </div>
      `).join(``),n.querySelectorAll(`.route-card`).forEach(e=>{e.onclick=()=>{let t=e.getAttribute(`data-id`);window.location.hash=`#/ruta-detalle/${t}`}});let i=t.querySelector(`#route-search`);i.oninput=e=>{let t=e.target.value.toLowerCase();n.querySelectorAll(`.route-card`).forEach(e=>{let n=e.textContent.toLowerCase();e.style.display=n.includes(t)?`flex`:`none`})}}catch(e){console.error(`Error al cargar rutas:`,e),n.innerHTML=`
        <div class="pm-placeholder" style="grid-column: 1 / -1;">
          <i class="bi bi-exclamation-triangle" style="color: var(--apple-danger);"></i>
          <p>Error al cargar las rutas académicas.</p>
        </div>
      `}}};export{t as RouteLibraryView};