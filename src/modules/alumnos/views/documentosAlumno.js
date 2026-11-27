import { obtenerAlumno, obtenerInscripcionesDetalladasAlumno } from '../api/alumnosApi.js'
import { descargarFichaAlumno, generarHorarioAlumno } from '../domain/generarPdfInscripcion.js'

export async function descargarDocumentoIndividual(id, tipo) {
  const [alumno, clases] = await Promise.all([obtenerAlumno(id), obtenerInscripcionesDetalladasAlumno(id)])
  if (!alumno) throw new Error('Alumno no encontrado.')
  if (tipo === 'ficha') return descargarFichaAlumno(alumno, clases)
  generarHorarioAlumno(alumno, clases).save(`horario-${alumno.nombre_completo || alumno.nombre}.pdf`)
}
