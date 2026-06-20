/**
 * groupPartitioner.js — Pure domain logic for splitting large classes into subgroups.
 *
 * When a clase has more students than the largest active salon can hold,
 * it is split into balanced subgroups (Grupo A, B, C...) so each group
 * fits in an available salon.
 */

const GROUP_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

/**
 * Partitions a single clase into one or more subgroups based on salon capacity.
 *
 * @param {Object} clase - { id, nombre, total_alumnos, ...rest }
 * @param {Array}  salones - [{ id, capacidad, is_active }]
 * @returns {Object[]} Array of clase-shaped objects (1 if no split needed, N if split)
 */
export function partitionClase(clase, salones) {
  const activeSalones = salones.filter(s => s.is_active)
  const maxCapacity = activeSalones.length > 0
    ? Math.max(...activeSalones.map(s => s.capacidad))
    : 1

  const total = clase.total_alumnos || 0

  // No split needed when students fit in largest salon (or 0 students)
  if (total <= maxCapacity) {
    return [{ ...clase, _isSubgroup: false }]
  }

  // Calculate number of groups needed
  const numGroups = Math.ceil(total / maxCapacity)

  // Distribute students as evenly as possible
  const base = Math.floor(total / numGroups)
  const remainder = total % numGroups

  return GROUP_LABELS.slice(0, numGroups).map((label, idx) => {
    const groupTotal = base + (idx < remainder ? 1 : 0)
    return {
      ...clase,
      id: `${clase.id}_grupo_${label}`,
      nombre: `${clase.nombre} — Grupo ${label}`,
      total_alumnos: groupTotal,
      _originalClaseId: clase.id,
      _isSubgroup: true,
      _groupLabel: label
    }
  })
}

/**
 * Partitions an array of clases, expanding those that exceed salon capacity.
 *
 * @param {Object[]} clases  - array of clase objects
 * @param {Object[]} salones - array of salon objects
 * @returns {Object[]} Expanded array with subgroups replacing oversized clases
 */
export function partitionClases(clases, salones) {
  return clases.flatMap(clase => partitionClase(clase, salones))
}
