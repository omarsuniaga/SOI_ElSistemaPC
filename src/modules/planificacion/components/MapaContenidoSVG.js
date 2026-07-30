/**
 * MapaContenidoSVG.js — Componente de Renderizado de Grafo de Nodos en SVG Nativo
 */
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

/**
 * Renderiza el Mapa de Contenidos Didácticos en SVG vectorial interactivo.
 * @param {Object} params
 * @param {HTMLElement} params.container — Elemento donde se renderizará el SVG
 * @param {Array<Object>} params.nodos — Lista de objetivos e indicadores [{ id, titulo, tipo: 'objetivo'|'indicador', estado: 'logrado'|'en_proceso'|'pendiente' }]
 * @param {Function} [params.onNodeClick] — Callback al hacer clic en un nodo
 * @param {Function} [params.onAddNodeClick] — Callback para agregar nodo al vuelo
 */
export function renderMapaContenidoSVG({ container, nodos = [], onNodeClick = null, onAddNodeClick = null }) {
  if (!container) return

  const height = 230
  const startX = 70
  const stepX = 180
  const centerY = 95

  let pathD = ''

  // Dibujar los conectores (Líneas Bézier suaves)
  if (nodos.length > 1) {
    let d = `M ${startX} ${centerY}`
    nodos.forEach((_, idx) => {
      if (idx > 0) {
        const x = startX + idx * stepX
        const prevX = startX + (idx - 1) * stepX
        const midX = (prevX + x) / 2
        const offsetY = idx % 2 === 0 ? -20 : 20
        d += ` C ${midX} ${centerY + offsetY}, ${midX} ${centerY + offsetY}, ${x} ${centerY}`
      }
    })
    pathD = d
  }

  const totalWidth = startX + (nodos.length + 1) * stepX + 40

  // Renderizar la trayectoria SVG
  const svgContent = `
    <svg width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" class="mapa-svg-canvas" style="min-width: 100%;">
      <defs>
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="50%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#10b981" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      ${pathD ? `<path d="${pathD}" fill="none" stroke="url(#lineGrad)" stroke-width="4" stroke-linecap="round" />` : ''}

      ${nodos
        .map((nodo, idx) => {
          const cx = startX + idx * stepX
          const cy = centerY
          const r = 24
          const fillColor = nodo.estado === 'logrado' ? '#10b981' : nodo.estado === 'en_proceso' ? '#f59e0b' : '#3b82f6'

          const rawTitle = nodo.titulo || nodo.nombre || `Indicador ${idx + 1}`
          // Extraer solo la parte del indicador si contiene separadores
          const titleParts = rawTitle.split(':')
          const shortTitle = (titleParts[1] || titleParts[0]).trim()
          const displayTitle = shortTitle.length > 22 ? shortTitle.slice(0, 20) + '…' : shortTitle

          return `
          <g class="svg-node-group" data-id="${nodo.id}" role="button" tabindex="0" aria-label="Evaluar nodo: ${escapeHTML(rawTitle)}" style="cursor: pointer;">
            <title>${escapeHTML(rawTitle)}</title>
            <circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="${fillColor}" opacity="0.2" />
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fillColor}" stroke="var(--bs-border-color, #ffffff)" stroke-width="3" filter="url(#glow)" />
            <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">${idx + 1}</text>
            
            <text x="${cx}" y="${cy + r + 18}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--bs-body-color, #e2e8f0)">
              <tspan x="${cx}" dy="0">Clase ${idx + 1}</tspan>
              <tspan x="${cx}" dy="14" font-size="10" font-weight="500" fill="var(--bs-secondary-color, #94a3b8)">${escapeHTML(displayTitle)}</tspan>
            </text>
          </g>
        `
        })
        .join('')}

      <!-- Botón Agregar Nodo Al Vuelo -->
      <g class="svg-add-node-group" style="cursor: pointer;">
        <circle cx="${startX + nodos.length * stepX}" cy="${centerY}" r="22" fill="var(--bs-border-color-translucent, #334155)" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
        <text x="${startX + nodos.length * stepX}" y="${centerY + 6}" text-anchor="middle" fill="var(--bs-body-color, #94a3b8)" font-size="18" font-weight="bold">+</text>
        <text x="${startX + nodos.length * stepX}" y="${centerY + 38}" text-anchor="middle" fill="var(--bs-secondary-color, #94a3b8)" font-size="10" font-weight="600">Al Vuelo</text>
      </g>
    </svg>
  `

  container.innerHTML = `
    <div class="card border border-secondary-subtle shadow-sm rounded-4 p-3 bg-body-tertiary overflow-x-auto mb-3">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle">
          <i class="bi bi-diagram-3 me-1"></i>Ruta de Contenido Didáctico (SVG)
        </span>
        <span class="text-muted small"><i class="bi bi-hand-index me-1"></i>Toca un nodo para evaluar a los alumnos</span>
      </div>
      ${svgContent}
    </div>
  `

  // Event Listeners
  container.querySelectorAll('.svg-node-group').forEach((g) => {
    const activateNode = () => {
      const nodeId = g.dataset.id
      const targetNodo = nodos.find((n) => String(n.id) === String(nodeId))
      onNodeClick?.(targetNodo)
    }
    g.addEventListener('click', activateNode)
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        activateNode()
      }
    })
  })

  container.querySelector('.svg-add-node-group')?.addEventListener('click', () => {
    onAddNodeClick?.()
  })
}
