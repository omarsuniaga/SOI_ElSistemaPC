import{r as e}from"./AppModal-Du6jXNYA.js";import{a as t}from"./supabase-Cgh_dhNB.js";function n(e,t={}){let{placement:n=`top`,className:r=``}=t;return`
    <span
      class="info-tooltip ${r}"
      data-term="${e}"
      data-placement="${n}"
      title="Click para más info"
      role="button"
      tabindex="0"
    >
      <i class="bi bi-info-circle-fill"></i>
    </span>
  `}function r(e){e&&e.querySelectorAll(`.info-tooltip`).forEach(e=>{let t=e.dataset.term;t&&(e.addEventListener(`click`,e=>{e.stopPropagation(),i(t)}),e.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),i(t))}))})}async function i(n){let{glossary:r}=await t(async()=>{let{glossary:e}=await import(`./metrics-glossary-BCLh5qxX.js`);return{glossary:e}},[]),i=r[n];if(!i)return;let a=document.getElementById(`infoModalBackdrop`);a&&a.remove();let o=document.createElement(`div`);o.id=`infoModalBackdrop`,o.className=`info-modal-backdrop`,o.innerHTML=`
    <div class="info-modal-content">
      <div class="info-modal-header">
        <h5>${e(i.title)}</h5>
        <button class="info-modal-close" aria-label="Cerrar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="info-modal-body">
        <p>${e(i.description)}</p>
        ${i.example?`<p class="text-muted"><small><strong>Ej:</strong> ${e(i.example)}</small></p>`:``}
      </div>
    </div>
  `,document.body.appendChild(o),o.querySelector(`.info-modal-close`).addEventListener(`click`,()=>o.remove()),o.addEventListener(`click`,e=>{e.target===o&&o.remove()})}function a(){let e=`info-tooltip-styles`;if(document.getElementById(e))return;let t=document.createElement(`style`);t.id=e,t.textContent=`
    .info-tooltip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      margin-left: 0.4rem;
      color: var(--bs-info, #0dcaf0);
      cursor: pointer;
      font-size: 0.9rem;
      vertical-align: middle;
      transition: color 0.2s;
    }

    .info-tooltip:hover {
      color: var(--bs-info-focus, #0ab8e6);
      opacity: 0.8;
    }

    .info-tooltip:focus {
      outline: 2px solid var(--bs-info);
      outline-offset: 2px;
      border-radius: 50%;
    }

    .info-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .info-modal-content {
      background: var(--bs-body-bg);
      border-radius: 0.5rem;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 90%;
      overflow: hidden;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .info-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--bs-border-color);
      background: var(--bs-secondary-bg);
    }

    .info-modal-header h5 {
      margin: 0;
      font-weight: 600;
      color: var(--bs-body-color);
    }

    .info-modal-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--bs-secondary);
      transition: color 0.2s;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
    }

    .info-modal-close:hover {
      color: var(--bs-body-color);
      background: var(--bs-border-color);
    }

    .info-modal-body {
      padding: 1rem;
      font-size: 0.95rem;
      line-height: 1.5;
      color: var(--bs-body-color);
    }

    .info-modal-body p {
      margin-bottom: 0.75rem;
    }

    .info-modal-body p:last-child {
      margin-bottom: 0;
    }
  `,document.head.appendChild(t)}export{r as n,a as r,n as t};