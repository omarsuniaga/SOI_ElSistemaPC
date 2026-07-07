import { parsePlanningFile } from '../services/planningParserService.js'
import { enviarPropuesta } from '../services/proponerContenidoAdapter.js'

/**
 * Vista maestro — proponer contenido curricular (curriculo-tres-planos WU #7).
 *
 * Ruta: proponer-contenido
 *
 * Tab 1 (upload): sube un archivo, lo parsea vía planningParserService
 * (chunking + validación, WU #4) y guarda el resultado SOLO en memoria
 * (modo borrador — nunca auto-save).
 * Tab 2 (revisar): previsualiza el árbol Nivel->Tema->Objetivo->Indicador
 * y decide: [Proponer] (enviarPropuesta, WU #7 API), [Borrador] (se queda
 * en memoria, no persiste nada) o [Cancelar] (descarta y vuelve a subir).
 */
export function renderProponerContenidoView(container, { maestroId, claseId } = {}) {
  container.innerHTML = `
    <div class="pm-proponer-container">
      <div style="display:flex; gap:0; border-bottom:1px solid var(--pm-border);">
        <button type="button" class="pm-tab-btn active" data-tab="upload">Subir archivo</button>
        <button type="button" class="pm-tab-btn" data-tab="revisar">Revisar</button>
      </div>

      <div class="pm-tab-pane" data-pane="upload">
        <p class="apple-caption">Subí una planificación (PDF, DOCX, MD o imagen) para extraer su estructura curricular.</p>
        <input type="file" data-role="file-input" accept=".pdf,.docx,.md,.txt,.jpg,.jpeg,.png" />
        <div data-role="upload-status"></div>
      </div>

      <div class="pm-tab-pane d-none" data-pane="revisar">
        <div data-role="tree-preview"></div>
        <div class="pm-proponer-actions" style="margin-top:1rem; display:flex; gap:0.5rem;">
          <button type="button" class="btn-apple-primary" data-action="proponer">Proponer</button>
          <button type="button" class="btn-apple-secondary" data-action="borrador">Guardar borrador</button>
          <button type="button" class="btn-apple-secondary" data-action="cancelar">Cancelar</button>
        </div>
      </div>
    </div>
  `

  const tabBtns = container.querySelectorAll('.pm-tab-btn')
  const tabPanes = container.querySelectorAll('.pm-tab-pane')
  const goToTab = (target) => {
    tabBtns.forEach((b) => b.classList.toggle('active', b.dataset.tab === target))
    tabPanes.forEach((p) => p.classList.toggle('d-none', p.dataset.pane !== target))
  }
  tabBtns.forEach((btn) => btn.addEventListener('click', () => goToTab(btn.dataset.tab)))

  const fileInput = container.querySelector('[data-role="file-input"]')
  const uploadStatus = container.querySelector('[data-role="upload-status"]')
  const treePreview = container.querySelector('[data-role="tree-preview"]')

  // Estado en memoria — MODO BORRADOR: nada se persiste hasta [Proponer].
  let estructuraActual = null

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0]
    if (!file) return

    uploadStatus.innerHTML = `<div class="pm-spinner pm-spinner-sm"></div> Procesando "${file.name}"...`

    try {
      estructuraActual = await parsePlanningFile(file)
      uploadStatus.innerHTML = ''
      treePreview.innerHTML = _buildTreeHTML(estructuraActual.niveles || [])
      goToTab('revisar')
    } catch (err) {
      console.error('[proponerContenidoView] Error al parsear:', err)
      estructuraActual = null
      uploadStatus.innerHTML = `<p class="pm-error">${_escape(err.message)}</p>`
    }
  })

  container.querySelector('[data-action="proponer"]').addEventListener('click', async () => {
    if (!estructuraActual) return
    try {
      await enviarPropuesta(estructuraActual, { maestroId, claseId })
      window.alert('Propuesta enviada. El equipo ACM la revisará.')
      estructuraActual = null
      fileInput.value = ''
      treePreview.innerHTML = ''
      goToTab('upload')
    } catch (err) {
      console.error('[proponerContenidoView] Error al proponer:', err)
      window.alert(`Error al enviar la propuesta: ${err.message}`)
    }
  })

  container.querySelector('[data-action="borrador"]').addEventListener('click', () => {
    // Modo borrador explícito: el dato queda solo en memoria (estructuraActual).
    // No se invoca enviarPropuesta ni ninguna otra persistencia.
    window.alert('El borrador se mantiene en esta pantalla. Podés seguir editando o proponerlo más tarde.')
  })

  container.querySelector('[data-action="cancelar"]').addEventListener('click', () => {
    estructuraActual = null
    fileInput.value = ''
    treePreview.innerHTML = ''
    uploadStatus.innerHTML = ''
    goToTab('upload')
  })
}

function _buildTreeHTML(niveles) {
  if (!niveles.length) return '<p class="apple-caption">Sin niveles detectados.</p>'

  return niveles
    .map(
      (nivel) => `
      <div class="pm-tree-level">
        <strong>${_escape(nivel.nombre || '')}</strong>
        ${(nivel.temas || [])
          .map(
            (tema) => `
          <div class="pm-tree-node" style="margin-left:1rem;">
            <em>${_escape(tema.nombre || '')}</em>
            ${(tema.objetivos || [])
              .map(
                (obj) => `
              <div class="pm-tree-objetivo" style="margin-left:1rem;">
                ${_escape(obj.nombre || '')}
                <ul>
                  ${(obj.indicadores || [])
                    .map((ind) => `<li>${_escape(ind.descripcion || '')}</li>`)
                    .join('')}
                </ul>
              </div>
            `,
              )
              .join('')}
          </div>
        `,
          )
          .join('')}
      </div>
    `,
    )
    .join('')
}

function _escape(str) {
  if (!str) return ''
  return String(str).replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]))
}
