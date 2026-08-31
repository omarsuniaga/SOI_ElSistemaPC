/**
 * dynamicImport.js — Reintento resiliente para `import()` dinámico.
 *
 * El error "Failed to fetch dynamically imported module" NO es un fallo del
 * código de la vista: es el `import()` que no pudo descargar el chunk desde la
 * URL con hash que el navegador tenía cacheada. Causas típicas:
 *
 *  - DEV: Vite volvió a optimizar dependencias y cambió el sufijo `?v=<hash>`
 *    de los módulos ya cargados (pasa al navegar a una sección con una dep
 *    nueva, o al reiniciarse el dev server con la pestaña abierta).
 *  - PROD: se hizo deploy y los archivos con hash cambiaron mientras el
 *    usuario tenía la pestaña vieja abierta; el manifiesto viejo apunta a
 *    chunks que ya no existen.
 *
 * Estrategia (sin dependencias externas):
 *  1. Reintentar el thunk unas pocas veces con backoff — muchas veces la
 *     re-optimización de Vite ya terminó para el 2º intento.
 *  2. Si todos los reintentos fallan y es un error de carga de módulo,
 *     forzar UN reload completo de la página (guardado en sessionStorage
 *     para que nunca entre en bucle). Al recargar, el navegador baja el
 *     HTML + manifiesto nuevos y el import resuelve.
 *  3. Si el reload ya se intentó en esta sesión, se propaga el error para
 *     que el llamador muestre su placeholder de siempre.
 *
 * Uso:
 *   const { default: Vista } = await importarConReintento(
 *     () => import('./views/reporteMensualView.js'),
 *     { nombre: 'reporte-mensual' },
 *   )
 */

const CLAVE_RELOAD = 'dynImportReload'

/** ¿El error parece un fallo de descarga de chunk (no un error del módulo)? */
function esFalloDeCarga(error) {
  const msg = String(error && (error.message || error) || '').toLowerCase()
  return (
    msg.includes('failed to fetch dynamically imported module') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('importing a module script failed') ||
    // Vite dev: dependencia re-optimizada (chunk viejo -> 504)
    msg.includes('outdated optimize dep') ||
    // Safari / otros
    msg.includes('module script failed')
  )
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * @template T
 * @param {() => Promise<T>} thunk  Debe ser `() => import('./ruta/estatica.js')`
 *   (specifier estático para que Vite pueda analizar y dividir el chunk).
 * @param {object} [opciones]
 * @param {string} [opciones.nombre]        Etiqueta para los logs.
 * @param {number} [opciones.reintentos]    Nº de reintentos antes de recargar (def. 3).
 * @param {number[]} [opciones.backoffMs]   Espera entre intentos (def. 250/750/1500).
 * @param {boolean} [opciones.recargarSiFalla]  Forzar reload como último recurso (def. true).
 * @returns {Promise<T>}
 */
export async function importarConReintento(thunk, opciones = {}) {
  const {
    nombre = 'modulo',
    reintentos = 3,
    backoffMs = [250, 750, 1500],
    recargarSiFalla = true,
  } = opciones

  let ultimoError
  for (let intento = 0; intento <= reintentos; intento++) {
    try {
      return await thunk()
    } catch (error) {
      ultimoError = error
      if (!esFalloDeCarga(error)) throw error // error real del módulo: no reintentar

      if (intento < reintentos) {
        const espera = backoffMs[Math.min(intento, backoffMs.length - 1)] ?? 1500
        console.warn(
          `[dynamicImport] "${nombre}" no cargó (intento ${intento + 1}/${reintentos + 1}); reintentando en ${espera}ms…`,
        )
        await esperar(espera)
        continue
      }

      // Agotados los reintentos: un único reload completo por sesión.
      if (recargarSiFalla && typeof window !== 'undefined') {
        let yaRecargo = false
        try {
          yaRecargo = window.sessionStorage.getItem(CLAVE_RELOAD) === '1'
        } catch { /* sessionStorage bloqueado: seguimos sin él */ }

        if (!yaRecargo) {
          try { window.sessionStorage.setItem(CLAVE_RELOAD, '1') } catch { /* noop */ }
          console.warn(
            `[dynamicImport] "${nombre}" sigue sin cargar tras ${reintentos} reintentos; recargando la página una vez.`,
          )
          window.location.reload()
          // La promesa nunca resuelve: la página se está recargando.
          return await new Promise(() => {})
        }
      }
      throw ultimoError
    }
  }
  throw ultimoError
}

/**
 * Limpia la marca de "ya recargué" — llamar tras una navegación exitosa para
 * que un fallo futuro (otro deploy en la misma sesión) pueda volver a recargar.
 */
export function marcarCargaExitosa() {
  try { window.sessionStorage.removeItem(CLAVE_RELOAD) } catch { /* noop */ }
}

export default importarConReintento
