import{a as e,i as t,n,r,t as i}from"./CHANGELOG-CNg1HUtO.js";import{t as a}from"./AppToast-BfOaB9z8.js";import{a as o,n as s}from"./groqService-BHtbKQwk.js";var c=[{table:`observations`,columns:[`student_id`,`created_at`],name:`obs_student_date`,type:`btree`,reason:`Query by student over time`},{table:`observations`,columns:[`maestro_id`,`created_at`],name:`obs_maestro_date`,type:`btree`,reason:`Teacher view of observations`},{table:`evaluations`,columns:[`student_id`,`route_id`],name:`eval_student_route`,type:`btree`,reason:`Progress tracking queries`},{table:`audit_logs`,columns:[`user_id`,`created_at`],name:`audit_user_date`,type:`btree`,reason:`Audit log queries`},{table:`notifications`,columns:[`user_id`,`leida`,`created_at`],name:`notif_user_read_date`,type:`btree`,reason:`Notification fetching`},{table:`lesson_plans`,columns:[`maestro_id`,`published`,`created_at`],name:`plan_maestro_published`,type:`btree`,reason:`Teacher lesson plans`},{table:`students`,columns:[`maestro_id`,`route_id`],name:`student_maestro_route`,type:`btree`,reason:`Student roster queries`}],l={totalQueries:0,slowQueries:0,indexHits:0,indexMisses:0};function u(){return[...c]}function d(){return{...l}}function f(e){if(!e)return{success:!1,error:`No SQL provided`};try{let t=e.match(/CREATE\s+INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+ON\s+(\w+)\s*\(([^)]+)\)/i);if(!t)return{success:!1,error:`Could not parse SQL statement format`};let[,n,r,i]=t,a=i.split(`,`).map(e=>e.trim().replace(/['"`]/g,``));return c.some(e=>e.name.toLowerCase()===n.toLowerCase())?{success:!0,message:`Index '${n}' already exists.`,added:!1}:(c.push({table:r.toLowerCase(),columns:a,name:n,type:`btree`,reason:`AI/User optimized`}),{success:!0,message:`Index '${n}' applied successfully.`,added:!0})}catch(e){return{success:!1,error:e.message}}}var p=`v1`;function m(){return p}async function h(){if(typeof caches>`u`)return{success:!1,error:`Caches API not available`};try{let e=await caches.keys(),t=e.map(e=>caches.delete(e));return await Promise.all(t),console.log(`[SW] All caches cleared`),{success:!0,deleted:e.length}}catch(e){return console.error(`[SW] Failed to clear cache:`,e),{success:!1,error:e.message}}}var g=`
Eres un agente de diagnóstico inteligente del Sistema SOI (Sistema Operativo Institucional).
Analizas las métricas de rendimiento, estadísticas de consultas de base de datos, caché del Service Worker y logs de errores recientes para generar un diagnóstico y sugerencias de auto-mantenimiento.

Debes responder ÚNICAMENTE con un objeto JSON estructurado con el siguiente formato exacto:
{
  "healthScore": 85, // número del 0 al 100 indicando la salud general del sistema
  "findings": [ // lista de hallazgos
    {
      "severity": "critical" | "warning" | "info",
      "msg": "Descripción breve del problema detectado (máx 80 caracteres)."
    }
  ],
  "recommendations": {
    "sql": "CREATE INDEX IF NOT EXISTS...", // SQL sugerido para optimizar las consultas lentas detectadas, o null si no se requiere.
    "cache": "clear" | "keep", // Sugerencia sobre si es conveniente vaciar la caché PWA para solucionar errores detectados.
    "advice": "Consejo o recomendación pedagógica/arquitectónica de 1 frase (máx 120 caracteres)."
  }
}

Reglas:
1. Sé extremadamente honesto con el healthScore: si hay múltiples errores capturados, baja el score. Si las estadísticas de consultas muestran fallos de índice (index Misses), baja el score.
2. Si las estadísticas muestran index misses elevadas en ciertas columnas, propone el SQL de creación de índice adecuado en "sql".
3. Responde únicamente con el JSON válido, sin bloques de código markdown, sin prefijos, sin explicaciones externas.
`;async function _(){let t=d(),n=u(),r=e(),i={queryStats:t,definedIndexes:n,recentErrors:r,cacheVersion:m(),timestamp:new Date().toISOString(),userAgent:typeof navigator<`u`?navigator.userAgent:`NodeJS-Test-Env`},a=[{role:`system`,content:g},{role:`user`,content:JSON.stringify(i)}];try{let e=o(await s(a));return{healthScore:typeof e.healthScore==`number`?Math.min(100,Math.max(0,e.healthScore)):100,findings:Array.isArray(e.findings)?e.findings:[],recommendations:{sql:e.recommendations?.sql||null,cache:e.recommendations?.cache||`keep`,advice:e.recommendations?.advice||`El sistema funciona de forma óptima.`}}}catch(e){console.error(`[aiDiagnosticService] Failed to run AI diagnostics:`,e);let n=r.length>0,i=t.indexMisses>t.indexHits;return{healthScore:n?70:i?85:95,findings:[...n?[{severity:`critical`,msg:`Se detectaron ${r.length} errores recientes en el reportero.`}]:[],...i?[{severity:`warning`,msg:`Elevada tasa de búsquedas secuenciales (misses de índice).`}]:[],{severity:`info`,msg:`Modo de contingencia: diagnóstico local básico (IA offline).`}],recommendations:{sql:i?`CREATE INDEX IF NOT EXISTS obs_student_date ON observations (student_id, created_at);`:null,cache:n?`clear`:`keep`,advice:`Conexión con el servicio de IA no disponible. Se aplicó el diagnóstico heurístico local.`}}}}var v=[{icon:`bi-lightning-charge-fill`,name:`Vite 8`,color:`#646cff`,desc:`Build tool + Dev server`},{icon:`bi-filetype-js`,name:`Vanilla JS`,color:`#f7df1e`,desc:`ES Modules, sin framework`},{icon:`bi-database-fill`,name:`Supabase`,color:`#3ecf8e`,desc:`PostgreSQL + Realtime + Auth`},{icon:`bi-bootstrap-fill`,name:`Bootstrap 5`,color:`#7952b3`,desc:`CSS utility + componentes`},{icon:`bi-phone-fill`,name:`PWA`,color:`#0ea5e9`,desc:`Service Worker + offline`},{icon:`bi-check2-circle`,name:`Vitest`,color:`#10b981`,desc:`Unit tests + coverage`}];function y(e){let a=r[0],o=t(a.type);e.innerHTML=`
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
          <span class="sv-version-num">v${n}</span>
          <span class="sv-version-date">${x(i)}</span>
        </div>
      </div>

      <!-- ── Versión actual destacada ───────────────────── -->
      <div class="sv-latest" style="border-left:4px solid ${o.color};">
        <div class="sv-latest__top">
          <span class="sv-type-badge" style="background:${o.bg};color:${o.color};">
            ${o.label}
          </span>
          <span class="sv-latest__version">v${a.version}</span>
          <span class="sv-latest__date">${x(a.date)}</span>
        </div>
        <h3 class="sv-latest__title">${a.title}</h3>
        <ul class="sv-changes-list">
          ${a.changes.map(e=>`<li>${e}</li>`).join(``)}
        </ul>
        ${a.author?`<p class="sv-latest__author"><i class="bi bi-person-fill me-1"></i>${a.author}</p>`:``}
      </div>

      <!-- ── Panel de Auditoría y Diagnóstico IA ───────── -->
      <div class="sv-ai-panel">
        <div class="sv-ai-header">
          <div class="sv-ai-title-wrap">
            <div class="sv-ai-icon-pulse">
              <i class="bi bi-robot"></i>
            </div>
            <div>
              <h3 class="sv-ai-title">Auditoría y Diagnóstico IA</h3>
              <p class="sv-ai-desc">Monitoreo inteligente auto-mantenible en tiempo real</p>
            </div>
          </div>
          <button id="btn-diagnose" class="btn-diagnose-pulse">
            <span class="spinner-border spinner-border-sm me-2 d-none" id="diagnose-spinner" role="status"></span>
            <i class="bi bi-shield-shaded me-1" id="diagnose-icon"></i>
            <span id="diagnose-btn-text">Diagnosticar Sistema con IA</span>
          </button>
        </div>

        <!-- Contenedor del diagnóstico -->
        <div id="ai-output-container" class="sv-ai-output d-none">
          <div class="row g-4 align-items-center">
            
            <!-- Izquierda: Health score meter -->
            <div class="col-md-4 text-center d-flex flex-column align-items-center justify-content-center">
              <div class="svg-meter-container">
                <svg class="svg-meter" viewBox="0 0 100 100">
                  <circle class="svg-meter-bg" cx="50" cy="50" r="40" />
                  <circle class="svg-meter-value" id="svg-meter-progress" cx="50" cy="50" r="40" />
                </svg>
                <div class="svg-meter-text">
                  <span id="health-score-val">0</span>
                  <span class="health-score-label">Salud</span>
                </div>
              </div>
              <div id="health-score-status" class="health-status-badge mt-2"></div>
            </div>

            <!-- Derecha: Hallazgos y Acciones -->
            <div class="col-md-8">
              <div class="findings-container mb-3">
                <h5 class="findings-title"><i class="bi bi-list-stars me-1 text-primary"></i> Hallazgos de Auditoría</h5>
                <div id="findings-list" class="findings-list"></div>
              </div>

              <!-- Workspace de optimización -->
              <div class="recommendations-workspace p-3 rounded">
                <h6 class="work-title mb-2"><i class="bi bi-magic me-1 text-warning"></i> Recomendaciones de Optimización</h6>
                
                <!-- SQL indexes -->
                <div id="sql-recommendation-box" class="rec-sub-box d-none mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="rec-label text-success"><i class="bi bi-database-check me-1"></i> Índices de Base de Datos</span>
                    <button id="btn-apply-indexes" class="btn btn-sm btn-outline-success">
                      <i class="bi bi-arrow-repeat me-1"></i> Aplicar Índices
                    </button>
                  </div>
                  <pre class="sql-code-preview m-0" id="sql-preview-text"></pre>
                </div>

                <!-- Cache strategy -->
                <div id="cache-recommendation-box" class="rec-sub-box d-none mb-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <span class="rec-label text-info"><i class="bi bi-phone-vibrate me-1"></i> Optimización de Caché PWA</span>
                      <p class="rec-desc-text m-0 text-muted" id="cache-desc-text"></p>
                    </div>
                    <button id="btn-optimize-cache" class="btn btn-sm btn-outline-info">
                      <i class="bi bi-trash3 me-1"></i> Optimizar Caché
                    </button>
                  </div>
                </div>

                <!-- AI advice message -->
                <div class="ai-advice-box">
                  <i class="bi bi-chat-quote-fill text-muted me-2"></i>
                  <span id="ai-advice-text" class="fst-italic text-muted"></span>
                </div>
              </div>

            </div>

          </div>
        </div>

        <div id="ai-placeholder-container" class="sv-ai-placeholder p-4 text-center text-muted">
          <i class="bi bi-activity mb-2 d-block fs-3 opacity-50"></i>
          <p class="m-0 fs-7">Presiona el botón superior para realizar un diagnóstico completo de rendimiento y base de datos con IA.</p>
        </div>
      </div>

      <!-- ── Grid: timeline + tech stack ───────────────── -->
      <div class="sv-grid">

        <!-- Timeline de versiones anteriores -->
        <div class="sv-section">
          <h4 class="sv-section__title">
            <i class="bi bi-clock-history"></i> Historial de versiones
          </h4>
          <div class="sv-timeline">
            ${r.slice(1).map(e=>b(e)).join(``)}
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
              ${v.map(e=>`
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
  `,S(),C(e)}function b(e){let n=t(e.type);return`
    <div class="sv-tl-entry">
      <div class="sv-tl-dot" style="background:${n.color};"></div>
      <div class="sv-tl-body">
        <div class="sv-tl-meta">
          <span class="sv-type-badge" style="background:${n.bg};color:${n.color};font-size:0.65rem;">
            ${n.label}
          </span>
          <span class="sv-tl-version">v${e.version}</span>
          <span class="sv-tl-date">${x(e.date)}</span>
        </div>
        <p class="sv-tl-title">${e.title}</p>
        <details class="sv-tl-details">
          <summary>${e.changes.length} cambio${e.changes.length===1?``:`s`}</summary>
          <ul class="sv-changes-list sv-changes-list--sm">
            ${e.changes.map(e=>`<li>${e}</li>`).join(``)}
          </ul>
        </details>
      </div>
    </div>
  `}function x(e){try{return new Date(e+`T12:00:00`).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`long`,year:`numeric`})}catch{return e}}function S(){if(document.getElementById(`sv-styles`))return;let e=document.createElement(`style`);e.id=`sv-styles`,e.textContent=`
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

  /* ── AI Panel Glassmorphism ─────────────────── */
  .sv-ai-panel {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  [data-bs-theme="dark"] .sv-ai-panel,
  .sv-ai-panel.dark-mode {
    background: rgba(17, 25, 40, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.125);
  }

  .sv-ai-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 1rem;
  }

  .sv-ai-title-wrap {
    display: flex;
    align-items: center;
    gap: 0.85rem;
  }

  .sv-ai-icon-pulse {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: rgba(99, 102, 241, 0.15);
    color: #6366f1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
    animation: iconPulse 2s infinite alternate;
  }

  @keyframes iconPulse {
    0% { transform: scale(1); box-shadow: 0 0 5px rgba(99, 102, 241, 0.2); }
    100% { transform: scale(1.08); box-shadow: 0 0 15px rgba(99, 102, 241, 0.5); }
  }

  .sv-ai-title {
    font-size: 1.15rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .sv-ai-desc {
    font-size: 0.78rem;
    color: var(--pm-text-muted, #6c757d);
    margin: 0;
  }

  .btn-diagnose-pulse {
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: #fff;
    border: none;
    padding: 0.6rem 1.25rem;
    border-radius: 10px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-diagnose-pulse:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
    background: linear-gradient(135deg, #4f46e5, #4338ca);
  }

  .btn-diagnose-pulse:active {
    transform: translateY(1px);
  }

  .btn-diagnose-pulse:disabled {
    background: #6c757d;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  /* ── SVG Health Meter ───────────────────────── */
  .svg-meter-container {
    position: relative;
    width: 130px;
    height: 130px;
  }

  .svg-meter {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .svg-meter-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.05);
    stroke-width: 8;
  }

  .svg-meter-value {
    fill: none;
    stroke: #10b981;
    stroke-width: 8;
    stroke-linecap: round;
    stroke-dasharray: 251.2;
    stroke-dashoffset: 251.2;
    transition: stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease;
  }

  .svg-meter-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  #health-score-val {
    font-size: 1.8rem;
    font-weight: 800;
    line-height: 1;
    color: var(--pm-text, #fff);
  }

  .health-score-label {
    font-size: 0.65rem;
    color: var(--pm-text-muted, #6c757d);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .health-status-badge {
    padding: 0.25rem 0.65rem;
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .health-status-critical { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
  .health-status-warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
  .health-status-healthy { background: rgba(16, 185, 129, 0.15); color: #10b981; }

  /* ── Audit Findings ─────────────────────────── */
  .findings-container {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 0.85rem 1rem;
  }

  .findings-title {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.65rem;
  }

  .findings-list {
    max-height: 140px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    padding-right: 0.25rem;
  }

  /* Custom scrollbar */
  .findings-list::-webkit-scrollbar {
    width: 4px;
  }
  .findings-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  .finding-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.78rem;
    padding: 0.35rem 0.5rem;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.01);
  }

  .finding-badge {
    font-size: 0.6rem;
    font-weight: 800;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    text-transform: uppercase;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .finding-badge-critical { background: #ef4444; color: #fff; }
  .finding-badge-warning  { background: #f59e0b; color: #fff; }
  .finding-badge-info     { background: #3b82f6; color: #fff; }

  .finding-msg {
    color: var(--pm-text, #fff);
  }

  /* ── Recommendations Workspace ──────────────── */
  .recommendations-workspace {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .work-title {
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .rec-sub-box {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 0.75rem 1rem;
  }

  .rec-label {
    font-size: 0.75rem;
    font-weight: 700;
  }

  .sql-code-preview {
    font-family: 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 0.72rem;
    background: #0d0e12;
    padding: 0.6rem;
    border-radius: 6px;
    color: #38bdf8;
    overflow-x: auto;
    border: 1px solid rgba(255, 255, 255, 0.05);
    margin-top: 0.45rem !important;
  }

  .rec-desc-text {
    font-size: 0.72rem;
    opacity: 0.8;
  }

  .ai-advice-box {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    border-left: 2px solid #8b5cf6;
  }
  `,document.head.appendChild(e)}function C(e){let t=e.querySelector(`#btn-diagnose`),n=e.querySelector(`#diagnose-spinner`),r=e.querySelector(`#diagnose-icon`),i=e.querySelector(`#diagnose-btn-text`),o=e.querySelector(`#ai-output-container`),s=e.querySelector(`#ai-placeholder-container`),c=e.querySelector(`#health-score-val`),l=e.querySelector(`#health-score-status`),u=e.querySelector(`#svg-meter-progress`),d=e.querySelector(`#findings-list`),p=e.querySelector(`#sql-recommendation-box`),m=e.querySelector(`#sql-preview-text`),g=e.querySelector(`#btn-apply-indexes`),v=e.querySelector(`#cache-recommendation-box`),y=e.querySelector(`#cache-desc-text`),b=e.querySelector(`#btn-optimize-cache`),x=e.querySelector(`#ai-advice-text`),S=null;t&&(t.addEventListener(`click`,async()=>{t.disabled=!0,n.classList.remove(`d-none`),r.classList.add(`d-none`),i.textContent=`Analizando sistema...`;try{let e=await _();s.classList.add(`d-none`),o.classList.remove(`d-none`);let t=e.healthScore;c.textContent=t;let n=251.2-251.2*t/100;u.style.strokeDashoffset=n,l.className=`health-status-badge mt-2`,t>=90?(u.style.stroke=`#10b981`,l.textContent=`Saludable`,l.classList.add(`health-status-healthy`)):t>=80?(u.style.stroke=`#f59e0b`,l.textContent=`Advertencia`,l.classList.add(`health-status-warning`)):(u.style.stroke=`#ef4444`,l.textContent=`Crítico`,l.classList.add(`health-status-critical`)),d.innerHTML=e.findings.length>0?e.findings.map(e=>`
              <div class="finding-item">
                <span class="finding-badge ${e.severity===`critical`?`finding-badge-critical`:e.severity===`warning`?`finding-badge-warning`:`finding-badge-info`}">${e.severity}</span>
                <span class="finding-msg">${e.msg}</span>
              </div>
            `).join(``):`<div class="text-muted fs-7 p-2">No se detectaron anomalías ni advertencias en el sistema.</div>`,e.recommendations?.sql?(S=e.recommendations.sql,m.textContent=S,p.classList.remove(`d-none`),g.disabled=!1,g.innerHTML=`<i class="bi bi-arrow-repeat me-1"></i> Aplicar Índices`):(p.classList.add(`d-none`),S=null),e.recommendations?.cache===`clear`?(y.textContent=`Se detectaron errores recientes en el reportero. Se recomienda purgar la caché PWA para limpiar posibles inconsistencias de carga.`,v.classList.remove(`d-none`),b.disabled=!1,b.innerHTML=`<i class="bi bi-trash3 me-1"></i> Optimizar Caché`):v.classList.add(`d-none`),x.textContent=e.recommendations?.advice||`El sistema funciona de forma óptima.`,a.success(`Diagnóstico de IA completado con éxito.`)}catch(e){console.error(e),a.error(`Error al ejecutar diagnóstico: `+e.message)}finally{t.disabled=!1,n.classList.add(`d-none`),r.classList.remove(`d-none`),i.textContent=`Diagnosticar Sistema con IA`}}),g?.addEventListener(`click`,async()=>{if(S){g.disabled=!0,g.innerHTML=`<span class="spinner-border spinner-border-sm me-1" role="status"></span> Aplicando...`;try{let e=f(S);e.success?(a.success(e.message||`Índices aplicados con éxito en memoria.`),g.innerHTML=`<i class="bi bi-check-circle-fill me-1"></i> Aplicado`):(a.error(`Error al aplicar índices: `+e.error),g.disabled=!1,g.innerHTML=`<i class="bi bi-arrow-repeat me-1"></i> Reintentar`)}catch(e){a.error(`Fallo inesperado al optimizar base de datos: `+e.message),g.disabled=!1,g.innerHTML=`<i class="bi bi-arrow-repeat me-1"></i> Reintentar`}}}),b?.addEventListener(`click`,async()=>{b.disabled=!0,b.innerHTML=`<span class="spinner-border spinner-border-sm me-1" role="status"></span> Limpiando...`;try{let e=await h();e.success?(a.success(`Caché PWA depurada correctamente.`),b.innerHTML=`<i class="bi bi-check-circle-fill me-1"></i> Caché Limpia`):(a.error(`Error al limpiar caché: `+e.error),b.disabled=!1,b.innerHTML=`<i class="bi bi-trash3 me-1"></i> Optimizar Caché`)}catch(e){a.error(`Fallo inesperado al limpiar caché: `+e.message),b.disabled=!1,b.innerHTML=`<i class="bi bi-trash3 me-1"></i> Optimizar Caché`}}))}export{y as renderSistemaView};