/**
 * NodeHotspots.js
 * Visualización de "Puntos de Calor" con porcentajes de falla por nodo.
 */

export function NodeHotspots(hotspots = []) {
    if (!hotspots || hotspots.length === 0) {
        return `
            <div class="pm-empty">
                <i class="bi bi-fire"></i>
                <p>No se han detectado puntos críticos pedagógicos.</p>
            </div>
        `;
    }

    return `
        <div class="aa-hotspots-grid pm-animate-fade-in">
            ${hotspots.map(node => renderHotspotCard(node)).join('')}
        </div>
    `;
}

function renderHotspotCard(node) {
    const failureRate = node.failure_percentage || 0;
    
    return `
        <div class="aa-hotspot-card">
            <div class="aa-hotspot-header">
                <div>
                    <div class="aa-hotspot-name">${node.node_name}</div>
                    <div class="aa-hotspot-level">${node.level_name}</div>
                </div>
                <div class="aa-hotspot-rate">${failureRate}%</div>
            </div>
            <div class="aa-hotspot-meta">
                <span>Total intentos: ${node.total_attempts}</span>
                <span class="ms-2">Fallidos: ${node.failed_attempts}</span>
            </div>
            <div class="aa-progress-bar">
                <div class="aa-progress-fill progress-low" style="width: ${failureRate}%"></div>
            </div>
        </div>
    `;
}
