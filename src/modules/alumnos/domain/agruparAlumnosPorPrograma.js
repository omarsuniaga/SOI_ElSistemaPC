const UNASSIGNED_GROUP = {
  key: 'sin-programa-asignado',
  nombre: 'Sin programa asignado',
}

const MULTIPLE_PROGRAMS_GROUP = {
  key: 'multiple-programas',
  nombre: 'Más de un programa',
}

function getActivePrograms(alumno) {
  const programs = Array.isArray(alumno?.programas) ? alumno.programas : []
  const uniquePrograms = new Map()

  for (const program of programs) {
    if (!program || program.activo === false || !program.id) continue
    if (!uniquePrograms.has(program.id)) {
      uniquePrograms.set(program.id, {
        id: program.id,
        nombre: program.nombre || `Programa ${program.id}`,
      })
    }
  }

  return [...uniquePrograms.values()]
}

export function agruparAlumnosPorPrograma(alumnos = []) {
  const groups = new Map()

  for (const alumno of alumnos) {
    const programs = getActivePrograms(alumno)
    const group = programs.length === 0
      ? UNASSIGNED_GROUP
      : programs.length > 1
        ? MULTIPLE_PROGRAMS_GROUP
        : { key: `programa:${programs[0].id}`, nombre: programs[0].nombre }

    if (!groups.has(group.key)) {
      groups.set(group.key, { ...group, alumnos: [] })
    }

    groups.get(group.key).alumnos.push({ ...alumno, programas: programs })
  }

  return [...groups.values()].sort((a, b) => {
    if (a.key === UNASSIGNED_GROUP.key) return 1
    if (b.key === UNASSIGNED_GROUP.key) return -1
    if (a.key === MULTIPLE_PROGRAMS_GROUP.key) return 1
    if (b.key === MULTIPLE_PROGRAMS_GROUP.key) return -1
    return a.nombre.localeCompare(b.nombre, 'es')
  })
}
