import { loadJsonMock } from '../../../core/utils/loadJsonMock.js'

const MOCK_PATH = '/assets/data/mocks/objetivos_gamificacion.json'

export class GamificacionNodos {
  constructor(container, opciones = {}) {
    this.container = container
    this.alumnoId = opciones.alumnoId || null
    this.nivelActual = opciones.nivelActual || 1
    this.xpTotal = opciones.xpTotal || 0
    this.seleccionarNodo = opciones.onSelect || (() => {})
  }

  async load() {
    this.data = await loadJsonMock(MOCK_PATH)
    this.nodos = this.data.nodos
    this.objetivos = this.data.objetivos
    this.niveles = this.data.niveles
    this.render()
  }

  getEstadoNodo(nodo) {
    if (nodo.completado_en) return 'completed'
    if (this.esDesbloqueado(nodo)) return 'available'
    return 'locked'
  }

  esDesbloqueado(nodo) {
    if (!nodo.requiere || nodo.requiere.length === 0) return true
    return nodo.requiere.some(reqId => {
      const nodoReq = this.nodos.find(n => n.id === reqId)
      return nodoReq?.completado_en !== null
    })
  }

  getObjetoDelNodo(nodo) {
    return this.objetivos.find(o => o.id === nodo.objetivo_id)
  }

  getColorEstado(estado) {
    switch (estado) {
      case 'completed': return '#22c55e'
      case 'available': return '#eab308'
      default: return '#9ca3af'
    }
  }

  render() {
    const svgWidth = Math.max(...this.nodos.map(n => n.x)) + 100
    const svgHeight = Math.max(...this.nodos.map(n => n.y)) + 100

    this.container.innerHTML = `
      <div class="gamificacion-nodos">
        <div class="gn-header mb-3">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="fw-bold mb-0">Tu Ruta de Aprendizaje</h5>
            <div class="text-end">
              <span class="badge bg-primary">Nivel ${this.nivelActual}</span>
              <small class="text-muted d-block">${this.xpTotal} XP</small>
            </div>
          </div>
        </div>
        <svg class="gn-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" style="width:100%;height:auto;">
          ${this.renderConexiones()}
          ${this.nodos.map(n => this.renderNodo(n)).join('')}
        </svg>
      </div>
    `
  }

  renderConexiones() {
    let lines = ''
    this.nodos.forEach(nodo => {
      if (nodo.requiere) {
        nodo.requiere.forEach(reqId => {
          const nodoReq = this.nodos.find(n => n.id === reqId)
          if (nodoReq) {
            lines += `<line x1="${nodoReq.x}" y1="${nodoReq.y}" x2="${nodo.x}" y2="${nodo.y}" 
              stroke="${this.getColorEstado(this.getEstadoNodo(nodo))}" stroke-width="2" stroke-dasharray="${nodoReq.completado_en ? '0' : '5,5'}" />`
          }
        })
      }
    })
    return lines
  }

  renderNodo(nodo) {
    const estado = this.getEstadoNodo(nodo)
    const objetivo = this.getObjetoDelNodo(nodo)
    const color = this.getColorEstado(estado)
    const opacity = estado === 'locked' ? 0.5 : 1
    const clickHandler = estado !== 'locked' ? `onclick="this.dispatchEvent(new CustomEvent('nodo-select', {detail: '${nodo.id}'}))"` : ''

    return `
      <g class="gn-nodo gn-nodo-${estado}" transform="translate(${nodo.x}, ${nodo.y})" ${clickHandler} style="cursor:${estado !== 'locked' ? 'pointer' : 'default'};opacity:${opacity}">
        <circle r="24" fill="${color}" />
        <text x="0" y="5" text-anchor="middle" fill="white" font-size="12">${objetivo?.xp || '?'}</text>
        <title>${objetivo?.nombre || 'Objetivo'} - ${estado}</title>
      </g>
      <text x="${nodo.x}" y="${nodo.y + 40}" text-anchor="middle" font-size="10" fill="#6b7280">${objetivo?.nombre || ''}</text>
    `
  }
}

export function createGamificacionNodos(container, opciones) {
  const instancia = new GamificacionNodos(container, opciones)
  instancia.load()
  return instancia
}

export function renderGamificacionNodos(container, opciones = {}) {
  return createGamificacionNodos(container, opciones)
}