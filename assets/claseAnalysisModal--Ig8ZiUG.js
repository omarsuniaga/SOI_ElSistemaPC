import{i as e}from"./supabase-KnARm58N.js";import{a as t,n}from"./groqService-mbMO9U99.js";async function r(e,r=null){try{let i=``;r&&r.sesiones&&r.sesiones.length>0&&(i=`

CONTENIDO CUBIERTO (últimas 4 semanas):
${r.sesiones.slice(0,8).map(e=>`
${e.fecha}: "${e.contenido}"
  ├─ Presentes: ${e.totalPresentes} alumnos
  └─ Ausentes: ${e.totalAusentes} alumnos
  Detalle: ${e.detalleAlumnos.map(e=>`${e.alumnoNombre} (${e.estado}${e.tieneObs?` ✓obs`:` ✗obs`})`).join(`, `)}
`).join(``)}

ANÁLISIS DE GAPS:
Identifica alumnos que faltaron a sesiones donde se cubrió contenido clave,
y si están atrás vs el grupo (no tienen observaciones sobre ese contenido mientras otros sí).
`);let a=await n([{role:`user`,content:`
Analiza esta clase y proporciona un resumen útil para el maestro:

CLASE: ${e.nombre}
Instrumento: ${e.instrumento||`N/A`}
Cumplimiento: ${e.cumplimiento}%
Total alumnos: ${e.totalAlumnos}
Alumnos presentes (última sesión): ${e.alumnosPresentes||`N/A`}
Alumnos ausentes: ${e.alumnosAusentes||`N/A`}
Registros completados: ${e.registrosCompletos||0}
Alumnos en riesgo: ${e.alumnosEnRiesgo||0}
${e.alumnosEnRiesgoDetalle?`Razón riesgo: `+e.alumnosEnRiesgoDetalle:``}
${i}

Proporciona en JSON el siguiente análisis:
{
  "resumen": "2-3 líneas resumiendo el estado de la clase",
  "fortalezas": ["punto 1", "punto 2"],
  "preocupaciones": ["punto 1: detalle con nombres de alumnos si aplica", "punto 2"],
  "recomendaciones": ["acción 1", "acción 2", "acción 3"],
  "alerta": "null o texto breve si hay algo crítico (ej: 'Juan lleva 2 semanas de faltas, se perdió escalas')"
}

Sé directo, pedagógico y actionable. Responde SOLO JSON válido.`}]);try{return t(a)}catch(e){return console.error(`[ClaseAnalysis] Parse error:`,e,`| raw:`,a),null}}catch(e){return console.error(`[ClaseAnalysis] Error:`,e),null}}async function i(t,n,r=4){try{let i=new Date(new Date(n).getTime()-r*7*24*60*60*1e3).toISOString().split(`T`)[0],{data:a}=await e.from(`sesiones_clase`).select(`id, fecha, contenido, asistencia`).eq(`clase_id`,t).gte(`fecha`,i).lte(`fecha`,n).order(`fecha`,{ascending:!1});if(!a||a.length===0)return{sesiones:[],tracking:[]};let{data:o}=await e.from(`observaciones_alumnos`).select(`id, alumno_id, contenido, created_at`).eq(`clase_id`,t).gte(`created_at`,i+`T00:00:00`),s={};o&&o.forEach(e=>{s[e.alumno_id]||(s[e.alumno_id]=[]),s[e.alumno_id].push(e.contenido)});let{data:c}=await e.from(`alumnos`).select(`id, nombre_completo`),l=Object.fromEntries((c||[]).map(e=>[e.id,e.nombre_completo]));return{sesiones:a.map(e=>{let t=Array.isArray(e.asistencia)?e.asistencia:[],n=t.filter(e=>e.estado===`P`).map(e=>e.alumno_id||e),r=t.filter(e=>e.estado===`A`).map(e=>e.alumno_id||e);return{fecha:e.fecha,contenido:e.contenido||`(sin descripción)`,totalPresentes:n.length,totalAusentes:r.length,asistentes:n.map(e=>l[e]||`Desconocido`),ausentes:r.map(e=>l[e]||`Desconocido`),detalleAlumnos:t.map(e=>({alumnoId:e.alumno_id||e,alumnoNombre:l[e.alumno_id||e]||`Desconocido`,estado:e.estado,tieneObs:s[e.alumno_id||e]?.length>0,obsPreview:s[e.alumno_id||e]?.[0]||null}))}}),alumnoMap:l,obsPorAlumno:s}}catch(e){return console.error(`[ContentTracking] Error:`,e),{sesiones:[],tracking:[],alumnoMap:{},obsPorAlumno:{}}}}async function a(t,n,r=4){try{console.log(`[getClaseDataForAnalysis] Iniciando con claseId:`,t,`fecha:`,n,`semanas:`,r);let{data:i,error:a}=await e.from(`clases`).select(`id, nombre, instrumento`).eq(`id`,t).maybeSingle();if(console.log(`[getClaseDataForAnalysis] Clase:`,i,`Error:`,a),!i)return console.warn(`[getClaseDataForAnalysis] No se encontró clase con id:`,t),null;let{data:o}=await e.from(`inscripciones`).select(`alumno_id`).eq(`clase_id`,t),s=o?.length||0,c=new Date(new Date(n).getTime()-r*7*24*60*60*1e3).toISOString().split(`T`)[0],{data:l}=await e.from(`sesiones_clase`).select(`asistencia, contenido, borrador`).eq(`clase_id`,t).gte(`fecha`,c).order(`fecha`,{ascending:!1}).limit(1),u=l?.[0],d=Array.isArray(u?.asistencia)?u.asistencia.filter(e=>e.estado===`P`).length:0,f=s-d,{data:p}=await e.from(`sesiones_clase`).select(`asistencia, contenido, borrador`).eq(`clase_id`,t).gte(`fecha`,c).order(`fecha`,{ascending:!1}).limit(10),m=(p||[]).filter(e=>{let t=Array.isArray(e.asistencia)&&e.asistencia.length>0,n=typeof e.contenido==`string`&&e.contenido.trim().length>0;return t||e.borrador===!1&&n}).length,h=(p||[]).length-m,g=p&&p.length>0?Math.round(m/p.length*100):0,_=new Date(new Date(n).getTime()-672*60*60*1e3).toISOString().split(`T`)[0],{data:v}=await e.from(`asistencias`).select(`alumno_id, estado`).eq(`clase_id`,t).gte(`fecha`,_),y={};v&&v.forEach(e=>{y[e.alumno_id]||(y[e.alumno_id]={total:0,presentes:0}),y[e.alumno_id].total++,e.estado===`P`&&y[e.alumno_id].presentes++});let b=Object.values(y).filter(e=>e.total>=3&&e.presentes/e.total<.7).length;return{id:t,nombre:i.nombre,instrumento:i.instrumento||`Sin especificar`,cumplimiento:g,totalAlumnos:s,alumnosPresentes:d,alumnosAusentes:f,registrosCompletos:m,registrosPendientes:h,alumnosEnRiesgo:b,alumnosEnRiesgoDetalle:b>0?`${b} alumno(s) con <70% asistencia`:null}}catch(e){return console.error(`[ClaseDataForAnalysis] Error:`,e),null}}async function o(e,t=new Date().toISOString().split(`T`)[0],n=4){let o=document.createElement(`div`);o.className=`clase-analysis-backdrop`,o.innerHTML=`
    <div class="clase-analysis-modal">
      <div class="clase-analysis-header">
        <h3>Análisis de la Clase</h3>
        <button class="clase-analysis-close" aria-label="Cerrar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="clase-analysis-body">
        <div class="clase-analysis-loading">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <p>Analizando datos...</p>
        </div>
      </div>
    </div>
  `,document.body.appendChild(o),o.querySelector(`.clase-analysis-close`).addEventListener(`click`,()=>o.remove()),o.addEventListener(`click`,e=>{e.target===o&&o.remove()});try{let[s,c]=await Promise.all([a(e,t,n),i(e,t,n)]);if(!s)throw Error(`No se pudo obtener datos de la clase`);let l=await r(s,c),u=o.querySelector(`.clase-analysis-body`);l?u.innerHTML=`
        <div class="clase-analysis-content">
          <div class="clase-info">
            <strong>${s.nombre}</strong>
            <small>${s.instrumento}</small>
          </div>

          ${c&&c.sesiones&&c.sesiones.length>0?`
            <div class="content-tracking-section">
              <h4>📚 Contenido de las últimas semanas</h4>
              ${c.sesiones.slice(0,5).map(e=>`
                <div class="content-item">
                  <div class="content-date">${e.fecha}</div>
                  <div class="content-title">${e.contenido}</div>
                  <div class="content-attendance">
                    <span class="badge badge-success">${e.totalPresentes} presentes</span>
                    ${e.totalAusentes>0?`<span class="badge badge-danger">${e.totalAusentes} ausentes</span>`:``}
                  </div>
                </div>
              `).join(``)}
            </div>
          `:``}

          <div class="analysis-section">
            <h4>Resumen</h4>
            <p>${l.resumen||`Sin resumen disponible`}</p>
          </div>

          ${l.alerta?`
            <div class="analysis-alert">
              <i class="bi bi-exclamation-triangle-fill"></i>
              ${l.alerta}
            </div>
          `:``}

          ${l.fortalezas&&l.fortalezas.length>0?`
            <div class="analysis-section">
              <h4 class="text-success">✓ Fortalezas</h4>
              <ul class="analysis-list">
                ${l.fortalezas.map(e=>`<li>${e}</li>`).join(``)}
              </ul>
            </div>
          `:``}

          ${l.preocupaciones&&l.preocupaciones.length>0?`
            <div class="analysis-section">
              <h4 class="text-warning">⚠ Preocupaciones</h4>
              <ul class="analysis-list">
                ${l.preocupaciones.map(e=>`<li>${e}</li>`).join(``)}
              </ul>
            </div>
          `:``}

          ${l.recomendaciones&&l.recomendaciones.length>0?`
            <div class="analysis-section">
              <h4 class="text-info">💡 Recomendaciones</h4>
              <ul class="analysis-list">
                ${l.recomendaciones.map(e=>`<li>${e}</li>`).join(``)}
              </ul>
            </div>
          `:``}

          <div class="analysis-metrics">
            <div class="metric">
              <span class="metric-label">Cumplimiento</span>
              <span class="metric-value">${s.cumplimiento}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Alumnos</span>
              <span class="metric-value">${s.totalAlumnos}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Presentes</span>
              <span class="metric-value">${s.alumnosPresentes}/${s.totalAlumnos}</span>
            </div>
            <div class="metric">
              <span class="metric-label">En riesgo</span>
              <span class="metric-value">${s.alumnosEnRiesgo}</span>
            </div>
          </div>
        </div>
      `:u.innerHTML=`
        <div class="clase-analysis-content">
          <div class="clase-info">
            <strong>${s.nombre}</strong>
            <small>${s.instrumento}</small>
          </div>
          <p class="text-muted">No fue posible generar el análisis. Verifícalo manualmente.</p>
          <div class="analysis-metrics">
            <div class="metric">
              <span class="metric-label">Cumplimiento</span>
              <span class="metric-value">${s.cumplimiento}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Alumnos</span>
              <span class="metric-value">${s.totalAlumnos}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Presentes</span>
              <span class="metric-value">${s.alumnosPresentes}/${s.totalAlumnos}</span>
            </div>
            <div class="metric">
              <span class="metric-label">En riesgo</span>
              <span class="metric-value">${s.alumnosEnRiesgo}</span>
            </div>
          </div>
        </div>
      `}catch(e){console.error(`[ClaseAnalysisModal] Error:`,e);let t=o.querySelector(`.clase-analysis-body`);t.innerHTML=`
      <div class="clase-analysis-content">
        <p class="text-danger">Error al cargar el análisis: ${e.message}</p>
      </div>
    `}}function s(){if(document.getElementById(`clase-analysis-styles`))return;let e=document.createElement(`style`);e.id=`clase-analysis-styles`,e.textContent=`
    .clase-analysis-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .clase-analysis-modal {
      background: var(--bs-body-bg);
      border-radius: 0.75rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .clase-analysis-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem;
      border-bottom: 1px solid var(--bs-border-color);
      background: var(--bs-secondary-bg);
    }

    .clase-analysis-header h3 {
      margin: 0;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .clase-analysis-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--bs-secondary);
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
      transition: all 0.2s;
    }

    .clase-analysis-close:hover {
      background: var(--bs-border-color);
      color: var(--bs-body-color);
    }

    .clase-analysis-body {
      overflow-y: auto;
      flex: 1;
      padding: 1.25rem;
    }

    .clase-analysis-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      min-height: 150px;
      color: var(--bs-secondary);
    }

    .clase-analysis-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .clase-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 1rem;
      background: var(--bs-secondary-bg);
      border-radius: 0.5rem;
    }

    .clase-info strong {
      font-size: 1rem;
      color: var(--bs-body-color);
    }

    .clase-info small {
      color: var(--bs-secondary);
      font-size: 0.8rem;
    }

    .analysis-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .analysis-section h4 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--bs-body-color);
    }

    .analysis-section p {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--bs-body-color);
    }

    .analysis-list {
      margin: 0;
      padding-left: 1.25rem;
      list-style: disc;
    }

    .analysis-list li {
      font-size: 0.9rem;
      line-height: 1.4;
      color: var(--bs-body-color);
      margin-bottom: 0.4rem;
    }

    .analysis-alert {
      padding: 0.75rem 1rem;
      background: rgba(220, 38, 38, 0.1);
      border-left: 3px solid #dc2626;
      border-radius: 0.25rem;
      color: #991b1b;
      font-size: 0.9rem;
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .analysis-alert i {
      margin-top: 2px;
      flex-shrink: 0;
    }

    .analysis-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--bs-border-color);
    }

    .metric {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem;
      background: var(--bs-secondary-bg);
      border-radius: 0.5rem;
      text-align: center;
    }

    .metric-label {
      font-size: 0.75rem;
      color: var(--bs-secondary);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--bs-primary);
    }

    .content-tracking-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--bs-secondary-bg);
      border-radius: 0.5rem;
      border-left: 3px solid var(--bs-info, #0dcaf0);
    }

    .content-tracking-section h4 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--bs-body-color);
    }

    .content-item {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      padding: 0.5rem;
      background: var(--bs-body-bg);
      border-radius: 0.35rem;
      border-left: 2px solid var(--bs-info, #0dcaf0);
    }

    .content-date {
      font-size: 0.75rem;
      color: var(--bs-secondary);
      font-weight: 600;
    }

    .content-title {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--bs-body-color);
      line-height: 1.3;
    }

    .content-attendance {
      display: flex;
      gap: 0.4rem;
      font-size: 0.75rem;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-weight: 500;
    }

    .badge-success {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }

    .badge-danger {
      background: rgba(220, 38, 38, 0.15);
      color: #dc2626;
    }

    .text-success { color: #10b981; }
    .text-warning { color: #f59e0b; }
    .text-info { color: #0dcaf0; }
    .text-danger { color: #dc2626; }
    .text-muted { color: var(--bs-secondary); }
  `,document.head.appendChild(e)}s();export{o as t};