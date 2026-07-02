import{i as e}from"./supabase--PHJV0L9.js";import{i as t}from"./maestroAuth-CaKoHPVh.js";import{i as n}from"./portalUtils-CkF82Yyk.js";var r={scales:`🎼`,arpeggios:`🎹`,left_hand:`✋`,bow:`🎻`,sound:`🔊`,intonation:`🎵`,studies:`⚙️`,repertoire:`📖`},i={approved:`#34C759`,achieved:`#34C759`,exceeded:`#007AFF`,in_process:`#007AFF`,needs_reinforcement:`#FF9500`,pending:`#ccc`,not_started:`#ccc`,failed:`#FF3B30`},a={approved:`Aprobado`,achieved:`Dominado`,exceeded:`Sobresaliente`,in_process:`En proceso`,needs_reinforcement:`Requiere refuerzo`,pending:`Pendiente`,not_started:`Sin iniciar`,failed:`Fallido`};function o(e){let t=(e||``).toLowerCase();for(let[e,n]of Object.entries(r))if(t.includes(e))return n;return t.includes(`escala`)?`🎼`:t.includes(`arpegio`)?`🎹`:t.includes(`mano`)||t.includes(`izquierda`)?`✋`:t.includes(`arco`)?`🎻`:t.includes(`sonido`)?`🔊`:t.includes(`afinación`)||t.includes(`entonación`)?`🎵`:t.includes(`estudio`)?`⚙️`:t.includes(`repertorio`)||t.includes(`obra`)?`📖`:`📋`}async function s(r){r.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let i=t();if(!i){r.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}try{let{data:t}=await e.from(`clases`).select(`id, nombre`).eq(`maestro_id`,i.id).order(`nombre`);if(!t||t.length===0){r.innerHTML=`<p class="pm-empty">No tienes clases asignadas.</p>`;return}let{data:a}=await e.from(`inscripciones`).select(`alumno_id, clase_id, alumnos(id, nombre, apellido), clases(id, nombre)`).in(`clase_id`,t.map(e=>e.id));r.innerHTML=`
      <div class="pm-progress-root">
        <div class="pm-progress-header">
          <h2><i class="bi bi-trophy"></i> Progresos y Logros</h2>
          <select id="pm-student-select" class="pm-input">
            <option value="">Seleccionar alumno...</option>
            ${[...new Map(a?.map(e=>[e.alumnos.id,e.alumnos])||[]).values()].map(e=>`<option value="${e.id}">${n(e.nombre)} ${n(e.apellido)}</option>`).join(``)}
          </select>
        </div>
        <div id="pm-progress-content"></div>
      </div>

      <style>
        .pm-progress-root { padding: 1rem; }
        .pm-progress-header { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
        .pm-progress-header h2 { margin: 0; font-size: 1.5rem; display: flex; align-items: center; gap: 0.5rem; }
        .pm-progress-header select { max-width: 100%; }

        .pm-student-summary { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; background: var(--pm-surface); padding: 1rem; border-radius: 12px; }
        .pm-summary-row { display: flex; justify-content: space-between; align-items: center; }
        .pm-summary-label { font-size: 0.9rem; color: var(--pm-text-muted); }
        .pm-summary-value { font-weight: 700; font-size: 1rem; }
        .pm-progress-bar { width: 100%; height: 8px; background: var(--pm-border); border-radius: 4px; overflow: hidden; }
        .pm-progress-fill { height: 100%; background: var(--apple-success); transition: width 0.3s; }

        .pm-duolingo-path { display: flex; flex-direction: column; gap: 1rem; position: relative; padding: 1rem 0; }
        .pm-duolingo-path::before { content: ''; position: absolute; left: 23px; top: 0; bottom: 0; width: 2px; background: var(--pm-border); }

        .pm-level-circle { display: flex; align-items: flex-start; gap: 1rem; position: relative; z-index: 1; }
        .pm-circle { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; flex-shrink: 0; cursor: pointer; transition: transform 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .pm-circle:hover { transform: scale(1.1); }
        .pm-circle.approved { background: var(--apple-success); }
        .pm-circle.in_process { background: var(--apple-primary); animation: pulse 2s infinite; }
        .pm-circle.pending { background: var(--pm-border); }
        .pm-circle.failed { background: var(--pm-danger); }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

        .pm-level-content { flex: 1; }
        .pm-level-title { font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 0.5rem; }
        .pm-level-obj { font-size: 0.8rem; color: var(--pm-text-muted); margin-bottom: 0.5rem; }
        .pm-level-nodes { display: none; gap: 0.5rem; flex-wrap: wrap; }
        .pm-level-circle.expanded .pm-level-nodes { display: flex; }

        .pm-node-card { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--pm-surface-2); border-radius: 8px; border: 1px solid var(--pm-border); min-width: 150px; cursor: pointer; transition: border-color 0.2s; }
        .pm-node-card:hover { border-color: var(--apple-primary); }
        .pm-node-icon { font-size: 1.2rem; flex-shrink: 0; }
        .pm-node-info { flex: 1; min-width: 0; }
        .pm-node-name { display: block; font-size: 0.75rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pm-node-status { display: block; font-size: 0.65rem; color: var(--pm-text-muted); }

        .pm-indicators { display: none; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--pm-border); }
        .pm-node-card.expanded .pm-indicators { display: block; }
        .pm-indicator { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; font-size: 0.75rem; }
        .pm-indicator-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .pm-indicator-desc { flex: 1; }
        .pm-indicator-date { font-size: 0.65rem; color: var(--pm-text-muted); }

        .pm-empty-state { padding: 2rem 1rem; text-align: center; color: var(--pm-text-muted); }
      </style>
    `,r.querySelector(`#pm-student-select`).addEventListener(`change`,async e=>{let t=e.target.value;if(!t){r.querySelector(`#pm-progress-content`).innerHTML=``;return}await c(r,t)})}catch(e){r.innerHTML=`<p class="pm-empty">Error: ${n(e.message)}</p>`}}async function c(t,r){let s=t.querySelector(`#pm-progress-content`);s.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;try{let{data:t}=await e.from(`alumnos`).select(`nombre, apellido`).eq(`id`,r).single(),{data:c}=await e.from(`academic_plans`).select(`id, route_version_id, status`).eq(`student_id`,r).in(`status`,[`in_process`,`active`]).order(`created_at`,{ascending:!1}).limit(1).maybeSingle(),{data:l}=await e.from(`inscripciones`).select(`clase_id, clases(id, nombre)`).eq(`alumno_id`,r),u=(l||[]).map(e=>e.clase_id).filter(Boolean),d=[];if(u.length>0){let{data:t}=await e.from(`acm_active_routes`).select(`id, group_id, weekly_plan_id, current_week, status`).in(`group_id`,u).eq(`status`,`active`);d=t||[]}let f=[],p=[...new Set(d.map(e=>e.weekly_plan_id).filter(Boolean))];if(p.length>0){let{data:t}=await e.from(`acm_weekly_plan_items`).select(`weekly_plan_id, week_number, topic, objective`).in(`weekly_plan_id`,p);f=t||[]}let m=[],h=[...new Set(f.map(e=>e.indicator_id).filter(Boolean))];if(h.length>0){let{data:t}=await e.from(`student_indicator_progress`).select(`indicator_id, status, updated_at`).eq(`student_id`,r).in(`indicator_id`,h);m=t||[]}let g=(l||[]).map(e=>{let t=d.find(t=>t.group_id===e.clase_id);if(!t)return null;let n=f.find(e=>e.weekly_plan_id===t.weekly_plan_id&&Number(e.week_number)===Number(t.current_week||1));return{className:e.clases?.nombre||`Clase`,currentWeek:t.current_week||1,topic:n?.topic||`Semana sin tema cargado`,objective:n?.objective||``}}).filter(Boolean),_=g.map(e=>{let t=d.find(t=>t.current_week===e.currentWeek),n=f.find(n=>n.weekly_plan_id===t?.weekly_plan_id&&Number(n.week_number)===Number(e.currentWeek)),r=n?.indicator_id?m.find(e=>e.indicator_id===n.indicator_id):null;return{...e,progressLabel:r?a[r.status]||r.status:`Sin progreso registrado`,progressColor:r&&i[r.status]||`#ccc`,progressDate:r?.updated_at||null}});if(!c){s.innerHTML=`
        <div class="pm-empty-state">
          <p>Este alumno no tiene un plan académico activo.</p>
          ${g.length>0?`
            <div class="pm-student-summary" style="margin-top:1rem;text-align:left;">
              <div class="pm-summary-row">
                <span class="pm-summary-label">Contexto curricular ACM disponible</span>
                <span class="pm-summary-value">${g.length} clase(s)</span>
              </div>
              ${_.map(e=>`
                <div style="padding:0.75rem;border-radius:10px;background:var(--pm-surface-2);border:1px solid var(--pm-border);">
                  <div style="font-weight:700;">${n(e.className)} · Semana ${n(String(e.currentWeek))}</div>
                  <div style="font-size:0.82rem;color:var(--pm-text-muted);margin-top:0.25rem;"><strong>Tema:</strong> ${n(e.topic)}</div>
                  ${e.objective?`<div style="font-size:0.82rem;color:var(--pm-text-muted);margin-top:0.2rem;"><strong>Objetivo:</strong> ${n(e.objective)}</div>`:``}
                  <div style="font-size:0.82rem;margin-top:0.35rem;color:${e.progressColor};"><strong>Progreso:</strong> ${n(e.progressLabel)}</div>
                </div>
              `).join(``)}
            </div>
          `:``}
          <a href="#/ruta-plan-builder?id=${r}" class="pm-btn pm-btn-primary" style="display:inline-block;margin-top:0.5rem;">
            Crear Plan
          </a>
        </div>
      `;return}let{data:v}=await e.from(`levels`).select(`*`).eq(`route_version_id`,c.route_version_id).order(`level_number`,{ascending:!0}),{data:y}=await e.from(`student_level_progress`).select(`*`).eq(`student_id`,r),{data:b}=await e.from(`nodes`).select(`*, indicators(*)`).in(`level_id`,(v||[]).map(e=>e.id)).order(`order_index`,{ascending:!0}),{data:x}=await e.from(`student_node_progress`).select(`*, indicator_attempts(*)`).eq(`student_id`,r),S=(y||[]).filter(e=>e.status===`approved`).length,C=v?.length||0,w=C>0?Math.round(S/C*100):0;s.innerHTML=`
      <div class="pm-student-summary">
        <div class="pm-summary-row">
          <span class="pm-summary-label">Alumno</span>
          <span class="pm-summary-value">${n(t.nombre)} ${n(t.apellido)}</span>
        </div>
        <div class="pm-summary-row">
          <span class="pm-summary-label">Progreso</span>
          <span class="pm-summary-value">${S}/${C} niveles</span>
        </div>
        <div class="pm-progress-bar">
          <div class="pm-progress-fill" style="width:${w}%"></div>
        </div>
        ${g.length>0?`
          <div style="display:grid;gap:0.5rem;margin-top:0.5rem;">
            ${_.map(e=>`
              <div style="padding:0.75rem;border-radius:10px;background:var(--pm-surface-2);border:1px solid var(--pm-border);">
                <div style="font-weight:700;">${n(e.className)} · Guía ACM · Semana ${n(String(e.currentWeek))}</div>
                <div style="font-size:0.82rem;color:var(--pm-text-muted);margin-top:0.25rem;"><strong>Tema:</strong> ${n(e.topic)}</div>
                ${e.objective?`<div style="font-size:0.82rem;color:var(--pm-text-muted);margin-top:0.2rem;"><strong>Objetivo:</strong> ${n(e.objective)}</div>`:``}
                <div style="font-size:0.82rem;margin-top:0.35rem;color:${e.progressColor};"><strong>Estado ACM:</strong> ${n(e.progressLabel)}</div>
                ${e.progressDate?`<div style="font-size:0.72rem;color:var(--pm-text-muted);margin-top:0.15rem;">Actualizado: ${new Date(e.progressDate).toLocaleDateString(`es`)}</div>`:``}
              </div>
            `).join(``)}
          </div>
        `:``}
      </div>

      <div class="pm-duolingo-path">
        ${(v||[]).map(e=>{let t=y?.find(t=>t.level_id===e.id)?.status||`pending`,r=b?.filter(t=>t.level_id===e.id)||[];return`
            <div class="pm-level-circle" data-level-id="${e.id}">
              <div class="pm-circle ${t}">
                ${t===`approved`?`✓`:t===`in_process`?e.level_number:t===`failed`?`✕`:`🔒`}
              </div>
              <div class="pm-level-content">
                <div class="pm-level-title" style="cursor:pointer;" onclick="this.closest('.pm-level-circle').classList.toggle('expanded')">
                  <i class="bi bi-chevron-down" style="display:inline-block;transition:transform 0.2s;"></i>
                  Nivel ${e.level_number}: ${n(e.name)}
                </div>
                <div class="pm-level-obj">${n(e.main_objective||``)}</div>
                <div class="pm-level-nodes">
                  ${r.map(e=>{let t=x?.find(t=>t.node_id===e.id),r=t?.status||`pending`,s=e.indicators||[],c=t?.indicator_attempts||[];return`
                      <div class="pm-node-card" onclick="this.classList.toggle('expanded')">
                        <div class="pm-node-icon">${o(e.name)}</div>
                        <div class="pm-node-info">
                          <span class="pm-node-name">${n(e.name)}</span>
                          <span class="pm-node-status">${a[r]}</span>
                        </div>
                        ${e.is_critical?`<span style="color:var(--pm-danger);font-size:0.6rem;font-weight:700;">CRÍTICO</span>`:``}
                        <div class="pm-indicators">
                          ${s.length===0?`<p style="font-size:0.7rem;color:var(--pm-text-muted);">Sin indicadores</p>`:s.map(e=>{let t=c.find(t=>t.indicator_id===e.id);return`
                                <div class="pm-indicator">
                                  <span class="pm-indicator-dot" style="background:${i[t?.status||`pending`]};"></span>
                                  <span class="pm-indicator-desc">${n(e.description)}</span>
                                  ${t?.created_at?`<span class="pm-indicator-date">${new Date(t.created_at).toLocaleDateString(`es`)}</span>`:``}
                                </div>
                              `}).join(``)}
                        </div>
                      </div>
                    `}).join(``)}
                </div>
              </div>
            </div>
          `}).join(``)}
      </div>
    `}catch(e){s.innerHTML=`<p class="pm-empty">Error: ${n(e.message)}</p>`}}export{s as renderGamificacionView};