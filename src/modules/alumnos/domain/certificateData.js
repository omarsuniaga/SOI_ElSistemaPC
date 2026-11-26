/** Datos revisables de una constancia; no confundir ingreso con creación del registro. */
export function certificateToday() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

export function certificateDefaults(alumno, clases = []) {
  const general = new Set(['todos', 'no aplica', 'coro', 'voz', 'canto'])
  const training = [...new Set(clases.map(c => c.instrumento?.trim()).filter(value => value && !general.has(value.toLowerCase())))]
  return {
    nombre_completo: alumno.nombre_completo || '',
    fecha_nacimiento: alumno.fecha_nacimiento?.slice(0, 10) || '',
    nacionalidad: alumno.nacionalidad || '',
    fecha_ingreso: alumno.fecha_ingreso?.slice(0, 10) || '',
    formacion: training.join(', ') || alumno.instrumento_principal ||
      (clases.length ? clases.map(c => c.nombre).filter(Boolean).join(', ') : ''),
    representante_nombre: alumno.representante_nombre || '',
    representante_parentesco: alumno.representante_parentesco || '',
    representante_cedula: alumno.representante_cedula || '',
  }
}

export function validateCertificate(data, type, today = certificateToday()) {
  const errors = {}
  const required = ['nombre_completo', 'fecha_ingreso', 'formacion']
  if (type === 'inscripcion') required.push('representante_nombre', 'representante_parentesco', 'representante_cedula')
  for (const field of required) {
    if (!String(data[field] || '').trim()) errors[field] = 'Completa este dato antes de generar el PDF.'
  }
  for (const field of ['fecha_ingreso', 'fecha_nacimiento']) {
    const value = data[field]
    if (!value) continue
    const parsed = new Date(`${value}T12:00:00Z`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value || value > today) {
      errors[field] = 'Indica una fecha válida que no sea futura.'
    }
  }
  if (!errors.fecha_ingreso && !errors.fecha_nacimiento && data.fecha_nacimiento && data.fecha_ingreso < data.fecha_nacimiento) {
    errors.fecha_ingreso = 'El ingreso no puede ser anterior al nacimiento.'
  }
  for (const field of [...required, 'fecha_nacimiento', 'nacionalidad']) {
    const value = data[field]
    if (typeof value === 'string' && value.length > 200) errors[field] = 'Usa un máximo de 200 caracteres.'
  }
  return errors
}
