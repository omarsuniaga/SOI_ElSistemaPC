import{i as e}from"./supabase-KnARm58N.js";import{i as t}from"./portalUtils-C92TBVO0.js";var n={approved:`✅`,in_process:`🔄`,pending:`⏳`,failed:`❌`};function r({studentId:r,levelId:i,onConfirm:a}){let o=null;async function s(){let{data:s,error:l}=await e.from(`levels`).select(`*`).eq(`id`,i).single();if(l){console.error(`Error fetching level:`,l);return}let{data:u,error:d}=await e.from(`student_node_progress`).select(`status, nodes(name, is_critical, order_index)`).eq(`student_id`,r).eq(`nodes.level_id`,i).order(`nodes(order_index)`,{ascending:!0});if(d){console.error(`Error fetching node progress:`,d);return}let f=(u||[]).filter(e=>e.nodes),p=f.length>0&&f.every(e=>e.status===`approved`),m=f.map(e=>{let r=n[e.status]||`⏳`,i=e.nodes.is_critical?`<span class="pm-level-modal-critical">Crítico</span>`:``;return`
        <li class="pm-level-modal-node">
          <span class="pm-level-modal-node-icon">${r}</span>
          <span class="pm-level-modal-node-name">${t(e.nodes.name)}</span>
          ${i}
        </li>`}).join(``),h=document.getElementById(`pm-level-completion-modal`);h&&h.remove(),o=document.createElement(`div`),o.id=`pm-level-completion-modal`,o.className=`pm-drawer-overlay`,o.innerHTML=`
      <div class="pm-level-modal">
        <div class="pm-level-modal-header">
          <button class="pm-level-modal-close" id="pm-level-modal-close">&times;</button>
          <i class="bi bi-trophy pm-level-modal-icon"></i>
          <h3 class="pm-level-modal-title">¡Nivel Completado!</h3>
          <p class="pm-level-modal-level-name">${t(s.name||s.title||``)}</p>
        </div>

        <ul class="pm-level-modal-nodes">
          ${m}
        </ul>

        ${p?`
          <div class="pm-level-modal-confirm-section">
            <label class="pm-level-modal-label" for="pm-level-modal-notes">Notas finales del maestro</label>
            <textarea id="pm-level-modal-notes" class="pm-level-modal-textarea" rows="3" placeholder="Observaciones opcionales..."></textarea>
            <button class="pm-btn pm-btn-primary pm-btn-block pm-level-modal-btn" id="pm-level-modal-confirm">
              Confirmar Aprobación
            </button>
          </div>
        `:`
          <div class="pm-level-modal-warning">
            <i class="bi bi-exclamation-triangle"></i>
            <span>Faltan nodos por aprobar</span>
          </div>
          <button class="pm-btn pm-btn-primary pm-btn-block pm-level-modal-btn" disabled>
            Confirmar Aprobación
          </button>
        `}
      </div>
    `,document.body.appendChild(o),setTimeout(()=>o.classList.add(`open`),10);let g=o.querySelector(`#pm-level-modal-close`);g&&g.addEventListener(`click`,c),o.addEventListener(`click`,e=>{e.target===o&&c()});let _=o.querySelector(`#pm-level-modal-confirm`);_&&_.addEventListener(`click`,async()=>{_.disabled=!0,_.textContent=`Guardando...`;let t=o.querySelector(`#pm-level-modal-notes`)?.value||``,{error:n}=await e.from(`student_level_progress`).update({status:`approved`,completed_at:new Date().toISOString(),teacher_notes:t}).eq(`student_id`,r).eq(`level_id`,i);if(n){console.error(`Error updating level progress:`,n),_.disabled=!1,_.textContent=`Confirmar Aprobación`;return}typeof a==`function`&&a({studentId:r,levelId:i,notes:t}),c()})}function c(){o&&(o.classList.remove(`open`),setTimeout(()=>{o?.remove(),o=null},400))}function l(){o&&=(o.remove(),null)}return{open:s,close:c,destroy:l}}export{r as createLevelCompletionModal};