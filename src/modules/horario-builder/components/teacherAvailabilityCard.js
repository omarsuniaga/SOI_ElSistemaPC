/**
 * Teacher Availability Card component.
 * Displays a list of active teachers with indicators of their total weekly availability,
 * and allows clicking to filter the main grid.
 */
export function createTeacherAvailabilityCardList({
  teachers = [],
  selectedTeacherId = 'all',
  onSelectTeacher = null
}) {
  const teacherCardsHtml = teachers.map(teacher => {
    // Calculate total availability hours
    let totalMins = 0;
    if (teacher.disponibilidad) {
      Object.keys(teacher.disponibilidad).forEach(day => {
        const slots = teacher.disponibilidad[day] || [];
        slots.forEach(s => {
          const [sh, sm] = s.inicio.split(':').map(Number);
          const [eh, em] = s.fin.split(':').map(Number);
          totalMins += (eh * 60 + em) - (sh * 60 + sm);
        });
      });
    }

    const totalHours = Math.round((totalMins / 60) * 10) / 10;
    let statusClass = 'nula';
    let statusText = 'Sin Registro';
    let statusBadgeColor = 'bg-danger text-white';

    if (totalHours > 0) {
      if (totalHours < 10) {
        statusClass = 'low';
        statusText = `${totalHours} hrs (Baja)`;
        statusBadgeColor = 'bg-warning text-dark';
      } else if (totalHours < 25) {
        statusClass = 'medium';
        statusText = `${totalHours} hrs (Media)`;
        statusBadgeColor = 'bg-info text-dark';
      } else {
        statusClass = 'high';
        statusText = `${totalHours} hrs (Alta)`;
        statusBadgeColor = 'bg-success text-white';
      }
    }

    const isSelected = selectedTeacherId === teacher.id;
    const initial = teacher.nombre ? teacher.nombre.charAt(0) : '?';
    const skillsList = teacher.habilidades && teacher.habilidades.length > 0 
      ? teacher.habilidades.slice(0, 3).join(', ')
      : teacher.especialidad || 'Música';

    return `
      <div class="hb-teacher-badge card-action ${isSelected ? 'border-primary bg-primary-subtle' : ''}" 
           data-id="${teacher.id}" 
           style="cursor: pointer; display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: 1px solid var(--hb-border); border-radius: 12px; margin-bottom: 8px; background: ${isSelected ? 'var(--hb-primary-light)' : 'var(--hb-card-bg)'}; transition: all 0.2s;"
           id="teacher-card-${teacher.id}">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: ${isSelected ? 'var(--hb-primary)' : 'var(--hb-gray-300)'}; color: ${isSelected ? '#fff' : 'var(--hb-gray-700)'}; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
          ${initial}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 650; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--hb-text);">
            ${teacher.nombre}
          </div>
          <div style="font-size: 0.75rem; color: var(--hb-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            🎻 ${skillsList}
          </div>
        </div>
        <span class="badge ${statusBadgeColor}" style="font-size: 0.7rem; font-weight: 600; border-radius: 8px; padding: 4px 8px;">
          ${statusText}
        </span>
      </div>
    `;
  }).join('');

  return `
    <div class="hb-card" style="padding: 1.25rem;">
      <h3 class="hb-card-title">
        <i class="bi bi-people-fill"></i>
        <span>Disponibilidad Docente</span>
      </h3>
      <div style="margin-bottom: 12px;">
        <div class="hb-teacher-badge ${selectedTeacherId === 'all' ? 'border-primary bg-primary-subtle' : ''}" 
             data-id="all" 
             style="cursor: pointer; display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: 1px solid var(--hb-border); border-radius: 12px; background: ${selectedTeacherId === 'all' ? 'var(--hb-primary-light)' : 'var(--hb-card-bg)'}; transition: all 0.2s;"
             id="teacher-card-all">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: ${selectedTeacherId === 'all' ? 'var(--hb-primary)' : 'var(--hb-gray-300)'}; color: ${selectedTeacherId === 'all' ? '#fff' : 'var(--hb-gray-700)'}; display: flex; align-items: center; justify-content: center; font-weight: 700;">
            🌐
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--hb-text);">Ver Todos</div>
            <div style="font-size: 0.75rem; color: var(--hb-text-muted);">Mostrar disponibilidad unificada</div>
          </div>
          <span class="badge bg-secondary" style="font-size: 0.7rem; font-weight: 600; padding: 4px 8px;">
            ${teachers.length} profes
          </span>
        </div>
      </div>
      <div class="hb-teacher-list-scrollbar" style="max-height: 400px; overflow-y: auto; padding-right: 4px;">
        ${teacherCardsHtml}
      </div>
    </div>
  `;
}
