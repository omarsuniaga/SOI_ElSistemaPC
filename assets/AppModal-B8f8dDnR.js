var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||(e((t={exports:{}}).exports,t),e=null),t.exports),s=(e,n)=>{let r={};for(var i in e)t(r,i,{get:e[i],enumerable:!0});return n||t(r,Symbol.toStringTag,{value:`Module`}),r},c=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},l=(n,r,a)=>(a=n==null?{}:e(i(n)),c(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n)),u=s({AppToast:()=>_}),d=`app-toast-container`,f=!1;function p(){if(f)return;f=!0;let e=document.createElement(`style`);e.id=`app-toast-styles`,e.textContent=`
    #app-toast-container {
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      z-index: 11020;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }

    .app-toast {
      pointer-events: all;
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      min-width: 280px;
      max-width: 360px;
      padding: 0.85rem 1rem;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(24, 24, 32, 0.97);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      color: #fff;
      font-size: 0.875rem;
      line-height: 1.4;
      opacity: 0;
      transform: translateY(12px) scale(0.97);
      transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.16,1,0.3,1);
    }

    .app-toast.app-toast--visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    .app-toast.app-toast--hiding {
      opacity: 0;
      transform: translateY(8px) scale(0.96);
    }

    .app-toast__icon {
      font-size: 1.1rem;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .app-toast__body {
      flex: 1;
      min-width: 0;
    }

    .app-toast__title {
      font-weight: 700;
      font-size: 0.78rem;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      margin-bottom: 2px;
      opacity: 0.75;
    }

    .app-toast__msg {
      font-size: 0.875rem;
      color: rgba(255,255,255,0.9);
    }

    .app-toast__close {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.4);
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.2s;
      align-self: flex-start;
    }
    .app-toast__close:hover { color: #fff; }

    /* Colores por tipo */
    .app-toast--success .app-toast__icon { color: #34d399; }
    .app-toast--success { border-color: rgba(52,211,153,0.2); }

    .app-toast--error .app-toast__icon   { color: #f87171; }
    .app-toast--error   { border-color: rgba(248,113,113,0.2); }

    .app-toast--warning .app-toast__icon { color: #fbbf24; }
    .app-toast--warning { border-color: rgba(251,191,36,0.2); }

    .app-toast--info .app-toast__icon    { color: #60a5fa; }
    .app-toast--info    { border-color: rgba(96,165,250,0.2); }

    @media (max-width: 400px) {
      #app-toast-container { right: 0.75rem; left: 0.75rem; }
      .app-toast { min-width: unset; max-width: 100%; }
    }
  `,document.head.appendChild(e)}function m(){let e=document.getElementById(d);return e||(e=document.createElement(`div`),e.id=d,document.body.appendChild(e)),e}var h={success:{icon:`bi bi-check-circle-fill`,title:`Éxito`},error:{icon:`bi bi-exclamation-octagon-fill`,title:`Error`},danger:{icon:`bi bi-exclamation-octagon-fill`,title:`Error`},warning:{icon:`bi bi-exclamation-triangle-fill`,title:`Atención`},info:{icon:`bi bi-info-circle-fill`,title:`Info`}};function g(e){e._dismissing||(e._dismissing=!0,e.classList.remove(`app-toast--visible`),e.classList.add(`app-toast--hiding`),setTimeout(()=>e.remove(),350))}var _={show(e,t=`info`){p();let n=m(),r=h[t]||h.info,i=t===`danger`?`error`:t,a=document.createElement(`div`);a.className=`app-toast app-toast--${i}`,a.setAttribute(`role`,`alert`),a.setAttribute(`aria-live`,`polite`),a.innerHTML=`
      <i class="${r.icon} app-toast__icon" aria-hidden="true"></i>
      <div class="app-toast__body">
        <div class="app-toast__title">${r.title}</div>
        <div class="app-toast__msg">${e}</div>
      </div>
      <button class="app-toast__close" aria-label="Cerrar">&#x2715;</button>
    `,n.appendChild(a),a.querySelector(`.app-toast__close`).addEventListener(`click`,()=>g(a)),requestAnimationFrame(()=>{requestAnimationFrame(()=>a.classList.add(`app-toast--visible`))});let o=setTimeout(()=>g(a),4e3);a.addEventListener(`mouseenter`,()=>clearTimeout(o)),a.addEventListener(`mouseleave`,()=>{setTimeout(()=>g(a),1500)})},success(e){this.show(e,`success`)},error(e){this.show(e,`error`)},danger(e){this.show(e,`danger`)},info(e){this.show(e,`info`)},warning(e){this.show(e,`warning`)}},v={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`,"/":`&#x2F;`};function y(e){return e==null?``:String(e).replace(/[&<>"'/]/g,e=>v[e])}var b=s({AppModal:()=>E}),x=`app-global-modal`,S=`app-global-backdrop`;function C(){if(document.getElementById(x))return;let e=document.createElement(`style`);e.id=`${x}-styles`,e.textContent=`
    #${x} .app-modal-dialog {
      display: flex;
      flex-direction: column;
      width: 90vw;
      max-width: 90vw;
      max-height: 90vh;
    }

    #${x} .app-modal-body {
      flex: 1 1 auto;
      overflow: auto;
      min-height: 0;
    }

    #${x} .app-modal-header,
    #${x} .app-modal-footer {
      flex-shrink: 0;
    }

    @media (min-width: 992px) {
      #${x} .app-modal-dialog.modal-size-xl {
        width: 75vw !important;
        max-width: 75vw !important;
        height: 75vh !important;
        max-height: 75vh !important;
      }
    }

    @media (max-width: 767.98px) {
      #${x} {
        padding: 0.5rem;
      }

      #${x} .app-modal-dialog {
        width: 95vw;
        max-width: 95vw;
        max-height: 92vh;
        border-radius: 14px;
      }

      #${x} .app-modal-header,
      #${x} .app-modal-body,
      #${x} .app-modal-footer {
        padding-left: 0.9rem !important;
        padding-right: 0.9rem !important;
      }
    }
  `,document.head.appendChild(e);let t=document.createElement(`div`);t.id=S,t.style.cssText=`
    display:none;position:fixed;inset:0;
    background:var(--pm-backdrop, rgba(0,0,0,0.55));
    backdrop-filter:blur(4px);
    z-index:10800;
    transition:opacity .2s ease;
    opacity:0;
  `,document.body.appendChild(t);let n=document.createElement(`div`);n.id=x,n.setAttribute(`role`,`dialog`),n.setAttribute(`aria-modal`,`true`),n.style.cssText=`
    display:none;position:fixed;inset:0;
    z-index:10801;
    overflow-y:auto;
    padding:1.5rem;
    align-items:center;
    justify-content:center;
  `,n.innerHTML=`
    <div class="app-modal-dialog" style="
      background:var(--pm-surface, var(--bs-body-bg, #ffffff));
      color:var(--pm-text, var(--bs-body-color, #212529));
      border:1px solid var(--pm-border, var(--bs-border-color, #dee2e6));
      border-radius:16px;
      box-shadow:0 20px 60px rgba(0,0,0,0.2);
      width:90vw;
      max-width:90vw;
      max-height:90vh;
      margin:auto;
      transform:translateY(20px) scale(0.97);
      transition:transform .25s cubic-bezier(.34,1.56,.64,1), opacity .2s ease;
      opacity:0;
      overflow:hidden;
      display:flex;
      flex-direction:column;
    ">
      <!-- Header -->
      <div class="app-modal-header" style="
        padding:1rem 1.25rem;
        border-bottom:1px solid var(--pm-border, var(--bs-border-color, #dee2e6));
        display:flex;align-items:center;gap:.5rem;
        background: linear-gradient(135deg, var(--pm-primary, var(--bs-primary, #0d6efd)) 0%, #5856d6 100%);
      ">
        <h5 class="app-modal-title mb-0 fw-bold" style="flex:1;font-size:1.0625rem;color:white;font-weight:600;letter-spacing:-0.01em;"></h5>
        <div class="app-modal-header-actions d-flex align-items-center gap-1 me-1"></div>
        <button class="app-modal-close-x" type="button" aria-label="Cerrar" style="
          background:rgba(255,255,255,0.15);border:none;cursor:pointer;
          width:28px;height:28px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          color:white;
          transition:all .15s;
          flex-shrink:0;
        ">
          <i class="bi bi-x-lg" style="font-size:0.875rem;"></i>
        </button>
      </div>

      <!-- Body -->
      <div class="app-modal-body" style="padding:1.25rem; background:var(--pm-surface, var(--bs-body-bg, #ffffff)); overflow:auto; min-height:0;"></div>

      <!-- Footer -->
      <div class="app-modal-footer" style="
        padding:1rem 1.25rem;
        border-top:1px solid var(--pm-border, var(--bs-border-color, #dee2e6));
        display:flex;align-items:center;justify-content:flex-end;gap:.5rem;
        background:var(--pm-surface-2, var(--bs-tertiary-bg, #f8f9fa));
      ">
        <button class="app-modal-btn-delete pm-btn" type="button" style="background:none; border:none; color:var(--pm-danger, var(--bs-danger, #dc3545)); font-size:0.85rem; font-weight:600; padding:0.5rem 1rem; cursor:pointer; margin-right:auto; display:none;">Eliminar</button>
        <button class="app-modal-btn-cancel pm-btn pm-btn-outline" type="button">Cancelar</button>
        <button class="app-modal-btn-save pm-btn pm-btn-primary" type="button">
          <span class="app-modal-save-text">Guardar</span>
        </button>
      </div>
    </div>
  `,document.body.appendChild(n)}function w(){return{backdrop:document.getElementById(S),modal:document.getElementById(x),dialog:document.querySelector(`#${x} .app-modal-dialog`),title:document.querySelector(`#${x} .app-modal-title`),headerActions:document.querySelector(`#${x} .app-modal-header-actions`),body:document.querySelector(`#${x} .app-modal-body`),closeX:document.querySelector(`#${x} .app-modal-close-x`),btnCancel:document.querySelector(`#${x} .app-modal-btn-cancel`),btnSave:document.querySelector(`#${x} .app-modal-btn-save`),btnDelete:document.querySelector(`#${x} .app-modal-btn-delete`),saveText:document.querySelector(`#${x} .app-modal-save-text`)}}var T={sm:`400px`,md:`520px`,lg:`720px`,xl:`75vw`},E={_saveHandler:null,_cancelHandler:null,_keydownHandler:null,open({title:e=``,body:t=``,headerActions:n=``,autoFocus:r=!0,saveText:i=`Guardar`,cancelText:a=`Cancelar`,deleteText:o=`Eliminar`,onSave:s=null,onCancel:c=null,onDelete:l=null,onShow:u=null,onOpen:d=null,size:f=`md`,hideSave:p=!1}={}){C();let m=w(),h=m.dialog.querySelector(`.app-modal-footer`);h&&h.style.removeProperty(`display`),m.dialog.classList.remove(`modal-size-sm`,`modal-size-md`,`modal-size-lg`,`modal-size-xl`),m.dialog.classList.add(`modal-size-${f}`),m.dialog.style.maxWidth=T[f]||T.md,m.title.textContent=e,m.headerActions&&(typeof n==`string`?m.headerActions.innerHTML=n:n instanceof HTMLElement?(m.headerActions.innerHTML=``,m.headerActions.appendChild(n)):m.headerActions.innerHTML=``),typeof t==`string`?m.body.innerHTML=t:t instanceof HTMLElement&&(m.body.innerHTML=``,m.body.appendChild(t)),u&&u(m.body),d&&setTimeout(()=>d(m.body),280),this.resetSaveBtn(i),m.btnCancel.textContent=a,m.btnSave.style.display=p?`none`:``,l?(m.btnDelete.textContent=o,m.btnDelete.style.display=`block`):m.btnDelete.style.display=`none`,r&&setTimeout(()=>{let e=m.body.querySelector(`input,select,textarea`);e&&e.focus()},280),this._detachHandlers(),this._keydownHandler=e=>{e.key===`Escape`&&(this._cancelHandler?this._cancelHandler():this.close())},document.addEventListener(`keydown`,this._keydownHandler),this._saveHandler=async()=>{if(s){let e=m.btnSave,t=e.innerHTML;e.disabled=!0,e.innerHTML=`<span class="spinner-border spinner-border-sm me-1" role="status"></span>`;try{await s(m.body)===!1?(e.disabled=!1,e.innerHTML=t):this.close()}catch{e.disabled=!1,e.innerHTML=t}}else this.close()},this._cancelHandler=()=>{c&&c(),this.close()},this._deleteHandler=async()=>{if(!l||!confirm(`¿Estás seguro de que querés eliminar este elemento? Esta acción no se puede deshacer.`))return;let e=m.btnDelete.innerHTML;m.btnDelete.disabled=!0,m.btnDelete.innerHTML=`<span class="spinner-border spinner-border-sm" role="status"></span>`;try{await l()===!1?(m.btnDelete.disabled=!1,m.btnDelete.innerHTML=e):this.close()}catch{m.btnDelete.disabled=!1,m.btnDelete.innerHTML=e}},m.btnSave.addEventListener(`click`,this._saveHandler),m.btnCancel.addEventListener(`click`,this._cancelHandler),m.closeX.addEventListener(`click`,this._cancelHandler),m.btnDelete.addEventListener(`click`,this._deleteHandler),m.closeX.onmouseenter=()=>{m.closeX.style.background=`var(--bs-secondary-bg)`,m.closeX.style.color=`var(--bs-body-color)`},m.closeX.onmouseleave=()=>{m.closeX.style.background=`none`,m.closeX.style.color=`var(--bs-secondary-color)`},m.backdrop.style.display=`block`,m.modal.style.display=`flex`,document.body.style.overflow=`hidden`,requestAnimationFrame(()=>{m.backdrop.style.opacity=`1`,m.dialog.style.opacity=`1`,m.dialog.style.transform=`translateY(0) scale(1)`})},close(){if(!document.getElementById(x))return;let e=w();e.backdrop.style.opacity=`0`,e.dialog.style.opacity=`0`,e.dialog.style.transform=`translateY(20px) scale(0.97)`,this._detachHandlers(),setTimeout(()=>{e.backdrop.style.display=`none`,e.modal.style.display=`none`,e.body.innerHTML=``,e.headerActions&&(e.headerActions.innerHTML=``),document.body.style.overflow=``},220)},_detachHandlers(){let e=w();e.btnSave&&(this._saveHandler&&e.btnSave.removeEventListener(`click`,this._saveHandler),this._cancelHandler&&(e.btnCancel.removeEventListener(`click`,this._cancelHandler),e.closeX.removeEventListener(`click`,this._cancelHandler)),this._deleteHandler&&e.btnDelete.removeEventListener(`click`,this._deleteHandler),this._keydownHandler&&document.removeEventListener(`keydown`,this._keydownHandler),this._saveHandler=null,this._cancelHandler=null,this._deleteHandler=null,this._keydownHandler=null)},resetSaveBtn(e=`Guardar`){let t=document.querySelector(`#${x} .app-modal-btn-save`);t&&(t.disabled=!1,t.innerHTML=`<span class="app-modal-save-text">${e}</span>`)},setSaveHandler(e,t=null){let n=w();n.btnSave&&(this._saveHandler&&n.btnSave.removeEventListener(`click`,this._saveHandler),t&&this.resetSaveBtn(t),this._saveHandler=async()=>{let t=n.btnSave,r=t.innerHTML;t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-1" role="status"></span>`;try{await e(n.body)===!1?(t.disabled=!1,t.innerHTML=r):this.close()}catch{t.disabled=!1,t.innerHTML=r}},n.btnSave.addEventListener(`click`,this._saveHandler))},showLoading(e=`Cargando...`){let t=w();t.body&&(t.body.innerHTML=`
      <div class="d-flex flex-column align-items-center justify-content-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted mb-0">${y(e)}</p>
      </div>
    `,t.btnSave.style.display=`none`,t.btnCancel.style.display=`none`)},hideLoading(){let e=w();e.btnSave&&(e.btnSave.style.display=``,e.btnCancel.style.display=``)}};export{u as a,l as c,_ as i,b as n,o,y as r,s,E as t};