import alumnosMockData from '../../../assets/data/mocks/alumnos.json'

// Simulación de delay para que se sienta como una API real
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

function normalizeAlumno(a) {
  if (!a) return null
  const studentClasses = (inscripciones || [])
    .filter(i => i.alumno_id === a.id)
    .map(i => i.clase_nombre)
    .join(', ') || 'Sin clases'
  return {
    ...a,
    nombre: a.nombre_completo ?? '',
    email: a.correo_representante ?? '',
    instrumento: a.instrumento_principal ?? '',
    is_active: a.activo ?? true,
    clases: studentClasses,
    contacto_emergencia_nombre: a.contacto_emergencia_nombre ?? '',
    contacto_emergencia_telefono: a.contacto_emergencia_telefono ?? '',
    contacto_emergencia_parentesco: a.contacto_emergencia_parentesco ?? '',
    familiar_nombre: a.familiar_nombre ?? '',
    familiar_telefono: a.familiar_telefono ?? '',
    familiar_parentesco: a.familiar_parentesco ?? '',
    condiciones_medicas: a.condiciones_medicas ?? '',
    alergias: a.alergias ?? '',
    medicamentos: a.medicamentos ?? '',
  }
}

// Persistencia en memoria local (solo por sesión para el demo)
let alumnos = [...alumnosMockData]

export async function obtenerAlumnos() {
  await delay()
  return alumnos.map(normalizeAlumno)
}

export async function obtenerAlumno(id) {
  await delay()
  const alumno = alumnos.find(a => a.id === id)
  if (!alumno) throw new Error('Alumno no encontrado (Demo)')
  return normalizeAlumno(alumno)
}

export async function crearAlumno(alumno) {
  await delay()
  const nuevo = {
    ...alumno,
    id: Math.random().toString(36).substr(2, 9),
    nombre_completo: alumno.nombre || alumno.nombre_completo,
    activo: alumno.is_active !== undefined ? alumno.is_active : true
  }
  alumnos.push(nuevo)
  return normalizeAlumno(nuevo)
}

export async function actualizarAlumno(id, actualizaciones) {
  await delay()
  const index = alumnos.findIndex(a => a.id === id)
  if (index === -1) throw new Error('Alumno no encontrado (Demo)')
  
  alumnos[index] = { ...alumnos[index], ...actualizaciones }
  return normalizeAlumno(alumnos[index])
}

export async function eliminarAlumno(id) {
  await delay()
  alumnos = alumnos.filter(a => a.id !== id)
}

export async function validarEmail(email) {
  await delay(100)
  return alumnos.some(a => a.correo_representante === email.trim().toLowerCase())
}

export async function validarCedula(cedula) {
  await delay(100)
  return alumnos.some(a => a.representante_cedula === cedula.trim())
}

// Simulated active class enrollments for Demo/Mock Mode
let inscripciones = [
  { alumno_id: '1', clase_id: 'clase_001', clase_nombre: 'Violín Principiantes A' },
  { alumno_id: '1', clase_id: 'clase_005', clase_nombre: 'Coro Infantil' },
  { alumno_id: '2', clase_id: 'clase_001', clase_nombre: 'Violín Principiantes A' },
  { alumno_id: '4', clase_id: 'clase_004', clase_nombre: 'Flauta Travesera' },
]

export async function obtenerInscripcionesAlumno(alumnoId) {
  await delay(200)
  return inscripciones
    .filter(i => i.alumno_id === alumnoId)
    .map(i => ({
      clase_id: i.clase_id,
      clase_nombre: i.clase_nombre
    }))
}

export async function obtenerAlumnosPorMes(year, month) {
  await delay(300)
  return alumnos
    .filter(a => {
      const d = new Date(a.created_at ?? a.fecha_ingreso ?? '')
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
    .map(normalizeAlumno)
}

/**
 * Simulación de consulta de alumnos en Supabase con filtros y ordenamiento en modo Demo.
 */
export async function obtenerAlumnosFiltradosYOrdenados({
  id_clase,
  instrumento,
  ordenEdadAsc,
  ordenInstrumentoAsc,
  soloActivos = true
} = {}) {
  await delay()
  let result = [...alumnos]

  // Filtrar por alumnos activos
  if (soloActivos) {
    result = result.filter(a => a.activo !== false && a.is_active !== false)
  }

  // Filtrar por clase
  if (id_clase) {
    const alumnoIds = inscripciones
      .filter(i => i.clase_id === id_clase)
      .map(i => i.alumno_id)
    result = result.filter(a => alumnoIds.includes(a.id))
  }

  // Filtrar por instrumento
  if (instrumento) {
    result = result.filter(a => a.instrumento_principal === instrumento)
  }

  // Ordenar
  result.sort((a, b) => {
    if (ordenInstrumentoAsc !== undefined) {
      const instA = a.instrumento_principal || ''
      const instB = b.instrumento_principal || ''
      const cmp = instA.localeCompare(instB)
      if (cmp !== 0) {
        return ordenInstrumentoAsc ? cmp : -cmp
      }
    }

    if (ordenEdadAsc !== undefined) {
      const dateA = a.fecha_nacimiento ? new Date(a.fecha_nacimiento) : new Date(0)
      const dateB = b.fecha_nacimiento ? new Date(b.fecha_nacimiento) : new Date(0)
      // Edad ascendente (más joven a más viejo) = fecha_nacimiento de más nueva a más vieja (descendente)
      // dateB - dateA
      const cmp = dateB - dateA
      return ordenEdadAsc ? cmp : -cmp
    }

    return 0
  })

  return result.map(normalizeAlumno)
}
