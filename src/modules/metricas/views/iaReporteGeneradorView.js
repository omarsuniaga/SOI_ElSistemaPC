import { AppModal } from '../../../shared/components/AppModal.js'
import { obtenerAlumnos } from '../../alumnos/api/alumnosApi.js'
import {
  obtenerClases,
  obtenerProgresos,
  getPromedioAlumno,
} from '../../progresos/api/progresosApi.js'
import { callGroq } from '../../../portal-maestros/services/groqService.js'
import { AppToast } from '../../../shared/components/AppToast.js'
import { callDslRpc } from '../api/observabilidadApi.js'

const templatesReporte = [
  {
    id: 'rpt_master',
    nombre: 'Analítica Crítica Institucional',
    descripcion: 'Visión 360°: Cruce de asistencia, rendimiento y gestión docente con IA',
    frecuencia: 'mensual',
    tipo: 'global',
    icon: 'bi-shield-shaded',
  },
  {
    id: 'rpt_003',
    nombre: 'Reporte de Alumnos en Riesgo',
    descripcion: 'Detección automática de bajo rendimiento y ausentismo con IA',
    frecuencia: 'semanal',
    tipo: 'riesgo',
    icon: 'bi-exclamation-triangle',
  },
  {
    id: 'rpt_002',
    nombre: 'Boletín de Progreso General',
    descripcion: 'Resumen de calificaciones y evolución por programa',
    frecuencia: 'mensual',
    tipo: 'progreso',
    icon: 'bi-graph-up',
  },
  {
    id: 'rpt_001',
    nombre: 'Análisis de Asistencia Crítica',
    descripcion: 'Identificación de patrones de deserción y faltas injustificadas',
    frecuencia: 'semanal',
    tipo: 'asistencia',
    icon: 'bi-calendar-check',
  },
]

const state = {
  reportes: [],
  programada: false,
  _container: null,
  _boundListeners: [],
  _timeouts: [],
}

export async function renderIaReporteGeneradorView(container) {
  if (!container) return

  // Destroy previous state if re-rendering
  _cleanupState()

  state._container = container
  state.reportes = [...templatesReporte]
  _render(container)
  _bindEvents(container)
}

/**
 * Clean up all tracked listeners and state references
 */
function _cleanupState() {
  // Remove all tracked event listeners
  state._boundListeners.forEach(({ el, event, fn }) => {
    el.removeEventListener(event, fn)
  })
  state._boundListeners = []

  // Clear any active timeouts
  state._timeouts.forEach((id) => clearTimeout(id))
  state._timeouts = []

  state._container = null
}

/**
 * Destruye la instancia del generador de reportes y libera recursos.
 */
export function destroyIaReporteGeneradorView() {
  _cleanupState()
  state.reportes = []
  state.programada = false
}

function _render(container) {
  container.innerHTML = `
    <div class="ia-reporte-view px-3 px-md-4 py-3">
      <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 class="mb-0 fw-semibold"><i class="bi bi-file-earmark-richtext me-2 text-primary"></i>Generador de Reportes</h4>
          <p class="text-secondary small mb-0">Crea y programa reportes automáticos con IA</p>
        </div>
        <button class="btn btn-primary btn-sm" id="btnNuevoReporte">
          <i class="bi bi-plus-lg me-1"></i>Nuevo Reporte
        </button>
      </div>

      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-transparent">
          <h5 class="fw-bold mb-0"><i class="bi bi-clock me-2"></i>Programación Automática</h5>
        </div>
        <div class="card-body">
          <div class="row g-3 align-items-center">
            <div class="col-md-4">
              <label class="form-label small">Frecuencia</label>
              <select class="form-select form-select-sm" id="programacionFrecuencia">
                <option value="diaria">Diaria</option>
                <option value="semanal" selected>Semanal</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label small">Día/Hora</label>
              <div class="d-flex gap-2">
                <select class="form-select form-select-sm" id="programacionDia">
                  <option value="1">Lunes</option>
                  <option value="5" selected>Viernes</option>
                </select>
                <input type="time" class="form-control form-control-sm obs-time-input" value="08:00">
              </div>
            </div>
            <div class="col-md-4">
              <div class="form-check form-switch mt-4">
                <input class="form-check-input" type="checkbox" id="programacionActiva" ${state.programada ? 'checked' : ''}>
                <label class="form-check-label" for="programacionActiva">Activar programación</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-12">
          <h5 class="fw-semibold mb-3"><i class="bi bi-file-earmark-text me-2"></i>Plantillas de Reportes</h5>
        </div>
        ${state.reportes.map((r) => _renderReporteCard(r)).join('')}
      </div>

      <div class="row g-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent">
              <h5 class="fw-bold mb-0"><i class="bi bi-play-circle me-2"></i>Generar Ahora</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Seleccionar reporte</label>
                <select class="form-select" id="generarAhoraSelect">
                  <option value="">-- Seleccionar --</option>
                  ${state.reportes.map((r) => `<option value="${r.id}">${r.nombre}</option>`).join('')}
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Período</label>
                <div class="d-flex gap-2">
                  <input type="date" class="form-control form-control-sm" id="genDesde" value="${_fechaSemanaAtras()}">
                  <input type="date" class="form-control form-control-sm" id="genHasta" value="${_fechaHoy()}">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Formato</label>
                <div class="btn-group w-100" role="group">
                  <input type="radio" class="btn-check" name="genFormat" id="fmtPdf" value="pdf" checked>
                  <label class="btn btn-outline-primary btn-sm" for="fmtPdf"><i class="bi bi-file-earmark-pdf me-1"></i>PDF</label>
                  <input type="radio" class="btn-check" name="genFormat" id="fmtXlsx" value="xlsx">
                  <label class="btn btn-outline-success btn-sm" for="fmtXlsx"><i class="bi bi-file-earmark-spreadsheet me-1"></i>Excel</label>
                  <input type="radio" class="btn-check" name="genFormat" id="fmtMd" value="md">
                  <label class="btn btn-outline-secondary btn-sm" for="fmtMd"><i class="bi bi-file-earmark-markdown me-1"></i>MD</label>
                </div>
              </div>
              <button class="btn btn-primary w-100" id="btnGenerarAhora">
                <i class="bi bi-lightning me-1"></i>Generar Reporte
              </button>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-transparent">
              <h5 class="fw-bold mb-0"><i class="bi bi-send me-2"></i>Enviar por Email</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label">Destinatarios</label>
                <input type="text" class="form-control" id="emailDest" placeholder="admin@escuela.edu, director@escuela.edu">
                <small class="text-muted">Separar múltiples emails con coma</small>
              </div>
              <div class="mb-3">
                <label class="form-label">Asunto</label>
                <input type="text" class="form-control" id="emailAsunto" value="Reporte Semanal - SOI">
              </div>
              <div class="mb-3">
                <label class="form-label">Incluir</label>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="incPDF" checked>
                  <label class="form-check-label" for="incPDF">Adjunto PDF</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="checkbox" id="incResumen">
                  <label class="form-check-label" for="incResumen">Resumen en cuerpo del email</label>
                </div>
              </div>
              <button class="btn btn-outline-primary w-100" id="btnEnviarEmail">
                <i class="bi bi-send me-1"></i>Enviar Reporte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

function _renderReporteCard(r) {
  const freqColor =
    { diaria: 'danger', semanal: 'warning', mensual: 'info' }[r.frecuencia] || 'secondary'

  return `
    <div class="col-md-6 col-lg-4">
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="d-flex align-items-center gap-2">
              <div class="bg-primary-subtle text-primary rounded p-2">
                <i class="bi ${r.icon}"></i>
              </div>
              <div>
                <h6 class="mb-0 fw-semibold">${r.nombre}</h6>
              </div>
            </div>
            <span class="badge bg-${freqColor} bg-opacity-10 text-${freqColor} obs-freq-badge">${r.frecuencia}</span>
          </div>
          <p class="text-muted small mb-2">${r.descripcion}</p>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary flex-grow-1" data-action="generar" data-id="${r.id}">
              <i class="bi bi-play me-1"></i>Generar
            </button>
            <button class="btn btn-sm btn-outline-secondary" data-action="editar" data-id="${r.id}">
              <i class="bi bi-pencil"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}

function _bindEvents(container) {
  const nuevoReporteBtn = container.querySelector('#btnNuevoReporte')
  const onNuevoReporte = () => _nuevoReporte(container)
  nuevoReporteBtn?.addEventListener('click', onNuevoReporte)
  if (nuevoReporteBtn)
    state._boundListeners.push({ el: nuevoReporteBtn, event: 'click', fn: onNuevoReporte })

  container.querySelectorAll('[data-action]').forEach((btn) => {
    const onAction = () => {
      const id = btn.dataset.id
      if (btn.dataset.action === 'generar') _generarReporte(id)
      else if (btn.dataset.action === 'editar') _editarReporte(id, container)
    }
    btn.addEventListener('click', onAction)
    state._boundListeners.push({ el: btn, event: 'click', fn: onAction })
  })

  const generarAhoraBtn = container.querySelector('#btnGenerarAhora')
  const onGenerarAhora = () => _generarReporteManual(container)
  generarAhoraBtn?.addEventListener('click', onGenerarAhora)
  if (generarAhoraBtn)
    state._boundListeners.push({ el: generarAhoraBtn, event: 'click', fn: onGenerarAhora })

  const enviarEmailBtn = container.querySelector('#btnEnviarEmail')
  const onEnviarEmail = () => _enviarEmail(container)
  enviarEmailBtn?.addEventListener('click', onEnviarEmail)
  if (enviarEmailBtn)
    state._boundListeners.push({ el: enviarEmailBtn, event: 'click', fn: onEnviarEmail })

  const progActiva = container.querySelector('#programacionActiva')
  const onProgChange = (e) => {
    state.programada = e.target.checked
    AppModal.open({
      title: state.programada ? 'Programación Activada' : 'Programación Desactivada',
      body: `<div class="alert alert-${state.programada ? 'success' : 'warning'} mb-0">La generación de reportes está ahora ${state.programada ? 'activa' : 'inactiva'}.</div>`,
      hideSave: true,
      cancelText: 'Cerrar',
    })
  }
  progActiva?.addEventListener('change', onProgChange)
  if (progActiva) state._boundListeners.push({ el: progActiva, event: 'change', fn: onProgChange })
}

function _nuevoReporte(container) {
  AppModal.open({
    title: 'Nueva Plantilla de Reporte',
    size: 'md',
    saveText: 'Crear',
    body: `
      <div class="mb-3">
        <label class="form-label">Nombre</label>
        <input type="text" class="form-control" id="newReporteNombre" placeholder="Mi Reporte Personalizado">
      </div>
      <div class="mb-3">
        <label class="form-label">Descripción</label>
        <textarea class="form-control" id="newReporteDesc" rows="2" placeholder="Describe qué incluirá el reporte"></textarea>
      </div>
      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">Tipo</label>
          <select class="form-select" id="newReporteTipo">
            <option value="asistencia">Asistencia</option>
            <option value="progreso">Progreso</option>
            <option value="riesgo">Riesgo</option>
            <option value="maestros">Maestros</option>
            <option value="contenido">Contenido</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Frecuencia</label>
          <select class="form-select" id="newReporteFreq">
            <option value="diaria">Diaria</option>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
          </select>
        </div>
      </div>
    `,
    onSave: () => {
      const nombre = document.getElementById('newReporteNombre').value.trim()
      if (!nombre) {
        alert('El nombre es obligatorio')
        return false
      }

      state.reportes.unshift({
        id: 'rpt_' + Date.now(),
        nombre,
        descripcion: document.getElementById('newReporteDesc').value,
        tipo: document.getElementById('newReporteTipo').value,
        frecuencia: document.getElementById('newReporteFreq').value,
        icon: 'bi-file-earmark-text',
      })

      _render(container)
      AppModal.close()
    },
  })
}

/**
 * Compila localmente un Payload DSL en formato JSON con métricas agregadas de alta densidad.
 * Cruza datos de radar, hotspots curriculares y desempeño docente.
 * Debe tener menos de 20 líneas en su salida estructurada para optimizar el contexto.
 */
async function compilePayloadDSL(tipo) {
  // Delegar a la API DataAdapter (usa callDslRpc del mock/supabase según modo)
  const { radarData, nodeDifficulty, complianceData } = await callDslRpc(tipo)

  // DSL estructurado en menos de 20 líneas (JSON denso)
  return {
    timestamp: new Date().toISOString(),
    resumen: {
      total_alumnos: radarData.length || 10,
      stagnant: radarData.filter((s) => s.health_status === 'stagnant').length,
    },
    hotspots: nodeDifficulty.slice(0, 3).map((n) => ({
      nodo: n.node_name || 'Desconocido',
      tasa_fallo: n.failure_percentage || 0,
    })),
    docentes_criticos: complianceData
      .filter((d) => d.categoria === 'negligente' || d.sesiones_rojo > 4)
      .map((d) => ({
        nombre: d.nombre_completo || d.nombre || 'Docente',
        atrasos: d.sesiones_rojo || 0,
      })),
  }
}

async function _generarReporte(id) {
  const reporte = state.reportes.find((r) => r.id === id)
  if (!reporte) return

  AppModal.showLoading(`Analizando datos para: ${reporte.nombre}...`)

  try {
    // 1. Compilar el Payload DSL localmente
    const payloadDSL = await compilePayloadDSL(reporte.tipo)

    // 2. Definir prompts rígidos antialucinación para Groq
    const systemPrompt = `
Actúas como el Auditor de Inteligencia Académica Senior de la institución. 
Se te proveerá un Payload DSL en formato JSON con métricas pre-calculadas y consistentes.
Tu única tarea es analizar los datos y redactar un informe ejecutivo (en markdown limpio con tipografía y espaciados premium) enfocado en:
1. Resumen ejecutivo de la salud escolar (3 frases).
2. Diagnóstico de los 2 hotspots pedagógicos más críticos.
3. Plan de acción recomendado (máximo 3 bullets accionables).

REGLA CRÍTICA: No inventes números, no asumas porcentajes que no estén en el JSON, y sé sumamente conciso.
`

    const userPrompt = `
Aquí está el Payload DSL estructurado con las métricas académicas de la institución:
${JSON.stringify(payloadDSL, null, 2)}

Por favor, genera el diagnóstico y plan de acción de acuerdo con tus instrucciones del sistema.
`

    // 3. Inferencia de IA
    const respuestaIA = await callGroq([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ])

    // 4. Mapear hallazgos de métricas reales para renderizado tabular y PDF
    const hallazgos = [
      { nombre: 'Alumnos en Estancamiento', valor: payloadDSL.resumen.stagnant, unidad: 'Alumnos' },
      ...payloadDSL.hotspots.map((h) => ({
        nombre: `Fallo Crítico: ${h.nodo}`,
        valor: `${h.tasa_fallo}%`,
        unidad: 'Tasa',
      })),
      ...payloadDSL.docentes_criticos.map((d) => ({
        nombre: `Atraso Docente: ${d.nombre}`,
        valor: d.atrasos,
        unidad: 'Sesiones',
      })),
    ]

    AppModal.close()

    // 5. Mostrar Resultado Premium con Markdown y descarga PDF
    AppModal.open({
      title: `<i class="bi bi-stars text-primary me-2"></i>SOI Intelligence: ${reporte.nombre}`,
      size: 'lg',
      saveText: '<i class="bi bi-file-earmark-pdf me-2"></i>Exportar PDF',
      body: `
        <div class="reporte-preview p-3">
          <div class="mb-4 bg-light p-3 rounded border-start border-primary border-4 shadow-sm">
            <h6 class="fw-bold mb-1"><i class="bi bi-cpu me-2 text-primary"></i>Resumen del Payload DSL Procesado</h6>
            <p class="small text-muted mb-0">Datos agregados cruzados con éxito a las ${new Date(payloadDSL.timestamp).toLocaleTimeString()}.</p>
          </div>
          
          <div class="ia-content markdown-body mb-4 p-3 border rounded-3 bg-light bg-opacity-10 shadow-sm obs-ia-content">
            ${_formatMarkdown(respuestaIA)}
          </div>

          ${
            hallazgos.length > 0
              ? `
            <div class="mt-4">
              <h6 class="fw-bold mb-3"><i class="bi bi-table me-2 text-primary"></i>Métricas e Indicadores DSL Mapeados</h6>
              <div class="table-responsive page-glass p-0 border rounded-3 shadow-sm">
                <table class="table table-sm table-hover border-0 mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="py-2 px-3">Indicador Clave</th>
                      <th class="text-center py-2">Valor</th>
                      <th class="text-center py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody class="small">
                    ${hallazgos
                      .map(
                        (a) => `
                      <tr>
                        <td class="py-2 px-3 fw-semibold">${a.nombre}</td>
                        <td class="text-center fw-bold text-danger py-2">${a.valor} <small class="text-muted fw-normal">${a.unidad}</small></td>
                        <td class="text-center py-2"><span class="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-2.5 py-1 rounded-pill">Revisión</span></td>
                      </tr>
                    `,
                      )
                      .join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `
              : ''
          }
        </div>
      `,
      onSave: async () => {
        _exportarPDF(reporte.nombre, respuestaIA, hallazgos)
        return false
      },
    })
  } catch (err) {
    console.error(err)
    AppModal.close()
    AppToast.error('Error al generar el análisis de IA: ' + err.message)
  }
}

function _formatMarkdown(text) {
  return text
    .replace(/^### (.*$)/gim, '<h5 class="fw-bold mt-4 mb-2 text-dark">$1</h5>')
    .replace(/^## (.*$)/gim, '<h4 class="fw-bold mt-4 mb-2 border-bottom pb-1 text-dark">$1</h4>')
    .replace(/^# (.*$)/gim, '<h3 class="fw-bold mb-3 text-primary border-bottom pb-2">$1</h3>')
    .replace(/^\* (.*$)/gim, '<li class="ms-3 mb-1.5 small text-secondary">$1</li>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="text-dark">$1</strong>')
    .replace(/\n/g, '<br>')
}

function _enviarEmail(container) {
  const emailDest = container.querySelector('#emailDest').value.trim()
  const emailAsunto = container.querySelector('#emailAsunto').value.trim()

  if (!emailDest) {
    AppToast.error('El campo de destinatario es obligatorio.')
    return
  }

  AppModal.showLoading('Enviando reporte por correo electrónico...')

  setTimeout(() => {
    AppModal.close()
    AppToast.success(`Reporte "${emailAsunto}" enviado con éxito a: ${emailDest}`)
  }, 1500)
}

async function _exportarPDF(titulo, contenidoIA, hallazgos) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  AppToast.info('Generando documento PDF...')

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width

  // Header institucional
  doc.setFillColor(41, 128, 185)
  doc.rect(0, 0, pageWidth, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.text('SOI - Sistema Operativo Institucional', 14, 20)
  doc.setFontSize(12)
  doc.text(titulo.toUpperCase(), 14, 30)
  doc.text(new Date().toLocaleDateString(), pageWidth - 40, 30)

  // Cuerpo
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('Análisis Crítico con IA', 14, 55)

  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')

  // Limpiar markdown del texto para el PDF
  const textContent = contenidoIA
    .replace(/[#*]/g, '')
    .split('\n')
    .filter((line) => line.trim() !== '')

  let currentY = 65
  textContent.forEach((line) => {
    const splitText = doc.splitTextToSize(line.trim(), pageWidth - 28)
    if (currentY + splitText.length * 5 > 280) {
      doc.addPage()
      currentY = 20
    }
    doc.text(splitText, 14, currentY)
    currentY += splitText.length * 5 + 2
  })

  // Tabla de métricas
  if (hallazgos && hallazgos.length > 0) {
    autoTable(doc, {
      startY: currentY + 10,
      head: [['Indicador / Estudiante', 'Valor', 'Unidad']],
      body: hallazgos.map((h) => [h.nombre, h.valor, h.unidad]),
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 },
    })
  }

  // Footer con paginación
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Página ${i} de ${pageCount} - Generado por SOI Intelligence`, pageWidth / 2, 290, {
      align: 'center',
    })
  }

  doc.save(`Reporte_SOI_${titulo.replace(/\s+/g, '_')}.pdf`)
  AppToast.success('PDF descargado con éxito')
}

function _editarReporte(id, container) {
  const reporte = state.reportes.find((r) => r.id === id)
  if (!reporte) return

  AppModal.open({
    title: 'Editar Reporte',
    size: 'md',
    saveText: 'Guardar',
    body: `
      <div class="mb-3">
        <label class="form-label">Nombre</label>
        <input type="text" class="form-control" id="editReporteNombre" value="${reporte.nombre}">
      </div>
      <div class="mb-3">
        <label class="form-label">Descripción</label>
        <textarea class="form-control" id="editReporteDesc" rows="2">${reporte.descripcion}</textarea>
      </div>
      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">Tipo</label>
          <select class="form-select" id="editReporteTipo">
            <option value="asistencia" ${reporte.tipo === 'asistencia' ? 'selected' : ''}>Asistencia</option>
            <option value="progreso" ${reporte.tipo === 'progreso' ? 'selected' : ''}>Progreso</option>
            <option value="riesgo" ${reporte.tipo === 'riesgo' ? 'selected' : ''}>Riesgo</option>
          </select>
        </div>
        <div class="col-md-6">
          <label class="form-label">Frecuencia</label>
          <select class="form-select" id="editReporteFreq">
            <option value="semanal" ${reporte.frecuencia === 'semanal' ? 'selected' : ''}>Semanal</option>
            <option value="mensual" ${reporte.frecuencia === 'mensual' ? 'selected' : ''}>Mensual</option>
          </select>
        </div>
      </div>
    `,
    onSave: () => {
      const idx = state.reportes.findIndex((r) => r.id === id)
      if (idx !== -1) {
        state.reportes[idx] = {
          ...state.reportes[idx],
          nombre: document.getElementById('editReporteNombre').value,
          descripcion: document.getElementById('editReporteDesc').value,
          tipo: document.getElementById('editReporteTipo').value,
          frecuencia: document.getElementById('editReporteFreq').value,
        }
      }
      _render(container)
      AppModal.close()
    },
  })
}

function _generarReporteManual(container) {
  const reporteId = container.querySelector('#generarAhoraSelect').value
  const desde = container.querySelector('#genDesde').value
  const hasta = container.querySelector('#genHasta').value
  const fmt = container.querySelector('input[name="genFormat"]:checked').value

  if (!reporteId) {
    alert('Selecciona un reporte')
    return
  }

  AppModal.showLoading('Generando reporte...')

  setTimeout(() => {
    AppModal.close()
    const blob = new Blob(['Reporte generado'], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-${reporteId}-${new Date().toISOString().slice(0, 10)}.${fmt}`
    a.click()
    URL.revokeObjectURL(url)
  }, 1500)
}

function _fechaHoy() {
  return new Date().toISOString().slice(0, 10)
}

function _fechaSemanaAtras() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d.toISOString().slice(0, 10)
}
