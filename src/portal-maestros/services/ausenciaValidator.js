const MAX_REASON_LENGTH = 500;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const VALID_ABSENCE_TYPES = new Set(['enfermedad', 'personal', 'capacitacion', 'vacaciones', 'otro']);
const VALID_URGENCY = new Set(['baja', 'media', 'alta', 'critica']);

function hasValue(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateDateRange(fechaInicio, fechaFin) {
  const errors = {};

  if (!hasValue(fechaInicio)) errors.fechaInicio = 'Indicá la fecha inicial.';
  if (!hasValue(fechaFin)) errors.fechaFin = 'Indicá la fecha final.';

  if (!errors.fechaInicio && !errors.fechaFin && fechaFin < fechaInicio) {
    errors.fechaFin = 'La fecha final no puede ser anterior a la fecha inicial.';
  }

  const valid = Object.keys(errors).length === 0;
  return {
    valid,
    duracionTipo: valid && fechaInicio === fechaFin ? 'un_dia' : 'varios_dias',
    errors,
  };
}

export function validateSupportFile(file) {
  const errors = {};
  if (!file) return { valid: true, errors };

  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    errors.archivo = 'El documento debe ser PDF, JPG o PNG.';
  } else if (file.size > MAX_FILE_SIZE_BYTES) {
    errors.archivo = 'El documento no puede superar 5MB.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAbsenceRequest(formState = {}) {
  const dateResult = validateDateRange(formState.fechaInicio, formState.fechaFin);
  const fileResult = validateSupportFile(formState.archivo?.file || formState.archivo || null);
  const errors = { ...dateResult.errors, ...fileResult.errors };

  if (!VALID_ABSENCE_TYPES.has(formState.tipoAusencia)) {
    errors.tipoAusencia = 'Seleccioná un tipo de ausencia válido.';
  }

  if (!VALID_URGENCY.has(formState.urgencia)) {
    errors.urgencia = 'Seleccioná una urgencia válida.';
  }

  if (!hasValue(formState.motivo)) {
    errors.motivo = 'Explicá el motivo de la ausencia.';
  } else if (formState.motivo.trim().length > MAX_REASON_LENGTH) {
    errors.motivo = `El motivo no puede superar ${MAX_REASON_LENGTH} caracteres.`;
  }

  const selectedClasses = (formState.clasesAfectadas || []).filter((clase) => clase.selected !== false);
  for (const clase of selectedClasses) {
    if (!hasValue(clase.actividadReemplazo)) {
      errors[`actividad_${clase.claseId}`] = 'Indicá la actividad de reemplazo para esta clase.';
    }
  }

  if (formState.claseEmergente?.activo) {
    if (!hasValue(formState.claseEmergente.fechaNueva)) {
      errors.claseEmergenteFecha = 'Indicá la fecha de recuperación.';
    }
    if (!hasValue(formState.claseEmergente.horaNueva)) {
      errors.claseEmergenteHora = 'Indicá la hora de recuperación.';
    }
    if (!hasValue(formState.claseEmergente.salonIdNuevo)) {
      errors.claseEmergenteSalon = 'Seleccioná un salón disponible.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    duracionTipo: dateResult.duracionTipo,
    errors,
  };
}

export const ausenciaValidationConfig = {
  maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
  allowedFileTypes: [...ALLOWED_FILE_TYPES],
  maxReasonLength: MAX_REASON_LENGTH,
};
