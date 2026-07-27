import { escapeHTML } from '../../../shared/utils/sanitize.js'
import {
  CATEGORIAS,
  ORIGEN,
  resolverCategoria,
} from '../../api/nodoSesionApi.js'

/**
 * Barra de categoría de trabajo, bajo el editor de registro de clase.
 *
 * El maestro escribe su clase como siempre. Mientras escribe, esta barra propone
 * qué categoría curricular está cubriendo y le ofrece confirmarla con un toque.
 *
 * Tres reglas de comportamiento, en orden de importancia:
 *
 *  1. Nunca confirma sola. La sugerencia queda pendiente hasta que el maestro la
 *     acepta. Una categoría asignada automáticamente convertiría la cobertura que
 *     lee la coordinación en una inferencia disfrazada de hecho.
 *  2. No interrumpe. Es una franja bajo el editor, no un modal ni un paso previo
 *     al guardado. Si el maestro la ignora, la clase se guarda igual.
 *  3. Si el maestro escribió `>ARC`, ya decidió: se marca como confirmada sin
 *     pedirle nada.
 */

const DEBOUNCE_MS = 700

export function createCategoriaTrabajoBar(container, opts = {}) {
  const el = document.createElement('div')
  el.className = 'pm-categoria-bar'
  el.style.cssText = `
    margin-top: .5rem; padding: .6rem .75rem;
    border: 1px solid var(--pm-border, #dee2e6);
    border-radius: 10px;
    background: var(--pm-surface-2, rgba(255,255,255,.03));
    display: none; align-items: center; gap: .6rem; flex-wrap: wrap;
    font-size: .82rem;
  `
  container.appendChild(el)

  let estado = {
    codigo: opts.codigoInicial ?? null,
    origen: opts.origenInicial ?? null,
    confirmada: Boolean(opts.codigoInicial),
    alternativas: [],
    cargando: false,
  }
  let timer = null
  let ultimoTexto = ''

  function emitir() {
    opts.onChange?.({
      codigo: estado.confirmada ? estado.codigo : null,
      origen: estado.confirmada ? estado.origen : null,
    })
  }

  function render() {
    if (!estado.codigo && !estado.cargando) {
      el.style.display = 'none'
      el.innerHTML = ''
      return
    }
    el.style.display = 'flex'

    if (estado.cargando && !estado.codigo) {
      el.innerHTML = `<span class="text-muted">Analizando el registro…</span>`
      return
    }

    const nombre = CATEGORIAS[estado.codigo] ?? estado.codigo

    if (estado.confirmada) {
      el.innerHTML = `
        <i class="bi bi-check-circle-fill" style="color:var(--pm-success,#10b981);"></i>
        <span>Trabajo registrado en <strong>${escapeHTML(nombre)}</strong></span>
        ${estado.origen === ORIGEN.EXPLICITO
          ? '<span class="pm-cat-hint">indicado por vos con <code>&gt;' + escapeHTML(estado.codigo) + '</code></span>'
          : ''}
        <button type="button" class="pm-cat-link" data-accion="cambiar">Cambiar</button>
      `
    } else {
      const alts = estado.alternativas.slice(0, 2)
      el.innerHTML = `
        <i class="bi bi-lightbulb" style="color:var(--pm-warning,#f59e0b);"></i>
        <span>¿Trabajaste <strong>${escapeHTML(nombre)}</strong>?</span>
        <button type="button" class="pm-cat-btn" data-accion="confirmar">Sí, confirmar</button>
        ${alts.map(a => `
          <button type="button" class="pm-cat-link" data-accion="elegir" data-codigo="${escapeHTML(a.codigo)}">
            ${escapeHTML(a.nombre)}
          </button>`).join('')}
        <button type="button" class="pm-cat-link" data-accion="otra">Otra…</button>
      `
    }
  }

  function abrirSelector() {
    const opciones = Object.entries(CATEGORIAS)
      .map(([c, n]) => `<button type="button" class="pm-cat-opt" data-codigo="${c}">${escapeHTML(n)}</button>`)
      .join('')
    el.innerHTML = `
      <span class="text-muted">Categoría trabajada:</span>
      <div style="display:flex;flex-wrap:wrap;gap:.35rem;">${opciones}</div>
      <button type="button" class="pm-cat-link" data-accion="ninguna">Ninguna</button>
    `
  }

  el.addEventListener('click', (e) => {
    const btn = e.target.closest('button')
    if (!btn) return

    const { accion, codigo } = btn.dataset

    if (accion === 'confirmar') {
      estado.confirmada = true
      estado.origen = ORIGEN.DERIVADO
    } else if (accion === 'elegir') {
      estado.codigo = codigo
      estado.confirmada = true
      estado.origen = ORIGEN.MANUAL
    } else if (accion === 'cambiar' || accion === 'otra') {
      abrirSelector()
      return
    } else if (accion === 'ninguna') {
      estado.codigo = null
      estado.confirmada = false
      estado.alternativas = []
    } else if (codigo) {
      estado.codigo = codigo
      estado.confirmada = true
      estado.origen = ORIGEN.MANUAL
    } else {
      return
    }

    render()
    emitir()
  })

  /**
   * Analiza el texto y propone. No pisa una elección ya confirmada por el
   * maestro: lo que él decidió gana sobre cualquier inferencia posterior.
   */
  async function analizar(texto) {
    if (texto === ultimoTexto) return
    ultimoTexto = texto

    if (estado.confirmada && estado.origen === ORIGEN.MANUAL) return

    estado.cargando = true
    render()

    try {
      const r = await resolverCategoria(texto)

      if (!r.codigo) {
        if (!estado.confirmada) {
          estado.codigo = null
          estado.alternativas = []
        }
      } else if (r.origen === ORIGEN.EXPLICITO) {
        // Escribió >CODIGO: ya decidió, no hay nada que preguntarle.
        estado.codigo = r.codigo
        estado.origen = ORIGEN.EXPLICITO
        estado.confirmada = true
        estado.alternativas = []
        emitir()
      } else if (!estado.confirmada) {
        estado.codigo = r.codigo
        estado.origen = r.origen
        estado.alternativas = r.alternativas ?? []
      }
    } catch (err) {
      console.warn('[CategoriaTrabajoBar]', err.message)
    } finally {
      estado.cargando = false
      render()
    }
  }

  function onTextoCambia(texto) {
    clearTimeout(timer)
    timer = setTimeout(() => analizar(texto ?? ''), DEBOUNCE_MS)
  }

  render()

  return {
    el,
    onTextoCambia,
    analizarAhora: (texto) => analizar(texto ?? ''),
    getCategoria: () => (estado.confirmada
      ? { codigo: estado.codigo, origen: estado.origen }
      : { codigo: null, origen: null }),
    destroy: () => { clearTimeout(timer); el.remove() },
  }
}
