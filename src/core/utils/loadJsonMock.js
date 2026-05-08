/**
 * Utility para cargar archivos JSON desde la carpeta mocks
 * Simula una llamada asíncrona como si fuera a una API
 * @param {string} path - Ruta al archivo JSON (ej: '/assets/data/mocks/alumnos.json')
 * @returns {Promise<object>}
 */
export async function loadJsonMock(path) {
  const MODULE_MAP = {
    '/assets/data/mocks/alumnos.json': () => import('../../assets/data/mocks/alumnos.json'),
    '/assets/data/mocks/clases.json': () => import('../../assets/data/mocks/clases.json'),
    '/assets/data/mocks/sesiones.json': () => import('../../assets/data/mocks/sesiones.json'),
    '/assets/data/mocks/maestro_tareas.json': () => import('../../assets/data/mocks/maestro_tareas.json'),
    '/assets/data/mocks/metricas_periodo.json': () => import('../../assets/data/mocks/metricas_periodo.json'),
    '/assets/data/mocks/alertas_config.json': () => import('../../assets/data/mocks/alertas_config.json'),
    '/assets/data/mocks/objetivos_gamificacion.json': () => import('../../assets/data/mocks/objetivos_gamificacion.json'),
    '/assets/data/mocks/ausencias.json': () => import('../../assets/data/mocks/ausencias.json'),
    '/assets/data/mocks/planificacion-curricular.json': () => import('../../assets/data/mocks/planificacion-curricular.json'),
  }
  
  const loader = MODULE_MAP[path]
  if (loader) {
    const module = await loader()
    return module.default || module
  }
  
  console.warn(`loadJsonMock: ruta no mapeada: ${path}`)
  return null
}

export default { loadJsonMock }