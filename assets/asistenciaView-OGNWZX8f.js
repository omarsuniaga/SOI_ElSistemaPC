const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/routeMock-SFasgq6d.js","assets/AppToast-DNGTRY9B.js","assets/academicService-or-p50Yc.js","assets/supabase-Dhe7Tlxd.js","assets/preload-helper-CZgWQFsJ.js","assets/LevelCompletionModal-BD2bYe3b.js","assets/portalUtils-CkF82Yyk.js","assets/AchievementsSummaryModal-CJ9jpoV7.js"])))=>i.map(i=>d[i]);
import{t as e}from"./AppToast-DNGTRY9B.js";import{c as t,n,r,s as i,t as a}from"./main-maestros-DhjjXu6q.js";import{a as o,i as s,n as c,r as l,s as u}from"./pwaInstaller-Cs9gG4Do.js";import{i as d}from"./supabase-Dhe7Tlxd.js";import{i as f}from"./maestroAuth-CdApllXF.js";import{t as p}from"./idb-CdbSE3_O.js";import{t as m}from"./preload-helper-CZgWQFsJ.js";import{t as h}from"./config-DI7hr8LK.js";import{T as g,i as _,l as v,n as y,o as b,r as x}from"./reportService-BB9UpLod.js";import{c as S,i as C,l as w,m as T,n as E,o as D,r as O,s as k,t as A,u as j}from"./weeklyPlanAdapter-D1qpirzw.js";import{c as M,i as ee,l as N,o as te,s as P,t as F}from"./groqService-CYFe0boH.js";import{t as I}from"./academicService-or-p50Yc.js";import{a as L,i as R,l as z,o as ne,s as re}from"./portalUtils-CkF82Yyk.js";import{t as ie}from"./a11yUtils-DRYT20ux.js";import{a as ae,i as oe,n as B,o as se,r as ce}from"./evaluationService-sL-uqIru.js";function le(e={}){let{showSyncButton:n=!0}=e,r=document.createElement(`div`);r.className=`pm-sync-badge`,r.style.cssText=`
    display: none;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 11px;
    font-weight: 600;
    cursor: default;
    transition: all 0.2s ease;
    white-space: nowrap;
  `;let i=document.createElement(`span`);i.textContent=`☁️`,i.style.fontSize=`12px`;let a=document.createElement(`span`);a.textContent=``;let o=document.createElement(`button`);n&&(o.textContent=`Sincronizar`,o.style.cssText=`
      background: transparent;
      border: none;
      color: inherit;
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 8px;
      text-decoration: underline;
      text-underline-offset: 2px;
    `,o.addEventListener(`click`,async e=>{e.stopPropagation(),o.disabled=!0,window.dispatchEvent(new Event(`online`)),await s(),o.disabled=!1})),r.appendChild(i),r.appendChild(a),n&&r.appendChild(o);async function s(){let e=await t();if(e===0){r.style.display=`none`;return}r.style.display=`inline-flex`,r.style.background=`#fef3c7`,r.style.color=`#92400e`,r.style.border=`1px solid #fde68a`,i.textContent=`☁️`,a.textContent=`${e} pendiente${e===1?``:`s`}`,o&&(o.style.display=navigator.onLine?``:`none`)}function c(){setTimeout(s,2e3)}function l(){s()}return window.addEventListener(`online`,c),window.addEventListener(`offline`,l),s(),{el:r,destroy:()=>{window.removeEventListener(`online`,c),window.removeEventListener(`offline`,l),r.remove()},refresh:s}}function ue(e,{indicator:t,sessionId:n,studentId:r,teacherId:i,onSave:a}){let o=t.status||`pending`;I.getStatusToken(o);let s=document.createElement(`div`);s.className=`pm-node-eval-card pm-animate-fade-in status-${o}`,s.dataset.indicatorId=t.indicator_id,s.innerHTML=`
    <div class="pm-eval-card-header">
      <div class="pm-eval-node-info">
        <span class="pm-eval-node-name">${R(t.node_name)}</span>
        <p class="pm-eval-indicator-desc">${R(t.indicator_description||`Evaluación de nodo`)}</p>
      </div>
      ${t.is_critical?`<span class="pm-badge-critical" title="Nodo Crítico"><i class="bi bi-exclamation-octagon"></i></span>`:``}
    </div>

    <div class="pm-eval-status-selector">
      <button class="pm-eval-btn btn-approved ${o===`approved`?`active`:``}" data-status="approved">
        <i class="bi bi-check-lg"></i> Logrado
      </button>
      <button class="pm-eval-btn btn-in-process ${o===`in_process`?`active`:``}" data-status="in_process">
        <i class="bi bi-arrow-repeat"></i> En Proceso
      </button>
      <button class="pm-eval-btn btn-failed ${o===`failed`?`active`:``}" data-status="failed">
        <i class="bi bi-x-lg"></i> No Logrado
      </button>
    </div>

    <div class="pm-eval-feedback-area">
      <textarea placeholder="Feedback pedagógico (opcional)..." class="pm-eval-feedback-input">${R(t.feedback||``)}</textarea>
    </div>

    <div class="pm-eval-card-footer">
      <span class="pm-eval-save-status"></span>
    </div>
  `;let c=s.querySelectorAll(`.pm-eval-btn`),l=s.querySelector(`.pm-eval-feedback-input`),u=s.querySelector(`.pm-eval-save-status`),d=null,f=async(e=null)=>{let c=e||s.dataset.status||o;u.innerHTML=`<i class="pm-spinner-sm"></i> Guardando...`;try{let e={student_id:r,indicator_id:t.indicator_id,session_id:n,created_by:i,status:c,feedback:l.value,attempt_number:(t.attempt_number||0)+1};await I.saveIndicatorAttempt(e),u.innerHTML=`<i class="bi bi-check-all"></i> Guardado localmente`,s.className=`pm-node-eval-card status-${c}`,a&&a(e)}catch(e){console.error(`Error saving evaluation:`,e),u.innerHTML=`<i class="bi bi-exclamation-circle"></i> Error al guardar`}};c.forEach(e=>{e.onclick=()=>{let t=e.dataset.status;c.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),s.dataset.status=t,f(t)}}),l.oninput=()=>{d&&clearTimeout(d),d=setTimeout(()=>f(),1500)},e.appendChild(s)}function de(e,{student:t,sessionId:n,teacherId:r,snapshots:i=[]}){let a=document.getElementById(`pm-evaluation-drawer`);a&&a.remove();let o=document.createElement(`div`);o.id=`pm-evaluation-drawer`,o.className=`pm-drawer-overlay`,o.innerHTML=`
    <div class="pm-drawer">
      <div class="pm-drawer-header">
        <div class="pm-drawer-title-group">
          <h4 class="pm-drawer-title">Evaluar Avance</h4>
          <p class="pm-drawer-subtitle" style="font-size: 0.85rem; color: var(--pm-text-muted); margin: 0;">${R(t.nombre_completo)}</p>
        </div>
        <button class="pm-drawer-close" id="pm-close-eval-drawer">&times;</button>
      </div>
      
      <div class="pm-drawer-body pm-scroll-y">
        ${i.length===0?`
          <div class="pm-empty-state" style="text-align:center; padding: 2rem; color: var(--pm-text-muted);">
            <i class="bi bi-journal-check" style="font-size: 2.5rem; display: block; margin-bottom: 1rem;"></i>
            <p>No hay objetivos planificados para esta sesión.</p>
          </div>
        `:`
          <div id="pm-evaluation-cards-container" class="pm-eval-list"></div>
        `}
      </div>
      
      <div class="pm-drawer-footer" style="padding: 1rem; border-top: 1px solid var(--pm-border);">
        <button class="pm-btn pm-btn-primary pm-btn-block" id="pm-finish-eval" style="width:100%">Listo</button>
      </div>
    </div>
  `,e.appendChild(o);let s=o.querySelector(`#pm-evaluation-cards-container`);s&&i.forEach(e=>{ue(s,{indicator:e,sessionId:n,studentId:t.id,teacherId:r,onSave:e=>{console.log(`Progress saved:`,e)}})}),setTimeout(()=>o.classList.add(`open`),10);let c=()=>{o.classList.remove(`open`),setTimeout(()=>o.remove(),400)},l=o.querySelector(`#pm-close-eval-drawer`),u=o.querySelector(`#pm-finish-eval`);return l&&l.addEventListener(`click`,c),o.addEventListener(`click`,e=>{e.target===o&&c()}),u&&u.addEventListener(`click`,c),{close:c}}function fe(e,{onAceptar:t}){let n=document.getElementById(`pm-generar-informe-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-generar-informe-modal`,n.className=`pm-modal-overlay`,n.innerHTML=`
      <div class="pm-modal-content pm-generar-informe-content">
        <div class="pm-modal-header" style="background: rgba(99, 102, 241, 0.1);">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--pm-primary);">
            📋 Generar Informe
          </h3>
          <button class="pm-modal-close" id="pm-informe-close">&times;</button>
        </div>
        <div class="pm-modal-body pm-generar-informe-body">
          <p style="font-size:0.85rem;color:var(--pm-text-muted);margin:0 0 1rem;">
            Este informe es para compartir con padres o tutores. No se registra como evaluación.
          </p>
          <div id="pm-informe-original-panel" style="display:none; margin-bottom:1rem;">
            <h4 style="margin:0 0 0.5rem;font-size:0.8rem;color:var(--pm-text-muted);">Tu registro original</h4>
            <div id="pm-informe-original" class="pm-informe-text" style="background:var(--pm-surface-2);border:1px solid var(--pm-border);border-radius:var(--pm-radius-sm);padding:0.75rem;font-size:0.85rem;color:var(--pm-text-muted);white-space:pre-wrap;max-height:120px;overflow-y:auto;"></div>
          </div>
          <h4 style="margin:0 0 0.5rem;font-size:0.85rem;color:var(--pm-text);font-weight:600;">Informe generado</h4>
          <div id="pm-informe-texto" class="pm-informe-text" contenteditable="true"
            style="background:var(--pm-surface);border:1.5px solid var(--pm-primary);border-radius:var(--pm-radius-sm);padding:0.75rem;min-height:180px;max-height:300px;overflow-y:auto;color:var(--pm-text);font-size:0.9rem;line-height:1.6;white-space:pre-wrap;"></div>

          <div class="pm-informe-acciones">
            <button class="pm-btn pm-btn-share" id="btn-informe-copy" title="Copiar al portapapeles">
              <span>📋</span> Copiar
            </button>
            <button class="pm-btn pm-btn-share" id="btn-informe-whatsapp" title="Compartir por WhatsApp">
              <span>💬</span> WhatsApp
            </button>
            <button class="pm-btn pm-btn-share" id="btn-informe-email" title="Enviar por email">
              <span>✉️</span> Email
            </button>
            <button class="pm-btn pm-btn-share" id="btn-informe-pdf" title="Exportar a PDF">
              <span>📄</span> PDF
            </button>
          </div>

          <div style="display:flex;gap:0.75rem;margin-top:1.25rem;">
            <button class="pm-btn" id="pm-informe-descartar" style="flex:1;background:var(--pm-surface);border:1px solid var(--pm-border);">Cerrar</button>
            <button class="pm-btn pm-btn-primary" id="pm-informe-aceptar" style="flex:1;">Usar en el editor</button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(n),!document.getElementById(`pm-generar-informe-styles`))){let e=document.createElement(`style`);e.id=`pm-generar-informe-styles`,e.textContent=`
        .pm-generar-informe-content {
          max-width: 640px;
          width: 95vw;
        }
        .pm-generar-informe-body {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .pm-informe-text {
          font-size: 0.9rem;
          line-height: 1.6;
          word-wrap: break-word;
          white-space: pre-wrap;
          font-family: inherit;
        }
        .pm-informe-acciones {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          flex-wrap: wrap;
        }
        .pm-btn-share {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          border: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
          color: var(--pm-text);
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
          flex: 1;
          justify-content: center;
        }
        .pm-btn-share:hover {
          background: var(--pm-primary);
          color: #fff;
          border-color: var(--pm-primary);
        }
        .pm-btn-share span { font-size: 0.95rem; }
      `,document.head.appendChild(e)}let r=n.querySelector(`#pm-informe-original`),i=n.querySelector(`#pm-informe-original-panel`),a=n.querySelector(`#pm-informe-texto`);function o(){return a.textContent.trim()}async function s(){try{await navigator.clipboard.writeText(o());let e=n.querySelector(`#btn-informe-copy`),t=e.textContent;e.textContent=`✓ Copiado`,setTimeout(()=>{e.textContent=t},2e3)}catch{alert(`No se pudo copiar al portapapeles.`)}}function c(){let e=encodeURIComponent(o());window.open(`https://wa.me/?text=${e}`,`_blank`)}function l(){let e=encodeURIComponent(o());window.open(`mailto:?subject=Informe de clase&body=${e}`,`_blank`)}function u(){let e=o(),t=window.open(``,`_blank`);t.document.write(`
      <html><head><title>Informe de Clase</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 700px; margin: auto; line-height: 1.6; color: #333; }
        h2 { color: #007aff; border-bottom: 2px solid #007aff; padding-bottom: 0.5rem; }
        p { white-space: pre-wrap; }
        @media print { body { padding: 1rem; } }
      </style></head>
      <body>
        <h2>📋 Informe de Clase</h2>
        <p>${e}</p>
        <script>window.print();<\/script>
      </body></html>
    `),t.document.close()}n.querySelector(`#btn-informe-copy`).onclick=s,n.querySelector(`#btn-informe-whatsapp`).onclick=c,n.querySelector(`#btn-informe-email`).onclick=l,n.querySelector(`#btn-informe-pdf`).onclick=u;function d({original:e,improved:t}){r.textContent=e,a.textContent=t,i&&(i.style.display=e?``:`none`),n.classList.add(`open`)}function f(){n.classList.remove(`open`)}return n.querySelector(`#pm-informe-close`).onclick=f,n.querySelector(`#pm-informe-descartar`).onclick=f,n.querySelector(`#pm-informe-aceptar`).onclick=()=>{t&&t(o()),f()},{open:d,close:f}}function pe(e,{onAccept:t}){let n=document.getElementById(`pm-structure-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-structure-modal`,n.className=`pm-modal-overlay`,n.innerHTML=`
      <div class="pm-modal-content pm-structure-content">
        <div class="pm-modal-header" style="background: rgba(99, 102, 241, 0.1);">
          <h3 style="margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--pm-primary);">🚀 Estructurar con IA</h3>
          <button class="pm-modal-close" id="pm-structure-close">&times;</button>
        </div>
        <div class="pm-modal-body pm-structure-body">
          <div class="pm-structure-panels">
            <div class="pm-structure-panel">
              <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pm-text-muted);">Original</h4>
              <div id="pm-structure-original" class="pm-structure-text" style="background: var(--pm-surface-2); border: 1px solid var(--pm-border); border-radius: var(--pm-radius-sm); padding: 0.75rem; min-height: 150px; overflow-y: auto; color: var(--pm-text);"></div>
            </div>
            <div class="pm-structure-panel">
              <h4 style="margin: 0 0 0.75rem 0; font-size: 0.9rem; color: var(--pm-text-muted);">Estructura DSL</h4>
              <div id="pm-structure-dsl" class="pm-structure-text" contenteditable="true" style="background: var(--pm-surface); border: 1.5px solid var(--pm-primary); border-radius: var(--pm-radius-sm); padding: 0.75rem; min-height: 150px; overflow-y: auto; color: var(--pm-text); font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.9rem;"></div>
            </div>
          </div>

          <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button class="pm-btn" id="pm-structure-reject" style="flex: 1; background: var(--pm-surface); border: 1px solid var(--pm-border);">Descartar</button>
            <button class="pm-btn pm-btn-primary" id="pm-structure-accept" style="flex: 1;">Insertar</button>
          </div>
        </div>
      </div>
    `,document.body.appendChild(n),!document.getElementById(`pm-structure-modal-styles`))){let e=document.createElement(`style`);e.id=`pm-structure-modal-styles`,e.textContent=`
        .pm-structure-content {
          max-width: 900px;
          width: 90vw;
        }

        .pm-structure-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pm-structure-panels {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .pm-structure-panel {
          display: flex;
          flex-direction: column;
        }

        .pm-structure-text {
          font-size: 0.9rem;
          line-height: 1.5;
          word-wrap: break-word;
          white-space: pre-wrap;
          font-family: inherit;
        }

        @media (max-width: 768px) {
          .pm-structure-panels {
            grid-template-columns: 1fr;
          }
        }
      `,document.head.appendChild(e)}let r=n.querySelector(`#pm-structure-original`),i=n.querySelector(`#pm-structure-dsl`);function a({original:e,dsl:t}){r.textContent=e,i.textContent=t,n.classList.add(`open`)}function o(){n.classList.remove(`open`)}return n.querySelector(`#pm-structure-close`).onclick=o,n.querySelector(`#pm-structure-reject`).onclick=o,n.querySelector(`#pm-structure-accept`).onclick=()=>{t&&t(i.textContent),o()},{open:a,close:o}}var me=`pm_tour_completed`,he=1500,ge=[{target:`.pm-asist-header`,title:`📍 Cabecera de Clase`,body:`Aquí puede ver los datos de la clase, el salón y la fecha. Es su panel de control principal.`},{target:`.pm-asist-bulk-circles`,title:`👥 Asistencia Rápida`,body:`¿Asistieron todos? Presione "P" para marcar a todos los alumnos como presentes en un solo clic.`},{target:`#pm-alumnos-list`,title:`🙋‍♂️ Lista de Alumnos`,body:`Presione el círculo de cada alumno para cambiar entre Presente, Ausente o Retraso.`},{target:`#pm-planificacion-card`,title:`🗺️ Planificación Académica`,body:`Seleccione una Ruta o busque en la Biblioteca. Los temas que ya impartió aparecerán con un check ✅ verde.`},{target:`#pm-dsl-toolbar-container`,title:`🛠️ Caja de Herramientas`,body:`Use el micrófono 🎤 para dictar la clase, o el botón de IA ✨ para mejorar y profesionalizar su redacción automáticamente.`},{target:`#pm-dsl-editor-container`,title:`✍️ Escritura Inteligente (DSL)`,body:`Use [Corchetes] para vincular temas de la planificación y asteriscos * para puntos clave. La IA le ayudará a darle formato profesional.`},{target:`#btn-guardar`,title:`💾 Guardar Sesión`,body:`Al finalizar, no olvide guardar su sesión para que el progreso de los alumnos se registre en el sistema.`}],_e=`
  .pm-tour-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.8); z-index: 10000;
    pointer-events: auto; display: none; opacity: 0;
    transition: opacity 0.3s;
  }
  .pm-tour-spotlight {
    position: fixed; border-radius: 12px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
    z-index: 10001; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none; border: 2px solid var(--pm-primary);
  }
  .pm-tour-tooltip {
    position: fixed; width: 280px; background: var(--pm-surface);
    border: 1px solid var(--pm-border); border-radius: 16px;
    padding: 1.5rem; z-index: 10002; color: #fff;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    transition: top 0.4s, left 0.4s; pointer-events: auto;
  }
  .pm-tour-tooltip h4 {
    margin: 0 0 0.5rem; color: var(--pm-primary);
    font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;
  }
  .pm-tour-tooltip p { margin: 0; font-size: 0.9rem; line-height: 1.4; color: var(--pm-text-muted); }
  .pm-tour-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; }
  .pm-tour-progress { font-size: 0.75rem; color: var(--pm-text-muted); }
  .pm-tour-btn-skip { background: none; border: none; color: var(--pm-text-muted); font-size: 0.8rem; cursor: pointer; text-decoration: underline; padding: 0; }
  .pm-tour-btn-next {
    background: var(--pm-primary); color: #fff; border: none;
    padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; cursor: pointer;
    font-size: 0.85rem; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  .pm-help-btn {
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(var(--pm-primary-rgb), 0.15); color: var(--pm-primary);
    border: 1px solid rgba(var(--pm-primary-rgb), 0.3);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.2s; font-size: 1rem;
  }
  .pm-help-btn:hover { background: var(--pm-primary); color: #fff; transform: scale(1.1); }
  [data-theme="light"] .pm-tour-tooltip { background: #fff; color: #111; }
  @media (max-width: 480px) {
    .pm-tour-tooltip { width: calc(100% - 40px); left: 20px !important; font-size: 0.85rem; }
  }
`,ve=class{constructor(e,t=ge){this._container=e,this._steps=t,this._step=0,this._autoTimer=null,this._overlay=null,this._spotlight=null,this._tooltip=null,this._mounted=!1,this._styleEl=null}mount(){if(!this._mounted)try{this._injectStyles(),this._injectDOM(),this._bindEvents(),this._mounted=!0,localStorage.getItem(me)||(this._autoTimer=setTimeout(()=>this.start(),he))}catch(e){console.error(`[AsistenciaTour] Error al montar el tour:`,e),this._mounted=!1}}start(){this._overlay&&(this._step=0,this._tooltip.style.display=`block`,this._spotlight.style.display=`block`,this._overlay.style.display=`block`,this._overlay.offsetHeight,this._overlay.style.opacity=`1`,this._showStep(0),localStorage.setItem(me,`true`))}destroy(){this._autoTimer!==null&&(clearTimeout(this._autoTimer),this._autoTimer=null),this._overlay&&=(this._overlay.style.transition=`none`,this._overlay.style.opacity=`0`,this._overlay.style.display=`none`,this._overlay.remove(),null),this._spotlight&&=(this._spotlight.remove(),null),this._tooltip&&=(this._tooltip.remove(),null),this._styleEl&&=(this._styleEl.remove(),null),this._mounted=!1}_injectStyles(){if(document.getElementById(`pm-tour-styles`))return;let e=document.createElement(`style`);e.id=`pm-tour-styles`,e.textContent=_e,document.head.appendChild(e),this._styleEl=e}_injectDOM(){document.getElementById(`pm-tour-overlay`)?.remove(),document.getElementById(`pm-tour-spotlight`)?.remove(),document.getElementById(`pm-tour-tooltip`)?.remove();let e=document.createElement(`div`);e.id=`pm-tour-overlay`,e.className=`pm-tour-overlay`,e.setAttribute(`role`,`dialog`),e.setAttribute(`aria-modal`,`true`),e.setAttribute(`aria-label`,`Guía interactiva`),document.body.appendChild(e),this._overlay=e;let t=document.createElement(`div`);t.id=`pm-tour-spotlight`,t.className=`pm-tour-spotlight`,t.style.display=`none`,document.body.appendChild(t),this._spotlight=t;let n=document.createElement(`div`);n.id=`pm-tour-tooltip`,n.className=`pm-tour-tooltip`,n.style.display=`none`,n.innerHTML=`
      <h4 id="pm-tour-title"></h4>
      <p  id="pm-tour-body"></p>
      <div class="pm-tour-footer">
        <span class="pm-tour-progress" id="pm-tour-progress"></span>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <button id="pm-tour-skip" class="pm-tour-btn-skip">Saltar guía</button>
          <button id="pm-tour-next" class="pm-tour-btn-next">Siguiente</button>
        </div>
      </div>
    `,document.body.appendChild(n),this._tooltip=n}_bindEvents(){if(!this._tooltip||!this._overlay){console.warn(`[AsistenciaTour] DOM no inyectado correctamente, saltando event binding`);return}this._tooltip.querySelector(`#pm-tour-next`).addEventListener(`click`,()=>this._nextStep()),this._tooltip.querySelector(`#pm-tour-skip`).addEventListener(`click`,()=>this._close()),this._onKeydown=e=>{e.key===`Escape`&&this._close()},document.addEventListener(`keydown`,this._onKeydown),this._onResize=()=>{this._overlay?.style.display!==`none`&&this._showStep(this._step)},window.addEventListener(`resize`,this._onResize,{passive:!0})}_showStep(e){let t=this._steps[e],n=this._container.querySelector(t.target);if(!n){this._nextStep();return}n.scrollIntoView({behavior:`smooth`,block:`center`}),setTimeout(()=>this._positionOnElement(n,t,e),400)}_positionOnElement(e,t,n){if(!this._spotlight||!this._tooltip){console.warn(`[AsistenciaTour] Tour no montado correctamente, abortando posicionamiento`);return}let r=e.getBoundingClientRect();this._spotlight.style.width=`${r.width+20}px`,this._spotlight.style.height=`${r.height+20}px`,this._spotlight.style.top=`${r.top-10}px`,this._spotlight.style.left=`${r.left-10}px`;let i=r.bottom+16;i+200>window.innerHeight&&(i=r.top-200-16);let a=Math.max(16,Math.min(window.innerWidth-280-16,r.left));this._tooltip.style.top=`${i}px`,this._tooltip.style.left=`${a}px`,this._tooltip.querySelector(`#pm-tour-title`).innerHTML=`<span>${t.title}</span>`,this._tooltip.querySelector(`#pm-tour-body`).textContent=t.body,this._tooltip.querySelector(`#pm-tour-progress`).textContent=`${n+1} / ${this._steps.length}`,this._tooltip.querySelector(`#pm-tour-next`).textContent=n===this._steps.length-1?`Finalizar ✓`:`Siguiente →`}_nextStep(){this._step++,this._step<this._steps.length?this._showStep(this._step):this._close()}_close(){this._overlay&&(localStorage.setItem(me,`true`),this._onKeydown&&document.removeEventListener(`keydown`,this._onKeydown),this._onResize&&window.removeEventListener(`resize`,this._onResize),this._tooltip&&(this._tooltip.style.display=`none`),this._spotlight&&(this._spotlight.style.display=`none`),this._overlay.style.opacity=`0`,setTimeout(()=>{this._overlay&&(this._overlay.style.display=`none`)},300))}};function V(){if(document.getElementById(`pm-student-panel-styles`))return;let e=document.createElement(`style`);e.id=`pm-student-panel-styles`,e.textContent=`
    .pm-student-panel {
      position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 420px;
      background: var(--pm-surface, #1e293b); color: #fff; z-index: 1000;
      transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: -10px 0 30px rgba(0,0,0,0.3); display: flex; flex-direction: column;
    }
    .pm-student-panel--open { transform: translateX(0); }
    .pm-student-panel__header { 
      padding: 20px; display: flex; align-items: center; gap: 15px; 
      border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03);
    }
    .pm-student-panel__avatar {
      width: 48px; height: 48px; border-radius: 12px; background: var(--pm-primary, #3b82f6);
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem;
    }
    .pm-student-panel__name { font-weight: 700; font-size: 1.1rem; line-height: 1.2; }
    .pm-student-panel__progress-bar { 
      height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 8px; overflow: hidden;
    }
    .pm-student-panel__progress-fill { height: 100%; background: #10b981; transition: width 1s ease-out; }
    
    .pm-student-panel__body { flex: 1; overflow-y: auto; padding: 20px; }
    .pm-student-panel__section { margin-bottom: 24px; }
    .pm-student-panel__section-title { 
      font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
      color: rgba(255,255,255,0.5); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
    }

    /* Indicators & Timeline */
    .pm-route-indicador {
      background: rgba(255,255,255,0.05); border-radius: 12px; padding: 12px 16px; margin-bottom: 8px;
      display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .pm-route-indicador:hover { background: rgba(255,255,255,0.08); transform: translateY(-1px); }
    .pm-route-indicador__icon { font-size: 1.2rem; }
    .pm-route-indicador__name { font-weight: 600; font-size: 0.95rem; }
    .pm-route-indicador__stats { font-size: 0.75rem; color: rgba(255,255,255,0.5); display: block; }
    
    .pm-route-indicador__timeline { 
      margin: -4px 0 12px 0; padding: 12px; background: rgba(255,255,255,0.02); 
      border-radius: 0 0 12px 12px; border: 1px solid rgba(255,255,255,0.05); border-top: none;
    }
    .pm-timeline-actions { margin-bottom: 12px; }
    .pm-btn-add-eval {
      width: 100%; background: rgba(59,130,246,0.1); color: #60a5fa; border: 1px dashed rgba(96,165,250,0.3);
      padding: 8px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s;
    }
    .pm-btn-add-eval:hover { background: rgba(59,130,246,0.15); border-color: rgba(96,165,250,0.5); }

    .pm-eval-timeline__item {
      padding: 10px; border-left: 2px solid rgba(255,255,255,0.1); margin-left: 10px; margin-bottom: 12px;
      position: relative; list-style: none;
    }
    .pm-eval-timeline__item::before {
      content: ''; position: absolute; left: -6px; top: 12px; width: 10px; height: 10px;
      background: #1e293b; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%;
    }
    .pm-eval-timeline__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .pm-eval-timeline__date { font-size: 0.75rem; color: rgba(255,255,255,0.4); font-weight: 600; }
    .pm-eval-timeline__edit { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; padding: 4px; }
    .pm-eval-timeline__edit:hover { color: #60a5fa; }
    .pm-eval-timeline__nota { font-weight: 700; font-size: 0.85rem; color: #60a5fa; display: block; }
    .pm-eval-timeline__detail { font-size: 0.85rem; color: rgba(255,255,255,0.8); display: block; margin-top: 4px; }

    /* Modal */
    .pm-student-panel__modal-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px);
      z-index: 2100; display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .pm-student-panel__modal-content {
      background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px;
      width: 100%; max-width: 440px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      animation: pm-panel-modal-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes pm-panel-modal-in { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
    
    .pm-student-panel__modal-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); position: relative; }
    .pm-student-panel__modal-header h4 { margin: 0; font-size: 1.1rem; }
    .pm-student-panel__modal-close { position: absolute; top: 15px; right: 15px; background: none; border: none; color: #fff; font-size: 1.5rem; cursor: pointer; opacity: 0.5; }
    .pm-student-panel__modal-close:hover { opacity: 1; }
    
    .pm-student-panel__modal-indicator-name { padding: 0 20px; margin-top: 12px; font-size: 0.85rem; color: #60a5fa; font-weight: 600; }
    .pm-student-panel__modal-body { padding: 20px; }
    .pm-student-panel__modal-field { margin-bottom: 20px; }
    .pm-student-panel__modal-field label { display: block; font-size: 0.75rem; font-weight: 700; color: rgba(255,255,255,0.5); margin-bottom: 8px; text-transform: uppercase; }
    
    .pm-student-panel__status-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .pm-student-panel__status-btn {
      padding: 10px 4px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03); color: #fff; font-weight: 600; font-size: 0.72rem; cursor: pointer; transition: all 0.2s;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
    }
    .pm-student-panel__status-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
    .pm-student-panel__status-btn.active.achieved { background: rgba(16,185,129,0.2); border-color: #10b981; color: #34d399; }
    .pm-student-panel__status-btn.active.in_process { background: rgba(234,179,8,0.2); border-color: #eab308; color: #facc15; }
    .pm-student-panel__status-btn.active.needs_reinforcement { background: rgba(249,115,22,0.2); border-color: #f97316; color: #ff9800; }
    .pm-student-panel__status-btn.active.failed { background: rgba(239,68,68,0.2); border-color: #ef4444; color: #f87171; }
    .pm-student-panel__status-btn.active.exceeded { background: rgba(59,130,246,0.2); border-color: #3b82f6; color: #60a5fa; }
    .pm-student-panel__status-btn.active.not_started { background: rgba(156,163,175,0.2); border-color: #9ca3af; color: #e5e7eb; }
    
    .pm-student-panel__modal-footer { padding: 20px; display: flex; gap: 10px; border-top: 1px solid rgba(255,255,255,0.05); }
    .pm-btn {
      flex: 1; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none;
    }
    .pm-btn-primary { background: #3b82f6; color: #fff; }
    .pm-btn-primary:hover { background: #2563eb; transform: translateY(-1px); }
    .pm-btn-outline { background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); }
    .pm-btn-outline:hover { background: rgba(255,255,255,0.08); }
  `,document.head.appendChild(e)}function H(e){let t=document.createElement(`div`);return t.textContent=e??``,t.innerHTML}function ye(e){return e?e.split(` `).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join(``):`?`}function be(e){return e?new Date(e).toLocaleDateString(`es-AR`,{day:`2-digit`,month:`2-digit`,year:`2-digit`}):``}var xe={achieved:{color:`green`,icon:`🟢`,label:`Dominado`},in_process:{color:`yellow`,icon:`🟡`,label:`En proceso`},needs_reinforcement:{color:`orange`,icon:`🟠`,label:`Requiere refuerzo`},failed:{color:`red`,icon:`🔴`,label:`No aprobado`},exceeded:{color:`blue`,icon:`🔵`,label:`Sobresaliente`},not_started:{color:`gray`,icon:`⚫`,label:`Sin iniciar`}};function U(e){return xe[e]||xe.not_started}async function W(e,t,n=null){let r=[];if(n){let e=await D(n).catch(()=>null),t=e?.plan?.items||[],i=new Set;r=t.filter(e=>{let t=e.indicator_id||`${e.node_id}:${e.week_number}`;return i.has(t)?!1:(i.add(t),!0)}).map(t=>({id:t.indicator_id||t.node_id||t.id,nombre:t.topic||t.objective||`Indicador`,node:{id:t.node_id||t.id,name:t.topic||`Tema`,level:{id:e?.route?.level_id||null,level_number:t.week_number,name:`Semana ${t.week_number}`}}}))}if(!r.length&&h.isDemoMode){let{getFullHierarchy:e}=await m(async()=>{let{getFullHierarchy:e}=await import(`./routeMock-SFasgq6d.js`).then(e=>e.t);return{getFullHierarchy:e}},__vite__mapDeps([0,1]));(await e(n||`pclase_001`)).forEach(e=>{e.plan_temas.forEach(t=>{t.plan_objetivos.forEach(n=>{n.plan_indicators.forEach(n=>{r.push({id:n.id,nombre:n.descripcion,node:{id:t.id,name:t.nombre,level:{id:e.id,level_number:e.numero_nivel,name:e.nombre}}})})})})})}else if(!r.length){let{data:e,error:n}=await d.from(`indicators`).select(`id, nombre, description, order_index, node_id, nodes(id, name, order_index, level_id, levels(id, name, level_number))`).eq(`nodes.route_version_id`,t).eq(`activo`,!0).order(`order_index`);if(n)throw n;r=(e??[]).filter(e=>e.nodes!==null).map(e=>({id:e.id,nombre:e.nombre||e.description,node:e.nodes}))}let i=await w(n),a=r.map(t=>{let n=`${e}_${t.id}`,r=i[n]||null,a=U(r?.status||`not_started`);return{id:t.id,nombre:t.nombre,node:t.node,latestStatus:r?.status||`not_started`,latestObs:r?.observation||``,latestEvidence:r?.evidence_url||``,semColor:a.color,semIcon:a.icon,history:r?[r]:[]}}),o=a.filter(e=>e.latestStatus===`achieved`||e.latestStatus===`exceeded`).length,s=a.length;return{indicatorSummaries:a,dominados:o,total:s,avance:s>0?Math.round(o/s*100):0,pendingTasks:[]}}function Se(e,t){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">${H(ye(e.nombre_completo))}</div>
      <div>
        <div class="pm-student-panel__name">${H(e.nombre_completo)}</div>
        <div class="pm-student-panel__meta">Avance: ${t}%</div>
        <div class="pm-student-panel__progress-bar">
          <div class="pm-student-panel__progress-fill" style="width:${t}%"></div>
        </div>
      </div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
  `}function Ce(e,t){return`
    <div class="pm-timeline-actions">
      <button class="pm-btn-add-eval" data-action="new-eval" data-idx="${t}">
        <i class="bi bi-plus-circle"></i> Nueva evaluación
      </button>
    </div>
    <ul class="pm-eval-timeline">
      ${e.map((e,n)=>`
    <li class="pm-eval-timeline__item">
      <div class="pm-eval-timeline__header">
        <span class="pm-eval-timeline__date">${H(be(e.updated_at||e.created_at))}</span>
        <button class="pm-eval-timeline__edit" data-action="edit-eval" data-idx="${t}" data-hidx="${n}">
          <i class="bi bi-pencil"></i>
        </button>
      </div>
      <span class="pm-eval-timeline__nota">Estado: ${U(e.status).label}</span>
      ${e.observation?`<span class="pm-eval-timeline__detail">${H(e.observation)}</span>`:``}
      ${e.evidence_url?`<span class="pm-eval-timeline__detail"><strong>Evidencia:</strong> <a href="${e.evidence_url}" target="_blank">Ver Enlace</a></span>`:``}
    </li>
  `).join(``)||`<p class="pm-empty-history">Sin evaluaciones registradas</p>`}
    </ul>
  `}function G(e){return e.length?e.map((e,t)=>`
    <div class="pm-route-indicador pm-route-indicador--${H(e.semColor)}"
         data-action="toggle-history"
         data-idx="${t}"
         role="button"
         tabindex="0"
         aria-expanded="false">
      <span class="pm-route-indicador__icon">${e.semIcon}</span>
      <div class="pm-route-indicador__info">
        <span class="pm-route-indicador__name">${H(e.nombre)}</span>
        <span class="pm-route-indicador__stats">
          ${e.latestStatus===`not_started`?`Sin evaluar`:`Estado: ${U(e.latestStatus).label}`}
          · ${e.history.length} registro${e.history.length===1?``:`s`}
        </span>
      </div>
    </div>
    <div class="pm-route-indicador__timeline" data-timeline="${t}" hidden>
      ${Ce(e.history,t)}
    </div>
  `).join(``):`<p style="padding:8px">No hay indicadores cargados para este nivel.</p>`}function we(e,{indicatorSummaries:t,avance:n}){return`
    ${Se(e,n)}
    <div class="pm-student-panel__body">
      <section class="pm-student-panel__section">
        <h3 class="pm-student-panel__section-title">Progreso Curricular (Semáforo)</h3>
        <div class="pm-route-map">
          ${G(t)}
        </div>
      </section>
    </div>
  `}function Te(){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">…</div>
      <div><div class="pm-student-panel__name">Cargando…</div></div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
    <div class="pm-student-panel__body" style="padding:16px;color:var(--color-text-muted,#888)">
      Cargando progreso del alumno…
    </div>
  `}function Ee(e){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">!</div>
      <div><div class="pm-student-panel__name">Error</div></div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
    <div class="pm-student-panel__body" style="padding:16px;color:#c00">
      ${H(e)}
    </div>
  `}function De({alumno:e,rutaId:t,sessionId:n,claseId:r,fecha:i,horaInicio:o,onProgressSaved:s}){V();let c=document.createElement(`aside`);c.className=`pm-student-panel`,c.setAttribute(`role`,`dialog`),c.setAttribute(`aria-modal`,`false`),c.setAttribute(`aria-label`,`Progreso de ${e.nombre_completo}`),document.body.appendChild(c);let l=[],u=null;function d(){re()===`desktop`?c.classList.add(`pm-student-panel--desktop`):c.classList.remove(`pm-student-panel--desktop`)}let p=z(d);d();function m(e){let t=e.target.closest(`[data-action]`);if(!t)return;let n=t.dataset.action;if(n===`close`){v();return}if(n===`toggle-history`){let e=t.dataset.idx,n=c.querySelector(`[data-timeline="${e}"]`);if(!n)return;let r=!n.hidden;n.hidden=r,t.setAttribute(`aria-expanded`,String(!r));return}if(n===`new-eval`){let e=t.dataset.idx;h(e);return}if(n===`edit-eval`){let e=t.dataset.idx,n=t.dataset.hidx;h(e,n);return}}async function h(e,t=null){let n=l[e],r=t===null?null:n.history[t],i=r?.status??`not_started`,a=document.createElement(`div`);a.className=`pm-student-panel__modal-overlay pm-animate-fade-in`,a.innerHTML=`
      <div class="pm-student-panel__modal-content">
        <div class="pm-student-panel__modal-header">
          <h4>${r?`Editar`:`Nueva`} Evaluación</h4>
          <button class="pm-student-panel__modal-close" data-action="modal-close">&times;</button>
        </div>
        <p class="pm-student-panel__modal-indicator-name">${H(n.nombre)}</p>
        
        <div class="pm-student-panel__modal-body">
          <div class="pm-student-panel__modal-field">
            <label>Nivel de Logro (Semáforo)</label>
            <div class="pm-student-panel__status-grid">
              ${Object.entries(xe).map(([e,t])=>`
                <button class="pm-student-panel__status-btn ${i===e?`active`:``} ${e}" data-status="${e}">
                  <span>${t.icon}</span>
                  <span>${t.label}</span>
                </button>
              `).join(``)}
            </div>
          </div>
          
          <div class="pm-student-panel__modal-field">
            <label>Observaciones / Evidencia</label>
            <textarea id="modal-obs" rows="3" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 12px; font-size: 0.9rem; resize: none; outline: none;" placeholder="Comentarios sobre el desempeño...">${r?H(r.observation):``}</textarea>
          </div>
          
          <div class="pm-student-panel__modal-field">
            <label>Enlace de Evidencia (Video/Audio)</label>
            <input type="text" id="modal-evidence" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 10px; font-size: 0.9rem; outline: none;" placeholder="URL de video o audio en drive/supabase..." value="${r?H(r.evidence_url):``}">
          </div>
        </div>

        <div class="pm-student-panel__modal-footer">
          <button class="pm-btn pm-btn-outline" data-action="modal-close">Cancelar</button>
          <button class="pm-btn pm-btn-primary" data-action="modal-save">
            ${r?`Actualizar`:`Guardar`}
          </button>
        </div>
      </div>
    `,document.body.appendChild(a),a.addEventListener(`click`,async e=>{let t=e.target.closest(`[data-status]`);if(t){a.querySelectorAll(`[data-status]`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),i=t.dataset.status;return}let r=e.target.closest(`[data-action]`)?.dataset.action;if(r===`modal-close`)a.remove();else if(r===`modal-save`){let e=a.querySelector(`#modal-obs`).value,t=a.querySelector(`#modal-evidence`).value;await g(n.id,i,e,t),a.remove()}}),a.addEventListener(`click`,e=>{e.target===a&&a.remove()})}async function g(t,r,i,a){try{if(!f())throw Error(`No hay sesión de maestro activa.`);await T(e.id,t,r,i.trim(),a.trim(),n),typeof s==`function`&&await s({alumnoId:e.id,indicatorId:t,status:r}),await _()}catch(e){console.error(`[studentProgressPanel] Error saving:`,e),alert(`Error al guardar: `+(e.message||e))}}c.addEventListener(`click`,m),c.addEventListener(`keydown`,e=>{if(e.key===`Enter`||e.key===` `){let t=e.target.closest(`[data-action="toggle-history"]`);t&&(e.preventDefault(),t.click())}});async function _(){c.innerHTML=Te(),c.classList.add(`pm-student-panel--open`),u&&u.dispose(),u=a(c,{onClose:()=>v()});try{let n=await W(e.id,t,r);l=n.indicatorSummaries,c.innerHTML=we(e,n)}catch(e){console.error(`[studentProgressPanel] Error loading:`,e),c.innerHTML=Ee(e?.message??`Error desconocido al cargar datos.`)}}function v(){c.classList.remove(`pm-student-panel--open`),u&&=(u.dispose(),null),setTimeout(()=>{c.classList.contains(`pm-student-panel--open`)||(c.innerHTML=``,l=[])},300)}function y(){u&&=(u.dispose(),null),p(),c.removeEventListener(`click`,m),c.remove()}return{open:_,close:v,destroy:y}}var Oe={LOGRADO:{label:`LOGRADO`,cls:`ssp-estado-logrado`},EN_PROGRESO:{label:`EN_PROGRESO`,cls:`ssp-estado-en-progreso`},INICIADO:{label:`INICIADO`,cls:`ssp-estado-iniciado`},MIXTO:{label:`MIXTO`,cls:`ssp-estado-mixto`}},ke={LOGRADO:`ssp-chip-logrado`,EN_PROGRESO:`ssp-chip-en-progreso`,INICIADO:`ssp-chip-iniciado`},Ae={LOGRADO:`LOGRADO`,EN_PROGRESO:`EN_PROGRESO`,INICIADO:`INICIADO`,MIXTO:`MIXTO`};function K(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function je(e){return(e||``).trim().toLowerCase()}function Me(e){let t=new Map;for(let n of e){let e=je(n.contenido_dsl);if(e)if(!t.has(e))t.set(e,{contenido:n.contenido_dsl,estado:n.estado_cualitativo,alumnos:[{id:n.alumno_id,nombre:n.alumno_nombre||`Alumno`,estado:n.estado_cualitativo}],observaciones:n.observaciones||null,tarea:n.tarea||null});else{let r=t.get(e);r.alumnos.push({id:n.alumno_id,nombre:n.alumno_nombre||`Alumno`,estado:n.estado_cualitativo}),r.estado!==`MIXTO`&&r.estado!==n.estado_cualitativo&&(r.estado=`MIXTO`),!r.observaciones&&n.observaciones&&(r.observaciones=n.observaciones),!r.tarea&&n.tarea&&(r.tarea=n.tarea)}}return Array.from(t.values())}function Ne(){let e=null,t=[];function n(e,n){let r=[`📚 Clase ${e} — ${(()=>{try{let[e,t,r]=n.split(`-`);return`${r}/${t}/${e}`}catch{return n}})()}`];for(let e of t){let t=Ae[e.estado]||e.estado,n=e.estado===`MIXTO`?e.alumnos.map(e=>{let t=Ae[e.estado]||e.estado;return`${e.nombre} (${t})`}).join(`, `):e.alumnos.map(e=>e.nombre).join(`, `);r.push(``),r.push(`🔹 ${e.contenido} — ${t}`),r.push(`   Alumnos: ${n}`),e.tarea&&r.push(`   📝 Tarea: ${e.tarea}`)}return r.push(``,`🎯 El Sistema PC`),r.join(`
`)}function r(e,t){let n=Oe[e.estado]||Oe.EN_PROGRESO,r=e.alumnos.length,i=e.estado===`MIXTO`,a=e.alumnos.map(e=>`<span class="${i?`ssp-alumno-chip ${ke[e.estado]||``}`:`ssp-alumno-chip`}">${K(e.nombre)}</span>`).join(``),o=e.observaciones?`<div class="ssp-group-obs">${K(e.observaciones)}</div>`:``,s=e.tarea?`<div class="ssp-group-tarea">📝 Tarea: ${K(e.tarea)}</div>`:``;return`
      <div class="ssp-group">
        <div class="ssp-group-header">
          <span class="ssp-group-contenido">${K(e.contenido)}</span>
          <span class="ssp-group-count">${r} alumno${r===1?``:`s`}</span>
          <span class="ssp-estado-badge ${n.cls}">${n.label}</span>
        </div>
        <div class="ssp-group-alumnos">${a}</div>
        ${o}
        ${s}
      </div>
    `}function i(i,a){if(!e)return;let s=t.length>0;e.innerHTML=`
      <div class="ssp-backdrop"></div>
      <div class="ssp-dialog" role="dialog" aria-modal="true" aria-label="Resumen pedagógico">
        <div class="ssp-header">
          <span class="ssp-icon">📊</span>
          <div>
            <strong>Resumen Pedagógico</strong>
            <div class="ssp-subtitle">${K(i)} · ${K(a)}</div>
          </div>
        </div>

        ${s?`
          <div class="ssp-section-title">✅ Grupos de progreso (${t.length})</div>
          <div class="ssp-body">
            ${t.map(e=>r(e)).join(``)}
          </div>
        `:`
          <div class="ssp-empty">
            No hay registros de progreso para esta sesión.<br>
            Usá el botón 🎯 <strong>Analizar</strong> en el editor para generarlos.
          </div>
        `}

        <div class="ssp-footer">
          <button class="pm-btn pm-btn-success ssp-btn-wa" id="ssp-whatsapp">
            <i class="bi bi-whatsapp"></i> Compartir WhatsApp
          </button>
          <button class="pm-btn pm-btn-outline ssp-btn-close" id="ssp-close">✕ Cerrar</button>
        </div>
      </div>
    `,Pe(),e.querySelector(`#ssp-whatsapp`).onclick=()=>{let e=n(i,a);window.open(`https://wa.me/?text=${encodeURIComponent(e)}`,`_blank`)},e.querySelector(`#ssp-close`).onclick=o,e.querySelector(`.ssp-backdrop`).onclick=o}async function a({sesionId:n,claseNombre:r,fecha:a,supabase:s}){e||(e=document.createElement(`div`),e.className=`ssp-wrapper`,document.body.appendChild(e)),e.style.display=`flex`,e.innerHTML=`
      <div class="ssp-backdrop"></div>
      <div class="ssp-dialog">
        <div class="ssp-header">
          <span class="ssp-icon">📊</span>
          <div><strong>Resumen Pedagógico</strong><div class="ssp-subtitle">${K(r)}</div></div>
        </div>
        <div class="ssp-loading">Cargando registros...</div>
      </div>
    `,Pe(),e.querySelector(`.ssp-backdrop`).onclick=o;let{data:c,error:l}=await s.from(`progresos`).select(`id, alumno_id, contenido_dsl, estado_cualitativo, observaciones, indicadores`).eq(`sesion_clase_id`,n).order(`created_at`,{ascending:!0});if(l){console.error(`[SessionSummaryPanel] Error cargando progresos:`,l),t=[],i(r,a);return}let u=(c||[]).map(e=>({id:e.id,alumno_id:e.alumno_id,contenido_dsl:e.contenido_dsl,estado_cualitativo:e.estado_cualitativo||`EN_PROGRESO`,observaciones:e.observaciones,tarea:e.indicadores?.tarea||null})),d=[...new Set(u.map(e=>e.alumno_id).filter(Boolean))];if(d.length>0){let{data:e}=await s.from(`alumnos`).select(`id, nombre_completo`).in(`id`,d),t=new Map((e||[]).map(e=>[e.id,e.nombre_completo]));u.forEach(e=>{e.alumno_nombre=t.get(e.alumno_id)||`Alumno`})}t=Me(u),i(r,a)}function o(){e&&(e.style.display=`none`,e.innerHTML=``),t=[]}return{open:a,close:o}}function Pe(){if(document.getElementById(`ssp-styles`))return;let e=document.createElement(`style`);e.id=`ssp-styles`,e.textContent=`
    /* ── Wrapper & backdrop ────────────────────────── */
    .ssp-wrapper {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .ssp-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(2px);
    }

    /* ── Dialog ────────────────────────────────────── */
    .ssp-dialog {
      position: relative;
      z-index: 1;
      background: var(--pm-surface, #fff);
      border-radius: var(--pm-radius, 12px);
      box-shadow: 0 8px 40px rgba(0,0,0,0.22);
      width: 100%;
      max-width: 480px;
      max-height: 85vh;
      overflow-y: auto;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* ── Header ────────────────────────────────────── */
    .ssp-header {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .ssp-icon { font-size: 1.5rem; }
    .ssp-subtitle {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
      margin-top: 0.1rem;
    }

    /* ── Section title ─────────────────────────────── */
    .ssp-section-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--pm-text-muted, #6c757d);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0.25rem;
    }

    /* ── Body (group container) ────────────────────── */
    .ssp-body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    /* ── Group card ────────────────────────────────── */
    .ssp-group {
      background: var(--pm-surface-2, #f8f9fa);
      border: 1px solid var(--pm-border, #dee2e6);
      border-radius: var(--pm-radius-sm, 8px);
      padding: 0.7rem 0.8rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .ssp-group-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .ssp-group-contenido {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--pm-text, #212529);
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .ssp-group-count {
      font-size: 0.72rem;
      color: var(--pm-text-muted, #6c757d);
      white-space: nowrap;
    }

    /* ── Estado badges ─────────────────────────────── */
    .ssp-estado-badge {
      font-size: 0.68rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 99px;
      color: #fff;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .ssp-estado-logrado      { background: #198754; }
    .ssp-estado-en-progreso  { background: #0d6efd; }
    .ssp-estado-iniciado     { background: #6c757d; }
    .ssp-estado-mixto        { background: #fd7e14; }

    /* ── Alumno chips ──────────────────────────────── */
    .ssp-group-alumnos {
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
    }
    .ssp-alumno-chip {
      font-size: 0.75rem;
      padding: 0.15rem 0.5rem;
      border-radius: 99px;
      background: var(--pm-surface, #fff);
      border: 1.5px solid var(--pm-border, #dee2e6);
      color: var(--pm-text, #212529);
    }
    .ssp-chip-logrado      { border-color: #198754; background: #19875412; }
    .ssp-chip-en-progreso  { border-color: #0d6efd; background: #0d6efd12; }
    .ssp-chip-iniciado     { border-color: #6c757d; background: #6c757d12; }

    /* ── Group observaciones / tarea ───────────────── */
    .ssp-group-obs {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
      font-style: italic;
      margin-top: 0.1rem;
    }
    .ssp-group-tarea {
      font-size: 0.78rem;
      color: var(--pm-text-muted, #6c757d);
    }

    /* ── Empty & loading ───────────────────────────── */
    .ssp-empty {
      text-align: center;
      color: var(--pm-text-muted, #6c757d);
      font-size: 0.85rem;
      padding: 1rem 0;
      line-height: 1.6;
    }
    .ssp-loading {
      text-align: center;
      color: var(--pm-text-muted, #6c757d);
      font-size: 0.85rem;
      padding: 1.5rem 0;
    }

    /* ── Footer ────────────────────────────────────── */
    .ssp-footer {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      margin-top: 0.25rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--pm-border, #dee2e6);
    }

    .ssp-footer .pm-btn {
      width: auto;
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }
    .pm-btn-success {
      background: var(--pm-success, #25D366);
      color: #fff;
    }
    .pm-btn-success:hover {
      opacity: 0.9;
    }
    .pm-btn-outline {
      background: transparent;
      border: 1.5px solid var(--pm-border, #dee2e6);
      color: var(--pm-text, #212529);
    }
    .pm-btn-outline:hover {
      background: var(--pm-surface-2, #f8f9fa);
    }
    .ssp-btn-wa { flex: 1; }
    .ssp-btn-close { flex-shrink: 0; }
  `,document.head.appendChild(e)}var Fe=`documentos`;async function Ie(e,t=`justificaciones`){let n=e.name.split(`.`).pop(),r=`${t}/${`${Date.now()}_${Math.random().toString(36).slice(2)}.${n}`}`,{data:i,error:a}=await d.storage.from(Fe).upload(r,e,{cacheControl:`3600`,upsert:!1});if(a)throw a;let{data:o}=d.storage.from(Fe).getPublicUrl(r);return o.publicUrl}async function Le({sesionId:e,alumnoId:t,claseId:n,fecha:r,motivo:i,evidenciaBase64:a,creadoPor:o},s=null){let c=[];if(e||c.push(`sesionId`),t||c.push(`alumnoId`),r||c.push(`fecha`),i||c.push(`motivo`),o||c.push(`creadoPor`),c.length>0)return{error:{message:`Faltan campos requeridos: ${c.join(`, `)}`}};let l=null;if(s)try{l=await Ie(s)}catch(e){console.warn(`[JustificacionService] Error subiendo evidencia a Storage:`,e)}let u={sesion_id:e,alumno_id:t,clase_id:n||null,fecha:r,motivo:i,evidencia_url:l||null,evidencia_base64:null,creado_por:o,estado:`pendiente`},{data:f,error:p}=await d.from(`justificaciones`).upsert([u],{onConflict:`sesion_id,alumno_id`,ignoreDuplicates:!1}).select().single();return{data:f,error:p}}async function Re(e,t){if(!e||!t)return null;let{data:n,error:r}=await d.from(`justificaciones`).select(`*`).eq(`sesion_id`,e).eq(`alumno_id`,t).single();return r&&r.code!==`PGRST116`?(console.warn(`[JustificacionService] Error obteniendo justificación:`,r),null):n||null}async function ze(e){if(!e)return{error:{message:`ID requerido`}};let{error:t}=await d.from(`justificaciones`).delete().eq(`id`,e);return{error:t}}function Be(){let e=Promise.resolve();return{run(t){if(typeof t!=`function`)throw TypeError(`asyncMutex.run expects a function`);let n=e.then(()=>t());return e=n.then(()=>{},()=>{}),n}}}function q(e){return(e||``).toLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``).trim()}function Ve(e,t){let n=q(e);return t.find(e=>q(e.nombre)===n||q(e.nombreCorto||e.nombre.split(` `)[0])===n||n.length>=3&&q(e.nombre).includes(n)||n.length>=3&&n.includes(q(e.nombreCorto||e.nombre.split(` `)[0])))??null}function He(e,t){let n=[],r=[];for(let i of e){if(q(i)===`todos`){n.push(...t);continue}let e=Ve(i,t);e?n.push(e):r.push(`No se encontró el alumno: "${i}"`)}let i=new Set;return{resolved:n.filter(e=>i.has(e.id)?!1:(i.add(e.id),!0)),errors:r}}async function Ue(e){if(e.length===0)return{data:[],error:null};let t=new Set,n=e.filter(e=>{let n=`${e.alumno_id}|${e.clase_id}|${e.sesion_clase_id}|${e.contenido_dsl}`;return t.has(n)?!1:(t.add(n),!0)}),{data:r,error:i}=await d.from(`progresos`).upsert(n,{onConflict:`alumno_id,clase_id,sesion_clase_id,contenido_dsl`,ignoreDuplicates:!1}).select(`id, alumno_id, contenido_dsl, estado_cualitativo`);return{data:r,error:i}}async function We({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,contenido:i,evaluaciones:a,alumnos:o}){if(!a||a.length===0||!t)return{saved:0,error:null};let s=(a||[]).flatMap(e=>{if(e.seccion&&!e.alumno_id&&o&&o.length>0){let t=M(e.seccion,o);return t.length===0?[]:t.map(t=>({...e,alumno_id:t.id,seccion:void 0}))}return e}).map(a=>{let o=`EN_PROGRESO`;return a.nota!==null&&a.nota!==void 0&&(o=a.nota>=4?`LOGRADO`:a.nota>=2?`EN_PROGRESO`:`INICIADO`),{alumno_id:a.alumno_id,clase_id:t,sesion_clase_id:e,maestro_id:n,fecha_evaluacion:r,evaluacion_tipo:`observacion`,estado_cualitativo:o,calificacion:a.nota??null,contenido_dsl:i||``,observaciones:a.observacion||null,indicadores:{tipo:`tecnica`,es_colectivo:!1,tarea:a.tarea||null},objetivo_id:null}});try{let{data:e,error:t}=await Ue(s);return t?(console.error(`[Progress] saveProgressFromEvaluaciones error:`,t),{saved:0,error:t.message}):{saved:(e||[]).length,error:null}}catch(e){return console.error(`[Progress] saveProgressFromEvaluaciones exception:`,e),{saved:0,error:e.message}}}async function Ge({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,progressRecords:i,alumnos:a}){if(!i||i.length===0)return{saved:[],errors:[]};if(!t)return console.warn(`[Progress] Skip saveProgressFromAI — emergente session sin clase_id`),{saved:[],errors:[]};let o=[],s=[];for(let c of i){let{resolved:i,errors:l}=He(c.alumnos||[],a);s.push(...l);for(let a of i)o.push({alumno_id:a.id,clase_id:t,sesion_clase_id:e,maestro_id:n,fecha_evaluacion:r,evaluacion_tipo:`observacion`,estado_cualitativo:c.estado||`EN_PROGRESO`,calificacion:c.nota??null,contenido_dsl:c.contenido||``,observaciones:c.observacion||null,indicadores:{tipo:c.tipo||`otro`,es_colectivo:c.es_colectivo??!1,tarea:c.tarea||null},objetivo_id:null})}try{let{data:e,error:t}=await Ue(o);if(t)throw t;return{saved:(e||[]).map(e=>({alumnoId:e.alumno_id,contenido:e.contenido_dsl,estado:e.estado_cualitativo})),errors:s}}catch(e){return console.warn(`[Progress] Error al guardar progreso:`,e.message),{saved:[],errors:[...s,e.message]}}}async function Ke({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,dslText:i,alumnos:a}){if(!i||!i.trim())return{saved:[],errors:[]};if(!t)return console.warn(`[Progress] Skip saveProgressFromDSL — emergente session sin clase_id`),{saved:[],errors:[]};let o=i.split(`
`),s=[];for(let e of o){let t=ae(e);if(!t.estados||t.estados.length===0||!t.contenido||t.contenido.length===0)continue;let n=t.estados[0],r=t.contenido[0],i=t.alumnos.length>0?t.alumnos:[`todos`],a=t.calificacion?.valor??null;s.push({alumnos:i,contenido:r,tipo:`tecnica`,estado:n,nota:a,tarea:t.tareas[0]||null,observacion:t.sugerencias[0]||null,es_colectivo:i.includes(`todos`)})}return s.length===0?{saved:[],errors:[]}:Ge({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,progressRecords:s,alumnos:a})}async function qe({claseId:e,objetivos:t}){if(!e||!t||t.length===0)return{linked:0};let{data:n,error:r}=await d.from(`progresos`).select(`id, contenido_dsl`).eq(`clase_id`,e).is(`objetivo_id`,null).not(`contenido_dsl`,`is`,null).neq(`contenido_dsl`,``);if(r)return console.warn(`[Progress] linkProgresosToObjetivos fetch error:`,r.message),{linked:0};if(!n||n.length===0)return{linked:0};let i=t.map(e=>({id:e.id,norm:q(e.descripcion),raw:e.descripcion})),a=new Map;for(let e of n){let t=q(e.contenido_dsl);if(!t)continue;let n=i.find(e=>e.norm===t);if(!n&&t.length>=5&&(n=i.find(e=>e.norm.length>=5&&e.norm.includes(t))),!n&&t.length>=5&&(n=i.find(e=>e.norm.length>=5&&t.includes(e.norm))),n){let t=a.get(n.id)||[];t.push(e.id),a.set(n.id,t)}}if(a.size===0)return{linked:0};let o=0;for(let[e,t]of a.entries()){let{error:n}=await d.from(`progresos`).update({objetivo_id:e}).in(`id`,t);n?console.warn(`[Progress] linkProgresosToObjetivos update error:`,n.message):o+=t.length}return console.debug(`[Progress] linkProgresosToObjetivos: linked ${o} records`),{linked:o}}var Je={LOGRADO:{label:`Logrado`,color:`var(--pm-success, #198754)`,bg:`#19875418`},EN_PROGRESO:{label:`En Progreso`,color:`var(--pm-primary, #0d6efd)`,bg:`#0d6efd18`},INICIADO:{label:`Iniciado`,color:`var(--pm-muted,   #6c757d)`,bg:`#6c757d18`}},Ye=[`LOGRADO`,`EN_PROGRESO`,`INICIADO`];function J(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}var Xe={CONDUCTA:{label:`conducta`,icon:`🚨`},ATENCION:{label:`atención`,icon:`🔔`},RIESGO_PEDAGOGICO:{label:`riesgo pedagógico`,icon:`📉`}};function Ze(e){let t={};for(let n of e){let e=n.alertaTipo??n.alertDetails?.type??`CONDUCTA`;t[e]=(t[e]??0)+1}return`${Object.entries(t).map(([e,t])=>{let n=Xe[e]??{label:e.toLowerCase(),icon:`⚠️`};return`${n.icon} ${t} ${n.label}${t>1?`s`:``}`}).join(` · `)} — revisá antes de guardar`}function Qe(e,{onConfirm:t,onCancel:n}){let r=[],i=null;function a(e){let t=e.scope||(e.es_colectivo?`grupo`:`individual`),n=e.alumnos||[];if(e.requires_confirmation)return`<span class="ppp-scope-chip ppp-scope--unknown">❓ Subgrupo sin identificar</span>`;switch(t){case`grupo`:case`all`:return`<span class="ppp-scope-chip ppp-scope--all">👥 Todos los presentes</span>`;case`grupo_excluyendo`:case`group_excluding`:return`<span class="ppp-scope-chip ppp-scope--excluding">👥 Resto del grupo</span>`;case`subgrupo_indeterminado`:case`subgroup_unknown`:return`<span class="ppp-scope-chip ppp-scope--unknown">❓ Subgrupo sin identificar</span>`;default:return n.length?n.length===1?`<span class="ppp-scope-chip ppp-scope--individual">👤 ${J(n[0])}</span>`:`<span class="ppp-scope-chip ppp-scope--individual">👤 ${J(n.join(`, `))}</span>`:``}}function o(e,t){let n=Je[e.estado]??Je.EN_PROGRESO,r=e.nota?` · ${J(e.nota)}/5`:``,i=e.tarea?`<div class="ppp-tarea">📝 ${J(e.tarea)}</div>`:``,o=!!e.alerta,s=a(e);if(o){let n=Xe[e.alertaTipo]??{label:`Alerta pedagógica`,icon:`⚠️`};return`
        <div class="ppp-card ppp-card--alerta" data-idx="${t}">
          <div class="ppp-card-header">
            <span class="ppp-alerta-badge">${n.icon} ${J(n.label===`conducta`?`Conducta`:n.label===`atención`?`Atención pedagógica`:`Riesgo pedagógico`)}</span>
            <button class="ppp-remove" data-idx="${t}" title="Quitar este registro">✕</button>
          </div>
          ${s?`<div class="ppp-scope-row">${s}</div>`:``}
          <div class="ppp-card-body">
            <span class="ppp-contenido ppp-contenido--alerta">${J(e.contenido)||`—`}</span>
          </div>
          ${e.observacion?`<div class="ppp-obs ppp-obs--alerta">${J(e.observacion)}</div>`:``}
          ${i}
        </div>
      `}return`
      <div class="ppp-card" data-idx="${t}">
        <div class="ppp-card-header">
          ${s||`<span class="ppp-alumnos">${J((e.alumnos||[]).join(`, `))}</span>`}
          <button class="ppp-remove" data-idx="${t}" title="Quitar este registro">✕</button>
        </div>
        <div class="ppp-card-body">
          <span class="ppp-contenido">${J(e.contenido)||`—`}</span>
          <span class="ppp-sep">·</span>
          <button
            class="ppp-estado-btn"
            data-idx="${t}"
            style="color:${n.color};background:${n.bg};border-color:${n.color}"
            title="Click para cambiar estado"
          >${n.label}${r}</button>
        </div>
        ${e.observacion?`<div class="ppp-obs">${J(e.observacion)}</div>`:``}
        ${i}
      </div>
    `}function s(e){if(!i)return;let a=r.length>0,c=r.filter(e=>e.alerta),u=c.length>0?`<div class="ppp-alert-banner">⚠️ ${Ze(c)}</div>`:``,d=N(r),f=d.length>0?`
      <div class="ppp-clarification-banner">
        <div class="ppp-clarification-title">✏️ El texto puede ser más específico</div>
        <div class="ppp-clarification-body">
          ${d.map(e=>`<div class="ppp-clarification-item">• ${J(e.reason)}</div>`).join(``)}
        </div>
        <div class="ppp-clarification-hint">Podés guardar igual o editar el texto arriba para separar mejor las ideas.</div>
      </div>
    `:``;i.innerHTML=`
      <div class="ppp-header">
        <span class="ppp-icon">🎯</span>
        <div class="ppp-header-text">
          <strong>La IA detectó estos avances</strong>
          ${e?`<div class="ppp-resumen">${J(e)}</div>`:``}
        </div>
      </div>
      ${u}
      ${f}
      <div class="ppp-cards">
        ${a?r.map((e,t)=>o(e,t)).join(``):`<div class="ppp-empty">No se detectaron registros de progreso en este texto.</div>`}
      </div>
      <div class="ppp-footer">
        <button class="pm-btn pm-btn-outline ppp-btn-cancel" id="ppp-cancel">Cancelar</button>
        <button class="pm-btn pm-btn-primary ppp-btn-confirm" id="ppp-confirm" ${a?``:`disabled`}>
          ✓ Confirmar y guardar (${r.length})
        </button>
      </div>
    `,$e(),i.querySelectorAll(`.ppp-remove`).forEach(t=>{t.onclick=()=>{r.splice(parseInt(t.dataset.idx),1),s(e)}}),i.querySelectorAll(`.ppp-estado-btn`).forEach(t=>{t.onclick=()=>{let n=parseInt(t.dataset.idx),i=r[n].estado,a=(Ye.indexOf(i)+1)%Ye.length;r[n].estado=Ye[a],s(e)}}),i.querySelector(`#ppp-confirm`).onclick=()=>{t([...r]),l()},i.querySelector(`#ppp-cancel`).onclick=()=>{n&&n(),l()}}function c({progreso:t=[],resumen:n=``}){r=t.map(e=>({...e})),i||(i=document.createElement(`div`),i.className=`pm-progress-preview`,e.appendChild(i)),i.style.display=`block`,s(n),setTimeout(()=>i.scrollIntoView({behavior:`smooth`,block:`start`}),80)}function l(){i&&(i.style.display=`none`,i.innerHTML=``)}return{open:c,close:l}}function $e(){if(document.getElementById(`ppp-alert-styles`))return;let e=document.createElement(`style`);e.id=`ppp-alert-styles`,e.textContent=`
    /* ── Alert banner ────────────────────────────────────────── */
    .ppp-alert-banner {
      margin: 0 0 0.5rem 0;
      padding: 0.5rem 0.75rem;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 6px;
      color: #856404;
      font-size: 0.82rem;
      font-weight: 600;
    }

    /* ── Alert card ──────────────────────────────────────────── */
    .ppp-card--alerta {
      border: 1.5px solid #dc3545 !important;
      background: #fff5f5 !important;
    }
    .dark .ppp-card--alerta,
    [data-theme="dark"] .ppp-card--alerta {
      background: #2a1215 !important;
      border-color: #f87171 !important;
    }

    .ppp-alerta-badge {
      font-size: 0.75rem;
      font-weight: 700;
      color: #dc3545;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .ppp-alerta-alumno {
      font-size: 0.82rem;
      font-weight: 600;
      color: #dc3545;
      margin: 0.15rem 0 0.25rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ppp-contenido--alerta {
      color: #dc3545 !important;
      font-weight: 700;
    }

    .ppp-obs--alerta {
      color: #b91c1c;
      font-style: italic;
      font-size: 0.8rem;
      margin-top: 0.2rem;
    }

    /* ── Clarification banner ────────────────────────────────── */
    .ppp-clarification-banner {
      margin: 0 0 0.5rem 0;
      padding: 0.6rem 0.75rem;
      background: #f0f4ff;
      border: 1px solid #93c5fd;
      border-radius: 6px;
      font-size: 0.82rem;
    }
    .dark .ppp-clarification-banner,
    [data-theme="dark"] .ppp-clarification-banner {
      background: #1e2a3a;
      border-color: #3b82f6;
    }
    .ppp-clarification-title {
      font-weight: 700;
      color: #1d4ed8;
      margin-bottom: 0.25rem;
    }
    .ppp-clarification-item {
      color: #1e40af;
      margin: 0.1rem 0;
    }
    .dark .ppp-clarification-item,
    [data-theme="dark"] .ppp-clarification-item {
      color: #93c5fd;
    }
    .ppp-clarification-hint {
      color: #6b7280;
      margin-top: 0.35rem;
      font-style: italic;
    }

    /* ── Scope chips ─────────────────────────────────────────── */
    .ppp-scope-row {
      margin: 0.1rem 0 0.2rem 0;
    }
    .ppp-scope-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.1rem 0.5rem;
      border-radius: 99px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .ppp-scope--all {
      background: #e0f2fe;
      color: #0369a1;
    }
    .dark .ppp-scope--all,
    [data-theme="dark"] .ppp-scope--all {
      background: #0c3554;
      color: #7dd3fc;
    }
    .ppp-scope--individual {
      background: #f0fdf4;
      color: #15803d;
    }
    .dark .ppp-scope--individual,
    [data-theme="dark"] .ppp-scope--individual {
      background: #052e16;
      color: #86efac;
    }
    .ppp-scope--excluding {
      background: #fef9c3;
      color: #854d0e;
    }
    .dark .ppp-scope--excluding,
    [data-theme="dark"] .ppp-scope--excluding {
      background: #3a2900;
      color: #fde047;
    }
    .ppp-scope--unknown {
      background: #faf5ff;
      color: #7c3aed;
      border: 1px dashed #c4b5fd;
    }
    .dark .ppp-scope--unknown,
    [data-theme="dark"] .ppp-scope--unknown {
      background: #1e1030;
      color: #c4b5fd;
    }
  `,document.head.appendChild(e)}async function et(e,t=12){let n=new Date;n.setDate(n.getDate()-t*7);let r=n.toISOString().split(`T`)[0],{data:i,error:a}=await d.from(`progresos`).select(`
      contenido_dsl,
      tipo,
      estado_cualitativo,
      fecha_evaluacion,
      alumnos ( nombre_completo )
    `).eq(`clase_id`,e).eq(`evaluacion_tipo`,`observacion`).gte(`fecha_evaluacion`,r).not(`contenido_dsl`,`is`,null).neq(`contenido_dsl`,``).order(`fecha_evaluacion`,{ascending:!1});if(a)throw Error(`Error al obtener registros de progreso: `+a.message);if(!i||i.length===0)return{totalSesiones:0,fechaDesde:r,registros:[]};let o=new Set(i.map(e=>e.fecha_evaluacion)),s=new Map;for(let e of i){let t=(e.contenido_dsl||``).trim().toLowerCase();if(!t)continue;s.has(t)||s.set(t,{contenido_dsl:e.contenido_dsl.trim(),tipo:e.tipo||`otro`,estados:[],fechas:new Set,alumnos:new Set});let n=s.get(t);n.estados.push(e.estado_cualitativo||`EN_PROGRESO`),n.fechas.add(e.fecha_evaluacion);let r=e.alumnos?.nombre_completo;r&&n.alumnos.add(r)}let c=Array.from(s.values()).map(e=>({contenido_dsl:e.contenido_dsl,tipo:e.tipo,estado:e.estados[0]||`EN_PROGRESO`,frecuencia:e.fechas.size,alumnos:Array.from(e.alumnos)}));return c.sort((e,t)=>t.frecuencia-e.frecuencia),{totalSesiones:o.size,fechaDesde:r,registros:c}}var tt={tecnica:{color:`#0d6efd`,bg:`#0d6efd15`},repertorio:{color:`#198754`,bg:`#19875415`},teoria:{color:`#fd7e14`,bg:`#fd7e1415`},interpretacion:{color:`#6f42c1`,bg:`#6f42c115`},otro:{color:`#6c757d`,bg:`#6c757d15`}},nt={alta:{label:`Foco`,color:`#dc3545`},media:{label:`Secundario`,color:`#fd7e14`},consolidacion:{label:`Consolidar`,color:`#198754`}};function rt(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function it(e,{onAdopt:t,onCancel:n}){let r=[],i=``,a=null;function o(e,t,n){let r=nt[e.prioridad]??nt.media;return`
      <div class="cpp-objetivo-row" data-pilar="${t}" data-obj="${n}">
        <span
          class="cpp-objetivo-text"
          data-pilar="${t}"
          data-obj="${n}"
          title="Click para editar"
        >${rt(e.descripcion)}</span>
        <span class="cpp-prioridad-badge" style="color:${r.color}">${r.label}</span>
        <button class="cpp-remove-obj" data-pilar="${t}" data-obj="${n}" title="Quitar objetivo">✕</button>
      </div>
    `}function s(e,t){let n=tt[e.tipo]??tt.otro,r=(e.objetivos||[]).map((e,n)=>o(e,t,n)).join(``);return`
      <div class="cpp-pilar" data-pilar="${t}" style="border-left:3px solid ${n.color};background:${n.bg}">
        <div class="cpp-pilar-header">
          <span
            class="cpp-pilar-title"
            data-pilar="${t}"
            title="Click para editar nombre"
          >${rt(e.nombre)}</span>
          <button class="cpp-remove-pilar" data-pilar="${t}" title="Quitar pilar">✕</button>
        </div>
        <div class="cpp-objetivos">
          ${r||`<div class="cpp-no-obj">Sin objetivos</div>`}
        </div>
      </div>
    `}function c(){return a?.querySelector(`#cpp-instrumento`)?.value?.trim()||``}function l(){return a?.querySelector(`#cpp-nivel`)?.value?.trim()||``}function u(){return!c()||r.length===0?!1:r.every(e=>(e.objetivos||[]).length>0)}function d(e,o){if(!a)return;let f=r.length>0;a.innerHTML=`
      <div class="cpp-header">
        <span class="cpp-icon">✨</span>
        <div class="cpp-header-text">
          <strong>Propuesta curricular generada por IA</strong>
          ${i?`<div class="cpp-resumen">${rt(i)}</div>`:``}
        </div>
      </div>
      <div class="cpp-pilares">
        ${f?r.map((e,t)=>s(e,t)).join(``):`<div class="cpp-empty">La IA no detectó suficientes datos para generar una propuesta.</div>`}
      </div>
      <div class="cpp-footer">
        <div class="cpp-fields">
          <label class="cpp-field-label">Instrumento
            <input type="text" id="cpp-instrumento" class="cpp-input" value="${rt(e)}" placeholder="ej. Violín" />
          </label>
          <label class="cpp-field-label">Nivel
            <input type="text" id="cpp-nivel" class="cpp-input" value="${rt(o)}" placeholder="ej. Básico" />
          </label>
        </div>
        <div class="cpp-actions">
          <button class="pm-btn pm-btn-outline" id="cpp-cancel">Cancelar</button>
          <button class="pm-btn pm-btn-primary" id="cpp-adopt" ${u()?``:`disabled`}>
            ✓ Adoptar plan (${r.length} pilares)
          </button>
        </div>
      </div>
    `,a.querySelectorAll(`.cpp-pilar-title`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar),n=document.createElement(`input`);n.type=`text`,n.className=`cpp-input cpp-inline-input`,n.value=r[t].nombre,e.replaceWith(n),n.focus();let i=()=>{r[t].nombre=n.value.trim()||r[t].nombre,d(c(),l())};n.onblur=i,n.onkeydown=e=>{e.key===`Enter`&&(e.preventDefault(),i())}}}),a.querySelectorAll(`.cpp-objetivo-text`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar),n=parseInt(e.dataset.obj),i=document.createElement(`input`);i.type=`text`,i.className=`cpp-input cpp-inline-input`,i.value=r[t].objetivos[n].descripcion,e.replaceWith(i),i.focus();let a=()=>{r[t].objetivos[n].descripcion=i.value.trim()||r[t].objetivos[n].descripcion,d(c(),l())};i.onblur=a,i.onkeydown=e=>{e.key===`Enter`&&(e.preventDefault(),a())}}}),a.querySelectorAll(`.cpp-remove-obj`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar),n=parseInt(e.dataset.obj);r[t].objetivos.splice(n,1),d(c(),l())}}),a.querySelectorAll(`.cpp-remove-pilar`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar);r.splice(t,1),d(c(),l())}});let m=a.querySelector(`#cpp-instrumento`),h=a.querySelector(`#cpp-adopt`);m&&h&&(m.oninput=()=>{h.disabled=!u()}),h&&(h.onclick=()=>{let e=c(),n=l();if(!e){m?.focus();return}t({instrumento:e,nivel:n,resumen:i,pilares:r}),p()});let g=a.querySelector(`#cpp-cancel`);g&&(g.onclick=()=>{n&&n(),p()})}function f({pilares:t=[],resumen:n=``,instrumento:o=``,nivel:s=``}){r=t.map(e=>({...e,objetivos:(e.objetivos||[]).map(e=>({...e}))})),i=n,a||(a=document.createElement(`div`),a.className=`cpp-panel`,e.appendChild(a)),a.style.display=`block`,d(o,s),setTimeout(()=>a.scrollIntoView({behavior:`smooth`,block:`nearest`}),50)}function p(){a&&(a.style.display=`none`,a.innerHTML=``)}return{open:f,close:p}}function at(e){let t=(e?.nombre||``).toLowerCase();return(e?.instrumento||``).toLowerCase(),/orquesta|ensamble|ensemble|coro|ensayo/.test(t)?`ensayo_general`:/teor[ií]a|solfeo|lenguaje\s+musical/.test(t)?`teoria`:`instrumento`}function ot(e,t){if(!e||e.length===0)return;t.parentNode.querySelectorAll(`.pm-progress-feedback`).forEach(e=>e.remove());let n=[...new Set(e.slice(0,3).map(e=>e.contenido||`progreso`))].join(` · `)+(e.length>3?` y ${e.length-3} más`:``),r=document.createElement(`div`);r.className=`pm-progress-feedback`,r.innerHTML=`<i class="bi bi-check-circle-fill"></i> <span>${e.length} registro(s) guardados — ${n}</span>`,t.parentNode.insertBefore(r,t.nextSibling),setTimeout(()=>r.remove(),4200)}function st(e,t,n,r,i){if(!r)return`No hay datos de clase disponibles.`;let a=(e||[]).filter(e=>e.estado===`P`).length,o=(e||[]).filter(e=>e.estado===`A`).length,s=(e||[]).filter(e=>e.estado===`J`).length,c=`Reporte de Clase - ${r.nombre||`Sin nombre`}\n`;return c+=`Fecha: ${i||``}\n`,c+=`Instrumento: ${r.instrumento||`N/A`}\n\n`,c+=`RESUMEN DE ASISTENCIA
`,c+=`Presentes: ${a} | Ausentes: ${o} | Justificados: ${s}\n\n`,t&&t.trim()&&(c+=`CONTENIDO DE LA CLASE:\n${t}\n\n`),c+=`DETALLE DE ALUMNOS:
`,(e||[]).forEach(e=>{let t=(n||[]).find(t=>t.id===e.alumno_id)?.nombre_completo||`Alumno`,r=e.estado===`P`?`Presente`:e.estado===`A`?`Ausente`:`Justificado`;c+=`- ${t}: ${r}\n`}),c}function ct(e,t,n=1800){if(t.length>n){let r=t.slice(0,n)+`…

[Texto truncado — el reporte completo excede el límite de caracteres]`;AppToast.warn(`El texto se truncó (${t.length} caracteres, máximo ${n}). Usá la opción PDF para ver el reporte completo.`),window.open(e+encodeURIComponent(r),`_blank`)}else window.open(e+encodeURIComponent(t),`_blank`)}function lt(e,t){let{clase:n,horario:r,salonNombre:i,fechaHoy:a,totalAlumnos:o,hasConflict:s,onBack:c}=t,l=[];function u(e,t,n){e.addEventListener(t,n),l.push(()=>e.removeEventListener(t,n))}e.innerHTML=`
    ${s?`
      <div class="pm-conflict-banner">
        <i class="bi bi-exclamation-triangle"></i>
        <span>Sesión modificada externamente. Guardado como revisión.</span>
        <button id="pm-conflict-dismiss">&times;</button>
      </div>
    `:``}
    <div class="pm-asist-header">
      <button id="pm-asist-back" class="pm-icon-btn"><i class="bi bi-arrow-left"></i></button>
      <div style="flex:1">
        <h2 class="pm-asist-title">${R(n.nombre)}</h2>
        <p class="pm-asist-subtitle">
          ${i?`📍 ${R(i)} · `:``}
          ${r?`${ne(r.hora_inicio)} – ${ne(r.hora_fin)} · `:``}
          <span style="color:var(--pm-primary); font-weight:700;">${L(new Date(a+`T12:00:00`))}</span> · 
          ${o} alumnos
        </p>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div id="pm-sync-badge-container"></div>
        <button id="pm-btn-help" class="pm-help-btn" title="Guía rápida"><i class="bi bi-question-lg"></i></button>
        <div class="pm-asist-bulk-circles">
          <button id="btn-bulk-p" class="pm-bulk-circle p" title="Todos presentes">P</button>
          <button id="btn-bulk-a" class="pm-bulk-circle a" title="Todos ausentes">A</button>
        </div>
      </div>
    </div>
  `;let d=e.querySelector(`#pm-asist-back`);return d&&u(d,`click`,c),{destroy(){l.forEach(e=>{try{e()}catch{}}),l.length=0}}}function ut(e,{editor:t,toolbar:n}){let r=!1;return{inject(i,a){if(r||!i||i.claseId!==a)return;let o=`[${i.nombre}] `;t.insertText(o),n.setContext({indicadorActivo:i.nombre});let s=e.querySelector(`#btn-guardar-obs`);s&&(s.style.display=``);let c=e.querySelector(`#pm-dsl-editor-container`);if(c){let e=c.parentElement.querySelector(`.pm-ruta-tema-banner`);e&&e.remove();let t=document.createElement(`div`);t.className=`pm-ruta-tema-banner`,t.style.cssText=`
          background:#eff6ff;border:1px solid #93c5fd;border-radius:8px;
          padding:8px 12px;margin-bottom:8px;font-size:12px;color:#1d4ed8;
          display:flex;align-items:center;gap:8px;
        `,t.innerHTML=`
          <i class="bi bi-diagram-3"></i>
          Tema cargado desde Ruta: <strong>${i.nombre.replace(/</g,`&lt;`)}</strong>
          <button onclick="this.parentElement.remove()" style="
            margin-left:auto;background:none;border:none;cursor:pointer;
            font-size:12px;color:#1d4ed8;
          ">✕</button>
        `,c.parentElement.insertBefore(t,c)}},destroy(){r=!0}}}var dt={pending:{label:`Pendiente`,icon:`⚪`,className:`pending`},viewed:{label:`Vista`,icon:`🟡`,className:`viewed`},graded:{label:`Calificada`,icon:`🟢`,className:`graded`},current:{label:`En curso`,icon:`🔵`,className:`current`}};function ft(t,n){let r=null,i=null,a={},o={},s=[],c=t.querySelector(`#pm-planificacion-card`),l=t.querySelector(`#pm-planificacion-dropdown`),u=t.querySelector(`#pm-planificacion-nombre`),d=t.querySelector(`#pm-planificacion-header`),f=t.querySelector(`#pm-route-tree-container`);d&&(d.onclick=()=>{let e=c.classList.toggle(`open`);l.style.display=e?`block`:`none`});let p=t.querySelector(`.pm-planificacion-tabs-pill`);p&&(p.style.display=`none`);let m=t.querySelector(`#pm-plan-list-rutas`);m&&(m.style.display=`none`);let g=t.querySelector(`#pm-plan-list-planificaciones`);g&&(g.style.display=`none`);let _=t.querySelector(`#pm-curriculo-proposal-trigger`);if(_&&(_.style.display=`none`),!document.getElementById(`pm-weekly-card-styles`)){let e=document.createElement(`style`);e.id=`pm-weekly-card-styles`,e.textContent=`
      .pm-weekly-nav {
        display:flex; align-items:center; justify-content:space-between;
        background:rgba(0,0,0,0.2); padding:8px 12px; border-radius:10px; margin-bottom:12px;
      }
      .pm-weekly-nav-btn {
        background:var(--pm-primary, #3b82f6); border:none; color:#fff;
        padding:4px 10px; border-radius:6px; font-weight:700; font-size:0.75rem; cursor:pointer;
      }
      .pm-weekly-nav-btn:disabled { background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.25); cursor:not-allowed; }
      .pm-weekly-title { font-size:0.8rem; font-weight:800; text-transform:uppercase; color:rgba(255,255,255,0.5); }
      .pm-weekly-box {
        background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05);
        border-radius:12px; padding:12px; margin-bottom:10px;
      }
      .pm-weekly-label { font-size:0.7rem; font-weight:800; text-transform:uppercase; color:var(--pm-primary); margin-bottom:4px; }
      .pm-weekly-text { font-size:0.85rem; color:#fff; font-weight:600; line-height:1.3; }
      .pm-weekly-desc { font-size:0.8rem; color:var(--pm-text-muted, #9ca3af); line-height:1.35; margin-top:4px; }
      .pm-weekly-indicator-badge {
        display:inline-flex; align-items:center; gap:6px; background:rgba(59,130,246,0.15); color:#60a5fa;
        border:1px solid rgba(59,130,246,0.3); padding:6px 12px; border-radius:20px; font-size:0.78rem; font-weight:700; cursor:pointer;
      }
      .pm-weekly-sequence { display:grid; gap:8px; margin-top:12px; }
      .pm-weekly-sequence-item {
        display:flex; align-items:flex-start; justify-content:space-between; gap:10px;
        border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:10px 12px; background:rgba(255,255,255,0.02);
      }
      .pm-weekly-sequence-item.current { border-color:rgba(59,130,246,0.35); background:rgba(59,130,246,0.08); }
      .pm-weekly-sequence-item.graded { border-color:rgba(74,222,128,0.25); }
      .pm-weekly-sequence-item.viewed { border-color:rgba(251,191,36,0.25); }
      .pm-weekly-sequence-status { font-size:0.76rem; font-weight:800; border-radius:999px; padding:4px 10px; white-space:nowrap; background:rgba(255,255,255,0.06); }
      .pm-weekly-sequence-title { font-size:0.83rem; font-weight:700; color:#fff; }
      .pm-weekly-sequence-meta { font-size:0.75rem; color:var(--pm-text-muted, #9ca3af); margin-top:3px; }
      .pm-weekly-edit-btn {
        width:100%; margin-top:8px; border:none; border-radius:10px; padding:10px 12px;
        background:rgba(59,130,246,0.16); color:#93c5fd; font-weight:700; cursor:pointer;
      }
      .pm-weekly-edit-btn:hover { background:rgba(59,130,246,0.22); }
      .pm-weekly-chip {
        display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:999px;
        background:rgba(16,185,129,0.12); color:#6ee7b7; font-size:0.74rem; font-weight:700; margin-top:8px;
      }
    `,document.head.appendChild(e)}function v(){return typeof n.getSessionState==`function`?n.getSessionState():{isRegistered:!1}}async function y(e){return!e||!n.claseId||!n.maestro?.id?{}:(await C(n.claseId,n.maestro.id,e).catch(()=>[])).reduce((e,t)=>(e[String(t.week_number)]=t,e),{})}function b(e){let t=o[String(e.week_number)]||null;return{...e,teacher_strategy:t?.teacher_strategy||e.teacher_strategy,student_activity:t?.student_activity||e.student_activity,homework:t?.homework||e.homework,evidence:t?.evidence||e.evidence,teacher_notes:t?.teacher_notes||``,hasTeacherAdjustment:!!t}}async function x(){try{if(c.style.display=``,r=await j(n.claseId),!r)if(h.isDemoMode)r=await E({group_id:n.claseId,weekly_plan_id:`wplan-violin-n0`,level_id:`pnivel_001`,teacher_id:n.maestro?.id||`maestro_001`});else{u&&(u.textContent=`Sin guía ACM asignada`),f&&(f.innerHTML=`
              <div style="padding:10px;font-size:0.82rem;color:var(--pm-text-muted);">
                ACM todavía no ha asignado una guía institucional a esta clase.
              </div>
            `);return}a=await w(n.claseId).catch(()=>({})),i=r.weekly_plan_id&&await k?.(r.weekly_plan_id)||await S(r.level_id,`violín`),o=await y(r?.weekly_plan_id),u&&(u.textContent=i?.instrument?`${i.instrument} · Ruta Activa ACM`:`Ruta Activa ACM`),ee()}catch(e){console.error(`[PlanificationCard] Error inicializando:`,e),f&&(f.innerHTML=`<div style="color:#ef4444;font-size:0.8rem;padding:8px;">Error al cargar planificación semanal: ${e.message}</div>`)}}function T(e,t){return Object.keys(a).some(t=>e.indicator_id?t.endsWith(`_${e.indicator_id}`)&&a[t]?.status&&a[t]?.status!==`not_started`:!1)?dt.graded:e.week_number<t||e.week_number===t&&v().isRegistered?dt.viewed:e.week_number===t?dt.current:dt.pending}function D(e){return`
      <div class="pm-weekly-box" style="margin-bottom:0;">
        <div class="pm-weekly-label">Secuencia de lo dado y calificado</div>
        <div class="pm-weekly-sequence">
          ${(i?.items||[]).map(t=>{let n=b(t),r=T(t,e);return`
              <div class="pm-weekly-sequence-item ${r.className}">
                <div>
                  <div class="pm-weekly-sequence-title">Semana ${t.week_number} · ${R(t.topic)}</div>
                  <div class="pm-weekly-sequence-meta">${R(n.assessment_method||n.evidence||`Sin evidencia registrada`)}</div>
                  ${n.hasTeacherAdjustment?`<div class="pm-weekly-chip">✍️ Ajuste docente aplicado</div>`:``}
                </div>
                <div class="pm-weekly-sequence-status">${r.icon} ${r.label}</div>
              </div>
            `}).join(``)}
        </div>
      </div>
    `}function M(t){let i=document.createElement(`div`);i.style.cssText=`position:fixed;inset:0;background:rgba(15,23,42,.72);backdrop-filter:blur(4px);z-index:2100;display:flex;align-items:center;justify-content:center;padding:16px;`,i.innerHTML=`
      <div style="width:min(720px,100%);max-height:90vh;overflow:auto;background:var(--pm-surface,#0f172a);color:var(--pm-text,#fff);border:1px solid var(--pm-border,rgba(255,255,255,.1));border-radius:18px;">
        <div style="padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;gap:12px;align-items:start;">
          <div>
            <div style="font-weight:800;font-size:1rem;">Ajuste docente controlado</div>
            <div style="font-size:.85rem;color:var(--pm-text-muted,#94a3b8);margin-top:4px;">Semana ${t.week_number}. Esto NO reemplaza la guía ACM; solo guarda la adaptación del maestro para esta clase.</div>
          </div>
          <button type="button" data-close-modal style="border:none;background:none;color:inherit;font-size:1.4rem;cursor:pointer;">×</button>
        </div>
        <form id="pm-weekly-adjustment-form" style="padding:16px 18px;display:grid;gap:14px;">
          <label style="display:grid;gap:6px;font-size:.85rem;font-weight:700;">Estrategia docente ajustada
            <textarea name="teacher_strategy" rows="3" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${R(t.teacher_strategy||``)}</textarea>
          </label>
          <label style="display:grid;gap:6px;font-size:.85rem;font-weight:700;">Actividad del estudiante
            <textarea name="student_activity" rows="3" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${R(t.student_activity||``)}</textarea>
          </label>
          <label style="display:grid;gap:6px;font-size:.85rem;font-weight:700;">Tarea
            <textarea name="homework" rows="2" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${R(t.homework||``)}</textarea>
          </label>
          <label style="display:grid;gap:6px;font-size:.85rem;font-weight:700;">Evidencia esperada ajustada
            <textarea name="evidence" rows="2" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${R(t.evidence||``)}</textarea>
          </label>
          <label style="display:grid;gap:6px;font-size:.85rem;font-weight:700;">Notas pedagógicas del maestro
            <textarea name="teacher_notes" rows="3" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${R(t.teacher_notes||``)}</textarea>
          </label>
          <div style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" data-close-modal style="border:1px solid rgba(255,255,255,.12);background:transparent;color:inherit;padding:10px 14px;border-radius:12px;font-weight:700;cursor:pointer;">Cancelar</button>
            <button type="submit" style="border:none;background:var(--pm-primary,#2563eb);color:#fff;padding:10px 14px;border-radius:12px;font-weight:700;cursor:pointer;">Guardar ajuste</button>
          </div>
        </form>
      </div>
    `;let a=()=>i.remove();i.querySelectorAll(`[data-close-modal]`).forEach(e=>{e.onclick=a}),i.onclick=e=>{e.target===i&&a()};let o=i.querySelector(`#pm-weekly-adjustment-form`);o.onsubmit=async i=>{i.preventDefault();let s=new FormData(o);try{await O({group_id:n.claseId,teacher_id:n.maestro?.id,weekly_plan_id:r?.weekly_plan_id,week_number:t.week_number,teacher_strategy:String(s.get(`teacher_strategy`)||``).trim(),student_activity:String(s.get(`student_activity`)||``).trim(),homework:String(s.get(`homework`)||``).trim(),evidence:String(s.get(`evidence`)||``).trim(),teacher_notes:String(s.get(`teacher_notes`)||``).trim()}),e.success(`Ajuste docente guardado sin modificar la guía ACM.`),a(),await x()}catch(t){console.error(`[PlanificationCard] Error guardando ajuste docente:`,t),e.error(t.message||`No se pudo guardar el ajuste docente.`)}},document.body.appendChild(i)}function ee(){if(!f||!i)return;let e=r.current_week||1,a=(i.items||[]).find(t=>t.week_number===e),o=a?b(a):null;if(!o){f.innerHTML=`<div style="padding:10px;font-size:0.8rem;color:var(--pm-text-muted);">No hay planificación registrada para la Semana ${e}</div>`;return}let s=t.querySelector(`#pm-active-tema-badge`);s&&(s.textContent=`Semana ${e}: ${o.topic}`,s.style.display=`inline-block`),f.innerHTML=`
      <div class="pm-weekly-nav">
        <button class="pm-weekly-nav-btn prev" ${e<=1?`disabled`:``}>◀ Anterior</button>
        <span class="pm-weekly-title">Semana ${e} de ${i.items.length}</span>
        <button class="pm-weekly-nav-btn next" ${e>=i.items.length?`disabled`:``}>Siguiente ▶</button>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Tema de la Clase</div>
        <div class="pm-weekly-text">${R(o.topic)}</div>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Objetivo Pedagógico</div>
        <div class="pm-weekly-desc">${R(o.objective)}</div>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Estrategia Metodológica / Actividades</div>
        <div class="pm-weekly-desc">${R(o.teacher_strategy||`Sin estrategia registrada`)}</div>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Evidencia Requerida</div>
        <div class="pm-weekly-desc">📸 ${R(o.evidence||`Sin evidencia registrada`)}</div>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Actividad del Estudiante / Tarea</div>
        <div class="pm-weekly-desc">${R(o.student_activity||`Sin actividad registrada`)}</div>
        <div class="pm-weekly-desc" style="margin-top:8px;"><strong>Tarea:</strong> ${R(o.homework||`Sin tarea registrada`)}</div>
        ${o.teacher_notes?`<div class="pm-weekly-desc" style="margin-top:8px;"><strong>Nota docente:</strong> ${R(o.teacher_notes)}</div>`:``}
        ${o.hasTeacherAdjustment?`<div class="pm-weekly-chip">✍️ Ajuste docente aplicado sobre la guía ACM</div>`:``}
        <button type="button" class="pm-weekly-edit-btn" id="btn-edit-weekly-adjustment">Editar ajuste docente</button>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Indicador a Evaluar</div>
        <div class="pm-weekly-indicator-badge" id="btn-eval-indicator-weekly">
          🎯 ${R((o.topic||``).split(` `)[0]||`Indicador`)} — Evaluar
        </div>
      </div>

      ${D(e)}
    `,f.querySelector(`.pm-weekly-nav-btn.prev`).onclick=async t=>{t.stopPropagation(),e>1&&(r=await A(r.id,e-1),await x())},f.querySelector(`.pm-weekly-nav-btn.next`).onclick=async t=>{t.stopPropagation(),e<i.items.length&&(r=await A(r.id,e+1),await x())};let c=f.querySelector(`#btn-eval-indicator-weekly`);c&&(c.onclick=e=>{e.stopPropagation(),n.onIndicadorSelect?.({id:o.indicator_id,nombre:o.topic,node_id:o.node_id})});let l=f.querySelector(`#btn-edit-weekly-adjustment`);l&&(l.onclick=e=>{e.stopPropagation(),M(o)})}x();function N(){s.forEach(e=>{try{e()}catch{}}),s.length=0}return{destroy:N,getActiveIndicador:()=>{if(!i||!r)return null;let e=i.items.find(e=>e.week_number===r.current_week);return e?{id:e.indicator_id,nombre:e.topic}:null},refreshTree:async()=>{await x()},getActivePlanificacionId:()=>r?.weekly_plan_id||null}}var Y=null,X=[],pt=null,Z=-1,mt=!1,ht=null,gt=!1,_t=0,vt=0;function yt(){if(!Y){if(Y=document.createElement(`div`),Y.id=`pm-autocomplete-popup`,Y.className=`pm-autocomplete-popup`,Y.style.cssText=`
    position: fixed;
    display: none;
    background: var(--pm-surface, #fff);
    border: 1px solid var(--pm-border, #ddd);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    z-index: 9999;
    min-width: 280px;
    max-width: 360px;
    max-height: 280px;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: pm-ac-fadein 0.15s ease-out;
    user-select: none;
  `,!document.getElementById(`pm-ac-styles`)){let e=document.createElement(`style`);e.id=`pm-ac-styles`,e.textContent=`
      @keyframes pm-ac-fadein {
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .pm-ac-option {
        padding: 10px 14px;
        cursor: pointer;
        border-bottom: 1px solid var(--pm-border, #eee);
        transition: background 0.1s;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .pm-ac-option:last-child { border-bottom: none; }
      .pm-ac-option:hover, .pm-ac-option.selected {
        background: var(--pm-primary-light, #f0f4ff);
      }
      .pm-ac-option.selected {
        background: var(--pm-primary, #007aff);
        color: white;
      }
      .pm-ac-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--pm-surface-2, #f5f5f5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
      }
      .pm-ac-option.selected .pm-ac-icon {
        background: rgba(255,255,255,0.2);
      }
      .pm-ac-text {
        flex: 1;
        min-width: 0;
      }
      .pm-ac-label {
        font-weight: 600;
        font-size: 14px;
        color: var(--pm-text, #333);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pm-ac-option.selected .pm-ac-label {
        color: white;
      }
      .pm-ac-sublabel {
        font-size: 12px;
        color: var(--pm-text-muted, #888);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .pm-ac-option.selected .pm-ac-sublabel {
        color: rgba(255,255,255,0.7);
      }
      .pm-ac-badge {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 4px;
        background: var(--pm-primary-light, #e8f0ff);
        color: var(--pm-primary, #007aff);
        font-weight: 600;
      }
      .pm-ac-option.selected .pm-ac-badge {
        background: rgba(255,255,255,0.2);
        color: white;
      }
      .pm-ac-header {
        padding: 8px 14px;
        font-size: 11px;
        color: var(--pm-text-muted, #888);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid var(--pm-border, #eee);
        background: var(--pm-surface-2, #fafafa);
      }
      .pm-ac-empty {
        padding: 20px;
        text-align: center;
        color: var(--pm-text-muted, #888);
        font-size: 13px;
      }
      .pm-ac-loading {
        padding: 20px;
        text-align: center;
        color: var(--pm-text-muted, #888);
        font-size: 13px;
      }
    `,document.head.appendChild(e)}document.body.appendChild(Y)}}function bt(e,t,n={}){if(yt(),X=e||[],pt=t,ht=n.trigger||null,Z=-1,mt=!0,Et(e),n.position){let e=n.position,t=window.innerWidth,r=window.innerHeight,i=e.x,a=e.y+6;i+320>t-20&&(i=Math.max(10,e.x-320-10)),a+280>r-20&&(a=Math.max(10,e.y-280-10)),Y.style.left=`${i}px`,Y.style.top=`${a}px`}Y.onmousedown=xt,document.addEventListener(`mousemove`,St),document.addEventListener(`mouseup`,Ct),Y.style.display=`block`}function xt(e){e.target.closest(`.pm-ac-option`)||(gt=!0,_t=e.clientX-Y.offsetLeft,vt=e.clientY-Y.offsetTop,Y.style.cursor=`grabbing`,Y.style.transition=`none`)}function St(e){if(!gt)return;let t=e.clientX-_t,n=e.clientY-vt;Y.style.left=`${Math.max(0,t)}px`,Y.style.top=`${Math.max(0,n)}px`}function Ct(){gt&&(gt=!1,Y.style.cursor=``)}function wt(){Y&&(Y.style.display=`none`,gt=!1,document.removeEventListener(`mousemove`,St),document.removeEventListener(`mouseup`,Ct)),X=[],pt=null,Z=-1,mt=!1,ht=null}function Tt(e){X=e||[],Z=-1,Et(e)}function Et(e){if(!Y)return;if(!e||e.length===0){Y.innerHTML=`
      <div class="pm-ac-empty">
        <span>No hay opciones disponibles</span>
      </div>
    `;return}let t=`<div class="pm-ac-header">${At(ht)}</div>`;e.forEach((e,n)=>{let r=e.nombre||e.name||e.label||e.description||``,i=e.instrumento||e.descripcion||e.codigo||e.type||``,a=n===Z,o=jt(ht,e),s=e.is_historial?`<span class="pm-ac-badge">Reciente</span>`:``;t+=`
      <div class="pm-ac-option ${a?`selected`:``}" data-index="${n}">
        <div class="pm-ac-icon">${o}</div>
        <div class="pm-ac-text">
          <div class="pm-ac-label">${Nt(r)}</div>
          ${i?`<div class="pm-ac-sublabel">${Nt(i)}</div>`:``}
        </div>
        ${s}
      </div>
    `}),Y.innerHTML=t,Y.querySelectorAll(`.pm-ac-option`).forEach(e=>{e.addEventListener(`click`,()=>{Dt(parseInt(e.dataset.index,10))})})}function Dt(e){if(e>=0&&e<X.length){let t=X[e];pt&&pt(t),wt()}}function Ot(e){if(!(!mt||X.length===0))switch(e.key){case`ArrowDown`:e.preventDefault(),Z=Math.min(Z+1,X.length-1),Et(X),kt();break;case`ArrowUp`:e.preventDefault(),Z=Math.max(Z-1,0),Et(X),kt();break;case`Enter`:e.preventDefault(),Z>=0?Dt(Z):X.length>0&&Dt(0);break;case`Escape`:e.preventDefault(),wt();break;case`Tab`:X.length>0&&Z===-1&&(e.preventDefault(),Dt(0));break}}function kt(){if(!Y||Z<0)return;let e=Y.querySelector(`.pm-ac-option[data-index="${Z}"]`);e&&e.scrollIntoView({block:`nearest`,behavior:`smooth`})}function At(e){switch(e){case`#`:return`👤 Alumnos`;case`[`:return`📚 Contenidos`;case`(`:return`💡 Sugerencias`;case`{`:return`📝 Tareas`;case`$`:return`🎯 Medidas`;case`>`:return`🎓 Objetivos`;default:return`Opciones`}}function jt(e,t){if(e===`#`){let e=t.nombre||t.name||``;return t.value===`todos`||e.toLowerCase()===`todos`?`👥`:e.charAt(0).toUpperCase()}return e===`$`?`🎯`:e===`>`&&t.level_number?t.level_number:e===`>`&&t.type?Mt(t.type):`•`}function Mt(e){return{ESCALA:`🎼`,ARPEGIO:`🎹`,MANO_IZQ:`✋`,ARCO:`🎻`,SONIDO:`🔊`,AFINACION:`🎵`,TECNICA:`⚙️`,REPERTORIO:`📖`}[e]||`•`}function Nt(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function Pt(){let e=window.getSelection();if(!e||e.rangeCount===0)return null;let t=e.getRangeAt(0).getBoundingClientRect();return{x:t.left,y:t.bottom}}function Ft(){return mt}function It(){return Z}var Lt={show:bt,hide:wt,updateOptions:Tt,handleKeyDown:Ot,getCursorPosition:Pt,isOpen:Ft,getSelectedIndex:It},Rt=`portal-maestros-catalogs`,zt=1,Bt={alumnos:{ttl:1440*60*1e3},contenidos:{ttl:10080*60*1e3},medidas:{ttl:720*60*60*1e3},sugerencias:{ttl:720*60*60*1e3},tareas:{ttl:720*60*60*1e3},nodos:{ttl:10080*60*1e3},niveles:{ttl:10080*60*1e3},indicadores:{ttl:10080*60*1e3},historial:{ttl:null}},Vt=null;async function Q(){return Vt||(Vt=await p(Rt,zt,{upgrade(e){for(let[t,n]of Object.entries(Bt))if(!e.objectStoreNames.contains(t)){let n=e.createObjectStore(t,{keyPath:`id`});n.createIndex(`by_updated`,`updated_at`),t===`alumnos`&&n.createIndex(`by_clase`,`clase_id`)}}}),Vt)}async function Ht(e,t){let n=await Q(),r=await n.get(e,t);if(!r)return null;let i=Bt[e];if(i?.ttl&&r.updated_at){let a=new Date(r.updated_at).getTime()+i.ttl;if(Date.now()>a)return await n.delete(e,t),null}return r}async function Ut(e){let t=await(await Q()).getAll(e),n=Bt[e];if(!n?.ttl)return t;let r=Date.now();return t.filter(e=>e.updated_at?r<=new Date(e.updated_at).getTime()+n.ttl:!0)}async function Wt(e,t,n){return(await Q()).getAllFromIndex(e,t,n)}async function Gt(e,t){let n=await Q(),r={...t,updated_at:new Date().toISOString()};return await n.put(e,r),r}async function Kt(e,t){let n=(await Q()).transaction(e,`readwrite`);for(let e of t)await n.store.put({...e,updated_at:new Date().toISOString()});await n.done}async function qt(e,t){await(await Q()).delete(e,t)}async function Jt(e){await(await Q()).clear(e)}async function Yt(e){let t=await Q(),n=Bt[e];if(!n?.ttl)return;let r=await t.getAll(e),i=Date.now();for(let a of r)a.updated_at&&i>new Date(a.updated_at).getTime()+n.ttl&&await t.delete(e,a.id)}async function Xt(){let e=await Q();for(let t of Object.keys(Bt))await e.clear(t)}async function Zt(e){return(await Ut(e)).length}async function Qt(e,t){let n=await Q(),r=new Date().toISOString(),i=await n.get(`historial`,e);i?(i.count=(i.count||0)+1,i.last_used=r,i.recent_selections=[t,...(i.recent_selections||[]).slice(0,9)],await n.put(`historial`,i)):await n.put(`historial`,{id:e,trigger:e,count:1,last_used:r,recent_selections:[t],updated_at:r})}async function $t(e){return(await Q()).get(`historial`,e)}async function en(e,t=5){return(await(await Q()).getAll(`historial`)).filter(t=>t.trigger===e).sort((e,t)=>(t.count||0)-(e.count||0)).slice(0,t)}var $={get:Ht,getAll:Ut,getByIndex:Wt,set:Gt,setBulk:Kt,remove:qt,clear:Jt,cleanExpired:Yt,clearAll:Xt,getStoreSize:Zt,addToHistorial:Qt,getHistorial:$t,getTopUsed:en};async function tn(e){if(!e)return[];try{let{data:t,error:n}=await d.from(`alumnos_clases`).select(`alumno_id, alumnos(id, nombre_completo, instrumento_principal)`).eq(`clase_id`,e).eq(`activo`,!0);if(n)throw n;if(t)return t.map(e=>e.alumnos).filter(Boolean).map(e=>({id:e.id,nombre:e.nombre_completo||``,instrumento:e.instrumento_principal}))}catch(e){console.warn(`[CatalogService] Error cargando alumnos:`,e)}return[]}async function nn(){let e=await $.getAll(`contenidos`);if(e.length>0)return e;try{let{data:e,error:t}=await d.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`contenidos`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await $.setBulk(`contenidos`,e),e}catch(e){console.warn(`[CatalogService] Error cargando contenidos:`,e)}return[]}async function rn(){let e=await $.getAll(`medidas`);if(e.length>0)return e;try{let{data:e,error:t}=await d.from(`catalogos`).select(`id, nombre, codigo, categoria`).eq(`tipo`,`medidas`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await $.setBulk(`medidas`,e),e}catch(e){console.warn(`[CatalogService] Error cargando medidas:`,e)}return[]}async function an(){let e=await $.getAll(`sugerencias`);if(e.length>0)return e;try{let{data:e,error:t}=await d.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`sugerencias`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await $.setBulk(`sugerencias`,e),e}catch(e){console.warn(`[CatalogService] Error cargando sugerencias:`,e)}return[]}async function on(){let e=await $.getAll(`tareas`);if(e.length>0)return e;try{let{data:e,error:t}=await d.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`tareas`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await $.setBulk(`tareas`,e),e}catch(e){console.warn(`[CatalogService] Error cargando tareas:`,e)}return[]}async function sn(){let e=await $.getAll(`niveles`);if(e.length>0)return e;try{let{data:e}=await d.from(`routes`).select(`id`).eq(`instrument`,`violín`).eq(`status`,`published`).limit(1);if(!e||e.length===0)return[];let t=e[0].id,{data:n}=await d.from(`route_versions`).select(`id`).eq(`route_id`,t).eq(`status`,`published`).order(`version`,{ascending:!1}).limit(1);if(!n||n.length===0)return[];let r=n[0].id,{data:i,error:a}=await d.from(`levels`).select(`id, level_number, name, main_objective`).eq(`route_version_id`,r).order(`level_number`,{ascending:!0});if(a)throw a;if(i)return await $.setBulk(`niveles`,i),i}catch(e){console.warn(`[CatalogService] Error cargando niveles:`,e)}return[]}async function cn(e=null){let t=await $.getAll(`nodos`);if(e&&t.length>0){if(t=t.filter(t=>t.level_id===e),t.length>0)return t}else if(t.length>0)return t;try{let t=d.from(`nodes`).select(`id, name, type, is_critical, is_required, objective, level_id, order_index`);e&&(t=t.eq(`level_id`,e));let{data:n,error:r}=await t.order(`order_index`,{ascending:!0});if(r)throw r;if(n)return await $.setBulk(`nodos`,n),n}catch(e){console.warn(`[CatalogService] Error cargando nodos:`,e)}return[]}async function ln(e,t=``,n={}){let r=[];switch(e){case`#`:r=[{label:`todos`,value:`todos`,icon:`👥`,description:`Todos los presentes`}],r=r.concat(await tn(n.claseId));break;case`[`:r=await nn();break;case`(`:r=await an();break;case`{`:r=await on();break;case`$`:r=await rn();break;case`>`:r=t.toUpperCase().startsWith(`NIVEL`)?await sn():await cn(n.nivelId);break;default:r=[]}if(t&&r.length>0&&(r=un(r,t)),e&&e!==`#`){let t=(await $.getTopUsed(e,3)).flatMap(e=>e.recent_selections||[]).filter(Boolean).slice(0,3);for(let e of t)r.some(t=>(t.nombre||t.name||``).toLowerCase()===e.toLowerCase())||r.unshift({nombre:e,id:`hist-${e}`,is_historial:!0})}return r}function un(e,t,n=`nombre`){if(!t)return e;let r=t.toLowerCase(),i=r.length;return e.map(e=>{let t=(e[n]||e.name||e.nombre||``).toLowerCase(),a=0;if(t.startsWith(r))a+=10;else if(t.includes(r))a+=5;else{let e=dn(t,r);if(e<=2&&i>3)a+=3-e;else return null}return t.length<20&&(a+=1),{...e,_score:a}}).filter(Boolean).sort((e,t)=>(t._score||0)-(e._score||0)).slice(0,15)}function dn(e,t){let n=[];for(let e=0;e<=t.length;e++)n[e]=[e];for(let t=0;t<=e.length;t++)n[0][t]=t;for(let r=1;r<=t.length;r++)for(let i=1;i<=e.length;i++)t.charAt(r-1)===e.charAt(i-1)?n[r][i]=n[r-1][i-1]:n[r][i]=Math.min(n[r-1][i-1]+1,n[r][i-1]+1,n[r-1][i]+1);return n[t.length][e.length]}async function fn(e,t){await $.addToHistorial(e,t)}var pn=`
  <div class="pm-dsl-placeholder-title">✨ Escribí lo que pasó en clase con tus propias palabras</div>
  <div class="pm-dsl-placeholder-example" style="font-style:italic;color:var(--pm-text-muted,#888);font-size:0.85rem;margin-bottom:6px">
    "Yereni y Santa avanzaron muy bien hoy con el cambio de posición. Santiago necesita practicar más el arco."
  </div>
  <div class="pm-dsl-placeholder-guide">
    Presioná <strong>✨ Analizar con IA</strong> y Groq va a extraer los avances automáticamente. · O usá los tokens del toolbar si preferís escribir directo: # alumno · [] contenido · {} tarea
  </div>
`;function mn(e,{initialContent:t=``,onChange:n,onAlumnosNeeded:r}){let i=t,a=!1,o=!1,s={};e.innerHTML=`
    <div class="pm-dsl-editor-container">
      <div
        id="pm-dsl-editable"
        class="pm-dsl-editable"
        contenteditable="true"
        spellcheck="false"
      ></div>
      <div class="pm-dsl-placeholder" id="pm-dsl-placeholder">${pn}</div>
      <button class="pm-dsl-help-toggle" id="pm-dsl-help-toggle" title="Mostrar/Ocultar ayuda" aria-label="Mostrar/Ocultar ayuda">?</button>
    </div>
  `;let c=e.querySelector(`#pm-dsl-editable`),l=e.querySelector(`#pm-dsl-placeholder`),u=e.querySelector(`#pm-dsl-help-toggle`),d=window.innerWidth>=768;function f(){let e=d&&i.trim()===``;l.style.display=e?`block`:`none`}f(),u&&u.addEventListener(`click`,e=>{e.stopPropagation(),d=!d,f(),u.classList.toggle(`active`,d)});let p=document.createElement(`div`);p.className=`dsl-tooltip`,e.appendChild(p);function m(){i=c.innerText,f(),n&&n(i)}c.addEventListener(`mouseover`,t=>{let n=t.target.closest(`.dsl-objetivo`);if(n){let t=n.dataset.objetivo;p.textContent=`Objetivo: ${t}`,p.style.display=`block`;let r=n.getBoundingClientRect(),i=e.getBoundingClientRect();p.style.left=`${r.left-i.left}px`,p.style.top=`${r.top-i.top-25}px`}}),c.addEventListener(`mouseout`,()=>{p.style.display=`none`});function h(){if(!a&&!o){a=!0;try{let e=window.getSelection();if(!e||e.rangeCount===0)return;let t=e.getRangeAt(0),n=E(c,t);if(document.activeElement!==c||O)return;let r=window.scrollY;i=c.innerText,c.innerHTML=oe(i),D(c,n),window.scrollY!==r&&window.scrollTo({top:r,behavior:`instant`})}catch(e){console.warn(`[DSL] Error en highlight:`,e),i=c.innerText}finally{a=!1}}}function g(){let e=window.getSelection();if(!e||e.rangeCount===0)return null;let t=e.getRangeAt(0),n=document.createRange();n.selectNodeContents(c),n.setEnd(t.endContainer,t.endOffset);let r=n.toString().match(/([#([{$>])\s*([^([{$]*)$/);return r?{trigger:r[1],query:r[2]||``}:null}let _=null;c.addEventListener(`mousedown`,()=>{_=null});function v(){let e=window.getSelection();if(!e||e.rangeCount===0)return;let t=e.getRangeAt(0);_=E(c,t)}function y(){c.focus(),_!==null&&D(c,_)}let b=null;async function x(e=null){let t,n;if(e)t=e,n=``;else{let e=g();if(!e){Lt.hide();return}t=e.trigger,n=e.query}try{let e=await ln(t,n,s);if(e.length>0){let r=Pt();r&&(v(),Lt.show(e,e=>{S(e,t,n)},{trigger:t,position:r}))}else Lt.hide()}catch(e){console.warn(`[DSL] Error en autocompletado:`,e)}}function S(e,t,n){let r=w(e.nombre||e.name||e.label||e.descripcion||``),i=``;switch(t){case`#`:i=r;break;case`[`:i=r+`]`;break;case`(`:i=r+`)`;break;case`{`:i=r+`}`;break;case`$`:i=e.codigo||r;break;case`>`:i=e.level_number?`NIVEL-${e.level_number}`:e.type?`NODO:${e.type}`:r;break}y();let a=window.getSelection();if(!a||a.rangeCount===0){console.warn(`[DSL] Sin selección activa al insertar autocomplete`);return}if(n.length>0){let e=a.getRangeAt(0),t=document.createRange();t.selectNodeContents(c),t.setEnd(e.endContainer,e.endOffset);let r=t.toString(),i=r.length-n.length;try{let e=document.createRange();C(c,e,i,r.length),e.deleteContents()}catch(e){console.warn(`[DSL] Error limpiando query parcial:`,e)}}T(i+` `),fn(t,r)}function C(e,t,n,r){let i=0,a=[e],o=!1;for(;a.length>0;){let e=a.pop();if(e.nodeType===3){let a=i+e.length;if(!o&&n<=a&&(t.setStart(e,n-i),o=!0),o&&r<=a){t.setEnd(e,r-i);return}i=a}else for(let t=e.childNodes.length-1;t>=0;t--)a.push(e.childNodes[t])}}function w(e){if(!e)return``;let t=document.createElement(`div`);return t.innerHTML=e,t.textContent||t.innerText||``}function T(e){let t=w(e),n=window.getSelection();if(!n||n.rangeCount===0)return;let r=n.getRangeAt(0);r.deleteContents();let i=document.createTextNode(t);r.insertNode(i),r.setStartAfter(i),r.collapse(!0),n.removeAllRanges(),n.addRange(r),m(),h()}function E(e,t){let n=t.cloneRange();return n.selectNodeContents(e),n.setEnd(t.endContainer,t.endOffset),n.toString().length}function D(e,t){let n=document.createRange(),r=window.getSelection();if(!r)return;let i=0,a=[e],o,s=!1;for(;a.length>0&&!s;)if(o=a.pop(),o.nodeType===3){let e=i+o.length;t<=e&&(n.setStart(o,t-i),n.collapse(!0),s=!0),i=e}else{let e=o.childNodes.length;for(;e--;)a.push(o.childNodes[e])}r.removeAllRanges(),r.addRange(n)}c.addEventListener(`compositionstart`,()=>{o=!0}),c.addEventListener(`compositionend`,()=>{o=!1,clearTimeout(A),O||(A=setTimeout(h,300))});let O=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),k=``,A=null;O&&c.addEventListener(`blur`,()=>{i!==k&&(k=i,h())}),c.oninput=()=>{m(),O||(clearTimeout(A),A=setTimeout(()=>{i!==k&&(k=i,h())},300)),clearTimeout(b),b=setTimeout(()=>x(),300)},c.addEventListener(`keydown`,e=>{Ft()&&Ot(e)}),c.addEventListener(`paste`,e=>{let t=e.clipboardData?.items;if(t&&Array.from(t).some(e=>e.type&&e.type.startsWith(`image/`))){e.preventDefault();let t=document.createElement(`div`);t.className=`pm-toast-image-blocked`,t.textContent=`🚫 No puedes pegar imágenes. Usa 🎤 para grabar audio o describe el contenido.`,t.style.cssText=`position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#dc3545; color:white; padding:12px 20px; border-radius:8px; z-index:10000; font-size:14px;`,document.body.appendChild(t),setTimeout(()=>t.remove(),4e3)}});function j(e,t=0,n=null){c.focus();let r=window.getSelection();if(!r||r.rangeCount===0)return;let i=r.getRangeAt(0);i.deleteContents();let a=w(e),o=document.createTextNode(a);if(i.insertNode(o),t>0&&t<e.length){let e=document.createRange();e.setStart(o,t),e.collapse(!0),r.removeAllRanges(),r.addRange(e)}else i.setStartAfter(o),i.collapse(!0),r.removeAllRanges(),r.addRange(i);m(),h(),n&&setTimeout(()=>x(n),50)}return t&&(c.innerText=t,m(),h()),{insertText:j,getValue:()=>i,setValue:e=>{c.innerText=e,m(),h()},setContext:e=>{s=e}}}var hn=[{trigger:`escalas`,label:`Escalas`,icon:`🎼`,expand:`[Escala Do Mayor] [Escala Re Mayor] [Escala Sol Mayor]`},{trigger:`arpegios`,label:`Arpegios`,icon:`🎹`,expand:`[Arpegio Do Mayor] [Arpegio La menor] [Arpegio Sol Mayor]`},{trigger:`tecnica`,label:`Técnica`,icon:`🎸`,expand:`$Tecnica_mano_derecha $Tecnica_mano_izquierda`},{trigger:`postura`,label:`Postura`,icon:`🧘`,expand:`$Postura_corporal $Posicion_manos`},{trigger:`evaluar`,label:`Evaluar`,icon:`📝`,expand:`4/5 (buen trabajo) {practicar 30 min diarios}`},{trigger:`mejorar`,label:`Mejorar`,icon:`💪`,expand:`(continuar mejorando la digitación) {repetir练习}`},{trigger:`ritmo`,label:`Ritmo`,icon:`🥁`,expand:`$Ritmo_binario $Ritmo_ternario`},{trigger:`dinamica`,label:`Dinámica`,icon:`🔊`,expand:`$Dinamica_piano $Dinamica_forte $Dinamica_mezzo`},{trigger:`afinacion`,label:`Afinación`,icon:`🎵`,expand:`$Afinacion_precisa $Afinacion_relativa`},{trigger:`lectura`,label:`Lectura`,icon:`📖`,expand:`[Lectura a primera vista] [Lectura de notas]`},{trigger:`respiracion`,label:`Respiración`,icon:`🌬️`,expand:`$Respiracion_diafragmatica $Respiracion_costeado`},{trigger:`memo`,label:`Memoria`,icon:`🧠`,expand:`[Técnica de memorización] {practicar de memoria}`}];function gn(e){if(!e||e.length===0)return hn.slice(0,6);let t=e.toLowerCase();return hn.filter(e=>e.trigger.toLowerCase().includes(t)||e.label.toLowerCase().includes(t)).slice(0,6)}function _n(e){let t=hn.find(t=>t.trigger===e);return t?t.expand:null}function vn(e,t={}){let n=document.getElementById(`pm-toolbar-help-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-toolbar-help-modal`,n.className=`pm-help-modal-overlay`,n.innerHTML=`
      <div class="pm-help-modal">
        <div class="pm-help-modal-header">
          <div class="pm-help-header-content">
            <div class="pm-help-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <h2 class="pm-help-modal-title">Guía de la Toolbar DSL</h2>
              <p class="pm-help-modal-subtitle">Referencia rápida de tokens y atajos</p>
            </div>
          </div>
          <button class="pm-help-close-btn" id="pm-help-close" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="pm-help-modal-body">
          ${[{category:`Referencia`,items:[{icon:`👤`,label:`#`,title:`Alumno`,description:`Etiqueta a un alumno individual`,example:`#María, #Pedro`,color:`#3b82f6`},{icon:`📚`,label:`[ ]`,title:`Contenido`,description:`Marca el tema abordado en la clase`,example:`[Escala Do Mayor]`,color:`#10b981`},{icon:`💡`,label:`( )`,title:`Sugerencia`,description:`Anotación de mejora pedagógica`,example:`(Mejorar postura)`,color:`#f59e0b`},{icon:`📝`,label:`{ }`,title:`Tarea`,description:`Asignación para completar`,example:`{Practicar 30 min}`,color:`#8b5cf6`}]},{category:`Técnico`,items:[{icon:`🎯`,label:`$`,title:`Medida`,description:`Término técnico musical`,example:`$vibrato, $legato`,color:`#06b6d4`},{icon:`🎓`,label:`>`,title:`Objetivo`,description:`Meta curricular o achievement`,example:`>NIVEL-3`,color:`#6366f1`}]},{category:`Inteligencia Artificial`,items:[{icon:`✨`,label:`Mejorar`,title:`Mejorar Texto`,description:`Mejora gramática y claridad con IA`,example:`"María no entiende" → texto mejorado`,color:`#ec4899`},{icon:`🚀`,label:`Estructurar`,title:`Estructurar con DSL`,description:`Convierte texto libre a formato DSL`,example:`"María tocando escalas" → #María [Escalas]`,color:`#f97316`}]}].map(e=>`
            <div class="pm-help-section">
              <h3 class="pm-help-section-title">${e.category}</h3>
              <div class="pm-help-grid">
                ${e.items.map(e=>`
                  <div class="pm-help-card" style="--card-accent: ${e.color}">
                    <div class="pm-help-card-header">
                      <div class="pm-help-card-icon">${e.icon}</div>
                      <div class="pm-help-card-label">${e.label}</div>
                      <div class="pm-help-card-title">${e.title}</div>
                    </div>
                    <p class="pm-help-card-desc">${e.description}</p>
                    <div class="pm-help-card-example">
                      <span class="pm-help-example-label">Ejemplo:</span>
                      <code class="pm-help-example-code">${e.example}</code>
                    </div>
                  </div>
                `).join(``)}
              </div>
            </div>
          `).join(``)}
          
          <div class="pm-help-tips">
            <div class="pm-help-tip-icon">💡</div>
            <div class="pm-help-tip-content">
              <strong>Tip:</strong> Escribe el token directamente en el editor para activar el autocompletado. Presiona <kbd>Tab</kbd> para aceptar la primera sugerencia.
            </div>
          </div>
        </div>
        
        <div class="pm-help-modal-footer">
          <button class="pm-help-primary-btn" id="pm-help-close-btn">
            Entendido
          </button>
        </div>
      </div>
    `,document.body.appendChild(n),!document.getElementById(`pm-help-modal-styles`))){let e=document.createElement(`style`);e.id=`pm-help-modal-styles`,e.textContent=`
        .pm-help-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .pm-help-modal-overlay.open {
          display: flex;
          opacity: 1;
        }
        
        .pm-help-modal {
          background: var(--pm-surface);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25),
                      0 0 0 1px var(--pm-border);
          max-width: 720px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: scale(0.95) translateY(10px);
          transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
        
        .pm-help-modal-overlay.open .pm-help-modal {
          transform: scale(1) translateY(0);
        }
        
        .pm-help-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.5rem 1.5rem 1rem;
          background: var(--pm-surface-2);
          border-bottom: 1px solid var(--pm-border);
        }
        
        .pm-help-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .pm-help-icon-wrapper {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--pm-primary) 0%, #6366f1 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        
        .pm-help-modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--pm-text);
          margin: 0;
          line-height: 1.3;
        }
        
        .pm-help-modal-subtitle {
          font-size: 0.875rem;
          color: var(--pm-text-muted);
          margin: 0.25rem 0 0;
        }
        
        .pm-help-close-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: var(--pm-surface-2);
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--pm-text-muted);
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        
        .pm-help-close-btn:hover {
          background: var(--pm-border);
          color: var(--pm-text);
        }
        
        .pm-help-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }
        
        .pm-help-section {
          margin-bottom: 1.5rem;
        }
        
        .pm-help-section:last-of-type {
          margin-bottom: 0;
        }
        
        .pm-help-section-title {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--pm-text-muted);
          margin: 0 0 0.75rem;
          padding-left: 0.5rem;
        }
        
        .pm-help-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        
        .pm-help-card {
          background: var(--pm-surface-2);
          border: 1px solid var(--pm-border);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        
        .pm-help-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--card-accent, var(--pm-primary));
          opacity: 0.6;
        }
        
        .pm-help-card:hover {
          border-color: var(--card-accent, var(--pm-primary));
          box-shadow: var(--pm-shadow-sm);
          transform: translateY(-1px);
        }
        
        .pm-help-card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }
        
        .pm-help-card-icon {
          font-size: 1.25rem;
          line-height: 1;
        }
        
        .pm-help-card-label {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.7rem;
          font-weight: 600;
          background: var(--pm-primary);
          color: white;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }
        
        .pm-help-card-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--pm-text);
        }
        
        .pm-help-card-desc {
          font-size: 0.8rem;
          color: var(--pm-text-muted);
          margin: 0 0 0.75rem;
          line-height: 1.4;
        }
        
        .pm-help-card-example {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .pm-help-example-label {
          font-size: 0.7rem;
          color: var(--pm-text-muted);
        }
        
        .pm-help-example-code {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.75rem;
          background: var(--pm-surface);
          color: var(--card-accent, var(--pm-primary));
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--pm-border);
        }
        
        .pm-help-tips {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: var(--pm-warning-bg);
          border: 1px solid var(--pm-warning-text);
          border-radius: 10px;
          padding: 1rem;
          margin-top: 1rem;
        }
        
        .pm-help-tip-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        
        .pm-help-tip-content {
          font-size: 0.85rem;
          color: var(--pm-warning-text);
          line-height: 1.5;
        }
        
        .pm-help-tip-content kbd {
          display: inline-block;
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.75rem;
          background: var(--pm-surface);
          border: 1px solid var(--pm-border);
          border-radius: 4px;
          padding: 0.1rem 0.35rem;
          margin: 0 0.1rem;
        }
        
        .pm-help-modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--pm-border);
          display: flex;
          justify-content: flex-end;
        }
        
        .pm-help-primary-btn {
          background: linear-gradient(135deg, var(--pm-primary) 0%, var(--apple-primary-dark, #2563eb) 100%);
          color: white;
          border: none;
          padding: 0.625rem 1.5rem;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
        }
        
        .pm-help-primary-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
        }
        
        .pm-help-primary-btn:active {
          transform: translateY(0);
        }
        
        /* Scrollbar styling */
        .pm-help-modal-body::-webkit-scrollbar {
          width: 6px;
        }
        
        .pm-help-modal-body::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .pm-help-modal-body::-webkit-scrollbar-thumb {
          background: var(--pm-border);
          border-radius: 3px;
        }
        
        .pm-help-modal-body::-webkit-scrollbar-thumb:hover {
          background: var(--pm-text-muted);
        }
        
        /* Responsive */
        @media (max-width: 640px) {
          .pm-help-modal {
            max-height: 95vh;
          }
          
          .pm-help-modal-header {
            padding: 1rem;
          }
          
          .pm-help-icon-wrapper {
            width: 40px;
            height: 40px;
          }
          
          .pm-help-modal-title {
            font-size: 1.1rem;
          }
          
          .pm-help-modal-body {
            padding: 1rem;
          }
          
          .pm-help-grid {
            grid-template-columns: 1fr;
          }
        }
      `,document.head.appendChild(e)}let r=null;function i(){n.classList.add(`open`),n.querySelector(`.pm-help-primary-btn`)?.focus(),r&&r.dispose(),r=a(n.querySelector(`.pm-help-modal`),{onClose:()=>o()})}function o(){r&&=(r.dispose(),null),n.classList.remove(`open`)}return n.querySelector(`#pm-help-close`).onclick=o,n.querySelector(`#pm-help-close-btn`).onclick=o,n.onclick=e=>{e.target===n&&o()},document.addEventListener(`keydown`,function e(t){t.key===`Escape`&&n.classList.contains(`open`)&&(o(),document.removeEventListener(`keydown`,e))}),{open:i,close:o}}function yn(e,{onInsert:t,onLoading:n,onIaProposal:r,getEditorContent:i,aiService:a,onImproveClick:o,onStructureClick:s,onAnalyzeClick:c}){let l={presentes:[],indicadorActivo:null,indicadoresDisponibles:[]},u=[{token:`alumno`,label:`#`,title:`Etiquetar alumno`,text:`#`,offset:1,icon:`👤`,triggerAC:`#`},{token:`contenido`,label:`[ ]`,title:`Contenido de clase`,text:`[]`,offset:1,icon:`📚`,triggerAC:`[`},{token:`sugerencia`,label:`( )`,title:`Sugerencia pedagógica`,text:`()`,offset:1,icon:`💡`,triggerAC:`(`},{token:`tarea`,label:`{ }`,title:`Tarea / Asignación`,text:`{}`,offset:1,icon:`📝`,triggerAC:`{`},{token:`medida`,label:`$`,title:`Medida técnica`,text:`$`,offset:1,icon:`🎯`,triggerAC:`$`},{token:`objetivo`,label:`>`,title:`Objetivo curricular`,text:`>`,offset:1,icon:`🎓`,triggerAC:`>`}];if(e.innerHTML=`
    <div class="pm-dsl-toolbar">
      ${u.map(e=>`
        <button class="pm-dsl-tool-btn" data-token="${e.token}" title="${e.title}">
          <span class="pm-dsl-tool-symbol">${e.label}</span>
        </button>
      `).join(``)}
      <div class="pm-dsl-divider"></div>
      <button class="pm-dsl-tool-btn snippet-btn" id="btn-snippets" title="Snippets / Banco">
        <span class="snippet-icon">/</span>
      </button>
      <div class="pm-dsl-divider"></div>
      <button class="pm-dsl-tool-btn ai" id="btn-generar-informe" title="Generar informe para padres/tutores">📋</button>
      <button class="pm-dsl-tool-btn ai" id="btn-ia-magic" title="Estructurar con IA">🚀</button>
      <button class="pm-dsl-tool-btn ai ai-primary" id="btn-analizar-progreso" title="La IA lee tu texto y extrae los avances de cada alumno automáticamente">✨ Analizar con IA</button>
      <div class="pm-dsl-divider"></div>
      <button class="pm-dsl-tool-btn" id="btn-help" title="Ayuda">❓</button>

    </div>
    <div id="pm-snippet-popup" class="pm-snippet-popup" style="display:none;"></div>
  `,!document.getElementById(`pm-dsl-toolbar-styles`)){let e=document.createElement(`style`);e.id=`pm-dsl-toolbar-styles`,e.textContent=`
      .pm-dsl-toolbar {
        display: flex;
        gap: 0.25rem;
        padding: 0.5rem;
        background: var(--pm-surface);
        border: 1px solid var(--pm-border);
        border-radius: var(--pm-radius-sm) var(--pm-radius-sm) 0 0;
        overflow-x: auto;
        white-space: nowrap;
        scrollbar-width: none;
        align-items: center;
      }
      .pm-dsl-toolbar::-webkit-scrollbar { display: none; }
      
      .pm-dsl-tool-btn {
        min-width: 32px;
        height: 32px;
        padding: 0 0.5rem;
        border: 1px solid var(--pm-border);
        background: var(--pm-surface);
        color: var(--pm-text);
        border-radius: 6px;
        font-weight: 700;
        cursor: pointer;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
        position: relative;
      }
      .pm-dsl-tool-btn:hover {
        background: var(--pm-surface-2);
        border-color: var(--pm-primary);
        color: var(--pm-primary);
        transform: translateY(-1px);
      }
      .pm-dsl-tool-btn:active { 
        background: var(--pm-border); 
        transform: translateY(1px); 
      }
      .pm-dsl-tool-btn.ai {
        border-color: var(--pm-primary);
        color: var(--pm-primary);
        background: rgba(99, 102, 241, 0.05);
      }
      .pm-dsl-tool-btn.ai-primary {
        padding: 0 0.85rem;
        font-weight: 700;
        font-size: 0.82rem;
        background: var(--pm-primary, #6366f1);
        color: #fff;
        border-color: var(--pm-primary, #6366f1);
        gap: 4px;
        min-width: unset;
        width: auto;
        letter-spacing: 0.01em;
      }
      .pm-dsl-tool-btn.ai-primary:hover {
        background: var(--pm-primary-dark, #4f46e5);
        border-color: var(--pm-primary-dark, #4f46e5);
        color: #fff;
        transform: translateY(-1px);
      }
      .pm-dsl-tool-btn.ai-primary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      
      .pm-dsl-tool-symbol {
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-weight: 800;
        letter-spacing: -0.5px;
      }
      
      .pm-dsl-divider {
        width: 1px;
        background: var(--pm-border);
        margin: 4px 2px;
        height: 20px;
      }


    `,document.head.appendChild(e)}let d=new Map(u.map(e=>[e.token,e]));e.querySelectorAll(`.pm-dsl-tool-btn[data-token]`).forEach(e=>{e.onclick=()=>{let n=d.get(e.dataset.token);n&&(e.style.transform=`scale(0.9)`,setTimeout(()=>{e.style.transform=``},100),t(n.text,n.offset,n.triggerAC))}});async function f(){let e=i?i():``;if(e.trim()&&o)try{o(e)}catch(e){alert(`Error al generar informe: `+e.message)}}async function p(){let e=i?i():``;if(e.trim()&&s)try{s(e)}catch(e){alert(`Error al estructurar con IA: `+e.message)}}e.querySelector(`#btn-generar-informe`).onclick=f,e.querySelector(`#btn-ia-magic`).onclick=p;let m=e.querySelector(`#btn-analizar-progreso`);m&&(m.onclick=async()=>{let e=i?i():``;if(e.trim()&&c){m.disabled=!0,m.textContent=`⏳ Analizando...`;try{await c(e)}catch{}finally{m.disabled=!1,m.textContent=`✨ Analizar con IA`}}});let h=e.querySelector(`#pm-snippet-popup`);function g(n=``){let r=gn(n);if(r.length===0){h.style.display=`none`;return}h.innerHTML=r.map(e=>`
      <div class="pm-snippet-item" data-trigger="${e.trigger}">
        <span class="pm-snippet-icon">${e.icon}</span>
        <span class="pm-snippet-label">/${e.trigger}</span>
        <span class="pm-snippet-preview">${e.label}</span>
      </div>
    `).join(``);let i=e.getBoundingClientRect(),a=i.top;h.style.position=`fixed`,h.style.left=`${i.left}px`,h.style.width=`${i.width}px`,a>220?(h.style.top=`auto`,h.style.bottom=`${window.innerHeight-i.top+8}px`,h.style.transformOrigin=`bottom left`):(h.style.bottom=`auto`,h.style.top=`${i.bottom+8}px`,h.style.transformOrigin=`top left`),h.style.display=`block`,h.querySelectorAll(`.pm-snippet-item`).forEach(e=>{e.onclick=()=>{t(_n(e.dataset.trigger)+` `),_()}})}function _(){h.style.display=`none`}if(!document.getElementById(`pm-snippet-styles`)){let e=document.createElement(`style`);e.id=`pm-snippet-styles`,e.textContent=`
      .snippet-btn { font-size: 1rem; font-weight: 800; }
      .snippet-icon { font-weight: 900; color: var(--pm-text-muted); }
      .pm-snippet-popup {
        position: fixed;
        left: 0;
        background: var(--pm-surface);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid var(--pm-border);
        border-radius: var(--pm-radius-md);
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        z-index: 2000;
        max-height: 250px;
        overflow-y: auto;
        min-width: 240px;
        animation: pm-pop-up 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      @keyframes pm-pop-up {
        from { opacity: 0; transform: translateY(10px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .pm-snippet-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        border-bottom: 1px solid var(--pm-border);
      }
      .pm-snippet-item:last-child { border-bottom: none; }
      .pm-snippet-item:hover { background: var(--pm-surface-2); }
      .pm-snippet-icon { font-size: 1rem; }
      .pm-snippet-label {
        font-family: monospace;
        font-weight: 600;
        color: var(--pm-primary);
      }
      .pm-snippet-preview {
        font-size: 0.8rem;
        color: var(--pm-text-muted);
      }
    `,document.head.appendChild(e)}e.querySelector(`#btn-snippets`).onclick=()=>{h.style.display===`block`?_():g()};let v=vn(e);return e.querySelector(`#btn-help`).onclick=()=>{v.open()},{setContext(e={}){e.presentes!==void 0&&(l.presentes=e.presentes),e.indicadorActivo!==void 0&&(l.indicadorActivo=e.indicadorActivo),e.indicadoresDisponibles!==void 0&&(l.indicadoresDisponibles=e.indicadoresDisponibles)}}}function bn(e,t){let n=e.querySelector(`#pm-dsl-toolbar-container`),r=e.querySelector(`#pm-dsl-editor-container`),i=null,a=mn(r,{initialContent:t.initialContent||``,onChange:e=>{t.onEditorChange?.(e)}});a.setContext({claseId:t.claseId});function o(e){i=yn(n,{onInsert:(e,t,n)=>a.insertText(e,t,n),getEditorContent:()=>a.getValue(),onLoading:()=>{},onIaProposal:t=>e.onIaProposal?.(t),onImproveClick:t=>e.onImproveClick?.(t),onStructureClick:t=>e.onStructureClick?.(t),onAnalyzeClick:t=>e.onAnalyzeClick?.(t)})}function s(){i&&i.destroy(),a.destroy()}return{getEditor:()=>a,getToolbar:()=>i,getValue:()=>a.getValue(),setValue:e=>a.setValue(e),setContext:e=>a.setContext(e),initToolbar:o,destroy:s}}function xn(e,{onMarkAll:t}){if(!t)return{destroy(){}};let n=e.querySelector(`#btn-bulk-p`),r=e.querySelector(`#btn-bulk-a`),i=[];function a(e,t,n){e&&(e.addEventListener(t,n),i.push(()=>e.removeEventListener(t,n)))}return a(n,`click`,e=>{e.preventDefault(),t(`P`)}),a(r,`click`,e=>{e.preventDefault(),t(`A`)}),{destroy(){i.forEach(e=>{try{e()}catch{}}),i.length=0}}}function Sn({saveFn:e,debounceMs:t=3e4}){let n=null,r=[];function i(i){n!==null&&(clearTimeout(n),n=null),!(!i||!i.trim())&&(n=setTimeout(async()=>{n=null,await e(i),r.forEach(e=>e(i))},t))}function a(){n!==null&&(clearTimeout(n),n=null)}function o(e){r.push(e)}return{onInput:i,destroy:a,onSaved:o}}async function Cn(e,t,n){let{data:r,error:i}=await d.from(`observaciones_sesion`).select(`id`).eq(`sesion_id`,e).eq(`maestro_id`,t).eq(`es_borrador`,!0).limit(1).maybeSingle();if(i)throw i;if(r){let{data:e,error:t}=await d.from(`observaciones_sesion`).update({contenido_raw:n}).eq(`id`,r.id).select().single();if(t)throw t;return e}else{let{data:r,error:i}=await d.from(`observaciones_sesion`).insert({sesion_id:e,maestro_id:t,contenido_raw:n,es_borrador:!0}).select().single();if(i)throw i;return r}}async function wn(e,t){let{data:n,error:r}=await d.from(`observaciones_sesion`).select(`id, contenido_raw, updated_at`).eq(`sesion_id`,e).eq(`maestro_id`,t).eq(`es_borrador`,!0).limit(1).maybeSingle();if(r)throw r;return n??null}async function Tn(e){let{error:t}=await d.from(`observaciones_sesion`).delete().eq(`id`,e);if(t)throw t}async function En(e,t,n,r,a=null,o=null){try{let{error:i}=await d.from(`observaciones_sesion`).delete().eq(`sesion_id`,e).eq(`maestro_id`,t).eq(`es_borrador`,!0);if(i)throw i;let{data:s,error:c}=await d.from(`observaciones_sesion`).insert({sesion_id:e,maestro_id:t,contenido_raw:n,contenido_parsed:r,contenido_ia_dsl:a,contenido_ia_mejorado:o,es_borrador:!1}).select().single();if(c)throw c;return s}catch(s){if(!navigator.onLine||s.message?.includes(`Failed to fetch`))return console.warn(`[autoDraftService] Offline, encolando saveObservation...`),await i({tabla:`observaciones_sesion`,operacion:`upsert`,payload:{sesion_id:e,maestro_id:t,contenido_raw:n,contenido_parsed:r,contenido_ia_dsl:a,contenido_ia_mejorado:o,es_borrador:!1}}),{_offline:!0,sesion_id:e};throw s}}function Dn(e,{sesionId:t,maestroId:n,editor:r,sesionExistenteData:i,onDraftRecovered:a}){if(!t)return{destroy(){}};let o=null,s=!1,c=e.querySelector(`#pm-draft-indicator`);o=Sn({saveFn:async e=>{!t||s||await Cn(t,n,e)},debounceMs:3e4}),o.onSaved(()=>{if(s||!c)return;let e=new Date,t=String(e.getHours()).padStart(2,`0`),n=String(e.getMinutes()).padStart(2,`0`);c.textContent=`Borrador guardado ${t}:${n}`,c.style.display=``});let l=e.querySelector(`#pm-dsl-editable`);if(l){let e=l.oninput;l.oninput=function(t){e&&e.call(this,t),o&&!s&&o.onInput(r.getValue())}}return i?.borrador===!0&&wn(t,n).then(e=>{if(!s&&e&&e.contenido_raw&&e.contenido_raw.trim()){let t=e.updated_at?new Date(e.updated_at).toLocaleString(`es-AR`):``;confirm(`Hay un borrador guardado${t?` (${t})`:``}.\n\n¿Deseas recuperarlo?`)?a&&a(e.contenido_raw):Tn(e.id).catch(e=>console.warn(`[autoDraft] Error discarding:`,e))}}).catch(e=>console.warn(`[autoDraft] Error loading draft:`,e)),{destroy(){s=!0,o&&o.destroy()}}}function On(e,{onSave:t,onCancel:n,onDelete:r}){let i=document.getElementById(`pm-justif-modal`);if(!i&&(i=document.createElement(`div`),i.id=`pm-justif-modal`,i.className=`pm-justif-modal-overlay`,i.innerHTML=`
      <div class="pm-justif-backdrop"></div>
      <div class="pm-justif-modal">
        <div class="pm-justif-header">
          <div class="pm-justif-header-content">
            <div class="pm-justif-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            </div>
            <div>
              <h2 class="pm-justif-title" id="pm-justif-title">Justificar Inasistencia</h2>
              <p class="pm-justif-subtitle" id="pm-justif-subtitle">Registra el motivo de la ausencia</p>
            </div>
          </div>
          <button class="pm-justif-close" id="pm-justif-close" aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="pm-justif-body">
          <p id="pm-justif-alumno-nombre" class="pm-justif-alumno"></p>
          
          <div class="pm-justif-field">
            <label for="pm-justif-motivo">Motivo de la ausencia *</label>
            <textarea id="pm-justif-motivo" rows="3" 
              placeholder="Ej: Certificado médico, cita médica, viaje familiar, motivo personal..."></textarea>
            <span class="pm-justif-hint">Describe el motivo de la inasistencia</span>
          </div>
          
          <div class="pm-justif-field">
            <label>Evidencia (Opcional)</label>
            <div class="pm-justif-file-area" id="pm-justif-file-area">
              <input type="file" id="pm-justif-file" class="pm-justif-file-input" accept="image/*" capture="environment" />
              <div class="pm-justif-file-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <span>Adjuntar foto del justificante</span>
              </div>
              <div class="pm-justif-file-preview" id="pm-justif-file-preview" style="display:none;">
                <img id="pm-justif-preview-img" src="" alt="Vista previa" />
                <button class="pm-justif-remove-file" id="pm-justif-remove-file" type="button">×</button>
              </div>
            </div>
            <span class="pm-justif-hint">Ej: foto del certificado médico</span>
          </div>
        </div>
        
        <div class="pm-justif-footer">
          <button class="pm-justif-delete" id="pm-justif-delete" style="display:none;" title="Eliminar justificación">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            Eliminar
          </button>
          <button class="pm-justif-cancel" id="pm-justif-cancel">Cancelar</button>
          <button class="pm-justif-save" id="pm-justif-save">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <span id="pm-justif-btn-text">Guardar Justificación</span>
          </button>
        </div>
      </div>
    `,document.body.appendChild(i),!document.getElementById(`pm-justif-styles`))){let e=document.createElement(`style`);e.id=`pm-justif-styles`,e.textContent=`
        .pm-justif-modal-overlay {
          position: fixed;
          inset: 0;
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .pm-justif-modal-overlay.open {
          display: flex;
          opacity: 1;
        }
        .pm-justif-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
        }
        .pm-justif-modal {
          position: relative;
          background: var(--pm-surface);
          border-radius: 16px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform: scale(0.95) translateY(10px);
          transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .pm-justif-modal-overlay.open .pm-justif-modal {
          transform: scale(1) translateY(0);
        }
        .pm-justif-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 1.25rem 1.25rem 0.75rem;
          background: var(--pm-surface-2);
          border-bottom: 1px solid var(--pm-border);
        }
        .pm-justif-header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .pm-justif-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--pm-warning) 0%, #d97706 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .pm-justif-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--pm-text);
          margin: 0;
        }
        .pm-justif-subtitle {
          font-size: 0.75rem;
          color: var(--pm-text-muted);
          margin: 0.2rem 0 0;
        }
        .pm-justif-close {
          width: 32px;
          height: 32px;
          border: none;
          background: var(--pm-surface-2);
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--pm-text-muted);
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        .pm-justif-close:hover {
          background: var(--pm-border);
          color: var(--pm-text);
        }
        .pm-justif-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
        }
        .pm-justif-alumno {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--pm-primary);
          margin: 0 0 1rem;
          padding: 0.5rem 0.75rem;
          background: rgba(59, 130, 246, 0.08);
          border-radius: 8px;
          border-left: 3px solid var(--pm-primary);
        }
        .pm-justif-field {
          margin-bottom: 1rem;
        }
        .pm-justif-field:last-child {
          margin-bottom: 0;
        }
        .pm-justif-field label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--pm-text);
          margin-bottom: 0.35rem;
        }
        .pm-justif-field textarea {
          width: 100%;
          background: var(--pm-surface);
          border: 1px solid var(--pm-border);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: var(--pm-text);
          font-family: inherit;
          line-height: 1.5;
          resize: vertical;
          min-height: 70px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .pm-justif-field textarea:focus {
          outline: none;
          border-color: var(--pm-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .pm-justif-hint {
          display: block;
          font-size: 0.7rem;
          color: var(--pm-text-muted);
          margin-top: 0.25rem;
        }
        .pm-justif-file-area {
          position: relative;
          border: 2px dashed var(--pm-border);
          border-radius: 10px;
          padding: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pm-justif-file-area:hover {
          border-color: var(--pm-primary);
          background: rgba(59, 130, 246, 0.05);
        }
        .pm-justif-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }
        .pm-justif-file-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--pm-text-muted);
        }
        .pm-justif-file-placeholder svg {
          opacity: 0.5;
        }
        .pm-justif-file-placeholder span {
          font-size: 0.8rem;
        }
        .pm-justif-file-preview {
          position: relative;
        }
        .pm-justif-file-preview img {
          max-width: 100%;
          max-height: 120px;
          border-radius: 8px;
          object-fit: cover;
        }
        .pm-justif-remove-file {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: var(--pm-danger);
          color: white;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pm-justif-delete {
          margin-right: auto;
          background: transparent;
          border: 1px solid var(--pm-danger);
          border-radius: 8px;
          padding: 0.5rem 0.9rem;
          font-size: 0.825rem;
          font-weight: 500;
          color: var(--pm-danger);
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .pm-justif-delete:hover {
          background: var(--pm-danger);
          color: white;
        }
        .pm-justif-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--pm-border);
          background: var(--pm-surface-2);
        }
        .pm-justif-cancel {
          background: var(--pm-surface);
          border: 1px solid var(--pm-border);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--pm-text);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pm-justif-cancel:hover {
          background: var(--pm-border);
        }
        .pm-justif-save {
          background: linear-gradient(135deg, var(--pm-warning) 0%, #d97706 100%);
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(234, 179, 8, 0.3);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .pm-justif-save:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(234, 179, 8, 0.4);
        }
        @media (max-width: 480px) {
          .pm-justif-modal {
            max-width: 100%;
          }
        }
      `,document.head.appendChild(e)}let o=null,s=null,c=null,l=null,u=!1,d=null,f=null,p=i.querySelector(`#pm-justif-title`),m=i.querySelector(`#pm-justif-subtitle`),h=i.querySelector(`#pm-justif-btn-text`),g=i.querySelector(`#pm-justif-alumno-nombre`),_=i.querySelector(`#pm-justif-motivo`),v=i.querySelector(`#pm-justif-file`),y=i.querySelector(`.pm-justif-file-placeholder`),b=i.querySelector(`.pm-justif-file-preview`),x=i.querySelector(`#pm-justif-preview-img`),S=i.querySelector(`#pm-justif-remove-file`),C=i.querySelector(`#pm-justif-delete`);function w(e,t=null,n=null){o=e,s=t,c=null,l=null,u=!!t,d=n,u?(p.textContent=`Editar Justificación`,m.textContent=`Modifica el motivo de la inasistencia`,h.textContent=`Actualizar`,C.style.display=`flex`):(p.textContent=`Justificar Inasistencia`,m.textContent=`Registra el motivo de la ausencia`,h.textContent=`Guardar Justificación`,C.style.display=`none`),g.textContent=e.nombre_completo,_.value=t?.motivo||``;let r=t?.evidencia_url||t?.evidencia_base64;r?(l=r,x.src=r,y.style.display=`none`,b.style.display=`block`):(l=null,y.style.display=`flex`,b.style.display=`none`),v.value=``,i.classList.add(`open`),_.focus();let S=i.querySelector(`.pm-justif-modal`);S&&(f&&f.dispose(),f=a(S,{onClose:()=>T(!0)}))}function T(e=!1){e&&n&&o&&d!==null&&n(o.id,d),i.classList.remove(`open`),o=null,s=null,c=null,l=null,d=null,f&&=(f.dispose(),null)}i.querySelector(`#pm-justif-close`).onclick=()=>T(!0),i.querySelector(`#pm-justif-cancel`).onclick=()=>T(!0),C.onclick=()=>{o&&confirm(`¿Eliminar la justificación de ${o.nombre_completo}?`)&&(r&&r({alumnoId:o.id,justificacionId:s?.id,existingUrl:s?.evidencia_url||s?.evidencia_base64}),T(!1))},i.querySelector(`.pm-justif-backdrop`).onclick=()=>T(!0),v.onchange=e=>{let t=e.target.files[0];t&&(c=t,l=URL.createObjectURL(t),x.src=l,y.style.display=`none`,b.style.display=`block`)},S.onclick=()=>{l&&!(s?.evidencia_url||s?.evidencia_base64)&&URL.revokeObjectURL(l),c=null,l=null,v.value=``,y.style.display=`flex`,b.style.display=`none`},i.querySelector(`#pm-justif-save`).onclick=()=>{let e=_.value.trim();if(!e){_.focus(),_.style.borderColor=`var(--pm-danger)`,setTimeout(()=>{_.style.borderColor=``},2e3);return}t&&o&&t({alumnoId:o.id,motivo:e,evidenciaFile:c,evidenciaPreview:l,justificacionId:s?.id||null,existingUrl:s?.evidencia_url||s?.evidencia_base64||null,isEdit:u})};let E=e=>{e.key===`Escape`&&(T(),document.removeEventListener(`keydown`,E))};return document.addEventListener(`keydown`,E),{open:w,close:T}}function kn(e,{sesionId:t,claseId:n,fechaHoy:r,maestroId:i,supabase:a,guardarJustificacion:o,eliminarJustificacion:s,onJustifDeleted:c,onJustifSaved:l,onJustifCancelled:u,onRenderLista:d,onUpdateProgress:f,onAutoSave:p,onAnnounce:m}){let h=!1,g=On(document.body,{onDelete:async({alumnoId:e,justificacionId:t,existingUrl:n})=>{if(!h){if(n){let e=n.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);e&&a.storage.from(`documentos`).remove([e[1]]).catch(()=>{})}t&&s(t).catch(console.warn),c&&c(e),d(e),f();try{await p(!0)}catch(e){console.warn(`[justif] autoSave error:`,e)}m&&m(`Justificación eliminada.`)}},onSave:async({alumnoId:e,motivo:s,evidenciaFile:c,justificacionId:u,existingUrl:d,isEdit:f})=>{if(h)return;let m=document.getElementById(`pm-justif-save`);m&&(m.disabled=!0);try{let m=null;if(f&&u){let e=d;if(c){if(d){let e=d.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);e&&await a.storage.from(`documentos`).remove([e[1]]).catch(()=>{})}let t=c.name.split(`.`).pop(),n=`justificaciones/${Date.now()}_${Math.random().toString(36).slice(2)}.${t}`,{data:r}=await a.storage.from(`documentos`).upload(n,c).catch(()=>({data:null}));if(r){let{data:t}=a.storage.from(`documentos`).getPublicUrl(r.path);e=t.publicUrl}}let{data:t,error:n}=await a.from(`justificaciones`).update({motivo:s,evidencia_url:e}).eq(`id`,u).select().single();if(n)throw n;m=t}else{t||await p(!0,!1);let a=await o({sesionId:t,alumnoId:e,claseId:n,fecha:r,motivo:s,creadoPor:i},c);if(a.error)throw a.error;m=a.data}m&&l&&l(e,m),h||g.close()}catch(e){console.error(`[justificacion] Error guardando:`,e),alert(`Error al guardar la justificación: `+e.message)}finally{m&&(m.disabled=!1)}},onCancel:(e,t)=>{h||(u&&u(e,t),d(e),f())}});return{open(e,t,n){h||g.open(e,t,n)},close(){if(!h)try{g.close()}catch{}},destroy(){h=!0;try{g.close()}catch{}}}}function An(e,{alumnos:t,estado:n,rutaId:r,canOpenProgressPanel:i=!!r,sesionId:a,fechaHoy:o,snapshots:s,justificaciones:c,obtenerJustificacion:l,onEstadoChange:u,onOpenProgressPanel:d,onOpenEvaluationDrawer:f,onOpenJustifModal:p,onAutoSave:h,onAnnounce:g,onUpdateSnapshots:_}){let v=e.querySelector(`#pm-alumnos-list`);if(!v)return{destroy(){},render(){}};let y=null;function b(e,t){return[...e].sort((e,n)=>{let r=t[e.id]!==null,i=t[n.id]!==null;return!r&&i?-1:r&&!i?1:0})}function x(e=null){let r=b(t,n),i=null;if(e){let t=v.querySelector(`[data-id="${e}"]`);t&&(i=t.getBoundingClientRect())}if(v.innerHTML=r.map(e=>S(e,n[e.id])).join(``),e&&i){let t=v.querySelector(`[data-id="${e}"]`),n=t.getBoundingClientRect(),r=i.top-n.top;t.animate([{transform:`translateY(${r}px)`,opacity:.7},{transform:`translateY(0)`,opacity:1}],{duration:300,easing:`cubic-bezier(0.4, 0, 0.2, 1)`})}}function S(e,t){return`
      <div class="pm-asist-item ${t?`estado-${t.toLowerCase()}`:``}" data-id="${e.id}">
        <div class="pm-asist-avatar">${e.nombre_completo[0]}</div>
        <div class="pm-asist-info">
          <span class="pm-asist-nombre">${R(e.nombre_completo)}</span>
          <span class="pm-asist-instrumento">${R(e.instrumento_principal||`—`)}</span>
        </div>
        <div class="pm-asist-btns">
          <button class="pm-asist-btn ${t===`P`?`active-p`:``}" data-action="P" data-id="${e.id}">P</button>
          <button class="pm-asist-btn ${t===`J`?`active-j`:``}" data-action="J" data-id="${e.id}">J</button>
          <button class="pm-asist-btn ${t===`A`?`active-a`:``}" data-action="A" data-id="${e.id}">A</button>
        </div>
    </div>
    `}return v.onclick=async e=>{let r=e.target.closest(`.pm-asist-btn`),v=e.target.closest(`.pm-asist-nombre`);if(v){let e=v.closest(`.pm-asist-item`).dataset.id,n=t.find(t=>t.id===e);if(!n)return;if(i){y&&y.destroy(),d&&d(n);return}let r=s.filter(t=>t.student_id===e);if(r.length===0)try{let{academicService:t}=await m(async()=>{let{academicService:e}=await import(`./academicService-or-p50Yc.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([2,1,3,4])),n=await t.createSnapshotForStudent(a,e,o);n&&(r=n,_&&_(n))}catch(e){console.error(`Error creando snapshot on-demand:`,e)}f&&f(n,r);return}if(!r)return;let{id:b,action:S}=r.dataset;if(window.navigator.vibrate&&window.navigator.vibrate(10),S===`J`){let e=t.find(e=>e.id===b);if(!e)return;if(n[b]===`J`){let t=c[b]||null;!t&&a&&l&&(t=await l(a,b)),p&&p(e,t,null),g&&g(`Editando justificación de ${e.nombre_completo}.`)}else u&&u(b,`J`),x(b),h&&await h(!0),p&&p(e,null,null),g&&g(`Justificación marcada para ${e.nombre_completo}.`);return}if(u&&u(b,n[b]===S?null:S),x(b),g){let e=Object.values(n).filter(e=>e===`P`).length,t=Object.values(n).filter(e=>e===`A`).length,r=Object.values(n).filter(e=>e===`J`).length;g(`Asistencia actualizada. ${e} presentes, ${t} ausentes, ${r} justificados.`)}h&&await h(!0)},{render(e){x(e)},destroy(){v.onclick=null,y&&=(y.destroy(),null)}}}async function jn(e,t,n,r,a=`Clase`,o=null){if(!r||r.length===0)return{success:!0};let s=r;if(o&&o.length>0){let e=new Set(o.map(e=>e.id)),t=r.length;s=r.filter(t=>e.has(t.alumno_id)),s.length<t&&console.warn(`[Promotion] promocionarObservacionesAlumnos: filtrados ${t-s.length} evaluaciones de alumnos ausentes`)}let c=s.filter(e=>e.observacion&&e.observacion.trim().length>0);if(c.length===0)return{success:!0};let l=c.map(r=>new b({alumno_id:r.alumno_id,maestro_id:n,clase_id:t,sesion_clase_id:e,tipo:`academico`,titulo:`Evaluación SOI: ${a}`,descripcion:r.observacion,prioridad:`media`,estado:`abierta`,fecha_observacion:new Date().toISOString().split(`T`)[0]}).toJSON());try{let{data:e,error:t}=await d.from(`observaciones_alumnos`).upsert(l,{onConflict:`sesion_clase_id,alumno_id`});if(t)throw t;return{success:!0,data:e}}catch(e){if(!navigator.onLine||e.message?.includes(`Failed to fetch`)){console.warn(`[Promotion] Offline, encolando promoción de observaciones...`);for(let e of l)await i({tabla:`observaciones_alumnos`,operacion:`upsert`,payload:e});return{success:!0,_offline:!0,count:l.length}}return console.error(`[Promotion] Error promoviendo observaciones:`,e),{success:!1,error:e.message}}}async function Mn(e,t){if(!e||!t)throw Error(`classEventId and status are required`);let{data:n,error:r}=await d.from(`class_events`).update({status:t,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(r)throw Error(`Error updating class event status: ${r.message}`);return n}var Nn={async getClasses(e=null){let t=d.from(`plan_clases`).select(`*`).eq(`activo`,!0);e&&(t=t.eq(`maestro_id`,e));let{data:n,error:r}=await t.order(`nombre`);return r?(console.error(`Error loading classes:`,r),[]):n},async resolveSmartPlan(e,t=null){let n=await this.getClasses(t||e.maestro_id);if(!n.length)return null;let r=n.find(t=>t.clase_id===e.id);if(r)return r;let i=(e.nombre||``).toLowerCase(),a=(e.instrumento||``).toLowerCase();return r=n.find(e=>(e.nombre||``).toLowerCase()===i),r||a&&(r=n.find(e=>(e.nombre||``).toLowerCase().includes(a)),r)?r:(r=n.find(e=>{let t=(e.nombre||``).toLowerCase();return i.includes(t)||t.includes(i)}),r||n[0])},async addClass(e,t=null,n=null){let r={nombre:e};t&&(r.maestro_id=t),n&&(r.clase_id=n);let{data:i,error:a}=await d.from(`plan_clases`).insert([r]).select().single();if(a)throw a;return i},async updateClass(e,t){let{error:n}=await d.from(`plan_clases`).update({nombre:t}).eq(`id`,e);if(n)throw n},async deleteClass(e){let{error:t}=await d.from(`plan_clases`).delete().eq(`id`,e);if(t)throw t},async getLevelsByClass(e){let{data:t,error:n}=await d.from(`plan_niveles`).select(`*`).eq(`clase_id`,e).order(`numero_nivel`,{ascending:!0});return n?(console.error(`Error loading levels:`,n),[]):t},async addLevel({clase_id:e,nombre:t,numero_nivel:n}){let{data:r,error:i}=await d.from(`plan_niveles`).insert([{clase_id:e,nombre:t,numero_nivel:n||1}]).select().single();if(i)throw i;return r},async updateLevel(e,t){let{error:n}=await d.from(`plan_niveles`).update(t).eq(`id`,e);if(n)throw n},async deleteLevel(e){let{error:t}=await d.from(`plan_niveles`).delete().eq(`id`,e);if(t)throw t},async getNodesByLevel(e){let{data:t,error:n}=await d.from(`plan_temas`).select(`*`).eq(`nivel_id`,e).order(`orden_index`);return n?(console.error(`Error loading topics:`,n),[]):t},async addNode({nivel_id:e,nombre:t,tipo:n}){let{data:r,error:i}=await d.from(`plan_temas`).insert([{nivel_id:e,nombre:t,tipo:n||`TECNICA`}]).select().single();if(i)throw i;return r},async updateNode(e,t){let{error:n}=await d.from(`plan_temas`).update(t).eq(`id`,e);if(n)throw n},async deleteNode(e){let{error:t}=await d.from(`plan_temas`).delete().eq(`id`,e);if(t)throw t},async getObjectivesByNode(e){let{data:t,error:n}=await d.from(`plan_objetivos`).select(`*`).eq(`tema_id`,e).order(`orden_index`);return n?(console.error(`Error loading objectives:`,n),[]):t},async addObjective({tema_id:e,nombre:t}){let{data:n,error:r}=await d.from(`plan_objetivos`).insert([{tema_id:e,nombre:t}]).select().single();if(r)throw r;return n},async updateObjective(e,t){let{error:n}=await d.from(`plan_objetivos`).update({nombre:t}).eq(`id`,e);if(n)throw n},async deleteObjective(e){let{error:t}=await d.from(`plan_objetivos`).delete().eq(`id`,e);if(t)throw t},async getIndicatorsByObjective(e){let{data:t,error:n}=await d.from(`plan_indicadores`).select(`*`).eq(`objetivo_id`,e).order(`orden_index`);return n?(console.error(`Error loading indicators:`,n),[]):t},async addIndicator({objetivo_id:e,descripcion:t,es_requerido:n}){let{data:r,error:i}=await d.from(`plan_indicadores`).insert([{objetivo_id:e,descripcion:t,es_requerido:n??!0}]).select().single();if(i)throw i;return r},async updateIndicator(e,t){let{error:n}=await d.from(`plan_indicadores`).update(t).eq(`id`,e);if(n)throw n},async deleteIndicator(e){let{error:t}=await d.from(`plan_indicadores`).delete().eq(`id`,e);if(t)throw t},async updateIndicatorCalificacion(e,t){let{error:n}=await d.from(`plan_indicadores`).update({calificacion:t}).eq(`id`,e);if(n)throw n},async getRouteHierarchy(e,t=null){let n=e;if(!n){let e=await this.getClasses(t);if(e.length>0)n=e[0].id;else return null}let{data:r,error:i}=await d.from(`plan_niveles`).select(`
        *,
        plan_temas (
          *,
          plan_objetivos (
            *,
            plan_indicadores (*)
          )
        )
      `).eq(`clase_id`,n).order(`numero_nivel`);return i?(console.error(`Error loading hierarchy:`,i),null):r},async importStructure(e,t){if(!e||!t)throw Error(`Faltan datos para la importación.`);console.log(`[Adapter] Iniciando importación masiva optimizada (4 niveles) para clase: ${e}`);for(let n of t.niveles||[]){let{data:t,error:r}=await d.from(`plan_niveles`).insert([{clase_id:e,nombre:n.nombre,numero_nivel:n.numero_nivel||1,objetivo_general:n.objetivo_general}]).select().single();if(r)throw r;let i=(n.temas||[]).map(e=>({nivel_id:t.id,nombre:e.nombre,tipo:e.tipo||`TECNICA`,es_critico:e.es_critico||!1,_originalRef:e}));if(!i.length)continue;let{data:a,error:o}=await d.from(`plan_temas`).insert(i.map(({_originalRef:e,...t})=>t)).select();if(o)throw o;for(let e=0;e<a.length;e++){let t=a[e],n=i[e]._originalRef.objetivos||[];if(!n.length)continue;let r=n.map(e=>({tema_id:t.id,nombre:e.nombre||e,_originalRef:e})),{data:o,error:s}=await d.from(`plan_objetivos`).insert(r.map(({_originalRef:e,...t})=>t)).select();if(s)throw s;let c=[];if(o.forEach((e,t)=>{let n=r[t]._originalRef;n.indicadores&&n.indicadores.length>0&&n.indicadores.forEach(t=>{c.push({objetivo_id:e.id,descripcion:t.descripcion,es_requerido:t.es_requerido??!0})})}),c.length>0){let{error:e}=await d.from(`plan_indicadores`).insert(c);if(e)throw e}}}return console.log(`[Adapter] Importación masiva (4 niveles) completada con éxito.`),!0}};function Pn(t,n){let r=t.querySelector(`#btn-guardar-obs`);return r?(n.rutaId&&(r.style.display=``),r.onclick=async()=>{let i=n.getEditorValue();if(!i||!i.trim()){e.warning(`El editor está vacío. Escribe observaciones antes de guardar.`);return}if(!n.sesionId){e.warning(`Primero guarda la sesión (asistencia) para poder registrar observaciones.`);return}let a=null,o=await In(i,n),s=n.planificationCard?.getActiveIndicador();if(a=o||s,!a){e.warning(`Seleccione un indicador en la ruta antes de guardar la observación o escríbalo entre corchetes [Ejemplo].`);return}let c=t.querySelector(`#pm-active-tema-badge`);c&&a.nombre&&(c.textContent=a.nombre,c.style.display=`inline-block`),r.disabled=!0,r.textContent=`Procesando...`;try{let e=n.alumnos.filter(e=>n.estado[e.id]===`P`),o=await B(i,a.id,e,a.nombre);if(o.error)throw Error(o.error);if(o.modo===`natural`&&o.dslGenerado&&!confirm(`📝 Texto convertido a formato estructurado:

`+o.dslGenerado+`

¿Guardar la evaluación?`)){r.disabled=!1,r.textContent=`Guardar observación`;return}if(o.missing.length>0&&!confirm(`Faltan ${o.missing.length} alumno(s) sin evaluar:\n${o.missing.join(`, `)}\n\n¿Guardar de todas formas?`)){r.disabled=!1,r.textContent=`Guardar observación`;return}if(o.evaluaciones.length>0){let{error:t}=await ce(n.sesionId,a.id,o.evaluaciones,n.maestro.id,e);if(t)throw t}let s={indicador_id:a.id,evaluaciones:o.evaluaciones};await En(n.sesionId,n.maestro.id,i,s,o.dslGenerado||null,o.textoMejorado||null);let c=ae(i);if(c.estados&&c.estados.length>0){let e=n.alumnos.map(e=>({id:e.id,nombre:e.nombre_completo||e.nombre||``,nombreCorto:(e.nombre_completo||e.nombre||``).split(` `)[0]}));Ke({sesionId:n.sesionId,claseId:n.claseId,maestroId:n.maestro.id,fechaHoy:n.fechaHoy,dslText:i,alumnos:e}).then(({saved:e,errors:t})=>{t.length&&console.warn(`[Progress DSL] Errores:`,t),e.length&&ot(e,n.editorContainer)}).catch(e=>console.warn(`[Progress DSL] Error:`,e.message))}let l=await jn(n.sesionId,n.claseId,n.maestro.id,o.evaluaciones,n.claseNombre||`Clase`,e);if(l.success||console.warn(`[Fase C] Fallo parcial en promoción:`,l.error),n.planificationCard&&await n.planificationCard.refreshTree(),n.setEditorValue(``),n.onDslContentClear&&n.onDslContentClear(),Fn(o.evaluaciones.length,a.nombre),n.activeClassEventId){try{await Mn(n.activeClassEventId,`completed`)}catch(e){console.warn(`[asistencia] Error updating class event status:`,e)}if(n.activeLevel)try{let{academicService:t}=await m(async()=>{let{academicService:e}=await import(`./academicService-or-p50Yc.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([2,1,3,4]));for(let r of e){let e=await t.checkLevelCompletion(r.id,n.activeLevel);if(e&&e.status===`approved`){let{createLevelCompletionModal:e}=await m(async()=>{let{createLevelCompletionModal:e}=await import(`./LevelCompletionModal-BD2bYe3b.js`);return{createLevelCompletionModal:e}},__vite__mapDeps([5,3,6])),t=e({studentId:r.id,levelId:n.activeLevel});n.onAppendModal?.(t.el||t)}}}catch(e){console.warn(`[asistencia] Error checking level completion:`,e)}}if(o.evaluaciones.length>0&&n.claseId&&a?.nombre){let{error:e}=await We({sesionId:n.sesionId,claseId:n.claseId,maestroId:n.maestro.id,fechaHoy:n.fechaHoy,contenido:a.nombre,evaluaciones:o.evaluaciones});e&&console.warn(`[asistencia] Error al sincronizar progresos:`,e)}if(n.sesionId){let{academicService:e}=await m(async()=>{let{academicService:e}=await import(`./academicService-or-p50Yc.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([2,1,3,4])),r=await e.processSessionClosure(n.sesionId);if(r&&r.length>0){let{createAchievementsSummaryModal:e}=await m(async()=>{let{createAchievementsSummaryModal:e}=await import(`./AchievementsSummaryModal-CJ9jpoV7.js`);return{createAchievementsSummaryModal:e}},__vite__mapDeps([7,6]));await e(t,r)}}r.textContent=`¡Guardado!`,setTimeout(()=>{r.textContent=`Guardar observación`,r.disabled=!1},2e3)}catch(t){console.error(`[asistencia] Error saving observation:`,t),e.error(`Error al guardar: `+(t.message||t)),r.disabled=!1,r.textContent=`Guardar observación`}},{destroy(){}}):{destroy(){}}}function Fn(e,t){let n=document.createElement(`div`);n.innerHTML=`
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
      <span>✅ Observación guardada exitosamente (${e} eval.)</span>
      <span style="font-size:0.85em; opacity:0.9;">Tema detectado: <b>${t}</b></span>
    </div>`,n.style.cssText=`position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--pm-surface, #1e1e1e);color:#fff;padding:12px 24px;border-radius:12px;z-index:10000;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.3); border: 1px solid var(--apple-success, #22c55e);`,document.body.appendChild(n),setTimeout(()=>n.remove(),4500)}async function In(e,t){let n=t.planificationCard?.getActivePlanificacionId();if(!e||!n)return null;let r=e.match(/\[(.*?)\]/);if(!r||!r[1])return null;let i=r[1].trim().toLowerCase(),a=e=>{let t=[`se`,`hizo`,`la`,`el`,`los`,`las`,`un`,`una`,`de`,`del`,`en`,`con`,`por`,`para`,`y`,`o`,`tema`,`indicador`];return e.toLowerCase().replace(/[^\w\sáéíóúñ]/g,``).split(/\s+/).filter(e=>e.length>2&&!t.includes(e))},o=a(i);if(o.length===0)return null;try{let e=await Nn.getRouteHierarchy(n),t=null,r=0;for(let n of e)for(let e of n.plan_temas||[])for(let n of e.plan_objetivos||[]){let e=a(n.nombre),i=o.filter(t=>e.includes(t)).length;i>r&&(r=i,t=n)}return t}catch(e){return console.warn(`[asistencia] Error resolving indicador:`,e),null}}async function Ln(t,{onError:n,silent:r=!1}={}){try{return await t()}catch(t){return console.error(`[safeAsync]`,t),n?n(t):r||e!==void 0&&e&&e.error(`Error inesperado: `+(t.message||t)),null}}async function Rn(e,{sesionId:t,fecha:n,maestro:r,router:i}){try{let{data:a,error:o}=await d.from(`sesiones_clase`).select(`*`).eq(`id`,t).single();if(o||!a){e.innerHTML=`<p class="pm-empty">Sesión no encontrada.</p>`;return}let s=new Date,c=`${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,`0`)}-${String(s.getDate()).padStart(2,`0`)}`,l=n||a.fecha||c,u={id:t,nombre:a.actividad||`Clase Emergente`,instrumento:``};localStorage.setItem(`pm_active_clase_id`,t);let f=Array.isArray(a.asistencia)?a.asistencia:[],p=f.map(e=>e.alumno_id).filter(Boolean),m=[];if(p.length>0){let{data:e}=await d.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).in(`id`,p);m=e||[]}let h={},g={};m.forEach(e=>{h[e.id]=null}),f.forEach(e=>{e.estado&&m.some(t=>t.id===e.alumno_id)&&(h[e.alumno_id]=e.estado)});let _=Bn(e,{clase:u,horario:null,alumnos:m,estado:h,justificaciones:g,maestro:r,fechaHoy:l,claseId:null,sesionId:t,hasConflict:!1,serverDSL:a.contenido||``,snapshots:[],salonNombre:null,rutaId:null,sesionExistenteData:a,router:i});return typeof _==`function`?_:void 0}catch(t){console.error(`[asistenciaView] Error en sesión emergente:`,t.message,t.stack),e.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error: ${R(t.message)}</p>`}}async function zn(e,{claseId:t,fecha:n,sesionId:r,router:i}={}){let a=typeof e==`string`?document.getElementById(e):e;if(!a){console.error(`[asistenciaView] Container not found:`,e);return}a.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let u=f();if(!u){a.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}if(!t){if(r)return Rn(a,{sesionId:r,fecha:n,maestro:u,router:i});a.innerHTML=`<p class="pm-empty">No se indicó la clase.</p>`;return}localStorage.setItem(`pm_active_clase_id`,t);let p=new Date,m=`${p.getFullYear()}-${String(p.getMonth()+1).padStart(2,`0`)}-${String(p.getDate()).padStart(2,`0`)}`,h=n||m;try{let e=p.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),[n,r,f,m]=await Promise.all([s(),c([t]),l([t]),d.from(`sesiones_clase`).select(`*`).eq(`clase_id`,t).eq(`maestro_id`,u.id).eq(`fecha`,h).order(`borrador`,{ascending:!0}).order(`updated_at`,{ascending:!1})]),g=n.find(e=>e.id===t);if(!g){a.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Clase no encontrada.</p>`;return}let _=r.find(t=>t.dia?.toLowerCase()===e),v=(f||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>{let n=(e.instrumento_principal||``).localeCompare(t.instrumento_principal||``);return n===0?(e.nombre_completo||``).localeCompare(t.nombre_completo||``):n}),y=m.data||[],b=y[0]||null,x=(()=>{let e=new Map;for(let t of[...y].reverse())Array.isArray(t.asistencia)&&t.asistencia.forEach(t=>{t?.alumno_id&&e.set(t.alumno_id,t.estado)});return[...e.entries()].map(([e,t])=>({alumno_id:e,estado:t}))})(),S=Array.isArray(b?.asistencia)?b.asistencia.map(e=>e?.alumno_id).filter(Boolean):[];if(b?.tipo===`emergente`&&S.length>0){let e=new Set(S),t=new Set(v.map(e=>e.id)),n=S.filter(e=>!t.has(e));if(n.length>0)try{let{data:e}=await d.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).in(`id`,n);v=v.concat(e||[])}catch(e){console.warn(`[asistencia] No se pudieron cargar alumnos extra de clase emergente:`,e)}v=v.filter(t=>e.has(t.id))}let C=b?.id||null,w=b?.updated_at||null,T=b?.contenido||``,E=g.salon?[g.salon]:[],[D,O]=await Promise.all([C?d.from(`class_session_content_snapshots`).select(`*`).eq(`session_id`,C).then(e=>e.data||[]):Promise.resolve([]),E.length>0?o(E):Promise.resolve([])]),k=O.length>0?O[0].nombre:null,A=`pm_asistencia_${t||C}_${h}`,j=localStorage.getItem(`${A}_updated`),M=!1;w&&j&&new Date(w).getTime()>new Date(j).getTime()+5e3&&(M=!0);let ee=null;try{let e=n?.find(e=>e.id===t)?.instrumento;if(e){let t=e.split(`,`)[0].trim().toLowerCase(),{data:n}=await d.from(`routes`).select(`id, route_versions!inner(id)`).ilike(`instrument`,`%${t}%`).eq(`route_versions.status`,`published`).limit(1).maybeSingle();ee=n?.route_versions?.[0]?.id||n?.route_versions?.id||null}}catch(e){console.warn(`[asistencia] No se pudo resolver route_version_id:`,e)}let N={},te={};v.forEach(e=>{N[e.id]=null});let P=x,F={presente:`P`,ausente:`A`,justificado:`J`,tarde:`T`};if(P.length===0)try{let e=null,n=y.map(e=>e.id).filter(Boolean);if(n.length>0){let{data:t}=await d.from(`asistencias`).select(`alumno_id, estado`).in(`sesion_clase_id`,n);e=t}if((!e||e.length===0)&&t&&h){let{data:n}=await d.from(`asistencias`).select(`alumno_id, estado`).eq(`clase_id`,t).eq(`fecha`,h);e=n}e?.length>0&&(P=e.map(e=>({alumno_id:e.alumno_id,estado:F[e.estado]??e.estado})))}catch(e){console.warn(`[asistencia] No se pudo restaurar desde tabla asistencias:`,e)}P.forEach(e=>{if(Object.prototype.hasOwnProperty.call(N,e.alumno_id)){let t=F[e.estado]??e.estado;N[e.alumno_id]=t}});let I=[];if(C)try{I=await d.from(`justificaciones`).select(`alumno_id`).eq(`sesion_id`,C).then(e=>e.data||[]),I.forEach(e=>{Object.prototype.hasOwnProperty.call(N,e.alumno_id)&&(N[e.alumno_id]=`J`)})}catch(e){console.warn(`[asistencia] No se pudieron restaurar justificaciones:`,e)}Bn(a,{clase:g,horario:_,alumnos:v,estado:N,justificaciones:te,maestro:u,fechaHoy:h,claseId:t,sesionId:C,hasConflict:M,serverDSL:T,snapshots:D,salonNombre:k,rutaId:ee,sesionExistenteData:b,router:i})}catch(e){console.error(`[asistenciaView] Error fatal:`,e.message,e.stack),a.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error: ${R(e.message)}</p>`}}function Bn(t,a){let{clase:o,horario:s,alumnos:c,estado:l,justificaciones:f,maestro:p,fechaHoy:h,claseId:b,snapshots:S,serverDSL:C,hasConflict:w,salonNombre:T,rutaId:E,sesionExistenteData:D,router:O}=a,k=a.sesionId,A=!!a.sesionId&&(D?.borrador===!1||D?.estado===`registrada`||D?.estado===`cerrada`),j=e=>{if(O?.navigate){O.navigate(e);return}window.location.hash=`#/${e}`},M=[],N=`pm_asistencia_${b||k}_${h}`,I=C,L=null,R=Be(),z=null,ne=null;if(!document.getElementById(`pm-asist-badge-styles`)){let e=document.createElement(`style`);e.id=`pm-asist-badge-styles`,e.textContent=`
      .pm-badge { 
        display: inline-flex; align-items: center; justify-content: center;
        padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.7rem; font-weight: 700; 
        background: var(--pm-primary-light, rgba(59,130,246,0.15)); color: var(--pm-primary, #3b82f6);
        white-space: nowrap; border: 1px solid rgba(59,130,246,0.3);
      }
      .pm-badge-warning { background: rgba(245,158,11,0.15); color: #d97706; border-color: rgba(245,158,11,0.3); }
      .pm-badge-danger { background: rgba(239,68,68,0.15); color: #dc2626; border-color: rgba(239,68,68,0.3); }
      .pm-badge-muted { background: var(--pm-surface-2, #374151); color: #e5e7eb; border-color: rgba(255,255,255,0.2); }
      [data-theme="light"] .pm-badge-muted { background: #e5e7eb; color: #374151; border-color: #d1d5db; }
    `,document.head.appendChild(e)}t.innerHTML=`
    <style>
      .pm-asist-header { 
        display: flex; align-items: center; gap: 1rem;
        background: linear-gradient(135deg, var(--pm-primary), #1d4ed8); 
        color: white; 
        padding: 1.25rem 1.25rem 2.25rem 1.25rem; 
        border-bottom-left-radius: 28px; 
        border-bottom-right-radius: 28px;
        margin-bottom: 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        position: relative;
        z-index: 10;
        width: 100%;
      }
      .pm-asist-title { margin: 0; font-size: 1.2rem; font-weight: 800; letter-spacing: -0.02em; color: #fff; }
      .pm-asist-subtitle { margin: 4px 0 0; font-size: 0.75rem; opacity: 0.85; font-weight: 500; color: rgba(255, 255, 255, 0.9); }
      .pm-asist-bulk-circles { display: flex; gap: 0.75rem; align-items: center; }
      .pm-bulk-circle {
        width: 34px; height: 34px; border-radius: 50%; border: 2px solid currentColor;
        display: flex; align-items: center; justify-content: center;
        font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        background: rgba(255, 255, 255, 0.1);
      }
      .pm-bulk-circle.p { color: #4ade80; border-color: rgba(74, 222, 128, 0.4); }
      .pm-bulk-circle.a { color: #f87171; border-color: rgba(248, 113, 113, 0.4); }
      .pm-bulk-circle:hover { transform: scale(1.1); background: currentColor; color: var(--pm-surface-2); }
      .pm-asist-nombre { cursor: pointer; text-decoration: underline dotted; text-underline-offset: 3px; }
      .pm-asist-nombre:hover { color: var(--pm-primary); }
      .pm-copy-plan-btn {
        display: inline-flex; align-items: center; gap: 0.35rem;
        padding: 0.35rem 0.75rem; border-radius: 20px;
        border: 1px solid var(--pm-border, rgba(255,255,255,0.15));
        background: var(--pm-surface-2, #374151); color: var(--pm-text-muted, #9ca3af);
        font-size: 0.7rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
      }
      .pm-copy-plan-btn:hover { background: var(--pm-primary); color: #fff; border-color: var(--pm-primary); }
      [data-theme="light"] .pm-copy-plan-btn { background: #f3f4f6; color: #6b7280; border-color: #d1d5db; }
      [data-theme="light"] .pm-copy-plan-btn:hover { background: var(--pm-primary); color: #fff; border-color: var(--pm-primary); }
      .pm-route-selector-wrap {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        background: var(--pm-surface-2, #374151);
        border: 1px solid var(--pm-border, rgba(255,255,255,0.15));
        border-radius: 12px;
        margin: 0 1rem 1rem;
      }
      /* Contenedor de la lista para dar aire lateral */
      .pm-asist-alumnos-container {
        padding: 0 1rem 2rem;
      }
      .pm-route-selector-label {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--pm-text-muted, #9ca3af);
        white-space: nowrap;
      }
      .pm-route-selector {
        flex: 1;
        padding: 0.35rem 0.75rem;
        border-radius: 20px;
        border: 1px solid var(--pm-border, rgba(255,255,255,0.2));
        background: var(--pm-surface, #2d3748);
        color: var(--pm-text, #e5e7eb);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        appearance: none;
        -webkit-appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 16 16'%3E%3Cpath fill='%239ca3af' d='M4 6l4 4 4-4'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        padding-right: 2rem;
      }
      .pm-route-selector:focus {
        outline: none;
        border-color: var(--pm-primary, #007aff);
        box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
      }
      [data-theme="light"] .pm-route-selector-wrap { background: #f9fafb; border-color: #e5e7eb; }
      [data-theme="light"] .pm-route-selector { background: #fff; color: #374151; border-color: #d1d5db; }
      [data-theme="light"] .pm-route-selector-label { color: #6b7280; }

      /* ── Planificacion Card Premium (Glassmorphism) ── */
      .pm-planificacion-card {
        background: rgba(var(--pm-surface-rgb, 30, 41, 59), 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        margin: 1rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        overflow: hidden;
      }
      .pm-planificacion-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .pm-planificacion-header:hover { background: rgba(255, 255, 255, 0.05); }
      .pm-planificacion-header-left { display: flex; align-items: center; gap: 1rem; }
      .pm-planificacion-icon-box {
        width: 42px; height: 42px; background: linear-gradient(135deg, var(--pm-primary), #60a5fa);
        border-radius: 12px; display: flex; align-items: center; justify-content: center;
        font-size: 1.4rem; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }
      .pm-planificacion-info { display: flex; flex-direction: column; }
      .pm-planificacion-label { font-size: 0.65rem; font-weight: 800; color: var(--pm-primary); text-transform: uppercase; letter-spacing: 1px; }
      .pm-planificacion-nombre { font-size: 1.1rem; font-weight: 700; color: #fff; margin-top: 2px; }
      
      .pm-planificacion-actions { display: flex; align-items: center; gap: 0.75rem; }
      .pm-btn-circle {
        width: 36px; height: 36px; border-radius: 50%; background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; display: flex;
        align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
      }
      .pm-btn-circle:hover { background: var(--pm-primary); border-color: var(--pm-primary); transform: rotate(45deg); }
      
      .pm-planificacion-dropdown {
        padding: 0 1.5rem 1.5rem;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
      }
      .pm-planificacion-tabs-pill {
        display: flex; background: rgba(0, 0, 0, 0.2); padding: 4px;
        border-radius: 30px; margin: 1.5rem 0; border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .pm-plan-tab-pill {
        flex: 1; padding: 0.6rem; border: none; background: none; color: var(--pm-text-muted);
        font-size: 0.8rem; font-weight: 700; cursor: pointer; border-radius: 25px; transition: all 0.3s;
      }
      .pm-plan-tab-pill.active { background: var(--pm-primary); color: #fff; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); }
      
      .pm-plan-list { max-height: 250px; overflow-y: auto; padding-right: 5px; }
      .pm-plan-item {
        display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem;
        border-radius: 12px; margin-bottom: 0.5rem; background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.05); cursor: pointer; transition: all 0.2s;
      }
      .pm-plan-item:hover { background: rgba(255, 255, 255, 0.08); transform: translateX(5px); }
      .pm-plan-item.active { border-color: var(--pm-primary); background: rgba(59, 130, 246, 0.1); }
      .pm-plan-item-icon { font-size: 1.1rem; }
      .pm-plan-item-name { flex: 1; font-weight: 600; font-size: 0.9rem; }
      [data-theme="light"] .pm-planificacion-card { background: #fff; border-color: #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
      [data-theme="light"] .pm-planificacion-header:hover { background: #f9fafb; }
      [data-theme="light"] .pm-planificacion-dropdown { background: #f9fafb; }
      [data-theme="light"] .pm-plan-item:hover { background: rgba(0,122,255,0.05); }

      .pm-active-tema-badge {
        font-size: 0.75rem;
        background: rgba(59, 130, 246, 0.15);
        color: var(--pm-primary);
        padding: 3px 10px;
        border-radius: 12px;
        margin-top: 5px;
        display: inline-block;
        font-weight: 600;
        border: 1px solid rgba(59, 130, 246, 0.3);
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .pm-route-tree-dropdown-box {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px dashed rgba(255, 255, 255, 0.1);
        max-height: 350px;
        overflow-y: auto;
        padding-right: 5px;
      }
      /* Scrollbar minimalista para el árbol */
      .pm-route-tree-dropdown-box::-webkit-scrollbar { width: 4px; }
      .pm-route-tree-dropdown-box::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      [data-theme="light"] .pm-active-tema-badge {
        background: rgba(0, 122, 255, 0.08);
        border-color: rgba(0, 122, 255, 0.2);
      }
      [data-theme="light"] .pm-route-tree-dropdown-box {
        border-top-color: #e5e7eb;
      }
      /* Estilos del tour movidos a AsistenciaTour.js */
      .pm-asist-actions-fixed {
        position: fixed;
        bottom: 80px; /* Por encima del menú inferior */
        left: 0; right: 0;
        padding: 0.75rem 1rem;
        background: rgba(var(--pm-bg-rgb), 0.8);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex;
        gap: 0.75rem;
        z-index: 1000;
        border-top: 1px solid rgba(255,255,255,0.05);
        box-shadow: 0 -10px 30px rgba(0,0,0,0.2);
      }
      .pm-asist-btn-obs {
        flex: 1;
        background: var(--pm-surface-2);
        color: var(--pm-text);
        border: 1px solid var(--pm-border);
        padding: 0.75rem;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.2s;
      }
      .pm-asist-btn-save {
        flex: 1.5;
        background: var(--pm-primary);
        color: #fff;
        border: none;
        padding: 0.75rem;
        border-radius: 12px;
        font-weight: 700;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(var(--pm-primary-rgb), 0.3);
        transition: all 0.2s;
      }
      .pm-asist-btn-obs:active, .pm-asist-btn-save:active { transform: scale(0.96); }

      /* ═════════════════════════════════════════════════════════════
         MOBILE OPTIMIZATION — max-width: 767px
         ═════════════════════════════════════════════════════════════ */
      @media (max-width: 767px) {
        /* ── Reduce overall padding/margins for compact layout ── */
        .pm-asist-header {
          padding: 1rem 1rem 1.5rem 1rem;
          margin-bottom: 1rem;
        }

        .pm-asist-alumnos-container {
          padding: 0 0.75rem 1.5rem 0.75rem;
        }

        .pm-route-selector-wrap {
          margin: 0 0.75rem 0.75rem 0.75rem;
          padding: 0.5rem 0.75rem;
        }

        /* ── DSL Editor: larger for more writing space ── */
        .pm-dsl-editor-container {
          min-height: 220px;
        }

        .pm-dsl-editable {
          min-height: 220px;
          padding: 0.85rem;
          font-size: 0.9rem;
        }

        .pm-dsl-placeholder {
          font-size: 0.75rem;
          line-height: 1.3;
          opacity: 0.7;
        }

        .pm-dsl-placeholder-title {
          font-size: 0.8rem;
          margin-bottom: 0.3rem;
        }

        .pm-dsl-placeholder-example {
          margin-bottom: 0.3rem;
          gap: 0.25rem;
        }

        .pm-dsl-placeholder-guide {
          font-size: 0.7rem;
        }

        /* ── Toolbar: compact buttons ── */
        .dsl-toolbar {
          flex-wrap: wrap;
          gap: 0.4rem;
          padding: 0.5rem;
        }

        .pm-dsl-tool-btn {
          padding: 0.45rem 0.5rem;
          font-size: 0.75rem;
          flex: 0 1 auto;
          min-width: fit-content;
        }

        .pm-dsl-tool-btn.ai {
          font-size: 0.7rem;
          padding: 0.4rem 0.6rem;
        }

        /* ── Actions bar: adjust for mobile nav ── */
        .pm-asist-actions-fixed {
          bottom: 65px;
          padding: 0.6rem 0.75rem;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .pm-asist-btn-obs,
        .pm-asist-btn-save {
          padding: 0.6rem 0.5rem;
          font-size: 0.8rem;
          border-radius: 8px;
          min-height: 40px;
        }

        .pm-asist-btn-obs i,
        .pm-asist-btn-save i {
          font-size: 1rem;
        }

        /* ── Planificación card: collapse some info ── */
        .pm-planificacion-card {
          margin: 0.75rem;
        }

        .pm-planificacion-header {
          padding: 1rem 1.25rem;
        }

        .pm-planificacion-info {
          min-width: 0;
        }

        .pm-planificacion-nombre {
          font-size: 1rem;
        }

        /* ── Hide non-essential sections to save space ── */
        .pm-route-tree-dropdown-box {
          max-height: 200px;
        }

        /* ── Reduce section margins ── */
        .pm-asist-dsl-section {
          margin-top: 1.25rem !important;
          padding: 0 0.75rem;
        }

        .pm-asist-section-title {
          font-size: 1rem;
          margin-bottom: 0.75rem;
        }

        /* ── Optimize list items spacing ── */
        .pm-asist-item {
          margin-bottom: 0.45rem;
          padding: 0.65rem;
        }

        .pm-asist-nombre {
          font-size: 0.95rem;
        }

        .pm-asist-instrumento {
          font-size: 0.75rem;
        }
      }
    </style>

    <!-- Tour inyectado por AsistenciaTour.js -->

    <div class="pm-asist-root pm-animate-fade-in" style="position:relative; min-height:100vh; padding: 0;">
      <div id="pm-attendance-header"></div>

      <div class="pm-asist-content" style="padding: 0 1rem 160px;">
        <div class="pm-asist-progress-wrap" id="pm-progress-wrap" style="display:none; margin: 1rem 0;">
          <div class="pm-asist-progress-bar">
            <div class="pm-asist-progress-fill" id="pm-progress-fill"></div>
          </div>
          <span class="pm-asist-progress-label" id="pm-progress-label">0/${c.length}</span>
        </div>

        <div id="pm-asist-announce" role="status" aria-live="polite" aria-atomic="true" class="pm-visually-hidden"></div>

        <div id="pm-alumnos-list" class="pm-alumnos-queue"></div>

        <div id="pm-planificacion-card" class="pm-planificacion-card" style="display:none; margin: 1rem 0;">
        <div id="pm-planificacion-header" class="pm-planificacion-header">
          <div class="pm-planificacion-header-left">
            <div class="pm-planificacion-icon-box">🗺️</div>
            <div class="pm-planificacion-info">
              <div class="pm-planificacion-label">Planificación Académica</div>
              <div id="pm-planificacion-nombre" class="pm-planificacion-nombre">Cargando...</div>
              <div id="pm-active-tema-badge" class="pm-active-tema-badge" style="display:none;"></div>
            </div>
          </div>
          <div class="pm-planificacion-actions">
            <button id="btn-manage-planning" class="pm-btn-circle" title="Ajustar Estructura">
              <i class="bi bi-gear-fill"></i>
            </button>
            <i class="bi bi-chevron-down pm-planificacion-toggle-btn"></i>
          </div>
        </div>
        <div id="pm-planificacion-dropdown" class="pm-planificacion-dropdown" style="display:none;">
          <div class="pm-planificacion-tabs-pill">
            <button class="pm-plan-tab-pill active" data-tab="rutas">Mis Rutas</button>
            <button class="pm-plan-tab-pill" data-tab="planificaciones">Biblioteca</button>
          </div>
          <div id="pm-plan-list-rutas" class="pm-plan-list"></div>
          <div id="pm-plan-list-planificaciones" class="pm-plan-list" style="display:none;"></div>
          
          <!-- EL ARBOL AHORA VIVE AQUI DENTRO -->
          <div id="pm-route-tree-container" class="pm-route-tree-dropdown-box"></div>
          <div id="pm-curriculo-proposal-trigger" style="padding:0.5rem 0.75rem 0.75rem;">
            <button class="pm-btn pm-btn-outline" id="btn-proponer-curriculo" style="width:100%;font-size:0.82rem;">
              <i class="bi bi-stars"></i> Proponer plan curricular con IA
            </button>
          </div>
        </div>
      </div>

      <div class="pm-asist-dsl-section" style="margin-top:2rem;">
        <h3 class="pm-asist-section-title"><i class="bi bi-stars"></i> Registro de Clase</h3>
        <div id="pm-dsl-toolbar-container" style="margin-bottom:0.5rem;"></div>
        <div id="pm-dsl-editor-container"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.5rem;">
          <div id="pm-draft-indicator" style="display:none; padding:0.25rem 0.5rem; font-size:0.75rem; color:var(--pm-text-muted);"></div>
          <button class="pm-copy-plan-btn" id="btn-copy-as-plan" title="Copiar este contenido como borrador de planificación">
            <i class="bi bi-clipboard-plus"></i> Copiar como planificación
          </button>
        </div>
      </div>

      <div id="pm-academic-tools" style="margin-top:1.5rem; display:none;"></div>

      <!-- Barra de Acciones Fija (Por encima del menú inferior) -->
      <div class="pm-asist-actions-fixed">
        <button id="btn-guardar-obs" class="pm-asist-btn-obs" style="display:none;">
          <i class="bi bi-chat-left-text"></i> Observación
        </button>
        <button id="btn-guardar" class="pm-asist-btn-save">
          <i class="bi bi-cloud-upload"></i> Guardar sesión
        </button>
      </div>
    </div> <!-- Fin pm-asist-content -->
    </div>

    <!-- Modales... -->
  `;let re=lt(t.querySelector(`#pm-attendance-header`),{clase:o,horario:s,salonNombre:T,fechaHoy:h,totalAlumnos:c.length,hasConflict:w,onBack:()=>{Te.destroy();try{be.close()}catch{}M.forEach(e=>{try{e()}catch{}}),j(`hoy`)}});M.push(()=>re.destroy());let ae=t.querySelector(`#pm-sync-badge-container`);if(ae){let e=le();ae.appendChild(e.el)}let oe=bn(t,{initialContent:C,claseId:b,onEditorChange:e=>{I=e}}),B=oe.getEditor(),ce=t.querySelector(`#pm-dsl-editor-container`),ue=fe(t,{onAceptar:e=>{B.setValue(e)}}),me=pe(t,{onAccept:e=>{B.setValue(e)}}),he=Qe(ce.parentNode,{onConfirm:async n=>{try{let e=c.map(e=>({id:e.id,nombre:e.nombre_completo||e.nombre||``,nombreCorto:(e.nombre_completo||e.nombre||``).split(` `)[0]})),{saved:r,errors:i}=await Ge({sesionId:k,claseId:b,maestroId:p.id,fechaHoy:h,progressRecords:n,alumnos:e});i.length&&console.warn(`[Progress] Errores parciales:`,i);let a=t.querySelector(`#btn-guardar`);a&&(a.style.removeProperty(`display`),a.click())}catch(n){t.querySelector(`#btn-guardar`)?.style.removeProperty(`display`),e.error(`Error al guardar progreso: `+n.message)}},onCancel:()=>{t.querySelector(`#btn-guardar`)?.style.removeProperty(`display`)}}),ge=it(t.querySelector(`#pm-planificacion-dropdown`)||t,{onAdopt:async({instrumento:t,nivel:n,resumen:r,pilares:i})=>{try{let{curriculo:a,allObjetivos:o}=await v({instrumento:t,nivel:n,descripcion:r,pilares:i}),{linked:s}=await qe({claseId:b,objetivos:o}),c=s>0?`Plan creado · ${s} registro${s===1?``:`s`} vinculado${s===1?``:`s`}`:`Plan curricular creado correctamente.`;e.success(c)}catch(t){e.error(`Error al crear el plan: `+t.message)}},onCancel:()=>{}});oe.initToolbar({onImproveClick:async n=>{let r=t.querySelector(`#btn-generar-informe`);r&&(r.disabled=!0);try{let e=await ee(n);ue.open({original:n,improved:e})}catch(t){e.error(`Error al generar informe: `+t.message)}finally{r&&(r.disabled=!1)}},onStructureClick:async n=>{let r=t.querySelector(`#btn-ia-magic`);r&&(r.disabled=!0);try{let e=z?.getActiveIndicador(),t=await P(n,{presentes:c.filter(e=>l[e.id]===`P`).map(e=>e.nombre_completo),indicadorActivo:e?.nombre||null});me.open({original:n,dsl:t})}catch(t){e.error(`Error al estructurar con IA: `+t.message)}finally{r&&(r.disabled=!1)}},onAnalyzeClick:async n=>{await Ln(async()=>{let r=c.filter(e=>l[e.id]&&l[e.id]!==`A`),i=(e,t)=>{let n=e.trim().split(/\s+/),r=n[0];return t.filter(e=>e.trim().split(/\s+/)[0]===r).length>1?n.slice(0,2).join(` `):r},a=c.map(e=>e.nombre_completo||e.nombre||``),s={alumnos:c.map(e=>{let t=e.nombre_completo||e.nombre||``;return{id:e.id,nombre:t,nombreCorto:i(t,a)}}),presentes:r.map(e=>{let t=e.nombre_completo||e.nombre||``;return{id:e.id,nombre:t,nombreCorto:i(t,a)}}),tipoClase:at(o),instrumento:o.instrumento||``,sesionesRecientes:(S||[]).slice(-2).map(e=>e.contenido||``).filter(Boolean),indicadorActivo:z?.getActiveIndicador()?.nombre||``};t.querySelector(`#btn-guardar`)?.style.setProperty(`display`,`none`);let u=await F(n,s);if(!u?.progreso?.length){t.querySelector(`#btn-guardar`)?.style.removeProperty(`display`),e!==void 0&&e&&e.warning(`La IA no detectó registros de progreso en este texto.`);return}he.open({progreso:u.progreso,resumen:u.resumen})},{onError:n=>{t.querySelector(`#btn-guardar`)?.style.removeProperty(`display`),e!==void 0&&e&&e.error(`Error al analizar con IA: `+n.message)}})}});let _e=oe.getToolbar();z=ft(t,{claseId:b,clase:o,maestro:p,fechaHoy:h,rutaId:E,editor:B,onIndicadorSelect:e=>{B.insertText(`[${e.nombre}] `),_e&&_e.setContext({indicadorActivo:e.nombre});let n=t.querySelector(`#btn-guardar-obs`);n&&(n.style.display=``)},getSessionState:()=>({isRegistered:A,hasContent:!!(I&&I.trim()),sessionId:k}),getDslContent:()=>B.getValue()}),M.push(()=>z.destroy());let V=t.querySelector(`#btn-proponer-curriculo`);V&&(V.onclick=async()=>{V.disabled=!0,V.innerHTML=`<i class="bi bi-hourglass-split"></i> Analizando...`;try{let t=await et(b,12);if(t.registros.length===0){e.error(`No hay registros de progreso suficientes en las últimas 12 semanas para generar una propuesta.`);return}let n=await te(t,{instrumento:o?.instrumento||``,nivel:``,nombreClase:o?.nombre||``});ge.open({pilares:n.pilares,resumen:n.resumen,instrumento:o?.instrumento||``,nivel:``})}catch(t){e.error(`Error al generar propuesta: `+t.message)}finally{V.disabled=!1,V.innerHTML=`<i class="bi bi-stars"></i> Proponer plan curricular con IA`}});let H=ut(t,{editor:B,toolbar:_e}),ye=se();H.inject(ye,b),M.push(()=>H.destroy());let be=kn(t,{sesionId:k,claseId:b,fechaHoy:h,maestroId:p.id,supabase:d,guardarJustificacion:Le,eliminarJustificacion:ze,onJustifDeleted:e=>{l[e]=null,delete f[e]},onJustifSaved:(e,t)=>{f[e]=t},onJustifCancelled:(e,t)=>{l[e]=t},onRenderLista:e=>U.render(e),onUpdateProgress:()=>Se(),onAutoSave:e=>Ce(e),onAnnounce:e=>ie(e)});M.push(()=>{try{be.close()}catch{}});let xe=Dn(t,{sesionId:k,maestroId:p.id,editor:B,sesionExistenteData:D,onDraftRecovered:e=>{I=e,B.setValue(e)}});M.push(()=>xe.destroy()),t.querySelector(`#pm-academic-tools`),Pn(t,{rutaId:E,sesionId:k,claseId:b,maestro:p,fechaHoy:h,alumnos:c,estado:l,planificationCard:z,editorContainer:ce,getEditorValue:()=>B.getValue(),setEditorValue:e=>B.setValue(e),onDslContentClear:()=>{I=``},activeClassEventId:null,activeLevel:null,claseNombre:o?.nombre||`Clase`,onAppendModal:e=>{let n=t.querySelector(`.pm-asist-root`);n&&n.appendChild(e)}});let U=An(t,{alumnos:c,estado:l,rutaId:E,canOpenProgressPanel:!!(b||E),sesionId:k,fechaHoy:h,snapshots:S,justificaciones:f,obtenerJustificacion:Re,onEstadoChange:(e,t)=>{l[e]=t},onOpenProgressPanel:e=>{W&&W.destroy(),W=De({alumno:e,rutaId:E,sessionId:k,claseId:b,fecha:h,horaInicio:s?.hora_inicio||null,onProgressSaved:async()=>{z?.refreshTree&&await z.refreshTree()}}),W.open(),M.push(()=>{W&&W.destroy()})},onOpenEvaluationDrawer:(e,n)=>{de(t,{student:e,sessionId:k,teacherId:p.id,snapshots:n})},onOpenJustifModal:(e,t,n)=>{be.open(e,t,n)},onAutoSave:e=>Ce(e),onAnnounce:e=>ie(e),onUpdateSnapshots:e=>{S.push(...e)}});M.push(()=>U.destroy());let W=null;function Se(){let e=c.length,n=Object.values(l).filter(e=>e!==null).length,r=t.querySelector(`#pm-progress-wrap`),i=t.querySelector(`#pm-progress-fill`),a=t.querySelector(`#pm-progress-label`);if(n===0){r.style.display=`none`;return}r.style.display=`flex`,i.style.width=`${n/e*100}%`,a.textContent=`${n}/${e}`}async function Ce(e=!1,t=!1){L&&clearTimeout(L);let n=async()=>{let e=c.filter(e=>l[e.id]).map(e=>({alumno_id:e.id,estado:l[e.id]})),t={...k?{}:{clase_id:b},maestro_id:p.id,fecha:h,estado:`pendiente`,borrador:!0,asistencia:e||[],contenido:I||``};if(navigator.onLine)try{if(k){let{error:e}=await d.from(`sesiones_clase`).update({...t,updated_at:new Date().toISOString()}).eq(`id`,k);if(!e){localStorage.setItem(`${N}_updated`,new Date().toISOString());return}throw e}else{let{data:e,error:n}=await d.from(`sesiones_clase`).insert([t]).select(`id`).single();if(!n&&e){k=e.id,console.log(`[asistencia] Nueva sesión creada:`,k),localStorage.setItem(`${N}_updated`,new Date().toISOString());return}throw n||Error(`No se pudo crear la sesión`)}}catch(e){console.warn(`[asistencia] Fallo operación directa, usando cola offline:`,e.message)}await i({tabla:`sesiones_clase`,operacion:k?`update`:`insert`,payload:{...k?{id:k}:{},...t}}),localStorage.setItem(`${N}_updated`,new Date().toISOString())};e?t?await n():await R.run(n):L=setTimeout(()=>{R.run(n).catch(e=>console.error(`[asistencia] Autosave error:`,e))},2e3)}let G=t.querySelector(`.pm-asist-actions-fixed`);if(G){let e=document.createElement(`button`);e.id=`btn-reporte-dia`,e.className=`pm-asist-btn-obs`,e.innerHTML=`📄 Reporte`,e.title=`Genera el Reporte Diario de Asistencia (PDF)`,e.style.flex=`1`,e.style.display=`none`,e.addEventListener(`click`,async t=>{t.preventDefault(),k&&(e.disabled=!0,e.innerHTML=`⏳...`,await y(k),e.disabled=!1,e.innerHTML=`📄 Reporte`)});let t=G.querySelector(`#btn-guardar`);G.insertBefore(e,t);let n=document.createElement(`button`);n.id=`btn-resumen-mes`,n.className=`pm-asist-btn-obs`,n.innerHTML=`📊 Resumen`,n.title=`Genera el Resumen Mensual de Asistencia (PDF)`,n.style.flex=`1`,n.style.display=`none`;let r=new Date;n.addEventListener(`click`,async e=>{e.preventDefault(),b&&(n.disabled=!0,n.innerHTML=`⏳...`,await x(b,r.getFullYear(),r.getMonth()+1),n.disabled=!1,n.innerHTML=`📊 Resumen`)}),G.insertBefore(n,t)}t.querySelector(`#btn-guardar`).onclick=async()=>{let e=t.querySelector(`#btn-guardar`),a=e.textContent;e.textContent=`Guardando...`,e.disabled=!0,await R.run(async()=>{try{let a=c.filter(e=>l[e.id]).map(e=>({...b?{clase_id:b}:{},alumno_id:e.id,fecha:h,estado:l[e.id],registrado_por:p.id})),s=a.length>0,f=I&&I.trim().length>0;if(!s&&!f)throw Error(`Debes marcar asistencia o agregar contenido para guardar`);if(await Ce(!0,!0),!k){let{data:e}=await d.from(`sesiones_clase`).select(`id`).eq(`clase_id`,b).eq(`maestro_id`,p.id).eq(`fecha`,h).maybeSingle();e&&(k=e.id)}if(s&&b)try{let e=a.map(e=>({...e,...k&&{sesion_clase_id:k}}));await g(e),console.log(`[asistencia] Registradas asistencias individuales:`,e.length)}catch(e){if(console.error(`[asistencia] Error registrando asistencias en bulk:`,e),!navigator.onLine||!k){console.warn(`[asistencia] Encolando asistencias para sync offline...`);for(let e of a)await i({tabla:`asistencias`,operacion:`upsert`,payload:{clase_id:b,alumno_id:e.alumno_id,fecha:h,estado:e.estado,registrado_por:p.id,...k?{sesion_clase_id:k}:{}}})}else throw Error(`No se pudieron registrar las asistencias individuales: `+e.message)}if(k&&(s||f)){let e=c.filter(e=>l[e.id]).map(e=>({alumno_id:e.id,estado:l[e.id]})),{error:t}=await d.from(`sesiones_clase`).update({borrador:!1,estado:`registrada`,asistencia:e,contenido:I||``,updated_at:new Date().toISOString()}).eq(`id`,k).select();if(t){console.warn(`estado "registrada" no permitido, usando fallback "cerrada":`,t.message);let{error:n}=await d.from(`sesiones_clase`).update({borrador:!1,estado:`cerrada`,asistencia:e,contenido:I||``,updated_at:new Date().toISOString()}).eq(`id`,k).select();n&&(console.warn(`Fallback "cerrada" también falló, actualizando solo borrador:`,n.message),await d.from(`sesiones_clase`).update({borrador:!1,asistencia:e,contenido:I||``,updated_at:new Date().toISOString()}).eq(`id`,k))}u(),r(`hoy`),r(`calendario`),r(`metricas`),n().catch(e=>console.warn(`[asistenciaView] Error al actualizar notificaciones:`,e)),A=!0,z?.refreshTree&&await z.refreshTree()}if(k){let{academicService:n}=await m(async()=>{let{academicService:e}=await import(`./academicService-or-p50Yc.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([2,1,3,4])),{createAchievementsSummaryModal:r}=await m(async()=>{let{createAchievementsSummaryModal:e}=await import(`./AchievementsSummaryModal-CJ9jpoV7.js`);return{createAchievementsSummaryModal:e}},__vite__mapDeps([7,6])),i=await n.processSessionClosure(k);i&&i.length>0?(e.textContent=`¡Logros detectados!`,e.style.background=`var(--pm-success)`,await r(t,i)):console.warn(`[asistencia] processSessionClosure devolvió 0 logros (puede que no haya progresos vinculados a esta sesión aún).`)}else console.warn(`[asistencia] No se pudo obtener sesionId para procesar logros.`);e.textContent=`✓ Guardado`,e.style.background=`var(--apple-success)`;let v=G?.querySelector(`#btn-reporte-dia`);v&&(v.style.display=``);let S=G?.querySelector(`#btn-resumen-mes`);S&&(S.style.display=``);let C=Object.values(l).filter(e=>e===`P`).length,w=Object.values(l).filter(e=>e===`A`).length;ie(`Sesión guardada exitosamente. ${C} presentes, ${w} ausentes.`);let T=document.createElement(`div`);T.className=`pm-saved-overlay`,T.innerHTML=`
        <div class="pm-saved-options">
          <div class="pm-saved-header">
            <div class="pm-saved-check-anim">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <h3>Sesión Guardada</h3>
            <p>¿Qué deseas hacer ahora?</p>
          </div>
          <div class="pm-saved-actions">
            <button class="pm-btn pm-btn-primary" id="btn-resumen-pedagogico">
              <i class="bi bi-bar-chart-steps"></i> Resumen pedagógico
            </button>
            <button class="pm-btn pm-btn-secondary" id="btn-editar-asistencia">
              <i class="bi bi-pencil"></i> Editar Asistencia
            </button>
            <button class="pm-btn pm-btn-primary" id="btn-reporte-dia-overlay">
              <i class="bi bi-file-earmark-pdf"></i> Reporte del día (PDF)
            </button>
            <button class="pm-btn pm-btn-secondary" id="btn-resumen-mes-overlay">
              <i class="bi bi-bar-chart-line"></i> Resumen del mes (PDF)
            </button>
            <button class="pm-btn pm-btn-secondary" id="btn-informe-ped-overlay">
              <i class="bi bi-mortarboard"></i> Informe pedagógico (PDF)
            </button>
            <button class="pm-btn pm-btn-outline" id="btn-compartir-correo">
              <i class="bi bi-envelope"></i> Compartir por Correo
            </button>
            <button class="pm-btn pm-btn-success" id="btn-compartir-whatsapp">
              <i class="bi bi-whatsapp"></i> Compartir por WhatsApp
            </button>
          </div>
          <div class="pm-saved-nav">
            <button class="pm-saved-nav-btn" id="btn-volver-hoy" title="Volver a Hoy">
              <i class="bi bi-arrow-left-circle"></i>
            </button>
            <button class="pm-saved-nav-btn" id="btn-ir-calendario" title="Ir al Calendario">
              <i class="bi bi-calendar3"></i>
            </button>
          </div>
        </div>
      `,document.body.appendChild(T);let E=T.querySelector(`#btn-resumen-pedagogico`),D=T.querySelector(`#btn-editar-asistencia`),O=T.querySelector(`#btn-compartir-correo`),M=T.querySelector(`#btn-compartir-whatsapp`),ee=T.querySelector(`#btn-volver-hoy`),N=T.querySelector(`#btn-ir-calendario`);ne&&ne.destroy(),ne=Ne();let te=ne;E&&(E.onclick=()=>{te.open({sesionId:k,claseNombre:o?.nombre||`Clase`,fecha:h,supabase:d})}),D&&(D.onclick=()=>{T.remove(),e.textContent=`Guardar sesión`,e.style.background=``,e.disabled=!1,e.style.display=``}),O&&(O.onclick=async()=>{let e=c.filter(e=>l[e.id]).map(e=>({alumno_id:e.id,estado:l[e.id]})),t=encodeURIComponent(`Reporte de Clase - ${o?.nombre||``} - ${h}`),n=st(e,I,c,o,h);ct(`mailto:?subject=${t}&body=`,n,1800)}),M&&(M.onclick=async()=>{ct(`https://wa.me/?text=`,st(c.filter(e=>l[e.id]).map(e=>({alumno_id:e.id,estado:l[e.id]})),I,c,o,h),1600)}),ee&&(ee.onclick=()=>{T.remove(),j(`hoy`)}),N&&(N.onclick=()=>{T.remove(),j(`fechas`)});let P=T.querySelector(`#btn-reporte-dia-overlay`);P&&(P.onclick=async()=>{let e=P.innerHTML;P.disabled=!0,P.innerHTML=`<i class="bi bi-hourglass-split"></i> Generando…`;try{await y(k)}finally{P.disabled=!1,P.innerHTML=e}});let F=T.querySelector(`#btn-resumen-mes-overlay`);F&&(b?F.onclick=async()=>{let e=F.innerHTML;F.disabled=!0,F.innerHTML=`<i class="bi bi-hourglass-split"></i> Generando…`;try{let e=new Date;await x(b,e.getFullYear(),e.getMonth()+1)}finally{F.disabled=!1,F.innerHTML=e}}:(F.disabled=!0,F.title=`No disponible para actividades especiales`,F.style.opacity=`0.5`));let L=T.querySelector(`#btn-informe-ped-overlay`);L&&(b?L.onclick=async()=>{let e=L.innerHTML;L.disabled=!0,L.innerHTML=`<i class="bi bi-hourglass-split"></i> Generando…`;try{let e=new Date;await _(b,e.getFullYear(),e.getMonth()+1)}finally{L.disabled=!1,L.innerHTML=e}}:(L.disabled=!0,L.title=`No disponible para actividades especiales`,L.style.opacity=`0.5`))}catch(t){console.error(`Error al guardar sesión:`,t),e.textContent=t.message||`Error al guardar`,e.style.background=`var(--pm-danger)`,e.disabled=!1,setTimeout(()=>{e.textContent=a,e.style.background=``},3e3)}})};let we=xn(t,{onMarkAll:async e=>{c.forEach(t=>{l[t.id]=e}),U.render(),Se();try{await Ce(!0)}catch(t){console.warn(`[asistencia] autoSave error on bulk ${e}:`,t)}ie(`Todos los ${c.length} alumnos marcados como ${e===`P`?`presentes`:`ausentes`}.`)}});M.push(()=>we.destroy()),U.render();let Te=new ve(t);Te.mount();let Ee=t.querySelector(`#pm-btn-help`);return Ee&&(Ee.onclick=()=>Te.start()),()=>{console.log(`[AsistenciaView] Cleanup ejecutado por el Router`),Te.destroy();try{be.close()}catch{}document.querySelectorAll(`.pm-saved-overlay`).forEach(e=>e.remove()),M.forEach(e=>{try{e()}catch{}})}}export{zn as renderAsistenciaView};