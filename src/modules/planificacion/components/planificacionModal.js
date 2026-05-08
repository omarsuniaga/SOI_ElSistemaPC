import { AppModal } from '../../../shared/components/AppModal.js'
import { Planificacion } from '../models/planificacion.model.js'
import { createDslEditorWithToolbar } from './dslToolbar.js'
import { createAlumnoPickerModal } from './alumnoPickerModal.js'
import { getAlumnos } from '../../alumnos/api/alumnosApi.js'

export const PLANTILLAS_PLANIFICACION = [
  {
    id: 'tecnica',
    nombre: 'Técnica',
    objetivos: 'Desarrollar la técnica instrumental del alumno.\n- Postura correcta\n- Digitación\n- Control del tempo\n- Calidad del sonido',
    contenido: 'Ejercicios de técnica:\n1. Escalas mayores y menores\n2. Arpegios\n3. Ejercicios de digitación\n4. Studiess técnicos',
    recursos: 'Método del nivel, estudios técnicos, metrónomo',
    evaluacion_metodo: 'Observación directa, ejecución de escalas sin errores',
  },
  {
    id: 'teoria',
    nombre: 'Teoría Musical',
    objetivos: 'Comprender los fundamentos teóricos de la música.\n- Lectura rítmica\n- Reconocimiento de intervalos\n- Armonía básica\n- Análisis de obras',
    contenido: 'Contenidos:\n1. Teoría musical básica\n2. Lectura a primera vista\n3. Dictado melódico\n4. Análisis armónico',
    recursos: 'Libro de teoría, cuaderno de ejercicios, pizarra',
    evaluacion_metodo: 'Prueba escrita, lectura a primera vista, dictados',
  },
  {
    id: 'repertorio',
    nombre: 'Repertorio',
    objetivos: 'Desarrollar el repertorio musical del alumno.\n- Interpretación de obras\n- Expresión musical\n- Memorización\n- Apresentación en público',
    contenido: 'Obras del programa:\n1. Pieza de repertorio\n2. Ejercicios de interpretación\n3. Trabajo de dinámica y fraseo\n4. Práctica con accompaniment',
    recursos: 'Partituras, grabaciones de referencia, piano acompañante',
    evaluacion_metodo: 'Audición interna, evaluación de interpretación',
  },
  {
    id: 'improvisacion',
    nombre: 'Improvisación',
    objetivos: 'Fomentar la creatividad musical y la improvisación.\n- Exploración sonora\n- Improvisación libre\n- Improvisación estructurada\n- Composición guiada',
    contenido: 'Actividades:\n1. Ejercicios de exploración sonora\n2. Improvisación libre\n3. Improvisación sobre cambios armónicos\n4. Composición guiada',
    recursos: 'Instrumento, pistas de acompañamiento, grabadora',
    evaluacion_metodo: 'Observación de creatividad, coherencia musical',
  },
  {
    id: 'audicion',
    nombre: 'Audición',
    objetivos: 'Desarrollar la capacidad de escuchar y analizar música.\n- Escucha activa\n- Identificación de elementos\n- Análisis formal\n- Reseñas musicales',
    contenido: 'Actividades:\n1. Audición de obras del repertorio\n2. Identificación de instrumentos\n3. Análisis de forma y estructura\n4. Discusión y reseña',
    recursos: 'Audio, videos, partituras de referencia',
    evaluacion_metodo: 'Participación en discusión, trabajo escrito',
  },
  {
    id: 'blanco',
    nombre: 'En blanco',
    objetivos: '',
    contenido: '',
    recursos: '',
    evaluacion_metodo: '',
  },
]

export function openPlanificacionModal(mode, data = null, clases = [], maestros = [], onSave) {
  const isEdit = mode === 'edit' && !!data
  const plan   = isEdit ? new Planificacion(data) : new Planificacion()

  const clasesOptions = clases.length
    ? clases.map(c => `<option value="${c.id}" ${plan.clase_id === c.id ? 'selected' : ''}>${esc(c.nombre || c.id)}</option>`).join('')
    : '<option value="">Sin clases disponibles</option>'

  const maestrosOptions = maestros.length
    ? `<option value="">Sin asignar</option>` + maestros.map(m => `<option value="${m.id}" ${plan.maestro_id === m.id ? 'selected' : ''}>${esc(m.nombre || m.id)}</option>`).join('')
    : '<option value="">Sin maestros disponibles</option>'

  const recursosValue = Array.isArray(plan.recursos) ? plan.recursos.join(', ') : ''

  const templateOptions = PLANTILLAS_PLANIFICACION.map(t => 
    `<option value="${t.id}">${t.nombre}</option>`
  ).join('')

  const body = `
    <form id="formPlanificacion" class="row g-3" novalidate>
      ${!isEdit ? `
      <div class="col-12">
        <label class="form-label form-label-sm">Plantilla</label>
        <select class="form-select form-select-sm" id="pl-plantilla">
          ${templateOptions}
        </select>
        <div class="form-text">Selecciona una plantilla para préllenar el formulario</div>
      </div>
      ` : ''}
      <div class="col-md-6">
        <label class="form-label form-label-sm">Clase *</label>
        <select class="form-select form-select-sm" id="pl-clase_id" required>
          <option value="">Seleccionar clase</option>
          ${clasesOptions}
        </select>
      </div>
      <div class="col-md-6">
        <label class="form-label form-label-sm">Maestro</label>
        <select class="form-select form-select-sm" id="pl-maestro_id">
          ${maestrosOptions}
        </select>
      </div>

      <div class="col-12">
        <label class="form-label form-label-sm">Tema *</label>
        <input type="text" class="form-control form-control-sm" id="pl-tema" maxlength="200"
          placeholder="Ej: Introducción a la escala mayor" autocomplete="off"
          value="${esc(plan.tema || '')}">
        <div class="form-text"><span id="pl-tema-count">${(plan.tema || '').length}</span>/200</div>
      </div>

      <div class="col-md-6">
        <label class="form-label form-label-sm">Fecha de Inicio</label>
        <input type="date" class="form-control form-control-sm" id="pl-fecha_inicio"
          value="${plan.fecha_inicio || ''}">
      </div>

      ${isEdit ? `
      <div class="col-md-6">
        <label class="form-label form-label-sm">Estado</label>
        <select class="form-select form-select-sm" id="pl-estado">
          <option value="planificado" ${plan.estado === 'planificado' ? 'selected' : ''}>Planificado</option>
          <option value="ejecutado"   ${plan.estado === 'ejecutado'   ? 'selected' : ''}>Ejecutado</option>
          <option value="revisado"    ${plan.estado === 'revisado'    ? 'selected' : ''}>Revisado</option>
        </select>
      </div>` : '<div class="col-md-6"></div>'}

      <div class="col-12">
        <label class="form-label form-label-sm">Objetivos</label>
        <textarea class="form-control form-control-sm" id="pl-objetivos" rows="2" maxlength="1000"
          placeholder="Objetivos de la clase...">${esc(plan.objetivos || '')}</textarea>
        <div class="form-text"><span id="pl-obj-count">${(plan.objetivos || '').length}</span>/1000</div>
      </div>

      <div class="col-12">
        <label class="form-label form-label-sm">Contenido</label>
        <textarea class="form-control form-control-sm" id="pl-contenido" rows="3" maxlength="2000"
          placeholder="Desarrollo del tema...">${esc(plan.contenido || '')}</textarea>
        <div class="form-text"><span id="pl-cont-count">${(plan.contenido || '').length}</span>/2000</div>
      </div>

      <div class="col-12">
        <label class="form-label form-label-sm">Recursos <small class="text-secondary">(separados por coma)</small></label>
        <input type="text" class="form-control form-control-sm" id="pl-recursos"
          placeholder="Ej: Partitura, audio, pizarra" autocomplete="off"
          value="${esc(recursosValue)}">
      </div>

      <div class="col-12">
        <label class="form-label form-label-sm">Método de Evaluación</label>
        <textarea class="form-control form-control-sm" id="pl-evaluacion" rows="2" maxlength="500"
          placeholder="Cómo se evaluará...">${esc(plan.evaluacion_metodo || '')}</textarea>
        <div class="form-text"><span id="pl-eval-count">${(plan.evaluacion_metodo || '').length}</span>/500</div>
      </div>

      <div class="col-12">
        <label class="form-label form-label-sm">Observaciones</label>
        <textarea class="form-control form-control-sm" id="pl-observaciones" rows="2" maxlength="1000"
          placeholder="Notas adicionales...">${esc(plan.observaciones || '')}</textarea>
        <div class="form-text"><span id="pl-obs-count">${(plan.observaciones || '').length}</span>/1000</div>
      </div>

      <div class="col-12">
        <label class="form-label form-label-sm">Notas DSL <small class="text-secondary">(Notación simplificada: #Alumno [Contenido] (Sugerencia) {Tarea} $Medida 4/5 >Objetivo)</small></label>
        <div id="dsl-editor-container"></div>
        <div class="form-text text-end"><span id="dsl-summary">Sin tokens</span></div>
      </div>
    </form>
  `

  AppModal.open({
    title:    isEdit ? 'Editar Planificación' : 'Nueva Planificación',
    body,
    size:     'lg',
    saveText: isEdit ? 'Guardar cambios' : 'Guardar',
    onShow:   (bodyEl) => {
      if (!isEdit) {
        const templateSelect = bodyEl.querySelector('#pl-plantilla')
        if (templateSelect) {
          templateSelect.addEventListener('change', (e) => {
            const templateId = e.target.value
            const template = PLANTILLAS_PLANIFICACION.find(t => t.id === templateId)
            if (template && template.id !== 'blanco') {
              if (template.objetivos) bodyEl.querySelector('#pl-objetivos').value = template.objetivos
              if (template.contenido) bodyEl.querySelector('#pl-contenido').value = template.contenido
              if (template.recursos) bodyEl.querySelector('#pl-recursos').value = template.recursos
              if (template.evaluacion_metodo) bodyEl.querySelector('#pl-evaluacion').value = template.evaluacion_metodo
              _actualizarContadores(bodyEl)
            }
          })
        }
      }

      const dslContainer = bodyEl.querySelector('#dsl-editor-container')
      if (dslContainer) {
        const pickerModal = createAlumnoPickerModal({
          onSelect: async (alumnoIds) => {
            const allAlumnos = await getAlumnos()
            const selected = allAlumnos.filter(a => alumnoIds.includes(a.id))
            const mentions = selected.map(a => `#${a.nombre_completo}`).join(', ')
            if (dslEditor.component) {
              dslEditor.component.insertText(mentions + ' ')
            }
          },
        })
        document.body.appendChild(pickerModal)

        const dslEditor = createDslEditorWithToolbar({
          initialContent: plan.notas_dsl || '',
          onChange: (content, parsed) => {
            const summaryEl = bodyEl.querySelector('#dsl-summary')
            if (summaryEl) {
              const summary = _getDslSummary(parsed)
              summaryEl.textContent = summary
            }
          },
          onAlumnoClick: () => {
            pickerModal.openModal()
          },
        })

        dslContainer.appendChild(dslEditor)
        bodyEl.dslEditor = dslEditor
      }
    },
    onSave:   async (bodyEl) => {
      const tema    = bodyEl.querySelector('#pl-tema')?.value.trim()
      const claseId = bodyEl.querySelector('#pl-clase_id')?.value

      if (!tema)    { alert('El tema es obligatorio');  return false }
      if (!claseId) { alert('La clase es obligatoria'); return false }

      const recursosRaw = bodyEl.querySelector('#pl-recursos')?.value || ''
      const dslEditor = bodyEl.dslEditor
      const notasDsl = dslEditor ? dslEditor.getContent() : ''

      const datos = {
        clase_id:         claseId,
        maestro_id:       bodyEl.querySelector('#pl-maestro_id')?.value || null,
        tema,
        fecha_inicio:     bodyEl.querySelector('#pl-fecha_inicio')?.value || null,
        objetivos:        bodyEl.querySelector('#pl-objetivos')?.value.trim(),
        contenido:        bodyEl.querySelector('#pl-contenido')?.value.trim(),
        recursos:         recursosRaw.split(',').map(r => r.trim()).filter(Boolean),
        evaluacion_metodo:bodyEl.querySelector('#pl-evaluacion')?.value.trim(),
        observaciones:    bodyEl.querySelector('#pl-observaciones')?.value.trim(),
        notas_dsl:       notasDsl.trim(),
        estado:           isEdit
          ? (bodyEl.querySelector('#pl-estado')?.value || 'planificado')
          : 'planificado',
      }

      if (onSave) await onSave(datos)
    },
  })

  // Wire char counters after DOM is ready
  requestAnimationFrame(() => {
    _counter('pl-tema',        'pl-tema-count')
    _counter('pl-objetivos',   'pl-obj-count')
    _counter('pl-contenido',   'pl-cont-count')
    _counter('pl-evaluacion',  'pl-eval-count')
    _counter('pl-observaciones','pl-obs-count')
  })
}

function _counter(inputId, countId) {
  const input = document.getElementById(inputId)
  const count = document.getElementById(countId)
  if (!input || !count) return
  input.addEventListener('input', () => { count.textContent = input.value.length })
}

function _actualizarContadores(bodyEl) {
  const mappings = [
    { input: 'pl-objetivos', count: 'pl-obj-count' },
    { input: 'pl-contenido', count: 'pl-cont-count' },
    { input: 'pl-evaluacion', count: 'pl-eval-count' },
    { input: 'pl-observaciones', count: 'pl-obs-count' },
  ]
  mappings.forEach(({ input: inp, count: cnt }) => {
    const input = bodyEl.querySelector('#' + inp)
    const count = bodyEl.querySelector('#' + cnt)
    if (input && count) count.textContent = input.value.length
  })
}

function esc(str) {
  if (!str) return ''
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

function _getDslSummary(parsed) {
  const parts = []
  if (parsed.alumnos.length) parts.push(`${parsed.alumnos.length} alum.`)
  if (parsed.contenido.length) parts.push(`${parsed.contenido.length} cont.`)
  if (parsed.tareas.length) parts.push(`${parsed.tareas.length} tar.`)
  if (parsed.calificacion) parts.push(`${parsed.calificacion.valor}/${parsed.calificacion.sobre}`)
  return parts.length ? parts.join(', ') : 'Sin tokens'
}
