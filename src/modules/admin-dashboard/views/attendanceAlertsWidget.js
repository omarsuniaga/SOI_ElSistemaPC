import { getStudentAbsencesSummary, getIncompleteClassSessions } from '../../metricas/api/metricasApi.js'
import {
  sendWhatsAppAlert,
  sendWhatsAppReminder,
  isValidWhatsAppNumber,
  checkExistingAlert,
  getNotificationStatus,
} from '../../metricas/services/attendanceNotificationService.js'
import { AppModal } from '../../../shared/components/AppModal.js'
import { escapeHTML } from '../../clases/utils/clasesUtils.js'
import { config } from '../../../core/config/config.js'

function esc(str) {
  return str ? escapeHTML(String(str)) : '—'
}

function formatDate(isoStr) {
  if (!isoStr) return '—'
  try {
    const date = new Date(isoStr)
    return date.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })
  } catch {
    return isoStr
  }
}

export function attendanceAlertsWidget(containerId, options = {}) {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId
  if (!container) return null

  const state = {
    studentData: null,
    sessionData: null,
    cargando: true,
    error: null,
    daysFilter: 7,
    selectedStudent: null,
    selectedSession: null,
    approvalModalOpen: false,
  }

  async function loadData() {
    try {
      state.cargando = true
      render()

      // If demo mode is enabled or errors occur, use mock data
      if (config.isDemoMode) {
        console.log('[Attendance Alerts] Using demo mode data')
        const { getStudentAbsencesSummary: getMockStudents, getIncompleteClassSessions: getMockSessions }
          = await import('../../metricas/api/metricasMock.js')

        const [studentRes, sessionRes] = await Promise.all([
          getMockStudents(state.daysFilter),
          getMockSessions(),
        ])

        state.studentData = studentRes
        state.sessionData = sessionRes
        state.error = null
      } else {
        const [studentRes, sessionRes] = await Promise.all([
          getStudentAbsencesSummary(state.daysFilter),
          getIncompleteClassSessions(),
        ])

        state.studentData = studentRes
        state.sessionData = sessionRes
        state.error = null
      }
    } catch (err) {
      console.warn('[Attendance Alerts] Error loading real data, falling back to demo:', err.message)
      try {
        const { getStudentAbsencesSummary: getMockStudents, getIncompleteClassSessions: getMockSessions }
          = await import('../../metricas/api/metricasMock.js')

        const [studentRes, sessionRes] = await Promise.all([
          getMockStudents(state.daysFilter),
          getMockSessions(),
        ])

        state.studentData = studentRes
        state.sessionData = sessionRes
        state.error = null
      } catch (fallbackErr) {
        state.error = `Error: ${err.message}`
        console.error('Fallback to demo data also failed:', fallbackErr)
      }
    } finally {
      state.cargando = false
      render()
    }
  }

  function render() {
    if (state.cargando) {
      container.innerHTML = `
        <div class="alert alert-info">
          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
          Cargando datos de asistencia...
        </div>
      `
      return
    }

    if (state.error) {
      container.innerHTML = `<div class="alert alert-danger">${esc(state.error)}</div>`
      return
    }

    container.innerHTML = renderContent()
    attachEvents()
  }

  function renderContent() {
    return `
      <div class="page-glass p-4">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h5 class="fw-bold m-0">
            <i class="bi bi-person-exclamation text-warning me-2"></i>Alertas de Asistencia
          </h5>
          <small class="text-muted">Filtros y acciones rápidas para maestros y representantes</small>
        </div>

        <!-- SECCIÓN 1: ALUMNOS CON FALTAS -->
        <div class="mb-5">
          <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h6 class="fw-bold mb-0"><i class="bi bi-people-fill text-danger me-2"></i>Alumnos con Faltas</h6>
            <div class="d-flex gap-2 flex-wrap">
              <select id="filter-days" class="form-select form-select-sm" style="max-width: 180px">
                <option value="7" ${state.daysFilter === 7 ? 'selected' : ''}>Última semana</option>
                <option value="14" ${state.daysFilter === 14 ? 'selected' : ''}>Últimas 2 semanas</option>
                <option value="30" ${state.daysFilter === 30 ? 'selected' : ''}>Último mes</option>
                <option value="60" ${state.daysFilter === 60 ? 'selected' : ''}>Últimos 2 meses</option>
              </select>
            </div>
          </div>

          ${renderStudentsTable()}
        </div>

        <!-- SEPARADOR -->
        <hr class="my-5">

        <!-- SECCIÓN 2: CLASES SIN ASISTENCIA -->
        <div class="mb-4">
          <h6 class="fw-bold mb-3"><i class="bi bi-calendar-x text-danger me-2"></i>Clases Sin Asistencia Completada (Esta Semana)</h6>
          ${renderSessionsTable()}
        </div>

        <!-- SECCIÓN 3: HISTORIAL DE NOTIFICACIONES -->
        <div id="notifications-history"></div>
      </div>
    `
  }

  function renderStudentsTable() {
    const data = state.studentData
    if (!data || !data.alumnos || data.alumnos.length === 0) {
      return `<div class="alert alert-success">✓ Todos los alumnos han asistido correctamente</div>`
    }

    return `
      <div class="table-responsive">
        <table class="table table-sm table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Alumno</th>
              <th class="text-center">Faltas (${data.periodo_dias}d)</th>
              <th class="text-center">Total Histórico</th>
              <th>Clases Afectadas</th>
              <th class="text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${data.alumnos.map((student) => `
              <tr>
                <td class="fw-500">${esc(student.nombre)}</td>
                <td class="text-center">
                  <span class="badge bg-danger">${student.faltas_periodo}</span>
                </td>
                <td class="text-center">
                  <span class="badge bg-warning text-dark">${student.total_faltas_historico}</span>
                </td>
                <td>
                  <small class="text-muted">
                    ${student.clases_ausente.map(c => c.grupo).join(', ')}
                  </small>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-danger" data-action="alert-parent" data-student-id="${student.id}" data-student-name="${esc(student.nombre)}" data-student-phone="${student.representante_phone || ''}">
                    <i class="bi bi-exclamation-circle me-1"></i>Alertar
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  function renderSessionsTable() {
    const data = state.sessionData
    if (!data || !data.sesiones_incompletas || data.sesiones_incompletas.length === 0) {
      return `<div class="alert alert-success">✓ Todas las asistencias están completas</div>`
    }

    return `
      <div class="table-responsive">
        <table class="table table-sm table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>Maestro</th>
              <th>Clase/Grupo</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th class="text-center">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${data.sesiones_incompletas.map(session => `
              <tr>
                <td class="fw-500">${esc(session.maestro_nombre)}</td>
                <td>${esc(session.grupo)}</td>
                <td>${formatDate(session.fecha)}</td>
                <td>${esc(session.hora)}</td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-warning" data-action="remind-teacher" data-session-id="${session.id}" data-teacher-name="${esc(session.maestro_nombre)}" data-teacher-phone="${session.maestro_phone || ''}" data-grupo="${session.grupo}" data-fecha="${session.fecha}">
                    <i class="bi bi-bell me-1"></i>Recordar
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  function renderNotificationStatus(notifications) {
    if (!notifications || notifications.length === 0) {
      return ''
    }

    return `
      <div class="alert alert-light border-1 mt-4 pt-3">
        <h6 class="fw-bold mb-3">
          <i class="bi bi-clock-history me-2 text-primary"></i>Últimas Notificaciones de Asistencia
        </h6>
        <div class="table-responsive">
          <table class="table table-sm mb-0 align-middle">
            <thead class="table-light">
              <tr style="font-size: 0.75rem;">
                <th style="width:140px">Tipo</th>
                <th>Destinatario</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Fecha / Hora</th>
              </tr>
            </thead>
            <tbody>
              ${notifications.slice(0, 10).map(n => `
                <tr style="font-size: 0.85rem;">
                  <td>
                    <small class="fw-600">
                      ${n.tipo === 'alerta_asistencia_alumno' ? '🎓 Alumno' :
                        n.tipo === 'recordatorio_asistencia_maestro' ? '👨‍🏫 Maestro' : '📋 Notificación'}
                    </small>
                  </td>
                  <td><small class="fw-500">${esc(n.destinatario_nombre || '—')}</small></td>
                  <td><code>${esc(n.destinatario_telefono || '—')}</code></td>
                  <td>
                    <span class="badge ${
                      n.estado === 'enviado' ? 'bg-success' :
                      n.estado === 'entregado' ? 'bg-info text-dark' :
                      n.estado === 'fallido' ? 'bg-danger' :
                      'bg-warning text-dark'
                    }">
                      ${n.estado}
                    </span>
                  </td>
                  <td><small class="text-muted">${n.created_at ? new Date(n.created_at).toLocaleString('es-VE', { hour12: true }) : '—'}</small></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `
  }

  async function loadNotificationHistory() {
    try {
      const historyEl = container.querySelector('#notifications-history')
      if (historyEl) {
        const notifications = await getNotificationStatus(null, 15)
        historyEl.innerHTML = renderNotificationStatus(notifications)
      }
    } catch (err) {
      console.error('[Attendance Alerts] Error loading notification history:', err)
    }
  }

  function attachEvents() {
    // Filtro de días
    container.querySelector('#filter-days')?.addEventListener('change', (e) => {
      state.daysFilter = parseInt(e.target.value)
      loadData()
    })

    // Botones de alerta a representante
    container.querySelectorAll('[data-action="alert-parent"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const studentName = btn.dataset.studentName
        const phone = btn.dataset.studentPhone

        openApprovalModal({
          type: 'parent',
          name: studentName,
          phone: phone,
          message: `Hola representante de ${studentName},\n\nLe informamos que su representado(a) ha registrado inasistencias en sus clases durante este período. Le invitamos a estar al tanto del cumplimiento académico.\n\nAtentamente,\nEquipo Académico SOI 🎵`,
        })
      })
    })

    // Botones de recordatorio a maestro
    container.querySelectorAll('[data-action="remind-teacher"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const teacherName = btn.dataset.teacherName
        const phone = btn.dataset.teacherPhone
        const grupo = btn.dataset.grupo
        const fecha = btn.dataset.fecha

        openApprovalModal({
          type: 'teacher',
          name: teacherName,
          phone: phone,
          message: `Buenos días, estimado Prof. ${teacherName},\n\nLe recordamos cordialmente que tiene pendiente registrar la asistencia del grupo "${grupo}" correspondiente al ${formatDate(fecha)}.\n\nPor favor, complete el registro en el portal SOI cuando tenga disponibilidad.\n\n¡Muchas gracias! 🎵`,
        })
      })
    })

    // Cargar historial de notificaciones
    loadNotificationHistory()
  }

  async function openApprovalModal(data) {
    // PASO 1: Validar teléfono
    if (!isValidWhatsAppNumber(data.phone)) {
      const errorModal = new AppModal({
        title: '⚠️ Número Inválido',
        body: `<div class="alert alert-warning">
          <p>El número <strong>${esc(data.phone)}</strong> no es válido para WhatsApp.</p>
          <p class="mb-0"><small>Formato esperado: <code>+58414XXXXXXX</code> o <code>0414XXXXXXX</code></small></p>
        </div>`,
      })
      errorModal.show()
      return
    }

    // PASO 2: Verificar no hay alerta duplicada
    const tipoNotif = data.type === 'parent' ? 'alerta_asistencia_alumno' : 'recordatorio_asistencia_maestro'
    const existing = await checkExistingAlert(data.phone, tipoNotif, 120)
    if (existing) {
      const duplicateModal = new AppModal({
        title: '⏳ Alerta Reciente Detectada',
        body: `<div class="alert alert-info">
          <p>Ya existe una alerta pendiente para este ${data.type === 'parent' ? 'representante' : 'maestro'}.</p>
          <p class="mb-0"><small class="text-muted">Encolada previamente: ${new Date(existing.created_at).toLocaleString('es-VE')}</small></p>
        </div>`,
      })
      duplicateModal.show()
      return
    }

    // PASO 3: Mostrar modal de aprobación
    const modal = new AppModal({
      title: data.type === 'parent' ? '🔔 Alertar Representante' : '🔔 Recordar Maestro',
      body: `
        <div class="modal-body p-0">
          <div class="alert alert-info mb-3">
            <strong>${data.type === 'parent' ? 'Representante' : 'Maestro'}:</strong> ${esc(data.name)}<br>
            <strong>Teléfono WhatsApp:</strong> <code>${esc(data.phone)}</code>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">Mensaje a Enviar:</label>
            <div class="p-3 bg-light rounded border border-secondary-subtle" style="min-height: 110px; white-space: pre-wrap; font-size: 0.9rem;">
              ${esc(data.message)}
            </div>
          </div>

          <div class="alert alert-light border-1 mb-0 py-2">
            <small class="text-muted">
              <i class="bi bi-info-circle me-1"></i>
              La notificación se registrará en el sistema y quedará en cola para su procesamiento.
            </small>
          </div>
        </div>
      `,
      footer: `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-success" id="btn-send-whatsapp">
          <i class="bi bi-whatsapp me-1"></i>Enviar por WhatsApp
        </button>
      `,
      onShow: () => {
        const sendBtn = document.getElementById('btn-send-whatsapp')
        if (sendBtn) {
          sendBtn.addEventListener('click', async () => {
            modal.hide()
            await sendWhatsAppMessage(data)
          })
        }
      },
    })

    modal.show()
  }

  async function sendWhatsAppMessage(data) {
    try {
      let result
      if (data.type === 'parent') {
        result = await sendWhatsAppAlert({
          recipient_phone: data.phone,
          recipient_name: data.name,
          message: data.message,
          tipo: 'alerta_asistencia_alumno',
        })
      } else if (data.type === 'teacher') {
        result = await sendWhatsAppReminder({
          recipient_phone: data.phone,
          recipient_name: data.name,
          message: data.message,
          tipo: 'recordatorio_asistencia_maestro',
        })
      }

      if (!result || !result.success) {
        throw new Error(result?.message || 'Error desconocido al procesar la notificación')
      }

      const successModal = new AppModal({
        title: '✅ Notificación Encolada',
        body: `<div class="alert alert-success">
          <p class="mb-1"><strong>${esc(data.name)}</strong> recibirá la notificación vía WhatsApp.</p>
          <p class="mb-2"><small>ID de Registro: <code>${result.id || 'procesado'}</code></small></p>
          <p class="mb-0"><small class="text-muted">
            <i class="bi bi-check-circle me-1"></i>
            Estado: <strong>Pendiente</strong> → Procesamiento HERMES
          </small></p>
        </div>`,
      })
      successModal.show()

      // Actualizar datos e historial
      await loadNotificationHistory()
      setTimeout(() => loadData(), 1500)
    } catch (err) {
      console.error('[Attendance Alerts] Error sending message:', err)
      const errorModal = new AppModal({
        title: '❌ Error al Procesar',
        body: `<div class="alert alert-danger">
          <p class="mb-1"><strong>No se pudo procesar la notificación:</strong></p>
          <p class="mb-0"><small>${esc(err.message)}</small></p>
        </div>`,
      })
      errorModal.show()
    }
  }

  // Inicializar
  loadData()

  return {
    destroy() {
      if (container) container.innerHTML = ''
    },
  }
}
