import{i as e}from"./supabase-DJmkTfk1.js";import{r as t}from"./maestroAuth-uDodKUJN.js";import{t as n}from"./AppToast-BOjiJExQ.js";import{t as r}from"./ausenciaModal-CvmYhx0a.js";var i=new class{constructor(){this.state={ausencias:[],loading:!0,error:null},this.listenersAttached=!1}async init(e){if(!e){console.error(`AusenciaHistorial: Container no proporcionado`);return}this.container=e,this._attachListeners(),await this._loadData(),this._render()}_attachListeners(){this.listenersAttached||=(window.addEventListener(`ausenciaSolicitada`,()=>this.refresh()),window.addEventListener(`ausenciaActualizada`,()=>this.refresh()),!0)}destroy(){window.removeEventListener(`ausenciaSolicitada`,()=>this.refresh()),window.removeEventListener(`ausenciaActualizada`,()=>this.refresh()),this.listenersAttached=!1}async refresh(){await this._loadData(),this._render()}async _loadData(){this.state.loading=!0,this.state.error=null,this._render();try{let n=t();if(!n)throw Error(`No hay sesión activa`);let{data:r,error:i}=await e.from(`ausencias_maestros`).select(`*`).eq(`maestro_id`,n.id).order(`created_at`,{ascending:!1});if(i)throw i;this.state.ausencias=r||[]}catch(e){console.error(`Error cargando ausencias:`,e),this.state.error=`No se pudieron cargar las ausencias. Intenta de nuevo.`,this.state.ausencias=[]}finally{this.state.loading=!1}}_render(){this.container&&(this.container.innerHTML=this._getHTML(),this._attachEvents())}_getHTML(){return this.state.loading?this._renderLoading():this.state.error?this._renderError():this.state.ausencias.length?`
      ${this._renderTable()}
      <div class="ah-cards">
        ${this._renderCards()}
      </div>
    `:this._renderEmpty()}_renderLoading(){return`
      <div class="ah-loading" role="status" aria-live="polite">
        <div class="ah-spinner"></div>
        <span>Cargando historial...</span>
      </div>
    `}_renderError(){return`
      <div class="ah-error" role="alert">
        <div class="ah-error-icon">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <div class="ah-error-message">${this.state.error}</div>
        <button class="ah-btn ah-btn-retry" data-action="retry">
          <i class="bi bi-arrow-clockwise"></i> Reintentar
        </button>
      </div>
    `}_renderEmpty(){return`
      <div class="ah-empty">
        <div class="ah-empty-icon">
          <i class="bi bi-calendar-check"></i>
        </div>
        <div class="ah-empty-title">Sin solicitudes</div>
        <div class="ah-empty-desc">No tienes solicitudes de ausencia registradas</div>
      </div>
    `}_renderTable(){return`
      <div class="ah-table-container">
        <table class="ah-table" role="table" aria-label="Historial de ausencias">
          <caption class="ah-caption">Historial de solicitudes de ausencia</caption>
          <thead>
            <tr>
              <th scope="col">Fechas</th>
              <th scope="col">Tipo</th>
              <th scope="col">Motivo</th>
              <th scope="col">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${this.state.ausencias.map(e=>this._renderRow(e)).join(``)}
          </tbody>
        </table>
      </div>

      <style>
        .ah-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          gap: 0.75rem;
          color: var(--pm-text-muted);
        }
        .ah-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--pm-border);
          border-top-color: var(--pm-primary);
          border-radius: 50%;
          animation: ah-spin 0.8s linear infinite;
        }
        @keyframes ah-spin {
          to { transform: rotate(360deg); }
        }

        .ah-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1rem;
          text-align: center;
        }
        .ah-error-icon {
          width: 60px;
          height: 60px;
          background: var(--pm-danger-bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--pm-danger);
          margin-bottom: 1rem;
        }
        .ah-error-message {
          color: var(--pm-text-muted);
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        .ah-btn-retry {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          background: var(--pm-surface);
          border: 1px solid var(--pm-border);
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.8125rem;
          color: var(--pm-text);
          transition: all 0.2s;
        }
        .ah-btn-retry:hover {
          border-color: var(--pm-primary);
          color: var(--pm-primary);
        }

        .ah-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem 1rem;
          text-align: center;
        }
        .ah-empty-icon {
          width: 80px;
          height: 80px;
          background: var(--pm-surface-2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: var(--pm-border);
          margin-bottom: 1rem;
        }
        .ah-empty-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--pm-text);
          margin-bottom: 0.375rem;
        }
        .ah-empty-desc {
          font-size: 0.8125rem;
          color: var(--pm-text-muted);
        }

        .ah-table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .ah-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }
        .ah-caption {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }
        .ah-table th {
          text-align: left;
          padding: 0.75rem 0.625rem;
          font-weight: 600;
          color: var(--pm-text-muted);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          border-bottom: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
        }
        .ah-table td {
          padding: 0.75rem 0.625rem;
          border-bottom: 1px solid var(--pm-border);
          color: var(--pm-text);
        }
        .ah-table tr:hover td {
          background: var(--pm-surface);
        }

        .ah-date-range {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }
        .ah-date-primary {
          font-weight: 500;
        }
        .ah-date-secondary {
          font-size: 0.6875rem;
          color: var(--pm-text-muted);
        }

        .ah-tipo {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
        }
        .ah-tipo-icon {
          font-size: 0.875rem;
        }
        .ah-tipo-enfermedad { color: #dc2626; }
        .ah-tipo-personal { color: #6366f1; }
        .ah-tipo-capacitacion { color: #0891b2; }
        .ah-tipo-vacaciones { color: #f59e0b; }
        .ah-tipo-otro { color: #6b7280; }

        .ah-motivo {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ah-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .ah-badge-pendiente {
          background: #fef3c7;
          color: #b45309;
        }
        .ah-badge-aprobada {
          background: #d1fae5;
          color: #047857;
        }
        .ah-badge-rechazada {
          background: #fee2e2;
          color: #b91c1c;
        }
        .ah-badge-cancelada {
          background: var(--pm-surface-2);
          color: var(--pm-text-muted);
        }

        .ah-btn-cancel {
          background: none;
          border: none;
          color: var(--pm-text-muted);
          cursor: pointer;
          padding: 0.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .ah-btn-cancel:hover {
          color: var(--pm-danger);
        }

        @media (max-width: 600px) {
          .ah-table-container {
            display: none;
          }
          .ah-cards {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            padding: 0.5rem;
          }
          .ah-card {
            background: var(--pm-surface);
            border: 1px solid var(--pm-border);
            border-radius: 12px;
            padding: 1rem;
          }
          .ah-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.75rem;
          }
          .ah-card-title {
            font-weight: 600;
            font-size: 0.9375rem;
            display: flex;
            align-items: center;
            gap: 0.375rem;
          }
          .ah-card-body {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .ah-card-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.8125rem;
          }
          .ah-card-label {
            color: var(--pm-text-muted);
          }
          .ah-card-value {
            color: var(--pm-text);
            text-align: right;
          }
        }
        @media (min-width: 601px) {
          .ah-cards { display: none; }
        }
      </style>
    `}_renderRow(e){let t=this._formatDate(e.fecha_inicio),n=this._formatDate(e.fecha_fin),r=e.fecha_inicio===e.fecha_fin,i=r?t:`${t} - ${n}`,a=this._getTipoIcon(e.tipo_ausencia),o=this._getTipoLabel(e.tipo_ausencia);return`
      <tr>
        <td>
          <div class="ah-date-range">
            <span class="ah-date-primary">${i}</span>
            ${r?``:`<span class="ah-date-secondary">${this._calcDias(e.fecha_inicio,e.fecha_fin)} días</span>`}
          </div>
        </td>
        <td>
          <span class="ah-tipo ah-tipo-${e.tipo_ausencia}">
            ${a} ${o}
          </span>
        </td>
        <td>
          <span class="ah-motivo" title="${e.motivo}">${e.motivo}</span>
        </td>
        <td>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
            <span class="ah-badge ah-badge-${e.estado}">${e.estado}</span>
            ${e.estado===`pendiente`?`
              <button class="ah-btn-cancel" data-action="cancel" data-id="${e.id}" title="Cancelar solicitud">
                <i class="bi bi-x-circle"></i>
              </button>
            `:``}
          </div>
        </td>
      </tr>
    `}_renderCards(){return this.state.ausencias.map(e=>{let t=this._formatDate(e.fecha_inicio),n=this._formatDate(e.fecha_fin),r=e.fecha_inicio===e.fecha_fin?t:`${t} - ${n}`;return`
        <div class="ah-card">
          <div class="ah-card-header">
            <div class="ah-card-title">
              ${this._getTipoIcon(e.tipo_ausencia)} ${this._getTipoLabel(e.tipo_ausencia)}
            </div>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span class="ah-badge ah-badge-${e.estado}">${e.estado}</span>
              ${e.estado===`pendiente`?`
                <button class="ah-btn-cancel" data-action="cancel" data-id="${e.id}" title="Cancelar solicitud">
                  <i class="bi bi-x-circle"></i>
                </button>
              `:``}
            </div>
          </div>
          <div class="ah-card-body">
            <div class="ah-card-row">
              <span class="ah-card-label">Fechas</span>
              <span class="ah-card-value">${r}</span>
            </div>
            <div class="ah-card-row">
              <span class="ah-card-label">Motivo</span>
              <span class="ah-card-value">${e.motivo}</span>
            </div>
          </div>
        </div>
      `}).join(``)}_attachEvents(){this.container?.querySelectorAll(`[data-action="retry"]`).forEach(e=>{e.addEventListener(`click`,()=>this.refresh())}),this.container?.querySelectorAll(`[data-action="cancel"]`).forEach(e=>{e.addEventListener(`click`,e=>{let t=e.currentTarget.dataset.id;this._cancelSolicitud(t)})})}async _cancelSolicitud(t){if(confirm(`¿Estás seguro que deseas cancelar esta solicitud?`))try{let{error:r}=await e.from(`ausencias_maestros`).update({estado:`cancelada`}).eq(`id`,t);if(r)throw r;n.success(`Solicitud cancelada correctamente`),this.refresh()}catch(e){console.error(`Error al cancelar:`,e),n.error(`No se pudo cancelar la solicitud`)}}_formatDate(e){if(!e)return`-`;let t=navigator.language||`es-ES`;return new Date(e).toLocaleDateString(t,{year:`numeric`,month:`short`,day:`numeric`})}_calcDias(e,t){if(!e||!t)return 0;let n=new Date(e),r=new Date(t);return Math.ceil((r-n)/(1e3*60*60*24))+1}_getTipoIcon(e){let t={enfermedad:`<i class="bi bi-thermometer-half ah-tipo-icon"></i>`,personal:`<i class="bi bi-person ah-tipo-icon"></i>`,capacitacion:`<i class="bi bi-book ah-tipo-icon"></i>`,vacaciones:`<i class="bi bi-sun ah-tipo-icon"></i>`,otro:`<i class="bi bi-three-dots ah-tipo-icon"></i>`};return t[e]||t.otro}_getTipoLabel(e){return{enfermedad:`Enfermedad`,personal:`Personal`,capacitacion:`Capacitación`,vacaciones:`Vacaciones`,otro:`Otro`}[e]||`Otro`}};async function a(e){let t=typeof e==`string`?document.querySelector(e):e;if(!t){console.error(`AusenciaHistorial: Contenedor no encontrado`);return}await i.init(t)}function o(){i.destroy()}var s=new class{constructor(){this.maestro=t(),this.isOpen=!1,this.container=null}initDOM(){document.getElementById(`pm-ausencias-drawer-overlay`)||(this.container=document.createElement(`div`),this.container.innerHTML=`
      <div id="pm-ausencias-drawer-overlay" class="pm-drawer-overlay">
        <div class="pm-drawer pm-drawer-wide">
          <div class="pm-drawer-header">
            <h4><i class="bi bi-calendar-minus"></i> Mis Solicitudes</h4>
            <div style="display:flex; gap: 0.5rem;">
              <button class="pm-drawer-close" id="pm-ausencias-close">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          <div class="pm-drawer-body" id="pm-ausencias-body">
            <!-- El historial se renderizará aquí -->
          </div>
          <div class="pm-drawer-footer" style="padding: 1rem; border-top: 1px solid var(--pm-border); text-align: center;">
             <button class="pm-btn pm-btn-primary" style="width: 100%;" id="pm-ausencias-btn-nueva">
               <i class="bi bi-plus-lg"></i> Nueva Solicitud
             </button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(this.container),document.getElementById(`pm-ausencias-close`).addEventListener(`click`,()=>this.close()),document.getElementById(`pm-ausencias-drawer-overlay`).addEventListener(`click`,e=>{e.target.id===`pm-ausencias-drawer-overlay`&&this.close()}),document.getElementById(`pm-ausencias-btn-nueva`).addEventListener(`click`,()=>{this.close(),r.open()}))}async open(){if(!this.maestro){n.error(`Debes estar logueado para ver tus ausencias`);return}this.initDOM();let e=document.getElementById(`pm-ausencias-drawer-overlay`);e.style.display=`block`,e.offsetHeight,e.classList.add(`open`),this.isOpen=!0,await a(`#pm-ausencias-body`)}close(){let e=document.getElementById(`pm-ausencias-drawer-overlay`);e&&(e.classList.remove(`open`),setTimeout(()=>{e.style.display=`none`,o()},300)),this.isOpen=!1}};export{s as ausenciasPanel};