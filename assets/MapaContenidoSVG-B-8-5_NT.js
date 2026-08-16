import{r as e}from"./AppModal-Du6jXNYA.js";var t={0:`#94a3b8`,1:`#f59e0b`,2:`#3b82f6`,3:`#10b981`};function n(e){return e===`logrado`?`#10b981`:e===`en_proceso`?`#f59e0b`:`#3b82f6`}function r({container:r,nodos:i=[],modo:a=`sesion`,onNodeClick:o=null,onAddNodeClick:s=null}){if(!r)return;let c=i.some(e=>e.unidadNombre),l=c?28:0,u=230+l,d=95+l,f=``;if(i.length>1){let e=`M 70 ${d}`;i.forEach((t,n)=>{if(n>0){let t=70+n*180,r=(70+(n-1)*180+t)/2,i=n%2==0?-20:20;e+=` C ${r} ${d+i}, ${r} ${d+i}, ${t} ${d}`}}),f=e}let p=70+(i.length+1)*180+40;r.innerHTML=`
    <div class="card border border-secondary-subtle shadow-sm rounded-4 p-3 bg-body-tertiary overflow-x-auto mb-3">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
          <i class="bi bi-diagram-3 me-1"></i>Ruta de Contenido Didáctico (SVG)
        </span>
        <span class="text-muted small"><i class="bi bi-hand-index me-1"></i>Toca un nodo para evaluar a los alumnos</span>
      </div>
      ${`
    <svg width="${p}" height="${u}" viewBox="0 0 ${p} ${u}" class="mapa-svg-canvas" style="min-width: 100%;">
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

      ${f?`<path d="${f}" fill="none" stroke="url(#lineGrad)" stroke-width="4" stroke-linecap="round" />`:``}

      ${i.map((r,o)=>{let s=70+o*180,l=d,f=typeof r.estrellas==`number`,p=f&&(r.estadoVisual===`en_progreso`||r.estrellas===0),m=f?t[r.estrellas]??t[0]:n(r.estado),h=r.titulo||r.nombre||`Indicador ${o+1}`,g=h.split(`:`),_=(g[1]||g[0]).trim(),v=_.length>22?_.slice(0,20)+`…`:_,y=a===`diseno`?`Editar objetivo`:`Evaluar nodo`,b=`${h}${typeof r.pctAvance==`number`?` — ${r.pctAvance}% de avance`:``}${r.unidadNombre?` · Unidad: ${r.unidadNombre}`:``}`,x=f?p?`En progreso`:`★`.repeat(r.estrellas):``,S=c&&r.unidadNombre&&r.unidadNombre!==i[o-1]?.unidadNombre,C=s-180/2,w=S?`
            ${o>0?`<line x1="${C}" y1="18" x2="${C}" y2="${u-10}" stroke="var(--bs-border-color-translucent, #334155)" stroke-width="1.5" stroke-dasharray="4 3" />`:``}
            <text x="${s}" y="16" text-anchor="middle" font-size="11" font-weight="700" fill="var(--bs-primary, #3b82f6)" class="svg-unidad-label">
              <tspan>${e(r.unidadNombre)}</tspan>
            </text>
          `:``;return`
          <g class="svg-node-group" data-id="${r.id}" data-modo="${a}" role="button" tabindex="0" aria-label="${y}: ${e(h)}" style="cursor: pointer;">
            <title>${e(b)}</title>
            ${w}
            <circle cx="${s}" cy="${l}" r="29" fill="${m}" opacity="0.2" />
            <circle cx="${s}" cy="${l}" r="24" fill="${m}" stroke="var(--bs-border-color, #ffffff)" stroke-width="3" filter="url(#glow)" />
            <text x="${s}" y="${l+5}" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">${o+1}</text>

            <text x="${s}" y="${l+24+18}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--bs-body-color, #e2e8f0)">
              <tspan x="${s}" dy="0">Clase ${o+1}</tspan>
              <tspan x="${s}" dy="14" font-size="10" font-weight="500" fill="var(--bs-secondary-color, #94a3b8)">${e(v)}</tspan>
              ${f?`<tspan class="svg-node-estrellas" x="${s}" dy="14" font-size="11" font-weight="700" fill="${p?`var(--bs-secondary-color, #94a3b8)`:`#f59e0b`}">${e(x)}</tspan>`:``}
            </text>
          </g>
        `}).join(``)}

      <!-- Botón Agregar Nodo Al Vuelo -->
      <g class="svg-add-node-group" style="cursor: pointer;">
        <circle cx="${70+i.length*180}" cy="${d}" r="22" fill="var(--bs-border-color-translucent, #334155)" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
        <text x="${70+i.length*180}" y="${d+6}" text-anchor="middle" fill="var(--bs-body-color, #94a3b8)" font-size="18" font-weight="bold">+</text>
        <text x="${70+i.length*180}" y="${d+38}" text-anchor="middle" fill="var(--bs-secondary-color, #94a3b8)" font-size="10" font-weight="600">Al Vuelo</text>
      </g>
    </svg>
  `}
    </div>
  `,r.querySelectorAll(`.svg-node-group`).forEach(e=>{let t=()=>{let t=e.dataset.id,n=i.find(e=>String(e.id)===String(t));o?.(n)};e.addEventListener(`click`,t),e.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),t())})}),r.querySelector(`.svg-add-node-group`)?.addEventListener(`click`,()=>{s?.()})}export{r as t};