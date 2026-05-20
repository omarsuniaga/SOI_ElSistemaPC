/**
 * AcademicDashboardView.js
 * Layout principal de la Torre de Control Académica.
 */

import { getInstitutionalRadar, getNodeHotspots } from '../api/academicAdminApi.js';
import { InstitutionalRadar } from '../components/InstitutionalRadar.js';
import { NodeHotspots } from '../components/NodeHotspots.js';

export async function AcademicDashboardView() {
    // 1. Cargar datos en paralelo para máxima eficiencia
    // TODO: These VIEWs don't exist yet, using empty data for now
    const radarData = [];
    const hotspotsData = [];

    // Commented out until VIEWs are created
    // const [radarResponse, hotspotsResponse] = await Promise.all([
    //     getInstitutionalRadar().catch(err => ({ error: err, data: [] })),
    //     getNodeHotspots().catch(err => ({ error: err, data: [] }))
    // ]);
    // const radarData = radarResponse.data || [];
    // const hotspotsData = hotspotsResponse.data || [];

    // 2. Renderizar contenedor principal
    return `
        <div class="academic-admin-container">
            <header class="mb-5">
                <h1 class="aa-title">Torre de Control</h1>
                <p class="aa-subtitle">Análisis de Progreso Académico Institucional</p>
            </header>

            <!-- Sección 1: Radar Institucional (Visión General Alumnos) -->
            <section class="aa-glass-panel">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2 class="aa-hotspot-name fs-4">Radar de Estudiantes</h2>
                    <div class="aa-badge aa-badge-active">Actualizado ahora</div>
                </div>
                <div id="radar-container">
                    ${InstitutionalRadar(radarData)}
                </div>
            </section>

            <!-- Sección 2: Hotspots Pedagógicos (Dificultad por Nodo) -->
            <section class="mt-5">
                <h2 class="aa-hotspot-name fs-4 mb-4">Puntos de Calor Pedagógicos</h2>
                <div id="hotspots-container">
                    ${NodeHotspots(hotspotsData)}
                </div>
            </section>
        </div>
    `;
}
