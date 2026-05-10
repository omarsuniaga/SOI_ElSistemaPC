import { supabase } from '../../lib/supabaseClient.js'
import { getMaestroLocal } from '../auth/maestroAuth.js'
import { escHTML } from '../utils/portalUtils.js'
import { uploadPlanningDoc, getDocuments, deleteDocument, formatFileSize } from '../services/planningDocService.js'
import { renderRouteConfigurator } from './components/routeConfigurator.js'
import { RouteConfigAdapter } from '../services/routeConfigAdapter.js'

export async function renderPlanificacionView(container) {
  container.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div></div>`

  const maestro = getMaestroLocal()
  if (!maestro) {
    container.innerHTML = `<p class="pm-empty">No hay sesión activa.</p>`
    return
  }

  try {
    // Obtener clases del maestro
    const { data: clases } = await supabase
      .from('clases')
      .select('id, nombre, instrumento')
      .eq('maestro_id', maestro.id)
      .order('nombre')

    // === RUTA ACADÉMICA (Modo Abstracción / Mock First) ===
    let routeHtml = '<p class="pm-empty">No hay rutas académicas disponibles.</p>'
    
    // Traemos la jerarquía desde el Adaptador en lugar de Supabase directo
    const hierarchy = await RouteConfigAdapter.getRouteHierarchy()
    
    if (hierarchy && hierarchy.levels && hierarchy.levels.length > 0) {
      const { route, version, levels, nodesPorNivel, sampleIndicators } = hierarchy
        
        // Renderizar estructura
        const getNodeIcon = (type) => {
          const icons = {
            'ESCALA': '🎼', 'ARPEGIO': '🎹', 'MANO_IZQ': '✋',
            'ARCO': '🎻', 'SONIDO': '🔊', 'AFINACION': '🎵',
            'TECNICA': '⚙️', 'REPERTORIO': '📖'
          }
          return icons[type] || '•'
        }
        
        const getNodeColor = (isCritical) => isCritical ? 'var(--pm-danger)' : 'var(--pm-primary)'
        
        routeHtml = `
          <div class="pm-route-header">
            <div class="pm-route-badge">${route.instrument?.toUpperCase()}</div>
            <div class="pm-route-info">
              <h4>${escHTML(route.name)}</h4>
              <p>${escHTML(route.description || '')}</p>
              <span class="pm-route-version">Versión ${version.version}</span>
            </div>
          </div>
          
          <div class="pm-route-niveles">
            ${(levels || []).map(level => `
              <div class="pm-route-nivel">
                <div class="pm-nivel-toggle" data-level="${level.id}">
                  <div class="pm-nivel-num">${level.level_number}</div>
                  <div class="pm-nivel-info">
                    <span class="pm-nivel-name">${escHTML(level.name)}</span>
                    <span class="pm-nivel-obj">${escHTML(level.main_objective || '')}</span>
                  </div>
                  <i class="bi bi-chevron-down pm-nivel-arrow"></i>
                </div>
                <div class="pm-nivel-nodos">
                  ${(nodesPorNivel[level.id] || []).map(nodo => `
                    <div class="pm-nodo-card ${nodo.is_critical ? 'critical' : ''}">
                      <div class="pm-nodo-icon" style="color: ${getNodeColor(nodo.is_critical)}">${getNodeIcon(nodo.type)}</div>
                      <div class="pm-nodo-info">
                        <span class="pm-nodo-name">${escHTML(nodo.name)}</span>
                        <span class="pm-nodo-type">${nodo.type}</span>
                        ${nodo.is_critical ? '<span class="pm-nodo-critical">CRÍTICO</span>' : ''}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
          
          ${sampleIndicators && sampleIndicators.length > 0 ? `
            <div class="pm-route-indicadores">
              <h4 class="pm-section-subtitle">
                <i class="bi bi-list-check"></i> Indicadores de Ejemplo
              </h4>
              <div class="pm-indicadores-list">
                ${sampleIndicators.map(ind => `
                  <div class="pm-indicador-item">
                    <span class="pm-ind-desc">${escHTML(ind.description)}</span>
                    ${ind.is_required ? '<span class="pm-ind-req">Requerido</span>' : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
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
          <!-- Selector de clase -->
          <div class="pm-planif-selector">
            <label class="pm-planif-label">Ver avance de clase:</label>
            <select id="pm-planif-clase-select" class="pm-input">
              <option value="">Seleccionar clase...</option>
              ${clases?.map(c => `<option value="${c.id}">${escHTML(c.nombre)}</option>`).join('') || ''}
            </select>
          </div>

          <!-- Ruta Académica -->
          <h3 class="pm-planif-section-title">
            <i class="bi bi-signpost-split"></i> Contenido de la Ruta
          </h3>
          <div class="pm-route-container">
            ${routeHtml}
          </div>

          <!-- Leyenda -->
          <div class="pm-route-leyenda">
            <div class="pm-leyenda-item">
              <span class="pm-leyenda-icon" style="background: var(--pm-primary-light);">🎼</span>
              <span>Escalas</span>
            </div>
            <div class="pm-leyenda-item">
              <span class="pm-leyenda-icon" style="background: var(--pm-primary-light);">🎹</span>
              <span>Arpegios</span>
            </div>
            <div class="pm-leyenda-item">
              <span class="pm-leyenda-icon" style="background: var(--pm-danger-light);">🔊</span>
              <span>Sonido (Crítico)</span>
            </div>
            <div class="pm-leyenda-item">
              <span class="pm-leyenda-icon" style="background: var(--pm-danger-light);">🎵</span>
              <span>Afinación (Crítico)</span>
            </div>
          </div>

          <!-- Documentos de Planificación -->
          <h3 class="pm-planif-section-title" style="margin-top:2rem;">
            <i class="bi bi-file-earmark-arrow-up"></i> Documentos de Apoyo
          </h3>

          <div class="pm-docs-upload-card">
            <div class="pm-docs-upload-fields">
              <input type="text" id="pm-docs-title" class="pm-input" placeholder="Título del documento *" />
              <select id="pm-docs-clase" class="pm-input">
                <option value="">Clase (opcional)</option>
                ${clases?.map(c => `<option value="${c.id}">${escHTML(c.nombre)}</option>`).join('') || ''}
              </select>
              <textarea id="pm-docs-desc" class="pm-input" placeholder="Descripción (opcional)" rows="2"></textarea>
              <input type="file" id="pm-docs-file" class="pm-input" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx" />
              <p id="pm-docs-size-warn" class="pm-docs-warn" style="display:none;">El archivo supera 10 MB y podría fallar al subir.</p>
              <button id="pm-docs-upload-btn" class="pm-btn pm-btn-primary">Subir Documento</button>
            </div>
          </div>

          <div id="pm-docs-list" class="pm-docs-grid">
            <div class="pm-loading"><div class="pm-spinner"></div></div>
          </div>
        </div>

        <!-- PESTAÑA 2: CONFIGURADOR CRUD -->
        <div id="tab-configurador" class="pm-tab-pane" style="display:none;">
          <div class="pm-config-header" style="margin-bottom: 1rem;">
            <h3 class="pm-planif-section-title">
              <i class="bi bi-sliders"></i> Editor de la Ruta (CRUD)
            </h3>
            <p style="font-size:0.85rem;color:var(--pm-text-muted);margin-top:-0.5rem;margin-bottom:0;">
              Construí la planificación: visualizá los Niveles, Temas (Nodos) y Objetivos (Indicadores) cargados desde el Mock.
            </p>
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

        .pm-route-container { margin-bottom: 1.5rem; }
        .pm-route-header { display: flex; gap: 1rem; padding: 1rem; background: var(--pm-surface-2); border-radius: 12px; margin-bottom: 1rem; }
        .pm-route-badge { background: var(--pm-primary); color: white; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.8rem; height: fit-content; }
        .pm-route-info h4 { margin: 0 0 0.25rem 0; font-size: 1.1rem; }
        .pm-route-info p { margin: 0; font-size: 0.85rem; color: var(--pm-text-muted); }
        .pm-route-version { display: inline-block; margin-top: 0.5rem; font-size: 0.75rem; color: var(--pm-primary); font-weight: 600; }
        
        .pm-route-nivel { margin-bottom: 0.75rem; border: 1px solid var(--pm-border); border-radius: 10px; overflow: hidden; }
        .pm-nivel-toggle { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: var(--pm-surface); color: var(--pm-text); cursor: pointer; transition: background 0.2s; }
        .pm-nivel-toggle:hover { background: var(--pm-surface-2); }
        .pm-nivel-num { width: 36px; height: 36px; background: var(--pm-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
        .pm-nivel-info { flex: 1; }
        .pm-nivel-name { display: block; font-weight: 600; font-size: 0.95rem; color: inherit; }
        .pm-nivel-obj { display: block; font-size: 0.75rem; color: var(--pm-text-muted); }
        .pm-nivel-arrow { transition: transform 0.2s; color: var(--pm-text-muted); }
        .pm-route-nivel.expanded .pm-nivel-arrow { transform: rotate(180deg); }
        
        .pm-nivel-nodos { display: none; padding: 0.75rem; background: var(--pm-surface-2); gap: 0.5rem; flex-wrap: wrap; }
        .pm-route-nivel.expanded .pm-nivel-nodos { display: flex; }
        
        .pm-nodo-card { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--pm-surface); color: var(--pm-text); border-radius: 8px; border: 1px solid var(--pm-border); min-width: 140px; }
        .pm-nodo-card.critical { border-color: var(--pm-danger); background: var(--pm-danger-light, #fff5f5); color: var(--pm-danger-dark, #c53030); }
        .pm-nodo-icon { font-size: 1.2rem; }
        .pm-nodo-info { flex: 1; min-width: 0; }
        .pm-nodo-name { display: block; font-size: 0.8rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pm-nodo-type { display: block; font-size: 0.65rem; color: var(--pm-text-muted); text-transform: uppercase; }
        .pm-nodo-critical { display: block; font-size: 0.6rem; color: var(--pm-danger); font-weight: 700; margin-top: 2px; }
        
        .pm-route-indicadores { margin-top: 1.5rem; }
        .pm-section-subtitle { font-size: 0.9rem; color: var(--pm-text-muted); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
        .pm-indicadores-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .pm-indicador-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.75rem; background: var(--pm-surface); color: var(--pm-text); border-radius: 6px; font-size: 0.85rem; }
        .pm-ind-req { font-size: 0.7rem; background: var(--pm-primary-light); color: var(--pm-primary); padding: 2px 6px; border-radius: 4px; }
        
        .pm-route-leyenda { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--pm-border); }
        .pm-leyenda-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--pm-text-muted); }
        .pm-leyenda-icon { width: 24px; height: 24px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }

        .pm-docs-upload-card { background: var(--pm-surface-2); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem; }
        .pm-docs-upload-fields { display: flex; flex-direction: column; gap: 0.75rem; }
        .pm-docs-warn { color: var(--pm-danger); font-size: 0.8rem; margin: 0; }
        .pm-docs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
        .pm-docs-card { background: var(--pm-surface); color: var(--pm-text); border: 1px solid var(--pm-border); border-radius: 10px; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .pm-docs-card-header { display: flex; align-items: center; gap: 0.75rem; }
        .pm-docs-icon { font-size: 1.5rem; }
        .pm-docs-card-title { font-weight: 600; font-size: 0.95rem; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pm-docs-card-meta { font-size: 0.75rem; color: var(--pm-text-muted); }
        .pm-docs-card-clase { font-size: 0.75rem; color: var(--pm-primary); }
        .pm-docs-card-actions { display: flex; gap: 0.5rem; margin-top: auto; }
        .pm-docs-card-actions .pm-btn { flex: 1; font-size: 0.8rem; padding: 0.4rem; }
        .pm-btn-danger { background: var(--pm-danger); color: white; border: none; border-radius: 6px; cursor: pointer; }
        .pm-btn-danger:hover { opacity: 0.85; }
        .pm-docs-empty { grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--pm-text-muted); font-size: 0.9rem; }
      </style>
    `

    // Toggle de niveles
    container.querySelectorAll('.pm-nivel-toggle').forEach(toggle => {
      toggle.onclick = () => {
        const nivel = toggle.closest('.pm-route-nivel')
        nivel.classList.toggle('expanded')
      }
    })

    // === DOCUMENTOS DE PLANIFICACIÓN ===
    const loadDocs = async () => {
      const list = container.querySelector('#pm-docs-list')
      if (!list) return
      try {
        const docs = await getDocuments(maestro.id)
        if (!docs || docs.length === 0) {
          list.innerHTML = '<div class="pm-docs-empty">No hay documentos subidos.</div>'
          return
        }
        list.innerHTML = docs.map(doc => {
          let path = ''
          if (doc.file_url && doc.file_url.includes('/documentos/')) {
             path = doc.file_url.split('/documentos/')[1]
          }
          return `
          <div class="pm-docs-card">
            <div class="pm-docs-card-header">
              <i class="bi bi-file-earmark-text pm-docs-icon"></i>
              <span class="pm-docs-card-title" title="${escHTML(doc.title)}">${escHTML(doc.title)}</span>
            </div>
            <div class="pm-docs-card-meta">
              ${doc.description ? `<span>${escHTML(doc.description)}</span><br>` : ''}
              <span>Tamaño: ${formatFileSize(doc.file_size)}</span>
            </div>
            ${doc.clases?.nombre ? `<div class="pm-docs-card-clase"><i class="bi bi-person-video3"></i> ${escHTML(doc.clases.nombre)}</div>` : ''}
            <div class="pm-docs-card-actions">
              <a href="${doc.file_url}" target="_blank" class="pm-btn pm-btn-primary">
                <i class="bi bi-download"></i>
              </a>
              <button class="pm-btn pm-btn-danger" data-id="${doc.id}" data-path="${path}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          `
        }).join('')
        
        list.querySelectorAll('.pm-btn-danger').forEach(btn => {
          btn.onclick = async () => {
            if (!confirm('¿Eliminar este documento?')) return
            btn.disabled = true
            btn.innerHTML = '<span class="pm-spinner" style="width:14px;height:14px;border-width:2px;border-top-color:transparent;"></span>'
            try {
              await deleteDocument(btn.dataset.id, btn.dataset.path)
              await loadDocs()
            } catch (err) {
              console.error(err)
              alert('Error al eliminar: ' + err.message)
              btn.disabled = false
              btn.innerHTML = '<i class="bi bi-trash"></i>'
            }
          }
        })
      } catch (err) {
        list.innerHTML = `<div class="pm-docs-empty" style="color:var(--pm-danger)">Error: ${escHTML(err.message)}</div>`
      }
    }

    await loadDocs()

    // Subir documento
    const uploadBtn = container.querySelector('#pm-docs-upload-btn')
    if (uploadBtn) {
      uploadBtn.onclick = async () => {
        const title = container.querySelector('#pm-docs-title').value.trim()
        const desc = container.querySelector('#pm-docs-desc').value.trim()
        const claseId = container.querySelector('#pm-docs-clase').value
        const fileInput = container.querySelector('#pm-docs-file')
        const file = fileInput.files[0]
        
        if (!title || !file) {
          alert('Título y archivo son obligatorios')
          return
        }
        
        uploadBtn.disabled = true
        const originalText = uploadBtn.innerHTML
        uploadBtn.innerHTML = '<div class="pm-spinner" style="width:16px;height:16px;border-width:2px;border-top-color:transparent;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Subiendo...'
        
        try {
          await uploadPlanningDoc({
            maestroId: maestro.id,
            claseId: claseId || null,
            title,
            description: desc,
            file
          })
          container.querySelector('#pm-docs-title').value = ''
          container.querySelector('#pm-docs-desc').value = ''
          container.querySelector('#pm-docs-clase').value = ''
          fileInput.value = ''
          await loadDocs()
        } catch (err) {
          console.error(err)
          alert('Error al subir: ' + err.message)
        } finally {
          uploadBtn.disabled = false
          uploadBtn.innerHTML = originalText
        }
      }
    }

    // Tabs toggle logic
    const tabBtns = container.querySelectorAll('.pm-tab-btn')
    const tabPanes = container.querySelectorAll('.pm-tab-pane')

    tabBtns.forEach(btn => {
      btn.onclick = () => {
        // Remove active class from all
        tabBtns.forEach(b => b.classList.remove('active'))
        tabPanes.forEach(p => {
          p.classList.remove('active')
          p.style.display = 'none'
        })
        
        // Add active class to clicked
        btn.classList.add('active')
        const targetId = btn.getAttribute('data-tab')
        const targetPane = container.querySelector(`#${targetId}`)
        if (targetPane) {
          targetPane.classList.add('active')
          targetPane.style.display = 'block'
        }
      }
    })

    // Renderizar configurador en la segunda pestaña
    const configRoot = container.querySelector('#pm-route-config-root')
    if (configRoot) {
      renderRouteConfigurator(configRoot)
    }

  } catch (err) {
    console.error('[Planificación] Error:', err)
    container.innerHTML = `
      <div class="pm-empty" style="padding:3rem 1rem;text-align:center;">
        <p style="color:var(--pm-danger);">Error al cargar planificación</p>
        <p style="font-size:0.85rem;color:var(--pm-text-muted);">${escHTML(err.message)}</p>
      </div>
    `
  }
}