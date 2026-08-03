import{b as e}from"./planificacion-DfaGXXF3.js";import{n as t,t as n}from"./adminMaestroApi-CDRHdQAv.js";function r(e){return e?String(e).replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]):``}var i=class{constructor(e,t){this.containerId=e,this.maestroId=t,this.container=document.getElementById(e)}async init(){try{this.container.innerHTML=`<div class="premium-loading"><div class="premium-loading-spinner"></div><div>Cargando detalle...</div></div>`;let[e,r]=await Promise.all([t(this.maestroId),n(this.maestroId)]);this.render(e,r)}catch(e){console.error(`[MaestroDetalleView] Error:`,e),this.container.innerHTML=`
        <div class="premium-error-card">
          <i class="bi bi-exclamation-triangle-fill"></i>
          <div>Error: ${r(e.message)}</div>
        </div>`}}render(t,n){let i=n?.length??0,a=t?.length??0;this.container.innerHTML=`
      <div class="distribution-card">
        <div class="admin-header-brand mb-4">
          <button class="btn btn-sm btn-outline-secondary me-3" id="btnVolver">
            <i class="bi bi-arrow-left"></i> Volver
          </button>
          <div class="admin-header-icon-wrapper" style="background: rgba(99, 102, 241, 0.1); color: #6366f1;">
            <i class="bi bi-person-badge"></i>
          </div>
          <div class="admin-header-title-section">
            <h3 style="margin:0;font-size:1.3rem;font-weight:800;letter-spacing:-0.02em;">
              Detalle de Maestro
            </h3>
            <p class="subtitle" style="margin:0.25rem 0 0;color:#6b7280;font-size:0.85rem;">
              Registros pendientes y notificaciones
            </p>
          </div>
        </div>

        <div class="metrics-grid mb-4">
          <div class="stat-card alert" style="padding:1rem 1.25rem;">
            <div class="stat-value" style="font-size:1.75rem;">${a}</div>
            <div class="stat-label" style="font-size:0.7rem;">Registros Pendientes</div>
          </div>
          <div class="stat-card warning" style="padding:1rem 1.25rem;">
            <div class="stat-value" style="font-size:1.75rem;">${i}</div>
            <div class="stat-label" style="font-size:0.7rem;">Notificaciones Enviadas</div>
          </div>
        </div>

        <div class="premium-table-container">
          <h5 style="margin-bottom:1rem;">Registros Pendientes</h5>
          <table class="premium-table">
            <thead>
              <tr>
                <th>Clase</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Notif.</th>
              </tr>
            </thead>
            <tbody>
              ${a===0?`<tr><td colspan="5" class="premium-no-data">Sin registros pendientes</td></tr>`:t.map(e=>`
                  <tr>
                    <td>${e.clases?.nombre?r(e.clases.nombre):`---`}</td>
                    <td><span class="badge bg-secondary">${r(e.tipo)}</span></td>
                    <td><span class="badge ${e.notification_state===`ROJO`?`bg-danger`:e.notification_state===`NARANJA`?`bg-warning`:`bg-info`}">${r(e.notification_state||e.estado)}</span></td>
                    <td style="font-size:0.8rem;">${new Date(e.created_at).toLocaleDateString()}</td>
                    <td>${e.notif_count??0}</td>
                  </tr>
                `).join(``)}
            </tbody>
          </table>
        </div>
      </div>
    `,document.getElementById(`btnVolver`)?.addEventListener(`click`,()=>{e.navigate(`admin-dashboard`)})}};export{i as MaestroDetalleView,i as default};