/**
 * Contrato de la barra de categoría de trabajo.
 *
 * La regla que estas pruebas protegen: **la barra nunca confirma sola**. La
 * cobertura curricular que lee la coordinación se alimenta de estas categorías;
 * si el sistema las asignara por su cuenta, esa métrica sería una inferencia
 * presentada como un hecho. Es el mismo defecto que hoy hace que el informe de
 * cierre muestre 100 % de cobertura sobre cero evidencia.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Se mockea `resolverCategoria`, que es lo que el componente importa y llama.
// Mockear `sugerirCategorias` no sirve: `resolverCategoria` la invoca de forma
// interna al módulo y esa llamada no atraviesa el mock de ESM.
vi.mock('../../../api/nodoSesionApi.js', async (importOriginal) => {
  const real = await importOriginal()
  return { ...real, resolverCategoria: vi.fn() }
})

import { createCategoriaTrabajoBar } from '../CategoriaTrabajoBar.js'
import { resolverCategoria, detectarCodigoExplicito, CATEGORIAS } from '../../../api/nodoSesionApi.js'

/** Reproduce la resolución real sin tocar la red. */
function comoResuelve(texto, candidatos = []) {
  const explicito = detectarCodigoExplicito(texto)
  if (explicito) {
    return { codigo: explicito, nombre: CATEGORIAS[explicito], origen: 'explicito', confianza: 'alta', alternativas: [] }
  }
  if (candidatos.length === 0) {
    return { codigo: null, nombre: null, origen: null, confianza: null, alternativas: [] }
  }
  const [mejor, ...resto] = candidatos
  return { codigo: mejor.codigo, nombre: mejor.nombre, origen: 'derivado', confianza: 'alta', alternativas: resto }
}

function montar(opts = {}) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const onChange = vi.fn()
  const bar = createCategoriaTrabajoBar(host, { onChange, ...opts })
  return { bar, host, onChange }
}

describe('CategoriaTrabajoBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    resolverCategoria.mockImplementation(async (t) => comoResuelve(t))
  })

  it('permanece oculta mientras no haya nada que proponer', async () => {
    const { bar } = montar()
    await bar.analizarAhora('')
    expect(bar.el.style.display).toBe('none')
    expect(bar.getCategoria().codigo).toBeNull()
  })

  it('propone sin confirmar: la categoría no se emite hasta que el maestro acepta', async () => {
    resolverCategoria.mockImplementation(async (t) =>
      comoResuelve(t, [{ codigo: 'ESC', nombre: 'Escalas', aciertos: 2 }]))
    const { bar, onChange } = montar()

    await bar.analizarAhora('practicamos escalas en una octava')

    expect(bar.el.textContent).toContain('¿Trabajaste')
    // El defecto que esto previene, escrito como aserción.
    expect(bar.getCategoria().codigo).toBeNull()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('emite la categoría recién cuando el maestro confirma', async () => {
    resolverCategoria.mockImplementation(async (t) =>
      comoResuelve(t, [{ codigo: 'ESC', nombre: 'Escalas', aciertos: 2 }]))
    const { bar, onChange } = montar()
    await bar.analizarAhora('practicamos escalas')

    bar.el.querySelector('[data-accion="confirmar"]').click()

    expect(bar.getCategoria()).toEqual({ codigo: 'ESC', origen: 'derivado' })
    expect(onChange).toHaveBeenCalledWith({ codigo: 'ESC', origen: 'derivado' })
  })

  it('acepta sin preguntar cuando el maestro escribió el código él mismo', async () => {
    const { bar, onChange } = montar()

    await bar.analizarAhora('#todos [detaché largo] >ARC (buen control) 4/5')

    expect(bar.getCategoria()).toEqual({ codigo: 'ARC', origen: 'explicito' })
    expect(onChange).toHaveBeenCalledWith({ codigo: 'ARC', origen: 'explicito' })
    // Resuelto por el código explícito, sin candidatos del servidor.
    expect(bar.el.textContent).toContain('indicado por vos')
  })

  it('no pisa una elección manual del maestro al seguir escribiendo', async () => {
    resolverCategoria.mockImplementation(async (t) =>
      comoResuelve(t, [{ codigo: 'ESC', nombre: 'Escalas', aciertos: 3 }]))
    const { bar } = montar()
    await bar.analizarAhora('escalas')
    bar.el.querySelector('[data-accion="confirmar"]').click()

    bar.el.querySelector('[data-accion="cambiar"]').click()
    bar.el.querySelector('.pm-cat-opt[data-codigo="SON"]').click()
    expect(bar.getCategoria()).toEqual({ codigo: 'SON', origen: 'manual' })

    // Sigue escribiendo y el texto sugiere otra cosa: su elección debe sobrevivir.
    resolverCategoria.mockImplementation(async (t) =>
      comoResuelve(t, [{ codigo: 'ESC', nombre: 'Escalas', aciertos: 5 }]))
    await bar.analizarAhora('escalas escalas escalas octava cromatica')

    expect(bar.getCategoria()).toEqual({ codigo: 'SON', origen: 'manual' })
  })

  it('ofrece las ocho categorías al cambiar', async () => {
    const { bar } = montar()
    await bar.analizarAhora('>ESC')
    bar.el.querySelector('[data-accion="cambiar"]').click()
    expect(bar.el.querySelectorAll('.pm-cat-opt')).toHaveLength(8)
  })

  it('permite quitar la categoría y vuelve a ocultarse', async () => {
    const { bar, onChange } = montar()
    await bar.analizarAhora('>REP')
    bar.el.querySelector('[data-accion="cambiar"]').click()
    bar.el.querySelector('[data-accion="ninguna"]').click()

    expect(bar.getCategoria().codigo).toBeNull()
    expect(bar.el.style.display).toBe('none')
    expect(onChange).toHaveBeenLastCalledWith({ codigo: null, origen: null })
  })

  it('no rompe la vista si el servidor rechaza la consulta', async () => {
    resolverCategoria.mockRejectedValue(new Error('permission denied'))
    const { bar } = montar()

    await expect(bar.analizarAhora('escalas y arpegios')).resolves.toBeUndefined()
    expect(bar.el.style.display).toBe('none')
  })
})
