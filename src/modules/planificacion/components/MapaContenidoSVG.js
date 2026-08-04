/**
 * MapaContenidoSVG.js — Componente de Renderizado de Grafo Curricular SVG Nativo
 * Soporta 3 niveles explícitos de jerarquía: Unidad (U), Objetivo (O) e Indicador (I).
 */
import { escapeHTML } from '../../clases/utils/clasesUtils.js'

export const NODE_TYPES = {
  UNIT: 'unidad',
  OBJECTIVE: 'objetivo',
  INDICATOR: 'indicador',
}

export const NODE_RADIUS = {
  unidad: 40,
  objetivo: 28,
  indicador: 18,
}

/**
 * Normaliza cualquier entrada (árbol `unidades` o lista plana legacy `nodos`)
 * en una lista secuencial plana de nodos con tipo explícito, manteniendo el árbol intacto.
 */
export function normalizarArbolCurricular({ unidades = [], nodos = [] }) {
  if (unidades && unidades.length > 0) {
    const nodosPlanos = []

    unidades.forEach((u, uIdx) => {
      const uId = u.id || `unidad-uuid-${uIdx + 1}`
      const unitNode = {
        id: uId,
        tipo: NODE_TYPES.UNIT,
        numero: String(uIdx + 1),
        titulo: u.titulo || `Unidad ${uIdx + 1}`,
        orden: u.orden || uIdx + 1,
        clasesEstimadas: u.clasesEstimadas || null,
        estado: u.estado || 'pendiente',
        persistido: Boolean(u.persistido ?? true),
        raw: u,
      }
      nodosPlanos.push(unitNode)

      const objetivos = u.objetivos || []
      objetivos.forEach((o, oIdx) => {
        const oId = o.id || `obj-uuid-${uIdx + 1}-${oIdx + 1}`
        const objNode = {
          id: oId,
          tipo: NODE_TYPES.OBJECTIVE,
          unidadId: uId,
          numero: `${uIdx + 1}.${oIdx + 1}`,
          titulo: o.titulo || `Objetivo ${oIdx + 1}`,
          orden: o.orden || oIdx + 1,
          estado: o.estado || 'pendiente',
          persistido: Boolean(o.persistido ?? true),
          raw: o,
        }
        nodosPlanos.push(objNode)

        const indicadores = o.indicadores || []
        indicadores.forEach((ind, indIdx) => {
          const iId = ind.id || `ind-uuid-${uIdx + 1}-${oIdx + 1}-${indIdx + 1}`
          const indNode = {
            id: iId,
            tipo: NODE_TYPES.INDICATOR,
            unidadId: uId,
            objetivoId: oId,
            numero: `${uIdx + 1}.${oIdx + 1}.${indIdx + 1}`,
            titulo: ind.titulo || `Indicador ${indIdx + 1}`,
            descripcion: ind.descripcion || '',
            prerrequisitoId: ind.prerrequisitoId || null,
            orden: ind.orden || indIdx + 1,
            estado: ind.estado || (ind.prerrequisitoId ? 'en_proceso' : 'logrado'),
            persistido: Boolean(ind.persistido ?? true),
            raw: ind,
          }
          nodosPlanos.push(indNode)
        })
      })
    })
    return nodosPlanos
  }

  // Fallback para lista plana legacy de nodos
  return nodos.map((n, idx) => ({
    id: String(n.id || `nodo-${idx + 1}`),
    tipo: n.tipo || (n.objetivoId ? NODE_TYPES.INDICATOR : n.unidadId ? NODE_TYPES.OBJECTIVE : NODE_TYPES.UNIT),
    numero: n.numero || n.label || null,
    titulo: n.titulo || n.nombre || `Nodo ${idx + 1}`,
    unidadId: n.unidadId || null,
    objetivoId: n.objetivoId || null,
    prerrequisitoId: n.prerrequisitoId || null,
    orden: idx + 1,
    estado: n.estado || 'logrado',
    persistido: Boolean(n.persistido ?? true),
    raw: n,
  }))
}

/**
 * Distribuye `count` puntos a lo largo de una curva Bézier cúbica con espacio proporcional.
 */
function distribuirPuntosEnCurva(p0, p1, p2, p3, count) {
  if (count <= 0) return []
  const N = 128
  const samples = []
  const arc = [0]

  for (let i = 0; i <= N; i++) {
    const t = i / N
    const invT = 1 - t
    const x = invT * invT * invT * p0.x + 3 * invT * invT * t * p1.x + 3 * invT * t * t * p2.x + t * t * t * p3.x
    const y = invT * invT * invT * p0.y + 3 * invT * invT * t * p1.y + 3 * invT * t * t * p2.y + t * t * t * p3.y
    samples.push({ x, y })
    if (i > 0) {
      arc.push(arc[i - 1] + Math.hypot(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y))
    }
  }

  const total = arc[N]
  const spacing = total / (count + 1)
  const puntos = []
  let target = spacing
  for (let i = 1; i <= N; i++) {
    if (arc[i] >= target) {
      puntos.push(samples[i])
      target += spacing
      if (puntos.length === count) break
    }
  }
  return puntos
}

/**
 * Construye la barra de acciones contextuales de un nodo (agregar hijo,
 * editar, eliminar). Se renderiza como <g> SVG clickeables al costado del
 * nodo y se engancha vía `.svg-action` (con stopPropagation para no disparar
 * el onNodeClick del grupo padre). `dimUsed=true` atenúa los nodos no
 * persistidos (demo/preview) para diferenciarlos en el Diseñador.
 */
function _accionesDeNodo({ id, tipo, cx, cy, r, svgWidth, editable, callbacks = {} }) {
  if (!editable) return ''

  const acciones = []
  if (tipo === NODE_TYPES.UNIT && typeof callbacks.onAddObjetivo === 'function') acciones.push(['add-objetivo', '+O', 'Agregar Objetivo'])
  if (tipo === NODE_TYPES.OBJECTIVE && typeof callbacks.onAddIndicador === 'function') acciones.push(['add-indicador', '+I', 'Agregar Indicador'])
  if (typeof callbacks.onEditNode === 'function') acciones.push(['editar', '✎', 'Editar'])
  if (typeof callbacks.onDeleteNode === 'function') acciones.push(['eliminar', '✕', 'Eliminar'])
  if (acciones.length === 0) return ''

  const separacion = 22
  const anchoTotal = (acciones.length - 1) * separacion
  let ax = cx + r + 14
  if (ax + anchoTotal / 2 + 10 > svgWidth - 6) {
    ax = cx - r - 14
  }
  const inicioX = ax - anchoTotal / 2

  return acciones
    .map(([action, simbolo, etiqueta], i) => `
      <g class="svg-action" data-node-id="${id}" data-action="${action}" transform="translate(${inicioX + i * separacion}, ${cy})" role="button" tabindex="0" aria-label="${etiqueta}">
        <circle r="9" fill="#334155" stroke="#94a3b8" stroke-width="1" />
        <text text-anchor="middle" y="3" font-size="10" font-weight="800" fill="#e2e8f0">${simbolo}</text>
      </g>
    `)
    .join('')
}

function _crearBloqueSinteticoDesdeLista(nodos = []) {
  const unidadId = 'legacy-unit-1'
  const objetivoId = 'legacy-obj-1'

  return [{
    unidadNode: {
      id: unidadId,
      tipo: NODE_TYPES.UNIT,
      numero: '1',
      titulo: 'Contenido de la ruta',
      estado: 'logrado',
      persistido: false,
      raw: null,
    },
    objetivos: [{
      objetivoNode: {
        id: objetivoId,
        tipo: NODE_TYPES.OBJECTIVE,
        unidadId,
        numero: '1.1',
        titulo: 'Objetivo general',
        estado: 'pendiente',
        persistido: false,
        raw: null,
      },
      indicadores: nodos.map((n, idx) => ({
        id: n.id || `legacy-ind-${idx + 1}`,
        tipo: NODE_TYPES.INDICATOR,
        unidadId,
        objetivoId,
        numero: `1.1.${idx + 1}`,
        titulo: n.titulo || n.nombre || `Indicador ${idx + 1}`,
        estado: n.estado || 'logrado',
        prerrequisitoId: n.prerrequisitoId || null,
        persistido: Boolean(n.persistido ?? true),
        raw: n,
      })),
    }],
  }]
}

function construirBloquesVerticales({ unidades = [], nodos = [] }) {
  if (Array.isArray(unidades) && unidades.length > 0) {
    return unidades.map((u, uIdx) => ({
      unidadNode: {
        id: u.id || `unidad-uuid-${uIdx + 1}`,
        tipo: NODE_TYPES.UNIT,
        numero: String(uIdx + 1),
        titulo: u.titulo || `Unidad ${uIdx + 1}`,
        estado: u.estado || 'pendiente',
        persistido: Boolean(u.persistido ?? true),
        raw: u,
      },
      objetivos: (u.objetivos || []).map((o, oIdx) => ({
        objetivoNode: {
          id: o.id || `obj-uuid-${uIdx + 1}-${oIdx + 1}`,
          tipo: NODE_TYPES.OBJECTIVE,
          unidadId: u.id || `unidad-uuid-${uIdx + 1}`,
          numero: `${uIdx + 1}.${oIdx + 1}`,
          titulo: o.titulo || `Objetivo ${oIdx + 1}`,
          estado: o.estado || 'pendiente',
          persistido: Boolean(o.persistido ?? true),
          raw: o,
        },
        indicadores: (o.indicadores || []).map((ind, indIdx) => ({
          id: ind.id || `ind-uuid-${uIdx + 1}-${oIdx + 1}-${indIdx + 1}`,
          tipo: NODE_TYPES.INDICATOR,
          unidadId: u.id || `unidad-uuid-${uIdx + 1}`,
          objetivoId: o.id || `obj-uuid-${uIdx + 1}-${oIdx + 1}`,
          numero: `${uIdx + 1}.${oIdx + 1}.${indIdx + 1}`,
          titulo: ind.titulo || `Indicador ${indIdx + 1}`,
          estado: ind.estado || (ind.prerrequisitoId ? 'en_proceso' : 'logrado'),
          prerrequisitoId: ind.prerrequisitoId || null,
          persistido: Boolean(ind.persistido ?? true),
          raw: ind,
        })),
      })),
    }))
  }

  const flat = Array.isArray(nodos) ? nodos : []
  if (flat.length === 0) return []

  const hasHierarchy = flat.some((n) => n.tipo === NODE_TYPES.OBJECTIVE || n.tipo === NODE_TYPES.INDICATOR || n.unidadId || n.objetivoId)
  if (!hasHierarchy) {
    return _crearBloqueSinteticoDesdeLista(flat)
  }

  const bloques = []
  let bloqueActual = null
  let objetivoActual = null

  flat.forEach((rawNode, idx) => {
    const tipo = rawNode.tipo || (rawNode.objetivoId ? NODE_TYPES.INDICATOR : rawNode.unidadId ? NODE_TYPES.OBJECTIVE : NODE_TYPES.UNIT)

    if (tipo === NODE_TYPES.UNIT) {
      const unitNode = {
        id: rawNode.id || `unidad-flat-${idx + 1}`,
        tipo: NODE_TYPES.UNIT,
        numero: rawNode.numero || String(bloques.length + 1),
        titulo: rawNode.titulo || `Unidad ${bloques.length + 1}`,
        estado: rawNode.estado || 'pendiente',
        persistido: Boolean(rawNode.persistido ?? true),
        raw: rawNode.raw || rawNode,
      }
      bloqueActual = { unidadNode: unitNode, objetivos: [] }
      bloques.push(bloqueActual)
      objetivoActual = null
      return
    }

    if (!bloqueActual) {
      const syntheticUnitId = rawNode.unidadId || `unidad-flat-${bloques.length + 1}`
      bloqueActual = {
        unidadNode: {
          id: syntheticUnitId,
          tipo: NODE_TYPES.UNIT,
          numero: String(bloques.length + 1),
          titulo: rawNode.unidadTitulo || rawNode.titulo || `Unidad ${bloques.length + 1}`,
          estado: rawNode.estado || 'pendiente',
          persistido: Boolean(rawNode.persistido ?? false),
          raw: rawNode.raw || null,
        },
        objetivos: [],
      }
      bloques.push(bloqueActual)
    }

    if (tipo === NODE_TYPES.OBJECTIVE) {
      objetivoActual = {
        objetivoNode: {
          id: rawNode.id || `${bloqueActual.unidadNode.id}-obj-${bloqueActual.objetivos.length + 1}`,
          tipo: NODE_TYPES.OBJECTIVE,
          unidadId: rawNode.unidadId || bloqueActual.unidadNode.id,
          numero: rawNode.numero || `${bloqueActual.unidadNode.numero}.${bloqueActual.objetivos.length + 1}`,
          titulo: rawNode.titulo || `Objetivo ${bloqueActual.objetivos.length + 1}`,
          estado: rawNode.estado || 'pendiente',
          persistido: Boolean(rawNode.persistido ?? true),
          raw: rawNode.raw || rawNode,
        },
        indicadores: [],
      }
      bloqueActual.objetivos.push(objetivoActual)
      return
    }

    if (tipo === NODE_TYPES.INDICATOR) {
      if (!objetivoActual || (rawNode.objetivoId && String(objetivoActual.objetivoNode.id) !== String(rawNode.objetivoId))) {
        const syntheticObjectiveId = rawNode.objetivoId || `${bloqueActual.unidadNode.id}-obj-${bloqueActual.objetivos.length + 1}`
        objetivoActual = bloqueActual.objetivos.find((o) => String(o.objetivoNode.id) === String(syntheticObjectiveId))
          || {
            objetivoNode: {
              id: syntheticObjectiveId,
              tipo: NODE_TYPES.OBJECTIVE,
              unidadId: rawNode.unidadId || bloqueActual.unidadNode.id,
              numero: rawNode.numero ? String(rawNode.numero).split('.').slice(0, 2).join('.') : `${bloqueActual.unidadNode.numero}.${bloqueActual.objetivos.length + 1}`,
              titulo: rawNode.objetivoTitulo || rawNode.titulo || `Objetivo ${bloqueActual.objetivos.length + 1}`,
              estado: 'pendiente',
              persistido: false,
              raw: null,
            },
            indicadores: [],
          }
        if (!bloqueActual.objetivos.includes(objetivoActual)) {
          bloqueActual.objetivos.push(objetivoActual)
        }
      }

      objetivoActual.indicadores.push({
        id: rawNode.id || `${objetivoActual.objetivoNode.id}-ind-${objetivoActual.indicadores.length + 1}`,
        tipo: NODE_TYPES.INDICATOR,
        unidadId: rawNode.unidadId || bloqueActual.unidadNode.id,
        objetivoId: rawNode.objetivoId || objetivoActual.objetivoNode.id,
        numero: rawNode.numero || `${objetivoActual.objetivoNode.numero}.${objetivoActual.indicadores.length + 1}`,
        titulo: rawNode.titulo || `Indicador ${objetivoActual.indicadores.length + 1}`,
        estado: rawNode.estado || 'logrado',
        prerrequisitoId: rawNode.prerrequisitoId || null,
        persistido: Boolean(rawNode.persistido ?? true),
        raw: rawNode.raw || rawNode,
      })
    }
  })

  return bloques
}

function _wrapTextByWords(text, maxChars = 28) {
  const raw = String(text || '').trim()
  if (!raw) return ['']

  const words = raw.split(/\s+/)
  const lines = []
  let current = ''

  const pushCurrent = () => {
    if (current) lines.push(current)
    current = ''
  }

  words.forEach((word) => {
    if (!current) {
      current = word
      return
    }

    if ((current.length + 1 + word.length) <= maxChars) {
      current += ` ${word}`
      return
    }

    pushCurrent()

    if (word.length <= maxChars) {
      current = word
      return
    }

    let chunk = ''
    for (const ch of word) {
      if ((chunk.length + 1) <= maxChars) {
        chunk += ch
      } else {
        if (chunk) lines.push(chunk)
        chunk = ch
      }
    }
    current = chunk
  })

  pushCurrent()
  return lines.length > 0 ? lines : ['']
}

function _medirLayoutNodo({ node, tipo, compact = false }) {
  const titulo = node?.titulo || ''
  const maxChars = tipo === NODE_TYPES.UNIT
    ? (compact ? 24 : 30)
    : tipo === NODE_TYPES.OBJECTIVE
      ? (compact ? 22 : 26)
      : (compact ? 20 : 24)

  const labelWidth = tipo === NODE_TYPES.UNIT
    ? (compact ? 230 : 280)
    : tipo === NODE_TYPES.OBJECTIVE
      ? (compact ? 210 : 250)
      : (compact ? 190 : 220)

  const lines = _wrapTextByWords(titulo, maxChars)
  const fontSize = tipo === NODE_TYPES.UNIT ? (compact ? 13 : 14) : tipo === NODE_TYPES.OBJECTIVE ? (compact ? 12 : 13) : (compact ? 11 : 12)
  const lineHeight = Math.round(fontSize * 1.28)
  const labelHeight = Math.max(lineHeight + 12, lines.length * lineHeight + 14)

  return {
    labelWidth,
    lines,
    fontSize,
    lineHeight,
    labelHeight,
  }
}

function _renderNodoVertical({
  node,
  tipo,
  x,
  y,
  radius,
  layout,
  editable,
  dimUsed,
  selected,
  svgWidth,
  callbacks = {},
  compact = false,
}) {
  if (!node) return ''

  const effectiveLayout = layout || _medirLayoutNodo({ node, tipo, compact })
  const fillBase = tipo === NODE_TYPES.UNIT
    ? '#0d6efd'
    : tipo === NODE_TYPES.OBJECTIVE
      ? '#8b5cf6'
      : '#10b981'
  const fill = node.estado === 'en_proceso'
    ? '#f59e0b'
    : node.estado === 'pendiente'
      ? fillBase
      : fillBase
  const strokeWidth = tipo === NODE_TYPES.UNIT ? 4 : tipo === NODE_TYPES.OBJECTIVE ? 3 : 2
  const labelX = x + radius + (compact ? 18 : 22)
  const textY = y - ((effectiveLayout.lines.length - 1) * effectiveLayout.lineHeight) / 2 - 2
  const typeLabel = tipo === NODE_TYPES.UNIT ? 'Unidad' : tipo === NODE_TYPES.OBJECTIVE ? 'Objetivo' : 'Indicador'
  const labelBoxHeight = effectiveLayout.labelHeight

  return `
    <g class="svg-node-group svg-node-${tipo}${selected ? ' svg-node-selected' : ''}" data-id="${node.id}" role="button" tabindex="0" style="cursor:pointer;" aria-label="${escapeHTML(typeLabel)} ${escapeHTML(node.numero || '')}: ${escapeHTML(node.titulo || '')}" opacity="${dimUsed && !node.persistido ? '0.45' : '1'}">
      <title>${escapeHTML(`${typeLabel} ${node.numero || ''} · ${node.titulo || ''}`)}</title>
      <line x1="${x - (compact ? 38 : 52)}" y1="${y}" x2="${x - radius - 10}" y2="${y}" stroke="rgba(148,163,184,0.5)" stroke-width="2" />
      <circle cx="${x}" cy="${y}" r="${radius + 7}" fill="${fill}" opacity="0.18" />
      <circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}" stroke="#ffffff" stroke-width="${strokeWidth}" filter="url(#glow${tipo === NODE_TYPES.UNIT ? 'Unidad' : 'Subnodo'})" />
      <text x="${x}" y="${y + (tipo === NODE_TYPES.UNIT ? 7 : tipo === NODE_TYPES.OBJECTIVE ? 6 : 5)}" text-anchor="middle" fill="#ffffff" font-size="${tipo === NODE_TYPES.UNIT ? (compact ? 20 : 24) : tipo === NODE_TYPES.OBJECTIVE ? (compact ? 15 : 18) : (compact ? 11 : 13)}" font-weight="900">${escapeHTML(node.numero || (tipo === NODE_TYPES.UNIT ? '1' : '1.1'))}</text>
      <rect x="${labelX - 10}" y="${y - labelBoxHeight / 2}" width="${effectiveLayout.labelWidth}" height="${labelBoxHeight}" rx="12" fill="var(--bs-body-bg, #0f172a)" opacity="0.82" stroke="rgba(148,163,184,0.22)" stroke-width="1" />
      <text x="${labelX}" y="${textY}" fill="var(--bs-body-color, #f8fafc)" font-size="${effectiveLayout.fontSize}" font-weight="800">
        ${effectiveLayout.lines.map((line, idx) => `
          <tspan x="${labelX}" dy="${idx === 0 ? 0 : effectiveLayout.lineHeight}">${escapeHTML(line)}</tspan>
        `).join('')}
      </text>
      <text x="${labelX}" y="${y + labelBoxHeight / 2 - 4}" fill="var(--bs-secondary-color, #94a3b8)" font-size="${compact ? 9 : 10}" font-weight="600">${typeLabel}</text>

      ${_accionesDeNodo({
        id: node.id,
        tipo,
        cx: x,
        cy: y,
        r: radius,
        svgWidth,
        editable,
        callbacks,
      })}
    </g>
  `
}

/**
 * Renderiza el Mapa Curricular SVG Serpiente (S-Curve) con soporte nativo de 3 niveles y acciones contextuales.
 */
export function renderMapaContenidoSVG({
  container,
  unidades = [],
  nodos = [],
  selectedId = null,
  editable = true,
  onNodeClick = null,
  onAddObjetivo = null,
  onAddIndicador = null,
  onEditNode = null,
  onDeleteNode = null,
  compact = false,
  dimUsed = false,
}) {
  if (!container) return

  const bloques = construirBloquesVerticales({ unidades, nodos })
  let currentZoom = compact ? 1.15 : 1
  const minZoom = 0.8
  const maxZoom = 2.4
  const zoomStep = 0.15

  if (bloques.length === 0) {
    container.innerHTML = `
      <div class="card border border-dashed border-secondary-subtle rounded-4 p-5 text-center bg-body-tertiary">
        <i class="bi bi-diagram-3 text-primary display-4 mb-3"></i>
        <h5 class="fw-bold text-body">Mapa Curricular Vacío</h5>
        <p class="text-body-secondary small mb-0">Cuando exista una unidad guardada, aparecerá aquí la ruta pedagógica completa.</p>
      </div>
    `
    return
  }

  const svgWidth = compact ? 420 : 460
  const unitX = compact ? 52 : 58
  const objectiveX = compact ? 66 : 74
  const indicatorX = compact ? 82 : 92
  const unitGap = compact ? 28 : 36
  const objectiveGap = compact ? 20 : 26
  const indicatorGap = compact ? 16 : 20
  const blockGap = compact ? 28 : 40
  const topPadding = compact ? 40 : 56

  let currentY = topPadding
  const elementosSVG = []
  const nodeById = new Map()

  bloques.forEach((bloque, bloqueIdx) => {
    const unitNode = bloque.unidadNode
    if (unitNode) {
      nodeById.set(String(unitNode.id), unitNode)
      const unitLayout = _medirLayoutNodo({ node: unitNode, tipo: NODE_TYPES.UNIT, compact })
      elementosSVG.push(_renderNodoVertical({
        node: unitNode,
        tipo: NODE_TYPES.UNIT,
        x: unitX,
        y: currentY,
        radius: NODE_RADIUS.unidad,
        layout: unitLayout,
        editable,
        dimUsed,
        selected: selectedId != null && String(unitNode.id) === String(selectedId),
        svgWidth,
        callbacks: { onAddObjetivo, onEditNode, onDeleteNode },
        compact,
      }))
      currentY += Math.max(NODE_RADIUS.unidad * 2 + unitGap, unitLayout.labelHeight + unitGap)
    }

    (bloque.objetivos || []).forEach((objetivoGroup, objIdx) => {
      const objetivoNode = objetivoGroup.objetivoNode
      if (!objetivoNode) return
      nodeById.set(String(objetivoNode.id), objetivoNode)
      const objectiveLayout = _medirLayoutNodo({ node: objetivoNode, tipo: NODE_TYPES.OBJECTIVE, compact })

      elementosSVG.push(_renderNodoVertical({
        node: objetivoNode,
        tipo: NODE_TYPES.OBJECTIVE,
        x: objectiveX,
        y: currentY,
        radius: NODE_RADIUS.objetivo,
        layout: objectiveLayout,
        editable,
        dimUsed,
        selected: selectedId != null && String(objetivoNode.id) === String(selectedId),
        svgWidth,
        callbacks: { onAddIndicador, onEditNode, onDeleteNode },
        compact,
      }))
      currentY += Math.max(NODE_RADIUS.objetivo * 2 + objectiveGap, objectiveLayout.labelHeight + objectiveGap)

      ;(objetivoGroup.indicadores || []).forEach((indicadorNode) => {
        if (!indicadorNode) return
        nodeById.set(String(indicadorNode.id), indicadorNode)
        const indicatorLayout = _medirLayoutNodo({ node: indicadorNode, tipo: NODE_TYPES.INDICATOR, compact })
        elementosSVG.push(_renderNodoVertical({
          node: indicadorNode,
          tipo: NODE_TYPES.INDICATOR,
          x: indicatorX,
          y: currentY,
          radius: NODE_RADIUS.indicador,
          layout: indicatorLayout,
          editable,
          dimUsed,
          selected: selectedId != null && String(indicadorNode.id) === String(selectedId),
          svgWidth,
          callbacks: { onEditNode, onDeleteNode },
          compact,
        }))
        currentY += Math.max(NODE_RADIUS.indicador * 2 + indicatorGap, indicatorLayout.labelHeight + indicatorGap)
      })

      if ((bloque.objetivos || []).length > 0 && objIdx < bloque.objetivos.length - 1) {
        currentY += compact ? 8 : 12
      }
    })

    if (bloqueIdx < bloques.length - 1) {
      currentY += blockGap
    }
  })

  const svgHeight = Math.max(420, currentY + (compact ? 48 : 72))
  const scaledWidth = Math.round(svgWidth * currentZoom)
  const scaledHeight = Math.round(svgHeight * currentZoom)

  const svgContent = `
    <svg width="${scaledWidth}" height="${scaledHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" class="mapa-svg-canvas" style="display:block; width:${scaledWidth}px; height:${scaledHeight}px;">
      <defs>
        <filter id="glowUnidad" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="glowSubnodo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--bs-border-color, #ffffff)" stroke-width="0.5" opacity="0.08" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#gridPattern)" />
      <line x1="${compact ? 34 : 40}" y1="${topPadding - 8}" x2="${compact ? 34 : 40}" y2="${svgHeight - 20}" stroke="rgba(148,163,184,0.22)" stroke-width="3" stroke-linecap="round" stroke-dasharray="10 10" />

      ${elementosSVG.join('')}
    </svg>
  `

  container.innerHTML = `
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
      <div class="d-flex align-items-center gap-2">
        <button type="button" class="btn btn-sm btn-outline-secondary" data-mapa-zoom="out" aria-label="Reducir zoom">
          <i class="bi bi-zoom-out"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-mapa-zoom="reset" aria-label="Restablecer zoom">
          <i class="bi bi-aspect-ratio"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary" data-mapa-zoom="in" aria-label="Aumentar zoom">
          <i class="bi bi-zoom-in"></i>
        </button>
        <span class="badge text-bg-secondary ms-1" data-mapa-zoom-label>${Math.round(currentZoom * 100)}%</span>
      </div>
      <div class="text-body-secondary small">Arrastra el mapa para moverlo y usa los botones para acercar o alejar.</div>
    </div>

    <div class="card border border-secondary-subtle shadow-sm rounded-4 ${compact ? 'p-2' : 'p-3'} bg-body-tertiary mb-3 position-relative">
      <div class="mapa-viewport" data-mapa-viewport style="max-height:${compact ? 'none' : '75vh'}; overflow-y:auto; overflow-x:hidden; cursor:grab; touch-action:none; user-select:none;">
        <div class="mapa-stage" data-mapa-stage style="width:${scaledWidth}px; height:${scaledHeight}px;">
          ${svgContent}
        </div>
      </div>
    </div>
  `

  const viewport = container.querySelector('[data-mapa-viewport]')
  const stage = container.querySelector('[data-mapa-stage]')
  const svgEl = container.querySelector('.mapa-svg-canvas')
  const zoomLabel = container.querySelector('[data-mapa-zoom-label]')
  const zoomButtons = container.querySelectorAll('[data-mapa-zoom]')

  const syncZoom = () => {
    const scaledWidthNow = Math.round(svgWidth * currentZoom)
    const scaledHeightNow = Math.round(svgHeight * currentZoom)
    if (stage) {
      stage.style.width = `${scaledWidthNow}px`
      stage.style.height = `${scaledHeightNow}px`
    }
    if (svgEl) {
      svgEl.setAttribute('width', String(scaledWidthNow))
      svgEl.setAttribute('height', String(scaledHeightNow))
      svgEl.style.width = `${scaledWidthNow}px`
      svgEl.style.height = `${scaledHeightNow}px`
    }
    if (zoomLabel) {
      zoomLabel.textContent = `${Math.round(currentZoom * 100)}%`
    }
  }

  zoomButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const prevZoom = currentZoom
      if (btn.dataset.mapaZoom === 'in') {
        currentZoom = Math.min(maxZoom, currentZoom + zoomStep)
      } else if (btn.dataset.mapaZoom === 'out') {
        currentZoom = Math.max(minZoom, currentZoom - zoomStep)
      } else {
        currentZoom = compact ? 1.15 : 1
      }

      if (Math.abs(currentZoom - prevZoom) < 0.001) return

      const prevLeft = viewport?.scrollLeft || 0
      const prevTop = viewport?.scrollTop || 0
      syncZoom()
      if (viewport) {
        requestAnimationFrame(() => {
          viewport.scrollLeft = prevLeft * (currentZoom / prevZoom)
          viewport.scrollTop = prevTop * (currentZoom / prevZoom)
        })
      }
    })
  })

  if (viewport) {
    let isDragging = false
    let dragged = false
    let startX = 0
    let startY = 0
    let startScrollLeft = 0
    let startScrollTop = 0
    let suppressClick = false

    viewport.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return
      if (e.target.closest('button, .svg-node-group, .svg-action')) return
      isDragging = true
      dragged = false
      startX = e.clientX
      startY = e.clientY
      startScrollLeft = viewport.scrollLeft
      startScrollTop = viewport.scrollTop
      viewport.style.cursor = 'grabbing'
      try { viewport.setPointerCapture(e.pointerId) } catch { }
    })

    viewport.addEventListener('pointermove', (e) => {
      if (!isDragging) return
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragged = true
      if (!dragged) return
      viewport.scrollLeft = startScrollLeft - dx
      viewport.scrollTop = startScrollTop - dy
    })

    const finishDrag = () => {
      if (!isDragging) return
      isDragging = false
      viewport.style.cursor = 'grab'
      if (dragged) {
        suppressClick = true
        window.setTimeout(() => { suppressClick = false }, 0)
      }
    }

    viewport.addEventListener('pointerup', finishDrag)
    viewport.addEventListener('pointercancel', finishDrag)
    viewport.addEventListener('mouseleave', finishDrag)
    viewport.addEventListener('click', (e) => {
      if (!suppressClick) return
      e.preventDefault()
      e.stopImmediatePropagation()
    }, true)
  }

  syncZoom()

  container.querySelectorAll('.svg-node-group').forEach((g) => {
    const activateNode = () => {
      const nodeId = g.dataset.id
      const targetNodo = nodeById.get(String(nodeId))
      if (targetNodo) {
        onNodeClick?.(targetNodo)
      }
    }
    g.addEventListener('click', activateNode)
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        activateNode()
      }
    })
  })

  container.querySelectorAll('.svg-action').forEach((g) => {
    const nodeId = g.dataset.nodeId
    const action = g.dataset.action
    const trigger = () => {
      const targetNodo = nodeById.get(String(nodeId))
      if (!targetNodo) return
      if (action === 'add-objetivo') onAddObjetivo?.(targetNodo)
      else if (action === 'add-indicador') onAddIndicador?.(targetNodo)
      else if (action === 'editar') onEditNode?.(targetNodo)
      else if (action === 'eliminar') onDeleteNode?.(targetNodo)
    }
    g.addEventListener('click', (e) => {
      e.stopPropagation()
      trigger()
    })
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        e.stopPropagation()
        trigger()
      }
    })
  })
}
