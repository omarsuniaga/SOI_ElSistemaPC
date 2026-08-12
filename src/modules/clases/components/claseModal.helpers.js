/**
 * Filtra candidatos únicamente por la búsqueda visible del modal.
 * El programa pertenece a la clase, pero no determina elegibilidad del alumno.
 */
export function alumnoCoincideBusqueda({ nombre = '', instrumento = '' } = {}, term = '') {
  return !term || nombre.includes(term) || instrumento.includes(term)
}
