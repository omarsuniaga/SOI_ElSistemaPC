import alumnosMockData from '../../../assets/data/mocks/alumnos.json'

// Simulación de delay para que se sienta como una API real (0ms en modo test)
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') ? 0 : ms))

// Simulated active class enrollments for Demo/Mock Mode
const inscripciones = [
  { alumno_id: '1', clase_id: 'clase_001', clase_nombre: 'Violín Principiantes A' },
  { alumno_id: '1', clase_id: 'clase_005', clase_nombre: 'Coro Infantil' },
  { alumno_id: '2', clase_id: 'clase_001', clase_nombre: 'Violín Principiantes A' },
  { alumno_id: '4', clase_id: 'clase_004', clase_nombre: 'Flauta Travesera' },
]

// Catálogo y membresías deterministas para demostrar la clasificación en Modo Demo.
const programas = [
  { id: 'prog_001', nombre: 'Programa de Cuerdas' },
  { id: 'prog_002', nombre: 'Programa de Vientos' },
  { id: 'prog_003', nombre: 'Programa Coral' },
]

const alumnosProgramas = alumnosMockData.flatMap((alumno, index) => {
  if (index % 11 === 0) return []
  const first = programas[index % programas.length]
  const memberships = [{ alumno_id: alumno.id, programa_id: first.id, activo: true }]
  if (index % 7 === 0) {
    const second = programas[(index + 1) % programas.length]
    memberships.push({ alumno_id: alumno.id, programa_id: second.id, activo: true })
  }
  return memberships
})

function getProgramasForAlumno(alumnoId) {
  const programMap = new Map(programas.map(programa => [programa.id, programa]))
  const uniquePrograms = new Map()

  for (const membership of alumnosProgramas.filter(item => item.alumno_id === alumnoId && item.activo !== false)) {
    const programa = programMap.get(membership.programa_id)
    if (programa && !uniquePrograms.has(programa.id)) uniquePrograms.set(programa.id, programa)
  }

  return [...uniquePrograms.values()]
}

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
    programas: getProgramasForAlumno(a.id),
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

const MOCK_STORAGE_KEY = 'soi_mock_alumnos'
function getSavedAlumnos() {
  try {
    if (typeof localStorage !== 'undefined' && (typeof process === 'undefined' || process.env.NODE_ENV !== 'test')) {
      const saved = localStorage.getItem(MOCK_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
        if (Array.isArray(parsed?.alumnos)) return parsed.alumnos
        if (Array.isArray(parsed?.data)) return parsed.data
      }
    }
  } catch (e) {}
  return Array.isArray(alumnosMockData) ? [...alumnosMockData] : []
}

function saveAlumnos(list) {
  try {
    if (typeof localStorage !== 'undefined' && (typeof process === 'undefined' || process.env.NODE_ENV !== 'test')) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(list))
    }
  } catch (e) {}
}

let alumnos = getSavedAlumnos()

export async function obtenerAlumnos({ page = 0, pageSize = 100, soloActivos = true } = {}) {
  await delay()
  let list = Array.isArray(alumnos) ? alumnos : getSavedAlumnos()
  if (soloActivos) {
    list = list.filter(a => a.activo !== false && a.is_active !== false)
  }
  const from = page * pageSize
  const to = from + pageSize
  const paginated = list.slice(from, to)
  return { alumnos: paginated.map(normalizeAlumno), total: list.length }
}

export async function obtenerAlumnosInactivos({ page = 0, pageSize = 100 } = {}) {
  await delay()
  const list = (Array.isArray(alumnos) ? alumnos : getSavedAlumnos())
    .filter(a => a.activo === false || a.is_active === false)
  const from = page * pageSize
  const to = from + pageSize
  const paginated = list.slice(from, to)
  return { alumnos: paginated.map(normalizeAlumno), total: list.length }
}

export async function obtenerAlumno(id) {
  await delay()
  const list = Array.isArray(alumnos) ? alumnos : getSavedAlumnos()
  const alumno = list.find(a => a.id === id)
  if (!alumno) throw new Error('Alumno no encontrado (Demo)')
  return normalizeAlumno(alumno)
}

export async function crearAlumno(alumno) {
  await delay()
  if (!Array.isArray(alumnos)) alumnos = getSavedAlumnos()
  const nuevo = {
    ...alumno,
    id: Math.random().toString(36).substr(2, 9),
    nombre_completo: alumno.nombre || alumno.nombre_completo,
    activo: alumno.is_active !== undefined ? alumno.is_active : true
  }
  alumnos.push(nuevo)
  saveAlumnos(alumnos)
  return normalizeAlumno(nuevo)
}

export async function actualizarAlumno(id, actualizaciones) {
  await delay()
  if (!Array.isArray(alumnos)) alumnos = getSavedAlumnos()
  const index = alumnos.findIndex(a => a.id === id)
  if (index === -1) throw new Error('Alumno no encontrado (Demo)')
  
  alumnos[index] = { ...alumnos[index], ...actualizaciones }
  saveAlumnos(alumnos)
  return normalizeAlumno(alumnos[index])
}

export async function inactivarAlumno(id) {
  await delay()
  return actualizarAlumno(id, { activo: false, is_active: false })
}

export async function reactivarAlumno(id) {
  await delay()
  return actualizarAlumno(id, { activo: true, is_active: true })
}

export async function eliminarAlumno(id) {
  await delay()
  return inactivarAlumno(id)
}


export async function validarEmail(email) {
  await delay(100)
  const list = Array.isArray(alumnos) ? alumnos : getSavedAlumnos()
  return list.some(a => a.correo_representante === email.trim().toLowerCase())
}

export async function validarCedula(cedula) {
  await delay(100)
  const list = Array.isArray(alumnos) ? alumnos : getSavedAlumnos()
  return list.some(a => a.representante_cedula === cedula.trim())
}

export async function obtenerInscripcionesAlumno(alumnoId) {
  await delay(200)
  return (inscripciones || [])
    .filter(i => i.alumno_id === alumnoId)
    .map(i => ({
      clase_id: i.clase_id,
      clase_nombre: i.clase_nombre
    }))
}

export async function obtenerAlumnosPorMes(year, month) {
  await delay(300)
  const list = Array.isArray(alumnos) ? alumnos : getSavedAlumnos()
  return list
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
  const list = Array.isArray(alumnos) ? alumnos : getSavedAlumnos()
  let result = [...list]

  // Filtrar por alumnos activos
  if (soloActivos) {
    result = (result || []).filter(a => a && a.activo !== false && a.is_active !== false)
  }

  // Filtrar por clase
  if (id_clase) {
    const alumnoIds = (inscripciones || [])
      .filter(i => i.clase_id === id_clase)
      .map(i => i.alumno_id)
    result = (result || []).filter(a => a && alumnoIds.includes(a.id))
  }

  // Filtrar por instrumento
  if (instrumento) {
    result = (result || []).filter(a => a && a.instrumento_principal === instrumento)
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

export async function verificarEliminacionAlumno(alumnoId) {
  await delay()
  const studentClasses = (inscripciones || []).filter(i => i.alumno_id === alumnoId)
  return {
    canDelete: studentClasses.length === 0,
    activeClasses: studentClasses.map(i => i.clase_nombre)
  }
}

export async function obtenerProgresoAlumno(alumnoId) {
  await delay()
  return []
}

export async function obtenerResumenAcademico(alumnoId) {
  await delay()
  return { nivel: null, promedioBase: null, totalEvaluaciones: 0, promedioEvaluaciones: null, promedioActualizado: null }
}

export async function obtenerResumenAcademicoIntegrado(alumnoId) {
  await delay()
  return {
    alumno_id: alumnoId,
    total_indicator_attempts: 0,
    total_indicator_attempts_with_note: 0,
    indicadores_aprobados: 0,
    promedio_indicator_attempts: null,
    total_star_evaluations: 0,
    total_star_evaluations_with_note: 0,
    estrellas_aprobadas: 0,
    promedio_star_evaluations: null,
    promedio_integrado: null,
    historial_indicator_attempts: [],
    historial_star_evaluations: [],
  }
}

export async function obtenerAsistenciasAlumno(alumnoId) {
  await delay()
  return []
}

export async function obtenerTodosLosAlumnosParaAnalisis() {
  await delay()
  const list = Array.isArray(alumnos) ? alumnos : getSavedAlumnos()
  return list.map(normalizeAlumno)
}

export async function fusionarAlumnos({ principalId, obsoletoId, datosFusion }) {
  await delay(300)
  if (!Array.isArray(alumnos)) alumnos = getSavedAlumnos()
  const indexPrincipal = alumnos.findIndex(a => a.id === principalId)
  if (indexPrincipal === -1) throw new Error('El alumno principal (a conservar) no existe (Demo)')
  if (!alumnos.some(a => a.id === obsoletoId)) throw new Error('El alumno obsoleto (a eliminar) no existe (Demo)')
  if (principalId === obsoletoId) throw new Error('No se puede fusionar un alumno consigo mismo')

  alumnos[indexPrincipal] = { ...alumnos[indexPrincipal], ...(datosFusion || {}) }
  alumnos = alumnos.filter(a => a.id !== obsoletoId)
  saveAlumnos(alumnos)

  return {
    success: true,
    principal_id: principalId,
    obsoleto_id: obsoletoId,
    eliminado: true,
    tablas_migradas: [
      { tabla: 'alumnos_clases', column: 'alumno_id', migradas: 1 },
      { tabla: 'progresos', column: 'alumno_id', migradas: 0 },
    ],
  }
}

export async function obtenerInscripcionesDetalladasAlumno(alumnoId) {
  await delay()
  return [
    { id: 'clase_001', nombre: 'Violín Principiantes A', clase_horarios: [{ dia: 'Lunes', hora_inicio: '14:00:00' }] }
  ]
}
