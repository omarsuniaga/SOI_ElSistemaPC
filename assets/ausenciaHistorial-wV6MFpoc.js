import{i as e}from"./supabase-BryBf0UA.js";var t={ausencias:[],loading:!0};function n(){return`
    <div class="ausencia-historial">
      <div id=" historialLoading" class="text-center py-3 ${t.loading?``:`d-none`}">
        <div class="spinner-border spinner-border-sm text-primary"></div>
      </div>
      <div id="historialVacio" class="text-center py-3 text-muted ${t.loading||t.ausencias.length?`d-none`:``}">
        <i class="bi bi-calendar-check" style="font-size: 2rem;"></i>
        <p class="mt-2">No tienes solicitudes de ausencia</p>
      </div>
      <div class="table-responsive ${t.loading||!t.ausencias.length?`d-none`:``}" id="historialTable">
        <table class="table table-compact">
          <thead class="table-light">
            <tr>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Motivo</th>
              <th>Sustituto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody id="historialTBody">
            ${r()}
          </tbody>
        </table>
      </div>
    </div>
  `}function r(){return t.ausencias.length?t.ausencias.map(e=>{let t={pendiente:`bg-warning text-dark`,aprobada:`bg-success`,rechazad:`bg-danger`}[e.estado]||`bg-secondary`;return`
      <tr>
        <td>${i(e.fecha_inicio)}</td>
        <td>${i(e.fecha_fin)}</td>
        <td>${e.motivo}</td>
        <td>${e.sustituto_nombre||`-`}</td>
        <td><span class="badge ${t}">${e.estado}</span></td>
      </tr>
    `}).join(``):``}function i(e){return e?new Date(e).toLocaleDateString(`es-DO`,{year:`numeric`,month:`short`,day:`numeric`}):`-`}async function a(){t.loading=!0,o();try{let n=(await e.auth.getUser()).data.user;if(!n)throw Error(`No hay sesión activa`);let{data:r,error:i}=await e.from(`ausencias`).select(`*, sustituto:maestros!sustituto_id(nombre)`).eq(`maestro_id`,n.id).order(`fecha_inicio`,{ascending:!1});if(i)throw i;t.ausencias=r?.map(e=>({...e,sustituto_nombre:e.sustituto?.nombre}))||[]}catch(e){console.error(`Error cargando ausencias:`,e)}finally{t.loading=!1,o()}}function o(){let e=document.getElementById(`ausenciaHistorialContainer`);e&&(e.innerHTML=n())}window.addEventListener(`ausenciaSolicitada`,a),window.addEventListener(`ausenciaActualizada`,a);export{n as renderAusenciaHistorial};