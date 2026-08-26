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

export async function obtenerPoliticaCobranza() {
  return {
    data: { dia_vencimiento: 10, dias_mora_amarilla: 30, dias_mora_critica: 60, bloqueo_requiere_aprobacion: true },
    error: null,
  }
}
