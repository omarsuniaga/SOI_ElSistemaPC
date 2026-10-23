import { getSemesterAdapter } from './semesterApi.js'
import { escapeText as e } from './domain.js'
import {
  SEMESTER_RUBRIC,
  RESULT_LABELS,
  operationalState,
  juryDisagreement,
  reportHTML,
  familyMessage,
} from './semesterDomain.js'
import './view.css'
import './semesterView.css'
const option = (value, label, selected = false) =>
  `<option value="${e(value)}" ${selected ? 'selected' : ''}>${e(label)}</option>`
const input = (name, label, type = 'text', value = '', required = true) =>
  `<label>${e(label)}<input name="${e(name)}" type="${e(type)}" value="${e(value)}" ${required ? 'required' : ''}></label>`
const area = (name, label, value = '', required = true) =>
  `<label>${e(label)}<textarea name="${e(name)}" ${required ? 'required' : ''}>${e(value)}</textarea></label>`
const select = (name, label, options, multiple = false) =>
  `<label>${e(label)}<select name="${e(name)}" ${multiple ? 'multiple' : ''} required>${options}</select></label>`
const button = (label, action, id = '') =>
  `<button type="button" data-action="${e(action)}" data-id="${e(id)}">${e(label)}</button>`
const criterionFields = (criterion, index) =>
  `<fieldset data-criterion><legend>Criterio ${index + 1}</legend><input type="hidden" name="criterion_key" value="${e(criterion.key)}">${input('criterion_label', 'Conducta musical observable', criterion.label ? 'text' : 'text', criterion.label || '')}${area('criterion_levels', 'Descriptores de nivel (uno por línea, de menor a mayor autonomía)', (criterion.levels || ['Con guía continua', 'Con apoyo puntual', 'De forma autónoma']).join('\n'))}<label class="is-check"><input type="checkbox" name="criterion_required" ${criterion.required ? 'checked' : ''}> Requiere observación para completar la valoración</label></fieldset>`
const date = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' })
export async function mountSemester(root, adapter = getSemesterAdapter(), options = {}) {
  let context,
    workspace = {
      candidatos: [],
      valoraciones: [],
      invitaciones: [],
      revision_invitaciones: [],
      historial: [],
    },
    campaignId = null,
    candidateId = null,
    selectedRevisionId = null,
    invitationId = null,
    section = options.section || 'convocatorias',
    dossier = null,
    sourceStudents = [],
    notice = '',
    disposed = false,
    busy = false
  const abort = new AbortController(),
    signal = abort.signal
  const current = () => context?.convocatorias.find((c) => c.id === campaignId)
  const candidate = () => workspace.candidatos.find((a) => a.id === candidateId)
  const className = (id) => context.clases.find((c) => c.id === id)?.nombre || id
  const reportPanel = (html) => {
    const pane = root.querySelector('[data-report]')
    pane.innerHTML = html
    pane.hidden = false
    pane.scrollIntoView?.({ block: 'start', behavior: 'smooth' })
  }
  const call = (action, data = {}) => adapter.execute(action, data)
  async function load() {
    context = await call('contexto')
    if (!context.convocatorias.some((c) => c.id === campaignId))
      campaignId = context.convocatorias[0]?.id || null
    if (campaignId) {
      workspace = await call('detalle', { convocatoria_id: campaignId })
      if (!workspace.candidatos.some((a) => a.id === candidateId))
        candidateId = workspace.candidatos[0]?.id || null
      sourceStudents = current().canManage
        ? await call('alumnos_origen', { convocatoria_id: campaignId })
        : []
    }
    if (invitationId) dossier = await call('expediente', { invitacion_id: invitationId })
  }
  function createForm() {
    return `<details class="ia-panel"><summary>Crear audición de medio o final de semestre</summary><form data-form="crear">${input('nombre', 'Nombre de la convocatoria')}${input('periodo', 'Período académico (denominación institucional)')}${select('tipo', 'Tipo de audición', option('medio', 'Medio semestre · diagnóstico') + option('final', 'Final de semestre · revisión de invitados'))}${input('fecha_audicion', 'Fecha de audición', 'date', date())}${select(
      'clases_origen',
      'Grupos de Iniciación convocados',
      context.clases
        .filter((c) => c.es_clase_iniciacion)
        .map((c) => option(c.id, c.nombre))
        .join(''),
      true,
    )}${select('jurados', 'Maestros designados como jurado', context.jurados.map((p) => option(p.id, p.nombre)).join(''), true)}${select('responsables', 'Responsables de las decisiones académicas', context.jurados.map((p) => option(p.id, p.nombre)).join(''), true)}${input('min_jurados', 'Mínimo de valoraciones completas', 'number', 1)}<p class="ia-muted">Escala provisional editable. No calcula una aprobación automática. Cada nivel debe describir una conducta observable. «No observado» queda separado.</p><details><summary>Rúbrica y escala de esta convocatoria</summary><div data-rubric>${SEMESTER_RUBRIC.map(criterionFields).join('')}</div>${button('Añadir criterio específico de la actividad o destino', 'add-criterion')}</details><button>Guardar convocatoria en borrador</button></form></details>`
  }
  function campaignControls(c) {
    return `${
      c.canManage
        ? `<details class="ia-panel"><summary>Gestión de la convocatoria</summary><div class="is-actions">${!c.publicada ? button('Abrir evaluación', 'abrir') + button('Cerrar evaluación', 'cerrar') : ''}${c.canDecide && !c.publicada ? button('Publicar resultados revisados', 'publicar') : ''}${c.canDecide && c.publicada ? `<form data-form="reabrir">${area('observacion', 'Motivo de la corrección y reapertura')}<button>Reabrir resultados (revoca autorizaciones pendientes)</button></form>` : ''}</div>${
            !c.publicada
              ? `<form data-form="jurados">${select('jurados', 'Jurados vigentes', context.jurados.map((j) => option(j.id, j.nombre, c.jurados.includes(j.id))).join(''), true)}${area('observacion', 'Motivo de la designación o retiro')}<p>Se conservan notas retiradas, pero no cuentan para resolver. Cambiar jurados invalida resoluciones pendientes.</p><button>Actualizar jurados</button></form>${
                  c.tipo === 'medio'
                    ? `<form data-form="agregar">${select('alumno_id', 'Alumno de los grupos origen', sourceStudents.map((a) => option(a.id, a.nombre_completo)).join(''))}${select('regular_clase_id', 'Clase regular de teoría/solfeo (verificar matrícula)', option('', 'Seleccionar después con coordinación') + context.clases.map((cl) => option(cl.id, cl.nombre)).join(''))}<button>Agregar candidato</button></form>`
                    : `<form data-form="vincular_final">${select(
                        'revision_id',
                        'Invitación a revisar en esta audición final',
                        context.invitaciones
                          .filter((i) => i.estado === 'invitado' && !i.convocatoria_final_id)
                          .map((i) => option(i.id, `${i.alumno_nombre} · ${className(i.clase_id)}`))
                          .join(''),
                      )}<button>Vincular invitación y diagnóstico inicial</button></form>`
                }`
              : ''
          }</details>`
        : ''
    }`
  }
  function scoreForm(c, a) {
    if (!c.jurados.includes(context.user.id) || c.estado !== 'abierta' || c.publicada) return ''
    const revisionIds = workspace.revision_invitaciones
      .filter((i) => i.alumno_id === a.alumno_id)
      .map((i) => i.id)
    const revisionId =
      c.tipo === 'final'
        ? revisionIds.includes(selectedRevisionId)
          ? selectedRevisionId
          : revisionIds[0]
        : null
    selectedRevisionId = revisionId
    const own = workspace.valoraciones.find(
      (v) =>
        v.candidato_id === a.id &&
        v.jurado_id === context.user.id &&
        (v.invitacion_id || null) === (revisionId || null),
    )
    return `<section class="ia-panel"><h3>Mi valoración como jurado</h3><p>Calibración: observe una actividad ya trabajada. Registre qué hizo el alumno y qué apoyo necesitó. No interprete ausencia o «No observado» como una nota mínima.</p><form data-form="valorar">${
      c.tipo === 'final'
        ? select(
            'destino_revision_id',
            'Destino de la revisión final',
            workspace.revision_invitaciones
              .filter((i) => i.alumno_id === a.alumno_id)
              .map((i) => option(i.id, className(i.clase_id), i.id === selectedRevisionId))
              .join(''),
          )
        : ''
    }${c.rubrica.map((cr) => select(`score_${cr.key}`, cr.label, option('', 'No observado') + cr.levels.map((level, index) => option(index + 1, `${index + 1} · ${level}`, own?.notas?.[cr.key] === index + 1)).join('')).replace(' required', '')).join('')}${area('observacion', 'Evidencia observada', own?.observacion || '')}${area('fortalezas', 'Fortalezas', own?.fortalezas || '')}${area('apoyos', 'Dificultades y apoyos necesarios', own?.apoyos || '')}${select('recomendacion', 'Recomendación del jurado', ['preparado', 'continuar', 'evidencia'].map((r) => option(r, RESULT_LABELS[r], own?.recomendacion === r)).join(''))}<button>Guardar mi valoración</button></form></section>`
  }
  function academicForms(c, a) {
    if (!c.canDecide) return ''
    const version = `<input type="hidden" name="version" value="${a.version}">`
    return `<section class="ia-panel"><h3>Decisión del responsable académico</h3>${!c.publicada ? `<form data-form="resolver">${version}${select('resultado', 'Resolución explícita', ['preparado', 'continuar', 'evidencia', 'ausente'].map((r) => option(r, RESULT_LABELS[r], a.resultado === r)).join(''))}${area('conclusion_jurado', 'Conclusión del jurado y deliberación de discrepancias', a.conclusion_jurado || '')}${area('conclusion', 'Resolución académica explicada', a.conclusion)}${area('fortalezas', 'Fortalezas para la devolución', a.fortalezas)}${area('apoyos', 'Aspectos a trabajar y próximo paso', a.apoyos)}<button>Registrar resolución académica</button></form>` : `<p>Resultados publicados. La corrección requiere reapertura e historial.</p>${button('Emitir informe individual revisado', 'informe', a.id)}`}</section>
  ${
    c.publicada && c.tipo === 'medio' && a.resultado === 'preparado'
      ? `<section class="ia-panel"><h3>Preferencia y autorización de destino</h3><p>Primero se consulta la preferencia. Coordinación decide según preparación, cupos e instrumentos. Aprobar no crea una matrícula.</p><form data-form="preferencia">${version}${area('preferencia', 'Qué quiere estudiar el alumno (consulta posterior a aprobación)', a.preferencia?.texto || '')}<button>Registrar preferencia consultada</button></form>${
          a.preferencia
            ? `<details><summary>Autorizar una clase como destino</summary><form data-form="autorizar">${version}${select(
                'clase_id',
                'Clase de destino autorizada',
                context.clases
                  .filter((cl) => !c.clases_origen.includes(cl.id))
                  .map((cl) => option(cl.id, cl.nombre))
                  .join(''),
              )}${area('objetivos', 'Dos o tres objetivos observables')}${input('inicio', 'Inicio de la invitación', 'date', date())}${input('revision', 'Fecha de revisión', 'date')}${select('requiere_instrumento', '¿Requiere instrumento individual disponible?', option('true', 'Sí · identificar el recurso') + option('false', 'No aplica · justificar'))}${input('recurso_referencia', 'Código único de inventario o referencia operativa del recurso', 'text', '', false)}${area('comprobacion', 'Comprobación de disponibilidad (o motivo por el que no aplica)')}<p>Una comprobación operativa no es una entrega ni un préstamo. El recurso queda reservado y el receptor deberá revalidarlo.</p>${area('observacion', 'Motivo del destino, diferencia con preferencia y comunicación acordada con familia')}${area('excepcion_horario', 'Acuerdo de solapamiento, si aplica', '', false)}<details><summary>Turno individual para clase rotativa</summary>${input('dia', 'Día del turno', 'text', '', false)}${input('hora_inicio', 'Hora de inicio', 'time', '', false)}${input('hora_fin', 'Hora final', 'time', '', false)}</details><button>Autorizar destino (sin matricular)</button></form></details>`
            : ''
        }</section>`
      : ''
  }
  <details class="ia-panel"><summary>Continuidad de teoría y solfeo</summary><p>La invitación conserva su formación regular. No se elimina ninguna matrícula de origen.</p><form data-form="regularizar">${version}${select('regular_clase_id', 'Matrícula regular que debe mantener', context.clases.map((cl) => option(cl.id, cl.nombre, cl.id === a.regular_clase_id)).join(''))}<button>Verificar y registrar matrícula regular</button></form><form data-form="excepcion_regular">${version}${area('observacion', 'Motivo y plan de regularización excepcional')}${input('revision', 'Revisión de la excepción', 'date')}<button>Registrar excepción académica temporal</button></form></details>
  ${c.publicada ? `<details class="ia-panel"><summary>Comunicación individual a representante</summary><p>Se prepara un borrador para envío manual. No se envía ningún mensaje desde esta pantalla. Revise representante, contacto y consentimiento institucional.</p><form data-form="comunicacion"><input type="hidden" name="operacion_id" value="${crypto.randomUUID()}">${input('destinatario', 'Nombre del representante verificado')}${input('contacto', 'Contacto verificado')}${area('consentimiento', 'Referencia del consentimiento y verificación del contacto')}<label class="is-check"><input type="checkbox" name="revision_confirmada" required> Confirmé destinatario, contacto, contenido y consentimiento</label><button>Preparar borrador revisado</button></form></details>` : ''}`
  }
  function candidatePanel(c, a) {
    if (!a)
      return '<p class="ia-panel">Agregue alumnos o vincule invitaciones a esta convocatoria.</p>'
    const values = workspace.valoraciones.filter((v) => v.candidato_id === a.id)
    const initial = workspace.revision_invitaciones.filter((i) => i.alumno_id === a.alumno_id)
    return `<header><div><h2>${e(a.alumno_nombre)}</h2><span class="ia-badge">${e(RESULT_LABELS[a.resultado])}</span><p>${e(a.conclusion)}</p></div></header>
  ${c.tipo === 'final' ? `<section class="ia-panel"><h3>Revisión por destino</h3>${initial.map((i) => `<p>${e(className(i.clase_id))} · objetivos: ${e(i.objetivos)} · ronda ${i.ronda}</p>${button('Comparar diagnóstico y seguimiento', 'comparar', i.id)}`).join('')}</section>` : ''}
  <section class="ia-panel"><h3>Evidencia ${c.canManage ? 'del jurado' : 'de mis valoraciones'}</h3>${juryDisagreement(values) ? '<p role="status">Hay recomendaciones diferentes. Deliberar y explicar la conclusión; una media no resuelve la discrepancia.</p>' : ''}<div class="is-table"><table><thead><tr><th>Jurado</th><th>Estado</th><th>Recomendación</th><th>Evidencia</th></tr></thead><tbody>${values.map((v) => `<tr><td>${e(context.jurados.find((j) => j.id === v.jurado_id)?.nombre || (v.jurado_id === context.user.id ? 'Mi valoración' : 'Jurado designado'))}</td><td>${v.completa ? 'Completa' : 'Incompleta / No observado'}</td><td>${e(RESULT_LABELS[v.recomendacion] || v.recomendacion)}</td><td>${e(v.observacion)}</td></tr>`).join('')}</tbody></table></div><p>Mínimo configurado: ${c.min_jurados}. Las notas de jurados retirados se conservan históricamente y no cuentan en decisiones pendientes.</p></section>${scoreForm(c, a)}${academicForms(c, a)}${c.canManage ? historyPanel(c) : ''}`
  }
  function historyPanel(c) {
    return `<details class="ia-panel"><summary>Historial y comunicaciones supervisadas</summary>${workspace.historial
      .slice()
      .reverse()
      .map(
        (h) =>
          `<article class="is-timeline"><p>${e(h.creado_at)} · ${e(h.accion)} · ${e(h.actor_id)}</p><p>${e(h.observacion || h.datos?.observacion || '')}</p>${h.accion === 'comunicacion' ? `<p>Borrador manual para ${e(h.datos.destinatario)} · ${e(h.datos.contacto)}. ${workspace.historial.some((x) => x.accion === 'entrega' && x.datos.comunicacion_id === h.id) ? 'Entrega confirmada por una persona.' : `Aún no se confirmó entrega.</p>${c.canDecide ? `<form data-form="entrega" data-id="${e(h.id)}" data-campaign="${e(c.id)}">${area('observacion', 'Canal, fecha y constancia de entrega realizada')}<label class="is-check"><input type="checkbox" name="entrega_confirmada" required> Confirmo que realicé la entrega manual</label><button>Registrar entrega realizada</button></form>` : ''}`}</p>` : ''}</article>`,
      )
      .join('')}</details>`
  }
  function invitationPanel() {
    const entries = context.invitaciones
    return `<h2>Invitados y destinos autorizados</h2><p>El maestro receptor incorpora únicamente al destino aprobado. Ser receptor no otorga acceso como jurado.</p><div class="is-cards">${entries.map((i) => `<article class="ia-panel"><h3>${e(i.alumno_nombre)}</h3><p>${e(i.clase_nombre || className(i.clase_id))}</p><span class="ia-badge">${e(RESULT_LABELS[i.estado])}</span><p>Objetivos: ${e(i.objetivos)}<br>Inicio: ${e(i.inicio)} · Revisión: ${e(i.revision)}</p>${i.revision <= date() && i.estado === 'invitado' ? '<p role="status">Revisión pendiente. La fecha no cambia su matrícula.</p>' : ''}${button('Ver ficha y seguimiento', 'expediente', i.id)}${i.estado === 'autorizada' && context.clases.find((cl) => cl.id === i.clase_id)?.receptor ? `<form data-form="incorporar" data-id="${e(i.id)}"><input type="hidden" name="version" value="${i.version}"><p>Clase preseleccionada: ${e(className(i.clase_id))}. Mantendrá teoría y solfeo.</p>${i.requiere_instrumento ? `<p>Recurso autorizado: ${e(i.recurso_referencia)}</p><input type="hidden" name="recurso_referencia" value="${e(i.recurso_referencia)}"><label class="is-check"><input name="disponibilidad_confirmada" type="checkbox" required> Volví a comprobar que este recurso está disponible para el alumno</label>` : ''}<label class="is-check"><input type="checkbox" required> Confirmo la incorporación como invitado al destino indicado</label><button>Agregar como invitado</button></form>` : ''}</article>`).join('') || '<p>No tiene invitados ni destinos autorizados pendientes.</p>'}</div>${dossier ? dossierPanel() : ''}`
  }
  function dossierPanel() {
    const i = dossier.invitacion,
      c = context.convocatorias.find((c) => c.id === stateCandidateCampaign(i.candidato_id)),
      canDecide = dossier.canDecide || c?.canDecide
    return `<section class="ia-panel" data-dossier><h2>Seguimiento · ${e(dossier.alumno_nombre)}</h2><p>${e(className(i.clase_id))} · ${e(RESULT_LABELS[i.estado])} · ronda ${i.ronda}</p><h3>Punto de partida</h3><p>${e(dossier.diagnostico.conclusion)}</p><p>Fortalezas: ${e(dossier.diagnostico.fortalezas)} · Apoyos: ${e(dossier.diagnostico.apoyos)}</p><p>Objetivos: ${e(i.objetivos)}</p>${!dossier.regular_activa ? '<p role="alert">Falta verificar matrícula regular de teoría y solfeo. Solicite regularización o excepción académica; no se retira al alumno automáticamente.</p>' : ''}<h3>Evolución y apoyos</h3>${dossier.seguimientos.map((f) => `<article class="is-timeline"><p>${e(f.fecha)} · ronda ${e(f.ronda)}</p><p><strong>Avances:</strong> ${e(f.datos.avances)}</p><p><strong>Dificultades/apoyos:</strong> ${e(f.datos.apoyos)}</p><p>${e(f.datos.recomendacion)}</p><p>Evidencia: ${e(f.datos.evidencia || 'Sin referencia adicional')}</p></article>`).join('') || '<p>Aún no hay seguimiento registrado.</p>'}${i.estado === 'invitado' ? `<form data-form="seguimiento" data-id="${e(i.id)}">${area('avances', 'Avances respecto de los objetivos')}${area('apoyos', 'Dificultades, apoyos y siguiente paso')}${area('recomendacion', 'Recomendación del receptor')}${input('evidencia', 'Referencia a clase o evidencia pedagógica existente', 'text', '', false)}<button>Guardar seguimiento breve</button></form>` : ''}${canDecide && i.estado === 'autorizada' ? `<form data-form="revocar" data-id="${e(i.id)}"><input type="hidden" name="version" value="${i.version}">${area('observacion', 'Motivo de revocación de autorización')}<button>Revocar autorización pendiente</button></form>` : ''}${canDecide && i.estado === 'invitado' ? `<form data-form="resolver_invitacion" data-id="${e(i.id)}"><input type="hidden" name="version" value="${i.version}"><h3>Resolución final de esta invitación</h3><p>Requiere seguimiento y audición final publicada con evidencia de esta ronda.</p>${select('accion', 'Decisión de coordinación', option('confirmar', 'Confirmar como miembro oficial') + option('prorrogar', 'Prorrogar invitación') + option('finalizar', 'Finalizar invitación y continuar preparación'))}${area('observacion', 'Conclusión comparada: diagnóstico inicial y evolución')}${area('plan', 'Plan de continuidad y comunicación a familia')}${input('revision', 'Nueva revisión (solo prórroga)', 'date', '', false)}${area('objetivos', 'Nuevos objetivos (solo prórroga)', '', false)}<button>Registrar decisión sobre este destino</button></form>` : ''}</section>`
  }
  function stateCandidateCampaign(aid) {
    return (
      workspace.candidatos.find((a) => a.id === aid)?.convocatoria_id ||
      context.invitaciones.find((i) => i.candidato_id === aid)?.convocatoria_id
    )
  }
  function render() {
    if (disposed) return
    const c = current()
    root.innerHTML = `<main class="ia is-semester"><header><div><p class="is-eyebrow">El Sistema Punta Cana · Desarrollo académico</p><h1>Audiciones e invitados</h1><p class="ia-muted">Diagnóstico, decisión académica y acompañamiento por clase</p></div><a href="/">Volver al portal</a></header>${context.demo ? `<aside class="ia-panel"><strong>Demostración con datos sintéticos</strong><p>Se guarda solo en este navegador. No modifica alumnos reales.</p>${select('demo_actor', 'Perfil de prueba', context.actors.map((a) => option(a.id, a.nombre, a.id === context.user.id)).join(''))}</aside>` : ''}<nav class="is-actions" aria-label="Secciones de audiciones">${context.convocatorias.length || context.user.canManage ? button(context.user.canManage ? 'Convocatorias' : 'Mis audiciones', 'section-campaigns') : ''}${button('Invitados y autorizaciones', 'section-invitations')}${button('Actualizar datos', 'refresh')}</nav><div role="status" data-status>${e(notice)}</div><div role="alert" data-error hidden></div><section data-report hidden></section>
  ${section === 'invitaciones' ? invitationPanel() : `${context.user.canManage ? createForm() : ''}${!context.convocatorias.length ? '<section class="ia-panel"><h2>Sin convocatorias asignadas</h2><p>Solo los maestros designados verán sus tareas de jurado. Sus clases y alumnos conservan sus permisos habituales.</p></section>' : `<div class="ia-grid"><aside><section class="ia-panel"><h2>${context.user.canManage ? 'Convocatorias' : 'Mis audiciones'}</h2>${context.convocatorias.map((x) => `<button type="button" class="ia-candidate" data-action="campaign" data-id="${e(x.id)}" aria-pressed="${c?.id === x.id}">${e(x.nombre)}<br><small>${e(x.tipo)} · ${e(x.periodo)} · ${x.publicada ? 'Publicada' : e(x.estado)}</small></button>`).join('')}</section>${c ? campaignControls(c) : ''}${c ? `<section class="ia-panel"><h3>Listado y pendientes</h3><label>Buscar alumno<input data-filter placeholder="Nombre del alumno"></label>${workspace.candidatos.map((a) => `<button class="ia-candidate" type="button" data-action="candidate" data-id="${e(a.id)}" data-candidate-name="${e(a.alumno_nombre.toLocaleLowerCase())}" aria-pressed="${a.id === candidateId}">${e(a.alumno_nombre)}<br><small>${e(operationalState(a, workspace.valoraciones, workspace.invitaciones))}</small></button>`).join('')}${c.publicada && c.canDecide ? button('Emitir consolidado institucional', 'informe') : ''}</section>` : ''}</aside><section>${c ? candidatePanel(c, candidate()) : ''}</section></div>`}`}</main>`
  }
  async function perform(task) {
    if (busy) return
    busy = true
    const errorPane = root.querySelector('[data-error]')
    if (errorPane) {
      errorPane.hidden = true
      errorPane.textContent = ''
    }
    const disabled = [...root.querySelectorAll('button')]
    disabled.forEach((b) => (b.disabled = true))
    try {
      await task()
    } catch (error) {
      if (!disposed) {
        const pane = root.querySelector('[data-error]')
        pane.hidden = false
        pane.textContent = error.message
        pane.scrollIntoView?.({ block: 'center' })
        pane.setAttribute('tabindex', '-1')
        pane.focus()
      }
    } finally {
      busy = false
      disabled.forEach((b) => {
        if (b.isConnected) b.disabled = false
      })
    }
  }
  async function refresh(message = 'Datos actualizados') {
    await load()
    notice = message
    render()
  }
  root.addEventListener(
    'change',
    (event) => {
      if (event.target.name === 'destino_revision_id') {
        selectedRevisionId = event.target.value
        render()
        return
      }
      if (event.target.name === 'demo_actor')
        perform(async () => {
          adapter.setActor(event.target.value)
          campaignId = null
          candidateId = null
          invitationId = null
          dossier = null
          await refresh('Perfil de demostración cambiado')
        })
    },
    { signal },
  )
  root.addEventListener(
    'input',
    (event) => {
      if (event.target.matches('[data-filter]')) {
        const search = event.target.value.toLocaleLowerCase()
        root.querySelectorAll('[data-candidate-name]').forEach((el) => {
          el.hidden = !el.dataset.candidateName.includes(search)
        })
      }
    },
    { signal },
  )
  root.addEventListener(
    'click',
    (event) => {
      const target = event.target.closest('[data-action]')
      if (!target) return
      perform(async () => {
        const action = target.dataset.action,
          id = target.dataset.id
        if (action === 'add-criterion') {
          const panel = root.querySelector('[data-rubric]')
          const index = panel.children.length
          panel.insertAdjacentHTML(
            'beforeend',
            criterionFields({ key: `criterio_${index + 1}`, label: '', required: false }, index),
          )
          return
        }
        if (action === 'print') {
          window.print()
          return
        }
        if (action === 'campaign') {
          campaignId = id
          candidateId = null
          await refresh()
          return
        }
        if (action === 'candidate') {
          candidateId = id
          selectedRevisionId = null
          notice = ''
          render()
          return
        }
        if (action === 'section-campaigns') {
          section = 'convocatorias'
          render()
          return
        }
        if (action === 'section-invitations') {
          section = 'invitaciones'
          render()
          return
        }
        if (action === 'refresh') {
          await refresh()
          return
        }
        if (action === 'expediente') {
          invitationId = id
          dossier = await call('expediente', { invitacion_id: id })
          section = 'invitaciones'
          render()
          return
        }
        if (action === 'comparar') {
          const evidence = await call('comparar', { convocatoria_id: campaignId, revision_id: id })
          reportPanel(
            `<h3>Diagnóstico y evolución por destino</h3><p>${e(evidence.diagnostico.conclusion)}</p><p>Fortalezas: ${e(evidence.diagnostico.fortalezas)} · Apoyos: ${e(evidence.diagnostico.apoyos)}</p><p>Objetivos: ${e(evidence.invitacion.objetivos)}</p>${evidence.seguimientos.map((f) => `<p>${e(f.fecha)} · ${e(f.datos.avances)} · ${e(f.datos.apoyos)} · ${e(f.datos.recomendacion)}</p>`).join('')}`,
          )
          return
        }
        if (action === 'informe') {
          const report = await call(
            'informe',
            id ? { candidato_id: id } : { convocatoria_id: campaignId },
          )
          reportPanel(reportHTML(report) + button('Imprimir / guardar PDF', 'print'))
          return
        }
        if (['abrir', 'cerrar', 'publicar'].includes(action)) {
          await call(action, { convocatoria_id: campaignId })
          await refresh('Operación guardada')
          return
        }
      })
    },
    { signal },
  )
  root.addEventListener(
    'submit',
    (event) => {
      const form = event.target.closest('[data-form]')
      if (!form) return
      event.preventDefault()
      perform(async () => {
        const action = form.dataset.form,
          data = Object.fromEntries(new FormData(form))
        if (['crear', 'jurados'].includes(action))
          data.jurados = [...form.elements.jurados.selectedOptions].map((o) => o.value)
        if (action === 'crear') {
          data.clases_origen = [...form.elements.clases_origen.selectedOptions].map((o) => o.value)
          data.responsables = [...form.elements.responsables.selectedOptions].map((o) => o.value)
          data.min_jurados = Number(data.min_jurados)
          data.rubrica = [...form.querySelectorAll('[data-criterion]')].map((row) => ({
            key: row.querySelector('[name=criterion_key]').value,
            label: row.querySelector('[name=criterion_label]').value,
            required: row.querySelector('[name=criterion_required]').checked,
            levels: row
              .querySelector('[name=criterion_levels]')
              .value.split('\n')
              .map((v) => v.trim())
              .filter(Boolean),
          }))
          Object.keys(data)
            .filter((k) => k.startsWith('criterion_'))
            .forEach((k) => delete data[k])
          data.cohorte_desde = data.fecha_audicion
          data.cohorte_hasta = data.fecha_audicion
        } else data.convocatoria_id = campaignId
        if (
          [
            'valorar',
            'resolver',
            'preferencia',
            'autorizar',
            'regularizar',
            'excepcion_regular',
            'comunicacion',
          ].includes(action)
        )
          data.candidato_id = candidateId
        if ('version' in data) data.version = Number(data.version)
        if (action === 'entrega') {
          data.convocatoria_id = form.dataset.campaign
          data.comunicacion_id = form.dataset.id
        }
        if (action === 'valorar') {
          data.notas = Object.fromEntries(
            current().rubrica.map((c) => [
              c.key,
              data[`score_${c.key}`] === '' ? null : Number(data[`score_${c.key}`]),
            ]),
          )
          Object.keys(data)
            .filter((k) => k.startsWith('score_'))
            .forEach((k) => delete data[k])
        }
        if (action === 'autorizar') data.requiere_instrumento = data.requiere_instrumento === 'true'
        if (['incorporar', 'seguimiento', 'revocar', 'resolver_invitacion'].includes(action))
          data.invitacion_id = form.dataset.id
        if (action === 'incorporar')
          data.disponibilidad_confirmada = data.disponibilidad_confirmada === 'on'
        if (action === 'comunicacion') data.revision_confirmada = data.revision_confirmada === 'on'
        if (action === 'entrega') data.entrega_confirmada = data.entrega_confirmada === 'on'
        const value = await call(action, data)
        if (action === 'crear') {
          campaignId = value.id
          candidateId = null
        }
        await refresh('Guardado correctamente')
        if (action === 'comunicacion')
          reportPanel(
            `<h3>Borrador revisado · no enviado</h3><p>Para: ${e(value.destinatario)} · ${e(value.contacto)}</p><pre class="is-message">${e(familyMessage(value.informe))}</pre><p>Copie y envíe por el canal institucional verificado. Solo después confirme la entrega en el historial.</p>`,
          )
      })
    },
    { signal },
  )
  try {
    await load()
    render()
  } catch (error) {
    root.innerHTML = `<main class="ia"><h1>Audiciones e invitados</h1><div role="alert">${e(error.message)}</div><a href="/">Volver al portal e iniciar sesión</a></main>`
  }
  return {
    destroy() {
      disposed = true
      abort.abort()
      root.innerHTML = ''
    },
    refresh: () => refresh(),
    getContext: () => context,
  }
}
