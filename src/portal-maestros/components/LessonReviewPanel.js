import { escHTML } from '../utils/portalUtils.js'
import { LESSON_KINDS, buildConfirmedLesson, attendanceSignature, isLessonPresent, lessonName } from '../utils/lessonReview.js'

/** Revisión inline; usa el panel de valoraciones existente para las estrellas. */
export function createLessonReviewPanel(container, opts) {
  const element = document.createElement('section')
  element.className = 'pm-lesson-review'
  element.setAttribute('aria-label', 'Revisión del registro de clase')
  element.hidden = true
  container.appendChild(element)
  let review = null
  let signature = ''
  let destroyed = false
  let busy = false

  if (!document.getElementById('pm-lesson-review-style')) {
    const style = document.createElement('style')
    style.id = 'pm-lesson-review-style'
    style.textContent = `
      .pm-lesson-review { margin-top:1rem; padding:1rem; border:1px solid var(--pm-primary,#6366f1); border-radius:12px; background:var(--pm-surface); }
      .pm-lesson-review[hidden] { display:none; }
      .pm-lr-card { margin:.8rem 0; padding:.8rem; border:1px solid var(--pm-border); border-radius:10px; }
      .pm-lr-card textarea { width:100%; min-height:85px; margin:.5rem 0; background:var(--pm-surface-2); color:var(--pm-text); border:1px solid var(--pm-border); border-radius:8px; padding:.6rem; }
      .pm-lr-card select { max-width:100%; padding:.5rem; background:var(--pm-surface); color:var(--pm-text); border:1px solid var(--pm-border); border-radius:8px; }
      .pm-lr-names { display:flex; flex-wrap:wrap; gap:.4rem; margin-top:.5rem; }
      .pm-lr-names[hidden] { display:none; }
      .pm-lr-names label { display:flex; align-items:center; gap:.4rem; padding:.5rem; border:1px solid var(--pm-border); border-radius:8px; }
      .pm-lr-source, .pm-lr-hint { font-size:.82rem; color:var(--pm-text-muted); white-space:pre-wrap; overflow-wrap:anywhere; }
      .pm-lr-actions { display:flex; flex-wrap:wrap; gap:.5rem; margin-top:.8rem; }
      .pm-lr-actions button { min-height:44px; }
      .pm-lr-error { color:var(--pm-danger,#dc3545); white-space:pre-wrap; }
    `
    document.head.appendChild(style)
  }

  function capture() {
    element.querySelectorAll('[data-lr-block]').forEach(card => {
      const block = review.blocks[Number(card.dataset.lrBlock)]
      block.text = card.querySelector('textarea').value
      block.kind = card.querySelector('[data-lr-kind]').value
      block.scope = card.querySelector('[data-lr-scope]').value
      block.studentIds = [...card.querySelectorAll('[data-lr-student]:checked')].map(input => input.value)
    })
  }

  function render() {
    const roster = opts.getAlumnos()
    const state = opts.getEstado()
    const present = roster.filter(a => isLessonPresent(state[a.id]))
    element.innerHTML = `
      <h3 style="font-size:1.05rem">Revisar contenido y desempeño de la clase</h3>
      <p class="pm-lr-hint">Confirma el mensaje y sus destinatarios. Después podrás valorar a los presentes: practicar un contenido no equivale a lograrlo.</p>
      ${review.ratingSummary ? `<p role="status"><strong>${escHTML(review.ratingSummary)}</strong></p>` : ''}
      ${review.warning ? `<p role="status">${escHTML(review.warning)}</p>` : ''}
      <details><summary>Texto original completo</summary><p class="pm-lr-source">${escHTML(review.original)}</p></details>
      ${review.blocks.map((block, i) => `
        <div class="pm-lr-card" data-lr-block="${i}">
          <label>Tipo de registro
            <select data-lr-kind aria-label="Tipo del fragmento ${i + 1}">
              ${Object.entries(LESSON_KINDS).map(([key, value]) => `<option value="${key}"${block.kind === key ? ' selected' : ''}>${escHTML(value.label)}</option>`).join('')}
            </select>
          </label>
          <p class="pm-lr-source">Original: ${escHTML(block.source)}</p>
          <textarea aria-label="Texto del fragmento ${i + 1}">${escHTML(block.text)}</textarea>
          <label>¿Para quién es?
            <select data-lr-scope aria-label="Destinatarios del fragmento ${i + 1}">
              <option value="seleccionar"${block.scope !== 'presentes' ? ' selected' : ''}>Elegir alumnos presentes</option>
              <option value="presentes"${block.scope === 'presentes' ? ' selected' : ''}>Todos los presentes (${present.length})</option>
            </select>
          </label>
          <div class="pm-lr-names"${block.scope === 'presentes' ? ' hidden' : ''}>
            ${present.map(a => `<label><input type="checkbox" data-lr-student value="${escHTML(a.id)}"${block.studentIds.includes(a.id) ? ' checked' : ''}>${escHTML(lessonName(a))}</label>`).join('')}
          </div>
          ${!present.length ? '<p role="status">Marca primero la asistencia para atribuir el contenido.</p>' : ''}
          <button type="button" class="pm-btn pm-btn-outline" data-lr-remove="${i}" style="margin-top:.5rem">Quitar fragmento</button>
        </div>`).join('')}
      <p class="pm-lr-hint"># Alumno · [] contenido · () aspecto a reforzar · {} tarea. Puedes corregir cada fragmento antes de aplicarlo. Ausentes y justificados quedan fuera de la evaluación.</p>
      <p class="pm-lr-error" role="alert" data-lr-error></p>
      <div class="pm-lr-actions">
        <button type="button" class="pm-btn pm-btn-outline" data-lr-add>Agregar fragmento</button>
        <button type="button" class="pm-btn pm-btn-outline" data-lr-cancel>Cancelar</button>
        <button type="button" class="pm-btn pm-btn-outline" data-lr-apply>Confirmar solo contenido</button>
        <button type="button" class="pm-btn pm-btn-primary" data-lr-evaluate>Confirmar y evaluar presentes</button>
      </div>
    `
  }

  async function apply(evaluate) {
    if (busy || destroyed) return
    capture()
    try {
      if (opts.getContent() !== review.original ||
          attendanceSignature(opts.getAlumnos(), opts.getEstado()) !== signature)
        throw new Error('El texto o la asistencia cambió. Vuelve a analizar antes de confirmar.')
      const dsl = buildConfirmedLesson(review.blocks, opts.getAlumnos(), opts.getEstado())
      busy = true
      element.querySelectorAll('button').forEach(button => { button.disabled = true })
      const accepted = await opts.onConfirm({ dsl, evaluate, original: review.original })
      if (!destroyed && accepted !== false) element.hidden = true
    } catch (error) {
      if (!destroyed) element.querySelector('[data-lr-error]').textContent = error.message
    } finally {
      busy = false
      if (!destroyed) element.querySelectorAll('button').forEach(button => { button.disabled = false })
    }
  }

  function click(event) {
    const button = event.target.closest('button')
    if (!button || busy) return
    if (button.hasAttribute('data-lr-cancel')) { element.hidden = true; return }
    if (button.hasAttribute('data-lr-apply')) { void apply(false); return }
    if (button.hasAttribute('data-lr-evaluate')) { void apply(true); return }
    if (button.hasAttribute('data-lr-remove')) {
      capture()
      review.blocks.splice(Number(button.dataset.lrRemove), 1)
      render()
    }
    if (button.hasAttribute('data-lr-add')) {
      capture()
      review.blocks.push({ source: '', text: '', kind: 'contenido', scope: 'seleccionar', studentIds: [] })
      render()
    }
  }
  element.addEventListener('click', click)
  element.addEventListener('change', event => {
    if (event.target.matches('[data-lr-scope]')) {
      const card = event.target.closest('[data-lr-block]')
      card.querySelector('.pm-lr-names').hidden = event.target.value === 'presentes'
    }
  })

  return {
    open(proposal) {
      if (destroyed || busy) return
      review = { ...proposal, blocks: proposal.blocks.map(block => ({ ...block, studentIds: [...block.studentIds] })) }
      signature = attendanceSignature(opts.getAlumnos(), opts.getEstado())
      render()
      element.hidden = false
      element.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    },
    destroy() { destroyed = true; element.removeEventListener('click', click); element.remove() },
  }
}
