import { escapeHTML } from '../../../shared/utils/sanitize.js'
import {
  obtenerPlanDeClase,
  guardarPlanDeClase,
  duplicarPlanParaPeriodo,
  obtenerApoyoCurricular,
  listarPeriodos,
  arregloALineas,
} from '../../api/planClaseApi.js'

/**
 * Panel "Mi Plan" del modal de clase.
 *
 * Dos decisiones que gobiernan este componente:
 *
 *  1. **El plan no depende del currículo.** El maestro puede escribirlo aunque su
 *     instrumento no tenga ruta cargada. Hoy viola y orquesta están así — cuatro
 *     de once clases — y bloquearlos sería castigarlos por un hueco que no
 *     crearon ellos.
 *  2. **El hueco se muestra, no se esconde.** Cuando falta el currículo se dice
 *     con todas las letras y a quién pedirlo. Un panel que simplemente aparece
 *     vacío se lee como que el sistema está roto.
 */

const CAMPOS_LISTA = [
  ['contenidos', 'Contenidos', 'Un contenido por línea'],
  ['obras', 'Obras y repertorio', 'Una obra por línea'],
  ['tecnicas', 'Técnicas', 'Una técnica por línea'],
  ['escalas_arpegios', 'Escalas y arpegios', 'Una por línea'],
]

export function createPlanClasePanel(container, { clase, periodoActivo = null, onCambio } = {}) {
  let plan = null
  let apoyo = []
  let periodos = []
  let cargando = true
  let error = null

  function aviso(tono, titulo, detalle) {
    return `
      <div style="border-left:3px solid var(--pm-${tono},#f59e0b); background:var(--pm-surface-2,rgba(0,0,0,.03));
                  padding:.85rem 1rem; border-radius:0 10px 10px 0; margin-bottom:1rem;">
        <div style="font-weight:700; font-size:.88rem; margin-bottom:.2rem;">${escapeHTML(titulo)}</div>
        <div style="font-size:.82rem; color:var(--pm-text-muted); line-height:1.5;">${detalle}</div>
      </div>`
  }

  function render() {
    if (cargando) {
      container.innerHTML = `<div style="text-align:center; padding:2.5rem;">
        <div class="spinner-border text-primary" role="status"></div></div>`
      return
    }
    if (error) {
      container.innerHTML = aviso('danger', 'No se pudo cargar el plan', escapeHTML(error))
      return
    }

    const p = plan ?? {}
    const sinCurriculo = apoyo.length === 0

    container.innerHTML = `
      ${sinCurriculo ? aviso('warning',
        `Todavía no hay currículo de ${escapeHTML(clase.instrumento || 'este instrumento')}`,
        'Podés escribir tu plan igual: no necesitás la ruta para planificar. Cuando la coordinación cargue el currículo, ' +
        'vas a poder apoyarte en él para completar los contenidos.') : ''}

      ${plan ? '' : aviso('primary', 'Esta clase todavía no tiene plan',
        'Completá los campos y guardá. Podés dejarlo en borrador y seguir después.')}

      <form id="pcp-form" style="display:grid; gap:1rem;">
        <div style="display:grid; gap:1rem; grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));">
          <div>
            <label class="form-label" style="font-size:.78rem; font-weight:700; color:var(--pm-text-muted);">Título del plan *</label>
            <input name="titulo" class="form-control form-control-sm rounded-3" required
              style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border);"
              placeholder="Ej: Plan Violas — Semestre 2026-II"
              value="${escapeHTML(p.titulo || '')}">
          </div>
          <div>
            <label class="form-label" style="font-size:.78rem; font-weight:700; color:var(--pm-text-muted);">Período</label>
            <input name="periodo_nombre" class="form-control form-control-sm rounded-3" readonly
              style="background:var(--pm-surface-2,rgba(0,0,0,.04)); color:var(--pm-text-muted); border-color:var(--pm-border);"
              value="${escapeHTML(p.periodo_nombre || periodoActivo?.nombre || 'Sin período activo')}">
          </div>
        </div>

        <div>
          <label class="form-label" style="font-size:.78rem; font-weight:700; color:var(--pm-text-muted);">Descripción</label>
          <textarea name="descripcion" rows="2" class="form-control form-control-sm rounded-3"
            style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
            placeholder="Qué se propone lograr esta clase durante el período.">${escapeHTML(p.descripcion || '')}</textarea>
        </div>

        ${apoyo.length === 0 ? '' : `
          <div>
            <div style="font-size:.78rem; font-weight:700; color:var(--pm-text-muted); margin-bottom:.4rem;">
              Apoyo del currículo · tocá para agregar a contenidos
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:.35rem;">
              ${apoyo.map((n) => `
                <button type="button" class="pcp-chip" data-agregar="${escapeHTML(n.name)}">
                  ${escapeHTML(n.codigo)} · ${escapeHTML(n.name)}
                </button>`).join('')}
            </div>
          </div>`}

        <div style="display:grid; gap:1rem; grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));">
          ${CAMPOS_LISTA.map(([campo, etiqueta, ayuda]) => `
            <div>
              <label class="form-label" style="font-size:.78rem; font-weight:700; color:var(--pm-text-muted);">${etiqueta}</label>
              <textarea name="${campo}" rows="4" class="form-control form-control-sm rounded-3"
                style="background:var(--pm-surface); color:var(--pm-text); border-color:var(--pm-border); resize:vertical;"
                placeholder="${ayuda}">${escapeHTML(arregloALineas(p[campo]))}</textarea>
            </div>`).join('')}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; gap:.75rem; flex-wrap:wrap;">
          <div id="pcp-msg" style="font-size:.82rem;"></div>
          <div style="display:flex; gap:.5rem;">
            ${plan ? `<button type="button" id="pcp-duplicar" class="btn btn-sm btn-outline-secondary rounded-3">
              Reusar en otro período</button>` : ''}
            <button type="submit" class="btn btn-sm btn-primary px-4 rounded-3" style="font-weight:600;">
              ${plan ? 'Guardar cambios' : 'Crear plan'}
            </button>
          </div>
        </div>
      </form>

      <style>
        .pcp-chip {
          padding:.25rem .6rem; border-radius:14px; font-size:.74rem;
          border:1px solid var(--pm-border); background:var(--pm-surface-2,rgba(0,0,0,.03));
          color:var(--pm-text-muted); cursor:pointer;
        }
        .pcp-chip:hover { background:var(--pm-primary); color:#fff; border-color:var(--pm-primary); }
        .pcp-chip:focus-visible { outline:2px solid var(--pm-primary); outline-offset:2px; }
      </style>`

    _enlazar()
  }

  function mensaje(texto, tono = 'success') {
    const el = container.querySelector('#pcp-msg')
    if (!el) return
    el.textContent = texto
    el.style.color = tono === 'success' ? 'var(--pm-success,#10b981)' : 'var(--pm-danger,#ef4444)'
    if (tono === 'success') setTimeout(() => { if (el.textContent === texto) el.textContent = '' }, 4000)
  }

  function _enlazar() {
    // Chips del currículo: agregan el nodo al textarea de contenidos.
    container.querySelectorAll('[data-agregar]').forEach((b) => {
      b.addEventListener('click', () => {
        const ta = container.querySelector('textarea[name="contenidos"]')
        if (!ta) return
        const actual = ta.value.trim()
        const nuevo = b.dataset.agregar
        if (actual.split('\n').some((l) => l.trim() === nuevo)) return
        ta.value = actual ? `${actual}\n${nuevo}` : nuevo
        ta.focus()
      })
    })

    const form = container.querySelector('#pcp-form')
    form?.addEventListener('submit', async (e) => {
      e.preventDefault()
      const btn = form.querySelector('button[type="submit"]')
      const textoOriginal = btn.textContent
      btn.disabled = true
      btn.textContent = 'Guardando…'

      try {
        const fd = new FormData(form)
        const guardado = await guardarPlanDeClase({
          id: plan?.id,
          clase_id: clase.id,
          instrumento: clase.instrumento,
          periodo_nombre: periodoActivo?.nombre ?? plan?.periodo_nombre ?? null,
          fecha_inicio: periodoActivo?.fecha_inicio ?? null,
          fecha_fin: periodoActivo?.fecha_fin ?? null,
          titulo: fd.get('titulo'),
          descripcion: fd.get('descripcion'),
          contenidos: fd.get('contenidos'),
          obras: fd.get('obras'),
          tecnicas: fd.get('tecnicas'),
          escalas_arpegios: fd.get('escalas_arpegios'),
        })
        const eraNuevo = !plan
        plan = guardado
        render()
        mensaje(eraNuevo ? 'Plan creado.' : 'Cambios guardados.')
        onCambio?.(guardado)
      } catch (err) {
        btn.disabled = false
        btn.textContent = textoOriginal
        mensaje(err.message, 'error')
      }
    })

    container.querySelector('#pcp-duplicar')?.addEventListener('click', async () => {
      const otros = periodos.filter((pe) => pe.nombre !== plan?.periodo_nombre)
      if (otros.length === 0) {
        mensaje('No hay otro período al cual copiar.', 'error')
        return
      }
      const destino = otros.find((pe) => pe.activo) ?? otros[0]
      if (!window.confirm(
        `Se copiará este plan a "${destino.nombre}" como borrador.\n\n` +
        `El plan actual no se modifica.`,
      )) return

      try {
        await duplicarPlanParaPeriodo(plan.id, {
          periodoNombre: destino.nombre,
          fechaInicio: destino.fecha_inicio,
          fechaFin: destino.fecha_fin,
        })
        mensaje(`Copiado a "${destino.nombre}" como borrador.`)
      } catch (err) {
        mensaje(err.message, 'error')
      }
    })
  }

  async function cargar() {
    cargando = true
    render()
    try {
      const [p, a, pe] = await Promise.all([
        obtenerPlanDeClase(clase.id, periodoActivo?.nombre ?? null),
        obtenerApoyoCurricular(clase.id).catch(() => []),
        listarPeriodos().catch(() => []),
      ])
      plan = p
      apoyo = a
      periodos = pe
      error = null
    } catch (err) {
      error = err.message
    } finally {
      cargando = false
      render()
    }
  }

  cargar()

  return {
    recargar: cargar,
    getPlan: () => plan,
  }
}
