/**
 * BlockSection Component
 * Collapsible container for ruta blocks and their levels
 */

/**
 * Render a collapsible block section
 * @param {HTMLElement} container
 * @param {Object} props
 * @param {string} props.blockId - Unique block identifier
 * @param {string} props.blockName - Display name of the block
 * @param {boolean} props.isExpanded - Whether the block is currently expanded
 * @param {number} props.childCount - Number of child levels in this block
 * @param {Function} props.onToggle - Callback when toggling, receives blockId
 */
export function renderBlockSection(container, props) {
  const { blockId, blockName, isExpanded, childCount, onToggle } = props

  container.innerHTML = `
    <div class="block-section" data-block-id="${blockId}">
      <div class="block-section-header" style="
        padding: 12px 16px;
        background: #f1f5f9;
        border-bottom: 1px solid #e2e8f0;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        user-select: none;
      ">
        <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
          <span style="
            display: inline-block;
            width: 20px;
            height: 20px;
            text-align: center;
            font-size: 0.75rem;
            color: #64748b;
            ${isExpanded ? 'transform: rotate(90deg);' : ''}
            transition: transform 0.2s ease;
          ">▶</span>
          <span style="font-weight: 600; color: #1e293b;">${blockName}</span>
        </div>
        <span style="
          background: #e2e8f0;
          color: #475569;
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 0.75rem;
          font-weight: 500;
        ">${childCount}</span>
      </div>

      <div class="block-section-content" style="${isExpanded ? '' : 'display: none;'}">
        <!-- Child levels/nodes will be inserted here by parent -->
      </div>
    </div>
  `

  container.querySelector('.block-section-header')?.addEventListener('click', () => {
    onToggle(blockId)
  })
}
