/**
 * ausenciaValidator — Pure validation functions for absence form steps.
 * No IO, no side effects — fully testable without mocks.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate that a string is a valid YYYY-MM-DD date.
 * @param {string} d
 * @returns {boolean}
 */
function isValidDate(d) {
  if (!DATE_RE.test(d)) return false;
  const parsed = new Date(d + 'T00:00:00');
  return !isNaN(parsed.getTime());
}

/**
 * Validate that a date string is not in the past (relative to today).
 * @param {string} d
 * @returns {boolean}
 */
function isFutureOrToday(d) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(d + 'T00:00:00');
  return date >= today;
}

/**
 * Validate Step 1: duration type and dates.
 * @param {Object} state
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateStep1(state) {
  const errors = [];

  if (!state.duracionTipo) {
    errors.push('Selecciona la duración de la ausencia.');
  }

  if (state.duracionTipo === 'un_dia') {
    if (!state.fechaAusencia) {
      errors.push('La fecha de la ausencia es obligatoria.');
    } else if (!isValidDate(state.fechaAusencia)) {
      errors.push('La fecha ingresada no es válida (usa el formato YYYY-MM-DD).');
    } else if (!isFutureOrToday(state.fechaAusencia)) {
      errors.push('La fecha no puede ser en el pasado.');
    }
  } else if (state.duracionTipo === 'varios_dias') {
    if (!state.fechaInicio) {
      errors.push('La fecha de inicio es obligatoria.');
    } else if (!isValidDate(state.fechaInicio)) {
      errors.push('La fecha de inicio no es válida.');
    } else if (!isFutureOrToday(state.fechaInicio)) {
      errors.push('La fecha de inicio no puede ser en el pasado.');
    }

    if (!state.fechaFin) {
      errors.push('La fecha de fin es obligatoria.');
    } else if (!isValidDate(state.fechaFin)) {
      errors.push('La fecha de fin no es válida.');
    } else if (
      state.fechaInicio &&
      isValidDate(state.fechaInicio) &&
      isValidDate(state.fechaFin) &&
      state.fechaFin < state.fechaInicio
    ) {
      errors.push('La fecha de fin debe ser posterior a la de inicio.');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate Step 2: at least one affected class must be present.
 * @param {Object} state
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateStep2(state) {
  const errors = [];
  if (!state.clasesAfectadas || state.clasesAfectadas.length === 0) {
    errors.push('No hay clases programadas en esa fecha. Revisa la duración.');
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Validate Step 3: each class must have a recovery plan.
 * @param {Object} state
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateStep3(state) {
  const errors = [];
  if (!state.clasesAfectadas || state.clasesAfectadas.length === 0) {
    return { valid: true, errors };
  }

  const incomplete = state.clasesAfectadas.filter((c) => {
    const hasTareas =
      c.recoveryPlan?.tipo === 'tareas' &&
      c.recoveryPlan?.actividadReemplazo?.trim().length > 0;
    const hasReprogramar =
      c.recoveryPlan?.tipo === 'reprogramar' &&
      c.recoveryPlan?.fechaReprograma &&
      c.recoveryPlan?.horaReprograma;
    return !hasTareas && !hasReprogramar;
  });

  if (incomplete.length > 0) {
    errors.push(
      `${incomplete.length} clase(s) sin plan de recuperación. Completa todas las clases.`
    );
  }

  return { valid: errors.length === 0, errors };
}
