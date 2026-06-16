/**
 * index.js — Barrel export for the bitacora module.
 *
 * Public surface area intentionally minimal — consumers import specific
 * symbols they need. The adapter and view are the primary public APIs.
 */

// Adapter (read-only public API — do not re-export internals)
export {
  getContenidosDeClase,
  getSemaforoPorClase,
  registrarSesion,
  getHistorialContenido,
  getAlumnosByClase,
} from './api/bitacoraAdapter.js'

// Model
export { BitacoraRegistro } from './models/bitacora.model.js'

// Utility
export { calcularSemaforo, semaforoClass } from './utils/semaforo.js'

// View
export { renderBitacoraView } from './views/bitacoraView.js'

// Router
export { registerRoutesBitacora } from './bitacora.router.js'
