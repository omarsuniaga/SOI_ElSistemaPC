import{i as e}from"./portalUtils-DbrsCFDo.js";import{i as t}from"./planningService-CW5PRb28.js";var n={ESCALA:`🎼`,ARPEGIO:`🎹`,MANO_IZQ:`✋`,ARCO:`🎻`,SONIDO:`🔊`,AFINACION:`🎵`,TECNICA:`⚙️`,REPERTORIO:`📖`};function r(e){return n[e]||`•`}async function i(e,{routeVersionId:n}){let r=await t(n);if(!r||r.length===0){e.innerHTML=`<div class="pm-planning-empty"><p>Esta ruta aún no tiene estructura configurada.</p></div>`;return}e.innerHTML=`
    <style>
      .pm-rt-root { display: flex; flex-direction: column; gap: 0.75rem; }
      .pm-rt-block { border: 1px solid var(--pm-border); border-radius: 12px; overflow: hidden; background: var(--pm-surface); }
      .pm-rt-block-head { padding: 0.9rem 1rem; background: var(--pm-surface-2); }
      .pm-rt-block-name { font-weight: 700; font-size: 1rem; color: var(--pm-text); }
      .pm-rt-block-obj { font-size: 0.78rem; color: var(--pm-text-muted); margin-top: 2px; }

      .pm-rt-toggle { display: flex; align-items: center; gap: 0.6rem; cursor: pointer; padding: 0.7rem 1rem; user-select: none; }
      .pm-rt-toggle:hover { background: var(--pm-surface-2); }
      .pm-rt-arrow { transition: transform 0.2s; color: var(--pm-text-muted); font-size: 0.75rem; }
      .pm-rt-open > .pm-rt-toggle .pm-rt-arrow { transform: rotate(90deg); }
      .pm-rt-children { display: none; }
      .pm-rt-open > .pm-rt-children { display: block; }

      .pm-rt-level { border-top: 1px solid var(--pm-border); }
      .pm-rt-level-num { width: 26px; height: 26px; flex-shrink: 0; background: var(--pm-primary); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.78rem; }
      .pm-rt-level-name { font-weight: 600; font-size: 0.9rem; }
      .pm-rt-level-obj { display: block; font-size: 0.72rem; color: var(--pm-text-muted); }

      .pm-rt-node { border-top: 1px solid var(--pm-border); padding-left: 1rem; }
      .pm-rt-node-icon { font-size: 1rem; }
      .pm-rt-node-name { font-weight: 600; font-size: 0.85rem; }
      .pm-rt-node-critical { font-size: 0.6rem; font-weight: 700; color: var(--pm-danger); border: 1px solid var(--pm-danger); border-radius: 4px; padding: 1px 4px; margin-left: 4px; }
      .pm-rt-count { margin-left: auto; font-size: 0.7rem; color: var(--pm-text-muted); }

      .pm-rt-indicators { list-style: none; margin: 0; padding: 0.5rem 1rem 0.75rem 2.5rem; }
      .pm-rt-indicator { font-size: 0.8rem; color: var(--pm-text); padding: 0.25rem 0; display: flex; gap: 0.4rem; }
      .pm-rt-indicator::before { content: '◦'; color: var(--pm-primary); }
      .pm-rt-indicator.required::before { content: '★'; color: var(--pm-warning, #fbbf24); }

      @media (max-width: 640px) {
        .pm-rt-toggle { padding: 0.6rem 0.75rem; }
        .pm-rt-indicators { padding-left: 1.5rem; }
      }
    </style>
    <div class="pm-rt-root">
      ${r.map(e=>a(e)).join(``)}
    </div>
  `,e.querySelectorAll(`.pm-rt-toggle`).forEach(e=>{e.addEventListener(`click`,()=>{e.closest(`[data-collapsible]`)?.classList.toggle(`pm-rt-open`)})})}function a(t){return`
    <div class="pm-rt-block">
      <div class="pm-rt-block-head">
        <div class="pm-rt-block-name">${e(t.name||`Bloque`)}</div>
        ${t.objective?`<div class="pm-rt-block-obj">${e(t.objective)}</div>`:``}
      </div>
      ${(t.levels||[]).map(e=>o(e)).join(``)}
    </div>
  `}function o(t){let n=(t.nodes||[]).length;return`
    <div class="pm-rt-level" data-collapsible>
      <div class="pm-rt-toggle">
        <i class="bi bi-chevron-right pm-rt-arrow"></i>
        <div class="pm-rt-level-num">${t.level_number??`·`}</div>
        <div>
          <span class="pm-rt-level-name">${e(t.name||`Nivel`)}</span>
          ${t.main_objective?`<span class="pm-rt-level-obj">${e(t.main_objective)}</span>`:``}
        </div>
        <span class="pm-rt-count">${n} nodo${n===1?``:`s`}</span>
      </div>
      <div class="pm-rt-children">
        ${(t.nodes||[]).map(e=>s(e)).join(``)}
      </div>
    </div>
  `}function s(t){let n=t.indicators||[];return`
    <div class="pm-rt-node" data-collapsible>
      <div class="pm-rt-toggle">
        <i class="bi bi-chevron-right pm-rt-arrow"></i>
        <span class="pm-rt-node-icon">${r(t.type)}</span>
        <span class="pm-rt-node-name">${e(t.name||`Nodo`)}</span>
        ${t.is_critical?`<span class="pm-rt-node-critical">CRÍTICO</span>`:``}
        <span class="pm-rt-count">${n.length} ind.</span>
      </div>
      <div class="pm-rt-children">
        <ul class="pm-rt-indicators">
          ${n.length?n.map(t=>`<li class="pm-rt-indicator ${t.is_required?`required`:``}">${e(t.nombre||t.description||`Indicador`)}</li>`).join(``):`<li class="pm-rt-indicator">Sin indicadores</li>`}
        </ul>
      </div>
    </div>
  `}export{i as renderPlanningRouteTree};