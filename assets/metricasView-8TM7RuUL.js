import{i as e,o as t}from"./pwaInstaller-Dg2tWEty.js";import{i as n}from"./supabase--PHJV0L9.js";import{i as r}from"./maestroAuth-CaKoHPVh.js";import{i}from"./portalUtils-CkF82Yyk.js";import{t as a}from"./a11yUtils-DRYT20ux.js";import{t as o}from"./claseAnalysisModal-mPmgDUB5.js";var s={periodo:4,maestroId:null,clasesData:[],todasSesiones:[],inscripcionesPorClase:{},alertasRiesgo:[]};async function c(r,i){let a=await e();a.sort((e,t)=>e.nombre.localeCompare(t.nombre));let o=new Date;o.setDate(o.getDate()-r*7);let s=o.toISOString().split(`T`)[0],c=new Date().toISOString().split(`T`)[0],l=await t(i,s,c)||[],u=a.map(e=>e.id);if(u.length===0)return{clases:a,sesiones:l,inscripcionesPorClase:{}};let{data:d}=await n.from(`alumnos_clases`).select(`clase_id, alumno:alumnos(id, nombre_completo)`).in(`clase_id`,u).eq(`activo`,!0),f={};for(let e of d||[])!e.clase_id||!e.alumno||(f[e.clase_id]||(f[e.clase_id]=[]),f[e.clase_id].push(e.alumno));return{clases:a,sesiones:l,inscripcionesPorClase:f}}function l({clases:e,sesiones:t,inscripcionesPorClase:n}){let r=t.filter(e=>e.estado===`registrada`).length,i=t.filter(e=>e.estado===`pendiente`).length,a=t.filter(e=>e.borrador===!0).length,o=0,s=0,c=0,l=0;t.forEach(e=>{(e.asistencia||[]).forEach(e=>{l++,e.estado===`P`?o++:e.estado===`A`?s++:e.estado===`J`&&c++})});let u=l>0?Math.round(o/l*100):0,d=e.map(e=>{let r=t.filter(t=>t.clase_id===e.id),i=r.filter(e=>e.estado===`registrada`).length,a=r.filter(e=>e.estado===`pendiente`).length,o=n[e.id]||[],s=o.length,c=r.filter(e=>e.estado===`registrada`).slice(-8).map(e=>{let t=(e.asistencia||[]).filter(e=>e.estado===`P`).length,n=(e.asistencia||[]).length;return n>0?Math.round(t/n*100):0}),l=0,u=0;r.forEach(e=>{(e.asistencia||[]).forEach(e=>{u++,e.estado===`P`&&l++})});let d=u>0?Math.round(l/u*100):0,f=r.filter(e=>e.contenido_dsl?.trim()).length,p=r.length>0?Math.min(100,Math.round(f/Math.max(i,1)*100)):0,m=[];for(let e of o){let t=r.filter(t=>t.asistencia?.some(t=>t.alumno_id===e.id)).map(t=>t.asistencia.find(t=>t.alumno_id===e.id)),n=t.filter(e=>e?.estado===`P`).length,i=t.length>0?Math.round(n/t.length*100):0;i>0&&i<70&&m.push({id:e.id,nombre:e.nombre_completo,pct:i})}return{...e,totalAlumnos:s,sesionesCompletadas:i,sesionesPendientes:a,sessionAttendance:c,avgAttendance:d,progress:p,riskStudents:m,alumnos:o}}),f=[];for(let e of d)for(let t of e.riskStudents)f.push({tipo:`baja_asistencia`,alumnoId:t.id,nombre:t.nombre,clase:e.nombre,valor:t.pct,mensaje:`${t.pct}%`});return{totalClases:e.length,sesionesCompletadas:r,sesionesPendientes:i+a,totalPresentes:o,totalAusentes:s,totalJustificados:c,totalRegistros:l,asistenciaPromedio:u,clasesData:d,alertasRiesgo:f,inscripcionesPorClase:n}}function u(e){let{totalClases:t,sesionesCompletadas:n,sesionesPendientes:r,totalPresentes:a,totalAusentes:o,totalJustificados:c,totalRegistros:l,asistenciaPromedio:u,clasesData:d,alertasRiesgo:f}=e,p=l>0?Math.round(a/l*100):0,m=l>0?Math.round(o/l*100):0,h=l>0?Math.round(c/l*100):0;return`
    <div class="pm-dashboard" role="main" aria-label="Panel de métricas">
      <div role="status" aria-live="polite" aria-atomic="true" class="pm-visually-hidden">${i(`Dashboard: ${u}% asistencia general, ${t} clases, ${n} sesiones registradas, ${r} pendientes.`)}</div>
      <header class="pm-dashboard-header">
        <div>
          <h1 class="pm-dashboard-title">Dashboard</h1>
          <p class="pm-dashboard-subtitle">Resumen académico</p>
        </div>
        <select id="pm-filter-periodo" class="pm-dashboard-select" aria-label="Período de análisis">
          <option value="4" ${s.periodo===4?`selected`:``}>4 semanas</option>
          <option value="8" ${s.periodo===8?`selected`:``}>8 semanas</option>
          <option value="12" ${s.periodo===12?`selected`:``}>12 semanas</option>
        </select>
      </header>

      <section class="pm-dashboard-overview" aria-label="Indicadores generales">
        <div class="pm-overview-card primary">
          <div class="pm-overview-ring" aria-label="Asistencia general ${u}%">
            <svg viewBox="0 0 36 36" class="pm-circular-chart">
              <path class="pm-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path class="pm-circle" stroke-dasharray="${u}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text x="18" y="20.35" class="pm-percentage">${u}%</text>
            </svg>
          </div>
          <div class="pm-overview-info">
            <span class="pm-overview-label">Asistencia</span>
            <span class="pm-overview-detail">${a} de ${l} registros</span>
          </div>
        </div>
        <div class="pm-overview-stat"><span class="pm-overview-number">${t}</span><span class="pm-overview-text">Clases</span></div>
        <div class="pm-overview-stat"><span class="pm-overview-number">${n}</span><span class="pm-overview-text">Registradas</span></div>
        <div class="pm-overview-stat warning"><span class="pm-overview-number">${r}</span><span class="pm-overview-text">Pendientes</span></div>
      </section>

      <section class="pm-dashboard-section" aria-label="Desglose de asistencia">
        <h2 class="pm-section-title">Asistencia</h2>
        <div class="pm-attendance-bars">
          <div class="pm-attendance-bar-item">
            <div class="pm-attendance-bar-label">
              <span><i class="bi bi-check-circle-fill" style="color:#30d158"></i> Presentes</span>
              <span>${a} &nbsp;·&nbsp; ${p}%</span>
            </div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill success" style="width:${p}%"></div></div>
          </div>
          <div class="pm-attendance-bar-item">
            <div class="pm-attendance-bar-label">
              <span><i class="bi bi-x-circle-fill" style="color:#ff3b30"></i> Ausentes</span>
              <span>${o} &nbsp;·&nbsp; ${m}%</span>
            </div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill danger" style="width:${m}%"></div></div>
          </div>
          <div class="pm-attendance-bar-item">
            <div class="pm-attendance-bar-label">
              <span><i class="bi bi-exclamation-circle-fill" style="color:#ff9500"></i> Justificados</span>
              <span>${c} &nbsp;·&nbsp; ${h}%</span>
            </div>
            <div class="pm-attendance-bar-track"><div class="pm-attendance-bar-fill warning" style="width:${h}%"></div></div>
          </div>
        </div>
      </section>

      ${f.length>0?`
      <section class="pm-dashboard-section" aria-label="Alumnos en riesgo">
        <h2 class="pm-section-title">Alumnos en Riesgo <span class="pm-section-badge">${f.length}</span></h2>
        <div class="pm-risk-list" role="list">
          ${f.slice(0,5).map(e=>`
            <div class="pm-risk-item" role="listitem" tabindex="0" data-alumno="${e.alumnoId}" aria-label="Ver perfil de ${i(e.nombre)}">
              <div class="pm-risk-avatar" aria-hidden="true">${(e.nombre||`A`)[0].toUpperCase()}</div>
              <div class="pm-risk-info">
                <span class="pm-risk-name">${i(e.nombre)}</span>
                <span class="pm-risk-class">${i(e.clase)}</span>
              </div>
              <span class="pm-risk-pct">${e.mensaje}</span>
            </div>
          `).join(``)}
        </div>
      </section>`:``}

      <section class="pm-dashboard-section" aria-label="Resumen por clase">
        <h2 class="pm-section-title">Clases</h2>
        <div class="pm-classes-list" id="pm-clases-grid">
          ${d.map(e=>{let t=e.avgAttendance,n=t<70?`danger`:t<85?`warning`:`success`,r=t<70?`linear-gradient(135deg,#ff3b30,#ff6b6b)`:t<85?`linear-gradient(135deg,#ff9500,#ffcc00)`:`linear-gradient(135deg,#30d158,#34c759)`,a=e.sessionAttendance.length>0?e.sessionAttendance.map((e,t,n)=>{let r=Math.max(8,e),i=e<70?`#ff3b30`:e<85?`#ff9500`:`#30d158`;return`<div class="pm-spark-bar ${t===n.length-1?`pm-spark-last`:``}" style="height:${r}%;background:${i};" title="${e}%"></div>`}).join(``):`<span class="pm-spark-empty">—</span>`;return`
            <div class="pm-class-card2" data-clase-id="${e.id}" role="article" aria-label="Clase ${i(e.nombre)}">
              <div class="pm-class-card2__accent" style="background:${r}"></div>
              <div class="pm-class-card2__body">
                <div class="pm-class-card2__top">
                  <div class="pm-class-card2__info">
                    <span class="pm-class-card2__name">${i(e.nombre)}</span>
                    ${e.instrumento?`<span class="pm-class-card2__inst"><i class="bi bi-music-note-beamed"></i> ${i(e.instrumento)}</span>`:``}
                  </div>
                  <div class="pm-class-card2__badge-wrap">
                    <span class="pm-class-card2__pct ${n}" aria-label="Asistencia ${t}%">${t}%</span>
                    <button class="pm-analisis-btn-metrics" data-clase-id="${e.id}" aria-label="Analizar clase" title="Ver análisis">
                      <i class="bi bi-graph-up"></i>
                    </button>
                    <button class="pm-class-btn2" data-clase-id="${e.id}" aria-label="Ver alumnos" title="Ver alumnos">
                      <i class="bi bi-people-fill"></i>
                    </button>
                  </div>
                </div>

                <div class="pm-class-card2__spark" aria-label="Tendencia de asistencia últimas sesiones">
                  ${a}
                </div>

                <div class="pm-class-card2__stats">
                  <div class="pm-cs2 pm-cs2--success">
                    <i class="bi bi-check-circle-fill"></i>
                    <span class="pm-cs2__val">${e.sesionesCompletadas}</span>
                    <span class="pm-cs2__lbl">REG.</span>
                  </div>
                  <div class="pm-cs2 pm-cs2--warning">
                    <i class="bi bi-clock-fill"></i>
                    <span class="pm-cs2__val">${e.sesionesPendientes}</span>
                    <span class="pm-cs2__lbl">PEN.</span>
                  </div>
                  <div class="pm-cs2 pm-cs2--blue">
                    <i class="bi bi-people-fill"></i>
                    <span class="pm-cs2__val">${e.totalAlumnos}</span>
                    <span class="pm-cs2__lbl">ALUM.</span>
                  </div>
                  <div class="pm-cs2 pm-cs2--purple">
                    <i class="bi bi-journal-check"></i>
                    <span class="pm-cs2__val">${e.progress}%</span>
                    <span class="pm-cs2__lbl">CONT.</span>
                  </div>
                </div>

                ${e.riskStudents.length>0?`
                <div class="pm-class-card2__risk">
                  <i class="bi bi-exclamation-triangle-fill"></i>
                  ${e.riskStudents.length} alumno${e.riskStudents.length>1?`s`:``} con asistencia &lt;70%
                </div>`:``}
              </div>
            </div>`}).join(``)}
        </div>
      </section>

    </div>

    <style>
      .pm-dashboard { padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .pm-dashboard-header { background: linear-gradient(135deg, var(--pm-primary) 0%, #5856d6 100%); padding: 1.25rem 1rem; color: white; display: flex; justify-content: space-between; align-items: center; }
      .pm-dashboard-title { margin: 0; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }
      .pm-dashboard-subtitle { margin: 0.125rem 0 0; font-size: 0.8125rem; opacity: 0.75; }
      .pm-dashboard-select { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.8125rem; cursor: pointer; }
      .pm-dashboard-select option { color: #000; }

      .pm-dashboard-overview { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 0.5rem; padding: 0.75rem; background: var(--pm-surface); margin: -0.5rem 0.75rem 0.75rem; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
      .pm-overview-card { display: flex; align-items: center; gap: 0.625rem; padding: 0.75rem; border-radius: 10px; background: var(--pm-surface-2); }
      .pm-overview-card.primary { background: linear-gradient(135deg, rgba(52,199,89,0.1) 0%, rgba(52,199,89,0.05) 100%); border: 1px solid rgba(52,199,89,0.2); }
      .pm-overview-ring { width: 48px; height: 48px; flex-shrink: 0; }
      .pm-circular-chart { display: block; width: 100%; height: 100%; }
      .pm-circle-bg { fill: none; stroke: var(--pm-border); stroke-width: 3; }
      .pm-circle { fill: none; stroke: var(--pm-success); stroke-width: 3; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 50% 50%; transition: stroke-dasharray 0.5s ease; }
      .pm-percentage { fill: var(--pm-text); font-size: 0.5em; text-anchor: middle; font-weight: 600; }
      .pm-overview-info { display: flex; flex-direction: column; }
      .pm-overview-label { font-size: 0.75rem; font-weight: 600; color: var(--pm-text); }
      .pm-overview-detail { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-overview-stat { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.5rem; border-radius: 10px; background: var(--pm-surface-2); }
      .pm-overview-number { font-size: 1.25rem; font-weight: 700; color: var(--pm-text); line-height: 1; }
      .pm-overview-text { font-size: 0.625rem; color: var(--pm-text-muted); text-transform: uppercase; letter-spacing: 0.03em; margin-top: 0.125rem; }
      .pm-overview-stat.warning .pm-overview-number { color: var(--pm-warning); }

      .pm-dashboard-section { padding: 0.75rem 1rem; }
      .pm-section-title { font-size: 0.9375rem; font-weight: 600; color: var(--pm-text); margin: 0 0 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
      .pm-section-badge { background: var(--pm-danger); color: white; font-size: 0.6875rem; font-weight: 600; padding: 0.125rem 0.5rem; border-radius: 6px; margin-left: auto; }

      .pm-attendance-bars { display: flex; flex-direction: column; gap: 0.75rem; }
      .pm-attendance-bar-item { display: flex; flex-direction: column; gap: 0.375rem; }
      .pm-attendance-bar-label { display: flex; justify-content: space-between; align-items: center; }
      .pm-attendance-bar-label span:first-child { font-size: 0.8125rem; font-weight: 500; color: var(--pm-text); display: flex; align-items: center; gap: 0.375rem; }
      .pm-attendance-bar-label span:last-child { font-size: 0.75rem; font-weight: 600; color: var(--pm-text-muted); }
      .pm-attendance-bar-track { height: 8px; background: var(--pm-border); border-radius: 4px; overflow: hidden; }
      .pm-attendance-bar-fill { height: 100%; border-radius: 4px; transition: width 0.6s cubic-bezier(.22,.61,.36,1); }
      .pm-attendance-bar-fill.success { background: linear-gradient(90deg,#30d158,#34c759); }
      .pm-attendance-bar-fill.danger  { background: linear-gradient(90deg,#ff3b30,#ff6b6b); }
      .pm-attendance-bar-fill.warning { background: linear-gradient(90deg,#ff9500,#ffcc00); }

      .pm-risk-list { display: flex; flex-direction: column; gap: 0.5rem; }
      .pm-risk-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.75rem; background: var(--pm-surface); border-radius: 10px; cursor: pointer; transition: transform 0.15s ease; }
      .pm-risk-item:active { transform: scale(0.99); }
      .pm-risk-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--pm-danger) 0%, #ff6b6b 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; }
      .pm-risk-info { flex: 1; min-width: 0; }
      .pm-risk-name { display: block; font-size: 0.875rem; font-weight: 600; color: var(--pm-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .pm-risk-class { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-risk-pct { font-size: 0.8125rem; font-weight: 700; color: var(--pm-danger); background: var(--pm-danger-bg); padding: 0.25rem 0.5rem; border-radius: 6px; }

      /* ── Class card v2 ─────────────────────────────────────── */
      .pm-classes-list { display: flex; flex-direction: column; gap: 0.75rem; }

      .pm-class-card2 {
        display: flex;
        background: var(--pm-surface);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 1px 4px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.04);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .pm-class-card2:active { transform: scale(0.99); }

      .pm-class-card2__accent {
        width: 4px;
        flex-shrink: 0;
        border-radius: 0;
      }
      .pm-class-card2__body {
        flex: 1;
        padding: 0.875rem 0.875rem 0.875rem 0.75rem;
        min-width: 0;
      }

      .pm-class-card2__top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.5rem;
        margin-bottom: 0.625rem;
      }
      .pm-class-card2__info { flex: 1; min-width: 0; }
      .pm-class-card2__name {
        display: block;
        font-size: 0.9375rem;
        font-weight: 700;
        color: var(--pm-text);
        line-height: 1.25;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .pm-class-card2__inst {
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.6875rem;
        color: var(--pm-text-muted);
        margin-top: 0.125rem;
      }
      .pm-class-card2__badge-wrap {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        flex-shrink: 0;
      }
      .pm-class-card2__pct {
        font-size: 1rem;
        font-weight: 800;
        padding: 0.25rem 0.625rem;
        border-radius: 10px;
        line-height: 1;
      }
      .pm-class-card2__pct.success {
        background: rgba(52,199,89,0.15);
        color: #30d158;
      }
      .pm-class-card2__pct.warning {
        background: rgba(255,149,0,0.15);
        color: #ff9500;
      }
      .pm-class-card2__pct.danger  {
        background: rgba(255,59,48,0.15);
        color: #ff3b30;
      }

      /* Spark chart */
      .pm-class-card2__spark {
        display: flex;
        align-items: flex-end;
        gap: 3px;
        height: 32px;
        margin: 0 0 0.625rem;
        padding: 4px 0 0;
      }
      .pm-spark-bar {
        flex: 1;
        border-radius: 3px 3px 0 0;
        min-height: 4px;
        opacity: 0.75;
        transition: opacity 0.2s;
      }
      .pm-spark-bar.pm-spark-last { opacity: 1; }
      .pm-spark-empty {
        font-size: 0.75rem;
        color: var(--pm-text-muted);
        align-self: center;
      }

      /* Stats row */
      .pm-class-card2__stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        border-top: 1px solid var(--pm-border);
        padding-top: 0.5rem;
        gap: 0;
      }
      .pm-cs2 {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.25rem 0.125rem;
        gap: 0.0625rem;
      }
      .pm-cs2 i {
        font-size: 0.6875rem;
        margin-bottom: 0.125rem;
        opacity: 0.7;
      }
      .pm-cs2__val {
        font-size: 1rem;
        font-weight: 800;
        color: var(--pm-text);
        line-height: 1;
      }
      .pm-cs2__lbl {
        font-size: 0.5rem;
        color: var(--pm-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.04em;
        font-weight: 600;
      }
      .pm-cs2--success { color: #30d158; }
      .pm-cs2--success .pm-cs2__val { color: #30d158; }
      .pm-cs2--warning { color: #ff9500; }
      .pm-cs2--warning .pm-cs2__val { color: #ff9500; }
      .pm-cs2--blue { color: #0a84ff; }
      .pm-cs2--blue .pm-cs2__val { color: var(--pm-text); }
      .pm-cs2--purple { color: #bf5af2; }
      .pm-cs2--purple .pm-cs2__val { color: var(--pm-text); }

      .pm-class-card2__risk {
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.375rem 0.625rem;
        background: rgba(255,59,48,0.1);
        border-radius: 8px;
        font-size: 0.6875rem;
        color: #ff3b30;
        font-weight: 500;
      }
      .pm-analisis-btn-metrics {
        background: transparent;
        border: 1px solid var(--pm-border);
        padding: 0.375rem 0.5rem;
        border-radius: 8px;
        color: var(--pm-text-muted);
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
      }
      .pm-analisis-btn-metrics:hover {
        background: var(--pm-primary);
        color: white;
        border-color: var(--pm-primary);
      }
      .pm-class-btn2 {
        background: var(--pm-surface-2);
        border: none;
        padding: 0.375rem 0.5rem;
        border-radius: 8px;
        color: var(--pm-text-muted);
        cursor: pointer;
        font-size: 0.75rem;
        transition: background 0.15s, color 0.15s;
      }
      .pm-class-btn2:hover { background: var(--pm-border); color: var(--pm-text); }
      /* Legacy .pm-class-card kept for compatibility */
      .pm-class-card { background: var(--pm-surface); border-radius: 12px; padding: 0.875rem; position: relative; }
      .pm-class-btn { position: absolute; top: 0.625rem; right: 0.625rem; background: none; border: none; padding: 0.25rem; color: var(--pm-text-muted); cursor: pointer; font-size: 1.25rem; }

      .pm-search-wrapper { position: relative; margin-bottom: 0.5rem; }
      .pm-search-wrapper i { position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%); color: var(--pm-text-muted); font-size: 0.875rem; }
      .pm-search-wrapper input { width: 100%; padding: 0.75rem 0.75rem 0.75rem 2.25rem; border: 1px solid var(--pm-border); border-radius: 10px; font-size: 0.875rem; background: var(--pm-surface); color: var(--pm-text); outline: none; transition: border-color 0.2s; }
      .pm-search-wrapper input:focus { border-color: var(--pm-primary); }
      .pm-search-wrapper input::placeholder { color: var(--pm-text-muted); }
      .pm-search-results { display: none; background: var(--pm-surface); border-radius: 10px; overflow: hidden; }
      .pm-search-results.show { display: block; }
      
      /* Panel de estudiantes por clase */
      .pm-clase-students-panel { margin-top: 0.75rem; border-top: 1px solid var(--pm-border); padding-top: 0.75rem; }
      .pm-clase-students-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; font-size: 0.8125rem; font-weight: 600; }
      .pm-clase-students-close { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--pm-text-muted); }
      .pm-clase-students-list { display: flex; flex-direction: column; gap: 0.375rem; max-height: 200px; overflow-y: auto; }
      .pm-clase-student-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--pm-surface-2); border-radius: 6px; cursor: pointer; }
      .pm-clase-student-row:hover { background: var(--pm-border); }
      .pm-student-info { flex: 1; min-width: 0; }
      .pm-student-nombre { display: block; font-size: 0.8125rem; font-weight: 500; color: var(--pm-text); }
      .pm-student-meta { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-student-attendance { text-align: right; }
      .pm-student-attendance span { font-size: 0.8125rem; font-weight: 600; }
      .pm-student-attendance.danger span { color: var(--pm-danger); }
      .pm-student-attendance.warning span { color: var(--pm-warning); }
      .pm-student-attendance.success span { color: var(--pm-success); }
      .pm-student-att-bar { width: 50px; height: 4px; background: var(--pm-border); border-radius: 2px; margin-top: 2px; }
      .pm-student-att-fill { height: 100%; border-radius: 2px; }
      .pm-student-attendance.danger .pm-student-att-fill { background: var(--pm-danger); }
      .pm-student-attendance.warning .pm-student-att-fill { background: var(--pm-warning); }
      .pm-student-attendance.success .pm-student-att-fill { background: var(--pm-success); }

      /* Search results */
      .pm-search-result-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; cursor: pointer; border-bottom: 1px solid var(--pm-border); }
      .pm-search-result-item:last-child { border-bottom: none; }
      .pm-search-result-item:hover { background: var(--pm-surface-2); }
      .pm-search-result-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--pm-primary); color: white; display: flex; align-items: center; justify-content: center; }
      .pm-search-result-info { flex: 1; }
      .pm-search-result-name { display: block; font-size: 0.875rem; font-weight: 500; color: var(--pm-text); }
      .pm-search-result-meta { font-size: 0.6875rem; color: var(--pm-text-muted); }
      .pm-search-result-arrow { color: var(--pm-text-muted); }

      @media (max-width: 600px) {
        .pm-dashboard-overview { grid-template-columns: 1fr 1fr; }
        .pm-overview-card.primary { grid-column: span 2; }
      }
    </style>
  `}function d(e){console.log(`[MetricasView.bindEvents] Iniciando bind, container:`,e),console.log(`[MetricasView.bindEvents] HTML length:`,e?.innerHTML?.length||0),e.querySelector(`#pm-filter-periodo`)?.addEventListener(`change`,async t=>{let n=parseInt(t.target.value,10);s.periodo=n,e.innerHTML=`<div class="pm-loading" style="padding:2rem;"><div class="pm-spinner"></div></div>`;try{let t=await c(n,s.maestroId),r=l(t);s.clasesData=r.clasesData,s.todasSesiones=t.sesiones,s.inscripcionesPorClase=t.inscripcionesPorClase,s.alertasRiesgo=r.alertasRiesgo,e.innerHTML=u(r),d(e),a(`Período actualizado a ${n} semanas. ${r.asistenciaPromedio}% de asistencia general.`)}catch(t){e.innerHTML=`<p class="pm-empty">Error al cargar datos: ${i(t.message)}</p>`}}),e.querySelectorAll(`.pm-risk-item`).forEach(e=>{let t=e.dataset.alumno,n=()=>{window.location.hash=`#/alumno?id=${t}`};e.addEventListener(`click`,n),e.addEventListener(`keypress`,e=>{e.key===`Enter`&&n()})});let t=new Date,n=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,`0`)}-${String(t.getDate()).padStart(2,`0`)}`,r=s.periodo||4;e.querySelectorAll(`.pm-analisis-btn-metrics`).forEach(e=>{e.addEventListener(`click`,t=>{t.stopPropagation(),t.preventDefault();let i=e.dataset.claseId;o(i,n,r)})}),e.querySelectorAll(`.pm-class-btn, .pm-class-btn2`).forEach(e=>{e.addEventListener(`click`,async t=>{t.stopPropagation();let n=e.closest(`.pm-class-card2, .pm-class-card`),r=n.querySelector(`.pm-clase-students-panel`);if(r){r.remove();return}let a=e.dataset.claseId,o=s.clasesData.find(e=>e.id===a)?.alumnos||[],c=s.todasSesiones.filter(e=>e.clase_id===a),l=o.map(e=>{let t=c.filter(t=>t.asistencia?.some(t=>t.alumno_id===e.id)).map(t=>t.asistencia.find(t=>t.alumno_id===e.id)),n=t.filter(e=>e?.estado===`P`).length,r=t.length,i=r>0?Math.round(n/r*100):0,a=c.filter(t=>t.asistencia?.some(t=>t.alumno_id===e.id)).sort((e,t)=>t.fecha.localeCompare(e.fecha))[0];return{...e,pct:i,total:r,lastFecha:a?.fecha}});l.sort((e,t)=>e.pct-t.pct);let u=document.createElement(`div`);u.className=`pm-clase-students-panel`,u.innerHTML=`
        <div class="pm-clase-students-header">
          <span>Alumnos (${l.length})</span>
          <button class="pm-clase-students-close" aria-label="Cerrar panel">×</button>
        </div>
        <div class="pm-clase-students-list" role="list">
          ${l.map(e=>`
            <div class="pm-clase-student-row" role="listitem" tabindex="0" data-alumno="${e.id}">
              <div class="pm-student-info">
                <span class="pm-student-nombre">${i(e.nombre_completo)}</span>
                <span class="pm-student-meta">${e.total} sesiones · Última: ${e.lastFecha?new Date(e.lastFecha).toLocaleDateString(`es-ES`,{day:`2-digit`,month:`short`}):`—`}</span>
              </div>
              <div class="pm-student-attendance ${e.pct<70?`danger`:e.pct<85?`warning`:`success`}">
                <span>${e.pct}%</span>
                <div class="pm-student-att-bar"><div class="pm-student-att-fill" style="width:${e.pct}%"></div></div>
              </div>
            </div>
          `).join(``)}
        </div>`,n.appendChild(u),u.querySelector(`.pm-clase-students-close`).addEventListener(`click`,()=>u.remove());let d=t=>{!u.contains(t.target)&&t.target!==e&&(u.remove(),document.removeEventListener(`click`,d))};setTimeout(()=>document.addEventListener(`click`,d),10),u.querySelectorAll(`.pm-clase-student-row`).forEach(e=>{let t=()=>window.location.hash=`#/alumno?id=${e.dataset.alumno}`;e.addEventListener(`click`,t),e.addEventListener(`keypress`,e=>{e.key===`Enter`&&t()})})})})}function f(){if(!s.clasesData.length&&!Object.keys(s.inscripcionesPorClase).length)return null;let e=new Map;for(let[t,n]of Object.entries(s.inscripcionesPorClase)){let r=s.clasesData.find(e=>e.id===t);for(let t of n)e.has(t.id)||e.set(t.id,{...t,clases:[]}),r&&e.get(t.id).clases.push(r.nombre)}return[...e.values()]}async function p(e){console.log(`[renderMetricasView] INICIANDO`,e),e.innerHTML=`<div class="pm-loading"><div class="pm-spinner"></div></div>`;let t=r();if(console.log(`[renderMetricasView] Maestro:`,t?.id),!t){e.innerHTML=`<p class="pm-empty">No hay sesión activa.</p>`;return}s.maestroId=t.id;try{let n=await c(s.periodo,t.id),r=l(n);s.clasesData=r.clasesData,s.todasSesiones=n.sesiones,s.inscripcionesPorClase=n.inscripcionesPorClase,s.alertasRiesgo=r.alertasRiesgo,e.innerHTML=u(r),d(e),a(`Métricas actualizadas. ${r.asistenciaPromedio}% de asistencia general.`)}catch(t){e.innerHTML=`
      <div class="pm-empty" style="padding:3rem 1rem;text-align:center;" role="alert">
        <p style="color:var(--pm-danger);">Error al cargar métricas</p>
        <p style="font-size:0.85rem;color:var(--pm-text-muted);">${i(t.message)}</p>
      </div>`}}export{f as getAlumnoIndexFromMetricas,p as renderMetricasView};