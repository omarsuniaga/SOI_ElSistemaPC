import { AppModal } from '../../../shared/components/AppModal.js'
import { obtenerAlumnos } from '../../alumnos/api/alumnosApi.js'
import { obtenerClases, obtenerProgresos, getPromedioAlumno } from '../../progresos/api/progresosApi.js'
import { supabase } from '../../../lib/supabaseClient.js'
import { callGroq } from '../../../portal-maestros/services/groqService.js'
import { AppToast } from '../../../shared/components/AppToast.js'

const templatesReporte = [
  { id: 'rpt_master', nombre: 'Analítica Crítica Institucional', descripcion: 'Visión 360°: Cruce de asistencia, rendimiento y gestión docente con IA', frecuencia: 'mensual', tipo: 'global', icon: 'bi-shield-shaded' },
  { id: 'rpt_003', nombre: 'Reporte de Alumnos en Riesgo', descripcion: 'Detección automática de bajo rendimiento y ausentismo con IA', frecuencia: 'semanal', tipo: 'riesgo', icon: 'bi-exclamation-triangle' },
  { id: 'rpt_002', nombre: 'Boletín de Progreso General', descripcion: 'Resumen de calificaciones y evolución por programa', frecuencia: 'mensual', tipo: 'progreso', icon: 'bi-graph-up' },
  { id: 'rpt_001', nombre: 'Análisis de Asistencia Crítica', descripcion: 'Identificación de patrones de deserción y faltas injustificadas', frecuencia: 'semanal', tipo: 'asistencia', icon: 'bi-calendar-check' },
]

const state = {
  reportes: [],
  programada: false,
}

export async function renderIaReporteGeneradorView(container) {
  state.reportes = [...templatesReporte]
  _render(container)
  _bindEvents(container)
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
                <input type="time" class="form-control form-control-sm" value="08:00" style="width: 100px;">
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
        ${state.reportes.map(r => _renderReporteCard(r)).join('')}
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
                  ${state.reportes.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('')}
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
  const freqColor = { diaria: 'danger', semanal: 'warning', mensual: 'info' }[r.frecuencia] || 'secondary'

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
            <span class="badge bg-${freqColor} bg-opacity-10 text-${freqColor}" style="font-size: 0.7rem;">${r.frecuencia}</span>
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
  container.querySelector('#btnNuevoReporte')?.addEventListener('click', () => _nuevoReporte(container))

  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id
      if (btn.dataset.action === 'generar') _generarReporte(id)
      else if (btn.dataset.action === 'editar') _editarReporte(id, container)
    })
  })

  container.querySelector('#btnGenerarAhora')?.addEventListener('click', () => _generarReporteManual(container))
  container.querySelector('#btnEnviarEmail')?.addEventListener('click', () => _enviarEmail(container))
  container.querySelector('#programacionActiva')?.addEventListener('change', (e) => {
    state.programada = e.target.checked
    AppModal.open({
      title: state.programada ? 'Programación Activada' : 'Programación Desactivada',
      body: `<div class="alert alert-${state.programada ? 'success' : 'warning'} mb-0">La generación de reportes está ahora ${state.programada ? 'activa' : 'inactiva'}.</div>`,
      hideSave: true,
      cancelText: 'Cerrar',
    })
  })
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

async function _generarReporte(id) {
  const reporte = state.reportes.find(r => r.id === id)
  if (!reporte) return

  AppModal.showLoading(`Analizando datos para: ${reporte.nombre}...`)

  try {
    // 1. Recolectar Datos Base
    const [alumnos, clases, progresos] = await Promise.all([
      obtenerAlumnos(),
      obtenerClases(),
      obtenerProgresos()
    ])

    // 2. Lógica Específica por Tipo
    let contextoIA = ""
    let hallazgos = []

    if (reporte.tipo === 'riesgo') {
      const promedios = await Promise.all(alumnos.map(async (a) => {
        const prom = await getPromedioAlumno(a.id)
        return { ...a, promedio: prom }
      }))

      const alumnosEnRiesgo = promedios.filter(a => a.promedio !== null && a.promedio < 3.0)
      hallazgos = alumnosEnRiesgo.map(a => ({ nombre: a.nombre, valor: a.promedio, unidad: 'Promedio' }))

      contextoIA = `
        Se han detectado ${alumnosEnRiesgo.length} alumnos con promedio menor a 3.0 de un total de ${alumnos.length} inscritos.
        Detalle de alumnos críticos:
        ${alumnosEnRiesgo.map(a => `- ${a.nombre}: Promedio ${a.promedio}`).join('\n')}
        
        Por favor, genera un análisis ejecutivo para la dirección escolar, identificando posibles causas generales y sugiriendo un plan de intervención pedagógica.
      `
    } else if (reporte.tipo === 'asistencia') {
      const { data: sesiones, error } = await supabase
        .from('sesiones_clase')
        .select('asistencia')
        .eq('borrador', false)

      if (error) throw error

      const asistenciasMap = {}
      sesiones.forEach(s => {
        const list = s.asistencia || []
        list.forEach(record => {
          if (!asistenciasMap[record.alumno_id]) {
            asistenciasMap[record.alumno_id] = { total: 0, presentes: 0 }
          }
          asistenciasMap[record.alumno_id].total++
          if (record.estado === 'presente') asistenciasMap[record.alumno_id].presentes++
        })
      })

      const reporteAsistencia = alumnos.map(a => {
        const stats = asistenciasMap[a.id] || { total: 0, presentes: 0 }
        const porcentaje = stats.total > 0 ? Math.round((stats.presentes / stats.total) * 100) : 100
        return { ...a, asistenciaPct: porcentaje }
      })

      const criticos = reporteAsistencia.filter(a => a.asistenciaPct < 80)
      hallazgos = criticos.map(a => ({ nombre: a.nombre, valor: a.asistenciaPct + '%', unidad: 'Asistencia' }))

      contextoIA = `
        Reporte de Asistencia Crítica (Menos del 80%).
        Se han detectado ${criticos.length} alumnos en riesgo de deserción o falta de compromiso.
        Detalle de alumnos con baja asistencia:
        ${criticos.map(a => `- ${a.nombre}: ${a.asistenciaPct}% de asistencia`).join('\n')}
        
        Analiza estos datos y sugiere estrategias de retención y comunicación con los representantes.
      `
    } else if (reporte.tipo === 'global') {
      const [sesiones, maestros] = await Promise.all([
        supabase.from('sesiones_clase').select('asistencia').eq('borrador', false),
        supabase.from('maestros').select('nombre_completo, especialidad')
      ])

      const totalSesiones = sesiones.data?.length || 0
      const promedioGral = progresos.length > 0 
        ? (progresos.reduce((acc, p) => acc + (p.calificacion || 0), 0) / progresos.length).toFixed(2)
        : 'N/A'

      contextoIA = `
        ANÁLISIS GLOBAL DE LA INSTITUCIÓN.
        - Total Estudiantes: ${alumnos.length}
        - Total Clases: ${clases.length}
        - Total Maestros: ${maestros.data?.length || 0}
        - Promedio Académico General: ${promedioGral}
        - Sesiones de clase registradas: ${totalSesiones}
        
        Realiza un diagnóstico profundo de la salud académica de la institución. Identifica fortalezas basadas en el volumen de datos y debilidades si el promedio o la asistencia muestran alarmas. Proyecta los resultados para el próximo período. Genera conclusiones críticas para la toma de decisiones.
      `
      hallazgos = [
        { nombre: 'Promedio Institucional', valor: promedioGral, unidad: 'Puntos' },
        { nombre: 'Cobertura de Clases', valor: totalSesiones, unidad: 'Sesiones' },
        { nombre: 'Población Estudiantil', valor: alumnos.length, unidad: 'Alumnos' }
      ]
    } else {
      contextoIA = `Genera un resumen ejecutivo para un reporte de tipo ${reporte.tipo} basado en ${alumnos.length} alumnos y ${clases.length} clases activas.`
    }

    // 3. Llamada a la IA
    const prompt = `Actúa como un Coordinador Académico Senior. Basado en los siguientes datos reales del sistema SOI:\n${contextoIA}\n\nGenera el reporte en formato Markdown, con secciones claras: # Resumen Ejecutivo, ## Hallazgos Clave, y ## Recomendaciones.`
    
    const respuestaIA = await callGroq([
      { role: 'system', content: 'Eres un experto en gestión educativa y análisis de datos académicos.' },
      { role: 'user', content: prompt }
    ])

    AppModal.close()

    // 4. Mostrar Resultado Premium con PDF Real
    AppModal.open({
      title: `<i class="bi bi-stars text-primary me-2"></i>Análisis de IA: ${reporte.nombre}`,
      size: 'lg',
      saveText: '<i class="bi bi-file-earmark-pdf me-2"></i>Exportar PDF',
      body: `
        <div class="reporte-preview p-3">
          <div class="mb-4 bg-light p-3 rounded border-start border-primary border-4">
            <h6 class="fw-bold mb-1"><i class="bi bi-info-circle me-2"></i>Resumen de Datos Analizados</h6>
            <p class="small text-muted mb-0">Se procesaron registros de ${alumnos.length} estudiantes y ${progresos.length} evaluaciones recientes.</p>
          </div>
          
          <div class="ia-content markdown-body mb-4">
            ${_formatMarkdown(respuestaIA)}
          </div>

          ${hallazgos.length > 0 ? `
            <div class="mt-4">
              <h6 class="fw-bold mb-3">Métricas e Indicadores Identificados</h6>
              <div class="table-responsive">
                <table class="table table-sm table-hover border">
                  <thead class="table-light">
                    <tr>
                      <th>Indicador / Estudiante</th>
                      <th class="text-center">Valor</th>
                      <th class="text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${hallazgos.map(a => `
                      <tr>
                        <td>${a.nombre}</td>
                        <td class="text-center fw-bold text-danger">${a.valor} <small class="text-muted fw-normal">${a.unidad}</small></td>
                        <td class="text-center"><span class="badge bg-danger bg-opacity-10 text-danger">Revisión</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}
        </div>
      `,
      onSave: async () => {
        _exportarPDF(reporte.nombre, respuestaIA, hallazgos)
        return false
      }
    })

  } catch (err) {
    console.error(err)
    AppModal.close()
    AppToast.error('Error al generar el análisis: ' + err.message)
  }
}

function _formatMarkdown(text) {
  return text
    .replace(/^### (.*$)/gim, '<h5 class="fw-bold mt-4 mb-2">$1</h5>')
    .replace(/^## (.*$)/gim, '<h4 class="fw-bold mt-4 mb-2 border-bottom pb-1">$1</h4>')
    .replace(/^# (.*$)/gim, '<h3 class="fw-bold mb-3 text-primary">$1</h3>')
    .replace(/^\* (.*$)/gim, '<li class="ms-3 mb-1">$1</li>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
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
    .filter(line => line.trim() !== '')

  let currentY = 65
  textContent.forEach(line => {
    const splitText = doc.splitTextToSize(line.trim(), pageWidth - 28)
    if (currentY + (splitText.length * 5) > 280) {
      doc.addPage()
      currentY = 20
    }
    doc.text(splitText, 14, currentY)
    currentY += (splitText.length * 5) + 2
  })

  // Tabla de métricas
  if (hallazgos && hallazgos.length > 0) {
    autoTable(doc, {
      startY: currentY + 10,
      head: [['Indicador / Estudiante', 'Valor', 'Unidad']],
      body: hallazgos.map(h => [h.nombre, h.valor, h.unidad]),
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 }
    })
  }

  // Footer con paginación
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Página ${i} de ${pageCount} - Generado por SOI Intelligence`, pageWidth / 2, 290, { align: 'center' })
  }

  doc.save(`Reporte_SOI_${titulo.replace(/\s+/g, '_')}.pdf`)
  AppToast.success('PDF descargado con éxito')
}

function _editarReporte(id, container) {
  const reporte = state.reportes.find(r => r.id === id)
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
      const idx = state.reportes.findIndex(r => r.id === id)
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