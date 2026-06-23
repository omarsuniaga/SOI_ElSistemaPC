// Test fixtures for caja-fundacion domain tests
// Plain JS objects — no Supabase imports

export const familia = {
  id: 'fam-001',
  nombre_familia: 'Familia García',
  activa: true,
  datos_extra: {},
  created_at: '2026-01-01T00:00:00Z',
}

export const representante = {
  id: 'rep-001',
  familia_id: 'fam-001',
  user_id: 'usr-001',
  nombre: 'Carlos García',
  cedula: 'V-12345678',
  telefono_whatsapp: '+58414000001',
  email: 'carlos@example.com',
  relacion: 'padre',
  es_pagador: true,
  autoriza_accesorios_hasta: 500,
  alumno_id: 'alu-001',
  activo: true,
  created_at: '2026-01-01T00:00:00Z',
}

export const alumno = {
  id: 'alu-001',
  familia_id: 'fam-001',
  nombre_completo: 'Pedro García',
  activo: true,
  mora_flag: false,
  bloqueo_certificado: false,
  bloqueo_evento: false,
  abandono_score: 0,
  created_at: '2026-01-01T00:00:00Z',
}

export const cuotaPendiente = {
  id: 'cuota-001',
  familia_id: 'fam-001',
  alumno_id: 'alu-001',
  ciclo_mes: 6,
  ciclo_anio: 2026,
  monto_base: 300,
  monto_final: 300,
  concepto: 'mensualidad',
  estado: 'pendiente',
  fecha_vencimiento: '2026-06-05',
  created_at: '2026-05-25T00:00:00Z',
}

export const cuotaPagada = {
  ...cuotaPendiente,
  id: 'cuota-002',
  estado: 'pagada',
  monto_final: 300,
}

export const cuotaVencida = {
  ...cuotaPendiente,
  id: 'cuota-003',
  estado: 'vencida',
  ciclo_mes: 5,
  ciclo_anio: 2026,
  fecha_vencimiento: '2026-05-05',
}

export const cuotaEnMora = {
  ...cuotaPendiente,
  id: 'cuota-004',
  estado: 'en_mora',
  ciclo_mes: 3,
  ciclo_anio: 2026,
  fecha_vencimiento: '2026-03-05',
}

export const cuotaExonerada = {
  ...cuotaPendiente,
  id: 'cuota-005',
  estado: 'exonerada',
}

export const cuotaBecada = {
  ...cuotaPendiente,
  id: 'cuota-006',
  estado: 'becada',
  monto_final: 150,
}

export const cuotaPrePagada = {
  ...cuotaPendiente,
  id: 'cuota-007',
  estado: 'pre_pagada',
  ciclo_mes: 7,
  ciclo_anio: 2026,
  fecha_vencimiento: '2026-07-05',
}

export const pago = {
  id: 'pago-001',
  familia_id: 'fam-001',
  cuota_ids: ['cuota-001'],
  monto: 300,
  metodo_pago: 'efectivo',
  cajero_id: 'usr-cajero-001',
  notas: 'Pago en caja',
  fecha_pago: '2026-06-10T10:00:00Z',
  created_at: '2026-06-10T10:00:00Z',
}

export const walletMovimiento = {
  id: 'wmov-001',
  familia_id: 'fam-001',
  tipo: 'credito',
  monto: 100,
  origen: 'pago',
  referencia_id: 'pago-001',
  descripcion: 'Pago excedente',
  saldo_resultante: 100,
  created_at: '2026-06-10T10:00:00Z',
}

export const walletConfig = {
  id: 'wcfg-001',
  familia_id: 'fam-001',
  modo: 'mixto',
  saldo_minimo_alerta: 50,
  activo: true,
  created_at: '2026-01-01T00:00:00Z',
}

export const exoneracion = {
  id: 'exon-001',
  cuota_id: 'cuota-001',
  familia_id: 'fam-001',
  tipo: 'parcial',
  porcentaje: 50,
  motivo: 'Situación económica',
  aprobado_por: 'usr-admin-001',
  created_at: '2026-06-01T00:00:00Z',
}

export const beca = {
  id: 'beca-001',
  alumno_id: 'alu-001',
  familia_id: 'fam-001',
  porcentaje: 50,
  motivo: 'Beca de rendimiento',
  aprobado_por: 'usr-admin-001',
  indicador_progreso_minimo: 80,
  activa: true,
  fecha_inicio: '2026-01-01',
  fecha_fin: null,
  created_at: '2026-01-01T00:00:00Z',
}

export const accesorio = {
  id: 'acc-001',
  nombre: 'Instrumento Flauta',
  categoria: 'instrumentos',
  precio_unitario: 200,
  stock_actual: 5,
  stock_minimo: 2,
  activo: true,
  created_at: '2026-01-01T00:00:00Z',
}

export const accesorioAsignacion = {
  id: 'aasig-001',
  accesorio_id: 'acc-001',
  alumno_id: 'alu-001',
  familia_id: 'fam-001',
  cantidad: 1,
  precio_unitario: 200,
  estado: 'pendiente',
  aprobacion_requerida: false,
  created_at: '2026-06-10T00:00:00Z',
}

export const autorizacionAccesorio = {
  id: 'autacc-001',
  representante_id: 'rep-001',
  familia_id: 'fam-001',
  monto_maximo: 500,
  categorias_incluidas: [],
  activa: true,
  created_at: '2026-01-01T00:00:00Z',
}

export const compromisoPago = {
  id: 'comp-001',
  familia_id: 'fam-001',
  representante_id: 'rep-001',
  cuota_id: 'cuota-001',
  fecha_compromiso: '2026-06-20',
  monto_comprometido: 300,
  cumplido: true,
  created_at: '2026-06-15T00:00:00Z',
}

export const scoreCompromiso = {
  id: 'score-001',
  representante_id: 'rep-001',
  familia_id: 'fam-001',
  ciclo_mes: 6,
  ciclo_anio: 2026,
  score_total: 85,
  nivel: 'A',
  detalle: {
    puntualidad: 35,
    consistencia: 20,
    voluntad_pago: 20,
    comportamiento_mora: 10,
    generosidad: 0,
  },
  created_at: '2026-06-22T00:00:00Z',
}

export const patrocinante = {
  id: 'patron-001',
  nombre: 'Empresa XYZ',
  tipo: 'empresa',
  contacto: 'María López',
  email: 'maria@xyz.com',
  activo: true,
  created_at: '2026-01-01T00:00:00Z',
}

export const patrocinio = {
  id: 'patr-001',
  patrocinante_id: 'patron-001',
  alumno_id: 'alu-001',
  familia_id: 'fam-001',
  cubre: 'cuota',
  monto_mensual: 150,
  activo: true,
  fecha_inicio: '2026-01-01',
  fecha_fin: null,
  created_at: '2026-01-01T00:00:00Z',
}

export const notificacion = {
  id: 'notif-001',
  familia_id: 'fam-001',
  representante_id: 'rep-001',
  alumno_id: 'alu-001',
  tipo: 'mora_recordatorio',
  canal: 'ambos',
  prioridad: 'baja',
  titulo: 'Recordatorio de mora',
  cuerpo: 'Tiene una cuota pendiente.',
  datos_extra: {},
  fecha_programada: null,
  estado_whatsapp: 'pendiente',
  estado_portal: 'no_leida',
  created_at: '2026-06-22T00:00:00Z',
}

export const tarea = {
  id: 'tarea-001',
  titulo: 'Contactar a familia García',
  tipo: 'seguimiento_pago',
  asignado_a: 'usr-cajero-001',
  familia_id: 'fam-001',
  alumno_id: 'alu-001',
  prioridad: 'media',
  estado: 'pendiente',
  fecha_vencimiento: '2026-06-30',
  recurrente: false,
  patron_recurrencia: null,
  created_at: '2026-06-22T00:00:00Z',
}

export const minuta = {
  id: 'minuta-001',
  titulo: 'Reunión de caja junio 2026',
  fecha_reunion: '2026-06-22',
  participantes: ['usr-cajero-001', 'usr-admin-001'],
  puntos_tratados: ['Estado de morosidad', 'Becas activas'],
  acuerdos: ['Contactar familias en mora'],
  responsables: ['usr-cajero-001'],
  visibilidad: 'cajero',
  creado_por: 'usr-admin-001',
  created_at: '2026-06-22T00:00:00Z',
}

export const mensaje = {
  id: 'msg-001',
  hilo_id: 'hilo-001',
  autor_id: 'usr-cajero-001',
  rol_autor: 'cajero',
  contenido: 'La familia García pagó su cuota.',
  tipo: 'texto',
  departamento_destino: ['caja', 'admin'],
  leido_por: {},
  created_at: '2026-06-22T00:00:00Z',
}

export const campana = {
  id: 'camp-001',
  nombre: 'Campaña Junio 2026',
  descripcion: 'Recuperación de mora del mes de junio',
  incentivo: 'Descuento del 10% en accesorios',
  fecha_inicio: '2026-06-01',
  fecha_fin: '2026-06-30',
  activa: true,
  creado_por: 'usr-admin-001',
  created_at: '2026-06-01T00:00:00Z',
}
