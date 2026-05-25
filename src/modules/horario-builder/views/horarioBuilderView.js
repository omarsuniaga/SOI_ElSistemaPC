import { fetchSchedulingData, saveScheduleRun, applyScheduleRun } from '../api/horarioBuilderApi.js';
import { generateOptimizedSchedule } from '../engine/schedulingEngine.js';
import { createAvailabilityGrid } from '../components/availabilityGrid.js';
import { createTeacherAvailabilityCardList } from '../components/teacherAvailabilityCard.js';
import { createConstraintPanel } from '../components/constraintPanel.js';
import { createConflictReport } from '../components/conflictReport.js';
import { exportToExcel, exportToPDF } from '../utils/horarioExporter.js';

// Local view state
let state = {
  teachers: [],
  classrooms: [],
  classes: [],
  activeAssignments: [],    // Current schedules in active DB
  proposedAssignments: [],  // Optimizations draft in memory
  noAsignadas: [],
  metricas: {},
  selectedTeacherId: 'all',
  isDraftView: false,        // If showing proposed optimization
  config: {
    periodo: 'S1-2026',
    duracionBloque: 60,
    gapMinimo: 15
  },
  loading: false
};

let viewContainer = null;

export async function renderHorarioBuilderView(container) {
  viewContainer = container;
  container.innerHTML = `
    <div class="hb-container" style="text-align: center; padding: 3rem;">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p style="margin-top: 1rem; color: var(--hb-text-muted); font-weight: 600;">Cargando motor de horarios y disponibilidades...</p>
    </div>
  `;

  try {
    // 1. Fetch data
    const data = await fetchSchedulingData();
    state.teachers = data.maestros || [];
    state.classrooms = data.salones || [];
    state.classes = data.clases || [];

    // Extract currently active database schedules
    state.activeAssignments = [];
    state.classes.forEach(cl => {
      if (cl.horarios && cl.horarios.length > 0) {
        const teacher = state.teachers.find(t => t.id === cl.maestro_principal_id);
        cl.horarios.forEach(h => {
          const salon = state.classrooms.find(s => s.id === h.salon_id);
          state.activeAssignments.push({
            clase_id: cl.id,
            clase_nombre: cl.nombre,
            maestro_id: cl.maestro_principal_id,
            maestro_nombre: teacher ? teacher.nombre : 'Profesor',
            salon_id: h.salon_id,
            salon_nombre: salon ? salon.nombre : 'Salón',
            dia: h.dia,
            hora_inicio: h.hora_inicio,
            hora_fin: h.hora_fin,
            color: hashStringToColor(cl.maestro_principal_id || 'default'),
            conflict: false
          });
        });
      }
    });

    renderMainLayout();
    attachEventListeners();
  } catch (error) {
    console.error('Error rendering HorarioBuilder:', error);
    container.innerHTML = `
      <div class="hb-container alert alert-danger" style="margin: 2rem; border-radius: 16px;">
        <h4>Error al cargar el constructor de horarios</h4>
        <p>${error.message}</p>
        <button class="btn btn-primary" id="btn-hb-retry">Reintentar</button>
      </div>
    `;
    document.getElementById('btn-hb-retry')?.addEventListener('click', () => renderHorarioBuilderView(container));
  }
}

function renderMainLayout() {
  const assignmentsToShow = state.isDraftView ? state.proposedAssignments : state.activeAssignments;
  
  viewContainer.innerHTML = `
    <div class="hb-container">
      <!-- Header -->
      <header class="hb-header">
        <div class="hb-title-group">
          <h1>Motor de Planificación y Horarios</h1>
          <p> SOI Academia — Gestión visual de disponibilidad y asignaciones optimizadas</p>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          ${assignmentsToShow.length > 0 ? `
            <button id="hb-btn-export-pdf" class="btn btn-outline-danger btn-sm" style="font-weight: 700; border-radius: 8px; display: flex; align-items: center; gap: 4px;">
              <i class="bi bi-file-pdf"></i> PDF
            </button>
            <button id="hb-btn-export-excel" class="btn btn-outline-success btn-sm" style="font-weight: 700; border-radius: 8px; display: flex; align-items: center; gap: 4px;">
              <i class="bi bi-file-spreadsheet"></i> Excel
            </button>
          ` : ''}
          ${state.isDraftView ? `
            <span class="badge bg-warning text-dark" style="font-size: 0.85rem; padding: 8px 12px; border-radius: 8px; font-weight: 700; animation: pulse 2s infinite;">
              ⚠️ MODO VISTA DE BORRADOR
            </span>
          ` : `
            <span class="badge bg-success-subtle text-success" style="font-size: 0.85rem; padding: 8px 12px; border-radius: 8px; font-weight: 700;">
              🟢 HORARIOS ACTIVOS
            </span>
          `}
        </div>
      </header>

      <!-- Draft Preview Alert Bar -->
      ${state.isDraftView ? `
        <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1px solid #f59e0b; border-radius: 12px; padding: 12px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; animation: slideIn 0.3s forwards;">
          <div style="color: #92400e; font-size: 0.9rem; font-weight: 650; display: flex; align-items: center; gap: 8px;">
            <i class="bi bi-cpu-fill" style="font-size: 1.25rem;"></i>
            <span>Estás previsualizando la propuesta del motor. Haz clic en <strong>"Aplicar Horario"</strong> para guardarlo en la institución, o <strong>"Descartar"</strong> para volver al estado actual.</span>
          </div>
          <div style="display: flex; gap: 10px;">
            <button id="hb-btn-draft-apply" class="btn btn-success btn-sm" style="font-weight: 700; border-radius: 8px;">
              <i class="bi bi-check2-circle"></i> Aplicar Horario
            </button>
            <button id="hb-btn-draft-discard" class="btn btn-outline-danger btn-sm" style="font-weight: 700; border-radius: 8px; background: white;">
              Descartar
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Main Layout Body -->
      <div class="hb-layout-grid">
        <!-- Sidebar -->
        <div class="hb-sidebar-col">
          <!-- Config Panel -->
          <div id="hb-panel-constraints-container">
            ${createConstraintPanel({ classes: state.classes, config: state.config })}
          </div>
          
          <!-- Conflict & Metrics Panel (Only visible after generate/draft) -->
          ${state.isDraftView ? `
            <div id="hb-panel-conflicts-container">
              ${createConflictReport({
                noAsignadas: state.noAsignadas,
                metricas: state.metricas,
                teachers: state.teachers,
                classrooms: state.classrooms
              })}
            </div>
          ` : ''}

          <!-- Teachers list -->
          <div id="hb-panel-teachers-container">
            ${createTeacherAvailabilityCardList({
              teachers: state.teachers,
              selectedTeacherId: state.selectedTeacherId
            })}
          </div>
        </div>

        <!-- Weekly Grid -->
        <div class="hb-grid-col">
          <div style="background: var(--hb-card-bg); border: 1px solid var(--hb-border); padding: 1.25rem; border-radius: 16px; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h2 style="font-size: 1.2rem; font-weight: 700; margin: 0; color: var(--hb-text);">
                ${state.selectedTeacherId === 'all' 
                  ? 'Vista de Horarios Unificados de la Institución' 
                  : `Disponibilidad y Clases de: ${state.teachers.find(t => t.id === state.selectedTeacherId)?.nombre || ''}`}
              </h2>
              <div style="font-size: 0.8rem; color: var(--hb-text-muted); font-weight: 600;">
                Lun–Vie 10:00–19:00 | Sáb 09:00–13:00 (Jornada Fija)
              </div>
            </div>
            <div id="hb-weekly-grid-container">
              ${createAvailabilityGrid({
                teachers: state.teachers,
                classrooms: state.classrooms,
                assignments: assignmentsToShow,
                selectedTeacherId: state.selectedTeacherId
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function attachEventListeners() {
  // 1. Sidebar filter event listener
  viewContainer.addEventListener('click', e => {
    const teacherBadge = e.target.closest('.hb-teacher-badge');
    if (teacherBadge) {
      const id = teacherBadge.dataset.id;
      state.selectedTeacherId = id;

      // Update selection class list directly for fast response
      viewContainer.querySelectorAll('.hb-teacher-badge').forEach(b => {
        b.classList.remove('border-primary', 'bg-primary-subtle');
        b.style.background = 'var(--hb-card-bg)';
        const avatar = b.querySelector('div');
        if (avatar) {
          avatar.style.background = 'var(--hb-gray-300)';
          avatar.style.color = 'var(--hb-gray-700)';
        }
      });

      teacherBadge.classList.add('border-primary', 'bg-primary-subtle');
      teacherBadge.style.background = 'var(--hb-primary-light)';
      const avatar = teacherBadge.querySelector('div');
      if (avatar) {
        avatar.style.background = 'var(--hb-primary)';
        avatar.style.color = '#fff';
      }

      // Update grid title
      const gridTitle = viewContainer.querySelector('.hb-grid-col h2');
      if (gridTitle) {
        gridTitle.textContent = id === 'all'
          ? 'Vista de Horarios Unificados de la Institución'
          : `Disponibilidad y Clases de: ${state.teachers.find(t => t.id === id)?.nombre || ''}`;
      }

      // Re-render availability grid container
      const gridContainer = document.getElementById('hb-weekly-grid-container');
      if (gridContainer) {
        const assignmentsToShow = state.isDraftView ? state.proposedAssignments : state.activeAssignments;
        gridContainer.innerHTML = createAvailabilityGrid({
          teachers: state.teachers,
          classrooms: state.classrooms,
          assignments: assignmentsToShow,
          selectedTeacherId: state.selectedTeacherId
        });
      }
    }
  });

  // 2. Run Optimizer button event listener
  viewContainer.addEventListener('click', async e => {
    const genBtn = e.target.closest('#hb-btn-generate');
    if (genBtn) {
      const period = document.getElementById('hb-input-periodo').value;
      const duration = parseInt(document.getElementById('hb-input-duracion').value);
      const gap = parseInt(document.getElementById('hb-input-gap').value);

      state.config = { periodo: period, duracionBloque: duration, gapMinimo: gap };

      // Set loading state
      const originalHtml = genBtn.innerHTML;
      genBtn.disabled = true;
      genBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span>Optimizando...</span>`;

      // Simulating subtle calculation micro-animation
      setTimeout(() => {
        try {
          // Pack classes data for engine (only classes without schedules or ALL?)
          // The optimization schedules classes from scratch for the semester run.
          // Let's optimize the entire classes payload!
          const result = generateOptimizedSchedule({
            clasesConMaestro: state.classes.map(c => ({
              id: c.id,
              nombre: c.nombre,
              maestro_principal_id: c.maestro_principal_id,
              total_alumnos: c.total_alumnos || 0,
              duracion: duration
            })),
            maestros: state.teachers,
            salones: state.classrooms,
            config: state.config
          });

          state.proposedAssignments = result.assignments;
          state.noAsignadas = result.noAsignadas;
          state.metricas = result.metricas;
          state.isDraftView = true;

          showToast('Horario optimizado con éxito', 'success');
          renderMainLayout();
          attachEventListeners();
        } catch (err) {
          console.error(err);
          showToast('Error al optimizar: ' + err.message, 'danger');
        } finally {
          genBtn.disabled = false;
          genBtn.innerHTML = originalHtml;
        }
      }, 700);
    }
  });

  // 3. Draft Apply button
  viewContainer.addEventListener('click', async e => {
    const applyBtn = e.target.closest('#hb-btn-draft-apply');
    if (applyBtn) {
      const originalHtml = applyBtn.innerHTML;
      applyBtn.disabled = true;
      applyBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span><span>Guardando...</span>`;

      try {
        // Save the run in database
        const savedRun = await saveScheduleRun({
          periodo: state.config.periodo,
          config: state.config,
          resultado: state.proposedAssignments,
          metricas: state.metricas,
          estado: 'aplicado'
        });

        // Batch persist/apply to clase_horarios
        await applyScheduleRun(savedRun.id, state.proposedAssignments);

        showToast('¡Horario guardado y aplicado permanentemente!', 'success');

        // Re-read data from source
        state.isDraftView = false;
        renderHorarioBuilderView(viewContainer);
      } catch (err) {
        console.error(err);
        showToast('Error al aplicar: ' + err.message, 'danger');
        applyBtn.disabled = false;
        applyBtn.innerHTML = originalHtml;
      }
    }
  });

  // 4. Draft Discard button
  viewContainer.addEventListener('click', e => {
    const discardBtn = e.target.closest('#hb-btn-draft-discard');
    if (discardBtn) {
      state.isDraftView = false;
      state.proposedAssignments = [];
      state.noAsignadas = [];
      state.metricas = {};
      showToast('Borrador descartado', 'warning');
      renderMainLayout();
      attachEventListeners();
    }
  });

  // 5. Drag & Drop Event Listeners
  // Drag start
  viewContainer.addEventListener('dragstart', e => {
    const dragTarget = e.target.closest('.hb-draggable-class');
    if (dragTarget) {
      const id = dragTarget.dataset.id;
      e.dataTransfer.setData('text/plain', id);
      dragTarget.classList.add('hb-dragging');
    }
  });

  // Drag end
  viewContainer.addEventListener('dragend', e => {
    const dragTarget = e.target.closest('.hb-draggable-class');
    if (dragTarget) {
      dragTarget.classList.remove('hb-dragging');
    }
  });

  // Drag over
  viewContainer.addEventListener('dragover', e => {
    const col = e.target.closest('.hb-day-column');
    if (col) {
      e.preventDefault();
      col.classList.add('hb-drag-hover');
    }
  });

  // Drag leave
  viewContainer.addEventListener('dragleave', e => {
    const col = e.target.closest('.hb-day-column');
    if (col) {
      col.classList.remove('hb-drag-hover');
    }
  });

  // Drop
  viewContainer.addEventListener('drop', e => {
    const col = e.target.closest('.hb-day-column');
    if (col) {
      e.preventDefault();
      col.classList.remove('hb-drag-hover');

      const classId = e.dataTransfer.getData('text/plain');
      const targetDay = col.dataset.day;

      // Calculate relative coordinate and convert to minutes
      const rect = col.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;

      const hourHeight = 55;
      const startHour = 9;
      const startMinutes = startHour * 60; // 540

      const minutes = startMinutes + (relativeY / hourHeight) * 60;
      // Snap to nearest 30 mins
      const roundedMinutes = Math.round(minutes / 30) * 30;

      // Restrict within JORNADA
      const clampedMinutes = Math.max(540, Math.min(1080, roundedMinutes));

      const list = state.isDraftView ? [...state.proposedAssignments] : [...state.activeAssignments];
      const assignment = list.find(a => a.clase_id === classId);

      if (assignment) {
        const startHourStr = Math.floor(clampedMinutes / 60);
        const startMinStr = clampedMinutes % 60;
        const newInicio = `${startHourStr.toString().padStart(2, '0')}:${startMinStr.toString().padStart(2, '0')}`;

        // Get class duration in minutes
        const duration = timeToMinutes(assignment.hora_fin) - timeToMinutes(assignment.hora_inicio);
        const endMinutes = clampedMinutes + duration;

        const endHourStr = Math.floor(endMinutes / 60);
        const endMinStr = endMinutes % 60;
        const newFin = `${endHourStr.toString().padStart(2, '0')}:${endMinStr.toString().padStart(2, '0')}`;

        // Update assignment in proposed draft
        assignment.dia = targetDay;
        assignment.hora_inicio = newInicio;
        assignment.hora_fin = newFin;

        state.isDraftView = true;
        state.proposedAssignments = list;

        reevaluateConflicts();
        showToast('Asignación desplazada en borrador', 'warning');
        renderMainLayout();
        attachEventListeners();
      }
    }
  });

  // 6. Export Event Listeners
  viewContainer.addEventListener('click', async e => {
    const pdfBtn = e.target.closest('#hb-btn-export-pdf');
    if (pdfBtn) {
      const originalHtml = pdfBtn.innerHTML;
      pdfBtn.disabled = true;
      pdfBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;

      try {
        const list = state.isDraftView ? state.proposedAssignments : state.activeAssignments;
        await exportToPDF(list, state.config.periodo);
        showToast('Reporte PDF descargado con éxito', 'success');
      } catch (err) {
        console.error(err);
        showToast('Error al exportar PDF: ' + err.message, 'danger');
      } finally {
        pdfBtn.disabled = false;
        pdfBtn.innerHTML = originalHtml;
      }
    }
  });

  viewContainer.addEventListener('click', async e => {
    const excelBtn = e.target.closest('#hb-btn-export-excel');
    if (excelBtn) {
      const originalHtml = excelBtn.innerHTML;
      excelBtn.disabled = true;
      excelBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>`;

      try {
        const list = state.isDraftView ? state.proposedAssignments : state.activeAssignments;
        await exportToExcel(list, state.config.periodo);
        showToast('Planilla Excel descargada con éxito', 'success');
      } catch (err) {
        console.error(err);
        showToast('Error al exportar Excel: ' + err.message, 'danger');
      } finally {
        excelBtn.disabled = false;
        excelBtn.innerHTML = originalHtml;
      }
    }
  });
}

// ─── HELPERS ────────────────────────────────────────────────────

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function reevaluateConflicts() {
  let conflictsCount = 0;
  
  // Reset all conflict flags
  state.proposedAssignments.forEach(a => { a.conflict = false; });
  
  const gap = parseInt(state.config.gapMinimo || 15);

  // Compare every pair for overlaps
  for (let i = 0; i < state.proposedAssignments.length; i++) {
    for (let j = i + 1; j < state.proposedAssignments.length; j++) {
      const a = state.proposedAssignments[i];
      const b = state.proposedAssignments[j];
      
      if (a.dia === b.dia) {
        const aStart = timeToMinutes(a.hora_inicio);
        const aEnd = timeToMinutes(a.hora_fin);
        const bStart = timeToMinutes(b.hora_inicio);
        const bEnd = timeToMinutes(b.hora_fin);
        
        const overlap = aStart < (bEnd + gap) && (bStart - gap) < aEnd;
        
        if (overlap) {
          if (a.maestro_id === b.maestro_id) {
            a.conflict = true;
            b.conflict = true;
            conflictsCount++;
          }
          if (a.salon_id === b.salon_id) {
            a.conflict = true;
            b.conflict = true;
            conflictsCount++;
          }
        }
      }
    }
  }

  // Recalculate metrics
  const totalClases = state.classes.length;
  const clasesAsignadas = state.proposedAssignments.filter(a => !a.conflict).length;
  
  state.metricas.clasesAsignadas = clasesAsignadas;
  state.metricas.clasesNoAsignadas = state.proposedAssignments.filter(a => a.conflict).length + state.noAsignadas.length;
  state.metricas.score = totalClases > 0 ? Math.max(0, Math.round((clasesAsignadas / totalClases) * 100)) : 100;

  // Update room utilization
  const salonSchedules = {};
  state.classrooms.forEach(s => { salonSchedules[s.id] = 0; });
  state.proposedAssignments.forEach(a => {
    if (!a.conflict) {
      const duration = timeToMinutes(a.hora_fin) - timeToMinutes(a.hora_inicio);
      if (salonSchedules[a.salon_id] !== undefined) {
        salonSchedules[a.salon_id] += duration;
      }
    }
  });

  const totalWeeklyMins = 3600;
  state.classrooms.forEach(s => {
    if (state.metricas.ocupacionSalones?.[s.id]) {
      const occupiedMins = salonSchedules[s.id] || 0;
      state.metricas.ocupacionSalones[s.id].porcentaje = Math.round((occupiedMins / totalWeeklyMins) * 100);
    }
  });

  // Update teacher workload
  const teacherSchedules = {};
  state.teachers.forEach(t => { teacherSchedules[t.id] = 0; });
  state.proposedAssignments.forEach(a => {
    if (!a.conflict) {
      const duration = timeToMinutes(a.hora_fin) - timeToMinutes(a.hora_inicio);
      if (teacherSchedules[a.maestro_id] !== undefined) {
        teacherSchedules[a.maestro_id] += duration;
      }
    }
  });

  state.teachers.forEach(t => {
    if (state.metricas.cargaMaestros?.[t.id]) {
      state.metricas.cargaMaestros[t.id].horas = Math.round((teacherSchedules[t.id] / 60) * 10) / 10;
    }
  });
}

// Visual toast helper
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'hb-toast';
  
  let icon = 'bi-check-circle-fill text-success';
  let border = '#10b981';
  if (type === 'danger') {
    icon = 'bi-exclamation-octagon-fill text-danger';
    border = '#ef4444';
  } else if (type === 'warning') {
    icon = 'bi-info-circle-fill text-warning';
    border = '#f59e0b';
  }

  toast.style.borderLeftColor = border;
  toast.innerHTML = `
    <i class="bi ${icon}"></i>
    <span style="font-size: 0.85rem; font-weight: 650; color: var(--hb-text);">${message}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function hashStringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 88%)`;
}
export { hashStringToColor };
