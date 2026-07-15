// ==============================================================================
// eligibility.js
// Lógica de negocio para validación de elegibilidad académica.
// Opera con propiedades semánticas desacopladas de la base de datos física.
// ==============================================================================

export function isEligible(evaluation) {
  if (!evaluation || !evaluation.student_id || !evaluation.jurado_id) {
    return false
  }

  // Criterios descriptivos de dominio limpio
  const criteria = ['afinacion', 'ritmo', 'postura', 'musicalidad']
  for (const key of criteria) {
    const val = evaluation[key]
    if (val === null || val === undefined || !Number.isInteger(val) || val < 1 || val > 5) {
      return false
    }
  }

  return true
}
