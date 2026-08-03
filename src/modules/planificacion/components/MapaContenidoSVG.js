/**
 * MapaContenidoSVG.js — Componente de Renderizado de Grafo de Nodos en SVG Nativo (Diseño Serpiente S-Curve)
 */
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

/**
 * Agrupa la lista plana de nodos en Unidades y Subnodos (Clases).
 */
function estructurarUnidadesYSubnodos(nodos = []) {
  const unidadesMap = new Map()

  nodos.forEach((nodo, idx) => {
    // Si el nodo especifica unidadId/unidadTitulo, usarlos; de lo contrario agrupar de 3 en 3 como Unidades
    const rawTitle = nodo.titulo || nodo.nombre || `Clase ${idx + 1}`
    const unidadId = nodo.unidadId || `unidad-${Math.floor(idx / 3) + 1}`
    const unidadTitulo = nodo.unidadTitulo || `Unidad ${Math.floor(idx / 3) + 1}: Módulo Didáctico`

    if (!unidadesMap.has(unidadId)) {
      unidadesMap.set(unidadId, {
        id: unidadId,
        titulo: unidadTitulo,
        clases: [],
        estado: 'pendiente'
      })
    }

    const unidad = unidadesMap.get(unidadId)
    unidad.clases.push({
      ...nodo,
      numeroClase: idx + 1,
      shortTitle: rawTitle.split(':')[1] || rawTitle
    })

    // Calcular estado de la Unidad según el estado de sus clases
    if (unidad.clases.every(c => c.estado === 'logrado')) {
      unidad.estado = 'logrado'
    } else if (unidad.clases.some(c => c.estado === 'logrado' || c.estado === 'en_proceso')) {
      unidad.estado = 'en_proceso'
    }
  })

  return Array.from(unidadesMap.values())
}

/**
 * Renderiza el Mapa de Contenidos Didácticos en formato Serpiente Vertical (S-Curve).
 */
export function renderMapaContenidoSVG({ container, nodos = [], onNodeClick = null, onAddNodeClick = null }) {
  if (!container) return

  const unidades = estructurarUnidadesYSubnodos(nodos)
  
  // Parámetros de la serpiente
  const svgWidth = 720
  const rowHeight = 160
  const paddingX = 140
  const startY = 90
  const svgHeight = Math.max(480, startY + unidades.length * rowHeight + 40)

  // Generar coordenadas (x, y) alternadas izquierda-derecha para cada UNIDAD (Serpiente)
  const unidadCoords = unidades.map((u, i) => {
    const isEven = i % 2 === 0
    const cx = isEven ? paddingX : svgWidth - paddingX
    const cy = startY + i * rowHeight
    return { ...u, cx, cy, isEven }
  })

  // Construir el Path Bézier curvado en S entre Unidades
  let pathD = ''
  if (unidadCoords.length > 0) {
    pathD = `M ${unidadCoords[0].cx} ${unidadCoords[0].cy}`
    for (let i = 0; i < unidadCoords.length - 1; i++) {
      const p1 = unidadCoords[i]
      const p2 = unidadCoords[i + 1]
      const midY = (p1.cy + p2.cy) / 2
      // Curva Bézier S hacia el siguiente extremo
      pathD += ` C ${p1.cx} ${midY}, ${p2.cx} ${midY}, ${p2.cx} ${p2.cy}`
    }
  }

  // Renderizado del SVG
  const svgContent = `
    <svg width="100%" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" class="mapa-svg-canvas" style="min-width: 320px;">
      <defs>
        <linearGradient id="snakeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="50%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#10b981" />
        </linearGradient>
        <filter id="glowUnidad" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glowSubnodo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Fondo sutil de grilla pedagógica -->
      <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--bs-border-color, #ffffff)" stroke-width="0.5" opacity="0.1" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#gridPattern)" />

      <!-- Camino principal serpenteante (S-Curve) -->
      ${pathD ? `<path d="${pathD}" fill="none" stroke="url(#snakeGrad)" stroke-width="8" stroke-linecap="round" stroke-dasharray="12 4" opacity="0.85" />` : ''}

      <!-- Renderizado de Unidades y sus Subnodos (Clases) -->
      ${unidadCoords.map((u, uIdx) => {
        const uFill = u.estado === 'logrado' ? '#10b981' : u.estado === 'en_proceso' ? '#f59e0b' : '#3b82f6'
        const dirFactor = u.isEven ? 1 : -1

        // Calcular posiciones de subnodos orbitales a los lados de la unidad
        const subnodeElements = u.clases.map((c, cIdx) => {
          const angle = (cIdx - (u.clases.length - 1) / 2) * 0.55
          const dist = 95
          const subCx = u.cx + Math.sin(angle) * dist * dirFactor
          const subCy = u.cy + Math.cos(angle) * 38
          const subFill = c.estado === 'logrado' ? '#10b981' : c.estado === 'en_proceso' ? '#f59e0b' : '#3b82f6'

          const rawTitle = c.titulo || c.nombre || `Clase ${c.numeroClase}`
          const displayTitle = rawTitle.length > 18 ? rawTitle.slice(0, 16) + '…' : rawTitle

          return `
            <!-- Línea conectora Unidad -> Subnodo -->
            <line x1="${u.cx}" y1="${u.cy}" x2="${subCx}" y2="${subCy}" stroke="${subFill}" stroke-width="2" opacity="0.6" stroke-dasharray="3 2" />

            <!-- Grupo de Subnodo (Clase) -->
            <g class="svg-node-group svg-subnode" data-id="${c.id}" role="button" tabindex="0" aria-label="Evaluar clase: ${escapeHTML(rawTitle)}" style="cursor: pointer;">
              <title>${escapeHTML(rawTitle)}</title>
              <circle cx="${subCx}" cy="${subCy}" r="18" fill="${subFill}" opacity="0.25" />
              <circle cx="${subCx}" cy="${subCy}" r="14" fill="${subFill}" stroke="#ffffff" stroke-width="2" filter="url(#glowSubnodo)" />
              <text x="${subCx}" y="${subCy + 4}" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">${c.numeroClase}</text>

              <text x="${subCx}" y="${subCy + 28}" text-anchor="middle" font-size="10" font-weight="600" fill="var(--bs-body-color, #e2e8f0)">
                <tspan x="${subCx}" dy="0">${escapeHTML(displayTitle)}</tspan>
              </text>
            </g>
          `
        }).join('')

        return `
          <!-- Conector radial a subnodos -->
          ${subnodeElements}

          <!-- Grupo de Nodo Principal UNIDAD -->
          <g class="svg-unidad-group" data-unidad-id="${u.id}">
            <circle cx="${u.cx}" cy="${u.cy}" r="38" fill="${uFill}" opacity="0.2" />
            <circle cx="${u.cx}" cy="${u.cy}" r="30" fill="${uFill}" stroke="#ffffff" stroke-width="4" filter="url(#glowUnidad)" />
            <text x="${u.cx}" y="${u.cy + 6}" text-anchor="middle" fill="#ffffff" font-size="15" font-weight="extrabold">U${uIdx + 1}</text>

            <!-- Título de la Unidad -->
            <text x="${u.cx}" y="${u.cy - 44}" text-anchor="middle" font-size="13" font-weight="800" fill="var(--bs-body-color, #f8fafc)">
              ${escapeHTML(u.titulo)}
            </text>
          </g>
        `
      }).join('')}
    </svg>
  `

  container.innerHTML = `
    <div class="card border border-secondary-subtle shadow-sm rounded-4 p-4 bg-body-tertiary overflow-x-auto mb-3 text-center">
      <div class="d-flex align-items-center justify-content-between mb-3 px-2">
        <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fs-6">
          <i class="bi bi-diagram-3 me-1"></i>Ruta Pedagógica Serpiente (Unidades & Clases)
        </span>
        <span class="text-muted small"><i class="bi bi-hand-index me-1"></i>Toca los subnodos numerados para evaluar a los alumnos</span>
      </div>
      ${svgContent}
    </div>
  `

  // Event Listeners para subnodos (Clases)
  container.querySelectorAll('.svg-subnode').forEach((g) => {
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
}
