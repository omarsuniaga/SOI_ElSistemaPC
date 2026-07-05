export async function obtenerClasesMaestro(maestroId) {
  return [
    { id: 'c1', nombre: 'Violín I', instrumento: 'Violín' },
    { id: 'c2', nombre: 'Teoría Musical', instrumento: 'Teoría' }
  ];
}

export async function obtenerSesionesRango(claseIds, start, end) {
  return [{ clase_id: 'c1' }];
}

export async function obtenerHorariosClases(claseIds) {
  return [
    { clase_id: 'c1', dia: 'lunes' },
    { clase_id: 'c2', dia: 'miércoles' }
  ];
}

export async function obtenerSalonesActivos() {
  return [
    { id: 's1', nombre: 'Salón A', capacidad: 15 },
    { id: 's2', nombre: 'Salón B', capacidad: 10 }
  ];
}

export async function obtenerSesionesOcupadas(fecha, hora) {
  return [{ salon_id: 's2' }];
}

export async function obtenerMaestrosSuplentes(claseId) {
  const suplentes = {
    c1: [{ id: 'm2', nombre_completo: 'Maestra Suplente Violín', tipo_maestro: 'suplente' }],
    c2: [{ id: 'm3', nombre_completo: 'Tutor Teoría Musical', tipo_maestro: 'catedra' }]
  };
  return suplentes[claseId] || [];
}

export async function registrarAusencia(payload) {
  console.log('[Mock] Ausencia registrada:', payload);
  return { ...payload, id: Date.now() };
}

export async function crearNotificacionAusencia({ ausencia, maestro, approvalUrl }) {
  return {
    id: `mock_notif_${Date.now()}`,
    profile_id: 'director-demo',
    tipo: 'sistema',
    titulo: 'Nueva solicitud de ausencia',
    mensaje: `${maestro?.nombre_completo || 'Un maestro'} solicitó ausencia del ${ausencia.fecha_inicio} al ${ausencia.fecha_fin}.`,
    deep_link: approvalUrl || null,
    estado: 'pendiente',
  };
}

export async function obtenerSalonPorId(id) {
  const salones = {
    's1': { nombre: 'Salón A' },
    's2': { nombre: 'Salón B' }
  };
  return salones[id] || { nombre: 'Salón Desconocido' };
}
