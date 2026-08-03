import{r as e}from"./AppModal-Du6jXNYA.js";import{i as t}from"./supabase-Cgh_dhNB.js";var n=3,r=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;function i(e){return typeof e==`string`&&r.test(e)}function a(e){return typeof e==`string`&&/^(nd|demo|local|obj|ind|al|clase|nodo|alu|mae|stu|ses|plan|route|node|tarea|item|preview|temp)-/i.test(e)}function o(e){return e.some(e=>typeof e==`string`&&!i(e)&&a(e))}function s(e){return e!=null&&e>=n}async function c(e){if(!e.alumno_id)throw Error(`alumno_id es requerido`);if(!e.clase_id)throw Error(`clase_id es requerido`);let n=e.indicator_id!==void 0&&e.indicator_id!==null,r=e.clase_indicador_id!==void 0&&e.clase_indicador_id!==null;if(!n&&!r)throw Error(`Se requiere indicator_id o clase_indicador_id`);if(n&&r)throw Error(`Se requiere exactamente uno de indicator_id o clase_indicador_id, no ambos (ei_una_sola_fuente)`);if(o([e.alumno_id,e.clase_id,e.indicator_id,e.clase_indicador_id]))return console.warn(`[registrarEvaluacion] Se omite la escritura remota para IDs virtuales/no UUID:`,e),null;if(e.nota!==null&&e.nota!==void 0&&(e.nota<1||e.nota>5))throw Error(`La nota debe estar entre 1 y 5`);let i={alumno_id:e.alumno_id,clase_id:e.clase_id,indicator_id:n?e.indicator_id:null,clase_indicador_id:r?e.clase_indicador_id:null,nota:e.nota??null,estado:e.estado||`sin_evaluar`,observaciones:e.observaciones||null,evaluado_por:e.evaluado_por||null,fecha_evaluacion:new Date().toISOString()},a=r?`alumno_id,clase_indicador_id`:`alumno_id,indicator_id,clase_id`,{data:s,error:c}=await t.from(`evaluacion_indicador`).upsert(i,{onConflict:a}).select().single();if(c)throw c;return s}async function l(e){let{data:n,error:r}=await t.from(`evaluacion_indicador`).select(`*`).eq(`clase_id`,e).order(`created_at`,{ascending:!1});if(r)throw r;return n||[]}async function u(e){let{data:n,error:r}=await t.rpc(`fn_evaluacion_indicadores_por_clase`,{p_clase_id:e});if(r)throw r;return n||[]}var d={0:`#94a3b8`,1:`#f59e0b`,2:`#3b82f6`,3:`#10b981`};function f(e){return e===`logrado`?`#10b981`:e===`en_proceso`?`#f59e0b`:`#3b82f6`}function p({container:t,nodos:n=[],modo:r=`sesion`,onNodeClick:i=null,onAddNodeClick:a=null}){if(!t)return;let o=``;if(n.length>1){let e=`M 70 95`;n.forEach((t,n)=>{if(n>0){let t=70+n*180,r=(70+(n-1)*180+t)/2,i=n%2==0?-20:20;e+=` C ${r} ${95+i}, ${r} ${95+i}, ${t} 95`}}),o=e}let s=70+(n.length+1)*180+40;t.innerHTML=`
    <div class="card border border-secondary-subtle shadow-sm rounded-4 p-3 bg-body-tertiary overflow-x-auto mb-3">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
          <i class="bi bi-diagram-3 me-1"></i>Ruta de Contenido Didáctico (SVG)
        </span>
        <span class="text-muted small"><i class="bi bi-hand-index me-1"></i>Toca un nodo para evaluar a los alumnos</span>
      </div>
      ${`
    <svg width="${s}" height="230" viewBox="0 0 ${s} 230" class="mapa-svg-canvas" style="min-width: 100%;">
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="50%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#10b981" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      ${o?`<path d="${o}" fill="none" stroke="url(#lineGrad)" stroke-width="4" stroke-linecap="round" />`:``}

      ${n.map((t,n)=>{let i=70+n*180,a=typeof t.estrellas==`number`,o=a&&(t.estadoVisual===`en_progreso`||t.estrellas===0),s=a?d[t.estrellas]??d[0]:f(t.estado),c=t.titulo||t.nombre||`Indicador ${n+1}`,l=c.split(`:`),u=(l[1]||l[0]).trim(),p=u.length>22?u.slice(0,20)+`…`:u,m=r===`diseno`?`Editar objetivo`:`Evaluar nodo`,h=`${c}${typeof t.pctAvance==`number`?` — ${t.pctAvance}% de avance`:``}`,g=a?o?`En progreso`:`★`.repeat(t.estrellas):``;return`
          <g class="svg-node-group" data-id="${t.id}" data-modo="${r}" role="button" tabindex="0" aria-label="${m}: ${e(c)}" style="cursor: pointer;">
            <title>${e(h)}</title>
            <circle cx="${i}" cy="95" r="29" fill="${s}" opacity="0.2" />
            <circle cx="${i}" cy="95" r="24" fill="${s}" stroke="var(--bs-border-color, #ffffff)" stroke-width="3" filter="url(#glow)" />
            <text x="${i}" y="100" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">${n+1}</text>

            <text x="${i}" y="137" text-anchor="middle" font-size="11" font-weight="700" fill="var(--bs-body-color, #e2e8f0)">
              <tspan x="${i}" dy="0">Clase ${n+1}</tspan>
              <tspan x="${i}" dy="14" font-size="10" font-weight="500" fill="var(--bs-secondary-color, #94a3b8)">${e(p)}</tspan>
              ${a?`<tspan class="svg-node-estrellas" x="${i}" dy="14" font-size="11" font-weight="700" fill="${o?`var(--bs-secondary-color, #94a3b8)`:`#f59e0b`}">${e(g)}</tspan>`:``}
            </text>
          </g>
        `}).join(``)}

      <!-- Botón Agregar Nodo Al Vuelo -->
      <g class="svg-add-node-group" style="cursor: pointer;">
        <circle cx="${70+n.length*180}" cy="95" r="22" fill="var(--bs-border-color-translucent, #334155)" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
        <text x="${70+n.length*180}" y="101" text-anchor="middle" fill="var(--bs-body-color, #94a3b8)" font-size="18" font-weight="bold">+</text>
        <text x="${70+n.length*180}" y="133" text-anchor="middle" fill="var(--bs-secondary-color, #94a3b8)" font-size="10" font-weight="600">Al Vuelo</text>
      </g>
    </svg>
  `}
    </div>
  `,t.querySelectorAll(`.svg-node-group`).forEach(e=>{let t=()=>{let t=e.dataset.id,r=n.find(e=>String(e.id)===String(t));i?.(r)};e.addEventListener(`click`,t),e.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),t())})}),t.querySelector(`.svg-add-node-group`)?.addEventListener(`click`,()=>{a?.()})}export{c as a,u as i,s as n,l as r,p as t};