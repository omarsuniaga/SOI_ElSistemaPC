import{n as e}from"./rolldown-runtime-tcWNtVWY.js";import{i as t}from"./supabase-DJmkTfk1.js";async function n(){try{let{data:e,error:n}=await t.from(`teacher_class_fill_metrics_aggregated`).select(`*`).order(`maestro_nombre`,{ascending:!0});if(n)throw n;return e||[]}catch(e){throw console.error(`[getTeacherFillingMetrics] Error:`,e),e}}var r=e({analyticsFillingBehaviorWidget:()=>i});function i(e){let t=document.getElementById(e);function r(e){return`
      <div class="premium-table-container">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Maestro</th>
              <th>Total Clases</th>
              <th>Asistencia 1°</th>
              <th>Duración Obs (seg)</th>
              <th>IA Promedio</th>
            </tr>
          </thead>
          <tbody>
            ${e.map(e=>`
              <tr>
                <td><strong>${e.maestro_nombre}</strong></td>
                <td><span class="badge bg-secondary bg-opacity-10 text-secondary px-2 py-1">${e.total_clases||0}</span></td>
                <td><span class="badge bg-primary bg-opacity-10 text-primary px-2 py-1">${e.orden_asistencia_primero||0}</span></td>
                <td><span class="badge bg-warning bg-opacity-10 text-warning px-2 py-1">${e.promedio_duracion_observaciones||0}s</span></td>
                <td>
                  <span class="badge ${e.uso_ai_fill_percent>70?`bg-success text-white`:e.uso_ai_fill_percent>30?`bg-primary text-white`:`bg-secondary bg-opacity-10 text-secondary`} px-2 py-1">
                    ${e.uso_ai_fill_percent||0}%
                  </span>
                </td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      </div>
    `}function i(e){let t=e.length,n=e.filter(e=>e.orden_asistencia_primero===1).length,r=e.filter(e=>e.orden_observaciones_primero===1).length,i=e.filter(e=>e.orden_simultaneo===1).length,a=e.length>0?(e.reduce((e,t)=>e+(t.uso_ai_fill_percent||0),0)/e.length).toFixed(1):0;return{asistenciaPrimero:t>0?(n/t*100).toFixed(1):0,observacionesPrimero:t>0?(r/t*100).toFixed(1):0,simultaneo:t>0?(i/t*100).toFixed(1):0,avgAiUsage:a,total:t}}return{async init(){t.innerHTML=`
        <div class="premium-loading">
          <div class="premium-loading-spinner"></div>
          <div>Cargando analítica...</div>
        </div>
      `;try{let e=await n();if(!e||e.length===0){t.innerHTML=`
            <div class="analytics-widget">
              <div class="premium-no-data">No hay datos disponibles</div>
            </div>
          `;return}this.render(e)}catch(e){console.error(`[analyticsFillingBehaviorWidget] Error:`,e),t.innerHTML=`
          <div class="premium-error-card">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <div>Error cargando analítica: ${e.message}</div>
          </div>
        `}},render(e){if(e.length===0)return;let n=i(e);t.innerHTML=`
        <div class="analytics-widget">
          <h2><i class="bi bi-bar-chart-steps text-primary"></i> Analítica de Llenado de Asistencias</h2>
          
          <div class="stats-grid">
            <div class="stat-card primary">
              <div class="stat-label">Asistencia Primero</div>
              <div class="stat-value">${n.asistenciaPrimero}%</div>
              <div class="stat-subtitle">Orden de llenado preferido</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Observaciones Primero</div>
              <div class="stat-value">${n.observacionesPrimero}%</div>
              <div class="stat-subtitle">Enfoque en comentarios</div>
            </div>
            <div class="stat-card warning">
              <div class="stat-label">Simultáneo</div>
              <div class="stat-value">${n.simultaneo}%</div>
              <div class="stat-subtitle">Registro en tiempo real</div>
            </div>
            <div class="stat-card success">
              <div class="stat-label">Uso IA Promedio</div>
              <div class="stat-value">${n.avgAiUsage}%</div>
              <div class="stat-subtitle">Asistente activado</div>
            </div>
          </div>

          <section class="maestro-metrics-section">
            <h3>Detalle por Maestro</h3>
            ${r(e)}
          </section>
        </div>
      `}}}export{r as n,n as r,i as t};