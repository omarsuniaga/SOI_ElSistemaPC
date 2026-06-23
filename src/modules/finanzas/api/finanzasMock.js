export async function registrarPago(_payload) {
  return { data: { id: 'mock-uuid' }, error: null }
}

export async function obtenerPagosAlumno(_alumnoId) {
  return { data: [], error: null }
}

export async function obtenerBalanceAlumnos() {
  return { data: { alumnos: [], pagos: [] }, error: null }
}

export async function registrarPagosLote(_pagos) {
  return { data: [], error: null }
}

export async function obtenerCobradoHoy() {
  return { data: 0, error: null }
}
