/**
 * RutaHeader Component
 * Displays ruta title, class selector, and progress stats
 */

/**
 * Render the ruta header
 * @param {HTMLElement} container
 * @param {Object} props
 * @param {string} props.rutaName - Name of the ruta
 * @param {Array} props.clases - List of {id, nombre}
 * @param {string} props.activeClaseId - Currently selected clase id
 * @param {number} props.nodesCovered - Number of nodes covered
 * @param {number} props.totalNodes - Total number of nodes
 * @param {Function} props.onClaseChange - Callback when clase changes, receives new claseId
 */
export function renderRutaHeader(container, props) {
  const { rutaName, clases, activeClaseId, nodesCovered, totalNodes, onClaseChange } = props

  const percentage = totalNodes > 0 ? Math.round((nodesCovered / totalNodes) * 100) : 0

  container.innerHTML = `
    <div class="ruta-header" style="padding: 16px; border-bottom: 1px solid #e2e8f0;">
      <h2 style="margin: 0 0 12px 0; font-size: 1.2rem;">${rutaName}</h2>

      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 6px; font-size: 0.875rem; color: #64748b;">Grupo</label>
        <select id="ruta-clase-select" style="padding: 8px; border-radius: 6px; border: 1px solid #e2e8f0; width: 100%; font-size: 0.875rem;">
          ${clases.map(c => `<option value="${c.id}" ${c.id === activeClaseId ? 'selected' : ''}>${c.nombre}</option>`).join('')}
        </select>
      </div>

      <div style="display: flex; gap: 16px; font-size: 0.875rem;">
        <div>
          <span style="color: #64748b;">Cubiertos:</span>
          <span style="font-weight: 600; color: #1e293b;">${nodesCovered}/${totalNodes}</span>
        </div>
        <div>
          <span style="color: #64748b;">Progreso:</span>
          <span style="font-weight: 600; color: #1e293b;">${percentage}%</span>
        </div>
      </div>
    </div>
  `

  container.querySelector('#ruta-clase-select')?.addEventListener('change', (e) => {
    onClaseChange(e.target.value)
  })
}
