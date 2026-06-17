import { config } from '../../../core/config/config.js'
import * as supabaseImpl from './alumnosSupabase.js'
import * as mockImpl from './alumnosMock.js'
import { iniciacionMusicalPolicy } from '../domain/iniciacionMusicalPolicy.js'

// El dispatcher elige qué implementación usar basándose en la configuración global
const getApi = () => config.isDemoMode ? mockImpl : supabaseImpl

export const obtenerAlumnos = (...args) => getApi().obtenerAlumnos(...args)
export const getAlumnos = (...args) => getApi().obtenerAlumnos(...args) // Alias para compatibilidad
export const obtenerAlumno = (...args) => getApi().obtenerAlumno(...args)

/**
 * Create a new alumno from a wizard InscripcionDraft.
 * Applies iniciacionMusicalPolicy before delegating to the adapter.
 *
 * @param {import('../domain/inscripcionDraftSchema.js').InscripcionDraft} draft
 */
export async function crearAlumno(draft) {
  // Apply the policy to compute iniciacion_musical fields
  const fechaIngreso = draft.fecha_ingreso ?? new Date().toISOString().slice(0, 10)
  const policyResult = iniciacionMusicalPolicy(draft, fechaIngreso)

  const payload = {
    ...draft,
    ...policyResult,
    fecha_aceptacion_compromisos: draft.fecha_aceptacion_compromisos ?? new Date().toISOString(),
  }

  return getApi().crearAlumno(payload)
}
export const actualizarAlumno = (...args) => getApi().actualizarAlumno(...args)
export const eliminarAlumno = (...args) => getApi().eliminarAlumno(...args)
export const validarEmail = (...args) => getApi().validarEmail(...args)
export const validarCedula = (...args) => getApi().validarCedula(...args)
export const obtenerInscripcionesAlumno = (...args) => getApi().obtenerInscripcionesAlumno(...args)
export const obtenerAlumnosPorMes = (...args) => getApi().obtenerAlumnosPorMes(...args)
export const obtenerAlumnosFiltradosYOrdenados = (...args) => getApi().obtenerAlumnosFiltradosYOrdenados(...args)

// Re-exportar constantes (copiadas para evitar problemas de inicialización circular)
export const PARENTESCOS = [
  { value: 'madre', label: 'Madre' },
  { value: 'padre', label: 'Padre' },
  { value: 'abuela', label: 'Abuela/Abuelo' },
  { value: 'tia', label: 'Tía/Tío' },
  { value: 'hermana', label: 'Hermana/Hermano' },
  { value: 'tutor', label: 'Tutor Legal' },
  { value: 'otro', label: 'Otro' },
]

export const getParentescoLabel = (value) => {
  const p = PARENTESCOS.find(x => x.value === value)
  return p ? p.label : value
}
