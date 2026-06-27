import{i as e}from"./supabase-KnARm58N.js";import{t}from"./AppToast-Dk3fEiuP.js";import{t as n}from"./config-EAsd4M2K.js";import{t as r}from"./disponibilidadApi-CIycXhxj.js";var i=[{id:`m-001`,nombre:`Carlos Méndez`,especialidad:`Violín`,habilidades:[`violín`,`viola`,`solfeo`],disponibilidad:{lunes:[{inicio:`10:00`,fin:`13:00`},{inicio:`14:00`,fin:`18:00`}],martes:[{inicio:`10:00`,fin:`13:00`}],miércoles:[{inicio:`10:00`,fin:`13:00`},{inicio:`14:00`,fin:`18:00`}],jueves:[{inicio:`10:00`,fin:`13:00`}],viernes:[{inicio:`10:00`,fin:`19:00`}],sábado:[],domingo:[]}},{id:`m-002`,nombre:`María Torres`,especialidad:`Piano`,habilidades:[`piano`,`teclado`,`teoría musical`],disponibilidad:{lunes:[{inicio:`14:00`,fin:`19:00`}],martes:[{inicio:`10:00`,fin:`19:00`}],miércoles:[{inicio:`14:00`,fin:`19:00`}],jueves:[{inicio:`10:00`,fin:`19:00`}],viernes:[],sábado:[{inicio:`09:00`,fin:`13:00`}],domingo:[]}},{id:`m-003`,nombre:`José Ramírez`,especialidad:`Percusión`,habilidades:[`percusión`,`batería`,`timbales`],disponibilidad:{lunes:[{inicio:`10:00`,fin:`14:00`}],martes:[{inicio:`10:00`,fin:`14:00`}],miércoles:[{inicio:`10:00`,fin:`14:00`}],jueves:[{inicio:`10:00`,fin:`14:00`}],viernes:[{inicio:`10:00`,fin:`14:00`}],sábado:[{inicio:`09:00`,fin:`12:00`}],domingo:[]}},{id:`m-004`,nombre:`Ana Luisa Herrera`,especialidad:`Cello`,habilidades:[`cello`,`contrabajo`,`música de cámara`],disponibilidad:{lunes:[{inicio:`10:00`,fin:`19:00`}],martes:[],miércoles:[{inicio:`10:00`,fin:`19:00`}],jueves:[],viernes:[{inicio:`10:00`,fin:`19:00`}],sábado:[],domingo:[]}},{id:`m-005`,nombre:`Roberto Sánchez`,especialidad:`Guitarra`,habilidades:[`guitarra`,`cuatro`,`mandolina`],disponibilidad:{lunes:[{inicio:`15:00`,fin:`19:00`}],martes:[{inicio:`15:00`,fin:`19:00`}],miércoles:[{inicio:`15:00`,fin:`19:00`}],jueves:[{inicio:`15:00`,fin:`19:00`}],viernes:[{inicio:`15:00`,fin:`19:00`}],sábado:[{inicio:`09:00`,fin:`13:00`}],domingo:[]}},{id:`m-006`,nombre:`Luisa Fernanda Díaz`,especialidad:`Voz`,habilidades:[`voz`,`coro`,`técnica vocal`,`solfeo`],disponibilidad:{lunes:[{inicio:`10:00`,fin:`13:00`}],martes:[{inicio:`10:00`,fin:`13:00`},{inicio:`15:00`,fin:`18:00`}],miércoles:[{inicio:`10:00`,fin:`13:00`}],jueves:[{inicio:`10:00`,fin:`13:00`},{inicio:`15:00`,fin:`18:00`}],viernes:[{inicio:`10:00`,fin:`13:00`}],sábado:[{inicio:`09:00`,fin:`12:00`}],domingo:[]}}],a=[{id:`s-101`,nombre:`Salón Mozart (Grande)`,capacidad:30,piso:1,is_active:!0},{id:`s-102`,nombre:`Salón Beethoven (Mediano)`,capacidad:15,piso:1,is_active:!0},{id:`s-103`,nombre:`Salón Bach (Piano)`,capacidad:10,piso:2,is_active:!0},{id:`s-104`,nombre:`Salón Vivaldi (Violín)`,capacidad:8,piso:2,is_active:!0},{id:`s-105`,nombre:`Salón Chopin (Teclados)`,capacidad:12,piso:2,is_active:!0}],o=[{id:`c-001`,nombre:`Violín Inicial`,instrumento:`Violín`,maestro_principal_id:`m-001`,capacidad_maxima:10,total_alumnos:6,horarios:[]},{id:`c-002`,nombre:`Violín Intermedio`,instrumento:`Violín`,maestro_principal_id:`m-001`,capacidad_maxima:8,total_alumnos:5,horarios:[]},{id:`c-003`,nombre:`Piano Inicial A`,instrumento:`Piano`,maestro_principal_id:`m-002`,capacidad_maxima:12,total_alumnos:10,horarios:[]},{id:`c-004`,nombre:`Teoría y Solfeo I`,instrumento:`Solfeo`,maestro_principal_id:`m-006`,capacidad_maxima:25,total_alumnos:18,horarios:[]},{id:`c-005`,nombre:`Batería Básica`,instrumento:`Percusión`,maestro_principal_id:`m-003`,capacidad_maxima:6,total_alumnos:4,horarios:[]},{id:`c-006`,nombre:`Guitarra Clásica I`,instrumento:`Guitarra`,maestro_principal_id:`m-005`,capacidad_maxima:15,total_alumnos:11,horarios:[]},{id:`c-007`,nombre:`Cello y Cámara`,instrumento:`Cello`,maestro_principal_id:`m-004`,capacidad_maxima:8,total_alumnos:3,horarios:[]},{id:`c-008`,nombre:`Técnica Vocal A`,instrumento:`Voz`,maestro_principal_id:`m-006`,capacidad_maxima:10,total_alumnos:8,horarios:[]}],s=[];async function c(){let{data:t,error:n}=await e.from(`salones`).select(`id, nombre, capacidad, is_active`).eq(`is_active`,!0).order(`nombre`,{ascending:!0});if(n)throw Error(`Error al cargar salones reales: `+n.message);return t}async function l(){let{data:t,error:n}=await e.from(`clases`).select(`id, nombre, maestro_principal_id, capacidad_maxima, instrumento, duracion_minutos`).order(`nombre`,{ascending:!0});if(n)throw Error(`Error al cargar clases reales: `+n.message);let{data:r}=await e.from(`clase_horarios`).select(`*`),{data:i}=await e.from(`alumnos_clases`).select(`clase_id`);return(t||[]).map(e=>{let t=(r||[]).filter(t=>t.clase_id===e.id),n=(i||[]).filter(t=>t.clase_id===e.id).length;return{id:e.id,nombre:e.nombre,instrumento:e.instrumento||`General`,maestro_principal_id:e.maestro_principal_id,capacidad_maxima:e.capacidad_maxima||20,total_alumnos:n,duracion_minutos:e.duracion_minutos??null,horarios:t.map(e=>({dia:e.dia,hora_inicio:e.hora_inicio,hora_fin:e.hora_fin,salon_id:e.salon_id}))}})}async function u(){if(n.isDemoMode)return{maestros:i,salones:a,clases:o};try{let[e,t,n]=await Promise.all([r(),c(),l()]);return{maestros:e,salones:t,clases:n}}catch(e){throw console.error(`[horarioBuilderApi] Error fetching data:`,e),e}}async function d(t){if(n.isDemoMode){let e={id:`run-${Date.now()}`,created_at:new Date().toISOString(),estado:t.estado||`borrador`,periodo:t.periodo,config:t.config,resultado:t.resultado,metricas:t.metricas};return s.push(e),e}let{data:r,error:i}=await e.from(`schedule_runs`).insert([{periodo:t.periodo,config:t.config,resultado:t.resultado,metricas:t.metricas,estado:t.estado||`borrador`}]).select().single();if(i)throw console.error(`[horarioBuilderApi] Error saving run:`,i),Error(`No se pudo guardar la corrida de horario: `+i.message);return r}async function f(){if(n.isDemoMode)return s;let{data:t,error:r}=await e.from(`schedule_runs`).select(`*`).order(`created_at`,{ascending:!1});if(r)throw console.error(`[horarioBuilderApi] Error fetching runs:`,r),Error(`No se pudieron obtener las corridas de horarios`);return t}var p={lunes:{inicio:`10:00`,fin:`19:00`},martes:{inicio:`10:00`,fin:`19:00`},miércoles:{inicio:`10:00`,fin:`19:00`},jueves:{inicio:`10:00`,fin:`19:00`},viernes:{inicio:`10:00`,fin:`19:00`},sábado:{inicio:`09:00`,fin:`13:00`},domingo:{inicio:`00:00`,fin:`00:00`}},m=[{id:`S1-2026`,nombre:`Semestre 1 (Ene–Jul 2026)`,inicio:`2026-01-01`,fin:`2026-07-31`},{id:`S2-2026`,nombre:`Semestre 2 (Ago–Dic 2026)`,inicio:`2026-08-01`,fin:`2026-12-31`}],h=[{key:`lunes`,label:`Lunes`},{key:`martes`,label:`Martes`},{key:`miércoles`,label:`Miércoles`},{key:`jueves`,label:`Jueves`},{key:`viernes`,label:`Viernes`},{key:`sábado`,label:`Sábado`}];function g(e){let[t,n]=e.split(`:`).map(Number);return t*60+n}function _(e,t){let n=g(e)+t,r=Math.floor(n/60),i=n%60;return`${String(r).padStart(2,`0`)}:${String(i).padStart(2,`0`)}`}function v(e,t){return g(t)-g(e)}function y(e){if(!e||!e.includes(`:`))return`00:00`;let[t]=e.split(`:`);return`${t.padStart(2,`0`)}:00`}function b(e){let[t,n]=e.split(`:`).map(Number);return t*60+n}function x(e){let t=Math.floor(e/60),n=e%60;return`${t.toString().padStart(2,`0`)}:${n.toString().padStart(2,`0`)}`}function S(e,t,n,r,i=0){return e<r+i&&n-i<t}function C(e,t,n){let r=e[t]||[],i=n[t];if(!i||i.inicio===`00:00`&&i.fin===`00:00`)return[];let a=b(i.inicio),o=b(i.fin),s=[];return r.forEach(e=>{let t=b(e.inicio),n=b(e.fin),r=Math.max(t,a),i=Math.min(n,o);r<i&&s.push({start:r,end:i})}),s}function ee(e,t,n){let r=100,i=e.salon.capacidad-t.totalAlumnos;r-=Math.min(i*2,40);let a=(n[e.teacher.id]||[]).reduce((e,t)=>e+(t.end-t.start),0)/60;return r-=Math.min(a*3,20),(n[e.teacher.id]||[]).some(t=>t.day===e.day&&(t.end===e.start||t.start===e.end))&&(r+=15),r}function te(e,t,n,r,i,a,o={}){let{excludeDays:s=new Set,requireSameSalon:c=null}=o,l=e.duracion,u=[];return Object.keys(t.jornada).forEach(o=>{if(s.has(o))return;let d=t.jornada[o];if(!d||d.inicio===`00:00`&&d.fin===`00:00`)return;let f=C(n.disponibilidad||{},o,t.jornada);if(f.length===0)return;let p=r.filter(t=>t.capacidad>=e.totalAlumnos&&t.is_active!==!1);c&&(p=p.filter(e=>e.id===c)),p.length!==0&&f.forEach(e=>{for(let r=e.start;r+l<=e.end;r+=30){let e=r+l;(i[n.id]||[]).some(n=>n.day===o&&S(r,e,n.start,n.end,t.gapMinimo))||p.forEach(i=>{(a[i.id]||[]).some(n=>n.day===o&&S(r,e,n.start,n.end,t.gapMinimo))||u.push({day:o,start:r,end:e,salon:i,teacher:n})})}})}),u}function ne({clasesConMaestro:e,maestros:t,salones:n,config:r}){let i={jornada:r?.jornada||p,gapMinimo:r?.gapMinimo===void 0?15:parseInt(r.gapMinimo),duracionBloque:r?.duracionBloque===void 0?60:parseInt(r.duracionBloque)},a=[],o=[],s={};t.forEach(e=>{s[e.id]=[]});let c={};n.forEach(e=>{c[e.id]=[]});let l=new Map,u=e.map(e=>{let n=t.find(t=>t.id===e.maestro_principal_id),r=0;return n&&n.disponibilidad&&Object.keys(n.disponibilidad).forEach(e=>{C(n.disponibilidad,e,i.jornada).forEach(e=>{r+=e.end-e.start})}),{...e,duracion:e.duracion||i.duracionBloque,totalAlumnos:e.total_alumnos||0,availableMinutes:r||1}});u.sort((e,t)=>e.availableMinutes===t.availableMinutes?t.totalAlumnos-e.totalAlumnos:e.availableMinutes-t.availableMinutes),u.forEach(e=>{let r=t.find(t=>t.id===e.maestro_principal_id);if(!r){o.push({clase_id:e.id,nombre:e.nombre,razon:`El maestro principal asignado (ID: ${e.maestro_principal_id}) no está registrado.`});return}let u=e.sesiones_por_semana??1,d=new Set;for(let t=0;t<u;t++){let u=te(e,i,r,n,s,c,{excludeDays:d,requireSameSalon:t>0?l.get(e.id)??null:null});if(u.length===0){if(t===0){let t=n.filter(t=>t.capacidad>=e.totalAlumnos&&t.is_active!==!1),i=`Sin disponibilidad compatible con maestro y salones.`;i=t.length===0?`No hay salones activos con capacidad suficiente para ${e.totalAlumnos} alumnos.`:`Conflicto de agenda: el maestro ${r.nombre} o los salones adecuados están ocupados en sus horas disponibles.`,o.push({clase_id:e.id,nombre:e.nombre,razon:i})}break}u.forEach(t=>{t.score=ee(t,e,s)}),u.sort((e,t)=>t.score-e.score);let f=u[0];a.push({clase_id:e.id,clase_nombre:e.nombre,maestro_id:r.id,maestro_nombre:r.nombre,salon_id:f.salon.id,salon_nombre:f.salon.nombre,dia:f.day,hora_inicio:x(f.start),hora_fin:x(f.end),duracion:e.duracion,color:re(r.id)}),s[r.id].push({day:f.day,start:f.start,end:f.end,classId:e.id}),c[f.salon.id].push({day:f.day,start:f.start,end:f.end,classId:e.id}),d.add(f.day),t===0&&l.set(e.id,f.salon.id)}});let d=e.length,f=new Set(a.map(e=>e.clase_id)).size,m=o.length,h={};n.forEach(e=>{let t=(c[e.id]||[]).reduce((e,t)=>e+(t.end-t.start),0),n=0;Object.keys(i.jornada).forEach(e=>{let t=i.jornada[e];t&&(t.inicio!==`00:00`||t.fin!==`00:00`)&&(n+=b(t.fin)-b(t.inicio))}),h[e.id]={nombre:e.nombre,porcentaje:Math.round(t/(n||1)*100)}});let g={};t.forEach(e=>{let t=(s[e.id]||[]).reduce((e,t)=>e+(t.end-t.start),0);g[e.id]={nombre:e.nombre,horas:Math.round(t/60*10)/10}});let _={};a.forEach(e=>{_[e.clase_id]=(_[e.clase_id]||0)+e.duracion/60});let v=d>0?f/d*100:100;return{assignments:a,noAsignadas:o,metricas:{totalClases:d,clasesAsignadas:f,clasesNoAsignadas:m,ocupacionSalones:h,cargaMaestros:g,score:Math.max(0,Math.round(v)),horasSemanalesPorGrupo:_}}}function re(e){let t=0;for(let n=0;n<e.length;n++)t=e.charCodeAt(n)+((t<<5)-t);return`hsl(${Math.abs(t%360)}, 70%, 88%)`}function w(e){let[t,n]=e.split(`:`).map(Number);return t*60+n}function ie(e,t,n=0){let r=w(e.hora_inicio),i=w(e.hora_fin),a=w(t.hora_inicio);return r<w(t.hora_fin)+n&&a-n<i}function T(e,{returnAnnotated:t=!1,gapMinutes:n=0}={}){let r=[],i=new Set;for(let t=0;t<e.length;t++)for(let a=t+1;a<e.length;a++){let o=e[t],s=e[a];o.dia===s.dia&&ie(o,s,n)&&(o.maestro_id&&o.maestro_id===s.maestro_id&&(r.push({type:`teacher`,ids:[o.clase_id,s.clase_id],day:o.dia,hora_inicio:o.hora_inicio,description:`${o.maestro_nombre} tiene dos clases al mismo tiempo: "${o.clase_nombre}" y "${s.clase_nombre}"`}),i.add(o.clase_id),i.add(s.clase_id)),o.salon_id&&o.salon_id===s.salon_id&&(r.push({type:`room`,ids:[o.clase_id,s.clase_id],day:o.dia,hora_inicio:o.hora_inicio,description:`${o.salon_nombre} está ocupado por "${o.clase_nombre}" y "${s.clase_nombre}" al mismo tiempo`}),i.add(o.clase_id),i.add(s.clase_id)))}return t?{conflicts:r,assignments:e.map(e=>({...e,hasConflict:i.has(e.clase_id)}))}:r}function ae({conflictDescription:e}){return new Promise(t=>{let n=document.createElement(`div`);n.className=`modal-backdrop fade show`,n.style.zIndex=`1040`;let r=document.createElement(`div`);r.className=`modal fade show d-block`,r.style.zIndex=`1050`,r.setAttribute(`role`,`dialog`),r.setAttribute(`aria-modal`,`true`),r.innerHTML=`
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>
              Conflicto detectado
            </h5>
          </div>
          <div class="modal-body">
            <p></p>
            <p class="text-muted small">¿Querés mover la clase de todas formas?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-action="cancel">Cancelar</button>
            <button type="button" class="btn btn-warning" data-action="confirm">Mover de todas formas</button>
          </div>
        </div>
      </div>
    `;let i=r.querySelector(`.modal-body p`);i&&(i.textContent=e);function a(e){document.body.removeChild(r),document.body.removeChild(n),t(e)}r.querySelector(`[data-action="confirm"]`).addEventListener(`click`,()=>a(!0)),r.querySelector(`[data-action="cancel"]`).addEventListener(`click`,()=>a(!1)),document.body.appendChild(n),document.body.appendChild(r)})}function oe(e,{assignments:t,onMove:n,onConflict:r}){let i=new AbortController,{signal:a}=i,o=null;return e.addEventListener(`dragstart`,e=>{let t=e.target.closest(`[draggable="true"][data-clase-id]`);t&&(o=t.dataset.claseId,t.classList.add(`hb-dragging`),e.dataTransfer&&(e.dataTransfer.effectAllowed=`move`,e.dataTransfer.setData(`text/plain`,o)))},{signal:a}),e.addEventListener(`dragend`,e=>{let t=e.target.closest(`[draggable="true"][data-clase-id]`);t&&t.classList.remove(`hb-dragging`),o=null},{signal:a}),e.addEventListener(`dragover`,e=>{let t=e.target.closest(`[data-day][data-hour]`);t&&(e.preventDefault(),e.dataTransfer&&(e.dataTransfer.dropEffect=`move`),t.classList.contains(`hb-drop-target`)||t.classList.add(`hb-drop-target`))},{signal:a}),e.addEventListener(`dragleave`,e=>{let t=e.target.closest(`[data-day][data-hour]`);t&&(t.contains(e.relatedTarget)||t.classList.remove(`hb-drop-target`))},{signal:a}),e.addEventListener(`drop`,e=>{let i=e.target.closest(`[data-day][data-hour]`);if(!i)return;e.preventDefault(),i.classList.remove(`hb-drop-target`);let a=o??(e.dataTransfer?e.dataTransfer.getData(`text/plain`):null);if(!a)return;let s=i.dataset.day,c=i.dataset.hour,l=t.find(e=>String(e.clase_id)===String(a));if(!l)return;let u=l.dia,d=l.hora_inicio,f=T(t.map(e=>{if(String(e.clase_id)!==String(a))return e;let t=v(e.hora_inicio,e.hora_fin);return{...e,dia:s,hora_inicio:c,hora_fin:_(c,t)}}),{gapMinutes:0});f.length===0?n({claseId:a,fromDay:u,fromHour:d,toDay:s,toHour:c}):r({assignment:l,targetDay:s,targetHour:c,conflicts:f})},{signal:a}),{destroy(){i.abort()}}}var E={piano:`#818cf8`,violín:`#34d399`,violin:`#34d399`,guitarra:`#f472b6`,canto:`#fb923c`,voz:`#ec4899`,percusión:`#a78bfa`,percusion:`#a78bfa`,solfeo:`#38bdf8`,cello:`#f59e0b`,flauta:`#06b6d4`,trompeta:`#84cc16`,general:`#94a3b8`};function se(e=``){return E[e.toLowerCase()]??E.general}function ce(e=``){let t=0;for(let n=0;n<e.length;n++)t=e.charCodeAt(n)+((t<<5)-t);return`hsl(${Math.abs(t%360)}, 70%, 88%)`}function D(e){return e==null?``:String(e).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function O(e,{draggable:t=!1}={}){let{clase_id:n,clase_nombre:r,instrumento:i=`General`,maestro_id:a,maestro_nombre:o=``,salon_nombre:s=``,hora_inicio:c,hora_fin:l,locked:u=!1,hasConflict:d=!1}=e,f=se(i),p=ce(a||``),m=t&&!u,h=D(o.split(` `).slice(0,2).map(e=>e[0]??``).join(``).toUpperCase()),g=D(n),_=d?` schedule-block--conflict`:``,v=d?`<span class="sb-conflict-icon" title="Conflicto detectado">⚠</span>`:``,y=m?`<button class="sb-lock-btn" data-clase-id="${g}" data-locked="${u}"
               title="${u?`Desbloquear`:`Bloquear`}">
         ${u?`🔒`:`🔓`}
       </button>`:u?`<span class="sb-lock-icon">🔒</span>`:``;return`
    <div class="schedule-block${_}"
         data-clase-id="${g}"
         data-locked="${u}"
         ${m?`draggable="true"`:``}>
      <div class="schedule-block__header" style="background:${f};">
        <span class="schedule-block__title">${D(r)}</span>
        <span class="schedule-block__actions">${v}${y}</span>
      </div>
      <div class="schedule-block__body">
        <span class="schedule-block__teacher-dot"
              style="background:${p};">${h}</span>
        <span class="schedule-block__teacher-name">${D(o)}</span>
      </div>
      ${s?`<div class="schedule-block__footer">${D(s)} · ${c}–${l}</div>`:``}
    </div>
  `}var le=`<p class="text-muted text-center py-4">No hay asignaciones para mostrar.</p>`;function ue(e,t,n){let r=new Map;for(let t of e){let e=y(t.hora_inicio);r.has(e)||r.set(e,new Map);let n=r.get(e),i=(t.dia||``).toLowerCase();n.has(i)||n.set(i,[]),n.get(i).push(t)}let i=[...r.keys()].sort(),a=h.map(e=>`<th class="sg-col-header" data-day="${e.key}">${e.label}</th>`).join(``),o=i.map(e=>{let n=r.get(e);return`<tr>
      <td class="sg-hour-label">${e}</td>
      ${h.map(r=>{let i=(n.get(r.key)||[]).map(e=>O(e,{draggable:t})).join(``);return`<td class="sg-cell" data-day="${r.key}" data-hour="${e}">${i}</td>`}).join(``)}
    </tr>`}).join(``);return`
    <div class="schedule-grid-wrapper">
      <table class="schedule-grid">
        ${n?`<caption class="text-muted">${n}</caption>`:``}
        <thead>
          <tr>
            <th class="sg-hour-col" aria-label="Hora"></th>
            ${a}
          </tr>
        </thead>
        <tbody>
          ${o}
        </tbody>
      </table>
    </div>
  `}function k(e,t,n){let r=new Map;for(let n of e){let e=n[t]||`(Sin asignar)`;r.has(e)||r.set(e,[]),r.get(e).push(n)}return`<div class="schedule-grouped-view">${[...r.entries()].map(([e,t])=>{let r=t.map(e=>O(e,{draggable:n})).join(``);return`
      <div class="sg-group">
        <h4 class="sg-group-title">${D(e)}</h4>
        <div class="sg-group-blocks">${r}</div>
      </div>
    `}).join(``)}</div>`}function de({assignments:e,activeView:t,draggable:n=!1,periodoId:r}={}){if(!e||e.length===0)return le;switch(t){case`teacher`:return k(e,`maestro_nombre`,n);case`room`:return k(e,`salon_nombre`,n);case`student`:return k(e,`clase_nombre`,n);default:return ue(e,n,r)}}var A=[`grid`,`teacher`,`room`,`student`],j={grid:{label:`Grilla`,icon:`bi-grid-3x3`},teacher:{label:`Por Maestro`,icon:`bi-person-lines-fill`},room:{label:`Por Salón`,icon:`bi-door-open`},student:{label:`Por Alumno`,icon:`bi-mortarboard`}};function M(e=`grid`){return j[e]||(e=`grid`),`
    <div class="view-toggle" style="display:flex;gap:0.4rem;flex-wrap:wrap;" role="tablist" aria-label="Modo de visualización">
      ${A.map(t=>{let{label:n,icon:r}=j[t],i=t===e;return`
      <button role="tab" aria-selected="${i}" class="vt-pill ${i?`vt-pill--active`:``}"
              data-view="${t}"
              style="
                display:inline-flex;align-items:center;gap:5px;
                padding:0.35rem 0.85rem;border-radius:999px;
                border:1.5px solid ${i?`#6366f1`:`#e2e8f0`};
                background:${i?`#6366f1`:`transparent`};
                color:${i?`#fff`:`#64748b`};
                font-size:0.78rem;font-weight:600;cursor:pointer;
                transition:all 0.15s ease;
              ">
        <i class="bi ${r}"></i>${n}
      </button>
    `}).join(``)}
    </div>
  `}var fe={lunes:`Lun`,martes:`Mar`,miércoles:`Mié`,jueves:`Jue`,viernes:`Vie`,sábado:`Sáb`};function pe(e=[],t=!1){if(e.length===0)return``;let n=e.length,r=e.map((e,t)=>{e.type;let n=D(fe[e.day]??e.day);return`
      <div class="cp-row"
           data-conflict-ids="${e.ids.join(`,`)}"
           data-conflict-index="${t}"
           style="
             display:flex;align-items:flex-start;gap:0.5rem;
             padding:0.5rem 0.75rem;
             border-bottom:1px solid #fee2e2;
             cursor:pointer;
             transition:background 0.1s;
           ">
        <span style="background:#fecaca;color:#991b1b;border-radius:4px;padding:1px 5px;font-size:0.6rem;font-weight:700;flex-shrink:0;margin-top:1px;">${D(e.type)}</span>
        <span style="font-size:0.72rem;color:#7f1d1d;line-height:1.4;">${n} ${e.hora_inicio} — ${D(e.description)}</span>
      </div>
    `}).join(``);return`
    <div class="conflict-panel" style="border:1.5px solid #fca5a5;border-radius:0.75rem;overflow:hidden;margin-top:1rem;">
      <!-- Header (click to toggle) -->
      <div class="cp-header"
           style="
             display:flex;align-items:center;justify-content:space-between;
             padding:0.6rem 0.9rem;
             background:#fef2f2;
             cursor:pointer;
           ">
        <span style="display:flex;align-items:center;gap:0.5rem;font-size:0.8rem;font-weight:700;color:#991b1b;">
          <i class="bi bi-exclamation-triangle-fill"></i>
          ${n} conflicto${n===1?``:`s`} detectado${n===1?``:`s`}
        </span>
        <i class="bi ${t?`bi-chevron-up`:`bi-chevron-down`}" class="cp-chevron" style="color:#991b1b;font-size:0.8rem;"></i>
      </div>
      <!-- Body -->
      <div class="cp-body" style="background:#fff5f5;display:${t?`block`:`none`};">
        ${r}
      </div>
    </div>
  `}function me(e,t,n){let r=e.querySelector(`.cp-header`),i=e.querySelector(`.cp-body`),a=e.querySelector(`.cp-chevron`);r?.addEventListener(`click`,()=>{let e=i.style.display!==`none`;i.style.display=e?`none`:`block`,a.className=`bi ${e?`bi-chevron-down`:`bi-chevron-up`}`}),e.querySelectorAll(`.cp-row`).forEach(e=>{e.addEventListener(`mouseenter`,()=>{e.style.background=`#fff1f2`}),e.addEventListener(`mouseleave`,()=>{e.style.background=`transparent`}),e.addEventListener(`click`,()=>{let r=parseInt(e.dataset.conflictIndex,10);isNaN(r)||!t[r]||n?.(t[r])})})}var N=[`borrador`,`revision`,`publicado`],P={borrador:`Borrador`,revision:`Revisión`,publicado:`Publicado`};function F(e){let t=document.createElement(`li`);t.className=`pw-feedback-item d-flex align-items-start gap-2 mb-1`;let n=document.createElement(`span`);n.className=`badge bg-secondary`,n.textContent=e.tipo;let r=document.createElement(`span`);return r.textContent=e.comentario,t.appendChild(n),t.appendChild(r),t}function I(e,{runId:t,estadoActual:n,isAdmin:r,feedback:i=[],onEstadoChange:a,onFeedbackAdd:o}){let s=N.indexOf(n);e.innerHTML=`
    <div class="pw-wizard">
      <!-- Stage indicators -->
      <div class="pw-stages d-flex align-items-center gap-2 mb-3">
        ${N.map((e,t)=>{let n=`pw-stage`;t===s?n+=` pw-stage--active`:t<s&&(n+=` pw-stage--done`);let r=t<N.length-1?`<div class="pw-stage-connector"></div>`:``;return`
      <div class="${n}" data-stage="${e}">
        <span class="pw-stage-dot"></span>
        <span class="pw-stage-label">${P[e]}</span>
      </div>
      ${r}
    `}).join(``)}
      </div>

      <!-- Stage content -->
      <div class="pw-content">
        <!-- Stage 1: borrador -->
        <div class="pw-panel" data-panel="borrador" ${n===`borrador`?``:`hidden`}>
          <p>El horario está en borrador. Envialo a revisión cuando esté listo.</p>
          <button class="btn btn-primary btn-sm pw-send-revision-btn">
            <i class="bi bi-send"></i> Enviar a revisión
          </button>
        </div>

        <!-- Stage 2: revision -->
        <div class="pw-panel" data-panel="revision" ${n===`revision`?``:`hidden`}>
          <h6>Comentarios y revisión</h6>
          <ul class="pw-feedback-list list-unstyled mb-2">
          </ul>
          <div class="pw-feedback-form d-flex gap-2">
            <input type="text" class="form-control form-control-sm pw-feedback-input"
                   placeholder="Agregar comentario...">
            <button class="btn btn-sm btn-outline-secondary pw-add-feedback-btn">
              <i class="bi bi-chat-dots"></i>
            </button>
          </div>
          ${r?`<button class="btn btn-success btn-sm mt-2 pw-approve-btn">
        <i class="bi bi-check-circle"></i> Aprobar y publicar
       </button>`:``}
        </div>

        <!-- Stage 3: publicado -->
        <div class="pw-panel" data-panel="publicado" ${n===`publicado`?``:`hidden`}>
          <div class="alert alert-success">
            <i class="bi bi-check-circle-fill"></i>
            Horario publicado. Ya es visible para todos los usuarios.
          </div>
        </div>
      </div>
    </div>
  `;let c=e.querySelector(`.pw-send-revision-btn`);c&&c.addEventListener(`click`,()=>a?.(`revision`));let l=e.querySelector(`.pw-approve-btn`);l&&l.addEventListener(`click`,()=>a?.(`publicado`));let u=e.querySelector(`.pw-add-feedback-btn`),d=e.querySelector(`.pw-feedback-input`);function f(){let e=d?.value?.trim();e&&(o?.({comentario:e,tipo:`observacion`}),d&&(d.value=``))}u&&u.addEventListener(`click`,f),d&&d.addEventListener(`keydown`,e=>{e.key===`Enter`&&f()});let p=e.querySelector(`.pw-feedback-list`);p&&(p.innerHTML=``,(i||[]).forEach(e=>p.appendChild(F(e))))}async function L(t){let{data:n,error:r}=await e.from(`schedule_run_feedback`).select(`*`).eq(`run_id`,t).order(`created_at`,{ascending:!0});if(r)throw r;return n}async function R({runId:t,comentario:n,tipo:r=`observacion`}){let{data:i,error:a}=await e.from(`schedule_run_feedback`).insert([{run_id:t,comentario:n,tipo:r}]).select().single();if(a)throw a;return i}async function z(){let{data:{user:t}}=await e.auth.getUser();if(!t)return!1;let{data:n,error:r}=await e.from(`maestros`).select(`es_admin`).eq(`user_id`,t.id).single();return r||!n?!1:n.es_admin===!0}async function he(t,n){let{data:r,error:i}=await e.from(`schedule_runs`).update({estado:n}).eq(`id`,t).select().single();if(i)throw i;return r}function B({classes:e=[],config:t={}}){let n=e.filter(e=>!e.horarios||e.horarios.length===0),r=n.length>0?n.map(e=>`
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border: 1px dashed var(--hb-border); border-radius: 8px; margin-bottom: 6px; background: var(--hb-gray-100); font-size: 0.8rem;">
          <div style="min-width: 0; flex: 1; padding-right: 8px;">
            <div style="font-weight: 650; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; color: var(--hb-text);">${e.nombre}</div>
            <div style="font-size: 0.7rem; color: var(--hb-text-muted);">🎻 Especialidad: ${e.instrumento}</div>
          </div>
          <span class="badge bg-secondary-subtle text-secondary" style="font-size: 0.65rem; border-radius: 6px; font-weight: 600; padding: 4px 6px;">
            👤 ${e.total_alumnos} alum.
          </span>
        </div>
      `).join(``):`
      <div style="text-align: center; padding: 1.5rem; border: 1px dashed var(--hb-border); border-radius: 12px; background: var(--hb-success-light); color: var(--hb-success); font-size: 0.85rem; font-weight: 650;">
        <i class="bi bi-check-circle-fill" style="font-size: 1.2rem; display: block; margin-bottom: 4px;"></i>
        ¡Todas las clases ya tienen horarios!
      </div>
    `,i=[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`];return`
    <div class="hb-card" style="padding: 1.25rem;">
      <h3 class="hb-card-title">
        <i class="bi bi-sliders"></i>
        <span>Configuración del Motor</span>
      </h3>

      <!-- Work hours range -->
      <div class="hb-form-group" style="display:flex;gap:0.75rem;align-items:flex-end;">
        <div style="flex:1;">
          <label for="cp-start-time">Hora inicio</label>
          <input type="time" id="cp-start-time" class="hb-form-control" value="15:30">
        </div>
        <div style="flex:1;">
          <label for="cp-end-time">Hora fin</label>
          <input type="time" id="cp-end-time" class="hb-form-control" value="18:30">
        </div>
      </div>

      <!-- Active days -->
      <div class="hb-form-group">
        <label>Días activos</label>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
          ${h.map(e=>{let t=i.includes(e.key)?`checked`:``;return`
      <label style="display:inline-flex;align-items:center;gap:4px;font-size:0.78rem;cursor:pointer;margin-right:6px;">
        <input type="checkbox" id="cp-day-${e.key}" data-day="${e.key}" ${t}
               style="cursor:pointer;">
        ${e.label}
      </label>
    `}).join(``)}
        </div>
      </div>

      <!-- Sessions per week -->
      <div class="hb-form-group">
        <label for="cp-sesiones">Sesiones por semana</label>
        <input type="number" id="cp-sesiones" class="hb-form-control"
               min="1" max="5" value="1" style="width:80px;">
      </div>

      <div class="hb-form-group">
        <label for="hb-input-periodo">Período Académico</label>
        <select id="hb-input-periodo" class="hb-form-control">
          ${m.map(e=>`<option value="${e.id}" ${t.periodo===e.id?`selected`:``}>${e.nombre}</option>`).join(``)}
        </select>
      </div>

      <div class="hb-form-group">
        <label for="hb-input-duracion">Duración de Clases</label>
        <select id="hb-input-duracion" class="hb-form-control">
          <option value="30" ${t.duracionBloque===30?`selected`:``}>30 minutos</option>
          <option value="45" ${t.duracionBloque===45?`selected`:``}>45 minutos</option>
          <option value="60" ${t.duracionBloque===60||!t.duracionBloque?`selected`:``}>60 minutos</option>
          <option value="90" ${t.duracionBloque===90?`selected`:``}>90 minutos</option>
        </select>
      </div>

      <div class="hb-form-group" style="margin-bottom: 1.5rem;">
        <label for="hb-input-gap">Gap entre Clases (Descanso)</label>
        <select id="hb-input-gap" class="hb-form-control">
          <option value="0" ${t.gapMinimo===0?`selected`:``}>Sin descanso (0m)</option>
          <option value="10" ${t.gapMinimo===10?`selected`:``}>10 minutos</option>
          <option value="15" ${t.gapMinimo===15||!t.gapMinimo?`selected`:``}>15 minutos</option>
          <option value="30" ${t.gapMinimo===30?`selected`:``}>30 minutos</option>
        </select>
      </div>

      <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--hb-text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
        Clases Sin Horario Asignado (${n.length})
      </h4>

      <div class="hb-pending-classes-list" style="max-height: 200px; overflow-y: auto; margin-bottom: 1.5rem; padding-right: 4px;">
        ${r}
      </div>

      <button id="hb-btn-generate" class="hb-btn hb-btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; font-size: 0.95rem; border-radius: 12px; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);">
        <i class="bi bi-cpu-fill" style="font-size: 1.1rem;"></i>
        <span>Optimizar Horario</span>
      </button>
    </div>
  `}function ge(e){let t=e.querySelector(`#cp-start-time`),n=e.querySelector(`#cp-end-time`),r=e.querySelector(`#cp-sesiones`),i=e.querySelector(`#hb-input-duracion`),a=e.querySelector(`#hb-input-gap`);return{startTime:t?t.value:`15:30`,endTime:n?n.value:`18:30`,selectedDays:Array.from(e.querySelectorAll(`[data-day]`)).filter(e=>e.checked).map(e=>e.dataset.day),duracion:i?parseInt(i.value,10):60,gap:a?parseInt(a.value,10):15,sesionesPerSemana:r?parseInt(r.value,10):1}}var _e=[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`,`domingo`];function ve(e,t,n=[]){return Object.fromEntries(_e.map(r=>[r,n.includes(r)?{inicio:e,fin:t}:{inicio:`00:00`,fin:`00:00`}]))}var ye=`ABCDEFGHIJKLMNOPQRSTUVWXYZ`.split(``);function be(e,t){let n=t.filter(e=>e.is_active),r=n.length>0?Math.max(...n.map(e=>e.capacidad)):1,i=e.total_alumnos||0;if(i<=r)return[{...e,_isSubgroup:!1}];let a=Math.ceil(i/r),o=Math.floor(i/a),s=i%a;return ye.slice(0,a).map((t,n)=>{let r=o+ +(n<s);return{...e,id:`${e.id}_grupo_${t}`,nombre:`${e.nombre} — Grupo ${t}`,total_alumnos:r,_originalClaseId:e.id,_isSubgroup:!0,_groupLabel:t}})}function xe(e,t){return e.flatMap(e=>be(e,t))}function V(){return{assignments:[],conflicts:[],activeView:`grid`,activePeriodo:m[0].id,periodoId:m[0].id,draggable:!1,conflictPanelExpanded:!1,scheduleRuns:[],loading:!1,error:null,undoStack:[],redoStack:[],estado:`borrador`,runId:null,isAdmin:!1,feedback:[],publishWizardOpen:!1,lastConfig:null,noAsignadas:[],metricas:null,runEstado:`borrador`}}var H=V(),U=null,W=null;function Se(e){U=e,H=V(),we(),ke(),f().then(e=>{H.scheduleRuns=e||[]}).catch(e=>console.warn(`[horarioBuilderView] getScheduleRuns failed:`,e)),z().then(e=>{H.isAdmin=e}).catch(()=>{})}function Ce(){let e={borrador:{color:`#f59e0b`,bg:`rgba(245,158,11,0.12)`,icon:`bi-pencil-fill`,label:`Borrador`},en_revision:{color:`#3b82f6`,bg:`rgba(59,130,246,0.12)`,icon:`bi-eye-fill`,label:`En revisión`},publicado:{color:`#10b981`,bg:`rgba(16,185,129,0.12)`,icon:`bi-check-circle-fill`,label:`Publicado`},archivado:{color:`#6b7280`,bg:`rgba(107,114,128,0.12)`,icon:`bi-archive-fill`,label:`Archivado`}},t=e[H.estado]??e.borrador;return`<span style="display:inline-flex;align-items:center;gap:0.3rem;padding:0.2rem 0.6rem;border-radius:20px;font-size:0.72rem;font-weight:600;background:${t.bg};color:${t.color};">
    <i class="bi ${t.icon}" style="font-size:0.65rem;"></i>${t.label}
  </span>`}function G(){let e=H.assignments.length,t=H.conflicts.length,n=H.assignments.filter(e=>e.locked).length,r=H.undoStack.length;return`
    <div class="hb-stats-bar">
      <span class="hb-stat"><i class="bi bi-calendar3"></i> <strong>${e}</strong> bloque${e===1?``:`s`}</span>
      <span class="hb-stat ${t>0?`hb-stat--danger`:`hb-stat--ok`}">
        <i class="bi ${t>0?`bi-exclamation-triangle-fill`:`bi-check-circle-fill`}"></i>
        <strong>${t}</strong> conflicto${t===1?``:`s`}
      </span>
      <span class="hb-stat"><i class="bi bi-lock-fill"></i> <strong>${n}</strong> bloqueado${n===1?``:`s`}</span>
      ${r>0?`<span class="hb-stat hb-stat--muted"><i class="bi bi-clock-history"></i> ${r} en historial</span>`:``}
      ${H.runId?Ce():``}
    </div>
  `}function we(){let e=m.map(e=>`<option value="${e.id}" ${e.id===H.activePeriodo?`selected`:``}>${e.nombre}</option>`).join(``),t=H.draggable,n=H.assignments.length>0;U.innerHTML=`
    <div class="hb-view">

      <!-- Page header -->
      <div class="hb-page-header">
        <div class="hb-page-header__left">
          <div class="hb-page-header__icon"><i class="bi bi-calendar-week-fill"></i></div>
          <div>
            <h2 class="hb-page-header__title">Constructor de Horarios</h2>
            <p class="hb-page-header__sub">Genera, edita y publica el horario académico del período</p>
          </div>
        </div>
        <select class="hb-periodo-select" id="hb-periodo-select" title="Seleccionar período">
          ${e}
        </select>
      </div>

      <!-- Constraint panel (config: jornada, days, duration, sessions) -->
      <div id="hb-constraint-panel-slot">
        ${B({classes:[]})}
      </div>

      <!-- Stats bar -->
      <div id="hb-stats-wrapper">${n?G():``}</div>

      <!-- Toolbar principal -->
      <div class="hb-toolbar-main">
        <div class="hb-toolbar-group">
          <button class="hb-btn hb-btn--primary hb-btn--lg" id="hb-generate-btn">
            <i class="bi bi-lightning-fill"></i><span>Generar horario</span>
          </button>
        </div>
        <div class="hb-toolbar-divider"></div>
        <div class="hb-toolbar-group hb-toolbar-group--views">
          <span class="hb-toolbar-label">Vista</span>
          <div id="hb-view-toggle-slot">${M(H.activeView)}</div>
        </div>
        <div class="hb-toolbar-divider"></div>
        <div class="hb-toolbar-group">
          <button class="hb-btn ${t?`hb-btn--editing`:`hb-btn--ghost`}" id="hb-drag-toggle"
                  title="${t?`Desactivar edición`:`Activar drag & drop`}">
            <i class="bi ${t?`bi-unlock-fill`:`bi-lock-fill`}"></i>
            <span>${t?`Editando`:`Editar`}</span>
          </button>
          <button class="hb-btn hb-btn--icon" id="hb-undo-btn" disabled title="Deshacer">
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
          <button class="hb-btn hb-btn--icon" id="hb-redo-btn" disabled title="Rehacer">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
        </div>
        <div style="flex:1;"></div>
        <div class="hb-toolbar-group">
          <button class="hb-btn hb-btn--success" id="hb-save-btn" disabled>
            <i class="bi bi-floppy-fill"></i><span>Guardar</span>
          </button>
          <button class="hb-btn hb-btn--outline" id="hb-publish-btn" disabled>
            <i class="bi bi-globe"></i><span>Publicar</span>
          </button>
        </div>
      </div>

      <!-- Conflict panel -->
      <div id="hb-conflict-panel-wrapper"></div>

      <!-- Grid / empty state -->
      <div id="hb-grid-wrapper" class="hb-grid-wrapper">
        ${n?``:Te()}
      </div>

      <!-- Publish wizard -->
      <div id="hb-publish-wrapper" class="mt-3" style="display:none"></div>

      <!-- Loading overlay -->
      <div id="hb-status"></div>
    </div>
  `,Ee()}function Te(){return`
    <div class="hb-empty">
      <div class="hb-empty__icon"><i class="bi bi-calendar-plus"></i></div>
      <h3 class="hb-empty__title">Sin horario generado</h3>
      <p class="hb-empty__desc">
        Presioná <strong>Generar horario</strong> para que el sistema distribuya automáticamente
        las clases según los maestros y salones disponibles.
      </p>
      <div class="hb-empty__steps">
        <div class="hb-empty__step"><span class="hb-empty__step-num">1</span><span>Selecciona el período</span></div>
        <div class="hb-empty__step"><span class="hb-empty__step-num">2</span><span>Genera el horario</span></div>
        <div class="hb-empty__step"><span class="hb-empty__step-num">3</span><span>Ajusta con drag & drop</span></div>
        <div class="hb-empty__step"><span class="hb-empty__step-num">4</span><span>Guarda y publica</span></div>
      </div>
    </div>
  `}function Ee(){if(document.getElementById(`hb-shell-styles`))return;let e=document.createElement(`style`);e.id=`hb-shell-styles`,e.textContent=`
  .hb-view { padding: 1rem 1rem 2rem; max-width: 1400px; }
  .hb-page-header {
    display:flex;align-items:center;justify-content:space-between;
    flex-wrap:wrap;gap:1rem;margin-bottom:1.1rem;
  }
  .hb-page-header__left { display:flex;align-items:center;gap:0.75rem; }
  .hb-page-header__icon {
    width:44px;height:44px;border-radius:12px;
    background:var(--hb-primary-light);color:var(--hb-primary);
    display:flex;align-items:center;justify-content:center;font-size:1.25rem;flex-shrink:0;
  }
  .hb-page-header__title { font-size:1.1rem;font-weight:700;margin:0;color:var(--hb-text); }
  .hb-page-header__sub   { font-size:0.75rem;color:var(--hb-text-muted);margin:0; }
  .hb-periodo-select {
    padding:0.4rem 0.75rem;border-radius:10px;border:1.5px solid var(--hb-border);
    background:var(--hb-card-bg);color:var(--hb-text);font-size:0.85rem;cursor:pointer;outline:none;
  }
  .hb-periodo-select:focus { border-color:var(--hb-primary); }
  .hb-stats-bar {
    display:flex;align-items:center;flex-wrap:wrap;gap:0.75rem;
    padding:0.55rem 0.875rem;background:var(--hb-card-bg);
    border:1px solid var(--hb-border);border-radius:10px;margin-bottom:0.875rem;font-size:0.8rem;
  }
  .hb-stat { display:flex;align-items:center;gap:0.3rem;color:var(--hb-text-muted); }
  .hb-stat strong { color:var(--hb-text); }
  .hb-stat--ok .bi     { color:var(--hb-success); }
  .hb-stat--danger .bi,
  .hb-stat--danger strong { color:var(--hb-danger); }
  .hb-stat--muted { opacity:0.6; }
  .hb-toolbar-main {
    display:flex;align-items:center;flex-wrap:wrap;gap:0.5rem;
    background:var(--hb-card-bg);border:1px solid var(--hb-border);
    border-radius:12px;padding:0.55rem 0.875rem;margin-bottom:0.875rem;
  }
  .hb-toolbar-group { display:flex;align-items:center;gap:0.375rem; }
  .hb-toolbar-group--views { gap:0.5rem; }
  .hb-toolbar-label { font-size:0.72rem;color:var(--hb-text-muted);font-weight:600;white-space:nowrap; }
  .hb-toolbar-divider { width:1px;height:22px;background:var(--hb-border);flex-shrink:0; }
  .hb-btn {
    display:inline-flex;align-items:center;gap:0.35rem;
    padding:0.38rem 0.875rem;border-radius:8px;border:1.5px solid transparent;
    font-size:0.82rem;font-weight:600;cursor:pointer;transition:all 0.15s;
    white-space:nowrap;line-height:1;background:none;
  }
  .hb-btn:disabled { opacity:0.38;cursor:not-allowed;pointer-events:none; }
  .hb-btn--lg   { padding:0.48rem 1.1rem;font-size:0.875rem; }
  .hb-btn--icon { padding:0.38rem 0.5rem; }
  .hb-btn--primary { background:var(--hb-primary);color:#fff;border-color:var(--hb-primary); }
  .hb-btn--primary:hover { background:var(--hb-primary-hover);border-color:var(--hb-primary-hover); }
  .hb-btn--success { background:var(--hb-success);color:#fff;border-color:var(--hb-success); }
  .hb-btn--success:hover { filter:brightness(1.08); }
  .hb-btn--outline { border-color:var(--hb-primary);color:var(--hb-primary); }
  .hb-btn--outline:hover { background:var(--hb-primary-light); }
  .hb-btn--ghost { border-color:var(--hb-border);color:var(--hb-text-muted); }
  .hb-btn--ghost:hover { border-color:var(--hb-primary);color:var(--hb-primary); }
  .hb-btn--editing {
    border-color:var(--hb-warning);color:var(--hb-warning);background:var(--hb-warning-light);
    animation:hb-pulse-border 1.5s ease-in-out infinite;
  }
  @keyframes hb-pulse-border {
    0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0);}
    50%{box-shadow:0 0 0 3px rgba(245,158,11,0.2);}
  }
  .hb-empty {
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    text-align:center;padding:3rem 1.5rem;min-height:320px;
    border:2px dashed var(--hb-border);border-radius:16px;background:var(--hb-grid-bg);
  }
  .hb-empty__icon {
    width:68px;height:68px;border-radius:50%;background:var(--hb-primary-light);
    color:var(--hb-primary);display:flex;align-items:center;justify-content:center;
    font-size:1.875rem;margin-bottom:1rem;
  }
  .hb-empty__title { font-size:1.05rem;font-weight:700;margin:0 0 0.5rem;color:var(--hb-text); }
  .hb-empty__desc  { font-size:0.85rem;color:var(--hb-text-muted);max-width:360px;margin:0 auto 1.25rem;line-height:1.6; }
  .hb-empty__steps { display:flex;flex-wrap:wrap;justify-content:center;gap:0.6rem;max-width:460px; }
  .hb-empty__step  {
    display:flex;align-items:center;gap:0.45rem;background:var(--hb-card-bg);
    border:1px solid var(--hb-border);border-radius:8px;padding:0.35rem 0.7rem;
    font-size:0.76rem;color:var(--hb-text-muted);
  }
  .hb-empty__step-num {
    width:18px;height:18px;border-radius:50%;background:var(--hb-primary);color:#fff;
    display:flex;align-items:center;justify-content:center;font-size:0.62rem;font-weight:700;flex-shrink:0;
  }
  `,document.head.appendChild(e)}function De(){let e=U?.querySelector(`#hb-stats-wrapper`);e&&(e.innerHTML=H.assignments.length>0?G():``)}function K(){let e=U.querySelector(`#hb-grid-wrapper`);e&&(De(),e.innerHTML=de({assignments:H.assignments,activeView:H.activeView,draggable:H.draggable,periodoId:H.activePeriodo}))}function q(){let e=U.querySelector(`#hb-conflict-panel-wrapper`);if(!e)return;let t=e.querySelector(`.cp-body`);t&&(H.conflictPanelExpanded=t.style.display===`block`),e.innerHTML=pe(H.conflicts,H.conflictPanelExpanded),me(e,H.conflicts,e=>{let t=U.querySelector(`.hb-view`);e.ids.forEach(e=>{let n=t?.querySelector(`[data-clase-id="${e}"]`);n&&(n.scrollIntoView({behavior:`smooth`,block:`nearest`}),n.classList.add(`hb-highlight`),setTimeout(()=>n.classList.remove(`hb-highlight`),1500))})})}function Oe(){let e=U.querySelector(`#hb-view-toggle-slot`);e&&(e.innerHTML=M(H.activeView))}function J(){let e=U.querySelector(`#hb-publish-wrapper`);if(e){if(!H.publishWizardOpen||!H.runId){e.style.display=`none`;return}e.style.display=``,I(e,{runId:H.runId,estadoActual:H.estado,isAdmin:H.isAdmin,feedback:H.feedback,async onEstadoChange(e){try{await he(H.runId,e),H.estado=e,J()}catch(e){console.error(`[horario-builder] estado update failed:`,e)}},async onFeedbackAdd({comentario:e,tipo:t}){try{let n=await R({runId:H.runId,comentario:e,tipo:t});H.feedback=[...H.feedback,n],J()}catch(e){console.error(`[horario-builder] feedback add failed:`,e)}}})}}function Y(e){H.loading=e;let t=U.querySelector(`#hb-status`);t&&(t.innerHTML=e?`<div class="d-flex align-items-center gap-2 mt-2 text-muted" style="font-size:0.85rem;">
         <div class="spinner-border spinner-border-sm" role="status"></div>
         <span>Generando horario optimizado…</span>
       </div>`:``)}function X(e,n=`success`){if(n===`danger`){t.error(e);return}if(n===`warning`){t.show(e,`warning`);return}t.success(e)}function Z(e){return JSON.parse(JSON.stringify(e))}function Q(){let e=U?.querySelector(`#hb-undo-btn`),t=U?.querySelector(`#hb-redo-btn`);e&&(e.disabled=H.undoStack.length===0),t&&(t.disabled=H.redoStack.length===0)}function $(){W&&W.destroy(),H.draggable&&(W=oe(U.querySelector(`#hb-grid-wrapper`),{assignments:H.assignments,onMove({claseId:e,fromDay:t,fromHour:n,toDay:r,toHour:i}){H.undoStack.push(Z(H.assignments)),H.redoStack=[];let a=H.assignments.findIndex(t=>t.clase_id===e);if(a===-1)return;let o={...H.assignments[a]},s=v(o.hora_inicio,o.hora_fin);o.dia=r,o.hora_inicio=i,o.hora_fin=_(i,s),H.assignments[a]=o;let{conflicts:c,assignments:l}=T(H.assignments,{returnAnnotated:!0});H.conflicts=c,H.assignments=l,K(),q(),Q(),$()},async onConflict({assignment:e,targetDay:t,targetHour:n,conflicts:r}){let i=U.querySelector(`#hb-drag-toggle`);[i,U.querySelector(`#hb-undo-btn`),U.querySelector(`#hb-redo-btn`)].forEach(e=>{e&&(e.disabled=!0)});try{if(!await ae({conflictDescription:r.map(e=>e.description).join(`
`)}))return;H.undoStack.push(Z(H.assignments)),H.redoStack=[];let i=H.assignments.findIndex(t=>t.clase_id===e.clase_id);if(i===-1)return;let a={...H.assignments[i]},o=v(a.hora_inicio,a.hora_fin);a.dia=t,a.hora_inicio=n,a.hora_fin=_(n,o),H.assignments[i]=a;let s=T(H.assignments,{returnAnnotated:!0});H.conflicts=s.conflicts,H.assignments=s.assignments,K(),q(),Q(),$()}finally{i&&(i.disabled=!1),Q()}}}))}function ke(){U.addEventListener(`change`,e=>{e.target.id===`hb-periodo-select`&&(H.activePeriodo=e.target.value,K())}),U.addEventListener(`click`,async e=>{let t=e.target.closest(`.vt-pill[data-view]`);if(t){let e=t.dataset.view;A.includes(e)&&e!==H.activeView&&(H.activeView=e,Oe(),K());return}if(e.target.closest(`#hb-drag-toggle`)){H.draggable=!H.draggable;let e=U.querySelector(`#hb-drag-toggle`);e&&(e.innerHTML=H.draggable?`<i class="bi bi-unlock-fill"></i> Bloqueando`:`<i class="bi bi-lock-fill"></i> Editar`),K(),$();return}if(e.target.closest(`#hb-undo-btn`)){if(H.undoStack.length===0)return;H.redoStack.push(Z(H.assignments)),H.assignments=H.undoStack.pop();let e=T(H.assignments,{returnAnnotated:!0});H.conflicts=e.conflicts,H.assignments=e.assignments,K(),q(),Q(),$();return}if(e.target.closest(`#hb-redo-btn`)){if(H.redoStack.length===0)return;H.undoStack.push(Z(H.assignments)),H.assignments=H.redoStack.pop();let e=T(H.assignments,{returnAnnotated:!0});H.conflicts=e.conflicts,H.assignments=e.assignments,K(),q(),Q(),$();return}if(e.target.closest(`#hb-generate-btn`)){Ae();return}if(e.target.closest(`#hb-save-btn`)){je();return}if(e.target.closest(`#hb-publish-btn`)){if(H.publishWizardOpen=!H.publishWizardOpen,H.publishWizardOpen&&H.runId)try{H.feedback=await L(H.runId)}catch{H.feedback=[]}J();return}})}async function Ae(){let e=U.querySelector(`#hb-generate-btn`);e&&(e.disabled=!0),Y(!0);try{let e=await u(),t=U.querySelector(`#hb-constraint-panel-slot`),n=t?ge(t):{startTime:`10:00`,endTime:`19:00`,selectedDays:[`lunes`,`martes`,`miércoles`,`jueves`,`viernes`],duracion:60,gap:15,sesionesPerSemana:1},r=ve(n.startTime,n.endTime,n.selectedDays),i=xe((e.clases||[]).map(e=>({id:e.id,nombre:e.nombre,maestro_principal_id:e.maestro_principal_id,total_alumnos:e.total_alumnos||0,duracion:e.duracion_minutos??n.duracion,sesiones_por_semana:n.sesionesPerSemana})),e.salones||[]),a={jornada:r,gapMinimo:n.gap,duracionBloque:n.duracion,sesionesPerSemana:n.sesionesPerSemana};H.lastConfig=a,H.periodoId=H.activePeriodo;let o=ne({clasesConMaestro:i,maestros:e.maestros||[],salones:e.salones||[],config:a});H.noAsignadas=o.noAsignadas??[],H.metricas=o.metricas??{};let{conflicts:s,assignments:c}=T(o.assignments,{returnAnnotated:!0,gapMinutes:n.gap});H.assignments=c,H.conflicts=s,K(),q(),$();let l=U.querySelector(`#hb-save-btn`);l&&(l.disabled=H.assignments.length===0),X(s.length>0?`Horario generado con ${s.length} conflicto(s)`:`Horario optimizado sin conflictos`,s.length>0?`warning`:`success`)}catch(e){console.error(`[horarioBuilderView] handleGenerate error:`,e),X(`Error al generar: `+e.message,`danger`)}finally{Y(!1),e&&(e.disabled=!1)}}async function je(){let e=U.querySelector(`#hb-save-btn`);e&&(e.disabled=!0,e.innerHTML=`<span class="spinner-border spinner-border-sm"></span> Guardando…`);try{let e=H.assignments.map(e=>({...e,clase_id:e._originalClaseId??e.clase_id})),t=await d({periodo:H.periodoId??H.activePeriodo,config:H.lastConfig,resultado:{assignments:e,noAsignadas:H.noAsignadas??[]},metricas:H.metricas??{},estado:H.runEstado??`borrador`});if(t?.id){H.runId=t.id,H.estado=`borrador`;let e=U.querySelector(`#hb-publish-btn`);e&&(e.disabled=!1),X(`Horario guardado como borrador`,`success`)}else X(`Guardado incompleto: no se obtuvo ID del registro`,`warning`);H.error=null}catch(e){console.error(`[horarioBuilderView] handleSave error:`,e),H.error=e.message,X(`Error al guardar: `+e.message,`danger`)}finally{e&&(e.disabled=!1,e.innerHTML=`<i class="bi bi-floppy-fill"></i> Guardar`)}}export{Se as t};