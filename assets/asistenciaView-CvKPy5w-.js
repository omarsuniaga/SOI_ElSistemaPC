const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/academicService-BUoVMC5G.js","assets/AppModal-Du6jXNYA.js","assets/supabase-Cgh_dhNB.js","assets/LevelCompletionModal-Du_KQRU_.js","assets/portalUtils-CkF82Yyk.js","assets/AchievementsSummaryModal-CJ9jpoV7.js"])))=>i.map(i=>d[i]);
import{i as e,r as t,s as n}from"./AppModal-Du6jXNYA.js";import{a as r,i,n as a,r as o,s}from"./pwaInstaller-B9BMrkti.js";import{a as c,i as l}from"./supabase-Cgh_dhNB.js";import{i as u}from"./maestroAuth-BMzDPnai.js";import{c as d,n as f,r as p,s as m,t as h}from"./main-maestros-DUavRTp4.js";import{t as g}from"./idb-hTByFGMt.js";import{S as _}from"./planificacion-DfaGXXF3.js";import{t as v}from"./config-CNiOV0RX.js";import{l as y}from"./asistenciasApi-B5GAFYvz.js";import{t as b}from"./aiEvaluacionService-Cl48ShsO.js";import{i as x,n as S,o as C,r as w}from"./reportService-D-lLKf6I.js";import{c as T,i as E,l as D,o as O,s as k,t as A}from"./groqService-Cu889xeB.js";import{t as j}from"./academicService-BUoVMC5G.js";import{a as ee,i as M,l as N,o as te,s as P}from"./portalUtils-CkF82Yyk.js";import{t as ne}from"./a11yUtils-DRYT20ux.js";import{a as F,c as I,d as re,i as L,l as R,n as ie,o as z,r as B,s as V,t as H}from"./weeklyPlanAdapter-BmlJRmN1.js";import{a as ae,i as oe,n as se,o as ce,r as le}from"./evaluationService-BKbX7tP9.js";function ue(e={}){let{showSyncButton:t=!0}=e,n=document.createElement(`div`);n.className=`pm-sync-badge`,n.style.cssText=`
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
  `;let r=document.createElement(`span`);r.textContent=`☁️`,r.style.fontSize=`12px`;let i=document.createElement(`span`);i.textContent=``;let a=document.createElement(`button`);t&&(a.textContent=`Sincronizar`,a.style.cssText=`
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
    `,a.addEventListener(`click`,async e=>{e.stopPropagation(),a.disabled=!0,window.dispatchEvent(new Event(`online`)),await o(),a.disabled=!1})),n.appendChild(r),n.appendChild(i),t&&n.appendChild(a);async function o(){let e=await d();if(e===0){n.style.display=`none`;return}n.style.display=`inline-flex`,n.style.background=`#fef3c7`,n.style.color=`#92400e`,n.style.border=`1px solid #fde68a`,r.textContent=`☁️`,i.textContent=`${e} pendiente${e===1?``:`s`}`,a&&(a.style.display=navigator.onLine?``:`none`)}function s(){setTimeout(o,2e3)}function c(){o()}return window.addEventListener(`online`,s),window.addEventListener(`offline`,c),o(),{el:n,destroy:()=>{window.removeEventListener(`online`,s),window.removeEventListener(`offline`,c),n.remove()},refresh:o}}function de(e,{indicator:t,sessionId:n,studentId:r,teacherId:i,onSave:a}){let o=t.status||`pending`;j.getStatusToken(o);let s=document.createElement(`div`);s.className=`pm-node-eval-card pm-animate-fade-in status-${o}`,s.dataset.indicatorId=t.indicator_id,s.innerHTML=`
    <div class="pm-eval-card-header">
      <div class="pm-eval-node-info">
        <span class="pm-eval-node-name">${M(t.node_name)}</span>
        <p class="pm-eval-indicator-desc">${M(t.indicator_description||`Evaluación de nodo`)}</p>
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
      <textarea placeholder="Feedback pedagógico (opcional)..." class="pm-eval-feedback-input">${M(t.feedback||``)}</textarea>
    </div>

    <div class="pm-eval-card-footer">
      <span class="pm-eval-save-status"></span>
    </div>
  `;let c=s.querySelectorAll(`.pm-eval-btn`),l=s.querySelector(`.pm-eval-feedback-input`),u=s.querySelector(`.pm-eval-save-status`),d=null,f=async(e=null)=>{let c=e||s.dataset.status||o;u.innerHTML=`<i class="pm-spinner-sm"></i> Guardando...`;try{let e={student_id:r,indicator_id:t.indicator_id,session_id:n,created_by:i,status:c,feedback:l.value,attempt_number:(t.attempt_number||0)+1};await j.saveIndicatorAttempt(e),u.innerHTML=`<i class="bi bi-check-all"></i> Guardado localmente`,s.className=`pm-node-eval-card status-${c}`,a&&a(e)}catch(e){console.error(`Error saving evaluation:`,e),u.innerHTML=`<i class="bi bi-exclamation-circle"></i> Error al guardar`}};c.forEach(e=>{e.onclick=()=>{let t=e.dataset.status;c.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),s.dataset.status=t,f(t)}}),l.oninput=()=>{d&&clearTimeout(d),d=setTimeout(()=>f(),1500)},e.appendChild(s)}function fe(e,{student:t,sessionId:n,teacherId:r,snapshots:i=[]}){let a=document.getElementById(`pm-evaluation-drawer`);a&&a.remove();let o=document.createElement(`div`);o.id=`pm-evaluation-drawer`,o.className=`pm-drawer-overlay`,o.innerHTML=`
    <div class="pm-drawer">
      <div class="pm-drawer-header">
        <div class="pm-drawer-title-group">
          <h4 class="pm-drawer-title">Evaluar Avance</h4>
          <p class="pm-drawer-subtitle" style="font-size: 0.85rem; color: var(--pm-text-muted); margin: 0;">${M(t.nombre_completo)}</p>
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
  `,e.appendChild(o);let s=o.querySelector(`#pm-evaluation-cards-container`);s&&i.forEach(e=>{de(s,{indicator:e,sessionId:n,studentId:t.id,teacherId:r,onSave:e=>{console.log(`Progress saved:`,e)}})}),setTimeout(()=>o.classList.add(`open`),10);let c=()=>{o.classList.remove(`open`),setTimeout(()=>o.remove(),400)},l=o.querySelector(`#pm-close-eval-drawer`),u=o.querySelector(`#pm-finish-eval`);return l&&l.addEventListener(`click`,c),o.addEventListener(`click`,e=>{e.target===o&&c()}),u&&u.addEventListener(`click`,c),{close:c}}function pe(e,{onAceptar:t}){let n=document.getElementById(`pm-generar-informe-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-generar-informe-modal`,n.className=`pm-modal-overlay`,n.innerHTML=`
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
    `),t.document.close()}n.querySelector(`#btn-informe-copy`).onclick=s,n.querySelector(`#btn-informe-whatsapp`).onclick=c,n.querySelector(`#btn-informe-email`).onclick=l,n.querySelector(`#btn-informe-pdf`).onclick=u;function d({original:e,improved:t}){r.textContent=e,a.textContent=t,i&&(i.style.display=e?``:`none`),n.classList.add(`open`)}function f(){n.classList.remove(`open`)}return n.querySelector(`#pm-informe-close`).onclick=f,n.querySelector(`#pm-informe-descartar`).onclick=f,n.querySelector(`#pm-informe-aceptar`).onclick=()=>{t&&t(o()),f()},{open:d,close:f}}function me(e,{onAccept:t}){let n=document.getElementById(`pm-structure-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-structure-modal`,n.className=`pm-modal-overlay`,n.innerHTML=`
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
      `,document.head.appendChild(e)}let r=n.querySelector(`#pm-structure-original`),i=n.querySelector(`#pm-structure-dsl`);function a({original:e,dsl:t}){r.textContent=e,i.textContent=t,n.classList.add(`open`)}function o(){n.classList.remove(`open`)}return n.querySelector(`#pm-structure-close`).onclick=o,n.querySelector(`#pm-structure-reject`).onclick=o,n.querySelector(`#pm-structure-accept`).onclick=()=>{t&&t(i.textContent),o()},{open:a,close:o}}var he=`pm_tour_completed`,ge=1500,_e=[{target:`.pm-asist-header`,title:`📍 Cabecera de Clase`,body:`Aquí puede ver los datos de la clase, el salón y la fecha. Es su panel de control principal.`},{target:`.pm-asist-bulk-circles`,title:`👥 Asistencia Rápida`,body:`¿Asistieron todos? Presione "P" para marcar a todos los alumnos como presentes en un solo clic.`},{target:`#pm-alumnos-list`,title:`🙋‍♂️ Lista de Alumnos`,body:`Presione el círculo de cada alumno para cambiar entre Presente, Ausente o Retraso.`},{target:`#pm-planificacion-card`,title:`🗺️ Planificación Académica`,body:`Seleccione una Ruta o busque en la Biblioteca. Los temas que ya impartió aparecerán con un check ✅ verde.`},{target:`#pm-dsl-toolbar-container`,title:`🛠️ Caja de Herramientas`,body:`Use el micrófono 🎤 para dictar la clase, o el botón de IA ✨ para mejorar y profesionalizar su redacción automáticamente.`},{target:`#pm-dsl-editor-container`,title:`✍️ Escritura Inteligente (DSL)`,body:`Use [Corchetes] para vincular temas de la planificación y asteriscos * para puntos clave. La IA le ayudará a darle formato profesional.`},{target:`#btn-guardar`,title:`💾 Guardar Sesión`,body:`Al finalizar, no olvide guardar su sesión para que el progreso de los alumnos se registre en el sistema.`}],ve=`
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
`,ye=class{constructor(e,t=_e){this._container=e,this._steps=t,this._step=0,this._autoTimer=null,this._overlay=null,this._spotlight=null,this._tooltip=null,this._mounted=!1,this._styleEl=null}mount(){if(!this._mounted)try{this._injectStyles(),this._injectDOM(),this._bindEvents(),this._mounted=!0,localStorage.getItem(he)||(this._autoTimer=setTimeout(()=>this.start(),ge))}catch(e){console.error(`[AsistenciaTour] Error al montar el tour:`,e),this._mounted=!1}}start(){this._overlay&&(this._step=0,this._tooltip.style.display=`block`,this._spotlight.style.display=`block`,this._overlay.style.display=`block`,this._overlay.offsetHeight,this._overlay.style.opacity=`1`,this._showStep(0),localStorage.setItem(he,`true`))}destroy(){this._autoTimer!==null&&(clearTimeout(this._autoTimer),this._autoTimer=null),this._overlay&&=(this._overlay.style.transition=`none`,this._overlay.style.opacity=`0`,this._overlay.style.display=`none`,this._overlay.remove(),null),this._spotlight&&=(this._spotlight.remove(),null),this._tooltip&&=(this._tooltip.remove(),null),this._styleEl&&=(this._styleEl.remove(),null),this._mounted=!1}_injectStyles(){if(document.getElementById(`pm-tour-styles`))return;let e=document.createElement(`style`);e.id=`pm-tour-styles`,e.textContent=ve,document.head.appendChild(e),this._styleEl=e}_injectDOM(){document.getElementById(`pm-tour-overlay`)?.remove(),document.getElementById(`pm-tour-spotlight`)?.remove(),document.getElementById(`pm-tour-tooltip`)?.remove();let e=document.createElement(`div`);e.id=`pm-tour-overlay`,e.className=`pm-tour-overlay`,e.setAttribute(`role`,`dialog`),e.setAttribute(`aria-modal`,`true`),e.setAttribute(`aria-label`,`Guía interactiva`),document.body.appendChild(e),this._overlay=e;let t=document.createElement(`div`);t.id=`pm-tour-spotlight`,t.className=`pm-tour-spotlight`,t.style.display=`none`,document.body.appendChild(t),this._spotlight=t;let n=document.createElement(`div`);n.id=`pm-tour-tooltip`,n.className=`pm-tour-tooltip`,n.style.display=`none`,n.innerHTML=`
      <h4 id="pm-tour-title"></h4>
      <p  id="pm-tour-body"></p>
      <div class="pm-tour-footer">
        <span class="pm-tour-progress" id="pm-tour-progress"></span>
        <div style="display:flex;gap:0.5rem;align-items:center">
          <button id="pm-tour-skip" class="pm-tour-btn-skip">Saltar guía</button>
          <button id="pm-tour-next" class="pm-tour-btn-next">Siguiente</button>
        </div>
      </div>
    `,document.body.appendChild(n),this._tooltip=n}_bindEvents(){if(!this._tooltip||!this._overlay){console.warn(`[AsistenciaTour] DOM no inyectado correctamente, saltando event binding`);return}this._tooltip.querySelector(`#pm-tour-next`).addEventListener(`click`,()=>this._nextStep()),this._tooltip.querySelector(`#pm-tour-skip`).addEventListener(`click`,()=>this._close()),this._onKeydown=e=>{e.key===`Escape`&&this._close()},document.addEventListener(`keydown`,this._onKeydown),this._onResize=()=>{this._overlay?.style.display!==`none`&&this._showStep(this._step)},window.addEventListener(`resize`,this._onResize,{passive:!0})}_showStep(e){let t=this._steps[e],n=this._container.querySelector(t.target);if(!n){this._nextStep();return}n.scrollIntoView({behavior:`smooth`,block:`center`}),setTimeout(()=>this._positionOnElement(n,t,e),400)}_positionOnElement(e,t,n){if(!this._spotlight||!this._tooltip){console.warn(`[AsistenciaTour] Tour no montado correctamente, abortando posicionamiento`);return}let r=e.getBoundingClientRect();this._spotlight.style.width=`${r.width+20}px`,this._spotlight.style.height=`${r.height+20}px`,this._spotlight.style.top=`${r.top-10}px`,this._spotlight.style.left=`${r.left-10}px`;let i=r.bottom+16;i+200>window.innerHeight&&(i=r.top-200-16);let a=Math.max(16,Math.min(window.innerWidth-280-16,r.left));this._tooltip.style.top=`${i}px`,this._tooltip.style.left=`${a}px`,this._tooltip.querySelector(`#pm-tour-title`).innerHTML=`<span>${t.title}</span>`,this._tooltip.querySelector(`#pm-tour-body`).textContent=t.body,this._tooltip.querySelector(`#pm-tour-progress`).textContent=`${n+1} / ${this._steps.length}`,this._tooltip.querySelector(`#pm-tour-next`).textContent=n===this._steps.length-1?`Finalizar ✓`:`Siguiente →`}_nextStep(){this._step++,this._step<this._steps.length?this._showStep(this._step):this._close()}_close(){this._overlay&&(localStorage.setItem(he,`true`),this._onKeydown&&document.removeEventListener(`keydown`,this._onKeydown),this._onResize&&window.removeEventListener(`resize`,this._onResize),this._tooltip&&(this._tooltip.style.display=`none`),this._spotlight&&(this._spotlight.style.display=`none`),this._overlay.style.opacity=`0`,setTimeout(()=>{this._overlay&&(this._overlay.style.display=`none`)},300))}};function be(){if(document.getElementById(`pm-student-panel-styles`))return;let e=document.createElement(`style`);e.id=`pm-student-panel-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}function U(e){let t=document.createElement(`div`);return t.textContent=e??``,t.innerHTML}function xe(e){return e?e.split(` `).filter(Boolean).slice(0,2).map(e=>e[0].toUpperCase()).join(``):`?`}function Se(e){return e?new Date(e).toLocaleDateString(`es-AR`,{day:`2-digit`,month:`2-digit`,year:`2-digit`}):``}var Ce={achieved:{color:`green`,icon:`🟢`,label:`Dominado`},in_process:{color:`yellow`,icon:`🟡`,label:`En proceso`},needs_reinforcement:{color:`orange`,icon:`🟠`,label:`Requiere refuerzo`},failed:{color:`red`,icon:`🔴`,label:`No aprobado`},exceeded:{color:`blue`,icon:`🔵`,label:`Sobresaliente`},not_started:{color:`gray`,icon:`⚫`,label:`Sin iniciar`}};function we(e){return Ce[e]||Ce.not_started}async function Te(e,t,n=null){let r=[];if(n){let e=await F(n).catch(()=>null),t=e?.plan?.items||[],i=new Set;r=t.filter(e=>{let t=e.indicator_id||`${e.node_id}:${e.week_number}`;return i.has(t)?!1:(i.add(t),!0)}).map(t=>({id:t.indicator_id||t.node_id||t.id,nombre:t.topic||t.objective||`Indicador`,node:{id:t.node_id||t.id,name:t.topic||`Tema`,level:{id:e?.route?.level_id||null,level_number:t.week_number,name:`Semana ${t.week_number}`}}}))}if(!r.length&&v.isDemoMode){let{getFullHierarchy:e}=await c(async()=>{let{getFullHierarchy:e}=await import(`./routeMock-BWnDIWqo.js`);return{getFullHierarchy:e}},[]);(await e(n||`pclase_001`)).forEach(e=>{e.plan_temas.forEach(t=>{t.plan_objetivos.forEach(n=>{n.plan_indicators.forEach(n=>{r.push({id:n.id,nombre:n.descripcion,node:{id:t.id,name:t.nombre,level:{id:e.id,level_number:e.numero_nivel,name:e.nombre}}})})})})})}else if(!r.length){let{data:e,error:n}=await l.from(`indicators`).select(`id, nombre, description, order_index, node_id, nodes(id, name, order_index, level_id, levels(id, name, level_number))`).eq(`nodes.route_version_id`,t).eq(`activo`,!0).order(`order_index`);if(n)throw n;r=(e??[]).filter(e=>e.nodes!==null).map(e=>({id:e.id,nombre:e.nombre||e.description,node:e.nodes}))}let i=await I(n),a=r.map(t=>{let n=`${e}_${t.id}`,r=i[n]||null,a=we(r?.status||`not_started`);return{id:t.id,nombre:t.nombre,node:t.node,latestStatus:r?.status||`not_started`,latestObs:r?.observation||``,latestEvidence:r?.evidence_url||``,semColor:a.color,semIcon:a.icon,history:r?[r]:[]}}),o=a.filter(e=>e.latestStatus===`achieved`||e.latestStatus===`exceeded`).length,s=a.length;return{indicatorSummaries:a,dominados:o,total:s,avance:s>0?Math.round(o/s*100):0,pendingTasks:[]}}function W(e,t){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">${U(xe(e.nombre_completo))}</div>
      <div>
        <div class="pm-student-panel__name">${U(e.nombre_completo)}</div>
        <div class="pm-student-panel__meta">Avance: ${t}%</div>
        <div class="pm-student-panel__progress-bar">
          <div class="pm-student-panel__progress-fill" style="width:${t}%"></div>
        </div>
      </div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
  `}function Ee(e,t){return`
    <div class="pm-timeline-actions">
      <button class="pm-btn-add-eval" data-action="new-eval" data-idx="${t}">
        <i class="bi bi-plus-circle"></i> Nueva evaluación
      </button>
    </div>
    <ul class="pm-eval-timeline">
      ${e.map((e,n)=>`
    <li class="pm-eval-timeline__item">
      <div class="pm-eval-timeline__header">
        <span class="pm-eval-timeline__date">${U(Se(e.updated_at||e.created_at))}</span>
        <button class="pm-eval-timeline__edit" data-action="edit-eval" data-idx="${t}" data-hidx="${n}">
          <i class="bi bi-pencil"></i>
        </button>
      </div>
      <span class="pm-eval-timeline__nota">Estado: ${we(e.status).label}</span>
      ${e.observation?`<span class="pm-eval-timeline__detail">${U(e.observation)}</span>`:``}
      ${e.evidence_url?`<span class="pm-eval-timeline__detail"><strong>Evidencia:</strong> <a href="${e.evidence_url}" target="_blank">Ver Enlace</a></span>`:``}
    </li>
  `).join(``)||`<p class="pm-empty-history">Sin evaluaciones registradas</p>`}
    </ul>
  `}function De(e){return e.length?e.map((e,t)=>`
    <div class="pm-route-indicador pm-route-indicador--${U(e.semColor)}"
         data-action="toggle-history"
         data-idx="${t}"
         role="button"
         tabindex="0"
         aria-expanded="false">
      <span class="pm-route-indicador__icon">${e.semIcon}</span>
      <div class="pm-route-indicador__info">
        <span class="pm-route-indicador__name">${U(e.nombre)}</span>
        <span class="pm-route-indicador__stats">
          ${e.latestStatus===`not_started`?`Sin evaluar`:`Estado: ${we(e.latestStatus).label}`}
          · ${e.history.length} registro${e.history.length===1?``:`s`}
        </span>
      </div>
    </div>
    <div class="pm-route-indicador__timeline" data-timeline="${t}" hidden>
      ${Ee(e.history,t)}
    </div>
  `).join(``):`<p style="padding:8px">No hay indicadores cargados para este nivel.</p>`}function G(e,{indicatorSummaries:t,avance:n}){return`
    ${W(e,n)}
    <div class="pm-student-panel__body">
      <section class="pm-student-panel__section">
        <h3 class="pm-student-panel__section-title">Progreso Curricular (Semáforo)</h3>
        <div class="pm-route-map">
          ${De(t)}
        </div>
      </section>
    </div>
  `}function Oe(){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">…</div>
      <div><div class="pm-student-panel__name">Cargando…</div></div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
    <div class="pm-student-panel__body" style="padding:16px;color:var(--color-text-muted,#888)">
      Cargando progreso del alumno…
    </div>
  `}function ke(e){return`
    <div class="pm-student-panel__header">
      <div class="pm-student-panel__avatar">!</div>
      <div><div class="pm-student-panel__name">Error</div></div>
      <button class="pm-student-panel__close" data-action="close" aria-label="Cerrar">×</button>
    </div>
    <div class="pm-student-panel__body" style="padding:16px;color:#c00">
      ${U(e)}
    </div>
  `}function Ae({alumno:e,rutaId:t,sessionId:n,claseId:r,fecha:i,horaInicio:a,onProgressSaved:o}){be();let s=document.createElement(`aside`);s.className=`pm-student-panel`,s.setAttribute(`role`,`dialog`),s.setAttribute(`aria-modal`,`false`),s.setAttribute(`aria-label`,`Progreso de ${e.nombre_completo}`),document.body.appendChild(s);let c=[],l=null;function d(){P()===`desktop`?s.classList.add(`pm-student-panel--desktop`):s.classList.remove(`pm-student-panel--desktop`)}let f=N(d);d();function p(e){let t=e.target.closest(`[data-action]`);if(!t)return;let n=t.dataset.action;if(n===`close`){v();return}if(n===`toggle-history`){let e=t.dataset.idx,n=s.querySelector(`[data-timeline="${e}"]`);if(!n)return;let r=!n.hidden;n.hidden=r,t.setAttribute(`aria-expanded`,String(!r));return}if(n===`new-eval`){let e=t.dataset.idx;m(e);return}if(n===`edit-eval`){let e=t.dataset.idx,n=t.dataset.hidx;m(e,n);return}}async function m(e,t=null){let n=c[e],r=t===null?null:n.history[t],i=r?.status??`not_started`,a=document.createElement(`div`);a.className=`pm-student-panel__modal-overlay pm-animate-fade-in`,a.innerHTML=`
      <div class="pm-student-panel__modal-content">
        <div class="pm-student-panel__modal-header">
          <h4>${r?`Editar`:`Nueva`} Evaluación</h4>
          <button class="pm-student-panel__modal-close" data-action="modal-close">&times;</button>
        </div>
        <p class="pm-student-panel__modal-indicator-name">${U(n.nombre)}</p>
        
        <div class="pm-student-panel__modal-body">
          <div class="pm-student-panel__modal-field">
            <label>Nivel de Logro (Semáforo)</label>
            <div class="pm-student-panel__status-grid">
              ${Object.entries(Ce).map(([e,t])=>`
                <button class="pm-student-panel__status-btn ${i===e?`active`:``} ${e}" data-status="${e}">
                  <span>${t.icon}</span>
                  <span>${t.label}</span>
                </button>
              `).join(``)}
            </div>
          </div>
          
          <div class="pm-student-panel__modal-field">
            <label>Observaciones / Evidencia</label>
            <textarea id="modal-obs" rows="3" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 12px; font-size: 0.9rem; resize: none; outline: none;" placeholder="Comentarios sobre el desempeño...">${r?U(r.observation):``}</textarea>
          </div>
          
          <div class="pm-student-panel__modal-field">
            <label>Enlace de Evidencia (Video/Audio)</label>
            <input type="text" id="modal-evidence" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; padding: 10px; font-size: 0.9rem; outline: none;" placeholder="URL de video o audio en drive/supabase..." value="${r?U(r.evidence_url):``}">
          </div>
        </div>

        <div class="pm-student-panel__modal-footer">
          <button class="pm-btn pm-btn-outline" data-action="modal-close">Cancelar</button>
          <button class="pm-btn pm-btn-primary" data-action="modal-save">
            ${r?`Actualizar`:`Guardar`}
          </button>
        </div>
      </div>
    `,document.body.appendChild(a),a.addEventListener(`click`,async e=>{let t=e.target.closest(`[data-status]`);if(t){a.querySelectorAll(`[data-status]`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),i=t.dataset.status;return}let r=e.target.closest(`[data-action]`)?.dataset.action;if(r===`modal-close`)a.remove();else if(r===`modal-save`){let e=a.querySelector(`#modal-obs`).value,t=a.querySelector(`#modal-evidence`).value;await g(n.id,i,e,t),a.remove()}}),a.addEventListener(`click`,e=>{e.target===a&&a.remove()})}async function g(t,r,i,a){try{if(!u())throw Error(`No hay sesión de maestro activa.`);await re(e.id,t,r,i.trim(),a.trim(),n),typeof o==`function`&&await o({alumnoId:e.id,indicatorId:t,status:r}),await _()}catch(e){console.error(`[studentProgressPanel] Error saving:`,e),alert(`Error al guardar: `+(e.message||e))}}s.addEventListener(`click`,p),s.addEventListener(`keydown`,e=>{if(e.key===`Enter`||e.key===` `){let t=e.target.closest(`[data-action="toggle-history"]`);t&&(e.preventDefault(),t.click())}});async function _(){s.innerHTML=Oe(),s.classList.add(`pm-student-panel--open`),l&&l.dispose(),l=h(s,{onClose:()=>v()});try{let n=await Te(e.id,t,r);c=n.indicatorSummaries,s.innerHTML=G(e,n)}catch(e){console.error(`[studentProgressPanel] Error loading:`,e),s.innerHTML=ke(e?.message??`Error desconocido al cargar datos.`)}}function v(){s.classList.remove(`pm-student-panel--open`),l&&=(l.dispose(),null),setTimeout(()=>{s.classList.contains(`pm-student-panel--open`)||(s.innerHTML=``,c=[])},300)}function y(){l&&=(l.dispose(),null),f(),s.removeEventListener(`click`,p),s.remove()}return{open:_,close:v,destroy:y}}var je={LOGRADO:{label:`LOGRADO`,cls:`ssp-estado-logrado`},EN_PROGRESO:{label:`EN_PROGRESO`,cls:`ssp-estado-en-progreso`},INICIADO:{label:`INICIADO`,cls:`ssp-estado-iniciado`},MIXTO:{label:`MIXTO`,cls:`ssp-estado-mixto`}},Me={LOGRADO:`ssp-chip-logrado`,EN_PROGRESO:`ssp-chip-en-progreso`,INICIADO:`ssp-chip-iniciado`},Ne={LOGRADO:`LOGRADO`,EN_PROGRESO:`EN_PROGRESO`,INICIADO:`INICIADO`,MIXTO:`MIXTO`};function Pe(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function Fe(e){return(e||``).trim().toLowerCase()}function Ie(e){let t=new Map;for(let n of e){let e=Fe(n.contenido_dsl);if(e)if(!t.has(e))t.set(e,{contenido:n.contenido_dsl,estado:n.estado_cualitativo,alumnos:[{id:n.alumno_id,nombre:n.alumno_nombre||`Alumno`,estado:n.estado_cualitativo}],observaciones:n.observaciones||null,tarea:n.tarea||null});else{let r=t.get(e);r.alumnos.push({id:n.alumno_id,nombre:n.alumno_nombre||`Alumno`,estado:n.estado_cualitativo}),r.estado!==`MIXTO`&&r.estado!==n.estado_cualitativo&&(r.estado=`MIXTO`),!r.observaciones&&n.observaciones&&(r.observaciones=n.observaciones),!r.tarea&&n.tarea&&(r.tarea=n.tarea)}}return Array.from(t.values())}function Le(){let e=null,t=[];function n(e,n){let r=[`📚 Clase ${e} — ${(()=>{try{let[e,t,r]=n.split(`-`);return`${r}/${t}/${e}`}catch{return n}})()}`];for(let e of t){let t=Ne[e.estado]||e.estado,n=e.estado===`MIXTO`?e.alumnos.map(e=>{let t=Ne[e.estado]||e.estado;return`${e.nombre} (${t})`}).join(`, `):e.alumnos.map(e=>e.nombre).join(`, `);r.push(``),r.push(`🔹 ${e.contenido} — ${t}`),r.push(`   Alumnos: ${n}`),e.tarea&&r.push(`   📝 Tarea: ${e.tarea}`)}return r.push(``,`🎯 El Sistema PC`),r.join(`
`)}function r(e,t){let n=je[e.estado]||je.EN_PROGRESO,r=e.alumnos.length,i=e.estado===`MIXTO`,a=e.alumnos.map(e=>`<span class="${i?`ssp-alumno-chip ${Me[e.estado]||``}`:`ssp-alumno-chip`}">${Pe(e.nombre)}</span>`).join(``),o=e.observaciones?`<div class="ssp-group-obs">${Pe(e.observaciones)}</div>`:``,s=e.tarea?`<div class="ssp-group-tarea">📝 Tarea: ${Pe(e.tarea)}</div>`:``;return`
      <div class="ssp-group">
        <div class="ssp-group-header">
          <span class="ssp-group-contenido">${Pe(e.contenido)}</span>
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
            <div class="ssp-subtitle">${Pe(i)} · ${Pe(a)}</div>
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
    `,Re(),e.querySelector(`#ssp-whatsapp`).onclick=()=>{let e=n(i,a);window.open(`https://wa.me/?text=${encodeURIComponent(e)}`,`_blank`)},e.querySelector(`#ssp-close`).onclick=o,e.querySelector(`.ssp-backdrop`).onclick=o}async function a({sesionId:n,claseNombre:r,fecha:a,supabase:s}){e||(e=document.createElement(`div`),e.className=`ssp-wrapper`,document.body.appendChild(e)),e.style.display=`flex`,e.innerHTML=`
      <div class="ssp-backdrop"></div>
      <div class="ssp-dialog">
        <div class="ssp-header">
          <span class="ssp-icon">📊</span>
          <div><strong>Resumen Pedagógico</strong><div class="ssp-subtitle">${Pe(r)}</div></div>
        </div>
        <div class="ssp-loading">Cargando registros...</div>
      </div>
    `,Re(),e.querySelector(`.ssp-backdrop`).onclick=o;let{data:c,error:l}=await s.from(`progresos`).select(`id, alumno_id, contenido_dsl, estado_cualitativo, observaciones, indicadores`).eq(`sesion_clase_id`,n).order(`created_at`,{ascending:!0});if(l){console.error(`[SessionSummaryPanel] Error cargando progresos:`,l),t=[],i(r,a);return}let u=(c||[]).map(e=>({id:e.id,alumno_id:e.alumno_id,contenido_dsl:e.contenido_dsl,estado_cualitativo:e.estado_cualitativo||`EN_PROGRESO`,observaciones:e.observaciones,tarea:e.indicadores?.tarea||null})),d=[...new Set(u.map(e=>e.alumno_id).filter(Boolean))];if(d.length>0){let{data:e}=await s.from(`alumnos`).select(`id, nombre_completo`).in(`id`,d),t=new Map((e||[]).map(e=>[e.id,e.nombre_completo]));u.forEach(e=>{e.alumno_nombre=t.get(e.alumno_id)||`Alumno`})}t=Ie(u),i(r,a)}function o(){e&&(e.style.display=`none`,e.innerHTML=``),t=[]}return{open:a,close:o}}function Re(){if(document.getElementById(`ssp-styles`))return;let e=document.createElement(`style`);e.id=`ssp-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}var ze=`documentos`;async function Be(e,t=`justificaciones`){let n=e.name.split(`.`).pop(),r=`${t}/${`${Date.now()}_${Math.random().toString(36).slice(2)}.${n}`}`,{data:i,error:a}=await l.storage.from(ze).upload(r,e,{cacheControl:`3600`,upsert:!1});if(a)throw a;let{data:o}=l.storage.from(ze).getPublicUrl(r);return o.publicUrl}async function Ve({sesionId:e,alumnoId:t,claseId:n,fecha:r,motivo:i,evidenciaBase64:a,creadoPor:o},s=null){let c=[];if(e||c.push(`sesionId`),t||c.push(`alumnoId`),r||c.push(`fecha`),i||c.push(`motivo`),o||c.push(`creadoPor`),c.length>0)return{error:{message:`Faltan campos requeridos: ${c.join(`, `)}`}};let u=null;if(s)try{u=await Be(s)}catch(e){console.warn(`[JustificacionService] Error subiendo evidencia a Storage:`,e)}let d={sesion_id:e,alumno_id:t,clase_id:n||null,fecha:r,motivo:i,evidencia_url:u||null,evidencia_base64:null,creado_por:o,estado:`pendiente`},{data:f,error:p}=await l.from(`justificaciones`).upsert([d],{onConflict:`sesion_id,alumno_id`,ignoreDuplicates:!1}).select().single();return{data:f,error:p}}async function He(e,t){if(!e||!t)return null;let{data:n,error:r}=await l.from(`justificaciones`).select(`*`).eq(`sesion_id`,e).eq(`alumno_id`,t).single();return r&&r.code!==`PGRST116`?(console.warn(`[JustificacionService] Error obteniendo justificación:`,r),null):n||null}async function Ue(e){if(!e)return{error:{message:`ID requerido`}};let{error:t}=await l.from(`justificaciones`).delete().eq(`id`,e);return{error:t}}function We(){let e=Promise.resolve();return{run(t){if(typeof t!=`function`)throw TypeError(`asyncMutex.run expects a function`);let n=e.then(()=>t());return e=n.then(()=>{},()=>{}),n}}}function K(e){return(e||``).toLowerCase().normalize(`NFD`).replace(/[̀-ͯ]/g,``).trim()}function Ge(e,t){let n=K(e);return t.find(e=>K(e.nombre)===n||K(e.nombreCorto||e.nombre.split(` `)[0])===n||n.length>=3&&K(e.nombre).includes(n)||n.length>=3&&n.includes(K(e.nombreCorto||e.nombre.split(` `)[0])))??null}function Ke(e,t){let n=[],r=[];for(let i of e){if(K(i)===`todos`){n.push(...t);continue}let e=Ge(i,t);e?n.push(e):r.push(`No se encontró el alumno: "${i}"`)}let i=new Set;return{resolved:n.filter(e=>i.has(e.id)?!1:(i.add(e.id),!0)),errors:r}}async function qe(e){if(e.length===0)return{data:[],error:null};let t=new Set,n=e.filter(e=>{let n=`${e.alumno_id}|${e.clase_id}|${e.sesion_clase_id}|${e.contenido_dsl}`;return t.has(n)?!1:(t.add(n),!0)}),{data:r,error:i}=await l.from(`progresos`).upsert(n,{onConflict:`alumno_id,clase_id,sesion_clase_id,contenido_dsl`,ignoreDuplicates:!1}).select(`id, alumno_id, contenido_dsl, estado_cualitativo`);return{data:r,error:i}}async function Je({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,contenido:i,evaluaciones:a,alumnos:o}){if(!a||a.length===0||!t)return{saved:0,error:null};let s=(a||[]).flatMap(e=>{if(e.seccion&&!e.alumno_id&&o&&o.length>0){let t=T(e.seccion,o);return t.length===0?[]:t.map(t=>({...e,alumno_id:t.id,seccion:void 0}))}return e}).map(a=>{let o=`EN_PROGRESO`;return a.nota!==null&&a.nota!==void 0&&(o=a.nota>=4?`LOGRADO`:a.nota>=2?`EN_PROGRESO`:`INICIADO`),{alumno_id:a.alumno_id,clase_id:t,sesion_clase_id:e,maestro_id:n,fecha_evaluacion:r,evaluacion_tipo:`observacion`,estado_cualitativo:o,calificacion:a.nota??null,contenido_dsl:i||``,observaciones:a.observacion||null,indicadores:{tipo:`tecnica`,es_colectivo:!1,tarea:a.tarea||null},objetivo_id:null}});try{let{data:e,error:t}=await qe(s);return t?(console.error(`[Progress] saveProgressFromEvaluaciones error:`,t),{saved:0,error:t.message}):{saved:(e||[]).length,error:null}}catch(e){return console.error(`[Progress] saveProgressFromEvaluaciones exception:`,e),{saved:0,error:e.message}}}async function Ye({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,progressRecords:i,alumnos:a}){if(!i||i.length===0)return{saved:[],errors:[]};if(!t)return console.warn(`[Progress] Skip saveProgressFromAI — emergente session sin clase_id`),{saved:[],errors:[]};let o=[],s=[];for(let c of i){let{resolved:i,errors:l}=Ke(c.alumnos||[],a);s.push(...l);for(let a of i)o.push({alumno_id:a.id,clase_id:t,sesion_clase_id:e,maestro_id:n,fecha_evaluacion:r,evaluacion_tipo:`observacion`,estado_cualitativo:c.estado||`EN_PROGRESO`,calificacion:c.nota??null,contenido_dsl:c.contenido||``,observaciones:c.observacion||null,indicadores:{tipo:c.tipo||`otro`,es_colectivo:c.es_colectivo??!1,tarea:c.tarea||null},objetivo_id:null})}try{let{data:e,error:t}=await qe(o);if(t)throw t;return{saved:(e||[]).map(e=>({alumnoId:e.alumno_id,contenido:e.contenido_dsl,estado:e.estado_cualitativo})),errors:s}}catch(e){return console.warn(`[Progress] Error al guardar progreso:`,e.message),{saved:[],errors:[...s,e.message]}}}async function Xe({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,dslText:i,alumnos:a}){if(!i||!i.trim())return{saved:[],errors:[]};if(!t)return console.warn(`[Progress] Skip saveProgressFromDSL — emergente session sin clase_id`),{saved:[],errors:[]};let o=i.split(`
`),s=[];for(let e of o){let t=ae(e);if(!t.estados||t.estados.length===0||!t.contenido||t.contenido.length===0)continue;let n=t.estados[0],r=t.contenido[0],i=t.alumnos.length>0?t.alumnos:[`todos`],a=t.calificacion?.valor??null;s.push({alumnos:i,contenido:r,tipo:`tecnica`,estado:n,nota:a,tarea:t.tareas[0]||null,observacion:t.sugerencias[0]||null,es_colectivo:i.includes(`todos`)})}return s.length===0?{saved:[],errors:[]}:Ye({sesionId:e,claseId:t,maestroId:n,fechaHoy:r,progressRecords:s,alumnos:a})}async function Ze({claseId:e,objetivos:t}){if(!e||!t||t.length===0)return{linked:0};let{data:n,error:r}=await l.from(`progresos`).select(`id, contenido_dsl`).eq(`clase_id`,e).is(`objetivo_id`,null).not(`contenido_dsl`,`is`,null).neq(`contenido_dsl`,``);if(r)return console.warn(`[Progress] linkProgresosToObjetivos fetch error:`,r.message),{linked:0};if(!n||n.length===0)return{linked:0};let i=t.map(e=>({id:e.id,norm:K(e.descripcion),raw:e.descripcion})),a=new Map;for(let e of n){let t=K(e.contenido_dsl);if(!t)continue;let n=i.find(e=>e.norm===t);if(!n&&t.length>=5&&(n=i.find(e=>e.norm.length>=5&&e.norm.includes(t))),!n&&t.length>=5&&(n=i.find(e=>e.norm.length>=5&&t.includes(e.norm))),n){let t=a.get(n.id)||[];t.push(e.id),a.set(n.id,t)}}if(a.size===0)return{linked:0};let o=0;for(let[e,t]of a.entries()){let{error:n}=await l.from(`progresos`).update({objetivo_id:e}).in(`id`,t);n?console.warn(`[Progress] linkProgresosToObjetivos update error:`,n.message):o+=t.length}return console.debug(`[Progress] linkProgresosToObjetivos: linked ${o} records`),{linked:o}}var Qe={LOGRADO:{label:`Logrado`,color:`var(--pm-success, #198754)`,bg:`#19875418`},EN_PROGRESO:{label:`En Progreso`,color:`var(--pm-primary, #0d6efd)`,bg:`#0d6efd18`},INICIADO:{label:`Iniciado`,color:`var(--pm-muted,   #6c757d)`,bg:`#6c757d18`}},$e=[`LOGRADO`,`EN_PROGRESO`,`INICIADO`];function q(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}var et={CONDUCTA:{label:`conducta`,icon:`🚨`},ATENCION:{label:`atención`,icon:`🔔`},RIESGO_PEDAGOGICO:{label:`riesgo pedagógico`,icon:`📉`}};function tt(e){let t={};for(let n of e){let e=n.alertaTipo??n.alertDetails?.type??`CONDUCTA`;t[e]=(t[e]??0)+1}return`${Object.entries(t).map(([e,t])=>{let n=et[e]??{label:e.toLowerCase(),icon:`⚠️`};return`${n.icon} ${t} ${n.label}${t>1?`s`:``}`}).join(` · `)} — revisá antes de guardar`}function nt(e,{onConfirm:t,onCancel:n}){let r=[],i=null;function a(e){let t=e.scope||(e.es_colectivo?`grupo`:`individual`),n=e.alumnos||[];if(e.requires_confirmation)return`<span class="ppp-scope-chip ppp-scope--unknown">❓ Subgrupo sin identificar</span>`;switch(t){case`grupo`:case`all`:return`<span class="ppp-scope-chip ppp-scope--all">👥 Todos los presentes</span>`;case`grupo_excluyendo`:case`group_excluding`:return`<span class="ppp-scope-chip ppp-scope--excluding">👥 Resto del grupo</span>`;case`subgrupo_indeterminado`:case`subgroup_unknown`:return`<span class="ppp-scope-chip ppp-scope--unknown">❓ Subgrupo sin identificar</span>`;default:return n.length?n.length===1?`<span class="ppp-scope-chip ppp-scope--individual">👤 ${q(n[0])}</span>`:`<span class="ppp-scope-chip ppp-scope--individual">👤 ${q(n.join(`, `))}</span>`:``}}function o(e,t){let n=Qe[e.estado]??Qe.EN_PROGRESO,r=e.nota?` · ${q(e.nota)}/5`:``,i=e.tarea?`<div class="ppp-tarea">📝 ${q(e.tarea)}</div>`:``,o=!!e.alerta,s=a(e);if(o){let n=et[e.alertaTipo]??{label:`Alerta pedagógica`,icon:`⚠️`};return`
        <div class="ppp-card ppp-card--alerta" data-idx="${t}">
          <div class="ppp-card-header">
            <span class="ppp-alerta-badge">${n.icon} ${q(n.label===`conducta`?`Conducta`:n.label===`atención`?`Atención pedagógica`:`Riesgo pedagógico`)}</span>
            <button class="ppp-remove" data-idx="${t}" title="Quitar este registro">✕</button>
          </div>
          ${s?`<div class="ppp-scope-row">${s}</div>`:``}
          <div class="ppp-card-body">
            <span class="ppp-contenido ppp-contenido--alerta">${q(e.contenido)||`—`}</span>
          </div>
          ${e.observacion?`<div class="ppp-obs ppp-obs--alerta">${q(e.observacion)}</div>`:``}
          ${i}
        </div>
      `}return`
      <div class="ppp-card" data-idx="${t}">
        <div class="ppp-card-header">
          ${s||`<span class="ppp-alumnos">${q((e.alumnos||[]).join(`, `))}</span>`}
          <button class="ppp-remove" data-idx="${t}" title="Quitar este registro">✕</button>
        </div>
        <div class="ppp-card-body">
          <span class="ppp-contenido">${q(e.contenido)||`—`}</span>
          <span class="ppp-sep">·</span>
          <button
            class="ppp-estado-btn"
            data-idx="${t}"
            style="color:${n.color};background:${n.bg};border-color:${n.color}"
            title="Click para cambiar estado"
          >${n.label}${r}</button>
        </div>
        ${e.observacion?`<div class="ppp-obs">${q(e.observacion)}</div>`:``}
        ${i}
      </div>
    `}function s(e){if(!i)return;let a=r.length>0,c=r.filter(e=>e.alerta),u=c.length>0?`<div class="ppp-alert-banner">⚠️ ${tt(c)}</div>`:``,d=D(r),f=d.length>0?`
      <div class="ppp-clarification-banner">
        <div class="ppp-clarification-title">✏️ El texto puede ser más específico</div>
        <div class="ppp-clarification-body">
          ${d.map(e=>`<div class="ppp-clarification-item">• ${q(e.reason)}</div>`).join(``)}
        </div>
        <div class="ppp-clarification-hint">Podés guardar igual o editar el texto arriba para separar mejor las ideas.</div>
      </div>
    `:``;i.innerHTML=`
      <div class="ppp-header">
        <span class="ppp-icon">🎯</span>
        <div class="ppp-header-text">
          <strong>La IA detectó estos avances</strong>
          ${e?`<div class="ppp-resumen">${q(e)}</div>`:``}
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
    `,rt(),i.querySelectorAll(`.ppp-remove`).forEach(t=>{t.onclick=()=>{r.splice(parseInt(t.dataset.idx),1),s(e)}}),i.querySelectorAll(`.ppp-estado-btn`).forEach(t=>{t.onclick=()=>{let n=parseInt(t.dataset.idx),i=r[n].estado,a=($e.indexOf(i)+1)%$e.length;r[n].estado=$e[a],s(e)}}),i.querySelector(`#ppp-confirm`).onclick=()=>{t([...r]),l()},i.querySelector(`#ppp-cancel`).onclick=()=>{n&&n(),l()}}function c({progreso:t=[],resumen:n=``}){r=t.map(e=>({...e})),i||(i=document.createElement(`div`),i.className=`pm-progress-preview`,e.appendChild(i)),i.style.display=`block`,s(n),setTimeout(()=>i.scrollIntoView({behavior:`smooth`,block:`start`}),80)}function l(){i&&(i.style.display=`none`,i.innerHTML=``)}return{open:c,close:l}}function rt(){if(document.getElementById(`ppp-alert-styles`))return;let e=document.createElement(`style`);e.id=`ppp-alert-styles`,e.textContent=`
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
  `,document.head.appendChild(e)}async function it(e,t=12){let n=new Date;n.setDate(n.getDate()-t*7);let r=n.toISOString().split(`T`)[0],{data:i,error:a}=await l.from(`progresos`).select(`
      contenido_dsl,
      tipo,
      estado_cualitativo,
      fecha_evaluacion,
      alumnos ( nombre_completo )
    `).eq(`clase_id`,e).eq(`evaluacion_tipo`,`observacion`).gte(`fecha_evaluacion`,r).not(`contenido_dsl`,`is`,null).neq(`contenido_dsl`,``).order(`fecha_evaluacion`,{ascending:!1});if(a)throw Error(`Error al obtener registros de progreso: `+a.message);if(!i||i.length===0)return{totalSesiones:0,fechaDesde:r,registros:[]};let o=new Set(i.map(e=>e.fecha_evaluacion)),s=new Map;for(let e of i){let t=(e.contenido_dsl||``).trim().toLowerCase();if(!t)continue;s.has(t)||s.set(t,{contenido_dsl:e.contenido_dsl.trim(),tipo:e.tipo||`otro`,estados:[],fechas:new Set,alumnos:new Set});let n=s.get(t);n.estados.push(e.estado_cualitativo||`EN_PROGRESO`),n.fechas.add(e.fecha_evaluacion);let r=e.alumnos?.nombre_completo;r&&n.alumnos.add(r)}let c=Array.from(s.values()).map(e=>({contenido_dsl:e.contenido_dsl,tipo:e.tipo,estado:e.estados[0]||`EN_PROGRESO`,frecuencia:e.fechas.size,alumnos:Array.from(e.alumnos)}));return c.sort((e,t)=>t.frecuencia-e.frecuencia),{totalSesiones:o.size,fechaDesde:r,registros:c}}var at={tecnica:{color:`#0d6efd`,bg:`#0d6efd15`},repertorio:{color:`#198754`,bg:`#19875415`},teoria:{color:`#fd7e14`,bg:`#fd7e1415`},interpretacion:{color:`#6f42c1`,bg:`#6f42c115`},otro:{color:`#6c757d`,bg:`#6c757d15`}},ot={alta:{label:`Foco`,color:`#dc3545`},media:{label:`Secundario`,color:`#fd7e14`},consolidacion:{label:`Consolidar`,color:`#198754`}};function st(e){return String(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function ct(e,{onAdopt:t,onCancel:n}){let r=[],i=``,a=null;function o(e,t,n){let r=ot[e.prioridad]??ot.media;return`
      <div class="cpp-objetivo-row" data-pilar="${t}" data-obj="${n}">
        <span
          class="cpp-objetivo-text"
          data-pilar="${t}"
          data-obj="${n}"
          title="Click para editar"
        >${st(e.descripcion)}</span>
        <span class="cpp-prioridad-badge" style="color:${r.color}">${r.label}</span>
        <button class="cpp-remove-obj" data-pilar="${t}" data-obj="${n}" title="Quitar objetivo">✕</button>
      </div>
    `}function s(e,t){let n=at[e.tipo]??at.otro,r=(e.objetivos||[]).map((e,n)=>o(e,t,n)).join(``);return`
      <div class="cpp-pilar" data-pilar="${t}" style="border-left:3px solid ${n.color};background:${n.bg}">
        <div class="cpp-pilar-header">
          <span
            class="cpp-pilar-title"
            data-pilar="${t}"
            title="Click para editar nombre"
          >${st(e.nombre)}</span>
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
          ${i?`<div class="cpp-resumen">${st(i)}</div>`:``}
        </div>
      </div>
      <div class="cpp-pilares">
        ${f?r.map((e,t)=>s(e,t)).join(``):`<div class="cpp-empty">La IA no detectó suficientes datos para generar una propuesta.</div>`}
      </div>
      <div class="cpp-footer">
        <div class="cpp-fields">
          <label class="cpp-field-label">Instrumento
            <input type="text" id="cpp-instrumento" class="cpp-input" value="${st(e)}" placeholder="ej. Violín" />
          </label>
          <label class="cpp-field-label">Nivel
            <input type="text" id="cpp-nivel" class="cpp-input" value="${st(o)}" placeholder="ej. Básico" />
          </label>
        </div>
        <div class="cpp-actions">
          <button class="pm-btn pm-btn-outline" id="cpp-cancel">Cancelar</button>
          <button class="pm-btn pm-btn-primary" id="cpp-adopt" ${u()?``:`disabled`}>
            ✓ Adoptar plan (${r.length} pilares)
          </button>
        </div>
      </div>
    `,a.querySelectorAll(`.cpp-pilar-title`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar),n=document.createElement(`input`);n.type=`text`,n.className=`cpp-input cpp-inline-input`,n.value=r[t].nombre,e.replaceWith(n),n.focus();let i=()=>{r[t].nombre=n.value.trim()||r[t].nombre,d(c(),l())};n.onblur=i,n.onkeydown=e=>{e.key===`Enter`&&(e.preventDefault(),i())}}}),a.querySelectorAll(`.cpp-objetivo-text`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar),n=parseInt(e.dataset.obj),i=document.createElement(`input`);i.type=`text`,i.className=`cpp-input cpp-inline-input`,i.value=r[t].objetivos[n].descripcion,e.replaceWith(i),i.focus();let a=()=>{r[t].objetivos[n].descripcion=i.value.trim()||r[t].objetivos[n].descripcion,d(c(),l())};i.onblur=a,i.onkeydown=e=>{e.key===`Enter`&&(e.preventDefault(),a())}}}),a.querySelectorAll(`.cpp-remove-obj`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar),n=parseInt(e.dataset.obj);r[t].objetivos.splice(n,1),d(c(),l())}}),a.querySelectorAll(`.cpp-remove-pilar`).forEach(e=>{e.onclick=()=>{let t=parseInt(e.dataset.pilar);r.splice(t,1),d(c(),l())}});let m=a.querySelector(`#cpp-instrumento`),h=a.querySelector(`#cpp-adopt`);m&&h&&(m.oninput=()=>{h.disabled=!u()}),h&&(h.onclick=()=>{let e=c(),n=l();if(!e){m?.focus();return}t({instrumento:e,nivel:n,resumen:i,pilares:r}),p()});let g=a.querySelector(`#cpp-cancel`);g&&(g.onclick=()=>{n&&n(),p()})}function f({pilares:t=[],resumen:n=``,instrumento:o=``,nivel:s=``}){r=t.map(e=>({...e,objetivos:(e.objetivos||[]).map(e=>({...e}))})),i=n,a||(a=document.createElement(`div`),a.className=`cpp-panel`,e.appendChild(a)),a.style.display=`block`,d(o,s),setTimeout(()=>a.scrollIntoView({behavior:`smooth`,block:`nearest`}),50)}function p(){a&&(a.style.display=`none`,a.innerHTML=``)}return{open:f,close:p}}new Date().toISOString();var lt=n({actualizarCurriculo:()=>pt,actualizarObjetivo:()=>yt,actualizarPilar:()=>gt,adoptarPropuesta:()=>xt,crearCurriculo:()=>ft,crearObjetivo:()=>vt,crearPilar:()=>ht,eliminarObjetivo:()=>bt,eliminarPilar:()=>_t,listarCurriculos:()=>dt,obtenerCurriculo:()=>ut,toggleActivoCurriculo:()=>mt});async function ut(e,t){let n=l.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo,
      curriculo_pilares (
        id, nombre, orden,
        curriculo_objetivos ( id, descripcion, orden )
      )
    `).eq(`activo`,!0);e&&(n=n.eq(`instrumento`,e)),t&&(n=n.eq(`nivel`,t));let{data:r,error:i}=await n.maybeSingle();if(i)throw i;return r||null}async function dt(){let{data:e,error:t}=await l.from(`curriculos`).select(`
      id, instrumento, nivel, descripcion, activo, created_at,
      curriculo_pilares ( curriculo_objetivos ( id ) )
    `).order(`instrumento`);if(t)throw t;return(e||[]).map(e=>({...e,total_objetivos:e.curriculo_pilares?.reduce((e,t)=>e+(t.curriculo_objetivos?.length||0),0)??0}))}async function ft({instrumento:e,nivel:t,descripcion:n}){let{data:r,error:i}=await l.from(`curriculos`).insert({instrumento:e,nivel:t,descripcion:n}).select().single();if(i)throw i;return r}async function pt(e,t){let{data:n,error:r}=await l.from(`curriculos`).update({...t,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(r)throw r;return n}async function mt(e,t){return pt(e,{activo:t})}async function ht(e,t,n=0){let{data:r,error:i}=await l.from(`curriculo_pilares`).insert({curriculo_id:e,nombre:t,orden:n}).select().single();if(i)throw i;return r}async function gt(e,t){let{data:n,error:r}=await l.from(`curriculo_pilares`).update(t).eq(`id`,e).select().single();if(r)throw r;return n}async function _t(e){let{error:t}=await l.from(`curriculo_pilares`).delete().eq(`id`,e);if(t)throw t}async function vt(e,t,n=0){let{data:r,error:i}=await l.from(`curriculo_objetivos`).insert({pilar_id:e,descripcion:t,orden:n}).select().single();if(i)throw i;return r}async function yt(e,t){let{data:n,error:r}=await l.from(`curriculo_objetivos`).update(t).eq(`id`,e).select().single();if(r)throw r;return n}async function bt(e){let{error:t}=await l.from(`curriculo_objetivos`).delete().eq(`id`,e);if(t)throw t}async function xt({instrumento:e,nivel:t,descripcion:n,pilares:r}){if(!e||e.trim()===``)throw Error(`El instrumento es obligatorio para crear el plan.`);if(!r||r.length===0)throw Error(`La propuesta debe tener al menos un pilar.`);let i=await ft({instrumento:e.trim(),nivel:t?.trim()||``,descripcion:n?.trim()||`Plan generado por IA`}),a=[];for(let e=0;e<r.length;e++){let t=r[e],n=await ht(i.id,t.nombre||`Pilar ${e+1}`,e),o=t.objetivos||[];for(let e=0;e<o.length;e++){let t=await vt(n.id,o[e].descripcion||`Objetivo ${e+1}`,e);a.push({id:t.id,descripcion:t.descripcion})}}return{curriculo:i,allObjetivos:a}}var St=lt;async function Ct(e){return St.adoptarPropuesta(e)}function wt(e){let t=(e?.nombre||``).toLowerCase();return(e?.instrumento||``).toLowerCase(),/orquesta|ensamble|ensemble|coro|ensayo/.test(t)?`ensayo_general`:/teor[ií]a|solfeo|lenguaje\s+musical/.test(t)?`teoria`:`instrumento`}function Tt(e,t){if(!e||e.length===0)return;t.parentNode.querySelectorAll(`.pm-progress-feedback`).forEach(e=>e.remove());let n=[...new Set(e.slice(0,3).map(e=>e.contenido||`progreso`))].join(` · `)+(e.length>3?` y ${e.length-3} más`:``),r=document.createElement(`div`);r.className=`pm-progress-feedback`,r.innerHTML=`<i class="bi bi-check-circle-fill"></i> <span>${e.length} registro(s) guardados — ${n}</span>`,t.parentNode.insertBefore(r,t.nextSibling),setTimeout(()=>r.remove(),4200)}function Et(e,t,n,r,i){if(!r)return`No hay datos de clase disponibles.`;let a=(e||[]).filter(e=>e.estado===`P`).length,o=(e||[]).filter(e=>e.estado===`A`).length,s=(e||[]).filter(e=>e.estado===`J`).length,c=`Reporte de Clase - ${r.nombre||`Sin nombre`}\n`;return c+=`Fecha: ${i||``}\n`,c+=`Instrumento: ${r.instrumento||`N/A`}\n\n`,c+=`RESUMEN DE ASISTENCIA
`,c+=`Presentes: ${a} | Ausentes: ${o} | Justificados: ${s}\n\n`,t&&t.trim()&&(c+=`CONTENIDO DE LA CLASE:\n${t}\n\n`),c+=`DETALLE DE ALUMNOS:
`,(e||[]).forEach(e=>{let t=(n||[]).find(t=>t.id===e.alumno_id)?.nombre_completo||`Alumno`,r=e.estado===`P`?`Presente`:e.estado===`A`?`Ausente`:`Justificado`;c+=`- ${t}: ${r}\n`}),c}function Dt(e,t,n=1800){if(t.length>n){let r=t.slice(0,n)+`…

[Texto truncado — el reporte completo excede el límite de caracteres]`;AppToast.warn(`El texto se truncó (${t.length} caracteres, máximo ${n}). Usá la opción PDF para ver el reporte completo.`),window.open(e+encodeURIComponent(r),`_blank`)}else window.open(e+encodeURIComponent(t),`_blank`)}function Ot(e,t){let{clase:n,horario:r,salonNombre:i,fechaHoy:a,totalAlumnos:o,hasConflict:s,onBack:c}=t,l=[];function u(e,t,n){e.addEventListener(t,n),l.push(()=>e.removeEventListener(t,n))}e.innerHTML=`
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
        <h2 class="pm-asist-title">${M(n.nombre)}</h2>
        <p class="pm-asist-subtitle">
          ${i?`📍 ${M(i)} · `:``}
          ${r?`${te(r.hora_inicio)} – ${te(r.hora_fin)} · `:``}
          <span style="color:var(--pm-primary); font-weight:700;">${ee(new Date(a+`T12:00:00`))}</span> · 
          ${o} alumnos
        </p>
      </div>
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div id="pm-sync-badge-container"></div>
        <button id="pm-btn-help" class="pm-help-btn" title="Guía rápida"><i class="bi bi-question-lg"></i></button>
        <div class="pm-asist-bulk-circles">
          <button id="btn-bulk-p" class="pm-bulk-circle p" title="Marcar todos presentes">P</button>
          <button id="btn-bulk-a" class="pm-bulk-circle a" title="Marcar todos ausentes">A</button>
          <button id="btn-bulk-clear" class="pm-bulk-circle clear" title="Desmarcar a todos los alumnos"><i class="bi bi-arrow-counterclockwise"></i></button>
        </div>
      </div>
    </div>
  `;let d=e.querySelector(`#pm-asist-back`);return d&&u(d,`click`,c),{destroy(){l.forEach(e=>{try{e()}catch{}}),l.length=0}}}function kt(e,{editor:t,toolbar:n}){let r=!1;return{inject(i,a){if(r||!i||i.claseId!==a)return;let o=`[${i.nombre}] `;t.insertText(o),n.setContext({indicadorActivo:i.nombre});let s=e.querySelector(`#btn-guardar-obs`);s&&(s.style.display=``);let c=e.querySelector(`#pm-dsl-editor-container`);if(c){let e=c.parentElement.querySelector(`.pm-ruta-tema-banner`);e&&e.remove();let t=document.createElement(`div`);t.className=`pm-ruta-tema-banner`,t.style.cssText=`
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
        `,c.parentElement.insertBefore(t,c)}},destroy(){r=!0}}}var At={pending:{label:`Pendiente`,icon:`⚪`,className:`pending`},viewed:{label:`Vista`,icon:`🟡`,className:`viewed`},graded:{label:`Calificada`,icon:`🟢`,className:`graded`},current:{label:`En curso`,icon:`🔵`,className:`current`}};function jt(t,n){let r=null,i=null,a={},o={},s=[],c=t.querySelector(`#pm-planificacion-card`),l=t.querySelector(`#pm-planificacion-dropdown`),u=t.querySelector(`#pm-planificacion-nombre`),d=t.querySelector(`#pm-planificacion-header`),f=t.querySelector(`#pm-route-tree-container`);d&&(d.onclick=()=>{let e=c.classList.toggle(`open`);l.style.display=e?`block`:`none`});let p=t.querySelector(`.pm-planificacion-tabs-pill`);p&&(p.style.display=`none`);let m=t.querySelector(`#pm-plan-list-rutas`);m&&(m.style.display=`none`);let h=t.querySelector(`#pm-plan-list-planificaciones`);h&&(h.style.display=`none`);let g=t.querySelector(`#pm-curriculo-proposal-trigger`);if(g&&(g.style.display=`none`),!document.getElementById(`pm-weekly-card-styles`)){let e=document.createElement(`style`);e.id=`pm-weekly-card-styles`,e.textContent=`
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
    `,document.head.appendChild(e)}function _(){return typeof n.getSessionState==`function`?n.getSessionState():{isRegistered:!1}}async function y(e){return!e||!n.claseId||!n.maestro?.id?{}:(await L(n.claseId,n.maestro.id,e).catch(()=>[])).reduce((e,t)=>(e[String(t.week_number)]=t,e),{})}function b(e){let t=o[String(e.week_number)]||null;return{...e,teacher_strategy:t?.teacher_strategy||e.teacher_strategy,student_activity:t?.student_activity||e.student_activity,homework:t?.homework||e.homework,evidence:t?.evidence||e.evidence,teacher_notes:t?.teacher_notes||``,hasTeacherAdjustment:!!t}}async function x(){try{if(c.style.display=``,r=await R(n.claseId),!r)if(v.isDemoMode)r=await ie({group_id:n.claseId,weekly_plan_id:`wplan-violin-n0`,level_id:`pnivel_001`,teacher_id:n.maestro?.id||`maestro_001`});else{u&&(u.textContent=`Sin guía ACM asignada`),f&&(f.innerHTML=`
              <div style="padding:10px;font-size:0.82rem;color:var(--pm-text-muted);">
                ACM todavía no ha asignado una guía institucional a esta clase.
              </div>
            `);return}a=await I(n.claseId).catch(()=>({})),i=r.weekly_plan_id&&await z?.(r.weekly_plan_id)||await V(r.level_id,`violín`),o=await y(r?.weekly_plan_id),u&&(u.textContent=i?.instrument?`${i.instrument} · Ruta Activa ACM`:`Ruta Activa ACM`),T()}catch(e){console.error(`[PlanificationCard] Error inicializando:`,e),f&&(f.innerHTML=`<div style="color:#ef4444;font-size:0.8rem;padding:8px;">Error al cargar planificación semanal: ${e.message}</div>`)}}function S(e,t){return Object.keys(a).some(t=>e.indicator_id?t.endsWith(`_${e.indicator_id}`)&&a[t]?.status&&a[t]?.status!==`not_started`:!1)?At.graded:e.week_number<t||e.week_number===t&&_().isRegistered?At.viewed:e.week_number===t?At.current:At.pending}function C(e){return`
      <div class="pm-weekly-box" style="margin-bottom:0;">
        <div class="pm-weekly-label">Secuencia de lo dado y calificado</div>
        <div class="pm-weekly-sequence">
          ${(i?.items||[]).map(t=>{let n=b(t),r=S(t,e);return`
              <div class="pm-weekly-sequence-item ${r.className}">
                <div>
                  <div class="pm-weekly-sequence-title">Semana ${t.week_number} · ${M(t.topic)}</div>
                  <div class="pm-weekly-sequence-meta">${M(n.assessment_method||n.evidence||`Sin evidencia registrada`)}</div>
                  ${n.hasTeacherAdjustment?`<div class="pm-weekly-chip">✍️ Ajuste docente aplicado</div>`:``}
                </div>
                <div class="pm-weekly-sequence-status">${r.icon} ${r.label}</div>
              </div>
            `}).join(``)}
        </div>
      </div>
    `}function w(t){let i=document.createElement(`div`);i.style.cssText=`position:fixed;inset:0;background:rgba(15,23,42,.72);backdrop-filter:blur(4px);z-index:2100;display:flex;align-items:center;justify-content:center;padding:16px;`,i.innerHTML=`
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
            <textarea name="teacher_strategy" rows="3" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${M(t.teacher_strategy||``)}</textarea>
          </label>
          <label style="display:grid;gap:6px;font-size:.85rem;font-weight:700;">Actividad del estudiante
            <textarea name="student_activity" rows="3" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${M(t.student_activity||``)}</textarea>
          </label>
          <label style="display:grid;gap:6px;font-size:.85rem;font-weight:700;">Tarea
            <textarea name="homework" rows="2" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${M(t.homework||``)}</textarea>
          </label>
          <label style="display:grid;gap:6px;font-size:.85rem;font-weight:700;">Evidencia esperada ajustada
            <textarea name="evidence" rows="2" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${M(t.evidence||``)}</textarea>
          </label>
          <label style="display:grid;gap:6px;font-size:.85rem;font-weight:700;">Notas pedagógicas del maestro
            <textarea name="teacher_notes" rows="3" style="width:100%;border-radius:12px;padding:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);color:inherit;">${M(t.teacher_notes||``)}</textarea>
          </label>
          <div style="display:flex;justify-content:flex-end;gap:10px;">
            <button type="button" data-close-modal style="border:1px solid rgba(255,255,255,.12);background:transparent;color:inherit;padding:10px 14px;border-radius:12px;font-weight:700;cursor:pointer;">Cancelar</button>
            <button type="submit" style="border:none;background:var(--pm-primary,#2563eb);color:#fff;padding:10px 14px;border-radius:12px;font-weight:700;cursor:pointer;">Guardar ajuste</button>
          </div>
        </form>
      </div>
    `;let a=()=>i.remove();i.querySelectorAll(`[data-close-modal]`).forEach(e=>{e.onclick=a}),i.onclick=e=>{e.target===i&&a()};let o=i.querySelector(`#pm-weekly-adjustment-form`);o.onsubmit=async i=>{i.preventDefault();let s=new FormData(o);try{await B({group_id:n.claseId,teacher_id:n.maestro?.id,weekly_plan_id:r?.weekly_plan_id,week_number:t.week_number,teacher_strategy:String(s.get(`teacher_strategy`)||``).trim(),student_activity:String(s.get(`student_activity`)||``).trim(),homework:String(s.get(`homework`)||``).trim(),evidence:String(s.get(`evidence`)||``).trim(),teacher_notes:String(s.get(`teacher_notes`)||``).trim()}),e.success(`Ajuste docente guardado sin modificar la guía ACM.`),a(),await x()}catch(t){console.error(`[PlanificationCard] Error guardando ajuste docente:`,t),e.error(t.message||`No se pudo guardar el ajuste docente.`)}},document.body.appendChild(i)}function T(){if(!f||!i)return;let e=r.current_week||1,a=(i.items||[]).find(t=>t.week_number===e),o=a?b(a):null;if(!o){f.innerHTML=`<div style="padding:10px;font-size:0.8rem;color:var(--pm-text-muted);">No hay planificación registrada para la Semana ${e}</div>`;return}let s=t.querySelector(`#pm-active-tema-badge`);s&&(s.textContent=`Semana ${e}: ${o.topic}`,s.style.display=`inline-block`),f.innerHTML=`
      <div class="pm-weekly-nav">
        <button class="pm-weekly-nav-btn prev" ${e<=1?`disabled`:``}>◀ Anterior</button>
        <span class="pm-weekly-title">Semana ${e} de ${i.items.length}</span>
        <button class="pm-weekly-nav-btn next" ${e>=i.items.length?`disabled`:``}>Siguiente ▶</button>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Tema de la Clase</div>
        <div class="pm-weekly-text">${M(o.topic)}</div>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Objetivo Pedagógico</div>
        <div class="pm-weekly-desc">${M(o.objective)}</div>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Estrategia Metodológica / Actividades</div>
        <div class="pm-weekly-desc">${M(o.teacher_strategy||`Sin estrategia registrada`)}</div>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Evidencia Requerida</div>
        <div class="pm-weekly-desc">📸 ${M(o.evidence||`Sin evidencia registrada`)}</div>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Actividad del Estudiante / Tarea</div>
        <div class="pm-weekly-desc">${M(o.student_activity||`Sin actividad registrada`)}</div>
        <div class="pm-weekly-desc" style="margin-top:8px;"><strong>Tarea:</strong> ${M(o.homework||`Sin tarea registrada`)}</div>
        ${o.teacher_notes?`<div class="pm-weekly-desc" style="margin-top:8px;"><strong>Nota docente:</strong> ${M(o.teacher_notes)}</div>`:``}
        ${o.hasTeacherAdjustment?`<div class="pm-weekly-chip">✍️ Ajuste docente aplicado sobre la guía ACM</div>`:``}
        <button type="button" class="pm-weekly-edit-btn" id="btn-edit-weekly-adjustment">Editar ajuste docente</button>
      </div>

      <div class="pm-weekly-box">
        <div class="pm-weekly-label">Indicador a Evaluar</div>
        <div class="pm-weekly-indicator-badge" id="btn-eval-indicator-weekly">
          🎯 ${M((o.topic||``).split(` `)[0]||`Indicador`)} — Evaluar
        </div>
      </div>

      ${C(e)}
    `,f.querySelector(`.pm-weekly-nav-btn.prev`).onclick=async t=>{t.stopPropagation(),e>1&&(r=await H(r.id,e-1),await x())},f.querySelector(`.pm-weekly-nav-btn.next`).onclick=async t=>{t.stopPropagation(),e<i.items.length&&(r=await H(r.id,e+1),await x())};let c=f.querySelector(`#btn-eval-indicator-weekly`);c&&(c.onclick=e=>{e.stopPropagation(),n.onIndicadorSelect?.({id:o.indicator_id,nombre:o.topic,node_id:o.node_id})});let l=f.querySelector(`#btn-edit-weekly-adjustment`);l&&(l.onclick=e=>{e.stopPropagation(),w(o)})}x();function E(){s.forEach(e=>{try{e()}catch{}}),s.length=0}return{destroy:E,getActiveIndicador:()=>{if(!i||!r)return null;let e=i.items.find(e=>e.week_number===r.current_week);return e?{id:e.indicator_id,nombre:e.topic}:null},refreshTree:async()=>{await x()},getActivePlanificacionId:()=>r?.weekly_plan_id||null}}var J=null,Y=[],Mt=null,X=-1,Nt=!1,Pt=null,Ft=!1,It=0,Lt=0;function Rt(){if(!J){if(J=document.createElement(`div`),J.id=`pm-autocomplete-popup`,J.className=`pm-autocomplete-popup`,J.style.cssText=`
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
    `,document.head.appendChild(e)}document.body.appendChild(J)}}function zt(e,t,n={}){if(Rt(),Y=e||[],Mt=t,Pt=n.trigger||null,X=-1,Nt=!0,Gt(e),n.position){let e=n.position,t=window.innerWidth,r=window.innerHeight,i=e.x,a=e.y+6;i+320>t-20&&(i=Math.max(10,e.x-320-10)),a+280>r-20&&(a=Math.max(10,e.y-280-10)),J.style.left=`${i}px`,J.style.top=`${a}px`}J.onmousedown=Bt,document.addEventListener(`mousemove`,Vt),document.addEventListener(`mouseup`,Ht),J.style.display=`block`}function Bt(e){e.target.closest(`.pm-ac-option`)||(Ft=!0,It=e.clientX-J.offsetLeft,Lt=e.clientY-J.offsetTop,J.style.cursor=`grabbing`,J.style.transition=`none`)}function Vt(e){if(!Ft)return;let t=e.clientX-It,n=e.clientY-Lt;J.style.left=`${Math.max(0,t)}px`,J.style.top=`${Math.max(0,n)}px`}function Ht(){Ft&&(Ft=!1,J.style.cursor=``)}function Ut(){J&&(J.style.display=`none`,Ft=!1,document.removeEventListener(`mousemove`,Vt),document.removeEventListener(`mouseup`,Ht)),Y=[],Mt=null,X=-1,Nt=!1,Pt=null}function Wt(e){Y=e||[],X=-1,Gt(e)}function Gt(e){if(!J)return;if(!e||e.length===0){J.innerHTML=`
      <div class="pm-ac-empty">
        <span>No hay opciones disponibles</span>
      </div>
    `;return}let t=`<div class="pm-ac-header">${Yt(Pt)}</div>`;e.forEach((e,n)=>{let r=e.nombre||e.name||e.label||e.description||``,i=e.instrumento||e.descripcion||e.codigo||e.type||``,a=n===X,o=Xt(Pt,e),s=e.is_historial?`<span class="pm-ac-badge">Reciente</span>`:``;t+=`
      <div class="pm-ac-option ${a?`selected`:``}" data-index="${n}">
        <div class="pm-ac-icon">${o}</div>
        <div class="pm-ac-text">
          <div class="pm-ac-label">${Qt(r)}</div>
          ${i?`<div class="pm-ac-sublabel">${Qt(i)}</div>`:``}
        </div>
        ${s}
      </div>
    `}),J.innerHTML=t,J.querySelectorAll(`.pm-ac-option`).forEach(e=>{e.addEventListener(`click`,()=>{Kt(parseInt(e.dataset.index,10))})})}function Kt(e){if(e>=0&&e<Y.length){let t=Y[e];Mt&&Mt(t),Ut()}}function qt(e){if(!(!Nt||Y.length===0))switch(e.key){case`ArrowDown`:e.preventDefault(),X=Math.min(X+1,Y.length-1),Gt(Y),Jt();break;case`ArrowUp`:e.preventDefault(),X=Math.max(X-1,0),Gt(Y),Jt();break;case`Enter`:e.preventDefault(),X>=0?Kt(X):Y.length>0&&Kt(0);break;case`Escape`:e.preventDefault(),Ut();break;case`Tab`:Y.length>0&&X===-1&&(e.preventDefault(),Kt(0));break}}function Jt(){if(!J||X<0)return;let e=J.querySelector(`.pm-ac-option[data-index="${X}"]`);e&&e.scrollIntoView({block:`nearest`,behavior:`smooth`})}function Yt(e){switch(e){case`#`:return`👤 Alumnos`;case`[`:return`📚 Contenidos`;case`(`:return`💡 Sugerencias`;case`{`:return`📝 Tareas`;case`$`:return`🎯 Medidas`;case`>`:return`🎓 Objetivos`;default:return`Opciones`}}function Xt(e,t){if(e===`#`){let e=t.nombre||t.name||``;return t.value===`todos`||e.toLowerCase()===`todos`?`👥`:e.charAt(0).toUpperCase()}return e===`$`?`🎯`:e===`>`&&t.level_number?t.level_number:e===`>`&&t.type?Zt(t.type):`•`}function Zt(e){return{ESCALA:`🎼`,ARPEGIO:`🎹`,MANO_IZQ:`✋`,ARCO:`🎻`,SONIDO:`🔊`,AFINACION:`🎵`,TECNICA:`⚙️`,REPERTORIO:`📖`}[e]||`•`}function Qt(e){let t=document.createElement(`div`);return t.textContent=e,t.innerHTML}function $t(){let e=window.getSelection();if(!e||e.rangeCount===0)return null;let t=e.getRangeAt(0).getBoundingClientRect();return{x:t.left,y:t.bottom}}function en(){return Nt}function tn(){return X}var nn={show:zt,hide:Ut,updateOptions:Wt,handleKeyDown:qt,getCursorPosition:$t,isOpen:en,getSelectedIndex:tn},rn=`portal-maestros-catalogs`,an=1,on={alumnos:{ttl:1440*60*1e3},contenidos:{ttl:10080*60*1e3},medidas:{ttl:720*60*60*1e3},sugerencias:{ttl:720*60*60*1e3},tareas:{ttl:720*60*60*1e3},nodos:{ttl:10080*60*1e3},niveles:{ttl:10080*60*1e3},indicadores:{ttl:10080*60*1e3},historial:{ttl:null}},sn=null;async function Z(){return sn||(sn=await g(rn,an,{upgrade(e){for(let[t,n]of Object.entries(on))if(!e.objectStoreNames.contains(t)){let n=e.createObjectStore(t,{keyPath:`id`});n.createIndex(`by_updated`,`updated_at`),t===`alumnos`&&n.createIndex(`by_clase`,`clase_id`)}}}),sn)}async function cn(e,t){let n=await Z(),r=await n.get(e,t);if(!r)return null;let i=on[e];if(i?.ttl&&r.updated_at){let a=new Date(r.updated_at).getTime()+i.ttl;if(Date.now()>a)return await n.delete(e,t),null}return r}async function ln(e){let t=await(await Z()).getAll(e),n=on[e];if(!n?.ttl)return t;let r=Date.now();return t.filter(e=>!e.updated_at||r<=new Date(e.updated_at).getTime()+n.ttl)}async function un(e,t,n){return(await Z()).getAllFromIndex(e,t,n)}async function dn(e,t){let n=await Z(),r={...t,updated_at:new Date().toISOString()};return await n.put(e,r),r}async function fn(e,t){let n=(await Z()).transaction(e,`readwrite`);for(let e of t)await n.store.put({...e,updated_at:new Date().toISOString()});await n.done}async function pn(e,t){await(await Z()).delete(e,t)}async function mn(e){await(await Z()).clear(e)}async function hn(e){let t=await Z(),n=on[e];if(!n?.ttl)return;let r=await t.getAll(e),i=Date.now();for(let a of r)a.updated_at&&i>new Date(a.updated_at).getTime()+n.ttl&&await t.delete(e,a.id)}async function gn(){let e=await Z();for(let t of Object.keys(on))await e.clear(t)}async function _n(e){return(await ln(e)).length}async function vn(e,t){let n=await Z(),r=new Date().toISOString(),i=await n.get(`historial`,e);i?(i.count=(i.count||0)+1,i.last_used=r,i.recent_selections=[t,...(i.recent_selections||[]).slice(0,9)],await n.put(`historial`,i)):await n.put(`historial`,{id:e,trigger:e,count:1,last_used:r,recent_selections:[t],updated_at:r})}async function yn(e){return(await Z()).get(`historial`,e)}async function bn(e,t=5){return(await(await Z()).getAll(`historial`)).filter(t=>t.trigger===e).sort((e,t)=>(t.count||0)-(e.count||0)).slice(0,t)}var Q={get:cn,getAll:ln,getByIndex:un,set:dn,setBulk:fn,remove:pn,clear:mn,cleanExpired:hn,clearAll:gn,getStoreSize:_n,addToHistorial:vn,getHistorial:yn,getTopUsed:bn};async function xn(e){if(!e)return[];try{let{data:t,error:n}=await l.from(`alumnos_clases`).select(`alumno_id, alumnos(id, nombre_completo, instrumento_principal)`).eq(`clase_id`,e).eq(`activo`,!0);if(n)throw n;if(t)return t.map(e=>e.alumnos).filter(Boolean).map(e=>({id:e.id,nombre:e.nombre_completo||``,instrumento:e.instrumento_principal}))}catch(e){console.warn(`[CatalogService] Error cargando alumnos:`,e)}return[]}async function Sn(){let e=await Q.getAll(`contenidos`);if(e.length>0)return e;try{let{data:e,error:t}=await l.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`contenidos`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await Q.setBulk(`contenidos`,e),e}catch(e){console.warn(`[CatalogService] Error cargando contenidos:`,e)}return[]}async function Cn(){let e=await Q.getAll(`medidas`);if(e.length>0)return e;try{let{data:e,error:t}=await l.from(`catalogos`).select(`id, nombre, codigo, categoria`).eq(`tipo`,`medidas`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await Q.setBulk(`medidas`,e),e}catch(e){console.warn(`[CatalogService] Error cargando medidas:`,e)}return[]}async function wn(){let e=await Q.getAll(`sugerencias`);if(e.length>0)return e;try{let{data:e,error:t}=await l.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`sugerencias`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await Q.setBulk(`sugerencias`,e),e}catch(e){console.warn(`[CatalogService] Error cargando sugerencias:`,e)}return[]}async function Tn(){let e=await Q.getAll(`tareas`);if(e.length>0)return e;try{let{data:e,error:t}=await l.from(`catalogos`).select(`id, nombre, descripcion`).eq(`tipo`,`tareas`).eq(`activo`,!0).order(`orden`,{ascending:!0});if(t)throw t;if(e)return await Q.setBulk(`tareas`,e),e}catch(e){console.warn(`[CatalogService] Error cargando tareas:`,e)}return[]}async function En(){let e=await Q.getAll(`niveles`);if(e.length>0)return e;try{let{data:e}=await l.from(`routes`).select(`id`).eq(`instrument`,`violín`).eq(`status`,`published`).limit(1);if(!e||e.length===0)return[];let t=e[0].id,{data:n}=await l.from(`route_versions`).select(`id`).eq(`route_id`,t).eq(`status`,`published`).order(`version`,{ascending:!1}).limit(1);if(!n||n.length===0)return[];let r=n[0].id,{data:i,error:a}=await l.from(`levels`).select(`id, level_number, name, main_objective`).eq(`route_version_id`,r).order(`level_number`,{ascending:!0});if(a)throw a;if(i)return await Q.setBulk(`niveles`,i),i}catch(e){console.warn(`[CatalogService] Error cargando niveles:`,e)}return[]}async function Dn(e=null){let t=await Q.getAll(`nodos`);if(e&&t.length>0){if(t=t.filter(t=>t.level_id===e),t.length>0)return t}else if(t.length>0)return t;try{let t=l.from(`nodes`).select(`id, name, type, is_critical, is_required, objective, level_id, order_index`);e&&(t=t.eq(`level_id`,e));let{data:n,error:r}=await t.order(`order_index`,{ascending:!0});if(r)throw r;if(n)return await Q.setBulk(`nodos`,n),n}catch(e){console.warn(`[CatalogService] Error cargando nodos:`,e)}return[]}async function On(e,t=``,n={}){let r=[];switch(e){case`#`:r=[{label:`todos`,value:`todos`,icon:`👥`,description:`Todos los presentes`}],r=r.concat(await xn(n.claseId));break;case`[`:r=await Sn();break;case`(`:r=await wn();break;case`{`:r=await Tn();break;case`$`:r=await Cn();break;case`>`:r=t.toUpperCase().startsWith(`NIVEL`)?await En():await Dn(n.nivelId);break;default:r=[]}if(t&&r.length>0&&(r=kn(r,t)),e&&e!==`#`){let t=(await Q.getTopUsed(e,3)).flatMap(e=>e.recent_selections||[]).filter(Boolean).slice(0,3);for(let e of t)r.some(t=>(t.nombre||t.name||``).toLowerCase()===e.toLowerCase())||r.unshift({nombre:e,id:`hist-${e}`,is_historial:!0})}return r}function kn(e,t,n=`nombre`){if(!t)return e;let r=t.toLowerCase(),i=r.length;return e.map(e=>{let t=(e[n]||e.name||e.nombre||``).toLowerCase(),a=0;if(t.startsWith(r))a+=10;else if(t.includes(r))a+=5;else{let e=An(t,r);if(e<=2&&i>3)a+=3-e;else return null}return t.length<20&&(a+=1),{...e,_score:a}}).filter(Boolean).sort((e,t)=>(t._score||0)-(e._score||0)).slice(0,15)}function An(e,t){let n=[];for(let e=0;e<=t.length;e++)n[e]=[e];for(let t=0;t<=e.length;t++)n[0][t]=t;for(let r=1;r<=t.length;r++)for(let i=1;i<=e.length;i++)t.charAt(r-1)===e.charAt(i-1)?n[r][i]=n[r-1][i-1]:n[r][i]=Math.min(n[r-1][i-1]+1,n[r][i-1]+1,n[r-1][i]+1);return n[t.length][e.length]}async function jn(e,t){await Q.addToHistorial(e,t)}var Mn=`
  <div class="pm-dsl-placeholder-title">✨ Escribí lo que pasó en clase con tus propias palabras</div>
  <div class="pm-dsl-placeholder-example" style="font-style:italic;color:var(--pm-text-muted,#888);font-size:0.85rem;margin-bottom:6px">
    "Yereni y Santa avanzaron muy bien hoy con el cambio de posición. Santiago necesita practicar más el arco."
  </div>
  <div class="pm-dsl-placeholder-guide">
    Presioná <strong>✨ Analizar con IA</strong> y Groq va a extraer los avances automáticamente. · O usá los tokens del toolbar si preferís escribir directo: # alumno · [] contenido · {} tarea
  </div>
`;function Nn(e,{initialContent:t=``,onChange:n,onAlumnosNeeded:r}){let i=t,a=!1,o=!1,s={};e.innerHTML=`
    <div class="pm-dsl-editor-container">
      <div
        id="pm-dsl-editable"
        class="pm-dsl-editable"
        contenteditable="true"
        spellcheck="false"
      ></div>
      <div class="pm-dsl-placeholder" id="pm-dsl-placeholder">${Mn}</div>
      <button class="pm-dsl-help-toggle" id="pm-dsl-help-toggle" title="Mostrar/Ocultar ayuda" aria-label="Mostrar/Ocultar ayuda">?</button>
    </div>
  `;let c=e.querySelector(`#pm-dsl-editable`),l=e.querySelector(`#pm-dsl-placeholder`),u=e.querySelector(`#pm-dsl-help-toggle`),d=window.innerWidth>=768;function f(){let e=d&&i.trim()===``;l.style.display=e?`block`:`none`}f(),u&&u.addEventListener(`click`,e=>{e.stopPropagation(),d=!d,f(),u.classList.toggle(`active`,d)});let p=document.createElement(`div`);p.className=`dsl-tooltip`,e.appendChild(p);function m(){i=c.innerText,f(),n&&n(i)}c.addEventListener(`mouseover`,t=>{let n=t.target.closest(`.dsl-objetivo`);if(n){let t=n.dataset.objetivo;p.textContent=`Objetivo: ${t}`,p.style.display=`block`;let r=n.getBoundingClientRect(),i=e.getBoundingClientRect();p.style.left=`${r.left-i.left}px`,p.style.top=`${r.top-i.top-25}px`}}),c.addEventListener(`mouseout`,()=>{p.style.display=`none`});function h(){if(!a&&!o){a=!0;try{let e=window.getSelection();if(!e||e.rangeCount===0)return;let t=e.getRangeAt(0),n=E(c,t);if(document.activeElement!==c||O)return;let r=window.scrollY;i=c.innerText,c.innerHTML=oe(i),D(c,n),window.scrollY!==r&&window.scrollTo({top:r,behavior:`instant`})}catch(e){console.warn(`[DSL] Error en highlight:`,e),i=c.innerText}finally{a=!1}}}function g(){let e=window.getSelection();if(!e||e.rangeCount===0)return null;let t=e.getRangeAt(0),n=document.createRange();n.selectNodeContents(c),n.setEnd(t.endContainer,t.endOffset);let r=n.toString().match(/([#([{$>])\s*([^([{$]*)$/);return r?{trigger:r[1],query:r[2]||``}:null}let _=null;c.addEventListener(`mousedown`,()=>{_=null});function v(){let e=window.getSelection();if(!e||e.rangeCount===0)return;let t=e.getRangeAt(0);_=E(c,t)}function y(){c.focus(),_!==null&&D(c,_)}let b=null;async function x(e=null){let t,n;if(e)t=e,n=``;else{let e=g();if(!e){nn.hide();return}t=e.trigger,n=e.query}try{let e=await On(t,n,s);if(e.length>0){let r=$t();r&&(v(),nn.show(e,e=>{S(e,t,n)},{trigger:t,position:r}))}else nn.hide()}catch(e){console.warn(`[DSL] Error en autocompletado:`,e)}}function S(e,t,n){let r=w(e.nombre||e.name||e.label||e.descripcion||``),i=``;switch(t){case`#`:i=r;break;case`[`:i=r+`]`;break;case`(`:i=r+`)`;break;case`{`:i=r+`}`;break;case`$`:i=e.codigo||r;break;case`>`:i=e.level_number?`NIVEL-${e.level_number}`:e.type?`NODO:${e.type}`:r;break}y();let a=window.getSelection();if(!a||a.rangeCount===0){console.warn(`[DSL] Sin selección activa al insertar autocomplete`);return}if(n.length>0){let e=a.getRangeAt(0),t=document.createRange();t.selectNodeContents(c),t.setEnd(e.endContainer,e.endOffset);let r=t.toString(),i=r.length-n.length;try{let e=document.createRange();C(c,e,i,r.length),e.deleteContents()}catch(e){console.warn(`[DSL] Error limpiando query parcial:`,e)}}T(i+` `),jn(t,r)}function C(e,t,n,r){let i=0,a=[e],o=!1;for(;a.length>0;){let e=a.pop();if(e.nodeType===3){let a=i+e.length;if(!o&&n<=a&&(t.setStart(e,n-i),o=!0),o&&r<=a){t.setEnd(e,r-i);return}i=a}else for(let t=e.childNodes.length-1;t>=0;t--)a.push(e.childNodes[t])}}function w(e){if(!e)return``;let t=document.createElement(`div`);return t.innerHTML=e,t.textContent||t.innerText||``}function T(e){let t=w(e),n=window.getSelection();if(!n||n.rangeCount===0)return;let r=n.getRangeAt(0);r.deleteContents();let i=document.createTextNode(t);r.insertNode(i),r.setStartAfter(i),r.collapse(!0),n.removeAllRanges(),n.addRange(r),m(),h()}function E(e,t){let n=t.cloneRange();return n.selectNodeContents(e),n.setEnd(t.endContainer,t.endOffset),n.toString().length}function D(e,t){let n=document.createRange(),r=window.getSelection();if(!r)return;let i=0,a=[e],o,s=!1;for(;a.length>0&&!s;)if(o=a.pop(),o.nodeType===3){let e=i+o.length;t<=e&&(n.setStart(o,t-i),n.collapse(!0),s=!0),i=e}else{let e=o.childNodes.length;for(;e--;)a.push(o.childNodes[e])}r.removeAllRanges(),r.addRange(n)}c.addEventListener(`compositionstart`,()=>{o=!0}),c.addEventListener(`compositionend`,()=>{o=!1,clearTimeout(A),O||(A=setTimeout(h,300))});let O=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),k=``,A=null;O&&c.addEventListener(`blur`,()=>{i!==k&&(k=i,h())}),c.oninput=()=>{m(),O||(clearTimeout(A),A=setTimeout(()=>{i!==k&&(k=i,h())},300)),clearTimeout(b),b=setTimeout(()=>x(),300)},c.addEventListener(`keydown`,e=>{en()&&qt(e)}),c.addEventListener(`paste`,e=>{let t=e.clipboardData?.items;if(t&&Array.from(t).some(e=>e.type&&e.type.startsWith(`image/`))){e.preventDefault();let t=document.createElement(`div`);t.className=`pm-toast-image-blocked`,t.textContent=`🚫 No puedes pegar imágenes. Usa 🎤 para grabar audio o describe el contenido.`,t.style.cssText=`position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#dc3545; color:white; padding:12px 20px; border-radius:8px; z-index:10000; font-size:14px;`,document.body.appendChild(t),setTimeout(()=>t.remove(),4e3)}});function j(e,t=0,n=null){c.focus();let r=window.getSelection();if(!r||r.rangeCount===0)return;let i=r.getRangeAt(0);i.deleteContents();let a=w(e),o=document.createTextNode(a);if(i.insertNode(o),t>0&&t<e.length){let e=document.createRange();e.setStart(o,t),e.collapse(!0),r.removeAllRanges(),r.addRange(e)}else i.setStartAfter(o),i.collapse(!0),r.removeAllRanges(),r.addRange(i);m(),h(),n&&setTimeout(()=>x(n),50)}return t&&(c.innerText=t,m(),h()),{insertText:j,getValue:()=>i,setValue:e=>{c.innerText=e,m(),h()},setContext:e=>{s=e}}}var Pn=[{trigger:`escalas`,label:`Escalas`,icon:`🎼`,expand:`[Escala Do Mayor] [Escala Re Mayor] [Escala Sol Mayor]`},{trigger:`arpegios`,label:`Arpegios`,icon:`🎹`,expand:`[Arpegio Do Mayor] [Arpegio La menor] [Arpegio Sol Mayor]`},{trigger:`tecnica`,label:`Técnica`,icon:`🎸`,expand:`$Tecnica_mano_derecha $Tecnica_mano_izquierda`},{trigger:`postura`,label:`Postura`,icon:`🧘`,expand:`$Postura_corporal $Posicion_manos`},{trigger:`evaluar`,label:`Evaluar`,icon:`📝`,expand:`4/5 (buen trabajo) {practicar 30 min diarios}`},{trigger:`mejorar`,label:`Mejorar`,icon:`💪`,expand:`(continuar mejorando la digitación) {repetir练习}`},{trigger:`ritmo`,label:`Ritmo`,icon:`🥁`,expand:`$Ritmo_binario $Ritmo_ternario`},{trigger:`dinamica`,label:`Dinámica`,icon:`🔊`,expand:`$Dinamica_piano $Dinamica_forte $Dinamica_mezzo`},{trigger:`afinacion`,label:`Afinación`,icon:`🎵`,expand:`$Afinacion_precisa $Afinacion_relativa`},{trigger:`lectura`,label:`Lectura`,icon:`📖`,expand:`[Lectura a primera vista] [Lectura de notas]`},{trigger:`respiracion`,label:`Respiración`,icon:`🌬️`,expand:`$Respiracion_diafragmatica $Respiracion_costeado`},{trigger:`memo`,label:`Memoria`,icon:`🧠`,expand:`[Técnica de memorización] {practicar de memoria}`}];function Fn(e){if(!e||e.length===0)return Pn.slice(0,6);let t=e.toLowerCase();return Pn.filter(e=>e.trigger.toLowerCase().includes(t)||e.label.toLowerCase().includes(t)).slice(0,6)}function In(e){let t=Pn.find(t=>t.trigger===e);return t?t.expand:null}function Ln(e,t={}){let n=document.getElementById(`pm-toolbar-help-modal`);if(!n&&(n=document.createElement(`div`),n.id=`pm-toolbar-help-modal`,n.className=`pm-help-modal-overlay`,n.innerHTML=`
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
      `,document.head.appendChild(e)}let r=null;function i(){n.classList.add(`open`),n.querySelector(`.pm-help-primary-btn`)?.focus(),r&&r.dispose(),r=h(n.querySelector(`.pm-help-modal`),{onClose:()=>a()})}function a(){r&&=(r.dispose(),null),n.classList.remove(`open`)}return n.querySelector(`#pm-help-close`).onclick=a,n.querySelector(`#pm-help-close-btn`).onclick=a,n.onclick=e=>{e.target===n&&a()},document.addEventListener(`keydown`,function e(t){t.key===`Escape`&&n.classList.contains(`open`)&&(a(),document.removeEventListener(`keydown`,e))}),{open:i,close:a}}function Rn(e,{onInsert:t,onLoading:n,onIaProposal:r,getEditorContent:i,aiService:a,onImproveClick:o,onStructureClick:s,onAnalyzeClick:c}){let l={presentes:[],indicadorActivo:null,indicadoresDisponibles:[]},u=[{token:`alumno`,label:`#`,title:`Etiquetar alumno`,text:`#`,offset:1,icon:`👤`,triggerAC:`#`},{token:`contenido`,label:`[ ]`,title:`Contenido de clase`,text:`[]`,offset:1,icon:`📚`,triggerAC:`[`},{token:`sugerencia`,label:`( )`,title:`Sugerencia pedagógica`,text:`()`,offset:1,icon:`💡`,triggerAC:`(`},{token:`tarea`,label:`{ }`,title:`Tarea / Asignación`,text:`{}`,offset:1,icon:`📝`,triggerAC:`{`},{token:`medida`,label:`$`,title:`Medida técnica`,text:`$`,offset:1,icon:`🎯`,triggerAC:`$`},{token:`objetivo`,label:`>`,title:`Objetivo curricular`,text:`>`,offset:1,icon:`🎓`,triggerAC:`>`}];if(e.innerHTML=`
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


    `,document.head.appendChild(e)}let d=new Map(u.map(e=>[e.token,e]));e.querySelectorAll(`.pm-dsl-tool-btn[data-token]`).forEach(e=>{e.onclick=()=>{let n=d.get(e.dataset.token);n&&(e.style.transform=`scale(0.9)`,setTimeout(()=>{e.style.transform=``},100),t(n.text,n.offset,n.triggerAC))}});async function f(){let e=i?i():``;if(e.trim()&&o)try{o(e)}catch(e){alert(`Error al generar informe: `+e.message)}}async function p(){let e=i?i():``;if(e.trim()&&s)try{s(e)}catch(e){alert(`Error al estructurar con IA: `+e.message)}}e.querySelector(`#btn-generar-informe`).onclick=f,e.querySelector(`#btn-ia-magic`).onclick=p;let m=e.querySelector(`#btn-analizar-progreso`);m&&(m.onclick=async()=>{let e=i?i():``;if(e.trim()&&c){m.disabled=!0,m.textContent=`⏳ Analizando...`;try{await c(e)}catch{}finally{m.disabled=!1,m.textContent=`✨ Analizar con IA`}}});let h=e.querySelector(`#pm-snippet-popup`);function g(n=``){let r=Fn(n);if(r.length===0){h.style.display=`none`;return}h.innerHTML=r.map(e=>`
      <div class="pm-snippet-item" data-trigger="${e.trigger}">
        <span class="pm-snippet-icon">${e.icon}</span>
        <span class="pm-snippet-label">/${e.trigger}</span>
        <span class="pm-snippet-preview">${e.label}</span>
      </div>
    `).join(``);let i=e.getBoundingClientRect(),a=i.top;h.style.position=`fixed`,h.style.left=`${i.left}px`,h.style.width=`${i.width}px`,a>220?(h.style.top=`auto`,h.style.bottom=`${window.innerHeight-i.top+8}px`,h.style.transformOrigin=`bottom left`):(h.style.bottom=`auto`,h.style.top=`${i.bottom+8}px`,h.style.transformOrigin=`top left`),h.style.display=`block`,h.querySelectorAll(`.pm-snippet-item`).forEach(e=>{e.onclick=()=>{t(In(e.dataset.trigger)+` `),_()}})}function _(){h.style.display=`none`}if(!document.getElementById(`pm-snippet-styles`)){let e=document.createElement(`style`);e.id=`pm-snippet-styles`,e.textContent=`
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
    `,document.head.appendChild(e)}e.querySelector(`#btn-snippets`).onclick=()=>{h.style.display===`block`?_():g()};let v=Ln(e);return e.querySelector(`#btn-help`).onclick=()=>{v.open()},{setContext(e={}){e.presentes!==void 0&&(l.presentes=e.presentes),e.indicadorActivo!==void 0&&(l.indicadorActivo=e.indicadorActivo),e.indicadoresDisponibles!==void 0&&(l.indicadoresDisponibles=e.indicadoresDisponibles)}}}function zn(e,t){let n=e.querySelector(`#pm-dsl-toolbar-container`),r=e.querySelector(`#pm-dsl-editor-container`),i=null,a=Nn(r,{initialContent:t.initialContent||``,onChange:e=>{t.onEditorChange?.(e)}});a.setContext({claseId:t.claseId});function o(e){i=Rn(n,{onInsert:(e,t,n)=>a.insertText(e,t,n),getEditorContent:()=>a.getValue(),onLoading:()=>{},onIaProposal:t=>e.onIaProposal?.(t),onImproveClick:t=>e.onImproveClick?.(t),onStructureClick:t=>e.onStructureClick?.(t),onAnalyzeClick:t=>e.onAnalyzeClick?.(t)})}function s(){i&&i.destroy(),a.destroy()}return{getEditor:()=>a,getToolbar:()=>i,getValue:()=>a.getValue(),setValue:e=>a.setValue(e),setContext:e=>a.setContext(e),initToolbar:o,destroy:s}}var Bn={ESC:`Escalas`,ARP:`Arpegios y patrones`,MI:`Mano izquierda`,ARC:`Arco`,SON:`Sonido`,AFI:`Afinación`,EST:`Estudios técnicos`,REP:`Repertorio`},$={EXPLICITO:`explicito`,DERIVADO:`derivado`,MANUAL:`manual`};function Vn(e){if(!e)return null;let t=String(e).match(/>([A-Z]{2,3})\b/)?.[1];return t&&Bn[t]?t:null}async function Hn(e){if(!e||!e.trim())return[];let{data:t,error:n}=await l.rpc(`fn_sugerir_nodo_por_texto`,{p_texto:e});return n?(console.warn(`[nodoSesionApi] No se pudo obtener sugerencias:`,n.message),[]):t??[]}async function Un(e){let t=Vn(e);if(t)return{codigo:t,nombre:Bn[t],origen:$.EXPLICITO,confianza:`alta`,alternativas:[]};let n=await Hn(e);if(n.length===0)return{codigo:null,nombre:null,origen:null,confianza:null,alternativas:[]};let[r,...i]=n;return{codigo:r.codigo,nombre:r.nombre,origen:$.DERIVADO,confianza:r.aciertos>=2&&(i.length===0||i[0].aciertos<r.aciertos)?`alta`:`media`,alternativas:i}}async function Wn(e,t,n=$.DERIVADO){if(!e)return null;if(t&&!Bn[t])throw Error(`Categoría desconocida: ${t}`);let{data:r,error:i}=await l.from(`sesiones_clase`).update({node_codigo:t,node_origen:t?n:null}).eq(`id`,e).select(`id, node_codigo, node_origen`).maybeSingle();if(i)throw Error(`No se pudo guardar la categoría: ${i.message}`);return r}var Gn=700;function Kn(e,n={}){let r=document.createElement(`div`);r.className=`pm-categoria-bar`,r.style.cssText=`
    margin-top: .5rem; padding: .6rem .75rem;
    border: 1px solid var(--pm-border, #dee2e6);
    border-radius: 10px;
    background: var(--pm-surface-2, rgba(255,255,255,.03));
    display: none; align-items: center; gap: .6rem; flex-wrap: wrap;
    font-size: .82rem;
  `,e.appendChild(r);let i={codigo:n.codigoInicial??null,origen:n.origenInicial??null,confirmada:!!n.codigoInicial,alternativas:[],cargando:!1},a=null,o=``;function s(){n.onChange?.({codigo:i.confirmada?i.codigo:null,origen:i.confirmada?i.origen:null})}function c(){if(!i.codigo&&!i.cargando){r.style.display=`none`,r.innerHTML=``;return}if(r.style.display=`flex`,i.cargando&&!i.codigo){r.innerHTML=`<span class="text-muted">Analizando el registro…</span>`;return}let e=Bn[i.codigo]??i.codigo;if(i.confirmada)r.innerHTML=`
        <i class="bi bi-check-circle-fill" style="color:var(--pm-success,#10b981);"></i>
        <span>Trabajo registrado en <strong>${t(e)}</strong></span>
        ${i.origen===$.EXPLICITO?`<span class="pm-cat-hint">indicado por vos con <code>&gt;`+t(i.codigo)+`</code></span>`:``}
        <button type="button" class="pm-cat-link" data-accion="cambiar">Cambiar</button>
      `;else{let n=i.alternativas.slice(0,2);r.innerHTML=`
        <i class="bi bi-lightbulb" style="color:var(--pm-warning,#f59e0b);"></i>
        <span>¿Trabajaste <strong>${t(e)}</strong>?</span>
        <button type="button" class="pm-cat-btn" data-accion="confirmar">Sí, confirmar</button>
        ${n.map(e=>`
          <button type="button" class="pm-cat-link" data-accion="elegir" data-codigo="${t(e.codigo)}">
            ${t(e.nombre)}
          </button>`).join(``)}
        <button type="button" class="pm-cat-link" data-accion="otra">Otra…</button>
      `}}function l(){let e=Object.entries(Bn).map(([e,n])=>`<button type="button" class="pm-cat-opt" data-codigo="${e}">${t(n)}</button>`).join(``);r.innerHTML=`
      <span class="text-muted">Categoría trabajada:</span>
      <div style="display:flex;flex-wrap:wrap;gap:.35rem;">${e}</div>
      <button type="button" class="pm-cat-link" data-accion="ninguna">Ninguna</button>
    `}r.addEventListener(`click`,e=>{let t=e.target.closest(`button`);if(!t)return;let{accion:n,codigo:r}=t.dataset;if(n===`confirmar`)i.confirmada=!0,i.origen=$.DERIVADO;else if(n===`elegir`)i.codigo=r,i.confirmada=!0,i.origen=$.MANUAL;else if(n===`cambiar`||n===`otra`){l();return}else if(n===`ninguna`)i.codigo=null,i.confirmada=!1,i.alternativas=[];else if(r)i.codigo=r,i.confirmada=!0,i.origen=$.MANUAL;else return;c(),s()});async function u(e){if(e!==o&&(o=e,!(i.confirmada&&i.origen===$.MANUAL))){i.cargando=!0,c();try{let t=await Un(e);t.codigo?t.origen===$.EXPLICITO?(i.codigo=t.codigo,i.origen=$.EXPLICITO,i.confirmada=!0,i.alternativas=[],s()):i.confirmada||(i.codigo=t.codigo,i.origen=t.origen,i.alternativas=t.alternativas??[]):i.confirmada||(i.codigo=null,i.alternativas=[])}catch(e){console.warn(`[CategoriaTrabajoBar]`,e.message)}finally{i.cargando=!1,c()}}}function d(e){clearTimeout(a),a=setTimeout(()=>u(e??``),Gn)}return c(),{el:r,onTextoCambia:d,analizarAhora:e=>u(e??``),getCategoria:()=>i.confirmada?{codigo:i.codigo,origen:i.origen}:{codigo:null,origen:null},destroy:()=>{clearTimeout(a),r.remove()}}}function qn(e,{onMarkAll:t,onClearAll:n}){let r=e.querySelector(`#btn-bulk-p`),i=e.querySelector(`#btn-bulk-a`),a=e.querySelector(`#btn-bulk-clear`),o=[];function s(e,t,n){e&&(e.addEventListener(t,n),o.push(()=>e.removeEventListener(t,n)))}return s(r,`click`,e=>{e.preventDefault(),t&&t(`P`)}),s(i,`click`,e=>{e.preventDefault(),t&&t(`A`)}),s(a,`click`,e=>{e.preventDefault(),n&&n()}),{destroy(){o.forEach(e=>{try{e()}catch{}}),o.length=0}}}function Jn({saveFn:e,debounceMs:t=3e4}){let n=null,r=[];function i(i){n!==null&&(clearTimeout(n),n=null),!(!i||!i.trim())&&(n=setTimeout(async()=>{n=null,await e(i),r.forEach(e=>e(i))},t))}function a(){n!==null&&(clearTimeout(n),n=null)}function o(e){r.push(e)}return{onInput:i,destroy:a,onSaved:o}}async function Yn(e,t,n){let{data:r,error:i}=await l.from(`observaciones_sesion`).select(`id`).eq(`sesion_id`,e).eq(`maestro_id`,t).eq(`es_borrador`,!0).limit(1).maybeSingle();if(i)throw i;if(r){let{data:e,error:t}=await l.from(`observaciones_sesion`).update({contenido_raw:n}).eq(`id`,r.id).select().single();if(t)throw t;return e}else{let{data:r,error:i}=await l.from(`observaciones_sesion`).insert({sesion_id:e,maestro_id:t,contenido_raw:n,es_borrador:!0}).select().single();if(i)throw i;return r}}async function Xn(e,t){let{data:n,error:r}=await l.from(`observaciones_sesion`).select(`id, contenido_raw, updated_at`).eq(`sesion_id`,e).eq(`maestro_id`,t).eq(`es_borrador`,!0).limit(1).maybeSingle();if(r)throw r;return n??null}async function Zn(e){let{error:t}=await l.from(`observaciones_sesion`).delete().eq(`id`,e);if(t)throw t}async function Qn(e,t,n,r,i=null,a=null){try{let{error:o}=await l.from(`observaciones_sesion`).delete().eq(`sesion_id`,e).eq(`maestro_id`,t).eq(`es_borrador`,!0);if(o)throw o;let{data:s,error:c}=await l.from(`observaciones_sesion`).insert({sesion_id:e,maestro_id:t,contenido_raw:n,contenido_parsed:r,contenido_ia_dsl:i,contenido_ia_mejorado:a,es_borrador:!1}).select().single();if(c)throw c;return s}catch(o){if(!navigator.onLine||o.message?.includes(`Failed to fetch`))return console.warn(`[autoDraftService] Offline, encolando saveObservation...`),await m({tabla:`observaciones_sesion`,operacion:`upsert`,payload:{sesion_id:e,maestro_id:t,contenido_raw:n,contenido_parsed:r,contenido_ia_dsl:i,contenido_ia_mejorado:a,es_borrador:!1}}),{_offline:!0,sesion_id:e};throw o}}function $n(e,{sesionId:t,maestroId:n,editor:r,sesionExistenteData:i,onDraftRecovered:a}){if(!t)return{destroy(){}};let o=null,s=!1,c=e.querySelector(`#pm-draft-indicator`);o=Jn({saveFn:async e=>{!t||s||await Yn(t,n,e)},debounceMs:3e4}),o.onSaved(()=>{if(s||!c)return;let e=new Date,t=String(e.getHours()).padStart(2,`0`),n=String(e.getMinutes()).padStart(2,`0`);c.textContent=`Borrador guardado ${t}:${n}`,c.style.display=``});let l=e.querySelector(`#pm-dsl-editable`);if(l){let e=l.oninput;l.oninput=function(t){e&&e.call(this,t),o&&!s&&o.onInput(r.getValue())}}return i?.borrador===!0&&Xn(t,n).then(e=>{if(!s&&e&&e.contenido_raw&&e.contenido_raw.trim()){let t=e.updated_at?new Date(e.updated_at).toLocaleString(`es-AR`):``;confirm(`Hay un borrador guardado${t?` (${t})`:``}.\n\n¿Deseas recuperarlo?`)?a&&a(e.contenido_raw):Zn(e.id).catch(e=>console.warn(`[autoDraft] Error discarding:`,e))}}).catch(e=>console.warn(`[autoDraft] Error loading draft:`,e)),{destroy(){s=!0,o&&o.destroy()}}}function er(e,{onSave:t,onCancel:n,onDelete:r}){let i=document.getElementById(`pm-justif-modal`);if(!i&&(i=document.createElement(`div`),i.id=`pm-justif-modal`,i.className=`pm-justif-modal-overlay`,i.innerHTML=`
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
      `,document.head.appendChild(e)}let a=null,o=null,s=null,c=null,l=!1,u=null,d=null,f=i.querySelector(`#pm-justif-title`),p=i.querySelector(`#pm-justif-subtitle`),m=i.querySelector(`#pm-justif-btn-text`),g=i.querySelector(`#pm-justif-alumno-nombre`),_=i.querySelector(`#pm-justif-motivo`),v=i.querySelector(`#pm-justif-file`),y=i.querySelector(`.pm-justif-file-placeholder`),b=i.querySelector(`.pm-justif-file-preview`),x=i.querySelector(`#pm-justif-preview-img`),S=i.querySelector(`#pm-justif-remove-file`),C=i.querySelector(`#pm-justif-delete`);function w(e,t=null,n=null){a=e,o=t,s=null,c=null,l=!!t,u=n,l?(f.textContent=`Editar Justificación`,p.textContent=`Modifica el motivo de la inasistencia`,m.textContent=`Actualizar`,C.style.display=`flex`):(f.textContent=`Justificar Inasistencia`,p.textContent=`Registra el motivo de la ausencia`,m.textContent=`Guardar Justificación`,C.style.display=`none`),g.textContent=e.nombre_completo,_.value=t?.motivo||``;let r=t?.evidencia_url||t?.evidencia_base64;r?(c=r,x.src=r,y.style.display=`none`,b.style.display=`block`):(c=null,y.style.display=`flex`,b.style.display=`none`),v.value=``,i.classList.add(`open`),_.focus();let S=i.querySelector(`.pm-justif-modal`);S&&(d&&d.dispose(),d=h(S,{onClose:()=>T(!0)}))}function T(e=!1){e&&n&&a&&u!==null&&n(a.id,u),i.classList.remove(`open`),a=null,o=null,s=null,c=null,u=null,d&&=(d.dispose(),null)}i.querySelector(`#pm-justif-close`).onclick=()=>T(!0),i.querySelector(`#pm-justif-cancel`).onclick=()=>T(!0),C.onclick=()=>{a&&confirm(`¿Eliminar la justificación de ${a.nombre_completo}?`)&&(r&&r({alumnoId:a.id,justificacionId:o?.id,existingUrl:o?.evidencia_url||o?.evidencia_base64}),T(!1))},i.querySelector(`.pm-justif-backdrop`).onclick=()=>T(!0),v.onchange=e=>{let t=e.target.files[0];t&&(s=t,c=URL.createObjectURL(t),x.src=c,y.style.display=`none`,b.style.display=`block`)},S.onclick=()=>{c&&!(o?.evidencia_url||o?.evidencia_base64)&&URL.revokeObjectURL(c),s=null,c=null,v.value=``,y.style.display=`flex`,b.style.display=`none`},i.querySelector(`#pm-justif-save`).onclick=()=>{let e=_.value.trim();if(!e){_.focus(),_.style.borderColor=`var(--pm-danger)`,setTimeout(()=>{_.style.borderColor=``},2e3);return}t&&a&&t({alumnoId:a.id,motivo:e,evidenciaFile:s,evidenciaPreview:c,justificacionId:o?.id||null,existingUrl:o?.evidencia_url||o?.evidencia_base64||null,isEdit:l})};let E=e=>{e.key===`Escape`&&(T(),document.removeEventListener(`keydown`,E))};return document.addEventListener(`keydown`,E),{open:w,close:T}}function tr(e,{sesionId:t,getSesionId:n,claseId:r,fechaHoy:i,maestroId:a,supabase:o,guardarJustificacion:s,eliminarJustificacion:c,onJustifDeleted:l,onJustifSaved:u,onJustifCancelled:d,onRenderLista:f,onUpdateProgress:p,onAutoSave:m,onAnnounce:h}){let g=!1,_=()=>typeof n==`function`?n():t,v=er(document.body,{onDelete:async({alumnoId:e,justificacionId:t,existingUrl:n})=>{if(!g){if(n){let e=n.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);e&&o.storage.from(`documentos`).remove([e[1]]).catch(()=>{})}t&&c(t).catch(console.warn),l&&l(e),f(e),p();try{await m(!0)}catch(e){console.warn(`[justif] autoSave error:`,e)}h&&h(`Justificación eliminada.`)}},onSave:async({alumnoId:e,motivo:t,evidenciaFile:n,justificacionId:c,existingUrl:l,isEdit:d})=>{if(g)return;let f=document.getElementById(`pm-justif-save`);f&&(f.disabled=!0);try{let f=null;if(d&&c){let e=l;if(n){if(l){let e=l.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);e&&await o.storage.from(`documentos`).remove([e[1]]).catch(()=>{})}let t=n.name.split(`.`).pop(),r=`justificaciones/${Date.now()}_${Math.random().toString(36).slice(2)}.${t}`,{data:i}=await o.storage.from(`documentos`).upload(r,n).catch(()=>({data:null}));if(i){let{data:t}=o.storage.from(`documentos`).getPublicUrl(i.path);e=t.publicUrl}}let{data:r,error:i}=await o.from(`justificaciones`).update({motivo:t,evidencia_url:e}).eq(`id`,c).select().single();if(i)throw i;f=r}else{let o=_();o||=(await m(!0,!1),_());let c=await s({sesionId:o,alumnoId:e,claseId:r,fecha:i,motivo:t,creadoPor:a},n);if(c.error)throw c.error;f=c.data}f&&u&&u(e,f),g||v.close()}catch(e){console.error(`[justificacion] Error guardando:`,e),alert(`Error al guardar la justificación: `+e.message)}finally{f&&(f.disabled=!1)}},onCancel:(e,t)=>{g||(d&&d(e,t),f(e),p())}});return{open(e,t,n){g||v.open(e,t,n)},close(){if(!g)try{v.close()}catch{}},destroy(){g=!0;try{v.close()}catch{}}}}function nr(e,{alumnos:t,estado:n,rutaId:r,canOpenProgressPanel:i=!!r,sesionId:a,fechaHoy:o,snapshots:s,justificaciones:l={},obtenerJustificacion:u,eliminarJustificacion:d,onEstadoChange:f,onOpenProgressPanel:p,onOpenEvaluationDrawer:m,onOpenJustifModal:h,onJustifDeleted:g,onAutoSave:_,onAnnounce:v,onUpdateSnapshots:y}){let b=e.querySelector(`#pm-alumnos-list`);if(!b)return{destroy(){},render(){}};let x=null;function S(e,t){return[...e].sort((e,n)=>{let r=t[e.id]!==null,i=t[n.id]!==null;return!r&&i?-1:r&&!i?1:e.hora_inicio&&n.hora_inicio?e.hora_inicio.localeCompare(n.hora_inicio):0})}function C(e=null){let r=S(t,n),i=null;if(e){let t=b.querySelector(`[data-id="${e}"]`);t&&(i=t.getBoundingClientRect())}if(b.innerHTML=r.map(e=>w(e,n[e.id])).join(``),e&&i){let t=b.querySelector(`[data-id="${e}"]`),n=t.getBoundingClientRect(),r=i.top-n.top;t.animate([{transform:`translateY(${r}px)`,opacity:.7},{transform:`translateY(0)`,opacity:1}],{duration:300,easing:`cubic-bezier(0.4, 0, 0.2, 1)`})}}function w(e,t){let n=t?`estado-${t.toLowerCase()}`:``,r=e.hora_inicio&&e.hora_fin?` · 🕒 ${e.hora_inicio.slice(0,5)}–${e.hora_fin.slice(0,5)}`:``;return`
      <div class="pm-asist-item ${n}" data-id="${e.id}">
        <div class="pm-asist-avatar">${e.nombre_completo[0]}</div>
        <div class="pm-asist-info">
          <span class="pm-asist-nombre">${M(e.nombre_completo)}</span>
          <span class="pm-asist-instrumento">${M(e.instrumento_principal||`—`)}${M(r)}</span>
        </div>
        <div class="pm-asist-btns">
          <button class="pm-asist-btn ${t===`P`?`active-p`:``}" data-action="P" data-id="${e.id}">P</button>
          <button class="pm-asist-btn ${t===`J`?`active-j`:``}" data-action="J" data-id="${e.id}">J</button>
          <button class="pm-asist-btn ${t===`A`?`active-a`:``}" data-action="A" data-id="${e.id}">A</button>
        </div>
    </div>
    `}return b.onclick=async e=>{let r=e.target.closest(`.pm-asist-btn`),u=e.target.closest(`.pm-asist-nombre`);if(u){let e=u.closest(`.pm-asist-item`).dataset.id,n=t.find(t=>t.id===e);if(!n)return;if(i){x&&x.destroy(),p&&p(n);return}let r=s.filter(t=>t.student_id===e);if(r.length===0)try{let{academicService:t}=await c(async()=>{let{academicService:e}=await import(`./academicService-BUoVMC5G.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([0,1,2])),n=await t.createSnapshotForStudent(a,e,o);n&&(r=n,y&&y(n))}catch(e){console.error(`Error creando snapshot on-demand:`,e)}m&&m(n,r);return}if(!r)return;let{id:b,action:S}=r.dataset;if(window.navigator.vibrate&&window.navigator.vibrate(10),S===`J`){let e=t.find(e=>e.id===b);if(!e)return;if(n[b]===`J`){f&&f(b,null);let t=l?.[b]||null;t?.id&&typeof d==`function`&&d(t.id).catch(console.warn),l&&l[b]&&delete l[b],typeof g==`function`&&g(b),C(b),_&&await _(!0),v&&v(`Justificación desmarcada para ${e.nombre_completo}.`)}else f&&f(b,`J`),C(b),_&&await _(!0),h&&h(e,null,null),v&&v(`Justificación marcada para ${e.nombre_completo}.`);return}if(f&&f(b,n[b]===S?null:S),C(b),v){let e=Object.values(n).filter(e=>e===`P`).length,t=Object.values(n).filter(e=>e===`A`).length,r=Object.values(n).filter(e=>e===`J`).length;v(`Asistencia actualizada. ${e} presentes, ${t} ausentes, ${r} justificados.`)}_&&await _(!0)},{render(e){C(e)},destroy(){b.onclick=null,x&&=(x.destroy(),null)}}}async function rr(e,t,n,r,i=`Clase`,a=null){if(!r||r.length===0)return{success:!0};let o=r;if(a&&a.length>0){let e=new Set(a.map(e=>e.id)),t=r.length;o=r.filter(t=>e.has(t.alumno_id)),o.length<t&&console.warn(`[Promotion] promocionarObservacionesAlumnos: filtrados ${t-o.length} evaluaciones de alumnos ausentes`)}let s=o.filter(e=>e.observacion&&e.observacion.trim().length>0);if(s.length===0)return{success:!0};let c=s.map(r=>new C({alumno_id:r.alumno_id,maestro_id:n,clase_id:t,sesion_clase_id:e,tipo:`academico`,titulo:`Evaluación SOI: ${i}`,descripcion:r.observacion,prioridad:`media`,estado:`abierta`,fecha_observacion:new Date().toISOString().split(`T`)[0]}).toJSON());try{let{data:e,error:t}=await l.from(`observaciones_alumnos`).upsert(c,{onConflict:`sesion_clase_id,alumno_id`});if(t)throw t;return{success:!0,data:e}}catch(e){if(!navigator.onLine||e.message?.includes(`Failed to fetch`)){console.warn(`[Promotion] Offline, encolando promoción de observaciones...`);for(let e of c)await m({tabla:`observaciones_alumnos`,operacion:`upsert`,payload:e});return{success:!0,_offline:!0,count:c.length}}return console.error(`[Promotion] Error promoviendo observaciones:`,e),{success:!1,error:e.message}}}async function ir(e,t){if(!e||!t)throw Error(`classEventId and status are required`);let{data:n,error:r}=await l.from(`class_events`).update({status:t,updated_at:new Date().toISOString()}).eq(`id`,e).select().single();if(r)throw Error(`Error updating class event status: ${r.message}`);return n}var ar={async getClasses(e=null){let t=l.from(`plan_clases`).select(`*`).eq(`activo`,!0);e&&(t=t.eq(`maestro_id`,e));let{data:n,error:r}=await t.order(`nombre`);return r?(console.error(`Error loading classes:`,r),[]):n},async resolveSmartPlan(e,t=null){let n=await this.getClasses(t||e.maestro_id);if(!n.length)return null;let r=n.find(t=>t.clase_id===e.id);if(r)return r;let i=(e.nombre||``).toLowerCase(),a=(e.instrumento||``).toLowerCase();return r=n.find(e=>(e.nombre||``).toLowerCase()===i),r||a&&(r=n.find(e=>(e.nombre||``).toLowerCase().includes(a)),r)?r:(r=n.find(e=>{let t=(e.nombre||``).toLowerCase();return i.includes(t)||t.includes(i)}),r||n[0])},async addClass(e,t=null,n=null){let r={nombre:e};t&&(r.maestro_id=t),n&&(r.clase_id=n);let{data:i,error:a}=await l.from(`plan_clases`).insert([r]).select().single();if(a)throw a;return i},async updateClass(e,t){let{error:n}=await l.from(`plan_clases`).update({nombre:t}).eq(`id`,e);if(n)throw n},async deleteClass(e){let{error:t}=await l.from(`plan_clases`).delete().eq(`id`,e);if(t)throw t},async getLevelsByClass(e){let{data:t,error:n}=await l.from(`plan_niveles`).select(`*`).eq(`clase_id`,e).order(`numero_nivel`,{ascending:!0});return n?(console.error(`Error loading levels:`,n),[]):t},async addLevel({clase_id:e,nombre:t,numero_nivel:n}){let{data:r,error:i}=await l.from(`plan_niveles`).insert([{clase_id:e,nombre:t,numero_nivel:n||1}]).select().single();if(i)throw i;return r},async updateLevel(e,t){let{error:n}=await l.from(`plan_niveles`).update(t).eq(`id`,e);if(n)throw n},async deleteLevel(e){let{error:t}=await l.from(`plan_niveles`).delete().eq(`id`,e);if(t)throw t},async getNodesByLevel(e){let{data:t,error:n}=await l.from(`plan_temas`).select(`*`).eq(`nivel_id`,e).order(`orden_index`);return n?(console.error(`Error loading topics:`,n),[]):t},async addNode({nivel_id:e,nombre:t,tipo:n}){let{data:r,error:i}=await l.from(`plan_temas`).insert([{nivel_id:e,nombre:t,tipo:n||`TECNICA`}]).select().single();if(i)throw i;return r},async updateNode(e,t){let{error:n}=await l.from(`plan_temas`).update(t).eq(`id`,e);if(n)throw n},async deleteNode(e){let{error:t}=await l.from(`plan_temas`).delete().eq(`id`,e);if(t)throw t},async getObjectivesByNode(e){let{data:t,error:n}=await l.from(`plan_objetivos`).select(`*`).eq(`tema_id`,e).order(`orden_index`);return n?(console.error(`Error loading objectives:`,n),[]):t},async addObjective({tema_id:e,nombre:t}){let{data:n,error:r}=await l.from(`plan_objetivos`).insert([{tema_id:e,nombre:t}]).select().single();if(r)throw r;return n},async updateObjective(e,t){let{error:n}=await l.from(`plan_objetivos`).update({nombre:t}).eq(`id`,e);if(n)throw n},async deleteObjective(e){let{error:t}=await l.from(`plan_objetivos`).delete().eq(`id`,e);if(t)throw t},async getIndicatorsByObjective(e){let{data:t,error:n}=await l.from(`plan_indicadores`).select(`*`).eq(`objetivo_id`,e).order(`orden_index`);return n?(console.error(`Error loading indicators:`,n),[]):t},async addIndicator({objetivo_id:e,descripcion:t,es_requerido:n}){let{data:r,error:i}=await l.from(`plan_indicadores`).insert([{objetivo_id:e,descripcion:t,es_requerido:n??!0}]).select().single();if(i)throw i;return r},async updateIndicator(e,t){let{error:n}=await l.from(`plan_indicadores`).update(t).eq(`id`,e);if(n)throw n},async deleteIndicator(e){let{error:t}=await l.from(`plan_indicadores`).delete().eq(`id`,e);if(t)throw t},async updateIndicatorCalificacion(e,t){let{error:n}=await l.from(`plan_indicadores`).update({calificacion:t}).eq(`id`,e);if(n)throw n},async getRouteHierarchy(e,t=null){let n=e;if(!n){let e=await this.getClasses(t);if(e.length>0)n=e[0].id;else return null}let{data:r,error:i}=await l.from(`plan_niveles`).select(`
        *,
        plan_temas (
          *,
          plan_objetivos (
            *,
            plan_indicadores (*)
          )
        )
      `).eq(`clase_id`,n).order(`numero_nivel`);return i?(console.error(`Error loading hierarchy:`,i),null):r},async importStructure(e,t){if(!e||!t)throw Error(`Faltan datos para la importación.`);console.log(`[Adapter] Iniciando importación masiva optimizada (4 niveles) para clase: ${e}`);for(let n of t.niveles||[]){let{data:t,error:r}=await l.from(`plan_niveles`).insert([{clase_id:e,nombre:n.nombre,numero_nivel:n.numero_nivel||1,objetivo_general:n.objetivo_general}]).select().single();if(r)throw r;let i=(n.temas||[]).map(e=>({nivel_id:t.id,nombre:e.nombre,tipo:e.tipo||`TECNICA`,es_critico:e.es_critico||!1,_originalRef:e}));if(!i.length)continue;let{data:a,error:o}=await l.from(`plan_temas`).insert(i.map(({_originalRef:e,...t})=>t)).select();if(o)throw o;for(let e=0;e<a.length;e++){let t=a[e],n=i[e]._originalRef.objetivos||[];if(!n.length)continue;let r=n.map(e=>({tema_id:t.id,nombre:e.nombre||e,_originalRef:e})),{data:o,error:s}=await l.from(`plan_objetivos`).insert(r.map(({_originalRef:e,...t})=>t)).select();if(s)throw s;let c=[];if(o.forEach((e,t)=>{let n=r[t]._originalRef;n.indicadores&&n.indicadores.length>0&&n.indicadores.forEach(t=>{c.push({objetivo_id:e.id,descripcion:t.descripcion,es_requerido:t.es_requerido??!0})})}),c.length>0){let{error:e}=await l.from(`plan_indicadores`).insert(c);if(e)throw e}}}return console.log(`[Adapter] Importación masiva (4 niveles) completada con éxito.`),!0}};function or(t,n){let r=t.querySelector(`#btn-guardar-obs`);return r?(n.rutaId&&(r.style.display=``),r.onclick=async()=>{let i=n.getEditorValue();if(!i||!i.trim()){e.warning(`El editor está vacío. Escribe observaciones antes de guardar.`);return}if(!n.sesionId){e.warning(`Primero guarda la sesión (asistencia) para poder registrar observaciones.`);return}let a=null,o=await cr(i,n),s=n.planificationCard?.getActiveIndicador();if(a=o||s,!a){e.warning(`Seleccione un indicador en la ruta antes de guardar la observación o escríbalo entre corchetes [Ejemplo].`);return}let l=t.querySelector(`#pm-active-tema-badge`);l&&a.nombre&&(l.textContent=a.nombre,l.style.display=`inline-block`),r.disabled=!0,r.textContent=`Procesando...`;try{let e=n.alumnos.filter(e=>n.estado[e.id]===`P`),o=await se(i,a.id,e,a.nombre);if(o.error)throw Error(o.error);if(o.modo===`natural`&&o.dslGenerado&&!confirm(`📝 Texto convertido a formato estructurado:

`+o.dslGenerado+`

¿Guardar la evaluación?`)){r.disabled=!1,r.textContent=`Guardar observación`;return}if(o.missing.length>0&&!confirm(`Faltan ${o.missing.length} alumno(s) sin evaluar:\n${o.missing.join(`, `)}\n\n¿Guardar de todas formas?`)){r.disabled=!1,r.textContent=`Guardar observación`;return}if(o.evaluaciones.length>0){let{error:t}=await le(n.sesionId,a.id,o.evaluaciones,n.maestro.id,e);if(t)throw t}let s={indicador_id:a.id,evaluaciones:o.evaluaciones};await Qn(n.sesionId,n.maestro.id,i,s,o.dslGenerado||null,o.textoMejorado||null);let l=ae(i);if(l.estados&&l.estados.length>0){let e=n.alumnos.map(e=>({id:e.id,nombre:e.nombre_completo||e.nombre||``,nombreCorto:(e.nombre_completo||e.nombre||``).split(` `)[0]}));Xe({sesionId:n.sesionId,claseId:n.claseId,maestroId:n.maestro.id,fechaHoy:n.fechaHoy,dslText:i,alumnos:e}).then(({saved:e,errors:t})=>{t.length&&console.warn(`[Progress DSL] Errores:`,t),e.length&&Tt(e,n.editorContainer)}).catch(e=>console.warn(`[Progress DSL] Error:`,e.message))}let u=await rr(n.sesionId,n.claseId,n.maestro.id,o.evaluaciones,n.claseNombre||`Clase`,e);if(u.success||console.warn(`[Fase C] Fallo parcial en promoción:`,u.error),n.planificationCard&&await n.planificationCard.refreshTree(),n.setEditorValue(``),n.onDslContentClear&&n.onDslContentClear(),sr(o.evaluaciones.length,a.nombre),n.activeClassEventId){try{await ir(n.activeClassEventId,`completed`)}catch(e){console.warn(`[asistencia] Error updating class event status:`,e)}if(n.activeLevel)try{let{academicService:t}=await c(async()=>{let{academicService:e}=await import(`./academicService-BUoVMC5G.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([0,1,2]));for(let r of e){let e=await t.checkLevelCompletion(r.id,n.activeLevel);if(e&&e.status===`approved`){let{createLevelCompletionModal:e}=await c(async()=>{let{createLevelCompletionModal:e}=await import(`./LevelCompletionModal-Du_KQRU_.js`);return{createLevelCompletionModal:e}},__vite__mapDeps([3,2,4])),t=e({studentId:r.id,levelId:n.activeLevel});n.onAppendModal?.(t.el||t)}}}catch(e){console.warn(`[asistencia] Error checking level completion:`,e)}}if(o.evaluaciones.length>0&&n.claseId&&a?.nombre){let{error:e}=await Je({sesionId:n.sesionId,claseId:n.claseId,maestroId:n.maestro.id,fechaHoy:n.fechaHoy,contenido:a.nombre,evaluaciones:o.evaluaciones});e&&console.warn(`[asistencia] Error al sincronizar progresos:`,e)}if(n.sesionId){let{academicService:e}=await c(async()=>{let{academicService:e}=await import(`./academicService-BUoVMC5G.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([0,1,2])),r=await e.processSessionClosure(n.sesionId);if(r&&r.length>0){let{createAchievementsSummaryModal:e}=await c(async()=>{let{createAchievementsSummaryModal:e}=await import(`./AchievementsSummaryModal-CJ9jpoV7.js`);return{createAchievementsSummaryModal:e}},__vite__mapDeps([5,4]));await e(t,r)}}r.textContent=`¡Guardado!`,setTimeout(()=>{r.textContent=`Guardar observación`,r.disabled=!1},2e3)}catch(t){console.error(`[asistencia] Error saving observation:`,t),e.error(`Error al guardar: `+(t.message||t)),r.disabled=!1,r.textContent=`Guardar observación`}},{destroy(){}}):{destroy(){}}}function sr(e,t){let n=document.createElement(`div`);n.innerHTML=`
    <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
      <span>✅ Observación guardada exitosamente (${e} eval.)</span>
      <span style="font-size:0.85em; opacity:0.9;">Tema detectado: <b>${t}</b></span>
    </div>`,n.style.cssText=`position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--pm-surface, #1e1e1e);color:#fff;padding:12px 24px;border-radius:12px;z-index:10000;font-size:14px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.3); border: 1px solid var(--apple-success, #22c55e);`,document.body.appendChild(n),setTimeout(()=>n.remove(),4500)}async function cr(e,t){let n=t.planificationCard?.getActivePlanificacionId();if(!e||!n)return null;let r=e.match(/\[(.*?)\]/);if(!r||!r[1])return null;let i=r[1].trim().toLowerCase(),a=e=>{let t=[`se`,`hizo`,`la`,`el`,`los`,`las`,`un`,`una`,`de`,`del`,`en`,`con`,`por`,`para`,`y`,`o`,`tema`,`indicador`];return e.toLowerCase().replace(/[^\w\sáéíóúñ]/g,``).split(/\s+/).filter(e=>e.length>2&&!t.includes(e))},o=a(i);if(o.length===0)return null;try{let e=await ar.getRouteHierarchy(n),t=null,r=0;for(let n of e)for(let e of n.plan_temas||[])for(let n of e.plan_objetivos||[]){let e=a(n.nombre),i=o.filter(t=>e.includes(t)).length;i>r&&(r=i,t=n)}return t}catch(e){return console.warn(`[asistencia] Error resolving indicador:`,e),null}}async function lr(e,t){if(!e)throw Error(`sesion_id es requerido`);let n={sesion_id:e,clase_id:t.clase_id,maestro_id:t.maestro_id,texto_libre:t.texto_libre??``,tareas_enviadas:t.tareas_enviadas??!1,tareas_detalle:t.tareas_detalle||null,incidencia_comportamiento:t.incidencia_comportamiento??!1,incidencia_detalle:t.incidencia_detalle||null,clase_no_realizada:t.clase_no_realizada??!1,motivo_no_realizada:t.motivo_no_realizada||null},{data:r,error:i}=await l.from(`sesion_bitacora`).upsert(n,{onConflict:`sesion_id`}).select().single();if(i)throw i;return r}async function ur(e,t,n={}){if(n.aceptadoPorMaestro!==!0)throw Error(`El texto profesionalizado por IA requiere aceptación explícita del maestro antes de guardarse (REQ-11)`);let{data:r,error:i}=await l.from(`sesion_bitacora`).update({texto_ia:t}).eq(`sesion_id`,e).select().single();if(i)throw i;return r}var dr=[{key:`tareas`,toggleId:`bitacora-toggle-tareas`,detalleId:`bitacora-detalle-tareas`,label:`Tareas enviadas`,placeholder:`Detalle de las tareas enviadas...`},{key:`incidencia`,toggleId:`bitacora-toggle-incidencia`,detalleId:`bitacora-detalle-incidencia`,label:`Incidencia de comportamiento`,placeholder:`Detalle de la incidencia...`},{key:`no-realizada`,toggleId:`bitacora-toggle-no-realizada`,detalleId:`bitacora-detalle-no-realizada`,label:`Clase no realizada`,placeholder:`Motivo por el que no se realizó la clase...`}];function fr({sesionId:e,claseId:t,maestroId:n=null,onSaved:r=null,onClosed:i=null}){document.querySelectorAll(`.bitacora-panel-overlay`).forEach(e=>e.remove());let a=document.createElement(`div`);if(a.className=`bitacora-panel-overlay`,a.innerHTML=hr(),document.body.appendChild(a),!document.getElementById(`bitacora-panel-styles`)){let e=document.createElement(`style`);e.id=`bitacora-panel-styles`,e.textContent=vr(),document.head.appendChild(e)}let o=()=>{a.remove(),i?.()};a.querySelector(`.bitacora-panel-close-x`)?.addEventListener(`click`,o),a.querySelector(`.bitacora-panel-backdrop`)?.addEventListener(`click`,o),a.querySelector(`.bitacora-panel-cancelar-btn`)?.addEventListener(`click`,o),dr.forEach(e=>pr(a,e)),a.querySelector(`.bitacora-panel-ia-btn`)?.addEventListener(`click`,async()=>{let t=a.querySelector(`.bitacora-panel-ia-btn`),n=a.querySelector(`#bitacora-texto-libre`)?.value||``;t.disabled=!0;try{let t=await b(n);mr({overlay:a,sesionId:e,textoIA:t})}catch(e){console.error(`[bitacoraSesionPanel] Error generando versión profesionalizada:`,e),gr(a,`No se pudo generar la versión profesionalizada`)}finally{t.disabled=!1}}),a.querySelector(`.bitacora-panel-guardar-btn`)?.addEventListener(`click`,async()=>{let i=a.querySelector(`.bitacora-panel-guardar-btn`);i.disabled=!0;let s={clase_id:t,maestro_id:n,texto_libre:a.querySelector(`#bitacora-texto-libre`)?.value||``,tareas_enviadas:a.querySelector(`#bitacora-toggle-tareas`)?.checked||!1,tareas_detalle:a.querySelector(`#bitacora-detalle-tareas`)?.value||null,incidencia_comportamiento:a.querySelector(`#bitacora-toggle-incidencia`)?.checked||!1,incidencia_detalle:a.querySelector(`#bitacora-detalle-incidencia`)?.value||null,clase_no_realizada:a.querySelector(`#bitacora-toggle-no-realizada`)?.checked||!1,motivo_no_realizada:a.querySelector(`#bitacora-detalle-no-realizada`)?.value||null};try{let t=await lr(e,s);r?.(t),o()}catch(e){console.error(`[bitacoraSesionPanel] Error guardando bitácora:`,e),gr(a,`No se pudo guardar la bitácora`),i.disabled=!1}})}function pr(e,t){let n=e.querySelector(`#${t.toggleId}`);n?.addEventListener(`change`,()=>{let r=e.querySelector(`.bitacora-detalle-slot[data-slot="${t.key}"]`);r&&(n.checked?r.innerHTML=`<textarea id="${t.detalleId}" class="form-control form-control-sm mt-1" rows="2" placeholder="${_r(t.placeholder)}"></textarea>`:r.innerHTML=``)})}function mr({overlay:e,sesionId:t,textoIA:n}){let r=e.querySelector(`.bitacora-ia-preview-slot`);r&&(r.innerHTML=`
    <div class="bitacora-ia-preview">${_r(n)}</div>
    <div class="bitacora-ia-preview-actions">
      <button type="button" class="btn btn-sm btn-outline-secondary bitacora-ia-descartar-btn">Descartar</button>
      <button type="button" class="btn btn-sm btn-success bitacora-ia-aceptar-btn">Aceptar y guardar</button>
    </div>
  `,r.querySelector(`.bitacora-ia-descartar-btn`)?.addEventListener(`click`,()=>{r.innerHTML=``}),r.querySelector(`.bitacora-ia-aceptar-btn`)?.addEventListener(`click`,async()=>{try{await ur(t,n,{aceptadoPorMaestro:!0}),r.innerHTML=``}catch(t){console.error(`[bitacoraSesionPanel] Error guardando versión profesionalizada:`,t),gr(e,`No se pudo guardar la versión profesionalizada`)}}))}function hr(){return`
    <div class="bitacora-panel-backdrop"></div>
    <div class="bitacora-panel-dialog">
      <div class="bitacora-panel-header">
        <h5 class="bitacora-panel-title">Bitácora de la sesión</h5>
        <button class="bitacora-panel-close-x" aria-label="Cerrar">&times;</button>
      </div>
      <div class="bitacora-panel-body">
        <div class="bitacora-panel-error-msg d-none" role="alert"></div>

        <label class="bitacora-panel-label" for="bitacora-texto-libre">Texto libre</label>
        <textarea id="bitacora-texto-libre" class="form-control" rows="4" placeholder="¿Qué pasó en la clase de hoy?"></textarea>

        <button type="button" class="btn btn-sm btn-outline-primary bitacora-panel-ia-btn mt-2">Profesionalizar con IA</button>
        <div class="bitacora-ia-preview-slot"></div>

        <hr />

        ${dr.map(e=>`
      <div class="bitacora-toggle-row">
        <label class="bitacora-toggle-label" for="${e.toggleId}">
          <input type="checkbox" id="${e.toggleId}" />
          ${_r(e.label)}
        </label>
        <div class="bitacora-detalle-slot" data-slot="${e.key}"></div>
      </div>
    `).join(``)}
      </div>
      <div class="bitacora-panel-footer">
        <button class="btn btn-outline-secondary bitacora-panel-cancelar-btn">Cancelar</button>
        <button class="btn btn-primary bitacora-panel-guardar-btn">Guardar</button>
      </div>
    </div>
  `}function gr(e,t){let n=e.querySelector(`.bitacora-panel-error-msg`);n&&(n.textContent=t,n.classList.remove(`d-none`),setTimeout(()=>n.classList.add(`d-none`),3e3))}function _r(e){return e?String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`):``}function vr(){return`
    .bitacora-panel-overlay {
      position: fixed; inset: 0; z-index: 10003;
      display: flex; align-items: center; justify-content: center; padding: 1rem;
    }
    .bitacora-panel-backdrop {
      position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
    }
    .bitacora-panel-dialog {
      position: relative; background: var(--bs-body-bg, #fff); border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); width: 100%; max-width: 560px;
      max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;
    }
    .bitacora-panel-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 1rem 1.25rem; border-bottom: 1px solid var(--bs-border-color, #dee2e6);
    }
    .bitacora-panel-title { font-size: 1.05rem; font-weight: 700; margin: 0; }
    .bitacora-panel-close-x {
      width: 32px; height: 32px; border: none; background: var(--bs-tertiary-bg, #f8f9fa);
      border-radius: 8px; cursor: pointer; font-size: 1.2rem;
    }
    .bitacora-panel-body { flex: 1; overflow-y: auto; padding: 1rem 1.25rem; }
    .bitacora-panel-label { display: block; font-size: 0.75rem; font-weight: 600; margin: 0 0 0.2rem; }
    .bitacora-panel-error-msg {
      background: #fee2e2; color: #dc2626; padding: 0.5rem 0.75rem; border-radius: 8px;
      font-size: 0.8rem; margin-bottom: 0.75rem;
    }
    .bitacora-ia-preview-slot { margin-top: 0.5rem; }
    .bitacora-ia-preview {
      background: #eef2ff; color: #3730a3; padding: 0.6rem 0.75rem; border-radius: 8px;
      font-size: 0.85rem; white-space: pre-wrap;
    }
    .bitacora-ia-preview-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; justify-content: flex-end; }
    .bitacora-toggle-row {
      padding: 0.5rem 0; border-bottom: 1px solid var(--bs-border-color, #eee);
    }
    .bitacora-toggle-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
    .bitacora-panel-footer {
      display: flex; justify-content: flex-end; gap: 0.5rem;
      padding: 0.75rem 1.25rem; border-top: 1px solid var(--bs-border-color, #dee2e6);
    }
  `}async function yr(t,{onError:n,silent:r=!1}={}){try{return await t()}catch(t){return console.error(`[safeAsync]`,t),n?n(t):r||e!==void 0&&e&&e.error(`Error inesperado: `+(t.message||t)),null}}async function br(e,{sesionId:t,fecha:n,maestro:r,router:i}){try{let{data:a,error:o}=await l.from(`sesiones_clase`).select(`*`).eq(`id`,t).single();if(o||!a){i?.navigate?i.navigate(`fechas`):window.location.hash=`#/fechas`;return}let s=new Date,c=`${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,`0`)}-${String(s.getDate()).padStart(2,`0`)}`,u=n||a.fecha||c,d={id:t,nombre:a.actividad||`Clase Emergente`,instrumento:``};localStorage.setItem(`pm_active_clase_id`,t);let f=Array.isArray(a.asistencia)?a.asistencia:[],p=f.map(e=>e.alumno_id).filter(Boolean),m=[];if(p.length>0){let{data:e}=await l.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).in(`id`,p);m=e||[]}let h={},g={};m.forEach(e=>{h[e.id]=null}),f.forEach(e=>{e.estado&&m.some(t=>t.id===e.alumno_id)&&(h[e.alumno_id]=e.estado)});let _=Sr(e,{clase:d,horario:null,alumnos:m,estado:h,justificaciones:g,maestro:r,fechaHoy:u,claseId:null,sesionId:t,hasConflict:!1,serverDSL:a.contenido||``,snapshots:[],salonNombre:null,rutaId:null,sesionExistenteData:a,router:i});return typeof _==`function`?_:void 0}catch(t){console.error(`[asistenciaView] Error en sesión emergente:`,t.message,t.stack),e.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error: ${M(t.message)}</p>`}}async function xr(e,{claseId:t,fecha:n,sesionId:s,router:c}={}){let d=typeof e==`string`?document.getElementById(e):e;if(!d){console.error(`[asistenciaView] Container not found:`,e);return}d.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let f=u();if(!f){d.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}if(!t){if(s)return br(d,{sesionId:s,fecha:n,maestro:f,router:c});c?.navigate?c.navigate(`fechas`):window.location.hash=`#/fechas`;return}localStorage.setItem(`pm_active_clase_id`,t);let p=new Date,m=`${p.getFullYear()}-${String(p.getMonth()+1).padStart(2,`0`)}-${String(p.getDate()).padStart(2,`0`)}`,h=n||m;try{let e=p.toLocaleDateString(`es-ES`,{weekday:`long`}).toLowerCase(),[n,s,u,m]=await Promise.all([i(),a([t]),o([t]),l.from(`sesiones_clase`).select(`*`).eq(`clase_id`,t).eq(`maestro_id`,f.id).eq(`fecha`,h).order(`borrador`,{ascending:!0}).order(`updated_at`,{ascending:!1})]),g=n.find(e=>e.id===t);if(!g){d.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Clase no encontrada.</p>`;return}let _=s.find(t=>t.dia?.toLowerCase()===e),v=(u||[]).map(e=>e.alumnos).filter(Boolean).sort((e,t)=>{let n=(e.instrumento_principal||``).localeCompare(t.instrumento_principal||``);return n===0?(e.nombre_completo||``).localeCompare(t.nombre_completo||``):n}),y=m.data||[],b=y[0]||null,x=(()=>{let e=new Map;for(let t of[...y].reverse())Array.isArray(t.asistencia)&&t.asistencia.forEach(t=>{t?.alumno_id&&e.set(t.alumno_id,t.estado)});return[...e.entries()].map(([e,t])=>({alumno_id:e,estado:t}))})(),S=Array.isArray(b?.asistencia)?b.asistencia.map(e=>e?.alumno_id).filter(Boolean):[];if(b?.tipo===`emergente`&&S.length>0){let e=new Set(S),t=new Set(v.map(e=>e.id)),n=S.filter(e=>!t.has(e));if(n.length>0)try{let{data:e}=await l.from(`alumnos`).select(`id, nombre_completo, instrumento_principal`).in(`id`,n);v=v.concat(e||[])}catch(e){console.warn(`[asistencia] No se pudieron cargar alumnos extra de clase emergente:`,e)}v=v.filter(t=>e.has(t.id))}let C=b?.id||null,w=b?.updated_at||null,T=b?.contenido||``,E=g.salon?[g.salon]:[],[D,O]=await Promise.all([C?l.from(`class_session_content_snapshots`).select(`*`).eq(`session_id`,C).then(e=>e.data||[]):Promise.resolve([]),E.length>0?r(E):Promise.resolve([])]),k=O.length>0?O[0].nombre:null,A=`pm_asistencia_${t||C}_${h}`,j=localStorage.getItem(`${A}_updated`),ee=!1;w&&j&&new Date(w).getTime()>new Date(j).getTime()+5e3&&(ee=!0);let M=null;try{let e=n?.find(e=>e.id===t)?.instrumento;if(e){let t=e.split(`,`)[0].trim().toLowerCase(),{data:n}=await l.from(`routes`).select(`id, route_versions!inner(id)`).ilike(`instrument`,`%${t}%`).eq(`route_versions.status`,`published`).limit(1).maybeSingle();M=n?.route_versions?.[0]?.id||n?.route_versions?.id||null}}catch(e){console.warn(`[asistencia] No se pudo resolver route_version_id:`,e)}let N={},te={};v.forEach(e=>{N[e.id]=null});let P=x,ne={presente:`P`,ausente:`A`,justificado:`J`,tarde:`T`};if(P.length===0)try{let e=null,n=y.map(e=>e.id).filter(Boolean);if(n.length>0){let{data:t}=await l.from(`asistencias`).select(`alumno_id, estado`).in(`sesion_clase_id`,n);e=t}if((!e||e.length===0)&&t&&h){let{data:n}=await l.from(`asistencias`).select(`alumno_id, estado`).eq(`clase_id`,t).eq(`fecha`,h);e=n}e?.length>0&&(P=e.map(e=>({alumno_id:e.alumno_id,estado:ne[e.estado]??e.estado})))}catch(e){console.warn(`[asistencia] No se pudo restaurar desde tabla asistencias:`,e)}P.forEach(e=>{if(Object.prototype.hasOwnProperty.call(N,e.alumno_id)){let t=ne[e.estado]??e.estado;N[e.alumno_id]=t}});let F=[];if(C)try{F=await l.from(`justificaciones`).select(`alumno_id`).eq(`sesion_id`,C).then(e=>e.data||[]),F.forEach(e=>{Object.prototype.hasOwnProperty.call(N,e.alumno_id)&&(N[e.alumno_id]=`J`)})}catch(e){console.warn(`[asistencia] No se pudieron restaurar justificaciones:`,e)}Sr(d,{clase:g,horario:_,alumnos:v,estado:N,justificaciones:te,maestro:f,fechaHoy:h,claseId:t,sesionId:C,hasConflict:ee,serverDSL:T,snapshots:D,salonNombre:k,rutaId:M,sesionExistenteData:b,router:c})}catch(e){console.error(`[asistenciaView] Error fatal:`,e.message,e.stack),d.innerHTML=`<p class="pm-empty" style="color:var(--pm-danger)">Error: ${M(e.message)}</p>`}}function Sr(t,n){let{clase:r,horario:i,alumnos:a,estado:o,justificaciones:u,maestro:d,fechaHoy:h,claseId:g,snapshots:v,serverDSL:b,hasConflict:C,salonNombre:T,rutaId:D,sesionExistenteData:j,router:ee}=n,M=n.sesionId,N=!!n.sesionId&&(j?.borrador===!1||j?.estado===`registrada`||j?.estado===`cerrada`),te=e=>{if(ee?.navigate){ee.navigate(e);return}window.location.hash=`#/${e}`},P=[],F=`pm_asistencia_${g||M}_${h}`,I=b,re=null,L=We(),R=null,ie=null;if(!document.getElementById(`pm-asist-badge-styles`)){let e=document.createElement(`style`);e.id=`pm-asist-badge-styles`,e.textContent=`
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
      .pm-cat-btn {
        padding: 0.28rem 0.7rem; border-radius: 16px; border: none;
        background: var(--pm-primary); color: #fff;
        font-size: 0.74rem; font-weight: 600; cursor: pointer;
      }
      .pm-cat-btn:hover { filter: brightness(1.1); }
      .pm-cat-link {
        padding: 0.28rem 0.55rem; border-radius: 16px;
        border: 1px solid var(--pm-border, rgba(255,255,255,0.15));
        background: transparent; color: var(--pm-text-muted, #9ca3af);
        font-size: 0.74rem; cursor: pointer; transition: all 0.15s;
      }
      .pm-cat-link:hover { color: var(--pm-text, #fff); border-color: var(--pm-primary); }
      .pm-cat-opt {
        padding: 0.3rem 0.6rem; border-radius: 8px;
        border: 1px solid var(--pm-border, rgba(255,255,255,0.15));
        background: var(--pm-surface-2, rgba(255,255,255,0.04));
        color: var(--pm-text, inherit); font-size: 0.74rem; cursor: pointer;
      }
      .pm-cat-opt:hover { background: var(--pm-primary); color: #fff; border-color: var(--pm-primary); }
      .pm-cat-hint { font-size: 0.7rem; color: var(--pm-text-muted, #9ca3af); }
      .pm-categoria-bar code {
        background: var(--pm-surface-2, rgba(255,255,255,0.06));
        padding: 0 .25rem; border-radius: 3px; font-size: .9em;
      }
      .pm-cat-btn:focus-visible, .pm-cat-link:focus-visible, .pm-cat-opt:focus-visible {
        outline: 2px solid var(--pm-primary); outline-offset: 2px;
      }
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
          <span class="pm-asist-progress-label" id="pm-progress-label">0/${a.length}</span>
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

      <!-- Tarea 3.8 (mapa-gamificado-planificacion): entrada real a Modo Sesión (mapa) + Bitácora.
           No reemplaza ni modifica el registro DSL de arriba — es un punto de entrada aparte. -->
      <div class="pm-mapa-gamificado-entry" id="pm-mapa-gamificado-entry" style="margin-top:1.25rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
        <button type="button" class="pm-btn pm-btn-outline" id="btn-ir-modo-sesion">
          <i class="bi bi-map"></i> Ir a Modo Sesión (Mapa)
        </button>
        <button type="button" class="pm-btn pm-btn-outline" id="btn-abrir-bitacora">
          <i class="bi bi-journal-text"></i> Bitácora de la sesión
        </button>
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
  `;let z=Ot(t.querySelector(`#pm-attendance-header`),{clase:r,horario:i,salonNombre:T,fechaHoy:h,totalAlumnos:a.length,hasConflict:C,onBack:()=>{ke.destroy();try{Ce.close()}catch{}P.forEach(e=>{try{e()}catch{}}),te(`hoy`)}});P.push(()=>z.destroy());let B=t.querySelector(`#pm-sync-badge-container`);if(B){let e=ue();B.appendChild(e.el)}let V=zn(t,{initialContent:b,claseId:g,onEditorChange:e=>{I=e,se?.onTextoCambia(e)}}),H=V.getEditor(),ae=t.querySelector(`#pm-dsl-editor-container`),oe={codigo:null,origen:null},se=Kn(t.querySelector(`.pm-asist-dsl-section`)||t,{onChange:async({codigo:e,origen:t})=>{if(oe={codigo:e,origen:t},M)try{await Wn(M,e,t)}catch(e){console.warn(`[asistencia] No se pudo guardar la categoría:`,e.message)}}});b&&se.analizarAhora(b);let le=pe(t,{onAceptar:e=>{H.setValue(e)}}),de=me(t,{onAccept:e=>{H.setValue(e)}}),he=nt(ae.parentNode,{onConfirm:async n=>{try{let e=a.map(e=>({id:e.id,nombre:e.nombre_completo||e.nombre||``,nombreCorto:(e.nombre_completo||e.nombre||``).split(` `)[0]})),{saved:r,errors:i}=await Ye({sesionId:M,claseId:g,maestroId:d.id,fechaHoy:h,progressRecords:n,alumnos:e});i.length&&console.warn(`[Progress] Errores parciales:`,i);let o=t.querySelector(`#btn-guardar`);o&&(o.style.removeProperty(`display`),o.click())}catch(n){t.querySelector(`#btn-guardar`)?.style.removeProperty(`display`),e.error(`Error al guardar progreso: `+n.message)}},onCancel:()=>{t.querySelector(`#btn-guardar`)?.style.removeProperty(`display`)}}),ge=ct(t.querySelector(`#pm-planificacion-dropdown`)||t,{onAdopt:async({instrumento:t,nivel:n,resumen:r,pilares:i})=>{try{let{curriculo:a,allObjetivos:o}=await Ct({instrumento:t,nivel:n,descripcion:r,pilares:i}),{linked:s}=await Ze({claseId:g,objetivos:o}),c=s>0?`Plan creado · ${s} registro${s===1?``:`s`} vinculado${s===1?``:`s`}`:`Plan curricular creado correctamente.`;e.success(c)}catch(t){e.error(`Error al crear el plan: `+t.message)}},onCancel:()=>{}});V.initToolbar({onImproveClick:async n=>{let r=t.querySelector(`#btn-generar-informe`);r&&(r.disabled=!0);try{let e=await E(n);le.open({original:n,improved:e})}catch(t){e.error(`Error al generar informe: `+t.message)}finally{r&&(r.disabled=!1)}},onStructureClick:async n=>{let r=t.querySelector(`#btn-ia-magic`);r&&(r.disabled=!0);try{let e=R?.getActiveIndicador(),t=await k(n,{presentes:a.filter(e=>o[e.id]===`P`).map(e=>e.nombre_completo),indicadorActivo:e?.nombre||null});de.open({original:n,dsl:t})}catch(t){e.error(`Error al estructurar con IA: `+t.message)}finally{r&&(r.disabled=!1)}},onAnalyzeClick:async n=>{await yr(async()=>{let i=a.filter(e=>o[e.id]&&o[e.id]!==`A`),s=(e,t)=>{let n=e.trim().split(/\s+/),r=n[0];return t.filter(e=>e.trim().split(/\s+/)[0]===r).length>1?n.slice(0,2).join(` `):r},c=a.map(e=>e.nombre_completo||e.nombre||``),l={alumnos:a.map(e=>{let t=e.nombre_completo||e.nombre||``;return{id:e.id,nombre:t,nombreCorto:s(t,c)}}),presentes:i.map(e=>{let t=e.nombre_completo||e.nombre||``;return{id:e.id,nombre:t,nombreCorto:s(t,c)}}),tipoClase:wt(r),instrumento:r.instrumento||``,sesionesRecientes:(v||[]).slice(-2).map(e=>e.contenido||``).filter(Boolean),indicadorActivo:R?.getActiveIndicador()?.nombre||``};t.querySelector(`#btn-guardar`)?.style.setProperty(`display`,`none`);let u=await A(n,l);if(!u?.progreso?.length){t.querySelector(`#btn-guardar`)?.style.removeProperty(`display`),e!==void 0&&e&&e.warning(`La IA no detectó registros de progreso en este texto.`);return}he.open({progreso:u.progreso,resumen:u.resumen})},{onError:n=>{t.querySelector(`#btn-guardar`)?.style.removeProperty(`display`),e!==void 0&&e&&e.error(`Error al analizar con IA: `+n.message)}})}});let _e=V.getToolbar();R=jt(t,{claseId:g,clase:r,maestro:d,fechaHoy:h,rutaId:D,editor:H,onIndicadorSelect:e=>{H.insertText(`[${e.nombre}] `),_e&&_e.setContext({indicadorActivo:e.nombre});let n=t.querySelector(`#btn-guardar-obs`);n&&(n.style.display=``)},getSessionState:()=>({isRegistered:N,hasContent:!!(I&&I.trim()),sessionId:M}),getDslContent:()=>H.getValue()}),P.push(()=>R.destroy());let ve=t.querySelector(`#btn-proponer-curriculo`);ve&&(ve.onclick=async()=>{ve.disabled=!0,ve.innerHTML=`<i class="bi bi-hourglass-split"></i> Analizando...`;try{let t=await it(g,12);if(t.registros.length===0){e.error(`No hay registros de progreso suficientes en las últimas 12 semanas para generar una propuesta.`);return}let n=await O(t,{instrumento:r?.instrumento||``,nivel:``,nombreClase:r?.nombre||``});ge.open({pilares:n.pilares,resumen:n.resumen,instrumento:r?.instrumento||``,nivel:``})}catch(t){e.error(`Error al generar propuesta: `+t.message)}finally{ve.disabled=!1,ve.innerHTML=`<i class="bi bi-stars"></i> Proponer plan curricular con IA`}});let be=t.querySelector(`#btn-ir-modo-sesion`);be&&(be.onclick=()=>{te(`planificacion-mapa-clase?clase=${g}`)});let U=t.querySelector(`#btn-abrir-bitacora`);U&&(U.onclick=()=>{if(!M){e.warning(`Guardá la asistencia de hoy antes de abrir la bitácora de la sesión.`);return}fr({sesionId:M,claseId:g,maestroId:d.id,onSaved:()=>e.success(`Bitácora guardada`)})});let xe=kt(t,{editor:H,toolbar:_e}),Se=ce();xe.inject(Se,g),P.push(()=>xe.destroy());let Ce=tr(t,{sesionId:M,getSesionId:()=>M,claseId:g,fechaHoy:h,maestroId:d.id,supabase:l,guardarJustificacion:Ve,eliminarJustificacion:Ue,onJustifDeleted:e=>{o[e]=null,delete u[e]},onJustifSaved:(e,t)=>{u[e]=t},onJustifCancelled:(e,t)=>{o[e]=t},onRenderLista:e=>Te.render(e),onUpdateProgress:()=>Ee(),onAutoSave:e=>De(e),onAnnounce:e=>ne(e)});P.push(()=>{try{Ce.close()}catch{}});let we=$n(t,{sesionId:M,maestroId:d.id,editor:H,sesionExistenteData:j,onDraftRecovered:e=>{I=e,H.setValue(e)}});P.push(()=>we.destroy()),t.querySelector(`#pm-academic-tools`),or(t,{rutaId:D,sesionId:M,claseId:g,maestro:d,fechaHoy:h,alumnos:a,estado:o,planificationCard:R,editorContainer:ae,getEditorValue:()=>H.getValue(),setEditorValue:e=>H.setValue(e),onDslContentClear:()=>{I=``},activeClassEventId:null,activeLevel:null,claseNombre:r?.nombre||`Clase`,onAppendModal:e=>{let n=t.querySelector(`.pm-asist-root`);n&&n.appendChild(e)}});let Te=nr(t,{alumnos:a,estado:o,rutaId:D,canOpenProgressPanel:!!(g||D),sesionId:M,fechaHoy:h,snapshots:v,justificaciones:u,obtenerJustificacion:He,eliminarJustificacion:Ue,onJustifDeleted:e=>{delete u[e]},onEstadoChange:(e,t)=>{o[e]=t},onOpenProgressPanel:e=>{W&&W.destroy(),W=Ae({alumno:e,rutaId:D,sessionId:M,claseId:g,fecha:h,horaInicio:i?.hora_inicio||null,onProgressSaved:async()=>{R?.refreshTree&&await R.refreshTree()}}),W.open(),P.push(()=>{W&&W.destroy()})},onOpenEvaluationDrawer:(e,n)=>{fe(t,{student:e,sessionId:M,teacherId:d.id,snapshots:n})},onOpenJustifModal:(e,t,n)=>{Ce.open(e,t,n)},onAutoSave:e=>De(e),onAnnounce:e=>ne(e),onUpdateSnapshots:e=>{v.push(...e)}});P.push(()=>Te.destroy());let W=null;function Ee(){let e=a.length,n=Object.values(o).filter(e=>e!==null).length,r=t.querySelector(`#pm-progress-wrap`),i=t.querySelector(`#pm-progress-fill`),s=t.querySelector(`#pm-progress-label`);if(n===0){r.style.display=`none`;return}r.style.display=`flex`,i.style.width=`${n/e*100}%`,s.textContent=`${n}/${e}`}async function De(e=!1,t=!1){re&&clearTimeout(re);let n=async()=>{let e=a.filter(e=>o[e.id]).map(e=>({alumno_id:e.id,estado:o[e.id]})),t={...M?{}:{clase_id:g},maestro_id:d.id,fecha:h,estado:`pendiente`,borrador:!0,asistencia:e||[],contenido:I||``,...oe.codigo?{node_codigo:oe.codigo,node_origen:oe.origen}:{}};if(e.length===0&&!(I||``).trim()&&M)try{await _(M),M=null,localStorage.removeItem(`${F}_updated`),console.log(`[asistencia] Borrador vaciado y eliminado automáticamente`);return}catch(e){console.warn(`[asistencia] Error al autolimpiar borrador:`,e)}if(navigator.onLine)try{if(M){let{error:e}=await l.from(`sesiones_clase`).update({...t,updated_at:new Date().toISOString()}).eq(`id`,M);if(!e){localStorage.setItem(`${F}_updated`,new Date().toISOString());return}throw e}else{let{data:e,error:n}=await l.from(`sesiones_clase`).insert([t]).select(`id`).single();if(!n&&e){M=e.id,console.log(`[asistencia] Nueva sesión creada:`,M),localStorage.setItem(`${F}_updated`,new Date().toISOString());return}throw n||Error(`No se pudo crear la sesión`)}}catch(e){console.warn(`[asistencia] Fallo operación directa, usando cola offline:`,e.message)}await m({tabla:`sesiones_clase`,operacion:M?`update`:`insert`,payload:{...M?{id:M}:{},...t}}),localStorage.setItem(`${F}_updated`,new Date().toISOString())};e?t?await n():await L.run(n):re=setTimeout(()=>{L.run(n).catch(e=>console.error(`[asistencia] Autosave error:`,e))},2e3)}let G=t.querySelector(`.pm-asist-actions-fixed`);if(G){let e=document.createElement(`button`);e.id=`btn-reporte-dia`,e.className=`pm-asist-btn-obs`,e.innerHTML=`📄 Reporte`,e.title=`Genera el Reporte Diario de Asistencia (PDF)`,e.style.flex=`1`,e.style.display=`none`,e.addEventListener(`click`,async t=>{t.preventDefault(),M&&(e.disabled=!0,e.innerHTML=`⏳...`,await S(M),e.disabled=!1,e.innerHTML=`📄 Reporte`)});let t=G.querySelector(`#btn-guardar`);G.insertBefore(e,t);let n=document.createElement(`button`);n.id=`btn-resumen-mes`,n.className=`pm-asist-btn-obs`,n.innerHTML=`📊 Resumen`,n.title=`Genera el Resumen Mensual de Asistencia (PDF)`,n.style.flex=`1`,n.style.display=`none`;let r=new Date;n.addEventListener(`click`,async e=>{e.preventDefault(),g&&(n.disabled=!0,n.innerHTML=`⏳...`,await w(g,r.getFullYear(),r.getMonth()+1),n.disabled=!1,n.innerHTML=`📊 Resumen`)}),G.insertBefore(n,t)}t.querySelector(`#btn-guardar`).onclick=async()=>{let n=t.querySelector(`#btn-guardar`),i=n.textContent;n.textContent=`Guardando...`,n.disabled=!0,await L.run(async()=>{try{let i=a.filter(e=>o[e.id]).map(e=>({...g?{clase_id:g}:{},alumno_id:e.id,fecha:h,estado:o[e.id],registrado_por:d.id})),u=i.length>0,v=I&&I.trim().length>0;if(!u&&!v)throw Error(`Debes marcar asistencia o agregar contenido para guardar`);if(await De(!0,!0),!M){let{data:e}=await l.from(`sesiones_clase`).select(`id`).eq(`clase_id`,g).eq(`maestro_id`,d.id).eq(`fecha`,h).maybeSingle();e&&(M=e.id)}if(u&&g)try{let e=i.map(e=>({...e,...M&&{sesion_clase_id:M}}));await y(e),console.log(`[asistencia] Registradas asistencias individuales:`,e.length)}catch(e){if(console.error(`[asistencia] Error registrando asistencias en bulk:`,e),!navigator.onLine||!M){console.warn(`[asistencia] Encolando asistencias para sync offline...`);for(let e of i)await m({tabla:`asistencias`,operacion:`upsert`,payload:{clase_id:g,alumno_id:e.alumno_id,fecha:h,estado:e.estado,registrado_por:d.id,...M?{sesion_clase_id:M}:{}}})}else throw Error(`No se pudieron registrar las asistencias individuales: `+e.message)}if(M&&(u||v)){let e=a.filter(e=>o[e.id]).map(e=>({alumno_id:e.id,estado:o[e.id]})),{error:t}=await l.from(`sesiones_clase`).update({borrador:!1,estado:`registrada`,asistencia:e,contenido:I||``,updated_at:new Date().toISOString()}).eq(`id`,M).select();if(t){console.warn(`estado "registrada" no permitido, usando fallback "cerrada":`,t.message);let{error:n}=await l.from(`sesiones_clase`).update({borrador:!1,estado:`cerrada`,asistencia:e,contenido:I||``,updated_at:new Date().toISOString()}).eq(`id`,M).select();n&&(console.warn(`Fallback "cerrada" también falló, actualizando solo borrador:`,n.message),await l.from(`sesiones_clase`).update({borrador:!1,asistencia:e,contenido:I||``,updated_at:new Date().toISOString()}).eq(`id`,M))}s(),p(`hoy`),p(`calendario`),p(`metricas`),f().catch(e=>console.warn(`[asistenciaView] Error al actualizar notificaciones:`,e)),N=!0,R?.refreshTree&&await R.refreshTree()}if(M){let{academicService:e}=await c(async()=>{let{academicService:e}=await import(`./academicService-BUoVMC5G.js`).then(e=>e.n);return{academicService:e}},__vite__mapDeps([0,1,2])),{createAchievementsSummaryModal:r}=await c(async()=>{let{createAchievementsSummaryModal:e}=await import(`./AchievementsSummaryModal-CJ9jpoV7.js`);return{createAchievementsSummaryModal:e}},__vite__mapDeps([5,4])),i=await e.processSessionClosure(M);i&&i.length>0?(n.textContent=`¡Logros detectados!`,n.style.background=`var(--pm-success)`,await r(t,i)):console.warn(`[asistencia] processSessionClosure devolvió 0 logros (puede que no haya progresos vinculados a esta sesión aún).`)}else console.warn(`[asistencia] No se pudo obtener sesionId para procesar logros.`);n.textContent=`✓ Guardado`,n.style.background=`var(--apple-success)`;let b=G?.querySelector(`#btn-reporte-dia`);b&&(b.style.display=``);let C=G?.querySelector(`#btn-resumen-mes`);C&&(C.style.display=``);let T=Object.values(o).filter(e=>e===`P`).length,E=Object.values(o).filter(e=>e===`A`).length;ne(`Sesión guardada exitosamente. ${T} presentes, ${E} ausentes.`);let D=document.createElement(`div`);D.className=`pm-saved-overlay`,D.innerHTML=`
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
      `,document.body.appendChild(D);let O=D.querySelector(`#btn-resumen-pedagogico`),k=D.querySelector(`#btn-editar-asistencia`),A=D.querySelector(`#btn-compartir-correo`),ee=D.querySelector(`#btn-compartir-whatsapp`),P=D.querySelector(`#btn-volver-hoy`),F=D.querySelector(`#btn-ir-calendario`);ie&&ie.destroy(),ie=Le();let re=ie;O&&(O.onclick=()=>{re.open({sesionId:M,claseNombre:r?.nombre||`Clase`,fecha:h,supabase:l})}),k&&(k.onclick=()=>{D.remove(),n.textContent=`Guardar sesión`,n.style.background=``,n.disabled=!1,n.style.display=``}),A&&(A.onclick=async()=>{let e=a.filter(e=>o[e.id]).map(e=>({alumno_id:e.id,estado:o[e.id]})),t=encodeURIComponent(`Reporte de Clase - ${r?.nombre||``} - ${h}`),n=Et(e,I,a,r,h);Dt(`mailto:?subject=${t}&body=`,n,1800)}),ee&&(ee.onclick=async()=>{Dt(`https://wa.me/?text=`,Et(a.filter(e=>o[e.id]).map(e=>({alumno_id:e.id,estado:o[e.id]})),I,a,r,h),1600)}),P&&(P.onclick=()=>{D.remove(),te(`hoy`)}),F&&(F.onclick=()=>{D.remove(),te(`fechas`)});let L=D.querySelector(`#btn-reporte-dia-overlay`);L&&(L.onclick=async()=>{let e=L.innerHTML;L.disabled=!0,L.innerHTML=`<i class="bi bi-hourglass-split"></i> Generando…`;try{await S(M)}finally{L.disabled=!1,L.innerHTML=e}});let z=t.querySelector(`#btn-descartar-borrador`);z&&z.addEventListener(`click`,async()=>{if(confirm(`¿Deseas descartar este borrador? La fecha se limpiará por completo.`))try{z.disabled=!0,z.innerHTML=`<span class="spinner-border spinner-border-sm" role="status"></span> Descartando...`,j?.id&&await _(j.id),e.show(`Borrador descartado correctamente`,`success`),s(),p(`calendario`),window.location.hash=`#/fechas`}catch(t){e.show(`Error al descartar: `+t.message,`danger`),z.disabled=!1,z.innerHTML=`<i class="bi bi-trash"></i> Descartar`}});let B=D.querySelector(`#btn-resumen-mes-overlay`);B&&(g?B.onclick=async()=>{let e=B.innerHTML;B.disabled=!0,B.innerHTML=`<i class="bi bi-hourglass-split"></i> Generando…`;try{let e=new Date;await w(g,e.getFullYear(),e.getMonth()+1)}finally{B.disabled=!1,B.innerHTML=e}}:(B.disabled=!0,B.title=`No disponible para actividades especiales`,B.style.opacity=`0.5`));let V=D.querySelector(`#btn-informe-ped-overlay`);V&&(g?V.onclick=async()=>{let e=V.innerHTML;V.disabled=!0,V.innerHTML=`<i class="bi bi-hourglass-split"></i> Generando…`;try{let e=new Date;await x(g,e.getFullYear(),e.getMonth()+1)}finally{V.disabled=!1,V.innerHTML=e}}:(V.disabled=!0,V.title=`No disponible para actividades especiales`,V.style.opacity=`0.5`))}catch(e){console.error(`Error al guardar sesión:`,e),n.textContent=e.message||`Error al guardar`,n.style.background=`var(--pm-danger)`,n.disabled=!1,setTimeout(()=>{n.textContent=i,n.style.background=``},3e3)}})};let Oe=qn(t,{onMarkAll:async e=>{a.forEach(t=>{o[t.id]=e}),Te.render(),Ee();try{await De(!0)}catch(t){console.warn(`[asistencia] autoSave error on bulk ${e}:`,t)}ne(`Todos los ${a.length} alumnos marcados como ${e===`P`?`presentes`:`ausentes`}.`)},onClearAll:async()=>{a.forEach(e=>{o[e.id]=null}),Te.render(),Ee();try{await De(!0)}catch(e){console.warn(`[asistencia] autoSave error on clear all:`,e)}ne(`Se desmarcaron las asistencias de todos los alumnos.`)}});P.push(()=>Oe.destroy()),Te.render();let ke=new ye(t);ke.mount();let je=t.querySelector(`#pm-btn-help`);return je&&(je.onclick=()=>ke.start()),()=>{console.log(`[AsistenciaView] Cleanup ejecutado por el Router`),ke.destroy();try{Ce.close()}catch{}document.querySelectorAll(`.pm-saved-overlay`).forEach(e=>e.remove()),P.forEach(e=>{try{e()}catch{}})}}export{xr as renderAsistenciaView};