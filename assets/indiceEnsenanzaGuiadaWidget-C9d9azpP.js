import{r as e}from"./AppModal-Du6jXNYA.js";import{i as t}from"./supabase-Cgh_dhNB.js";async function n(){try{let{data:e,error:n}=await t.rpc(`fn_get_indice_ensenanza_guiada`);if(n)return console.warn(`[indiceEnsenanzaGuiadaApi] Error consultando el índice:`,n.message),[];if(!e||e.length===0)return[];let r=[...new Set(e.map(e=>e.maestro_id))],{data:i}=await t.from(`maestros`).select(`id, nombre_completo`).in(`id`,r),a=new Map((i||[]).map(e=>[e.id,e.nombre_completo]));return e.map(e=>({maestroId:e.maestro_id,nombre:a.get(e.maestro_id)||`Maestro`,totalSesiones:e.total_sesiones||0,sesionesConIndicador:e.sesiones_con_indicador||0,indice:e.indice==null?0:Number(e.indice)}))}catch(e){return console.error(`[indiceEnsenanzaGuiadaApi] getIndiceEnsenanzaGuiada error:`,e),[]}}function r(e=[]){let t=e.filter(e=>e.totalSesiones>0);if(t.length===0)return{promedioInstitucional:0,totalMaestros:0,destacados:[]};let n=t.reduce((e,t)=>e+t.indice,0)/t.length,r=t.filter(e=>e.indice>0&&e.indice>=n).sort((e,t)=>t.indice-e.indice).slice(0,5);return{promedioInstitucional:n,totalMaestros:t.length,destacados:r}}function i({promedioInstitucional:t,totalMaestros:n,destacados:r}){return n===0?`
      <div class="ieg-widget">
        <div class="premium-no-data">
          <i class="bi bi-stars fs-4 d-block mb-2 text-secondary"></i>
          Todavía no hay sesiones registradas para calcular el índice de enseñanza guiada.
        </div>
      </div>
    `:`
    <div class="ieg-widget">
      <div class="ieg-resumen">
        <div class="ieg-resumen-valor">${Math.round(t*100)}%</div>
        <div class="ieg-resumen-label">
          Promedio institucional de sesiones con evaluación guiada por indicador
          <span class="ieg-resumen-sub">(${n} maestro${n===1?``:`s`} con sesiones registradas)</span>
        </div>
      </div>

      <h4 class="ieg-destacados-title"><i class="bi bi-stars"></i> Maestros destacados por enseñanza guiada</h4>
      <p class="ieg-destacados-subtitle">Reconocimiento a quienes ya integran la evaluación guiada por indicador en su rutina de clase — no es un ranking, y no se muestra a otros maestros.</p>

      ${r.length>0?`
        <div class="ieg-destacados-list">
          ${r.map(t=>`
            <div class="ieg-destacado-card">
              <i class="bi bi-mortarboard-fill"></i>
              <span class="ieg-destacado-nombre">${e(t.nombre)}</span>
              <span class="ieg-destacado-badge">${Math.round(t.indice*100)}%</span>
            </div>
          `).join(``)}
        </div>
      `:`<p class="premium-no-data">Todavía ningún maestro supera el promedio institucional — cuando alguno lo haga, aparecerá acá.</p>`}
    </div>
  `}function a(e){let t=document.getElementById(e);return{async init(){if(t){t.innerHTML=`
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando índice de enseñanza guiada...</div>
        </div>
      `;try{let e=r(await n());t.innerHTML=i(e)}catch(e){console.error(`[indiceEnsenanzaGuiadaWidget] Error:`,e),t.innerHTML=`
          <div class="premium-error-card">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <div>No se pudo cargar el índice de enseñanza guiada.</div>
          </div>
        `}}},destroy(){t&&(t.innerHTML=``)}}}if(typeof document<`u`&&!document.getElementById(`ieg-styles`)){let e=document.createElement(`style`);e.id=`ieg-styles`,e.textContent=`
    .ieg-widget { display: flex; flex-direction: column; gap: 1rem; }
    .ieg-resumen {
      display: flex; align-items: baseline; gap: 0.75rem; padding: 1rem 1.25rem;
      background: rgba(59,130,246,0.06); border: 1px solid rgba(59,130,246,0.18); border-radius: 12px;
    }
    .ieg-resumen-valor { font-size: 2rem; font-weight: 800; color: #3b82f6; line-height: 1; }
    .ieg-resumen-label { font-size: 0.82rem; color: var(--bs-secondary-color); }
    .ieg-resumen-sub { display: block; font-size: 0.72rem; opacity: 0.8; margin-top: 0.15rem; }
    .ieg-destacados-title { font-size: 0.95rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 0.4rem; color: #d97706; }
    .ieg-destacados-subtitle { font-size: 0.78rem; color: var(--bs-secondary-color); margin: -0.5rem 0 0.25rem; }
    .ieg-destacados-list { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    .ieg-destacado-card {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.9rem;
      background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2); border-radius: 10px;
    }
    .ieg-destacado-card i { color: #f59e0b; }
    .ieg-destacado-nombre { font-size: 0.85rem; font-weight: 600; }
    .ieg-destacado-badge {
      font-size: 0.72rem; font-weight: 700; color: #d97706; background: rgba(245,158,11,0.15);
      padding: 0.15rem 0.5rem; border-radius: 999px;
    }
  `,document.head.appendChild(e)}export{a as indiceEnsenanzaGuiadaWidget};