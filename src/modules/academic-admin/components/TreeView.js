/**
 * Componente TreeView para la Gestión Académica
 * Vanilla JS + Delegación de Eventos + Apple Design Tokens
 */
export class TreeView {
  constructor(container, options = {}) {
    this.container = container
    this.data = options.data || []
    this.onSelect = options.onSelect || (() => {})
    this.expandedNodes = new Set()
    this.selectedNodeId = null
    
    this.icons = {
      block: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>',
      level: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17h20M2 12h20M2 7h20"></path></svg>',
      node: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>',
      indicator: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
      expander: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>'
    }

    this._injectStyles()
    this.render()
    this._bindEvents()
  }

  setData(newData) {
    this.data = newData
    this.render()
  }

  render() {
    this.container.innerHTML = `
      <div class="academic-tree">
        ${this._generateTreeHTML(this.data)}
      </div>
    `
  }

  _generateTreeHTML(nodes, level = 0) {
    if (!nodes || nodes.length === 0) return ''
    
    const isVisible = level === 0 // Root nodes are always visible
    
    return `
      <ul class="tree-list ${level > 0 ? 'tree-sublist' : ''}" style="--level: ${level}">
        ${nodes.map(node => this._generateNodeHTML(node, level)).join('')}
      </ul>
    `
  }

  _generateNodeHTML(node, level) {
    const isExpanded = this.expandedNodes.has(node.id)
    const isSelected = this.selectedNodeId === node.id
    const hasChildren = node.children && node.children.length > 0
    const criticalClass = node.is_critical ? 'is-critical' : ''
    const selectedClass = isSelected ? 'is-selected' : ''
    
    // El label depende del tipo
    let label = node.name || node.description || 'Sin nombre'
    if (node.type === 'level') label = `Nivel: ${label}`
    if (node.type === 'block') label = `Bloque: ${label}`

    return `
      <li class="tree-node ${selectedClass} ${criticalClass}" 
          data-id="${node.id}" 
          data-type="${node.type}" 
          data-level="${level}">
        <div class="tree-node-content" style="padding-left: ${level * 16 + 8}px">
          <span class="tree-expander ${hasChildren ? '' : 'is-hidden'} ${isExpanded ? 'is-expanded' : ''}">
            ${this.icons.expander}
          </span>
          <span class="tree-icon">${this.icons[node.type] || ''}</span>
          <span class="tree-label">${label}</span>
          ${node.is_critical ? '<span class="tree-badge-critical">FUEGO</span>' : ''}
        </div>
        <div class="tree-children-container" style="display: ${isExpanded ? 'block' : 'none'}">
          ${hasChildren ? this._generateTreeHTML(node.children, level + 1) : ''}
        </div>
      </li>
    `
  }

  _bindEvents() {
    this.container.addEventListener('click', (e) => {
      const expander = e.target.closest('.tree-expander')
      const content = e.target.closest('.tree-node-content')
      
      if (expander && !expander.classList.contains('is-hidden')) {
        const nodeEl = expander.closest('.tree-node')
        this._toggleExpand(nodeEl)
        e.stopPropagation()
        return
      }
      
      if (content) {
        const nodeEl = content.closest('.tree-node')
        this._selectNode(nodeEl)
      }
    })
  }

  _toggleExpand(nodeEl) {
    const id = nodeEl.dataset.id
    const expander = nodeEl.querySelector('.tree-expander')
    const childrenContainer = nodeEl.querySelector('.tree-children-container')
    
    if (this.expandedNodes.has(id)) {
      this.expandedNodes.delete(id)
      expander.classList.remove('is-expanded')
      if (childrenContainer) childrenContainer.style.display = 'none'
    } else {
      this.expandedNodes.add(id)
      expander.classList.add('is-expanded')
      if (childrenContainer) childrenContainer.style.display = 'block'
    }
  }

  _selectNode(nodeEl) {
    const id = nodeEl.dataset.id
    const type = nodeEl.dataset.type
    
    // Quitar selección previa
    const prevSelected = this.container.querySelector('.tree-node.is-selected')
    if (prevSelected) prevSelected.classList.remove('is-selected')
    
    // Nueva selección
    nodeEl.classList.add('is-selected')
    this.selectedNodeId = id
    
    // Callback
    const nodeData = this._findNodeById(this.data, id)
    this.onSelect(nodeData)
  }

  _findNodeById(nodes, id) {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = this._findNodeById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  _injectStyles() {
    if (document.getElementById('tree-view-styles')) return

    const styleEl = document.createElement('style')
    styleEl.id = 'tree-view-styles'
    styleEl.textContent = `
      .academic-tree {
        user-select: none;
        font-family: var(--sans, system-ui);
        color: var(--apple-ink, #1d1d1f);
        padding: 8px 0;
      }
      .tree-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .tree-node-content {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 10px;
        transition: background 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        gap: 10px;
        margin: 1px 8px;
        position: relative;
      }
      .tree-node-content:hover {
        background: var(--apple-parchment, #f5f5f7);
      }
      .tree-node.is-selected > .tree-node-content {
        background: var(--apple-primary, #0066cc);
        color: #fff;
      }
      .tree-expander {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        color: var(--apple-ink-muted-48, #86868b);
        transition: transform 0.2s ease;
      }
      .tree-expander.is-expanded {
        transform: rotate(90deg);
      }
      .tree-expander.is-hidden {
        visibility: hidden;
      }
      .tree-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        color: var(--apple-primary, #0066cc);
      }
      .tree-node.is-selected .tree-icon,
      .tree-node.is-selected .tree-expander {
        color: rgba(255, 255, 255, 0.9);
      }
      .tree-node.is-critical .tree-icon {
        color: #ff3b30;
      }
      .tree-label {
        font-size: 14px;
        font-weight: 400;
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .tree-node.is-selected .tree-label {
        font-weight: 500;
      }
      .tree-badge-critical {
        font-size: 9px;
        font-weight: 700;
        padding: 2px 6px;
        background: #ff3b30;
        color: #fff;
        border-radius: 4px;
        margin-left: auto;
        letter-spacing: 0.05em;
      }
      .tree-children-container {
        overflow: hidden;
      }
      /* Animación suave para hover */
      .tree-node-content::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: 10px;
        box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .tree-node-content:hover::after {
        opacity: 1;
      }
      [data-bs-theme="dark"] .tree-node-content:hover {
        background: rgba(255,255,255,0.08);
      }
      [data-bs-theme="dark"] .tree-node.is-selected > .tree-node-content {
        background: var(--apple-primary, #0066cc);
      }
    `
    document.head.appendChild(styleEl)
  }
}
