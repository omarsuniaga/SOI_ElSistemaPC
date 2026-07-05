/**
 * InstitutionalRadar.js
 * Tabla Apple-style con barras de progreso y badges de salud académica.
 */

export function InstitutionalRadar(data = []) {
    if (!data || data.length === 0) {
        return `
            <div class="pm-empty">
                <i class="bi bi-person-badge"></i>
                <p>No hay datos disponibles en el radar institucional.</p>
            </div>
        `;
    }

    return `
        <div class="aa-table-container pm-animate-fade-in">
            <table class="aa-table">
                <thead>
                    <tr>
                        <th>Estudiante</th>
                        <th>Nivel Actual</th>
                        <th>Progreso</th>
                        <th>Última Actividad</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(student => renderStudentRow(student)).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderStudentRow(student) {
    const progress = student.progress_percentage || 0;
    const progressClass = progress < 40 ? 'progress-low' : (progress < 80 ? 'progress-mid' : 'progress-high');
    const healthBadge = student.health_status || 'not_started';
    const lastActivity = student.last_activity_at 
        ? new Date(student.last_activity_at).toLocaleDateString() 
        : 'Sin actividad';

    return `
        <tr>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="pm-asist-avatar">${student.student_name.charAt(0)}</div>
                    <div>
                        <div class="aa-hotspot-name">${student.student_name}</div>
                        <div class="aa-hotspot-level">${student.seccion || 'S/S'}</div>
                    </div>
                </div>
            </td>
            <td>
                <span class="pm-asist-instrumento">${student.current_level || 'Nivel 0'}</span>
            </td>
            <td>
                <div class="aa-progress-wrapper" title="${progress}% completado">
                    <div class="aa-progress-bar">
                        <div class="aa-progress-fill ${progressClass}" style="width: ${progress}%"></div>
                    </div>
                    <span class="pm-asist-instrumento">${progress}%</span>
                </div>
            </td>
            <td>
                <span class="pm-asist-instrumento" title="Inactivo hace ${student.days_inactive} días">
                    ${lastActivity}
                </span>
            </td>
            <td>
                <span class="aa-badge aa-badge-${healthBadge}">
                    ${healthBadge.replace('_', ' ')}
                </span>
            </td>
        </tr>
    `;
}
