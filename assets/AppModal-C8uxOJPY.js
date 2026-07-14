var e={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`,"/":`&#x2F;`};function t(t){return t==null?``:String(t).replace(/[&<>"'/]/g,t=>e[t])}var n=`app-global-modal`,r=`app-global-backdrop`;function i(){if(document.getElementById(n))return;let e=document.createElement(`style`);e.id=`${n}-styles`,e.textContent=`
    #${n} .app-modal-dialog {
      display: flex;
      flex-direction: column;
      width: 90vw;
      max-width: 90vw;
      max-height: 90vh;
    }

    #${n} .app-modal-body {
      flex: 1 1 auto;
      overflow: auto;
      min-height: 0;
    }

    #${n} .app-modal-header,
    #${n} .app-modal-footer {
      flex-shrink: 0;
    }

    @media (max-width: 767.98px) {
      #${n} {
        padding: 0.5rem;
      }

      #${n} .app-modal-dialog {
        width: 95vw;
        max-width: 95vw;
        max-height: 92vh;
        border-radius: 14px;
      }

      #${n} .app-modal-header,
      #${n} .app-modal-body,
      #${n} .app-modal-footer {
        padding-left: 0.9rem !important;
        padding-right: 0.9rem !important;
      }
    }
  `,document.head.appendChild(e);let t=document.createElement(`div`);t.id=r,t.style.cssText=`
    display:none;position:fixed;inset:0;
    background:var(--pm-backdrop, rgba(0,0,0,0.55));
    backdrop-filter:blur(4px);
    z-index:10800;
    transition:opacity .2s ease;
    opacity:0;
  `,document.body.appendChild(t);let i=document.createElement(`div`);i.id=n,i.setAttribute(`role`,`dialog`),i.setAttribute(`aria-modal`,`true`),i.style.cssText=`
    display:none;position:fixed;inset:0;
    z-index:10801;
    overflow-y:auto;
    padding:1.5rem;
    align-items:center;
    justify-content:center;
  `,i.innerHTML=`
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
  `,document.body.appendChild(i)}function a(){return{backdrop:document.getElementById(r),modal:document.getElementById(n),dialog:document.querySelector(`#${n} .app-modal-dialog`),title:document.querySelector(`#${n} .app-modal-title`),body:document.querySelector(`#${n} .app-modal-body`),closeX:document.querySelector(`#${n} .app-modal-close-x`),btnCancel:document.querySelector(`#${n} .app-modal-btn-cancel`),btnSave:document.querySelector(`#${n} .app-modal-btn-save`),btnDelete:document.querySelector(`#${n} .app-modal-btn-delete`),saveText:document.querySelector(`#${n} .app-modal-save-text`)}}var o={sm:`400px`,md:`520px`,lg:`720px`,xl:`960px`},s={_saveHandler:null,_cancelHandler:null,_keydownHandler:null,open({title:e=``,body:t=``,saveText:n=`Guardar`,cancelText:r=`Cancelar`,deleteText:s=`Eliminar`,onSave:c=null,onCancel:l=null,onDelete:u=null,onShow:d=null,onOpen:f=null,size:p=`md`,hideSave:m=!1}={}){i();let h=a(),g=h.dialog.querySelector(`.app-modal-footer`);g&&g.style.removeProperty(`display`),h.dialog.style.maxWidth=o[p]||o.md,h.title.textContent=e,typeof t==`string`?h.body.innerHTML=t:t instanceof HTMLElement&&(h.body.innerHTML=``,h.body.appendChild(t)),d&&d(h.body),f&&setTimeout(()=>f(h.body),280),this.resetSaveBtn(n),h.btnCancel.textContent=r,h.btnSave.style.display=m?`none`:``,u?(h.btnDelete.textContent=s,h.btnDelete.style.display=`block`):h.btnDelete.style.display=`none`,setTimeout(()=>{let e=h.body.querySelector(`input,select,textarea`);e&&e.focus()},280),this._detachHandlers(),this._keydownHandler=e=>{e.key===`Escape`&&(this._cancelHandler?this._cancelHandler():this.close())},document.addEventListener(`keydown`,this._keydownHandler),this._saveHandler=async()=>{if(c){let e=h.btnSave,t=e.innerHTML;e.disabled=!0,e.innerHTML=`<span class="spinner-border spinner-border-sm me-1" role="status"></span>`;try{await c(h.body)===!1?(e.disabled=!1,e.innerHTML=t):this.close()}catch{e.disabled=!1,e.innerHTML=t}}else this.close()},this._cancelHandler=()=>{l&&l(),this.close()},this._deleteHandler=async()=>{if(!u||!confirm(`¿Estás seguro de que querés eliminar este elemento? Esta acción no se puede deshacer.`))return;let e=h.btnDelete.innerHTML;h.btnDelete.disabled=!0,h.btnDelete.innerHTML=`<span class="spinner-border spinner-border-sm" role="status"></span>`;try{await u()===!1?(h.btnDelete.disabled=!1,h.btnDelete.innerHTML=e):this.close()}catch{h.btnDelete.disabled=!1,h.btnDelete.innerHTML=e}},h.btnSave.addEventListener(`click`,this._saveHandler),h.btnCancel.addEventListener(`click`,this._cancelHandler),h.closeX.addEventListener(`click`,this._cancelHandler),h.btnDelete.addEventListener(`click`,this._deleteHandler),h.closeX.onmouseenter=()=>{h.closeX.style.background=`var(--bs-secondary-bg)`,h.closeX.style.color=`var(--bs-body-color)`},h.closeX.onmouseleave=()=>{h.closeX.style.background=`none`,h.closeX.style.color=`var(--bs-secondary-color)`},h.backdrop.style.display=`block`,h.modal.style.display=`flex`,document.body.style.overflow=`hidden`,requestAnimationFrame(()=>{h.backdrop.style.opacity=`1`,h.dialog.style.opacity=`1`,h.dialog.style.transform=`translateY(0) scale(1)`})},close(){if(!document.getElementById(n))return;let e=a();e.backdrop.style.opacity=`0`,e.dialog.style.opacity=`0`,e.dialog.style.transform=`translateY(20px) scale(0.97)`,this._detachHandlers(),setTimeout(()=>{e.backdrop.style.display=`none`,e.modal.style.display=`none`,e.body.innerHTML=``,document.body.style.overflow=``},220)},_detachHandlers(){let e=a();e.btnSave&&(this._saveHandler&&e.btnSave.removeEventListener(`click`,this._saveHandler),this._cancelHandler&&(e.btnCancel.removeEventListener(`click`,this._cancelHandler),e.closeX.removeEventListener(`click`,this._cancelHandler)),this._deleteHandler&&e.btnDelete.removeEventListener(`click`,this._deleteHandler),this._keydownHandler&&document.removeEventListener(`keydown`,this._keydownHandler),this._saveHandler=null,this._cancelHandler=null,this._deleteHandler=null,this._keydownHandler=null)},resetSaveBtn(e=`Guardar`){let t=document.querySelector(`#${n} .app-modal-btn-save`);t&&(t.disabled=!1,t.innerHTML=`<span class="app-modal-save-text">${e}</span>`)},setSaveHandler(e,t=null){let n=a();n.btnSave&&(this._saveHandler&&n.btnSave.removeEventListener(`click`,this._saveHandler),t&&this.resetSaveBtn(t),this._saveHandler=async()=>{let t=n.btnSave,r=t.innerHTML;t.disabled=!0,t.innerHTML=`<span class="spinner-border spinner-border-sm me-1" role="status"></span>`;try{await e(n.body)===!1?(t.disabled=!1,t.innerHTML=r):this.close()}catch{t.disabled=!1,t.innerHTML=r}},n.btnSave.addEventListener(`click`,this._saveHandler))},showLoading(e=`Cargando...`){let n=a();n.body&&(n.body.innerHTML=`
      <div class="d-flex flex-column align-items-center justify-content-center py-5">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="text-muted mb-0">${t(e)}</p>
      </div>
    `,n.btnSave.style.display=`none`,n.btnCancel.style.display=`none`)},hideLoading(){let e=a();e.btnSave&&(e.btnSave.style.display=``,e.btnCancel.style.display=``)}};export{t as n,s as t};