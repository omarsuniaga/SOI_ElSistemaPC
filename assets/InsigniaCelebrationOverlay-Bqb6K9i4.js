const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/rive-B7RGPpMv.js","assets/AppModal-Du6jXNYA.js"])))=>i.map(i=>d[i]);
import{c as e}from"./AppModal-Du6jXNYA.js";import{a as t}from"./supabase-Cgh_dhNB.js";import{i as n}from"./portalUtils-CkF82Yyk.js";var r=`/assets/rive/celebracion-logro.riv`;function i(e){e.querySelector(`.ico-canvas-slot`).innerHTML=`
    <div class="ico-fallback-emoji" aria-hidden="true">🎉</div>
  `}async function a(n,i){try{let{Rive:a,Fit:o,Layout:s,Alignment:c}=await t(async()=>{let{Rive:t,Fit:n,Layout:r,Alignment:i}=await import(`./rive-B7RGPpMv.js`).then(t=>e(t.default,1));return{Rive:t,Fit:n,Layout:r,Alignment:i}},__vite__mapDeps([0,1]));new a({src:r,canvas:n,autoplay:!0,layout:new s({fit:o.Contain,alignment:c.Center}),onLoad:()=>i(!0),onLoadError:()=>i(!1)})}catch(e){console.warn(`[InsigniaCelebrationOverlay] Error cargando runtime de Rive:`,e),i(!1)}}function o(e){if(!e?.nombre)return Promise.resolve();let t=document.createElement(`div`);return t.className=`ico-overlay pm-animate-fade-in`,t.innerHTML=`
    <div class="ico-card pm-animate-scale-up">
      <div class="ico-canvas-slot">
        <canvas class="ico-rive-canvas" width="220" height="220"></canvas>
      </div>
      <h3 class="ico-titulo">¡Nueva insignia!</h3>
      <p class="ico-logro-nombre"><i class="bi bi-${n(e.icono||`award-fill`)}"></i> ${n(e.nombre)}</p>
      ${e.descripcion?`<p class="ico-logro-desc">${n(e.descripcion)}</p>`:``}
      <button class="ico-btn-cerrar" id="ico-cerrar">Genial</button>
    </div>
  `,document.body.appendChild(t),a(t.querySelector(`.ico-rive-canvas`),e=>{e||i(t)}),new Promise(e=>{t.querySelector(`#ico-cerrar`).addEventListener(`click`,()=>{t.classList.add(`pm-animate-fade-out`),setTimeout(()=>{t.remove(),e()},250)})})}if(typeof document<`u`&&!document.getElementById(`ico-styles`)){let e=document.createElement(`style`);e.id=`ico-styles`,e.textContent=`
    .ico-overlay {
      position: fixed; inset: 0; background: rgba(15,23,42,0.7);
      display: flex; align-items: center; justify-content: center;
      z-index: 10000; padding: 1rem;
    }
    .ico-card {
      background: #fff; border-radius: 24px; padding: 2rem;
      max-width: 340px; width: 100%; text-align: center;
      box-shadow: 0 24px 64px rgba(0,0,0,0.3);
    }
    .ico-canvas-slot { width: 220px; height: 220px; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; }
    .ico-rive-canvas { max-width: 100%; }
    .ico-fallback-emoji { font-size: 5rem; line-height: 1; animation: ico-bounce 0.6s ease-in-out; }
    @keyframes ico-bounce { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); } }
    .ico-titulo { font-size: 1.3rem; font-weight: 800; margin: 0 0 0.5rem; color: var(--pm-text, #111827); }
    .ico-logro-nombre { font-size: 1rem; font-weight: 700; color: #d97706; margin: 0 0 0.35rem; }
    .ico-logro-desc { font-size: 0.85rem; color: var(--pm-text-muted, #6b7280); margin: 0 0 1.25rem; }
    .ico-btn-cerrar {
      width: 100%; padding: 0.75rem; border-radius: 14px; border: none;
      background: #f59e0b; color: #fff; font-size: 0.95rem; font-weight: 700; cursor: pointer;
    }
    .ico-btn-cerrar:active { transform: scale(0.98); opacity: 0.9; }
  `,document.head.appendChild(e)}export{o as default};