import{i as e,n as t,r as n,t as r}from"./CHANGELOG-DfDNCZ8H.js";var i=[{icon:`bi-lightning-charge-fill`,name:`Vite 8`,color:`#646cff`,desc:`Build tool + Dev server`},{icon:`bi-filetype-js`,name:`Vanilla JS`,color:`#f7df1e`,desc:`ES Modules, sin framework`},{icon:`bi-database-fill`,name:`Supabase`,color:`#3ecf8e`,desc:`PostgreSQL + Realtime + Auth`},{icon:`bi-bootstrap-fill`,name:`Bootstrap 5`,color:`#7952b3`,desc:`CSS utility + componentes`},{icon:`bi-phone-fill`,name:`PWA`,color:`#0ea5e9`,desc:`Service Worker + offline`},{icon:`bi-check2-circle`,name:`Vitest`,color:`#10b981`,desc:`Unit tests + coverage`}];function a(a){let l=n[0],u=e(l.type);a.innerHTML=`
    <div class="sv-root">

      <!-- ── Header ─────────────────────────────────────── -->
      <div class="sv-header">
        <div class="sv-header__left">
          <div class="sv-header__icon">
            <i class="bi bi-cpu-fill"></i>
          </div>
          <div>
            <h2 class="sv-header__title">Sistema SOI</h2>
            <p class="sv-header__sub">Portal Académico · Orquesta Sinfónica de Punta Cana</p>
          </div>
        </div>
        <div class="sv-version-badge">
          <span class="sv-version-num">v${t}</span>
          <span class="sv-version-date">${s(r)}</span>
        </div>
      </div>

      <!-- ── Versión actual destacada ───────────────────── -->
      <div class="sv-latest" style="border-left:4px solid ${u.color};">
        <div class="sv-latest__top">
          <span class="sv-type-badge" style="background:${u.bg};color:${u.color};">
            ${u.label}
          </span>
          <span class="sv-latest__version">v${l.version}</span>
          <span class="sv-latest__date">${s(l.date)}</span>
        </div>
        <h3 class="sv-latest__title">${l.title}</h3>
        <ul class="sv-changes-list">
          ${l.changes.map(e=>`<li>${e}</li>`).join(``)}
        </ul>
        ${l.author?`<p class="sv-latest__author"><i class="bi bi-person-fill me-1"></i>${l.author}</p>`:``}
      </div>

      <!-- ── Grid: timeline + tech stack ───────────────── -->
      <div class="sv-grid">

        <!-- Timeline de versiones anteriores -->
        <div class="sv-section">
          <h4 class="sv-section__title">
            <i class="bi bi-clock-history"></i> Historial de versiones
          </h4>
          <div class="sv-timeline">
            ${n.slice(1).map(e=>o(e)).join(``)}
          </div>
        </div>

        <!-- Panel derecho: tech stack + cómo versionar -->
        <div class="sv-sidebar">

          <!-- Tech stack -->
          <div class="sv-section">
            <h4 class="sv-section__title">
              <i class="bi bi-stack"></i> Tech stack
            </h4>
            <div class="sv-stack-list">
              ${i.map(e=>`
                <div class="sv-stack-item">
                  <i class="bi ${e.icon}" style="color:${e.color};font-size:1.1rem;flex-shrink:0;"></i>
                  <div>
                    <span class="sv-stack-name">${e.name}</span>
                    <span class="sv-stack-desc">${e.desc}</span>
                  </div>
                </div>
              `).join(``)}
            </div>
          </div>

          <!-- Cómo publicar una nueva versión -->
          <div class="sv-section sv-section--how">
            <h4 class="sv-section__title">
              <i class="bi bi-plus-circle"></i> Publicar nueva versión
            </h4>
            <ol class="sv-how-list">
              <li>Abre <code>src/core/version/CHANGELOG.js</code></li>
              <li>Agrega un objeto al inicio del array <code>CHANGELOG</code></li>
              <li>Actualiza <code>APP_VERSION</code> y <code>APP_BUILD_DATE</code></li>
              <li>Haz deploy → la vista Sistema mostrará la nueva versión automáticamente</li>
            </ol>
            <div class="sv-how-types">
              <span class="sv-type-badge" style="background:rgba(59,130,246,0.12);color:#3b82f6;">feature</span>
              <span class="sv-type-badge" style="background:rgba(239,68,68,0.12);color:#ef4444;">fix</span>
              <span class="sv-type-badge" style="background:rgba(239,68,68,0.18);color:#dc2626;">security</span>
              <span class="sv-type-badge" style="background:rgba(139,92,246,0.12);color:#8b5cf6;">refactor</span>
              <span class="sv-type-badge" style="background:rgba(16,185,129,0.12);color:#10b981;">perf</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,c()}function o(t){let n=e(t.type);return`
    <div class="sv-tl-entry">
      <div class="sv-tl-dot" style="background:${n.color};"></div>
      <div class="sv-tl-body">
        <div class="sv-tl-meta">
          <span class="sv-type-badge" style="background:${n.bg};color:${n.color};font-size:0.65rem;">
            ${n.label}
          </span>
          <span class="sv-tl-version">v${t.version}</span>
          <span class="sv-tl-date">${s(t.date)}</span>
        </div>
        <p class="sv-tl-title">${t.title}</p>
        <details class="sv-tl-details">
          <summary>${t.changes.length} cambio${t.changes.length===1?``:`s`}</summary>
          <ul class="sv-changes-list sv-changes-list--sm">
            ${t.changes.map(e=>`<li>${e}</li>`).join(``)}
          </ul>
        </details>
      </div>
    </div>
  `}function s(e){try{return new Date(e+`T12:00:00`).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`long`,year:`numeric`})}catch{return e}}function c(){if(document.getElementById(`sv-styles`))return;let e=document.createElement(`style`);e.id=`sv-styles`,e.textContent=`
  .sv-root {
    padding: 1.25rem 1rem 2rem;
    max-width: 1100px;
    font-family: 'Outfit', 'Inter', system-ui, sans-serif;
    color: var(--pm-text);
  }

  /* ── Header ─────────────────────────────────── */
  .sv-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--pm-border);
  }
  .sv-header__left { display: flex; align-items: center; gap: 0.875rem; }
  .sv-header__icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: var(--pm-primary-light, rgba(59,130,246,0.12));
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem; color: var(--pm-primary, #3b82f6); flex-shrink: 0;
  }
  .sv-header__title { font-size: 1.25rem; font-weight: 700; margin: 0; }
  .sv-header__sub   { font-size: 0.8rem; color: var(--pm-text-muted); margin: 0; }
  .sv-version-badge {
    display: flex; flex-direction: column; align-items: flex-end; gap: 0.15rem;
  }
  .sv-version-num {
    font-size: 1.5rem; font-weight: 800;
    background: linear-gradient(135deg, var(--pm-primary, #3b82f6), #8b5cf6);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    line-height: 1;
  }
  .sv-version-date { font-size: 0.72rem; color: var(--pm-text-muted); }

  /* ── Versión actual ──────────────────────────── */
  .sv-latest {
    background: var(--pm-surface, #fff);
    border: 1px solid var(--pm-border);
    border-radius: 14px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }
  .sv-latest__top {
    display: flex; align-items: center; gap: 0.625rem;
    flex-wrap: wrap; margin-bottom: 0.5rem;
  }
  .sv-latest__version { font-weight: 700; font-size: 0.95rem; }
  .sv-latest__date    { font-size: 0.78rem; color: var(--pm-text-muted); margin-left: auto; }
  .sv-latest__title   { font-size: 1.05rem; font-weight: 600; margin: 0 0 0.875rem; }
  .sv-latest__author  { font-size: 0.75rem; color: var(--pm-text-muted); margin: 0.75rem 0 0; }

  /* ── Type badge ──────────────────────────────── */
  .sv-type-badge {
    padding: 0.2rem 0.55rem; border-radius: 20px;
    font-size: 0.72rem; font-weight: 600; display: inline-block;
  }

  /* ── Changes list ────────────────────────────── */
  .sv-changes-list {
    margin: 0; padding-left: 1.25rem;
    display: flex; flex-direction: column; gap: 0.3rem;
  }
  .sv-changes-list li  { font-size: 0.85rem; color: var(--pm-text); line-height: 1.5; }
  .sv-changes-list--sm li { font-size: 0.78rem; color: var(--pm-text-muted); }

  /* ── Grid layout ─────────────────────────────── */
  .sv-grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1.25rem;
    align-items: start;
  }
  @media (max-width: 900px) {
    .sv-grid { grid-template-columns: 1fr; }
  }

  /* ── Section ─────────────────────────────────── */
  .sv-section {
    background: var(--pm-surface, #fff);
    border: 1px solid var(--pm-border);
    border-radius: 14px;
    padding: 1.1rem 1.25rem;
    margin-bottom: 1rem;
  }
  .sv-section--how { background: var(--pm-surface-2, rgba(255,255,255,0.04)); }
  .sv-section__title {
    font-size: 0.85rem; font-weight: 700; color: var(--pm-text-muted);
    text-transform: uppercase; letter-spacing: 0.06em;
    margin-bottom: 1rem; display: flex; align-items: center; gap: 0.4rem;
  }

  /* ── Timeline ────────────────────────────────── */
  .sv-timeline { display: flex; flex-direction: column; gap: 0; }
  .sv-tl-entry {
    display: flex; gap: 0.875rem; position: relative;
    padding-bottom: 1.25rem;
  }
  .sv-tl-entry:last-child { padding-bottom: 0; }
  .sv-tl-entry:not(:last-child)::before {
    content: ''; position: absolute; left: 7px; top: 18px;
    bottom: 0; width: 2px;
    background: var(--pm-border);
  }
  .sv-tl-dot {
    width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
    margin-top: 2px; z-index: 1; position: relative;
    box-shadow: 0 0 0 3px var(--pm-surface, #fff);
  }
  .sv-tl-body   { flex: 1; min-width: 0; }
  .sv-tl-meta   { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.2rem; }
  .sv-tl-version{ font-weight: 700; font-size: 0.85rem; }
  .sv-tl-date   { font-size: 0.72rem; color: var(--pm-text-muted); margin-left: auto; }
  .sv-tl-title  { font-size: 0.85rem; font-weight: 600; margin: 0 0 0.35rem; }
  .sv-tl-details summary {
    font-size: 0.75rem; color: var(--pm-primary, #3b82f6);
    cursor: pointer; user-select: none; margin-bottom: 0.35rem;
  }

  /* ── Tech stack ──────────────────────────────── */
  .sv-stack-list { display: flex; flex-direction: column; gap: 0.625rem; }
  .sv-stack-item {
    display: flex; align-items: center; gap: 0.625rem;
    padding: 0.45rem 0;
    border-bottom: 1px solid var(--pm-border);
  }
  .sv-stack-item:last-child { border-bottom: none; }
  .sv-stack-name { font-size: 0.85rem; font-weight: 600; display: block; }
  .sv-stack-desc { font-size: 0.72rem; color: var(--pm-text-muted); display: block; }

  /* ── How to release ──────────────────────────── */
  .sv-how-list {
    padding-left: 1.25rem; margin: 0 0 0.875rem;
    display: flex; flex-direction: column; gap: 0.35rem;
  }
  .sv-how-list li  { font-size: 0.82rem; color: var(--pm-text); line-height: 1.55; }
  .sv-how-list code{
    background: var(--pm-surface-2, rgba(0,0,0,0.06));
    padding: 0.1rem 0.35rem; border-radius: 4px;
    font-size: 0.78rem; font-family: monospace;
  }
  .sv-how-types { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  `,document.head.appendChild(e)}export{a as renderSistemaView};