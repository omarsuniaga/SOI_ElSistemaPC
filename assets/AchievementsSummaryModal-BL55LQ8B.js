import{i as e}from"./portalUtils-BqwkK1cV.js";function t(t,n){if(!n||n.length===0)return;let r=document.createElement(`div`);r.className=`pm-modal-overlay pm-animate-fade-in`,r.style.zIndex=`9999`;let i=document.createElement(`div`);return i.className=`pm-modal-content pm-achievements-modal pm-animate-scale-up`,i.innerHTML=`
    <style>
      .pm-achievements-modal {
        max-width: 400px;
        text-align: center;
        padding: 2rem;
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        border: 1px solid rgba(255,255,255,0.3);
      }
      .pm-achievement-header-icon {
        width: 70px;
        height: 70px;
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
        color: white;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.5rem;
        margin: 0 auto 1.5rem;
        box-shadow: 0 10px 20px rgba(255, 165, 0, 0.3);
      }
      .pm-achievements-title {
        font-size: 1.5rem;
        font-weight: 800;
        margin-bottom: 0.5rem;
        color: var(--apple-text);
      }
      .pm-achievements-subtitle {
        font-size: 0.95rem;
        color: var(--apple-text-muted);
        margin-bottom: 2rem;
      }
      .pm-achievements-list {
        text-align: left;
        max-height: 300px;
        overflow-y: auto;
        margin-bottom: 2rem;
        padding-right: 5px;
      }
      .pm-achievement-item {
        background: rgba(0,0,0,0.03);
        border-radius: 16px;
        padding: 1rem;
        margin-bottom: 1rem;
      }
      .pm-student-name {
        font-weight: 700;
        font-size: 1rem;
        display: block;
        margin-bottom: 0.5rem;
      }
      .pm-achievement-details {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      .pm-badge-node {
        background: rgba(52, 199, 89, 0.1);
        color: #248a3d;
        padding: 4px 10px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .pm-badge-level {
        background: rgba(0, 122, 255, 0.1);
        color: #007aff;
        padding: 4px 10px;
        border-radius: 10px;
        font-size: 0.8rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 4px;
        width: 100%;
        margin-top: 4px;
      }
      .pm-btn-finish {
        width: 100%;
        padding: 14px;
        border-radius: 16px;
        border: none;
        background: var(--apple-text);
        color: white;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }
      .pm-btn-finish:active { transform: scale(0.98); opacity: 0.9; }
    </style>
    
    
    <div class="pm-achievement-header-icon">
      <i class="bi bi-trophy-fill"></i>
    </div>
  
    <h2 class="pm-achievements-title">¡Logros alcanzados!</h2>
    <p class="pm-achievements-subtitle">Los alumnos han avanzado en su ruta académica hoy.</p>
    
    <div class="pm-achievements-list">
      ${n.map(t=>`
    <div class="pm-achievement-item">
      <div class="pm-achievement-student">
        <span class="pm-student-name">${e(t.studentName)}</span>
      </div>
      <div class="pm-achievement-details">
        ${t.approvedNodes.map(t=>`
          <div class="pm-badge-node">
            <i class="bi bi-check-circle-fill"></i>
            <span>${e(t)}</span>
          </div>
        `).join(``)}
        ${t.levelPromoted?`
          <div class="pm-badge-level">
            <i class="bi bi-arrow-up-circle-fill"></i>
            <span>Promovido a: ${e(t.levelPromoted)}</span>
          </div>
        `:``}
      </div>
    </div>
  `).join(``)}
    </div>
    
    <button class="pm-btn-finish" id="pm-achievements-close">Continuar</button>
  `,r.appendChild(i),t.appendChild(r),new Promise(e=>{i.querySelector(`#pm-achievements-close`).onclick=()=>{r.classList.remove(`pm-animate-fade-in`),r.classList.add(`pm-animate-fade-out`),i.classList.add(`pm-animate-scale-down`),setTimeout(()=>{r.remove(),e()},300)}})}export{t as createAchievementsSummaryModal};