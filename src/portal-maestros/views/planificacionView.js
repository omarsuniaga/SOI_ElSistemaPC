import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML } from '../utils/portalUtils.js'
import { renderRouteConfigurator } from './components/routeConfigurator.js'
import { RouteConfigAdapter } from '../services/routeConfigAdapter.js'
import { AppModal } from '../../shared/components/AppModal.js'

export async function renderPlanificacionView(container) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  try {
    // 1. Obtener clases de PLANIFICACIÓN (plan_clases)
    const planningClasses = await RouteConfigAdapter.getClasses(maestro.id)

    // 2. Obtener clases de SESIÓN (para documentos y piloto automático)
    const { data: clases } = await supabase
      .from('clases')
      .select('id, nombre, instrumento')
      .or(`maestro_principal_id.eq.${maestro.id},maestro_suplente_id.eq.${maestro.id},maestro_id.eq.${maestro.id}`)
      .order('nombre')

    // 3. Función para renderizar la jerarquía HTML
    const getHierarchyHtml = async (classId = null) => {
      if (!classId) return '<p class="pm-empty">Seleccioná una clase para ver su ruta académica.</p>'

      const levels = await RouteConfigAdapter.getRouteHierarchy(classId, maestro.id)

      if (!levels || levels.length === 0) {
        return '<p class="pm-empty">Esta clase aún no tiene una ruta configurada.</p>'
      }

      const getNodeIcon = (type) => {
        const icons = {
          'ESCALA': '🎼', 'ARPEGIO': '🎹', 'MANO_IZQ': '✋',
          'ARCO': '🎻', 'SONIDO': '🔊', 'AFINACION': '🎵',
          'TECNICA': '⚙️', 'REPERTORIO': '📖'
        }
        return icons[type] || '•'
      }

      const getNodeColor = (isCritical) => isCritical ? 'var(--pm-danger)' : 'var(--pm-primary)'

      return `
        <div class="pm-route-niveles">
          ${levels.map(level => `
            <div class="pm-route-nivel expanded">
              <div class="pm-nivel-toggle" data-level="${level.id}">
                <div class="pm-nivel-num">${level.numero_nivel}</div>
                <div class="pm-nivel-info">
                  <span class="pm-nivel-name">${escHTML(level.nombre)}</span>
                  <span class="pm-nivel-obj">${escHTML(level.objetivo_general || 'Objetivo no especificado')}</span>
                </div>
                <i class="bi bi-chevron-down pm-nivel-arrow"></i>
              </div>
              <div class="pm-nivel-nodos">
                ${(level.plan_temas || []).map(tema => `
                  <div class="pm-nodo-card ${tema.es_critico ? 'critical' : ''}">
                    <div class="pm-nodo-icon" style="color: ${getNodeColor(tema.es_critico)}">${getNodeIcon(tema.tipo)}</div>
                    <div class="pm-nodo-info">
                      <span class="pm-nodo-name">${escHTML(tema.nombre)}</span>
                      <span class="pm-nodo-type">${tema.tipo}</span>
                      ${tema.es_critico ? '<span class="pm-nodo-critical">CRÍTICO</span>' : ''}
                      
                      <div style="font-size:0.6rem; color:var(--pm-text-muted); margin-top:4px;">
                        ${(tema.plan_objetivos || []).length} objetivos definidos
                      </div>
                    </div>
                  </div>
                `).join('')}
                ${(level.plan_temas || []).length === 0 ? '<p style="font-size:0.7rem; color:var(--pm-text-muted); padding:10px;">Sin temas configurados.</p>' : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `
    }

    container.innerHTML = `
      <div class="pm-planif-root">
        <h2 class="pm-planif-title">
          <i class="bi bi-signpost-split"></i> Ruta Académica por Nodos
        </h2>
        <p class="pm-planif-subtitle">Estructura curricular progresiva - El alumno avanza por dominio</p>

        <!-- Pestañas -->
        <div class="pm-tabs-nav">
          <button class="pm-tab-btn active" data-tab="tab-visualizador">
            <i class="bi bi-eye"></i> Visualizador (Ruta)
          </button>
          <button class="pm-tab-btn" data-tab="tab-configurador">
            <i class="bi bi-gear"></i> Configurar Planificación
          </button>
        </div>

        <!-- PESTAÑA 1: VISUALIZADOR -->
        <div id="tab-visualizador" class="pm-tab-pane active">
          <!-- Selector de clase de PLANIFICACIÓN -->
          <div class="pm-planif-selector">
            <label class="pm-planif-label">Ruta de:</label>
            <select id="pm-planif-clase-select" class="pm-input">
              <option value="">Seleccionar planificación...</option>
              ${planningClasses?.map(c => `<option value="${c.id}">${escHTML(c.nombre || c.name || 'Sin nombre')}</option>`).join('') || ''}
            </select>
          </div>

          <!-- Ruta Académica -->
          <h3 class="pm-planif-section-title">
            <i class="bi bi-signpost-split"></i> Estructura de la Ruta
          </h3>
          <div id="pm-route-container" class="pm-route-container">
            <p class="pm-empty">Seleccioná una planificación arriba.</p>
          </div>

          <!-- Leyenda -->
          <div class="pm-route-leyenda">
            <div class="pm-leyenda-item"><span class="pm-leyenda-icon" style="background: var(--pm-primary-light);">🎼</span><span>Escalas</span></div>
            <div class="pm-leyenda-item"><span class="pm-leyenda-icon" style="background: var(--pm-primary-light);">🎹</span><span>Arpegios</span></div>
            <div class="pm-leyenda-item"><span class="pm-leyenda-icon" style="background: var(--pm-danger-light);">🔊</span><span>Sonido (Crítico)</span></div>
            <div class="pm-leyenda-item"><span class="pm-leyenda-icon" style="background: var(--pm-danger-light);">🎵</span><span>Afinación (Crítico)</span></div>
          </div>
        </div>

        <!-- PESTAÑA 2: CONFIGURADOR CRUD -->
        <div id="tab-configurador" class="pm-tab-pane" style="display:none;">
          <div class="pm-config-header-panel">
            <div class="pm-config-scope">
              <div class="pm-config-actions">
                <input type="file" id="pm-import-file" style="display:none" accept=".pdf,.docx,.md,.txt,.jpg,.jpeg,.png" />
                <button id="pm-btn-import-ia" class="pm-btn pm-btn-outline-primary" style="padding: 0.8rem 1.5rem; font-size: 1.1rem; border-width:2px;">
                  <i class="bi bi-stars"></i> Importar Nueva Planificación con IA
                </button>
                
                <div id="pm-import-status" class="pm-import-status" style="display:none;">
                  <div class="pm-spinner" style="width:16px; height:16px;"></div>
                  <span id="pm-import-status-text">Procesando documento con IA...</span>
                </div>
              </div>
            </div>
          </div>
          
          <div id="pm-route-config-root"></div>
        </div>
      </div>

      <style>
        .pm-tabs-nav { display:flex; gap:0.5rem; margin-bottom:1.5rem; border-bottom:1px solid var(--pm-border); padding-bottom:0; }
        .pm-tab-btn { background:none; border:none; border-bottom:3px solid transparent; padding:0.75rem 1rem; cursor:pointer; font-weight:600; color:var(--pm-text-muted); transition:all 0.2s; display:flex; align-items:center; gap:0.5rem; font-size:0.95rem; }
        .pm-tab-btn:hover { color:var(--pm-primary); }
        .pm-tab-btn.active { color:var(--pm-primary); border-bottom-color:var(--pm-primary); background:var(--pm-primary-light); border-top-left-radius:8px; border-top-right-radius:8px; }
        .pm-tab-pane { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        .pm-config-header-panel { background: var(--pm-surface-2); padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid var(--pm-border); }
        .pm-config-actions { display: flex; gap: 0.5rem; align-items: center; }
        .pm-import-status { display: flex; align-items: center; gap: 0.75rem; color: var(--pm-primary); font-size: 0.85rem; font-weight: 600; }
        .pm-btn-outline-primary { background: transparent; border: 2px solid var(--pm-primary); color: var(--pm-primary); border-radius: 8px; padding: 0.6rem 1.2rem; cursor: pointer; transition: all 0.2s; font-weight: 600; }
        .pm-btn-outline-primary:hover { background: var(--pm-primary); color: white; }

        .pm-route-nivel { margin-bottom: 0.75rem; border: 1px solid var(--pm-border); border-radius: 10px; overflow: hidden; background: var(--pm-surface); }
        .pm-nivel-toggle { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; cursor: pointer; }
        .pm-nivel-num { width: 32px; height: 32px; background: var(--pm-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
        .pm-nivel-name { font-weight: 600; font-size: 0.95rem; }
        .pm-nivel-obj { display: block; font-size: 0.75rem; color: var(--pm-text-muted); }
        .pm-nivel-nodos { display: none; padding: 0.75rem; background: var(--pm-surface-2); gap: 0.5rem; flex-wrap: wrap; }
        .pm-route-nivel.expanded .pm-nivel-nodos { display: flex; }
        .pm-nodo-card { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--pm-surface); border-radius: 8px; border: 1px solid var(--pm-border); min-width: 140px; }
        .pm-nodo-card.critical { border-color: var(--pm-danger); background: var(--pm-danger-light); color: var(--pm-danger-dark); }
        .pm-route-leyenda { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--pm-border); }
        .pm-leyenda-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--pm-text-muted); }
        .pm-leyenda-icon { width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }
      </style>
    `

    // Listener para el selector de clases
    const routeSelect = container.querySelector('#pm-planif-clase-select')
    const routeContainer = container.querySelector('#pm-route-container')

    if (routeSelect && routeContainer) {
      routeSelect.onchange = async () => {
        routeContainer.innerHTML = '<div class="pm-loading"><div class="pm-spinner"></div></div>'
        const html = await getHierarchyHtml(routeSelect.value)
        routeContainer.innerHTML = html

        // Re-vincular toggles
        routeContainer.querySelectorAll('.pm-nivel-toggle').forEach(toggle => {
          toggle.onclick = () => {
            const nivel = toggle.closest('.pm-route-nivel')
            nivel.classList.toggle('expanded')
          }
        })
      }
    }

    // Tabs toggle logic
    const tabBtns = container.querySelectorAll('.pm-tab-btn')
    const tabPanes = container.querySelectorAll('.pm-tab-pane')

    tabBtns.forEach(btn => {
      btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'))
        tabPanes.forEach(p => { p.classList.remove('active'); p.style.display = 'none'; })
        btn.classList.add('active')
        const targetId = btn.getAttribute('data-tab')
        const targetPane = container.querySelector(`#${targetId}`)
        if (targetPane) { targetPane.classList.add('active'); targetPane.style.display = 'block'; }
      }
    })

    // === PILOTO AUTOMÁTICO ===
    const activeClaseId = localStorage.getItem('pm_active_clase_id')
    let initialClassId = null

    if (activeClaseId) {
      const activeClase = clases?.find(c => c.id === activeClaseId)
      if (activeClase) {
        const match = planningClasses.find(c =>
          activeClase.nombre.toLowerCase().includes(c.nombre.toLowerCase()) ||
          c.nombre.toLowerCase().includes(activeClase.nombre.toLowerCase())
        )
        if (match) initialClassId = match.id
      }
    }

    if (!initialClassId && planningClasses && planningClasses.length > 0) {
      initialClassId = planningClasses[0].id
    }

    if (initialClassId && routeSelect && routeContainer) {
      routeSelect.value = initialClassId
      routeContainer.innerHTML = '<div class="pm-loading"><div class="pm-spinner"></div></div>'
      getHierarchyHtml(initialClassId).then(html => {
        routeContainer.innerHTML = html
        routeContainer.querySelectorAll('.pm-nivel-toggle').forEach(toggle => {
          toggle.onclick = () => {
            const nivel = toggle.closest('.pm-route-nivel')
            nivel.classList.toggle('expanded')
          }
        })
      })
    }

    // Renderizar configurador
    const configRoot = container.querySelector('#pm-route-config-root')
    if (configRoot) {
      renderRouteConfigurator(configRoot, initialClassId)
    }

    // === LÓGICA DE IMPORTACIÓN CON IA ===
    const importBtn = container.querySelector('#pm-btn-import-ia')
    const importFileInput = container.querySelector('#pm-import-file')
    const importStatus = container.querySelector('#pm-import-status')
    const importStatusText = container.querySelector('#pm-import-status-text')

    if (importBtn && importFileInput) {
      importBtn.onclick = () => importFileInput.click()

      importFileInput.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        importBtn.disabled = true
        importStatus.style.display = 'flex'
        importStatusText.textContent = 'Iniciando... 0%'

        try {
          const { parsePlanningFile } = await import('../services/planningParserService.js')
          const { AppModal } = await import('../../shared/components/AppModal.js')

          const structure = await parsePlanningFile(file, (percent) => {
            importStatusText.textContent = `Analizando... ${percent}%`
          })

          importStatusText.textContent = 'Estructurando con IA...'
          const currentPlanningClasses = await RouteConfigAdapter.getClasses(maestro.id)
          const previewHtml = generateImportPreview(structure, currentPlanningClasses || [])

          AppModal.open({
            title: 'Previsualización de Importación IA',
            size: 'lg',
            saveText: 'Confirmar e Importar',
            body: previewHtml,
            onSave: async (modalBody) => {
              try {
                const classSelector = modalBody.querySelector('#preview-class-selector')
                const selectedClassId = classSelector.value
                let finalClassId = selectedClassId

                if (selectedClassId === 'NEW') {
                  const className = modalBody.querySelector('#preview-class-name').value.trim()
                  if (!className) { alert('Asigná un nombre.'); return false; }
                  importStatusText.textContent = 'Creando clase...'
                  const newClass = await RouteConfigAdapter.addClass(className, maestro.id)
                  finalClassId = newClass.id
                }

                // Recolectar ediciones
                const nivelInputs = modalBody.querySelectorAll('.preview-nivel-input')
                nivelInputs.forEach(input => { structure.niveles[input.dataset.nIdx].nombre = input.value })
                const temaInputs = modalBody.querySelectorAll('.preview-tema-input')
                temaInputs.forEach(input => { structure.niveles[input.dataset.nIdx].temas[input.dataset.tIdx].nombre = input.value })
                const objInputs = modalBody.querySelectorAll('.preview-obj-input')
                objInputs.forEach(input => { structure.niveles[input.dataset.nIdx].temas[input.dataset.tIdx].objetivos[input.dataset.oIdx].nombre = input.value })

                importStatusText.textContent = 'Importando...'
                await RouteConfigAdapter.importStructure(finalClassId, structure)
                
                AppModal.open({
                  title: '¡Éxito!',
                  body: '<p>La planificación ha sido importada correctamente.</p>',
                  confirmText: 'Genial',
                  hideCancel: true
                });

                renderPlanificacionView(container)
                return true 
              } catch (err) {
                AppModal.open({
                  title: 'Error de Importación',
                  body: `<p>No se pudo importar la planificación: ${err.message}</p>`,
                  confirmText: 'Cerrar',
                  hideCancel: true
                });
                return false
              }
            },
            onCancel: () => {
              importStatus.style.display = 'none'
              importBtn.disabled = false
            }
          })
        } catch (err) {
          AppModal.open({
            title: 'Error inesperado',
            body: `<p>${err.message}</p>`,
            confirmText: 'Cerrar',
            hideCancel: true
          });
        } finally {
          importBtn.disabled = false
          importStatus.style.display = 'none'
          importFileInput.value = ''
        }
      }
    }

  } catch (err) {
    container.innerHTML = `<p class="pm-empty">Error: ${err.message}</p>`
  }

  return () => {
    console.log('[PlanificacionView] Cleanup ejecutado');
  }
}

function generateImportPreview(structure, clasesExistentes = []) {
  const niveles = structure.niveles || []
  let totalTemas = 0, totalObjs = 0
  niveles.forEach(n => {
    totalTemas += (n.temas || []).length
    n.temas?.forEach(t => totalObjs += (t.objetivos || []).length)
  })

  return `
    <div class="pm-import-preview">
      <div style="margin-bottom:1.5rem; padding:1rem; background:var(--pm-surface-2); border-radius:12px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:10px;">¿DÓNDE IMPORTAR?</label>
        <select id="preview-class-selector" class="pm-input" onchange="document.getElementById('new-class-name-wrapper').style.display = (this.value === 'NEW' ? 'block' : 'none')">
          <option value="NEW">-- [ + ] CREAR NUEVA CLASE --</option>
          ${clasesExistentes.map(c => `<option value="${c.id}">Añadir a: ${escHTML(c.nombre || c.name)}</option>`).join('')}
        </select>
        <div id="new-class-name-wrapper" style="display:block; padding-top:0.5rem;">
          <input type="text" id="preview-class-name" class="pm-input" placeholder="Nombre de la nueva clase..." />
        </div>
      </div>

      <div style="display:flex; gap:1rem; margin-bottom:1rem; padding:1rem; background:var(--pm-surface-2); border-radius:8px; text-align:center;">
        <div style="flex:1;"><b>${niveles.length}</b><br><small>NIVELES</small></div>
        <div style="flex:1; border-left:1px solid var(--pm-border);"><b>${totalTemas}</b><br><small>TEMAS</small></div>
        <div style="flex:1; border-left:1px solid var(--pm-border);"><b>${totalObjs}</b><br><small>OBJETIVOS</small></div>
      </div>

      <div style="max-height:400px; overflow-y:auto;">
        ${niveles.map((n, nIdx) => `
          <div style="margin-bottom:1rem; border:1px solid var(--pm-border); border-radius:8px;">
            <div style="background:var(--pm-surface-2); padding:0.5rem; display:flex; gap:0.5rem;">
              <input type="text" class="preview-nivel-input pm-input" value="${escHTML(n.nombre)}" data-n-idx="${nIdx}" />
            </div>
            <div style="padding:0.5rem;">
              ${(n.temas || []).map((t, tIdx) => `
                <div style="margin-bottom:0.5rem; padding-left:0.5rem; border-left:2px solid var(--pm-primary);">
                  <input type="text" class="preview-tema-input pm-input" value="${escHTML(t.nombre)}" data-n-idx="${nIdx}" data-t-idx="${tIdx}" style="font-size:0.8rem;" />
                  ${(t.objetivos || []).map((o, oIdx) => `
                    <input type="text" class="preview-obj-input pm-input" value="${escHTML(o.nombre)}" data-n-idx="${nIdx}" data-t-idx="${tIdx}" data-o-idx="${oIdx}" style="font-size:0.75rem; margin-top:2px;" />
                  `).join('')}
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}