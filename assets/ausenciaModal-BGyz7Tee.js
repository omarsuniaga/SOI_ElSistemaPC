import{t as e}from"./AppToast-DNGTRY9B.js";import{t}from"./main-maestros-D_YZrb46.js";import{i as n}from"./supabase-Dhe7Tlxd.js";import{i as r}from"./maestroAuth-CdApllXF.js";import{t as i}from"./AppModal-B_r6aHTM.js";import{i as a}from"./portalUtils-CkF82Yyk.js";async function o(e){let{data:t,error:r}=await n.from(`clases`).select(`id, nombre, instrumento, maestro_id`).eq(`maestro_id`,e);if(r)throw r;return t||[]}async function s(e,t,r){if(!e||e.length===0)return[];let{data:i,error:a}=await n.from(`sesiones`).select(`id, clase_id, fecha, hora_inicio, hora_fin, salon_id`).in(`clase_id`,e).gte(`fecha`,t).lte(`fecha`,r).order(`fecha`,{ascending:!0});if(a)throw a;return i||[]}async function c(e){if(!e||e.length===0)return[];let{data:t,error:r}=await n.from(`horarios`).select(`id, clase_id, dia, hora_inicio, hora_fin`).in(`clase_id`,e);if(r)throw r;return t||[]}async function l(){let{data:e,error:t}=await n.from(`salones`).select(`id, nombre, capacidad, ubicacion`).eq(`activo`,!0).order(`nombre`,{ascending:!0});if(t)throw t;return e||[]}async function u(e,t){if(!e||!t)return[];let{data:r,error:i}=await n.from(`sesiones`).select(`id, salon_id, clase_id, fecha, hora_inicio, hora_fin`).eq(`fecha`,e).order(`hora_inicio`,{ascending:!0});if(i)throw i;return(r||[]).filter(e=>!e.hora_inicio||!e.hora_fin?!1:t>=e.hora_inicio&&t<e.hora_fin)}async function d(e){let{data:t,error:r}=await n.from(`ausencias_maestros`).insert([{maestro_id:e.maestro_id,tipo_ausencia:e.tipo_ausencia,fecha_inicio:e.fecha_inicio,fecha_fin:e.fecha_fin,motivo:e.motivo,urgencia:e.urgencia,duracion_tipo:e.duracion_tipo,clases_afectadas:e.clases_afectadas,actividades_por_clase:e.actividades_por_clase,clase_emergente:e.clase_emergente,archivo_url:e.archivo_url,estado:e.estado||`pendiente`,creado_en:new Date().toISOString()}]).select().single();if(r)throw r;return t}async function f({ausencia:e,maestro:t,approvalUrl:r}){if(!e||!t)return null;let i=e.fecha_inicio===e.fecha_fin?e.fecha_inicio:`${e.fecha_inicio} al ${e.fecha_fin}`,a=`Nueva solicitud de ausencia: ${t.nombre_completo||t.nombre} (${i}) - Tipo: ${e.tipo_ausencia}`,{data:o,error:s}=await n.from(`notificaciones`).insert([{profile_id:null,tipo:`sistema`,titulo:`Nueva Solicitud de Ausencia`,mensaje:a,deep_link:r||`/ausencias/pendientes`,estado:`pendiente`,ausencia_id:e.id,creado_en:new Date().toISOString()}]).select().single();if(s)throw s;return o}var p=500,m=5*1024*1024,h=new Set([`application/pdf`,`image/jpeg`,`image/png`]),g=new Set([`enfermedad`,`personal`,`capacitacion`,`vacaciones`,`otro`]),_=new Set([`baja`,`media`,`alta`,`critica`]);function v(e){return typeof e==`string`&&e.trim().length>0}function y(e,t){let n={};v(e)||(n.fechaInicio=`Indicá la fecha inicial.`),v(t)||(n.fechaFin=`Indicá la fecha final.`),!n.fechaInicio&&!n.fechaFin&&t<e&&(n.fechaFin=`La fecha final no puede ser anterior a la fecha inicial.`);let r=Object.keys(n).length===0;return{valid:r,duracionTipo:r&&e===t?`un_dia`:`varios_dias`,errors:n}}function b(e){let t={};return e?(h.has(e.type)?e.size>m&&(t.archivo=`El documento no puede superar 5MB.`):t.archivo=`El documento debe ser PDF, JPG o PNG.`,{valid:Object.keys(t).length===0,errors:t}):{valid:!0,errors:t}}function x(e={}){let t=y(e.fechaInicio,e.fechaFin),n=b(e.archivo?.file||e.archivo||null),r={...t.errors,...n.errors};g.has(e.tipoAusencia)||(r.tipoAusencia=`Seleccioná un tipo de ausencia válido.`),_.has(e.urgencia)||(r.urgencia=`Seleccioná una urgencia válida.`),v(e.motivo)?e.motivo.trim().length>p&&(r.motivo=`El motivo no puede superar ${p} caracteres.`):r.motivo=`Explicá el motivo de la ausencia.`;let i=(e.clasesAfectadas||[]).filter(e=>e.selected!==!1);for(let e of i)v(e.actividadReemplazo)||(r[`actividad_${e.claseId}`]=`Indicá la actividad de reemplazo para esta clase.`);return e.claseEmergente?.activo&&(v(e.claseEmergente.fechaNueva)||(r.claseEmergenteFecha=`Indicá la fecha de recuperación.`),v(e.claseEmergente.horaNueva)||(r.claseEmergenteHora=`Indicá la hora de recuperación.`),v(e.claseEmergente.salonIdNuevo)||(r.claseEmergenteSalon=`Seleccioná un salón disponible.`)),{valid:Object.keys(r).length===0,duracionTipo:t.duracionTipo,errors:r}}[...h];var S=`documentos`,C=[`domingo`,`lunes`,`martes`,`miércoles`,`jueves`,`viernes`,`sábado`];function w(e){return String(e||``).trim().toLowerCase().normalize(`NFD`).replace(/[\u0300-\u036f]/g,``)}function T(e,t){let n=new Set,r=new Date(`${e}T00:00:00`),i=new Date(`${t}T00:00:00`);for(;r<=i;)n.add(w(C[r.getDay()])),r.setDate(r.getDate()+1);return n}function E(e){return!e?.hora_inicio&&!e?.hora_fin?``:e.hora_fin?`${e.hora_inicio} - ${e.hora_fin}`:e.hora_inicio}function D(e){return String(e||`soporte`).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).replace(/[^a-zA-Z0-9._-]/g,`_`)}async function O(e,t,n){let r=await o(e),i=(r||[]).map(e=>e.id);if(!i.length)return[];let[a,l]=await Promise.all([s(i,t,n),c(i)]),u=new Map(r.map(e=>[e.id,e])),d=new Map;for(let e of a||[]){let n=u.get(e.clase_id);n&&d.set(e.clase_id,{claseId:e.clase_id,className:n.nombre,instrumento:n.instrumento||``,sessionDate:e.fecha||t,sessionTime:E(e),actividadReemplazo:``,selected:!0})}let f=T(t,n);for(let e of l||[]){if(!f.has(w(e.dia))||d.has(e.clase_id))continue;let t=u.get(e.clase_id);t&&d.set(e.clase_id,{claseId:e.clase_id,className:t.nombre,instrumento:t.instrumento||``,sessionDate:``,sessionTime:E(e),actividadReemplazo:``,selected:!0})}return[...d.values()]}async function k(e,t){if(!e||!t)return[];let[n,r]=await Promise.all([l(),u(e,t)]),i=new Set((r||[]).map(e=>e.salon_id).filter(Boolean));return(n||[]).filter(e=>!i.has(e.id))}async function A({maestroId:e,file:t}){if(!t)return null;let r=`ausencias/${e}/${Date.now()}_${D(t.name)}`,{error:i}=await n.storage.from(S).upload(r,t,{contentType:t.type});if(i)throw i;let{data:a}=n.storage.from(S).getPublicUrl(r);return a.publicUrl}function j({maestro:e,formState:t,archivoUrl:n=null}){let r=(t.clasesAfectadas||[]).filter(e=>e.selected!==!1),i=Object.fromEntries(r.map(e=>[e.claseId,e.actividadReemplazo||``])),a=t.claseEmergente?.activo?{activo:!0,clase_id:t.claseEmergente.claseId||null,fecha:t.claseEmergente.fechaNueva||null,hora:t.claseEmergente.horaNueva||null,salon_id:t.claseEmergente.salonIdNuevo||null}:null;return{maestro_id:e.id,tipo_ausencia:t.tipoAusencia,fecha_inicio:t.fechaInicio,fecha_fin:t.fechaFin,motivo:t.motivo?.trim()||``,urgencia:t.urgencia,duracion_tipo:t.duracionTipo||(t.fechaInicio===t.fechaFin?`un_dia`:`varios_dias`),clases_afectadas:r.map(e=>e.claseId),actividades_por_clase:i,clase_emergente:a,archivo_url:n,estado:`pendiente`}}function M({maestro:e,ausencia:t,clasesAfectadas:n=[],coverageSummary:r=`Pendiente de coordinación`,approvalUrl:i=``}){let a=t.fecha_inicio===t.fecha_fin?t.fecha_inicio:`${t.fecha_inicio} al ${t.fecha_fin}`;return[`Solicitud de ausencia`,`Maestro: ${e?.nombre_completo||e?.nombre||`No especificado`}`,`Tipo: ${t.tipo_ausencia}`,`Urgencia: ${t.urgencia}`,`Fechas: ${a}`,`Clases afectadas: ${n.length}`,`Solución: ${r}`,i?`Aprobación: ${i}`:``,``,`Enviado desde Portal SOI`].filter(Boolean).join(`
`)}async function N({maestro:e,formState:t,notifyDirector:n=!0,approvalUrl:r=``}){let i=x(t);if(!i.valid){let e=Error(`La solicitud de ausencia tiene errores de validación.`);throw e.validationErrors=i.errors,e}let a=await A({maestroId:e.id,file:t.archivo?.file||null}),o=await d(j({maestro:e,formState:{...t,duracionTipo:i.duracionTipo},archivoUrl:a}));return{ausencia:o,whatsappText:M({maestro:e,ausencia:o,clasesAfectadas:t.clasesAfectadas||[],coverageSummary:t.coverageSummary,approvalUrl:r}),notification:n&&f?await f({ausencia:o,maestro:e,approvalUrl:r}):null}}var P=[{value:`enfermedad`,label:`Médica`,icon:`bi-heart-pulse-fill`,color:`#ef4444`},{value:`personal`,label:`Personal`,icon:`bi-person-fill`,color:`#3b82f6`},{value:`capacitacion`,label:`Capacitación`,icon:`bi-mortarboard-fill`,color:`#8b5cf6`},{value:`vacaciones`,label:`Vacaciones`,icon:`bi-sun-fill`,color:`#f59e0b`},{value:`otro`,label:`Otro`,icon:`bi-three-dots`,color:`#6b7280`}],F=[{value:`baja`,label:`Baja`,icon:`bi-circle-fill`,color:`#22c55e`,bg:`rgba(34,197,94,0.12)`},{value:`media`,label:`Media`,icon:`bi-circle-fill`,color:`#f59e0b`,bg:`rgba(245,158,11,0.12)`},{value:`alta`,label:`Alta`,icon:`bi-circle-fill`,color:`#ef4444`,bg:`rgba(239,68,68,0.12)`}],I=new class{constructor(){this.maestro=null,this._focusTrap=null,this.state=this._defaultState()}_defaultState(){return{duracion:`dia`,fechaInicio:``,fechaFin:``,tipoAusencia:`personal`,urgencia:`media`,motivo:``,notifyDirector:!0,clasesAfectadas:[],coverageType:`activities`,claseEmergente:{fecha:``,hora:``,salonIdNuevo:null},archivo:{file:null,uploadedUrl:null},availableSalons:[],submitted:!1,whatsappText:``}}_renderForm(){let e=new Date().toISOString().split(`T`)[0],t=this.state.duracion===`dia`;return`
      <form class="pm-ausencia-form" id="ausencia-form" novalidate>

        <!-- ── Tipo de ausencia ── -->
        <section class="am-section">
          <p class="am-section-label"><i class="bi bi-tag-fill"></i> Tipo de ausencia</p>
          <div class="am-tipo-grid">
            ${P.map(e=>`
              <button type="button" class="am-tipo-btn ${e.value===this.state.tipoAusencia?`selected`:``}"
                data-tipo="${e.value}" style="--tipo-color:${e.color}">
                <i class="bi ${e.icon}" style="color:${e.color};font-size:1.4rem;"></i>
                <span>${e.label}</span>
              </button>`).join(``)}
          </div>
          <input type="hidden" id="tipo-ausencia" value="${this.state.tipoAusencia}">
        </section>

        <!-- ── Duración ── -->
        <section class="am-section">
          <p class="am-section-label"><i class="bi bi-calendar3"></i> Duración</p>
          <div class="am-duracion-toggle">
            <button type="button" class="am-dur-btn ${t?`selected`:``}" data-dur="dia">
              <i class="bi bi-calendar-day"></i> Un día
            </button>
            <button type="button" class="am-dur-btn ${t?``:`selected`}" data-dur="rango">
              <i class="bi bi-calendar-range"></i> Varios días
            </button>
          </div>

          <!-- Un solo día -->
          <div id="fecha-dia-panel" style="${t?``:`display:none;`}margin-top:0.75rem;">
            <label class="am-input-label">
              <i class="bi bi-calendar-event"></i> Fecha de ausencia <span class="am-required">*</span>
            </label>
            <input type="date" id="fecha-unica" class="am-input" value="${a(this.state.fechaInicio)}" min="${e}">
          </div>

          <!-- Rango de fechas -->
          <div id="fecha-rango-panel" style="${t?`display:none;`:``}margin-top:0.75rem;">
            <div class="am-date-grid">
              <div>
                <label class="am-input-label"><i class="bi bi-box-arrow-right"></i> Desde <span class="am-required">*</span></label>
                <input type="date" id="fecha-inicio" class="am-input" value="${a(this.state.fechaInicio)}" min="${e}">
              </div>
              <div>
                <label class="am-input-label"><i class="bi bi-box-arrow-in-right"></i> Hasta <span class="am-required">*</span></label>
                <input type="date" id="fecha-fin" class="am-input" value="${a(this.state.fechaFin)}" min="${e}">
              </div>
            </div>
          </div>
        </section>

        <!-- ── Urgencia ── -->
        <section class="am-section">
          <p class="am-section-label"><i class="bi bi-lightning-fill"></i> Urgencia</p>
          <div class="am-urgencia-row">
            ${F.map(e=>`
              <button type="button" class="am-urg-btn ${e.value===this.state.urgencia?`selected`:``}"
                data-urg="${e.value}" style="--urg-color:${e.color};--urg-bg:${e.bg}">
                <i class="bi ${e.icon}" style="color:${e.color};font-size:0.55rem;"></i>
                ${e.label}
              </button>`).join(``)}
          </div>
          <input type="hidden" id="urgencia" value="${this.state.urgencia}">
        </section>

        <!-- ── Motivo ── -->
        <section class="am-section">
          <p class="am-section-label"><i class="bi bi-chat-left-text-fill"></i> Motivo <span class="am-required">*</span></p>
          <textarea id="motivo" class="am-textarea" maxlength="500"
            placeholder="Describí brevemente el motivo de tu ausencia..."
          >${a(this.state.motivo)}</textarea>
          <div class="am-char-count"><span id="motivo-count">${this.state.motivo.length}</span>/500</div>
        </section>

        <!-- ── Clases afectadas ── -->
        <section class="am-section">
          <p class="am-section-label"><i class="bi bi-music-note-list"></i> Clases afectadas</p>
          <div id="clases-afectadas-container" class="am-clases-placeholder">
            <i class="bi bi-calendar-x" style="font-size:1.5rem;opacity:0.4;"></i>
            <span>Seleccioná la fecha para ver las clases afectadas</span>
          </div>
        </section>

        <!-- ── Cobertura ── -->
        <section class="am-section">
          <p class="am-section-label"><i class="bi bi-shield-check"></i> Cobertura</p>
          <div class="am-coverage-opts">
            <label class="am-coverage-opt ${this.state.coverageType===`activities`?`selected`:``}">
              <input type="radio" name="coverage-type" value="activities" ${this.state.coverageType===`activities`?`checked`:``} style="display:none;">
              <i class="bi bi-journal-check" style="font-size:1.1rem;"></i>
              <div>
                <strong>Actividades</strong>
                <p>Asignar tareas para el período</p>
              </div>
            </label>
            <label class="am-coverage-opt ${this.state.coverageType===`reschedule`?`selected`:``}">
              <input type="radio" name="coverage-type" value="reschedule" ${this.state.coverageType===`reschedule`?`checked`:``} style="display:none;">
              <i class="bi bi-calendar-plus" style="font-size:1.1rem;"></i>
              <div>
                <strong>Clase emergente</strong>
                <p>Reprogramar en otra fecha</p>
              </div>
            </label>
          </div>

          <div id="reschedule-panel" style="${this.state.coverageType===`reschedule`?``:`display:none;`}margin-top:0.75rem;">
            <div class="am-date-grid">
              <div>
                <label class="am-input-label"><i class="bi bi-calendar-event"></i> Fecha emergente</label>
                <input type="date" id="emergente-fecha" class="am-input" value="${a(this.state.claseEmergente.fecha)}" min="${e}">
              </div>
              <div>
                <label class="am-input-label"><i class="bi bi-clock"></i> Hora</label>
                <input type="time" id="emergente-hora" class="am-input" value="${a(this.state.claseEmergente.hora)}">
              </div>
            </div>
            <div id="salones-container"></div>
          </div>
        </section>

        <!-- ── Documento soporte ── -->
        <section class="am-section">
          <p class="am-section-label"><i class="bi bi-paperclip"></i> Documento soporte <span style="font-size:0.72rem;color:var(--pm-text-muted);font-weight:400;">(opcional)</span></p>
          <label class="am-file-label" id="am-file-drop">
            <input type="file" id="archivo-soporte" accept=".pdf,.jpg,.jpeg,.png" style="display:none;">
            <i class="bi bi-cloud-upload" style="font-size:1.5rem;opacity:0.5;"></i>
            <span id="am-file-name">PDF, JPG o PNG · máx. 5 MB</span>
          </label>
        </section>

        <!-- ── Notificación ── -->
        <section class="am-section">
          <label class="am-switch-row" id="am-notify-label">
            <div class="am-switch-info">
              <i class="bi bi-bell-fill" style="color:var(--pm-primary);"></i>
              <div>
                <strong>Notificar al director</strong>
                <p>Se enviará una alerta automática</p>
              </div>
            </div>
            <label class="pm-apple-switch">
              <input type="checkbox" id="notify-director" ${this.state.notifyDirector?`checked`:``}>
              <span class="pm-apple-switch-slider"></span>
            </label>
          </label>
        </section>

        <div id="ausencia-errors" role="alert" class="am-errors"></div>
      </form>

      <style>
        .pm-ausencia-form { display:flex; flex-direction:column; gap:0; }
        .am-section { padding: 0.85rem 0; border-bottom: 1px solid var(--pm-border); }
        .am-section:last-of-type { border-bottom: none; }
        .am-section-label {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.05em; color: var(--pm-text-muted); margin: 0 0 0.65rem;
        }
        .am-required { color: var(--pm-danger); }

        /* Tipo pills */
        .am-tipo-grid {
          display: grid; grid-template-columns: repeat(5,1fr); gap: 0.4rem;
        }
        @media (max-width: 480px) { .am-tipo-grid { grid-template-columns: repeat(3,1fr); } }
        .am-tipo-btn {
          display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
          padding: 0.6rem 0.25rem; border-radius: 12px;
          border: 1.5px solid var(--pm-border);
          background: var(--pm-surface-2); cursor: pointer;
          font-size: 0.68rem; font-weight: 600; color: var(--pm-text-muted);
          transition: all 0.15s; line-height: 1.2;
        }
        .am-tipo-btn:hover { border-color: var(--tipo-color); color: var(--tipo-color); }
        .am-tipo-btn.selected {
          border-color: var(--tipo-color);
          background: color-mix(in srgb, var(--tipo-color) 12%, transparent);
          color: var(--tipo-color); font-weight: 700;
        }

        /* Duración toggle */
        .am-duracion-toggle { display: flex; gap: 0.5rem; }
        .am-dur-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          padding: 0.55rem 0.75rem; border-radius: 10px;
          border: 1.5px solid var(--pm-border); background: var(--pm-surface-2);
          cursor: pointer; font-size: 0.83rem; font-weight: 600; color: var(--pm-text-muted);
          transition: all 0.15s;
        }
        .am-dur-btn.selected {
          border-color: var(--pm-primary); background: rgba(59,130,246,0.1);
          color: var(--pm-primary);
        }

        /* Date inputs */
        .am-date-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        @media (max-width: 400px) { .am-date-grid { grid-template-columns: 1fr; } }
        .am-input-label {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.75rem; font-weight: 600; color: var(--pm-text-muted); margin-bottom: 0.3rem;
        }
        .am-input {
          width: 100%; padding: 0.5rem 0.75rem; border-radius: 8px;
          border: 1.5px solid var(--pm-border); background: var(--pm-surface-2);
          color: var(--pm-text); font-size: 0.88rem; font-family: inherit;
          transition: border-color 0.15s;
        }
        .am-input:focus { outline: none; border-color: var(--pm-primary); }

        /* Urgencia chips */
        .am-urgencia-row { display: flex; gap: 0.5rem; }
        .am-urg-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.35rem;
          padding: 0.45rem 0.5rem; border-radius: 20px;
          border: 1.5px solid var(--pm-border); background: var(--pm-surface-2);
          cursor: pointer; font-size: 0.8rem; font-weight: 600; color: var(--pm-text-muted);
          transition: all 0.15s;
        }
        .am-urg-btn.selected {
          border-color: var(--urg-color); background: var(--urg-bg);
          color: var(--urg-color);
        }

        /* Textarea */
        .am-textarea {
          width: 100%; min-height: 80px; padding: 0.6rem 0.75rem;
          border: 1.5px solid var(--pm-border); border-radius: 10px;
          background: var(--pm-surface-2); color: var(--pm-text);
          font-family: inherit; font-size: 0.88rem; resize: vertical;
          transition: border-color 0.15s;
        }
        .am-textarea:focus { outline: none; border-color: var(--pm-primary); }
        .am-char-count { font-size: 0.72rem; color: var(--pm-text-muted); text-align: right; margin-top: 0.25rem; }

        /* Clases afectadas */
        .am-clases-placeholder {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 1rem; border-radius: 10px;
          background: var(--pm-surface-2); border: 1px dashed var(--pm-border);
          color: var(--pm-text-muted); font-size: 0.82rem;
        }

        /* Coverage options */
        .am-coverage-opts { display: flex; flex-direction: column; gap: 0.4rem; }
        .am-coverage-opt {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.65rem 0.85rem; border-radius: 10px;
          border: 1.5px solid var(--pm-border); background: var(--pm-surface-2);
          cursor: pointer; transition: all 0.15s; color: var(--pm-text);
        }
        .am-coverage-opt strong { display: block; font-size: 0.85rem; }
        .am-coverage-opt p { margin: 0; font-size: 0.72rem; color: var(--pm-text-muted); }
        .am-coverage-opt.selected {
          border-color: var(--pm-primary); background: rgba(59,130,246,0.08);
        }
        .am-coverage-opt.selected i { color: var(--pm-primary); }

        /* File upload */
        .am-file-label {
          display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
          padding: 1rem; border-radius: 10px; cursor: pointer;
          border: 1.5px dashed var(--pm-border); background: var(--pm-surface-2);
          color: var(--pm-text-muted); font-size: 0.8rem; text-align: center;
          transition: border-color 0.15s;
        }
        .am-file-label:hover { border-color: var(--pm-primary); }

        /* Switch row */
        .am-switch-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 0.75rem; cursor: pointer;
        }
        .am-switch-info {
          display: flex; align-items: center; gap: 0.65rem;
        }
        .am-switch-info strong { display: block; font-size: 0.88rem; color: var(--pm-text); }
        .am-switch-info p { margin: 0; font-size: 0.72rem; color: var(--pm-text-muted); }

        /* Errors */
        .am-errors {
          font-size: 0.82rem; color: var(--pm-danger);
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 8px; padding: 0.5rem 0.75rem; display: none; margin-top: 0.5rem;
        }
        .am-errors:not(:empty) { display: block; }
      </style>
    `}_renderSuccess(e){return`
      <div style="text-align:center;padding:1rem;">
        <p style="font-size:1.25rem;font-weight:600;color:var(--pm-success);">Solicitud enviada</p>
        <p style="color:var(--pm-text-muted);">Tu solicitud de ausencia fue enviada correctamente.</p>
        <div style="display:flex;gap:0.75rem;margin-top:1.5rem;flex-wrap:wrap;justify-content:center;">
          <button type="button" id="copy-whatsapp"
            style="padding:0.75rem 1.25rem;background:var(--pm-primary);color:white;border:none;border-radius:10px;font-weight:600;cursor:pointer;">
            📋 Copiar mensaje
          </button>
          <button type="button" id="open-whatsapp-btn"
            style="padding:0.75rem 1.25rem;background:#25D366;color:white;border:none;border-radius:10px;font-weight:600;cursor:pointer;">
            💬 Enviar por WhatsApp
          </button>
        </div>
      </div>
    `}open(){if(this._focusTrap?.dispose?.(),this._focusTrap=null,this.maestro=r(),!this.maestro){e.error(`Iniciá sesión para solicitar ausencias`);return}this.state=this._defaultState(),i.open({title:`Nueva Solicitud de Ausencia`,size:`lg`,body:this._renderForm(),saveText:`Enviar solicitud`,onSave:()=>this._handleSubmit(),onShow:()=>this._attachEvents()})}_attachEvents(){let e=document.querySelector(`.app-modal-dialog`);e&&(this._focusTrap=t(e,{onClose:()=>i.close()})),document.querySelectorAll(`.am-tipo-btn`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.am-tipo-btn`).forEach(e=>e.classList.remove(`selected`)),e.classList.add(`selected`),this.state.tipoAusencia=e.dataset.tipo,document.getElementById(`tipo-ausencia`).value=e.dataset.tipo})}),document.querySelectorAll(`.am-urg-btn`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.am-urg-btn`).forEach(e=>e.classList.remove(`selected`)),e.classList.add(`selected`),this.state.urgencia=e.dataset.urg,document.getElementById(`urgencia`).value=e.dataset.urg})});let n=()=>{this.state.fechaInicio&&this.state.fechaFin&&this._loadAffectedClasses()};document.querySelectorAll(`.am-dur-btn`).forEach(e=>{e.addEventListener(`click`,()=>{document.querySelectorAll(`.am-dur-btn`).forEach(e=>e.classList.remove(`selected`)),e.classList.add(`selected`),this.state.duracion=e.dataset.dur;let t=this.state.duracion===`dia`;document.getElementById(`fecha-dia-panel`).style.display=t?``:`none`,document.getElementById(`fecha-rango-panel`).style.display=t?`none`:``,this.state.fechaInicio=``,this.state.fechaFin=``,document.getElementById(`clases-afectadas-container`).innerHTML=`
          <i class="bi bi-calendar-x" style="font-size:1.5rem;opacity:0.4;"></i>
          <span>Seleccioná la fecha para ver las clases afectadas</span>`,document.getElementById(`clases-afectadas-container`).className=`am-clases-placeholder`})}),document.getElementById(`fecha-unica`)?.addEventListener(`change`,e=>{this.state.fechaInicio=e.target.value,this.state.fechaFin=e.target.value,n()}),document.getElementById(`fecha-inicio`)?.addEventListener(`change`,e=>{this.state.fechaInicio=e.target.value,n()}),document.getElementById(`fecha-fin`)?.addEventListener(`change`,e=>{this.state.fechaFin=e.target.value,n()}),document.querySelectorAll(`input[name="coverage-type"]`).forEach(e=>{e.addEventListener(`change`,e=>{this.state.coverageType=e.target.value,document.querySelectorAll(`.am-coverage-opt`).forEach(t=>{let n=t.querySelector(`input[name="coverage-type"]`);t.classList.toggle(`selected`,n?.value===e.target.value)});let t=document.getElementById(`reschedule-panel`);t&&(t.style.display=e.target.value===`reschedule`?``:`none`)})}),document.querySelectorAll(`.am-coverage-opt`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.querySelector(`input[type="radio"]`);t&&(t.checked=!0,t.dispatchEvent(new Event(`change`,{bubbles:!0})))})});let r=()=>{let e=document.getElementById(`emergente-fecha`)?.value,t=document.getElementById(`emergente-hora`)?.value;e&&(this.state.claseEmergente.fecha=e),t&&(this.state.claseEmergente.hora=t),this.state.claseEmergente.fecha&&this.state.claseEmergente.hora&&this._loadAvailableSalons()};document.getElementById(`emergente-fecha`)?.addEventListener(`change`,r),document.getElementById(`emergente-hora`)?.addEventListener(`change`,r),document.getElementById(`motivo`)?.addEventListener(`input`,e=>{this.state.motivo=e.target.value;let t=document.getElementById(`motivo-count`);t&&(t.textContent=String(e.target.value.length))}),document.getElementById(`notify-director`)?.addEventListener(`change`,e=>{this.state.notifyDirector=e.target.checked}),document.getElementById(`am-file-drop`)?.addEventListener(`click`,()=>{document.getElementById(`archivo-soporte`)?.click()}),document.getElementById(`archivo-soporte`)?.addEventListener(`change`,e=>{let t=e.target.files?.[0]||null;this.state.archivo.file=t;let n=document.getElementById(`am-file-name`);n&&(n.textContent=t?t.name:`PDF, JPG o PNG · máx. 5 MB`)})}async _loadAffectedClasses(){let e=document.getElementById(`clases-afectadas-container`);if(e){e.innerHTML=`<p style="color:var(--pm-text-muted);">Cargando clases...</p>`;try{let t=await O(this.maestro.id,this.state.fechaInicio,this.state.fechaFin);if(this.state.clasesAfectadas=t.map(e=>({...e,actividadReemplazo:e.actividadReemplazo||``})),t.length===0){e.innerHTML=`<p style="color:var(--pm-text-muted);">No hay clases en el período seleccionado.</p>`;return}e.innerHTML=t.map(e=>`
        <div class="pm-step-card" style="margin-bottom:0.75rem;padding:0.75rem;border:1px solid var(--pm-border);border-radius:8px;">
          <h4 style="margin:0 0 0.25rem;">${a(e.className||e.nombre||`Clase`)}</h4>
          <p style="margin:0;color:var(--pm-text-muted);font-size:0.85rem;">${a(e.sessionDate||e.fecha||``)} ${a(e.sessionTime||e.hora||``)}</p>
          <textarea data-activity-class-id="${a(e.claseId||e.id||``)}"
            placeholder="Actividad de reemplazo..."
            style="margin-top:0.5rem;width:100%;min-height:50px;padding:0.4rem;border:1px solid var(--pm-border);border-radius:6px;font-family:inherit;"
          >${a(e.actividadReemplazo||``)}</textarea>
        </div>
      `).join(``),e.querySelectorAll(`[data-activity-class-id]`).forEach(e=>{e.addEventListener(`input`,e=>{let t=e.target.dataset.activityClassId,n=this.state.clasesAfectadas.findIndex(e=>(e.claseId||e.id)===t);n!==-1&&(this.state.clasesAfectadas[n].actividadReemplazo=e.target.value)})})}catch(t){console.warn(`[AusenciaModal] Error loading affected classes:`,t),e.innerHTML=`<p style="color:var(--pm-danger);">Error al cargar las clases.</p>`}}}async _loadAvailableSalons(){let e=document.getElementById(`salones-container`);if(e){e.innerHTML=`<p style="color:var(--pm-text-muted);">Cargando salones...</p>`;try{let t=await k(this.state.claseEmergente.fecha,this.state.claseEmergente.hora);if(this.state.availableSalons=t,t.length===0){e.innerHTML=`<p style="color:var(--pm-text-muted);">No hay salones disponibles.</p>`;return}e.innerHTML=`
        <div style="margin-top:0.75rem;">
          <h4 style="margin:0 0 0.5rem;font-size:0.9rem;">Salón disponible:</h4>
          <div style="display:flex;flex-direction:column;gap:0.5rem;">
            ${t.map(e=>`
              <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;">
                <input type="radio" name="salon-emergente" value="${a(e.id)}"
                  ${this.state.claseEmergente.salonIdNuevo===e.id?`checked`:``}>
                <span>${a(e.nombre)} (cap. ${a(String(e.capacidad))})</span>
              </label>
            `).join(``)}
          </div>
        </div>
      `,e.querySelectorAll(`[name="salon-emergente"]`).forEach(e=>{e.addEventListener(`change`,e=>{this.state.claseEmergente.salonIdNuevo=e.target.value}),e.addEventListener(`click`,e=>{this.state.claseEmergente.salonIdNuevo=e.target.value})})}catch(t){console.warn(`[AusenciaModal] Error loading salons:`,t),e.innerHTML=`<p style="color:var(--pm-danger);">Error al cargar los salones.</p>`}}}_validate(){let e=[];return this.state.fechaInicio||e.push(`Seleccioná la fecha de inicio`),this.state.fechaFin||e.push(`Seleccioná la fecha de fin`),this.state.fechaInicio&&this.state.fechaFin&&this.state.fechaInicio>this.state.fechaFin&&e.push(`La fecha final debe ser después de la fecha inicial`),(!this.state.motivo||this.state.motivo.trim().length===0)&&e.push(`Explicá el motivo de la ausencia`),e}async _handleSubmit(){let t=document.getElementById(`motivo`);if(t&&(this.state.motivo=t.value),this.state.duracion===`dia`){let e=document.getElementById(`fecha-unica`)?.value;e&&(this.state.fechaInicio=e,this.state.fechaFin=e)}else{let e=document.getElementById(`fecha-inicio`)?.value,t=document.getElementById(`fecha-fin`)?.value;e&&(this.state.fechaInicio=e),t&&(this.state.fechaFin=t)}let n=this._validate();if(n.length>0){let e=document.getElementById(`ausencia-errors`);return e&&(e.textContent=n.join(`; `)),!1}try{let e=(await N({maestro:this.maestro,fechaInicio:this.state.fechaInicio,fechaFin:this.state.fechaFin,tipoAusencia:this.state.tipoAusencia,urgencia:this.state.urgencia,motivo:this.state.motivo,notifyDirector:this.state.notifyDirector,clasesAfectadas:this.state.clasesAfectadas,coverageType:this.state.coverageType,claseEmergente:this.state.claseEmergente}))?.whatsappText||``;this.state.whatsappText=e,this.state.submitted=!0;let t=document.querySelector(`.app-modal-body`);t&&(t.innerHTML=this._renderSuccess(e),this._attachSuccessEvents(t,e)),i.resetSaveBtn(`Cerrar`)}catch(t){console.error(`[AusenciaModal] Error submitting form:`,t),e.error(`Error al enviar la solicitud`)}return!1}_attachSuccessEvents(t,n){t.querySelector(`#copy-whatsapp`)?.addEventListener(`click`,async()=>{try{await navigator.clipboard.writeText(n),e.success(`Mensaje copiado`)}catch{e.error(`No se pudo copiar el mensaje`)}}),t.querySelector(`#open-whatsapp-btn`)?.addEventListener(`click`,()=>{let e=encodeURIComponent(n);window.open(`https://wa.me/?text=${e}`,`_blank`,`noopener,noreferrer`)})}};export{I as t};