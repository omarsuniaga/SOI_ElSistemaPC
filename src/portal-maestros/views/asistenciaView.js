import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML, formatHora } from '../utils/portalUtils.js'
import { enqueue } from '../services/offlineQueue.js'
import { parseDSL } from '../utils/dslParser.js'
import { enrichToDSL, transcribeAndStructure } from '../services/groqService.js'
import { createDslToolbar } from '../components/dslToolbar.js'
import { createDslEditor } from '../components/dslEditor.js'
import { createEvaluationDrawer } from '../components/EvaluationDrawer.js'
import { getMisClases, getHorariosClases, getInscripcionesClases, getSalones, invalidateClasesCache } from '../services/maestroDataService.js'
import { invalidateView as navInvalidateView } from '../services/navigationHooks.js'
import { createRouteTreeBar } from '../components/routeTreeBar.js'
import { createStudentProgressPanel } from '../components/studentProgressPanel.js'
import { resolveDSL, saveEvaluaciones } from '../services/evaluationService.js'
import { createAutoDraft, saveDraft, loadDraft, discardDraft, saveObservation } from '../services/autoDraftService.js'

/**
 * Vista Asistencia Optimizada (F3+): toma de asistencia con micro-interacciones.
 */
export async function renderAsistenciaView(container, { claseId, fecha } = {}) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  if (!claseId) {
    container.innerHTML = `<p class="pm-empty">No se indicó la clase.</p>`
    return
  }

  const fechaHoy = fecha || new Date().toISOString().split('T')[0]

  try {
    const diaHoy = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()

    // ── Batch 1: datos cacheados (instantáneos si hoyView ya cargó) + sesión en paralelo ──
    const [misClases, todosHorarios, todasInscripciones, sesionRes] = await Promise.all([
      getMisClases(),                       // cache: 1min
      getHorariosClases([claseId]),         // cache: 5min
      getInscripcionesClases([claseId]),    // cache: 2min
      supabase.from('sesiones_clase').select('*').eq('clase_id', claseId).eq('maestro_id', maestro.id).eq('fecha', fechaHoy).limit(1),
    ])

    const clase = misClases.find(c => c.id === claseId)
    if (!clase) {
      container.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Clase no encontrada.</p>`
      return
    }

    const horario = todosHorarios.find(h => h.dia?.toLowerCase() === diaHoy)

    const alumnos = (todasInscripciones || [])
      .map(i => i.alumnos)
      .filter(Boolean)
      .sort((a, b) => {
        const cmp1 = (a.instrumento_principal || '').localeCompare(b.instrumento_principal || '')
        if (cmp1 !== 0) return cmp1
        return (a.nombre_completo || '').localeCompare(b.nombre_completo || '')
      })

    const sesionExistenteData = sesionRes.data?.[0]
    const sesionId = sesionExistenteData?.id || null
    const serverUpdatedAt = sesionExistenteData?.updated_at || null
    const serverDSL = sesionExistenteData?.contenido || ''

    // ── Batch 2: snapshots + salón (en paralelo) ──
    const salonIds = clase.salon ? [clase.salon] : []
    const [snapshots, salonesData] = await Promise.all([
      sesionId
        ? supabase.from('class_session_content_snapshots').select('*').eq('session_id', sesionId).then(r => r.data || [])
        : Promise.resolve([]),
      salonIds.length > 0 ? getSalones(salonIds) : Promise.resolve([]),  // cache: 1hr
    ])
    const salonNombre = salonesData.length > 0 ? salonesData[0].nombre : null

    // Detectar conflicto
    const localKey = `pm_asistencia_${claseId}_${fechaHoy}`
    const localUpdatedAt = localStorage.getItem(`${localKey}_updated`)
    let hasConflict = false
    if (serverUpdatedAt && localUpdatedAt) {
      const serverTs = new Date(serverUpdatedAt).getTime()
      const localTs = new Date(localUpdatedAt).getTime()
      if (serverTs > localTs + 5000) hasConflict = true
    }

    // ── Resolve route_version_id for the class via instrumento ──
    let rutaId = null
    try {
      // clases.instrumento may be "Violín", "Violines", "Violín, Viola", etc.
      // routes.instrument is lowercase "violín"
      // Strategy: normalize clase instrumento, match first word against routes
      const claseRow = misClases?.find(c => c.id === claseId)
      const instrumento = claseRow?.instrumento
      if (instrumento) {
        const primerInstrumento = instrumento.split(',')[0].trim().toLowerCase()
        const { data: routeData } = await supabase
          .from('routes')
          .select('id, route_versions!inner(id)')
          .ilike('instrument', `%${primerInstrumento}%`)
          .eq('route_versions.status', 'published')
          .limit(1)
          .maybeSingle()
        rutaId = routeData?.route_versions?.[0]?.id || routeData?.route_versions?.id || null
      }
    } catch (_e) {
      console.warn('[asistencia] No se pudo resolver route_version_id:', _e)
    }

    // === Estado local ===
    const estado = {}
    const justificaciones = {}
    alumnos.forEach(a => { estado[a.id] = null })

    // Si hay sesión guardada, restaurar estados de asistencia
    const serverAsistencia = sesionExistenteData?.asistencia || []
    serverAsistencia.forEach(item => {
      if (estado.hasOwnProperty(item.alumno_id)) {
        estado[item.alumno_id] = item.estado
      }
    })

    // === Render ===
    _renderVista(container, {
      clase, horario, alumnos, estado, justificaciones,
      maestro, fechaHoy, claseId, sesionId, hasConflict, serverDSL, snapshots, salonNombre, rutaId
    })

  } catch (err) {
    container.innerHTML = `<p class="pm-empty" style="color:var(--pm-danger)">Error: ${escHTML(err.message)}</p>`
  }
}

function _renderVista(container, ctx) {
  const { clase, horario, alumnos, estado, justificaciones, maestro, fechaHoy, claseId, snapshots, serverDSL, hasConflict, salonNombre, rutaId } = ctx
  let sesionId = ctx.sesionId

  // Cleanup registry — all destroyable sub-components register here
  const _cleanups = []
  const localKey = `pm_asistencia_${claseId}_${fechaHoy}`
  let dslContent = serverDSL

  container.innerHTML = `
    <style>
      .pm-asist-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
      .pm-asist-bulk-circles { display: flex; gap: 0.75rem; align-items: center; }
      .pm-bulk-circle {
        width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid currentColor;
        display: flex; align-items: center; justify-content: center;
        font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        background: transparent;
      }
      .pm-bulk-circle.p { color: var(--pm-success); background: rgba(34, 197, 94, 0.05); }
      .pm-bulk-circle.a { color: var(--pm-danger); background: rgba(239, 68, 68, 0.05); }
      .pm-bulk-circle:hover { transform: scale(1.1); background: currentColor; color: #fff; }
      .pm-bulk-circle:active { transform: scale(0.95); }
      .pm-asist-nombre { cursor: pointer; text-decoration: underline dotted; text-underline-offset: 3px; }
      .pm-asist-nombre:hover { color: var(--pm-primary); }
    </style>
    <div class="pm-asist-root pm-animate-fade-in" style="position:relative; min-height:100vh;">
      ${hasConflict ? `
        <div class="pm-conflict-banner">
          <i class="bi bi-exclamation-triangle"></i>
          <span>Sesión modificada externamente. Guardado como revisión.</span>
          <button id="pm-conflict-dismiss">&times;</button>
        </div>
      ` : ''}
      
      <div class="pm-asist-header">
        <button id="pm-asist-back" class="pm-icon-btn"><i class="bi bi-arrow-left"></i></button>
        <div style="flex:1">
          <h2 class="pm-asist-title">${escHTML(clase.nombre)}</h2>
          <p class="pm-asist-subtitle">
            ${salonNombre ? `📍 ${escHTML(salonNombre)} · ` : ''}
            ${horario ? `${formatHora(horario.hora_inicio)} – ${formatHora(horario.hora_fin)} · ` : ''}
            ${alumnos.length} alumnos
          </p>
        </div>
        <div class="pm-asist-bulk-circles">
          <button id="btn-bulk-p" class="pm-bulk-circle p" title="Todos presentes">P</button>
          <button id="btn-bulk-a" class="pm-bulk-circle a" title="Todos ausentes">A</button>
        </div>
      </div>

      <div class="pm-asist-progress-wrap" id="pm-progress-wrap" style="display:none;">
        <div class="pm-asist-progress-bar">
          <div class="pm-asist-progress-fill" id="pm-progress-fill"></div>
        </div>
        <span class="pm-asist-progress-label" id="pm-progress-label">0/${alumnos.length}</span>
      </div>


      <div id="pm-alumnos-list" class="pm-alumnos-queue"></div>

      <div id="pm-route-tree-container" style="margin-top:1.5rem;"></div>

      <div class="pm-asist-dsl-section" style="margin-top:2rem;">
        <h3 class="pm-asist-section-title"><i class="bi bi-stars"></i> Registro de Clase</h3>
        <div id="pm-dsl-toolbar-container" style="margin-bottom:0.5rem;"></div>
        <div id="pm-dsl-editor-container"></div>
        <div id="pm-draft-indicator" style="display:none; padding:0.25rem 0.5rem; font-size:0.75rem; color:var(--pm-text-muted);"></div>
        <button class="pm-btn pm-btn-secondary" id="btn-guardar-obs" style="width:100%; margin-top:0.75rem; font-weight:600; display:none;">
          Guardar observacion
        </button>
      </div>

      <div class="pm-asist-footer">
        <button class="pm-btn pm-btn-primary" id="btn-guardar" style="width:100%; font-weight:700;">
          Guardar sesión
        </button>
      </div>
    </div>

    <!-- Modales... -->
  `;

  // === Editor DSL ===
  const toolbarContainer = container.querySelector('#pm-dsl-toolbar-container')
  const editorContainer = container.querySelector('#pm-dsl-editor-container')

  // Inicializar timer ANTES de usar onChange
  let _saveTimer = null;

  const editor = createDslEditor(editorContainer, {
    initialContent: serverDSL,
    onChange: (value) => { dslContent = value; /* save deferred only, no autoSave on typing */ }
  });
  
  // Pasar contexto para autocompletado (claseId para cargar alumnos)
  editor.setContext({ claseId: claseId });

  const toolbar = createDslToolbar(toolbarContainer, {
    onInsert: (text, cursorOffset, triggerAC) => editor.insertText(text, cursorOffset, triggerAC),
    onIaProposal: async (proposal) => {
      // Implementar modal Apple-style aquí si es necesario
    }
  });

  // === Route Tree Bar ===
  let routeTreeBar = null
  if (rutaId) {
    const treeContainer = container.querySelector('#pm-route-tree-container')
    routeTreeBar = createRouteTreeBar(treeContainer, {
      claseId,
      rutaId,
      onIndicadorSelect: (ind) => {
        // Insert indicator name into editor
        editor.insertText(`[${ind.nombre}] `)
        // Update toolbar context
        toolbar.setContext({ indicadorActivo: ind.nombre })
        // Show the save observation button when an indicator is selected
        const obsBtn = container.querySelector('#btn-guardar-obs')
        if (obsBtn) obsBtn.style.display = ''
      }
    })
    _cleanups.push(() => routeTreeBar.destroy())
  }

  // === Auto-Draft ===
  let autoDraft = null
  const draftIndicator = container.querySelector('#pm-draft-indicator')

  if (sesionId) {
    autoDraft = createAutoDraft({
      saveFn: async (content) => {
        if (!sesionId) return
        await saveDraft(sesionId, maestro.id, content)
      },
      debounceMs: 30000
    })

    autoDraft.onSaved(() => {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      draftIndicator.textContent = `Borrador guardado ${hh}:${mm}`
      draftIndicator.style.display = ''
    })

    // Wire editor onChange to autoDraft
    const originalOnChange = editor.getValue // capture ref
    const _origEditorOnInput = editorContainer.querySelector('#pm-dsl-editable')
    if (_origEditorOnInput) {
      const origHandler = _origEditorOnInput.oninput
      _origEditorOnInput.oninput = function (e) {
        if (origHandler) origHandler.call(this, e)
        if (autoDraft) autoDraft.onInput(editor.getValue())
      }
    }

    _cleanups.push(() => autoDraft.destroy())

    // Check for existing draft and offer recovery
    loadDraft(sesionId, maestro.id).then(draft => {
      if (draft && draft.contenido_raw && draft.contenido_raw.trim()) {
        const ts = draft.updated_at ? new Date(draft.updated_at).toLocaleString('es-AR') : ''
        const recover = confirm(`Hay un borrador guardado${ts ? ` (${ts})` : ''}.\n\n¿Deseas recuperarlo?`)
        if (recover) {
          editor.insertText(draft.contenido_raw)
          dslContent = draft.contenido_raw
        } else {
          discardDraft(draft.id).catch(err => console.warn('[autoDraft] Error discarding:', err))
        }
      }
    }).catch(err => console.warn('[autoDraft] Error loading draft:', err))
  }

  // === Save Observation Button ===
  const obsSaveBtn = container.querySelector('#btn-guardar-obs')
  if (obsSaveBtn) {
    // Show button if there is a route
    if (rutaId) obsSaveBtn.style.display = ''

    obsSaveBtn.onclick = async () => {
      const raw = editor.getValue()
      if (!raw || !raw.trim()) {
        alert('El editor esta vacio. Escribe observaciones antes de guardar.')
        return
      }

      if (!sesionId) {
        alert('Primero guarda la sesion (asistencia) para poder registrar observaciones.')
        return
      }

      const indicadorActivo = routeTreeBar?.getActiveIndicador()
      if (!indicadorActivo) {
        alert('Selecciona un indicador en la ruta antes de guardar la observacion.')
        return
      }

      obsSaveBtn.disabled = true
      obsSaveBtn.textContent = 'Guardando...'

      try {
        const presentes = alumnos.filter(a => estado[a.id] === 'P')
        const resolved = resolveDSL(raw, indicadorActivo.id, presentes)

        // Warn about missing students
        if (resolved.missing.length > 0) {
          const proceed = confirm(
            `Faltan ${resolved.missing.length} alumno(s) sin evaluar:\n${resolved.missing.join(', ')}\n\n¿Guardar de todas formas?`
          )
          if (!proceed) {
            obsSaveBtn.disabled = false
            obsSaveBtn.textContent = 'Guardar observacion'
            return
          }
        }

        // Save evaluations to indicator_attempts
        if (resolved.evaluaciones.length > 0) {
          const { error } = await saveEvaluaciones(sesionId, indicadorActivo.id, resolved.evaluaciones)
          if (error) throw error
        }

        // Save observation record
        const parsed = { indicador_id: indicadorActivo.id, evaluaciones: resolved.evaluaciones }
        await saveObservation(sesionId, maestro.id, raw, parsed)

        // Refresh route tree semaphore
        if (routeTreeBar) await routeTreeBar.refresh()

        // Clear editor
        editor.insertText('')
        dslContent = ''

        // Toast
        const toast = document.createElement('div')
        toast.textContent = 'Observacion guardada'
        toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--pm-success,#22c55e);color:#fff;padding:10px 20px;border-radius:8px;z-index:10000;font-size:14px;font-weight:600;'
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 3000)

        obsSaveBtn.textContent = 'Guardado!'
        setTimeout(() => { obsSaveBtn.textContent = 'Guardar observacion'; obsSaveBtn.disabled = false }, 2000)
      } catch (err) {
        console.error('[asistencia] Error saving observation:', err)
        alert('Error al guardar: ' + (err.message || err))
        obsSaveBtn.disabled = false
        obsSaveBtn.textContent = 'Guardar observacion'
      }
    }
  }

  // === Student Progress Panel tracking ===
  let _activeProgressPanel = null

  // === Render Lista con Animación ===
  const listEl = container.querySelector('#pm-alumnos-list');

  function renderLista(animateId = null) {
    const sorted = _sortAlumnos(alumnos, estado);
    
    // Si hay un ID para animar, capturamos su posición previa
    let prevRect = null;
    if (animateId) {
      const el = listEl.querySelector(`[data-id="${animateId}"]`);
      if (el) prevRect = el.getBoundingClientRect();
    }

    listEl.innerHTML = sorted.map(a => _renderAlumnoItem(a, estado[a.id])).join('');

    if (animateId && prevRect) {
      const newEl = listEl.querySelector(`[data-id="${animateId}"]`);
      const newRect = newEl.getBoundingClientRect();
      const deltaY = prevRect.top - newRect.top;

      newEl.animate([
        { transform: `translateY(${deltaY}px)`, opacity: 0.7 },
        { transform: 'translateY(0)', opacity: 1 }
      ], {
        duration: 300,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
      });
    }
  }

  function _renderAlumnoItem(a, est) {
    const colorClass = est ? `estado-${est.toLowerCase()}` : '';
    return `
      <div class="pm-asist-item ${colorClass}" data-id="${a.id}">
        <div class="pm-asist-avatar">${a.nombre_completo[0]}</div>
        <div class="pm-asist-info">
          <span class="pm-asist-nombre">${escHTML(a.nombre_completo)}</span>
          <span class="pm-asist-instrumento">${escHTML(a.instrumento_principal || '—')}</span>
        </div>
        <div class="pm-asist-btns">
          <button class="pm-asist-btn ${est === 'P' ? 'active-p' : ''}" data-action="P" data-id="${a.id}">P</button>
          <button class="pm-asist-btn ${est === 'J' ? 'active-j' : ''}" data-action="J" data-id="${a.id}">J</button>
          <button class="pm-asist-btn ${est === 'A' ? 'active-a' : ''}" data-action="A" data-id="${a.id}">A</button>
        </div>
      </div>
    `;
  }

  listEl.onclick = async (e) => {
    const btn = e.target.closest('.pm-asist-btn');
    const nameLabel = e.target.closest('.pm-asist-nombre');

    if (nameLabel) {
      const studentId = nameLabel.closest('.pm-asist-item').dataset.id;
      const student = alumnos.find(a => a.id === studentId);

      // If route is available, open progress panel instead of evaluation drawer
      if (rutaId) {
        if (_activeProgressPanel) _activeProgressPanel.destroy()
        _activeProgressPanel = createStudentProgressPanel({ alumno: student, rutaId })
        _activeProgressPanel.open()
        _cleanups.push(() => { if (_activeProgressPanel) _activeProgressPanel.destroy() })
        return
      }

      // Fallback: evaluation drawer when no route
      let studentSnapshots = snapshots.filter(s => s.student_id === studentId);

      // LAZY SNAPSHOT CREATION: Si el alumno no tiene snapshot, intentar crearlo al vuelo
      if (studentSnapshots.length === 0) {
        try {
          const { academicService } = await import('../../modules/academic-routes/services/academicService.js');
          const newSnaps = await academicService.createSnapshotForStudent(sesionId, studentId, fechaHoy);
          if (newSnaps) {
            studentSnapshots = newSnaps;
            snapshots.push(...newSnaps);
          } else {
            console.warn(`No se encontró planificación activa para el alumno ${studentId}`);
          }
        } catch (err) {
          console.error('Error creando snapshot on-demand:', err);
        }
      }

      createEvaluationDrawer(container, {
        student,
        sessionId: sesionId,
        teacherId: maestro.id,
        snapshots: studentSnapshots
      });
      return;
    }

    if (!btn) return;
    const { id, action } = btn.dataset;
    
    // Haptic feedback
    if (window.navigator.vibrate) window.navigator.vibrate(10);
    
    estado[id] = (estado[id] === action) ? null : action;
    renderLista(id);
    _updateProgress();
    
    // Guardado inmediato para evitar race conditions al navegar
    await _autoSave(true);
  };

  // === Sync & Helpers ===
  function _updateProgress() {
    const total = alumnos.length;
    const marcados = Object.values(estado).filter(v => v !== null).length;
    const wrap = container.querySelector('#pm-progress-wrap');
    const fill = container.querySelector('#pm-progress-fill');
    const label = container.querySelector('#pm-progress-label');

    if (marcados === 0) { wrap.style.display = 'none'; return; }
    wrap.style.display = 'flex';
    fill.style.width = `${(marcados / total) * 100}%`;
    label.textContent = `${marcados}/${total}`;
  }

async function _autoSave(immediate = false) {
    if (_saveTimer) clearTimeout(_saveTimer);
    
    const saveFn = async () => {
      const asistencia = alumnos.filter(a => estado[a.id]).map(a => ({
        alumno_id: a.id, estado: estado[a.id]
      }));
      
      // Si hay sesionId, verificar que existe antes de hacer update
      let op = sesionId ? 'update' : 'insert';
      if (sesionId) {
        const { data: exists } = await supabase.from('sesiones_clase').select('id').eq('id', sesionId).maybeSingle();
        if (!exists) { op = 'insert'; sesionId = null; }
      }
      
      await enqueue({
        tabla: 'sesiones_clase',
        operacion: op,
        payload: {
          ...(sesionId ? { id: sesionId } : {}),
          clase_id: claseId, 
          maestro_id: maestro.id, 
          fecha: fechaHoy,
          estado: 'pendiente',
          borrador: true,
          asistencia: asistencia || [], 
          contenido: dslContent || '',
        }
      });
      localStorage.setItem(`${localKey}_updated`, new Date().toISOString());
    };

    if (immediate) {
      await saveFn();
    } else {
      _saveTimer = setTimeout(saveFn, 2000);
    }
  }

  container.querySelector('#btn-guardar').onclick = async () => {
      const btn = container.querySelector('#btn-guardar');
      const originalText = btn.textContent;
      btn.textContent = 'Guardando...';
      btn.disabled = true;

      try {
        const asistencia = alumnos.filter(a => estado[a.id]).map(a => ({
          alumno_id: a.id, 
          estado: estado[a.id]
      }));
      
      const tieneAsistenciaMarcada = asistencia.length > 0;
      const tieneContenido = dslContent && dslContent.trim().length > 0;
      
      // Permitir guardar si hay asistencia marcada O contenido DSL no vacío
      if (!tieneAsistenciaMarcada && !tieneContenido) {
        throw new Error('Debes marcar asistencia o agregar contenido para guardar');
      }

      // 1. Guardar estado actual (asistencia y contenido)
      await _autoSave(true);

      // 2. Si hay sesión existente, marcarla como registrada (borrador = false)
      if (sesionId && (tieneAsistenciaMarcada || tieneContenido)) {
        // Intentar con 'registrada' primero (requiere migración 010)
        let { error } = await supabase
          .from('sesiones_clase')
          .update({ 
            borrador: false,
            estado: 'registrada',
            updated_at: new Date().toISOString()
          })
          .eq('id', sesionId)
          .select();

        // Fallback: si el CHECK constraint no acepta 'registrada', usar 'cerrada'
        if (error) {
          console.warn('estado "registrada" no permitido, usando fallback "cerrada":', error.message);
          const { error: err2 } = await supabase
            .from('sesiones_clase')
            .update({ 
              borrador: false,
              estado: 'cerrada',
              updated_at: new Date().toISOString()
            })
            .eq('id', sesionId)
            .select();

          if (err2) {
            // Último intento: solo borrador sin cambiar estado
            console.warn('Fallback "cerrada" también falló, actualizando solo borrador:', err2.message);
            await supabase
              .from('sesiones_clase')
              .update({ borrador: false, updated_at: new Date().toISOString() })
              .eq('id', sesionId);
          }
        }
        console.log('Sesión marcada como registrada');
        
        // Invalidar cache y vistas para que se actualicen
        invalidateClasesCache();
        navInvalidateView('hoy');
        navInvalidateView('calendario');
        navInvalidateView('metricas');
      }

      // 3. Procesar cierre de sesión y recálculo de progreso
      if (sesionId) {
        const { academicService } = await import('../../modules/academic-routes/services/academicService.js');
        const { createAchievementsSummaryModal } = await import('../components/AchievementsSummaryModal.js');
        
        // Ejecutar recálculos (Motor de Reglas)
        const achievements = await academicService.processSessionClosure(sesionId);
        
        // 4. Mostrar feedback de logros si existen
        if (achievements && achievements.length > 0) {
          btn.textContent = '¡Logros detectados!';
          btn.style.background = 'var(--apple-success)';
          await createAchievementsSummaryModal(container, achievements);
        }
      }

      btn.textContent = '✓ Guardado';
      btn.style.background = 'var(--apple-success)';

      // 5. Mostrar pantalla de éxito (overlay sólido sobre todo el contenido)
      const overlay = document.createElement('div');
      overlay.className = 'pm-saved-overlay';
      overlay.innerHTML = `
        <div class="pm-saved-options">
          <div class="pm-saved-header">
            <div class="pm-saved-check-anim">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <h3>Sesión Guardada</h3>
            <p>¿Qué deseas hacer ahora?</p>
          </div>
          <div class="pm-saved-actions">
            <button class="pm-btn pm-btn-secondary" id="btn-editar-asistencia">
              <i class="bi bi-pencil"></i> Editar Asistencia
            </button>
            <button class="pm-btn pm-btn-outline" id="btn-compartir-correo">
              <i class="bi bi-envelope"></i> Compartir por Correo
            </button>
            <button class="pm-btn pm-btn-success" id="btn-compartir-whatsapp">
              <i class="bi bi-whatsapp"></i> Compartir por WhatsApp
            </button>
          </div>
          <div class="pm-saved-nav">
            <button class="pm-saved-nav-btn" id="btn-volver-hoy" title="Volver a Hoy">
              <i class="bi bi-arrow-left-circle"></i>
            </button>
            <button class="pm-saved-nav-btn" id="btn-ir-calendario" title="Ir al Calendario">
              <i class="bi bi-calendar3"></i>
            </button>
          </div>
        </div>
      `;
      container.querySelector('.pm-asist-root').appendChild(overlay);

      // Estilos del overlay
      if (!document.getElementById('pm-saved-styles')) {
        const savedStyle = document.createElement('style');
        savedStyle.id = 'pm-saved-styles';
        savedStyle.textContent = `
          .pm-saved-overlay {
            position: absolute;
            inset: 0;
            background: var(--pm-bg, #0f1923);
            z-index: 50;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pmSavedFadeIn 0.35s ease;
          }
          .pm-saved-options { text-align: center; padding: 2rem 1.5rem; width: 100%; max-width: 380px; }
          .pm-saved-header { margin-bottom: 2rem; }
          .pm-saved-check-anim i {
            font-size: 3rem;
            color: var(--pm-success, #22c55e);
            animation: pmSavedPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .pm-saved-header h3 { margin: 1rem 0 0.5rem; font-size: 1.5rem; font-weight: 700; }
          .pm-saved-header p { color: var(--pm-text-muted); margin: 0; font-size: 0.95rem; }
          .pm-saved-actions { display: flex; flex-direction: column; gap: 0.75rem; margin: 0 auto 2rem; }
          .pm-saved-nav {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid var(--pm-border, rgba(255,255,255,0.08));
          }
          .pm-saved-nav-btn {
            background: none;
            border: none;
            color: var(--pm-text-muted, #888);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.75rem;
            border-radius: 50%;
            transition: all 0.2s ease;
          }
          .pm-saved-nav-btn:hover {
            color: var(--pm-primary, #007aff);
            background: rgba(0, 122, 255, 0.08);
            transform: scale(1.1);
          }
          @keyframes pmSavedFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes pmSavedPop { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        `;
        document.head.appendChild(savedStyle);
      }

      // Attach event listeners
      const editarBtn = overlay.querySelector('#btn-editar-asistencia');
      const correoBtn = overlay.querySelector('#btn-compartir-correo');
      const whatsBtn = overlay.querySelector('#btn-compartir-whatsapp');
      const volverHoyBtn = overlay.querySelector('#btn-volver-hoy');
      const calBtn = overlay.querySelector('#btn-ir-calendario');

      if (editarBtn) editarBtn.onclick = () => {
        overlay.remove();
        btn.textContent = 'Guardar sesión';
        btn.style.background = '';
        btn.disabled = false;
        btn.style.display = '';
      };

      if (correoBtn) correoBtn.onclick = async () => {
        const asistenciaData = alumnos.filter(a => estado[a.id]).map(a => ({
          alumno_id: a.id, estado: estado[a.id]
        }));
        const subject = encodeURIComponent(`Reporte de Clase - ${clase.nombre} - ${fechaHoy}`);
        const body = encodeURIComponent(_generarReporteTexto(asistenciaData, dslContent, alumnos, clase));
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
      };

      if (whatsBtn) whatsBtn.onclick = async () => {
        const asistenciaData = alumnos.filter(a => estado[a.id]).map(a => ({
          alumno_id: a.id, estado: estado[a.id]
        }));
        const text = encodeURIComponent(_generarReporteTexto(asistenciaData, dslContent, alumnos, clase));
        window.open(`https://wa.me/?text=${text}`, '_blank');
      };

      if (volverHoyBtn) volverHoyBtn.onclick = () => {
        window.location.hash = '#/hoy';
      };

      if (calBtn) calBtn.onclick = () => {
        window.location.hash = '#/calendario';
      };

    } catch (err) {
      console.error('Error al guardar sesión:', err);
      btn.textContent = err.message || 'Error al guardar';
      btn.style.background = 'var(--pm-danger)';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = originalText; btn.style.background = ''; }, 3000);
    }
  };

  // === Helper functions (definidas aquí para evitar TDZ con let) ===
  function _resetFooter(container, originalBtn) {
    const footer = container.querySelector('.pm-asist-footer');
    footer.innerHTML = `
      <button class="pm-btn pm-btn-primary" id="btn-guardar" style="width:100%; font-weight:700;">
        Guardar sesión
      </button>
    `;
    footer.querySelector('#btn-guardar').onclick = originalBtn.onclick;
    container.querySelector('#btn-guardar').style.display = '';
    container.querySelector('#btn-guardar').textContent = 'Guardar sesión';
    container.querySelector('#btn-guardar').style.background = '';
  }

  function _generarReporteTexto(asistencia, contenido, alumnos, clase) {
    const presentes = asistencia.filter(a => a.estado === 'P').length;
    const ausentes = asistencia.filter(a => a.estado === 'A').length;
    const justificados = asistencia.filter(a => a.estado === 'J').length;
    
    let texto = `Reporte de Clase - ${clase.nombre}\n`;
    texto += `Fecha: ${fechaHoy}\n`;
    texto += `Instrumento: ${clase.instrumento || 'N/A'}\n\n`;
    texto += `RESUMEN DE ASISTENCIA\n`;
    texto += `Presentes: ${presentes} | Ausentes: ${ausentes} | Justificados: ${justificados}\n\n`;
    
    if (contenido && contenido.trim()) {
      texto += `CONTENIDO DE LA CLASE:\n${contenido}\n\n`;
    }
    
    texto += `DETALLE DE ALUMNOS:\n`;
    asistencia.forEach(a => {
      const alum = alumnos.find(al => al.id === a.alumno_id);
      const nombre = alum?.nombre_completo || 'Alumno';
      const estadoTexto = a.estado === 'P' ? 'Presente' : a.estado === 'A' ? 'Ausente' : 'Justificado';
      texto += `- ${nombre}: ${estadoTexto}\n`;
    });
    
    return texto;
  }

  container.querySelector('#pm-asist-back').onclick = () => {
    _cleanups.forEach(fn => { try { fn() } catch (_) {} })
    window.location.hash = '#/hoy'
  };



  // === Bulk Actions Logic ===
  container.querySelector('#btn-bulk-p').onclick = async () => {
    alumnos.forEach(a => { estado[a.id] = 'P'; });
    renderLista();
    _updateProgress();
    await _autoSave(true);
  };

  container.querySelector('#btn-bulk-a').onclick = async () => {
    alumnos.forEach(a => { estado[a.id] = 'A'; });
    renderLista();
    _updateProgress();
    await _autoSave(true);
  };

  renderLista();
}

function _sortAlumnos(alumnos, estado) {
  return [...alumnos].sort((a, b) => {
    const aM = estado[a.id] !== null;
    const bM = estado[b.id] !== null;
    if (!aM && bM) return -1;
    if (aM && !bM) return 1;
    return 0;
  });
}
