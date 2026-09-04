export { registerRoutesPedagogico } from './pedagogico.router.js'
export {
  resolverContactoAlumno,
  getPeriodoActivo,
  fetchSeguimientoAusentes,
  fetchHistorialSeguimiento,
  registrarContacto,
  enviarSeguimientoAusentismo,
  reiniciarContadorAusencias,
  suspenderAlumno,
  levantarSuspension,
  crearRetencion,
  levantarRetencion,
  enviarRetencionNivel3,
  reincorporarAlumno,
  fetchKpisAusentismo,
  fetchCasosCerrados,
} from './services/seguimientoAusentesService.js'
